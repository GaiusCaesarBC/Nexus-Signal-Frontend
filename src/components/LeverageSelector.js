// src/components/LeverageSelector.js
// Leverage selection component for paper trading

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { AlertTriangle, TrendingUp, Zap, Flame, Skull } from 'lucide-react';

const LEVERAGE_OPTIONS = [
    { value: 1, label: '1x', riskLevel: 'none', description: 'No leverage', color: '#94a3b8' },
    { value: 2, label: '2x', riskLevel: 'low', description: 'Low risk', color: '#10b981' },
    { value: 3, label: '3x', riskLevel: 'low', description: 'Low risk', color: '#10b981' },
    { value: 5, label: '5x', riskLevel: 'medium', description: 'Medium risk', color: '#f59e0b' },
    { value: 7, label: '7x', riskLevel: 'high', description: 'High risk', color: '#f97316' },
    { value: 10, label: '10x', riskLevel: 'high', description: 'High risk', color: '#ef4444' },
    { value: 20, label: '20x', riskLevel: 'extreme', description: 'Extreme risk', color: '#dc2626' }
];

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
`;

const Container = styled.div`
    background: rgba(15, 20, 40, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const Title = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: #e0e6ed;
`;

const RiskBadge = styled.span`
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: ${props => props.$color}20;
    color: ${props => props.$color};
    text-transform: uppercase;
    
    ${props => props.$extreme && css`
        animation: ${pulse} 1s ease-in-out infinite;
    `}
`;

const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    
    @media (max-width: 600px) {
        grid-template-columns: repeat(4, 1fr);
    }
`;

const Option = styled.button`
    background: ${props => props.$selected 
        ? `${props.$color}30` 
        : 'rgba(255, 255, 255, 0.05)'};
    border: 2px solid ${props => props.$selected 
        ? props.$color 
        : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    padding: 0.6rem 0.4rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    
    &:hover {
        background: ${props => props.$color}20;
        border-color: ${props => props.$color};
        transform: translateY(-2px);
    }
    
    ${props => props.$selected && props.$extreme && css`
        animation: ${shake} 0.5s ease-in-out;
    `}
`;

const OptionLabel = styled.span`
    font-weight: 700;
    font-size: 1rem;
    color: ${props => props.$selected ? props.$color : '#e0e6ed'};
`;

const OptionIcon = styled.div`
    color: ${props => props.$color};
    opacity: ${props => props.$selected ? 1 : 0.5};
`;

const InfoBox = styled.div`
    background: ${props => props.$color}15;
    border: 1px solid ${props => props.$color}40;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    
    ${props => props.$extreme && css`
        border-color: ${props.$color};
    `}
`;

const InfoIcon = styled.div`
    color: ${props => props.$color};
    flex-shrink: 0;
    margin-top: 2px;
`;

const InfoContent = styled.div`
    flex: 1;
`;

const InfoTitle = styled.div`
    font-weight: 600;
    font-size: 0.85rem;
    color: ${props => props.$color};
    margin-bottom: 0.25rem;
`;

const InfoText = styled.div`
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.4;
`;

const StatsRow = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
`;

const Stat = styled.div`
    font-size: 0.75rem;
    color: #94a3b8;
    
    span {
        color: ${props => props.$color || '#e0e6ed'};
        font-weight: 600;
    }
`;

const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
        case 'none': return <TrendingUp size={14} />;
        case 'low': return <Zap size={14} />;
        case 'medium': return <AlertTriangle size={14} />;
        case 'high': return <Flame size={14} />;
        case 'extreme': return <Skull size={14} />;
        default: return <TrendingUp size={14} />;
    }
};

const getRiskInfo = (option, tradeAmount) => {
    const leverage = option.value;
    const positionSize = tradeAmount * leverage;
    const liquidationPercent = leverage > 1 ? (90 / leverage).toFixed(1) : null;
    
    if (leverage === 1) {
        return {
            title: 'Standard Trading',
            text: 'No leverage applied. Your gains and losses are 1:1 with market movement.',
            positionSize,
            liquidationPercent: null
        };
    }
    
    if (option.riskLevel === 'low') {
        return {
            title: `${leverage}x Leverage`,
            text: `Your position is ${leverage}x your margin. A ${(10/leverage).toFixed(1)}% move = ${10}% gain/loss.`,
            positionSize,
            liquidationPercent
        };
    }
    
    if (option.riskLevel === 'medium') {
        return {
            title: `${leverage}x Leverage - Medium Risk`,
            text: `Position amplified ${leverage}x. Small price swings cause significant P&L changes.`,
            positionSize,
            liquidationPercent
        };
    }
    
    if (option.riskLevel === 'high') {
        return {
            title: `${leverage}x Leverage - High Risk`,
            text: `Extreme amplification. A ${liquidationPercent}% drop triggers liquidation, losing your margin.`,
            positionSize,
            liquidationPercent
        };
    }
    
    return {
        title: `${leverage}x Leverage - EXTREME RISK`,
        text: `Maximum leverage. Only ${liquidationPercent}% adverse movement will liquidate your position entirely!`,
        positionSize,
        liquidationPercent
    };
};

const LeverageSelector = ({ 
    value = 1, 
    onChange, 
    tradeAmount = 0,
    disabled = false 
}) => {
    const selectedOption = LEVERAGE_OPTIONS.find(o => o.value === value) || LEVERAGE_OPTIONS[0];
    const riskInfo = getRiskInfo(selectedOption, tradeAmount);
    const isExtreme = selectedOption.riskLevel === 'extreme';
    const isHigh = selectedOption.riskLevel === 'high' || isExtreme;
    
    return (
        <Container>
            <Header>
                <Title>
                    <Zap size={16} />
                    Leverage
                </Title>
                <RiskBadge 
                    $color={selectedOption.color}
                    $extreme={isExtreme}
                >
                    {selectedOption.riskLevel === 'none' ? 'Standard' : `${selectedOption.riskLevel} risk`}
                </RiskBadge>
            </Header>
            
            <OptionsGrid>
                {LEVERAGE_OPTIONS.map(option => (
                    <Option
                        key={option.value}
                        $selected={value === option.value}
                        $color={option.color}
                        $extreme={option.riskLevel === 'extreme'}
                        onClick={() => !disabled && onChange(option.value)}
                        disabled={disabled}
                        type="button"
                    >
                        <OptionIcon $color={option.color} $selected={value === option.value}>
                            {getRiskIcon(option.riskLevel)}
                        </OptionIcon>
                        <OptionLabel $selected={value === option.value} $color={option.color}>
                            {option.label}
                        </OptionLabel>
                    </Option>
                ))}
            </OptionsGrid>
            
            <InfoBox $color={selectedOption.color} $extreme={isExtreme}>
                <InfoIcon $color={selectedOption.color}>
                    {isHigh ? <AlertTriangle size={18} /> : <TrendingUp size={18} />}
                </InfoIcon>
                <InfoContent>
                    <InfoTitle $color={selectedOption.color}>
                        {riskInfo.title}
                    </InfoTitle>
                    <InfoText>{riskInfo.text}</InfoText>
                    
                    {tradeAmount > 0 && (
                        <StatsRow>
                            <Stat>
                                Margin: <span>${tradeAmount.toLocaleString()}</span>
                            </Stat>
                            <Stat $color={selectedOption.color}>
                                Position Size: <span>${riskInfo.positionSize.toLocaleString()}</span>
                            </Stat>
                            {riskInfo.liquidationPercent && (
                                <Stat $color="#ef4444">
                                    Liquidation at: <span>-{riskInfo.liquidationPercent}%</span>
                                </Stat>
                            )}
                        </StatsRow>
                    )}
                </InfoContent>
            </InfoBox>
        </Container>
    );
};

export default LeverageSelector;