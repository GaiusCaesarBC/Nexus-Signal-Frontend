// client/src/api/axios.js
import axios from 'axios';

// ⚠️ TEMPORARY: Force localhost for development
const USE_LOCAL = false; // Set to false for production

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
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config.url?.includes('/auth/');
            if (!isAuthEndpoint) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

console.log('API Base URL:', API.defaults.baseURL);

export default API;