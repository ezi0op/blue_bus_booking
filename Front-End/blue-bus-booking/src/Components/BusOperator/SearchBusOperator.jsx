import React, { useState } from 'react';
import axios from 'axios';
import { Search, Bus, Star, Mail, Phone, ShieldCheck, MapPin, Loader2, AlertCircle } from 'lucide-react';
import BusOperatorRoute from './BusOperatorRoute';

const SearchBusOperator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedOperatorForRoutes, setSelectedOperatorForRoutes] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await axios.get(`http://localhost:8080/api/operators/search/${searchTerm}`);
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      setError('Could not find any operators matching that name.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Search Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Search Bus Operators</h2>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">Find your favorite travel partners by name and check their ratings and contact details.</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter operator name (e.g. VRL Travels, SRS...)"
            className="block w-full pl-14 pr-32 py-5 bg-white border-2 border-gray-100 rounded-3xl text-lg font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:shadow-md transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold animate-pulse">Searching our network...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="text-center py-16 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700">No results found</h3>
            <p className="text-gray-500 mt-2">We couldn't find any operator named "{searchTerm}"</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 max-w-2xl mx-auto">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((op) => (
            <div key={op.id} className="flex bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden p-6 gap-6">
              <div className="w-20 h-20 shrink-0 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 overflow-hidden">
                {op.image ? (
                  <img src={op.image} alt={op.name} className="w-full h-full object-cover" />
                ) : (
                  <Bus size={36} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-extrabold text-gray-800">{op.name}</h3>
                  <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg text-green-700 border border-green-100">
                    <span className="text-sm font-bold">{op.rating || '4.0'}</span>
                    <Star size={14} className="fill-green-700 ml-1" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-500" />
                    <span className="text-xs text-gray-600 font-semibold truncate">{op.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-green-500" />
                    <span className="text-xs text-gray-600 font-semibold">{op.contactPhone}</span>
                  </div>
                </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <ShieldCheck size={14} className="text-blue-500" />
                      LIC: {op.licenseNumber}
                    </div>
                    <button 
                      onClick={() => setSelectedOperatorForRoutes(op)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Explore Routes →
                    </button>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* Routes Modal */}
      <BusOperatorRoute 
        operator={selectedOperatorForRoutes} 
        onClose={() => setSelectedOperatorForRoutes(null)} 
      />
    </div>
  );
};

export default SearchBusOperator;
