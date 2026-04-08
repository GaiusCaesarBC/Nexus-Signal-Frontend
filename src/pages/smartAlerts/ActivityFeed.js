// client/src/pages/smartAlerts/ActivityFeed.js
//
// "Recent Alert Activity" — chronological list of created / triggered /
// expired events. Built from the alert payload via derive.buildActivityFeed.

import React from 'react';
import styled from 'styled-components';
import { Clock, Bell, XCircle, Plus } from 'lucide-react';
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
`;

const Item = styled.li`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.7rem 0.9rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.85rem;

    .label { flex: 1; min-width: 0; line-height: 1.4; }
    .ago {
        flex: 0 0 auto;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-size: 0.72rem;
        font-weight: 600;
    }

    svg.kind {
        flex: 0 0 auto;
        color: ${(p) =>
            p.$kind === 'triggered' ? t(p, 'success', '#10b981')
          : p.$kind === 'expired'   ? t(p, 'text.tertiary', '#64748b')
          : t(p, 'brand.primary', '#00adef')};
    }
`;

const Empty = styled.div`
    padding: 1.25rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.30)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.88rem;
`;

const KindIcon = ({ kind }) => {
    if (kind === 'triggered') return <Bell size={14} className="kind" />;
    if (kind === 'expired')   return <XCircle size={14} className="kind" />;
    return <Plus size={14} className="kind" />;
};

const timeAgo = (ts) => {
    const ms = Date.now() - ts;
    const s = Math.floor(ms / 1000);
    if (s < 60)    return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60)    return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24)    return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30)    return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
};

const ActivityFeed = ({ alerts }) => {
    const { theme } = useTheme();
    const events = buildActivityFeed(alerts, 12);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Clock size={14} /> Recent Alert Activity
                </SectionTitle>
            </SectionHeader>

            {events.length === 0 ? (
                <Empty theme={theme}>
                    No alert activity yet — create your first alert to start the feed.
                </Empty>
            ) : (
                <List>
                    {events.map((e) => (
                        <Item key={e.id} theme={theme} $kind={e.kind}>
                            <KindIcon kind={e.kind} />
                            <span className="label">{e.label}</span>
                            <span className="ago">{timeAgo(e.ts)}</span>
                        </Item>
                    ))}
                </List>
            )}
        </SectionCard>
    );
};

export default ActivityFeed;
