// client/src/pages/DashboardPage.js - THE MOST BADASS DASHBOARD EVER

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp, TrendingDown, Activity, DollarSign, PieChart,
    Zap, Target, Brain, Eye, AlertCircle, ArrowUpRight, ArrowDownRight,
    Clock, BarChart3, Flame, Award, Star
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.5); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const scrollTicker = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 30px rgba(0, 173, 237, 0.5);
    font-weight: 900;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

// ============ STOCK TICKER ============
const TickerContainer = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 2rem;
    padding: 1rem 0;
    position: relative;
`;

const TickerTrack = styled.div`
    display: flex;
    animation: ${scrollTicker} 30s linear infinite;
    white-space: nowrap;
`;

const TickerItem = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 2rem;
    font-weight: 600;
`;

const TickerSymbol = styled.span`
    color: #00adef;
    font-size: 1.1rem;
`;

const TickerPrice = styled.span`
    color: #e0e6ed;
`;

const TickerChange = styled.span`
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

// ============ STATS GRID ============
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.6s ease-out;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${props => {
            if (props.variant === 'success') return 'linear-gradient(90deg, #10b981, #059669)';
            if (props.variant === 'danger') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            if (props.variant === 'warning') return 'linear-gradient(90deg, #f59e0b, #d97706)';
            return 'linear-gradient(90deg, #00adef, #0088cc)';
        }};
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    background: ${props => {
        if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        if (props.variant === 'warning') return '#f59e0b';
        return '#00adef';
    }};
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${props => {
        if (props.positive) return '#10b981';
        if (props.negative) return '#ef4444';
        return '#00adef';
    }};
    margin-bottom: 0.5rem;
`;

const StatSubtext = styled.div`
    font-size: 0.9rem;
    color: ${props => props.positive ? '#10b981' : props.negative ? '#ef4444' : '#94a3b8'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============ MAIN CONTENT GRID ============
const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const Panel = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const PanelTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Badge = styled.span`
    background: ${props => {
        if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        return '#00adef';
    }};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
`;

// ============ MARKET MOVERS ============
const MoversList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const MoverItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.1);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const MoverInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const MoverSymbol = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: #00adef;
    min-width: 60px;
`;

const MoverName = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const MoverPrice = styled.div`
    text-align: right;
`;

const MoverPriceValue = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: #e0e6ed;
`;

const MoverChange = styled.div`
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
`;

// ============ AI PREDICTIONS ============
const PredictionCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }
`;

const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const PredictionSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 700;
    color: #a78bfa;
`;

const PredictionDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.up ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    border-radius: 20px;
    color: ${props => props.up ? '#10b981' : '#ef4444'};
    font-weight: 600;
`;

const PredictionDetails = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const PredictionDetail = styled.div``;

const DetailLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
    color: #e0e6ed;
    font-weight: 600;
    font-size: 1.1rem;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 8px;
    background: rgba(0, 173, 237, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1rem;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.value}%;
    background: linear-gradient(90deg, #10b981, #00adef);
    border-radius: 4px;
    transition: width 1s ease-out;
`;

// ============ QUICK ACTIONS ============
const QuickActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const ActionButton = styled.button`
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.1) 100%);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
    }
`;

const ActionIcon = styled.div`
    font-size: 2rem;
`;

const ActionLabel = styled.div`
    font-size: 0.9rem;
`;

// ============ COMPONENT ============
const DashboardPage = () => {
    const { api, user } = useAuth();
    const [portfolioStats, setPortfolioStats] = useState(null);
    const [marketMovers, setMarketMovers] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [tickerData, setTickerData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch portfolio
            const portfolioRes = await api.get('/portfolio');
            calculatePortfolioStats(portfolioRes.data.holdings || []);

            // Fetch trending stocks for ticker
            setTickerData([
                { symbol: 'AAPL', price: 175.50, change: 2.5 },
                { symbol: 'TSLA', price: 242.80, change: -1.2 },
                { symbol: 'NVDA', price: 495.20, change: 5.8 },
                { symbol: 'MSFT', price: 378.90, change: 1.4 },
                { symbol: 'GOOGL', price: 140.20, change: -0.8 },
                { symbol: 'AMZN', price: 178.30, change: 3.2 },
                { symbol: 'META', price: 485.60, change: 2.1 },
                { symbol: 'AMD', price: 142.70, change: 4.5 },
            ]);

            // Set market movers
            setMarketMovers([
                { symbol: 'NVDA', name: 'NVIDIA Corp', price: 495.20, change: 5.8 },
                { symbol: 'AMD', name: 'Advanced Micro', price: 142.70, change: 4.5 },
                { symbol: 'AMZN', name: 'Amazon.com', price: 178.30, change: 3.2 },
                { symbol: 'TSLA', name: 'Tesla Inc', price: 242.80, change: -1.2 },
            ]);

            // Mock predictions
            setPredictions([
                {
                    symbol: 'AAPL',
                    direction: 'UP',
                    targetPrice: 182.50,
                    confidence: 85,
                    timeframe: '7 days'
                },
                {
                    symbol: 'NVDA',
                    direction: 'UP',
                    targetPrice: 520.00,
                    confidence: 78,
                    timeframe: '7 days'
                }
            ]);

            // Mock chart data
            setChartData([
                { date: 'Mon', value: 10000 },
                { date: 'Tue', value: 10500 },
                { date: 'Wed', value: 10200 },
                { date: 'Thu', value: 11000 },
                { date: 'Fri', value: 11500 },
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePortfolioStats = (holdings) => {
        if (!holdings || holdings.length === 0) {
            setPortfolioStats(null);
            return;
        }

        const totalValue = holdings.reduce((sum, h) => {
            const price = h.currentPrice || h.price || 0;
            const shares = h.shares || h.quantity || 0;
            return sum + (price * shares);
        }, 0);

        const totalCost = holdings.reduce((sum, h) => {
            const avgPrice = h.averagePrice || h.purchasePrice || 0;
            const shares = h.shares || h.quantity || 0;
            return sum + (avgPrice * shares);
        }, 0);

        const totalGain = totalValue - totalCost;
        const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

        setPortfolioStats({
            totalValue,
            totalGain,
            totalGainPercent,
            holdingsCount: holdings.length
        });
    };

    if (loading) {
        return (
            <PageContainer>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Activity size={64} color="#00adef" />
                    <h2 style={{ marginTop: '1rem', color: '#00adef' }}>Loading Dashboard...</h2>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>Mission Control</Title>
                <Subtitle>Welcome back, {user?.name || 'Trader'} • Real-time market intelligence</Subtitle>
            </Header>

            {/* STOCK TICKER */}
            <TickerContainer>
                <TickerTrack>
                    {[...tickerData, ...tickerData].map((stock, index) => (
                        <TickerItem key={index}>
                            <TickerSymbol>{stock.symbol}</TickerSymbol>
                            <TickerPrice>${stock.price.toFixed(2)}</TickerPrice>
                            <TickerChange positive={stock.change >= 0}>
                                {stock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {stock.change >= 0 ? '+' : ''}{stock.change}%
                            </TickerChange>
                        </TickerItem>
                    ))}
                </TickerTrack>
            </TickerContainer>

            {/* STATS CARDS */}
            <StatsGrid>
                <StatCard>
                    <StatIcon>
                        <DollarSign size={24} />
                    </StatIcon>
                    <StatLabel>Portfolio Value</StatLabel>
                    <StatValue>
                        ${portfolioStats?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                    </StatValue>
                    <StatSubtext>
                        <Eye size={16} />
                        {portfolioStats?.holdingsCount || 0} Holdings
                    </StatSubtext>
                </StatCard>

                <StatCard variant={portfolioStats?.totalGain >= 0 ? 'success' : 'danger'}>
                    <StatIcon variant={portfolioStats?.totalGain >= 0 ? 'success' : 'danger'}>
                        {portfolioStats?.totalGain >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </StatIcon>
                    <StatLabel>Total Gain/Loss</StatLabel>
                    <StatValue positive={portfolioStats?.totalGain >= 0} negative={portfolioStats?.totalGain < 0}>
                        ${Math.abs(portfolioStats?.totalGain || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </StatValue>
                    <StatSubtext positive={portfolioStats?.totalGainPercent >= 0} negative={portfolioStats?.totalGainPercent < 0}>
                        {portfolioStats?.totalGainPercent >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {portfolioStats?.totalGainPercent >= 0 ? '+' : ''}{portfolioStats?.totalGainPercent?.toFixed(2) || 0}%
                    </StatSubtext>
                </StatCard>

                <StatCard variant="warning">
                    <StatIcon variant="warning">
                        <Flame size={24} />
                    </StatIcon>
                    <StatLabel>Hot Stocks</StatLabel>
                    <StatValue>{marketMovers.filter(m => m.change > 3).length}</StatValue>
                    <StatSubtext>
                        <Star size={16} />
                        Top Movers Today
                    </StatSubtext>
                </StatCard>

                <StatCard>
                    <StatIcon>
                        <Brain size={24} />
                    </StatIcon>
                    <StatLabel>AI Predictions</StatLabel>
                    <StatValue>{predictions.length}</StatValue>
                    <StatSubtext>
                        <Target size={16} />
                        Active Forecasts
                    </StatSubtext>
                </StatCard>
            </StatsGrid>

            {/* QUICK ACTIONS */}
            <QuickActionsGrid>
                <ActionButton onClick={() => window.location.href = '/portfolio'}>
                    <ActionIcon><PieChart size={32} /></ActionIcon>
                    <ActionLabel>Portfolio</ActionLabel>
                </ActionButton>
                <ActionButton onClick={() => window.location.href = '/predict'}>
                    <ActionIcon><Brain size={32} /></ActionIcon>
                    <ActionLabel>AI Predict</ActionLabel>
                </ActionButton>
                <ActionButton onClick={() => window.location.href = '/watchlist'}>
                    <ActionIcon><Eye size={32} /></ActionIcon>
                    <ActionLabel>Watchlist</ActionLabel>
                </ActionButton>
                <ActionButton onClick={() => window.location.href = '/chat'}>
                    <ActionIcon><Zap size={32} /></ActionIcon>
                    <ActionLabel>AI Chat</ActionLabel>
                </ActionButton>
            </QuickActionsGrid>

            {/* MAIN CONTENT */}
            <ContentGrid>
                {/* LEFT COLUMN - CHARTS & MOVERS */}
                <div>
                    <Panel>
                        <PanelHeader>
                            <PanelTitle>
                                <BarChart3 size={24} />
                                Portfolio Performance
                            </PanelTitle>
                            <Badge>5 Days</Badge>
                        </PanelHeader>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00adef" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#00adef" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: '#1e293b', 
                                        border: '1px solid rgba(0, 173, 237, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#00adef" 
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Panel>

                    <Panel style={{ marginTop: '2rem' }}>
                        <PanelHeader>
                            <PanelTitle>
                                <Flame size={24} />
                                Market Movers
                            </PanelTitle>
                            <Badge variant="success">Live</Badge>
                        </PanelHeader>
                        <MoversList>
                            {marketMovers.map((mover, index) => (
                                <MoverItem key={index}>
                                    <MoverInfo>
                                        <MoverSymbol>{mover.symbol}</MoverSymbol>
                                        <MoverName>{mover.name}</MoverName>
                                    </MoverInfo>
                                    <MoverPrice>
                                        <MoverPriceValue>${mover.price.toFixed(2)}</MoverPriceValue>
                                        <MoverChange positive={mover.change >= 0}>
                                            {mover.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            {mover.change >= 0 ? '+' : ''}{mover.change}%
                                        </MoverChange>
                                    </MoverPrice>
                                </MoverItem>
                            ))}
                        </MoversList>
                    </Panel>
                </div>

                {/* RIGHT COLUMN - AI PREDICTIONS */}
                <Panel>
                    <PanelHeader>
                        <PanelTitle>
                            <Brain size={24} />
                            AI Predictions
                        </PanelTitle>
                        <Badge>Powered by ML</Badge>
                    </PanelHeader>
                    
                    {predictions.map((pred, index) => (
                        <PredictionCard key={index}>
                            <PredictionHeader>
                                <PredictionSymbol>{pred.symbol}</PredictionSymbol>
                                <PredictionDirection up={pred.direction === 'UP'}>
                                    {pred.direction === 'UP' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    {pred.direction}
                                </PredictionDirection>
                            </PredictionHeader>
                            
                            <PredictionDetails>
                                <PredictionDetail>
                                    <DetailLabel>Target Price</DetailLabel>
                                    <DetailValue>${pred.targetPrice.toFixed(2)}</DetailValue>
                                </PredictionDetail>
                                <PredictionDetail>
                                    <DetailLabel>Timeframe</DetailLabel>
                                    <DetailValue>{pred.timeframe}</DetailValue>
                                </PredictionDetail>
                            </PredictionDetails>
                            
                            <div style={{ marginTop: '1rem' }}>
                                <DetailLabel>Confidence Level</DetailLabel>
                                <ConfidenceBar>
                                    <ConfidenceFill value={pred.confidence} />
                                </ConfidenceBar>
                                <div style={{ textAlign: 'right', marginTop: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                                    {pred.confidence}%
                                </div>
                            </div>
                        </PredictionCard>
                    ))}
                </Panel>
            </ContentGrid>
        </PageContainer>
    );
};

export default DashboardPage;