// client/src/pages/PredictionsPage.js - IMPROVED VERSION WITH INDICATORS & DYNAMIC CONFIDENCE
// PART 1 - Copy this first, then Part 2

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
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;


const formatPredictionPrice = (price, symbol) => {
    console.log('🔍 Formatting:', { price, symbol, type: typeof price });

    if (!price) return '$0.00';

    // Check if it's a DEX token (format: SYMBOL:network)
    const symbolUpper = symbol?.toUpperCase() || '';
    const isDex = symbolUpper.includes(':');

    // Check if it's a crypto symbol
    const cryptoPatterns = ['-USD', '-USDT', '-BUSD', '-EUR', '-GBP'];
    const knownCryptos = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'DOGE', 'SHIB', 'XRP', 'PEPE', 'FLOKI', 'BONK'];

    const isCrypto = isDex || cryptoPatterns.some(pattern => symbolUpper.endsWith(pattern)) ||
                     knownCryptos.includes(symbolUpper.split(':')[0]);

    console.log('🔍 Is crypto/dex?', isCrypto, 'Symbol:', symbolUpper, 'isDex:', isDex);

    const result = isCrypto ? formatCryptoPrice(price) : formatStockPrice(price);
    console.log('🔍 Result:', result);

    return result;
};


const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
`;

const bounceIn = keyframes`
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const rocketLaunch = keyframes`
    0% { transform: translateY(0) rotate(-45deg); }
    100% { transform: translateY(-1000px) translateX(1000px) rotate(-45deg); }
`;

const rocketCrash = keyframes`
    0% { transform: translateY(-1000px) rotate(135deg); }
    100% { transform: translateY(100vh) translateX(-300px) rotate(135deg); }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px currentColor; }
    50% { box-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
`;

const countdownPulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
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
    z-index: 1;
`;

const ParticleContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background: ${props => props.color};
    border-radius: 50%;
    animation: ${particles} ${props => props.duration}s linear infinite;
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    opacity: 0.6;
    filter: blur(1px);
`;

const Header = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
    position: relative;
    z-index: 1;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #00ff88 100%)'};
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
        font-size: 2rem;
    }
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}33 0%, ${props => props.theme?.info || '#3b82f6'}33 100%);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
`;

const TabsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    position: relative;
    z-index: 1;
    overflow-x: auto;
    padding-bottom: 0.5rem;
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme?.brand?.accent || '#8b5cf6'}4D 0%, ${props.theme?.brand?.accent || '#8b5cf6'}26 100%)` :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? `${props.theme?.brand?.accent || '#8b5cf6'}80` : `${props.theme?.text?.tertiary || '#64748b'}4D`};
    border-radius: 12px;
    color: ${props => props.$active ? (props.theme?.brand?.accent || '#a78bfa') : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}4D 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}26 100%);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
        color: ${props => props.theme?.brand?.accent || '#a78bfa'};
        transform: translateY(-2px);
    }
`;

const StatsBanner = styled.div`
    max-width: 1200px;
    margin: 0 auto 3rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    position: relative;
    z-index: 1;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}26 0%, ${props => props.theme?.info || '#3b82f6'}26 100%);
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.delay}s;
    cursor: pointer;

    &:hover {
        transform: translateY(-10px) scale(1.05);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}CC;
        box-shadow: 0 20px 60px ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    }
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    background: ${props => props.gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const InputSection = styled.div`
    max-width: 800px;
    margin: 0 auto 3rem;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 20px;
    padding: 2.5rem;
    animation: ${fadeIn} 0.8s ease-out;
    box-shadow: 0 10px 40px ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    position: relative;
    z-index: 1;
`;

const InputForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const InputGroup = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// Autocomplete Dropdown
const AutocompleteContainer = styled.div`
    position: relative;
    width: 100%;
`;

const SuggestionsDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.98)'};
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}4D;
    border-radius: 12px;
    margin-top: 4px;
    max-height: 280px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
    }
    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme?.brand?.primary || '#00adef'}66;
        border-radius: 3px;
    }
`;

const SuggestionItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.15s ease;
    border-bottom: 1px solid rgba(255,255,255,0.05);

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    }
`;

const SuggestionLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SuggestionSymbol = styled.span`
    font-weight: 700;
    font-size: 1rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const SuggestionName = styled.span`
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SuggestionType = styled.span`
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
    background: ${props => {
        if (props.$type === 'crypto') return `${props.theme?.warning || '#f59e0b'}26`;
        if (props.$type === 'dex') return `${props.theme?.success || '#10b981'}26`;
        return `${props.theme?.brand?.primary || '#00adef'}26`;
    }};
    color: ${props => {
        if (props.$type === 'crypto') return props.theme?.warning || '#f59e0b';
        if (props.$type === 'dex') return props.theme?.success || '#10b981';
        return props.theme?.brand?.primary || '#00adef';
    }};
`;

const SuggestionChain = styled.span`
    font-size: 0.65rem;
    font-weight: 500;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    text-transform: uppercase;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    margin-left: 0.25rem;
`;

const NoResults = styled.div`
    padding: 1rem;
    text-align: center;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
`;

const Input = styled.input`
    padding: 1rem 1.25rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}0D;
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    text-transform: uppercase;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
        box-shadow: 0 0 0 4px ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
        text-transform: none;
    }
`;

const Select = styled.select`
    padding: 1rem 1.25rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}0D;
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
        box-shadow: 0 0 0 4px ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    }

    option {
        background: #1e293b;
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    }
`;

const PredictButton = styled.button`
    flex: 1;
    padding: 1.25rem 2rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'};
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 15px 40px ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        animation: ${pulse} 1.5s ease-in-out infinite;
    }
`;

const LoadingSpinner = styled(Sparkles)`
    animation: ${spin} 1s linear infinite;
`;

// ============ LIVE COUNTDOWN SECTION ============
const LiveStatusCard = styled.div`
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}1A 0%, ${props => props.theme?.info || '#3b82f6'}1A 100%);
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 20px;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;
    animation: ${countdownPulse} 2s ease-in-out infinite;
`;

const LiveStatusHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const LiveStatusTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
`;

const LiveDot = styled.div`
    width: 12px;
    height: 12px;
    background: ${props => props.theme?.success || '#10b981'};
    border-radius: 50%;
    animation: ${pulse} 1s ease-in-out infinite;
    box-shadow: 0 0 10px ${props => props.theme?.success || '#10b981'};
`;

const CountdownDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CountdownUnit = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 12px;
    border: 1px solid ${props => props.$urgent ? props.theme?.error || '#ef4444' : props.theme?.brand?.accent || '#8b5cf6'}4D;
    min-width: 70px;
`;

const CountdownValue = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: ${props => props.$urgent ? props.theme?.error || '#ef4444' : props.theme?.text?.primary || '#e0e6ed'};
`;

const CountdownLabel = styled.div`
    font-size: 0.7rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const CountdownSeparator = styled.span`
    font-size: 1.5rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;

// ============ DYNAMIC CONFIDENCE SECTION ============
const DynamicConfidenceCard = styled.div`
    background: linear-gradient(135deg, 
        ${props => props.$trend === 'up' 
            ? `${props.theme?.success || '#10b981'}1A` 
            : props.$trend === 'down' 
                ? `${props.theme?.error || '#ef4444'}1A` 
                : `${props.theme?.brand?.accent || '#8b5cf6'}1A`} 0%, 
        rgba(15, 23, 42, 0.8) 100%);
    border: 2px solid ${props => props.$trend === 'up' 
        ? `${props.theme?.success || '#10b981'}4D` 
        : props.$trend === 'down' 
            ? `${props.theme?.error || '#ef4444'}4D` 
            : `${props.theme?.brand?.accent || '#8b5cf6'}4D`};
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const ConfidenceHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const ConfidenceTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
`;

const ConfidenceValueLarge = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${props => {
        if (props.$value >= 70) return props.theme?.success || '#10b981';
        if (props.$value >= 50) return props.theme?.warning || '#f59e0b';
        return props.theme?.error || '#ef4444';
    }};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ConfidenceChange = styled.span`
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.$positive ? props.theme?.success || '#10b981' : props.theme?.error || '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const ConfidenceBarLarge = styled.div`
    width: 100%;
    height: 16px;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
`;

const ConfidenceBarFill = styled.div`
    height: 100%;
    width: ${props => props.$value || 0}%;
    background: ${props => {
        if (props.$value >= 70) return `linear-gradient(90deg, ${props.theme?.success || '#10b981'}, ${props.theme?.success || '#059669'})`;
        if (props.$value >= 50) return `linear-gradient(90deg, ${props.theme?.warning || '#f59e0b'}, ${props.theme?.warning || '#d97706'})`;
        return `linear-gradient(90deg, ${props.theme?.error || '#ef4444'}, ${props.theme?.error || '#dc2626'})`;
    }};
    border-radius: 8px;
    transition: width 0.5s ease-out, background 0.5s ease;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: ${shimmer} 2s linear infinite;
    }
`;

const ConfidenceMessage = styled.div`
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 8px;
    font-size: 0.9rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// END OF PART 1 - Continue with Part 2
// PART 2 - Add this after Part 1 in your PredictionsPage.js

// ============ PREDICTION CARD STYLED COMPONENTS ============
const ResultsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    animation: ${bounceIn} 0.6s ease-out;
    position: relative;
    z-index: 1;
`;

const PredictionCard = styled.div`
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}26 0%, ${props => props.theme?.info || '#3b82f6'}26 100%);
    backdrop-filter: blur(10px);
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    border-radius: 20px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
`;

const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
    }
`;

const StockInfo = styled.div`
    animation: ${slideIn} 0.6s ease-out;
`;

const StockSymbol = styled.h2`
    font-size: 3rem;
    font-weight: 900;
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const CompanyName = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
    margin-top: 0.25rem;
    font-weight: 500;
`;

const CurrentPriceSection = styled.div`
    display: flex;
    align-items: baseline;
    gap: 1rem;
`;

const CurrentPriceLabel = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
`;

const CurrentPriceValue = styled.span`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.8rem;
    font-weight: 700;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.75rem;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 10px;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
        transform: translateY(-2px);
    }
`;

const DirectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: ${props => {
        if (props.$neutral) return `linear-gradient(135deg, ${props.theme?.warning || '#f59e0b'}4D 0%, ${props.theme?.warning || '#d97706'}4D 100%)`;
        return props.$up ?
            `linear-gradient(135deg, ${props.theme?.success || '#10b981'}4D 0%, ${props.theme?.success || '#059669'}4D 100%)` :
            `linear-gradient(135deg, ${props.theme?.error || '#ef4444'}4D 0%, ${props.theme?.error || '#dc2626'}4D 100%)`;
    }};
    border: 2px solid ${props => {
        if (props.$neutral) return `${props.theme?.warning || '#f59e0b'}80`;
        return props.$up ? `${props.theme?.success || '#10b981'}80` : `${props.theme?.error || '#ef4444'}80`;
    }};
    border-radius: 16px;
    color: ${props => {
        if (props.$neutral) return props.theme?.warning || '#f59e0b';
        return props.$up ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444');
    }};
    font-size: 1.5rem;
    font-weight: 900;
    animation: ${slideInRight} 0.6s ease-out, ${props => props.$neutral ? 'none' : pulse} 2s ease-in-out infinite 1s;
`;

const SignalStrengthBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => {
        if (props.$strength === 'strong') return `${props.theme?.success || '#10b981'}20`;
        if (props.$strength === 'moderate') return `${props.theme?.warning || '#f59e0b'}20`;
        return `${props.theme?.error || '#ef4444'}20`;
    }};
    border: 1px solid ${props => {
        if (props.$strength === 'strong') return `${props.theme?.success || '#10b981'}60`;
        if (props.$strength === 'moderate') return `${props.theme?.warning || '#f59e0b'}60`;
        return `${props.theme?.error || '#ef4444'}60`;
    }};
    border-radius: 8px;
    color: ${props => {
        if (props.$strength === 'strong') return props.theme?.success || '#10b981';
        if (props.$strength === 'moderate') return props.theme?.warning || '#f59e0b';
        return props.theme?.error || '#ef4444';
    }};
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-left: 1rem;
`;

// ============ SHARED PREDICTION BADGE ============
const SharedPredictionBanner = styled.div`
    background: linear-gradient(135deg, ${props => props.theme?.error || '#ef4444'}1A 0%, ${props => props.theme?.warning || '#f59e0b'}1A 100%);
    border: 2px solid ${props => props.theme?.error || '#ef4444'}66;
    border-radius: 16px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const SharedBadgeLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const LiveDotLarge = styled.div`
    width: 16px;
    height: 16px;
    background: ${props => props.theme?.error || '#ef4444'};
    border-radius: 50%;
    animation: ${pulse} 1s ease-in-out infinite;
    box-shadow: 0 0 15px ${props => props.theme?.error || '#ef4444'};
`;

const SharedText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const SharedTitle = styled.span`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme?.error || '#ef4444'};
`;

const SharedSubtitle = styled.span`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const ViewerCount = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    
    svg {
        color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
`;

const MetricCard = styled.div`
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;

    &:hover {
        transform: translateY(-5px) scale(1.03);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}99;
    }
`;

const MetricIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => {
        if (props.$variant === 'success') return `${props.theme?.success || '#10b981'}33`;
        if (props.$variant === 'danger') return `${props.theme?.error || '#ef4444'}33`;
        if (props.$variant === 'warning') return `${props.theme?.warning || '#f59e0b'}33`;
        return `${props.theme?.brand?.accent || '#8b5cf6'}33`;
    }};
    color: ${props => {
        if (props.$variant === 'success') return props.theme?.success || '#10b981';
        if (props.$variant === 'danger') return props.theme?.error || '#ef4444';
        if (props.$variant === 'warning') return props.theme?.warning || '#f59e0b';
        return props.theme?.brand?.accent || '#a78bfa';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
`;

const MetricLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => {
        if (props.$variant === 'success') return props.theme?.success || '#10b981';
        if (props.$variant === 'danger') return props.theme?.error || '#ef4444';
        if (props.$variant === 'warning') return props.theme?.warning || '#f59e0b';
        return props.theme?.brand?.accent || '#a78bfa';
    }};
`;

// ============ INDICATORS SECTION ============
const IndicatorsSection = styled.div`
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
`;

const IndicatorsTitle = styled.h3`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const IndicatorsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
`;

const IndicatorItem = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => {
        if (props.$signal === 'BUY') return `${props.theme?.success || '#10b981'}4D`;
        if (props.$signal === 'SELL') return `${props.theme?.error || '#ef4444'}4D`;
        return `${props.theme?.brand?.accent || '#8b5cf6'}33`;
    }};
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        transform: translateX(5px);
    }
`;

const IndicatorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const IndicatorName = styled.span`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
    font-weight: 600;
`;

const IndicatorNumericValue = styled.span`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
`;

const IndicatorSignal = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
    background: ${props => {
        if (props.$signal === 'BUY') return `${props.theme?.success || '#10b981'}26`;
        if (props.$signal === 'SELL') return `${props.theme?.error || '#ef4444'}26`;
        return `${props.theme?.warning || '#f59e0b'}26`;
    }};
    color: ${props => {
        if (props.$signal === 'BUY') return props.theme?.success || '#10b981';
        if (props.$signal === 'SELL') return props.theme?.error || '#ef4444';
        return props.theme?.warning || '#f59e0b';
    }};
`;

const NoIndicatorsMessage = styled.div`
    padding: 1.5rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px dashed ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 12px;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

// ============ CHART SECTION ============
const ChartSection = styled.div`
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    z-index: 1;
    margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ChartLegend = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1rem;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const LegendColor = styled.div`
    width: 20px;
    height: 20px;
    background: ${props => props.color};
    border-radius: 4px;
`;

const LegendText = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
    position: relative;
    z-index: 1;
`;

const EmptyIcon = styled.div`
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}33 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}0D 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
`;

// ============ ROCKET ANIMATION ============
const RocketContainer = styled.div`
    position: fixed;
    ${props => props.$crash ? 'top: -100px;' : 'bottom: -100px;'}
    left: ${props => props.left}%;
    z-index: 1000;
    animation: ${props => props.$crash ? rocketCrash : rocketLaunch} 3s ease-out forwards;
    pointer-events: none;
`;

// ============ MODAL ============
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    animation: ${bounceIn} 0.5s ease-out;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const ModalTitle = styled.h3`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 1.5rem;
    font-weight: 700;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${props => props.theme?.error || '#ef4444'}33;
    border: 1px solid ${props => props.theme?.error || '#ef4444'}4D;
    color: ${props => props.theme?.error || '#ef4444'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.error || '#ef4444'}4D;
        transform: scale(1.1);
    }
`;

const ShareOptions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const ShareOption = styled.button`
    padding: 1rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 12px;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
        transform: translateY(-3px);
    }
`;

const WatchlistStar = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50%;
    
    &:hover {
        transform: scale(1.2);
    }
`;

// ============ SAVED PREDICTIONS ============
const SavedPredictionsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const SavedPredictionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const SavedPredictionCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}99;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$up ? 
            `linear-gradient(90deg, ${props.theme?.success || '#10b981'}, ${props.theme?.success || '#059669'})` : 
            `linear-gradient(90deg, ${props.theme?.error || '#ef4444'}, ${props.theme?.error || '#dc2626'})`
        };
    }
`;

const SavedCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
`;

const SavedSymbol = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
`;

const SavedDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$up ? 
        `${props.theme?.success || '#10b981'}33` : 
        `${props.theme?.error || '#ef4444'}33`
    };
    border: 1px solid ${props => props.$up ? 
        `${props.theme?.success || '#10b981'}66` : 
        `${props.theme?.error || '#ef4444'}66`
    };
    border-radius: 8px;
    color: ${props => props.$up ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    font-weight: 700;
    font-size: 0.9rem;
`;

const SavedCardBody = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const SavedMetric = styled.div`
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border-radius: 8px;
    padding: 0.75rem;
`;

const SavedMetricLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const SavedMetricValue = styled.div`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 700;
`;

const SavedCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
`;

const SavedDate = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SavedActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const SavedActionButton = styled.button`
    padding: 0.5rem;
    background: ${props => props.$danger ? 
        `${props.theme?.error || '#ef4444'}1A` : 
        `${props.theme?.brand?.accent || '#8b5cf6'}1A`
    };
    border: 1px solid ${props => props.$danger ? 
        `${props.theme?.error || '#ef4444'}4D` : 
        `${props.theme?.brand?.accent || '#8b5cf6'}4D`
    };
    border-radius: 8px;
    color: ${props => props.$danger ? (props.theme?.error || '#ef4444') : (props.theme?.brand?.accent || '#a78bfa')};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
    }
`;

const ClearAllButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.theme?.error || '#ef4444'}1A;
    border: 1px solid ${props => props.theme?.error || '#ef4444'}4D;
    border-radius: 10px;
    color: ${props => props.theme?.error || '#ef4444'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    margin-bottom: 2rem;

    &:hover {
        background: ${props => props.theme?.error || '#ef4444'}33;
    }
`;

// END OF PART 2 - Continue with Part 3 for the component logic
// PART 3 - Add this after Part 2 in your PredictionsPage.js
// This contains the main component logic

// ============ MAIN COMPONENT ============
const PredictionsPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { theme } = useTheme();
    
    const [activeTab, setActiveTab] = useState('predict');
    const [symbol, setSymbol] = useState('');
    const [days, setDays] = useState('7');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [showRocket, setShowRocket] = useState(false);
    const [particlesData, setParticlesData] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [savedPredictions, setSavedPredictions] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    // Symbol autocomplete state
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [dexInfo, setDexInfo] = useState(null); // DEX token extra info

    // Dynamic confidence state
    const [dynamicConfidence, setDynamicConfidence] = useState(null);
    const [confidenceChange, setConfidenceChange] = useState(0);
    const [confidenceTrend, setConfidenceTrend] = useState('neutral');

    // Countdown state
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Theme colors
    const accentColor = theme?.brand?.accent || '#8b5cf6';
    const primaryColor = theme?.brand?.primary || '#00adef';
    const successColor = theme?.success || '#10b981';
    const errorColor = theme?.error || '#ef4444';
    const warningColor = theme?.warning || '#f59e0b';

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
        const timer = setTimeout(() => {
            if (symbol.length >= 1) {
                searchSymbols(symbol);
            } else {
                setSuggestions([]);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [symbol, searchSymbols]);

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setSymbol(suggestion.symbol);
        setShowSuggestions(false);
        setSuggestions([]);

        // Store DEX info if available
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

    const [platformStats, setPlatformStats] = useState({
        accuracy: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        loading: true
    });

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

    // Initialize particles and load saved predictions
    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: [accentColor, primaryColor, successColor, warningColor][Math.floor(Math.random() * 4)]
        }));
        setParticlesData(newParticles);

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
    }, [api, accentColor, primaryColor, successColor, warningColor]);

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
                
                // Update dynamic confidence
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
                
                // Also store currentPrice from livePrice
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

    // Initialize countdown from shared prediction data (before liveData loads)
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

        // Store the timestamp when we received the data
        const fetchedAt = Date.now();
        const initialRemaining = liveData.timeRemaining;

        const updateCountdown = () => {
            // Calculate how much time has passed since we fetched
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

    // Generate chart data for price projection line
    // Handles micro-prices like $0.00001234 by preserving precision
    const generateChartData = (currentPrice, targetPrice, days) => {
        const data = [];
        const priceChange = targetPrice - currentPrice;

        // Determine appropriate decimal precision based on price magnitude
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
            // Smooth curve using easing function
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
            // Build request payload
            const payload = {
                symbol: symbol.toUpperCase(),
                days: parseInt(days)
            };

            // Add DEX info if available
            if (dexInfo) {
                payload.assetType = 'dex';
                payload.network = dexInfo.network;
                payload.poolAddress = dexInfo.poolAddress;
                payload.contractAddress = dexInfo.contractAddress;
            }

            const response = await api.post('/predictions/predict', payload);
            
            console.log('API Response:', response.data);
            console.log('Indicators:', response.data.indicators);
            
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
            
            // Set initial dynamic confidence (use liveConfidence if shared, otherwise confidence)
            setDynamicConfidence(response.data.liveConfidence || response.data.prediction.confidence);

            // Check signal strength and show appropriate message
            const signalStrength = response.data.prediction.signal_strength;
            const isActionable = response.data.prediction.is_actionable;

            // Show different toast based on signal strength
            if (response.data.isShared) {
                toast.info(`Joined live prediction for ${symbol.toUpperCase()}! ${response.data.viewCount || 1} users watching`, 'Live Prediction');
            } else if (!isActionable || signalStrength === 'weak') {
                // Weak signal - warn the user
                toast.warning(
                    response.data.warning || `Low confidence signal for ${symbol.toUpperCase()} - no clear direction detected`,
                    'Weak Signal'
                );
            } else if (signalStrength === 'moderate') {
                toast.info(`Moderate signal for ${symbol.toUpperCase()} - proceed with caution`, 'Prediction Created');
            } else {
                toast.success(`Strong signal detected for ${symbol.toUpperCase()}!`, 'Success');
            }

            // Only show rocket animation for actionable signals
            const isGoingUp = response.data.prediction.direction === 'UP';
            if (isActionable && response.data.prediction.direction !== 'NEUTRAL') {
                setShowRocket(isGoingUp ? 'up' : 'down');
                setTimeout(() => setShowRocket(false), 3000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to generate prediction';
            const errorType = error.response?.data?.error;
            
            // Show specific error for invalid symbols
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
        toast.success('Prediction saved!', 'Saved');
    };

    // Delete saved prediction
    const handleDeleteSavedPrediction = (id) => {
        const updated = savedPredictions.filter(p => p.id !== id);
        setSavedPredictions(updated);
        localStorage.setItem('savedPredictions', JSON.stringify(updated));
        toast.success('Prediction removed', 'Deleted');
    };

    // Clear all saved
    const handleClearAllSaved = () => {
        if (window.confirm('Clear all saved predictions?')) {
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
            // Map notification methods to API format
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
    const text = `AI prediction: ${prediction.symbol} ${prediction.prediction.direction} to ${formattedPrice}`;
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
        a.download = `${prediction.symbol}_prediction.json`; 
        a.click();
        toast.success('Exported!', 'Exported');
    };

    // Format date
    const formatSavedDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    // Get confidence message
    const getConfidenceMessage = (confidence) => {
        if (confidence >= 80) return { icon: CheckCircle, text: 'Very high confidence - Strong signal detected', color: successColor };
        if (confidence >= 65) return { icon: CheckCircle, text: 'Good confidence - Favorable conditions', color: successColor };
        if (confidence >= 50) return { icon: AlertTriangle, text: 'Moderate confidence - Mixed signals', color: warningColor };
        return { icon: XCircle, text: 'Low confidence - Proceed with caution', color: errorColor };
    };

    // Render indicators
    const renderIndicators = () => {
        if (!prediction?.indicators || Object.keys(prediction.indicators).length === 0) {
            return (
                <NoIndicatorsMessage theme={theme}>
                    <AlertTriangle size={20} />
                    No technical indicators available for this prediction
                </NoIndicatorsMessage>
            );
        }

        return (
            <IndicatorsGrid>
                {Object.entries(prediction.indicators).map(([name, data]) => {
                    const signal = data?.signal ? String(data.signal).toUpperCase() : 'NEUTRAL';
                    const value = data?.value !== undefined && data?.value !== null ? data.value : '—';
                    
                    return (
                        <IndicatorItem key={name} theme={theme} $signal={signal}>
                            <IndicatorInfo>
                                <IndicatorName theme={theme}>{name}</IndicatorName>
                                <IndicatorNumericValue theme={theme}>
                                    {typeof value === 'number' ? value.toFixed(2) : value}
                                </IndicatorNumericValue>
                            </IndicatorInfo>
                            <IndicatorSignal theme={theme} $signal={signal}>
                                {signal === 'BUY' ? <ArrowUp size={14} /> : signal === 'SELL' ? <ArrowDown size={14} /> : <ArrowRight size={14} />}
                                {signal === 'BUY' ? 'Bullish' : signal === 'SELL' ? 'Bearish' : 'Neutral'}
                            </IndicatorSignal>
                        </IndicatorItem>
                    );
                })}
            </IndicatorsGrid>
        );
    };

    const isUrgent = countdown.days === 0 && countdown.hours < 6;
    const confidenceMsg = dynamicConfidence !== null ? getConfidenceMessage(dynamicConfidence) : null;

    // END OF PART 3 - Continue with Part 4 for the JSX return
// PART 4 - Add this after Part 3 in your PredictionsPage.js
// This contains the JSX return statement

    return (
        <PageContainer theme={theme}>
            {/* Particle Background */}
            <ParticleContainer>
                {particlesData.map(p => (
                    <Particle key={p.id} size={p.size} left={p.left} duration={p.duration} delay={p.delay} color={p.color} />
                ))}
            </ParticleContainer>

            {/* Rocket Animation */}
            {showRocket && (
                <RocketContainer left={Math.random() * 60 + 20} $crash={showRocket === 'down'}>
                    <Rocket size={48} color={showRocket === 'up' ? successColor : errorColor} />
                </RocketContainer>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <ModalOverlay onClick={() => setShowShareModal(false)}>
                    <ModalContent theme={theme} onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle theme={theme}>Share Prediction</ModalTitle>
                            <CloseButton theme={theme} onClick={() => setShowShareModal(false)}><X size={18} /></CloseButton>
                        </ModalHeader>
                        <ShareOptions>
                            <ShareOption theme={theme} onClick={() => handleShare('twitter')}><Twitter size={24} />Twitter</ShareOption>
                            <ShareOption theme={theme} onClick={() => handleShare('facebook')}><Facebook size={24} />Facebook</ShareOption>
                            <ShareOption theme={theme} onClick={() => handleShare('linkedin')}><Linkedin size={24} />LinkedIn</ShareOption>
                            <ShareOption theme={theme} onClick={() => handleShare('copy')}><Copy size={24} />Copy Link</ShareOption>
                        </ShareOptions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Header */}
            <Header>
                <Title theme={theme}>
                    <TitleIcon><Brain size={48} /></TitleIcon>
                    AI Price Predictions
                </Title>
                <Subtitle theme={theme}>Advanced machine learning predictions for stocks & crypto</Subtitle>
                <PoweredBy theme={theme}>
                    <Sparkles size={16} /> Powered by Neural Networks & Technical Analysis
                </PoweredBy>
            </Header>

            {/* Tabs */}
            <TabsContainer>
                <Tab theme={theme} $active={activeTab === 'predict'} onClick={() => setActiveTab('predict')}>
                    <Brain size={18} /> New Prediction
                </Tab>
                <Tab theme={theme} $active={activeTab === 'saved'} onClick={() => setActiveTab('saved')}>
                    <Bookmark size={18} /> Saved ({savedPredictions.length})
                </Tab>
                <Tab theme={theme} $active={activeTab === 'history'} onClick={() => navigate('/prediction-history')}>
                    <Clock size={18} /> History
                </Tab>
            </TabsContainer>

            {/* Stats Banner */}
            <StatsBanner>
                <StatCard theme={theme} delay={0}>
                    <StatIcon gradient={`linear-gradient(135deg, ${successColor}, ${successColor}99)`}>
                        <Target size={28} color="#fff" />
                    </StatIcon>
                    <StatValue theme={theme}>{platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}</StatValue>
                    <StatLabel theme={theme}>Platform Accuracy</StatLabel>
                </StatCard>
                <StatCard theme={theme} delay={0.1}>
                    <StatIcon gradient={`linear-gradient(135deg, ${accentColor}, ${accentColor}99)`}>
                        <Activity size={28} color="#fff" />
                    </StatIcon>
                    <StatValue theme={theme}>{platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}</StatValue>
                    <StatLabel theme={theme}>Total Predictions</StatLabel>
                </StatCard>
                <StatCard theme={theme} delay={0.2}>
                    <StatIcon gradient={`linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`}>
                        <Zap size={28} color="#fff" />
                    </StatIcon>
                    <StatValue theme={theme}>{platformStats.loading ? '...' : platformStats.correctPredictions.toLocaleString()}</StatValue>
                    <StatLabel theme={theme}>Correct Predictions</StatLabel>
                </StatCard>
            </StatsBanner>

            {/* PREDICT TAB */}
            {activeTab === 'predict' && (
                <>
                    <InputSection theme={theme}>
                        <InputForm onSubmit={fetchPrediction}>
                            <InputGroup>
                                <FormField>
                                    <Label theme={theme}><BarChart3 size={18} /> Symbol</Label>
                                    <AutocompleteContainer>
                                        <Input
                                            theme={theme}
                                            value={symbol}
                                            onChange={e => {
                                                const val = e.target.value;
                                                // Don't uppercase if it looks like a contract address
                                                const isContractAddress = val.startsWith('0x') || /^[1-9A-HJ-NP-Za-km-z]{20,}$/.test(val);
                                                setSymbol(isContractAddress ? val : val.toUpperCase());
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            placeholder="Search symbol or paste contract address..."
                                            autoComplete="off"
                                        />
                                        {showSuggestions && (suggestions.length > 0 || searchLoading) && (
                                            <SuggestionsDropdown theme={theme}>
                                                {searchLoading ? (
                                                    <NoResults theme={theme}>Searching...</NoResults>
                                                ) : suggestions.length > 0 ? (
                                                    suggestions.map((s, idx) => (
                                                        <SuggestionItem
                                                            key={`${s.symbol}-${idx}`}
                                                            theme={theme}
                                                            onMouseDown={() => handleSuggestionClick(s)}
                                                        >
                                                            <SuggestionLeft>
                                                                <SuggestionSymbol theme={theme}>
                                                                    {s.type === 'dex' ? s.symbol.split(':')[0] : s.symbol}
                                                                </SuggestionSymbol>
                                                                <SuggestionName theme={theme}>
                                                                    {s.name}
                                                                    {s.contractAddress && (
                                                                        <span style={{ opacity: 0.5, fontSize: '0.75em', marginLeft: '0.5rem' }}>
                                                                            {s.contractAddress.slice(0, 6)}...{s.contractAddress.slice(-4)}
                                                                        </span>
                                                                    )}
                                                                </SuggestionName>
                                                            </SuggestionLeft>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                <SuggestionType theme={theme} $type={s.type}>{s.type}</SuggestionType>
                                                                {s.type === 'dex' && s.chain && (
                                                                    <SuggestionChain theme={theme}>{s.chain}</SuggestionChain>
                                                                )}
                                                            </div>
                                                        </SuggestionItem>
                                                    ))
                                                ) : (
                                                    <NoResults theme={theme}>No matches found</NoResults>
                                                )}
                                            </SuggestionsDropdown>
                                        )}
                                    </AutocompleteContainer>
                                </FormField>
                                <FormField>
                                    <Label theme={theme}><Calendar size={18} /> Timeframe</Label>
                                    <Select theme={theme} value={days} onChange={e => setDays(e.target.value)}>
                                        <option value="7">7 Days (Short-term)</option>
                                        <option value="30">30 Days (Medium-term)</option>
                                        <option value="90">90 Days (Long-term)</option>
                                    </Select>
                                </FormField>
                            </InputGroup>
                            <PredictButton theme={theme} type="submit" disabled={loading || !symbol}>
                                {loading ? <><LoadingSpinner size={24} /> Analyzing...</> : <><Brain size={24} /> Generate Prediction</>}
                            </PredictButton>
                        </InputForm>
                    </InputSection>

                    {/* Prediction Results */}
                    {prediction && (
                        <ResultsContainer>
                            <PredictionCard theme={theme}>
                                {/* ✅ SHARED PREDICTION BANNER */}
                                {prediction.isShared && (
                                    <SharedPredictionBanner theme={theme}>
                                        <SharedBadgeLeft>
                                            <LiveDotLarge theme={theme} />
                                            <SharedText>
                                                <SharedTitle theme={theme}>
                                                    <Radio size={16} style={{ marginRight: '0.5rem' }} />
                                                    Live Prediction In Progress
                                                </SharedTitle>
                                                <SharedSubtitle theme={theme}>
                                                    {prediction.sharedMessage || 'You joined an active prediction for this symbol'}
                                                </SharedSubtitle>
                                            </SharedText>
                                        </SharedBadgeLeft>
                                        <ViewerCount theme={theme}>
                                            <Users size={18} />
                                            {prediction.viewCount || 1} watching
                                        </ViewerCount>
                                    </SharedPredictionBanner>
                                )}

                                {/* Live Status with Countdown */}
                                {liveData && (
                                    <LiveStatusCard theme={theme}>
                                        <LiveStatusHeader>
                                            <LiveStatusTitle theme={theme}>
                                                <LiveDot theme={theme} />
                                                Live Tracking Active
                                            </LiveStatusTitle>
                                            <CountdownDisplay>
                                                <CountdownUnit theme={theme} $urgent={isUrgent}>
                                                    <CountdownValue theme={theme} $urgent={isUrgent}>{String(countdown.days).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel theme={theme}>Days</CountdownLabel>
                                                </CountdownUnit>
                                                <CountdownSeparator theme={theme}>:</CountdownSeparator>
                                                <CountdownUnit theme={theme} $urgent={isUrgent}>
                                                    <CountdownValue theme={theme} $urgent={isUrgent}>{String(countdown.hours).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel theme={theme}>Hours</CountdownLabel>
                                                </CountdownUnit>
                                                <CountdownSeparator theme={theme}>:</CountdownSeparator>
                                                <CountdownUnit theme={theme} $urgent={isUrgent}>
                                                    <CountdownValue theme={theme} $urgent={isUrgent}>{String(countdown.minutes).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel theme={theme}>Min</CountdownLabel>
                                                </CountdownUnit>
                                                <CountdownSeparator theme={theme}>:</CountdownSeparator>
                                                <CountdownUnit theme={theme} $urgent={isUrgent}>
                                                    <CountdownValue theme={theme} $urgent={isUrgent}>{String(countdown.seconds).padStart(2, '0')}</CountdownValue>
                                                    <CountdownLabel theme={theme}>Sec</CountdownLabel>
                                                </CountdownUnit>
                                            </CountdownDisplay>
                                        </LiveStatusHeader>

                                        {/* Dynamic Confidence Display */}
                                        {dynamicConfidence !== null && (
                                            <DynamicConfidenceCard theme={theme} $trend={confidenceTrend}>
                                                <ConfidenceHeader>
                                                    <ConfidenceTitle theme={theme}>
                                                        <Activity size={18} />
                                                        Live Confidence Score
                                                    </ConfidenceTitle>
                                                    {confidenceChange !== 0 && (
                                                        <ConfidenceChange theme={theme} $positive={confidenceChange > 0}>
                                                            {confidenceChange > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                                            {Math.abs(confidenceChange).toFixed(1)}%
                                                        </ConfidenceChange>
                                                    )}
                                                </ConfidenceHeader>
                                                <ConfidenceValueLarge theme={theme} $value={dynamicConfidence}>
                                                    {dynamicConfidence.toFixed(1)}%
                                                </ConfidenceValueLarge>
                                                <ConfidenceBarLarge theme={theme}>
                                                    <ConfidenceBarFill theme={theme} $value={dynamicConfidence} />
                                                </ConfidenceBarLarge>
                                                {confidenceMsg && (
                                                    <ConfidenceMessage theme={theme}>
                                                        <confidenceMsg.icon size={16} color={confidenceMsg.color} />
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
                                        <StockSymbol theme={theme}>
                                            {prediction.symbol}
                                            <WatchlistStar onClick={() => handleWatchlistToggle(prediction.symbol)}>
                                                <Star size={24} fill={watchlist.includes(prediction.symbol?.toUpperCase()) ? warningColor : 'none'} color={warningColor} />
                                            </WatchlistStar>
                                        </StockSymbol>
                                        <CompanyName theme={theme}>{getAssetName(prediction.symbol)}</CompanyName>
                                        <CurrentPriceSection>
                                            <CurrentPriceLabel theme={theme}>Current:</CurrentPriceLabel>
                                           <CurrentPriceValue theme={theme}>
    {formatPredictionPrice(
        liveData?.livePrice || liveData?.currentPrice || prediction.current_price,
        prediction.symbol
    )}
</CurrentPriceValue>
                                        </CurrentPriceSection>
                                    </StockInfo>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <DirectionBadge
                                            theme={theme}
                                            $up={prediction.prediction.direction === 'UP'}
                                            $neutral={prediction.prediction.direction === 'NEUTRAL'}
                                        >
                                            {prediction.prediction.direction === 'UP' ? (
                                                <TrendingUp size={28} />
                                            ) : prediction.prediction.direction === 'NEUTRAL' ? (
                                                <AlertTriangle size={28} />
                                            ) : (
                                                <TrendingDown size={28} />
                                            )}
                                            {prediction.prediction.direction === 'NEUTRAL' ? 'NO SIGNAL' : prediction.prediction.direction}
                                        </DirectionBadge>
                                        {prediction.prediction.signal_strength && (
                                            <SignalStrengthBadge theme={theme} $strength={prediction.prediction.signal_strength}>
                                                {prediction.prediction.signal_strength === 'strong' ? (
                                                    <><Zap size={14} /> Strong Signal</>
                                                ) : prediction.prediction.signal_strength === 'moderate' ? (
                                                    <><Activity size={14} /> Moderate</>
                                                ) : (
                                                    <><AlertTriangle size={14} /> Weak Signal</>
                                                )}
                                            </SignalStrengthBadge>
                                        )}
                                    </div>
                                </PredictionHeader>

                                {/* Action Buttons */}
                                <ActionButtons>
                                    <ActionButton theme={theme} onClick={handleSavePrediction}><BookmarkPlus size={18} /> Save</ActionButton>
                                    <ActionButton theme={theme} onClick={() => setShowShareModal(true)}><Share2 size={18} /> Share</ActionButton>
                                    <ActionButton theme={theme} onClick={handleExport}><Download size={18} /> Export</ActionButton>
                                    <ActionButton theme={theme} onClick={() => setShowAlertModal(true)}><Bell size={18} /> Alert</ActionButton>
                                    <ActionButton theme={theme} onClick={() => { setSymbol(prediction.symbol); fetchPrediction({ preventDefault: () => {} }); }}>
                                        <RefreshCw size={18} /> Refresh
                                    </ActionButton>
                                </ActionButtons>

                                {/* Metrics Grid */}
                                <MetricsGrid>
                                 <MetricCard theme={theme}>
    <MetricIcon theme={theme} $variant="primary"><Target size={24} /></MetricIcon>
    <MetricLabel theme={theme}>Target Price</MetricLabel>
    <MetricValue theme={theme}>
        {(() => {
            console.log('🎯 Target Price Data:', {
                raw: prediction.prediction.target_price,
                type: typeof prediction.prediction.target_price,
                prediction: prediction.prediction,
                allPrediction: prediction
            });
            return formatPredictionPrice(prediction.prediction.target_price, prediction.symbol);
        })()}
    </MetricValue>
</MetricCard>
                                    <MetricCard theme={theme}>
                                        <MetricIcon theme={theme} $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            <Percent size={24} />
                                        </MetricIcon>
                                        <MetricLabel theme={theme}>Price Change</MetricLabel>
                                        <MetricValue theme={theme} $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            {prediction.prediction.direction === 'UP' ? '+' : ''}{prediction.prediction.price_change_percent?.toFixed(2)}%
                                        </MetricValue>
                                    </MetricCard>
                                    <MetricCard theme={theme}>
                                        <MetricIcon theme={theme} $variant="warning"><DollarSign size={24} /></MetricIcon>
                                        <MetricLabel theme={theme}>Dollar Change</MetricLabel>
                                       <MetricValue theme={theme} $variant="warning">
    {prediction.prediction.direction === 'UP' ? '+' : ''}
    {formatPredictionPrice(
        Math.abs(prediction.prediction.target_price - prediction.current_price),
        prediction.symbol
    )}
</MetricValue>
                                    </MetricCard>
                                    <MetricCard theme={theme}>
                                        <MetricIcon theme={theme}><Award size={24} /></MetricIcon>
                                        <MetricLabel theme={theme}>Initial Confidence</MetricLabel>
                                        <MetricValue theme={theme}>{prediction.prediction.confidence?.toFixed(1)}%</MetricValue>
                                    </MetricCard>
                                </MetricsGrid>

                                {/* Technical Indicators */}
                                <IndicatorsSection theme={theme}>
                                    <IndicatorsTitle theme={theme}>
                                        <BarChart3 size={20} /> Technical Indicators
                                    </IndicatorsTitle>
                                    {renderIndicators()}
                                </IndicatorsSection>

                                {/* Price Projection Chart */}
                                {prediction.chartData && (() => {
                                    // Calculate Y-axis domain with padding for micro-prices
                                    const minPrice = Math.min(prediction.current_price, prediction.prediction.target_price);
                                    const maxPrice = Math.max(prediction.current_price, prediction.prediction.target_price);
                                    const padding = (maxPrice - minPrice) * 0.1 || minPrice * 0.1;
                                    const yMin = Math.max(0, minPrice - padding);
                                    const yMax = maxPrice + padding;

                                    return (
                                    <ChartSection theme={theme}>
                                        <ChartTitle theme={theme}><Activity size={20} /> Price Projection</ChartTitle>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <AreaChart data={prediction.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                                <defs>
                                                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={prediction.prediction.direction === 'UP' ? successColor : errorColor} stopOpacity={0.4} />
                                                        <stop offset="100%" stopColor={prediction.prediction.direction === 'UP' ? successColor : errorColor} stopOpacity={0.05} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={`${accentColor}33`} />
                                                <XAxis
                                                    dataKey="day"
                                                    tick={{ fill: theme?.text?.secondary || '#94a3b8', fontSize: 12 }}
                                                    axisLine={{ stroke: `${accentColor}4D` }}
                                                />
                                                <YAxis
                                                    domain={[yMin, yMax]}
                                                    tick={{ fill: theme?.text?.secondary || '#94a3b8', fontSize: 10 }}
                                                    axisLine={{ stroke: `${accentColor}4D` }}
                                                    tickFormatter={v => formatPredictionPrice(v, prediction.symbol)}
                                                    width={100}
                                                    tickCount={6}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: theme?.bg?.card || 'rgba(15, 23, 42, 0.95)',
                                                        border: `1px solid ${accentColor}66`,
                                                        borderRadius: '12px',
                                                        color: theme?.text?.primary || '#e0e6ed'
                                                    }}
                                                    formatter={(value) => [formatPredictionPrice(value, prediction.symbol), 'Predicted Price']}
                                                    labelFormatter={(label) => label}
                                                />
                                                <ReferenceLine
                                                    y={prediction.current_price}
                                                    stroke={primaryColor}
                                                    strokeDasharray="5 5"
                                                    label={{ value: 'Current', fill: primaryColor, fontSize: 12, position: 'left' }}
                                                />
                                                <ReferenceLine
                                                    y={prediction.prediction.target_price}
                                                    stroke={prediction.prediction.direction === 'UP' ? successColor : errorColor}
                                                    strokeDasharray="5 5"
                                                    label={{ value: 'Target', fill: prediction.prediction.direction === 'UP' ? successColor : errorColor, fontSize: 12, position: 'right' }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="price"
                                                    stroke={prediction.prediction.direction === 'UP' ? successColor : errorColor}
                                                    strokeWidth={3}
                                                    fill="url(#priceGradient)"
                                                    dot={{ fill: prediction.prediction.direction === 'UP' ? successColor : errorColor, strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                        <ChartLegend>
                                            <LegendItem><LegendColor color={prediction.prediction.direction === 'UP' ? successColor : errorColor} /><LegendText theme={theme}>Predicted Price Path</LegendText></LegendItem>
                                            <LegendItem><LegendColor color={primaryColor} /><LegendText theme={theme}>Current Price</LegendText></LegendItem>
                                        </ChartLegend>
                                    </ChartSection>
                                    );
                                })()}
                            </PredictionCard>
                        </ResultsContainer>
                    )}

                    {/* Empty State */}
                    {!prediction && !loading && (
                        <EmptyState>
                            <EmptyIcon theme={theme}><Brain size={72} color={accentColor} /></EmptyIcon>
                            <EmptyTitle theme={theme}>Ready to Predict</EmptyTitle>
                            <EmptyText theme={theme}>Enter a stock, crypto, or DEX token symbol above to generate an AI-powered price prediction</EmptyText>
                        </EmptyState>
                    )}
                </>
            )}

            {/* SAVED TAB */}
            {activeTab === 'saved' && (
                <SavedPredictionsContainer>
                    {savedPredictions.length > 0 && (
                        <ClearAllButton theme={theme} onClick={handleClearAllSaved}>
                            <Trash2 size={18} /> Clear All Saved
                        </ClearAllButton>
                    )}
                    
                    {savedPredictions.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon theme={theme}><Bookmark size={72} color={accentColor} /></EmptyIcon>
                            <EmptyTitle theme={theme}>No Saved Predictions</EmptyTitle>
                            <EmptyText theme={theme}>Save predictions to track them here</EmptyText>
                        </EmptyState>
                    ) : (
                        <SavedPredictionsGrid>
                            {savedPredictions.map(saved => (
                                <SavedPredictionCard key={saved.id} theme={theme} $up={saved.prediction?.direction === 'UP'}>
                                    <SavedCardHeader>
                                        <SavedSymbol theme={theme}>{saved.symbol}</SavedSymbol>
                                        <SavedDirection theme={theme} $up={saved.prediction?.direction === 'UP'}>
                                            {saved.prediction?.direction === 'UP' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                            {saved.prediction?.direction}
                                        </SavedDirection>
                                    </SavedCardHeader>
                                    <SavedCardBody>
                                      <SavedMetric theme={theme}>
    <SavedMetricLabel theme={theme}>Target</SavedMetricLabel>
    <SavedMetricValue theme={theme}>
        {formatPredictionPrice(saved.prediction?.target_price, saved.symbol)}
    </SavedMetricValue>
</SavedMetric>
                                        <SavedMetric theme={theme}>
                                            <SavedMetricLabel theme={theme}>Change</SavedMetricLabel>
                                            <SavedMetricValue theme={theme}>
                                                {saved.prediction?.direction === 'UP' ? '+' : ''}{saved.prediction?.price_change_percent?.toFixed(2)}%
                                            </SavedMetricValue>
                                        </SavedMetric>
                                        <SavedMetric theme={theme}>
                                            <SavedMetricLabel theme={theme}>Confidence</SavedMetricLabel>
                                            <SavedMetricValue theme={theme}>{saved.prediction?.confidence?.toFixed(1)}%</SavedMetricValue>
                                        </SavedMetric>
                                        <SavedMetric theme={theme}>
    <SavedMetricLabel theme={theme}>Entry Price</SavedMetricLabel>
    <SavedMetricValue theme={theme}>
        {formatPredictionPrice(saved.current_price, saved.symbol)}
    </SavedMetricValue>
</SavedMetric>
                                    </SavedCardBody>
                                    <SavedCardFooter theme={theme}>
                                        <SavedDate theme={theme}>
                                            <Calendar size={14} />
                                            {formatSavedDate(saved.savedAt || saved.timestamp)}
                                        </SavedDate>
                                        <SavedActions>
                                            <SavedActionButton theme={theme} onClick={() => handleViewSavedPrediction(saved)} title="View">
                                                <Eye size={16} />
                                            </SavedActionButton>
                                            <SavedActionButton theme={theme} $danger onClick={() => handleDeleteSavedPrediction(saved.id)} title="Delete">
                                                <Trash2 size={16} />
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
        </PageContainer>
    );
};

export default PredictionsPage;