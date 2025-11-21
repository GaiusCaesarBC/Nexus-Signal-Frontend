// src/components/UserStats.js - Trading Statistics Display Component

import React from 'react';
import styled from 'styled-components';

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin: 24px 0;
`;

const StatCard = styled.div`
    background: ${props => props.theme.colors.cardBackground || '#1f2937'};
    border: 1px solid ${props => props.theme.colors.border || '#374151'};
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        border-color: ${props => props.theme.colors.primary || '#3b82f6'};
    }
`;

const StatLabel = styled.div`
    font-size: 13px;
    color: ${props => props.theme.colors.textSecondary || '#9ca3af'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    font-weight: 500;
`;

const StatValue = styled.div`
    font-size: 28px;
    font-weight: 700;
    color: ${props => {
        if (props.$positive) return props.theme.colors.success || '#10b981';
        if (props.$negative) return props.theme.colors.danger || '#ef4444';
        return props.theme.colors.text || '#f9fafb';
    }};
    display: flex;
    align-items: center;
    gap: 8px;
`;

const StatIcon = styled.span`
    font-size: 20px;
`;

const TrendIndicator = styled.span`
    font-size: 14px;
    opacity: 0.8;
`;

const UserStats = ({ stats = {} }) => {
    const {
        totalTrades = 0,
        winRate = 0,
        totalReturn = 0,
        totalReturnPercent = 0,
        bestTrade = 0,
        worstTrade = 0,
        currentStreak = 0,
        longestStreak = 0,
    } = stats;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatPercent = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    const isPositive = (value) => value > 0;
    const isNegative = (value) => value < 0;

    return (
        <StatsContainer>
            <StatCard>
                <StatLabel>Total Return</StatLabel>
                <StatValue $positive={isPositive(totalReturn)} $negative={isNegative(totalReturn)}>
                    <StatIcon>{isPositive(totalReturn) ? '📈' : isNegative(totalReturn) ? '📉' : '➖'}</StatIcon>
                    {formatCurrency(totalReturn)}
                    {totalReturnPercent !== 0 && (
                        <TrendIndicator>{formatPercent(totalReturnPercent)}</TrendIndicator>
                    )}
                </StatValue>
            </StatCard>

            <StatCard>
                <StatLabel>Win Rate</StatLabel>
                <StatValue $positive={winRate >= 50} $negative={winRate < 50 && winRate > 0}>
                    <StatIcon>{winRate >= 70 ? '🔥' : winRate >= 50 ? '👍' : '⚠️'}</StatIcon>
                    {winRate.toFixed(1)}%
                </StatValue>
            </StatCard>

            <StatCard>
                <StatLabel>Total Trades</StatLabel>
                <StatValue>
                    <StatIcon>📊</StatIcon>
                    {totalTrades.toLocaleString()}
                </StatValue>
            </StatCard>

            <StatCard>
                <StatLabel>Best Trade</StatLabel>
                <StatValue $positive={isPositive(bestTrade)}>
                    <StatIcon>💎</StatIcon>
                    {formatCurrency(bestTrade)}
                </StatValue>
            </StatCard>

            <StatCard>
                <StatLabel>Worst Trade</StatLabel>
                <StatValue $negative={isNegative(worstTrade)}>
                    <StatIcon>💔</StatIcon>
                    {formatCurrency(worstTrade)}
                </StatValue>
            </StatCard>

            <StatCard>
                <StatLabel>Current Streak</StatLabel>
                <StatValue $positive={currentStreak > 0} $negative={currentStreak < 0}>
                    <StatIcon>{currentStreak > 0 ? '🔥' : currentStreak < 0 ? '❄️' : '➖'}</StatIcon>
                    {Math.abs(currentStreak)} {currentStreak > 0 ? 'Wins' : currentStreak < 0 ? 'Losses' : 'Trades'}
                </StatValue>
            </StatCard>

            <StatCard>
                <StatLabel>Longest Streak</StatLabel>
                <StatValue>
                    <StatIcon>🏆</StatIcon>
                    {longestStreak} Wins
                </StatValue>
            </StatCard>

            <StatCard>
                <StatLabel>Avg Trade Size</StatLabel>
                <StatValue>
                    <StatIcon>💰</StatIcon>
                    {totalTrades > 0 ? formatCurrency(Math.abs(totalReturn) / totalTrades) : '$0.00'}
                </StatValue>
            </StatCard>
        </StatsContainer>
    );
};

export default UserStats;