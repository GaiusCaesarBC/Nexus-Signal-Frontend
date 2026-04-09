// client/src/pages/leaderboard/YourRankPanel.js
//
// Personalized "Your Rank" hero panel. Shows rank, delta, return, win rate,
// XP level + a progress bar to the next milestone (top 10 or top 3) + a
// CTA to "Improve Rank".

import React from 'react';
import styled from 'styled-components';
import {
    TrendingUp, TrendingDown, Minus, Crown, Target, Rocket, Award, Percent, Activity,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { yourRankMetrics } from './derive';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 18px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.5rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(255, 215, 0, 0.10) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(0, 173, 237, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.92)')};
    border: 1px solid rgba(255, 215, 0, 0.30);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.10);
    animation: ${fadeIn} 0.5s ease-out both;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: linear-gradient(90deg, #ffd700, #ff8c00, #00adef);
    }
`;

const Top = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.25rem;
    align-items: center;
    margin-bottom: 1.1rem;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const RankBlock = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const RankBig = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 88px;
    height: 88px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.20), rgba(255, 140, 0, 0.10));
    border: 2px solid rgba(255, 215, 0, 0.50);

    .label {
        font-size: 0.6rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
    .num {
        font-size: 2rem;
        font-weight: 900;
        line-height: 1;
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
`;

const Meta = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    min-width: 0;
`;

const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
`;

const NameLine = styled.h2`
    margin: 0;
    font-size: 1.35rem;
    font-weight: 900;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const LevelChip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.55rem;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.20), rgba(99, 102, 241, 0.10));
    color: #c4b5fd;
    border: 1px solid rgba(168, 85, 247, 0.35);
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
`;

const DeltaChip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 800;
    background: ${(p) =>
        p.$delta > 0 ? 'rgba(16, 185, 129, 0.18)'
      : p.$delta < 0 ? 'rgba(239, 68, 68, 0.18)'
      : 'rgba(100, 116, 139, 0.18)'};
    color: ${(p) =>
        p.$delta > 0 ? t(p, 'success', '#10b981')
      : p.$delta < 0 ? t(p, 'error', '#ef4444')
      : t(p, 'text.tertiary', '#64748b')};
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.6rem;
    margin-bottom: 1rem;
`;

const Stat = styled.div`
    padding: 0.7rem 0.85rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};

    .label {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.6rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
    .value {
        font-size: 1.05rem;
        font-weight: 900;
        margin-top: 0.25rem;
        color: ${(p) =>
            p.$tone === 'bull' ? t(p, 'success', '#10b981')
          : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
          : t(p, 'text.primary', '#f8fafc')};
    }
`;

const ProgressWrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    margin-bottom: 1rem;
`;

const ProgressTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.72rem;
    font-weight: 700;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};

    .left {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-size: 0.66rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};

        svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
    }
`;

const ProgressTrack = styled.div`
    height: 8px;
    border-radius: 6px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.7), rgba(255, 140, 0, 1));
    transition: width 0.6s ease;
`;

const ImproveBtn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.1rem;
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, #ffd700, #ff8c00);
    color: #1a1a1a;
    border: none;
    font-size: 0.9rem;
    font-weight: 800;
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(255, 140, 0, 0.35);
    }
`;

const DeltaIcon = ({ delta }) => {
    if (delta > 0) return <TrendingUp size={12} />;
    if (delta < 0) return <TrendingDown size={12} />;
    return <Minus size={12} />;
};

const YourRankPanel = ({ you, leaderboard, onImprove }) => {
    const { theme } = useTheme();
    if (!you) return null;
    const m = yourRankMetrics(you, leaderboard);
    if (!m) return null;

    const returnTone = m.totalReturn > 0 ? 'bull' : m.totalReturn < 0 ? 'bear' : null;
    const winTone = m.winRate >= 60 ? 'bull' : m.winRate >= 45 ? null : 'bear';

    return (
        <Wrap theme={theme}>
            <Top>
                <RankBlock>
                    <RankBig theme={theme}>
                        <span className="label">Rank</span>
                        <span className="num">#{m.rank}</span>
                    </RankBig>
                    <Meta>
                        <Eyebrow theme={theme}><Crown size={11} /> Your Position</Eyebrow>
                        <NameLine theme={theme}>
                            {you.displayName || you.username || 'You'}
                            <LevelChip theme={theme}><Award size={11} /> LV {m.level}</LevelChip>
                            <DeltaChip theme={theme} $delta={m.rankDelta}>
                                <DeltaIcon delta={m.rankDelta} />
                                {m.rankDelta > 0 ? `+${m.rankDelta} today` : m.rankDelta < 0 ? `${m.rankDelta} today` : 'Steady'}
                            </DeltaChip>
                        </NameLine>
                        {m.percentile != null && (
                            <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                                Top {m.percentile.toFixed(1)}% globally
                            </div>
                        )}
                    </Meta>
                </RankBlock>

                <ImproveBtn theme={theme} onClick={onImprove}>
                    <Rocket size={16} />
                    Improve Rank
                </ImproveBtn>
            </Top>

            <StatsRow>
                <Stat theme={theme} $tone={returnTone}>
                    <span className="label"><TrendingUp size={11} /> Total Return</span>
                    <span className="value">
                        {m.totalReturn >= 0 ? '+' : ''}{m.totalReturn.toFixed(2)}%
                    </span>
                </Stat>
                <Stat theme={theme} $tone={winTone}>
                    <span className="label"><Percent size={11} /> Win Rate</span>
                    <span className="value">{m.winRate.toFixed(1)}%</span>
                </Stat>
                <Stat theme={theme}>
                    <span className="label"><Activity size={11} /> Trades</span>
                    <span className="value">{m.totalTrades}</span>
                </Stat>
                <Stat theme={theme}>
                    <span className="label"><Award size={11} /> XP</span>
                    <span className="value">{m.xp.toLocaleString()}</span>
                </Stat>
            </StatsRow>

            <ProgressWrap>
                <ProgressTop theme={theme}>
                    <span className="left">
                        <Target size={11} />
                        {m.positionsToTarget === 0
                            ? `You're inside the top ${m.targetRank}!`
                            : `Top ${m.targetRank} is ${m.positionsToTarget} ${m.positionsToTarget === 1 ? 'rank' : 'ranks'} away`}
                    </span>
                    <span>{m.progressPct.toFixed(0)}%</span>
                </ProgressTop>
                <ProgressTrack theme={theme}>
                    <ProgressFill $pct={m.progressPct} />
                </ProgressTrack>
            </ProgressWrap>
        </Wrap>
    );
};

export default YourRankPanel;
