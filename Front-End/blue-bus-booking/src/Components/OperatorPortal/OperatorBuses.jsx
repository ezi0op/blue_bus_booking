import React, { useState, useEffect } from 'react';
import { Bus, Plus, Search, MoreVertical, Edit, Trash2, ShieldCheck, ShieldAlert, X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';

const OperatorBuses = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [newBus, setNewBus] = useState({
    busNumber: '',
    busType: 'AC',
    totalSeats: 36,
    image: ''
  });

  const operatorId = localStorage.getItem('operatorId');

  useEffect(() => {
    fetchBuses();
  }, [operatorId]);

  const fetchBuses = async () => {
    try {
      const response = await api.get(`/api/operator/buses/${operatorId}`);
      if (response.data.success) {
        setBuses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post(`/api/operator/bus?operatorId=${operatorId}`, newBus);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Bus added to fleet successfully!' });
        fetchBuses();
        setTimeout(() => {
          setShowModal(false);
          setMessage({ type: '', text: '' });
          setNewBus({ busNumber: '', busType: 'AC Sleeper', totalSeats: 36, image: '' });
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add bus. Check number format.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl w-full"></div>)}
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Fleet</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and monitor your bus fleet</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Add New Bus
        </button>
      </div>

      {/* Add Bus Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Add <span className="text-blue-600">New Vehicle</span></h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Register a new bus to your company</p>
               </div>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                 <X size={20} />
               </button>
             </div>

             <form onSubmit={handleAddBus} className="p-8 space-y-5">
               {message.text && (
                 <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                   {message.text}
                 </div>
               )}

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bus Number</label>
                 <input 
                   type="text" 
                   required
                   placeholder="e.g. KA-01-AB-1234"
                   value={newBus.busNumber}
                   onChange={(e) => setNewBus({...newBus, busNumber: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bus Type</label>
                 <select 
                   value={newBus.busType}
                   onChange={(e) => setNewBus({...newBus, busType: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                 >
                   <option value="AC">AC</option>
                   <option value="NON_AC">Non-AC</option>
                   <option value="SLEEPER">Sleeper</option>
                   <option value="SEMI_SLEEPER">Semi-Sleeper</option>
                   <option value="SEATER">Seater</option>
                   <option value="VOLVO">Volvo</option>
                   <option value="ELECTRIC">Electric</option>
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Seats</label>
                 <input 
                   type="number" 
                   required
                   min="10"
                   max="60"
                   value={newBus.totalSeats}
                   onChange={(e) => setNewBus({...newBus, totalSeats: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bus Image URL (Optional)</label>
                 <input 
                   type="text" 
                   placeholder="https://images.unsplash.com/..."
                   value={newBus.image}
                   onChange={(e) => setNewBus({...newBus, image: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={submitting}
                 className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:bg-blue-400 mt-4"
               >
                 {submitting ? 'Registering Bus...' : 'Add to Fleet'}
               </button>
             </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses.length > 0 ? buses.map((bus) => (
          <div key={bus.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600">
                <Bus size={24} />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${bus.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {bus.isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                {bus.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-1">{bus.busNumber}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{bus.busType}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Capacity</p>
                <p className="text-sm font-black text-slate-800">{bus.totalSeats} Seats</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all"><Edit size={16} /></button>
                <button className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Bus size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold">No buses found in your fleet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default OperatorBuses;
