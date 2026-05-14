import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Ticket, Search, X, AlertTriangle,
  Check, User, Calendar, DollarSign,
  ShieldCheck, Clock, Filter
} from 'lucide-react';

const STATUS_COLORS = {
  CONFIRMED: 'bg-emerald-50 text-emerald-600',
  PENDING:   'bg-amber-50 text-amber-600',
  CANCELLED: 'bg-rose-50 text-rose-600',
  COMPLETED: 'bg-blue-50 text-blue-600',
};

const AdminBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.get('http://localhost:8080/api/admin/bookings', { headers });
      setBookings(res.data.data || []);
    } catch (err) {
      showMessage('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`http://localhost:8080/api/admin/bookings/${selectedBookingId}/cancel`, {}, { headers });
      showMessage('Booking cancelled successfully', 'success');
      setShowCancelModal(false);
      fetchBookings();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Cancel failed');
    }
  };

  const filtered = bookings.filter(b =>
    b.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(b.userId).includes(searchTerm) ||
    b.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {notification.type === 'success' ? <ShieldCheck size={20} /> : <X size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}

      {/* Cancel Confirmation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 mx-auto"><AlertTriangle size={40} /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Cancel Booking?</h2>
            <p className="text-sm text-slate-400 font-medium mb-8">This will initiate a refund if applicable.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Go Back</button>
              <button onClick={handleCancel} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <Ticket size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking Registry</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">
              {bookings.length} total reservation{bookings.length !== 1 ? 's' : ''} on record.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by reference, user or status..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-bold text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Reference</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Passenger</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Trip</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-8 py-5">
                      <div className="h-8 bg-slate-50 rounded-lg animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-slate-400 italic font-medium">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-900 uppercase tracking-wider">{b.bookingReference}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                        <Clock size={10} className="inline mr-1" />
                        {b.bookingTime ? new Date(b.bookingTime).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-black text-sm">
                          {b.userId}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700">User #{b.userId}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            {b.passengers?.length || 0} passenger{b.passengers?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-700">Trip #{b.tripId}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-sm font-black text-slate-900">₹{b.finalAmount}</p>
                      {b.totalAmount !== b.finalAmount && (
                        <p className="text-[10px] font-bold text-slate-400 line-through">₹{b.totalAmount}</p>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[b.status] || 'bg-slate-50 text-slate-400'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <button
                          onClick={() => { setSelectedBookingId(b.id); setShowCancelModal(true); }}
                          className="p-3 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-5 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filtered.length} of {bookings.length} entries
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminBooking;
