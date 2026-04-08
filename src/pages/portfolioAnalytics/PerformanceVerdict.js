// client/src/pages/portfolioAnalytics/PerformanceVerdict.js
//
// HERO panel: "Your Trading Performance" verdict + 0-100 score + 1-line
// summary. The first thing the user sees on the page.

import React from 'react';
import styled from 'styled-components';
import { Trophy, AlertTriangle, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { performanceScore } from './derive';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 18px;
    padding: 1.6rem 1.75rem;
    margin-bottom: 1.75rem;
    background:
        radial-gradient(120% 120% at 0% 0%,
            ${(p) => p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.10)' : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.10)' : 'rgba(245, 158, 11, 0.10)'} 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(0, 173, 237, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.92)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    box-shadow: ${(p) => t(p, 'glow.primary', '0 0 30px rgba(0, 173, 237, 0.18)')};
    animation: ${fadeIn} 0.5s ease-out both;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: ${(p) =>
            p.$tone === 'bull' ? 'linear-gradient(90deg, #10b981, #00adef)'
          : p.$tone === 'bear' ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
          : 'linear-gradient(90deg, #f59e0b, #00adef)'};
    }
`;

const Layout = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) auto;
    gap: 1.5rem;
    align-items: center;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const Block = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    min-width: 0;
`;

const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Verdict = styled.h2`
    margin: 0;
    font-size: 1.7rem;
    font-weight: 900;
    line-height: 1.15;
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};

    @media (max-width: 640px) { font-size: 1.35rem; }
`;

const Summary = styled.p`
    margin: 0.2rem 0 0 0;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.95rem;
    line-height: 1.5;
`;

const ScoreBlock = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.85rem 1.4rem;
    border-radius: 16px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.6)')};
    border: 2px solid ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.45)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.45)'
      : 'rgba(245, 158, 11, 0.45)'};
    min-width: 130px;
`;

const ScoreValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1;
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
    .out {
        font-size: 0.85rem;
        font-weight: 600;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        margin-left: 0.2rem;
    }
`;

const ScoreLabel = styled.div`
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
`;

const VerdictIcon = ({ tone }) => {
    if (tone === 'bull') return <Trophy size={14} />;
    if (tone === 'bear') return <AlertTriangle size={14} />;
    return <Activity size={14} />;
};

const PerformanceVerdict = ({ analytics }) => {
    const { theme } = useTheme();
    const v = performanceScore(analytics);

    return (
        <Wrap theme={theme} $tone={v.tone}>
            <Layout>
                <Block>
                    <Eyebrow theme={theme}><VerdictIcon tone={v.tone} /> Your Trading Performance</Eyebrow>
                    <Verdict theme={theme} $tone={v.tone}>{v.verdict}</Verdict>
                    <Summary theme={theme}>{v.summary}</Summary>
                </Block>
                <ScoreBlock theme={theme} $tone={v.tone}>
                    <ScoreLabel theme={theme}>Score</ScoreLabel>
                    <ScoreValue theme={theme} $tone={v.tone}>
                        {v.score}<span className="out">/100</span>
                    </ScoreValue>
                </ScoreBlock>
            </Layout>
        </Wrap>
    );
};

export default PerformanceVerdict;
