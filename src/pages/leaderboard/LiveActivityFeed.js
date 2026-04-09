// client/src/pages/leaderboard/LiveActivityFeed.js
//
// Live activity feed: shows rank gains, big returns, and hot streaks across
// the leaderboard. Built from the enriched leaderboard via
// derive.buildActivityFeed.

import React from 'react';
import styled from 'styled-components';
import { Activity, ArrowUp, ArrowDown, Flame, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { buildActivityFeed } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    max-height: 420px;
    overflow-y: auto;
    padding-right: 0.25rem;

    /* Custom scrollbar */
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb {
        background: rgba(100, 116, 139, 0.4);
        border-radius: 3px;
    }
`;

const Item = styled.li`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.30)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.30)'
      : 'rgba(245, 158, 11, 0.30)'};
    font-size: 0.83rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};

    .text { flex: 1; min-width: 0; line-height: 1.35; }

    svg.kind {
        flex: 0 0 auto;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : t(p, 'warning', '#f59e0b')};
    }
`;

const Empty = styled.div`
    padding: 1rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.30)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.85rem;
`;

const KindIcon = ({ kind }) => {
    if (kind === 'rank-up')   return <ArrowUp size={14} className="kind" />;
    if (kind === 'rank-down') return <ArrowDown size={14} className="kind" />;
    if (kind === 'streak')    return <Flame size={14} className="kind" />;
    if (kind === 'big-return')return <TrendingUp size={14} className="kind" />;
    return <Activity size={14} className="kind" />;
};

const LiveActivityFeed = ({ enrichedLeaderboard, you }) => {
    const { theme } = useTheme();
    const events = buildActivityFeed(enrichedLeaderboard, you, 12);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Activity size={14} /> Live Activity
                </SectionTitle>
            </SectionHeader>
            {events.length === 0 ? (
                <Empty theme={theme}>
                    No activity yet — refresh in a few seconds to see leaderboard movement.
                </Empty>
            ) : (
                <List>
                    {events.map((e) => (
                        <Item key={e.id} theme={theme} $tone={e.tone}>
                            <KindIcon kind={e.kind} />
                            <span className="text">{e.text}</span>
                        </Item>
                    ))}
                </List>
            )}
        </SectionCard>
    );
};

export default LiveActivityFeed;
