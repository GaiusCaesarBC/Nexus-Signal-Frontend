// client/src/pages/AboutPage.js - WITH REAL API DATA
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { 
    Target, ShieldCheck, Users, Zap, TrendingUp, Brain, 
    Rocket, Award, Star, CheckCircle, Code, BarChart3,
    Sparkles, Trophy, Flame, Heart
} from 'lucide-react';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const neonGlow = keyframes`
    0%, 100% {
        text-shadow: 
            0 0 10px rgba(59, 130, 246, 0.8),
            0 0 20px rgba(59, 130, 246, 0.6),
            0 0 30px rgba(59, 130, 246, 0.4);
    }
    50% {
        text-shadow: 
            0 0 20px rgba(59, 130, 246, 1),
            0 0 40px rgba(59, 130, 246, 0.8),
            0 0 60px rgba(59, 130, 246, 0.6);
    }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const countUp = keyframes`
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
`;

// ============ STYLED COMPONENTS ============
const AboutContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #ecf0f1;
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
    opacity: 0.6;
    filter: blur(1px);
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    padding: 3rem 2rem;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 4rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    color: #ecf0f1;
    margin-bottom: 1rem;
    animation: ${neonGlow} 3s ease-in-out infinite;
    font-weight: 900;
    
    span {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #00adef 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    font-size: 1.3rem;
    color: #94a3b8;
    max-width: 800px;
    margin: 0 auto 2rem;
    line-height: 1.6;
`;

const Badge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    border: 1px solid rgba(59, 130, 246, 0.4);
    border-radius: 20px;
    color: #3b82f6;
    font-size: 0.95rem;
    font-weight: 600;
    animation: ${glow} 3s ease-in-out infinite;
`;

// ============ STATS SECTION ============
const StatsSection = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto 5rem;
    padding: 0 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    animation: ${countUp} 0.6s ease-out;
    animation-delay: ${props => props.delay}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-10px) scale(1.05);
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
    }
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    background: ${props => props.gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 3s ease-in-out infinite;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
`;

const StatValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: #3b82f6;
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.95rem;
    font-weight: 500;
`;

const LoadingPulse = styled.div`
    width: 60px;
    height: 30px;
    background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s infinite;
    border-radius: 4px;
    margin: 0 auto;
`;

// ============ CONTENT SECTIONS ============
const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 3rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
`;

const SectionCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 20px;
    padding: 3rem;
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    transition: all 0.3s ease;
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
        background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }

    &:hover {
        transform: translateY(-10px);
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
    }

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem;
    }
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    background: ${props => props.gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
    animation: ${float} 3s ease-in-out infinite;
    position: relative;
    z-index: 1;
`;

const TextContent = styled.div`
    position: relative;
    z-index: 1;
`;

const SectionTitle = styled.h2`
    margin-top: 0;
    color: #3b82f6;
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 900;
`;

const SectionText = styled.p`
    color: #cbd5e1;
    line-height: 1.8;
    font-size: 1.05rem;
`;

const FeatureList = styled.ul`
    list-style: none;
    padding: 0;
    margin-top: 1.5rem;
`;

const FeatureItem = styled.li`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #cbd5e1;
    margin-bottom: 1rem;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover {
        color: #f8fafc;
        transform: translateX(10px);
    }

    svg {
        color: #10b981;
        min-width: 20px;
    }
`;

// ============ VALUES SECTION ============
const ValuesSection = styled.div`
    max-width: 1400px;
    margin: 5rem auto;
    padding: 0 2rem;
`;

const ValuesSectionTitle = styled.h2`
    text-align: center;
    font-size: 2.5rem;
    color: #f8fafc;
    margin-bottom: 3rem;
    font-weight: 900;
    animation: ${fadeIn} 0.8s ease-out;
`;

const ValuesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ValueCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.8s ease-out;
    animation-delay: ${props => props.delay}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-10px);
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
    }
`;

const ValueIcon = styled.div`
    width: 70px;
    height: 70px;
    margin: 0 auto 1.5rem;
    background: ${props => props.gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ValueTitle = styled.h3`
    color: #3b82f6;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
`;

const ValueText = styled.p`
    color: #94a3b8;
    line-height: 1.6;
`;

// ============ HELPER FUNCTIONS ============
const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
};

const formatPercent = (num) => {
    if (num === null || num === undefined) return '--';
    return num.toFixed(1) + '%';
};

// ============ COMPONENT ============
const AboutPage = () => {
    const [particlesData, setParticlesData] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: null,
        totalPredictions: null,
        predictionAccuracy: null,
        isLoading: true
    });

    // Generate background particles on mount
    useEffect(() => {
        const newParticles = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: ['#3b82f6', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)]
        }));
        setParticlesData(newParticles);
    }, []);

    // Fetch real stats from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Use the same endpoint as PredictionsPage - this has the correct accuracy!
                const response = await axios.get(`${API_URL}/predictions/platform-stats`);
                
                if (response.data.success) {
                    setStats({
                        totalUsers: response.data.totalUsers || 0,
                        totalPredictions: response.data.totalPredictions || 0,
                        predictionAccuracy: response.data.accuracy || 0,
                        totalTrades: response.data.totalTrades || 0,
                        isLoading: false
                    });
                } else {
                    setStats(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Error fetching platform stats:', error);
                setStats(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchStats();
    }, []);

    return (
        <AboutContainer>
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
                <Header>
                    <Title>
                        Our <span>Philosophy</span>
                    </Title>
                    <Subtitle>
                        Moving beyond the black box. We believe in transparent, data-driven insights 
                        for the modern trader.
                    </Subtitle>
                    <Badge>
                        <Star size={18} />
                        Proudly Made in the USA
                    </Badge>
                </Header>

                {/* Stats Section - REAL DATA */}
                <StatsSection>
                    <StatCard delay={0.2}>
                        <StatIcon gradient="linear-gradient(135deg, #3b82f6, #2563eb)">
                            <Trophy size={32} />
                        </StatIcon>
                        <StatValue>
                            {stats.isLoading ? (
                                <LoadingPulse />
                            ) : stats.predictionAccuracy !== null ? (
                                formatPercent(stats.predictionAccuracy)
                            ) : (
                                '--'
                            )}
                        </StatValue>
                        <StatLabel>AI Prediction Accuracy</StatLabel>
                    </StatCard>
                    <StatCard delay={0.3}>
                        <StatIcon gradient="linear-gradient(135deg, #10b981, #059669)">
                            <Users size={32} />
                        </StatIcon>
                        <StatValue>
                            {stats.isLoading ? (
                                <LoadingPulse />
                            ) : (
                                formatNumber(stats.totalUsers)
                            )}
                        </StatValue>
                        <StatLabel>Active Traders</StatLabel>
                    </StatCard>
                    <StatCard delay={0.4}>
                        <StatIcon gradient="linear-gradient(135deg, #f59e0b, #d97706)">
                            <Zap size={32} />
                        </StatIcon>
                        <StatValue>
                            {stats.isLoading ? (
                                <LoadingPulse />
                            ) : (
                                formatNumber(stats.totalPredictions)
                            )}
                        </StatValue>
                        <StatLabel>AI Predictions Made</StatLabel>
                    </StatCard>
                    <StatCard delay={0.5}>
                        <StatIcon gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)">
                            <Rocket size={32} />
                        </StatIcon>
                        <StatValue>24/7</StatValue>
                        <StatLabel>Real-Time Analysis</StatLabel>
                    </StatCard>
                </StatsSection>

                {/* Content Sections */}
                <ContentGrid>
                    <SectionCard index={0} delay={0.2}>
                        <IconWrapper gradient="linear-gradient(135deg, #ef4444, #dc2626)">
                            <Target size={48} />
                        </IconWrapper>
                        <TextContent>
                            <SectionTitle>The Problem with "Black Box" AI</SectionTitle>
                            <SectionText>
                                The world of trading AI is often a mystery. Many services provide signals 
                                without explanation, leaving users guessing the "why" behind the trade. 
                                This lack of transparency creates uncertainty and prevents traders from 
                                developing their own market intuition.
                            </SectionText>
                            <FeatureList>
                                <FeatureItem>
                                    <CheckCircle size={20} />
                                    No more blind trading decisions
                                </FeatureItem>
                                <FeatureItem>
                                    <CheckCircle size={20} />
                                    Understand the reasoning behind signals
                                </FeatureItem>
                                <FeatureItem>
                                    <CheckCircle size={20} />
                                    Build your own market expertise
                                </FeatureItem>
                            </FeatureList>
                        </TextContent>
                    </SectionCard>

                    <SectionCard index={1} delay={0.4}>
                        <IconWrapper gradient="linear-gradient(135deg, #3b82f6, #2563eb)">
                            <ShieldCheck size={48} />
                        </IconWrapper>
                        <TextContent>
                            <SectionTitle>The Nexus Solution: Clarity & Confidence</SectionTitle>
                            <SectionText>
                                Nexus Signal AI is built on a foundation of clarity. Our predictions are 
                                not magic; they are the result of analyzing key technical indicators like 
                                SMA, RSI, and MACD. We show you the drivers behind each signal, empowering 
                                you to understand the rationale and trade with greater confidence.
                            </SectionText>
                            <FeatureList>
                                <FeatureItem>
                                    <CheckCircle size={20} />
                                    Transparent technical analysis
                                </FeatureItem>
                                <FeatureItem>
                                    <CheckCircle size={20} />
                                    Real-time data from trusted sources
                                </FeatureItem>
                                <FeatureItem>
                                    <CheckCircle size={20} />
                                    Advanced AI pattern recognition
                                </FeatureItem>
                            </FeatureList>
                        </TextContent>
                    </SectionCard>

                    <SectionCard index={2} delay={0.6}>
                        <IconWrapper gradient="linear-gradient(135deg, #10b981, #059669)">
                            <Users size={48} />
                        </IconWrapper>
                        <TextContent>
                            <SectionTitle>Our Team</SectionTitle>
                            <SectionText>
                                We are a passionate team of developers, data analysts, and trading 
                                enthusiasts dedicated to demystifying the market. Our background is rooted 
                                in data science and software engineering, with a shared goal of building 
                                powerful, transparent tools that give retail traders a professional edge.
                            </SectionText>
                            <FeatureList>
                                <FeatureItem>
                                    <Code size={20} />
                                    Expert software engineers
                                </FeatureItem>
                                <FeatureItem>
                                    <BarChart3 size={20} />
                                    Professional data scientists
                                </FeatureItem>
                                <FeatureItem>
                                    <TrendingUp size={20} />
                                    Experienced traders
                                </FeatureItem>
                            </FeatureList>
                        </TextContent>
                    </SectionCard>
                </ContentGrid>

                {/* Values Section */}
                <ValuesSection>
                    <ValuesSectionTitle>Our Core Values</ValuesSectionTitle>
                    <ValuesGrid>
                        <ValueCard delay={0.2}>
                            <ValueIcon gradient="linear-gradient(135deg, #3b82f6, #2563eb)">
                                <Brain size={36} />
                            </ValueIcon>
                            <ValueTitle>Innovation</ValueTitle>
                            <ValueText>
                                We constantly push the boundaries of AI technology to deliver 
                                cutting-edge trading solutions.
                            </ValueText>
                        </ValueCard>
                        <ValueCard delay={0.4}>
                            <ValueIcon gradient="linear-gradient(135deg, #10b981, #059669)">
                                <ShieldCheck size={36} />
                            </ValueIcon>
                            <ValueTitle>Transparency</ValueTitle>
                            <ValueText>
                                Every prediction comes with clear reasoning and data sources, 
                                so you always know why.
                            </ValueText>
                        </ValueCard>
                        <ValueCard delay={0.6}>
                            <ValueIcon gradient="linear-gradient(135deg, #f59e0b, #d97706)">
                                <Award size={36} />
                            </ValueIcon>
                            <ValueTitle>Excellence</ValueTitle>
                            <ValueText>
                                We strive for the highest accuracy and reliability in every 
                                signal we provide.
                            </ValueText>
                        </ValueCard>
                        <ValueCard delay={0.8}>
                            <ValueIcon gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)">
                                <Heart size={36} />
                            </ValueIcon>
                            <ValueTitle>User-Centric</ValueTitle>
                            <ValueText>
                                Your success is our success. We design every feature with 
                                traders like you in mind.
                            </ValueText>
                        </ValueCard>
                        <ValueCard delay={1.0}>
                            <ValueIcon gradient="linear-gradient(135deg, #ef4444, #dc2626)">
                                <Flame size={36} />
                            </ValueIcon>
                            <ValueTitle>Passion</ValueTitle>
                            <ValueText>
                                We're traders ourselves, and our passion for the market drives 
                                everything we build.
                            </ValueText>
                        </ValueCard>
                        <ValueCard delay={1.2}>
                            <ValueIcon gradient="linear-gradient(135deg, #00adef, #0088cc)">
                                <Sparkles size={36} />
                            </ValueIcon>
                            <ValueTitle>Empowerment</ValueTitle>
                            <ValueText>
                                We believe in giving every trader the tools to make informed, 
                                confident decisions.
                            </ValueText>
                        </ValueCard>
                    </ValuesGrid>
                </ValuesSection>
            </ContentWrapper>
        </AboutContainer>
    );
};

export default AboutPage;