import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Check, X } from 'lucide-react';
import AvailableCoupons from './AvailableCoupons';

const Offers = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const showMessage = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Ticket size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Available Coupons</h1>
              <p className="text-sm font-medium text-slate-400 mt-0.5">List of active promo codes you can use for your bookings.</p>
            </div>
          </div>

          <AvailableCoupons onSelect={(code) => {
            navigator.clipboard.writeText(code);
            showMessage(`Code ${code} copied to clipboard!`);
          }} bookingAmount={9999} />
        </div>
      </div>
    </div>
  );
};

export default Offers;
