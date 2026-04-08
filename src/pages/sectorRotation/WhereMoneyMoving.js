// client/src/pages/sectorRotation/WhereMoneyMoving.js
//
// HERO section. Top-of-page answer to "where is capital flowing right now?"
// Shows: top 3 inflow sectors, top 1-2 outflow sectors, RISK-ON/OFF bias,
// and CTAs into Signals + Screener.

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, ArrowRight, Zap, Shield, Activity, Search,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { whereMoneyMoving } from './derive';
import { t, fadeIn, ActionButton } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 18px;
    padding: 1.6rem 1.75rem;
    margin-bottom: 1.75rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(16, 185, 129, 0.10) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(0, 173, 237, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.92)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    box-shadow: ${(p) => t(p, 'glow.primary', '0 0 30px rgba(0, 173, 237, 0.18)')};
    animation: ${fadeIn} 0.5s ease-out both;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: linear-gradient(90deg, #10b981, #00adef, #f59e0b);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
`;

const TitleBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Title = styled.h2`
    margin: 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;

    @media (max-width: 640px) { font-size: 1.2rem; }
`;

const BiasBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: ${(p) =>
        p.$bias === 'RISK-ON' ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.10))'
      : p.$bias === 'RISK-OFF' ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.10))'
      : 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.10))'};
    color: ${(p) =>
        p.$bias === 'RISK-ON' ? t(p, 'success', '#10b981')
      : p.$bias === 'RISK-OFF' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
    border: 1px solid currentColor;
`;

const Columns = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
    margin-bottom: 1.1rem;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const ColTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) =>
        p.$kind === 'in' ? t(p, 'success', '#10b981')
      : t(p, 'error', '#ef4444')};
`;

const SectorRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: ${(p) =>
        p.$kind === 'in' ? 'rgba(16, 185, 129, 0.08)'
      : 'rgba(239, 68, 68, 0.08)'};
    border: 1px solid ${(p) =>
        p.$kind === 'in' ? 'rgba(16, 185, 129, 0.30)'
      : 'rgba(239, 68, 68, 0.30)'};
    transition: transform 0.15s ease, border-color 0.2s ease;

    &:hover {
        transform: translateX(2px);
        border-color: ${(p) =>
            p.$kind === 'in' ? 'rgba(16, 185, 129, 0.55)'
          : 'rgba(239, 68, 68, 0.55)'};
    }
`;

const Rank = styled.div`
    width: 26px;
    height: 26px;
    flex: 0 0 auto;
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 0.78rem;
    font-weight: 800;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.25)')};
`;

const Name = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
`;

const NameTop = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-weight: 800;
    font-size: 0.95rem;
`;

const Symbol = styled.span`
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    border-radius: 5px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-weight: 700;
    letter-spacing: 0.04em;
`;

const Label = styled.span`
    font-size: 0.72rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-weight: 600;
`;

const ScoreBlock = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: ${(p) =>
        p.$kind === 'in' ? t(p, 'success', '#10b981')
      : t(p, 'error', '#ef4444')};
    font-weight: 800;
    font-size: 1.05rem;

    svg {
        opacity: 0.9;
    }
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
`;

const CTAGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const MomentumIcon = ({ dir }) => {
    if (dir === 'up') return <TrendingUp size={16} />;
    if (dir === 'down') return <TrendingDown size={16} />;
    return <Activity size={16} />;
};

const BiasIcon = ({ bias }) => {
    if (bias === 'RISK-ON') return <Zap size={16} />;
    if (bias === 'RISK-OFF') return <Shield size={16} />;
    return <Activity size={16} />;
};

const WhereMoneyMoving = ({ sectors }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const { topInflows, topOutflows, bias } = whereMoneyMoving(sectors);

    return (
        <Wrap theme={theme}>
            <Header>
                <TitleBlock>
                    <Eyebrow theme={theme}><Zap size={12} /> Where Money Is Moving Now</Eyebrow>
                    <Title theme={theme}>Capital flow, right now</Title>
                </TitleBlock>
                <BiasBadge theme={theme} $bias={bias}>
                    <BiasIcon bias={bias} />
                    {bias}
                </BiasBadge>
            </Header>

            <Columns>
                <Column>
                    <ColTitle theme={theme} $kind="in">
                        <TrendingUp size={12} /> Top Inflows
                    </ColTitle>
                    {topInflows.map((s, i) => (
                        <SectorRow key={s.id} theme={theme} $kind="in">
                            <Rank theme={theme}>#{i + 1}</Rank>
                            <Name>
                                <NameTop theme={theme}>
                                    {s.name}
                                    <Symbol theme={theme}>{s.symbol}</Symbol>
                                </NameTop>
                                <Label theme={theme}>{s.label}</Label>
                            </Name>
                            <ScoreBlock theme={theme} $kind="in">
                                <MomentumIcon dir={s.momentum.dir} />
                                {s.score}
                            </ScoreBlock>
                        </SectorRow>
                    ))}
                </Column>

                <Column>
                    <ColTitle theme={theme} $kind="out">
                        <TrendingDown size={12} /> Top Outflows
                    </ColTitle>
                    {topOutflows.map((s) => (
                        <SectorRow key={s.id} theme={theme} $kind="out">
                            <Name>
                                <NameTop theme={theme}>
                                    {s.name}
                                    <Symbol theme={theme}>{s.symbol}</Symbol>
                                </NameTop>
                                <Label theme={theme}>{s.label}</Label>
                            </Name>
                            <ScoreBlock theme={theme} $kind="out">
                                <MomentumIcon dir={s.momentum.dir} />
                                {s.score}
                            </ScoreBlock>
                        </SectorRow>
                    ))}
                </Column>
            </Columns>

            <Footer theme={theme}>
                <Label theme={theme}>
                    Ranks update from latest sector performance + relative strength.
                </Label>
                <CTAGroup>
                    <ActionButton theme={theme} onClick={() => navigate('/screener')}>
                        <Search size={14} /> Find setups
                    </ActionButton>
                    <ActionButton theme={theme} $primary onClick={() => navigate('/signals')}>
                        View sector trades <ArrowRight size={14} />
                    </ActionButton>
                </CTAGroup>
            </Footer>
        </Wrap>
    );
};

export default WhereMoneyMoving;
