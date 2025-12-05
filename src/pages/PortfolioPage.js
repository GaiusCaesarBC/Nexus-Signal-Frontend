// client/src/pages/PortfolioPage.js - REDESIGNED PORTFOLIO WITH STUNNING UI

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import WalletConnectButton from '../components/WalletConnectButton';
import WalletAnalytics from '../components/WalletAnalytics';
import BrokerageConnect from '../components/BrokerageConnect';
import api from '../api/axios';
import {
    TrendingUp, TrendingDown, PieChart, BarChart3,
    Activity, Brain, Target, Zap,
    ArrowUpRight, ArrowDownRight, Eye, Flame, Star,
    Download, RefreshCw, Search, AlertTriangle,
    CheckCircle, Shield, Lightbulb, Trophy,
    Wallet, Link2, Building2, Coins, DollarSign,
    Clock, Sparkles, ChevronRight, ExternalLink,
    History, ArrowRight, ShoppingCart, Tag
} from 'lucide-react';
import {
    PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 239, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 239, 0.6); }
`;

const countUp = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ============ BACKGROUND ============
const BackgroundOrbs = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.25;
    animation: ${float} ${props => props.$duration || '20s'} ease-in-out infinite;

    &:nth-child(1) {
        width: 500px;
        height: 500px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.primary || '#00adef'}66 0%, transparent 70%)`};
        top: 5%;
        left: -150px;
    }

    &:nth-child(2) {
        width: 400px;
        height: 400px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.success || '#10b981'}66 0%, transparent 70%)`};
        top: 40%;
        right: -100px;
        animation-delay: -5s;
    }

    &:nth-child(3) {
        width: 350px;
        height: 350px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.accent || '#8b5cf6'}4D 0%, transparent 70%)`};
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

// ============ LAYOUT ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: transparent;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    padding: 6rem 2rem 2rem;
    position: relative;
    z-index: 1;
`;

const ContentWrapper = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

// ============ HEADER ============
const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3rem;
    background: ${props => props.theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
    margin-bottom: 0.5rem;
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
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
`;

// ============ TABS ============
const TabsContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: ${props => props.theme.bg?.tertiary || 'rgba(15, 23, 42, 0.6)'};
    padding: 0.5rem;
    border-radius: 16px;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    animation: ${fadeIn} 0.6s ease-out 0.2s both;
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
`;

const Tab = styled.button`
    padding: 0.85rem 1.75rem;
    background: ${props => props.$active
        ? props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`
        : 'transparent'};
    border: none;
    border-radius: 12px;
    color: ${props => props.$active ? 'white' : props.theme.text?.secondary || '#94a3b8'};
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    ${props => props.$active && css`
        box-shadow: 0 8px 24px ${props.theme.brand?.primary || '#00adef'}4D;
    `}

    &:hover {
        background: ${props => props.$active
            ? props.theme.brand?.gradient
            : `${props.theme.brand?.primary || '#00adef'}1A`};
        color: ${props => props.$active ? 'white' : props.theme.text?.primary};
        transform: translateY(-2px);
    }
`;

// ============ WALLET SECTION ============
const WalletSection = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}1A 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}1A 100%);
    border: 2px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 24px;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out 0.3s both;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

const WalletInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const WalletIconWrapper = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: ${props => props.theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px ${props => props.theme.brand?.primary || '#00adef'}4D;
`;

const WalletText = styled.div``;

const WalletTitle = styled.h2`
    font-size: 1.25rem;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-weight: 800;
    margin: 0 0 0.25rem 0;
`;

const WalletStatus = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => props.$linked ? props.theme.success || '#10b981' : props.theme.warning || '#fbbf24'};
    font-size: 0.9rem;
    font-weight: 600;
`;

// ============ STATS HERO ============
const StatsHero = styled.div`
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
    animation: ${slideUp} 0.8s ease-out 0.4s both;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const MainStatCard = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}26 0%, ${props => props.theme.success || '#10b981'}26 100%);
    border: 2px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 24px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.theme.brand?.gradient || `linear-gradient(90deg, ${props.theme.brand?.primary || '#00adef'}, ${props.theme.success || '#10b981'})`};
    }

    &::after {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, ${props => props.theme.brand?.primary || '#00adef'}1A 0%, transparent 70%);
        pointer-events: none;
    }
`;

const MainStatLabel = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MainStatValue = styled.div`
    font-size: 3.5rem;
    font-weight: 900;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 0.75rem;
    animation: ${countUp} 0.6s ease-out;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const MainStatChange = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    background: ${props => props.$positive
        ? `${props.theme.success || '#10b981'}26`
        : `${props.theme.error || '#ef4444'}26`};
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 20px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
        border-color: ${props => props.theme.brand?.primary || '#00adef'}66;
        transform: translateY(-4px);
        box-shadow: 0 12px 40px ${props => props.theme.brand?.primary || '#00adef'}26;
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: ${props => props.$bg || `${props.theme.brand?.primary || '#00adef'}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme.brand?.primary || '#00adef'};
    margin-bottom: 1rem;
`;

const StatLabel = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme.text?.primary || '#e0e6ed'};
`;

// ============ AI SECTION ============
const AISection = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.accent || '#8b5cf6'}1A 0%, ${props => props.theme.info || '#3b82f6'}1A 100%);
    border: 2px solid ${props => props.theme.brand?.accent || '#8b5cf6'}4D;
    border-radius: 24px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: ${fadeInScale} 0.6s ease-out;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
`;

const AISectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const AITitle = styled.h2`
    font-size: 1.5rem;
    color: ${props => props.theme.brand?.accent || '#a78bfa'};
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 800;
    margin: 0;
`;

const AIBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.theme.success || '#10b981'}33;
    border: 1px solid ${props => props.theme.success || '#10b981'}66;
    border-radius: 20px;
    color: ${props => props.theme.success || '#10b981'};
    font-size: 0.85rem;
    font-weight: 700;
`;

const AIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.25rem;
`;

const InsightCard = styled.div`
    background: ${props => props.theme.brand?.accent || '#8b5cf6'}14;
    border: 1px solid ${props => props.theme.brand?.accent || '#8b5cf6'}33;
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.theme.brand?.accent || '#8b5cf6'}1F;
        border-color: ${props => props.theme.brand?.accent || '#8b5cf6'}66;
        transform: translateY(-4px);
    }
`;

const InsightHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const InsightIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${props => props.$bg || `${props.theme.brand?.accent || '#8b5cf6'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme.brand?.accent || '#a78bfa'};
`;

const InsightTitle = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
`;

const InsightValue = styled.div`
    font-size: 1.75rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme.brand?.accent || '#a78bfa'};
    margin-bottom: 0.25rem;
`;

const InsightDescription = styled.div`
    font-size: 0.85rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    line-height: 1.5;
`;

const RecommendationsList = styled.div`
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${props => props.theme.brand?.accent || '#8b5cf6'}33;
`;

const RecommendationsTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme.brand?.accent || '#a78bfa'};
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RecommendationItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    background: ${props => props.theme.brand?.accent || '#8b5cf6'}0D;
    border-radius: 12px;
    margin-bottom: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.accent || '#8b5cf6'}1A;
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const RecIcon = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${props => {
        if (props.$type === 'success') return `${props.theme.success || '#10b981'}33`;
        if (props.$type === 'warning') return `${props.theme.warning || '#fbbf24'}33`;
        if (props.$type === 'danger') return `${props.theme.error || '#ef4444'}33`;
        return `${props.theme.brand?.accent || '#8b5cf6'}33`;
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => {
        if (props.$type === 'success') return props.theme.success || '#10b981';
        if (props.$type === 'warning') return props.theme.warning || '#fbbf24';
        if (props.$type === 'danger') return props.theme.error || '#ef4444';
        return props.theme.brand?.accent || '#a78bfa';
    }};
    flex-shrink: 0;
`;

const RecText = styled.div`
    font-size: 0.9rem;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    line-height: 1.5;
`;

// ============ MAIN CONTENT ============
const MainGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

// ============ HOLDINGS ============
const HoldingsSection = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 24px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    animation: ${slideUp} 0.6s ease-out;
`;

const HoldingsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const HoldingsTitle = styled.h2`
    font-size: 1.3rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    margin: 0;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.25rem;
    background: ${props => props.$primary
        ? props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`
        : `${props.theme.brand?.primary || '#00adef'}15`};
    border: 1px solid ${props => props.$primary ? 'transparent' : `${props.theme.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    color: ${props => props.$primary ? 'white' : props.theme.brand?.primary || '#00adef'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$primary
            ? `0 8px 24px ${props.theme.brand?.primary || '#00adef'}66`
            : `0 8px 24px ${props.theme.brand?.primary || '#00adef'}33`};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        ${props => props.$spinning && css`animation: ${rotate} 1s linear infinite;`}
    }
`;

const SearchWrapper = styled.div`
    position: relative;
    width: 280px;

    @media (max-width: 600px) {
        width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.7rem 1rem 0.7rem 2.75rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 12px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => props.theme.brand?.primary || '#00adef'}1A;
        box-shadow: 0 0 0 3px ${props => props.theme.brand?.primary || '#00adef'}26;
    }

    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const SearchIconStyled = styled(Search)`
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    width: 18px;
    height: 18px;
`;

const HoldingsTable = styled.div`
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    text-align: left;
    padding: 1rem 0.75rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${props => props.theme.brand?.primary || '#00adef'}1A;
`;

const Tr = styled.tr`
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    }
`;

const Td = styled.td`
    padding: 1.1rem 0.75rem;
    border-bottom: 1px solid ${props => props.theme.brand?.primary || '#00adef'}0D;
    vertical-align: middle;
`;

const SymbolCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.85rem;
`;

const SymbolIcon = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}33 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}33 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const SymbolInfo = styled.div``;

const SymbolName = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
`;

const SymbolType = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const PriceCell = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ChangeCell = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    background: ${props => props.$positive
        ? `${props.theme.success || '#10b981'}26`
        : `${props.theme.error || '#ef4444'}26`};
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
    font-size: 0.9rem;
`;

const ValueCell = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 1.05rem;
`;

const SourceBadge = styled.span`
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    background: ${props => props.theme.success || '#10b981'}26;
    color: ${props => props.theme.success || '#10b981'};
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
`;

// ============ SIDEBAR ============
const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const ChartCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 20px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
    animation: ${fadeIn} 0.6s ease-out;
`;

const ChartTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    margin: 0 0 1.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const ChartLegend = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1rem;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const LegendDot = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: ${props => props.$color};
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}33 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}33 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${props => props.theme.brand?.primary || '#00adef'}4D;
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme.brand?.primary || '#00adef'};
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
    font-weight: 800;
`;

const EmptyText = styled.p`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    margin-bottom: 2rem;
    font-size: 1.1rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
`;

// ============ LOADING ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1.5rem;
`;

const LoadingSpinner = styled(Activity)`
    animation: ${rotate} 1.5s linear infinite;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const LoadingText = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
    font-weight: 600;
`;

// ============ CLICKABLE SYMBOL ============
const SymbolLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.85rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;

    &:hover {
        transform: translateX(4px);

        ${props => props.$symbolIcon} {
            box-shadow: 0 4px 12px ${props => props.theme.brand?.primary || '#00adef'}4D;
        }
    }
`;

const SymbolIconClickable = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}33 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}33 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    transition: all 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px ${props => props.theme.brand?.primary || '#00adef'}4D;
        transform: scale(1.05);
    }
`;

// ============ TRADE HISTORY ============
const TradeHistorySection = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 24px;
    padding: 1.5rem;
    margin-top: 2rem;
    backdrop-filter: blur(10px);
    animation: ${slideUp} 0.6s ease-out 0.2s both;
`;

const TradeHistoryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const TradeHistoryTitle = styled.h2`
    font-size: 1.3rem;
    color: ${props => props.theme.warning || '#f59e0b'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    margin: 0;
`;

const TradeCount = styled.span`
    font-size: 0.85rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    padding: 0.35rem 0.75rem;
    background: ${props => props.theme.warning || '#f59e0b'}1A;
    border-radius: 20px;
`;

const TradesTable = styled.div`
    overflow-x: auto;
`;

const TradeRow = styled.tr`
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    }
`;

const TradeType = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    background: ${props => props.$type === 'buy'
        ? `${props.theme.success || '#10b981'}26`
        : `${props.theme.error || '#ef4444'}26`};
    color: ${props => props.$type === 'buy'
        ? props.theme.success || '#10b981'
        : props.theme.error || '#ef4444'};
`;

const TradePair = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const TradeDate = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

const TradeAmount = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const TradeCost = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const TradeFee = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

const NoTradesMessage = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};

    svg {
        margin-bottom: 1rem;
        opacity: 0.5;
    }
`;

// ============ AI ANALYSIS FUNCTION ============
const analyzePortfolio = (holdings, stats) => {
    if (!holdings || holdings.length === 0) return null;

    const analysis = {
        diversificationScore: 0,
        riskLevel: 'Moderate',
        sectorConcentration: 0,
        topPerformer: null,
        worstPerformer: null,
        recommendations: [],
        insights: []
    };

    const holdingCount = holdings.length;
    let diversificationBase = Math.min(holdingCount * 10, 50);

    const totalValue = stats?.totalValue || holdings.reduce((sum, h) => sum + (h.value || 0), 0);
    const allocations = holdings.map(h => ((h.value || 0) / totalValue) * 100);

    const maxAllocation = Math.max(...allocations);
    if (maxAllocation > 50) {
        analysis.sectorConcentration = maxAllocation;
        diversificationBase -= 20;
        analysis.recommendations.push({
            type: 'warning',
            text: `High concentration risk: One position is ${maxAllocation.toFixed(0)}% of your portfolio. Consider rebalancing.`
        });
    } else if (maxAllocation > 30) {
        analysis.sectorConcentration = maxAllocation;
        diversificationBase -= 10;
        analysis.recommendations.push({
            type: 'warning',
            text: `Moderate concentration: Your largest position is ${maxAllocation.toFixed(0)}% of portfolio.`
        });
    } else {
        diversificationBase += 20;
        analysis.recommendations.push({
            type: 'success',
            text: 'Good diversification! No single position dominates your portfolio.'
        });
    }

    const avgAllocation = 100 / holdingCount;
    const allocationVariance = allocations.reduce((sum, a) => sum + Math.pow(a - avgAllocation, 2), 0) / holdingCount;
    if (allocationVariance < 100) diversificationBase += 15;

    analysis.diversificationScore = Math.min(Math.max(diversificationBase, 0), 100);

    if (analysis.diversificationScore >= 70) analysis.riskLevel = 'Low';
    else if (analysis.diversificationScore >= 40) analysis.riskLevel = 'Moderate';
    else analysis.riskLevel = 'High';

    const performanceData = holdings.map(h => {
        const change = h.change24h || 0;
        return { symbol: h.symbol, gainPercent: change };
    }).sort((a, b) => b.gainPercent - a.gainPercent);

    if (performanceData.length > 0) {
        analysis.topPerformer = performanceData[0];
        analysis.worstPerformer = performanceData[performanceData.length - 1];
    }

    if (holdingCount < 5) {
        analysis.recommendations.push({
            type: 'info',
            text: `Consider adding more positions. You have ${holdingCount} holding${holdingCount > 1 ? 's' : ''} - aim for 8-15 for better diversification.`
        });
    }

    if (analysis.topPerformer && analysis.topPerformer.gainPercent > 10) {
        analysis.recommendations.push({
            type: 'success',
            text: `${analysis.topPerformer.symbol} is up ${analysis.topPerformer.gainPercent.toFixed(1)}% today! Strong performance.`
        });
    }

    if (analysis.worstPerformer && analysis.worstPerformer.gainPercent < -5) {
        analysis.recommendations.push({
            type: 'danger',
            text: `${analysis.worstPerformer.symbol} is down ${Math.abs(analysis.worstPerformer.gainPercent).toFixed(1)}% today. Monitor closely.`
        });
    }

    if (analysis.recommendations.length < 3) {
        analysis.recommendations.push({
            type: 'info',
            text: 'Set price alerts for your holdings to stay informed of significant moves.'
        });
    }

    return analysis;
};

// ============ HELPER FUNCTIONS ============
// Get the correct route for a symbol
const getAssetRoute = (symbol, type) => {
    const cryptoSymbols = ['BTC', 'ETH', 'LTC', 'XRP', 'DOGE', 'SOL', 'ADA', 'DOT', 'LINK', 'AVAX', 'ATOM', 'UNI', 'AAVE', 'XLM', 'XMR', 'ETC', 'ZEC', 'MATIC'];
    const isCrypto = type === 'crypto' || cryptoSymbols.includes(symbol?.toUpperCase());
    return isCrypto ? `/crypto/${symbol}` : `/stocks/${symbol}`;
};

// Parse Kraken pair to get base asset
const parseKrakenPair = (pair) => {
    // Kraken pairs like XBTUSD, ETHUSD, XXBTZUSD
    const usdPairs = pair.replace('ZUSD', 'USD').replace('USD', '');
    // Handle XBT -> BTC
    if (usdPairs.includes('XBT')) return 'BTC';
    // Remove X prefix for crypto
    if (usdPairs.startsWith('X') && usdPairs.length > 3) return usdPairs.slice(1);
    return usdPairs;
};

// ============ COMPONENT ============
const PortfolioPage = () => {
    const { api: authApi } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();
    const { linkedWallet } = useWallet();
    const navigate = useNavigate();

    const [holdings, setHoldings] = useState([]);
    const [brokerageHoldings, setBrokerageHoldings] = useState([]);
    const [connections, setConnections] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [loadingTrades, setLoadingTrades] = useState(false);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('holdings');

    const COLORS = [
        theme.brand?.primary || '#00adef',
        theme.success || '#10b981',
        theme.warning || '#f59e0b',
        theme.error || '#ef4444',
        theme.brand?.accent || '#8b5cf6',
        theme.info || '#ec4899',
        theme.brand?.secondary || '#06b6d4',
        '#84cc16'
    ];

    // Fetch brokerage connections and their holdings
    const fetchBrokerageData = useCallback(async () => {
        try {
            const response = await api.get('/brokerage/connections');
            if (response.data.success) {
                const conns = response.data.connections || [];
                setConnections(conns);
                const allHoldings = [];
                let totalBrokerageValue = 0;

                for (const conn of conns) {
                    if (conn.status === 'active' && conn.cachedPortfolio?.holdings) {
                        for (const holding of conn.cachedPortfolio.holdings) {
                            allHoldings.push({
                                ...holding,
                                source: conn.type,
                                sourceName: conn.name,
                                connectionId: conn.id
                            });
                        }
                        totalBrokerageValue += conn.cachedPortfolio?.totalValue || 0;
                    }
                }

                setBrokerageHoldings(allHoldings);
                return { holdings: allHoldings, totalValue: totalBrokerageValue, connections: conns };
            }
        } catch (error) {
            console.error('Error fetching brokerage data:', error);
        }
        return { holdings: [], totalValue: 0, connections: [] };
    }, []);

    // Fetch trade history from all brokerage connections
    const fetchTradeHistory = useCallback(async (conns) => {
        if (!conns || conns.length === 0) return;

        setLoadingTrades(true);
        const allTrades = [];

        try {
            for (const conn of conns) {
                if (conn.status !== 'active') continue;

                try {
                    if (conn.type === 'kraken') {
                        const response = await api.get(`/brokerage/kraken/trades/${conn.id}`);
                        if (response.data.success && response.data.trades) {
                            const trades = response.data.trades.map(trade => ({
                                ...trade,
                                source: 'kraken',
                                sourceName: conn.name,
                                connectionId: conn.id
                            }));
                            allTrades.push(...trades);
                        }
                    }
                    // Add Plaid transactions here when implemented
                } catch (err) {
                    console.error(`Error fetching trades from ${conn.name}:`, err);
                }
            }

            // Sort by date descending
            allTrades.sort((a, b) => new Date(b.time) - new Date(a.time));
            setTradeHistory(allTrades.slice(0, 50)); // Keep last 50 trades
        } catch (error) {
            console.error('Error fetching trade history:', error);
        } finally {
            setLoadingTrades(false);
        }
    }, []);

    // Fetch portfolio data
    const fetchPortfolio = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch brokerage data (real portfolio)
            const brokerageData = await fetchBrokerageData();

            // For now, only show brokerage holdings (real portfolio)
            // Wallet holdings would come from on-chain data, not paper trading
            const combinedHoldings = [...brokerageData.holdings];

            setHoldings(combinedHoldings);

            // Calculate stats from brokerage data only (not paper trading)
            const totalValue = brokerageData.totalValue;
            // We don't track cost basis for real portfolios yet
            const totalCost = 0;
            const totalGain = 0;
            const totalGainPercent = 0;

            if (combinedHoldings.length > 0) {
                setStats({
                    totalValue,
                    totalCost,
                    totalGain,
                    totalGainPercent,
                    holdingsCount: combinedHoldings.length
                });
            } else {
                setStats(null);
            }

            // Fetch trade history from connections
            if (brokerageData.connections && brokerageData.connections.length > 0) {
                fetchTradeHistory(brokerageData.connections);
            }
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    }, [fetchBrokerageData, fetchTradeHistory]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPortfolio();
        setRefreshing(false);
        toast.success('Portfolio refreshed!');
    };

    const handleExportCSV = () => {
        const csv = [
            ['Symbol', 'Name', 'Quantity', 'Price', 'Value', 'Source'].join(','),
            ...holdings.map(h => [
                h.symbol,
                h.name || h.symbol,
                h.quantity || h.shares || 0,
                h.price || 0,
                h.value || 0,
                h.sourceName || 'Unknown'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Portfolio exported!');
    };

    const filteredHoldings = useMemo(() => {
        if (!searchQuery) return holdings;
        return holdings.filter(h =>
            h.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [holdings, searchQuery]);

    const aiAnalysis = useMemo(() => analyzePortfolio(holdings, stats), [holdings, stats]);

    const pieData = useMemo(() => {
        return holdings.map(h => ({
            name: h.symbol,
            value: h.value || 0
        })).filter(d => d.value > 0).slice(0, 8);
    }, [holdings]);

    const performanceData = useMemo(() => {
        return holdings.map(h => ({
            symbol: h.symbol,
            gain: h.change24h || 0
        })).sort((a, b) => b.gain - a.gain).slice(0, 6);
    }, [holdings]);

    if (loading) {
        return (
            <PageContainer theme={theme}>
                <BackgroundOrbs>
                    <Orb $duration="25s" />
                    <Orb $duration="30s" />
                    <Orb $duration="20s" />
                </BackgroundOrbs>
                <ContentWrapper>
                    <LoadingContainer>
                        <LoadingSpinner size={64} theme={theme} />
                        <LoadingText theme={theme}>Loading your portfolio...</LoadingText>
                    </LoadingContainer>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer theme={theme}>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <ContentWrapper>
                {/* Header */}
                <Header>
                    <Title theme={theme}>
                        <TitleIcon>
                            <Coins size={48} color={theme.brand?.primary || '#00adef'} />
                        </TitleIcon>
                        My Portfolio
                    </Title>
                    <Subtitle theme={theme}>
                        {holdings.length > 0
                            ? `${holdings.length} holdings • AI-powered insights`
                            : 'Track your investments across wallets and brokerages'}
                    </Subtitle>
                </Header>

                {/* Tabs */}
                <TabsContainer theme={theme}>
                    <Tab theme={theme} $active={activeTab === 'holdings'} onClick={() => setActiveTab('holdings')}>
                        <Wallet size={18} />
                        Holdings
                    </Tab>
                    {linkedWallet && (
                        <Tab theme={theme} $active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
                            <Activity size={18} />
                            Analytics
                        </Tab>
                    )}
                    <Tab theme={theme} $active={activeTab === 'brokerages'} onClick={() => setActiveTab('brokerages')}>
                        <Building2 size={18} />
                        Brokerages
                    </Tab>
                </TabsContainer>

                {/* Wallet Section */}
                <WalletSection theme={theme}>
                    <WalletInfo>
                        <WalletIconWrapper theme={theme}>
                            <Wallet size={28} color="white" />
                        </WalletIconWrapper>
                        <WalletText>
                            <WalletTitle theme={theme}>Wallet Connection</WalletTitle>
                            <WalletStatus theme={theme} $linked={!!linkedWallet}>
                                {linkedWallet ? (
                                    <>
                                        <CheckCircle size={16} />
                                        Wallet Linked
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} />
                                        No Wallet Linked
                                    </>
                                )}
                            </WalletStatus>
                        </WalletText>
                    </WalletInfo>
                    <WalletConnectButton showInfo={true} />
                </WalletSection>

                {/* Analytics Tab */}
                {activeTab === 'analytics' && linkedWallet && <WalletAnalytics />}

                {/* Brokerages Tab */}
                {activeTab === 'brokerages' && <BrokerageConnect />}

                {/* Holdings Tab */}
                {activeTab === 'holdings' && (
                    <>
                        {holdings.length === 0 ? (
                            <EmptyState>
                                <EmptyIcon theme={theme}>
                                    <Wallet size={52} color={theme.brand?.primary || '#00adef'} />
                                </EmptyIcon>
                                <EmptyTitle theme={theme}>
                                    {linkedWallet ? 'Ready to Sync' : 'Connect Your Wallet'}
                                </EmptyTitle>
                                <EmptyText theme={theme}>
                                    {linkedWallet
                                        ? 'Click the Sync button above to import your on-chain holdings'
                                        : 'Connect your wallet or link a brokerage account to start tracking your portfolio'}
                                </EmptyText>
                            </EmptyState>
                        ) : (
                            <>
                                {/* Stats Hero */}
                                {stats && (
                                    <StatsHero>
                                        <MainStatCard theme={theme}>
                                            <MainStatLabel theme={theme}>
                                                <DollarSign size={18} />
                                                Total Portfolio Value
                                            </MainStatLabel>
                                            <MainStatValue theme={theme}>
                                                ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </MainStatValue>
                                            <MainStatChange theme={theme} $positive={stats.totalGain >= 0}>
                                                {stats.totalGain >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                                {stats.totalGain >= 0 ? '+' : ''}${Math.abs(stats.totalGain).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                ({stats.totalGain >= 0 ? '+' : ''}{stats.totalGainPercent.toFixed(2)}%)
                                            </MainStatChange>
                                        </MainStatCard>

                                        <StatCard theme={theme}>
                                            <StatIcon theme={theme} $bg={`${theme.success || '#10b981'}26`} $color={theme.success || '#10b981'}>
                                                <TrendingUp size={24} />
                                            </StatIcon>
                                            <StatLabel theme={theme}>Total Gain/Loss</StatLabel>
                                            <StatValue theme={theme} $color={stats.totalGain >= 0 ? theme.success || '#10b981' : theme.error || '#ef4444'}>
                                                {stats.totalGain >= 0 ? '+' : ''}{stats.totalGainPercent.toFixed(2)}%
                                            </StatValue>
                                        </StatCard>

                                        <StatCard theme={theme}>
                                            <StatIcon theme={theme} $bg={`${theme.brand?.accent || '#8b5cf6'}26`} $color={theme.brand?.accent || '#a78bfa'}>
                                                <Target size={24} />
                                            </StatIcon>
                                            <StatLabel theme={theme}>Cost Basis</StatLabel>
                                            <StatValue theme={theme}>
                                                ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </StatValue>
                                        </StatCard>

                                        <StatCard theme={theme}>
                                            <StatIcon theme={theme} $bg={`${theme.warning || '#fbbf24'}26`} $color={theme.warning || '#fbbf24'}>
                                                <BarChart3 size={24} />
                                            </StatIcon>
                                            <StatLabel theme={theme}>Holdings</StatLabel>
                                            <StatValue theme={theme}>{stats.holdingsCount}</StatValue>
                                        </StatCard>
                                    </StatsHero>
                                )}

                                {/* AI Analysis */}
                                {aiAnalysis && (
                                    <AISection theme={theme}>
                                        <AISectionHeader>
                                            <AITitle theme={theme}>
                                                <Brain size={28} />
                                                AI Portfolio Analysis
                                            </AITitle>
                                            <AIBadge theme={theme}>
                                                <Sparkles size={16} />
                                                Powered by Nexus AI
                                            </AIBadge>
                                        </AISectionHeader>

                                        <AIGrid>
                                            <InsightCard theme={theme}>
                                                <InsightHeader>
                                                    <InsightIcon theme={theme} $bg={`${theme.success || '#10b981'}33`} $color={theme.success || '#10b981'}>
                                                        <Shield size={20} />
                                                    </InsightIcon>
                                                    <InsightTitle theme={theme}>Diversification Score</InsightTitle>
                                                </InsightHeader>
                                                <InsightValue theme={theme} $color={
                                                    aiAnalysis.diversificationScore >= 70 ? theme.success || '#10b981' :
                                                    aiAnalysis.diversificationScore >= 40 ? theme.warning || '#fbbf24' : theme.error || '#ef4444'
                                                }>
                                                    {aiAnalysis.diversificationScore}/100
                                                </InsightValue>
                                                <InsightDescription theme={theme}>
                                                    {aiAnalysis.diversificationScore >= 70 ? 'Well diversified portfolio' :
                                                     aiAnalysis.diversificationScore >= 40 ? 'Moderate diversification' :
                                                     'Consider adding more positions'}
                                                </InsightDescription>
                                            </InsightCard>

                                            <InsightCard theme={theme}>
                                                <InsightHeader>
                                                    <InsightIcon theme={theme} $bg={
                                                        aiAnalysis.riskLevel === 'Low' ? `${theme.success || '#10b981'}33` :
                                                        aiAnalysis.riskLevel === 'Moderate' ? `${theme.warning || '#fbbf24'}33` :
                                                        `${theme.error || '#ef4444'}33`
                                                    } $color={
                                                        aiAnalysis.riskLevel === 'Low' ? theme.success || '#10b981' :
                                                        aiAnalysis.riskLevel === 'Moderate' ? theme.warning || '#fbbf24' : theme.error || '#ef4444'
                                                    }>
                                                        <AlertTriangle size={20} />
                                                    </InsightIcon>
                                                    <InsightTitle theme={theme}>Risk Level</InsightTitle>
                                                </InsightHeader>
                                                <InsightValue theme={theme} $color={
                                                    aiAnalysis.riskLevel === 'Low' ? theme.success || '#10b981' :
                                                    aiAnalysis.riskLevel === 'Moderate' ? theme.warning || '#fbbf24' : theme.error || '#ef4444'
                                                }>
                                                    {aiAnalysis.riskLevel}
                                                </InsightValue>
                                                <InsightDescription theme={theme}>
                                                    Based on concentration and diversification
                                                </InsightDescription>
                                            </InsightCard>

                                            {aiAnalysis.topPerformer && (
                                                <InsightCard theme={theme}>
                                                    <InsightHeader>
                                                        <InsightIcon theme={theme} $bg={`${theme.success || '#10b981'}33`} $color={theme.success || '#10b981'}>
                                                            <Star size={20} />
                                                        </InsightIcon>
                                                        <InsightTitle theme={theme}>Top Performer</InsightTitle>
                                                    </InsightHeader>
                                                    <InsightValue theme={theme} $color={theme.success || '#10b981'}>
                                                        {aiAnalysis.topPerformer.symbol}
                                                    </InsightValue>
                                                    <InsightDescription theme={theme}>
                                                        {aiAnalysis.topPerformer.gainPercent >= 0 ? 'Up' : 'Down'} {Math.abs(aiAnalysis.topPerformer.gainPercent).toFixed(1)}% today
                                                    </InsightDescription>
                                                </InsightCard>
                                            )}

                                            {aiAnalysis.worstPerformer && aiAnalysis.worstPerformer.symbol !== aiAnalysis.topPerformer?.symbol && (
                                                <InsightCard theme={theme}>
                                                    <InsightHeader>
                                                        <InsightIcon theme={theme} $bg={`${theme.error || '#ef4444'}33`} $color={theme.error || '#ef4444'}>
                                                            <Flame size={20} />
                                                        </InsightIcon>
                                                        <InsightTitle theme={theme}>Needs Attention</InsightTitle>
                                                    </InsightHeader>
                                                    <InsightValue theme={theme} $color={theme.error || '#ef4444'}>
                                                        {aiAnalysis.worstPerformer.symbol}
                                                    </InsightValue>
                                                    <InsightDescription theme={theme}>
                                                        {aiAnalysis.worstPerformer.gainPercent >= 0 ? 'Up' : 'Down'} {Math.abs(aiAnalysis.worstPerformer.gainPercent).toFixed(1)}% today
                                                    </InsightDescription>
                                                </InsightCard>
                                            )}
                                        </AIGrid>

                                        {aiAnalysis.recommendations.length > 0 && (
                                            <RecommendationsList theme={theme}>
                                                <RecommendationsTitle theme={theme}>
                                                    <Lightbulb size={20} />
                                                    AI Recommendations
                                                </RecommendationsTitle>
                                                {aiAnalysis.recommendations.map((rec, i) => (
                                                    <RecommendationItem theme={theme} key={i}>
                                                        <RecIcon theme={theme} $type={rec.type}>
                                                            {rec.type === 'success' && <CheckCircle size={14} />}
                                                            {rec.type === 'warning' && <AlertTriangle size={14} />}
                                                            {rec.type === 'danger' && <TrendingDown size={14} />}
                                                            {rec.type === 'info' && <Lightbulb size={14} />}
                                                        </RecIcon>
                                                        <RecText theme={theme}>{rec.text}</RecText>
                                                    </RecommendationItem>
                                                ))}
                                            </RecommendationsList>
                                        )}
                                    </AISection>
                                )}

                                {/* Main Content Grid */}
                                <MainGrid>
                                    {/* Holdings Table */}
                                    <HoldingsSection theme={theme}>
                                        <HoldingsHeader>
                                            <HoldingsTitle theme={theme}>
                                                <Eye size={22} />
                                                Your Holdings
                                            </HoldingsTitle>
                                            <HeaderActions>
                                                <SearchWrapper>
                                                    <SearchIconStyled theme={theme} />
                                                    <SearchInput
                                                        theme={theme}
                                                        type="text"
                                                        placeholder="Search holdings..."
                                                        value={searchQuery}
                                                        onChange={e => setSearchQuery(e.target.value)}
                                                    />
                                                </SearchWrapper>
                                                <ActionButton theme={theme} onClick={handleRefresh} disabled={refreshing} $spinning={refreshing}>
                                                    <RefreshCw size={18} />
                                                    Refresh
                                                </ActionButton>
                                                <ActionButton theme={theme} onClick={handleExportCSV}>
                                                    <Download size={18} />
                                                    Export
                                                </ActionButton>
                                            </HeaderActions>
                                        </HoldingsHeader>

                                        <HoldingsTable>
                                            <Table>
                                                <thead>
                                                    <tr>
                                                        <Th theme={theme}>Asset</Th>
                                                        <Th theme={theme}>Quantity</Th>
                                                        <Th theme={theme}>Price</Th>
                                                        <Th theme={theme}>Value</Th>
                                                        <Th theme={theme}>24h Change</Th>
                                                        <Th theme={theme}>Source</Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredHoldings.map((holding, idx) => {
                                                        const quantity = holding.quantity || holding.shares || 0;
                                                        const price = holding.price || 0;
                                                        const value = holding.value || (price * quantity);
                                                        const change = holding.change24h || 0;
                                                        const positive = change >= 0;

                                                        return (
                                                            <Tr theme={theme} key={`${holding.symbol}-${idx}`}>
                                                                <Td theme={theme}>
                                                                    <SymbolLink to={getAssetRoute(holding.symbol, holding.type)} theme={theme}>
                                                                        <SymbolIconClickable theme={theme}>
                                                                            {holding.symbol?.substring(0, 2)}
                                                                        </SymbolIconClickable>
                                                                        <SymbolInfo>
                                                                            <SymbolName theme={theme}>
                                                                                {holding.symbol}
                                                                                <ExternalLink size={12} style={{ marginLeft: '0.35rem', opacity: 0.5 }} />
                                                                            </SymbolName>
                                                                            <SymbolType theme={theme}>{holding.name || holding.type || 'Crypto'}</SymbolType>
                                                                        </SymbolInfo>
                                                                    </SymbolLink>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <PriceCell theme={theme}>
                                                                        {quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                                                                    </PriceCell>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <PriceCell theme={theme}>
                                                                        ${price >= 1
                                                                            ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                                                            : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                                                                        }
                                                                    </PriceCell>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <ValueCell theme={theme}>
                                                                        ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </ValueCell>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <ChangeCell theme={theme} $positive={positive}>
                                                                        {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                                        {positive ? '+' : ''}{change.toFixed(2)}%
                                                                    </ChangeCell>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <SourceBadge theme={theme}>
                                                                        {holding.source === 'wallet' ? <Wallet size={12} /> : <Building2 size={12} />}
                                                                        {holding.sourceName || holding.source}
                                                                    </SourceBadge>
                                                                </Td>
                                                            </Tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </HoldingsTable>
                                    </HoldingsSection>

                                    {/* Sidebar Charts */}
                                    <Sidebar>
                                        <ChartCard theme={theme}>
                                            <ChartTitle theme={theme}>
                                                <PieChart size={20} />
                                                Allocation
                                            </ChartTitle>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <RechartsPie>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={55}
                                                        outerRadius={85}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                                        contentStyle={{
                                                            background: '#1e293b',
                                                            border: `1px solid ${theme.brand?.primary || '#00adef'}4D`,
                                                            borderRadius: '12px',
                                                            padding: '0.75rem'
                                                        }}
                                                    />
                                                </RechartsPie>
                                            </ResponsiveContainer>
                                            <ChartLegend>
                                                {pieData.slice(0, 6).map((entry, index) => (
                                                    <LegendItem key={entry.name} theme={theme}>
                                                        <LegendDot $color={COLORS[index % COLORS.length]} />
                                                        {entry.name}
                                                    </LegendItem>
                                                ))}
                                            </ChartLegend>
                                        </ChartCard>

                                        <ChartCard theme={theme}>
                                            <ChartTitle theme={theme}>
                                                <BarChart3 size={20} />
                                                24h Performance
                                            </ChartTitle>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={performanceData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" stroke={`${theme.text?.secondary || '#94a3b8'}1A`} />
                                                    <XAxis type="number" stroke={theme.text?.tertiary || '#64748b'} tickFormatter={v => `${v}%`} />
                                                    <YAxis type="category" dataKey="symbol" stroke={theme.text?.tertiary || '#64748b'} width={50} />
                                                    <Tooltip
                                                        formatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
                                                        contentStyle={{
                                                            background: '#1e293b',
                                                            border: `1px solid ${theme.brand?.primary || '#00adef'}4D`,
                                                            borderRadius: '12px',
                                                            padding: '0.75rem'
                                                        }}
                                                    />
                                                    <Bar dataKey="gain" radius={[0, 6, 6, 0]}>
                                                        {performanceData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.gain >= 0 ? theme.success || '#10b981' : theme.error || '#ef4444'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartCard>
                                    </Sidebar>
                                </MainGrid>

                                {/* Trade History Section */}
                                <TradeHistorySection theme={theme}>
                                    <TradeHistoryHeader>
                                        <TradeHistoryTitle theme={theme}>
                                            <History size={22} />
                                            Trade History
                                        </TradeHistoryTitle>
                                        {tradeHistory.length > 0 && (
                                            <TradeCount theme={theme}>
                                                {tradeHistory.length} recent trades
                                            </TradeCount>
                                        )}
                                    </TradeHistoryHeader>

                                    {loadingTrades ? (
                                        <LoadingContainer style={{ padding: '2rem' }}>
                                            <LoadingSpinner size={32} theme={theme} />
                                            <LoadingText theme={theme}>Loading trade history...</LoadingText>
                                        </LoadingContainer>
                                    ) : tradeHistory.length === 0 ? (
                                        <NoTradesMessage theme={theme}>
                                            <History size={48} />
                                            <div>No trades found</div>
                                            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                Your trading history will appear here once you make trades on connected brokerages.
                                            </div>
                                        </NoTradesMessage>
                                    ) : (
                                        <TradesTable>
                                            <Table>
                                                <thead>
                                                    <tr>
                                                        <Th theme={theme}>Type</Th>
                                                        <Th theme={theme}>Pair</Th>
                                                        <Th theme={theme}>Amount</Th>
                                                        <Th theme={theme}>Price</Th>
                                                        <Th theme={theme}>Total</Th>
                                                        <Th theme={theme}>Fee</Th>
                                                        <Th theme={theme}>Date</Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tradeHistory.map((trade, idx) => {
                                                        const baseAsset = parseKrakenPair(trade.pair || '');
                                                        return (
                                                            <TradeRow theme={theme} key={trade.id || idx}>
                                                                <Td theme={theme}>
                                                                    <TradeType theme={theme} $type={trade.type}>
                                                                        {trade.type === 'buy' ? (
                                                                            <>
                                                                                <ShoppingCart size={14} />
                                                                                Buy
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Tag size={14} />
                                                                                Sell
                                                                            </>
                                                                        )}
                                                                    </TradeType>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <TradePair
                                                                        theme={theme}
                                                                        onClick={() => navigate(getAssetRoute(baseAsset, 'crypto'))}
                                                                    >
                                                                        {baseAsset || trade.pair}
                                                                        <ArrowRight size={14} />
                                                                    </TradePair>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <TradeAmount theme={theme}>
                                                                        {trade.volume?.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                                                    </TradeAmount>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <PriceCell theme={theme}>
                                                                        ${trade.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </PriceCell>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <TradeCost theme={theme}>
                                                                        ${trade.cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </TradeCost>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <TradeFee theme={theme}>
                                                                        ${trade.fee?.toLocaleString(undefined, { minimumFractionDigits: 4 })}
                                                                    </TradeFee>
                                                                </Td>
                                                                <Td theme={theme}>
                                                                    <TradeDate theme={theme}>
                                                                        <Clock size={14} />
                                                                        {new Date(trade.time).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </TradeDate>
                                                                </Td>
                                                            </TradeRow>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </TradesTable>
                                    )}
                                </TradeHistorySection>
                            </>
                        )}
                    </>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default PortfolioPage;
