// client/src/pages/economicCalendar/MarketImpactBar.js
//
// Above-the-fold horizontal summary: high-impact count, market risk level,
// volatility expectation, plain-English summary line.

import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, Activity, Gauge, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { marketImpactSummary } from './derive';
import { t, fadeIn } from '../marketReports/styles';

const Bar = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
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
        background: ${(p) =>
            p.$risk === 'HIGH' ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
          : p.$risk === 'ELEVATED' ? 'linear-gradient(90deg, #f59e0b, #00adef)'
          : 'linear-gradient(90deg, #10b981, #00adef)'};
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
        p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.15)'
      : p.$tone === 'warn' ? 'rgba(245, 158, 11, 0.15)'
      : p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.15)'
      : 'rgba(0, 173, 237, 0.15)'};
    color: ${(p) =>
        p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
      : p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : t(p, 'brand.primary', '#00adef')};
`;

const Meta = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const Label = styled.span`
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
`;

const Value = styled.span`
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 1rem;
    font-weight: 800;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SummaryLine = styled.div`
    grid-column: 1 / -1;
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.88rem;
    font-weight: 600;
    padding-top: 0.85rem;
    margin-top: 0.25rem;
    border-top: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const MarketImpactBar = ({ events }) => {
    const { theme } = useTheme();
    const s = marketImpactSummary(events);

    const riskTone = s.risk === 'HIGH' ? 'bear' : s.risk === 'ELEVATED' ? 'warn' : 'bull';
    const highTone = s.high >= 2 ? 'bear' : s.high >= 1 ? 'warn' : 'bull';
    const volTone = s.risk === 'HIGH' ? 'bear' : s.risk === 'ELEVATED' ? 'warn' : 'bull';

    return (
        <Bar theme={theme} $risk={s.risk}>
            <Cell>
                <IconBox theme={theme} $tone={highTone}><AlertTriangle size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>High Impact Today</Label>
                    <Value theme={theme}>{s.high}</Value>
                </Meta>
            </Cell>

            <Cell>
                <IconBox theme={theme} $tone={riskTone}><Activity size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>Market Risk</Label>
                    <Value theme={theme}>{s.risk}</Value>
                </Meta>
            </Cell>

            <Cell>
                <IconBox theme={theme} $tone={volTone}><Gauge size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>Volatility</Label>
                    <Value theme={theme}>{s.vol}</Value>
                </Meta>
            </Cell>

            <Cell>
                <IconBox theme={theme}><Info size={18} /></IconBox>
                <Meta>
                    <Label theme={theme}>Total Events</Label>
                    <Value theme={theme}>{s.count}</Value>
                </Meta>
            </Cell>

            <SummaryLine theme={theme}>
                <Info size={16} />
                <span>{s.summary}</span>
            </SummaryLine>
        </Bar>
    );
};

export default MarketImpactBar;
