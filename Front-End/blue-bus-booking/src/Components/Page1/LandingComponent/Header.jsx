import React, { useState } from 'react';
import logo from '../../../assets/logo.png';
import { Menu, X, LogIn, UserPlus, User, LogOut, Ticket, ChevronDown, Bus, Sparkles } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const userImage = localStorage.getItem('userImage');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src={logo} alt="Blue Bus Logo" className="h-14 w-auto object-contain" />
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {token ? (
              <>
                <button 
                  onClick={() => navigate('/smart-search')}
                  className="text-blue-600 text-[14px] font-black hover:text-blue-700 transition-colors duration-200 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50/50 hover:bg-blue-100/50"
                >
                  <Sparkles size={16} className="animate-pulse" /> AI Search
                </button>

                <button 
                  onClick={() => navigate('/operators')}
                  className="text-gray-600 text-[14px] font-semibold hover:text-blue-600 transition-colors duration-200 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Bus size={16} /> Operators
                </button>

                {/* Profile Hover Dropdown */}
                <div 
                  className="relative"
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <button className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all duration-200 shadow-sm overflow-hidden">
                    {userImage ? (
                      <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full pt-2 w-64 z-[60] animate-in fade-in zoom-in-95 duration-200">
                      <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-600 text-white text-xs font-bold shadow-sm">
                              {userImage ? (
                                <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                              ) : userName.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-sm font-bold text-gray-800 truncate">{userName}</p>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium truncate ml-11">{userEmail}</p>
                        </div>
                        <div className="p-2">
                          <button 
                            onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 text-[13px] font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                          >
                            <User size={16} /> My Profile
                          </button>
                          <button 
                            onClick={() => { setProfileOpen(false); navigate('/bookings'); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 text-[13px] font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                          >
                            <Ticket size={16} /> My Bookings
                          </button>
                          <div className="h-px bg-gray-100 my-2 mx-2"></div>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 text-[13px] font-bold hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-5 py-2 text-blue-600 text-[14px] font-semibold border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-all duration-200"
                >
                  <LogIn size={15} />
                  Log In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-[14px] font-semibold rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md"
                >
                  <UserPlus size={15} />
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-4">
            {token && (
              <button 
                onClick={() => { setMenuOpen(false); navigate('/bookings'); }}
                className="text-gray-700 font-medium hover:text-blue-600 text-left transition-colors duration-200 flex items-center gap-2"
              >
                <Ticket size={18} /> My Bookings
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header
