// client/src/pages/marketReports/WhatToDoNow.js
//
// TOP-PRIORITY action panel. Tells the user what to DO right now.
// Visually loud: gradient border + glow + bias badge + 2-4 actionable bullets.
//
// All inputs flow through ./derive, which prefers server-provided fields
// (report.tradeBias, report.actionableInsights, report.strategy, etc.)
// and falls back to client heuristics when those fields aren't present.

import React from 'react';
import styled from 'styled-components';
import { Zap, Target, ArrowRight, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    deriveTradeBias,
    deriveActionableInsights,
    deriveStrategy,
} from './derive';
import { t, fadeIn, ActionButton } from './styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 18px;
    padding: 1.6rem 1.75rem;
    margin-bottom: 1.75rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(0, 173, 237, 0.10) 0%, transparent 50%),
        radial-gradient(120% 120% at 100% 100%, rgba(168, 85, 247, 0.10) 0%, transparent 50%),
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
        background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(90deg, #00adef, #a855f7, #06b6d4)')};
    }

    @media (max-width: 640px) {
        padding: 1.25rem;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.1rem;
    flex-wrap: wrap;
`;

const TitleBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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

const Title = styled.h2`
    margin: 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;

    @media (max-width: 640px) {
        font-size: 1.2rem;
    }
`;

const BiasBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: ${(p) =>
        p.$bias === 'LONG' ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.10))'
      : p.$bias === 'SHORT' ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.10))'
      : 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.10))'};
    color: ${(p) =>
        p.$bias === 'LONG' ? t(p, 'success', '#10b981')
      : p.$bias === 'SHORT' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
    border: 1px solid currentColor;
`;

const InsightList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 1.25rem 0;
    display: grid;
    gap: 0.6rem;
`;

const Insight = styled.li`
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.7rem 0.9rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.6)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.92rem;
    line-height: 1.45;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
`;

const StrategyChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.85rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.6)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.2)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.85rem;
    font-weight: 600;

    svg {
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }

    span.label {
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 0.7rem;
        font-weight: 700;
    }
`;

const WhatToDoNow = ({ report, onBrowseOpportunities }) => {
    const { theme } = useTheme();
    const bias = deriveTradeBias(report);
    const insights = deriveActionableInsights(report);
    const strategy = deriveStrategy(report);

    const BiasIcon = bias === 'LONG' ? TrendingUp
                    : bias === 'SHORT' ? TrendingDown
                    : Activity;

    return (
        <Wrap theme={theme}>
            <Header>
                <TitleBlock>
                    <Eyebrow theme={theme}><Zap size={12} /> What This Means For You</Eyebrow>
                    <Title theme={theme}>Your move, right now</Title>
                </TitleBlock>
                <BiasBadge theme={theme} $bias={bias}>
                    <BiasIcon size={16} />
                    {bias} BIAS
                </BiasBadge>
            </Header>

            <InsightList>
                {insights.map((line, i) => (
                    <Insight key={i} theme={theme}>
                        <Target size={16} />
                        <span>{line}</span>
                    </Insight>
                ))}
            </InsightList>

            <Footer theme={theme}>
                <StrategyChip theme={theme}>
                    <Zap size={14} />
                    <span className="label">Suggested strategy</span>
                    <span>{strategy}</span>
                </StrategyChip>
                <ActionButton theme={theme} $primary onClick={onBrowseOpportunities}>
                    Browse opportunities <ArrowRight size={14} />
                </ActionButton>
            </Footer>
        </Wrap>
    );
};

export default WhatToDoNow;
