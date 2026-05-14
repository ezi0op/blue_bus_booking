import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../../api/axiosConfig'
import BusOperatorInfo from '../../BusOperator/BusOperatorInfo'
import StopMap from '../../Page2/StopMap/StopMap'
import Page2 from '../../Page2/Page2'
import SeatLayout from '../../Page2/SeatLayout/SeatLayout'
import middleImg from '../../../assets/middle.png'
import TripResultCard from '../../Page2/TripResultCard'
import { MapPin, ArrowLeftRight, Search, Calendar, CalendarDays, Ticket, ShieldCheck, Bus, Armchair, Sofa, Zap, Clock, Map as MapIcon, ChevronDown, ChevronUp, MapPin as StopIcon } from 'lucide-react';

const Middle = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  // Restore search results and seat selection after login
  useEffect(() => {
    const lastSearch = localStorage.getItem('lastSearch');
    const pending = localStorage.getItem('pendingBooking');

    if (lastSearch) {
      const { from: savedFrom, to: savedTo, date: savedDate } = JSON.parse(lastSearch);
      setFrom(savedFrom);
      setTo(savedTo);
      setDate(savedDate);

      // If we have a pending booking or just a selected trip, we must re-trigger the search to show results
      if (pending || localStorage.getItem('lastSelectedTripId')) {
        const performRestore = async () => {
          setLoading(true);
          try {
            const response = await api.post('/api/trips/search', {
              source: savedFrom,
              destination: savedTo,
              date: savedDate
            });
            setSearchResults(response.data.data || []);
            
            const savedTripId = localStorage.getItem('lastSelectedTripId');
            if (savedTripId) {
              setSelectedTripId(Number(savedTripId));
            } else if (pending) {
              const { tripId } = JSON.parse(pending);
              setSelectedTripId(Number(tripId));
            }
          } catch (err) {
            console.error('Error restoring search:', err);
          } finally {
            setLoading(false);
          }
        };
        performRestore();
      }
    }
  }, []);

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [expandedStopsTripId, setExpandedStopsTripId] = useState(null)
  const [stopsData, setStopsData] = useState({}) // Cache stops by routeId
  const [loadingStops, setLoadingStops] = useState(false)
  const [stopViewMode, setStopViewMode] = useState('list') // 'list' or 'map'

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = async () => {
    if (!from || !to || !date) {
      setError('Please select From, To and Date')
      return
    }

    setLoading(true)
    setError(null)
    setSelectedTripId(null)

    try {
      // Save search params to restore after login if needed
      localStorage.setItem('lastSearch', JSON.stringify({ from, to, date }));

      // Search for specific TRIPS
      const response = await api.post('/api/trips/search', {
        source: from,
        destination: to,
        date: date
      })
      setSearchResults(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search. Please try again.')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const toggleStops = async (trip) => {
    if (expandedStopsTripId === trip.id) {
      setExpandedStopsTripId(null);
      return;
    }

    const routeId = trip.route?.id || trip.routeId;
    if (!routeId) return;

    setExpandedStopsTripId(trip.id);

    if (!stopsData[routeId]) {
      try {
        setLoadingStops(true);
        const res = await api.get(`/api/stops/route/${routeId}`);
        if (res.data.success) {
          setStopsData(prev => ({ ...prev, [routeId]: res.data.data }));
        }
      } catch (err) {
        // Silently fail for stops
      } finally {
        setLoadingStops(false);
      }
    }
  };

  return (
    <main>
      {/* ── Hero Section (Hidden when searching) ── */}
      {searchResults === null && !error && (
        <section id="home" className="relative w-full h-[calc(100vh-80px)] min-h-[600px]">
          <img src={middleImg} alt="Blue Bus Hero" className="absolute inset-0 w-full h-full object-cover object-[75%_center]" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(13,38,148,0.95) 0%, rgba(13,38,148,0.7) 35%, rgba(13,38,148,0) 65%, transparent 100%)' }}></div>

          <div className="relative z-10 flex flex-col justify-center md:justify-center h-full px-6 md:px-16 lg:px-24 pt-20 md:pb-24">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-[10px] md:text-sm font-medium px-4 py-1.5 rounded-full mb-4 md:mb-6 w-fit">
              <Bus size={14} />
              <span>Smart Booking, Happy Journey</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl max-w-[280px] md:max-w-[520px]">
              Your Journey<br />Starts Here
            </h1>

            <p className="text-white/80 text-sm md:text-lg font-medium leading-relaxed mb-10 drop-shadow-lg max-w-[260px] md:max-w-[420px]">
              Book bus tickets easily and travel comfortably across the country.
            </p>

            {/* Features - Hidden on very small mobiles to keep it clean */}
            <div className="hidden sm:flex flex-wrap gap-6 md:gap-8">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 rounded-xl flex-shrink-0 backdrop-blur-md">
                  <Ticket size={20} className="text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-bold text-sm">Easy Booking</p>
                  <p className="text-white/60 text-[10px] mt-0.5">Book in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 rounded-xl flex-shrink-0 backdrop-blur-md">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-bold text-sm">Safe Travel</p>
                  <p className="text-white/60 text-[10px] mt-0.5">Priority safety</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Search Bar Section ── */}
      {searchResults === null && !error && (
        <div className="relative z-20 flex justify-center w-full px-4 md:px-8 mt-[-2rem] md:-mt-40 mb-16 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_20px_70px_rgba(0,0,0,0.1)] p-6 md:p-8 border border-gray-50">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-2 w-full">
              {/* From Column */}
              <div className="flex-1 flex flex-col gap-1 w-full relative">
                <label className="text-sm font-semibold text-gray-600">From</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input type="text" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Starting City" className="w-full uppercase border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all" />
                </div>
              </div>

              {/* Swap Button (Mobile: Between, Desktop: Between) */}
              <div className="flex items-center justify-center z-30 -my-3 md:my-0 md:-mx-3">
                <button 
                  onClick={handleSwap} 
                  type="button" 
                  className="bg-white border border-gray-200 p-3 rounded-full shadow-md hover:shadow-lg hover:border-blue-400 hover:text-blue-600 transition-all active:scale-90 flex items-center justify-center group"
                >
                  <ArrowLeftRight size={16} className="rotate-90 md:rotate-0 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* To Column */}
              <div className="flex-1 flex flex-col gap-1 w-full relative">
                <label className="text-sm font-semibold text-gray-600">To</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination City" className="w-full uppercase border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all" />
                </div>
              </div>

              {/* Date Column */}
              <div className="flex-1 flex flex-col gap-1 w-full">
                <label className="text-sm font-semibold text-gray-600">Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-700 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all" />
                </div>
              </div>

              <button onClick={handleSearch} disabled={loading} className="w-full md:w-auto h-[54px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[15px] px-10 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 disabled:bg-blue-400">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : null}
                {loading ? 'Searching...' : 'Search Buses'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Results Section ── */}
      {(searchResults !== null || error) && (
        <section className="bg-gray-50 py-10 px-4 min-h-[400px]">
          <div className="max-w-5xl mx-auto">
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center mb-6">{error}</div>}

            {/* Bus Trip Results UI */}
            {searchResults !== null && !error && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-800">{searchResults.length} Buses found for your route</h3>
                  <button onClick={() => { setSearchResults(null); setError(null); }} className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">← Modify Search</button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-100">
                    <Bus size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-lg">No buses found matching your request.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {searchResults.map((trip) => (
                      <React.Fragment key={trip.id}>
                        <TripResultCard 
                          trip={trip} 
                          isSelected={selectedTripId === trip.id} 
                          onToggleSeats={() => {
                            const nextId = selectedTripId === trip.id ? null : trip.id;
                            setSelectedTripId(nextId);
                            if (nextId) localStorage.setItem('lastSelectedTripId', nextId);
                            else localStorage.removeItem('lastSelectedTripId');
                          }} 
                          isStopsExpanded={expandedStopsTripId === trip.id} 
                          onToggleStops={() => toggleStops(trip)} 
                        />
                        {expandedStopsTripId === trip.id && (
                          <div className="mt-[-1rem] bg-slate-50 p-6 pt-10 rounded-b-2xl border-x border-b border-gray-100 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2"><MapIcon size={18} className="text-blue-600" /><h5 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest">Route Itinerary</h5></div>
                              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                                <button onClick={() => setStopViewMode('list')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${stopViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>List View</button>
                                <button onClick={() => setStopViewMode('map')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${stopViewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Map View</button>
                              </div>
                            </div>
                            {stopViewMode === 'map' ? <div className="h-[350px]"><StopMap stops={stopsData[trip.route?.id || trip.routeId] || []} /></div> : 
                            <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-200">
                              {(stopsData[trip.route?.id || trip.routeId] || []).map((stop) => (
                                <div key={stop.id} className="relative flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100"><div className="absolute -left-[27px] w-[12px] h-[12px] rounded-full bg-white border-2 border-blue-600 z-10"></div><div><p className="text-sm font-bold text-gray-800">{stop.name}</p></div><div className="flex gap-4"><div><p className="text-[9px] text-gray-400 font-bold uppercase">Arr</p><p className="text-xs font-bold text-blue-600">{stop.arrivalTime}</p></div><div><p className="text-[9px] text-gray-400 font-bold uppercase">Dep</p><p className="text-xs font-bold text-green-600">{stop.departureTime}</p></div></div></div>
                              ))}
                            </div>}
                          </div>
                        )}
                        {selectedTripId === trip.id && <div className="mt-[-1rem]"><SeatLayout tripId={trip.id} price={trip.price} onClose={() => setSelectedTripId(null)} /></div>}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Popular Content Section ── */}
      {searchResults === null && !error && (
        <>
          <Page2 />
          <BusOperatorInfo />
        </>
      )}
    </main>
  )
}

export default Middle
