import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Home, FileText, Ticket as TicketIcon, ArrowRight, Loader2, Mail, Eye } from 'lucide-react';
import axios from 'axios';
import Ticket from './PDF GEN/Ticket';
import Invoice from './PDF GEN/Invoice';

const PaymentSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [viewMode, setViewMode] = useState('ticket'); // 'ticket' or 'invoice'

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:8080/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setBookingData(response.data.data);
        }

        try {
          const paymentRes = await axios.get(`http://localhost:8080/api/payments/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (paymentRes.data.success) {
             setPaymentData(paymentRes.data.data);
          }
        } catch (e) {
          // Silent payment error
        }

      } catch (err) {
        setError('Could not load booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleDownload = async (type) => {
    const token = localStorage.getItem('token');
    const endpoint = type === 'ticket' ? `/api/tickets/${bookingId}` : `/api/invoices/${bookingId}`;
    const filename = `${type}_${bookingId}.pdf`;

    try {
      const response = await axios({
        url: `http://localhost:8080${endpoint}`,
        method: 'GET',
        responseType: 'blob', // Important for PDF
        headers: { Authorization: `Bearer ${token}` }
      });

      // Create a link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(`Failed to download ${type}. Please try again from My Bookings.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-white">
          {/* Top Decorative Header */}
          <div className="h-2 bg-gradient-to-r from-green-400 to-blue-500" />
          
          <div className="p-8 sm:p-12 text-center">
            {/* Animated Success Icon */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-green-100 rounded-full scale-150 opacity-50 animate-ping" />
              <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <CheckCircle2 size={56} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Your journey is set. We've sent the confirmation details to your email <span className="text-blue-600 font-bold underline underline-offset-4 decoration-blue-200">{bookingData?.contactEmail || localStorage.getItem('userEmail') || 'your email'}</span>.
            </p>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                    <TicketIcon size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Booking ID</span>
                </div>
                <p className="text-xl font-black text-gray-800">#{bookingData?.bookingReference || bookingId}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 transition-all hover:border-green-200 hover:bg-white hover:shadow-md group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                    <Mail size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                </div>
                <div className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                  {bookingData?.status} <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            {/* Interactive Document Preview */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit mx-auto mb-8">
                <button
                  onClick={() => setViewMode('ticket')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${viewMode === 'ticket' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <TicketIcon size={18} /> Ticket
                </button>
                <button
                  onClick={() => setViewMode('invoice')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${viewMode === 'invoice' ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FileText size={18} /> Invoice
                </button>
              </div>

              <div className="relative group">
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full z-10 shadow-lg animate-bounce">
                  LIVE PREVIEW
                </div>
                {viewMode === 'ticket' ? (
                  <Ticket booking={bookingData} paymentData={paymentData} />
                ) : (
                  <Invoice booking={bookingData} paymentData={paymentData} />
                )}
              </div>
            </div>

            {/* Download Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <button
                onClick={() => handleDownload('ticket')}
                className="group relative flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl active:scale-95 transition-all"
              >
                <TicketIcon size={20} className="group-hover:rotate-12 transition-transform" />
                Download Ticket
                <Download size={18} className="opacity-50" />
              </button>

              <button
                onClick={() => handleDownload('invoice')}
                className="group relative flex items-center justify-center gap-3 py-4 px-6 bg-white text-gray-800 border-2 border-gray-100 rounded-2xl font-bold hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-all"
              >
                <FileText size={20} className="text-blue-600 group-hover:-translate-y-1 transition-transform" />
                Download Invoice
                <Download size={18} className="opacity-50" />
              </button>
            </div>

            {/* Navigation Footer */}
            <div className="pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-500 font-bold hover:text-blue-600 transition-colors"
              >
                <Home size={18} />
                Back to Home
              </button>

              <button
                onClick={() => navigate('/bookings')}
                className="flex items-center gap-2 text-blue-600 font-black hover:gap-4 transition-all"
              >
                Manage Bookings
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-8 text-gray-400 text-sm font-medium">
          Have questions? Visit our <a href="#" className="text-blue-600 hover:underline">Help Center</a> or contact 24/7 Support.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
