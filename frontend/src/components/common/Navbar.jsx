import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, UserCircle, Mail, Bell, MoreVertical, LogOut, User, X } from 'lucide-react';

const Navbar = () => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const profileMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);
    const mobileButtonRef = useRef(null);
    const mobileSearchInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target) &&
            profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
            setProfileMenuOpen(false);
        }
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
            mobileButtonRef.current && !mobileButtonRef.current.contains(event.target)) {
            setMobileMenuOpen(false);
        }
        if (searchExpanded && mobileSearchInputRef.current && !mobileSearchInputRef.current.closest('.mobile-search-overlay').contains(event.target)) {
            setSearchExpanded(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchExpanded]);

    useEffect(() => {
        if (searchExpanded && mobileSearchInputRef.current) {
        mobileSearchInputRef.current.focus();
        }
    }, [searchExpanded]);

    const handleProfileMenuToggle = () => {
        setProfileMenuOpen(prev => !prev);
        setMobileMenuOpen(false);
        setSearchExpanded(false);
    };
    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(prev => !prev);
        setProfileMenuOpen(false);
        setSearchExpanded(false);
    };
    const handleMobileSearchExpand = () => {
        setSearchExpanded(true);
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
    };
    const handleMenuClose = () => {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
        setSearchExpanded(false);
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        handleMenuClose();
    };
    const handleSearchChange = (event) => {
        // TODO: Implement search functionality
    };

    const renderProfileMenu = (
        <div
        ref={profileMenuRef}
        className={`absolute top-[calc(100%+8px)] right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ${profileMenuOpen ? 'block' : 'hidden'}`}
        >
        <Link to="/profile" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleMenuClose}>
            <User size={18} className="mr-2" /> Profile
        </Link>
        <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
        >
            <LogOut size={18} className="mr-2" /> Logout
        </button>
        </div>
    );

    const renderMobileMenu = (
        <div
            ref={mobileMenuRef}
            className={`absolute top-[calc(100%+2px)] right-4 mt-4 w-auto min-w-[180px] max-w-[calc(100vw-2rem)] bg-white rounded-md shadow-lg py-1 z-50 ${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}
        >
            <Link to="/messages" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleMenuClose}>
                <Mail size={20} className="mr-3" /> Messages
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">4</span>
            </Link>
            <Link to="/notifications" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleMenuClose}>
                <Bell size={20} className="mr-3" /> Notifications
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">17</span>
            </Link>
            <Link to="/profile" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={handleMenuClose}>
                <User size={18} className="mr-2" /> Profile
            </Link>
            <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
            >
                <LogOut size={18} className="mr-2" /> Logout
            </button>
        </div>
    );

    return (
<nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between h-16 px-4 bg-white text-dark-gray shadow-md">
            {/* App Title */}
            <div className={`flex ml-2 items-center transition-all duration-300 ${searchExpanded ? 'hidden' : 'flex'} md:flex`}>
                <Link to="/" className="text-xl font-semibold primary-cl-cl">
                COMPTA
                </Link>
            </div>
            {/* Desktop Search Bar (always visible on md and larger screens) */}
            <div className="relative flex-grow mx-4 max-w-md hidden md:flex items-center">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher..."
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 rounded-md"
                    style={{ background: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}
                    aria-label="search"
                />
            </div>
            {/* Mobile Search Icon (visible only on small screens when search is NOT expanded) */}
            {!searchExpanded && (
                <div className="flex-grow flex justify-end items-center md:hidden">
                    <button
                        onClick={handleMobileSearchExpand}
                        className="p-2 rounded-[var(--border-radius-icon)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                        aria-label="expand search"
                    >
                        <Search className="w-6 h-6 text-gray-800" />
                    </button>
                </div>
            )}
            {/* Hide this section on mobile if search is expanded */}
            <div className={`flex items-center space-x-1 transition-all duration-300 ${searchExpanded ? 'hidden' : 'flex'} md:flex`}>
                {/* Desktop Icons */}
                <div className="hidden md:flex items-center space-x-1">
                <button className="p-2 rounded-[var(--border-radius-icon)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 relative cursor-pointer">
                    <Mail className="w-6 h-6" />
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">4</span>
                </button>
                <button className="p-2 rounded-[var(--border-radius-icon)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 relative cursor-pointer">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">17</span>
                </button>
                <div className="relative">
                    <button
                    ref={profileButtonRef}
                    onClick={handleProfileMenuToggle}
                    className="p-2 rounded-[var(--border-radius-icon)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                    aria-label="account of current user"
                    aria-haspopup="true"
                    >
                    <UserCircle className="w-6 h-6 text-primary" />
                    </button>
                    {renderProfileMenu}
                </div>
                </div>
                {/* Mobile "More" icon */}
                <div className="flex md:hidden items-center relative">
                <button
                    ref={mobileButtonRef}
                    onClick={handleMobileMenuToggle}
                    className="p-2 rounded-[var(--border-radius-icon)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                    aria-label="show more"
                    aria-haspopup="true"
                >
                    <MoreVertical className="w-6 h-6" />
                </button>
                {renderMobileMenu}
                </div>
            </div>
            {searchExpanded && (
                <div className="mobile-search-overlay fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center px-4 md:hidden">
                <button
                    onClick={() => setSearchExpanded(false)}
                    className="p-2 rounded-[var(--border-radius-icon)] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2 text-gray-800 cursor-pointer"
                    aria-label="close search"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Rechercher…"
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                    aria-label="search"
                    />
                </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;