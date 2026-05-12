import React from 'react';
import { Bus, MapPin, Calendar, Clock, User, Armchair, QrCode } from 'lucide-react';

const Ticket = ({ booking }) => {
  if (!booking) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[300px]">
      {/* Left Section - Main Info */}
      <div className="flex-[2] p-8 relative">
        {/* Ticket Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Bus size={20} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-none">BLUE BUS</h3>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Travel Pass</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Booking Ref</p>
            <p className="font-black text-blue-600">#{booking.bookingReference || booking.id}</p>
          </div>
        </div>

        {/* Route Info */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="z-10 bg-white pr-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">From</p>
            <p className="text-2xl font-black text-gray-900">{booking.trip?.route?.source}</p>
          </div>
          
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-slate-100 -z-0 border-t-2 border-dashed border-slate-200" />
          <div className="z-10 bg-white px-2 text-blue-400">
            <Bus size={16} />
          </div>

          <div className="z-10 bg-white pl-4 text-right">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">To</p>
            <p className="text-2xl font-black text-gray-900">{booking.trip?.route?.destination}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-gray-400">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
              <p className="text-sm font-bold text-gray-800">{new Date(booking.trip?.journeyDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-gray-400">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Departure</p>
              <p className="text-sm font-bold text-gray-800">{booking.trip?.departureTime || "09:00 PM"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-gray-400">
              <User size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Passenger(s)</p>
              <div className="flex flex-wrap gap-1">
                {booking.passengers?.map((p, i) => (
                  <p key={i} className="text-sm font-bold text-gray-800">
                    {p.name}{i < booking.passengers.length - 1 ? ',' : ''}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-gray-400">
              <Armchair size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Seat(s)</p>
              <p className="text-sm font-bold text-gray-800">
                {booking.passengers?.map(p => p.seat?.seatNumber || p.seatNumber).join(', ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Perforation Line (Visual) */}
        <div className="absolute top-0 bottom-0 -right-[1px] hidden md:flex flex-col items-center justify-around z-20">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-slate-50 rounded-full -mr-[6px] border border-slate-200 shadow-inner" />
          ))}
        </div>
      </div>

      {/* Right Section - QR/Staging */}
      <div className="bg-slate-50 md:flex-1 p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-dashed border-gray-200">
        <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-gray-100 group hover:shadow-md transition-all hover:scale-105">
          <img 
            src={`http://localhost:8080/api/ticket/qr/${booking.id}`} 
            alt="Ticket QR Code"
            className="w-40 h-40 object-contain"
            onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/241/241528.png"; }}
          />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
          Scan for Boarding
        </p>
        <div className="mt-6 pt-6 border-t border-gray-200 w-full text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Fare Paid</p>
          <p className="text-2xl font-black text-blue-600">₹{booking.finalAmount}</p>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
