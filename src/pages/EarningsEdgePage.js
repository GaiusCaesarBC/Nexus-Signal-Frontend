// client/src/pages/EarningsEdgePage.js
// Earnings Edge — earnings calendar redesigned as an opportunity engine.
// Replaces the legacy EarningsCalendarPage. Pulls a single fat snapshot
// from /api/earnings/intelligence which already enriches earnings with
// trade impact, expected moves, pre/post setup interpretation, etc.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Calendar, ChevronRight, ChevronLeft, RefreshCw, Sparkles, Brain,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Zap,
    Activity, Loader2, X, Clock
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
const fmtDate = (s) => {
    if (!s) return '--';
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const fmtDayName = (s) => {
    if (!s) return '--';
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
};
const timeAgo = (d) => {
    if (!d) return '--';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulseDot = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const glowBorder = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,.35); }
    50%      { box-shadow: 0 0 0 3px rgba(245,158,11,0); }
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
const H1 = styled.h1`
    font-size: 2.4rem;
    font-weight: 900;
    margin: 0 0 .35rem;
    background: ${p => p.theme?.brand?.gradient || 'linear-gradient(135deg, #f59e0b, #00adef)'};
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
    background: rgba(245, 158, 11, .06);
    border: 1px solid rgba(245, 158, 11, .25);
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

// ─── Section Title ───────────────────────────────────────
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

// ─── High Impact Strip ───────────────────────────────────
const HighImpactGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: .65rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
`;
const HiCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long' ? 'rgba(16,185,129,.3)'
        : p.$bias === 'short' ? 'rgba(239,68,68,.3)'
        : 'rgba(245,158,11,.25)'};
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
            : p.$bias === 'short'
            ? 'linear-gradient(90deg, transparent, #ef4444, transparent)'
            : 'linear-gradient(90deg, transparent, #f59e0b, transparent)'};
    }
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 28px ${p => p.$bias === 'long' ? 'rgba(16,185,129,.18)'
            : p.$bias === 'short' ? 'rgba(239,68,68,.18)'
            : 'rgba(245,158,11,.18)'};
    }
`;
const HiTop = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const HiSym = styled.div`
    font-size: 1.1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const Bias = styled.div`
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
const HiDate = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .55rem;
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const HiMetrics = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .35rem;
    margin-bottom: .65rem;
    padding: .55rem;
    background: rgba(255,255,255,.025);
    border-radius: 8px;
`;
const Metric = styled.div`text-align:center;`;
const MetricLabel = styled.div`
    font-size: .5rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .15rem;
`;
const MetricVal = styled.div`
    font-size: .85rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;
const HiInterp = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .65rem;
    min-height: 2.7em;
`;
const HiCTA = styled.button`
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
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '25'}; }
`;

// ─── Pre/Post Two-Column ─────────────────────────────────
const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .85rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards;`}
    @media(max-width:900px){grid-template-columns:1fr;}
`;
const PanelCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem 1.15rem;
    border-left: 3px solid ${p => p.$accent || '#a78bfa'};
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
const PanelRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .55rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    cursor: pointer;
    gap: .55rem;
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255,255,255,.02); }
`;
const PanelLeft = styled.div`
    display: flex;
    flex-direction: column;
    gap: .15rem;
    flex: 1;
    min-width: 0;
`;
const PanelSym = styled.div`
    font-size: .82rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const PanelDate = styled.span`
    font-size: .58rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const PanelInterp = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    line-height: 1.4;
`;
const PanelRight = styled.div`
    flex-shrink: 0;
    text-align: right;
`;
const BeatBadge = styled.span`
    display: inline-block;
    padding: .15rem .4rem;
    background: ${p => p.$beat ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color: ${p => p.$beat ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$beat ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
    border-radius: 4px;
    font-size: .55rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
    margin-bottom: .15rem;
`;
const Surprise = styled.div`
    font-size: .75rem;
    font-weight: 900;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
`;
const SmallScore = styled.div`
    font-size: .68rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
`;
const PanelEmpty = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    text-align: center;
    padding: 1.25rem .5rem;
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

// ─── Calendar Body Layout ────────────────────────────────
const Body = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 1.25rem;
    @media(max-width:1100px){grid-template-columns:1fr;}
`;
const CalCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
`;
const CalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;
const CalTitle = styled.div`
    font-size: 1.05rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const CalNav = styled.div`
    display: flex;
    gap: .35rem;
`;
const NavBtn = styled.button`
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
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
const WeekdayRow = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: .35rem;
    margin-bottom: .35rem;
`;
const WeekdayCell = styled.div`
    text-align: center;
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    padding: .35rem 0;
`;
const DayGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: .35rem;
`;
const DayCell = styled.button`
    aspect-ratio: 1;
    min-height: 70px;
    background: ${p => p.$today
        ? (p.theme?.brand?.primary || '#00adef') + '12'
        : p.$inMonth
        ? 'rgba(255,255,255,.02)'
        : 'transparent'};
    border: 1px solid ${p => p.$today
        ? (p.theme?.brand?.primary || '#00adef') + '60'
        : p.$highImpact
        ? 'rgba(245,158,11,.5)'
        : 'rgba(255,255,255,.06)'};
    border-radius: 9px;
    padding: .35rem .4rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    transition: all .15s;
    color: ${p => p.$inMonth ? (p.theme?.text?.primary || '#e0e6ed') : (p.theme?.text?.tertiary || '#475569')};
    position: relative;
    ${p => p.$highImpact && css`animation: ${glowBorder} 4s ease-in-out infinite;`}
    &:hover {
        transform: translateY(-1px);
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '80'};
        z-index: 2;
    }
    &:disabled {
        cursor: default;
        opacity: .55;
        transform: none;
    }
`;
const DayNum = styled.div`
    font-size: .8rem;
    font-weight: 800;
    color: ${p => p.$past ? (p.theme?.text?.tertiary || '#64748b') : 'inherit'};
`;
const DayBadge = styled.div`
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: .25rem;
    font-size: .58rem;
    font-weight: 800;
    color: ${p => p.$highImpact ? '#f59e0b' : (p.theme?.text?.secondary || '#94a3b8')};
`;
const DayTickers = styled.div`
    font-size: .55rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-top: .15rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
const TradeableDot = styled.span`
    position: absolute;
    top: 5px;
    right: 5px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px rgba(16,185,129,.6);
`;

// ─── Sidebar ─────────────────────────────────────────────
const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: .85rem;
    @media(max-width:1100px){margin-top:1rem;}
`;
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
const SummaryRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: .35rem 0;
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    &:last-child { border-bottom: none; }
`;
const SummaryVal = styled.span`
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    font-weight: 800;
`;
const Next7Row = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .55rem .65rem;
    background: ${p => p.$highImpact ? 'rgba(245,158,11,.06)' : 'transparent'};
    border: none;
    border-radius: 8px;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    cursor: pointer;
    text-align: left;
    margin-bottom: .25rem;
    transition: all .15s;
    &:hover { background: rgba(255,255,255,.03); }
`;
const Next7Day = styled.div`
    display: flex;
    flex-direction: column;
    gap: .1rem;
`;
const Next7Name = styled.span`
    font-size: .72rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
`;
const Next7Sub = styled.span`
    font-size: .6rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const Next7Count = styled.span`
    font-size: .72rem;
    font-weight: 900;
    color: ${p => p.$hi ? '#f59e0b' : (p.theme?.text?.tertiary || '#94a3b8')};
`;
const VolRow = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .5rem 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    cursor: pointer;
    text-align: left;
    &:last-child { border-bottom: none; }
    &:hover { background: rgba(255,255,255,.015); }
`;
const VolSym = styled.div`
    font-size: .78rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const VolDate = styled.div`
    font-size: .58rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const VolMove = styled.div`
    font-size: .85rem;
    font-weight: 900;
    color: #f59e0b;
`;

// ─── Day Drawer ──────────────────────────────────────────
const DrawerOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(4px);
    z-index: 998;
    ${css`animation: ${fadeIn} .2s ease-out;`}
`;
const Drawer = styled.div`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 460px;
    max-width: 100vw;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.97)'};
    border-left: 1px solid rgba(255,255,255,.08);
    z-index: 999;
    overflow-y: auto;
    padding: 1.5rem 1.75rem;
    ${css`animation: ${fadeIn} .25s ease-out;`}
`;
const DrawerHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;
const DrawerTitle = styled.div`
    font-size: 1.15rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const DrawerSub = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .15rem;
`;
const DrawerClose = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
        color: ${p => p.theme?.brand?.primary || '#00adef'};
    }
`;
const DrawerEarning = styled.div`
    background: rgba(255,255,255,.025);
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.06)'};
    border-radius: 12px;
    padding: .85rem 1rem;
    margin-bottom: .65rem;
    border-left: 3px solid ${p => p.$bias === 'long' ? '#10b981'
        : p.$bias === 'short' ? '#ef4444'
        : 'rgba(245,158,11,.4)'};
    cursor: pointer;
    transition: all .15s;
    &:hover { transform: translateX(3px); }
`;
const DrawerETop = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .25rem;
`;
const DrawerESym = styled.div`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const DrawerESmall = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .35rem;
    display: flex;
    gap: .8rem;
    flex-wrap: wrap;
`;

// ─── Methodology + loading ───────────────────────────────
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
const EarningsEdgePage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMonth, setViewMonth] = useState(() => new Date());
    const [drawerDate, setDrawerDate] = useState(null);

    const filters = useMemo(() => ({
        sector: searchParams.get('sector') || 'all',
        marketCap: searchParams.get('marketCap') || 'all',
        minMove: searchParams.get('minMove') || '',
        highImpactOnly: searchParams.get('highImpactOnly') === '1',
        hasLiveSetup: searchParams.get('hasLiveSetup') === '1'
    }), [searchParams]);

    const updateFilter = useCallback((key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all' || value === '' || value === false) next.delete(key);
        else next.set(key, value === true ? '1' : value);
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const buildQs = useCallback(() => {
        const q = new URLSearchParams();
        if (filters.sector !== 'all') q.set('sector', filters.sector);
        if (filters.marketCap !== 'all') q.set('marketCap', filters.marketCap);
        if (filters.minMove) q.set('minMove', filters.minMove);
        if (filters.highImpactOnly) q.set('highImpactOnly', '1');
        if (filters.hasLiveSetup) q.set('hasLiveSetup', '1');
        return q.toString();
    }, [filters]);

    const fetchData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        try {
            const path = `/earnings/intelligence?${buildQs()}`;
            const data = api
                ? (await api.get(path)).data
                : await (await fetch(`${API_URL}${path}`)).json();
            setSnapshot(data);
        } catch (e) {
            console.error('[EarningsEdge] Fetch failed:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, buildQs]);

    useEffect(() => { fetchData(true); }, [fetchData]);
    useEffect(() => {
        const iv = setInterval(() => fetchData(false), 120000);
        return () => clearInterval(iv);
    }, [fetchData]);

    const goToTrade = (signalId, symbol, isCrypto) => {
        if (signalId) navigate(`/signal/${signalId}`);
        else if (symbol) navigate(isCrypto ? `/crypto/${symbol}` : `/stock/${symbol}`);
    };

    // ─── Calendar grid math ─────────────────────────────
    const calendarGrid = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const startDay = firstOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayStr = new Date().toISOString().split('T')[0];

        const dayMap = new Map();
        (snapshot?.calendarDays || []).forEach(d => dayMap.set(d.date, d));

        const cells = [];
        // Lead-in days from prev month
        for (let i = 0; i < startDay; i++) {
            const d = new Date(year, month, i - startDay + 1);
            cells.push({
                date: d.toISOString().split('T')[0],
                day: d.getDate(),
                inMonth: false
            });
        }
        // This month
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(year, month, day);
            const dateStr = d.toISOString().split('T')[0];
            const data = dayMap.get(dateStr) || {};
            cells.push({
                date: dateStr,
                day,
                inMonth: true,
                isToday: dateStr === todayStr,
                isPast: dateStr < todayStr,
                count: data.count || 0,
                isHighImpact: data.isHighImpact || false,
                tradeable: data.tradeable || 0,
                topTickers: data.topTickers || [],
                earnings: data.earnings || []
            });
        }
        // Trail to fill the last week
        const trail = (7 - (cells.length % 7)) % 7;
        for (let i = 0; i < trail; i++) {
            const d = new Date(year, month + 1, i + 1);
            cells.push({
                date: d.toISOString().split('T')[0],
                day: d.getDate(),
                inMonth: false
            });
        }
        return cells;
    }, [viewMonth, snapshot]);

    const drawerEarnings = useMemo(() => {
        if (!drawerDate || !snapshot?.calendarDays) return [];
        const day = snapshot.calendarDays.find(d => d.date === drawerDate);
        if (!day) return [];
        return [...day.earnings].sort((a, b) => b.impactScore - a.impactScore);
    }, [drawerDate, snapshot]);

    const weekStats = snapshot?.weekStats || {};
    const monthSummary = snapshot?.monthSummary || {};
    const highImpact = snapshot?.highImpact || [];
    const preEarnings = snapshot?.preEarnings || [];
    const postEarnings = snapshot?.postEarnings || [];
    const next7Days = snapshot?.next7Days || [];
    const volatilityInsight = snapshot?.volatilityInsight || [];

    return (
        <Page theme={theme}>
            <SEO
                title="Earnings Edge — Nexus Signal AI"
                description="Earnings ranked by trade impact — find the setups forming before, during, and after the print."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Calendar size={28} color="#f59e0b" />
                            Earnings Edge
                        </H1>
                        <Subhead theme={theme}>
                            Earnings ranked by trade impact — find the setups forming before, during, and after the print.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Live · {weekStats.total ?? '--'} this week · {weekStats.tradeable ?? 0} tradeable
                    </StatusPill>
                </HeaderRow>

                {/* ═══ NO DATA EMPTY STATE ═══ */}
                {!loading && snapshot && (snapshot.weekStats?.total ?? 0) === 0 && (snapshot.calendarDays?.length ?? 0) === 0 && (
                    <div style={{
                        background: theme?.bg?.elevated || 'rgba(12,16,32,.92)',
                        border: '1px dashed rgba(245,158,11,.3)',
                        borderRadius: 14,
                        padding: '2rem 1.5rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        color: theme?.text?.secondary || '#94a3b8'
                    }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: theme?.text?.primary || '#fff', marginBottom: '.5rem' }}>
                            No earnings data available right now
                        </div>
                        <div style={{ fontSize: '.82rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
                            The earnings provider returned an empty result for this date range. This usually means the API tier has limited
                            calendar access or the service is rate-limited. Try refreshing in a moment, or check back during US market hours
                            when most earnings prints occur.
                        </div>
                    </div>
                )}

                {/* ═══ HIGH IMPACT THIS WEEK ═══ */}
                {loading ? (
                    <LoadingWrap theme={theme}>
                        <SpinningLoader size={20} style={{ marginBottom: '.5rem' }} />
                        <div>Loading earnings intelligence...</div>
                    </LoadingWrap>
                ) : highImpact.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Sparkles size={15} color="#f59e0b" />
                            🔥 High-Impact This Week
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Top earnings ranked by market cap × expected move × live trade signal
                        </SectionSub>
                        <HighImpactGrid>
                            {highImpact.map(e => {
                                const isLong = e.aiBias === 'long';
                                const isShort = e.aiBias === 'short';
                                return (
                                    <HiCard
                                        key={`${e.symbol}-${e.date}`}
                                        theme={theme}
                                        $bias={e.aiBias}
                                        onClick={() => goToTrade(e.signalId, e.symbol, e.isCrypto)}
                                    >
                                        <HiTop>
                                            <HiSym theme={theme}>{e.symbol}</HiSym>
                                            {e.aiBias ? (
                                                <Bias $long={isLong} $short={isShort}>
                                                    {isLong ? <ArrowUpRight size={9} /> : isShort ? <ArrowDownRight size={9} /> : null}
                                                    {(e.aiBias || 'NEUTRAL').toUpperCase()}
                                                </Bias>
                                            ) : (
                                                <Bias>NO SETUP</Bias>
                                            )}
                                        </HiTop>
                                        <HiDate theme={theme}>
                                            <Calendar size={9} />
                                            {fmtDayName(e.date)} {fmtDate(e.date)} · {e.hourLabel}
                                        </HiDate>
                                        <HiMetrics>
                                            <Metric>
                                                <MetricLabel theme={theme}>Expected</MetricLabel>
                                                <MetricVal $c="#f59e0b">±{e.expectedMove}%</MetricVal>
                                            </Metric>
                                            <Metric>
                                                <MetricLabel theme={theme}>AI Score</MetricLabel>
                                                <MetricVal $c={e.aiScore >= 80 ? '#10b981' : e.aiScore >= 65 ? '#f59e0b' : '#94a3b8'}>
                                                    {e.aiScore || '--'}
                                                </MetricVal>
                                            </Metric>
                                        </HiMetrics>
                                        <HiInterp theme={theme}>
                                            {e.aiWhy || (e.expectedMove >= 7
                                                ? `High-volatility print expected — ±${e.expectedMove}% move priced in`
                                                : `${e.sector} earnings — watch for ${isLong ? 'bullish' : isShort ? 'bearish' : 'directional'} reaction`)}
                                        </HiInterp>
                                        <HiCTA theme={theme}>
                                            {e.hasLiveSignal ? 'View Trade Setup' : 'Analyze'} <ChevronRight size={11} />
                                        </HiCTA>
                                    </HiCard>
                                );
                            })}
                        </HighImpactGrid>
                    </>
                )}

                {/* ═══ PRE / POST PANELS ═══ */}
                {(preEarnings.length > 0 || postEarnings.length > 0) && (
                    <TwoCol>
                        <PanelCard theme={theme} $accent="#a78bfa">
                            <PanelTitle $accent="#a78bfa">
                                <Zap size={11} /> ⚡ FORMING BEFORE EARNINGS
                            </PanelTitle>
                            {preEarnings.length === 0 ? (
                                <PanelEmpty theme={theme}>No high-conviction pre-earnings setups detected this week.</PanelEmpty>
                            ) : (
                                preEarnings.map(e => (
                                    <PanelRow
                                        key={`pre-${e.symbol}-${e.date}`}
                                        theme={theme}
                                        onClick={() => goToTrade(e.signalId, e.symbol, e.isCrypto)}
                                    >
                                        <PanelLeft>
                                            <PanelSym theme={theme}>
                                                {e.symbol}
                                                <PanelDate theme={theme}>{fmtDate(e.date)} · {e.hourLabel}</PanelDate>
                                            </PanelSym>
                                            <PanelInterp theme={theme}>{e.interpretation}</PanelInterp>
                                        </PanelLeft>
                                        <PanelRight>
                                            {e.aiScore && <SmallScore $v={e.aiScore}>AI {e.aiScore}</SmallScore>}
                                        </PanelRight>
                                    </PanelRow>
                                ))
                            )}
                        </PanelCard>

                        <PanelCard theme={theme} $accent="#10b981">
                            <PanelTitle $accent="#10b981">
                                <Activity size={11} /> 📊 RECENT REACTIONS
                            </PanelTitle>
                            {postEarnings.length === 0 ? (
                                <PanelEmpty theme={theme}>No recent earnings reactions tracked yet.</PanelEmpty>
                            ) : (
                                postEarnings.map(e => (
                                    <PanelRow
                                        key={`post-${e.symbol}-${e.date}`}
                                        theme={theme}
                                        onClick={() => goToTrade(e.signalId, e.symbol, e.isCrypto)}
                                    >
                                        <PanelLeft>
                                            <PanelSym theme={theme}>
                                                {e.symbol}
                                                <PanelDate theme={theme}>{fmtDate(e.date)}</PanelDate>
                                            </PanelSym>
                                            <PanelInterp theme={theme}>{e.interpretation}</PanelInterp>
                                        </PanelLeft>
                                        <PanelRight>
                                            <BeatBadge $beat={e.hasBeat}>{e.hasBeat ? 'BEAT' : 'MISS'}</BeatBadge>
                                            {e.surprise !== null && (
                                                <Surprise $pos={e.surprise >= 0}>
                                                    {e.surprise >= 0 ? '+' : ''}{e.surprise}%
                                                </Surprise>
                                            )}
                                        </PanelRight>
                                    </PanelRow>
                                ))
                            )}
                        </PanelCard>
                    </TwoCol>
                )}

                {/* ═══ FILTERS ═══ */}
                <FilterBar theme={theme}>
                    <Chip theme={theme} $active={filters.sector === 'all'} onClick={() => updateFilter('sector', 'all')}>All Sectors</Chip>
                    {['Tech', 'Healthcare', 'Financials', 'Consumer', 'Energy'].map(s => (
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
                    <Chip theme={theme} $active={filters.marketCap === 'mega'} onClick={() => updateFilter('marketCap', filters.marketCap === 'mega' ? 'all' : 'mega')}>Mega Cap</Chip>
                    <Chip theme={theme} $active={filters.marketCap === 'large'} onClick={() => updateFilter('marketCap', filters.marketCap === 'large' ? 'all' : 'large')}>Large+</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.minMove === '5'} onClick={() => updateFilter('minMove', filters.minMove === '5' ? '' : '5')}>Move 5%+</Chip>
                    <Chip theme={theme} $active={filters.minMove === '8'} onClick={() => updateFilter('minMove', filters.minMove === '8' ? '' : '8')}>Move 8%+</Chip>
                    <span style={{ width: 1, height: 24, background: 'rgba(255,255,255,.06)', margin: '0 .25rem' }} />
                    <Chip theme={theme} $active={filters.highImpactOnly} onClick={() => updateFilter('highImpactOnly', !filters.highImpactOnly)}>High Impact</Chip>
                    <Chip theme={theme} $active={filters.hasLiveSetup} onClick={() => updateFilter('hasLiveSetup', !filters.hasLiveSetup)}>Has Live Setup</Chip>
                </FilterBar>

                {/* ═══ BODY: CALENDAR + SIDEBAR ═══ */}
                <Body>
                    <CalCard theme={theme}>
                        <CalHeader>
                            <CalTitle theme={theme}>
                                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                            </CalTitle>
                            <CalNav>
                                <NavBtn theme={theme} onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                                    <ChevronLeft size={15} />
                                </NavBtn>
                                <NavBtn theme={theme} onClick={() => setViewMonth(new Date())}>
                                    Today
                                </NavBtn>
                                <NavBtn theme={theme} onClick={() => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                                    <ChevronRight size={15} />
                                </NavBtn>
                            </CalNav>
                        </CalHeader>
                        <WeekdayRow>
                            {WEEKDAYS.map(d => <WeekdayCell key={d} theme={theme}>{d}</WeekdayCell>)}
                        </WeekdayRow>
                        <DayGrid>
                            {calendarGrid.map((cell, i) => (
                                <DayCell
                                    key={`${cell.date}-${i}`}
                                    theme={theme}
                                    $inMonth={cell.inMonth}
                                    $today={cell.isToday}
                                    $highImpact={cell.isHighImpact}
                                    disabled={!cell.inMonth || cell.count === 0}
                                    onClick={() => cell.count > 0 && setDrawerDate(cell.date)}
                                >
                                    <DayNum theme={theme} $past={cell.isPast}>{cell.day}</DayNum>
                                    {cell.tradeable > 0 && <TradeableDot />}
                                    {cell.count > 0 && (
                                        <>
                                            <DayBadge theme={theme} $highImpact={cell.isHighImpact}>
                                                {cell.isHighImpact ? '⚡' : '📊'} {cell.count}
                                            </DayBadge>
                                            {cell.topTickers && cell.topTickers.length > 0 && (
                                                <DayTickers theme={theme}>{cell.topTickers.slice(0, 2).join(' · ')}</DayTickers>
                                            )}
                                        </>
                                    )}
                                </DayCell>
                            ))}
                        </DayGrid>
                    </CalCard>

                    {/* Sidebar */}
                    <Sidebar>
                        <SideCard theme={theme}>
                            <SideTitle $accent="#f59e0b">
                                <Calendar size={11} /> THIS MONTH
                            </SideTitle>
                            <SummaryRow theme={theme}>
                                <span>Total earnings</span>
                                <SummaryVal theme={theme}>{monthSummary.total ?? 0}</SummaryVal>
                            </SummaryRow>
                            <SummaryRow theme={theme}>
                                <span>High-impact</span>
                                <SummaryVal theme={theme} $c="#f59e0b">{monthSummary.highImpact ?? 0}</SummaryVal>
                            </SummaryRow>
                            <SummaryRow theme={theme}>
                                <span>Tradeable today</span>
                                <SummaryVal theme={theme} $c="#10b981">{monthSummary.tradeableToday ?? 0}</SummaryVal>
                            </SummaryRow>
                            {monthSummary.biggestMovers && monthSummary.biggestMovers.length > 0 && (
                                <SummaryRow theme={theme}>
                                    <span>Biggest movers</span>
                                    <SummaryVal theme={theme}>{monthSummary.biggestMovers.join(' · ')}</SummaryVal>
                                </SummaryRow>
                            )}
                        </SideCard>

                        <SideCard theme={theme}>
                            <SideTitle $accent="#a78bfa">
                                <Clock size={11} /> NEXT 7 DAYS
                            </SideTitle>
                            {next7Days.length === 0 ? (
                                <PanelEmpty theme={theme}>No earnings in the next 7 days.</PanelEmpty>
                            ) : (
                                next7Days.map(d => (
                                    <Next7Row
                                        key={d.date}
                                        theme={theme}
                                        $highImpact={d.isHighImpact}
                                        onClick={() => setDrawerDate(d.date)}
                                    >
                                        <Next7Day>
                                            <Next7Name theme={theme}>{d.dayName} {fmtDate(d.date)}</Next7Name>
                                            <Next7Sub theme={theme}>
                                                {d.count > 0
                                                    ? `${d.topTickers.slice(0, 2).join(', ')}${d.tradeable > 0 ? ` · ${d.tradeable} tradeable` : ''}`
                                                    : 'No earnings'}
                                            </Next7Sub>
                                        </Next7Day>
                                        <Next7Count $hi={d.isHighImpact}>
                                            {d.count > 0 && (d.isHighImpact ? '⚡ ' : '')}{d.count || ''}
                                        </Next7Count>
                                    </Next7Row>
                                ))
                            )}
                        </SideCard>

                        {volatilityInsight.length > 0 && (
                            <SideCard theme={theme}>
                                <SideTitle $accent="#ef4444">
                                    💥 VOLATILITY INSIGHT
                                </SideTitle>
                                {volatilityInsight.map(v => (
                                    <VolRow
                                        key={`${v.symbol}-${v.date}`}
                                        theme={theme}
                                        onClick={() => goToTrade(v.signalId, v.symbol, v.isCrypto)}
                                    >
                                        <div>
                                            <VolSym theme={theme}>{v.symbol}</VolSym>
                                            <VolDate theme={theme}>{fmtDate(v.date)} · {v.hourLabel}</VolDate>
                                        </div>
                                        <VolMove>±{v.expectedMove}%</VolMove>
                                    </VolRow>
                                ))}
                            </SideCard>
                        )}
                    </Sidebar>
                </Body>

                {/* ═══ METHODOLOGY ═══ */}
                <Methodology theme={theme}>
                    <div>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How Earnings Edge works:</strong>{' '}
                        Every earning is enriched with expected move estimates, market cap tier, sector, and joined against the Opportunity Engine for live trade signals. Days with high-impact earnings or active setups glow orange. Click any day for the full breakdown.
                    </div>
                    <RefreshBtn theme={theme} onClick={() => fetchData(false)} disabled={refreshing}>
                        <SpinIcon size={12} $spinning={refreshing} />
                        {refreshing ? 'Refreshing...' : 'Refresh now'}
                    </RefreshBtn>
                </Methodology>
            </Container>

            {/* ═══ DAY DRAWER ═══ */}
            {drawerDate && (
                <>
                    <DrawerOverlay onClick={() => setDrawerDate(null)} />
                    <Drawer theme={theme}>
                        <DrawerHead>
                            <div>
                                <DrawerTitle theme={theme}>
                                    {fmtDayName(drawerDate)} · {fmtDate(drawerDate)}
                                </DrawerTitle>
                                <DrawerSub theme={theme}>
                                    {drawerEarnings.length} {drawerEarnings.length === 1 ? 'earning' : 'earnings'} · sorted by impact
                                </DrawerSub>
                            </div>
                            <DrawerClose theme={theme} onClick={() => setDrawerDate(null)}>
                                <X size={16} />
                            </DrawerClose>
                        </DrawerHead>
                        {drawerEarnings.length === 0 ? (
                            <PanelEmpty theme={theme}>No earnings on this day.</PanelEmpty>
                        ) : (
                            drawerEarnings.map(e => (
                                <DrawerEarning
                                    key={e.symbol}
                                    theme={theme}
                                    $bias={e.aiBias}
                                    onClick={() => goToTrade(e.signalId, e.symbol, e.isCrypto)}
                                >
                                    <DrawerETop>
                                        <DrawerESym theme={theme}>{e.symbol}</DrawerESym>
                                        {e.aiBias ? (
                                            <Bias $long={e.aiBias === 'long'} $short={e.aiBias === 'short'}>
                                                {(e.aiBias || 'NEUTRAL').toUpperCase()}
                                            </Bias>
                                        ) : (
                                            <Bias>NO SETUP</Bias>
                                        )}
                                    </DrawerETop>
                                    <DrawerESmall theme={theme}>
                                        <span><strong style={{ color: '#f59e0b' }}>±{e.expectedMove}%</strong> expected</span>
                                        <span>{e.hourLabel}</span>
                                        {e.aiScore && <span>AI <strong style={{ color: e.aiScore >= 80 ? '#10b981' : '#f59e0b' }}>{e.aiScore}</strong></span>}
                                        <span>{e.sector}</span>
                                    </DrawerESmall>
                                    {e.aiWhy && (
                                        <div style={{ fontSize: '.7rem', color: theme?.text?.tertiary || '#94a3b8', marginTop: '.45rem', lineHeight: 1.45 }}>
                                            {e.aiWhy}
                                        </div>
                                    )}
                                </DrawerEarning>
                            ))
                        )}
                    </Drawer>
                </>
            )}
        </Page>
    );
};

export default EarningsEdgePage;
