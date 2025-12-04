// src/pages/DiscoveryPage.js - User Search & Discovery (THEMED WITH AVATAR BORDERS)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { useVault } from '../context/VaultContext';
import {
    Search, Users, TrendingUp, Flame, Star, Crown,
    UserPlus, UserMinus, Check, Award, Trophy,
    ArrowUpRight, ArrowDownRight, Filter, X,
    Sparkles, Target, Zap, Eye, Globe, RefreshCw
} from 'lucide-react';
import AvatarWithBorder from '../components/vault/AvatarWithBorder';

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
    50% { transform: translateY(-10px); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: ${({ theme }) => theme.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
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
    margin: 0 auto 3rem;
    text-align: center;
    animation: ${fadeIn} 0.8s ease-out;
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
    margin-bottom: 2rem;
`;

// ============ SEARCH BAR ============
const SearchContainer = styled.div`
    max-width: 800px;
    margin: 0 auto 3rem;
    position: relative;
    z-index: 1;
`;

const SearchWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 1.25rem 4rem 1.25rem 4rem;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${({ theme }) => `${theme.brand?.primary || '#ffd700'}4D`};
    border-radius: 16px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
        box-shadow: ${({ theme }) => `0 0 0 4px ${theme.brand?.primary || '#ffd700'}33`};
        background: ${({ theme }) => theme.bg?.cardHover || 'linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%)'};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
`;

const ClearButton = styled.button`
    position: absolute;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}1A`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#ffd700'}4D`};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}33`};
        transform: translateY(-50%) scale(1.1);
    }
`;

// ============ FILTERS ============
const FiltersContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    position: relative;
    z-index: 1;
`;

const FilterChip = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${({ $active, theme }) => $active ? 
        `linear-gradient(135deg, ${theme.brand?.primary || '#ffd700'}4D 0%, ${theme.brand?.primary || '#ffd700'}26 100%)` :
        theme.bg?.card || 'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#ffd700'}80` : 
        theme.border?.primary || 'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 12px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#ffd700' : theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
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

// ============ SUGGESTIONS SECTION ============
const Section = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    position: relative;
    z-index: 1;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
    font-size: 1.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
        animation: ${props => props.$loading ? css`${spin} 1s linear infinite` : 'none'};
    }
`;

// ============ TRADER CARDS ============
const TraderGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
`;

const TraderCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 2px solid ${({ theme }) => theme.border?.primary || 'rgba(255, 215, 0, 0.2)'};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$index * 0.05}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-8px);
        border-color: ${({ theme }) => `${theme.brand?.primary || '#ffd700'}80`};
        box-shadow: ${({ theme }) => `0 12px 40px ${theme.brand?.primary || '#ffd700'}4D`};
    }
`;

const CardTop = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
`;

// ✅ THEMED AVATAR COMPONENTS WITH BORDER SUPPORT
const Avatar = styled.div`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #ffd700, #ffed4e)'};
    border: 3px solid ${props => props.$borderColor || 'rgba(255, 215, 0, 0.5)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0e27;
    font-weight: 900;
    font-size: 1.8rem;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    box-shadow: ${props => props.$glow ? `0 0 15px ${props.$glow}` : 'none'};
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: ${props => `0 0 20px ${props.$glow || 'rgba(255, 215, 0, 0.5)'}`};
    }
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
    z-index: 1;
`;

const AvatarInitials = styled.div`
    position: relative;
    z-index: 0;
`;

const RankBadge = styled.div`
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #e5a55d)';
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))';
    }};
    border: 2px solid ${({ theme }) => theme.bg?.page || '#0a0e27'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$rank <= 3 ? '#0a0e27' : '#ffd700'};
    font-size: 0.7rem;
    font-weight: 900;
    animation: ${pulse} 2s ease-in-out infinite;
    z-index: 10;
`;

const UserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const DisplayName = styled.h3`
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Username = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const BadgesRow = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const Badge = styled.span`
    padding: 0.25rem 0.5rem;
    background: ${({ $type, theme }) => {
        if ($type === 'gold') return `${theme.brand?.primary || '#ffd700'}33`;
        if ($type === 'fire') return `${theme.error || '#ef4444'}33`;
        return `${theme.brand?.accent || '#00adef'}33`;
    }};
    border: 1px solid ${({ $type, theme }) => {
        if ($type === 'gold') return `${theme.brand?.primary || '#ffd700'}80`;
        if ($type === 'fire') return `${theme.error || '#ef4444'}80`;
        return `${theme.brand?.accent || '#00adef'}80`;
    }};
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: ${({ $type, theme }) => {
        if ($type === 'gold') return theme.brand?.primary || '#ffd700';
        if ($type === 'fire') return theme.error || '#ef4444';
        return theme.brand?.accent || '#00adef';
    }};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem 0;
    padding-top: 1rem;
    border-top: 1px solid ${({ theme }) => theme.border?.primary || 'rgba(255, 215, 0, 0.2)'};
`;

const StatBox = styled.div`
    text-align: center;
`;

const StatLabel = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatValue = styled.div`
    font-size: 1.1rem;
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
`;

const FollowButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: ${({ $following, theme }) => $following ? 
        `${theme.error || '#ef4444'}1A` :
        theme.brand?.gradient || 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
    };
    border: 1px solid ${({ $following, theme }) => $following ? 
        `${theme.error || '#ef4444'}4D` :
        'transparent'
    };
    border-radius: 10px;
    color: ${({ $following, theme }) => $following ? theme.error || '#ef4444' : theme.bg?.page || '#0a0e27'};
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

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
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
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
`;

const LoadingSpinner = styled(Search)`
    animation: ${spin} 1s linear infinite;
    color: ${({ theme }) => theme.brand?.primary || '#ffd700'};
`;

// ============ COMPONENT ============
const DiscoveryPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const theme = useStyledTheme();
    const { profileThemeId } = useThemeContext();
    const { equipped } = useVault();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('suggested');
    const [traders, setTraders] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [following, setFollowing] = useState(new Set());

    // ============ HELPER FUNCTIONS ============
    
    // Get avatar border style from equippedBorder
    const getAvatarBorderStyle = useCallback((borderId) => {
        if (!borderId) return BORDER_COLORS['default'];
        const normalizedId = borderId.startsWith('border-') ? borderId : `border-${borderId}`;
        return BORDER_COLORS[normalizedId] || BORDER_COLORS[borderId] || BORDER_COLORS['default'];
    }, []);

    // Current user's border
    const currentUserBorder = useMemo(() => {
        const userBorder = equipped?.border || 'default';
        return getAvatarBorderStyle(userBorder);
    }, [equipped?.border, getAvatarBorderStyle]);

    // Get initials
    const getInitials = useCallback((trader) => {
        const name = trader.profile?.displayName || trader.displayName || trader.username || 'T';
        return name.charAt(0).toUpperCase();
    }, []);

    useEffect(() => {
        fetchSuggestedTraders();
        fetchFollowing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter]);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timeoutId = setTimeout(() => {
                handleSearch();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setSearchResults([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const fetchSuggestedTraders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/social/leaderboard?limit=20');
            setTraders(response.data || []);
        } catch (error) {
            console.error('Error fetching traders:', error);
            toast.error('Failed to load traders', 'Error');
            setTraders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery || searchQuery.length < 2) return;
        
        setSearching(true);
        try {
            const response = await api.get(`/social/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(response.data || []);
        } catch (error) {
            console.error('Error searching traders:', error);
            toast.error('Failed to search traders', 'Error');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const fetchFollowing = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.social?.following) {
                setFollowing(new Set(response.data.social.following.map(id => id.toString())));
            }
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const handleFollow = async (e, userId) => {
        e.stopPropagation();
        
        try {
            const isFollowing = following.has(userId);
            
            if (isFollowing) {
                await api.post(`/social/unfollow/${userId}`);
                const newFollowing = new Set(following);
                newFollowing.delete(userId);
                setFollowing(newFollowing);
                toast.success('Unfollowed user', 'Success');
            } else {
                await api.post(`/social/follow/${userId}`);
                const newFollowing = new Set(following);
                newFollowing.add(userId);
                setFollowing(newFollowing);
                toast.success('Following user!', 'Success');
            }
        } catch (error) {
            console.error('Error following/unfollowing:', error);
            toast.error(error.response?.data?.msg || 'Failed to follow user', 'Error');
        }
    };

    const handleCardClick = (trader) => {
        navigate(`/trader/${trader.username}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    const renderTraderCard = (trader, index) => {
        const isOwnProfile = trader._id === user?.id || trader.userId === user?.id;
        const traderId = trader._id || trader.userId;
        
        // Get trader's equipped border for avatar frame
        const traderBorderStyle = getAvatarBorderStyle(
            trader.equippedBorder || trader.vault?.equippedBorder || 'default'
        );
        
        return (
            <TraderCard 
                key={traderId} 
                $index={index}
                onClick={() => handleCardClick(trader)}
            >
                <CardTop>
                    <Avatar 
                        $hasImage={!!(trader.profile?.avatar || trader.avatar)}
                        $borderColor={traderBorderStyle.color}
                        $glow={traderBorderStyle.glow}
                    >
                        {(trader.profile?.avatar || trader.avatar) ? (
                            <AvatarImage 
                                src={trader.profile?.avatar || trader.avatar} 
                                alt={trader.profile?.displayName || trader.displayName || trader.username}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <AvatarInitials>
                                {getInitials(trader)}
                            </AvatarInitials>
                        )}
                        {(trader.stats?.rank || trader.rank) && (trader.stats?.rank || trader.rank) <= 10 && (
                            <RankBadge $rank={trader.stats?.rank || trader.rank}>
                                #{trader.stats?.rank || trader.rank}
                            </RankBadge>
                        )}
                    </Avatar>
                    
                    <UserInfo>
                        <DisplayName>
                            {trader.profile?.displayName || trader.displayName || trader.username}
                            {(trader.stats?.rank || trader.rank) === 1 && <Crown size={16} color={theme?.brand?.primary || '#ffd700'} />}
                            {trader.profile?.badges?.includes('verified') && <Check size={16} color={theme?.success || '#10b981'} />}
                        </DisplayName>
                        <Username>@{trader.username}</Username>
                        <BadgesRow>
                            {trader.profile?.level && trader.profile.level >= 10 && (
                                <Badge $type="gold">
                                    <Star size={12} />
                                    Lvl {trader.profile.level}
                                </Badge>
                            )}
                            {(trader.stats?.winRate || trader.winRate || 0) >= 70 && (
                                <Badge $type="fire">
                                    <Flame size={12} />
                                    Hot Streak
                                </Badge>
                            )}
                            {(trader.social?.followersCount || trader.followersCount || 0) >= 100 && (
                                <Badge>
                                    <Users size={12} />
                                    Popular
                                </Badge>
                            )}
                        </BadgesRow>
                    </UserInfo>
                </CardTop>

                <StatsGrid>
                    <StatBox>
                        <StatLabel>Return</StatLabel>
                        <StatValue 
                            $positive={(trader.stats?.totalReturnPercent || trader.totalReturn || 0) >= 0} 
                            $negative={(trader.stats?.totalReturnPercent || trader.totalReturn || 0) < 0}
                        >
                            {(trader.stats?.totalReturnPercent || trader.totalReturn || 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {(trader.stats?.totalReturnPercent || trader.totalReturn || 0) >= 0 ? '+' : ''}
                            {(trader.stats?.totalReturnPercent || trader.totalReturn || 0).toFixed(1)}%
                        </StatValue>
                    </StatBox>
                    
                    <StatBox>
                        <StatLabel>Win Rate</StatLabel>
                        <StatValue>
                            {(trader.stats?.winRate || trader.winRate || 0).toFixed(0)}%
                        </StatValue>
                    </StatBox>
                    
                    <StatBox>
                        <StatLabel>Trades</StatLabel>
                        <StatValue>
                            {trader.stats?.totalTrades || trader.totalTrades || 0}
                        </StatValue>
                    </StatBox>
                </StatsGrid>

                <FollowButton
                    $following={following.has(traderId)}
                    onClick={(e) => handleFollow(e, traderId)}
                    disabled={isOwnProfile}
                >
                    {isOwnProfile ? (
                        <>
                            <Star size={18} />
                            Your Profile
                        </>
                    ) : following.has(traderId) ? (
                        <>
                            <UserMinus size={18} />
                            Unfollow
                        </>
                    ) : (
                        <>
                            <UserPlus size={18} />
                            Follow
                        </>
                    )}
                </FollowButton>
            </TraderCard>
        );
    };

    const displayedTraders = searchQuery.length >= 2 ? searchResults : traders;

    if (loading && !searchQuery) {
        return (
            <PageContainer>
                <BackgroundOrbs>
                    <Orb $duration="25s" />
                    <Orb $duration="30s" />
                    <Orb $duration="20s" />
                </BackgroundOrbs>
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <div style={{ color: theme?.text?.secondary || '#94a3b8', fontSize: '1.1rem' }}>Loading traders...</div>
                </LoadingContainer>
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
                        <Sparkles size={56} color={theme?.brand?.primary || '#ffd700'} />
                    </TitleIcon>
                    Discover Traders
                </Title>
                <Subtitle>Find and follow the best traders in the community</Subtitle>
            </Header>

            {/* Search Bar */}
            <SearchContainer>
                <SearchWrapper>
                    <SearchIcon size={24} />
                    <SearchInput
                        type="text"
                        placeholder="Search traders by name or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <ClearButton onClick={handleClearSearch}>
                            <X size={16} />
                        </ClearButton>
                    )}
                </SearchWrapper>
            </SearchContainer>

            {/* Filters */}
            {!searchQuery && (
                <FiltersContainer>
                    <FilterChip
                        $active={activeFilter === 'suggested'}
                        onClick={() => setActiveFilter('suggested')}
                    >
                        <Sparkles size={18} />
                        Suggested For You
                    </FilterChip>
                    <FilterChip
                        $active={activeFilter === 'top'}
                        onClick={() => setActiveFilter('top')}
                    >
                        <Trophy size={18} />
                        Top Performers
                    </FilterChip>
                    <FilterChip
                        $active={activeFilter === 'active'}
                        onClick={() => setActiveFilter('active')}
                    >
                        <Zap size={18} />
                        Most Active
                    </FilterChip>
                </FiltersContainer>
            )}

            {/* Results Section */}
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        {searchQuery ? (
                            <>
                                <Search size={28} />
                                Search Results
                                {searching && <LoadingSpinner size={24} />}
                            </>
                        ) : (
                            <>
                                <Users size={28} />
                                {activeFilter === 'suggested' && 'Suggested Traders'}
                                {activeFilter === 'top' && 'Top Performers'}
                                {activeFilter === 'active' && 'Most Active Traders'}
                            </>
                        )}
                    </SectionTitle>
                    {!searchQuery && (
                        <RefreshButton onClick={fetchSuggestedTraders} disabled={loading} $loading={loading}>
                            <RefreshCw size={18} />
                            Refresh
                        </RefreshButton>
                    )}
                </SectionHeader>

                {displayedTraders.length > 0 ? (
                    <TraderGrid>
                        {displayedTraders.map((trader, index) => renderTraderCard(trader, index))}
                    </TraderGrid>
                ) : (
                    <EmptyState>
                        <EmptyIcon>
                            <Search size={80} color={theme?.brand?.primary || '#ffd700'} />
                        </EmptyIcon>
                        <EmptyTitle>
                            {searchQuery ? 'No Traders Found' : 'No Traders Available'}
                        </EmptyTitle>
                        <EmptyText>
                            {searchQuery 
                                ? `No traders match "${searchQuery}". Try a different search.`
                                : 'Be the first to join the community!'
                            }
                        </EmptyText>
                    </EmptyState>
                )}
            </Section>
        </PageContainer>
    );
};

export default DiscoveryPage;
