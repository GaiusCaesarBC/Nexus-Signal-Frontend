// client/src/pages/marketReports/QuickActions.js
//
// Footer row of quick navigation CTAs that bridge the report into the rest of
// the app. Lives at the bottom of the page so the user always has a next step.

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Filter, BarChart3, PieChart, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SectionCard, t, fadeIn } from './styles';

const Row = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
`;

const ActionTile = styled.button`
    text-align: left;
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.2)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    transition: all 0.2s ease;
    animation: ${fadeIn} 0.4s ease-out both;

    &:hover {
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
        transform: translateY(-2px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 20px rgba(0, 173, 237, 0.18)')};
    }

    .icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
        flex: 0 0 auto;
    }
    .label {
        font-size: 0.92rem;
        font-weight: 700;
        line-height: 1.2;
    }
    .sub {
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 700;
    }
    .arrow {
        margin-left: auto;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
`;

const QuickActions = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const actions = [
        { sub: 'Live trades',  label: 'Browse Opportunities', icon: Sparkles, to: '/signals' },
        { sub: 'View all',     label: 'Open Signals',         icon: BarChart3, to: '/signals' },
        { sub: 'Find setups',  label: 'Run Screener',         icon: Filter,    to: '/screener' },
        { sub: 'Deep dive',    label: 'Analyze Sectors',      icon: PieChart,  to: '/market-reports?tab=sector' },
    ];

    return (
        <SectionCard theme={theme}>
            <Row>
                {actions.map((a) => {
                    const Icon = a.icon;
                    return (
                        <ActionTile key={a.label} theme={theme} onClick={() => navigate(a.to)}>
                            <div className="icon"><Icon size={18} /></div>
                            <div>
                                <div className="sub">{a.sub}</div>
                                <div className="label">{a.label}</div>
                            </div>
                            <ArrowRight size={16} className="arrow" />
                        </ActionTile>
                    );
                })}
            </Row>
        </SectionCard>
    );
};

export default QuickActions;
