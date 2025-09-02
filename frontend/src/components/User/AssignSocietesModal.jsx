import React, { useEffect, useState } from 'react';
import { Search, Briefcase } from 'lucide-react';
import api from '../../api';
import { handleError, handleSuccess } from '../../utils/toastUtils';

const AssignSocietesModal = ({ isOpen, onClose, user, onAssignSuccess }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    // NOUVEAU: État pour la sélection globale
    const [isAllSelected, setIsAllSelected] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchCompanies = async () => {
                try {
                    const { data } = await api.get('/companies');
                    setCompanies(data);
                    // Pre-select the user's current company if it exists
                    if (user && user.societes && user.societes.length > 0) {
                        const initialSelected = user.societes.map(s => s._id);
                        setSelectedCompanies(initialSelected);
                        // Vérifier si toutes les sociétés sont initialement sélectionnées
                        setIsAllSelected(initialSelected.length === data.length);
                    } else {
                        setSelectedCompanies([]);
                        setIsAllSelected(false);
                    }

                } catch (error) {
                    handleError("Erreur lors du chargement des sociétés.");
                }
            };
            fetchCompanies();
        }
    }, [isOpen, user]);

    // Mettre à jour l'état "tout sélectionner" lorsque les sélections changent
    useEffect(() => {
        setIsAllSelected(selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0);
    }, [selectedCompanies, searchQuery]);


    const handleCheckboxChange = (companyId) => {
        let newSelectedCompanies;
        if (selectedCompanies.includes(companyId)) {
            newSelectedCompanies = selectedCompanies.filter(id => id !== companyId);
        } else {
            newSelectedCompanies = [...selectedCompanies, companyId];
        }
        setSelectedCompanies(newSelectedCompanies);
    };

    // NOUVEAU: Fonction pour gérer la sélection de tout
    const handleSelectAllChange = () => {
        if (isAllSelected) {
            setSelectedCompanies([]);
        } else {
            const allFilteredIds = filteredCompanies.map(c => c._id);
            setSelectedCompanies(allFilteredIds);
        }
    };


    const handleAssign = async () => {
        setLoading(true);
        try {
            await api.put(`/users/${user._id}`, { societes: selectedCompanies });
            handleSuccess(`Sociétés affectées avec succès !`);
            onAssignSuccess();
            onClose();
        } catch (error) {
            handleError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };


    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative p-8 bg-white w-96 max-w-lg rounded-xl shadow-xl transform transition-all duration-300 scale-95 md:scale-100">
<h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
  {`Affecter ${user?.name || ''} à`}
</h3>
                <div className="relative mb-4">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Rechercher une société"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {filteredCompanies.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">Aucune société trouvée.</p>
                    ) : (
                        <div className="space-y-2">
                            {/* NOUVEAU: Checkbox "Tout sélectionner" */}
                            <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors border-b border-gray-200">
                                <input
                                    type="checkbox"
                                    id="select-all"
                                    checked={isAllSelected}
                                    onChange={handleSelectAllChange}
                                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="select-all" className="text-gray-800 font-bold flex-1 cursor-pointer">
                                    Tout sélectionner
                                </label>
                            </div>
                            {/* Liste des sociétés */}
                            {filteredCompanies.map(company => (
                                <div key={company._id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        id={`company-${company._id}`}
                                        checked={selectedCompanies.includes(company._id)}
                                        onChange={() => handleCheckboxChange(company._id)}
                                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor={`company-${company._id}`} className="text-gray-800 font-medium flex-1 cursor-pointer">
                                        {company.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || selectedCompanies.length === 0}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        {loading ? 'Affectation...' : 'Valider'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignSocietesModal;
