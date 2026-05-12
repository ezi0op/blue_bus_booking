import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, MapPin, Calendar, Clock, Banknote, ArrowRight, Loader2, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RecommendSeat = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/recommendations/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRecommendations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Could not fetch recommendations at this time.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider">Recommended For You</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">AI-Powered Personalization</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
          <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <div 
            key={rec.tripId}
            className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden border-b-4 border-b-blue-600/10 hover:border-b-blue-600"
            onClick={() => navigate('/')} // Or navigate to a specific flow
          >
            {/* Recommendation Tag */}
            <div className="absolute top-4 right-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 border border-white/20">
                <Zap size={10} className="fill-white" />
                <span className="text-[9px] font-black uppercase tracking-widest">Top Pick</span>
              </div>
            </div>

            {/* Route Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all duration-300">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900">{rec.source}</span>
                    <ArrowRight size={12} className="text-gray-300" />
                    <span className="text-sm font-black text-gray-900">{rec.destination}</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{rec.busName} • {rec.busType}</p>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{rec.journeyDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{rec.departureTime}</span>
                </div>
              </div>

              {/* AI Reason */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mt-4">
                <p className="text-[10px] font-bold text-blue-800 leading-relaxed italic">
                  <Sparkles size={10} className="inline mr-1 text-blue-600" />
                  "{rec.recommendationReason}"
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Starting At</p>
                  <h5 className="text-xl font-black text-gray-900">₹{rec.price}</h5>
                </div>
                <button className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendSeat;
