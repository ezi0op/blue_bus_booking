import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, ArrowUpRight, Filter, PieChart, BarChart3 } from 'lucide-react';
import api from '../../api/axiosConfig';

const OperatorEarnings = () => {
  const [earnings, setEarnings] = useState(0);
  const [period, setPeriod] = useState('MONTHLY');
  const [loading, setLoading] = useState(true);
  const operatorId = localStorage.getItem('operatorId');

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/operator/earnings/${operatorId}?period=${period}`);
        if (response.data.success) {
          setEarnings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoading(false);
      }
    };
    if (operatorId) fetchEarnings();
  }, [operatorId, period]);

  const periods = [
    { id: 'DAILY', label: 'Today' },
    { id: 'WEEKLY', label: 'This Week' },
    { id: 'MONTHLY', label: 'This Month' },
    { id: 'YEARLY', label: 'This Year' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Track your revenue and performance</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Earnings Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">+14.2% Growth</span>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Revenue ({period})</p>
            <h2 className="text-5xl font-black text-slate-800 tracking-tighter mb-4">
              {loading ? '...' : `₹${earnings.toLocaleString()}`}
            </h2>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <ArrowUpRight size={18} />
              <span>Higher than last period</span>
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
             <DollarSign size={200} />
          </div>
        </div>

        {/* Analytics Placeholder Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between border border-white/5">
              <div>
                <PieChart size={32} className="text-blue-400 mb-6" />
                <h3 className="text-lg font-black italic mb-2 tracking-tight uppercase">Booking Sources</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">Revenue distribution by channel</p>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile App</span><span className="font-black">65%</span></div>
                 <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-blue-400 h-full rounded-full w-[65%] shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div></div>
                 <div className="flex items-center justify-between mt-4"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Web Portal</span><span className="font-black">35%</span></div>
                 <div className="w-full bg-white/10 h-1 rounded-full"><div className="bg-white h-full rounded-full w-[35%]"></div></div>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <BarChart3 size={32} className="text-purple-600 mb-6" />
                <h3 className="text-lg font-black italic mb-2 tracking-tight uppercase text-slate-800">Occupancy Yield</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">Revenue per available seat km</p>
              </div>
              <div className="flex items-end gap-1 h-32">
                 {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                   <div key={i} className="flex-1 bg-purple-50 hover:bg-purple-600 transition-all rounded-t-lg relative group/bar" style={{ height: `${h}%` }}>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                       {h}%
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorEarnings;
