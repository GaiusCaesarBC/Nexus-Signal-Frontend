// client/src/components/PaywallModal.js - Non-dismissible paywall modal
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Lock, ArrowRight, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(50px);
    }
    to { 
        opacity: 1; 
        transform: translateY(0);
    }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 2px solid rgba(0, 173, 237, 0.4);
    border-radius: 20px;
    padding: 3rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 173, 237, 0.3);
    animation: ${slideUp} 0.4s ease-out;
    position: relative;

    @media (max-width: 768px) {
        padding: 2rem;
        max-width: 95%;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(100, 116, 139, 0.2);
        color: #ef4444;
    }
    
    display: none; /* Hide the X button - user must upgrade or go back */
`;

const IconWrapper = styled.div`
    width: 70px;
    height: 70px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 173, 237, 0.4);
`;

const Title = styled.h2`
    font-size: 1.8rem;
    color: #00adef;
    margin: 0 0 0.5rem;
    text-align: center;
    font-weight: 700;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    text-align: center;
    font-size: 1rem;
    margin: 0 0 2rem;
    line-height: 1.6;
`;

const Features = styled.ul`
    list-style: none;
    margin: 1.5rem 0;
    padding: 0;
    
    li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0;
        color: #cbd5e1;
        font-size: 0.95rem;
        
        svg {
            color: #10b981;
            flex-shrink: 0;
        }
    }
`;

const UpgradeButton = styled.button`
    width: 100%;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 8px 25px rgba(0, 173, 237, 0.4);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(0, 173, 237, 0.6);
    }

    &:active {
        transform: translateY(0);
    }
`;

const BackButton = styled.button`
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: rgba(100, 116, 139, 0.1);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    color: #94a3b8;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(100, 116, 139, 0.2);
        color: #cbd5e1;
    }
`;

const Warning = styled.div`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    
    p {
        margin: 0;
        color: #fca5a5;
        font-size: 0.9rem;
        line-height: 1.5;
    }
`;

/**
 * PaywallModal - Non-dismissible modal for feature access gating
 * 
 * Props:
 *   - isOpen: Boolean to show/hide modal
 *   - requiredPlan: Plan required (e.g., 'premium')
 *   - features: Array of feature names being blocked
 *   - onUpgrade: Callback when upgrade button clicked
 *   - onBack: Callback for back button
 */
const PaywallModal = ({ 
    isOpen, 
    requiredPlan = 'premium',
    features = [],
    onUpgrade,
    onBack
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const planInfo = {
        premium: {
            name: 'Premium',
            description: 'Unlock AI predictions, advanced analysis, and more',
            features: ['AI Chat (GPT-4)', 'Advanced Technical Analysis', 'Portfolio Tracking', 'Custom Alerts']
        },
        elite: {
            name: 'Elite',
            description: 'Everything in Premium plus API & enterprise features',
            features: ['API Access', 'Backtesting Engine', 'Multi-Account Support', 'Dedicated Manager']
        }
    };

    const plan = planInfo[requiredPlan] || planInfo.premium;

    const handleUpgrade = () => {
        if (onUpgrade) {
            onUpgrade();
        } else {
            navigate('/pricing');
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <Overlay>
            <Modal>
                <CloseButton onClick={handleBack}>
                    <X size={20} />
                </CloseButton>

                <IconWrapper>
                    <Lock size={40} color="white" />
                </IconWrapper>

                <Title>🔒 Premium Feature</Title>
                <Subtitle>{plan.description}</Subtitle>

                <Warning>
                    <p>
                        This feature is locked. Upgrade to {plan.name} to gain access.
                    </p>
                </Warning>

                <p style={{ color: '#94a3b8', marginBottom: '0.75rem' }}>
                    <strong style={{ color: '#cbd5e1' }}>What you'll get:</strong>
                </p>
                <Features>
                    {plan.features.map((feature, idx) => (
                        <li key={idx}>
                            <Check size={20} />
                            {feature}
                        </li>
                    ))}
                </Features>

                <UpgradeButton onClick={handleUpgrade}>
                    Upgrade to {plan.name}
                    <ArrowRight size={18} />
                </UpgradeButton>

                <BackButton onClick={handleBack}>
                    Go Back
                </BackButton>
            </Modal>
        </Overlay>
    );
};

export default PaywallModal;
