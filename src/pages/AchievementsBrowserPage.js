// client/src/pages/AchievementsBrowserPage.js - THEMED ACHIEVEMENTS BROWSER
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    Award, Lock, Star, TrendingUp, CheckCircle, Trophy,
    Filter, Search, Grid, List, ChevronDown, Target,
    Zap, Users, Calendar, Sparkles, Brain, DollarSign, RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

// ============================================
// MAIN CONTAINER
// ============================================
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 100px 2rem 2rem;
    background: transparent;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    position: relative;
    overflow: hidden;
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
        background: ${({ theme }) => `radial-gradient(circle, ${theme.warning || '#f59e0b'}66 0%, transparent 70%)`};
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
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.primary || '#00adef'}4D 0%, transparent 70%)`};
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

const ContentWrapper = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

// ============================================
// HEADER
// ============================================
const Header = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const TitleIcon = styled.div`
    animation: ${rotate} 3s linear infinite;
`;

const Subtitle = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin: 0;
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.success || '#10b981'}33 0%, ${theme.success || '#10b981'}1A 100%)`};
    border: 1px solid ${({ theme }) => `${theme.success || '#10b981'}66`};
    border-radius: 12px;
    color: ${({ theme }) => theme.success || '#10b981'};
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        background: ${({ theme }) => `linear-gradient(135deg, ${theme.success || '#10b981'}4D 0%, ${theme.success || '#10b981'}26 100%)`};
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => `0 8px 20px ${theme.success || '#10b981'}33`};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    svg {
        transition: transform 0.3s ease;
    }

    &:disabled svg {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const StatsRow = styled.div`
    display: flex;
    gap: 1.5rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
`;

const StatCard = styled.div`
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}26 0%, ${theme.brand?.primary || '#00adef'}0D 100%)`};
    border: 2px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${({ theme }) => `0 10px 40px ${theme.brand?.primary || '#00adef'}4D`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
    }
`;

const StatIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${({ $variant, theme }) => {
        if ($variant === 'gold') return `linear-gradient(135deg, ${theme.warning || '#f59e0b'}, ${theme.warning || '#d97706'})`;
        if ($variant === 'blue') return `linear-gradient(135deg, ${theme.info || '#3b82f6'}, ${theme.info || '#2563eb'})`;
        if ($variant === 'green') return `linear-gradient(135deg, ${theme.success || '#10b981'}, ${theme.success || '#059669'})`;
        return `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}, ${theme.brand?.accent || '#7c3aed'})`;
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const StatInfo = styled.div``;

const StatLabel = styled.div`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1.8rem;
    font-weight: 900;
`;

// ============================================
// FILTERS & CONTROLS
// ============================================
const ControlsBar = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.8)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
    animation: ${fadeIn} 0.8s ease-out;
`;

const SearchBox = styled.div`
    flex: 1;
    min-width: 250px;
    position: relative;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        box-shadow: ${({ theme }) => `0 0 20px ${theme.brand?.primary || '#00adef'}33`};
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
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    pointer-events: none;
`;

const FilterGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const FilterButton = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${({ $active, theme }) => $active ? 
        `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}4D 0%, ${theme.brand?.primary || '#00adef'}26 100%)` : 
        `${theme.brand?.primary || '#00adef'}0D`
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#00adef'}80` : 
        `${theme.brand?.primary || '#00adef'}33`
    };
    border-radius: 10px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}33 0%, ${theme.brand?.primary || '#00adef'}1A 100%)`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
        transform: translateY(-2px);
    }
`;

const ViewToggle = styled.div`
    display: flex;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    overflow: hidden;
`;

const ViewButton = styled.button`
    padding: 0.75rem 1rem;
    background: ${({ $active, theme }) => $active ? `${theme.brand?.primary || '#00adef'}33` : 'transparent'};
    border: none;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : theme.text?.secondary || '#94a3b8'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

const CategoryTabs = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        border-radius: 2px;
    }
`;

const CategoryTab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${({ $active, theme }) => $active ? 
        `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}4D 0%, ${theme.brand?.primary || '#00adef'}26 100%)` : 
        theme.bg?.card || 'rgba(30, 41, 59, 0.8)'
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#00adef'}80` : 
        `${theme.brand?.primary || '#00adef'}33`
    };
    border-radius: 10px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}33 0%, ${theme.brand?.primary || '#00adef'}1A 100%)`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

// ============================================
// ACHIEVEMENTS GRID
// ============================================
const AchievementsGridContainer = styled.div`
    display: grid;
    grid-template-columns: ${props => props.$view === 'grid' ? 
        'repeat(auto-fill, minmax(320px, 1fr))' : 
        '1fr'
    };
    gap: 1.5rem;
    animation: ${fadeIn} 1s ease-out;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const AchievementCard = styled.div`
    background: ${({ $unlocked, $rarity, theme }) => {
        if (!$unlocked) return theme.bg?.card || 'rgba(30, 41, 59, 0.5)';
        if ($rarity === 'legendary') return `linear-gradient(135deg, ${theme.warning || '#f59e0b'}26, ${theme.warning || '#f59e0b'}0D)`;
        if ($rarity === 'epic') return `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}26, ${theme.brand?.accent || '#8b5cf6'}0D)`;
        if ($rarity === 'rare') return `linear-gradient(135deg, ${theme.info || '#3b82f6'}26, ${theme.info || '#3b82f6'}0D)`;
        return `linear-gradient(135deg, ${theme.success || '#10b981'}26, ${theme.success || '#10b981'}0D)`;
    }};
    border: 2px solid ${({ $unlocked, $rarity, theme }) => {
        if (!$unlocked) return theme.border?.secondary || 'rgba(100, 116, 139, 0.3)';
        if ($rarity === 'legendary') return `${theme.warning || '#f59e0b'}80`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}80`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}80`;
        return `${theme.success || '#10b981'}80`;
    }};
    border-radius: 16px;
    padding: ${props => props.$view === 'list' ? '1.5rem' : '2rem'};
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    opacity: ${props => props.$unlocked ? 1 : 0.6};
    display: ${props => props.$view === 'list' ? 'flex' : 'block'};
    align-items: ${props => props.$view === 'list' ? 'center' : 'stretch'};
    gap: ${props => props.$view === 'list' ? '1.5rem' : '0'};

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${({ $unlocked, $rarity, theme }) => {
            if (!$unlocked) return `0 10px 40px ${theme.border?.secondary || 'rgba(100, 116, 139, 0.2)'}`;
            if ($rarity === 'legendary') return `0 10px 40px ${theme.warning || '#f59e0b'}66`;
            if ($rarity === 'epic') return `0 10px 40px ${theme.brand?.accent || '#8b5cf6'}66`;
            if ($rarity === 'rare') return `0 10px 40px ${theme.info || '#3b82f6'}66`;
            return `0 10px 40px ${theme.success || '#10b981'}66`;
        }};
        ${props => !props.$unlocked && css`
            animation: ${shake} 0.5s ease-in-out;
        `}
    }

    ${props => props.$unlocked && css`
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
            background-size: 200% 200%;
            animation: ${shimmer} 3s linear infinite;
        }
    `}
`;

const CardHeader = styled.div`
    display: flex;
    align-items: start;
    gap: 1rem;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
`;

const IconContainer = styled.div`
    width: ${props => props.$view === 'list' ? '70px' : '80px'};
    height: ${props => props.$view === 'list' ? '70px' : '80px'};
    border-radius: 16px;
    background: ${({ $unlocked, $rarity, theme }) => {
        if (!$unlocked) return theme.border?.secondary || 'rgba(100, 116, 139, 0.3)';
        if ($rarity === 'legendary') return `linear-gradient(135deg, ${theme.warning || '#f59e0b'}4D, ${theme.warning || '#f59e0b'}1A)`;
        if ($rarity === 'epic') return `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}4D, ${theme.brand?.accent || '#8b5cf6'}1A)`;
        if ($rarity === 'rare') return `linear-gradient(135deg, ${theme.info || '#3b82f6'}4D, ${theme.info || '#3b82f6'}1A)`;
        return `linear-gradient(135deg, ${theme.success || '#10b981'}4D, ${theme.success || '#10b981'}1A)`;
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    flex-shrink: 0;
    position: relative;
    box-shadow: ${props => props.$unlocked ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none'};

    ${props => props.$unlocked && css`
        animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const LockedOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 16px;
    z-index: 1;
`;

const CardContent = styled.div`
    flex: 1;
    position: relative;
    z-index: 1;
`;

const CardTitle = styled.div`
    font-size: ${props => props.$view === 'list' ? '1.3rem' : '1.2rem'};
    font-weight: 900;
    color: ${({ $unlocked, theme }) => $unlocked ? theme.text?.primary || '#e0e6ed' : theme.text?.tertiary || '#64748b'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const RarityBadge = styled.span`
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    background: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `${theme.warning || '#f59e0b'}4D`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}4D`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}4D`;
        return `${theme.success || '#10b981'}4D`;
    }};
    color: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return theme.warning || '#f59e0b';
        if ($rarity === 'epic') return theme.brand?.accent || '#a78bfa';
        if ($rarity === 'rare') return theme.info || '#60a5fa';
        return theme.success || '#10b981';
    }};
    border: 1px solid ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `${theme.warning || '#f59e0b'}80`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}80`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}80`;
        return `${theme.success || '#10b981'}80`;
    }};
`;

const CategoryBadge = styled.span`
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
`;

const CardDescription = styled.div`
    font-size: 0.95rem;
    color: ${({ $unlocked, theme }) => $unlocked ? theme.text?.secondary || '#94a3b8' : theme.text?.tertiary || '#64748b'};
    line-height: 1.6;
    margin-bottom: 1rem;
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const PointsBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${({ theme }) => `${theme.warning || '#f59e0b'}33`};
    border: 1px solid ${({ theme }) => `${theme.warning || '#f59e0b'}66`};
    border-radius: 20px;
    color: ${({ theme }) => theme.warning || '#f59e0b'};
    font-weight: 700;
    font-size: 0.9rem;
`;

const UnlockedDate = styled.div`
    font-size: 0.8rem;
    color: ${({ theme }) => theme.success || '#10b981'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
`;

const RequirementText = styled.div`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============================================
// PROGRESS BAR
// ============================================
const ProgressContainer = styled.div`
    flex: 1;
    max-width: 200px;
`;

const ProgressBarWrapper = styled.div`
    height: 8px;
    background: ${({ theme }) => theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 4px;
`;

const ProgressBarFill = styled.div`
    height: 100%;
    width: ${props => Math.min(props.$percent, 100)}%;
    background: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `linear-gradient(90deg, ${theme.warning || '#f59e0b'}, ${theme.warning || '#fbbf24'})`;
        if ($rarity === 'epic') return `linear-gradient(90deg, ${theme.brand?.accent || '#8b5cf6'}, ${theme.brand?.accent || '#a78bfa'})`;
        if ($rarity === 'rare') return `linear-gradient(90deg, ${theme.info || '#3b82f6'}, ${theme.info || '#60a5fa'})`;
        return `linear-gradient(90deg, ${theme.success || '#10b981'}, ${theme.success || '#34d399'})`;
    }};
    border-radius: 4px;
    transition: width 0.5s ease;
`;

const ProgressText = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// ============================================
// EMPTY STATE
// ============================================
const EmptyState = styled.div`
    text-align: center;
    padding: 5rem 2rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    animation: ${fadeIn} 0.6s ease-out;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
`;

const EmptyText = styled.div`
    font-size: 1.2rem;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.div`
    font-size: 0.95rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
`;

// ============================================
// COMPONENT
// ============================================
const AchievementsBrowserPage = () => {
    const { api } = useAuth();
    const theme = useStyledTheme();
    const toast = useToast();

    const [allAchievements, setAllAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checking, setChecking] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    const categories = [
        { id: 'all', name: 'All', icon: Grid },
        { id: 'trading', name: 'Trading', icon: TrendingUp },
        { id: 'profit', name: 'Profit', icon: DollarSign },
        { id: 'portfolio', name: 'Portfolio', icon: Target },
        { id: 'predictions', name: 'Predictions', icon: Brain },
        { id: 'streaks', name: 'Streaks', icon: Zap },
        { id: 'milestones', name: 'Milestones', icon: Trophy },
        { id: 'skill', name: 'Skill', icon: Award },
        { id: 'mastery', name: 'Mastery', icon: Star },
        { id: 'special', name: 'Special', icon: Sparkles },
        { id: 'social', name: 'Social', icon: Users },
        { id: 'time_based', name: 'Time', icon: Calendar },
    ];

    // Fetch achievements with proper dependency
    const fetchAchievements = useCallback(async () => {
        try {
            setError(null);
            const response = await api.get('/gamification/achievements');
            if (response.data.success) {
                setAllAchievements(response.data.achievements);
            }
        } catch (err) {
            console.error('Error fetching achievements:', err);
            setError('Failed to load achievements. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    // Check for new achievements (triggers server-side check)
    const checkForNewAchievements = useCallback(async () => {
        setChecking(true);
        try {
            const response = await api.post('/gamification/check-achievements');
            if (response.data.success) {
                const { newlyUnlocked, leveledUp, newLevel, newRank } = response.data;

                if (newlyUnlocked && newlyUnlocked.length > 0) {
                    toast?.success(`🎉 Unlocked ${newlyUnlocked.length} new achievement${newlyUnlocked.length > 1 ? 's' : ''}!`);
                    // Refresh the achievements list
                    await fetchAchievements();
                } else {
                    toast?.info('No new achievements unlocked. Keep grinding!');
                }

                if (leveledUp) {
                    toast?.success(`🎮 Level Up! You're now level ${newLevel}!`);
                }
            }
        } catch (err) {
            console.error('Error checking achievements:', err);
            toast?.error('Failed to check achievements');
        } finally {
            setChecking(false);
        }
    }, [api, fetchAchievements, toast]);

    // Memoized filtered achievements
    const filteredAchievements = useMemo(() => {
        let filtered = [...allAchievements];

        if (searchQuery) {
            filtered = filtered.filter(ach =>
                ach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ach.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (rarityFilter !== 'all') {
            filtered = filtered.filter(ach => ach.rarity === rarityFilter);
        }

        if (statusFilter === 'unlocked') {
            filtered = filtered.filter(ach => ach.unlocked);
        } else if (statusFilter === 'locked') {
            filtered = filtered.filter(ach => !ach.unlocked);
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(ach => ach.category === categoryFilter);
        }

        return filtered;
    }, [allAchievements, searchQuery, rarityFilter, statusFilter, categoryFilter]);

    // Memoized stats calculation
    const stats = useMemo(() => {
        const unlocked = allAchievements.filter(a => a.unlocked).length;
        const total = allAchievements.length;
        const totalPoints = allAchievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);
        const possiblePoints = allAchievements.reduce((sum, a) => sum + a.points, 0);

        return { unlocked, total, totalPoints, possiblePoints };
    }, [allAchievements]);
    const progressPercent = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0;

    if (loading) {
        return (
            <PageContainer>
                <BackgroundOrbs>
                    <Orb $duration="25s" />
                    <Orb $duration="30s" />
                    <Orb $duration="20s" />
                </BackgroundOrbs>
                <ContentWrapper>
                    <EmptyState>
                        <EmptyIcon>
                            <Award size={60} />
                        </EmptyIcon>
                        <EmptyText>Loading achievements...</EmptyText>
                    </EmptyState>
                </ContentWrapper>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <BackgroundOrbs>
                    <Orb $duration="25s" />
                    <Orb $duration="30s" />
                    <Orb $duration="20s" />
                </BackgroundOrbs>
                <ContentWrapper>
                    <EmptyState>
                        <EmptyIcon style={{ background: `${theme?.error || '#ef4444'}1A`, color: theme?.error || '#ef4444' }}>
                            <Award size={60} />
                        </EmptyIcon>
                        <EmptyText>{error}</EmptyText>
                        <EmptySubtext>
                            <button
                                onClick={() => { setLoading(true); fetchAchievements(); }}
                                style={{
                                    background: `${theme?.brand?.primary || '#00adef'}33`,
                                    border: `1px solid ${theme?.brand?.primary || '#00adef'}66`,
                                    borderRadius: '8px',
                                    padding: '0.75rem 1.5rem',
                                    color: theme?.brand?.primary || '#00adef',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    marginTop: '1rem'
                                }}
                            >
                                Try Again
                            </button>
                        </EmptySubtext>
                    </EmptyState>
                </ContentWrapper>
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

            <ContentWrapper>
                <Header>
                    <TitleRow>
                        <Title>
                            <TitleIcon>
                                <Trophy size={48} color={theme?.warning || '#f59e0b'} />
                            </TitleIcon>
                            Achievement Browser
                        </Title>
                        <RefreshButton onClick={checkForNewAchievements} disabled={checking}>
                            <RefreshCw size={18} />
                            {checking ? 'Checking...' : 'Check for New Achievements'}
                        </RefreshButton>
                    </TitleRow>
                    <Subtitle>Discover and track all available achievements</Subtitle>

                    <StatsRow>
                        <StatCard>
                            <StatIcon $variant="gold">
                                <Trophy size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Progress</StatLabel>
                                <StatValue>{stats.unlocked} / {stats.total}</StatValue>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $variant="blue">
                                <Target size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Completion</StatLabel>
                                <StatValue>{progressPercent.toFixed(1)}%</StatValue>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $variant="green">
                                <Star size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Points Earned</StatLabel>
                                <StatValue>{stats.totalPoints.toLocaleString()}</StatValue>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $variant="purple">
                                <Zap size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Possible Points</StatLabel>
                                <StatValue>{stats.possiblePoints.toLocaleString()}</StatValue>
                            </StatInfo>
                        </StatCard>
                    </StatsRow>
                </Header>

                <CategoryTabs>
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const count = allAchievements.filter(a => 
                            cat.id === 'all' || a.category === cat.id
                        ).length;
                        
                        return (
                            <CategoryTab
                                key={cat.id}
                                $active={categoryFilter === cat.id}
                                onClick={() => setCategoryFilter(cat.id)}
                            >
                                <Icon size={18} />
                                {cat.name}
                                <span style={{ 
                                    opacity: 0.6, 
                                    fontSize: '0.85em',
                                    marginLeft: '0.25rem'
                                }}>
                                    ({count})
                                </span>
                            </CategoryTab>
                        );
                    })}
                </CategoryTabs>

                <ControlsBar>
                    <SearchBox>
                        <SearchIcon size={18} />
                        <SearchInput
                            type="text"
                            placeholder="Search achievements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchBox>

                    <FilterGroup>
                        <FilterButton
                            $active={statusFilter === 'all'}
                            onClick={() => setStatusFilter('all')}
                        >
                            All
                        </FilterButton>
                        <FilterButton
                            $active={statusFilter === 'unlocked'}
                            onClick={() => setStatusFilter('unlocked')}
                        >
                            <CheckCircle size={16} />
                            Unlocked
                        </FilterButton>
                        <FilterButton
                            $active={statusFilter === 'locked'}
                            onClick={() => setStatusFilter('locked')}
                        >
                            <Lock size={16} />
                            Locked
                        </FilterButton>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterButton
                            $active={rarityFilter === 'all'}
                            onClick={() => setRarityFilter('all')}
                        >
                            All Rarities
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'common'}
                            onClick={() => setRarityFilter('common')}
                        >
                            Common
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'rare'}
                            onClick={() => setRarityFilter('rare')}
                        >
                            Rare
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'epic'}
                            onClick={() => setRarityFilter('epic')}
                        >
                            Epic
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'legendary'}
                            onClick={() => setRarityFilter('legendary')}
                        >
                            Legendary
                        </FilterButton>
                    </FilterGroup>

                    <ViewToggle>
                        <ViewButton
                            $active={viewMode === 'grid'}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </ViewButton>
                        <ViewButton
                            $active={viewMode === 'list'}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </ViewButton>
                    </ViewToggle>
                </ControlsBar>

                {filteredAchievements.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <Search size={60} />
                        </EmptyIcon>
                        <EmptyText>No achievements found</EmptyText>
                        <EmptySubtext>Try adjusting your filters</EmptySubtext>
                    </EmptyState>
                ) : (
                    <AchievementsGridContainer $view={viewMode}>
                        {filteredAchievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                $unlocked={achievement.unlocked}
                                $rarity={achievement.rarity}
                                $view={viewMode}
                            >
                                <CardHeader>
                                    <IconContainer 
                                        $unlocked={achievement.unlocked}
                                        $rarity={achievement.rarity}
                                        $view={viewMode}
                                    >
                                        {!achievement.unlocked && (
                                            <LockedOverlay>
                                                <Lock size={32} color={theme?.text?.tertiary || '#64748b'} />
                                            </LockedOverlay>
                                        )}
                                        {achievement.icon}
                                    </IconContainer>
                                    
                                    {viewMode === 'grid' && (
                                        <CardContent>
                                            <CardTitle $unlocked={achievement.unlocked} $view={viewMode}>
                                                {achievement.name}
                                            </CardTitle>
                                        </CardContent>
                                    )}
                                </CardHeader>

                                <CardContent>
                                    {viewMode === 'list' && (
                                        <CardTitle $unlocked={achievement.unlocked} $view={viewMode}>
                                            {achievement.name}
                                            <RarityBadge $rarity={achievement.rarity}>
                                                {achievement.rarity}
                                            </RarityBadge>
                                            <CategoryBadge>
                                                {achievement.category}
                                            </CategoryBadge>
                                        </CardTitle>
                                    )}

                                    {viewMode === 'grid' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            <RarityBadge $rarity={achievement.rarity}>
                                                {achievement.rarity}
                                            </RarityBadge>
                                            <CategoryBadge>
                                                {achievement.category}
                                            </CategoryBadge>
                                        </div>
                                    )}

                                    <CardDescription $unlocked={achievement.unlocked}>
                                        {achievement.description}
                                    </CardDescription>

                                    <CardFooter>
                                        <PointsBadge>
                                            <Star size={14} />
                                            +{achievement.points} XP
                                        </PointsBadge>
                                        
                                        {achievement.unlocked && achievement.unlockedAt ? (
                                            <UnlockedDate>
                                                <CheckCircle size={14} />
                                                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                            </UnlockedDate>
                                        ) : achievement.progress !== undefined && achievement.threshold ? (
                                            <ProgressContainer>
                                                <ProgressBarWrapper>
                                                    <ProgressBarFill
                                                        $percent={(achievement.progress / achievement.threshold) * 100}
                                                        $rarity={achievement.rarity}
                                                    />
                                                </ProgressBarWrapper>
                                                <ProgressText>
                                                    <span>{achievement.progress.toLocaleString()} / {achievement.threshold.toLocaleString()}</span>
                                                    <span>{Math.round((achievement.progress / achievement.threshold) * 100)}%</span>
                                                </ProgressText>
                                            </ProgressContainer>
                                        ) : (
                                            <RequirementText>
                                                <Lock size={14} />
                                                Keep grinding!
                                            </RequirementText>
                                        )}
                                    </CardFooter>
                                </CardContent>
                            </AchievementCard>
                        ))}
                    </AchievementsGridContainer>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default AchievementsBrowserPage;