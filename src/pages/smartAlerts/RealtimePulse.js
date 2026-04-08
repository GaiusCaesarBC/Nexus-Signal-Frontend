// client/src/pages/smartAlerts/RealtimePulse.js
//
// Tiny "LIVE" indicator that visually pings every poll cycle. Sits next to
// the page title to make the page feel like a trading terminal.

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { t } from '../marketReports/styles';

const ping = keyframes`
    0%   { transform: scale(0.9); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
`;

const Wrap = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid rgba(16, 185, 129, 0.40);
`;

const Dot = styled.span`
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => t(p, 'success', '#10b981')};

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${(p) => t(p, 'success', '#10b981')};
        animation: ${ping} 1.6s ease-out infinite;
    }
`;

const Label = styled.span`
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'success', '#10b981')};
`;

const RealtimePulse = ({ theme, label = 'Live' }) => (
    <Wrap theme={theme}>
        <Dot theme={theme} />
        <Label theme={theme}>{label}</Label>
    </Wrap>
);

export default RealtimePulse;
