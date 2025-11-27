// client/src/components/RefillAccountButton.js
// Button to trigger the Refill Account Modal

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Zap } from 'lucide-react';
import RefillAccountModal from './RefillAccountModal';


const pulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%);
    border: 2px solid rgba(16, 185, 129, 0.4);
    border-radius: 12px;
    color: #10b981;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%);
        border-color: rgba(16, 185, 129, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
`;

const CostBadge = styled.span`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.6rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 6px;
    color: #f59e0b;
    font-size: 0.75rem;
    font-weight: 700;
`;

// Compact version for sidebar/header placement
const CompactButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 10px;
    color: #10b981;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(16, 185, 129, 0.2);
        transform: translateY(-2px);
    }
`;

const RefillAccountButton = ({ 
    variant = 'default', // 'default' | 'compact'
    onRefillSuccess,
    currentCashBalance = 0,
    className 
}) => {
    const [showModal, setShowModal] = useState(false);

    const handleRefillSuccess = (data) => {
        if (onRefillSuccess) {
            onRefillSuccess(data);
        }
    };

    if (variant === 'compact') {
        return (
            <>
                <CompactButton 
                    onClick={() => setShowModal(true)}
                    className={className}
                >
                    <Sparkles size={16} />
                    Refill
                </CompactButton>

                <RefillAccountModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onRefillSuccess={handleRefillSuccess}
                    currentCashBalance={currentCashBalance}
                />
            </>
        );
    }

    return (
        <>
            <Button 
                onClick={() => setShowModal(true)}
                className={className}
            >
                <Sparkles size={20} />
                Refill Account
                <CostBadge>
                    <Zap size={12} />
                    100+
                </CostBadge>
            </Button>

            <RefillAccountModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onRefillSuccess={handleRefillSuccess}
                currentCashBalance={currentCashBalance}
            />
        </>
    );
};

export default RefillAccountButton;