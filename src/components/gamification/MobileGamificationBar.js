// client/src/components/gamification/MobileGamificationBar.js
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useGamification } from '../../context/GamificationContext';
import { Star, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const Container = styled.div`
    display: none;
    position: fixed;
    bottom: 60px; // Above mobile nav
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.95)'};
    backdrop-filter: blur(10px);
    border-top: 2px solid rgba(139, 92, 246, 0.4);
    padding: 0.75rem 1rem;
    z-index: 999;

    @media (max-width: 968px) {
        display: flex;
    }
`;

const Content = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
`;

const LevelSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
`;

const LevelBadge = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 0.85rem;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
`;

const LevelText = styled.div`
    display: flex;
    flex-direction: column;
`;

const LevelNumber = styled.div`
    color: #a78bfa;
    font-weight: 700;
    font-size: 0.9rem;
    line-height: 1;
`;

const RankText = styled.div`
    color: #64748b;
    font-size: 0.7rem;
`;

const XPSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const XPLabel = styled.div`
    color: #94a3b8;
    font-size: 0.7rem;
    display: flex;
    justify-content: space-between;
`;

const XPBar = styled.div`
    width: 100%;
    height: 6px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 3px;
    overflow: hidden;
`;

const XPFill = styled.div`
    height: 100%;
    width: ${props => props.$progress || 0}%;
    background: linear-gradient(90deg, #8b5cf6, #00adef);
    border-radius: 3px;
    transition: width 0.5s ease;
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

const CoinsSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
`;

const MobileGamificationBar = () => {
    const { gamificationData, loading } = useGamification();
    const navigate = useNavigate();

    if (loading || !gamificationData) {
        return null;
    }

    const {
        level,
        rank,
        nexusCoins,
        progressPercent,
        xpInCurrentLevel,
        xpForNextLevel
    } = gamificationData;

    const xpNeeded = xpForNextLevel - Math.pow(level - 1, 2) * 100;

    return (
        <Container>
            <Content>
                <LevelSection onClick={() => navigate('/achievements')}>
                    <LevelBadge>
                        <Star size={16} />
                    </LevelBadge>
                    <LevelText>
                        <LevelNumber>Lv. {level}</LevelNumber>
                        <RankText>{rank.split(' ')[0]}</RankText>
                    </LevelText>
                </LevelSection>

                <XPSection>
                    <XPLabel>
                        <span>XP Progress</span>
                        <span>{Math.floor(xpInCurrentLevel)}/{xpNeeded}</span>
                    </XPLabel>
                    <XPBar>
                        <XPFill $progress={progressPercent} />
                    </XPBar>
                </XPSection>

                <CoinsSection onClick={() => navigate('/achievements')}>
                    <Zap size={16} />
                    {nexusCoins >= 1000 
                        ? `${(nexusCoins / 1000).toFixed(1)}k` 
                        : nexusCoins
                    }
                </CoinsSection>
            </Content>
        </Container>
    );
};

export default MobileGamificationBar;