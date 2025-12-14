// client/src/pages/AccuracyDashboardPage.js - Prediction Accuracy Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import styled, { keyframes, css } from 'styled-components';
import {
    Brain, TrendingUp, TrendingDown, Target, Clock,
    CheckCircle, XCircle, AlertCircle, ArrowLeft, Zap,
    Calendar, DollarSign, Percent, Award, BarChart3,
    Trophy, Flame, RefreshCw, Users, Activity, PieChart
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
    PieChart as RechartsPie, Pie, Legend
} from 'recharts';
import api from '../api/axios';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.5); }
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
    font-size: 3rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
`;

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const MainStatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const StatCard = styled.div`
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid ${props => props.$highlight ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    ${props => props.$highlight && css`animation: ${glow} 2s ease-in-out infinite;`}

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: ${props => props.$iconColor || '#00adef'};
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.$color || '#00adef'};
`;

const StatSubtext = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-top: 0.25rem;
`;

const SectionGrid = styled.div`
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

const CardTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ChartContainer = styled.div`
    height: 300px;
    margin: 1rem 0;
`;

const StreakBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: ${props => props.$type === 'correct'
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
    };
    border: 1px solid ${props => props.$type === 'correct' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
    border-radius: 16px;
    margin-bottom: 1rem;
`;

const StreakNumber = styled.div`
    font-size: 3rem;
    font-weight: 900;
    color: ${props => props.$type === 'correct' ? '#10b981' : '#ef4444'};
`;

const StreakInfo = styled.div`
    flex: 1;
`;

const StreakTitle = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 1.1rem;
`;

const StreakSubtitle = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const BreakdownGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
`;

const BreakdownItem = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
`;

const BreakdownLabel = styled.div`
    color: #94a3b8;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
`;

const BreakdownValue = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.$color || '#00adef'};
`;

const BreakdownSubtext = styled.div`
    color: #64748b;
    font-size: 0.75rem;
`;

const SymbolList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const SymbolItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.4);
    }
`;

const SymbolName = styled.div`
    font-weight: 700;
    color: #e0e6ed;
`;

const SymbolStats = styled.div`
    text-align: right;
`;

const SymbolAccuracy = styled.div`
    font-weight: 700;
    color: ${props => props.$accuracy >= 60 ? '#10b981' : props.$accuracy >= 40 ? '#f59e0b' : '#ef4444'};
`;

const SymbolCount = styled.div`
    color: #64748b;
    font-size: 0.8rem;
`;

const RecentList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
`;

const RecentItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid ${props =>
        props.$status === 'correct' ? 'rgba(16, 185, 129, 0.4)' :
        props.$status === 'incorrect' ? 'rgba(239, 68, 68, 0.4)' :
        'rgba(0, 173, 237, 0.2)'
    };
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
        transform: translateX(5px);
    }
`;

const RecentIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props =>
        props.$status === 'correct' ? 'rgba(16, 185, 129, 0.2)' :
        props.$status === 'incorrect' ? 'rgba(239, 68, 68, 0.2)' :
        'rgba(0, 173, 237, 0.2)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props =>
        props.$status === 'correct' ? '#10b981' :
        props.$status === 'incorrect' ? '#ef4444' :
        '#00adef'
    };
`;

const RecentInfo = styled.div`
    flex: 1;
`;

const RecentSymbol = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const DirectionBadge = styled.span`
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    background: ${props => props.$up ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    color: ${props => props.$up ? '#10b981' : '#ef4444'};
`;

const RecentDetails = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
`;

const RecentOutcome = styled.div`
    text-align: right;
`;

const OutcomeValue = styled.div`
    font-weight: 700;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

const OutcomeLabel = styled.div`
    color: #64748b;
    font-size: 0.75rem;
`;

const ComparisonCard = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
`;

const ComparisonTitle = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

const ComparisonValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${props => props.$positive ? '#10b981' : props.$negative ? '#ef4444' : '#00adef'};
    margin-bottom: 0.5rem;
`;

const ComparisonSubtext = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

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
    padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: rgba(0, 173, 237, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00adef;
`;

const COLORS = ['#00adef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AccuracyDashboardPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { theme } = useTheme();
    const { api: authApi } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const apiInstance = authApi || api;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await apiInstance.get('/predictions/accuracy-dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            toast.error('Failed to load accuracy data');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0%';
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <Spinner />
                    <div>Loading your accuracy data...</div>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (!data || data.overview?.totalPredictions === 0) {
        return (
            <PageContainer>
                <Header>
                    <BackButton onClick={() => navigate('/predict')}>
                        <ArrowLeft size={18} /> Back to Predictions
                    </BackButton>
                    <Title>Prediction Accuracy</Title>
                    <Subtitle>Track your prediction performance over time</Subtitle>
                </Header>
                <Content>
                    <EmptyState>
                        <EmptyIcon>
                            <Brain size={48} />
                        </EmptyIcon>
                        <h2 style={{ color: '#00adef', marginBottom: '0.5rem' }}>No Prediction Data Yet</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                            Make some predictions and wait for them to resolve to see your accuracy stats!
                        </p>
                        <BackButton onClick={() => navigate('/predict')} style={{ display: 'inline-flex' }}>
                            <Brain size={18} /> Make a Prediction
                        </BackButton>
                    </EmptyState>
                </Content>
            </PageContainer>
        );
    }

    const { overview, streak, byAssetType, byDirection, weeklyTrend, bestSymbols, worstSymbols, recentPredictions, platformComparison } = data;

    // Prepare chart data
    const weeklyChartData = weeklyTrend?.map(w => ({
        name: w.week,
        accuracy: Math.round(w.accuracy),
        predictions: w.total
    })) || [];

    const assetTypeData = Object.entries(byAssetType || {})
        .filter(([_, stats]) => stats.total > 0)
        .map(([type, stats]) => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: stats.total,
            accuracy: Math.round(stats.accuracy)
        }));

    return (
        <PageContainer>
            <Header>
                <BackButton onClick={() => navigate('/predict')}>
                    <ArrowLeft size={18} /> Back to Predictions
                </BackButton>
                <Title>Prediction Accuracy</Title>
                <Subtitle>Your AI prediction performance dashboard</Subtitle>
            </Header>

            <Content>
                {/* Main Stats */}
                <MainStatsGrid>
                    <StatCard $highlight>
                        <StatIcon $color="linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 255, 136, 0.3) 100%)" $iconColor="#00ff88">
                            <Target size={24} />
                        </StatIcon>
                        <StatLabel>Overall Accuracy</StatLabel>
                        <StatValue $color={overview.accuracy >= 60 ? '#10b981' : overview.accuracy >= 40 ? '#f59e0b' : '#ef4444'}>
                            {overview.accuracy}%
                        </StatValue>
                        <StatSubtext>{overview.correctPredictions} of {overview.totalPredictions} correct</StatSubtext>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color="rgba(16, 185, 129, 0.2)" $iconColor="#10b981">
                            <CheckCircle size={24} />
                        </StatIcon>
                        <StatLabel>Correct</StatLabel>
                        <StatValue $color="#10b981">{overview.correctPredictions}</StatValue>
                        <StatSubtext>Predictions won</StatSubtext>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color="rgba(239, 68, 68, 0.2)" $iconColor="#ef4444">
                            <XCircle size={24} />
                        </StatIcon>
                        <StatLabel>Incorrect</StatLabel>
                        <StatValue $color="#ef4444">{overview.incorrectPredictions}</StatValue>
                        <StatSubtext>Predictions lost</StatSubtext>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color="rgba(245, 158, 11, 0.2)" $iconColor="#f59e0b">
                            <Clock size={24} />
                        </StatIcon>
                        <StatLabel>Pending</StatLabel>
                        <StatValue $color="#f59e0b">{overview.pendingPredictions}</StatValue>
                        <StatSubtext>Awaiting outcome</StatSubtext>
                    </StatCard>

                    <StatCard>
                        <StatIcon $color="rgba(139, 92, 246, 0.2)" $iconColor="#8b5cf6">
                            <Zap size={24} />
                        </StatIcon>
                        <StatLabel>Avg Confidence</StatLabel>
                        <StatValue $color="#8b5cf6">{overview.avgConfidence}%</StatValue>
                        <StatSubtext>AI confidence level</StatSubtext>
                    </StatCard>
                </MainStatsGrid>

                <SectionGrid>
                    {/* Weekly Trend Chart */}
                    <Card>
                        <CardTitle><Activity size={20} /> Weekly Accuracy Trend</CardTitle>
                        <ChartContainer>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyChartData}>
                                    <defs>
                                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00adef" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#00adef" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(0, 173, 237, 0.3)',
                                            borderRadius: '8px',
                                            color: '#e0e6ed'
                                        }}
                                        formatter={(value, name) => [
                                            name === 'accuracy' ? `${value}%` : value,
                                            name === 'accuracy' ? 'Accuracy' : 'Predictions'
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="accuracy"
                                        stroke="#00adef"
                                        strokeWidth={3}
                                        fill="url(#accuracyGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Card>

                    {/* Streak & Comparison */}
                    <div>
                        {streak && streak.current > 0 && (
                            <StreakBadge $type={streak.type}>
                                <StreakNumber $type={streak.type}>{streak.current}</StreakNumber>
                                <StreakInfo>
                                    <StreakTitle>
                                        {streak.type === 'correct' ? 'Win Streak!' : 'Loss Streak'}
                                    </StreakTitle>
                                    <StreakSubtitle>
                                        {streak.type === 'correct'
                                            ? 'Consecutive correct predictions'
                                            : 'Consecutive incorrect predictions'
                                        }
                                    </StreakSubtitle>
                                </StreakInfo>
                                {streak.type === 'correct' ? <Flame size={32} color="#10b981" /> : <AlertCircle size={32} color="#ef4444" />}
                            </StreakBadge>
                        )}

                        <ComparisonCard>
                            <ComparisonTitle>
                                <Users size={18} /> vs Platform Average
                            </ComparisonTitle>
                            <ComparisonValue
                                $positive={platformComparison?.difference > 0}
                                $negative={platformComparison?.difference < 0}
                            >
                                {platformComparison?.difference > 0 ? '+' : ''}{platformComparison?.difference}%
                            </ComparisonValue>
                            <ComparisonSubtext>
                                You: {platformComparison?.userAccuracy}% | Platform: {platformComparison?.platformAccuracy}%
                            </ComparisonSubtext>
                        </ComparisonCard>

                        <Card style={{ marginTop: '1rem' }}>
                            <CardTitle><PieChart size={20} /> By Direction</CardTitle>
                            <BreakdownGrid>
                                <BreakdownItem>
                                    <BreakdownLabel><TrendingUp size={14} /> Bullish</BreakdownLabel>
                                    <BreakdownValue $color="#10b981">
                                        {Math.round(byDirection?.UP?.accuracy || 0)}%
                                    </BreakdownValue>
                                    <BreakdownSubtext>{byDirection?.UP?.correct || 0}/{byDirection?.UP?.total || 0}</BreakdownSubtext>
                                </BreakdownItem>
                                <BreakdownItem>
                                    <BreakdownLabel><TrendingDown size={14} /> Bearish</BreakdownLabel>
                                    <BreakdownValue $color="#ef4444">
                                        {Math.round(byDirection?.DOWN?.accuracy || 0)}%
                                    </BreakdownValue>
                                    <BreakdownSubtext>{byDirection?.DOWN?.correct || 0}/{byDirection?.DOWN?.total || 0}</BreakdownSubtext>
                                </BreakdownItem>
                            </BreakdownGrid>
                        </Card>
                    </div>
                </SectionGrid>

                <SectionGrid>
                    {/* Best Symbols */}
                    <Card>
                        <CardTitle><Trophy size={20} color="#f59e0b" /> Best Performing Symbols</CardTitle>
                        {bestSymbols && bestSymbols.length > 0 ? (
                            <SymbolList>
                                {bestSymbols.map((s, i) => (
                                    <SymbolItem key={s.symbol}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '8px',
                                                background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'rgba(100, 116, 139, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: i === 0 ? '#0f172a' : '#94a3b8',
                                                fontWeight: 700,
                                                fontSize: '0.8rem'
                                            }}>
                                                {i + 1}
                                            </div>
                                            <SymbolName>{s.symbol}</SymbolName>
                                        </div>
                                        <SymbolStats>
                                            <SymbolAccuracy $accuracy={s.accuracy}>{Math.round(s.accuracy)}%</SymbolAccuracy>
                                            <SymbolCount>{s.correct}/{s.total} correct</SymbolCount>
                                        </SymbolStats>
                                    </SymbolItem>
                                ))}
                            </SymbolList>
                        ) : (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                                Need at least 2 predictions per symbol
                            </p>
                        )}
                    </Card>

                    {/* Recent Predictions */}
                    <Card>
                        <CardTitle><Clock size={20} /> Recent Outcomes</CardTitle>
                        <RecentList>
                            {recentPredictions && recentPredictions.length > 0 ? (
                                recentPredictions.map(p => (
                                    <RecentItem key={p._id} $status={p.status}>
                                        <RecentIcon $status={p.status}>
                                            {p.status === 'correct' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                        </RecentIcon>
                                        <RecentInfo>
                                            <RecentSymbol>
                                                {p.symbol}
                                                <DirectionBadge $up={p.direction === 'UP'}>
                                                    {p.direction === 'UP' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {p.direction}
                                                </DirectionBadge>
                                            </RecentSymbol>
                                            <RecentDetails>
                                                {formatPrice(p.currentPrice)} → {formatPrice(p.targetPrice)}
                                            </RecentDetails>
                                        </RecentInfo>
                                        <RecentOutcome>
                                            <OutcomeValue $positive={p.outcome?.actualChangePercent >= 0}>
                                                {formatPercent(p.outcome?.actualChangePercent)}
                                            </OutcomeValue>
                                            <OutcomeLabel>
                                                {p.outcome?.accuracy}% accurate
                                            </OutcomeLabel>
                                        </RecentOutcome>
                                    </RecentItem>
                                ))
                            ) : (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                                    No completed predictions yet
                                </p>
                            )}
                        </RecentList>
                    </Card>
                </SectionGrid>

                {/* Asset Type Breakdown */}
                <Card>
                    <CardTitle><BarChart3 size={20} /> Accuracy by Asset Type</CardTitle>
                    <BreakdownGrid style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        {['stock', 'crypto', 'dex'].map(type => {
                            const stats = byAssetType?.[type] || { total: 0, correct: 0, accuracy: 0 };
                            return (
                                <BreakdownItem key={type}>
                                    <BreakdownLabel>
                                        {type === 'stock' && <BarChart3 size={14} />}
                                        {type === 'crypto' && <DollarSign size={14} />}
                                        {type === 'dex' && <Activity size={14} />}
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </BreakdownLabel>
                                    <BreakdownValue
                                        $color={stats.accuracy >= 60 ? '#10b981' : stats.accuracy >= 40 ? '#f59e0b' : stats.total > 0 ? '#ef4444' : '#64748b'}
                                    >
                                        {stats.total > 0 ? `${Math.round(stats.accuracy)}%` : 'N/A'}
                                    </BreakdownValue>
                                    <BreakdownSubtext>
                                        {stats.total > 0 ? `${stats.correct}/${stats.total} correct` : 'No predictions'}
                                    </BreakdownSubtext>
                                </BreakdownItem>
                            );
                        })}
                    </BreakdownGrid>
                </Card>
            </Content>
        </PageContainer>
    );
};

export default AccuracyDashboardPage;
