// client/src/api/axios.js
import axios from 'axios';

// ⚠️ TEMPORARY: Force localhost for development
const USE_LOCAL = false // Set to false for production

// Safe localStorage access (handles private browsing, iframe restrictions, etc.)
const safeLocalStorage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage access denied:', e);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn('localStorage write denied:', e);
            return false;
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('localStorage remove denied:', e);
            return false;
        }
    }
};

const getBaseURL = () => {
    if (USE_LOCAL) {
        return 'http://localhost:5000/api';
    }

    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    } else {
        return 'https://api.nexussignal.ai/api';
    }
};

const API = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token
API.interceptors.request.use(
    (config) => {
        const token = safeLocalStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Track last redirect to prevent loops
let lastRedirectTime = 0;
const REDIRECT_DEBOUNCE_MS = 2000;

// Response interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config.url?.includes('/auth/');
            const isAlreadyOnLogin = window.location.pathname === '/login';
            const now = Date.now();

            // Prevent redirect if on auth endpoint, already on login page, or recently redirected
            if (!isAuthEndpoint && !isAlreadyOnLogin && (now - lastRedirectTime) > REDIRECT_DEBOUNCE_MS) {
                lastRedirectTime = now;
                safeLocalStorage.removeItem('token'); // Clear invalid token
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

console.log('API Base URL:', API.defaults.baseURL);

export { safeLocalStorage };
export default API;// Force rebuild Thu, Dec  4, 2025 10:27:44 PM
