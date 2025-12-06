// client/src/pages/HeatmapPage.js - MARKET MOVERS HEATMAP (REVAMPED)

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, BarChart3, Flame, RefreshCw,
    Eye, Activity, Bitcoin, LayoutGrid, Zap, Clock,
    ArrowUpRight, ArrowDownRight, Globe, Layers, Rocket, AlertTriangle,
    DollarSign, TrendingUp as TrendUp
} from 'lucide-react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 239, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 239, 0.5); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding: 6rem 2rem 2rem;
`;

const ContentWrapper = styled.div`
    max-width: 1800px;
    margin: 0 auto;
`;

const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
    font-size: 2.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const LiveBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.6rem;
    background: ${props => props.theme?.success || '#10b981'}26;
    color: ${props => props.theme?.success || '#10b981'};
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        background: ${props => props.theme?.success || '#10b981'};
        border-radius: 50%;
        animation: ${pulse} 2s ease infinite;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
`;

// ============ MODE TOGGLE ============
const ModeToggle = styled.div`
    display: flex;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.8)'};
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 12px;
    padding: 0.25rem;
`;

const ModeButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: ${props => props.$active
        ? `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'}4D 0%, ${props.theme?.brand?.primary || '#00adef'}26 100%)`
        : 'transparent'};
    border: none;
    border-radius: 10px;
    color: ${props => props.$active ? (props.theme?.brand?.primary || '#00adef') : (props.theme?.text?.tertiary || '#64748b')};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    }
`;

const ViewToggle = styled.div`
    display: flex;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.8)'};
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 10px;
    overflow: hidden;
`;

const ViewButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 0.9rem;
    background: ${props => props.$active ? `${props.theme?.brand?.primary || '#00adef'}33` : 'transparent'};
    border: none;
    color: ${props => props.$active ? (props.theme?.brand?.primary || '#00adef') : (props.theme?.text?.tertiary || '#64748b')};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    }
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: ${props => props.$primary
        ? `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'} 0%, ${props.theme?.brand?.secondary || '#0088cc'} 100%)`
        : `${props.theme?.brand?.primary || '#00adef'}1A`};
    border: 1px solid ${props => props.$primary ? 'transparent' : `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${props => props.$primary ? 'white' : (props.theme?.brand?.primary || '#00adef')};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        ${props => props.$spinning && css`animation: ${rotate} 1s linear infinite;`}
    }
`;

// ============ STATS BAR ============
const StatsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.$borderColor || props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.25rem;
    animation: ${fadeInScale} 0.5s ease-out;
    animation-delay: ${props => props.$delay || '0s'};
    animation-fill-mode: backwards;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        border-color: ${props => props.$borderColor || props.theme?.brand?.primary || '#00adef'}66;
        box-shadow: 0 12px 32px ${props => props.$borderColor || props.theme?.brand?.primary || '#00adef'}26;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => props.$color || props.theme?.brand?.gradient || 'linear-gradient(90deg, #00adef, #0088cc)'};
    }
`;

const StatHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const StatIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$bg || `${props.theme?.brand?.primary || '#00adef'}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme?.brand?.primary || '#00adef'};
`;

const StatLabel = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatValue = styled.div`
    font-size: 1.6rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
`;

const StatSubtext = styled.div`
    font-size: 0.8rem;
    color: ${props => props.$color || props.theme?.text?.tertiary || '#64748b'};
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

// ============ HEATMAP CONTAINER ============
const HeatmapContainer = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 20px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
    animation: ${glowPulse} 4s ease-in-out infinite;
`;

const HeatmapHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const HeatmapTitle = styled.h2`
    font-size: 1.3rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }
`;

const Legend = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    padding: 0.35rem 0.6rem;
    background: ${props => props.$bg || 'rgba(255,255,255,0.05)'};
    border-radius: 6px;
`;

const LegendColor = styled.div`
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background: ${props => props.$color};
`;

// ============ TREEMAP VIEW ============
const TreemapContainer = styled.div`
    width: 100%;
    height: 650px;
    border-radius: 12px;
    overflow: hidden;

    @media (max-width: 768px) {
        height: 500px;
    }
`;

// ============ GRID VIEW ============
const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    max-height: 700px;
    overflow-y: auto;
    padding-right: 0.5rem;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme?.brand?.primary || '#00adef'}66;
        border-radius: 3px;
    }
`;

const GridCell = styled.div`
    background: ${props => {
        const change = props.$change;
        const successColor = props.theme?.success || '#10b981';
        const errorColor = props.theme?.error || '#ef4444';
        if (change > 10) return `linear-gradient(135deg, ${successColor}66, ${successColor}40)`;
        if (change > 5) return `linear-gradient(135deg, ${successColor}4D, ${successColor}33)`;
        if (change > 2) return `linear-gradient(135deg, ${successColor}33, ${successColor}26)`;
        if (change > 0) return `linear-gradient(135deg, ${successColor}26, ${successColor}14)`;
        if (change > -2) return `linear-gradient(135deg, ${errorColor}26, ${errorColor}14)`;
        if (change > -5) return `linear-gradient(135deg, ${errorColor}33, ${errorColor}26)`;
        if (change > -10) return `linear-gradient(135deg, ${errorColor}4D, ${errorColor}33)`;
        return `linear-gradient(135deg, ${errorColor}66, ${errorColor}40)`;
    }};
    border: 1px solid ${props => props.$change >= 0
        ? `${props.theme?.success || '#10b981'}4D`
        : `${props.theme?.error || '#ef4444'}4D`};
    border-radius: 14px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        border-radius: 14px 0 0 14px;
        background: ${props => props.$change >= 0
            ? (props.theme?.success || '#10b981')
            : (props.theme?.error || '#ef4444')};
    }

    &:hover {
        transform: translateY(-6px) scale(1.02);
        box-shadow: 0 16px 40px ${props => props.$change >= 0
            ? `${props.theme?.success || '#10b981'}40`
            : `${props.theme?.error || '#ef4444'}40`};
        border-color: ${props => props.$change >= 0
            ? `${props.theme?.success || '#10b981'}80`
            : `${props.theme?.error || '#ef4444'}80`};
    }
`;

const CellRank = styled.div`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0,0,0,0.3);
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

const CellSymbol = styled.div`
    font-size: 1.25rem;
    font-weight: 800;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const CellName = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    margin-bottom: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CellChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 1.4rem;
    font-weight: 800;
    color: ${props => props.$positive
        ? (props.theme?.success || '#10b981')
        : (props.theme?.error || '#ef4444')};
`;

const CellPrice = styled.div`
    font-size: 0.9rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    margin-top: 0.5rem;
    font-weight: 600;
`;

// ============ LOADING ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem;
    gap: 1.5rem;
`;

const SpinningIcon = styled.div`
    animation: ${rotate} 1.5s linear infinite;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const LoadingText = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
    font-weight: 500;
`;

const LoadingSubtext = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 5rem 2rem;
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}33 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed ${props => props.theme?.brand?.primary || '#00adef'}4D;
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

// ============ CUSTOM TOOLTIP ============
const TooltipContainer = styled.div`
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}66;
    border-radius: 14px;
    padding: 1.25rem;
    min-width: 200px;
    backdrop-filter: blur(10px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
`;

const TooltipSymbol = styled.div`
    font-size: 1.2rem;
    font-weight: 800;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const TooltipName = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
`;

const TooltipLabel = styled.span`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

const TooltipValue = styled.span`
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
    font-weight: 600;
`;

// ============ COMPONENT ============
const HeatmapPage = () => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [mode, setMode] = useState('crypto'); // 'stocks' or 'crypto'
    const [view, setView] = useState('treemap'); // 'treemap' or 'grid'
    const [data, setData] = useState([]);
    const [stats, setStats] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [mode, isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = mode === 'stocks' ? '/heatmap/stocks' : '/heatmap/crypto';
            const response = await api.get(endpoint);

            // Handle new response structure with items and stats
            if (response.data?.items) {
                setData(response.data.items);
                setStats(response.data.stats);
                setLastUpdated(response.data.lastUpdated);
            } else {
                // Fallback for old response format
                setData(response.data || []);
                setStats(null);
                setLastUpdated(null);
            }
        } catch (error) {
            console.error('Error fetching heatmap data:', error);
            toast.error('Failed to load heatmap data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
        toast.success('Heatmap refreshed!');
    };

    const handleCellClick = (item) => {
        if (mode === 'crypto') {
            // Check if this is a DEX token (from GeckoTerminal)
            if (item.source === 'geckoterminal') {
                // DEX tokens need query params for proper data fetching
                const symbol = item.symbol.toUpperCase();
                const network = item.network || 'bsc';
                const poolAddress = item.poolAddress || item.contractAddress || item.id;
                navigate(`/crypto/${symbol}?source=dex&network=${network}&pool=${poolAddress}`);
            } else {
                // CoinGecko tokens - use id for proper lookup
                navigate(`/crypto/${item.id || item.symbol.toLowerCase()}`);
            }
        } else {
            navigate(`/stocks/${item.symbol.toUpperCase()}`);
        }
    };

    // Calculate stats from data if not provided by backend
    const computedStats = useMemo(() => {
        if (stats) return stats;

        if (!data || data.length === 0) {
            return { total: 0, gainers: 0, losers: 0, avgChange: 0, topGainer: null, topLoser: null };
        }

        const gainers = data.filter(d => d.change > 0).length;
        const losers = data.filter(d => d.change < 0).length;
        const avgChange = data.reduce((sum, d) => sum + (d.change || 0), 0) / data.length;

        const sorted = [...data].sort((a, b) => b.change - a.change);
        const topGainer = sorted[0];
        const topLoser = sorted[sorted.length - 1];

        return { total: data.length, gainers, losers, avgChange, topGainer, topLoser };
    }, [data, stats]);

    // Get theme colors for treemap - enhanced color scale
    const getTreemapColor = useCallback((change) => {
        const successColor = theme?.success || '#10b981';
        const errorColor = theme?.error || '#ef4444';

        if (change > 15) return successColor;
        if (change > 10) return `${successColor}e6`;
        if (change > 5) return `${successColor}b3`;
        if (change > 2) return `${successColor}80`;
        if (change > 0) return `${successColor}59`;
        if (change > -2) return `${errorColor}59`;
        if (change > -5) return `${errorColor}80`;
        if (change > -10) return `${errorColor}b3`;
        if (change > -15) return `${errorColor}e6`;
        return errorColor;
    }, [theme]);

    // Custom treemap content - improved rendering
    const renderTreemapContent = useCallback((props) => {
        const { x, y, width, height, name } = props;
        const item = data.find(d => d.symbol === name || d.name === name);

        // Don't render if cell is too small
        if (!item || width < 50 || height < 35) return null;

        const change = item.change || 0;
        const fillColor = getTreemapColor(change);
        const strokeColor = change >= 0
            ? `${theme?.success || '#10b981'}cc`
            : `${theme?.error || '#ef4444'}cc`;

        // Dynamic font sizing based on cell size
        const symbolSize = Math.max(Math.min(width / 5, height / 2.5, 22), 10);
        const changeSize = symbolSize * 0.65;
        const showChange = width > 70 && height > 50;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: fillColor,
                        stroke: strokeColor,
                        strokeWidth: 1.5,
                        cursor: 'pointer',
                        rx: 4,
                        ry: 4
                    }}
                    onClick={() => handleCellClick(item)}
                />
                <text
                    x={x + width / 2}
                    y={y + height / 2 - (showChange ? symbolSize * 0.3 : 0)}
                    textAnchor="middle"
                    fill="white"
                    fontSize={symbolSize}
                    fontWeight="800"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)', pointerEvents: 'none' }}
                >
                    {item.symbol}
                </text>
                {showChange && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2 + symbolSize * 0.7}
                        textAnchor="middle"
                        fill="white"
                        fontSize={changeSize}
                        fontWeight="700"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
                    >
                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </text>
                )}
            </g>
        );
    }, [data, theme, getTreemapColor, handleCellClick]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload[0]) return null;

        const item = data.find(d => d.symbol === payload[0].payload.name || d.name === payload[0].payload.name);
        if (!item) return null;

        const changeColor = item.change >= 0 ? (theme?.success || '#10b981') : (theme?.error || '#ef4444');

        return (
            <TooltipContainer theme={theme}>
                <TooltipSymbol theme={theme}>{item.symbol}</TooltipSymbol>
                <TooltipName theme={theme}>{item.name}</TooltipName>
                <TooltipRow>
                    <TooltipLabel theme={theme}>Price</TooltipLabel>
                    <TooltipValue theme={theme}>{formatPrice(item.price)}</TooltipValue>
                </TooltipRow>
                <TooltipRow>
                    <TooltipLabel theme={theme}>24h Change</TooltipLabel>
                    <TooltipValue theme={theme} $color={changeColor}>
                        {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                    </TooltipValue>
                </TooltipRow>
                {item.volume && (
                    <TooltipRow>
                        <TooltipLabel theme={theme}>Volume</TooltipLabel>
                        <TooltipValue theme={theme}>{formatVolume(item.volume)}</TooltipValue>
                    </TooltipRow>
                )}
                {item.marketCap && (
                    <TooltipRow>
                        <TooltipLabel theme={theme}>Market Cap</TooltipLabel>
                        <TooltipValue theme={theme}>{formatMarketCap(item.marketCap)}</TooltipValue>
                    </TooltipRow>
                )}
            </TooltipContainer>
        );
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
        if (price >= 1) return `$${price.toFixed(2)}`;
        if (price >= 0.01) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(6)}`;
    };

    const formatVolume = (volume) => {
        if (!volume) return '$0';
        if (volume >= 1e12) return `$${(volume / 1e12).toFixed(1)}T`;
        if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
        if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
        if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
        return `$${volume.toFixed(0)}`;
    };

    const formatMarketCap = (cap) => {
        if (!cap) return '$0';
        if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
        if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
        if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
        return `$${cap.toFixed(0)}`;
    };

    // Treemap data - ensure consistent sizing
    const treemapData = useMemo(() => {
        return data.map(d => ({
            name: d.symbol,
            size: d.size || Math.max(1, Math.abs(d.change) * 10), // Fallback sizing
            ...d
        }));
    }, [data]);

    // Dynamic colors based on theme
    const successColor = theme?.success || '#10b981';
    const errorColor = theme?.error || '#ef4444';
    const primaryColor = theme?.brand?.primary || '#00adef';

    return (
        <PageContainer theme={theme}>
            <ContentWrapper>
                {/* Header */}
                <Header>
                    <HeaderTop>
                        <TitleSection>
                            <Title theme={theme}>
                                <Zap size={32} color={primaryColor} />
                                Market Movers
                            </Title>
                            <Subtitle theme={theme}>
                                Biggest gains & losses
                                <LiveBadge theme={theme}>LIVE</LiveBadge>
                                {lastUpdated && (
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                                        <Clock size={12} style={{ marginRight: '0.25rem' }} />
                                        {new Date(lastUpdated).toLocaleTimeString()}
                                    </span>
                                )}
                            </Subtitle>
                        </TitleSection>

                        <HeaderActions>
                            <ModeToggle theme={theme}>
                                <ModeButton theme={theme} $active={mode === 'stocks'} onClick={() => setMode('stocks')}>
                                    <BarChart3 size={18} />
                                    Stocks
                                </ModeButton>
                                <ModeButton theme={theme} $active={mode === 'crypto'} onClick={() => setMode('crypto')}>
                                    <Bitcoin size={18} />
                                    Crypto
                                </ModeButton>
                            </ModeToggle>

                            <ViewToggle theme={theme}>
                                <ViewButton theme={theme} $active={view === 'treemap'} onClick={() => setView('treemap')} title="Treemap View">
                                    <Layers size={18} />
                                </ViewButton>
                                <ViewButton theme={theme} $active={view === 'grid'} onClick={() => setView('grid')} title="Grid View">
                                    <LayoutGrid size={18} />
                                </ViewButton>
                            </ViewToggle>

                            <ActionButton theme={theme} onClick={handleRefresh} disabled={refreshing} $spinning={refreshing}>
                                <RefreshCw size={18} />
                                Refresh
                            </ActionButton>
                        </HeaderActions>
                    </HeaderTop>
                </Header>

                {/* Stats Bar */}
                {!loading && data.length > 0 && (
                    <StatsBar>
                        <StatCard theme={theme} $delay="0s" $color={`linear-gradient(90deg, ${primaryColor}, ${theme?.brand?.secondary || '#0088cc'})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${primaryColor}26`} $color={primaryColor}>
                                    <Eye size={18} />
                                </StatIcon>
                                <StatLabel theme={theme}>Total Movers</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme}>{computedStats.total}</StatValue>
                            <StatSubtext theme={theme}>{mode === 'stocks' ? 'stocks' : 'cryptocurrencies'}</StatSubtext>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.05s" $color={`linear-gradient(90deg, ${successColor}, #059669)`} $borderColor={successColor}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${successColor}26`} $color={successColor}>
                                    <TrendingUp size={18} />
                                </StatIcon>
                                <StatLabel theme={theme}>Gainers</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={successColor}>{computedStats.gainers}</StatValue>
                            <StatSubtext theme={theme} $color={successColor}>
                                <ArrowUpRight size={14} /> up today
                            </StatSubtext>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.1s" $color={`linear-gradient(90deg, ${errorColor}, #dc2626)`} $borderColor={errorColor}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${errorColor}26`} $color={errorColor}>
                                    <TrendingDown size={18} />
                                </StatIcon>
                                <StatLabel theme={theme}>Losers</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={errorColor}>{computedStats.losers}</StatValue>
                            <StatSubtext theme={theme} $color={errorColor}>
                                <ArrowDownRight size={14} /> down today
                            </StatSubtext>
                        </StatCard>

                        {computedStats.topGainer && (
                            <StatCard theme={theme} $delay="0.15s" $color={`linear-gradient(90deg, ${successColor}, #22c55e)`} $borderColor={successColor}>
                                <StatHeader>
                                    <StatIcon theme={theme} $bg={`${successColor}26`} $color={successColor}>
                                        <Rocket size={18} />
                                    </StatIcon>
                                    <StatLabel theme={theme}>Top Gainer</StatLabel>
                                </StatHeader>
                                <StatValue theme={theme} $color={successColor}>{computedStats.topGainer.symbol}</StatValue>
                                <StatSubtext theme={theme} $color={successColor}>
                                    <Flame size={14} /> +{computedStats.topGainer.change?.toFixed(2)}%
                                </StatSubtext>
                            </StatCard>
                        )}

                        {computedStats.topLoser && (
                            <StatCard theme={theme} $delay="0.2s" $color={`linear-gradient(90deg, ${errorColor}, #b91c1c)`} $borderColor={errorColor}>
                                <StatHeader>
                                    <StatIcon theme={theme} $bg={`${errorColor}26`} $color={errorColor}>
                                        <AlertTriangle size={18} />
                                    </StatIcon>
                                    <StatLabel theme={theme}>Top Loser</StatLabel>
                                </StatHeader>
                                <StatValue theme={theme} $color={errorColor}>{computedStats.topLoser.symbol}</StatValue>
                                <StatSubtext theme={theme} $color={errorColor}>
                                    <TrendingDown size={14} /> {computedStats.topLoser.change?.toFixed(2)}%
                                </StatSubtext>
                            </StatCard>
                        )}

                        <StatCard theme={theme} $delay="0.25s" $color={`linear-gradient(90deg, #8b5cf6, #7c3aed)`} $borderColor="#8b5cf6">
                            <StatHeader>
                                <StatIcon theme={theme} $bg="rgba(139, 92, 246, 0.26)" $color="#8b5cf6">
                                    <Activity size={18} />
                                </StatIcon>
                                <StatLabel theme={theme}>Avg Change</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={computedStats.avgChange >= 0 ? successColor : errorColor}>
                                {computedStats.avgChange >= 0 ? '+' : ''}{computedStats.avgChange?.toFixed(2)}%
                            </StatValue>
                            <StatSubtext theme={theme}>market sentiment</StatSubtext>
                        </StatCard>
                    </StatsBar>
                )}

                {/* Heatmap */}
                <HeatmapContainer theme={theme}>
                    <HeatmapHeader>
                        <HeatmapTitle theme={theme}>
                            {view === 'treemap' ? <Layers size={22} /> : <LayoutGrid size={22} />}
                            {view === 'treemap' ? 'Treemap View' : 'Grid View'}
                            <span style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 400, marginLeft: '0.5rem' }}>
                                ({data.length} {mode === 'stocks' ? 'stocks' : 'coins'})
                            </span>
                        </HeatmapTitle>
                        <Legend>
                            <LegendItem theme={theme} $bg={`${successColor}26`}>
                                <LegendColor $color={successColor} />
                                +10%+
                            </LegendItem>
                            <LegendItem theme={theme} $bg={`${successColor}1A`}>
                                <LegendColor $color={`${successColor}80`} />
                                +2-10%
                            </LegendItem>
                            <LegendItem theme={theme} $bg={`${successColor}0D`}>
                                <LegendColor $color={`${successColor}59`} />
                                0-2%
                            </LegendItem>
                            <LegendItem theme={theme} $bg={`${errorColor}0D`}>
                                <LegendColor $color={`${errorColor}59`} />
                                -2-0%
                            </LegendItem>
                            <LegendItem theme={theme} $bg={`${errorColor}1A`}>
                                <LegendColor $color={`${errorColor}80`} />
                                -10--2%
                            </LegendItem>
                            <LegendItem theme={theme} $bg={`${errorColor}26`}>
                                <LegendColor $color={errorColor} />
                                -10%-
                            </LegendItem>
                        </Legend>
                    </HeatmapHeader>

                    {loading ? (
                        <LoadingContainer>
                            <SpinningIcon theme={theme}>
                                <Activity size={56} />
                            </SpinningIcon>
                            <LoadingText theme={theme}>Loading {mode === 'stocks' ? 'stock' : 'crypto'} movers...</LoadingText>
                            <LoadingSubtext theme={theme}>Fetching real-time market data</LoadingSubtext>
                        </LoadingContainer>
                    ) : data.length > 0 ? (
                        view === 'treemap' ? (
                            <TreemapContainer>
                                <ResponsiveContainer width="100%" height="100%">
                                    <Treemap
                                        data={treemapData}
                                        dataKey="size"
                                        aspectRatio={16 / 9}
                                        stroke="rgba(0,0,0,0.3)"
                                        content={renderTreemapContent}
                                        animationDuration={300}
                                    >
                                        <Tooltip content={<CustomTooltip />} />
                                    </Treemap>
                                </ResponsiveContainer>
                            </TreemapContainer>
                        ) : (
                            <GridContainer theme={theme}>
                                {data.map((item, index) => (
                                    <GridCell
                                        theme={theme}
                                        key={item.symbol || item.id || index}
                                        $change={item.change}
                                        onClick={() => handleCellClick(item)}
                                        title={`Click to view ${item.symbol} details`}
                                    >
                                        <CellRank theme={theme}>#{index + 1}</CellRank>
                                        <CellSymbol theme={theme}>{item.symbol}</CellSymbol>
                                        <CellName theme={theme}>{item.name}</CellName>
                                        <CellChange theme={theme} $positive={item.change >= 0}>
                                            {item.change >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                            {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                                        </CellChange>
                                        <CellPrice theme={theme}>{formatPrice(item.price)}</CellPrice>
                                    </GridCell>
                                ))}
                            </GridContainer>
                        )
                    ) : (
                        <EmptyState theme={theme}>
                            <EmptyIcon theme={theme}>
                                <Globe size={48} color={primaryColor} />
                            </EmptyIcon>
                            <EmptyTitle theme={theme}>No Market Movers</EmptyTitle>
                            <EmptyText theme={theme}>Unable to load market data. Please try refreshing.</EmptyText>
                            <ActionButton theme={theme} $primary onClick={handleRefresh} style={{ marginTop: '1.5rem' }}>
                                <RefreshCw size={18} />
                                Try Again
                            </ActionButton>
                        </EmptyState>
                    )}
                </HeatmapContainer>
            </ContentWrapper>
        </PageContainer>
    );
};

export default HeatmapPage;
