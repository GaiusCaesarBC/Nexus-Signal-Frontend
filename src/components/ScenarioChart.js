// client/src/components/ScenarioChart.js - Price Scenario Visualization

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { TrendingUp, TrendingDown, Minus, Target, DollarSign } from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
`;

// ============ STYLED COMPONENTS ============
const Container = styled.div`
    background: ${({ theme }) => theme?.bg?.card || 'rgba(15, 23, 42, 0.95)'};
    border: 1px solid ${({ theme }) => theme?.brand?.primary || '#00adef'}40;
    border-radius: 16px;
    padding: 1.25rem;
    margin: 1rem 0;
    animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
    color: ${({ theme }) => theme?.text?.primary || '#e0e6ed'};
`;

const SymbolBadge = styled.span`
    background: ${({ theme }) => theme?.brand?.primary || '#00adef'}20;
    color: ${({ theme }) => theme?.brand?.primary || '#00adef'};
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
`;

const CurrentPrice = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme?.text?.primary || '#e0e6ed'};
`;

const ChartArea = styled.div`
    position: relative;
    height: 180px;
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const ScenarioRow = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 10px;
    background: ${({ $type }) => {
        if ($type === 'bullish') return 'rgba(16, 185, 129, 0.1)';
        if ($type === 'bearish') return 'rgba(239, 68, 68, 0.1)';
        return 'rgba(148, 163, 184, 0.1)';
    }};
    border-left: 4px solid ${({ $type }) => {
        if ($type === 'bullish') return '#10b981';
        if ($type === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
    transition: all 0.3s ease;

    &:hover {
        transform: translateX(4px);
        background: ${({ $type }) => {
            if ($type === 'bullish') return 'rgba(16, 185, 129, 0.15)';
            if ($type === 'bearish') return 'rgba(239, 68, 68, 0.15)';
            return 'rgba(148, 163, 184, 0.15)';
        }};
    }
`;

const ScenarioIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $type }) => {
        if ($type === 'bullish') return 'rgba(16, 185, 129, 0.2)';
        if ($type === 'bearish') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(148, 163, 184, 0.2)';
    }};
    color: ${({ $type }) => {
        if ($type === 'bullish') return '#10b981';
        if ($type === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
`;

const ScenarioInfo = styled.div`
    flex: 1;
`;

const ScenarioLabel = styled.div`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ $type }) => {
        if ($type === 'bullish') return '#10b981';
        if ($type === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ScenarioDesc = styled.div`
    font-size: 0.75rem;
    color: ${({ theme }) => theme?.text?.secondary || '#94a3b8'};
    margin-top: 2px;
`;

const PriceTarget = styled.div`
    text-align: right;
`;

const TargetPrice = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ $type }) => {
        if ($type === 'bullish') return '#10b981';
        if ($type === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
`;

const ChangePercent = styled.div`
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ $type }) => {
        if ($type === 'bullish') return '#10b981';
        if ($type === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.2rem;
`;

const VisualBar = styled.div`
    margin-top: 1.25rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
`;

const BarContainer = styled.div`
    position: relative;
    height: 40px;
    background: linear-gradient(90deg,
        rgba(239, 68, 68, 0.3) 0%,
        rgba(148, 163, 184, 0.3) 50%,
        rgba(16, 185, 129, 0.3) 100%
    );
    border-radius: 20px;
    overflow: hidden;
`;

const CurrentMarker = styled.div`
    position: absolute;
    top: 50%;
    left: ${({ $position }) => $position}%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    background: ${({ theme }) => theme?.brand?.primary || '#00adef'};
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    z-index: 3;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const PriceMarker = styled.div`
    position: absolute;
    top: 50%;
    left: ${({ $position }) => $position}%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: ${({ $type }) => {
        if ($type === 'bullish') return '#10b981';
        if ($type === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
    border-radius: 50%;
    z-index: 2;
`;

const BarLabels = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.7rem;
    color: ${({ theme }) => theme?.text?.tertiary || '#64748b'};
`;

// ============ COMPONENT ============
const ScenarioChart = ({ scenario, theme }) => {
    if (!scenario) return null;

    const { symbol, currentPrice, bullish, neutral, bearish, timeframe } = scenario;

    // Format price
    const formatPrice = (price) => {
        if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        if (price >= 1) return `$${price.toFixed(2)}`;
        return `$${price.toFixed(4)}`;
    };

    // Calculate percentage change
    const calcChange = (target, current) => {
        const change = ((target - current) / current) * 100;
        return change;
    };

    const bullishChange = calcChange(bullish, currentPrice);
    const neutralChange = calcChange(neutral, currentPrice);
    const bearishChange = calcChange(bearish, currentPrice);

    // Calculate positions for visual bar (normalize to 0-100 scale)
    const priceRange = bullish - bearish;
    const calcPosition = (price) => {
        return ((price - bearish) / priceRange) * 100;
    };

    const currentPosition = calcPosition(currentPrice);
    const bullishPosition = 100;
    const neutralPosition = calcPosition(neutral);
    const bearishPosition = 0;

    return (
        <Container theme={theme}>
            <Header>
                <Title theme={theme}>
                    <Target size={18} />
                    Price Scenarios
                    <SymbolBadge theme={theme}>{symbol}</SymbolBadge>
                </Title>
                <CurrentPrice theme={theme}>
                    <DollarSign size={16} />
                    {formatPrice(currentPrice)}
                </CurrentPrice>
            </Header>

            <ChartArea>
                {/* Bullish Scenario */}
                <ScenarioRow $type="bullish">
                    <ScenarioIcon $type="bullish">
                        <TrendingUp size={18} />
                    </ScenarioIcon>
                    <ScenarioInfo>
                        <ScenarioLabel $type="bullish">Bullish Case</ScenarioLabel>
                        <ScenarioDesc theme={theme}>If momentum continues & market favors</ScenarioDesc>
                    </ScenarioInfo>
                    <PriceTarget>
                        <TargetPrice $type="bullish">{formatPrice(bullish)}</TargetPrice>
                        <ChangePercent $type="bullish">
                            <TrendingUp size={12} />
                            +{bullishChange.toFixed(1)}%
                        </ChangePercent>
                    </PriceTarget>
                </ScenarioRow>

                {/* Neutral Scenario */}
                <ScenarioRow $type="neutral">
                    <ScenarioIcon $type="neutral">
                        <Minus size={18} />
                    </ScenarioIcon>
                    <ScenarioInfo>
                        <ScenarioLabel $type="neutral">Base Case</ScenarioLabel>
                        <ScenarioDesc theme={theme}>Most likely outcome</ScenarioDesc>
                    </ScenarioInfo>
                    <PriceTarget>
                        <TargetPrice $type="neutral">{formatPrice(neutral)}</TargetPrice>
                        <ChangePercent $type="neutral">
                            {neutralChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {neutralChange >= 0 ? '+' : ''}{neutralChange.toFixed(1)}%
                        </ChangePercent>
                    </PriceTarget>
                </ScenarioRow>

                {/* Bearish Scenario */}
                <ScenarioRow $type="bearish">
                    <ScenarioIcon $type="bearish">
                        <TrendingDown size={18} />
                    </ScenarioIcon>
                    <ScenarioInfo>
                        <ScenarioLabel $type="bearish">Bearish Case</ScenarioLabel>
                        <ScenarioDesc theme={theme}>If sentiment turns negative</ScenarioDesc>
                    </ScenarioInfo>
                    <PriceTarget>
                        <TargetPrice $type="bearish">{formatPrice(bearish)}</TargetPrice>
                        <ChangePercent $type="bearish">
                            <TrendingDown size={12} />
                            {bearishChange.toFixed(1)}%
                        </ChangePercent>
                    </PriceTarget>
                </ScenarioRow>
            </ChartArea>

            {/* Visual Price Range Bar */}
            <VisualBar>
                <BarContainer>
                    <PriceMarker $position={bearishPosition} $type="bearish" />
                    <PriceMarker $position={neutralPosition} $type="neutral" />
                    <PriceMarker $position={bullishPosition} $type="bullish" />
                    <CurrentMarker $position={Math.min(Math.max(currentPosition, 5), 95)} theme={theme} />
                </BarContainer>
                <BarLabels theme={theme}>
                    <span>{formatPrice(bearish)}</span>
                    <span>Current: {formatPrice(currentPrice)}</span>
                    <span>{formatPrice(bullish)}</span>
                </BarLabels>
            </VisualBar>
        </Container>
    );
};

export default ScenarioChart;
