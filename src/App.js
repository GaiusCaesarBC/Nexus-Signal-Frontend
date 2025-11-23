// src/App.js - WITH GAMIFICATION SYSTEM! 🎮

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Component imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import LoadingScreen from './components/LoadingScreen'; 
import SettingsPage from './components/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

// 🎮 Gamification imports
import { GamificationProvider } from './context/GamificationContext';
import LevelUpCelebration from './components/gamification/LevelUpCelebration';
import AchievementPopup from './components/gamification/AchievementPopup';
import XPNotification from './components/gamification/XPNotification';

// Page imports
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
import CookiePolicyPage from './pages/CookiePolicyPage';
import ScrollToTop from './components/ScrollToTop';
import ScreenerPage from './pages/ScreenerPage';
import NewsPage from './pages/NewsPage';
import HeatmapPage from './pages/HeatmapPage';
import JournalPage from './pages/JournalPage';
import LeaderboardPage from './pages/LeaderboardPage';
import PublicProfilePage from './pages/PublicProfilePage';
import CalculatorsPage from './pages/CalculatorsPage';
import SentimentPage from './pages/SentimentPage';
import PaperTradingPage from './pages/PaperTradingPage';
import DiscoveryPage from './pages/DiscoveryPage';
import SocialFeed from './components/SocialFeed';
import AchievementsPage from './pages/AchievementsPage'; // 🎮 NEW!
import AchievementsBrowserPage from './pages/AchievementsBrowserPage';

// Wraps content with styled-components theme AND gamification
function AppContent() {
    const { theme } = useTheme();
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen message="Loading your AI-powered trading platform..." />;
    }

    return (
        <StyledThemeProvider theme={theme}>
            <GamificationProvider> {/* 🎮 WRAP WITH GAMIFICATION */}
                <ScrollToTop />
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
                        <Route path="/cookie-policy" element={<CookiePolicyPage />} />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
                        <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
                        <Route path="/predict" element={<ProtectedRoute><PredictPage /></ProtectedRoute>} />
                        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                        <Route path="/screener" element={<ProtectedRoute><ScreenerPage /></ProtectedRoute>} />
                        <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
                        <Route path="/heatmap" element={<ProtectedRoute><HeatmapPage /></ProtectedRoute>} />
                        <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                        <Route path="/trader/:username" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
                        <Route path="/calculators" element={<CalculatorsPage />} />
                        <Route path="/sentiment" element={<ProtectedRoute><SentimentPage /></ProtectedRoute>} />
                        <Route path="/paper-trading" element={<ProtectedRoute><PaperTradingPage /></ProtectedRoute>} />
                        <Route path="/discover" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
                        <Route path="/feed" element={<SocialFeed />} />
                        <Route path="/achievements/browse" element={<ProtectedRoute><AchievementsBrowserPage /></ProtectedRoute>} />
                        
                        {/* 🎮 GAMIFICATION ROUTES */}
                        <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />

                        {/* Stock Details Page Route */}
                        <Route path="/stocks/:symbol" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />

                        {/* Catch-all for 404 Not Found pages */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes> 
                </main>
                <Footer />
                <AIChatWidget />
                
                {/* 🎮 GAMIFICATION GLOBAL COMPONENTS */}
                <LevelUpCelebration />
                <AchievementPopup />
                <XPNotification />
            </GamificationProvider>
        </StyledThemeProvider>
    );
}

// Main App - Wraps everything in ThemeProvider
function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;