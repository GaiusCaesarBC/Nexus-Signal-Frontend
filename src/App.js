// src/App.js - OPTIMIZED WITH LAZY LOADING 🚀

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider, createGlobalStyle } from 'styled-components';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Core components (always loaded - needed on every page)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import BackgroundEffects from './components/BackgroundEffects';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

// 🎮 Gamification imports (global overlays - always needed)
import { GamificationProvider } from './context/GamificationContext';
import AchievementPopup from './components/gamification/AchievementPopup';
import LevelUpCelebration from './components/gamification/LevelUpCelebration';
import XPNotification from './components/gamification/XPNotification';

// 🏆 Vault imports
import { VaultProvider } from './context/VaultContext';

// 💳 Subscription imports
import { SubscriptionProvider } from './context/SubscriptionContext';

// Lazy-loaded components (loaded on-demand)
const AIChatWidget = lazy(() => import('./components/AIChatWidget'));
const WhaleNotification = lazy(() => import('./components/WhaleNotification'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));

// 🚀 LAZY-LOADED PAGES - Code splitting for faster initial load
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PredictPage = lazy(() => import('./pages/PredictionsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PriceComparisonPage = lazy(() => import('./pages/PriceComparisonPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const StockPage = lazy(() => import('./pages/StockPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const ScreenerPage = lazy(() => import('./pages/ScreenerPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const HeatmapPage = lazy(() => import('./pages/HeatmapPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));
const SentimentPage = lazy(() => import('./pages/SentimentPage'));
const PaperTradingPage = lazy(() => import('./pages/PaperTradingPage'));
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'));
const SocialFeed = lazy(() => import('./components/SocialFeed'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const AchievementsBrowserPage = lazy(() => import('./pages/AchievementsBrowserPage'));
const VaultPage = lazy(() => import('./pages/VaultPage'));
const EquippedItemsPage = lazy(() => import('./pages/EquippedItemsPage'));
const PriceServiceTester = lazy(() => import('./components/dev/PriceServiceTester'));
const OnboardingFlow = lazy(() => import('./pages/OnboardingFlow'));
const PredictionsShowcase = lazy(() => import('./pages/PredictionsShowcase'));
const CryptoPage = lazy(() => import('./pages/CryptoPage'));
const WhaleAlertsPage = lazy(() => import('./pages/WhaleAlertsPage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const PredictionHistoryPage = lazy(() => import('./pages/PredictionHistoryPage'));
const ChartPage = lazy(() => import('./pages/ChartPage'));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'));
const WhitepaperPage = lazy(() => import('./pages/WhitepaperPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const AccuracyDashboardPage = lazy(() => import('./pages/AccuracyDashboardPage'));
const EarningsCalendarPage = lazy(() => import('./pages/EarningsCalendarPage'));
const PortfolioAnalyticsPage = lazy(() => import('./pages/PortfolioAnalyticsPage'));
const CompanyFinancialsPage = lazy(() => import('./pages/CompanyFinancialsPage'));
const MarketReportsPage = lazy(() => import('./pages/MarketReportsPage'));
const SectorRotationPage = lazy(() => import('./pages/SectorRotationPage'));
const EconomicCalendarPage = lazy(() => import('./pages/EconomicCalendarPage'));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage'));
const BacktestingPage = lazy(() => import('./pages/BacktestingPage'));
const CopyTradingPage = lazy(() => import('./pages/CopyTradingPage'));
const PatternScannerPage = lazy(() => import('./pages/PatternScannerPage'));

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
    const { showShortcutsHelp, setShowShortcutsHelp } = useKeyboardShortcuts();

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
                <Suspense fallback={<LoadingScreen message="Loading page..." />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/pricing/compare" element={<PriceComparisonPage />} />
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
                    <Route path="/portfolio-analytics" element={<ProtectedRoute><PortfolioAnalyticsPage /></ProtectedRoute>} />
                    <Route path="/predict" element={<ProtectedRoute><PredictPage /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
                    <Route path="/screener" element={<ProtectedRoute><ScreenerPage /></ProtectedRoute>} />
                    <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
                    <Route path="/heatmap" element={<ProtectedRoute><HeatmapPage /></ProtectedRoute>} />
                    <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                    <Route path="/copy-trading" element={<ProtectedRoute><CopyTradingPage /></ProtectedRoute>} />
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
                    <Route path="/backtesting" element={<ProtectedRoute><BacktestingPage /></ProtectedRoute>} />
                    <Route path="/pattern-scanner" element={<ProtectedRoute><PatternScannerPage /></ProtectedRoute>} />
                    <Route path="/earnings" element={<ProtectedRoute><EarningsCalendarPage /></ProtectedRoute>} />
                    <Route path="/financials" element={<ProtectedRoute><CompanyFinancialsPage /></ProtectedRoute>} />
                    <Route path="/market-reports" element={<ProtectedRoute><MarketReportsPage /></ProtectedRoute>} />
                    <Route path="/sector-rotation" element={<ProtectedRoute><SectorRotationPage /></ProtectedRoute>} />
                    <Route path="/economic-calendar" element={<ProtectedRoute><EconomicCalendarPage /></ProtectedRoute>} />
                    <Route path="/chart/:symbol" element={<ProtectedRoute><ChartPage /></ProtectedRoute>} />

                    {/* Plaid OAuth Callback */}
                    <Route path="/oauth-callback" element={<ProtectedRoute><OAuthCallbackPage /></ProtectedRoute>} />

                    {/* Stock Details Page Routes - supports both /stocks/:symbol and /stock/:symbol */}
                    <Route path="/stocks/:symbol" element={<StockPage />} />
                    <Route path="/stock/:symbol" element={<StockPage />} />

                    {/* Catch-all for 404 Not Found pages */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
                </Suspense>
            </main>
            <Footer />

            {/* Lazy-loaded global components */}
            <Suspense fallback={null}>
                <AIChatWidget />
            </Suspense>

            {/* 🎮 GAMIFICATION GLOBAL COMPONENTS */}
            <AchievementPopup />
            <LevelUpCelebration />
            <XPNotification />

            {/* 🐋 WHALE NOTIFICATIONS */}
            <Suspense fallback={null}>
                <WhaleNotification />
            </Suspense>
            
            {/* 📊 VERCEL ANALYTICS */}
            <Analytics />
            <SpeedInsights />

            {/* ⌨️ KEYBOARD SHORTCUTS HELP */}
            <KeyboardShortcutsHelp
                isOpen={showShortcutsHelp}
                onClose={() => setShowShortcutsHelp(false)}
            />
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