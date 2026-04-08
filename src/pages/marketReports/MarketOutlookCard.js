// client/src/pages/marketReports/MarketOutlookCard.js
//
// Replaces the bare "BULLISH" badge with a richer outlook block:
//   - Label (Bullish / Bearish / Neutral)
//   - Confidence (heuristic, with a visual bar)
//   - Time horizon (Intraday / Swing / Multi-day)
//   - Short rationale (1-2 lines max)
//
// All confidence/horizon values are derived client-side — see derive.js.

import React from 'react';
import styled from 'styled-components';
import { Target, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { deriveConfidence, deriveTimeHorizon, deriveTradeBias, trimSummary } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from './styles';

const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 1.25rem;
    align-items: stretch;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const LabelBlock = styled.div`
    padding: 1.1rem 1.25rem;
    border-radius: 12px;
    background: ${(p) =>
        p.$bias === 'LONG' ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06))'
      : p.$bias === 'SHORT' ? 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))'
      : 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))'};
    border: 1px solid ${(p) =>
        p.$bias === 'LONG' ? 'rgba(16, 185, 129, 0.40)'
      : p.$bias === 'SHORT' ? 'rgba(239, 68, 68, 0.40)'
      : 'rgba(245, 158, 11, 0.40)'};
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    justify-content: center;
`;

const BiasLine = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.65rem;
    font-weight: 900;
    letter-spacing: 0.02em;
    color: ${(p) =>
        p.$bias === 'LONG' ? t(p, 'success', '#10b981')
      : p.$bias === 'SHORT' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const Reason = styled.p`
    margin: 0;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;
    line-height: 1.5;
`;

const StatsBlock = styled.div`
    display: grid;
    gap: 0.75rem;
    align-content: center;
`;

const StatRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.7rem 0.9rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    border-radius: 10px;
`;

const StatLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;

    svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
`;

const StatValue = styled.div`
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.95rem;
    font-weight: 700;
`;

const ConfWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.7rem 0.9rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    border-radius: 10px;
`;

const ConfTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ConfBar = styled.div`
    height: 8px;
    border-radius: 4px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    overflow: hidden;

    > span {
        display: block;
        height: 100%;
        width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
        background: ${(p) =>
            p.$bias === 'LONG' ? 'linear-gradient(90deg, rgba(16,185,129,0.6), rgba(16,185,129,1))'
          : p.$bias === 'SHORT' ? 'linear-gradient(90deg, rgba(239,68,68,0.6), rgba(239,68,68,1))'
          : 'linear-gradient(90deg, rgba(245,158,11,0.6), rgba(245,158,11,1))'};
        transition: width 0.5s ease;
    }
`;

const MarketOutlookCard = ({ outlook, report }) => {
    const { theme } = useTheme();
    if (!outlook && !report) return null;

    const bias = deriveTradeBias(report);
    const confidence = deriveConfidence(report);
    const horizon = deriveTimeHorizon(report);
    const label = bias === 'LONG' ? 'Bullish' : bias === 'SHORT' ? 'Bearish' : 'Neutral';
    const Icon = bias === 'LONG' ? TrendingUp : bias === 'SHORT' ? TrendingDown : Activity;

    const reasoning = trimSummary(outlook?.reasoning || report?.summary || '', 32);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Target size={14} /> Market Outlook
                </SectionTitle>
            </SectionHeader>

            <Layout>
                <LabelBlock theme={theme} $bias={bias}>
                    <BiasLine theme={theme} $bias={bias}>
                        <Icon size={28} /> {label}
                    </BiasLine>
                    {reasoning && <Reason theme={theme}>{reasoning}</Reason>}
                </LabelBlock>

                <StatsBlock>
                    <ConfWrap theme={theme}>
                        <ConfTop>
                            <StatLabel theme={theme}><Target size={14} /> Confidence</StatLabel>
                            <StatValue theme={theme}>{confidence}%</StatValue>
                        </ConfTop>
                        <ConfBar theme={theme} $pct={confidence} $bias={bias}>
                            <span />
                        </ConfBar>
                    </ConfWrap>

                    <StatRow theme={theme}>
                        <StatLabel theme={theme}><Clock size={14} /> Time Horizon</StatLabel>
                        <StatValue theme={theme}>{horizon}</StatValue>
                    </StatRow>
                </StatsBlock>
            </Layout>
        </SectionCard>
    );
};

export default MarketOutlookCard;
