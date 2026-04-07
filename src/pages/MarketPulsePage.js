// client/src/pages/MarketPulsePage.js
// Market Pulse — real-time market intelligence and opportunity discovery.
// Replaces the legacy HeatmapPage.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowUpRight, ArrowDownRight, Brain, ChevronRight, RefreshCw,
    Sparkles, TrendingUp, TrendingDown, Activity, Eye, Copy, Bookmark
} from 'lucide-react';
import SEO from '../components/SEO';
import Sparkline from '../components/Sparkline';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

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
const timeAgo = (d) => {
    if (!d) return '--';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
};

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const ringPulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(0,173,237,.5)}50%{box-shadow:0 0 0 4px rgba(0,173,237,0)}`;
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

// ─── Header ───────────────────────────────────────────────
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
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

// ─── Sentiment Gauge ──────────────────────────────────────
const GaugeCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 16px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
`;
const GaugeLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .8rem;
`;
const GaugeTrack = styled.div`
    position: relative;
    height: 14px;
    background: linear-gradient(to right,
        rgba(239,68,68,.55) 0%,
        rgba(239,68,68,.2) 25%,
        rgba(100,116,139,.25) 50%,
        rgba(16,185,129,.2) 75%,
        rgba(16,185,129,.55) 100%);
    border-radius: 999px;
    overflow: visible;
    margin: 0 .5rem 1rem;
`;
const GaugeNeedle = styled.div`
    position: absolute;
    top: -6px;
    left: ${p => (p.$pos * 100).toFixed(1)}%;
    transform: translateX(-50%);
    width: 4px;
    height: 26px;
    background: ${p => p.theme?.text?.primary || '#fff'};
    border-radius: 2px;
    box-shadow: 0 0 12px rgba(255,255,255,.45);
    transition: left 1s cubic-bezier(.4,.0,.2,1);
`;
const GaugeAnchors = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    font-weight: 700;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    padding: 0 .25rem;
`;
const SentimentMain = styled.div`
    margin-top: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
`;
const BucketLabel = styled.div`
    font-size: 1.65rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const BreadthRow = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
`;
const BreadthItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: .15rem;
`;
const BreadthLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const BreadthValue = styled.div`
    font-size: .95rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;

// ─── AI Insight Strip ─────────────────────────────────────
const InsightStrip = styled.div`
    display: flex;
    align-items: center;
    gap: .9rem;
    padding: .9rem 1.15rem;
    background: linear-gradient(135deg,
        rgba(167, 139, 250, .06),
        rgba(0, 173, 237, .04));
    border: 1px solid rgba(167, 139, 250, .2);
    border-radius: 14px;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards;`}
`;
const InsightIcon = styled.div`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(167, 139, 250, .12);
    border: 1px solid rgba(167, 139, 250, .25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a78bfa;
    flex-shrink: 0;
`;
const InsightText = styled.div`
    font-size: .85rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.5;
    font-weight: 500;
`;

// ─── Tradeable Movers ─────────────────────────────────────
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
const MoversGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: .65rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
    @media(max-width:1100px){grid-template-columns:repeat(3,1fr);}
    @media(max-width:700px){grid-template-columns:repeat(2,1fr);}
    @media(max-width:480px){grid-template-columns:1fr;}
`;
const MoverCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long'
        ? 'rgba(16,185,129,.25)'
        : 'rgba(239,68,68,.25)'};
    border-radius: 12px;
    padding: .85rem;
    cursor: pointer;
    transition: all .2s;
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 28px ${p => p.$bias === 'long'
            ? 'rgba(16,185,129,.18)'
            : 'rgba(239,68,68,.18)'};
    }
`;
const MoverTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const MoverSym = styled.div`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const MoverBias = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    padding: .15rem .4rem;
    border-radius: 5px;
    font-size: .55rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
`;
const MoverChange = styled.div`
    font-size: 1.2rem;
    font-weight: 900;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    line-height: 1;
    margin: .25rem 0 .35rem;
`;
const MoverSpark = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: .45rem;
    min-height: 28px;
`;
const MoverSetup = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .4px;
    color: #a78bfa;
    font-weight: 800;
    margin-bottom: .35rem;
    display: flex;
    align-items: center;
    gap: .2rem;
`;
const MoverWhy = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .55rem;
    min-height: 2.6em;
`;
const MoverCTA = styled.button`
    width: 100%;
    padding: .45rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '35'};
    border-radius: 7px;
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    font-size: .65rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .25rem;
    transition: all .15s;
    &:hover {
        background: ${p => (p.theme?.brand?.primary || '#00adef') + '25'};
    }
`;

// ─── Filter Bar ───────────────────────────────────────────
const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding-bottom: .75rem;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    ${css`animation: ${fadeIn} .4s ease-out .18s backwards;`}
`;
const Chip = styled.button`
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .45rem .8rem;
    background: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '15'
        : (p.theme?.bg?.elevated || 'rgba(12,16,32,.6)')};
    border: 1px solid ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '60'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    color: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef')
        : (p.theme?.text?.secondary || '#94a3b8')};
    border-radius: 8px;
    font-size: .75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
    &:hover {
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
        color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    }
`;

// ─── Treemap ──────────────────────────────────────────────
const TreemapWrap = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
    &:hover .pulse-tile { opacity: .55; }
`;
const SectorBlock = styled.div`
    margin-bottom: 1rem;
    &:last-child { margin-bottom: 0; }
`;
const SectorHeader = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .4rem;
    padding-bottom: .25rem;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
`;
const TilesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: .35rem;
`;
const Tile = styled.div`
    position: relative;
    padding: .65rem .7rem;
    border-radius: 8px;
    cursor: pointer;
    transition: opacity .2s, transform .15s, background-color .8s ease-out;
    background: ${p => {
        const c = p.$change || 0;
        if (c > 5) return 'rgba(16,185,129,.55)';
        if (c > 2) return 'rgba(16,185,129,.4)';
        if (c > 0.5) return 'rgba(16,185,129,.22)';
        if (c > -0.5) return 'rgba(100,116,139,.18)';
        if (c > -2) return 'rgba(239,68,68,.22)';
        if (c > -5) return 'rgba(239,68,68,.4)';
        return 'rgba(239,68,68,.55)';
    }};
    border: 1px solid rgba(255,255,255,.06);
    &:hover {
        opacity: 1 !important;
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + 'aa'};
        transform: translateY(-2px);
        z-index: 2;
    }
    ${p => p.$pulsing && css`
        &::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: 9px;
            border: 1px solid ${p.theme?.brand?.primary || '#00adef'};
            animation: ${ringPulse} 3s ease-in-out infinite;
            pointer-events: none;
        }
    `}
`;
const TileSym = styled.div`
    font-size: .8rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const TileChange = styled.div`
    font-size: .68rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-top: .1rem;
`;

// ─── Tooltip ──────────────────────────────────────────────
const Tooltip = styled.div`
    position: fixed;
    top: ${p => p.$y}px;
    left: ${p => p.$x}px;
    z-index: 1000;
    min-width: 220px;
    max-width: 280px;
    background: ${p => p.theme?.bg?.elevated || '#0f1729'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.12)'};
    border-radius: 10px;
    padding: .85rem 1rem;
    box-shadow: 0 18px 40px rgba(0,0,0,.5);
    pointer-events: none;
    ${css`animation: ${fadeIn} .15s ease-out;`}
`;
const TtSym = styled.div`
    font-size: .92rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .15rem;
`;
const TtName = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-bottom: .55rem;
`;
const TtPrice = styled.div`
    font-size: .85rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    margin-bottom: .15rem;
`;
const TtChange = styled.span`
    font-size: .78rem;
    font-weight: 800;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
`;
const TtSep = styled.div`
    height: 1px;
    background: ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.06)'};
    margin: .55rem 0;
`;
const TtSetup = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #10b981;
    font-weight: 800;
    margin-bottom: .25rem;
`;
const TtClickHint = styled.div`
    font-size: .62rem;
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    margin-top: .45rem;
    font-weight: 700;
`;

// ─── Top Movers Breakdown ─────────────────────────────────
const TopMoversWrap = styled.div`
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .25s backwards;`}
`;
const TopMoversGroup = styled.div`
    margin-bottom: .85rem;
    &:last-child { margin-bottom: 0; }
`;
const TopMoversLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    font-weight: 800;
    margin-bottom: .45rem;
`;
const TopMoversRow = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .55rem;
    @media(max-width:700px){grid-template-columns:1fr;}
`;
const TopMoverCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 10px;
    padding: .8rem .95rem;
    cursor: pointer;
    transition: all .2s;
    &:hover {
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
        transform: translateY(-2px);
    }
`;
const TopMoverHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const TopMoverRank = styled.span`
    font-size: .58rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    text-transform: uppercase;
`;
const TopMoverSym = styled.div`
    font-size: .95rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const TopMoverChange = styled.div`
    font-size: 1.1rem;
    font-weight: 900;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    margin: .15rem 0 .3rem;
`;
const TopMoverWhy = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    line-height: 1.4;
`;

// ─── Bridge CTA ───────────────────────────────────────────
const Bridge = styled.div`
    margin-top: 1.5rem;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg,
        rgba(0, 173, 237, .08),
        rgba(167, 139, 250, .08));
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
    max-width: 540px;
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

// ─── Methodology + loading ────────────────────────────────
const Methodology = styled.div`
    margin-top: 1rem;
    padding: 1rem 1.25rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    border-radius: 12px;
    font-size: .73rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    line-height: 1.6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
`;
const RefreshBtn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .4rem .8rem;
    background: transparent;
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    border-radius: 7px;
    font-size: .72rem;
    font-weight: 700;
    cursor: pointer;
    &:hover { color: ${p => p.theme?.brand?.primary || '#00adef'}; }
`;
const SpinIcon = styled(RefreshCw)`
    ${p => p.$spinning && css`animation: ${spin} 1s linear infinite;`}
`;
const LoadingRow = styled.div`
    padding: 4rem 2rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
`;
const Empty = styled.div`
    padding: 2rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 12px;
    margin-bottom: 1.25rem;
`;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const SENTIMENT_COLORS = {
    strong_bullish: '#10b981',
    mildly_bullish: '#10b981',
    neutral: '#94a3b8',
    mildly_bearish: '#ef4444',
    strong_bearish: '#ef4444'
};
const SENTIMENT_ICON = {
    strong_bullish: '🟢',
    mildly_bullish: '↗',
    neutral: '➖',
    mildly_bearish: '↘',
    strong_bearish: '🔴'
};

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const MarketPulsePage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tooltip, setTooltip] = useState(null); // { x, y, tile }

    const filters = useMemo(() => ({
        asset: searchParams.get('asset') || 'stocks',
        timeframe: searchParams.get('tf') || '24h',
        minMove: searchParams.get('minMove') || '',
        minVol: searchParams.get('minVol') || ''
    }), [searchParams]);

    const updateFilter = useCallback((key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const buildQs = useCallback(() => {
        const q = new URLSearchParams();
        q.set('asset', filters.asset);
        q.set('timeframe', filters.timeframe);
        if (filters.minMove) q.set('minMove', filters.minMove);
        if (filters.minVol) q.set('minVol', filters.minVol);
        return q.toString();
    }, [filters]);

    const fetchData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        try {
            const path = `/heatmap/pulse?${buildQs()}`;
            const data = api
                ? (await api.get(path)).data
                : await (await fetch(`${API_URL}${path}`)).json();
            setSnapshot(data);
        } catch (e) {
            console.error('[MarketPulse] Fetch failed:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, buildQs]);

    useEffect(() => { fetchData(true); }, [fetchData]);

    // Auto-refresh every 60s
    useEffect(() => {
        const iv = setInterval(() => fetchData(false), 60000);
        return () => clearInterval(iv);
    }, [fetchData]);

    const goToAsset = (sym, isCrypto, signalId) => {
        if (signalId) navigate(`/signal/${signalId}`);
        else navigate(isCrypto ? `/crypto/${sym}` : `/stock/${sym}`);
    };

    const onTileEnter = (e, tile) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.min(rect.right + 12, window.innerWidth - 300);
        const y = Math.max(20, Math.min(rect.top, window.innerHeight - 240));
        setTooltip({ x, y, tile });
    };
    const onTileLeave = () => setTooltip(null);

    // Identify the top 3 hottest tiles for pulse rings
    const hottestSymbols = useMemo(() => {
        if (!snapshot) return new Set();
        const allTiles = (snapshot.treemap?.sectors || []).flatMap(s => s.tiles || []);
        const ranked = [...allTiles]
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 3);
        return new Set(ranked.map(t => t.symbol));
    }, [snapshot]);

    const isCryptoMode = filters.asset === 'crypto';
    const sentiment = snapshot?.sentiment;
    const sentimentColor = sentiment ? SENTIMENT_COLORS[sentiment.bucket] : '#94a3b8';
    const sentimentIcon = sentiment ? SENTIMENT_ICON[sentiment.bucket] : '➖';

    return (
        <Page theme={theme}>
            <SEO
                title="Market Pulse — Nexus Signal AI"
                description="Real-time visualization of where momentum, volume, and volatility are concentrated."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Activity size={28} color={theme?.brand?.primary || '#00adef'} />
                            Market Pulse
                        </H1>
                        <Subhead theme={theme}>
                            Real-time visualization of where momentum, volume, and volatility are concentrated.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Live · {snapshot ? `Updated ${timeAgo(snapshot.refreshedAt)}` : 'Loading'}
                        {snapshot && ` · ${snapshot.treemap?.totalTiles || 0} names moving`}
                    </StatusPill>
                </HeaderRow>

                {/* ═══ SENTIMENT GAUGE ═══ */}
                {sentiment && (
                    <GaugeCard theme={theme}>
                        <GaugeLabel theme={theme}>Market Sentiment</GaugeLabel>
                        <GaugeTrack>
                            <GaugeNeedle theme={theme} $pos={sentiment.needlePosition} />
                        </GaugeTrack>
                        <GaugeAnchors theme={theme}>
                            <span>Bearish</span>
                            <span>Neutral</span>
                            <span>Bullish</span>
                        </GaugeAnchors>
                        <SentimentMain>
                            <BucketLabel theme={theme} $c={sentimentColor}>
                                {sentimentIcon} {sentiment.label}
                            </BucketLabel>
                            <BreadthRow>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Up</BreadthLabel>
                                    <BreadthValue theme={theme} $c="#10b981">{sentiment.breadth.up}</BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Down</BreadthLabel>
                                    <BreadthValue theme={theme} $c="#ef4444">{sentiment.breadth.down}</BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Avg Move</BreadthLabel>
                                    <BreadthValue theme={theme} $c={sentiment.avgMove >= 0 ? '#10b981' : '#ef4444'}>
                                        {fmtPct(sentiment.avgMove)}
                                    </BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Dispersion</BreadthLabel>
                                    <BreadthValue theme={theme}>{sentiment.dispersion}</BreadthValue>
                                </BreadthItem>
                            </BreadthRow>
                        </SentimentMain>
                    </GaugeCard>
                )}

                {/* ═══ AI MARKET INSIGHT ═══ */}
                {snapshot?.insight?.text && (
                    <InsightStrip>
                        <InsightIcon><Brain size={20} /></InsightIcon>
                        <InsightText theme={theme}>{snapshot.insight.text}</InsightText>
                    </InsightStrip>
                )}

                {/* ═══ TRADEABLE MOVERS ═══ */}
                {snapshot?.tradeableMovers?.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Sparkles size={16} color="#f59e0b" />
                            🔥 Tradeable Movers
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            AI-selected names with momentum, volume, and a trade plan ready
                        </SectionSub>
                        <MoversGrid>
                            {snapshot.tradeableMovers.map(m => (
                                <MoverCard
                                    key={m.symbol}
                                    theme={theme}
                                    $bias={m.bias}
                                    onClick={() => goToAsset(m.symbol, m.isCrypto, m.signalId)}
                                >
                                    <MoverTop>
                                        <MoverSym theme={theme}>{m.symbol}</MoverSym>
                                        <MoverBias $long={m.bias === 'long'}>
                                            {m.bias === 'long' ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                                            {m.bias === 'long' ? 'LONG' : 'SHORT'}
                                        </MoverBias>
                                    </MoverTop>
                                    <MoverChange $pos={m.changePct >= 0}>{fmtPct(m.changePct)}</MoverChange>
                                    {m.sparkline && m.sparkline.length > 1 && (
                                        <MoverSpark>
                                            <Sparkline data={m.sparkline} bias={m.bias} width={140} height={28} />
                                        </MoverSpark>
                                    )}
                                    <MoverSetup>
                                        <Brain size={9} />{m.setupLabel || 'Momentum'}
                                    </MoverSetup>
                                    <MoverWhy theme={theme}>{m.whyMatters}</MoverWhy>
                                    <MoverCTA theme={theme}>
                                        {m.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} <ChevronRight size={11} />
                                    </MoverCTA>
                                </MoverCard>
                            ))}
                        </MoversGrid>
                    </>
                )}

                {/* ═══ FILTERS ═══ */}
                <FilterBar theme={theme}>
                    <Chip theme={theme} $active={filters.asset === 'stocks'} onClick={() => updateFilter('asset', 'stocks')}>Stocks</Chip>
                    <Chip theme={theme} $active={filters.asset === 'crypto'} onClick={() => updateFilter('asset', 'crypto')}>Crypto</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.timeframe === '5m'} onClick={() => updateFilter('tf', '5m')}>5m</Chip>
                    <Chip theme={theme} $active={filters.timeframe === '1h'} onClick={() => updateFilter('tf', '1h')}>1h</Chip>
                    <Chip theme={theme} $active={filters.timeframe === '24h'} onClick={() => updateFilter('tf', '24h')}>24h</Chip>
                    <Chip theme={theme} $active={filters.timeframe === '1W'} onClick={() => updateFilter('tf', '1W')}>1W</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.minMove === '2'} onClick={() => updateFilter('minMove', filters.minMove === '2' ? '' : '2')}>Move 2%+</Chip>
                    <Chip theme={theme} $active={filters.minMove === '5'} onClick={() => updateFilter('minMove', filters.minMove === '5' ? '' : '5')}>Move 5%+</Chip>
                </FilterBar>

                {/* ═══ TREEMAP ═══ */}
                {loading ? (
                    <LoadingRow theme={theme}>Loading market pulse...</LoadingRow>
                ) : !snapshot || (snapshot.treemap?.totalTiles ?? 0) === 0 ? (
                    <Empty theme={theme}>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed', fontSize: '.95rem' }}>Quiet market</strong><br />
                        No high-conviction moves detected with these filters. The Engine is watching.
                    </Empty>
                ) : (
                    <TreemapWrap theme={theme}>
                        {snapshot.treemap.sectors.map(sector => (
                            <SectorBlock key={sector.name}>
                                {snapshot.assetType === 'stocks' && (
                                    <SectorHeader theme={theme}>
                                        {sector.name} · {sector.tileCount} {sector.tileCount === 1 ? 'name' : 'names'}
                                    </SectorHeader>
                                )}
                                <TilesGrid>
                                    {sector.tiles.map(tile => {
                                        const isCrypto = sector.name === 'Crypto' || sector.name === 'DEX';
                                        const pulsing = hottestSymbols.has(tile.symbol);
                                        return (
                                            <Tile
                                                key={`${tile.symbol}-${sector.name}`}
                                                theme={theme}
                                                className="pulse-tile"
                                                $change={tile.change}
                                                $pulsing={pulsing}
                                                onMouseEnter={(e) => onTileEnter(e, { ...tile, isCrypto })}
                                                onMouseLeave={onTileLeave}
                                                onClick={() => goToAsset(tile.symbol, isCrypto)}
                                            >
                                                <TileSym theme={theme}>{tile.symbol}</TileSym>
                                                <TileChange theme={theme}>{fmtPct(tile.change)}</TileChange>
                                            </Tile>
                                        );
                                    })}
                                </TilesGrid>
                            </SectorBlock>
                        ))}
                    </TreemapWrap>
                )}

                {/* ═══ TOP MOVERS BREAKDOWN ═══ */}
                {snapshot?.topMovers && (
                    <TopMoversWrap>
                        <SectionTitle theme={theme}>
                            <TrendingUp size={16} color={theme?.brand?.primary || '#00adef'} />
                            Top Movers Right Now
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Both winners and losers — every outcome tracked publicly
                        </SectionSub>

                        <TopMoversGroup>
                            <TopMoversLabel $pos>Top Gainers</TopMoversLabel>
                            <TopMoversRow>
                                {snapshot.topMovers.winners.map((w, i) => (
                                    <TopMoverCard
                                        key={`w-${w.symbol}`}
                                        theme={theme}
                                        onClick={() => goToAsset(w.symbol, w.isCrypto)}
                                    >
                                        <TopMoverHead>
                                            <TopMoverRank theme={theme}>#{i + 1} Gainer</TopMoverRank>
                                            <TopMoverSym theme={theme}>{w.symbol}</TopMoverSym>
                                        </TopMoverHead>
                                        <TopMoverChange $pos>{fmtPct(w.changePct)}</TopMoverChange>
                                        <TopMoverWhy theme={theme}>{w.why}</TopMoverWhy>
                                    </TopMoverCard>
                                ))}
                            </TopMoversRow>
                        </TopMoversGroup>

                        <TopMoversGroup>
                            <TopMoversLabel>Top Losers</TopMoversLabel>
                            <TopMoversRow>
                                {snapshot.topMovers.losers.map((l, i) => (
                                    <TopMoverCard
                                        key={`l-${l.symbol}`}
                                        theme={theme}
                                        onClick={() => goToAsset(l.symbol, l.isCrypto)}
                                    >
                                        <TopMoverHead>
                                            <TopMoverRank theme={theme}>#{i + 1} Loser</TopMoverRank>
                                            <TopMoverSym theme={theme}>{l.symbol}</TopMoverSym>
                                        </TopMoverHead>
                                        <TopMoverChange $pos={false}>{fmtPct(l.changePct)}</TopMoverChange>
                                        <TopMoverWhy theme={theme}>{l.why}</TopMoverWhy>
                                    </TopMoverCard>
                                ))}
                            </TopMoversRow>
                        </TopMoversGroup>
                    </TopMoversWrap>
                )}

                {/* ═══ BRIDGE TO OPPORTUNITY ENGINE ═══ */}
                <Bridge>
                    <BridgeText theme={theme}>
                        See the AI's full ranked opportunity list for the current market environment.
                    </BridgeText>
                    <BridgeBtn theme={theme} onClick={() => navigate('/opportunities')}>
                        View {snapshot?.opportunityCount || ''} AI Opportunities <ChevronRight size={14} />
                    </BridgeBtn>
                </Bridge>

                {/* ═══ METHODOLOGY ═══ */}
                <Methodology theme={theme}>
                    <div>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How Market Pulse works:</strong>{' '}
                        Sentiment is computed from breadth, volume-weighted average move, and dispersion. Both winners and losers are shown — every outcome tracked publicly.
                    </div>
                    <RefreshBtn theme={theme} onClick={() => fetchData(false)} disabled={refreshing}>
                        <SpinIcon size={12} $spinning={refreshing} />
                        {refreshing ? 'Refreshing...' : 'Refresh now'}
                    </RefreshBtn>
                </Methodology>
            </Container>

            {/* ═══ TOOLTIP ═══ */}
            {tooltip && (
                <Tooltip theme={theme} $x={tooltip.x} $y={tooltip.y}>
                    <TtSym theme={theme}>{tooltip.tile.symbol}</TtSym>
                    {tooltip.tile.name && tooltip.tile.name !== tooltip.tile.symbol && (
                        <TtName theme={theme}>{tooltip.tile.name}</TtName>
                    )}
                    <TtPrice theme={theme}>
                        {fmtPrice(tooltip.tile.price)}{' '}
                        <TtChange $pos={tooltip.tile.change >= 0}>{fmtPct(tooltip.tile.change)}</TtChange>
                    </TtPrice>
                    {tooltip.tile.volume > 0 && (
                        <div style={{ fontSize: '.65rem', color: theme?.text?.tertiary || '#64748b' }}>
                            Volume: {tooltip.tile.volume?.toLocaleString()}
                        </div>
                    )}
                    <TtSep theme={theme} />
                    <TtSetup>
                        {tooltip.tile.change >= 0 ? '↗ Bullish move' : '↘ Bearish move'}
                    </TtSetup>
                    <TtClickHint theme={theme}>→ Click to analyze</TtClickHint>
                </Tooltip>
            )}
        </Page>
    );
};

export default MarketPulsePage;
