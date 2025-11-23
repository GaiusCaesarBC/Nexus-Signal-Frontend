// client/src/components/gamification/AchievementPopup.js
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useGamification } from '../../context/GamificationContext';
import { X, Award, Star } from 'lucide-react';

const slideIn = keyframes`
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
`;

const sparkle = keyframes`
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const Container = styled.div`
    position: fixed;
    top: 100px;
    right: 2rem;
    z-index: 10000;
    animation: ${props => props.$closing ? slideOut : slideIn} 0.5s ease-out forwards;

    @media (max-width: 768px) {
        right: 1rem;
        left: 1rem;
    }
`;

const Card = styled.div`
    background: linear-gradient(135deg, 
        ${props => {
            if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1)';
            if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1)';
            if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1)';
            return 'rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1)';
        }}
    );
    border: 2px solid ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.5)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.5)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.5)';
        return 'rgba(16, 185, 129, 0.5)';
    }};
    border-radius: 16px;
    padding: 1.5rem;
    min-width: 350px;
    max-width: 400px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.4)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.4)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.4)';
        return 'rgba(16, 185, 129, 0.4)';
    }};

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    @media (max-width: 768px) {
        min-width: unset;
        max-width: unset;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => {
        if (props.$rarity === 'legendary') return '#f59e0b';
        if (props.$rarity === 'epic') return '#a78bfa';
        if (props.$rarity === 'rare') return '#60a5fa';
        return '#10b981';
    }};
    font-weight: 700;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const CloseButton = styled.button`
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 0, 0, 0.3);
        color: #e0e6ed;
        transform: scale(1.1);
    }
`;

const Content = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
`;

const IconContainer = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rarity === 'legendary') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1))';
        if (props.$rarity === 'epic') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))';
        if (props.$rarity === 'rare') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1))';
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))';
    }};
    border: 2px solid ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.5)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.5)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.5)';
        return 'rgba(16, 185, 129, 0.5)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    animation: ${pulse} 2s ease-in-out infinite;
    position: relative;
    flex-shrink: 0;

    &::before, &::after {
        content: '✨';
        position: absolute;
        font-size: 1.5rem;
        animation: ${sparkle} 2s ease-in-out infinite;
    }

    &::before {
        top: -10px;
        right: -10px;
        animation-delay: 0.5s;
    }

    &::after {
        bottom: -10px;
        left: -10px;
        animation-delay: 1s;
    }
`;

const Info = styled.div`
    flex: 1;
`;

const AchievementName = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    color: #e0e6ed;
    margin-bottom: 0.25rem;
`;

const AchievementDescription = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
`;

const Reward = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
    font-size: 0.85rem;
`;

const AchievementPopup = () => {
    const { showAchievement, setShowAchievement, currentAchievement } = useGamification();
    const [closing, setClosing] = React.useState(false);

    if (!showAchievement || !currentAchievement) return null;

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setShowAchievement(false);
            setClosing(false);
        }, 500);
    };

    return (
        <Container $closing={closing}>
            <Card $rarity={currentAchievement.rarity}>
                <Header>
                    <Title $rarity={currentAchievement.rarity}>
                        <Award size={18} />
                        Achievement Unlocked!
                    </Title>
                    <CloseButton onClick={handleClose}>
                        <X size={16} />
                    </CloseButton>
                </Header>
                <Content>
                    <IconContainer $rarity={currentAchievement.rarity}>
                        {currentAchievement.icon}
                    </IconContainer>
                    <Info>
                        <AchievementName>{currentAchievement.name}</AchievementName>
                        <AchievementDescription>{currentAchievement.description}</AchievementDescription>
                        <Reward>
                            <Star size={14} />
                            +{currentAchievement.points} XP
                        </Reward>
                    </Info>
                </Content>
            </Card>
        </Container>
    );
};

export default AchievementPopup;