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
    <div className="mt-4 space-y-4">
      {coupons.map((coupon) => {
        const isEligible = bookingAmount >= coupon.minimumBookingAmount;
        
        return (
          <div 
            key={coupon.id}
            onClick={() => isEligible && onSelect(coupon.couponCode)}
            className={`relative rounded-2xl border transition-all p-5 ${
              isEligible 
                ? 'cursor-pointer border-slate-100 bg-white hover:border-blue-500 hover:shadow-sm' 
                : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-base font-black text-blue-600 tracking-tight">{coupon.couponCode}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">₹{coupon.discountAmount} OFF</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{coupon.description}</p>
                
                {!isEligible && (
                  <p className="text-[10px] font-bold text-rose-500 uppercase mt-2">Requires min. booking of ₹{coupon.minimumBookingAmount}</p>
                )}
                
                {coupon.expiryDate && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Clock size={12} />
                    Valid till {new Date(coupon.expiryDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {isEligible && (
                <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                  Tap to Copy
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AvailableCoupons;
