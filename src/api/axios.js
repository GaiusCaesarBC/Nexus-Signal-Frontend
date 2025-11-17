// client/src/api/axios.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'https://api.nexussignal.ai/api', // ✅ Hardcoded
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default API;