// client/src/pages/smartAlerts/SuggestedAlerts.js
//
// "Suggested Alerts (AI)" panel — surfaces 1-click alert ideas derived
// from the user's watchlist + active alerts.

import React from 'react';
import styled from 'styled-components';
import {
    Sparkles, Plus, TrendingUp, TrendingDown, Activity, ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 16px;
    padding: 1.4rem 1.5rem;
    margin-bottom: 1.75rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(168, 85, 247, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
    box-shadow: ${(p) => t(p, 'glow.primary', '0 0 24px rgba(0, 173, 237, 0.15)')};
    animation: ${fadeIn} 0.4s ease-out both;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: linear-gradient(90deg, #a855f7, #00adef, #10b981);
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
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
    font-size: 1.2rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 0.75rem;
`;

const Card = styled.div`
    padding: 0.9rem 1rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) =>
        p.$kind === 'breakout' ? 'rgba(16, 185, 129, 0.35)'
      : p.$kind === 'support' ? 'rgba(239, 68, 68, 0.35)'
      : 'rgba(245, 158, 11, 0.35)'};
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    transition: transform 0.15s ease, border-color 0.2s ease;

    &:hover {
        transform: translateY(-1px);
    }
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const Sym = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 1rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};

    svg {
        color: ${(p) =>
            p.$kind === 'breakout' ? t(p, 'success', '#10b981')
          : p.$kind === 'support' ? t(p, 'error', '#ef4444')
          : t(p, 'warning', '#f59e0b')};
    }
`;

const KindTag = styled.span`
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    background: ${(p) =>
        p.$kind === 'breakout' ? 'rgba(16, 185, 129, 0.18)'
      : p.$kind === 'support' ? 'rgba(239, 68, 68, 0.18)'
      : 'rgba(245, 158, 11, 0.18)'};
    color: ${(p) =>
        p.$kind === 'breakout' ? t(p, 'success', '#10b981')
      : p.$kind === 'support' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const Title2 = styled.div`
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.35;
`;

const Rationale = styled.div`
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.78rem;
    line-height: 1.4;
`;

const CTA = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef, #06b6d4)')};
    color: #fff;
    border: none;
    font-size: 0.78rem;
    font-weight: 700;
    align-self: flex-start;
    transition: transform 0.12s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 14px rgba(0, 173, 237, 0.30)')};
    }
`;

const Empty = styled.div`
    padding: 1rem 1.1rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.30)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.85rem;
`;

const KindIcon = ({ kind }) => {
    if (kind === 'breakout') return <TrendingUp size={14} />;
    if (kind === 'support')  return <TrendingDown size={14} />;
    return <Activity size={14} />;
};

const SuggestedAlerts = ({ suggestions, onCreate }) => {
    const { theme } = useTheme();

    return (
        <Wrap theme={theme}>
            <Header>
                <div>
                    <Eyebrow theme={theme}><Sparkles size={12} /> Suggested Alerts</Eyebrow>
                    <Title theme={theme}>1-click alerts from your watchlist</Title>
                </div>
            </Header>

            {(!suggestions || suggestions.length === 0) ? (
                <Empty theme={theme}>
                    Add assets to your watchlist to unlock AI-powered alert suggestions.
                </Empty>
            ) : (
                <Grid>
                    {suggestions.map((s) => (
                        <Card key={s.id} theme={theme} $kind={s.kind}>
                            <TopRow>
                                <Sym theme={theme} $kind={s.kind}>
                                    <KindIcon kind={s.kind} />
                                    {s.symbol}
                                </Sym>
                                <KindTag theme={theme} $kind={s.kind}>{s.kind}</KindTag>
                            </TopRow>
                            <Title2 theme={theme}>{s.title}</Title2>
                            <Rationale theme={theme}>{s.rationale}</Rationale>
                            <CTA theme={theme} onClick={() => onCreate?.(s.prefill)}>
                                <Plus size={13} /> Create alert <ArrowRight size={12} />
                            </CTA>
                        </Card>
                    ))}
                </Grid>
            )}
        </Wrap>
    );
};

export default SuggestedAlerts;
