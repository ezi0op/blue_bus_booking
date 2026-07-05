import React, { useState, useEffect } from 'react';
import { CalendarClock, MapPin, Plus, ArrowRight, Clock, Tag, X, Bus, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosConfig';

const OperatorTrips = () => {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [newTrip, setNewTrip] = useState({
    routeId: '',
    busId: '',
    journeyDate: '',
    departureTime: '',
    arrivalTime: '',
    price: ''
  });

  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [manifest, setManifest] = useState([]);
  const [loadingManifest, setLoadingManifest] = useState(false);

  const operatorId = localStorage.getItem('operatorId');

  useEffect(() => {
    fetchTrips();
    fetchInitialData();
  }, [operatorId]);

  const handleOpenManageModal = async (trip) => {
    setSelectedTrip(trip);
    setShowManageModal(true);
    setLoadingManifest(true);
    try {
      const response = await api.get(`/api/operator/manifest/${trip.id}?operatorId=${operatorId}`);
      if (response.data.success) {
        setManifest(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching manifest:", error);
    } finally {
      setLoadingManifest(false);
    }
  };

  const handleUpdateTripStatus = async (tripId, status) => {
    try {
      const response = await api.put(`/api/operator/trip/${tripId}/status?operatorId=${operatorId}&status=${status}`);
      if (response.data.success) {
        fetchTrips();
        setShowManageModal(false);
      }
    } catch (error) {
      console.error("Error updating trip status:", error);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await api.get(`/api/operator/trips/${operatorId}`);
      if (response.data.success) {
        setTrips(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [routesRes, busesRes] = await Promise.all([
        api.get('/api/routes'),
        api.get(`/api/operator/buses/${operatorId}`)
      ]);
      setRoutes(routesRes.data.data);
      setBuses(busesRes.data.data);
    } catch (error) {
      console.error("Error fetching helper data:", error);
    }
  };

  const handleScheduleTrip = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post(`/api/operator/trip?operatorId=${operatorId}`, newTrip);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Trip scheduled successfully!' });
        fetchTrips();
        setTimeout(() => {
          setShowModal(false);
          setMessage({ type: '', text: '' });
          setNewTrip({ routeId: '', busId: '', journeyDate: '', departureTime: '', arrivalTime: '', price: '' });
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to schedule trip. Please check all fields.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"></div>)}
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Schedules</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your active trip schedules</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Schedule New Trip
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Schedule <span className="text-blue-600">New Trip</span></h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Assign bus and route for departure</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleScheduleTrip} className="p-8 space-y-6">
              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <Tag size={18} />}
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Route</label>
                  <select 
                    required
                    value={newTrip.routeId}
                    onChange={(e) => setNewTrip({...newTrip, routeId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                  >
                    <option value="">Choose Route</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.source} → {r.destination}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Bus</label>
                  <select 
                    required
                    value={newTrip.busId}
                    onChange={(e) => setNewTrip({...newTrip, busId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                  >
                    <option value="">Choose Bus</option>
                    {buses.map(b => <option key={b.id} value={b.id}>{b.busNumber} ({b.busType})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Journey Date</label>
                <input 
                  type="date" 
                  required
                  value={newTrip.journeyDate}
                  onChange={(e) => setNewTrip({...newTrip, journeyDate: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                  <input 
                    type="time" 
                    required
                    value={newTrip.departureTime}
                    onChange={(e) => setNewTrip({...newTrip, departureTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival</label>
                  <input 
                    type="time" 
                    required
                    value={newTrip.arrivalTime}
                    onChange={(e) => setNewTrip({...newTrip, arrivalTime: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 1200"
                  value={newTrip.price}
                  onChange={(e) => setNewTrip({...newTrip, price: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:bg-blue-400"
              >
                {submitting ? 'Creating Trip...' : 'Confirm Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departure</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seats</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trips.length > 0 ? trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800">{trip.source}</span>
                      <ArrowRight size={14} className="text-blue-500" />
                      <span className="font-black text-slate-800">{trip.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">{trip.journeyDate}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trip.departureTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      trip.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' : 
                      trip.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(trip.bookedSeats/trip.totalSeats)*100}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-800">{trip.bookedSeats}/{trip.totalSeats}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-800">₹{trip.price}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleOpenManageModal(trip)}
                      className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold">No trips found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Trip Modal */}
      {showManageModal && selectedTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Manage <span className="text-blue-600">Trip TRP-{selectedTrip.id}</span></h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                   {selectedTrip.source} → {selectedTrip.destination} | {selectedTrip.journeyDate} {selectedTrip.departureTime}
                 </p>
               </div>
               <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 shadow-sm transition-all">
                 <X size={20} />
               </button>
             </div>

             <div className="p-8 space-y-6">
                {/* Status Toggle Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Current Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      selectedTrip.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' : 
                      selectedTrip.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {selectedTrip.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedTrip.status !== 'COMPLETED' && selectedTrip.status !== 'CANCELLED' && (
                      <>
                        <button 
                          onClick={() => handleUpdateTripStatus(selectedTrip.id, 'COMPLETED')}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                        >
                          Complete Trip
                        </button>
                        <button 
                          onClick={() => handleUpdateTripStatus(selectedTrip.id, 'CANCELLED')}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md shadow-rose-600/10"
                        >
                          Cancel Trip
                        </button>
                      </>
                    )}
                    {(selectedTrip.status === 'CANCELLED' || selectedTrip.status === 'COMPLETED') && (
                      <button 
                        onClick={() => handleUpdateTripStatus(selectedTrip.id, 'SCHEDULED')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10"
                      >
                        Reschedule (Set Active)
                      </button>
                    )}
                  </div>
                </div>

                {/* Passenger Manifest Title */}
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3">Passenger Manifest</h4>
                  {loadingManifest ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  ) : manifest.length > 0 ? (
                    <div className="overflow-hidden border border-slate-100 rounded-2xl max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest">Seat</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest">Passenger</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest">Age/Gender</th>
                            <th className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                          {manifest.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 text-blue-600">Seat {item.seatNumber}</td>
                              <td className="px-4 py-3">{item.passengerName}</td>
                              <td className="px-4 py-3 text-slate-400 uppercase tracking-wider">{item.passengerAge} yrs | {item.passengerGender}</td>
                              <td className="px-4 py-3">₹{item.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                      No tickets booked for this trip yet.
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorTrips;
