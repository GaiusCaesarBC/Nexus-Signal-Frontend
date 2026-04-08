// client/src/pages/portfolioAnalytics/BehavioralInsights.js
//
// "Your Trading Behavior" — bulleted observations derived from win rate,
// asset class mix, streaks, and net P/L.

import React from 'react';
import styled from 'styled-components';
import { Brain, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { behavioralInsights } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.55rem;
`;

const Item = styled.li`
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.85rem 1rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.30)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.30)'
      : 'rgba(245, 158, 11, 0.30)'};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.9rem;
    line-height: 1.45;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : t(p, 'warning', '#f59e0b')};
    }
`;

const ToneIcon = ({ tone }) => {
    if (tone === 'bull') return <TrendingUp size={15} />;
    if (tone === 'bear') return <TrendingDown size={15} />;
    return <Activity size={15} />;
};

const BehavioralInsights = ({ analytics }) => {
    const { theme } = useTheme();
    const insights = behavioralInsights(analytics);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Brain size={14} /> Your Trading Behavior
                </SectionTitle>
            </SectionHeader>
            <List>
                {insights.map((i, idx) => (
                    <Item key={idx} theme={theme} $tone={i.tone}>
                        <ToneIcon tone={i.tone} />
                        <span>{i.text}</span>
                    </Item>
                ))}
            </List>
        </SectionCard>
    );
};

export default BehavioralInsights;
