// client/src/pages/NewsPage.js - LEGENDARY NEWS FEED WITH AI SENTIMENT ANALYSIS
// THEMED VERSION - Uses ThemeContext for dynamic styling

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css, useTheme } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import {
    Newspaper, TrendingUp, TrendingDown, Minus, Search,
    Clock, ExternalLink, Bookmark, BookmarkCheck, Share2,
    Sparkles, Globe, RefreshCw, Flame, Brain, Activity,
    BarChart3, X, Twitter, Linkedin, Copy, ChevronRight,
    Zap, Eye, Filter, Bitcoin
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

// ============ LAYOUT ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${({ theme }) => theme.bg?.page || '#080b16'};
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    padding: 5.5rem 1.5rem 3rem;
`;

const ContentWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

// ============ HEADER ============
const Header = styled.header`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
    font-size: 2.25rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text?.primary || '#fff'};
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.25rem;

    svg {
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

const Subtitle = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#64748b'};
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        color: ${({ theme }) => theme.brand?.accent || '#8b5cf6'};
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: center;
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.25rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => theme.glow?.primary || '0 8px 20px rgba(0, 173, 237, 0.35)'};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    svg {
        ${props => props.$loading && css`animation: ${rotate} 1s linear infinite;`}
    }
`;

// ============ STATS BAR ============
const StatsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out 0.1s backwards;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.15)'};
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.15)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#00adef'};
`;

const StatContent = styled.div``;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text?.primary || '#fff'};
`;

const StatLabel = styled.div`
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text?.secondary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

// ============ FILTERS & SEARCH ============
const FiltersRow = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.5s ease-out 0.15s backwards;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchWrapper = styled.div`
    flex: 1;
    position: relative;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.text?.secondary || '#64748b'};
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.85rem 1rem 0.85rem 2.75rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.7)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.2)'};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${({ theme }) => `${theme.brand?.primary}15` || 'rgba(0, 173, 237, 0.1)'};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#475569'};
    }
`;

const FilterGroup = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const FilterPill = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.7rem 1rem;
    background: ${props => props.$active 
        ? `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}25 0%, ${props.theme.brand?.primary || '#00adef'}10 100%)`
        : props.theme.bg?.input || 'rgba(15, 23, 42, 0.7)'};
    border: 1px solid ${props => props.$active 
        ? `${props.theme.brand?.primary || '#00adef'}40` 
        : props.theme.border?.primary || 'rgba(100, 116, 139, 0.2)'};
    border-radius: 10px;
    color: ${props => props.$active 
        ? props.theme.brand?.primary || '#00adef' 
        : props.theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}40`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

const SentimentPill = styled(FilterPill)`
    background: ${props => {
        if (!props.$active) return props.theme.bg?.input || 'rgba(15, 23, 42, 0.7)';
        if (props.$sentiment === 'bullish') return 'rgba(16, 185, 129, 0.2)';
        if (props.$sentiment === 'bearish') return 'rgba(239, 68, 68, 0.2)';
        if (props.$sentiment === 'neutral') return 'rgba(245, 158, 11, 0.2)';
        return `${props.theme.brand?.primary || '#00adef'}20`;
    }};
    border-color: ${props => {
        if (!props.$active) return props.theme.border?.primary || 'rgba(100, 116, 139, 0.2)';
        if (props.$sentiment === 'bullish') return 'rgba(16, 185, 129, 0.4)';
        if (props.$sentiment === 'bearish') return 'rgba(239, 68, 68, 0.4)';
        if (props.$sentiment === 'neutral') return 'rgba(245, 158, 11, 0.4)';
        return `${props.theme.brand?.primary || '#00adef'}40`;
    }};
    color: ${props => {
        if (!props.$active) return props.theme.text?.secondary || '#94a3b8';
        if (props.$sentiment === 'bullish') return '#10b981';
        if (props.$sentiment === 'bearish') return '#ef4444';
        if (props.$sentiment === 'neutral') return '#f59e0b';
        return props.theme.brand?.primary || '#00adef';
    }};
`;

// ============ CATEGORY TABS ============
const CategoryTabs = styled.div`
    display: flex;
    gap: 0.25rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.15)'};
    padding-bottom: 0;
    overflow-x: auto;
    animation: ${fadeIn} 0.5s ease-out 0.2s backwards;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const CategoryTab = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 1.25rem;
    background: transparent;
    border: none;
    border-bottom: 2px solid ${props => props.$active 
        ? props.theme.brand?.primary || '#00adef' 
        : 'transparent'};
    color: ${props => props.$active 
        ? props.theme.brand?.primary || '#00adef' 
        : props.theme.text?.secondary || '#64748b'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    margin-bottom: -1px;

    &:hover {
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }

    svg {
        opacity: ${props => props.$active ? 1 : 0.6};
    }
`;

const TabBadge = styled.span`
    padding: 0.2rem 0.5rem;
    background: ${props => props.$active 
        ? `${props.theme.brand?.primary || '#00adef'}20` 
        : props.theme.bg?.accent || 'rgba(100, 116, 139, 0.2)'};
    border-radius: 6px;
    font-size: 0.75rem;
    color: ${props => props.$active 
        ? props.theme.brand?.primary || '#00adef' 
        : props.theme.text?.secondary || '#64748b'};
`;

// ============ NEWS LAYOUT ============
const NewsLayout = styled.div`
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2rem;
    animation: ${fadeIn} 0.5s ease-out 0.25s backwards;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
    }
`;

const MainColumn = styled.div``;

const Sidebar = styled.aside`
    @media (max-width: 1100px) {
        display: none;
    }
`;

// ============ FEATURED ARTICLE ============
const FeaturedCard = styled.article`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.15)'};
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}30`};
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => {
            if (props.$sentiment === 'bullish') return 'linear-gradient(90deg, #10b981, #34d399)';
            if (props.$sentiment === 'bearish') return 'linear-gradient(90deg, #ef4444, #f87171)';
            return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        }};
    }
`;

const FeaturedImage = styled.div`
    height: 280px;
    background: ${props => props.$src 
        ? `linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.95) 100%), url(${props.$src}) center/cover`
        : `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}15 0%, ${props.theme.brand?.accent || '#8b5cf6'}10 100%)`
    };
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
    position: relative;
`;

const FeaturedBadges = styled.div`
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const TrendingBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: rgba(245, 158, 11, 0.9);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    color: white;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const SentimentBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    background: ${props => {
        if (props.$sentiment === 'bullish') return 'rgba(16, 185, 129, 0.9)';
        if (props.$sentiment === 'bearish') return 'rgba(239, 68, 68, 0.9)';
        return 'rgba(245, 158, 11, 0.9)';
    }};
    backdrop-filter: blur(8px);
    border-radius: 8px;
    color: white;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const FeaturedContent = styled.div`
    padding: 1.5rem;
`;

const FeaturedMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
`;

const SourceBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
`;

const SourceLogo = styled.div`
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
    color: white;
`;

const TimeBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
`;

const CategoryBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.6rem;
    background: ${props => props.$category === 'crypto' 
        ? 'rgba(245, 158, 11, 0.15)' 
        : 'rgba(59, 130, 246, 0.15)'};
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.$category === 'crypto' ? '#f59e0b' : '#3b82f6'};
    text-transform: uppercase;
`;

const FeaturedTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text?.primary || '#fff'};
    line-height: 1.35;
    margin-bottom: 0.75rem;
`;

const FeaturedDescription = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const FeaturedFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TickerList = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const TickerChip = styled.span`
    padding: 0.3rem 0.6rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}15`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}25`};
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}25`};
        transform: translateY(-1px);
    }
`;

const ConfidenceMeter = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
`;

const ConfidenceBar = styled.div`
    width: 60px;
    height: 6px;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.2)'};
    border-radius: 3px;
    overflow: hidden;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$percent}%;
    background: ${props => {
        if (props.$percent >= 80) return 'linear-gradient(90deg, #10b981, #34d399)';
        if (props.$percent >= 60) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        return 'linear-gradient(90deg, #ef4444, #f87171)';
    }};
    border-radius: 3px;
`;

// ============ NEWS LIST ============
const NewsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const NewsCard = styled.article`
    display: flex;
    gap: 1rem;
    background: ${({ theme }) => theme.bg?.card || 'rgba(15, 23, 42, 0.5)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.12)'};
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${({ theme }) => theme.bg?.cardHover || 'rgba(20, 30, 50, 0.6)'};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}25`};
        transform: translateX(4px);
    }

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: ${props => {
            if (props.$sentiment === 'bullish') return '#10b981';
            if (props.$sentiment === 'bearish') return '#ef4444';
            return '#f59e0b';
        }};
        border-radius: 3px 0 0 3px;
    }
`;

const NewsThumb = styled.div`
    width: 100px;
    height: 80px;
    border-radius: 8px;
    background: ${props => props.$src 
        ? `url(${props.$src}) center/cover`
        : `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}20 0%, ${props.theme.brand?.accent || '#8b5cf6'}10 100%)`
    };
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.text?.tertiary || '#475569'};
`;

const NewsInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const NewsCardMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.4rem;
`;

const NewsCardTitle = styled.h3`
    font-size: 0.95rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    line-height: 1.4;
    margin-bottom: 0.4rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const NewsCardFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const NewsCardTickers = styled.div`
    display: flex;
    gap: 0.35rem;
`;

const MiniTicker = styled.span`
    padding: 0.15rem 0.4rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}10`};
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
`;

const NewsCardActions = styled.div`
    display: flex;
    gap: 0.35rem;
`;

const IconButton = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: ${props => props.$active 
        ? 'rgba(245, 158, 11, 0.15)' 
        : props.theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'};
    border: none;
    color: ${props => props.$active 
        ? '#f59e0b' 
        : props.theme.text?.tertiary || '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}15`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

// ============ SIDEBAR COMPONENTS ============
const SidebarSection = styled.section`
    background: ${({ theme }) => theme.bg?.card || 'rgba(15, 23, 42, 0.5)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.12)'};
    border-radius: 14px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
`;

const SidebarTitle = styled.h3`
    font-size: 1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#fff'};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

const TrendingList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const TrendingItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.65rem;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.08)'};
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}10`};
        transform: translateX(4px);
    }
`;

const TrendingRank = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #f59e0b, #d97706)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #94a3b8, #64748b)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #b45309, #92400e)';
        return props.theme.bg?.accent || 'rgba(100, 116, 139, 0.2)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    color: white;
`;

const TrendingInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const TrendingTicker = styled.div`
    font-size: 0.9rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#fff'};
`;

const TrendingMentions = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
`;

const TrendingChange = styled.div`
    font-size: 0.85rem;
    font-weight: 700;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.2rem;
`;

// Sentiment breakdown
const SentimentBreakdown = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const SentimentRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SentimentLabel = styled.div`
    width: 70px;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => {
        if (props.$type === 'bullish') return '#10b981';
        if (props.$type === 'bearish') return '#ef4444';
        return '#f59e0b';
    }};
`;

const SentimentBarBg = styled.div`
    flex: 1;
    height: 8px;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.15)'};
    border-radius: 4px;
    overflow: hidden;
`;

const SentimentBarFill = styled.div`
    height: 100%;
    width: ${props => props.$percent}%;
    background: ${props => {
        if (props.$type === 'bullish') return 'linear-gradient(90deg, #10b981, #34d399)';
        if (props.$type === 'bearish') return 'linear-gradient(90deg, #ef4444, #f87171)';
        return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    }};
    border-radius: 4px;
    transition: width 0.5s ease;
`;

const SentimentPercent = styled.div`
    width: 40px;
    text-align: right;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
`;

// ============ MODAL ============
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1.5rem;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(145deg, #141b2d 0%, #0f172a 100%)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.2)'};
    border-radius: 20px;
    padding: 2rem;
    max-width: 720px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    animation: ${fadeInScale} 0.3s ease-out;
    position: relative;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.border?.secondary || 'rgba(100, 116, 139, 0.3)'};
        border-radius: 3px;
    }
`;

const ModalClose = styled.button`
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: scale(1.05);
    }
`;

const ModalHeader = styled.div`
    margin-bottom: 1.5rem;
    padding-right: 3rem;
`;

const ModalMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
`;

const ModalTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${({ theme }) => theme.text?.primary || '#fff'};
    line-height: 1.35;
`;

const ModalAISection = styled.div`
    background: linear-gradient(135deg, ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}12`} 0%, ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}05`} 100%);
    border: 1px solid ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}25`};
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
`;

const ModalAITitle = styled.h4`
    font-size: 0.9rem;
    font-weight: 700;
    color: ${({ theme }) => theme.brand?.accent || '#a78bfa'};
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ModalAIText = styled.p`
    color: ${({ theme }) => `${theme.brand?.accent || '#c4b5fd'}cc`};
    font-size: 0.9rem;
    line-height: 1.7;
`;

const ModalBody = styled.div`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.95rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;
`;

const ModalFooter = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1.25rem;
    border-top: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.15)'};
`;

const ModalButton = styled.button`
    flex: 1;
    min-width: 120px;
    padding: 0.75rem 1rem;
    background: ${props => props.$primary 
        ? props.theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'
        : props.theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'};
    border: 1px solid ${props => props.$primary 
        ? 'transparent' 
        : props.theme.border?.primary || 'rgba(100, 116, 139, 0.2)'};
    border-radius: 10px;
    color: ${props => props.$primary 
        ? 'white' 
        : props.theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        ${props => !props.$primary && `background: ${props.theme.bg?.cardHover || 'rgba(100, 116, 139, 0.15)'};`}
    }
`;

// ============ LOADING & EMPTY ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}20`};
    border-top-color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    border-radius: 50%;
    animation: ${rotate} 0.8s linear infinite;
`;

const LoadingText = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.95rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.text?.tertiary || '#475569'};
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.95rem;
`;

// ============ SKELETON LOADING ============
const SkeletonCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(15, 23, 42, 0.5)'};
    border: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.12)'};
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    gap: 1rem;
`;

const SkeletonThumb = styled.div`
    width: 100px;
    height: 80px;
    border-radius: 8px;
    background: linear-gradient(90deg, 
        ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'} 0%, 
        ${({ theme }) => theme.bg?.cardHover || 'rgba(100, 116, 139, 0.2)'} 50%, 
        ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'} 100%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease-in-out infinite;
`;

const SkeletonContent = styled.div`
    flex: 1;
`;

const SkeletonLine = styled.div`
    height: ${props => props.$height || '14px'};
    width: ${props => props.$width || '100%'};
    border-radius: 4px;
    background: linear-gradient(90deg, 
        ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'} 0%, 
        ${({ theme }) => theme.bg?.cardHover || 'rgba(100, 116, 139, 0.2)'} 50%, 
        ${({ theme }) => theme.bg?.accent || 'rgba(100, 116, 139, 0.1)'} 100%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease-in-out infinite;
    margin-bottom: ${props => props.$mb || '0.5rem'};
`;

// ============ COMPONENT ============
const NewsPage = () => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [newsArticles, setNewsArticles] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [savedArticles, setSavedArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sentimentFilter, setSentimentFilter] = useState('all');

    // Load saved articles from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('savedNewsArticles');
        if (saved) setSavedArticles(JSON.parse(saved));
    }, []);

    // Fetch news on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchNews();
        }
    }, [isAuthenticated]);

    // Apply filters when news or filters change
    useEffect(() => {
        applyFilters();
    }, [newsArticles, searchQuery, activeCategory, sentimentFilter]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('limit', 50);

            const response = await api.get(`/news?${params.toString()}`);
            const articles = response.data || [];
            
            setNewsArticles(articles);
            toast.success(`Loaded ${articles.length} articles`);
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to load news');
            setNewsArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = useCallback(() => {
        let filtered = [...newsArticles];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(article => {
                const title = (article.title || '').toLowerCase();
                const description = (article.description || '').toLowerCase();
                const tickers = (article.tickers || []).join(' ').toLowerCase();
                return title.includes(query) || description.includes(query) || tickers.includes(query);
            });
        }

        // Category filter
        if (activeCategory !== 'all') {
            if (activeCategory === 'trending') {
                filtered = filtered.filter(a => a.trending);
            } else {
                filtered = filtered.filter(a => 
                    (a.category || '').toLowerCase() === activeCategory
                );
            }
        }

        // Sentiment filter
        if (sentimentFilter !== 'all') {
            filtered = filtered.filter(a => 
                (a.sentiment || '').toLowerCase() === sentimentFilter
            );
        }

        setFilteredNews(filtered);
    }, [newsArticles, searchQuery, activeCategory, sentimentFilter]);

    const handleToggleSave = (e, articleId) => {
        e.stopPropagation();
        let updated;
        if (savedArticles.includes(articleId)) {
            updated = savedArticles.filter(id => id !== articleId);
            toast.info('Removed from saved');
        } else {
            updated = [...savedArticles, articleId];
            toast.success('Article saved');
        }
        setSavedArticles(updated);
        localStorage.setItem('savedNewsArticles', JSON.stringify(updated));
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
        setShowModal(true);
    };

    const handleShare = (platform) => {
        if (!selectedArticle) return;
        const text = selectedArticle.title;
        const url = selectedArticle.url || window.location.href;

        if (platform === 'copy') {
            navigator.clipboard.writeText(`${text}\n${url}`);
            toast.success('Link copied!');
            return;
        }

        let shareUrl = '';
        if (platform === 'twitter') {
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        } else if (platform === 'linkedin') {
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const handleTickerClick = (e, ticker) => {
        e.stopPropagation();
        // Determine if crypto or stock based on common crypto symbols
        const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK', 'UNI', 'AVAX', 'ATOM', 'LTC', 'BNB'];
        if (cryptoSymbols.includes(ticker.toUpperCase())) {
            navigate(`/crypto/${ticker}`);
        } else {
            navigate(`/stocks/${ticker}`);
        }
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Recently';
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    const getSentimentIcon = (sentiment) => {
        if (sentiment === 'bullish') return <TrendingUp size={14} />;
        if (sentiment === 'bearish') return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

    // Calculate stats
    const stats = {
        total: newsArticles.length,
        bullish: newsArticles.filter(a => a.sentiment === 'bullish').length,
        bearish: newsArticles.filter(a => a.sentiment === 'bearish').length,
        trending: newsArticles.filter(a => a.trending).length
    };

    const sentimentBreakdown = {
        bullish: stats.total ? Math.round((stats.bullish / stats.total) * 100) : 0,
        bearish: stats.total ? Math.round((stats.bearish / stats.total) * 100) : 0,
        neutral: stats.total ? 100 - Math.round((stats.bullish / stats.total) * 100) - Math.round((stats.bearish / stats.total) * 100) : 0
    };

    // Get trending tickers from articles
    const getTrendingTickers = () => {
        const tickerCounts = {};
        newsArticles.forEach(article => {
            (article.tickers || []).forEach(ticker => {
                if (!tickerCounts[ticker]) {
                    tickerCounts[ticker] = { count: 0, sentiment: [] };
                }
                tickerCounts[ticker].count++;
                if (article.sentiment) tickerCounts[ticker].sentiment.push(article.sentiment);
            });
        });

        return Object.entries(tickerCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([ticker, data]) => {
                const bullish = data.sentiment.filter(s => s === 'bullish').length;
                const bearish = data.sentiment.filter(s => s === 'bearish').length;
                return {
                    ticker,
                    mentions: data.count,
                    sentiment: bullish > bearish ? 'bullish' : bearish > bullish ? 'bearish' : 'neutral',
                    change: bullish - bearish
                };
            });
    };

    const trendingTickers = getTrendingTickers();
    const featuredArticle = filteredNews.find(a => a.trending) || filteredNews[0];
    const remainingArticles = filteredNews.filter(a => a.id !== featuredArticle?.id);

    // Get dynamic colors from theme
    const primaryColor = theme?.brand?.primary || '#00adef';
    const accentColor = theme?.brand?.accent || '#8b5cf6';

    return (
        <PageContainer>
            <ContentWrapper>
                {/* Header */}
                <Header>
                    <HeaderTop>
                        <TitleSection>
                            <Title>
                                <Newspaper size={32} />
                                Market News
                            </Title>
                            <Subtitle>
                                <Brain size={16} />
                                AI-powered sentiment analysis on breaking market news
                            </Subtitle>
                        </TitleSection>
                        <HeaderActions>
                            <RefreshButton onClick={fetchNews} disabled={loading} $loading={loading}>
                                <RefreshCw size={18} />
                                {loading ? 'Loading...' : 'Refresh'}
                            </RefreshButton>
                        </HeaderActions>
                    </HeaderTop>

                    {/* Stats Bar */}
                    <StatsBar>
                        <StatCard>
                            <StatIcon $bg={`${primaryColor}15`} $color={primaryColor}>
                                <Newspaper size={20} />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{stats.total}</StatValue>
                                <StatLabel>Total Articles</StatLabel>
                            </StatContent>
                        </StatCard>
                        <StatCard>
                            <StatIcon $bg="rgba(16, 185, 129, 0.15)" $color="#10b981">
                                <TrendingUp size={20} />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{stats.bullish}</StatValue>
                                <StatLabel>Bullish</StatLabel>
                            </StatContent>
                        </StatCard>
                        <StatCard>
                            <StatIcon $bg="rgba(239, 68, 68, 0.15)" $color="#ef4444">
                                <TrendingDown size={20} />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{stats.bearish}</StatValue>
                                <StatLabel>Bearish</StatLabel>
                            </StatContent>
                        </StatCard>
                        <StatCard>
                            <StatIcon $bg="rgba(245, 158, 11, 0.15)" $color="#f59e0b">
                                <Flame size={20} />
                            </StatIcon>
                            <StatContent>
                                <StatValue>{stats.trending}</StatValue>
                                <StatLabel>Trending</StatLabel>
                            </StatContent>
                        </StatCard>
                    </StatsBar>
                </Header>

                {/* Filters */}
                <FiltersRow>
                    <SearchWrapper>
                        <SearchIcon><Search size={18} /></SearchIcon>
                        <SearchInput
                            type="text"
                            placeholder="Search news, tickers, keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchWrapper>
                    <FilterGroup>
                        <SentimentPill 
                            $active={sentimentFilter === 'all'}
                            onClick={() => setSentimentFilter('all')}
                        >
                            <Filter size={14} />
                            All
                        </SentimentPill>
                        <SentimentPill 
                            $active={sentimentFilter === 'bullish'}
                            $sentiment="bullish"
                            onClick={() => setSentimentFilter('bullish')}
                        >
                            <TrendingUp size={14} />
                            Bullish
                        </SentimentPill>
                        <SentimentPill 
                            $active={sentimentFilter === 'bearish'}
                            $sentiment="bearish"
                            onClick={() => setSentimentFilter('bearish')}
                        >
                            <TrendingDown size={14} />
                            Bearish
                        </SentimentPill>
                        <SentimentPill 
                            $active={sentimentFilter === 'neutral'}
                            $sentiment="neutral"
                            onClick={() => setSentimentFilter('neutral')}
                        >
                            <Minus size={14} />
                            Neutral
                        </SentimentPill>
                    </FilterGroup>
                </FiltersRow>

                {/* Category Tabs */}
                <CategoryTabs>
                    <CategoryTab $active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
                        <Globe size={16} />
                        All News
                        <TabBadge $active={activeCategory === 'all'}>{stats.total}</TabBadge>
                    </CategoryTab>
                    <CategoryTab $active={activeCategory === 'stocks'} onClick={() => setActiveCategory('stocks')}>
                        <BarChart3 size={16} />
                        Stocks
                    </CategoryTab>
                    <CategoryTab $active={activeCategory === 'crypto'} onClick={() => setActiveCategory('crypto')}>
                        <Bitcoin size={16} />
                        Crypto
                    </CategoryTab>
                    <CategoryTab $active={activeCategory === 'trending'} onClick={() => setActiveCategory('trending')}>
                        <Flame size={16} />
                        Trending
                        <TabBadge $active={activeCategory === 'trending'}>{stats.trending}</TabBadge>
                    </CategoryTab>
                </CategoryTabs>

                {/* Main Content */}
                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner />
                        <LoadingText>Analyzing market news with AI...</LoadingText>
                    </LoadingContainer>
                ) : filteredNews.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <Search size={48} />
                        </EmptyIcon>
                        <EmptyTitle>No articles found</EmptyTitle>
                        <EmptyText>Try adjusting your filters or search terms</EmptyText>
                    </EmptyState>
                ) : (
                    <NewsLayout>
                        <MainColumn>
                            {/* Featured Article */}
                            {featuredArticle && (
                                <FeaturedCard 
                                    $sentiment={featuredArticle.sentiment}
                                    onClick={() => handleArticleClick(featuredArticle)}
                                >
                                    <FeaturedImage $src={featuredArticle.image}>
                                        <FeaturedBadges>
                                            {featuredArticle.trending && (
                                                <TrendingBadge>
                                                    <Flame size={14} />
                                                    Trending
                                                </TrendingBadge>
                                            )}
                                            <SentimentBadge $sentiment={featuredArticle.sentiment}>
                                                {getSentimentIcon(featuredArticle.sentiment)}
                                                {featuredArticle.sentiment || 'Neutral'}
                                            </SentimentBadge>
                                        </FeaturedBadges>
                                    </FeaturedImage>
                                    <FeaturedContent>
                                        <FeaturedMeta>
                                            <SourceBadge>
                                                <SourceLogo>{(featuredArticle.source || 'N')[0]}</SourceLogo>
                                                {featuredArticle.source || 'Unknown Source'}
                                            </SourceBadge>
                                            <TimeBadge>
                                                <Clock size={14} />
                                                {formatTimeAgo(featuredArticle.timestamp || featuredArticle.publishedAt)}
                                            </TimeBadge>
                                            <CategoryBadge $category={featuredArticle.category}>
                                                {featuredArticle.category === 'crypto' ? <Bitcoin size={12} /> : <BarChart3 size={12} />}
                                                {featuredArticle.category || 'General'}
                                            </CategoryBadge>
                                        </FeaturedMeta>
                                        <FeaturedTitle>{featuredArticle.title}</FeaturedTitle>
                                        <FeaturedDescription>{featuredArticle.description}</FeaturedDescription>
                                        <FeaturedFooter>
                                            <TickerList>
                                                {(featuredArticle.tickers || []).slice(0, 4).map(ticker => (
                                                    <TickerChip 
                                                        key={ticker}
                                                        onClick={(e) => handleTickerClick(e, ticker)}
                                                    >
                                                        {ticker}
                                                    </TickerChip>
                                                ))}
                                            </TickerList>
                                            {featuredArticle.confidence && (
                                                <ConfidenceMeter>
                                                    <Sparkles size={14} />
                                                    <ConfidenceBar>
                                                        <ConfidenceFill $percent={featuredArticle.confidence} />
                                                    </ConfidenceBar>
                                                    {featuredArticle.confidence}%
                                                </ConfidenceMeter>
                                            )}
                                        </FeaturedFooter>
                                    </FeaturedContent>
                                </FeaturedCard>
                            )}

                            {/* News List */}
                            <NewsList>
                                {loading ? (
                                    // Skeleton loading
                                    [...Array(5)].map((_, i) => (
                                        <SkeletonCard key={i}>
                                            <SkeletonThumb />
                                            <SkeletonContent>
                                                <SkeletonLine $width="60%" $height="12px" />
                                                <SkeletonLine $width="100%" />
                                                <SkeletonLine $width="90%" />
                                                <SkeletonLine $width="40%" $height="12px" $mb="0" />
                                            </SkeletonContent>
                                        </SkeletonCard>
                                    ))
                                ) : (
                                    remainingArticles.map((article) => (
                                        <NewsCard 
                                            key={article.id}
                                            $sentiment={article.sentiment}
                                            onClick={() => handleArticleClick(article)}
                                        >
                                            <NewsThumb $src={article.image}>
                                                {!article.image && <Newspaper size={24} />}
                                            </NewsThumb>
                                            <NewsInfo>
                                                <div>
                                                    <NewsCardMeta>
                                                        <SourceBadge>
                                                            <SourceLogo>{(article.source || 'N')[0]}</SourceLogo>
                                                            {article.source || 'Unknown'}
                                                        </SourceBadge>
                                                        <TimeBadge>
                                                            <Clock size={12} />
                                                            {formatTimeAgo(article.timestamp || article.publishedAt)}
                                                        </TimeBadge>
                                                        <SentimentBadge $sentiment={article.sentiment} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                                            {getSentimentIcon(article.sentiment)}
                                                        </SentimentBadge>
                                                    </NewsCardMeta>
                                                    <NewsCardTitle>{article.title}</NewsCardTitle>
                                                </div>
                                                <NewsCardFooter>
                                                    <NewsCardTickers>
                                                        {(article.tickers || []).slice(0, 3).map(ticker => (
                                                            <MiniTicker 
                                                                key={ticker}
                                                                onClick={(e) => handleTickerClick(e, ticker)}
                                                            >
                                                                {ticker}
                                                            </MiniTicker>
                                                        ))}
                                                    </NewsCardTickers>
                                                    <NewsCardActions>
                                                        <IconButton
                                                            $active={savedArticles.includes(article.id)}
                                                            onClick={(e) => handleToggleSave(e, article.id)}
                                                        >
                                                            {savedArticles.includes(article.id) ? (
                                                                <BookmarkCheck size={14} />
                                                            ) : (
                                                                <Bookmark size={14} />
                                                            )}
                                                        </IconButton>
                                                    </NewsCardActions>
                                                </NewsCardFooter>
                                            </NewsInfo>
                                        </NewsCard>
                                    ))
                                )}
                            </NewsList>
                        </MainColumn>

                        {/* Sidebar */}
                        <Sidebar>
                            {/* Trending Tickers */}
                            <SidebarSection>
                                <SidebarTitle>
                                    <Zap size={18} />
                                    Trending Tickers
                                </SidebarTitle>
                                <TrendingList>
                                    {trendingTickers.map((item, index) => (
                                        <TrendingItem 
                                            key={item.ticker}
                                            onClick={() => handleTickerClick({ stopPropagation: () => {} }, item.ticker)}
                                        >
                                            <TrendingRank $rank={index + 1}>{index + 1}</TrendingRank>
                                            <TrendingInfo>
                                                <TrendingTicker>{item.ticker}</TrendingTicker>
                                                <TrendingMentions>{item.mentions} mentions</TrendingMentions>
                                            </TrendingInfo>
                                            <TrendingChange $positive={item.change >= 0}>
                                                {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            </TrendingChange>
                                        </TrendingItem>
                                    ))}
                                    {trendingTickers.length === 0 && (
                                        <EmptyText style={{ textAlign: 'center', padding: '1rem' }}>
                                            No trending tickers yet
                                        </EmptyText>
                                    )}
                                </TrendingList>
                            </SidebarSection>

                            {/* Sentiment Overview */}
                            <SidebarSection>
                                <SidebarTitle>
                                    <Activity size={18} />
                                    Market Sentiment
                                </SidebarTitle>
                                <SentimentBreakdown>
                                    <SentimentRow>
                                        <SentimentLabel $type="bullish">Bullish</SentimentLabel>
                                        <SentimentBarBg>
                                            <SentimentBarFill $type="bullish" $percent={sentimentBreakdown.bullish} />
                                        </SentimentBarBg>
                                        <SentimentPercent>{sentimentBreakdown.bullish}%</SentimentPercent>
                                    </SentimentRow>
                                    <SentimentRow>
                                        <SentimentLabel $type="neutral">Neutral</SentimentLabel>
                                        <SentimentBarBg>
                                            <SentimentBarFill $type="neutral" $percent={sentimentBreakdown.neutral} />
                                        </SentimentBarBg>
                                        <SentimentPercent>{sentimentBreakdown.neutral}%</SentimentPercent>
                                    </SentimentRow>
                                    <SentimentRow>
                                        <SentimentLabel $type="bearish">Bearish</SentimentLabel>
                                        <SentimentBarBg>
                                            <SentimentBarFill $type="bearish" $percent={sentimentBreakdown.bearish} />
                                        </SentimentBarBg>
                                        <SentimentPercent>{sentimentBreakdown.bearish}%</SentimentPercent>
                                    </SentimentRow>
                                </SentimentBreakdown>
                            </SidebarSection>

                            {/* AI Insights Card */}
                            <SidebarSection style={{ 
                                background: `linear-gradient(135deg, ${accentColor}10 0%, ${theme?.bg?.card || 'rgba(15, 23, 42, 0.5)'} 100%)`, 
                                borderColor: `${accentColor}20` 
                            }}>
                                <SidebarTitle style={{ color: accentColor }}>
                                    <Sparkles size={18} />
                                    AI Insights
                                </SidebarTitle>
                                <p style={{ color: theme?.text?.secondary || '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    {sentimentBreakdown.bullish > sentimentBreakdown.bearish 
                                        ? `Market sentiment is currently leaning bullish with ${sentimentBreakdown.bullish}% positive coverage. ${trendingTickers[0]?.ticker || 'Key assets'} seeing the most attention.`
                                        : sentimentBreakdown.bearish > sentimentBreakdown.bullish
                                        ? `Caution advised - ${sentimentBreakdown.bearish}% of coverage shows bearish sentiment. Monitor positions carefully.`
                                        : `Mixed signals in the market. Sentiment is balanced between bullish and bearish views.`
                                    }
                                </p>
                            </SidebarSection>
                        </Sidebar>
                    </NewsLayout>
                )}
            </ContentWrapper>

            {/* Article Modal */}
            {showModal && selectedArticle && (
                <ModalOverlay onClick={() => setShowModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalClose onClick={() => setShowModal(false)}>
                            <X size={18} />
                        </ModalClose>

                        <ModalHeader>
                            <ModalMeta>
                                <SourceBadge>
                                    <SourceLogo>{(selectedArticle.source || 'N')[0]}</SourceLogo>
                                    {selectedArticle.source || 'Unknown Source'}
                                </SourceBadge>
                                <TimeBadge>
                                    <Clock size={14} />
                                    {formatTimeAgo(selectedArticle.timestamp || selectedArticle.publishedAt)}
                                </TimeBadge>
                                <SentimentBadge $sentiment={selectedArticle.sentiment}>
                                    {getSentimentIcon(selectedArticle.sentiment)}
                                    {selectedArticle.sentiment || 'Neutral'}
                                </SentimentBadge>
                                {selectedArticle.confidence && (
                                    <ConfidenceMeter>
                                        <Sparkles size={14} />
                                        {selectedArticle.confidence}% confidence
                                    </ConfidenceMeter>
                                )}
                            </ModalMeta>
                            <ModalTitle>{selectedArticle.title}</ModalTitle>
                        </ModalHeader>

                        <ModalAISection>
                            <ModalAITitle>
                                <Brain size={18} />
                                AI Analysis
                            </ModalAITitle>
                            <ModalAIText>
                                This article shows <strong>{selectedArticle.sentiment || 'neutral'}</strong> sentiment
                                {selectedArticle.confidence && ` with ${selectedArticle.confidence}% confidence`}.
                                {selectedArticle.tickers?.length > 0 && (
                                    <> Key tickers mentioned: <strong>{selectedArticle.tickers.join(', ')}</strong>.</>
                                )}
                                {selectedArticle.sentiment === 'bullish' && ' The coverage suggests positive momentum and potential upside catalysts.'}
                                {selectedArticle.sentiment === 'bearish' && ' The coverage highlights concerns that may impact price negatively.'}
                                {selectedArticle.sentiment === 'neutral' && ' The coverage presents balanced perspectives without strong directional bias.'}
                            </ModalAIText>
                        </ModalAISection>

                        <ModalBody>
                            {selectedArticle.content || selectedArticle.description}
                        </ModalBody>

                        {selectedArticle.tickers?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: theme?.text?.tertiary || '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Related Tickers
                                </div>
                                <TickerList>
                                    {selectedArticle.tickers.map(ticker => (
                                        <TickerChip 
                                            key={ticker}
                                            onClick={(e) => {
                                                handleTickerClick(e, ticker);
                                                setShowModal(false);
                                            }}
                                        >
                                            {ticker}
                                            <ChevronRight size={12} />
                                        </TickerChip>
                                    ))}
                                </TickerList>
                            </div>
                        )}

                        <ModalFooter>
                            <ModalButton onClick={() => handleShare('twitter')}>
                                <Twitter size={16} />
                                Twitter
                            </ModalButton>
                            <ModalButton onClick={() => handleShare('linkedin')}>
                                <Linkedin size={16} />
                                LinkedIn
                            </ModalButton>
                            <ModalButton onClick={() => handleShare('copy')}>
                                <Copy size={16} />
                                Copy
                            </ModalButton>
                            <ModalButton 
                                $primary
                                onClick={() => window.open(selectedArticle.url, '_blank')}
                            >
                                <ExternalLink size={16} />
                                Read Full Article
                            </ModalButton>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default NewsPage;