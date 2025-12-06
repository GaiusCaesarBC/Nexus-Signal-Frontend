// client/src/pages/WhitepaperPage.js - Nexus Signal Whitepaper
import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FileText, Target, Rocket, Shield, Brain, Trophy, Users,
    Zap, Lock, Code, Calendar, MessageCircle, AlertTriangle,
    CheckCircle, Star, TrendingUp, Coins, BarChart3, Award,
    Sparkles, Globe, Heart
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const pulseGlow = keyframes`
    0%, 100% {
        text-shadow:
            0 0 10px rgba(59, 130, 246, 0.8),
            0 0 20px rgba(59, 130, 246, 0.5);
    }
    50% {
        text-shadow:
            0 0 20px rgba(59, 130, 246, 1),
            0 0 40px rgba(59, 130, 246, 0.7);
    }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: #ecf0f1;
    position: relative;
    overflow: hidden;
`;

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
    opacity: 0.5;
    filter: blur(1px);
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 3rem 2rem 5rem;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 4rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

    svg {
        width: 60px;
        height: 60px;
        color: #3b82f6;
        animation: ${float} 3s ease-in-out infinite;
    }
`;

const Title = styled.h1`
    font-size: 3.5rem;
    font-weight: 900;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${pulseGlow} 3s ease-in-out infinite;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Tagline = styled.p`
    font-size: 1.5rem;
    color: #94a3b8;
    margin-bottom: 1rem;
    font-weight: 300;
`;

const VersionBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    padding: 0.5rem 1.5rem;
    border-radius: 30px;
    font-size: 0.9rem;
    color: #3b82f6;
    margin-bottom: 2rem;
`;

const TableOfContents = styled.div`
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 4rem;
    border: 1px solid rgba(59, 130, 246, 0.2);
    animation: ${fadeIn} 0.8s ease-out 0.2s backwards;
`;

const TOCTitle = styled.h3`
    font-size: 1.3rem;
    color: #3b82f6;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TOCList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
`;

const TOCItem = styled.a`
    color: #94a3b8;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;

    &:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        transform: translateX(5px);
    }

    svg {
        width: 16px;
        height: 16px;
        opacity: 0.7;
    }
`;

const Section = styled.section`
    margin-bottom: 4rem;
    animation: ${fadeIn} 0.8s ease-out;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(59, 130, 246, 0.3);
`;

const SectionIcon = styled.div`
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(59, 130, 246, 0.3);

    svg {
        width: 24px;
        height: 24px;
        color: #3b82f6;
    }
`;

const SectionTitle = styled.h2`
    font-size: 2rem;
    color: #ecf0f1;
    font-weight: 700;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const Paragraph = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 1.5rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SubSection = styled.div`
    margin: 2rem 0;
`;

const SubTitle = styled.h3`
    font-size: 1.4rem;
    color: #ecf0f1;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        width: 20px;
        height: 20px;
        color: #3b82f6;
    }
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
`;

const FeatureCard = styled.div`
    background: rgba(30, 41, 59, 0.5);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid rgba(59, 130, 246, 0.15);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(59, 130, 246, 0.4);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
`;

const FeatureTitle = styled.h4`
    color: #ecf0f1;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        width: 18px;
        height: 18px;
        color: #3b82f6;
    }
`;

const FeatureText = styled.p`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.6;
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 1.5rem 0;
`;

const ListItem = styled.li`
    color: #94a3b8;
    font-size: 1.05rem;
    padding: 0.75rem 0;
    padding-left: 2rem;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    &:last-child {
        border-bottom: none;
    }

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        border-radius: 50%;
    }
`;

const BadgeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
`;

const RarityBadge = styled.div`
    background: ${props => props.gradient || 'rgba(30, 41, 59, 0.5)'};
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);

    h5 {
        color: #ecf0f1;
        font-size: 1rem;
        margin-bottom: 0.25rem;
    }

    p {
        color: #94a3b8;
        font-size: 0.85rem;
    }
`;

const HighlightBox = styled.div`
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border-left: 4px solid #3b82f6;
    border-radius: 0 12px 12px 0;
    padding: 1.5rem;
    margin: 2rem 0;
`;

const HighlightTitle = styled.h4`
    color: #3b82f6;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const WarningBox = styled.div`
    background: rgba(245, 158, 11, 0.1);
    border-left: 4px solid #f59e0b;
    border-radius: 0 12px 12px 0;
    padding: 1.5rem;
    margin: 2rem 0;
`;

const WarningTitle = styled.h4`
    color: #f59e0b;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RoadmapContainer = styled.div`
    margin: 2rem 0;
`;

const RoadmapPhase = styled.div`
    background: rgba(30, 41, 59, 0.5);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(59, 130, 246, 0.2);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        left: 1.5rem;
        top: 100%;
        width: 2px;
        height: 1.5rem;
        background: linear-gradient(180deg, #3b82f6 0%, transparent 100%);
    }

    &:last-child::before {
        display: none;
    }
`;

const PhaseHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const PhaseBadge = styled.span`
    background: ${props => props.current ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'rgba(59, 130, 246, 0.2)'};
    color: ${props => props.current ? '#fff' : '#3b82f6'};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
`;

const PhaseTitle = styled.h4`
    color: #ecf0f1;
    font-size: 1.2rem;
`;

const LaunchDate = styled.div`
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    margin: 2rem 0;

    h4 {
        color: #10b981;
        font-size: 1rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    p {
        color: #ecf0f1;
        font-size: 2rem;
        font-weight: 700;
    }
`;

const SocialLinks = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1.5rem 0;
`;

const SocialLink = styled.a`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 12px;
    padding: 0.75rem 1.25rem;
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
        color: #3b82f6;
        transform: translateY(-2px);
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

const DisclaimerBox = styled.div`
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin-top: 3rem;
`;

const DisclaimerTitle = styled.h4`
    color: #ef4444;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const DisclaimerText = styled.p`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.7;
    margin-bottom: 1rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Footer = styled.div`
    text-align: center;
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Copyright = styled.p`
    color: #64748b;
    font-size: 0.9rem;
`;

// Generate particles
const generateParticles = (count) => {
    const particleColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        left: Math.random() * 100
    }));
};

const WhitepaperPage = () => {
    const particles_data = generateParticles(30);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <PageContainer>
            <ParticleContainer>
                {particles_data.map(p => (
                    <Particle
                        key={p.id}
                        size={p.size}
                        color={p.color}
                        duration={p.duration}
                        delay={p.delay}
                        left={p.left}
                    />
                ))}
            </ParticleContainer>

            <ContentWrapper>
                <Header>
                    <LogoContainer>
                        <FileText />
                    </LogoContainer>
                    <Title>NEXUS SIGNAL</Title>
                    <Tagline>The Future of Social Paper Trading</Tagline>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '1rem' }}>
                        Learn. Trade. Compete. Connect.
                    </p>
                    <VersionBadge>
                        <Calendar size={16} />
                        Version 1.0 | December 2025
                    </VersionBadge>
                </Header>

                {/* Table of Contents */}
                <TableOfContents>
                    <TOCTitle><FileText size={20} /> Table of Contents</TOCTitle>
                    <TOCList>
                        <TOCItem href="#executive-summary"><CheckCircle /> Executive Summary</TOCItem>
                        <TOCItem href="#vision-mission"><Target /> Vision & Mission</TOCItem>
                        <TOCItem href="#platform-overview"><Rocket /> Platform Overview</TOCItem>
                        <TOCItem href="#ai-predictions"><Brain /> AI-Powered Predictions</TOCItem>
                        <TOCItem href="#gamification"><Trophy /> Gamification System</TOCItem>
                        <TOCItem href="#social-features"><Users /> Social Features</TOCItem>
                        <TOCItem href="#subscriptions"><Star /> Subscription Tiers</TOCItem>
                        <TOCItem href="#security"><Shield /> Security & Privacy</TOCItem>
                        <TOCItem href="#technology"><Code /> Technology Stack</TOCItem>
                        <TOCItem href="#roadmap"><Calendar /> Development Roadmap</TOCItem>
                        <TOCItem href="#team"><Heart /> About the Team</TOCItem>
                        <TOCItem href="#disclaimer"><AlertTriangle /> Legal Disclaimer</TOCItem>
                    </TOCList>
                </TableOfContents>

                {/* Executive Summary */}
                <Section id="executive-summary">
                    <SectionHeader>
                        <SectionIcon><Sparkles /></SectionIcon>
                        <SectionTitle>Executive Summary</SectionTitle>
                    </SectionHeader>
                    <Paragraph>
                        Nexus Signal is a revolutionary social paper trading platform that combines the thrill of market speculation with the safety of simulated trading. Our platform empowers users to learn financial markets, test strategies, and compete with others—all without risking real capital.
                    </Paragraph>
                    <Paragraph>
                        By integrating AI-powered price predictions, comprehensive gamification systems, and robust social features, Nexus Signal creates an engaging environment where traders of all experience levels can develop their skills, track their progress, and connect with a community of like-minded individuals.
                    </Paragraph>
                    <Paragraph>
                        With support for both traditional stocks and cryptocurrencies, real-time market data integration, and a tiered subscription model, Nexus Signal is positioned to become the premier destination for aspiring traders and market enthusiasts worldwide.
                    </Paragraph>
                </Section>

                {/* Vision & Mission */}
                <Section id="vision-mission">
                    <SectionHeader>
                        <SectionIcon><Target /></SectionIcon>
                        <SectionTitle>Vision & Mission</SectionTitle>
                    </SectionHeader>

                    <SubSection>
                        <SubTitle><Star /> Our Vision</SubTitle>
                        <Paragraph>
                            To democratize trading education and create a global community where anyone can learn to navigate financial markets confidently, without the fear of financial loss.
                        </Paragraph>
                    </SubSection>

                    <SubSection>
                        <SubTitle><Rocket /> Our Mission</SubTitle>
                        <Paragraph>
                            Nexus Signal exists to bridge the gap between theoretical market knowledge and practical trading experience. We believe that everyone deserves access to tools that help them understand how markets work, test their ideas, and learn from both successes and failures in a risk-free environment.
                        </Paragraph>
                    </SubSection>

                    <SubSection>
                        <SubTitle><AlertTriangle /> The Problem We Solve</SubTitle>
                        <Paragraph>Traditional approaches to learning how to trade are fraught with challenges:</Paragraph>
                        <List>
                            <ListItem>High barrier to entry with real capital requirements</ListItem>
                            <ListItem>Emotional decision-making when real money is at stake</ListItem>
                            <ListItem>Lack of community support and shared learning experiences</ListItem>
                            <ListItem>No structured progression or achievement systems</ListItem>
                            <ListItem>Overwhelming complexity without guided learning paths</ListItem>
                        </List>
                        <Paragraph>
                            Nexus Signal addresses each of these pain points by providing a comprehensive, gamified, and social paper trading experience.
                        </Paragraph>
                    </SubSection>
                </Section>

                {/* Platform Overview */}
                <Section id="platform-overview">
                    <SectionHeader>
                        <SectionIcon><Rocket /></SectionIcon>
                        <SectionTitle>Platform Overview</SectionTitle>
                    </SectionHeader>

                    <SubSection>
                        <SubTitle>Core Features</SubTitle>
                        <FeatureGrid>
                            <FeatureCard>
                                <FeatureTitle><TrendingUp /> Paper Trading Engine</FeatureTitle>
                                <FeatureText>
                                    Our paper trading engine provides a realistic simulation of market conditions, allowing users to execute buy and sell orders, manage portfolios, and track performance over time.
                                </FeatureText>
                            </FeatureCard>
                            <FeatureCard>
                                <FeatureTitle><BarChart3 /> Real Portfolio Tracking</FeatureTitle>
                                <FeatureText>
                                    For users who also trade with real capital, Nexus Signal offers portfolio tracking capabilities to manage and analyze both paper and real portfolios in one unified interface.
                                </FeatureText>
                            </FeatureCard>
                            <FeatureCard>
                                <FeatureTitle><Coins /> Multi-Asset Support</FeatureTitle>
                                <FeatureText>
                                    Support for stocks and ETFs via Yahoo Finance integration, cryptocurrencies via CoinGecko Pro and Binance APIs, with thousands of tradeable assets.
                                </FeatureText>
                            </FeatureCard>
                        </FeatureGrid>
                    </SubSection>
                </Section>

                {/* AI-Powered Predictions */}
                <Section id="ai-predictions">
                    <SectionHeader>
                        <SectionIcon><Brain /></SectionIcon>
                        <SectionTitle>AI-Powered Price Predictions</SectionTitle>
                    </SectionHeader>

                    <Paragraph>
                        Nexus Signal integrates artificial intelligence to provide users with price prediction insights. Our AI system analyzes market data, historical patterns, and various technical indicators to generate predictions that help inform trading decisions.
                    </Paragraph>

                    <SubSection>
                        <SubTitle><Zap /> How It Works</SubTitle>
                        <Paragraph>Our prediction engine utilizes multiple data sources and analytical approaches:</Paragraph>
                        <List>
                            <ListItem>Historical price data analysis and pattern recognition</ListItem>
                            <ListItem>Technical indicator computation and trend analysis</ListItem>
                            <ListItem>Volume and market sentiment evaluation</ListItem>
                            <ListItem>Machine learning models trained on market behavior</ListItem>
                        </List>
                    </SubSection>

                    <WarningBox>
                        <WarningTitle><AlertTriangle /> Important Disclaimer</WarningTitle>
                        <Paragraph style={{ marginBottom: 0 }}>
                            AI predictions are provided for educational and informational purposes only. They should not be considered financial advice, and past performance of predictions does not guarantee future accuracy. Users should always conduct their own research before making any trading decisions.
                        </Paragraph>
                    </WarningBox>
                </Section>

                {/* Gamification System */}
                <Section id="gamification">
                    <SectionHeader>
                        <SectionIcon><Trophy /></SectionIcon>
                        <SectionTitle>Gamification System</SectionTitle>
                    </SectionHeader>

                    <Paragraph>
                        At the heart of Nexus Signal's engagement strategy is a comprehensive gamification system designed to reward consistent participation, celebrate achievements, and foster healthy competition among users.
                    </Paragraph>

                    <FeatureGrid>
                        <FeatureCard>
                            <FeatureTitle><Calendar /> Daily Login Rewards</FeatureTitle>
                            <FeatureText>
                                Users are rewarded for daily engagement through our streak-based login system. Consecutive daily logins unlock increasingly valuable rewards, encouraging consistent platform usage.
                            </FeatureText>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureTitle><Award /> Achievement Badges</FeatureTitle>
                            <FeatureText>
                                Our achievement system features 31 unique badges distributed across six rarity tiers, with animated effects and particle systems that bring achievements to life.
                            </FeatureText>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureTitle><TrendingUp /> Competitive Leaderboards</FeatureTitle>
                            <FeatureText>
                                Multiple leaderboards track and rank user performance across different metrics, with separate boards for paper trading and real portfolio tracking.
                            </FeatureText>
                        </FeatureCard>
                    </FeatureGrid>

                    <SubSection>
                        <SubTitle><Star /> Badge Rarity Tiers</SubTitle>
                        <BadgeGrid>
                            <RarityBadge gradient="linear-gradient(135deg, rgba(156, 163, 175, 0.2) 0%, rgba(107, 114, 128, 0.2) 100%)">
                                <h5>Common</h5>
                                <p>Entry-level achievements</p>
                            </RarityBadge>
                            <RarityBadge gradient="linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)">
                                <h5>Uncommon</h5>
                                <p>Moderate milestones</p>
                            </RarityBadge>
                            <RarityBadge gradient="linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)">
                                <h5>Rare</h5>
                                <p>Significant accomplishments</p>
                            </RarityBadge>
                            <RarityBadge gradient="linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)">
                                <h5>Epic</h5>
                                <p>Advanced achievements</p>
                            </RarityBadge>
                            <RarityBadge gradient="linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)">
                                <h5>Legendary</h5>
                                <p>Elite status</p>
                            </RarityBadge>
                            <RarityBadge gradient="linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)">
                                <h5>Mythic</h5>
                                <p>The rarest achievements</p>
                            </RarityBadge>
                        </BadgeGrid>
                    </SubSection>
                </Section>

                {/* Social Features */}
                <Section id="social-features">
                    <SectionHeader>
                        <SectionIcon><Users /></SectionIcon>
                        <SectionTitle>Social Features</SectionTitle>
                    </SectionHeader>

                    <Paragraph>
                        Nexus Signal is built around community. Our social features enable users to connect, share insights, and learn from each other's experiences. The platform fosters a supportive environment where both beginners and experienced traders can grow together.
                    </Paragraph>

                    <FeatureGrid>
                        <FeatureCard>
                            <FeatureTitle><Users /> User Profiles</FeatureTitle>
                            <FeatureText>
                                Each user has a comprehensive profile showcasing their achievements, trading statistics, badges earned, leaderboard rankings, and historical performance metrics.
                            </FeatureText>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureTitle><MessageCircle /> Discord Community</FeatureTitle>
                            <FeatureText>
                                Our official Discord server serves as a hub for community interaction. Users can discuss strategies, share trade ideas, and participate in events.
                            </FeatureText>
                        </FeatureCard>
                    </FeatureGrid>
                </Section>

                {/* Subscription Tiers */}
                <Section id="subscriptions">
                    <SectionHeader>
                        <SectionIcon><Star /></SectionIcon>
                        <SectionTitle>Subscription Tiers</SectionTitle>
                    </SectionHeader>

                    <Paragraph>
                        Nexus Signal operates on a freemium model with multiple subscription tiers designed to serve users at every level of their trading journey.
                    </Paragraph>

                    <FeatureGrid>
                        <FeatureCard>
                            <FeatureTitle><CheckCircle /> Free Tier</FeatureTitle>
                            <FeatureText>
                                Basic paper trading functionality, limited asset selection, achievement system access, community features, and daily login rewards.
                            </FeatureText>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureTitle><Zap /> Premium Tiers</FeatureTitle>
                            <FeatureText>
                                Full AI prediction access, expanded asset coverage, real portfolio tracking, advanced analytics, priority support, and exclusive badges.
                            </FeatureText>
                        </FeatureCard>
                    </FeatureGrid>

                    <HighlightBox>
                        <HighlightTitle><Star /> Detailed Pricing</HighlightTitle>
                        <Paragraph style={{ marginBottom: 0 }}>
                            Detailed pricing and tier comparisons are available on the platform's pricing page.
                        </Paragraph>
                    </HighlightBox>
                </Section>

                {/* Security & Privacy */}
                <Section id="security">
                    <SectionHeader>
                        <SectionIcon><Shield /></SectionIcon>
                        <SectionTitle>Security & Privacy</SectionTitle>
                    </SectionHeader>

                    <Paragraph>
                        User privacy and data security are paramount at Nexus Signal. We implement industry-standard security measures to protect user information and ensure a safe trading environment.
                    </Paragraph>

                    <SubSection>
                        <SubTitle><Lock /> Data Protection</SubTitle>
                        <List>
                            <ListItem>Encrypted data transmission and storage</ListItem>
                            <ListItem>Secure authentication systems</ListItem>
                            <ListItem>Regular security audits and updates</ListItem>
                            <ListItem>Compliance with data protection regulations</ListItem>
                        </List>
                    </SubSection>

                    <SubSection>
                        <SubTitle><Shield /> Privacy by Design</SubTitle>
                        <Paragraph>
                            All user data remains private and protected behind authentication. Unlike some platforms that expose user activity publicly, Nexus Signal ensures that trading data, portfolio information, and personal details are only accessible to the individual user. No user information is displayed publicly without explicit consent.
                        </Paragraph>
                    </SubSection>
                </Section>

                {/* Technology Stack */}
                <Section id="technology">
                    <SectionHeader>
                        <SectionIcon><Code /></SectionIcon>
                        <SectionTitle>Technology Stack</SectionTitle>
                    </SectionHeader>

                    <Paragraph>
                        Nexus Signal is built on modern, scalable technologies designed for performance and reliability.
                    </Paragraph>

                    <FeatureGrid>
                        <FeatureCard>
                            <FeatureTitle><Code /> Core Technologies</FeatureTitle>
                            <FeatureText>
                                Frontend: React.js with modern UI components and responsive design. Backend: Node.js with Express for robust API development. Database: MongoDB for flexible, scalable data storage.
                            </FeatureText>
                        </FeatureCard>
                        <FeatureCard>
                            <FeatureTitle><Globe /> Data Providers</FeatureTitle>
                            <FeatureText>
                                CoinGecko Pro for comprehensive cryptocurrency market data, Binance API for real-time crypto price feeds, Yahoo Finance for stock and ETF market data.
                            </FeatureText>
                        </FeatureCard>
                    </FeatureGrid>
                </Section>

                {/* Development Roadmap */}
                <Section id="roadmap">
                    <SectionHeader>
                        <SectionIcon><Calendar /></SectionIcon>
                        <SectionTitle>Development Roadmap</SectionTitle>
                    </SectionHeader>

                    <RoadmapContainer>
                        <RoadmapPhase>
                            <PhaseHeader>
                                <PhaseBadge current>Current</PhaseBadge>
                                <PhaseTitle>Phase 1: Foundation</PhaseTitle>
                            </PhaseHeader>
                            <List>
                                <ListItem>Core paper trading engine development</ListItem>
                                <ListItem>User authentication and profile systems</ListItem>
                                <ListItem>Gamification system implementation</ListItem>
                                <ListItem>API integrations (CoinGecko, Binance, Yahoo Finance)</ListItem>
                                <ListItem>Achievement and leaderboard systems</ListItem>
                            </List>
                        </RoadmapPhase>

                        <RoadmapPhase>
                            <PhaseHeader>
                                <PhaseBadge>Q1 2026</PhaseBadge>
                                <PhaseTitle>Phase 2: Enhancement</PhaseTitle>
                            </PhaseHeader>
                            <List>
                                <ListItem>AI prediction system refinement</ListItem>
                                <ListItem>Advanced analytics dashboard</ListItem>
                                <ListItem>Social features expansion</ListItem>
                                <ListItem>Mobile optimization</ListItem>
                            </List>
                        </RoadmapPhase>

                        <RoadmapPhase>
                            <PhaseHeader>
                                <PhaseBadge>Q2-Q3 2026</PhaseBadge>
                                <PhaseTitle>Phase 3: Scale</PhaseTitle>
                            </PhaseHeader>
                            <List>
                                <ListItem>Community features and social trading</ListItem>
                                <ListItem>Educational content integration</ListItem>
                                <ListItem>Tournament and competition systems</ListItem>
                                <ListItem>Platform API for third-party integrations</ListItem>
                            </List>
                        </RoadmapPhase>
                    </RoadmapContainer>

                    <LaunchDate>
                        <h4>Official Launch Date</h4>
                        <p>March 2026</p>
                    </LaunchDate>
                </Section>

                {/* About the Team */}
                <Section id="team">
                    <SectionHeader>
                        <SectionIcon><Heart /></SectionIcon>
                        <SectionTitle>About the Team</SectionTitle>
                    </SectionHeader>

                    <Paragraph>
                        Nexus Signal is developed by a passionate team dedicated to making financial education accessible and engaging. We combine expertise in software development, financial markets, and user experience design to create a platform that truly serves our users' needs.
                    </Paragraph>

                    <SubSection>
                        <SubTitle><MessageCircle /> Connect With Us</SubTitle>
                        <Paragraph>Join our community and stay updated on development progress:</Paragraph>
                        <SocialLinks>
                            <SocialLink href="https://discord.gg/H2UJ6J8n" target="_blank" rel="noopener noreferrer">
                                <MessageCircle /> Join Discord Community
                            </SocialLink>
                            <SocialLink href="https://x.com/NexusSignalAI" target="_blank" rel="noopener noreferrer">
                                <Globe /> Follow on Twitter/X
                            </SocialLink>
                            <SocialLink href="https://nexussignal.ai" target="_blank" rel="noopener noreferrer">
                                <Globe /> Visit nexussignal.ai
                            </SocialLink>
                        </SocialLinks>
                    </SubSection>

                    <HighlightBox>
                        <HighlightTitle><Heart /> Thank You</HighlightTitle>
                        <Paragraph style={{ marginBottom: 0 }}>
                            Thank you for your interest in Nexus Signal. Together, we're building the future of trading education.
                        </Paragraph>
                    </HighlightBox>
                </Section>

                {/* Legal Disclaimer */}
                <Section id="disclaimer">
                    <DisclaimerBox>
                        <DisclaimerTitle><AlertTriangle /> Legal Disclaimer</DisclaimerTitle>
                        <DisclaimerText>
                            This whitepaper is for informational purposes only and does not constitute financial advice, investment recommendations, or a solicitation to buy, sell, or hold any securities or cryptocurrencies.
                        </DisclaimerText>
                        <DisclaimerText>
                            Nexus Signal is a paper trading platform designed for educational purposes. All trading performed on the platform uses simulated funds and does not involve real money unless specifically enabled through real portfolio tracking features.
                        </DisclaimerText>
                        <DisclaimerText>
                            AI predictions provided by the platform are generated by machine learning models and should not be relied upon as accurate forecasts of future market performance. Past performance of predictions does not guarantee future results.
                        </DisclaimerText>
                        <DisclaimerText>
                            Users should conduct their own research and consult with qualified financial advisors before making any investment decisions. Trading in financial markets involves substantial risk of loss and is not suitable for all investors.
                        </DisclaimerText>
                        <DisclaimerText>
                            The information contained in this whitepaper is subject to change without notice. Nexus Signal reserves the right to modify features, pricing, and platform specifications at any time.
                        </DisclaimerText>
                    </DisclaimerBox>
                </Section>

                <Footer>
                    <Copyright>&copy; 2025 Nexus Signal. All rights reserved.</Copyright>
                </Footer>
            </ContentWrapper>
        </PageContainer>
    );
};

export default WhitepaperPage;
