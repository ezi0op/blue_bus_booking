import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, Plus, Edit2, X, Check,
  ChevronRight, Clock,
  Map as MapIcon,
  Navigation, MapPinned, AlertTriangle
} from 'lucide-react';

const AdminStop = () => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sequenceOrder: 1,
    arrivalTime: '',
    departureTime: '',
    route: { id: '' }
  });

  const [notification, setNotification] = useState(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatingStopId, setDeactivatingStopId] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRouteId) fetchStops();
  }, [selectedRouteId]);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchRoutes = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get('http://localhost:8080/api/routes', { headers });
      setRoutes(res.data.data || []);
      if (res.data.data?.length > 0) setSelectedRouteId(res.data.data[0].id);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const fetchStops = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get(`http://localhost:8080/api/stops/route/${selectedRouteId}`, { headers });
      setStops((res.data.data || []).sort((a, b) => a.sequenceOrder - b.sequenceOrder));
    } catch (err) {
      console.error('Error fetching stops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      // Ensure times are in HH:mm:ss format
      const formattedArrivalTime = formData.arrivalTime?.length === 5 ? `${formData.arrivalTime}:00` : formData.arrivalTime;
      const formattedDepartureTime = formData.departureTime?.length === 5 ? `${formData.departureTime}:00` : formData.departureTime;
      
      const data = { 
        ...formData, 
        arrivalTime: formattedArrivalTime,
        departureTime: formattedDepartureTime,
        route: { id: selectedRouteId } 
      };
      if (editingItem) {
        await axios.put(`http://localhost:8080/api/admin/stops/${editingItem.id}`, data, { headers });
        showMessage('Stop updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8080/api/admin/stops', data, { headers });
        showMessage('Stop created successfully', 'success');
      }
      setShowModal(false);
      fetchStops();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDeactivate = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`http://localhost:8080/api/admin/stops/${deactivatingStopId}/deactivate`, {}, { headers });
      showMessage('Stop deactivated successfully', 'success');
      setShowDeactivateModal(false);
      fetchStops();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Deactivate failed');
    }
  };

  const activeRoute = routes.find(r => r.id === selectedRouteId);

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

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDeactivateModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 mx-auto"><AlertTriangle size={40} /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Deactivate Stop?</h2>
            <p className="text-sm text-slate-400 font-medium mb-8">This stop will be marked as inactive on the route.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeactivateModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={handleDeactivate} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg">Deactivate</button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <MapPinned size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Route Stop Architect</h1>
            <p className="text-sm font-medium text-slate-400 italic">Precision timing and sequence management for transit networks.</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingItem(null); setFormData({ name: '', sequenceOrder: stops.length + 1, arrivalTime: '', departureTime: '', route: { id: selectedRouteId } }); setShowModal(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-[#0d2694] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
        >
          <Plus size={18} /> New Stop
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Route Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6 ml-2">Active Routes</h3>
              <div className="space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                 {routes.map(r => (
                   <button 
                    key={r.id} 
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${selectedRouteId === r.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100'}`}
                   >
                     <div className="flex items-center gap-3">
                        <Navigation size={18} className={selectedRouteId === r.id ? 'text-blue-200' : 'text-slate-300 group-hover:text-blue-500'} />
                        <span className="text-xs font-black tracking-tight">{r.source} → {r.destination}</span>
                     </div>
                     <ChevronRight size={16} className={selectedRouteId === r.id ? 'text-white' : 'text-slate-300'} />
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Stop Timeline Content */}
        <div className="lg:col-span-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[600px] relative overflow-hidden">
              {/* Decorative Background Icon */}
              <MapIcon size={300} className="absolute -bottom-20 -right-20 text-slate-50 opacity-50 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12">
                   <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      Timeline View
                   </div>
                   <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {activeRoute ? `${activeRoute.source} to ${activeRoute.destination}` : 'Select a route'}
                   </h2>
                </div>

                {loading ? (
                   <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calculating Sequence...</p>
                   </div>
                ) : stops.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                      <MapPin size={48} className="text-slate-200 mb-4" />
                      <p className="text-sm font-bold text-slate-400 italic">No intermediate stops mapped for this trajectory.</p>
                   </div>
                ) : (
                   <div className="relative pl-12 space-y-8">
                      {/* Vertical Line */}
                      <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-600 via-blue-200 to-transparent"></div>

                      {stops.map((stop, index) => (
                        <div key={stop.id} className="relative animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                           {/* Stop Marker */}
                           <div className="absolute -left-[30px] top-4 w-[12px] h-[12px] bg-white border-4 border-blue-600 rounded-full shadow-lg z-20"></div>

                           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-start gap-6">
                                 <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    {stop.sequenceOrder}
                                 </div>
                                 <div>
                                    <h4 className="text-lg font-black text-slate-800 mb-2">{stop.name}</h4>
                                    <div className="flex flex-wrap gap-4">
                                       <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
                                          <Clock size={12} className="font-black" />
                                          <span className="text-[10px] font-black uppercase">Arr: {stop.arrivalTime}</span>
                                       </div>
                                       <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                                          <Navigation size={12} className="font-black" />
                                          <span className="text-[10px] font-black uppercase">Dep: {stop.departureTime}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex gap-2 self-end md:self-auto">
                                 <button 
                                  onClick={() => { setEditingItem(stop); setFormData(stop); setShowModal(true); }}
                                  className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                                 >
                                    <Edit2 size={18} />
                                 </button>
                                 <button 
                                   onClick={() => { setDeactivatingStopId(stop.id); setShowDeactivateModal(true); }}
                                   className="p-4 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                   title="Deactivate Stop"
                                 >
                                   <X size={18} />
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">{editingItem ? 'Update' : 'Initialize'} Stop</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Location Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" placeholder="e.g. Swargate Hub" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Sequence Order</label>
                  <input required type="number" value={formData.sequenceOrder} onChange={(e) => setFormData({...formData, sequenceOrder: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Arrival Time</label>
                  <input required type="time" value={formData.arrivalTime} onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Departure Time</label>
                <input required type="time" value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-[#0d2694] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"><Check size={18} /> Save Station</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStop;
