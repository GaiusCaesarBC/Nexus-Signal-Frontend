// client/src/components/gamification/StatsPanel.js
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useGamification } from '../../context/GamificationContext';
import { TrendingUp, Target, Brain, Flame, Trophy, Activity } from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const Container = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
`;

const StatCard = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => {
        if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
        if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.$variant === 'success') return '#10b981';
        if (props.$variant === 'warning') return '#f59e0b';
        if (props.$variant === 'danger') return '#ef4444';
        return '#00adef';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    animation: ${pulse} 2s ease-in-out infinite;
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
    color: ${props => {
        if (props.$variant === 'success') return '#10b981';
        if (props.$variant === 'warning') return '#f59e0b';
        if (props.$variant === 'danger') return '#ef4444';
        return '#00adef';
    }};
`;

const StatSubtext = styled.div`
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 0.25rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
`;

const StatsPanel = () => {
    const { gamificationData, loading } = useGamification();

    if (loading) {
        return (
            <Container>
                <EmptyState>Loading stats...</EmptyState>
            </Container>
        );
    }

    if (!gamificationData || !gamificationData.stats) {
        return (
            <Container>
                <EmptyState>No stats available yet</EmptyState>
            </Container>
        );
    }

    const stats = gamificationData.stats;
    const winRate = stats.totalTrades > 0 ? (stats.profitableTrades / stats.totalTrades) * 100 : 0;
    const predictionAccuracy = stats.predictionsCreated > 0 ? (stats.correctPredictions / stats.predictionsCreated) * 100 : 0;

    return (
        <Container>
            <Title>
                <Activity size={24} />
                Your Statistics
            </Title>

            <StatsGrid>
                <StatCard>
                    <StatIcon>
                        <TrendingUp size={24} />
                    </StatIcon>
                    <StatLabel>Total Trades</StatLabel>
                    <StatValue>{stats.totalTrades?.toLocaleString() || 0}</StatValue>
                    <StatSubtext>
                        {stats.profitableTrades || 0} profitable
                    </StatSubtext>
                </StatCard>

                <StatCard>
                    <StatIcon $variant={winRate >= 50 ? 'success' : 'danger'}>
                        <Target size={24} />
                    </StatIcon>
                    <StatLabel>Win Rate</StatLabel>
                    <StatValue $variant={winRate >= 50 ? 'success' : 'danger'}>
                        {winRate.toFixed(1)}%
                    </StatValue>
                    <StatSubtext>
                        {stats.profitableTrades || 0} / {stats.totalTrades || 0} wins
                    </StatSubtext>
                </StatCard>

                <StatCard>
                    <StatIcon $variant="success">
                        <Trophy size={24} />
                    </StatIcon>
                    <StatLabel>Total Profit</StatLabel>
                    <StatValue $variant="success">
                        ${stats.totalProfit?.toFixed(2) || '0.00'}
                    </StatValue>
                    <StatSubtext>
                        All-time earnings
                    </StatSubtext>
                </StatCard>

                <StatCard>
                    <StatIcon $variant="warning">
                        <Brain size={24} />
                    </StatIcon>
                    <StatLabel>Predictions</StatLabel>
                    <StatValue $variant="warning">
                        {stats.predictionsCreated || 0}
                    </StatValue>
                    <StatSubtext>
                        {predictionAccuracy.toFixed(1)}% accuracy
                    </StatSubtext>
                </StatCard>

                <StatCard>
                    <StatIcon>
                        <Flame size={24} />
                    </StatIcon>
                    <StatLabel>Best Streak</StatLabel>
                    <StatValue>
                        {gamificationData.maxProfitStreak || 0}
                    </StatValue>
                    <StatSubtext>
                        Profitable trades in a row
                    </StatSubtext>
                </StatCard>

                <StatCard>
                    <StatIcon>
                        <Activity size={24} />
                    </StatIcon>
                    <StatLabel>Days Active</StatLabel>
                    <StatValue>
                        {stats.daysActive || 0}
                    </StatValue>
                    <StatSubtext>
                        Total days trading
                    </StatSubtext>
                </StatCard>
            </StatsGrid>
        </Container>
    );
};

export default StatsPanel;
