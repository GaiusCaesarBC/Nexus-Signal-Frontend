// client/src/pages/sectorRotation/SectorTrendSparklines.js
//
// Mini sparkline charts for top sectors. Best-effort: if the server provides
// `history` (an array) on the sector, use it; otherwise we synthesize a
// short series from day/week/month performance so the chart is never empty.

import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { rankSectors } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.85rem;
`;

const Card = styled.div`
    padding: 0.95rem 1.05rem;
    border-radius: 12px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    transition: border-color 0.2s ease, transform 0.15s ease;

    &:hover {
        border-color: ${(p) =>
            p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.55)'
          : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.55)'
          : 'rgba(245, 158, 11, 0.55)'};
        transform: translateY(-1px);
    }
`;

const Top = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
`;

const NameBlock = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;

    .sym {
        font-weight: 800;
        font-size: 1rem;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        letter-spacing: 0.04em;
    }
    .name {
        font-size: 0.7rem;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
`;

const Acc = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${(p) =>
        p.$dir === 'up' ? t(p, 'success', '#10b981')
      : p.$dir === 'down' ? t(p, 'error', '#ef4444')
      : t(p, 'text.tertiary', '#64748b')};
`;

const Spark = styled.div`
    height: 50px;
`;

const buildSeries = (sector) => {
    if (Array.isArray(sector.history) && sector.history.length >= 3) {
        return sector.history.map((v, i) => ({ i, v: typeof v === 'number' ? v : v?.value ?? 0 }));
    }
    // Synthesize a 7-point series from month -> week -> day so it visually
    // matches the trend. Centered around 100.
    const month = sector.month;
    const week = sector.week;
    const day = sector.day;
    const start = 100;
    const w = start + (month - week);
    const m = start + month;
    const d = start + month + week + day;
    return [
        { i: 0, v: m },
        { i: 1, v: m + (w - m) * 0.3 },
        { i: 2, v: m + (w - m) * 0.55 },
        { i: 3, v: w },
        { i: 4, v: w + (d - w) * 0.4 },
        { i: 5, v: w + (d - w) * 0.7 },
        { i: 6, v: d },
    ];
};

const AccIcon = ({ dir }) =>
    dir === 'up' ? <TrendingUp size={11} />
  : dir === 'down' ? <TrendingDown size={11} />
  : <Minus size={11} />;

const SectorTrendSparklines = ({ sectors }) => {
    const { theme } = useTheme();
    const top = rankSectors(sectors).slice(0, 6);
    if (top.length === 0) return null;

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <TrendingUp size={14} /> Sector Trend (last week)
                </SectionTitle>
            </SectionHeader>
            <Grid>
                {top.map((s) => {
                    const series = buildSeries(s);
                    const stroke = s.tone === 'bull' ? '#10b981' : s.tone === 'bear' ? '#ef4444' : '#f59e0b';
                    return (
                        <Card key={s.id} theme={theme} $tone={s.tone}>
                            <Top>
                                <NameBlock theme={theme}>
                                    <div className="sym">{s.symbol}</div>
                                    <div className="name">{s.name}</div>
                                </NameBlock>
                                <Acc theme={theme} $dir={s.momentum.dir}>
                                    <AccIcon dir={s.momentum.dir} />
                                    {s.momentum.dir === 'up' ? 'Accelerating'
                                   : s.momentum.dir === 'down' ? 'Slowing'
                                   : 'Steady'}
                                </Acc>
                            </Top>
                            <Spark>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={series}>
                                        <Line
                                            type="monotone"
                                            dataKey="v"
                                            stroke={stroke}
                                            strokeWidth={2}
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Spark>
                        </Card>
                    );
                })}
            </Grid>
        </SectionCard>
    );
};

export default SectorTrendSparklines;
