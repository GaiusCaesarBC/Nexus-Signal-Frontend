// client/src/pages/PricingPage.js - WITH WORKING STRIPE CHECKOUT
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Check, Zap, Crown, Star, Rocket, Sparkles, TrendingUp, Shield, Award } from 'lucide-react';
import nexusSignalLogo from '../assets/nexus-signal-logo.png';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
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

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
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

// ============ STYLED COMPONENTS ============
const PricingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #f8fafc;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-bottom: 4rem;
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
    opacity: 0.6;
    filter: blur(1px);
`;

const HeaderLogo = styled.img`
    width: 80px;
    height: 80px;
    margin-bottom: 2rem;
    animation: ${float} 3s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8));
    cursor: pointer;
    transition: transform 0.3s ease;
    z-index: 1;

    &:hover {
        transform: scale(1.1) rotate(5deg);
    }
`;

const Title = styled.h1`
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    color: #f8fafc;
    text-align: center;
    line-height: 1.2;
    animation: ${fadeIn} 1s ease-out 0.2s backwards, ${neonGlow} 3s ease-in-out infinite;
    z-index: 1;
    
    strong {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #f97316 100%);
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
    margin-bottom: 3.5rem;
    max-width: 900px;
    text-align: center;
    line-height: 1.6;
    animation: ${fadeIn} 1.2s ease-out 0.4s backwards;
    z-index: 1;

    @media (max-width: 768px) {
        font-size: 1.1rem;
        margin-bottom: 2.5rem;
    }
`;

const PricingCards = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    max-width: 1600px;
    width: 100%;
    z-index: 2;
    padding: 0 1rem;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    text-align: center;
    transition: all 0.4s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 600px;
    animation: ${fadeIn} 1s ease-out forwards;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }

    &:hover {
        transform: translateY(-15px) scale(1.02);
    }

    ${props => props.planType === 'starter' && `
        border: 2px solid #10b981;
        animation-delay: 0.2s;
        
        &:hover {
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.6), 0 15px 50px rgba(0, 0, 0, 0.6);
        }
    `}

    ${props => props.planType === 'pro' && `
        border: 2px solid #3b82f6;
        animation-delay: 0.4s;
        
        &:hover {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 15px 50px rgba(0, 0, 0, 0.6);
        }
    `}

    ${props => props.planType === 'premium' && `
        border: 2px solid #f97316;
        animation-delay: 0.6s;
        box-shadow: 0 0 30px rgba(249, 115, 22, 0.5), 0 10px 40px rgba(0, 0, 0, 0.5);
        
        &:hover {
            box-shadow: 0 0 50px rgba(249, 115, 22, 0.8), 0 20px 60px rgba(0, 0, 0, 0.7);
        }
    `}

    ${props => props.planType === 'elite' && `
        border: 2px solid #8b5cf6;
        animation-delay: 0.8s;
        box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 10px 40px rgba(0, 0, 0, 0.5);
        
        &:hover {
            box-shadow: 0 0 50px rgba(139, 92, 246, 0.8), 0 20px 60px rgba(0, 0, 0, 0.7);
        }
    `}
`;

const PlanHeader = styled.div`
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
`;

const PlanIconWrapper = styled.div`
    width: 70px;
    height: 70px;
    margin: 0 auto 1.5rem;
    background: ${props => {
        if (props.planType === 'starter') return 'linear-gradient(135deg, #10b981, #059669)';
        if (props.planType === 'pro') return 'linear-gradient(135deg, #3b82f6, #2563eb)';
        if (props.planType === 'premium') return 'linear-gradient(135deg, #f97316, #ea580c)';
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    }};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 3s ease-in-out infinite, ${pulse} 2s ease-in-out infinite;
    box-shadow: ${props => {
        if (props.planType === 'starter') return '0 10px 30px rgba(16, 185, 129, 0.4)';
        if (props.planType === 'pro') return '0 10px 30px rgba(59, 130, 246, 0.4)';
        if (props.planType === 'premium') return '0 10px 30px rgba(249, 115, 22, 0.4)';
        return '0 10px 30px rgba(139, 92, 246, 0.4)';
    }};
`;

const PlanTag = styled.span`
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1rem;
    display: inline-block;
    animation: ${glow} 2s ease-in-out infinite;
    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.5);
`;

const BestValueTag = styled(PlanTag)`
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
`;

const PlanName = styled.h2`
    font-size: 2rem;
    color: ${props => {
        if (props.planType === 'starter') return '#10b981';
        if (props.planType === 'pro') return '#3b82f6';
        if (props.planType === 'premium') return '#f97316';
        return '#8b5cf6';
    }};
    margin-bottom: 0.5rem;
    font-weight: 900;
`;

const PlanDescription = styled.p`
    font-size: 1rem;
    color: #94a3b8;
    margin-bottom: 1rem;
    font-weight: 500;
`;

const Price = styled.div`
    font-size: 3.5rem;
    font-weight: 900;
    color: #f8fafc;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
    
    span {
        font-size: 1.3rem;
        font-weight: normal;
        color: #94a3b8;
    }
    
    ${props => props.planType === 'starter' && `
        font-size: 2.5rem;
    `}
`;

const FeatureList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 1.5rem 0;
    flex-grow: 1;
    text-align: left;
    position: relative;
    z-index: 1;
`;

const FeatureItem = styled.li`
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    color: #cbd5e1;
    margin-bottom: 0.9rem;
    gap: 0.8rem;
    transition: all 0.3s ease;

    &:hover {
        color: #f8fafc;
        transform: translateX(5px);
    }

    svg {
        color: #22c55e;
        min-width: 18px;
        height: 18px;
        flex-shrink: 0;
    }
`;

const ActionButton = styled.button`
    background: ${props => {
        if (props.planType === 'starter') return 'linear-gradient(135deg, #10b981, #059669)';
        if (props.planType === 'pro') return 'linear-gradient(135deg, #3b82f6, #2563eb)';
        if (props.planType === 'premium') return 'linear-gradient(135deg, #f97316, #ea580c)';
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    }};
    border: none;
    border-radius: 10px;
    color: white;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    width: 100%;
    margin-top: 2rem;
    position: relative;
    overflow: hidden;
    z-index: 1;

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
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => {
            if (props.planType === 'starter') return 'rgba(16, 185, 129, 0.6)';
            if (props.planType === 'pro') return 'rgba(59, 130, 246, 0.6)';
            if (props.planType === 'premium') return 'rgba(249, 115, 22, 0.6)';
            return 'rgba(139, 92, 246, 0.6)';
        }};
    }

    &:active:not(:disabled) {
        transform: translateY(-1px);
    }

    &:disabled {
        background: linear-gradient(135deg, #64748b, #475569);
        cursor: not-allowed;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
    }
`;

const ComparisonBadge = styled.div`
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #10b981;
    font-weight: 600;
`;

const FooterHashtags = styled.div`
    z-index: 2;
    margin-top: 5rem;
    font-size: 1.1rem;
    color: #64748b;
    animation: ${fadeIn} 1.5s ease-out 1s backwards;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;

    span {
        padding: 0.5rem 1rem;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 20px;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
            background: rgba(59, 130, 246, 0.2);
            transform: translateY(-3px);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
    }

    @media (max-width: 768px) {
        font-size: 0.9rem;
    }
`;

// ============ COMPONENT ============
const PricingPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [particles, setParticles] = useState([]);
    const [loading, setLoading] = useState(null);

    // Price IDs
    const PRICE_IDS = {
        starter: 'price_1SV9d8CtdTItnGjydNZsbXl3',
        pro: 'price_1SV9dTCtdTItnGjycfSxQtAg',
        premium: 'price_1SV9doCtdTItnGjyYb8yG97j',
        elite: 'price_1SV9eACtdTItnGjyzSNaNYhP'
    };

    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: ['#3b82f6', '#8b5cf6', '#f97316', '#10b981'][Math.floor(Math.random() * 4)]
        }));
        setParticles(newParticles);
    }, []);

    const handleSubscribe = async (plan) => {
        if (!user) {
            toast.warning('Please log in to subscribe', 'Login Required');
            navigate('/login');
            return;
        }

        setLoading(plan);

        try {
            const priceId = PRICE_IDS[plan];
            const response = await api.post('/stripe/create-checkout-session', { priceId });

            // Redirect to Stripe Checkout
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to start checkout. Please try again.', 'Error');
            setLoading(null);
        }
    };

    return (
        <PricingContainer>
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

            <HeaderLogo src={nexusSignalLogo} alt="Nexus Signal AI Logo" />

            <Title>Unlock Your Trading Edge: <strong>Nexus Signal.AI</strong> Pricing!</Title>
            <Subtitle>
                Gain an unfair advantage with AI-powered insights, real-time analytics, and advanced predictive models. 
                Choose the plan that elevates your trading strategy to legendary status.
            </Subtitle>

            <PricingCards>
                {/* Starter Tier - $15 */}
                <Card planType="starter">
                    <PlanHeader>
                        <PlanIconWrapper planType="starter">
                            <Star size={36} color="white" />
                        </PlanIconWrapper>
                        <PlanName planType="starter">Starter</PlanName>
                        <PlanDescription>Begin Your Journey</PlanDescription>
                    </PlanHeader>
                    <Price planType="starter">$15<span>/month</span></Price>
                    <FeatureList>
                        <FeatureItem><Check size={18} /> 5 Daily AI Signals</FeatureItem>
                        <FeatureItem><Check size={18} /> 1 Watchlist (10 assets)</FeatureItem>
                        <FeatureItem><Check size={18} /> Basic Market Overview</FeatureItem>
                        <FeatureItem><Check size={18} /> 3 Stock Predictions/month</FeatureItem>
                        <FeatureItem><Check size={18} /> Email Support</FeatureItem>
                        <FeatureItem><Check size={18} /> Mobile App Access</FeatureItem>
                    </FeatureList>
                    <ActionButton 
                        planType="starter" 
                        onClick={() => handleSubscribe('starter')}
                        disabled={loading !== null}
                    >
                        {loading === 'starter' ? 'Loading...' : 'Get Started'}
                    </ActionButton>
                </Card>

                {/* Pro Tier - $25 */}
                <Card planType="pro">
                    <PlanHeader>
                        <PlanIconWrapper planType="pro">
                            <Rocket size={36} color="white" />
                        </PlanIconWrapper>
                        <PlanName planType="pro">Pro</PlanName>
                        <PlanDescription>Accelerate Your Success</PlanDescription>
                    </PlanHeader>
                    <Price planType="pro">$25<span>/month</span></Price>
                    <FeatureList>
                        <FeatureItem><Check size={18} /> 15 Daily AI Signals</FeatureItem>
                        <FeatureItem><Check size={18} /> 3 Watchlists (30 assets each)</FeatureItem>
                        <FeatureItem><Check size={18} /> Advanced Market Analysis</FeatureItem>
                        <FeatureItem><Check size={18} /> 10 Stock Predictions/month</FeatureItem>
                        <FeatureItem><Check size={18} /> Real-Time Price Alerts</FeatureItem>
                        <FeatureItem><Check size={18} /> AI Chat Assistant</FeatureItem>
                        <FeatureItem><Check size={18} /> Technical Indicators</FeatureItem>
                        <FeatureItem><Check size={18} /> Priority Email Support</FeatureItem>
                    </FeatureList>
                    <ComparisonBadge>2x More Features than Starter</ComparisonBadge>
                    <ActionButton 
                        planType="pro"
                        onClick={() => handleSubscribe('pro')}
                        disabled={loading !== null}
                    >
                        {loading === 'pro' ? 'Loading...' : 'Get Started'}
                    </ActionButton>
                </Card>

                {/* Premium Tier - $50 */}
                <Card planType="premium">
                    <PlanHeader>
                        <PlanTag>Most Popular</PlanTag>
                        <PlanIconWrapper planType="premium">
                            <TrendingUp size={36} color="white" />
                        </PlanIconWrapper>
                        <PlanName planType="premium">Premium</PlanName>
                        <PlanDescription>Master Your Trades</PlanDescription>
                    </PlanHeader>
                    <Price planType="premium">$50<span>/month</span></Price>
                    <FeatureList>
                        <FeatureItem><Check size={18} /> Unlimited Daily AI Signals</FeatureItem>
                        <FeatureItem><Check size={18} /> Unlimited Watchlists</FeatureItem>
                        <FeatureItem><Check size={18} /> Live Market Data (Real-Time)</FeatureItem>
                        <FeatureItem><Check size={18} /> Unlimited Predictions</FeatureItem>
                        <FeatureItem><Check size={18} /> Advanced AI Chat (GPT-4)</FeatureItem>
                        <FeatureItem><Check size={18} /> Algorithmic Pattern Recognition</FeatureItem>
                        <FeatureItem><Check size={18} /> In-Depth Sector Analysis</FeatureItem>
                        <FeatureItem><Check size={18} /> Portfolio Tracking</FeatureItem>
                        <FeatureItem><Check size={18} /> Custom Alerts & Notifications</FeatureItem>
                        <FeatureItem><Check size={18} /> Priority Support (24/7)</FeatureItem>
                    </FeatureList>
                    <ComparisonBadge>3x More Features than Pro</ComparisonBadge>
                    <ActionButton 
                        planType="premium"
                        onClick={() => handleSubscribe('premium')}
                        disabled={loading !== null}
                    >
                        {loading === 'premium' ? 'Loading...' : 'Get Started'}
                    </ActionButton>
                </Card>

                {/* Elite Tier - $125 */}
                <Card planType="elite">
                    <PlanHeader>
                        <BestValueTag>Best Value</BestValueTag>
                        <PlanIconWrapper planType="elite">
                            <Crown size={36} color="white" />
                        </PlanIconWrapper>
                        <PlanName planType="elite">Elite</PlanName>
                        <PlanDescription>The Ultimate Market Edge</PlanDescription>
                    </PlanHeader>
                    <Price planType="elite">$125<span>/month</span></Price>
                    <FeatureList>
                        <FeatureItem><Check size={18} /> All Premium Features +</FeatureItem>
                        <FeatureItem><Check size={18} /> Ultra-Low Latency Data Feed</FeatureItem>
                        <FeatureItem><Check size={18} /> Full API Access</FeatureItem>
                        <FeatureItem><Check size={18} /> Unlimited AI Research Reports</FeatureItem>
                        <FeatureItem><Check size={18} /> Custom Research & Insights</FeatureItem>
                        <FeatureItem><Check size={18} /> Advanced Backtesting Tools</FeatureItem>
                        <FeatureItem><Check size={18} /> Institutional-Grade Analytics</FeatureItem>
                        <FeatureItem><Check size={18} /> Multi-Account Management</FeatureItem>
                        <FeatureItem><Check size={18} /> Personalized 1-on-1 Mentorship</FeatureItem>
                        <FeatureItem><Check size={18} /> White-Label Options</FeatureItem>
                        <FeatureItem><Check size={18} /> 24/7 Dedicated Account Manager</FeatureItem>
                        <FeatureItem><Check size={18} /> VIP Discord Community Access</FeatureItem>
                    </FeatureList>
                    <ComparisonBadge>5x More Features than Premium</ComparisonBadge>
                    <ActionButton 
                        planType="elite"
                        onClick={() => handleSubscribe('elite')}
                        disabled={loading !== null}
                    >
                        {loading === 'elite' ? 'Loading...' : 'Get Started'}
                    </ActionButton>
                </Card>
            </PricingCards>

            <FooterHashtags>
                <span>#NexusSignalAI</span>
                <span>#AITrading</span>
                <span>#MarketPredictions</span>
                <span>#UnfairAdvantage</span>
            </FooterHashtags>
        </PricingContainer>
    );
};

export default PricingPage;