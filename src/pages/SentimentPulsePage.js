// client/src/pages/SentimentPulsePage.js
// Sentiment Pulse — live market sentiment intelligence dashboard.
// Replaces the legacy SentimentPage.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowUpRight, ArrowDownRight, Brain, ChevronRight, RefreshCw,
    Sparkles, TrendingUp, TrendingDown, Activity, Eye, Search,
    Bookmark, Bell, Zap, Loader2
} from 'lucide-react';
import SEO from '../components/SEO';
import Sparkline from '../components/Sparkline';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
const fmtNum = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
    return n.toLocaleString();
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
// MOOD META
// ═══════════════════════════════════════════════════════════
const MOOD_COLORS = {
    fear: '#ef4444',
    neutral: '#94a3b8',
    greed: '#10b981',
    euphoria: '#f59e0b'
};
const MOOD_ICONS = {
    fear: '😨',
    neutral: '😐',
    greed: '😀',
    euphoria: '🤩'
};

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const slideDown = keyframes`from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}`;
const pulseAnim = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const ringPulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(0,173,237,.4)}50%{box-shadow:0 0 0 4px rgba(0,173,237,0)}`;
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

// ─── Mood Gauge ───────────────────────────────────────────
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
        rgba(100,116,139,.25) 45%,
        rgba(16,185,129,.25) 65%,
        rgba(16,185,129,.55) 80%,
        rgba(245,158,11,.55) 100%);
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

// ─── Insight Strip ────────────────────────────────────────
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

// ─── Anomalies ────────────────────────────────────────────
const AnomGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: .75rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
`;
const AnomCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem 1.1rem;
    border-left: 3px solid ${p => p.$accent || '#a78bfa'};
    cursor: pointer;
    transition: all .2s;
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px ${p => (p.$accent || '#a78bfa') + '22'};
    }
`;
const AnomTop = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const AnomSym = styled.div`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const AnomType = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    font-weight: 800;
    color: ${p => p.$c || '#a78bfa'};
    display: inline-flex;
    align-items: center;
    gap: .25rem;
    margin-bottom: .55rem;
`;
const AnomMetrics = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .4rem;
    margin: .55rem 0;
    padding: .55rem;
    background: rgba(255,255,255,.025);
    border-radius: 8px;
`;
const AnomMetric = styled.div`
    text-align: center;
`;
const MetricLabel = styled.div`
    font-size: .5rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .15rem;
`;
const MetricVal = styled.div`
    font-size: .82rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;
const AnomWhy = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .55rem;
    min-height: 2.6em;
`;
const SmallCTA = styled.button`
    width: 100%;
    padding: .5rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '35'};
    border-radius: 7px;
    color: ${p => p.theme?.brand?.primary || '#00adef'};
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

// ─── Live Sentiment Feed ──────────────────────────────────
const FeedList = styled.div`
    display: flex;
    flex-direction: column;
    gap: .55rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
`;
const FeedCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: .85rem 1rem;
    cursor: pointer;
    transition: all .2s;
    ${p => p.$fresh && css`
        animation: ${slideDown} .25s ease-out, ${ringPulse} 4s ease-in-out 3;
    `}
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
    }
`;
const FeedTop = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: .35rem;
`;
const FeedHeadline = styled.div`
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
const FeedEvent = styled.span`
    font-size: .68rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    font-weight: 800;
    padding: .15rem .45rem;
    border-radius: 5px;
    background: ${p => (p.$c || '#a78bfa') + '15'};
    color: ${p => p.$c || '#a78bfa'};
    border: 1px solid ${p => (p.$c || '#a78bfa') + '35'};
`;
const FeedTime = styled.span`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 600;
`;
const FeedMid = styled.div`
    display: flex;
    align-items: center;
    gap: .9rem;
    margin: .35rem 0 .45rem;
    flex-wrap: wrap;
`;
const FeedStat = styled.span`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    font-weight: 600;
`;
const FeedStatStrong = styled.strong`
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    font-weight: 800;
`;
const FeedSparkWrap = styled.div`
    margin-left: auto;
`;
const FeedWhy = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .5rem;
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

// ─── Most Discussed Leaderboard ───────────────────────────
const LeaderCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem 1.1rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .22s backwards;`}
`;
const LeaderRow = styled.div`
    display: grid;
    grid-template-columns: 30px 1fr 100px 110px 100px 24px;
    align-items: center;
    gap: .75rem;
    padding: .55rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    cursor: pointer;
    font-size: .78rem;
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255,255,255,.02); }
    @media(max-width:700px){
        grid-template-columns: 30px 1fr 80px 24px;
        & > :nth-child(3),
        & > :nth-child(4) { display: none; }
    }
`;
const LeaderRank = styled.span`
    font-size: .72rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
`;
const LeaderSym = styled.span`
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
`;
const LeaderMentions = styled.span`
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: .72rem;
`;
const LeaderDelta = styled.span`
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    font-weight: 800;
    font-size: .72rem;
`;
const LeaderBull = styled.span`
    color: ${p => p.$v >= 60 ? '#10b981' : p.$v <= 40 ? '#ef4444' : '#f59e0b'};
    font-weight: 800;
    font-size: .72rem;
`;
const AlignDot = styled.span`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${p => p.$status === 'aligned' ? '#10b981'
        : p.$status === 'conflicting' ? '#ef4444' : '#64748b'};
    display: inline-block;
`;

// ─── Inline search ────────────────────────────────────────
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
    &::placeholder {
        color: ${p => p.theme?.text?.tertiary || '#64748b'};
        font-weight: 500;
    }
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
const RecentRow = styled.div`
    margin-top: .55rem;
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const RecentChip = styled.button`
    background: transparent;
    border: none;
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    cursor: pointer;
    font-size: .65rem;
    font-weight: 700;
    padding: 0 .25rem;
    &:hover { text-decoration: underline; }
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
`;
const DetailSym = styled.div`
    font-size: 1.1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const DetailBars = styled.div`
    display: flex;
    height: 10px;
    border-radius: 5px;
    overflow: hidden;
    background: rgba(255,255,255,.05);
    margin-bottom: .55rem;
`;
const DetailBar = styled.div`
    height: 100%;
    width: ${p => p.$w}%;
    background: ${p => p.$c};
`;
const DetailMeta = styled.div`
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    margin-bottom: .55rem;
`;

// ─── Bridge + methodology ─────────────────────────────────
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
    padding: 1.5rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 12px;
    margin-bottom: 1.25rem;
    font-size: .8rem;
`;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
const ANOM_META = {
    bullish_spike_flat_price:    { label: '🔥 Bullish spike, flat price', accent: '#10b981', icon: '🔥' },
    bearish_spike_flat_price:    { label: '❄️ Bearish spike, flat price', accent: '#ef4444', icon: '❄️' },
    price_up_bearish_sentiment:  { label: '📈 Price up, bearish chatter', accent: '#f59e0b', icon: '📈' },
    price_down_bullish_sentiment:{ label: '📉 Price down, bullish chatter', accent: '#0ea5e9', icon: '📉' }
};
const FEED_EVENT_META = {
    bullish_spike:    { color: '#10b981' },
    bearish_spike:    { color: '#ef4444' },
    mention_spike:    { color: '#a78bfa' },
    bullish_dominant: { color: '#10b981' },
    bearish_dominant: { color: '#ef4444' }
};

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const SentimentPulsePage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);

    // Track which feed cards are "fresh" (just arrived) for animation
    const knownFeedIdsRef = useRef(new Set());
    const [freshIds, setFreshIds] = useState(new Set());

    const filters = useMemo(() => ({
        asset: searchParams.get('asset') || 'stocks',
        tf: searchParams.get('tf') || '1h',
        direction: searchParams.get('dir') || 'all',
        spikes: searchParams.get('spikes') === '1',
        aligned: searchParams.get('aligned') === '1'
    }), [searchParams]);

    const updateFilter = useCallback((key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all' || value === false) next.delete(key);
        else next.set(key, value === true ? '1' : value);
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const buildQs = useCallback(() => {
        const q = new URLSearchParams();
        q.set('asset', filters.asset);
        q.set('tf', filters.tf);
        if (filters.direction !== 'all') q.set('direction', filters.direction);
        if (filters.spikes) q.set('spikes', '1');
        if (filters.aligned) q.set('aligned', '1');
        return q.toString();
    }, [filters]);

    const fetchData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        try {
            const path = `/sentiment/pulse?${buildQs()}`;
            const data = api
                ? (await api.get(path)).data
                : await (await fetch(`${API_URL}${path}`)).json();
            // Detect new feed cards for animation
            const newIds = new Set();
            (data?.feed || []).forEach(e => {
                if (!knownFeedIdsRef.current.has(e.id)) newIds.add(e.id);
                knownFeedIdsRef.current.add(e.id);
            });
            setFreshIds(newIds);
            // Clear fresh flag after 60s
            if (newIds.size > 0) {
                setTimeout(() => setFreshIds(new Set()), 60000);
            }
            setSnapshot(data);
        } catch (e) {
            console.error('[SentimentPulse] Fetch failed:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, buildQs]);

    useEffect(() => { fetchData(true); }, [fetchData]);

    // Auto-refresh every 30s
    useEffect(() => {
        const iv = setInterval(() => fetchData(false), 30000);
        return () => clearInterval(iv);
    }, [fetchData]);

    const goToAsset = (sym, isCrypto, signalId) => {
        if (signalId) navigate(`/signal/${signalId}`);
        else navigate(isCrypto ? `/crypto/${sym}` : `/stock/${sym}`);
    };

    const handleSearch = async (overrideSym) => {
        const sym = (overrideSym || searchQuery).trim().toUpperCase();
        if (!sym) return;
        setSearching(true);
        try {
            const res = api
                ? (await api.get(`/sentiment/pulse/by-symbol/${encodeURIComponent(sym)}`)).data
                : await (await fetch(`${API_URL}/sentiment/pulse/by-symbol/${encodeURIComponent(sym)}`)).json();
            setDetailData(res?.data || null);
            setRecentSearches(prev => {
                const next = [sym, ...prev.filter(s => s !== sym)].slice(0, 5);
                return next;
            });
        } catch (e) {
            setDetailData(null);
        } finally {
            setSearching(false);
        }
    };

    return (
        <Page theme={theme}>
            <SEO
                title="Sentiment Pulse — Live Crowd Mood | Nexus Signal AI"
                description="Live market sentiment from social, news, and order flow. See what traders are feeling right now — and where the contrarian opportunity is forming."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Brain size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            Sentiment Pulse
                        </H1>
                        <Subhead theme={theme}>
                            Live market sentiment — what traders are thinking right now, and where opportunity is forming.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Live · {snapshot ? `${fmtNum(snapshot.totalMentions)} mentions tracked` : 'Loading'} · {snapshot ? timeAgo(snapshot.refreshedAt) : '--'}
                    </StatusPill>
                </HeaderRow>

                {/* ═══ MOOD GAUGE ═══ */}
                {snapshot?.mood && (
                    <GaugeCard theme={theme}>
                        <GaugeLabel theme={theme}>Market Mood</GaugeLabel>
                        <GaugeTrack>
                            <GaugeNeedle theme={theme} $pos={snapshot.mood.needlePosition} />
                        </GaugeTrack>
                        <GaugeAnchors theme={theme}>
                            <span>Fear</span>
                            <span>Neutral</span>
                            <span>Greed</span>
                            <span>Euphoria</span>
                        </GaugeAnchors>
                        <SentimentMain>
                            <BucketLabel theme={theme} $c={MOOD_COLORS[snapshot.mood.bucket]}>
                                {MOOD_ICONS[snapshot.mood.bucket]} {snapshot.mood.label}
                            </BucketLabel>
                            <BreadthRow>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Bullish</BreadthLabel>
                                    <BreadthValue theme={theme} $c="#10b981">{snapshot.mood.bullPct}%</BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Bearish</BreadthLabel>
                                    <BreadthValue theme={theme} $c="#ef4444">{snapshot.mood.bearPct}%</BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Mention Vol</BreadthLabel>
                                    <BreadthValue theme={theme}>{snapshot.mood.mentionVolumeRatio}× avg</BreadthValue>
                                </BreadthItem>
                                <BreadthItem>
                                    <BreadthLabel theme={theme}>Velocity</BreadthLabel>
                                    <BreadthValue theme={theme}>{snapshot.mood.velocity?.replace('_', ' ')}</BreadthValue>
                                </BreadthItem>
                            </BreadthRow>
                        </SentimentMain>
                    </GaugeCard>
                )}

                {/* ═══ AI INSIGHT ═══ */}
                {snapshot?.insight?.text && (
                    <InsightStrip>
                        <InsightIcon><Brain size={20} /></InsightIcon>
                        <InsightText theme={theme}>{snapshot.insight.text}</InsightText>
                    </InsightStrip>
                )}

                {/* ═══ ANOMALIES ═══ */}
                {snapshot?.anomalies?.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Zap size={16} color="#f59e0b" />
                            ⚡ Unusual Sentiment
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Where crowd thought disagrees with price action
                        </SectionSub>
                        <AnomGrid>
                            {snapshot.anomalies.map(a => {
                                const meta = ANOM_META[a.type] || { label: a.type, accent: '#a78bfa', icon: '⚡' };
                                return (
                                    <AnomCard
                                        key={a.symbol + a.type}
                                        theme={theme}
                                        $accent={meta.accent}
                                        onClick={() => goToAsset(a.symbol, a.isCrypto, a.signalId)}
                                    >
                                        <AnomTop>
                                            <AnomSym theme={theme}>{a.symbol}</AnomSym>
                                            <span style={{ fontSize: '.62rem', color: theme?.text?.tertiary || '#64748b', fontWeight: 700 }}>
                                                {fmtNum(a.mentions)} mentions
                                            </span>
                                        </AnomTop>
                                        <AnomType $c={meta.accent}>{meta.label}</AnomType>
                                        <AnomMetrics>
                                            <AnomMetric>
                                                <MetricLabel theme={theme}>Bullish</MetricLabel>
                                                <MetricVal $c={a.bullishPct >= 60 ? '#10b981' : a.bullishPct <= 40 ? '#ef4444' : '#f59e0b'}>
                                                    {a.bullishPct}%
                                                </MetricVal>
                                            </AnomMetric>
                                            <AnomMetric>
                                                <MetricLabel theme={theme}>Vol ratio</MetricLabel>
                                                <MetricVal>{a.mentionRatio}×</MetricVal>
                                            </AnomMetric>
                                            <AnomMetric>
                                                <MetricLabel theme={theme}>Price</MetricLabel>
                                                <MetricVal $c={a.pricePct >= 0 ? '#10b981' : '#ef4444'}>
                                                    {a.pricePct >= 0 ? '+' : ''}{(a.pricePct ?? 0).toFixed(2)}%
                                                </MetricVal>
                                            </AnomMetric>
                                        </AnomMetrics>
                                        <AnomWhy theme={theme}>{a.whyMatters}</AnomWhy>
                                        <SmallCTA theme={theme}>
                                            {a.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} <ChevronRight size={11} />
                                        </SmallCTA>
                                    </AnomCard>
                                );
                            })}
                        </AnomGrid>
                    </>
                )}

                {/* ═══ FILTERS ═══ */}
                <FilterBar theme={theme}>
                    <Chip theme={theme} $active={filters.tf === '15m'} onClick={() => updateFilter('tf', '15m')}>15m</Chip>
                    <Chip theme={theme} $active={filters.tf === '1h'} onClick={() => updateFilter('tf', '1h')}>1h</Chip>
                    <Chip theme={theme} $active={filters.tf === '24h'} onClick={() => updateFilter('tf', '24h')}>24h</Chip>
                    <Chip theme={theme} $active={filters.tf === '7d'} onClick={() => updateFilter('tf', '7d')}>7d</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.asset === 'stocks'} onClick={() => updateFilter('asset', 'stocks')}>Stocks</Chip>
                    <Chip theme={theme} $active={filters.asset === 'crypto'} onClick={() => updateFilter('asset', 'crypto')}>Crypto</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.direction === 'bullish'} onClick={() => updateFilter('dir', filters.direction === 'bullish' ? 'all' : 'bullish')}>
                        <TrendingUp size={12} /> Bullish
                    </Chip>
                    <Chip theme={theme} $active={filters.direction === 'bearish'} onClick={() => updateFilter('dir', filters.direction === 'bearish' ? 'all' : 'bearish')}>
                        <TrendingDown size={12} /> Bearish
                    </Chip>
                    <Chip theme={theme} $active={filters.spikes} onClick={() => updateFilter('spikes', !filters.spikes)}>Spikes Only</Chip>
                    <Chip theme={theme} $active={filters.aligned} onClick={() => updateFilter('aligned', !filters.aligned)}>With Signal</Chip>
                </FilterBar>

                {/* ═══ LIVE SENTIMENT FEED ═══ */}
                <SectionTitle theme={theme}>
                    <Sparkles size={16} color="#f59e0b" />
                    🔥 Sentiment Activity
                </SectionTitle>
                <SectionSub theme={theme}>
                    Live stream of sentiment shifts, spikes, and reversals
                </SectionSub>
                {loading ? (
                    <LoadingRow theme={theme}>Reading the crowd...</LoadingRow>
                ) : !snapshot?.feed || snapshot.feed.length === 0 ? (
                    <Empty theme={theme}>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>Quiet feed</strong><br />
                        No notable sentiment events with these filters. The Engine is listening.
                    </Empty>
                ) : (
                    <FeedList>
                        {snapshot.feed.map(e => {
                            const evMeta = FEED_EVENT_META[e.eventType] || { color: '#a78bfa' };
                            const pos = e.bullishPct > e.bearishPct;
                            return (
                                <FeedCard
                                    key={e.id}
                                    theme={theme}
                                    $fresh={freshIds.has(e.id)}
                                    onClick={() => goToAsset(e.symbol, e.isCrypto, e.signalId)}
                                >
                                    <FeedTop>
                                        <FeedHeadline>
                                            <FeedSym theme={theme}>${e.symbol}</FeedSym>
                                            <FeedEvent $c={evMeta.color}>{e.label}</FeedEvent>
                                            {e.alignmentStatus === 'aligned' && (
                                                <span style={{ fontSize: '.6rem', color: '#10b981', fontWeight: 800 }}>● Aligned</span>
                                            )}
                                            {e.alignmentStatus === 'conflicting' && (
                                                <span style={{ fontSize: '.6rem', color: '#ef4444', fontWeight: 800 }}>● Conflict</span>
                                            )}
                                        </FeedHeadline>
                                        <FeedTime theme={theme}>⏱ {timeAgo(e.detectedAt)}</FeedTime>
                                    </FeedTop>
                                    <FeedMid>
                                        <FeedStat theme={theme}>
                                            <FeedStatStrong $c={pos ? '#10b981' : '#ef4444'}>
                                                {pos ? e.bullishPct : e.bearishPct}% {pos ? 'bullish' : 'bearish'}
                                            </FeedStatStrong>
                                        </FeedStat>
                                        <FeedStat theme={theme}>
                                            Mentions <FeedStatStrong $c={e.mentionDelta >= 0 ? '#10b981' : '#ef4444'}>
                                                {e.mentionDelta >= 0 ? '↑' : '↓'}{Math.abs(e.mentionDelta)}%
                                            </FeedStatStrong>
                                        </FeedStat>
                                        <FeedSparkWrap>
                                            {e.mentionSparkline && (
                                                <Sparkline data={e.mentionSparkline} bias={pos ? 'long' : 'short'} width={120} height={26} />
                                            )}
                                        </FeedSparkWrap>
                                    </FeedMid>
                                    <FeedWhy theme={theme}>{e.whyMatters}</FeedWhy>
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

                {/* ═══ MOST DISCUSSED LEADERBOARD ═══ */}
                {snapshot?.mostDiscussed?.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <TrendingUp size={16} color={theme?.brand?.primary || '#00adef'} />
                            Most Discussed · Last {filters.tf}
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Top trending names with sentiment + signal alignment
                        </SectionSub>
                        <LeaderCard theme={theme}>
                            {snapshot.mostDiscussed.map(row => (
                                <LeaderRow
                                    key={row.symbol}
                                    theme={theme}
                                    onClick={() => goToAsset(row.symbol, row.isCrypto, row.signalId)}
                                >
                                    <LeaderRank theme={theme}>#{row.rank}</LeaderRank>
                                    <LeaderSym theme={theme}>${row.symbol}</LeaderSym>
                                    <LeaderMentions theme={theme}>{fmtNum(row.mentions)} mentions</LeaderMentions>
                                    <LeaderDelta $pos={row.mentionDelta >= 0}>
                                        {row.mentionDelta >= 0 ? '↑' : '↓'}{Math.abs(row.mentionDelta)}%
                                    </LeaderDelta>
                                    <LeaderBull $v={row.bullishPct}>{row.bullishPct}% bull</LeaderBull>
                                    <AlignDot $status={row.alignmentStatus} title={row.alignmentStatus} />
                                </LeaderRow>
                            ))}
                        </LeaderCard>
                    </>
                )}

                {/* ═══ SEARCH (collapsed below the leaderboard) ═══ */}
                <SearchCard theme={theme}>
                    <SearchTitle theme={theme}>
                        <Search size={14} color={theme?.brand?.primary || '#00adef'} />
                        🔍 Analyze sentiment for a specific symbol
                    </SearchTitle>
                    <SearchRow>
                        <SearchInput
                            theme={theme}
                            placeholder="Type a ticker (e.g., NVDA, BTC, ETH)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                            disabled={searching}
                        />
                        <AnalyzeBtn theme={theme} onClick={() => handleSearch()} disabled={searching || !searchQuery.trim()}>
                            {searching ? <SpinningLoader size={13} /> : <Search size={13} />}
                            {searching ? 'Searching...' : 'Analyze'}
                        </AnalyzeBtn>
                    </SearchRow>
                    {recentSearches.length > 0 && (
                        <RecentRow theme={theme}>
                            Recent: {recentSearches.map((s, i) => (
                                <span key={s}>
                                    <RecentChip theme={theme} onClick={() => { setSearchQuery(s); handleSearch(s); }}>{s}</RecentChip>
                                    {i < recentSearches.length - 1 && ' · '}
                                </span>
                            ))}
                        </RecentRow>
                    )}
                    {detailData && (
                        <DetailPanel theme={theme}>
                            <DetailHead>
                                <DetailSym theme={theme}>${detailData.symbol}</DetailSym>
                                <span style={{ fontSize: '.7rem', color: theme?.text?.tertiary || '#64748b', fontWeight: 700 }}>
                                    {fmtNum(detailData.mentionsCount)} mentions
                                </span>
                            </DetailHead>
                            <DetailBars>
                                <DetailBar $w={detailData.bullishPct} $c="#10b981" />
                                <DetailBar $w={detailData.neutralPct} $c="#64748b" />
                                <DetailBar $w={detailData.bearishPct} $c="#ef4444" />
                            </DetailBars>
                            <DetailMeta theme={theme}>
                                <span><strong style={{ color: '#10b981' }}>{detailData.bullishPct}%</strong> bullish</span>
                                <span><strong style={{ color: '#ef4444' }}>{detailData.bearishPct}%</strong> bearish</span>
                                <span><strong>{detailData.neutralPct}%</strong> neutral</span>
                                <span style={{ marginLeft: 'auto' }}>
                                    Source: {(detailData.sources || ['stocktwits']).join(', ')}
                                </span>
                            </DetailMeta>
                            {detailData.mentionSparkline && (
                                <div style={{ margin: '.55rem 0' }}>
                                    <Sparkline
                                        data={detailData.mentionSparkline}
                                        bias={detailData.bullishPct > detailData.bearishPct ? 'long' : 'short'}
                                        width={300}
                                        height={36}
                                    />
                                </div>
                            )}
                            <SmallCTA
                                theme={theme}
                                style={{ width: 'auto', padding: '.5rem 1rem' }}
                                onClick={() => goToAsset(detailData.symbol, false, detailData.signalId)}
                            >
                                {detailData.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} <ChevronRight size={11} />
                            </SmallCTA>
                        </DetailPanel>
                    )}
                </SearchCard>

                {/* ═══ BRIDGE ═══ */}
                <Bridge>
                    <BridgeText theme={theme}>
                        See AI opportunities aligned with the current sentiment environment.
                    </BridgeText>
                    <BridgeBtn
                        theme={theme}
                        onClick={() => navigate(snapshot?.dominantBias === 'short' ? '/opportunities?preset=short' : '/opportunities?preset=long')}
                    >
                        View {snapshot?.alignedOpportunityCount || ''} Sentiment-Aligned Opportunities <ChevronRight size={14} />
                    </BridgeBtn>
                </Bridge>

                {/* ═══ METHODOLOGY ═══ */}
                <Methodology theme={theme}>
                    <div>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How Sentiment Pulse works:</strong>{' '}
                        Aggregates social posts and on-platform discussion. Mood is computed from bull-bear ratio, mention volume, and velocity. Anomalies are flagged when crowd thought disagrees with price.
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

export default SentimentPulsePage;
