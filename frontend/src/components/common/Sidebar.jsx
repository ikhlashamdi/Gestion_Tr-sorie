import React, { useRef, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppStore } from '../../store/appStore.js';
import {
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutList,
  FileText,
  Users,
  Landmark,
  Banknote,
  User,
  Truck,
  Building2,
} from 'lucide-react';
import { getCookie, setCookie } from '../../utils/cookieSetterAndGetter';

const Sidebar = () => {
  const dopen = useAppStore((state) => state.dopen);
  const updateDopen = useAppStore((state) => state.updateOpen);
  const sidebarRef = useRef(null);
  const location = useLocation();

  const [ficheBaseOpen, setFicheBaseOpen] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(getSidebarWidth());

  function getSidebarWidth() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return dopen ? '100vw' : '64px';
    }
    return dopen ? 'min(max(20vw, 175px), 275px)' : '64px';
  }

  useEffect(() => {
    function handleResize() {
      setSidebarWidth(getSidebarWidth());
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dopen]);

  useEffect(() => {
    const cookieVal = getCookie('dopen');
    if (cookieVal === 'false' && dopen !== false) updateDopen(false);
    if (cookieVal === 'true' && dopen !== true) updateDopen(true);
  }, []);

  useEffect(() => {
    setCookie('dopen', dopen);
  }, [dopen]);

  // Garder le sous-menu "Fiche de base" ouvert uniquement si on est sur l'une de ses routes
  useEffect(() => {
    const ficheBaseRoutes = [
      '/caisse',
      '/nature-charge',
      '/tier',
      '/clients',
      '/fournisseur',
      '/personnel',
      '/vehicule',
      '/banque',
    ];

    const isInFicheBase = ficheBaseRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    setFicheBaseOpen(isInFicheBase);
  }, [location.pathname]);

  return (
    <aside
      ref={sidebarRef}
      className="h-100vh flex flex-col"
      style={{
        width: sidebarWidth,
        background: 'var(--sidebar-bg)',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        boxShadow: 'var(--nav-shadow)',
      }}
    >
      <div className="flex items-center justify-end px-4" style={{ height: 'var(--glob-spacing)' }}>
        <button
          onClick={() => updateDopen(!dopen)}
          className="p-2 rounded-[var(--border-radius-icon)] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer hover:bg-[var(--gray-200)] transition-colors"
          style={{ color: 'var(--gray-600)' }}
          aria-label={dopen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {dopen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <SidebarLink to="/home" icon={<Home size={24} />} label="Dashboard" dopen={dopen} />

        <div>
          <button
            onClick={() => setFicheBaseOpen(!ficheBaseOpen)}
            className={`w-full flex items-center py-3 px-2.5 rounded-md text-[1.125rem] font-medium cursor-pointer transition-colors duration-200
              ${dopen ? 'justify-between' : 'justify-center'}
              text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]`}
            style={{ userSelect: 'none' }}
          >
            <span className="flex items-center">
              <LayoutList className="w-6 h-6" style={{ color: 'var(--gray-700)' }} />
              {dopen && <span className="ml-3">Fiche de base</span>}
            </span>
            {dopen && (ficheBaseOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
          </button>

          {ficheBaseOpen && dopen && (
            <div className="pl-10 space-y-1 mt-1">
              <SubLink to="/caisse" label="Caisse" icon={<Banknote size={18} />} />
              <SubLink to="/nature-charge" label="Nature de charge" icon={<FileText size={18} />} />
              <SubLink to="/tier" label="Tier" icon={<Users size={18} />} />
              <SubLink to="/clients" label="Client" icon={<User size={18} />} />
              <SubLink to="/fournisseurs" label="Fournisseur" icon={<Building2 size={18} />} />
              <SubLink to="/personnel" label="Personnel" icon={<Users size={18} />} />
              <SubLink to="/vehicule" label="Véhicule" icon={<Truck size={18} />} />
              <SubLink to="/banque" label="Banque" icon={<Landmark size={18} />} />
            </div>
          )}
        </div>

        <SidebarLink to="/mvt-caisse" icon={<Banknote size={24} />} label="Mvt de caisse" dopen={dopen} />
        <SidebarLink to="/journal-caisse" icon={<FileText size={24} />} label="Journal de caisse" dopen={dopen} />
      </nav>
    </aside>
  );
};

function SidebarLink({ to, icon, label, dopen }) {
  return (
    <NavLink
      to={to}
      style={{ userSelect: 'none' }}
      className={({ isActive }) =>
        `flex items-center py-3 px-2.5 rounded-md text-[1.125rem] font-medium cursor-pointer transition-colors duration-200
        ${dopen ? 'justify-start' : 'justify-center'}
        ${isActive ? 'bg-[var(--sidebar-active)] text-[var(--primary)]' : 'text-[var(--sidebar-text)]'}
        hover:bg-[var(--sidebar-hover)]`
      }
    >
      {({ isActive }) => {
        const iconWithColor = React.cloneElement(icon, {
          className: "sidebar-icon w-6 h-6 transition-colors duration-200",
          style: { color: isActive ? 'var(--primary)' : 'var(--gray-600)' }
        });
        return (
          <>
            <span className={`flex-shrink-0 ${dopen ? 'mr-3' : 'mx-auto'}`}>{iconWithColor}</span>
            <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ease-in-out ${dopen ? 'opacity-100' : 'opacity-0'} ${!dopen ? 'hidden' : 'inline'}`}>{label}</span>
          </>
        );
      }}
    </NavLink>
  );
}

function SubLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 py-2 px-2 rounded text-[1rem] transition-colors
         ${isActive ? 'bg-[var(--sidebar-active)] text-[var(--primary)]' : 'text-[var(--sidebar-text)]'}
         hover:bg-[var(--sidebar-hover)]`
      }
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default Sidebar;
