import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios'; // Keep for axios.isCancel()
import { useAuth } from '../context/AuthContext';
import { formatStockPrice, formatCryptoPrice, formatPriceChange, formatVolume, formatMarketCap } from '../utils/priceFormatter';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, TrendingUp, TrendingDown, Brain, Target, Activity,
  DollarSign, BarChart3, Clock, MessageSquare,
  Star, StarOff, Loader2, Zap, PieChart,
  Minus, Plus, ShoppingCart, Wallet, Share2, Bell, BellOff
} from 'lucide-react';

// Smart price formatter based on symbol
const formatPrice = (price, symbol) => {
  if (!price || isNaN(price)) return 'N/A';
  
  // Check if it's a crypto symbol
  const cryptoPatterns = ['-USD', '-USDT', '-BUSD', '-EUR', '-GBP'];
  const knownCryptos = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'DOGE', 'SHIB', 'XRP', 'PEPE', 'FLOKI', 'BONK'];
  
  const symbolUpper = (symbol || '').toUpperCase();
  const isCrypto = cryptoPatterns.some(pattern => symbolUpper.endsWith(pattern)) ||
                   knownCryptos.includes(symbolUpper);
  
  if (isCrypto) {
    return formatCryptoPrice(price);
  }
  return formatStockPrice(price);
};

// ============ ANIMATIONS ============
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
    padding-top: 80px;
  }
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
  margin-bottom: 24px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    transform: translateX(-4px);
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1200px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  animation: ${fadeIn} 0.5s ease;
  animation-delay: ${props => props.$delay || '0s'};
  animation-fill-mode: backwards;
`;

const StockHeader = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StockLogo = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
`;

const StockDetails = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }

  .company-name {
    color: #a0a0a0;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .exchange {
    display: inline-block;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    color: #a0a0a0;
  }
`;

const PriceSection = styled.div`
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

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${props => props.$active ? '#00ff88' : '#a0a0a0'};
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }
`;

// Chart Section
const ChartCard = styled(Card)`
  padding: 0;
  overflow: hidden;
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
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.3)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#667eea' : '#a0a0a0'};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChartContainer = styled.div`
  padding: 20px 24px 24px;
  height: 400px;
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
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
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

// Trading Panel
const TradingPanel = styled(Card)`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: rgba(102, 126, 234, 0.3);
`;

const TradingTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TradeTypeToggle = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
`;

const TradeTypeBtn = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$type === 'buy' && props.$active && `
    background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
    color: #000000;
  `}
  
  ${props => props.$type === 'sell' && props.$active && `
    background: linear-gradient(135deg, #ff4757 0%, #ff3344 100%);
    color: #ffffff;
  `}
  
  ${props => !props.$active && `
    background: transparent;
    color: #a0a0a0;
  `}
`;

const InputGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    font-size: 13px;
    color: #a0a0a0;
    margin-bottom: 8px;
  }
`;

const QuantityInput = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;

  button {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    color: #ffffff;
    width: 44px;
    height: 44px;
    cursor: pointer;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #ffffff;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    padding: 12px;

    &:focus {
      outline: none;
    }
  }
`;

const OrderSummary = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 16px;
  margin: 20px 0;

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 600;
    }
  }

  .label {
    color: #a0a0a0;
  }
`;

const TradeButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$type === 'buy' && `
    background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
    color: #000000;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
    }
  `}
  
  ${props => props.$type === 'sell' && `
    background: linear-gradient(135deg, #ff4757 0%, #ff3344 100%);
    color: #ffffff;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(255, 71, 87, 0.3);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// AI Predictions
const PredictionCard = styled(Card)`
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%);
`;

const PredictionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  .icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .badge {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }
`;

const PredictionSignal = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  .signal-label {
    font-size: 13px;
    color: #a0a0a0;
  }

  .signal-value {
    font-size: 20px;
    font-weight: 700;
    color: ${props => {
      if (props.$signal === 'STRONG_BUY' || props.$signal === 'BUY') return '#00ff88';
      if (props.$signal === 'STRONG_SELL' || props.$signal === 'SELL') return '#ff4757';
      return '#ffaa00';
    }};
  }
`;

const ConfidenceBar = styled.div`
  margin-bottom: 16px;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .bar-bg {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #00ff88 100%);
    border-radius: 4px;
    width: ${props => props.$value}%;
    transition: width 0.5s ease;
  }
`;

const PredictionTargets = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const TargetBox = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 12px;
  text-align: center;

  .label {
    font-size: 11px;
    color: #a0a0a0;
    margin-bottom: 4px;
  }

  .value {
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.$type === 'high' ? '#00ff88' : '#ff4757'};
  }

  .change {
    font-size: 11px;
    color: ${props => props.$type === 'high' ? '#00ff88' : '#ff4757'};
  }
`;

// Social Feed
const SocialCard = styled(Card)``;

const SocialHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .count {
    color: #a0a0a0;
    font-size: 14px;
  }
`;

const PostCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }

  .user-info {
    flex: 1;

    .username {
      font-weight: 600;
      font-size: 14px;
    }

    .time {
      font-size: 12px;
      color: #a0a0a0;
    }
  }

  .sentiment {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    
    &.bullish {
      background: rgba(0, 255, 136, 0.1);
      color: #00ff88;
    }

    &.bearish {
      background: rgba(255, 71, 87, 0.1);
      color: #ff4757;
    }

    &.neutral {
      background: rgba(255, 170, 0, 0.1);
      color: #ffaa00;
    }
  }
`;

const PostContent = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #e0e0e0;
  margin: 0;
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #a0a0a0;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

// Company Info Styles
const CompanyInfoCard = styled(Card)`
  padding: 24px;
`;

const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .badge {
    font-size: 11px;
    padding: 4px 12px;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border-radius: 20px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const CompanyDescription = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: #b0b0b0;
  margin-bottom: 24px;
`;

const CompanyDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const CompanyDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(0, 173, 239, 0.3);
  }

  .label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #808080;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .value {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    word-break: break-word;
  }

  .link {
    color: #00adef;
    text-decoration: none;
    font-size: 13px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Loading State
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #a0a0a0;

  svg {
    animation: ${spin} 1s linear infinite;
  }
`;

// ============ HELPER FUNCTIONS ============
const formatLargeNumber = (num) => {
  if (!num || isNaN(num)) return 'N/A';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toString();
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// Format chart date based on timeframe
const formatChartDate = (dateInput, timeframe) => {
  if (!dateInput) return '';
  
  try {
    // Handle both string dates and timestamps
    let date;
    if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
      // Handle ISO strings and date-only strings
      date = new Date(dateInput);
    } else {
      return '';
    }
    
    if (isNaN(date.getTime())) return '';
    
    if (timeframe === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '5D') {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1M' || timeframe === '3M') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (timeframe === '6M' || timeframe === '1Y') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      // 5Y, MAX
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  } catch (e) {
    console.warn('Date formatting error:', e);
    return '';
  }
};

// Company name lookup
const getCompanyName = (sym) => {
  const names = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'GOOG': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'AMD': 'Advanced Micro Devices',
    'INTC': 'Intel Corporation',
    'CRM': 'Salesforce Inc.',
    'ORCL': 'Oracle Corporation',
    'ADBE': 'Adobe Inc.',
    'PYPL': 'PayPal Holdings Inc.',
    'DIS': 'The Walt Disney Company',
    'COIN': 'Coinbase Global Inc.',
    'SQ': 'Block Inc.',
    'SHOP': 'Shopify Inc.',
    'UBER': 'Uber Technologies Inc.',
    'LYFT': 'Lyft Inc.',
    'SNAP': 'Snap Inc.',
    'PINS': 'Pinterest Inc.',
    'ZM': 'Zoom Video Communications',
    'ROKU': 'Roku Inc.',
    'SPOT': 'Spotify Technology',
    'BA': 'Boeing Company',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'MA': 'Mastercard Inc.',
    'JNJ': 'Johnson & Johnson',
    'PG': 'Procter & Gamble',
    'KO': 'Coca-Cola Company',
    'PEP': 'PepsiCo Inc.',
    'WMT': 'Walmart Inc.',
    'HD': 'Home Depot Inc.',
    'NKE': 'Nike Inc.',
    'MCD': 'McDonald\'s Corporation',
    'SBUX': 'Starbucks Corporation'
  };
  return names[sym?.toUpperCase()] || `${sym?.toUpperCase() || 'Unknown'} Inc.`;
};

// Get company information
const getCompanyInfo = (symbol, stockInfo) => {
  const companyData = {
    'AAPL': {
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company serves consumers, small and mid-sized businesses, and the education, enterprise, and government markets.',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      ceo: 'Tim Cook',
      employees: '164,000',
      founded: '1976',
      headquarters: 'Cupertino, California',
      website: 'https://www.apple.com'
    },
    'TSLA': {
      description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally. The company is accelerating the world\'s transition to sustainable energy.',
      sector: 'Automotive',
      industry: 'Electric Vehicles',
      ceo: 'Elon Musk',
      employees: '127,855',
      founded: '2003',
      headquarters: 'Austin, Texas',
      website: 'https://www.tesla.com'
    },
    'GOOGL': {
      description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
      sector: 'Technology',
      industry: 'Internet Content & Information',
      ceo: 'Sundar Pichai',
      employees: '190,234',
      founded: '1998',
      headquarters: 'Mountain View, California',
      website: 'https://abc.xyz'
    },
    'MSFT': {
      description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. It operates in Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
      sector: 'Technology',
      industry: 'Software - Infrastructure',
      ceo: 'Satya Nadella',
      employees: '221,000',
      founded: '1975',
      headquarters: 'Redmond, Washington',
      website: 'https://www.microsoft.com'
    },
    'AMZN': {
      description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. It operates through North America, International, and Amazon Web Services (AWS) segments.',
      sector: 'Consumer Cyclical',
      industry: 'Internet Retail',
      ceo: 'Andy Jassy',
      employees: '1,541,000',
      founded: '1994',
      headquarters: 'Seattle, Washington',
      website: 'https://www.amazon.com'
    },
    'NVDA': {
      description: 'NVIDIA Corporation provides graphics, compute and networking solutions in the United States, Taiwan, China, and internationally. It operates in Graphics and Compute & Networking segments, powering AI and data centers worldwide.',
      sector: 'Technology',
      industry: 'Semiconductors',
      ceo: 'Jensen Huang',
      employees: '29,600',
      founded: '1993',
      headquarters: 'Santa Clara, California',
      website: 'https://www.nvidia.com'
    },
    'META': {
      description: 'Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
      sector: 'Technology',
      industry: 'Internet Content & Information',
      ceo: 'Mark Zuckerberg',
      employees: '86,482',
      founded: '2004',
      headquarters: 'Menlo Park, California',
      website: 'https://about.meta.com'
    },
    'NFLX': {
      description: 'Netflix, Inc. provides entertainment services. It offers TV series, documentaries, feature films, and mobile games across various genres and languages. Members can play, pause and resume watching as much as they want, anytime, anywhere.',
      sector: 'Communication Services',
      industry: 'Entertainment',
      ceo: 'Ted Sarandos',
      employees: '12,800',
      founded: '1997',
      headquarters: 'Los Gatos, California',
      website: 'https://www.netflix.com'
    }
  };

  const symbolUpper = symbol.toUpperCase();
  
  // Return company-specific data if available
  if (companyData[symbolUpper]) {
    return companyData[symbolUpper];
  }
  
  // Return data from API if available, otherwise N/A
  return {
    description: stockInfo?.longBusinessSummary || stockInfo?.description || 'Company description not available. Data is pulled from your API endpoint.',
    sector: stockInfo?.sector || 'N/A',
    industry: stockInfo?.industry || 'N/A',
    ceo: stockInfo?.ceo || 'N/A',
    employees: stockInfo?.employees || 'N/A',
    founded: stockInfo?.founded || 'N/A',
    headquarters: stockInfo?.city && stockInfo?.state ? `${stockInfo.city}, ${stockInfo.state}` : (stockInfo?.exchange ? `Listed on ${stockInfo.exchange}` : 'N/A'),
    website: stockInfo?.website || '#'
  };
};

// Extract stock info with multiple field name fallbacks
const extractStockInfo = (data) => {
  if (!data) return null;
  
  // Handle nested quote response or flat response
  const quote = data.quote || data.quoteResponse?.result?.[0] || data;
  
  return {
    // Price info
    price: quote.price || quote.regularMarketPrice || quote.currentPrice || 0,
    previousClose: quote.previousClose || quote.regularMarketPreviousClose || 0,
    open: quote.open || quote.regularMarketOpen || 0,
    dayHigh: quote.dayHigh || quote.regularMarketDayHigh || quote.high || 0,
    dayLow: quote.dayLow || quote.regularMarketDayLow || quote.low || 0,
    change: quote.change || quote.regularMarketChange || 0,
    changePercent: quote.changePercent || quote.regularMarketChangePercent || 0,
    
    // Volume
    volume: quote.volume || quote.regularMarketVolume || 0,
    avgVolume: quote.avgVolume || quote.averageDailyVolume10Day || quote.averageVolume || 0,
    
    // Fundamentals
    marketCap: quote.marketCap || quote.MarketCapitalization || 0,
    pe: quote.pe || quote.trailingPE || quote.forwardPE || quote.peRatio || 0,
    eps: quote.eps || quote.epsTrailingTwelveMonths || 0,
    
    // 52-week range
    high52: quote.high52 || quote.fiftyTwoWeekHigh || quote.yearHigh || 0,
    low52: quote.low52 || quote.fiftyTwoWeekLow || quote.yearLow || 0,
    
    // Dividend
    dividend: quote.dividend || quote.trailingAnnualDividendRate || quote.dividendRate || 0,
    dividendYield: quote.dividendYield || quote.trailingAnnualDividendYield || 0,
    
    // Other
    exchange: quote.exchange || quote.exchangeName || 'NASDAQ',
    name: quote.name || quote.shortName || quote.longName || '',
    sector: quote.sector || '',
    industry: quote.industry || ''
  };
};

// ============ CUSTOM TOOLTIP ============
const CustomTooltip = ({ active, payload, label, symbol }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(20, 20, 30, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ margin: '0 0 4px', color: '#a0a0a0', fontSize: '12px' }}>{label}</p>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>
          {formatPrice(payload[0].value, symbol)}
        </p>
      </div>
    );
  }
  return null;
};

// ============ MAIN COMPONENT ============
const StockPage = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  // Chart data state
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState('1M');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const fetchController = useRef(null);

  // Other state
  const [stockInfo, setStockInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [posts, setPosts] = useState([]);
  const [infoLoading, setInfoLoading] = useState(true);

  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [hasAlerts, setHasAlerts] = useState(false);

  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];

  // Get current price from stock info or chart data
  const currentPrice = stockInfo?.price || 
    (chartData.length > 0 ? chartData[chartData.length - 1].price : 0);
  
  const previousClose = stockInfo?.previousClose || 
    (chartData.length > 1 ? chartData[0].price : currentPrice);
  
  const priceChange = stockInfo?.change || (currentPrice - previousClose);
  const changePercent = stockInfo?.changePercent || (previousClose ? ((priceChange / previousClose) * 100) : 0);
  const isPositive = priceChange >= 0;

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
        let intervalParam = '1d';
        if (selectedRange === '1D') intervalParam = '5m';
        else if (selectedRange === '5D') intervalParam = '1h';

        const response = await api.get(
          `/stocks/historical/${symbol}`,
          {
            params: {
              range: selectedRange,
              interval: intervalParam,
            },
            signal: signal,
          }
        );

        const fetchedData = response.data.historicalData || response.data;
        
        // Transform data with proper date formatting
        const transformedData = fetchedData.map((item) => {
          let rawDate = item.date || item.datetime;
          
          if (!rawDate && (item.time || item.timestamp || item.t)) {
            const ts = item.time || item.timestamp || item.t;
            rawDate = new Date(ts).toISOString();
          }
          
          const formattedDate = formatChartDate(rawDate, selectedRange);
          
          return {
            time: formattedDate || 'N/A',
            price: item.close || item.price || item.value || item.c || 0,
            open: item.open || item.o,
            high: item.high || item.h,
            low: item.low || item.l,
            volume: item.volume || item.v
          };
        }).filter(item => item.price > 0 && item.time !== 'N/A');

        setChartData(transformedData);

        if (transformedData.length === 0) {
          setChartError(`No data found for ${symbol} (${selectedRange})`);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error fetching chart data:', err);

        if (err.response?.data?.msg) {
          setChartError(err.response.data.msg);
        } else if (err.response?.data?.error) {
          setChartError(err.response.data.error);
        } else if (err.message) {
          setChartError(`Error: ${err.message}`);
        } else {
          setChartError('Failed to fetch chart data');
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
  }, [symbol, selectedRange, api]);

  // Fetch stock info, predictions, and posts
  useEffect(() => {
    if (!symbol) return;

    const fetchAdditionalData = async () => {
      setInfoLoading(true);

      try {
        // Fetch quote data
        const quoteRes = await api.get(`/stocks/quote/${symbol}`).catch(() => null);
        
        // Fetch predictions
        const predRes = await api.get(`/predictions/recent`, {
          params: { symbol: symbol.toUpperCase() }
        }).catch(() => null);

        // Fetch posts
        const postsRes = await api.get(`/posts`, {
          params: { symbol: symbol.toUpperCase(), limit: 5 }
        }).catch(() => null);

        // Set stock info
        if (quoteRes?.data) {
          setStockInfo(extractStockInfo(quoteRes.data));
        } else {
          setStockInfo(null);
        }

        // Set predictions - NO MOCK DATA, only real API data
        if (predRes?.data) {
          const predData = Array.isArray(predRes.data) 
            ? predRes.data.find(p => p.symbol?.toUpperCase() === symbol.toUpperCase())
            : predRes.data;
          setPrediction(predData || null);
        } else {
          setPrediction(null);
        }

        // Set posts
        if (postsRes?.data) {
          const postsData = Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.posts || [];
          setPosts(postsData);
        } else {
          setPosts([]);
        }

      } catch (err) {
        console.error('Error fetching additional data:', err);
        setPrediction(null);
        setPosts([]);
      } finally {
        setInfoLoading(false);
      }
    };

    fetchAdditionalData();
  }, [symbol, api]);

  // Trade handlers
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleTrade = async () => {
    try {
      const endpoint = tradeType === 'buy' ? '/paper-trading/buy' : '/paper-trading/sell';
      
      const response = await api.post(endpoint, {
        symbol: symbol.toUpperCase(),
        type: 'stock',
        quantity: quantity,
        positionType: 'long'
      });

      if (response.data.success) {
        alert(`✅ ${tradeType.toUpperCase()} order placed!\n${response.data.message}`);
        setQuantity(1);
      } else {
        alert(response.data.error || 'Trade failed');
      }
    } catch (err) {
      console.error('Trade error:', err);
      alert(err.response?.data?.error || 'Failed to execute trade');
    }
  };

  const handleWatchlist = async () => {
    try {
      if (isWatchlisted) {
        await api.delete(`/watchlist/${symbol}`);
      } else {
        await api.post(`/watchlist`, { symbol: symbol.toUpperCase() });
      }
      setIsWatchlisted(!isWatchlisted);
    } catch (err) {
      console.error('Watchlist error:', err);
    }
  };

  // No symbol provided
  if (!symbol) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </BackButton>
        <LoadingContainer>
          <p style={{ color: '#ff4757' }}>No stock symbol provided in URL.</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  const estimatedCost = currentPrice * quantity;

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={18} />
        Back to Dashboard
      </BackButton>

      {/* Stock Header */}
      <StockHeader $delay="0.1s">
        <StockInfo>
          <StockLogo>{symbol?.slice(0, 2).toUpperCase()}</StockLogo>
          <StockDetails>
            <h1>{symbol?.toUpperCase()}</h1>
            <div className="company-name">{getCompanyName(symbol)}</div>
            <span className="exchange">{stockInfo?.exchange || 'NASDAQ'}</span>
          </StockDetails>
        </StockInfo>
        
        <PriceSection>
          <CurrentPrice>{formatPrice(currentPrice, symbol)}</CurrentPrice>
          <PriceChange $positive={isPositive}>
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {formatPrice(Math.abs(priceChange), symbol)} ({formatPercent(changePercent)})
          </PriceChange>
          <ActionButtons>
            <IconButton 
              $active={isWatchlisted} 
              onClick={handleWatchlist}
              title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isWatchlisted ? <Star size={20} /> : <StarOff size={20} />}
            </IconButton>
            <IconButton 
              $active={hasAlerts}
              onClick={() => setHasAlerts(!hasAlerts)}
              title={hasAlerts ? 'Disable alerts' : 'Enable alerts'}
            >
              {hasAlerts ? <Bell size={20} /> : <BellOff size={20} />}
            </IconButton>
            <IconButton title="Share">
              <Share2 size={20} />
            </IconButton>
          </ActionButtons>
        </PriceSection>
      </StockHeader>

      <MainGrid>
        <LeftColumn>
          {/* Price Chart */}
          <ChartCard $delay="0.2s">
            <ChartHeader>
              <ChartTitle>
                <Activity size={18} />
                Price Chart
              </ChartTitle>
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
            <ChartContainer>
              {chartLoading && (
                <ChartLoading>
                  <Loader2 size={32} />
                  <span>Loading {symbol.toUpperCase()} data for {selectedRange}...</span>
                </ChartLoading>
              )}

              {chartError && !chartLoading && (
                <ChartError>
                  <div className="error-icon">⚠️</div>
                  <p>{chartError}</p>
                </ChartError>
              )}

              {!chartLoading && !chartError && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isPositive ? '#00ff88' : '#ff4757'} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={isPositive ? '#00ff88' : '#ff4757'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 11 }}
                      tickFormatter={(val) => formatPrice(val, symbol).replace('$', '')}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip symbol={symbol} />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPositive ? '#00ff88' : '#ff4757'}
                      strokeWidth={2}
                      fill="url(#priceGradient)"
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
          </ChartCard>

          {/* Key Statistics */}
          <Card $delay="0.3s">
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>
              Key Statistics
            </h3>
            <StatsGrid>
              <StatCard>
                <div className="label">
                  <PieChart size={14} /> Market Cap
                </div>
                <div className="value">{formatLargeNumber(stockInfo?.marketCap)}</div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <BarChart3 size={14} /> Volume
                </div>
                <div className="value">{formatLargeNumber(stockInfo?.volume)}</div>
                <div className="sub">Avg: {formatLargeNumber(stockInfo?.avgVolume)}</div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <TrendingUp size={14} /> 52W High
                </div>
                <div className="value" style={{ color: stockInfo?.high52 ? '#00ff88' : undefined }}>
                  {formatPrice(stockInfo?.high52, symbol)}
                </div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <TrendingDown size={14} /> 52W Low
                </div>
                <div className="value" style={{ color: stockInfo?.low52 ? '#ff4757' : undefined }}>
                  {formatPrice(stockInfo?.low52, symbol)}
                </div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <Target size={14} /> P/E Ratio
                </div>
                <div className="value">{stockInfo?.pe ? stockInfo.pe.toFixed(2) : 'N/A'}</div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <DollarSign size={14} /> EPS
                </div>
                <div className="value">{formatPrice(stockInfo?.eps, symbol)}</div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <Wallet size={14} /> Dividend
                </div>
                <div className="value">{formatPrice(stockInfo?.dividend, symbol)}</div>
                <div className="sub">Yield: {stockInfo?.dividendYield?.toFixed(2) || '0.00'}%</div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <Clock size={14} /> Updated
                </div>
                <div className="value" style={{ fontSize: 14 }}>
                  {infoLoading ? 'Loading...' : (stockInfo ? 'Real-time' : 'N/A')}
                </div>
              </StatCard>
            </StatsGrid>
          </Card>

          {/* Company Information */}
          <CompanyInfoCard $delay="0.35s">
            <CompanyHeader>
              <h3>
                <Activity size={20} />
                Company Information
              </h3>
              <span className="badge">About</span>
            </CompanyHeader>
            
            {stockInfo ? (
              <>
                <CompanyDescription>
                  {getCompanyInfo(symbol, stockInfo).description}
                </CompanyDescription>
                
                <CompanyDetailsGrid>
                  <CompanyDetailItem>
                    <div className="label">
                      <BarChart3 size={14} />
                      Sector
                    </div>
                    <div className="value">{getCompanyInfo(symbol, stockInfo).sector}</div>
                  </CompanyDetailItem>
                  
                  <CompanyDetailItem>
                    <div className="label">
                      <Target size={14} />
                      Industry
                    </div>
                    <div className="value">{getCompanyInfo(symbol, stockInfo).industry}</div>
                  </CompanyDetailItem>
                  
                  <CompanyDetailItem>
                    <div className="label">
                      <Brain size={14} />
                      CEO
                    </div>
                    <div className="value">{getCompanyInfo(symbol, stockInfo).ceo}</div>
                  </CompanyDetailItem>
                  
                  <CompanyDetailItem>
                    <div className="label">
                      <Activity size={14} />
                      Employees
                    </div>
                    <div className="value">{getCompanyInfo(symbol, stockInfo).employees}</div>
                  </CompanyDetailItem>
                  
                  <CompanyDetailItem>
                    <div className="label">
                      <Clock size={14} />
                      Founded
                    </div>
                    <div className="value">{getCompanyInfo(symbol, stockInfo).founded}</div>
                  </CompanyDetailItem>
                  
                  <CompanyDetailItem>
                    <div className="label">
                      <PieChart size={14} />
                      Headquarters
                    </div>
                    <div className="value">{getCompanyInfo(symbol, stockInfo).headquarters}</div>
                  </CompanyDetailItem>
                  
                  {getCompanyInfo(symbol, stockInfo).website !== '#' && (
                    <CompanyDetailItem>
                      <div className="label">
                        <Share2 size={14} />
                        Website
                      </div>
                      <a 
                        href={getCompanyInfo(symbol, stockInfo).website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="link"
                      >
                        Visit Website →
                      </a>
                    </CompanyDetailItem>
                  )}
                  
                  <CompanyDetailItem>
                    <div className="label">
                      <Wallet size={14} />
                      Exchange
                    </div>
                    <div className="value">{stockInfo.exchange || 'NASDAQ'}</div>
                  </CompanyDetailItem>
                </CompanyDetailsGrid>
              </>
            ) : (
              <EmptyState>
                <div className="icon">ℹ️</div>
                <p>Loading company information...</p>
              </EmptyState>
            )}
          </CompanyInfoCard>

          {/* Community Posts */}
          <SocialCard $delay="0.4s">
            <SocialHeader>
              <h3>
                <MessageSquare size={18} />
                Community Posts
              </h3>
              <span className="count">{posts.length} posts</span>
            </SocialHeader>
            
            {posts.length > 0 ? posts.map(post => (
              <PostCard key={post.id || post._id}>
                <PostHeader>
                  <div className="avatar">
                    {(post.username || post.user?.username || post.user?.name || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="username">{post.username || post.user?.username || post.user?.name || 'Anonymous'}</div>
                    <div className="time">{getTimeAgo(post.createdAt || post.timestamp)}</div>
                  </div>
                  {post.sentiment && (
                    <span className={`sentiment ${post.sentiment}`}>
                      {post.sentiment}
                    </span>
                  )}
                </PostHeader>
                <PostContent>{post.content || post.text || post.body}</PostContent>
              </PostCard>
            )) : (
              <EmptyState>
                <div className="icon">💬</div>
                <p>No community posts available for {symbol?.toUpperCase()}.</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Posts are fetched from your social feed API endpoint.
                </p>
              </EmptyState>
            )}
          </SocialCard>
        </LeftColumn>

        <RightColumn>
          {/* Paper Trading Panel */}
          <TradingPanel $delay="0.2s">
            <TradingTitle>
              <ShoppingCart size={20} />
              Paper Trade
              <span style={{ 
                background: 'rgba(0, 255, 136, 0.2)', 
                color: '#00ff88',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600
              }}>
                PAPER
              </span>
            </TradingTitle>

            <TradeTypeToggle>
              <TradeTypeBtn
                $type="buy"
                $active={tradeType === 'buy'}
                onClick={() => setTradeType('buy')}
              >
                Buy
              </TradeTypeBtn>
              <TradeTypeBtn
                $type="sell"
                $active={tradeType === 'sell'}
                onClick={() => setTradeType('sell')}
              >
                Sell
              </TradeTypeBtn>
            </TradeTypeToggle>

            <InputGroup>
              <label>Quantity (Shares)</label>
              <QuantityInput>
                <button onClick={() => handleQuantityChange(-1)}>
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => handleQuantityChange(1)}>
                  <Plus size={18} />
                </button>
              </QuantityInput>
            </InputGroup>

            <OrderSummary>
              <div className="row">
                <span className="label">Market Price</span>
                <span>{formatPrice(currentPrice, symbol)}</span>
              </div>
              <div className="row">
                <span className="label">Quantity</span>
                <span>{quantity} shares</span>
              </div>
              <div className="row">
                <span className="label">Estimated {tradeType === 'buy' ? 'Cost' : 'Credit'}</span>
                <span>{formatPrice(estimatedCost, symbol)}</span>
              </div>
            </OrderSummary>

            <TradeButton 
              $type={tradeType} 
              onClick={handleTrade}
              disabled={!currentPrice}
            >
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {symbol?.toUpperCase()}
            </TradeButton>
          </TradingPanel>

          {/* AI Prediction Panel */}
          <PredictionCard $delay="0.3s">
            <PredictionHeader>
              <div className="icon-wrapper">
                <Brain size={22} color="#ffffff" />
              </div>
              <div>
                <h3>AI Prediction</h3>
              </div>
              <span className="badge">ML Powered</span>
            </PredictionHeader>

            {prediction ? (
              <>
                <PredictionSignal $signal={prediction?.signal}>
                  <span className="signal-label">Signal</span>
                  <span className="signal-value">
                    {prediction?.signal?.replace('_', ' ') || 'HOLD'}
                  </span>
                </PredictionSignal>

                <ConfidenceBar $value={prediction?.confidence || 0}>
                  <div className="header">
                    <span style={{ color: '#a0a0a0' }}>Confidence</span>
                    <span style={{ fontWeight: 600 }}>{(prediction?.confidence || 0).toFixed(1)}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" />
                  </div>
                </ConfidenceBar>

                <PredictionTargets>
                  <TargetBox $type="high">
                    <div className="label">Target High</div>
                    <div className="value">{formatPrice(prediction?.targetHigh || prediction?.targetPrice, symbol)}</div>
                    {prediction?.targetHigh && currentPrice > 0 && (
                      <div className="change">
                        +{(((prediction.targetHigh - currentPrice) / currentPrice) * 100).toFixed(1)}%
                      </div>
                    )}
                  </TargetBox>
                  <TargetBox $type="low">
                    <div className="label">Target Low</div>
                    <div className="value">{formatPrice(prediction?.targetLow, symbol)}</div>
                    {prediction?.targetLow && currentPrice > 0 && (
                      <div className="change">
                        {(((prediction.targetLow - currentPrice) / currentPrice) * 100).toFixed(1)}%
                      </div>
                    )}
                  </TargetBox>
                </PredictionTargets>

                <div style={{ 
                  marginTop: 16, 
                  padding: '12px', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#a0a0a0',
                  textAlign: 'center'
                }}>
                  <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Prediction timeframe: {prediction?.timeframe || '30 days'}
                </div>
              </>
            ) : (
              <EmptyState>
                <div className="icon">🤖</div>
                <p>No AI prediction available for {symbol?.toUpperCase()}.</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Predictions are fetched from your API endpoint.
                </p>
              </EmptyState>
            )}
          </PredictionCard>

          {/* Quick Stats */}
          <Card $delay="0.4s">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} />
              Quick Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#a0a0a0', fontSize: 14 }}>Day Range</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {stockInfo?.dayLow && stockInfo?.dayHigh 
                    ? `${formatPrice(stockInfo.dayLow, symbol)} - ${formatPrice(stockInfo.dayHigh, symbol)}`
                    : 'N/A'
                  }
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#a0a0a0', fontSize: 14 }}>Open</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{formatPrice(stockInfo?.open, symbol)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#a0a0a0', fontSize: 14 }}>Previous Close</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{formatPrice(stockInfo?.previousClose || previousClose, symbol)}</span>
              </div>
            </div>
          </Card>
        </RightColumn>
      </MainGrid>
    </PageContainer>
  );
};

export default StockPage;