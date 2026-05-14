import React from 'react';
import { Bus, Clock, ChevronDown, ChevronUp, Sparkles, Calendar } from 'lucide-react';
import BusOperatorInfo from '../BusOperator/BusOperatorInfo';

const TripResultCard = ({ 
  trip, 
  from, 
  to, 
  isSelected, 
  onToggleSeats, 
  isStopsExpanded, 
  onToggleStops,
  aiData = null, // Optional prop for AI-specific data
  readOnly = false // If true, hides the booking buttons
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow relative z-10">
      
      {/* Optional Match Score Badge for AI results */}
      {aiData && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 z-20 border border-white/20">
          <Sparkles size={12} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">{Math.round(aiData.matchScore * 100)}% Match</span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-3 md:flex md:justify-between items-center w-full gap-2 md:gap-6">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-blue-600" />
            <span className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-tighter">{trip.journeyDate}</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{trip.departureTime?.slice(0, 5) || trip.departureTime}</p>
          <p className="text-[10px] md:text-sm font-semibold text-gray-500 mt-1 uppercase truncate max-w-[80px] md:max-w-none">{from || trip.source}</p>
          
          {/* Bus Operator Info - Hidden on very small screens to save space */}
          <div className="hidden sm:block">
            <BusOperatorInfo operator={trip.operator} />
          </div>
        </div>

        <div className="flex flex-col items-center px-2">
          <div className="flex items-center gap-1 mb-2">
            <div className="hidden lg:block h-[1px] w-6 bg-gray-200"></div>
            <Clock size={12} className="text-gray-400" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
              {trip.route?.duration || '4h 30m'}
            </span>
            <div className="hidden lg:block h-[1px] w-6 bg-gray-200"></div>
          </div>
          <div className="relative w-16 h-10 md:w-24 md:h-16 rounded-lg md:rounded-xl overflow-hidden border border-gray-100 shadow-sm mb-2 group">
             {trip.routeImage || trip.busImage ? (
               <img src={trip.routeImage || trip.busImage} alt="Trip" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
             ) : (
               <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                 <Bus size={18} className="text-blue-500" />
               </div>
             )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] md:text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 md:px-2 py-0.5 rounded-full border border-blue-100 whitespace-nowrap">
              {trip.availableSeats} Left
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {trip.arrivalTime ? (trip.arrivalTime.includes('T') ? trip.arrivalTime.split('T')[1].slice(0, 5) : trip.arrivalTime.slice(0, 5)) : 'TBD'}
          </p>
          <p className="text-[10px] md:text-sm font-semibold text-gray-500 mt-1 uppercase truncate max-w-[80px] md:max-w-none">{to || trip.destination}</p>
        </div>
      </div>

      <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 gap-3">
        <div className="text-right">
           <p className="text-2xl font-extrabold text-blue-600">₹{trip.price || trip.currentPrice}</p>
           {aiData && (
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">AI Optimized Price</p>
           )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          {!readOnly ? (
            <button
              onClick={onToggleSeats}
              className={`font-semibold py-2 px-6 rounded-lg transition-colors w-full text-sm ${
                isSelected ? 'bg-gray-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSelected ? 'Close Seats' : 'Book Seat'}
            </button>
          ) : (
            <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-400">
              <Sparkles size={12} className="opacity-50" />
              <span className="text-[9px] font-black uppercase tracking-widest">AI Discovery Only</span>
            </div>
          )}
          
          {onToggleStops && (
            <button 
              onClick={onToggleStops}
              className="text-[10px] font-bold text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors py-1 uppercase tracking-wider"
            >
              {isStopsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {isStopsExpanded ? 'Hide Stops' : 'View Stops'}
            </button>
          )}
        </div>
      </div>

      {/* Optional AI Insight Tooltip/Box */}
      {aiData && aiData.recommendationReason && (
        <div className="absolute -bottom-1 left-6 right-24 bg-blue-50 border-x border-b border-blue-100 px-4 py-1.5 rounded-b-xl z-0 transform translate-y-full flex items-center gap-2">
          <Sparkles size={10} className="text-blue-600" />
          <p className="text-[10px] font-bold text-blue-800 italic">"{aiData.recommendationReason}"</p>
        </div>
      )}
    </div>
  );
};

export default TripResultCard;
