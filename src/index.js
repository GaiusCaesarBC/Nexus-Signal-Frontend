// client/src/index.js - UPDATED WITH THEME PROVIDER

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { StripeProvider } from './context/StripeContext';
import { ThemeProvider } from './context/ThemeContext'; // ✅ ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* ✅ ADD THIS - Wrap everything in ThemeProvider */}
        <ToastProvider>
          <AuthProvider>
            <StripeProvider>
              <App />
            </StripeProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();