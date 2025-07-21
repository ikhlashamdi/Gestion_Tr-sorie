import React, { useState, useEffect } from "react";
import axios from "axios";

import NatureChargeTable from "./NatureDeCharge/NatureChargeTable.jsx";
import ClientTable from "./Client/ClientTable.jsx";
import FournisseurTable from "./Fournisseur/FournisseurTable.jsx";
import BanqueTable from "./Banque/BanqueTable.jsx";
import VehiculeTable from "./Vehicule/VehiculeTable.jsx";
import TierTable from "./Tier/TierTable.jsx";
import PersonnelTable from "./Personnel/PersonnelTable.jsx";
import CaisseTable from "./Caisse/CaisseTable.jsx";

export default function MouvementCaissePage() {
  const [activeTierTab, setActiveTierTab] = useState("client");

  const [natureCharges, setNatureCharges] = useState([]);
  const [clients, setClients] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [banques, setBanques] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [caisses, setCaisses] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/nature-charges")
      .then(res => setNatureCharges(res.data))
      .catch(err => console.error("Erreur natureCharges", err));

    axios.get("http://localhost:5000/api/clients")
      .then(res => setClients(res.data))
      .catch(err => console.error("Erreur clients", err));

    axios.get("http://localhost:5000/api/fournisseurs")
      .then(res => setFournisseurs(res.data))
      .catch(err => console.error("Erreur fournisseurs", err));

    axios.get("http://localhost:5000/api/banques")
      .then(res => setBanques(res.data))
      .catch(err => console.error("Erreur banques", err));

    axios.get("http://localhost:5000/api/vehicules")
      .then(res => setVehicules(res.data))
      .catch(err => console.error("Erreur vehicules", err));

    axios.get("http://localhost:5000/api/tiers")
      .then(res => setTiers(res.data))
      .catch(err => console.error("Erreur tiers", err));

    axios.get("http://localhost:5000/api/personnels")
      .then(res => setPersonnels(res.data))
      .catch(err => console.error("Erreur personnels", err));

    axios.get("http://localhost:5000/api/caisses")
      .then(res => setCaisses(res.data))
      .catch(err => console.error("Erreur caisses", err));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Zone Nature de charge */}
      <section>
        <h2 className="text-xl font-bold mb-4">Nature de charge</h2>
        <NatureChargeTable
          showHeader={false}
          natureCharges={natureCharges}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={() => {}}
          onSearch={() => {}}
        />
      </section>

      {/* Zone Tiers avec sous-onglets */}
      <section>
        <h2 className="text-xl font-bold mb-4">Tiers</h2>
        <div className="flex space-x-4 border-b mb-6">
          {["client", "fournisseur", "banque", "vehicule", "tier", "personnel"].map(tierType => (
            <button
              key={tierType}
              className={`pb-2 border-b-4 font-semibold ${
                activeTierTab === tierType
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-gray-600 hover:text-[var(--primary)]"
              }`}
              onClick={() => setActiveTierTab(tierType)}
            >
              {tierType.charAt(0).toUpperCase() + tierType.slice(1)}
            </button>
          ))}
        </div>

        <div>
          {activeTierTab === "client" && (
            <ClientTable
              showHeader={false}
              clients={clients}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
              onSearch={() => {}}
            />
          )}
          {activeTierTab === "fournisseur" && (
            <FournisseurTable
              showHeader={false}
              fournisseurs={fournisseurs}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
              onSearch={() => {}}
            />
          )}
          {activeTierTab === "banque" && (
            <BanqueTable
              showHeader={false}
              banques={banques}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
              onSearch={() => {}}
            />
          )}
          {activeTierTab === "vehicule" && (
            <VehiculeTable
              showHeader={false}
              vehicules={vehicules}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
              onSearch={() => {}}
            />
          )}
          {activeTierTab === "tier" && (
            <TierTable
              showHeader={false}
              tiers={tiers}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
              onSearch={() => {}}
            />
          )}
          {activeTierTab === "personnel" && (
            <PersonnelTable
              showHeader={false}
              personnels={personnels}
              onEdit={() => {}}
              onDelete={() => {}}
              onAdd={() => {}}
              onSearch={() => {}}
            />
          )}
        </div>
      </section>

      {/* Zone Caisses */}
      <section>
        <h2 className="text-xl font-bold mb-4">Caisses</h2>
        <CaisseTable
          showHeader={false}
          caisses={caisses}
          onEdit={() => {}}
          onDelete={() => {}}
          onAdd={() => {}}
          onSearch={() => {}}
        />
      </section>
    </div>
  );
}
