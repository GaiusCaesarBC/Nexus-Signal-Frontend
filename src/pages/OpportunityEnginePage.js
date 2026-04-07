// client/src/pages/OpportunityEnginePage.js
// Opportunity Engine — AI-ranked trade opportunities with setup classification.
// Replaces the legacy ScreenerPage as the top-of-funnel discovery surface.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
    ArrowUpRight, ArrowDownRight, BarChart3, Bookmark,
    Brain, Eye, RefreshCw, Sparkles, TrendingUp, TrendingDown, Zap, Bell, Copy,
    Search, Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

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
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

// ═══════════════════════════════════════════════════════════
// STYLED — all components accept theme via props (NEVER strip themes)
// ═══════════════════════════════════════════════════════════
const Page = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    padding-bottom: 4rem;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    background: transparent;
`;
const Container = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    @media(max-width:768px){padding:1rem;}
`;

// ─── HEADER ─────────────────────────────────────────────
const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
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
    background: rgba(16, 185, 129, .06);
    border: 1px solid rgba(16, 185, 129, .2);
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

// ─── ANALYZE SEARCH BOX ───────────────────────────────────
const SearchBar = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
    padding: .85rem 1rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '30'};
    border-radius: 14px;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .03s backwards;`}
    @media(max-width:600px){flex-wrap:wrap;}
`;
const SearchIcon = styled.div`
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    flex-shrink: 0;
`;
const SearchLabel = styled.div`
    font-size: .8rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    white-space: nowrap;
    @media(max-width:600px){display:none;}
`;
const SearchInput = styled.input`
    flex: 1;
    min-width: 140px;
    background: transparent;
    border: none;
    outline: none;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .88rem;
    font-weight: 600;
    padding: .35rem 0;
    &::placeholder {
        color: ${p => p.theme?.text?.tertiary || '#64748b'};
        font-weight: 500;
    }
`;
const AssetTypeToggle = styled.div`
    display: flex;
    gap: .25rem;
    padding: .15rem;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.03)'};
    border-radius: 7px;
`;
const AssetTypeBtn = styled.button`
    padding: .35rem .65rem;
    border-radius: 5px;
    background: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '20'
        : 'transparent'};
    border: none;
    color: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef')
        : (p.theme?.text?.tertiary || '#64748b')};
    font-size: .68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
    cursor: pointer;
    transition: all .15s;
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
    transition: all .2s;
    white-space: nowrap;
    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    }
    &:disabled {
        opacity: .55;
        cursor: not-allowed;
    }
`;
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;

// ─── MARKET PULSE BAR ─────────────────────────────────────
const PulseBar = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: .5rem;
    padding: .85rem 1rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
    @media(max-width:900px){grid-template-columns:repeat(3,1fr);}
    @media(max-width:500px){grid-template-columns:repeat(2,1fr);}
`;
const PulseTile = styled.div`
    text-align: center;
    padding: .15rem .25rem;
    border-right: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    &:last-child { border-right: none; }
    @media(max-width:900px){border-right:none;}
`;
const PulseLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#475569'};
    font-weight: 700;
    margin-bottom: .2rem;
`;
const PulseValue = styled.div`
    font-size: .95rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;
const PulseSub = styled.div`
    font-size: .58rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .1rem;
`;

// ─── FEATURED ─────────────────────────────────────────────
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
const FCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1rem;
    cursor: pointer;
    transition: all .2s;
    position: relative;
    overflow: hidden;
    &:hover {
        transform: translateY(-3px);
        border-color: ${p => p.theme?.brand?.primary || 'rgba(0,173,237,.4)'};
        box-shadow: 0 12px 32px ${p => (p.theme?.brand?.primary || '#00adef') + '22'};
    }
`;
const FTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .5rem;
`;
const FSym = styled.div`
    font-size: 1.15rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const FBias = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    padding: .2rem .5rem;
    border-radius: 6px;
    font-size: .62rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
`;
const FScoreRow = styled.div`
    display: flex;
    align-items: baseline;
    gap: .4rem;
    margin: .35rem 0 .5rem;
`;
const FScore = styled.div`
    font-size: 1.6rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    line-height: 1;
`;
const FScoreLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    letter-spacing: .5px;
    font-weight: 700;
`;
const FBar = styled.div`
    height: 4px;
    background: rgba(255,255,255,.05);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: .55rem;
`;
const FBarFill = styled.div`
    height: 100%;
    width: ${p => p.$w}%;
    background: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#64748b'};
    transition: width .4s;
`;
const FSetup = styled.div`
    font-size: .68rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.secondary || '#a78bfa'};
    margin-bottom: .35rem;
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const FWhy = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .55rem;
    min-height: 2.5em;
`;
const FMeta = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    padding-top: .5rem;
    border-top: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
`;

// ─── FILTERS ───────────────────────────────────────────────
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

// ─── CONSOLE TABLE ─────────────────────────────────────────
const ConsoleCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    overflow: hidden;
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
`;
const ConsoleHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .9rem 1.1rem;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    flex-wrap: wrap;
    gap: .5rem;
`;
const ConsoleMeta = styled.div`
    font-size: .7rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const TableScroll = styled.div`
    overflow-x: auto;
`;
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: .8rem;
    min-width: 1100px;
`;
const Th = styled.th`
    text-align: left;
    padding: .65rem .8rem;
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    font-weight: 800;
    color: ${p => p.theme?.text?.tertiary || '#475569'};
    background: rgba(255,255,255,.015);
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    white-space: nowrap;
`;
const Tr = styled.tr`
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    cursor: pointer;
    transition: background .15s;
    &:hover { background: rgba(255,255,255,.02); }
    &:last-child { border-bottom: none; }
`;
const Td = styled.td`
    padding: .85rem .8rem;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    vertical-align: middle;
`;
const Rank = styled.div`
    font-size: .8rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const SymCell = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
`;
const AssetDot = styled.div`
    width: 8px; height: 8px; border-radius: 50%;
    background: ${p => p.$crypto ? '#f59e0b' : '#0ea5e9'};
    flex-shrink: 0;
`;
const SymName = styled.div`
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#fff'};
    font-size: .88rem;
`;
const ScoreCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: .25rem;
    min-width: 70px;
`;
const ScoreVal = styled.div`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    line-height: 1;
`;
const ScoreBar = styled.div`
    height: 3px;
    background: rgba(255,255,255,.05);
    border-radius: 2px;
    overflow: hidden;
`;
const ScoreBarFill = styled.div`
    height: 100%;
    width: ${p => p.$w}%;
    background: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#64748b'};
`;
const BiasPill = styled.span`
    display: inline-flex;
    align-items: center;
    gap: .25rem;
    padding: .25rem .55rem;
    border-radius: 6px;
    font-size: .65rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
`;
const SetupTag = styled.span`
    display: inline-flex;
    padding: .25rem .55rem;
    border-radius: 6px;
    font-size: .65rem;
    font-weight: 700;
    background: rgba(167, 139, 250, .08);
    color: #a78bfa;
    border: 1px solid rgba(167, 139, 250, .2);
    white-space: nowrap;
`;
const ConfText = styled.span`
    font-weight: 800;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
`;
const WhyText = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.4;
    max-width: 240px;
`;
const PriceCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: .15rem;
`;
const PriceVal = styled.div`
    font-weight: 700;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
`;
const PriceChange = styled.div`
    font-size: .68rem;
    font-weight: 700;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
`;
const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const ActionBtn = styled.button`
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
        transform: translateY(-1px);
    }
`;

// ─── EMPTY STATE ───────────────────────────────────────────
const Empty = styled.div`
    padding: 3rem 1.5rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const EmptyTitle = styled.div`
    font-size: 1rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: .5rem;
`;
const EmptyText = styled.div`
    font-size: .82rem;
    max-width: 420px;
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
    transition: all .15s;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '25'}; }
`;

// ─── METHODOLOGY ───────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const OpportunityEnginePage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const toast = useToast();
    const { hasPlanAccess } = useSubscription();
    const isPremium = hasPlanAccess('starter');
    const [searchParams, setSearchParams] = useSearchParams();

    // Manual analyze state
    const [analyzeQuery, setAnalyzeQuery] = useState('');
    const [analyzeType, setAnalyzeType] = useState('stocks');
    const [analyzing, setAnalyzing] = useState(false);

    const [opportunities, setOpportunities] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [presets, setPresets] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter state from URL
    const filters = useMemo(() => ({
        asset: searchParams.get('asset') || 'all',
        bias: searchParams.get('bias') || 'all',
        confMin: searchParams.get('confMin') || '',
        setup: searchParams.get('setup') || 'all',
        preset: searchParams.get('preset') || 'all'
    }), [searchParams]);

    const updateFilter = useCallback((key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
        // Setting a non-preset filter clears the preset
        if (key !== 'preset' && next.has('preset')) next.delete('preset');
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams]);

    const buildQueryString = useCallback(() => {
        const q = new URLSearchParams();
        if (filters.asset !== 'all') q.set('asset', filters.asset);
        if (filters.bias !== 'all') q.set('bias', filters.bias);
        if (filters.confMin) q.set('confMin', filters.confMin);
        if (filters.setup !== 'all') q.set('setup', filters.setup);
        if (filters.preset !== 'all') q.set('preset', filters.preset);
        q.set('limit', isPremium ? '50' : '10');
        return q.toString();
    }, [filters, isPremium]);

    const fetchData = useCallback(async (showSpinner = true) => {
        if (showSpinner) setLoading(true);
        else setRefreshing(true);

        try {
            const qs = buildQueryString();
            const fetcher = (path) => api
                ? api.get(path).then(r => r.data)
                : fetch(`${API_URL}${path}`).then(r => r.json());

            const [oppRes, featRes, presRes, statRes] = await Promise.all([
                fetcher(`/opportunities?${qs}`).catch(() => ({ opportunities: [] })),
                fetcher('/opportunities/featured?limit=5').catch(() => ({ opportunities: [] })),
                fetcher('/opportunities/presets').catch(() => ({ presets: [] })),
                fetcher('/opportunities/status').catch(() => null)
            ]);

            setOpportunities(oppRes?.opportunities || []);
            setFeatured(featRes?.opportunities || []);
            setPresets(presRes?.presets || []);
            setStatus(statRes || null);
        } catch (err) {
            console.error('[OpportunityEngine] Fetch failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, buildQueryString]);

    useEffect(() => { fetchData(true); }, [fetchData]);

    // Auto-refresh every 60s
    useEffect(() => {
        const iv = setInterval(() => fetchData(false), 60000);
        return () => clearInterval(iv);
    }, [fetchData]);

    const handleRowClick = (opp) => {
        if (opp.signalId) navigate(`/signal/${opp.signalId}`);
        else navigate(opp.isCrypto ? `/crypto/${opp.symbol}` : `/stock/${opp.symbol}`);
    };

    const handlePaperTrade = (e, opp) => {
        e.stopPropagation();
        navigate('/paper-trading', {
            state: {
                signal: {
                    symbol: opp.symbol, long: opp.bias === 'long', crypto: opp.isCrypto,
                    entry: opp.entry, sl: opp.sl, tp1: opp.tp1, tp2: opp.tp2, tp3: opp.tp3,
                    conf: opp.confidence, rr: opp.rr
                }
            }
        });
    };

    const handleWatchlist = async (e, opp) => {
        e.stopPropagation();
        if (!api) { navigate('/login'); return; }
        try {
            await api.post('/watchlist/add', { symbol: opp.symbol, type: opp.isCrypto ? 'crypto' : 'stock' });
        } catch (err) { /* silent */ }
    };

    const handleAlert = (e, opp) => {
        e.stopPropagation();
        navigate('/alerts', { state: { symbol: opp.symbol } });
    };

    const setPreset = (presetId) => {
        const next = new URLSearchParams();
        if (presetId !== 'all') next.set('preset', presetId);
        setSearchParams(next, { replace: true });
    };

    // Manual analyze handler — runs an on-demand prediction
    const handleAnalyze = async () => {
        const raw = analyzeQuery.trim().toUpperCase();
        if (!raw) {
            toast?.error?.('Enter a symbol to analyze');
            return;
        }
        if (!api) {
            toast?.error?.('Sign in to run on-demand analysis');
            navigate('/login');
            return;
        }
        if (!isPremium) {
            toast?.error?.('On-demand analysis requires a Starter plan or higher');
            navigate('/pricing');
            return;
        }

        setAnalyzing(true);
        try {
            const res = await api.post('/predictions/predict', {
                symbol: raw,
                days: 7,
                assetType: analyzeType === 'crypto' ? 'crypto' : 'stock'
            });

            const pred = res.data?.prediction || res.data;
            if (pred && pred.symbol) {
                toast?.success?.(`Analysis complete for ${raw}`);
                // Refresh opportunities list to include the new one
                fetchData(false);
                // Navigate to the asset page so the user sees the full setup
                const path = analyzeType === 'crypto' ? `/crypto/${raw}` : `/stock/${raw}`;
                setTimeout(() => navigate(path), 400);
            } else {
                toast?.info?.(`No high-confidence setup detected for ${raw}`);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || `Failed to analyze ${raw}`;
            toast?.error?.(msg);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <Page theme={theme}>
            <SEO
                title="Opportunity Engine — Nexus Signal AI"
                description="AI-ranked trade opportunities across stocks and crypto. Every name surfaced has a reason."
            />
            <Container>

                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Sparkles size={28} color={theme?.brand?.primary || '#00adef'} />
                            Opportunity Engine
                        </H1>
                        <Subhead theme={theme}>
                            Live AI scans across stocks and crypto markets — surfaced by setup quality, not just price movement.
                        </Subhead>
                    </HeaderLeft>
                    <StatusPill theme={theme}>
                        <StatusDot />
                        Engine Active · {status?.total ?? '--'} opportunities · {status?.lastScanAt ? `Updated ${timeAgo(status.lastScanAt)}` : 'Scanning'}
                    </StatusPill>
                </HeaderRow>

                {/* ═══ ANALYZE ANY SYMBOL ═══ */}
                <SearchBar theme={theme}>
                    <SearchIcon theme={theme}><Search size={18} /></SearchIcon>
                    <SearchLabel theme={theme}>Analyze any symbol</SearchLabel>
                    <SearchInput
                        theme={theme}
                        placeholder="Type a ticker (e.g., NVDA, BTC, ETH)..."
                        value={analyzeQuery}
                        onChange={(e) => setAnalyzeQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze(); }}
                        disabled={analyzing}
                    />
                    <AssetTypeToggle theme={theme}>
                        <AssetTypeBtn
                            theme={theme}
                            $active={analyzeType === 'stocks'}
                            onClick={() => setAnalyzeType('stocks')}
                        >
                            Stock
                        </AssetTypeBtn>
                        <AssetTypeBtn
                            theme={theme}
                            $active={analyzeType === 'crypto'}
                            onClick={() => setAnalyzeType('crypto')}
                        >
                            Crypto
                        </AssetTypeBtn>
                    </AssetTypeToggle>
                    <AnalyzeBtn theme={theme} onClick={handleAnalyze} disabled={analyzing || !analyzeQuery.trim()}>
                        {analyzing ? <SpinningLoader size={14} /> : <Sparkles size={14} />}
                        {analyzing ? 'Scanning...' : 'Analyze'}
                    </AnalyzeBtn>
                </SearchBar>

                {/* ═══ MARKET PULSE BAR ═══ */}
                <PulseBar theme={theme}>
                    <PulseTile theme={theme}>
                        <PulseLabel theme={theme}>Engine Bias</PulseLabel>
                        <PulseValue theme={theme} $c={status?.bias === 'Net Long' ? '#10b981' : status?.bias === 'Net Short' ? '#ef4444' : '#f59e0b'}>
                            {status?.bias || '--'}
                        </PulseValue>
                        <PulseSub theme={theme}>{status?.longPct ?? '--'}% bullish</PulseSub>
                    </PulseTile>
                    <PulseTile theme={theme}>
                        <PulseLabel theme={theme}>Total Opportunities</PulseLabel>
                        <PulseValue theme={theme}>{status?.total ?? '--'}</PulseValue>
                        <PulseSub theme={theme}>active right now</PulseSub>
                    </PulseTile>
                    <PulseTile theme={theme}>
                        <PulseLabel theme={theme}>Long Setups</PulseLabel>
                        <PulseValue theme={theme} $c="#10b981">{status?.longCount ?? '--'}</PulseValue>
                        <PulseSub theme={theme}>bullish bias</PulseSub>
                    </PulseTile>
                    <PulseTile theme={theme}>
                        <PulseLabel theme={theme}>Short Setups</PulseLabel>
                        <PulseValue theme={theme} $c="#ef4444">{status?.shortCount ?? '--'}</PulseValue>
                        <PulseSub theme={theme}>bearish bias</PulseSub>
                    </PulseTile>
                    <PulseTile theme={theme}>
                        <PulseLabel theme={theme}>High Conviction</PulseLabel>
                        <PulseValue theme={theme} $c="#a78bfa">
                            {presets.find(p => p.id === 'high_conviction')?.count ?? '--'}
                        </PulseValue>
                        <PulseSub theme={theme}>80+ AI Score</PulseSub>
                    </PulseTile>
                    <PulseTile theme={theme}>
                        <PulseLabel theme={theme}>Last Scan</PulseLabel>
                        <PulseValue theme={theme}>{status?.lastScanAt ? timeAgo(status.lastScanAt) : '--'}</PulseValue>
                        <PulseSub theme={theme}>auto-refresh 60s</PulseSub>
                    </PulseTile>
                </PulseBar>

                {/* ═══ FEATURED ═══ */}
                {featured.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Zap size={16} color="#f59e0b" />
                            Top Setups · Highest AI Score
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Ranked by AI conviction × setup quality × risk/reward
                        </SectionSub>
                        <FeaturedGrid>
                            {featured.map(opp => (
                                <FCard key={opp.id} theme={theme} onClick={() => handleRowClick(opp)}>
                                    <FTop>
                                        <FSym theme={theme}>{opp.symbol}</FSym>
                                        <FBias $long={opp.bias === 'long'}>
                                            {opp.bias === 'long' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                            {opp.bias === 'long' ? 'LONG' : 'SHORT'}
                                        </FBias>
                                    </FTop>
                                    <FScoreRow>
                                        <FScore $v={opp.aiScore}>{opp.aiScore}</FScore>
                                        <FScoreLabel theme={theme}>AI Score</FScoreLabel>
                                    </FScoreRow>
                                    <FBar><FBarFill $w={opp.aiScore} $v={opp.aiScore} /></FBar>
                                    <FSetup theme={theme}>
                                        <Brain size={10} />{opp.setupLabel}
                                    </FSetup>
                                    <FWhy theme={theme}>{opp.whySurfaced}</FWhy>
                                    <FMeta theme={theme}>
                                        <span>{fmtPrice(opp.price)}</span>
                                        <span>R/R 1:{opp.rr || '--'}</span>
                                    </FMeta>
                                </FCard>
                            ))}
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
                        >
                            {p.label}
                            <ChipCount theme={theme}>{p.count}</ChipCount>
                        </Chip>
                    ))}
                </PresetTabs>

                {/* ═══ CONSOLE ═══ */}
                <ConsoleCard theme={theme}>
                    <ConsoleHeader theme={theme}>
                        <SectionTitle theme={theme} style={{ margin: 0 }}>
                            <BarChart3 size={15} color={theme?.brand?.primary || '#00adef'} />
                            Opportunity Console
                        </SectionTitle>
                        <ConsoleMeta theme={theme}>
                            {opportunities.length} setups · sorted by AI Score
                            {!isPremium && ' · Free tier shows 10/day'}
                        </ConsoleMeta>
                    </ConsoleHeader>

                    {loading ? (
                        <LoadingRow theme={theme}>Scanning markets...</LoadingRow>
                    ) : opportunities.length === 0 ? (
                        <Empty theme={theme}>
                            <EmptyTitle theme={theme}>No opportunities match these filters</EmptyTitle>
                            <EmptyText theme={theme}>
                                The Engine scans for setup quality, not just price movement. Try loosening your filters
                                or run a manual prediction on a specific symbol.
                            </EmptyText>
                            <EmptyBtn theme={theme} onClick={() => setSearchParams({}, { replace: true })}>
                                Reset Filters
                            </EmptyBtn>
                        </Empty>
                    ) : (
                        <TableScroll>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th theme={theme}>#</Th>
                                        <Th theme={theme}>Symbol</Th>
                                        <Th theme={theme}>AI Score</Th>
                                        <Th theme={theme}>Bias</Th>
                                        <Th theme={theme}>Setup</Th>
                                        <Th theme={theme}>Conf</Th>
                                        <Th theme={theme}>Why Surfaced</Th>
                                        <Th theme={theme}>Price</Th>
                                        <Th theme={theme}>R/R</Th>
                                        <Th theme={theme}>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {opportunities.map((opp, idx) => (
                                        <Tr key={opp.id} theme={theme} onClick={() => handleRowClick(opp)}>
                                            <Td theme={theme}><Rank theme={theme}>{idx + 1}</Rank></Td>
                                            <Td theme={theme}>
                                                <SymCell>
                                                    <AssetDot $crypto={opp.isCrypto} />
                                                    <SymName theme={theme}>{opp.symbol}</SymName>
                                                </SymCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <ScoreCell>
                                                    <ScoreVal $v={opp.aiScore}>{opp.aiScore}</ScoreVal>
                                                    <ScoreBar><ScoreBarFill $w={opp.aiScore} $v={opp.aiScore} /></ScoreBar>
                                                </ScoreCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <BiasPill $long={opp.bias === 'long'}>
                                                    {opp.bias === 'long' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                                    {opp.bias === 'long' ? 'LONG' : 'SHORT'}
                                                </BiasPill>
                                            </Td>
                                            <Td theme={theme}><SetupTag>{opp.setupLabel}</SetupTag></Td>
                                            <Td theme={theme}><ConfText $v={opp.confidence}>{opp.confidence}%</ConfText></Td>
                                            <Td theme={theme}><WhyText theme={theme}>{opp.whySurfaced}</WhyText></Td>
                                            <Td theme={theme}>
                                                <PriceCell>
                                                    <PriceVal theme={theme}>{fmtPrice(opp.price)}</PriceVal>
                                                    {opp.changePct !== 0 && (
                                                        <PriceChange $pos={opp.changePct >= 0}>
                                                            {opp.changePct >= 0 ? '+' : ''}{opp.changePct.toFixed(2)}%
                                                        </PriceChange>
                                                    )}
                                                </PriceCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <span style={{ fontWeight: 700, color: theme?.brand?.primary || '#00adef' }}>
                                                    {opp.rr ? `1:${opp.rr}` : '--'}
                                                </span>
                                            </Td>
                                            <Td theme={theme}>
                                                <Actions>
                                                    <ActionBtn theme={theme} title="View signal" onClick={(e) => { e.stopPropagation(); handleRowClick(opp); }}>
                                                        <Eye size={13} />
                                                    </ActionBtn>
                                                    <ActionBtn theme={theme} title="Paper trade" onClick={(e) => handlePaperTrade(e, opp)}>
                                                        <Copy size={13} />
                                                    </ActionBtn>
                                                    <ActionBtn theme={theme} title="Add to watchlist" onClick={(e) => handleWatchlist(e, opp)}>
                                                        <Bookmark size={13} />
                                                    </ActionBtn>
                                                    <ActionBtn theme={theme} title="Set alert" onClick={(e) => handleAlert(e, opp)}>
                                                        <Bell size={13} />
                                                    </ActionBtn>
                                                </Actions>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableScroll>
                    )}
                </ConsoleCard>

                {/* ═══ METHODOLOGY ═══ */}
                <Methodology theme={theme}>
                    <div>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>How the Engine works:</strong>{' '}
                        Every active AI signal is scored across confidence, indicator alignment, sentiment, and risk/reward, then classified into one of seven setup types. Every name surfaced has a reason — every reason is tracked.
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

export default OpportunityEnginePage;
