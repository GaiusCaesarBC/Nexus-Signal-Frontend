// client/src/pages/sectorRotation/AIInsightPanel.js
//
// Punchy, action-focused AI insight (replaces generic prose).

import React from 'react';
import styled from 'styled-components';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { aiInsight } from './derive';
import { SectionCard, SectionHeader, SectionTitle, t } from '../marketReports/styles';

const Body = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    padding: 1rem 1.15rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(0, 173, 237, 0.08));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.96rem;
    line-height: 1.55;
    font-weight: 600;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const AIInsightPanel = ({ sectors, rotationPhase }) => {
    const { theme } = useTheme();
    const insight = aiInsight(sectors, rotationPhase);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Sparkles size={14} /> AI Insight
                </SectionTitle>
            </SectionHeader>
            <Body theme={theme}>
                <Sparkles size={18} />
                <span>{insight}</span>
            </Body>
        </SectionCard>
    );
};

export default AIInsightPanel;
