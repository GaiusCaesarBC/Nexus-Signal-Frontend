// client/src/pages/SmartMoneyPage.js
// Smart Money — what insiders, whales, congress, and institutions
// are doing right now and how to trade it. Replaces the legacy
// WhaleAlertsPage.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowUpRight, ArrowDownRight, Brain, ChevronRight, RefreshCw,
    Sparkles, TrendingUp, TrendingDown, Activity, Search, Bookmark,
    Bell, Loader2, Zap, Eye, Users, Building2, Landmark
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
const fmtMoney = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${Math.round(n)}`;
};
const timeAgo = (d) => {
    if (!d) return '--';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

// ═══════════════════════════════════════════════════════════
// META
// ═══════════════════════════════════════════════════════════
const BIAS_COLORS = {
    strong_bullish: '#10b981',
    bullish: '#10b981',
    mixed: '#94a3b8',
    bearish: '#ef4444',
    strong_bearish: '#ef4444'
};
const SOURCE_META = {
    insider:  { label: 'Insider',     icon: Building2, color: '#a78bfa' },
    whale:    { label: 'Whale',       icon: Activity,  color: '#06b6d4' },
    options:  { label: 'Options',     icon: TrendingUp, color: '#f59e0b' },
    congress: { label: 'Congress',    icon: Landmark,  color: '#10b981' }
};
const STRENGTH_META = {
    strong:   { label: 'STRONG',   color: '#10b981', dot: '🟢' },
    moderate: { label: 'MODERATE', color: '#f59e0b', dot: '🟡' },
    weak:     { label: 'WEAK',     color: '#94a3b8', dot: '⚪' }
};
const SOURCE_BIAS_META = {
    bullish: { label: 'Bullish', color: '#10b981' },
    bearish: { label: 'Bearish', color: '#ef4444' },
    mixed:   { label: 'Mixed',   color: '#94a3b8' },
    none:    { label: '—',       color: '#475569' }
};

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulseAnim = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

// ═══════════════════════════════════════════════════════════
// STYLED
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
    max-width: 660px;
    line-height: 1.5;
`;
const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    padding: .55rem .9rem;
    border-radius: 999px;
    background: rgba(167, 139, 250, .06);
    border: 1px solid rgba(167, 139, 250, .25);
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .75rem;
    font-weight: 600;
    white-space: nowrap;
`;
const StatusDot = styled.span`
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px rgba(16,185,129,.6);
    ${css`animation: ${pulseAnim} 2s ease-in-out infinite;`}
`;

// ─── Bias Gauge ───────────────────────────────────────────
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
const BiasMain = styled.div`
    margin-top: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
`;
const BucketLabel = styled.div`
    font-size: 1.7rem;
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
const SourceStrip = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;
const SourceItem = styled.div`
    display: flex;
    align-items: center;
    gap: .4rem;
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
`;
const SourceItemLabel = styled.span`
    font-weight: 700;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    font-size: .6rem;
    letter-spacing: .5px;
`;
const SourceItemBias = styled.span`
    font-weight: 800;
    color: ${p => p.$c || '#94a3b8'};
    text-transform: uppercase;
    font-size: .7rem;
`;

// ─── Insight strip ────────────────────────────────────────
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

// ─── Section titles ───────────────────────────────────────
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

// ─── Smart Money Signals (hero cards) ─────────────────────
const SignalsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: .75rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
`;
const SignalCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long' ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
    border-radius: 14px;
    padding: 1rem 1.1rem;
    cursor: pointer;
    transition: all .2s;
    position: relative;
    overflow: hidden;
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: ${p => p.$bias === 'long'
            ? 'linear-gradient(90deg, transparent, #10b981, transparent)'
            : 'linear-gradient(90deg, transparent, #ef4444, transparent)'};
    }
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px ${p => p.$bias === 'long' ? 'rgba(16,185,129,.18)' : 'rgba(239,68,68,.18)'};
    }
`;
const SigTop = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const SigSym = styled.div`
    font-size: 1.05rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const StrengthBadge = styled.span`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    padding: .2rem .45rem;
    border-radius: 5px;
    font-weight: 800;
    background: ${p => (p.$c || '#94a3b8') + '15'};
    color: ${p => p.$c || '#94a3b8'};
    border: 1px solid ${p => (p.$c || '#94a3b8') + '35'};
`;
const SigBiasRow = styled.div`
    display: flex;
    align-items: center;
    gap: .35rem;
    margin: .35rem 0 .6rem;
    flex-wrap: wrap;
`;
const Bias = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    padding: .2rem .5rem;
    border-radius: 5px;
    font-size: .58rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
`;
const SourcePill = styled.span`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .4px;
    padding: .15rem .4rem;
    border-radius: 4px;
    background: ${p => (p.$c || '#94a3b8') + '15'};
    color: ${p => p.$c || '#94a3b8'};
    border: 1px solid ${p => (p.$c || '#94a3b8') + '30'};
    font-weight: 800;
`;
const Amount = styled.div`
    font-size: 1.6rem;
    font-weight: 900;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    line-height: 1;
    margin-bottom: .15rem;
`;
const AmountSub = styled.div`
    font-size: .62rem;
    text-transform: uppercase;
    letter-spacing: .4px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .55rem;
`;
const ClusterBox = styled.div`
    margin: .55rem 0;
    padding: .55rem .65rem;
    background: rgba(255,255,255,.025);
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    border-radius: 8px;
`;
const ClusterTitle = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .35rem;
`;
const ClusterRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: .65rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    padding: .15rem 0;
`;
const Interp = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.45;
    margin-bottom: .55rem;
    min-height: 2.6em;
`;
const SmallCTA = styled.button`
    width: 100%;
    padding: .5rem;
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
    transition: all .15s;
    &:hover {
        background: ${p => (p.theme?.brand?.primary || '#00adef') + '25'};
    }
`;

// ─── Unusual Activity ─────────────────────────────────────
const UnusualGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: .65rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .18s backwards;`}
`;
const UnusualCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: .85rem 1rem;
    border-left: 3px solid #f59e0b;
    cursor: pointer;
    transition: all .2s;
    &:hover {
        transform: translateY(-2px);
        border-color: rgba(245,158,11,.5);
    }
`;
const UnusualType = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #f59e0b;
    font-weight: 800;
    margin-bottom: .35rem;
`;
const UnusualSym = styled.div`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .25rem;
`;
const UnusualDesc = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .4rem;
`;
const UnusualAmt = styled.div`
    font-size: .82rem;
    font-weight: 800;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
`;

// ─── Filters ──────────────────────────────────────────────
const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding-bottom: .75rem;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
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
    font-size: .72rem;
    font-weight: 700;
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
    &:hover {
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
        color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    }
`;

// ─── Feed ─────────────────────────────────────────────────
const FeedList = styled.div`
    display: flex;
    flex-direction: column;
    gap: .55rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .25s backwards;`}
`;
const FeedCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: .85rem 1rem;
    cursor: pointer;
    transition: all .2s;
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
    }
`;
const FeedHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: .25rem;
`;
const FeedHeadLeft = styled.div`
    display: flex;
    align-items: baseline;
    gap: .55rem;
    flex-wrap: wrap;
`;
const FeedSym = styled.span`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const FeedActor = styled.span`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const FeedTime = styled.span`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 600;
`;
const FeedAmount = styled.div`
    font-size: 1.4rem;
    font-weight: 900;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    line-height: 1;
    margin: .35rem 0 .4rem;
`;
const FeedInterp = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .35rem;
`;
const FeedWhy = styled.div`
    font-size: .62rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-style: italic;
    margin-bottom: .55rem;
`;
const FeedActions = styled.div`
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const ActionIcon = styled.button`
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

// ─── Search ───────────────────────────────────────────────
const SearchCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '30'};
    border-radius: 14px;
    padding: 1rem 1.1rem;
    margin-bottom: 1.25rem;
`;
const SearchTitle = styled.div`
    font-size: .8rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: .55rem;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const SearchRow = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
    flex-wrap: wrap;
`;
const SearchInput = styled.input`
    flex: 1;
    min-width: 160px;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.03)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    border-radius: 8px;
    padding: .55rem .85rem;
    font-size: .82rem;
    font-weight: 600;
    outline: none;
    &:focus { border-color: ${p => p.theme?.brand?.primary || '#00adef'}; }
    &::placeholder { color: ${p => p.theme?.text?.tertiary || '#64748b'}; font-weight: 500; }
`;
const AnalyzeBtn = styled.button`
    padding: .55rem 1.1rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: .78rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    &:disabled { opacity: .55; cursor: not-allowed; }
    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    }
`;
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;
const DetailPanel = styled.div`
    margin-top: .85rem;
    padding: .9rem 1rem;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.02)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    border-radius: 10px;
    ${css`animation: ${fadeIn} .25s ease-out;`}
`;
const DetailHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .55rem;
    flex-wrap: wrap;
    gap: .5rem;
`;
const DetailMetaRow = styled.div`
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    margin-bottom: .65rem;
`;
const DetailEventList = styled.div`
    display: flex;
    flex-direction: column;
    gap: .25rem;
    margin-bottom: .55rem;
`;
const DetailEventRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: .68rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    padding: .25rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
`;

// ─── Bridge / methodology ─────────────────────────────────
const Bridge = styled.div`
    margin-top: 1rem;
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
    font-size: .82rem;
`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const SmartMoneyPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [detailData, setDetailData] = useState(null);

    const filters = useMemo(() => ({
        type: searchParams.get('type') || 'all',
        direction: searchParams.get('direction') || 'all',
        minDollar: searchParams.get('minDollar') || '',
        recency: searchParams.get('recency') || '24h'
    }), [searchParams]);

    const updateFilter = useCallback((key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const buildQs = useCallback(() => {
        const q = new URLSearchParams();
        if (filters.type !== 'all') q.set('type', filters.type);
        if (filters.direction !== 'all') q.set('direction', filters.direction);
        if (filters.minDollar) q.set('minDollar', filters.minDollar);
        if (filters.recency) q.set('recency', filters.recency);
        return q.toString();
    }, [filters]);

    const fetchData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        try {
            const path = `/whale/smart-money?${buildQs()}`;
            const data = api
                ? (await api.get(path)).data
                : await (await fetch(`${API_URL}${path}`)).json();
            setSnapshot(data);
        } catch (e) {
            console.error('[SmartMoney] Fetch failed:', e);
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

    const handleSearch = async () => {
        const sym = searchQuery.trim().toUpperCase();
        if (!sym) return;
        setSearching(true);
        try {
            const res = api
                ? (await api.get(`/whale/smart-money/by-symbol/${encodeURIComponent(sym)}`)).data
                : await (await fetch(`${API_URL}/whale/smart-money/by-symbol/${encodeURIComponent(sym)}`)).json();
            setDetailData(res?.data || null);
        } catch {
            setDetailData(null);
        } finally {
            setSearching(false);
        }
    };

    const bias = snapshot?.bias;
    const insight = snapshot?.insight;
    const signals = snapshot?.signals || [];
    const unusual = snapshot?.unusual || [];
    const feed = snapshot?.feed || [];

    return (
        <Page theme={theme}>
            <SEO
                title="Smart Money — Nexus Signal AI"
                description="What insiders, whales, congress, and institutions are doing right now — and how to trade it."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Brain size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            Smart Money
                        </H1>
                        <Subhead theme={theme}>
                            What insiders, whales, congress, and institutions are doing right now — and how to trade it.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Live · {snapshot ? `${snapshot.totalEvents} events tracked` : 'Loading'} · {snapshot ? timeAgo(snapshot.refreshedAt) : '--'}
                    </StatusPill>
                </HeaderRow>

                {/* ═══ BIAS GAUGE ═══ */}
                {bias && (
                    <GaugeCard theme={theme}>
                        <GaugeLabel theme={theme}>Smart Money Bias</GaugeLabel>
                        <GaugeTrack>
                            <GaugeNeedle theme={theme} $pos={bias.needlePosition} />
                        </GaugeTrack>
                        <GaugeAnchors theme={theme}>
                            <span>Bearish</span>
                            <span>Mixed</span>
                            <span>Bullish</span>
                        </GaugeAnchors>
                        <BiasMain>
                            <BucketLabel theme={theme} $c={BIAS_COLORS[bias.bucket]}>
                                {bias.label}
                            </BucketLabel>
                            <BreadthRow>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Buys</BreadthLabel>
                                    <BreadthValue theme={theme} $c="#10b981">{bias.buys}</BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Sells</BreadthLabel>
                                    <BreadthValue theme={theme} $c="#ef4444">{bias.sells}</BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Net Flow</BreadthLabel>
                                    <BreadthValue theme={theme} $c={bias.netDollarFlow >= 0 ? '#10b981' : '#ef4444'}>
                                        {bias.netDollarFlow >= 0 ? '+' : '−'}{fmtMoney(Math.abs(bias.netDollarFlow))}
                                    </BreadthValue>
                                </BreadthItem>
                            </BreadthRow>
                        </BiasMain>
                        <SourceStrip theme={theme}>
                            {Object.entries(bias.sources).map(([src, b]) => {
                                const meta = SOURCE_BIAS_META[b] || SOURCE_BIAS_META.none;
                                const sm = SOURCE_META[src];
                                return (
                                    <SourceItem key={src} theme={theme}>
                                        <SourceItemLabel theme={theme}>{sm?.label || src}:</SourceItemLabel>
                                        <SourceItemBias $c={meta.color}>{meta.label}</SourceItemBias>
                                    </SourceItem>
                                );
                            })}
                        </SourceStrip>
                    </GaugeCard>
                )}

                {/* ═══ INSIGHT ═══ */}
                {insight?.text && (
                    <InsightStrip>
                        <InsightIcon><Brain size={20} /></InsightIcon>
                        <InsightText theme={theme}>{insight.text}</InsightText>
                    </InsightStrip>
                )}

                {/* ═══ SMART MONEY SIGNALS ═══ */}
                {signals.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Sparkles size={16} color="#f59e0b" />
                            🧠 Smart Money Signals
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Top moves the Engine ranks as actionable right now
                        </SectionSub>
                        <SignalsGrid>
                            {signals.map(s => {
                                const sourceMeta = SOURCE_META[s.sourceType] || SOURCE_META.insider;
                                const strengthMeta = STRENGTH_META[s.strength] || STRENGTH_META.weak;
                                const isLong = s.bias === 'long';
                                return (
                                    <SignalCard
                                        key={s.id}
                                        theme={theme}
                                        $bias={s.bias}
                                        onClick={() => goToAsset(s.symbol, s.isCrypto, s.signalId)}
                                    >
                                        <SigTop>
                                            <SigSym theme={theme}>{s.symbol}</SigSym>
                                            <StrengthBadge $c={strengthMeta.color}>
                                                {strengthMeta.dot} {strengthMeta.label}
                                            </StrengthBadge>
                                        </SigTop>
                                        <SigBiasRow>
                                            <Bias $long={isLong}>
                                                {isLong ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                {isLong ? 'LONG' : 'SHORT'}
                                            </Bias>
                                            <SourcePill $c={sourceMeta.color}>
                                                {s.crossSource ? `${s.sourceTypes?.length}× SOURCES` : sourceMeta.label}
                                            </SourcePill>
                                            {s.eventCount > 1 && (
                                                <SourcePill $c="#f59e0b">CLUSTER {s.eventCount}</SourcePill>
                                            )}
                                        </SigBiasRow>
                                        <Amount $pos={isLong}>{fmtMoney(s.dollarAmount)}</Amount>
                                        <AmountSub theme={theme}>
                                            {s.kind === 'cluster' ? 'Total flow · 24h' : (s.actor || sourceMeta.label)} · {timeAgo(s.timestamp)}
                                        </AmountSub>
                                        {s.clusterEvents && s.clusterEvents.length > 1 && (
                                            <ClusterBox theme={theme}>
                                                <ClusterTitle theme={theme}>Cluster Events</ClusterTitle>
                                                {s.clusterEvents.map((ev, i) => (
                                                    <ClusterRow key={i} theme={theme}>
                                                        <span>{(ev.actor || ev.sourceType).slice(0, 20)}</span>
                                                        <span style={{ fontWeight: 800, color: ev.direction === 'buy' ? '#10b981' : '#ef4444' }}>
                                                            {fmtMoney(ev.dollarAmount)} {ev.direction.toUpperCase()}
                                                        </span>
                                                    </ClusterRow>
                                                ))}
                                            </ClusterBox>
                                        )}
                                        <Interp theme={theme}>{s.interpretation}</Interp>
                                        <SmallCTA theme={theme}>
                                            {s.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} <ChevronRight size={11} />
                                        </SmallCTA>
                                    </SignalCard>
                                );
                            })}
                        </SignalsGrid>
                    </>
                )}

                {/* ═══ UNUSUAL ACTIVITY ═══ */}
                {unusual.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Zap size={15} color="#f59e0b" />
                            ⚡ Unusual Activity
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Things that don't normally happen — pay attention
                        </SectionSub>
                        <UnusualGrid>
                            {unusual.map(u => (
                                <UnusualCard
                                    key={`${u.type}-${u.symbol}`}
                                    theme={theme}
                                    onClick={() => goToAsset(u.symbol, u.isCrypto)}
                                >
                                    <UnusualType>{u.label}</UnusualType>
                                    <UnusualSym theme={theme}>{u.symbol}</UnusualSym>
                                    <UnusualDesc theme={theme}>{u.description}</UnusualDesc>
                                    <UnusualAmt $pos={u.direction === 'buy'}>
                                        {u.direction === 'buy' ? '↑' : '↓'} {fmtMoney(u.dollarAmount)}
                                    </UnusualAmt>
                                </UnusualCard>
                            ))}
                        </UnusualGrid>
                    </>
                )}

                {/* ═══ FILTERS ═══ */}
                <FilterBar theme={theme}>
                    <Chip theme={theme} $active={filters.type === 'all'} onClick={() => updateFilter('type', 'all')}>All Types</Chip>
                    <Chip theme={theme} $active={filters.type === 'insider'} onClick={() => updateFilter('type', 'insider')}>Insider</Chip>
                    <Chip theme={theme} $active={filters.type === 'whale'} onClick={() => updateFilter('type', 'whale')}>Whale</Chip>
                    <Chip theme={theme} $active={filters.type === 'options'} onClick={() => updateFilter('type', 'options')}>Options</Chip>
                    <Chip theme={theme} $active={filters.type === 'congress'} onClick={() => updateFilter('type', 'congress')}>Congress</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.direction === 'buy'} onClick={() => updateFilter('direction', filters.direction === 'buy' ? 'all' : 'buy')}>
                        <TrendingUp size={11} /> Bullish
                    </Chip>
                    <Chip theme={theme} $active={filters.direction === 'sell'} onClick={() => updateFilter('direction', filters.direction === 'sell' ? 'all' : 'sell')}>
                        <TrendingDown size={11} /> Bearish
                    </Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.minDollar === '1000000'} onClick={() => updateFilter('minDollar', filters.minDollar === '1000000' ? '' : '1000000')}>&gt;$1M</Chip>
                    <Chip theme={theme} $active={filters.minDollar === '10000000'} onClick={() => updateFilter('minDollar', filters.minDollar === '10000000' ? '' : '10000000')}>&gt;$10M</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.recency === '1h'} onClick={() => updateFilter('recency', '1h')}>1h</Chip>
                    <Chip theme={theme} $active={filters.recency === '24h'} onClick={() => updateFilter('recency', '24h')}>24h</Chip>
                    <Chip theme={theme} $active={filters.recency === '7d'} onClick={() => updateFilter('recency', '7d')}>7d</Chip>
                </FilterBar>

                {/* ═══ FEED ═══ */}
                <SectionTitle theme={theme}>
                    <Activity size={15} color={theme?.brand?.primary || '#00adef'} />
                    All Smart Money Events
                </SectionTitle>
                <SectionSub theme={theme}>
                    {feed.length} events · sorted by signal strength
                </SectionSub>
                {loading ? (
                    <LoadingRow theme={theme}>Tracking smart money...</LoadingRow>
                ) : feed.length === 0 ? (
                    <Empty theme={theme}>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>Quiet feed</strong><br />
                        No smart money events match these filters. Try loosening or wait for new activity.
                    </Empty>
                ) : (
                    <FeedList>
                        {feed.map(e => {
                            const sm = SOURCE_META[e.sourceType] || SOURCE_META.insider;
                            const strMeta = STRENGTH_META[e.strength] || STRENGTH_META.weak;
                            return (
                                <FeedCard
                                    key={e.id}
                                    theme={theme}
                                    onClick={() => goToAsset(e.symbol, e.isCrypto, e.signalId)}
                                >
                                    <FeedHead>
                                        <FeedHeadLeft>
                                            <FeedSym theme={theme}>${e.symbol}</FeedSym>
                                            <SourcePill $c={sm.color}>{sm.label}</SourcePill>
                                            <FeedActor theme={theme}>· {e.actor}</FeedActor>
                                            <StrengthBadge $c={strMeta.color}>{strMeta.label}</StrengthBadge>
                                        </FeedHeadLeft>
                                        <FeedTime theme={theme}>{timeAgo(e.timestamp)}</FeedTime>
                                    </FeedHead>
                                    <FeedAmount $pos={e.direction === 'buy'}>
                                        {e.direction === 'buy' ? '↑' : '↓'} {fmtMoney(e.dollarAmount)} {e.direction.toUpperCase()}
                                    </FeedAmount>
                                    <FeedInterp theme={theme}>{e.interpretation}</FeedInterp>
                                    <FeedWhy theme={theme}>💡 {e.whyMatters}</FeedWhy>
                                    <FeedActions onClick={(ev) => ev.stopPropagation()}>
                                        <SmallCTA
                                            theme={theme}
                                            style={{ width: 'auto', padding: '.4rem .85rem' }}
                                            onClick={() => goToAsset(e.symbol, e.isCrypto, e.signalId)}
                                        >
                                            {e.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} <ChevronRight size={11} />
                                        </SmallCTA>
                                        <ActionIcon theme={theme} title="Watchlist"><Bookmark size={12} /></ActionIcon>
                                        <ActionIcon theme={theme} title="Alert"><Bell size={12} /></ActionIcon>
                                    </FeedActions>
                                </FeedCard>
                            );
                        })}
                    </FeedList>
                )}

                {/* ═══ SEARCH ═══ */}
                <SearchCard theme={theme}>
                    <SearchTitle theme={theme}>
                        <Search size={14} color={theme?.brand?.primary || '#00adef'} />
                        🔍 Search smart money activity for a symbol
                    </SearchTitle>
                    <SearchRow>
                        <SearchInput
                            theme={theme}
                            placeholder="Type a ticker (e.g., NVDA, BTC)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                            disabled={searching}
                        />
                        <AnalyzeBtn theme={theme} onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                            {searching ? <SpinningLoader size={13} /> : <Search size={13} />}
                            {searching ? 'Searching...' : 'Search'}
                        </AnalyzeBtn>
                    </SearchRow>
                    {detailData && (
                        <DetailPanel theme={theme}>
                            <DetailHead>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: theme?.text?.primary || '#fff' }}>
                                    ${detailData.symbol}
                                </div>
                                <span style={{ fontSize: '.7rem', color: theme?.text?.tertiary || '#64748b', fontWeight: 700 }}>
                                    {detailData.eventCount} events tracked
                                </span>
                            </DetailHead>
                            <DetailMetaRow theme={theme}>
                                <span><strong style={{ color: '#10b981' }}>{detailData.buys}</strong> buys · {fmtMoney(detailData.totalBuyDollars)}</span>
                                <span><strong style={{ color: '#ef4444' }}>{detailData.sells}</strong> sells · {fmtMoney(detailData.totalSellDollars)}</span>
                                <span style={{ marginLeft: 'auto' }}>
                                    Net: <strong style={{ color: detailData.netFlow >= 0 ? '#10b981' : '#ef4444' }}>
                                        {detailData.netFlow >= 0 ? '+' : '−'}{fmtMoney(Math.abs(detailData.netFlow))}
                                    </strong>
                                </span>
                            </DetailMetaRow>
                            {detailData.events?.length > 0 && (
                                <DetailEventList>
                                    {detailData.events.slice(0, 6).map((ev, i) => (
                                        <DetailEventRow key={i} theme={theme}>
                                            <span>{ev.sourceLabel} · {ev.actor}</span>
                                            <span style={{ fontWeight: 800, color: ev.direction === 'buy' ? '#10b981' : '#ef4444' }}>
                                                {fmtMoney(ev.dollarAmount)} {ev.direction.toUpperCase()}
                                            </span>
                                        </DetailEventRow>
                                    ))}
                                </DetailEventList>
                            )}
                            <SmallCTA
                                theme={theme}
                                style={{ width: 'auto', padding: '.5rem 1rem' }}
                                onClick={() => goToAsset(detailData.symbol, detailData.isCrypto, detailData.signalId)}
                            >
                                {detailData.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} <ChevronRight size={11} />
                            </SmallCTA>
                        </DetailPanel>
                    )}
                </SearchCard>

                {/* ═══ BRIDGE ═══ */}
                <Bridge>
                    <BridgeText theme={theme}>
                        See AI opportunities aligned with the current smart money flow.
                    </BridgeText>
                    <BridgeBtn
                        theme={theme}
                        onClick={() => navigate(snapshot?.dominantBias === 'short' ? '/opportunities?preset=short' : '/opportunities?preset=long')}
                    >
                        View {snapshot?.alignedOpportunityCount || ''} Smart-Money-Aligned Opportunities <ChevronRight size={14} />
                    </BridgeBtn>
                </Bridge>

                {/* ═══ METHODOLOGY ═══ */}
                <Methodology theme={theme}>
                    <div>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How Smart Money works:</strong>{' '}
                        Aggregates SEC Form 4 insider filings, on-chain whale activity, congressional disclosures, and unusual options flow. Signals are ranked by dollar size × cluster count × cross-source confluence.
                    </div>
                    <RefreshBtn theme={theme} onClick={() => fetchData(false)} disabled={refreshing}>
                        <SpinIcon size={12} $spinning={refreshing} />
                        {refreshing ? 'Refreshing...' : 'Refresh now'}
                    </RefreshBtn>
                </Methodology>
            </Container>
        </Page>
    );
};

export default SmartMoneyPage;
