// client/src/pages/NotFoundPage.js - THE MOST LEGENDARY 404 PAGE EVER

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, TrendingUp, Compass, Sparkles } from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
`;

const glow = keyframes`
    0%, 100% { text-shadow: 0 0 20px rgba(0, 173, 237, 0.5); }
    50% { text-shadow: 0 0 40px rgba(0, 173, 237, 1); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
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
    opacity: 0.4;
    filter: blur(1px);
`;

const ContentWrapper = styled.div`
    max-width: 800px;
    width: 100%;
    text-align: center;
    position: relative;
    z-index: 1;
    animation: ${fadeIn} 0.8s ease-out;
`;

// 404 Number
const ErrorNumber = styled.h1`
    font-size: 12rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1;
    animation: ${glow} 3s ease-in-out infinite, ${float} 4s ease-in-out infinite;
    position: relative;

    @media (max-width: 768px) {
        font-size: 8rem;
    }

    @media (max-width: 480px) {
        font-size: 6rem;
    }
`;

// Floating icon around 404
const FloatingIcon = styled.div`
    position: absolute;
    color: #00adef;
    animation: ${rotate} ${props => props.duration}s linear infinite;
    filter: drop-shadow(0 0 10px rgba(0, 173, 237, 0.6));
    
    ${props => props.position === 'top-left' && `
        top: -40px;
        left: 10%;
    `}
    ${props => props.position === 'top-right' && `
        top: -40px;
        right: 10%;
    `}
    ${props => props.position === 'bottom-left' && `
        bottom: -40px;
        left: 15%;
    `}
    ${props => props.position === 'bottom-right' && `
        bottom: -40px;
        right: 15%;
    `}

    @media (max-width: 768px) {
        display: none;
    }
`;

const Title = styled.h2`
    font-size: 2.5rem;
    color: #e0e6ed;
    margin: 2rem 0 1rem;
    font-weight: 700;
    animation: ${slideUp} 0.8s ease-out 0.2s backwards;

    @media (max-width: 768px) {
        font-size: 2rem;
    }

    @media (max-width: 480px) {
        font-size: 1.5rem;
    }
`;

const Description = styled.p`
    font-size: 1.2rem;
    color: #94a3b8;
    margin-bottom: 3rem;
    line-height: 1.6;
    animation: ${slideUp} 0.8s ease-out 0.4s backwards;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    animation: ${slideUp} 0.8s ease-out 0.6s backwards;
`;

const Button = styled.button`
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: none;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        transform: translateY(-3px);
    }

    @media (max-width: 480px) {
        padding: 0.875rem 1.5rem;
        font-size: 0.95rem;
    }
`;

const PrimaryButton = styled(Button)`
    background: linear-gradient(135deg, #00adef, #0088cc);
    color: white;
    box-shadow: 0 8px 20px rgba(0, 173, 237, 0.4);

    &:hover {
        box-shadow: 0 12px 30px rgba(0, 173, 237, 0.6);
    }
`;

const SecondaryButton = styled(Button)`
    background: rgba(100, 116, 139, 0.2);
    border: 2px solid rgba(100, 116, 139, 0.4);
    color: #cbd5e1;

    &:hover {
        background: rgba(100, 116, 139, 0.3);
        border-color: rgba(100, 116, 139, 0.6);
    }
`;

// Quick links section
const QuickLinks = styled.div`
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    animation: ${slideUp} 0.8s ease-out 0.8s backwards;
`;

const QuickLinksTitle = styled.h3`
    font-size: 1.2rem;
    color: #00adef;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

const LinksGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const QuickLink = styled.button`
    padding: 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        border-color: #00adef;
        transform: translateX(5px);
    }
`;

// Easter egg - Hidden message
const EasterEgg = styled.div`
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.85rem;
    color: #64748b;
    opacity: ${props => props.show ? 1 : 0};
    transition: opacity 0.3s ease;
    text-align: center;
    
    @media (max-width: 768px) {
        bottom: 1rem;
        font-size: 0.75rem;
        padding: 0 1rem;
    }
`;

// ============ COMPONENT ============
const NotFoundPage = () => {
    const navigate = useNavigate();
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [clickCount, setClickCount] = useState(0);

    // Generate particles
    const particlesData = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        left: Math.random() * 100,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 5,
        color: ['#00adef', '#8b5cf6', '#10b981', '#00ff88'][Math.floor(Math.random() * 4)]
    }));

    // Easter egg - click 404 five times
    const handle404Click = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        
        if (newCount >= 5) {
            setShowEasterEgg(true);
        }
    };

    // Set page title
    useEffect(() => {
        document.title = '404 - Page Not Found | Nexus Signal AI';
    }, []);

    const quickLinks = [
        { icon: Home, text: 'Dashboard', path: '/dashboard' },
        { icon: TrendingUp, text: 'Predictions', path: '/predict' },
        { icon: Search, text: 'Watchlist', path: '/watchlist' },
        { icon: Compass, text: 'Explore', path: '/' },
    ];

    return (
        <PageContainer>
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
                {/* 404 Number with floating icons */}
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <FloatingIcon position="top-left" duration={4}>
                        <Sparkles size={32} />
                    </FloatingIcon>
                    <FloatingIcon position="top-right" duration={5}>
                        <TrendingUp size={32} />
                    </FloatingIcon>
                    <FloatingIcon position="bottom-left" duration={6}>
                        <Compass size={32} />
                    </FloatingIcon>
                    <FloatingIcon position="bottom-right" duration={4.5}>
                        <Search size={32} />
                    </FloatingIcon>
                    
                    <ErrorNumber onClick={handle404Click}>404</ErrorNumber>
                </div>

                {/* Title & Description */}
                <Title>Oops! Page Not Found</Title>
                <Description>
                    Looks like this trading signal got lost in the market noise. 
                    Let's get you back on track to profitable insights!
                </Description>

                {/* Action Buttons */}
                <ButtonGroup>
                    <PrimaryButton onClick={() => navigate('/')}>
                        <Home size={20} />
                        Back to Home
                    </PrimaryButton>
                    <SecondaryButton onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        Go Back
                    </SecondaryButton>
                </ButtonGroup>

                {/* Quick Links */}
                <QuickLinks>
                    <QuickLinksTitle>
                        <Compass size={20} />
                        Quick Navigation
                    </QuickLinksTitle>
                    <LinksGrid>
                        {quickLinks.map((link, index) => (
                            <QuickLink 
                                key={index}
                                onClick={() => navigate(link.path)}
                            >
                                <link.icon size={20} />
                                {link.text}
                            </QuickLink>
                        ))}
                    </LinksGrid>
                </QuickLinks>
            </ContentWrapper>

            {/* Easter Egg */}
            <EasterEgg show={showEasterEgg}>
                🎉 Congrats! You found the easter egg! You're a true explorer! 🚀<br />
                Pro tip: The best traders never stop exploring.
            </EasterEgg>
        </PageContainer>
    );
};

export default NotFoundPage;
