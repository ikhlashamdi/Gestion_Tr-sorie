import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, UserCircle, Mail, Bell, MoreVertical, LogOut, User, X } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import CompanySwitcher from './CompanySwitcher';

// Initialisation de la connexion Socket.IO en dehors du composant
const socket = io('http://localhost:5000'); // Adaptez l'URL à votre backend

const Navbar = () => {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState(null); // Nouvel état pour l'objet utilisateur

    const profileMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);
    const mobileButtonRef = useRef(null);
    const mobileSearchInputRef = useRef(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target) &&
                profileButtonRef.current &&
                !profileButtonRef.current.contains(event.target)
            ) {
                setProfileMenuOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                mobileButtonRef.current &&
                !mobileButtonRef.current.contains(event.target)
            ) {
                setMobileMenuOpen(false);
            }
            if (
                searchExpanded &&
                mobileSearchInputRef.current &&
                !mobileSearchInputRef.current.closest('.mobile-search-overlay')?.contains(event.target)
            ) {
                setSearchExpanded(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchExpanded]);

    useEffect(() => {
        if (searchExpanded && mobileSearchInputRef.current) {
            mobileSearchInputRef.current.focus();
        }
    }, [searchExpanded]);

    // Fetches user info and profile image when the token exists
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Met à jour l'état de l'utilisateur avec les données complètes
                setUser(res.data);
                // Met à jour l'image de profil
                if (res.data.profileImage) {
                    setProfileImage(`http://localhost:5000/uploads/${res.data.profileImage}`);
                }
            } catch (err) {
                console.error("Erreur de récupération des informations utilisateur :", err);
            }
        };

        if (token) {
            fetchUserInfo();
        }
    }, [token]);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/notifications/count", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error("Erreur de récupération du nombre de notifications :", err);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        if (token && user) {
            fetchUnreadCount();

            if (user._id) {
                socket.emit('joinRoom', user._id);
            }

            socket.on('notifications_updated', () => {
                console.log("Événement 'notifications_updated' reçu. Mise à jour du compteur.");
                fetchUnreadCount();
            });

            return () => {
                socket.off('notifications_updated');
            };
        }
    }, [token, user]); // Le hook se déclenche quand le token ou l'utilisateur change

    const handleProfileMenuToggle = () => {
        setProfileMenuOpen((prev) => !prev);
        setMobileMenuOpen(false);
        setSearchExpanded(false);
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen((prev) => !prev);
        setProfileMenuOpen(false);
        setSearchExpanded(false);
    };

    const handleMobileSearchExpand = () => {
        setSearchExpanded(true);
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem('user');
        navigate("/login", { replace: true });
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
    };

    const handleSearchChange = () => {};

    const handleBellClick = () => {
        navigate('/notifications');
        setMobileMenuOpen(false);
    };

    const renderProfileMenu = (
        <div
            ref={profileMenuRef}
            className={`absolute top-[calc(100%+8px)] right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ${profileMenuOpen ? 'block' : 'hidden'}`}
        >
            <Link to="/profile" className="flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={() => setProfileMenuOpen(false)}>
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

    const renderProfileButton = (
        <button
            ref={profileButtonRef}
            onClick={handleProfileMenuToggle}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
            aria-label="account of current user"
        >
            {profileImage ? (
                <img
                    src={profileImage}
                    alt="Profil"
                    className="w-9 h-9 rounded-full object-cover border-primary"
                />
            ) : (
                <UserCircle className="w-6 h-6 text-primary" />
            )}
        </button>
    );

    return (
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between h-16 px-4 bg-white text-dark-gray shadow-md">
            {/* Logo */}
            <div className={`flex ml-2 items-center transition-all duration-300 ${searchExpanded ? 'hidden' : 'flex'} md:flex`}>
                <Link to="/" className="text-xl font-semibold primary-cl-cl">
                    CAISSE
                </Link>
            </div>

            {/* Search */}
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

            {/* Mobile Search Button */}
            {!searchExpanded && (
                <div className="flex-grow flex justify-end items-center md:hidden">
                    <button
                        onClick={handleMobileSearchExpand}
                        className="p-2 hover:bg-gray-100 rounded"
                        aria-label="expand search"
                    >
                        <Search className="w-6 h-6 text-gray-800" />
                    </button>
                </div>
            )}

            {/* Right Icons */}
            <div className={`flex items-center space-x-1 ${searchExpanded ? 'hidden' : 'flex'} md:flex`}>
                <div className="hidden md:flex items-center space-x-1">
                    {/* Vérifie si l'objet user existe avant de rendre le CompanySwitcher */}
                    {user && <CompanySwitcher token={token} user={user} />}
                    <button className="p-2 hover:bg-gray-100 rounded relative">
                        <Mail className="w-6 h-6" />
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">4</span>
                    </button>
                    <button onClick={handleBellClick} className="p-2 hover:bg-gray-100 rounded relative">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    </button>
                    <div className="relative">{renderProfileButton}{renderProfileMenu}</div>
                </div>

                {/* Mobile More Button */}
                <div className="flex md:hidden items-center relative">
                    <button
                        ref={mobileButtonRef}
                        onClick={handleMobileMenuToggle}
                        className="p-2 hover:bg-gray-100 rounded"
                        aria-label="show more"
                    >
                        <MoreVertical className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile search expanded */}
            {searchExpanded && (
                <div className="mobile-search-overlay fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center px-4 md:hidden">
                    <button
                        onClick={() => setSearchExpanded(false)}
                        className="p-2 hover:bg-gray-100 rounded mr-2 text-gray-800"
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
                            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none"
                            aria-label="search"
                        />
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
