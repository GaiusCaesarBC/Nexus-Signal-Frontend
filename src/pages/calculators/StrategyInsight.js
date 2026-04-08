// client/src/pages/calculators/StrategyInsight.js
//
// One-line quality verdict — "Good setup", "Low R:R — avoid", "Overexposed",
// etc. Color-coded by tone.

import React from 'react';
import styled from 'styled-components';
import { Star, AlertTriangle, ShieldOff, Award } from 'lucide-react';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.65rem 1rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    background: ${(p) =>
        p.$tone === 'bull' ? 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(16,185,129,0.06))'
      : p.$tone === 'bear' ? 'linear-gradient(135deg, rgba(239,68,68,0.22), rgba(239,68,68,0.06))'
      : 'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(245,158,11,0.06))'};
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
    border: 1px solid currentColor;
`;

const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
`;

const ToneIcon = ({ tone, label }) => {
    if (tone === 'bear')  return <ShieldOff size={16} />;
    if (tone === 'warn')  return <AlertTriangle size={16} />;
    if (label?.toLowerCase().includes('high-quality')) return <Award size={16} />;
    return <Star size={16} />;
};

const StrategyInsight = ({ insight, theme }) => {
    if (!insight) return null;
    return (
        <div>
            <Eyebrow theme={theme}><Star size={11} /> Strategy Insight</Eyebrow>
            <Wrap theme={theme} $tone={insight.tone}>
                <ToneIcon tone={insight.tone} label={insight.label} />
                {insight.label}
            </Wrap>
        </div>
    );
};

export default StrategyInsight;
