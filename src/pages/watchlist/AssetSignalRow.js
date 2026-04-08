// client/src/pages/watchlist/AssetSignalRow.js
//
// Inline cell content shown under the asset symbol/name in the table.
// Renders the signal badge (LONG/SHORT + confidence), entry/stop/target
// preview if available, and the AI insight line.

import React from 'react';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: 0.35rem;
    max-width: 420px;
`;

const SignalRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
`;

const SignalBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.18rem 0.5rem;
    border-radius: 6px;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: ${(p) =>
        p.$direction === 'LONG' ? 'rgba(16, 185, 129, 0.18)'
      : 'rgba(239, 68, 68, 0.18)'};
    color: ${(p) =>
        p.$direction === 'LONG' ? t(p, 'success', '#10b981')
      : t(p, 'error', '#ef4444')};
`;

const Levels = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.62rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-weight: 700;

    .num {
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        font-weight: 800;
    }
`;

const Insight = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.72rem;
    line-height: 1.35;

    svg {
        flex: 0 0 auto;
        margin-top: 1px;
        opacity: 0.7;
    }
`;

const fmt = (v) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(2) : null);

const AssetSignalRow = ({ signal, insight, theme }) => {
    if (!signal && !insight) return null;

    const entry = signal && fmt(signal.entry);
    const stop = signal && fmt(signal.stop);
    const target = signal && fmt(signal.target);

    return (
        <Wrap>
            {signal && (
                <SignalRow>
                    <SignalBadge theme={theme} $direction={signal.direction}>
                        {signal.direction === 'LONG' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {signal.direction} · {signal.confidence}%
                    </SignalBadge>
                    {(entry || stop || target) && (
                        <Levels theme={theme}>
                            {entry  && <>E <span className="num">${entry}</span></>}
                            {stop   && <> · S <span className="num">${stop}</span></>}
                            {target && <> · T <span className="num">${target}</span></>}
                        </Levels>
                    )}
                </SignalRow>
            )}
            {insight && (
                <Insight theme={theme}>
                    <Sparkles size={11} />
                    <span>{insight}</span>
                </Insight>
            )}
        </Wrap>
    );
};

export default AssetSignalRow;
