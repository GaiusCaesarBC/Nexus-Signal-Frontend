// client/src/pages/watchlist/ActionLabel.js
//
// Small "Trade / Watch / Ignore" chip injected into the table row to answer
// "Should I act?" at a glance.

import React from 'react';
import styled from 'styled-components';
import { Zap, Eye, MinusCircle } from 'lucide-react';
import { t } from '../marketReports/styles';

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.55rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.18)'
      : p.$tone === 'warn' ? 'rgba(245, 158, 11, 0.18)'
      : 'rgba(100, 116, 139, 0.18)'};
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'warn' ? t(p, 'warning', '#f59e0b')
      : t(p, 'text.tertiary', '#64748b')};
    border: 1px solid currentColor;
`;

const Icon = ({ tone }) => {
    if (tone === 'bull') return <Zap size={11} />;
    if (tone === 'warn') return <Eye size={11} />;
    return <MinusCircle size={11} />;
};

const ActionLabel = ({ action, theme }) => {
    if (!action) return null;
    return (
        <Chip theme={theme} $tone={action.tone}>
            <Icon tone={action.tone} />
            {action.label}
        </Chip>
    );
};

export default ActionLabel;
