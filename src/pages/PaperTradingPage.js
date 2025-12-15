// client/src/pages/PaperTradingPage.js - THEMED VERSION WITH LONG/SHORT TRADING + LEVERAGE + TP/SL

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import RefillAccountButton from '../components/RefillAccountButton';
import LeverageSelector from '../components/LeverageSelector';
import { 
    formatCurrency, 
    formatPriceChange, 
    formatCryptoPrice, 
    formatStockPrice 
} from '../utils/priceFormatter';
import {
    TrendingUp, TrendingDown, DollarSign, Activity, Target, Zap,
    ArrowUpRight, ArrowDownRight, RefreshCw, Search, Plus, Minus,
    Send, Trophy, Flame, Award, Eye, Heart, MessageCircle,
    Share2, BarChart3, PieChart, Percent, Clock, CheckCircle,
    XCircle, AlertCircle, ThumbsUp, Star, Users, Calendar, Bell,
    AlertTriangle, Shield, ChevronDown, Crosshair, ShieldAlert, TrendingUp as TrendUp
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ============ REFILL TIERS CONFIG ============
const REFILL_TIERS = [
    { coins: 100, amount: 10000, label: '$10,000' },
    { coins: 250, amount: 25000, label: '$25,000' },
    { coins: 500, amount: 50000, label: '$50,000' },
    { coins: 750, amount: 75000, label: '$75,000' },
    { coins: 1000, amount: 100000, label: '$100,000 (Full Refill)' }
];

const MAX_BALANCE = 100000;
const LEVERAGE_OPTIONS = [1, 2, 3, 5, 7, 10, 20];

function safeNumber(value, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
}

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const warningPulse = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        border-color: rgba(239, 68, 68, 0.5);
    }
    50% { 
        box-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
        border-color: rgba(239, 68, 68, 0.8);
    }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent; 
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding: 2rem;
    padding-top: 100px;
`;

const Header = styled.div`
    max-width: 1800px;
    margin: 0 auto 3rem;
    text-align: center;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
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
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}33`};
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}66`};
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const PortfolioOverview = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${props => props.$borderColor || `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        border-color: ${props => props.$borderColor || `${props.theme?.brand?.primary || '#00adef'}99`};
        box-shadow: 0 10px 30px ${props => props.$shadowColor || `${props.theme?.brand?.primary || '#00adef'}4D`};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: ${props => props.$gradient || props.theme?.brand?.gradient || 'linear-gradient(90deg, #00adef, #00ff88)'};
    }
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: ${props => props.$background || `${props.theme?.brand?.primary || '#00adef'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    animation: ${float} 3s ease-in-out infinite;
`;

const StatLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.$color || props.theme?.brand?.primary || '#00adef'};
    margin-bottom: 0.25rem;
`;

const StatChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: ${props => props.$positive ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    font-weight: 600;
`;

const ContentGrid = styled.div`
    max-width: 1800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;

    @media (max-width: 1400px) {
        grid-template-columns: 1fr;
    }
`;

const TradingPanel = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const PanelTitle = styled.h2`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const PositionTypeSelector = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border-radius: 12px;
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}33`};
`;

const PositionTypeButton = styled.button`
    padding: 1.25rem;
    background: ${props => props.$active ? 
        props.$short ?
            `linear-gradient(135deg, ${props.theme?.error || '#ef4444'}4D 0%, ${props.theme?.error || '#ef4444'}26 100%)` :
            `linear-gradient(135deg, ${props.theme?.success || '#10b981'}4D 0%, ${props.theme?.success || '#10b981'}26 100%)`
        :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$active ? 
        props.$short ? `${props.theme?.error || '#ef4444'}80` : `${props.theme?.success || '#10b981'}80`
        : 
        'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 12px;
    color: ${props => props.$active ? 
        props.$short ? (props.theme?.error || '#ef4444') : (props.theme?.success || '#10b981')
        : 
        (props.theme?.text?.secondary || '#94a3b8')
    };
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${props => props.$short ?
            `linear-gradient(135deg, ${props.theme?.error || '#ef4444'}4D 0%, ${props.theme?.error || '#ef4444'}26 100%)` :
            `linear-gradient(135deg, ${props.theme?.success || '#10b981'}4D 0%, ${props.theme?.success || '#10b981'}26 100%)`
        };
        border-color: ${props => props.$short ? `${props.theme?.error || '#ef4444'}80` : `${props.theme?.success || '#10b981'}80`};
        color: ${props => props.$short ? (props.theme?.error || '#ef4444') : (props.theme?.success || '#10b981')};
        transform: translateY(-2px);
    }
`;

const PositionTypeLabel = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PositionTypeDesc = styled.div`
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.8;
    text-align: center;
`;

const RiskWarning = styled.div`
    padding: 1.25rem;
    background: ${props => `${props.theme?.error || '#ef4444'}1A`};
    border: 2px solid ${props => `${props.theme?.error || '#ef4444'}66`};
    border-radius: 12px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: start;
    gap: 1rem;
    animation: ${warningPulse} 2s ease-in-out infinite;
`;

const RiskWarningIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${props => `${props.theme?.error || '#ef4444'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const RiskWarningContent = styled.div`
    flex: 1;
`;

const RiskWarningTitle = styled.div`
    color: ${props => props.theme?.error || '#ef4444'};
    font-weight: 700;
    font-size: 1.05rem;
    margin-bottom: 0.5rem;
`;

const RiskWarningText = styled.div`
    color: #fca5a5;
    font-size: 0.9rem;
    line-height: 1.5;
`;

const TabButtons = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const TabButton = styled.button`
    flex: 1;
    padding: 1rem;
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
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}4D 0%, ${props => props.theme?.brand?.primary || '#00adef'}26 100%);
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        transform: translateY(-2px);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    padding: 1rem 1.25rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border: 2px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        background: ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
        box-shadow: 0 0 20px ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const Select = styled.select`
    padding: 1rem 1.25rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border: 2px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        background: ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
    }

    option {
        background: #1a1f3a;
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    }
`;

const TextArea = styled.textarea`
    padding: 1rem 1.25rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border: 2px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    min-height: 100px;
    resize: vertical;
    font-family: inherit;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        background: ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
        box-shadow: 0 0 20px ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const PriceDisplay = styled.div`
    padding: 1.5rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
    border: 2px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const PriceLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
`;

const PriceValue = styled.div`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 1.5rem;
    font-weight: 900;
`;

const TotalDisplay = styled.div`
    padding: 1.5rem;
    background: linear-gradient(135deg, ${props => `${props.theme?.brand?.primary || '#00adef'}33`} 0%, ${props => `${props.theme?.brand?.primary || '#00adef'}1A`} 100%);
    border: 2px solid ${props => `${props.theme?.brand?.primary || '#00adef'}66`};
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TotalLabel = styled.div`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 700;
`;

const TotalValue = styled.div`
    color: ${props => props.theme?.success || '#00ff88'};
    font-size: 1.8rem;
    font-weight: 900;
`;

const SubmitButton = styled.button`
    padding: 1.25rem 2rem;
    background: ${props => 
        props.$positionType === 'short' ?
            `linear-gradient(135deg, ${props.theme?.error || '#ef4444'} 0%, ${props.theme?.error || '#dc2626'} 100%)` :
        props.$variant === 'sell' ?
            `linear-gradient(135deg, ${props.theme?.error || '#ef4444'} 0%, ${props.theme?.error || '#dc2626'} 100%)` :
            `linear-gradient(135deg, ${props.theme?.success || '#10b981'} 0%, ${props.theme?.success || '#059669'} 100%)`
    };
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.2rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => 
            props.$positionType === 'short' || props.$variant === 'sell' ?
                `${props.theme?.error || '#ef4444'}80` :
                `${props.theme?.success || '#10b981'}80`
        };
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const LoadingSpinner = styled(RefreshCw)`
    animation: ${spin} 1s linear infinite;
`;

const PositionsList = styled.div`
    margin-top: 2rem;
`;

const PositionsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const PositionsTitle = styled.h3`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 1.2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: ${props => `${props.theme?.brand?.primary || '#00adef'}33`};
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const PositionCard = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => 
        props.$positionType === 'short' ? `${props.theme?.error || '#ef4444'}4D` : `${props.theme?.success || '#10b981'}4D`
    };
    border-left: 4px solid ${props => props.$positive ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        transform: translateX(5px);
    }
`;

const PositionTypeBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    background: ${props => props.$short ?
        `${props.theme?.error || '#ef4444'}33` :
        `${props.theme?.success || '#10b981'}33`
    };
    border: 1px solid ${props => props.$short ?
        `${props.theme?.error || '#ef4444'}66` :
        `${props.theme?.success || '#10b981'}66`
    };
    border-radius: 6px;
    color: ${props => props.$short ? (props.theme?.error || '#ef4444') : (props.theme?.success || '#10b981')};
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const LeverageBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    background: ${props => {
        if (props.$leverage >= 20) return `${props.theme?.error || '#dc2626'}33`;
        if (props.$leverage >= 7) return `${props.theme?.error || '#ef4444'}33`;
        if (props.$leverage >= 5) return `${props.theme?.warning || '#f59e0b'}33`;
        return `${props.theme?.success || '#10b981'}33`;
    }};
    color: ${props => {
        if (props.$leverage >= 20) return props.theme?.error || '#dc2626';
        if (props.$leverage >= 7) return props.theme?.error || '#ef4444';
        if (props.$leverage >= 5) return props.theme?.warning || '#f59e0b';
        return props.theme?.success || '#10b981';
    }};
    border: 1px solid ${props => {
        if (props.$leverage >= 20) return `${props.theme?.error || '#dc2626'}66`;
        if (props.$leverage >= 7) return `${props.theme?.error || '#ef4444'}66`;
        if (props.$leverage >= 5) return `${props.theme?.warning || '#f59e0b'}66`;
        return `${props.theme?.success || '#10b981'}66`;
    }};
`;

const ExpandIcon = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    transition: transform 0.3s ease;
    transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ExpandedDetails = styled.div`
    max-height: ${props => props.$expanded ? '600px' : '0'};
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    opacity: ${props => props.$expanded ? '1' : '0'};
`;

const ExpandedContent = styled.div`
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px dashed ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
`;

const ExpandedGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
`;

const ExpandedItem = styled.div`
    padding: 1rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border-radius: 10px;
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
`;

const ExpandedLabel = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
`;

const ExpandedValue = styled.div`
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 700;
`;

const PositionNotes = styled.div`
    padding: 1rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border-radius: 10px;
    border-left: 3px solid ${props => props.theme?.brand?.primary || '#00adef'};
    margin-bottom: 1rem;
`;

const NotesLabel = styled.div`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const NotesText = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    line-height: 1.5;
`;

const PositionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
`;

const PositionSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PositionPL = styled.div`
    text-align: right;
`;

const PLValue = styled.div`
    font-size: 1.2rem;
    font-weight: 900;
    color: ${props => props.$positive ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PLPercent = styled.div`
    font-size: 0.9rem;
    color: ${props => props.$positive ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
`;

const PositionDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}33`};
`;

const PositionDetail = styled.div``;

const DetailLabel = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
    font-weight: 600;
`;

const SellButton = styled.button`
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    background: ${props => props.$cover ?
        `linear-gradient(135deg, ${props.theme?.success || '#10b981'} 0%, ${props.theme?.success || '#059669'} 100%)` :
        `linear-gradient(135deg, ${props.theme?.error || '#ef4444'} 0%, ${props.theme?.error || '#dc2626'} 100%)`
    };
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => props.$cover ?
            `${props.theme?.success || '#10b981'}66` :
            `${props.theme?.error || '#ef4444'}66`
        };
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyText = styled.div`
    font-size: 1.1rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const OrdersHistory = styled.div`
    margin-top: 2rem;
`;

const OrderCard = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
    }
`;

const OrderHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
`;

const OrderSide = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: ${props => {
        if (props.$side === 'buy') return `${props.theme?.success || '#10b981'}33`;
        if (props.$side === 'cover') return `${props.theme?.brand?.primary || '#00adef'}33`;
        return `${props.theme?.error || '#ef4444'}33`;
    }};
    border-radius: 8px;
    color: ${props => {
        if (props.$side === 'buy') return props.theme?.success || '#10b981';
        if (props.$side === 'cover') return props.theme?.brand?.primary || '#00adef';
        return props.theme?.error || '#ef4444';
    }};
    font-weight: 700;
    font-size: 0.9rem;
`;

const OrderTime = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

const OrderDetails = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const OrderInfo = styled.div`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const OrderSymbol = styled.span`
    font-weight: 900;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 1.1rem;
`;

const OrderQty = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    margin-left: 0.5rem;
`;

const OrderAmount = styled.div`
    text-align: right;
`;

const Amount = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const OrderPL = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$positive ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    font-weight: 600;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;

    @media (max-width: 1400px) {
        display: none;
    }
`;

const StatsPanel = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const StatRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};

    &:last-child {
        border-bottom: none;
    }
`;

const StatRowLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatRowValue = styled.div`
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 700;
`;

const BadgeContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}33`};
`;

const Badge = styled.div`
    padding: 0.5rem 1rem;
    background: ${props => props.$gradient || `${props.theme?.brand?.primary || '#00adef'}33`};
    border: 1px solid ${props => props.$borderColor || `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 20px;
    color: ${props => props.$color || props.theme?.brand?.primary || '#00adef'};
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const LeaderboardPreview = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const LeaderboardItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border-radius: 10px;
    margin-bottom: 0.75rem;

    &:hover {
        background: ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};
    }
`;

const Rank = styled.div`
    width: 40px;
    height: 40px;
    background: ${props => {
        if (props.$rank === 1) return `linear-gradient(135deg, ${props.theme?.warning || '#fbbf24'} 0%, ${props.theme?.warning || '#f59e0b'} 100%)`;
        if (props.$rank === 2) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)';
        return `${props.theme?.brand?.primary || '#00adef'}33`;
    }};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.2rem;
    color: white;
`;

const TraderInfo = styled.div`
    flex: 1;
`;

const TraderName = styled.div`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-weight: 700;
    margin-bottom: 0.25rem;
`;

const TraderReturn = styled.div`
    color: ${props => props.$positive ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    font-size: 0.9rem;
    font-weight: 600;
`;

const ViewAllButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, ${props => `${props.theme?.brand?.primary || '#00adef'}33`} 0%, ${props => `${props.theme?.brand?.primary || '#00adef'}1A`} 100%);
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;

    &:hover {
        background: linear-gradient(135deg, ${props => `${props.theme?.brand?.primary || '#00adef'}4D`} 0%, ${props => `${props.theme?.brand?.primary || '#00adef'}33`} 100%);
        transform: translateY(-2px);
    }
`;

const ConfirmationModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ConfirmationCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 2px solid ${props => props.$variant === 'sell' ? (props.theme?.error || '#ef4444') : (props.theme?.success || '#10b981')};
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${slideIn} 0.3s ease-out;
`;

const ConfirmationTitle = styled.h3`
    color: ${props => props.$variant === 'sell' ? (props.theme?.error || '#ef4444') : (props.theme?.success || '#10b981')};
    font-size: 1.8rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ConfirmationDetails = styled.div`
    background: ${props => `${props.theme?.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid ${props => `${props.theme?.brand?.primary || '#00adef'}1A`};

    &:last-child {
        border-bottom: none;
    }
`;

const DetailLabelModal = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.95rem;
`;

const DetailValueModal = styled.span`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 700;
`;

const ConfirmationButtons = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
`;

const CancelButton = styled.button`
    flex: 1;
    padding: 1rem;
    background: rgba(100, 116, 139, 0.2);
    border: 2px solid rgba(100, 116, 139, 0.4);
    border-radius: 12px;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(100, 116, 139, 0.3);
        border-color: rgba(100, 116, 139, 0.6);
        transform: translateY(-2px);
    }
`;

const ConfirmButton = styled.button`
    flex: 1;
    padding: 1rem;
    background: ${props => props.$variant === 'sell' ?
        `linear-gradient(135deg, ${props.theme?.error || '#ef4444'} 0%, ${props.theme?.error || '#dc2626'} 100%)` :
        `linear-gradient(135deg, ${props.theme?.success || '#10b981'} 0%, ${props.theme?.success || '#059669'} 100%)`
    };
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.$variant === 'sell' ?
            `${props.theme?.error || '#ef4444'}80` :
            `${props.theme?.success || '#10b981'}80`
        };
    }
`;

const TPSLSection = styled.div`
    padding: 1.25rem;
    background: ${props => `${props.theme?.brand?.accent || '#8b5cf6'}0D`};
    border: 1px solid ${props => `${props.theme?.brand?.accent || '#8b5cf6'}4D`};
    border-radius: 12px;
    margin-top: 0.5rem;
`;

const TPSLHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    cursor: pointer;
`;

const TPSLTitle = styled.div`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 0.95rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TPSLToggle = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.2s;
    
    &:hover {
        color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    }
`;

const TPSLContent = styled.div`
    display: ${props => props.$expanded ? 'block' : 'none'};
`;

const TPSLGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const TPSLInputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const TPSLLabel = styled.label`
    color: ${props => props.$tp ? (props.theme?.success || '#10b981') : props.$sl ? (props.theme?.error || '#ef4444') : (props.theme?.warning || '#f59e0b')};
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

const TPSLInput = styled.input`
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid ${props => props.$tp ? `${props.theme?.success || '#10b981'}4D` : props.$sl ? `${props.theme?.error || '#ef4444'}4D` : `${props.theme?.warning || '#f59e0b'}4D`};
    border-radius: 8px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.$tp ? (props.theme?.success || '#10b981') : props.$sl ? (props.theme?.error || '#ef4444') : (props.theme?.warning || '#f59e0b')};
        box-shadow: 0 0 10px ${props => props.$tp ? `${props.theme?.success || '#10b981'}4D` : props.$sl ? `${props.theme?.error || '#ef4444'}4D` : `${props.theme?.warning || '#f59e0b'}4D`};
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const TPSLHint = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    line-height: 1.4;
`;

const TrailingStopSection = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed ${props => `${props.theme?.brand?.accent || '#8b5cf6'}4D`};
`;

const TPSLBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    background: ${props => props.$type === 'tp' ? `${props.theme?.success || '#10b981'}33` : 
                          props.$type === 'sl' ? `${props.theme?.error || '#ef4444'}33` : 
                          `${props.theme?.warning || '#f59e0b'}33`};
    color: ${props => props.$type === 'tp' ? (props.theme?.success || '#10b981') : 
                      props.$type === 'sl' ? (props.theme?.error || '#ef4444') : 
                      (props.theme?.warning || '#f59e0b')};
    border: 1px solid ${props => props.$type === 'tp' ? `${props.theme?.success || '#10b981'}66` : 
                                 props.$type === 'sl' ? `${props.theme?.error || '#ef4444'}66` : 
                                 `${props.theme?.warning || '#f59e0b'}66`};
`;

const TPSLBadgeContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

// ============ SEARCH AUTOCOMPLETE COMPONENTS ============
const SearchContainer = styled.div`
    position: relative;
    width: 100%;
`;

const SearchResultsDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.bg?.secondary || 'rgba(15, 23, 42, 0.98)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    margin-top: 0.5rem;
    max-height: 350px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: ${fadeIn} 0.2s ease-out;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
        border-radius: 3px;
    }
`;

const SearchResultSection = styled.div`
    padding: 0.5rem 0;

    &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    }
`;

const SearchResultSectionTitle = styled.div`
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SearchResultItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    }
`;

const SearchResultInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const SearchResultSymbol = styled.span`
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
`;

const SearchResultName = styled.span`
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const SearchResultType = styled.span`
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
    background: ${({ $type, theme }) => $type === 'crypto'
        ? `${theme.warning || '#f59e0b'}33`
        : `${theme.success || '#10b981'}33`};
    color: ${({ $type, theme }) => $type === 'crypto'
        ? (theme.warning || '#f59e0b')
        : (theme.success || '#10b981')};
`;

const SearchNoResults = styled.div`
    padding: 1.5rem;
    text-align: center;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
`;

const SearchLoading = styled.div`
    padding: 1rem;
    text-align: center;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.9rem;
`;

// Smart price formatter based on asset type
const formatAssetPrice = (price, assetType = 'stock') => {
    if (assetType === 'crypto') {
        return formatCryptoPrice(price);
    }
    return formatStockPrice(price);
};


// ============ MAIN COMPONENT ============
const PaperTradingPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();

    // State
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('buy');
    const [submitting, setSubmitting] = useState(false);
    const [refreshingPrices, setRefreshingPrices] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingTrade, setPendingTrade] = useState(null);
    const [expandedPositions, setExpandedPositions] = useState({});
    const [leverage, setLeverage] = useState(1);
    const [positionType, setPositionType] = useState('long');
    const [symbol, setSymbol] = useState('');
    const [type, setType] = useState('stock');
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [showTPSL, setShowTPSL] = useState(false);

    // Search autocomplete state
    const [searchResults, setSearchResults] = useState({ stocks: [], crypto: [] });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchContainerRef = useRef(null);
    const [takeProfit, setTakeProfit] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    const [trailingStopPercent, setTrailingStopPercent] = useState('');
    const [orders, setOrders] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetting, setResetting] = useState(false);

    const togglePositionExpand = (positionKey) => {
        setExpandedPositions(prev => ({
            ...prev,
            [positionKey]: !prev[positionKey]
        }));
    };

    const loadAccount = async () => {
        setLoading(true);
        try {
            const response = await api.get('/paper-trading/account');
            setAccount(response.data.account);
        } catch (error) {
            console.error('Load account error:', error);
            toast.error('Failed to load account', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const response = await api.get('/paper-trading/orders?limit=10');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Load orders error:', error);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const response = await api.get('/paper-trading/leaderboard?limit=5');
            setLeaderboard(response.data.leaderboard || []);
        } catch (error) {
            console.error('Load leaderboard error:', error);
        }
    };

    const resetAccount = async () => {
        setResetting(true);
        try {
            const response = await api.post('/paper-trading/reset');
            setAccount(response.data.account);
            setOrders([]);
            setShowResetConfirm(false);
            toast.success('Account reset to $100,000!', 'Reset Complete');
        } catch (error) {
            console.error('Reset account error:', error);
            toast.error('Failed to reset account', 'Error');
        } finally {
            setResetting(false);
        }
    };

    // Search for stocks/crypto
    const searchSymbols = useCallback(async (query) => {
        if (!query || query.length < 1) {
            setSearchResults({ stocks: [], crypto: [] });
            setShowSearchResults(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
            setSearchResults({
                stocks: response.data.stocks || [],
                crypto: response.data.crypto || []
            });
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults({ stocks: [], crypto: [] });
        } finally {
            setIsSearching(false);
        }
    }, [api]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (symbol && symbol.length >= 1) {
                searchSymbols(symbol);
            } else {
                setSearchResults({ stocks: [], crypto: [] });
                setShowSearchResults(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [symbol, searchSymbols]);

    // Click outside to close search results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle selecting a search result with validation
    const handleSelectSearchResult = async (result) => {
        setSymbol(result.symbol);
        setType(result.type === 'crypto' ? 'crypto' : 'stock');
        setShowSearchResults(false);
        setLoadingPrice(true);

        try {
            // Build validation URL - include coinGeckoId for crypto to improve accuracy
            let validateUrl = `/paper-trading/validate/${result.symbol}/${result.type}`;
            if (result.type === 'crypto' && result.coinGeckoId) {
                validateUrl += `?coinGeckoId=${encodeURIComponent(result.coinGeckoId)}`;
            }

            // Validate that the symbol is tradeable (has price data available)
            const response = await api.get(validateUrl);

            if (response.data.tradeable) {
                setCurrentPrice(response.data.price);
                toast.success(`${result.symbol} @ $${response.data.price.toFixed(2)}`, 'Price loaded');
            } else {
                toast.error(
                    `${result.symbol} price data unavailable. Try another ${result.type === 'crypto' ? 'crypto' : 'stock'}.`,
                    'Cannot Trade'
                );
                setCurrentPrice(null);
            }
        } catch (error) {
            console.error('Validation error:', error);
            // Still allow manual trading attempt
        } finally {
            setLoadingPrice(false);
        }
    };

    const fetchPrice = async () => {
        if (!symbol) return;
        setLoadingPrice(true);
        try {
            const response = await api.get(`/paper-trading/price/${symbol.toUpperCase()}/${type}`);
            setCurrentPrice(response.data.price);
        } catch (error) {
            console.error('Fetch price error:', error);
            setCurrentPrice(null);
        } finally {
            setLoadingPrice(false);
        }
    };

    const handleRefreshPrices = async () => {
        if (refreshingPrices) return;
        setRefreshingPrices(true);
        try {
            const response = await api.post('/paper-trading/refresh-prices');
            setAccount(response.data.account);
            if (response.data.triggered && response.data.triggered.length > 0) {
                response.data.triggered.forEach(trigger => {
                    const triggerLabel = trigger.type === 'take_profit' ? '🎯 Take Profit' :
                                        trigger.type === 'stop_loss' ? '🛑 Stop Loss' :
                                        trigger.type === 'trailing_stop' ? '📉 Trailing Stop' :
                                        trigger.type === 'liquidation' ? '💀 Liquidated' : 'Auto-Closed';
                    const message = `${trigger.symbol}: ${trigger.profitLoss >= 0 ? '+' : ''}$${trigger.profitLoss.toFixed(2)} (${trigger.profitLossPercent >= 0 ? '+' : ''}${trigger.profitLossPercent.toFixed(2)}%)`;
                    if (trigger.type === 'liquidation') {
                        toast.error(message, triggerLabel);
                    } else if (trigger.profitLoss >= 0) {
                        toast.success(message, triggerLabel);
                    } else {
                        toast.warning(message, triggerLabel);
                    }
                });
            } else {
                toast.success('Prices updated', 'Success');
            }
        } catch (error) {
            console.error('Refresh prices error:', error);
            toast.error('Failed to refresh prices', 'Error');
        } finally {
            setRefreshingPrices(false);
        }
    };

    const validateTPSL = () => {
        if (!currentPrice) return { valid: true };
        const tp = takeProfit ? parseFloat(takeProfit) : null;
        const sl = stopLoss ? parseFloat(stopLoss) : null;
        const trailing = trailingStopPercent ? parseFloat(trailingStopPercent) : null;
        const errors = [];
        if (positionType === 'long') {
            if (tp && tp <= currentPrice) errors.push('Take Profit must be above current price for long positions');
            if (sl && sl >= currentPrice) errors.push('Stop Loss must be below current price for long positions');
        } else {
            if (tp && tp >= currentPrice) errors.push('Take Profit must be below current price for short positions');
            if (sl && sl <= currentPrice) errors.push('Stop Loss must be above current price for short positions');
        }
        if (trailing && (trailing <= 0 || trailing > 50)) errors.push('Trailing Stop must be between 0.1% and 50%');
        return { valid: errors.length === 0, errors };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symbol || !quantity) { toast.warning('Please fill in all fields', 'Missing Fields'); return; }
        if (parseFloat(quantity) <= 0) { toast.warning('Quantity must be greater than 0', 'Invalid Quantity'); return; }
        if (!currentPrice) { toast.warning('Waiting for price data...', 'Please Wait'); return; }
        const tpslValidation = validateTPSL();
        if (!tpslValidation.valid) { tpslValidation.errors.forEach(err => toast.error(err, 'Invalid TP/SL')); return; }
        const tradeAmount = currentPrice * parseFloat(quantity);
        setPendingTrade({
            action: activeTab, positionType, symbol: symbol.toUpperCase(), type,
            quantity: parseFloat(quantity), price: currentPrice, total: tradeAmount, notes, leverage,
            leveragedValue: tradeAmount * leverage,
            takeProfit: takeProfit ? parseFloat(takeProfit) : null,
            stopLoss: stopLoss ? parseFloat(stopLoss) : null,
            trailingStopPercent: trailingStopPercent ? parseFloat(trailingStopPercent) : null
        });
        setShowConfirmation(true);
    };

    const executeTradeSubmit = async () => {
    if (!pendingTrade) return;
    setShowConfirmation(false);
    setSubmitting(true);
    try {
        let endpoint;
        if (pendingTrade.positionType === 'short' && pendingTrade.action === 'sell') {
            endpoint = '/paper-trading/cover';
        } else {
            endpoint = pendingTrade.action === 'buy' ? '/paper-trading/buy' : '/paper-trading/sell';
        }
        const requestBody = {
            symbol: pendingTrade.symbol, 
            type: pendingTrade.type, 
            quantity: pendingTrade.quantity,
            positionType: pendingTrade.positionType, 
            notes: pendingTrade.notes, 
            leverage: pendingTrade.leverage
        };
        if (pendingTrade.action === 'buy') {
            if (pendingTrade.takeProfit) requestBody.takeProfit = pendingTrade.takeProfit;
            if (pendingTrade.stopLoss) requestBody.stopLoss = pendingTrade.stopLoss;
            if (pendingTrade.trailingStopPercent) requestBody.trailingStopPercent = pendingTrade.trailingStopPercent;
        }
        const response = await api.post(endpoint, requestBody);
        
        setAccount(response.data.account);
        
        // ✅ UPDATE USER GAMIFICATION DATA
        if (response.data.gamification) {
            console.log('[Trade] Updating user gamification:', response.data.gamification);
            
            // Update user in context with new gamification data
            const updatedUser = {
                ...user,
                gamification: response.data.gamification
            };
            
            // Update local user state (if you have setUser from context)
            if (typeof user !== 'undefined') {
                // Trigger a re-render by updating the user object
                window.dispatchEvent(new CustomEvent('userUpdated', { 
                    detail: updatedUser 
                }));
            }
        }
        
        // ✅ SHOW XP REWARD NOTIFICATION
        if (response.data.xpReward && response.data.xpReward.rewards) {
            toast.success(
                response.data.xpReward.rewards.join(' • '), 
                '🎮 Rewards Earned!'
            );
        }
        
        toast.success(response.data.message, 'Success');
        
        if ((pendingTrade.action === 'sell' || endpoint === '/paper-trading/cover') && response.data.profitLoss !== undefined) {
            const pl = response.data.profitLoss;
            const plPercent = response.data.profitLossPercent;
            const message = pl >= 0 
                ? `Profit: $${pl.toFixed(2)} (+${plPercent.toFixed(2)}%)` 
                : `Loss: $${Math.abs(pl).toFixed(2)} (${plPercent.toFixed(2)}%)`;
            toast.info(message, pl >= 0 ? '💰 Nice Trade!' : '📉 Trade Closed');
        }
        
        setSymbol(''); 
        setQuantity(''); 
        setNotes(''); 
        setCurrentPrice(null); 
        setPendingTrade(null);
        setLeverage(1); 
        setTakeProfit(''); 
        setStopLoss(''); 
        setTrailingStopPercent(''); 
        setShowTPSL(false);
        loadOrders();
        
        // ✅ FORCE USER REFRESH (backup method)
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('Trade error:', error);
        toast.error(error.response?.data?.error || 'Trade failed', 'Error');
    } finally {
        setSubmitting(false);
    }
};
    const handleQuickSell = (position) => {
        setActiveTab('sell'); setSymbol(position.symbol); setType(position.type);
        setQuantity(position.quantity.toString()); setPositionType(position.positionType || 'long');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCoverShort = async (position) => {
        if (!position || position.positionType !== 'short') return;
        setSubmitting(true);
        try {
            const response = await api.post('/paper-trading/cover', { symbol: position.symbol, type: position.type, quantity: position.quantity });
            setAccount(response.data.account);
            toast.success(response.data.message, '✅ Short Covered!');
            if (response.data.profitLoss !== undefined) {
                const pl = response.data.profitLoss;
                const plPercent = response.data.profitLossPercent;
                const message = pl >= 0 ? `Profit: $${pl.toFixed(2)} (+${plPercent.toFixed(2)}%)` : `Loss: $${Math.abs(pl).toFixed(2)} (${plPercent.toFixed(2)}%)`;
                toast.info(message, pl >= 0 ? '💰 Nice Trade!' : '📉 Position Closed');
            }
            loadOrders();
        } catch (error) {
            console.error('Cover error:', error);
            toast.error(error.response?.data?.error || 'Failed to cover short', 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    const formatPercent = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    const calculateTotal = () => (!currentPrice || !quantity) ? 0 : currentPrice * parseFloat(quantity);
    const getDisplayName = (trader) => {
        if (!trader.user) return 'Anonymous';
        return trader.user.profile?.displayName || trader.user.username || trader.user.name || 'Anonymous';
    };

    useEffect(() => {
        const init = async () => {
            await loadAccount();
            loadOrders();
            loadLeaderboard();
            // Refresh prices immediately after loading to get current portfolio values
            // Direct API call to avoid closure issues with handleRefreshPrices
            try {
                const response = await api.post('/paper-trading/refresh-prices');
                if (response.data.success && response.data.account) {
                    setAccount(response.data.account);
                    console.log('[PaperTrading] Initial price refresh completed');
                }
            } catch (e) {
                console.error('[PaperTrading] Initial price refresh failed:', e);
            }
        };
        init();
        const priceRefreshInterval = setInterval(() => { handleRefreshPrices(); }, 15000); // 15 seconds
        return () => { clearInterval(priceRefreshInterval); };
    }, []);

    useEffect(() => {
        if (symbol && symbol.length > 0) { fetchPrice(); } else { setCurrentPrice(null); }
    }, [symbol, type]);

    useEffect(() => {
        setLeverage(1); setTakeProfit(''); setStopLoss(''); setTrailingStopPercent('');
    }, [positionType, activeTab]);

    if (loading) {
        return (
            <PageContainer theme={theme}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <LoadingSpinner size={64} />
                </div>
            </PageContainer>
        );
    }

    return (
        <>
            {showConfirmation && pendingTrade && (
                <ConfirmationModal onClick={() => setShowConfirmation(false)}>
                    <ConfirmationCard theme={theme} $variant={pendingTrade.action} onClick={(e) => e.stopPropagation()}>
                        <ConfirmationTitle theme={theme} $variant={pendingTrade.action}>
                            {pendingTrade.action === 'buy' ? <Plus size={32} /> : <Minus size={32} />}
                            Confirm {pendingTrade.positionType === 'short' ? (pendingTrade.action === 'sell' ? 'Cover' : 'Short') : (pendingTrade.action === 'buy' ? 'Purchase' : 'Sale')}
                        </ConfirmationTitle>
                        <ConfirmationDetails theme={theme}>
                            <DetailRow theme={theme}><DetailLabelModal theme={theme}>Symbol</DetailLabelModal><DetailValueModal theme={theme}>{pendingTrade.symbol}</DetailValueModal></DetailRow>
                            <DetailRow theme={theme}><DetailLabelModal theme={theme}>Type</DetailLabelModal><DetailValueModal theme={theme} style={{ textTransform: 'capitalize' }}>{pendingTrade.type}</DetailValueModal></DetailRow>
                            <DetailRow theme={theme}><DetailLabelModal theme={theme}>Position Type</DetailLabelModal><DetailValueModal theme={theme} style={{ color: pendingTrade.positionType === 'short' ? (theme?.error || '#ef4444') : (theme?.success || '#10b981'), textTransform: 'uppercase' }}>{pendingTrade.positionType}</DetailValueModal></DetailRow>
                            <DetailRow theme={theme}><DetailLabelModal theme={theme}>Quantity</DetailLabelModal><DetailValueModal theme={theme}>{pendingTrade.quantity.toLocaleString()}</DetailValueModal></DetailRow>
                            <DetailRow theme={theme}><DetailLabelModal theme={theme}>Price per Share</DetailLabelModal><DetailValueModal theme={theme}>{formatAssetPrice(pendingTrade.price, pendingTrade.type)}</DetailValueModal></DetailRow>
                            {pendingTrade.leverage > 1 && (
                                <>
                                    <DetailRow theme={theme}><DetailLabelModal theme={theme}>Leverage</DetailLabelModal><DetailValueModal theme={theme} style={{ color: pendingTrade.leverage >= 10 ? (theme?.error || '#ef4444') : pendingTrade.leverage >= 5 ? (theme?.warning || '#f59e0b') : (theme?.success || '#10b981') }}>{pendingTrade.leverage}x</DetailValueModal></DetailRow>
                                    <DetailRow theme={theme}><DetailLabelModal theme={theme}>Margin (Your Cost)</DetailLabelModal><DetailValueModal theme={theme}>{formatCurrency(pendingTrade.total)}</DetailValueModal></DetailRow>
                                    <DetailRow theme={theme}><DetailLabelModal theme={theme}>Position Size</DetailLabelModal><DetailValueModal theme={theme} style={{ color: theme?.brand?.primary || '#00adef' }}>{formatCurrency(pendingTrade.leveragedValue)}</DetailValueModal></DetailRow>
                                </>
                            )}
                            {(pendingTrade.takeProfit || pendingTrade.stopLoss || pendingTrade.trailingStopPercent) && (
                                <>
                                    <DetailRow theme={theme} style={{ borderTop: `1px dashed ${theme?.brand?.accent || '#8b5cf6'}4D`, marginTop: '0.5rem', paddingTop: '1rem' }}><DetailLabelModal theme={theme} style={{ color: theme?.brand?.accent || '#a78bfa' }}>🎯 Risk Management</DetailLabelModal><DetailValueModal theme={theme}></DetailValueModal></DetailRow>
                                    {pendingTrade.takeProfit && <DetailRow theme={theme}><DetailLabelModal theme={theme}>Take Profit</DetailLabelModal><DetailValueModal theme={theme} style={{ color: theme?.success || '#10b981' }}>{formatAssetPrice(pendingTrade.takeProfit, pendingTrade.type)}</DetailValueModal></DetailRow>}
                                    {pendingTrade.stopLoss && <DetailRow theme={theme}><DetailLabelModal theme={theme}>Stop Loss</DetailLabelModal><DetailValueModal theme={theme} style={{ color: theme?.error || '#ef4444' }}>{formatAssetPrice(pendingTrade.stopLoss, pendingTrade.type)}</DetailValueModal></DetailRow>}
                                    {pendingTrade.trailingStopPercent && <DetailRow theme={theme}><DetailLabelModal theme={theme}>Trailing Stop</DetailLabelModal><DetailValueModal theme={theme} style={{ color: theme?.warning || '#f59e0b' }}>{pendingTrade.trailingStopPercent}%</DetailValueModal></DetailRow>}
                                </>
                            )}
                            <DetailRow theme={theme} style={{ borderTop: `2px solid ${theme?.brand?.primary || '#00adef'}4D`, paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <DetailLabelModal theme={theme} style={{ fontSize: '1.1rem', color: theme?.brand?.primary || '#00adef' }}>{pendingTrade.leverage > 1 ? 'Margin Required' : `Total ${pendingTrade.action === 'buy' ? 'Cost' : 'Revenue'}`}</DetailLabelModal>
                                <DetailValueModal theme={theme} style={{ fontSize: '1.5rem', color: theme?.success || '#00ff88' }}>{formatCurrency(pendingTrade.total)}</DetailValueModal>
                            </DetailRow>
                        </ConfirmationDetails>
                        {pendingTrade.leverage > 1 && (
                            <RiskWarning theme={theme} style={{ margin: '1rem 0', animation: 'none' }}>
                                <RiskWarningIcon theme={theme}><AlertTriangle size={20} /></RiskWarningIcon>
                                <RiskWarningContent>
                                    <RiskWarningTitle theme={theme}>⚡ {pendingTrade.leverage}x Leveraged Position</RiskWarningTitle>
                                    <RiskWarningText>Your {formatCurrency(pendingTrade.total)} margin controls a {formatCurrency(pendingTrade.leveragedValue)} position. Gains AND losses are multiplied by {pendingTrade.leverage}x. A {(90 / pendingTrade.leverage).toFixed(1)}% adverse move triggers liquidation.</RiskWarningText>
                                </RiskWarningContent>
                            </RiskWarning>
                        )}
                        {pendingTrade.positionType === 'short' && pendingTrade.action === 'buy' && pendingTrade.leverage === 1 && (
                            <RiskWarning theme={theme} style={{ margin: '1rem 0', animation: 'none' }}>
                                <RiskWarningIcon theme={theme}><AlertTriangle size={20} /></RiskWarningIcon>
                                <RiskWarningContent>
                                    <RiskWarningTitle theme={theme}>Short Position Risk</RiskWarningTitle>
                                    <RiskWarningText>You're betting the price will go down. Losses can exceed your initial investment.</RiskWarningText>
                                </RiskWarningContent>
                            </RiskWarning>
                        )}
                        {pendingTrade.notes && (
                            <div style={{ padding: '1rem', background: `${theme?.brand?.primary || '#00adef'}0D`, borderRadius: '8px', marginBottom: '1rem' }}>
                                <div style={{ color: theme?.text?.secondary || '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Your Notes:</div>
                                <div style={{ color: theme?.text?.primary || '#e0e6ed', fontSize: '0.95rem' }}>{pendingTrade.notes}</div>
                            </div>
                        )}
                        <ConfirmationButtons>
                            <CancelButton theme={theme} onClick={() => setShowConfirmation(false)}>Cancel</CancelButton>
                            <ConfirmButton theme={theme} $variant={pendingTrade.action} onClick={executeTradeSubmit}>
                                Confirm {pendingTrade.positionType === 'short' ? (pendingTrade.action === 'sell' ? 'Cover' : 'Short') : (pendingTrade.action === 'buy' ? 'Buy' : 'Sell')}
                            </ConfirmButton>
                        </ConfirmationButtons>
                    </ConfirmationCard>
                </ConfirmationModal>
            )}

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <ConfirmationModal onClick={() => setShowResetConfirm(false)}>
                    <ConfirmationCard theme={theme} $variant="sell" onClick={(e) => e.stopPropagation()}>
                        <ConfirmationTitle theme={theme} $variant="sell">
                            <AlertTriangle size={32} />
                            Reset Account?
                        </ConfirmationTitle>
                        <ConfirmationDetails theme={theme}>
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ color: theme?.text?.primary || '#e0e6ed', fontSize: '1.1rem', marginBottom: '1rem' }}>
                                    This will reset your paper trading account to $100,000.
                                </p>
                                <p style={{ color: theme?.error || '#ef4444', fontSize: '0.95rem' }}>
                                    All positions, orders, and trading history will be permanently deleted.
                                </p>
                            </div>
                        </ConfirmationDetails>
                        <ConfirmationButtons>
                            <CancelButton theme={theme} onClick={() => setShowResetConfirm(false)}>Cancel</CancelButton>
                            <ConfirmButton theme={theme} $variant="sell" onClick={resetAccount} disabled={resetting}>
                                {resetting ? 'Resetting...' : 'Reset Account'}
                            </ConfirmButton>
                        </ConfirmationButtons>
                    </ConfirmationCard>
                </ConfirmationModal>
            )}

            <PageContainer theme={theme}>
                <Header>
                    <Title theme={theme}><Trophy size={56} color={theme?.brand?.primary || '#00adef'} />Paper Trading</Title>
                    <Subtitle theme={theme}>Practice trading with $100,000 virtual cash - Risk free!</Subtitle>
                    <PoweredBy theme={theme}>
                        <Zap size={18} />Real-Time Prices • Long & Short • Up to 20x Leverage • TP/SL Orders
                        <span style={{ marginLeft: '10px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme?.success || '#10b981', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
                    </PoweredBy>
                </Header>

                <PortfolioOverview>
                    <StatCard theme={theme} $borderColor={`${theme?.brand?.primary || '#00adef'}80`} $shadowColor={`${theme?.brand?.primary || '#00adef'}4D`}>
                        <StatIcon theme={theme} $background={`${theme?.brand?.primary || '#00adef'}33`}><DollarSign size={32} color={theme?.brand?.primary || '#00adef'} /></StatIcon>
                        <StatLabel theme={theme}>Portfolio Value</StatLabel>
                        <StatValue theme={theme} $color={theme?.brand?.primary || '#00adef'}>{formatCurrency(account?.portfolioValue || 0)}</StatValue>
                        <StatChange theme={theme} $positive={account?.totalProfitLoss >= 0}>{account?.totalProfitLoss >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}{formatCurrency(Math.abs(account?.totalProfitLoss || 0))}</StatChange>
                    </StatCard>
                    <StatCard theme={theme} $borderColor={`${theme?.success || '#10b981'}80`} $shadowColor={`${theme?.success || '#10b981'}4D`} $gradient={`linear-gradient(90deg, ${theme?.success || '#10b981'}, ${theme?.success || '#059669'})`}>
                        <StatIcon theme={theme} $background={`${theme?.success || '#10b981'}33`}><Activity size={32} color={theme?.success || '#10b981'} /></StatIcon>
                        <StatLabel theme={theme}>Total Return</StatLabel>
                        <StatValue theme={theme} $color={account?.totalProfitLoss >= 0 ? (theme?.success || '#10b981') : (theme?.error || '#ef4444')}>{formatPercent(account?.totalProfitLossPercent || 0)}</StatValue>
                        <StatChange theme={theme} $positive={account?.totalProfitLoss >= 0}>{account?.winningTrades || 0}W / {account?.losingTrades || 0}L</StatChange>
                    </StatCard>
                    <StatCard theme={theme} $borderColor={`${theme?.brand?.accent || '#8b5cf6'}80`} $shadowColor={`${theme?.brand?.accent || '#8b5cf6'}4D`} $gradient={`linear-gradient(90deg, ${theme?.brand?.accent || '#8b5cf6'}, ${theme?.brand?.accent || '#7c3aed'})`}>
                        <StatIcon theme={theme} $background={`${theme?.brand?.accent || '#8b5cf6'}33`}><BarChart3 size={32} color={theme?.brand?.accent || '#8b5cf6'} /></StatIcon>
                        <StatLabel theme={theme}>Cash Balance</StatLabel>
                        <StatValue theme={theme} $color={theme?.brand?.accent || '#8b5cf6'}>{formatCurrency(account?.cashBalance || 0)}</StatValue>
                        <StatChange theme={theme} $positive={true}>Available to trade</StatChange>
                    </StatCard>
                    <StatCard theme={theme} $borderColor={`${theme?.warning || '#f59e0b'}80`} $shadowColor={`${theme?.warning || '#f59e0b'}4D`} $gradient={`linear-gradient(90deg, ${theme?.warning || '#f59e0b'}, ${theme?.warning || '#d97706'})`}>
                        <StatIcon theme={theme} $background={`${theme?.warning || '#f59e0b'}33`}><Target size={32} color={theme?.warning || '#f59e0b'} /></StatIcon>
                        <StatLabel theme={theme}>Win Rate</StatLabel>
                        <StatValue theme={theme} $color={theme?.warning || '#f59e0b'}>{account?.winRate?.toFixed(1) || 0}%</StatValue>
                        <StatChange theme={theme} $positive={true}>{account?.totalTrades || 0} total trades</StatChange>
                    </StatCard>
                </PortfolioOverview>

                <ContentGrid>
                    <div>
                        <TradingPanel theme={theme}>
                            <PanelTitle theme={theme}><Send size={24} />Place Order</PanelTitle>
                            <PositionTypeSelector theme={theme}>
                                <PositionTypeButton theme={theme} $active={positionType === 'long'} $short={false} onClick={() => setPositionType('long')}>
                                    <PositionTypeLabel><TrendingUp size={24} />LONG</PositionTypeLabel>
                                    <PositionTypeDesc>Buy low, sell high</PositionTypeDesc>
                                </PositionTypeButton>
                                <PositionTypeButton theme={theme} $active={positionType === 'short'} $short={true} onClick={() => setPositionType('short')}>
                                    <PositionTypeLabel><TrendingDown size={24} />SHORT</PositionTypeLabel>
                                    <PositionTypeDesc>Sell high, buy low</PositionTypeDesc>
                                </PositionTypeButton>
                            </PositionTypeSelector>
                            {positionType === 'short' && (
                                <RiskWarning theme={theme}>
                                    <RiskWarningIcon theme={theme}><AlertTriangle size={24} /></RiskWarningIcon>
                                    <RiskWarningContent>
                                        <RiskWarningTitle theme={theme}>⚠️ High Risk Warning</RiskWarningTitle>
                                        <RiskWarningText>Short selling has unlimited risk. If the price rises instead of falls, your losses can exceed your initial investment. Only experienced traders should short sell.</RiskWarningText>
                                    </RiskWarningContent>
                                </RiskWarning>
                            )}
                            <TabButtons>
                                <TabButton theme={theme} $active={activeTab === 'buy'} onClick={() => setActiveTab('buy')}><Plus size={20} />{positionType === 'short' ? 'Short' : 'Buy'}</TabButton>
                                <TabButton theme={theme} $active={activeTab === 'sell'} onClick={() => setActiveTab('sell')}><Minus size={20} />{positionType === 'short' ? 'Cover' : 'Sell'}</TabButton>
                            </TabButtons>
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label theme={theme}><Search size={16} />Symbol</Label>
                                    <SearchContainer ref={searchContainerRef}>
                                        <Input
                                            theme={theme}
                                            type="text"
                                            placeholder="Search stocks or crypto... (e.g., AAPL, BTC)"
                                            value={symbol}
                                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                            onFocus={() => symbol.length >= 1 && setShowSearchResults(true)}
                                            required
                                            autoComplete="off"
                                        />
                                        {showSearchResults && (
                                            <SearchResultsDropdown theme={theme}>
                                                {isSearching ? (
                                                    <SearchLoading theme={theme}>
                                                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                        Searching...
                                                    </SearchLoading>
                                                ) : (searchResults.stocks.length === 0 && searchResults.crypto.length === 0) ? (
                                                    <SearchNoResults theme={theme}>
                                                        {symbol.length >= 1 ? `No results found for "${symbol}"` : 'Start typing to search...'}
                                                    </SearchNoResults>
                                                ) : (
                                                    <>
                                                        {searchResults.stocks.length > 0 && (
                                                            <SearchResultSection>
                                                                <SearchResultSectionTitle theme={theme}>
                                                                    <TrendingUp size={14} /> Stocks ({searchResults.stocks.length})
                                                                </SearchResultSectionTitle>
                                                                {searchResults.stocks.map((stock, idx) => (
                                                                    <SearchResultItem
                                                                        key={`stock-${stock.symbol}-${idx}`}
                                                                        theme={theme}
                                                                        onClick={() => handleSelectSearchResult(stock)}
                                                                    >
                                                                        <SearchResultInfo>
                                                                            <SearchResultSymbol theme={theme}>{stock.symbol}</SearchResultSymbol>
                                                                            <SearchResultName theme={theme}>{stock.name}</SearchResultName>
                                                                        </SearchResultInfo>
                                                                        <SearchResultType theme={theme} $type="stock">STOCK</SearchResultType>
                                                                    </SearchResultItem>
                                                                ))}
                                                            </SearchResultSection>
                                                        )}
                                                        {searchResults.crypto.length > 0 && (
                                                            <SearchResultSection>
                                                                <SearchResultSectionTitle theme={theme}>
                                                                    <DollarSign size={14} /> Crypto ({searchResults.crypto.length})
                                                                </SearchResultSectionTitle>
                                                                {searchResults.crypto.map((crypto, idx) => (
                                                                    <SearchResultItem
                                                                        key={`crypto-${crypto.symbol}-${idx}`}
                                                                        theme={theme}
                                                                        onClick={() => handleSelectSearchResult(crypto)}
                                                                    >
                                                                        <SearchResultInfo>
                                                                            <SearchResultSymbol theme={theme}>{crypto.symbol}</SearchResultSymbol>
                                                                            <SearchResultName theme={theme}>{crypto.name}</SearchResultName>
                                                                        </SearchResultInfo>
                                                                        <SearchResultType theme={theme} $type="crypto">CRYPTO</SearchResultType>
                                                                    </SearchResultItem>
                                                                ))}
                                                            </SearchResultSection>
                                                        )}
                                                    </>
                                                )}
                                            </SearchResultsDropdown>
                                        )}
                                    </SearchContainer>
                                </FormGroup>
                                <FormGroup><Label theme={theme}><Target size={16} />Asset Type</Label><Select theme={theme} value={type} onChange={(e) => setType(e.target.value)}><option value="stock">Stock</option><option value="crypto">Cryptocurrency</option></Select></FormGroup>
                                {currentPrice && !loadingPrice && <PriceDisplay theme={theme}><PriceLabel theme={theme}>Current Price</PriceLabel><PriceValue theme={theme}>{formatAssetPrice(currentPrice, type)}</PriceValue></PriceDisplay>}
                                {loadingPrice && <PriceDisplay theme={theme}><PriceLabel theme={theme}>Loading price...</PriceLabel><LoadingSpinner size={20} /></PriceDisplay>}
                                <FormGroup><Label theme={theme}><Activity size={16} />Quantity</Label><Input theme={theme} type="number" step="any" placeholder="How many shares/coins?" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></FormGroup>
                                {activeTab === 'buy' && <LeverageSelector value={leverage} onChange={setLeverage} tradeAmount={currentPrice && quantity ? currentPrice * parseFloat(quantity) : 0} disabled={!currentPrice || !quantity} />}
                                {activeTab === 'buy' && currentPrice && (
                                    <TPSLSection theme={theme}>
                                        <TPSLHeader onClick={() => setShowTPSL(!showTPSL)}>
                                            <TPSLTitle theme={theme}><Crosshair size={18} />Take Profit / Stop Loss</TPSLTitle>
                                            <TPSLToggle theme={theme}>{showTPSL ? 'Hide' : 'Show'}<ChevronDown size={16} style={{ transform: showTPSL ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} /></TPSLToggle>
                                        </TPSLHeader>
                                        <TPSLContent $expanded={showTPSL}>
                                            <TPSLGrid>
                                                <TPSLInputGroup><TPSLLabel theme={theme} $tp><Target size={14} />Take Profit</TPSLLabel><TPSLInput theme={theme} $tp type="number" step="any" placeholder={positionType === 'long' ? `Above ${formatAssetPrice(currentPrice, type)}` : `Below ${formatAssetPrice(currentPrice, type)}`} value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} /></TPSLInputGroup>
                                                <TPSLInputGroup><TPSLLabel theme={theme} $sl><ShieldAlert size={14} />Stop Loss</TPSLLabel><TPSLInput theme={theme} $sl type="number" step="any" placeholder={positionType === 'long' ? `Below ${formatAssetPrice(currentPrice, type)}` : `Above ${formatAssetPrice(currentPrice, type)}`} value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} /></TPSLInputGroup>
                                            </TPSLGrid>
                                            <TrailingStopSection theme={theme}><TPSLInputGroup><TPSLLabel theme={theme}><TrendUp size={14} />Trailing Stop (%)</TPSLLabel><TPSLInput theme={theme} type="number" step="0.1" min="0.1" max="50" placeholder="e.g., 5 for 5%" value={trailingStopPercent} onChange={(e) => setTrailingStopPercent(e.target.value)} /></TPSLInputGroup></TrailingStopSection>
                                            <TPSLHint theme={theme}>💡 <strong>{positionType === 'long' ? 'Long' : 'Short'} Position:</strong> {positionType === 'long' ? 'Take Profit triggers when price rises above target. Stop Loss triggers when price falls below target.' : 'Take Profit triggers when price falls below target. Stop Loss triggers when price rises above target.'} Trailing Stop follows the price and locks in profits.</TPSLHint>
                                        </TPSLContent>
                                    </TPSLSection>
                                )}
                                <FormGroup><Label theme={theme}><MessageCircle size={16} />Notes (Optional)</Label><TextArea theme={theme} placeholder={positionType === 'short' ? "Why do you think the price will fall?" : "Why are you making this trade?"} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} /></FormGroup>
                                {currentPrice && quantity && (
                                    <TotalDisplay theme={theme}>
                                        <TotalLabel theme={theme}>{leverage > 1 ? 'Margin Required' : `Total ${activeTab === 'buy' ? 'Cost' : 'Revenue'}`}</TotalLabel>
                                        <div style={{ textAlign: 'right' }}>
                                            <TotalValue theme={theme}>{formatCurrency(calculateTotal())}</TotalValue>
                                            {leverage > 1 && <div style={{ fontSize: '0.85rem', color: theme?.brand?.primary || '#00adef', marginTop: '0.25rem' }}>Position Size: {formatCurrency(calculateTotal() * leverage)}</div>}
                                        </div>
                                    </TotalDisplay>
                                )}
                                <SubmitButton theme={theme} type="submit" disabled={submitting || !currentPrice || !quantity} $variant={activeTab} $positionType={positionType}>
                                    {submitting ? <><LoadingSpinner size={20} />Processing...</> : <>{activeTab === 'buy' ? <Plus size={20} /> : <Minus size={20} />}{positionType === 'short' ? (activeTab === 'buy' ? 'Short' : 'Cover Short') : (activeTab === 'buy' ? 'Buy' : 'Sell')} {symbol || 'Asset'}{leverage > 1 && ` (${leverage}x)`}</>}
                                </SubmitButton>
                            </Form>
                        </TradingPanel>

                        {account?.positions?.length > 0 && (
                            <PositionsList>
                                <PositionsHeader>
                                    <PositionsTitle theme={theme}><PieChart size={20} />Your Positions ({account.positions.length})</PositionsTitle>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <RefillAccountButton variant="compact" currentCashBalance={account?.cashBalance || 0} onRefillSuccess={(data) => { setAccount(data.account); loadOrders(); }} />
                                        <RefreshButton theme={theme} onClick={handleRefreshPrices} disabled={refreshingPrices}>{refreshingPrices ? <LoadingSpinner size={16} /> : <RefreshCw size={16} />}Refresh</RefreshButton>
                                    </div>
                                </PositionsHeader>
                                {account.positions.map((position) => {
                                    const positionKey = `${position.symbol}-${position.positionType}`;
                                    const isExpanded = expandedPositions[positionKey];
                                    const totalValue = position.currentPrice * position.quantity;
                                    const costBasis = position.averagePrice * position.quantity;
                                    const isLeveraged = position.leverage && position.leverage > 1;
                                    const hasTPSL = position.takeProfit || position.stopLoss || position.trailingStopPercent;
                                    return (
                                        <PositionCard theme={theme} key={positionKey} $positive={position.profitLoss >= 0} $positionType={position.positionType} onClick={() => togglePositionExpand(positionKey)}>
                                            <ExpandIcon theme={theme} $expanded={isExpanded}><ChevronDown size={16} /></ExpandIcon>
                                            <PositionHeader>
                                                <PositionSymbol theme={theme}>
                                                    {position.symbol}
                                                    <PositionTypeBadge theme={theme} $short={position.positionType === 'short'}>{position.positionType === 'short' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}{position.positionType}</PositionTypeBadge>
                                                    {isLeveraged && <LeverageBadge theme={theme} $leverage={position.leverage}><Zap size={10} />{position.leverage}x</LeverageBadge>}
                                                </PositionSymbol>
                                                <PositionPL>
                                                    <PLValue theme={theme} $positive={position.profitLoss >= 0}>{position.profitLoss >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{formatCurrency(Math.abs(position.profitLoss || 0))}</PLValue>
                                                    <PLPercent theme={theme} $positive={position.profitLossPercent >= 0}>{formatPercent(position.profitLossPercent || 0)}</PLPercent>
                                                </PositionPL>
                                            </PositionHeader>
                                            {hasTPSL && (
                                                <TPSLBadgeContainer>
                                                    {position.takeProfit && <TPSLBadge theme={theme} $type="tp"><Target size={10} />TP: {formatAssetPrice(position.takeProfit, position.type)}</TPSLBadge>}
                                                    {position.stopLoss && <TPSLBadge theme={theme} $type="sl"><ShieldAlert size={10} />SL: {formatAssetPrice(position.stopLoss, position.type)}</TPSLBadge>}
                                                    {position.trailingStopPercent && <TPSLBadge theme={theme} $type="trailing"><TrendUp size={10} />Trail: {position.trailingStopPercent}%{position.trailingStopPrice && ` (${formatAssetPrice(position.trailingStopPrice, position.type)})`}</TPSLBadge>}
                                                </TPSLBadgeContainer>
                                            )}
                                            <PositionDetails theme={theme}>
                                                <PositionDetail><DetailLabel theme={theme}>Quantity</DetailLabel><DetailValue theme={theme}>{position.quantity.toLocaleString()}</DetailValue></PositionDetail>
                                                <PositionDetail><DetailLabel theme={theme}>Avg Price</DetailLabel><DetailValue theme={theme}>{formatAssetPrice(position.averagePrice, position.type)}</DetailValue></PositionDetail>
                                                <PositionDetail><DetailLabel theme={theme}>Current Price</DetailLabel><DetailValue theme={theme}>{formatAssetPrice(position.currentPrice, position.type)}</DetailValue></PositionDetail>
                                            </PositionDetails>
                                            <ExpandedDetails $expanded={isExpanded}>
                                                <ExpandedContent theme={theme}>
                                                    <ExpandedGrid>
                                                        {isLeveraged ? (
                                                            <>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>Margin (Your Capital)</ExpandedLabel><ExpandedValue theme={theme}>{formatCurrency(position.marginUsed || costBasis)}</ExpandedValue></ExpandedItem>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>Market Exposure</ExpandedLabel><ExpandedValue theme={theme} $color={theme?.brand?.primary || '#00adef'}>{formatCurrency(position.leveragedValue)} ({position.leverage}x)</ExpandedValue></ExpandedItem>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>Current Value</ExpandedLabel><ExpandedValue theme={theme} $color={position.currentValue >= costBasis ? (theme?.success || '#10b981') : (theme?.error || '#ef4444')}>{formatCurrency(position.currentValue || (costBasis + (position.profitLoss || 0)))}</ExpandedValue></ExpandedItem>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>Leveraged P/L</ExpandedLabel><ExpandedValue theme={theme} $color={position.profitLoss >= 0 ? (theme?.success || '#10b981') : (theme?.error || '#ef4444')}>{position.profitLoss >= 0 ? '+' : ''}{formatCurrency(position.profitLoss || 0)} ({formatPercent(position.profitLossPercent || 0)})</ExpandedValue></ExpandedItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>Total Value</ExpandedLabel><ExpandedValue theme={theme} $color={theme?.brand?.primary || '#00adef'}>{formatCurrency(totalValue)}</ExpandedValue></ExpandedItem>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>Cost Basis</ExpandedLabel><ExpandedValue theme={theme}>{formatCurrency(costBasis)}</ExpandedValue></ExpandedItem>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>{position.positionType === 'short' ? 'Short P/L' : 'Unrealized P/L'}</ExpandedLabel><ExpandedValue theme={theme} $color={position.profitLoss >= 0 ? (theme?.success || '#10b981') : (theme?.error || '#ef4444')}>{position.profitLoss >= 0 ? '+' : ''}{formatCurrency(position.profitLoss || 0)}</ExpandedValue></ExpandedItem>
                                                                <ExpandedItem theme={theme}><ExpandedLabel theme={theme}>Return %</ExpandedLabel><ExpandedValue theme={theme} $color={position.profitLossPercent >= 0 ? (theme?.success || '#10b981') : (theme?.error || '#ef4444')}>{formatPercent(position.profitLossPercent || 0)}</ExpandedValue></ExpandedItem>
                                                            </>
                                                        )}
                                                    </ExpandedGrid>
                                                    {isLeveraged && position.liquidationPrice && (
                                                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#fca5a5' }}>
                                                            <strong>⚠️ Liquidation Price:</strong> {formatAssetPrice(position.liquidationPrice, position.type)} — Position liquidates if price {position.positionType === 'short' ? 'rises above' : 'falls below'} this level (90% loss on margin).
                                                        </div>
                                                    )}
                                                    <PositionNotes theme={theme}><NotesLabel theme={theme}>{position.positionType === 'short' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}Position Strategy</NotesLabel><NotesText theme={theme}>{position.positionType === 'short' ? <><strong>Short Position:</strong> You borrowed and sold at {formatAssetPrice(position.averagePrice, position.type)}. To close, you'll buy back at current price ({formatAssetPrice(position.currentPrice, position.type)}). {position.profitLoss >= 0 ? ` Price dropped = You profit ${formatCurrency(Math.abs(position.profitLoss))}! 🎉` : ` Price rose = You'd lose ${formatCurrency(Math.abs(position.profitLoss))} if you cover now.`}{isLeveraged && ` With ${position.leverage}x leverage, price moves are amplified ${position.leverage}x on your margin.`}</> : <><strong>Long Position:</strong> You bought at {formatAssetPrice(position.averagePrice, position.type)}. Current value is {formatAssetPrice(position.currentPrice, position.type)} per share.{position.profitLoss >= 0 ? ` Price rose = You're up ${formatCurrency(Math.abs(position.profitLoss))}! 🎉` : ` Price dropped = You're down ${formatCurrency(Math.abs(position.profitLoss))}.`}{isLeveraged && ` With ${position.leverage}x leverage, your ${formatCurrency(position.marginUsed || costBasis)} margin controls ${formatCurrency(position.leveragedValue)} in market exposure.`}</>}</NotesText></PositionNotes>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme?.text?.tertiary || '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}><Clock size={14} />Last updated: {position.lastUpdated ? new Date(position.lastUpdated).toLocaleString() : 'Just now'}</div>
                                                </ExpandedContent>
                                            </ExpandedDetails>
                                            <SellButton theme={theme} onClick={(e) => { e.stopPropagation(); if (position.positionType === 'short') { handleCoverShort(position); } else { handleQuickSell(position); }}} $cover={position.positionType === 'short'} disabled={submitting}>{position.positionType === 'short' ? <Plus size={18} /> : <Minus size={18} />}{position.positionType === 'short' ? (submitting ? 'Covering...' : 'Cover Short') : 'Sell Position'}</SellButton>
                                        </PositionCard>
                                    );
                                })}
                            </PositionsList>
                        )}

                        {orders.length > 0 && (
                            <OrdersHistory>
                                <PositionsTitle theme={theme} style={{ marginBottom: '1.5rem' }}><Clock size={20} />Recent Orders</PositionsTitle>
                                {orders.map((order) => (
                                    <OrderCard theme={theme} key={order._id}>
                                        <OrderHeader>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <OrderSide theme={theme} $side={order.side}>{order.side === 'buy' ? <Plus size={16} /> : order.side === 'cover' ? <RefreshCw size={16} /> : <Minus size={16} />}{order.side.toUpperCase()}{order.positionType === 'short' && order.side !== 'cover' && ' SHORT'}</OrderSide>
                                                {order.leverage > 1 && <LeverageBadge theme={theme} $leverage={order.leverage}>{order.leverage}x</LeverageBadge>}
                                                {order.triggerType && order.triggerType !== 'manual' && <TPSLBadge theme={theme} $type={order.triggerType === 'take_profit' ? 'tp' : order.triggerType === 'stop_loss' ? 'sl' : 'trailing'}>{order.triggerType === 'take_profit' ? '🎯 TP' : order.triggerType === 'stop_loss' ? '🛑 SL' : order.triggerType === 'trailing_stop' ? '📉 Trail' : order.triggerType === 'liquidation' ? '💀 Liq' : 'Auto'}</TPSLBadge>}
                                            </div>
                                            <OrderTime theme={theme}>{order.executedAt || order.createdAt ? new Date(order.executedAt || order.createdAt).toLocaleString() : 'Just now'}</OrderTime>
                                        </OrderHeader>
                                        <OrderDetails><OrderInfo theme={theme}><OrderSymbol theme={theme}>${order.symbol}</OrderSymbol><OrderQty theme={theme}>× {order.quantity} @ {formatAssetPrice(order.price, order.type)}</OrderQty></OrderInfo><OrderAmount><Amount theme={theme}>{formatCurrency(order.totalAmount)}</Amount>{order.profitLoss !== 0 && <OrderPL theme={theme} $positive={order.profitLoss > 0}>{order.profitLoss > 0 ? '+' : ''}{formatCurrency(order.profitLoss)}</OrderPL>}</OrderAmount></OrderDetails>
                                    </OrderCard>
                                ))}
                            </OrdersHistory>
                        )}

                        {(!account?.positions || account.positions.length === 0) && orders.length === 0 && (
                            <EmptyState theme={theme}><EmptyIcon theme={theme}><Trophy size={60} color={theme?.brand?.primary || '#00adef'} /></EmptyIcon><EmptyText theme={theme}>You haven't made any trades yet.<br />Start trading long or short to build your portfolio!</EmptyText></EmptyState>
                        )}
                    </div>

                    <Sidebar>
                        <StatsPanel theme={theme}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <PanelTitle theme={theme} style={{ marginBottom: 0 }}><Award size={20} />Your Stats</PanelTitle>
                                <RefillAccountButton variant="compact" currentCashBalance={account?.cashBalance || 0} onRefillSuccess={(data) => { setAccount(data.account); loadOrders(); }} />
                            </div>
                            <StatRow theme={theme}><StatRowLabel theme={theme}><Trophy size={16} />Total Trades</StatRowLabel><StatRowValue theme={theme}>{account?.totalTrades || 0}</StatRowValue></StatRow>
                            <StatRow theme={theme}><StatRowLabel theme={theme}><ThumbsUp size={16} />Winning Trades</StatRowLabel><StatRowValue theme={theme} $color={theme?.success || '#10b981'}>{account?.winningTrades || 0}</StatRowValue></StatRow>
                            <StatRow theme={theme}><StatRowLabel theme={theme}><Activity size={16} />Best Streak</StatRowLabel><StatRowValue theme={theme} $color={theme?.warning || '#f59e0b'}>{Math.abs(account?.bestStreak || 0)}</StatRowValue></StatRow>
                            <StatRow theme={theme}><StatRowLabel theme={theme}><ArrowUpRight size={16} />Biggest Win</StatRowLabel><StatRowValue theme={theme} $color={theme?.success || '#10b981'}>{formatCurrency(account?.biggestWin || 0)}</StatRowValue></StatRow>
                            <StatRow theme={theme}><StatRowLabel theme={theme}><RefreshCw size={16} />Times Refilled</StatRowLabel><StatRowValue theme={theme} $color={theme?.brand?.primary || '#00adef'}>{account?.refillCount || 0}</StatRowValue></StatRow>
                            {(account?.takeProfitHits > 0 || account?.stopLossHits > 0 || account?.trailingStopHits > 0) && (
                                <>
                                    <StatRow theme={theme}><StatRowLabel theme={theme}><Target size={16} />Take Profits Hit</StatRowLabel><StatRowValue theme={theme} $color={theme?.success || '#10b981'}>{account?.takeProfitHits || 0}</StatRowValue></StatRow>
                                    <StatRow theme={theme}><StatRowLabel theme={theme}><ShieldAlert size={16} />Stop Losses Hit</StatRowLabel><StatRowValue theme={theme} $color={theme?.error || '#ef4444'}>{account?.stopLossHits || 0}</StatRowValue></StatRow>
                                    {account?.trailingStopHits > 0 && <StatRow theme={theme}><StatRowLabel theme={theme}><TrendUp size={16} />Trailing Stops Hit</StatRowLabel><StatRowValue theme={theme} $color={theme?.warning || '#f59e0b'}>{account?.trailingStopHits || 0}</StatRowValue></StatRow>}
                                </>
                            )}
                            {account?.biggestLoss < 0 && <StatRow theme={theme}><StatRowLabel theme={theme}><ArrowDownRight size={16} />Biggest Loss</StatRowLabel><StatRowValue theme={theme} $color={theme?.error || '#ef4444'}>{formatCurrency(account?.biggestLoss || 0)}</StatRowValue></StatRow>}
                            <BadgeContainer theme={theme}>
                                {account?.winRate >= 60 && <Badge theme={theme} $gradient={`${theme?.success || '#10b981'}33`} $borderColor={`${theme?.success || '#10b981'}4D`} $color={theme?.success || '#10b981'}><Award size={14} />Hot Streak</Badge>}
                                {account?.totalTrades >= 10 && <Badge theme={theme}><Users size={14} />Active Trader</Badge>}
                                {Math.abs(account?.currentStreak || 0) >= 3 && <Badge theme={theme} $gradient={`${theme?.warning || '#f59e0b'}33`} $borderColor={`${theme?.warning || '#f59e0b'}4D`} $color={theme?.warning || '#f59e0b'}><Flame size={14} />On Fire</Badge>}
                            </BadgeContainer>
                            <button
                                onClick={() => setShowResetConfirm(true)}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'transparent',
                                    border: `1px solid ${theme?.error || '#ef4444'}4D`,
                                    borderRadius: '8px',
                                    color: theme?.error || '#ef4444',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = `${theme?.error || '#ef4444'}1A`;
                                    e.target.style.borderColor = theme?.error || '#ef4444';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'transparent';
                                    e.target.style.borderColor = `${theme?.error || '#ef4444'}4D`;
                                }}
                            >
                                <RefreshCw size={14} /> Reset Account
                            </button>
                        </StatsPanel>
                        {leaderboard.length > 0 && (
                            <LeaderboardPreview theme={theme}>
                                <PanelTitle theme={theme}><Trophy size={20} />Top Traders</PanelTitle>
                                {leaderboard.map((trader, index) => (
                                    <LeaderboardItem theme={theme} key={trader.user?._id || index}><Rank theme={theme} $rank={trader.rank}>{trader.rank}</Rank><TraderInfo><TraderName theme={theme}>{getDisplayName(trader)}</TraderName><TraderReturn theme={theme} $positive={trader.profitLossPercent >= 0}>{formatPercent(trader.profitLossPercent)}</TraderReturn></TraderInfo></LeaderboardItem>
                                ))}
                                <ViewAllButton theme={theme} onClick={() => window.location.href = '/leaderboard'}>View Full Leaderboard</ViewAllButton>
                            </LeaderboardPreview>
                        )}
                    </Sidebar>
                </ContentGrid>
            </PageContainer>
        </>
    );
};

export default PaperTradingPage;