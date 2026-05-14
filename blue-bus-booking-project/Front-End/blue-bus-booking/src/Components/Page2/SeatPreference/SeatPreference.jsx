import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Info, Heart, Layout, Award } from 'lucide-react';

const SeatPreference = ({ userId }) => {
  const [preference, setPreference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreference = async () => {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;

      try {
        const response = await axios.get(`http://localhost:8080/api/seat-preference/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setPreference(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching seat preference:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreference();
  }, [userId]);

  if (loading || !preference || preference.totalBookingsAnalysed === 0) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">Smart Recommendation</h4>
          <p className="text-[10px] text-blue-600 font-semibold tracking-wide uppercase">Based on your {preference.totalBookingsAnalysed} journeys</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl border border-white">
          <div className="flex items-center gap-2">
            <Layout size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">Preferred Seat</span>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
             {preference.preferredSeatType}
          </span>
        </div>

        <div className="flex items-center justify-between bg-white/60 p-2 rounded-xl border border-white">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">Preferred Deck</span>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
            {preference.preferredDeckType} DECK
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-500 font-medium px-1">
        <Info size={12} className="text-blue-400" />
        We've highlighted your favorite seats on the map!
      </div>
    </div>
  );
};

export default SeatPreference;
