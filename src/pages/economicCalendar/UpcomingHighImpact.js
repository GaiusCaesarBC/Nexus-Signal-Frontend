// client/src/pages/economicCalendar/UpcomingHighImpact.js
//
// Timeline of next 24-72h HIGH IMPACT events.

import React from 'react';
import styled from 'styled-components';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { upcomingHighImpact, COUNTRY_META, todayISO } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t, fadeIn,
} from '../marketReports/styles';

const Timeline = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.75rem;
`;

const Slot = styled.div`
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid rgba(239, 68, 68, 0.40);
    box-shadow: 0 0 18px rgba(239, 68, 68, 0.12);
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.4s ease-out both;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: linear-gradient(90deg, rgba(239, 68, 68, 0.9), transparent);
    }
`;

const When = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'error', '#ef4444')};
`;

const Name = styled.div`
    font-size: 0.95rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.3;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    .flag { font-size: 1rem; line-height: 1; }
`;

const Meta = styled.div`
    display: flex;
    gap: 0.85rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.75rem;
    font-weight: 600;

    span {
        display: flex;
        align-items: center;
        gap: 0.3rem;
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

const dayLabel = (dateStr) => {
    const today = todayISO();
    if (dateStr === today) return 'Today';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';

    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const UpcomingHighImpact = ({ events }) => {
    const { theme } = useTheme();
    const upcoming = upcomingHighImpact(events, 72);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Bell size={14} /> Upcoming High-Impact (72h)
                </SectionTitle>
            </SectionHeader>

            {upcoming.length === 0 ? (
                <Empty theme={theme}>
                    No high-impact events scheduled in the next 72 hours.
                </Empty>
            ) : (
                <Timeline>
                    {upcoming.map((e) => {
                        const country = COUNTRY_META[e.country];
                        return (
                            <Slot key={`${e.name}-${e.date}-${e.time}`} theme={theme}>
                                <When theme={theme}>
                                    <AlertTriangle size={11} />
                                    {dayLabel(e.date)}
                                </When>
                                <Name theme={theme}>
                                    <span className="flag">{country?.flag || '🌐'}</span>
                                    {e.name}
                                </Name>
                                <Meta theme={theme}>
                                    <span><Clock size={11} /> {e.time || 'TBD'}</span>
                                    <span>{country?.name || e.country}</span>
                                </Meta>
                            </Slot>
                        );
                    })}
                </Timeline>
            )}
        </SectionCard>
    );
};

export default UpcomingHighImpact;
