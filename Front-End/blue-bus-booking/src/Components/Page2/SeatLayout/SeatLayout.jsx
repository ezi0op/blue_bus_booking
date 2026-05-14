import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sofa, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CreateBookings from '../../Bookings/CreateBookings';
import SeatPreference from '../SeatPreference/SeatPreference';

const SeatLayout = ({ tripId, price, onClose }) => {
  const navigate = useNavigate();
  const [layout, setLayout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [maxSeatError, setMaxSeatError] = useState(false);
  const [step, setStep] = useState('SEATS'); // 'SEATS' or 'BOOKING'
  const [userPref, setUserPref] = useState(null);
  const isLoggedIn = !!localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/seat-availability/layout/trip/${tripId}`);
        setLayout(response.data.data || []);
      } catch (err) {
        setError('Failed to load seat layout.');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchLayout();
      
      // Restore pending seats if they belong to this trip
      const pending = localStorage.getItem('pendingBooking');
      if (pending) {
        try {
          const { tripId: pendingTripId, selectedSeats: pendingSeats } = JSON.parse(pending);
          if (Number(pendingTripId) === Number(tripId) && Array.isArray(pendingSeats)) {
            setSelectedSeats(pendingSeats);
            
            // If there's a saved form, jump straight to the booking step
            const savedForm = localStorage.getItem(`bookingForm_${tripId}`);
            if (savedForm) {
              setStep('BOOKING');
            }
          }
        } catch (e) {
          // Silent error for parsing
        }
      }
    }
  }, [tripId]);

  useEffect(() => {
    const fetchUserPreference = async () => {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/seat-preference/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setUserPref(res.data.data);
      } catch (err) {
        // Silent error for preference
      }
    };
    fetchUserPreference();
  }, [userId]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;
    const isAlreadySelected = selectedSeats.find(s => s.seatNumber === seat.seatNumber);

    let newSelection;
    if (isAlreadySelected) {
      newSelection = selectedSeats.filter(s => s.seatNumber !== seat.seatNumber);
      setMaxSeatError(false);
    } else {
      // Limit to max 6 seats per booking
      if (selectedSeats.length >= 6) {
        setMaxSeatError(true);
        return;
      }
      const id = seat.seatId || seat.id || seat.availabilityId || (seat.seat && seat.seat.id);
      newSelection = [...selectedSeats, { seatId: id, seatNumber: seat.seatNumber }];
      setMaxSeatError(false);
    }
    
    setSelectedSeats(newSelection);
    
    // Save selection immediately so it survives navigation to /offers
    if (newSelection.length > 0) {
      localStorage.setItem('pendingBooking', JSON.stringify({
        tripId,
        selectedSeats: newSelection
      }));
    } else {
      localStorage.removeItem('pendingBooking');
    }
  };

  const handleProceed = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Save pending booking state so it can be resumed after login
      localStorage.setItem('pendingBooking', JSON.stringify({
        tripId,
        selectedSeats
      }));
      navigate('/login');
      return;
    }

    // Critical Check: Ensure all selected seats have IDs
    const missingId = selectedSeats.find(s => !s.seatId);
    if (missingId) {
      setError(`Critical Error: Seat ${missingId.seatNumber} has no internal ID. Please contact support or refresh the page.`);
      return;
    }

    setStep('BOOKING');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-50 rounded-b-2xl border-t border-gray-100">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 text-center text-red-500 rounded-b-2xl border-t border-gray-100">
        {error}
      </div>
    );
  }

  if (step === 'BOOKING') {
    return (
      <div className="relative animate-in fade-in slide-in-from-top-4 duration-300">
        <CreateBookings 
          tripId={tripId} 
          price={price} 
          selectedSeats={selectedSeats} 
          onBack={() => setStep('SEATS')} 
          onRemoveSeat={(seatNumber) => {
            const updated = selectedSeats.filter(s => s.seatNumber !== seatNumber);
            setSelectedSeats(updated);
            if (updated.length === 0) setStep('SEATS');
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-t border-gray-100 rounded-b-2xl p-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <X size={20} />
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Layout Side */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
          <div className="border-[3px] border-gray-300 rounded-[3rem] p-4 md:p-8 pb-12 bg-gray-50 relative w-fit max-w-full overflow-hidden shadow-inner">
            
            {/* Driver section (Front of bus) */}
            <div className="w-full flex justify-end mb-8 border-b-2 border-dashed border-gray-300 pb-4">
               <div className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center bg-gray-200">
                  <span className="text-[10px] font-bold text-gray-500">Wheel</span>
               </div>
            </div>
          
            {/* Split layout into Lower and Upper if they exist */}
            {(() => {
              if (!layout || layout.length === 0) return null;

              const flattened = layout.flat();
              const hasUpper = flattened.some(s => s && s.seatNumber && s.seatNumber.startsWith('U'));
              const hasLower = flattened.some(s => s && s.seatNumber && s.seatNumber.startsWith('L'));
              const isSleeperBus = hasUpper || hasLower;

              const renderSeat = (seat) => {
                const isSelected = Array.isArray(selectedSeats) && selectedSeats.some(s => s && s.seatNumber === seat.seatNumber);
                const isRecommended = userPref && !seat.isBooked && 
                  (seat.seatType === userPref.preferredSeatType || seat.deckType === userPref.preferredDeckType);
                
                const isSleeper = seat.seatType === 'SLEEPER';

                return (
                  <button
                    key={seat.seatNumber}
                    disabled={seat.isBooked}
                    onClick={() => toggleSeat(seat)}
                    title={`Seat ${seat.seatNumber} (${seat.seatType || 'SEATER'})`}
                    className={`
                      ${isSleeper ? 'w-10 h-16' : 'w-10 h-10'} 
                      rounded-md flex flex-col items-center justify-center transition-all duration-300 shadow-sm relative group shrink-0
                      ${seat.isBooked 
                        ? 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60' 
                        : isSelected 
                          ? 'bg-blue-600 border-2 border-blue-700 shadow-blue-200/50 scale-105 z-10' 
                          : 'bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'}
                    `}
                  >
                    {isSleeper ? (
                       <div className={`w-full h-full flex flex-col items-center justify-between p-1.5 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                          <div className={`w-full h-2 rounded-sm ${seat.isBooked ? 'bg-gray-300' : isSelected ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                          <span className="text-[9px] font-bold">{seat.seatNumber}</span>
                          <div className={`w-3 h-1.5 rounded-full ${seat.isBooked ? 'bg-gray-300' : isSelected ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center">
                          <Sofa size={16} className={seat.isBooked ? 'text-gray-300' : isSelected ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'} />
                          <span className={`text-[8px] font-bold mt-1 ${isSelected ? 'text-white' : 'text-gray-500'}`}>{seat.seatNumber}</span>
                       </div>
                    )}
                    
                    {isRecommended && (
                      <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-white rounded-full p-1 shadow-sm animate-pulse z-20">
                        <Sparkles size={8} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              };

              const renderDeckRow = (rowSeats, deckPrefix) => {
                let deckSeats;
                if (isSleeperBus) {
                  deckSeats = rowSeats.filter(s => s && s.seatNumber && s.seatNumber.startsWith(deckPrefix));
                } else {
                  // For Seater buses, we render everything in the "Lower" pass
                  deckSeats = deckPrefix === 'L' ? rowSeats : [];
                }
                
                if (deckSeats.length === 0) return null; 

                return (
                  <div className="flex gap-1 justify-start w-max">
                    {deckSeats.map((seat, idx) => (
                      <React.Fragment key={seat.seatNumber}>
                        {/* Intelligent Aisle Placement: gap before the 3rd seat (if >=3 seats) or based on data */}
                        {((deckSeats.length === 3 && idx === 1) || (deckSeats.length >= 4 && idx === 2) || (deckSeats.length === 5 && idx === 2)) && (
                          <div className="w-4 shrink-0"></div>
                        )}
                        {renderSeat(seat)}
                      </React.Fragment>
                    ))}
                  </div>
                );
              };

              return (
                <div className="w-full overflow-x-auto pb-4">
                   <div className="flex flex-row justify-center gap-4 sm:gap-8 py-4 min-w-max px-2">
                      {/* Lower Deck Column */}
                      <div className="flex flex-col items-center w-max">
                         <div className="mb-4 px-4 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 shadow-sm">
                            {isSleeperBus ? 'Lower Deck' : 'Bus Layout'}
                         </div>
                         <div className="flex flex-col gap-1.5 items-start w-full">
                            {layout.map((row, i) => {
                               const rowContent = renderDeckRow(row, 'L');
                               return rowContent ? (
                                 <div key={`L-${i}`} className="flex items-center">
                                    {rowContent}
                                 </div>
                               ) : null;
                            })}
                         </div>
                      </div>

                      {/* Upper Deck Column */}
                      {isSleeperBus && hasUpper && (
                         <div className="flex flex-col items-center border-l-2 border-dashed border-gray-200 pl-4 sm:pl-8 w-max">
                            <div className="mb-4 px-4 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 shadow-sm">
                               Upper Deck
                            </div>
                            <div className="flex flex-col gap-1.5 items-start w-full">
                               {layout.map((row, i) => {
                                 const rowContent = renderDeckRow(row, 'U');
                                 return rowContent ? (
                                   <div key={`U-${i}`} className="flex items-center">
                                      {rowContent}
                                   </div>
                                 ) : null;
                               })}
                            </div>
                         </div>
                      )}
                   </div>
                </div>
              );
            })()}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-8 pt-6 border-t border-gray-100 w-full justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
              <span className="text-xs text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm"></div>
              <span className="text-xs text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span className="text-xs text-gray-600">Selected</span>
            </div>
          </div>
        </div>

        {/* Summary Side */}
        <div className="w-full md:w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Booking Summary</h4>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Selected Seats:</p>
            {selectedSeats.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(s => (
                  <div key={s.seatNumber} className="group relative">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1.5 pr-8 rounded-lg text-sm font-bold border border-blue-100 flex items-center shadow-sm">
                      {s.seatNumber}
                    </span>
                    <button 
                      onClick={() => setSelectedSeats(selectedSeats.filter(item => item.seatNumber !== s.seatNumber))}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      title="Remove Seat"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No seats selected yet.</p>
            )}
            {maxSeatError && (
              <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 p-2 rounded-md border border-red-100">
                You can select up to 6 seats maximum.
              </p>
            )}
          </div>

          {selectedSeats.length > 0 && (
            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-gray-800">
                <span className="font-semibold text-sm">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">₹{selectedSeats.length * price}</span>
              </div>
            </div>
          )}

          <button 
            disabled={selectedSeats.length === 0}
            onClick={handleProceed}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              selectedSeats.length > 0 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoggedIn ? 'Confirm & Book' : 'Login to Book'}
          </button>

          {isLoggedIn && userId && (
            <div className="mt-6">
              <SeatPreference userId={userId} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SeatLayout;
