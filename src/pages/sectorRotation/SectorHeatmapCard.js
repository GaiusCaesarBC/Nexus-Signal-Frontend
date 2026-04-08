// client/src/pages/sectorRotation/SectorHeatmapCard.js
//
// Upgraded heatmap. Adds:
//   - Ranking (#1 strongest -> weakest)
//   - Momentum indicator (gaining / losing strength)
//   - Click-through to filter signals by sector
//   - Strength score badge
//   - Subtle glow on top sectors

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { rankSectors } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t, fadeIn,
} from '../marketReports/styles';

const Tabs = styled.div`
    display: flex;
    gap: 0.4rem;
`;

const Tab = styled.button`
    padding: 0.4rem 0.85rem;
    border-radius: 8px;
    border: 1px solid ${(p) =>
        p.$active ? t(p, 'brand.primary', '#00adef')
      : t(p, 'border.card', 'rgba(100, 116, 139, 0.25)')};
    background: ${(p) =>
        p.$active ? 'rgba(0, 173, 237, 0.18)' : 'transparent'};
    color: ${(p) =>
        p.$active ? t(p, 'brand.primary', '#00adef')
      : t(p, 'text.secondary', '#94a3b8')};
    font-weight: 700;
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.7rem;
`;

const Tile = styled.button`
    text-align: left;
    cursor: pointer;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: ${(p) =>
        p.$tone === 'bull' ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.06))'
      : p.$tone === 'bear' ? 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))'
      : 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))'};
    border: 1px solid ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.40)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.40)'
      : 'rgba(245, 158, 11, 0.40)'};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    transition: transform 0.15s ease, box-shadow 0.2s ease;
    animation: ${fadeIn} 0.4s ease-out both;
    position: relative;

    /* Glow on top 3 */
    box-shadow: ${(p) =>
        p.$rank <= 3 && p.$tone === 'bull' ? '0 0 24px rgba(16, 185, 129, 0.30)'
      : p.$rank <= 3 && p.$tone === 'bear' ? '0 0 24px rgba(239, 68, 68, 0.20)'
      : 'none'};

    &:hover {
        transform: translateY(-2px);
    }
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.4rem;
`;

const RankPill = styled.span`
    font-size: 0.62rem;
    font-weight: 800;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    letter-spacing: 0.04em;
`;

const SymbolBox = styled.div`
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.04em;
`;

const NameLine = styled.div`
    font-size: 0.75rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    margin-bottom: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const BottomRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Score = styled.div`
    font-size: 1.05rem;
    font-weight: 800;
    color: ${(p) =>
        p.$tone === 'bull' ? t(p, 'success', '#10b981')
      : p.$tone === 'bear' ? t(p, 'error', '#ef4444')
      : t(p, 'warning', '#f59e0b')};
`;

const Mom = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.68rem;
    font-weight: 800;
    color: ${(p) =>
        p.$dir === 'up' ? t(p, 'success', '#10b981')
      : p.$dir === 'down' ? t(p, 'error', '#ef4444')
      : t(p, 'text.tertiary', '#64748b')};
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

const MomIcon = ({ dir }) =>
    dir === 'up' ? <TrendingUp size={11} />
  : dir === 'down' ? <TrendingDown size={11} />
  : <Minus size={11} />;

const SectorHeatmapCard = ({ sectors, timeframe, onTimeframeChange }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const ranked = rankSectors(sectors);

    const open = (s) => navigate(`/signals?symbol=${encodeURIComponent(s.symbol)}`);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <BarChart3 size={14} /> Sector Heatmap
                </SectionTitle>
                <Tabs>
                    {['day', 'week', 'month'].map((tf) => (
                        <Tab
                            key={tf}
                            theme={theme}
                            $active={timeframe === tf}
                            onClick={() => onTimeframeChange?.(tf)}
                        >
                            {tf[0].toUpperCase() + tf.slice(1)}
                        </Tab>
                    ))}
                </Tabs>
            </SectionHeader>

            <Grid>
                {ranked.map((s, i) => {
                    const rank = i + 1;
                    return (
                        <Tile
                            key={s.id}
                            theme={theme}
                            $tone={s.tone}
                            $rank={rank}
                            onClick={() => open(s)}
                        >
                            <TopRow>
                                <SymbolBox>{s.symbol}</SymbolBox>
                                <RankPill theme={theme}>#{rank}</RankPill>
                            </TopRow>
                            <NameLine theme={theme}>{s.name}</NameLine>
                            <BottomRow>
                                <Score theme={theme} $tone={s.tone}>{s.score}</Score>
                                <Mom theme={theme} $dir={s.momentum.dir}>
                                    <MomIcon dir={s.momentum.dir} />
                                    {s.momentum.dir === 'up' ? 'Gaining'
                                   : s.momentum.dir === 'down' ? 'Losing'
                                   : 'Flat'}
                                </Mom>
                            </BottomRow>
                        </Tile>
                    );
                })}
            </Grid>
        </SectionCard>
    );
};

export default SectorHeatmapCard;
