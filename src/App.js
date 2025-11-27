// src/App.js - WITH GAMIFICATION SYSTEM! 🎮 - THEME FIXED

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';

// Component imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import LoadingScreen from './components/LoadingScreen'; 
import SettingsPage from './components/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import WhaleNotification from './components/WhaleNotification';

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
import AchievementsPage from './pages/AchievementsPage';
import AchievementsBrowserPage from './pages/AchievementsBrowserPage';
import StockComparisonPage from './pages/StockComparisonPage';
import VaultPage from './pages/VaultPage';
import EquippedItemsPage from './pages/EquippedItemsPage';
import PriceServiceTester from './components/dev/PriceServiceTester';
import OnboardingFlow from './pages/OnboardingFlow';
import PredictionsShowcase from './pages/PredictionsShowcase';
import CryptoPage from './pages/CryptoPage';
import WhaleAlertsPage from './pages/WhaleAlertsPage'


// Wraps content with styled-components theme
function AppContent() {
    const { theme } = useTheme(); // Get the complete theme object
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen message="Loading your AI-powered trading platform..." />;
    }

    // Ensure theme has the colors property before rendering
    console.log('🎨 Current theme:', theme);
    
    if (!theme || !theme.colors) {
        console.error('❌ Theme is missing colors!', theme);
        return <LoadingScreen message="Loading theme..." />;
    }

    return (
        <StyledThemeProvider theme={theme}>
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
                    <Route path="/compare" element={<ProtectedRoute><StockComparisonPage /></ProtectedRoute>} />
                    <Route path="/vault" element={<ProtectedRoute><VaultPage /></ProtectedRoute>} />
                    <Route path="/equipped" element={<ProtectedRoute><EquippedItemsPage /></ProtectedRoute>} />
                    <Route path="/dev/price-test" element={<PriceServiceTester />} />
                    <Route path="/onboarding" element={<OnboardingFlow />} />
                    <Route path="/predictions-showcase" element={<PredictionsShowcase />} />
                    <Route path="/crypto/:symbol" element={<ProtectedRoute><CryptoPage /></ProtectedRoute>} />
                    <Route path="/whale-alerts" element={<ProtectedRoute><WhaleAlertsPage /></ProtectedRoute>} />

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

            {/* 🐋 WHALE NOTIFICATIONS */}
<WhaleNotification />
{/* 📊 VERCEL ANALYTICS */}
            <Analytics />
        </StyledThemeProvider>
    );
}

// Main App - CORRECT PROVIDER ORDER! 🎮
function App() {
    return (
        <GamificationProvider>
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </GamificationProvider>
    );
}

export default App;