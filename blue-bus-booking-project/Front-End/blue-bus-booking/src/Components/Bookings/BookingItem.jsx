import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Armchair, IndianRupee, Loader2, AlertCircle } from 'lucide-react';

const BookingItem = ({ bookingId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get(`http://localhost:8080/api/booking-items/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setItems(response.data.data || []);
        } else {
          setError('Failed to fetch item details.');
        }
      } catch (err) {
        console.error('Error fetching booking items:', err);
        setError('Error loading seat details.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchItems();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 text-blue-600">
        <Loader2 className="animate-spin mr-2" size={16} />
        <span className="text-xs font-semibold">Loading detailed info...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-xs py-2">
        <AlertCircle size={14} />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between group hover:border-blue-200 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{item.passengerName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {item.passengerGender}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">• {item.passengerAge} Years</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-blue-600 font-bold mb-1">
                <Armchair size={14} />
                <span className="text-sm">Seat {item.seatNumber}</span>
              </div>
              <div className="flex items-center justify-end text-gray-900 font-black text-xs">
                <IndianRupee size={10} />
                {item.price}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <p className="text-xs text-gray-400 italic text-center py-2">No detailed items found for this booking.</p>
      )}
    </div>
  );
};

export default BookingItem;
