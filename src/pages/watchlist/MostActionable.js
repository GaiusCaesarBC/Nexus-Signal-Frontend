// client/src/pages/watchlist/MostActionable.js
//
// HERO panel: top 1-3 most actionable assets right now, ranked by priority
// score (% move + signal confidence + volatility).

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    Flame, TrendingUp, TrendingDown, Activity, ArrowRight, Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { mostActionable } from './derive';
import { t, fadeIn, ActionButton } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 18px;
    padding: 1.6rem 1.75rem;
    margin-bottom: 1.75rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(239, 68, 68, 0.10) 0%, transparent 55%),
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
        background: linear-gradient(90deg, #ef4444, #f59e0b, #00adef);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.1rem;
    flex-wrap: wrap;
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
    margin: 0.2rem 0 0 0;
    font-size: 1.45rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;

    @media (max-width: 640px) { font-size: 1.2rem; }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 0.85rem;
`;

const Card = styled.button`
    text-align: left;
    cursor: pointer;
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.6)')};
    border: 1px solid ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.45)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.45)'
      : 'rgba(245, 158, 11, 0.45)'};
    box-shadow: ${(p) =>
        p.$tone === 'bull' ? '0 0 22px rgba(16, 185, 129, 0.16)'
      : p.$tone === 'bear' ? '0 0 22px rgba(239, 68, 68, 0.16)'
      : '0 0 22px rgba(245, 158, 11, 0.14)'};
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.2s ease;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) =>
            p.$tone === 'bull' ? 'linear-gradient(90deg, rgba(16,185,129,0.9), transparent)'
          : p.$tone === 'bear' ? 'linear-gradient(90deg, rgba(239,68,68,0.9), transparent)'
          : 'linear-gradient(90deg, rgba(245,158,11,0.9), transparent)'};
    }

    &:hover { transform: translateY(-2px); }
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const Sym = styled.div`
    font-size: 1.15rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    letter-spacing: 0.02em;
`;

const Score = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.55rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
`;

const ChangeRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-size: 0.95rem;
    font-weight: 800;
    color: ${(p) =>
        (p.$dir || 'flat') === 'up' ? t(p, 'success', '#10b981')
      : (p.$dir || 'flat') === 'down' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const SignalChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    align-self: flex-start;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: ${(p) =>
        p.$direction === 'LONG' ? 'rgba(16, 185, 129, 0.18)'
      : 'rgba(239, 68, 68, 0.18)'};
    color: ${(p) =>
        p.$direction === 'LONG' ? t(p, 'success', '#10b981')
      : t(p, 'error', '#ef4444')};
`;

const Insight = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.82rem;
    line-height: 1.4;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const Footer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-top: 0.55rem;
    border-top: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
`;

const ViewLink = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    font-weight: 800;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const DirIcon = ({ dir }) =>
    dir === 'up' ? <TrendingUp size={14} />
  : dir === 'down' ? <TrendingDown size={14} />
  : <Activity size={14} />;

const MostActionable = ({ enriched, isCryptoFn }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const top = mostActionable(enriched, 3);

    if (top.length === 0) return null;

    const open = (sym) => navigate(`/signals?symbol=${encodeURIComponent(sym)}`);

    return (
        <Wrap theme={theme}>
            <Header>
                <div>
                    <Eyebrow theme={theme}><Flame size={12} /> Most Actionable Right Now</Eyebrow>
                    <Title theme={theme}>What deserves your attention</Title>
                </div>
            </Header>

            <Grid>
                {top.map((s) => {
                    const sym = s.symbol || s.ticker || '—';
                    const cp = Number(s.changePercent ?? 0);
                    const tone = cp >= 1 ? 'bull' : cp <= -1 ? 'bear' : 'warn';
                    return (
                        <Card key={sym} theme={theme} $tone={tone} onClick={() => open(sym)}>
                            <TopRow>
                                <Sym theme={theme}>{sym}</Sym>
                                <Score theme={theme}>Score {s._priority}</Score>
                            </TopRow>
                            <ChangeRow theme={theme} $dir={s._momentum}>
                                <DirIcon dir={s._momentum} />
                                {cp >= 0 ? '+' : ''}{cp.toFixed(2)}%
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.75, marginLeft: '0.25rem' }}>
                                    {s._volatility} vol
                                </span>
                            </ChangeRow>
                            {s._signal && (
                                <SignalChip theme={theme} $direction={s._signal.direction}>
                                    {s._signal.direction === 'LONG' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                    {s._signal.direction} · {s._signal.confidence}%
                                </SignalChip>
                            )}
                            <Insight theme={theme}>
                                <Sparkles size={13} />
                                <span>{s._insight}</span>
                            </Insight>
                            <Footer theme={theme}>
                                <ViewLink theme={theme}>
                                    View trade setup <ArrowRight size={12} />
                                </ViewLink>
                            </Footer>
                        </Card>
                    );
                })}
            </Grid>
        </Wrap>
    );
};

export default MostActionable;
