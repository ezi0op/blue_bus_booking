import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarClock, Plus, Edit2, X, Check,
  Calendar, Clock, AlertTriangle, Map, MapPin,
  ArrowRight, Tag, Bus as BusIcon, Info,
  Navigation, DollarSign, Image as ImageIcon
} from 'lucide-react';

const AdminTrip = () => {
  const [view, setView] = useState('trips'); // 'trips' or 'routes'
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const [notification, setNotification] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedTripId, setSelectedTripId] = useState(null);
  
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [availableBuses, setAvailableBuses] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchOptions = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    setFetchingOptions(true);
    try {
      const [routesRes, busesRes] = await Promise.all([
        axios.get('http://localhost:8080/api/routes', { headers }),
        axios.get('http://localhost:8080/api/buses', { headers })
      ]);
      setAvailableRoutes(routesRes.data.data || []);
      setAvailableBuses(busesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching options:', err);
    } finally {
      setFetchingOptions(false);
    }
  };

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (view === 'trips') {
        const res = await axios.get('http://localhost:8080/api/trips', { headers });
        setTrips(res.data.data || []);
      } else {
        const res = await axios.get('http://localhost:8080/api/routes', { headers });
        setRoutes(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showMessage('Failed to synchronize cloud data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCancel = async () => {
    if (!cancelReason.trim()) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`http://localhost:8080/api/admin/trips/${selectedTripId}/admin-cancel`, { reason: cancelReason }, { headers });
      setShowCancelModal(false);
      setCancelReason('');
      fetchData();
      showMessage('Trip sequence terminated successfully', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Action failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    // Prepare data with correct time formats
    const submissionData = { ...formData };
    
    if (view === 'trips') {
      // Ensure departureTime is HH:mm:ss
      if (submissionData.departureTime && submissionData.departureTime.length === 5) {
        submissionData.departureTime = `${submissionData.departureTime}:00`;
      }
      
      // Ensure arrivalTime is yyyy-MM-ddTHH:mm:ss
      if (submissionData.arrivalTimeOnly && submissionData.arrivalDate) {
        submissionData.arrivalTime = `${submissionData.arrivalDate}T${submissionData.arrivalTimeOnly}:00`;
      }
    }

    try {
      const baseUrl = `http://localhost:8080/api/admin/${view}`;
      if (editingItem) {
        await axios.put(`${baseUrl}/${editingItem.id}`, submissionData, { headers });
        showMessage(`${view.slice(0, -1)} updated successfully`, 'success');
      } else {
        await axios.post(baseUrl, submissionData, { headers });
        showMessage(`${view.slice(0, -1)} established successfully`, 'success');
      }
      setShowModal(false);
      fetchData();
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
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Cancel Trip?</h2>
             <p className="text-sm text-slate-400 font-medium mb-8">This action is irreversible and will trigger automatic passenger notifications.</p>
             
             <div className="space-y-1.5 mb-8">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Cancellation Reason</label>
                <textarea 
                  required 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Technical maintenance, weather conditions..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm min-h-[100px] resize-none"
                />
             </div>

             <div className="flex gap-4">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Go Back</button>
                <button onClick={handleAdminCancel} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20">Confirm Cancel</button>
             </div>
          </div>
        </div>
      )}

      {/* Modern Sub-Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
            <button 
              onClick={() => setView('trips')} 
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'trips' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Trips
            </button>
            <button 
              onClick={() => setView('routes')} 
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'routes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Routes
            </button>
          </div>
          <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{view} Explorer</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage scheduled {view} and transit paths.</p>
          </div>
        </div>

        <button 
          onClick={() => { setEditingItem(null); setFormData({}); fetchOptions(); setShowModal(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-[#0d2694] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20"
        >
          <Plus size={18} /> New {view === 'trips' ? 'Trip' : 'Route'}
        </button>
      </div>

      {/* Content Section */}
      <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem]"></div>
            ))
          ) : view === 'trips' ? (
            trips.map(trip => (
            <div key={trip.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              {/* Trip ID Badge */}
              <div className="absolute -top-1 -right-1 px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-black rounded-bl-2xl uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                TRP-{trip.id}
              </div>

              <div className="flex items-center gap-4 mb-6">
                 <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <BusIcon size={28} />
                 </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{trip.route?.source || trip.source || 'Origin'}</h3>
                    <div className="flex items-center gap-2 text-slate-400">
                       <ArrowRight size={14} className="text-blue-500" />
                       <span className="text-sm font-bold">{trip.route?.destination || trip.destination || 'Destination'}</span>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Departure</p>
                    <p className="text-sm font-black text-slate-800 flex items-center gap-2"><Clock size={14} className="text-blue-500" /> {trip.departureTime}</p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Journey Date</p>
                    <p className="text-sm font-black text-slate-800 flex items-center gap-2"><Calendar size={14} className="text-blue-500" /> {trip.journeyDate}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50">
                       <BusIcon size={14} className="text-blue-500" />
                       <span className="text-[11px] font-black text-blue-700 tracking-tight">{trip.busName || trip.bus?.busNumber || 'UNASSIGNED'}</span>
                       <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest ml-1">{trip.busType || trip.bus?.busType}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-1">
                       <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{trip.totalSeats || 0} Total</span>
                       </div>
                       <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{trip.availableSeats || 0} Left</span>
                       </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-center ${
                      trip.status === 'SCHEDULED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                 <div className="flex gap-2">
                    <button onClick={() => { setSelectedTripId(trip.id); setShowCancelModal(true); }} className="p-3 bg-rose-50 text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm"><AlertTriangle size={18} /></button>
                    <button onClick={() => { 
                      const tripCopy = { ...trip };
                      if (trip.arrivalTime) {
                        const [date, time] = trip.arrivalTime.split('T');
                        tripCopy.arrivalDate = date;
                        tripCopy.arrivalTimeOnly = time.slice(0, 5);
                      }
                      setEditingItem(trip); 
                      setFormData(tripCopy); 
                      fetchOptions(); 
                      setShowModal(true); 
                    }} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                 </div>
              </div>
            </div>
          ))
        ) : (
          routes.map(route => (
            <div key={route.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative">
               <div className="flex items-center justify-between mb-8">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                     <Navigation size={24} />
                  </div>
                  <div className="text-right">
                     <p className="text-xl font-black text-slate-900 tracking-tight">{route.distance} <span className="text-xs text-slate-400">KM</span></p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. {route.duration} Min</p>
                  </div>
               </div>

               <h3 className="text-lg font-black text-slate-900 mb-1">{route.source}</h3>
               <div className="w-full h-0.5 bg-slate-50 my-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-blue-500 rounded-full animate-progress-slow"></div>
               </div>
               <h3 className="text-lg font-black text-slate-900 mb-6">{route.destination}</h3>

               <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${route.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{route.isActive ? 'Active Path' : 'Disabled'}</span>
                  </div>
                  <button onClick={() => { setEditingItem(route); setFormData(route); setShowModal(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18} /></button>
               </div>
            </div>
          ))
        )}
      </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-all"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">{editingItem ? 'Update' : 'Initialize'} {view.slice(0, -1)}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {view === 'trips' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Transit Route</label>
                      <select 
                        required 
                        value={formData.route?.id || ''} 
                        onChange={(e) => setFormData({...formData, route: {id: e.target.value}})} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{fetchingOptions ? 'Loading...' : 'Select Route'}</option>
                        {availableRoutes.map(r => (
                          <option key={r.id} value={r.id}>{r.source} → {r.destination}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Assigned Vehicle</label>
                      <select 
                        required 
                        value={formData.bus?.id || ''} 
                        onChange={(e) => {
                          const busId = e.target.value;
                          const selectedBus = availableBuses.find(b => b.id.toString() === busId);
                          setFormData({
                            ...formData, 
                            bus: {id: busId},
                            totalSeats: selectedBus ? selectedBus.totalSeats : formData.totalSeats
                          });
                        }} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{fetchingOptions ? 'Loading...' : 'Select Bus'}</option>
                        {availableBuses.map(b => (
                          <option key={b.id} value={b.id}>{b.busNumber} ({b.busType})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Departure Date</label>
                      <input 
                        required 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.journeyDate || ''} 
                        onChange={(e) => setFormData({...formData, journeyDate: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">ETD (Time)</label>
                      <input required type="time" value={formData.departureTime || ''} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Arrival Date</label>
                      <input 
                        required 
                        type="date" 
                        min={formData.journeyDate || new Date().toISOString().split('T')[0]}
                        value={formData.arrivalDate || ''} 
                        onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">ETA (Time)</label>
                      <input required type="time" value={formData.arrivalTimeOnly || ''} onChange={(e) => setFormData({...formData, arrivalTimeOnly: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Standard Fare (₹)</label>
                      <div className="relative">
                         <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="number" 
                            placeholder="Auto-calculate"
                            value={formData.price || ''} 
                            onChange={(e) => setFormData({...formData, price: e.target.value})} 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Override Seats</label>
                      <div className="relative">
                         <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="number" 
                            placeholder="Bus Default"
                            value={formData.totalSeats || ''} 
                            onChange={(e) => setFormData({...formData, totalSeats: e.target.value})} 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Origin City</label>
                      <input required type="text" placeholder="SOURCE" value={formData.source || ''} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Target City</label>
                      <input required type="text" placeholder="DESTINATION" value={formData.destination || ''} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Distance (KM)</label>
                      <input required type="number" value={formData.distance || ''} onChange={(e) => setFormData({...formData, distance: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Duration (Min)</label>
                      <input required type="number" value={formData.duration || ''} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Destination Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="url" 
                        placeholder="https://images.unsplash.com/photo..." 
                        value={formData.image || ''} 
                        onChange={(e) => setFormData({...formData, image: e.target.value})} 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-[#0d2694] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"><Check size={18} className="inline mr-1" /> Save {view.slice(0, -1)}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrip;
