import React from 'react';
import { Bus, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
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

      <div className="flex-1 flex justify-between items-center w-full">
        <div className="text-center md:text-left">
          <p className="text-2xl font-bold text-gray-800">{trip.departureTime?.slice(0, 5) || trip.departureTime}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1 uppercase">{from || trip.source}</p>
          
          {/* Bus Operator Info */}
          <BusOperatorInfo operator={trip.operator} />
        </div>

        <div className="flex flex-col items-center px-4 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-[2px] w-8 bg-gray-200"></div>
            <Clock size={14} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
              {trip.route?.duration || '4h 30m'}
            </span>
            <div className="h-[2px] w-8 bg-gray-200"></div>
          </div>
          <Bus size={20} className="text-blue-500" />
          <div className="flex flex-col items-center mt-1">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {trip.availableSeats} Seats Left
            </span>
            {trip.route?.distance && (
              <span className="text-[9px] text-gray-400 font-medium mt-1">
                {trip.route.distance} KM
              </span>
            )}
          </div>
        </div>

        <div className="text-center md:text-right">
          <p className="text-2xl font-bold text-gray-800">
            {trip.arrivalTime ? (trip.arrivalTime.includes('T') ? trip.arrivalTime.split('T')[1].slice(0, 5) : trip.arrivalTime.slice(0, 5)) : 'TBD'}
          </p>
          <p className="text-sm font-semibold text-gray-500 mt-1 uppercase">{to || trip.destination}</p>
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
