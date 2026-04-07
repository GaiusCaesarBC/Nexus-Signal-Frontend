// client/src/pages/NewsIntelligencePage.js
// News Intelligence — interpretive news feed with trade impact, narrative,
// and sidebar widgets. Replaces the legacy NewsPage.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Newspaper, Brain, ChevronRight, RefreshCw, Sparkles,
    TrendingUp, Activity, Zap, Loader2, ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
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
const SENTIMENT_META = {
    bullish: { label: 'BULLISH', color: '#10b981', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.3)' },
    bearish: { label: 'BEARISH', color: '#ef4444', bg: 'rgba(239,68,68,.12)', border: 'rgba(239,68,68,.3)' },
    neutral: { label: 'NEUTRAL', color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.3)' }
};
const IMPACT_META = {
    high:   { label: '⚡ HIGH IMPACT',   color: '#ef4444' },
    medium: { label: 'MEDIUM IMPACT',    color: '#f59e0b' },
    low:    { label: 'LOW IMPACT',       color: '#64748b' }
};

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulseDot = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
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
    font-size: .72rem;
    font-weight: 600;
    white-space: nowrap;
`;
const StatusDot = styled.span`
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px rgba(16,185,129,.6);
    ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
`;

// ─── Top Stats Bar ───────────────────────────────────────
const StatsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: .55rem;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
    @media(max-width:900px){grid-template-columns:repeat(3,1fr);}
    @media(max-width:600px){grid-template-columns:repeat(2,1fr);}
`;
const StatTile = styled.button`
    padding: .85rem 1rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$active
        ? (p.$accent || '#a78bfa') + '60'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    border-radius: 12px;
    text-align: left;
    cursor: pointer;
    transition: all .15s;
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => (p.$accent || '#a78bfa') + '60'};
    }
`;
const StatLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .35rem;
`;
const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#fff')};
    line-height: 1;
    margin-bottom: .25rem;
`;
const StatSub = styled.div`
    font-size: .6rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;

// ─── Market Narrative Card ────────────────────────────────
const NarrativeCard = styled.div`
    background: linear-gradient(135deg,
        rgba(167, 139, 250, .08),
        rgba(0, 173, 237, .06));
    border: 1px solid rgba(167, 139, 250, .25);
    border-radius: 16px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards;`}
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, #a78bfa, #00adef, transparent);
    }
`;
const NarrativeLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: #a78bfa;
    font-weight: 800;
    margin-bottom: .55rem;
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const NarrativeText = styled.div`
    font-size: 1.05rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.primary || '#fff'};
    line-height: 1.5;
    margin-bottom: 1rem;
`;
const TagRow = styled.div`
    display: flex;
    gap: .4rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
`;
const Tag = styled.span`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    padding: .25rem .55rem;
    border-radius: 5px;
    background: ${p => p.$bullish ? 'rgba(16,185,129,.12)'
        : p.$bearish ? 'rgba(239,68,68,.12)'
        : 'rgba(255,255,255,.05)'};
    color: ${p => p.$bullish ? '#10b981'
        : p.$bearish ? '#ef4444'
        : (p.theme?.text?.secondary || '#94a3b8')};
    border: 1px solid ${p => p.$bullish ? 'rgba(16,185,129,.25)'
        : p.$bearish ? 'rgba(239,68,68,.25)'
        : 'rgba(255,255,255,.08)'};
    font-weight: 800;
`;
const NarrativeCTA = styled.button`
    padding: .65rem 1.25rem;
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
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px rgba(0, 173, 237, .35);
    }
`;

// ─── Filter Bar ──────────────────────────────────────────
const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding-bottom: .85rem;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
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
const SearchInput = styled.input`
    flex: 1;
    min-width: 160px;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    border-radius: 8px;
    padding: .45rem .85rem;
    font-size: .75rem;
    font-weight: 600;
    outline: none;
    &:focus { border-color: ${p => p.theme?.brand?.primary || '#00adef'}; }
    &::placeholder { color: ${p => p.theme?.text?.tertiary || '#64748b'}; font-weight: 500; }
`;

// ─── Body Layout ─────────────────────────────────────────
const Body = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 1.25rem;
    @media(max-width:1100px){grid-template-columns:1fr;}
`;
const FeedColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: .75rem;
`;
const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: .85rem;
    @media(max-width:1100px){margin-top:1rem;}
`;

// ─── News Card ───────────────────────────────────────────
const NewsCard = styled.article`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$hasTrade
        ? 'rgba(16,185,129,.22)'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    transition: all .2s;
    border-left: 3px solid ${p => p.$bias === 'bullish' ? '#10b981'
        : p.$bias === 'bearish' ? '#ef4444'
        : 'rgba(255,255,255,.08)'};
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => p.$hasTrade
            ? 'rgba(16,185,129,.45)'
            : (p.theme?.brand?.primary || '#00adef') + '40'};
    }
`;
const CardTopRow = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
    flex-wrap: wrap;
    margin-bottom: .55rem;
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const SentimentBadge = styled.span`
    padding: .2rem .5rem;
    background: ${p => p.$meta?.bg || 'rgba(255,255,255,.05)'};
    color: ${p => p.$meta?.color || '#94a3b8'};
    border: 1px solid ${p => p.$meta?.border || 'rgba(255,255,255,.08)'};
    border-radius: 5px;
    font-size: .58rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
`;
const ImpactBadge = styled.span`
    padding: .2rem .5rem;
    background: ${p => (p.$c || '#94a3b8') + '15'};
    color: ${p => p.$c || '#94a3b8'};
    border: 1px solid ${p => (p.$c || '#94a3b8') + '30'};
    border-radius: 5px;
    font-size: .58rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
`;
const Headline = styled.h3`
    font-size: 1rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#fff'};
    line-height: 1.4;
    margin: 0 0 .55rem;
`;
const WhyMatters = styled.div`
    font-size: .78rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.5;
    padding: .55rem .8rem;
    background: rgba(167, 139, 250, .04);
    border-left: 2px solid rgba(167, 139, 250, .35);
    border-radius: 0 8px 8px 0;
    margin-bottom: .65rem;
    display: flex;
    align-items: flex-start;
    gap: .4rem;
`;
const TickerRow = styled.div`
    display: flex;
    gap: .35rem;
    flex-wrap: wrap;
    margin-bottom: .65rem;
`;
const TickerChip = styled.button`
    padding: .25rem .55rem;
    background: rgba(0, 173, 237, .08);
    border: 1px solid rgba(0, 173, 237, .2);
    color: #00adef;
    border-radius: 5px;
    font-size: .68rem;
    font-weight: 800;
    cursor: pointer;
    &:hover { background: rgba(0, 173, 237, .18); }
`;
const TradeImpact = styled.div`
    margin: .65rem 0;
    padding: .75rem .9rem;
    background: ${p => p.$bias === 'long' ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.06)'};
    border: 1px solid ${p => p.$bias === 'long' ? 'rgba(16,185,129,.22)' : 'rgba(239,68,68,.22)'};
    border-radius: 10px;
`;
const TradeImpactLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.$c || '#10b981'};
    font-weight: 800;
    margin-bottom: .25rem;
    display: flex;
    align-items: center;
    gap: .25rem;
`;
const TradeImpactText = styled.div`
    font-size: .82rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: .25rem;
`;
const TradeImpactSub = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
`;
const ScoreNum = styled.span`
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
`;
const ActionRow = styled.div`
    display: flex;
    gap: .4rem;
    flex-wrap: wrap;
`;
const PrimaryBtn = styled.button`
    padding: .5rem .9rem;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: .72rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .25rem;
    &:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16, 185, 129, .3); }
`;
const SecondaryBtn = styled.button`
    padding: .5rem .9rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '12'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '30'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 8px;
    font-size: .72rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .25rem;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '22'}; }
`;
const ExternalBtn = styled.a`
    padding: .5rem .65rem;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .08);
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    &:hover { color: ${p => p.theme?.brand?.primary || '#00adef'}; }
`;

// ─── Sidebar widgets ─────────────────────────────────────
const SideCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem 1.15rem;
`;
const SideTitle = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.$accent || '#a78bfa'};
    font-weight: 800;
    margin-bottom: .65rem;
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const SetupRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .55rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    cursor: pointer;
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255, 255, 255, .015); }
`;
const SetupLeft = styled.div`
    display: flex;
    flex-direction: column;
    gap: .15rem;
    flex: 1;
    min-width: 0;
`;
const SetupSym = styled.div`
    font-size: .8rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const SetupText = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
`;
const SetupScore = styled.div`
    font-size: .68rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    flex-shrink: 0;
    margin-left: .5rem;
`;

const TickerListRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .5rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    cursor: pointer;
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255, 255, 255, .015); }
`;
const TickerLeft = styled.div`
    display: flex;
    align-items: center;
    gap: .45rem;
`;
const TickerSym = styled.div`
    font-size: .78rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const TickerShift = styled.span`
    font-size: .65rem;
    font-weight: 800;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
`;
const Spark = styled.svg`
    overflow: visible;
`;

const SentimentBars = styled.div`
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(255, 255, 255, .04);
    margin: .55rem 0;
`;
const SentimentBar = styled.div`
    height: 100%;
    width: ${p => p.$w}%;
    background: ${p => p.$c};
`;
const ShiftRow = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    display: flex;
    justify-content: space-between;
    margin-top: .25rem;
`;
const ShiftStrong = styled.strong`
    color: ${p => p.$pos ? '#10b981' : p.$pos === false ? '#ef4444' : '#94a3b8'};
    font-weight: 900;
`;

const MovementBullet = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.45;
    padding: .45rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    &:last-child { border-bottom: none; }
`;

// ─── Loading / empty / footer ────────────────────────────
const LoadingWrap = styled.div`
    padding: 4rem 2rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
`;
const Empty = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 14px;
    padding: 2rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
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
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;

// ═══════════════════════════════════════════════════════════
// MINI SPARKLINE — synthetic from sentiment shift
// ═══════════════════════════════════════════════════════════
function MiniSpark({ shift }) {
    const points = 12;
    const start = 50;
    const end = Math.max(10, Math.min(90, 50 + shift * 2));
    const arr = [];
    for (let i = 0; i < points; i++) {
        const t = i / (points - 1);
        const v = start + (end - start) * t + (Math.random() - 0.5) * 6;
        arr.push(Math.max(0, Math.min(100, v)));
    }
    const w = 50, h = 16;
    const path = arr.map((v, i) =>
        `${i === 0 ? 'M' : 'L'}${(i / (points - 1) * w).toFixed(1)},${(h - v / 100 * h).toFixed(1)}`
    ).join(' ');
    const color = shift >= 0 ? '#10b981' : '#ef4444';
    return (
        <Spark width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <path d={path} stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </Spark>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const NewsIntelligencePage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const filters = useMemo(() => ({
        sentiment: searchParams.get('sentiment') || 'all',
        impact: searchParams.get('impact') || 'all',
        sector: searchParams.get('sector') || 'all',
        tradeOppOnly: searchParams.get('tradeOppOnly') === '1',
        search: searchParams.get('search') || ''
    }), [searchParams]);

    const updateFilter = useCallback((key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all' || value === false || value === '') next.delete(key);
        else next.set(key, value === true ? '1' : value);
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const buildQs = useCallback(() => {
        const q = new URLSearchParams();
        if (filters.sentiment !== 'all') q.set('sentiment', filters.sentiment);
        if (filters.impact !== 'all') q.set('impact', filters.impact);
        if (filters.sector !== 'all') q.set('sector', filters.sector);
        if (filters.tradeOppOnly) q.set('tradeOppOnly', '1');
        if (filters.search) q.set('search', filters.search);
        return q.toString();
    }, [filters]);

    const fetchData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        try {
            const path = `/news/intelligence?${buildQs()}`;
            const data = api
                ? (await api.get(path)).data
                : await (await fetch(`${API_URL}${path}`)).json();
            setSnapshot(data);
        } catch (e) {
            console.error('[NewsIntel] Fetch failed:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, buildQs]);

    useEffect(() => { fetchData(true); }, [fetchData]);
    useEffect(() => {
        const iv = setInterval(() => fetchData(false), 60000);
        return () => clearInterval(iv);
    }, [fetchData]);

    const goToTrade = (signalId, symbol, isCrypto) => {
        if (signalId) navigate(`/signal/${signalId}`);
        else if (symbol) navigate(isCrypto ? `/crypto/${symbol}` : `/stock/${symbol}`);
    };
    const goToAsset = (symbol) => {
        if (symbol) navigate(`/stock/${symbol}`);
    };

    const stats = snapshot?.stats || {};
    const articles = snapshot?.articles || [];
    const narrative = snapshot?.narrative;
    const trendingTickers = snapshot?.trendingTickers || [];
    const marketSentiment = snapshot?.marketSentiment || {};
    const newsDrivenSetups = snapshot?.newsDrivenSetups || [];
    const smartMoneyMovements = snapshot?.smartMoneyMovements || [];

    const handleNarrativeCTA = () => {
        const next = new URLSearchParams();
        if (narrative?.sectorFilter) next.set('sector', narrative.sectorFilter.toLowerCase());
        if (narrative?.biasFilter === 'long') next.set('sentiment', 'bullish');
        else if (narrative?.biasFilter === 'short') next.set('sentiment', 'bearish');
        next.set('tradeOppOnly', '1');
        setSearchParams(next, { replace: true });
    };

    return (
        <Page theme={theme}>
            <SEO
                title="News Intelligence — Nexus Signal AI"
                description="Market news ranked by trade impact — every headline interpreted, every opportunity surfaced."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Newspaper size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            News Intelligence
                        </H1>
                        <Subhead theme={theme}>
                            Market news ranked by trade impact — every headline interpreted, every opportunity surfaced.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Live · {stats.total ?? '--'} articles · {snapshot ? timeAgo(snapshot.refreshedAt) : '--'}
                    </StatusPill>
                </HeaderRow>

                {/* ═══ STATS BAR ═══ */}
                <StatsBar>
                    <StatTile theme={theme} $accent="#a78bfa" onClick={() => setSearchParams({}, { replace: true })}>
                        <StatLabel theme={theme}>Total</StatLabel>
                        <StatValue theme={theme}>{stats.total ?? '--'}</StatValue>
                        <StatSub theme={theme}>articles tracked</StatSub>
                    </StatTile>
                    <StatTile
                        theme={theme}
                        $accent="#10b981"
                        $active={filters.sentiment === 'bullish'}
                        onClick={() => updateFilter('sentiment', filters.sentiment === 'bullish' ? 'all' : 'bullish')}
                    >
                        <StatLabel theme={theme}>Bullish</StatLabel>
                        <StatValue theme={theme} $c="#10b981">{stats.bullish ?? '--'}</StatValue>
                        <StatSub theme={theme}>{stats.total ? `${Math.round((stats.bullish / stats.total) * 100)}% of all` : ''}</StatSub>
                    </StatTile>
                    <StatTile
                        theme={theme}
                        $accent="#ef4444"
                        $active={filters.sentiment === 'bearish'}
                        onClick={() => updateFilter('sentiment', filters.sentiment === 'bearish' ? 'all' : 'bearish')}
                    >
                        <StatLabel theme={theme}>Bearish</StatLabel>
                        <StatValue theme={theme} $c="#ef4444">{stats.bearish ?? '--'}</StatValue>
                        <StatSub theme={theme}>{stats.total ? `${Math.round((stats.bearish / stats.total) * 100)}% of all` : ''}</StatSub>
                    </StatTile>
                    <StatTile
                        theme={theme}
                        $accent="#f59e0b"
                        $active={filters.tradeOppOnly}
                        onClick={() => updateFilter('tradeOppOnly', !filters.tradeOppOnly)}
                    >
                        <StatLabel theme={theme}>🔥 Trade Opps</StatLabel>
                        <StatValue theme={theme} $c="#f59e0b">{stats.tradeOpportunities ?? '--'}</StatValue>
                        <StatSub theme={theme}>actionable today</StatSub>
                    </StatTile>
                    <StatTile
                        theme={theme}
                        $accent="#ef4444"
                        $active={filters.impact === 'high'}
                        onClick={() => updateFilter('impact', filters.impact === 'high' ? 'all' : 'high')}
                    >
                        <StatLabel theme={theme}>⚡ High Impact</StatLabel>
                        <StatValue theme={theme} $c="#ef4444">{stats.highImpact ?? '--'}</StatValue>
                        <StatSub theme={theme}>AI filtered</StatSub>
                    </StatTile>
                </StatsBar>

                {/* ═══ MARKET NARRATIVE ═══ */}
                {narrative && (
                    <NarrativeCard>
                        <NarrativeLabel><Brain size={11} /> 🧠 MARKET NARRATIVE</NarrativeLabel>
                        <NarrativeText theme={theme}>{narrative.text}</NarrativeText>
                        {narrative.tags && narrative.tags.length > 0 && (
                            <TagRow>
                                {narrative.tags.map((t, i) => {
                                    const isBull = t.includes('BULLISH');
                                    const isBear = t.includes('BEARISH');
                                    return <Tag key={i} theme={theme} $bullish={isBull} $bearish={isBear}>{t}</Tag>;
                                })}
                            </TagRow>
                        )}
                        {narrative.relatedSetups > 0 && (
                            <NarrativeCTA theme={theme} onClick={handleNarrativeCTA}>
                                <Sparkles size={13} /> View {narrative.relatedSetups} Related Setups
                            </NarrativeCTA>
                        )}
                    </NarrativeCard>
                )}

                {/* ═══ FILTERS ═══ */}
                <FilterBar theme={theme}>
                    <Chip theme={theme} $active={filters.sentiment === 'all'} onClick={() => updateFilter('sentiment', 'all')}>All</Chip>
                    <Chip theme={theme} $active={filters.sentiment === 'bullish'} onClick={() => updateFilter('sentiment', 'bullish')}>Bullish</Chip>
                    <Chip theme={theme} $active={filters.sentiment === 'bearish'} onClick={() => updateFilter('sentiment', 'bearish')}>Bearish</Chip>
                    <Chip theme={theme} $active={filters.sentiment === 'neutral'} onClick={() => updateFilter('sentiment', 'neutral')}>Neutral</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.impact === 'high'} onClick={() => updateFilter('impact', filters.impact === 'high' ? 'all' : 'high')}>High Impact</Chip>
                    <Chip theme={theme} $active={filters.impact === 'med-plus'} onClick={() => updateFilter('impact', filters.impact === 'med-plus' ? 'all' : 'med-plus')}>Med+</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    {['Tech', 'Healthcare', 'Energy', 'Financials', 'Crypto'].map(s => (
                        <Chip
                            key={s}
                            theme={theme}
                            $active={filters.sector === s.toLowerCase()}
                            onClick={() => updateFilter('sector', filters.sector === s.toLowerCase() ? 'all' : s.toLowerCase())}
                        >
                            {s}
                        </Chip>
                    ))}
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <SearchInput
                        theme={theme}
                        placeholder="Search headlines or tickers..."
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />
                </FilterBar>

                {/* ═══ BODY ═══ */}
                <Body>
                    {/* News Feed */}
                    <FeedColumn>
                        {loading ? (
                            <LoadingWrap theme={theme}>
                                <SpinningLoader size={20} style={{ marginBottom: '.5rem' }} />
                                <div>Loading news intelligence...</div>
                            </LoadingWrap>
                        ) : articles.length === 0 ? (
                            <Empty theme={theme}>
                                <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>No articles match these filters</strong><br />
                                Try clearing filters or expanding your search.
                            </Empty>
                        ) : (
                            articles.map(a => {
                                const sMeta = SENTIMENT_META[a.sentiment] || SENTIMENT_META.neutral;
                                const iMeta = IMPACT_META[a.impact] || IMPACT_META.low;
                                return (
                                    <NewsCard key={a.id} theme={theme} $bias={a.sentiment} $hasTrade={a.hasLiveSignal}>
                                        <CardTopRow theme={theme}>
                                            <SentimentBadge $meta={sMeta}>{sMeta.label}</SentimentBadge>
                                            <ImpactBadge $c={iMeta.color}>{iMeta.label}</ImpactBadge>
                                            <span>· {timeAgo(a.timestamp)}</span>
                                            {a.source && <span>· {a.source}</span>}
                                        </CardTopRow>
                                        <Headline theme={theme}>{a.title}</Headline>
                                        <WhyMatters theme={theme}>
                                            <span>💡</span>
                                            <div><strong style={{ color: theme?.text?.primary || '#fff' }}>Why this matters:</strong> {a.whyMatters}</div>
                                        </WhyMatters>
                                        {a.tickers && a.tickers.length > 0 && (
                                            <TickerRow>
                                                {a.tickers.slice(0, 6).map(t => (
                                                    <TickerChip key={t} onClick={() => goToAsset(t)}>${t}</TickerChip>
                                                ))}
                                            </TickerRow>
                                        )}
                                        {a.tradeImpact && (
                                            <TradeImpact $bias={a.tradeImpact.bias}>
                                                <TradeImpactLabel $c={a.tradeImpact.bias === 'long' ? '#10b981' : '#ef4444'}>
                                                    📈 TRADE IMPACT
                                                </TradeImpactLabel>
                                                <TradeImpactText theme={theme}>{a.tradeImpact.text}</TradeImpactText>
                                                <TradeImpactSub theme={theme}>
                                                    AI Score <ScoreNum $v={a.tradeImpact.aiScore}>{a.tradeImpact.aiScore}</ScoreNum>
                                                    {' · '}Active {a.tradeImpact.bias === 'long' ? 'LONG' : 'SHORT'} signal
                                                </TradeImpactSub>
                                            </TradeImpact>
                                        )}
                                        <ActionRow>
                                            {a.hasLiveSignal && (
                                                <PrimaryBtn onClick={() => goToTrade(a.signalId, a.tradeImpact?.symbol, a.tradeImpact?.isCrypto)}>
                                                    View Trade Setup <ChevronRight size={12} />
                                                </PrimaryBtn>
                                            )}
                                            {a.tickers?.[0] && (
                                                <SecondaryBtn theme={theme} onClick={() => goToAsset(a.tickers[0])}>
                                                    Analyze <ChevronRight size={12} />
                                                </SecondaryBtn>
                                            )}
                                            {a.url && (
                                                <ExternalBtn theme={theme} href={a.url} target="_blank" rel="noopener noreferrer" title="Read article">
                                                    <ExternalLink size={13} />
                                                </ExternalBtn>
                                            )}
                                        </ActionRow>
                                    </NewsCard>
                                );
                            })
                        )}
                    </FeedColumn>

                    {/* Sidebar */}
                    <Sidebar>
                        {/* News-driven setups */}
                        {newsDrivenSetups.length > 0 && (
                            <SideCard theme={theme}>
                                <SideTitle $accent="#10b981">
                                    <Sparkles size={11} /> 🔥 NEWS-DRIVEN SETUPS
                                </SideTitle>
                                {newsDrivenSetups.map(s => (
                                    <SetupRow
                                        key={s.symbol}
                                        theme={theme}
                                        onClick={() => goToTrade(s.signalId, s.symbol, s.isCrypto)}
                                    >
                                        <SetupLeft>
                                            <SetupSym theme={theme}>{s.symbol}</SetupSym>
                                            <SetupText theme={theme}>{s.interpretation}</SetupText>
                                        </SetupLeft>
                                        <SetupScore $v={s.aiScore}>AI {s.aiScore}</SetupScore>
                                    </SetupRow>
                                ))}
                            </SideCard>
                        )}

                        {/* Trending tickers */}
                        {trendingTickers.length > 0 && (
                            <SideCard theme={theme}>
                                <SideTitle $accent="#0ea5e9">
                                    <TrendingUp size={11} /> 📊 TRENDING IN NEWS
                                </SideTitle>
                                {trendingTickers.map(t => (
                                    <TickerListRow key={t.symbol} theme={theme} onClick={() => goToAsset(t.symbol)}>
                                        <TickerLeft>
                                            <TickerSym theme={theme}>${t.symbol}</TickerSym>
                                            <TickerShift $pos={t.sentimentShift >= 0}>
                                                {t.sentimentShift >= 0 ? '↑' : '↓'} {Math.abs(t.sentimentShift)}%
                                            </TickerShift>
                                        </TickerLeft>
                                        <MiniSpark shift={t.sentimentShift} />
                                    </TickerListRow>
                                ))}
                            </SideCard>
                        )}

                        {/* Market sentiment */}
                        {marketSentiment.bullishPct !== undefined && (
                            <SideCard theme={theme}>
                                <SideTitle $accent="#a78bfa">
                                    <Activity size={11} /> 😀 MARKET MOOD
                                </SideTitle>
                                <SentimentBars>
                                    <SentimentBar $w={marketSentiment.bullishPct} $c="#10b981" />
                                    <SentimentBar $w={marketSentiment.neutralPct} $c="#64748b" />
                                    <SentimentBar $w={marketSentiment.bearishPct} $c="#ef4444" />
                                </SentimentBars>
                                <ShiftRow theme={theme}>
                                    <span><strong style={{ color: '#10b981' }}>{marketSentiment.bullishPct}%</strong> bull</span>
                                    <span><strong style={{ color: '#ef4444' }}>{marketSentiment.bearishPct}%</strong> bear</span>
                                    <span><strong>{marketSentiment.neutralPct}%</strong> neutral</span>
                                </ShiftRow>
                                {marketSentiment.shiftVsYesterday !== 0 && (
                                    <div style={{ marginTop: '.55rem', fontSize: '.7rem', color: theme?.text?.secondary || '#94a3b8', textAlign: 'center' }}>
                                        <ShiftStrong $pos={marketSentiment.direction === 'up'}>
                                            {marketSentiment.direction === 'up' ? '↑' : '↓'} {Math.abs(marketSentiment.shiftVsYesterday)}%
                                        </ShiftStrong>
                                        {' '}vs yesterday
                                    </div>
                                )}
                            </SideCard>
                        )}

                        {/* Smart money movements */}
                        {smartMoneyMovements.length > 0 && (
                            <SideCard theme={theme}>
                                <SideTitle $accent="#f59e0b">
                                    <Zap size={11} /> 💡 WHERE THE MONEY IS
                                </SideTitle>
                                {smartMoneyMovements.map((m, i) => (
                                    <MovementBullet key={i} theme={theme}>{m.text}</MovementBullet>
                                ))}
                            </SideCard>
                        )}
                    </Sidebar>
                </Body>

                {/* ═══ METHODOLOGY ═══ */}
                <Methodology theme={theme}>
                    <div>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How News Intelligence works:</strong>{' '}
                        Articles are sentiment-scored, impact-ranked, and cross-referenced with the Opportunity Engine. Articles tied to live trade setups float to the top — every headline interpreted, every opportunity surfaced.
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

export default NewsIntelligencePage;
