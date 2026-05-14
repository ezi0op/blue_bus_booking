import React, { useState, useEffect } from 'react';
import { 
  Bus, CalendarClock, Ticket, TrendingUp, 
  Users, ArrowUpRight, ArrowDownRight, Activity,
  Clock, MapPin, ChevronRight
} from 'lucide-react';
import api from '../../api/axiosConfig';

const OperatorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const operatorId = localStorage.getItem('operatorId'); // Assuming this is stored on login

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/api/operator/dashboard/${operatorId}`);
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching operator stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (operatorId) fetchStats();
  }, [operatorId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  const statCards = [
    { label: 'Total Earnings', value: `₹${stats?.totalEarnings?.toLocaleString() || 0}`, icon: <TrendingUp className="text-emerald-600" />, color: 'bg-emerald-50', trend: '+12.5%' },
    { label: 'Total Fleet', value: stats?.totalBuses || 0, icon: <Bus className="text-blue-600" />, color: 'bg-blue-50', trend: 'Active' },
    { label: 'Active Trips', value: stats?.activeTripsCount || 0, icon: <CalendarClock className="text-purple-600" />, color: 'bg-purple-50', trend: 'Today' },
    { label: 'Seats Sold', value: stats?.totalSeatsSold || 0, icon: <Ticket className="text-orange-600" />, color: 'bg-orange-50', trend: '+4.2%' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Summary</h1>
          <p className="text-slate-500 font-medium">Welcome back! Here's how your fleet is performing today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Clock size={16} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${card.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {card.trend}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Middle Section: Occupancy & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Occupancy Card */}
        <div className="lg:col-span-1 bg-[#1e293b] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2 italic">Fleet Occupancy</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">Average across all active routes</p>
            
            <div className="flex items-end gap-2 mb-4">
              <span className="text-6xl font-black tracking-tighter">{stats?.averageOccupancyRate?.toFixed(1) || 0}%</span>
              <Activity className="text-blue-400 mb-2" size={24} />
            </div>
            
            <div className="w-full bg-white/10 h-3 rounded-full mb-8">
              <div 
                className="bg-blue-500 h-full rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000"
                style={{ width: `${stats?.averageOccupancyRate || 0}%` }}
              ></div>
            </div>

            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-sm font-bold transition-all flex items-center justify-center gap-2">
              Optimize Routes <ArrowUpRight size={18} />
            </button>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Upcoming Trips */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tight">Next Departures</h3>
            <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
          </div>

          <div className="space-y-6">
            {stats?.upcomingTrips?.length > 0 ? stats.upcomingTrips.map((trip, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{trip.source} → {trip.destination}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{trip.departureTime}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">{trip.bookedSeats}/{trip.totalSeats} Sold</p>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase">{trip.status}</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CalendarClock size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No trips scheduled for the next 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
