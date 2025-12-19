// client/src/pages/PortfolioAnalyticsPage.js - Advanced Portfolio Analytics

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
    BarChart3, PieChart, TrendingUp, TrendingDown, Target, Shield,
    DollarSign, Percent, ArrowLeft, Trophy, Activity, Zap,
    CheckCircle, XCircle, Flame, Award, AlertTriangle, Layers,
    Wallet, FileText
} from 'lucide-react';
import {
    PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadialBarChart, RadialBar
} from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: transparent;
    color: #e0e6ed;
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 8px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateX(-5px);
    }
`;

const Title = styled.h1`
    font-size: 2.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1rem;
`;

// Mode Toggle
const ModeToggleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const ModeToggle = styled.div`
    display: flex;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 4px;
    gap: 4px;
`;

const ModeButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: ${props => props.$active
        ? 'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 255, 136, 0.2) 100%)'
        : 'transparent'};
    border: ${props => props.$active
        ? '1px solid rgba(0, 173, 237, 0.5)'
        : '1px solid transparent'};
    border-radius: 8px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active
            ? 'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 255, 136, 0.2) 100%)'
            : 'rgba(0, 173, 237, 0.1)'};
        color: ${props => props.$active ? '#00adef' : '#e0e6ed'};
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

const ModeLabel = styled.span`
    color: #64748b;
    font-size: 0.85rem;
`;

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const WideGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
`;

const CardBadge = styled.span`
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.2)'};
    color: ${props => props.$textColor || '#00adef'};
    font-weight: 600;
`;

// Stats Grid
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
`;

const StatCard = styled.div`
    background: ${props => props.$gradient || 'rgba(0, 173, 237, 0.05)'};
    border: 1px solid ${props => props.$borderColor || 'rgba(0, 173, 237, 0.2)'};
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    margin: 0 auto 0.75rem;
    border-radius: 12px;
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#00adef'};
`;

const StatValue = styled.div`
    font-size: 1.75rem;
    font-weight: 900;
    color: ${props => props.$color || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
    font-size: 0.8rem;
    color: #94a3b8;
`;

// Allocation Chart
const ChartContainer = styled.div`
    height: 280px;
`;

const AllocationList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
`;

const AllocationItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.1);
    border-radius: 10px;
`;

const AllocationInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const AllocationDot = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 4px;
    background: ${props => props.$color};
`;

const AllocationName = styled.div`
    font-weight: 600;
    color: #e0e6ed;
    text-transform: capitalize;
`;

const AllocationValue = styled.div`
    text-align: right;
`;

const AllocationPercent = styled.div`
    font-weight: 700;
    color: #00adef;
`;

const AllocationAmount = styled.div`
    font-size: 0.8rem;
    color: #64748b;
`;

// Paper Trading Section
const TradingStatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const TradingStat = styled.div`
    text-align: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
`;

const TradingValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || '#e0e6ed'};
`;

const TradingLabel = styled.div`
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.25rem;
`;

// Risk Gauge
const RiskGauge = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
`;

const GaugeValue = styled.div`
    font-size: 3rem;
    font-weight: 900;
    color: ${props => props.$color || '#00adef'};
`;

const GaugeLabel = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
    margin-top: 0.5rem;
`;

const RiskIndicator = styled.div`
    width: 100%;
    height: 8px;
    background: rgba(100, 116, 139, 0.2);
    border-radius: 4px;
    margin-top: 1rem;
    overflow: hidden;
`;

const RiskFill = styled.div`
    height: 100%;
    width: ${props => props.$value}%;
    background: ${props => {
        if (props.$value < 40) return 'linear-gradient(90deg, #10b981, #34d399)';
        if (props.$value < 70) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        return 'linear-gradient(90deg, #ef4444, #f87171)';
    }};
    border-radius: 4px;
    transition: width 0.5s ease;
`;

// Top Performers
const PerformersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const PerformerItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: ${props => props.$positive
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(239, 68, 68, 0.1)'};
    border: 1px solid ${props => props.$positive
        ? 'rgba(16, 185, 129, 0.3)'
        : 'rgba(239, 68, 68, 0.3)'};
    border-radius: 10px;
`;

const PerformerSymbol = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 1.1rem;
`;

const PerformerChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 700;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

// Loading
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #00adef;
`;

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid rgba(0, 173, 237, 0.2);
    border-top-color: #00adef;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 1rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: #94a3b8;
`;

const COLORS = ['#00adef', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

const PortfolioAnalyticsPage = () => {
    const navigate = useNavigate();
    const { api } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [mode, setMode] = useState('paper'); // 'paper' or 'real'

    useEffect(() => {
        fetchAnalytics();
    }, [mode]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/portfolio/analytics?mode=${mode}`);
            if (response.data.success) {
                setAnalytics(response.data.analytics);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    const formatPercent = (value) => {
        const num = parseFloat(value) || 0;
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <Spinner />
                    <div>Loading analytics...</div>
                </LoadingContainer>
            </PageContainer>
        );
    }

    // Prepare allocation data for pie chart
    const allocationData = analytics?.allocation
        ? Object.entries(analytics.allocation).map(([name, data], index) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: parseFloat(data.percent) || 0,
            amount: data.value || 0,
            count: data.count,
            color: COLORS[index % COLORS.length]
        }))
        : [];

    const { overview, paperTrading, predictions, risk } = analytics || {};

    return (
        <PageContainer>
            <Header>
                <BackButton onClick={() => navigate('/portfolio')}>
                    <ArrowLeft size={18} /> Back to Portfolio
                </BackButton>
                <Title>
                    <BarChart3 size={36} />
                    Portfolio Analytics
                </Title>
                <Subtitle>
                    {mode === 'paper'
                        ? 'Deep insights into your paper trading performance'
                        : 'Deep insights into your real portfolio performance'}
                </Subtitle>

                <ModeToggleContainer>
                    <ModeLabel>Analyze:</ModeLabel>
                    <ModeToggle>
                        <ModeButton
                            $active={mode === 'paper'}
                            onClick={() => setMode('paper')}
                        >
                            <FileText size={18} />
                            Paper Trading
                        </ModeButton>
                        <ModeButton
                            $active={mode === 'real'}
                            onClick={() => setMode('real')}
                        >
                            <Wallet size={18} />
                            Real Portfolio
                        </ModeButton>
                    </ModeToggle>
                </ModeToggleContainer>
            </Header>

            <Content>
                {/* Overview Stats */}
                <Grid>
                    <StatCard $borderColor="rgba(0, 173, 237, 0.3)">
                        <StatIcon $bg="rgba(0, 173, 237, 0.2)" $color="#00adef">
                            <DollarSign size={24} />
                        </StatIcon>
                        <StatValue>{formatCurrency(overview?.portfolioValue)}</StatValue>
                        <StatLabel>Portfolio Value</StatLabel>
                    </StatCard>

                    <StatCard $borderColor={overview?.totalGainLoss >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}>
                        <StatIcon
                            $bg={overview?.totalGainLoss >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                            $color={overview?.totalGainLoss >= 0 ? '#10b981' : '#ef4444'}
                        >
                            {overview?.totalGainLoss >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </StatIcon>
                        <StatValue $color={overview?.totalGainLoss >= 0 ? '#10b981' : '#ef4444'}>
                            {formatPercent(overview?.totalGainLossPercent)}
                        </StatValue>
                        <StatLabel>Total Return</StatLabel>
                    </StatCard>

                    <StatCard $borderColor="rgba(139, 92, 246, 0.3)">
                        <StatIcon $bg="rgba(139, 92, 246, 0.2)" $color="#8b5cf6">
                            <Layers size={24} />
                        </StatIcon>
                        <StatValue $color="#8b5cf6">{overview?.totalHoldings || 0}</StatValue>
                        <StatLabel>Holdings</StatLabel>
                    </StatCard>

                    <StatCard $borderColor="rgba(245, 158, 11, 0.3)">
                        <StatIcon $bg="rgba(245, 158, 11, 0.2)" $color="#f59e0b">
                            <Target size={24} />
                        </StatIcon>
                        <StatValue $color="#f59e0b">{predictions?.accuracy || 0}%</StatValue>
                        <StatLabel>Prediction Accuracy</StatLabel>
                    </StatCard>
                </Grid>

                <WideGrid>
                    {/* Allocation Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle><PieChart size={20} /> Asset Allocation</CardTitle>
                            <CardBadge>{allocationData.length} Types</CardBadge>
                        </CardHeader>

                        {allocationData.length > 0 ? (
                            <>
                                <ChartContainer>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPie>
                                            <Pie
                                                data={allocationData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {allocationData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ payload }) => {
                                                    if (payload && payload[0]) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div style={{
                                                                background: 'rgba(15, 23, 42, 0.95)',
                                                                border: '1px solid rgba(0, 173, 237, 0.3)',
                                                                borderRadius: '8px',
                                                                padding: '0.75rem',
                                                                color: '#e0e6ed'
                                                            }}>
                                                                <div style={{ fontWeight: 700 }}>{data.name}</div>
                                                                <div style={{ color: '#94a3b8' }}>
                                                                    {data.value}% ({data.count} holdings)
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                </ChartContainer>

                                <AllocationList>
                                    {allocationData.map((item, index) => (
                                        <AllocationItem key={index}>
                                            <AllocationInfo>
                                                <AllocationDot $color={item.color} />
                                                <AllocationName>{item.name}</AllocationName>
                                            </AllocationInfo>
                                            <AllocationValue>
                                                <AllocationPercent>{item.value}%</AllocationPercent>
                                                <AllocationAmount>{formatCurrency(item.amount)}</AllocationAmount>
                                            </AllocationValue>
                                        </AllocationItem>
                                    ))}
                                </AllocationList>
                            </>
                        ) : (
                            <EmptyState>No holdings to analyze</EmptyState>
                        )}
                    </Card>

                    {/* Risk & Diversification */}
                    <Card>
                        <CardHeader>
                            <CardTitle><Shield size={20} /> Risk Analysis</CardTitle>
                        </CardHeader>

                        <RiskGauge>
                            <GaugeValue $color={
                                risk?.diversificationScore >= 70 ? '#10b981' :
                                risk?.diversificationScore >= 40 ? '#f59e0b' : '#ef4444'
                            }>
                                {risk?.diversificationScore || 0}
                            </GaugeValue>
                            <GaugeLabel>Diversification Score</GaugeLabel>
                            <RiskIndicator>
                                <RiskFill $value={risk?.diversificationScore || 0} />
                            </RiskIndicator>
                        </RiskGauge>

                        <TradingStatsGrid style={{ marginTop: '1.5rem' }}>
                            <TradingStat>
                                <TradingValue>{risk?.assetTypeCount || 0}</TradingValue>
                                <TradingLabel>Asset Types</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color={
                                    parseFloat(risk?.concentrationRisk) > 50 ? '#ef4444' : '#10b981'
                                }>
                                    {risk?.concentrationRisk || 0}%
                                </TradingValue>
                                <TradingLabel>Top Holding %</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#8b5cf6">{overview?.totalHoldings || 0}</TradingValue>
                                <TradingLabel>Positions</TradingLabel>
                            </TradingStat>
                        </TradingStatsGrid>

                        {/* Top Performers */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <CardTitle style={{ marginBottom: '1rem', fontSize: '1rem' }}>
                                <Trophy size={18} /> Top Performers
                            </CardTitle>
                            <PerformersList>
                                {overview?.topGainer && (
                                    <PerformerItem $positive>
                                        <PerformerSymbol>{overview.topGainer.symbol}</PerformerSymbol>
                                        <PerformerChange $positive>
                                            <TrendingUp size={16} />
                                            {formatPercent(overview.topGainer.gainPercent)}
                                        </PerformerChange>
                                    </PerformerItem>
                                )}
                                {overview?.topLoser && (
                                    <PerformerItem $positive={false}>
                                        <PerformerSymbol>{overview.topLoser.symbol}</PerformerSymbol>
                                        <PerformerChange $positive={false}>
                                            <TrendingDown size={16} />
                                            {overview.topLoser.lossPercent}%
                                        </PerformerChange>
                                    </PerformerItem>
                                )}
                                {!overview?.topGainer && !overview?.topLoser && (
                                    <EmptyState>Add holdings to see performers</EmptyState>
                                )}
                            </PerformersList>
                        </div>
                    </Card>
                </WideGrid>

                {/* Paper Trading Stats */}
                {paperTrading && (
                    <Card>
                        <CardHeader>
                            <CardTitle><Activity size={20} /> Paper Trading Performance</CardTitle>
                            <CardBadge
                                $color={paperTrading.totalPL >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                                $textColor={paperTrading.totalPL >= 0 ? '#10b981' : '#ef4444'}
                            >
                                {formatCurrency(paperTrading.totalPL)} P/L
                            </CardBadge>
                        </CardHeader>

                        <TradingStatsGrid>
                            <TradingStat>
                                <TradingValue>{paperTrading.totalTrades}</TradingValue>
                                <TradingLabel>Total Trades</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#10b981">{paperTrading.winningTrades}</TradingValue>
                                <TradingLabel>Winning Trades</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#ef4444">{paperTrading.losingTrades}</TradingValue>
                                <TradingLabel>Losing Trades</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color={paperTrading.winRate >= 50 ? '#10b981' : '#f59e0b'}>
                                    {paperTrading.winRate?.toFixed(1)}%
                                </TradingValue>
                                <TradingLabel>Win Rate</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#10b981">{formatCurrency(paperTrading.biggestWin)}</TradingValue>
                                <TradingLabel>Biggest Win</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#ef4444">{formatCurrency(paperTrading.biggestLoss)}</TradingValue>
                                <TradingLabel>Biggest Loss</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#f59e0b">
                                    <Flame size={20} style={{ display: 'inline', marginRight: '4px' }} />
                                    {paperTrading.currentStreak}
                                </TradingValue>
                                <TradingLabel>Current Streak</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#8b5cf6">{paperTrading.bestStreak}</TradingValue>
                                <TradingLabel>Best Streak</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue>{formatCurrency(paperTrading.portfolioValue)}</TradingValue>
                                <TradingLabel>Portfolio Value</TradingLabel>
                            </TradingStat>
                        </TradingStatsGrid>
                    </Card>
                )}

                {/* Predictions Performance */}
                <Grid>
                    <Card>
                        <CardHeader>
                            <CardTitle><Target size={20} /> AI Predictions</CardTitle>
                        </CardHeader>
                        <TradingStatsGrid>
                            <TradingStat>
                                <TradingValue>{predictions?.total || 0}</TradingValue>
                                <TradingLabel>Total Predictions</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color="#10b981">{predictions?.correct || 0}</TradingValue>
                                <TradingLabel>Correct</TradingLabel>
                            </TradingStat>
                            <TradingStat>
                                <TradingValue $color={
                                    parseFloat(predictions?.accuracy) >= 60 ? '#10b981' :
                                    parseFloat(predictions?.accuracy) >= 40 ? '#f59e0b' : '#ef4444'
                                }>
                                    {predictions?.accuracy || 0}%
                                </TradingValue>
                                <TradingLabel>Accuracy</TradingLabel>
                            </TradingStat>
                        </TradingStatsGrid>
                    </Card>
                </Grid>
            </Content>
        </PageContainer>
    );
};

export default PortfolioAnalyticsPage;
