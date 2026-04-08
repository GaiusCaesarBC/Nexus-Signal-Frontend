// client/src/pages/marketReports/MarketSnapshotBar.js
//
// Compact "above the fold" market snapshot. Shows bias / breadth / vol /
// sentiment in a single horizontally-scrollable bar so the user can read the
// state of the market in <2 seconds.
//
// Data is currently DERIVED CLIENT-SIDE from the report payload — see
// derive.deriveSnapshot. TODO(server): replace with /market-pulse endpoint.

import React from 'react';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, Activity, Gauge, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { deriveSnapshot } from './derive';
import { t, fadeIn } from './styles';

const Bar = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.3)')};
    border-radius: 14px;
    margin-bottom: 1.5rem;
    animation: ${fadeIn} 0.4s ease-out both;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(90deg, #00adef, #06b6d4)')};
        opacity: 0.85;
    }

    @media (max-width: 720px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

const Cell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
`;

const IconBox = styled.div`
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.15)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.15)'
      : p.$tone === 'warn' ? 'rgba(245, 158, 11, 0.15)'
      : 'rgba(0, 173, 237, 0.15)'};
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
      : t(p, 'brand.primary', '#00adef')};
`;

const Meta = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const Label = styled.span`
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
`;

const Value = styled.span`
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const MarketSnapshotBar = ({ report }) => {
    const { theme } = useTheme();
    const snap = deriveSnapshot(report || {});

    const biasTone = snap.bias === 'Bullish' ? 'bull' : snap.bias === 'Bearish' ? 'bear' : 'warn';
    const breadthTone = snap.breadth >= 60 ? 'bull' : snap.breadth <= 40 ? 'bear' : 'warn';
    const volTone = snap.vol === 'High' ? 'bear' : snap.vol === 'Elevated' ? 'warn' : 'bull';
    const sentTone = snap.sentiment.includes('Greed') ? 'bull'
                    : snap.sentiment.includes('Fear') ? 'bear'
                    : 'warn';

    const BiasIcon = snap.bias === 'Bullish' ? TrendingUp
                    : snap.bias === 'Bearish' ? TrendingDown
                    : Activity;

    return (
        <Bar theme={theme}>
            <Cell>
                <IconBox theme={theme} $tone={biasTone}><BiasIcon size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>Market Bias</Label>
                    <Value theme={theme}>{snap.bias}</Value>
                </Meta>
            </Cell>

            <Cell>
                <IconBox theme={theme} $tone={breadthTone}><Activity size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>Breadth</Label>
                    <Value theme={theme}>{snap.breadth}% bullish</Value>
                </Meta>
            </Cell>

            <Cell>
                <IconBox theme={theme} $tone={volTone}><Gauge size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>Volatility</Label>
                    <Value theme={theme}>{snap.vol}</Value>
                </Meta>
            </Cell>

            <Cell>
                <IconBox theme={theme} $tone={sentTone}><Heart size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>Sentiment</Label>
                    <Value theme={theme}>{snap.sentiment}</Value>
                </Meta>
            </Cell>
        </Bar>
    );
};

export default MarketSnapshotBar;
