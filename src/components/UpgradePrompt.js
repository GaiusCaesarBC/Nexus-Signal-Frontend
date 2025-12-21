// client/src/components/UpgradePrompt.js - Feature Gating Modal

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useSubscription } from '../context/SubscriptionContext';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, #1a1f3a 0%, #0d1127 100%);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    animation: ${slideUp} 0.3s ease-out;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 40px rgba(0, 212, 255, 0.1);
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(120, 0, 255, 0.2));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 40px;
`;

const Title = styled.h2`
    color: #fff;
    font-size: 1.8rem;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #00d4ff, #7b2dff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const Description = styled.p`
    color: #8892b0;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0 0 24px;
`;

const PlanBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${props => {
        switch(props.plan) {
            case 'starter': return 'linear-gradient(135deg, #4ade80, #22c55e)';
            case 'pro': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
            case 'premium': return 'linear-gradient(135deg, #a855f7, #9333ea)';
            case 'elite': return 'linear-gradient(135deg, #f59e0b, #d97706)';
            default: return 'linear-gradient(135deg, #64748b, #475569)';
        }
    }};
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 24px;
`;

const FeatureList = styled.ul`
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 0 0 30px;
`;

const FeatureItem = styled.li`
    color: #a8b2d1;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    gap: 12px;

    &:last-child {
        border-bottom: none;
    }

    svg, span.icon {
        color: #00d4ff;
        font-size: 1.2rem;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
`;

const UpgradeButton = styled.button`
    background: linear-gradient(135deg, #00d4ff, #7b2dff);
    color: white;
    border: none;
    padding: 14px 32px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
    }
`;

const CloseButton = styled.button`
    background: transparent;
    color: #8892b0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
    }
`;

const CurrentPlan = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    margin-top: 20px;
`;

// Feature descriptions for different features
const FEATURE_INFO = {
    hasNexusAI: {
        icon: '✨',
        title: 'NEXUS AI Chart Indicator',
        description: 'Visualize AI-powered price predictions directly on your charts with projected target lines extending into the future.',
        benefits: [
            'See AI price targets on charts',
            'Visual projection lines into the future',
            'Blue/orange indicators for UP/DOWN',
            'Confidence levels and timeframes',
            'Works with stocks and crypto'
        ]
    },
    hasAIChat: {
        icon: '🤖',
        title: 'AI Chat Assistant',
        description: 'Get instant market insights and trading advice from our advanced AI assistant powered by Claude.',
        benefits: [
            'Ask questions about any stock or crypto',
            'Get personalized trading suggestions',
            'Real-time market analysis',
            'Portfolio optimization tips'
        ]
    },
    hasPriceAlerts: {
        icon: '🔔',
        title: 'Price Alerts',
        description: 'Set custom price alerts and never miss a trading opportunity.',
        benefits: [
            'Unlimited price alerts',
            'Email and push notifications',
            'Multi-asset support',
            'Percentage-based triggers'
        ]
    },
    dailySignals: {
        icon: '📊',
        title: 'AI Predictions',
        description: 'Access AI-powered price predictions for stocks and crypto.',
        benefits: [
            'Machine learning predictions',
            'Technical indicator analysis',
            'Confidence scores',
            'Multiple timeframes'
        ]
    },
    watchlistAssets: {
        icon: '👀',
        title: 'Watchlist',
        description: 'Track your favorite stocks and cryptocurrencies.',
        benefits: [
            'Real-time price updates',
            'Quick access to analysis',
            'Custom organization',
            'Price change alerts'
        ]
    },
    whaleAlerts: {
        icon: '🐋',
        title: 'Whale Alerts',
        description: 'Track large institutional and insider trading activity.',
        benefits: [
            'SEC insider filings',
            'Crypto whale transactions',
            'Unusual options activity',
            'Congressional trading'
        ]
    },
    screener: {
        icon: '🔍',
        title: 'Stock Screener',
        description: 'Find trading opportunities with our advanced screener.',
        benefits: [
            'Custom filters',
            'Real-time data',
            'Technical indicators',
            'Save filter presets'
        ]
    },
    default: {
        icon: '⭐',
        title: 'Premium Feature',
        description: 'This feature requires a higher subscription plan.',
        benefits: [
            'Unlock advanced features',
            'Get better trading insights',
            'Access premium tools'
        ]
    }
};

const UpgradePrompt = ({
    isOpen,
    onClose,
    feature = 'default',
    requiredPlan = 'starter',
    customTitle,
    customDescription
}) => {
    const navigate = useNavigate();
    const { currentPlan, getPlanDisplayName } = useSubscription();

    if (!isOpen) return null;

    const featureInfo = FEATURE_INFO[feature] || FEATURE_INFO.default;
    const displayPlan = getPlanDisplayName(requiredPlan);

    const handleUpgrade = () => {
        navigate('/pricing');
        if (onClose) onClose();
    };

    const handleClose = (e) => {
        if (e.target === e.currentTarget || e.currentTarget.tagName === 'BUTTON') {
            if (onClose) onClose();
        }
    };

    return (
        <Overlay onClick={handleClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <IconWrapper>{featureInfo.icon}</IconWrapper>

                <Title>{customTitle || featureInfo.title}</Title>

                <Description>
                    {customDescription || featureInfo.description}
                </Description>

                <PlanBadge plan={requiredPlan}>
                    Requires {displayPlan} Plan
                </PlanBadge>

                <FeatureList>
                    {featureInfo.benefits.map((benefit, index) => (
                        <FeatureItem key={index}>
                            <span className="icon">✓</span>
                            {benefit}
                        </FeatureItem>
                    ))}
                </FeatureList>

                <ButtonGroup>
                    <CloseButton onClick={handleClose}>
                        Maybe Later
                    </CloseButton>
                    <UpgradeButton onClick={handleUpgrade}>
                        View Plans
                    </UpgradeButton>
                </ButtonGroup>

                <CurrentPlan>
                    Your current plan: <strong>{getPlanDisplayName(currentPlan)}</strong>
                </CurrentPlan>
            </Modal>
        </Overlay>
    );
};

// Inline upgrade banner (for use within pages)
export const UpgradeBanner = styled.div`
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(123, 45, 255, 0.1));
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 12px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

export const BannerContent = styled.div`
    flex: 1;
`;

export const BannerTitle = styled.h3`
    color: #fff;
    margin: 0 0 4px;
    font-size: 1.1rem;
`;

export const BannerText = styled.p`
    color: #8892b0;
    margin: 0;
    font-size: 0.9rem;
`;

export const BannerButton = styled.button`
    background: linear-gradient(135deg, #00d4ff, #7b2dff);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0, 212, 255, 0.3);
    }
`;

// Inline component for quick upgrade prompts within pages
export const InlineUpgradePrompt = ({ feature, requiredPlan }) => {
    const navigate = useNavigate();
    const { getPlanDisplayName } = useSubscription();
    const featureInfo = FEATURE_INFO[feature] || FEATURE_INFO.default;

    return (
        <UpgradeBanner>
            <BannerContent>
                <BannerTitle>
                    {featureInfo.icon} {featureInfo.title}
                </BannerTitle>
                <BannerText>
                    Upgrade to {getPlanDisplayName(requiredPlan)} to unlock this feature
                </BannerText>
            </BannerContent>
            <BannerButton onClick={() => navigate('/pricing')}>
                Upgrade Now
            </BannerButton>
        </UpgradeBanner>
    );
};

export default UpgradePrompt;
