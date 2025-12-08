// client/src/index.js - UPDATED WITH THEME & WALLET PROVIDERS

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { StripeProvider } from './context/StripeContext';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider } from './context/WalletContext';

// RainbowKit & Wagmi imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi';

// Check if WalletConnect is properly configured
const walletConnectProjectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const isWalletConnectEnabled = walletConnectProjectId &&
    walletConnectProjectId !== 'nexus-signal-default' &&
    walletConnectProjectId.length > 10;

// Suppress WalletConnect network errors in console (they're noisy when project ID is invalid)
if (!isWalletConnectEnabled) {
    console.warn('[Nexus Signal] WalletConnect disabled - invalid or missing project ID. Get one at https://cloud.walletconnect.com/');
}

// Create a React Query client with error suppression for wallet errors
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00adef',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small'
          })}
          modalSize="compact"
        >
          <BrowserRouter>
            <ThemeProvider>
              <ToastProvider>
                <AuthProvider>
                  <WalletProvider>
                    <StripeProvider>
                      <App />
                    </StripeProvider>
                  </WalletProvider>
                </AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

reportWebVitals();