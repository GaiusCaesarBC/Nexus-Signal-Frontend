// client/src/pages/PredictionsPage.js - AI Market Forecast Engine
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import styled, { keyframes } from 'styled-components';
import { getAssetName } from '../utils/stockNames';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Brain, TrendingUp, TrendingDown, Target, Zap, Activity,
    Calendar, DollarSign, Percent, ArrowRight,
    Star, Award, Sparkles, ChevronRight, BarChart3,
    Rocket, Trophy, Flame, Share2, Download,
    X, Eye, RefreshCw, BookmarkPlus, Bookmark, Twitter,
    Facebook, Linkedin, Copy, Clock, Trash2, AlertTriangle,
    CheckCircle, XCircle, ArrowUp, ArrowDown, Users, Radio, Bell
} from 'lucide-react';
import CreateAlertModal from '../components/CreateAalertModal';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from '../components/UpgradePrompt';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ============ PRICE FORMATTER ============
const formatPredictionPrice = (price, symbol) => {
    if (!price) return '$0.00';
    const symbolUpper = symbol?.toUpperCase() || '';
    const isDex = symbolUpper.includes(':');
    const cryptoPatterns = ['-USD', '-USDT', '-BUSD', '-EUR', '-GBP'];
    const knownCryptos = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'DOGE', 'SHIB', 'XRP', 'PEPE', 'FLOKI', 'BONK'];
    const isCrypto = isDex || cryptoPatterns.some(p => symbolUpper.endsWith(p)) ||
                     knownCryptos.includes(symbolUpper.split(':')[0]);
    return isCrypto ? formatCryptoPrice(price) : formatStockPrice(price);
};

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 80px 2rem 2rem;
    background: transparent;
    color: #e0e6ed;
    position: relative;
    overflow-x: hidden;
    z-index: 1;
`;

const Header = styled.div`
    max-width: 900px;
    margin: 0 auto 1.5rem;
    animation: ${fadeIn} 0.5s ease-out;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 2rem;
    color: #e0e6ed;
    font-weight: 700;
    margin-bottom: 0.5rem;
    @media (max-width: 768px) { font-size: 1.5rem; }
`;

const Subtitle = styled.p`
    color: #64748b;
    font-size: 1rem;
    margin-bottom: 0;
`;

const TrustStrip = styled.div`
    max-width: 900px;
    margin: 0 auto 2rem;
    padding: 0.75rem 1.5rem;
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    text-align: center;
    color: #64748b;
    font-size: 0.85rem;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;

    span { color: #e0e6ed; font-weight: 600; }
`;

const TabsContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto 1.5rem;
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
`;

const Tab = styled.button`
    padding: 0.6rem 1.25rem;
    background: ${p => p.$active ? 'rgba(0, 173, 239, 0.12)' : 'rgba(12, 16, 32, 0.92)'};
    border: 1px solid ${p => p.$active ? 'rgba(0, 173, 239, 0.4)' : 'rgba(255, 255, 255, 0.06)'};
    border-radius: 8px;
    color: ${p => p.$active ? '#00adef' : '#64748b'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    &:hover {
        border-color: rgba(0, 173, 239, 0.4);
        color: #00adef;
    }
`;

const StatsBanner = styled.div`
    max-width: 900px;
    margin: 0 auto 2rem;
    padding: 0.75rem 1.5rem;
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    animation: ${fadeIn} 0.5s ease-out 0.15s both;
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
    span { color: #e0e6ed; font-weight: 700; }
`;

const EdgeBadge = styled.span`
    padding: 0.2rem 0.6rem;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 6px;
    color: #10b981;
    font-size: 0.8rem;
    font-weight: 600;
`;

const InputSection = styled.div`
    max-width: 800px;
    margin: 0 auto 2rem;
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 2rem;
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
    position: relative;
    z-index: 10;
`;

const InputHelperText = styled.p`
    color: #64748b;
    font-size: 0.85rem;
    margin: 0 0 1.25rem 0;
`;

const InputForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const InputGroup = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const Label = styled.label`
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const AutocompleteContainer = styled.div`
    position: relative;
    width: 100%;
    z-index: 100;
`;

const SuggestionsDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(12, 16, 32, 0.98);
    border: 1px solid rgba(0, 173, 239, 0.25);
    border-radius: 10px;
    margin-top: 4px;
    max-height: 280px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
    &::-webkit-scrollbar-thumb { background: rgba(0, 173, 239, 0.3); border-radius: 3px; }
`;

const SuggestionItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 1rem;
    cursor: pointer;
    transition: background 0.15s ease;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(0, 173, 239, 0.08); }
`;

const SuggestionLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SuggestionSymbol = styled.span`
    font-weight: 700;
    font-size: 0.95rem;
    color: #e0e6ed;
`;

const SuggestionName = styled.span`
    font-size: 0.8rem;
    color: #64748b;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SuggestionType = styled.span`
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    text-transform: uppercase;
    background: ${p => p.$type === 'crypto' ? 'rgba(245, 158, 11, 0.15)' : p.$type === 'dex' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 173, 239, 0.15)'};
    color: ${p => p.$type === 'crypto' ? '#f59e0b' : p.$type === 'dex' ? '#10b981' : '#00adef'};
`;

const SuggestionChain = styled.span`
    font-size: 0.65rem;
    font-weight: 500;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    text-transform: uppercase;
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
    margin-left: 0.25rem;
`;

const NoResults = styled.div`
    padding: 1rem;
    text-align: center;
    color: #64748b;
    font-size: 0.9rem;
`;

const Input = styled.input`
    padding: 0.85rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e0e6ed;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    transition: border-color 0.2s ease;
    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 239, 0.15);
    }
    &::placeholder { color: #475569; text-transform: none; }
`;

const ExampleText = styled.p`
    color: #475569;
    font-size: 0.8rem;
    margin: -0.5rem 0 0 0;
`;

const Select = styled.select`
    padding: 0.85rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e0e6ed;
    font-size: 1rem;
    font-weight: 600;
    transition: border-color 0.2s ease;
    cursor: pointer;
    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 239, 0.15);
    }
    option { background: #0c1020; color: #e0e6ed; }
`;

const PredictButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: all 0.2s ease;
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 239, 0.35);
    }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const LoadingSpinner = styled(RefreshCw)`
    animation: ${spin} 1s linear infinite;
`;

// ============ RESULTS ============
const ResultsContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    animation: ${fadeIn} 0.4s ease-out;
`;

const PredictionCard = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 2rem;
    margin-bottom: 1.5rem;
`;

const ForecastLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(0, 173, 239, 0.08);
    border: 1px solid rgba(0, 173, 239, 0.2);
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-size: 0.85rem;
    color: #00adef;
    font-weight: 600;
`;

const ForecastLabelSub = styled.span`
    color: #64748b;
    font-weight: 400;
    margin-left: 0.5rem;
`;

const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1.5rem;
    @media (max-width: 768px) { flex-direction: column; gap: 1rem; }
`;

const StockInfo = styled.div``;

const StockSymbol = styled.h2`
    font-size: 2rem;
    font-weight: 800;
    color: #e0e6ed;
    margin: 0 0 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const CompanyName = styled.div`
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
`;

const CurrentPriceSection = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

const CurrentPriceLabel = styled.span`
    color: #64748b;
    font-size: 0.85rem;
`;

const CurrentPriceValue = styled.span`
    color: #e0e6ed;
    font-size: 1.4rem;
    font-weight: 700;
`;

const DirectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: ${p => p.$neutral ? 'rgba(245, 158, 11, 0.1)' : p.$up ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
    border: 1px solid ${p => p.$neutral ? 'rgba(245, 158, 11, 0.3)' : p.$up ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
    border-radius: 10px;
    color: ${p => p.$neutral ? '#f59e0b' : p.$up ? '#10b981' : '#ef4444'};
    font-size: 1rem;
    font-weight: 700;
`;

const SignalStrengthBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    background: ${p => p.$strength === 'strong' ? 'rgba(16,185,129,0.1)' : p.$strength === 'moderate' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'};
    border: 1px solid ${p => p.$strength === 'strong' ? 'rgba(16,185,129,0.3)' : p.$strength === 'moderate' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'};
    border-radius: 6px;
    color: ${p => p.$strength === 'strong' ? '#10b981' : p.$strength === 'moderate' ? '#f59e0b' : '#ef4444'};
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    @media (max-width: 768px) { justify-content: center; }
`;

const ActionButton = styled.button`
    padding: 0.5rem 0.85rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    &:hover { background: rgba(255, 255, 255, 0.08); color: #e0e6ed; }
`;

// Shared prediction banner
const SharedPredictionBanner = styled.div`
    background: rgba(239, 68, 68, 0.06);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
`;

const SharedBadgeLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const LiveDot = styled.div`
    width: 10px;
    height: 10px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 6px #10b981;
`;

const LiveDotLarge = styled.div`
    width: 12px;
    height: 12px;
    background: #ef4444;
    border-radius: 50%;
    box-shadow: 0 0 8px #ef4444;
`;

const SharedText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
`;

const SharedTitle = styled.span`
    font-size: 0.95rem;
    font-weight: 700;
    color: #ef4444;
    display: flex;
    align-items: center;
`;

const SharedSubtitle = styled.span`
    font-size: 0.8rem;
    color: #64748b;
`;

const ViewerCount = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background: rgba(12, 16, 32, 0.6);
    border-radius: 16px;
    font-size: 0.8rem;
    color: #e0e6ed;
    svg { color: #00adef; }
`;

// ============ LIVE STATUS / COUNTDOWN ============
const LiveStatusCard = styled.div`
    background: rgba(12, 16, 32, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
`;

const LiveStatusHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 0.75rem;
`;

const LiveStatusTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #e0e6ed;
`;

const CountdownDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const CountdownUnit = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: rgba(12, 16, 32, 0.8);
    border-radius: 8px;
    border: 1px solid ${p => p.$urgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'};
    min-width: 56px;
`;

const CountdownValue = styled.div`
    font-size: 1.4rem;
    font-weight: 800;
    color: ${p => p.$urgent ? '#ef4444' : '#e0e6ed'};
`;

const CountdownLabel = styled.div`
    font-size: 0.65rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const CountdownSeparator = styled.span`
    font-size: 1.2rem;
    color: #475569;
    font-weight: 700;
`;

// ============ DYNAMIC CONFIDENCE ============
const DynamicConfidenceCard = styled.div`
    background: rgba(12, 16, 32, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 1.25rem;
`;

const ConfidenceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
`;

const ConfidenceTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #94a3b8;
`;

const ConfidenceValueLarge = styled.div`
    font-size: 2rem;
    font-weight: 800;
    color: ${p => p.$value >= 70 ? '#10b981' : p.$value >= 50 ? '#f59e0b' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
`;

const ConfidenceChange = styled.span`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${p => p.$positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.2rem;
`;

const ConfidenceBarLarge = styled.div`
    width: 100%;
    height: 10px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 5px;
    overflow: hidden;
`;

const ConfidenceBarFill = styled.div`
    height: 100%;
    width: ${p => Math.min(95, p.$value || 0)}%;
    background: ${p => p.$value >= 70 ? '#10b981' : p.$value >= 50 ? '#f59e0b' : '#ef4444'};
    border-radius: 5px;
    transition: width 0.5s ease-out;
`;

const ConfidenceMessage = styled.div`
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(12, 16, 32, 0.5);
    border-radius: 6px;
    font-size: 0.8rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

// ============ METRICS ============
const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const MetricCard = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 1.25rem;
    animation: ${fadeIn} 0.4s ease-out;
`;

const MetricIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${p => p.$variant === 'success' ? 'rgba(16,185,129,0.12)' : p.$variant === 'danger' ? 'rgba(239,68,68,0.12)' : p.$variant === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(0,173,239,0.12)'};
    color: ${p => p.$variant === 'success' ? '#10b981' : p.$variant === 'danger' ? '#ef4444' : p.$variant === 'warning' ? '#f59e0b' : '#00adef'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
`;

const MetricLabel = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-bottom: 0.35rem;
`;

const MetricValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${p => p.$variant === 'success' ? '#10b981' : p.$variant === 'danger' ? '#ef4444' : p.$variant === 'warning' ? '#f59e0b' : '#e0e6ed'};
`;

const MetricsMicrocopy = styled.p`
    color: #475569;
    font-size: 0.75rem;
    margin: -0.5rem 0 1.5rem 0;
    font-style: italic;
`;

// ============ AI REASONING ============
const ReasoningSection = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const ReasoningTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ReasoningGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const ReasoningItem = styled.div`
    padding: 0.75rem 1rem;
    background: rgba(12, 16, 32, 0.5);
    border-radius: 8px;
    border-left: 3px solid ${p => p.$bullish ? '#10b981' : p.$bearish ? '#ef4444' : '#f59e0b'};
`;

const ReasoningLabel = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
`;

const ReasoningText = styled.div`
    color: #e0e6ed;
    font-size: 0.9rem;
    font-weight: 500;
`;

// ============ INDICATORS ============
const IndicatorsSection = styled.div`
    margin-bottom: 1.5rem;
`;

const IndicatorsTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const IndicatorsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
`;

const IndicatorItem = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid ${p => p.$signal === 'BUY' ? 'rgba(16,185,129,0.2)' : p.$signal === 'SELL' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'};
    border-radius: 8px;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const IndicatorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const IndicatorName = styled.span`
    color: #e0e6ed;
    font-size: 0.9rem;
    font-weight: 600;
`;

const IndicatorNumericValue = styled.span`
    color: #475569;
    font-size: 0.75rem;
`;

const IndicatorSignal = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.8rem;
    background: ${p => p.$signal === 'BUY' ? 'rgba(16,185,129,0.12)' : p.$signal === 'SELL' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'};
    color: ${p => p.$signal === 'BUY' ? '#10b981' : p.$signal === 'SELL' ? '#ef4444' : '#f59e0b'};
`;

const NoIndicatorsMessage = styled.div`
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: #64748b;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

// ============ CHART ============
const ChartSection = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ChartSubtitle = styled.p`
    color: #475569;
    font-size: 0.75rem;
    margin: 0 0 1.25rem 0;
    font-style: italic;
`;

const ChartLegend = styled.div`
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 0.75rem;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const LegendColor = styled.div`
    width: 16px;
    height: 16px;
    background: ${p => p.color};
    border-radius: 3px;
`;

const LegendText = styled.span`
    color: #64748b;
    font-size: 0.8rem;
`;

// ============ HISTORICAL VALIDATION ============
const ValidationSection = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const ValidationTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ValidationStats = styled.div`
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
`;

const ValidationStat = styled.div`
    span:first-child {
        color: #64748b;
        font-size: 0.8rem;
        display: block;
        margin-bottom: 0.15rem;
    }
    span:last-child {
        color: #e0e6ed;
        font-size: 1.25rem;
        font-weight: 800;
    }
`;

const ValidationDisclaimer = styled.p`
    color: #475569;
    font-size: 0.75rem;
    margin: 0;
    font-style: italic;
`;

// ============ ACTION CTAS ============
const CTASection = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
`;

const CTAButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${p => p.$primary ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'rgba(255,255,255,0.04)'};
    border: 1px solid ${p => p.$primary ? 'transparent' : 'rgba(255,255,255,0.1)'};
    border-radius: 8px;
    color: ${p => p.$primary ? '#fff' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    &:hover {
        transform: translateY(-1px);
        ${p => p.$primary ? 'box-shadow: 0 6px 20px rgba(0,173,239,0.3);' : 'background: rgba(255,255,255,0.08); color: #e0e6ed;'}
    }
`;

// ============ TRUST LINE ============
const TrustLine = styled.div`
    text-align: center;
    padding: 1rem;
    color: #475569;
    font-size: 0.8rem;
    font-style: italic;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    animation: ${fadeIn} 0.4s ease-out;
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: rgba(0, 173, 239, 0.08);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(0, 173, 239, 0.2);
`;

const EmptyTitle = styled.h2`
    color: #e0e6ed;
    font-size: 1.4rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
`;

const EmptyText = styled.p`
    color: #64748b;
    font-size: 1rem;
`;

// ============ MODALS ============
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: ${fadeIn} 0.2s ease-out;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: rgba(12, 16, 32, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 1.75rem;
    max-width: 480px;
    width: 100%;
    animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.25rem;
    font-weight: 700;
`;

const CloseButton = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;
    &:hover { background: rgba(239, 68, 68, 0.2); }
`;

const ShareOptions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
`;

const ShareOption = styled.button`
    padding: 0.85rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    &:hover { background: rgba(255, 255, 255, 0.08); color: #e0e6ed; }
`;

const WatchlistStar = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    &:hover { transform: scale(1.15); }
`;

// ============ SAVED PREDICTIONS ============
const SavedPredictionsContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const SavedPredictionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1rem;
    animation: ${fadeIn} 0.4s ease-out;
`;

const SavedPredictionCard = styled.div`
    background: rgba(12, 16, 32, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 1.25rem;
    transition: border-color 0.2s ease;
    position: relative;
    overflow: hidden;
    &:hover { border-color: rgba(255, 255, 255, 0.12); }
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: ${p => p.$up ? '#10b981' : '#ef4444'};
    }
`;

const SavedCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
`;

const SavedSymbol = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: #e0e6ed;
`;

const SavedDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    background: ${p => p.$up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};
    border: 1px solid ${p => p.$up ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'};
    border-radius: 6px;
    color: ${p => p.$up ? '#10b981' : '#ef4444'};
    font-weight: 700;
    font-size: 0.8rem;
`;

const SavedCardBody = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const SavedMetric = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    padding: 0.6rem;
`;

const SavedMetricLabel = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    margin-bottom: 0.15rem;
`;

const SavedMetricValue = styled.div`
    color: #e0e6ed;
    font-size: 1rem;
    font-weight: 700;
`;

const SavedCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
`;

const SavedDate = styled.div`
    color: #475569;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const SavedActions = styled.div`
    display: flex;
    gap: 0.4rem;
`;

const SavedActionButton = styled.button`
    padding: 0.4rem;
    background: ${p => p.$danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)'};
    border: 1px solid ${p => p.$danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'};
    border-radius: 6px;
    color: ${p => p.$danger ? '#ef4444' : '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    &:hover { transform: scale(1.05); }
`;

const ClearAllButton = styled.button`
    padding: 0.6rem 1.25rem;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    color: #ef4444;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: background 0.2s ease;
    margin-bottom: 1.5rem;
    &:hover { background: rgba(239, 68, 68, 0.15); }
`;

// ============ MAIN COMPONENT ============
const PredictionsPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { hasPlanAccess } = useSubscription();
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(!hasPlanAccess('starter'));

    const [activeTab, setActiveTab] = useState('predict');
    const [symbol, setSymbol] = useState('');
    const [days, setDays] = useState('7');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [savedPredictions, setSavedPredictions] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    // Symbol autocomplete state
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [dexInfo, setDexInfo] = useState(null);

    // Dynamic confidence state
    const [dynamicConfidence, setDynamicConfidence] = useState(null);
    const [confidenceChange, setConfidenceChange] = useState(0);
    const [confidenceTrend, setConfidenceTrend] = useState('neutral');

    // Countdown state
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const [platformStats, setPlatformStats] = useState({
        accuracy: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        loading: true
    });

    // Symbol search function
    const searchSymbols = useCallback(async (query) => {
        if (!query || query.length < 1) {
            setSuggestions([]);
            return;
        }
        setSearchLoading(true);
        try {
            const response = await api.get(`/predictions/symbols/search?q=${encodeURIComponent(query)}&type=all`);
            setSuggestions(response.data.symbols || []);
        } catch (error) {
            console.error('Symbol search error:', error);
            setSuggestions([]);
        } finally {
            setSearchLoading(false);
        }
    }, [api]);

    // Debounced search
    useEffect(() => {
        const isContractAddr = symbol.startsWith('0x') || /^[1-9A-HJ-NP-Za-km-z]{20,}$/.test(symbol);
        const delay = isContractAddr ? 800 : 200;
        const minLength = isContractAddr ? (symbol.startsWith('0x') ? 42 : 32) : 1;
        const timer = setTimeout(() => {
            if (symbol.length >= minLength) {
                searchSymbols(symbol);
            } else {
                setSuggestions([]);
            }
        }, delay);
        return () => clearTimeout(timer);
    }, [symbol, searchSymbols]);

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setSymbol(suggestion.symbol);
        setShowSuggestions(false);
        setSuggestions([]);
        if (suggestion.type === 'dex') {
            setDexInfo({
                network: suggestion.network,
                poolAddress: suggestion.poolAddress,
                contractAddress: suggestion.contractAddress,
                chain: suggestion.chain
            });
        } else {
            setDexInfo(null);
        }
    };

    // Fetch platform stats
    useEffect(() => {
        const fetchPlatformStats = async () => {
            try {
                const response = await api.get('/predictions/platform-stats');
                if (response.data.success) {
                    setPlatformStats({
                        accuracy: response.data.accuracy || 0,
                        totalPredictions: response.data.totalPredictions || 0,
                        correctPredictions: response.data.correctPredictions || 0,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching platform stats:', error);
                setPlatformStats(prev => ({ ...prev, loading: false }));
            }
        };
        fetchPlatformStats();
        const interval = setInterval(fetchPlatformStats, 30000);
        return () => clearInterval(interval);
    }, [api]);

    // Load saved predictions and watchlist
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedPredictions') || '[]');
        setSavedPredictions(saved);

        const fetchWatchlist = async () => {
            try {
                const response = await api.get('/watchlist');
                if (response.data && Array.isArray(response.data)) {
                    setWatchlist(response.data.map(item => typeof item === 'string' ? item : item.symbol));
                }
            } catch (error) {
                console.error('Error fetching watchlist:', error);
            }
        };
        fetchWatchlist();
    }, [api]);

    // Live data polling
    useEffect(() => {
        const predId = prediction?._id || prediction?.predictionId;
        if (!predId) return;

        let currentInterval = null;

        const fetchLiveData = async () => {
            try {
                const response = await api.get(`/predictions/live/${predId}`);
                const data = response.data.prediction;
                setLiveData(data);

                if (data.liveConfidence !== undefined) {
                    setDynamicConfidence(prev => {
                        if (prev !== null) {
                            const change = data.liveConfidence - prev;
                            setConfidenceChange(change);
                            setConfidenceTrend(change > 0 ? 'up' : change < 0 ? 'down' : 'neutral');
                        }
                        return data.liveConfidence;
                    });
                }

                if (data.livePrice !== undefined) {
                    data.currentPrice = data.livePrice;
                }

                return data.timeRemaining;
            } catch (error) {
                console.error('Error fetching live data:', error);
                return null;
            }
        };

        fetchLiveData();
        currentInterval = setInterval(fetchLiveData, 10000);
        return () => { if (currentInterval) clearInterval(currentInterval); };
    }, [prediction?._id, prediction?.predictionId, api]);

    // Initialize countdown from shared prediction data
    useEffect(() => {
        if (prediction?.timeRemaining && prediction.timeRemaining > 0 && !liveData) {
            const remaining = prediction.timeRemaining;
            const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);
            setCountdown({ days: d, hours: h, minutes: m, seconds: s });
        }
    }, [prediction?.timeRemaining, liveData]);

    // Countdown timer
    useEffect(() => {
        if (!liveData?.timeRemaining || liveData.timeRemaining <= 0) return;

        const fetchedAt = Date.now();
        const initialRemaining = liveData.timeRemaining;

        const updateCountdown = () => {
            const elapsed = Date.now() - fetchedAt;
            const remaining = Math.max(0, initialRemaining - elapsed);

            if (remaining <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const d = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);

            setCountdown({ days: d, hours: h, minutes: m, seconds: s });
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [liveData?.timeRemaining]);

    // Generate chart data
    const generateChartData = (currentPrice, targetPrice, days) => {
        const data = [];
        const priceChange = targetPrice - currentPrice;

        const getDecimals = (price) => {
            const absPrice = Math.abs(price);
            if (absPrice < 0.000001) return 12;
            if (absPrice < 0.0001) return 10;
            if (absPrice < 0.01) return 8;
            if (absPrice < 1) return 6;
            return 2;
        };

        const decimals = Math.max(getDecimals(currentPrice), getDecimals(targetPrice));

        for (let i = 0; i <= days; i++) {
            const progress = i / days;
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const predictedPrice = currentPrice + (priceChange * easedProgress);

            data.push({
                day: i === 0 ? 'Today' : `Day ${i}`,
                price: parseFloat(predictedPrice.toFixed(decimals)),
                currentPrice: parseFloat(currentPrice.toFixed(decimals)),
                targetPrice: parseFloat(targetPrice.toFixed(decimals))
            });
        }
        return data;
    };

    // Fetch prediction
    const fetchPrediction = async (e) => {
        e.preventDefault();
        if (!symbol) { toast.warning('Please enter a symbol', 'Missing Symbol'); return; }

        setLoading(true);
        setPrediction(null);
        setLiveData(null);
        setDynamicConfidence(null);

        try {
            const payload = {
                symbol: symbol.toUpperCase(),
                days: parseInt(days)
            };

            if (dexInfo) {
                payload.assetType = 'dex';
                payload.network = dexInfo.network;
                payload.poolAddress = dexInfo.poolAddress;
                payload.contractAddress = dexInfo.contractAddress;
            }

            const response = await api.post('/predictions/predict', payload);

            const chartData = generateChartData(
                response.data.current_price,
                response.data.prediction.target_price,
                parseInt(days)
            );

            setPrediction({
                ...response.data,
                chartData,
                timestamp: new Date().toISOString()
            });

            setDynamicConfidence(response.data.liveConfidence || response.data.prediction.confidence);

            const signalStrength = response.data.prediction.signal_strength;
            const isActionable = response.data.prediction.is_actionable;

            if (response.data.isShared) {
                toast.info(`Joined live forecast for ${symbol.toUpperCase()}! ${response.data.viewCount || 1} users watching`, 'Live Forecast');
            } else if (!isActionable || signalStrength === 'weak') {
                toast.warning(
                    response.data.warning || `Low confidence signal for ${symbol.toUpperCase()} - no clear direction detected`,
                    'Weak Signal'
                );
            } else if (signalStrength === 'moderate') {
                toast.info(`Moderate signal for ${symbol.toUpperCase()} - proceed with caution`, 'Forecast Created');
            } else {
                toast.success(`Strong signal detected for ${symbol.toUpperCase()}!`, 'Forecast Ready');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to generate forecast';
            const errorType = error.response?.data?.error;
            if (errorType === 'Invalid symbol') {
                toast.warning(errorMessage, 'Symbol Not Found');
            } else {
                toast.error(errorMessage, 'Error');
            }
        } finally {
            setLoading(false);
        }
    };

    // Watchlist toggle
    const handleWatchlistToggle = async (sym) => {
        if (!sym) return;
        const s = sym.toUpperCase();
        try {
            if (watchlist.includes(s)) {
                await api.delete(`/watchlist/${s}`);
                setWatchlist(prev => prev.filter(x => x !== s));
                toast.success(`${s} removed from watchlist`, 'Removed');
            } else {
                await api.post('/watchlist', { symbol: s });
                setWatchlist(prev => [...prev, s]);
                toast.success(`${s} added to watchlist!`, 'Added');
            }
        } catch (error) {
            toast.error('Failed to update watchlist', 'Error');
        }
    };

    // Save prediction
    const handleSavePrediction = () => {
        if (!prediction) return;
        if (savedPredictions.some(p => p.symbol === prediction.symbol && p.prediction?.target_price === prediction.prediction?.target_price)) {
            toast.warning('Already saved!', 'Already Saved');
            return;
        }
        const saved = [...savedPredictions, { id: Date.now(), ...prediction, savedAt: new Date().toISOString() }];
        setSavedPredictions(saved);
        localStorage.setItem('savedPredictions', JSON.stringify(saved));
        toast.success('Forecast saved!', 'Saved');
    };

    // Delete saved prediction
    const handleDeleteSavedPrediction = (id) => {
        const updated = savedPredictions.filter(p => p.id !== id);
        setSavedPredictions(updated);
        localStorage.setItem('savedPredictions', JSON.stringify(updated));
        toast.success('Forecast removed', 'Deleted');
    };

    // Clear all saved
    const handleClearAllSaved = () => {
        if (window.confirm('Clear all saved forecasts?')) {
            setSavedPredictions([]);
            localStorage.removeItem('savedPredictions');
            toast.success('All cleared', 'Cleared');
        }
    };

    // View saved prediction
    const handleViewSavedPrediction = (saved) => {
        setPrediction(saved);
        setActiveTab('predict');
    };

    // Create Price Alert
    const handleCreateAlert = async (alertData) => {
        try {
            const payload = {
                type: alertData.type,
                symbol: alertData.symbol,
                assetType: alertData.assetType,
                targetPrice: alertData.targetPrice,
                percentChange: alertData.percentageChange,
                notifyVia: {
                    inApp: alertData.notificationMethods?.inApp ?? true,
                    email: alertData.notificationMethods?.email ?? false,
                    push: alertData.notificationMethods?.push ?? false
                }
            };
            await api.post('/alerts', payload);
            toast.success(`Alert created for ${alertData.symbol}!`, 'Alert Set');
            setShowAlertModal(false);
        } catch (error) {
            console.error('Create alert error:', error);
            toast.error(error.response?.data?.message || 'Failed to create alert', 'Error');
            throw error;
        }
    };

    // Share
    const handleShare = (platform) => {
        if (!prediction) return;
        const formattedPrice = formatPredictionPrice(prediction.prediction.target_price, prediction.symbol);
        const text = `AI forecast: ${prediction.symbol} ${prediction.prediction.direction} to ${formattedPrice}`;
        const url = window.location.href;
        let shareUrl = '';
        if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        else if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        else if (platform === 'copy') {
            navigator.clipboard.writeText(`${text}\n${url}`);
            toast.success('Copied!', 'Copied');
            setShowShareModal(false);
            return;
        }
        if (shareUrl) { window.open(shareUrl, '_blank'); setShowShareModal(false); }
    };

    // Export
    const handleExport = () => {
        if (!prediction) return;
        const blob = new Blob([JSON.stringify({
            symbol: prediction.symbol,
            currentPrice: prediction.current_price,
            targetPrice: prediction.prediction.target_price,
            direction: prediction.prediction.direction,
            change: prediction.prediction.price_change_percent,
            confidence: prediction.prediction.confidence,
            indicators: prediction.indicators,
            days,
            timestamp: new Date().toISOString()
        }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${prediction.symbol}_forecast.json`;
        a.click();
        toast.success('Exported!', 'Exported');
    };

    // Format date
    const formatSavedDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Get confidence message
    const getConfidenceMessage = (confidence) => {
        const capped = Math.min(95, confidence);
        if (capped >= 80) return { icon: CheckCircle, text: 'Very high confidence - Strong signal detected', color: '#10b981' };
        if (capped >= 65) return { icon: CheckCircle, text: 'Good confidence - Favorable conditions', color: '#10b981' };
        if (capped >= 50) return { icon: AlertTriangle, text: 'Moderate confidence - Mixed signals', color: '#f59e0b' };
        return { icon: XCircle, text: 'Low confidence - Proceed with caution', color: '#ef4444' };
    };

    // Get confidence label
    const getConfidenceLabel = (confidence) => {
        const capped = Math.min(95, confidence);
        if (capped >= 70) return `High Confidence (${capped.toFixed(0)}%)`;
        if (capped >= 50) return `Moderate Confidence (${capped.toFixed(0)}%)`;
        return `Low Confidence (${capped.toFixed(0)}%)`;
    };

    // Get direction label
    const getDirectionLabel = (direction) => {
        if (direction === 'UP') return 'Bullish Projection (Long Bias)';
        if (direction === 'DOWN') return 'Bearish Projection (Short Bias)';
        return 'No Clear Direction';
    };

    // Generate AI reasoning from indicators
    const generateReasoning = () => {
        if (!prediction?.indicators) return [];
        const indicators = prediction.indicators;
        const reasons = [];

        // Market Structure from Trend
        const trend = indicators['Trend'] || indicators['trend'] || indicators['SMA'] || indicators['EMA'];
        if (trend) {
            const signal = String(trend.signal || '').toUpperCase();
            reasons.push({
                label: 'Market Structure',
                text: signal === 'BUY' ? 'Price is trading above key moving averages, indicating an uptrend structure.'
                     : signal === 'SELL' ? 'Price is below key moving averages, suggesting a downtrend structure.'
                     : 'Price is consolidating near moving averages with no clear directional bias.',
                bullish: signal === 'BUY',
                bearish: signal === 'SELL'
            });
        }

        // Momentum from MACD
        const macd = indicators['MACD'] || indicators['macd'];
        if (macd) {
            const signal = String(macd.signal || '').toUpperCase();
            reasons.push({
                label: 'Momentum',
                text: signal === 'BUY' ? 'MACD shows bullish momentum with a positive crossover.'
                     : signal === 'SELL' ? 'MACD indicates bearish momentum with a negative crossover.'
                     : 'MACD is flat, showing neutral momentum.',
                bullish: signal === 'BUY',
                bearish: signal === 'SELL'
            });
        }

        // Volume
        const volume = indicators['Volume'] || indicators['volume'] || indicators['OBV'];
        if (volume) {
            const signal = String(volume.signal || '').toUpperCase();
            reasons.push({
                label: 'Volume',
                text: signal === 'BUY' ? 'Volume supports the move with above-average buying pressure.'
                     : signal === 'SELL' ? 'Selling volume is elevated, confirming distribution.'
                     : 'Volume is average with no strong conviction either way.',
                bullish: signal === 'BUY',
                bearish: signal === 'SELL'
            });
        }

        // Pattern from RSI / Bollinger
        const rsi = indicators['RSI'] || indicators['rsi'];
        const bollinger = indicators['Bollinger'] || indicators['bollinger'] || indicators['Bollinger Bands'];
        const patternSource = rsi || bollinger;
        if (patternSource) {
            const signal = String(patternSource.signal || '').toUpperCase();
            const val = patternSource.value;
            let text;
            if (rsi && val !== undefined) {
                text = val > 70 ? `RSI at ${typeof val === 'number' ? val.toFixed(1) : val} - overbought conditions may lead to a pullback.`
                     : val < 30 ? `RSI at ${typeof val === 'number' ? val.toFixed(1) : val} - oversold conditions suggest a potential bounce.`
                     : `RSI at ${typeof val === 'number' ? val.toFixed(1) : val} - within normal range.`;
            } else {
                text = signal === 'BUY' ? 'Technical patterns suggest a bullish setup.'
                     : signal === 'SELL' ? 'Technical patterns indicate bearish pressure.'
                     : 'No strong pattern detected at this time.';
            }
            reasons.push({
                label: 'Pattern',
                text,
                bullish: signal === 'BUY',
                bearish: signal === 'SELL'
            });
        }

        return reasons;
    };

    // Render indicators (max 6)
    const renderIndicators = () => {
        if (!prediction?.indicators || Object.keys(prediction.indicators).length === 0) {
            return (
                <NoIndicatorsMessage>
                    <AlertTriangle size={18} />
                    No technical indicators available for this forecast
                </NoIndicatorsMessage>
            );
        }

        const entries = Object.entries(prediction.indicators).slice(0, 6);

        return (
            <IndicatorsGrid>
                {entries.map(([name, data]) => {
                    const signal = data?.signal ? String(data.signal).toUpperCase() : 'NEUTRAL';
                    const value = data?.value !== undefined && data?.value !== null ? data.value : null;

                    return (
                        <IndicatorItem key={name} $signal={signal}>
                            <IndicatorInfo>
                                <IndicatorName>{name}</IndicatorName>
                                {value !== null && (
                                    <IndicatorNumericValue>
                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                    </IndicatorNumericValue>
                                )}
                            </IndicatorInfo>
                            <IndicatorSignal $signal={signal}>
                                {signal === 'BUY' ? <ArrowUp size={13} /> : signal === 'SELL' ? <ArrowDown size={13} /> : <ArrowRight size={13} />}
                                {signal === 'BUY' ? 'Bullish' : signal === 'SELL' ? 'Bearish' : 'Neutral'}
                            </IndicatorSignal>
                        </IndicatorItem>
                    );
                })}
            </IndicatorsGrid>
        );
    };

    const isUrgent = countdown.days === 0 && countdown.hours < 6;
    const confidenceMsg = dynamicConfidence !== null ? getConfidenceMessage(Math.min(95, dynamicConfidence)) : null;

    return (
        <PageContainer>
            {/* Share Modal */}
            {showShareModal && (
                <ModalOverlay onClick={() => setShowShareModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Share Forecast</ModalTitle>
                            <CloseButton onClick={() => setShowShareModal(false)}><X size={16} /></CloseButton>
                        </ModalHeader>
                        <ShareOptions>
                            <ShareOption onClick={() => handleShare('twitter')}><Twitter size={22} />Twitter</ShareOption>
                            <ShareOption onClick={() => handleShare('facebook')}><Facebook size={22} />Facebook</ShareOption>
                            <ShareOption onClick={() => handleShare('linkedin')}><Linkedin size={22} />LinkedIn</ShareOption>
                            <ShareOption onClick={() => handleShare('copy')}><Copy size={22} />Copy Link</ShareOption>
                        </ShareOptions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Header */}
            <Header>
                <Title>AI Market Forecast Engine</Title>
                <Subtitle>Generate data-driven price projections — fully tracked and measured in real time.</Subtitle>
            </Header>

            {/* Trust Strip */}
            <TrustStrip>
                <span>{platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}</span> forecasts tracked
                <span style={{ margin: '0 0.25rem' }}>|</span>
                <span>{platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}</span> win rate
                <span style={{ margin: '0 0.25rem' }}>|</span>
                All outcomes recorded — no edits
            </TrustStrip>

            {/* Tabs */}
            <TabsContainer>
                <Tab $active={activeTab === 'predict'} onClick={() => setActiveTab('predict')}>
                    <BarChart3 size={16} /> New Forecast
                </Tab>
                <Tab $active={activeTab === 'saved'} onClick={() => setActiveTab('saved')}>
                    <Bookmark size={16} /> Saved Forecasts ({savedPredictions.length})
                </Tab>
                <Tab $active={activeTab === 'history'} onClick={() => navigate('/prediction-history')}>
                    <Clock size={16} /> History
                </Tab>
            </TabsContainer>

            {/* Stats Banner */}
            <StatsBanner>
                <StatItem>Forecasts Tracked: <span>{platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}</span></StatItem>
                <StatItem>Win Rate: <span>{platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}</span></StatItem>
                <StatItem>Correct: <span>{platformStats.loading ? '...' : platformStats.correctPredictions.toLocaleString()}</span></StatItem>
                {!platformStats.loading && platformStats.accuracy > 50 && (
                    <EdgeBadge>Positive edge system</EdgeBadge>
                )}
            </StatsBanner>

            {/* PREDICT TAB */}
            {activeTab === 'predict' && (
                <>
                    <InputSection>
                        <InputHelperText>Generate a forecast with projected move, confidence range, and expected outcome.</InputHelperText>
                        <InputForm onSubmit={fetchPrediction}>
                            <InputGroup>
                                <FormField>
                                    <Label><BarChart3 size={16} /> Symbol</Label>
                                    <AutocompleteContainer>
                                        <Input
                                            value={symbol}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const isContractAddress = val.startsWith('0x') || /^[1-9A-HJ-NP-Za-km-z]{20,}$/.test(val);
                                                setSymbol(isContractAddress ? val : val.toUpperCase());
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            placeholder="Search symbol or paste contract address..."
                                            autoComplete="off"
                                        />
                                        {showSuggestions && (suggestions.length > 0 || searchLoading) && (
                                            <SuggestionsDropdown>
                                                {searchLoading ? (
                                                    <NoResults>Searching...</NoResults>
                                                ) : suggestions.length > 0 ? (
                                                    suggestions.map((s, idx) => (
                                                        <SuggestionItem
                                                            key={`${s.symbol}-${idx}`}
                                                            onMouseDown={() => handleSuggestionClick(s)}
                                                        >
                                                            <SuggestionLeft>
                                                                <SuggestionSymbol>
                                                                    {s.type === 'dex' ? s.symbol.split(':')[0] : s.symbol}
                                                                </SuggestionSymbol>
                                                                <SuggestionName>
                                                                    {s.name}
                                                                    {s.contractAddress && (
                                                                        <span style={{ opacity: 0.5, fontSize: '0.75em', marginLeft: '0.5rem' }}>
                                                                            {s.contractAddress.slice(0, 6)}...{s.contractAddress.slice(-4)}
                                                                        </span>
                                                                    )}
                                                                </SuggestionName>
                                                            </SuggestionLeft>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <SuggestionType $type={s.type}>{s.type}</SuggestionType>
                                                                {s.type === 'dex' && s.chain && (
                                                                    <SuggestionChain>{s.chain}</SuggestionChain>
                                                                )}
                                                            </div>
                                                        </SuggestionItem>
                                                    ))
                                                ) : (
                                                    <NoResults>No matches found</NoResults>
                                                )}
                                            </SuggestionsDropdown>
                                        )}
                                    </AutocompleteContainer>
                                    <ExampleText>Try: BTC, ETH, NVDA, SOL</ExampleText>
                                </FormField>
                                <FormField>
                                    <Label><Calendar size={16} /> Timeframe</Label>
                                    <Select value={days} onChange={e => setDays(e.target.value)}>
                                        <option value="7">7 Days (Short-term)</option>
                                        <option value="30">30 Days (Medium-term)</option>
                                        <option value="90">90 Days (Long-term)</option>
                                    </Select>
                                </FormField>
                            </InputGroup>
                            <PredictButton type="submit" disabled={loading || !symbol}>
                                {loading ? <><LoadingSpinner size={20} /> Analyzing...</> : <><Activity size={20} /> Run Forecast</>}
                            </PredictButton>
                        </InputForm>
                    </InputSection>

                    {/* Prediction Results */}
                    {prediction && (
                        <ResultsContainer>
                            <PredictionCard>
                                {/* Live Forecast Label */}
                                <ForecastLabel>
                                    <Radio size={16} />
                                    Live Forecast — Outcome Will Be Tracked
                                    <ForecastLabelSub>This projection is recorded and measured against actual price movement.</ForecastLabelSub>
                                </ForecastLabel>

                                {/* Shared prediction banner */}
                                {prediction.isShared && (
                                    <SharedPredictionBanner>
                                        <SharedBadgeLeft>
                                            <LiveDotLarge />
                                            <SharedText>
                                                <SharedTitle>
                                                    <Radio size={14} style={{ marginRight: '0.4rem' }} />
                                                    Live Forecast In Progress
                                                </SharedTitle>
                                                <SharedSubtitle>
                                                    {prediction.sharedMessage || 'You joined an active forecast for this symbol'}
                                                </SharedSubtitle>
                                            </SharedText>
                                        </SharedBadgeLeft>
                                        <ViewerCount>
                                            <Users size={16} />
                                            {prediction.viewCount || 1} watching
                                        </ViewerCount>
                                    </SharedPredictionBanner>
                                )}

                                {/* Live Status with Countdown */}
                                {liveData && (
                                    <LiveStatusCard>
                                        <LiveStatusHeader>
                                            <LiveStatusTitle>
                                                <LiveDot />
                                                Live Tracking Active
                                            </LiveStatusTitle>
                                            <CountdownDisplay>
                                                <CountdownUnit $urgent={isUrgent}>
                                                    <CountdownValue $urgent={isUrgent}>{String(countdown.days).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel>Days</CountdownLabel>
                                                </CountdownUnit>
                                                <CountdownSeparator>:</CountdownSeparator>
                                                <CountdownUnit $urgent={isUrgent}>
                                                    <CountdownValue $urgent={isUrgent}>{String(countdown.hours).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel>Hours</CountdownLabel>
                                                </CountdownUnit>
                                                <CountdownSeparator>:</CountdownSeparator>
                                                <CountdownUnit $urgent={isUrgent}>
                                                    <CountdownValue $urgent={isUrgent}>{String(countdown.minutes).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel>Min</CountdownLabel>
                                                </CountdownUnit>
                                                <CountdownSeparator>:</CountdownSeparator>
                                                <CountdownUnit $urgent={isUrgent}>
                                                    <CountdownValue $urgent={isUrgent}>{String(countdown.seconds).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel>Sec</CountdownLabel>
                                                </CountdownUnit>
                                            </CountdownDisplay>
                                        </LiveStatusHeader>

                                        {/* Dynamic Confidence */}
                                        {dynamicConfidence !== null && (
                                            <DynamicConfidenceCard $trend={confidenceTrend}>
                                                <ConfidenceHeader>
                                                    <ConfidenceTitle>
                                                        <Activity size={16} />
                                                        Live Confidence Score
                                                    </ConfidenceTitle>
                                                    {confidenceChange !== 0 && (
                                                        <ConfidenceChange $positive={confidenceChange > 0}>
                                                            {confidenceChange > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                                            {Math.abs(confidenceChange).toFixed(1)}%
                                                        </ConfidenceChange>
                                                    )}
                                                </ConfidenceHeader>
                                                <ConfidenceValueLarge $value={Math.min(95, dynamicConfidence)}>
                                                    {getConfidenceLabel(dynamicConfidence)}
                                                </ConfidenceValueLarge>
                                                <ConfidenceBarLarge>
                                                    <ConfidenceBarFill $value={Math.min(95, dynamicConfidence)} />
                                                </ConfidenceBarLarge>
                                                {confidenceMsg && (
                                                    <ConfidenceMessage>
                                                        <confidenceMsg.icon size={14} color={confidenceMsg.color} />
                                                        {confidenceMsg.text}
                                                    </ConfidenceMessage>
                                                )}
                                            </DynamicConfidenceCard>
                                        )}
                                    </LiveStatusCard>
                                )}

                                {/* Prediction Header */}
                                <PredictionHeader>
                                    <StockInfo>
                                        <StockSymbol>
                                            {prediction.symbol}
                                            <WatchlistStar onClick={() => handleWatchlistToggle(prediction.symbol)}>
                                                <Star size={20} fill={watchlist.includes(prediction.symbol?.toUpperCase()) ? '#f59e0b' : 'none'} color="#f59e0b" />
                                            </WatchlistStar>
                                        </StockSymbol>
                                        <CompanyName>{getAssetName(prediction.symbol)}</CompanyName>
                                        <CurrentPriceSection>
                                            <CurrentPriceLabel>Current:</CurrentPriceLabel>
                                            <CurrentPriceValue>
                                                {formatPredictionPrice(
                                                    liveData?.livePrice || liveData?.currentPrice || prediction.current_price,
                                                    prediction.symbol
                                                )}
                                            </CurrentPriceValue>
                                        </CurrentPriceSection>
                                    </StockInfo>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                        <DirectionBadge
                                            $up={prediction.prediction.direction === 'UP'}
                                            $neutral={prediction.prediction.direction === 'NEUTRAL'}
                                        >
                                            {prediction.prediction.direction === 'UP' ? (
                                                <TrendingUp size={22} />
                                            ) : prediction.prediction.direction === 'NEUTRAL' ? (
                                                <AlertTriangle size={22} />
                                            ) : (
                                                <TrendingDown size={22} />
                                            )}
                                            {getDirectionLabel(prediction.prediction.direction)}
                                        </DirectionBadge>
                                        {prediction.prediction.signal_strength && (
                                            <SignalStrengthBadge $strength={prediction.prediction.signal_strength}>
                                                {prediction.prediction.signal_strength === 'strong' ? (
                                                    <><Zap size={13} /> Strong Signal</>
                                                ) : prediction.prediction.signal_strength === 'moderate' ? (
                                                    <><Activity size={13} /> Moderate</>
                                                ) : (
                                                    <><AlertTriangle size={13} /> Weak Signal</>
                                                )}
                                            </SignalStrengthBadge>
                                        )}
                                    </div>
                                </PredictionHeader>

                                {/* Action Buttons */}
                                <ActionButtons>
                                    <ActionButton onClick={handleSavePrediction}><BookmarkPlus size={16} /> Save</ActionButton>
                                    <ActionButton onClick={() => setShowShareModal(true)}><Share2 size={16} /> Share</ActionButton>
                                    <ActionButton onClick={handleExport}><Download size={16} /> Export</ActionButton>
                                    <ActionButton onClick={() => setShowAlertModal(true)}><Bell size={16} /> Alert</ActionButton>
                                    <ActionButton onClick={() => { setSymbol(prediction.symbol); fetchPrediction({ preventDefault: () => {} }); }}>
                                        <RefreshCw size={16} /> Refresh
                                    </ActionButton>
                                </ActionButtons>

                                {/* Metrics Grid */}
                                <MetricsGrid>
                                    <MetricCard>
                                        <MetricIcon $variant="primary"><Target size={20} /></MetricIcon>
                                        <MetricLabel>Target Price</MetricLabel>
                                        <MetricValue>
                                            {formatPredictionPrice(prediction.prediction.target_price, prediction.symbol)}
                                        </MetricValue>
                                    </MetricCard>
                                    <MetricCard>
                                        <MetricIcon $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            <Percent size={20} />
                                        </MetricIcon>
                                        <MetricLabel>Price Change</MetricLabel>
                                        <MetricValue $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            {prediction.prediction.direction === 'UP' ? '+' : ''}{prediction.prediction.price_change_percent?.toFixed(2)}%
                                        </MetricValue>
                                    </MetricCard>
                                    <MetricCard>
                                        <MetricIcon $variant="warning"><DollarSign size={20} /></MetricIcon>
                                        <MetricLabel>Dollar Change</MetricLabel>
                                        <MetricValue $variant="warning">
                                            {prediction.prediction.direction === 'UP' ? '+' : ''}
                                            {formatPredictionPrice(
                                                Math.abs(prediction.prediction.target_price - prediction.current_price),
                                                prediction.symbol
                                            )}
                                        </MetricValue>
                                    </MetricCard>
                                    <MetricCard>
                                        <MetricIcon $variant="primary"><Award size={20} /></MetricIcon>
                                        <MetricLabel>Confidence</MetricLabel>
                                        <MetricValue>{getConfidenceLabel(prediction.prediction.confidence)}</MetricValue>
                                    </MetricCard>
                                </MetricsGrid>
                                <MetricsMicrocopy>Projection based on current data — not guaranteed outcome.</MetricsMicrocopy>

                                {/* AI Reasoning Section */}
                                {generateReasoning().length > 0 && (
                                    <ReasoningSection>
                                        <ReasoningTitle><Brain size={18} /> Why This Forecast</ReasoningTitle>
                                        <ReasoningGrid>
                                            {generateReasoning().map((reason, idx) => (
                                                <ReasoningItem key={idx} $bullish={reason.bullish} $bearish={reason.bearish}>
                                                    <ReasoningLabel>{reason.label}</ReasoningLabel>
                                                    <ReasoningText>{reason.text}</ReasoningText>
                                                </ReasoningItem>
                                            ))}
                                        </ReasoningGrid>
                                    </ReasoningSection>
                                )}

                                {/* Technical Indicators */}
                                <IndicatorsSection>
                                    <IndicatorsTitle>
                                        <BarChart3 size={18} /> Technical Indicators
                                    </IndicatorsTitle>
                                    {renderIndicators()}
                                </IndicatorsSection>

                                {/* Price Projection Chart */}
                                {prediction.chartData && (() => {
                                    const minPrice = Math.min(prediction.current_price, prediction.prediction.target_price);
                                    const maxPrice = Math.max(prediction.current_price, prediction.prediction.target_price);
                                    const padding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1;
                                    const yMin = Math.max(0, minPrice - padding);
                                    const yMax = maxPrice + padding;

                                    return (
                                        <ChartSection>
                                            <ChartTitle><Activity size={18} /> Price Projection</ChartTitle>
                                            <ChartSubtitle>Projected range — not exact path</ChartSubtitle>
                                            <ResponsiveContainer width="100%" height={320}>
                                                <AreaChart data={prediction.chartData} margin={{ top: 16, right: 24, left: 8, bottom: 16 }}>
                                                    <defs>
                                                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                                                            <stop offset="100%" stopColor={prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444'} stopOpacity={0.03} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                    <XAxis
                                                        dataKey="day"
                                                        tick={{ fill: '#64748b', fontSize: 11 }}
                                                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                                    />
                                                    <YAxis
                                                        domain={[yMin, yMax]}
                                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                                        axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                                        tickFormatter={v => formatPredictionPrice(v, prediction.symbol)}
                                                        width={100}
                                                        tickCount={6}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(12, 16, 32, 0.95)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '8px',
                                                            color: '#e0e6ed'
                                                        }}
                                                        formatter={(value) => [formatPredictionPrice(value, prediction.symbol), 'Projected Price']}
                                                        labelFormatter={(label) => label}
                                                    />
                                                    <ReferenceLine
                                                        y={prediction.current_price}
                                                        stroke="#00adef"
                                                        strokeDasharray="5 5"
                                                        label={{ value: 'Current', fill: '#00adef', fontSize: 11, position: 'left' }}
                                                    />
                                                    <ReferenceLine
                                                        y={prediction.prediction.target_price}
                                                        stroke={prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444'}
                                                        strokeDasharray="5 5"
                                                        label={{ value: 'Target', fill: prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444', fontSize: 11, position: 'right' }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="price"
                                                        stroke={prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444'}
                                                        strokeWidth={2}
                                                        fill="url(#priceGradient)"
                                                        dot={{ fill: prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444', strokeWidth: 1, r: 3 }}
                                                        activeDot={{ r: 5, strokeWidth: 1 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                            <ChartLegend>
                                                <LegendItem><LegendColor color={prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444'} /><LegendText>Projected Price Path</LegendText></LegendItem>
                                                <LegendItem><LegendColor color="#00adef" /><LegendText>Current Price</LegendText></LegendItem>
                                            </ChartLegend>
                                        </ChartSection>
                                    );
                                })()}

                                {/* Historical Validation Section */}
                                <ValidationSection>
                                    <ValidationTitle><Award size={18} /> Similar Forecast Performance</ValidationTitle>
                                    <ValidationStats>
                                        <ValidationStat>
                                            <span>Platform Win Rate</span>
                                            <span>{platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}</span>
                                        </ValidationStat>
                                        <ValidationStat>
                                            <span>Total Tracked</span>
                                            <span>{platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}</span>
                                        </ValidationStat>
                                    </ValidationStats>
                                    <ValidationDisclaimer>
                                        Based on {platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()} tracked forecasts. Past performance does not guarantee future results.
                                    </ValidationDisclaimer>
                                </ValidationSection>

                                {/* Action CTAs */}
                                <CTASection>
                                    <CTAButton $primary onClick={() => navigate('/signals')}>
                                        <Target size={16} /> Track This Forecast
                                    </CTAButton>
                                    <CTAButton onClick={() => navigate('/paper-trading', {
                                        state: {
                                            symbol: prediction.symbol,
                                            direction: prediction.prediction.direction,
                                            targetPrice: prediction.prediction.target_price,
                                            currentPrice: prediction.current_price
                                        }
                                    })}>
                                        <BarChart3 size={16} /> Convert to Trade Setup
                                    </CTAButton>
                                </CTASection>

                                {/* Trust Line */}
                                <TrustLine>
                                    Every forecast is tracked publicly — win or lose. No edits. No cherry-picking.
                                </TrustLine>
                            </PredictionCard>
                        </ResultsContainer>
                    )}

                    {/* Empty State */}
                    {!prediction && !loading && (
                        <EmptyState>
                            <EmptyIcon><BarChart3 size={48} color="#00adef" /></EmptyIcon>
                            <EmptyTitle>Ready to Forecast</EmptyTitle>
                            <EmptyText>Enter a stock, crypto, or DEX token symbol above to generate an AI-powered price forecast</EmptyText>
                        </EmptyState>
                    )}
                </>
            )}

            {/* SAVED TAB */}
            {activeTab === 'saved' && (
                <SavedPredictionsContainer>
                    {savedPredictions.length > 0 && (
                        <ClearAllButton onClick={handleClearAllSaved}>
                            <Trash2 size={16} /> Clear All Saved
                        </ClearAllButton>
                    )}

                    {savedPredictions.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon><Bookmark size={48} color="#00adef" /></EmptyIcon>
                            <EmptyTitle>No Saved Forecasts</EmptyTitle>
                            <EmptyText>Save forecasts to track them here</EmptyText>
                        </EmptyState>
                    ) : (
                        <SavedPredictionsGrid>
                            {savedPredictions.map(saved => (
                                <SavedPredictionCard key={saved.id} $up={saved.prediction?.direction === 'UP'}>
                                    <SavedCardHeader>
                                        <SavedSymbol>{saved.symbol}</SavedSymbol>
                                        <SavedDirection $up={saved.prediction?.direction === 'UP'}>
                                            {saved.prediction?.direction === 'UP' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {saved.prediction?.direction}
                                        </SavedDirection>
                                    </SavedCardHeader>
                                    <SavedCardBody>
                                        <SavedMetric>
                                            <SavedMetricLabel>Target</SavedMetricLabel>
                                            <SavedMetricValue>
                                                {formatPredictionPrice(saved.prediction?.target_price, saved.symbol)}
                                            </SavedMetricValue>
                                        </SavedMetric>
                                        <SavedMetric>
                                            <SavedMetricLabel>Change</SavedMetricLabel>
                                            <SavedMetricValue>
                                                {saved.prediction?.direction === 'UP' ? '+' : ''}{saved.prediction?.price_change_percent?.toFixed(2)}%
                                            </SavedMetricValue>
                                        </SavedMetric>
                                        <SavedMetric>
                                            <SavedMetricLabel>Confidence</SavedMetricLabel>
                                            <SavedMetricValue>{getConfidenceLabel(saved.prediction?.confidence || 0)}</SavedMetricValue>
                                        </SavedMetric>
                                        <SavedMetric>
                                            <SavedMetricLabel>Entry Price</SavedMetricLabel>
                                            <SavedMetricValue>
                                                {formatPredictionPrice(saved.current_price, saved.symbol)}
                                            </SavedMetricValue>
                                        </SavedMetric>
                                    </SavedCardBody>
                                    <SavedCardFooter>
                                        <SavedDate>
                                            <Calendar size={13} />
                                            {formatSavedDate(saved.savedAt || saved.timestamp)}
                                        </SavedDate>
                                        <SavedActions>
                                            <SavedActionButton onClick={() => handleViewSavedPrediction(saved)} title="View">
                                                <Eye size={14} />
                                            </SavedActionButton>
                                            <SavedActionButton $danger onClick={() => handleDeleteSavedPrediction(saved.id)} title="Delete">
                                                <Trash2 size={14} />
                                            </SavedActionButton>
                                        </SavedActions>
                                    </SavedCardFooter>
                                </SavedPredictionCard>
                            ))}
                        </SavedPredictionsGrid>
                    )}
                </SavedPredictionsContainer>
            )}

            {/* Alert Modal */}
            <CreateAlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                onSubmit={handleCreateAlert}
                initialSymbol={prediction?.symbol || ''}
                initialPrice={prediction?.current_price}
            />

            {/* Upgrade Prompt */}
            <UpgradePrompt
                isOpen={showUpgradePrompt}
                onClose={() => setShowUpgradePrompt(false)}
                feature="dailySignals"
                requiredPlan="starter"
            />
        </PageContainer>
    );
};

export default PredictionsPage;
