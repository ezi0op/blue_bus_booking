import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Image as ImageIcon, Save, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

const Update = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // We expect user data to be passed via routing state, otherwise fallback to fetching
  const initialUser = location.state?.user;

  const [formData, setFormData] = useState({
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    phone: initialUser?.phone || '',
    image: initialUser?.image || '',
    isActive: initialUser?.isActive ?? true
  });

  const [userId, setUserId] = useState(initialUser?.id || null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!initialUser);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If user navigated here directly without state, fetch the profile first
  useEffect(() => {
    if (!initialUser) {
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
            const data = response.data.data;
            setUserId(data.id);
            setFormData({
              name: data.name,
              email: data.email,
              phone: data.phone,
              image: data.image || '',
              isActive: data.isActive
            });
          }
        } catch (err) {
          setError('Failed to fetch profile data.');
        } finally {
          setFetching(false);
        }
      };
      fetchProfile();
    }
  }, [initialUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8080/api/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        // Update local storage if email changed
        if (formData.email !== localStorage.getItem('userEmail')) {
          localStorage.setItem('userEmail', formData.email);
        }
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setError(response.data.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Profile
        </button>

        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Update Profile</h2>

            {error && (
              <div className="mb-6 bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-600 border border-red-100">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 p-4 rounded-lg flex items-center gap-3 text-green-600 border border-green-100">
                <CheckCircle2 size={20} />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              
              {/* Image Preview & Input */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border-2 border-gray-200">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      readOnly
                      value={formData.email}
                      className="bg-gray-50 cursor-not-allowed block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border text-gray-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="^[6-9]\d{9}$"
                      value={formData.phone}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Update;
