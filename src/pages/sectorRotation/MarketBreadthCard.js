// client/src/pages/sectorRotation/MarketBreadthCard.js
//
// Improved breadth visualization. Adds:
//   - % of sectors bullish vs bearish
//   - Trend direction (Improving / Weakening / Mixed)
//   - Confidence level
//   - One-line narrative

import React from 'react';
import styled from 'styled-components';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { breadthNarrative } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const StatGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
    margin-bottom: 1rem;

    @media (max-width: 520px) {
        grid-template-columns: 1fr;
    }
`;

const Stat = styled.div`
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.2)')};

    .label {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
    .value {
        font-size: 1.05rem;
        font-weight: 800;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
          : t(p, 'text.primary', '#f8fafc')};
        margin-top: 0.15rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
`;

const Bar = styled.div`
    display: flex;
    height: 22px;
    border-radius: 11px;
    overflow: hidden;
    margin-bottom: 0.6rem;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};

    .pos {
        background: linear-gradient(90deg, rgba(16, 185, 129, 0.7), rgba(16, 185, 129, 1));
        transition: width 0.5s ease;
    }
    .neg {
        background: linear-gradient(90deg, rgba(239, 68, 68, 1), rgba(239, 68, 68, 0.7));
        transition: width 0.5s ease;
    }
`;

const Narrative = styled.div`
    padding: 0.85rem 1rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border-left: 3px solid ${(p) => t(p, 'brand.primary', '#00adef')};
    border-radius: 8px;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.9rem;
    line-height: 1.5;
`;

const TrendIcon = ({ trend }) => {
    if (trend === 'Improving') return <TrendingUp size={14} />;
    if (trend === 'Weakening') return <TrendingDown size={14} />;
    return <Minus size={14} />;
};

const MarketBreadthCard = ({ marketBreadth, sectors }) => {
    const { theme } = useTheme();
    const total = sectors.length || 11;
    const up = marketBreadth?.positiveWeek ?? 0;
    const down = marketBreadth?.negativeWeek ?? 0;
    const { pctUp, trend, confidence, narrative } = breadthNarrative(marketBreadth, sectors);

    const trendTone = trend === 'Improving' ? 'bull' : trend === 'Weakening' ? 'bear' : 'warn';
    const breadthTone = pctUp >= 60 ? 'bull' : pctUp <= 40 ? 'bear' : 'warn';

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Activity size={14} /> Market Breadth
                </SectionTitle>
            </SectionHeader>

            <StatGrid>
                <Stat theme={theme} $tone={breadthTone}>
                    <div className="label">Bullish Sectors</div>
                    <div className="value">{pctUp}% ({up}/{total})</div>
                </Stat>
                <Stat theme={theme} $tone={trendTone}>
                    <div className="label">Trend</div>
                    <div className="value"><TrendIcon trend={trend} /> {trend}</div>
                </Stat>
                <Stat theme={theme}>
                    <div className="label">Confidence</div>
                    <div className="value">{confidence}</div>
                </Stat>
            </StatGrid>

            <Bar theme={theme}>
                <div className="pos" style={{ width: `${(up / total) * 100}%` }} />
                <div className="neg" style={{ width: `${(down / total) * 100}%` }} />
            </Bar>

            <Narrative theme={theme}>{narrative}</Narrative>
        </SectionCard>
    );
};

export default MarketBreadthCard;
