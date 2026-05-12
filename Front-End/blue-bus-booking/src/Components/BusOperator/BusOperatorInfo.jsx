import React from 'react';
import { Star, Mail, Phone, ShieldCheck } from 'lucide-react';

const BusOperatorInfo = ({ operator }) => {
  if (!operator) return null;

  return (
    <div className="mt-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 group relative cursor-help">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operated By</span>
        <div className="flex items-center gap-1">
          <p className="text-xs font-bold text-blue-700">{operator.name}</p>
          <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-green-700 border border-green-100">
            {operator.rating || '4.2'} <Star size={10} className="fill-green-700 ml-0.5" />
          </div>
        </div>
        
        {/* Operator Tooltip */}
        <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[70] transform translate-y-1 group-hover:translate-y-0">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50">
            <h5 className="text-[13px] font-bold text-gray-800">{operator.name}</h5>
            <div className="flex items-center bg-green-600 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm">
              {operator.rating || '4.2'} <Star size={10} className="fill-white ml-0.5" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 group/item">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                <Mail size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Support Email</span>
                <span className="text-[11px] text-gray-600 font-semibold truncate max-w-[160px]">{operator.contactEmail}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group/item">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-500 group-hover/item:bg-green-600 group-hover/item:text-white transition-colors">
                <Phone size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Emergency Contact</span>
                <span className="text-[11px] text-gray-600 font-semibold">{operator.contactPhone}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 group/item">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover/item:bg-purple-600 group-hover/item:text-white transition-colors">
                <ShieldCheck size={14} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">License Number</span>
                <span className="text-[11px] text-gray-600 font-semibold">{operator.licenseNumber}</span>
              </div>
            </div>
          </div>
          
          {operator.isActive && (
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">
                Verified Operator
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusOperatorInfo;
