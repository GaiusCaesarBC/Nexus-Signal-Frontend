// client/src/pages/HeatmapPage.js - THEMED HEATMAP WITH CLICKABLE CELLS

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, BarChart3, Flame, RefreshCw,
    Eye, Activity, Bitcoin, Grid3X3, LayoutGrid, Zap,
    ArrowUpRight, ArrowDownRight, Globe, Layers
} from 'lucide-react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
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
    background: rgba(30, 41, 59, 0.8);
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
    background: rgba(30, 41, 59, 0.8);
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
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
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
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 14px;
    padding: 1.25rem;
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
    width: 32px;
    height: 32px;
    border-radius: 8px;
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
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
`;

const StatSubtext = styled.div`
    font-size: 0.8rem;
    color: ${props => props.$color || props.theme?.text?.tertiary || '#64748b'};
    margin-top: 0.25rem;
`;

// ============ HEATMAP CONTAINER ============
const HeatmapContainer = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 20px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
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
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Legend = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const LegendColor = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background: ${props => props.$color};
`;

// ============ TREEMAP VIEW ============
const TreemapContainer = styled.div`
    width: 100%;
    height: 600px;

    @media (max-width: 768px) {
        height: 450px;
    }
`;

// ============ GRID VIEW ============
const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
`;

const GridCell = styled.div`
    background: ${props => {
        const change = props.$change;
        const successColor = props.theme?.success || '#10b981';
        const errorColor = props.theme?.error || '#ef4444';
        if (change > 5) return `linear-gradient(135deg, ${successColor}59, ${successColor}40)`;
        if (change > 2) return `linear-gradient(135deg, ${successColor}40, ${successColor}26)`;
        if (change > 0) return `linear-gradient(135deg, ${successColor}26, ${successColor}14)`;
        if (change > -2) return `linear-gradient(135deg, ${errorColor}26, ${errorColor}14)`;
        if (change > -5) return `linear-gradient(135deg, ${errorColor}40, ${errorColor}26)`;
        return `linear-gradient(135deg, ${errorColor}59, ${errorColor}40)`;
    }};
    border: 1px solid ${props => props.$change >= 0 
        ? `${props.theme?.success || '#10b981'}4D` 
        : `${props.theme?.error || '#ef4444'}4D`};
    border-radius: 12px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        border-radius: 12px 0 0 12px;
        background: ${props => props.$change >= 0 
            ? (props.theme?.success || '#10b981') 
            : (props.theme?.error || '#ef4444')};
    }

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px ${props => props.$change >= 0 
            ? `${props.theme?.success || '#10b981'}40` 
            : `${props.theme?.error || '#ef4444'}40`};
        border-color: ${props => props.$change >= 0 
            ? `${props.theme?.success || '#10b981'}80` 
            : `${props.theme?.error || '#ef4444'}80`};
    }
`;

const CellSymbol = styled.div`
    font-size: 1.2rem;
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
    font-size: 1.25rem;
    font-weight: 800;
    color: ${props => props.$positive 
        ? (props.theme?.success || '#10b981') 
        : (props.theme?.error || '#ef4444')};
`;

const CellPrice = styled.div`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    margin-top: 0.5rem;
`;

// ============ LOADING ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1rem;
`;

const SpinningIcon = styled.div`
    animation: ${rotate} 2s linear infinite;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const LoadingText = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
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
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}66;
    border-radius: 12px;
    padding: 1rem;
    min-width: 180px;
`;

const TooltipSymbol = styled.div`
    font-size: 1.1rem;
    font-weight: 800;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const TooltipName = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    margin-bottom: 0.75rem;
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.35rem;
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
    const [mode, setMode] = useState('stocks'); // 'stocks' or 'crypto'
    const [view, setView] = useState('treemap'); // 'treemap' or 'grid'
    const [data, setData] = useState([]);

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
            setData(response.data || []);
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
            // Navigate to crypto detail page - use id for CoinGecko coins, fallback to lowercase symbol
            navigate(`/crypto/${item.id || item.symbol.toLowerCase()}`);
        } else {
            // Navigate to stock detail page with symbol (uppercase) - route is /stocks/:symbol
            navigate(`/stocks/${item.symbol.toUpperCase()}`);
        }
    };

    // Calculate stats
    const stats = useMemo(() => {
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
    }, [data]);

    // Get theme colors for treemap
    const getTreemapColor = (change) => {
        const successColor = theme?.success || '#10b981';
        const errorColor = theme?.error || '#ef4444';
        
        if (change > 5) return `${successColor}d9`;
        if (change > 2) return `${successColor}a6`;
        if (change > 0) return `${successColor}73`;
        if (change > -2) return `${errorColor}73`;
        if (change > -5) return `${errorColor}a6`;
        return `${errorColor}d9`;
    };

    // Custom treemap content
    const renderTreemapContent = (props) => {
        const { x, y, width, height, name } = props;
        const item = data.find(d => d.symbol === name || d.name === name);
        
        if (!item || width < 60 || height < 40) return null;

        const change = item.change || 0;
        const fillColor = getTreemapColor(change);
        const strokeColor = change >= 0 
            ? `${theme?.success || '#10b981'}99` 
            : `${theme?.error || '#ef4444'}99`;

        const fontSize = Math.max(Math.min(width / 6, height / 3, 18), 10);

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
                        strokeWidth: 2,
                        cursor: 'pointer'
                    }}
                    onClick={() => handleCellClick(item)}
                />
                <text
                    x={x + width / 2}
                    y={y + height / 2 - fontSize * 0.3}
                    textAnchor="middle"
                    fill="white"
                    fontSize={fontSize}
                    fontWeight="800"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
                >
                    {item.symbol}
                </text>
                <text
                    x={x + width / 2}
                    y={y + height / 2 + fontSize * 0.8}
                    textAnchor="middle"
                    fill="white"
                    fontSize={fontSize * 0.7}
                    fontWeight="700"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
                >
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                </text>
            </g>
        );
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload[0]) return null;
        
        const item = data.find(d => d.symbol === payload[0].payload.name || d.name === payload[0].payload.name);
        if (!item) return null;

        return (
            <TooltipContainer theme={theme}>
                <TooltipSymbol theme={theme}>{item.symbol}</TooltipSymbol>
                <TooltipName theme={theme}>{item.name}</TooltipName>
                <TooltipRow>
                    <TooltipLabel theme={theme}>Price</TooltipLabel>
                    <TooltipValue theme={theme}>${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TooltipValue>
                </TooltipRow>
                <TooltipRow>
                    <TooltipLabel theme={theme}>Change</TooltipLabel>
                    <TooltipValue theme={theme} $color={item.change >= 0 ? (theme?.success || '#10b981') : (theme?.error || '#ef4444')}>
                        {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                    </TooltipValue>
                </TooltipRow>
                {item.size && (
                    <TooltipRow>
                        <TooltipLabel theme={theme}>Market Cap</TooltipLabel>
                        <TooltipValue theme={theme}>${item.size?.toFixed(1)}B</TooltipValue>
                    </TooltipRow>
                )}
            </TooltipContainer>
        );
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`;
        if (price >= 1) return `$${price.toFixed(2)}`;
        return `$${price.toFixed(4)}`;
    };

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
                                <Globe size={32} color={primaryColor} />
                                Market Heatmap
                            </Title>
                            <Subtitle theme={theme}>Visual market performance • {data.length} {mode === 'stocks' ? 'stocks' : 'cryptocurrencies'}</Subtitle>
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
                                <ViewButton theme={theme} $active={view === 'treemap'} onClick={() => setView('treemap')}>
                                    <Layers size={18} />
                                </ViewButton>
                                <ViewButton theme={theme} $active={view === 'grid'} onClick={() => setView('grid')}>
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
                        <StatCard theme={theme} $delay="0s" $color={theme?.brand?.gradient || `linear-gradient(90deg, ${primaryColor}, ${theme?.brand?.secondary || '#0088cc'})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${primaryColor}26`} $color={primaryColor}>
                                    <Eye size={16} />
                                </StatIcon>
                                <StatLabel theme={theme}>Total</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme}>{stats.total}</StatValue>
                            <StatSubtext theme={theme}>{mode === 'stocks' ? 'stocks' : 'tokens'}</StatSubtext>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.1s" $color={`linear-gradient(90deg, ${successColor}, ${theme?.success || '#059669'})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${successColor}26`} $color={successColor}>
                                    <TrendingUp size={16} />
                                </StatIcon>
                                <StatLabel theme={theme}>Gainers</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={successColor}>{stats.gainers}</StatValue>
                            <StatSubtext theme={theme} $color={successColor}>up today</StatSubtext>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.2s" $color={`linear-gradient(90deg, ${errorColor}, ${theme?.error || '#dc2626'})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${errorColor}26`} $color={errorColor}>
                                    <TrendingDown size={16} />
                                </StatIcon>
                                <StatLabel theme={theme}>Losers</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={errorColor}>{stats.losers}</StatValue>
                            <StatSubtext theme={theme} $color={errorColor}>down today</StatSubtext>
                        </StatCard>

                        {stats.topGainer && (
                            <StatCard theme={theme} $delay="0.3s" $color={`linear-gradient(90deg, ${successColor}, ${theme?.success || '#059669'})`}>
                                <StatHeader>
                                    <StatIcon theme={theme} $bg={`${successColor}26`} $color={successColor}>
                                        <Flame size={16} />
                                    </StatIcon>
                                    <StatLabel theme={theme}>Top Gainer</StatLabel>
                                </StatHeader>
                                <StatValue theme={theme} $color={successColor}>{stats.topGainer.symbol}</StatValue>
                                <StatSubtext theme={theme} $color={successColor}>+{stats.topGainer.change?.toFixed(2)}%</StatSubtext>
                            </StatCard>
                        )}

                        {stats.topLoser && (
                            <StatCard theme={theme} $delay="0.4s" $color={`linear-gradient(90deg, ${errorColor}, ${theme?.error || '#dc2626'})`}>
                                <StatHeader>
                                    <StatIcon theme={theme} $bg={`${errorColor}26`} $color={errorColor}>
                                        <TrendingDown size={16} />
                                    </StatIcon>
                                    <StatLabel theme={theme}>Top Loser</StatLabel>
                                </StatHeader>
                                <StatValue theme={theme} $color={errorColor}>{stats.topLoser.symbol}</StatValue>
                                <StatSubtext theme={theme} $color={errorColor}>{stats.topLoser.change?.toFixed(2)}%</StatSubtext>
                            </StatCard>
                        )}
                    </StatsBar>
                )}

                {/* Heatmap */}
                <HeatmapContainer theme={theme}>
                    <HeatmapHeader>
                        <HeatmapTitle theme={theme}>
                            <Layers size={22} />
                            {view === 'treemap' ? 'Treemap View' : 'Grid View'}
                        </HeatmapTitle>
                        <Legend>
                            <LegendItem theme={theme}>
                                <LegendColor $color={`${successColor}d9`} />
                                Strong Gain
                            </LegendItem>
                            <LegendItem theme={theme}>
                                <LegendColor $color={`${successColor}73`} />
                                Gain
                            </LegendItem>
                            <LegendItem theme={theme}>
                                <LegendColor $color={`${errorColor}73`} />
                                Loss
                            </LegendItem>
                            <LegendItem theme={theme}>
                                <LegendColor $color={`${errorColor}d9`} />
                                Strong Loss
                            </LegendItem>
                        </Legend>
                    </HeatmapHeader>

                    {loading ? (
                        <LoadingContainer>
                            <SpinningIcon theme={theme}>
                                <Activity size={48} />
                            </SpinningIcon>
                            <LoadingText theme={theme}>Loading {mode === 'stocks' ? 'stock' : 'crypto'} data...</LoadingText>
                        </LoadingContainer>
                    ) : data.length > 0 ? (
                        view === 'treemap' ? (
                            <TreemapContainer>
                                <ResponsiveContainer width="100%" height="100%">
                                    <Treemap
                                        data={data.map(d => ({ name: d.symbol, size: d.size || 1, ...d }))}
                                        dataKey="size"
                                        aspectRatio={16 / 9}
                                        stroke="rgba(255,255,255,0.1)"
                                        content={renderTreemapContent}
                                    >
                                        <Tooltip content={<CustomTooltip />} />
                                    </Treemap>
                                </ResponsiveContainer>
                            </TreemapContainer>
                        ) : (
                            <GridContainer>
                                {data.map(item => (
                                    <GridCell 
                                        theme={theme}
                                        key={item.symbol || item.id} 
                                        $change={item.change}
                                        onClick={() => handleCellClick(item)}
                                        title={`Click to view ${item.symbol} details`}
                                    >
                                        <CellSymbol theme={theme}>{item.symbol}</CellSymbol>
                                        <CellName theme={theme}>{item.name}</CellName>
                                        <CellChange theme={theme} $positive={item.change >= 0}>
                                            {item.change >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
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
                            <EmptyTitle theme={theme}>No Data Available</EmptyTitle>
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