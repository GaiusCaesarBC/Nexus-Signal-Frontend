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
        return 'https://nexus-signal.onrender.com/api';  // ✅ CHANGED THIS!
    }
};

const API = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log which API we're using (helpful for debugging)
console.log('API Base URL:', API.defaults.baseURL);

export default API;