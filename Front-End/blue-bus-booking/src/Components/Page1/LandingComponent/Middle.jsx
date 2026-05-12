import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import BusOperatorInfo from '../../BusOperator/BusOperatorInfo'
import StopMap from '../../Page2/StopMap/StopMap'
import Page2 from '../../Page2/Page2'
import SeatLayout from '../../Page2/SeatLayout/SeatLayout'
import middleImg from '../../../assets/middle.png'
import TripResultCard from '../../Page2/TripResultCard'
import { Bus, Ticket, Armchair, ShieldCheck, Sofa, Zap, MapPin, CalendarDays, Search, Clock, Map as MapIcon, ChevronDown, ChevronUp, MapPin as StopIcon } from 'lucide-react'

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

  const handleSearch = async () => {
    if (!from || !to || !date) {
      alert('Please select From, To, and Date')
      return
    }

    setLoading(true)
    setError(null)
    setSelectedTripId(null)

    try {
      const response = await axios.post('http://localhost:8080/api/trips/search', {
        source: from,
        destination: to,
        date: date
      })

      setSearchResults(response.data.data || [])
    } catch (err) {
      console.error('Search error:', err)
      setError(err.response?.data?.message || 'Failed to search for buses. Please try again.')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const toggleStops = async (trip) => {
    console.log('Toggling stops for trip:', trip);
    
    if (expandedStopsTripId === trip.id) {
      setExpandedStopsTripId(null);
      return;
    }

    const routeId = trip.route?.id || trip.routeId;
    console.log('Resolved Route ID:', routeId);
    
    if (!routeId) {
      alert('Route information not available for this trip.');
      return;
    }

    setExpandedStopsTripId(trip.id);

    // Fetch if not already in cache
    if (!stopsData[routeId]) {
      try {
        setLoadingStops(true);
        const res = await axios.get(`http://localhost:8080/api/stops/route/${routeId}`);
        console.log('Stops API Response:', res.data);
        if (res.data.success) {
          setStopsData(prev => ({ ...prev, [routeId]: res.data.data }));
        }
      } catch (err) {
        console.error('Error fetching stops:', err);
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

          {/* Background image — full */}
          <img
            src={middleImg}
            alt="Blue Bus Hero"
            className="absolute inset-0 w-full h-full object-cover object-[75%_center]"
          />

          {/* Gradient overlay to match the mockup's dark blue left side */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(13,38,148,0.95) 0%, rgba(13,38,148,0.7) 35%, rgba(13,38,148,0) 65%, transparent 100%)' }}
          ></div>

          {/* Content — left aligned, with subtle backdrop for readability */}
          <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24 pb-24">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 w-fit">
              <Bus size={16} />
              <span>Smart Booking, Happy Journey</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-xl" style={{ maxWidth: '520px' }}>
              Your Journey<br />Starts Here
            </h1>

            {/* Subtitle */}
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-10 drop-shadow-lg" style={{ maxWidth: '420px' }}>
              Book bus tickets easily and travel comfortably<br />across the country with BlueBus.
            </p>

            {/* Feature icons */}
            <div className="flex flex-wrap gap-8">

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white/15 border border-white/25 rounded-lg flex-shrink-0 shadow-lg backdrop-blur-md">
                  <Ticket size={20} className="text-white" />
                </div>
                <div className="drop-shadow-md">
                  <p className="text-white font-bold text-sm">Easy Booking</p>
                  <p className="text-white/80 text-xs leading-snug mt-0.5">Book in just<br />a few clicks</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white/15 border border-white/25 rounded-lg flex-shrink-0 shadow-lg backdrop-blur-md">
                  <Armchair size={20} className="text-white" />
                </div>
                <div className="drop-shadow-md">
                  <p className="text-white font-bold text-sm">Comfortable Seats</p>
                  <p className="text-white/80 text-xs leading-snug mt-0.5">Travel in comfort<br />and style</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-white/15 border border-white/25 rounded-lg flex-shrink-0 shadow-lg backdrop-blur-md">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div className="drop-shadow-md">
                  <p className="text-white font-bold text-sm">Safe &amp; Secure</p>
                  <p className="text-white/80 text-xs leading-snug mt-0.5">Your safety is<br />our priority</p>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ── Floating Search Bar Card (Hidden when search results are active) ── */}
      {searchResults === null && !error && (
        <div className={`relative z-20 flex justify-center w-full px-4 md:px-8 -mt-40 mb-10`}>
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-6">
            <div className="flex flex-col md:flex-row items-end gap-4">

              {/* From */}
              <div className="flex-1 flex flex-col gap-1 w-full">
                <label className="text-sm font-semibold text-gray-600">From</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Starting City"
                    className="w-full uppercase border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* To */}
              <div className="flex-1 flex flex-col gap-1 w-full">
                <label className="text-sm font-semibold text-gray-600">To</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Destination City"
                    className="w-full uppercase border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="flex-1 flex flex-col gap-1 w-full">
                <label className="text-sm font-semibold text-gray-600">Date</label>
                <div className="relative">
                  <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full uppercase border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                className="w-full md:w-auto flex items-center justify-center bg-[#1d4ed8] hover:bg-blue-800 active:scale-95 text-white font-bold text-[15px] px-10 py-3.5 rounded-lg shadow transition-all duration-200 disabled:bg-blue-400"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                {loading ? 'Searching...' : 'Search Buses'}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ── Search Results Section ── */}
      {(searchResults !== null || error) && (
        <section className="bg-gray-50 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center mb-6">
                {error}
              </div>
            )}

            {searchResults !== null && !error && (
              <div className="space-y-6">

                {/* Header & Modify Search Button */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {searchResults.length} Buses found from <span className="uppercase">{from}</span> to <span className="uppercase">{to}</span> on {date}
                  </h3>
                  <button
                    onClick={() => {
                      setSearchResults(null);
                      setError(null);
                      setSelectedTripId(null);
                    }}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    ← Modify Search
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-100">
                    <Bus size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-lg">No buses found for this route on the selected date.</p>
                    <p className="text-sm mt-1">Try changing the date or selecting different cities.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {searchResults.map((trip) => (
                      <React.Fragment key={trip.id}>
                        <TripResultCard
                          trip={trip}
                          from={from}
                          to={to}
                          isSelected={selectedTripId === trip.id}
                          onToggleSeats={() => setSelectedTripId(selectedTripId === trip.id ? null : trip.id)}
                          isStopsExpanded={expandedStopsTripId === trip.id}
                          onToggleStops={() => toggleStops(trip)}
                        />

                        {/* Render Stops below the card if expanded */}
                        {expandedStopsTripId === trip.id && (
                          <div className="mt-[-1rem] bg-slate-50 p-6 pt-10 rounded-b-2xl border-x border-b border-gray-100 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                <MapIcon size={18} className="text-blue-600" />
                                <h5 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest">Route Itinerary</h5>
                              </div>
                                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                                  <button 
                                    onClick={() => setStopViewMode('list')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${stopViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    <Ticket size={12} /> List
                                  </button>
                                  <button 
                                    onClick={() => setStopViewMode('map')}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${stopViewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                  >
                                    <MapIcon size={12} /> Map
                                  </button>
                                </div>
                              </div>

                              {stopViewMode === 'map' ? (
                                <div className="animate-in fade-in zoom-in-95 duration-500">
                                  <StopMap stops={stopsData[trip.route?.id || trip.routeId] || []} />
                                </div>
                              ) : (
                                <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-200">
                                   {(stopsData[trip.route?.id || trip.routeId] || []).map((stop, idx) => (
                                     <div key={stop.id} className="relative flex flex-col md:flex-row md:items-center justify-between gap-2 group animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                       {/* Timeline Dot */}
                                       <div className="absolute -left-[27px] top-1 w-[12px] h-[12px] rounded-full bg-white border-2 border-blue-600 z-10 group-hover:scale-125 transition-transform"></div>
                                       
                                       <div>
                                         <p className="text-sm font-bold text-gray-800">{stop.name}</p>
                                         <p className="text-[10px] text-gray-400 font-semibold uppercase">Seq: {stop.sequenceOrder}</p>
                                       </div>

                                       <div className="flex gap-4">
                                         <div className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                           <p className="text-[9px] text-gray-400 font-bold uppercase">Arr</p>
                                           <p className="text-xs font-bold text-blue-600">{stop.arrivalTime || '--:--'}</p>
                                         </div>
                                         <div className="bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                           <p className="text-[9px] text-gray-400 font-bold uppercase">Dep</p>
                                           <p className="text-xs font-bold text-green-600">{stop.departureTime || '--:--'}</p>
                                         </div>
                                       </div>
                                     </div>
                                   ))}
                                   {!loadingStops && (!stopsData[trip.route?.id || trip.routeId] || stopsData[trip.route?.id || trip.routeId].length === 0) && (
                                     <p className="text-xs text-gray-400 italic">No stops information available for this route.</p>
                                   )}
                                  </div>
                                )}
                            </div>
                          )}

                        {/* Render Seat Layout below the card if selected */}
                        {selectedTripId === trip.id && (
                          <div className="mt-[-1rem] relative z-0">
                            <SeatLayout
                              tripId={trip.id}
                              price={trip.price}
                              onClose={() => setSelectedTripId(null)}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Popular Routes Section ── */}
      {searchResults === null && !error && (
        <Page2 />
      )}
    </main>
  )
}

export default Middle

