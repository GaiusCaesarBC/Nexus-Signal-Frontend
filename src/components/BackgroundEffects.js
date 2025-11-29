// client/src/components/BackgroundEffects.js
// Animated background effects for Epic and Legendary themes
// SIMPLIFIED VERSION - Uses attrs() to avoid styled-components warnings

import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';

// ============================================
// KEYFRAME ANIMATIONS
// ============================================

const float = keyframes`
    0%, 100% { transform: translateY(0); opacity: 0.6; }
    50% { transform: translateY(-20px); opacity: 1; }
`;

const twinkle = keyframes`
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
`;

const auroraMove = keyframes`
    0% { transform: translateX(-50%) rotate(0deg); }
    100% { transform: translateX(50%) rotate(5deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
`;

const rise = keyframes`
    0% { transform: translateY(100vh); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.8; }
    100% { transform: translateY(-10vh); opacity: 0; }
`;

const fall = keyframes`
    0% { transform: translateY(-10px); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.8; }
    100% { transform: translateY(100vh); opacity: 0; }
`;

// ============================================
// STYLED COMPONENTS - Using attrs for dynamic styles
// ============================================

const EffectsContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
`;

const Particle = styled.div.attrs(props => ({
    style: {
        left: `${props.$left}%`,
        top: `${props.$top}%`,
        width: `${props.$size}px`,
        height: `${props.$size}px`,
        background: props.$color,
        boxShadow: `0 0 ${props.$size * 2}px ${props.$color}`,
        animationDuration: `${props.$duration}s`,
        animationDelay: `${props.$delay}s`,
        opacity: props.$opacity
    }
}))`
    position: absolute;
    border-radius: 50%;
    animation: ${float} ease-in-out infinite;
`;

const Star = styled.div.attrs(props => ({
    style: {
        left: `${props.$left}%`,
        top: `${props.$top}%`,
        width: `${props.$size}px`,
        height: `${props.$size}px`,
        background: props.$color,
        boxShadow: `0 0 ${props.$size * 3}px ${props.$color}`,
        animationDuration: `${props.$duration}s`,
        animationDelay: `${props.$delay}s`
    }
}))`
    position: absolute;
    border-radius: 50%;
    animation: ${twinkle} ease-in-out infinite;
`;

const AuroraWave = styled.div.attrs(props => ({
    style: {
        top: `${props.$top}%`,
        height: `${props.$height}px`,
        background: `linear-gradient(90deg, transparent, ${props.$color1}40, ${props.$color2}60, ${props.$color1}40, transparent)`,
        filter: `blur(${props.$blur}px)`,
        opacity: props.$opacity,
        animationDuration: `${props.$duration}s`,
        animationDelay: `${props.$delay}s`
    }
}))`
    position: absolute;
    width: 200%;
    left: -50%;
    animation: ${auroraMove} linear infinite alternate;
`;

const NebulaCloud = styled.div.attrs(props => ({
    style: {
        left: `${props.$left}%`,
        top: `${props.$top}%`,
        width: `${props.$size}px`,
        height: `${props.$size}px`,
        background: `radial-gradient(ellipse at center, ${props.$color1}40, ${props.$color2}20, transparent 70%)`,
        filter: `blur(${props.$blur}px)`,
        opacity: props.$opacity,
        animationDuration: `${props.$duration}s`,
        animationDelay: `${props.$delay}s`
    }
}))`
    position: absolute;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: ${pulse} ease-in-out infinite;
`;

const Ember = styled.div.attrs(props => ({
    style: {
        left: `${props.$left}%`,
        width: `${props.$size}px`,
        height: `${props.$size}px`,
        background: props.$color,
        boxShadow: `0 0 ${props.$size * 2}px ${props.$color}`,
        animationDuration: `${props.$duration}s`,
        animationDelay: `${props.$delay}s`
    }
}))`
    position: absolute;
    bottom: -10px;
    border-radius: 50%;
    animation: ${rise} ease-out infinite;
`;

const Snowflake = styled.div.attrs(props => ({
    style: {
        left: `${props.$left}%`,
        width: `${props.$size}px`,
        height: `${props.$size}px`,
        background: props.$color,
        boxShadow: `0 0 ${props.$size * 2}px ${props.$color}`,
        animationDuration: `${props.$duration}s`,
        animationDelay: `${props.$delay}s`
    }
}))`
    position: absolute;
    top: -10px;
    border-radius: 50%;
    animation: ${fall} linear infinite;
`;

// ============================================
// EFFECT GENERATORS
// ============================================

const generateParticles = (colors, count = 20, opacity = 0.5) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
        particles.push({
            id: `p${i}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 5 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: 5 + Math.random() * 5,
            delay: Math.random() * 5,
            opacity: opacity * (0.5 + Math.random() * 0.5)
        });
    }
    return particles;
};

const generateStars = (colors, count = 50) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            id: `s${i}`,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 5
        });
    }
    return stars;
};

const generateAurora = (colors, waves = 3) => {
    const auroras = [];
    for (let i = 0; i < waves; i++) {
        auroras.push({
            id: `a${i}`,
            color1: colors[i % colors.length],
            color2: colors[(i + 1) % colors.length],
            height: 150 + Math.random() * 100,
            top: 10 + (i * 20),
            duration: 15 + Math.random() * 10,
            delay: i * 3,
            blur: 50 + Math.random() * 30,
            opacity: 0.3 + Math.random() * 0.2
        });
    }
    return auroras;
};

const generateNebula = (colors, clouds = 4) => {
    const nebulas = [];
    for (let i = 0; i < clouds; i++) {
        nebulas.push({
            id: `n${i}`,
            color1: colors[i % colors.length],
            color2: colors[(i + 1) % colors.length],
            size: 300 + Math.random() * 300,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 10 + Math.random() * 10,
            delay: i * 2,
            blur: 60 + Math.random() * 40,
            opacity: 0.2 + Math.random() * 0.2
        });
    }
    return nebulas;
};

const generateEmbers = (colors, count = 40) => {
    const embers = [];
    for (let i = 0; i < count; i++) {
        embers.push({
            id: `e${i}`,
            left: Math.random() * 100,
            size: 2 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: 6 + Math.random() * 6,
            delay: Math.random() * 10
        });
    }
    return embers;
};

const generateSnowflakes = (colors, count = 50) => {
    const flakes = [];
    for (let i = 0; i < count; i++) {
        flakes.push({
            id: `sf${i}`,
            left: Math.random() * 100,
            size: 3 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            duration: 10 + Math.random() * 10,
            delay: Math.random() * 15
        });
    }
    return flakes;
};

// ============================================
// MAIN COMPONENT
// ============================================

const BackgroundEffects = () => {
    const themeContext = useTheme();
    
    // Safely extract what we need
    const isDark = themeContext?.isDark ?? true;
    const effects = themeContext?.theme?.effects;
    
    // Generate elements based on effect type - always call useMemo
    const elements = useMemo(() => {
        if (!isDark || !effects || !effects.type || !effects.colors) {
            return null;
        }
        
        const colors = effects.colors;
        
        try {
            switch (effects.type) {
                case 'particles':
                    return { 
                        particles: generateParticles(colors, effects.count || 20, effects.opacity || 0.5) 
                    };
                    
                case 'stars':
                    return { 
                        stars: generateStars(colors, effects.count || 50) 
                    };
                    
                case 'aurora':
                    return { 
                        auroras: generateAurora(colors, effects.waves || 3),
                        stars: generateStars(['#ffffff', ...colors], 30)
                    };
                    
                case 'nebula':
                case 'celestial':
                    return {
                        nebulas: generateNebula(colors, effects.clouds || 4),
                        stars: generateStars(['#ffffff', ...colors], effects.stars || 60)
                    };
                    
                case 'void':
                    return {
                        nebulas: generateNebula(colors, 3),
                        particles: generateParticles(colors, effects.particles || 40, 0.4)
                    };
                    
                case 'flames':
                case 'dragon':
                    return {
                        embers: generateEmbers(colors, effects.embers || 50)
                    };
                    
                case 'frost':
                    return {
                        snowflakes: generateSnowflakes(colors, effects.snowflakes || 50),
                        particles: generateParticles(colors, 15, 0.3)
                    };
                    
                case 'matrix':
                    return {
                        particles: generateParticles(colors, 30, 0.4),
                        stars: generateStars(colors, 20)
                    };
                    
                case 'lightning':
                    return {
                        stars: generateStars(colors, 40),
                        particles: generateParticles(colors, 20, 0.3)
                    };
                    
                default:
                    return null;
            }
        } catch (err) {
            console.error('BackgroundEffects error:', err);
            return null;
        }
    }, [isDark, effects]);
    
    // Don't render if no elements
    if (!elements) {
        return null;
    }
    
    return (
        <EffectsContainer>
            {/* Particles */}
            {elements.particles?.map(p => (
                <Particle
                    key={p.id}
                    $left={p.left}
                    $top={p.top}
                    $size={p.size}
                    $color={p.color}
                    $duration={p.duration}
                    $delay={p.delay}
                    $opacity={p.opacity}
                />
            ))}
            
            {/* Stars */}
            {elements.stars?.map(s => (
                <Star
                    key={s.id}
                    $left={s.left}
                    $top={s.top}
                    $size={s.size}
                    $color={s.color}
                    $duration={s.duration}
                    $delay={s.delay}
                />
            ))}
            
            {/* Aurora waves */}
            {elements.auroras?.map(a => (
                <AuroraWave
                    key={a.id}
                    $color1={a.color1}
                    $color2={a.color2}
                    $height={a.height}
                    $top={a.top}
                    $duration={a.duration}
                    $delay={a.delay}
                    $blur={a.blur}
                    $opacity={a.opacity}
                />
            ))}
            
            {/* Nebula clouds */}
            {elements.nebulas?.map(n => (
                <NebulaCloud
                    key={n.id}
                    $color1={n.color1}
                    $color2={n.color2}
                    $size={n.size}
                    $left={n.left}
                    $top={n.top}
                    $duration={n.duration}
                    $delay={n.delay}
                    $blur={n.blur}
                    $opacity={n.opacity}
                />
            ))}
            
            {/* Embers (flames) */}
            {elements.embers?.map(e => (
                <Ember
                    key={e.id}
                    $left={e.left}
                    $size={e.size}
                    $color={e.color}
                    $duration={e.duration}
                    $delay={e.delay}
                />
            ))}
            
            {/* Snowflakes */}
            {elements.snowflakes?.map(sf => (
                <Snowflake
                    key={sf.id}
                    $left={sf.left}
                    $size={sf.size}
                    $color={sf.color}
                    $duration={sf.duration}
                    $delay={sf.delay}
                />
            ))}
        </EffectsContainer>
    );
};

export default BackgroundEffects;