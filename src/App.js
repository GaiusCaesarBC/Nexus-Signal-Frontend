
// Corrected import for AuthContext
import { AuthContext, useAuth } from '../context/AuthContext';
import { Routes, Route } from 'react-router-dom';

// Corrected imports for components
import Navbar from '../components/Navbar'; // From 'pages' go up to 'src', then into 'components'
import Footer from '../components/Footer'
import Copilot from '../components/Copilot';
import SettingsPage from '../components/SettingsPage';
import ProtectedRoute from '../components/ProtectedRoute';


// Corrected imports for other pages (they are in the *same* 'src/pages' directory)
// These should use './' and NOT have 'pages/' in the path
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
// Assuming you remove the self-import of RegisterPage from within RegisterPage.js
import DashboardPage from './DashboardPage';
import PredictPage from './PredictPage';
import PricingPage from './PricingPage';
import WatchlistPage from './WatchlistPage';
import PortfolioPage from './PortfolioPage';
import TermsOfServicePage from './TermsOfServicePage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import DisclaimerPage from './DisclaimerPage';
import NotFoundPage from './NotFoundPage';
import StockPage from './StockPage';


function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#0d1a2f',
                color: '#e0e0e0',
                fontSize: '1.5rem'
            }}>
                Loading application...
            </div>
        );
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
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/disclaimer" element={<DisclaimerPage />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
                    <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
                    <Route path="/predict" element={<ProtectedRoute><PredictPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                    {/* NEW: Stock Details Page Route */}
                    {/* This route will capture the stock symbol from the URL (e.g., /stocks/AAPL) */}
                    <Route path="/stocks/:symbol" element={<ProtectedRoute><StockPage /></ProtectedRoute>} /> {/* <-- ADD THIS LINE */}

                    {/* Catch-all for 404 Not Found pages */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
            <Copilot />
        </>
    );
}

export default App;