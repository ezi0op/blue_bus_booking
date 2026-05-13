import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bus, Plus, Edit2, Power, 
  PowerOff, Landmark, X, Check
} from 'lucide-react';

const AdminBus = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    busNumber: '',
    busType: '',
    totalSeats: 0,
    operator: { id: '' }
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchBuses = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await axios.get('http://localhost:8080/api/buses', { headers });
      setBuses(response.data.data || []);
    } catch (err) {
      console.error('Error fetching buses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`http://localhost:8080/api/admin/buses/${id}/deactivate`, {}, { headers });
      fetchBuses();
      showMessage('Bus status updated', 'success');
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
        await axios.put(`http://localhost:8080/api/admin/buses/${editingItem.id}`, formData, { headers });
        showMessage('Bus updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8080/api/admin/buses', formData, { headers });
        showMessage('Bus created successfully', 'success');
      }
      setShowModal(false);
      fetchBuses();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Bus size={20} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bus Fleet</h1>
          </div>
          <p className="text-sm font-medium text-slate-400 italic">Manage your active bus units and their operational status.</p>
        </div>

        <button 
          onClick={() => { setEditingItem(null); setFormData({ busNumber: '', busType: '', totalSeats: 0, operator: { id: '' } }); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#0d2694] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} /> Add New Bus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]"></div>
          ))
        ) : (
          buses.map((bus) => (
            <div key={bus.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Bus size={28} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${bus.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {bus.isActive ? 'Active' : 'Deactivated'}
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1">{bus.busNumber}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{bus.busType}</p>
              
              <div className="space-y-2 mb-6 text-sm font-bold text-slate-600">
                <div className="flex items-center gap-2"><Landmark size={14} className="text-slate-400" /> {bus.operatorName || 'Partner Assigned'}</div>
                <div className="flex items-center gap-2"><Plus size={14} className="text-slate-400" /> {bus.totalSeats} Total Seats</div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setEditingItem(bus); setFormData(bus); setShowModal(true); }} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all">Edit Unit</button>
                <button onClick={() => handleToggleStatus(bus.id)} className={`p-3 rounded-xl transition-all ${bus.isActive ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}>{bus.isActive ? <PowerOff size={18} /> : <Power size={18} />}</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">{editingItem ? 'Edit' : 'Create'} Bus</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Bus Number</label>
                  <input required type="text" value={formData.busNumber} onChange={(e) => setFormData({...formData, busNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type</label>
                  <select required value={formData.busType} onChange={(e) => setFormData({...formData, busType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm">
                    <option value="">Select Type</option>
                    <option value="AC">AC</option>
                    <option value="NON_AC">Non-AC</option>
                    <option value="SLEEPER">Sleeper</option>
                    <option value="SEMI_SLEEPER">Semi-Sleeper</option>
                    <option value="SEATER">Seater</option>
                    <option value="VOLVO">Volvo</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Total Seats</label>
                  <input required type="number" value={formData.totalSeats} onChange={(e) => setFormData({...formData, totalSeats: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Operator ID</label>
                  <input required type="number" value={formData.operator?.id || ''} onChange={(e) => setFormData({...formData, operator: {id: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-[#0d2694] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-2"><Check size={18} /> Save Bus</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBus;
