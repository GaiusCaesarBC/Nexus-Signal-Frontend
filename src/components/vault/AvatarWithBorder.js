// client/src/components/vault/AvatarWithBorder.js
// Displays user avatar with their equipped border frame

import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { User } from 'lucide-react';

// ============ BORDER DEFINITIONS ============
// Must match vaultItems.js borders
const BORDER_STYLES = {
    'border-bronze': {
        gradient: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 50%, #cd7f32 100%)',
        glow: 'rgba(205, 127, 50, 0.5)',
        animation: null
    },
    'border-silver': {
        gradient: 'linear-gradient(135deg, #c0c0c0 0%, #808080 50%, #c0c0c0 100%)',
        glow: 'rgba(192, 192, 192, 0.5)',
        animation: null
    },
    'border-gold': {
        gradient: 'linear-gradient(135deg, #ffd700 0%, #b8860b 50%, #ffd700 100%)',
        glow: 'rgba(255, 215, 0, 0.6)',
        animation: null
    },
    'border-emerald': {
        gradient: 'linear-gradient(135deg, #50c878 0%, #2e8b57 50%, #50c878 100%)',
        glow: 'rgba(80, 200, 120, 0.5)',
        animation: null
    },
    'border-ruby': {
        gradient: 'linear-gradient(135deg, #e0115f 0%, #9b111e 50%, #e0115f 100%)',
        glow: 'rgba(224, 17, 95, 0.5)',
        animation: null
    },
    'border-platinum': {
        gradient: 'linear-gradient(135deg, #e5e4e2 0%, #a0a0a0 50%, #e5e4e2 100%)',
        glow: 'rgba(229, 228, 226, 0.6)',
        animation: null
    },
    'border-sapphire': {
        gradient: 'linear-gradient(135deg, #0f52ba 0%, #082567 50%, #0f52ba 100%)',
        glow: 'rgba(15, 82, 186, 0.5)',
        animation: null
    },
    'border-amethyst': {
        gradient: 'linear-gradient(135deg, #9966cc 0%, #663399 50%, #9966cc 100%)',
        glow: 'rgba(153, 102, 204, 0.5)',
        animation: null
    },
    'border-diamond': {
        gradient: 'linear-gradient(135deg, #b9f2ff 0%, #e6e6fa 25%, #ffffff 50%, #e6e6fa 75%, #b9f2ff 100%)',
        glow: 'rgba(185, 242, 255, 0.7)',
        animation: 'shimmer'
    },
    'border-rainbow': {
        gradient: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff0000 100%)',
        glow: 'rgba(255, 255, 255, 0.5)',
        animation: 'shimmer'
    },
    'border-nexus': {
        gradient: 'linear-gradient(135deg, #00adef 0%, #00ff88 25%, #8b5cf6 50%, #00ff88 75%, #00adef 100%)',
        glow: 'rgba(0, 173, 239, 0.7)',
        animation: 'pulse-glow'
    }
};

// ============ ANIMATIONS ============
const shimmer = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 10px var(--glow-color), 0 0 20px var(--glow-color);
        transform: scale(1);
    }
    50% { 
        box-shadow: 0 0 20px var(--glow-color), 0 0 40px var(--glow-color);
        transform: scale(1.02);
    }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const AvatarContainer = styled.div`
    position: relative;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    flex-shrink: 0;
    cursor: pointer;
`;

const BorderRing = styled.div`
    position: absolute;
    inset: -${props => props.$borderWidth}px;
    border-radius: 50%;
    background: ${props => props.$gradient};
    background-size: 200% 200%;
    padding: ${props => props.$borderWidth}px;
    --glow-color: ${props => props.$glow};
    pointer-events: none; /* Allow clicks to pass through to container */
    
    ${props => props.$animation === 'shimmer' && css`
        animation: ${shimmer} 3s ease-in-out infinite;
    `}
    
    ${props => props.$animation === 'pulse-glow' && css`
        animation: ${pulseGlow} 2s ease-in-out infinite;
    `}
    
    ${props => props.$animation === 'rotate' && css`
        animation: ${rotate} 10s linear infinite;
    `}
    
    /* Default glow effect */
    box-shadow: 0 0 ${props => props.$size / 10}px ${props => props.$glow};
    
    transition: all 0.3s ease;
    
    &:hover {
        box-shadow: 0 0 ${props => props.$size / 5}px ${props => props.$glow};
    }
`;

const AvatarInner = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${props => props.$background || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    pointer-events: none; /* Allow clicks to pass through to container */
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    pointer-events: none;
`;

const AvatarInitials = styled.div`
    font-size: ${props => props.$size * 0.4}px;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const DefaultAvatar = styled.div`
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const OnlineIndicator = styled.div`
    position: absolute;
    bottom: ${props => props.$size * 0.05}px;
    right: ${props => props.$size * 0.05}px;
    width: ${props => Math.max(props.$size * 0.2, 10)}px;
    height: ${props => Math.max(props.$size * 0.2, 10)}px;
    background: ${props => props.$online ? '#10b981' : '#64748b'};
    border-radius: 50%;
    border: 2px solid #0a0e27;
    z-index: 2;
`;

const LevelBadge = styled.div`
    position: absolute;
    bottom: -${props => props.$size * 0.1}px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    font-size: ${props => Math.max(props.$size * 0.18, 10)}px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
    border: 2px solid #0a0e27;
    z-index: 2;
    white-space: nowrap;
`;

// ============ COMPONENT ============
const AvatarWithBorder = ({
    src,
    name,
    username,
    size = 50,
    borderId = 'border-bronze',
    showOnline = false,
    isOnline = false,
    showLevel = false,
    level = 1,
    onClick,
    className
}) => {
    // Get border style or default to bronze
    const borderStyle = BORDER_STYLES[borderId] || BORDER_STYLES['border-bronze'];
    
    // Calculate border width based on size
    const borderWidth = Math.max(size * 0.06, 3);
    
    // Get initials from name or username
    const getInitials = () => {
        if (name) {
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2);
        }
        if (username) {
            return username.substring(0, 2);
        }
        return '';
    };

    return (
        <AvatarContainer 
            $size={size} 
            onClick={onClick}
            className={className}
        >
            <BorderRing
                $gradient={borderStyle.gradient}
                $glow={borderStyle.glow}
                $animation={borderStyle.animation}
                $borderWidth={borderWidth}
                $size={size}
            >
                <AvatarInner>
                    {src ? (
                        <AvatarImage 
                            src={src} 
                            alt={name || username || 'User'} 
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : getInitials() ? (
                        <AvatarInitials $size={size}>
                            {getInitials()}
                        </AvatarInitials>
                    ) : (
                        <DefaultAvatar>
                            <User size={size * 0.5} />
                        </DefaultAvatar>
                    )}
                </AvatarInner>
            </BorderRing>
            
            {showOnline && (
                <OnlineIndicator $size={size} $online={isOnline} />
            )}
            
            {showLevel && level > 0 && (
                <LevelBadge $size={size}>
                    Lv.{level}
                </LevelBadge>
            )}
        </AvatarContainer>
    );
};

// ============ EXPORTS ============
export default AvatarWithBorder;
export { BORDER_STYLES };