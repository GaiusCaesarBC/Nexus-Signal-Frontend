// client/src/components/BackgroundEffects.js
// ⚡ THE MOST LEGENDARY BACKGROUND EFFECTS SYSTEM EVER CREATED ⚡
// 🔥 PARTICLES • AURORA • NEBULA • MATRIX • LIGHTNING • SNOWFLAKES • EMBERS • VOID 🔥

import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context/ThemeContext';

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🎬 KEYFRAME ANIMATIONS                     ║
// ╚══════════════════════════════════════════════════════════════╝

const float = keyframes`
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-30px) translateX(15px); }
    50% { transform: translateY(-15px) translateX(-10px); }
    75% { transform: translateY(-40px) translateX(8px); }
`;

const twinkle = keyframes`
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
`;

const rise = keyframes`
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.8; }
    100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
`;

const fall = keyframes`
    0% { transform: translateY(-20px) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.6; }
    100% { transform: translateY(100vh) translateX(80px); opacity: 0; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 0.9; }
`;

const glow = keyframes`
    0%, 100% { filter: brightness(1) blur(1px); }
    50% { filter: brightness(1.5) blur(2px); }
`;

const auroraFlow = keyframes`
    0% { transform: translateX(-50%) skewX(-15deg); }
    50% { transform: translateX(0%) skewX(-10deg); }
    100% { transform: translateX(50%) skewX(-15deg); }
`;

const nebulaMove = keyframes`
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -40px) scale(1.1); }
    66% { transform: translate(-20px, 30px) scale(0.95); }
`;

const shootingStar = keyframes`
    0% { transform: translateX(0) translateY(0); opacity: 1; width: 0; }
    30% { width: 150px; opacity: 1; }
    100% { transform: translateX(600px) translateY(600px); opacity: 0; width: 150px; }
`;

const matrixRain = keyframes`
    0% { transform: translateY(-100%); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.8; }
    100% { transform: translateY(100vh); opacity: 0; }
`;

const lightningStrike = keyframes`
    0%, 100% { opacity: 0; }
    5%, 10% { opacity: 1; }
    15% { opacity: 0.5; }
    20% { opacity: 0; }
`;

const lightningFlash = keyframes`
    0%, 9%, 11%, 29%, 31%, 100% { opacity: 0; }
    10%, 30% { opacity: 1; }
`;

const vortexSpin = keyframes`
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
`;

const sunRotate = keyframes`
    from { transform: translateX(-50%) rotate(0deg); }
    to { transform: translateX(-50%) rotate(360deg); }
`;

const haloFloat = keyframes`
    0%, 100% { transform: translateX(-50%) rotateX(75deg) scale(1); opacity: 0.4; }
    50% { transform: translateX(-50%) rotateX(75deg) scale(1.1); opacity: 0.6; }
`;

// ╔══════════════════════════════════════════════════════════════╗
// ║                    💫 STYLED COMPONENTS                       ║
// ╚══════════════════════════════════════════════════════════════╝

const EffectsContainer = styled.div`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
`;

const Particle = styled.div`
    position: absolute;
    border-radius: 50%;
    animation: ${float} ${props => props.$duration || 15}s ease-in-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform, opacity;
`;

const Star = styled.div`
    position: absolute;
    border-radius: 50%;
    animation: ${twinkle} ${props => props.$duration || 3}s ease-in-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: opacity, transform;
`;

const AuroraContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
`;

const AuroraWave = styled.div`
    position: absolute;
    width: 200%;
    height: 100%;
    left: -50%;
    animation: ${auroraFlow} ${props => props.$duration || 20}s linear infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform;
`;

const NebulaCloud = styled.div`
    position: absolute;
    border-radius: 50%;
    animation: ${nebulaMove} ${props => props.$duration || 40}s ease-in-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform;
`;

const ShootingStarEl = styled.div`
    position: absolute;
    height: 2px;
    border-radius: 2px;
    animation: ${shootingStar} ${props => props.$duration || 2}s linear infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform, opacity, width;
`;

const Ember = styled.div`
    position: absolute;
    bottom: -20px;
    border-radius: 50%;
    animation: ${rise} ${props => props.$duration || 10}s linear infinite, ${glow} 0.8s ease-in-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform, opacity;
`;

const Snowflake = styled.div`
    position: absolute;
    top: -30px;
    animation: ${fall} ${props => props.$duration || 12}s linear infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform, opacity;
`;

const MatrixColumn = styled.div`
    position: absolute;
    top: 0;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 0.1em;
    animation: ${matrixRain} ${props => props.$duration || 5}s linear infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform, opacity;
`;

const LightningBolt = styled.svg`
    position: absolute;
    top: 0;
    animation: ${lightningStrike} ${props => props.$duration || 4}s ease-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: opacity;
`;

const LightningFlashEl = styled.div`
    position: absolute;
    inset: 0;
    animation: ${lightningFlash} ${props => props.$duration || 4}s ease-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: opacity;
`;

const VortexRing = styled.div`
    position: absolute;
    border-radius: 50%;
    animation: ${vortexSpin} ${props => props.$duration || 30}s linear infinite, ${pulse} 4s ease-in-out infinite;
    will-change: transform;
`;

const SunraysContainer = styled.div`
    position: absolute;
    top: -20%;
    left: 50%;
    width: 150%;
    height: 80%;
    animation: ${sunRotate} 120s linear infinite;
    will-change: transform;
`;

const Sunray = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 50%;
    transform-origin: center top;
`;

const Halo = styled.div`
    position: absolute;
    left: 50%;
    border-radius: 50%;
    animation: ${haloFloat} ${props => props.$duration || 5}s ease-in-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    will-change: transform, opacity;
`;

const AmbientGlow = styled.div`
    position: absolute;
    border-radius: 50%;
    animation: ${pulse} ${props => props.$duration || 8}s ease-in-out infinite;
`;

const GlitchOverlay = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
        0deg,
        transparent 0px,
        transparent 2px,
        rgba(255, 255, 255, 0.03) 2px,
        rgba(255, 255, 255, 0.03) 4px
    );
`;

// ╔══════════════════════════════════════════════════════════════╗
// ║                    🎮 MAIN COMPONENT                          ║
// ╚══════════════════════════════════════════════════════════════╝

const BackgroundEffects = () => {
    const { theme, effects, hasEffects, isDark } = useTheme();
    
    // Get the page background from theme
    const pageBackground = theme?.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)';
    
    // Generate deterministic random values
    const generateElements = (count, seed = 0) => {
        return Array.from({ length: count }, (_, i) => {
            const s = seed + i;
            return {
                id: i,
                rand1: ((s * 9301 + 49297) % 233280) / 233280,
                rand2: ((s * 7621 + 38653) % 166797) / 166797,
                rand3: ((s * 5483 + 21691) % 99277) / 99277,
                rand4: ((s * 3847 + 15473) % 78521) / 78521,
            };
        });
    };
    
    // Memoize all effect elements
    const effectElements = useMemo(() => {
        if (!isDark || !hasEffects || !effects) return null;
        
        const { type, colors = [], count = 50, opacity = 0.5 } = effects;
        const safeColors = colors.length > 0 ? colors : ['#6366f1'];
        
        switch (type) {
            // ===== PARTICLES =====
            case 'particles': {
                const particles = generateElements(count);
                const sizeMin = effects.size?.min || 2;
                const sizeMax = effects.size?.max || 6;
                
                return particles.map(p => {
                    const size = p.rand3 * (sizeMax - sizeMin) + sizeMin;
                    const color = safeColors[Math.floor(p.rand4 * safeColors.length)];
                    return (
                        <Particle
                            key={p.id}
                            $duration={p.rand1 * 15 + 10}
                            $delay={p.rand2 * 8}
                            style={{
                                left: `${p.rand1 * 100}%`,
                                top: `${p.rand2 * 100}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                backgroundColor: color,
                                opacity: p.rand3 * opacity + 0.1,
                                boxShadow: effects.glow ? `0 0 ${size * 3}px ${color}` : 'none'
                            }}
                        />
                    );
                });
            }
            
            // ===== STARS =====
            case 'stars': {
                const stars = generateElements(count);
                const sizeMin = effects.size?.min || 1;
                const sizeMax = effects.size?.max || 4;
                
                return stars.map(s => {
                    const size = s.rand3 * (sizeMax - sizeMin) + sizeMin;
                    const color = safeColors[Math.floor(s.rand4 * safeColors.length)];
                    return (
                        <Star
                            key={s.id}
                            $duration={s.rand1 * 4 + 2}
                            $delay={s.rand2 * 5}
                            style={{
                                left: `${s.rand1 * 100}%`,
                                top: `${s.rand2 * 100}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                backgroundColor: color,
                                boxShadow: `0 0 ${size * 3}px ${color}`
                            }}
                        />
                    );
                });
            }
            
            // ===== AURORA =====
            case 'aurora': {
                const waves = effects.waves || 4;
                const waveElements = generateElements(waves);
                
                return (
                    <AuroraContainer style={{ height: `${effects.height || 60}%`, opacity }}>
                        {waveElements.map((w, i) => (
                            <AuroraWave
                                key={w.id}
                                $duration={20 + i * 8}
                                $delay={i * 3}
                                style={{
                                    background: `linear-gradient(180deg, 
                                        transparent 0%,
                                        ${safeColors[i % safeColors.length]}50 15%,
                                        ${safeColors[(i + 1) % safeColors.length]}70 30%,
                                        ${safeColors[(i + 2) % safeColors.length]}50 50%,
                                        transparent 100%
                                    )`,
                                    filter: `blur(${effects.blur || 60}px)`
                                }}
                            />
                        ))}
                    </AuroraContainer>
                );
            }
            
            // ===== NEBULA =====
            case 'nebula': {
                const cloudCount = effects.clouds || 5;
                const starCount = effects.stars || 100;
                const clouds = generateElements(cloudCount, 100);
                const stars = generateElements(starCount, 200);
                const shootingStarCount = effects.shootingStars?.enabled ? 4 : 0;
                const shootingStars = generateElements(shootingStarCount, 300);
                
                return (
                    <>
                        {clouds.map((c, i) => (
                            <NebulaCloud
                                key={`cloud-${c.id}`}
                                $duration={40 + c.rand4 * 30}
                                $delay={i * 5}
                                style={{
                                    left: `${c.rand1 * 80 + 10}%`,
                                    top: `${c.rand2 * 60 + 10}%`,
                                    width: `${c.rand3 * 300 + 200}px`,
                                    height: `${c.rand3 * 300 + 200}px`,
                                    background: `radial-gradient(ellipse at center,
                                        ${safeColors[i % safeColors.length]}70 0%,
                                        ${safeColors[(i + 1) % safeColors.length]}40 35%,
                                        transparent 75%
                                    )`,
                                    filter: 'blur(60px)',
                                    opacity: opacity * 0.7
                                }}
                            />
                        ))}
                        
                        {stars.map(s => {
                            const size = s.rand3 * 3 + 1;
                            const color = safeColors[Math.floor(s.rand4 * safeColors.length)];
                            return (
                                <Star
                                    key={`star-${s.id}`}
                                    $duration={s.rand1 * 4 + 2}
                                    $delay={s.rand2 * 5}
                                    style={{
                                        left: `${s.rand1 * 100}%`,
                                        top: `${s.rand2 * 100}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        backgroundColor: color,
                                        boxShadow: `0 0 ${size * 2}px ${color}`
                                    }}
                                />
                            );
                        })}
                        
                        {shootingStars.map(ss => (
                            <ShootingStarEl
                                key={`shooting-${ss.id}`}
                                $duration={ss.rand3 * 2 + 1.5}
                                $delay={ss.rand4 * 15 + ss.id * 5}
                                style={{
                                    left: `${ss.rand1 * 60}%`,
                                    top: `${ss.rand2 * 40}%`,
                                    background: `linear-gradient(90deg, ${safeColors[0]}, transparent)`,
                                    boxShadow: `0 0 10px ${safeColors[0]}`
                                }}
                            />
                        ))}
                    </>
                );
            }
            
            // ===== EMBERS =====
            case 'embers': {
                const embers = generateElements(count);
                const sizeMin = effects.size?.min || 2;
                const sizeMax = effects.size?.max || 8;
                
                return (
                    <>
                        {embers.map(e => {
                            const size = e.rand2 * (sizeMax - sizeMin) + sizeMin;
                            const color = safeColors[Math.floor(e.rand3 * safeColors.length)];
                            return (
                                <Ember
                                    key={e.id}
                                    $duration={e.rand4 * 8 + 6}
                                    $delay={e.rand1 * 10}
                                    style={{
                                        left: `${e.rand1 * 100}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        backgroundColor: color,
                                        boxShadow: `0 0 ${size * 4}px ${color}`
                                    }}
                                />
                            );
                        })}
                        
                        <AmbientGlow
                            $duration={8}
                            style={{
                                left: '50%',
                                bottom: '-10%',
                                width: '80%',
                                height: '40%',
                                transform: 'translateX(-50%)',
                                background: `radial-gradient(ellipse at center, ${safeColors[0]}40 0%, transparent 70%)`,
                                filter: 'blur(40px)',
                                opacity: 0.5
                            }}
                        />
                    </>
                );
            }
            
            // ===== SNOWFLAKES =====
            case 'snowflakes': {
                const snowflakes = generateElements(count);
                const sizeMin = effects.snowflakes?.size?.min || 4;
                const sizeMax = effects.snowflakes?.size?.max || 16;
                
                return snowflakes.map(sf => {
                    const size = sf.rand2 * (sizeMax - sizeMin) + sizeMin;
                    const color = safeColors[Math.floor(sf.rand3 * safeColors.length)];
                    const type = sf.rand4 > 0.7 ? 'crystal' : 'dot';
                    
                    return (
                        <Snowflake
                            key={sf.id}
                            $duration={sf.rand4 * 12 + 8}
                            $delay={sf.rand1 * 15}
                            style={{
                                left: `${sf.rand1 * 100}%`,
                                width: `${size}px`,
                                height: `${size}px`,
                                opacity: sf.rand3 * opacity + 0.3,
                                backgroundColor: type === 'dot' ? color : 'transparent',
                                border: type === 'crystal' ? `1px solid ${color}` : 'none',
                                borderRadius: type === 'dot' ? '50%' : '2px',
                                transform: type === 'crystal' ? 'rotate(45deg)' : 'none',
                                boxShadow: `0 0 ${size}px ${color}80`
                            }}
                        />
                    );
                });
            }
            
            // ===== MATRIX =====
            case 'matrix': {
                const density = effects.density || 30;
                const columns = generateElements(density);
                const chars = effects.characters || 'NEXUS01アイウエオ';
                
                return (
                    <>
                        {columns.map(col => {
                            const color = safeColors[Math.floor(col.rand4 * safeColors.length)];
                            return (
                                <MatrixColumn
                                    key={col.id}
                                    $duration={col.rand1 * 4 + 3}
                                    $delay={col.rand2 * 6}
                                    style={{
                                        left: `${(col.id / density) * 100}%`,
                                        fontSize: `${col.rand3 * 6 + 12}px`,
                                        color: color,
                                        textShadow: `0 0 10px ${color}`,
                                        opacity: col.rand1 * opacity + 0.2
                                    }}
                                >
                                    {Array.from({ length: 25 }, (_, i) => 
                                        chars[Math.floor(((col.id + i) * 7919) % chars.length)]
                                    ).join('')}
                                </MatrixColumn>
                            );
                        })}
                        
                        {effects.glitch && <GlitchOverlay />}
                    </>
                );
            }
            
            // ===== LIGHTNING =====
            case 'lightning': {
                const boltCount = effects.bolts || 3;
                const bolts = generateElements(boltCount);
                const freq = (effects.frequency || 4000) / 1000;
                
                return (
                    <>
                        {bolts.map((bolt, i) => {
                            const color = safeColors[Math.floor(bolt.rand3 * safeColors.length)];
                            return (
                                <LightningBolt
                                    key={bolt.id}
                                    $duration={freq}
                                    $delay={bolt.rand2 * freq + i * (freq / boltCount)}
                                    viewBox="0 0 100 400"
                                    style={{
                                        left: `${15 + (i * 70 / boltCount) + bolt.rand1 * 10}%`,
                                        width: '100px',
                                        height: '60%',
                                        transform: bolt.rand4 > 0.5 ? 'scaleX(-1)' : 'none',
                                        filter: `drop-shadow(0 0 20px ${color})`
                                    }}
                                >
                                    <path
                                        d="M50 0 L60 80 L80 80 L45 200 L65 200 L30 400 L40 220 L20 220 L45 100 L30 100 Z"
                                        fill={color}
                                    />
                                </LightningBolt>
                            );
                        })}
                        
                        {effects.flash && (
                            <LightningFlashEl
                                $duration={freq}
                                $delay={0}
                                style={{ background: `${safeColors[0]}15` }}
                            />
                        )}
                        
                        {effects.rain?.enabled && generateElements(effects.rain.count || 80).map(r => (
                            <Snowflake
                                key={`rain-${r.id}`}
                                $duration={r.rand2 * 0.5 + 0.5}
                                $delay={r.rand3 * 3}
                                style={{
                                    left: `${r.rand1 * 100}%`,
                                    width: '1px',
                                    height: '15px',
                                    backgroundColor: safeColors[0],
                                    opacity: effects.rain.opacity || 0.3,
                                    borderRadius: '1px'
                                }}
                            />
                        ))}
                    </>
                );
            }
            
            // ===== VOID =====
            case 'void': {
                const vortexConfig = effects.vortex || {};
                const particleCount = effects.particles || 60;
                const particles = generateElements(particleCount);
                const ringCount = 5;
                const rings = generateElements(ringCount, 500);
                
                return (
                    <>
                        {vortexConfig.enabled && rings.map((ring, i) => (
                            <VortexRing
                                key={`ring-${ring.id}`}
                                $duration={30 + i * 10}
                                style={{
                                    left: `${vortexConfig.position?.x || 30}%`,
                                    top: `${vortexConfig.position?.y || 30}%`,
                                    width: `${20 + i * 12}vw`,
                                    height: `${20 + i * 12}vw`,
                                    border: `2px solid ${safeColors[i % safeColors.length]}`,
                                    opacity: 0.3 - i * 0.04,
                                    boxShadow: `0 0 20px ${safeColors[i % safeColors.length]}40`
                                }}
                            />
                        ))}
                        
                        {particles.map(p => {
                            const size = p.rand3 * 6 + 2;
                            const color = safeColors[Math.floor(p.rand4 * safeColors.length)];
                            return (
                                <Particle
                                    key={p.id}
                                    $duration={p.rand1 * 20 + 15}
                                    $delay={p.rand2 * 10}
                                    style={{
                                        left: `${p.rand1 * 100}%`,
                                        top: `${p.rand2 * 100}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        backgroundColor: color,
                                        opacity: p.rand3 * opacity + 0.1,
                                        boxShadow: `0 0 ${size * 3}px ${color}`
                                    }}
                                />
                            );
                        })}
                        
                        {vortexConfig.enabled && (
                            <AmbientGlow
                                $duration={10}
                                style={{
                                    left: `${vortexConfig.position?.x || 30}%`,
                                    top: `${vortexConfig.position?.y || 30}%`,
                                    width: '40vw',
                                    height: '40vw',
                                    transform: 'translate(-50%, -50%)',
                                    background: `radial-gradient(ellipse at center, ${safeColors[0]}40 0%, transparent 70%)`,
                                    filter: 'blur(60px)'
                                }}
                            />
                        )}
                    </>
                );
            }
            
            // ===== CELESTIAL =====
            case 'celestial': {
                const particleCount = effects.particles || 60;
                const particles = generateElements(particleCount);
                const haloCount = effects.halos?.count || 4;
                const halos = generateElements(haloCount, 600);
                const sunrayCount = effects.sunrays?.count || 16;
                
                return (
                    <>
                        {effects.sunrays?.enabled && (
                            <SunraysContainer style={{ opacity: 0.2 }}>
                                {Array.from({ length: sunrayCount }, (_, i) => (
                                    <Sunray
                                        key={`ray-${i}`}
                                        style={{
                                            transform: `translateX(-50%) rotate(${(360 / sunrayCount) * i}deg)`,
                                            background: `linear-gradient(180deg, ${safeColors[0]}90, ${safeColors[0]}40, transparent)`,
                                            filter: 'blur(2px)'
                                        }}
                                    />
                                ))}
                            </SunraysContainer>
                        )}
                        
                        {halos.map((h, i) => {
                            const color = (effects.halos?.colors || safeColors)[i % (effects.halos?.colors || safeColors).length];
                            return (
                                <Halo
                                    key={`halo-${h.id}`}
                                    $duration={5 + i * 1.5}
                                    $delay={i * 0.8}
                                    style={{
                                        top: `${8 + i * 4}%`,
                                        width: `${25 + i * 12}vw`,
                                        height: `${(25 + i * 12) * 0.25}vw`,
                                        border: `2px solid ${color}`,
                                        opacity: 0.4 - i * 0.06,
                                        boxShadow: `0 0 30px ${color}60`
                                    }}
                                />
                            );
                        })}
                        
                        {particles.map(p => {
                            const size = p.rand3 * 4 + 2;
                            const color = safeColors[Math.floor(p.rand4 * safeColors.length)];
                            return (
                                <Particle
                                    key={p.id}
                                    $duration={p.rand1 * 12 + 8}
                                    $delay={p.rand2 * 6}
                                    style={{
                                        left: `${p.rand1 * 100}%`,
                                        top: `${p.rand2 * 100}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        backgroundColor: color,
                                        opacity: p.rand3 * opacity + 0.2,
                                        boxShadow: `0 0 ${size * 3}px ${color}`
                                    }}
                                />
                            );
                        })}
                        
                        <AmbientGlow
                            $duration={10}
                            style={{
                                left: '50%',
                                top: '0',
                                width: '80vw',
                                height: '50vh',
                                transform: 'translateX(-50%)',
                                background: `radial-gradient(ellipse at top, ${safeColors[0]}50 0%, transparent 70%)`,
                                filter: 'blur(60px)'
                            }}
                        />
                    </>
                );
            }
            
            // ===== DRAGON (FLAMES + EMBERS) =====
            case 'dragon': {
                const emberCount = effects.embers?.count || 80;
                const embers = generateElements(emberCount);
                
                return (
                    <>
                        {embers.map(e => {
                            const size = e.rand2 * 8 + 2;
                            const color = safeColors[Math.floor(e.rand3 * safeColors.length)];
                            return (
                                <Ember
                                    key={e.id}
                                    $duration={e.rand4 * 6 + 5}
                                    $delay={e.rand1 * 8}
                                    style={{
                                        left: `${e.rand1 * 100}%`,
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        backgroundColor: color,
                                        boxShadow: `0 0 ${size * 4}px ${color}`
                                    }}
                                />
                            );
                        })}
                        
                        <AmbientGlow
                            $duration={4}
                            style={{
                                left: '25%',
                                bottom: '-5%',
                                width: '40%',
                                height: '30%',
                                background: `radial-gradient(ellipse at center, ${safeColors[0]}50 0%, transparent 70%)`,
                                filter: 'blur(40px)'
                            }}
                        />
                        <AmbientGlow
                            $duration={5}
                            style={{
                                left: '50%',
                                bottom: '-10%',
                                width: '60%',
                                height: '40%',
                                transform: 'translateX(-50%)',
                                background: `radial-gradient(ellipse at center, ${safeColors[1] || safeColors[0]}40 0%, transparent 70%)`,
                                filter: 'blur(50px)'
                            }}
                        />
                        <AmbientGlow
                            $duration={4.5}
                            style={{
                                right: '15%',
                                bottom: '-5%',
                                width: '40%',
                                height: '30%',
                                background: `radial-gradient(ellipse at center, ${safeColors[2] || safeColors[0]}50 0%, transparent 70%)`,
                                filter: 'blur(40px)'
                            }}
                        />
                    </>
                );
            }
            
            default:
                return null;
        }
    }, [isDark, hasEffects, effects]);
    
    return (
        <EffectsContainer style={{ background: pageBackground }}>
            {effectElements}
        </EffectsContainer>
    );
};

export default BackgroundEffects;