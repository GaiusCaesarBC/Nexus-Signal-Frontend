// client/src/components/gamification/DailyChallengeCard.js
import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGamification } from '../../context/GamificationContext';
import { useAuth } from '../../context/AuthContext';
import { Target, Zap, CheckCircle, Clock } from 'lucide-react';

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const Container = styled.div`
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #60a5fa;
    font-weight: 700;
    font-size: 1.1rem;
`;

const TimeRemaining = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
    font-size: 0.85rem;
`;

const ChallengeText = styled.div`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const ProgressContainer = styled.div`
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const ProgressInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const ProgressLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const ProgressNumbers = styled.div`
    color: #60a5fa;
    font-weight: 700;
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 10px;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid rgba(59, 130, 246, 0.3);
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${props => Math.min(props.$progress || 0, 100)}%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 5px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 2s linear infinite;
    }
`;

const RewardBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
`;

const CompletedBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(16, 185, 129, 0.2);
    border: 2px solid rgba(16, 185, 129, 0.4);
    border-radius: 12px;
    color: #10b981;
    font-weight: 700;
    font-size: 1.1rem;
    animation: ${pulse} 2s ease-in-out infinite;
    position: relative;
    z-index: 1;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    position: relative;
    z-index: 1;
`;

const DailyChallengeCard = () => {
    const { gamificationData } = useGamification();
    const { api } = useAuth();

    useEffect(() => {
        // Generate daily challenge if not exists
        const generateChallenge = async () => {
            try {
                await api.post('/gamification/daily-challenge');
            } catch (error) {
                console.error('Error generating challenge:', error);
            }
        };

        if (gamificationData && !gamificationData.dailyChallenge) {
            generateChallenge();
        }
    }, [gamificationData, api]);

    if (!gamificationData || !gamificationData.dailyChallenge) {
        return (
            <Container>
                <EmptyState>
                    <Target size={48} color="#60a5fa" />
                    <p style={{ marginTop: '1rem' }}>Loading daily challenge...</p>
                </EmptyState>
            </Container>
        );
    }

    const challenge = gamificationData.dailyChallenge;
    const progress = (challenge.progress / challenge.target) * 100;
    const timeRemaining = new Date(challenge.expiresAt) - new Date();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

    if (challenge.completed) {
        return (
            <Container>
                <CompletedBadge>
                    <CheckCircle size={24} />
                    Challenge Completed!
                </CompletedBadge>
                <ChallengeText style={{ marginTop: '1rem' }}>
                    {challenge.challenge}
                </ChallengeText>
                <RewardBadge>
                    <Zap size={16} />
                    +{challenge.reward} Coins Earned
                </RewardBadge>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>
                    <Target size={20} />
                    Daily Challenge
                </Title>
                <TimeRemaining>
                    <Clock size={16} />
                    {hoursRemaining}h remaining
                </TimeRemaining>
            </Header>

            <ChallengeText>{challenge.challenge}</ChallengeText>

            <ProgressContainer>
                <ProgressInfo>
                    <ProgressLabel>Progress</ProgressLabel>
                    <ProgressNumbers>
                        {challenge.progress} / {challenge.target}
                    </ProgressNumbers>
                </ProgressInfo>
                <ProgressBar>
                    <ProgressFill $progress={progress} />
                </ProgressBar>
            </ProgressContainer>

            <RewardBadge>
                <Zap size={16} />
                Reward: {challenge.reward} Coins
            </RewardBadge>
        </Container>
    );
};

export default DailyChallengeCard;