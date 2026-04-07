// client/src/pages/ShowdownPage.js
// Asset Showdown — decision-engine redesign of the comparison page.
// Replaces the legacy ComparisonPage. Picks a winner across 2-5 assets,
// shows AI verdicts per symbol, normalized performance chart, trend
// badges, and winner-highlighted comparison table.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Trophy, Skull, X as XIcon, Plus, ArrowUpRight, ArrowDownRight,
    Sparkles, RefreshCw, Bookmark, Copy, ChevronDown, ChevronUp,
    TrendingUp, TrendingDown, Activity, Search, BarChart3
} from 'lucide-react';
import SEO from '../components/SEO';
import Sparkline from '../components/Sparkline';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Color palette for asset lines (cycled)
const ASSET_COLORS = ['#00adef', '#a78bfa', '#10b981', '#f59e0b', '#ef4444'];

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
const fmtPrice = (p) => {
    if (p === null || p === undefined || isNaN(p)) return '--';
    if (Math.abs(p) >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (Math.abs(p) >= 1) return `$${p.toFixed(2)}`;
    if (Math.abs(p) >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(8)}`;
};
const fmtPct = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
};
const fmtBig = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
};
const fmtVol = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toLocaleString();
};

// Heuristic: is symbol a crypto ticker?
const COMMON_CRYPTO = new Set([
    'BTC','ETH','SOL','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK',
    'ATOM','UNI','LTC','NEAR','APT','BNB','SHIB','TRX','BCH','XLM'
]);
const guessIsCrypto = (sym) => COMMON_CRYPTO.has((sym || '').toUpperCase());

// ═══════════════════════════════════════════════════════════
// SCORING — pick the winner DIRECTIONALLY (best LONG vs best SHORT)
// ═══════════════════════════════════════════════════════════
function pickWinner(assets) {
    if (!assets || assets.length < 2) return { winner: null, avoid: null, ranked: [] };

    const scored = assets.map(a => {
        const perf = a.changePercent || 0;
        const aiScore = a.aiScore || 0; // 0 when no signal — don't fake a baseline
        const aiBias = a.aiBias; // 'long' | 'short' | null
        const trendStr = a.trendStrength || 0;
        const volSpike = a.volumeSpike || 1;

        // Determine the asset's BEST direction for trading
        let bestDirection;
        if (aiBias === 'long' || aiBias === 'short') {
            bestDirection = aiBias; // Trust the AI when present
        } else if (perf > 1 && trendStr > 0) {
            bestDirection = 'long';
        } else if (perf < -1 && trendStr < 0) {
            bestDirection = 'short';
        } else {
            bestDirection = perf >= 0 ? 'long' : 'short';
        }

        // Score the asset on its OWN best direction
        const dirPerf = bestDirection === 'long' ? perf : -perf;
        const dirTrend = bestDirection === 'long' ? trendStr : -trendStr;

        // AI score only contributes if the AI agrees with the chosen direction
        const aiContribution = aiBias === bestDirection ? aiScore : 0;

        const score =
            dirPerf * 2.0 +              // directional move (matters most)
            aiContribution * 0.9 +       // AI conviction (only if aligned)
            dirTrend * 0.8 +             // trend alignment
            (volSpike - 1) * 20;         // volume spike bonus

        return {
            ...a,
            _score: Math.round(score * 10) / 10,
            _bestDirection: bestDirection,
            _dirPerf: dirPerf
        };
    });

    const ranked = [...scored].sort((a, b) => b._score - a._score);
    const winner = ranked[0];

    // Avoid card: only show with 3+ assets where the worst is genuinely bad
    // AND its bias is opposite the winner (so it's a "fade this" candidate)
    let avoid = null;
    if (assets.length >= 3) {
        const worst = ranked[ranked.length - 1];
        if (worst && worst._score < 5 && worst._bestDirection !== winner._bestDirection) {
            avoid = worst;
        }
    }

    return { winner, avoid, ranked };
}

// Count how many table cells each asset wins (for the summary tally)
function countTableWins(assets) {
    if (!assets || assets.length < 2) return {};
    const counts = {};
    assets.forEach(a => { counts[a.symbol] = 0; });

    const max = (key) => {
        const valid = assets.filter(a => a[key] !== null && a[key] !== undefined && !isNaN(a[key]));
        if (!valid.length) return null;
        return valid.reduce((m, a) => (a[key] > m[key] ? a : m));
    };
    const min = (key) => {
        const valid = assets.filter(a => a[key] !== null && a[key] !== undefined && !isNaN(a[key]) && a[key] > 0);
        if (!valid.length) return null;
        return valid.reduce((m, a) => (a[key] < m[key] ? a : m));
    };

    const incrementWinner = (winner) => { if (winner) counts[winner.symbol] = (counts[winner.symbol] || 0) + 1; };

    incrementWinner(max('changePercent'));
    incrementWinner(max('volume'));
    incrementWinner(max('marketCap'));
    incrementWinner(max('aiScore'));
    incrementWinner(min('pe'));
    return counts;
}

// Trend / momentum / volatility classification from existing data
function classifyTrendMomentum(asset, series) {
    if (!series || series.length < 5) {
        return { trend: 'unknown', momentum: 'unknown', volatility: 'unknown' };
    }
    const closes = series.map(p => p.price);
    const first = closes[0];
    const last = closes[closes.length - 1];
    const pct = ((last - first) / first) * 100;

    // Trend
    let trend;
    if (pct > 3) trend = 'bullish';
    else if (pct < -3) trend = 'bearish';
    else trend = 'sideways';

    // Momentum: compare last 1/3 vs middle 1/3
    const third = Math.floor(closes.length / 3);
    const recent = closes.slice(-third);
    const middle = closes.slice(-third * 2, -third);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const middleAvg = middle.reduce((a, b) => a + b, 0) / middle.length || recentAvg;
    const momentumPct = ((recentAvg - middleAvg) / middleAvg) * 100;

    let momentum;
    if (momentumPct > 1.5) momentum = 'rising';
    else if (momentumPct < -1.5) momentum = 'falling';
    else momentum = 'steady';

    // Volatility: stddev of daily % changes
    const daily = [];
    for (let i = 1; i < closes.length; i++) {
        daily.push(Math.abs((closes[i] - closes[i - 1]) / closes[i - 1]) * 100);
    }
    const avgDaily = daily.reduce((a, b) => a + b, 0) / daily.length || 0;
    let volatility;
    if (avgDaily > 3) volatility = 'high';
    else if (avgDaily > 1.2) volatility = 'medium';
    else volatility = 'low';

    return { trend, momentum, volatility, trendStrength: pct };
}

// Build a normalized performance series for the chart
function normalizeSeries(seriesMap) {
    // seriesMap: { SYM: [{date, price}, ...] }
    const symbols = Object.keys(seriesMap);
    if (symbols.length === 0) return [];

    // Find the longest series and use its dates as the X axis
    const longest = symbols
        .map(s => seriesMap[s] || [])
        .reduce((longest, cur) => (cur.length > longest.length ? cur : longest), []);

    return longest.map((point, i) => {
        const row = { date: point.date };
        symbols.forEach(sym => {
            const series = seriesMap[sym] || [];
            const p = series[i];
            if (!p) return;
            const base = series[0]?.price;
            if (!base) return;
            row[sym] = ((p.price - base) / base) * 100;
        });
        return row;
    });
}

// Generate one-line "why" for the verdict winner — bias-aware + honest
function buildWinnerWhy(winner) {
    if (!winner) return '';
    const dir = winner._bestDirection;
    const perf = winner.changePercent || 0;
    const ai = winner.aiScore;
    const aiBias = winner.aiBias;
    const trendStr = winner.trendStrength || 0;

    // Pick the dominant reason
    if (aiBias === dir && ai >= 70) {
        return `Highest AI conviction in the group (${ai}/100, ${dir.toUpperCase()} bias). Trade with the AI's call.`;
    }
    if (Math.abs(perf) >= 5) {
        return dir === 'long'
            ? `Strongest momentum in the group — up ${perf.toFixed(2)}% with ${trendStr > 3 ? 'a clear bullish trend' : 'building strength'}.`
            : `Sharpest decline in the group — down ${Math.abs(perf).toFixed(2)}%. Best short candidate.`;
    }
    if (Math.abs(perf) >= 1) {
        return dir === 'long'
            ? `Slight edge — ${perf >= 0 ? '+' : ''}${perf.toFixed(2)}% with ${trendStr > 0 ? 'bullish trend' : 'mixed signals'}.`
            : `Mildly underperforming peers — best short setup, but conviction is moderate.`;
    }
    if (ai && ai >= 65) {
        return `Marginal price lead, but AI conviction (${ai}/100) makes this the strongest setup.`;
    }
    return `Slim margin — wait for clearer confirmation before committing size.`;
}
function buildAvoidWhy(avoid) {
    if (!avoid) return '';
    if (avoid.changePercent < -5) return 'Sharp decline with weak structure — best fade candidate in the group.';
    if ((avoid.trendStrength || 0) < -2) return 'Trend rolling over with weak momentum.';
    return 'Underperforming peers across multiple metrics — consider as a short setup.';
}
function buildSummary(ranked, winsByCount) {
    if (!ranked || ranked.length < 2) return '';
    const top = ranked[0];
    const symbols = ranked.map(a => a.symbol);

    // Find who wins the most table cells
    const sortedByWins = symbols
        .map(s => ({ s, w: winsByCount[s] || 0 }))
        .sort((a, b) => b.w - a.w);
    const cellLeader = sortedByWins[0];

    const cellLeaderWins = cellLeader.w;
    const totalCells = Object.values(winsByCount).reduce((a, b) => a + b, 0);

    if (top.symbol === cellLeader.s && cellLeaderWins > 0) {
        return `${top.symbol} is the strongest ${top._bestDirection.toUpperCase()} setup and wins ${cellLeaderWins} of ${totalCells} comparison metrics.`;
    }

    if (cellLeaderWins > 0 && cellLeader.s !== top.symbol) {
        return `${top.symbol} edges out on directional setup (${top._bestDirection.toUpperCase()}), while ${cellLeader.s} wins more raw metrics (${cellLeaderWins}/${totalCells}).`;
    }

    return `${top.symbol} leads as the strongest ${top._bestDirection.toUpperCase()} setup in the group.`;
}

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulseDot = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

// ═══════════════════════════════════════════════════════════
// STYLED — themed throughout
// ═══════════════════════════════════════════════════════════
const Page = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    padding-bottom: 4rem;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
`;
const Container = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    @media(max-width:768px){padding:1rem;}
`;

// ─── Header ──────────────────────────────────────────────
const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    ${css`animation: ${fadeIn} .4s ease-out;`}
`;
const HeaderLeft = styled.div`flex:1;min-width:280px;`;
const H1 = styled.h1`
    font-size: 2.4rem;
    font-weight: 900;
    margin: 0 0 .35rem;
    background: ${p => p.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef, #a78bfa)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-flex;
    align-items: center;
    gap: .6rem;
`;
const Subhead = styled.p`
    font-size: .9rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    margin: 0;
    max-width: 640px;
    line-height: 1.5;
`;
const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    padding: .55rem .9rem;
    border-radius: 999px;
    background: rgba(0, 173, 237, .06);
    border: 1px solid rgba(0, 173, 237, .25);
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .75rem;
    font-weight: 600;
    white-space: nowrap;
`;
const StatusDot = styled.span`
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, .6);
    ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
`;

// ─── Picker ───────────────────────────────────────────────
const PickerCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem 1.15rem;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
`;
const PickerLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .65rem;
`;
const ChipRow = styled.div`
    display: flex;
    gap: .45rem;
    flex-wrap: wrap;
    align-items: center;
`;
const Chip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    padding: .4rem .55rem .4rem .8rem;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.04)'};
    border: 1px solid ${p => (p.$color || '#00adef') + '50'};
    border-radius: 8px;
    font-size: .8rem;
    font-weight: 800;
    color: ${p => p.$color || '#e0e6ed'};
`;
const ChipDot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.$c || '#00adef'};
`;
const ChipRemove = styled.button`
    background: transparent;
    border: none;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 4px;
    &:hover {
        color: #ef4444;
        background: rgba(239,68,68,.1);
    }
`;
const AddRow = styled.div`
    display: flex;
    gap: .4rem;
    align-items: center;
    margin-top: .65rem;
`;
const AddInput = styled.input`
    flex: 1;
    min-width: 140px;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.03)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    border-radius: 8px;
    padding: .5rem .8rem;
    font-size: .82rem;
    font-weight: 600;
    outline: none;
    &:focus { border-color: ${p => p.theme?.brand?.primary || '#00adef'}; }
    &::placeholder { color: ${p => p.theme?.text?.tertiary || '#64748b'}; }
`;
const AddBtn = styled.button`
    padding: .5rem .9rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 8px;
    font-size: .75rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .3rem;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '25'}; }
    &:disabled { opacity: .55; cursor: not-allowed; }
`;
const TypeToggle = styled.div`
    display: flex;
    gap: .25rem;
    padding: .15rem;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.03)'};
    border-radius: 7px;
`;
const TypeBtn = styled.button`
    padding: .35rem .65rem;
    border-radius: 5px;
    background: ${p => p.$active ? (p.theme?.brand?.primary || '#00adef') + '20' : 'transparent'};
    border: none;
    color: ${p => p.$active ? (p.theme?.brand?.primary || '#00adef') : (p.theme?.text?.tertiary || '#64748b')};
    font-size: .65rem;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
`;

// ─── Verdict Banner ───────────────────────────────────────
const VerdictWrap = styled.div`
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards;`}
`;
const VerdictGrid = styled.div`
    display: grid;
    grid-template-columns: ${p => p.$hasAvoid ? '1fr 1fr' : '1fr'};
    gap: .85rem;
    @media(max-width:768px){ grid-template-columns:1fr; }
`;
const VerdictCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$variant === 'winner'
        ? 'rgba(16,185,129,.3)'
        : 'rgba(239,68,68,.3)'};
    border-radius: 16px;
    padding: 1.5rem 1.75rem;
    position: relative;
    overflow: hidden;
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: ${p => p.$variant === 'winner'
            ? 'linear-gradient(90deg, transparent, #10b981, transparent)'
            : 'linear-gradient(90deg, transparent, #ef4444, transparent)'};
    }
`;
const VerdictLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.$variant === 'winner' ? '#10b981' : '#ef4444'};
    font-weight: 800;
    margin-bottom: .55rem;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const VerdictHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: .4rem;
    flex-wrap: wrap;
`;
const VerdictSym = styled.div`
    font-size: 1.85rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const VerdictMetrics = styled.div`
    display: flex;
    gap: 1.25rem;
    align-items: baseline;
`;
const VerdictMetric = styled.div`
    text-align: right;
`;
const VerdictMetricVal = styled.div`
    font-size: 1.15rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    line-height: 1;
`;
const VerdictMetricLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-top: .15rem;
`;
const VerdictWhy = styled.div`
    font-size: .85rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.5;
    margin: .65rem 0 1rem;
`;
const VerdictCTA = styled.button`
    padding: .65rem 1.25rem;
    background: linear-gradient(135deg,
        ${p => p.$variant === 'winner' ? '#10b981' : '#ef4444'},
        ${p => p.$variant === 'winner' ? '#059669' : '#dc2626'});
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: .82rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    transition: all .2s;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px ${p => p.$variant === 'winner' ? 'rgba(16,185,129,.35)' : 'rgba(239,68,68,.35)'};
    }
`;

// ─── AI Verdict Grid ──────────────────────────────────────
const SectionTitle = styled.h2`
    font-size: .95rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin: 0 0 .3rem;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const SectionSub = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-bottom: .85rem;
`;
const VerdictGridWrap = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: .75rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
`;
const AiCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long' ? 'rgba(16,185,129,.25)'
        : p.$bias === 'short' ? 'rgba(239,68,68,.25)'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    border-radius: 14px;
    padding: 1rem 1.1rem;
    cursor: pointer;
    transition: all .2s;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px ${p => p.$bias === 'long' ? 'rgba(16,185,129,.18)'
            : p.$bias === 'short' ? 'rgba(239,68,68,.18)'
            : 'rgba(0,173,237,.18)'};
    }
`;
const AiTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const AiSym = styled.div`
    font-size: 1.05rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const AiBias = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    padding: .2rem .5rem;
    border-radius: 5px;
    font-size: .58rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.12)'
        : p.$short ? 'rgba(239,68,68,.12)'
        : 'rgba(100,116,139,.12)'};
    color: ${p => p.$long ? '#10b981' : p.$short ? '#ef4444' : '#94a3b8'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.25)'
        : p.$short ? 'rgba(239,68,68,.25)'
        : 'rgba(100,116,139,.25)'};
`;
const AiScoreLine = styled.div`
    font-size: .65rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .55rem;
`;
const AiScoreNum = styled.span`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    margin-left: .35rem;
`;
const AiWhy = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .65rem;
    min-height: 2.6em;
`;
const AiActions = styled.div`
    display: flex;
    gap: .35rem;
`;
const AiTradeBtn = styled.button`
    flex: 1;
    padding: .45rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '35'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 7px;
    font-size: .68rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .25rem;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '25'}; }
`;
const IconBtn = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.04)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.06)'};
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s;
    &:hover {
        color: ${p => p.theme?.brand?.primary || '#00adef'};
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
    }
`;

// ─── Chart ────────────────────────────────────────────────
const ChartCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
`;
const ChartHeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: .85rem;
    flex-wrap: wrap;
    gap: .5rem;
`;
const ChartTitle = styled.div`
    font-size: .85rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const ChartControls = styled.div`
    display: flex;
    gap: .5rem;
    flex-wrap: wrap;
`;
const ChartChip = styled.button`
    padding: .35rem .7rem;
    background: ${p => p.$active ? (p.theme?.brand?.primary || '#00adef') + '20' : 'transparent'};
    border: 1px solid ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '60'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    color: ${p => p.$active ? (p.theme?.brand?.primary || '#00adef') : (p.theme?.text?.secondary || '#94a3b8')};
    border-radius: 7px;
    font-size: .65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .3px;
    cursor: pointer;
    &:hover { color: ${p => p.theme?.text?.primary || '#e0e6ed'}; }
`;
const ChartHeight = styled.div`
    width: 100%;
    height: 320px;
`;

// ─── Trend + Momentum row ─────────────────────────────────
const TrendStrip = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: .55rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .25s backwards;`}
`;
const TrendCol = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: .8rem 1rem;
`;
const TrendSym = styled.div`
    font-size: .85rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .55rem;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const TrendBadgeRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: .35rem;
`;
const TrendBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    font-size: .68rem;
    font-weight: 700;
    color: ${p => p.$c || '#94a3b8'};
`;
const TBLabel = styled.span`
    font-size: .52rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    width: 65px;
`;
const TBValue = styled.span`
    padding: .15rem .45rem;
    border-radius: 4px;
    background: ${p => (p.$c || '#94a3b8') + '15'};
    border: 1px solid ${p => (p.$c || '#94a3b8') + '35'};
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .3px;
    font-size: .58rem;
`;

// ─── Comparison table ─────────────────────────────────────
const TableWrap = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .3s backwards;`}
`;
const TableToggle = styled.button`
    width: 100%;
    padding: .85rem 1.1rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .82rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:hover { background: rgba(255,255,255,.02); }
`;
const TableScroll = styled.div`
    overflow-x: auto;
`;
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: .8rem;
    min-width: 480px;
`;
const Th = styled.th`
    text-align: left;
    padding: .65rem .9rem;
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    font-weight: 800;
    color: ${p => p.theme?.text?.tertiary || '#475569'};
    background: rgba(255,255,255,.015);
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    white-space: nowrap;
`;
const Td = styled.td`
    padding: .7rem .9rem;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    vertical-align: middle;
    font-weight: 600;
    ${p => p.$winner && css`
        background: rgba(16,185,129,.06);
        color: #10b981;
        font-weight: 900;
        position: relative;
        &::before {
            content: '⭐';
            margin-right: .3rem;
        }
    `}
`;
const MetricCol = styled.td`
    padding: .7rem .9rem;
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    font-weight: 800;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    background: rgba(255,255,255,.02);
`;

// ─── Bridge / Empty / Loading ─────────────────────────────
const Bridge = styled.div`
    margin-top: 1rem;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, .08), rgba(167, 139, 250, .08));
    border: 1px solid rgba(0, 173, 237, .2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
`;
const BridgeText = styled.div`
    font-size: .85rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-weight: 600;
    max-width: 520px;
`;
const BridgeBtn = styled.button`
    padding: .7rem 1.4rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: .82rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    transition: all .2s;
    white-space: nowrap;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    }
`;
const Empty = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 14px;
    padding: 3rem 1.5rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
    margin-bottom: 1.5rem;
`;
const LoadingWrap = styled.div`
    padding: 3rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
`;

// ═══════════════════════════════════════════════════════════
// TREND/MOMENTUM/VOL META
// ═══════════════════════════════════════════════════════════
const TREND_META = {
    bullish:  { label: 'Bullish',  color: '#10b981' },
    bearish:  { label: 'Bearish',  color: '#ef4444' },
    sideways: { label: 'Sideways', color: '#f59e0b' },
    unknown:  { label: '--',       color: '#64748b' }
};
const MOMENTUM_META = {
    rising:  { label: 'Rising',  color: '#10b981' },
    falling: { label: 'Falling', color: '#ef4444' },
    steady:  { label: 'Steady',  color: '#f59e0b' },
    unknown: { label: '--',      color: '#64748b' }
};
const VOL_META = {
    high:    { label: 'High',   color: '#ef4444' },
    medium:  { label: 'Medium', color: '#f59e0b' },
    low:     { label: 'Low',    color: '#10b981' },
    unknown: { label: '--',     color: '#64748b' }
};

const DEFAULT_SYMBOLS = ['NVDA', 'AMD'];

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const ShowdownPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();

    const [assets, setAssets] = useState([]); // each: { symbol, type, ...quote, ...opp, series, trend, momentum, volatility, color }
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('stock');
    const [chartView, setChartView] = useState('performance'); // 'performance' | 'price' | 'volume'
    const [timeframe, setTimeframe] = useState('1M');
    const [tableExpanded, setTableExpanded] = useState(false);

    // Fetch quote + opportunity + chart data for one symbol
    const fetchAsset = useCallback(async (symbol, type) => {
        const sym = symbol.toUpperCase();
        const isCrypto = type === 'crypto' || guessIsCrypto(sym);
        const actualType = isCrypto ? 'crypto' : 'stock';

        const fetcher = (path, opts) => api
            ? api.get(path, opts).then(r => r.data)
            : fetch(`${API_URL}${path}`).then(r => r.json());

        try {
            // Quote
            const quotePath = isCrypto ? `/crypto/quote/${sym}` : `/stocks/quote/${sym}`;
            const quote = await fetcher(quotePath).catch(() => null);
            if (!quote) return null;

            // Opportunity (best-effort)
            const opp = await fetcher(`/opportunities/by-symbol/${sym}`).catch(() => null);

            // Pull RSI from any of the possible nesting shapes
            const oppData = opp?.opportunity;
            const indicators = oppData?.indicators || {};
            const rsiRaw = indicators.RSI ?? indicators.rsi ?? null;
            let rsiValue = null;
            if (rsiRaw !== null && rsiRaw !== undefined) {
                rsiValue = typeof rsiRaw === 'object' ? rsiRaw.value : rsiRaw;
                if (typeof rsiValue === 'string') rsiValue = parseFloat(rsiValue);
                if (typeof rsiValue !== 'number' || isNaN(rsiValue)) rsiValue = null;
            }

            // Chart historical
            const histPath = isCrypto
                ? `/crypto/historical/${sym}`
                : `/stocks/historical/${sym}`;
            const histRes = await fetcher(histPath, { params: { range: timeframe } }).catch(() => null);
            const series = (histRes?.historicalData || []).map(d => ({
                date: d.date || d.time,
                price: d.close || d.price,
                volume: d.volume || 0
            }));

            const tm = classifyTrendMomentum({ symbol: sym }, series);

            return {
                symbol: sym,
                type: actualType,
                isCrypto,
                name: quote.name || sym,
                price: quote.price || 0,
                changePercent: quote.changePercent || quote.changePercent24h || 0,
                marketCap: quote.marketCap || 0,
                volume: quote.volume || quote.volume24h || 0,
                week52High: quote.high52 || quote.ath || null,
                week52Low: quote.low52 || quote.atl || null,
                pe: quote.pe || null,
                eps: quote.eps || null,
                rsi: rsiValue,
                aiScore: oppData?.aiScore ?? null,
                aiBias: oppData?.bias ?? null,
                aiConfidence: oppData?.confidence ?? null,
                aiSetupLabel: oppData?.setupLabel ?? null,
                aiWhy: oppData?.whySurfaced ?? null,
                signalId: oppData?.id || oppData?.signalId || null,
                hasLiveSignal: !!oppData,
                volumeSpike: 1,
                series,
                ...tm
            };
        } catch {
            return null;
        }
    }, [api, timeframe]);

    // Reload all assets when timeframe changes
    const reloadAll = useCallback(async (symList) => {
        if (!symList || symList.length === 0) {
            setAssets([]);
            return;
        }
        setLoading(true);
        const fetched = await Promise.all(
            symList.map(item => fetchAsset(item.symbol, item.type))
        );
        const valid = fetched.filter(Boolean).map((a, i) => ({
            ...a,
            color: ASSET_COLORS[i % ASSET_COLORS.length]
        }));
        setAssets(valid);
        setLoading(false);
    }, [fetchAsset]);

    // Initial load with defaults
    useEffect(() => {
        reloadAll(DEFAULT_SYMBOLS.map(s => ({ symbol: s, type: 'stock' })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload when timeframe changes
    useEffect(() => {
        if (assets.length > 0) {
            reloadAll(assets.map(a => ({ symbol: a.symbol, type: a.type })));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeframe]);

    const handleAdd = async () => {
        const sym = searchQuery.trim().toUpperCase();
        if (!sym) return;
        if (assets.some(a => a.symbol === sym)) {
            setSearchQuery('');
            return;
        }
        if (assets.length >= 5) return;
        setSearchQuery('');
        setLoading(true);
        const newAsset = await fetchAsset(sym, searchType);
        if (newAsset) {
            setAssets(prev => [
                ...prev,
                { ...newAsset, color: ASSET_COLORS[prev.length % ASSET_COLORS.length] }
            ]);
        }
        setLoading(false);
    };

    const handleRemove = (sym) => {
        setAssets(prev => prev.filter(a => a.symbol !== sym).map((a, i) => ({
            ...a,
            color: ASSET_COLORS[i % ASSET_COLORS.length]
        })));
    };

    const goToTrade = (a) => {
        if (a.signalId) navigate(`/signal/${a.signalId}`);
        else navigate(a.isCrypto ? `/crypto/${a.symbol}` : `/stock/${a.symbol}`);
    };

    // ───── Computed ─────
    const verdict = useMemo(() => pickWinner(assets), [assets]);
    const tableWins = useMemo(() => countTableWins(assets), [assets]);

    // Per-row "winner" detection for table
    const winnerMap = useMemo(() => {
        if (assets.length < 2) return {};
        const cols = ['changePercent', 'volume', 'marketCap', 'aiScore'];
        const map = {};
        cols.forEach(col => {
            const sorted = [...assets].filter(a => a[col] !== null && a[col] !== undefined && !isNaN(a[col]))
                .sort((a, b) => b[col] - a[col]);
            if (sorted.length > 0) map[col] = sorted[0].symbol;
        });
        // RSI: closest to healthy zone (45-60)
        const rsiAssets = assets.filter(a => a.rsi !== null && a.rsi !== undefined);
        if (rsiAssets.length > 0) {
            const sorted = rsiAssets.sort((a, b) => {
                const da = Math.abs(a.rsi - 52.5);
                const db = Math.abs(b.rsi - 52.5);
                return da - db;
            });
            map.rsi = sorted[0].symbol;
        }
        // Lowest is best for PE
        const peAssets = assets.filter(a => a.pe && a.pe > 0);
        if (peAssets.length > 0) {
            const sorted = peAssets.sort((a, b) => a.pe - b.pe);
            map.pe = sorted[0].symbol;
        }
        return map;
    }, [assets]);

    const chartData = useMemo(() => {
        if (assets.length === 0) return [];
        if (chartView === 'performance') {
            const seriesMap = {};
            assets.forEach(a => { seriesMap[a.symbol] = a.series; });
            return normalizeSeries(seriesMap);
        }
        if (chartView === 'price') {
            // Use the longest series as the X axis
            const longest = assets.reduce((longest, a) =>
                (a.series.length > longest.length ? a.series : longest), []);
            return longest.map((point, i) => {
                const row = { date: point.date };
                assets.forEach(a => { row[a.symbol] = a.series[i]?.price; });
                return row;
            });
        }
        // Volume
        const longest = assets.reduce((longest, a) =>
            (a.series.length > longest.length ? a.series : longest), []);
        return longest.map((point, i) => {
            const row = { date: point.date };
            assets.forEach(a => { row[a.symbol] = a.series[i]?.volume; });
            return row;
        });
    }, [assets, chartView]);

    const summary = useMemo(() => buildSummary(verdict.ranked, tableWins), [verdict, tableWins]);

    return (
        <Page theme={theme}>
            <SEO
                title="Asset Showdown — Nexus Signal AI"
                description="Compare 2-5 assets head to head. Nexus picks the winner, explains why, and connects it to a trade setup."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Trophy size={28} color={theme?.brand?.primary || '#00adef'} />
                            Asset Showdown
                        </H1>
                        <Subhead theme={theme}>
                            Which of these is the best trade right now? Pick 2-5 assets — the Engine declares a winner.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        {assets.length} {assets.length === 1 ? 'asset' : 'assets'} in showdown
                    </StatusPill>
                </HeaderRow>

                {/* ═══ PICKER ═══ */}
                <PickerCard theme={theme}>
                    <PickerLabel theme={theme}>Assets in this Showdown</PickerLabel>
                    <ChipRow>
                        {assets.map(a => (
                            <Chip key={a.symbol} theme={theme} $color={a.color}>
                                <ChipDot $c={a.color} />
                                {a.symbol}
                                <ChipRemove theme={theme} onClick={() => handleRemove(a.symbol)} aria-label="Remove">
                                    <XIcon size={11} />
                                </ChipRemove>
                            </Chip>
                        ))}
                        {assets.length === 0 && (
                            <span style={{ fontSize: '.72rem', color: theme?.text?.tertiary || '#64748b' }}>
                                No assets selected
                            </span>
                        )}
                    </ChipRow>
                    <AddRow>
                        <TypeToggle theme={theme}>
                            <TypeBtn theme={theme} $active={searchType === 'stock'} onClick={() => setSearchType('stock')}>
                                Stock
                            </TypeBtn>
                            <TypeBtn theme={theme} $active={searchType === 'crypto'} onClick={() => setSearchType('crypto')}>
                                Crypto
                            </TypeBtn>
                        </TypeToggle>
                        <AddInput
                            theme={theme}
                            placeholder="Add a ticker (e.g., NVDA, BTC)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                            disabled={loading || assets.length >= 5}
                        />
                        <AddBtn
                            theme={theme}
                            onClick={handleAdd}
                            disabled={loading || !searchQuery.trim() || assets.length >= 5}
                        >
                            <Plus size={13} /> Add
                        </AddBtn>
                    </AddRow>
                    {assets.length >= 5 && (
                        <div style={{ fontSize: '.62rem', color: theme?.text?.tertiary || '#64748b', marginTop: '.5rem' }}>
                            Maximum 5 assets in a showdown. Remove one to add another.
                        </div>
                    )}
                </PickerCard>

                {/* ═══ EMPTY STATE ═══ */}
                {assets.length === 0 && !loading && (
                    <Empty theme={theme}>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed', fontSize: '.95rem' }}>
                            Pick at least 2 assets to start the showdown
                        </strong><br />
                        The Engine will tell you which is the best trade right now.
                    </Empty>
                )}

                {/* ═══ LOADING ═══ */}
                {loading && assets.length === 0 && (
                    <LoadingWrap theme={theme}>Loading showdown...</LoadingWrap>
                )}

                {/* ═══ VERDICT BANNER ═══ */}
                {verdict.winner && assets.length >= 2 && (
                    <VerdictWrap>
                        <VerdictGrid $hasAvoid={!!verdict.avoid}>
                            <VerdictCard theme={theme} $variant={verdict.winner._bestDirection === 'short' ? 'avoid' : 'winner'}>
                                <VerdictLabel $variant="winner">
                                    <Trophy size={11} /> STRONGEST SETUP — {(verdict.winner._bestDirection || 'long').toUpperCase()}
                                </VerdictLabel>
                                <VerdictHead>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', flexWrap: 'wrap' }}>
                                        <VerdictSym theme={theme}>{verdict.winner.symbol}</VerdictSym>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '.25rem',
                                            padding: '.3rem .7rem',
                                            borderRadius: '7px',
                                            fontSize: '.72rem',
                                            fontWeight: 800,
                                            background: verdict.winner._bestDirection === 'long'
                                                ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
                                            color: verdict.winner._bestDirection === 'long' ? '#10b981' : '#ef4444',
                                            border: `1px solid ${verdict.winner._bestDirection === 'long' ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`
                                        }}>
                                            {verdict.winner._bestDirection === 'long'
                                                ? <ArrowUpRight size={12} />
                                                : <ArrowDownRight size={12} />}
                                            {verdict.winner._bestDirection === 'long' ? 'LONG' : 'SHORT'}
                                        </span>
                                    </div>
                                    <VerdictMetrics>
                                        <VerdictMetric>
                                            <VerdictMetricVal $c={verdict.winner.changePercent >= 0 ? '#10b981' : '#ef4444'}>
                                                {fmtPct(verdict.winner.changePercent)}
                                            </VerdictMetricVal>
                                            <VerdictMetricLabel theme={theme}>Change</VerdictMetricLabel>
                                        </VerdictMetric>
                                        {verdict.winner.aiScore !== null && verdict.winner.aiScore !== undefined && (
                                            <VerdictMetric>
                                                <VerdictMetricVal $c={verdict.winner.aiScore >= 80 ? '#10b981' : verdict.winner.aiScore >= 65 ? '#f59e0b' : '#94a3b8'}>
                                                    {verdict.winner.aiScore}
                                                </VerdictMetricVal>
                                                <VerdictMetricLabel theme={theme}>AI Score</VerdictMetricLabel>
                                            </VerdictMetric>
                                        )}
                                        <VerdictMetric>
                                            <VerdictMetricVal $c={theme?.brand?.primary || '#00adef'}>
                                                {tableWins[verdict.winner.symbol] || 0}/{Object.values(tableWins).reduce((a, b) => a + b, 0) || 5}
                                            </VerdictMetricVal>
                                            <VerdictMetricLabel theme={theme}>Metrics Won</VerdictMetricLabel>
                                        </VerdictMetric>
                                    </VerdictMetrics>
                                </VerdictHead>
                                <VerdictWhy theme={theme}>{buildWinnerWhy(verdict.winner)}</VerdictWhy>
                                <VerdictCTA
                                    $variant={verdict.winner._bestDirection === 'short' ? 'avoid' : 'winner'}
                                    onClick={() => goToTrade(verdict.winner)}
                                >
                                    {verdict.winner.hasLiveSignal
                                        ? `View ${(verdict.winner._bestDirection || 'long').toUpperCase()} Setup`
                                        : 'Run Analysis'} →
                                </VerdictCTA>
                            </VerdictCard>

                            {verdict.avoid && (
                                <VerdictCard theme={theme} $variant="avoid">
                                    <VerdictLabel $variant="avoid"><Skull size={11} /> AVOID</VerdictLabel>
                                    <VerdictHead>
                                        <VerdictSym theme={theme}>{verdict.avoid.symbol}</VerdictSym>
                                        <VerdictMetrics>
                                            <VerdictMetric>
                                                <VerdictMetricVal $c="#ef4444">{fmtPct(verdict.avoid.changePercent)}</VerdictMetricVal>
                                                <VerdictMetricLabel theme={theme}>Change</VerdictMetricLabel>
                                            </VerdictMetric>
                                            {verdict.avoid.aiScore !== null && verdict.avoid.aiScore !== undefined && (
                                                <VerdictMetric>
                                                    <VerdictMetricVal $c="#ef4444">{verdict.avoid.aiScore}</VerdictMetricVal>
                                                    <VerdictMetricLabel theme={theme}>AI Score</VerdictMetricLabel>
                                                </VerdictMetric>
                                            )}
                                        </VerdictMetrics>
                                    </VerdictHead>
                                    <VerdictWhy theme={theme}>{buildAvoidWhy(verdict.avoid)}</VerdictWhy>
                                    <VerdictCTA $variant="avoid" onClick={() => goToTrade(verdict.avoid)}>
                                        Consider Short Setup →
                                    </VerdictCTA>
                                </VerdictCard>
                            )}
                        </VerdictGrid>
                        {summary && (
                            <div style={{
                                marginTop: '.85rem',
                                padding: '.7rem 1.1rem',
                                background: 'rgba(167,139,250,.05)',
                                border: '1px solid rgba(167,139,250,.18)',
                                borderRadius: '10px',
                                fontSize: '.78rem',
                                color: theme?.text?.secondary || '#c8d0da',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '.5rem',
                                flexWrap: 'wrap'
                            }}>
                                <span>📊</span>
                                <span style={{ flex: 1 }}>{summary}</span>
                            </div>
                        )}
                    </VerdictWrap>
                )}

                {/* ═══ AI VERDICT GRID ═══ */}
                {assets.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Sparkles size={15} color={theme?.brand?.primary || '#00adef'} />
                            AI Verdict per Asset
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Bias, confidence, and one-line rationale from the Opportunity Engine
                        </SectionSub>
                        <VerdictGridWrap>
                            {assets.map(a => {
                                const long = a.aiBias === 'long';
                                const short = a.aiBias === 'short';
                                return (
                                    <AiCard
                                        key={a.symbol}
                                        theme={theme}
                                        $bias={a.aiBias}
                                        onClick={() => goToTrade(a)}
                                    >
                                        <AiTop>
                                            <AiSym theme={theme}>{a.symbol}</AiSym>
                                            {a.aiBias ? (
                                                <AiBias $long={long} $short={short}>
                                                    {long ? <ArrowUpRight size={10} /> : short ? <ArrowDownRight size={10} /> : null}
                                                    {(a.aiBias || 'NEUTRAL').toUpperCase()}
                                                </AiBias>
                                            ) : (
                                                <AiBias>NO SIGNAL</AiBias>
                                            )}
                                        </AiTop>
                                        <AiScoreLine theme={theme}>
                                            {a.aiSetupLabel || `${TREND_META[a.trend]?.label || 'Trend'} · ${MOMENTUM_META[a.momentum]?.label || 'Momentum'}`}
                                            {a.aiScore !== null && a.aiScore !== undefined && (
                                                <AiScoreNum $v={a.aiScore}>· AI {a.aiScore}</AiScoreNum>
                                            )}
                                        </AiScoreLine>
                                        <AiWhy theme={theme}>
                                            {a.aiWhy
                                                ? a.aiWhy
                                                : a.changePercent >= 1
                                                ? `Up ${fmtPct(a.changePercent)} on the period with ${TREND_META[a.trend]?.label?.toLowerCase() || 'mixed'} trend. No active AI setup — run analysis to scan.`
                                                : a.changePercent <= -1
                                                ? `Down ${fmtPct(a.changePercent)} on the period. No active AI setup — watch for stabilization or short opportunities.`
                                                : `Flat over the period. No active AI setup — wait for clearer direction.`}
                                        </AiWhy>
                                        <AiActions onClick={(e) => e.stopPropagation()}>
                                            <AiTradeBtn theme={theme} onClick={() => goToTrade(a)}>
                                                {a.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} →
                                            </AiTradeBtn>
                                            <IconBtn theme={theme} title="Watchlist"><Bookmark size={13} /></IconBtn>
                                            <IconBtn theme={theme} title="Paper trade"><Copy size={13} /></IconBtn>
                                        </AiActions>
                                    </AiCard>
                                );
                            })}
                        </VerdictGridWrap>
                    </>
                )}

                {/* ═══ CHART ═══ */}
                {assets.length > 0 && chartData.length > 0 && (
                    <ChartCard theme={theme}>
                        <ChartHeaderRow>
                            <ChartTitle theme={theme}>
                                <BarChart3 size={14} color={theme?.brand?.primary || '#00adef'} />
                                {chartView === 'performance' ? '% Performance Comparison'
                                    : chartView === 'price' ? 'Price Comparison'
                                    : 'Volume Comparison'}
                            </ChartTitle>
                            <ChartControls>
                                <ChartChip theme={theme} $active={chartView === 'performance'} onClick={() => setChartView('performance')}>
                                    % Performance
                                </ChartChip>
                                <ChartChip theme={theme} $active={chartView === 'price'} onClick={() => setChartView('price')}>
                                    Price
                                </ChartChip>
                                <ChartChip theme={theme} $active={chartView === 'volume'} onClick={() => setChartView('volume')}>
                                    Volume
                                </ChartChip>
                                <span style={{ width: 1, background: 'rgba(255,255,255,.06)' }} />
                                {['1W', '1M', '3M', '1Y'].map(tf => (
                                    <ChartChip key={tf} theme={theme} $active={timeframe === tf} onClick={() => setTimeframe(tf)}>
                                        {tf}
                                    </ChartChip>
                                ))}
                            </ChartControls>
                        </ChartHeaderRow>
                        <ChartHeight>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#475569"
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        tickFormatter={(v) => chartView === 'performance'
                                            ? `${v >= 0 ? '+' : ''}${Number(v).toFixed(0)}%`
                                            : chartView === 'price'
                                            ? fmtPrice(v)
                                            : fmtVol(v)}
                                        width={70}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#0f1729',
                                            border: '1px solid rgba(255,255,255,.12)',
                                            borderRadius: '8px',
                                            fontSize: '.78rem'
                                        }}
                                        formatter={(v) => chartView === 'performance'
                                            ? `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`
                                            : chartView === 'price'
                                            ? fmtPrice(v)
                                            : fmtVol(v)}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: '.72rem' }}
                                        iconType="circle"
                                    />
                                    {chartView === 'performance' && (
                                        <ReferenceLine y={0} stroke="rgba(255,255,255,.15)" strokeDasharray="2 2" />
                                    )}
                                    {assets.map(a => (
                                        <Line
                                            key={a.symbol}
                                            type="monotone"
                                            dataKey={a.symbol}
                                            stroke={a.color}
                                            strokeWidth={2}
                                            dot={false}
                                            isAnimationActive={false}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartHeight>
                    </ChartCard>
                )}

                {/* ═══ TREND + MOMENTUM ROW ═══ */}
                {assets.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Activity size={14} color={theme?.brand?.primary || '#00adef'} />
                            Trend · Momentum · Volatility
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Color-coded snapshot from price action over the selected timeframe
                        </SectionSub>
                        <TrendStrip>
                            {assets.map(a => {
                                const tm = TREND_META[a.trend] || TREND_META.unknown;
                                const mm = MOMENTUM_META[a.momentum] || MOMENTUM_META.unknown;
                                const vm = VOL_META[a.volatility] || VOL_META.unknown;
                                return (
                                    <TrendCol key={a.symbol} theme={theme}>
                                        <TrendSym theme={theme}>
                                            <ChipDot $c={a.color} />
                                            {a.symbol}
                                        </TrendSym>
                                        <TrendBadgeRow>
                                            <TrendBadge $c={tm.color}>
                                                <TBLabel theme={theme}>Trend</TBLabel>
                                                <TBValue $c={tm.color}>{tm.label}</TBValue>
                                            </TrendBadge>
                                            <TrendBadge $c={mm.color}>
                                                <TBLabel theme={theme}>Momentum</TBLabel>
                                                <TBValue $c={mm.color}>{mm.label}</TBValue>
                                            </TrendBadge>
                                            <TrendBadge $c={vm.color}>
                                                <TBLabel theme={theme}>Volatility</TBLabel>
                                                <TBValue $c={vm.color}>{vm.label}</TBValue>
                                            </TrendBadge>
                                        </TrendBadgeRow>
                                    </TrendCol>
                                );
                            })}
                        </TrendStrip>
                    </>
                )}

                {/* ═══ TABLE ═══ */}
                {assets.length > 0 && (
                    <TableWrap theme={theme}>
                        <TableToggle theme={theme} onClick={() => setTableExpanded(v => !v)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                <BarChart3 size={14} /> Full comparison table
                            </span>
                            {tableExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </TableToggle>
                        {tableExpanded && (
                            <TableScroll>
                                <Table>
                                    <thead>
                                        <tr>
                                            <Th theme={theme}>Metric</Th>
                                            {assets.map(a => (
                                                <Th key={a.symbol} theme={theme} style={{ color: a.color }}>{a.symbol}</Th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <MetricCol theme={theme}>Price</MetricCol>
                                            {assets.map(a => (
                                                <Td key={a.symbol} theme={theme}>{fmtPrice(a.price)}</Td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <MetricCol theme={theme}>% Change</MetricCol>
                                            {assets.map(a => (
                                                <Td key={a.symbol} theme={theme} $winner={winnerMap.changePercent === a.symbol}>
                                                    {fmtPct(a.changePercent)}
                                                </Td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <MetricCol theme={theme}>Volume</MetricCol>
                                            {assets.map(a => (
                                                <Td key={a.symbol} theme={theme} $winner={winnerMap.volume === a.symbol}>
                                                    {fmtVol(a.volume)}
                                                </Td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <MetricCol theme={theme}>Market Cap</MetricCol>
                                            {assets.map(a => (
                                                <Td key={a.symbol} theme={theme} $winner={winnerMap.marketCap === a.symbol}>
                                                    {fmtBig(a.marketCap)}
                                                </Td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <MetricCol theme={theme}>RSI</MetricCol>
                                            {assets.map(a => (
                                                <Td key={a.symbol} theme={theme} $winner={winnerMap.rsi === a.symbol}>
                                                    {a.rsi !== null && a.rsi !== undefined ? Number(a.rsi).toFixed(0) : '--'}
                                                </Td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <MetricCol theme={theme}>P/E Ratio</MetricCol>
                                            {assets.map(a => (
                                                <Td key={a.symbol} theme={theme} $winner={winnerMap.pe === a.symbol}>
                                                    {a.pe ? Number(a.pe).toFixed(2) : '--'}
                                                </Td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <MetricCol theme={theme}>AI Score</MetricCol>
                                            {assets.map(a => (
                                                <Td key={a.symbol} theme={theme} $winner={winnerMap.aiScore === a.symbol}>
                                                    {a.aiScore !== null && a.aiScore !== undefined ? a.aiScore : '--'}
                                                </Td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </Table>
                            </TableScroll>
                        )}
                    </TableWrap>
                )}

                {/* ═══ BRIDGE CTA ═══ */}
                {assets.length > 0 && (
                    <Bridge>
                        <BridgeText theme={theme}>
                            See the full ranked Opportunity Engine — find more setups beyond this showdown.
                        </BridgeText>
                        <BridgeBtn theme={theme} onClick={() => navigate('/opportunities')}>
                            View Opportunity Engine →
                        </BridgeBtn>
                    </Bridge>
                )}
            </Container>
        </Page>
    );
};

export default ShowdownPage;
