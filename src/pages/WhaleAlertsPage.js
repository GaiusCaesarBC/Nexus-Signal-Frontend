// src/pages/WhaleAlertsPage.js - Whale & Insider Trading Alerts (THEMED)
// Comprehensive view of insider trades, crypto whales, unusual options, and congress trades

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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

const waveAnimation = keyframes`
    0% { transform: translateX(0) translateY(0); }
    50% { transform: translateX(-5px) translateY(-5px); }
    100% { transform: translateX(0) translateY(0); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 100px 2rem 2rem;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};

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
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #f7931a 50%, #10b981 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 1rem;

    svg {
        filter: drop-shadow(0 0 10px ${props => props.theme?.brand?.primary || '#00adef'}80);
    }

    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
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
    background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}4D;
    border-radius: 10px;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}33;
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
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
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
    background: linear-gradient(135deg, ${props => props.$bgStart || `${props.theme?.brand?.primary || '#00adef'}1A`} 0%, ${props => props.$bgEnd || `${props.theme?.brand?.primary || '#00adef'}0D`} 100%);
    border: 1px solid ${props => props.$borderColor || `${props.theme?.brand?.primary || '#00adef'}4D`};
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
    background: ${props => props.$bg || `${props.theme?.brand?.primary || '#00adef'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme?.brand?.primary || '#00adef'};
    margin-bottom: 1rem;
    animation: ${waveAnimation} 3s ease-in-out infinite;
`;

const SummaryTitle = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const SummaryValue = styled.div`
    font-size: 1.8rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
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
    background: ${props => props.$bullish 
        ? `${props.theme?.success || '#10b981'}33` 
        : `${props.theme?.error || '#ef4444'}33`};
    color: ${props => props.$bullish 
        ? (props.theme?.success || '#10b981') 
        : (props.theme?.error || '#ef4444')};
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
    background: ${props => props.$active 
        ? `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'}4D, ${props.theme?.brand?.accent || '#8b5cf6'}33)` 
        : 'transparent'};
    border: 1px solid ${props => props.$active 
        ? `${props.theme?.brand?.primary || '#00adef'}80` 
        : 'transparent'};
    border-radius: 10px;
    color: ${props => props.$active 
        ? (props.theme?.brand?.primary || '#00adef') 
        : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${props => props.$active ? '' : `${props.theme?.brand?.primary || '#00adef'}1A`};
        color: ${props => props.$active ? '' : (props.theme?.brand?.primary || '#00adef')};
    }

    .count {
        background: ${props => props.$active 
            ? `${props.theme?.brand?.primary || '#00adef'}4D` 
            : `${props.theme?.text?.tertiary || '#64748b'}4D`};
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
        border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
        border-radius: 10px;
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
        font-size: 0.95rem;

        &:focus {
            outline: none;
            border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        }

        &::placeholder {
            color: ${props => props.theme?.text?.tertiary || '#64748b'};
        }
    }

    svg {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const FilterButton = styled.button`
    padding: 0.75rem 1rem;
    background: ${props => props.$active 
        ? `${props.theme?.brand?.primary || '#00adef'}33` 
        : 'rgba(0, 0, 0, 0.3)'};
    border: 1px solid ${props => props.$active 
        ? `${props.theme?.brand?.primary || '#00adef'}80` 
        : `${props.theme?.text?.tertiary || '#64748b'}4D`};
    border-radius: 10px;
    color: ${props => props.$active 
        ? (props.theme?.brand?.primary || '#00adef') 
        : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }
`;

// Alerts List
const AlertsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const AlertCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => {
        if (props.$significance === 'massive') return `${props.theme?.warning || '#f59e0b'}80`;
        if (props.$significance === 'high') return `${props.theme?.brand?.accent || '#8b5cf6'}66`;
        return `${props.theme?.brand?.primary || '#00adef'}33`;
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
        box-shadow: 0 0 20px ${props.theme?.warning || '#f59e0b'}40;
    `}

    &:hover {
        transform: translateY(-3px);
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => {
            if (props.$type === 'BUY' || props.$bullish) return props.theme?.success || '#10b981';
            if (props.$type === 'SELL' || props.$bearish) return props.theme?.error || '#ef4444';
            if (props.$type === 'exchange_outflow') return props.theme?.success || '#10b981';
            if (props.$type === 'exchange_inflow') return props.theme?.error || '#ef4444';
            return props.theme?.brand?.primary || '#00adef';
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
    background: ${props => props.$bg || `${props.theme?.brand?.primary || '#00adef'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme?.brand?.primary || '#00adef'};
`;

const AlertInfo = styled.div``;

const AlertSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 800;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const AlertSubtitle = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
`;

const AlertRight = styled.div`
    text-align: right;
`;

const AlertValue = styled.div`
    font-size: 1.4rem;
    font-weight: 700;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
`;

const AlertChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: ${props => props.$positive 
        ? (props.theme?.success || '#10b981') 
        : (props.theme?.error || '#ef4444')};
    font-weight: 600;
`;

const AlertDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid ${props => props.theme?.text?.tertiary || '#64748b'}33;
`;

const AlertDetail = styled.div`
    .label {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .value {
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
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
        if (props.$variant === 'buy') return `${props.theme?.success || '#10b981'}33`;
        if (props.$variant === 'sell') return `${props.theme?.error || '#ef4444'}33`;
        if (props.$variant === 'bullish') return `${props.theme?.success || '#10b981'}33`;
        if (props.$variant === 'bearish') return `${props.theme?.error || '#ef4444'}33`;
        if (props.$variant === 'massive') return `${props.theme?.warning || '#f59e0b'}33`;
        if (props.$variant === 'high') return `${props.theme?.brand?.accent || '#8b5cf6'}33`;
        return `${props.theme?.brand?.primary || '#00adef'}33`;
    }};
    color: ${props => {
        if (props.$variant === 'buy' || props.$variant === 'bullish') return props.theme?.success || '#10b981';
        if (props.$variant === 'sell' || props.$variant === 'bearish') return props.theme?.error || '#ef4444';
        if (props.$variant === 'massive') return props.theme?.warning || '#f59e0b';
        if (props.$variant === 'high') return props.theme?.brand?.accent || '#a78bfa';
        return props.theme?.brand?.primary || '#00adef';
    }};
`;

const AlertTime = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
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
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};

    svg {
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};

    svg {
        margin-bottom: 1rem;
        opacity: 0.5;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }

    h3 {
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
        margin-bottom: 0.5rem;
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
    const { theme } = useTheme();

    // Theme colors
    const primaryColor = theme?.brand?.primary || '#00adef';
    const secondaryColor = theme?.brand?.secondary || '#0088cc';
    const accentColor = theme?.brand?.accent || '#8b5cf6';
    const successColor = theme?.success || '#10b981';
    const errorColor = theme?.error || '#ef4444';
    const warningColor = theme?.warning || '#f59e0b';
    const infoColor = theme?.info || '#3b82f6';

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
                        theme={theme}
                        $type={alert.transactionType}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon theme={theme} $bg={`${infoColor}33`} $color={infoColor}>
                                    <Users size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol theme={theme}>
                                        <TickerLink symbol={alert.symbol} bold />
                                        <AlertBadge theme={theme} $variant={alert.transactionType?.toLowerCase()}>
                                            {alert.transactionType}
                                        </AlertBadge>
                                        {alert.significance === 'massive' && (
                                            <AlertBadge theme={theme} $variant="massive">🔥 MASSIVE</AlertBadge>
                                        )}
                                    </AlertSymbol>
                                    <AlertSubtitle theme={theme}>{alert.companyName}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue theme={theme} $color={alert.transactionType === 'BUY' ? successColor : errorColor}>
                                    {formatCurrency(alert.totalValue)}
                                </AlertValue>
                                <AlertChange theme={theme} $positive={alert.transactionType === 'BUY'}>
                                    {alert.transactionType === 'BUY' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {formatNumber(alert.shares)} shares
                                </AlertChange>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails theme={theme}>
                            <AlertDetail theme={theme}>
                                <div className="label">Insider</div>
                                <div className="value">{alert.insiderName}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Title</div>
                                <div className="value">{alert.insiderTitle}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Price</div>
                                <div className="value">${alert.pricePerShare?.toFixed(2)}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Source</div>
                                <div className="value">{alert.source}</div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime theme={theme}>
                            <Clock size={14} />
                            {formatTimeAgo(alert.filingDate || alert.transactionDate)}
                        </AlertTime>
                    </AlertCard>
                );

            case 'crypto':
                return (
                    <AlertCard 
                        key={alert.id}
                        theme={theme}
                        $type={alert.type}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon theme={theme} $bg={`${warningColor}33`} $color={warningColor}>
                                    <Waves size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol theme={theme}>
                                        <TickerLink symbol={alert.symbol} forceCrypto bold />
                                        <AlertBadge theme={theme} $variant={alert.type === 'exchange_outflow' ? 'buy' : 'sell'}>
                                            {alert.type === 'exchange_outflow' ? '📤 OUTFLOW' : '📥 INFLOW'}
                                        </AlertBadge>
                                        {alert.significance === 'massive' && (
                                            <AlertBadge theme={theme} $variant="massive">🐋 WHALE</AlertBadge>
                                        )}
                                    </AlertSymbol>
                                    <AlertSubtitle theme={theme}>{alert.blockchain}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue theme={theme} $color={alert.type === 'exchange_outflow' ? successColor : errorColor}>
                                    {formatCurrency(alert.amountUsd)}
                                </AlertValue>
                                <AlertChange theme={theme} $positive={alert.type === 'exchange_outflow'}>
                                    {formatNumber(alert.amount)} {alert.symbol}
                                </AlertChange>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails theme={theme}>
                            <AlertDetail theme={theme}>
                                <div className="label">From</div>
                                <div className="value">{alert.from?.name || 'Unknown'}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">To</div>
                                <div className="value">{alert.to?.name || 'Unknown'}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Signal</div>
                                <div className="value" style={{ color: alert.type === 'exchange_outflow' ? successColor : errorColor }}>
                                    {alert.type === 'exchange_outflow' ? 'Accumulation' : 'Distribution'}
                                </div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime theme={theme}>
                            <Clock size={14} />
                            {formatTimeAgo(alert.timestamp)}
                        </AlertTime>
                    </AlertCard>
                );

            case 'options':
                return (
                    <AlertCard 
                        key={alert.id}
                        theme={theme}
                        $bullish={alert.sentiment === 'BULLISH'}
                        $bearish={alert.sentiment === 'BEARISH'}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon theme={theme} $bg={`${accentColor}33`} $color={accentColor}>
                                    <BarChart3 size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol theme={theme}>
                                        <TickerLink symbol={alert.symbol} bold />
                                        <AlertBadge theme={theme} $variant={alert.sentiment?.toLowerCase()}>
                                            {alert.optionType} - {alert.sentiment}
                                        </AlertBadge>
                                        <AlertBadge theme={theme} $variant={alert.orderType === 'SWEEP' ? 'high' : 'default'}>
                                            {alert.orderType}
                                        </AlertBadge>
                                    </AlertSymbol>
                                    <AlertSubtitle theme={theme}>{alert.companyName}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue theme={theme} $color={accentColor}>
                                    {formatCurrency(alert.premium)}
                                </AlertValue>
                                <AlertChange theme={theme} $positive={alert.sentiment === 'BULLISH'}>
                                    {alert.contracts?.toLocaleString()} contracts
                                </AlertChange>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails theme={theme}>
                            <AlertDetail theme={theme}>
                                <div className="label">Strike</div>
                                <div className="value">${alert.strike}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Expiry</div>
                                <div className="value">{alert.expiry}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Vol/OI</div>
                                <div className="value">{alert.volumeVsOI}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Unusual Score</div>
                                <div className="value">{alert.unusualScore}/100</div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime theme={theme}>
                            <Clock size={14} />
                            {formatTimeAgo(alert.timestamp)}
                        </AlertTime>
                    </AlertCard>
                );

            case 'congress':
                return (
                    <AlertCard 
                        key={alert.id}
                        theme={theme}
                        $type={alert.transactionType}
                        $significance={alert.significance}
                        $delay={delay}
                    >
                        <AlertHeader>
                            <AlertLeft>
                                <AlertIcon theme={theme} $bg={`${successColor}33`} $color={successColor}>
                                    <Landmark size={24} />
                                </AlertIcon>
                                <AlertInfo>
                                    <AlertSymbol theme={theme}>
                                        <TickerLink symbol={alert.symbol} bold />
                                        <AlertBadge theme={theme} $variant={alert.transactionType?.toLowerCase()}>
                                            {alert.transactionType}
                                        </AlertBadge>
                                        <AlertBadge theme={theme} $variant={alert.party === 'D' ? 'default' : 'sell'}>
                                            {alert.party === 'D' ? '🔵 DEM' : '🔴 REP'}
                                        </AlertBadge>
                                    </AlertSymbol>
                                    <AlertSubtitle theme={theme}>{alert.companyName}</AlertSubtitle>
                                </AlertInfo>
                            </AlertLeft>
                            <AlertRight>
                                <AlertValue theme={theme}>{alert.amountRange}</AlertValue>
                            </AlertRight>
                        </AlertHeader>
                        <AlertDetails theme={theme}>
                            <AlertDetail theme={theme}>
                                <div className="label">Politician</div>
                                <div className="value">{alert.politicianName}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Chamber</div>
                                <div className="value">{alert.chamber}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">State</div>
                                <div className="value">{alert.state}</div>
                            </AlertDetail>
                            <AlertDetail theme={theme}>
                                <div className="label">Owner</div>
                                <div className="value">{alert.owner}</div>
                            </AlertDetail>
                        </AlertDetails>
                        <AlertTime theme={theme}>
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
        <PageContainer theme={theme}>
            <ContentWrapper>
                <Header>
                    <HeaderLeft>
                        <Title theme={theme}>
                            <Waves size={36} color={primaryColor} />
                            Whale & Insider Alerts
                        </Title>
                        <Subtitle theme={theme}>Track insider trades, crypto whales, unusual options, and congressional trades</Subtitle>
                    </HeaderLeft>
                    <HeaderRight>
                        {lastUpdated && (
                            <LastUpdated theme={theme}>
                                <Clock size={14} />
                                Updated {formatTimeAgo(lastUpdated)}
                            </LastUpdated>
                        )}
                        <RefreshButton 
                            theme={theme}
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
                        <SummaryCard 
                            theme={theme}
                            $bgStart={`${infoColor}26`} 
                            $bgEnd={`${infoColor}0D`} 
                            $borderColor={`${infoColor}4D`} 
                            $delay="0.1s"
                        >
                            <SummaryIcon theme={theme} $bg={`${infoColor}33`} $color={infoColor}>
                                <Users size={24} />
                            </SummaryIcon>
                            <SummaryTitle theme={theme}>Insider Trading</SummaryTitle>
                            <SummaryValue theme={theme}>{summary.insider?.total || 0} Trades</SummaryValue>
                            <SummarySentiment theme={theme} $bullish={summary.insider?.sentiment === 'BULLISH'}>
                                {summary.insider?.sentiment === 'BULLISH' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.insider?.buys || 0} Buys / {summary.insider?.sells || 0} Sells
                            </SummarySentiment>
                        </SummaryCard>

                        <SummaryCard 
                            theme={theme}
                            $bgStart={`${warningColor}26`} 
                            $bgEnd={`${warningColor}0D`} 
                            $borderColor={`${warningColor}4D`} 
                            $delay="0.2s"
                        >
                            <SummaryIcon theme={theme} $bg={`${warningColor}33`} $color={warningColor}>
                                <Waves size={24} />
                            </SummaryIcon>
                            <SummaryTitle theme={theme}>Crypto Whales</SummaryTitle>
                            <SummaryValue theme={theme}>{summary.crypto?.total || 0} Movements</SummaryValue>
                            <SummarySentiment theme={theme} $bullish={summary.crypto?.sentiment === 'ACCUMULATION'}>
                                {summary.crypto?.sentiment === 'ACCUMULATION' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.crypto?.sentiment || 'NEUTRAL'}
                            </SummarySentiment>
                        </SummaryCard>

                        <SummaryCard 
                            theme={theme}
                            $bgStart={`${accentColor}26`} 
                            $bgEnd={`${accentColor}0D`} 
                            $borderColor={`${accentColor}4D`} 
                            $delay="0.3s"
                        >
                            <SummaryIcon theme={theme} $bg={`${accentColor}33`} $color={accentColor}>
                                <BarChart3 size={24} />
                            </SummaryIcon>
                            <SummaryTitle theme={theme}>Options Flow</SummaryTitle>
                            <SummaryValue theme={theme}>{summary.options?.total || 0} Unusual</SummaryValue>
                            <SummarySentiment theme={theme} $bullish={summary.options?.sentiment === 'BULLISH'}>
                                {summary.options?.sentiment === 'BULLISH' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.options?.bullish || 0} Bullish / {summary.options?.bearish || 0} Bearish
                            </SummarySentiment>
                        </SummaryCard>

                        <SummaryCard 
                            theme={theme}
                            $bgStart={`${successColor}26`} 
                            $bgEnd={`${successColor}0D`} 
                            $borderColor={`${successColor}4D`} 
                            $delay="0.4s"
                        >
                            <SummaryIcon theme={theme} $bg={`${successColor}33`} $color={successColor}>
                                <Landmark size={24} />
                            </SummaryIcon>
                            <SummaryTitle theme={theme}>Congress Trades</SummaryTitle>
                            <SummaryValue theme={theme}>{summary.congress?.total || 0} Trades</SummaryValue>
                            <SummarySentiment theme={theme} $bullish={summary.congress?.buys > summary.congress?.sells}>
                                {summary.congress?.buys > summary.congress?.sells ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {summary.congress?.buys || 0} Buys / {summary.congress?.sells || 0} Sells
                            </SummarySentiment>
                        </SummaryCard>
                    </SummaryGrid>
                )}

                {/* Tab Navigation */}
                <TabNav>
                    <TabButton theme={theme} $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                        <Activity size={18} />
                        All Alerts
                        <span className="count">{alerts.length}</span>
                    </TabButton>
                    <TabButton theme={theme} $active={activeTab === 'insider'} onClick={() => setActiveTab('insider')}>
                        <Users size={18} />
                        Insider
                    </TabButton>
                    <TabButton theme={theme} $active={activeTab === 'crypto'} onClick={() => setActiveTab('crypto')}>
                        <Waves size={18} />
                        Crypto Whales
                    </TabButton>
                    <TabButton theme={theme} $active={activeTab === 'options'} onClick={() => setActiveTab('options')}>
                        <BarChart3 size={18} />
                        Options Flow
                    </TabButton>
                    <TabButton theme={theme} $active={activeTab === 'congress'} onClick={() => setActiveTab('congress')}>
                        <Landmark size={18} />
                        Congress
                    </TabButton>
                    <TabButton theme={theme} $active={activeTab === 'hedgefunds'} onClick={() => setActiveTab('hedgefunds')}>
                        <Building2 size={18} />
                        Hedge Funds
                    </TabButton>
                </TabNav>

                {/* Filters */}
                <FiltersBar>
                    <SearchInput theme={theme}>
                        <Search size={18} />
                        <input 
                            type="text"
                            placeholder="Search by symbol, name, or insider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchInput>
                    <FilterButton 
                        theme={theme}
                        $active={transactionFilter === 'all'} 
                        onClick={() => setTransactionFilter('all')}
                    >
                        All
                    </FilterButton>
                    <FilterButton 
                        theme={theme}
                        $active={transactionFilter === 'buy'} 
                        onClick={() => setTransactionFilter('buy')}
                    >
                        <TrendingUp size={16} />
                        Bullish
                    </FilterButton>
                    <FilterButton 
                        theme={theme}
                        $active={transactionFilter === 'sell'} 
                        onClick={() => setTransactionFilter('sell')}
                    >
                        <TrendingDown size={16} />
                        Bearish
                    </FilterButton>
                </FiltersBar>

                {/* Alerts List */}
                {loading ? (
                    <LoadingContainer theme={theme}>
                        <Activity size={48} />
                        <p>Loading whale alerts...</p>
                    </LoadingContainer>
                ) : filteredAlerts.length === 0 ? (
                    <EmptyState theme={theme}>
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
