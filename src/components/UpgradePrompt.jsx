// client/src/components/UpgradePrompt.jsx - Beautiful upgrade modal

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Zap, Crown, Star, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.95)'};
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 24px;
    max-width: 600px;
    width: 100%;
    position: relative;
    animation: ${slideUp} 0.4s ease-out;
    overflow: hidden;
`;

const GlowEffect = styled.div`
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 173, 237, 0.1) 0%, transparent 70%);
    pointer-events: none;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    z-index: 2;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
    }
`;

const Content = styled.div`
    padding: 3rem 2rem;
    position: relative;
    z-index: 1;
    text-align: center;

    @media (max-width: 768px) {
        padding: 2rem 1.5rem;
    }
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, #00adef 0%, #7b2ff7 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 40px rgba(0, 173, 237, 0.4);
`;

const Title = styled.h2`
    font-size: 2rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const Message = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const FeaturesList = styled.ul`
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 2rem 0;
    display: grid;
    gap: 0.75rem;
`;

const FeatureItem = styled.li`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #e0e6ed;
    font-size: 0.95rem;
    padding: 0.75rem;
    background: rgba(0, 173, 237, 0.05);
    border-radius: 8px;
    border-left: 3px solid #00adef;
`;

const ButtonGroup = styled.div`
    display: grid;
    gap: 1rem;
    margin-top: 2rem;
`;

const UpgradeButton = styled.button`
    padding: 1.25rem 2rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.5);
    }
`;

const SecondaryButton = styled.button`
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #94a3b8;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
`;

const Badge = styled.div`
    display: inline-block;
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.2);
    border: 1px solid rgba(0, 173, 237, 0.4);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 1rem;
`;

const PLAN_FEATURES = {
    starter: [
        '5 Daily AI Signals',
        '1 Watchlist (10 assets)',
        '3 Stock Predictions/month',
        'Email Support'
    ],
    pro: [
        '15 Daily AI Signals',
        '3 Watchlists (30 assets each)',
        '10 Stock Predictions/month',
        'AI Chat Assistant',
        'Real-Time Price Alerts',
        'Priority Support'
    ],
    premium: [
        'Unlimited AI Signals',
        'Unlimited Watchlists',
        'Unlimited Predictions',
        'Advanced AI Chat (GPT-4)',
        'Live Market Data',
        'Portfolio Tracking',
        '24/7 Priority Support'
    ],
    elite: [
        'All Premium Features',
        'Ultra-Low Latency Data',
        'Full API Access',
        'Advanced Backtesting',
        'Custom Research & Insights',
        '1-on-1 Mentorship',
        'Dedicated Account Manager'
    ]
};

const PLAN_ICONS = {
    starter: Star,
    pro: Zap,
    premium: Crown,
    elite: Crown
};

const UpgradePrompt = ({ 
    isOpen, 
    onClose, 
    currentPlan = 'free',
    requiredPlan = 'starter',
    feature = '',
    message = '',
    limit = null,
    currentUsage = null
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const Icon = PLAN_ICONS[requiredPlan] || Zap;
    const features = PLAN_FEATURES[requiredPlan] || [];

    const handleUpgrade = () => {
        navigate('/pricing');
        onClose();
    };

    const getLimitMessage = () => {
        if (limit !== null && currentUsage !== null) {
            return `You've used ${currentUsage} of ${limit} ${feature}`;
        }
        if (message) return message;
        return `Upgrade to ${requiredPlan} to access ${feature}`;
    };

    const getPlanName = (plan) => {
        return plan.charAt(0).toUpperCase() + plan.slice(1);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <GlowEffect />
                <CloseButton onClick={onClose}>
                    <X size={20} />
                </CloseButton>
                
                <Content>
                    <IconWrapper>
                        <Icon size={40} color="white" />
                    </IconWrapper>
                    
                    <Badge>
                        Current Plan: {getPlanName(currentPlan)}
                    </Badge>
                    
                    <Title>Upgrade to {getPlanName(requiredPlan)}</Title>
                    
                    <Message>
                        {getLimitMessage()}
                    </Message>

                    {features.length > 0 && (
                        <FeaturesList>
                            {features.map((feat, index) => (
                                <FeatureItem key={index}>
                                    <Check size={20} color="#00adef" />
                                    {feat}
                                </FeatureItem>
                            ))}
                        </FeaturesList>
                    )}

                    <ButtonGroup>
                        <UpgradeButton onClick={handleUpgrade}>
                            <Zap size={20} />
                            Upgrade to {getPlanName(requiredPlan)}
                            <ArrowRight size={20} />
                        </UpgradeButton>
                        <SecondaryButton onClick={onClose}>
                            Maybe Later
                        </SecondaryButton>
                    </ButtonGroup>
                </Content>
            </Modal>
        </Overlay>
    );
};

export default UpgradePrompt;