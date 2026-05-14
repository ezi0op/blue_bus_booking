import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MapPin, Clock, Navigation, Zap, Loader2, Calendar } from 'lucide-react';
import StopMap from '../StopMap/StopMap';

const ExploreRoute = ({ route, isOpen, onClose }) => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && route?.id) {
      const fetchStops = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:8080/api/maps/routes/${route.id}/stops`);
          setStops(response.data.data || []);
          setError(null);
        } catch (err) {
          console.error('Error fetching stops:', err);
          setError('Could not load itinerary. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchStops();
    }
  }, [isOpen, route]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Navigation size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {route.source} <span className="text-blue-600 px-2">→</span> {route.destination}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Route Details & Itinerary</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            
            {/* Left: Map Section */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex-grow rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm relative min-h-[400px]">
                {loading ? (
                  <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Mapping Route...</p>
                  </div>
                ) : (
                  <StopMap stops={stops} />
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Total Distance</span>
                  <span className="text-lg font-black text-gray-800">{route.distance} KM</span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Duration</span>
                  <span className="text-lg font-black text-gray-800">{route.duration} HRS</span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-blue-600 uppercase block mb-1">Next Trip</span>
                  <span className="text-lg font-black text-blue-700">{route.nextDate || 'Daily'}</span>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Status</span>
                  <span className="text-lg font-black text-green-600">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Right: Timeline Section */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                 <Zap size={16} className="text-blue-600 fill-blue-600" />
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Journey Timeline</h3>
              </div>

              <div className="flex-grow relative overflow-y-auto pr-4 custom-scrollbar">
                {loading ? (
                   <div className="space-y-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>
                      ))}
                   </div>
                ) : error ? (
                   <div className="text-center py-12 text-red-500 font-bold bg-red-50 rounded-3xl border border-red-100">
                      {error}
                   </div>
                ) : stops.length === 0 ? (
                   <div className="text-center py-12 text-gray-400 italic bg-gray-50 rounded-3xl border border-gray-100">
                      No itinerary data available for this route.
                   </div>
                ) : (
                  <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-100">
                    {stops.sort((a,b) => a.sequenceOrder - b.sequenceOrder).map((stop, idx) => (
                      <div key={stop.id} className="relative group">
                        {/* Dot */}
                        <div className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 bg-white transition-all duration-300 group-hover:scale-150 ${idx === 0 ? 'border-green-600' : idx === stops.length - 1 ? 'border-red-600' : 'border-blue-600'}`}></div>
                        
                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group-hover:bg-white group-hover:border-blue-100 group-hover:shadow-lg group-hover:shadow-blue-50 transition-all duration-300">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="font-black text-gray-800 text-sm">{stop.name}</h4>
                              <span className="bg-white px-2 py-0.5 rounded-lg border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-tighter">Stop {idx + 1}</span>
                           </div>
                           <div className="flex gap-4">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-gray-400 uppercase">Arrival</span>
                                 <span className="text-xs font-bold text-blue-600">{stop.arrivalTime || '--:--'}</span>
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-gray-400 uppercase">Departure</span>
                                 <span className="text-xs font-bold text-green-600">{stop.departureTime || '--:--'}</span>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
             * Times are subject to traffic conditions
           </p>
           <button 
             onClick={onClose}
             className="px-8 py-3 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
           >
             Close Explorer
           </button>
        </div>

      </div>
    </div>
  );
};

export default ExploreRoute;
