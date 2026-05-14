import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, UserCheck, UserMinus, 
  Trash2, Mail, Phone, Shield, 
  MoreVertical, Filter, Download
} from 'lucide-react';

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [notification, setNotification] = useState(null);

  const isSystemAdmin = (email) => email === 'admin@bluebus.com';

  useEffect(() => {
    fetchUsers();
  }, []);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users/', { headers });
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setActionLoading(id);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.get(`http://localhost:8080/api/admin/users/${id}/status?active=${!currentStatus}`, { headers });
      setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
      showMessage('User status updated successfully', 'success');
    } catch (err) {
      showMessage('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    setActionLoading(selectedUserId);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${selectedUserId}`, { headers });
      setUsers(users.filter(u => u.id !== selectedUserId));
      showMessage('User deleted successfully', 'success');
    } catch (err) {
      showMessage('Failed to delete user');
    } finally {
      setActionLoading(null);
      setShowConfirmModal(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <UserCheck size={20} /> : <UserMinus size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
             <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Trash2 size={40} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Delete User?</h2>
             <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">This action is permanent and will remove all user history from the system.</p>
             
             <div className="flex gap-4">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                <button onClick={handleDeleteUser} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20">Delete</button>
             </div>
          </div>
        </div>
      )}
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
          </div>
          <p className="text-sm font-medium text-slate-400 italic">Total of {users.length} registered accounts across the platform.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-bold text-slate-600"
            />
          </div>
          <button className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
            <Filter size={20} />
          </button>
          <button className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Identity</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Communication</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing User Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic font-medium">
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/20">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <Shield size={10} className="text-blue-500" /> Member #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
                          <Mail size={14} />
                          <span className="text-xs font-bold">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
                          <Phone size={14} />
                          <span className="text-xs font-bold">{user.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => toggleStatus(user.id, user.isActive)}
                        disabled={actionLoading === user.id || isSystemAdmin(user.email)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                          ${user.isActive 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'}
                          ${actionLoading === user.id || isSystemAdmin(user.email) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {actionLoading === user.id ? '...' : user.isActive ? (
                          <><UserCheck size={14} /> Active</>
                        ) : (
                          <><UserMinus size={14} /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isSystemAdmin(user.email) && (
                          <button 
                            onClick={() => { setSelectedUserId(user.id); setShowConfirmModal(true); }}
                            className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer (Dummy for now) */}
        <div className="px-8 py-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredUsers.length} of {users.length} entries</p>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 cursor-not-allowed uppercase">Prev</button>
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-blue-600 hover:border-blue-600 uppercase">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUser;
