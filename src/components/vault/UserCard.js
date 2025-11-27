// client/src/components/vault/UserCard.js
// Reusable user card with avatar border, badges, and level
// Use in: Leaderboards, Feed posts, Profile pages, Comments, etc.

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AvatarWithBorder from './AvatarWithBorder';
import BadgeDisplay from './BadgeDisplay';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ============ STYLED COMPONENTS ============
const CardContainer = styled.div`
    display: flex;
    align-items: ${props => props.$align || 'center'};
    gap: ${props => props.$gap || '1rem'};
    padding: ${props => props.$padding || '0'};
    background: ${props => props.$background || 'transparent'};
    border-radius: ${props => props.$borderRadius || '0'};
    transition: all 0.3s ease;
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    
    ${props => props.$hoverable && `
        &:hover {
            background: rgba(0, 173, 239, 0.05);
            transform: translateY(-2px);
        }
    `}
    
    ${props => props.$animate && `
        animation: ${fadeIn} 0.3s ease-out;
    `}
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const DisplayName = styled.span`
    font-weight: 700;
    color: ${props => props.$color || '#f8fafc'};
    font-size: ${props => props.$size || '1rem'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    &:hover {
        color: #00adef;
    }
`;

const Username = styled.span`
    color: #64748b;
    font-size: ${props => props.$size || '0.85rem'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const LevelTag = styled.span`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #a78bfa;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    white-space: nowrap;
`;

const RankTag = styled.span`
    background: ${props => {
        switch(props.$rank) {
            case 1: return 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)';
            case 2: return 'linear-gradient(135deg, #c0c0c0 0%, #808080 100%)';
            case 3: return 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)';
            default: return 'rgba(100, 116, 139, 0.3)';
        }
    }};
    color: ${props => props.$rank <= 3 ? '#fff' : '#94a3b8'};
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    white-space: nowrap;
`;

const BottomRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const Subtitle = styled.span`
    color: #94a3b8;
    font-size: ${props => props.$size || '0.85rem'};
`;

const StatBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: ${props => props.$color || '#94a3b8'};
    font-size: 0.8rem;
    font-weight: 600;
`;

const BadgesRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
`;

const RightSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    flex-shrink: 0;
`;

// ============ COMPONENT ============
const UserCard = ({
    // User data
    user,
    userId,
    name,
    displayName,
    username,
    avatar,
    level = 1,
    rank, // Leaderboard position
    title, // Gamification title like "Rookie Trader"
    
    // Vault items
    equippedBorder = 'border-bronze',
    equippedBadges = [],
    
    // Display options
    avatarSize = 50,
    showLevel = true,
    showRank = false,
    showBadges = true,
    showUsername = true,
    showTitle = false,
    maxBadges = 3,
    badgeSize = 24,
    
    // Layout options
    variant = 'default', // default, compact, expanded
    align = 'center',
    gap = '1rem',
    padding,
    background,
    borderRadius,
    hoverable = false,
    clickable = true,
    animate = false,
    
    // Custom content
    subtitle,
    rightContent,
    stats = [],
    
    // Events
    onClick,
    onAvatarClick,
    
    // Styling
    className,
    style
}) => {
    const navigate = useNavigate();
    
    // Extract user data if user object is provided
    const userData = {
        name: name || displayName || user?.name || user?.displayName || 'Anonymous',
        username: username || user?.username,
        avatar: avatar || user?.profile?.avatar || user?.avatar,
        level: level || user?.gamification?.level || user?.level || 1,
        equippedBorder: equippedBorder || user?.vault?.equippedBorder || user?.equippedBorder || 'border-bronze',
        equippedBadges: equippedBadges?.length ? equippedBadges : 
                        (user?.vault?.equippedBadges || user?.equippedBadges || []),
        title: title || user?.gamification?.title || user?.title
    };
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (clickable && (userId || user?._id || user?.id || userData.username)) {
            const targetId = userId || user?._id || user?.id;
            if (targetId) {
                navigate(`/profile/${targetId}`);
            } else if (userData.username) {
                navigate(`/user/${userData.username}`);
            }
        }
    };
    
    const handleAvatarClick = (e) => {
        if (onAvatarClick) {
            e.stopPropagation();
            onAvatarClick();
        }
    };
    
    // Variant-specific settings
    const variantSettings = {
        compact: {
            avatarSize: avatarSize || 36,
            showBadges: false,
            gap: '0.75rem',
            badgeSize: 20
        },
        expanded: {
            avatarSize: avatarSize || 60,
            showBadges: true,
            gap: '1.25rem',
            badgeSize: 28
        },
        default: {
            avatarSize,
            showBadges,
            gap,
            badgeSize
        }
    };
    
    const settings = variantSettings[variant] || variantSettings.default;
    
    return (
        <CardContainer
            $align={align}
            $gap={settings.gap}
            $padding={padding}
            $background={background}
            $borderRadius={borderRadius}
            $hoverable={hoverable}
            $clickable={clickable}
            $animate={animate}
            onClick={handleClick}
            className={className}
            style={style}
        >
            <AvatarWithBorder
                src={userData.avatar}
                name={userData.name}
                username={userData.username}
                size={settings.avatarSize}
                borderId={userData.equippedBorder}
                showLevel={false}
                level={userData.level}
                onClick={onAvatarClick ? handleAvatarClick : undefined}
            />
            
            <UserInfo>
                <TopRow>
                    <DisplayName>{userData.name}</DisplayName>
                    {showLevel && userData.level > 0 && (
                        <LevelTag>Lv.{userData.level}</LevelTag>
                    )}
                    {showRank && rank && (
                        <RankTag $rank={rank}>#{rank}</RankTag>
                    )}
                </TopRow>
                
                <BottomRow>
                    {showUsername && userData.username && (
                        <Username>@{userData.username}</Username>
                    )}
                    {showTitle && userData.title && (
                        <Subtitle>{userData.title}</Subtitle>
                    )}
                    {subtitle && <Subtitle>{subtitle}</Subtitle>}
                    {stats.map((stat, index) => (
                        <StatBadge key={index} $color={stat.color}>
                            {stat.icon}
                            {stat.value}
                        </StatBadge>
                    ))}
                </BottomRow>
                
                {settings.showBadges && userData.equippedBadges?.length > 0 && (
                    <BadgesRow>
                        <BadgeDisplay
                            badges={userData.equippedBadges}
                            maxDisplay={maxBadges}
                            size={settings.badgeSize}
                            showTooltip={true}
                        />
                    </BadgesRow>
                )}
            </UserInfo>
            
            {rightContent && (
                <RightSection>
                    {rightContent}
                </RightSection>
            )}
        </CardContainer>
    );
};

export default UserCard;