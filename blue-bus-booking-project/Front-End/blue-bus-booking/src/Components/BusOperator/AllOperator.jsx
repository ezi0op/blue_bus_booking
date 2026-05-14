import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Mail, Phone, ShieldCheck, MapPin, Bus, Globe, Activity, ArrowLeft } from 'lucide-react';
import Header from '../Page1/LandingComponent/Header';
import Footer from '../Page1/LandingComponent/Footer';
import SearchBusOperator from './SearchBusOperator';
import BusOperatorRoute from './BusOperatorRoute';

const AllOperator = () => {
  const navigate = useNavigate();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'search'
  const [selectedOperatorForRoutes, setSelectedOperatorForRoutes] = useState(null);

  useEffect(() => {
    fetchAllOperators();
  }, []);

  const fetchAllOperators = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/operators');
      if (res.data.success) {
        setOperators(res.data.data);
      }
    } catch (err) {
      setError('Failed to load operators');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors font-medium text-sm group w-fit"
          >
            <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </button>

          {/* Centralized Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                All Partners
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'search' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Find Partner
              </button>
            </div>
          </div>

          {activeTab === 'search' ? (
            <SearchBusOperator />
          ) : (
            <>
              {/* All Operators Grid */}
              <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Partner Bus Operators</h2>
                  <p className="text-gray-500 mt-2 font-medium">Discover our network of trusted travel partners</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                  <span className="text-blue-700 font-bold text-sm">{operators.length} Active Operators</span>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {operators.map((op) => (
                    <div key={op.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      {/* Header / Brand */}
                      <div className="p-6 pb-0">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform overflow-hidden shrink-0">
                            {op.image ? (
                              <img src={op.image} alt={op.name} className="w-full h-full object-cover" />
                            ) : (
                              <Bus size={28} />
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg text-green-700 border border-green-100 mb-1">
                              <span className="text-sm font-bold">{op.rating || '4.5'}</span>
                              <Star size={14} className="fill-green-700 ml-1" />
                            </div>
                            {op.isActive && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                <ShieldCheck size={12} /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{op.name}</h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-tighter mb-4">
                          <Globe size={12} /> National Carrier
                        </div>
                      </div>

                      {/* Info Body */}
                      <div className="px-6 py-4 bg-gray-50/50 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors border border-gray-100">
                            <Mail size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Support Email</span>
                            <span className="text-sm text-gray-600 font-semibold truncate max-w-[180px]">{op.contactEmail}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors border border-gray-100">
                            <Phone size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Contact Center</span>
                            <span className="text-sm text-gray-600 font-semibold">{op.contactPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">License No</span>
                          <span className="text-xs text-gray-500 font-bold">{op.licenseNumber}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedOperatorForRoutes(op)}
                          className="bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-600 font-bold text-xs py-2 px-4 rounded-xl transition-all duration-200"
                        >
                          View Fleet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Routes Modal */}
      <BusOperatorRoute 
        operator={selectedOperatorForRoutes} 
        onClose={() => setSelectedOperatorForRoutes(null)} 
      />

      <Footer />
    </div>
  );
};

export default AllOperator;
