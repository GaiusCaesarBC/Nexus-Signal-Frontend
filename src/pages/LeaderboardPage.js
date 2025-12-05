// client/src/pages/LeaderboardPage.js - THEMED LEADERBOARD WITH AVATAR BORDERS 🏆

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { useVault } from '../context/VaultContext';
import {
    Trophy, Medal, Award, Crown, TrendingUp, TrendingDown,
    User, Users, Eye, Target, BarChart3, Flame, Star,
    ChevronUp, ChevronDown, Search, Filter, Share2,
    UserPlus, UserMinus, Check, X, Globe, Lock,
    Zap, Activity, DollarSign, Percent, ArrowUpRight,
    ArrowDownRight, ExternalLink, RefreshCw, Settings,
    Calendar, Clock, Copy, Sparkles, Shield, Rocket,
    Brain, TrendingUp as Trending, Gift, Heart, Wifi, WifiOff
} from 'lucide-react';
import AvatarWithBorder, { BORDER_STYLES } from '../components/vault/AvatarWithBorder';
import { BadgeList } from '../components/BadgeDisplay';


// ============ BORDER COLORS MAP (for Avatar Frames) ============
// Synced with vaultItems.js - uses primary color from each border's gradient
const BORDER_COLORS = {
    // ===== BASIC BORDERS =====
    'border-bronze': { color: '#CD7F32', glow: 'rgba(205, 127, 50, 0.5)' },
    'border-silver': { color: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.5)' },
    'border-gold': { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' },
    'border-emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
    'border-ruby': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },
    'border-platinum': { color: '#E5E4E2', glow: 'rgba(229, 228, 226, 0.7)' },
    'border-sapphire': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.7)' },
    'border-amethyst': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)' },
    'border-diamond': { color: '#00D4FF', glow: 'rgba(0, 212, 255, 0.8)' },
    'border-rainbow': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.9)' },
    'border-nexus': { color: '#00adef', glow: 'rgba(0, 173, 237, 1)' },
    // ===== EPIC BORDERS =====
    'border-crimson-blade': { color: '#dc2626', glow: 'rgba(220, 38, 38, 0.7)' },
    'border-tsunami': { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.7)' },
    'border-ancient-oak': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.7)' },
    'border-phantom': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.7)' },
    'border-toxic-haze': { color: '#84cc16', glow: 'rgba(132, 204, 22, 0.8)' },
    'border-mystic-runes': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)' },
    // ===== LEGENDARY BORDERS =====
    'border-inferno-crown': { color: '#f97316', glow: 'rgba(249, 115, 22, 0.9)' },
    'border-lightning-fury': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.9)' },
    'border-void-portal': { color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.9)' },
    'border-deaths-embrace': { color: '#4b5563', glow: 'rgba(75, 85, 99, 0.9)' },
    'border-dragon-wrath': { color: '#dc2626', glow: 'rgba(220, 38, 38, 1)' },
    'border-frozen-eternity': { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)' },
    'border-cosmic-destroyer': { color: '#6366f1', glow: 'rgba(99, 102, 241, 1)' },
    'border-blood-moon': { color: '#dc2626', glow: 'rgba(220, 38, 38, 0.95)' },
    'border-quantum-rift': { color: '#d946ef', glow: 'rgba(217, 70, 239, 0.9)' },
    'border-divine-ascension': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 1)' },
    'border-abyssal-terror': { color: '#0891b2', glow: 'rgba(8, 145, 178, 0.9)' },
    'border-supernova-core': { color: '#f97316', glow: 'rgba(249, 115, 22, 1)' },
    'border-all-seeing-eye': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.95)' },
    'border-prismatic-fury': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 1)' },
    'border-apex-predator': { color: '#dc2626', glow: 'rgba(220, 38, 38, 1)' },
    // ===== MYTHIC BORDERS =====
    'border-reality-shatter': { color: '#ec4899', glow: 'rgba(236, 72, 153, 1)' },
    'border-eternal-sovereign': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 1)' },
    // ===== ORIGIN BORDER =====
    'border-architects-ring': { color: '#d4af37', glow: 'rgba(212, 175, 55, 1)' },
    // Default fallback
    'default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' }
};

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const slideUp = keyframes`
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { 
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
    }
    50% { 
        filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.6));
    }
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
    50% { transform: translateY(-10px); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
`;

const crownFloat = keyframes`
    0%, 100% { transform: translateY(0) rotate(-5deg); }
    50% { transform: translateY(-8px) rotate(5deg); }
`;

const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 100px;
    background: transparent;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
    z-index: 1;
`;

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
    opacity: 0.3;
    animation: ${float} ${props => props.$duration || '20s'} ease-in-out infinite;
    
    &:nth-child(1) {
        width: 400px;
        height: 400px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.primary || '#ffd700'}66 0%, transparent 70%)`};
        top: 10%;
        left: -100px;
    }
    
    &:nth-child(2) {
        width: 300px;
        height: 300px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.accent || '#8b5cf6'}66 0%, transparent 70%)`};
        top: 50%;
        right: -50px;
        animation-delay: -5s;
    }
    
    &:nth-child(3) {
        width: 350px;
        height: 350px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.success || '#10b981'}4D 0%, transparent 70%)`};
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
    position: relative;
    z-index: 1;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    animation: ${glow} 2s ease-in-out infinite;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const StatsBar = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
`;

const StatBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}33 0%, ${theme.brand?.primary || '#ffd700'}1A 100%)`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#ffd700'}66`};
    border-radius: 20px;
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-weight: 600;
`;

const LiveIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${({ $connected, theme }) => $connected ? 
        `linear-gradient(135deg, ${theme.success || '#10b981'}33 0%, ${theme.success || '#10b981'}1A 100%)` :
        `linear-gradient(135deg, ${theme.error || '#ef4444'}33 0%, ${theme.error || '#ef4444'}1A 100%)`
    };
    border: 1px solid ${({ $connected, theme }) => $connected ? 
        `${theme.success || '#10b981'}66` :
        `${theme.error || '#ef4444'}66`
    };
    border-radius: 20px;
    color: ${({ $connected, theme }) => $connected ? theme.success || '#10b981' : theme.error || '#ef4444'};
    font-weight: 600;
`;

const LiveDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $connected, theme }) => $connected ? theme.success || '#10b981' : theme.error || '#ef4444'};
    animation: ${props => props.$connected ? css`${blink} 1.5s ease-in-out infinite` : 'none'};
`;

const LastUpdated = styled.span`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    margin-left: 0.5rem;
`;

const BadgesRow = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
`;

// ============ PODIUM SECTION ============
const PodiumSection = styled.div`
    max-width: 900px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 1s ease-out;
    position: relative;
    z-index: 1;
`;

const PodiumContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 1rem;
    padding: 2rem 1rem;
    position: relative;

    @media (max-width: 768px) {
        gap: 0.5rem;
        padding: 1rem 0.5rem;
    }
`;

const PodiumPlace = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-10px);
    }
`;

const PodiumAvatar = styled.div`
    width: ${props => props.$place === 1 ? '120px' : '100px'};
    height: ${props => props.$place === 1 ? '120px' : '100px'};
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : 
        props.$place === 1 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' :
        props.$place === 2 ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)' :
        'linear-gradient(135deg, #cd7f32, #e5a55d)'
    };
    border: 4px solid ${props => props.$borderColor || (
        props.$place === 1 ? '#ffd700' :
        props.$place === 2 ? '#c0c0c0' :
        '#cd7f32'
    )};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    box-shadow: ${props => props.$glow ? 
        `0 10px 40px ${props.$glow}, 0 0 20px ${props.$glow}` :
        `0 10px 40px ${
            props.$place === 1 ? 'rgba(255, 215, 0, 0.5)' :
            props.$place === 2 ? 'rgba(192, 192, 192, 0.5)' :
            'rgba(205, 127, 50, 0.5)'
        }`
    };
    animation: ${props => props.$place === 1 ? css`${bounce} 2s ease-in-out infinite` : 'none'};
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        width: ${props => props.$place === 1 ? '90px' : '70px'};
        height: ${props => props.$place === 1 ? '90px' : '70px'};
    }
`;

const PodiumAvatarWrapper = styled.div`
    position: relative;
    margin-bottom: 1rem;

    ${props => props.$isFirst && css`
        /* Extra glow for 1st place */
    `}
`;

const PodiumAvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
`;

const PodiumAvatarInitials = styled.div`
    font-size: ${props => props.$place === 1 ? '2.5rem' : '2rem'};
    font-weight: 900;
    color: #0a0e27;

    @media (max-width: 768px) {
        font-size: ${props => props.$place === 1 ? '1.8rem' : '1.5rem'};
    }
`;

const PodiumCrown = styled.div`
    position: absolute;
    top: -25px;
    animation: ${crownFloat} 2s ease-in-out infinite;
`;

const PodiumName = styled.div`
    font-size: ${props => props.$place === 1 ? '1.3rem' : '1.1rem'};
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    text-align: center;
    margin-bottom: 0.5rem;
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 768px) {
        font-size: ${props => props.$place === 1 ? '1rem' : '0.9rem'};
        max-width: 100px;
    }
`;

const PodiumStats = styled.div`
    font-size: 0.9rem;
    color: ${props => 
        props.$place === 1 ? '#ffd700' :
        props.$place === 2 ? '#c0c0c0' :
        '#cd7f32'
    };
    font-weight: 600;
    margin-bottom: 0.5rem;
`;

const PodiumStand = styled.div`
    width: ${props => props.$place === 1 ? '160px' : '140px'};
    height: ${props => 
        props.$place === 1 ? '140px' :
        props.$place === 2 ? '100px' :
        '70px'
    };
    background: ${props => 
        props.$place === 1 ? 'linear-gradient(180deg, #ffd700 0%, #b8860b 100%)' :
        props.$place === 2 ? 'linear-gradient(180deg, #c0c0c0 0%, #808080 100%)' :
        'linear-gradient(180deg, #cd7f32 0%, #8b4513 100%)'
    };
    border-radius: 12px 12px 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: 900;
    color: rgba(0, 0, 0, 0.3);
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: ${slideUp} 0.8s ease-out;
    animation-delay: ${props => 
        props.$place === 1 ? '0.2s' :
        props.$place === 2 ? '0.4s' :
        '0.6s'
    };
    animation-fill-mode: backwards;

    @media (max-width: 768px) {
        width: ${props => props.$place === 1 ? '110px' : '90px'};
        height: ${props => 
            props.$place === 1 ? '100px' :
            props.$place === 2 ? '70px' :
            '50px'
        };
        font-size: 2rem;
    }
`;

const PodiumRank = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

// ============ YOUR RANK CARD ============
const YourRankCard = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}33 0%, ${theme.brand?.accent || '#8b5cf6'}0D 100%)`};
    border: 2px solid ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}80`};
    border-radius: 16px;
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
`;

const YourRankLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;

const YourRankBadge = styled.div`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}, ${theme.brand?.accent || '#6d28d9'})`};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
    border: 3px solid ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}80`};
    box-shadow: ${({ theme }) => `0 0 30px ${theme.brand?.accent || '#8b5cf6'}80`};
`;

const YourRankInfo = styled.div``;

const YourRankLabel = styled.div`
    color: ${({ theme }) => theme.brand?.accent || '#a78bfa'};
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
`;

const YourRankValue = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const YourRankStats = styled.div`
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
`;

const YourRankStat = styled.div`
    text-align: center;
`;

const YourRankStatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.brand?.accent || '#a78bfa'};
`;

const YourRankStatLabel = styled.div`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
`;

const ClimbButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'} 0%, ${theme.brand?.accent || '#6d28d9'} 100%)`};
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => `0 10px 30px ${theme.brand?.accent || '#8b5cf6'}80`};
    }
`;

// ============ CATEGORY TABS ============
const CategoryTabsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 1.5rem;
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
`;

const CategoryTab = styled.button`
    padding: 0.6rem 1.2rem;
    background: ${({ $active, theme }) => $active ? 
        `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}4D 0%, ${theme.brand?.primary || '#ffd700'}26 100%)` :
        theme.bg?.card || 'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#ffd700'}80` : 
        theme.border?.primary || 'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 10px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#ffd700' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}4D 0%, ${theme.brand?.primary || '#ffd700'}26 100%)`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
        transform: translateY(-2px);
    }
`;

const ToggleContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    animation: ${fadeIn} 0.6s ease-out 0.4s both;
`;

const ToggleButton = styled.button`
    padding: 1.25rem 2.5rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme?.brand?.primary || '#ffd700'} 0%, ${props.theme?.brand?.accent || '#ffed4e'} 100%)` :
        'rgba(30, 41, 59, 0.6)'
    };
    border: 2px solid ${props => props.$active ? 
        `${props.theme?.brand?.primary || '#ffd700'}` :
        'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 16px;
    color: ${props => props.$active ? '#0a0e27' : (props.theme?.text?.secondary || '#94a3b8')};
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;

    ${props => props.$active && css`
        box-shadow: 0 8px 30px ${props.theme?.brand?.primary || '#ffd700'}66;
    `}

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.$active ? 
            `${props.theme?.brand?.primary || '#ffd700'}66` :
            'rgba(0, 0, 0, 0.2)'
        };
    }

    @media (max-width: 768px) {
        padding: 1rem 1.5rem;
        font-size: 0.95rem;
    }
`;

// ============ TIME PERIOD TABS ============
const TimePeriodContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
`;

const TimePeriodTab = styled.button`
    padding: 0.5rem 1rem;
    background: ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#ffd700'}33` :
        `${theme.brand?.primary || '#ffd700'}0D`
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#ffd700'}80` :
        `${theme.brand?.primary || '#ffd700'}33`
    };
    border-radius: 8px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#ffd700' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}33`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    }
`;

// ============ CONTROLS ============
const ControlsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
`;

const SearchBar = styled.div`
    flex: 1;
    min-width: 250px;
    position: relative;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(255, 215, 0, 0.05)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#ffd700'}4D`};
    border-radius: 12px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}1A`};
        box-shadow: ${({ theme }) => `0 0 0 3px ${theme.brand?.primary || '#ffd700'}33`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
`;

const RefreshButton = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'};
    border: none;
    border-radius: 12px;
    color: ${({ theme }) => theme.bg?.page || '#0a0e27'};
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => `0 8px 24px ${theme.brand?.primary || '#ffd700'}66`};
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

const AutoRefreshToggle = styled.button`
    padding: 0.75rem 1rem;
    background: ${({ $active, theme }) => $active ? 
        `${theme.success || '#10b981'}33` : 
        `${theme.text?.tertiary || '#64748b'}33`
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.success || '#10b981'}80` : 
        `${theme.text?.tertiary || '#64748b'}4D`
    };
    border-radius: 12px;
    color: ${({ $active, theme }) => $active ? theme.success || '#10b981' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.success || '#10b981'}4D`};
        border-color: ${({ theme }) => `${theme.success || '#10b981'}80`};
        color: ${({ theme }) => theme.success || '#10b981'};
    }
`;

// ============ LEADERBOARD ============
const LeaderboardContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const LeaderboardHeader = styled.div`
    display: grid;
    grid-template-columns: 80px 60px 1fr 120px 120px 120px 140px;
    gap: 1.5rem;
    padding: 1rem 1.5rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}1A`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#ffd700'}33`};
    border-radius: 12px;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    @media (max-width: 1200px) {
        display: none;
    }
`;

const LeaderboardList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const LeaderCard = styled.div`
    background: ${({ $rank, $isYou, theme }) => {
        if ($rank === 1) return `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}26 0%, ${theme.brand?.primary || '#ffd700'}0D 100%)`;
        if ($rank === 2) return 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)';
        if ($rank === 3) return 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)';
        if ($isYou) return `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}26 0%, ${theme.brand?.accent || '#8b5cf6'}0D 100%)`;
        return theme.bg?.card || 'rgba(30, 41, 59, 0.9)';
    }};
    backdrop-filter: blur(10px);
    border: 2px solid ${({ $rank, $isYou, theme }) => {
        if ($rank === 1) return `${theme.brand?.primary || '#ffd700'}66`;
        if ($rank === 2) return 'rgba(192, 192, 192, 0.4)';
        if ($rank === 3) return 'rgba(205, 127, 50, 0.4)';
        if ($isYou) return `${theme.brand?.accent || '#8b5cf6'}66`;
        return theme.border?.primary || 'rgba(255, 215, 0, 0.15)';
    }};
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    display: grid;
    grid-template-columns: 80px 60px 1fr 120px 120px 120px 140px;
    gap: 1.5rem;
    align-items: center;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.5s ease-out;
    animation-delay: ${props => props.$index * 0.03}s;
    animation-fill-mode: backwards;
    cursor: pointer;

    &:hover {
        transform: translateX(8px);
        border-color: ${({ $rank, $isYou, theme }) => {
            if ($rank === 1) return theme.brand?.primary || '#ffd700';
            if ($rank === 2) return 'rgba(192, 192, 192, 0.8)';
            if ($rank === 3) return 'rgba(205, 127, 50, 0.8)';
            if ($isYou) return theme.brand?.accent || '#8b5cf6';
            return `${theme.brand?.primary || '#ffd700'}80`;
        }};
        box-shadow: ${({ $rank, $isYou, theme }) => {
            if ($rank === 1) return `0 8px 30px ${theme.brand?.primary || '#ffd700'}4D`;
            if ($rank === 2) return '0 8px 30px rgba(192, 192, 192, 0.3)';
            if ($rank === 3) return '0 8px 30px rgba(205, 127, 50, 0.3)';
            if ($isYou) return `0 8px 30px ${theme.brand?.accent || '#8b5cf6'}4D`;
            return `0 8px 30px ${theme.brand?.primary || '#ffd700'}26`;
        }};
    }

    @media (max-width: 1200px) {
        grid-template-columns: 60px 50px 1fr 100px 100px;
        gap: 1rem;
        
        & > div:nth-child(6) {
            display: none;
        }
    }

    @media (max-width: 768px) {
        grid-template-columns: 50px 45px 1fr 80px;
        gap: 0.75rem;
        padding: 1rem;
        
        & > div:nth-child(5),
        & > div:nth-child(6) {
            display: none;
        }
    }
`;

const RankBadge = styled.div`
    width: 55px;
    height: 55px;
    border-radius: 50%;
    background: ${({ $rank, theme }) => {
        if ($rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if ($rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if ($rank === 3) return 'linear-gradient(135deg, #cd7f32, #e5a55d)';
        return `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}33, ${theme.brand?.primary || '#ffd700'}1A)`;
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    font-weight: 900;
    color: ${({ $rank, theme }) => $rank <= 3 ? '#0a0e27' : theme.brand?.primary || '#ffd700'};
    border: 3px solid ${({ $rank, theme }) => {
        if ($rank === 1) return '#ffd700';
        if ($rank === 2) return '#c0c0c0';
        if ($rank === 3) return '#cd7f32';
        return `${theme.brand?.primary || '#ffd700'}4D`;
    }};
    position: relative;
    flex-shrink: 0;

    ${props => props.$rank === 1 && css`
        animation: ${pulse} 2s ease-in-out infinite;
    `}

    @media (max-width: 768px) {
        width: 45px;
        height: 45px;
        font-size: 1.1rem;
    }
`;

const RankIcon = styled.div`
    position: absolute;
    top: -8px;
    right: -8px;
`;

const Avatar = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #ffd700, #ffed4e)'};
    border: 3px solid ${props => props.$borderColor || 'rgba(255, 215, 0, 0.5)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0e27;
    font-weight: 900;
    font-size: 1.2rem;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: ${props => props.$glow ? `0 0 15px ${props.$glow}` : 'none'};
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: ${props => `0 0 20px ${props.$glow || 'rgba(255, 215, 0, 0.5)'}`};
    }

    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
        font-size: 1rem;
    }
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
`;

const AvatarInitials = styled.div`
    position: relative;
    z-index: 0;
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
`;

const DisplayName = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const LevelBadge = styled.span`
    padding: 0.15rem 0.5rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}4D, ${theme.brand?.accent || '#8b5cf6'}1A)`};
    border: 1px solid ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}80`};
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    color: ${({ theme }) => theme.brand?.accent || '#a78bfa'};
`;

const UserMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: ${({ theme }) => theme.text?.tertiary || '#94a3b8'};
    font-size: 0.85rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        font-size: 0.8rem;
        gap: 0.5rem;
    }
`;

const StreakBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    background: ${({ theme }) => `${theme.error || '#ef4444'}26`};
    border: 1px solid ${({ theme }) => `${theme.error || '#ef4444'}66`};
    border-radius: 6px;
    color: ${({ theme }) => theme.error || '#ef4444'};
    font-size: 0.75rem;
    font-weight: 600;
`;

const StatColumn = styled.div`
    text-align: center;
`;

const StatLabel = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    margin-bottom: 0.2rem;
    text-transform: uppercase;
`;

const StatValue = styled.div`
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ $positive, $negative, theme }) => {
        if ($positive) return theme.success || '#10b981';
        if ($negative) return theme.error || '#ef4444';
        return theme.brand?.primary || '#ffd700';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const FollowButton = styled.button`
    padding: 0.6rem 1rem;
    background: ${({ $following, theme }) => $following ? 
        `${theme.error || '#ef4444'}1A` :
        theme.brand?.gradient || 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
    };
    border: 1px solid ${({ $following, theme }) => $following ? 
        `${theme.error || '#ef4444'}4D` :
        'transparent'
    };
    border-radius: 8px;
    color: ${({ $following, theme }) => $following ? theme.error || '#ef4444' : theme.bg?.page || '#0a0e27'};
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    transition: all 0.2s ease;
    white-space: nowrap;
    opacity: ${props => props.$loading ? 0.7 : 1};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${({ $following, theme }) => $following ? 
            `0 6px 16px ${theme.error || '#ef4444'}4D` :
            `0 6px 16px ${theme.brand?.primary || '#ffd700'}66`
        };
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
    }
`;

const CopyButton = styled.button`
    padding: 0.6rem;
    background: ${({ theme }) => `${theme.success || '#10b981'}1A`};
    border: 1px solid ${({ theme }) => `${theme.success || '#10b981'}4D`};
    border-radius: 8px;
    color: ${({ theme }) => theme.success || '#10b981'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.success || '#10b981'}33`};
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

// ============ EMPTY & LOADING STATES ============
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
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}33 0%, ${theme.brand?.primary || '#ffd700'}0D 100%)`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${({ theme }) => `${theme.brand?.primary || '#ffd700'}66`};
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
    position: relative;
    z-index: 1;
`;

const LoadingSpinner = styled(Trophy)`
    animation: ${spin} 1s linear infinite;
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
`;

const LoadingText = styled.div`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
`;

const SkeletonCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${({ theme }) => theme.border?.primary || 'rgba(255, 215, 0, 0.15)'};
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    display: grid;
    grid-template-columns: 80px 60px 1fr 120px 120px 120px 140px;
    gap: 1.5rem;
    align-items: center;
    animation: ${shimmer} 1.5s ease-in-out infinite;
    background-size: 200% 100%;
    background-image: ${({ theme }) => `linear-gradient(
        90deg,
        ${theme.bg?.card || 'rgba(30, 41, 59, 0.9)'} 0%,
        ${theme.bg?.cardHover || 'rgba(50, 61, 79, 0.9)'} 50%,
        ${theme.bg?.card || 'rgba(30, 41, 59, 0.9)'} 100%
    )`};

    @media (max-width: 1200px) {
        grid-template-columns: 60px 50px 1fr 100px 100px;
    }

    @media (max-width: 768px) {
        grid-template-columns: 50px 45px 1fr 80px;
    }
`;

const SkeletonCircle = styled.div`
    width: ${props => props.$size || '50px'};
    height: ${props => props.$size || '50px'};
    border-radius: 50%;
    background: ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
`;

const SkeletonLine = styled.div`
    height: ${props => props.$height || '16px'};
    width: ${props => props.$width || '100%'};
    border-radius: 4px;
    background: ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
`;

// ============ CONSTANTS ============
const REFRESH_INTERVAL = 30000;
const DEBOUNCE_DELAY = 300;

// ============ COMPONENT ============
const LeaderboardPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const theme = useStyledTheme();
    const { profileThemeId } = useThemeContext();
    const { equipped } = useVault();
    const [activeTab, setActiveTab] = useState('paper'); // 'paper' or 'real'
    
    const [category, setCategory] = useState('returns');
    const [timePeriod, setTimePeriod] = useState('all');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [following, setFollowing] = useState(new Set());
    const [followingLoading, setFollowingLoading] = useState(new Set());
    const [userRank, setUserRank] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [error, setError] = useState(null);
    
    const refreshIntervalRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const isMountedRef = useRef(true);

    // ============ HELPER FUNCTIONS ============
    
    // Get avatar border color from equippedBorder (avatar FRAME, not theme)
    const getAvatarBorderStyle = useCallback((borderId) => {
        // Use BORDER_STYLES from AvatarWithBorder for consistency
        const defaultStyle = { gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B5A2B 50%, #CD7F32 100%)', glow: 'rgba(205, 127, 50, 0.5)' };
        if (!borderId) return { color: '#CD7F32', glow: 'rgba(205, 127, 50, 0.5)' };
        // Handle both 'border-gold' and 'gold' formats
        const normalizedId = borderId.startsWith('border-') ? borderId : `border-${borderId}`;
        const style = BORDER_STYLES[normalizedId] || BORDER_STYLES[borderId] || BORDER_STYLES['border-bronze'];
        // Extract primary color from gradient for border color
        const gradientMatch = style?.gradient?.match(/#[a-fA-F0-9]{6}/);
        const color = gradientMatch ? gradientMatch[0] : '#CD7F32';
        return { color, glow: style?.glow || 'rgba(205, 127, 50, 0.5)' };
    }, []);

    // Current user's border from vault
    const currentUserBorder = useMemo(() => {
        const userBorder = equipped?.border || 'default';
        return getAvatarBorderStyle(userBorder);
    }, [equipped?.border, getAvatarBorderStyle]);

    // Get initials
    const getInitials = useCallback((trader) => {
        const name = trader?.displayName || trader?.username || 'T';
        return name.charAt(0).toUpperCase();
    }, []);

    // Online/offline detection
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, DEBOUNCE_DELAY);
        
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const getSortField = useCallback(() => {
        switch (category) {
            case 'returns': return 'totalReturnPercent';
            case 'accuracy': return 'winRate';
            case 'streak': return 'currentStreak';
            case 'xp': return 'xp';
            case 'trades': return 'totalTrades';
            default: return 'totalReturnPercent';
        }
    }, [category]);

    const mapTraderData = useCallback((traders) => {
        return (traders || []).map((trader, index) => ({
            rank: trader.rank || index + 1,
            userId: trader.userId || trader.user?.id || trader._id,
            displayName: trader.displayName || trader.user?.displayName || trader.profile?.displayName || trader.username || trader.user?.username,
            username: trader.username || trader.user?.username,
            avatar: trader.avatar || trader.user?.avatar || trader.profile?.avatar,
            badges: trader.badges || trader.profile?.badges || [],
            level: trader.level || trader.gamification?.level || 1,
            xp: trader.xp || trader.gamification?.xp || 0,
            totalReturn: trader.totalReturn || trader.profitLossPercent || trader.stats?.totalReturnPercent || 0,
            winRate: trader.winRate || trader.stats?.winRate || 0,
            totalTrades: trader.totalTrades || trader.stats?.totalTrades || 0,
            currentStreak: trader.currentStreak || trader.stats?.currentStreak || 0,
            followersCount: trader.social?.followersCount || 0,
            // FIXED: Handle both flat and nested user object structures
            equippedBorder: trader.equippedBorder || trader.user?.equippedBorder || trader.vault?.equippedBorder || 'border-bronze',
            equippedBadges: trader.equippedBadges || trader.vault?.equippedBadges || [],
        }));
    }, []);

    const fetchLeaderboard = useCallback(async (showToast = false) => {
    if (!isMountedRef.current) return;
    
    try {
        setError(null);
        const sortBy = getSortField();
        
        // Different endpoint based on activeTab
        const endpoint = activeTab === 'paper' ? 
            `/social/leaderboard?sortBy=${sortBy}&period=${timePeriod}&limit=100` :
            `/leaderboard/real-portfolio?sortBy=${sortBy}&period=${timePeriod}&limit=100`;
        
        const response = await api.get(endpoint);
        
        if (!isMountedRef.current) return;
        
        // ✅ FIX: Handle different response structures
        let tradersData;
        if (Array.isArray(response.data)) {
            // Backend returned array directly
            tradersData = response.data;
        } else if (response.data.leaderboard) {
            // Backend returned { leaderboard: [...] }
            tradersData = response.data.leaderboard;
        } else if (response.data.data) {
            // Backend returned { data: [...] }
            tradersData = response.data.data;
        } else {
            console.error('Unexpected response structure:', response.data);
            tradersData = [];
        }
        
        const mappedData = mapTraderData(tradersData);
        
        setLeaderboard(mappedData);
        setLastUpdated(new Date());
        
        if (user) {
            const userEntry = mappedData.find(t => t.userId === user.id);
            setUserRank(userEntry || null);
        }
        
        if (showToast && mappedData.length > 0) {
            toast.success(`Loaded ${mappedData.length} traders`, 'Leaderboard Updated');
        }
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        if (isMountedRef.current) {
            setError('Failed to load leaderboard');
            if (showToast) {
                toast.error('Failed to load leaderboard', 'Error');
            }
        }
    }
}, [api, getSortField, mapTraderData, timePeriod, toast, user, activeTab]);

    const fetchFollowing = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            if (isMountedRef.current && response.data.social?.following) {
                setFollowing(new Set(response.data.social.following.map(id => id.toString())));
            }
        } catch (err) {
            console.error('Error fetching following:', err);
        }
    }, [api]);

    // Initial load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchLeaderboard(false),
                fetchFollowing()
            ]);
            if (isMountedRef.current) {
                setLoading(false);
            }
        };
        
        loadData();
    }, [fetchLeaderboard, fetchFollowing]);

    // Refetch when category or time period changes
    useEffect(() => {
        if (!loading) {
            fetchLeaderboard(true);
        }
    }, [category, timePeriod,  activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-refresh interval
    useEffect(() => {
        if (autoRefresh && isOnline && !loading) {
            refreshIntervalRef.current = setInterval(() => {
                fetchLeaderboard(false);
            }, REFRESH_INTERVAL);
        }
        
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [autoRefresh, isOnline, loading, fetchLeaderboard]);

    // Refetch when coming back online
    useEffect(() => {
        if (isOnline && !loading) {
            fetchLeaderboard(false);
        }
    }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLeaderboard(true);
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleFollow = async (userId) => {
        if (followingLoading.has(userId)) return;
        
        const isCurrentlyFollowing = following.has(userId);
        const newFollowing = new Set(following);
        
        if (isCurrentlyFollowing) {
            newFollowing.delete(userId);
        } else {
            newFollowing.add(userId);
        }
        
        setFollowing(newFollowing);
        setFollowingLoading(prev => new Set(prev).add(userId));
        
        try {
            if (isCurrentlyFollowing) {
                await api.post(`/social/unfollow/${userId}`);
                toast.success('Unfollowed user', 'Success');
            } else {
                await api.post(`/social/follow/${userId}`);
                toast.success('Following user!', 'Success');
            }
            
            setLeaderboard(prev => prev.map(trader => {
                if (trader.userId === userId) {
                    return {
                        ...trader,
                        followersCount: trader.followersCount + (isCurrentlyFollowing ? -1 : 1)
                    };
                }
                return trader;
            }));
        } catch (err) {
            console.error('Error following/unfollowing:', err);
            if (isCurrentlyFollowing) {
                newFollowing.add(userId);
            } else {
                newFollowing.delete(userId);
            }
            setFollowing(newFollowing);
            toast.error(err.response?.data?.msg || 'Failed to follow user', 'Error');
        } finally {
            setFollowingLoading(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    const handleCopyTrader = async (trader) => {
        toast.info(`Copy trading for ${trader.displayName} coming soon!`, 'Coming Soon');
    };

    const handleCardClick = (trader) => {
        navigate(`/trader/${trader.username}`);
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={20} color="#ffd700" />;
        if (rank === 2) return <Medal size={20} color="#c0c0c0" />;
        if (rank === 3) return <Award size={20} color="#cd7f32" />;
        return null;
    };

    const getMainStatValue = (trader) => {
        switch (category) {
            case 'returns':
                return {
                    value: `${trader.totalReturn >= 0 ? '+' : ''}${trader.totalReturn?.toFixed(2)}%`,
                    positive: trader.totalReturn >= 0,
                    negative: trader.totalReturn < 0
                };
            case 'accuracy':
                return { value: `${trader.winRate?.toFixed(1)}%`, positive: trader.winRate >= 60 };
            case 'streak':
                return { value: `${trader.currentStreak} 🔥`, positive: trader.currentStreak > 0 };
            case 'xp':
                return { value: trader.xp?.toLocaleString(), positive: true };
            case 'trades':
                return { value: trader.totalTrades?.toLocaleString(), positive: true };
            default:
                return { value: '-', positive: false };
        }
    };

    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const seconds = Math.floor((new Date() - lastUpdated) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    // Filter leaderboard based on search
    const filteredLeaderboard = leaderboard.filter(trader => {
        if (debouncedSearch) {
            return trader.displayName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                   trader.username?.toLowerCase().includes(debouncedSearch.toLowerCase());
        }
        return true;
    });

    // Get top 3 for podium (only show podium if we have at least 3 traders)
    const showPodium = !debouncedSearch && filteredLeaderboard.length >= 3;
    const top3 = showPodium ? filteredLeaderboard.slice(0, 3) : [];
    // If we have less than 3 traders or searching, show all traders in the list
    const restOfLeaderboard = debouncedSearch ? filteredLeaderboard : (showPodium ? filteredLeaderboard.slice(3) : filteredLeaderboard);

    // Render skeleton loading
    const renderSkeleton = () => (
        <>
            {[...Array(10)].map((_, i) => (
                <SkeletonCard key={i}>
                    <SkeletonCircle $size="55px" />
                    <SkeletonCircle $size="50px" />
                    <div>
                        <SkeletonLine $width="60%" $height="18px" style={{ marginBottom: '8px' }} />
                        <SkeletonLine $width="40%" $height="14px" />
                    </div>
                    <SkeletonLine $width="80%" $height="20px" />
                    <SkeletonLine $width="60%" $height="20px" />
                    <SkeletonLine $width="50%" $height="20px" />
                    <SkeletonLine $width="100px" $height="36px" />
                </SkeletonCard>
            ))}
        </>
    );

    if (loading) {
        return (
            <PageContainer>
                <BackgroundOrbs>
                    <Orb $duration="25s" />
                    <Orb $duration="30s" />
                    <Orb $duration="20s" />
                </BackgroundOrbs>
                <Header>
                    <Title>
                        <TitleIcon>
                            <Trophy size={56} color={theme?.brand?.primary || '#ffd700'} />
                        </TitleIcon>
                        Global Leaderboard
                    </Title>
                    <Subtitle>
    {activeTab === 'paper' 
        ? 'Practice trading with virtual cash' 
        : 'Real money portfolio rankings'}
</Subtitle>
                </Header>
                <LeaderboardContainer>
                    <LeaderboardList>
                        {renderSkeleton()}
                    </LeaderboardList>
                </LeaderboardContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <Header>
                <Title>
                    <TitleIcon>
                        <Trophy size={56} color={theme?.brand?.primary || '#ffd700'} />
                    </TitleIcon>
                    Global Leaderboard
                </Title>
                <Subtitle>Compete with the best traders worldwide</Subtitle>
                <StatsBar>
                    <StatBadge>
                        <Users size={18} />
                        {leaderboard.length.toLocaleString()} Active Traders
                    </StatBadge>
                    <LiveIndicator $connected={isOnline && autoRefresh}>
                        <LiveDot $connected={isOnline && autoRefresh} />
                        {isOnline ? (autoRefresh ? 'Live' : 'Paused') : 'Offline'}
                        {lastUpdated && <LastUpdated>• {formatLastUpdated()}</LastUpdated>}
                    </LiveIndicator>
                    <StatBadge>
                        <Zap size={18} />
                        {autoRefresh ? 'Auto-Refresh On' : 'Manual Refresh'}
                    </StatBadge>
                </StatsBar>
            </Header>

            {/* Category Tabs */}
            <CategoryTabsContainer>
                <CategoryTab 
                    $active={category === 'returns'}
                    onClick={() => setCategory('returns')}
                >
                    <DollarSign size={16} />
                    Total Returns
                </CategoryTab>
                <CategoryTab 
                    $active={category === 'accuracy'}
                    onClick={() => setCategory('accuracy')}
                >
                    <Target size={16} />
                    Accuracy
                </CategoryTab>
                <CategoryTab 
                    $active={category === 'streak'}
                    onClick={() => setCategory('streak')}
                >
                    <Flame size={16} />
                    Win Streak
                </CategoryTab>
                <CategoryTab 
                    $active={category === 'xp'}
                    onClick={() => setCategory('xp')}
                >
                    <Star size={16} />
                    XP / Level
                </CategoryTab>
                <CategoryTab 
                    $active={category === 'trades'}
                    onClick={() => setCategory('trades')}
                >
                    <BarChart3 size={16} />
                    Total Trades
                </CategoryTab>
            </CategoryTabsContainer>

            {/* Time Period Tabs */}
            <TimePeriodContainer>
                <TimePeriodTab 
                    $active={timePeriod === 'today'}
                    onClick={() => setTimePeriod('today')}
                >
                    Today
                </TimePeriodTab>
                <TimePeriodTab 
                    $active={timePeriod === 'week'}
                    onClick={() => setTimePeriod('week')}
                >
                    This Week
                </TimePeriodTab>
                <TimePeriodTab 
                    $active={timePeriod === 'month'}
                    onClick={() => setTimePeriod('month')}
                >
                    This Month
                </TimePeriodTab>
                <TimePeriodTab 
                    $active={timePeriod === 'all'}
                    onClick={() => setTimePeriod('all')}
                >
                    All Time
                </TimePeriodTab>
            </TimePeriodContainer>

          
        {/* Top 3 Podium */}
{top3.length === 3 && (
    <PodiumSection>
        <PodiumContainer>
            {/* 2nd Place */}
            <PodiumPlace onClick={() => handleCardClick(top3[1])}>
                <PodiumAvatarWrapper>
                    <AvatarWithBorder
                        src={top3[1].avatar}
                        name={top3[1].displayName}
                        username={top3[1].username}
                        size={100}
                        borderId={top3[1].equippedBorder || 'border-bronze'}
                        showParticles={true}
                    />
                </PodiumAvatarWrapper>
                <PodiumName $place={2}>{top3[1].displayName}</PodiumName>
                <PodiumStats $place={2}>{getMainStatValue(top3[1]).value}</PodiumStats>
                {top3[1].equippedBadges && top3[1].equippedBadges.length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                        <BadgeList 
                            badges={top3[1].equippedBadges} 
                            size={22} 
                            maxDisplay={3}
                            showParticles={false}
                        />
                    </div>
                )}
                <PodiumStand $place={2}>
                    <PodiumRank>2</PodiumRank>
                </PodiumStand>
            </PodiumPlace>

            {/* 1st Place */}
            <PodiumPlace onClick={() => handleCardClick(top3[0])}>
                <PodiumAvatarWrapper $isFirst>
                    <PodiumCrown>
                        <Crown size={40} color="#ffd700" />
                    </PodiumCrown>
                    <AvatarWithBorder
                        src={top3[0].avatar}
                        name={top3[0].displayName}
                        username={top3[0].username}
                        size={120}
                        borderId={top3[0].equippedBorder || 'border-bronze'}
                        showParticles={true}
                    />
                </PodiumAvatarWrapper>
                <PodiumName $place={1}>{top3[0].displayName}</PodiumName>
                <PodiumStats $place={1}>{getMainStatValue(top3[0]).value}</PodiumStats>
                {top3[0].equippedBadges && top3[0].equippedBadges.length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                        <BadgeList 
                            badges={top3[0].equippedBadges} 
                            size={26} 
                            maxDisplay={3}
                            showParticles={false}
                        />
                    </div>
                )}
                <PodiumStand $place={1}>
                    <PodiumRank>1</PodiumRank>
                </PodiumStand>
            </PodiumPlace>

            {/* 3rd Place */}
            <PodiumPlace onClick={() => handleCardClick(top3[2])}>
                <PodiumAvatarWrapper>
                    <AvatarWithBorder
                        src={top3[2].avatar}
                        name={top3[2].displayName}
                        username={top3[2].username}
                        size={100}
                        borderId={top3[2].equippedBorder || 'border-bronze'}
                        showParticles={true}
                    />
                </PodiumAvatarWrapper>
                <PodiumName $place={3}>{top3[2].displayName}</PodiumName>
                <PodiumStats $place={3}>{getMainStatValue(top3[2]).value}</PodiumStats>
                {top3[2].equippedBadges && top3[2].equippedBadges.length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                        <BadgeList 
                            badges={top3[2].equippedBadges} 
                            size={20} 
                            maxDisplay={3}
                            showParticles={false}
                        />
                    </div>
                )}
                <PodiumStand $place={3}>
                    <PodiumRank>3</PodiumRank>
                </PodiumStand>
            </PodiumPlace>
        </PodiumContainer>
    </PodiumSection>
)}

            {/* Your Rank Card */}
            {userRank && userRank.rank > 3 && (
                <YourRankCard>
                    <YourRankLeft>
                        <YourRankBadge>#{userRank.rank}</YourRankBadge>
                        <YourRankInfo>
                            <YourRankLabel>Your Current Rank</YourRankLabel>
                            <YourRankValue>
                                {userRank.displayName}
                                <LevelBadge>Lv {userRank.level}</LevelBadge>
                            </YourRankValue>
                        </YourRankInfo>
                    </YourRankLeft>
                    <YourRankStats>
                        <YourRankStat>
                            <YourRankStatValue>{getMainStatValue(userRank).value}</YourRankStatValue>
                            <YourRankStatLabel>
                                {category === 'returns' ? 'Return' : 
                                 category === 'accuracy' ? 'Win Rate' :
                                 category === 'streak' ? 'Streak' :
                                 category === 'xp' ? 'XP' : 'Trades'}
                            </YourRankStatLabel>
                        </YourRankStat>
                        <YourRankStat>
                            <YourRankStatValue>{userRank.totalTrades}</YourRankStatValue>
                            <YourRankStatLabel>Trades</YourRankStatLabel>
                        </YourRankStat>
                        <YourRankStat>
                            <YourRankStatValue>{userRank.rank - 1}</YourRankStatValue>
                            <YourRankStatLabel>To Top {Math.max(1, userRank.rank - 1)}</YourRankStatLabel>
                        </YourRankStat>
                    </YourRankStats>
                    <ClimbButton onClick={() => navigate('/predictions')}>
                        <Rocket size={18} />
                        Climb the Ranks
                    </ClimbButton>
                </YourRankCard>
            )}

            {/* Controls */}
            <ControlsContainer>
                <SearchBar>
                    <SearchIcon size={20} />
                    <SearchInput
                        type="text"
                        placeholder="Search traders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchBar>

                <AutoRefreshToggle 
                    $active={autoRefresh}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
                >
                    {autoRefresh ? <Wifi size={16} /> : <WifiOff size={16} />}
                    Auto
                </AutoRefreshToggle>

                <RefreshButton 
                    onClick={handleRefresh} 
                    disabled={refreshing || !isOnline} 
                    $loading={refreshing}
                >
                    <RefreshCw size={18} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </RefreshButton>
            </ControlsContainer>

            {/* Error State */}
            {error && (
                <EmptyState>
                    <EmptyIcon>
                        <WifiOff size={80} color={theme?.error || '#ef4444'} />
                    </EmptyIcon>
                    <EmptyTitle style={{ color: theme?.error || '#ef4444' }}>{error}</EmptyTitle>
                    <EmptyText>
                        {isOnline ? 'Please try again' : 'Check your internet connection'}
                    </EmptyText>
                    <RefreshButton 
                        onClick={handleRefresh}
                        disabled={refreshing || !isOnline}
                        $loading={refreshing}
                        style={{ margin: '1rem auto' }}
                    >
                        <RefreshCw size={18} />
                        Retry
                    </RefreshButton>
                </EmptyState>
            )}

            {/* Leaderboard */}
            {!error && filteredLeaderboard.length > 0 ? (
                <LeaderboardContainer>
                    <LeaderboardHeader>
                        <div>Rank</div>
                        <div></div>
                        <div>Trader</div>
                        <div style={{ textAlign: 'center' }}>
                            {category === 'returns' ? 'Return' : 
                             category === 'accuracy' ? 'Win Rate' :
                             category === 'streak' ? 'Streak' :
                             category === 'xp' ? 'XP' : 'Trades'}
                        </div>
                        <div style={{ textAlign: 'center' }}>Win Rate</div>
                        <div style={{ textAlign: 'center' }}>Trades</div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                    </LeaderboardHeader>
{/* Toggle Buttons - Place BEFORE Category Tabs */}
<ToggleContainer>
    <ToggleButton
        theme={theme}
        $active={activeTab === 'paper'}
        onClick={() => setActiveTab('paper')}
    >
        <Trophy size={20} />
        Paper Trading
    </ToggleButton>
    <ToggleButton
        theme={theme}
        $active={activeTab === 'real'}
        onClick={() => setActiveTab('real')}
    >
        <Crown size={20} />
        Real Portfolio
    </ToggleButton>
</ToggleContainer>

                    <LeaderboardList>
                        {restOfLeaderboard.map((trader, index) => {
                            const mainStat = getMainStatValue(trader);
                            const isYou = trader.userId === user?.id;
                            const isFollowLoading = followingLoading.has(trader.userId);
                            // FIXED: Use equippedBorder for avatar frame styling
                            const traderBorderStyle = getAvatarBorderStyle(trader.equippedBorder);
                            
                            return (
                                <LeaderCard 
                                    key={trader.userId}
                                    $rank={trader.rank}
                                    $index={index}
                                    $isYou={isYou}
                                    onClick={() => handleCardClick(trader)}
                                >
                                    <RankBadge $rank={trader.rank}>
                                        #{trader.rank}
                                        {trader.rank <= 3 && (
                                            <RankIcon>
                                                {getRankIcon(trader.rank)}
                                            </RankIcon>
                                        )}
                                    </RankBadge>

                                    <AvatarWithBorder
                                        src={trader.avatar}
                                        name={trader.displayName}
                                        username={trader.username}
                                        size={50}
                                        borderId={trader.equippedBorder || 'border-bronze'}
                                        showParticles={false}
                                    />

                                    {/* Inside the LeaderCard, after UserMeta */}
<UserInfo>
    <DisplayName>
        {trader.displayName}
        {isYou && <LevelBadge>You</LevelBadge>}
        <LevelBadge>Lv {trader.level}</LevelBadge>
        {trader.badges?.includes('verified') && <Check size={16} color={theme?.success || '#10b981'} />}
    </DisplayName>
    <UserMeta>
        <span>@{trader.username}</span>
        {trader.currentStreak > 0 && (
            <StreakBadge>
                <Flame size={12} />
                {trader.currentStreak}
            </StreakBadge>
        )}
    </UserMeta>
    {/* NEW: Show equipped badges */}
    {trader.equippedBadges && trader.equippedBadges.length > 0 && (
        <BadgesRow>
            <BadgeList 
                badges={trader.equippedBadges} 
                size={20} 
                maxDisplay={3}
                gap={4}
                showTooltip={true}
                showParticles={false}
            />
        </BadgesRow>
    )}
</UserInfo>

                                    <StatColumn>
                                        <StatLabel>
                                            {category === 'returns' ? 'Return' : 
                                             category === 'accuracy' ? 'Accuracy' :
                                             category === 'streak' ? 'Streak' :
                                             category === 'xp' ? 'XP' : 'Trades'}
                                        </StatLabel>
                                        <StatValue $positive={mainStat.positive} $negative={mainStat.negative}>
                                            {category === 'returns' && (mainStat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
                                            {mainStat.value}
                                        </StatValue>
                                    </StatColumn>

                                    <StatColumn>
                                        <StatLabel>Win Rate</StatLabel>
                                        <StatValue $positive={trader.winRate >= 60}>
                                            {trader.winRate?.toFixed(1)}%
                                        </StatValue>
                                    </StatColumn>

                                    <StatColumn>
                                        <StatLabel>Trades</StatLabel>
                                        <StatValue>
                                            {trader.totalTrades}
                                        </StatValue>
                                    </StatColumn>

                                    <ActionButtons onClick={(e) => e.stopPropagation()}>
                                        <FollowButton
                                            $following={following.has(trader.userId)}
                                            $loading={isFollowLoading}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFollow(trader.userId);
                                            }}
                                            disabled={isYou || isFollowLoading}
                                        >
                                            {isYou ? (
                                                <>
                                                    <Star size={16} />
                                                    You
                                                </>
                                            ) : isFollowLoading ? (
                                                <RefreshCw size={16} className="spinning" />
                                            ) : following.has(trader.userId) ? (
                                                <>
                                                    <UserMinus size={16} />
                                                    Unfollow
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={16} />
                                                    Follow
                                                </>
                                            )}
                                        </FollowButton>
                                        {!isYou && trader.rank <= 10 && (
                                            <CopyButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyTrader(trader);
                                                }}
                                                title="Copy Trader"
                                            >
                                                <Copy size={16} />
                                            </CopyButton>
                                        )}
                                    </ActionButtons>
                                </LeaderCard>
                            );
                        })}
                    </LeaderboardList>
                </LeaderboardContainer>
            ) : !error && (
                <EmptyState>
                    <EmptyIcon>
                        <Trophy size={80} color={theme?.brand?.primary || '#ffd700'} />
                    </EmptyIcon>
                    <EmptyTitle>No Traders Found</EmptyTitle>
                    <EmptyText>
                        {debouncedSearch ? 
                            'Try adjusting your search' :
                            'Be the first to join the leaderboard!'
                        }
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default LeaderboardPage;
