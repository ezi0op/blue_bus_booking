import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, User, ChevronRight, AlertCircle, ArrowLeft, Clock, CreditCard, ChevronDown, X, ShieldCheck } from 'lucide-react';
import BookingItem from './BookingItem';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  
  const navigate = useNavigate();

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/api/bookings/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // Sort by booking time descending (newest first)
          const sorted = (response.data.data || []).sort((a, b) => 
            new Date(b.bookingTime) - new Date(a.bookingTime)
          );
          setBookings(sorted);
        } else {
          showMessage('Failed to load your bookings.');
        }
      } catch (err) {
        showMessage('Failed to fetch bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const [processingId, setProcessingId] = useState(null);

  const triggerCancel = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowConfirmModal(true);
  };

  const handleCancel = async () => {
    if (!bookingToCancel) return;
    
    const bookingId = bookingToCancel;
    setShowConfirmModal(false);
    setBookingToCancel(null);

    const token = localStorage.getItem('token');
    try {
      setProcessingId(bookingId);
      const response = await axios.put(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update local state immediately for better UX
        setBookings(prev => prev.map(b => 
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        ));
        showMessage('Booking cancelled and refund initiated successfully!', 'success');
      } else {
        showMessage(response.data.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error cancelling booking.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (bookingId, type) => {
    const token = localStorage.getItem('token');
    const endpoint = type === 'ticket' ? `/api/tickets/${bookingId}` : `/api/invoices/${bookingId}`;
    const filename = `${type}_${bookingId}.pdf`;

    try {
      const response = await axios({
        url: `http://localhost:8080${endpoint}`,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showMessage(`Failed to download ${type}. Please try again later.`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
               <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle size={32} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-2">Cancel Booking?</h2>
               <p className="text-sm text-slate-400 font-medium mb-8">Are you sure you want to cancel this booking? Refund will be processed as per our policy.</p>
               
               <div className="flex gap-4">
                  <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Go Back</button>
                  <button onClick={handleCancel} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20">Confirm Cancel</button>
               </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {notification.type === 'success' ? <ShieldCheck size={20} /> : <X size={20} />}
            <p className="text-sm font-black tracking-tight">{notification.msg}</p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-blue-600 mb-2 transition-colors font-medium text-sm group"
            >
              <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </button>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Bookings</h2>
            <p className="text-gray-500 mt-1">Manage and view all your bus journey reservations</p>
          </div>
          
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Ticket className="text-blue-600" size={20} />
            <span className="font-bold text-gray-800">{bookings.length}</span>
            <span className="text-gray-500 text-sm">Total Bookings</span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket size={40} className="text-blue-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't made any bus bookings yet. Ready for your next adventure?</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95"
            >
              Search Buses
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                
                {/* Top Row: Reference and Status */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">PNR NUMBER</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                      {booking.bookingReference}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Booking Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-gray-400" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Booking Date</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {new Date(booking.bookingTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <CreditCard size={18} className="text-gray-400" />
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Amount</p>
                          <div className="flex items-center gap-2">
                             <p className="text-lg font-bold text-gray-900">₹{booking.finalAmount}</p>
                             {booking.totalAmount > booking.finalAmount && (
                               <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                                 -{booking.totalAmount - booking.finalAmount} {booking.appliedCouponCode ? `(${booking.appliedCouponCode})` : ''}
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Passenger List / Detailed Items */}
                    <div className="lg:col-span-2">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h5 className="text-[10px] text-gray-400 font-bold uppercase mb-3 flex items-center gap-2">
                          <User size={12} /> {expandedBookingId === booking.id ? 'Detailed Breakdown' : 'Passenger Details'}
                        </h5>
                        
                        {expandedBookingId === booking.id ? (
                          <BookingItem bookingId={booking.id} />
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {booking.passengers && booking.passengers.length > 0 ? (
                              booking.passengers.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                  <div>
                                    <p className="text-xs font-bold text-gray-800">{p.name}</p>
                                    <p className="text-[10px] text-gray-500">{p.gender}, {p.age} yrs</p>
                                  </div>
                                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                                    Seat {p.seatNumber}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 italic">No passenger info available</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-3 bg-gray-50/50 flex justify-end gap-4 border-t border-gray-100 items-center">
                   {booking.status === 'CONFIRMED' && (
                     <>
                       <button 
                         onClick={() => handleDownload(booking.id, 'ticket')}
                         className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                       >
                         <Ticket size={14} /> Download Ticket
                       </button>
                       <button 
                         onClick={() => handleDownload(booking.id, 'invoice')}
                         className="text-xs font-black text-gray-700 hover:text-blue-600 flex items-center gap-1 transition-colors"
                       >
                         <CreditCard size={14} /> Invoice
                       </button>
                        <button 
                          onClick={() => triggerCancel(booking.id)}
                          disabled={processingId === booking.id}
                          className={`text-xs font-black flex items-center gap-1 transition-colors ml-auto ${
                            processingId === booking.id ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-700'
                          }`}
                        >
                          {processingId === booking.id ? (
                            <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin mr-1"></div>
                          ) : (
                            <X size={14} />
                          )}
                          {processingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                     </>
                   )}
                   <button 
                     onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                     className="text-xs font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                   >
                     {expandedBookingId === booking.id ? 'Show Less' : 'View Detailed Info'} 
                     {expandedBookingId === booking.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                   </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
