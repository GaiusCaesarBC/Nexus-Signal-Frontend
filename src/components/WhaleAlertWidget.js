// src/components/WhaleAlertWidget.js - Dashboard Widget for Whale/Insider Alerts
// Compact view of recent whale activity for the main dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp, TrendingDown, Waves, Users, BarChart3,
    Landmark, ChevronRight, AlertTriangle, Activity, RefreshCw
} from 'lucide-react';
import TickerLink from './TickerLink';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.02); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// ============ STYLED COMPONENTS ============
const WidgetContainer = styled.div`
    background: linear-gradient(135deg, rgba(247, 147, 26, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(247, 147, 26, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.8s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(247, 147, 26, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
        pointer-events: none;
    }
`;

const WidgetHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    position: relative;
    z-index: 1;
`;

const WidgetTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 700;
    color: #f7931a;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;

    svg {
        animation: ${pulse} 2s ease-in-out infinite;
    }
`;

const LiveBadge = styled.span`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    padding: 0.3rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        animation: ${pulse} 1.5s ease-in-out infinite;
    }
`;

const SummaryRow = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
`;

const SummaryPill = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.1)'};
    color: ${props => props.$color || '#00adef'};
    border: 1px solid ${props => props.$border || 'rgba(0, 173, 237, 0.2)'};
`;

const AlertsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 320px;
    overflow-y: auto;
    position: relative;
    z-index: 1;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(247, 147, 26, 0.1);
        border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(247, 147, 26, 0.4);
        border-radius: 2px;
    }
`;

const AlertItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid ${props => {
        if (props.$significance === 'massive') return 'rgba(245, 158, 11, 0.4)';
        if (props.$bullish) return 'rgba(16, 185, 129, 0.2)';
        if (props.$bearish) return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(247, 147, 26, 0.1)';
    }};
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(247, 147, 26, 0.1);
        transform: translateX(4px);
        border-color: rgba(247, 147, 26, 0.4);
    }
`;

const AlertIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$bg || 'rgba(247, 147, 26, 0.2)'};
    color: ${props => props.$color || '#f7931a'};
    flex-shrink: 0;
`;

const AlertContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const AlertTop = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.2rem;
`;

const AlertSymbol = styled.span`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 0.95rem;
`;

const AlertBadge = styled.span`
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    background: ${props => props.$bullish ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    color: ${props => props.$bullish ? '#10b981' : '#ef4444'};
`;

const AlertDescription = styled.div`
    font-size: 0.8rem;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const AlertValue = styled.div`
    text-align: right;
    flex-shrink: 0;
`;

const AlertAmount = styled.div`
    font-weight: 700;
    font-size: 0.95rem;
    color: ${props => props.$bullish ? '#10b981' : props.$bearish ? '#ef4444' : '#e0e6ed'};
`;

const AlertTime = styled.div`
    font-size: 0.7rem;
    color: #64748b;
`;

const ViewAllButton = styled.button`
    width: 100%;
    padding: 0.875rem;
    margin-top: 1rem;
    background: linear-gradient(135deg, rgba(247, 147, 26, 0.2) 0%, rgba(247, 147, 26, 0.1) 100%);
    border: 1px solid rgba(247, 147, 26, 0.3);
    border-radius: 10px;
    color: #f7931a;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    z-index: 1;

    &:hover {
        background: linear-gradient(135deg, rgba(247, 147, 26, 0.3) 0%, rgba(247, 147, 26, 0.2) 100%);
        transform: translateY(-2px);
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #94a3b8;

    svg {
        animation: spin 1s linear infinite;
        margin-bottom: 0.5rem;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: #64748b;

    svg {
        margin-bottom: 0.5rem;
        opacity: 0.5;
    }
`;

// ============ HELPER FUNCTIONS ============
const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
};

const getAlertIcon = (type) => {
    switch (type) {
        case 'insider': return { icon: <Users size={16} />, bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
        case 'crypto': return { icon: <Waves size={16} />, bg: 'rgba(247, 147, 26, 0.2)', color: '#f7931a' };
        case 'options': return { icon: <BarChart3 size={16} />, bg: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' };
        case 'congress': return { icon: <Landmark size={16} />, bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
        default: return { icon: <AlertTriangle size={16} />, bg: 'rgba(247, 147, 26, 0.2)', color: '#f7931a' };
    }
};

// ============ COMPONENT ============
const WhaleAlertWidget = () => {
    const navigate = useNavigate();
    const { api } = useAuth();
    
    const [alerts, setAlerts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWhaleData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/whale/alerts', { params: { limit: 8 } });
                
                if (response.data.success) {
                    setAlerts(response.data.alerts || []);
                }

                // Also fetch summary
                const summaryRes = await api.get('/whale/summary');
                if (summaryRes.data.success) {
                    setSummary(summaryRes.data.summary);
                }
            } catch (error) {
                console.error('Error fetching whale data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWhaleData();
        
        // Refresh every 5 minutes
        const interval = setInterval(fetchWhaleData, 5 * 60 * 1000);
        return () => clearInterval(interval);
   }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const renderAlert = (alert, index) => {
        const iconData = getAlertIcon(alert.alertType);
        
        let isBullish = false;
        let isBearish = false;
        let description = '';
        let value = 0;
        let time = '';

        switch (alert.alertType) {
            case 'insider':
                isBullish = alert.transactionType === 'BUY';
                isBearish = alert.transactionType === 'SELL';
                description = `${alert.insiderTitle || 'Insider'} ${alert.transactionType?.toLowerCase()}`;
                value = alert.totalValue;
                time = alert.filingDate;
                break;
            case 'crypto':
                isBullish = alert.type === 'exchange_outflow';
                isBearish = alert.type === 'exchange_inflow';
                description = isBullish ? 'Exchange outflow' : 'Exchange inflow';
                value = alert.amountUsd;
                time = alert.timestamp;
                break;
            case 'options':
                isBullish = alert.sentiment === 'BULLISH';
                isBearish = alert.sentiment === 'BEARISH';
                description = `${alert.optionType} ${alert.orderType}`;
                value = alert.premium;
                time = alert.timestamp;
                break;
            case 'congress':
                isBullish = alert.transactionType === 'BUY';
                isBearish = alert.transactionType === 'SELL';
                description = alert.politicianName;
                value = 0; // Congress uses ranges
                time = alert.disclosureDate;
                break;
            default:
                break;
        }

        return (
            <AlertItem 
                key={alert.id || index} 
                $bullish={isBullish}
                $bearish={isBearish}
                $significance={alert.significance}
                onClick={() => navigate('/whale-alerts')}
            >
                <AlertIcon $bg={iconData.bg} $color={iconData.color}>
                    {iconData.icon}
                </AlertIcon>
                <AlertContent>
                    <AlertTop>
                        <TickerLink 
                            symbol={alert.symbol} 
                            forceCrypto={alert.alertType === 'crypto'}
                            variant="plain"
                        >
                            <AlertSymbol>{alert.symbol}</AlertSymbol>
                        </TickerLink>
                        <AlertBadge $bullish={isBullish}>
                            {isBullish ? '↑' : '↓'} {alert.alertType}
                        </AlertBadge>
                    </AlertTop>
                    <AlertDescription>{description}</AlertDescription>
                </AlertContent>
                <AlertValue>
                    {value > 0 && (
                        <AlertAmount $bullish={isBullish} $bearish={isBearish}>
                            {formatCurrency(value)}
                        </AlertAmount>
                    )}
                    {alert.alertType === 'congress' && (
                        <AlertAmount>{alert.amountRange?.split(' - ')[0]}</AlertAmount>
                    )}
                    <AlertTime>{formatTimeAgo(time)}</AlertTime>
                </AlertValue>
            </AlertItem>
        );
    };

    return (
        <WidgetContainer>
            <WidgetHeader>
                <WidgetTitle>
                    <Waves size={22} />
                    Whale Alerts
                </WidgetTitle>
                <LiveBadge>
                    <Activity size={12} />
                    Live
                </LiveBadge>
            </WidgetHeader>

            {summary && (
                <SummaryRow>
                    <SummaryPill 
                        $bg="rgba(59, 130, 246, 0.1)" 
                        $color="#3b82f6"
                        $border="rgba(59, 130, 246, 0.2)"
                    >
                        <Users size={12} />
                        {summary.insider?.total || 0} Insider
                    </SummaryPill>
                    <SummaryPill 
                        $bg="rgba(247, 147, 26, 0.1)" 
                        $color="#f7931a"
                        $border="rgba(247, 147, 26, 0.2)"
                    >
                        <Waves size={12} />
                        {summary.crypto?.total || 0} Whale
                    </SummaryPill>
                    <SummaryPill 
                        $bg={summary.overallSentiment === 'BULLISH' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'} 
                        $color={summary.overallSentiment === 'BULLISH' ? '#10b981' : '#ef4444'}
                        $border={summary.overallSentiment === 'BULLISH' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                    >
                        {summary.overallSentiment === 'BULLISH' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {summary.overallSentiment}
                    </SummaryPill>
                </SummaryRow>
            )}

            {loading ? (
                <LoadingState>
                    <RefreshCw size={24} />
                    <span>Loading alerts...</span>
                </LoadingState>
            ) : alerts.length === 0 ? (
                <EmptyState>
                    <AlertTriangle size={32} />
                    <p>No recent whale activity</p>
                </EmptyState>
            ) : (
                <AlertsList>
                    {alerts.map((alert, index) => renderAlert(alert, index))}
                </AlertsList>
            )}

            <ViewAllButton onClick={() => navigate('/whale-alerts')}>
                View All Whale Alerts
                <ChevronRight size={18} />
            </ViewAllButton>
        </WidgetContainer>
    );
};

export default WhaleAlertWidget;