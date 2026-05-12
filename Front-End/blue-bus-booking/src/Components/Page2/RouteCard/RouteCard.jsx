import React from 'react'
import { MapPin, Clock, ArrowRight, Zap, Navigation, ShieldCheck } from 'lucide-react'

const RouteCard = ({ route, onExplore }) => {
  if (!route) return null;

  const defaultImg = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"
  
  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-500 border border-gray-100 group cursor-pointer h-full flex flex-col">
      {/* Route Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={route.image || defaultImg} 
          alt={`${route.source} to ${route.destination}`} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Badges */}
        <div className="absolute top-5 right-5 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-black text-blue-600 shadow-sm uppercase tracking-widest flex items-center gap-1.5 border border-white/50">
                <Zap size={12} className="fill-blue-600" />
                Popular
            </div>
        </div>

        {/* Bottom Left Badge */}
        <div className="absolute bottom-5 left-5 bg-white/20 backdrop-blur-lg px-3 py-1.5 rounded-xl text-[10px] font-bold text-white border border-white/30 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            Daily Trips
        </div>
      </div>

      {/* Route Content Section */}
      <div className="p-8 flex-grow flex flex-col justify-between">
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Departure</span>
              <h3 
                className="text-lg sm:text-xl font-extrabold text-gray-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors truncate" 
                title={route.source}
              >
                {route.source}
              </h3>
            </div>
            <div className="w-10 h-10 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-45">
                <ArrowRight size={20} />
            </div>
            <div className="flex flex-col text-right flex-1 min-w-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Arrival</span>
              <h3 
                className="text-lg sm:text-xl font-extrabold text-gray-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors truncate"
                title={route.destination}
              >
                {route.destination}
              </h3>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                <Clock size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Duration</span>
                <span className="text-sm font-black text-gray-700">{route.duration}h</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors">
                <Navigation size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Distance</span>
                <span className="text-sm font-black text-gray-700">{route.distance}km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onExplore}
          className="w-full bg-gray-900 group-hover:bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-gray-200 group-hover:shadow-blue-200 flex items-center justify-center gap-2"
        >
           Explore Route
           <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
        </button>
      </div>
    </div>
  )
}

export default RouteCard