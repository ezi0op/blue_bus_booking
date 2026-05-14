import axios from 'axios';

// 🌍 API Base URL - Intelligent Environment Detection
// 1. Uses VITE_API_URL if set (Vercel/Production)
// 2. Otherwise defaults to localhost for dev or duckdns for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'development' 
    ? 'http://localhost:8080' 
    : 'https://bluebusbooking.duckdns.org');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔒 Request Interceptor: Automatically add JWT Token to all protected requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🛡️ Response Interceptor: Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired. Redirecting to login...');
      // localStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
