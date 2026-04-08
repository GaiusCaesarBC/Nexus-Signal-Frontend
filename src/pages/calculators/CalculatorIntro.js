// client/src/pages/calculators/CalculatorIntro.js
//
// Small "what this is used for" chip rendered above the input form so the
// calculator feels like part of a system, not a standalone tool.

import React from 'react';
import styled from 'styled-components';
import { Info } from 'lucide-react';
import { CALC_DESCRIPTIONS } from './derive';
import { t } from '../marketReports/styles';

const Chip = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;

    .tag {
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
    .blurb {
        font-size: 0.85rem;
        line-height: 1.45;
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    }
`;

const CalculatorIntro = ({ calculatorId, theme }) => {
    const desc = CALC_DESCRIPTIONS[calculatorId];
    if (!desc) return null;

    return (
        <Chip theme={theme}>
            <Info size={16} />
            <Body theme={theme}>
                <span className="tag">{desc.purpose}</span>
                <span className="blurb">{desc.blurb}</span>
            </Body>
        </Chip>
    );
};

export default CalculatorIntro;
