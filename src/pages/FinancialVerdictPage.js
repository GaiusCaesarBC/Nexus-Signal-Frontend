// client/src/pages/FinancialVerdictPage.js
// Financial Verdict — investment decision engine. Replaces the legacy
// CompanyFinancialsPage. Pulls a single fat snapshot from
// /api/financials/verdict/:symbol with health score, verdict,
// valuation, key insights, risk flags, sector comparison, and a
// trade bridge to the Opportunity Engine.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Brain, Search, Loader2, RefreshCw, ChevronRight, Sparkles,
    TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle,
    Activity, Target, DollarSign, Building2, BarChart3
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
const fmtBig = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${Math.round(n).toLocaleString()}`;
};
const fmtPct = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    // Values from AV come as decimals (0.18 = 18%)
    return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`;
};
const fmtNum = (n, d = 2) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    return Number(n).toFixed(d);
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

// ─── Search ──────────────────────────────────────────────
const SearchCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '30'};
    border-radius: 14px;
    padding: 1rem 1.15rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: .55rem;
    ${css`animation: ${fadeIn} .4s ease-out .03s backwards;`}
`;
const SearchInput = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .9rem;
    font-weight: 600;
    padding: .35rem 0;
    &::placeholder { color: ${p => p.theme?.text?.tertiary || '#64748b'}; font-weight: 500; }
`;
const AnalyzeBtn = styled.button`
    padding: .55rem 1.1rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    border: none;
    border-radius: 9px;
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

// ─── Company Header ──────────────────────────────────────
const CompanyCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
`;
const CompanyTop = styled.div`
    display: flex;
    align-items: baseline;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: .35rem;
`;
const CompanySym = styled.div`
    font-size: 2.2rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    line-height: 1;
`;
const CompanyName = styled.div`
    font-size: 1rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    font-weight: 600;
`;
const CompanyMeta = styled.div`
    display: flex;
    gap: 1.25rem;
    flex-wrap: wrap;
    font-size: .72rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .55rem;
`;
const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const MetaStrong = styled.strong`
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-weight: 800;
`;

// ─── Verdict Banner ──────────────────────────────────────
const VerdictCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => (p.$color || '#94a3b8') + '40'};
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
        background: linear-gradient(90deg, transparent, ${p => p.$color || '#94a3b8'}, transparent);
    }
`;
const VerdictHead = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
`;
const VerdictBlock = styled.div`
    flex-shrink: 0;
    width: 140px;
    padding: 1rem;
    background: ${p => (p.$color || '#94a3b8') + '12'};
    border: 1px solid ${p => (p.$color || '#94a3b8') + '35'};
    border-radius: 14px;
    text-align: center;
`;
const VerdictRating = styled.div`
    font-size: 1.85rem;
    font-weight: 900;
    color: ${p => p.$c || '#94a3b8'};
    line-height: 1;
`;
const VerdictDivider = styled.div`
    height: 1px;
    background: ${p => (p.$c || '#94a3b8') + '30'};
    margin: .55rem 0;
`;
const VerdictConfidence = styled.div`
    font-size: 1.2rem;
    font-weight: 900;
    color: ${p => p.$c || '#94a3b8'};
`;
const VerdictConfSub = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-top: .15rem;
`;
const VerdictText = styled.div`flex:1;min-width:240px;`;
const VerdictLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .35rem;
`;
const VerdictBig = styled.div`
    font-size: 1.85rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#fff')};
    margin-bottom: .55rem;
`;
const VerdictBullets = styled.div`
    display: flex;
    flex-direction: column;
    gap: .25rem;
`;
const VerdictBullet = styled.div`
    font-size: .82rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    display: flex;
    align-items: center;
    gap: .4rem;
`;

// ─── Three Card Row ──────────────────────────────────────
const ThreeRow = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .85rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
    @media(max-width:900px){grid-template-columns:1fr;}
`;
const TileCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.15rem 1.25rem;
    border-left: 3px solid ${p => p.$accent || '#a78bfa'};
`;
const TileLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.$accent || '#a78bfa'};
    font-weight: 800;
    margin-bottom: .55rem;
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const TileBig = styled.div`
    font-size: 1.6rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#fff')};
    line-height: 1;
    margin-bottom: .25rem;
`;
const TileSub = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    margin-bottom: .65rem;
`;
const ScoreBar = styled.div`
    height: 6px;
    background: rgba(255,255,255,.05);
    border-radius: 3px;
    overflow: hidden;
    margin: .25rem 0 .55rem;
`;
const ScoreFill = styled.div`
    height: 100%;
    width: ${p => p.$w}%;
    background: ${p => p.$w >= 70 ? '#10b981' : p.$w >= 50 ? '#f59e0b' : '#ef4444'};
    transition: width .8s ease-out;
`;
const SubScoreRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    padding: .25rem 0;
`;
const SubScoreVal = styled.span`
    color: ${p => p.$v >= 70 ? '#10b981' : p.$v >= 50 ? '#f59e0b' : '#ef4444'};
    font-weight: 800;
`;
const TileCTA = styled.button`
    margin-top: .65rem;
    width: 100%;
    padding: .5rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '15'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '35'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 8px;
    font-size: .68rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .3rem;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '25'}; }
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

// ─── Metrics Grid ────────────────────────────────────────
const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: .65rem;
    margin-bottom: 1.5rem;
`;
const MetricCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: 1rem 1.1rem;
`;
const MetricLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .4rem;
`;
const MetricValue = styled.div`
    font-size: 1.4rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    line-height: 1;
    margin-bottom: .55rem;
`;
const MetricInterp = styled.div`
    font-size: .68rem;
    color: ${p => p.$tone === 'pass' ? '#10b981'
        : p.$tone === 'warn' ? '#ef4444'
        : (p.theme?.text?.tertiary || '#94a3b8')};
    line-height: 1.4;
    display: flex;
    align-items: flex-start;
    gap: .25rem;
`;

// ─── Insights / Risks ────────────────────────────────────
const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .85rem;
    margin-bottom: 1.5rem;
    @media(max-width:800px){grid-template-columns:1fr;}
`;
const PanelCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    border-left: 3px solid ${p => p.$variant === 'insights' ? '#10b981' : '#f59e0b'};
`;
const PanelTitle = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.$variant === 'insights' ? '#10b981' : '#f59e0b'};
    font-weight: 800;
    margin-bottom: .65rem;
    display: flex;
    align-items: center;
    gap: .35rem;
`;
const PanelList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: .55rem;
`;
const PanelItem = styled.li`
    font-size: .78rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.45;
    padding-left: 1rem;
    position: relative;
    &::before {
        content: '${p => p.$variant === 'insights' ? '✓' : '⚠'}';
        position: absolute;
        left: 0;
        color: ${p => p.$variant === 'insights' ? '#10b981' : '#f59e0b'};
        font-weight: 800;
    }
`;

// ─── Sector Comparison Bars ──────────────────────────────
const ComparisonCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.15rem 1.35rem;
    margin-bottom: 1.5rem;
`;
const CompareRow = styled.div`
    display: grid;
    grid-template-columns: 130px 1fr 60px;
    gap: 1rem;
    align-items: center;
    margin-bottom: .85rem;
    &:last-child { margin-bottom: 0; }
    @media(max-width:600px){
        grid-template-columns: 1fr;
        gap: .35rem;
    }
`;
const CompareLabel = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    font-weight: 700;
`;
const BarTrack = styled.div`
    position: relative;
    height: 22px;
    background: rgba(255,255,255,.04);
    border-radius: 4px;
    overflow: hidden;
`;
const BarCompany = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${p => p.$w}%;
    background: linear-gradient(90deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    border-radius: 4px;
`;
const BarSector = styled.div`
    position: absolute;
    left: ${p => p.$at}%;
    top: -2px;
    bottom: -2px;
    width: 2px;
    background: rgba(255,255,255,.5);
`;
const CompareValue = styled.div`
    font-size: .82rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    text-align: right;
`;
const CompareSectorTag = styled.div`
    font-size: .58rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .15rem;
`;

// ─── Chart card ──────────────────────────────────────────
const ChartCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1.5rem;
`;
const ChartHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .85rem;
    flex-wrap: wrap;
    gap: .5rem;
`;
const ChartControls = styled.div`
    display: flex;
    gap: .35rem;
    flex-wrap: wrap;
`;
const ChartChip = styled.button`
    padding: .35rem .75rem;
    background: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '20'
        : 'transparent'};
    border: 1px solid ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '60'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    color: ${p => p.$active ? (p.theme?.brand?.primary || '#00adef') : (p.theme?.text?.secondary || '#94a3b8')};
    border-radius: 7px;
    font-size: .65rem;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
    &:hover { color: ${p => p.theme?.text?.primary || '#fff'}; }
`;
const AccelTag = styled.span`
    padding: .25rem .55rem;
    background: ${p => p.$tone === 'up' ? 'rgba(16,185,129,.12)'
        : p.$tone === 'down' ? 'rgba(239,68,68,.12)'
        : 'rgba(245,158,11,.12)'};
    color: ${p => p.$tone === 'up' ? '#10b981' : p.$tone === 'down' ? '#ef4444' : '#f59e0b'};
    border: 1px solid ${p => p.$tone === 'up' ? 'rgba(16,185,129,.25)'
        : p.$tone === 'down' ? 'rgba(239,68,68,.25)'
        : 'rgba(245,158,11,.25)'};
    border-radius: 5px;
    font-size: .58rem;
    font-weight: 800;
    text-transform: uppercase;
`;
const ChartHeight = styled.div`
    width: 100%;
    height: 280px;
`;

// ─── Empty / loading ─────────────────────────────────────
const Empty = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 14px;
    padding: 3rem 1.5rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
`;
const LoadingWrap = styled.div`
    padding: 4rem 2rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
`;

// ─── Methodology ─────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const FinancialVerdictPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialSym = searchParams.get('symbol') || 'AAPL';
    const [symbol, setSymbol] = useState(initialSym);
    const [searchInput, setSearchInput] = useState(initialSym);
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [chartView, setChartView] = useState('revenue');

    const fetchSymbol = useCallback(async (sym, showSpinner = true) => {
        if (!sym) return;
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        try {
            const path = `/financials/verdict/${encodeURIComponent(sym.toUpperCase())}`;
            const data = api
                ? (await api.get(path)).data
                : await (await fetch(`${API_URL}${path}`)).json();
            setSnapshot(data);
        } catch (e) {
            console.error('[FinancialVerdict] Fetch failed:', e);
            setSnapshot({ success: false, error: 'Failed to load' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api]);

    useEffect(() => { fetchSymbol(symbol, true); }, [symbol, fetchSymbol]);

    const handleSearch = () => {
        const sym = searchInput.trim().toUpperCase();
        if (!sym) return;
        setSymbol(sym);
        setSearchParams({ symbol: sym }, { replace: true });
    };

    const goToTrade = () => {
        const tb = snapshot?.tradeBridge;
        if (tb?.signalId) navigate(`/signal/${tb.signalId}`);
        else if (snapshot?.symbol) navigate(`/stock/${snapshot.symbol}`);
    };

    const verdict = snapshot?.verdict;
    const healthScore = snapshot?.healthScore;
    const valuation = snapshot?.valuation;
    const tradeBridge = snapshot?.tradeBridge;
    const metricsGrid = snapshot?.metricsGrid || [];
    const keyInsights = snapshot?.keyInsights || [];
    const riskFlags = snapshot?.riskFlags || [];
    const sectorComparison = snapshot?.sectorComparison;
    const chart = snapshot?.chart;

    // Chart data + axis label per view
    const chartData = useMemo(() => {
        if (!chart?.series) return [];
        return chart.series.map(point => ({
            year: point.year,
            value: point[chartView] ?? null,
            growth: chartView === 'revenue' ? point.revenueGrowthPct
                : chartView === 'netIncome' ? point.netIncomeGrowthPct
                : null
        }));
    }, [chart, chartView]);

    // Sector comparison bar widths — normalize to 100% relative to max
    const sectorBarsData = useMemo(() => {
        if (!sectorComparison) return [];
        return [
            {
                key: 'pe',
                label: 'P/E Ratio',
                company: sectorComparison.pe.company,
                sector: sectorComparison.pe.sector,
                fmt: (v) => v !== null ? Number(v).toFixed(1) : '--',
                inverse: true // lower P/E is better
            },
            {
                key: 'growth',
                label: 'Revenue Growth',
                company: sectorComparison.growth.company,
                sector: sectorComparison.growth.sector,
                fmt: (v) => v !== null ? `${Number(v).toFixed(0)}%` : '--'
            },
            {
                key: 'margin',
                label: 'Operating Margin',
                company: sectorComparison.operatingMargin.company,
                sector: sectorComparison.operatingMargin.sector,
                fmt: (v) => v !== null ? `${Number(v).toFixed(0)}%` : '--'
            },
            {
                key: 'roe',
                label: 'Return on Equity',
                company: sectorComparison.roe.company,
                sector: sectorComparison.roe.sector,
                fmt: (v) => v !== null ? `${Number(v).toFixed(0)}%` : '--'
            }
        ];
    }, [sectorComparison]);

    return (
        <Page theme={theme}>
            <SEO
                title="Financial Verdict — Nexus Signal AI"
                description="Every company scored, valued, and interpreted — know in 10 seconds whether it's worth investing in."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Brain size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            Financial Verdict
                        </H1>
                        <Subhead theme={theme}>
                            Every company scored, valued, and interpreted — know in 10 seconds whether it's worth investing in.
                        </Subhead>
                    </HeaderLeft>
                    {snapshot?.success && (
                        <StatusPill theme={theme}>
                            <StatusDot />
                            Verdict generated · {snapshot.sector || 'Unknown sector'}
                        </StatusPill>
                    )}
                </HeaderRow>

                {/* ═══ SEARCH ═══ */}
                <SearchCard theme={theme}>
                    <Search size={18} color={theme?.brand?.primary || '#00adef'} />
                    <SearchInput
                        theme={theme}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder="Search any stock (AAPL, NVDA, MSFT, TSLA...)"
                        disabled={loading}
                    />
                    <AnalyzeBtn theme={theme} onClick={handleSearch} disabled={loading || !searchInput.trim()}>
                        {loading ? <SpinningLoader size={13} /> : <Brain size={13} />}
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </AnalyzeBtn>
                </SearchCard>

                {/* ═══ LOADING / EMPTY ═══ */}
                {loading && !snapshot && (
                    <LoadingWrap theme={theme}>
                        <SpinningLoader size={20} style={{ marginBottom: '.5rem' }} />
                        <div>Generating verdict for {symbol}...</div>
                    </LoadingWrap>
                )}
                {!loading && (!snapshot || !snapshot.success) && (
                    <Empty theme={theme}>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed', fontSize: '.95rem' }}>
                            {snapshot?.error || `Could not load financials for ${symbol}`}
                        </strong><br />
                        Try a different ticker, or wait a moment if the data provider is rate-limited.
                    </Empty>
                )}

                {snapshot?.success && (
                    <>
                        {/* ═══ COMPANY HEADER ═══ */}
                        <CompanyCard theme={theme}>
                            <CompanyTop>
                                <CompanySym theme={theme}>{snapshot.symbol}</CompanySym>
                                <CompanyName theme={theme}>{snapshot.name}</CompanyName>
                            </CompanyTop>
                            <CompanyMeta theme={theme}>
                                <MetaItem><Building2 size={11} /> <MetaStrong theme={theme}>{snapshot.sector || 'Unknown'}</MetaStrong></MetaItem>
                                <MetaItem>{snapshot.industry || ''}</MetaItem>
                                <MetaItem>Market Cap <MetaStrong theme={theme}>{fmtBig(snapshot.marketCap)}</MetaStrong></MetaItem>
                            </CompanyMeta>
                        </CompanyCard>

                        {/* ═══ VERDICT BANNER ═══ */}
                        {verdict && (
                            <VerdictCard theme={theme} $color={verdict.color}>
                                <VerdictHead>
                                    <VerdictBlock $color={verdict.color}>
                                        <VerdictRating $c={verdict.color}>{verdict.rating}</VerdictRating>
                                        <VerdictDivider $c={verdict.color} />
                                        <VerdictConfidence $c={verdict.color}>{verdict.confidence}%</VerdictConfidence>
                                        <VerdictConfSub theme={theme}>Confidence</VerdictConfSub>
                                    </VerdictBlock>
                                    <VerdictText>
                                        <VerdictLabel theme={theme}>🧠 INVESTMENT VERDICT</VerdictLabel>
                                        <VerdictBig $c={verdict.color}>{verdict.label}</VerdictBig>
                                        <VerdictBullets>
                                            {keyInsights.slice(0, 2).map((s, i) => (
                                                <VerdictBullet key={i} theme={theme}>
                                                    <CheckCircle size={13} color="#10b981" />
                                                    {s}
                                                </VerdictBullet>
                                            ))}
                                            {riskFlags.slice(0, 1).map((r, i) => (
                                                <VerdictBullet key={`r${i}`} theme={theme}>
                                                    <AlertTriangle size={13} color="#f59e0b" />
                                                    {r}
                                                </VerdictBullet>
                                            ))}
                                        </VerdictBullets>
                                    </VerdictText>
                                </VerdictHead>
                            </VerdictCard>
                        )}

                        {/* ═══ THREE CARD ROW ═══ */}
                        <ThreeRow>
                            {/* Health Score */}
                            {healthScore && (
                                <TileCard theme={theme} $accent="#a78bfa">
                                    <TileLabel $accent="#a78bfa"><Activity size={11} /> FINANCIAL HEALTH</TileLabel>
                                    <TileBig theme={theme} $c={healthScore.overall >= 70 ? '#10b981' : healthScore.overall >= 50 ? '#f59e0b' : '#ef4444'}>
                                        {healthScore.overall} / 100
                                    </TileBig>
                                    <ScoreBar><ScoreFill $w={healthScore.overall} /></ScoreBar>
                                    <SubScoreRow theme={theme}>
                                        <span>Profitability</span>
                                        <SubScoreVal $v={healthScore.profitability}>{healthScore.profitability}</SubScoreVal>
                                    </SubScoreRow>
                                    <SubScoreRow theme={theme}>
                                        <span>Growth</span>
                                        <SubScoreVal $v={healthScore.growth}>{healthScore.growth}</SubScoreVal>
                                    </SubScoreRow>
                                    <SubScoreRow theme={theme}>
                                        <span>Efficiency</span>
                                        <SubScoreVal $v={healthScore.efficiency}>{healthScore.efficiency}</SubScoreVal>
                                    </SubScoreRow>
                                    <SubScoreRow theme={theme}>
                                        <span>Stability</span>
                                        <SubScoreVal $v={healthScore.stability}>{healthScore.stability}</SubScoreVal>
                                    </SubScoreRow>
                                </TileCard>
                            )}

                            {/* Valuation */}
                            {valuation && (
                                <TileCard theme={theme} $accent="#0ea5e9">
                                    <TileLabel $accent="#0ea5e9"><DollarSign size={11} /> VALUATION STATUS</TileLabel>
                                    <TileBig theme={theme} $c={valuation.status === 'undervalued' ? '#10b981'
                                        : valuation.status === 'overvalued' ? '#ef4444'
                                        : '#0ea5e9'}>
                                        {valuation.label}
                                    </TileBig>
                                    <TileSub theme={theme}>{valuation.sub}</TileSub>
                                </TileCard>
                            )}

                            {/* Trade Bridge */}
                            {tradeBridge && (
                                <TileCard theme={theme} $accent={tradeBridge.state === 'aligned' ? '#10b981'
                                    : tradeBridge.state === 'conflicting' ? '#ef4444'
                                    : '#94a3b8'}>
                                    <TileLabel $accent={tradeBridge.state === 'aligned' ? '#10b981'
                                        : tradeBridge.state === 'conflicting' ? '#ef4444'
                                        : '#94a3b8'}>
                                        <Target size={11} /> TRADE SIGNAL
                                    </TileLabel>
                                    <TileBig theme={theme} $c={tradeBridge.state === 'aligned' ? '#10b981'
                                        : tradeBridge.state === 'conflicting' ? '#ef4444'
                                        : (theme?.text?.primary || '#fff')}>
                                        {tradeBridge.state === 'aligned' && '🟢 '}
                                        {tradeBridge.state === 'conflicting' && '⚠ '}
                                        {tradeBridge.state === 'no_signal' && '➖ '}
                                        {tradeBridge.label}
                                    </TileBig>
                                    <TileSub theme={theme}>{tradeBridge.sub}</TileSub>
                                    {tradeBridge.signalId && (
                                        <TileCTA theme={theme} onClick={goToTrade}>
                                            View Trade Setup <ChevronRight size={11} />
                                        </TileCTA>
                                    )}
                                    {!tradeBridge.signalId && (
                                        <TileCTA theme={theme} onClick={goToTrade}>
                                            Open Asset Page <ChevronRight size={11} />
                                        </TileCTA>
                                    )}
                                </TileCard>
                            )}
                        </ThreeRow>

                        {/* ═══ METRICS GRID ═══ */}
                        {metricsGrid.length > 0 && (
                            <>
                                <SectionTitle theme={theme}>
                                    <BarChart3 size={15} color={theme?.brand?.primary || '#00adef'} />
                                    Key Metrics
                                </SectionTitle>
                                <SectionSub theme={theme}>
                                    Each metric interpreted in plain language — not just raw numbers
                                </SectionSub>
                                <MetricsGrid>
                                    {metricsGrid.map(m => {
                                        const interp = m.interpretation || { tone: 'mid', text: '' };
                                        const color = interp.tone === 'pass' ? '#10b981'
                                            : interp.tone === 'warn' ? '#ef4444'
                                            : (theme?.text?.primary || '#e0e6ed');
                                        const formatted = m.value === null || m.value === undefined
                                            ? '--'
                                            : m.format === 'pct'
                                            ? fmtPct(m.value)
                                            : fmtNum(m.value);
                                        return (
                                            <MetricCard key={m.key} theme={theme}>
                                                <MetricLabel theme={theme}>{m.label}</MetricLabel>
                                                <MetricValue $c={color}>{formatted}</MetricValue>
                                                <MetricInterp theme={theme} $tone={interp.tone}>
                                                    {interp.tone === 'pass' && <CheckCircle size={11} />}
                                                    {interp.tone === 'warn' && <AlertTriangle size={11} />}
                                                    <span>{interp.text}</span>
                                                </MetricInterp>
                                            </MetricCard>
                                        );
                                    })}
                                </MetricsGrid>
                            </>
                        )}

                        {/* ═══ INSIGHTS / RISKS ═══ */}
                        {(keyInsights.length > 0 || riskFlags.length > 0) && (
                            <TwoCol>
                                <PanelCard theme={theme} $variant="insights">
                                    <PanelTitle $variant="insights">
                                        <Sparkles size={11} /> 📊 KEY INSIGHTS
                                    </PanelTitle>
                                    {keyInsights.length === 0 ? (
                                        <div style={{ fontSize: '.78rem', color: theme?.text?.tertiary || '#64748b' }}>
                                            No standout insights for this company.
                                        </div>
                                    ) : (
                                        <PanelList>
                                            {keyInsights.map((s, i) => (
                                                <PanelItem key={i} theme={theme} $variant="insights">{s}</PanelItem>
                                            ))}
                                        </PanelList>
                                    )}
                                </PanelCard>
                                <PanelCard theme={theme} $variant="risks">
                                    <PanelTitle $variant="risks">
                                        <AlertTriangle size={11} /> ⚠️ RISK FLAGS
                                    </PanelTitle>
                                    {riskFlags.length === 0 ? (
                                        <div style={{ fontSize: '.78rem', color: theme?.text?.tertiary || '#64748b' }}>
                                            No major risks flagged.
                                        </div>
                                    ) : (
                                        <PanelList>
                                            {riskFlags.map((r, i) => (
                                                <PanelItem key={i} theme={theme} $variant="risks">{r}</PanelItem>
                                            ))}
                                        </PanelList>
                                    )}
                                </PanelCard>
                            </TwoCol>
                        )}

                        {/* ═══ SECTOR COMPARISON ═══ */}
                        {sectorBarsData.length > 0 && (
                            <>
                                <SectionTitle theme={theme}>
                                    <Building2 size={15} color={theme?.brand?.primary || '#00adef'} />
                                    Sector Comparison
                                </SectionTitle>
                                <SectionSub theme={theme}>
                                    {snapshot.symbol} vs {snapshot.sector || 'sector'} averages — white line marks sector benchmark
                                </SectionSub>
                                <ComparisonCard theme={theme}>
                                    {sectorBarsData.map(row => {
                                        if (row.company === null || row.sector === null) return null;
                                        // Bar width: scale relative to max(company, sector) * 1.4
                                        const max = Math.max(Math.abs(row.company), Math.abs(row.sector)) * 1.4;
                                        const companyW = max > 0 ? Math.min(100, Math.abs(row.company) / max * 100) : 0;
                                        const sectorAt = max > 0 ? Math.min(100, Math.abs(row.sector) / max * 100) : 0;
                                        return (
                                            <CompareRow key={row.key}>
                                                <CompareLabel theme={theme}>{row.label}</CompareLabel>
                                                <BarTrack>
                                                    <BarCompany theme={theme} $w={companyW} />
                                                    <BarSector $at={sectorAt} />
                                                </BarTrack>
                                                <CompareValue theme={theme}>
                                                    {row.fmt(row.company)}
                                                    <CompareSectorTag theme={theme}>vs {row.fmt(row.sector)}</CompareSectorTag>
                                                </CompareValue>
                                            </CompareRow>
                                        );
                                    })}
                                </ComparisonCard>
                            </>
                        )}

                        {/* ═══ CHART ═══ */}
                        {chart?.series && chart.series.length > 0 && (
                            <ChartCard theme={theme}>
                                <ChartHead>
                                    <SectionTitle theme={theme} style={{ margin: 0 }}>
                                        <TrendingUp size={15} color={theme?.brand?.primary || '#00adef'} />
                                        {chartView === 'revenue' && 'Revenue'}
                                        {chartView === 'netIncome' && 'Net Income'}
                                        {chartView === 'eps' && 'EPS'}
                                        {chartView === 'freeCashFlow' && 'Free Cash Flow'}
                                        {' · 5-year history'}
                                        {chart.acceleration && (
                                            <AccelTag $tone={chart.acceleration === 'accelerating' ? 'up'
                                                : chart.acceleration === 'decelerating' ? 'down'
                                                : 'flat'} style={{ marginLeft: '.5rem' }}>
                                                {chart.acceleration}
                                            </AccelTag>
                                        )}
                                    </SectionTitle>
                                    <ChartControls>
                                        {[
                                            { k: 'revenue', l: 'Revenue' },
                                            { k: 'netIncome', l: 'Net Income' },
                                            { k: 'eps', l: 'EPS' },
                                            { k: 'freeCashFlow', l: 'Free Cash Flow' }
                                        ].map(opt => (
                                            <ChartChip
                                                key={opt.k}
                                                theme={theme}
                                                $active={chartView === opt.k}
                                                onClick={() => setChartView(opt.k)}
                                            >
                                                {opt.l}
                                            </ChartChip>
                                        ))}
                                    </ChartControls>
                                </ChartHead>
                                <ChartHeight>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData}>
                                            <defs>
                                                <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#00adef" stopOpacity={0.7} />
                                                    <stop offset="100%" stopColor="#00adef" stopOpacity={0.15} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                                            <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#475569"
                                                tick={{ fill: '#64748b', fontSize: 10 }}
                                                tickFormatter={(v) => chartView === 'eps' ? `$${v.toFixed(2)}` : fmtBig(v)}
                                                width={70}
                                            />
                                            {(chartView === 'revenue' || chartView === 'netIncome') && (
                                                <YAxis
                                                    yAxisId="right"
                                                    orientation="right"
                                                    stroke="#475569"
                                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                                    tickFormatter={(v) => `${v}%`}
                                                    width={45}
                                                />
                                            )}
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#0f1729',
                                                    border: '1px solid rgba(255,255,255,.12)',
                                                    borderRadius: '8px',
                                                    fontSize: '.78rem'
                                                }}
                                                formatter={(v, name) => {
                                                    if (name === 'growth') return v !== null ? `${v}%` : '--';
                                                    if (chartView === 'eps') return `$${Number(v).toFixed(2)}`;
                                                    return fmtBig(v);
                                                }}
                                            />
                                            <Bar
                                                yAxisId="left"
                                                dataKey="value"
                                                fill="url(#finGrad)"
                                                radius={[4, 4, 0, 0]}
                                                isAnimationActive={false}
                                            />
                                            {(chartView === 'revenue' || chartView === 'netIncome') && (
                                                <Line
                                                    yAxisId="right"
                                                    type="monotone"
                                                    dataKey="growth"
                                                    stroke="#a78bfa"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#a78bfa', r: 3 }}
                                                    isAnimationActive={false}
                                                />
                                            )}
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </ChartHeight>
                            </ChartCard>
                        )}

                        {/* ═══ METHODOLOGY ═══ */}
                        <Methodology theme={theme}>
                            <div>
                                <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How Financial Verdict works:</strong>{' '}
                                Health score combines profitability, growth, efficiency, and stability sub-scores. Valuation compares
                                P/E to sector average, adjusted for growth. The verdict rule: strong fundamentals + reasonable
                                valuation = BUY. Weak fundamentals or overvaluation + low growth = AVOID. Everything else = HOLD.
                            </div>
                            <RefreshBtn theme={theme} onClick={() => fetchSymbol(symbol, false)} disabled={refreshing}>
                                <SpinIcon size={12} $spinning={refreshing} />
                                {refreshing ? 'Refreshing...' : 'Refresh now'}
                            </RefreshBtn>
                        </Methodology>
                    </>
                )}
            </Container>
        </Page>
    );
};

export default FinancialVerdictPage;
