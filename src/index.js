// client/src/index.js - CORRECT ORDER - ToastProvider OUTSIDE AuthProvider

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider> {/* ✅ TOAST MUST BE OUTSIDE - AuthContext needs it! */}
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);