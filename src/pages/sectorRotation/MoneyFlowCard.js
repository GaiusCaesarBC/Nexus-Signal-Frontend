// client/src/pages/sectorRotation/MoneyFlowCard.js
//
// Decision-driven money flow split. Inflows / outflows ranked, with a
// "Rotation Insight" box explaining what's happening in plain English.

import React from 'react';
import styled from 'styled-components';
import { Zap, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { rotationInsight, rankSectors } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const Split = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const ColumnTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) =>
        p.$kind === 'in' ? t(p, 'success', '#10b981')
      : t(p, 'error', '#ef4444')};
    margin-bottom: 0.25rem;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    background: ${(p) =>
        p.$kind === 'in' ? 'rgba(16, 185, 129, 0.10)'
      : 'rgba(239, 68, 68, 0.10)'};
    border: 1px solid ${(p) =>
        p.$kind === 'in' ? 'rgba(16, 185, 129, 0.30)'
      : 'rgba(239, 68, 68, 0.30)'};
`;

const Sector = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-weight: 700;
    font-size: 0.9rem;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .sym {
        font-size: 0.7rem;
        padding: 0.15rem 0.4rem;
        border-radius: 5px;
        background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        font-weight: 700;
    }
`;

const Score = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 800;
    color: ${(p) =>
        p.$kind === 'in' ? t(p, 'success', '#10b981')
      : t(p, 'error', '#ef4444')};
    font-size: 0.95rem;
`;

const Insight = styled.div`
    margin-top: 1rem;
    padding: 0.95rem 1.1rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.12), rgba(0, 173, 237, 0.04));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
    div {
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        font-size: 0.92rem;
        line-height: 1.5;
        font-weight: 600;
    }
`;

const InsightLabel = styled.div`
    font-size: 0.65rem !important;
    font-weight: 800 !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'brand.primary', '#00adef')} !important;
    margin-bottom: 0.25rem;
`;

const MoneyFlowCard = ({ sectors, flowData }) => {
    const { theme } = useTheme();
    const ranked = rankSectors(sectors);
    const inflows = ranked.slice(0, 4);
    const outflows = ranked.slice(-4).reverse();
    const insight = rotationInsight(sectors, flowData);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Zap size={14} /> Money Flow Analysis
                </SectionTitle>
            </SectionHeader>

            <Split>
                <Column>
                    <ColumnTitle theme={theme} $kind="in">
                        <TrendingUp size={12} /> Inflows
                    </ColumnTitle>
                    {inflows.map((s) => (
                        <Row key={s.id} theme={theme} $kind="in">
                            <Sector theme={theme}>
                                <span className="sym">{s.symbol}</span>
                                {s.name}
                            </Sector>
                            <Score theme={theme} $kind="in">+{s.score}</Score>
                        </Row>
                    ))}
                </Column>

                <Column>
                    <ColumnTitle theme={theme} $kind="out">
                        <TrendingDown size={12} /> Outflows
                    </ColumnTitle>
                    {outflows.map((s) => (
                        <Row key={s.id} theme={theme} $kind="out">
                            <Sector theme={theme}>
                                <span className="sym">{s.symbol}</span>
                                {s.name}
                            </Sector>
                            <Score theme={theme} $kind="out">-{100 - s.score}</Score>
                        </Row>
                    ))}
                </Column>
            </Split>

            <Insight theme={theme}>
                <Info size={18} />
                <div>
                    <InsightLabel theme={theme}>Rotation Insight</InsightLabel>
                    {insight}
                </div>
            </Insight>
        </SectionCard>
    );
};

export default MoneyFlowCard;
