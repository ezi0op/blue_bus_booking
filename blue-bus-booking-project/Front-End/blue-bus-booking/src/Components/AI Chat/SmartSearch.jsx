import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, MapPin, Calendar, Clock, Banknote, Star, ArrowRight, Loader2, Filter, Info, X, ArrowLeft } from 'lucide-react';
import SeatLayout from '../Page2/SeatLayout/SeatLayout';
import TripResultCard from '../Page2/TripResultCard';

const SmartSearch = ({ userId }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/smart-search/search', {
        query: query,
        userId: userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError('No perfect matches found. Try refining your request!');
      }
    } catch (err) {
      console.error('Smart search error:', err);
      setError('I couldn\'t find any buses available for that route. Please try another city or date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-8 transition-all group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      {/* Search Bar Section */}
      <div className="bg-white rounded-[3rem] p-4 shadow-2xl shadow-blue-500/10 border border-gray-100 mb-12 relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        <form onSubmit={handleSearch} className="relative flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Sparkles className="text-blue-600 animate-pulse" size={24} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'I want a morning bus to Pune under ₹800'"
              className="w-full pl-16 pr-8 py-6 bg-transparent text-lg font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} strokeWidth={3} />}
            AI Search
          </button>
        </form>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-blue-600" size={24} />
          </div>
          <h4 className="text-xl font-black text-gray-900">Consulting AI Travel Guides...</h4>
          <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Analysing match scores and preferences</p>
        </div>
      ) : error ? (
        <div className="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-12 text-center">
          <div className="bg-red-100 w-16 h-16 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-6">
            <Info size={32} />
          </div>
          <h4 className="text-xl font-black text-red-900">{error}</h4>
          <p className="text-sm font-medium text-red-600 mt-2">Try mentioning cities, times, or budget requirements.</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between px-6">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
              AI Curated Top Matches ({results.length})
            </h4>
            <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase">
              <Filter size={12} /> Personalized
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 pb-12">
            {results.map((trip, idx) => (
              <div key={trip.tripId} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                <TripResultCard
                  trip={trip}
                  from={trip.source}
                  to={trip.destination}
                  readOnly={true}
                  aiData={{
                    matchScore: trip.matchScore,
                    recommendationReason: trip.recommendationReason
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-20 px-12">
          <div className="bg-red-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-red-600 mx-auto mb-8 shadow-inner">
            <Info size={40} strokeWidth={1.5} />
          </div>
          <h4 className="text-2xl font-black text-gray-900">No Trips Found</h4>
          <p className="text-gray-500 font-medium max-w-md mx-auto mt-4 leading-relaxed">
            I couldn't find any buses available for that exact route and date. Try modifying your search or checking different dates.
          </p>
        </div>
      ) : (
        <div className="text-center py-20 px-12">
          <div className="bg-blue-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner">
            <Search size={40} strokeWidth={1.5} />
          </div>
          <h4 className="text-2xl font-black text-gray-900">Ask the BlueBus AI</h4>
          <p className="text-gray-500 font-medium max-w-md mx-auto mt-4 leading-relaxed">
            Try searching with natural language like "I want an AC bus to Mumbai on Friday morning under ₹1200".
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
