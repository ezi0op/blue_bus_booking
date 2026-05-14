import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Sparkles, Clock, ChevronRight, Gift } from 'lucide-react';

const AvailableCoupons = ({ onSelect, bookingAmount }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/coupons');
        if (response.data.success) {
          setCoupons(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching available coupons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailableCoupons();
  }, []);

  if (loading) return null;
  if (coupons.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {coupons.map((coupon) => {
        const isEligible = bookingAmount >= coupon.minimumBookingAmount;
        
        return (
          <div 
            key={coupon.id}
            onClick={() => isEligible && onSelect(coupon.couponCode)}
            className={`relative rounded-xl border transition-all p-4 ${
              isEligible 
                ? 'cursor-pointer border-slate-100 bg-white hover:border-blue-500 hover:shadow-md' 
                : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex flex-col h-full justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black text-blue-600 tracking-tight bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{coupon.couponCode}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">₹{coupon.discountAmount} OFF</span>
                </div>
                <p className="text-xs font-bold text-slate-700 line-clamp-2">{coupon.description}</p>
                
                {!isEligible && (
                  <p className="text-[9px] font-bold text-rose-500 uppercase mt-1">Min. ₹{coupon.minimumBookingAmount}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                 {coupon.expiryDate ? (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <Clock size={10} />
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </div>
                ) : <div></div>}
                
                {isEligible && (
                  <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest">
                    Tap to Copy
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailableCoupons;
