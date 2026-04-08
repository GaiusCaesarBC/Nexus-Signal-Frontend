// client/src/pages/sectorRotation/TradeThisRotation.js
//
// Translates the rotation into concrete trades.
//   - LONG ETFs + leader names from top sectors
//   - SHORT ETFs from bottom sectors
//   - Direction, ticker, reason, confidence% on each card

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Crosshair, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { tradeIdeas } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, ActionButton, t, fadeIn,
} from '../marketReports/styles';

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 0.85rem;
`;

const IdeaCard = styled.button`
    text-align: left;
    cursor: pointer;
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) =>
        p.$direction === 'LONG' ? 'rgba(16, 185, 129, 0.40)'
      : 'rgba(239, 68, 68, 0.40)'};
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    animation: ${fadeIn} 0.4s ease-out both;
    transition: transform 0.15s ease, box-shadow 0.2s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) =>
            p.$direction === 'LONG' ? 'linear-gradient(90deg, rgba(16,185,129,0.8), transparent)'
          : 'linear-gradient(90deg, rgba(239,68,68,0.8), transparent)'};
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${(p) =>
            p.$direction === 'LONG' ? '0 8px 24px rgba(16, 185, 129, 0.18)'
          : '0 8px 24px rgba(239, 68, 68, 0.18)'};
    }
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const Ticker = styled.div`
    font-size: 1.05rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    letter-spacing: 0.02em;
`;

const DirChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.55rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: ${(p) =>
        p.$direction === 'LONG' ? 'rgba(16, 185, 129, 0.18)'
      : 'rgba(239, 68, 68, 0.18)'};
    color: ${(p) =>
        p.$direction === 'LONG' ? t(p, 'success', '#10b981')
      : t(p, 'error', '#ef4444')};
`;

const KindTag = styled.span`
    font-size: 0.62rem;
    font-weight: 800;
    padding: 0.12rem 0.4rem;
    border-radius: 5px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    text-transform: uppercase;
    letter-spacing: 0.06em;
`;

const NameLine = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.78rem;
    font-weight: 600;
`;

const Reason = styled.div`
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.85rem;
    line-height: 1.4;
`;

const ConfWrap = styled.div`
    margin-top: 0.2rem;
`;

const ConfTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.35rem;
    font-size: 0.72rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 700;

    .pct {
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        font-size: 0.85rem;
        text-transform: none;
        font-weight: 800;
    }
`;

const ConfBar = styled.div`
    height: 6px;
    border-radius: 4px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    overflow: hidden;

    > span {
        display: block;
        height: 100%;
        width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
        background: ${(p) =>
            p.$direction === 'LONG'
                ? 'linear-gradient(90deg, rgba(16,185,129,0.6), rgba(16,185,129,1))'
                : 'linear-gradient(90deg, rgba(239,68,68,0.6), rgba(239,68,68,1))'};
        transition: width 0.5s ease;
    }
`;

const TradeThisRotation = ({ sectors }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const ideas = tradeIdeas(sectors);

    if (!ideas.length) return null;

    const open = (idea) => {
        // Use the first ticker if multiple comma-separated leaders
        const sym = idea.ticker.split(',')[0].trim();
        navigate(`/signals?symbol=${encodeURIComponent(sym)}`);
    };

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Crosshair size={14} /> Trade This Rotation
                </SectionTitle>
                <ActionButton theme={theme} $primary onClick={() => navigate('/signals')}>
                    View all signals <ArrowRight size={14} />
                </ActionButton>
            </SectionHeader>

            <Grid>
                {ideas.map((i) => (
                    <IdeaCard key={i.id} theme={theme} $direction={i.direction} onClick={() => open(i)}>
                        <TopRow>
                            <Ticker theme={theme}>{i.ticker}</Ticker>
                            <DirChip theme={theme} $direction={i.direction}>
                                {i.direction === 'LONG' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {i.direction}
                            </DirChip>
                        </TopRow>
                        <NameLine theme={theme}>
                            {i.name} <KindTag theme={theme}>{i.kind}</KindTag>
                        </NameLine>
                        <Reason theme={theme}>{i.reason}</Reason>
                        <ConfWrap>
                            <ConfTop theme={theme}>
                                <span>Confidence</span>
                                <span className="pct">{i.confidence}%</span>
                            </ConfTop>
                            <ConfBar theme={theme} $pct={i.confidence} $direction={i.direction}>
                                <span />
                            </ConfBar>
                        </ConfWrap>
                    </IdeaCard>
                ))}
            </Grid>
        </SectionCard>
    );
};

export default TradeThisRotation;
