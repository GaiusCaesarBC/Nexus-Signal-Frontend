// src/pages/ChartPage.js
// Dedicated full-screen chart view for stocks and crypto

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line,
  ComposedChart, Bar, Cell
} from 'recharts';
import {
  ArrowLeft, TrendingUp, TrendingDown, Activity,
  DollarSign, BarChart3, Clock, Loader2, Zap,
  Maximize2, ArrowUpRight, ArrowDownRight, Calendar,
  ChevronLeft, ChevronRight, Eye, Settings, ChevronDown
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
  color: #ffffff;
  padding: 24px;
  padding-top: 100px;

  @media (max-width: 768px) {
    padding: 16px;
    padding-top: 90px;
  }
`;

const MaxWidthContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
  animation: ${fadeIn} 0.5s ease;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #a0a0a0;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transform: translateX(-4px);
  }
`;

const SymbolInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const SymbolIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.$gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 20px ${props => props.$shadowColor || 'rgba(102, 126, 234, 0.3)'};
`;

const SymbolDetails = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;

    &.crypto {
      background: rgba(247, 147, 26, 0.15);
      color: #f7931a;
    }

    &.stock {
      background: rgba(0, 173, 239, 0.15);
      color: #00adef;
    }
  }
`;

const PriceDisplay = styled.div`
  text-align: right;

  @media (max-width: 600px) {
    text-align: left;
    width: 100%;
  }
`;

const CurrentPrice = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 4px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const PriceChange = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  font-size: 16px;
  color: ${props => props.$positive ? '#00ff88' : '#ff4757'};

  @media (max-width: 600px) {
    justify-content: flex-start;
  }
`;

// Chart Components
const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease 0.1s backwards;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
  gap: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
`;

const TimeframeButtons = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 10px;
  flex-wrap: wrap;
`;

const TimeframeBtn = styled.button`
  background: ${props => props.$active ? 'rgba(0, 173, 239, 0.3)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#00adef' : '#a0a0a0'};
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChartContainer = styled.div`
  padding: 20px 24px 24px;
  height: ${props => props.$fullScreen ? 'calc(100vh - 350px)' : '500px'};
  min-height: 400px;
`;

const ChartLoading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #a0a0a0;

  svg {
    animation: ${spin} 1s linear infinite;
    margin-bottom: 12px;
  }
`;

const ChartError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ff4757;
  text-align: center;
  padding: 20px;

  .error-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .retry-btn {
    margin-top: 16px;
    padding: 10px 24px;
    background: rgba(255, 71, 87, 0.2);
    border: 1px solid rgba(255, 71, 87, 0.5);
    border-radius: 8px;
    color: #ff4757;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 71, 87, 0.3);
    }
  }
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 24px;
  animation: ${fadeIn} 0.5s ease 0.2s backwards;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;

  .label {
    color: #a0a0a0;
    font-size: 12px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .value {
    font-size: 18px;
    font-weight: 600;
  }

  .sub {
    font-size: 12px;
    color: #a0a0a0;
    margin-top: 4px;
  }
`;

// Trade Reference Line Components
const ReferenceMarker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid ${props => props.$isBuy ? '#00ff88' : '#ff4757'};
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.$isBuy ? '#00ff88' : '#ff4757'};
`;

const NavigationLinks = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  animation: ${fadeIn} 0.5s ease 0.3s backwards;
`;

// Indicator Controls
const IndicatorControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const IndicatorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.$active ? 'rgba(0, 173, 239, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? 'rgba(0, 173, 239, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#00adef' : '#a0a0a0'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 173, 239, 0.15);
    border-color: rgba(0, 173, 239, 0.3);
    color: #00adef;
  }
`;

const IndicatorPanel = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 24px;
  height: ${props => props.$height || '150px'};
`;

const IndicatorTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #a0a0a0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SignalBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: ${props => {
    if (props.$signal === 'bullish' || props.$signal === 'oversold' || props.$signal === 'bullish_crossover') return 'rgba(0, 255, 136, 0.15)';
    if (props.$signal === 'bearish' || props.$signal === 'overbought' || props.$signal === 'bearish_crossover') return 'rgba(255, 71, 87, 0.15)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  color: ${props => {
    if (props.$signal === 'bullish' || props.$signal === 'oversold' || props.$signal === 'bullish_crossover') return '#00ff88';
    if (props.$signal === 'bearish' || props.$signal === 'overbought' || props.$signal === 'bearish_crossover') return '#ff4757';
    return '#a0a0a0';
  }};
`;

const IndicatorValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$color || '#ffffff'};
  margin-left: 8px;
`;

const NavLink = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 173, 239, 0.1);
    border-color: rgba(0, 173, 239, 0.3);
  }
`;

// ============ HELPER FUNCTIONS ============
const formatLargeNumber = (num) => {
  if (!num || isNaN(num)) return 'N/A';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

// Determine if symbol is crypto or stock
const isCryptoSymbol = (symbol) => {
  const cryptoSymbols = ['BTC', 'ETH', 'XRP', 'LTC', 'ADA', 'SOL', 'DOGE', 'DOT', 'BNB', 'LINK',
    'UNI', 'MATIC', 'SHIB', 'TRX', 'AVAX', 'ATOM', 'XMR', 'ALGO', 'VET', 'FIL', 'ICP', 'AAVE',
    'GRT', 'XLM', 'EOS', 'THETA', 'XTZ', 'NEAR', 'FTM', 'SAND', 'MANA', 'AXS', 'CRO', 'PEPE', 'APE'];
  return cryptoSymbols.includes(symbol?.toUpperCase());
};

// Crypto gradient mapping
const cryptoGradients = {
  'BTC': { gradient: 'linear-gradient(135deg, #f7931a 0%, #ffcd00 100%)', shadow: 'rgba(247, 147, 26, 0.3)' },
  'ETH': { gradient: 'linear-gradient(135deg, #627eea 0%, #a0b3f8 100%)', shadow: 'rgba(98, 126, 234, 0.3)' },
  'SOL': { gradient: 'linear-gradient(135deg, #9945ff 0%, #14f195 100%)', shadow: 'rgba(153, 69, 255, 0.3)' },
  'DOGE': { gradient: 'linear-gradient(135deg, #c3a634 0%, #e8d54a 100%)', shadow: 'rgba(195, 166, 52, 0.3)' },
  'XRP': { gradient: 'linear-gradient(135deg, #23292f 0%, #4a5568 100%)', shadow: 'rgba(35, 41, 47, 0.3)' },
};

const getSymbolStyle = (symbol) => {
  const upperSymbol = symbol?.toUpperCase();
  if (cryptoGradients[upperSymbol]) {
    return cryptoGradients[upperSymbol];
  }
  if (isCryptoSymbol(symbol)) {
    return { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102, 126, 234, 0.3)' };
  }
  return { gradient: 'linear-gradient(135deg, #00adef 0%, #0077b5 100%)', shadow: 'rgba(0, 173, 239, 0.3)' };
};

// Format chart X-axis based on timeframe
const formatChartDate = (timestamp, range) => {
  if (!timestamp) return '';

  let date;
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  if (isNaN(date.getTime())) return '';

  switch (range) {
    case '1D':
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    case '5D':
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
    case '1M':
    case '3M':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '6M':
    case '1Y':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '5Y':
    case 'MAX':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// ============ CUSTOM TOOLTIP ============
const CustomTooltip = ({ active, payload, label, isCrypto }) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const price = payload[0].value;
    const formattedPrice = isCrypto ? formatCryptoPrice(price) : formatStockPrice(price);

    return (
      <div style={{
        background: 'rgba(20, 20, 30, 0.95)',
        border: '1px solid rgba(0, 173, 239, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ margin: '0 0 4px', color: '#a0a0a0', fontSize: '12px' }}>{formattedDate}</p>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px', color: '#00adef' }}>
          {formattedPrice}
        </p>
        {payload[0].payload.volume && (
          <p style={{ margin: '4px 0 0', color: '#a0a0a0', fontSize: '11px' }}>
            Vol: {formatLargeNumber(payload[0].payload.volume)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// ============ MAIN COMPONENT ============
const ChartPage = () => {
  const { symbol } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();
  const fetchController = useRef(null);

  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState('1M');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [tradeDate, setTradeDate] = useState(null); // From URL params if whale alert

  // Technical Indicators State
  const [indicators, setIndicators] = useState({
    rsi: false,
    macd: false,
    bollinger: false,
    sma: false
  });
  const [indicatorData, setIndicatorData] = useState(null);
  const [indicatorLoading, setIndicatorLoading] = useState(false);
  const [indicatorSignals, setIndicatorSignals] = useState(null);

  const isCrypto = isCryptoSymbol(symbol);
  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];
  const symbolStyle = getSymbolStyle(symbol);

  // Check if any indicator is active
  const hasActiveIndicator = Object.values(indicators).some(v => v);

  // Get URL search params for trade date marker
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('tradeDate');
    if (date) {
      setTradeDate(new Date(date));
    }
  }, []);

  // Format price based on asset type
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '$0.00';
    return isCrypto ? formatCryptoPrice(price) : formatStockPrice(price);
  };

  // Calculated values from chart data
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const firstPrice = chartData.length > 1 ? chartData[0].close : currentPrice;
  const priceChange = currentPrice - firstPrice;
  const changePercent = firstPrice ? ((priceChange / firstPrice) * 100) : 0;
  const isPositive = priceChange >= 0;

  const periodHigh = chartData.length > 0 ? Math.max(...chartData.map(d => d.high || d.close)) : 0;
  const periodLow = chartData.length > 0 ? Math.min(...chartData.map(d => d.low || d.close)) : 0;
  const avgVolume = chartData.length > 0
    ? chartData.reduce((acc, d) => acc + (d.volume || 0), 0) / chartData.length
    : 0;

  // Fetch chart data
  useEffect(() => {
    if (!symbol) return;

    const fetchChartData = async () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
      fetchController.current = new AbortController();
      const { signal } = fetchController.current;

      setChartLoading(true);
      setChartError(null);

      try {
        // Determine endpoint based on asset type
        const endpoint = isCrypto
          ? `/crypto/historical/${symbol}`
          : `/stocks/historical/${symbol}`;

        const response = await api.get(endpoint, {
          params: { range: selectedRange },
          signal: signal,
        });

        const fetchedData = response.data.historicalData || response.data.data || [];

        // Transform data for Recharts
        const transformedData = fetchedData.map((item) => ({
          time: item.time || item.date || item.timestamp,
          close: item.close,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume
        })).filter(item => item.close && !isNaN(item.close));

        setChartData(transformedData);

        if (transformedData.length === 0) {
          setChartError(`No data found for ${symbol.toUpperCase()} (${selectedRange})`);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error fetching chart data:', err);

        if (err.response?.status === 429) {
          setChartError('Rate limit exceeded. Please wait a moment and try again.');
        } else if (err.response?.status === 404) {
          setChartError(`Symbol "${symbol.toUpperCase()}" not found.`);
        } else if (err.response?.data?.msg || err.response?.data?.error) {
          setChartError(err.response.data.msg || err.response.data.error);
        } else {
          setChartError('Failed to fetch chart data. Please try again.');
        }
      } finally {
        setChartLoading(false);
        fetchController.current = null;
      }
    };

    fetchChartData();

    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, [symbol, selectedRange, api, isCrypto]);

  // Fetch indicator data when indicators are toggled
  useEffect(() => {
    if (!symbol || !hasActiveIndicator) {
      setIndicatorData(null);
      setIndicatorSignals(null);
      return;
    }

    const fetchIndicators = async () => {
      setIndicatorLoading(true);
      try {
        const response = await api.get(`/indicators/${symbol}/all`, {
          params: { range: selectedRange }
        });

        if (response.data) {
          setIndicatorData(response.data.data);
          setIndicatorSignals(response.data.signals);
        }
      } catch (err) {
        console.error('Failed to fetch indicators:', err);
        // Don't show error to user, just don't display indicators
      } finally {
        setIndicatorLoading(false);
      }
    };

    fetchIndicators();
  }, [symbol, selectedRange, hasActiveIndicator, api]);

  // Toggle indicator
  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  // Merge chart data with indicator data
  const mergedChartData = React.useMemo(() => {
    if (!chartData.length) return [];
    if (!indicatorData || !hasActiveIndicator) return chartData;

    return chartData.map((candle, index) => {
      // Find matching indicator data by timestamp
      const indicatorPoint = indicatorData.find(ind => {
        const candleTime = new Date(candle.time).getTime();
        const indTime = ind.time;
        // Allow 1 day tolerance for matching
        return Math.abs(candleTime - indTime) < 86400000;
      });

      return {
        ...candle,
        ...(indicatorPoint && indicators.bollinger ? {
          bollingerUpper: indicatorPoint.bollingerUpper,
          bollingerMiddle: indicatorPoint.bollingerMiddle,
          bollingerLower: indicatorPoint.bollingerLower
        } : {}),
        ...(indicatorPoint && indicators.sma ? {
          sma20: indicatorPoint.sma20,
          sma50: indicatorPoint.sma50
        } : {}),
        ...(indicatorPoint && indicators.rsi ? {
          rsi: indicatorPoint.rsi
        } : {}),
        ...(indicatorPoint && indicators.macd ? {
          macdLine: indicatorPoint.macdLine,
          macdSignal: indicatorPoint.macdSignal,
          macdHistogram: indicatorPoint.macdHistogram
        } : {})
      };
    });
  }, [chartData, indicatorData, indicators, hasActiveIndicator]);

  // Handle retry
  const handleRetry = () => {
    setChartError(null);
    setChartData([]);
    // Trigger re-fetch by changing range briefly
    const currentRange = selectedRange;
    setSelectedRange('1D');
    setTimeout(() => setSelectedRange(currentRange), 100);
  };

  // Navigate to detail page
  const handleViewDetails = () => {
    if (isCrypto) {
      navigate(`/crypto/${symbol}`);
    } else {
      navigate(`/stock/${symbol}`);
    }
  };

  if (!symbol) {
    return (
      <PageContainer>
        <MaxWidthContainer>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Back
          </BackButton>
          <ChartLoading style={{ minHeight: '400px' }}>
            <p style={{ color: '#ff4757' }}>No symbol provided in URL.</p>
          </ChartLoading>
        </MaxWidthContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <MaxWidthContainer>
        {/* Header */}
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Back
          </BackButton>

          <SymbolInfo>
            <SymbolIcon $gradient={symbolStyle.gradient} $shadowColor={symbolStyle.shadow}>
              {symbol?.slice(0, 2).toUpperCase()}
            </SymbolIcon>
            <SymbolDetails>
              <h1>
                {symbol?.toUpperCase()}
                <span className={`type-badge ${isCrypto ? 'crypto' : 'stock'}`}>
                  {isCrypto ? 'CRYPTO' : 'STOCK'}
                </span>
              </h1>
            </SymbolDetails>
          </SymbolInfo>

          <PriceDisplay>
            <CurrentPrice>{formatPrice(currentPrice)}</CurrentPrice>
            <PriceChange $positive={isPositive}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {formatPrice(Math.abs(priceChange))} ({formatPercent(changePercent)})
            </PriceChange>
          </PriceDisplay>
        </Header>

        {/* Chart */}
        <ChartCard>
          <ChartHeader>
            <ChartTitle>
              <Activity size={18} />
              Price Chart - {selectedRange}
              {indicatorLoading && <Loader2 size={14} style={{ marginLeft: 8, animation: 'spin 1s linear infinite' }} />}
            </ChartTitle>
            <IndicatorControls>
              <IndicatorButton
                $active={indicators.bollinger}
                onClick={() => toggleIndicator('bollinger')}
                title="Bollinger Bands (20, 2)"
              >
                <BarChart3 size={14} />
                BB
              </IndicatorButton>
              <IndicatorButton
                $active={indicators.sma}
                onClick={() => toggleIndicator('sma')}
                title="Simple Moving Averages (20, 50)"
              >
                <TrendingUp size={14} />
                SMA
              </IndicatorButton>
              <IndicatorButton
                $active={indicators.rsi}
                onClick={() => toggleIndicator('rsi')}
                title="Relative Strength Index (14)"
              >
                <Activity size={14} />
                RSI
              </IndicatorButton>
              <IndicatorButton
                $active={indicators.macd}
                onClick={() => toggleIndicator('macd')}
                title="MACD (12, 26, 9)"
              >
                <Zap size={14} />
                MACD
              </IndicatorButton>
            </IndicatorControls>
            <TimeframeButtons>
              {timeframes.map(tf => (
                <TimeframeBtn
                  key={tf}
                  $active={selectedRange === tf}
                  onClick={() => setSelectedRange(tf)}
                  disabled={chartLoading}
                >
                  {tf}
                </TimeframeBtn>
              ))}
            </TimeframeButtons>
          </ChartHeader>

          <ChartContainer $fullScreen>
            {chartLoading && (
              <ChartLoading>
                <Loader2 size={40} />
                <span>Loading {symbol.toUpperCase()} chart data...</span>
              </ChartLoading>
            )}

            {chartError && !chartLoading && (
              <ChartError>
                <div className="error-icon">⚠️</div>
                <p>{chartError}</p>
                <button className="retry-btn" onClick={handleRetry}>
                  Try Again
                </button>
              </ChartError>
            )}

            {!chartLoading && !chartError && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mergedChartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? '#00ff88' : '#ff4757'} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={isPositive ? '#00ff88' : '#ff4757'} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9945ff" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#9945ff" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={(val) => formatChartDate(val, selectedRange)}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 11 }}
                    tickFormatter={(val) => formatPrice(val).replace('$', '')}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip isCrypto={isCrypto} />} />

                  {/* Trade date reference line if provided */}
                  {tradeDate && (
                    <ReferenceLine
                      x={tradeDate.toISOString()}
                      stroke="#00adef"
                      strokeDasharray="5 5"
                      label={{
                        value: 'Trade',
                        fill: '#00adef',
                        fontSize: 12
                      }}
                    />
                  )}

                  {/* Bollinger Bands */}
                  {indicators.bollinger && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="bollingerUpper"
                        stroke="#9945ff"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        fill="none"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="bollingerMiddle"
                        stroke="#9945ff"
                        strokeWidth={1}
                        fill="none"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="bollingerLower"
                        stroke="#9945ff"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        fill="url(#bollingerGradient)"
                        dot={false}
                      />
                    </>
                  )}

                  {/* SMA Lines */}
                  {indicators.sma && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="sma20"
                        stroke="#f7931a"
                        strokeWidth={1.5}
                        fill="none"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="sma50"
                        stroke="#00adef"
                        strokeWidth={1.5}
                        fill="none"
                        dot={false}
                      />
                    </>
                  )}

                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={isPositive ? '#00ff88' : '#ff4757'}
                    strokeWidth={2}
                    fill="url(#chartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {!chartLoading && !chartError && chartData.length === 0 && (
              <ChartLoading>
                <span>No chart data available for {symbol.toUpperCase()}</span>
              </ChartLoading>
            )}
          </ChartContainer>

          {/* RSI Panel */}
          {indicators.rsi && mergedChartData.length > 0 && (
            <IndicatorPanel $height="120px">
              <IndicatorTitle>
                <span>
                  RSI (14)
                  {indicatorSignals?.rsi && (
                    <>
                      <IndicatorValue $color={
                        indicatorSignals.rsi.signal === 'oversold' ? '#00ff88' :
                        indicatorSignals.rsi.signal === 'overbought' ? '#ff4757' : '#a0a0a0'
                      }>
                        {mergedChartData[mergedChartData.length - 1]?.rsi?.toFixed(1) || '--'}
                      </IndicatorValue>
                    </>
                  )}
                </span>
                {indicatorSignals?.rsi && (
                  <SignalBadge $signal={indicatorSignals.rsi.signal}>
                    {indicatorSignals.rsi.signal.replace('_', ' ').toUpperCase()}
                  </SignalBadge>
                )}
              </IndicatorTitle>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={mergedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} ticks={[30, 50, 70]} tick={{ fill: '#666', fontSize: 10 }} width={40} />
                  <ReferenceLine y={70} stroke="#ff4757" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine y={30} stroke="#00ff88" strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        return (
                          <div style={{ background: 'rgba(20,20,30,0.95)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ color: '#fff', fontSize: 12 }}>RSI: {payload[0].value?.toFixed(1)}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rsi"
                    stroke="#f7931a"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </IndicatorPanel>
          )}

          {/* MACD Panel */}
          {indicators.macd && mergedChartData.length > 0 && (
            <IndicatorPanel $height="140px">
              <IndicatorTitle>
                <span>
                  MACD (12, 26, 9)
                  {indicatorSignals?.macd && (
                    <IndicatorValue $color={
                      indicatorSignals.macd.signal.includes('bullish') ? '#00ff88' :
                      indicatorSignals.macd.signal.includes('bearish') ? '#ff4757' : '#a0a0a0'
                    }>
                      {mergedChartData[mergedChartData.length - 1]?.macdLine?.toFixed(3) || '--'}
                    </IndicatorValue>
                  )}
                </span>
                {indicatorSignals?.macd && (
                  <SignalBadge $signal={indicatorSignals.macd.signal}>
                    {indicatorSignals.macd.signal.replace('_', ' ').toUpperCase()}
                  </SignalBadge>
                )}
              </IndicatorTitle>
              <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={mergedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="time" hide />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} width={50} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div style={{ background: 'rgba(20,20,30,0.95)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ color: '#00adef', fontSize: 11 }}>MACD: {payload[0]?.value?.toFixed(3)}</div>
                            <div style={{ color: '#ff6b35', fontSize: 11 }}>Signal: {payload[1]?.value?.toFixed(3)}</div>
                            <div style={{ color: payload[2]?.value >= 0 ? '#00ff88' : '#ff4757', fontSize: 11 }}>
                              Hist: {payload[2]?.value?.toFixed(3)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="macdLine" stroke="#00adef" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="macdSignal" stroke="#ff6b35" strokeWidth={1.5} dot={false} />
                  <Bar dataKey="macdHistogram" radius={[2, 2, 0, 0]}>
                    {mergedChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.macdHistogram >= 0 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 71, 87, 0.6)'}
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </IndicatorPanel>
          )}
        </ChartCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard>
            <div className="label">
              <DollarSign size={14} /> Current Price
            </div>
            <div className="value">{formatPrice(currentPrice)}</div>
          </StatCard>
          <StatCard>
            <div className="label">
              <TrendingUp size={14} /> Period High
            </div>
            <div className="value" style={{ color: '#00ff88' }}>
              {formatPrice(periodHigh)}
            </div>
          </StatCard>
          <StatCard>
            <div className="label">
              <TrendingDown size={14} /> Period Low
            </div>
            <div className="value" style={{ color: '#ff4757' }}>
              {formatPrice(periodLow)}
            </div>
          </StatCard>
          <StatCard>
            <div className="label">
              <Activity size={14} /> Change ({selectedRange})
            </div>
            <div className="value" style={{ color: isPositive ? '#00ff88' : '#ff4757' }}>
              {formatPercent(changePercent)}
            </div>
          </StatCard>
          <StatCard>
            <div className="label">
              <BarChart3 size={14} /> Avg Volume
            </div>
            <div className="value">{formatLargeNumber(avgVolume)}</div>
          </StatCard>
          <StatCard>
            <div className="label">
              <Clock size={14} /> Last Updated
            </div>
            <div className="value" style={{ fontSize: 14 }}>Real-time</div>
          </StatCard>
        </StatsGrid>

        {/* Navigation Links */}
        <NavigationLinks>
          <NavLink onClick={handleViewDetails}>
            <Eye size={18} />
            View Full {isCrypto ? 'Crypto' : 'Stock'} Details
            <ArrowUpRight size={16} />
          </NavLink>
          <NavLink onClick={() => navigate('/whale-alerts')}>
            <ChevronLeft size={18} />
            Back to Whale Alerts
          </NavLink>
          <NavLink onClick={() => navigate('/dashboard')}>
            <Maximize2 size={18} />
            Go to Dashboard
          </NavLink>
        </NavigationLinks>
      </MaxWidthContainer>
    </PageContainer>
  );
};

export default ChartPage;
