// client/src/pages/portfolioAnalytics/SignalPerformance.js
//
// AI signal performance: wins, losses, accuracy + a quality verdict.

import React from 'react';
import styled from 'styled-components';
import {
    Sparkles, Zap, CheckCircle2, XCircle, BarChart3, ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { signalPerformance, fmtUSD } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, ActionButton, t,
} from '../marketReports/styles';

const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.25rem;
    align-items: stretch;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const Stats = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.7rem;
`;

const Stat = styled.div`
    padding: 0.75rem 0.9rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};

    .label {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.62rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};

        svg.kind {
            color: ${(p) =>
                p.$tone === 'bull' ? t(p, 'success', '#10b981')
              : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
              : t(p, 'brand.primary', '#00adef')};
        }
    }
    .value {
        font-size: 1.4rem;
        font-weight: 900;
        margin-top: 0.25rem;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
          : t(p, 'text.primary', '#f8fafc')};
    }
`;

const VerdictPanel = styled.div`
    padding: 1rem 1.15rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.12), rgba(0, 173, 237, 0.04));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 200px;
`;

const VerdictLabel = styled.span`
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const VerdictValue = styled.span`
    font-size: 1.4rem;
    font-weight: 900;
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const Empty = styled.div`
    padding: 1.25rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.30)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;
`;

const SignalPerformance = ({ analytics }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const s = signalPerformance(analytics);

    if (!s || s.total === 0) {
        return (
            <SectionCard theme={theme}>
                <SectionHeader>
                    <SectionTitle theme={theme}>
                        <Sparkles size={14} /> AI Signal Performance
                    </SectionTitle>
                </SectionHeader>
                <Empty theme={theme}>
                    No signal-tracked trades yet. Run trades from the Signals page to start measuring AI signal performance.
                </Empty>
            </SectionCard>
        );
    }

    const accTone = s.accuracy == null ? null
        : s.accuracy >= 60 ? 'bull'
        : s.accuracy >= 45 ? 'warn'
        : 'bear';

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Sparkles size={14} /> AI Signal Performance
                </SectionTitle>
                <ActionButton theme={theme} onClick={() => navigate('/signals')}>
                    View signals <ArrowRight size={14} />
                </ActionButton>
            </SectionHeader>

            <Layout>
                <Stats>
                    <Stat theme={theme}>
                        <span className="label"><Zap size={11} className="kind" /> Total signals</span>
                        <span className="value">{s.total}</span>
                    </Stat>
                    <Stat theme={theme} $tone="bull">
                        <span className="label"><CheckCircle2 size={11} className="kind" /> Wins</span>
                        <span className="value">{s.correct}</span>
                    </Stat>
                    <Stat theme={theme} $tone="bear">
                        <span className="label"><XCircle size={11} className="kind" /> Losses</span>
                        <span className="value">{s.wrong}</span>
                    </Stat>
                    <Stat theme={theme} $tone={accTone}>
                        <span className="label"><BarChart3 size={11} className="kind" /> Accuracy</span>
                        <span className="value">{s.accuracy != null ? `${s.accuracy}%` : '—'}</span>
                    </Stat>
                    {s.avgReturn != null && (
                        <Stat theme={theme} $tone={s.avgReturn > 0 ? 'bull' : 'bear'}>
                            <span className="label">Avg return / signal</span>
                            <span className="value">{fmtUSD(s.avgReturn)}</span>
                        </Stat>
                    )}
                </Stats>

                <VerdictPanel theme={theme}>
                    <VerdictLabel theme={theme}>Signal Quality</VerdictLabel>
                    <VerdictValue theme={theme} $tone={s.tone}>{s.label}</VerdictValue>
                </VerdictPanel>
            </Layout>
        </SectionCard>
    );
};

export default SignalPerformance;
