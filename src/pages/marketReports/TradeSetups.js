// client/src/pages/marketReports/TradeSetups.js
//
// "How To Trade This" — concrete IF/THEN setups derived from the report.
// Each card has a trigger (sector/event/condition) and an action.
//
// Setups are derived client-side via deriveTradeSetups(). TODO(server).

import React from 'react';
import styled from 'styled-components';
import { Crosshair, ArrowRight, Zap, Shield, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { deriveTradeSetups } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, ActionButton, t, fadeIn,
} from './styles';

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.85rem;
`;

const SetupCard = styled.div`
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.2)')};
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    animation: ${fadeIn} 0.4s ease-out both;
    transition: border-color 0.2s ease, transform 0.15s ease;

    &:hover {
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
        transform: translateY(-1px);
    }
`;

const Tag = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    align-self: flex-start;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    background: ${(p) =>
        p.$tag === 'Risk' ? 'rgba(239, 68, 68, 0.18)'
      : p.$tag === 'Volatility' ? 'rgba(245, 158, 11, 0.18)'
      : p.$tag === 'Momentum' ? 'rgba(16, 185, 129, 0.18)'
      : 'rgba(0, 173, 237, 0.18)'};
    color: ${(p) =>
        p.$tag === 'Risk' ? t(p, 'error', '#ef4444')
      : p.$tag === 'Volatility' ? t(p, 'warning', '#f59e0b')
      : p.$tag === 'Momentum' ? t(p, 'success', '#10b981')
      : t(p, 'brand.primary', '#00adef')};
`;

const Trigger = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 1rem;
    font-weight: 800;

    svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
`;

const Action = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;
    line-height: 1.5;

    svg {
        flex: 0 0 auto;
        margin-top: 3px;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
`;

const tagIcon = (tag) =>
    tag === 'Risk' ? Shield
  : tag === 'Volatility' ? Activity
  : tag === 'Momentum' ? Zap
  : Crosshair;

const TradeSetups = ({ report }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const setups = deriveTradeSetups(report);

    if (!setups.length) return null;

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Crosshair size={14} /> How To Trade This
                </SectionTitle>
                <ActionButton theme={theme} onClick={() => navigate('/screener')}>
                    Run screener <ArrowRight size={14} />
                </ActionButton>
            </SectionHeader>

            <Grid>
                {setups.map((s, i) => {
                    const Icon = tagIcon(s.tag);
                    return (
                        <SetupCard key={i} theme={theme}>
                            <Tag theme={theme} $tag={s.tag}>{s.tag}</Tag>
                            <Trigger theme={theme}>
                                <Icon size={16} />
                                {s.trigger}
                            </Trigger>
                            <Action theme={theme}>
                                <ArrowRight size={14} />
                                <span>{s.action}</span>
                            </Action>
                        </SetupCard>
                    );
                })}
            </Grid>
        </SectionCard>
    );
};

export default TradeSetups;
