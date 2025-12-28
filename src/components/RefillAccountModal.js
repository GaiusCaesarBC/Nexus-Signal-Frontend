// src/components/RefillAccountModal.js
// Refill account modal with $100,000 maximum balance cap

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { 
    X, Coins, DollarSign, TrendingUp, Rocket, Star, Crown,
    CheckCircle, AlertTriangle, ArrowRight, Zap, Lock, Info
} from 'lucide-react';

const MAX_BALANCE = 100000;

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
`;

// ============ STYLED COMPONENTS ============
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
    padding: 1rem;
    animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 20px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${slideUp} 0.3s ease-out;
    position: relative;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 3px;
    }
`;

const Header = styled.div`
    padding: 1.5rem 2rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%);
    z-index: 10;
`;

const Title = styled.h2`
    font-size: 1.5rem;
    font-weight: 800;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
`;

const CloseButton = styled.button`
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #94a3b8;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
    }
`;

const Content = styled.div`
    padding: 2rem;
`;

const BalanceInfo = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const BalanceCard = styled.div`
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
`;

const BalanceLabel = styled.div`
    color: #94a3b8;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const BalanceValue = styled.div`
    color: ${props => props.$color || '#e0e6ed'};
    font-size: 1.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

const BalanceProgress = styled.div`
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
`;

const ProgressLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #94a3b8;
`;

const ProgressBar = styled.div`
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${props => props.$percent}%;
    background: ${props => {
        if (props.$percent >= 100) return 'linear-gradient(90deg, #10b981, #059669)';
        if (props.$percent >= 75) return 'linear-gradient(90deg, #f59e0b, #d97706)';
        return 'linear-gradient(90deg, #8b5cf6, #7c3aed)';
    }};
    border-radius: 4px;
    transition: width 0.3s ease;
`;

const RoomToFill = styled.div`
    text-align: center;
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: ${props => props.$atMax ? '#ef4444' : '#10b981'};
    font-weight: 600;
`;

const MaxWarning = styled.div`
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
`;

const MaxWarningIcon = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    background: rgba(239, 68, 68, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const MaxWarningTitle = styled.div`
    color: #ef4444;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
`;

const MaxWarningText = styled.div`
    color: #fca5a5;
    font-size: 0.9rem;
`;

const TiersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const TierCard = styled.button`
    background: ${props => props.$selected 
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%)' 
        : 'rgba(30, 41, 59, 0.5)'};
    border: 2px solid ${props => {
        if (props.$disabled) return 'rgba(100, 116, 139, 0.2)';
        if (props.$selected) return 'rgba(139, 92, 246, 0.6)';
        return 'rgba(100, 116, 139, 0.3)';
    }};
    border-radius: 12px;
    padding: 1.25rem 1rem;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    opacity: ${props => props.$disabled ? 0.5 : 1};

    ${props => props.$isFull && !props.$disabled && css`
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(245, 158, 11, 0.2) 100%);
        border-color: rgba(245, 158, 11, 0.5);
        animation: ${glow} 2s ease-in-out infinite;
    `}

    &:hover:not(:disabled) {
        transform: ${props => props.$disabled ? 'none' : 'translateY(-3px)'};
        border-color: ${props => props.$disabled ? 'rgba(100, 116, 139, 0.2)' : 'rgba(139, 92, 246, 0.6)'};
    }

    ${props => props.$isFull && !props.$disabled && css`
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 200%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.1),
                transparent
            );
            animation: ${shimmer} 3s linear infinite;
        }
    `}
`;

const TierIcon = styled.div`
    width: 40px;
    height: 40px;
    margin: 0 auto 0.75rem;
    background: ${props => props.$bg || 'rgba(139, 92, 246, 0.2)'};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#a78bfa'};
`;

const TierAmount = styled.div`
    font-size: 1.2rem;
    font-weight: 800;
    color: ${props => props.$disabled ? '#64748b' : '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const TierCost = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    font-size: 0.85rem;
    color: ${props => props.$disabled ? '#64748b' : '#f59e0b'};
    font-weight: 600;
`;

const TierBadge = styled.div`
    position: absolute;
    top: -8px;
    right: -8px;
    background: ${props => props.$type === 'capped' 
        ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
`;

const CappedNotice = styled.div`
    font-size: 0.7rem;
    color: #f59e0b;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
`;

const SummaryBox = styled.div`
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
`;

const SummaryTitle = styled.div`
    color: #10b981;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px dashed rgba(16, 185, 129, 0.2);

    &:last-child {
        border-bottom: none;
        padding-top: 0.75rem;
        margin-top: 0.25rem;
        border-top: 1px solid rgba(16, 185, 129, 0.3);
    }
`;

const SummaryLabel = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const SummaryValue = styled.span`
    color: ${props => props.$color || '#e0e6ed'};
    font-weight: 700;
    font-size: ${props => props.$large ? '1.2rem' : '0.95rem'};
`;

const CappedWarning = styled.div`
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 8px;
    padding: 0.75rem;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #fbbf24;
`;

const InsufficientFunds = styled.div`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const InsufficientIcon = styled.div`
    width: 40px;
    height: 40px;
    background: rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const InsufficientText = styled.div`
    color: #fca5a5;
    font-size: 0.9rem;
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 1.25rem;
    background: ${props => props.$disabled 
        ? 'rgba(100, 116, 139, 0.3)' 
        : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    opacity: ${props => props.$disabled ? 0.6 : 1};

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
    }
`;

const SuccessState = styled.div`
    text-align: center;
    padding: 2rem 0;
`;

const SuccessIcon = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: rgba(16, 185, 129, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${pulse} 0.5s ease-out;
`;

const SuccessTitle = styled.div`
    color: #10b981;
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
`;

const SuccessSubtitle = styled.div`
    color: #94a3b8;
    font-size: 1rem;
    margin-bottom: 2rem;
`;

const SuccessStats = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
`;

const SuccessStat = styled.div`
    background: rgba(30, 41, 59, 0.5);
    border-radius: 10px;
    padding: 1rem;
`;

const SuccessStatLabel = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const SuccessStatValue = styled.div`
    color: ${props => props.$color || '#e0e6ed'};
    font-size: 1.3rem;
    font-weight: 800;
`;

const CloseSuccessButton = styled.button`
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }
`;

const TIER_ICONS = [DollarSign, TrendingUp, Rocket, Star, Crown];
const TIER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const RefillAccountModal = ({ isOpen, onClose, currentCashBalance = 0, onRefillSuccess }) => {
    const { api } = useAuth();
    const { nexusCoins, refreshGamification } = useGamification();
    
    const [tiers, setTiers] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [selectedTier, setSelectedTier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchTiers();
            setSelectedTier(null);
            setSuccess(false);
            setError(null);
        }
    }, [isOpen]);

    const fetchTiers = async () => {
        try {
            const response = await api.get('/paper-trading/refill-tiers');
            if (response.data.success) {
                setTiers(response.data.tiers);
                setUserInfo(response.data.userInfo);
            }
        } catch (err) {
            console.error('Error fetching tiers:', err);
            setError('Failed to load refill options');
        }
    };

    const handleRefill = async () => {
        if (!selectedTier) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/paper-trading/refill', {
                tierIndex: selectedTier.index
            });

            if (response.data.success) {
                setSuccess(true);
                setSuccessData(response.data);
                refreshGamification();
                if (onRefillSuccess) {
                    onRefillSuccess(response.data);
                }
            }
        } catch (err) {
            console.error('Refill error:', err);
            // Server sends { error: '...' }, not { message: '...' }
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to refill account');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedTier(null);
        setSuccess(false);
        setSuccessData(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const currentBalance = userInfo?.currentBalance ?? currentCashBalance;
    const roomToFill = userInfo?.roomToFill ?? (MAX_BALANCE - currentBalance);
    const percentFull = Math.min(100, (currentBalance / MAX_BALANCE) * 100);
    const atMaximum = currentBalance >= MAX_BALANCE;

    const effectiveAmount = selectedTier 
        ? (selectedTier.isFullRefill ? roomToFill : Math.min(selectedTier.amount, roomToFill))
        : 0;
    const willBeCapped = selectedTier && !selectedTier.isFullRefill && selectedTier.amount > roomToFill;
    const newBalance = selectedTier ? Math.min(currentBalance + effectiveAmount, MAX_BALANCE) : currentBalance;
    const canAfford = selectedTier ? (nexusCoins >= selectedTier.coins) : true;

    return (
        <Overlay onClick={handleClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>
                        <Coins size={28} color="#a78bfa" />
                        Refill Account
                    </Title>
                    <CloseButton onClick={handleClose}>
                        <X size={20} />
                    </CloseButton>
                </Header>

                <Content>
                    {success ? (
                        <SuccessState>
                            <SuccessIcon>
                                <CheckCircle size={40} color="#10b981" />
                            </SuccessIcon>
                            <SuccessTitle>Refill Successful!</SuccessTitle>
                            <SuccessSubtitle>
                                {successData?.refillDetails?.wasCapped 
                                    ? `Added $${successData.refillDetails.amountAdded.toLocaleString()} (capped at maximum)`
                                    : `Added $${successData?.refillDetails?.amountAdded?.toLocaleString() || '0'} to your account`
                                }
                            </SuccessSubtitle>

                            <SuccessStats>
                                <SuccessStat>
                                    <SuccessStatLabel>New Balance</SuccessStatLabel>
                                    <SuccessStatValue $color="#10b981">
                                        ${successData?.account?.cashBalance?.toLocaleString() || '0'}
                                    </SuccessStatValue>
                                </SuccessStat>
                                <SuccessStat>
                                    <SuccessStatLabel>Coins Used</SuccessStatLabel>
                                    <SuccessStatValue $color="#f59e0b">
                                        {successData?.refillDetails?.coinsUsed || 0}
                                    </SuccessStatValue>
                                </SuccessStat>
                                <SuccessStat>
                                    <SuccessStatLabel>Remaining Coins</SuccessStatLabel>
                                    <SuccessStatValue>
                                        {successData?.gamification?.nexusCoins?.toLocaleString() || 0}
                                    </SuccessStatValue>
                                </SuccessStat>
                                <SuccessStat>
                                    <SuccessStatLabel>Times Refilled</SuccessStatLabel>
                                    <SuccessStatValue $color="#00adef">
                                        {successData?.account?.refillCount || 1}
                                    </SuccessStatValue>
                                </SuccessStat>
                            </SuccessStats>

                            <CloseSuccessButton onClick={handleClose}>
                                Continue Trading
                            </CloseSuccessButton>
                        </SuccessState>
                    ) : (
                        <>
                            <BalanceInfo>
                                <BalanceCard>
                                    <BalanceLabel>Current Balance</BalanceLabel>
                                    <BalanceValue $color="#00adef">
                                        <DollarSign size={20} />
                                        {currentBalance.toLocaleString()}
                                    </BalanceValue>
                                </BalanceCard>
                                <BalanceCard>
                                    <BalanceLabel>Your Nexus Coins</BalanceLabel>
                                    <BalanceValue $color="#f59e0b">
                                        <Coins size={20} />
                                        {nexusCoins?.toLocaleString() || 0}
                                    </BalanceValue>
                                </BalanceCard>
                            </BalanceInfo>

                            <BalanceProgress>
                                <ProgressLabel>
                                    <span>Balance Progress</span>
                                    <span>${currentBalance.toLocaleString()} / ${MAX_BALANCE.toLocaleString()}</span>
                                </ProgressLabel>
                                <ProgressBar>
                                    <ProgressFill $percent={percentFull} />
                                </ProgressBar>
                                <RoomToFill $atMax={atMaximum}>
                                    {atMaximum 
                                        ? '✓ Maximum balance reached!'
                                        : `Room to add: $${roomToFill.toLocaleString()}`
                                    }
                                </RoomToFill>
                            </BalanceProgress>

                            {atMaximum ? (
                                <MaxWarning>
                                    <MaxWarningIcon>
                                        <Lock size={30} color="#ef4444" />
                                    </MaxWarningIcon>
                                    <MaxWarningTitle>Maximum Balance Reached</MaxWarningTitle>
                                    <MaxWarningText>
                                        Your balance is at the $100,000 maximum. 
                                        Spend some funds trading before you can refill again!
                                    </MaxWarningText>
                                </MaxWarning>
                            ) : (
                                <>
                                    <TiersGrid>
                                        {tiers.map((tier, index) => {
                                            const Icon = TIER_ICONS[index] || DollarSign;
                                            const isDisabled = !tier.canAfford || atMaximum;
                                            const tierEffectiveAmount = tier.isFullRefill 
                                                ? roomToFill 
                                                : Math.min(tier.amount, roomToFill);
                                            const tierWillBeCapped = !tier.isFullRefill && tier.amount > roomToFill;

                                            return (
                                                <TierCard
                                                    key={tier.index}
                                                    $selected={selectedTier?.index === tier.index}
                                                    $disabled={isDisabled}
                                                    $isFull={tier.isFullRefill}
                                                    onClick={() => !isDisabled && setSelectedTier(tier)}
                                                    disabled={isDisabled}
                                                >
                                                    {tier.isFullRefill && <TierBadge>Best Value</TierBadge>}
                                                    {tierWillBeCapped && !tier.isFullRefill && (
                                                        <TierBadge $type="capped">Capped</TierBadge>
                                                    )}
                                                    
                                                    <TierIcon $bg={`${TIER_COLORS[index]}20`} $color={TIER_COLORS[index]}>
                                                        <Icon size={20} />
                                                    </TierIcon>
                                                    
                                                    <TierAmount $disabled={isDisabled}>
                                                        {tier.isFullRefill ? 'Full Refill' : tier.label}
                                                    </TierAmount>
                                                    
                                                    <TierCost $disabled={isDisabled}>
                                                        <Coins size={14} />
                                                        {tier.coins.toLocaleString()}
                                                    </TierCost>

                                                    {tierWillBeCapped && !tier.isFullRefill && (
                                                        <CappedNotice>
                                                            <Info size={10} />
                                                            Adds ${tierEffectiveAmount.toLocaleString()}
                                                        </CappedNotice>
                                                    )}
                                                </TierCard>
                                            );
                                        })}
                                    </TiersGrid>

                                    {selectedTier && !canAfford && (
                                        <InsufficientFunds>
                                            <InsufficientIcon>
                                                <AlertTriangle size={20} color="#ef4444" />
                                            </InsufficientIcon>
                                            <InsufficientText>
                                                You need <strong>{selectedTier.coins.toLocaleString()}</strong> Nexus Coins 
                                                but only have <strong>{nexusCoins?.toLocaleString() || 0}</strong>. 
                                                Earn more by trading or completing achievements!
                                            </InsufficientText>
                                        </InsufficientFunds>
                                    )}

                                    {selectedTier && canAfford && (
                                        <SummaryBox>
                                            <SummaryTitle>
                                                <Zap size={18} />
                                                Refill Summary
                                            </SummaryTitle>
                                            <SummaryRow>
                                                <SummaryLabel>Current Balance</SummaryLabel>
                                                <SummaryValue>${currentBalance.toLocaleString()}</SummaryValue>
                                            </SummaryRow>
                                            <SummaryRow>
                                                <SummaryLabel>
                                                    Amount to Add
                                                    {willBeCapped && ' (capped)'}
                                                </SummaryLabel>
                                                <SummaryValue $color="#10b981">
                                                    +${effectiveAmount.toLocaleString()}
                                                </SummaryValue>
                                            </SummaryRow>
                                            <SummaryRow>
                                                <SummaryLabel>Cost</SummaryLabel>
                                                <SummaryValue $color="#f59e0b">
                                                    {selectedTier.coins.toLocaleString()} coins
                                                </SummaryValue>
                                            </SummaryRow>
                                            <SummaryRow>
                                                <SummaryLabel>New Balance</SummaryLabel>
                                                <SummaryValue $color="#00adef" $large>
                                                    ${newBalance.toLocaleString()}
                                                </SummaryValue>
                                            </SummaryRow>

                                            {willBeCapped && (
                                                <CappedWarning>
                                                    <AlertTriangle size={16} />
                                                    <span>
                                                        Amount capped to stay within $100,000 maximum. 
                                                        You'll receive ${effectiveAmount.toLocaleString()} instead of ${selectedTier.amount.toLocaleString()}.
                                                    </span>
                                                </CappedWarning>
                                            )}
                                        </SummaryBox>
                                    )}

                                    {error && (
                                        <InsufficientFunds>
                                            <InsufficientIcon>
                                                <AlertTriangle size={20} color="#ef4444" />
                                            </InsufficientIcon>
                                            <InsufficientText>{error}</InsufficientText>
                                        </InsufficientFunds>
                                    )}

                                    <SubmitButton
                                        onClick={handleRefill}
                                        disabled={!selectedTier || !canAfford || loading || atMaximum}
                                        $disabled={!selectedTier || !canAfford || loading || atMaximum}
                                    >
                                        {loading ? (
                                            'Processing...'
                                        ) : !selectedTier ? (
                                            'Select a Refill Tier'
                                        ) : !canAfford ? (
                                            'Insufficient Coins'
                                        ) : (
                                            <>
                                                <Zap size={20} />
                                                Refill for {selectedTier.coins.toLocaleString()} Coins
                                            </>
                                        )}
                                    </SubmitButton>
                                </>
                            )}
                        </>
                    )}
                </Content>
            </Modal>
        </Overlay>
    );
};

export default RefillAccountModal;