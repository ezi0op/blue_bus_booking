import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail, ShieldCheck, ArrowLeft } from 'lucide-react';

const Verification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/auth/verify/${token}`);
        setStatus('success');
        const msg = response.data || '';
        if (msg.toLowerCase().includes('already verified')) {
          setMessage('Your email is already verified! Welcome back to Blue Bus.');
        } else {
          setMessage(msg || 'Your email has been verified successfully!');
        }
      } catch (err) {
        console.error('Verification Error:', err);
        setStatus('error');
        setMessage(err.response?.data?.message || err.response?.data || 'Invalid or expired verification link.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token found.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-10 text-center border border-white relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest gap-1"
        >
          <ArrowLeft size={12} /> Back to Landing
        </button>
        
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Verifying Email...</h2>
            <p className="text-gray-500">Please wait while we secure your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
              <CheckCircle2 size={56} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Verified!</h2>
              <p className="text-gray-500 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              Go to Login <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
              <XCircle size={56} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Oops!</h2>
              <p className="text-gray-500 leading-relaxed">
                {message}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-white text-gray-700 border-2 border-gray-100 font-bold py-4 rounded-2xl hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
              >
                Back to Login
              </button>
              <Link to="/" className="block text-sm text-blue-600 font-bold hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        )}

        {/* Brand Footer */}
        <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
          <ShieldCheck size={14} /> Blue Bus Secure Auth
        </div>
      </div>
    </div>
  );
};

export default Verification;
