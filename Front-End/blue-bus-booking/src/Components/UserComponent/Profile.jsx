import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, LogOut, ShieldCheck, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import SeatPreference from '../AI Chat/SeatPreference';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('token');
      
      if (!email || !token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/auth/user-email/${email}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setUserData(response.data.data);
        } else {
          setError('Failed to load profile.');
        }
      } catch (err) {
        console.error(err);
        setError('Session expired or error fetching profile.');
        // Optionally auto-logout on 401/403
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-6 text-center">
        <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
        <button onClick={handleLogout} className="text-blue-600 hover:underline">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium text-sm group"
        >
          <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden border border-gray-100/50 backdrop-blur-sm">
          
          {/* Header Banner */}
          <div className="h-40 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="px-6 sm:px-12 pb-12 relative">
            {/* Avatar & Verification */}
            <div className="absolute -top-20 left-6 sm:left-12">
              <div className="relative group">
                <div className="w-40 h-40 bg-white rounded-[2.5rem] p-2 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-[2rem] flex items-center justify-center overflow-hidden border border-gray-100">
                    {userData?.image ? (
                      <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-blue-600/30">
                        <User size={64} strokeWidth={1.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest mt-1">No Image</span>
                      </div>
                    )}
                  </div>
                </div>
                {userData?.isActive && (
                  <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-2xl shadow-lg border border-green-50">
                    <div className="bg-green-500 text-white p-2 rounded-xl" title="Verified Account">
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 gap-4">
              <button 
                onClick={() => navigate('/update', { state: { user: userData } })}
                className="flex items-center gap-2.5 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm active:scale-95"
              >
                <Edit2 size={18} /> Edit Details
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            {/* User Branding */}
            <div className="mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                    {userData?.name || 'Incomplete Profile'}
                  </h1>
                  <div className="mt-4 flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${
                      userData?.role === 'ADMIN' 
                      ? 'bg-purple-50 text-purple-700 border-purple-100 shadow-sm shadow-purple-50' 
                      : 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm shadow-blue-50'
                    }`}>
                      <Shield size={14} strokeWidth={2.5} />
                      {userData?.role || 'Member'}
                    </div>
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Joined {new Date(userData?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Info Grid */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <Mail size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Official Email</p>
                      <p className="text-gray-900 font-bold text-lg break-all group-hover:text-blue-700 transition-colors">{userData?.email || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-green-600 group-hover:text-white">
                      <Phone size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Primary Contact</p>
                      <p className="text-gray-900 font-bold text-lg group-hover:text-green-700 transition-colors">{userData?.phone || 'Not Provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="mt-12">
                <SeatPreference userId={userData?.id} />
              </div>

              {/* Status Section */}
              {!userData?.isActive && (
                <div className="mt-8 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
                  <AlertCircle size={20} />
                  <p className="text-sm font-bold">Your account is currently under review or restricted. Please contact support.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
