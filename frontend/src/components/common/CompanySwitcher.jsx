import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Briefcase } from 'lucide-react';
import axios from 'axios';


export default function CompanySwitcher({ token }) {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (selectedCompany) {
            localStorage.setItem('selectedCompanyId', selectedCompany._id);
        }
    }, [selectedCompany]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!token) {
                console.warn("No token found. Cannot fetch companies.");
                return;
            }

            try {
                const { data } = await axios.get('http://localhost:5000/api/companies', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setCompanies([
                    { _id: "all", name: "Toutes les sociétés" }, 
                    ...data
                ]);
                const savedCompanyId = localStorage.getItem('selectedCompanyId');
                const initialCompany = data.find(c => c._id === savedCompanyId) || data[0];
                setSelectedCompany(initialCompany || null);
            } catch (error) {
                console.error("Failed to load companies:", error);
                setCompanies([
                    { _id: '1', name: 'Société A (Default)' },
                    { _id: '2', name: 'Société B (Default)' },
                    { _id: '3', name: 'Société C (Default)' },
                    { _id: "all", name: "Toutes les sociétés" },
                ]);
            }
        };
        fetchCompanies();
    }, [token]);

    useEffect(() => {
        const storedCompanyId = localStorage.getItem("selectedCompanyId");
        if (!storedCompanyId && companies.length > 0) {
            const defaultCompany = { _id: "all", name: "Toutes les sociétés" };
            localStorage.setItem("selectedCompanyId", defaultCompany._id);
            setSelectedCompany(defaultCompany);
            window.dispatchEvent(new Event("companyChanged"));
        }
    }, [companies]);

    const handleSelectCompany = (company) => {
        setSelectedCompany(company);
        setIsOpen(false);
        localStorage.setItem("selectedCompanyId", company._id);
        window.dispatchEvent(new Event("companyChanged"));
    };

    return (
        <div className="relative font-sans" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-5 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded-xl shadow-md transition-all duration-300 ease-in-out hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
                <Briefcase size={18} className="text-purple-600" />
                <span className="text-gray-900">{selectedCompany ? selectedCompany.name : 'Select Company'}</span>
                <ChevronDown size={18} className={`ml-2 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-64 mt-2 origin-top-left bg-white border border-gray-200 rounded-xl shadow-2xl z-50 animate-fade-in">
                    <div className="py-2">
                        {companies.map(company => (
                            <button
                                key={company._id}
                                onClick={() => handleSelectCompany(company)}
                                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out ${
                                    selectedCompany?._id === company._id
                                      ? "text-purple-600 bg-purple-50"
                                      : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {company.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}