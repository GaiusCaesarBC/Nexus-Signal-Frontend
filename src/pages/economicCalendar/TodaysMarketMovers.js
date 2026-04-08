// client/src/pages/economicCalendar/TodaysMarketMovers.js
//
// HERO section. Top 3-5 events ranked by importance for today.
// Each card answers: when, what, why it matters, how to trade it.

import React from 'react';
import styled from 'styled-components';
import {
    Zap, Clock, TrendingUp, TrendingDown, Activity, Target, Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    todaysMarketMovers, importanceScore, expectedBias, whyItMatters,
    howToTradeIt, COUNTRY_META,
} from './derive';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 18px;
    padding: 1.6rem 1.75rem;
    margin-bottom: 1.75rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(239, 68, 68, 0.10) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(0, 173, 237, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.92)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    box-shadow: ${(p) => t(p, 'glow.primary', '0 0 30px rgba(0, 173, 237, 0.18)')};
    animation: ${fadeIn} 0.5s ease-out both;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: linear-gradient(90deg, #ef4444, #f59e0b, #00adef);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
`;

const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Title = styled.h2`
    margin: 0.2rem 0 0 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;

    @media (max-width: 640px) { font-size: 1.2rem; }
`;

const CountBadge = styled.div`
    padding: 0.5rem 0.9rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.25)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.78rem;
    font-weight: 700;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.85rem;
`;

const Card = styled.div`
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.6)')};
    border: 1px solid ${(p) =>
        p.$impact === 'high' ? 'rgba(239, 68, 68, 0.45)'
      : p.$impact === 'medium' ? 'rgba(245, 158, 11, 0.45)'
      : 'rgba(100, 116, 139, 0.35)'};
    box-shadow: ${(p) =>
        p.$impact === 'high' ? '0 0 24px rgba(239, 68, 68, 0.18)'
      : 'none'};
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    animation: ${fadeIn} 0.45s ease-out both;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) =>
            p.$impact === 'high' ? 'linear-gradient(90deg, rgba(239,68,68,0.9), transparent)'
          : p.$impact === 'medium' ? 'linear-gradient(90deg, rgba(245,158,11,0.9), transparent)'
          : 'linear-gradient(90deg, rgba(100,116,139,0.9), transparent)'};
    }
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const NameLine = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-weight: 800;
    font-size: 1rem;
    min-width: 0;

    .flag { font-size: 1.1rem; line-height: 1; }
    .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const ImpactPill = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.55rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: ${(p) =>
        p.$impact === 'high' ? 'rgba(239, 68, 68, 0.18)'
      : p.$impact === 'medium' ? 'rgba(245, 158, 11, 0.18)'
      : 'rgba(100, 116, 139, 0.18)'};
    color: ${(p) =>
        p.$impact === 'high' ? t(p, 'error', '#ef4444')
      : p.$impact === 'medium' ? t(p, 'warning', '#f59e0b')
      : t(p, 'text.secondary', '#94a3b8')};
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.78rem;
    font-weight: 600;

    span { display: flex; align-items: center; gap: 0.3rem; }
`;

const NumbersRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const NumChip = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    padding: 0.3rem 0.55rem;
    border-radius: 6px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};

    .label {
        font-size: 0.6rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
    .value {
        font-size: 0.85rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
`;

const BiasChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: ${(p) =>
        p.$bias === 'bullish' ? 'rgba(16, 185, 129, 0.18)'
      : p.$bias === 'bearish' ? 'rgba(239, 68, 68, 0.18)'
      : 'rgba(245, 158, 11, 0.18)'};
    color: ${(p) =>
        p.$bias === 'bullish' ? t(p, 'success', '#10b981')
      : p.$bias === 'bearish' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const Line = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.85rem;
    line-height: 1.45;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
    strong {
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-size: 0.65rem;
        margin-right: 0.35rem;
    }
`;

const BiasIcon = ({ bias }) =>
    bias === 'bullish' ? <TrendingUp size={11} />
  : bias === 'bearish' ? <TrendingDown size={11} />
  : <Activity size={11} />;

const TodaysMarketMovers = ({ events }) => {
    const { theme } = useTheme();
    const movers = todaysMarketMovers(events, 5);

    if (movers.length === 0) return null;

    return (
        <Wrap theme={theme}>
            <Header>
                <div>
                    <Eyebrow theme={theme}><Zap size={12} /> Today's Market Movers</Eyebrow>
                    <Title theme={theme}>What will move markets today</Title>
                </div>
                <CountBadge theme={theme}>{movers.length} ranked event{movers.length !== 1 ? 's' : ''}</CountBadge>
            </Header>

            <Grid>
                {movers.map((event) => {
                    const bias = expectedBias(event);
                    const score = importanceScore(event);
                    const country = COUNTRY_META[event.country];
                    return (
                        <Card key={`${event.name}-${event.date}-${event.time}`} theme={theme} $impact={event.impact}>
                            <TopRow>
                                <NameLine theme={theme}>
                                    <span className="flag">{country?.flag || '🌐'}</span>
                                    <span className="name">{event.name}</span>
                                </NameLine>
                                <ImpactPill theme={theme} $impact={event.impact}>
                                    {event.impact}
                                </ImpactPill>
                            </TopRow>

                            <MetaRow theme={theme}>
                                <span><Clock size={12} /> {event.time || 'TBD'}</span>
                                <span>{country?.name || event.country}</span>
                                <span>Score {score}</span>
                            </MetaRow>

                            {(event.forecast != null || event.previous != null) && (
                                <NumbersRow>
                                    {event.forecast != null && (
                                        <NumChip theme={theme}>
                                            <span className="label">Exp</span>
                                            <span className="value">{event.forecast}</span>
                                        </NumChip>
                                    )}
                                    {event.previous != null && (
                                        <NumChip theme={theme}>
                                            <span className="label">Prev</span>
                                            <span className="value">{event.previous}</span>
                                        </NumChip>
                                    )}
                                    <BiasChip theme={theme} $bias={bias}>
                                        <BiasIcon bias={bias} />
                                        {bias}
                                    </BiasChip>
                                </NumbersRow>
                            )}

                            <Line theme={theme}>
                                <Sparkles size={14} />
                                <span><strong>Why it matters</strong>{whyItMatters(event)}</span>
                            </Line>
                            <Line theme={theme}>
                                <Target size={14} />
                                <span><strong>How to trade it</strong>{howToTradeIt(event)}</span>
                            </Line>
                        </Card>
                    );
                })}
            </Grid>
        </Wrap>
    );
};

export default TodaysMarketMovers;
