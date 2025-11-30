// components/BadgeDisplay.js - Badge Display System
// Use this component everywhere badges need to be shown
// Profile, Leaderboard, Navbar, Vault, etc.

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import BadgeIcon from './BadgeIcon';

// ═══════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
`;

// ═══════════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════

const BadgeWrapper = styled.div`
    position: relative;
    display: inline-flex;
    cursor: pointer;
    transition: transform 0.2s ease;
    
    &:hover {
        transform: scale(1.1);
    }
`;

const Tooltip = styled.div`
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
    border: 1px solid ${props => props.$borderColor || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    padding: 12px 16px;
    min-width: 200px;
    max-width: 280px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: ${fadeIn} 0.2s ease;
    pointer-events: none;
    
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 8px solid transparent;
        border-top-color: ${props => props.$borderColor || 'rgba(100, 116, 139, 0.3)'};
    }
`;

const TooltipHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
`;

const TooltipBadgePreview = styled.div`
    flex-shrink: 0;
`;

const TooltipInfo = styled.div`
    flex: 1;
`;

const TooltipName = styled.div`
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$color || '#f1f5f9'};
    margin-bottom: 2px;
`;

const TooltipRarity = styled.div`
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => props.$color || '#94a3b8'};
`;

const TooltipDescription = styled.div`
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.4;
`;

const TooltipDivider = styled.div`
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(100, 116, 139, 0.3), transparent);
    margin: 8px 0;
`;

const TooltipRequirement = styled.div`
    font-size: 11px;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
    
    span {
        color: ${props => props.$color || '#94a3b8'};
    }
`;

const LockedOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        width: 40%;
        height: 40%;
        fill: #475569;
    }
`;

const BadgeRow = styled.div`
    display: flex;
    gap: ${props => props.$gap || '8'}px;
    flex-wrap: wrap;
    align-items: center;
`;

const BadgeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(${props => props.$size + 20}px, 1fr));
    gap: ${props => props.$gap || '12'}px;
    justify-items: center;
`;

const EmptyState = styled.div`
    color: #64748b;
    font-size: 13px;
    text-align: center;
    padding: 20px;
`;

// ═══════════════════════════════════════════════════════════════
// RARITY COLORS
// ═══════════════════════════════════════════════════════════════

const RARITY_COLORS = {
    common: { primary: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
    rare: { primary: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)' },
    epic: { primary: '#8b5cf6', border: 'rgba(139, 92, 246, 0.5)' },
    legendary: { primary: '#fbbf24', border: 'rgba(251, 191, 36, 0.5)' },
    mythic: { primary: '#ec4899', border: 'rgba(236, 72, 153, 0.5)' },
    origin: { primary: '#d4af37', border: 'rgba(212, 175, 55, 0.6)' }
};

const RARITY_LABELS = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
    mythic: 'Mythic',
    origin: 'Origin'
};

// ═══════════════════════════════════════════════════════════════
// LOCK ICON
// ═══════════════════════════════════════════════════════════════

const LockIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
);

// ═══════════════════════════════════════════════════════════════
// SINGLE BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const SingleBadge = ({ 
    badge, 
    size = 48, 
    showTooltip = true, 
    isLocked = false,
    showParticles = true 
}) => {
    const [hovered, setHovered] = useState(false);
    
    const rarity = badge?.rarity || 'common';
    const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
    
    const getRequirementText = () => {
        if (!badge?.unlockRequirement) return null;
        
        const req = badge.unlockRequirement;
        
        if (req.type === 'level') {
            return `Reach Level ${req.value}`;
        }
        if (req.type === 'stats') {
            const statLabels = {
                totalTrades: 'trades',
                profitableTrades: 'profitable trades',
                maxLoginStreak: 'day login streak',
                largestTrade: 'single trade value',
                sectorsOwned: 'sectors',
                correctPredictions: 'correct predictions',
                totalProfit: 'total profit',
                maxWinStreak: 'win streak',
                nexusCoins: 'Nexus Coins',
                portfolioValue: 'portfolio value',
                largestProfit: 'single trade profit',
                stocksOwned: 'stocks owned'
            };
            const label = statLabels[req.stat] || req.stat;
            const value = req.value >= 1000000 ? `$${(req.value / 1000000).toFixed(1)}M` :
                         req.value >= 1000 ? `${(req.value / 1000).toFixed(0)}K` :
                         req.value;
            return `${value} ${label}`;
        }
        if (req.type === 'special') {
            const specialLabels = {
                market_open_trade: 'Trade at market open',
                after_hours_trade: 'Trade after hours',
                comeback_50: 'Recover from 50% loss',
                diamond_hands: 'Hold through 50% drawdown',
                speed_demon: '10 trades in 60 seconds'
            };
            return specialLabels[req.value] || req.value;
        }
        if (req.type === 'founder') {
            return 'Founders Only - Unobtainable';
        }
        
        return null;
    };

    return (
        <BadgeWrapper
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <BadgeIcon 
                badgeId={badge?.id} 
                size={size} 
                showParticles={showParticles && !isLocked}
            />
            
            {isLocked && (
                <LockedOverlay>
                    <LockIcon />
                </LockedOverlay>
            )}
            
            {showTooltip && hovered && badge && (
                <Tooltip $borderColor={colors.border}>
                    <TooltipHeader>
                        <TooltipBadgePreview>
                            <BadgeIcon badgeId={badge.id} size={36} showParticles={false} />
                        </TooltipBadgePreview>
                        <TooltipInfo>
                            <TooltipName $color={colors.primary}>
                                {badge.name}
                            </TooltipName>
                            <TooltipRarity $color={colors.primary}>
                                {RARITY_LABELS[rarity]}
                            </TooltipRarity>
                        </TooltipInfo>
                    </TooltipHeader>
                    
                    <TooltipDescription>
                        {badge.description}
                    </TooltipDescription>
                    
                    {getRequirementText() && (
                        <>
                            <TooltipDivider />
                            <TooltipRequirement $color={colors.primary}>
                                {isLocked ? '🔒' : '✓'} <span>{getRequirementText()}</span>
                            </TooltipRequirement>
                        </>
                    )}
                </Tooltip>
            )}
        </BadgeWrapper>
    );
};

// ═══════════════════════════════════════════════════════════════
// BADGE LIST COMPONENT (ROW)
// ═══════════════════════════════════════════════════════════════
const BadgeList = ({
    badges = [],
    size = 32,
    gap = 6,
    maxDisplay = 5,
    showTooltip = true,
    showParticles = false
}) => {
    if (!badges || badges.length === 0) {
        return null;
    }

    const displayBadges = badges.slice(0, maxDisplay);
    const remaining = badges.length - maxDisplay;

    return (
        <BadgeRow $gap={gap}>
            {displayBadges.map((badge, index) => {
                // Handle both string IDs and badge objects
                const badgeId = typeof badge === 'string' ? badge : badge.id;
                const badgeObj = typeof badge === 'string' ? { id: badge } : badge;
                
                return (
                    <SingleBadge
                        key={badgeId || index}
                        badge={badgeObj}
                        size={size}
                        showTooltip={showTooltip}
                        showParticles={showParticles}
                    />
                );
            })}
            {remaining > 0 && (
                <MoreBadges>+{remaining}</MoreBadges>
            )}
        </BadgeRow>
    );
};

const MoreBadges = styled.div`
    font-size: 11px;
    color: #64748b;
    background: rgba(51, 65, 85, 0.5);
    padding: 4px 8px;
    border-radius: 12px;
    font-weight: 600;
`;

// ═══════════════════════════════════════════════════════════════
// BADGE GRID COMPONENT (FOR VAULT/PROFILE)
// ═══════════════════════════════════════════════════════════════

const BadgeGridDisplay = ({ 
    badges = [],
    ownedBadges = [],
    size = 56,
    gap = 16,
    showLocked = true,
    showTooltip = true,
    showParticles = true
}) => {
    if (!badges || badges.length === 0) {
        return <EmptyState>No badges available</EmptyState>;
    }
    
    const ownedIds = new Set(ownedBadges.map(b => typeof b === 'string' ? b : b.id));
    
    const displayBadges = showLocked 
        ? badges 
        : badges.filter(b => ownedIds.has(b.id));
    
    if (displayBadges.length === 0) {
        return <EmptyState>No badges earned yet</EmptyState>;
    }
    
    return (
        <BadgeGrid $size={size} $gap={gap}>
            {displayBadges.map(badge => (
                <SingleBadge 
                    key={badge.id}
                    badge={badge}
                    size={size}
                    isLocked={!ownedIds.has(badge.id)}
                    showTooltip={showTooltip}
                    showParticles={showParticles}
                />
            ))}
        </BadgeGrid>
    );
};

// ═══════════════════════════════════════════════════════════════
// FEATURED BADGE (FOR PROFILE HEADER)
// ═══════════════════════════════════════════════════════════════

const FeaturedBadgeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
`;

const FeaturedLabel = styled.div`
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #64748b;
`;

const FeaturedBadge = ({ badge, size = 64 }) => {
    if (!badge) return null;
    
    return (
        <FeaturedBadgeWrapper>
            <FeaturedLabel>Featured Badge</FeaturedLabel>
            <SingleBadge 
                badge={badge} 
                size={size} 
                showParticles={true}
            />
        </FeaturedBadgeWrapper>
    );
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export { 
    SingleBadge, 
    BadgeList, 
    BadgeGridDisplay, 
    FeaturedBadge,
    RARITY_COLORS,
    RARITY_LABELS
};

export default SingleBadge;