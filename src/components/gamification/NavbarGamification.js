// client/src/components/gamification/NavbarGamification.js
// Shows gamification stats with dropdown panel + EQUIPPED BADGES - THEMED VERSION

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
    Coins, Flame, ChevronDown, Trophy, TrendingUp, 
    Award, ArrowRight, DollarSign, BarChart2
} from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import { useTheme } from '../../context/ThemeContext';
import AvatarWithBorder from '../vault/AvatarWithBorder';
import BadgeIcon from '../BadgeIcon';

// ============ BADGE DEFINITIONS (synced with backend) ============
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

const BADGE_NAMES = {
    'badge-founder': 'Founder',
    'badge-first-trade': 'First Trade',
    'badge-week-warrior': 'Week Warrior',
    'badge-trade-master': 'Trade Master',
    'badge-portfolio-builder': 'Portfolio Builder',
    'badge-profit-king': 'Profit King',
    'badge-dedicated': 'Dedicated',
    'badge-prediction-master': 'Oracle',
    'badge-level-50': 'Half Century',
    'badge-whale': 'Whale',
    'badge-level-100': 'Centurion',
    'badge-millionaire': 'Millionaire'
};

// ============ BORDER COLORS ============
const BORDER_COLORS = {
    'border-bronze': { gradient: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 50%, #cd7f32 100%)', glow: 'rgba(205, 127, 50, 0.5)' },
    'border-silver': { gradient: 'linear-gradient(135deg, #c0c0c0 0%, #808080 50%, #c0c0c0 100%)', glow: 'rgba(192, 192, 192, 0.5)' },
    'border-gold': { gradient: 'linear-gradient(135deg, #ffd700 0%, #b8860b 50%, #ffd700 100%)', glow: 'rgba(255, 215, 0, 0.6)' },
    'border-emerald': { gradient: 'linear-gradient(135deg, #50c878 0%, #2e8b57 50%, #50c878 100%)', glow: 'rgba(80, 200, 120, 0.5)' },
    'border-ruby': { gradient: 'linear-gradient(135deg, #e0115f 0%, #9b111e 50%, #e0115f 100%)', glow: 'rgba(224, 17, 95, 0.5)' },
    'border-platinum': { gradient: 'linear-gradient(135deg, #e5e4e2 0%, #a0a0a0 50%, #e5e4e2 100%)', glow: 'rgba(229, 228, 226, 0.6)' },
    'border-sapphire': { gradient: 'linear-gradient(135deg, #0f52ba 0%, #082567 50%, #0f52ba 100%)', glow: 'rgba(15, 82, 186, 0.5)' },
    'border-amethyst': { gradient: 'linear-gradient(135deg, #9966cc 0%, #663399 50%, #9966cc 100%)', glow: 'rgba(153, 102, 204, 0.5)' },
    'border-diamond': { gradient: 'linear-gradient(135deg, #b9f2ff 0%, #e6e6fa 25%, #ffffff 50%, #e6e6fa 75%, #b9f2ff 100%)', glow: 'rgba(185, 242, 255, 0.7)', animated: true },
    'border-rainbow': { gradient: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff0000 100%)', glow: 'rgba(255, 255, 255, 0.5)', animated: true },
    'border-nexus': { gradient: 'linear-gradient(135deg, #00adef 0%, #00ff88 25%, #8b5cf6 50%, #00ff88 75%, #00adef 100%)', glow: 'rgba(0, 173, 239, 0.7)', animated: true }
};

// ============ ANIMATIONS ============
const shimmer = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const slideDown = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const coinGlow = keyframes`
    0%, 100% { filter: drop-shadow(0 0 3px rgba(245, 158, 11, 0.5)); }
    50% { filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.8)); }
`;

const badgePulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
`;

const tooltipFadeIn = keyframes`
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ============ STYLED COMPONENTS ============
const Wrapper = styled.div`
    position: relative;
`;

const Container = styled.button`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: ${props => props.$open 
        ? `${props.theme.brand?.primary}26` 
        : 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${props => props.$open 
        ? `${props.theme.brand?.primary}66` 
        : `${props.theme.brand?.primary}33`};
    border-radius: 50px;
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
    color: inherit;
    font-family: inherit;

    &:hover {
        background: ${props => props.theme.brand?.primary}26;
        border-color: ${props => props.theme.brand?.primary}66;
        transform: translateY(-1px);
    }

    @media (max-width: 768px) {
        padding: 0.4rem 0.5rem;
        gap: 0.5rem;
    }
`;

// Avatar Components
const AvatarWrapper = styled.div`
    position: relative;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
`;

const AvatarBorder = styled.div`
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: ${props => props.$gradient};
    background-size: 200% 200%;
    box-shadow: 0 0 6px ${props => props.$glow};
    
    ${props => props.$animated && css`
        animation: ${shimmer} 3s ease-in-out infinite;
    `}
`;

const AvatarInner = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const AvatarImg = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
`;

const AvatarInitials = styled.div`
    font-size: 14px;
    font-weight: 700;
    background: ${props => props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.accent || props.theme.success} 100%)`};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

// Stats in button
const QuickStats = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 480px) {
        gap: 0.5rem;
    }
`;

const StatChip = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: ${props => props.$color || props.theme.text?.secondary};
    font-size: 0.8rem;
    font-weight: 600;

    svg {
        color: ${props => props.$iconColor || props.$color || props.theme.text?.secondary};
    }
`;

const CoinChip = styled(StatChip)`
    color: #fbbf24;
    
    svg {
        color: #f59e0b;
        animation: ${coinGlow} 2s ease-in-out infinite;
    }
`;

const LevelChip = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary}4D 0%, ${props => props.theme.brand?.accent || props.theme.brand?.secondary}4D 100%);
    border: 1px solid ${props => props.theme.brand?.primary}80;
    color: ${props => props.theme.brand?.primary};
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
`;

// ============ BADGE COMPONENTS ============
const BadgesContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    @media (max-width: 640px) {
        display: none;
    }
`;

const BadgeItem = styled.div`
    position: relative;
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: ${props => props.$color ? `${props.$color}30` : 'rgba(100, 116, 139, 0.3)'};
    border: 1.5px solid ${props => props.$color || '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        transform: scale(1.15);
        box-shadow: 0 0 10px ${props => props.$color || '#64748b'}60;
        z-index: 10;
    }
    
    ${props => props.$legendary && css`
        animation: ${badgePulse} 2s ease-in-out infinite;
        box-shadow: 0 0 8px ${props.$color || '#f59e0b'}50;
    `}
`;

const BadgeTooltip = styled.div`
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid ${props => props.$color || 'rgba(100, 116, 139, 0.5)'};
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    white-space: nowrap;
    z-index: 1000;
    animation: ${tooltipFadeIn} 0.2s ease-out;
    pointer-events: none;
    
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: rgba(15, 23, 42, 0.98);
    }
`;

const BadgeTooltipName = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: #f8fafc;
`;

const MoreBadges = styled.div`
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: rgba(100, 116, 139, 0.2);
    border: 1.5px solid rgba(100, 116, 139, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    font-weight: 700;
    color: ${props => props.theme.text?.secondary};
`;

const DropdownIcon = styled(ChevronDown)`
    color: ${props => props.theme.text?.tertiary};
    transition: transform 0.3s ease;
    transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};

    @media (max-width: 480px) {
        display: none;
    }
`;

// ============ DROPDOWN PANEL ============
const DropdownPanel = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 340px;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid ${props => props.theme.brand?.primary}4D;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    animation: ${slideDown} 0.3s ease-out;
    z-index: 1001;
    overflow: hidden;

    @media (max-width: 400px) {
        width: 300px;
        right: -50px;
    }
`;

const PanelHeader = styled.div`
    padding: 1.25rem;
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary}26 0%, ${props => props.theme.brand?.accent || props.theme.brand?.secondary}1a 100%);
    border-bottom: 1px solid ${props => props.theme.brand?.primary}33;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const HeaderAvatar = styled.div`
    position: relative;
    width: 56px;
    height: 56px;
`;

const HeaderAvatarBorder = styled.div`
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: ${props => props.$gradient};
    background-size: 200% 200%;
    box-shadow: 0 0 10px ${props => props.$glow};
    
    ${props => props.$animated && css`
        animation: ${shimmer} 3s ease-in-out infinite;
    `}
`;

const HeaderAvatarInner = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const HeaderInfo = styled.div`
    flex: 1;
`;

const HeaderName = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 0.25rem;
`;

const HeaderRank = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RankBadge = styled.span`
    background: ${props => props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.accent || props.theme.brand?.secondary} 100%)`};
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
`;

const RankTitle = styled.span`
    color: ${props => props.theme.text?.secondary};
    font-size: 0.8rem;
`;

// Badges Section in Dropdown
const BadgesSection = styled.div`
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid ${props => props.theme.brand?.primary}1a;
`;

const BadgesSectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const BadgesSectionTitle = styled.span`
    color: ${props => props.theme.text?.secondary};
    font-size: 0.8rem;
    font-weight: 600;
`;

const BadgesSectionLink = styled.button`
    background: none;
    border: none;
    color: ${props => props.theme.brand?.primary};
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    &:hover {
        text-decoration: underline;
    }
`;

const BadgesGrid = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const DropdownBadge = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$color ? `${props.$color}25` : 'rgba(100, 116, 139, 0.2)'};
    border: 2px solid ${props => props.$color || '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    
    &:hover {
        transform: scale(1.1);
        box-shadow: 0 0 12px ${props => props.$color || '#64748b'}50;
    }
    
    ${props => props.$legendary && css`
        animation: ${badgePulse} 2s ease-in-out infinite;
        box-shadow: 0 0 10px ${props.$color || '#f59e0b'}40;
    `}
`;

const EmptyBadgesText = styled.div`
    color: ${props => props.theme.text?.tertiary};
    font-size: 0.8rem;
    font-style: italic;
`;

// XP Progress Section
const XPSection = styled.div`
    padding: 1rem 1.25rem;
    border-bottom: 1px solid ${props => props.theme.brand?.primary}1a;
`;

const XPHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const XPLabel = styled.span`
    color: ${props => props.theme.text?.secondary};
    font-size: 0.8rem;
    font-weight: 600;
`;

const XPValue = styled.span`
    color: ${props => props.theme.brand?.primary};
    font-size: 0.8rem;
    font-weight: 700;
`;

const XPBarTrack = styled.div`
    height: 8px;
    background: ${props => props.theme.text?.tertiary}4D;
    border-radius: 4px;
    overflow: hidden;
`;

const XPBarFill = styled.div`
    height: 100%;
    width: ${props => props.$percent || 0}%;
    background: ${props => props.theme.brand?.gradient || `linear-gradient(90deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.accent || props.theme.brand?.secondary} 100%)`};
    border-radius: 4px;
    transition: width 0.5s ease;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: ${shimmer} 2s ease-in-out infinite;
    }
`;

// Stats Grid
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid ${props => props.theme.brand?.primary}1a;
`;

const StatCard = styled.div`
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid ${props => props.theme.text?.tertiary}33;
    border-radius: 12px;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const StatIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$bg || `${props.theme.brand?.primary}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme.brand?.primary};
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
    font-size: 1rem;
    font-weight: 700;
    color: #f8fafc;
`;

const StatLabel = styled.div`
    font-size: 0.7rem;
    color: ${props => props.theme.text?.tertiary};
`;

// Quick Links
const QuickLinks = styled.div`
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const QuickLink = styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: #f8fafc;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;

    &:hover {
        background: ${props => props.theme.brand?.primary}1a;
        color: ${props => props.theme.brand?.primary};
        padding-left: 1.25rem;
    }
`;

const QuickLinkLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const QuickLinkIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$bg || `${props.theme.brand?.primary}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme.brand?.primary};
`;

// ============ SINGLE BADGE WITH TOOLTIP ============
const NavBadge = ({ badgeId, size = 22 }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    const color = BADGE_COLORS[badgeId] || '#64748b';
    const name = BADGE_NAMES[badgeId] || 'Unknown Badge';
    
    return (
        <BadgeItem
            $color={color}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{ width: size + 4, height: size + 4, background: 'transparent', border: 'none' }}
        >
            <BadgeIcon badgeId={badgeId} size={size} showParticles={false} />
            {showTooltip && (
                <BadgeTooltip $color={color}>
                    <BadgeTooltipName>{name}</BadgeTooltipName>
                </BadgeTooltip>
            )}
        </BadgeItem>
    );
};

// ============ COMPONENT ============
const NavbarGamification = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme } = useTheme();
    const { gamificationData, loading, vault } = useGamification();
    const { equippedBadges } = useVault();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

useEffect(() => {
    const handleUserUpdate = (event) => {
        console.log('[Navbar] User data updated, refreshing...');
        // Component will re-render automatically when user changes
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
        window.removeEventListener('userUpdated', handleUserUpdate);
    };
}, []);

    // Extract raw XP and coins
    const totalXp = gamificationData?.xp || 0;
    const nexusCoins = gamificationData?.nexusCoins || 0;
    const loginStreak = gamificationData?.loginStreak || 0;
    const stats = gamificationData?.stats || {};
    const achievements = gamificationData?.achievements || [];

    // 🔥 AUTO-CALCULATE LEVEL FROM XP (1000 XP per level)
    const getRankForLevel = (lvl) => {
        if (lvl >= 100) return 'Wall Street Titan';
        if (lvl >= 75) return 'Market Mogul';
        if (lvl >= 50) return 'Trading Legend';
        if (lvl >= 40) return 'Master Trader';
        if (lvl >= 30) return 'Expert Trader';
        if (lvl >= 20) return 'Veteran Trader';
        if (lvl >= 15) return 'Advanced Trader';
        if (lvl >= 10) return 'Skilled Trader';
        if (lvl >= 5) return 'Apprentice Trader';
        if (lvl >= 2) return 'Novice Trader';
        return 'Rookie Trader';
    };

    const level = Math.floor(totalXp / 1000) + 1;
    const rank = getRankForLevel(level);
    
    // Calculate XP progress within current level
    const xpForCurrentLevel = (level - 1) * 1000;
    const xpForNextLevel = level * 1000;
    const xpInLevel = totalXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 0;

    // Get border style
    const borderId = vault?.equippedBorder || 'border-bronze';
    const borderStyle = BORDER_COLORS[borderId] || BORDER_COLORS['border-bronze'];

    // Get equipped badges
    const badges = equippedBadges || [];
    const navbarBadges = badges.slice(0, 3);
    const remainingBadges = badges.length - 3;

    // Get initials
    const getInitials = () => {
        const name = user?.name || user?.displayName;
        if (name) {
            return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
        return user?.username?.substring(0, 2).toUpperCase() || 'U';
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    if (loading) {
        return (
            <Container style={{ opacity: 0.5 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(100,116,139,0.3)' }} />
            </Container>
        );
    }

    return (
        <Wrapper ref={wrapperRef}>
            <Container onClick={() => setIsOpen(!isOpen)} $open={isOpen}>
                {/* Avatar with Border */}
                <AvatarWithBorder
                    src={user?.profile?.avatar}
                    name={user?.name}
                    username={user?.username}
                    size={36}
                    borderId={borderId}
                    showParticles={false}
                />

                {/* Quick Stats */}
                <QuickStats>
                    <LevelChip>Lv.{level}</LevelChip>
                    
                    {navbarBadges.length > 0 && (
                        <BadgesContainer>
                            {navbarBadges.map(badgeId => (
                                <NavBadge key={badgeId} badgeId={badgeId} size={22} />
                            ))}
                            {remainingBadges > 0 && (
                                <MoreBadges>+{remainingBadges}</MoreBadges>
                            )}
                        </BadgesContainer>
                    )}
                    
                    <CoinChip>
                        <Coins size={14} />
                        <span>{nexusCoins.toLocaleString()}</span>
                    </CoinChip>
                    <StatChip $color={loginStreak > 0 ? '#f97316' : undefined}>
                        <Flame size={14} />
                        <span>{loginStreak}</span>
                    </StatChip>
                </QuickStats>

                <DropdownIcon size={16} $open={isOpen} />
            </Container>

            {/* Dropdown Panel */}
            {isOpen && (
                <DropdownPanel>
                    {/* Header */}
                    <PanelHeader>
                        <AvatarWithBorder
                            src={user?.profile?.avatar}
                            name={user?.name}
                            username={user?.username}
                            size={56}
                            borderId={borderId}
                            showParticles={true}
                        />
                        <HeaderInfo>
                            <HeaderName>{user?.name || 'Trader'}</HeaderName>
                            <HeaderRank>
                                <RankBadge>Level {level}</RankBadge>
                                <RankTitle>{rank}</RankTitle>
                            </HeaderRank>
                        </HeaderInfo>
                    </PanelHeader>

                    {/* Badges Section */}
                    <BadgesSection>
                        <BadgesSectionHeader>
                            <BadgesSectionTitle>Equipped Badges</BadgesSectionTitle>
                            <BadgesSectionLink onClick={() => handleNavigate('/vault')}>
                                Manage <ArrowRight size={12} />
                            </BadgesSectionLink>
                        </BadgesSectionHeader>
                        <BadgesGrid>
                          {badges.length > 0 ? (
    badges.map(badgeId => (
        <DropdownBadge 
            key={badgeId} 
            $color={BADGE_COLORS[badgeId] || '#64748b'}
            title={BADGE_NAMES[badgeId]}
            style={{ background: 'transparent', border: 'none' }}
        >
            <BadgeIcon badgeId={badgeId} size={28} showParticles={false} />
        </DropdownBadge>
    ))
) : (
    <EmptyBadgesText>No badges equipped</EmptyBadgesText>
)}
                        </BadgesGrid>
                    </BadgesSection>

                    {/* XP Progress */}
                    <XPSection>
                        <XPHeader>
                            <XPLabel>Experience Progress</XPLabel>
                            <XPValue>{Math.floor(xpInLevel).toLocaleString()} / {xpNeeded.toLocaleString()} XP</XPValue>
                        </XPHeader>
                        <XPBarTrack>
                            <XPBarFill $percent={Math.min(100, xpProgress)} />
                        </XPBarTrack>
                    </XPSection>

                    {/* Stats Grid - Uses theme colors */}
                    <StatsGrid>
                        <StatCard>
                            <StatIcon $bg={`${theme.warning}26`} $color={theme.warning}>
                                <Coins size={18} />
                            </StatIcon>
                            <StatInfo>
                                <StatValue>{nexusCoins.toLocaleString()}</StatValue>
                                <StatLabel>Nexus Coins</StatLabel>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $bg="rgba(249, 115, 22, 0.15)" $color="#f97316">
                                <Flame size={18} />
                            </StatIcon>
                            <StatInfo>
                                <StatValue>{loginStreak} days</StatValue>
                                <StatLabel>Login Streak</StatLabel>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $bg={`${theme.brand?.accent || theme.brand?.primary}26`} $color={theme.brand?.accent || theme.brand?.primary}>
                                <Trophy size={18} />
                            </StatIcon>
                            <StatInfo>
                                <StatValue>{achievements?.length || 0}</StatValue>
                                <StatLabel>Achievements</StatLabel>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $bg={`${theme.success}26`} $color={theme.success}>
                                <TrendingUp size={18} />
                            </StatIcon>
                            <StatInfo>
                                <StatValue>{stats?.totalTrades || 0}</StatValue>
                                <StatLabel>Total Trades</StatLabel>
                            </StatInfo>
                        </StatCard>
                    </StatsGrid>

                    {/* Quick Links - Uses theme colors */}
                    <QuickLinks>
                        <QuickLink onClick={() => handleNavigate('/dashboard')}>
                            <QuickLinkLeft>
                                <QuickLinkIcon $bg={`${theme.brand?.primary}26`} $color={theme.brand?.primary}>
                                    <BarChart2 size={16} />
                                </QuickLinkIcon>
                                <span>Dashboard</span>
                            </QuickLinkLeft>
                            <ArrowRight size={16} />
                        </QuickLink>

                        <QuickLink onClick={() => handleNavigate('/vault')}>
                            <QuickLinkLeft>
                                <QuickLinkIcon $bg={`${theme.warning}26`} $color={theme.warning}>
                                    <DollarSign size={16} />
                                </QuickLinkIcon>
                                <span>The Vault</span>
                            </QuickLinkLeft>
                            <ArrowRight size={16} />
                        </QuickLink>

                        <QuickLink onClick={() => handleNavigate('/achievements/browse')}>
                            <QuickLinkLeft>
                                <QuickLinkIcon $bg={`${theme.brand?.accent || theme.brand?.primary}26`} $color={theme.brand?.accent || theme.brand?.primary}>
                                    <Award size={16} />
                                </QuickLinkIcon>
                                <span>Achievements</span>
                            </QuickLinkLeft>
                            <ArrowRight size={16} />
                        </QuickLink>

                        <QuickLink onClick={() => handleNavigate('/leaderboard')}>
                            <QuickLinkLeft>
                                <QuickLinkIcon $bg={`${theme.success}26`} $color={theme.success}>
                                    <Trophy size={16} />
                                </QuickLinkIcon>
                                <span>Leaderboard</span>
                            </QuickLinkLeft>
                            <ArrowRight size={16} />
                        </QuickLink>
                    </QuickLinks>
                </DropdownPanel>
            )}
        </Wrapper>
    );
};

export default NavbarGamification;
