import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, Plus, Edit2, Power, 
  PowerOff, Mail, Phone, Shield, X, Check,
  Star, Briefcase, ExternalLink, ShieldCheck, Image as ImageIcon
} from 'lucide-react';

const AdminOperator = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    licenseNumber: '',
    isActive: true,
    image: ''
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchOperators = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.get('http://localhost:8080/api/operators', { headers });
      setOperators(response.data.data || []);
    } catch (err) {
      console.error('Error fetching operators:', err);
      showMessage('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`http://localhost:8080/api/admin/operators/${id}/deactivate`, {}, { headers });
      fetchOperators();
      showMessage('Partner operational status synchronized', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Action failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (editingItem) {
        await axios.put(`http://localhost:8080/api/admin/operators/${editingItem.id}`, formData, { headers });
        showMessage('Partner credentials updated', 'success');
      } else {
        await axios.post('http://localhost:8080/api/admin/operators', formData, { headers });
        showMessage('New fleet partner established', 'success');
      }
      setShowModal(false);
      fetchOperators();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <ShieldCheck size={20} /> : <X size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}

      {/* Modern Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner">
            <Activity size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Strategic Partners</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage network fleet service providers.</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingItem(null); setFormData({ name: '', contactEmail: '', contactPhone: '', licenseNumber: '', isActive: true, image: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-10 py-5 bg-[#0d2694] text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
        >
          <Plus size={18} /> Establish Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-[3rem]"></div>
          ))
        ) : (
          operators.map((op) => (
            <div key={op.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              {/* Partner ID Tag */}
              <div className="absolute top-0 right-0 px-6 py-3 bg-slate-50 text-slate-300 text-[10px] font-black rounded-bl-[2rem] uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                ID-{op.id}
              </div>

              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center font-black text-3xl shadow-inner group-hover:scale-110 transition-transform overflow-hidden border border-emerald-100">
                  {op.image ? (
                    <img src={op.image} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-600">{op.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{op.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 mt-1">
                     <Star size={14} fill="currentColor" />
                     <span className="text-xs font-black">{op.rating || '4.5'} Rating</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5 mb-10">
                <div className="flex items-center gap-4 group/item">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover/item:bg-blue-50 group-hover/item:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <span className="text-sm font-black text-slate-600 truncate">{op.contactEmail}</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                   <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover/item:bg-emerald-50 group-hover/item:text-emerald-500 transition-colors">
                    <Phone size={18} />
                  </div>
                  <span className="text-sm font-black text-slate-600">{op.contactPhone}</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                   <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover/item:bg-violet-50 group-hover/item:text-violet-500 transition-colors">
                    <Shield size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIC: {op.licenseNumber}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${op.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">{op.isActive ? 'Active Fleet' : 'On Hold'}</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setEditingItem(op); setFormData(op); setShowModal(true); }} className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.5rem] transition-all"><Edit2 size={20} /></button>
                  <button onClick={() => handleToggleStatus(op.id)} className={`p-4 rounded-[1.5rem] transition-all shadow-sm ${op.isActive ? 'bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}>{op.isActive ? <PowerOff size={20} /> : <Power size={20} />}</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-12 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-all"><X size={28} /></button>
            <div className="flex items-center gap-4 mb-10">
               <div className="p-4 bg-blue-50 text-blue-600 rounded-[1.5rem]">
                  <Briefcase size={28} />
               </div>
               <h2 className="text-2xl font-black text-slate-900">{editingItem ? 'Update' : 'Register'} Partner</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Enterprise Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" placeholder="e.g. BlueStar Travels" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Interface</label>
                  <input required type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" placeholder="ops@bluestar.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Primary Phone</label>
                  <input required type="text" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" placeholder="+91 99..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Service License #</label>
                <input required type="text" value={formData.licenseNumber} onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" placeholder="AUTH-XXXX-XXXX" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Partner Logo URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="url" 
                    placeholder="https://logo-url.com/logo.png" 
                    value={formData.image || ''} 
                    onChange={(e) => setFormData({...formData, image: e.target.value})} 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all" 
                  />
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Discard</button>
                <button type="submit" className="flex-1 py-5 bg-[#0d2694] text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"><Check size={20} /> Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOperator;
