// client/src/pages/economicCalendar/EnhancedEventItem.js
//
// Enhanced version of the per-event item used inside the calendar grid.
// Adds: country flag, sentiment indicator, click-to-expand forecast/previous/
// AI interpretation.

import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, TrendingUp, TrendingDown, Activity, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    expectedBias, whyItMatters, howToTradeIt, COUNTRY_META,
} from './derive';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    background: ${(p) =>
        p.$impact === 'high' ? 'rgba(239, 68, 68, 0.15)'
      : p.$impact === 'medium' ? 'rgba(245, 158, 11, 0.15)'
      : 'rgba(100, 116, 139, 0.13)'};
    border-left: 3px solid ${(p) =>
        p.$impact === 'high' ? t(p, 'error', '#ef4444')
      : p.$impact === 'medium' ? t(p, 'warning', '#f59e0b')
      : t(p, 'text.tertiary', '#64748b')};
    border-radius: 0 8px 8px 0;
    cursor: pointer;
    transition: background 0.2s ease;
    overflow: hidden;

    &:hover {
        background: ${(p) =>
            p.$impact === 'high' ? 'rgba(239, 68, 68, 0.22)'
          : p.$impact === 'medium' ? 'rgba(245, 158, 11, 0.22)'
          : 'rgba(100, 116, 139, 0.20)'};
    }

    /* glow on high impact */
    box-shadow: ${(p) =>
        p.$impact === 'high' ? '0 0 12px rgba(239, 68, 68, 0.18)' : 'none'};
`;

const Top = styled.div`
    padding: 0.55rem 0.7rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const TimeRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    font-size: 0.68rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-weight: 600;

    .left { display: flex; align-items: center; gap: 0.35rem; }
    .flag { font-size: 0.85rem; line-height: 1; }
`;

const Name = styled.div`
    font-size: 0.8rem;
    font-weight: 700;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.3;
`;

const BiasDot = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    color: ${(p) =>
        p.$bias === 'bullish' ? t(p, 'success', '#10b981')
      : p.$bias === 'bearish' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const Chev = styled(ChevronDown)`
    transition: transform 0.2s ease;
    transform: ${(p) => (p.$open ? 'rotate(180deg)' : 'none')};
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
`;

const Expand = styled.div`
    padding: 0.6rem 0.7rem 0.7rem 0.7rem;
    border-top: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
`;

const Numbers = styled.div`
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
`;

const NumChip = styled.div`
    padding: 0.2rem 0.45rem;
    border-radius: 5px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    font-size: 0.68rem;

    .label {
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 700;
        margin-right: 0.25rem;
    }
    .value {
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        font-weight: 800;
    }
`;

const InterpLine = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: 0.72rem;
    line-height: 1.4;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};

    svg {
        flex: 0 0 auto;
        margin-top: 1px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const BiasIcon = ({ bias }) =>
    bias === 'bullish' ? <TrendingUp size={10} />
  : bias === 'bearish' ? <TrendingDown size={10} />
  : <Activity size={10} />;

const EnhancedEventItem = ({ event }) => {
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);
    const bias = expectedBias(event);
    const country = COUNTRY_META[event.country];
    const hasNumbers = event.forecast != null || event.previous != null || event.actual != null;

    return (
        <Wrap theme={theme} $impact={event.impact} onClick={() => setOpen((o) => !o)}>
            <Top>
                <TimeRow theme={theme}>
                    <span className="left">
                        <span className="flag">{country?.flag || '🌐'}</span>
                        {event.time || 'TBD'}
                    </span>
                    <BiasDot theme={theme} $bias={bias}>
                        <BiasIcon bias={bias} />
                    </BiasDot>
                    <Chev size={12} $open={open} theme={theme} />
                </TimeRow>
                <Name theme={theme}>{event.name}</Name>
            </Top>

            {open && (
                <Expand theme={theme}>
                    {hasNumbers && (
                        <Numbers>
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
                            {event.actual != null && (
                                <NumChip theme={theme}>
                                    <span className="label">Act</span>
                                    <span className="value">{event.actual}</span>
                                </NumChip>
                            )}
                        </Numbers>
                    )}
                    <InterpLine theme={theme}>
                        <Sparkles size={11} />
                        <span>{whyItMatters(event)}</span>
                    </InterpLine>
                    <InterpLine theme={theme}>
                        <Activity size={11} />
                        <span>{howToTradeIt(event)}</span>
                    </InterpLine>
                </Expand>
            )}
        </Wrap>
    );
};

export default EnhancedEventItem;
