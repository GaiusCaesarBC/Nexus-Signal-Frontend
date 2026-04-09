// client/src/pages/leaderboard/BadgeRow.js
//
// Renders dynamic badges (Hot Streak / High Accuracy / Falling / Top
// Performer) inline next to a trader's username.

import React from 'react';
import styled from 'styled-components';
import { t } from '../marketReports/styles';

const Row = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.16rem 0.45rem;
    border-radius: 5px;
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: ${(p) =>
        p.$tone === 'gold' ? 'rgba(255, 215, 0, 0.18)'
      : p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.18)'
      : p.$tone === 'warn' ? 'rgba(245, 158, 11, 0.18)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.18)'
      : 'rgba(100, 116, 139, 0.20)'};
    color: ${(p) =>
        p.$tone === 'gold' ? '#ffd700'
      : p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : t(p, 'text.secondary', '#94a3b8')};
    border: 1px solid currentColor;
`;

const BadgeRow = ({ badges, theme }) => {
    if (!badges || badges.length === 0) return null;
    return (
        <Row>
            {badges.map((b) => (
                <Chip key={b.id} theme={theme} $tone={b.tone} title={b.label}>
                    {b.emoji} {b.label}
                </Chip>
            ))}
        </Row>
    );
};

export default BadgeRow;
