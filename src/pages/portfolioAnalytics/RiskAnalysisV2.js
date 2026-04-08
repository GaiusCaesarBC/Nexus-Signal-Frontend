// client/src/pages/portfolioAnalytics/RiskAnalysisV2.js
//
// Replaces the basic "10 score" risk gauge with a real risk profile:
//   - Risk per trade %
//   - Concentration %
//   - Holdings count
//   - Asset type diversity
//   - Bucket label (Low / Moderate / High risk)

import React from 'react';
import styled from 'styled-components';
import {
    Shield, ShieldAlert, ShieldCheck, AlertTriangle, Layers, Target,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { riskProfile } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const Top = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
`;

const Bucket = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.6rem 1rem;
    border-radius: 12px;
    font-size: 1rem;
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
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    margin-bottom: 0.4rem;
`;

const Grid = styled.div`
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

        svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
    }
    .value {
        font-size: 1.15rem;
        font-weight: 900;
        margin-top: 0.25rem;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
          : t(p, 'text.primary', '#f8fafc')};
    }
`;

const BucketIcon = ({ tone }) => {
    if (tone === 'bull') return <ShieldCheck size={16} />;
    if (tone === 'bear') return <ShieldAlert size={16} />;
    return <Shield size={16} />;
};

const RiskAnalysisV2 = ({ analytics }) => {
    const { theme } = useTheme();
    const r = riskProfile(analytics);

    const concTone = r.concentrationPct >= 70 ? 'bear' : r.concentrationPct >= 40 ? 'warn' : 'bull';
    const holdingsTone = r.holdings >= 5 ? 'bull' : r.holdings >= 3 ? 'warn' : 'bear';
    const typesTone = r.assetTypeCount >= 2 ? 'bull' : 'warn';
    const rptTone = r.riskPerTrade == null
        ? null
        : r.riskPerTrade <= 1 ? 'bull'
        : r.riskPerTrade <= 2 ? 'warn'
        : 'bear';

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Shield size={14} /> Risk Analysis
                </SectionTitle>
            </SectionHeader>

            <Top>
                <Eyebrow theme={theme}><AlertTriangle size={11} /> Overall risk posture</Eyebrow>
                <Bucket theme={theme} $tone={r.bucket.tone}>
                    <BucketIcon tone={r.bucket.tone} />
                    {r.bucket.label}
                </Bucket>
            </Top>

            <Grid>
                <Stat theme={theme} $tone={rptTone}>
                    <span className="label"><Target size={11} /> Risk per trade</span>
                    <span className="value">
                        {r.riskPerTrade != null ? `${r.riskPerTrade.toFixed(2)}%` : '—'}
                    </span>
                </Stat>
                <Stat theme={theme} $tone={concTone}>
                    <span className="label"><AlertTriangle size={11} /> Top holding</span>
                    <span className="value">{Math.round(r.concentrationPct)}%</span>
                </Stat>
                <Stat theme={theme} $tone={holdingsTone}>
                    <span className="label"><Layers size={11} /> Holdings</span>
                    <span className="value">{r.holdings}</span>
                </Stat>
                <Stat theme={theme} $tone={typesTone}>
                    <span className="label"><Layers size={11} /> Asset types</span>
                    <span className="value">{r.assetTypeCount}</span>
                </Stat>
            </Grid>
        </SectionCard>
    );
};

export default RiskAnalysisV2;
