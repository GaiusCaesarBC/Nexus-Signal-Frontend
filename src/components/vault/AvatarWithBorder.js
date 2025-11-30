// client/src/components/vault/AvatarWithBorder.js
// 🔥 THE MOST LEGENDARY ANIMATED AVATAR BORDER SYSTEM EVER 🔥
// Supports: Flames, Lightning, Frost, Void, Rainbow, Dragon, and more!

import React, { useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { User } from 'lucide-react';

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🎬 KEYFRAME ANIMATIONS                     ║
// ╚══════════════════════════════════════════════════════════════╝

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
        box-shadow: 0 0 25px var(--glow-color), 0 0 50px var(--glow-color);
        transform: scale(1.03);
    }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const flameFlicker = keyframes`
    0%, 100% { 
        opacity: 1; 
        transform: scaleY(1) scaleX(1);
        filter: brightness(1);
    }
    25% { 
        opacity: 0.8; 
        transform: scaleY(1.1) scaleX(0.95);
        filter: brightness(1.2);
    }
    50% { 
        opacity: 0.9; 
        transform: scaleY(0.95) scaleX(1.05);
        filter: brightness(0.9);
    }
    75% { 
        opacity: 1; 
        transform: scaleY(1.05) scaleX(0.98);
        filter: brightness(1.1);
    }
`;

const electricPulse = keyframes`
    0%, 100% { 
        opacity: 0.6;
        filter: brightness(1) blur(0px);
    }
    10% { 
        opacity: 1;
        filter: brightness(2) blur(1px);
    }
    20% { 
        opacity: 0.4;
        filter: brightness(0.8) blur(0px);
    }
    30% { 
        opacity: 1;
        filter: brightness(1.8) blur(2px);
    }
    40% { 
        opacity: 0.7;
        filter: brightness(1) blur(0px);
    }
`;

const frostShimmer = keyframes`
    0%, 100% { 
        filter: brightness(1) saturate(1);
        opacity: 0.9;
    }
    50% { 
        filter: brightness(1.3) saturate(1.2);
        opacity: 1;
    }
`;

const voidPulse = keyframes`
    0%, 100% { 
        transform: scale(1);
        filter: brightness(0.8) contrast(1.2);
    }
    50% { 
        transform: scale(1.02);
        filter: brightness(1.1) contrast(1);
    }
`;

const rainbowRotate = keyframes`
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
`;

const dragonBreath = keyframes`
    0%, 100% { 
        box-shadow: 0 0 15px #dc2626, 0 0 30px #f97316, 0 0 45px #fbbf24;
        filter: brightness(1);
    }
    33% { 
        box-shadow: 0 0 25px #f97316, 0 0 50px #fbbf24, 0 0 70px #dc2626;
        filter: brightness(1.2);
    }
    66% { 
        box-shadow: 0 0 20px #fbbf24, 0 0 40px #dc2626, 0 0 60px #f97316;
        filter: brightness(1.1);
    }
`;

const cosmicPulse = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px #6366f1, 0 0 40px #a855f7, 0 0 60px #ec4899;
        filter: brightness(1);
    }
    33% { 
        box-shadow: 0 0 30px #a855f7, 0 0 60px #ec4899, 0 0 90px #6366f1;
        filter: brightness(1.15);
    }
    66% { 
        box-shadow: 0 0 25px #ec4899, 0 0 50px #6366f1, 0 0 75px #a855f7;
        filter: brightness(1.1);
    }
`;

const bloodMoonPulse = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px #7f1d1d, 0 0 40px #dc2626;
        filter: brightness(0.9) saturate(1.2);
    }
    50% { 
        box-shadow: 0 0 35px #dc2626, 0 0 70px #7f1d1d;
        filter: brightness(1.1) saturate(1.4);
    }
`;

const quantumGlitch = keyframes`
    0%, 100% { 
        transform: translate(0, 0) scale(1);
        filter: hue-rotate(0deg);
    }
    10% { 
        transform: translate(-2px, 1px) scale(1.01);
        filter: hue-rotate(90deg);
    }
    20% { 
        transform: translate(2px, -1px) scale(0.99);
        filter: hue-rotate(180deg);
    }
    30% { 
        transform: translate(0, 0) scale(1);
        filter: hue-rotate(270deg);
    }
`;

const divineGlow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px #fbbf24, 0 0 40px #f472b6, 0 0 60px #fef3c7;
        filter: brightness(1.1);
    }
    50% { 
        box-shadow: 0 0 40px #fef3c7, 0 0 80px #fbbf24, 0 0 100px #f472b6;
        filter: brightness(1.3);
    }
`;

const abyssalPulse = keyframes`
    0%, 100% { 
        box-shadow: 0 0 15px #0f172a, 0 0 30px #3b82f6, 0 0 45px #1e3a5f;
        filter: brightness(0.8);
    }
    50% { 
        box-shadow: 0 0 25px #3b82f6, 0 0 50px #60a5fa, 0 0 75px #1e40af;
        filter: brightness(1);
    }
`;

const supernovaBurst = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px #f97316, 0 0 40px #6366f1, 0 0 60px #fbbf24;
        transform: scale(1);
    }
    25% { 
        box-shadow: 0 0 35px #fbbf24, 0 0 70px #f97316, 0 0 100px #a855f7;
        transform: scale(1.02);
    }
    50% { 
        box-shadow: 0 0 30px #6366f1, 0 0 60px #fbbf24, 0 0 90px #f97316;
        transform: scale(1.01);
    }
    75% { 
        box-shadow: 0 0 40px #a855f7, 0 0 80px #6366f1, 0 0 110px #fbbf24;
        transform: scale(1.03);
    }
`;

const mythicAura = keyframes`
    0% { 
        box-shadow: 0 0 30px #ec4899, 0 0 60px #a855f7, 0 0 90px #06b6d4;
        filter: hue-rotate(0deg) brightness(1.1);
    }
    33% { 
        box-shadow: 0 0 40px #a855f7, 0 0 80px #06b6d4, 0 0 120px #fbbf24;
        filter: hue-rotate(60deg) brightness(1.2);
    }
    66% { 
        box-shadow: 0 0 35px #06b6d4, 0 0 70px #fbbf24, 0 0 100px #ec4899;
        filter: hue-rotate(120deg) brightness(1.15);
    }
    100% { 
        box-shadow: 0 0 30px #ec4899, 0 0 60px #a855f7, 0 0 90px #06b6d4;
        filter: hue-rotate(180deg) brightness(1.1);
    }
`;

const particleFloat = keyframes`
    0%, 100% { 
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { 
        transform: translateY(-50px) rotate(360deg);
        opacity: 0;
    }
`;

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🎨 BORDER DEFINITIONS                      ║
// ╚══════════════════════════════════════════════════════════════╝

const BORDER_STYLES = {
    // ===== COMMON =====
    'border-bronze': {
        gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B5A2B 50%, #CD7F32 100%)',
        glow: 'rgba(205, 127, 50, 0.5)',
        animation: null,
        rarity: 'common'
    },
    'border-silver': {
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #808080 50%, #C0C0C0 100%)',
        glow: 'rgba(192, 192, 192, 0.5)',
        animation: null,
        rarity: 'common'
    },
    // ===== RARE =====
    'border-gold': {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
        glow: 'rgba(255, 215, 0, 0.6)',
        animation: 'shimmer',
        rarity: 'rare'
    },
    'border-emerald': {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #10b981 100%)',
        glow: 'rgba(16, 185, 129, 0.6)',
        animation: 'shimmer',
        rarity: 'rare'
    },
    // ===== EPIC =====
    'border-ruby': {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ef4444 100%)',
        glow: 'rgba(239, 68, 68, 0.7)',
        animation: 'pulse',
        rarity: 'epic'
    },
    'border-platinum': {
        gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B9B8B5 50%, #E5E4E2 100%)',
        glow: 'rgba(229, 228, 226, 0.7)',
        animation: 'shimmer',
        rarity: 'epic'
    },
    'border-sapphire': {
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #3b82f6 100%)',
        glow: 'rgba(59, 130, 246, 0.7)',
        animation: 'pulse',
        rarity: 'epic'
    },
    'border-amethyst': {
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 50%, #8b5cf6 100%)',
        glow: 'rgba(139, 92, 246, 0.7)',
        animation: 'pulse',
        rarity: 'epic'
    },
    'border-crimson-blade': {
        gradient: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #7f1d1d 100%)',
        glow: 'rgba(220, 38, 38, 0.7)',
        animation: 'pulse',
        rarity: 'epic'
    },
    'border-tsunami': {
        gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 50%, #7dd3fc 100%)',
        glow: 'rgba(14, 165, 233, 0.7)',
        animation: 'wave',
        rarity: 'epic'
    },
    'border-ancient-oak': {
        gradient: 'linear-gradient(135deg, #14532d 0%, #22c55e 50%, #86efac 100%)',
        glow: 'rgba(34, 197, 94, 0.7)',
        animation: 'pulse',
        rarity: 'epic'
    },
    'border-phantom': {
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 50%, #c7d2fe 100%)',
        glow: 'rgba(99, 102, 241, 0.7)',
        animation: 'ghost',
        rarity: 'epic'
    },
    'border-toxic-haze': {
        gradient: 'linear-gradient(135deg, #1a2e05 0%, #84cc16 50%, #d9f99d 100%)',
        glow: 'rgba(132, 204, 22, 0.8)',
        animation: 'pulse-glow',
        rarity: 'epic'
    },
    'border-mystic-runes': {
        gradient: 'linear-gradient(135deg, #581c87 0%, #a855f7 50%, #e9d5ff 100%)',
        glow: 'rgba(168, 85, 247, 0.8)',
        animation: 'rotate',
        rarity: 'epic'
    },
    // ===== LEGENDARY =====
    'border-diamond': {
        gradient: 'linear-gradient(135deg, #B9F2FF 0%, #00D4FF 50%, #B9F2FF 100%)',
        glow: 'rgba(0, 212, 255, 0.8)',
        animation: 'shimmer',
        rarity: 'legendary'
    },
    'border-rainbow': {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 20%, #10b981 40%, #3b82f6 60%, #8b5cf6 80%, #ec4899 100%)',
        glow: 'rgba(139, 92, 246, 0.9)',
        animation: 'rainbow',
        rarity: 'legendary'
    },
    'border-nexus': {
        gradient: 'linear-gradient(135deg, #00adef 0%, #8b5cf6 50%, #00adef 100%)',
        glow: 'rgba(0, 173, 237, 1)',
        animation: 'pulse-glow',
        rarity: 'legendary'
    },
    'border-inferno-crown': {
        gradient: 'linear-gradient(135deg, #7c2d12 0%, #f97316 30%, #fbbf24 60%, #fef3c7 100%)',
        glow: 'rgba(249, 115, 22, 0.9)',
        animation: 'flames',
        rarity: 'legendary'
    },
    'border-lightning-fury': {
        gradient: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 40%, #93c5fd 70%, #ffffff 100%)',
        glow: 'rgba(59, 130, 246, 0.9)',
        animation: 'electric',
        rarity: 'legendary'
    },
    'border-void-portal': {
        gradient: 'linear-gradient(135deg, #000000 0%, #1e1b4b 40%, #7c3aed 80%, #c4b5fd 100%)',
        glow: 'rgba(124, 58, 237, 0.9)',
        animation: 'vortex',
        rarity: 'legendary'
    },
    'border-deaths-embrace': {
        gradient: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #4b5563 100%)',
        glow: 'rgba(75, 85, 99, 0.9)',
        animation: 'void',
        rarity: 'legendary'
    },
    'border-dragon-wrath': {
        gradient: 'linear-gradient(135deg, #450a0a 0%, #dc2626 30%, #f97316 60%, #fbbf24 100%)',
        glow: 'rgba(220, 38, 38, 1)',
        animation: 'dragon-fire',
        rarity: 'legendary'
    },
    'border-frozen-eternity': {
        gradient: 'linear-gradient(135deg, #0c4a6e 0%, #06b6d4 40%, #a5f3fc 70%, #ffffff 100%)',
        glow: 'rgba(6, 182, 212, 0.9)',
        animation: 'frost',
        rarity: 'legendary'
    },
    'border-cosmic-destroyer': {
        gradient: 'linear-gradient(135deg, #020617 0%, #1e1b4b 30%, #6366f1 60%, #a855f7 80%, #ec4899 100%)',
        glow: 'rgba(99, 102, 241, 1)',
        animation: 'cosmic',
        rarity: 'legendary'
    },
    'border-blood-moon': {
        gradient: 'linear-gradient(135deg, #1c1917 0%, #7f1d1d 40%, #dc2626 70%, #fca5a5 100%)',
        glow: 'rgba(220, 38, 38, 0.95)',
        animation: 'blood-pulse',
        rarity: 'legendary'
    },
    'border-quantum-rift': {
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 30%, #d946ef 70%, #f43f5e 100%)',
        glow: 'rgba(217, 70, 239, 0.9)',
        animation: 'glitch',
        rarity: 'legendary'
    },
    'border-divine-ascension': {
        gradient: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f472b6 70%, #ffffff 100%)',
        glow: 'rgba(251, 191, 36, 1)',
        animation: 'divine',
        rarity: 'legendary'
    },
    'border-abyssal-terror': {
        gradient: 'linear-gradient(135deg, #000000 0%, #0c4a6e 40%, #0891b2 70%, #22d3ee 100%)',
        glow: 'rgba(8, 145, 178, 0.9)',
        animation: 'abyssal',
        rarity: 'legendary'
    },
    'border-supernova-core': {
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #f97316 30%, #fbbf24 50%, #ffffff 70%, #6366f1 100%)',
        glow: 'rgba(249, 115, 22, 1)',
        animation: 'supernova',
        rarity: 'legendary'
    },
    'border-all-seeing-eye': {
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #fbbf24 40%, #f59e0b 60%, #1a1a2e 100%)',
        glow: 'rgba(251, 191, 36, 0.95)',
        animation: 'divine',
        rarity: 'legendary'
    },
    'border-prismatic-fury': {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 15%, #fbbf24 30%, #22c55e 45%, #06b6d4 60%, #3b82f6 75%, #8b5cf6 90%, #ec4899 100%)',
        glow: 'rgba(139, 92, 246, 1)',
        animation: 'rainbow',
        rarity: 'legendary'
    },
    'border-apex-predator': {
        gradient: 'linear-gradient(135deg, #000000 0%, #450a0a 25%, #dc2626 50%, #fbbf24 75%, #ffffff 100%)',
        glow: 'rgba(220, 38, 38, 1)',
        animation: 'dragon-fire',
        rarity: 'legendary'
    },
    // ===== MYTHIC =====
    'border-reality-shatter': {
        gradient: 'linear-gradient(135deg, #000000 0%, #7c3aed 20%, #ec4899 40%, #06b6d4 60%, #fbbf24 80%, #ffffff 100%)',
        glow: 'rgba(236, 72, 153, 1)',
        animation: 'mythic',
        rarity: 'mythic'
    },
    'border-eternal-sovereign': {
        gradient: 'linear-gradient(135deg, #000000 0%, #7c2d12 15%, #fbbf24 30%, #ffffff 50%, #fbbf24 70%, #7c2d12 85%, #000000 100%)',
        glow: 'rgba(251, 191, 36, 1)',
        animation: 'mythic',
        rarity: 'mythic'
    }
};

// ╔══════════════════════════════════════════════════════════════╗
// ║                    💫 STYLED COMPONENTS                       ║
// ╚══════════════════════════════════════════════════════════════╝

const AvatarContainer = styled.div`
    position: relative;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    flex-shrink: 0;
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
`;

const BorderRing = styled.div`
    position: absolute;
    inset: -${props => props.$borderWidth}px;
    border-radius: 50%;
    background: ${props => props.$gradient};
    background-size: 200% 200%;
    padding: ${props => props.$borderWidth}px;
    --glow-color: ${props => props.$glow};
    pointer-events: none;

    /* Base glow */
    box-shadow: 0 0 ${props => props.$size / 8}px ${props => props.$glow},
                0 0 ${props => props.$size / 4}px ${props => props.$glow}40;

    /* Animation styles */
    ${props => props.$animation === 'shimmer' && css`
        animation: ${shimmer} 3s ease-in-out infinite;
    `}

    ${props => props.$animation === 'pulse' && css`
        animation: ${pulseGlow} 2s ease-in-out infinite;
    `}

    ${props => props.$animation === 'pulse-glow' && css`
        animation: ${pulseGlow} 2s ease-in-out infinite;
    `}

    ${props => props.$animation === 'rotate' && css`
        animation: ${rotate} 8s linear infinite;
    `}

    ${props => props.$animation === 'flames' && css`
        animation: ${flameFlicker} 0.5s ease-in-out infinite, ${dragonBreath} 2s ease-in-out infinite;
    `}

    ${props => props.$animation === 'dragon-fire' && css`
        animation: ${flameFlicker} 0.3s ease-in-out infinite, ${dragonBreath} 1.5s ease-in-out infinite;
    `}

    ${props => props.$animation === 'electric' && css`
        animation: ${electricPulse} 0.8s ease-in-out infinite;
    `}

    ${props => props.$animation === 'frost' && css`
        animation: ${frostShimmer} 3s ease-in-out infinite;
    `}

    ${props => props.$animation === 'vortex' && css`
        animation: ${rotate} 15s linear infinite, ${voidPulse} 3s ease-in-out infinite;
    `}

    ${props => props.$animation === 'void' && css`
        animation: ${voidPulse} 4s ease-in-out infinite;
    `}

    ${props => props.$animation === 'rainbow' && css`
        animation: ${shimmer} 2s linear infinite, ${rainbowRotate} 5s linear infinite;
    `}

    ${props => props.$animation === 'cosmic' && css`
        animation: ${cosmicPulse} 3s ease-in-out infinite, ${shimmer} 4s linear infinite;
    `}

    ${props => props.$animation === 'blood-pulse' && css`
        animation: ${bloodMoonPulse} 2s ease-in-out infinite;
    `}

    ${props => props.$animation === 'glitch' && css`
        animation: ${quantumGlitch} 3s ease-in-out infinite, ${shimmer} 2s linear infinite;
    `}

    ${props => props.$animation === 'divine' && css`
        animation: ${divineGlow} 3s ease-in-out infinite, ${shimmer} 4s linear infinite;
    `}

    ${props => props.$animation === 'abyssal' && css`
        animation: ${abyssalPulse} 4s ease-in-out infinite;
    `}

    ${props => props.$animation === 'supernova' && css`
        animation: ${supernovaBurst} 2s ease-in-out infinite;
    `}

    ${props => props.$animation === 'mythic' && css`
        animation: ${mythicAura} 4s linear infinite, ${shimmer} 2s linear infinite;
    `}

    ${props => props.$animation === 'wave' && css`
        animation: ${pulseGlow} 3s ease-in-out infinite, ${shimmer} 4s linear infinite;
    `}

    ${props => props.$animation === 'ghost' && css`
        animation: ${voidPulse} 3s ease-in-out infinite, ${shimmer} 5s linear infinite;
        opacity: 0.9;
    `}

    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 0 ${props => props.$size / 4}px ${props => props.$glow},
                    0 0 ${props => props.$size / 2}px ${props => props.$glow}60;
        transform: scale(1.02);
    }
`;

const ParticleContainer = styled.div`
    position: absolute;
    inset: -${props => props.$borderWidth * 2}px;
    border-radius: 50%;
    pointer-events: none;
    overflow: hidden;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    background: ${props => props.$color};
    border-radius: 50%;
    animation: ${particleFloat} ${props => props.$duration}s ease-in-out infinite;
    animation-delay: ${props => props.$delay}s;
    left: ${props => props.$left}%;
    bottom: 0;
    box-shadow: 0 0 ${props => props.$size * 2}px ${props => props.$color};
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
    pointer-events: none;
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
    bottom: ${props => props.$size * 0.02}px;
    right: ${props => props.$size * 0.02}px;
    width: ${props => Math.max(props.$size * 0.18, 8)}px;
    height: ${props => Math.max(props.$size * 0.18, 8)}px;
    background: ${props => props.$online ? '#10b981' : '#64748b'};
    border-radius: 50%;
    border: 2px solid #0a0e27;
    z-index: 2;
`;

const LevelBadge = styled.div`
    position: absolute;
    bottom: -${props => props.$size * 0.12}px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    font-size: ${props => Math.max(props.$size * 0.16, 8)}px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 8px;
    border: 2px solid #0a0e27;
    z-index: 2;
    white-space: nowrap;
`;

const RarityGlow = styled.div`
    position: absolute;
    inset: -${props => props.$size * 0.15}px;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0.3;
    
    ${props => props.$rarity === 'legendary' && css`
        background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
    `}
    
    ${props => props.$rarity === 'mythic' && css`
        background: radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 70%);
        animation: ${rainbowRotate} 8s linear infinite;
    `}
    
    ${props => props.$rarity === 'epic' && css`
        background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
    `}
`;

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🎮 MAIN COMPONENT                          ║
// ╚══════════════════════════════════════════════════════════════╝

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
    showParticles = true,
    onClick,
    className
}) => {
    // Get border style or default to bronze
    const borderStyle = BORDER_STYLES[borderId] || BORDER_STYLES['border-bronze'];

    // Calculate border width based on size (thicker for larger avatars)
    const borderWidth = Math.max(size * 0.07, 3);

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

    // Generate particles for fire/ember effects
    const particles = useMemo(() => {
        const hasParticles = ['flames', 'dragon-fire', 'supernova', 'cosmic', 'mythic'].includes(borderStyle.animation);
        if (!hasParticles || !showParticles || size < 40) return [];
        
        const colors = {
            'flames': ['#f97316', '#fbbf24', '#ef4444', '#fef3c7'],
            'dragon-fire': ['#dc2626', '#f97316', '#fbbf24', '#ffffff'],
            'supernova': ['#f97316', '#6366f1', '#fbbf24', '#a855f7'],
            'cosmic': ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'],
            'mythic': ['#ec4899', '#a855f7', '#06b6d4', '#fbbf24']
        };
        
        const particleColors = colors[borderStyle.animation] || colors['flames'];
        const count = Math.min(Math.floor(size / 10), 8);
        
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 2,
            color: particleColors[Math.floor(Math.random() * particleColors.length)]
        }));
    }, [borderStyle.animation, showParticles, size]);

    return (
        <AvatarContainer
            $size={size}
            $clickable={!!onClick}
            onClick={onClick}
            className={className}
        >
            {/* Rarity glow effect */}
            {(borderStyle.rarity === 'legendary' || borderStyle.rarity === 'mythic' || borderStyle.rarity === 'epic') && (
                <RarityGlow $size={size} $rarity={borderStyle.rarity} />
            )}

            {/* Particles for fire effects */}
            {particles.length > 0 && (
                <ParticleContainer $borderWidth={borderWidth}>
                    {particles.map(p => (
                        <Particle
                            key={p.id}
                            $size={p.size}
                            $left={p.left}
                            $duration={p.duration}
                            $delay={p.delay}
                            $color={p.color}
                        />
                    ))}
                </ParticleContainer>
            )}

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