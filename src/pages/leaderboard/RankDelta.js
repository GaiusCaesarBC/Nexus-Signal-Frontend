// client/src/pages/leaderboard/RankDelta.js
//
// Small ↑+2 / ↓-1 / – chip rendered next to a trader's rank.

import React from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { t } from '../marketReports/styles';

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.15rem 0.4rem;
    border-radius: 5px;
    font-size: 0.6rem;
    font-weight: 800;
    background: ${(p) =>
        p.$delta > 0 ? 'rgba(16, 185, 129, 0.18)'
      : p.$delta < 0 ? 'rgba(239, 68, 68, 0.18)'
      : 'rgba(100, 116, 139, 0.18)'};
    color: ${(p) =>
        p.$delta > 0 ? t(p, 'success', '#10b981')
      : p.$delta < 0 ? t(p, 'error', '#ef4444')
      : t(p, 'text.tertiary', '#64748b')};
    border: 1px solid currentColor;
`;

const Icon = ({ delta }) => {
    if (delta > 0) return <ArrowUp size={9} />;
    if (delta < 0) return <ArrowDown size={9} />;
    return <Minus size={9} />;
};

const RankDelta = ({ delta, theme }) => {
    if (delta == null) return null;
    return (
        <Chip theme={theme} $delta={delta}>
            <Icon delta={delta} />
            {delta > 0 ? `+${delta}` : delta < 0 ? delta : '0'}
        </Chip>
    );
};

export default RankDelta;
