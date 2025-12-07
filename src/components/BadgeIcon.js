// components/BadgeIcon.js - NEXUS SIGNAL BADGE SYSTEM
// 26 Custom Rendered Badges with Animations & Effects
// ⚡ Common • Rare • Epic • Legendary • Mythic • Origin ⚡

import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// ═══════════════════════════════════════════════════════════════
// KEYFRAME ANIMATIONS
// ═══════════════════════════════════════════════════════════════

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
`;

const glow = keyframes`
    0%, 100% { filter: drop-shadow(0 0 3px currentColor); }
    50% { filter: drop-shadow(0 0 8px currentColor); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const reverseRotate = keyframes`
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
`;

const sparkle = keyframes`
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
`;

const legendaryPulse = keyframes`
    0%, 100% { 
        filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
    }
    50% { 
        filter: drop-shadow(0 0 8px rgba(251, 191, 36, 1)) drop-shadow(0 0 16px rgba(251, 191, 36, 0.6));
    }
`;

const mythicWarp = keyframes`
    0%, 100% { 
        filter: drop-shadow(0 0 6px rgba(236, 72, 153, 0.9)) drop-shadow(0 0 12px rgba(124, 58, 237, 0.6));
        transform: scale(1);
    }
    25% { 
        filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.9)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.6));
        transform: scale(1.02);
    }
    50% { 
        filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 16px rgba(251, 191, 36, 0.6));
        transform: scale(1);
    }
    75% { 
        filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.9)) drop-shadow(0 0 20px rgba(236, 72, 153, 0.6));
        transform: scale(1.02);
    }
`;

const originSacred = keyframes`
    0% { 
        transform: rotate(0deg);
        filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 16px rgba(212, 175, 55, 0.5));
    }
    50% { 
        filter: drop-shadow(0 0 12px rgba(248, 250, 252, 0.9)) drop-shadow(0 0 24px rgba(212, 175, 55, 0.7));
    }
    100% { 
        transform: rotate(360deg);
        filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 16px rgba(212, 175, 55, 0.5));
    }
`;

const electricArc = keyframes`
    0%, 100% { opacity: 1; }
    10% { opacity: 0.3; }
    20% { opacity: 1; }
    30% { opacity: 0.5; }
    40% { opacity: 1; }
`;

const fireFlicker = keyframes`
    0%, 100% { transform: scaleY(1) scaleX(1); }
    25% { transform: scaleY(1.05) scaleX(0.98); }
    50% { transform: scaleY(0.98) scaleX(1.02); }
    75% { transform: scaleY(1.03) scaleX(0.99); }
`;

// ═══════════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════

const BadgeContainer = styled.div`
    position: relative;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const BadgeOuter = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${props => props.$shape === 'hexagon' ? '15%' : props.$shape === 'diamond' ? '10%' : '50%'};
    ${props => props.$shape === 'diamond' && css`transform: rotate(45deg);`}
    ${props => props.$shape === 'hexagon' && css`clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);`}
    ${props => props.$shape === 'shield' && css`clip-path: polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%);`}
    ${props => props.$shape === 'star' && css`clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);`}
    background: ${props => props.$gradient};
    
    ${props => props.$rarity === 'common' && css`
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `}
    
    ${props => props.$rarity === 'rare' && css`
        box-shadow: 0 2px 12px rgba(59, 130, 246, 0.4);
        animation: ${glow} 3s ease-in-out infinite;
        color: #3b82f6;
    `}
    
    ${props => props.$rarity === 'epic' && css`
        box-shadow: 0 4px 16px rgba(139, 92, 246, 0.5);
        animation: ${pulse} 2s ease-in-out infinite, ${glow} 2s ease-in-out infinite;
        color: #8b5cf6;
    `}
    
    ${props => props.$rarity === 'legendary' && css`
        animation: ${legendaryPulse} 2s ease-in-out infinite;
    `}
    
    ${props => props.$rarity === 'mythic' && css`
        animation: ${mythicWarp} 4s ease-in-out infinite;
    `}
    
    ${props => props.$rarity === 'origin' && css`
        animation: ${originSacred} 20s linear infinite;
    `}
`;

const BadgeInner = styled.div`
    position: absolute;
    width: 75%;
    height: 75%;
    border-radius: inherit;
    ${props => props.$shape === 'diamond' && css`transform: rotate(45deg);`}
    ${props => props.$shape === 'hexagon' && css`clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);`}
    ${props => props.$shape === 'shield' && css`clip-path: polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%);`}
    ${props => props.$shape === 'star' && css`clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);`}
    background: ${props => props.$innerGradient};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
`;

const BadgeSymbol = styled.div`
    position: relative;
    width: 60%;
    height: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
    ${props => props.$shape === 'diamond' && css`transform: rotate(-45deg);`}
    
    svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
    }
    
    ${props => props.$animate === 'float' && css`
        animation: ${float} 2s ease-in-out infinite;
    `}
    
    ${props => props.$animate === 'rotate' && css`
        animation: ${rotate} 8s linear infinite;
    `}
    
    ${props => props.$animate === 'pulse' && css`
        animation: ${pulse} 1.5s ease-in-out infinite;
    `}
    
    ${props => props.$animate === 'fire' && css`
        animation: ${fireFlicker} 0.5s ease-in-out infinite;
    `}
    
    ${props => props.$animate === 'electric' && css`
        animation: ${electricArc} 0.3s ease-in-out infinite;
    `}
`;

const ShimmerOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    ${props => props.$shape === 'hexagon' && css`clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);`}
    ${props => props.$shape === 'shield' && css`clip-path: polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%);`}
    ${props => props.$shape === 'star' && css`clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);`}
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 45%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0.1) 55%,
        transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s ease-in-out infinite;
    pointer-events: none;
    z-index: 3;
`;

const ParticleContainer = styled.div`
    position: absolute;
    width: 140%;
    height: 140%;
    pointer-events: none;
    z-index: 1;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    background: ${props => props.$color};
    border-radius: 50%;
    opacity: 0;
    animation: ${sparkle} ${props => props.$duration}s ease-in-out infinite;
    animation-delay: ${props => props.$delay}s;
    top: ${props => props.$top}%;
    left: ${props => props.$left}%;
    box-shadow: 0 0 ${props => props.$size * 2}px ${props => props.$color};
`;

const SacredGeometry = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    pointer-events: none;
    z-index: 0;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-origin: center center;
        background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(212, 175, 55, 0.3) 30deg,
            transparent 60deg,
            rgba(248, 250, 252, 0.2) 90deg,
            transparent 120deg,
            rgba(212, 175, 55, 0.3) 150deg,
            transparent 180deg,
            rgba(248, 250, 252, 0.2) 210deg,
            transparent 240deg,
            rgba(212, 175, 55, 0.3) 270deg,
            transparent 300deg,
            rgba(248, 250, 252, 0.2) 330deg,
            transparent 360deg
        );
        animation: ${reverseRotate} 30s linear infinite;
        border-radius: 50%;
    }
`;

// ═══════════════════════════════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════════════════════════════

const Icons = {
    // Trading & Finance
    lightning: (
        <svg viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 24 24">
            <path d="M3 3v18h18M9 17V9m4 8V5m4 12v-6"/>
        </svg>
    ),
    rocket: (
        <svg viewBox="0 0 24 24">
            <path d="M12 2c-4 4-6 8-6 12 0 2 .5 4 1.5 5.5L12 22l4.5-2.5C17.5 18 18 16 18 14c0-4-2-8-6-12zM12 14a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
    ),
    diamond: (
        <svg viewBox="0 0 24 24">
            <path d="M12 2L2 9l10 13L22 9 12 2zm0 4l6 5-6 7.5L6 11l6-5z"/>
        </svg>
    ),
    crown: (
        <svg viewBox="0 0 24 24">
            <path d="M2 20h20v-2H2v2zm2-4h16l-2-8-4 4-4-6-4 6-4-4 2 8z"/>
        </svg>
    ),
    fire: (
        <svg viewBox="0 0 24 24">
            <path d="M12 23c-4.4 0-8-3.6-8-8 0-3.5 2.3-6.5 5.5-8.5-.3 1.5 0 3 1 4.5 0-4 3-7 5.5-9 0 2.5 1 4 2.5 5.5 1-1 1.5-2.5 1.5-4 2 2.5 2 5.5 2 7.5 0 4.4-3.6 8-8 8z"/>
        </svg>
    ),
    star: (
        <svg viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24">
            <path d="M12 2L4 6v6c0 5.5 3.4 10.3 8 12 4.6-1.7 8-6.5 8-12V6l-8-4zm0 4l4 2v4c0 3.3-2 6.2-4 7.5-2-1.3-4-4.2-4-7.5V8l4-2z"/>
        </svg>
    ),
    trophy: (
        <svg viewBox="0 0 24 24">
            <path d="M6 4h12v2h2V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2h2V4zm12 4H6c-1.1 0-2 .9-2 2v2c0 2.2 1.8 4 4 4h1v2H7v2h10v-2h-2v-2h1c2.2 0 4-1.8 4-4v-2c0-1.1-.9-2-2-2z"/>
        </svg>
    ),
    target: (
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>
    ),
    sun: (
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
    ),
    moon: (
        <svg viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
    ),
    bolt: (
        <svg viewBox="0 0 24 24">
            <path d="M11 2v8H6l7 12v-8h5L11 2z"/>
        </svg>
    ),
    whale: (
        <svg viewBox="0 0 24 24">
            <path d="M21 11c0-4-3-7-7-7-2 0-4 1-5.5 2.5C7 5 5 5.5 3 7c0 0 1 3 4 4-1 2-1 4 0 6 2 3 6 4 10 3 3-1 5-4 5-7 0-1-.3-1.7-1-2zm-3 2a1 1 0 11-2 0 1 1 0 012 0z"/>
        </svg>
    ),
    infinity: (
        <svg viewBox="0 0 24 24">
            <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z" fill="currentColor"/>
        </svg>
    ),
    skull: (
        <svg viewBox="0 0 24 24">
            <circle cx="9" cy="10" r="2"/>
            <circle cx="15" cy="10" r="2"/>
            <path d="M12 2C6.48 2 2 6.48 2 12v4h3v-2h2v2h6v-2h2v2h3v-4c0-5.52-4.48-10-10-10zm0 18c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z"/>
        </svg>
    ),
    gem: (
        <svg viewBox="0 0 24 24">
            <path d="M6 2l-4 7 10 13L22 9l-4-7H6zm0 2h3L7 7H4l2-3zm6 13.5L5 10h4l3 7.5zm0 0L15 10h4l-7 7.5zM17 7l-2-3h3l2 3h-3zm-5-3l2 3h-4l2-3z"/>
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
    ),
    compass: (
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
    ),
    hourglass: (
        <svg viewBox="0 0 24 24">
            <path d="M6 2v6l4 4-4 4v6h12v-6l-4-4 4-4V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>
        </svg>
    ),
    anchor: (
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v13M5 12h2m10 0h2M7 21c0-4.4 2.2-8 5-8s5 3.6 5 8"/>
        </svg>
    ),
    scales: (
        <svg viewBox="0 0 24 24">
            <path d="M12 3v18M3 6l3 8c0 1.7 1.3 3 3 3s3-1.3 3-3L9 6H3zm12 0l3 8c0 1.7 1.3 3 3 3s3-1.3 3-3l-3-8h-6z"/>
        </svg>
    ),
    atom: (
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="2"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(0)"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)"/>
            <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)"/>
        </svg>
    ),
    pyramid: (
        <svg viewBox="0 0 24 24">
            <path d="M12 2L2 22h20L12 2zm0 5l6 12H6l6-12z"/>
        </svg>
    ),
    metatron: (
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <circle cx="12" cy="2" r="1.5"/>
            <circle cx="12" cy="22" r="1.5"/>
            <circle cx="3.34" cy="7" r="1.5"/>
            <circle cx="20.66" cy="7" r="1.5"/>
            <circle cx="3.34" cy="17" r="1.5"/>
            <circle cx="20.66" cy="17" r="1.5"/>
            <line x1="12" y1="2" x2="3.34" y2="7" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="12" y1="2" x2="20.66" y2="7" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="3.34" y1="7" x2="3.34" y2="17" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="20.66" y1="7" x2="20.66" y2="17" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="3.34" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="20.66" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="3.34" y1="7" x2="20.66" y2="17" stroke="currentColor" strokeWidth="0.5"/>
            <line x1="20.66" y1="7" x2="3.34" y2="17" stroke="currentColor" strokeWidth="0.5"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>
    ),
    handshake: (
        <svg viewBox="0 0 24 24">
            <path d="M11 6l-4 4 1.5 1.5L12 8l4.5 4.5 1.5-1.5-4-4-3-1zm-6 6l-3 3v4h4l3-3-1.5-1.5L5 17v-2l2.5-2.5L6 11zm14 0l-1.5 1.5L20 15v2l-2.5 2.5L19 21h4v-4l-3-3-1-2z"/>
        </svg>
    ),
    brain: (
        <svg viewBox="0 0 24 24">
            <path d="M12 2c-1.5 0-3 .5-4 1.5C6.5 2.5 5 2 4 3c-1.5 1.5-1 4 0 5.5-.5 1-1 2.5-.5 4 .5 2 2 3 4 3v4c0 1 1 2 2.5 2s2.5-1 2.5-2v-1c0-1 1-2 2-2s2 1 2 2v1c0 1 1 2 2.5 2s2.5-1 2.5-2v-4c2 0 3.5-1 4-3 .5-1.5 0-3-.5-4 1-1.5 1.5-4 0-5.5-1-1-2.5-.5-4 .5-1-1-2.5-1.5-4-1.5z"/>
        </svg>
    ),
    sword: (
        <svg viewBox="0 0 24 24">
            <path d="M14.5 2.5L22 10l-4 4-2-2-7 7-3-3 7-7-2-2 4-4zm-9 15l-1.5 1.5L2 17l2-2 1.5 1.5z"/>
        </svg>
    ),
    shark: (
        <svg viewBox="0 0 24 24">
            <path d="M22 9c-2-4-6-6-10-6L9 2 8 5C5 6 2 9 2 12c0 4 4 7 8 7h1l2 2 1-2c4-1 7-4 8-8v-2zm-8 4a1 1 0 11-2 0 1 1 0 012 0z"/>
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v6l4 2"/>
        </svg>
    ),
    speedometer: (
        <svg viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.24-12.24l-5.66 5.66c-.78.78-.78 2.05 0 2.83.78.78 2.05.78 2.83 0l5.66-5.66c.78-.78.78-2.05 0-2.83-.78-.78-2.05-.78-2.83 0z"/>
        </svg>
    )
};

// ═══════════════════════════════════════════════════════════════
// BADGE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════

const BADGE_CONFIG = {
    // ═══════ COMMON BADGES ═══════
    'badge-first-trade': {
        icon: 'target',
        shape: 'circle',
        gradient: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
        innerGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        symbolColor: '#94a3b8',
        rarity: 'common'
    },
    'badge-first-profit': {
        icon: 'chart',
        shape: 'circle',
        gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        innerGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        symbolColor: '#6ee7b7',
        rarity: 'common'
    },
    'badge-week-warrior': {
        icon: 'star',
        shape: 'circle',
        gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)',
        innerGradient: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
        symbolColor: '#fcd34d',
        rarity: 'common'
    },
    'badge-early-bird': {
        icon: 'sun',
        shape: 'circle',
        gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
        innerGradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
        symbolColor: '#fdba74',
        rarity: 'common'
    },
    'badge-night-owl': {
        icon: 'moon',
        shape: 'circle',
        gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)',
        innerGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        symbolColor: '#a5b4fc',
        rarity: 'common'
    },

    // ═══════ RARE BADGES ═══════
    'badge-trade-master': {
        icon: 'chart',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #60a5fa 100%)',
        innerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        symbolColor: '#93c5fd',
        rarity: 'rare',
        animate: 'float'
    },
    'badge-portfolio-builder': {
        icon: 'gem',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
        innerGradient: 'linear-gradient(135deg, #164e63 0%, #155e75 100%)',
        symbolColor: '#67e8f9',
        rarity: 'rare',
        animate: 'float'
    },
    'badge-streak-lord': {
        icon: 'fire',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        innerGradient: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
        symbolColor: '#fca5a5',
        rarity: 'rare',
        animate: 'fire'
    },
    'badge-risk-taker': {
        icon: 'bolt',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
        innerGradient: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)',
        symbolColor: '#c4b5fd',
        rarity: 'rare',
        animate: 'electric'
    },
    'badge-diversified': {
        icon: 'compass',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
        innerGradient: 'linear-gradient(135deg, #134e4a 0%, #115e59 100%)',
        symbolColor: '#5eead4',
        rarity: 'rare',
        animate: 'rotate'
    },
    'badge-comeback-king': {
        icon: 'crown',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #a21caf 0%, #d946ef 50%, #e879f9 100%)',
        innerGradient: 'linear-gradient(135deg, #701a75 0%, #86198f 100%)',
        symbolColor: '#f0abfc',
        rarity: 'rare',
        animate: 'pulse'
    },

    // ═══════ EPIC BADGES ═══════
    'badge-oracle': {
        icon: 'eye',
        shape: 'diamond',
        gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 30%, #8b5cf6 60%, #a78bfa 100%)',
        innerGradient: 'linear-gradient(135deg, #2e1065 0%, #3b0764 100%)',
        symbolColor: '#c4b5fd',
        rarity: 'epic',
        animate: 'pulse',
        particles: true,
        particleColors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
    },
    'badge-diamond-hands': {
        icon: 'diamond',
        shape: 'diamond',
        gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 30%, #38bdf8 60%, #7dd3fc 100%)',
        innerGradient: 'linear-gradient(135deg, #0c4a6e 0%, #075985 100%)',
        symbolColor: '#bae6fd',
        rarity: 'epic',
        animate: 'float',
        particles: true,
        particleColors: ['#38bdf8', '#7dd3fc', '#bae6fd']
    },
    'badge-profit-king': {
        icon: 'crown',
        shape: 'shield',
        gradient: 'linear-gradient(135deg, #059669 0%, #10b981 30%, #34d399 60%, #6ee7b7 100%)',
        innerGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        symbolColor: '#a7f3d0',
        rarity: 'epic',
        animate: 'pulse',
        particles: true,
        particleColors: ['#10b981', '#34d399', '#6ee7b7']
    },
    'badge-dedicated': {
        icon: 'fire',
        shape: 'shield',
        gradient: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 30%, #ef4444 60%, #f87171 100%)',
        innerGradient: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
        symbolColor: '#fecaca',
        rarity: 'epic',
        animate: 'fire',
        particles: true,
        particleColors: ['#ef4444', '#f87171', '#fbbf24']
    },
    'badge-speed-demon': {
        icon: 'speedometer',
        shape: 'diamond',
        gradient: 'linear-gradient(135deg, #c026d3 0%, #d946ef 30%, #e879f9 60%, #f0abfc 100%)',
        innerGradient: 'linear-gradient(135deg, #4a044e 0%, #701a75 100%)',
        symbolColor: '#f5d0fe',
        rarity: 'epic',
        animate: 'rotate',
        particles: true,
        particleColors: ['#d946ef', '#e879f9', '#f0abfc']
    },
    'badge-market-shark': {
        icon: 'shark',
        shape: 'shield',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 60%, #475569 100%)',
        innerGradient: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        symbolColor: '#94a3b8',
        rarity: 'epic',
        animate: 'float',
        particles: true,
        particleColors: ['#475569', '#64748b', '#94a3b8']
    },

    'badge-half-century': {
    icon: 'target',
    shape: 'diamond',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 25%, #8b5cf6 50%, #a78bfa 75%, #ddd6fe 100%)',
    innerGradient: 'radial-gradient(circle, #5b21b6 0%, #4c1d95 100%)',
    symbolColor: '#e9d5ff',
    rarity: 'epic',
    animate: 'pulse',
    particles: true,
    particleColors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
},

'badge-prediction-master': {
    icon: 'eye',
    shape: 'diamond',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 30%, #8b5cf6 60%, #a78bfa 100%)',
    innerGradient: 'linear-gradient(135deg, #2e1065 0%, #3b0764 100%)',
    symbolColor: '#c4b5fd',
    rarity: 'epic',
    animate: 'pulse',
    particles: true,
    particleColors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
},
'badge-level-50': {
    icon: 'target',
    shape: 'hexagon',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)',
    innerGradient: 'radial-gradient(circle, #5b21b6 0%, #4c1d95 100%)',
    symbolColor: '#ddd6fe',
    rarity: 'epic',
    animate: 'pulse',
    particles: true,
    particleColors: ['#8b5cf6', '#a78bfa', '#c4b5fd']
},


    // ═══════ LEGENDARY BADGES ═══════
    'badge-whale': {
        icon: 'whale',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #60a5fa 50%, #93c5fd 75%, #ffffff 100%)',
        innerGradient: 'radial-gradient(circle, #1e40af 0%, #1e3a8a 100%)',
        symbolColor: '#bfdbfe',
        rarity: 'legendary',
        animate: 'float',
        particles: true,
        particleColors: ['#3b82f6', '#60a5fa', '#93c5fd', '#ffffff'],
        shimmer: true
    },
    'badge-centurion': {
        icon: 'shield',
        shape: 'shield',
        gradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 25%, #ea580c 50%, #fb923c 75%, #fed7aa 100%)',
        innerGradient: 'radial-gradient(circle, #9a3412 0%, #7c2d12 100%)',
        symbolColor: '#fed7aa',
        rarity: 'legendary',
        animate: 'pulse',
        particles: true,
        particleColors: ['#ea580c', '#fb923c', '#fbbf24', '#ffffff'],
        shimmer: true
    },
    'badge-millionaire': {
        icon: 'gem',
        shape: 'diamond',
        gradient: 'linear-gradient(135deg, #065f46 0%, #059669 25%, #10b981 50%, #34d399 75%, #d1fae5 100%)',
        innerGradient: 'radial-gradient(circle, #047857 0%, #065f46 100%)',
        symbolColor: '#a7f3d0',
        rarity: 'legendary',
        animate: 'float',
        particles: true,
        particleColors: ['#10b981', '#34d399', '#6ee7b7', '#ffffff'],
        shimmer: true
    },
    'badge-unstoppable': {
        icon: 'infinity',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 25%, #7c3aed 50%, #a78bfa 75%, #ede9fe 100%)',
        innerGradient: 'radial-gradient(circle, #5b21b6 0%, #4c1d95 100%)',
        symbolColor: '#ddd6fe',
        rarity: 'legendary',
        animate: 'rotate',
        particles: true,
        particleColors: ['#7c3aed', '#a78bfa', '#c4b5fd', '#ffffff'],
        shimmer: true
    },
    'badge-perfect-week': {
        icon: 'star',
        shape: 'star',
        gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 25%, #d97706 50%, #fbbf24 75%, #fef3c7 100%)',
        innerGradient: 'radial-gradient(circle, #a16207 0%, #92400e 100%)',
        symbolColor: '#fef3c7',
        rarity: 'legendary',
        animate: 'pulse',
        particles: true,
        particleColors: ['#f59e0b', '#fbbf24', '#fcd34d', '#ffffff'],
        shimmer: true
    },
    'badge-trading-god': {
        icon: 'lightning',
        shape: 'shield',
        gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 20%, #0ea5e9 40%, #38bdf8 60%, #7dd3fc 80%, #ffffff 100%)',
        innerGradient: 'radial-gradient(circle, #0369a1 0%, #0c4a6e 100%)',
        symbolColor: '#e0f2fe',
        rarity: 'legendary',
        animate: 'electric',
        particles: true,
        particleColors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'],
        shimmer: true
    },

'badge-founder': {
    icon: 'crown',
    shape: 'hexagon',
    gradient: 'linear-gradient(135deg, #92400e 0%, #fbbf24 25%, #fcd34d 50%, #fbbf24 75%, #92400e 100%)',
    innerGradient: 'radial-gradient(circle, #78350f 0%, #451a03 100%)',
    symbolColor: '#fef3c7',
    rarity: 'legendary',
    animate: 'float',
    particles: true,
    particleColors: ['#fbbf24', '#fcd34d', '#fef3c7', '#ffffff'],
    shimmer: true
},
'badge-level-100': {
    icon: 'shield',
    shape: 'shield',
    gradient: 'linear-gradient(135deg, #92400e 0%, #fbbf24 25%, #fcd34d 50%, #fbbf24 75%, #92400e 100%)',
    innerGradient: 'radial-gradient(circle, #78350f 0%, #451a03 100%)',
    symbolColor: '#fef3c7',
    rarity: 'legendary',
    animate: 'float',
    particles: true,
    particleColors: ['#fbbf24', '#fcd34d', '#fef3c7', '#ffffff'],
    shimmer: true
},
    // ═══════ MYTHIC BADGES ═══════
    'badge-reality-breaker': {
        icon: 'atom',
        shape: 'hexagon',
        gradient: 'linear-gradient(135deg, #000000 0%, #7c3aed 20%, #ec4899 40%, #06b6d4 60%, #fbbf24 80%, #ffffff 100%)',
        innerGradient: 'radial-gradient(circle, #1e1b4b 0%, #000000 100%)',
        symbolColor: '#ffffff',
        rarity: 'mythic',
        animate: 'rotate',
        particles: true,
        particleColors: ['#7c3aed', '#ec4899', '#06b6d4', '#fbbf24', '#ffffff'],
        shimmer: true
    },
    'badge-eternal-legend': {
        icon: 'skull',
        shape: 'shield',
        gradient: 'linear-gradient(135deg, #000000 0%, #450a0a 20%, #7f1d1d 40%, #fbbf24 60%, #fef3c7 80%, #ffffff 100%)',
        innerGradient: 'radial-gradient(circle, #1c1917 0%, #000000 100%)',
        symbolColor: '#fef3c7',
        rarity: 'mythic',
        animate: 'fire',
        particles: true,
        particleColors: ['#ef4444', '#f97316', '#fbbf24', '#fef3c7', '#ffffff'],
        shimmer: true
    },

    // ═══════ ORIGIN BADGE ═══════
    'badge-the-architect': {
        icon: 'metatron',
        shape: 'circle',
        gradient: 'conic-gradient(from 0deg, #0a1628 0%, #d4af37 15%, #f8fafc 25%, #d4af37 35%, #0a1628 50%, #d4af37 65%, #f8fafc 75%, #d4af37 85%, #0a1628 100%)',
        innerGradient: 'radial-gradient(circle, #0a1628 0%, #050b14 100%)',
        symbolColor: '#d4af37',
        rarity: 'origin',
        animate: 'rotate',
        particles: true,
        particleColors: ['#d4af37', '#f8fafc', '#d4af37'],
        shimmer: true,
        sacred: true
    }
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

const BadgeIcon = ({ badgeId, size = 48, showParticles = true }) => {
    const config = BADGE_CONFIG[badgeId];
    
    if (!config) {
        // Fallback for unknown badges
        return (
            <BadgeContainer $size={size}>
                <BadgeOuter 
                    $shape="circle" 
                    $gradient="linear-gradient(135deg, #475569, #64748b)"
                    $rarity="common"
                />
                <BadgeInner 
                    $shape="circle"
                    $innerGradient="linear-gradient(135deg, #1e293b, #334155)"
                >
                    <BadgeSymbol $color="#94a3b8">?</BadgeSymbol>
                </BadgeInner>
            </BadgeContainer>
        );
    }

    const {
        icon,
        shape,
        gradient,
        innerGradient,
        symbolColor,
        rarity,
        animate,
        particles,
        particleColors = [],
        shimmer,
        sacred
    } = config;

    // Generate particles
    const particleElements = [];
    if (showParticles && particles && particleColors.length > 0) {
        const particleCount = rarity === 'mythic' || rarity === 'origin' ? 8 : 
                              rarity === 'legendary' ? 6 : 4;
        
        for (let i = 0; i < particleCount; i++) {
            particleElements.push(
                <Particle
                    key={i}
                    $size={Math.random() * 3 + 1}
                    $color={particleColors[Math.floor(Math.random() * particleColors.length)]}
                    $duration={Math.random() * 2 + 2}
                    $delay={Math.random() * 2}
                    $top={Math.random() * 100}
                    $left={Math.random() * 100}
                />
            );
        }
    }

    return (
        <BadgeContainer $size={size}>
            {sacred && <SacredGeometry />}
            
            {showParticles && particles && (
                <ParticleContainer>
                    {particleElements}
                </ParticleContainer>
            )}
            
            <BadgeOuter 
                $shape={shape}
                $gradient={gradient}
                $rarity={rarity}
            />
            
            <BadgeInner 
                $shape={shape}
                $innerGradient={innerGradient}
            >
                <BadgeSymbol 
                    $color={symbolColor}
                    $shape={shape}
                    $animate={animate}
                >
                    {Icons[icon]}
                </BadgeSymbol>
            </BadgeInner>
            
            {shimmer && (
                <ShimmerOverlay $shape={shape} />
            )}
        </BadgeContainer>
    );
};

// Export badge config for use elsewhere
export { BADGE_CONFIG };
export default BadgeIcon;