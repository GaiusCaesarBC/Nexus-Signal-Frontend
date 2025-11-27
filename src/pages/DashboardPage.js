// src/pages/DashboardPage.js - ULTIMATE DASHBOARD WITH REAL DATA INTEGRATION
// Properly integrates: Achievements, Social Feed, Portfolio, Predictions, Paper Trading, Leaderboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, Activity, DollarSign, PieChart,
    Zap, Target, Brain, Eye, ArrowUpRight, ArrowDownRight,
    Clock, BarChart3, Flame, Star, Bell, Trophy,
    RefreshCw, Download, Sparkles, Users, Award, MessageSquare,
    ThumbsUp, Share2, ChevronRight, Crown, Percent,
    Lock, Rocket
} from 'lucide-react';
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import nexusSignalLogo from '../assets/nexus-signal-logo.png';
import AdvancedChart from '../components/AdvancedChart';
import PatternDetector from '../components/PatternDetector';
import TickerLink, { TickerText } from '../components/TickerLink';
import WhaleAlertWidget from '../components/WhaleAlertWidget';

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

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
`;

const particlesAnim = keyframes`
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

const rankGlow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
        transform: scale(1);
    }
    50% { 
        box-shadow: 0 0 40px rgba(251, 191, 36, 0.8);
        transform: scale(1.05);
    }
`;

const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.6); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: ${props => props.theme?.colors?.bg?.primary || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
    color: ${props => props.theme?.colors?.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;

    @media (max-width: 768px) {
        padding-left: 1rem;
        padding-right: 1rem;
    }
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
    animation: ${particlesAnim} ${props => props.duration}s linear infinite;
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    bottom: 0;
    opacity: 0.4;
    filter: blur(1px);
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    max-width: 1800px;
    margin: 0 auto;
`;

const Header = styled.div`
    margin-bottom: 2rem;
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
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
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
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ClockTime = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: #00adef;

    @media (max-width: 768px) {
        font-size: 1.2rem;
    }
`;

const ClockDate = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
`;

const MarketStatus = styled.div`
    background: ${props => props.$open ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
    border: 1px solid ${props => props.$open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
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
    background: ${props => props.$open ? '#10b981' : '#ef4444'};
    animation: ${pulse} 2s ease-in-out infinite;
    box-shadow: 0 0 10px ${props => props.$open ? '#10b981' : '#ef4444'};
`;

const StatusText = styled.div`
    font-weight: 600;
    color: ${props => props.$open ? '#10b981' : '#ef4444'};
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
    animation: ${scrollTicker} 30s linear infinite;
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

// ============ PAPER TRADING HERO SECTION ============
const PaperTradingHero = styled.div`
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 173, 237, 0.15) 50%, rgba(139, 92, 246, 0.15) 100%);
    border: 2px solid rgba(16, 185, 129, 0.4);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr auto;
    gap: 2rem;
    align-items: center;
    animation: ${fadeIn} 0.8s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }

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
    color: #10b981;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PaperTradingValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${props => props.$color || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: 2rem;
        justify-content: center;
    }
`;

const PaperTradingChange = styled.div`
    font-size: 1rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const RankBadge = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
`;

const RankNumber = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)';
        return 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 900;
    color: white;
    animation: ${props => props.$rank <= 3 ? css`${rankGlow} 2s ease-in-out infinite` : 'none'};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const RankLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
`;

const ViewTradingButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

// ============ LEADERBOARD WIDGET ============
const LeaderboardWidget = styled.div`
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const LeaderboardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const LeaderboardTitle = styled.h3`
    font-size: 1.3rem;
    color: #fbbf24;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const LeaderboardList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const LeaderboardItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: ${props => props.$isUser ? 'rgba(0, 173, 237, 0.15)' : 'rgba(251, 191, 36, 0.05)'};
    border: 1px solid ${props => props.$isUser ? 'rgba(0, 173, 237, 0.4)' : 'rgba(251, 191, 36, 0.1)'};
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(251, 191, 36, 0.1);
        transform: translateX(5px);
    }
`;

const LeaderboardRank = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: ${props => props.$rank <= 3 ? 'white' : '#00adef'};
    font-size: 1rem;
`;

const LeaderboardInfo = styled.div`
    flex: 1;
`;

const LeaderboardName = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 1rem;
`;

const LeaderboardStats = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const LeaderboardReturn = styled.div`
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 700;
    font-size: 1.1rem;
`;

const ViewAllButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 10px;
    color: #fbbf24;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(251, 191, 36, 0.2) 100%);
        transform: translateY(-2px);
    }
`;

// ============ SOCIAL FEED WIDGET ============
const SocialFeedWidget = styled.div`
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const SocialFeedHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const SocialFeedTitle = styled.h3`
    font-size: 1.3rem;
    color: #3b82f6;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SocialPostList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 350px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(59, 130, 246, 0.1);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.4);
        border-radius: 3px;
    }
`;

const SocialPost = styled.div`
    padding: 1rem;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.1);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
    }
`;

const PostHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const PostAvatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1rem;
`;

const PostUserInfo = styled.div`
    flex: 1;
`;

const PostUsername = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 0.95rem;
`;

const PostTime = styled.div`
    color: #64748b;
    font-size: 0.8rem;
`;

const PostContent = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
`;

const PostTicker = styled.span`
    color: #00adef;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

const PostActions = styled.div`
    display: flex;
    gap: 1.5rem;
`;

const PostAction = styled.button`
    background: none;
    border: none;
    color: #64748b;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    transition: color 0.2s ease;

    &:hover {
        color: ${props => props.$color || '#3b82f6'};
    }
`;

const EmptySocialFeed = styled.div`
    text-align: center;
    padding: 2rem;
    color: #64748b;
`;

// ============ QUICK ACTIONS ============
const QuickActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const ActionButton = styled.button`
    padding: 1.5rem;
    background: ${props => props.$primary ? 
        'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 100%)' :
        'linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%)'
    };
    border: 1px solid ${props => props.$primary ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 173, 237, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$primary ? '#10b981' : '#00adef'};
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
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        background: ${props => props.$primary ? 
            'linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.2) 100%)' :
            'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.1) 100%)'
        };
        transform: translateY(-5px);
        box-shadow: 0 10px 30px ${props => props.$primary ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 173, 237, 0.3)'};
    }
`;

const ActionIcon = styled.div`
    font-size: 2rem;
    animation: ${float} 3s ease-in-out infinite;
    position: relative;
    z-index: 1;
`;

const ActionLabel = styled.div`
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
`;

// ============ ACHIEVEMENTS ============
const AchievementsSection = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out 0.2s backwards;
`;

const AchievementsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const AchievementsTitle = styled.h3`
    font-size: 1.3rem;
    color: #a78bfa;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AchievementsProgress = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ProgressBar = styled.div`
    width: 200px;
    height: 10px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 5px;
    overflow: hidden;

    @media (max-width: 768px) {
        width: 120px;
    }
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd);
    border-radius: 5px;
    transition: width 1s ease-out;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: ${shimmer} 2s linear infinite;
    }
`;

const ProgressText = styled.span`
    color: #a78bfa;
    font-weight: 700;
    font-size: 0.95rem;
    white-space: nowrap;
`;

const AchievementsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
`;

const AchievementBadge = styled.div`
    background: ${props => props.$unlocked ? 
        props.$rarity === 'legendary' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)' :
        props.$rarity === 'epic' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(124, 58, 237, 0.15) 100%)' :
        props.$rarity === 'rare' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)' :
        'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)'
        : 'rgba(100, 116, 139, 0.1)'
    };
    border: 2px solid ${props => {
        if (!props.$unlocked) return 'rgba(100, 116, 139, 0.2)';
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.6)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.6)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.6)';
        return 'rgba(16, 185, 129, 0.6)';
    }};
    border-radius: 12px;
    padding: 1.25rem 0.75rem;
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
        transform: ${props => props.$unlocked ? 'translateY(-5px) scale(1.02)' : 'none'};
        box-shadow: ${props => props.$unlocked ? '0 10px 30px rgba(139, 92, 246, 0.4)' : 'none'};
    }
`;

const BadgeIcon = styled.div`
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    animation: ${props => props.$unlocked ? css`${bounce} 2s ease-in-out infinite` : 'none'};
    filter: ${props => props.$unlocked ? 'none' : 'grayscale(100%)'};
`;

const BadgeLabel = styled.div`
    font-size: 0.8rem;
    color: ${props => props.$unlocked ? '#e0e6ed' : '#64748b'};
    font-weight: 600;
    line-height: 1.2;
`;

const BadgeLock = styled.div`
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: #64748b;
    opacity: 0.7;
`;

const RarityDot = styled.div`
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rarity === 'legendary') return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
        if (props.$rarity === 'epic') return 'linear-gradient(135deg, #a78bfa, #8b5cf6)';
        if (props.$rarity === 'rare') return 'linear-gradient(135deg, #60a5fa, #3b82f6)';
        return 'linear-gradient(135deg, #34d399, #10b981)';
    }};
    box-shadow: 0 0 8px ${props => {
        if (props.$rarity === 'legendary') return 'rgba(251, 191, 36, 0.6)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.6)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.6)';
        return 'rgba(16, 185, 129, 0.6)';
    }};
`;

const ViewAchievementsButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 10px;
    color: #a78bfa;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%);
        transform: translateY(-2px);
    }
`;

// ============ CHART SECTION ============
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

// ============ STATS GRID ============
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
    animation: ${fadeIn} 0.6s ease-out;
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
            if (props.$variant === 'success') return 'linear-gradient(90deg, #10b981, #059669)';
            if (props.$variant === 'danger') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            if (props.$variant === 'warning') return 'linear-gradient(90deg, #f59e0b, #d97706)';
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
        animation: ${shimmer} 4s linear infinite;
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
    animation: ${float} 3s ease-in-out infinite;
    background: ${props => {
        if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.$variant === 'success') return '#10b981';
        if (props.$variant === 'danger') return '#ef4444';
        if (props.$variant === 'warning') return '#f59e0b';
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

// ============ TWO COLUMN WIDGETS GRID ============
const WidgetsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

// ============ CONTENT GRID ============
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
    animation: ${fadeIn} 0.8s ease-out;
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
        animation: ${shimmer} 4s linear infinite;
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
        if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.$variant === 'success') return '#10b981';
        if (props.$variant === 'danger') return '#ef4444';
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
    cursor: pointer;

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
        animation: ${shimmer} 3s linear infinite;
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
    background: ${props => props.$up ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    border-radius: 20px;
    color: ${props => props.$up ? '#10b981' : '#ef4444'};
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
    width: ${props => props.$value}%;
    background: linear-gradient(90deg, #10b981, #00adef);
    border-radius: 4px;
    transition: width 1s ease-out;
`;

const NoPredictions = styled.div`
    text-align: center;
    padding: 2rem;
    color: #64748b;
`;

const LoadingSpinner = styled.div`
    animation: ${rotate} 2s linear infinite;
`;

// ============ COMPONENT ============
const DashboardPage = () => {
    const navigate = useNavigate();
    const { api, isAuthenticated, user } = useAuth();
    const { theme } = useTheme();
    const toast = useToast();
    
    // Portfolio & Dashboard States
    const [portfolioData, setPortfolioData] = useState(null);
    const [marketMovers, setMarketMovers] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [tickerData, setTickerData] = useState([]);
    const [performanceChartData, setPerformanceChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [marketOpen, setMarketOpen] = useState(false);
    const [particlesData, setParticlesData] = useState([]);
    
    // Paper Trading States
    const [paperTradingStats, setPaperTradingStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    
    // Social Feed States (REAL from /api/posts)
    const [socialFeed, setSocialFeed] = useState([]);
    
    // Achievements States - NOW WITH PROPER TOTALS
    const [achievements, setAchievements] = useState([]);
    const [totalAchievements, setTotalAchievements] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState(0);
    
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
        setParticlesData(newParticles);
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

    // Fetch all dashboard data on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchAllDashboardData();
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

    const fetchAllDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchPortfolioData(),
                fetchPaperTradingData(),
                fetchLeaderboardData(),
                fetchSocialFeed(),
                fetchAchievements(),
                fetchPredictions()
            ]);
            toast.success('Dashboard loaded', 'Welcome back!');
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Some data failed to load', 'Warning');
        } finally {
            setLoading(false);
        }
    };

    // Fetch portfolio data from /api/portfolio
    const fetchPortfolioData = async () => {
        try {
            const response = await api.get('/portfolio');
            if (response.data.success && response.data.portfolio) {
                const portfolio = response.data.portfolio;
                setPortfolioData({
                    totalValue: portfolio.totalValue || 0,
                    totalChange: portfolio.totalChange || 0,
                    totalChangePercent: portfolio.totalChangePercent || 0,
                    cashBalance: portfolio.cashBalance || 0,
                    holdings: portfolio.holdings || [],
                    holdingsCount: portfolio.holdings?.length || 0
                });
                
                if (portfolio.performanceHistory && portfolio.performanceHistory.length > 0) {
                    setPerformanceChartData(portfolio.performanceHistory);
                } else {
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                    const baseValue = portfolio.totalValue || 100000;
                    const mockChart = days.map((day, index) => ({
                        date: day,
                        value: baseValue * (0.98 + (index * 0.01) + (Math.random() * 0.02))
                    }));
                    setPerformanceChartData(mockChart);
                }
            }
            
            try {
                const watchlistRes = await api.get('/watchlist');
                if (watchlistRes.data && watchlistRes.data.length > 0) {
                    const tickerSymbols = watchlistRes.data.slice(0, 8).map(item => ({
                        symbol: item.symbol,
                        price: item.currentPrice || item.price || 0,
                        change: item.changePercent || item.change || 0
                    }));
                    setTickerData(tickerSymbols);
                } else {
                    setDefaultTickerData();
                }
            } catch {
                setDefaultTickerData();
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
                } else {
                    setDefaultMarketMovers();
                }
            } catch {
                setDefaultMarketMovers();
            }
        } catch (error) {
            console.error('Error fetching portfolio data:', error);
            setPortfolioData(null);
        }
    };
    
    const setDefaultTickerData = () => {
        setTickerData([
            { symbol: 'AAPL', price: 175.50, change: 2.5 },
            { symbol: 'TSLA', price: 242.80, change: -1.2 },
            { symbol: 'NVDA', price: 495.20, change: 5.8 },
            { symbol: 'BTC', price: 97250.00, change: 3.2 },
            { symbol: 'ETH', price: 3380.00, change: 4.1 },
        ]);
    };
    
    const setDefaultMarketMovers = () => {
        setMarketMovers([
            { symbol: 'NVDA', name: 'NVIDIA Corp', price: 495.20, change: 5.8 },
            { symbol: 'AMD', name: 'Advanced Micro', price: 142.70, change: 4.5 },
            { symbol: 'AAPL', name: 'Apple Inc', price: 175.50, change: 2.5 },
            { symbol: 'MSFT', name: 'Microsoft', price: 378.90, change: 1.8 },
        ]);
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
                    try {
                        const allLeaders = await api.get('/paper-trading/leaderboard?limit=100');
                        const userInAll = allLeaders.data.leaderboard?.find(
                            entry => entry.user?._id === user?._id
                        );
                        if (userInAll) {
                            setUserRank(userInAll.rank);
                        }
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

    // Fetch social feed from /api/posts
    const fetchSocialFeed = async () => {
        try {
            const response = await api.get('/posts?limit=5');
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setSocialFeed(response.data.slice(0, 4));
            } else if (response.data?.posts && Array.isArray(response.data.posts)) {
                setSocialFeed(response.data.posts.slice(0, 4));
            } else {
                setSocialFeed([]);
            }
        } catch (error) {
            console.error('Error fetching social feed:', error);
            setSocialFeed([]);
        }
    };

    // ✅ FIXED: Fetch ALL achievements and track totals properly
    const fetchAchievements = async () => {
        try {
            const response = await api.get('/gamification/achievements');
            console.log('Achievements response:', response.data);
            
            if (response.data.success && response.data.achievements) {
                const allAchievements = response.data.achievements;
                
                // Get total counts from API response or calculate
                const total = response.data.total || allAchievements.length;
                const unlocked = response.data.unlocked || allAchievements.filter(a => a.unlocked).length;
                
                setTotalAchievements(total);
                setUnlockedAchievements(unlocked);
                
                // Sort: unlocked first, then by rarity (legendary > epic > rare > common)
                const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
                const sortedAchievements = [...allAchievements].sort((a, b) => {
                    // Unlocked first
                    if (a.unlocked && !b.unlocked) return -1;
                    if (!a.unlocked && b.unlocked) return 1;
                    // Then by rarity
                    return (rarityOrder[a.rarity] || 4) - (rarityOrder[b.rarity] || 4);
                });
                
                // Show first 12 for the dashboard (mix of unlocked and some locked)
                setAchievements(sortedAchievements.slice(0, 12));
            } else {
                setAchievements([]);
                setTotalAchievements(0);
                setUnlockedAchievements(0);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
            setAchievements([]);
            setTotalAchievements(0);
            setUnlockedAchievements(0);
        }
    };

    // Fetch REAL predictions from /api/predictions/recent
    const fetchPredictions = async () => {
        try {
            const response = await api.get('/predictions/recent?limit=3');
            if (Array.isArray(response.data) && response.data.length > 0) {
                setPredictions(response.data.slice(0, 2).map(pred => ({
                    _id: pred._id,
                    symbol: pred.symbol,
                    direction: pred.direction,
                    targetPrice: pred.targetPrice,
                    currentPrice: pred.currentPrice,
                    confidence: pred.confidence,
                    timeframe: `${pred.timeframe} days`,
                    createdAt: pred.createdAt
                })));
            } else {
                setPredictions([]);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
            setPredictions([]);
        }
    };

    const fetchChartData = async (symbol, interval) => {
        setLoadingChart(true);
        setAdvancedChartData([]);
        try {
            const response = await api.get(`/chart/${symbol}/${interval}`);
            if (response.data.success && response.data.data && response.data.data.length > 0) {
                setAdvancedChartData(response.data.data);
            } else {
                setAdvancedChartData([]);
            }
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setAdvancedChartData([]);
        } finally {
            setLoadingChart(false);
        }
    };

    const handleTimeframeChange = (timeframe) => {
        setSelectedTimeframe(timeframe);
    };

    const handleSymbolChange = (symbol) => {
        if (symbol !== selectedSymbol) {
            setSelectedSymbol(symbol);
            setAdvancedChartData([]);
        }
    };

    const handleSearchSymbol = () => {
        if (searchSymbol.trim()) {
            setSelectedSymbol(searchSymbol.trim().toUpperCase());
            setSearchSymbol('');
        }
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value || 0);
    };

    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${(value || 0).toFixed(2)}%`;
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    // Calculate progress using REAL totals
    const achievementProgress = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0;

    if (loading) {
        return (
            <PageContainer>
                <div style={{ textAlign: 'center', padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
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
                {particlesData.map(particle => (
                    <Particle key={particle.id} size={particle.size} left={particle.left} duration={particle.duration} delay={particle.delay} color={particle.color} />
                ))}
            </ParticleContainer>

            <ContentWrapper>
                <Header>
                    <HeaderLeft>
                        <DashboardHeader>
                            <StaticLogo src={nexusSignalLogo} alt="Nexus Signal Logo" />
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
                        <MarketStatus $open={marketOpen}>
                            <StatusDot $open={marketOpen} />
                            <StatusText $open={marketOpen}>
                                {marketOpen ? 'Market Open' : 'Market Closed'}
                            </StatusText>
                        </MarketStatus>
                    </HeaderRight>
                </Header>

                <TickerContainer>
                    <TickerTrack>
                        {[...tickerData, ...tickerData].map((stock, index) => (
                            <TickerItem key={index}>
                                <TickerLink symbol={stock.symbol} bold>
                                    {stock.symbol}
                                </TickerLink>
                                <TickerPrice>${stock.price?.toFixed(2)}</TickerPrice>
                                <TickerChange $positive={stock.change >= 0}>
                                    {stock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                                </TickerChange>
                            </TickerItem>
                        ))}
                    </TickerTrack>
                </TickerContainer>

                <PaperTradingHero>
                    <PaperTradingTitle>
                        <PaperTradingLabel><Trophy size={18} />Paper Trading</PaperTradingLabel>
                        <PaperTradingValue>{formatCurrency(paperTradingStats?.portfolioValue)}</PaperTradingValue>
                        <PaperTradingChange $positive={paperTradingStats?.totalProfitLoss >= 0}>
                            {paperTradingStats?.totalProfitLoss >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            {formatCurrency(Math.abs(paperTradingStats?.totalProfitLoss || 0))}
                            ({formatPercent(paperTradingStats?.totalProfitLossPercent)})
                        </PaperTradingChange>
                    </PaperTradingTitle>

                    <PaperTradingTitle>
                        <PaperTradingLabel><Percent size={18} />Win Rate</PaperTradingLabel>
                        <PaperTradingValue $color={paperTradingStats?.winRate >= 50 ? '#10b981' : '#f59e0b'}>
                            {(paperTradingStats?.winRate || 0).toFixed(1)}%
                        </PaperTradingValue>
                        <PaperTradingChange $positive={true}>{paperTradingStats?.totalTrades || 0} total trades</PaperTradingChange>
                    </PaperTradingTitle>

                    <PaperTradingTitle>
                        <PaperTradingLabel><Target size={18} />W/L Record</PaperTradingLabel>
                        <PaperTradingValue>
                            <span style={{ color: '#10b981' }}>{paperTradingStats?.winningTrades || 0}</span>
                            <span style={{ color: '#64748b' }}>/</span>
                            <span style={{ color: '#ef4444' }}>{paperTradingStats?.losingTrades || 0}</span>
                        </PaperTradingValue>
                        <PaperTradingChange $positive={true}>Wins / Losses</PaperTradingChange>
                    </PaperTradingTitle>

                    <RankBadge>
                        <RankNumber $rank={userRank || 99}>
                            {userRank ? (userRank <= 3 ? ['🥇', '🥈', '🥉'][userRank - 1] : `#${userRank}`) : '-'}
                        </RankNumber>
                        <RankLabel>Leaderboard Rank</RankLabel>
                    </RankBadge>

                    <ViewTradingButton onClick={() => navigate('/paper-trading')}>
                        <Rocket size={20} />Trade Now<ChevronRight size={20} />
                    </ViewTradingButton>
                </PaperTradingHero>

                <QuickActionsGrid>
                    <ActionButton $primary onClick={() => navigate('/paper-trading')}><ActionIcon><Trophy size={32} /></ActionIcon><ActionLabel>Paper Trade</ActionLabel></ActionButton>
                    <ActionButton onClick={() => navigate('/portfolio')}><ActionIcon><PieChart size={32} /></ActionIcon><ActionLabel>Portfolio</ActionLabel></ActionButton>
                    <ActionButton onClick={() => navigate('/predict')}><ActionIcon><Brain size={32} /></ActionIcon><ActionLabel>AI Predict</ActionLabel></ActionButton>
                    <ActionButton onClick={() => navigate('/watchlist')}><ActionIcon><Eye size={32} /></ActionIcon><ActionLabel>Watchlist</ActionLabel></ActionButton>
                    <ActionButton onClick={() => navigate('/social')}><ActionIcon><Users size={32} /></ActionIcon><ActionLabel>Social Feed</ActionLabel></ActionButton>
                    <ActionButton onClick={() => navigate('/achievements')}><ActionIcon><Award size={32} /></ActionIcon><ActionLabel>Achievements</ActionLabel></ActionButton>
                </QuickActionsGrid>

                {/* ✅ FIXED ACHIEVEMENTS SECTION - Now shows correct totals */}
                <AchievementsSection>
                    <AchievementsHeader>
                        <AchievementsTitle>
                            <Award size={24} />
                            Your Achievements
                        </AchievementsTitle>
                        <AchievementsProgress>
                            <ProgressBar>
                                <ProgressFill $progress={achievementProgress} />
                            </ProgressBar>
                            <ProgressText>
                                {unlockedAchievements}/{totalAchievements} Unlocked
                            </ProgressText>
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
                                        {!achievement.unlocked && (
                                            <BadgeLock><Lock size={14} /></BadgeLock>
                                        )}
                                        {achievement.unlocked && achievement.rarity && (
                                            <RarityDot $rarity={achievement.rarity} />
                                        )}
                                        <BadgeIcon $unlocked={achievement.unlocked}>
                                            {achievement.icon}
                                        </BadgeIcon>
                                        <BadgeLabel $unlocked={achievement.unlocked}>
                                            {achievement.name}
                                        </BadgeLabel>
                                    </AchievementBadge>
                                ))}
                            </AchievementsGrid>
                            <ViewAchievementsButton onClick={() => navigate('/achievements')}>
                                View All {totalAchievements} Achievements
                                <ChevronRight size={18} />
                            </ViewAchievementsButton>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                            <Award size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Start trading to unlock achievements!</p>
                        </div>
                    )}
                </AchievementsSection>

                <WidgetsGrid>
                    <LeaderboardWidget>
                        <LeaderboardHeader>
                            <LeaderboardTitle><Crown size={24} />Top Traders</LeaderboardTitle>
                            <Badge $variant="success"><Activity size={14} />Live</Badge>
                        </LeaderboardHeader>
                        <LeaderboardList>
                            {leaderboard.slice(0, 5).map((trader, index) => (
                                <LeaderboardItem key={trader.user?._id || index} $isUser={trader.user?._id === user?._id}>
                                    <LeaderboardRank $rank={trader.rank}>{trader.rank}</LeaderboardRank>
                                    <LeaderboardInfo>
                                        <LeaderboardName>{trader.user?.name || 'Anonymous'}{trader.user?._id === user?._id && ' (You)'}</LeaderboardName>
                                        <LeaderboardStats>{trader.totalTrades} trades • {(trader.winRate || 0).toFixed(0)}% win rate</LeaderboardStats>
                                    </LeaderboardInfo>
                                    <LeaderboardReturn $positive={trader.profitLossPercent >= 0}>{formatPercent(trader.profitLossPercent)}</LeaderboardReturn>
                                </LeaderboardItem>
                            ))}
                        </LeaderboardList>
                        <ViewAllButton onClick={() => navigate('/leaderboard')}>View Full Leaderboard<ChevronRight size={18} /></ViewAllButton>
                    </LeaderboardWidget>

                    <WhaleAlertWidget />

                    <SocialFeedWidget>
                        <SocialFeedHeader>
                            <SocialFeedTitle><MessageSquare size={24} />Social Feed</SocialFeedTitle>
                            <Badge><Users size={14} />Community</Badge>
                        </SocialFeedHeader>
                        <SocialPostList>
                            {socialFeed.length > 0 ? (
                                socialFeed.map((post) => (
                                    <SocialPost key={post._id}>
                                        <PostHeader>
                                            <PostAvatar>{post.user?.name?.charAt(0) || post.author?.name?.charAt(0) || 'A'}</PostAvatar>
                                            <PostUserInfo>
                                                <PostUsername>{post.user?.name || post.author?.name || 'Anonymous'}</PostUsername>
                                                <PostTime>{formatTimeAgo(post.createdAt)}</PostTime>
                                            </PostUserInfo>
                                        </PostHeader>
                                        <PostContent>
                                            <TickerText text={post.content || post.text || ''} />
                                        </PostContent>
                                        <PostActions>
                                            <PostAction $color="#ef4444"><ThumbsUp size={16} /> {post.likes?.length || post.likesCount || 0}</PostAction>
                                            <PostAction><MessageSquare size={16} /> {post.comments?.length || post.commentsCount || 0}</PostAction>
                                            <PostAction><Share2 size={16} /></PostAction>
                                        </PostActions>
                                    </SocialPost>
                                ))
                            ) : (
                                <EmptySocialFeed>
                                    <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>No posts yet. Be the first to share!</p>
                                </EmptySocialFeed>
                            )}
                        </SocialPostList>
                        <ViewAllButton onClick={() => navigate('/social')} style={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6' }}>
                            {socialFeed.length > 0 ? 'View All Posts' : 'Create First Post'}<ChevronRight size={18} />
                        </ViewAllButton>
                    </SocialFeedWidget>
                </WidgetsGrid>

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
                            <Eye size={20} />Load Chart
                        </SearchButton>
                    </SearchContainer>
                    <SymbolSelector>
                        <QuickSelectLabel>Quick Select:</QuickSelectLabel>
                        {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD', 'BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD'].map(sym => (
                            <SymbolButton key={sym} $active={selectedSymbol === sym} onClick={() => handleSymbolChange(sym)}>{sym}</SymbolButton>
                        ))}
                    </SymbolSelector>
                    {loadingChart ? (
                        <LoadingChartPlaceholder>
                            <LoadingSpinner><Activity size={64} color="#00adef" /></LoadingSpinner>
                            <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '1.2rem' }}>Loading {selectedSymbol} chart data...</p>
                        </LoadingChartPlaceholder>
                    ) : (
                        <>
                            <AdvancedChart symbol={selectedSymbol} data={advancedChartData} height="600px" timeframe={selectedTimeframe} onTimeframeChange={handleTimeframeChange} />
                            <PatternDetector symbol={selectedSymbol} chartData={advancedChartData} />
                        </>
                    )}
                </ChartSection>

                <StatsGrid>
                    <StatCard>
                        <StatIcon><DollarSign size={24} /></StatIcon>
                        <StatLabel>Portfolio Value</StatLabel>
                        <StatValue>{formatCurrency(portfolioData?.totalValue || 0)}</StatValue>
                        <StatSubtext><Eye size={16} />{portfolioData?.holdingsCount || 0} Holdings</StatSubtext>
                    </StatCard>
                    <StatCard $variant={portfolioData?.totalChange >= 0 ? 'success' : 'danger'}>
                        <StatIcon $variant={portfolioData?.totalChange >= 0 ? 'success' : 'danger'}>
                            {portfolioData?.totalChange >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </StatIcon>
                        <StatLabel>Total Gain/Loss</StatLabel>
                        <StatValue $positive={portfolioData?.totalChange >= 0} $negative={portfolioData?.totalChange < 0}>
                            {formatCurrency(Math.abs(portfolioData?.totalChange || 0))}
                        </StatValue>
                        <StatSubtext $positive={portfolioData?.totalChangePercent >= 0} $negative={portfolioData?.totalChangePercent < 0}>
                            {portfolioData?.totalChangePercent >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {formatPercent(portfolioData?.totalChangePercent || 0)}
                        </StatSubtext>
                    </StatCard>
                    <StatCard $variant="warning">
                        <StatIcon $variant="warning"><Flame size={24} /></StatIcon>
                        <StatLabel>Hot Stocks</StatLabel>
                        <StatValue>{marketMovers.filter(m => m.change > 3).length}</StatValue>
                        <StatSubtext><Star size={16} />Top Movers Today</StatSubtext>
                    </StatCard>
                    <StatCard>
                        <StatIcon><Brain size={24} /></StatIcon>
                        <StatLabel>AI Predictions</StatLabel>
                        <StatValue>{predictions.length}</StatValue>
                        <StatSubtext><Target size={16} />Active Forecasts</StatSubtext>
                    </StatCard>
                </StatsGrid>

                <ContentGrid>
                    <div>
                        <Panel>
                            <PanelHeader>
                                <PanelTitle><BarChart3 size={24} />Portfolio Performance</PanelTitle>
                                <PanelActions>
                                    <IconButton onClick={fetchPortfolioData}><RefreshCw size={18} /></IconButton>
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
                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(0, 173, 237, 0.3)', borderRadius: '8px' }} 
                                        formatter={(value) => [formatCurrency(value), 'Value']} 
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#00adef" fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Panel>

                        <Panel style={{ marginTop: '2rem' }}>
                            <PanelHeader>
                                <PanelTitle><Flame size={24} />Market Movers</PanelTitle>
                                <Badge $variant="success"><Activity size={14} />Live</Badge>
                            </PanelHeader>
                            <MoversList>
                                {marketMovers.map((mover, index) => (
                                    <MoverItem key={index}>
                                        <MoverInfo>
                                            <TickerLink symbol={mover.symbol} bold style={{ fontSize: '1.2rem', minWidth: '60px' }}>
                                                {mover.symbol}
                                            </TickerLink>
                                            <MoverName>{mover.name}</MoverName>
                                        </MoverInfo>
                                        <MoverPrice>
                                            <MoverPriceValue>${mover.price?.toFixed(2)}</MoverPriceValue>
                                            <MoverChange $positive={mover.change >= 0}>
                                                {mover.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                {mover.change >= 0 ? '+' : ''}{mover.change?.toFixed(2)}%
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
                                <PanelTitle><Brain size={24} />AI Predictions</PanelTitle>
                                <Badge>Powered by ML</Badge>
                            </PanelHeader>
                            {predictions.length > 0 ? (
                                predictions.map((pred, index) => (
                                    <PredictionCard key={pred._id || index}>
                                        <PredictionHeader>
                                            <TickerLink symbol={pred.symbol} bold style={{ fontSize: '1.3rem', color: '#a78bfa' }}>
                                                {pred.symbol}
                                            </TickerLink>
                                            <PredictionDirection $up={pred.direction === 'UP'}>
                                                {pred.direction === 'UP' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                {pred.direction}
                                            </PredictionDirection>
                                        </PredictionHeader>
                                        <PredictionDetails>
                                            <PredictionDetail>
                                                <DetailLabel>Target Price</DetailLabel>
                                                <DetailValue>${pred.targetPrice?.toFixed(2)}</DetailValue>
                                            </PredictionDetail>
                                            <PredictionDetail>
                                                <DetailLabel>Timeframe</DetailLabel>
                                                <DetailValue>{pred.timeframe}</DetailValue>
                                            </PredictionDetail>
                                        </PredictionDetails>
                                        <div style={{ marginTop: '1rem', position: 'relative', zIndex: 1 }}>
                                            <DetailLabel>Confidence Level</DetailLabel>
                                            <ConfidenceBar><ConfidenceFill $value={pred.confidence} /></ConfidenceBar>
                                            <div style={{ textAlign: 'right', marginTop: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                                                {pred.confidence?.toFixed(1)}%
                                            </div>
                                        </div>
                                    </PredictionCard>
                                ))
                            ) : (
                                <NoPredictions>
                                    <Brain size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p>No predictions yet.</p>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Go to AI Predict to create your first prediction!</p>
                                    <ViewAllButton 
                                        onClick={() => navigate('/predict')} 
                                        style={{ marginTop: '1rem', borderColor: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' }}
                                    >
                                        Create Prediction<ChevronRight size={18} />
                                    </ViewAllButton>
                                </NoPredictions>
                            )}
                        </Panel>
                    </div>
                </ContentGrid>
            </ContentWrapper>
        </PageContainer>
    );
};

export default DashboardPage;