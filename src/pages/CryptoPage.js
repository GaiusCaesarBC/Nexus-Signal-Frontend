import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios'; // Keep for axios.isCancel()
import { useAuth } from '../context/AuthContext';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, TrendingUp, TrendingDown, Brain, Activity,
  DollarSign, BarChart3, Clock, MessageSquare,
  Star, StarOff, Loader2, Zap, PieChart,
  Minus, Plus, ShoppingCart, Share2, Bell, BellOff,
  Globe, Coins, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Smart price formatter - always uses crypto formatting for crypto page
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '$0.00';
  return formatCryptoPrice(price);
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

const CryptoHeader = styled(Card)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  background: linear-gradient(135deg, rgba(247, 147, 26, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-color: rgba(247, 147, 26, 0.2);
`;

const CryptoInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CryptoLogo = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${props => props.$gradient || 'linear-gradient(135deg, #f7931a 0%, #ffcd00 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 20px rgba(247, 147, 26, 0.3);
`;

const CryptoDetails = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }

  .crypto-name {
    color: #a0a0a0;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .crypto-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(247, 147, 26, 0.15);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    color: #f7931a;
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
  color: ${props => props.$active ? '#f7931a' : '#a0a0a0'};
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
  background: ${props => props.$active ? 'rgba(247, 147, 26, 0.3)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#f7931a' : '#a0a0a0'};
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

// Indicators Grid
const IndicatorsCard = styled(Card)`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
`;

const IndicatorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const IndicatorCard = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 14px;
  
  .label {
    color: #a0a0a0;
    font-size: 11px;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .signal {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    
    &.BUY {
      background: rgba(0, 255, 136, 0.15);
      color: #00ff88;
    }
    
    &.SELL {
      background: rgba(255, 71, 87, 0.15);
      color: #ff4757;
    }
    
    &.HOLD, &.HIGH, &.LOW {
      background: rgba(255, 170, 0, 0.15);
      color: #ffaa00;
    }
    
    &.NA {
      background: rgba(255, 255, 255, 0.1);
      color: #a0a0a0;
    }
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
  background: linear-gradient(135deg, rgba(247, 147, 26, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
  border-color: rgba(247, 147, 26, 0.3);
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
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(247, 147, 26, 0.05) 100%);
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
    background: linear-gradient(135deg, #f7931a 0%, #ffcd00 100%);
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
    background: rgba(247, 147, 26, 0.2);
    color: #f7931a;
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
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: ${props => props.$direction === 'Up' ? '#00ff88' : '#ff4757'};
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
    background: linear-gradient(90deg, #f7931a 0%, #00ff88 100%);
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
    color: ${props => props.$type === 'predicted' ? '#00ff88' : '#f7931a'};
  }

  .change {
    font-size: 11px;
    color: ${props => props.$positive ? '#00ff88' : '#ff4757'};
  }
`;

const PredictionMessage = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 13px;
  color: #a0a0a0;
  line-height: 1.5;
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
    background: linear-gradient(135deg, #f7931a 0%, #ffcd00 100%);
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
  return num.toFixed(2);
};

const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

const getTimeAgo = (timestamp) => {
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

// Crypto name and logo mapping
const cryptoInfo = {
  'BTC': { name: 'Bitcoin', gradient: 'linear-gradient(135deg, #f7931a 0%, #ffcd00 100%)' },
  'ETH': { name: 'Ethereum', gradient: 'linear-gradient(135deg, #627eea 0%, #a0b3f8 100%)' },
  'XRP': { name: 'Ripple', gradient: 'linear-gradient(135deg, #23292f 0%, #4a5568 100%)' },
  'LTC': { name: 'Litecoin', gradient: 'linear-gradient(135deg, #345d9d 0%, #5a8fd8 100%)' },
  'ADA': { name: 'Cardano', gradient: 'linear-gradient(135deg, #0033ad 0%, #3366ff 100%)' },
  'SOL': { name: 'Solana', gradient: 'linear-gradient(135deg, #9945ff 0%, #14f195 100%)' },
  'DOGE': { name: 'Dogecoin', gradient: 'linear-gradient(135deg, #c3a634 0%, #e8d54a 100%)' },
  'DOT': { name: 'Polkadot', gradient: 'linear-gradient(135deg, #e6007a 0%, #ff4d94 100%)' },
  'BNB': { name: 'BNB', gradient: 'linear-gradient(135deg, #f3ba2f 0%, #ffd454 100%)' },
  'LINK': { name: 'Chainlink', gradient: 'linear-gradient(135deg, #2a5ada 0%, #5a8af8 100%)' },
  'UNI': { name: 'Uniswap', gradient: 'linear-gradient(135deg, #ff007a 0%, #ff4da6 100%)' },
  'MATIC': { name: 'Polygon', gradient: 'linear-gradient(135deg, #8247e5 0%, #a879f8 100%)' },
  'SHIB': { name: 'Shiba Inu', gradient: 'linear-gradient(135deg, #ffa409 0%, #ffcc00 100%)' },
  'TRX': { name: 'Tron', gradient: 'linear-gradient(135deg, #ef0027 0%, #ff4d6a 100%)' },
  'AVAX': { name: 'Avalanche', gradient: 'linear-gradient(135deg, #e84142 0%, #ff6b6b 100%)' },
  'ATOM': { name: 'Cosmos', gradient: 'linear-gradient(135deg, #2e3148 0%, #5a5f7a 100%)' },
  'XMR': { name: 'Monero', gradient: 'linear-gradient(135deg, #ff6600 0%, #ff9933 100%)' },
};

const getCryptoInfo = (symbol) => {
  const upperSymbol = symbol?.toUpperCase();
  return cryptoInfo[upperSymbol] || { 
    name: `${upperSymbol} Coin`, 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
  };
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
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <div style={{
        background: 'rgba(20, 20, 30, 0.95)',
        border: '1px solid rgba(247, 147, 26, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ margin: '0 0 4px', color: '#a0a0a0', fontSize: '12px' }}>{formattedDate}</p>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px', color: '#f7931a' }}>
          {formatPrice(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// ============ MAIN COMPONENT ============
const CryptoPage = () => {
  const { symbol } = useParams();
  const [searchParams] = useSearchParams();
  const { api } = useAuth();
  const navigate = useNavigate();

  // DEX token detection from query params
  const isDex = searchParams.get('source') === 'dex';
  const dexNetwork = searchParams.get('network') || 'bsc';
  const dexPoolAddress = searchParams.get('pool');

  // Chart data state
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState('1M');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);
  const fetchController = useRef(null);

  // Prediction state
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);

  // DEX-specific state
  const [dexInfo, setDexInfo] = useState(null);

  // Other state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState(0.1);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [hasAlerts, setHasAlerts] = useState(false);

  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];

  // Get current price from chart data
  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const firstPrice = chartData.length > 1 ? chartData[0].close : currentPrice;
  const priceChange = currentPrice - firstPrice;
  const changePercent = firstPrice ? ((priceChange / firstPrice) * 100) : 0;
  const isPositive = priceChange >= 0;

  // Get crypto details - use DEX info if available
  const cryptoDetails = useMemo(() => {
    if (isDex && dexInfo) {
      return {
        name: dexInfo.name || `${symbol} Token`,
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
      };
    }
    return getCryptoInfo(symbol);
  }, [symbol, isDex, dexInfo]);

  // Fetch chart data (handles both CoinGecko and DEX tokens)
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
        let response;

        // Use DEX endpoint for GeckoTerminal tokens
        if (isDex && dexPoolAddress) {
          console.log(`[CryptoPage] Fetching DEX data for ${symbol} (${dexNetwork}/${dexPoolAddress})`);
          response = await api.get(
            `/crypto/dex/historical/${dexNetwork}/${dexPoolAddress}`,
            {
              params: { range: selectedRange },
              signal: signal,
            }
          );
        } else {
          // Standard CoinGecko endpoint
          response = await api.get(
            `/crypto/historical/${symbol}`,
            {
              params: { range: selectedRange },
              signal: signal,
            }
          );
        }

        const fetchedData = response.data.historicalData || [];

        // Transform data for Recharts
        const transformedData = fetchedData.map((item) => ({
          time: item.time || item.date,
          close: item.close,
          open: item.open,
          high: item.high,
          low: item.low,
          volume: item.volume
        })).filter(item => item.close && !isNaN(item.close));

        setChartData(transformedData);

        // Store DEX info if available
        if (isDex && response.data) {
          setDexInfo({
            name: response.data.name,
            symbol: response.data.symbol,
            network: response.data.network,
            source: response.data.source
          });
        }

        if (transformedData.length === 0) {
          setChartError(`No data found for ${symbol} (${selectedRange})`);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error fetching crypto data:', err);

        if (err.response?.status === 429) {
          setChartError('Rate limit exceeded. Please wait a moment.');
        } else if (err.response?.status === 404) {
          setChartError(`Crypto "${symbol}" not found.`);
        } else if (err.response?.data?.msg) {
          setChartError(err.response.data.msg);
        } else {
          setChartError('Failed to fetch crypto data');
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
  }, [symbol, selectedRange, api, isDex, dexNetwork, dexPoolAddress]);

  // Fetch prediction and posts (handles both CoinGecko and DEX tokens)
  useEffect(() => {
    if (!symbol) return;

    const fetchPrediction = async () => {
      setPredictionLoading(true);

      try {
        let response;

        // Use DEX endpoint for GeckoTerminal tokens
        if (isDex && dexPoolAddress) {
          console.log(`[CryptoPage] Fetching DEX prediction for ${symbol}`);
          response = await api.get(
            `/crypto/dex/prediction/${dexNetwork}/${dexPoolAddress}`,
            { params: { range: '6M' } }
          );
        } else {
          response = await api.get(
            `/crypto/prediction/${symbol}`,
            { params: { range: '6M' } }
          );
        }

        setPrediction(response.data);
      } catch (err) {
        console.error('Error fetching prediction:', err);
        setPrediction(null);
      } finally {
        setPredictionLoading(false);
      }
    };

    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await api.get(`/social/feed`, {
          params: {
            symbol: symbol.toUpperCase(),
            limit: 10
          }
        });

        const relevantPosts = (response.data.posts || response.data || []).filter(post => {
          const content = (post.content || '').toUpperCase();
          const tags = (post.tags || []).map(t => t.toUpperCase());
          return content.includes(`$${symbol.toUpperCase()}`) ||
                 content.includes(symbol.toUpperCase()) ||
                 tags.includes(symbol.toUpperCase());
        });

        setPosts(relevantPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPrediction();
    fetchPosts();
  }, [symbol, api, isDex, dexNetwork, dexPoolAddress]);

  // Trade handlers
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(0.001, parseFloat((prev + delta).toFixed(4))));
  };

  const handleTrade = async () => {
    try {
      const endpoint = tradeType === 'buy' ? '/paper-trading/buy' : '/paper-trading/sell';
      
      const response = await api.post(endpoint, {
        symbol: symbol.toUpperCase(),
        type: 'crypto',
        quantity: quantity,
        positionType: 'long'
      });

      if (response.data.success) {
        alert(`✅ ${tradeType.toUpperCase()} order placed!\n${response.data.message}`);
        setQuantity(0.1);
      } else {
        alert(response.data.error || 'Trade failed');
      }
    } catch (err) {
      console.error('Trade error:', err);
      alert(err.response?.data?.error || 'Failed to execute trade');
    }
  };

  const handleWatchlist = async () => {
    setIsWatchlisted(!isWatchlisted);
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
          <p style={{ color: '#ff4757' }}>No crypto symbol provided in URL.</p>
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

      {/* Crypto Header */}
      <CryptoHeader $delay="0.1s">
        <CryptoInfo>
          <CryptoLogo $gradient={cryptoDetails.gradient}>
            {symbol?.slice(0, 2).toUpperCase()}
          </CryptoLogo>
          <CryptoDetails>
            <h1>{symbol?.toUpperCase()}</h1>
            <div className="crypto-name">{cryptoDetails.name}</div>
            <span className="crypto-badge" style={isDex ? { background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' } : {}}>
              <Coins size={12} />
              {isDex ? `DEX Token (${dexNetwork.toUpperCase()})` : 'Cryptocurrency'}
            </span>
          </CryptoDetails>
        </CryptoInfo>
        
        <PriceSection>
          <CurrentPrice>{formatPrice(currentPrice)}</CurrentPrice>
          <PriceChange $positive={isPositive}>
            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            {formatPrice(Math.abs(priceChange))} ({formatPercent(changePercent)})
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
      </CryptoHeader>

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
                      <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
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
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={isPositive ? '#00ff88' : '#ff4757'}
                      strokeWidth={2}
                      fill="url(#cryptoGradient)"
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

          {/* Technical Indicators */}
          {prediction?.indicators && (
            <IndicatorsCard $delay="0.3s">
              <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} />
                Technical Indicators
              </h3>
              <IndicatorsGrid>
                {Object.entries(prediction.indicators).map(([key, data]) => (
                  <IndicatorCard key={key}>
                    <div className="label">{key}</div>
                    <div className="value">{data.value}</div>
                    <span className={`signal ${data.signal === 'N/A' ? 'NA' : data.signal}`}>
                      {data.signal}
                    </span>
                  </IndicatorCard>
                ))}
              </IndicatorsGrid>
            </IndicatorsCard>
          )}

          {/* Key Statistics */}
          <Card $delay="0.4s">
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>
              Key Statistics
            </h3>
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
                  {chartData.length > 0 
                    ? formatPrice(Math.max(...chartData.map(d => d.high || d.close)))
                    : 'N/A'
                  }
                </div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <TrendingDown size={14} /> Period Low
                </div>
                <div className="value" style={{ color: '#ff4757' }}>
                  {chartData.length > 0 
                    ? formatPrice(Math.min(...chartData.map(d => d.low || d.close)))
                    : 'N/A'
                  }
                </div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <PieChart size={14} /> Change
                </div>
                <div className="value" style={{ color: isPositive ? '#00ff88' : '#ff4757' }}>
                  {formatPercent(changePercent)}
                </div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <BarChart3 size={14} /> Avg Volume
                </div>
                <div className="value">
                  {chartData.length > 0 
                    ? formatLargeNumber(chartData.reduce((acc, d) => acc + (d.volume || 0), 0) / chartData.length)
                    : 'N/A'
                  }
                </div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <Globe size={14} /> Network
                </div>
                <div className="value" style={{ fontSize: 14 }}>{cryptoDetails.name}</div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <Zap size={14} /> Volatility
                </div>
                <div className="value" style={{ fontSize: 14 }}>
                  {Math.abs(changePercent) > 10 ? 'High' : Math.abs(changePercent) > 5 ? 'Medium' : 'Low'}
                </div>
              </StatCard>
              <StatCard>
                <div className="label">
                  <Clock size={14} /> Updated
                </div>
                <div className="value" style={{ fontSize: 14 }}>Real-time</div>
              </StatCard>
            </StatsGrid>
          </Card>

          {/* Community Posts */}
          <SocialCard $delay="0.5s">
            <SocialHeader>
              <h3>
                <MessageSquare size={18} />
                Community Posts
              </h3>
              <span className="count">{posts.length} posts</span>
            </SocialHeader>
            
            {postsLoading ? (
              <ChartLoading style={{ height: 150 }}>
                <Loader2 size={24} />
                <span>Loading posts...</span>
              </ChartLoading>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <PostCard key={post._id || post.id}>
                  <PostHeader>
                    <div className="avatar">
                      {(post.user?.username || post.username || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="username">{post.user?.username || post.username || 'Anonymous'}</div>
                      <div className="time">{getTimeAgo(post.createdAt)}</div>
                    </div>
                    {post.sentiment && (
                      <span className={`sentiment ${post.sentiment}`}>
                        {post.sentiment}
                      </span>
                    )}
                  </PostHeader>
                  <PostContent>{post.content}</PostContent>
                </PostCard>
              ))
            ) : (
              <EmptyState>
                <div className="icon">💬</div>
                <p>No posts yet for ${symbol?.toUpperCase()}. Be the first to share your thoughts!</p>
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
                background: 'rgba(247, 147, 26, 0.2)', 
                color: '#f7931a',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600
              }}>
                CRYPTO
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
              <label>Quantity ({symbol?.toUpperCase()})</label>
              <QuantityInput>
                <button onClick={() => handleQuantityChange(-0.1)}>
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                  min="0.001"
                  step="0.01"
                />
                <button onClick={() => handleQuantityChange(0.1)}>
                  <Plus size={18} />
                </button>
              </QuantityInput>
            </InputGroup>

            <OrderSummary>
              <div className="row">
                <span className="label">Market Price</span>
                <span>{formatPrice(currentPrice)}</span>
              </div>
              <div className="row">
                <span className="label">Quantity</span>
                <span>{quantity} {symbol?.toUpperCase()}</span>
              </div>
              <div className="row">
                <span className="label">Estimated {tradeType === 'buy' ? 'Cost' : 'Credit'}</span>
                <span>{formatPrice(estimatedCost)}</span>
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
              <span className="badge">Technical Analysis</span>
            </PredictionHeader>

            {predictionLoading ? (
              <ChartLoading style={{ height: 150 }}>
                <Loader2 size={24} />
                <span>Analyzing...</span>
              </ChartLoading>
            ) : prediction ? (
              <>
                <PredictionSignal $direction={prediction.predictedDirection}>
                  <span className="signal-label">Prediction</span>
                  <span className="signal-value">
                    {prediction.predictedDirection === 'Up' ? (
                      <ArrowUpRight size={20} />
                    ) : (
                      <ArrowDownRight size={20} />
                    )}
                    {prediction.predictedDirection}
                  </span>
                </PredictionSignal>

                <ConfidenceBar $value={prediction.confidence || 0}>
                  <div className="header">
                    <span style={{ color: '#a0a0a0' }}>Confidence</span>
                    <span style={{ fontWeight: 600 }}>{(prediction.confidence || 0).toFixed(1)}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" />
                  </div>
                </ConfidenceBar>

                <PredictionTargets>
                  <TargetBox $type="current">
                    <div className="label">Current</div>
                    <div className="value">{formatPrice(prediction.currentPrice)}</div>
                  </TargetBox>
                  <TargetBox $type="predicted" $positive={prediction.percentageChange >= 0}>
                    <div className="label">Predicted</div>
                    <div className="value">{formatPrice(prediction.predictedPrice)}</div>
                    <div className="change">{formatPercent(prediction.percentageChange)}</div>
                  </TargetBox>
                </PredictionTargets>

                {prediction.message && (
                  <PredictionMessage>
                    <strong>Analysis:</strong> {prediction.message}
                  </PredictionMessage>
                )}
              </>
            ) : (
              <EmptyState>
                <div className="icon">🔮</div>
                <p>No AI prediction available for {symbol?.toUpperCase()} yet.</p>
              </EmptyState>
            )}
          </PredictionCard>

          {/* Quick Stats */}
          <Card $delay="0.4s">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} />
              Quick Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#a0a0a0', fontSize: 14 }}>Asset Type</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: isDex ? '#8b5cf6' : '#f7931a' }}>
                  {isDex ? 'DEX Token' : 'Cryptocurrency'}
                </span>
              </div>
              {isDex && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                  <span style={{ color: '#a0a0a0', fontSize: 14 }}>Network</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#8b5cf6' }}>{dexNetwork.toUpperCase()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#a0a0a0', fontSize: 14 }}>Trading</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>24/7</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <span style={{ color: '#a0a0a0', fontSize: 14 }}>Data Source</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: isDex ? '#8b5cf6' : '#f7931a' }}>
                  {isDex ? 'GeckoTerminal' : 'CoinGecko Pro'}
                </span>
              </div>
            </div>
          </Card>
        </RightColumn>
      </MainGrid>
    </PageContainer>
  );
};

export default CryptoPage;