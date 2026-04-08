// client/src/pages/calculators/RiskBar.js
//
// Visual risk indicator. 4 zones (Safe / Standard / Aggressive / Overexposed)
// with a marker showing where the current trade lands.

import React from 'react';
import styled from 'styled-components';
import { Shield, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
`;

const Top = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const Label = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
`;

const Verdict = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 800;
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const Track = styled.div`
    position: relative;
    height: 14px;
    border-radius: 8px;
    overflow: hidden;
    background: linear-gradient(
        90deg,
        rgba(16, 185, 129, 0.85) 0%,
        rgba(16, 185, 129, 0.85) 22%,
        rgba(16, 185, 129, 0.7)  44%,
        rgba(245, 158, 11, 0.8)  44%,
        rgba(245, 158, 11, 0.85) 72%,
        rgba(239, 68, 68, 0.85)  72%,
        rgba(239, 68, 68, 0.95)  100%
    );
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
`;

const Marker = styled.div`
    position: absolute;
    top: -6px;
    left: ${(p) => Math.max(0, Math.min(100, p.$position))}%;
    transform: translateX(-50%);
    width: 4px;
    height: 26px;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
`;

const Scale = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.62rem;
    font-weight: 700;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    text-transform: uppercase;
    letter-spacing: 0.06em;
`;

const ScaleStop = styled.span`
    flex: 1;
    text-align: ${(p) => p.$align || 'center'};
`;

const VerdictIcon = ({ tone, riskKey }) => {
    if (riskKey === 'safe')        return <ShieldCheck size={14} />;
    if (riskKey === 'standard')    return <Shield size={14} />;
    if (riskKey === 'aggressive')  return <AlertTriangle size={14} />;
    if (riskKey === 'overexposed') return <AlertOctagon size={14} />;
    return tone === 'bull' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />;
};

const RiskBar = ({ riskLevel, theme }) => {
    if (!riskLevel) return null;

    return (
        <Wrap theme={theme}>
            <Top>
                <Label theme={theme}>Risk Level</Label>
                <Verdict theme={theme} $tone={riskLevel.tone}>
                    <VerdictIcon tone={riskLevel.tone} riskKey={riskLevel.key} />
                    {riskLevel.label}
                </Verdict>
            </Top>
            <Track theme={theme}>
                <Marker $position={riskLevel.position} />
            </Track>
            <Scale theme={theme}>
                <ScaleStop $align="left">Safe</ScaleStop>
                <ScaleStop>Standard</ScaleStop>
                <ScaleStop>Aggressive</ScaleStop>
                <ScaleStop $align="right">Overexposed</ScaleStop>
            </Scale>
        </Wrap>
    );
};

export default RiskBar;
