// client/src/components/Footer.js - THE MOST LEGENDARY FOOTER
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { 
    Mail, Send, Twitter, Linkedin, Github, MessageSquare, 
    TrendingUp, Zap, Brain, Sparkles, ChevronRight, Star,
    Instagram, Facebook, Youtube
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
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100px) translateX(30px) scale(0); opacity: 0; }
`;

const neonGlow = keyframes`
    0%, 100% {
        text-shadow: 
            0 0 10px rgba(59, 130, 246, 0.8),
            0 0 20px rgba(59, 130, 246, 0.6);
    }
    50% {
        text-shadow: 
            0 0 20px rgba(59, 130, 246, 1),
            0 0 40px rgba(59, 130, 246, 0.8);
    }
`;

// ============ STYLED COMPONENTS ============
const FooterContainer = styled.footer`
    width: 100%;
    background: linear-gradient(180deg, #0a0e27 0%, #1a1f3a 100%);
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
    opacity: 0.4;
`;

const FooterContent = styled.div`
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 4rem 2rem 2rem;
    position: relative;
    z-index: 1;
    animation: ${fadeIn} 0.8s ease-out;
`;

const FooterGrid = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: 3rem;
    margin-bottom: 3rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
`;

const FooterSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const BrandSection = styled(FooterSection)`
    gap: 1.5rem;
`;

const Logo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.8rem;
    font-weight: 900;
    color: #3b82f6;
    animation: ${neonGlow} 3s ease-in-out infinite;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
`;

const LogoIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const BrandText = styled.p`
    color: #94a3b8;
    line-height: 1.6;
    font-size: 0.95rem;
`;

const SocialIcons = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const SocialIcon = styled.a`
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%);
        border-color: #3b82f6;
        transform: translateY(-5px) scale(1.1);
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
    }
`;

const SectionTitle = styled.h3`
    color: #f8fafc;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const FooterLink = styled(Link)`
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;

    &:hover {
        color: #3b82f6;
        transform: translateX(5px);
    }
`;

const ExternalLink = styled.a`
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;

    &:hover {
        color: #3b82f6;
        transform: translateX(5px);
    }
`;

const NewsletterSection = styled(FooterSection)`
    gap: 1rem;
`;

const NewsletterText = styled.p`
    color: #94a3b8;
    font-size: 0.9rem;
    line-height: 1.5;
`;

const NewsletterForm = styled.form`
    display: flex;
    gap: 0.5rem;
    position: relative;
`;

const EmailInput = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #f8fafc;
    font-size: 0.95rem;
    transition: all 0.3s ease;

    &::placeholder {
        color: #64748b;
    }

    &:focus {
        outline: none;
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.15);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
`;

const SubscribeButton = styled.button`
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

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
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
    }

    &:active {
        transform: translateY(-1px);
    }
`;

const FooterBottom = styled.div`
    border-top: 1px solid rgba(59, 130, 246, 0.2);
    padding-top: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

const Copyright = styled.p`
    color: #94a3b8;
    font-size: 0.9rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MadeWithLove = styled.span`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #ef4444;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const LegalLinks = styled.div`
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const LegalLink = styled(Link)`
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
        color: #3b82f6;
    }
`;

const Badge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 20px;
    color: #10b981;
    font-size: 0.85rem;
    font-weight: 600;
    animation: ${glow} 3s ease-in-out infinite;
`;

const FeatureHighlight = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #cbd5e1;
    font-size: 0.9rem;
    padding: 0.5rem 0;
    transition: all 0.3s ease;

    &:hover {
        color: #f8fafc;
        transform: translateX(5px);
    }

    svg {
        color: #3b82f6;
        min-width: 18px;
    }
`;

// ============ COMPONENT ============
const Footer = () => {
    const [email, setEmail] = useState('');
    const [particles, setParticles] = useState([]);

    // Generate background particles on mount
    useEffect(() => {
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            size: Math.random() * 3 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 8 + 8,
            delay: Math.random() * 5,
            color: ['#3b82f6', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)]
        }));
        setParticles(newParticles);
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        // TODO: Implement newsletter subscription
        console.log('Subscribe:', email);
        alert('Thanks for subscribing! 🎉');
        setEmail('');
    };

    const currentYear = new Date().getFullYear();

    return (
        <FooterContainer>
            {/* Animated Background Particles */}
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
            </ParticleContainer>

            <FooterContent>
                <FooterGrid>
                    {/* Brand Section */}
                    <BrandSection>
                        <Logo>
                            <LogoIcon>
                                <Brain size={32} />
                            </LogoIcon>
                            Nexus Signal.AI
                        </Logo>
                        <BrandText>
                            Empowering traders with cutting-edge AI technology. 
                            Get real-time insights, predictions, and market analysis 
                            to stay ahead of the game.
                        </BrandText>
                        <Badge>
                            <Star size={14} />
                            Made in the USA
                        </Badge>
                        <SocialIcons>
                            <SocialIcon href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                <Twitter size={20} />
                            </SocialIcon>
                            <SocialIcon href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                                <Linkedin size={20} />
                            </SocialIcon>
                            <SocialIcon href="https://github.com" target="_blank" rel="noopener noreferrer">
                                <Github size={20} />
                            </SocialIcon>
                            <SocialIcon href="https://discord.com" target="_blank" rel="noopener noreferrer">
                                <MessageSquare size={20} />
                            </SocialIcon>
                            <SocialIcon href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <Instagram size={20} />
                            </SocialIcon>
                            <SocialIcon href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                                <Youtube size={20} />
                            </SocialIcon>
                        </SocialIcons>
                    </BrandSection>

                    {/* Product Section */}
                    <FooterSection>
                        <SectionTitle>
                            <Zap size={18} />
                            Product
                        </SectionTitle>
                        <FooterLink to="/predictions">
                            <ChevronRight size={16} />
                            AI Predictions
                        </FooterLink>
                        <FooterLink to="/chat">
                            <ChevronRight size={16} />
                            AI Chat
                        </FooterLink>
                        <FooterLink to="/pricing">
                            <ChevronRight size={16} />
                            Pricing
                        </FooterLink>
                        <FooterLink to="/features">
                            <ChevronRight size={16} />
                            Features
                        </FooterLink>
                        <ExternalLink href="/api-docs" target="_blank">
                            <ChevronRight size={16} />
                            API Docs
                        </ExternalLink>
                    </FooterSection>

                    {/* Company Section */}
                    <FooterSection>
                        <SectionTitle>
                            <TrendingUp size={18} />
                            Company
                        </SectionTitle>
                        <FooterLink to="/about">
                            <ChevronRight size={16} />
                            About Us
                        </FooterLink>
                        <FooterLink to="/blog">
                            <ChevronRight size={16} />
                            Blog
                        </FooterLink>
                        <FooterLink to="/careers">
                            <ChevronRight size={16} />
                            Careers
                        </FooterLink>
                        <FooterLink to="/contact">
                            <ChevronRight size={16} />
                            Contact
                        </FooterLink>
                        <ExternalLink href="/press" target="_blank">
                            <ChevronRight size={16} />
                            Press Kit
                        </ExternalLink>
                    </FooterSection>

                    {/* Newsletter Section */}
                    <NewsletterSection>
                        <SectionTitle>
                            <Sparkles size={18} />
                            Stay Updated
                        </SectionTitle>
                        <NewsletterText>
                            Get the latest market insights, AI predictions, and exclusive 
                            trading tips delivered to your inbox.
                        </NewsletterText>
                        <NewsletterForm onSubmit={handleSubscribe}>
                            <EmailInput
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <SubscribeButton type="submit">
                                <Send size={18} />
                            </SubscribeButton>
                        </NewsletterForm>
                        <FeatureHighlight>
                            <Sparkles size={16} />
                            Weekly market insights
                        </FeatureHighlight>
                        <FeatureHighlight>
                            <Zap size={16} />
                            Exclusive AI predictions
                        </FeatureHighlight>
                    </NewsletterSection>
                </FooterGrid>

                <FooterBottom>
                    <Copyright>
                        © {currentYear} NexusSignal.AI. All rights reserved.
                        <MadeWithLove>
                            Made with ❤️ in the USA
                        </MadeWithLove>
                    </Copyright>
                    <LegalLinks>
                        <LegalLink to="/terms">Terms of Service</LegalLink>
                        <LegalLink to="/privacy">Privacy Policy</LegalLink>
                        <LegalLink to="/disclaimer">Disclaimer</LegalLink>
                        <LegalLink to="/cookie-policy">Cookie Policy</LegalLink>
                    </LegalLinks>
                </FooterBottom>
            </FooterContent>
        </FooterContainer>
    );
};

export default Footer;