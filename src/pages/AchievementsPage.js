// client/src/pages/AchievementsPage.js
import React from 'react';
import styled from 'styled-components';
import AchievementsGrid from '../components/gamification/AchievementsGrid';
import XPBar from '../components/gamification/XPBar';
import StatsPanel from '../components/gamification/StatsPanel';

const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const AchievementsPage = () => {
    return (
        <PageContainer>
            <Header>
                <Title>🏆 Achievements</Title>
                <Subtitle>Track your progress and unlock rewards</Subtitle>
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