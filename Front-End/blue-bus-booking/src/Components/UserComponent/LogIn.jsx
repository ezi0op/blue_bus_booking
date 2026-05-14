import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn as LogInIcon, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const LogIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email to resend the verification link.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    try {
      await axios.post(`http://localhost:8080/api/auth/resend-verification?email=${email}`);
      setResendMessage('Verification email sent! Please check your inbox.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResendMessage('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const token = response.data.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);

        // Fetch user details to get the role
        try {
          const userResponse = await axios.get(`http://localhost:8080/api/auth/user-email/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (userResponse.data.success) {
            const userData = userResponse.data.data;
            const userRole = userData.role;
            const userId = userData.id;
            
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userImage', userData.image || '');
            localStorage.setItem('loginTimestamp', Date.now().toString());
            
            // Auto-redirect based on role
            if (userRole === 'ADMIN') {
              navigate('/admin'); 
            } else {
              // Check if there's a pending booking to resume
              const pendingBooking = localStorage.getItem('pendingBooking');
              if (pendingBooking) {
                // If they have a pending booking, stay on/go to home 
                // (where the search results usually are)
                navigate('/');
              } else {
                navigate('/');
              }
            }
          }
        } catch (fetchError) {
          console.error('Error fetching user role:', fetchError);
          navigate('/'); // Proceed to home anyway
        }
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium text-sm group"
        >
          <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Landing
        </button>

        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
              {error.toLowerCase().includes('verify your email') && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {resendLoading ? (
                    <div className="w-3 h-3 border-2 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
                  ) : 'Resend Verification Link'}
                </button>
              )}
            </div>
          )}

          {resendMessage && (
            <div className="mb-4 bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3 text-green-600">
              <CheckCircle2 size={20} />
              <p className="text-sm font-medium">{resendMessage}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogInIcon className="mr-2 h-5 w-5" /> Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to Blue Bus?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-3 px-4 border border-blue-600 rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
