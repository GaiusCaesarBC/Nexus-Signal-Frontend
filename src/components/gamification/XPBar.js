// client/src/components/gamification/XPBar.js
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useGamification } from '../../context/GamificationContext';
import { TrendingUp, Star, Zap } from 'lucide-react';

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const Container = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.25rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%);
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

const LevelInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const LevelBadge = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 1.2rem;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
    animation: ${pulse} 2s ease-in-out infinite;
`;

const LevelText = styled.div``;

const LevelNumber = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: #a78bfa;
    line-height: 1;
`;

const RankText = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
`;

const CoinsDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
`;

const ProgressContainer = styled.div`
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
    font-weight: 600;
`;

const ProgressNumbers = styled.div`
    color: #a78bfa;
    font-weight: 700;
    font-size: 0.9rem;
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 12px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(139, 92, 246, 0.3);
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${props => props.$progress || 0}%;
    background: linear-gradient(90deg, #8b5cf6, #6366f1, #00adef);
    border-radius: 6px;
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

const StatsRow = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    position: relative;
    z-index: 1;
`;

const StatBadge = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 10px;
    color: #a78bfa;
    font-size: 0.85rem;
    font-weight: 600;
`;

const XPBar = () => {
    const { gamificationData, loading } = useGamification();

    if (loading || !gamificationData) {
        return null;
    }

    const {
        xp,
        level,
        rank,
        nexusCoins,
        loginStreak,
        xpForNextLevel,
        xpInCurrentLevel,
        progressPercent
    } = gamificationData;

    return (
        <Container>
            <Header>
                <LevelInfo>
                    <LevelBadge>
                        <Star size={24} />
                    </LevelBadge>
                    <LevelText>
                        <LevelNumber>Level {level}</LevelNumber>
                        <RankText>{rank}</RankText>
                    </LevelText>
                </LevelInfo>
                <CoinsDisplay>
                    <Zap size={18} />
                    {nexusCoins?.toLocaleString()} Coins
                </CoinsDisplay>
            </Header>

            <ProgressContainer>
                <ProgressInfo>
                    <ProgressLabel>Progress to Level {level + 1}</ProgressLabel>
                    <ProgressNumbers>
                        {Math.floor(xpInCurrentLevel).toLocaleString()} / {(xpForNextLevel - Math.pow(level - 1, 2) * 100).toLocaleString()} XP
                    </ProgressNumbers>
                </ProgressInfo>
                <ProgressBar>
                    <ProgressFill $progress={progressPercent} />
                </ProgressBar>
            </ProgressContainer>

            <StatsRow>
                <StatBadge>
                    <TrendingUp size={16} />
                    {xp?.toLocaleString()} Total XP
                </StatBadge>
                <StatBadge>
                    🔥 {loginStreak} Day Streak
                </StatBadge>
            </StatsRow>
        </Container>
    );
};

export default XPBar;