// client/src/components/AdvancedChart.js - Professional Trading Charts - THEMED VERSION

import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import styled from 'styled-components';
import {
    TrendingUp, Activity, BarChart3, Maximize2,
    Download, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import {
    calculateSMA,
    calculateEMA,
    calculateBollingerBands
} from '../utils/indicators';
import { useTheme } from '../context/ThemeContext';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';

// Known crypto symbols for detection
const KNOWN_CRYPTOS = [
    'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'DOGE', 'SHIB', 'XRP',
    'BNB', 'LINK', 'UNI', 'AAVE', 'LTC', 'ATOM', 'NEAR', 'APT', 'ARB', 'OP',
    'PEPE', 'FLOKI', 'BONK', 'WIF', 'RENDER', 'FET', 'INJ', 'SUI', 'SEI', 'TIA'
];

// Check if symbol is crypto
const isCryptoSymbol = (symbol) => {
    if (!symbol) return false;
    const upper = symbol.toUpperCase();
    const cryptoPatterns = ['-USD', '-USDT', '-BUSD', '-EUR', '-GBP'];
    if (cryptoPatterns.some(pattern => upper.endsWith(pattern))) return true;
    const base = upper.replace(/-USD.*$/, '').replace(/USDT$/, '');
    return KNOWN_CRYPTOS.includes(base);
};

// Calculate price format precision based on price magnitude
const getPriceFormat = (price) => {
    if (!price || price === 0) {
        return { precision: 2, minMove: 0.01 };
    }

    const absPrice = Math.abs(price);

    if (absPrice < 0.000001) {
        return { precision: 10, minMove: 0.0000000001 };
    } else if (absPrice < 0.0001) {
        return { precision: 8, minMove: 0.00000001 };
    } else if (absPrice < 0.01) {
        return { precision: 6, minMove: 0.000001 };
    } else if (absPrice < 1) {
        return { precision: 5, minMove: 0.00001 };
    } else if (absPrice < 10) {
        return { precision: 4, minMove: 0.0001 };
    } else if (absPrice < 100) {
        return { precision: 3, minMove: 0.001 };
    } else if (absPrice < 1000) {
        return { precision: 2, minMove: 0.01 };
    } else {
        return { precision: 2, minMove: 0.01 };
    }
};

// Check if US stock market is currently open
const isMarketOpen = () => {
    const now = new Date();

    // Get current time in Eastern Time
    const etOptions = { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false };
    const etTime = new Intl.DateTimeFormat('en-US', etOptions).format(now);
    const [hours, minutes] = etTime.split(':').map(Number);
    const currentMinutes = hours * 60 + minutes;

    // Market hours: 9:30 AM - 4:00 PM ET (570 - 960 minutes from midnight)
    const marketOpen = 9 * 60 + 30;  // 9:30 AM = 570 minutes
    const marketClose = 16 * 60;      // 4:00 PM = 960 minutes

    // Get day of week in ET
    const etDayOptions = { timeZone: 'America/New_York', weekday: 'short' };
    const dayOfWeek = new Intl.DateTimeFormat('en-US', etDayOptions).format(now);

    // Check if it's a weekday
    const isWeekday = !['Sat', 'Sun'].includes(dayOfWeek);

    // Check if within market hours
    const isDuringMarketHours = currentMinutes >= marketOpen && currentMinutes < marketClose;

    return isWeekday && isDuringMarketHours;
};

// Smart price formatter based on symbol
const formatChartPrice = (price, symbol) => {
    if (!price) return '$0.00';

    if (isCryptoSymbol(symbol)) {
        return formatCryptoPrice(price);
    }
    return formatStockPrice(price);
};

// ============ STYLED COMPONENTS ============

const ChartContainer = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary}33;
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
`;

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const ChartTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const Symbol = styled.h2`
    font-size: 2rem;
    font-weight: 900;
    background: ${props => props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.accent || props.theme.brand?.secondary} 50%, ${props.theme.brand?.primary} 100%)`};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
`;

const Price = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.$positive ? props.theme.success : props.theme.error};
`;

const PriceChange = styled.div`
    font-size: 1rem;
    color: ${props => props.$positive ? props.theme.success : props.theme.error};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const ChartControls = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        overflow-x: auto;
    }
`;

const ControlGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

const LiveIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    background: ${props => props.$isLive ? `${props.theme.success}1a` : 'rgba(100, 116, 139, 0.1)'};
    border: 1px solid ${props => props.$isLive ? `${props.theme.success}4d` : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 20px;
    font-size: 0.75rem;
    color: ${props => props.$isLive ? props.theme.success : '#64748b'};
    font-weight: 600;

    &::before {
        content: '';
        width: 8px;
        height: 8px;
        background: ${props => props.$isLive ? props.theme.success : '#64748b'};
        border-radius: 50%;
        ${props => props.$isLive && `animation: pulse 2s infinite;`}
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
    }
`;

const LastUpdated = styled.span`
    font-size: 0.7rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    margin-left: 0.5rem;
`;

const LiveButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ?
        `linear-gradient(135deg, #10b98166 0%, #10b98133 100%)` :
        `#10b9810d`
    };
    border: 1px solid ${props => props.$active ? `#10b98180` : `#10b98133`};
    border-radius: 8px;
    color: ${props => props.$active ? '#10b981' : props.theme.text?.secondary};
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.35rem;

    ${props => props.$active && `
        animation: livePulse 2s ease-in-out infinite;
    `}

    @keyframes livePulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    }

    &:hover {
        background: linear-gradient(135deg, #10b98133 0%, #10b9811a 100%);
        border-color: #10b98180;
        color: #10b981;
    }
`;

const TimeframeButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ?
        `linear-gradient(135deg, ${props.theme.brand?.primary}4D 0%, ${props.theme.brand?.primary}33 100%)` :
        `${props.theme.brand?.primary}0d`
    };
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.primary}80` : `${props.theme.brand?.primary}33`};
    border-radius: 8px;
    color: ${props => props.$active ? props.theme.brand?.primary : props.theme.text?.secondary};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.primary}33 0%, ${props => props.theme.brand?.primary}1a 100%);
        border-color: ${props => props.theme.brand?.primary}80;
        color: ${props => props.theme.brand?.primary};
    }
`;

const ChartTypeButton = styled.button`
    padding: 0.5rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme.brand?.primary}4D 0%, ${props.theme.brand?.primary}33 100%)` : 
        `${props.theme.brand?.primary}0d`
    };
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.primary}80` : `${props.theme.brand?.primary}33`};
    border-radius: 8px;
    color: ${props => props.$active ? props.theme.brand?.primary : props.theme.text?.secondary};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.primary}33 0%, ${props => props.theme.brand?.primary}1a 100%);
        border-color: ${props => props.theme.brand?.primary}80;
        color: ${props => props.theme.brand?.primary};
    }
`;

const IndicatorButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme.brand?.accent || props.theme.brand?.secondary}4D 0%, ${props.theme.brand?.accent || props.theme.brand?.secondary}33 100%)` : 
        `${props.theme.brand?.accent || props.theme.brand?.secondary}0d`
    };
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.accent || props.theme.brand?.secondary}80` : `${props.theme.brand?.accent || props.theme.brand?.secondary}33`};
    border-radius: 8px;
    color: ${props => props.$active ? (props.theme.brand?.accent || props.theme.brand?.secondary) : props.theme.text?.secondary};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.accent || props.theme.brand?.secondary}33 0%, ${props => props.theme.brand?.accent || props.theme.brand?.secondary}1a 100%);
        border-color: ${props => props.theme.brand?.accent || props.theme.brand?.secondary}80;
        color: ${props => props.theme.brand?.accent || props.theme.brand?.secondary};
    }
`;

const ActionButton = styled.button`
    padding: 0.5rem;
    background: ${props => props.theme.brand?.primary}0d;
    border: 1px solid ${props => props.theme.brand?.primary}33;
    border-radius: 8px;
    color: ${props => props.theme.text?.secondary};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
        background: ${props => props.theme.brand?.primary}26;
        border-color: ${props => props.theme.brand?.primary}80;
        color: ${props => props.theme.brand?.primary};
        transform: translateY(-2px);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const ChartWrapper = styled.div`
    width: 100%;
    height: ${props => props.$height || '500px'};
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(10, 14, 39, 0.5);
`;

const ChartTooltip = styled.div`
    position: absolute;
    top: 12px;
    left: 12px;
    background: ${props => props.theme.bg?.card || 'rgba(15, 23, 42, 0.95)'};
    border: 1px solid ${props => props.theme.brand?.primary}4d;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.8rem;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    z-index: 10;
    pointer-events: none;
    backdrop-filter: blur(8px);
    min-width: 180px;

    .tooltip-time {
        font-weight: 600;
        color: ${props => props.theme.brand?.primary || '#00adef'};
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid ${props => props.theme.brand?.primary}33;
    }

    .tooltip-row {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
    }

    .tooltip-label {
        color: ${props => props.theme.text?.secondary || '#94a3b8'};
    }

    .tooltip-value {
        font-weight: 600;
        font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .tooltip-value.up {
        color: ${props => props.theme.success || '#10b981'};
    }

    .tooltip-value.down {
        color: ${props => props.theme.error || '#ef4444'};
    }
`;

// ============ COMPONENT ============
const AdvancedChart = ({
    symbol = 'AAPL',
    data = [],
    height = '500px',
    timeframe: externalTimeframe = '1D',
    onTimeframeChange,
    onChartTypeChange,
    onRefresh,
    isRefreshing = false,
    livePrice = null,  // Real-time price from WebSocket
    isLive = false     // Whether live streaming is active
}) => {
    const { theme } = useTheme();
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const mainSeriesRef = useRef(null); // Changed from candlestickSeriesRef to mainSeriesRef
    const volumeSeriesRef = useRef(null);
    const indicatorSeriesRef = useRef({});
    
    const [timeframe, setTimeframe] = useState(externalTimeframe);
    const [chartType, setChartType] = useState('candlestick');
    const [activeIndicators, setActiveIndicators] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [tooltipData, setTooltipData] = useState(null);

    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'];
    
    const indicators = [
        { id: 'sma20', label: 'SMA 20', color: theme.brand?.primary || '#00adef' },
        { id: 'sma50', label: 'SMA 50', color: theme.success || '#10b981' },
        { id: 'ema12', label: 'EMA 12', color: theme.warning || '#f59e0b' },
        { id: 'ema26', label: 'EMA 26', color: '#ec4899' },
        { id: 'bb', label: 'Bollinger Bands', color: theme.brand?.accent || '#8b5cf6' },
    ];

    // Get theme color for chart elements
    const primaryColor = theme.brand?.primary || '#00adef';

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: parseInt(height),
            layout: {
                background: { color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: `${primaryColor}1a` },
                horzLines: { color: `${primaryColor}1a` },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: `${primaryColor}80`,
                    labelBackgroundColor: primaryColor,
                },
                horzLine: {
                    color: `${primaryColor}80`,
                    labelBackgroundColor: primaryColor,
                },
            },
            timeScale: {
                borderColor: `${primaryColor}33`,
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time) => {
                    const date = new Date(time * 1000);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const day = date.getDate().toString().padStart(2, '0');
                    // Show date for daily+ timeframes, time for intraday
                    return `${month}/${day} ${hours}:${minutes}`;
                },
            },
            rightPriceScale: {
                borderColor: `${primaryColor}33`,
            },
        });

        chartRef.current = chart;

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        volumeSeriesRef.current = volumeSeries;

        // Subscribe to crosshair move for tooltip
        chart.subscribeCrosshairMove((param) => {
            if (!param || !param.time || param.seriesData.size === 0) {
                setTooltipData(null);
                return;
            }

            // Get the main series data (first series with OHLC data)
            let ohlcData = null;
            let volumeData = null;

            param.seriesData.forEach((value, series) => {
                if (value.open !== undefined) {
                    ohlcData = value;
                } else if (value.value !== undefined && !ohlcData) {
                    // Line/area chart - just has value
                    ohlcData = { close: value.value };
                }
                if (series === volumeSeriesRef.current) {
                    volumeData = value;
                }
            });

            if (ohlcData) {
                const date = new Date(param.time * 1000);
                setTooltipData({
                    time: date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    open: ohlcData.open,
                    high: ohlcData.high,
                    low: ohlcData.low,
                    close: ohlcData.close,
                    volume: volumeData?.value,
                    isUp: ohlcData.close >= ohlcData.open
                });
            }
        });

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [height, theme, primaryColor]);

    // Handle chart type changes - create appropriate series
    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        console.log(`[AdvancedChart] Updating chart with ${data.length} candles for ${symbol}, timeframe=${timeframe}`);

        // Remove existing main series if it exists
        if (mainSeriesRef.current) {
            try {
                chartRef.current.removeSeries(mainSeriesRef.current);
            } catch (error) {
                console.log('Could not remove main series:', error.message);
            }
            mainSeriesRef.current = null;
        }

        // Create new series based on chart type
        if (chartType === 'candlestick') {
            // Calculate price format based on the data's price range
            const samplePrice = data.length > 0 ? data[data.length - 1].close : 100;
            const priceFormat = getPriceFormat(samplePrice);

            console.log(`[AdvancedChart] Price format for ${symbol}: precision=${priceFormat.precision}, minMove=${priceFormat.minMove} (sample price: ${samplePrice})`);

            const candlestickSeries = chartRef.current.addCandlestickSeries({
                upColor: theme.success || '#10b981',
                downColor: theme.error || '#ef4444',
                borderUpColor: theme.success || '#10b981',
                borderDownColor: theme.error || '#ef4444',
                wickUpColor: theme.success || '#10b981',
                wickDownColor: theme.error || '#ef4444',
                priceFormat: {
                    type: 'price',
                    precision: priceFormat.precision,
                    minMove: priceFormat.minMove,
                },
            });
            mainSeriesRef.current = candlestickSeries;

            // Set data
            candlestickSeries.setData(data);
        } else if (chartType === 'line') {
            const samplePrice = data.length > 0 ? data[data.length - 1].close : 100;
            const priceFormat = getPriceFormat(samplePrice);

            const lineSeries = chartRef.current.addLineSeries({
                color: theme.brand?.primary || '#00adef',
                lineWidth: 2,
                priceFormat: {
                    type: 'price',
                    precision: priceFormat.precision,
                    minMove: priceFormat.minMove,
                },
            });
            mainSeriesRef.current = lineSeries;

            // Convert OHLC data to line data (using close price)
            const lineData = data.map(d => ({
                time: d.time,
                value: d.close
            }));
            lineSeries.setData(lineData);
        } else if (chartType === 'area') {
            const samplePrice = data.length > 0 ? data[data.length - 1].close : 100;
            const priceFormat = getPriceFormat(samplePrice);

            const areaSeries = chartRef.current.addAreaSeries({
                topColor: `${theme.brand?.primary || '#00adef'}80`,
                bottomColor: `${theme.brand?.primary || '#00adef'}00`,
                lineColor: theme.brand?.primary || '#00adef',
                lineWidth: 2,
                priceFormat: {
                    type: 'price',
                    precision: priceFormat.precision,
                    minMove: priceFormat.minMove,
                },
            });
            mainSeriesRef.current = areaSeries;

            // Convert OHLC data to area data (using close price)
            const areaData = data.map(d => ({
                time: d.time,
                value: d.close
            }));
            areaSeries.setData(areaData);
        }

        chartRef.current?.timeScale().fitContent();
    }, [chartType, data, theme, symbol, timeframe]);

    // Update chart data
    // Update volume and price info when data changes
    useEffect(() => {
        if (!volumeSeriesRef.current || data.length === 0) return;

        try {
            // Update volume data
            const volumeData = data.map(d => ({
                time: d.time,
                value: d.volume || 0,
                color: d.close >= d.open ? `${theme.success || '#10b981'}80` : `${theme.error || '#ef4444'}80`
            }));
            volumeSeriesRef.current.setData(volumeData);

            // Update current price and price change
            if (data.length > 0) {
                const latest = data[data.length - 1];
                setCurrentPrice(latest.close);
                setLastUpdated(new Date());

                if (data.length > 1) {
                    const previous = data[data.length - 2];
                    const change = latest.close - previous.close;
                    const changePercent = (change / previous.close) * 100;
                    setPriceChange({ amount: change, percent: changePercent });
                }
            }
        } catch (error) {
            console.error('Error updating chart data:', error);
        }
    }, [data, theme]);

    // Update indicators
    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        // Remove old indicators safely
        Object.entries(indicatorSeriesRef.current).forEach(([key, series]) => {
            try {
                if (chartRef.current) {
                    // Handle Bollinger Bands (which is an object with upper, middle, lower)
                    if (key === 'bb' && series && typeof series === 'object' && series.upper) {
                        if (series.upper) chartRef.current.removeSeries(series.upper);
                        if (series.middle) chartRef.current.removeSeries(series.middle);
                        if (series.lower) chartRef.current.removeSeries(series.lower);
                    } 
                    // Handle regular indicators (which are single series)
                    else if (series && typeof series.setData === 'function') {
                        chartRef.current.removeSeries(series);
                    }
                }
            } catch (error) {
                console.log(`Could not remove indicator ${key}:`, error.message);
            }
        });
        
        // Clear the ref
        indicatorSeriesRef.current = {};

        // Add active indicators
        activeIndicators.forEach(indicatorId => {
            try {
                if (indicatorId === 'sma20') {
                    const smaData = calculateSMA(data, 20);
                    const series = chartRef.current.addLineSeries({
                        color: theme.brand?.primary || '#00adef',
                        lineWidth: 2,
                        title: 'SMA 20',
                    });
                    series.setData(smaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'sma50') {
                    const smaData = calculateSMA(data, 50);
                    const series = chartRef.current.addLineSeries({
                        color: theme.success || '#10b981',
                        lineWidth: 2,
                        title: 'SMA 50',
                    });
                    series.setData(smaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'ema12') {
                    const emaData = calculateEMA(data, 12);
                    const series = chartRef.current.addLineSeries({
                        color: theme.warning || '#f59e0b',
                        lineWidth: 2,
                        title: 'EMA 12',
                    });
                    series.setData(emaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'ema26') {
                    const emaData = calculateEMA(data, 26);
                    const series = chartRef.current.addLineSeries({
                        color: '#ec4899',
                        lineWidth: 2,
                        title: 'EMA 26',
                    });
                    series.setData(emaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'bb') {
                    const bbData = calculateBollingerBands(data, 20, 2);
                    const bbColor = theme.brand?.accent || '#8b5cf6';
                    
                    const upperSeries = chartRef.current.addLineSeries({
                        color: bbColor,
                        lineWidth: 1,
                        title: 'BB Upper',
                        lineStyle: 2,
                    });
                    upperSeries.setData(bbData.upper);
                    
                    const middleSeries = chartRef.current.addLineSeries({
                        color: bbColor,
                        lineWidth: 1,
                        title: 'BB Middle',
                    });
                    middleSeries.setData(bbData.sma);
                    
                    const lowerSeries = chartRef.current.addLineSeries({
                        color: bbColor,
                        lineWidth: 1,
                        title: 'BB Lower',
                        lineStyle: 2,
                    });
                    lowerSeries.setData(bbData.lower);
                    
                    // Store as object so we can remove all three later
                    indicatorSeriesRef.current[indicatorId] = { 
                        upper: upperSeries, 
                        middle: middleSeries, 
                        lower: lowerSeries 
                    };
                }
                
            } catch (error) {
                console.error(`Error adding indicator ${indicatorId}:`, error);
            }
        });
    }, [activeIndicators, data, theme]);

    // Sync internal timeframe with external prop
    useEffect(() => {
        setTimeframe(externalTimeframe);
    }, [externalTimeframe]);

    // Handle live price updates - update chart in real-time
    useEffect(() => {
        if (!livePrice || !mainSeriesRef.current || data.length === 0) {
            return;
        }

        console.log(`[AdvancedChart] Live price update: ${symbol} = $${livePrice}`);

        try {
            const lastCandle = data[data.length - 1];
            if (!lastCandle) return;

            // Create a new timestamp for the current time (for live updates)
            const now = Math.floor(Date.now() / 1000);
            const candleTime = lastCandle.time;

            // Update the last candle with live price
            const updatedCandle = {
                time: candleTime,
                open: lastCandle.open,
                high: Math.max(lastCandle.high, livePrice),
                low: Math.min(lastCandle.low, livePrice),
                close: livePrice
            };

            // Update the series based on chart type
            if (chartType === 'candlestick') {
                mainSeriesRef.current.update(updatedCandle);
            } else {
                // Line/Area chart - just update close value
                mainSeriesRef.current.update({
                    time: candleTime,
                    value: livePrice
                });
            }

            // Update price display
            setCurrentPrice(livePrice);
            setLastUpdated(new Date());

            // Update price change (compare to first candle's open for accurate daily change)
            if (data.length > 0) {
                const firstCandle = data[0];
                const change = livePrice - firstCandle.open;
                const changePercent = (change / firstCandle.open) * 100;
                setPriceChange({ amount: change, percent: changePercent });
            }
        } catch (error) {
            console.error('[AdvancedChart] Live update error:', error);
        }
    }, [livePrice, data, chartType, symbol]);

    const handleTimeframeChange = (tf) => {
        setTimeframe(tf);
        if (onTimeframeChange) {
            onTimeframeChange(tf);
        }
    };

    const handleChartTypeChange = (type) => {
        setChartType(type);
        if (onChartTypeChange) {
            onChartTypeChange(type);
        }
    };

    const toggleIndicator = (indicatorId) => {
        setActiveIndicators(prev => {
            if (prev.includes(indicatorId)) {
                return prev.filter(id => id !== indicatorId);
            } else {
                return [...prev, indicatorId];
            }
        });
    };

    const handleFullscreen = () => {
        if (chartContainerRef.current?.parentElement) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                chartContainerRef.current.parentElement.requestFullscreen();
            }
        }
    };

    return (
        <ChartContainer>
            <ChartHeader>
                <ChartTitle>
                    <div>
                        <Symbol>{symbol}</Symbol>
                        {currentPrice && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                <Price $positive={priceChange?.amount >= 0}>
                                    {formatChartPrice(currentPrice, symbol)}
                                </Price>
                                {priceChange && (
                                    <PriceChange $positive={priceChange.amount >= 0}>
                                        {priceChange.amount >= 0 ? <TrendingUp size={16} /> : <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />}
                                        {priceChange.amount >= 0 ? '+' : ''}{formatChartPrice(Math.abs(priceChange.amount), symbol)} ({priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%)
                                    </PriceChange>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                        <LiveIndicator $isLive={isLive && (isCryptoSymbol(symbol) || isMarketOpen())}>
                            {(() => {
                                const isCrypto = isCryptoSymbol(symbol);
                                const marketOpen = isMarketOpen();

                                if (isCrypto) {
                                    return isLive ? 'LIVE' : 'DELAYED';
                                } else {
                                    // Stock
                                    if (!marketOpen) return 'CLOSED';
                                    return isLive ? 'LIVE' : 'DELAYED';
                                }
                            })()}
                        </LiveIndicator>
                        {lastUpdated && (
                            <LastUpdated>
                                Updated: {lastUpdated.toLocaleTimeString()}
                            </LastUpdated>
                        )}
                    </div>
                </ChartTitle>

                <ChartControls>
                    <ControlGroup>
                        <LiveButton
                            $active={timeframe === 'LIVE'}
                            onClick={() => handleTimeframeChange('LIVE')}
                            title="Real-time live data"
                        >
                            <span style={{ color: timeframe === 'LIVE' ? '#10b981' : '#64748b' }}>●</span>
                            LIVE
                        </LiveButton>
                        {timeframes.map(tf => (
                            <TimeframeButton
                                key={tf}
                                $active={timeframe === tf}
                                onClick={() => handleTimeframeChange(tf)}
                            >
                                {tf}
                            </TimeframeButton>
                        ))}
                    </ControlGroup>

                    <ControlGroup>
                        <ChartTypeButton
                            $active={chartType === 'candlestick'}
                            onClick={() => handleChartTypeChange('candlestick')}
                            title="Candlestick"
                        >
                            <BarChart3 size={18} />
                        </ChartTypeButton>
                        <ChartTypeButton
                            $active={chartType === 'line'}
                            onClick={() => handleChartTypeChange('line')}
                            title="Line"
                        >
                            <TrendingUp size={18} />
                        </ChartTypeButton>
                        <ChartTypeButton
                            $active={chartType === 'area'}
                            onClick={() => handleChartTypeChange('area')}
                            title="Area"
                        >
                            <Activity size={18} />
                        </ChartTypeButton>
                    </ControlGroup>

                    <ControlGroup>
                        {onRefresh && (
                            <ActionButton
                                onClick={onRefresh}
                                title="Refresh Data"
                                disabled={isRefreshing}
                                style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}}
                            >
                                <RefreshCw size={18} style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}} />
                            </ActionButton>
                        )}
                        <ActionButton onClick={handleFullscreen} title="Fullscreen">
                            <Maximize2 size={18} />
                        </ActionButton>
                        <ActionButton title="Export">
                            <Download size={18} />
                        </ActionButton>
                    </ControlGroup>
                </ChartControls>
            </ChartHeader>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {indicators.map(indicator => (
                    <IndicatorButton
                        key={indicator.id}
                        $active={activeIndicators.includes(indicator.id)}
                        onClick={() => toggleIndicator(indicator.id)}
                    >
                        {activeIndicators.includes(indicator.id) ? <Eye size={14} /> : <EyeOff size={14} />}
                        {indicator.label}
                    </IndicatorButton>
                ))}
            </div>

            <ChartWrapper $height={height}>
                <div ref={chartContainerRef} />
                {tooltipData && (
                    <ChartTooltip>
                        <div className="tooltip-time">{tooltipData.time}</div>
                        {tooltipData.open !== undefined && (
                            <>
                                <div className="tooltip-row">
                                    <span className="tooltip-label">Open:</span>
                                    <span className="tooltip-value">{formatChartPrice(tooltipData.open, symbol)}</span>
                                </div>
                                <div className="tooltip-row">
                                    <span className="tooltip-label">High:</span>
                                    <span className="tooltip-value">{formatChartPrice(tooltipData.high, symbol)}</span>
                                </div>
                                <div className="tooltip-row">
                                    <span className="tooltip-label">Low:</span>
                                    <span className="tooltip-value">{formatChartPrice(tooltipData.low, symbol)}</span>
                                </div>
                            </>
                        )}
                        <div className="tooltip-row">
                            <span className="tooltip-label">Close:</span>
                            <span className={`tooltip-value ${tooltipData.isUp ? 'up' : 'down'}`}>
                                {formatChartPrice(tooltipData.close, symbol)}
                            </span>
                        </div>
                        {tooltipData.volume && (
                            <div className="tooltip-row">
                                <span className="tooltip-label">Volume:</span>
                                <span className="tooltip-value">
                                    {tooltipData.volume >= 1000000
                                        ? (tooltipData.volume / 1000000).toFixed(2) + 'M'
                                        : tooltipData.volume >= 1000
                                            ? (tooltipData.volume / 1000).toFixed(2) + 'K'
                                            : tooltipData.volume.toLocaleString()
                                    }
                                </span>
                            </div>
                        )}
                    </ChartTooltip>
                )}
            </ChartWrapper>
        </ChartContainer>
    );
};

export default AdvancedChart;