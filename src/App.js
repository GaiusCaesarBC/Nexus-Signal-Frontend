// src/App.js - FIXED with LoadingScreen + Ready for Toast

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Component imports (from src/components/)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import LoadingScreen from './components/LoadingScreen'; 
import SettingsPage from './components/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

// Page imports (from src/pages/)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PredictPage from './pages/PredictionsPage';
import ChatPage from './pages/ChatPage';
import PricingPage from './pages/PricingPage';
import WatchlistPage from './pages/WatchlistPage';
import PortfolioPage from './pages/PortfolioPage';
import AboutPage from './pages/AboutPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import NotFoundPage from './pages/NotFoundPage';
import StockPage from './pages/StockPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen message="Loading your AI-powered trading platform..." />; // ✅ FIXED!
    }

    return (
        <>
            <Navbar />
            <main style={{ flexGrow: 1, minHeight: 'calc(100vh - 120px)' }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/disclaimer" element={<DisclaimerPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
                    <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
                    <Route path="/predict" element={<ProtectedRoute><PredictPage /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                    {/* Stock Details Page Route */}
                    <Route path="/stocks/:symbol" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />

                    {/* Catch-all for 404 Not Found pages */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
            <AIChatWidget />
        </>
    );
}

export default App;