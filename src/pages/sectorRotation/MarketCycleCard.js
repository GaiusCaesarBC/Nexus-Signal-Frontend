// client/src/pages/sectorRotation/MarketCycleCard.js
//
// Actionable cycle indicator. Goes beyond a label and shows:
//   - Cycle phase
//   - Favored sectors
//   - Sectors to avoid
//   - One-line strategy

import React from 'react';
import styled from 'styled-components';
import { Target, CheckCircle2, XCircle, Compass } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cycleImplications } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const PhaseBlock = styled.div`
    padding: 1.1rem 1.25rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.18), rgba(0, 173, 237, 0.06));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.40)')};
    margin-bottom: 1rem;
    text-align: center;

    .phase-label {
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        margin-bottom: 0.35rem;
    }
    .phase-value {
        font-size: 1.6rem;
        font-weight: 900;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
        line-height: 1.1;
    }
`;

const Lists = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;

    @media (max-width: 520px) {
        grid-template-columns: 1fr;
    }
`;

const ListBlock = styled.div`
    padding: 0.85rem 1rem;
    border-radius: 10px;
    background: ${(p) =>
        p.$kind === 'favor' ? 'rgba(16, 185, 129, 0.10)'
      : 'rgba(239, 68, 68, 0.10)'};
    border: 1px solid ${(p) =>
        p.$kind === 'favor' ? 'rgba(16, 185, 129, 0.30)'
      : 'rgba(239, 68, 68, 0.30)'};

    .head {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${(p) =>
            p.$kind === 'favor' ? t(p, 'success', '#10b981')
          : t(p, 'error', '#ef4444')};
        margin-bottom: 0.6rem;
    }
    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
    }
    li {
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.3rem 0.55rem;
        border-radius: 6px;
        background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.6)')};
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
`;

const Action = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.85rem 1rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.9rem;
    line-height: 1.5;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const MarketCycleCard = ({ rotationPhase }) => {
    const { theme } = useTheme();
    const { phase, favor, avoid, action } = cycleImplications(rotationPhase);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Target size={14} /> Market Cycle
                </SectionTitle>
            </SectionHeader>

            <PhaseBlock theme={theme}>
                <div className="phase-label">Current phase</div>
                <div className="phase-value">{phase}</div>
            </PhaseBlock>

            {(favor.length > 0 || avoid.length > 0) && (
                <Lists>
                    {favor.length > 0 && (
                        <ListBlock theme={theme} $kind="favor">
                            <div className="head"><CheckCircle2 size={12} /> Favor</div>
                            <ul>
                                {favor.map((f) => <li key={f} theme={theme}>{f}</li>)}
                            </ul>
                        </ListBlock>
                    )}
                    {avoid.length > 0 && (
                        <ListBlock theme={theme} $kind="avoid">
                            <div className="head"><XCircle size={12} /> Avoid</div>
                            <ul>
                                {avoid.map((a) => <li key={a} theme={theme}>{a}</li>)}
                            </ul>
                        </ListBlock>
                    )}
                </Lists>
            )}

            <Action theme={theme}>
                <Compass size={16} />
                <span>{action}</span>
            </Action>
        </SectionCard>
    );
};

export default MarketCycleCard;
