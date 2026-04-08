// client/src/pages/portfolioAnalytics/PerformanceBreakdown.js
//
// Replaces the basic stat strip with the metrics that actually matter:
// Win rate, Avg win, Avg loss, R:R, Expectancy. Highlights expectancy as
// "are you actually profitable long-term?"

import React from 'react';
import styled from 'styled-components';
import {
    Percent, TrendingUp, TrendingDown, Scale, Sparkles, Info,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { performanceMetrics, fmtUSD, fmt2 } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.75rem;
`;

const Stat = styled.div`
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};

        svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
    }
    .value {
        font-size: 1.35rem;
        font-weight: 900;
        line-height: 1.1;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
          : t(p, 'text.primary', '#f8fafc')};
    }
    .sub {
        font-size: 0.7rem;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-weight: 600;
    }
`;

const Verdict = styled.div`
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 10px;
    background: ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.10)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.10)'
      : 'rgba(245, 158, 11, 0.10)'};
    border: 1px solid ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.35)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.35)'
      : 'rgba(245, 158, 11, 0.35)'};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.9rem;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : t(p, 'warning', '#f59e0b')};
    }
    strong {
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.65rem;
        margin-right: 0.45rem;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : t(p, 'warning', '#f59e0b')};
    }
`;

const Empty = styled.div`
    padding: 1.25rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.30)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;
`;

const PerformanceBreakdown = ({ analytics }) => {
    const { theme } = useTheme();
    const m = performanceMetrics(analytics);

    if (!m || m.total === 0) {
        return (
            <SectionCard theme={theme}>
                <SectionHeader>
                    <SectionTitle theme={theme}>
                        <Percent size={14} /> Performance Breakdown
                    </SectionTitle>
                </SectionHeader>
                <Empty theme={theme}>No trades yet — performance metrics unlock after your first 10 trades.</Empty>
            </SectionCard>
        );
    }

    // Tones
    const winTone = m.winRate == null ? null : m.winRate >= 55 ? 'bull' : m.winRate >= 40 ? 'warn' : 'bear';
    const rrTone  = m.rr == null ? null : m.rr >= 2 ? 'bull' : m.rr >= 1.5 ? 'warn' : 'bear';
    const expTone = m.expectancy == null ? null : m.expectancy > 0 ? 'bull' : 'bear';

    // "Are you actually profitable long-term?" verdict
    let longTermVerdict = '';
    let longTermTone = 'warn';
    if (m.expectancy != null && m.total >= 20) {
        if (m.expectancy > 0 && m.rr != null && m.rr >= 1.5) {
            longTermVerdict = 'Yes — positive expectancy + healthy R:R means time is on your side.';
            longTermTone = 'bull';
        } else if (m.expectancy > 0) {
            longTermVerdict = 'Marginally — positive EV per trade, but improve R:R to widen the edge.';
            longTermTone = 'warn';
        } else {
            longTermVerdict = 'No — negative expectancy. The math is against you over enough trades.';
            longTermTone = 'bear';
        }
    } else if (m.total < 20) {
        longTermVerdict = `Sample too small (${m.total} trades) — run 30+ before this metric carries signal.`;
        longTermTone = 'warn';
    }

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Percent size={14} /> Performance Breakdown
                </SectionTitle>
            </SectionHeader>

            <Grid>
                <Stat theme={theme} $tone={winTone}>
                    <span className="label"><Percent size={11} /> Win rate</span>
                    <span className="value">{m.winRate != null ? `${m.winRate.toFixed(1)}%` : '—'}</span>
                    <span className="sub">{m.wins}W · {m.losses}L · {m.total} total</span>
                </Stat>

                <Stat theme={theme} $tone="bull">
                    <span className="label"><TrendingUp size={11} /> Avg win{m.isAvgEstimate ? ' (est)' : ''}</span>
                    <span className="value">{m.avgWin != null ? fmtUSD(m.avgWin) : '—'}</span>
                    <span className="sub">{m.isAvgEstimate ? 'using biggest win as proxy' : ''}</span>
                </Stat>

                <Stat theme={theme} $tone="bear">
                    <span className="label"><TrendingDown size={11} /> Avg loss{m.isAvgEstimate ? ' (est)' : ''}</span>
                    <span className="value">{m.avgLoss != null ? fmtUSD(Math.abs(m.avgLoss)) : '—'}</span>
                    <span className="sub">{m.isAvgEstimate ? 'using biggest loss as proxy' : ''}</span>
                </Stat>

                <Stat theme={theme} $tone={rrTone}>
                    <span className="label"><Scale size={11} /> Risk / Reward</span>
                    <span className="value">{m.rr != null ? `1 : ${fmt2(m.rr)}` : '—'}</span>
                    <span className="sub">avg win ÷ avg loss</span>
                </Stat>

                <Stat theme={theme} $tone={expTone}>
                    <span className="label"><Sparkles size={11} /> Expectancy</span>
                    <span className="value">{m.expectancy != null ? fmtUSD(m.expectancy) : '—'}</span>
                    <span className="sub">expected profit per trade</span>
                </Stat>
            </Grid>

            {longTermVerdict && (
                <Verdict theme={theme} $tone={longTermTone}>
                    <Info size={16} />
                    <div>
                        <strong>Profitable long-term?</strong>
                        {longTermVerdict}
                    </div>
                </Verdict>
            )}
        </SectionCard>
    );
};

export default PerformanceBreakdown;
