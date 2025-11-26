// src/pages/WhaleAlertsPage.js - Whale & Insider Trading Alerts
// Comprehensive view of insider trades, crypto whales, unusual options, and congress trades

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp, TrendingDown, Activity, DollarSign, 
    AlertTriangle, Eye, RefreshCw, Filter, Search,
    ArrowUpRight, ArrowDownRight, ExternalLink, Clock,
    Users, Building2, Landmark, Waves, BarChart3,
    Zap, Target, ChevronRight, Info, Award, Globe
} from 'lucide-react';
import TickerLink from '../components/TickerLink';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.6); }
`;

const waveAnimation = keyframes`
    0% { transform: translateX(0) translateY(0); }
    50% { transform: translateX(-5px) translateY(-5px); }
    100% { transform: translateX(0) translateY(0); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 100px 2rem 2rem;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;

    @media (max-width: 768px) {
        padding: 80px 1rem 1rem;
    }
`;

const ContentWrapper = styled.div`
    max-width: 1800px;
    margin: 0 auto;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00adef 0%, #f7931a 50%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;

    svg {
        filter: drop-shadow(0 0 10px rgba(0, 173, 237, 0.5));
    }

    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        transition: transform 0.3s ease;
    }

    &.loading svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const LastUpdated = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// Summary Cards
const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const SummaryCard = styled.div`
    background: linear-gradient(135deg, ${props => props.$bgStart || 'rgba(0, 173, 237, 0.1)'} 0%, ${props => props.$bgEnd || 'rgba(0, 173, 237, 0.05)'} 100%);
    border: 1px solid ${props => props.$borderColor || 'rgba(0, 173, 237, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$delay || '0s'};
    animation-fill-mode: backwards;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }
`;

const SummaryIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#00adef'};
    margin-bottom: 1rem;
    animation: ${waveAnimation} 3s ease-in-out infinite;
`;

const SummaryTitle = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const SummaryValue = styled.div`
    font-size: 1.8rem;
    font-weight: 800;
    color: ${props => props.$color || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const SummarySentiment = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    background: ${props => props.$bullish ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    color: ${props => props.$bullish ? '#10b981' : '#ef4444'};
`;

// Tab Navigation
const TabNav = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem;
    border-radius: 12px;
    flex-wrap: wrap;
`;

const TabButton = styled.button`
    padding: 1rem 1.5rem;
    background: ${props => props.$active ? 'linear-gradient(135deg, rgba(0, 173, 237, 0.3), rgba(139, 92, 246, 0.2))' : 'transparent'};
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'transparent'};
    border-radius: 10px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${props => props.$active ? '' : 'rgba(0, 173, 237, 0.1)'};
        color: ${props => props.$active ? '' : '#00adef'};
    }

    .count {
        background: ${props => props.$active ? 'rgba(0, 173, 237, 0.3)' : 'rgba(100, 116, 139, 0.3)'};
        padding: 0.2rem 0.6rem;
        border-radius: 10px;
        font-size: 0.8rem;
    }
`;

// Filters
const FiltersBar = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
`;

const SearchInput = styled.div`
    flex: 1;
    min-width: 250px;
    position: relative;

    input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(0, 173, 237, 0.2);
        border-radius: 10px;
        color: #e0e6ed;
        font-size: 0.95rem;

        &:focus {
            outline: none;
            border-color: rgba(0, 173, 237, 0.5);
        }

        &::placeholder {
            color: #64748b;
        }
    }

    svg {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
    }
`;

const FilterButton = styled.button`
    padding: 0.75rem 1rem;
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.2)' : 'rgba(0, 0, 0, 0.3)'};
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
    }
`;

// Alerts List
const AlertsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const AlertCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => {
        if (props.$significance === 'massive') return 'rgba(245, 158, 11, 0.5)';
        if (props.$significance === 'high') return 'rgba(139, 92, 246, 0.4)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out;
    animation-delay: ${props => props.$delay || '0s'};
    animation-fill-mode: backwards;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    ${props => props.$significance === 'massive' && css`
        animation: ${glow} 2s ease-in-out infinite;
    `}
    &:hover {
        transform: translateY(-3px);
        border-color: rgba(0, 173, 237, 0.5);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => {
            if (props.$type === 'BUY' || props.$bullish) return '#10b981';
            if (props.$type === 'SELL' || props.$bearish) return '#ef4444';
            if (props.$type === 'exchange_outflow') return '#10b981';
            if (props.$type === 'exchange_inflow') return '#ef4444';
            return '#00adef';
        }};
    }
`;

const AlertHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const AlertLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const AlertIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#00adef'};
`;

const AlertInfo = styled.div``;

const AlertSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 800;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AlertSubtitle = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const AlertRight = styled.div`
    text-align: right;
`;

const AlertValue = styled.div`
    font-size: 1.4rem;
    font-weight: 700;
    color: ${props => props.$color || '#e0e6ed'};
`;

const AlertChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
`;

const AlertDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(100, 116, 139, 0.2);
`;

const AlertDetail = styled.div`
    .label {
        color: #64748b;
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .value {
        color: #e0e6ed;
        font-weight: 600;
    }
`;

const AlertBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    background: ${props => {
        if (props.$variant === 'buy') return 'rgba(16, 185, 129, 0.2)';
        if (props.$variant === 'sell') return 'rgba(239, 68, 68, 0.2)';
        if (props.$variant === 'bullish') return 'rgba(16, 185, 129, 0.2)';
        if (props.$variant === 'bearish') return 'rgba(239, 68, 68, 0.2)';
        if (props.$variant === 'massive') return 'rgba(245, 158, 11, 0.2)';
        if (props.$variant === 'high') return 'rgba(139, 92, 246, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.$variant === 'buy' || props.$variant === 'bullish') return '#10b981';
        if (props.$variant === 'sell' || props.$variant === 'bearish') return '#ef4444';
        if (props.$variant === 'massive') return '#f59e0b';
        if (props.$variant === 'high') return '#a78bfa';
        return '#00adef';
    }};
`;

const AlertTime = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
`;

// Loading & Empty States
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #94a3b8;

    svg {
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem;
    color: #64748b;

    svg {
        margin-bottom: 1rem;
        opacity: 0.5;
    }
`;

// ============ HELPER FUNCTIONS ============
const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
};

const formatNumber = (value) => {
    if (!value) return '0';
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

const getAlertIcon = (alertType) => {
    switch (alertType) {
        case 'insider': return <Users size={24} />;
        case 'crypto': return <Waves size={24} />;
        case 'options': return <BarChart3 size={24} />;
        case 'congress': return <Landmark size={24} />;
        case 'hedgefund': return <Building2 size={24} />;
        default: return <AlertTriangle size={24} />;
    }
};

// ============ MAIN COMPONENT ============
const WhaleAlertsPage = () => {
    const navigate = useNavigate();
    const { api } = useAuth();

    // State
    const [activeTab, setActiveTab] = useState('all');
    const [alerts, setAlerts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [transactionFilter, setTransactionFilter] = useState('all'); // all, buy, sell
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch data
    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            // Fetch summary and alerts in parallel
            const [summaryRes, alertsRes] = await Promise.all([
                api.get('/whale/summary'),
                api.get('/whale/alerts', { params: { limit: 100 } })
            ]);

            if (summaryRes.data.success) {
                setSummary(summaryRes.data.summary);
            }

            if (alertsRes.data.success) {
                setAlerts(alertsRes.data.alerts);
            }

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching whale data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch tab-specific data
    const fetchTabData = useCallback(async (tab) => {
        try {
            setLoading(true);
            let endpoint = '/whale/alerts';
            
            switch (tab) {
                case 'insider':
                    endpoint = '/whale/insider';
                    break;
                case 'crypto':
                    endpoint = '/whale/crypto';
                    break;
                case 'options':
                    endpoint = '/whale/options';
                    break;
                case 'congress':
                    endpoint = '/whale/congress';
                    break;
                case 'hedgefunds':
                    endpoint = '/whale/hedge-funds';
                    break;
                default:
                    endpoint = '/whale/alerts';
            }

            const response = await api.get(endpoint, { params: { limit: 50 } });
            
            if (response.data.success) {
                // Normalize the response data
                const data = response.data.trades || 
                            response.data.transactions || 
                            response.data.options || 
                            response.data.filings ||
                            response.data.alerts || [];
                setAlerts(data.map(item => ({ ...item, alertType: tab === 'all' ? item.alertType : tab })));
            }
        } catch (error) {
            console.error(`Error fetching ${tab} data:`, error);
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Tab change handler
    useEffect(() => {
        if (activeTab === 'all') {
            fetchData();
        } else {
            fetchTabData(activeTab);
        }
    }, [activeTab, fetchData, fetchTabData]);

    // Filter alerts
    const filteredAlerts = alerts.filter(alert => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSymbol = alert.symbol?.toLowerCase().includes(query);
            const matchesName = alert.companyName?.toLowerCase().includes(query);
            const matchesInsider = alert.insiderName?.toLowerCase().includes(query);
            const matchesPolitician = alert.politicianName?.toLowerCase().includes(query);
            if (!matchesSymbol && !matchesName && !matchesInsider && !matchesPolitician) return false;
        }

        // Transaction type filter
        if (transactionFilter !== 'all') {
            if (transactionFilter === 'buy') {
                const isBuy = alert.transactionType === 'BUY' || 
                             alert.sentiment === 'BULLISH' || 
                             alert.type === 'exchange_outflow' ||
                             alert.action === 'NEW_POSITION' ||
                             alert.action === 'INCREASED';
                if (!isBuy) return false;
            }
            if (transactionFilter === 'sell') {
                const isSell = alert.transactionType === 'SELL' || 
                              alert.sentiment === 'BEARISH' || 
                              alert.type === 'exchange_inflow' ||
                              alert.action === 'SOLD_OUT' ||
                              alert.action === 'DECREASED';
                if (!isSell) return false;
            }
        }

        return true;
    });

    // Render alert card based on type
    const renderAlertCard = (alert, index) => {
        const alertType = alert.alertType || 'insider';
        const delay = `${index * 0.05}s`;

        switch (alertType) {
            case 'insider':
                return (
                    <AlertCard 
                        key={alert.id} 
                        $type={alert.transactionType}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon $bg="rgba(59, 130, 246, 0.2)" $color="#3b82f6">
                                    <Users size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol>
                                        <TickerLink symbol={alert.symbol} bold />
                                        <AlertBadge $variant={alert.transactionType?.toLowerCase()}>
                                            {alert.transactionType}
                                        </AlertBadge>
                                        {alert.significance === 'massive' && (
                                            <AlertBadge $variant="massive">🔥 MASSIVE</AlertBadge>
                                        )}
                                    </AlertSymbol>
                                    <AlertSubtitle>{alert.companyName}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue $color={alert.transactionType === 'BUY' ? '#10b981' : '#ef4444'}>
                                    {formatCurrency(alert.totalValue)}
                                </AlertValue>
                                <AlertChange $positive={alert.transactionType === 'BUY'}>
                                    {alert.transactionType === 'BUY' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {formatNumber(alert.shares)} shares
                                </AlertChange>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails>
                            <AlertDetail>
                                <div className="label">Insider</div>
                                <div className="value">{alert.insiderName}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Title</div>
                                <div className="value">{alert.insiderTitle}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Price</div>
                                <div className="value">${alert.pricePerShare?.toFixed(2)}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Source</div>
                                <div className="value">{alert.source}</div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime>
                            <Clock size={14} />
                            {formatTimeAgo(alert.filingDate || alert.transactionDate)}
                        </AlertTime>
                    </AlertCard>
                );

            case 'crypto':
                return (
                    <AlertCard 
                        key={alert.id} 
                        $type={alert.type}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon $bg="rgba(247, 147, 26, 0.2)" $color="#f7931a">
                                    <Waves size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol>
                                        <TickerLink symbol={alert.symbol} forceCrypto bold />
                                        <AlertBadge $variant={alert.type === 'exchange_outflow' ? 'buy' : 'sell'}>
                                            {alert.type === 'exchange_outflow' ? '📤 OUTFLOW' : '📥 INFLOW'}
                                        </AlertBadge>
                                        {alert.significance === 'massive' && (
                                            <AlertBadge $variant="massive">🐋 WHALE</AlertBadge>
                                        )}
                                    </AlertSymbol>
                                    <AlertSubtitle>{alert.blockchain}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue $color={alert.type === 'exchange_outflow' ? '#10b981' : '#ef4444'}>
                                    {formatCurrency(alert.amountUsd)}
                                </AlertValue>
                                <AlertChange $positive={alert.type === 'exchange_outflow'}>
                                    {formatNumber(alert.amount)} {alert.symbol}
                                </AlertChange>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails>
                            <AlertDetail>
                                <div className="label">From</div>
                                <div className="value">{alert.from?.name || 'Unknown'}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">To</div>
                                <div className="value">{alert.to?.name || 'Unknown'}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Signal</div>
                                <div className="value" style={{ color: alert.type === 'exchange_outflow' ? '#10b981' : '#ef4444' }}>
                                    {alert.type === 'exchange_outflow' ? 'Accumulation' : 'Distribution'}
                                </div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime>
                            <Clock size={14} />
                            {formatTimeAgo(alert.timestamp)}
                        </AlertTime>
                    </AlertCard>
                );

            case 'options':
                return (
                    <AlertCard 
                        key={alert.id} 
                        $bullish={alert.sentiment === 'BULLISH'}
                        $bearish={alert.sentiment === 'BEARISH'}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon $bg="rgba(139, 92, 246, 0.2)" $color="#a78bfa">
                                    <BarChart3 size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol>
                                        <TickerLink symbol={alert.symbol} bold />
                                        <AlertBadge $variant={alert.sentiment?.toLowerCase()}>
                                            {alert.optionType} - {alert.sentiment}
                                        </AlertBadge>
                                        <AlertBadge $variant={alert.orderType === 'SWEEP' ? 'high' : 'default'}>
                                            {alert.orderType}
                                        </AlertBadge>
                                    </AlertSymbol>
                                    <AlertSubtitle>{alert.companyName}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue $color="#a78bfa">
                                    {formatCurrency(alert.premium)}
                                </AlertValue>
                                <AlertChange $positive={alert.sentiment === 'BULLISH'}>
                                    {alert.contracts?.toLocaleString()} contracts
                                </AlertChange>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails>
                            <AlertDetail>
                                <div className="label">Strike</div>
                                <div className="value">${alert.strike}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Expiry</div>
                                <div className="value">{alert.expiry}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Vol/OI</div>
                                <div className="value">{alert.volumeVsOI}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Unusual Score</div>
                                <div className="value">{alert.unusualScore}/100</div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime>
                            <Clock size={14} />
                            {formatTimeAgo(alert.timestamp)}
                        </AlertTime>
                    </AlertCard>
                );

            case 'congress':
                return (
                    <AlertCard 
                        key={alert.id} 
                        $type={alert.transactionType}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon $bg="rgba(16, 185, 129, 0.2)" $color="#10b981">
                                    <Landmark size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol>
                                        <TickerLink symbol={alert.symbol} bold />
                                        <AlertBadge $variant={alert.transactionType?.toLowerCase()}>
                                            {alert.transactionType}
                                        </AlertBadge>
                                        <AlertBadge $variant={alert.party === 'D' ? 'default' : 'sell'}>
                                            {alert.party === 'D' ? '🔵 DEM' : '🔴 REP'}
                                        </AlertBadge>
                                    </AlertSymbol>
                                    <AlertSubtitle>{alert.companyName}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue>{alert.amountRange}</AlertValue>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails>
                            <AlertDetail>
                                <div className="label">Politician</div>
                                <div className="value">{alert.politicianName}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Chamber</div>
                                <div className="value">{alert.chamber}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">State</div>
                                <div className="value">{alert.state}</div>
                            </AlertDetail>
                            <AlertDetail>
                                <div className="label">Owner</div>
                                <div className="value">{alert.owner}</div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime>
                            <Clock size={14} />
                            Disclosed {formatTimeAgo(alert.disclosureDate)}
                        </AlertTime>
                    </AlertCard>
                );

            default:
                return null;
        }
    };

    return (
        <PageContainer>
            <ContentWrapper>
                <Header>
                    <HeaderLeft>
                        <Title>
                            <Waves size={36} />
                            Whale & Insider Alerts
                        </Title>
                        <Subtitle>Track insider trades, crypto whales, unusual options, and congressional trades</Subtitle>
                    </HeaderLeft>
                    <HeaderRight>
                        {lastUpdated && (
                            <LastUpdated>
                                <Clock size={14} />
                                Updated {formatTimeAgo(lastUpdated)}
                            </LastUpdated>
                        )}
                        <RefreshButton 
                            onClick={() => fetchData(true)} 
                            disabled={refreshing}
                            className={refreshing ? 'loading' : ''}
                        >
                            <RefreshCw size={18} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </RefreshButton>
                    </HeaderRight>
                </Header>

                {/* Summary Cards */}
                {summary && (
                    <SummaryGrid>
                        <SummaryCard $bgStart="rgba(59, 130, 246, 0.15)" $bgEnd="rgba(59, 130, 246, 0.05)" $borderColor="rgba(59, 130, 246, 0.3)" $delay="0.1s">
                            <SummaryIcon $bg="rgba(59, 130, 246, 0.2)" $color="#3b82f6">
                                <Users size={24} />
                            </SummaryIcon>
                            <SummaryTitle>Insider Trading</SummaryTitle>
                            <SummaryValue>{summary.insider?.total || 0} Trades</SummaryValue>
                            <SummarySentiment $bullish={summary.insider?.sentiment === 'BULLISH'}>
                                {summary.insider?.sentiment === 'BULLISH' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.insider?.buys || 0} Buys / {summary.insider?.sells || 0} Sells
                            </SummarySentiment>
                        </SummaryCard>

                        <SummaryCard $bgStart="rgba(247, 147, 26, 0.15)" $bgEnd="rgba(247, 147, 26, 0.05)" $borderColor="rgba(247, 147, 26, 0.3)" $delay="0.2s">
                            <SummaryIcon $bg="rgba(247, 147, 26, 0.2)" $color="#f7931a">
                                <Waves size={24} />
                            </SummaryIcon>
                            <SummaryTitle>Crypto Whales</SummaryTitle>
                            <SummaryValue>{summary.crypto?.total || 0} Movements</SummaryValue>
                            <SummarySentiment $bullish={summary.crypto?.sentiment === 'ACCUMULATION'}>
                                {summary.crypto?.sentiment === 'ACCUMULATION' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.crypto?.sentiment || 'NEUTRAL'}
                            </SummarySentiment>
                        </SummaryCard>

                        <SummaryCard $bgStart="rgba(139, 92, 246, 0.15)" $bgEnd="rgba(139, 92, 246, 0.05)" $borderColor="rgba(139, 92, 246, 0.3)" $delay="0.3s">
                            <SummaryIcon $bg="rgba(139, 92, 246, 0.2)" $color="#a78bfa">
                                <BarChart3 size={24} />
                            </SummaryIcon>
                            <SummaryTitle>Options Flow</SummaryTitle>
                            <SummaryValue>{summary.options?.total || 0} Unusual</SummaryValue>
                            <SummarySentiment $bullish={summary.options?.sentiment === 'BULLISH'}>
                                {summary.options?.sentiment === 'BULLISH' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.options?.bullish || 0} Bullish / {summary.options?.bearish || 0} Bearish
                            </SummarySentiment>
                        </SummaryCard>

                        <SummaryCard $bgStart="rgba(16, 185, 129, 0.15)" $bgEnd="rgba(16, 185, 129, 0.05)" $borderColor="rgba(16, 185, 129, 0.3)" $delay="0.4s">
                            <SummaryIcon $bg="rgba(16, 185, 129, 0.2)" $color="#10b981">
                                <Landmark size={24} />
                            </SummaryIcon>
                            <SummaryTitle>Congress Trades</SummaryTitle>
                            <SummaryValue>{summary.congress?.total || 0} Trades</SummaryValue>
                            <SummarySentiment $bullish={summary.congress?.buys > summary.congress?.sells}>
                                {summary.congress?.buys > summary.congress?.sells ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.congress?.buys || 0} Buys / {summary.congress?.sells || 0} Sells
                            </SummarySentiment>
                        </SummaryCard>
                    </SummaryGrid>
                )}

                {/* Tab Navigation */}
                <TabNav>
                    <TabButton $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                        <Activity size={18} />
                        All Alerts
                        <span className="count">{alerts.length}</span>
                    </TabButton>
                    <TabButton $active={activeTab === 'insider'} onClick={() => setActiveTab('insider')}>
                        <Users size={18} />
                        Insider
                    </TabButton>
                    <TabButton $active={activeTab === 'crypto'} onClick={() => setActiveTab('crypto')}>
                        <Waves size={18} />
                        Crypto Whales
                    </TabButton>
                    <TabButton $active={activeTab === 'options'} onClick={() => setActiveTab('options')}>
                        <BarChart3 size={18} />
                        Options Flow
                    </TabButton>
                    <TabButton $active={activeTab === 'congress'} onClick={() => setActiveTab('congress')}>
                        <Landmark size={18} />
                        Congress
                    </TabButton>
                    <TabButton $active={activeTab === 'hedgefunds'} onClick={() => setActiveTab('hedgefunds')}>
                        <Building2 size={18} />
                        Hedge Funds
                    </TabButton>
                </TabNav>

                {/* Filters */}
                <FiltersBar>
                    <SearchInput>
                        <Search size={18} />
                        <input 
                            type="text"
                            placeholder="Search by symbol, name, or insider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchInput>
                    <FilterButton 
                        $active={transactionFilter === 'all'} 
                        onClick={() => setTransactionFilter('all')}
                    >
                        All
                    </FilterButton>
                    <FilterButton 
                        $active={transactionFilter === 'buy'} 
                        onClick={() => setTransactionFilter('buy')}
                    >
                        <TrendingUp size={16} />
                        Bullish
                    </FilterButton>
                    <FilterButton 
                        $active={transactionFilter === 'sell'} 
                        onClick={() => setTransactionFilter('sell')}
                    >
                        <TrendingDown size={16} />
                        Bearish
                    </FilterButton>
                </FiltersBar>

                {/* Alerts List */}
                {loading ? (
                    <LoadingContainer>
                        <Activity size={48} />
                        <p>Loading whale alerts...</p>
                    </LoadingContainer>
                ) : filteredAlerts.length === 0 ? (
                    <EmptyState>
                        <AlertTriangle size={64} />
                        <h3>No alerts found</h3>
                        <p>Try adjusting your filters or check back later</p>
                    </EmptyState>
                ) : (
                    <AlertsContainer>
                        {filteredAlerts.map((alert, index) => renderAlertCard(alert, index))}
                    </AlertsContainer>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default WhaleAlertsPage;