// client/src/components/MultiTimeframeView.js - Multi-Timeframe Analysis View
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart } from 'lightweight-charts';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, Minus, RefreshCw, X, Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ============ STYLED COMPONENTS ============

const Container = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1rem;
    margin-top: 1rem;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const Title = styled.h3`
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
`;

const ChartGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
`;

const TimeframeCard = styled.div`
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;

    &:hover {
        border-color: ${({ theme }) => theme.brand?.primary}44;
    }
`;

const TimeframeHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const TimeframeLabel = styled.div`
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
`;

const TrendIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    background: ${props => {
        if (props.$trend === 'bullish') return 'rgba(16, 185, 129, 0.15)';
        if (props.$trend === 'bearish') return 'rgba(239, 68, 68, 0.15)';
        return 'rgba(100, 116, 139, 0.15)';
    }};
    color: ${props => {
        if (props.$trend === 'bullish') return '#10b981';
        if (props.$trend === 'bearish') return '#ef4444';
        return '#64748b';
    }};
`;

const ChartContainer = styled.div`
    height: 180px;
    width: 100%;
`;

const StatsRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    color: #94a3b8;
    background: rgba(0, 0, 0, 0.15);
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: ${props => props.$align || 'flex-start'};

    span:first-child {
        color: #64748b;
        margin-bottom: 2px;
    }

    span:last-child {
        color: ${props => props.$color || '#e2e8f0'};
        font-weight: 500;
    }
`;

const LoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);

    svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// Timeframe configurations
const TIMEFRAMES = [
    { id: '1h', label: '1 Hour', interval: '1h' },
    { id: '4h', label: '4 Hours', interval: '4h' },
    { id: '1D', label: 'Daily', interval: '1D' },
    { id: '1W', label: 'Weekly', interval: '1W' }
];

// ============ MINI CHART COMPONENT ============

const MiniChart = ({ symbol, timeframe, api, theme }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trend, setTrend] = useState('neutral');
    const [stats, setStats] = useState({ open: 0, high: 0, low: 0, close: 0, change: 0 });

    // Fetch data for this timeframe
    useEffect(() => {
        const fetchData = async () => {
            if (!api || !symbol) return;

            setLoading(true);
            try {
                const response = await api.get(`/chart/ohlc/${encodeURIComponent(symbol)}`, {
                    params: { interval: timeframe.interval, limit: 50 }
                });

                if (response.data?.success && response.data?.data?.length > 0) {
                    const chartData = response.data.data;
                    setData(chartData);

                    // Calculate trend based on SMA comparison
                    const closes = chartData.map(d => d.close);
                    const sma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
                    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
                    const currentPrice = closes[closes.length - 1];

                    if (currentPrice > sma10 && sma10 > sma20) {
                        setTrend('bullish');
                    } else if (currentPrice < sma10 && sma10 < sma20) {
                        setTrend('bearish');
                    } else {
                        setTrend('neutral');
                    }

                    // Calculate stats
                    const lastCandle = chartData[chartData.length - 1];
                    const prevClose = chartData[chartData.length - 2]?.close || lastCandle.open;
                    const changePercent = ((lastCandle.close - prevClose) / prevClose) * 100;

                    // Get high/low of visible range
                    const periodHigh = Math.max(...chartData.map(d => d.high));
                    const periodLow = Math.min(...chartData.map(d => d.low));

                    setStats({
                        open: lastCandle.open,
                        high: periodHigh,
                        low: periodLow,
                        close: lastCandle.close,
                        change: changePercent
                    });
                }
            } catch (error) {
                console.error(`[MultiTimeframe] Error fetching ${timeframe.id} data:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [api, symbol, timeframe]);

    // Create/update chart
    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        // Clean up existing chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 180,
            layout: {
                background: { color: 'transparent' },
                textColor: '#64748b',
                fontSize: 10,
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
            },
            rightPriceScale: {
                borderVisible: false,
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderVisible: false,
                timeVisible: false,
                secondsVisible: false,
            },
            crosshair: {
                mode: 0,
            },
            handleScale: false,
            handleScroll: false,
        });

        chartRef.current = chart;

        // Add candlestick series
        const candleSeries = chart.addCandlestickSeries({
            upColor: theme.success || '#10b981',
            downColor: theme.error || '#ef4444',
            borderUpColor: theme.success || '#10b981',
            borderDownColor: theme.error || '#ef4444',
            wickUpColor: theme.success || '#10b981',
            wickDownColor: theme.error || '#ef4444',
        });

        candleSeries.setData(data);

        // Fit content
        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [data, theme]);

    // Format price
    const formatPrice = (price) => {
        if (!price) return '-';
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        if (price < 100) return `$${price.toFixed(2)}`;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <TimeframeCard>
            <TimeframeHeader>
                <TimeframeLabel>{timeframe.label}</TimeframeLabel>
                <TrendIndicator $trend={trend}>
                    {trend === 'bullish' && <TrendingUp size={14} />}
                    {trend === 'bearish' && <TrendingDown size={14} />}
                    {trend === 'neutral' && <Minus size={14} />}
                    {trend.charAt(0).toUpperCase() + trend.slice(1)}
                </TrendIndicator>
            </TimeframeHeader>

            <div style={{ position: 'relative' }}>
                <ChartContainer ref={chartContainerRef} />
                {loading && (
                    <LoadingOverlay>
                        <RefreshCw size={24} color="#64748b" />
                    </LoadingOverlay>
                )}
            </div>

            <StatsRow>
                <StatItem>
                    <span>High</span>
                    <span>{formatPrice(stats.high)}</span>
                </StatItem>
                <StatItem $align="center">
                    <span>Change</span>
                    <span $color={stats.change >= 0 ? '#10b981' : '#ef4444'}>
                        {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}%
                    </span>
                </StatItem>
                <StatItem $align="flex-end">
                    <span>Low</span>
                    <span>{formatPrice(stats.low)}</span>
                </StatItem>
            </StatsRow>
        </TimeframeCard>
    );
};

// ============ MAIN COMPONENT ============

const MultiTimeframeView = ({ symbol, api, onClose }) => {
    const { theme } = useTheme();

    return (
        <Container>
            <Header>
                <Title>
                    <Maximize2 size={18} />
                    Multi-Timeframe Analysis - {symbol}
                </Title>
                <CloseButton onClick={onClose} title="Close">
                    <X size={20} />
                </CloseButton>
            </Header>

            <ChartGrid>
                {TIMEFRAMES.map(tf => (
                    <MiniChart
                        key={tf.id}
                        symbol={symbol}
                        timeframe={tf}
                        api={api}
                        theme={theme}
                    />
                ))}
            </ChartGrid>
        </Container>
    );
};

export default MultiTimeframeView;
