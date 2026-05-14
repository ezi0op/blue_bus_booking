import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Armchair, Plus, Edit2, Power, 
  PowerOff, Search, X, Check,
  Bus as BusIcon, LayoutGrid, Info,
  ChevronRight, ArrowLeft
} from 'lucide-react';

const AdminSeat = () => {
  const [buses, setBuses] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    seatNumber: '',
    seatType: 'SEATER',
    bus: { id: '' },
    rowNumber: 1,
    columnNumber: 1,
    isWindow: false,
    isAisle: false
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [busRes, seatRes] = await Promise.all([
        axios.get('http://localhost:8080/api/buses', { headers }),
        axios.get('http://localhost:8080/api/seats', { headers })
      ]);
      setBuses(busRes.data.data || []);
      setSeats(seatRes.data.data || []);
    } catch (err) {
      showMessage('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`http://localhost:8080/api/admin/seats/${id}/deactivate`, {}, { headers });
      const seatRes = await axios.get('http://localhost:8080/api/seats', { headers });
      setSeats(seatRes.data.data || []);
      showMessage('Seat status updated', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Action failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBus?.id) {
      showMessage('Please select a bus first');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    // THE FIX: Explicitly structure the bus object with a numeric ID
    const dataToSend = {
      seatNumber: formData.seatNumber || `S${Math.floor(Math.random() * 1000)}`,
      seatType: formData.seatType,
      rowNumber: parseInt(formData.rowNumber) || 1,
      columnNumber: parseInt(formData.columnNumber) || 1,
      isWindow: formData.isWindow,
      isAisle: formData.isAisle,
      isActive: true,
      bus: { id: Number(selectedBus.id) }
    };

    try {
      await axios.post('http://localhost:8080/api/admin/seats', dataToSend, { headers });
      setShowModal(false);
      await fetchInitialData(); 
      showMessage('Seat deployed successfully', 'success');
    } catch (err) {
      showMessage(err.response?.data?.message || 'Save failed');
    }
  };

  const getBusSeats = (busId) => {
    const filtered = seats.filter(s => {
      const sBusId = s.busId || s.bus?.id;
      return Number(sBusId) === Number(busId);
    });
    return filtered;
  };

  // Sort seats for grid: by row, then by column
  const sortedSeats = (busId) => [...getBusSeats(busId)].sort((a, b) => {
    if (a.rowNumber !== b.rowNumber) return a.rowNumber - b.rowNumber;
    return a.columnNumber - b.columnNumber;
  });

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

      {selectedBus ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-6">
              <button onClick={() => setSelectedBus(null)} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-[#0d2694] hover:bg-blue-50 rounded-2xl transition-all">
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{selectedBus.busNumber}</h1>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">{selectedBus.busType}</span>
                </div>
                <p className="text-sm font-medium text-slate-400 italic">Configure layout and seat properties for this unit.</p>
              </div>
            </div>
            <button 
              onClick={() => { 
                setFormData({
                  seatNumber: '',
                  seatType: 'SEATER',
                  bus: { id: selectedBus.id },
                  rowNumber: 1,
                  columnNumber: 1,
                  isWindow: false,
                  isAisle: false
                }); 
                setShowModal(true); 
              }}
              className="flex items-center gap-2 px-6 py-3.5 bg-[#0d2694] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
            >
              <Plus size={18} /> Add Seat
            </button>
          </div>

          {/* Seating Grid Container */}
          <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="w-full max-w-4xl min-w-fit">
              <div className="w-full h-12 bg-slate-50 rounded-t-[2rem] border-x border-t border-slate-100 flex items-center justify-center mb-12">
                <div className="w-16 h-1.5 bg-slate-200 rounded-full"></div>
              </div>

              {/* Legend */}
              {(() => {
                const bSeats = getBusSeats(selectedBus.id);
                const mRow = Math.max(...bSeats.map(s => Number(s.rowNumber)), 1);
                const mCol = Math.max(...bSeats.map(s => Number(s.columnNumber)), 1);
                
                return (
                  <>
                    <div className="grid gap-6 p-4 mx-auto" style={{ 
                      gridTemplateColumns: `repeat(${mCol}, 80px)`,
                      justifyContent: 'center',
                      width: 'fit-content'
                    }}>
                      {Array.from({ length: mRow * mCol }).map((_, i) => {
                        const row = Math.floor(i / mCol) + 1;
                        const col = (i % mCol) + 1;
                        const cellSeats = bSeats.filter(s => Number(s.rowNumber) === row && Number(s.columnNumber) === col);

                        return (
                          <div key={i} className="min-h-[80px] w-[80px] flex flex-col gap-2 items-center justify-center relative p-2 border border-slate-50 rounded-2xl bg-slate-50/30">
                            {cellSeats.length > 0 ? (
                              cellSeats.map(seat => (
                                <button 
                                  key={seat.id}
                                  onClick={() => handleToggleStatus(seat.id)}
                                  className={`w-full py-2 rounded-xl flex flex-col items-center justify-center transition-all group relative shadow-sm border
                                    ${seat.isActive ? 'bg-white border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}
                                  `}
                                >
                                  <Armchair size={14} className="mb-0.5" />
                                  <span className="text-[9px] font-black uppercase">{seat.seatNumber}</span>
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
                                    {seat.seatType}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <span className="text-[8px] font-black text-slate-200 uppercase">{row}-{col}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend moved to bottom */}
                    <div className="mt-12 flex justify-center gap-8 border-t border-slate-50 pt-8 w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-50 rounded border border-blue-100 shadow-inner"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Seat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-slate-100 rounded border border-slate-200 shadow-inner"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inactive</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <LayoutGrid size={20} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seat Configuration</h1>
              </div>
              <p className="text-sm font-medium text-slate-400 italic">Select a bus to manage its internal seating architecture.</p>
            </div>
          </div>

          <div className="max-h-[calc(100vh-350px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading && buses.map((bus) => {
                const busSeats = getBusSeats(bus.id);
                return (
                  <button 
                    key={bus.id} 
                    onClick={() => setSelectedBus(bus)}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                        <BusIcon size={24} />
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{bus.busNumber}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{bus.busType}</p>
                    <div className="flex items-center gap-4 py-4 border-t border-slate-50">
                       <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600">
                         {busSeats.length}
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seats Configured</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-all">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Deploy New Seat</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Seat Number</label>
                    <input required type="text" placeholder="e.g. A1" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.seatNumber} onChange={(e) => setFormData({...formData, seatNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Type</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={formData.seatType} onChange={(e) => setFormData({...formData, seatType: e.target.value})}>
                      <option value="SEATER">Seater</option>
                      <option value="SLEEPER">Sleeper</option>
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Row</label>
                    <input required type="number" min="1" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.rowNumber} onChange={(e) => setFormData({...formData, rowNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Column</label>
                    <input required type="number" min="1" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none" value={formData.columnNumber} onChange={(e) => setFormData({...formData, columnNumber: e.target.value})} />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...formData, isWindow: !formData.isWindow})} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.isWindow ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${formData.isWindow ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>{formData.isWindow && <Check size={12} className="text-white" />}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Window</span>
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, isAisle: !formData.isAisle})} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.isAisle ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${formData.isAisle ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>{formData.isAisle && <Check size={12} className="text-white" />}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Aisle</span>
                  </button>
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Discard</button>
                  <button type="submit" className="flex-2 px-10 py-4 bg-[#0d2694] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2">
                    <Check size={18} /> Deploy
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeat;
