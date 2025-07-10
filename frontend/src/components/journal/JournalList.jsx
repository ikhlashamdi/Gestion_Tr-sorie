import React, { useEffect, useState } from "react";
import axios from "axios";
import JournalModal from "./journalModal.jsx.jsx";
import JournalTable from "./JournalTable.jsx";

export default function JournalList() {
    const [journals, setJournals] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null);

    const fetchJournals = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/journals");
            setJournals(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des journaux :", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce journal ?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/journals/${id}`);
            fetchJournals();
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    const handleEdit = (journal) => {
        setSelectedJournal(journal);
        setOpenModal(true);
    };

    const handleAdd = () => {
        setSelectedJournal(null);
        setOpenModal(true);
    };

    const handleModalSubmit = async (form) => {
        try {
            if (selectedJournal) {
                await axios.put(`http://localhost:5000/api/journals/${selectedJournal._id}`, form);
            } else {
                await axios.post("http://localhost:5000/api/journals", form);
            }
            fetchJournals();
            setOpenModal(false);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement :", error);
        }
    };

    useEffect(() => {
        fetchJournals();
    }, []);

    return (
        <div className="max-w-4xl mx-auto mt-10 px-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Liste des Journaux</h1>
                <button
                    onClick={handleAdd}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-light transition"
                >
                    + Ajouter un Journal
                </button>
            </div>
            <JournalTable journals={journals} onEdit={handleEdit} onDelete={handleDelete} />
            <JournalModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSubmit={handleModalSubmit}
                journal={selectedJournal}
            />
        </div>
    );
}