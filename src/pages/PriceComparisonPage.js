// client/src/pages/PriceComparisonPage.js - Feature Comparison Matrix
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    Check, X, Crown, Star, Rocket, Gift, TrendingUp, Zap, Sparkles,
    ArrowLeft, Shield, Lock, Award, Brain, BarChart3, Bell, Users,
    Briefcase, MessageSquare, Activity, LineChart, Target, Globe,
    Infinity as InfinityIcon
} from 'lucide-react';
import nexusSignalLogo from '../assets/nexus-signal-logo.png';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

// ============ ANIMATIONS ============
const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0e1f 0%, #0f172a 50%, #1a1f3a 100%);
    padding: 100px 2rem 4rem;
    position: relative;
    overflow: hidden;
`;

const BackgroundGlow = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 60%);
    pointer-events: none;
`;

const ContentWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const BackButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 10px;
    color: #94a3b8;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 2rem;

    &:hover {
        background: rgba(59, 130, 246, 0.2);
        color: #3b82f6;
        transform: translateX(-4px);
    }
`;

const HeaderSection = styled.div`
    text-align: center;
    margin-bottom: 3rem;
`;

const Logo = styled.img`
    width: 80px;
    height: 80px;
    animation: ${float} 4s ease-in-out infinite;
    filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.6));
    margin-bottom: 1.5rem;
`;

const Title = styled.h1`
    font-size: 3rem;
    font-weight: 800;
    color: #f8fafc;
    margin-bottom: 1rem;
    animation: ${fadeInUp} 0.8s ease-out;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const GradientText = styled.span`
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #f97316 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${gradientShift} 5s ease infinite;
`;

const Subtitle = styled.p`
    font-size: 1.2rem;
    color: #94a3b8;
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.7;
    animation: ${fadeInUp} 0.8s ease-out 0.2s backwards;
`;

// ============ TABLE STYLES ============
const TableWrapper = styled.div`
    overflow-x: auto;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(59, 130, 246, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    animation: ${fadeInUp} 0.8s ease-out 0.4s backwards;

    &::-webkit-scrollbar {
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(59, 130, 246, 0.5);
        border-radius: 4px;
    }
`;

const ComparisonTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
`;

const TableHead = styled.thead`
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(15, 23, 42, 0.98);
`;

const PlanHeader = styled.th`
    padding: 1.5rem 1rem;
    text-align: center;
    border-bottom: 2px solid rgba(59, 130, 246, 0.3);
    min-width: 140px;
    position: relative;

    ${props => props.$featured && `
        background: linear-gradient(180deg, rgba(249, 115, 22, 0.15) 0%, transparent 100%);

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #f97316, #ea580c);
        }
    `}

    ${props => props.$current && `
        background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%);

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #10b981, #059669);
        }
    `}
`;

const PlanIcon = styled.div`
    width: 50px;
    height: 50px;
    margin: 0 auto 0.75rem;
    border-radius: 12px;
    background: ${props => props.$gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 15px ${props => props.$shadow};
`;

const PlanName = styled.div`
    font-size: 1.25rem;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 0.25rem;
`;

const PlanPrice = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || '#3b82f6'};

    span {
        font-size: 0.875rem;
        font-weight: 500;
        color: #64748b;
    }
`;

const PlanBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 0.5rem;
    background: ${props => props.$bg};
    color: ${props => props.$color};
`;

const FeatureHeader = styled.th`
    padding: 1.5rem;
    text-align: left;
    border-bottom: 2px solid rgba(59, 130, 246, 0.3);
    font-weight: 700;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const CategoryRow = styled.tr`
    background: rgba(59, 130, 246, 0.08);
`;

const CategoryCell = styled.td`
    padding: 0.875rem 1.5rem;
    font-weight: 700;
    font-size: 0.9rem;
    color: ${props => props.$color || '#3b82f6'};
    border-bottom: 1px solid rgba(59, 130, 246, 0.15);
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const FeatureRow = styled.tr`
    transition: all 0.2s ease;

    &:hover {
        background: rgba(59, 130, 246, 0.05);
    }
`;

const FeatureCell = styled.td`
    padding: 0.875rem 1.5rem;
    color: #cbd5e1;
    font-size: 0.9rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ValueCell = styled.td`
    padding: 0.875rem 1rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    ${props => props.$featured && `
        background: rgba(249, 115, 22, 0.05);
    `}

    ${props => props.$current && `
        background: rgba(16, 185, 129, 0.05);
    `}
`;

const CheckIcon = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${props => props.$color ? `${props.$color}20` : 'rgba(16, 185, 129, 0.2)'};
    color: ${props => props.$color || '#10b981'};
`;

const XIcon = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.1);
    color: #64748b;
`;

const ValueText = styled.span`
    font-weight: 600;
    color: ${props => props.$color || '#f8fafc'};
    font-size: 0.9rem;
`;

const InfinityBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(139, 92, 246, 0.2));
    border-radius: 6px;
    color: #f97316;
    font-weight: 700;
    font-size: 0.8rem;
`;

const CTASection = styled.div`
    margin-top: 3rem;
    text-align: center;
    animation: ${fadeInUp} 0.8s ease-out 0.6s backwards;
`;

const CTAButton = styled.button`
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5);
    }
`;

const TrustSection = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;
    flex-wrap: wrap;
`;

const TrustItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.9rem;

    svg {
        color: #10b981;
    }
`;

// ============ COMPONENT ============
const PriceComparisonPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentPlan } = useSubscription();

    const plans = [
        { id: 'free', name: 'Free', icon: Gift, gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', shadow: 'rgba(99, 102, 241, 0.4)', price: 0, color: '#6366f1' },
        { id: 'starter', name: 'Starter', icon: Star, gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: 'rgba(16, 185, 129, 0.4)', price: 9.99, color: '#10b981' },
        { id: 'pro', name: 'Pro', icon: Rocket, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: 'rgba(59, 130, 246, 0.4)', price: 24.99, color: '#3b82f6' },
        { id: 'premium', name: 'Premium', icon: TrendingUp, gradient: 'linear-gradient(135deg, #f97316, #ea580c)', shadow: 'rgba(249, 115, 22, 0.4)', price: 49.99, color: '#f97316', featured: true, badge: 'Most Popular' },
        { id: 'elite', name: 'Elite', icon: Crown, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadow: 'rgba(139, 92, 246, 0.4)', price: 99.99, color: '#8b5cf6', badge: 'Best Value' },
    ];

    // Feature categories with all features
    const featureCategories = [
        {
            name: 'Gamification & Rewards',
            icon: Sparkles,
            color: '#6366f1',
            features: [
                { name: 'Achievement System (93 achievements)', values: [true, true, true, true, true] },
                { name: 'Level Progression (1-100)', values: [true, true, true, true, true] },
                { name: 'XP & Nexus Coins', values: [true, true, true, true, true] },
                { name: 'Daily Login Rewards & Streaks', values: [true, true, true, true, true] },
                { name: 'Global Leaderboards', values: [true, true, true, true, true] },
                { name: 'Cosmetic Vault (Borders, Badges)', values: [true, true, true, true, true] },
            ]
        },
        {
            name: 'Paper Trading',
            icon: Briefcase,
            color: '#3b82f6',
            features: [
                { name: '$100,000 Virtual Portfolio', values: [true, true, true, true, true] },
                { name: 'Real-Time Market Simulation', values: [true, true, true, true, true] },
                { name: 'Trade History & P/L Analytics', values: [true, true, true, true, true] },
                { name: 'Financial Calculators', values: [true, true, true, true, true] },
            ]
        },
        {
            name: 'Social Features',
            icon: Users,
            color: '#10b981',
            features: [
                { name: 'Social Feed (Post & Comment)', values: [true, true, true, true, true] },
                { name: 'Follow Top Traders', values: [true, true, true, true, true] },
                { name: 'Public Profile Page', values: [true, true, true, true, true] },
            ]
        },
        {
            name: 'AI Predictions',
            icon: Brain,
            color: '#f59e0b',
            features: [
                { name: 'Daily AI Predictions', values: ['0', '5/day', '15/day', 'Unlimited', 'Unlimited'] },
                { name: 'Prediction History', values: [false, false, false, true, true] },
                { name: 'Accuracy Analytics', values: [false, false, false, true, true] },
                { name: 'NEXUS AI Chart Indicator', values: [false, false, false, true, true] },
            ]
        },
        {
            name: 'AI Chat & Research',
            icon: MessageSquare,
            color: '#8b5cf6',
            features: [
                { name: 'AI Chat Assistant', values: [false, false, true, true, true] },
                { name: 'GPT-4 Turbo AI Chat', values: [false, false, false, true, true] },
                { name: 'Unlimited AI Research Reports', values: [false, false, false, false, true] },
                { name: 'Custom Research & Insights', values: [false, false, false, false, true] },
            ]
        },
        {
            name: 'Watchlists & Screeners',
            icon: Target,
            color: '#ec4899',
            features: [
                { name: 'Watchlist Stocks', values: ['0', '10', '30', 'Unlimited', 'Unlimited'] },
                { name: 'Number of Watchlists', values: ['0', '1', '3', 'Unlimited', 'Unlimited'] },
                { name: 'Stock Screener Access', values: [false, true, true, true, true] },
                { name: 'Advanced Filters', values: [false, false, true, true, true] },
            ]
        },
        {
            name: 'Charts & Technical Analysis',
            icon: LineChart,
            color: '#06b6d4',
            features: [
                { name: 'Stock Detail Pages', values: [false, true, true, true, true] },
                { name: 'Advanced Market Heatmap', values: [false, false, true, true, true] },
                { name: 'Technical Indicators (RSI, MACD, BB)', values: [false, false, true, true, true] },
                { name: 'Pattern Recognition', values: [false, false, false, true, true] },
                { name: 'Stock Comparison Tools', values: [false, false, true, true, true] },
            ]
        },
        {
            name: 'Alerts & Notifications',
            icon: Bell,
            color: '#ef4444',
            features: [
                { name: 'Real-Time Price Alerts', values: [false, false, true, true, true] },
                { name: 'Custom Price Alerts', values: [false, false, false, true, true] },
                { name: 'Whale Alert Notifications', values: [false, false, false, true, true] },
            ]
        },
        {
            name: 'Whale Intelligence',
            icon: Activity,
            color: '#f97316',
            features: [
                { name: 'Whale Alerts (Large Trades)', values: [false, false, false, true, true] },
                { name: 'Dark Pool Flow Tracking', values: [false, false, false, true, true] },
                { name: 'Institutional Activity Monitor', values: [false, false, false, true, true] },
                { name: 'Congressional Trade Alerts', values: [false, false, false, true, true] },
                { name: 'Whale Alert Webhooks & API', values: [false, false, false, false, true] },
            ]
        },
        {
            name: 'Portfolio & Analysis',
            icon: BarChart3,
            color: '#14b8a6',
            features: [
                { name: 'Trade Journal', values: [false, true, true, true, true] },
                { name: 'Basic Sentiment Analysis', values: [false, true, true, true, true] },
                { name: 'Advanced Analysis Tools', values: [false, false, true, true, true] },
                { name: 'Portfolio Tracking', values: [false, false, false, true, true] },
                { name: 'Portfolio Optimization', values: [false, false, false, true, true] },
                { name: 'Sector Rotation Analysis', values: [false, false, false, true, true] },
            ]
        },
        {
            name: 'Data & Performance',
            icon: Zap,
            color: '#eab308',
            features: [
                { name: 'Market News Feed', values: [false, true, true, true, true] },
                { name: 'Live Real-Time Data', values: [false, false, false, true, true] },
                { name: 'Ultra-Low Latency Data (<50ms)', values: [false, false, false, false, true] },
                { name: 'Discovery Page Access', values: [false, false, false, true, true] },
            ]
        },
        {
            name: 'API & Integrations',
            icon: Globe,
            color: '#a855f7',
            features: [
                { name: 'Full REST API Access', values: [false, false, false, false, true] },
                { name: 'Strategy Backtesting Engine', values: [false, false, false, false, true] },
                { name: 'Multi-Account Management', values: [false, false, false, false, true] },
                { name: 'White-Label Options', values: [false, false, false, false, true] },
            ]
        },
        {
            name: 'Support & VIP Perks',
            icon: Crown,
            color: '#f472b6',
            features: [
                { name: 'Email Support', values: [false, true, true, true, true] },
                { name: 'Priority Email Support', values: [false, false, true, true, true] },
                { name: '24/7 Priority Support', values: [false, false, false, true, true] },
                { name: '1-on-1 Trading Mentorship', values: [false, false, false, false, true] },
                { name: 'Dedicated Account Manager', values: [false, false, false, false, true] },
                { name: 'VIP Discord Community', values: [false, false, false, false, true] },
                { name: 'Early Access to New Features', values: [false, false, false, false, true] },
                { name: 'Custom Feature Requests', values: [false, false, false, false, true] },
            ]
        },
    ];

    const renderValue = (value, planColor) => {
        if (value === true) {
            return (
                <CheckIcon $color={planColor}>
                    <Check size={16} />
                </CheckIcon>
            );
        }
        if (value === false) {
            return (
                <XIcon>
                    <X size={14} />
                </XIcon>
            );
        }
        if (value === 'Unlimited') {
            return (
                <InfinityBadge>
                    <InfinityIcon size={14} />
                    Unlimited
                </InfinityBadge>
            );
        }
        return <ValueText $color={planColor}>{value}</ValueText>;
    };

    return (
        <PageContainer>
            <SEO
                title="Feature Comparison | Nexus Signal AI"
                description="Compare all Nexus Signal AI plans side by side. See exactly what features are included in each subscription tier."
                keywords="Nexus Signal comparison, feature comparison, plan comparison, AI trading features"
            />
            <BackgroundGlow />

            <ContentWrapper>
                <BackButton onClick={() => navigate('/pricing')}>
                    <ArrowLeft size={18} />
                    Back to Pricing
                </BackButton>

                <HeaderSection>
                    <Logo src={nexusSignalLogo} alt="Nexus Signal AI" />
                    <Title>
                        Compare <GradientText>All Features</GradientText>
                    </Title>
                    <Subtitle>
                        See exactly what's included in each plan. Find the perfect fit for your trading needs.
                    </Subtitle>
                </HeaderSection>

                <TableWrapper>
                    <ComparisonTable>
                        <TableHead>
                            <tr>
                                <FeatureHeader>Feature</FeatureHeader>
                                {plans.map(plan => {
                                    const Icon = plan.icon;
                                    const isCurrent = currentPlan === plan.id;
                                    return (
                                        <PlanHeader key={plan.id} $featured={plan.featured} $current={isCurrent}>
                                            <PlanIcon $gradient={plan.gradient} $shadow={plan.shadow}>
                                                <Icon size={24} />
                                            </PlanIcon>
                                            <PlanName>{plan.name}</PlanName>
                                            <PlanPrice $color={plan.color}>
                                                {plan.price === 0 ? 'Free' : `$${plan.price}`}
                                                {plan.price > 0 && <span>/mo</span>}
                                            </PlanPrice>
                                            {plan.badge && (
                                                <PlanBadge $bg={`${plan.color}20`} $color={plan.color}>
                                                    <Zap size={10} />
                                                    {plan.badge}
                                                </PlanBadge>
                                            )}
                                            {isCurrent && (
                                                <PlanBadge $bg="rgba(16, 185, 129, 0.2)" $color="#10b981">
                                                    <Check size={10} />
                                                    Current
                                                </PlanBadge>
                                            )}
                                        </PlanHeader>
                                    );
                                })}
                            </tr>
                        </TableHead>
                        <tbody>
                            {featureCategories.map((category, catIndex) => {
                                const CategoryIcon = category.icon;
                                return (
                                    <React.Fragment key={catIndex}>
                                        <CategoryRow>
                                            <CategoryCell $color={category.color} colSpan={6}>
                                                <CategoryIcon size={18} />
                                                {category.name}
                                            </CategoryCell>
                                        </CategoryRow>
                                        {category.features.map((feature, featIndex) => (
                                            <FeatureRow key={featIndex}>
                                                <FeatureCell>{feature.name}</FeatureCell>
                                                {feature.values.map((value, planIndex) => (
                                                    <ValueCell
                                                        key={planIndex}
                                                        $featured={plans[planIndex].featured}
                                                        $current={currentPlan === plans[planIndex].id}
                                                    >
                                                        {renderValue(value, plans[planIndex].color)}
                                                    </ValueCell>
                                                ))}
                                            </FeatureRow>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </ComparisonTable>
                </TableWrapper>

                <CTASection>
                    <CTAButton onClick={() => navigate('/pricing')}>
                        Choose Your Plan
                    </CTAButton>

                    <TrustSection>
                        <TrustItem>
                            <Shield size={18} />
                            256-bit Encryption
                        </TrustItem>
                        <TrustItem>
                            <Lock size={18} />
                            SOC 2 Compliant
                        </TrustItem>
                        <TrustItem>
                            <Award size={18} />
                            Cancel Anytime
                        </TrustItem>
                    </TrustSection>
                </CTASection>
            </ContentWrapper>
        </PageContainer>
    );
};

export default PriceComparisonPage;
