// client/src/components/CopyTradingDashboard.js - Copy Trading Management Dashboard
import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    Copy, Users, TrendingUp, TrendingDown, DollarSign,
    Pause, Play, X, Settings, RefreshCw, ExternalLink,
    AlertCircle, CheckCircle, Activity, BarChart3, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CopyTradingModal from './CopyTradingModal';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.3s ease;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const Title = styled.h2`
    font-size: 1.2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
`;

const RefreshButton = styled.button`
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        transition: transform 0.3s;
    }

    &.refreshing svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;

    .icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.75rem;
        background: ${props => props.$bgColor || 'rgba(59, 130, 246, 0.2)'};
        color: ${props => props.$color || '#3b82f6'};
    }

    .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: ${props => props.$color || '#e2e8f0'};
    }

    .label {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 0.25rem;
    }
`;

const SectionTitle = styled.h3`
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

    &:hover {
        border-color: rgba(255, 255, 255, 0.15);
        background: rgba(0, 0, 0, 0.2);
    }
`;

const TraderAvatar = styled.div`
    width: 48px;
    height: 48px;
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

const TraderInfo = styled.div`
    flex: 1;
    min-width: 0;

    .name {
        font-weight: 600;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
        margin-bottom: 0.25rem;
        cursor: pointer;

        &:hover {
            color: #3b82f6;
        }
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
    }
`;

const TraderStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
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
    width: 36px;
    height: 36px;
    border-radius: 8px;
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
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 1rem;
    color: #64748b;

    svg {
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    p {
        margin: 0.5rem 0;
    }
`;

const FindTradersButton = styled.button`
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
`;

const ActiveCopiesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1.5rem;
`;

const CopyCard = styled.div`
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.85rem;

    .left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .symbol {
        font-weight: 600;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
    }

    .direction {
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        background: ${props => props.$direction === 'UP'
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(239, 68, 68, 0.15)'};
        color: ${props => props.$direction === 'UP' ? '#10b981' : '#ef4444'};
    }

    .trader {
        color: #94a3b8;
    }

    .right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #94a3b8;
    }
`;

const CopyTradingDashboard = () => {
    const { theme } = useTheme();
    const { api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [traders, setTraders] = useState([]);
    const [activeCopies, setActiveCopies] = useState([]);
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
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const [tradersRes, activeCopiesRes, statsRes] = await Promise.all([
                api.get('/social/copy/traders'),
                api.get('/social/copy/active'),
                api.get('/social/copy/stats')
            ]);

            setTraders(tradersRes.data.traders || []);
            setActiveCopies(activeCopiesRes.data.copies || []);
            setStats(statsRes.data.stats || {});
        } catch (error) {
            console.error('Error fetching copy trading data:', error);
            if (!isRefresh) {
                toast.error('Failed to load copy trading data');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePauseResume = async (trader) => {
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

    const handleStop = async (trader) => {
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
            level: trader.trader.level
        });
        setSettingsModalOpen(true);
    };

    if (loading) {
        return (
            <Container theme={theme}>
                <Header>
                    <Title theme={theme}>
                        <Copy size={20} />
                        Copy Trading
                    </Title>
                </Header>
                <EmptyState>
                    <RefreshCw size={40} className="spinning" />
                    <p>Loading...</p>
                </EmptyState>
            </Container>
        );
    }

    return (
        <Container theme={theme}>
            <Header>
                <Title theme={theme}>
                    <Copy size={20} />
                    Copy Trading
                </Title>
                <RefreshButton
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className={refreshing ? 'refreshing' : ''}
                >
                    <RefreshCw size={18} />
                </RefreshButton>
            </Header>

            {/* Stats Overview */}
            <StatsGrid>
                <StatCard $color="#3b82f6" $bgColor="rgba(59, 130, 246, 0.2)">
                    <div className="icon"><Users size={20} /></div>
                    <div className="value">{stats.activeTraders || traders.length}</div>
                    <div className="label">Active Traders</div>
                </StatCard>
                <StatCard $color="#10b981" $bgColor="rgba(16, 185, 129, 0.2)">
                    <div className="icon"><Activity size={20} /></div>
                    <div className="value">{stats.totalCopies || 0}</div>
                    <div className="label">Total Copies</div>
                </StatCard>
                <StatCard
                    $color={stats.totalProfitLoss >= 0 ? '#10b981' : '#ef4444'}
                    $bgColor={stats.totalProfitLoss >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                >
                    <div className="icon"><DollarSign size={20} /></div>
                    <div className="value">
                        {stats.totalProfitLoss >= 0 ? '+' : ''}${(stats.totalProfitLoss || 0).toFixed(0)}
                    </div>
                    <div className="label">Total P/L</div>
                </StatCard>
                <StatCard $color="#fbbf24" $bgColor="rgba(251, 191, 36, 0.2)">
                    <div className="icon"><BarChart3 size={20} /></div>
                    <div className="value">{(stats.successRate || 0).toFixed(0)}%</div>
                    <div className="label">Success Rate</div>
                </StatCard>
            </StatsGrid>

            {/* Copied Traders */}
            <SectionTitle theme={theme}>
                <Users size={16} /> Traders You're Copying
            </SectionTitle>

            {traders.length > 0 ? (
                <TradersList>
                    {traders.map(trader => (
                        <TraderCard key={trader.copyTradeId}>
                            <TraderAvatar>
                                {trader.trader.avatar ? (
                                    <img src={trader.trader.avatar} alt={trader.trader.displayName} />
                                ) : (
                                    (trader.trader.displayName || 'T')[0].toUpperCase()
                                )}
                            </TraderAvatar>

                            <TraderInfo theme={theme}>
                                <div
                                    className="name"
                                    onClick={() => navigate(`/trader/${trader.trader.username}`)}
                                >
                                    {trader.trader.displayName || trader.trader.username}
                                </div>
                                <div className="stats">
                                    <span>
                                        <TrendingUp size={12} />
                                        {trader.stats.winRate?.toFixed(0) || 0}% win
                                    </span>
                                    <span>
                                        <Activity size={12} />
                                        {trader.stats.totalCopiedTrades || 0} trades
                                    </span>
                                    <span
                                        style={{
                                            color: trader.stats.totalProfitLoss >= 0 ? '#10b981' : '#ef4444'
                                        }}
                                    >
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

                            <TraderActions>
                                <ActionButton
                                    onClick={() => handlePauseResume(trader)}
                                    title={trader.status === 'paused' ? 'Resume' : 'Pause'}
                                >
                                    {trader.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                                </ActionButton>
                                <ActionButton
                                    onClick={() => handleOpenSettings(trader)}
                                    title="Settings"
                                >
                                    <Settings size={16} />
                                </ActionButton>
                                <ActionButton
                                    onClick={() => handleStop(trader)}
                                    $variant="danger"
                                    title="Stop Copying"
                                >
                                    <X size={16} />
                                </ActionButton>
                            </TraderActions>
                        </TraderCard>
                    ))}
                </TradersList>
            ) : (
                <EmptyState>
                    <Copy size={48} />
                    <p>You're not copying any traders yet</p>
                    <p style={{ fontSize: '0.85rem' }}>
                        Find top performers on the leaderboard and start copying their trades
                    </p>
                    <FindTradersButton onClick={() => navigate('/leaderboard')}>
                        <Users size={18} />
                        Find Traders to Copy
                    </FindTradersButton>
                </EmptyState>
            )}

            {/* Active Copied Predictions */}
            {activeCopies.length > 0 && (
                <>
                    <SectionTitle theme={theme} style={{ marginTop: '1.5rem' }}>
                        <Activity size={16} /> Active Copied Predictions
                    </SectionTitle>
                    <ActiveCopiesList>
                        {activeCopies.map(copy => (
                            <CopyCard key={copy.copyId} theme={theme} $direction={copy.prediction.direction}>
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
                                    <span>{copy.prediction.confidence}%</span>
                                    <Clock size={14} />
                                </div>
                            </CopyCard>
                        ))}
                    </ActiveCopiesList>
                </>
            )}

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
        </Container>
    );
};

export default CopyTradingDashboard;
