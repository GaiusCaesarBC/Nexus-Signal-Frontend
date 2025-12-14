// client/src/pages/PublicProfilePage.js - FULLY REVAMPED WITH REAL DATA & VAULT INTEGRATION

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Trophy, Award, Target, TrendingUp, TrendingDown,
    Calendar, DollarSign, Percent, BarChart3, Users, Eye,
    UserPlus, UserMinus, Settings, Share2, Flag, Check,
    Star, Flame, Crown, Zap, Activity, ArrowUpRight,
    ArrowDownRight, Lock, Globe, MessageSquare, AlertCircle,
    Briefcase, Clock, Medal, ChevronLeft, RefreshCw, Shield,
    Gift, Coins, Sparkles
} from 'lucide-react';
import AvatarWithBorder, { BORDER_STYLES } from '../components/vault/AvatarWithBorder';
import { useVault } from '../context/VaultContext';
import BadgeIcon from '../components/BadgeIcon';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ============ BADGE DEFINITIONS (synced with backend vaultItems.js) ============
const BADGE_DEFINITIONS = {
    'badge-founder': { name: 'Founder', icon: '👑', color: '#fbbf24', rarity: 'legendary' },
    'badge-first-trade': { name: 'First Trade', icon: '🎯', color: '#3b82f6', rarity: 'common' },
    'badge-week-warrior': { name: 'Week Warrior', icon: '⭐', color: '#f59e0b', rarity: 'common' },
    'badge-trade-master': { name: 'Trade Master', icon: '📊', color: '#3b82f6', rarity: 'rare' },
    'badge-portfolio-builder': { name: 'Portfolio Pro', icon: '🏗️', color: '#0ea5e9', rarity: 'rare' },
    'badge-profit-king': { name: 'Profit King', icon: '💰', color: '#10b981', rarity: 'epic' },
    'badge-dedicated': { name: 'Dedicated', icon: '🔥', color: '#ef4444', rarity: 'rare' },
    'badge-prediction-master': { name: 'Oracle', icon: '🔮', color: '#8b5cf6', rarity: 'epic' },
    'badge-level-50': { name: 'Half Century', icon: '5️⃣0️⃣', color: '#a855f7', rarity: 'epic' },
    'badge-whale': { name: 'Whale', icon: '🐋', color: '#8b5cf6', rarity: 'legendary' },
    'badge-level-100': { name: 'Centurion', icon: '💯', color: '#f59e0b', rarity: 'legendary' },
    'badge-millionaire': { name: 'Millionaire', icon: '💵', color: '#10b981', rarity: 'legendary' }
};

// ============ BORDER STYLES - Now imported from AvatarWithBorder for consistency ============
// BORDER_STYLES is imported from '../components/vault/AvatarWithBorder' which has all 25+ borders

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const legendaryPulse = keyframes`
    0%, 100% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.1); filter: brightness(1.2); }
`;

const borderRotate = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: #e0e6ed;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;

    @media (max-width: 768px) {
        padding-left: 1rem;
        padding-right: 1rem;
    }
`;

const TopBar = styled.div`
    max-width: 1400px;
    margin: 0 auto 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateX(-5px);
    }
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: none;
    border-radius: 8px;
    color: #0a0e27;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    svg {
        ${props => props.$loading && css`
            animation: ${spin} 1s linear infinite;
        `}
    }
`;

const ProfileHeader = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    padding: 2.5rem;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.8s ease-out;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #ffd700, #00adef, #ffd700);
        background-size: 200% 100%;
        animation: ${shimmer} 3s linear infinite;
    }

    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const UserInfoSection = styled.div`
    display: flex;
    gap: 2rem;
    align-items: start;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
        width: 100%;
    }
`;

const AvatarContainer = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const AvatarBorder = styled.div`
    width: 140px;
    height: 140px;
    border-radius: 24px;
    padding: 5px;
    background: ${props => {
        const border = BORDER_STYLES[props.$border] || BORDER_STYLES['border-bronze'];
        return border?.gradient || 'linear-gradient(135deg, #cd7f32, #b87333)';
    }};
    background-size: 200% 200%;
    box-shadow: ${props => {
        const border = BORDER_STYLES[props.$border] || BORDER_STYLES['border-bronze'];
        const glow = border?.glow || 'rgba(205, 127, 50, 0.5)';
        return `0 0 20px ${glow}`;
    }};
    animation: ${props => props.$animated ? css`${borderRotate} 3s ease infinite` : 'none'};
    
    ${props => props.$rank <= 3 && css`
        animation: ${glow} 3s ease-in-out infinite, ${borderRotate} 3s ease infinite;
    `}

    @media (max-width: 768px) {
        width: 120px;
        height: 120px;
    }
`;

const AvatarInner = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 20px;
    background: ${props => props.$src ? 
        `url(${props.$src}) center/cover` : 
        'linear-gradient(135deg, #1e293b, #0f172a)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.$src ? '0' : '3rem'};
    font-weight: 900;
    color: #ffd700;
    overflow: hidden;
`;

const RankBadge = styled.div`
    position: absolute;
    top: -8px;
    right: -8px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #e5a55d)';
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))';
    }};
    border: 3px solid #0a0e27;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$rank <= 3 ? '#0a0e27' : '#ffd700'};
    font-size: 0.85rem;
    font-weight: 900;
    animation: ${pulse} 2s ease-in-out infinite;
    z-index: 10;
`;

const LevelRing = styled.div`
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    border: 2px solid #0a0e27;
    z-index: 10;
`;

const LevelText = styled.span`
    font-size: 0.75rem;
    font-weight: 800;
    color: #0a0e27;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const UserDetails = styled.div`
    flex: 1;
    min-width: 0;
`;

const DisplayName = styled.h1`
    font-size: 2.2rem;
    font-weight: 900;
    color: #ffd700;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        font-size: 1.75rem;
        justify-content: center;
    }
`;

const TitleBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.75rem;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(138, 43, 226, 0.1));
    border: 1px solid rgba(138, 43, 226, 0.5);
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #a855f7;
`;

const EquippedBadgesRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.75rem 0;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const EquippedBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: ${props => props.$color ? `${props.$color}20` : 'rgba(100, 116, 139, 0.2)'};
    border: 2px solid ${props => props.$color || '#64748b'};
    border-radius: 10px;
    cursor: default;
    transition: all 0.2s ease;

    ${props => props.$legendary && css`
        animation: ${legendaryPulse} 2s ease-in-out infinite;
        box-shadow: 0 0 15px ${props.$color}50;
    `}

    &:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 15px ${props => props.$color || '#64748b'}40;
    }
`;

const BadgeIconWrapper = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const BadgeName = styled.span`
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.$color || '#e0e6ed'};
`;

const UserBio = styled.p`
    color: #94a3b8;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    max-width: 600px;

    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

const UserMeta = styled.div`
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    color: #64748b;
    font-size: 0.9rem;

    @media (max-width: 768px) {
        justify-content: center;
        gap: 1rem;
    }
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const ActionButton = styled.button`
    padding: 0.7rem 1.25rem;
    background: ${props => {
        if (props.$primary) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
        if (props.$danger) return 'rgba(239, 68, 68, 0.1)';
        return 'rgba(255, 215, 0, 0.1)';
    }};
    border: 1px solid ${props => {
        if (props.$primary) return 'transparent';
        if (props.$danger) return 'rgba(239, 68, 68, 0.3)';
        return 'rgba(255, 215, 0, 0.3)';
    }};
    border-radius: 12px;
    color: ${props => {
        if (props.$primary) return '#0a0e27';
        if (props.$danger) return '#ef4444';
        return '#ffd700';
    }};
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => {
            if (props.$primary) return 'rgba(255, 215, 0, 0.4)';
            if (props.$danger) return 'rgba(239, 68, 68, 0.3)';
            return 'rgba(255, 215, 0, 0.3)';
        }};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const StatBox = styled.div`
    text-align: center;
    padding: 1rem 0.75rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.15);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.1);
        transform: translateY(-3px);
        border-color: rgba(255, 215, 0, 0.3);
    }
`;

const StatLabel = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatValue = styled.div`
    font-size: 1.4rem;
    font-weight: 900;
    color: ${props => {
        if (props.$positive) return '#10b981';
        if (props.$negative) return '#ef4444';
        return '#ffd700';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
`;

// ============ TABS ============
const TabsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 0.5rem;
    border-bottom: 2px solid rgba(255, 215, 0, 0.2);
    overflow-x: auto;
    padding-bottom: 0.5rem;
`;

const Tab = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)' :
        'transparent'
    };
    border: none;
    border-bottom: 3px solid ${props => props.$active ? '#ffd700' : 'transparent'};
    color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        color: #ffd700;
    }
`;

const TabBadge = styled.span`
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
`;

// ============ CONTENT ============
const ContentContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const SectionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const CardTitle = styled.h3`
    color: #ffd700;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AchievementGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 0.75rem;
`;

const Achievement = styled.div`
    text-align: center;
    padding: 0.75rem 0.5rem;
    background: ${props => props.$earned ? 
        `linear-gradient(135deg, ${props.$color || 'rgba(255, 215, 0, 0.15)'}, transparent)` :
        'rgba(100, 116, 139, 0.1)'
    };
    border: 1px solid ${props => props.$earned ? 
        (props.$color || 'rgba(255, 215, 0, 0.3)') :
        'rgba(100, 116, 139, 0.2)'
    };
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: ${props => props.$earned ? 1 : 0.4};

    &:hover {
        transform: translateY(-3px);
    }
`;

const AchievementIcon = styled.div`
    font-size: 1.75rem;
    margin-bottom: 0.4rem;
`;

const AchievementName = styled.div`
    color: #e0e6ed;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.2;
`;

const AchievementXP = styled.div`
    color: #ffd700;
    font-size: 0.65rem;
    font-weight: 700;
    margin-top: 0.25rem;
`;

const ActivityFeed = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
`;

const ActivityItem = styled.div`
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 215, 0, 0.03);
    border: 1px solid rgba(255, 215, 0, 0.1);
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.08);
        transform: translateX(5px);
    }
`;

const ActivityIconWrapper = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$bg || 'rgba(255, 215, 0, 0.2)'};
    color: ${props => props.$color || '#ffd700'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1rem;
`;

const ActivityContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ActivityText = styled.div`
    color: #e0e6ed;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
`;

const ActivityTime = styled.div`
    color: #64748b;
    font-size: 0.75rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem 1rem;
    color: #64748b;
`;

const EmptyIcon = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffd700;
`;

// ============ PERFORMANCE CHART STYLES ============
const PerformanceCard = styled(Card)`
    grid-column: 1 / -1;
`;

const PerformanceGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ChartContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const ChartTitle = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1rem;
    text-align: center;
`;

const ChartWrapper = styled.div`
    width: 100%;
    height: 180px;
    position: relative;
`;

const ChartCenter = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
`;

const ChartCenterValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$color || '#ffd700'};
`;

const ChartCenterLabel = styled.div`
    font-size: 0.7rem;
    color: #64748b;
    text-transform: uppercase;
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
    font-size: 0.8rem;
    color: #94a3b8;
`;

const LegendDot = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$color};
`;

const StatBreakdown = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const BreakdownRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 215, 0, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 215, 0, 0.1);
`;

const BreakdownLabel = styled.span`
    color: #94a3b8;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const BreakdownValue = styled.span`
    font-weight: 700;
    font-size: 0.95rem;
    color: ${props => props.$color || '#e0e6ed'};
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
`;

const LoadingSpinner = styled(Trophy)`
    animation: ${spin} 1s linear infinite;
    color: #ffd700;
`;

const PrivateMessage = styled.div`
    max-width: 500px;
    margin: 4rem auto;
    text-align: center;
    padding: 2.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 16px;
`;

const PrivateIcon = styled.div`
    width: 70px;
    height: 70px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
`;

const PrivateTitle = styled.h2`
    color: #ef4444;
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
`;

const PrivateText = styled.p`
    color: #94a3b8;
    font-size: 1rem;
`;

// ============ HELPER FUNCTIONS ============
const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 30) return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
};

const getActivityIcon = (type) => {
    switch (type) {
        case 'achievement': return { icon: '🏆', bg: 'rgba(255, 215, 0, 0.2)', color: '#ffd700' };
        case 'trade': return { icon: '📈', bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
        case 'prediction': return { icon: '🔮', bg: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' };
        case 'level': return { icon: '⬆️', bg: 'rgba(0, 173, 237, 0.2)', color: '#00adef' };
        default: return { icon: '⭐', bg: 'rgba(255, 215, 0, 0.2)', color: '#ffd700' };
    }
};

// ============ COMPONENT ============
const PublicProfilePage = () => {
    const { username } = useParams();
    const { api, user: currentUser } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [activities, setActivities] = useState([]);

    const fetchProfile = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        
        try {
            const response = await api.get(`/social/profile/username/${username}`);
            setProfile(response.data);
            
            // Check if current user is following this profile
            if (currentUser && response.data.social?.followers) {
                const currentUserId = currentUser._id || currentUser.id;
                const isCurrentlyFollowing = response.data.social.followers.some(
                    follower => {
                        const followerId = follower._id || follower.id || follower;
                        return followerId === currentUserId || String(followerId) === String(currentUserId);
                    }
                );
                setIsFollowing(isCurrentlyFollowing);
            }

            // Also check via isFollowing field if provided by backend
            if (response.data.isFollowing !== undefined) {
                setIsFollowing(response.data.isFollowing);
            }

            // Build activity from achievements
            const achievementActivities = (response.data.achievements || [])
                .sort((a, b) => {
                    // Handle both earnedAt (User model) and unlockedAt (Gamification model)
                    const dateA = new Date(a.earnedAt || a.unlockedAt || 0);
                    const dateB = new Date(b.earnedAt || b.unlockedAt || 0);
                    return dateB - dateA;
                })
                .slice(0, 15)
                .map(ach => ({
                    id: ach.achievementId || ach.id,
                    type: 'achievement',
                    text: `Earned "${ach.name || ach.id}"`,
                    xp: ach.xpReward || ach.points || 0,
                    coins: ach.coinReward || 0,
                    time: ach.earnedAt || ach.unlockedAt,
                    icon: ach.icon || '🏆',
                    rarity: ach.rarity || 'common'
                }));

            setActivities(achievementActivities);
            
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 403) {
                setProfile({ private: true });
            } else if (error.response?.status === 404) {
                setProfile(null);
            } else if (!isRefresh) {
                toast.error('Failed to load profile');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, username, currentUser, toast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProfile(true);
    };

    const handleFollow = async () => {
        if (!profile?.userId && !profile?._id) return;
        
        const profileId = profile.userId || profile._id;
        const wasFollowing = isFollowing;
        
        setIsFollowing(!wasFollowing);
        setProfile(prev => ({
            ...prev,
            social: {
                ...prev.social,
                followersCount: Math.max(0, (prev.social?.followersCount || 0) + (wasFollowing ? -1 : 1))
            }
        }));
        
        setFollowLoading(true);
        try {
            await api.post(`/social/${wasFollowing ? 'unfollow' : 'follow'}/${profileId}`);
            toast.success(wasFollowing ? 'Unfollowed' : 'Following!');
        } catch (error) {
            setIsFollowing(wasFollowing);
            setProfile(prev => ({
                ...prev,
                social: {
                    ...prev.social,
                    followersCount: Math.max(0, (prev.social?.followersCount || 0) + (wasFollowing ? 1 : -1))
                }
            }));
            toast.error('Action failed');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied!');
    };

    // Extract data from profile - check multiple sources
    const equippedBadges = profile?.vault?.equippedBadges || [];
    const equippedBorder = profile?.vault?.equippedBorder || 'border-bronze';
    const userLevel = profile?.gamification?.level || 1;
    const userTitle = profile?.gamification?.title || profile?.gamification?.rank || 'Rookie Trader';
    const userXp = profile?.gamification?.totalXpEarned || profile?.gamification?.xp || 0;
    const achievements = profile?.achievements || [];
    
    // 🔥 FIXED: Merge stats from both profile.stats AND profile.gamification.stats
    const profileStats = profile?.stats || {};
    const gamificationStats = profile?.gamification?.stats || {};

    // 🔥 Paper trading stats
    const paperTradingStats = profile?.paperTrading || {};
    const paperTradingReturn = paperTradingStats.totalProfitLossPercent ?? 0;
    const paperTradingTrades = paperTradingStats.totalTrades ?? 0;

    // 🔥 Brokerage/Real portfolio stats
    const brokerageStats = profile?.brokerage || {};
    const hasRealPortfolio = brokerageStats.hasConnections || false;
    const realPortfolioReturn = brokerageStats.returnPercent ?? 0;

    const stats = {
        // Paper trading return
        paperTradingReturn: paperTradingReturn,
        paperTradingTrades: paperTradingTrades,

        // Real portfolio stats
        hasRealPortfolio: hasRealPortfolio,
        realPortfolioReturn: realPortfolioReturn,

        // Legacy return (for backwards compatibility)
        totalReturnPercent: profileStats.totalReturnPercent ?? gamificationStats.totalReturnPercent ?? 0,
        winRate: paperTradingStats.winRate ?? profileStats.winRate ?? gamificationStats.winRate ?? 0,
        totalTrades: paperTradingTrades || (profileStats.totalTrades ?? gamificationStats.totalTrades ?? 0),

        // Prediction stats - check both locations
        totalPredictions: profileStats.totalPredictions ?? gamificationStats.predictionsCreated ?? 0,
        predictionAccuracy: profileStats.predictionAccuracy ?? gamificationStats.predictionAccuracy ?? 0,

        // Streak - check multiple sources
        currentStreak: profileStats.currentStreak ||
                       profile?.gamification?.loginStreak ||
                       profile?.gamification?.profitStreak ||
                       profileStats.loginStreak ||
                       gamificationStats.profitStreak ||
                       0,

        // Rank - only if it's a real rank (> 0)
        rank: profileStats.rank > 0 ? profileStats.rank : null,

        // Best trade
        bestTrade: profileStats.bestTrade ?? gamificationStats.biggestWinPercent ?? 0
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner size={56} />
                    <div style={{ color: '#94a3b8' }}>Loading profile...</div>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (profile?.private) {
        return (
            <PageContainer>
                <TopBar>
                    <BackButton onClick={() => navigate('/leaderboard')}>
                        <ChevronLeft size={18} /> Back
                    </BackButton>
                </TopBar>
                <PrivateMessage>
                    <PrivateIcon><Lock size={32} /></PrivateIcon>
                    <PrivateTitle>Private Profile</PrivateTitle>
                    <PrivateText>This profile is private.</PrivateText>
                </PrivateMessage>
            </PageContainer>
        );
    }

    if (!profile) {
        return (
            <PageContainer>
                <TopBar>
                    <BackButton onClick={() => navigate('/leaderboard')}>
                        <ChevronLeft size={18} /> Back
                    </BackButton>
                </TopBar>
                <EmptyState>
                    <Trophy size={56} color="#ffd700" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ color: '#ffd700' }}>Profile Not Found</h2>
                </EmptyState>
            </PageContainer>
        );
    }

    const currentUserId = currentUser?._id || currentUser?.id;
    const profileUserId = profile.userId || profile._id;
    const isOwnProfile = currentUserId && profileUserId && (
        profileUserId === currentUserId || String(profileUserId) === String(currentUserId)
    );
    const isSpecialBorder = ['border-galaxy', 'border-rainbow', 'border-nexus'].includes(equippedBorder);

    return (
        <PageContainer>
            <TopBar>
                <BackButton onClick={() => navigate('/leaderboard')}>
                    <ChevronLeft size={18} /> Back to Leaderboard
                </BackButton>
                <RefreshButton onClick={handleRefresh} disabled={refreshing} $loading={refreshing}>
                    <RefreshCw size={16} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </RefreshButton>
            </TopBar>

            <ProfileHeader>
                <HeaderTop>
                    <UserInfoSection>
                        <AvatarContainer>
                            <AvatarBorder $border={equippedBorder} $rank={stats.rank} $animated={isSpecialBorder}>
                                <AvatarInner $src={profile.profile?.avatar}>
                                    {!profile.profile?.avatar && (profile.profile?.displayName?.charAt(0) || profile.username?.charAt(0) || 'T')}
                                </AvatarInner>
                            </AvatarBorder>
                            {/* Only show rank badge if rank is a valid positive number <= 100 */}
                            {stats.rank && stats.rank > 0 && stats.rank <= 100 && (
                                <RankBadge $rank={stats.rank}>#{stats.rank}</RankBadge>
                            )}
                            <LevelRing>
                                <LevelText><Star size={12} /> Lv.{userLevel}</LevelText>
                            </LevelRing>
                        </AvatarContainer>

                        <UserDetails>
                            <DisplayName>
                                {profile.profile?.displayName || profile.username || 'Trader'}
                                {stats.rank === 1 && <Crown size={28} color="#ffd700" />}
                                {profile.profile?.verified && <Check size={22} color="#10b981" />}
                            </DisplayName>
                            
                            <TitleBadge><Sparkles size={14} /> {userTitle}</TitleBadge>

                            {equippedBadges.length > 0 && (
    <EquippedBadgesRow>
        {equippedBadges.map(badgeId => {
            const badge = BADGE_DEFINITIONS[badgeId];
            return (
                <EquippedBadge key={badgeId} $color={badge?.color || '#64748b'} $legendary={badge?.rarity === 'legendary'}>
                    <BadgeIconWrapper>
                        <BadgeIcon badgeId={badgeId} size={24} showParticles={false} />
                    </BadgeIconWrapper>
                    <BadgeName $color={badge?.color || '#e0e6ed'}>{badge?.name || 'Badge'}</BadgeName>
                </EquippedBadge>
            );
        })}
    </EquippedBadgesRow>
)}

                            <UserBio>{profile.profile?.bio || 'This trader lets their results speak for themselves.'}</UserBio>
                            
                            <UserMeta>
                                <MetaItem><Calendar size={14} /> Joined {new Date(profile.date || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</MetaItem>
                                <MetaItem><Users size={14} /> {profile.social?.followersCount || 0} Followers</MetaItem>
                                <MetaItem><Eye size={14} /> {profile.social?.followingCount || 0} Following</MetaItem>
                                <MetaItem><Zap size={14} color="#ffd700" /> {userXp.toLocaleString()} XP</MetaItem>
                            </UserMeta>
                        </UserDetails>
                    </UserInfoSection>

                    <ActionButtons>
                        {isOwnProfile ? (
                            <>
                                <ActionButton $primary onClick={() => navigate('/settings')}><Settings size={16} /> Edit</ActionButton>
                                <ActionButton onClick={() => navigate('/vault')}><Gift size={16} /> Vault</ActionButton>
                                <ActionButton onClick={handleShare}><Share2 size={16} /> Share</ActionButton>
                            </>
                        ) : (
                            <>
                                <ActionButton $primary={!isFollowing} $danger={isFollowing} onClick={handleFollow} disabled={followLoading}>
                                    {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                    {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                                </ActionButton>
                                <ActionButton onClick={() => toast.info('Coming soon!')}><MessageSquare size={16} /> Message</ActionButton>
                                <ActionButton onClick={handleShare}><Share2 size={16} /> Share</ActionButton>
                            </>
                        )}
                    </ActionButtons>
                </HeaderTop>

                <StatsGrid>
                    <StatBox>
                        <StatLabel>Paper Return</StatLabel>
                        <StatValue $positive={(stats.paperTradingReturn || 0) >= 0} $negative={(stats.paperTradingReturn || 0) < 0}>
                            {(stats.paperTradingReturn || 0) >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            {(stats.paperTradingReturn || 0).toFixed(2)}%
                        </StatValue>
                    </StatBox>
                    {stats.hasRealPortfolio && (
                        <StatBox>
                            <StatLabel>Real Return</StatLabel>
                            <StatValue $positive={(stats.realPortfolioReturn || 0) >= 0} $negative={(stats.realPortfolioReturn || 0) < 0}>
                                {(stats.realPortfolioReturn || 0) >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                {(stats.realPortfolioReturn || 0).toFixed(2)}%
                            </StatValue>
                        </StatBox>
                    )}
                    <StatBox>
                        <StatLabel>Win Rate</StatLabel>
                        <StatValue>{(stats.winRate || 0).toFixed(1)}%</StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Trades</StatLabel>
                        <StatValue>{stats.totalTrades || 0}</StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Predictions</StatLabel>
                        <StatValue>{stats.totalPredictions || 0}</StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Accuracy</StatLabel>
                        <StatValue>{(stats.predictionAccuracy || 0).toFixed(1)}%</StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Streak</StatLabel>
                        <StatValue><Flame size={16} /> {stats.currentStreak || 0}</StatValue>
                    </StatBox>
                </StatsGrid>
            </ProfileHeader>

            <TabsContainer>
                <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}><BarChart3 size={16} /> Overview</Tab>
                <Tab $active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}><MessageSquare size={16} /> Posts <TabBadge>{profile?.postsCount || 0}</TabBadge></Tab>
                <Tab $active={activeTab === 'trades'} onClick={() => setActiveTab('trades')}><TrendingUp size={16} /> Trades</Tab>
                <Tab $active={activeTab === 'predictions'} onClick={() => navigate('/predict')}><Target size={16} /> Predictions <TabBadge>{stats.totalPredictions || 0}</TabBadge></Tab>
                <Tab $active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')}><Trophy size={16} /> Achievements <TabBadge>{achievements.length}</TabBadge></Tab>
            </TabsContainer>

            <ContentContainer>
                {activeTab === 'overview' && (
                    <SectionGrid>
                        {/* Performance Overview with Charts */}
                        <PerformanceCard>
                            <CardTitle><BarChart3 size={20} /> Performance Overview</CardTitle>
                            <PerformanceGrid>
                                {/* Win/Loss Pie Chart */}
                                <ChartContainer>
                                    <ChartTitle>Trading Record</ChartTitle>
                                    <ChartWrapper>
                                        {stats.totalTrades > 0 ? (
                                            <>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsPie>
                                                        <Pie
                                                            data={[
                                                                { name: 'Wins', value: Math.round(stats.totalTrades * (stats.winRate / 100)) || 0 },
                                                                { name: 'Losses', value: Math.round(stats.totalTrades * (1 - stats.winRate / 100)) || 0 }
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={70}
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                        >
                                                            <Cell fill="#10b981" />
                                                            <Cell fill="#ef4444" />
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px' }}
                                                            labelStyle={{ color: '#ffd700' }}
                                                        />
                                                    </RechartsPie>
                                                </ResponsiveContainer>
                                                <ChartCenter>
                                                    <ChartCenterValue $color={stats.winRate >= 50 ? '#10b981' : '#ef4444'}>
                                                        {(stats.winRate || 0).toFixed(0)}%
                                                    </ChartCenterValue>
                                                    <ChartCenterLabel>Win Rate</ChartCenterLabel>
                                                </ChartCenter>
                                            </>
                                        ) : (
                                            <ChartCenter style={{ position: 'relative', transform: 'none' }}>
                                                <EmptyIcon style={{ margin: '0 auto' }}><TrendingUp size={24} /></EmptyIcon>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No trades yet</div>
                                            </ChartCenter>
                                        )}
                                    </ChartWrapper>
                                    <ChartLegend>
                                        <LegendItem><LegendDot $color="#10b981" /> Wins</LegendItem>
                                        <LegendItem><LegendDot $color="#ef4444" /> Losses</LegendItem>
                                    </ChartLegend>
                                </ChartContainer>

                                {/* Prediction Accuracy Chart */}
                                <ChartContainer>
                                    <ChartTitle>Prediction Accuracy</ChartTitle>
                                    <ChartWrapper>
                                        {stats.totalPredictions > 0 ? (
                                            <>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsPie>
                                                        <Pie
                                                            data={[
                                                                { name: 'Correct', value: Math.round(stats.totalPredictions * (stats.predictionAccuracy / 100)) || 0 },
                                                                { name: 'Incorrect', value: Math.round(stats.totalPredictions * (1 - stats.predictionAccuracy / 100)) || 0 }
                                                            ]}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={70}
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                        >
                                                            <Cell fill="#8b5cf6" />
                                                            <Cell fill="#64748b" />
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px' }}
                                                            labelStyle={{ color: '#ffd700' }}
                                                        />
                                                    </RechartsPie>
                                                </ResponsiveContainer>
                                                <ChartCenter>
                                                    <ChartCenterValue $color="#8b5cf6">
                                                        {(stats.predictionAccuracy || 0).toFixed(0)}%
                                                    </ChartCenterValue>
                                                    <ChartCenterLabel>Accuracy</ChartCenterLabel>
                                                </ChartCenter>
                                            </>
                                        ) : (
                                            <ChartCenter style={{ position: 'relative', transform: 'none' }}>
                                                <EmptyIcon style={{ margin: '0 auto' }}><Target size={24} /></EmptyIcon>
                                                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No predictions yet</div>
                                            </ChartCenter>
                                        )}
                                    </ChartWrapper>
                                    <ChartLegend>
                                        <LegendItem><LegendDot $color="#8b5cf6" /> Correct</LegendItem>
                                        <LegendItem><LegendDot $color="#64748b" /> Incorrect</LegendItem>
                                    </ChartLegend>
                                </ChartContainer>

                                {/* Key Stats Breakdown */}
                                <ChartContainer>
                                    <ChartTitle>Key Statistics</ChartTitle>
                                    <StatBreakdown>
                                        <BreakdownRow>
                                            <BreakdownLabel><DollarSign size={16} color="#10b981" /> Paper Return</BreakdownLabel>
                                            <BreakdownValue $color={stats.paperTradingReturn >= 0 ? '#10b981' : '#ef4444'}>
                                                {stats.paperTradingReturn >= 0 ? '+' : ''}{(stats.paperTradingReturn || 0).toFixed(2)}%
                                            </BreakdownValue>
                                        </BreakdownRow>
                                        <BreakdownRow>
                                            <BreakdownLabel><TrendingUp size={16} color="#ffd700" /> Total Trades</BreakdownLabel>
                                            <BreakdownValue>{stats.totalTrades || 0}</BreakdownValue>
                                        </BreakdownRow>
                                        <BreakdownRow>
                                            <BreakdownLabel><Target size={16} color="#8b5cf6" /> Predictions Made</BreakdownLabel>
                                            <BreakdownValue>{stats.totalPredictions || 0}</BreakdownValue>
                                        </BreakdownRow>
                                        <BreakdownRow>
                                            <BreakdownLabel><Flame size={16} color="#f59e0b" /> Current Streak</BreakdownLabel>
                                            <BreakdownValue $color="#f59e0b">{stats.currentStreak || 0} days</BreakdownValue>
                                        </BreakdownRow>
                                        {stats.bestTrade > 0 && (
                                            <BreakdownRow>
                                                <BreakdownLabel><Award size={16} color="#10b981" /> Best Trade</BreakdownLabel>
                                                <BreakdownValue $color="#10b981">+{(stats.bestTrade || 0).toFixed(2)}%</BreakdownValue>
                                            </BreakdownRow>
                                        )}
                                    </StatBreakdown>
                                </ChartContainer>
                            </PerformanceGrid>
                        </PerformanceCard>

                        <Card>
                            <CardTitle><Trophy size={20} /> Recent Achievements</CardTitle>
                            {achievements.length > 0 ? (
                                <AchievementGrid>
                                    {achievements.slice(0, 8).map((ach, i) => {
                                        const achIcon = ach.icon || '🏆';
                                        const achName = ach.name || ach.id || 'Achievement';
                                        const achDesc = ach.description || '';
                                        const achXp = ach.xpReward || ach.points || 0;
                                        const achRarity = ach.rarity || 'common';
                                        
                                        const rarityColors = {
                                            common: 'rgba(148, 163, 184, 0.3)',
                                            rare: 'rgba(59, 130, 246, 0.3)',
                                            epic: 'rgba(168, 85, 247, 0.3)',
                                            legendary: 'rgba(255, 215, 0, 0.3)'
                                        };
                                        
                                        return (
                                            <Achievement 
                                                key={ach.achievementId || ach.id || i} 
                                                $earned 
                                                $color={rarityColors[achRarity]}
                                                title={achDesc}
                                            >
                                                <AchievementIcon>{achIcon}</AchievementIcon>
                                                <AchievementName>{achName}</AchievementName>
                                                {achXp > 0 && <AchievementXP>+{achXp} XP</AchievementXP>}
                                            </Achievement>
                                        );
                                    })}
                                </AchievementGrid>
                            ) : (
                                <EmptyState><EmptyIcon><Trophy size={28} /></EmptyIcon><div>No achievements yet</div></EmptyState>
                            )}
                        </Card>

                        <Card>
                            <CardTitle><Activity size={20} /> Recent Activity</CardTitle>
                            {activities.length > 0 ? (
                                <ActivityFeed>
                                    {activities.slice(0, 6).map((act, i) => {
                                        const style = getActivityIcon(act.type);
                                        return (
                                            <ActivityItem key={act.id || i}>
                                                <ActivityIconWrapper $bg={style.bg}>{act.icon || style.icon}</ActivityIconWrapper>
                                                <ActivityContent>
                                                    <ActivityText>{act.text}</ActivityText>
                                                    <ActivityTime>{formatTimeAgo(act.time)}{act.xp > 0 && ` • +${act.xp} XP`}</ActivityTime>
                                                </ActivityContent>
                                            </ActivityItem>
                                        );
                                    })}
                                </ActivityFeed>
                            ) : (
                                <EmptyState><EmptyIcon><Activity size={28} /></EmptyIcon><div>No activity yet</div></EmptyState>
                            )}
                        </Card>
                    </SectionGrid>
                )}

                {activeTab === 'achievements' && (
                    <Card>
                        <CardTitle><Trophy size={20} /> All Achievements ({achievements.length})</CardTitle>
                        {achievements.length > 0 ? (
                            <AchievementGrid>
                                {achievements.map((ach, i) => {
                                    // Handle both achievement formats (from User model or Gamification model)
                                    const achIcon = ach.icon || '🏆';
                                    const achName = ach.name || ach.id || 'Achievement';
                                    const achDesc = ach.description || '';
                                    const achXp = ach.xpReward || ach.points || 0;
                                    const achRarity = ach.rarity || 'common';
                                    
                                    // Color by rarity
                                    const rarityColors = {
                                        common: 'rgba(148, 163, 184, 0.3)',
                                        rare: 'rgba(59, 130, 246, 0.3)',
                                        epic: 'rgba(168, 85, 247, 0.3)',
                                        legendary: 'rgba(255, 215, 0, 0.3)'
                                    };
                                    
                                    return (
                                        <Achievement 
                                            key={ach.achievementId || ach.id || i} 
                                            $earned 
                                            $color={rarityColors[achRarity]}
                                            title={achDesc}
                                        >
                                            <AchievementIcon>{achIcon}</AchievementIcon>
                                            <AchievementName>{achName}</AchievementName>
                                            {achXp > 0 && <AchievementXP>+{achXp} XP</AchievementXP>}
                                        </Achievement>
                                    );
                                })}
                            </AchievementGrid>
                        ) : (
                            <EmptyState><EmptyIcon><Trophy size={28} /></EmptyIcon><div>No achievements earned yet</div></EmptyState>
                        )}
                    </Card>
                )}

                {activeTab === 'activity' && (
                    <Card>
                        <CardTitle><Activity size={20} /> Activity Feed</CardTitle>
                        {activities.length > 0 ? (
                            <ActivityFeed>
                                {activities.map((act, i) => {
                                    const style = getActivityIcon(act.type);
                                    return (
                                        <ActivityItem key={act.id || i}>
                                            <ActivityIconWrapper $bg={style.bg}>{act.icon || style.icon}</ActivityIconWrapper>
                                            <ActivityContent>
                                                <ActivityText>{act.text}</ActivityText>
                                                <ActivityTime>{formatTimeAgo(act.time)}{act.xp > 0 && ` • +${act.xp} XP`}{act.coins > 0 && ` • +${act.coins} 🪙`}</ActivityTime>
                                            </ActivityContent>
                                        </ActivityItem>
                                    );
                                })}
                            </ActivityFeed>
                        ) : (
                            <EmptyState><EmptyIcon><Activity size={28} /></EmptyIcon><div>No activity to display</div></EmptyState>
                        )}
                    </Card>
                )}

                {activeTab === 'trades' && (
                    <Card>
                        <CardTitle><TrendingUp size={20} /> Trading History</CardTitle>
                        <PerformanceGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                            <StatBreakdown>
                                <BreakdownRow>
                                    <BreakdownLabel><DollarSign size={16} color="#10b981" /> Paper Return</BreakdownLabel>
                                    <BreakdownValue $color={stats.paperTradingReturn >= 0 ? '#10b981' : '#ef4444'}>
                                        {stats.paperTradingReturn >= 0 ? '+' : ''}{(stats.paperTradingReturn || 0).toFixed(2)}%
                                    </BreakdownValue>
                                </BreakdownRow>
                                <BreakdownRow>
                                    <BreakdownLabel><TrendingUp size={16} color="#ffd700" /> Total Trades</BreakdownLabel>
                                    <BreakdownValue>{stats.totalTrades || 0}</BreakdownValue>
                                </BreakdownRow>
                                <BreakdownRow>
                                    <BreakdownLabel><Percent size={16} color="#00adef" /> Win Rate</BreakdownLabel>
                                    <BreakdownValue $color={stats.winRate >= 50 ? '#10b981' : '#ef4444'}>
                                        {(stats.winRate || 0).toFixed(1)}%
                                    </BreakdownValue>
                                </BreakdownRow>
                                {stats.bestTrade > 0 && (
                                    <BreakdownRow>
                                        <BreakdownLabel><Award size={16} color="#10b981" /> Best Trade</BreakdownLabel>
                                        <BreakdownValue $color="#10b981">+{(stats.bestTrade || 0).toFixed(2)}%</BreakdownValue>
                                    </BreakdownRow>
                                )}
                            </StatBreakdown>
                            <ChartContainer>
                                <ChartTitle>Win/Loss Distribution</ChartTitle>
                                <ChartWrapper>
                                    {stats.totalTrades > 0 ? (
                                        <>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPie>
                                                    <Pie
                                                        data={[
                                                            { name: 'Wins', value: Math.round(stats.totalTrades * (stats.winRate / 100)) || 0 },
                                                            { name: 'Losses', value: Math.round(stats.totalTrades * (1 - stats.winRate / 100)) || 0 }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                    >
                                                        <Cell fill="#10b981" />
                                                        <Cell fill="#ef4444" />
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '8px' }}
                                                        labelStyle={{ color: '#ffd700' }}
                                                    />
                                                </RechartsPie>
                                            </ResponsiveContainer>
                                            <ChartCenter>
                                                <ChartCenterValue>{stats.totalTrades}</ChartCenterValue>
                                                <ChartCenterLabel>Trades</ChartCenterLabel>
                                            </ChartCenter>
                                        </>
                                    ) : (
                                        <ChartCenter style={{ position: 'relative', transform: 'none' }}>
                                            <EmptyIcon style={{ margin: '0 auto' }}><TrendingUp size={24} /></EmptyIcon>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No trades yet</div>
                                        </ChartCenter>
                                    )}
                                </ChartWrapper>
                            </ChartContainer>
                        </PerformanceGrid>
                    </Card>
                )}

                {activeTab === 'posts' && (
                    <Card>
                        <CardTitle><MessageSquare size={20} /> Posts ({profile?.postsCount || 0})</CardTitle>
                        <EmptyState>
                            <EmptyIcon><MessageSquare size={28} /></EmptyIcon>
                            <div>Posts will appear here</div>
                            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                Share predictions and insights in the Social Feed
                            </div>
                        </EmptyState>
                    </Card>
                )}
            </ContentContainer>
        </PageContainer>
    );
};

export default PublicProfilePage;
