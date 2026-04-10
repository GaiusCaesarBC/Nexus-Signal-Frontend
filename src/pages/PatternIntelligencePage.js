// client/src/pages/PatternIntelligencePage.js
// Pattern Intelligence — ranked, classified, tradeable chart patterns.
// Replaces the legacy Pattern Scanner with a decision-engine surface.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    ArrowUpRight, ArrowDownRight, Brain, ChevronRight, ChevronDown,
    Eye, RefreshCw, Sparkles, TrendingUp, TrendingDown, Zap, Activity,
    Bookmark, Bell, Copy, AlertTriangle, CheckCircle, Clock
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
const timeAgo = (d) => {
    if (!d) return '--';
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

// ═══════════════════════════════════════════════════════════
// STAGE LABELS / COLORS
// ═══════════════════════════════════════════════════════════
const STAGE_META = {
    confirmed:    { label: 'CONFIRMED',    color: '#10b981', dot: '🟢' },
    near_breakout:{ label: 'NEAR BREAKOUT', color: '#0ea5e9', dot: '🔵' },
    forming:      { label: 'FORMING',      color: '#f59e0b', dot: '🟡' },
    failed:       { label: 'FAILED',       color: '#ef4444', dot: '🔴' }
};

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

// ═══════════════════════════════════════════════════════════
// STYLED COMPONENTS — themed throughout
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
    background: #a78bfa;
    box-shadow: 0 0 8px rgba(167, 139, 250, .6);
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

// ─── AI Market Insight strip ──────────────────────────────
const InsightStrip = styled.div`
    display: flex;
    align-items: center;
    gap: .85rem;
    padding: .9rem 1.15rem;
    background: linear-gradient(135deg,
        rgba(167, 139, 250, .06),
        rgba(0, 173, 237, .04));
    border: 1px solid rgba(167, 139, 250, .2);
    border-radius: 14px;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
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

// ─── Featured Hero Cards ──────────────────────────────────
const FeaturedGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: .75rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards;`}
    @media(max-width:1100px){grid-template-columns:repeat(3,1fr);}
    @media(max-width:700px){grid-template-columns:repeat(2,1fr);}
    @media(max-width:480px){grid-template-columns:1fr;}
`;
const HeroCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long'
        ? 'rgba(16,185,129,.25)'
        : 'rgba(239,68,68,.25)'};
    border-radius: 14px;
    padding: 1rem;
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
        box-shadow: 0 12px 32px ${p => p.$bias === 'long'
            ? 'rgba(16,185,129,.18)'
            : 'rgba(239,68,68,.18)'};
    }
`;
const HeroTop = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const HeroSym = styled.div`
    font-size: 1.05rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const Score = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    line-height: 1;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
`;
const ScoreLabel = styled.div`
    font-size: .5rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: .5px;
    text-align: right;
`;
const HeroBiasRow = styled.div`
    display: flex;
    align-items: center;
    gap: .35rem;
    margin: .35rem 0 .45rem;
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
const StageBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .25rem;
    padding: .2rem .5rem;
    border-radius: 5px;
    font-size: .55rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
    background: ${p => (p.$c || '#64748b') + '15'};
    color: ${p => p.$c || '#64748b'};
    border: 1px solid ${p => (p.$c || '#64748b') + '35'};
`;
const PatternName = styled.div`
    font-size: .82rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: .25rem;
`;
const StrengthLine = styled.div`
    font-size: .62rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: .4px;
    font-weight: 700;
    margin-bottom: .55rem;
`;
const Why = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .55rem;
    min-height: 2.6em;
`;
const SparkWrap = styled.div`
    margin: .35rem 0 .55rem;
    padding: .25rem 0;
    border-radius: 6px;
    background: rgba(255,255,255,.02);
    display: flex;
    align-items: center;
    justify-content: center;
`;
const HeroFooter = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: .62rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    padding: .45rem 0 .55rem;
    border-top: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
`;
const HeroCTA = styled.button`
    width: 100%;
    padding: .5rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '35'};
    border-radius: 8px;
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    font-size: .7rem;
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

// ─── Filter chips ─────────────────────────────────────────
const FilterBar = styled.div`
    display: flex;
    align-items: center;
    gap: .5rem;
    flex-wrap: wrap;
    margin-bottom: .75rem;
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
const ChipCount = styled.span`
    font-size: .65rem;
    padding: .1rem .4rem;
    border-radius: 999px;
    background: rgba(255,255,255,.06);
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const ChipRel = styled.span`
    font-size: .58rem;
    padding: .1rem .35rem;
    border-radius: 4px;
    background: rgba(16,185,129,.1);
    color: #10b981;
    border: 1px solid rgba(16,185,129,.25);
    font-weight: 800;
    letter-spacing: .3px;
    text-transform: uppercase;
`;
const PresetTabs = styled.div`
    display: flex;
    align-items: center;
    gap: .4rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding-bottom: .85rem;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    ${css`animation: ${fadeIn} .4s ease-out .18s backwards;`}
`;

// ─── Console (symbol-grouped cards) ───────────────────────
const ConsoleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: .85rem;
    @media(max-width:900px){grid-template-columns:1fr;}
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
`;
const SymbolCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem;
    border-left: 3px solid ${p => p.$bias === 'long'
        ? 'rgba(16,185,129,.5)'
        : p.$bias === 'short'
        ? 'rgba(239,68,68,.5)'
        : 'rgba(100,116,139,.4)'};
`;
const SymHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .25rem;
    flex-wrap: wrap;
    gap: .3rem;
`;
const SymName = styled.div`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    display: flex;
    align-items: baseline;
    gap: .45rem;
`;
const SymCompany = styled.span`
    font-size: .72rem;
    font-weight: 600;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const PatternCount = styled.div`
    font-size: .62rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const Divider = styled.div`
    height: 1px;
    background: ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    margin: .65rem 0;
`;

const Strongest = styled.div`margin-top:.4rem;`;
const StrongestLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: #f59e0b;
    font-weight: 800;
    margin-bottom: .4rem;
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const StrongestRow = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
    flex-wrap: wrap;
    margin-bottom: .35rem;
`;
const PatLabel = styled.div`
    font-size: .92rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
`;
const SmallScore = styled.span`
    font-size: .85rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
`;
const ConfText = styled.span`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const StrengthBadge = styled.span`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .4px;
    padding: .15rem .4rem;
    border-radius: 4px;
    background: ${p => p.$strength === 'strong'
        ? 'rgba(16,185,129,.1)'
        : p.$strength === 'moderate'
        ? 'rgba(245,158,11,.1)'
        : 'rgba(100,116,139,.1)'};
    color: ${p => p.$strength === 'strong'
        ? '#10b981'
        : p.$strength === 'moderate'
        ? '#f59e0b'
        : '#94a3b8'};
    font-weight: 800;
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .55rem;
    flex-wrap: wrap;
`;
const MetaItem = styled.span`
    display: inline-flex;
    align-items: center;
    gap: .25rem;
`;
const MetaStrong = styled.strong`
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-weight: 800;
`;

const ActionRow = styled.div`
    display: flex;
    align-items: center;
    gap: .4rem;
    margin-top: .7rem;
`;
const TradeBtn = styled.button`
    flex: 1;
    padding: .55rem .85rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: .72rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .3rem;
    transition: all .15s;
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 14px ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    }
`;
const IconBtn = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 8px;
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

const SecondaryToggle = styled.button`
    margin-top: .7rem;
    width: 100%;
    padding: .45rem;
    background: transparent;
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .68rem;
    font-weight: 700;
    border-radius: 7px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .3rem;
    &:hover {
        color: ${p => p.theme?.text?.secondary || '#94a3b8'};
        border-color: ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.2)'};
    }
`;
const SecondaryList = styled.div`
    margin-top: .55rem;
    padding-top: .55rem;
    border-top: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    display: flex;
    flex-direction: column;
    gap: .35rem;
`;
const SecondaryRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: .7rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    padding: .25rem 0;
`;

// ─── Empty + methodology ──────────────────────────────────
const Empty = styled.div`
    padding: 3rem 1.5rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 14px;
`;
const EmptyTitle = styled.div`
    font-size: 1rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: .5rem;
`;
const EmptyText = styled.div`
    font-size: .82rem;
    max-width: 460px;
    margin: 0 auto 1rem;
    line-height: 1.5;
`;
const EmptyBtn = styled.button`
    padding: .55rem 1.2rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 8px;
    font-weight: 700;
    font-size: .8rem;
    cursor: pointer;
`;

const Methodology = styled.div`
    margin-top: 1.5rem;
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

// ─── Context Menu ─────────────────────────────────────────
const CtxMenu = styled.div`
    position: fixed;
    top: ${p => p.$y}px;
    left: ${p => p.$x}px;
    z-index: 9999;
    min-width: 180px;
    background: ${p => p.theme?.bg?.elevated || '#0f1729'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.12)'};
    border-radius: 10px;
    padding: .35rem;
    box-shadow: 0 16px 40px rgba(0,0,0,.5);
    ${css`animation: ${fadeIn} .12s ease-out;`}
`;
const CtxItem = styled.button`
    display: flex;
    align-items: center;
    gap: .55rem;
    width: 100%;
    padding: .55rem .7rem;
    background: transparent;
    border: none;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-size: .78rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 7px;
    text-align: left;
    &:hover {
        background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
        color: ${p => p.theme?.brand?.primary || '#00adef'};
    }
`;
const CtxDivider = styled.div`
    height: 1px;
    margin: .3rem .25rem;
    background: ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.06)'};
`;

// ═══════════════════════════════════════════════════════════
// HELPERS — group flat patterns by symbol
// ═══════════════════════════════════════════════════════════
function groupBySymbol(patterns) {
    const map = new Map();
    for (const p of patterns) {
        if (!map.has(p.symbol)) map.set(p.symbol, []);
        map.get(p.symbol).push(p);
    }
    // Sort each group by pattern score and return list of {symbol, patterns}
    return Array.from(map.entries())
        .map(([symbol, list]) => ({
            symbol,
            patterns: list.sort((a, b) => b.patternScore - a.patternScore),
            topScore: Math.max(...list.map(p => p.patternScore))
        }))
        .sort((a, b) => b.topScore - a.topScore);
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const PatternIntelligencePage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [patterns, setPatterns] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [presets, setPresets] = useState([]);
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedSymbols, setExpandedSymbols] = useState(new Set());
    const [hoveredId, setHoveredId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, pattern }

    const filters = useMemo(() => ({
        asset: searchParams.get('asset') || 'all',
        bias: searchParams.get('bias') || 'all',
        confMin: searchParams.get('confMin') || '',
        preset: searchParams.get('preset') || 'all'
    }), [searchParams]);

    const updateFilter = useCallback((key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
        if (key !== 'preset' && next.has('preset')) next.delete('preset');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const setPreset = useCallback((presetId) => {
        const next = new URLSearchParams();
        if (presetId !== 'all') next.set('preset', presetId);
        setSearchParams(next, { replace: true });
    }, [setSearchParams]);

    const buildQs = useCallback(() => {
        const q = new URLSearchParams();
        if (filters.asset !== 'all') q.set('asset', filters.asset);
        if (filters.bias !== 'all') q.set('bias', filters.bias);
        if (filters.confMin) q.set('confMin', filters.confMin);
        if (filters.preset !== 'all') q.set('preset', filters.preset);
        q.set('limit', '60');
        return q.toString();
    }, [filters]);

    const fetchData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        try {
            const fetcher = (path) => api
                ? api.get(path).then(r => r.data)
                : fetch(`${API_URL}${path}`).then(r => r.json());

            const qs = buildQs();
            const [patRes, featRes, presRes, insightRes] = await Promise.all([
                fetcher(`/patterns/intelligence?${qs}`).catch(() => ({ patterns: [] })),
                fetcher('/patterns/intelligence/featured?limit=5').catch(() => ({ patterns: [] })),
                fetcher('/patterns/intelligence/presets').catch(() => ({ presets: [] })),
                fetcher('/patterns/intelligence/insight').catch(() => null)
            ]);
            setPatterns(patRes?.patterns || []);
            setFeatured(featRes?.patterns || []);
            setPresets(presRes?.presets || []);
            setInsight(insightRes || null);
        } catch (e) {
            console.error('[PatternIntelligence] Fetch failed:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, buildQs]);

    useEffect(() => { fetchData(true); }, [fetchData]);

    // Auto-refresh every 90s
    useEffect(() => {
        const iv = setInterval(() => fetchData(false), 90000);
        return () => clearInterval(iv);
    }, [fetchData]);

    const goToTrade = (p) => {
        if (p.signalId) navigate(`/signal/${p.signalId}`);
        else navigate(p.isCrypto ? `/crypto/${p.symbol}` : `/stock/${p.symbol}`);
    };

    const openContextMenu = (e, pattern) => {
        e.preventDefault();
        e.stopPropagation();
        // Clamp position so menu stays on screen
        const x = Math.min(e.clientX, window.innerWidth - 200);
        const y = Math.min(e.clientY, window.innerHeight - 260);
        setContextMenu({ x, y, pattern });
    };
    const closeContextMenu = () => setContextMenu(null);

    useEffect(() => {
        if (!contextMenu) return undefined;
        const onClick = () => closeContextMenu();
        const onEsc = (e) => { if (e.key === 'Escape') closeContextMenu(); };
        document.addEventListener('click', onClick);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('click', onClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, [contextMenu]);

    const ctxAction = (action) => {
        const p = contextMenu?.pattern;
        if (!p) return;
        closeContextMenu();
        if (action === 'view') goToTrade(p);
        else if (action === 'paper') {
            navigate('/paper-trading', {
                state: {
                    signal: {
                        symbol: p.symbol,
                        long: p.bias === 'long',
                        crypto: p.isCrypto,
                        entry: p.currentPrice,
                        sl: null,
                        tp1: null, tp2: null, tp3: p.target,
                        conf: p.confidence
                    }
                }
            });
        } else if (action === 'asset') {
            navigate(p.isCrypto ? `/crypto/${p.symbol}` : `/stock/${p.symbol}`);
        } else if (action === 'newtab') {
            const url = p.isCrypto ? `/crypto/${p.symbol}` : `/stock/${p.symbol}`;
            window.open(url, '_blank', 'noopener');
        } else if (action === 'opportunity') {
            navigate(`/opportunities?preset=high_conviction`);
        }
    };

    const grouped = useMemo(() => groupBySymbol(patterns), [patterns]);

    const toggleExpand = (symbol) => {
        setExpandedSymbols(prev => {
            const next = new Set(prev);
            if (next.has(symbol)) next.delete(symbol);
            else next.add(symbol);
            return next;
        });
    };

    return (
        <Page theme={theme}>
            <SEO
                title="Pattern Intelligence — Live Chart Patterns | Nexus Signal AI"
                description="AI-detected chart patterns across stocks and crypto in real time. Every pattern has a stage, every stage has a trade plan with entry, stop, and target."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Brain size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            Pattern Intelligence
                        </H1>
                        <Subhead theme={theme}>
                            Real-time chart pattern detection — ranked, classified, and ready to trade.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Engine Active · {patterns.length} patterns tracked
                    </StatusPill>
                </HeaderRow>

                {/* ═══ AI MARKET INSIGHT STRIP ═══ */}
                {insight?.text && (
                    <InsightStrip theme={theme}>
                        <InsightIcon theme={theme}><Brain size={20} /></InsightIcon>
                        <InsightText theme={theme}>{insight.text}</InsightText>
                    </InsightStrip>
                )}

                {/* ═══ FEATURED HERO CARDS ═══ */}
                {featured.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Zap size={16} color="#f59e0b" />
                            🔥 High-Probability Pattern Setups
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            The patterns the Engine believes are worth acting on right now
                        </SectionSub>
                        <FeaturedGrid>
                            {featured.map(p => {
                                const stageMeta = STAGE_META[p.stage] || STAGE_META.forming;
                                return (
                                    <HeroCard
                                        key={p.id}
                                        theme={theme}
                                        $bias={p.bias}
                                        onClick={() => goToTrade(p)}
                                        onMouseEnter={() => setHoveredId(p.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        onContextMenu={(e) => openContextMenu(e, p)}
                                    >
                                        <HeroTop>
                                            <div>
                                                <HeroSym theme={theme}>{p.symbol}</HeroSym>
                                            </div>
                                            <div>
                                                <Score $v={p.patternScore}>{p.patternScore}</Score>
                                                <ScoreLabel theme={theme}>Score</ScoreLabel>
                                            </div>
                                        </HeroTop>
                                        <HeroBiasRow>
                                            <Bias $long={p.bias === 'long'}>
                                                {p.bias === 'long' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                {p.bias === 'long' ? 'LONG' : 'SHORT'}
                                            </Bias>
                                            <StageBadge $c={stageMeta.color}>{stageMeta.dot} {stageMeta.label}</StageBadge>
                                        </HeroBiasRow>
                                        <PatternName theme={theme}>{p.patternLabel}</PatternName>
                                        <StrengthLine theme={theme}>
                                            ⚡ {p.strength?.toUpperCase()} · {p.confidence}% confidence
                                        </StrengthLine>
                                        {p.sparkline && p.sparkline.length > 1 && (
                                            <SparkWrap>
                                                <Sparkline
                                                    data={p.sparkline}
                                                    bias={p.bias}
                                                    pattern={{ points: p.points, target: p.target }}
                                                    showPattern={hoveredId === p.id}
                                                    width={180}
                                                    height={42}
                                                />
                                            </SparkWrap>
                                        )}
                                        <Why theme={theme}>{p.whyMatters}</Why>
                                        <HeroFooter theme={theme}>
                                            <span>
                                                {p.expectedMove
                                                    ? `${p.expectedMove.min >= 0 ? '+' : ''}${p.expectedMove.min}% to ${p.expectedMove.max >= 0 ? '+' : ''}${p.expectedMove.max}%`
                                                    : '--'}
                                            </span>
                                            <span>R/R 1:{p.rr || '--'}</span>
                                        </HeroFooter>
                                        <HeroCTA theme={theme}>
                                            View Trade Setup <ChevronRight size={12} />
                                        </HeroCTA>
                                    </HeroCard>
                                );
                            })}
                        </FeaturedGrid>
                    </>
                )}

                {/* ═══ FILTERS ═══ */}
                <FilterBar>
                    <Chip theme={theme} $active={filters.asset === 'all'} onClick={() => updateFilter('asset', 'all')}>All Assets</Chip>
                    <Chip theme={theme} $active={filters.asset === 'stocks'} onClick={() => updateFilter('asset', 'stocks')}>Stocks</Chip>
                    <Chip theme={theme} $active={filters.asset === 'crypto'} onClick={() => updateFilter('asset', 'crypto')}>Crypto</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.bias === 'all'} onClick={() => updateFilter('bias', 'all')}>All Bias</Chip>
                    <Chip theme={theme} $active={filters.bias === 'long'} onClick={() => updateFilter('bias', 'long')}>
                        <TrendingUp size={12} />Long
                    </Chip>
                    <Chip theme={theme} $active={filters.bias === 'short'} onClick={() => updateFilter('bias', 'short')}>
                        <TrendingDown size={12} />Short
                    </Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.confMin === '70'} onClick={() => updateFilter('confMin', filters.confMin === '70' ? '' : '70')}>Conf 70+</Chip>
                    <Chip theme={theme} $active={filters.confMin === '85'} onClick={() => updateFilter('confMin', filters.confMin === '85' ? '' : '85')}>Conf 85+</Chip>
                </FilterBar>

                {/* ═══ PRESET TABS ═══ */}
                <PresetTabs theme={theme}>
                    {presets.map(p => (
                        <Chip
                            key={p.id}
                            theme={theme}
                            $active={filters.preset === p.id || (filters.preset === 'all' && p.id === 'all')}
                            onClick={() => setPreset(p.id)}
                            title={p.reliability ? `${p.reliability}% historical reliability` : ''}
                        >
                            {p.label}
                            <ChipCount theme={theme}>{p.count}</ChipCount>
                            {p.reliability && <ChipRel>{p.reliability}%</ChipRel>}
                        </Chip>
                    ))}
                </PresetTabs>

                {/* ═══ CONSOLE ═══ */}
                <SectionTitle theme={theme}>
                    <Activity size={15} color={theme?.brand?.primary || '#00adef'} />
                    All Patterns
                </SectionTitle>
                <SectionSub theme={theme}>
                    {patterns.length} patterns across {grouped.length} symbols · sorted by Pattern Score
                </SectionSub>

                {loading ? (
                    <LoadingRow theme={theme}>Scanning the universe for patterns...</LoadingRow>
                ) : grouped.length === 0 ? (
                    <Empty theme={theme}>
                        <EmptyTitle theme={theme}>No patterns match these filters</EmptyTitle>
                        <EmptyText theme={theme}>
                            The Engine looks for patterns with measurable structure. Try loosening confidence
                            or expanding the stage filter to include "Forming" patterns.
                        </EmptyText>
                        <EmptyBtn theme={theme} onClick={() => setSearchParams({}, { replace: true })}>
                            Reset Filters
                        </EmptyBtn>
                    </Empty>
                ) : (
                    <ConsoleGrid>
                        {grouped.map(({ symbol, patterns: list }) => {
                            const top = list[0];
                            const rest = list.slice(1);
                            const stageMeta = STAGE_META[top.stage] || STAGE_META.forming;
                            const expanded = expandedSymbols.has(symbol);
                            const failed = top.stage === 'failed';
                            return (
                                <SymbolCard
                                    key={symbol}
                                    theme={theme}
                                    $bias={top.bias}
                                    onContextMenu={(e) => openContextMenu(e, top)}
                                >
                                    <SymHead>
                                        <SymName theme={theme}>
                                            {symbol}
                                            <SymCompany theme={theme}>{top.name && top.name !== symbol ? top.name : ''}</SymCompany>
                                        </SymName>
                                        <PatternCount theme={theme}>{list.length} {list.length === 1 ? 'pattern' : 'patterns'}</PatternCount>
                                    </SymHead>
                                    <Divider theme={theme} />
                                    <Strongest>
                                        <StrongestLabel>
                                            ⭐ STRONGEST
                                        </StrongestLabel>
                                        <StrongestRow>
                                            <PatLabel theme={theme} style={failed ? { textDecoration: 'line-through', opacity: .6 } : {}}>
                                                {top.patternLabel}
                                            </PatLabel>
                                            <StageBadge $c={stageMeta.color}>{stageMeta.dot} {stageMeta.label}</StageBadge>
                                            <SmallScore $v={top.patternScore}>{top.patternScore}</SmallScore>
                                            <ConfText theme={theme}>· {top.confidence}%</ConfText>
                                            <StrengthBadge $strength={top.strength}>{top.strength}</StrengthBadge>
                                            <Bias $long={top.bias === 'long'}>
                                                {top.bias === 'long' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                {top.bias === 'long' ? 'LONG' : 'SHORT'}
                                            </Bias>
                                        </StrongestRow>
                                        <Why theme={theme} style={{ minHeight: 'auto', marginBottom: '.4rem' }}>
                                            {top.whyMatters}
                                        </Why>
                                        <MetaRow theme={theme}>
                                            {top.expectedMove && (
                                                <MetaItem>
                                                    Expected: <MetaStrong theme={theme}>
                                                        {top.expectedMove.min >= 0 ? '+' : ''}{top.expectedMove.min}% to {top.expectedMove.max >= 0 ? '+' : ''}{top.expectedMove.max}%
                                                    </MetaStrong>
                                                </MetaItem>
                                            )}
                                            {top.rr && (
                                                <MetaItem>
                                                    R/R: <MetaStrong theme={theme}>1:{top.rr}</MetaStrong>
                                                </MetaItem>
                                            )}
                                            {failed && top.detectedAt && (
                                                <MetaItem style={{ color: '#ef4444' }}>
                                                    <Clock size={11} /> invalidated {timeAgo(top.detectedAt)}
                                                </MetaItem>
                                            )}
                                        </MetaRow>
                                        <ActionRow>
                                            {!failed && (
                                                <TradeBtn theme={theme} onClick={() => goToTrade(top)}>
                                                    {top.hasLiveSignal ? 'View Trade Setup' : 'Run Analysis'} <ChevronRight size={13} />
                                                </TradeBtn>
                                            )}
                                            {failed && (
                                                <TradeBtn theme={theme} style={{ opacity: .55, cursor: 'default' }}>
                                                    Setup Invalidated
                                                </TradeBtn>
                                            )}
                                            <IconBtn theme={theme} title="Add to watchlist"><Bookmark size={13} /></IconBtn>
                                            <IconBtn theme={theme} title="Set alert"><Bell size={13} /></IconBtn>
                                        </ActionRow>
                                    </Strongest>
                                    {rest.length > 0 && (
                                        <>
                                            <SecondaryToggle theme={theme} onClick={() => toggleExpand(symbol)}>
                                                {expanded ? 'Hide' : 'Show'} {rest.length} more {rest.length === 1 ? 'pattern' : 'patterns'}
                                                <ChevronDown size={12} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                                            </SecondaryToggle>
                                            {expanded && (
                                                <SecondaryList theme={theme}>
                                                    {rest.map(r => {
                                                        const rsm = STAGE_META[r.stage] || STAGE_META.forming;
                                                        return (
                                                            <SecondaryRow key={r.id} theme={theme}>
                                                                <span style={r.stage === 'failed' ? { textDecoration: 'line-through', opacity: .6 } : {}}>
                                                                    {r.patternLabel}
                                                                </span>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                                                                    <ConfText theme={theme}>{r.confidence}%</ConfText>
                                                                    <StageBadge $c={rsm.color}>{rsm.dot} {rsm.label}</StageBadge>
                                                                </span>
                                                            </SecondaryRow>
                                                        );
                                                    })}
                                                </SecondaryList>
                                            )}
                                        </>
                                    )}
                                </SymbolCard>
                            );
                        })}
                    </ConsoleGrid>
                )}

                {/* ═══ CONTEXT MENU ═══ */}
                {contextMenu && (
                    <CtxMenu
                        theme={theme}
                        $x={contextMenu.x}
                        $y={contextMenu.y}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CtxItem theme={theme} onClick={() => ctxAction('view')}>
                            <Eye size={14} /> View Trade Setup
                        </CtxItem>
                        <CtxItem theme={theme} onClick={() => ctxAction('paper')}>
                            <Copy size={14} /> Paper Trade
                        </CtxItem>
                        <CtxItem theme={theme} onClick={() => ctxAction('asset')}>
                            <Activity size={14} /> Open Asset Page
                        </CtxItem>
                        <CtxItem theme={theme} onClick={() => ctxAction('newtab')}>
                            <ChevronRight size={14} /> Open in New Tab
                        </CtxItem>
                        <CtxDivider theme={theme} />
                        <CtxItem theme={theme} onClick={() => ctxAction('opportunity')}>
                            <Sparkles size={14} /> See Similar in Opportunity Engine
                        </CtxItem>
                    </CtxMenu>
                )}

                {/* ═══ METHODOLOGY ═══ */}
                <Methodology theme={theme}>
                    <div>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How Pattern Intelligence works:</strong>{' '}
                        Every active opportunity is scanned for chart patterns, classified by stage (Forming → Near Breakout → Confirmed), and ranked by historical reliability × current confidence × stage progression. Failed patterns stay visible — every outcome tracked publicly.
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

export default PatternIntelligencePage;
