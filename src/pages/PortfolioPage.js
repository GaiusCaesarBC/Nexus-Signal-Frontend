// client/src/pages/PortfolioPage.js - Trading Performance Hub

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWallet } from '../context/WalletContext';
import WalletConnectButton from '../components/WalletConnectButton';
import WalletAnalytics from '../components/WalletAnalytics';
import BrokerageConnect from '../components/BrokerageConnect';
import api from '../api/axios';
import {
    TrendingUp, TrendingDown, BarChart3,
    Activity, Target,
    ArrowUpRight, ArrowDownRight, Eye,
    CheckCircle, Trophy,
    Wallet, DollarSign,
    Clock, ChevronRight, ChevronDown,
    ArrowRight, Crosshair, Flame,
    Zap, Shield, AlertTriangle, ExternalLink
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

// ============ ANIMATION ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ============ LAYOUT ============
const PageWrapper = styled.div`
    min-height: 100vh;
    background: linear-gradient(180deg, #070a14 0%, #0c1020 40%, #0a0e1a 100%);
    color: #e0e6ed;
    padding: 0 0 80px 0;
`;

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
`;

// ============ HEADER ============
const HeaderSection = styled.div`
    padding: 48px 0 32px;
    animation: ${fadeIn} 0.5s ease-out;
`;

const PageTitle = styled.h1`
    font-size: 1.75rem;
    font-weight: 700;
    color: #f1f5f9;
    margin: 0 0 6px 0;
`;

const PageSubtitle = styled.p`
    font-size: 0.9rem;
    color: #64748b;
    margin: 0;
`;

// ============ METRICS ROW ============
const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const MetricLabel = styled.div`
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const MetricValue = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.$color || '#f1f5f9'};
    line-height: 1.2;
`;

const MetricSub = styled.div`
    font-size: 0.75rem;
    color: ${props => props.$color || '#64748b'};
`;

// ============ SECTION ============
const Section = styled.div`
    margin-bottom: 32px;
    animation: ${fadeIn} 0.5s ease-out ${props => props.$delay || '0.2s'} both;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const SectionCount = styled.span`
    font-size: 0.75rem;
    color: #64748b;
    background: rgba(255, 255, 255, 0.06);
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
`;

// ============ ACTIVE POSITIONS ============
const PositionCard = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: border-color 0.2s;

    &:hover {
        border-color: rgba(255, 255, 255, 0.12);
    }

    @media (max-width: 768px) {
        flex-wrap: wrap;
        gap: 12px;
    }
`;

const PositionSymbol = styled.div`
    min-width: 100px;
`;

const SymbolName = styled.div`
    font-size: 1rem;
    font-weight: 700;
    color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Badge = styled.span`
    font-size: 0.6rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => props.$bg || 'rgba(255,255,255,0.08)'};
    color: ${props => props.$color || '#e0e6ed'};
`;

const PositionDetails = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        gap: 16px;
    }
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const DetailLabel = styled.span`
    font-size: 0.65rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.4px;
`;

const DetailValue = styled.span`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.$color || '#e0e6ed'};
`;

const TPSLBar = styled.div`
    width: 120px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const TPSLLabels = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.6rem;
    color: #475569;
`;

const ProgressTrack = styled.div`
    height: 4px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
`;

const ProgressFill = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => Math.min(Math.max(props.$pct, 0), 100)}%;
    background: ${props => props.$color || '#00adef'};
    border-radius: 2px;
    transition: width 0.4s ease;
`;

const PositionPnL = styled.div`
    min-width: 90px;
    text-align: right;
`;

const PnLPercent = styled.div`
    font-size: 1rem;
    font-weight: 700;
    color: ${props => props.$value >= 0 ? '#10b981' : '#ef4444'};
`;

const PnLAmount = styled.div`
    font-size: 0.7rem;
    color: ${props => props.$value >= 0 ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)'};
`;

const PositionActions = styled.div`
    display: flex;
    gap: 8px;
    flex-shrink: 0;
`;

const SmallButton = styled.button`
    font-size: 0.7rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid ${props => props.$borderColor || 'rgba(255,255,255,0.1)'};
    background: ${props => props.$bg || 'transparent'};
    color: ${props => props.$color || '#e0e6ed'};
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
        background: ${props => props.$hoverBg || 'rgba(255,255,255,0.06)'};
    }
`;

// ============ TRADE HISTORY ============
const TradeRow = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 14px 18px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: border-color 0.2s;

    &:hover {
        border-color: rgba(255, 255, 255, 0.10);
    }

    @media (max-width: 768px) {
        flex-wrap: wrap;
        gap: 10px;
    }
`;

const TradeSymbolBlock = styled.div`
    min-width: 110px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const TradeInfo = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        gap: 12px;
    }
`;

const TradeReturn = styled.div`
    font-size: 0.95rem;
    font-weight: 700;
    min-width: 70px;
    text-align: right;
    color: ${props => props.$value >= 0 ? '#10b981' : '#ef4444'};
`;

const TradeTime = styled.div`
    font-size: 0.7rem;
    color: #475569;
    min-width: 80px;
    text-align: right;
`;

// ============ CHART ============
const ChartContainer = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 24px;
    height: 320px;
`;

const NoDataChart = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #475569;
    font-size: 0.85rem;
`;

// ============ INSIGHTS ============
const InsightsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const InsightCard = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const InsightLabel = styled.div`
    font-size: 0.7rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const InsightValue = styled.div`
    font-size: 1.15rem;
    font-weight: 700;
    color: ${props => props.$color || '#f1f5f9'};
`;

// ============ SIGNAL STRIP ============
const SignalStrip = styled.div`
    background: rgba(0, 173, 239, 0.06);
    border: 1px solid rgba(0, 173, 239, 0.15);
    border-radius: 12px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
`;

const StripText = styled.div`
    flex: 1;
    min-width: 200px;
`;

const StripTitle = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 4px;
`;

const StripDesc = styled.div`
    font-size: 0.78rem;
    color: #64748b;
`;

const StripButton = styled.button`
    font-size: 0.8rem;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #00adef;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s;
    white-space: nowrap;

    &:hover {
        background: #0098d4;
    }
`;

// ============ WALLET SECTION ============
const CollapsibleHeader = styled.button`
    width: 100%;
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    color: #e0e6ed;
    transition: border-color 0.2s;

    &:hover {
        border-color: rgba(255, 255, 255, 0.12);
    }
`;

const CollapsibleTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95rem;
    font-weight: 600;
`;

const ChevronIcon = styled.span`
    transition: transform 0.2s;
    transform: rotate(${props => props.$open ? '180deg' : '0deg'});
    display: flex;
    align-items: center;
`;

const CollapsibleContent = styled.div`
    margin-top: 12px;
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 24px;
    display: ${props => props.$open ? 'block' : 'none'};
`;

const WalletGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 56px 32px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
`;

const EmptyIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(0, 173, 239, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00adef;
    margin-bottom: 4px;
`;

const EmptyTitle = styled.div`
    font-size: 1.05rem;
    font-weight: 600;
    color: #f1f5f9;
`;

const EmptyDesc = styled.div`
    font-size: 0.82rem;
    color: #64748b;
    max-width: 360px;
`;

const EmptyActions = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 8px;
`;

const PrimaryButton = styled.button`
    font-size: 0.8rem;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #00adef;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s;

    &:hover {
        background: #0098d4;
    }
`;

const SecondaryButton = styled.button`
    font-size: 0.8rem;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    color: #e0e6ed;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.04);
    }
`;

// ============ LOADING ============
const LoadingWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #64748b;
    font-size: 0.9rem;
    flex-direction: column;
    gap: 12px;
`;

const Spinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.08);
    border-top-color: #00adef;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const ShowMoreButton = styled.button`
    width: 100%;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #e0e6ed;
    }
`;

// ============ TOOLTIP ============
const CustomTooltipWrapper = styled.div`
    background: rgba(12, 16, 32, 0.96);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.75rem;
`;

const CustomChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <CustomTooltipWrapper>
            <div style={{ color: '#64748b', marginBottom: 4 }}>{label}</div>
            <div style={{ color: payload[0].value >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {payload[0].value >= 0 ? '+' : ''}{payload[0].value.toFixed(2)}%
            </div>
        </CustomTooltipWrapper>
    );
};

// ============ HELPERS ============
const STARTING_BALANCE = 100000;

const formatCurrency = (val) => {
    if (val == null || isNaN(val)) return '$0.00';
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}K`;
    return `${sign}$${abs.toFixed(2)}`;
};

const formatPercent = (val) => {
    if (val == null || isNaN(val)) return '0.00%';
    const sign = val > 0 ? '+' : '';
    return `${sign}${Number(val).toFixed(2)}%`;
};

const formatPrice = (val) => {
    if (val == null || isNaN(val)) return '-';
    const num = Number(val);
    if (num >= 1000) return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (num >= 1) return `$${num.toFixed(2)}`;
    return `$${num.toFixed(6)}`;
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTypeBadge = (type) => {
    const map = {
        stock: { bg: 'rgba(0,173,239,0.15)', color: '#00adef', label: 'Stock' },
        crypto: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Crypto' },
        forex: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', label: 'Forex' },
    };
    return map[type] || map.stock;
};

const getDirectionBadge = (positionType) => {
    if (positionType === 'short') {
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'SHORT' };
    }
    return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'LONG' };
};

const computeTPSLProgress = (position) => {
    const { averagePrice, currentPrice, takeProfitPrice, stopLossPrice, positionType } = position;
    if (!takeProfitPrice && !stopLossPrice) return null;

    const entry = Number(averagePrice);
    const current = Number(currentPrice);
    const tp = takeProfitPrice ? Number(takeProfitPrice) : null;
    const sl = stopLossPrice ? Number(stopLossPrice) : null;

    if (!tp || !sl) {
        // partial: just show what we can
        if (tp && !sl) {
            const range = Math.abs(tp - entry);
            if (range === 0) return { pct: 50, color: '#64748b' };
            const progress = positionType === 'short'
                ? ((entry - current) / range) * 100
                : ((current - entry) / range) * 100;
            return {
                pct: Math.min(Math.max(progress, 0), 100),
                color: progress >= 0 ? '#10b981' : '#ef4444',
                slLabel: '-',
                tpLabel: formatPrice(tp),
            };
        }
        if (sl && !tp) {
            const range = Math.abs(entry - sl);
            if (range === 0) return { pct: 50, color: '#64748b' };
            const progress = positionType === 'short'
                ? ((current - entry) / range) * 100
                : ((entry - current) / range) * 100;
            return {
                pct: 100 - Math.min(Math.max(progress, 0), 100),
                color: progress <= 50 ? '#10b981' : '#ef4444',
                slLabel: formatPrice(sl),
                tpLabel: '-',
            };
        }
        return null;
    }

    const range = Math.abs(tp - sl);
    if (range === 0) return { pct: 50, color: '#64748b', slLabel: formatPrice(sl), tpLabel: formatPrice(tp) };

    const isLong = positionType !== 'short';
    let pct;
    if (isLong) {
        pct = ((current - sl) / range) * 100;
    } else {
        pct = ((sl - current) / range) * 100;
    }

    return {
        pct: Math.min(Math.max(pct, 0), 100),
        color: pct >= 50 ? '#10b981' : pct >= 25 ? '#f59e0b' : '#ef4444',
        slLabel: formatPrice(sl),
        tpLabel: formatPrice(tp),
    };
};

// ============ MAIN COMPONENT ============
const PortfolioPage = () => {
    const { api: authApi } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { linkedWallet } = useWallet();

    // Data state
    const [account, setAccount] = useState(null);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI state
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [walletOpen, setWalletOpen] = useState(true);

    // Fetch all paper trading data
    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);

            const [accountRes, ordersRes, statsRes] = await Promise.all([
                api.get('/paper-trading/account'),
                api.get('/paper-trading/orders?limit=100'),
                api.get('/paper-trading/stats'),
            ]);

            if (accountRes.data?.success) {
                setAccount(accountRes.data.account);
            }
            if (ordersRes.data?.success) {
                setOrders(ordersRes.data.orders || []);
            }
            if (statsRes.data?.success) {
                setStats(statsRes.data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch portfolio data:', err);
            if (!silent) {
                setError('Failed to load trading data. Please try again.');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh positions every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(true);
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Derived data
    const positions = account?.positions || [];
    const totalPortfolioValue = account?.totalPortfolioValue || STARTING_BALANCE;
    const totalPnL = totalPortfolioValue - STARTING_BALANCE;
    const totalPnLPercent = ((totalPnL / STARTING_BALANCE) * 100);

    // Closed trades: orders with pnl or sell/cover actions
    const closedTrades = useMemo(() => {
        return orders.filter(o =>
            o.pnl != null ||
            o.action === 'sell' ||
            o.action === 'cover' ||
            o.action === 'tp_hit' ||
            o.action === 'sl_hit'
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [orders]);

    const visibleHistory = showAllHistory ? closedTrades : closedTrades.slice(0, 10);

    // Equity curve from closed trades
    const equityCurveData = useMemo(() => {
        const tradesChron = [...closedTrades].reverse();
        if (tradesChron.length === 0) return [];

        let cumPnL = 0;
        const curve = [{ date: 'Start', cumReturn: 0 }];

        tradesChron.forEach((trade) => {
            const pnl = Number(trade.pnlPercent || 0);
            cumPnL += pnl;
            curve.push({
                date: formatDate(trade.createdAt),
                cumReturn: Number(cumPnL.toFixed(2)),
            });
        });

        return curve;
    }, [closedTrades]);

    // Insight computations
    const insights = useMemo(() => {
        const winningOrders = closedTrades.filter(o => Number(o.pnl) > 0);
        const losingOrders = closedTrades.filter(o => Number(o.pnl) < 0);

        const avgWin = winningOrders.length > 0
            ? winningOrders.reduce((sum, o) => sum + Number(o.pnlPercent || 0), 0) / winningOrders.length
            : 0;
        const avgLoss = losingOrders.length > 0
            ? losingOrders.reduce((sum, o) => sum + Number(o.pnlPercent || 0), 0) / losingOrders.length
            : 0;

        return {
            bestTrade: stats?.biggestWin || 0,
            worstTrade: stats?.biggestLoss || 0,
            avgWin,
            avgLoss,
            currentStreak: stats?.currentStreak || 0,
            bestStreak: stats?.bestStreak || 0,
            tpHits: stats?.takeProfitHits || 0,
            slHits: stats?.stopLossHits || 0,
        };
    }, [closedTrades, stats]);

    const hasNoTrades = !loading && (!stats || stats.totalTrades === 0) && positions.length === 0;

    // ============ RENDER ============
    if (loading) {
        return (
            <PageWrapper>
                <Container>
                    <LoadingWrapper>
                        <Spinner />
                        Loading your trading data...
                    </LoadingWrapper>
                </Container>
            </PageWrapper>
        );
    }

    if (error) {
        return (
            <PageWrapper>
                <Container>
                    <HeaderSection>
                        <PageTitle>Your Trading Performance</PageTitle>
                    </HeaderSection>
                    <EmptyState>
                        <EmptyIcon>
                            <AlertTriangle size={24} />
                        </EmptyIcon>
                        <EmptyTitle>Unable to load data</EmptyTitle>
                        <EmptyDesc>{error}</EmptyDesc>
                        <EmptyActions>
                            <PrimaryButton onClick={() => fetchData()}>
                                Try Again
                            </PrimaryButton>
                        </EmptyActions>
                    </EmptyState>
                </Container>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <Container>
                {/* SECTION 1: Header */}
                <HeaderSection>
                    <PageTitle>Your Trading Performance</PageTitle>
                    <PageSubtitle>Track every trade, measure your edge, and improve over time.</PageSubtitle>
                </HeaderSection>

                {/* SECTION 9: Empty State */}
                {hasNoTrades ? (
                    <Section $delay="0.15s">
                        <EmptyState>
                            <EmptyIcon>
                                <BarChart3 size={26} />
                            </EmptyIcon>
                            <EmptyTitle>You haven't tracked any trades yet.</EmptyTitle>
                            <EmptyDesc>
                                Start by following a signal or placing a paper trade.
                            </EmptyDesc>
                            <EmptyActions>
                                <PrimaryButton onClick={() => navigate('/signals')}>
                                    <Eye size={14} />
                                    View Signals
                                </PrimaryButton>
                                <SecondaryButton onClick={() => navigate('/paper-trading')}>
                                    <Target size={14} />
                                    Start Paper Trading
                                </SecondaryButton>
                            </EmptyActions>
                        </EmptyState>
                    </Section>
                ) : (
                    <>
                        {/* SECTION 2: Performance Metrics */}
                        <MetricsGrid>
                            <MetricCard>
                                <MetricLabel>
                                    <DollarSign size={13} />
                                    Total P&L
                                </MetricLabel>
                                <MetricValue $color={totalPnL >= 0 ? '#10b981' : '#ef4444'}>
                                    {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                                </MetricValue>
                                <MetricSub $color={totalPnL >= 0 ? 'rgba(16,185,129,0.7)' : 'rgba(239,68,68,0.7)'}>
                                    {formatPercent(totalPnLPercent)} from ${STARTING_BALANCE.toLocaleString()} start
                                </MetricSub>
                            </MetricCard>

                            <MetricCard>
                                <MetricLabel>
                                    <Target size={13} />
                                    Win Rate
                                </MetricLabel>
                                <MetricValue $color={
                                    (stats?.winRate || 0) >= 55 ? '#10b981'
                                        : (stats?.winRate || 0) >= 45 ? '#f59e0b'
                                            : '#ef4444'
                                }>
                                    {stats?.winRate != null ? `${Number(stats.winRate).toFixed(1)}%` : '0.0%'}
                                </MetricValue>
                                <MetricSub>
                                    {stats?.winningTrades || 0}W / {stats?.losingTrades || 0}L
                                </MetricSub>
                            </MetricCard>

                            <MetricCard>
                                <MetricLabel>
                                    <Activity size={13} />
                                    Trades Taken
                                </MetricLabel>
                                <MetricValue>
                                    {stats?.totalTrades || 0}
                                </MetricValue>
                                <MetricSub>
                                    {insights.tpHits} TP hits, {insights.slHits} SL hits
                                </MetricSub>
                            </MetricCard>

                            <MetricCard>
                                <MetricLabel>
                                    <Crosshair size={13} />
                                    Active Trades
                                </MetricLabel>
                                <MetricValue $color="#00adef">
                                    {positions.length}
                                </MetricValue>
                                <MetricSub>
                                    Open positions
                                </MetricSub>
                            </MetricCard>
                        </MetricsGrid>

                        {/* SECTION 3: Active Positions */}
                        {positions.length > 0 && (
                            <Section $delay="0.2s">
                                <SectionHeader>
                                    <SectionTitle>
                                        <Crosshair size={16} color="#00adef" />
                                        Active Positions
                                        <SectionCount>{positions.length}</SectionCount>
                                    </SectionTitle>
                                </SectionHeader>

                                {positions.map((pos, idx) => {
                                    const typeBadge = getTypeBadge(pos.type);
                                    const dirBadge = getDirectionBadge(pos.positionType);
                                    const tpsl = computeTPSLProgress(pos);
                                    const unrealizedPnLPct = Number(pos.unrealizedPnLPercent || 0);
                                    const unrealizedPnLVal = Number(pos.unrealizedPnL || 0);

                                    return (
                                        <PositionCard key={`${pos.symbol}-${pos.type}-${idx}`}>
                                            <PositionSymbol>
                                                <SymbolName>
                                                    {pos.symbol}
                                                    <Badge $bg={typeBadge.bg} $color={typeBadge.color}>
                                                        {typeBadge.label}
                                                    </Badge>
                                                </SymbolName>
                                                <Badge
                                                    $bg={dirBadge.bg}
                                                    $color={dirBadge.color}
                                                    style={{ marginTop: 4, display: 'inline-block' }}
                                                >
                                                    {dirBadge.label}
                                                    {pos.leverage && pos.leverage > 1 ? ` ${pos.leverage}x` : ''}
                                                </Badge>
                                            </PositionSymbol>

                                            <PositionDetails>
                                                <DetailItem>
                                                    <DetailLabel>Entry</DetailLabel>
                                                    <DetailValue>{formatPrice(pos.averagePrice)}</DetailValue>
                                                </DetailItem>
                                                <DetailItem>
                                                    <DetailLabel>Current</DetailLabel>
                                                    <DetailValue>{formatPrice(pos.currentPrice)}</DetailValue>
                                                </DetailItem>
                                                <DetailItem>
                                                    <DetailLabel>Qty</DetailLabel>
                                                    <DetailValue>{Number(pos.quantity).toFixed(pos.type === 'crypto' ? 6 : 2)}</DetailValue>
                                                </DetailItem>

                                                {tpsl && (
                                                    <TPSLBar>
                                                        <TPSLLabels>
                                                            <span style={{ color: '#ef4444' }}>SL {tpsl.slLabel}</span>
                                                            <span style={{ color: '#10b981' }}>TP {tpsl.tpLabel}</span>
                                                        </TPSLLabels>
                                                        <ProgressTrack>
                                                            <ProgressFill $pct={tpsl.pct} $color={tpsl.color} />
                                                        </ProgressTrack>
                                                    </TPSLBar>
                                                )}
                                            </PositionDetails>

                                            <PositionPnL>
                                                <PnLPercent $value={unrealizedPnLPct}>
                                                    {formatPercent(unrealizedPnLPct)}
                                                </PnLPercent>
                                                <PnLAmount $value={unrealizedPnLVal}>
                                                    {unrealizedPnLVal >= 0 ? '+' : ''}{formatCurrency(unrealizedPnLVal)}
                                                </PnLAmount>
                                            </PositionPnL>

                                            <PositionActions>
                                                <SmallButton
                                                    onClick={() => navigate('/paper-trading')}
                                                    $borderColor="rgba(239,68,68,0.3)"
                                                    $color="#ef4444"
                                                    $hoverBg="rgba(239,68,68,0.1)"
                                                >
                                                    Close
                                                </SmallButton>
                                            </PositionActions>
                                        </PositionCard>
                                    );
                                })}
                            </Section>
                        )}

                        {/* SECTION 4: Trade History */}
                        {closedTrades.length > 0 && (
                            <Section $delay="0.3s">
                                <SectionHeader>
                                    <SectionTitle>
                                        <Clock size={16} color="#64748b" />
                                        Closed Trades
                                        <SectionCount>{closedTrades.length}</SectionCount>
                                    </SectionTitle>
                                </SectionHeader>

                                {visibleHistory.map((trade, idx) => {
                                    const pnl = Number(trade.pnl || 0);
                                    const pnlPct = Number(trade.pnlPercent || 0);
                                    const isWin = pnl > 0;
                                    const typeBadge = getTypeBadge(trade.type);

                                    let dirLabel = 'LONG';
                                    if (trade.positionType === 'short' || trade.action === 'cover') {
                                        dirLabel = 'SHORT';
                                    }

                                    let reasonLabel = '';
                                    if (trade.reason === 'take_profit' || trade.action === 'tp_hit') {
                                        reasonLabel = 'TP Hit';
                                    } else if (trade.reason === 'stop_loss' || trade.action === 'sl_hit') {
                                        reasonLabel = 'SL Hit';
                                    } else if (trade.reason === 'manual') {
                                        reasonLabel = 'Manual';
                                    }

                                    return (
                                        <TradeRow key={`trade-${idx}-${trade.symbol}`}>
                                            <TradeSymbolBlock>
                                                <div>
                                                    <SymbolName style={{ fontSize: '0.9rem' }}>
                                                        {trade.symbol}
                                                    </SymbolName>
                                                    <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                                                        <Badge $bg={typeBadge.bg} $color={typeBadge.color}>
                                                            {typeBadge.label}
                                                        </Badge>
                                                        <Badge
                                                            $bg={dirLabel === 'SHORT' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)'}
                                                            $color={dirLabel === 'SHORT' ? '#ef4444' : '#10b981'}
                                                        >
                                                            {dirLabel}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </TradeSymbolBlock>

                                            <TradeInfo>
                                                <Badge
                                                    $bg={isWin ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}
                                                    $color={isWin ? '#10b981' : '#ef4444'}
                                                    style={{ fontSize: '0.65rem', padding: '3px 8px' }}
                                                >
                                                    {isWin ? 'WIN' : pnl === 0 ? 'BREAK EVEN' : 'LOSS'}
                                                </Badge>

                                                {trade.price && (
                                                    <DetailItem>
                                                        <DetailLabel>Price</DetailLabel>
                                                        <DetailValue style={{ fontSize: '0.8rem' }}>
                                                            {formatPrice(trade.price)}
                                                        </DetailValue>
                                                    </DetailItem>
                                                )}

                                                {reasonLabel && (
                                                    <Badge
                                                        $bg="rgba(245,158,11,0.12)"
                                                        $color="#f59e0b"
                                                        style={{ fontSize: '0.6rem' }}
                                                    >
                                                        {reasonLabel}
                                                    </Badge>
                                                )}

                                                <Badge
                                                    $bg="rgba(255,255,255,0.04)"
                                                    $color="#475569"
                                                    style={{ fontSize: '0.58rem' }}
                                                >
                                                    Paper Trade
                                                </Badge>
                                            </TradeInfo>

                                            <TradeReturn $value={pnl}>
                                                {formatPercent(pnlPct)}
                                            </TradeReturn>

                                            <TradeTime>
                                                {timeAgo(trade.createdAt)}
                                            </TradeTime>
                                        </TradeRow>
                                    );
                                })}

                                {closedTrades.length > 10 && !showAllHistory && (
                                    <ShowMoreButton onClick={() => setShowAllHistory(true)}>
                                        Show all {closedTrades.length} trades
                                    </ShowMoreButton>
                                )}
                                {showAllHistory && closedTrades.length > 10 && (
                                    <ShowMoreButton onClick={() => setShowAllHistory(false)}>
                                        Show less
                                    </ShowMoreButton>
                                )}
                            </Section>
                        )}

                        {/* SECTION 5: Equity Curve */}
                        <Section $delay="0.35s">
                            <SectionHeader>
                                <SectionTitle>
                                    <TrendingUp size={16} color="#00adef" />
                                    Performance Over Time
                                </SectionTitle>
                            </SectionHeader>

                            <ChartContainer>
                                {equityCurveData.length > 1 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={equityCurveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="pnlGradientPos" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="pnlGradientNeg" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#475569"
                                                tick={{ fill: '#475569', fontSize: 11 }}
                                                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                stroke="#475569"
                                                tick={{ fill: '#475569', fontSize: 11 }}
                                                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                                tickLine={false}
                                                tickFormatter={(val) => `${val}%`}
                                            />
                                            <Tooltip content={<CustomChartTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey="cumReturn"
                                                stroke={equityCurveData[equityCurveData.length - 1]?.cumReturn >= 0 ? '#10b981' : '#ef4444'}
                                                strokeWidth={2}
                                                fill={equityCurveData[equityCurveData.length - 1]?.cumReturn >= 0 ? 'url(#pnlGradientPos)' : 'url(#pnlGradientNeg)'}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <NoDataChart>
                                        <div style={{ textAlign: 'center' }}>
                                            <BarChart3 size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                                            <div>Complete some trades to see your equity curve</div>
                                        </div>
                                    </NoDataChart>
                                )}
                            </ChartContainer>
                        </Section>

                        {/* SECTION 6: Trading Insights */}
                        <Section $delay="0.4s">
                            <SectionHeader>
                                <SectionTitle>
                                    <Zap size={16} color="#f59e0b" />
                                    Your Trading Insights
                                </SectionTitle>
                            </SectionHeader>

                            <InsightsGrid>
                                <InsightCard>
                                    <InsightLabel>
                                        <Trophy size={12} color="#10b981" />
                                        Best Trade
                                    </InsightLabel>
                                    <InsightValue $color="#10b981">
                                        {insights.bestTrade > 0 ? `+$${Number(insights.bestTrade).toFixed(2)}` : '-'}
                                    </InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightLabel>
                                        <TrendingDown size={12} color="#ef4444" />
                                        Worst Trade
                                    </InsightLabel>
                                    <InsightValue $color="#ef4444">
                                        {insights.worstTrade < 0 ? `-$${Math.abs(Number(insights.worstTrade)).toFixed(2)}` : insights.worstTrade !== 0 ? `$${Number(insights.worstTrade).toFixed(2)}` : '-'}
                                    </InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightLabel>
                                        <ArrowUpRight size={12} color="#10b981" />
                                        Avg Win
                                    </InsightLabel>
                                    <InsightValue $color="#10b981">
                                        {insights.avgWin !== 0 ? formatPercent(insights.avgWin) : '-'}
                                    </InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightLabel>
                                        <ArrowDownRight size={12} color="#ef4444" />
                                        Avg Loss
                                    </InsightLabel>
                                    <InsightValue $color="#ef4444">
                                        {insights.avgLoss !== 0 ? formatPercent(insights.avgLoss) : '-'}
                                    </InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightLabel>
                                        <Flame size={12} color="#f59e0b" />
                                        Current Streak
                                    </InsightLabel>
                                    <InsightValue $color={insights.currentStreak >= 0 ? '#10b981' : '#ef4444'}>
                                        {insights.currentStreak > 0 ? `${insights.currentStreak}W` : insights.currentStreak < 0 ? `${Math.abs(insights.currentStreak)}L` : '-'}
                                    </InsightValue>
                                </InsightCard>

                                <InsightCard>
                                    <InsightLabel>
                                        <Shield size={12} color="#00adef" />
                                        Best Streak
                                    </InsightLabel>
                                    <InsightValue $color="#00adef">
                                        {insights.bestStreak > 0 ? `${insights.bestStreak} wins` : '-'}
                                    </InsightValue>
                                </InsightCard>
                            </InsightsGrid>
                        </Section>
                    </>
                )}

                {/* SECTION 7: Signal Integration Strip */}
                <Section $delay="0.45s">
                    <SignalStrip>
                        <StripText>
                            <StripTitle>Build your track record from signals</StripTitle>
                            <StripDesc>
                                Track trades from signals &rarr; Build your performance record &rarr; See what works
                            </StripDesc>
                        </StripText>
                        <StripButton onClick={() => navigate('/signals')}>
                            View Live Signals
                            <ChevronRight size={14} />
                        </StripButton>
                    </SignalStrip>
                </Section>

                {/* SECTION 8: Wallet Section (collapsible, secondary) */}
                <Section $delay="0.5s">
                    <CollapsibleHeader onClick={() => setWalletOpen(!walletOpen)}>
                        <CollapsibleTitle>
                            <Wallet size={18} color="#64748b" />
                            Connected Wallets & Brokerages
                            {linkedWallet && (
                                <Badge $bg="rgba(16,185,129,0.12)" $color="#10b981">
                                    Connected
                                </Badge>
                            )}
                        </CollapsibleTitle>
                        <ChevronIcon $open={walletOpen}>
                            <ChevronDown size={18} color="#64748b" />
                        </ChevronIcon>
                    </CollapsibleHeader>

                    <CollapsibleContent $open={walletOpen}>
                        <WalletGrid>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 12, fontWeight: 600 }}>
                                    Wallet Connection
                                </div>
                                <WalletConnectButton showInfo={true} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 12, fontWeight: 600 }}>
                                    Brokerage Integration
                                </div>
                                <BrokerageConnect />
                            </div>
                        </WalletGrid>
                        {linkedWallet && (
                            <div style={{ marginTop: '1rem' }}>
                                <WalletAnalytics />
                            </div>
                        )}
                    </CollapsibleContent>
                </Section>
            </Container>
        </PageWrapper>
    );
};

export default PortfolioPage;
