// client/src/pages/SwingTradingPage.js - AI Swing Trading Signals

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from '../components/UpgradePrompt';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, Target, Shield, DollarSign,
    RefreshCw, Zap, Activity, Star, Clock, AlertTriangle,
    CheckCircle, ArrowUpRight, ArrowDownRight, BarChart3,
    Percent, Calendar, Filter, ChevronDown, ChevronUp,
    Search, Plus, X, Loader2
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    max-width: 1800px;
    margin: 0 auto 3rem;
    ${css`animation: ${fadeIn} 0.8s ease-out;`}
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
        flex-direction: column;
    }
`;

const TitleIcon = styled.div`
    ${css`animation: ${float} 3s ease-in-out infinite;`}
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.success || '#00ff88'}33 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}66;
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

// ============ MODE TOGGLE ============
const ModeToggle = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const ModeButton = styled.button`
    padding: 1rem 2rem;
    background: ${props => props.$active ?
        `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'}4D 0%, ${props.theme?.brand?.primary || '#00adef'}26 100%)` :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$active ? `${props.theme?.brand?.primary || '#00adef'}80` : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? (props.theme?.brand?.primary || '#00adef') : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}4D 0%, ${props => props.theme?.brand?.primary || '#00adef'}26 100%);
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }
`;

// ============ CONTROLS ============
const ControlsBar = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 1rem 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const FilterLabel = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
`;

const FilterSelect = styled.select`
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
    }
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'} 0%, ${props => props.theme?.success || '#00ff88'} 100%);
    border: none;
    border-radius: 10px;
    color: #0a0e27;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px ${props => props.theme?.brand?.primary || '#00adef'}66;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const SpinningIcon = styled(RefreshCw)`
    ${props => props.$spinning && css`animation: ${spin} 1s linear infinite;`}
`;

// ============ STATS BAR ============
const StatsBar = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
`;

const StatCard = styled.div`
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$color || 'rgba(0, 173, 239, 0.2)'};
    color: ${props => props.$iconColor || '#00adef'};
`;

const StatInfo = styled.div`
    flex: 1;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

// ============ TRADE CARDS ============
const TradesGrid = styled.div`
    max-width: 1800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
`;

const TradeCard = styled.div`
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.95)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.$type === 'LONG'
        ? 'rgba(0, 255, 136, 0.3)'
        : 'rgba(255, 68, 68, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    ${css`animation: ${fadeIn} 0.5s ease-out;`}

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${props => props.$type === 'LONG'
            ? '0 20px 40px rgba(0, 255, 136, 0.15)'
            : '0 20px 40px rgba(255, 68, 68, 0.15)'};
        border-color: ${props => props.$type === 'LONG'
            ? 'rgba(0, 255, 136, 0.5)'
            : 'rgba(255, 68, 68, 0.5)'};
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
`;

const SymbolSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const SymbolIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 1.1rem;
    background: ${props => props.$type === 'LONG'
        ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 173, 239, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(255, 136, 0, 0.2) 100%)'};
    color: ${props => props.$type === 'LONG' ? '#00ff88' : '#ff4444'};
`;

const SymbolInfo = styled.div``;

const SymbolName = styled.div`
    font-size: 1.4rem;
    font-weight: 800;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    cursor: pointer;

    &:hover {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }
`;

const SymbolType = styled.div`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const DirectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.9rem;
    background: ${props => props.$type === 'LONG'
        ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(255, 68, 68, 0.1) 100%)'};
    color: ${props => props.$type === 'LONG' ? '#00ff88' : '#ff4444'};
    border: 1px solid ${props => props.$type === 'LONG' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)'};
`;

const PriceSection = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
`;

const PriceBox = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const PriceLabel = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const PriceValue = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
`;

const MetricsRow = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
`;

const MetricPill = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 6px;
    font-size: 0.8rem;
    color: ${props => props.$color || props.theme?.text?.secondary || '#94a3b8'};
`;

const ConfidenceBar = styled.div`
    margin-bottom: 1rem;
`;

const ConfidenceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const ConfidenceLabel = styled.span`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const ConfidenceValue = styled.span`
    font-size: 0.9rem;
    font-weight: 700;
    color: ${props => props.$confidence >= 80 ? '#00ff88' : props.$confidence >= 60 ? '#ffa726' : '#ff4444'};
`;

const ConfidenceTrack = styled.div`
    height: 6px;
    background: rgba(100, 116, 139, 0.2);
    border-radius: 3px;
    overflow: hidden;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$value}%;
    background: ${props => props.$value >= 80
        ? 'linear-gradient(90deg, #00ff88 0%, #00adef 100%)'
        : props.$value >= 60
            ? 'linear-gradient(90deg, #ffa726 0%, #ff9800 100%)'
            : 'linear-gradient(90deg, #ff4444 0%, #ff6b6b 100%)'};
    border-radius: 3px;
    transition: width 0.5s ease;
`;

const ReasonSection = styled.div`
    background: rgba(15, 23, 42, 0.4);
    border-radius: 10px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
`;

const ReasonLabel = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    margin-bottom: 0.4rem;
`;

const ReasonText = styled.div`
    font-size: 0.9rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    line-height: 1.4;
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(100, 116, 139, 0.2);
`;

const TimeStamp = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const ViewChartButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.brand?.primary || '#00adef'}1A 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}66;
    border-radius: 8px;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}4D 0%, ${props => props.theme?.brand?.primary || '#00adef'}26 100%);
        transform: translateY(-2px);
    }
`;

// ============ LOADING STATE ============
const LoadingContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
    width: 60px;
    height: 60px;
    border: 3px solid rgba(100, 116, 139, 0.2);
    border-top-color: ${props => props.theme?.brand?.primary || '#00adef'};
    border-radius: 50%;
    ${css`animation: ${spin} 1s linear infinite;`}
`;

const LoadingText = styled.div`
    font-size: 1.1rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    max-width: 1800px;
    margin: 0 auto;
    text-align: center;
    padding: 4rem 2rem;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border-radius: 16px;
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.success || '#00ff88'}33 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const EmptyTitle = styled.h3`
    font-size: 1.5rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.75rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    max-width: 500px;
    margin: 0 auto;
`;

// ============ SEARCH COMPONENTS ============
const SearchSection = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem;
`;

const SearchHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const SearchTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
`;

const SearchInputWrapper = styled.div`
    position: relative;
    flex: 1;
    min-width: 300px;
    max-width: 500px;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 10px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${props => props.theme?.brand?.primary || '#00adef'}33;
    }

    &::placeholder {
        color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const SearchResults = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.98)'};
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    margin-top: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
`;

const SearchResultItem = styled.button`
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: background 0.2s;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};

    &:hover {
        background: rgba(0, 173, 239, 0.1);
    }

    &:not(:last-child) {
        border-bottom: 1px solid rgba(100, 116, 139, 0.2);
    }
`;

const ResultSymbol = styled.span`
    font-weight: 700;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const ResultName = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    margin-left: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.35rem 0.75rem;
    background: ${props => props.theme?.brand?.primary || '#00adef'}33;
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}66;
    border-radius: 6px;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }
`;

const CustomSymbolsRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
`;

const SymbolTag = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: ${props => props.$analyzing
        ? 'rgba(255, 167, 38, 0.2)'
        : 'rgba(0, 173, 239, 0.15)'};
    border: 1px solid ${props => props.$analyzing
        ? 'rgba(255, 167, 38, 0.4)'
        : 'rgba(0, 173, 239, 0.3)'};
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${props => props.$analyzing
        ? '#ffa726'
        : (props.theme?.brand?.primary || '#00adef')};
`;

const RemoveSymbolBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    background: rgba(255, 68, 68, 0.2);
    border: none;
    border-radius: 50%;
    color: #ff4444;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 68, 68, 0.4);
    }
`;

const AnalyzeButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'} 0%, ${props => props.theme?.success || '#00ff88'} 100%);
    border: none;
    border-radius: 10px;
    color: #0a0e27;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px ${props => props.theme?.brand?.primary || '#00adef'}66;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SearchingIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
`;

const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;

// ============ COMPONENT ============
const SwingTradingPage = () => {
    const { user, api } = useAuth();
    const { theme } = useTheme();
    const { hasSwingTrading } = useSubscription();
    const toast = useToast();
    const navigate = useNavigate();

    const [mode, setMode] = useState('stocks');
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeframe, setTimeframe] = useState('all');
    const [direction, setDirection] = useState('all');

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [customSymbols, setCustomSymbols] = useState([]);
    const [analyzingCustom, setAnalyzingCustom] = useState(false);

    // Default symbols
    const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'AMD', 'NFLX', 'SPY', 'QQQ', 'DIS', 'BA', 'JPM', 'V'];
    const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'LINK'];

    // Generate swing trade signals
    const generateSignals = useCallback(async () => {
        setLoading(true);

        try {
            const symbols = mode === 'stocks' ? STOCK_SYMBOLS : CRYPTO_SYMBOLS;
            const generatedSignals = [];

            for (const symbol of symbols) {
                // Use correct endpoints: /stocks/historical or /crypto/historical
                const endpoint = mode === 'stocks'
                    ? `/stocks/historical/${symbol}`
                    : `/crypto/historical/${symbol}`;

                try {
                    const response = await api.get(endpoint, {
                        params: { range: '1M' }
                    });

                    // API returns { historicalData: [...] } or { data: [...] }
                    const candles = response.data.historicalData || response.data.data || [];

                    if (candles.length < 20) continue;

                    // Analyze for swing trade setup
                    const signal = analyzeForSwingTrade(symbol, candles, mode);
                    if (signal) {
                        generatedSignals.push(signal);
                    }
                } catch (err) {
                    // Skip symbol on error
                }
            }

            // Sort by confidence
            generatedSignals.sort((a, b) => b.confidence - a.confidence);
            setSignals(generatedSignals);

        } catch (err) {
            console.error('Error generating signals:', err);
            toast.error('Failed to generate signals');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [mode, api, toast]);

    // Helper to format price for reasons text
    const formatReasonPrice = (price, assetType) => {
        if (assetType === 'crypto') {
            if (price < 0.01) return price.toFixed(6);
            if (price < 1) return price.toFixed(4);
            if (price < 100) return price.toFixed(4);
            return price.toFixed(2);
        }
        return price.toFixed(2);
    };

    // Analyze candles for swing trade opportunity
    const analyzeForSwingTrade = (symbol, candles, assetType) => {
        const recentCandles = candles.slice(-30);
        if (recentCandles.length < 20) return null;

        const latestCandle = recentCandles[recentCandles.length - 1];
        const currentPrice = latestCandle.close;

        // Calculate indicators
        const closes = recentCandles.map(c => c.close);
        const highs = recentCandles.map(c => c.high);
        const lows = recentCandles.map(c => c.low);

        // Simple Moving Averages
        const sma10 = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;

        // RSI calculation
        const rsi = calculateRSI(closes, 14);

        // ATR for stop loss/target calculation
        const atr = calculateATR(recentCandles, 14);

        // Support/Resistance levels
        const recentLow = Math.min(...lows.slice(-14));
        const recentHigh = Math.max(...highs.slice(-14));

        // Price formatting helper
        const fp = (p) => formatReasonPrice(p, assetType);

        // Determine signal type
        let signalType = null;
        let confidence = 0;
        let reasons = [];

        // Bullish conditions - with specific values
        const bullishConditions = [];
        if (currentPrice > sma10) bullishConditions.push(`$${fp(currentPrice)} above 10-day MA ($${fp(sma10)})`);
        if (currentPrice > sma20) bullishConditions.push(`Trading above 20-day MA at $${fp(sma20)}`);
        if (sma10 > sma20) bullishConditions.push(`Bullish trend: 10MA ($${fp(sma10)}) > 20MA ($${fp(sma20)})`);
        if (rsi > 40 && rsi < 70) bullishConditions.push(`RSI ${rsi.toFixed(1)} shows healthy momentum`);
        if (currentPrice < recentLow * 1.05) bullishConditions.push(`Near 14-day support at $${fp(recentLow)}`);

        // Bearish conditions - with specific values
        const bearishConditions = [];
        if (currentPrice < sma10) bearishConditions.push(`$${fp(currentPrice)} below 10-day MA ($${fp(sma10)})`);
        if (currentPrice < sma20) bearishConditions.push(`Trading below 20-day MA at $${fp(sma20)}`);
        if (sma10 < sma20) bearishConditions.push(`Bearish trend: 10MA ($${fp(sma10)}) < 20MA ($${fp(sma20)})`);
        if (rsi > 70) bearishConditions.push(`RSI overbought at ${rsi.toFixed(1)} - pullback likely`);
        if (rsi < 30) bearishConditions.push(`RSI oversold at ${rsi.toFixed(1)} - bounce possible`);
        if (currentPrice > recentHigh * 0.95) bearishConditions.push(`Near 14-day resistance at $${fp(recentHigh)}`);

        // Decide signal - need at least 2 conditions
        if (bullishConditions.length >= 2 && rsi < 75) {
            signalType = 'LONG';
            confidence = Math.min(45 + bullishConditions.length * 12, 95);
            reasons = bullishConditions;
        } else if (bearishConditions.length >= 2 && rsi > 25) {
            signalType = 'SHORT';
            confidence = Math.min(45 + bearishConditions.length * 12, 95);
            reasons = bearishConditions;
        }

        // Return signal if we have one
        if (!signalType) return null;

        // Calculate entry, target, and stop loss
        const entry = currentPrice;
        const stopLoss = signalType === 'LONG'
            ? entry - (atr * 1.5)
            : entry + (atr * 1.5);
        const target = signalType === 'LONG'
            ? entry + (atr * 3)
            : entry - (atr * 3);

        const riskReward = Math.abs(target - entry) / Math.abs(entry - stopLoss);
        const potentialGain = Math.abs((target - entry) / entry * 100);

        return {
            symbol: assetType === 'crypto' ? symbol.replace('USDT', '') : symbol,
            type: signalType,
            assetType,
            entry,
            target,
            stopLoss,
            currentPrice,
            confidence,
            riskReward: riskReward.toFixed(2),
            potentialGain: potentialGain.toFixed(1),
            timeframe: '1-5 Days',
            reasons,
            rsi: rsi.toFixed(0),
            timestamp: new Date().toISOString()
        };
    };

    // RSI calculation
    const calculateRSI = (closes, period) => {
        if (closes.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = closes.length - period; i < closes.length; i++) {
            const change = closes[i] - closes[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    };

    // ATR calculation
    const calculateATR = (candles, period) => {
        if (candles.length < period + 1) return 0;

        let trSum = 0;
        for (let i = candles.length - period; i < candles.length; i++) {
            const high = candles[i].high;
            const low = candles[i].low;
            const prevClose = candles[i - 1]?.close || candles[i].open;

            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trSum += tr;
        }

        return trSum / period;
    };

    // Initial load
    useEffect(() => {
        if (api) {
            generateSignals();
        }
    }, [mode, api, generateSignals]);

    // Filter signals
    const filteredSignals = signals.filter(signal => {
        if (direction !== 'all' && signal.type !== direction) return false;
        return true;
    });

    // Stats
    const longSignals = signals.filter(s => s.type === 'LONG').length;
    const shortSignals = signals.filter(s => s.type === 'SHORT').length;
    const avgConfidence = signals.length > 0
        ? (signals.reduce((a, b) => a + b.confidence, 0) / signals.length).toFixed(0)
        : 0;

    const handleRefresh = () => {
        setRefreshing(true);
        generateSignals();
    };

    // Search for symbols
    const searchSymbols = useCallback(async (query) => {
        if (!query || query.length < 1) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setSearchLoading(true);
        try {
            const endpoint = mode === 'stocks'
                ? `/stocks/search?q=${encodeURIComponent(query)}`
                : `/crypto/search?q=${encodeURIComponent(query)}`;

            const response = await api.get(endpoint);
            const results = response.data.results || response.data || [];
            setSearchResults(results.slice(0, 10)); // Limit to 10 results
            setShowResults(true);
        } catch (err) {
            console.error('Search error:', err);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, [api, mode]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchSymbols(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchSymbols]);

    // Add symbol to custom list
    const addCustomSymbol = (symbol, name) => {
        const symbolUpper = symbol.toUpperCase();
        if (!customSymbols.find(s => s.symbol === symbolUpper)) {
            setCustomSymbols(prev => [...prev, { symbol: symbolUpper, name }]);
            toast.success(`Added ${symbolUpper} to analysis queue`);
        }
        setSearchQuery('');
        setShowResults(false);
    };

    // Remove symbol from custom list
    const removeCustomSymbol = (symbol) => {
        setCustomSymbols(prev => prev.filter(s => s.symbol !== symbol));
    };

    // Analyze custom symbols
    const analyzeCustomSymbols = async () => {
        if (customSymbols.length === 0) {
            toast.error('Add symbols to analyze first');
            return;
        }

        setAnalyzingCustom(true);
        const newSignals = [];

        for (const { symbol } of customSymbols) {
            try {
                const endpoint = mode === 'stocks'
                    ? `/stocks/historical/${symbol}`
                    : `/crypto/historical/${symbol}`;

                const response = await api.get(endpoint, {
                    params: { range: '1M' }
                });

                const candles = response.data.historicalData || response.data.data || [];
                if (candles.length >= 20) {
                    const signal = analyzeForSwingTrade(symbol, candles, mode);
                    if (signal) {
                        newSignals.push(signal);
                    } else {
                        toast.info(`${symbol}: No strong setup detected`);
                    }
                }
            } catch (err) {
                toast.error(`Failed to analyze ${symbol}`);
            }
        }

        if (newSignals.length > 0) {
            // Add new signals to existing ones (avoid duplicates)
            setSignals(prev => {
                const existingSymbols = new Set(prev.map(s => s.symbol));
                const uniqueNew = newSignals.filter(s => !existingSymbols.has(s.symbol));
                const combined = [...uniqueNew, ...prev];
                return combined.sort((a, b) => b.confidence - a.confidence);
            });
            toast.success(`Found ${newSignals.length} swing trade setup${newSignals.length > 1 ? 's' : ''}!`);
        }

        setCustomSymbols([]);
        setAnalyzingCustom(false);
    };

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowResults(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const formatPrice = (price, type) => {
        if (type === 'crypto') {
            if (price < 0.01) return `$${price.toFixed(6)}`;
            if (price < 1) return `$${price.toFixed(4)}`;
            if (price < 100) return `$${price.toFixed(4)}`;
            return `$${price.toFixed(2)}`;
        }
        return `$${price.toFixed(2)}`;
    };

    // Subscription gate - disabled for now (TODO: enable for production)
    // if (!hasSwingTrading) {
    //     return (
    //         <PageContainer>
    //             <UpgradePrompt
    //                 feature="Swing Trading Signals"
    //                 requiredPlan="Pro"
    //             />
    //         </PageContainer>
    //     );
    // }

    return (
        <PageContainer>
            <Header>
                <Title>
                    <TitleIcon>
                        <Activity size={48} />
                    </TitleIcon>
                    Swing Trading Signals
                </Title>
                <Subtitle>
                    AI-powered entry and exit points for swing trades
                </Subtitle>
                <PoweredBy>
                    <Zap size={16} />
                    Powered by NEXUS AI Technical Analysis
                </PoweredBy>
            </Header>

            <ModeToggle>
                <ModeButton
                    $active={mode === 'stocks'}
                    onClick={() => setMode('stocks')}
                >
                    <BarChart3 size={20} />
                    Stocks
                </ModeButton>
                <ModeButton
                    $active={mode === 'crypto'}
                    onClick={() => setMode('crypto')}
                >
                    <DollarSign size={20} />
                    Crypto
                </ModeButton>
            </ModeToggle>

            {/* Search Section */}
            <SearchSection>
                <SearchHeader>
                    <SearchTitle>
                        <Search size={18} />
                        Search & Analyze Any {mode === 'stocks' ? 'Stock' : 'Crypto'}
                    </SearchTitle>
                </SearchHeader>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <SearchInputWrapper onClick={(e) => e.stopPropagation()}>
                        <SearchIcon>
                            {searchLoading ? <SpinningLoader size={18} /> : <Search size={18} />}
                        </SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder={mode === 'stocks' ? 'Search stocks (e.g., AAPL, MSFT, GME)...' : 'Search crypto (e.g., BTC, ETH, SHIB)...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowResults(true)}
                        />
                        {showResults && searchResults.length > 0 && (
                            <SearchResults>
                                {searchResults.map((result, idx) => (
                                    <SearchResultItem
                                        key={idx}
                                        onClick={() => addCustomSymbol(result.symbol, result.name)}
                                    >
                                        <div>
                                            <ResultSymbol>{result.symbol}</ResultSymbol>
                                            <ResultName>{result.name}</ResultName>
                                        </div>
                                        <AddButton>
                                            <Plus size={14} />
                                            Add
                                        </AddButton>
                                    </SearchResultItem>
                                ))}
                            </SearchResults>
                        )}
                    </SearchInputWrapper>

                    <AnalyzeButton
                        onClick={analyzeCustomSymbols}
                        disabled={customSymbols.length === 0 || analyzingCustom}
                    >
                        {analyzingCustom ? (
                            <>
                                <SpinningLoader size={18} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Zap size={18} />
                                Analyze ({customSymbols.length})
                            </>
                        )}
                    </AnalyzeButton>
                </div>

                {customSymbols.length > 0 && (
                    <CustomSymbolsRow>
                        {customSymbols.map(({ symbol, name }) => (
                            <SymbolTag key={symbol} $analyzing={analyzingCustom}>
                                {analyzingCustom && <SpinningLoader size={14} />}
                                {symbol}
                                {!analyzingCustom && (
                                    <RemoveSymbolBtn onClick={() => removeCustomSymbol(symbol)}>
                                        <X size={12} />
                                    </RemoveSymbolBtn>
                                )}
                            </SymbolTag>
                        ))}
                    </CustomSymbolsRow>
                )}
            </SearchSection>

            <ControlsBar>
                <FilterGroup>
                    <FilterLabel>Direction:</FilterLabel>
                    <FilterSelect value={direction} onChange={(e) => setDirection(e.target.value)}>
                        <option value="all">All Signals</option>
                        <option value="LONG">Long Only</option>
                        <option value="SHORT">Short Only</option>
                    </FilterSelect>
                </FilterGroup>

                <RefreshButton onClick={handleRefresh} disabled={refreshing || loading}>
                    <SpinningIcon size={18} $spinning={refreshing || loading} />
                    {refreshing ? 'Scanning...' : 'Refresh Signals'}
                </RefreshButton>
            </ControlsBar>

            <StatsBar>
                <StatCard>
                    <StatIcon $color="rgba(0, 255, 136, 0.2)" $iconColor="#00ff88">
                        <TrendingUp size={24} />
                    </StatIcon>
                    <StatInfo>
                        <StatValue>{longSignals}</StatValue>
                        <StatLabel>Long Signals</StatLabel>
                    </StatInfo>
                </StatCard>

                <StatCard>
                    <StatIcon $color="rgba(255, 68, 68, 0.2)" $iconColor="#ff4444">
                        <TrendingDown size={24} />
                    </StatIcon>
                    <StatInfo>
                        <StatValue>{shortSignals}</StatValue>
                        <StatLabel>Short Signals</StatLabel>
                    </StatInfo>
                </StatCard>

                <StatCard>
                    <StatIcon $color="rgba(0, 173, 239, 0.2)" $iconColor="#00adef">
                        <Target size={24} />
                    </StatIcon>
                    <StatInfo>
                        <StatValue>{avgConfidence}%</StatValue>
                        <StatLabel>Avg Confidence</StatLabel>
                    </StatInfo>
                </StatCard>

                <StatCard>
                    <StatIcon $color="rgba(255, 167, 38, 0.2)" $iconColor="#ffa726">
                        <Activity size={24} />
                    </StatIcon>
                    <StatInfo>
                        <StatValue>{signals.length}</StatValue>
                        <StatLabel>Total Signals</StatLabel>
                    </StatInfo>
                </StatCard>
            </StatsBar>

            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner />
                    <LoadingText>Scanning markets for swing trade setups...</LoadingText>
                </LoadingContainer>
            ) : filteredSignals.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>
                        <Activity size={40} />
                    </EmptyIcon>
                    <EmptyTitle>No Signals Found</EmptyTitle>
                    <EmptyText>
                        No strong swing trade setups detected at this time.
                        Try switching between stocks and crypto, or check back later.
                    </EmptyText>
                </EmptyState>
            ) : (
                <TradesGrid>
                    {filteredSignals.map((signal, index) => (
                        <TradeCard key={`${signal.symbol}-${index}`} $type={signal.type}>
                            <CardHeader>
                                <SymbolSection>
                                    <SymbolIcon $type={signal.type}>
                                        {signal.symbol.substring(0, 2)}
                                    </SymbolIcon>
                                    <SymbolInfo>
                                        <SymbolName onClick={() => navigate(`/chart/${signal.symbol}`)}>
                                            {signal.symbol}
                                        </SymbolName>
                                        <SymbolType>
                                            {signal.assetType === 'crypto' ? 'Cryptocurrency' : 'Stock'}
                                        </SymbolType>
                                    </SymbolInfo>
                                </SymbolSection>
                                <DirectionBadge $type={signal.type}>
                                    {signal.type === 'LONG' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {signal.type}
                                </DirectionBadge>
                            </CardHeader>

                            <PriceSection>
                                <PriceBox>
                                    <PriceLabel>
                                        <Target size={12} /> Entry Price
                                    </PriceLabel>
                                    <PriceValue>
                                        {formatPrice(signal.entry, signal.assetType)}
                                    </PriceValue>
                                </PriceBox>
                                <PriceBox>
                                    <PriceLabel>
                                        <Star size={12} /> Target Price
                                    </PriceLabel>
                                    <PriceValue $color="#00ff88">
                                        {formatPrice(signal.target, signal.assetType)}
                                    </PriceValue>
                                </PriceBox>
                                <PriceBox>
                                    <PriceLabel>
                                        <Shield size={12} /> Stop Loss
                                    </PriceLabel>
                                    <PriceValue $color="#ff4444">
                                        {formatPrice(signal.stopLoss, signal.assetType)}
                                    </PriceValue>
                                </PriceBox>
                                <PriceBox>
                                    <PriceLabel>
                                        <DollarSign size={12} /> Current
                                    </PriceLabel>
                                    <PriceValue>
                                        {formatPrice(signal.currentPrice, signal.assetType)}
                                    </PriceValue>
                                </PriceBox>
                            </PriceSection>

                            <MetricsRow>
                                <MetricPill $color="#00ff88">
                                    <Percent size={12} />
                                    +{signal.potentialGain}% potential
                                </MetricPill>
                                <MetricPill $color="#00adef">
                                    <Target size={12} />
                                    {signal.riskReward}:1 R/R
                                </MetricPill>
                                <MetricPill>
                                    <Activity size={12} />
                                    RSI: {signal.rsi}
                                </MetricPill>
                            </MetricsRow>

                            <ConfidenceBar>
                                <ConfidenceHeader>
                                    <ConfidenceLabel>Signal Confidence</ConfidenceLabel>
                                    <ConfidenceValue $confidence={signal.confidence}>
                                        {signal.confidence}%
                                    </ConfidenceValue>
                                </ConfidenceHeader>
                                <ConfidenceTrack>
                                    <ConfidenceFill $value={signal.confidence} />
                                </ConfidenceTrack>
                            </ConfidenceBar>

                            <ReasonSection>
                                <ReasonLabel>Why this setup?</ReasonLabel>
                                <ReasonText>
                                    {signal.reasons.slice(0, 3).join(' | ')}
                                </ReasonText>
                            </ReasonSection>

                            <CardFooter>
                                <TimeStamp>
                                    <Clock size={14} />
                                    {signal.timeframe} trade
                                </TimeStamp>
                                <ViewChartButton onClick={() => navigate(`/chart/${signal.symbol}`)}>
                                    <BarChart3 size={16} />
                                    View Chart
                                </ViewChartButton>
                            </CardFooter>
                        </TradeCard>
                    ))}
                </TradesGrid>
            )}
        </PageContainer>
    );
};

export default SwingTradingPage;
