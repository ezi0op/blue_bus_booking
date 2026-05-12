import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Phone, Calendar, ArrowLeft, Ticket, CreditCard, ChevronRight, AlertCircle, CheckCircle2, Tag, X } from 'lucide-react';
import Coupons from './Coupons';
import { handlePayment } from '../Payments/Payments';
import PaymentMethods from '../Payments/PaymentMethods';

const CreateBookings = ({ tripId, price, selectedSeats, onBack, onRemoveSeat }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const baseAmount = (price || 0) * (selectedSeats?.length || 0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(baseAmount);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');

  const [contactInfo, setContactInfo] = useState({
    contactEmail: localStorage.getItem('userEmail') || '',
    contactPhone: ''
  });

  const [passengerData, setPassengerData] = useState([]);

  useEffect(() => {
    setPassengerData(prev => {
      const existingMap = new Map(prev.map(p => [p.seatNumber, p]));
      return selectedSeats.map(seat => {
        if (existingMap.has(seat.seatNumber)) {
          return existingMap.get(seat.seatNumber);
        }
        return {
          seatId: seat.seatId,
          seatNumber: seat.seatNumber,
          name: '',
          age: '',
          gender: 'MALE'
        };
      });
    });
  }, [selectedSeats]);

  const handleContactChange = (e) => {
    let { name, value } = e.target;
    if (name === 'contactPhone') {
      value = value.replace(/\D/g, ''); // Ensure only numbers are typed
    }
    setContactInfo({ ...contactInfo, [name]: value });
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerData];
    updated[index][field] = value;
    setPassengerData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      navigate('/login');
      return;
    }

    // Basic Validation
    if (!contactInfo.contactEmail || !contactInfo.contactPhone) {
      setError('Please provide contact email and phone.');
      setLoading(false);
      return;
    }    const incompletePassenger = passengerData.find(p => !p.name || !p.age || !p.gender || !p.seatId);
    if (incompletePassenger) {
      setError(`Please fill all details for Seat ${incompletePassenger.seatNumber}`);
      console.error('Incomplete Passenger Data:', incompletePassenger);
      setLoading(false);
      return;
    }
    // Prepare final request payload
    const bookingRequest = {
      userId: parseInt(userId),
      tripId: parseInt(tripId),
      contactEmail: contactInfo.contactEmail,
      contactPhone: contactInfo.contactPhone,
      couponCode: appliedCouponCode || null,
      discountAmount: discountAmount || 0,
      passengers: passengerData.map(p => ({
        seatId: p.seatId,
        name: p.name,
        age: parseInt(p.age) || 0,
        gender: p.gender
      }))
    };

    console.log('Final Booking Request Payload:', bookingRequest);

    try {
      const response = await axios.post('http://localhost:8080/api/bookings', bookingRequest, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const bookingId = response.data.data.id;
        
        if (paymentMethod === 'CASH' || paymentMethod === 'UNKNOWN') {
          // Process offline payment directly
          try {
            await axios.post(`http://localhost:8080/api/payments/offline?paymentMethod=${paymentMethod}`, {
              bookingId: bookingId
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/payment-success/${bookingId}`);
          } catch (err) {
            console.error('Offline Payment Error:', err);
            setError('Failed to confirm offline payment.');
            setLoading(false);
          }
        } else {
          // 2. Initiate Razorpay Payment
          handlePayment({
            bookingId: bookingId,
            amount: finalAmount,
            userEmail: contactInfo.contactEmail,
            userPhone: contactInfo.contactPhone,
            paymentMethod: paymentMethod,
            onSuccess: (data) => {
              navigate(`/payment-success/${bookingId}`);
            },
            onError: (errorMessage) => {
              setError(errorMessage);
              setLoading(false);
            }
          });
        }
        
      } else {
        setError(response.data.message || 'Failed to create booking.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Booking Error Details:', err.response?.data);
      const detailedError = err.response?.data?.errors 
        ? err.response.data.errors.map(e => e.defaultMessage).join(', ') 
        : err.response?.data?.message;
      setError(detailedError || 'Error occurred while creating booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleCouponApply = (data, code) => {
    setDiscountAmount(data.discountApplied);
    setFinalAmount(data.finalAmount);
    setAppliedCouponCode(code);
  };

  const handleCouponRemove = () => {
    setDiscountAmount(0);
    setFinalAmount(baseAmount);
    setAppliedCouponCode('');
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-600 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
          <p className="text-gray-500 mb-6">Your tickets have been reserved. Redirecting to your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 rounded-b-2xl">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Seat Selection
        </button>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Form Section */}
          <div className="flex-1 space-y-8">
            <form id="booking-form" onSubmit={handleSubmit}>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" /> Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      required
                      value={contactInfo.contactEmail}
                      onChange={handleContactChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      required
                      maxLength="10"
                      pattern="^[6-9]\d{9}$"
                      value={contactInfo.contactPhone}
                      onChange={handleContactChange}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              </div>

              {/* Passenger Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <User size={20} className="text-blue-600" /> Passenger Information
                </h3>

                <div className="space-y-8">
                  {passengerData.map((p, index) => (
                    <div key={p.seatNumber} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative group">
                      <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                        SEAT {p.seatNumber}
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveSeat(p.seatNumber)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                        title="Remove Passenger"
                      >
                        <X size={14} />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="md:col-span-1">
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Age</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="100"
                            value={p.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Age"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              <PaymentMethods selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />

              {error && (
                <div className="mt-6 bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600 border border-red-100">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </form>
          </div>

          {/* Side Summary Section */}
          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Ticket size={18} className="text-blue-600" /> Fare Summary
              </h4>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Fare (x{selectedSeats.length})</span>
                  <span className="font-semibold text-gray-800">₹{baseAmount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span className="flex items-center gap-1"><Tag size={12} /> Coupon Discount</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Convenience Fee</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Total Pay</p>
                    <p className="text-2xl font-black text-gray-900 leading-none">₹{finalAmount}</p>
                  </div>
                  <button
                    form="booking-form"
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 disabled:bg-blue-300 flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Pay & Book <ChevronRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>

              <Coupons
                bookingAmount={baseAmount}
                onApplySuccess={handleCouponApply}
                onRemove={handleCouponRemove}
              />

              <div className="mt-8 pt-6 border-t border-gray-50 space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                  <CheckCircle2 size={12} className="text-green-500" /> Secure Payments
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                  <CheckCircle2 size={12} className="text-green-500" /> Instant Confirmation
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateBookings;
