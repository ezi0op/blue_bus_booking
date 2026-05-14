import React, { useState } from 'react';
import axios from 'axios';
import { 
  Settings, RefreshCw, ShieldAlert, 
  CheckCircle2, Clock, Zap
} from 'lucide-react';

const AdminSeatAvail = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState(null);

  const showMessage = (msg, type = 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleReleaseLocks = async () => {
    setLoading(true);
    setSuccess(false);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.put('http://localhost:8080/api/admin/seat-availability/release-expired-locks', {}, { headers });
      setSuccess(true);
      showMessage('Expired locks released successfully', 'success');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Maintenance error:', err);
      showMessage('Maintenance task failed. Check server logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          <p className="text-sm font-black tracking-tight">{notification.msg}</p>
        </div>
      )}
      {/* Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
            <Settings size={20} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Maintenance</h1>
        </div>
        <p className="text-sm font-medium text-slate-400 italic">Execute critical system utilities and background cleanup tasks.</p>
      </div>

      {/* Maintenance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Seat Lock Release */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
             <RefreshCw size={200} />
           </div>
           
           <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
              </div>
              <h3 className="text-xl font-black mb-2">Inventory Sync</h3>
              <p className="text-sm text-slate-400 font-medium mb-8 leading-relaxed">
                Releases all seat locks that have exceeded their 10-minute hold period. 
                Use this if users report seats being "unavailable" despite incomplete payments.
              </p>
              
              <button 
                onClick={handleReleaseLocks}
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                  ${success ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-blue-500 hover:text-white'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {loading ? 'Executing Clean...' : success ? (
                  <><CheckCircle2 size={18} /> Locks Released!</>
                ) : (
                  <><Zap size={18} /> Release Expired Locks</>
                )}
              </button>
           </div>
        </div>

        {/* System Health Info */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                 <ShieldAlert size={20} />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Health Status</h4>
           </div>
           
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Clock size={16} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-600">Background Jobs</span>
                 </div>
                 <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded">Running</span>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Settings size={16} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-600">Session Purge</span>
                 </div>
                 <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded">Automatic</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSeatAvail;