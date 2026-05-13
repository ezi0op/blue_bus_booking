import React, { useState } from 'react';
import axios from 'axios';
import { Tag, Sparkles, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import AvailableCoupons from './AvailableCoupons';

const Coupons = ({ bookingAmount, onApplySuccess, onRemove }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApply = async (codeToApply) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/api/coupons/apply', {
        couponCode: code.toUpperCase(),
        bookingAmount: bookingAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const data = response.data.data;
        setAppliedCoupon(data);
        setCouponCode(code.toUpperCase());
        onApplySuccess(data, code.toUpperCase());
      } else {
        setError(response.data.message || 'Invalid coupon code.');
      }
    } catch (err) {
      console.error('Coupon Error:', err);
      setError(err.response?.data?.message || 'Failed to apply coupon.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onRemove();
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <Tag size={18} />
        </div>
        <h4 className="font-bold text-gray-800">Apply Coupon</h4>
      </div>

      {!appliedCoupon ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter Code (e.g. SAVE20)"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase placeholder:normal-case"
              />
              {loading && (
                <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
              )}
            </div>
            <button
              onClick={() => handleApply()}
              disabled={loading || !couponCode.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-5 rounded-xl text-sm transition-all active:scale-95"
            >
              Apply
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-medium px-1">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-green-800 tracking-tight">{couponCode} Applied!</p>
              <p className="text-[10px] text-green-600 font-semibold">₹{appliedCoupon.discountApplied} saved on your trip</p>
            </div>
          </div>
          <button 
            onClick={handleRemove}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Coupons;
