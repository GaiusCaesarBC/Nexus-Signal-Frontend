// client/src/components/LoadingScreen.js - THE MOST LEGENDARY LOADING SCREEN EVER

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Brain, Zap, TrendingUp, Activity } from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 30px rgba(0, 173, 237, 0.5); }
    50% { box-shadow: 0 0 60px rgba(0, 173, 237, 1); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
`;

const slideUp = keyframes`
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const orbitIcon = keyframes`
    0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
`;

// ============ STYLED COMPONENTS ============
const LoadingContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    animation: ${fadeIn} 0.5s ease-out;
    overflow: hidden;
`;

// Animated background particles
const ParticleContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background: ${props => props.color};
    border-radius: 50%;
    animation: ${particles} ${props => props.duration}s linear infinite;
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    bottom: 0;
    opacity: 0.6;
    filter: blur(1px);
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
`;

// Main logo/icon container
const LogoContainer = styled.div`
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LogoCircle = styled.div`
    position: relative;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${pulse} 2s ease-in-out infinite, ${glow} 2s ease-in-out infinite;
    box-shadow: 0 0 60px rgba(0, 173, 237, 0.8);

    &::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border: 2px solid rgba(0, 173, 237, 0.3);
        border-radius: 50%;
        animation: ${rotate} 3s linear infinite;
    }

    &::after {
        content: '';
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        bottom: -20px;
        border: 2px solid rgba(0, 255, 136, 0.3);
        border-radius: 50%;
        animation: ${rotate} 4s linear infinite reverse;
    }
`;

// Orbiting icons
const OrbitIcon = styled.div`
    position: absolute;
    color: #00adef;
    animation: ${orbitIcon} ${props => props.duration}s linear infinite;
    animation-delay: ${props => props.delay}s;
    filter: drop-shadow(0 0 10px rgba(0, 173, 237, 0.8));
`;

// Text content
const LoadingTitle = styled.h1`
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    animation: ${slideUp} 0.8s ease-out 0.3s backwards;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const LoadingSubtitle = styled.p`
    font-size: 1.2rem;
    color: #94a3b8;
    margin-bottom: 2rem;
    animation: ${slideUp} 0.8s ease-out 0.5s backwards;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 1rem;
        padding: 0 2rem;
    }
`;

// Progress bar
const ProgressContainer = styled.div`
    width: 300px;
    height: 8px;
    background: rgba(0, 173, 237, 0.2);
    border-radius: 4px;
    overflow: hidden;
    animation: ${slideUp} 0.8s ease-out 0.7s backwards;

    @media (max-width: 768px) {
        width: 250px;
    }
`;

const ProgressBar = styled.div`
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #00adef, #00ff88, #00adef);
    background-size: 200% 100%;
    animation: ${shimmer} 2s linear infinite;
    border-radius: 4px;
`;

// Loading dots
const LoadingDots = styled.div`
    display: flex;
    gap: 0.5rem;
    animation: ${slideUp} 0.8s ease-out 0.9s backwards;
`;

const Dot = styled.div`
    width: 12px;
    height: 12px;
    background: #00adef;
    border-radius: 50%;
    animation: ${float} 1.5s ease-in-out infinite;
    animation-delay: ${props => props.delay}s;
    box-shadow: 0 0 10px rgba(0, 173, 237, 0.8);
`;

// Fun loading messages
const LoadingMessage = styled.div`
    position: absolute;
    bottom: 4rem;
    font-size: 0.95rem;
    color: #64748b;
    animation: ${fadeIn} 1s ease-out 1s backwards;
    text-align: center;
    padding: 0 2rem;
`;

// ============ COMPONENT ============
const LoadingScreen = ({ message = "Loading your AI-powered trading platform..." }) => {
    // Generate particles
    const particleCount = 15;
    const particlesData = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 5,
        color: ['#00adef', '#8b5cf6', '#10b981', '#00ff88'][Math.floor(Math.random() * 4)]
    }));

    const funMessages = [
        "🚀 Initializing AI algorithms...",
        "📊 Loading market data...",
        "🧠 Warming up neural networks...",
        "💎 Preparing your portfolio...",
        "⚡ Connecting to real-time feeds...",
        "🎯 Calibrating prediction models...",
    ];

    const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];

    return (
        <LoadingContainer>
            {/* Animated Background Particles */}
            <ParticleContainer>
                {particlesData.map(particle => (
                    <Particle
                        key={particle.id}
                        size={particle.size}
                        left={particle.left}
                        duration={particle.duration}
                        delay={particle.delay}
                        color={particle.color}
                    />
                ))}
            </ParticleContainer>

            <ContentWrapper>
                {/* Animated Logo with Orbiting Icons */}
                <LogoContainer>
                    <OrbitIcon duration={3} delay={0}>
                        <Brain size={28} />
                    </OrbitIcon>
                    <OrbitIcon duration={3} delay={0.75}>
                        <TrendingUp size={28} />
                    </OrbitIcon>
                    <OrbitIcon duration={3} delay={1.5}>
                        <Zap size={28} />
                    </OrbitIcon>
                    <OrbitIcon duration={3} delay={2.25}>
                        <Activity size={28} />
                    </OrbitIcon>
                    
                    <LogoCircle>
                        <Brain size={60} color="white" />
                    </LogoCircle>
                </LogoContainer>

                {/* Text Content */}
                <div>
                    <LoadingTitle>Nexus Signal AI</LoadingTitle>
                    <LoadingSubtitle>{message}</LoadingSubtitle>
                </div>

                {/* Progress Bar */}
                <ProgressContainer>
                    <ProgressBar />
                </ProgressContainer>

                {/* Loading Dots */}
                <LoadingDots>
                    <Dot delay={0} />
                    <Dot delay={0.2} />
                    <Dot delay={0.4} />
                </LoadingDots>
            </ContentWrapper>

            {/* Fun Loading Message */}
            <LoadingMessage>{randomMessage}</LoadingMessage>
        </LoadingContainer>
    );
};

export default LoadingScreen;