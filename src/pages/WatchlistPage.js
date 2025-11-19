// client/src/pages/WatchlistPage.js - EPIC WATCHLIST PAGE

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp, TrendingDown, Plus, Trash2, X, Eye, Star,
    Activity, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight,
    Zap, Target, Bell, BellOff, AlertCircle, Flame, Award
} from 'lucide-react';
import {
    LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.6); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 6rem 2rem 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    text-shadow: 0 0 30px rgba(0, 173, 237, 0.5);
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const AddButton = styled.button`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
    transition: all 0.3s ease;
    z-index: 100;
    animation: ${float} 3s ease-in-out infinite;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 48px rgba(16, 185, 129, 0.6);
    }

    @media (max-width: 768px) {
        bottom: 1rem;
        right: 1rem;
    }
`;

// ============ STATS CARDS ============
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
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
    color: #00adef;
    margin-bottom: 0.5rem;
`;

const StatSubtext = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
`;

// ============ WATCHLIST GRID ============
const WatchlistGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const WatchCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.5s ease-out;
    transition: all 0.3s ease;
    cursor: pointer;

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
        background: ${props => props.positive ? 
            'linear-gradient(90deg, #10b981, #059669)' : 
            'linear-gradient(90deg, #ef4444, #dc2626)'
        };
    }
`;

const WatchHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1.5rem;
`;

const WatchSymbol = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const WatchName = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-top: 0.25rem;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const IconButton = styled.button`
    background: ${props => props.variant === 'danger' ? 
        'rgba(239, 68, 68, 0.1)' : 
        'rgba(0, 173, 237, 0.1)'
    };
    border: 1px solid ${props => props.variant === 'danger' ? 
        'rgba(239, 68, 68, 0.3)' : 
        'rgba(0, 173, 237, 0.3)'
    };
    color: ${props => props.variant === 'danger' ? '#ef4444' : '#00adef'};
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.variant === 'danger' ? 
            'rgba(239, 68, 68, 0.2)' : 
            'rgba(0, 173, 237, 0.2)'
        };
        transform: scale(1.1);
    }
`;

const PriceSection = styled.div`
    margin-bottom: 1rem;
`;

const CurrentPrice = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: #e0e6ed;
    margin-bottom: 0.5rem;
`;

const PriceChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.1);
    border-radius: 12px;
`;

const StatItem = styled.div``;

const StatItemLabel = styled.div`
    color: #94a3b8;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const StatItemValue = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 0.95rem;
`;

const MiniChart = styled.div`
    height: 80px;
    margin-top: 1rem;
    opacity: 0.8;
`;

const AlertBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.active ? 
        'rgba(16, 185, 129, 0.15)' : 
        'rgba(148, 163, 184, 0.1)'
    };
    border: 1px solid ${props => props.active ? 
        'rgba(16, 185, 129, 0.3)' : 
        'rgba(148, 163, 184, 0.2)'
    };
    border-radius: 8px;
    font-size: 0.85rem;
    color: ${props => props.active ? '#10b981' : '#94a3b8'};
    margin-top: 1rem;
`;

// ============ MODAL ============
const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    position: relative;
    animation: ${slideIn} 0.3s ease-out;
`;

const ModalTitle = styled.h2`
    color: #00adef;
    margin-bottom: 2rem;
    font-size: 1.8rem;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: scale(1.1);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SubmitButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(0, 173, 237, 0.3);
`;

// ============ COMPONENT ============
const WatchlistPage = () => {
    const { api } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ symbol: '' });

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        try {
            setLoading(true);
            const response = await api.get('/watchlist');
            
            // Mock data with charts for demo
            const watchlistData = (response.data.watchlist || response.data || []).map(item => ({
                ...item,
                chartData: generateMockChartData()
            }));
            
            setWatchlist(watchlistData);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            setWatchlist([]);
        } finally {
            setLoading(false);
        }
    };

    const generateMockChartData = () => {
        return Array.from({ length: 20 }, (_, i) => ({
            value: Math.random() * 100 + 100
        }));
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            await api.post('/watchlist', {
                symbol: formData.symbol.toUpperCase()
            });
            
            setShowAddModal(false);
            setFormData({ symbol: '' });
            fetchWatchlist();
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            alert(error.response?.data?.error || 'Failed to add to watchlist');
        }
    };

    const handleRemoveStock = async (symbol) => {
        if (!window.confirm(`Remove ${symbol} from watchlist?`)) return;

        try {
            await api.delete(`/watchlist/${symbol}`);
            fetchWatchlist();
        } catch (error) {
            console.error('Error removing from watchlist:', error);
            alert('Failed to remove from watchlist');
        }
    };

    const getStats = () => {
        const totalStocks = watchlist.length;
        const gainers = watchlist.filter(s => (s.changePercent || 0) > 0).length;
        const losers = watchlist.filter(s => (s.changePercent || 0) < 0).length;
        const avgChange = watchlist.length > 0 
            ? watchlist.reduce((sum, s) => sum + (s.changePercent || 0), 0) / watchlist.length 
            : 0;

        return { totalStocks, gainers, losers, avgChange };
    };

    const stats = getStats();

    if (loading) {
        return (
            <PageContainer>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Activity size={64} color="#00adef" />
                    <h2 style={{ marginTop: '1rem', color: '#00adef' }}>Loading Watchlist...</h2>
                </div>
            </PageContainer>
        );
    }

    if (!watchlist || watchlist.length === 0) {
        return (
            <PageContainer>
                <Header>
                    <Title>My Watchlist</Title>
                    <Subtitle>Track your favorite stocks in real-time</Subtitle>
                </Header>
                <EmptyState>
                    <EmptyIcon>
                        <Eye size={64} color="#00adef" />
                    </EmptyIcon>
                    <h2 style={{ color: '#00adef', marginBottom: '0.5rem' }}>Your watchlist is empty</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Add stocks to track their performance</p>
                </EmptyState>
                <AddButton onClick={() => setShowAddModal(true)}>
                    <Plus size={28} />
                </AddButton>

                {showAddModal && (
                    <Modal onClick={() => setShowAddModal(false)}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <CloseButton onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </CloseButton>
                            <ModalTitle>Add to Watchlist</ModalTitle>
                            <Form onSubmit={handleAddStock}>
                                <FormGroup>
                                    <Label>Stock Symbol</Label>
                                    <Input
                                        type="text"
                                        placeholder="AAPL, TSLA, NVDA..."
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ symbol: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </FormGroup>
                                <SubmitButton type="submit">Add to Watchlist</SubmitButton>
                            </Form>
                        </ModalContent>
                    </Modal>
                )}
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>My Watchlist</Title>
                <Subtitle>Real-time tracking of your favorite stocks</Subtitle>
            </Header>

            {/* STATS */}
            <StatsGrid>
                <StatCard>
                    <StatIcon>
                        <Eye size={24} />
                    </StatIcon>
                    <StatLabel>Tracking</StatLabel>
                    <StatValue>{stats.totalStocks}</StatValue>
                    <StatSubtext>Stocks in watchlist</StatSubtext>
                </StatCard>

                <StatCard variant="success">
                    <StatIcon variant="success">
                        <TrendingUp size={24} />
                    </StatIcon>
                    <StatLabel>Gainers</StatLabel>
                    <StatValue>{stats.gainers}</StatValue>
                    <StatSubtext>Stocks up today</StatSubtext>
                </StatCard>

                <StatCard variant="danger">
                    <StatIcon variant="danger">
                        <TrendingDown size={24} />
                    </StatIcon>
                    <StatLabel>Losers</StatLabel>
                    <StatValue>{stats.losers}</StatValue>
                    <StatSubtext>Stocks down today</StatSubtext>
                </StatCard>

                <StatCard variant={stats.avgChange >= 0 ? 'success' : 'danger'}>
                    <StatIcon variant={stats.avgChange >= 0 ? 'success' : 'danger'}>
                        <BarChart3 size={24} />
                    </StatIcon>
                    const toast = useToast();
                    <StatLabel>Avg Change</StatLabel>
                    <StatValue>{stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(2)}%</StatValue>
                    <StatSubtext>Average performance</StatSubtext>
                </StatCard>
            </StatsGrid>

            {/* WATCHLIST */}
            <WatchlistGrid>
                {watchlist.map((stock) => {
                    const symbol = stock.symbol || stock.ticker || 'Unknown';
                    const price = stock.currentPrice || stock.price || 0;
                    const change = stock.change || 0;
                    const changePercent = stock.changePercent || 0;
                    const positive = changePercent >= 0;

                    return (
                        <WatchCard key={symbol} positive={positive}>
                            <WatchHeader>
                                <div>
                                    <WatchSymbol>
                                        {symbol}
                                        {positive ? 
                                            <Star size={20} color="#10b981" /> : 
                                            <Flame size={20} color="#ef4444" />
                                        }
                                    </WatchSymbol>
                                    <WatchName>{stock.name || 'Company Name'}</WatchName>
                                </div>
                                <ActionButtons>
                                    <IconButton>
                                        <Bell size={18} />
                                    </IconButton>
                                    <IconButton variant="danger" onClick={() => handleRemoveStock(symbol)}>
                                        <Trash2 size={18} />
                                    </IconButton>
                                </ActionButtons>
                            </WatchHeader>

                            <PriceSection>
                                <CurrentPrice>${price.toFixed(2)}</CurrentPrice>
                                <PriceChange positive={positive}>
                                    {positive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    {positive ? '+' : ''}${Math.abs(change).toFixed(2)} ({positive ? '+' : ''}{changePercent.toFixed(2)}%)
                                </PriceChange>
                            </PriceSection>

                            <StatsRow>
                                <StatItem>
                                    <StatItemLabel>High</StatItemLabel>
                                    <StatItemValue>${(price * 1.05).toFixed(2)}</StatItemValue>
                                </StatItem>
                                <StatItem>
                                    <StatItemLabel>Low</StatItemLabel>
                                    <StatItemValue>${(price * 0.95).toFixed(2)}</StatItemValue>
                                </StatItem>
                                <StatItem>
                                    <StatItemLabel>Volume</StatItemLabel>
                                    <StatItemValue>{(Math.random() * 100).toFixed(1)}M</StatItemValue>
                                </StatItem>
                            </StatsRow>

                            <MiniChart>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stock.chartData || []}>
                                        <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={positive ? '#10b981' : '#ef4444'} 
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </MiniChart>

                            <AlertBadge active={stock.hasAlert}>
                                {stock.hasAlert ? <Bell size={16} /> : <BellOff size={16} />}
                                {stock.hasAlert ? 'Alert Active' : 'No Alerts'}
                            </AlertBadge>
                        </WatchCard>
                    );
                })}
            </WatchlistGrid>

            <AddButton onClick={() => setShowAddModal(true)}>
                <Plus size={28} />
            </AddButton>

            {showAddModal && (
                <Modal onClick={() => setShowAddModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowAddModal(false)}>
                            <X size={20} />
                        </CloseButton>
                        <ModalTitle>Add to Watchlist</ModalTitle>
                        <Form onSubmit={handleAddStock}>
                            <FormGroup>
                                <Label>Stock Symbol</Label>
                                <Input
                                    type="text"
                                    placeholder="AAPL, TSLA, NVDA..."
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ symbol: e.target.value.toUpperCase() })}
                                    required
                                />
                            </FormGroup>
                            <SubmitButton type="submit">Add to Watchlist</SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
};

export default WatchlistPage;