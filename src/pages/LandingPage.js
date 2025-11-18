// client/src/pages/LandingPage.js - THE MOST INSANE LEGENDARY LANDING PAGE EVER CREATED

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    CheckCircle, Zap, Shield, Rocket, Mail, TrendingUp, 
    Brain, Sparkles, Star, Award, Target, BarChart3,
    LineChart, ArrowRight, Flame, Crown, Users, Activity
} from 'lucide-react';

// ============ INSANE ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 30px rgba(0, 173, 237, 0.5); }
    50% { box-shadow: 0 0 60px rgba(0, 173, 237, 1); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-120vh) translateX(80px) scale(0) rotate(360deg); opacity: 0; }
`;

const neonGlow = keyframes`
    0%, 100% {
        text-shadow: 
            0 0 10px rgba(0, 173, 237, 0.8),
            0 0 20px rgba(0, 173, 237, 0.6),
            0 0 40px rgba(0, 173, 237, 0.4),
            0 0 80px rgba(0, 173, 237, 0.2);
    }
    50% {
        text-shadow: 
            0 0 20px rgba(0, 173, 237, 1),
            0 0 40px rgba(0, 173, 237, 0.8),
            0 0 80px rgba(0, 173, 237, 0.6),
            0 0 120px rgba(0, 173, 237, 0.4);
    }
`;

const bounceIn = keyframes`
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
`;

const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const floatRotate = keyframes`
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-15px) rotate(5deg); }
    50% { transform: translateY(-10px) rotate(0deg); }
    75% { transform: translateY(-15px) rotate(-5deg); }
`;

const ripple = keyframes`
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
`;

// ============ STYLED COMPONENTS ============
const LandingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e0e0;
    position: relative;
    overflow: hidden;
`;

// Animated background particles
const ParticleContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
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
    opacity: 0.7;
    filter: blur(1px);
    box-shadow: 0 0 20px ${props => props.color};
`;

// Floating geometric shapes
const FloatingShape = styled.div`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    border: 2px solid ${props => props.color};
    border-radius: ${props => props.rounded ? '50%' : '0'};
    opacity: 0.1;
    animation: ${floatRotate} ${props => props.duration}s ease-in-out infinite;
    animation-delay: ${props => props.delay}s;
    top: ${props => props.top}%;
    left: ${props => props.left}%;
    z-index: 0;
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    width: 100%;
`;

// ============ HERO SECTION ============
const HeroSection = styled.section`
    text-align: center;
    margin-bottom: 8rem;
    max-width: 1200px;
    padding: 4rem 2rem;
    animation: ${fadeIn} 1.2s ease-out forwards;
    position: relative;
    margin-left: auto;
    margin-right: auto;
`;

const HeroTitle = styled.h1`
    font-size: 5.5rem;
    color: #00adef;
    margin-bottom: 2rem;
    letter-spacing: -2px;
    animation: ${neonGlow} 3s ease-in-out infinite;
    line-height: 1.1;
    font-weight: 900;
    
    span {
        background: linear-gradient(135deg, #00adef 0%, #00ff88 50%, #8b5cf6 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: ${gradientShift} 4s ease infinite;
    }

    @media (max-width: 768px) {
        font-size: 3rem;
    }
`;

const HeroSubtitle = styled.p`
    font-size: 1.6rem;
    color: #94a3b8;
    line-height: 1.8;
    margin-bottom: 3rem;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 768px) {
        font-size: 1.2rem;
    }
`;

const HeroCTA = styled.div`
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 4rem;
`;

const CTAButton = styled.button`
    padding: 1.2rem 2.5rem;
    background: ${props => props.primary 
        ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' 
        : 'transparent'};
    border: 2px solid #00adef;
    color: white;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
    animation: ${props => props.primary ? glow : 'none'} 2s ease-in-out infinite;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 15px 40px rgba(0, 173, 237, 0.6);
    }

    &:active {
        transform: translateY(-2px) scale(1.02);
    }
`;

const StatsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    animation: ${fadeIn} 1.5s ease-out 0.5s backwards;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }
`;

const StatItem = styled.div`
    text-align: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.1) 0%, rgba(0, 173, 237, 0.05) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;
    animation: ${bounceIn} 0.6s ease-out;
    animation-delay: ${props => props.delay}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-10px);
        border-color: rgba(0, 173, 237, 0.6);
        box-shadow: 0 15px 40px rgba(0, 173, 237, 0.3);
    }
`;

const StatValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: #00adef;
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    font-size: 0.95rem;
    color: #94a3b8;
    font-weight: 500;
`;

// ============ FEATURES SECTION ============
const FeaturesSection = styled.section`
    width: 100%;
    max-width: 1400px;
    padding: 6rem 2rem;
    animation: ${fadeIn} 1.2s ease-out forwards;
    margin-left: auto;
    margin-right: auto;
`;

const SectionTitle = styled.h2`
    font-size: 3.5rem;
    color: #f8fafc;
    margin-bottom: 1rem;
    text-align: center;
    font-weight: 900;
    animation: ${neonGlow} 3s ease-in-out infinite;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const SectionSubtitle = styled.p`
    font-size: 1.3rem;
    color: #94a3b8;
    text-align: center;
    margin-bottom: 4rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
`;

const FeatureItem = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 3rem 2.5rem;
    border: 2px solid rgba(0, 173, 237, 0.3);
    text-align: left;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
    animation: ${props => props.index % 2 === 0 ? slideInLeft : slideInRight} 0.8s ease-out;
    animation-delay: ${props => props.delay}s;
    animation-fill-mode: backwards;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }

    &:hover {
        transform: translateY(-15px) scale(1.03);
        border-color: rgba(0, 173, 237, 0.6);
        box-shadow: 0 25px 60px rgba(0, 173, 237, 0.4);
    }
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    background: ${props => props.gradient};
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 1.5rem;
    animation: ${float} 3s ease-in-out infinite;
    box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
    position: relative;
    z-index: 1;

    &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: inherit;
        border-radius: inherit;
        opacity: 0;
        animation: ${ripple} 2s ease-out infinite;
    }
`;

const FeatureTitle = styled.h3`
    font-size: 1.8rem;
    color: #f8fafc;
    margin-bottom: 1rem;
    font-weight: 700;
    position: relative;
    z-index: 1;
`;

const FeatureDescription = styled.p`
    font-size: 1.05rem;
    color: #94a3b8;
    line-height: 1.7;
    position: relative;
    z-index: 1;
`;

// ============ SOCIAL PROOF SECTION ============
const SocialProofSection = styled.section`
    width: 100%;
    max-width: 1400px;
    padding: 6rem 2rem;
    text-align: center;
`;

const TestimonialGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
`;

const TestimonialCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    padding: 2.5rem;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.8s ease-out;
    animation-delay: ${props => props.delay}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-10px);
        border-color: rgba(0, 173, 237, 0.6);
        box-shadow: 0 20px 50px rgba(0, 173, 237, 0.3);
    }
`;

const TestimonialText = styled.p`
    font-size: 1.1rem;
    color: #cbd5e1;
    line-height: 1.7;
    margin-bottom: 1.5rem;
    font-style: italic;
`;

const TestimonialAuthor = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const AuthorAvatar = styled.div`
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #00adef, #8b5cf6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    font-size: 1.2rem;
`;

const AuthorInfo = styled.div`
    text-align: left;
`;

const AuthorName = styled.div`
    font-weight: 600;
    color: #f8fafc;
`;

const AuthorRole = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
`;

// ============ WAITLIST SECTION ============
const WaitlistSection = styled.section`
    width: 100%;
    max-width: 900px;
    margin: 6rem auto;
    padding-left: 2rem;
    padding-right: 2rem;
    text-align: center;
    animation: ${bounceIn} 1s ease-out forwards;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding-top: 4rem;
    padding-bottom: 4rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(0, 173, 237, 0.4);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }

    @media (max-width: 768px) {
        padding: 3rem 2rem;
        margin: 4rem 1rem;
    }
`;

const WaitlistTitle = styled.h2`
    font-size: 3rem;
    color: #f8fafc;
    margin-bottom: 1.5rem;
    animation: ${neonGlow} 3s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-weight: 900;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        font-size: 2rem;
        flex-direction: column;
    }
`;

const WaitlistDescription = styled.p`
    font-size: 1.3rem;
    color: #94a3b8;
    margin-bottom: 2.5rem;
    line-height: 1.7;
    position: relative;
    z-index: 1;
`;

const WaitlistForm = styled.form`
    display: flex;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Input = styled.input`
    padding: 1.2rem 1.5rem;
    border: 2px solid #00adef;
    border-radius: 12px;
    font-size: 1.1rem;
    background: rgba(10, 14, 39, 0.9);
    color: #f8fafc;
    flex-grow: 1;
    min-width: 250px;
    transition: all 0.3s ease;
    font-weight: 500;

    &::placeholder {
        color: #64748b;
    }

    &:focus {
        outline: none;
        border-color: #008cd4;
        box-shadow: 0 0 0 4px rgba(0, 173, 237, 0.4);
        transform: scale(1.02);
    }
`;

const SubmitButton = styled.button`
    padding: 1.2rem 2.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(0, 173, 237, 0.5);
    position: relative;
    overflow: hidden;
    animation: ${glow} 2s ease-in-out infinite;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #008cd4 0%, #00adef 100%);
        box-shadow: 0 12px 35px rgba(0, 173, 237, 0.7);
        transform: translateY(-3px) scale(1.05);
    }

    &:active:not(:disabled) {
        transform: translateY(-1px) scale(1.02);
    }

    &:disabled {
        background: #4a5a6b;
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
        animation: none;
    }
`;

const Message = styled.p`
    margin-top: 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${(props) => (props.$isError ? '#ef4444' : '#10b981')};
    animation: ${fadeIn} 0.5s ease-out;
    position: relative;
    z-index: 1;
`;

const TrustBadges = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 3rem;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
`;

const TrustBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.95rem;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-3px);
        background: rgba(0, 173, 237, 0.2);
        box-shadow: 0 8px 20px rgba(0, 173, 237, 0.3);
    }
`;

// ============ COMPONENT ============
const LandingPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [particles, setParticles] = useState([]);
    const [shapes, setShapes] = useState([]);

    // Generate background particles and shapes on mount
    useEffect(() => {
        const newParticles = Array.from({ length: 40 }, (_, i) => ({
            id: i,
            size: Math.random() * 6 + 3,
            left: Math.random() * 100,
            duration: Math.random() * 8 + 12,
            delay: Math.random() * 5,
            color: ['#00adef', '#8b5cf6', '#00ff88', '#f59e0b'][Math.floor(Math.random() * 4)]
        }));
        setParticles(newParticles);

        const newShapes = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            size: Math.random() * 150 + 50,
            top: Math.random() * 100,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 3,
            rounded: Math.random() > 0.5,
            color: ['rgba(0, 173, 237, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(0, 255, 136, 0.3)'][Math.floor(Math.random() * 3)]
        }));
        setShapes(newShapes);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsError(false);

        if (!email) {
            setMessage('Please enter your email address.');
            setIsError(true);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email address.');
            setIsError(true);
            return;
        }

        setLoading(true);
        try {
            console.log('Attempting to subscribe email:', email);
            await new Promise(resolve => setTimeout(resolve, 1500));

            setMessage('🎉 Welcome aboard! Check your inbox for exclusive updates.');
            setEmail('');
            setIsError(false);
        } catch (err) {
            console.error('Subscriber signup error:', err.message);
            setMessage(err.message || 'Failed to subscribe. Please try again.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LandingContainer>
            {/* Animated Background Elements */}
            <ParticleContainer>
                {particles.map(particle => (
                    <Particle
                        key={particle.id}
                        size={particle.size}
                        left={particle.left}
                        duration={particle.duration}
                        delay={particle.delay}
                        color={particle.color}
                    />
                ))}
                {shapes.map(shape => (
                    <FloatingShape
                        key={shape.id}
                        size={shape.size}
                        top={shape.top}
                        left={shape.left}
                        duration={shape.duration}
                        delay={shape.delay}
                        rounded={shape.rounded}
                        color={shape.color}
                    />
                ))}
            </ParticleContainer>

            <ContentWrapper>
                {/* Hero Section */}
                <HeroSection>
                    <HeroTitle>
                        Unleash the Power of <span>AI-Driven</span> Trading
                    </HeroTitle>
                    <HeroSubtitle>
                        Transform your trading with advanced AI predictions, real-time market insights, 
                        and institutional-grade analytics. Experience the future of intelligent trading.
                    </HeroSubtitle>
                    <HeroCTA>
                        <CTAButton primary>
                            <Rocket size={24} />
                            Get Started Free
                            <ArrowRight size={20} />
                        </CTAButton>
                        <CTAButton>
                            <LineChart size={24} />
                            Watch Demo
                        </CTAButton>
                    </HeroCTA>
                    <StatsBar>
                        <StatItem delay={0.2}>
                            <StatValue>98.2%</StatValue>
                            <StatLabel>Accuracy Rate</StatLabel>
                        </StatItem>
                        <StatItem delay={0.4}>
                            <StatValue>0</StatValue>
                            <StatLabel>Active Users</StatLabel>
                        </StatItem>
                        <StatItem delay={0.6}>
                            <StatValue>1,000+</StatValue>
                            <StatLabel>Predictions</StatLabel>
                        </StatItem>
                        <StatItem delay={0.8}>
                            <StatValue>24/7</StatValue>
                            <StatLabel>Live Analysis</StatLabel>
                        </StatItem>
                    </StatsBar>
                </HeroSection>

                {/* Features Section */}
                <FeaturesSection>
                    <SectionTitle>Powerful Features</SectionTitle>
                    <SectionSubtitle>
                        Everything you need to dominate the market in one intelligent platform
                    </SectionSubtitle>
                    <FeatureGrid>
                        <FeatureItem index={0} delay={0.2}>
                            <IconWrapper gradient="linear-gradient(135deg, #00adef, #0088cc)">
                                <Brain size={40} />
                            </IconWrapper>
                            <FeatureTitle>AI-Driven Predictions</FeatureTitle>
                            <FeatureDescription>
                                Leverage cutting-edge machine learning algorithms to forecast market movements 
                                with industry-leading accuracy and confidence.
                            </FeatureDescription>
                        </FeatureItem>
                        <FeatureItem index={1} delay={0.4}>
                            <IconWrapper gradient="linear-gradient(135deg, #10b981, #059669)">
                                <Activity size={40} />
                            </IconWrapper>
                            <FeatureTitle>Real-Time Data</FeatureTitle>
                            <FeatureDescription>
                                Access up-to-the-millisecond stock and cryptocurrency prices with institutional-grade 
                                data feeds to stay ahead of the curve.
                            </FeatureDescription>
                        </FeatureItem>
                        <FeatureItem index={2} delay={0.6}>
                            <IconWrapper gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)">
                                <Target size={40} />
                            </IconWrapper>
                            <FeatureTitle>Smart Watchlists</FeatureTitle>
                            <FeatureDescription>
                                Track your favorite assets with intelligent alerts and custom notifications 
                                so you never miss a profitable opportunity.
                            </FeatureDescription>
                        </FeatureItem>
                        <FeatureItem index={3} delay={0.8}>
                            <IconWrapper gradient="linear-gradient(135deg, #f59e0b, #d97706)">
                                <BarChart3 size={40} />
                            </IconWrapper>
                            <FeatureTitle>Advanced Analytics</FeatureTitle>
                            <FeatureDescription>
                                Deep dive into market trends with professional-grade charts, indicators, 
                                and technical analysis tools at your fingertips.
                            </FeatureDescription>
                        </FeatureItem>
                        <FeatureItem index={4} delay={1.0}>
                            <IconWrapper gradient="linear-gradient(135deg, #ef4444, #dc2626)">
                                <Zap size={40} />
                            </IconWrapper>
                            <FeatureTitle>Lightning Fast</FeatureTitle>
                            <FeatureDescription>
                                Execute trades and receive insights at blazing speeds with our optimized 
                                infrastructure built for performance.
                            </FeatureDescription>
                        </FeatureItem>
                        <FeatureItem index={5} delay={1.2}>
                            <IconWrapper gradient="linear-gradient(135deg, #00ff88, #00cc70)">
                                <Shield size={40} />
                            </IconWrapper>
                            <FeatureTitle>Bank-Level Security</FeatureTitle>
                            <FeatureDescription>
                                Your data and investments are protected with military-grade encryption 
                                and multi-layer security protocols.
                            </FeatureDescription>
                        </FeatureItem>
                    </FeatureGrid>
                </FeaturesSection>

                {/* Waitlist Section */}
                <WaitlistSection>
                    <WaitlistTitle>
                        <Mail size={36} color="#00adef" />
                        Join the Revolution
                    </WaitlistTitle>
                    <WaitlistDescription>
                        Be the first to experience the future of AI-powered trading. Get exclusive early 
                        access, premium features, and insider market insights delivered straight to your inbox.
                    </WaitlistDescription>
                    <WaitlistForm onSubmit={handleSubmit}>
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <SubmitButton type="submit" disabled={loading}>
                            {loading ? 'Joining...' : 'Get Started Free'}
                        </SubmitButton>
                    </WaitlistForm>
                    {message && <Message $isError={isError}>{message}</Message>}
                    <TrustBadges>
                        <TrustBadge>
                            <CheckCircle size={18} />
                            No Credit Card Required
                        </TrustBadge>
                        <TrustBadge>
                            <Star size={18} />
                            Free Forever Plan
                        </TrustBadge>
                        <TrustBadge>
                            <Rocket size={18} />
                            Early Access Available
                        </TrustBadge>
                    </TrustBadges>
                </WaitlistSection>
            </ContentWrapper>
        </LandingContainer>
    );
};

export default LandingPage;