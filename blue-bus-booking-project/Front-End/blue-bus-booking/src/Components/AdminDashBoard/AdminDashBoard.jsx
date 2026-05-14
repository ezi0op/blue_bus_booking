import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, Ticket, Percent, 
  Wallet, Users, BrainCircuit, Star, 
  TrendingUp, ArrowUpRight, Search,
  ChevronDown, ChevronUp, User, CreditCard,
  Calendar, Trash2, Edit2, Plus, Tag,
  Clock, ShieldCheck, Activity, Zap
} from 'lucide-react';

const AdminDashBoard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'coupons'
  const [data, setData] = useState({ summary: null, analytics: null, bookings: [], coupons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (activeTab === 'overview') {
        const [sumRes, anaRes] = await Promise.all([
          axios.get('http://localhost:8080/api/admin/dashboard/summary', { headers }),
          axios.get('http://localhost:8080/api/admin/dashboard/ai-analytics', { headers })
        ]);
        setData(prev => ({ ...prev, summary: sumRes.data.data, analytics: anaRes.data.data }));
      } else if (activeTab === 'bookings') {
        const res = await axios.get('http://localhost:8080/api/admin/bookings', { headers });
        setData(prev => ({ ...prev, bookings: res.data.data || [] }));
      } else if (activeTab === 'coupons') {
        const res = await axios.get('http://localhost:8080/api/admin/coupons', { headers });
        setData(prev => ({ ...prev, coupons: res.data.data || [] }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.status === 403 ? 'Access Denied: Admin Privileges Required' : 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Tab Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {[
              { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview' },
              { id: 'bookings', icon: <Ticket size={18} />, label: 'Bookings' },
              { id: 'coupons', icon: <Percent size={18} />, label: 'Coupons' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">DashBoard</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest">Synchronizing...</div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4"><Zap size={24} /></div>
          <p className="text-sm font-black text-slate-900 mb-2">{error}</p>
          <p className="text-xs text-slate-400 font-medium italic">Please check if the backend is running at :8080 and you are logged in.</p>
          <button onClick={fetchTabData} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Retry Connection</button>
        </div>
      ) : activeTab === 'overview' ? (
        <OverviewSection summary={data.summary} analytics={data.analytics} />
      ) : activeTab === 'bookings' ? (
        <BookingsSection bookings={data.bookings} />
      ) : (
        <CouponsSection coupons={data.coupons} />
      )}
    </div>
  );
};

// --- SUB-SECTIONS ---

const OverviewSection = ({ summary, analytics }) => {
  const stats = [
    { label: 'Revenue', value: `₹${summary?.totalRevenue?.toLocaleString() || '0'}`, icon: <Wallet className="text-emerald-500" />, trend: '+12.5%', color: 'bg-emerald-50' },
    { label: 'Active Users', value: summary?.totalUsers || '0', icon: <Users className="text-blue-500" />, trend: '+5.2%', color: 'bg-blue-50' },
    { label: 'Bookings', value: summary?.totalBookings || '0', icon: <Ticket className="text-violet-500" />, trend: '+18.7%', color: 'bg-violet-50' },
    { label: 'Fleet Size', value: summary?.totalBuses || '0', icon: <BrainCircuit className="text-amber-500" />, trend: 'Stable', color: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
              <div className="text-[10px] font-black text-slate-400">{stat.trend}</div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-10">
          <div className="flex-1">
             <div className="flex items-center gap-3 mb-6">
                <BrainCircuit size={24} className="text-blue-400" />
                <h2 className="text-xl font-black tracking-tight uppercase">AI Chatbot Intelligence</h2>
             </div>
             <div className="space-y-6">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(((analytics?.chatbotUsageCount || 0) / 100) * 100, 100)}%` }}></div>
                </div>
                <div className="flex gap-10">
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Chatbot Sessions</p>
                      <p className="text-2xl font-black text-emerald-400">{analytics?.chatbotUsageCount || '0'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Top Route</p>
                      <p className="text-lg font-black text-white">{analytics?.mostSearchedRoute || 'No data'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Seat Preference</p>
                      <p className="text-lg font-black text-white">{analytics?.mostPreferredSeatType || 'N/A'}</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="w-full md:w-80 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
             <p className="text-sm text-slate-300 italic">"AI-powered search engine assisting {analytics?.chatbotUsageCount || '0'} user interactions with intelligent route recommendations."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingsSection = ({ bookings }) => (
  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-50 bg-slate-50/50">
          <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Reference</th>
          <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Financials</th>
          <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
          <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Details</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {bookings.map(b => (
          <tr key={b.id} className="hover:bg-slate-50/50 transition-all">
            <td className="px-8 py-6">
              <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{b.bookingReference}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">User ID: {b.userId}</p>
            </td>
            <td className="px-8 py-6 text-sm font-black text-slate-900">₹{b.finalAmount}</td>
            <td className="px-8 py-6 text-center">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {b.status}
              </span>
            </td>
            <td className="px-8 py-6 text-right">
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-all"><Search size={18} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CouponsSection = ({ coupons }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {coupons.map(c => (
      <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform"><Tag size={60} /></div>
         <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl font-black text-sm tracking-widest inline-block mb-6">{c.couponCode}</div>
         <h3 className="text-xl font-black text-slate-900 mb-2">Save ₹{c.discountAmount}</h3>
         <p className="text-xs text-slate-400 italic mb-8">"{c.description || 'Limited time offer'}"</p>
         <div className="flex justify-between items-center pt-6 border-t border-slate-50">
            <span className={`text-[10px] font-black uppercase ${c.isActive ? 'text-emerald-500' : 'text-slate-300'}`}>{c.isActive ? 'Active' : 'Disabled'}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires: {new Date(c.expiryDate).toLocaleDateString()}</span>
         </div>
      </div>
    ))}
  </div>
);

export default AdminDashBoard;
