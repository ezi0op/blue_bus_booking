import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MapPin, Loader2, Navigation } from 'lucide-react';

const BusOperatorRoute = ({ operator, onClose }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (operator) {
      fetchRoutes();
    }
  }, [operator]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/operators/bus/${operator.id}/routes`);
      if (res.data.success) {
        setRoutes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  if (!operator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">{operator.name} Routes</h3>
              <p className="text-xs font-semibold text-gray-500">Active operating routes</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-semibold text-gray-500">Fetching routes...</p>
            </div>
          ) : routes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {routes.map(route => (
                <div key={route.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-md font-extrabold uppercase tracking-widest">Active</span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      <Navigation size={12} className="text-blue-500" /> {route.distance}km
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">From</p>
                      <p className="text-sm font-extrabold text-gray-800 truncate" title={route.source}>{route.source}</p>
                    </div>
                    <div className="text-gray-300">→</div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">To</p>
                      <p className="text-sm font-extrabold text-gray-800 truncate" title={route.destination}>{route.destination}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-bold">No Routes Available</p>
              <p className="text-xs text-gray-400 mt-1">This operator currently has no active routes.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default BusOperatorRoute;
