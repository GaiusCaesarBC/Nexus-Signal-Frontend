// client/src/pages/calculators/RiskPresets.js
//
// Quick-select buttons for risk %: Conservative (0.5) / Standard (1) /
// Aggressive (2). One-click sets the risk-percentage field.

import React from 'react';
import styled from 'styled-components';
import { Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RISK_PRESETS } from './derive';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
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
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
`;

const PresetBtn = styled.button`
    padding: 0.7rem 0.85rem;
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    background: ${(p) =>
        p.$active
            ? p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(245, 158, 11, 0.15)'
            : t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) =>
        p.$active
            ? p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.55)' : 'rgba(245, 158, 11, 0.55)'
            : t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    transition: transform 0.15s ease, border-color 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: ${(p) =>
            p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.65)'
          : 'rgba(245, 158, 11, 0.65)'};
    }

    .top {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        font-weight: 800;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : t(p, 'warning', '#f59e0b')};
    }
    .sub {
        font-size: 0.7rem;
        font-weight: 600;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
`;

const PresetIcon = ({ id }) => {
    if (id === 'conservative') return <ShieldCheck size={13} />;
    if (id === 'aggressive')   return <AlertTriangle size={13} />;
    return <Shield size={13} />;
};

const RiskPresets = ({ value, onSelect, theme }) => {
    return (
        <Wrap>
            <Eyebrow theme={theme}><Shield size={11} /> Quick presets</Eyebrow>
            <Row>
                {RISK_PRESETS.map((p) => (
                    <PresetBtn
                        key={p.id}
                        theme={theme}
                        $tone={p.tone}
                        $active={value === p.value}
                        onClick={() => onSelect(p.value)}
                        type="button"
                    >
                        <span className="top">
                            <PresetIcon id={p.id} /> {p.label}
                        </span>
                        <span className="sub">{p.sub}</span>
                    </PresetBtn>
                ))}
            </Row>
        </Wrap>
    );
};

export default RiskPresets;
