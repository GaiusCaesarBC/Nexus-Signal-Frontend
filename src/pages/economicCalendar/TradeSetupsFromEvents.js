// client/src/pages/economicCalendar/TradeSetupsFromEvents.js
//
// Translates today's events into concrete LONG/SHORT trade setups with
// trigger conditions and confidence%. Click-through to Signals.

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    Crosshair, ArrowRight, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { tradeSetupsFor, eventsForToday, importanceScore } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, ActionButton, t, fadeIn,
} from '../marketReports/styles';

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.85rem;
`;

const Card = styled.button`
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
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.4s ease-out both;
    transition: transform 0.15s ease, box-shadow 0.2s ease;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) =>
            p.$direction === 'LONG' ? 'linear-gradient(90deg, rgba(16,185,129,0.9), transparent)'
          : 'linear-gradient(90deg, rgba(239,68,68,0.9), transparent)'};
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

const Asset = styled.div`
    font-size: 1.1rem;
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

const EventTag = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    align-self: flex-start;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
`;

const Trigger = styled.div`
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.85rem;
    line-height: 1.45;

    strong {
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.62rem;
        display: block;
        margin-bottom: 0.2rem;
    }
`;

const ConfWrap = styled.div`
    margin-top: 0.15rem;
`;

const ConfTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.35rem;
    font-size: 0.7rem;
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

const Empty = styled.div`
    padding: 1.25rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.3)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;
`;

const TradeSetupsFromEvents = ({ events }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    // Build setups from today's most important events.
    const today = eventsForToday(events);
    const ranked = [...today].sort((a, b) => importanceScore(b) - importanceScore(a));
    const setups = ranked.flatMap(tradeSetupsFor).slice(0, 8);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Crosshair size={14} /> Trade Setups From Events
                </SectionTitle>
                <ActionButton theme={theme} $primary onClick={() => navigate('/signals')}>
                    View all signals <ArrowRight size={14} />
                </ActionButton>
            </SectionHeader>

            {setups.length === 0 ? (
                <Empty theme={theme}>
                    No event-driven setups for today — focus on flow + technicals.
                </Empty>
            ) : (
                <Grid>
                    {setups.map((s) => (
                        <Card
                            key={s.id}
                            theme={theme}
                            $direction={s.direction}
                            onClick={() => navigate(`/signals?symbol=${encodeURIComponent(s.asset)}`)}
                        >
                            <TopRow>
                                <Asset theme={theme}>{s.asset}</Asset>
                                <DirChip theme={theme} $direction={s.direction}>
                                    {s.direction === 'LONG' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {s.direction}
                                </DirChip>
                            </TopRow>
                            <EventTag theme={theme}>{s.eventName}</EventTag>
                            <Trigger theme={theme}>
                                <strong>If</strong>
                                {s.trigger}
                            </Trigger>
                            <ConfWrap>
                                <ConfTop theme={theme}>
                                    <span>Confidence</span>
                                    <span className="pct">{s.confidence}%</span>
                                </ConfTop>
                                <ConfBar theme={theme} $pct={s.confidence} $direction={s.direction}>
                                    <span />
                                </ConfBar>
                            </ConfWrap>
                        </Card>
                    ))}
                </Grid>
            )}
        </SectionCard>
    );
};

export default TradeSetupsFromEvents;
