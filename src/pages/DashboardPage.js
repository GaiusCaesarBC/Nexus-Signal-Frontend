// src/pages/DashboardPage.js - THE MOST LEGENDARY DASHBOARD EVER - COMPLETE FIXED VERSION

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, Activity, DollarSign, PieChart,
    Zap, Target, Brain, Eye, ArrowUpRight, ArrowDownRight,
    Clock, BarChart3, Flame, Star, Bell, Trophy,
    RefreshCw, Download, Sparkles,
} from 'lucide-react';
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import nexusSignalLogo from '../assets/nexus-signal-logo.png';
import AdvancedChart from '../components/AdvancedChart';
import PatternDetector from '../components/PatternDetector';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const scrollTicker = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: ${props => props.theme.colors.bg.primary};
    color: ${props => props.theme.colors.text.primary};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
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
    ${props => css`animation: ${particles} ${props.duration}s linear infinite;`}
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    bottom: 0;
    opacity: 0.4;
    filter: blur(1px);
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
`;

const Header = styled.div`
    margin-bottom: 2rem;
    ${css`animation: ${fadeIn} 0.8s ease-out;`}
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

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    filter: drop-shadow(0 0 20px rgba(0, 173, 237, 0.3));

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const LiveClock = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

const ClockTime = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: #00adef;
`;

const ClockDate = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
`;

const MarketStatus = styled.div`
    background: ${props => props.open ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
    border: 1px solid ${props => props.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const StatusDot = styled.div`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.open ? '#10b981' : '#ef4444'};
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
    box-shadow: 0 0 10px ${props => props.open ? '#10b981' : '#ef4444'};
`;

const StatusText = styled.div`
    font-weight: 600;
    color: ${props => props.open ? '#10b981' : '#ef4444'};
`;

const TickerContainer = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 2rem;
    padding: 1rem 0;
    position: relative;
`;

const TickerTrack = styled.div`
    display: flex;
    ${css`animation: ${scrollTicker} 30s linear infinite;`}
    white-space: nowrap;
`;

const TickerItem = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 2rem;
    font-weight: 600;
`;

const TickerSymbol = styled.span`
    color: #00adef;
    font-size: 1.1rem;
`;

const TickerPrice = styled.span`
    color: #e0e6ed;
`;

const TickerChange = styled.span`
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const StaticLogo = styled.img`
    width: 80px;
    height: 80px;
    object-fit: contain;
    filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.7))
            drop-shadow(0 0 35px rgba(139, 92, 246, 0.6))
            drop-shadow(0 0 50px rgba(236, 72, 153, 0.5));
    transition: all 0.3s ease;
    flex-shrink: 0;

    &:hover {
        filter: drop-shadow(0 0 30px rgba(0, 217, 255, 0.9))
                drop-shadow(0 0 50px rgba(139, 92, 246, 0.8))
                drop-shadow(0 0 70px rgba(236, 72, 153, 0.7));
        transform: scale(1.05) rotate(5deg);
    }

    @media (max-width: 768px) {
        width: 60px;
        height: 60px;
    }
`;

const DashboardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const HeaderContent = styled.div`
    flex: 1;
`;

const ChartSection = styled.div`
    margin-bottom: 3rem;
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
    padding: 0.75rem 1.5rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 217, 255, 0.5);
        box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
    }

    &::placeholder {
        color: #64748b;
        font-weight: 500;
    }
`;

const SearchButton = styled.button`
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, rgba(0, 217, 255, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%);
    border: 1px solid rgba(0, 217, 255, 0.5);
    border-radius: 12px;
    color: #00d9ff;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 217, 255, 0.4) 0%, rgba(139, 92, 246, 0.3) 100%);
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0, 217, 255, 0.3);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const QuickSelectLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
    margin-right: 0.5rem;
`;

const SymbolSelector = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const SymbolButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 217, 255, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)' : 
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 217, 255, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00d9ff' : '#94a3b8'};
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%);
        border-color: rgba(0, 217, 255, 0.5);
        color: #00d9ff;
        transform: translateY(-2px);
    }
`;

const LoadingChartPlaceholder = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 600px;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    ${css`animation: ${fadeIn} 0.6s ease-out;`}
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${props => {
            if (props.variant === 'success') return 'linear-gradient(90deg, #10b981, #059669)';
            if (props.variant === 'danger') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            if (props.variant === 'warning') return 'linear-gradient(90deg, #f59e0b, #d97706)';
            return 'linear-gradient(90deg, #00adef, #0088cc)';
        }};
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 4s linear infinite;`}
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    ${css`animation: ${float} 3s ease-in-out infinite;`}
    background: ${props => {
        if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        if (props.variant === 'warning') return '#f59e0b';
        return '#00adef';
    }};
    position: relative;
    z-index: 1;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
`;

const StatValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${props => {
        if (props.$positive) return '#10b981';
        if (props.$negative) return '#ef4444';
        return '#00adef';
    }};
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
`;

const StatSubtext = styled.div`
    font-size: 0.9rem;
    color: ${props => props.$positive ? '#10b981' : props.$negative ? '#ef4444' : '#94a3b8'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
`;

const AchievementsSection = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    ${css`animation: ${fadeIn} 0.8s ease-out 0.2s backwards;`}
`;

const AchievementsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const AchievementsTitle = styled.h3`
    font-size: 1.3rem;
    color: #a78bfa;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AchievementsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
`;

const AchievementBadge = styled.div`
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
        background: rgba(139, 92, 246, 0.2);
        box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    }
`;

const BadgeIcon = styled.div`
    font-size: 2rem;
    margin-bottom: 0.5rem;
    ${css`animation: ${bounce} 2s ease-in-out infinite;`}
`;

const BadgeLabel = styled.div`
    font-size: 0.85rem;
    color: #a78bfa;
    font-weight: 600;
`;

const QuickActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const ActionButton = styled.button`
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
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
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.2) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 3s linear infinite;`}
    }

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.1) 100%);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
    }
`;

const ActionIcon = styled.div`
    font-size: 2rem;
    ${css`animation: ${float} 3s ease-in-out infinite;`}
    position: relative;
    z-index: 1;
`;

const ActionLabel = styled.div`
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const Panel = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    ${css`animation: ${fadeIn} 0.8s ease-out;`}
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.03) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 4s linear infinite;`}
    }
`;

const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
`;

const PanelTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PanelActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const IconButton = styled.button`
    width: 36px;
    height: 36px;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 8px;
    color: #00adef;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }
`;

const Badge = styled.span`
    background: ${props => {
        if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        return '#00adef';
    }};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MoversList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    z-index: 1;
`;

const MoverItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.1);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const MoverInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const MoverSymbol = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: #00adef;
    min-width: 60px;
`;

const MoverName = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const MoverPrice = styled.div`
    text-align: right;
`;

const MoverPriceValue = styled.div`
    font-size: 1.1rem;
    font-weight: 600;
    color: #e0e6ed;
`;

const MoverChange = styled.div`
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
`;

const PredictionCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 3s linear infinite;`}
    }
`;

const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const PredictionSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 700;
    color: #a78bfa;
`;

const PredictionDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.up ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    border-radius: 20px;
    color: ${props => props.up ? '#10b981' : '#ef4444'};
    font-weight: 600;
`;

const PredictionDetails = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    position: relative;
    z-index: 1;
`;

const PredictionDetail = styled.div``;

const DetailLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
    color: #e0e6ed;
    font-weight: 600;
    font-size: 1.1rem;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 8px;
    background: rgba(0, 173, 237, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1rem;
    position: relative;
    z-index: 1;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.value}%;
    background: linear-gradient(90deg, #10b981, #00adef);
    border-radius: 4px;
    transition: width 1s ease-out;
`;

const ActivityFeed = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 4px;

        &:hover {
            background: rgba(0, 173, 237, 0.7);
        }
    }
`;

const ActivityItem = styled.div`
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);
    ${props => css`
        animation: ${slideInRight} 0.4s ease-out;
        animation-delay: ${props.delay}s;
        animation-fill-mode: backwards;
    `}

    &:last-child {
        border-bottom: none;
    }
`;

const ActivityIconWrapper = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => {
        if (props.type === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.type === 'warning') return 'rgba(245, 158, 11, 0.2)';
        if (props.type === 'danger') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.type === 'success') return '#10b981';
        if (props.type === 'warning') return '#f59e0b';
        if (props.type === 'danger') return '#ef4444';
        return '#00adef';
    }};
    flex-shrink: 0;
`;

const ActivityContent = styled.div`
    flex: 1;
`;

const ActivityText = styled.div`
    color: #e0e6ed;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
`;

const ActivityTime = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const LoadingSpinner = styled.div`
    ${css`animation: ${rotate} 2s linear infinite;`}
`;

// ============ COMPONENT ============
const DashboardPage = () => {
    const { api, isAuthenticated, user } = useAuth();
    const { theme } = useTheme();
    const toast = useToast();
    
    // Portfolio & Dashboard States
    const [portfolioStats, setPortfolioStats] = useState(null);
    const [marketMovers, setMarketMovers] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [tickerData, setTickerData] = useState([]);
    const [performanceChartData, setPerformanceChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [marketOpen, setMarketOpen] = useState(false);
    const [particles, setParticles] = useState([]);
    const [activities, setActivities] = useState([]);
    
    // Advanced Chart States
    const [advancedChartData, setAdvancedChartData] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
    const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
    const [loadingChart, setLoadingChart] = useState(false);
    const [searchSymbol, setSearchSymbol] = useState('');

    // Generate particles on mount
    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: ['#00adef', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)]
        }));
        setParticles(newParticles);
    }, []);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Check if market is open
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

    // Fetch dashboard data on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Fetch chart data when symbol or timeframe changes
    useEffect(() => {
        if (selectedSymbol) {
            fetchChartData(selectedSymbol, selectedTimeframe);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSymbol, selectedTimeframe]);

    // Fetch real chart data function
    const fetchChartData = async (symbol, interval) => {
        setLoadingChart(true);
        setAdvancedChartData([]);
        
        try {
            console.log(`Fetching chart data for ${symbol} ${interval}`);
            
            const response = await api.get(`/chart/${symbol}/${interval}`);
            
            if (response.data.success && response.data.data && response.data.data.length > 0) {
                setAdvancedChartData(response.data.data);
                console.log(`✅ Loaded ${response.data.data.length} candles for ${symbol}`);
                toast.success(`Loaded ${symbol} chart`, 'Success');
            } else {
                toast.error('No data available for this symbol', 'Error');
                setAdvancedChartData([]);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setAdvancedChartData([]);
            
            if (error.response?.status === 429) {
                toast.error('API rate limit reached. Please wait a moment.', 'Rate Limited');
            } else if (error.response?.status === 404) {
                toast.error(`Symbol ${symbol} not found`, 'Not Found');
            } else {
                toast.error(`Failed to load ${symbol} data`, 'Error');
            }
        } finally {
            setLoadingChart(false);
        }
    };

    const handleTimeframeChange = (timeframe) => {
        setSelectedTimeframe(timeframe);
        toast.info(`Switching to ${timeframe} chart`, 'Timeframe Changed');
    };

    const handleSymbolChange = (symbol) => {
        if (symbol !== selectedSymbol) {
            setSelectedSymbol(symbol);
            setAdvancedChartData([]);
            toast.info(`Loading ${symbol} chart`, 'Symbol Changed');
        }
    };

    const handleSearchSymbol = () => {
        if (searchSymbol.trim()) {
            setSelectedSymbol(searchSymbol.trim().toUpperCase());
            toast.info(`Loading ${searchSymbol.trim().toUpperCase()} chart`, 'Searching...');
            setSearchSymbol('');
        }
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const [portfolioRes, watchlistRes, newsRes, predictionsRes] = await Promise.all([
                api.get('/portfolio').catch(() => ({ data: { holdings: [], totalValue: 0 } })),
                api.get('/watchlist').catch(() => ({ data: [] })),
                api.get('/news?limit=5').catch(() => ({ data: [] })),
                api.get('/predictions/recent').catch(() => ({ data: [] }))
            ]);

            calculatePortfolioStats(portfolioRes.data.holdings || []);

            if (watchlistRes.data && watchlistRes.data.length > 0) {
                const tickerSymbols = watchlistRes.data.slice(0, 8).map(item => ({
                    symbol: item.symbol,
                    price: item.currentPrice || 0,
                    change: item.change || 0
                }));
                setTickerData(tickerSymbols);
            } else {
                setTickerData([
                    { symbol: 'AAPL', price: 175.50, change: 2.5 },
                    { symbol: 'TSLA', price: 242.80, change: -1.2 },
                    { symbol: 'NVDA', price: 495.20, change: 5.8 },
                ]);
            }

            try {
                const screenRes = await api.get('/screener/stocks?changeFilter=gainers');
                if (screenRes.data && screenRes.data.length > 0) {
                    setMarketMovers(screenRes.data.slice(0, 4).map(stock => ({
                        symbol: stock.symbol,
                        name: stock.name || stock.symbol,
                        price: stock.price,
                        change: stock.changePercent
                    })));
                }
            } catch (error) {
                console.log('Market movers not available, using fallback');
                setMarketMovers([
                    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 495.20, change: 5.8 },
                    { symbol: 'AMD', name: 'Advanced Micro', price: 142.70, change: 4.5 },
                ]);
            }

            if (predictionsRes.data && predictionsRes.data.length > 0) {
                setPredictions(predictionsRes.data.slice(0, 2));
            } else {
                setPredictions([
                    {
                        symbol: 'AAPL',
                        direction: 'UP',
                        targetPrice: 182.50,
                        confidence: 85,
                        timeframe: '7 days'
                    }
                ]);
            }

            if (portfolioRes.data.performanceHistory) {
                setPerformanceChartData(portfolioRes.data.performanceHistory);
            } else {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                const baseValue = portfolioRes.data.totalValue || 10000;
                const mockChart = days.map((day, index) => ({
                    date: day,
                    value: baseValue * (0.95 + (index * 0.025))
                }));
                setPerformanceChartData(mockChart);
            }

            const recentActivities = [];
            
            if (portfolioRes.data.totalGainLoss) {
                const isGain = portfolioRes.data.totalGainLoss > 0;
                recentActivities.push({
                    type: isGain ? 'success' : 'warning',
                    icon: isGain ? TrendingUp : TrendingDown,
                    text: `Portfolio ${isGain ? 'gained' : 'lost'} $${Math.abs(portfolioRes.data.totalGainLoss).toFixed(2)} today`,
                    time: 'Today'
                });
            }

            if (newsRes.data && newsRes.data.length > 0) {
                newsRes.data.slice(0, 2).forEach(article => {
                    recentActivities.push({
                        type: 'info',
                        icon: Bell,
                        text: article.title.substring(0, 60) + '...',
                        time: 'Recent'
                    });
                });
            }

            setActivities(recentActivities.length > 0 ? recentActivities.slice(0, 4) : [
                { type: 'info', icon: Bell, text: 'Welcome to your dashboard!', time: 'Now' }
            ]);

            toast.success('Dashboard loaded', 'Welcome back!');

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Some data failed to load', 'Warning');
        } finally {
            setLoading(false);
        }
    };

    const calculatePortfolioStats = (holdings) => {
        if (!holdings || holdings.length === 0) {
            setPortfolioStats(null);
            return;
        }

        const totalValue = holdings.reduce((sum, h) => {
            const price = h.currentPrice || h.price || 0;
            const shares = h.shares || h.quantity || 0;
            return sum + (price * shares);
        }, 0);

        const totalCost = holdings.reduce((sum, h) => {
            const avgPrice = h.averagePrice || h.purchasePrice || 0;
            const shares = h.shares || h.quantity || 0;
            return sum + (avgPrice * shares);
        }, 0);

        const totalGain = totalValue - totalCost;
        const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

        setPortfolioStats({
            totalValue,
            totalGain,
            totalGainPercent,
            holdingsCount: holdings.length
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <PageContainer>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <LoadingSpinner>
                        <Activity size={64} color="#00adef" />
                    </LoadingSpinner>
                    <h2 style={{ color: '#00adef' }}>Loading Dashboard...</h2>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer theme={theme}>
            <ParticleContainer>
                {particles.map(particle => (
                    <Particle
                        key={particle.id}
                        size={particle.size}
                        left={particle.left}
                        duration={particle.duration}
                        delay={particle.delay}
                        color={particle.color}
                    />
                ))}
            </ParticleContainer>

            <ContentWrapper>
                <Header>
                    <HeaderLeft>
                        <DashboardHeader>
                            <StaticLogo 
                                src={nexusSignalLogo} 
                                alt="Nexus Signal Logo"
                            />
                            <HeaderContent>
                                <Title>Mission Control</Title>
                                <Subtitle>
                                    <Sparkles size={20} />
                                    Welcome back, {user?.name || 'Trader'} • Real-time market intelligence
                                </Subtitle>
                            </HeaderContent>
                        </DashboardHeader>
                    </HeaderLeft>
                    <HeaderRight>
                        <LiveClock>
                            <Clock size={24} />
                            <div>
                                <ClockTime>{formatTime(currentTime)}</ClockTime>
                                <ClockDate>{formatDate(currentTime)}</ClockDate>
                            </div>
                        </LiveClock>
                        <MarketStatus open={marketOpen}>
                            <StatusDot open={marketOpen} />
                            <StatusText open={marketOpen}>
                                {marketOpen ? 'Market Open' : 'Market Closed'}
                            </StatusText>
                        </MarketStatus>
                    </HeaderRight>
                </Header>

                {/* STOCK TICKER */}
                <TickerContainer>
                    <TickerTrack>
                        {[...tickerData, ...tickerData].map((stock, index) => (
                            <TickerItem key={index}>
                                <TickerSymbol>{stock.symbol}</TickerSymbol>
                                <TickerPrice>${stock.price.toFixed(2)}</TickerPrice>
                                <TickerChange $positive={stock.change >= 0}>
                                    {stock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                                </TickerChange>
                            </TickerItem>
                        ))}
                    </TickerTrack>
                </TickerContainer>

             

{/* ADVANCED CHART SECTION */}
<ChartSection>
    <SearchContainer>
        <SearchInput
            type="text"
            placeholder="Search any stock or crypto (e.g., AAPL, BTC-USD, ETH-USD)..."
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
            onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    handleSearchSymbol();
                }
            }}
        />
        <SearchButton 
            onClick={handleSearchSymbol}
            disabled={!searchSymbol.trim()}
        >
            <Eye size={20} />
            Load Chart
        </SearchButton>
    </SearchContainer>

    <SymbolSelector>
        <QuickSelectLabel>Quick Select:</QuickSelectLabel>
        {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD', 'BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD'].map(sym => (
            <SymbolButton
                key={sym}
                $active={selectedSymbol === sym}
                onClick={() => handleSymbolChange(sym)}
            >
                {sym}
            </SymbolButton>
        ))}
    </SymbolSelector>
    
    {loadingChart ? (
        <LoadingChartPlaceholder>
            <LoadingSpinner>
                <Activity size={64} color="#00adef" />
            </LoadingSpinner>
            <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '1.2rem' }}>
                Loading {selectedSymbol} chart data...
            </p>
        </LoadingChartPlaceholder>
    ) : (
        <>
            <AdvancedChart
                symbol={selectedSymbol}
                data={advancedChartData}
                height="600px"
                timeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
                onChartTypeChange={(type) => {
                    console.log('Chart type changed:', type);
                }}
            />

            {/* ✅ ADD THIS - AI PATTERN RECOGNITION */}
            <PatternDetector 
                symbol={selectedSymbol}
                chartData={advancedChartData}
            />
        </>
    )}
</ChartSection>

                {/* STATS CARDS */}
                <StatsGrid>
                    <StatCard>
                        <StatIcon>
                            <DollarSign size={24} />
                        </StatIcon>
                        <StatLabel>Portfolio Value</StatLabel>
                        <StatValue>
                            ${portfolioStats?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                        </StatValue>
                        <StatSubtext>
                            <Eye size={16} />
                            {portfolioStats?.holdingsCount || 0} Holdings
                        </StatSubtext>
                    </StatCard>

                    <StatCard variant={portfolioStats?.totalGain >= 0 ? 'success' : 'danger'}>
                        <StatIcon variant={portfolioStats?.totalGain >= 0 ? 'success' : 'danger'}>
                            {portfolioStats?.totalGain >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </StatIcon>
                        <StatLabel>Total Gain/Loss</StatLabel>
                        <StatValue $positive={portfolioStats?.totalGain >= 0} $negative={portfolioStats?.totalGain < 0}>
                            ${Math.abs(portfolioStats?.totalGain || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </StatValue>
                        <StatSubtext $positive={portfolioStats?.totalGainPercent >= 0} $negative={portfolioStats?.totalGainPercent < 0}>
                            {portfolioStats?.totalGainPercent >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {portfolioStats?.totalGainPercent >= 0 ? '+' : ''}{portfolioStats?.totalGainPercent?.toFixed(2) || 0}%
                        </StatSubtext>
                    </StatCard>

                    <StatCard variant="warning">
                        <StatIcon variant="warning">
                            <Flame size={24} />
                        </StatIcon>
                        <StatLabel>Hot Stocks</StatLabel>
                        <StatValue>{marketMovers.filter(m => m.change > 3).length}</StatValue>
                        <StatSubtext>
                            <Star size={16} />
                            Top Movers Today
                        </StatSubtext>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <Brain size={24} />
                        </StatIcon>
                        <StatLabel>AI Predictions</StatLabel>
                        <StatValue>{predictions.length}</StatValue>
                        <StatSubtext>
                            <Target size={16} />
                            Active Forecasts
                        </StatSubtext>
                    </StatCard>
                </StatsGrid>

                {/* ACHIEVEMENTS */}
                <AchievementsSection>
                    <AchievementsHeader>
                        <AchievementsTitle>
                            <Trophy size={24} />
                            Your Achievements
                        </AchievementsTitle>
                        <Badge>4/12 Unlocked</Badge>
                    </AchievementsHeader>
                    <AchievementsGrid>
                        <AchievementBadge>
                            <BadgeIcon>🎯</BadgeIcon>
                            <BadgeLabel>First Trade</BadgeLabel>
                        </AchievementBadge>
                        <AchievementBadge>
                            <BadgeIcon>📈</BadgeIcon>
                            <BadgeLabel>5 Day Streak</BadgeLabel>
                        </AchievementBadge>
                        <AchievementBadge>
                            <BadgeIcon>🔥</BadgeIcon>
                            <BadgeLabel>Hot Trader</BadgeLabel>
                        </AchievementBadge>
                        <AchievementBadge>
                            <BadgeIcon>💎</BadgeIcon>
                            <BadgeLabel>Diamond Hands</BadgeLabel>
                        </AchievementBadge>
                    </AchievementsGrid>
                </AchievementsSection>

                {/* QUICK ACTIONS */}
                <QuickActionsGrid>
                    <ActionButton onClick={() => window.location.href = '/portfolio'}>
                        <ActionIcon><PieChart size={32} /></ActionIcon>
                        <ActionLabel>Portfolio</ActionLabel>
                    </ActionButton>
                    <ActionButton onClick={() => window.location.href = '/predict'}>
                        <ActionIcon><Brain size={32} /></ActionIcon>
                        <ActionLabel>AI Predict</ActionLabel>
                    </ActionButton>
                    <ActionButton onClick={() => window.location.href = '/watchlist'}>
                        <ActionIcon><Eye size={32} /></ActionIcon>
                        <ActionLabel>Watchlist</ActionLabel>
                    </ActionButton>
                    <ActionButton onClick={() => window.location.href = '/chat'}>
                        <ActionIcon><Zap size={32} /></ActionIcon>
                        <ActionLabel>AI Chat</ActionLabel>
                    </ActionButton>
                </QuickActionsGrid>

                {/* MAIN CONTENT */}
                <ContentGrid>
                    <div>
                        <Panel>
                            <PanelHeader>
                                <PanelTitle>
                                    <BarChart3 size={24} />
                                    Portfolio Performance
                                </PanelTitle>
                                <PanelActions>
                                    <IconButton><RefreshCw size={18} /></IconButton>
                                    <IconButton><Download size={18} /></IconButton>
                                    <Badge>5 Days</Badge>
                                </PanelActions>
                            </PanelHeader>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={performanceChartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00adef" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#00adef" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis dataKey="date" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            background: '#1e293b', 
                                            border: '1px solid rgba(0, 173, 237, 0.3)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#00adef" 
                                        fillOpacity={1} 
                                        fill="url(#colorValue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel style={{ marginTop: '2rem' }}>
                            <PanelHeader>
                                <PanelTitle>
                                    <Flame size={24} />
                                    Market Movers
                                </PanelTitle>
                                <Badge variant="success">
                                    <Activity size={14} />
                                    Live
                                </Badge>
                            </PanelHeader>
                            <MoversList>
                                {marketMovers.map((mover, index) => (
                                    <MoverItem key={index}>
                                        <MoverInfo>
                                            <MoverSymbol>{mover.symbol}</MoverSymbol>
                                            <MoverName>{mover.name}</MoverName>
                                        </MoverInfo>
                                        <MoverPrice>
                                            <MoverPriceValue>${mover.price.toFixed(2)}</MoverPriceValue>
                                            <MoverChange $positive={mover.change >= 0}>
                                                {mover.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                {mover.change >= 0 ? '+' : ''}{mover.change}%
                                            </MoverChange>
                                        </MoverPrice>
                                    </MoverItem>
                                ))}
                            </MoversList>
                        </Panel>
                    </div>

                    <div>
                        <Panel>
                            <PanelHeader>
                                <PanelTitle>
                                    <Brain size={24} />
                                    AI Predictions
                                </PanelTitle>
                                <Badge>Powered by ML</Badge>
                            </PanelHeader>
                            
                            {predictions.map((pred, index) => (
                                <PredictionCard key={index}>
                                    <PredictionHeader>
                                        <PredictionSymbol>{pred.symbol}</PredictionSymbol>
                                        <PredictionDirection up={pred.direction === 'UP'}>
                                            {pred.direction === 'UP' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            {pred.direction}
                                        </PredictionDirection>
                                    </PredictionHeader>
                                    
                                    <PredictionDetails>
                                        <PredictionDetail>
                                            <DetailLabel>Target Price</DetailLabel>
                                            <DetailValue>${pred.targetPrice.toFixed(2)}</DetailValue>
                                        </PredictionDetail>
                                        <PredictionDetail>
                                            <DetailLabel>Timeframe</DetailLabel>
                                            <DetailValue>{pred.timeframe}</DetailValue>
                                        </PredictionDetail>
                                    </PredictionDetails>
                                    
                                    <div style={{ marginTop: '1rem' }}>
                                        <DetailLabel>Confidence Level</DetailLabel>
                                        <ConfidenceBar>
                                            <ConfidenceFill value={pred.confidence} />
                                        </ConfidenceBar>
                                        <div style={{ textAlign: 'right', marginTop: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                                            {pred.confidence}%
                                        </div>
                                    </div>
                                </PredictionCard>
                            ))}
                        </Panel>

                        <Panel style={{ marginTop: '2rem' }}>
                            <PanelHeader>
                                <PanelTitle>
                                    <Activity size={24} />
                                    Recent Activity
                                </PanelTitle>
                            </PanelHeader>
                            <ActivityFeed>
                                {activities.map((activity, index) => {
                                    const Icon = activity.icon;
                                    return (
                                        <ActivityItem key={index} delay={index * 0.1}>
                                            <ActivityIconWrapper type={activity.type}>
                                                <Icon size={20} />
                                            </ActivityIconWrapper>
                                            <ActivityContent>
                                                <ActivityText>{activity.text}</ActivityText>
                                                <ActivityTime>{activity.time}</ActivityTime>
                                            </ActivityContent>
                                        </ActivityItem>
                                    );
                                })}
                            </ActivityFeed>
                        </Panel>
                    </div>
                </ContentGrid>
            </ContentWrapper>
        </PageContainer>
    );
};

export default DashboardPage;