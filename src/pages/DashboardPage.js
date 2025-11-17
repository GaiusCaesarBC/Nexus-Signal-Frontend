import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Loader from '../components/Loader';

// Import dashboard sub-components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatCardsGrid from '../components/dashboard/StatCardsGrid';
import MarketDataSearch from '../components/dashboard/MarketDataSearch';
import AIDataGraph from '../components/dashboard/AIDataGraph';
import NewsFeedCard from '../components/dashboard/NewsFeedCard';
import DashboardCard from '../components/dashboard/DashboardCard';

// Icon Imports
import { BriefcaseBusiness, Bitcoin, LineChart } from 'lucide-react';

// Keyframes
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
    0% { box-shadow: 0 0 5px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.8); }
    100% { box-shadow: 0 0 5px rgba(0, 173, 237, 0.4); }
`;

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 1.5rem;
    min-height: calc(100vh - var(--navbar-height));
    background: linear-gradient(145deg, #0d1a2f 0%, #1a273b 100%);
    color: #e0e0e0;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;

    &::before, &::after {
        content: '';
        position: absolute;
        width: 100vw;
        height: 100vw;
        border-radius: 50%;
        opacity: 0.05;
        z-index: 0;
        filter: blur(100px);
    }

    &::before {
        background: radial-gradient(circle, #00adef, transparent 50%);
        top: -50vw;
        left: -50vw;
    }

    &::after {
        background: radial-gradient(circle, #f97316, transparent 50%);
        bottom: -50vw;
        right: -50vw;
    }
`;

const ContentWrapper = styled.div`
    width: 100%;
    max-width: 1400px;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    animation: ${fadeIn} 1s ease-out forwards;
`;

const SectionTitle = styled.h2`
    font-size: 2.5rem;
    color: #f8fafc;
    margin-bottom: 1.5rem;
    text-align: center;
    position: relative;
    padding-bottom: 0.5rem;

    &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: 80px;
        height: 3px;
        background-color: #00adef;
        border-radius: 2px;
    }
`;

const TwoColumnLayout = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2.5rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const MainContentArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
`;

const SideContentArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
`;

const Card = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
`;

const ErrorMessage = styled.p`
    color: #ff6b6b;
    margin-top: 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
    animation: ${pulseGlow} 1.5s infinite alternate;
`;

const MarketOverviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
`;

const DashboardPage = () => {
    const { user, api, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [dashboardSummary, setDashboardSummary] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [dashboardError, setDashboardError] = useState(null);

    const [marketData, setMarketData] = useState(null);
    const [loadingMarketData, setLoadingMarketData] = useState(true);
    const [errorMarketData, setErrorMarketData] = useState(null);

    const [aiGraphData, setAiGraphData] = useState([]);
    const [aiGraphLoading, setAiGraphLoading] = useState(true);
    const [aiGraphError, setAiGraphError] = useState(null);

    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsError, setNewsError] = useState(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // ✅ FIXED: Fetch Dashboard Summary
    const fetchDashboardSummary = useCallback(async () => {
        if (!api || !isAuthenticated) {
            setDashboardLoading(false);
            return;
        }

        setDashboardLoading(true);
        setDashboardError(null);
        try {
            const res = await api.get('/dashboard/summary');
            
            if (res.data && res.data.mainMetrics && Array.isArray(res.data.mainMetrics)) {
                setDashboardSummary(res.data.mainMetrics);
            } else {
                setDashboardError('Invalid summary data format.');
                setDashboardSummary([]);
            }
        } catch (err) {
            console.error('Error fetching dashboard summary:', err);
            setDashboardError('Failed to fetch dashboard summary.');
        } finally {
            setDashboardLoading(false);
        }
    }, [api, isAuthenticated]);

    // Fetch Market Overview Data
    const fetchMarketOverview = useCallback(async () => {
        if (!api || !isAuthenticated) {
            setLoadingMarketData(false);
            return;
        }

        setLoadingMarketData(true);
        setErrorMarketData(null);
        try {
            const res = await api.get('/dashboard/market-overview');
            setMarketData(res.data);
        } catch (err) {
            console.error("Error fetching market overview:", err);
            setErrorMarketData("Failed to load market data.");
        } finally {
            setLoadingMarketData(false);
        }
    }, [api, isAuthenticated]);

    // ✅ FIXED: Fetch AI Graph Data
    const fetchAiGraphData = useCallback(async () => {
        if (!api || !isAuthenticated) {
            setAiGraphLoading(false);
            return;
        }

        setAiGraphLoading(true);
        setAiGraphError(null);
        try {
            const res = await api.get('/dashboard/ai-graph-data');
            
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setAiGraphData(res.data);
            } else {
                setAiGraphError('Invalid AI graph data format.');
                setAiGraphData([]);
            }
        } catch (err) {
            console.error('Error fetching AI graph data:', err);
            setAiGraphError('Failed to fetch AI graph data.');
        } finally {
            setAiGraphLoading(false);
        }
    }, [api, isAuthenticated]);

    // Fetch News Data
    const fetchNews = useCallback(async () => {
        if (!api || !isAuthenticated) {
            setNewsLoading(false);
            return;
        }

        setNewsLoading(true);
        setNewsError(null);
        try {
            const res = await api.get('/dashboard/news');
            if (res.data && Array.isArray(res.data)) {
                setNews(res.data);
            } else {
                setNewsError('Invalid news data format.');
                setNews([]);
            }
        } catch (err) {
            console.error('Error fetching news:', err);
            setNewsError('Failed to fetch news.');
        } finally {
            setNewsLoading(false);
        }
    }, [api, isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated && !authLoading && api) {
            fetchDashboardSummary();
            fetchMarketOverview();
            fetchAiGraphData();
            fetchNews();
        }
    }, [isAuthenticated, authLoading, api, fetchDashboardSummary, fetchMarketOverview, fetchAiGraphData, fetchNews]);

    if (authLoading || dashboardLoading || aiGraphLoading || loadingMarketData || newsLoading) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return (
            <DashboardContainer>
                <ContentWrapper>
                    <Card>
                        <ErrorMessage>You need to be logged in to view this page.</ErrorMessage>
                        <button onClick={() => navigate('/login')}>Login Now</button>
                    </Card>
                </ContentWrapper>
            </DashboardContainer>
        );
    }

    return (
        <DashboardContainer>
            <ContentWrapper>
                <DashboardHeader username={user ? user.username : 'Trader'} />

                {dashboardError && <ErrorMessage>{dashboardError}</ErrorMessage>}

                <StatCardsGrid summary={dashboardSummary} error={dashboardError} />

                <SectionTitle>Real-Time Market Data & Analytics</SectionTitle>

                <TwoColumnLayout>
                    <MainContentArea>
                        <AIDataGraph
                            data={aiGraphData}
                            loading={aiGraphLoading}
                            error={aiGraphError}
                        />

                        <Card>
                            <SectionTitle style={{ marginBottom: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <LineChart size={24} color="#00adef" /> Global Market Snapshot
                            </SectionTitle>
                            {loadingMarketData ? (
                                <p>Loading market data...</p>
                            ) : errorMarketData ? (
                                <ErrorMessage>{errorMarketData}</ErrorMessage>
                            ) : (
                                <MarketOverviewGrid>
                                    {marketData?.stockOverview?.map((item, index) => (
                                        <DashboardCard
                                            key={`stock-${index}`}
                                            title={item.name}
                                            value={item.value}
                                            change={item.change}
                                            changePercent={item.changePercent}
                                            icon={<BriefcaseBusiness size={24} color="#00adef" />}
                                        />
                                    ))}
                                    {marketData?.cryptoOverview?.map((item, index) => (
                                        <DashboardCard
                                            key={`crypto-${index}`}
                                            title={item.name}
                                            value={item.price}
                                            change={item.change24h}
                                            changePercent={item.changePercent24h}
                                            icon={<Bitcoin size={24} color="#f79316" />}
                                        />
                                    ))}
                                </MarketOverviewGrid>
                            )}
                        </Card>

                        <MarketDataSearch api={api} />
                    </MainContentArea>

                    <SideContentArea>
                        <NewsFeedCard
                            news={news}
                            loading={newsLoading}
                            error={newsError}
                        />
                        <Card>
                            <h3>Quick Links</h3>
                            <ul>
                                <li><Link to="/predict" style={{ color: '#00adef', textDecoration: 'none', fontWeight: 'bold' }}>Go to Predictions</Link></li>
                                <li><Link to="/settings" style={{ color: '#00adef', textDecoration: 'none', fontWeight: 'bold' }}>Account Settings</Link></li>
                            </ul>
                        </Card>
                    </SideContentArea>
                </TwoColumnLayout>
            </ContentWrapper>
        </DashboardContainer>
    );
};

export default DashboardPage;