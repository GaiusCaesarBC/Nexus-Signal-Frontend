// client/src/components/gamification/XPBar.js
// XP Progress Bar with auto-calculated level from XP

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Star, Coins, TrendingUp, Flame } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';

// ============ ANIMATIONS ============
const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

// ============ STYLED COMPONENTS ============
const Container = styled.div`
    background: linear-gradient(135deg, ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.8)'} 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    @media (max-width: 768px) {
        padding: 1rem 1.25rem;
    }
`;

const TopRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
`;

const LevelInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const LevelCircle = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
    
    @media (max-width: 768px) {
        width: 48px;
        height: 48px;
        font-size: 1.25rem;
    }
`;

const LevelDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const LevelTitle = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: #f8fafc;
    
    @media (max-width: 768px) {
        font-size: 1.25rem;
    }
`;

const RankText = styled.div`
    color: #a78bfa;
    font-size: 0.9rem;
    font-weight: 600;
`;

const CoinsDisplay = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 0.75rem 1.25rem;
    
    svg {
        color: #fbbf24;
    }
    
    span {
        color: #fbbf24;
        font-weight: 700;
        font-size: 1.1rem;
    }
`;

const ProgressSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const ProgressHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ProgressLabel = styled.span`
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
`;

const ProgressValue = styled.span`
    color: #a78bfa;
    font-size: 0.85rem;
    font-weight: 700;
`;

const ProgressTrack = styled.div`
    height: 12px;
    background: rgba(100, 116, 139, 0.3);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${props => Math.min(100, Math.max(0, props.$percent || 0))}%;
    background: linear-gradient(90deg, #8b5cf6 0%, #06b6d4 50%, #00ff88 100%);
    background-size: 200% 100%;
    border-radius: 6px;
    transition: width 0.5s ease;
    animation: ${shimmer} 3s ease-in-out infinite;
`;

const BottomRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 12px;
    padding: 0.75rem 1rem;
`;

const StatIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$bg || 'rgba(100, 116, 139, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
        color: ${props => props.$color || '#94a3b8'};
    }
`;

const StatInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const StatValue = styled.span`
    font-size: 1rem;
    font-weight: 700;
    color: #f8fafc;
`;

const StatLabel = styled.span`
    font-size: 0.75rem;
    color: #64748b;
`;

// ============ HELPER FUNCTIONS ============
const getRankForLevel = (level) => {
    if (level >= 100) return 'Wall Street Titan';
    if (level >= 75) return 'Market Mogul';
    if (level >= 50) return 'Trading Legend';
    if (level >= 40) return 'Master Trader';
    if (level >= 30) return 'Expert Trader';
    if (level >= 20) return 'Veteran Trader';
    if (level >= 15) return 'Advanced Trader';
    if (level >= 10) return 'Skilled Trader';
    if (level >= 5) return 'Apprentice Trader';
    if (level >= 2) return 'Novice Trader';
    return 'Rookie Trader';
};

// ============ COMPONENT ============
const XPBar = () => {
    const { gamificationData, loading } = useGamification();

    // ✅ FIXED: Use server-calculated level instead of wrong client-side formula
    // The server uses LEVEL_THRESHOLDS array, not simple XP/1000
    const calculatedLevel = gamificationData?.level || 1;
    const calculatedRank = gamificationData?.title || gamificationData?.rank || getRankForLevel(calculatedLevel);
    const totalXp = gamificationData?.xp || 0;
    const nexusCoins = gamificationData?.nexusCoins || 0;
    const loginStreak = gamificationData?.loginStreak || 0;

    // Use server-provided XP progress values
    const xpForCurrentLevel = gamificationData?.xpForCurrentLevel || 0;
    const xpForNextLevel = gamificationData?.xpForNextLevel || 1000;
    const xpInCurrentLevel = totalXp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = xpNeeded > 0 ? (xpInCurrentLevel / xpNeeded) * 100 : (gamificationData?.progressPercent || 0);

    if (loading) {
        return (
            <Container style={{ opacity: 0.5 }}>
                <TopRow>
                    <LevelInfo>
                        <LevelCircle>-</LevelCircle>
                        <LevelDetails>
                            <LevelTitle>Loading...</LevelTitle>
                            <RankText>Please wait</RankText>
                        </LevelDetails>
                    </LevelInfo>
                </TopRow>
            </Container>
        );
    }

    return (
        <Container>
            <TopRow>
                <LevelInfo>
                    <LevelCircle>
                        <Star size={24} />
                    </LevelCircle>
                    <LevelDetails>
                        <LevelTitle>Level {calculatedLevel}</LevelTitle>
                        <RankText>{calculatedRank}</RankText>
                    </LevelDetails>
                </LevelInfo>
                
                <CoinsDisplay>
                    <Coins size={20} />
                    <span>{nexusCoins.toLocaleString()} Coins</span>
                </CoinsDisplay>
            </TopRow>

            <ProgressSection>
                <ProgressHeader>
                    <ProgressLabel>Progress to Level {calculatedLevel + 1}</ProgressLabel>
                    <ProgressValue>
                        {Math.floor(xpInCurrentLevel).toLocaleString()} / {xpNeeded.toLocaleString()} XP
                    </ProgressValue>
                </ProgressHeader>
                <ProgressTrack>
                    <ProgressFill $percent={progressPercent} />
                </ProgressTrack>
            </ProgressSection>

            <BottomRow>
                <StatCard>
                    <StatIcon $bg="rgba(139, 92, 246, 0.15)" $color="#a78bfa">
                        <TrendingUp size={18} />
                    </StatIcon>
                    <StatInfo>
                        <StatValue>{totalXp.toLocaleString()} Total XP</StatValue>
                        <StatLabel>Lifetime experience</StatLabel>
                    </StatInfo>
                </StatCard>

                <StatCard>
                    <StatIcon $bg="rgba(249, 115, 22, 0.15)" $color="#f97316">
                        <Flame size={18} />
                    </StatIcon>
                    <StatInfo>
                        <StatValue>{loginStreak} Day Streak</StatValue>
                        <StatLabel>Keep it going!</StatLabel>
                    </StatInfo>
                </StatCard>
            </BottomRow>
        </Container>
    );
};

export default XPBar;