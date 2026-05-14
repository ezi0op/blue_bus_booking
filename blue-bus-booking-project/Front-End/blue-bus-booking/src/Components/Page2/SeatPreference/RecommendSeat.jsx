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
    <div className="mt-12 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">RECOMMENDED FOR YOU</h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">AI-Powered Personalization</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm self-start sm:self-center">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((rec) => (
          <div 
            key={rec.tripId}
            className="group relative bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-700 cursor-pointer border border-gray-100/50 hover:-translate-y-2 flex flex-col h-full"
            onClick={() => {
              // Save search params to localStorage to "prime" the search results on home page
              localStorage.setItem('lastSearch', JSON.stringify({ 
                from: rec.source, 
                to: rec.destination, 
                date: rec.journeyDate 
              }));
              // Save as pending booking to trigger automatic seat layout open
              localStorage.setItem('pendingBooking', JSON.stringify({ tripId: rec.tripId }));
              
              navigate('/');
            }}
          >
            {/* Tag - Top Left for better visibility */}
            <div className="mb-6 flex">
              <div className="bg-blue-600 text-white px-4 py-1.5 rounded-xl shadow-lg flex items-center gap-2 transform group-hover:scale-105 transition-transform">
                <Zap size={12} className="fill-white" />
                <span className="text-[9px] font-black uppercase tracking-widest">AI Top Pick</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 space-y-6">
              {/* Route Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-black text-gray-900 truncate">{rec.source}</span>
                    <ArrowRight size={14} className="text-gray-300 shrink-0" />
                    <span className="text-base font-black text-gray-900 truncate">{rec.destination}</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{rec.busType} • {rec.busName}</p>
                </div>
              </div>

              {/* Detail Pills */}
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-2 bg-gray-50 rounded-xl flex items-center gap-2 border border-gray-100">
                  <Calendar size={14} className="text-blue-600" />
                  <span className="text-[10px] font-black text-gray-600 uppercase">{rec.journeyDate}</span>
                </div>
                <div className="px-3 py-2 bg-gray-50 rounded-xl flex items-center gap-2 border border-gray-100">
                  <Clock size={14} className="text-blue-600" />
                  <span className="text-[10px] font-black text-gray-600 uppercase">{rec.departureTime}</span>
                </div>
              </div>

              {/* AI Reason Box */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100/50 group-hover:bg-blue-600 transition-all">
                <div className="flex gap-3">
                  <Sparkles size={14} className="text-blue-600 shrink-0 group-hover:text-white transition-colors" />
                  <p className="text-[10px] font-bold text-blue-900 group-hover:text-white leading-relaxed italic transition-colors">
                    {rec.recommendationReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Fare</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-gray-400">₹</span>
                  <span className="text-3xl font-black text-gray-900">{rec.price}</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 group-hover:scale-110 transition-all shadow-xl">
                <ArrowRight size={20} strokeWidth={3} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendSeat;
