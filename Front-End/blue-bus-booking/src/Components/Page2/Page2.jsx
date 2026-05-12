import React, { useState, useEffect } from 'react'
import axios from 'axios'
import RouteCard from './RouteCard/RouteCard'
import { ArrowRight } from 'lucide-react'
import ExploreRoute from './RouteCard/ExploreRoute'

const Page2 = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedRouteForExplore, setSelectedRouteForExplore] = useState(null)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/routes')
        setRoutes(response.data.data || [])
      } catch (err) {
        console.error('Error fetching routes:', err)
        setError('Failed to load popular routes.')
      } finally {
        setLoading(false)
      }
    }
    fetchRoutes()
  }, [])

  // Auto-slide effect every 10 seconds
  useEffect(() => {
    if (routes.length <= 4) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 4 >= routes.length ? 0 : prev + 4));
    }, 10000);

    return () => clearInterval(interval);
  }, [routes]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 4 >= routes.length ? 0 : prev + 4));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 4 < 0 ? Math.max(0, routes.length - (routes.length % 4 || 4)) : prev - 4));
  };

  return (
    <section className="bg-white py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Trending Now
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">Popular Routes</h2>
            <p className="text-gray-400 font-medium max-w-xl">
              Discover our most traveled bus routes. Experience comfort and safety on every journey.
            </p>
          </div>
          
          {/* Navigation Controls */}
          {routes.length > 4 && (
            <div className="flex gap-3">
              <button onClick={handlePrev} className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <button onClick={handleNext} className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 text-center py-6 px-8 rounded-[2rem] border border-red-100 max-w-2xl mx-auto font-bold">
            {error}
          </div>
        ) : routes.length === 0 ? (
          <div className="text-center text-gray-400 py-10 font-medium italic">
            No routes available at the moment.
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ease-in-out">
              {routes.slice(currentIndex, currentIndex + 4).map((route, idx) => (
                <div key={route.id} className="animate-in fade-in slide-in-from-right-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                  <RouteCard 
                    route={route} 
                    onExplore={() => setSelectedRouteForExplore(route)} 
                  />
                </div>
              ))}
            </div>

            {/* Explore Route Modal */}
            {selectedRouteForExplore && (
              <ExploreRoute
                route={selectedRouteForExplore}
                isOpen={!!selectedRouteForExplore}
                onClose={() => setSelectedRouteForExplore(null)}
              />
            )}

            {/* Pagination Dots */}
            {routes.length > 4 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: Math.ceil(routes.length / 4) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i * 4)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${Math.floor(currentIndex / 4) === i ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Page2;