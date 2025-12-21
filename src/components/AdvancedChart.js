// client/src/components/AdvancedChart.js - Professional Trading Charts - THEMED VERSION

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import styled, { keyframes, css } from 'styled-components';
import {
    TrendingUp, Activity, BarChart3, Maximize2,
    Download, Eye, EyeOff, RefreshCw, Sparkles, Target, Lock, Brain
} from 'lucide-react';
import {
    calculateSMA,
    calculateEMA,
    calculateBollingerBands,
    calculateRSI,
    calculateMACD,
    calculateVWAP,
    calculateATR,
    calculateStochastic
} from '../utils/indicators';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';
import UpgradePrompt from './UpgradePrompt';

// Animation for NEXUS indicator
const nexusPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    50% { box-shadow: 0 0 12px 4px rgba(59, 130, 246, 0.2); }
`;

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

// Special styled button for NEXUS AI indicator
const NexusButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$locked
        ? `linear-gradient(135deg, #64748b1a 0%, #47556922 100%)`
        : props.$active
            ? `linear-gradient(135deg, #3b82f64D 0%, #8b5cf64D 100%)`
            : `linear-gradient(135deg, #3b82f60d 0%, #8b5cf60d 100%)`
    };
    border: 1px solid ${props => props.$locked
        ? '#64748b44'
        : props.$active ? '#3b82f6' : '#3b82f633'
    };
    border-radius: 8px;
    color: ${props => props.$locked
        ? '#94a3b8'
        : props.$active ? '#3b82f6' : props.theme.text?.secondary
    };
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    position: relative;

    ${props => props.$active && !props.$locked && css`animation: ${nexusPulse} 2s ease-in-out infinite;`}

    &:hover {
        background: ${props => props.$locked
            ? `linear-gradient(135deg, #a855f71a 0%, #f59e0b1a 100%)`
            : `linear-gradient(135deg, #3b82f633 0%, #8b5cf633 100%)`
        };
        border-color: ${props => props.$locked ? '#f59e0b66' : '#3b82f6'};
        color: ${props => props.$locked ? '#f59e0b' : '#3b82f6'};
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    svg {
        ${props => props.$loading && `animation: spin 1s linear infinite;`}
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

// Special styled button for NEXUS Pattern indicator
const PatternButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$locked
        ? `linear-gradient(135deg, #64748b1a 0%, #47556922 100%)`
        : props.$active
            ? `linear-gradient(135deg, #10b9814D 0%, #22c55e4D 100%)`
            : `linear-gradient(135deg, #10b9810d 0%, #22c55e0d 100%)`
    };
    border: 1px solid ${props => props.$locked
        ? '#64748b44'
        : props.$active ? '#10b981' : '#10b98133'
    };
    border-radius: 8px;
    color: ${props => props.$locked
        ? '#94a3b8'
        : props.$active ? '#10b981' : props.theme.text?.secondary
    };
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    position: relative;

    &:hover {
        background: ${props => props.$locked
            ? `linear-gradient(135deg, #a855f71a 0%, #f59e0b1a 100%)`
            : `linear-gradient(135deg, #10b98133 0%, #22c55e33 100%)`
        };
        border-color: ${props => props.$locked ? '#f59e0b66' : '#10b981'};
        color: ${props => props.$locked ? '#f59e0b' : '#10b981'};
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    svg {
        ${props => props.$loading && `animation: spin 1s linear infinite;`}
    }
`;

// Pattern badge display
const PatternBadge = styled.div`
    position: absolute;
    top: 50px;
    left: 12px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(34, 197, 94, 0.95) 100%);
    border: 1px solid #10b981;
    border-radius: 12px;
    padding: 12px 16px;
    z-index: 15;
    backdrop-filter: blur(8px);
    min-width: 220px;
    max-width: 280px;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    max-height: 300px;
    overflow-y: auto;

    .pattern-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.8);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        font-weight: 600;
    }

    .pattern-count {
        font-size: 0.9rem;
        font-weight: 700;
        color: white;
        margin-bottom: 8px;
    }

    .pattern-item {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 6px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(0, 0, 0, 0.4);
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        &:last-child {
            margin-bottom: 0;
        }
    }

    .pattern-name {
        font-size: 0.85rem;
        font-weight: 700;
        color: white;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .pattern-type {
        font-size: 0.7rem;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 4px;
        background: ${props => props.$type === 'bullish' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        color: ${props => props.$type === 'bullish' ? '#22c55e' : '#ef4444'};
    }

    .pattern-confidence {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 4px;
    }

    .pattern-target {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 2px;
        font-weight: 600;
    }

    .no-patterns {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        padding: 8px 0;
    }
`;

// Prediction badge display
const PredictionBadge = styled.div`
    position: absolute;
    top: 50px;
    right: 12px;
    background: ${props => props.$direction === 'UP'
        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(234, 88, 12, 0.95) 100%)'
    };
    border: 1px solid ${props => props.$direction === 'UP' ? '#3b82f6' : '#f97316'};
    border-radius: 12px;
    padding: 12px 16px;
    z-index: 15;
    backdrop-filter: blur(8px);
    min-width: 200px;
    box-shadow: 0 4px 20px ${props => props.$direction === 'UP'
        ? 'rgba(59, 130, 246, 0.3)'
        : 'rgba(249, 115, 22, 0.3)'
    };

    .prediction-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        opacity: 0.9;
    }

    .prediction-direction {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 1.25rem;
        font-weight: 900;
        color: white;
        margin-bottom: 4px;
    }

    .prediction-target {
        font-size: 0.9rem;
        color: white;
        opacity: 0.95;
        margin-bottom: 4px;
    }

    .prediction-confidence {
        font-size: 0.75rem;
        color: white;
        opacity: 0.8;
    }

    .prediction-change {
        font-size: 0.8rem;
        color: white;
        font-weight: 600;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid rgba(255,255,255,0.2);
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
    const { api } = useAuth();
    const { canUseFeature, hasPlanAccess } = useSubscription();
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const mainSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const indicatorSeriesRef = useRef({});
    const predictionLineRef = useRef(null);
    const patternSeriesRef = useRef([]);  // Array to hold pattern drawing series

    const [timeframe, setTimeframe] = useState(externalTimeframe);
    const [chartType, setChartType] = useState('candlestick');
    const [activeIndicators, setActiveIndicators] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [tooltipData, setTooltipData] = useState(null);

    // NEXUS AI Prediction state
    const [nexusEnabled, setNexusEnabled] = useState(false);
    const [nexusPrediction, setNexusPrediction] = useState(null);
    const [nexusLoading, setNexusLoading] = useState(false);
    const [nexusError, setNexusError] = useState(null);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

    // NEXUS Pattern state
    const [patternEnabled, setPatternEnabled] = useState(false);
    const [patterns, setPatterns] = useState([]);
    const [patternLoading, setPatternLoading] = useState(false);
    const [patternError, setPatternError] = useState(null);

    // Check if user has access to NEXUS AI (Premium/Elite only)
    const hasNexusAccess = canUseFeature('hasNexusAI') || hasPlanAccess('premium');

    // Reset state when symbol changes to prevent showing stale data
    useEffect(() => {
        console.log(`[AdvancedChart] Symbol changed to ${symbol}, resetting state`);
        setCurrentPrice(null);
        setPriceChange(null);
        setNexusPrediction(null);
        setNexusError(null);
        setPatterns([]);
        setPatternError(null);
    }, [symbol]);

    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'];
    
    const indicators = [
        // Moving Averages
        { id: 'sma20', label: 'SMA 20', color: theme.brand?.primary || '#00adef', category: 'ma' },
        { id: 'sma50', label: 'SMA 50', color: theme.success || '#10b981', category: 'ma' },
        { id: 'sma200', label: 'SMA 200', color: '#f97316', category: 'ma' },
        { id: 'ema12', label: 'EMA 12', color: theme.warning || '#f59e0b', category: 'ma' },
        { id: 'ema26', label: 'EMA 26', color: '#ec4899', category: 'ma' },
        // Overlays
        { id: 'bb', label: 'Bollinger Bands', color: theme.brand?.accent || '#8b5cf6', category: 'overlay' },
        { id: 'vwap', label: 'VWAP', color: '#06b6d4', category: 'overlay' },
        // Oscillators (shown as separate panel)
        { id: 'rsi', label: 'RSI (14)', color: '#a855f7', category: 'oscillator' },
        { id: 'macd', label: 'MACD', color: '#22c55e', category: 'oscillator' },
        { id: 'stoch', label: 'Stochastic', color: '#eab308', category: 'oscillator' },
        // Volatility
        { id: 'atr', label: 'ATR (14)', color: '#f43f5e', category: 'volatility' },
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
            priceScaleId: 'volume',
            lastValueVisible: false,
            priceLineVisible: false,
        });

        // Configure volume price scale to be at bottom with bars starting from 0
        chart.priceScale('volume').applyOptions({
            scaleMargins: {
                top: 0.92,
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
        if (!chartRef.current) return;

        // If data is empty, clear the chart and reset state
        if (data.length === 0) {
            console.log(`[AdvancedChart] Data cleared for ${symbol}, removing series`);
            if (mainSeriesRef.current) {
                try {
                    chartRef.current.removeSeries(mainSeriesRef.current);
                } catch (error) {
                    console.log('Could not remove main series:', error.message);
                }
                mainSeriesRef.current = null;
            }
            if (volumeSeriesRef.current) {
                try {
                    chartRef.current.removeSeries(volumeSeriesRef.current);
                } catch (error) {
                    console.log('Could not remove volume series:', error.message);
                }
                volumeSeriesRef.current = null;
            }
            // Clear all indicators
            Object.entries(indicatorSeriesRef.current).forEach(([key, series]) => {
                try {
                    if (key === 'bb' && series && typeof series === 'object' && series.upper) {
                        if (series.upper) chartRef.current.removeSeries(series.upper);
                        if (series.middle) chartRef.current.removeSeries(series.middle);
                        if (series.lower) chartRef.current.removeSeries(series.lower);
                    } else if (key === 'macd' && series && typeof series === 'object' && series.macdLine) {
                        if (series.macdLine) chartRef.current.removeSeries(series.macdLine);
                        if (series.signalLine) chartRef.current.removeSeries(series.signalLine);
                        if (series.histogram) chartRef.current.removeSeries(series.histogram);
                    } else if (series) {
                        chartRef.current.removeSeries(series);
                    }
                } catch (error) {
                    // Ignore removal errors
                }
            });
            indicatorSeriesRef.current = {};
            // Clear pattern series
            patternSeriesRef.current.forEach(series => {
                try {
                    if (series) chartRef.current.removeSeries(series);
                } catch (e) { /* ignore */ }
            });
            patternSeriesRef.current = [];
            setCurrentPrice(null);
            setPriceChange(null);
            return;
        }

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
                    // Handle MACD (which has macdLine, signalLine, histogram)
                    else if (key === 'macd' && series && typeof series === 'object' && series.macdLine) {
                        if (series.macdLine) chartRef.current.removeSeries(series.macdLine);
                        if (series.signalLine) chartRef.current.removeSeries(series.signalLine);
                        if (series.histogram) chartRef.current.removeSeries(series.histogram);
                    }
                    // Handle Stochastic (which has kLine, dLine)
                    else if (key === 'stoch' && series && typeof series === 'object' && series.kLine) {
                        if (series.kLine) chartRef.current.removeSeries(series.kLine);
                        if (series.dLine) chartRef.current.removeSeries(series.dLine);
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

                // SMA 200
                if (indicatorId === 'sma200') {
                    const smaData = calculateSMA(data, 200);
                    const series = chartRef.current.addLineSeries({
                        color: '#f97316',
                        lineWidth: 2,
                        title: 'SMA 200',
                    });
                    series.setData(smaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }

                // VWAP
                if (indicatorId === 'vwap') {
                    const vwapData = calculateVWAP(data);
                    const series = chartRef.current.addLineSeries({
                        color: '#06b6d4',
                        lineWidth: 2,
                        title: 'VWAP',
                        lineStyle: 0,
                    });
                    series.setData(vwapData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }

                // RSI - displayed in separate pane at bottom
                if (indicatorId === 'rsi') {
                    const rsiData = calculateRSI(data, 14);
                    const series = chartRef.current.addLineSeries({
                        color: '#a855f7',
                        lineWidth: 2,
                        title: 'RSI (14)',
                        priceScaleId: 'rsi',
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    series.setData(rsiData);

                    // Configure RSI scale (0-100)
                    chartRef.current.priceScale('rsi').applyOptions({
                        scaleMargins: { top: 0.85, bottom: 0 },
                        borderVisible: false,
                    });

                    indicatorSeriesRef.current[indicatorId] = series;
                }

                // MACD - displayed in separate pane
                if (indicatorId === 'macd') {
                    const macdData = calculateMACD(data, 12, 26, 9);

                    // MACD Line
                    const macdLine = chartRef.current.addLineSeries({
                        color: '#22c55e',
                        lineWidth: 2,
                        title: 'MACD',
                        priceScaleId: 'macd',
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    macdLine.setData(macdData.macdLine.slice(-(macdData.signalLine.length)));

                    // Signal Line
                    const signalLine = chartRef.current.addLineSeries({
                        color: '#ef4444',
                        lineWidth: 1,
                        title: 'Signal',
                        priceScaleId: 'macd',
                        lastValueVisible: false,
                        priceLineVisible: false,
                    });
                    signalLine.setData(macdData.signalLine);

                    // Histogram
                    const histogram = chartRef.current.addHistogramSeries({
                        priceScaleId: 'macd',
                        lastValueVisible: false,
                        priceLineVisible: false,
                    });
                    histogram.setData(macdData.histogram);

                    // Configure MACD scale
                    chartRef.current.priceScale('macd').applyOptions({
                        scaleMargins: { top: 0.85, bottom: 0 },
                        borderVisible: false,
                    });

                    indicatorSeriesRef.current[indicatorId] = {
                        macdLine,
                        signalLine,
                        histogram
                    };
                }

                // Stochastic Oscillator
                if (indicatorId === 'stoch') {
                    const stochData = calculateStochastic(data, 14, 3);

                    // %K Line
                    const kLine = chartRef.current.addLineSeries({
                        color: '#eab308',
                        lineWidth: 2,
                        title: '%K',
                        priceScaleId: 'stoch',
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    kLine.setData(stochData.kLine);

                    // %D Line
                    const dLine = chartRef.current.addLineSeries({
                        color: '#f97316',
                        lineWidth: 1,
                        title: '%D',
                        priceScaleId: 'stoch',
                        lastValueVisible: false,
                        priceLineVisible: false,
                    });
                    dLine.setData(stochData.dLine);

                    // Configure Stochastic scale (0-100)
                    chartRef.current.priceScale('stoch').applyOptions({
                        scaleMargins: { top: 0.85, bottom: 0 },
                        borderVisible: false,
                    });

                    indicatorSeriesRef.current[indicatorId] = { kLine, dLine };
                }

                // ATR - displayed in separate pane
                if (indicatorId === 'atr') {
                    const atrData = calculateATR(data, 14);
                    const series = chartRef.current.addLineSeries({
                        color: '#f43f5e',
                        lineWidth: 2,
                        title: 'ATR (14)',
                        priceScaleId: 'atr',
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    series.setData(atrData);

                    // Configure ATR scale
                    chartRef.current.priceScale('atr').applyOptions({
                        scaleMargins: { top: 0.85, bottom: 0 },
                        borderVisible: false,
                    });

                    indicatorSeriesRef.current[indicatorId] = series;
                }

            } catch (error) {
                console.error(`Error adding indicator ${indicatorId}:`, error);
            }
        });
    }, [activeIndicators, data, theme]);

    // Fetch NEXUS AI prediction when enabled
    const fetchNexusPrediction = useCallback(async () => {
        if (!symbol || !api) return;

        setNexusLoading(true);
        setNexusError(null);

        try {
            console.log(`[NEXUS] Fetching prediction for ${symbol}...`);
            const response = await api.get(`/predictions/active/${encodeURIComponent(symbol)}`);

            if (response.data.success && response.data.exists) {
                const pred = response.data.prediction;
                setNexusPrediction({
                    targetPrice: pred.prediction?.target_price,
                    direction: pred.prediction?.direction,
                    confidence: pred.prediction?.confidence,
                    priceChangePercent: pred.prediction?.price_change_percent,
                    currentPrice: pred.livePrice || pred.current_price,
                    daysRemaining: pred.daysRemaining,
                    createdAt: pred.createdAt
                });
                console.log(`[NEXUS] Prediction loaded: ${pred.prediction?.direction} to $${pred.prediction?.target_price}`);
            } else {
                setNexusPrediction(null);
                setNexusError('No active prediction for this symbol');
                console.log(`[NEXUS] No prediction available for ${symbol}`);
            }
        } catch (error) {
            console.error('[NEXUS] Error fetching prediction:', error);
            setNexusError(error.response?.data?.error || 'Failed to load prediction');
            setNexusPrediction(null);
        } finally {
            setNexusLoading(false);
        }
    }, [symbol, api]);

    // Effect to fetch prediction when NEXUS is enabled
    useEffect(() => {
        if (nexusEnabled && symbol) {
            fetchNexusPrediction();
        } else {
            setNexusPrediction(null);
            setNexusError(null);
        }
    }, [nexusEnabled, symbol, fetchNexusPrediction]);

    // Fetch Pattern Recognition when enabled
    const fetchPatterns = useCallback(async () => {
        if (!symbol || !api) return;

        setPatternLoading(true);
        setPatternError(null);

        try {
            console.log(`[PATTERN] Fetching patterns for ${symbol}...`);
            const response = await api.get(`/patterns/${encodeURIComponent(symbol)}?interval=${timeframe}`);

            if (response.data.success && response.data.patterns) {
                setPatterns(response.data.patterns);
                console.log(`[PATTERN] Found ${response.data.patterns.length} patterns`);
            } else {
                setPatterns([]);
                console.log(`[PATTERN] No patterns detected for ${symbol}`);
            }
        } catch (error) {
            console.error('[PATTERN] Error fetching patterns:', error);
            setPatternError(error.response?.data?.error || 'Failed to detect patterns');
            setPatterns([]);
        } finally {
            setPatternLoading(false);
        }
    }, [symbol, api, timeframe]);

    // Effect to fetch patterns when enabled
    useEffect(() => {
        if (patternEnabled && symbol) {
            fetchPatterns();
        } else {
            setPatterns([]);
            setPatternError(null);
        }
    }, [patternEnabled, symbol, fetchPatterns]);

    // Toggle Pattern indicator
    const togglePattern = () => {
        // Pattern recognition is available to all users with hasPatternRecognition feature
        const hasPatternAccess = canUseFeature('hasPatternRecognition') || hasPlanAccess('premium');
        if (!hasPatternAccess) {
            setShowUpgradePrompt(true);
            return;
        }
        setPatternEnabled(prev => !prev);
    };

    // Effect to draw/remove prediction line on chart
    useEffect(() => {
        if (!chartRef.current || !mainSeriesRef.current) return;

        // Remove existing prediction series
        if (predictionLineRef.current) {
            try {
                if (predictionLineRef.current.projectionLine) {
                    chartRef.current.removeSeries(predictionLineRef.current.projectionLine);
                }
                if (predictionLineRef.current.targetLine) {
                    chartRef.current.removeSeries(predictionLineRef.current.targetLine);
                }
            } catch (error) {
                console.log('Could not remove prediction lines:', error.message);
            }
            predictionLineRef.current = null;
        }

        // Draw new prediction visualization if we have prediction data
        if (nexusEnabled && nexusPrediction && nexusPrediction.targetPrice && data.length > 0) {
            try {
                const isUp = nexusPrediction.direction === 'UP';
                const lineColor = isUp ? '#3b82f6' : '#f97316'; // Blue for UP, Orange for DOWN

                // Get the last candle (current price point)
                const lastCandle = data[data.length - 1];
                const currentPrice = lastCandle.close;
                const currentTime = lastCandle.time;

                // Calculate future time based on daysRemaining or default to 7 days
                const daysRemaining = nexusPrediction.daysRemaining || 7;

                // Calculate time increment based on timeframe
                // For daily data, add days; for intraday, we need to calculate properly
                const secondsPerDay = 86400;
                const futureTime = currentTime + (daysRemaining * secondsPerDay);

                // Create intermediate points for a smooth projection line
                const projectionPoints = [];
                const numPoints = Math.max(daysRemaining, 5); // At least 5 points for smooth line

                for (let i = 0; i <= numPoints; i++) {
                    const progress = i / numPoints;
                    const time = currentTime + (progress * daysRemaining * secondsPerDay);
                    // Linear interpolation from current price to target price
                    const value = currentPrice + (progress * (nexusPrediction.targetPrice - currentPrice));
                    projectionPoints.push({ time: Math.floor(time), value });
                }

                // Create the projection line (from current to target in future)
                const projectionLine = chartRef.current.addLineSeries({
                    color: lineColor,
                    lineWidth: 3,
                    lineStyle: 2, // Dashed line
                    title: `NEXUS ${isUp ? '↑' : '↓'} Projection`,
                    lastValueVisible: true,
                    priceLineVisible: false,
                    crosshairMarkerVisible: true,
                });
                projectionLine.setData(projectionPoints);

                // Create a horizontal target line at the target price (extending into future)
                const targetLine = chartRef.current.addLineSeries({
                    color: lineColor,
                    lineWidth: 1,
                    lineStyle: 1, // Dotted line
                    title: '',
                    lastValueVisible: false,
                    priceLineVisible: false,
                    crosshairMarkerVisible: false,
                });

                // Horizontal line from projection end extending further
                targetLine.setData([
                    { time: Math.floor(futureTime), value: nexusPrediction.targetPrice },
                    { time: Math.floor(futureTime + (3 * secondsPerDay)), value: nexusPrediction.targetPrice }
                ]);

                // Add a price line marker at the target
                projectionLine.createPriceLine({
                    price: nexusPrediction.targetPrice,
                    color: lineColor,
                    lineWidth: 1,
                    lineStyle: 1,
                    axisLabelVisible: true,
                    title: `Target: ${isUp ? '↑' : '↓'}`,
                });

                predictionLineRef.current = { projectionLine, targetLine };
                console.log(`[NEXUS] Drew projection: $${currentPrice.toFixed(2)} → $${nexusPrediction.targetPrice.toFixed(2)} over ${daysRemaining} days`);
            } catch (error) {
                console.error('[NEXUS] Error drawing prediction:', error);
            }
        }
    }, [nexusEnabled, nexusPrediction, data]);

    // Effect to draw pattern visualizations on the chart
    useEffect(() => {
        if (!chartRef.current || !mainSeriesRef.current) return;

        // Remove existing pattern series
        patternSeriesRef.current.forEach(series => {
            try {
                if (series) {
                    chartRef.current.removeSeries(series);
                }
            } catch (error) {
                // Ignore removal errors
            }
        });
        patternSeriesRef.current = [];

        // Clear existing markers from main series
        if (mainSeriesRef.current) {
            try {
                mainSeriesRef.current.setMarkers([]);
            } catch (e) {
                // Ignore marker clearing errors
            }
        }

        // If patterns are disabled or no patterns, exit
        if (!patternEnabled || patterns.length === 0 || data.length === 0) {
            return;
        }

        console.log(`[PATTERN] Drawing ${patterns.length} patterns on chart...`);

        // Get time range from data
        const startTime = data[0].time;
        const endTime = data[data.length - 1].time;

        // Collect all markers for the main series
        const allMarkers = [];

        // Helper to add arrow marker at a specific index
        const addMarker = (index, position, color, text) => {
            if (index >= 0 && index < data.length) {
                allMarkers.push({
                    time: data[index].time,
                    position: position, // 'aboveBar' or 'belowBar'
                    color: color,
                    shape: position === 'aboveBar' ? 'arrowDown' : 'arrowUp',
                    text: text,
                    size: 1
                });
            }
        };

        // Helper to draw a simple horizontal price line
        const drawHorizontalLine = (price, color, title, lineStyle = 2) => {
            if (!price || !Number.isFinite(price)) return null;
            const lineSeries = chartRef.current.addLineSeries({
                color: color,
                lineWidth: 1,
                lineStyle: lineStyle,
                priceLineVisible: false,
                lastValueVisible: false,
                crosshairMarkerVisible: false,
            });
            lineSeries.setData([
                { time: startTime, value: price },
                { time: endTime, value: price }
            ]);
            lineSeries.createPriceLine({
                price: price,
                color: color,
                lineWidth: 1,
                lineStyle: lineStyle,
                axisLabelVisible: true,
                title: title,
            });
            patternSeriesRef.current.push(lineSeries);
            return lineSeries;
        };

        patterns.forEach((pattern) => {
            try {
                const isBullish = pattern.type === 'bullish';
                const patternColor = isBullish ? '#22c55e' : pattern.type === 'bearish' ? '#ef4444' : '#8b5cf6';

                // Draw support/resistance lines (simple horizontal lines)
                if (pattern.points?.support) {
                    drawHorizontalLine(pattern.points.support, '#22c55e', 'Support');
                }
                if (pattern.points?.resistance) {
                    drawHorizontalLine(pattern.points.resistance, '#ef4444', 'Resistance');
                }
                if (pattern.points?.neckline) {
                    drawHorizontalLine(pattern.points.neckline, patternColor, 'Neckline');
                }

                // Add arrow markers at key pattern points
                if (pattern.pattern === 'DOUBLE_TOP' || pattern.pattern === 'DOUBLE_BOTTOM') {
                    const isTop = pattern.pattern === 'DOUBLE_TOP';
                    if (pattern.points?.first?.index !== undefined) {
                        addMarker(pattern.points.first.index, isTop ? 'aboveBar' : 'belowBar', patternColor, '1');
                    }
                    if (pattern.points?.second?.index !== undefined) {
                        addMarker(pattern.points.second.index, isTop ? 'aboveBar' : 'belowBar', patternColor, '2');
                    }
                }

                else if (pattern.pattern === 'HEAD_SHOULDERS' || pattern.pattern === 'HEAD_SHOULDERS_INVERSE') {
                    const isInverse = pattern.pattern === 'HEAD_SHOULDERS_INVERSE';
                    const pos = isInverse ? 'belowBar' : 'aboveBar';
                    if (pattern.points?.leftShoulder?.index !== undefined) {
                        addMarker(pattern.points.leftShoulder.index, pos, patternColor, 'LS');
                    }
                    if (pattern.points?.head?.index !== undefined) {
                        addMarker(pattern.points.head.index, pos, patternColor, 'H');
                    }
                    if (pattern.points?.rightShoulder?.index !== undefined) {
                        addMarker(pattern.points.rightShoulder.index, pos, patternColor, 'RS');
                    }
                }

                else if (pattern.pattern === 'ASCENDING_TRIANGLE' || pattern.pattern === 'DESCENDING_TRIANGLE') {
                    // For triangles, mark the apex area with a single arrow
                    const recentIdx = data.length - 1;
                    addMarker(recentIdx, isBullish ? 'belowBar' : 'aboveBar', patternColor, '▲');
                }

                else if (pattern.pattern === 'BULL_FLAG' || pattern.pattern === 'BEAR_FLAG') {
                    // Mark the flag pole top/bottom
                    if (pattern.points?.poleStart?.index !== undefined) {
                        addMarker(pattern.points.poleStart.index, isBullish ? 'belowBar' : 'aboveBar', patternColor, 'P');
                    }
                    // Mark current consolidation
                    const recentIdx = data.length - 1;
                    addMarker(recentIdx, isBullish ? 'belowBar' : 'aboveBar', patternColor, 'F');
                }

                else if (pattern.pattern === 'UPTREND' || pattern.pattern === 'DOWNTREND') {
                    // Mark trend direction with arrow at recent candle
                    const recentIdx = data.length - 1;
                    addMarker(recentIdx, isBullish ? 'belowBar' : 'aboveBar', patternColor, isBullish ? '↑' : '↓');
                }

                // Draw target price line
                if (pattern.target && Number.isFinite(pattern.target)) {
                    drawHorizontalLine(pattern.target, patternColor, `Target ${isBullish ? '↑' : '↓'}`, 1);
                }

                console.log(`[PATTERN] Drew ${pattern.pattern} (${pattern.name})`);

            } catch (error) {
                console.error(`[PATTERN] Error drawing ${pattern.pattern}:`, error);
            }
        });

        // Apply all markers to the main series (sorted by time)
        if (allMarkers.length > 0 && mainSeriesRef.current) {
            allMarkers.sort((a, b) => a.time - b.time);
            mainSeriesRef.current.setMarkers(allMarkers);
            console.log(`[PATTERN] Added ${allMarkers.length} arrow markers to chart`);
        }

    }, [patternEnabled, patterns, data]);

    // Toggle NEXUS indicator (Premium/Elite only)
    const toggleNexus = () => {
        if (!hasNexusAccess) {
            setShowUpgradePrompt(true);
            return;
        }
        setNexusEnabled(prev => !prev);
    };

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

    // Handle clicking on a pattern to zoom/scroll chart to that location
    const handlePatternClick = useCallback((pattern) => {
        if (!chartRef.current || !data || data.length === 0) return;

        console.log('[AdvancedChart] Pattern clicked:', pattern);

        // Extract all indices from the pattern's points
        const indices = [];
        const extractIndices = (obj) => {
            if (!obj) return;
            if (typeof obj === 'object') {
                if (obj.index !== undefined) {
                    indices.push(obj.index);
                }
                Object.values(obj).forEach(v => extractIndices(v));
            }
        };
        extractIndices(pattern.points);

        if (indices.length === 0) {
            console.log('[AdvancedChart] No indices found in pattern, centering on recent data');
            // For patterns without indices, center on recent data
            chartRef.current.timeScale().fitContent();
            return;
        }

        // Find the min and max indices
        const minIdx = Math.max(0, Math.min(...indices) - 5); // Add some padding
        const maxIdx = Math.min(data.length - 1, Math.max(...indices) + 5);

        console.log(`[AdvancedChart] Scrolling to indices ${minIdx}-${maxIdx}`);

        // Get the timestamps for these indices
        const fromTime = data[minIdx]?.time;
        const toTime = data[maxIdx]?.time;

        if (fromTime && toTime) {
            // Set visible range to show the pattern
            chartRef.current.timeScale().setVisibleRange({
                from: fromTime,
                to: toTime
            });
        }
    }, [data]);

    return (
        <>
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

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* NEXUS AI Button - Featured first (Premium/Elite only) */}
                <NexusButton
                    $active={nexusEnabled}
                    $loading={nexusLoading}
                    $locked={!hasNexusAccess}
                    onClick={toggleNexus}
                    title={hasNexusAccess ? "NEXUS AI Prediction - Shows predicted target price" : "NEXUS AI - Premium/Elite feature"}
                    disabled={nexusLoading}
                >
                    {!hasNexusAccess ? (
                        <Lock size={14} />
                    ) : nexusLoading ? (
                        <RefreshCw size={14} />
                    ) : (
                        <Sparkles size={14} />
                    )}
                    NEXUS AI
                    {!hasNexusAccess && (
                        <span style={{
                            marginLeft: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            background: 'linear-gradient(135deg, #a855f733, #f59e0b33)',
                            color: '#f59e0b',
                            fontWeight: 600
                        }}>
                            PREMIUM
                        </span>
                    )}
                    {hasNexusAccess && nexusPrediction && (
                        <span style={{
                            marginLeft: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            background: nexusPrediction.direction === 'UP' ? '#3b82f633' : '#f9731633',
                            color: nexusPrediction.direction === 'UP' ? '#3b82f6' : '#f97316'
                        }}>
                            {nexusPrediction.direction === 'UP' ? '↑' : '↓'}
                        </span>
                    )}
                </NexusButton>

                {/* NEXUS Pattern Button */}
                <PatternButton
                    $active={patternEnabled}
                    $loading={patternLoading}
                    $locked={false}
                    onClick={togglePattern}
                    title="NEXUS Pattern - AI Chart Pattern Recognition"
                    disabled={patternLoading}
                >
                    {patternLoading ? (
                        <RefreshCw size={14} />
                    ) : (
                        <Brain size={14} />
                    )}
                    NEXUS Pattern
                    {patterns.length > 0 && (
                        <span style={{
                            marginLeft: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            background: '#10b98133',
                            color: '#10b981'
                        }}>
                            {patterns.length}
                        </span>
                    )}
                </PatternButton>

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

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

                {/* NEXUS AI Prediction Badge */}
                {nexusEnabled && nexusPrediction && (
                    <PredictionBadge $direction={nexusPrediction.direction}>
                        <div className="prediction-header">
                            <Sparkles size={12} />
                            NEXUS AI Prediction
                        </div>
                        <div className="prediction-direction">
                            {nexusPrediction.direction === 'UP' ? <TrendingUp size={20} /> : <TrendingUp size={20} style={{ transform: 'rotate(180deg)' }} />}
                            {nexusPrediction.direction}
                        </div>
                        <div className="prediction-target">
                            <Target size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Target: {formatChartPrice(nexusPrediction.targetPrice, symbol)}
                        </div>
                        <div className="prediction-confidence">
                            Confidence: {nexusPrediction.confidence?.toFixed(1)}%
                        </div>
                        <div className="prediction-change">
                            Expected: {nexusPrediction.priceChangePercent >= 0 ? '+' : ''}{nexusPrediction.priceChangePercent?.toFixed(2)}%
                            {nexusPrediction.daysRemaining && ` in ${nexusPrediction.daysRemaining}d`}
                        </div>
                    </PredictionBadge>
                )}

                {/* NEXUS Error State */}
                {nexusEnabled && nexusError && !nexusPrediction && !nexusLoading && (
                    <PredictionBadge $direction="NONE" style={{
                        background: 'rgba(100, 116, 139, 0.9)',
                        border: '1px solid #64748b'
                    }}>
                        <div className="prediction-header">
                            <Sparkles size={12} />
                            NEXUS AI
                        </div>
                        <div style={{ color: 'white', fontSize: '0.85rem' }}>
                            {nexusError}
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.8 }}>
                            Make a prediction first to see the AI target
                        </div>
                    </PredictionBadge>
                )}

                {/* NEXUS Pattern Badge */}
                {patternEnabled && (
                    <PatternBadge>
                        <div className="pattern-header">
                            <Brain size={12} />
                            NEXUS Pattern Recognition
                        </div>
                        {patternLoading ? (
                            <div className="no-patterns">
                                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ marginLeft: '8px' }}>Scanning...</span>
                            </div>
                        ) : patterns.length > 0 ? (
                            <>
                                <div className="pattern-count">
                                    {patterns.length} Pattern{patterns.length > 1 ? 's' : ''} Detected
                                </div>
                                {patterns.map((pattern, idx) => (
                                    <div
                                        key={idx}
                                        className="pattern-item"
                                        onClick={() => handlePatternClick(pattern)}
                                        title="Click to zoom chart to this pattern"
                                    >
                                        <div className="pattern-name">
                                            {pattern.type === 'bullish' ? (
                                                <TrendingUp size={14} style={{ color: '#22c55e' }} />
                                            ) : (
                                                <TrendingUp size={14} style={{ color: '#ef4444', transform: 'rotate(180deg)' }} />
                                            )}
                                            {pattern.name}
                                            <span className="pattern-type" style={{
                                                background: pattern.type === 'bullish' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                                color: pattern.type === 'bullish' ? '#22c55e' : '#ef4444'
                                            }}>
                                                {pattern.type}
                                            </span>
                                        </div>
                                        <div className="pattern-confidence">
                                            Confidence: {pattern.confidence?.toFixed(0)}%
                                        </div>
                                        {pattern.target && (
                                            <div className="pattern-target">
                                                Target: {formatChartPrice(pattern.target, symbol)}
                                                {pattern.potentialMove && (
                                                    <span style={{ marginLeft: '8px', color: pattern.type === 'bullish' ? '#22c55e' : '#ef4444' }}>
                                                        ({pattern.potentialMove >= 0 ? '+' : ''}{pattern.potentialMove}%)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div style={{
                                            fontSize: '0.65rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            marginTop: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Eye size={10} />
                                            Click to view on chart
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="no-patterns">
                                No patterns detected for current timeframe
                            </div>
                        )}
                    </PatternBadge>
                )}

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

        {/* Upgrade Prompt for NEXUS AI */}
        <UpgradePrompt
            isOpen={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(false)}
            feature="hasNexusAI"
            requiredPlan="premium"
        />
        </>
    );
};

export default AdvancedChart;