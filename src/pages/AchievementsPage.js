// client/src/pages/AchievementsPage.js - THEMED ACHIEVEMENTS PAGE
import React from 'react';
import styled, { keyframes, useTheme as useStyledTheme } from 'styled-components';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import AchievementsGrid from '../components/gamification/AchievementsGrid';
import XPBar from '../components/gamification/XPBar';
import StatsPanel from '../components/gamification/StatsPanel';
import { Trophy, Star, Award, Sparkles } from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const glow = keyframes`
    0%, 100% { 
        filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.4));
    }
    50% { 
        filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.6));
    }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: ${({ theme }) => theme.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    position: relative;
    overflow-x: hidden;
`;

const BackgroundOrbs = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: ${float} ${props => props.$duration || '20s'} ease-in-out infinite;
    
    &:nth-child(1) {
        width: 400px;
        height: 400px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.accent || '#8b5cf6'}66 0%, transparent 70%)`};
        top: 10%;
        left: -100px;
    }
    
    &:nth-child(2) {
        width: 300px;
        height: 300px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.primary || '#00adef'}66 0%, transparent 70%)`};
        top: 50%;
        right: -50px;
        animation-delay: -5s;
    }
    
    &:nth-child(3) {
        width: 350px;
        height: 350px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.success || '#00ff88'}4D 0%, transparent 70%)`};
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
    position: relative;
    z-index: 1;
`;

const TitleWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
    animation: ${glow} 2s ease-in-out infinite;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const StatsBar = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
`;

const StatBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.accent || '#8b5cf6'}33 0%, ${theme.brand?.accent || '#8b5cf6'}1A 100%)`};
    border: 1px solid ${({ theme }) => `${theme.brand?.accent || '#8b5cf6'}66`};
    border-radius: 20px;
    color: ${({ theme }) => theme.brand?.accent || '#8b5cf6'};
    font-weight: 600;
    font-size: 0.9rem;
`;

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    position: relative;
    z-index: 1;
`;

const AchievementsPage = () => {
    const theme = useStyledTheme();
    const { profileThemeId } = useThemeContext();

    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <Header>
                <TitleWrapper>
                    <TitleIcon>
                        <Trophy size={56} color={theme?.brand?.accent || '#8b5cf6'} />
                    </TitleIcon>
                    <Title>Achievements</Title>
                    <TitleIcon>
                        <Sparkles size={40} color={theme?.brand?.primary || '#00adef'} />
                    </TitleIcon>
                </TitleWrapper>
                <Subtitle>Track your progress and unlock rewards</Subtitle>
                <StatsBar>
                    <StatBadge>
                        <Trophy size={18} />
                        Unlock Achievements
                    </StatBadge>
                    <StatBadge>
                        <Star size={18} />
                        Earn XP
                    </StatBadge>
                    <StatBadge>
                        <Award size={18} />
                        Climb Ranks
                    </StatBadge>
                </StatsBar>
            </Header>

            <Content>
                <XPBar />
                <StatsPanel />
                <AchievementsGrid />
            </Content>
        </PageContainer>
    );
};

export default AchievementsPage;