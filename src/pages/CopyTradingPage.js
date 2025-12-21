// client/src/pages/CopyTradingPage.js - Copy Trading Management Page
import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    Copy, Users, TrendingUp, TrendingDown, DollarSign,
    Pause, Play, X, Settings, RefreshCw, ExternalLink,
    AlertCircle, CheckCircle, Activity, BarChart3, Clock,
    ArrowUpRight, Crown, Star, Zap, Target
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';
import CopyTradingModal from '../components/CopyTradingModal';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
`;

const PageContainer = styled.div`
    min-height: 100vh;
    padding: 2rem;
    background: ${({ theme }) => theme.bg?.primary || '#0f172a'};

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
`;

const HeaderLeft = styled.div`
    h1 {
        font-size: 2rem;
        font-weight: 700;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
        margin: 0 0 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    p {
        color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
        margin: 0;
    }
`;

const HeaderRight = styled.div`
    display: flex;
    gap: 0.75rem;
`;

const Button = styled.button`
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PrimaryButton = styled(Button)`
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    color: white;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
`;

const SecondaryButton = styled(Button)`
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};

    &:hover {
        background: rgba(255, 255, 255, 0.15);
    }

    &:disabled {
        opacity: 0.5;
    }

    &.refreshing svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const MainContent = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.3s ease;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${props => props.$bgColor || 'rgba(59, 130, 246, 0.2)'};
        color: ${props => props.$color || '#3b82f6'};
    }

    .change {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: ${props => props.$changePositive ? '#10b981' : '#ef4444'};
    }

    .value {
        font-size: 2rem;
        font-weight: 700;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
        margin-bottom: 0.25rem;
    }

    .label {
        font-size: 0.85rem;
        color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.3s ease;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;

    h2 {
        font-size: 1.1rem;
        font-weight: 600;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

const TradersList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const TraderCard = styled.div`
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(0, 0, 0, 0.2);
        transform: translateX(4px);
    }
`;

const TraderAvatar = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const TraderInfo = styled.div`
    flex: 1;
    min-width: 0;

    .name {
        font-weight: 600;
        font-size: 1rem;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
        margin-bottom: 0.35rem;
    }

    .stats {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: #94a3b8;

        span {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .positive { color: #10b981; }
        .negative { color: #ef4444; }
    }
`;

const TraderStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    background: ${props => props.$paused
        ? 'rgba(251, 191, 36, 0.15)'
        : 'rgba(16, 185, 129, 0.15)'};
    color: ${props => props.$paused ? '#fbbf24' : '#10b981'};
`;

const TraderActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    background: ${props => props.$variant === 'danger'
        ? 'rgba(239, 68, 68, 0.2)'
        : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.$variant === 'danger' ? '#ef4444' : '#94a3b8'};

    &:hover {
        background: ${props => props.$variant === 'danger'
            ? 'rgba(239, 68, 68, 0.3)'
            : 'rgba(255, 255, 255, 0.15)'};
        color: ${props => props.$variant === 'danger' ? '#ef4444' : 'white'};
        transform: scale(1.05);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 1.5rem;
    color: #64748b;

    svg {
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    h3 {
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
        margin-bottom: 0.5rem;
    }

    p {
        margin: 0.5rem 0;
        font-size: 0.9rem;
    }
`;

const TopTraderCard = styled.div`
    background: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
        background: rgba(0, 0, 0, 0.2);
    }

    .rank {
        font-size: 1.2rem;
        font-weight: 700;
        color: ${props => {
            if (props.$rank === 1) return '#fbbf24';
            if (props.$rank === 2) return '#94a3b8';
            if (props.$rank === 3) return '#cd7f32';
            return '#64748b';
        }};
        width: 30px;
    }
`;

const TopTraderAvatar = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const TopTraderInfo = styled.div`
    flex: 1;
    min-width: 0;

    .name {
        font-weight: 600;
        font-size: 0.9rem;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
    }

    .stats {
        font-size: 0.75rem;
        color: #10b981;
    }
`;

const CopyBadge = styled.div`
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

const ActiveCopyCard = styled.div`
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    animation: ${fadeIn} 0.3s ease;

    .left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .symbol {
        font-weight: 700;
        font-size: 1rem;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
    }

    .direction {
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        background: ${props => props.$direction === 'UP'
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(239, 68, 68, 0.15)'};
        color: ${props => props.$direction === 'UP' ? '#10b981' : '#ef4444'};
    }

    .trader {
        font-size: 0.8rem;
        color: #94a3b8;
    }

    .right {
        text-align: right;

        .confidence {
            font-weight: 600;
            color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
        }

        .time {
            font-size: 0.75rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            justify-content: flex-end;
            margin-top: 0.25rem;
        }
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;

    svg {
        animation: ${pulse} 1.5s ease infinite;
        margin-bottom: 1rem;
    }
`;

const CopyTradingPage = () => {
    const { theme } = useTheme();
    const { isAuthenticated, api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [traders, setTraders] = useState([]);
    const [activeCopies, setActiveCopies] = useState([]);
    const [topTraders, setTopTraders] = useState([]);
    const [stats, setStats] = useState({
        totalCopies: 0,
        successRate: 0,
        totalProfitLoss: 0,
        avgProfitLossPercent: 0,
        activeTraders: 0
    });

    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [selectedTrader, setSelectedTrader] = useState(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const [tradersRes, activeCopiesRes, statsRes, topTradersRes] = await Promise.all([
                api.get('/social/copy/traders'),
                api.get('/social/copy/active'),
                api.get('/social/copy/stats'),
                api.get('/social/copy/top-traders?limit=5')
            ]);

            setTraders(tradersRes.data.traders || []);
            setActiveCopies(activeCopiesRes.data.copies || []);
            setStats(statsRes.data.stats || {});
            setTopTraders(topTradersRes.data.traders || []);
        } catch (error) {
            console.error('Error fetching copy trading data:', error);
            if (!isRefresh) {
                toast.error('Failed to load copy trading data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePauseResume = async (e, trader) => {
        e.stopPropagation();
        try {
            if (trader.status === 'paused') {
                await api.post(`/social/copy/${trader.trader.userId}/resume`);
                toast.success(`Resumed copying ${trader.trader.displayName}`);
            } else {
                await api.post(`/social/copy/${trader.trader.userId}/pause`);
                toast.success(`Paused copying ${trader.trader.displayName}`);
            }
            fetchData(true);
        } catch (error) {
            toast.error('Failed to update copy status');
        }
    };

    const handleStop = async (e, trader) => {
        e.stopPropagation();
        if (!window.confirm(`Stop copying ${trader.trader.displayName}?`)) return;

        try {
            await api.delete(`/social/copy/${trader.trader.userId}`);
            toast.success(`Stopped copying ${trader.trader.displayName}`);
            fetchData(true);
        } catch (error) {
            toast.error('Failed to stop copying');
        }
    };

    const handleOpenSettings = (trader) => {
        setSelectedTrader({
            userId: trader.trader.userId,
            username: trader.trader.username,
            displayName: trader.trader.displayName,
            avatar: trader.trader.avatar,
            winRate: trader.trader.winRate,
            totalTrades: trader.trader.totalTrades,
            level: trader.trader.level,
            stats: trader.stats
        });
        setSettingsModalOpen(true);
    };

    const handleCopyTopTrader = (trader) => {
        setSelectedTrader({
            userId: trader.userId,
            username: trader.username,
            displayName: trader.displayName,
            avatar: trader.avatar,
            winRate: trader.stats?.winRate || 0,
            totalTrades: trader.stats?.totalTrades || 0,
            copiersCount: trader.copiersCount
        });
        setSettingsModalOpen(true);
    };

    if (!isAuthenticated) {
        return (
            <PageContainer theme={theme}>
                <SEO title="Copy Trading" description="Copy top traders automatically" />
                <MainContent>
                    <EmptyState theme={theme}>
                        <Copy size={64} />
                        <h3>Sign In Required</h3>
                        <p>Please sign in to access copy trading features</p>
                        <PrimaryButton onClick={() => navigate('/login')} style={{ marginTop: '1rem' }}>
                            Sign In
                        </PrimaryButton>
                    </EmptyState>
                </MainContent>
            </PageContainer>
        );
    }

    if (loading) {
        return (
            <PageContainer theme={theme}>
                <SEO title="Copy Trading" description="Copy top traders automatically" />
                <LoadingContainer>
                    <Copy size={48} color="#3b82f6" />
                    <p style={{ color: '#94a3b8' }}>Loading copy trading data...</p>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer theme={theme}>
            <SEO title="Copy Trading" description="Copy top traders automatically" />

            <Header>
                <HeaderLeft theme={theme}>
                    <h1>
                        <Copy size={28} />
                        Copy Trading
                    </h1>
                    <p>Automatically copy predictions from top performers</p>
                </HeaderLeft>
                <HeaderRight>
                    <SecondaryButton
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className={refreshing ? 'refreshing' : ''}
                        theme={theme}
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </SecondaryButton>
                    <PrimaryButton onClick={() => navigate('/leaderboard')}>
                        <Users size={18} />
                        Find Traders
                    </PrimaryButton>
                </HeaderRight>
            </Header>

            <MainContent>
                {/* Stats Overview */}
                <StatsGrid>
                    <StatCard theme={theme} $color="#3b82f6" $bgColor="rgba(59, 130, 246, 0.2)">
                        <div className="header">
                            <div className="icon"><Users size={24} /></div>
                        </div>
                        <div className="value">{stats.activeTraders || traders.length}</div>
                        <div className="label">Active Traders</div>
                    </StatCard>
                    <StatCard theme={theme} $color="#8b5cf6" $bgColor="rgba(139, 92, 246, 0.2)">
                        <div className="header">
                            <div className="icon"><Activity size={24} /></div>
                        </div>
                        <div className="value">{activeCopies.length}</div>
                        <div className="label">Active Copies</div>
                    </StatCard>
                    <StatCard
                        theme={theme}
                        $color={stats.totalProfitLoss >= 0 ? '#10b981' : '#ef4444'}
                        $bgColor={stats.totalProfitLoss >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                        $changePositive={stats.totalProfitLoss >= 0}
                    >
                        <div className="header">
                            <div className="icon"><DollarSign size={24} /></div>
                            <div className="change">
                                {stats.totalProfitLoss >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {(stats.avgProfitLossPercent || 0).toFixed(1)}%
                            </div>
                        </div>
                        <div className="value">
                            {stats.totalProfitLoss >= 0 ? '+' : ''}${Math.abs(stats.totalProfitLoss || 0).toFixed(0)}
                        </div>
                        <div className="label">Total P/L</div>
                    </StatCard>
                    <StatCard theme={theme} $color="#fbbf24" $bgColor="rgba(251, 191, 36, 0.2)">
                        <div className="header">
                            <div className="icon"><Target size={24} /></div>
                        </div>
                        <div className="value">{(stats.successRate || 0).toFixed(0)}%</div>
                        <div className="label">Success Rate</div>
                    </StatCard>
                </StatsGrid>

                <Grid>
                    {/* Main Column */}
                    <div>
                        {/* Traders Being Copied */}
                        <Card theme={theme}>
                            <CardHeader theme={theme}>
                                <h2><Users size={20} /> Traders You're Copying</h2>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                    {traders.length} trader{traders.length !== 1 ? 's' : ''}
                                </span>
                            </CardHeader>

                            {traders.length > 0 ? (
                                <TradersList>
                                    {traders.map(trader => (
                                        <TraderCard
                                            key={trader.copyTradeId}
                                            onClick={() => handleOpenSettings(trader)}
                                        >
                                            <TraderAvatar>
                                                {trader.trader.avatar ? (
                                                    <img src={trader.trader.avatar} alt={trader.trader.displayName} />
                                                ) : (
                                                    (trader.trader.displayName || 'T')[0].toUpperCase()
                                                )}
                                            </TraderAvatar>

                                            <TraderInfo theme={theme}>
                                                <div className="name">
                                                    {trader.trader.displayName || trader.trader.username}
                                                </div>
                                                <div className="stats">
                                                    <span>
                                                        <TrendingUp size={12} />
                                                        {(trader.stats.winRate || 0).toFixed(0)}% win
                                                    </span>
                                                    <span>
                                                        <Activity size={12} />
                                                        {trader.stats.totalCopiedTrades || 0} copied
                                                    </span>
                                                    <span className={trader.stats.totalProfitLoss >= 0 ? 'positive' : 'negative'}>
                                                        <DollarSign size={12} />
                                                        {trader.stats.totalProfitLoss >= 0 ? '+' : ''}
                                                        ${(trader.stats.totalProfitLoss || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </TraderInfo>

                                            <TraderStatus $paused={trader.status === 'paused'}>
                                                {trader.status === 'paused' ? (
                                                    <><Pause size={14} /> Paused</>
                                                ) : (
                                                    <><CheckCircle size={14} /> Active</>
                                                )}
                                            </TraderStatus>

                                            <TraderActions onClick={e => e.stopPropagation()}>
                                                <ActionButton
                                                    onClick={(e) => handlePauseResume(e, trader)}
                                                    title={trader.status === 'paused' ? 'Resume' : 'Pause'}
                                                >
                                                    {trader.status === 'paused' ? <Play size={18} /> : <Pause size={18} />}
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={(e) => { e.stopPropagation(); handleOpenSettings(trader); }}
                                                    title="Settings"
                                                >
                                                    <Settings size={18} />
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={(e) => handleStop(e, trader)}
                                                    $variant="danger"
                                                    title="Stop Copying"
                                                >
                                                    <X size={18} />
                                                </ActionButton>
                                            </TraderActions>
                                        </TraderCard>
                                    ))}
                                </TradersList>
                            ) : (
                                <EmptyState theme={theme}>
                                    <Copy size={48} />
                                    <h3>No Traders Being Copied</h3>
                                    <p>Find top performers on the leaderboard and start copying their trades automatically.</p>
                                    <PrimaryButton onClick={() => navigate('/leaderboard')} style={{ marginTop: '1rem' }}>
                                        <Users size={18} />
                                        Browse Leaderboard
                                    </PrimaryButton>
                                </EmptyState>
                            )}
                        </Card>

                        {/* Active Copied Predictions */}
                        {activeCopies.length > 0 && (
                            <Card theme={theme} style={{ marginTop: '1.5rem' }}>
                                <CardHeader theme={theme}>
                                    <h2><Activity size={20} /> Active Copied Predictions</h2>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                        {activeCopies.length} active
                                    </span>
                                </CardHeader>

                                {activeCopies.map(copy => (
                                    <ActiveCopyCard key={copy.copyId} theme={theme} $direction={copy.prediction.direction}>
                                        <div className="left">
                                            <span className="symbol">{copy.prediction.symbol}</span>
                                            <span className="direction">
                                                {copy.prediction.direction === 'UP' ? (
                                                    <TrendingUp size={12} />
                                                ) : (
                                                    <TrendingDown size={12} />
                                                )}
                                                {copy.prediction.direction}
                                            </span>
                                            <span className="trader">via {copy.trader.displayName}</span>
                                        </div>
                                        <div className="right">
                                            <div className="confidence">{copy.prediction.confidence}% conf</div>
                                            <div className="time">
                                                <Clock size={12} />
                                                Active
                                            </div>
                                        </div>
                                    </ActiveCopyCard>
                                ))}
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Top Traders to Copy */}
                        <Card theme={theme}>
                            <CardHeader theme={theme}>
                                <h2><Crown size={20} /> Top Traders</h2>
                            </CardHeader>

                            {topTraders.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {topTraders.map((trader, index) => (
                                        <TopTraderCard
                                            key={trader.userId}
                                            $rank={index + 1}
                                            onClick={() => handleCopyTopTrader(trader)}
                                        >
                                            <span className="rank">#{index + 1}</span>
                                            <TopTraderAvatar>
                                                {trader.avatar ? (
                                                    <img src={trader.avatar} alt={trader.displayName} />
                                                ) : (
                                                    (trader.displayName || 'T')[0].toUpperCase()
                                                )}
                                            </TopTraderAvatar>
                                            <TopTraderInfo theme={theme}>
                                                <div className="name">{trader.displayName || trader.username}</div>
                                                <div className="stats">{(trader.stats?.winRate || 0).toFixed(0)}% win rate</div>
                                            </TopTraderInfo>
                                            <CopyBadge>
                                                <Users size={12} />
                                                {trader.copiersCount || 0}
                                            </CopyBadge>
                                        </TopTraderCard>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState theme={theme}>
                                    <p>No top traders available yet</p>
                                </EmptyState>
                            )}

                            <PrimaryButton
                                onClick={() => navigate('/leaderboard')}
                                style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                            >
                                View All Traders
                                <ArrowUpRight size={16} />
                            </PrimaryButton>
                        </Card>

                        {/* Quick Tips */}
                        <Card theme={theme} style={{ marginTop: '1rem' }}>
                            <CardHeader theme={theme}>
                                <h2><Zap size={20} /> Copy Trading Tips</h2>
                            </CardHeader>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
                                <p><strong style={{ color: '#e2e8f0' }}>Diversify:</strong> Copy multiple traders to spread risk.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong style={{ color: '#e2e8f0' }}>Set Limits:</strong> Use max allocation to control exposure.</p>
                                <p style={{ marginTop: '0.5rem' }}><strong style={{ color: '#e2e8f0' }}>Monitor:</strong> Check performance regularly and adjust.</p>
                            </div>
                        </Card>
                    </div>
                </Grid>
            </MainContent>

            {/* Settings Modal */}
            {selectedTrader && (
                <CopyTradingModal
                    trader={selectedTrader}
                    isOpen={settingsModalOpen}
                    onClose={() => {
                        setSettingsModalOpen(false);
                        setSelectedTrader(null);
                    }}
                    onSuccess={() => {
                        fetchData(true);
                    }}
                />
            )}
        </PageContainer>
    );
};

export default CopyTradingPage;
