import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
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

  const [selectedTripId, setSelectedTripId] = useState(null);
  const [expandedStopsTripId, setExpandedStopsTripId] = useState(null);
  const [stopsData, setStopsData] = useState({});

  useEffect(() => {
    const savedQuery = localStorage.getItem('smartSearchQuery');
    const savedResults = localStorage.getItem('smartSearchResults');
    const savedSelectedTripId = localStorage.getItem('smartSearchSelectedTripId');

    if (savedQuery) {
      setQuery(savedQuery);
    }
    if (savedResults) {
      setResults(JSON.parse(savedResults));
      setHasSearched(true);
    }
    if (savedSelectedTripId) {
      setSelectedTripId(Number(savedSelectedTripId));
    }
  }, []);

  const toggleStops = async (trip) => {
    if (expandedStopsTripId === trip.tripId) {
      setExpandedStopsTripId(null);
      return;
    }
    setExpandedStopsTripId(trip.tripId);
    
    if (!stopsData[trip.routeId]) {
      try {
        const res = await api.get(`/api/stops/route/${trip.routeId}`);
        if (res.data.success) {
          setStopsData(prev => ({ ...prev, [trip.routeId]: res.data.data }));
        }
      } catch (err) {
        console.error('Error fetching stops:', err);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    setSelectedTripId(null);
    setExpandedStopsTripId(null);
    localStorage.removeItem('smartSearchSelectedTripId');
    
    try {
      const response = await api.post('/api/smart-search/search', {
        query: query,
        userId: userId
      });

      if (response.data.success) {
        setResults(response.data.data);
        localStorage.setItem('smartSearchQuery', query);
        localStorage.setItem('smartSearchResults', JSON.stringify(response.data.data));
      } else {
        setError('No perfect matches found. Try refining your request!');
      }
    } catch (err) {
      console.error('Smart search error:', err);
      const backendError = err.response?.data?.message;
      setError(backendError || 'I couldn\'t find any buses available for that route. Please try another city or date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Back Button */}
      <button 
        onClick={() => {
          localStorage.removeItem('smartSearchQuery');
          localStorage.removeItem('smartSearchResults');
          localStorage.removeItem('smartSearchSelectedTripId');
          navigate('/');
        }}
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
              <React.Fragment key={trip.tripId}>
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                  <TripResultCard
                    trip={trip}
                    from={trip.source}
                    to={trip.destination}
                    isSelected={selectedTripId === trip.tripId}
                    onToggleSeats={() => {
                      const nextId = selectedTripId === trip.tripId ? null : trip.tripId;
                      setSelectedTripId(nextId);
                      if (nextId) localStorage.setItem('smartSearchSelectedTripId', nextId);
                      else localStorage.removeItem('smartSearchSelectedTripId');
                    }}
                    isStopsExpanded={expandedStopsTripId === trip.tripId}
                    onToggleStops={() => toggleStops(trip)}
                    aiData={{
                      matchScore: trip.matchScore,
                      recommendationReason: trip.recommendationReason
                    }}
                  />
                </div>
                
                {/* Expandable Stops */}
                {expandedStopsTripId === trip.tripId && (
                  <div className="mt-[-1.5rem] bg-slate-50 p-8 pt-12 rounded-b-[2.5rem] border-x border-b border-gray-100 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 mb-6">
                      <Clock size={16} className="text-blue-600" />
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Route Schedule</h5>
                    </div>
                    <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-100">
                      {(stopsData[trip.routeId] || []).map((stop) => (
                        <div key={stop.id} className="relative flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
                          <div className="absolute -left-[27px] w-[12px] h-[12px] rounded-full bg-white border-2 border-blue-600 z-10"></div>
                          <div>
                            <p className="text-sm font-black text-gray-800">{stop.name}</p>
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">Arrival</p>
                              <p className="text-xs font-black text-blue-600">{stop.arrivalTime}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">Departure</p>
                              <p className="text-xs font-black text-emerald-600">{stop.departureTime}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expandable Seat Layout */}
                {selectedTripId === trip.tripId && (
                  <div className="mt-[-1.5rem] animate-in slide-in-from-top-4 duration-500">
                    <SeatLayout 
                      tripId={trip.tripId} 
                      price={trip.price} 
                      onClose={() => setSelectedTripId(null)} 
                    />
                  </div>
                )}
              </React.Fragment>
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
