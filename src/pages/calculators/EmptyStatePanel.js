// client/src/pages/calculators/EmptyStatePanel.js
//
// Replaces the bare "Results will appear here" empty panel with a richer
// preview of what the user will get once they hit Calculate.

import React from 'react';
import styled from 'styled-components';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { CALC_DESCRIPTIONS } from './derive';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2.5rem 1.5rem;
    gap: 1rem;
`;

const IconBox = styled.div`
    width: 72px;
    height: 72px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.18), rgba(0, 173, 237, 0.04));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Title = styled.div`
    font-size: 1.05rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
`;

const Sub = styled.div`
    font-size: 0.85rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    line-height: 1.5;
    max-width: 360px;
`;

const Checklist = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    align-self: stretch;
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;
`;

const Check = styled.li`
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.55rem 0.85rem;
    border-radius: 8px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.82rem;
    text-align: left;

    svg { color: ${(p) => t(p, 'success', '#10b981')}; flex: 0 0 auto; }
`;

// What the user will see once they calculate, per calculator type.
const PREVIEW = {
    'position-size': [
        'Optimal position size in shares',
        'Visual risk level (Safe → Overexposed)',
        'Plain-English breakdown + Trade Ready buttons',
    ],
    'risk-reward': [
        'R:R ratio + breakeven win-rate',
        'Trade quality verdict (Good / Avoid)',
        'Max loss + target gain',
    ],
    'compound-interest': [
        'Future value projection',
        'Total interest earned',
        'Year-by-year breakdown',
    ],
    'retirement': [
        'Projected retirement nest egg',
        'Monthly income at retirement',
        'Inflation-adjusted scenarios',
    ],
    'options': [
        'Max profit + max loss',
        'Breakeven price',
        'Profit/loss at different stock prices',
    ],
    'staking': [
        'Estimated staking rewards',
        'APY breakdown by period',
        'Compound vs simple comparison',
    ],
    'dca': [
        'Average cost per unit',
        'Total invested vs current value',
        'Comparison vs lump-sum',
    ],
};

const EmptyStatePanel = ({ calculatorId, theme }) => {
    const desc = CALC_DESCRIPTIONS[calculatorId];
    const items = PREVIEW[calculatorId] || PREVIEW['position-size'];

    return (
        <Wrap>
            <IconBox theme={theme}>
                <Calculator size={32} />
            </IconBox>
            <Title theme={theme}>Ready to calculate</Title>
            <Sub theme={theme}>
                {desc?.blurb || 'Fill in the form to get instant results.'}
            </Sub>
            <Checklist>
                {items.map((it) => (
                    <Check key={it} theme={theme}>
                        <CheckCircle2 size={14} /> {it}
                    </Check>
                ))}
            </Checklist>
        </Wrap>
    );
};

export default EmptyStatePanel;
