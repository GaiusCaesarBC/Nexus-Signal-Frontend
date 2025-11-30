// client/src/api/axios.js
import axios from 'axios';

// Automatically detect environment and use appropriate API URL
const getBaseURL = () => {
    // If REACT_APP_API_URL is explicitly set, use it
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    
    // Otherwise, auto-detect based on hostname
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Development - use local server
        return 'http://localhost:5000/api';
    } else {
        // Production - use production API
        return 'https://api.nexussignal.ai/api';  // ✅ FIXED - Using your custom domain!
    }
};

const API = axios.create({
   baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to handle auth errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect on auth endpoints (login/register)
            const isAuthEndpoint = error.config.url?.includes('/auth/');
            if (!isAuthEndpoint) {
                console.log('401 Unauthorized - redirecting to login');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Log which API we're using (helpful for debugging)
console.log('API Base URL:', API.defaults.baseURL);

export default API;