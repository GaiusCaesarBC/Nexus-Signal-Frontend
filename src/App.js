// src/App.js - REVERTED TO YOUR WORKING STRUCTURE 🎮

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Component imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import LoadingScreen from './components/LoadingScreen'; 
import SettingsPage from './components/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import WhaleNotification from './components/WhaleNotification';
import BackgroundEffects from './components/BackgroundEffects';

// 🎮 Gamification imports
import { GamificationProvider } from './context/GamificationContext';
import AchievementPopup from './components/gamification/AchievementPopup';
import LevelUpCelebration from './components/gamification/LevelUpCelebration';
import XPNotification from './components/gamification/XPNotification';

// 🏆 Vault imports
import { VaultProvider } from './context/VaultContext';

// 💳 Subscription imports
import { SubscriptionProvider } from './context/SubscriptionContext';

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
import VaultPage from './pages/VaultPage';
import EquippedItemsPage from './pages/EquippedItemsPage';
import PriceServiceTester from './components/dev/PriceServiceTester';
import OnboardingFlow from './pages/OnboardingFlow';
import PredictionsShowcase from './pages/PredictionsShowcase';
import CryptoPage from './pages/CryptoPage';
import WhaleAlertsPage from './pages/WhaleAlertsPage';
import ComparisonPage from './pages/ComparisonPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';
import ChartPage from './pages/ChartPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import WhitepaperPage from './pages/WhitepaperPage';
import AlertsPage from './pages/AlertsPage';
import AccuracyDashboardPage from './pages/AccuracyDashboardPage';

// Global styles to set the page background
const GlobalStyle = createGlobalStyle`
    html, body, #root {
        min-height: 100vh;
        margin: 0;
        padding: 0;
    }
    
    body {
        background: ${props => props.theme.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
        color: ${props => props.theme.text?.primary || '#e0e6ed'};
    }
`;

// Wraps content with styled-components theme
function AppContent() {
    const { theme } = useTheme();
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen message="Loading your AI-powered trading platform..." />;
    }

    console.log('🎨 Current theme:', theme);
    
    if (!theme || !theme.colors) {
        console.error('❌ Theme is missing colors!', theme);
        return <LoadingScreen message="Loading theme..." />;
    }

    return (
        <StyledThemeProvider theme={theme}>
            {/* Global styles for page background */}
            <GlobalStyle />
            
            {/* 🎨 ANIMATED BACKGROUND EFFECTS - Epic/Legendary themes */}
            <BackgroundEffects />
            
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
                    <Route path="/whitepaper" element={<WhitepaperPage />} />

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
                    <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                    <Route path="/achievements/browse" element={<ProtectedRoute><AchievementsBrowserPage /></ProtectedRoute>} />
                    <Route path="/vault" element={<ProtectedRoute><VaultPage /></ProtectedRoute>} />
                    <Route path="/equipped" element={<ProtectedRoute><EquippedItemsPage /></ProtectedRoute>} />
                    <Route path="/dev/price-test" element={<PriceServiceTester />} />
                    <Route path="/onboarding" element={<OnboardingFlow />} />
                    <Route path="/predictions-showcase" element={<PredictionsShowcase />} />
                    <Route path="/crypto/:symbol" element={<ProtectedRoute><CryptoPage /></ProtectedRoute>} />
                    <Route path="/whale-alerts" element={<ProtectedRoute><WhaleAlertsPage /></ProtectedRoute>} />
                    <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
                    <Route path="/profile/:username" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
                    <Route path="/compare" element={<ComparisonPage />} />
                    <Route path="/prediction-history" element={<PredictionHistoryPage />} />
                    <Route path="/accuracy-dashboard" element={<ProtectedRoute><AccuracyDashboardPage /></ProtectedRoute>} />
                    <Route path="/chart/:symbol" element={<ProtectedRoute><ChartPage /></ProtectedRoute>} />

                    {/* Plaid OAuth Callback */}
                    <Route path="/oauth-callback" element={<ProtectedRoute><OAuthCallbackPage /></ProtectedRoute>} />

                    {/* Stock Details Page Routes - supports both /stocks/:symbol and /stock/:symbol */}
                    <Route path="/stocks/:symbol" element={<StockPage />} />
                    <Route path="/stock/:symbol" element={<StockPage />} />

                    {/* Catch-all for 404 Not Found pages */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes> 
            </main>
            <Footer />
            <AIChatWidget />
            
            {/* 🎮 GAMIFICATION GLOBAL COMPONENTS */}
            <AchievementPopup />
            <LevelUpCelebration />
            <XPNotification />

            {/* 🐋 WHALE NOTIFICATIONS */}
            <WhaleNotification />
            
            {/* 📊 VERCEL ANALYTICS */}
            <Analytics />
            <SpeedInsights />
        </StyledThemeProvider>
    );
}

function App() {
    // Note: ThemeProvider is already in index.js - no need to wrap again here
    return (
        <HelmetProvider>
            <GamificationProvider>
                <VaultProvider>
                    <SubscriptionProvider>
                        <AppContent />
                    </SubscriptionProvider>
                </VaultProvider>
            </GamificationProvider>
        </HelmetProvider>
    );
}

export default App;