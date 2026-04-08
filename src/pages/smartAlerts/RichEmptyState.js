// client/src/pages/smartAlerts/RichEmptyState.js
//
// Replaces "No alerts yet" with a strong empty state.

import React from 'react';
import styled from 'styled-components';
import { Bell, DollarSign, Activity, Sparkles } from 'lucide-react';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    max-width: 700px;
    margin: 2rem auto;
    padding: 2.5rem 2rem;
    border-radius: 18px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
    text-align: center;
    animation: ${fadeIn} 0.5s ease-out both;
`;

const IconBox = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1.25rem;
    border-radius: 20px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.20), rgba(0, 173, 237, 0.04));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.40)')};
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Title = styled.h2`
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 900;
    background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef, #06b6d4)')};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const Sub = styled.p`
    margin: 0 auto 1.75rem;
    max-width: 480px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 1rem;
    line-height: 1.55;
`;

const Buttons = styled.div`
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    justify-content: center;
`;

const Btn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.2rem;
    border-radius: 12px;
    cursor: pointer;
    background: ${(p) =>
        p.$primary ? t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef, #06b6d4)')
                   : t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    color: ${(p) => p.$primary ? '#fff' : t(p, 'text.primary', '#f8fafc')};
    border: 1px solid ${(p) => p.$primary ? 'transparent' : t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
    font-size: 0.9rem;
    font-weight: 700;
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 18px rgba(0, 173, 237, 0.30)')};
    }
`;

const RichEmptyState = ({ onCreatePrice, onCreateTechnical, onUseSuggestions, theme }) => (
    <Wrap theme={theme}>
        <IconBox theme={theme}><Bell size={36} /></IconBox>
        <Title theme={theme}>Never Miss a Trade Setup Again</Title>
        <Sub theme={theme}>
            Set alerts for price moves, breakouts, and AI-detected opportunities.
            Get notified the moment your conditions trigger.
        </Sub>
        <Buttons>
            <Btn theme={theme} $primary onClick={onCreatePrice}>
                <DollarSign size={16} /> Create Price Alert
            </Btn>
            <Btn theme={theme} onClick={onCreateTechnical}>
                <Activity size={16} /> Create Technical Alert
            </Btn>
            <Btn theme={theme} onClick={onUseSuggestions}>
                <Sparkles size={16} /> Use AI Suggestions
            </Btn>
        </Buttons>
    </Wrap>
);

export default RichEmptyState;
