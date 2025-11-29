// src/pages/DashboardPage.js - REVAMPED CLEAN DASHBOARD WITH THEME SUPPORT
// Layout: Header → Ticker Tapes → Chart → Paper Trading → Widgets (Leaderboard | Whale | Social) → Achievements

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, Activity, DollarSign,
    Zap, Target, Brain, Eye, ArrowUpRight, ArrowDownRight,
    Clock, Flame, Trophy, RefreshCw, Sparkles, Users, Award, MessageSquare,
    ThumbsUp, Share2, ChevronRight, Crown, Percent, Lock, Rocket
} from 'lucide-react';
import nexusSignalLogo from '../assets/nexus-signal-logo.png';
import AdvancedChart from '../components/AdvancedChart';
import PatternDetector from '../components/PatternDetector';
import TickerLink, { TickerText } from '../components/TickerLink';
import WhaleAlertWidget from '../components/WhaleAlertWidget';

// ============ BORDER COLORS FOR AVATAR FRAMES ============
const BORDER_COLORS = {
    'border-default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    'border-ruby': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    'border-sapphire': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
    'border-emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    'border-amethyst': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
    'border-gold': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    'border-platinum': { color: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.5)' },
    'border-obsidian': { color: '#1e293b', glow: 'rgba(30, 41, 59, 0.8)' },
    'border-rose': { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)' },
    'border-cyan': { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
    'border-sunset': { color: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)' },
    'border-cosmic': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
    // Fallbacks without prefix
    'default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    'ruby': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    'sapphire': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
    'emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    'amethyst': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
    'gold': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    'platinum': { color: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.5)' },
    'obsidian': { color: '#1e293b', glow: 'rgba(30, 41, 59, 0.8)' },
    'rose': { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.5)' },
    'cyan': { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
    'sunset': { color: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)' },
    'cosmic': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' }
};

// Helper to get border color from equipped border ID
const getBorderStyle = (equippedBorder) => {
    if (!equippedBorder) return BORDER_COLORS['border-default'];
    return BORDER_COLORS[equippedBorder] || BORDER_COLORS[`border-${equippedBorder}`] || BORDER_COLORS['border-default'];
};

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const scrollTicker = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
`;

const scrollTickerReverse = keyframes`
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
`;

// Note: rankGlow uses theme colors via the component's box-shadow override
const rankGlow = keyframes`
    0%, 100% { 
        opacity: 1;
        transform: scale(1);
    }
    50% { 
        opacity: 0.8;
        transform: scale(1.05);
    }
`;

// Dynamic glow animation using theme
const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.6); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
    z-index: 1;

    @media (max-width: 768px) {
        padding-left: 1rem;
        padding-right: 1rem;
    }
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    max-width: 1800px;
    margin: 0 auto;
`;

const Header = styled.div`
    margin-bottom: 1.5rem;
    animation: ${fadeIn} 0.8s ease-out;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;

const StaticLogo = styled.img`
    width: 70px;
    height: 70px;
    object-fit: contain;
    filter: drop-shadow(0 0 20px ${props => props.theme.brand?.primary || '#00adef'}99)
            drop-shadow(0 0 35px rgba(139, 92, 246, 0.6));
    transition: all 0.3s ease;
    flex-shrink: 0;

    &:hover {
        filter: drop-shadow(0 0 30px ${props => props.theme.brand?.primary || '#00adef'}cc)
                drop-shadow(0 0 50px rgba(139, 92, 246, 0.8));
        transform: scale(1.05);
    }

    @media (max-width: 768px) {
        width: 50px;
        height: 50px;
    }
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    background: ${props => props.theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.25rem;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 1.75rem;
    }
`;

const Subtitle = styled.p`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const LiveClock = styled.div`
    background: ${props => props.theme.brand?.primary || '#00adef'}1a;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(0, 173, 237, 0.3)'};
    border-radius: 12px;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ClockTime = styled.div`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const ClockDate = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const MarketStatus = styled.div`
    background: ${props => props.$open ? `${props.theme.success || '#10b981'}1a` : `${props.theme.error || '#ef4444'}1a`};
    border: 1px solid ${props => props.$open ? `${props.theme.success || '#10b981'}4D` : `${props.theme.error || '#ef4444'}4D`};
    border-radius: 12px;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const StatusDot = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$open ? (props.theme.success || '#10b981') : (props.theme.error || '#ef4444')};
    animation: ${pulse} 2s ease-in-out infinite;
    box-shadow: 0 0 10px ${props => props.$open ? (props.theme.success || '#10b981') : (props.theme.error || '#ef4444')};
`;

const StatusText = styled.div`
    font-weight: 600;
    font-size: 0.9rem;
    color: ${props => props.$open ? (props.theme.success || '#10b981') : (props.theme.error || '#ef4444')};
`;

// ============ TICKER TAPES ============
const TickerSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const TickerWrapper = styled.div`
    display: flex;
    align-items: stretch;
    gap: 0;
`;

const TickerLabel = styled.div`
    background: ${props => props.$variant === 'movers' 
        ? `linear-gradient(135deg, ${props.theme.brand?.secondary || props.theme.brand?.primary}40 0%, ${props.theme.brand?.secondary || props.theme.brand?.primary}26 100%)` 
        : `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}40 0%, ${props.theme.brand?.primary || '#00adef'}26 100%)`};
    border: 1px solid ${props => props.$variant === 'movers' 
        ? `${props.theme.brand?.secondary || props.theme.brand?.primary}66` 
        : props.theme.border?.hover || 'rgba(0, 173, 237, 0.4)'};
    border-right: none;
    border-radius: 10px 0 0 10px;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: ${props => props.$variant === 'movers' ? (props.theme.brand?.secondary || props.theme.brand?.primary) : (props.theme.brand?.primary || '#00adef')};
    white-space: nowrap;
    min-width: 100px;
    justify-content: center;

    @media (max-width: 768px) {
        min-width: 80px;
        padding: 0 0.75rem;
        font-size: 0.65rem;
    }
`;

const TickerContainer = styled.div`
    flex: 1;
    background: ${props => props.$variant === 'movers' 
        ? `${props.theme.brand?.secondary || props.theme.brand?.primary}0f` 
        : `${props.theme.brand?.primary || '#00adef'}0f`};
    border: 1px solid ${props => props.$variant === 'movers' 
        ? `${props.theme.brand?.secondary || props.theme.brand?.primary}33` 
        : props.theme.border?.secondary || 'rgba(0, 173, 237, 0.2)'};
    border-left: none;
    border-radius: 0 10px 10px 0;
    overflow: hidden;
    padding: 0.6rem 0;
`;

const TickerTrack = styled.div`
    display: flex;
    animation: ${props => props.$reverse ? scrollTickerReverse : scrollTicker} ${props => props.$duration || '30s'} linear infinite;
    white-space: nowrap;

    @media (max-width: 768px) {
        animation-duration: ${props => {
            const duration = parseFloat(props.$duration) || 30;
            return `${duration * 0.5}s`; // 50% faster on mobile
        }};
    }
`;

const TickerItem = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 1.5rem;
    font-weight: 600;
    font-size: 0.9rem;
`;

const TickerSymbolClickable = styled.span`
    color: ${props => props.$variant === 'movers' ? (props.theme.brand?.secondary || props.theme.brand?.primary) : (props.theme.brand?.primary || '#00adef')};
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        text-decoration: underline;
        filter: brightness(1.2);
    }
`;

const TickerPrice = styled.span`
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const TickerChange = styled.span`
    color: ${props => props.$positive ? (props.theme.success || '#10b981') : (props.theme.error || '#ef4444')};
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.85rem;
`;

// ============ CHART SECTION ============
const ChartSection = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const SearchContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: center;
    flex-wrap: wrap;
`;

const SearchInput = styled.input`
    flex: 1;
    min-width: 250px;
    padding: 0.75rem 1.25rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}0d;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(0, 173, 237, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        background: ${props => props.theme.brand?.primary || '#00adef'}1a;
        border-color: ${props => props.theme.border?.hover || 'rgba(0, 217, 255, 0.5)'};
        box-shadow: 0 0 20px ${props => props.theme.brand?.primary || '#00adef'}33;
    }

    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
        font-weight: 500;
    }
`;

const SearchButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}4D 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}33 100%);
    border: 1px solid ${props => props.theme.border?.hover || 'rgba(0, 217, 255, 0.5)'};
    border-radius: 10px;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}66 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}4D 100%);
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const SymbolSelector = styled.div`
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
`;

const SymbolButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active 
        ? `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}4D 0%, ${props.theme.brand?.accent || '#8b5cf6'}33 100%)` 
        : `${props.theme.brand?.primary || '#00adef'}0d`};
    border: 1px solid ${props => props.$active ? (props.theme.border?.hover || 'rgba(0, 217, 255, 0.5)') : (props.theme.border?.secondary || 'rgba(0, 173, 237, 0.2)')};
    border-radius: 8px;
    color: ${props => props.$active ? (props.theme.brand?.primary || '#00adef') : (props.theme.text?.secondary || '#94a3b8')};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}33 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}26 100%);
        border-color: ${props => props.theme.border?.hover || 'rgba(0, 217, 255, 0.5)'};
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const LoadingChartPlaceholder = styled.div`
    background: ${props => props.theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 1px solid ${props => props.theme.border?.secondary || 'rgba(0, 173, 237, 0.2)'};
    border-radius: 16px;
    padding: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 500px;
`;

const LoadingSpinner = styled.div`
    animation: ${rotate} 2s linear infinite;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

// ============ PAPER TRADING HERO ============
const PaperTradingHero = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.success || '#10b981'}1f 0%, ${props => props.theme.brand?.primary || '#00adef'}1f 50%, ${props => props.theme.brand?.accent || '#8b5cf6'}1f 100%);
    border: 1px solid ${props => props.theme.success || '#10b981'}59;
    border-radius: 16px;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr auto;
    gap: 1.5rem;
    align-items: center;
    animation: ${fadeIn} 0.8s ease-out;
    position: relative;
    overflow: hidden;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        text-align: center;
    }
`;

const PaperTradingTitle = styled.div`
    position: relative;
    z-index: 1;
`;

const PaperTradingLabel = styled.div`
    color: ${props => props.theme.success || '#10b981'};
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 0.4rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const PaperTradingValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.$color || props.theme.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: 1.75rem;
        justify-content: center;
    }
`;

const PaperTradingChange = styled.div`
    font-size: 0.9rem;
    color: ${props => props.$positive ? (props.theme.success || '#10b981') : (props.theme.error || '#ef4444')};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.2rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const RankBadge = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    position: relative;
    z-index: 1;
`;

const RankNumber = styled.div`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return `linear-gradient(135deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.secondary || props.theme.brand?.primary} 100%)`;
        if (props.$rank === 2) return `linear-gradient(135deg, ${props.theme.brand?.accent || props.theme.brand?.primary}99 0%, ${props.theme.brand?.accent || props.theme.brand?.primary}66 100%)`;
        if (props.$rank === 3) return `linear-gradient(135deg, ${props.theme.brand?.secondary || props.theme.brand?.primary} 0%, ${props.theme.brand?.primary}cc 100%)`;
        return `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`;
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
    box-shadow: ${props => props.$rank <= 3 ? `0 0 20px ${props.theme.brand?.primary}66` : '0 8px 25px rgba(0, 0, 0, 0.3)'};
    animation: ${props => props.$rank <= 3 ? css`${rankGlow} 2s ease-in-out infinite` : 'none'};
    
    ${props => props.$rank <= 3 && css`
        &:hover {
            box-shadow: 0 0 40px ${props.theme.brand?.primary}99;
        }
    `}
`;

const RankLabel = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.8rem;
    font-weight: 600;
`;

const ViewTradingButton = styled.button`
    padding: 1rem 1.75rem;
    background: linear-gradient(135deg, ${props => props.theme.success || '#10b981'} 0%, #059669 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.theme.success || '#10b981'}66;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

// ============ THREE COLUMN WIDGETS ============
const WidgetsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Widget = styled.div`
    background: ${props => props.theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 1px solid ${props => props.$borderColor || props.theme.border?.secondary || 'rgba(0, 173, 237, 0.2)'};
    border-radius: 14px;
    padding: 1.25rem;
    animation: ${fadeIn} 0.8s ease-out;
    display: flex;
    flex-direction: column;
`;

const WidgetHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const WidgetTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.$color || props.theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const Badge = styled.span`
    background: ${props => props.$variant === 'success' ? `${props.theme.success || '#10b981'}33` : `${props.theme.brand?.primary || '#00adef'}33`};
    color: ${props => props.$variant === 'success' ? (props.theme.success || '#10b981') : (props.theme.brand?.primary || '#00adef')};
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.3rem;
`;

const WidgetContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    max-height: 320px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: ${props => props.theme.brand?.primary || '#00adef'}1a;
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme.brand?.primary || '#00adef'}4D;
        border-radius: 3px;
    }
`;

const ViewAllButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: ${props => props.$bg || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}26 0%, ${props.theme.brand?.primary || '#00adef'}0d 100%)`};
    border: 1px solid ${props => props.$borderColor || props.theme.border?.primary || 'rgba(0, 173, 237, 0.25)'};
    border-radius: 8px;
    color: ${props => props.$color || props.theme.brand?.primary || '#00adef'};
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        transform: translateY(-2px);
        background: ${props => props.$hoverBg || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}40 0%, ${props.theme.brand?.primary || '#00adef'}1a 100%)`};
    }
`;

// ============ PROFILE AVATAR (REUSABLE) ============
const ProfileAvatar = styled.div`
    width: ${props => props.$size || '40px'};
    height: ${props => props.$size || '40px'};
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : `linear-gradient(135deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.accent || props.theme.brand?.secondary} 100%)`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: ${props => props.$fontSize || '1rem'};
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    border: 2px solid ${props => props.$borderColor || 'transparent'};
    box-shadow: ${props => props.$glow ? `0 0 12px ${props.$glow}` : 'none'};
    flex-shrink: 0;

    &:hover {
        transform: scale(1.08);
        box-shadow: ${props => props.$glow ? `0 0 20px ${props.$glow}` : `0 0 15px ${props.theme.brand?.primary}80`};
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

// ============ LEADERBOARD ============
const LeaderboardItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: ${props => props.$isUser ? `${props.theme.brand?.primary || '#00adef'}1f` : 'rgba(251, 191, 36, 0.04)'};
    border: 1px solid ${props => props.$isUser ? props.theme.border?.primary || 'rgba(0, 173, 237, 0.3)' : 'rgba(251, 191, 36, 0.1)'};
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(251, 191, 36, 0.08);
        transform: translateX(4px);
    }
`;

const LeaderboardRank = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => {
        if (props.$rank === 1) return `linear-gradient(135deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.secondary || props.theme.brand?.primary}cc 100%)`;
        if (props.$rank === 2) return `linear-gradient(135deg, ${props.theme.brand?.accent || props.theme.brand?.primary}99 0%, ${props.theme.brand?.accent || props.theme.brand?.primary}66 100%)`;
        if (props.$rank === 3) return `linear-gradient(135deg, ${props.theme.brand?.secondary || props.theme.brand?.primary} 0%, ${props.theme.brand?.primary}99 100%)`;
        return `${props.theme.brand?.primary || '#00adef'}33`;
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: ${props => props.$rank <= 3 ? 'white' : (props.theme.brand?.primary || '#00adef')};
    font-size: 0.9rem;
    flex-shrink: 0;
`;

const LeaderboardInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const LeaderboardName = styled.div`
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-weight: 700;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const LeaderboardStats = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
`;

const LeaderboardReturn = styled.div`
    color: ${props => props.$positive ? (props.theme.success || '#10b981') : (props.theme.error || '#ef4444')};
    font-weight: 700;
    font-size: 0.95rem;
    flex-shrink: 0;
`;

// ============ SOCIAL FEED ============
const SocialPost = styled.div`
    padding: 0.75rem;
    background: ${props => props.theme.brand?.primary}0a;
    border: 1px solid ${props => props.theme.brand?.primary}1a;
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary}14;
        border-color: ${props => props.theme.brand?.primary}40;
    }
`;

const PostHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
`;

const PostUserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const PostUsername = styled.div`
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    
    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const PostTime = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.7rem;
`;

const PostContent = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    line-height: 1.4;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const PostActions = styled.div`
    display: flex;
    gap: 1rem;
`;

const PostAction = styled.button`
    background: none;
    border: none;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: color 0.2s ease;
    padding: 0;

    &:hover {
        color: ${props => props.$color || props.theme.brand?.primary};
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem 1rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};

    svg {
        margin-bottom: 0.75rem;
        opacity: 0.5;
    }

    p {
        font-size: 0.9rem;
    }
`;

// ============ ACHIEVEMENTS ============
const AchievementsSection = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary}14 0%, ${props => props.theme.brand?.accent || props.theme.brand?.secondary}14 100%);
    border: 1px solid ${props => props.theme.brand?.primary}40;
    border-radius: 14px;
    padding: 1.25rem;
    animation: ${fadeIn} 0.8s ease-out 0.2s backwards;
`;

const AchievementsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const AchievementsTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme.brand?.accent || props.theme.brand?.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const AchievementsProgress = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ProgressBar = styled.div`
    width: 180px;
    height: 8px;
    background: ${props => props.theme.brand?.primary}33;
    border-radius: 4px;
    overflow: hidden;

    @media (max-width: 768px) {
        width: 120px;
    }
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(90deg, ${props => props.theme.brand?.primary}, ${props => props.theme.brand?.accent || props.theme.brand?.secondary});
    border-radius: 4px;
    transition: width 1s ease-out;
`;

const ProgressText = styled.span`
    color: ${props => props.theme.brand?.accent || props.theme.brand?.primary};
    font-weight: 700;
    font-size: 0.85rem;
    white-space: nowrap;
`;

const AchievementsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.75rem;
`;

const AchievementBadge = styled.div`
    background: ${props => props.$unlocked 
        ? props.$rarity === 'legendary' ? `linear-gradient(135deg, ${props.theme.brand?.primary}33 0%, ${props.theme.brand?.secondary || props.theme.brand?.primary}1a 100%)`
        : props.$rarity === 'epic' ? `linear-gradient(135deg, ${props.theme.brand?.accent || props.theme.brand?.primary}33 0%, ${props.theme.brand?.primary}1a 100%)`
        : props.$rarity === 'rare' ? `linear-gradient(135deg, ${props.theme.brand?.secondary || props.theme.brand?.primary}33 0%, ${props.theme.brand?.primary}1a 100%)`
        : `linear-gradient(135deg, ${props.theme.brand?.primary}33 0%, ${props.theme.brand?.accent || props.theme.brand?.primary}1a 100%)`
        : 'rgba(100, 116, 139, 0.08)'
    };
    border: 2px solid ${props => {
        if (!props.$unlocked) return 'rgba(100, 116, 139, 0.15)';
        if (props.$rarity === 'legendary') return `${props.theme.brand?.primary}80`;
        if (props.$rarity === 'epic') return `${props.theme.brand?.accent || props.theme.brand?.primary}80`;
        if (props.$rarity === 'rare') return `${props.theme.brand?.secondary || props.theme.brand?.primary}80`;
        return `${props.theme.brand?.primary}80`;
    }};
    border-radius: 10px;
    padding: 1rem 0.5rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    opacity: ${props => props.$unlocked ? 1 : 0.5};

    ${props => props.$unlocked && css`
        animation: ${glowPulse} 3s ease-in-out infinite;
        animation-delay: ${() => Math.random() * 2}s;
    `}

    &:hover {
        transform: ${props => props.$unlocked ? 'translateY(-4px) scale(1.02)' : 'none'};
    }
`;

const BadgeIcon = styled.div`
    font-size: 1.8rem;
    margin-bottom: 0.4rem;
    animation: ${props => props.$unlocked ? css`${bounce} 2s ease-in-out infinite` : 'none'};
    filter: ${props => props.$unlocked ? 'none' : 'grayscale(100%)'};
`;

const BadgeLabel = styled.div`
    font-size: 0.7rem;
    color: ${props => props.$unlocked ? (props.theme.text?.primary || '#e0e6ed') : (props.theme.text?.tertiary || '#64748b')};
    font-weight: 600;
    line-height: 1.2;
`;

const BadgeLock = styled.div`
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    opacity: 0.6;
`;

const RarityDot = styled.div`
    position: absolute;
    top: 0.4rem;
    left: 0.4rem;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rarity === 'legendary') return `linear-gradient(135deg, ${props.theme.brand?.primary}, ${props.theme.brand?.secondary || props.theme.brand?.primary})`;
        if (props.$rarity === 'epic') return `linear-gradient(135deg, ${props.theme.brand?.accent || props.theme.brand?.primary}, ${props.theme.brand?.primary})`;
        if (props.$rarity === 'rare') return `linear-gradient(135deg, ${props.theme.brand?.secondary || props.theme.brand?.primary}, ${props.theme.brand?.primary})`;
        return `linear-gradient(135deg, ${props.theme.brand?.accent || props.theme.brand?.primary}, ${props.theme.success || '#10b981'})`;
    }};
`;

// ============ COMPONENT ============
const DashboardPage = () => {
    const navigate = useNavigate();
    const { api, isAuthenticated, user } = useAuth();
    const { theme, primary } = useTheme();
    const toast = useToast();

    // Core states
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [marketOpen, setMarketOpen] = useState(false);

    // Ticker data
    const [watchlistTicker, setWatchlistTicker] = useState([]);
    const [moversTicker, setMoversTicker] = useState([]);

    // Chart states
    const [advancedChartData, setAdvancedChartData] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [loadingChart, setLoadingChart] = useState(false);
    const [searchSymbol, setSearchSymbol] = useState('');

    // Paper trading
    const [paperTradingStats, setPaperTradingStats] = useState(null);
    const [userRank, setUserRank] = useState(null);

    // Widgets
    const [leaderboard, setLeaderboard] = useState([]);
    const [socialFeed, setSocialFeed] = useState([]);

    // Achievements
    const [achievements, setAchievements] = useState([]);
    const [totalAchievements, setTotalAchievements] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState(0);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Market status check
    useEffect(() => {
        const checkMarketStatus = () => {
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();
            const isWeekday = day >= 1 && day <= 5;
            const isMarketHours = hour >= 9 && hour < 16;
            setMarketOpen(isWeekday && isMarketHours);
        };
        checkMarketStatus();
        const timer = setInterval(checkMarketStatus, 60000);
        return () => clearInterval(timer);
    }, []);

    // Fetch all data on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchAllDashboardData();
        }
    }, [isAuthenticated]);

    // Fetch chart when symbol changes
    useEffect(() => {
        if (selectedSymbol) {
            fetchChartData(selectedSymbol, selectedTimeframe);
        }
    }, [selectedSymbol, selectedTimeframe]);

    const fetchAllDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchTickerData(),
                fetchPaperTradingData(),
                fetchLeaderboardData(),
                fetchSocialFeed(),
                fetchAchievements()
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTickerData = async () => {
        try {
            // Watchlist ticker - the API already returns real prices!
            const watchlistRes = await api.get('/watchlist');
            
            console.log('Watchlist API response:', watchlistRes.data);
            
            // API returns: { success: true, watchlist: [...], totalStocks, totalCrypto }
            const watchlistData = watchlistRes.data?.watchlist || [];
            
            if (watchlistData && watchlistData.length > 0) {
                // Map the watchlist items - API already provides currentPrice and changePercent
                const tickerItems = watchlistData.slice(0, 10).map(item => ({
                    symbol: item.symbol,
                    price: item.currentPrice || 0,
                    change: item.changePercent || 0
                }));
                
                console.log('Ticker items from API:', tickerItems);
                
                // Filter out items with no price (API couldn't fetch)
                const validItems = tickerItems.filter(item => item.price > 0);
                
                if (validItems.length > 0) {
                    setWatchlistTicker(validItems);
                } else {
                    // Prices are 0 - might be stock API issue, show symbols anyway
                    console.log('No valid prices from watchlist API, showing symbols with 0 price');
                    setWatchlistTicker(tickerItems);
                }
            } else {
                // Empty watchlist
                console.log('Watchlist is empty');
                setWatchlistTicker([]);
            }

            // Market movers ticker
            try {
                const screenRes = await api.get('/screener/stocks?changeFilter=gainers&limit=10');
                
                console.log('Screener API response:', screenRes.data);
                
                let screenData = [];
                if (Array.isArray(screenRes.data)) {
                    screenData = screenRes.data;
                } else if (screenRes.data?.stocks && Array.isArray(screenRes.data.stocks)) {
                    screenData = screenRes.data.stocks;
                } else if (screenRes.data?.data && Array.isArray(screenRes.data.data)) {
                    screenData = screenRes.data.data;
                }
                
                if (screenData && screenData.length > 0) {
                    const moversWithPrices = screenData.slice(0, 10).map(stock => ({
                        symbol: stock.symbol,
                        price: stock.price || stock.currentPrice || stock.latestPrice || stock.regularMarketPrice || 0,
                        change: stock.changePercent || stock.percentChange || stock.change || stock.regularMarketChangePercent || 0
                    }));
                    
                    setMoversTicker(moversWithPrices);
                } else {
                    await fetchDefaultMovers();
                }
            } catch (screenError) {
                console.error('Error fetching movers:', screenError);
                await fetchDefaultMovers();
            }
        } catch (error) {
            console.error('Error fetching ticker data:', error);
            setWatchlistTicker([]);
            await fetchDefaultMovers();
        }
    };

    // Fetch default market movers
    const fetchDefaultMovers = async () => {
        const moverSymbols = ['NVDA', 'AMD', 'SMCI', 'PLTR', 'MSTR'];
        try {
            console.log('Fetching default movers for symbols:', moverSymbols);
            
            const pricePromises = moverSymbols.map(async (symbol) => {
                try {
                    const res = await api.get(`/stocks/${symbol}/quote`);
                    const data = res.data;
                    const quote = data?.quote || data;
                    return {
                        symbol,
                        price: quote?.price || quote?.latestPrice || quote?.regularMarketPrice || quote?.currentPrice || quote?.c || 0,
                        change: quote?.changePercent || quote?.percentChange || quote?.regularMarketChangePercent || quote?.dp || 0
                    };
                } catch {
                    return { symbol, price: 0, change: 0 };
                }
            });
            
            const prices = await Promise.all(pricePromises);
            const validPrices = prices.filter(p => p.price > 0);
            
            console.log('Default movers prices:', validPrices);
            
            if (validPrices.length > 0) {
                setMoversTicker(validPrices);
            } else {
                // Fallback placeholder data
                console.log('Using placeholder movers data');
                setMoversTicker([
                    { symbol: 'NVDA', price: 495.20, change: 5.8 },
                    { symbol: 'AMD', price: 142.70, change: 4.5 },
                    { symbol: 'SMCI', price: 890.50, change: 8.2 },
                    { symbol: 'PLTR', price: 22.40, change: 6.1 },
                ]);
            }
        } catch (error) {
            console.error('Error fetching default movers:', error);
            // Fallback
            setMoversTicker([
                { symbol: 'NVDA', price: 495.20, change: 5.8 },
                { symbol: 'AMD', price: 142.70, change: 4.5 },
            ]);
        }
    };

    const fetchPaperTradingData = async () => {
        try {
            const response = await api.get('/paper-trading/account');
            if (response.data.success) {
                setPaperTradingStats(response.data.account);
            }
        } catch (error) {
            console.error('Error fetching paper trading data:', error);
            setPaperTradingStats({
                portfolioValue: 100000,
                totalProfitLoss: 0,
                totalProfitLossPercent: 0,
                winRate: 0,
                totalTrades: 0,
                winningTrades: 0,
                losingTrades: 0
            });
        }
    };

    const fetchLeaderboardData = async () => {
        try {
            const response = await api.get('/paper-trading/leaderboard?limit=5');
            if (response.data.success) {
                setLeaderboard(response.data.leaderboard || []);
                const userEntry = response.data.leaderboard.find(
                    entry => entry.user?._id === user?._id
                );
                if (userEntry) {
                    setUserRank(userEntry.rank);
                } else {
                    // Try to find user in full leaderboard
                    try {
                        const allLeaders = await api.get('/paper-trading/leaderboard?limit=100');
                        const userInAll = allLeaders.data.leaderboard?.find(
                            entry => entry.user?._id === user?._id
                        );
                        if (userInAll) setUserRank(userInAll.rank);
                    } catch (e) {
                        console.log('Could not fetch full leaderboard');
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLeaderboard([]);
        }
    };

    const fetchSocialFeed = async () => {
        try {
            const response = await api.get('/posts?limit=5');
            if (response.data && Array.isArray(response.data)) {
                setSocialFeed(response.data.slice(0, 4));
            } else if (response.data?.posts) {
                setSocialFeed(response.data.posts.slice(0, 4));
            } else {
                setSocialFeed([]);
            }
        } catch (error) {
            console.error('Error fetching social feed:', error);
            setSocialFeed([]);
        }
    };

    const fetchAchievements = async () => {
        try {
            const response = await api.get('/gamification/achievements');
            if (response.data.success && response.data.achievements) {
                const allAchievements = response.data.achievements;
                const total = response.data.total || allAchievements.length;
                const unlocked = response.data.unlocked || allAchievements.filter(a => a.unlocked).length;
                
                setTotalAchievements(total);
                setUnlockedAchievements(unlocked);

                // Sort: unlocked first, then by rarity
                const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
                const sorted = [...allAchievements].sort((a, b) => {
                    if (a.unlocked && !b.unlocked) return -1;
                    if (!a.unlocked && b.unlocked) return 1;
                    return (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4);
                });
                
                setAchievements(sorted.slice(0, 10));
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
            setAchievements([]);
        }
    };

    const fetchChartData = async (symbol, interval) => {
        setLoadingChart(true);
        setAdvancedChartData([]);
        try {
            const response = await api.get(`/chart/${symbol}/${interval}`);
            if (response.data.success && response.data.data?.length > 0) {
                setAdvancedChartData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoadingChart(false);
        }
    };

    const handleSearchSymbol = () => {
        if (searchSymbol.trim()) {
            setSelectedSymbol(searchSymbol.trim().toUpperCase());
            setSearchSymbol('');
        }
    };

    const handleSymbolChange = (symbol) => {
        if (symbol !== selectedSymbol) {
            setSelectedSymbol(symbol);
            setAdvancedChartData([]);
        }
    };

    // Navigate to user profile
    const goToProfile = (username) => {
        if (username) {
            navigate(`/profile/${username}`);
        }
    };

    // Get user avatar or initials with equipped border
    const getAvatar = (userData) => {
        const avatar = userData?.profile?.avatar || userData?.avatar;
        const name = userData?.profile?.displayName || userData?.name || userData?.username || 'A';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        // Get equipped border from user's vault
        const equippedBorder = userData?.vault?.equippedBorder || 
                               userData?.profile?.equippedBorder || 
                               userData?.equippedBorder ||
                               'border-default';
        const borderStyle = getBorderStyle(equippedBorder);
        
        return { avatar, initials, borderColor: borderStyle.color, borderGlow: borderStyle.glow };
    };

    const getDisplayName = (trader) => {
        if (!trader.user) return 'Anonymous';
        return trader.user.profile?.displayName || trader.user.username || trader.user.name || 'Anonymous';
    };

    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value || 0);
    const formatPercent = (value) => `${value >= 0 ? '+' : ''}${(value || 0).toFixed(2)}%`;
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const achievementProgress = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;

    if (loading) {
        return (
            <PageContainer>
                <div style={{ textAlign: 'center', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <LoadingSpinner><Activity size={64} /></LoadingSpinner>
                    <h2 style={{ color: primary }}>Loading Dashboard...</h2>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentWrapper>
                {/* HEADER */}
                <Header>
                    <HeaderLeft>
                        <StaticLogo src={nexusSignalLogo} alt="Nexus Signal" />
                        <HeaderContent>
                            <Title>Mission Control</Title>
                            <Subtitle>
                                <Sparkles size={18} />
                                Welcome back, {user?.name || 'Trader'}
                            </Subtitle>
                        </HeaderContent>
                    </HeaderLeft>
                    <HeaderRight>
                        <LiveClock>
                            <Clock size={20} />
                            <div>
                                <ClockTime>{formatTime(currentTime)}</ClockTime>
                                <ClockDate>{formatDate(currentTime)}</ClockDate>
                            </div>
                        </LiveClock>
                        <MarketStatus $open={marketOpen}>
                            <StatusDot $open={marketOpen} />
                            <StatusText $open={marketOpen}>
                                {marketOpen ? 'Market Open' : 'Market Closed'}
                            </StatusText>
                        </MarketStatus>
                    </HeaderRight>
                </Header>

                {/* TICKER TAPES */}
                <TickerSection>
                    {/* Watchlist Ticker */}
                    <TickerWrapper>
                        <TickerLabel><Eye size={14} /> Watchlist</TickerLabel>
                        <TickerContainer>
                            <TickerTrack $duration="35s">
                                {watchlistTicker.length > 0 ? (
                                    [...watchlistTicker, ...watchlistTicker].map((stock, index) => (
                                        <TickerItem key={index}>
                                            <TickerLink symbol={stock.symbol} bold>
                                                {stock.symbol}
                                            </TickerLink>
                                            {stock.price > 0 ? (
                                                <>
                                                    <TickerPrice>${stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TickerPrice>
                                                    <TickerChange $positive={stock.change >= 0}>
                                                        {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                                                    </TickerChange>
                                                </>
                                            ) : (
                                                <TickerPrice style={{ color: theme.text?.tertiary }}>Loading...</TickerPrice>
                                            )}
                                        </TickerItem>
                                    ))
                                ) : (
                                    <TickerItem>
                                        <span style={{ color: theme.text?.tertiary }}>Add stocks to your watchlist to see them here</span>
                                    </TickerItem>
                                )}
                            </TickerTrack>
                        </TickerContainer>
                    </TickerWrapper>

                    {/* Market Movers Ticker */}
                    <TickerWrapper>
                        <TickerLabel $variant="movers"><Flame size={14} /> Movers</TickerLabel>
                        <TickerContainer $variant="movers">
                            <TickerTrack $reverse $duration="40s">
                                {moversTicker.length > 0 ? (
                                    [...moversTicker, ...moversTicker].map((stock, index) => (
                                        <TickerItem key={index}>
                                            <TickerLink symbol={stock.symbol} bold>
                                                {stock.symbol}
                                            </TickerLink>
                                            {stock.price > 0 ? (
                                                <>
                                                    <TickerPrice>${stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TickerPrice>
                                                    <TickerChange $positive={stock.change >= 0}>
                                                        {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                        {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                                                    </TickerChange>
                                                </>
                                            ) : (
                                                <TickerPrice style={{ color: theme.text?.tertiary }}>Loading...</TickerPrice>
                                            )}
                                        </TickerItem>
                                    ))
                                ) : (
                                    <TickerItem>
                                        <span style={{ color: theme.text?.tertiary }}>Loading market movers...</span>
                                    </TickerItem>
                                )}
                            </TickerTrack>
                        </TickerContainer>
                    </TickerWrapper>
                </TickerSection>

                {/* CHART SECTION */}
                <ChartSection>
                    <SearchContainer>
                        <SearchInput
                            type="text"
                            placeholder="Search any stock or crypto (e.g., AAPL, BTC-USD)..."
                            value={searchSymbol}
                            onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                            onKeyPress={(e) => { if (e.key === 'Enter') handleSearchSymbol(); }}
                        />
                        <SearchButton onClick={handleSearchSymbol} disabled={!searchSymbol.trim()}>
                            <Eye size={18} /> Load
                        </SearchButton>
                        <SymbolSelector>
                            {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMD', 'BTC-USD', 'ETH-USD', 'SOL-USD'].map(sym => (
                                <SymbolButton key={sym} $active={selectedSymbol === sym} onClick={() => handleSymbolChange(sym)}>
                                    {sym}
                                </SymbolButton>
                            ))}
                        </SymbolSelector>
                    </SearchContainer>

                    {loadingChart ? (
                        <LoadingChartPlaceholder>
                            <LoadingSpinner><Activity size={64} /></LoadingSpinner>
                            <p style={{ color: theme.text?.secondary, marginTop: '1rem' }}>Loading {selectedSymbol} chart...</p>
                        </LoadingChartPlaceholder>
                    ) : (
                        <>
                            <AdvancedChart
                                symbol={selectedSymbol}
                                data={advancedChartData}
                                height="500px"
                                timeframe={selectedTimeframe}
                                onTimeframeChange={setSelectedTimeframe}
                            />
                            <PatternDetector symbol={selectedSymbol} chartData={advancedChartData} />
                        </>
                    )}
                </ChartSection>

                {/* PAPER TRADING HERO */}
                <PaperTradingHero>
                    <PaperTradingTitle>
                        <PaperTradingLabel><DollarSign size={16} /> Portfolio</PaperTradingLabel>
                        <PaperTradingValue>{formatCurrency(paperTradingStats?.portfolioValue)}</PaperTradingValue>
                        <PaperTradingChange $positive={paperTradingStats?.totalProfitLoss >= 0}>
                            {paperTradingStats?.totalProfitLoss >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {formatCurrency(Math.abs(paperTradingStats?.totalProfitLoss || 0))}
                            ({formatPercent(paperTradingStats?.totalProfitLossPercent)})
                        </PaperTradingChange>
                    </PaperTradingTitle>

                    <PaperTradingTitle>
                        <PaperTradingLabel><Percent size={16} /> Win Rate</PaperTradingLabel>
                        <PaperTradingValue $color={paperTradingStats?.winRate >= 50 ? theme.success : theme.warning}>
                            {(paperTradingStats?.winRate || 0).toFixed(1)}%
                        </PaperTradingValue>
                        <PaperTradingChange $positive>{paperTradingStats?.totalTrades || 0} trades</PaperTradingChange>
                    </PaperTradingTitle>

                    <PaperTradingTitle>
                        <PaperTradingLabel><Target size={16} /> W/L Record</PaperTradingLabel>
                        <PaperTradingValue>
                            <span style={{ color: theme.success }}>{paperTradingStats?.winningTrades || 0}</span>
                            <span style={{ color: theme.text?.tertiary }}>/</span>
                            <span style={{ color: theme.error }}>{paperTradingStats?.losingTrades || 0}</span>
                        </PaperTradingValue>
                        <PaperTradingChange $positive>Wins / Losses</PaperTradingChange>
                    </PaperTradingTitle>

                    <RankBadge>
                        <RankNumber $rank={userRank || 99}>
                            {userRank ? (userRank <= 3 ? ['🥇', '🥈', '🥉'][userRank - 1] : `#${userRank}`) : '-'}
                        </RankNumber>
                        <RankLabel>Leaderboard</RankLabel>
                    </RankBadge>

                    <ViewTradingButton onClick={() => navigate('/paper-trading')}>
                        <Rocket size={18} /> Trade Now <ChevronRight size={18} />
                    </ViewTradingButton>
                </PaperTradingHero>

                {/* THREE COLUMN WIDGETS */}
                <WidgetsGrid>
                    {/* LEADERBOARD */}
                    <Widget>
                        <WidgetHeader>
                            <WidgetTitle><Crown size={20} /> Top Traders</WidgetTitle>
                            <Badge $variant="success"><Activity size={12} /> Live</Badge>
                        </WidgetHeader>
                        <WidgetContent>
                            {leaderboard.slice(0, 5).map((trader, index) => {
                                const { avatar, initials, borderColor, borderGlow } = getAvatar(trader.user);
                                const username = trader.user?.username;
                                return (
                                    <LeaderboardItem key={trader.user?._id || index} $isUser={trader.user?._id === user?._id}>
                                        <LeaderboardRank $rank={trader.rank}>{trader.rank}</LeaderboardRank>
                                        <ProfileAvatar
                                            $size="36px"
                                            $fontSize="0.85rem"
                                            $hasImage={!!avatar}
                                            $borderColor={borderColor}
                                            $glow={borderGlow}
                                            onClick={() => goToProfile(username)}
                                        >
                                            {avatar ? <img src={avatar} alt={initials} /> : initials}
                                        </ProfileAvatar>
                                        <LeaderboardInfo>
                                            <LeaderboardName 
                                                onClick={() => goToProfile(username)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {getDisplayName(trader)}{trader.user?._id === user?._id && ' (You)'}
                                            </LeaderboardName>
                                            <LeaderboardStats>{trader.totalTrades} trades • {(trader.winRate || 0).toFixed(0)}% WR</LeaderboardStats>
                                        </LeaderboardInfo>
                                        <LeaderboardReturn $positive={trader.profitLossPercent >= 0}>
                                            {formatPercent(trader.profitLossPercent)}
                                        </LeaderboardReturn>
                                    </LeaderboardItem>
                                );
                            })}
                        </WidgetContent>
                        <ViewAllButton
                            onClick={() => navigate('/leaderboard')}
                        >
                            View Leaderboard <ChevronRight size={16} />
                        </ViewAllButton>
                    </Widget>

                    {/* WHALE ALERTS */}
                    <WhaleAlertWidget />

                    {/* SOCIAL FEED */}
                    <Widget>
                        <WidgetHeader>
                            <WidgetTitle><MessageSquare size={20} /> Social Feed</WidgetTitle>
                            <Badge><Users size={12} /> Community</Badge>
                        </WidgetHeader>
                        <WidgetContent>
                            {socialFeed.length > 0 ? (
                                socialFeed.map((post) => {
                                    const postUser = post.user || post.author;
                                    const { avatar, initials, borderColor, borderGlow } = getAvatar(postUser);
                                    const username = postUser?.username;
                                    return (
                                        <SocialPost key={post._id}>
                                            <PostHeader>
                                                <ProfileAvatar
                                                    $size="34px"
                                                    $fontSize="0.8rem"
                                                    $hasImage={!!avatar}
                                                    $borderColor={borderColor}
                                                    $glow={borderGlow}
                                                    onClick={() => goToProfile(username)}
                                                >
                                                    {avatar ? <img src={avatar} alt={initials} /> : initials}
                                                </ProfileAvatar>
                                                <PostUserInfo>
                                                    <PostUsername onClick={() => goToProfile(username)}>
                                                        {postUser?.profile?.displayName || postUser?.name || postUser?.username || 'Anonymous'}
                                                    </PostUsername>
                                                    <PostTime>{formatTimeAgo(post.createdAt)}</PostTime>
                                                </PostUserInfo>
                                            </PostHeader>
                                            <PostContent>
                                                <TickerText text={post.content || post.text || ''} />
                                            </PostContent>
                                            <PostActions>
                                                <PostAction><ThumbsUp size={14} /> {post.likes?.length || 0}</PostAction>
                                                <PostAction><MessageSquare size={14} /> {post.comments?.length || 0}</PostAction>
                                                <PostAction><Share2 size={14} /></PostAction>
                                            </PostActions>
                                        </SocialPost>
                                    );
                                })
                            ) : (
                                <EmptyState>
                                    <MessageSquare size={40} />
                                    <p>No posts yet. Be the first!</p>
                                </EmptyState>
                            )}
                        </WidgetContent>
                        <ViewAllButton
                            onClick={() => navigate('/social')}
                        >
                            {socialFeed.length > 0 ? 'View All Posts' : 'Create Post'} <ChevronRight size={16} />
                        </ViewAllButton>
                    </Widget>
                </WidgetsGrid>

                {/* ACHIEVEMENTS */}
                <AchievementsSection>
                    <AchievementsHeader>
                        <AchievementsTitle><Award size={20} /> Your Achievements</AchievementsTitle>
                        <AchievementsProgress>
                            <ProgressBar><ProgressFill $progress={achievementProgress} /></ProgressBar>
                            <ProgressText>{unlockedAchievements}/{totalAchievements} Unlocked</ProgressText>
                        </AchievementsProgress>
                    </AchievementsHeader>

                    {achievements.length > 0 ? (
                        <>
                            <AchievementsGrid>
                                {achievements.map((achievement) => (
                                    <AchievementBadge
                                        key={achievement.id}
                                        $unlocked={achievement.unlocked}
                                        $rarity={achievement.rarity}
                                        onClick={() => navigate('/achievements')}
                                    >
                                        {!achievement.unlocked && <BadgeLock><Lock size={12} /></BadgeLock>}
                                        {achievement.unlocked && achievement.rarity && <RarityDot $rarity={achievement.rarity} />}
                                        <BadgeIcon $unlocked={achievement.unlocked}>{achievement.icon}</BadgeIcon>
                                        <BadgeLabel $unlocked={achievement.unlocked}>{achievement.name}</BadgeLabel>
                                    </AchievementBadge>
                                ))}
                            </AchievementsGrid>
                            <ViewAllButton
                                onClick={() => navigate('/achievements')}
                                style={{ marginTop: '1rem' }}
                            >
                                View All {totalAchievements} Achievements <ChevronRight size={16} />
                            </ViewAllButton>
                        </>
                    ) : (
                        <EmptyState>
                            <Award size={40} />
                            <p>Start trading to unlock achievements!</p>
                        </EmptyState>
                    )}
                </AchievementsSection>
            </ContentWrapper>
        </PageContainer>
    );
};

export default DashboardPage;