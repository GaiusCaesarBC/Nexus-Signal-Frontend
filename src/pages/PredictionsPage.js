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
const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 4px rgba(16,185,129,0.3); }
    50% { box-shadow: 0 0 12px rgba(16,185,129,0.6); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 80px 2rem 2rem;
    background: transparent;
    color: #e0e6ed;
    position: relative;
    @media(max-width:768px){padding:80px 1rem 1.5rem;}
    @media(max-width:480px){padding:70px .75rem 1rem;}
    overflow-x: hidden;
    z-index: 1;
`;

// --- Header ---
const HeaderRow = styled.div`
    max-width: 900px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    animation: ${fadeIn} 0.5s ease-out;
    @media(max-width:768px){flex-direction:column;text-align:center;}
`;
const HeaderLeft = styled.div``;
const Title = styled.h1`
    font-size: 1.6rem;
    color: #e0e6ed;
    font-weight: 700;
    margin: 0 0 0.2rem 0;
    @media(max-width:768px){font-size:1.35rem;}
`;
const Subtitle = styled.p`
    color: #64748b;
    font-size: 0.85rem;
    margin: 0;
`;
const TrustStripInline = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: #64748b;
    span { color: #e0e6ed; font-weight: 600; }
    @media(max-width:768px){justify-content:center;}
`;
const TrustDivider = styled.span`color:rgba(100,116,139,.3);font-size:0.55rem;`;
const EdgeBadge = styled.span`
    padding: 0.15rem 0.5rem;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 5px;
    color: #10b981;
    font-size: 0.72rem;
    font-weight: 600;
`;

// --- Tabs ---
const TabsContainer = styled.div`
    max-width: 900px;
    margin: 0 auto 1.25rem;
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    animation: ${fadeIn} 0.5s ease-out 0.05s both;
`;
const Tab = styled.button`
    padding: 0.5rem 1rem;
    background: ${p => p.$active ? 'rgba(0,173,239,0.1)' : 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$active ? 'rgba(0,173,239,0.35)' : 'rgba(255,255,255,.06)'};
    border-radius: 7px;
    color: ${p => p.$active ? '#00adef' : '#64748b'};
    font-weight: 600;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    white-space: nowrap;
    &:hover { border-color: rgba(0,173,239,0.35); color: #00adef; }
`;

// --- Input Section ---
const InputSection = styled.div`
    max-width: 800px;
    margin: 0 auto 1.5rem;
    background: rgba(12,16,32,.92);
    border: 1px solid rgba(0,173,239,0.15);
    border-radius: 12px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;
    position: relative;
    z-index: 10;
`;
const InputHelperText = styled.p`
    color: #64748b;
    font-size: 0.82rem;
    margin: 0 0 1rem 0;
`;
const InputForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;
const InputGroup = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    @media(max-width:768px){grid-template-columns:1fr;}
`;
const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;
const Label = styled.label`
    color: #94a3b8;
    font-size: 0.82rem;
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
const Input = styled.input`
    padding: 0.75rem 0.9rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 7px;
    color: #e0e6ed;
    font-size: 0.95rem;
    font-weight: 600;
    text-transform: uppercase;
    transition: border-color 0.2s ease;
    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0,173,239,0.12);
    }
    &::placeholder { color: #475569; text-transform: none; }
`;
const ExampleText = styled.p`
    color: #475569;
    font-size: 0.72rem;
    margin: 0;
`;
const Select = styled.select`
    padding: 0.75rem 0.9rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 7px;
    color: #e0e6ed;
    font-size: 0.95rem;
    font-weight: 600;
    transition: border-color 0.2s ease;
    cursor: pointer;
    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0,173,239,0.12);
    }
    option { background: #0c1020; color: #e0e6ed; }
`;
const PredictButton = styled.button`
    padding: 0.85rem 1.75rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0,173,239,0.3);
    }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const LoadingSpinner = styled(RefreshCw)`
    animation: ${spin} 1s linear infinite;
`;

// --- Suggestions Dropdown ---
const SuggestionsDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(12,16,32,0.98);
    border: 1px solid rgba(0,173,239,0.25);
    border-radius: 8px;
    margin-top: 4px;
    max-height: 260px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
    &::-webkit-scrollbar-thumb { background: rgba(0,173,239,0.3); border-radius: 3px; }
`;
const SuggestionItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.9rem;
    cursor: pointer;
    transition: background 0.15s ease;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(0,173,239,0.08); }
`;
const SuggestionLeft = styled.div`display:flex;align-items:center;gap:0.6rem;`;
const SuggestionSymbol = styled.span`font-weight:700;font-size:0.9rem;color:#e0e6ed;`;
const SuggestionName = styled.span`font-size:0.75rem;color:#64748b;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
const SuggestionType = styled.span`
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.12rem 0.4rem;
    border-radius: 4px;
    text-transform: uppercase;
    background: ${p => p.$type === 'crypto' ? 'rgba(245,158,11,0.15)' : p.$type === 'dex' ? 'rgba(16,185,129,0.15)' : 'rgba(0,173,239,0.15)'};
    color: ${p => p.$type === 'crypto' ? '#f59e0b' : p.$type === 'dex' ? '#10b981' : '#00adef'};
`;
const SuggestionChain = styled.span`
    font-size: 0.6rem;
    font-weight: 500;
    padding: 0.08rem 0.3rem;
    border-radius: 3px;
    text-transform: uppercase;
    background: rgba(139,92,246,0.1);
    color: #8b5cf6;
    margin-left: 0.2rem;
`;
const NoResults = styled.div`padding:0.85rem;text-align:center;color:#64748b;font-size:0.85rem;`;

// --- Results Container ---
const ResultsContainer = styled.div`
    max-width: 900px;
    margin: 0 auto;
    animation: ${fadeIn} 0.4s ease-out;
`;
const Card = styled.div`
    background: rgba(12,16,32,.92);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
`;

// --- Forecast Label ---
const ForecastLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.85rem;
    background: rgba(0,173,239,0.07);
    border: 1px solid rgba(0,173,239,0.18);
    border-radius: 7px;
    margin-bottom: 1.25rem;
    font-size: 0.8rem;
    color: #00adef;
    font-weight: 600;
`;
const ForecastLabelSub = styled.span`
    color: #64748b;
    font-weight: 400;
    margin-left: 0.4rem;
    font-size: 0.75rem;
`;

// --- Signal Potential Module ---
const SignalPotentialCard = styled.div`
    padding: 1rem 1.25rem;
    border-radius: 10px;
    margin-bottom: 1.25rem;
    background: ${p => p.$level === 'high' ? 'rgba(16,185,129,0.06)' : p.$level === 'moderate' ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)'};
    border: 1px solid ${p => p.$level === 'high' ? 'rgba(16,185,129,0.2)' : p.$level === 'moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'};
    border-left: 3px solid ${p => p.$level === 'high' ? '#10b981' : p.$level === 'moderate' ? '#f59e0b' : '#64748b'};
`;
const SignalPotentialTitle = styled.div`
    font-size: 0.85rem;
    font-weight: 700;
    color: ${p => p.$color || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.3rem;
`;
const SignalPotentialText = styled.div`
    font-size: 0.78rem;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 0.5rem;
`;
const SignalPotentialCTA = styled.button`
    padding: 0.4rem 0.85rem;
    background: ${p => p.$color || '#10b981'}15;
    border: 1px solid ${p => p.$color || '#10b981'}30;
    border-radius: 6px;
    color: ${p => p.$color || '#10b981'};
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 0.2s ease;
    &:hover { background: ${p => p.$color || '#10b981'}25; }
`;

// --- Shared Prediction Banner ---
const SharedPredictionBanner = styled.div`
    background: rgba(239,68,68,0.05);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 8px;
    padding: 0.65rem 1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
`;
const SharedBadgeLeft = styled.div`display:flex;align-items:center;gap:0.6rem;`;
const LiveDotLarge = styled.div`
    width: 10px;
    height: 10px;
    background: #ef4444;
    border-radius: 50%;
    box-shadow: 0 0 6px #ef4444;
`;
const SharedText = styled.div`display:flex;flex-direction:column;gap:0.1rem;`;
const SharedTitle = styled.span`font-size:0.85rem;font-weight:700;color:#ef4444;display:flex;align-items:center;`;
const SharedSubtitle = styled.span`font-size:0.72rem;color:#64748b;`;
const ViewerCount = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    background: rgba(12,16,32,0.6);
    border-radius: 14px;
    font-size: 0.72rem;
    color: #e0e6ed;
    svg { color: #00adef; }
`;

// --- Live Status / Countdown (compact) ---
const LiveStatusCard = styled.div`
    background: rgba(12,16,32,0.5);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    padding: 0.85rem 1rem;
    margin-bottom: 1.25rem;
`;
const LiveStatusHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
`;
const LiveStatusTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #e0e6ed;
`;
const LiveDot = styled.div`
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: ${pulseGlow} 2s ease-in-out infinite;
`;
const CountdownDisplay = styled.div`display:flex;align-items:center;gap:0.3rem;`;
const CountdownUnit = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.3rem 0.5rem;
    background: rgba(12,16,32,0.7);
    border-radius: 6px;
    border: 1px solid ${p => p.$urgent ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,.05)'};
    min-width: 42px;
`;
const CountdownValue = styled.div`
    font-size: 1rem;
    font-weight: 800;
    color: ${p => p.$urgent ? '#ef4444' : '#e0e6ed'};
`;
const CountdownLabel = styled.div`
    font-size: 0.55rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.4px;
`;
const CountdownSeparator = styled.span`font-size:0.9rem;color:#475569;font-weight:700;`;

// --- Badge Row ---
const BadgeRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
`;
const DirectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.85rem;
    background: ${p => p.$neutral ? 'rgba(245,158,11,0.08)' : p.$up ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'};
    border: 1px solid ${p => p.$neutral ? 'rgba(245,158,11,0.25)' : p.$up ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'};
    border-radius: 8px;
    color: ${p => p.$neutral ? '#f59e0b' : p.$up ? '#10b981' : '#ef4444'};
    font-size: 0.85rem;
    font-weight: 700;
`;
const ConvictionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.7rem;
    background: ${p => p.$color || '#64748b'}12;
    border: 1px solid ${p => p.$color || '#64748b'}25;
    border-radius: 6px;
    color: ${p => p.$color || '#64748b'};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
`;
const SignalPotentialBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.7rem;
    background: ${p => p.$level === 'high' ? 'rgba(16,185,129,0.1)' : p.$level === 'moderate' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)'};
    border: 1px solid ${p => p.$level === 'high' ? 'rgba(16,185,129,0.25)' : p.$level === 'moderate' ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'};
    border-radius: 6px;
    color: ${p => p.$level === 'high' ? '#10b981' : p.$level === 'moderate' ? '#f59e0b' : '#64748b'};
    font-size: 0.72rem;
    font-weight: 600;
`;

// --- Prediction Header ---
const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
    @media(max-width:768px){flex-direction:column;gap:0.75rem;}
`;
const StockInfo = styled.div``;
const StockSymbol = styled.h2`
    font-size: 1.6rem;
    font-weight: 800;
    color: #e0e6ed;
    margin: 0 0 0.15rem 0;
    display: flex;
    align-items: center;
    gap: 0.6rem;
`;
const CompanyName = styled.div`color:#64748b;font-size:0.82rem;font-weight:500;`;
const CurrentPriceSection = styled.div`display:flex;align-items:baseline;gap:0.4rem;margin-top:0.35rem;`;
const CurrentPriceLabel = styled.span`color:#64748b;font-size:0.78rem;`;
const CurrentPriceValue = styled.span`color:#e0e6ed;font-size:1.2rem;font-weight:700;`;
const WatchlistStar = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.15rem;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;
    &:hover { transform: scale(1.15); }
`;

// --- Compact Confidence ---
const CompactConfidence = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    padding: 0.5rem 0.85rem;
    border-radius: 7px;
    margin-top: 0.6rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid ${p => `${p.$color || '#64748b'}25`};
`;
const CompactConfLabel = styled.div`font-size:0.78rem;font-weight:700;color:#e0e6ed;white-space:nowrap;`;
const CompactConfBar = styled.div`flex:1;min-width:70px;height:3px;background:rgba(255,255,255,0.04);border-radius:2px;overflow:hidden;`;
const CompactConfFill = styled.div`height:100%;width:${p=>p.$w||0}%;background:${p=>p.$color||'#64748b'};border-radius:2px;transition:width 0.5s;`;
const CompactConfChange = styled.span`
    font-size:0.7rem;font-weight:600;display:flex;align-items:center;gap:0.12rem;
    color:${p => p.$positive ? '#10b981' : '#ef4444'};
`;

// --- Metrics ---
const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
`;
const MetricCard = styled.div`
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 8px;
    padding: 1rem;
    animation: ${fadeIn} 0.4s ease-out;
`;
const MetricIcon = styled.div`
    width: 34px;
    height: 34px;
    border-radius: 7px;
    background: ${p => p.$variant === 'success' ? 'rgba(16,185,129,0.1)' : p.$variant === 'danger' ? 'rgba(239,68,68,0.1)' : p.$variant === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(0,173,239,0.1)'};
    color: ${p => p.$variant === 'success' ? '#10b981' : p.$variant === 'danger' ? '#ef4444' : p.$variant === 'warning' ? '#f59e0b' : '#00adef'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
`;
const MetricLabel = styled.div`color:#64748b;font-size:0.72rem;margin-bottom:0.2rem;`;
const MetricValue = styled.div`
    font-size: 1.25rem;
    font-weight: 800;
    color: ${p => p.$variant === 'success' ? '#10b981' : p.$variant === 'danger' ? '#ef4444' : p.$variant === 'warning' ? '#f59e0b' : '#e0e6ed'};
`;
const MetricsMicrocopy = styled.p`
    color: #475569;
    font-size: 0.68rem;
    margin: -0.25rem 0 1rem 0;
    font-style: italic;
`;

// --- Recommendation ---
const RecommendationBlock = styled.div`
    padding: 0.85rem 1.1rem;
    border-radius: 8px;
    margin-bottom: 1.25rem;
    background: ${p => `${p.$color || '#64748b'}08`};
    border: 1px solid ${p => `${p.$color || '#64748b'}1a`};
    border-left: 3px solid ${p => p.$color || '#64748b'};
`;
const RecommendationTitle = styled.div`
    font-size: 0.85rem;
    font-weight: 700;
    color: ${p => p.$color || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
`;
const RecommendationText = styled.div`font-size:0.78rem;color:#94a3b8;line-height:1.5;`;

// --- Reasoning ---
const ReasoningSection = styled.div`
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
`;
const SectionTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.85rem 0;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;
const ReasoningGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    @media(max-width:768px){grid-template-columns:1fr;}
`;
const ReasoningItem = styled.div`
    padding: 0.65rem 0.85rem;
    background: rgba(12,16,32,0.5);
    border-radius: 7px;
    border-left: 3px solid ${p => p.$bullish ? '#10b981' : p.$bearish ? '#ef4444' : '#f59e0b'};
`;
const ReasoningLabel = styled.div`
    color: #64748b;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.15rem;
`;
const ReasoningText = styled.div`color:#e0e6ed;font-size:0.82rem;font-weight:500;`;

// --- Technical Indicators ---
const IndicatorsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.6rem;
`;
const IndicatorItem = styled.div`
    background: rgba(255,255,255,0.03);
    border: 1px solid ${p => p.$signal === 'BUY' ? 'rgba(16,185,129,0.18)' : p.$signal === 'SELL' ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,.06)'};
    border-radius: 7px;
    padding: 0.6rem 0.85rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
const IndicatorInfo = styled.div`display:flex;flex-direction:column;gap:1px;`;
const IndicatorName = styled.span`color:#e0e6ed;font-size:0.82rem;font-weight:600;`;
const IndicatorNumericValue = styled.span`color:#475569;font-size:0.68rem;`;
const IndicatorSignal = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    font-weight: 700;
    font-size: 0.72rem;
    background: ${p => p.$signal === 'BUY' ? 'rgba(16,185,129,0.1)' : p.$signal === 'SELL' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'};
    color: ${p => p.$signal === 'BUY' ? '#10b981' : p.$signal === 'SELL' ? '#ef4444' : '#f59e0b'};
`;
const NoIndicatorsMessage = styled.div`
    padding: 1rem;
    background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 7px;
    color: #64748b;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    font-size: 0.82rem;
`;
const TechSummaryLine = styled.div`
    padding: 0.4rem 0.65rem;
    border-radius: 5px;
    margin-bottom: 0.6rem;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
    font-size: 0.75rem;
    font-weight: 600;
    color: ${p => p.$color || '#94a3b8'};
`;

// --- Chart ---
const ChartSection = styled.div`
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
`;
const ChartSubtitle = styled.p`
    color: #475569;
    font-size: 0.68rem;
    margin: 0 0 1rem 0;
    font-style: italic;
`;
const ChartLegend = styled.div`display:flex;justify-content:center;gap:1.25rem;margin-top:0.6rem;`;
const LegendItem = styled.div`display:flex;align-items:center;gap:0.35rem;`;
const LegendColor = styled.div`width:14px;height:14px;background:${p => p.color};border-radius:3px;`;
const LegendText = styled.span`color:#64748b;font-size:0.72rem;`;

// --- Validation ---
const ValidationSection = styled.div`
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
`;
const ValidationStats = styled.div`display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:0.5rem;`;
const ValidationStat = styled.div`
    span:first-child { color:#64748b;font-size:0.72rem;display:block;margin-bottom:0.1rem; }
    span:last-child { color:#e0e6ed;font-size:1.1rem;font-weight:800; }
`;
const ValidationDisclaimer = styled.p`color:#475569;font-size:0.68rem;margin:0;font-style:italic;`;
const MarketRegimeTag = styled.span`
    padding: 0.2rem 0.6rem;
    border-radius: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    background: ${p => p.$regime === 'trending' ? 'rgba(0,173,239,0.1)' : p.$regime === 'volatile' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)'};
    border: 1px solid ${p => p.$regime === 'trending' ? 'rgba(0,173,239,0.25)' : p.$regime === 'volatile' ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'};
    color: ${p => p.$regime === 'trending' ? '#00adef' : p.$regime === 'volatile' ? '#f59e0b' : '#64748b'};
`;

// --- Info Strip ---
const InfoStrip = styled.div`
    max-width: 900px;
    margin: 0 auto 1.25rem;
    padding: 0.6rem 1rem;
    background: rgba(12,16,32,.92);
    border: 1px solid rgba(255,255,255,.05);
    border-radius: 8px;
    color: #64748b;
    font-size: 0.72rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    animation: ${fadeIn} 0.5s ease-out 0.15s both;
    span { color: #94a3b8; font-weight: 600; }
`;

// --- Action Row ---
const ActionRow = styled.div`
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
    @media(max-width:768px){justify-content:center;}
`;
const ActionButton = styled.button`
    padding: 0.4rem 0.7rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 6px;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 600;
    font-size: 0.78rem;
    transition: all 0.2s ease;
    &:hover { background: rgba(255,255,255,0.07); color: #e0e6ed; }
`;
const CTAButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${p => p.$primary ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'rgba(255,255,255,0.04)'};
    border: 1px solid ${p => p.$primary ? 'transparent' : 'rgba(255,255,255,0.08)'};
    border-radius: 7px;
    color: ${p => p.$primary ? '#fff' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.82rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.2s ease;
    &:hover {
        transform: translateY(-1px);
        ${p => p.$primary ? 'box-shadow: 0 4px 14px rgba(0,173,239,0.25);' : 'background: rgba(255,255,255,0.07); color: #e0e6ed;'}
    }
`;

// --- Trust Line ---
const TrustLine = styled.div`
    text-align: center;
    padding: 0.75rem;
    color: #475569;
    font-size: 0.72rem;
    font-style: italic;
`;

// --- Empty State ---
const EmptyStateContainer = styled.div`
    max-width: 900px;
    margin: 0 auto;
    animation: ${fadeIn} 0.4s ease-out;
`;
const EmptyHero = styled.div`
    text-align: center;
    padding: 2rem 1.5rem 1.5rem;
`;
const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    background: rgba(0,173,239,0.07);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(0,173,239,0.18);
`;
const EmptyTitle = styled.h2`
    color: #e0e6ed;
    font-size: 1.2rem;
    margin: 0 0 0.35rem 0;
    font-weight: 700;
`;
const EmptyText = styled.p`
    color: #64748b;
    font-size: 0.85rem;
    margin: 0 0 1.5rem 0;
`;

// Example cards for empty state
const ExampleCardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    @media(max-width:768px){grid-template-columns:1fr;}
`;
const ExampleCard = styled.div`
    background: rgba(12,16,32,.92);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    padding: 1rem;
    border-top: 2px solid ${p => p.$color || '#00adef'};
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover { border-color: rgba(255,255,255,.12); transform: translateY(-2px); }
`;
const ExampleSymbol = styled.div`font-size:1.1rem;font-weight:800;color:#e0e6ed;margin-bottom:0.2rem;`;
const ExampleName = styled.div`font-size:0.72rem;color:#64748b;margin-bottom:0.5rem;`;
const ExampleMeta = styled.div`
    display: flex;
    gap: 0.5rem;
    font-size: 0.72rem;
`;
const ExampleChip = styled.span`
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    background: ${p => p.$color || 'rgba(255,255,255,0.04)'};
    color: ${p => p.$textColor || '#94a3b8'};
    font-weight: 600;
`;

// How it works strip
const HowItWorksStrip = styled.div`
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 1rem;
`;
const HowStep = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.72rem;
    color: #64748b;
`;
const StepNumber = styled.span`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(0,173,239,0.1);
    color: #00adef;
    font-size: 0.6rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const StepArrow = styled.span`color:rgba(100,116,139,.3);font-size:0.7rem;`;

// --- Modals ---
const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: ${fadeIn} 0.2s ease-out;
    padding: 1rem;
`;
const ModalContent = styled.div`
    background: rgba(12,16,32,0.98);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 440px;
    width: 100%;
    animation: ${fadeIn} 0.3s ease-out;
`;
const ModalHeader = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;`;
const ModalTitle = styled.h3`color:#e0e6ed;font-size:1.1rem;font-weight:700;margin:0;`;
const CloseButton = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover { background: rgba(239,68,68,0.2); }
`;
const ShareOptions = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;`;
const ShareOption = styled.button`
    padding: 0.75rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    font-weight: 600;
    font-size: 0.78rem;
    transition: all 0.2s ease;
    &:hover { background: rgba(255,255,255,0.07); color: #e0e6ed; }
`;

// --- Saved Predictions ---
const SavedPredictionsContainer = styled.div`max-width:900px;margin:0 auto;`;
const SavedPredictionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
    animation: ${fadeIn} 0.4s ease-out;
`;
const SavedPredictionCard = styled.div`
    background: rgba(12,16,32,.92);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    padding: 1rem;
    transition: border-color 0.2s ease;
    position: relative;
    overflow: hidden;
    &:hover { border-color: rgba(255,255,255,.12); }
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: ${p => p.$up ? '#10b981' : '#ef4444'};
    }
`;
const SavedCardHeader = styled.div`display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.6rem;`;
const SavedSymbol = styled.div`font-size:1.25rem;font-weight:800;color:#e0e6ed;`;
const SavedDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    background: ${p => p.$up ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'};
    border: 1px solid ${p => p.$up ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};
    border-radius: 5px;
    color: ${p => p.$up ? '#10b981' : '#ef4444'};
    font-weight: 700;
    font-size: 0.72rem;
`;
const SavedCardBody = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
`;
const SavedMetric = styled.div`
    background: rgba(255,255,255,0.02);
    border-radius: 5px;
    padding: 0.5rem;
`;
const SavedMetricLabel = styled.div`color:#64748b;font-size:0.68rem;margin-bottom:0.1rem;`;
const SavedMetricValue = styled.div`color:#e0e6ed;font-size:0.9rem;font-weight:700;`;
const SavedCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255,255,255,.04);
`;
const SavedDate = styled.div`color:#475569;font-size:0.72rem;display:flex;align-items:center;gap:0.3rem;`;
const SavedActions = styled.div`display:flex;gap:0.3rem;`;
const SavedActionButton = styled.button`
    padding: 0.3rem;
    background: ${p => p.$danger ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)'};
    border: 1px solid ${p => p.$danger ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,.06)'};
    border-radius: 5px;
    color: ${p => p.$danger ? '#ef4444' : '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    &:hover { transform: scale(1.05); }
`;
const ClearAllButton = styled.button`
    padding: 0.5rem 1rem;
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 7px;
    color: #ef4444;
    font-weight: 600;
    font-size: 0.78rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 1rem;
    &:hover { background: rgba(239,68,68,0.12); }
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

    // ═══════════════════════════════════════════════════════════
    // CONVICTION ENGINE — derives realistic confidence from actual indicators
    // This is the single source of truth for all labels on the page
    // ═══════════════════════════════════════════════════════════
    const computeConviction = useCallback((pred) => {
        if (!pred) return null;
        const indicators = pred.indicators || {};
        const entries = Object.entries(indicators);
        const apiConf = Math.min(95, pred.prediction?.confidence || 50);
        const direction = pred.prediction?.direction || 'NEUTRAL';
        const signalStrength = pred.prediction?.signal_strength || 'weak';

        // Count actual indicator signals
        let buyCount = 0, sellCount = 0, neutralCount = 0;
        entries.forEach(([, data]) => {
            const sig = String(data?.signal || '').toUpperCase();
            if (sig === 'BUY') buyCount++;
            else if (sig === 'SELL') sellCount++;
            else neutralCount++;
        });
        const total = entries.length || 1;
        const alignedCount = direction === 'UP' ? buyCount : direction === 'DOWN' ? sellCount : 0;
        const opposedCount = direction === 'UP' ? sellCount : direction === 'DOWN' ? buyCount : 0;
        const alignmentRatio = alignedCount / total;

        // Derive realistic confidence from indicator alignment
        let effectiveConf;
        let conviction; // 'high' | 'moderate' | 'low' | 'none'
        let recommendation;
        let techSummary;

        if (direction === 'NEUTRAL' || (neutralCount >= total * 0.7 && alignedCount === 0)) {
            // Mostly neutral / no direction
            effectiveConf = Math.min(apiConf, 45);
            conviction = 'none';
            recommendation = { title: 'No Strong Edge Detected', text: 'Market conditions are mixed and no clear directional advantage is present. Wait for confirmation before acting.', color: '#64748b' };
            techSummary = 'Neutral market conditions — no directional edge';
        } else if (alignmentRatio >= 0.6 && opposedCount === 0 && signalStrength === 'strong') {
            // Strong alignment
            effectiveConf = Math.min(apiConf, 88);
            conviction = 'high';
            recommendation = { title: 'Directional Support Present', text: `Multiple indicators align for a ${direction === 'UP' ? 'bullish' : 'bearish'} move. Conditions favor this setup.`, color: '#10b981' };
            techSummary = `${direction === 'UP' ? 'Bullish' : 'Bearish'} alignment across indicators`;
        } else if (alignmentRatio >= 0.4 || (alignedCount >= 2 && opposedCount <= 1)) {
            // Moderate alignment
            effectiveConf = Math.min(apiConf, 68);
            conviction = 'moderate';
            recommendation = { title: 'Moderate Conviction Setup', text: `Some indicators support a ${direction === 'UP' ? 'bullish' : 'bearish'} view, but conditions are not fully aligned. Use caution.`, color: '#f59e0b' };
            techSummary = 'Mixed signals — moderate directional lean';
        } else {
            // Weak / contradictory
            effectiveConf = Math.min(apiConf, 52);
            conviction = 'low';
            recommendation = { title: 'Low Conviction — Wait for Confirmation', text: 'Indicators are inconclusive. No strong edge exists right now. Consider waiting for clearer conditions.', color: '#f59e0b' };
            techSummary = 'Mixed signals, low conviction — no clear edge';
        }

        return {
            effectiveConf,
            conviction,
            recommendation,
            techSummary,
            buyCount, sellCount, neutralCount,
            label: conviction === 'high' ? `High Confidence (${effectiveConf.toFixed(0)}%)`
                 : conviction === 'moderate' ? `Moderate Confidence (${effectiveConf.toFixed(0)}%)`
                 : conviction === 'low' ? `Low Confidence (${effectiveConf.toFixed(0)}%)`
                 : `No Strong Edge (${effectiveConf.toFixed(0)}%)`,
            directionLabel: direction === 'UP'
                ? (conviction === 'high' ? 'Bullish Projection (Long Bias)' : conviction === 'moderate' ? 'Lean Bullish (Moderate)' : 'Slight Bullish Lean')
                : direction === 'DOWN'
                ? (conviction === 'high' ? 'Bearish Projection (Short Bias)' : conviction === 'moderate' ? 'Lean Bearish (Moderate)' : 'Slight Bearish Lean')
                : 'No Clear Direction',
            color: conviction === 'high' ? '#10b981' : conviction === 'moderate' ? '#f59e0b' : '#64748b',
        };
    }, []);

    // Compute conviction for current prediction
    const conv = prediction ? computeConviction(prediction) : null;

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

    // Derive market regime from indicators
    const getMarketRegime = () => {
        if (!prediction?.indicators) return { label: 'Mixed Conditions', regime: 'mixed' };
        const indicators = prediction.indicators;
        const rsi = indicators['RSI'] || indicators['rsi'];
        const bollinger = indicators['Bollinger'] || indicators['bollinger'] || indicators['Bollinger Bands'];
        const macd = indicators['MACD'] || indicators['macd'];
        const trend = indicators['Trend'] || indicators['trend'] || indicators['SMA'] || indicators['EMA'];

        // High volatility check
        if (rsi) {
            const val = rsi.value;
            if (val !== undefined && (val > 75 || val < 25)) {
                return { label: 'High Volatility', regime: 'volatile' };
            }
        }
        if (bollinger) {
            const sig = String(bollinger.signal || '').toUpperCase();
            if (sig === 'BUY' || sig === 'SELL') {
                return { label: 'High Volatility', regime: 'volatile' };
            }
        }

        // Trending check
        if (trend) {
            const sig = String(trend.signal || '').toUpperCase();
            if (sig === 'BUY' || sig === 'SELL') {
                if (macd) {
                    const macdSig = String(macd.signal || '').toUpperCase();
                    if (macdSig === sig) {
                        return { label: 'Trending', regime: 'trending' };
                    }
                }
                return { label: 'Trending', regime: 'trending' };
            }
        }

        return { label: 'Mixed Conditions', regime: 'mixed' };
    };

    const isUrgent = countdown.days === 0 && countdown.hours < 6;
    const marketRegime = prediction ? getMarketRegime() : null;

    return (
        <PageContainer>
            {/* Share Modal */}
            {showShareModal && (
                <ModalOverlay onClick={() => setShowShareModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Share Forecast</ModalTitle>
                            <CloseButton onClick={() => setShowShareModal(false)}><X size={14} /></CloseButton>
                        </ModalHeader>
                        <ShareOptions>
                            <ShareOption onClick={() => handleShare('twitter')}><Twitter size={20} />Twitter</ShareOption>
                            <ShareOption onClick={() => handleShare('facebook')}><Facebook size={20} />Facebook</ShareOption>
                            <ShareOption onClick={() => handleShare('linkedin')}><Linkedin size={20} />LinkedIn</ShareOption>
                            <ShareOption onClick={() => handleShare('copy')}><Copy size={20} />Copy Link</ShareOption>
                        </ShareOptions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Section 1: Header + Trust Strip */}
            <HeaderRow>
                <HeaderLeft>
                    <Title>AI Market Forecast Engine</Title>
                    <Subtitle>Data-driven price projections — fully tracked and measured.</Subtitle>
                </HeaderLeft>
                <TrustStripInline>
                    <span>{platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}</span> tracked
                    <TrustDivider>|</TrustDivider>
                    <span>{platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}</span> win rate
                    {!platformStats.loading && platformStats.accuracy > 50 && (
                        <><TrustDivider>|</TrustDivider><EdgeBadge>Positive edge</EdgeBadge></>
                    )}
                    <TrustDivider>|</TrustDivider>
                    All outcomes recorded
                </TrustStripInline>
            </HeaderRow>

            {/* Tabs */}
            <TabsContainer>
                <Tab $active={activeTab === 'predict'} onClick={() => setActiveTab('predict')}>
                    <BarChart3 size={14} /> New Forecast
                </Tab>
                <Tab $active={activeTab === 'saved'} onClick={() => setActiveTab('saved')}>
                    <Bookmark size={14} /> Saved ({savedPredictions.length})
                </Tab>
                <Tab $active={activeTab === 'history'} onClick={() => navigate('/prediction-history')}>
                    <Clock size={14} /> History
                </Tab>
            </TabsContainer>

            {/* PREDICT TAB */}
            {activeTab === 'predict' && (
                <>
                    {/* Section 2: Premium Input */}
                    <InputSection>
                        <InputHelperText>Enter any stock, crypto, or DEX token to generate a forecast with projected move, confidence, and expected outcome.</InputHelperText>
                        <InputForm onSubmit={fetchPrediction}>
                            <InputGroup>
                                <FormField>
                                    <Label><BarChart3 size={14} /> Symbol</Label>
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
                                    <ExampleText>Try: BTC, ETH, NVDA, SOL, AAPL</ExampleText>
                                </FormField>
                                <FormField>
                                    <Label><Calendar size={14} /> Timeframe</Label>
                                    <Select value={days} onChange={e => setDays(e.target.value)}>
                                        <option value="7">7 Days (Short-term)</option>
                                        <option value="30">30 Days (Medium-term)</option>
                                        <option value="90">90 Days (Long-term)</option>
                                    </Select>
                                </FormField>
                            </InputGroup>
                            <PredictButton type="submit" disabled={loading || !symbol}>
                                {loading ? <><LoadingSpinner size={18} /> Analyzing...</> : <><Activity size={18} /> Run Forecast</>}
                            </PredictButton>
                        </InputForm>
                    </InputSection>

                    {/* Section 5: How Forecasts Connect to Signals */}
                    {!prediction && !loading && (
                        <InfoStrip>
                            <Sparkles size={13} />
                            <span>Forecasts identify direction and conviction.</span>
                            Strong forecasts can become live signal setups. All outcomes are tracked publicly.
                        </InfoStrip>
                    )}

                    {/* Prediction Results */}
                    {prediction && (
                        <ResultsContainer>
                            <Card>
                                {/* Live Forecast Label */}
                                <ForecastLabel>
                                    <Radio size={14} />
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
                                                    <Radio size={12} style={{ marginRight: '0.3rem' }} />
                                                    Live Forecast In Progress
                                                </SharedTitle>
                                                <SharedSubtitle>
                                                    {prediction.sharedMessage || 'You joined an active forecast for this symbol'}
                                                </SharedSubtitle>
                                            </SharedText>
                                        </SharedBadgeLeft>
                                        <ViewerCount>
                                            <Users size={14} />
                                            {prediction.viewCount || 1} watching
                                        </ViewerCount>
                                    </SharedPredictionBanner>
                                )}

                                {/* Section 3: Signal Potential Module */}
                                {conv && (
                                    <SignalPotentialCard $level={conv.conviction}>
                                        <SignalPotentialTitle $color={conv.conviction === 'high' ? '#10b981' : conv.conviction === 'moderate' ? '#f59e0b' : '#64748b'}>
                                            {conv.conviction === 'high' ? <><Zap size={15} /> Signal Candidate</> :
                                             conv.conviction === 'moderate' ? <><Eye size={15} /> Watchlist</> :
                                             <><AlertTriangle size={15} /> No Strong Edge</>}
                                        </SignalPotentialTitle>
                                        <SignalPotentialText>
                                            {conv.conviction === 'high'
                                                ? 'This forecast has enough conviction to convert into a live signal setup. Multiple indicators align with the projected direction.'
                                                : conv.conviction === 'moderate'
                                                ? 'Monitor this setup for confirmation before acting. Some indicators support the direction but conditions are not fully aligned.'
                                                : 'Wait for better conditions. Indicators are inconclusive and no clear edge is present at this time.'}
                                        </SignalPotentialText>
                                        {(conv.conviction === 'high' || conv.conviction === 'moderate') && (
                                            <SignalPotentialCTA
                                                $color={conv.conviction === 'high' ? '#10b981' : '#f59e0b'}
                                                onClick={() => navigate('/paper-trading', {
                                                    state: {
                                                        symbol: prediction.symbol,
                                                        direction: prediction.prediction.direction,
                                                        targetPrice: prediction.prediction.target_price,
                                                        currentPrice: prediction.current_price
                                                    }
                                                })}
                                            >
                                                <ArrowRight size={13} /> Convert to Signal Setup
                                            </SignalPotentialCTA>
                                        )}
                                    </SignalPotentialCard>
                                )}

                                {/* Compact Live Status + Countdown */}
                                {liveData && (
                                    <LiveStatusCard>
                                        <LiveStatusHeader>
                                            <LiveStatusTitle>
                                                <LiveDot />
                                                Live Tracking
                                            </LiveStatusTitle>
                                            <CountdownDisplay>
                                                <CountdownUnit $urgent={isUrgent}>
                                                    <CountdownValue $urgent={isUrgent}>{String(countdown.days).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel>Days</CountdownLabel>
                                                </CountdownUnit>
                                                <CountdownSeparator>:</CountdownSeparator>
                                                <CountdownUnit $urgent={isUrgent}>
                                                    <CountdownValue $urgent={isUrgent}>{String(countdown.hours).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel>Hrs</CountdownLabel>
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

                                        {/* Compact Confidence */}
                                        {conv && (
                                            <CompactConfidence $color={conv.color}>
                                                <CompactConfLabel>Confidence: {conv.label}</CompactConfLabel>
                                                <CompactConfBar><CompactConfFill $w={conv.effectiveConf} $color={conv.color} /></CompactConfBar>
                                                {confidenceChange !== 0 && (
                                                    <CompactConfChange $positive={confidenceChange > 0}>
                                                        {confidenceChange > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                                                        {Math.abs(confidenceChange).toFixed(1)}%
                                                    </CompactConfChange>
                                                )}
                                            </CompactConfidence>
                                        )}
                                    </LiveStatusCard>
                                )}

                                {/* Prediction Header */}
                                <PredictionHeader>
                                    <StockInfo>
                                        <StockSymbol>
                                            {prediction.symbol}
                                            <WatchlistStar onClick={() => handleWatchlistToggle(prediction.symbol)}>
                                                <Star size={18} fill={watchlist.includes(prediction.symbol?.toUpperCase()) ? '#f59e0b' : 'none'} color="#f59e0b" />
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
                                </PredictionHeader>

                                {/* Section 4: Direction + Conviction + Signal Potential badges */}
                                <BadgeRow>
                                    <DirectionBadge
                                        $up={prediction.prediction.direction === 'UP'}
                                        $neutral={prediction.prediction.direction === 'NEUTRAL' || conv?.conviction === 'none'}
                                    >
                                        {prediction.prediction.direction === 'UP' ? (
                                            <TrendingUp size={18} />
                                        ) : prediction.prediction.direction === 'NEUTRAL' || conv?.conviction === 'none' ? (
                                            <AlertTriangle size={18} />
                                        ) : (
                                            <TrendingDown size={18} />
                                        )}
                                        {conv?.directionLabel || 'No Clear Direction'}
                                    </DirectionBadge>
                                    {conv && (
                                        <ConvictionBadge $color={conv.color}>
                                            {conv.conviction === 'high' ? <Zap size={12} /> : conv.conviction === 'moderate' ? <Activity size={12} /> : <AlertTriangle size={12} />}
                                            {conv.conviction === 'high' ? 'High Conviction' : conv.conviction === 'moderate' ? 'Moderate' : conv.conviction === 'low' ? 'Low Conviction' : 'No Edge'}
                                        </ConvictionBadge>
                                    )}
                                    {conv && (
                                        <SignalPotentialBadge $level={conv.conviction}>
                                            <Target size={11} />
                                            {conv.conviction === 'high' ? 'Signal Candidate' : conv.conviction === 'moderate' ? 'Watchlist' : 'Wait'}
                                        </SignalPotentialBadge>
                                    )}
                                </BadgeRow>

                                {/* Metrics Grid */}
                                <MetricsGrid>
                                    <MetricCard>
                                        <MetricIcon $variant="primary"><Target size={18} /></MetricIcon>
                                        <MetricLabel>Target Price</MetricLabel>
                                        <MetricValue>
                                            {formatPredictionPrice(prediction.prediction.target_price, prediction.symbol)}
                                        </MetricValue>
                                    </MetricCard>
                                    <MetricCard>
                                        <MetricIcon $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            <Percent size={18} />
                                        </MetricIcon>
                                        <MetricLabel>Price Change</MetricLabel>
                                        <MetricValue $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            {prediction.prediction.direction === 'UP' ? '+' : ''}{prediction.prediction.price_change_percent?.toFixed(2)}%
                                        </MetricValue>
                                    </MetricCard>
                                    <MetricCard>
                                        <MetricIcon $variant="warning"><DollarSign size={18} /></MetricIcon>
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
                                        <MetricIcon $variant="primary"><Award size={18} /></MetricIcon>
                                        <MetricLabel>Conviction</MetricLabel>
                                        <MetricValue style={{ fontSize: '1rem', color: conv?.color || '#64748b' }}>{conv?.label || 'Analyzing...'}</MetricValue>
                                    </MetricCard>
                                </MetricsGrid>
                                <MetricsMicrocopy>Projection based on current data — not guaranteed outcome.</MetricsMicrocopy>

                                {/* Section 5: How Forecasts Connect to Signals strip */}
                                <InfoStrip style={{ maxWidth: '100%', margin: '0 0 1.25rem 0' }}>
                                    <Sparkles size={12} />
                                    <span>Forecasts identify direction and conviction.</span>
                                    Strong forecasts can become live signal setups. All outcomes are tracked publicly.
                                </InfoStrip>

                                {/* Section 6: Recommendation Block */}
                                {conv?.recommendation && (
                                    <RecommendationBlock $color={conv.recommendation.color}>
                                        <RecommendationTitle $color={conv.recommendation.color}>
                                            {conv.conviction === 'none' || conv.conviction === 'low' ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
                                            {conv.recommendation.title}
                                        </RecommendationTitle>
                                        <RecommendationText>{conv.recommendation.text}</RecommendationText>
                                    </RecommendationBlock>
                                )}

                                {/* Section 7: Why This Forecast */}
                                {generateReasoning().length > 0 && (
                                    <ReasoningSection>
                                        <SectionTitle><Brain size={16} /> Why This Forecast</SectionTitle>
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

                                {/* Section 8: Technical Summary + Indicators */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <SectionTitle>
                                        <BarChart3 size={16} /> Technical Indicators
                                    </SectionTitle>
                                    {conv?.techSummary && (
                                        <TechSummaryLine $color={conv.color}>
                                            Technical Summary: {conv.techSummary}
                                        </TechSummaryLine>
                                    )}
                                    {renderIndicators()}
                                </div>

                                {/* Section 9: Price Projection Chart */}
                                {prediction.chartData && (() => {
                                    const minPrice = Math.min(prediction.current_price, prediction.prediction.target_price);
                                    const maxPrice = Math.max(prediction.current_price, prediction.prediction.target_price);
                                    const padding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1;
                                    const yMin = Math.max(0, minPrice - padding);
                                    const yMax = maxPrice + padding;

                                    return (
                                        <ChartSection>
                                            <SectionTitle><Activity size={16} /> Price Projection</SectionTitle>
                                            <ChartSubtitle>Projected range — not exact path</ChartSubtitle>
                                            <ResponsiveContainer width="100%" height={300}>
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
                                                        tick={{ fill: '#64748b', fontSize: 10 }}
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
                                                            backgroundColor: 'rgba(12,16,32,0.95)',
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

                                {/* Section 10: Historical Validation + Market Regime */}
                                <ValidationSection>
                                    <SectionTitle><Award size={16} /> Similar Forecast Performance</SectionTitle>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                        <ValidationStats style={{ marginBottom: 0 }}>
                                            <ValidationStat>
                                                <span>Platform Win Rate</span>
                                                <span>{platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}</span>
                                            </ValidationStat>
                                            <ValidationStat>
                                                <span>Total Tracked</span>
                                                <span>{platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}</span>
                                            </ValidationStat>
                                        </ValidationStats>
                                        {marketRegime && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Market Regime</span>
                                                <MarketRegimeTag $regime={marketRegime.regime}>
                                                    {marketRegime.regime === 'volatile' ? <Activity size={11} style={{ marginRight: '0.2rem' }} /> :
                                                     marketRegime.regime === 'trending' ? <TrendingUp size={11} style={{ marginRight: '0.2rem' }} /> :
                                                     <ArrowRight size={11} style={{ marginRight: '0.2rem' }} />}
                                                    {marketRegime.label}
                                                </MarketRegimeTag>
                                            </div>
                                        )}
                                    </div>
                                    <ValidationDisclaimer>
                                        Based on {platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()} tracked forecasts. Past performance does not guarantee future results.
                                    </ValidationDisclaimer>
                                </ValidationSection>

                                {/* Section 11: Full Action Row */}
                                <ActionRow>
                                    <CTAButton $primary onClick={() => navigate('/signals')}>
                                        <Target size={14} /> Track Forecast
                                    </CTAButton>
                                    <CTAButton onClick={() => navigate('/paper-trading', {
                                        state: {
                                            symbol: prediction.symbol,
                                            direction: prediction.prediction.direction,
                                            targetPrice: prediction.prediction.target_price,
                                            currentPrice: prediction.current_price
                                        }
                                    })}>
                                        <BarChart3 size={14} /> Convert to Setup
                                    </CTAButton>
                                    <ActionButton onClick={() => handleWatchlistToggle(prediction.symbol)}>
                                        <Star size={14} fill={watchlist.includes(prediction.symbol?.toUpperCase()) ? '#f59e0b' : 'none'} color="#f59e0b" />
                                        Watchlist
                                    </ActionButton>
                                    <ActionButton onClick={handleSavePrediction}><BookmarkPlus size={14} /> Save</ActionButton>
                                    <ActionButton onClick={() => setShowAlertModal(true)}><Bell size={14} /> Alert</ActionButton>
                                    <ActionButton onClick={() => setShowShareModal(true)}><Share2 size={14} /> Share</ActionButton>
                                    <ActionButton onClick={handleExport}><Download size={14} /> Export</ActionButton>
                                    <ActionButton onClick={() => { setSymbol(prediction.symbol); fetchPrediction({ preventDefault: () => {} }); }}>
                                        <RefreshCw size={14} /> Refresh
                                    </ActionButton>
                                </ActionRow>

                                {/* Trust Line */}
                                <TrustLine>
                                    Every forecast is tracked publicly — win or lose. No edits. No cherry-picking.
                                </TrustLine>
                            </Card>
                        </ResultsContainer>
                    )}

                    {/* Section 12: Empty State */}
                    {!prediction && !loading && (
                        <EmptyStateContainer>
                            <EmptyHero>
                                <EmptyIcon><BarChart3 size={40} color="#00adef" /></EmptyIcon>
                                <EmptyTitle>Run your first forecast</EmptyTitle>
                                <EmptyText>Enter a stock, crypto, or DEX token above to generate an AI-powered price projection.</EmptyText>
                            </EmptyHero>

                            {/* Example Cards */}
                            <ExampleCardsGrid>
                                <ExampleCard $color="#f59e0b" onClick={() => { setSymbol('BTC'); }}>
                                    <ExampleSymbol>BTC</ExampleSymbol>
                                    <ExampleName>Bitcoin</ExampleName>
                                    <ExampleMeta>
                                        <ExampleChip $color="rgba(247,147,26,0.1)" $textColor="#f7931a">Crypto</ExampleChip>
                                        <ExampleChip>7-Day</ExampleChip>
                                    </ExampleMeta>
                                </ExampleCard>
                                <ExampleCard $color="#8b5cf6" onClick={() => { setSymbol('ETH'); }}>
                                    <ExampleSymbol>ETH</ExampleSymbol>
                                    <ExampleName>Ethereum</ExampleName>
                                    <ExampleMeta>
                                        <ExampleChip $color="rgba(0,173,239,0.1)" $textColor="#00adef">Crypto</ExampleChip>
                                        <ExampleChip>7-Day</ExampleChip>
                                    </ExampleMeta>
                                </ExampleCard>
                                <ExampleCard $color="#00adef" onClick={() => { setSymbol('NVDA'); }}>
                                    <ExampleSymbol>NVDA</ExampleSymbol>
                                    <ExampleName>NVIDIA Corp</ExampleName>
                                    <ExampleMeta>
                                        <ExampleChip $color="rgba(0,173,239,0.1)" $textColor="#00adef">Stock</ExampleChip>
                                        <ExampleChip>7-Day</ExampleChip>
                                    </ExampleMeta>
                                </ExampleCard>
                            </ExampleCardsGrid>

                            {/* How It Works */}
                            <Card style={{ padding: '1rem' }}>
                                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.6rem' }}>How It Works</div>
                                <HowItWorksStrip>
                                    <HowStep><StepNumber>1</StepNumber> Enter symbol</HowStep>
                                    <StepArrow><ChevronRight size={12} /></StepArrow>
                                    <HowStep><StepNumber>2</StepNumber> AI analyzes</HowStep>
                                    <StepArrow><ChevronRight size={12} /></StepArrow>
                                    <HowStep><StepNumber>3</StepNumber> Conviction assessed</HowStep>
                                    <StepArrow><ChevronRight size={12} /></StepArrow>
                                    <HowStep><StepNumber>4</StepNumber> Track or convert</HowStep>
                                </HowItWorksStrip>
                            </Card>
                        </EmptyStateContainer>
                    )}
                </>
            )}

            {/* SAVED TAB */}
            {activeTab === 'saved' && (
                <SavedPredictionsContainer>
                    {savedPredictions.length > 0 && (
                        <ClearAllButton onClick={handleClearAllSaved}>
                            <Trash2 size={14} /> Clear All Saved
                        </ClearAllButton>
                    )}

                    {savedPredictions.length === 0 ? (
                        <EmptyHero>
                            <EmptyIcon><Bookmark size={40} color="#00adef" /></EmptyIcon>
                            <EmptyTitle>No Saved Forecasts</EmptyTitle>
                            <EmptyText>Save forecasts to track them here</EmptyText>
                        </EmptyHero>
                    ) : (
                        <SavedPredictionsGrid>
                            {savedPredictions.map(saved => (
                                <SavedPredictionCard key={saved.id} $up={saved.prediction?.direction === 'UP'}>
                                    <SavedCardHeader>
                                        <SavedSymbol>{saved.symbol}</SavedSymbol>
                                        <SavedDirection $up={saved.prediction?.direction === 'UP'}>
                                            {saved.prediction?.direction === 'UP' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
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
                                            <SavedMetricValue>{Math.min(95, saved.prediction?.confidence || 0).toFixed(0)}%</SavedMetricValue>
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
                                            <Calendar size={12} />
                                            {formatSavedDate(saved.savedAt || saved.timestamp)}
                                        </SavedDate>
                                        <SavedActions>
                                            <SavedActionButton onClick={() => handleViewSavedPrediction(saved)} title="View">
                                                <Eye size={13} />
                                            </SavedActionButton>
                                            <SavedActionButton $danger onClick={() => handleDeleteSavedPrediction(saved.id)} title="Delete">
                                                <Trash2 size={13} />
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
