import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Layout, User, Armchair, ChevronRight, BarChart3, Info } from 'lucide-react';
import RecommendSeat from '../Page2/SeatPreference/RecommendSeat';

const SeatPreference = ({ userId }) => {
  const [preference, setPreference] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [prefRes, suggRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/seat-preference/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8080/api/seat-preference/${userId}/suggest`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (prefRes.data.success) setPreference(prefRes.data.data);
        if (suggRes.data.success) setSuggestion(suggRes.data.data);
      } catch (err) {
        console.error('Error fetching seat preferences:', err);
        setError('Unable to load AI seat insights.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl p-8 animate-pulse border border-white/20">
      <div className="h-4 w-32 bg-gray-200 rounded-full mb-6"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-gray-200 rounded-2xl"></div>
        <div className="h-24 bg-gray-200 rounded-2xl"></div>
      </div>
    </div>
  );

  if (error) return null;

  const calculatePercent = (val, total) => (total > 0 ? (val / total) * 100 : 0);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700">
        <Armchair size={120} strokeWidth={1} />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} />
              AI Seat Insights
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Based on your travel DNA</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider">
            {preference?.totalBookingsAnalysed || 0} Trips Analysed
          </div>
        </div>

        {/* Suggestion Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 mb-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Recommended for your next trip</p>
              <h4 className="text-2xl font-black tracking-tight flex items-center gap-3">
                {suggestion || 'NO PREFERENCE'} SEAT
                <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                  <Layout size={18} />
                </div>
              </h4>
            </div>
            <div className="bg-white text-blue-700 p-3 rounded-2xl shadow-lg">
              <ChevronRight size={24} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Position Stats */}
          <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Position Preference</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-gray-600">WINDOW</span>
                  <span className="text-blue-600">{preference?.windowCount || 0}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${calculatePercent(preference?.windowCount, preference?.totalBookingsAnalysed)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-gray-600">AISLE</span>
                  <span className="text-gray-500">{preference?.aisleCount || 0}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400 rounded-full transition-all duration-1000"
                    style={{ width: `${calculatePercent(preference?.aisleCount, preference?.totalBookingsAnalysed)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Deck Stats */}
          <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Layout size={16} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deck Preference</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-gray-600">LOWER</span>
                  <span className="text-indigo-600">{preference?.lowerBerthCount || 0}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${calculatePercent(preference?.lowerBerthCount, preference?.totalBookingsAnalysed)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-gray-600">UPPER</span>
                  <span className="text-gray-500">{preference?.upperBerthCount || 0}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-300 rounded-full transition-all duration-1000"
                    style={{ width: `${calculatePercent(preference?.upperBerthCount, preference?.totalBookingsAnalysed)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <Info size={16} className="text-blue-600 shrink-0" />
          <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
            Our AI continuously analyzes your choices to pre-select your favorite spots and apply personalized discounts on your preferred routes.
          </p>
        </div>
      </div>

      {/* Personalized Trip Recommendations */}
      <div className="mt-8 pt-8 border-t border-gray-100">
        <RecommendSeat userId={userId} />
      </div>
    </div>
  );
};

export default SeatPreference;
