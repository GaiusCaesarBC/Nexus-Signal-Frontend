// client/src/pages/CommandCenterPage.js
// Command Center — the new dashboard. Designed as a decision engine
// instead of a feature showcase. Reuses every existing intelligence
// endpoint and the existing paper-trading + leaderboard endpoints.
// Replaces the legacy DashboardPage.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
    Sparkles, Brain, Activity, Target, Trophy, ChevronRight, Zap,
    ArrowUpRight, ArrowDownRight, Loader2, RefreshCw, TrendingUp,
    TrendingDown, BarChart3, DollarSign, Eye, Bell, Layers, Bitcoin
} from 'lucide-react';
import SEO from '../components/SEO';
import TradingChart from '../components/TradingChart/TradingChart';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
const fmtMoney = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${Math.round(n).toLocaleString()}`;
};
const fmtPrice = (p) => {
    if (p === null || p === undefined || isNaN(p)) return '--';
    if (Math.abs(p) >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (Math.abs(p) >= 1) return `$${p.toFixed(2)}`;
    if (Math.abs(p) >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(8)}`;
};
const fmtPct = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    return `${n >= 0 ? '+' : ''}${Number(n).toFixed(2)}%`;
};
const safeTime = (d) => {
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
const pulseDot = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const heroShimmer = keyframes`
    0%, 100% { box-shadow: 0 16px 40px rgba(16, 185, 129, .15); }
    50%      { box-shadow: 0 16px 50px rgba(167, 139, 250, .25); }
`;

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
const Greeting = styled.div`
    font-size: 1rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 600;
    margin-bottom: .15rem;
`;
const H1 = styled.h1`
    font-size: 2.4rem;
    font-weight: 900;
    margin: 0 0 .25rem;
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

// ─── Market State Strip ──────────────────────────────────
const MarketStrip = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: .55rem;
    padding: .9rem 1.1rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
    @media(max-width:1000px){grid-template-columns:repeat(3,1fr);}
    @media(max-width:600px){grid-template-columns:repeat(2,1fr);}
`;
const StripTile = styled.div`
    text-align: center;
    padding: .15rem .25rem;
    border-right: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    &:last-child { border-right: none; }
    @media(max-width:1000px){border-right:none;}
`;
const StripLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .25rem;
`;
const StripValue = styled.div`
    font-size: .9rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;

// ─── Best Setup Hero ─────────────────────────────────────
const HeroCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long' ? 'rgba(16,185,129,.35)'
        : p.$bias === 'short' ? 'rgba(239,68,68,.35)'
        : 'rgba(167,139,250,.25)'};
    border-radius: 18px;
    padding: 1.85rem 2rem;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards, ${heroShimmer} 6s ease-in-out infinite;`}
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 4px;
        background: ${p => p.$bias === 'long'
            ? 'linear-gradient(90deg, transparent, #10b981, #00adef, transparent)'
            : p.$bias === 'short'
            ? 'linear-gradient(90deg, transparent, #ef4444, #f59e0b, transparent)'
            : 'linear-gradient(90deg, transparent, #a78bfa, transparent)'};
    }
`;
const HeroLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .65rem;
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const HeroBody = styled.div`
    display: flex;
    align-items: center;
    gap: 1.75rem;
    flex-wrap: wrap;
`;
const HeroSymBlock = styled.div`
    flex-shrink: 0;
    width: 130px;
    padding: 1rem .85rem;
    background: ${p => p.$bias === 'long' ? 'rgba(16,185,129,.1)'
        : p.$bias === 'short' ? 'rgba(239,68,68,.1)'
        : 'rgba(167,139,250,.08)'};
    border: 1px solid ${p => p.$bias === 'long' ? 'rgba(16,185,129,.3)'
        : p.$bias === 'short' ? 'rgba(239,68,68,.3)'
        : 'rgba(167,139,250,.25)'};
    border-radius: 14px;
    text-align: center;
`;
const HeroSym = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    line-height: 1;
    margin-bottom: .35rem;
`;
const HeroBias = styled.div`
    font-size: .68rem;
    font-weight: 800;
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    text-transform: uppercase;
    letter-spacing: .5px;
    display: inline-flex;
    align-items: center;
    gap: .2rem;
`;
const HeroDetails = styled.div`flex:1;min-width:240px;`;
const HeroSetup = styled.div`
    font-size: 1.4rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .35rem;
`;
const HeroMeta = styled.div`
    font-size: .8rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    font-weight: 700;
    margin-bottom: .55rem;
`;
const HeroScore = styled.span`
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    margin: 0 .25rem;
`;
const HeroWhy = styled.div`
    font-size: .88rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.5;
    margin-bottom: .85rem;
    max-width: 540px;
`;
const HeroPlan = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: .45rem;
    margin-bottom: .85rem;
    @media(max-width:600px){grid-template-columns:repeat(2,1fr);}
`;
const PlanBox = styled.div`
    padding: .55rem;
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.05);
    border-radius: 8px;
    text-align: center;
`;
const PlanLabel = styled.div`
    font-size: .5rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .15rem;
`;
const PlanValue = styled.div`
    font-size: .85rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;
const HeroCTAs = styled.div`
    display: flex;
    gap: .55rem;
    flex-wrap: wrap;
`;
const PrimaryCTA = styled.button`
    padding: .75rem 1.4rem;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: .85rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    transition: all .2s;
    &:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(16,185,129,.32); }
`;
const SecondaryCTA = styled.button`
    padding: .75rem 1.4rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '12'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 10px;
    font-size: .85rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '22'}; transform: translateY(-2px); }
`;
const HeroEmpty = styled.div`
    padding: 1.85rem 2rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed rgba(167,139,250,.25);
    border-radius: 18px;
    margin-bottom: 1.25rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
`;
const HeroEmptyTitle = styled.div`
    font-size: 1.05rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: .35rem;
`;

// ─── What You Should Do ──────────────────────────────────
const WhatToDoCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.15rem 1.35rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
`;
const WhatToDoTitle = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .8rem;
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const ActionRow = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: .85rem;
    padding: .85rem 1rem;
    margin-bottom: .55rem;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.02)'};
    border: 1px solid ${p => p.$accent ? p.$accent + '30' : (p.theme?.border?.subtle || 'rgba(255,255,255,.06)')};
    border-radius: 10px;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    cursor: pointer;
    transition: all .15s;
    text-align: left;
    &:last-child { margin-bottom: 0; }
    &:hover {
        transform: translateX(3px);
        border-color: ${p => p.$accent ? p.$accent + '60' : (p.theme?.brand?.primary || '#00adef') + '60'};
    }
`;
const ActionLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    font-weight: 800;
    color: ${p => p.$c || '#94a3b8'};
    flex-shrink: 0;
    width: 60px;
`;
const ActionContent = styled.div`flex:1;min-width:0;`;
const ActionSym = styled.div`
    font-size: .9rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .15rem;
`;
const ActionWhy = styled.div`
    font-size: .7rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    line-height: 1.4;
`;

// ─── Two-column: Live Feed + AI Insight ──────────────────
const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: .85rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
    @media(max-width:1000px){grid-template-columns:1fr;}
`;
const PanelCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.15rem 1.35rem;
`;
const PanelTitle = styled.div`
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
const FeedRow = styled.button`
    width: 100%;
    display: grid;
    grid-template-columns: 30px 1fr 70px 70px 30px;
    gap: .55rem;
    align-items: center;
    padding: .55rem .35rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    cursor: pointer;
    text-align: left;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255,255,255,.02); }
`;
const FeedDot = styled.span`
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${p => p.$long ? '#10b981' : '#ef4444'};
    justify-self: center;
    box-shadow: 0 0 6px ${p => p.$long ? 'rgba(16,185,129,.45)' : 'rgba(239,68,68,.45)'};
`;
const FeedSym = styled.div`
    font-size: .82rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const FeedSetup = styled.div`
    font-size: .58rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: .4px;
    font-weight: 700;
`;
const FeedBias = styled.div`
    font-size: .65rem;
    font-weight: 800;
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
`;
const FeedScore = styled.div`
    font-size: .78rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    text-align: right;
`;
const InsightContent = styled.div`
    font-size: .82rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.55;
    margin-bottom: .85rem;
`;
const InsightCTA = styled.button`
    padding: .55rem 1rem;
    background: rgba(167, 139, 250, .12);
    border: 1px solid rgba(167, 139, 250, .3);
    color: #a78bfa;
    border-radius: 8px;
    font-size: .68rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .3rem;
    &:hover { background: rgba(167, 139, 250, .22); }
`;

// ─── Feature Cards ───────────────────────────────────────
const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: .65rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .25s backwards;`}
`;
const FeatureCard = styled.button`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: 1.1rem 1.2rem;
    cursor: pointer;
    transition: all .2s;
    text-align: left;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => (p.$accent || '#00adef') + '60'};
    }
`;
const FeatureIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${p => (p.$accent || '#00adef') + '15'};
    border: 1px solid ${p => (p.$accent || '#00adef') + '30'};
    color: ${p => p.$accent || '#00adef'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: .55rem;
`;
const FeatureLabel = styled.div`
    font-size: .82rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .25rem;
`;
const FeatureStat = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    line-height: 1.4;
`;
const FeatureStatStrong = styled.strong`
    color: ${p => p.$c || (p.theme?.text?.secondary || '#c8d0da')};
    font-weight: 800;
`;

// ─── Performance + Leaderboard row ───────────────────────
const PerfRow = styled.div`
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: .85rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .3s backwards;`}
    @media(max-width:900px){grid-template-columns:1fr;}
`;
const PerfBig = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    line-height: 1;
    margin: .4rem 0 .2rem;
`;
const PerfMeta = styled.div`
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin-top: .85rem;
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const PerfMetaItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: .15rem;
`;
const PerfMetaVal = styled.div`
    font-size: .85rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;
const PerfTrust = styled.div`
    margin-top: .85rem;
    padding: .55rem .75rem;
    background: rgba(16, 185, 129, .06);
    border: 1px solid rgba(16, 185, 129, .2);
    border-radius: 8px;
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
`;
const LeaderRow = styled.div`
    display: grid;
    grid-template-columns: 30px 1fr 80px;
    gap: .55rem;
    align-items: center;
    padding: .55rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    font-size: .78rem;
    &:last-child { border-bottom: none; }
`;
const LeaderRank = styled.span`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
`;
const LeaderName = styled.span`
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
const LeaderProfit = styled.span`
    text-align: right;
    color: ${p => p.$pos !== false ? '#10b981' : '#ef4444'};
    font-weight: 800;
`;
const GapLine = styled.div`
    margin-top: .85rem;
    padding: .55rem .75rem;
    background: rgba(167, 139, 250, .06);
    border: 1px solid rgba(167, 139, 250, .2);
    border-radius: 8px;
    font-size: .7rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    text-align: center;
`;

// ─── Chart (demoted) ─────────────────────────────────────
const ChartCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .35s backwards;`}
`;
const ChartHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .65rem;
    flex-wrap: wrap;
    gap: .55rem;
`;
const ChartHeight = styled.div`
    width: 100%;
    height: 200px;
`;
const ChartInsight = styled.div`
    margin-top: .55rem;
    font-size: .7rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;
const ChartInsightStrong = styled.strong`
    color: ${p => p.$c || (p.theme?.text?.secondary || '#c8d0da')};
    font-weight: 900;
`;

// ─── Loading / methodology ───────────────────────────────
const LoadingWrap = styled.div`
    padding: 4rem 2rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
`;
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const CommandCenterPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api, user, refreshUser } = useAuth();
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const isMounted = useRef(true);

    // Market filter: 'all' | 'stocks' | 'crypto'
    const [marketFilter, setMarketFilter] = useState('all');

    const [snapshot, setSnapshot] = useState({
        loading: true,
        bestSetup: null,
        liveFeed: [],
        marketState: null,
        sentimentMood: null,
        smartMoney: null,
        opportunityCount: null,
        insight: null,
        chart: null,
        chartSymbol: null
    });

    const [paperTrading, setPaperTrading] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);

    const fetcher = useCallback((path) => api
        ? api.get(path).then(r => r.data).catch(() => null)
        : fetch(`${API_URL}${path}`).then(r => r.ok ? r.json() : null).catch(() => null), [api]);

    // ─── Pull intelligence snapshots in parallel ──────────
    const fetchIntelligence = useCallback(async () => {
        const [
            featuredOpps,
            statusOpps,
            marketPulse,
            sentimentPulse,
            smartMoney
        ] = await Promise.all([
            fetcher('/opportunities/featured?limit=8'),
            fetcher('/opportunities/status'),
            fetcher('/heatmap/pulse'),
            fetcher('/sentiment/pulse'),
            fetcher('/whale/smart-money')
        ]);

        const opps = featuredOpps?.opportunities || [];
        const top = opps[0] || null;

        // Pick a chart symbol — top opportunity or fallback
        const chartSym = top?.symbol || 'NVDA';
        let chartData = null;
        try {
            const chartRes = await fetcher(`/chart/${chartSym}/1D?_t=${Date.now()}`);
            if (chartRes?.data) chartData = chartRes.data;
        } catch {}

        // Build the AI insight from narrative or sector flow
        let insightText = null;
        if (marketPulse?.insight?.text) {
            insightText = marketPulse.insight.text;
        } else if (sentimentPulse?.insight?.text) {
            insightText = sentimentPulse.insight.text;
        }

        if (!isMounted.current) return;

        setSnapshot({
            loading: false,
            bestSetup: top,
            liveFeed: opps,
            marketState: marketPulse?.sentiment ? {
                label: marketPulse.sentiment.label,
                bullishPct: marketPulse.sentiment.breadth?.up
                    ? Math.round((marketPulse.sentiment.breadth.up /
                        Math.max(1, marketPulse.sentiment.breadth.up + marketPulse.sentiment.breadth.down)) * 100)
                    : null
            } : null,
            sentimentMood: sentimentPulse?.mood?.label || null,
            smartMoney: smartMoney?.bias?.label || null,
            opportunityCount: statusOpps?.total ?? null,
            insight: insightText,
            chart: chartData,
            chartSymbol: chartSym
        });
    }, [fetcher]);

    // ─── Pull paper trading + leaderboard (legacy endpoints) ──
    const fetchPersonal = useCallback(async () => {
        try {
            const [acct, lb] = await Promise.all([
                fetcher('/paper-trading/account'),
                fetcher('/paper-trading/leaderboard?limit=5')
            ]);
            if (!isMounted.current) return;
            if (acct?.success) setPaperTrading(acct.account);
            if (lb?.success) {
                setLeaderboard(lb.leaderboard || []);
                const me = (lb.leaderboard || []).find(e => e.user?._id === user?._id);
                if (me) setUserRank(me.rank);
            }
        } catch (e) {
            // silent — feature cards still render with fallbacks
        }
    }, [fetcher, user]);

    useEffect(() => {
        isMounted.current = true;
        fetchIntelligence();
        fetchPersonal();
        return () => { isMounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-refresh intelligence every 90s (personal data is sticky)
    useEffect(() => {
        const iv = setInterval(fetchIntelligence, 90000);
        return () => clearInterval(iv);
    }, [fetchIntelligence]);

    // ─────────────────────────────────────────────────────────────────
    // Post-checkout subscription sync.
    //
    // After a Stripe checkout, the user is redirected here with
    // ?success=true&session_id=X. The webhook that updates the DB runs
    // asynchronously and might land AFTER the redirect, so the local
    // `user` object can be stale (still shows 'free').
    //
    // We detect the query param, clear it immediately (so a page refresh
    // doesn't re-trigger), then poll /auth/me up to 6 times over ~18s
    // until the subscription field flips from 'free' to something else.
    // Once confirmed (or after max retries), we stop polling.
    // ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        const isCheckoutReturn = searchParams.get('success') === 'true';
        if (!isCheckoutReturn) return;

        // Clear the query params immediately so a manual refresh doesn't
        // re-enter this flow.
        setSearchParams({}, { replace: true });
        toast.info('Confirming your subscription...', 'Almost there');

        let cancelled = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 6;
        const INTERVAL_MS = 3000; // 3 seconds between polls

        const poll = async () => {
            if (cancelled) return;
            attempts++;

            try {
                const success = await refreshUser();
                if (!success) {
                    // refreshUser failed (network / auth issue) — stop polling
                    return;
                }

                // After refreshUser, the `user` object in context is updated.
                // We can't read it synchronously here (it'll be stale in this
                // closure), so we do a fresh fetch to check the status field.
                const res = await api.get('/auth/me');
                const status = res?.data?.subscription?.status;

                if (status && status !== 'free') {
                    // Subscription landed — we're done
                    console.log(`[Checkout Sync] ✅ Subscription confirmed: ${status} (attempt ${attempts})`);
                    const planName = status.charAt(0).toUpperCase() + status.slice(1);
                    toast.success(`You're on ${planName}! Your features are now unlocked.`, 'Subscription Active');
                    return;
                }
            } catch (err) {
                console.log(`[Checkout Sync] Poll attempt ${attempts} failed:`, err?.message);
            }

            // Not confirmed yet — retry if under the cap
            if (attempts < MAX_ATTEMPTS && !cancelled) {
                setTimeout(poll, INTERVAL_MS);
            } else if (!cancelled) {
                console.log(`[Checkout Sync] ⚠️ Max retries reached. User may need to refresh manually.`);
                toast.warning('Subscription is processing. If features aren\'t unlocked in a minute, try refreshing the page.', 'Still syncing');
            }
        };

        // Start polling after a short delay to give the webhook a head start
        const startDelay = setTimeout(poll, 1500);

        return () => {
            cancelled = true;
            clearTimeout(startDelay);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount — the searchParams check gates re-entry

    // ───── What You Should Do — derive 3 actions ─────
    const recommendedActions = useMemo(() => {
        const opps = snapshot.liveFeed || [];
        if (opps.length === 0) return [];
        const trade = opps.find(o => o.aiScore >= 80) || opps[0];
        const watch = opps.find(o => o.aiScore >= 65 && o.aiScore < 80 && o.symbol !== trade?.symbol);
        const conflicting = opps.find(o => o.symbol !== trade?.symbol && o.symbol !== watch?.symbol && o.aiScore < 60);

        const out = [];
        if (trade) out.push({
            kind: 'trade',
            color: '#10b981',
            label: 'TRADE',
            symbol: trade.symbol,
            why: `${trade.bias === 'long' ? 'Bullish' : 'Bearish'} ${(trade.setupLabel || 'setup').toLowerCase()} — AI ${trade.aiScore}, ${trade.whySurfaced || 'high-conviction setup'}`,
            data: trade
        });
        if (watch) out.push({
            kind: 'watch',
            color: '#f59e0b',
            label: 'WATCH',
            symbol: watch.symbol,
            why: `${watch.setupLabel || 'Setup'} forming — AI ${watch.aiScore}, wait for confirmation`,
            data: watch
        });
        if (conflicting) out.push({
            kind: 'avoid',
            color: '#ef4444',
            label: 'AVOID',
            symbol: conflicting.symbol,
            why: `Low conviction (AI ${conflicting.aiScore}) — no clear edge, skip for now`,
            data: conflicting
        });
        return out;
    }, [snapshot.liveFeed]);

    // Chart insight derived from recent data
    const chartInsight = useMemo(() => {
        const data = snapshot.chart;
        if (!data || data.length < 5) return null;
        const closes = data.map(d => d.close ?? d.price).filter(c => typeof c === 'number');
        if (closes.length < 5) return null;
        const first = closes[0];
        const last = closes[closes.length - 1];
        const pct = ((last - first) / first) * 100;
        const trend = pct > 2 ? 'Bullish' : pct < -2 ? 'Bearish' : 'Sideways';
        const trendColor = pct > 2 ? '#10b981' : pct < -2 ? '#ef4444' : '#f59e0b';

        const recent = closes.slice(-Math.min(5, closes.length));
        const recentMin = Math.min(...recent);
        const recentMax = Math.max(...recent);
        const range = ((recentMax - recentMin) / recentMin) * 100;
        const momentum = range > 5 ? 'Volatile' : range > 2 ? 'Active' : 'Steady';
        const momentumColor = range > 5 ? '#f59e0b' : '#a78bfa';

        return { trend, trendColor, momentum, momentumColor, change: pct };
    }, [snapshot.chart]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Chart data shape: convert to recharts shape
    const chartData = useMemo(() => {
        if (!snapshot.chart) return [];
        return (snapshot.chart || []).slice(-60).map(d => ({
            date: d.date || d.time,
            value: d.close ?? d.price ?? 0
        }));
    }, [snapshot.chart]);

    const goToSetup = (s) => {
        if (s?.signalId || s?.id) navigate(`/signal/${s.signalId || s.id}`);
        else if (s?.symbol) navigate(s.isCrypto ? `/crypto/${s.symbol}` : `/stock/${s.symbol}`);
    };
    const copyToPaper = (s) => {
        if (!s) return;
        navigate('/paper-trading', {
            state: {
                signal: {
                    symbol: s.symbol,
                    long: s.bias === 'long',
                    crypto: s.isCrypto,
                    entry: s.entry,
                    sl: s.sl,
                    tp1: s.tp1, tp2: s.tp2, tp3: s.tp3,
                    conf: s.confidence,
                    rr: s.rr
                }
            }
        });
    };

    // Filter live feed + best setup by market filter (all / stocks / crypto)
    const filteredFeed = useMemo(() => {
        const feed = snapshot.liveFeed || [];
        if (marketFilter === 'all') return feed;
        return feed.filter(o =>
            marketFilter === 'crypto' ? o.isCrypto : !o.isCrypto
        );
    }, [snapshot.liveFeed, marketFilter]);

    const best = marketFilter === 'all'
        ? snapshot.bestSetup
        : (filteredFeed[0] || null);
    const isLong = best?.bias === 'long';

    // Performance computed values
    const portfolioValue = paperTrading?.portfolioValue ?? 100000;
    const totalPL = paperTrading?.totalProfitLoss ?? 0;
    const totalPLPct = paperTrading?.totalProfitLossPercent ?? 0;
    const winRate = paperTrading?.winRate ?? 0;
    const totalTrades = paperTrading?.totalTrades ?? 0;
    const isPositive = totalPL >= 0;

    // Trust line: percentile vs leaderboard
    const percentileText = useMemo(() => {
        if (!leaderboard || leaderboard.length === 0 || !userRank) return null;
        const total = leaderboard.length >= 5 ? Math.max(100, leaderboard.length * 20) : 100;
        const better = Math.max(0, total - userRank);
        const pct = Math.round((better / total) * 100);
        return `You're outperforming ${pct}% of traders this week`;
    }, [leaderboard, userRank]);

    // Gap line: difference vs #1
    const gapLine = useMemo(() => {
        if (!leaderboard || leaderboard.length === 0 || !paperTrading) return null;
        const top = leaderboard[0];
        if (!top) return null;
        const topProfit = top.totalProfitLoss ?? top.profitLoss ?? 0;
        const myProfit = totalPL;
        const gap = topProfit - myProfit;
        if (Math.abs(gap) < 1) return `You're tied with #1 — keep going`;
        if (gap > 0) return `You vs #1: $${Math.round(Math.abs(gap)).toLocaleString()} behind`;
        return `You're $${Math.round(Math.abs(gap)).toLocaleString()} ahead of #1`;
    }, [leaderboard, paperTrading, totalPL]);

    return (
        <Page theme={theme}>
            <SEO
                title="Command Center — Your Trading Cockpit | Nexus Signal AI"
                description="Best setups right now, live market state, your open positions, and personal performance — your full trading day on one screen."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <Greeting theme={theme}>{greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Greeting>
                        <H1 theme={theme}>
                            <Sparkles size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            Command Center
                        </H1>
                        <Subhead theme={theme}>
                            What to trade, what's moving, and how you're performing — all in one view.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Live · {snapshot.opportunityCount ?? '--'} setups available
                    </StatusPill>
                </HeaderRow>

                {/* ═══ MARKET STATE STRIP ═══ */}
                <MarketStrip theme={theme}>
                    <StripTile theme={theme}>
                        <StripLabel theme={theme}>Market Bias</StripLabel>
                        <StripValue theme={theme} $c={
                            snapshot.marketState?.label?.includes('Bullish') ? '#10b981'
                            : snapshot.marketState?.label?.includes('Bearish') ? '#ef4444'
                            : '#94a3b8'
                        }>
                            {snapshot.marketState?.label || (snapshot.loading ? '...' : '--')}
                        </StripValue>
                    </StripTile>
                    <StripTile theme={theme}>
                        <StripLabel theme={theme}>Breadth</StripLabel>
                        <StripValue theme={theme} $c="#10b981">
                            {snapshot.marketState?.bullishPct !== null ? `${snapshot.marketState?.bullishPct}% bullish` : '--'}
                        </StripValue>
                    </StripTile>
                    <StripTile theme={theme}>
                        <StripLabel theme={theme}>Sentiment</StripLabel>
                        <StripValue theme={theme}>
                            {snapshot.sentimentMood || (snapshot.loading ? '...' : '--')}
                        </StripValue>
                    </StripTile>
                    <StripTile theme={theme}>
                        <StripLabel theme={theme}>Smart Money</StripLabel>
                        <StripValue theme={theme} $c={
                            snapshot.smartMoney?.includes('Bullish') ? '#10b981'
                            : snapshot.smartMoney?.includes('Bearish') ? '#ef4444'
                            : '#94a3b8'
                        }>
                            {snapshot.smartMoney || (snapshot.loading ? '...' : '--')}
                        </StripValue>
                    </StripTile>
                    <StripTile theme={theme}>
                        <StripLabel theme={theme}>Setups</StripLabel>
                        <StripValue theme={theme} $c="#a78bfa">
                            {snapshot.opportunityCount ?? '--'} active
                        </StripValue>
                    </StripTile>
                </MarketStrip>

                {/* ═══ MARKET FILTER TOGGLE ═══ */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '.4rem',
                    margin: '0 0 1.25rem',
                    padding: '.35rem',
                    background: theme?.bg?.card || 'rgba(30, 41, 59, 0.7)',
                    borderRadius: '12px',
                    border: `1px solid ${theme?.border?.card || 'rgba(100, 116, 139, 0.2)'}`,
                    width: 'fit-content',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}>
                    {[
                        { id: 'all',    label: 'All',    icon: <Layers size={13} /> },
                        { id: 'stocks', label: 'Stocks', icon: <BarChart3 size={13} /> },
                        { id: 'crypto', label: 'Crypto', icon: <Bitcoin size={13} /> },
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setMarketFilter(opt.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '.4rem',
                                padding: '.55rem 1.1rem',
                                borderRadius: '9px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '.82rem',
                                fontWeight: 700,
                                letterSpacing: '.02em',
                                transition: 'all .15s ease',
                                background: marketFilter === opt.id
                                    ? (theme?.brand?.gradient || 'linear-gradient(135deg, #00adef, #06b6d4)')
                                    : 'transparent',
                                color: marketFilter === opt.id
                                    ? '#fff'
                                    : (theme?.text?.secondary || '#94a3b8'),
                                boxShadow: marketFilter === opt.id
                                    ? '0 2px 12px rgba(0, 173, 237, 0.25)'
                                    : 'none'
                            }}
                        >
                            {opt.icon} {opt.label}
                        </button>
                    ))}
                </div>

                {/* ═══ BEST SETUP HERO ═══ */}
                {snapshot.loading ? (
                    <LoadingWrap theme={theme}>
                        <SpinningLoader size={20} style={{ marginBottom: '.5rem' }} />
                        <div>Finding the best trade right now...</div>
                    </LoadingWrap>
                ) : best ? (
                    <HeroCard theme={theme} $bias={best.bias}>
                        <HeroLabel theme={theme}><Sparkles size={11} /> 🔥 BEST SETUP RIGHT NOW</HeroLabel>
                        <HeroBody>
                            <HeroSymBlock $bias={best.bias}>
                                <HeroSym theme={theme}>{best.symbol}</HeroSym>
                                <HeroBias $long={isLong}>
                                    {isLong ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                    {isLong ? 'LONG' : 'SHORT'}
                                </HeroBias>
                            </HeroSymBlock>
                            <HeroDetails>
                                <HeroSetup theme={theme}>
                                    {best.setupLabel || 'Active Setup'}
                                </HeroSetup>
                                <HeroMeta theme={theme}>
                                    AI Score <HeroScore $v={best.aiScore}>{best.aiScore}</HeroScore>
                                    · Confidence {best.confidence}%
                                </HeroMeta>
                                <HeroWhy theme={theme}>{best.whySurfaced}</HeroWhy>
                                <HeroPlan>
                                    <PlanBox theme={theme}>
                                        <PlanLabel theme={theme}>Entry</PlanLabel>
                                        <PlanValue theme={theme}>{fmtPrice(best.entry)}</PlanValue>
                                    </PlanBox>
                                    <PlanBox theme={theme}>
                                        <PlanLabel theme={theme}>Stop Loss</PlanLabel>
                                        <PlanValue theme={theme} $c="#ef4444">{fmtPrice(best.sl)}</PlanValue>
                                    </PlanBox>
                                    <PlanBox theme={theme}>
                                        <PlanLabel theme={theme}>Target</PlanLabel>
                                        <PlanValue theme={theme} $c="#10b981">{fmtPrice(best.tp3)}</PlanValue>
                                    </PlanBox>
                                    <PlanBox theme={theme}>
                                        <PlanLabel theme={theme}>R / R</PlanLabel>
                                        <PlanValue theme={theme} $c={theme?.brand?.primary || '#00adef'}>1:{best.rr || '--'}</PlanValue>
                                    </PlanBox>
                                </HeroPlan>
                                <HeroCTAs>
                                    <PrimaryCTA onClick={() => goToSetup(best)}>
                                        View Trade Setup <ChevronRight size={14} />
                                    </PrimaryCTA>
                                    <SecondaryCTA theme={theme} onClick={() => copyToPaper(best)}>
                                        Copy to Paper Trade
                                    </SecondaryCTA>
                                </HeroCTAs>
                            </HeroDetails>
                        </HeroBody>
                    </HeroCard>
                ) : (
                    <HeroEmpty theme={theme}>
                        <HeroEmptyTitle theme={theme}>No high-conviction setups right now</HeroEmptyTitle>
                        <div>The Engine is scanning for new opportunities. Check back in a few minutes or browse the Opportunity Engine.</div>
                        <SecondaryCTA theme={theme} onClick={() => navigate('/opportunities')} style={{ marginTop: '1rem' }}>
                            Browse Opportunity Engine <ChevronRight size={14} />
                        </SecondaryCTA>
                    </HeroEmpty>
                )}

                {/* ═══ LIVE CHART for the Best Setup ═══ */}
                {best?.symbol && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <TradingChart
                            symbol={best.symbol}
                            isCrypto={!!best.isCrypto}
                            defaultTimeframe="1D"
                            signal={{
                                entry: best.entry,
                                sl: best.sl,
                                tp1: best.tp1,
                                tp2: best.tp2,
                                tp3: best.tp3
                            }}
                            height={440}
                        />
                    </div>
                )}

                {/* ═══ WHAT YOU SHOULD DO ═══ */}
                {recommendedActions.length > 0 && (
                    <WhatToDoCard theme={theme}>
                        <WhatToDoTitle theme={theme}><Target size={11} /> 🎯 WHAT YOU SHOULD DO</WhatToDoTitle>
                        {recommendedActions.map((a, i) => (
                            <ActionRow
                                key={`${a.kind}-${i}`}
                                theme={theme}
                                $accent={a.color}
                                onClick={() => goToSetup(a.data)}
                            >
                                <ActionLabel $c={a.color}>{a.label}</ActionLabel>
                                <ActionContent>
                                    <ActionSym theme={theme}>{a.symbol}</ActionSym>
                                    <ActionWhy theme={theme}>{a.why}</ActionWhy>
                                </ActionContent>
                                <ChevronRight size={14} color={a.color} style={{ flexShrink: 0 }} />
                            </ActionRow>
                        ))}
                    </WhatToDoCard>
                )}

                {/* ═══ TWO-COL: Live Feed + AI Insight ═══ */}
                <TwoCol>
                    <PanelCard theme={theme}>
                        <PanelTitle $accent="#00adef"><Activity size={11} /> 🔥 LIVE OPPORTUNITY FEED</PanelTitle>
                        {filteredFeed.length === 0 ? (
                            <div style={{ fontSize: '.78rem', color: theme?.text?.tertiary || '#64748b', textAlign: 'center', padding: '1.5rem 0' }}>
                                No {marketFilter !== 'all' ? marketFilter : ''} opportunities to show.
                            </div>
                        ) : (
                            filteredFeed.slice(0, 8).map(o => {
                                const long = o.bias === 'long';
                                return (
                                    <FeedRow
                                        key={o.id || o.symbol}
                                        theme={theme}
                                        onClick={() => goToSetup(o)}
                                    >
                                        <FeedDot $long={long} />
                                        <div style={{ minWidth: 0 }}>
                                            <FeedSym theme={theme}>{o.symbol}</FeedSym>
                                            <FeedSetup theme={theme}>{o.setupLabel || 'Setup'}</FeedSetup>
                                        </div>
                                        <FeedBias $long={long}>{long ? 'LONG' : 'SHORT'}</FeedBias>
                                        <FeedScore $v={o.aiScore}>AI {o.aiScore}</FeedScore>
                                        <ChevronRight size={12} style={{ color: theme?.text?.tertiary || '#64748b' }} />
                                    </FeedRow>
                                );
                            })
                        )}
                    </PanelCard>

                    <PanelCard theme={theme}>
                        <PanelTitle $accent="#a78bfa"><Brain size={11} /> 🧠 AI INSIGHT</PanelTitle>
                        <InsightContent theme={theme}>
                            {snapshot.insight || 'The Engine is processing market data — insights will appear here as patterns form.'}
                        </InsightContent>
                        <InsightCTA onClick={() => navigate('/opportunities')}>
                            Browse Opportunities <ChevronRight size={11} />
                        </InsightCTA>
                    </PanelCard>
                </TwoCol>

                {/* ═══ FEATURE CARDS (upgraded) ═══ */}
                <FeatureGrid>
                    <FeatureCard theme={theme} $accent="#00adef" onClick={() => navigate('/opportunities')}>
                        <FeatureIcon $accent="#00adef"><Sparkles size={18} /></FeatureIcon>
                        <FeatureLabel theme={theme}>Live Opportunities</FeatureLabel>
                        <FeatureStat theme={theme}>
                            <FeatureStatStrong $c="#10b981">{snapshot.opportunityCount ?? '--'}</FeatureStatStrong> active setups
                        </FeatureStat>
                    </FeatureCard>
                    <FeatureCard theme={theme} $accent="#a78bfa" onClick={() => navigate('/patterns')}>
                        <FeatureIcon $accent="#a78bfa"><Brain size={18} /></FeatureIcon>
                        <FeatureLabel theme={theme}>Pattern Intelligence</FeatureLabel>
                        <FeatureStat theme={theme}>
                            Live chart pattern detection
                        </FeatureStat>
                    </FeatureCard>
                    <FeatureCard theme={theme} $accent="#f59e0b" onClick={() => navigate('/pulse')}>
                        <FeatureIcon $accent="#f59e0b"><BarChart3 size={18} /></FeatureIcon>
                        <FeatureLabel theme={theme}>Market Pulse</FeatureLabel>
                        <FeatureStat theme={theme}>
                            {snapshot.marketState?.label || 'Real-time market state'}
                        </FeatureStat>
                    </FeatureCard>
                    <FeatureCard theme={theme} $accent="#10b981" onClick={() => navigate('/paper-trading')}>
                        <FeatureIcon $accent="#10b981"><DollarSign size={18} /></FeatureIcon>
                        <FeatureLabel theme={theme}>Paper Trading</FeatureLabel>
                        <FeatureStat theme={theme}>
                            <FeatureStatStrong $c={isPositive ? '#10b981' : '#ef4444'}>
                                {isPositive ? '+' : ''}{fmtPct(totalPLPct)}
                            </FeatureStatStrong> · {totalTrades} trades
                        </FeatureStat>
                    </FeatureCard>
                    <FeatureCard theme={theme} $accent="#0ea5e9" onClick={() => navigate('/backtesting')}>
                        <FeatureIcon $accent="#0ea5e9"><Target size={18} /></FeatureIcon>
                        <FeatureLabel theme={theme}>Strategy Lab</FeatureLabel>
                        <FeatureStat theme={theme}>
                            6 presets · test your strategy
                        </FeatureStat>
                    </FeatureCard>
                    <FeatureCard theme={theme} $accent="#ef4444" onClick={() => navigate('/smart-money')}>
                        <FeatureIcon $accent="#ef4444"><Eye size={18} /></FeatureIcon>
                        <FeatureLabel theme={theme}>Smart Money</FeatureLabel>
                        <FeatureStat theme={theme}>
                            {snapshot.smartMoney || 'Track institutional flow'}
                        </FeatureStat>
                    </FeatureCard>
                </FeatureGrid>

                {/* ═══ PERFORMANCE + LEADERBOARD ═══ */}
                <PerfRow>
                    <PanelCard theme={theme}>
                        <PanelTitle $accent="#10b981"><Trophy size={11} /> YOUR PERFORMANCE</PanelTitle>
                        <div style={{ fontSize: '.7rem', color: theme?.text?.tertiary || '#64748b', fontWeight: 700 }}>
                            Paper Account
                        </div>
                        <PerfBig $pos={isPositive}>
                            {isPositive ? '+' : ''}{fmtMoney(totalPL)}
                        </PerfBig>
                        <div style={{ fontSize: '.85rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: 800 }}>
                            {fmtPct(totalPLPct)} all-time
                        </div>
                        <PerfMeta theme={theme}>
                            <PerfMetaItem>
                                <span>Portfolio</span>
                                <PerfMetaVal theme={theme}>{fmtMoney(portfolioValue)}</PerfMetaVal>
                            </PerfMetaItem>
                            <PerfMetaItem>
                                <span>Win Rate</span>
                                <PerfMetaVal theme={theme} $c={winRate >= 60 ? '#10b981' : winRate >= 45 ? '#f59e0b' : '#ef4444'}>
                                    {winRate.toFixed(0)}%
                                </PerfMetaVal>
                            </PerfMetaItem>
                            <PerfMetaItem>
                                <span>Trades</span>
                                <PerfMetaVal theme={theme}>{totalTrades}</PerfMetaVal>
                            </PerfMetaItem>
                            {userRank && (
                                <PerfMetaItem>
                                    <span>Rank</span>
                                    <PerfMetaVal theme={theme} $c="#a78bfa">#{userRank}</PerfMetaVal>
                                </PerfMetaItem>
                            )}
                        </PerfMeta>
                        {percentileText && (
                            <PerfTrust theme={theme}>
                                🏆 {percentileText}
                            </PerfTrust>
                        )}
                    </PanelCard>

                    <PanelCard theme={theme}>
                        <PanelTitle $accent="#f59e0b"><Trophy size={11} /> LEADERBOARD</PanelTitle>
                        {leaderboard.length === 0 ? (
                            <div style={{ fontSize: '.78rem', color: theme?.text?.tertiary || '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                                Leaderboard loading...
                            </div>
                        ) : (
                            leaderboard.slice(0, 5).map((entry, i) => {
                                const profit = entry.totalProfitLoss ?? entry.profitLoss ?? 0;
                                const name = entry.user?.name || entry.user?.username || 'Trader';
                                return (
                                    <LeaderRow key={entry._id || i} theme={theme}>
                                        <LeaderRank theme={theme}>#{entry.rank || i + 1}</LeaderRank>
                                        <LeaderName theme={theme}>{name}</LeaderName>
                                        <LeaderProfit $pos={profit >= 0}>
                                            {profit >= 0 ? '+' : ''}{fmtMoney(profit)}
                                        </LeaderProfit>
                                    </LeaderRow>
                                );
                            })
                        )}
                        {gapLine && <GapLine theme={theme}>{gapLine}</GapLine>}
                    </PanelCard>
                </PerfRow>

                {/* ═══ CHART (demoted) ═══ */}
                {chartData.length > 0 && (
                    <ChartCard theme={theme}>
                        <ChartHead>
                            <PanelTitle $accent="#00adef" style={{ margin: 0 }}>
                                <Activity size={11} /> {snapshot.chartSymbol || 'Chart'} · 1D
                            </PanelTitle>
                            <SecondaryCTA
                                theme={theme}
                                onClick={() => navigate(`/stock/${snapshot.chartSymbol}`)}
                                style={{ padding: '.4rem .85rem', fontSize: '.7rem' }}
                            >
                                Open Asset Page
                            </SecondaryCTA>
                        </ChartHead>
                        <ChartHeight>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00adef" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#00adef" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                                    <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} interval="preserveStartEnd" />
                                    <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} domain={['auto', 'auto']} width={50} />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#0f1729',
                                            border: '1px solid rgba(255,255,255,.12)',
                                            borderRadius: '8px',
                                            fontSize: '.78rem'
                                        }}
                                        formatter={(v) => fmtPrice(v)}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#00adef"
                                        strokeWidth={2}
                                        fill="url(#dashGrad)"
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartHeight>
                        {chartInsight && (
                            <ChartInsight theme={theme}>
                                <span>🧠 Trend: <ChartInsightStrong $c={chartInsight.trendColor}>{chartInsight.trend}</ChartInsightStrong></span>
                                <span>Momentum: <ChartInsightStrong $c={chartInsight.momentumColor}>{chartInsight.momentum}</ChartInsightStrong></span>
                                <span>Period: <ChartInsightStrong $c={chartInsight.change >= 0 ? '#10b981' : '#ef4444'}>{fmtPct(chartInsight.change)}</ChartInsightStrong></span>
                            </ChartInsight>
                        )}
                    </ChartCard>
                )}
            </Container>
        </Page>
    );
};

export default CommandCenterPage;
