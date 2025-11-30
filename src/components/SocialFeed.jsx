// ============ SOCIALFEED.JS - PART 1 OF 5 ============
// Imports, Constants, Animations, Page Layout, Sidebar Styles
// 🔥 UPDATED: Uses equippedBorder (not equippedTheme) for avatar border colors

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { useVault } from '../context/VaultContext';
import { useToast } from '../context/ToastContext';
import {
    Sparkles, TrendingUp, MessageCircle, Heart, Share2, Bookmark,
    MoreHorizontal, Send, Image, Smile, Hash, AtSign, Users,
    Flame, Trophy, Target, BarChart2, Clock, Check, Plus,
    RefreshCw, ArrowUp, X, Copy, Zap, Activity, UserPlus,
    Link2, Flag, Trash2, BookmarkCheck, MessageSquare, ChevronDown,
    Award, Star
} from 'lucide-react';

// ============ BORDER COLOR MAP ============
// 🔥 Maps equippedBorder IDs to their display colors
// Uses the primary color from each border's gradient
const BORDER_COLORS = {
    // Border IDs with colors extracted from vaultItems.js
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
    // Without "border-" prefix (fallback)
    'bronze': { color: '#CD7F32', glow: 'rgba(205, 127, 50, 0.5)' },
    'silver': { color: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.5)' },
    'gold': { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' },
    'emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
    'ruby': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },
    'platinum': { color: '#E5E4E2', glow: 'rgba(229, 228, 226, 0.7)' },
    'sapphire': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.7)' },
    'amethyst': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)' },
    'diamond': { color: '#00D4FF', glow: 'rgba(0, 212, 255, 0.8)' },
    'rainbow': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.9)' },
    'nexus': { color: '#00adef', glow: 'rgba(0, 173, 237, 1)' },
    // Default fallback
    'default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    null: { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    undefined: { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' }
};

// ============ REACTIONS ============
const REACTIONS = [
    { name: 'like', emoji: '❤️', color: '#ef4444' },
    { name: 'rocket', emoji: '🚀', color: '#3b82f6' },
    { name: 'fire', emoji: '🔥', color: '#f59e0b' },
    { name: 'diamond', emoji: '💎', color: '#06b6d4' },
    { name: 'bull', emoji: '🐂', color: '#10b981' },
    { name: 'bear', emoji: '🐻', color: '#ef4444' },
    { name: 'money', emoji: '💰', color: '#fbbf24' }
];

// ============ BADGE DISPLAY ============
const BADGE_ICONS = {
    'badge-founder': '👑',
    'badge-first-trade': '🎯',
    'badge-week-warrior': '⭐',
    'badge-trade-master': '📊',
    'badge-portfolio-builder': '🏗️',
    'badge-profit-king': '💰',
    'badge-dedicated': '🔥',
    'badge-prediction-master': '🔮',
    'badge-level-50': '5️⃣0️⃣',
    'badge-whale': '🐋',
    'badge-level-100': '💯',
    'badge-millionaire': '💵'
};

const BADGE_COLORS = {
    'badge-founder': '#fbbf24',
    'badge-first-trade': '#3b82f6',
    'badge-week-warrior': '#f59e0b',
    'badge-trade-master': '#3b82f6',
    'badge-portfolio-builder': '#0ea5e9',
    'badge-profit-king': '#10b981',
    'badge-dedicated': '#ef4444',
    'badge-prediction-master': '#8b5cf6',
    'badge-level-50': '#a855f7',
    'badge-whale': '#8b5cf6',
    'badge-level-100': '#f59e0b',
    'badge-millionaire': '#10b981'
};

// ============ ANIMATIONS ============
const float = keyframes`
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const bounceIn = keyframes`
    0% { transform: scale(0); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// 🔥 ADDED: Missing animations
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const fadeInScale = keyframes`
    from { 
        opacity: 0; 
        transform: scale(0.95); 
    }
    to { 
        opacity: 1; 
        transform: scale(1); 
    }
`;

const slideInRight = keyframes`
    from { 
        opacity: 0; 
        transform: translateX(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateX(0); 
    }
`;

const newPostSlide = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(-20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
`;

const heartBeat = keyframes`
    0% { transform: scale(1); }
    14% { transform: scale(1.3); }
    28% { transform: scale(1); }
    42% { transform: scale(1.3); }
    70% { transform: scale(1); }
`;

// ============ PAGE LAYOUT ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: transparent;
    padding: 2rem;
    padding-top: 100px;
    position: relative;
    overflow-x: hidden;
    z-index: 1;

    @media (max-width: 768px) {
        padding: 1rem;
        padding-top: 90px;
    }
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
        background: ${props => props.theme.brand?.primary || '#00adef'};
        top: -100px;
        left: -100px;
    }

    &:nth-child(2) {
        width: 300px;
        height: 300px;
        background: ${props => props.theme.brand?.accent || '#8b5cf6'};
        bottom: -50px;
        right: -50px;
        animation-delay: -5s;
    }

    &:nth-child(3) {
        width: 200px;
        height: 200px;
        background: ${props => props.theme.success || '#10b981'};
        top: 50%;
        left: 50%;
        animation-delay: -10s;
    }
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    gap: 2rem;
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr 320px;
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

// ============ SIDEBARS ============
const LeftSidebar = styled.aside`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem;
    height: fit-content;

    @media (max-width: 1200px) {
        display: none;
    }
`;

const RightSidebar = styled.aside`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem;
    height: fit-content;

    @media (max-width: 900px) {
        display: none;
    }
`;

const SidebarCard = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border-radius: 20px;
    padding: 1.5rem;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(0, 173, 239, 0.2)'};
    backdrop-filter: blur(20px);
`;

const SidebarTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    margin-bottom: 1rem;
    
    svg {
        width: 20px;
        height: 20px;
    }
`;

// ============ QUICK ACTIONS ============
const QuickAction = styled.button`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem 1rem;
    background: ${props => props.$active 
        ? `${props.theme.brand?.primary || '#00adef'}20` 
        : 'transparent'};
    border: none;
    border-radius: 12px;
    color: ${props => props.$active 
        ? props.theme.brand?.primary || '#00adef' 
        : props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.95rem;
    font-weight: ${props => props.$active ? '600' : '500'};
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}15;
        color: ${props => props.theme.brand?.primary || '#00adef'};
        transform: translateX(4px);
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

// ============ TRENDING TAGS ============
const TrendingTag = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        padding-left: 0.5rem;
    }
`;

const TagName = styled.span`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-weight: 500;

    svg {
        width: 14px;
        height: 14px;
        color: ${props => props.theme.success || '#10b981'};
    }
`;

const TagCount = styled.span`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

// ============ TOP TRADERS ============
const TopTraderCard = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.bg?.cardHover || 'rgba(30, 41, 59, 0.95)'};
    }
`;

const TraderRank = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0 0%, #9ca3af 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32 0%, #a16207 100%)';
        return props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)';
    }};
    color: ${props => props.$rank <= 3 ? '#000' : props.theme.text?.secondary || '#94a3b8'};
`;

const TraderInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const TraderName = styled.div`
    font-weight: 600;
    font-size: 0.9rem;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TraderStat = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme.success || '#10b981'};
    font-weight: 500;
`;

const FollowBadge = styled.button`
    padding: 0.375rem 0.875rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    background: ${props => props.theme.brand?.primary || '#00adef'}20;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}40;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'};
        color: white;
    }
`;

// ============ SUGGESTED USERS ============
const SuggestedUser = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.bg?.cardHover || 'rgba(30, 41, 59, 0.95)'};
    }
`;

const SuggestedInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const SuggestedName = styled.div`
    font-weight: 600;
    font-size: 0.9rem;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const SuggestedMutual = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;


// ============ USER AVATAR ============
// 🔥 UPDATED: Now uses border color from equippedBorder
const UserAvatar = styled.div`
    width: ${props => props.$size || '40px'};
    height: ${props => props.$size || '40px'};
    border-radius: 50%;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: ${props => props.$fontSize || '0.9rem'};
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    border: ${props => props.$borderWidth || '3px'} solid ${props => props.$borderColor || '#00adef'};
    box-shadow: ${props => props.$glow ? `0 0 15px ${props.$borderColor || '#00adef'}60` : 'none'};
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
    }

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px ${props => props.$borderColor || '#00adef'}80;
    }
`;

// ============ FEED CONTAINER ============
const FeedContainer = styled.main`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

// ============ FEED HEADER ============
const FeedHeader = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border-radius: 20px;
    padding: 1.5rem;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(0, 173, 239, 0.2)'};
    backdrop-filter: blur(20px);
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const FeedTitle = styled.h1`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.75rem;
    font-weight: 800;
    background: ${props => props.theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #8b5cf6 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    svg {
        color: ${props => props.theme.brand?.primary || '#ffd700'};
        -webkit-text-fill-color: initial;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const NewPostsAlert = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}20;
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}40;
    border-radius: 20px;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    animation: ${pulse} 2s ease-in-out infinite;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}30;
    }

    svg {
        width: 16px;
        height: 16px;
    }
`;

const RefreshButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.3)'};
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}20;
        color: ${props => props.theme.brand?.primary || '#00adef'};
        border-color: ${props => props.theme.brand?.primary || '#00adef'}40;
    }

    &.spinning svg {
        animation: ${spin} 1s linear infinite;
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

// ============ FILTER TABS ============
const FilterTabs = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const FilterTab = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$active 
        ? props.theme.brand?.primary || '#00adef' 
        : props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    color: ${props => props.$active 
        ? 'white' 
        : props.theme.text?.secondary || '#94a3b8'};

    &:hover {
        background: ${props => props.$active 
            ? props.theme.brand?.primary || '#00adef' 
            : `${props.theme.brand?.primary || '#00adef'}20`};
        color: ${props => props.$active ? 'white' : props.theme.brand?.primary || '#00adef'};
    }

    svg {
        width: 16px;
        height: 16px;
    }
`;

// ============ CREATE POST BOX ============
const CreatePostBox = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border-radius: 20px;
    padding: 1.5rem;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(0, 173, 239, 0.2)'};
    backdrop-filter: blur(20px);
`;

const CreatePostHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const PostInput = styled.div`
    flex: 1;
    padding: 0.875rem 1.25rem;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border-radius: 25px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.bg?.cardHover || 'rgba(30, 41, 59, 0.95)'};
        color: ${props => props.theme.text?.secondary || '#94a3b8'};
    }
`;

const PostTypeButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const PostTypeButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: ${props => props.$color || props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$hoverBg || 'rgba(0, 173, 239, 0.1)'};
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;
// ============ PART 2 OF 4 ============
// Post Card, Author Info, Trade/Poll/Prediction Attachments, Post Stats & Actions

// ============ POST CARD ============
const PostCard = styled.article`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 2px solid ${({ $highlighted, theme }) => $highlighted ? 
        `${theme.brand?.primary || '#ffd700'}66` : 
        theme.border?.primary || 'rgba(255, 215, 0, 0.15)'
    };
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: ${props => props.$isNew ? newPostSlide : fadeIn} 0.5s ease-out;

    &:hover {
        border-color: ${({ theme }) => theme.border?.secondary || 'rgba(255, 215, 0, 0.3)'};
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
    }

    ${props => props.$isPinned && css`
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
        background: ${({ theme }) => theme.bg?.cardHover || 'linear-gradient(135deg, rgba(40, 51, 69, 0.95) 0%, rgba(25, 33, 52, 0.95) 100%)'};
    `}
`;

const PostHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 0;
`;

const PostAuthor = styled.div`
    display: flex;
    align-items: center;
    gap: 0.875rem;
`;

const AuthorInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const AuthorName = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#f8fafc'};
    cursor: pointer;
    flex-wrap: wrap;

    &:hover {
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    }
`;

const VerifiedBadge = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'};
    border-radius: 50%;
    color: ${({ theme }) => theme.bg?.page || '#0a0e27'};
`;

const LevelBadge = styled.span`
    padding: 0.15rem 0.5rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}4D 0%, ${theme.brand?.accent || '#8b5cf6'}1A 100%)`};
    border: 1px solid ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}66`};
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    color: ${({ theme }) => theme.brand?.accent || '#a78bfa'};
`;

const BadgesContainer = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    margin-left: 0.25rem;
`;

const MiniBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: ${props => props.$color ? `${props.$color}25` : 'rgba(100, 116, 139, 0.2)'};
    border: 1.5px solid ${props => props.$color || '#64748b'};
    font-size: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        transform: scale(1.15);
        box-shadow: 0 0 8px ${props => props.$color || '#64748b'}50;
    }
`;

const MoreBadgesIndicator = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    background: ${({ theme }) => theme.bg?.input || 'rgba(100, 116, 139, 0.15)'};
    border: 1.5px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    font-size: 0.55rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
`;

const AuthorMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

const Username = styled.span`
    cursor: pointer;
    
    &:hover {
        color: ${({ theme }) => theme.brand?.accent || '#00adef'};
        text-decoration: underline;
    }
`;

const PostTime = styled.span`
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const PostMenu = styled.div`
    position: relative;
`;

const MenuButton = styled.button`
    width: 36px;
    height: 36px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}1A`};
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    }
`;

const MenuDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.98)'};
    backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(255, 215, 0, 0.2)'};
    border-radius: 12px;
    min-width: 180px;
    overflow: hidden;
    z-index: 100;
    animation: ${fadeInScale} 0.2s ease-out;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const MenuItem = styled.button`
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: ${({ $danger, theme }) => $danger ? theme.error || '#ef4444' : theme.text?.primary || '#f8fafc'};
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ $danger, theme }) => $danger ? 
            `${theme.error || '#ef4444'}1A` : 
            `${theme.brand?.primary || '#ffd700'}1A`
        };
        color: ${({ $danger, theme }) => $danger ? theme.error || '#ef4444' : theme.brand?.primary || '#ffd700'};
    }
`;

const PostContent = styled.div`
    padding: 1rem 1.25rem;
`;

const PostText = styled.p`
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;

    a {
        color: ${({ theme }) => theme.brand?.accent || '#00adef'};
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

const Hashtag = styled.span`
    color: ${({ theme }) => theme.brand?.accent || '#00adef'};
    cursor: pointer;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const Mention = styled.span`
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    cursor: pointer;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const TickerMention = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    background: ${({ $direction, theme }) => $direction === 'up' ? 
        `${theme.success || '#10b981'}33` : 
        $direction === 'down' ? 
        `${theme.error || '#ef4444'}33` : 
        `${theme.brand?.accent || '#00adef'}33`
    };
    border: 1px solid ${({ $direction, theme }) => $direction === 'up' ? 
        `${theme.success || '#10b981'}66` : 
        $direction === 'down' ? 
        `${theme.error || '#ef4444'}66` : 
        `${theme.brand?.accent || '#00adef'}66`
    };
    border-radius: 6px;
    color: ${({ $direction, theme }) => $direction === 'up' ? 
        theme.success || '#10b981' : 
        $direction === 'down' ? 
        theme.error || '#ef4444' : 
        theme.brand?.accent || '#00adef'
    };
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
`;

// ============ TRADE POST ATTACHMENT ============
const TradeAttachment = styled.div`
    margin: 1rem 0;
    background: ${({ theme }) => theme.bg?.input || 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)'};
    border: 1px solid ${({ $profitable, theme }) => $profitable ? 
        `${theme.success || '#10b981'}4D` : 
        `${theme.error || '#ef4444'}4D`
    };
    border-radius: 16px;
    padding: 1.25rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${({ $profitable, theme }) => $profitable ? theme.success || '#10b981' : theme.error || '#ef4444'};
    }
`;

const TradeHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const TradeSymbol = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SymbolIcon = styled.div`
    width: 44px;
    height: 44px;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}33 0%, ${theme.brand?.primary || '#ffd700'}1A 100%)`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#ffd700'}4D`};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-size: 1rem;
`;

const SymbolInfo = styled.div``;

const SymbolName = styled.div`
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#f8fafc'};
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TradeDirection = styled.span`
    padding: 0.2rem 0.5rem;
    background: ${({ $type, theme }) => $type === 'LONG' ? 
        `${theme.success || '#10b981'}33` : 
        `${theme.error || '#ef4444'}33`
    };
    border: 1px solid ${({ $type, theme }) => $type === 'LONG' ? 
        `${theme.success || '#10b981'}66` : 
        `${theme.error || '#ef4444'}66`
    };
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: ${({ $type, theme }) => $type === 'LONG' ? theme.success || '#10b981' : theme.error || '#ef4444'};
`;

const SymbolCompany = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

const TradePnL = styled.div`
    text-align: right;
`;

const PnLValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${({ $positive, theme }) => $positive ? theme.success || '#10b981' : theme.error || '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const PnLPercent = styled.div`
    font-size: 0.9rem;
    color: ${({ $positive, theme }) => $positive ? theme.success || '#10b981' : theme.error || '#ef4444'};
    opacity: 0.8;
`;

const TradeDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @media (max-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const TradeDetail = styled.div`
    text-align: center;
    padding: 0.75rem;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 10px;
`;

const DetailLabel = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
    color: ${({ theme }) => theme.text?.primary || '#f8fafc'};
    font-weight: 700;
`;

const CopyTradeButton = styled.button`
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.success || '#10b981'}33 0%, ${theme.success || '#10b981'}1A 100%)`};
    border: 1px solid ${({ theme }) => `${theme.success || '#10b981'}66`};
    border-radius: 10px;
    color: ${({ theme }) => theme.success || '#10b981'};
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: ${({ theme }) => `${theme.success || '#10b981'}4D`};
        transform: translateY(-2px);
    }
`;

// ============ PREDICTION POST ============
const PredictionAttachment = styled.div`
    margin: 1rem 0;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}1A 0%, ${theme.brand?.accent || '#8b5cf6'}0D 100%)`};
    border: 1px solid ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}4D`};
    border-radius: 16px;
    padding: 1.25rem;
`;

const PredictionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const PredictionSymbol = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const PredictionDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${({ $direction, theme }) => $direction === 'UP' ? 
        `${theme.success || '#10b981'}33` : 
        `${theme.error || '#ef4444'}33`
    };
    border: 1px solid ${({ $direction, theme }) => $direction === 'UP' ? 
        `${theme.success || '#10b981'}66` : 
        `${theme.error || '#ef4444'}66`
    };
    border-radius: 10px;
    color: ${({ $direction, theme }) => $direction === 'UP' ? theme.success || '#10b981' : theme.error || '#ef4444'};
    font-weight: 700;
`;

const PredictionConfidence = styled.div`
    margin-top: 1rem;
`;

const ConfidenceBar = styled.div`
    height: 8px;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.6)'};
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$value}%;
    background: ${({ theme }) => `linear-gradient(90deg, ${theme.brand?.accent || '#a78bfa'}, ${theme.brand?.accent || '#8b5cf6'})`};
    border-radius: 4px;
    transition: width 1s ease;
`;

const ConfidenceLabel = styled.div`
    display: flex;
    justify-content: space-between;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
`;

// ============ POLL POST ============
const PollContainer = styled.div`
    margin: 1rem 0;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(15, 23, 42, 0.5)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(255, 215, 0, 0.2)'};
    border-radius: 16px;
    padding: 1.25rem;
`;

const PollQuestion = styled.div`
    color: ${({ theme }) => theme.text?.primary || '#f8fafc'};
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 1rem;
`;

const PollOption = styled.button`
    width: 100%;
    padding: 1rem;
    background: ${({ $selected, theme }) => $selected ? 
        `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}33 0%, ${theme.brand?.primary || '#ffd700'}1A 100%)` :
        theme.bg?.input || 'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${({ $selected, theme }) => $selected ? 
        `${theme.brand?.primary || '#ffd700'}80` : 
        theme.border?.primary || 'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 12px;
    color: ${({ $selected, theme }) => $selected ? theme.brand?.primary || '#ffd700' : theme.text?.primary || '#e0e6ed'};
    text-align: left;
    cursor: ${props => props.$voted ? 'default' : 'pointer'};
    margin-bottom: 0.75rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
        ${props => !props.$voted && css`
            border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
            background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}1A`};
        `}
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const PollProgressBar = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$percent}%;
    background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}26`};
    transition: width 1s ease;
`;

const PollOptionContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
`;

const PollOptionText = styled.span`
    font-weight: 600;
`;

const PollOptionPercent = styled.span`
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-weight: 700;
`;

const PollStats = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

// ============ IMAGE ATTACHMENT ============
const ImageGrid = styled.div`
    display: grid;
    grid-template-columns: ${props => {
        if (props.$count === 1) return '1fr';
        if (props.$count === 2) return '1fr 1fr';
        if (props.$count === 3) return '2fr 1fr';
        return '1fr 1fr';
    }};
    gap: 4px;
    margin: 1rem 0;
    border-radius: 16px;
    overflow: hidden;
    max-height: 400px;
`;

const PostImage = styled.img`
    width: 100%;
    height: ${props => props.$single ? '400px' : '200px'};
    object-fit: cover;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }
`;

// ============ POST STATS ============
const PostStats = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.2)'};
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

const StatsLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ReactionsList = styled.div`
    display: flex;
    align-items: center;
`;

const ReactionBubble = styled.div`
    width: 22px;
    height: 22px;
    background: ${props => props.$color || 'rgba(255, 215, 0, 0.2)'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    margin-left: -6px;
    border: 2px solid ${({ theme }) => theme.bg?.card || '#1e293b'};
    cursor: pointer;

    &:first-child {
        margin-left: 0;
    }
`;

const ReactionCount = styled.span`
    margin-left: 0.5rem;
    cursor: pointer;

    &:hover {
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
        text-decoration: underline;
    }
`;

const StatsRight = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatItem = styled.span`
    cursor: pointer;

    &:hover {
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
        text-decoration: underline;
    }
`;

// ============ POST ACTIONS ============
const PostActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0.5rem 1rem;
    border-top: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.2)'};
`;

const ActionButton = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: ${({ $active, $activeColor, theme }) => $active ? $activeColor || theme.brand?.primary || '#ffd700' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 10px;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${({ $hoverBg, theme }) => $hoverBg || `${theme.brand?.primary || '#ffd700'}1A`};
        color: ${({ $hoverColor, theme }) => $hoverColor || theme.brand?.primary || '#ffd700'};
    }

    svg {
        transition: all 0.2s ease;
    }

    &:hover svg {
        transform: scale(1.1);
    }

    ${props => props.$active && css`
        svg {
            animation: ${heartBeat} 0.5s ease;
        }
    `}

    @media (max-width: 480px) {
        padding: 0.6rem 0.5rem;
        font-size: 0.85rem;
    }
`;

// ============ REACTIONS PICKER ============
const ReactionsPopup = styled.div`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.98)'};
    backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.border?.secondary || 'rgba(255, 215, 0, 0.3)'};
    border-radius: 30px;
    padding: 0.5rem;
    display: flex;
    gap: 0.25rem;
    animation: ${fadeInScale} 0.2s ease-out;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 10;
`;

const ReactionButton = styled.button`
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.5rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}33`};
        transform: scale(1.3) translateY(-5px);
    }
`;

// END OF PART 2 - Continue to Part 3 for Comments, Sidebar, Modal styles


// ============ LOADING STATES ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
`;

const LoadingSpinner = styled.div`
    width: 50px;
    height: 50px;
    border: 3px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.3)'};
    border-top-color: ${props => props.theme.brand?.primary || '#00adef'};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.95rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border-radius: 20px;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(0, 173, 239, 0.2)'};
`;

const EmptyIcon = styled.div`
    margin-bottom: 1.5rem;
    opacity: 0.8;
`;

const EmptyTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    margin-bottom: 1.5rem;
`;

const EmptyButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: ${props => props.theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #8b5cf6 100%)'};
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px ${props => props.theme.brand?.primary || '#00adef'}40;
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

const EndMessage = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
`;

// END OF PART 1 - Continue to Part 2 for Post Card styles
// ============ CREATE POST MODAL ============
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.95)'};
    border: 2px solid ${({ theme }) => theme.border?.secondary || 'rgba(255, 215, 0, 0.3)'};
    border-radius: 24px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${fadeInScale} 0.3s ease-out;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}4D`};
        border-radius: 3px;
    }
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(255, 215, 0, 0.2)'};
`;

const ModalTitle = styled.h2`
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-size: 1.25rem;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    background: ${({ theme }) => `${theme.error || '#ef4444'}1A`};
    border: 1px solid ${({ theme }) => `${theme.error || '#ef4444'}4D`};
    border-radius: 50%;
    color: ${({ theme }) => theme.error || '#ef4444'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.error || '#ef4444'}33`};
        transform: scale(1.1);
    }
`;

const ModalBody = styled.div`
    padding: 1.5rem;
`;

const PostTypeSelector = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const PostTypeChip = styled.button`
    padding: 0.5rem 1rem;
    background: ${({ $active, theme }) => $active ? 
        `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}4D 0%, ${theme.brand?.primary || '#ffd700'}26 100%)` :
        theme.bg?.input || 'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#ffd700'}80` : 
        theme.border?.primary || 'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 20px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#ffd700' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 150px;
    padding: 1rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    font-family: inherit;
    transition: all 0.3s ease;

    &:focus {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const CharCount = styled.div`
    text-align: right;
    color: ${({ $over, theme }) => $over ? theme.error || '#ef4444' : theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
    margin-top: 0.5rem;
`;

const AttachmentPreview = styled.div`
    margin-top: 1rem;
    padding: 1rem;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(15, 23, 42, 0.5)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
`;

const AttachmentHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const AttachmentTitle = styled.div`
    color: ${({ theme }) => theme.text?.primary || '#f8fafc'};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RemoveAttachment = styled.button`
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.error || '#ef4444'};
    cursor: pointer;
    padding: 0.25rem;

    &:hover {
        opacity: 0.8;
    }
`;

const TradeForm = styled.div`
    display: grid;
    gap: 1rem;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div``;

const FormLabel = styled.label`
    display: block;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const FormSelect = styled.select`
    width: 100%;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
    }

    option {
        background: ${({ theme }) => theme.bg?.card || '#1e293b'};
    }
`;

const PollForm = styled.div``;

const PollOptionInput = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
`;

const OptionInput = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const RemoveOptionButton = styled.button`
    width: 40px;
    height: 40px;
    background: ${({ theme }) => `${theme.error || '#ef4444'}1A`};
    border: 1px solid ${({ theme }) => `${theme.error || '#ef4444'}4D`};
    border-radius: 10px;
    color: ${({ theme }) => theme.error || '#ef4444'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.error || '#ef4444'}33`};
    }
`;

const AddOptionButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: 1px dashed ${({ theme }) => `${theme.brand?.primary || '#ffd700'}66`};
    border-radius: 10px;
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}1A`};
    }
`;

const ModalFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(255, 215, 0, 0.2)'};
`;

const FooterActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const FooterButton = styled.button`
    width: 40px;
    height: 40px;
    background: transparent;
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}66`};
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}1A`};
    }
`;

const PostButton = styled.button`
    padding: 0.75rem 2rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'};
    border: none;
    border-radius: 12px;
    color: ${({ theme }) => theme.bg?.page || '#0a0e27'};
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: ${({ theme }) => `0 4px 16px ${theme.brand?.primary || '#ffd700'}4D`};

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => `0 8px 24px ${theme.brand?.primary || '#ffd700'}80`};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// ============ PART 3 OF 4 ============
// Comments Section, Right Sidebar, Loading/Empty States, Create Post Modal

// ============ COMMENTS SECTION ============
const CommentsSection = styled.div`
    border-top: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.2)'};
    padding: 1rem 1.25rem;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(15, 23, 42, 0.3)'};
`;

const CommentsList = styled.div`
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 1rem;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}0D`};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}4D`};
        border-radius: 2px;
    }
`;

const Comment = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const CommentContent = styled.div`
    flex: 1;
`;

const CommentBubble = styled.div`
    background: ${({ theme }) => theme.bg?.input || 'rgba(30, 41, 59, 0.8)'};
    border-radius: 16px;
    padding: 0.75rem 1rem;
`;

const CommentAuthor = styled.span`
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#f8fafc'};
    margin-right: 0.5rem;
    cursor: pointer;

    &:hover {
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    }
`;

const CommentText = styled.span`
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
`;

const CommentMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.25rem;
    padding-left: 0.5rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
`;

const CommentAction = styled.button`
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    }
`;

const CommentInput = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: center;
`;

const CommentTextarea = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 25px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const SendButton = styled.button`
    width: 40px;
    height: 40px;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'};
    border: none;
    border-radius: 50%;
    color: ${({ theme }) => theme.bg?.page || '#0a0e27'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;




// ============ LIVE ACTIVITY PLACEHOLDER ============
const LiveActivityPlaceholder = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
    text-align: center;
    padding: 1rem;
`;

// END OF PART 3 - Continue to Part 4 for Main Component Logic

// ============ HELPER COMPONENT: Author Badges ============
const AuthorBadges = ({ badges, maxDisplay = 3 }) => {
    if (!badges || badges.length === 0) return null;
    
    const displayBadges = badges.slice(0, maxDisplay);
    const remaining = badges.length - maxDisplay;
    
    return (
        <BadgesContainer>
            {displayBadges.map(badgeId => (
                <MiniBadge 
                    key={badgeId} 
                    $color={BADGE_COLORS[badgeId]}
                    title={badgeId.replace('badge-', '').replace(/-/g, ' ')}
                >
                    {BADGE_ICONS[badgeId] || '?'}
                </MiniBadge>
            ))}
            {remaining > 0 && (
                <MoreBadgesIndicator>+{remaining}</MoreBadgesIndicator>
            )}
        </BadgesContainer>
    );
};

// ============ MAIN COMPONENT ============
const SocialFeed = () => {
    const { api, isAuthenticated, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const theme = useStyledTheme();
    const { profileThemeId, getAvatarBorderForUser } = useThemeContext();
    const { equipped } = useVault();
    
    // ============ STATE ============
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostsCount, setNewPostsCount] = useState(0);
    const [expandedComments, setExpandedComments] = useState({});
    const [activeReactionPicker, setActiveReactionPicker] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    
    // Create post state
    const [postType, setPostType] = useState('text');
    const [postText, setPostText] = useState('');
    const [tradeData, setTradeData] = useState({
        symbol: '',
        direction: 'LONG',
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        pnl: ''
    });
    const [pollData, setPollData] = useState({
        question: '',
        options: ['', '']
    });
    const [commentInputs, setCommentInputs] = useState({});
    
    // Sidebar data
    const [trendingTags, setTrendingTags] = useState([]);
    const [topTraders, setTopTraders] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    
    // Refs
    const observerTarget = useRef(null);
    const feedRef = useRef(null);

    // ============ HELPER FUNCTIONS ============
    
    // Get initials from name
    const getInitials = useCallback((name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }, []);

    // 🔥 NEW: Get avatar border color from equippedBorder ID
    // Handles both "border-ruby" and "ruby" formats
    const getAvatarBorderColor = useCallback((borderId) => {
        if (!borderId) {
            return BORDER_COLORS['default'];
        }
        
        // Try direct lookup first
        if (BORDER_COLORS[borderId]) {
            return BORDER_COLORS[borderId];
        }
        
        // Handle both formats: "ruby" -> "border-ruby"
        const normalizedId = borderId.startsWith('border-') ? borderId : `border-${borderId}`;
        
        if (BORDER_COLORS[normalizedId]) {
            return BORDER_COLORS[normalizedId];
        }
        
        // Try without prefix
        const withoutPrefix = borderId.replace('border-', '');
        if (BORDER_COLORS[withoutPrefix]) {
            return BORDER_COLORS[withoutPrefix];
        }
        
        return BORDER_COLORS['default'];
    }, []);

    // 🔥 FIXED: Get current user's border from their equippedBorder
    const currentUserBorder = useMemo(() => {
        // Priority order for finding user's equipped border:
        // 1. user.vault.equippedBorder (from AuthContext - most reliable)
        // 2. equipped?.border?.id (from VaultContext)
        // 3. 'default' fallback
        
        const userBorderId = 
            user?.vault?.equippedBorder || 
            equipped?.border?.id || 
            equipped?.border ||
            null;
        
        console.log('🎯 currentUserBorder - found border:', userBorderId);
        return getAvatarBorderColor(userBorderId);
    }, [user?.vault?.equippedBorder, equipped?.border, getAvatarBorderColor]);

    // Format time ago
    const formatTimeAgo = useCallback((date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffInMinutes = Math.floor((now - postDate) / 60000);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
        return postDate.toLocaleDateString();
    }, []);

    // Render post content with mentions and hashtags
    const renderPostContent = useCallback((content) => {
        if (!content) return null;

        const parts = content.split(/(\$[A-Z]+|\#\w+|\@\w+)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('$')) {
                return (
                    <TickerMention 
                        key={index} 
                        onClick={() => navigate(`/stock/${part.slice(1)}`)}
                    >
                        {part}
                    </TickerMention>
                );
            }
            if (part.startsWith('#')) {
                return (
                    <Hashtag 
                        key={index}
                        onClick={() => setFilter('trending')}
                    >
                        {part}
                    </Hashtag>
                );
            }
            if (part.startsWith('@')) {
                return (
                    <Mention 
                        key={index}
                        onClick={() => navigate(`/profile/${part.slice(1)}`)}
                    >
                        {part}
                    </Mention>
                );
            }
            return part;
        });
    }, [navigate]);

    // ============ API FUNCTIONS ============

    // Fetch feed
    const fetchFeed = useCallback(async (filterType = filter, pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            
            let endpoint = '/feed';
            if (filterType === 'trending' || filterType === 'all') {
                endpoint = '/feed/discover';
            }

            const response = await api.get(`${endpoint}?limit=20&skip=${(pageNum - 1) * 20}`);
            const newPosts = response.data.posts || [];

            // 🔥 DEBUG: Log first post to check for equippedBorder
            if (newPosts.length > 0) {
                console.log('📝 First post author data:', {
                    username: newPosts[0].author?.username,
                    equippedBorder: newPosts[0].author?.equippedBorder,
                    equippedTheme: newPosts[0].author?.equippedTheme
                });
            }

            if (append) {
                setPosts(prev => [...prev, ...newPosts]);
            } else {
                setPosts(newPosts);
            }

            setHasMore(newPosts.length === 20);
        } catch (error) {
            console.error('Error fetching feed:', error);
            if (!append) setPosts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, filter]);

    // 🔥 FIXED: Fetch sidebar data - now uses equippedBorder
    const fetchSidebarData = useCallback(async () => {
        try {
            // Trending hashtags
            const tagsRes = await api.get('/feed/trending/hashtags?limit=5');
            if (tagsRes.data.hashtags) {
                setTrendingTags(tagsRes.data.hashtags.map(h => ({
                    tag: h.tag,
                    count: h.count > 1000 ? `${(h.count / 1000).toFixed(1)}K` : h.count
                })));
            }

            // Top traders from leaderboard
            const tradersRes = await api.get('/social/leaderboard?sortBy=totalReturnPercent&limit=3');
            console.log('📊 Leaderboard API response:', tradersRes.data);
            
            if (tradersRes.data) {
                setTopTraders(tradersRes.data.slice(0, 3).map(t => {
                    console.log(`👤 Trader ${t.displayName}: equippedBorder = ${t.equippedBorder}`);
                    return {
                        id: t.userId,
                        name: t.displayName,
                        username: t.username,
                        avatar: t.avatar,
                        return: `+${t.totalReturn?.toFixed(0) || 0}%`,
                        followers: t.followersCount || 0,
                        equippedBorder: t.equippedBorder || null  // 🔥 Use equippedBorder
                    };
                }));
            }

            // Suggested users
            const suggestedRes = await api.get('/social/suggested?limit=3');
            if (suggestedRes.data) {
                setSuggestedUsers(suggestedRes.data.map(u => ({
                    id: u._id || u.id,
                    name: u.displayName || u.name,
                    username: u.username,
                    avatar: u.avatar,
                    mutuals: u.mutualFollowers || 0,
                    equippedBorder: u.equippedBorder || null  // 🔥 Use equippedBorder
                })));
            }
        } catch (error) {
            console.error('[Social] Sidebar data error:', error);
        }
    }, [api]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        setNewPostsCount(0);
        fetchFeed(filter, 1, false);
    }, [filter, fetchFeed]);

    // Handle reaction
    const handleReaction = async (postId, reactionType) => {
        try {
            const response = await api.post(`/feed/${postId}/react`, { type: reactionType });
            
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        reactions: response.data.reactions,
                        userReaction: response.data.userReaction
                    };
                }
                return post;
            }));

            setActiveReactionPicker(null);
        } catch (error) {
            console.error('Error reacting:', error);
            handleLike(postId);
        }
    };

    // Handle like
    const handleLike = async (postId) => {
        try {
            const post = posts.find(p => p._id === postId);
            const isLiked = post?.likes?.includes(user?._id);

            if (isLiked) {
                await api.delete(`/feed/${postId}/like`);
            } else {
                await api.post(`/feed/${postId}/like`);
            }

            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const newLikes = isLiked 
                        ? p.likes.filter(id => id !== user._id)
                        : [...(p.likes || []), user._id];
                    return {
                        ...p,
                        likes: newLikes,
                        likesCount: newLikes.length
                    };
                }
                return p;
            }));
        } catch (error) {
            console.error('Error liking:', error);
        }
    };

    // Handle comment
    const handleComment = async (postId) => {
        const text = commentInputs[postId];
        if (!text?.trim()) return;

        try {
            const response = await api.post(`/feed/${postId}/comment`, { text });

            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [...(post.comments || []), response.data.comment],
                        commentsCount: (post.commentsCount || 0) + 1
                    };
                }
                return post;
            }));

            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            toast.success('Comment posted!');
        } catch (error) {
            console.error('Error commenting:', error);
            toast.error('Failed to post comment');
        }
    };

    // Handle share
    const handleShare = async (postId) => {
        try {
            await api.post(`/feed/${postId}/share`);
            
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        sharesCount: (post.sharesCount || 0) + 1
                    };
                }
                return post;
            }));

            toast.success('Post shared to your profile!');
        } catch (error) {
            navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
            toast.success('Link copied to clipboard!');
        }
    };

    // Handle bookmark
    const handleBookmark = async (postId) => {
        try {
            const post = posts.find(p => p._id === postId);
            const isBookmarked = post?.bookmarkedBy?.includes(user?._id);

            if (isBookmarked) {
                await api.delete(`/feed/${postId}/bookmark`);
            } else {
                await api.post(`/feed/${postId}/bookmark`);
            }

            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const newBookmarks = isBookmarked
                        ? (p.bookmarkedBy || []).filter(id => id !== user._id)
                        : [...(p.bookmarkedBy || []), user._id];
                    return {
                        ...p,
                        bookmarkedBy: newBookmarks
                    };
                }
                return p;
            }));

            toast.success(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks!');
        } catch (error) {
            console.error('Error bookmarking:', error);
        }
    };

    // Handle delete post
    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;

        try {
            await api.delete(`/feed/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success('Post deleted');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete post');
        }
    };

    // Create post
    const handleCreatePost = async () => {
        if (!postText.trim() && postType === 'text') {
            toast.error('Please write something!');
            return;
        }

        try {
            const payload = {
                content: postText,
                type: postType
            };

            if (postType === 'trade') {
                payload.trade = tradeData;
            } else if (postType === 'poll') {
                payload.poll = pollData;
            }

            const response = await api.post('/feed', payload);

            setPosts([response.data.post, ...posts]);
            setShowCreateModal(false);
            setPostText('');
            setPostType('text');
            setTradeData({ symbol: '', direction: 'LONG', entryPrice: '', exitPrice: '', quantity: '', pnl: '' });
            setPollData({ question: '', options: ['', ''] });
            
            toast.success('Post created! 🚀');
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
        }
    };

    // Handle poll vote
    const handlePollVote = async (postId, optionIndex) => {
        try {
            const response = await api.post(`/feed/${postId}/vote`, { optionIndex });
            
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        poll: response.data.poll,
                        userVote: optionIndex
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // Toggle comments
    const toggleComments = (postId) => {
        setExpandedComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // ============ EFFECTS ============

    // Initial load
    useEffect(() => {
        if (isAuthenticated) {
            fetchFeed(filter, 1, false);
            fetchSidebarData();
        }
    }, [filter, isAuthenticated, fetchFeed, fetchSidebarData]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1);
                    fetchFeed(filter, page + 1, true);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, page, filter, fetchFeed]);

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveMenu(null);
            setActiveReactionPicker(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

// END OF PART 4A - Continue to Part 4B for JSX Render
// ============ PART 4B OF 5 ============
// JSX Render: Left Sidebar, Feed Header, Create Post Box, Posts Loop
// 🔥 UPDATED: Uses equippedBorder for avatar border colors

    // ============ RENDER ============
    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <MainContent>
                {/* ============ LEFT SIDEBAR ============ */}
                <LeftSidebar>
                    {/* Quick Actions */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Zap size={20} />
                            Quick Actions
                        </SidebarTitle>
                        <QuickAction $active={filter === 'all'} onClick={() => setFilter('all')}>
                            <Sparkles size={18} />
                            Discover
                        </QuickAction>
                        <QuickAction $active={filter === 'following'} onClick={() => setFilter('following')}>
                            <Users size={18} />
                            Following
                        </QuickAction>
                        <QuickAction $active={filter === 'trending'} onClick={() => setFilter('trending')}>
                            <Flame size={18} />
                            Trending
                        </QuickAction>
                        <QuickAction onClick={() => navigate('/leaderboard')}>
                            <Trophy size={18} />
                            Leaderboard
                        </QuickAction>
                    </SidebarCard>

                    {/* Trending Tags */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Hash size={20} />
                            Trending
                        </SidebarTitle>
                        {trendingTags.length > 0 ? trendingTags.map((item, index) => (
                            <TrendingTag key={index}>
                                <TagName>
                                    <TrendingUp size={14} />
                                    {item.tag}
                                </TagName>
                                <TagCount>{item.count} posts</TagCount>
                            </TrendingTag>
                        )) : (
                            <LoadingText>Loading trends...</LoadingText>
                        )}
                    </SidebarCard>
                </LeftSidebar>

                {/* ============ CENTER FEED ============ */}
                <FeedContainer ref={feedRef}>
                    {/* Header */}
                    <FeedHeader>
                        <HeaderTop>
                            <FeedTitle>
                                <Sparkles size={28} />
                                Social Feed
                            </FeedTitle>
                            <HeaderActions>
                                {newPostsCount > 0 && (
                                    <NewPostsAlert onClick={handleRefresh}>
                                        <ArrowUp size={16} />
                                        {newPostsCount} new posts
                                    </NewPostsAlert>
                                )}
                                <RefreshButton 
                                    onClick={handleRefresh}
                                    className={refreshing ? 'spinning' : ''}
                                >
                                    <RefreshCw size={20} />
                                </RefreshButton>
                            </HeaderActions>
                        </HeaderTop>
                        <FilterTabs>
                            <FilterTab $active={filter === 'all'} onClick={() => setFilter('all')}>
                                <Sparkles size={16} />
                                Discover
                            </FilterTab>
                            <FilterTab $active={filter === 'following'} onClick={() => setFilter('following')}>
                                <Users size={16} />
                                Following
                            </FilterTab>
                            <FilterTab $active={filter === 'trending'} onClick={() => setFilter('trending')}>
                                <Flame size={16} />
                                Trending
                            </FilterTab>
                        </FilterTabs>
                    </FeedHeader>

                    {/* 🔥 FIXED: Create Post Box - uses currentUserBorder (from equippedBorder) */}
                    <CreatePostBox>
                        <CreatePostHeader>
                            <UserAvatar 
                                $size="48px" 
                                $fontSize="1.1rem"
                                $borderColor={currentUserBorder.color}
                                $borderWidth="3px"
                                $glow={true}
                            >
                                {user?.profile?.avatar ? (
                                    <img src={user.profile.avatar} alt={user.name} />
                                ) : (
                                    getInitials(user?.name)
                                )}
                            </UserAvatar>
                            <PostInput onClick={() => setShowCreateModal(true)}>
                                What's on your mind, {user?.name?.split(' ')[0]}?
                            </PostInput>
                        </CreatePostHeader>
                        <PostTypeButtons>
                            <PostTypeButton 
                                $color={theme?.success || '#10b981'}
                                $hoverBg={`${theme?.success || '#10b981'}1A`}
                                onClick={() => { setPostType('trade'); setShowCreateModal(true); }}
                            >
                                <TrendingUp size={18} />
                                Trade
                            </PostTypeButton>
                            <PostTypeButton 
                                $color={theme?.brand?.accent || '#a78bfa'}
                                $hoverBg={`${theme?.brand?.accent || '#8b5cf6'}1A`}
                                onClick={() => { setPostType('prediction'); setShowCreateModal(true); }}
                            >
                                <Target size={18} />
                                Prediction
                            </PostTypeButton>
                            <PostTypeButton 
                                $color={theme?.brand?.accent || '#00adef'}
                                $hoverBg={`${theme?.brand?.accent || '#00adef'}1A`}
                                onClick={() => { setPostType('poll'); setShowCreateModal(true); }}
                            >
                                <BarChart2 size={18} />
                                Poll
                            </PostTypeButton>
                            <PostTypeButton 
                                $color={theme?.warning || '#f59e0b'}
                                $hoverBg={`${theme?.warning || '#f59e0b'}1A`}
                                onClick={() => { setPostType('image'); setShowCreateModal(true); }}
                            >
                                <Image size={18} />
                                Media
                            </PostTypeButton>
                        </PostTypeButtons>
                    </CreatePostBox>

                    {/* Posts List */}
                    {loading && posts.length === 0 ? (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText>Loading your feed...</LoadingText>
                        </LoadingContainer>
                    ) : posts.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>
                                <MessageCircle size={60} color={theme?.brand?.primary || '#ffd700'} />
                            </EmptyIcon>
                            <EmptyTitle>
                                {filter === 'following' ? 'No posts from people you follow' : 'No posts yet'}
                            </EmptyTitle>
                            <EmptyText>
                                {filter === 'following' 
                                    ? 'Follow some traders to see their posts!'
                                    : 'Be the first to share something!'}
                            </EmptyText>
                            <EmptyButton onClick={() => setShowCreateModal(true)}>
                                <Plus size={20} />
                                Create Post
                            </EmptyButton>
                        </EmptyState>
                    ) : (
                        posts.map(post => {
                            // 🔥 FIXED: Get border color from THIS post author's equippedBorder
                            const authorBorder = getAvatarBorderColor(post.author?.equippedBorder);
                            console.log(`📝 Post by ${post.author?.username}: equippedBorder = ${post.author?.equippedBorder}, color = ${authorBorder.color}`);
                            
                            return (
                                <PostCard key={post._id} $isPinned={post.isPinned}>
                                    {/* Post Header */}
                                    <PostHeader>
                                        <PostAuthor>
                                            <UserAvatar 
                                                $size="44px" 
                                                $fontSize="1rem"
                                                $borderColor={authorBorder.color}
                                                $borderWidth="3px"
                                                $glow={true}
                                                onClick={() => navigate(`/profile/${post.author?.username}`)}
                                            >
                                                {post.author?.avatar ? (
                                                    <img src={post.author.avatar} alt={post.author?.displayName} />
                                                ) : (
                                                    getInitials(post.author?.displayName)
                                                )}
                                            </UserAvatar>
                                            <AuthorInfo>
                                                <AuthorName onClick={() => navigate(`/profile/${post.author?.username}`)}>
                                                    {post.author?.displayName || 'Anonymous'}
                                                    {post.author?.verified && (
                                                        <VerifiedBadge>
                                                            <Check size={12} />
                                                        </VerifiedBadge>
                                                    )}
                                                    {post.author?.level && (
                                                        <LevelBadge>Lv {post.author.level}</LevelBadge>
                                                    )}
                                                    <AuthorBadges badges={post.author?.equippedBadges} maxDisplay={3} />
                                                </AuthorName>
                                                <AuthorMeta>
                                                    <Username onClick={() => navigate(`/profile/${post.author?.username}`)}>
                                                        @{post.author?.username}
                                                    </Username>
                                                    <span>•</span>
                                                    <PostTime>
                                                        <Clock size={12} />
                                                        {formatTimeAgo(post.createdAt)}
                                                    </PostTime>
                                                </AuthorMeta>
                                            </AuthorInfo>
                                        </PostAuthor>
                                        
                                        <PostMenu onClick={(e) => e.stopPropagation()}>
                                            <MenuButton onClick={() => setActiveMenu(activeMenu === post._id ? null : post._id)}>
                                                <MoreHorizontal size={20} />
                                            </MenuButton>
                                            {activeMenu === post._id && (
                                                <MenuDropdown>
                                                    <MenuItem onClick={() => { handleBookmark(post._id); setActiveMenu(null); }}>
                                                        {post.bookmarkedBy?.includes(user?._id) ? (
                                                            <><BookmarkCheck size={16} /> Saved</>
                                                        ) : (
                                                            <><Bookmark size={16} /> Save Post</>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); toast.success('Link copied!'); setActiveMenu(null); }}>
                                                        <Link2 size={16} /> Copy Link
                                                    </MenuItem>
                                                    {post.author?._id === user?._id && (
                                                        <MenuItem $danger onClick={() => { handleDeletePost(post._id); setActiveMenu(null); }}>
                                                            <Trash2 size={16} /> Delete
                                                        </MenuItem>
                                                    )}
                                                    {post.author?._id !== user?._id && (
                                                        <MenuItem onClick={() => setActiveMenu(null)}>
                                                            <Flag size={16} /> Report
                                                        </MenuItem>
                                                    )}
                                                </MenuDropdown>
                                            )}
                                        </PostMenu>
                                    </PostHeader>

                                    {/* Post Content */}
                                    <PostContent>
                                        <PostText>{renderPostContent(post.content)}</PostText>

                                        {/* Trade Attachment */}
                                        {post.type === 'trade' && post.trade && (
                                            <TradeAttachment $profitable={parseFloat(post.trade.pnl) >= 0}>
                                                <TradeHeader>
                                                    <TradeSymbol>
                                                        <SymbolIcon>{post.trade.symbol?.slice(0, 2)}</SymbolIcon>
                                                        <SymbolInfo>
                                                            <SymbolName>
                                                                ${post.trade.symbol}
                                                                <TradeDirection $type={post.trade.direction}>
                                                                    {post.trade.direction}
                                                                </TradeDirection>
                                                            </SymbolName>
                                                            <SymbolCompany>Paper Trade</SymbolCompany>
                                                        </SymbolInfo>
                                                    </TradeSymbol>
                                                    <TradePnL>
                                                        <PnLValue $positive={parseFloat(post.trade.pnl) >= 0}>
                                                            {parseFloat(post.trade.pnl) >= 0 ? '+' : ''}
                                                            ${Math.abs(parseFloat(post.trade.pnl)).toFixed(2)}
                                                        </PnLValue>
                                                        <PnLPercent $positive={parseFloat(post.trade.pnlPercent) >= 0}>
                                                            {parseFloat(post.trade.pnlPercent) >= 0 ? '+' : ''}
                                                            {post.trade.pnlPercent}%
                                                        </PnLPercent>
                                                    </TradePnL>
                                                </TradeHeader>
                                                <TradeDetails>
                                                    <TradeDetail>
                                                        <DetailLabel>Entry</DetailLabel>
                                                        <DetailValue>${post.trade.entryPrice}</DetailValue>
                                                    </TradeDetail>
                                                    <TradeDetail>
                                                        <DetailLabel>Exit</DetailLabel>
                                                        <DetailValue>${post.trade.exitPrice}</DetailValue>
                                                    </TradeDetail>
                                                    <TradeDetail>
                                                        <DetailLabel>Shares</DetailLabel>
                                                        <DetailValue>{post.trade.quantity}</DetailValue>
                                                    </TradeDetail>
                                                    <TradeDetail>
                                                        <DetailLabel>Duration</DetailLabel>
                                                        <DetailValue>{post.trade.duration || 'N/A'}</DetailValue>
                                                    </TradeDetail>
                                                </TradeDetails>
                                                <CopyTradeButton>
                                                    <Copy size={16} />
                                                    Copy Trade Setup
                                                </CopyTradeButton>
                                            </TradeAttachment>
                                        )}

                                        {/* Poll Attachment */}
                                        {post.type === 'poll' && post.poll && (
                                            <PollContainer>
                                                <PollQuestion>{post.poll.question}</PollQuestion>
                                                {post.poll.options.map((option, index) => {
                                                    const totalVotes = post.poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
                                                    const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                                                    const hasVoted = post.userVote !== undefined;
                                                    
                                                    return (
                                                        <PollOption 
                                                            key={index}
                                                            $selected={post.userVote === index}
                                                            $voted={hasVoted}
                                                            onClick={() => !hasVoted && handlePollVote(post._id, index)}
                                                        >
                                                            {hasVoted && <PollProgressBar $percent={percent} />}
                                                            <PollOptionContent>
                                                                <PollOptionText>{option.text}</PollOptionText>
                                                                {hasVoted && <PollOptionPercent>{percent}%</PollOptionPercent>}
                                                            </PollOptionContent>
                                                        </PollOption>
                                                    );
                                                })}
                                                <PollStats>
                                                    <span>{post.poll.totalVotes || 0} votes</span>
                                                    <span>•</span>
                                                    <span>{post.poll.endsIn || '24h left'}</span>
                                                </PollStats>
                                            </PollContainer>
                                        )}

                                        {/* Images */}
                                        {post.images?.length > 0 && (
                                            <ImageGrid $count={post.images.length}>
                                                {post.images.map((img, index) => (
                                                    <PostImage 
                                                        key={index} 
                                                        src={img} 
                                                        alt=""
                                                        $single={post.images.length === 1}
                                                    />
                                                ))}
                                            </ImageGrid>
                                        )}
                                    </PostContent>

                                    {/* Post Stats */}
                                    <PostStats>
                                        <StatsLeft>
                                            <ReactionsList>
                                                {REACTIONS.slice(0, 3).map((reaction, index) => (
                                                    <ReactionBubble key={index} $color={reaction.color}>
                                                        {reaction.emoji}
                                                    </ReactionBubble>
                                                ))}
                                            </ReactionsList>
                                            <ReactionCount>
                                                {post.likesCount || post.likes?.length || 0} reactions
                                            </ReactionCount>
                                        </StatsLeft>
                                        <StatsRight>
                                            <StatItem onClick={() => toggleComments(post._id)}>
                                                {post.commentsCount || 0} comments
                                            </StatItem>
                                            <StatItem>
                                                {post.sharesCount || 0} shares
                                            </StatItem>
                                        </StatsRight>
                                    </PostStats>

                                    {/* Post Actions */}
                                    <PostActions>
                                        <ActionButton 
                                            $active={post.likes?.includes(user?._id)}
                                            $activeColor={theme?.error || '#ef4444'}
                                            $hoverBg={`${theme?.error || '#ef4444'}1A`}
                                            $hoverColor={theme?.error || '#ef4444'}
                                            onMouseEnter={() => setActiveReactionPicker(post._id)}
                                            onMouseLeave={() => setTimeout(() => setActiveReactionPicker(null), 500)}
                                            onClick={() => handleLike(post._id)}
                                        >
                                            <Heart size={20} fill={post.likes?.includes(user?._id) ? theme?.error || '#ef4444' : 'none'} />
                                            Like
                                            
                                            {activeReactionPicker === post._id && (
                                                <ReactionsPopup 
                                                    onMouseEnter={() => setActiveReactionPicker(post._id)}
                                                    onMouseLeave={() => setActiveReactionPicker(null)}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {REACTIONS.map((reaction, index) => (
                                                        <ReactionButton 
                                                            key={index}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReaction(post._id, reaction.name);
                                                            }}
                                                        >
                                                            {reaction.emoji}
                                                        </ReactionButton>
                                                    ))}
                                                </ReactionsPopup>
                                            )}
                                        </ActionButton>
                                        
                                        <ActionButton onClick={() => toggleComments(post._id)}>
                                            <MessageCircle size={20} />
                                            Comment
                                        </ActionButton>
                                        
                                        <ActionButton onClick={() => handleShare(post._id)}>
                                            <Share2 size={20} />
                                            Share
                                        </ActionButton>
                                        
                                        <ActionButton 
                                            $active={post.bookmarkedBy?.includes(user?._id)}
                                            $activeColor={theme?.brand?.primary || '#ffd700'}
                                            onClick={() => handleBookmark(post._id)}
                                        >
                                            {post.bookmarkedBy?.includes(user?._id) ? (
                                                <BookmarkCheck size={20} />
                                            ) : (
                                                <Bookmark size={20} />
                                            )}
                                            Save
                                        </ActionButton>
                                    </PostActions>

                                    {/* 🔥 FIXED: Comments Section - each comment author uses their equippedBorder */}
                                    {expandedComments[post._id] && (
                                        <CommentsSection>
                                            {post.comments?.length > 0 && (
                                                <CommentsList>
                                                    {post.comments.slice(-5).map((comment, index) => {
                                                        const commentAuthorBorder = getAvatarBorderColor(comment.author?.equippedBorder);
                                                        return (
                                                            <Comment key={index}>
                                                                <UserAvatar 
                                                                    $size="32px" 
                                                                    $fontSize="0.75rem"
                                                                    $borderColor={commentAuthorBorder.color}
                                                                    $borderWidth="2px"
                                                                    $glow={false}
                                                                    onClick={() => navigate(`/profile/${comment.author?.username}`)}
                                                                >
                                                                    {comment.author?.avatar ? (
                                                                        <img src={comment.author.avatar} alt={comment.author?.displayName} />
                                                                    ) : (
                                                                        getInitials(comment.author?.displayName)
                                                                    )}
                                                                </UserAvatar>
                                                                <CommentContent>
                                                                    <CommentBubble>
                                                                        <CommentAuthor onClick={() => navigate(`/profile/${comment.author?.username}`)}>
                                                                            {comment.author?.displayName}
                                                                        </CommentAuthor>
                                                                        <CommentText>{comment.text}</CommentText>
                                                                    </CommentBubble>
                                                                    <CommentMeta>
                                                                        <span>{formatTimeAgo(comment.createdAt)}</span>
                                                                        <CommentAction>Like</CommentAction>
                                                                        <CommentAction>Reply</CommentAction>
                                                                    </CommentMeta>
                                                                </CommentContent>
                                                            </Comment>
                                                        );
                                                    })}
                                                </CommentsList>
                                            )}
                                            <CommentInput>
                                                <UserAvatar 
                                                    $size="36px" 
                                                    $fontSize="0.85rem"
                                                    $borderColor={currentUserBorder.color}
                                                    $borderWidth="2px"
                                                    $glow={false}
                                                >
                                                    {user?.profile?.avatar ? (
                                                        <img src={user.profile.avatar} alt={user?.name} />
                                                    ) : (
                                                        getInitials(user?.name)
                                                    )}
                                                </UserAvatar>
                                                <CommentTextarea
                                                    placeholder="Write a comment..."
                                                    value={commentInputs[post._id] || ''}
                                                    onChange={(e) => setCommentInputs(prev => ({ 
                                                        ...prev, 
                                                        [post._id]: e.target.value 
                                                    }))}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                                                />
                                                <SendButton 
                                                    onClick={() => handleComment(post._id)}
                                                    disabled={!commentInputs[post._id]?.trim()}
                                                >
                                                    <Send size={18} />
                                                </SendButton>
                                            </CommentInput>
                                        </CommentsSection>
                                    )}
                                </PostCard>
                            );
                        })
                    )}

                    {/* Infinite Scroll Target */}
                    <div ref={observerTarget} style={{ height: '20px' }} />

                    {/* Loading More */}
                    {loading && posts.length > 0 && (
                        <LoadingContainer>
                            <LoadingSpinner />
                        </LoadingContainer>
                    )}

                    {/* End of Feed */}
                    {!hasMore && posts.length > 0 && (
                        <EndMessage>
                            <Sparkles size={20} color={theme?.brand?.primary || '#ffd700'} />
                            You've reached the end! 🎉
                        </EndMessage>
                    )}
                </FeedContainer>



                {/* ============ RIGHT SIDEBAR ============ */}
                <RightSidebar>
                    {/* 🔥 FIXED: Top Traders - each trader uses their equippedBorder */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Trophy size={20} />
                            Top Traders
                        </SidebarTitle>
                        {topTraders.length > 0 ? topTraders.map((trader, index) => {
                            const traderBorder = getAvatarBorderColor(trader.equippedBorder);
                            console.log(`🏆 Trader ${trader.name}: border=${trader.equippedBorder}, color=${traderBorder.color}`);
                            return (
                                <TopTraderCard 
                                    key={trader.id} 
                                    onClick={() => navigate(`/profile/${trader.username}`)}
                                >
                                    <TraderRank $rank={index + 1}>{index + 1}</TraderRank>
                                    <UserAvatar 
                                        $size="36px" 
                                        $fontSize="0.85rem"
                                        $borderColor={traderBorder.color}
                                        $borderWidth="2px"
                                        $glow={true}
                                    >
                                        {trader.avatar ? (
                                            <img src={trader.avatar} alt={trader.name} />
                                        ) : (
                                            getInitials(trader.name)
                                        )}
                                    </UserAvatar>
                                    <TraderInfo>
                                        <TraderName>{trader.name}</TraderName>
                                        <TraderStat>{trader.return} this month</TraderStat>
                                    </TraderInfo>
                                    <FollowBadge onClick={(e) => e.stopPropagation()}>
                                        Follow
                                    </FollowBadge>
                                </TopTraderCard>
                            );
                        }) : (
                            <LoadingText>Loading top traders...</LoadingText>
                        )}
                    </SidebarCard>

                    {/* 🔥 FIXED: Suggested Users - each user uses their equippedBorder */}
                    <SidebarCard>
                        <SidebarTitle>
                            <UserPlus size={20} />
                            Who to Follow
                        </SidebarTitle>
                        {suggestedUsers.length > 0 ? suggestedUsers.map(suggestedUser => {
                            const suggestedBorder = getAvatarBorderColor(suggestedUser.equippedBorder);
                            return (
                                <SuggestedUser 
                                    key={suggestedUser.id}
                                    onClick={() => navigate(`/profile/${suggestedUser.username}`)}
                                >
                                    <UserAvatar 
                                        $size="40px" 
                                        $fontSize="0.95rem"
                                        $borderColor={suggestedBorder.color}
                                        $borderWidth="2px"
                                        $glow={true}
                                    >
                                        {suggestedUser.avatar ? (
                                            <img src={suggestedUser.avatar} alt={suggestedUser.name} />
                                        ) : (
                                            getInitials(suggestedUser.name)
                                        )}
                                    </UserAvatar>
                                    <SuggestedInfo>
                                        <SuggestedName>{suggestedUser.name}</SuggestedName>
                                        <SuggestedMutual>{suggestedUser.mutuals} mutual followers</SuggestedMutual>
                                    </SuggestedInfo>
                                    <FollowBadge onClick={(e) => e.stopPropagation()}>
                                        Follow
                                    </FollowBadge>
                                </SuggestedUser>
                            );
                        }) : (
                            <LoadingText>Finding suggestions...</LoadingText>
                        )}
                    </SidebarCard>

                    {/* Live Activity */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Activity size={20} />
                            Live Activity
                        </SidebarTitle>
                        <LiveActivityPlaceholder>
                            <Zap size={32} color={theme?.brand?.primary || '#ffd700'} style={{ marginBottom: '0.5rem' }} />
                            <div>Real-time trading activity coming soon!</div>
                        </LiveActivityPlaceholder>
                    </SidebarCard>
                </RightSidebar>
            </MainContent>

            {/* ============ CREATE POST MODAL ============ */}
            {showCreateModal && (
                <ModalOverlay onClick={() => setShowCreateModal(false)}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Create Post</ModalTitle>
                            <CloseButton onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>

                        <ModalBody>
                            {/* Post Type Selector */}
                            <PostTypeSelector>
                                <PostTypeChip 
                                    $active={postType === 'text'} 
                                    onClick={() => setPostType('text')}
                                >
                                    <MessageSquare size={16} />
                                    Text
                                </PostTypeChip>
                                <PostTypeChip 
                                    $active={postType === 'trade'} 
                                    onClick={() => setPostType('trade')}
                                >
                                    <TrendingUp size={16} />
                                    Trade
                                </PostTypeChip>
                                <PostTypeChip 
                                    $active={postType === 'poll'} 
                                    onClick={() => setPostType('poll')}
                                >
                                    <BarChart2 size={16} />
                                    Poll
                                </PostTypeChip>
                                <PostTypeChip 
                                    $active={postType === 'image'} 
                                    onClick={() => setPostType('image')}
                                >
                                    <Image size={16} />
                                    Media
                                </PostTypeChip>
                            </PostTypeSelector>

                            {/* Post Text */}
                            <TextArea
                                placeholder={
                                    postType === 'trade' ? "Share your trade story..." :
                                    postType === 'poll' ? "Ask a question..." :
                                    "What's happening in the markets?"
                                }
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                maxLength={1000}
                            />
                            <CharCount $over={postText.length > 1000}>
                                {postText.length}/1000
                            </CharCount>

                            {/* Trade Form */}
                            {postType === 'trade' && (
                                <AttachmentPreview>
                                    <AttachmentHeader>
                                        <AttachmentTitle>
                                            <TrendingUp size={18} color={theme?.success || '#10b981'} />
                                            Trade Details
                                        </AttachmentTitle>
                                        <RemoveAttachment onClick={() => setPostType('text')}>
                                            <X size={18} />
                                        </RemoveAttachment>
                                    </AttachmentHeader>
                                    <TradeForm>
                                        <FormRow>
                                            <FormGroup>
                                                <FormLabel>Symbol</FormLabel>
                                                <FormInput
                                                    placeholder="e.g. AAPL"
                                                    value={tradeData.symbol}
                                                    onChange={(e) => setTradeData({...tradeData, symbol: e.target.value.toUpperCase()})}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Direction</FormLabel>
                                                <FormSelect
                                                    value={tradeData.direction}
                                                    onChange={(e) => setTradeData({...tradeData, direction: e.target.value})}
                                                >
                                                    <option value="LONG">Long (Buy)</option>
                                                    <option value="SHORT">Short (Sell)</option>
                                                </FormSelect>
                                            </FormGroup>
                                        </FormRow>
                                        <FormRow>
                                            <FormGroup>
                                                <FormLabel>Entry Price</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={tradeData.entryPrice}
                                                    onChange={(e) => setTradeData({...tradeData, entryPrice: e.target.value})}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Exit Price</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={tradeData.exitPrice}
                                                    onChange={(e) => setTradeData({...tradeData, exitPrice: e.target.value})}
                                                />
                                            </FormGroup>
                                        </FormRow>
                                        <FormRow>
                                            <FormGroup>
                                                <FormLabel>Quantity</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0"
                                                    value={tradeData.quantity}
                                                    onChange={(e) => setTradeData({...tradeData, quantity: e.target.value})}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>P&L ($)</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={tradeData.pnl}
                                                    onChange={(e) => setTradeData({...tradeData, pnl: e.target.value})}
                                                />
                                            </FormGroup>
                                        </FormRow>
                                    </TradeForm>
                                </AttachmentPreview>
                            )}

                            {/* Poll Form */}
                            {postType === 'poll' && (
                                <AttachmentPreview>
                                    <AttachmentHeader>
                                        <AttachmentTitle>
                                            <BarChart2 size={18} color={theme?.brand?.accent || '#00adef'} />
                                            Poll Options
                                        </AttachmentTitle>
                                        <RemoveAttachment onClick={() => setPostType('text')}>
                                            <X size={18} />
                                        </RemoveAttachment>
                                    </AttachmentHeader>
                                    <PollForm>
                                        {pollData.options.map((option, index) => (
                                            <PollOptionInput key={index}>
                                                <OptionInput
                                                    placeholder={`Option ${index + 1}`}
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...pollData.options];
                                                        newOptions[index] = e.target.value;
                                                        setPollData({...pollData, options: newOptions});
                                                    }}
                                                />
                                                {pollData.options.length > 2 && (
                                                    <RemoveOptionButton onClick={() => {
                                                        const newOptions = pollData.options.filter((_, i) => i !== index);
                                                        setPollData({...pollData, options: newOptions});
                                                    }}>
                                                        <X size={18} />
                                                    </RemoveOptionButton>
                                                )}
                                            </PollOptionInput>
                                        ))}
                                        {pollData.options.length < 4 && (
                                            <AddOptionButton onClick={() => {
                                                setPollData({...pollData, options: [...pollData.options, '']});
                                            }}>
                                                <Plus size={18} />
                                                Add Option
                                            </AddOptionButton>
                                        )}
                                    </PollForm>
                                </AttachmentPreview>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <FooterActions>
                                <FooterButton>
                                    <Image size={20} />
                                </FooterButton>
                                <FooterButton>
                                    <Smile size={20} />
                                </FooterButton>
                                <FooterButton>
                                    <Hash size={20} />
                                </FooterButton>
                                <FooterButton>
                                    <AtSign size={20} />
                                </FooterButton>
                            </FooterActions>
                            <PostButton 
                                onClick={handleCreatePost}
                                disabled={!postText.trim() && postType === 'text'}
                            >
                                <Send size={18} />
                                Post
                            </PostButton>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default SocialFeed;


