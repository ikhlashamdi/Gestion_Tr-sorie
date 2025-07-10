import React, { useRef, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAppStore } from '../../store/appStore.js';
import { Menu, ChevronLeft, Home, FileText, Banknote, Settings } from 'lucide-react';
import { getCookie, setCookie } from '../../utils/cookieSetterAndGetter';

const Sidebar = () => {
  const dopen = useAppStore((state) => state.dopen);
  const updateDopen = useAppStore((state) => state.updateOpen);
  const sidebarRef = useRef(null);

  // Store sidebar width in state
  const [sidebarWidth, setSidebarWidth] = useState(getSidebarWidth());

  function getSidebarWidth() {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return dopen ? '100vw' : '64px';
    }
    return dopen ? 'min(max(20vw, 175px), 275px)' : '64px';
  }

  // Update sidebar width on dopen or window resize
  useEffect(() => {
    function handleResize() {
      setSidebarWidth(getSidebarWidth());
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dopen]);

  // Sync dopen with cookie on mount and when dopen changes
  useEffect(() => {
    const cookieVal = getCookie('dopen');
    if (cookieVal === 'false' && dopen !== false) updateDopen(false);
    if (cookieVal === 'true' && dopen !== true) updateDopen(true);
  }, []);
  useEffect(() => {
    setCookie('dopen', dopen);
  }, [dopen]);

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
      {/* Sidebar Header with burger icon */}
      <div className="flex items-center justify-end px-4" style={{ height: 'var(--glob-spacing)' }}>
        <button
          onClick={() => updateDopen(!dopen)}
          className="p-2 rounded-[var(--border-radius-icon)] focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer hover:bg-[var(--gray-200)] transition-colors"
          style={{ color: 'var(--gray-600)' }}
          aria-label={dopen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {dopen ? (
            <ChevronLeft className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <SidebarLink to="/home" icon={<Home size={24} />} label="Home" dopen={dopen} />
        <SidebarLink to="/journaux" icon={<FileText size={24} />} label="Journal" dopen={dopen} />
        <SidebarLink to="/compte" icon={<Banknote size={24} />} label="Comptes" dopen={dopen} />
        <SidebarLink to="/settings" icon={<Settings size={24} />} label="Settings" dopen={dopen} />
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
        `flex items-center py-3 px-2.5 rounded-md text-[1.25rem] font-medium cursor-pointer transition-colors duration-200
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
            <span className={`ml-3 transition-opacity duration-200 ease-in-out ${dopen ? 'opacity-100' : 'opacity-0'} ${!dopen ? 'hidden' : 'inline'}`}>{label}</span>
          </>
        );
      }}
    </NavLink>
  );
}

export default Sidebar;