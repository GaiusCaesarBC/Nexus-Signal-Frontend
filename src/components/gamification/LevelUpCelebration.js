// client/src/components/gamification/LevelUpCelebration.js
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGamification } from '../../context/GamificationContext';
import { TrendingUp, Zap, Star, Trophy } from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const scaleIn = keyframes`
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    50% { transform: scale(1.2) rotate(0deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const confetti = keyframes`
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${fadeIn} 0.5s ease-out;
`;

const Container = styled.div`
    text-align: center;
    animation: ${scaleIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 1;
`;

const IconContainer = styled.div`
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: ${float} 3s ease-in-out infinite;
    box-shadow: 0 20px 80px rgba(245, 158, 11, 0.6);

    &::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border-radius: 50%;
        border: 3px solid rgba(245, 158, 11, 0.3);
        animation: ${float} 3s ease-in-out infinite;
        animation-delay: 0.2s;
    }

    &::after {
        content: '';
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        bottom: -20px;
        border-radius: 50%;
        border: 3px solid rgba(245, 158, 11, 0.2);
        animation: ${float} 3s ease-in-out infinite;
        animation-delay: 0.4s;
    }
`;

const Title = styled.h1`
    font-size: 4rem;
    font-weight: 900;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    background-size: 200% 200%;
    animation: ${shimmer} 2s linear infinite;

    @media (max-width: 768px) {
        font-size: 3rem;
    }
`;

const Subtitle = styled.p`
    font-size: 1.5rem;
    color: #94a3b8;
    margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 2px solid rgba(139, 92, 246, 0.4);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    min-width: 150px;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: #a78bfa;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

const Reward = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%);
    border: 2px solid rgba(245, 158, 11, 0.5);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
`;

const ContinueButton = styled.button`
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 50px rgba(139, 92, 246, 0.6);
    }
`;

const Confetti = styled.div`
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${props => props.$color};
    top: ${props => props.$top}%;
    left: ${props => props.$left}%;
    animation: ${confetti} ${props => props.$duration}s linear infinite;
    animation-delay: ${props => props.$delay}s;
    border-radius: 50%;
`;

const LevelUpCelebration = () => {
    const { showLevelUp, setShowLevelUp, levelUpData } = useGamification();
    const [confettiPieces, setConfettiPieces] = useState([]);

    useEffect(() => {
        if (showLevelUp) {
            // Generate confetti
            const pieces = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                color: ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6'][Math.floor(Math.random() * 5)],
                top: Math.random() * 100,
                left: Math.random() * 100,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2
            }));
            setConfettiPieces(pieces);
        }
    }, [showLevelUp]);

    if (!showLevelUp || !levelUpData) return null;

    return (
        <Overlay onClick={() => setShowLevelUp(false)}>
            {confettiPieces.map(piece => (
                <Confetti
                    key={piece.id}
                    $color={piece.color}
                    $top={piece.top}
                    $left={piece.left}
                    $duration={piece.duration}
                    $delay={piece.delay}
                />
            ))}
            
            <Container onClick={(e) => e.stopPropagation()}>
                <IconContainer>
                    <Trophy size={80} color="white" />
                </IconContainer>

                <Title>LEVEL UP!</Title>
                <Subtitle>You've reached a new level!</Subtitle>

                <StatsGrid>
                    <StatCard>
                        <StatLabel>New Level</StatLabel>
                        <StatValue>
                            <TrendingUp size={32} />
                            {levelUpData.newLevel}
                        </StatValue>
                    </StatCard>

                    <StatCard>
                        <StatLabel>New Rank</StatLabel>
                        <StatValue>
                            <Star size={32} />
                            <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                {levelUpData.rank}
                            </div>
                        </StatValue>
                    </StatCard>
                </StatsGrid>

                <Reward>
                    <Zap size={24} />
                    +{levelUpData.coinReward} Nexus Coins Earned!
                </Reward>

                <ContinueButton onClick={() => setShowLevelUp(false)}>
                    Continue Trading
                </ContinueButton>
            </Container>
        </Overlay>
    );
};

export default LevelUpCelebration;