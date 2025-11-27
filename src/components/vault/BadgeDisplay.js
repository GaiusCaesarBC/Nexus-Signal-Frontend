// client/src/components/vault/BadgeDisplay.js
// Displays user's equipped badges with tooltips and animations

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// ============ BADGE DEFINITIONS ============
// Must match vaultItems.js badges
export const BADGE_DEFINITIONS = {
    'badge-founder': {
        name: 'Founder',
        description: 'Early adopter of Nexus Signal',
        icon: '🏆',
        color: 'rgba(245, 158, 11, 0.3)',
        borderColor: '#f59e0b',
        rarity: 'legendary'
    },
    'badge-first-trade': {
        name: 'First Trade',
        description: 'Completed your first trade',
        icon: '📈',
        color: 'rgba(16, 185, 129, 0.3)',
        borderColor: '#10b981',
        rarity: 'common'
    },
    'badge-week-warrior': {
        name: 'Week Warrior',
        description: '7 day login streak',
        icon: '🔥',
        color: 'rgba(249, 115, 22, 0.3)',
        borderColor: '#f97316',
        rarity: 'common'
    },
    'badge-trade-master': {
        name: 'Trade Master',
        description: '500 trades completed',
        icon: '⚡',
        color: 'rgba(59, 130, 246, 0.3)',
        borderColor: '#3b82f6',
        rarity: 'rare'
    },
    'badge-portfolio-builder': {
        name: 'Portfolio Builder',
        description: '10 different stocks owned',
        icon: '🏗️',
        color: 'rgba(139, 92, 246, 0.3)',
        borderColor: '#8b5cf6',
        rarity: 'rare'
    },
    'badge-profit-king': {
        name: 'Profit King',
        description: '$10,000 total profit',
        icon: '👑',
        color: 'rgba(245, 158, 11, 0.3)',
        borderColor: '#f59e0b',
        rarity: 'epic'
    },
    'badge-dedicated': {
        name: 'Dedicated',
        description: '30 day login streak',
        icon: '💎',
        color: 'rgba(6, 182, 212, 0.3)',
        borderColor: '#06b6d4',
        rarity: 'epic'
    },
    'badge-oracle': {
        name: 'Oracle',
        description: '100 correct predictions',
        icon: '🔮',
        color: 'rgba(168, 85, 247, 0.3)',
        borderColor: '#a855f7',
        rarity: 'epic'
    },
    'badge-half-century': {
        name: 'Half Century',
        description: 'Reached level 50',
        icon: '🎯',
        color: 'rgba(236, 72, 153, 0.3)',
        borderColor: '#ec4899',
        rarity: 'epic'
    },
    'badge-whale': {
        name: 'Whale',
        description: '100,000 Nexus Coins owned',
        icon: '🐋',
        color: 'rgba(59, 130, 246, 0.3)',
        borderColor: '#3b82f6',
        rarity: 'legendary'
    },
    'badge-centurion': {
        name: 'Centurion',
        description: 'Reached level 100',
        icon: '🏛️',
        color: 'rgba(245, 158, 11, 0.3)',
        borderColor: '#f59e0b',
        rarity: 'legendary'
    },
    'badge-millionaire': {
        name: 'Millionaire',
        description: '$1,000,000 portfolio value',
        icon: '💰',
        color: 'rgba(16, 185, 129, 0.3)',
        borderColor: '#10b981',
        rarity: 'legendary'
    }
};

// ============ ANIMATIONS ============
const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
`;

const shine = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ============ STYLED COMPONENTS ============
const BadgeContainer = styled.div`
    display: flex;
    gap: ${props => props.$gap || '0.5rem'};
    flex-wrap: wrap;
    align-items: center;
`;

const BadgeWrapper = styled.div`
    position: relative;
    display: inline-flex;
`;

const Badge = styled.div`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border-radius: ${props => props.$rounded ? '50%' : '10px'};
    background: ${props => props.$color || 'rgba(100, 116, 139, 0.3)'};
    border: 2px solid ${props => props.$borderColor || '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.$size * 0.5}px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    ${props => props.$rarity === 'legendary' && css`
        animation: ${pulse} 2s ease-in-out infinite;
        box-shadow: 0 0 15px ${props.$borderColor || '#f59e0b'};
        
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.2),
                transparent
            );
            background-size: 200% 100%;
            animation: ${shine} 3s linear infinite;
        }
    `}
    
    ${props => props.$rarity === 'epic' && css`
        box-shadow: 0 0 10px ${props.$borderColor || '#8b5cf6'}80;
    `}
    
    &:hover {
        transform: scale(1.1) translateY(-2px);
        box-shadow: 0 5px 20px ${props => props.$borderColor || '#64748b'}60;
    }
`;

const Tooltip = styled.div`
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid ${props => props.$borderColor || 'rgba(100, 116, 139, 0.5)'};
    border-radius: 10px;
    padding: 0.75rem 1rem;
    min-width: 180px;
    z-index: 1000;
    animation: ${fadeIn} 0.2s ease-out;
    pointer-events: none;
    
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 8px solid transparent;
        border-top-color: rgba(15, 23, 42, 0.98);
    }
`;

const TooltipHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const TooltipIcon = styled.span`
    font-size: 1.25rem;
`;

const TooltipName = styled.div`
    font-weight: 700;
    color: #f8fafc;
    font-size: 0.9rem;
`;

const TooltipRarity = styled.span`
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: auto;
    background: ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.3)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.3)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.3)';
        return 'rgba(100, 116, 139, 0.3)';
    }};
    color: ${props => {
        if (props.$rarity === 'legendary') return '#f59e0b';
        if (props.$rarity === 'epic') return '#a78bfa';
        if (props.$rarity === 'rare') return '#60a5fa';
        return '#94a3b8';
    }};
`;

const TooltipDescription = styled.div`
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.4;
`;

const EmptyBadge = styled.div`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border-radius: ${props => props.$rounded ? '50%' : '10px'};
    background: rgba(30, 41, 59, 0.5);
    border: 2px dashed rgba(100, 116, 139, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #475569;
    font-size: ${props => props.$size * 0.4}px;
`;

const MoreBadges = styled.div`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border-radius: ${props => props.$rounded ? '50%' : '10px'};
    background: rgba(100, 116, 139, 0.2);
    border: 2px solid rgba(100, 116, 139, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: ${props => props.$size * 0.35}px;
    font-weight: 700;
`;

// ============ SINGLE BADGE COMPONENT ============
const SingleBadge = ({ badgeId, size = 40, rounded = false, showTooltip = true }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const badge = BADGE_DEFINITIONS[badgeId];
    
    if (!badge) {
        return (
            <EmptyBadge $size={size} $rounded={rounded}>
                ?
            </EmptyBadge>
        );
    }
    
    return (
        <BadgeWrapper
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Badge
                $size={size}
                $rounded={rounded}
                $color={badge.color}
                $borderColor={badge.borderColor}
                $rarity={badge.rarity}
            >
                {badge.icon}
            </Badge>
            
            {showTooltip && isHovered && (
                <Tooltip $borderColor={badge.borderColor}>
                    <TooltipHeader>
                        <TooltipIcon>{badge.icon}</TooltipIcon>
                        <TooltipName>{badge.name}</TooltipName>
                        <TooltipRarity $rarity={badge.rarity}>
                            {badge.rarity}
                        </TooltipRarity>
                    </TooltipHeader>
                    <TooltipDescription>{badge.description}</TooltipDescription>
                </Tooltip>
            )}
        </BadgeWrapper>
    );
};

// ============ MAIN BADGE DISPLAY COMPONENT ============
const BadgeDisplay = ({
    badges = [],
    maxDisplay = 5,
    size = 40,
    gap = '0.5rem',
    rounded = false,
    showTooltip = true,
    showEmpty = false,
    emptySlots = 0
}) => {
    const displayBadges = badges.slice(0, maxDisplay);
    const remainingCount = badges.length - maxDisplay;
    const emptyCount = showEmpty ? Math.max(0, emptySlots - badges.length) : 0;
    
    if (badges.length === 0 && !showEmpty) {
        return null;
    }
    
    return (
        <BadgeContainer $gap={gap}>
            {displayBadges.map((badgeId, index) => (
                <SingleBadge
                    key={badgeId || index}
                    badgeId={badgeId}
                    size={size}
                    rounded={rounded}
                    showTooltip={showTooltip}
                />
            ))}
            
            {remainingCount > 0 && (
                <MoreBadges $size={size} $rounded={rounded}>
                    +{remainingCount}
                </MoreBadges>
            )}
            
            {Array.from({ length: emptyCount }).map((_, index) => (
                <EmptyBadge key={`empty-${index}`} $size={size} $rounded={rounded}>
                    +
                </EmptyBadge>
            ))}
        </BadgeContainer>
    );
};

// ============ EXPORTS ============
export default BadgeDisplay;
export { SingleBadge, BADGE_DEFINITIONS };