// client/src/components/TradeSetupCard.js
// The Decision Engine — dominant trade setup card for asset detail pages.
// Single source of truth for: setup display, live state, why-this-setup,
// confidence breakdown, position sizing, track record, related opportunities.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
    ArrowUpRight, ArrowDownRight, Zap, Target, Shield, Brain,
    CheckCircle, AlertTriangle, Clock, Eye, Activity, Copy,
    TrendingUp, ChevronRight, DollarSign, Sparkles
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS + HELPERS
// ═══════════════════════════════════════════════════════════
const fmtPrice = (p) => {
    if (p === null || p === undefined || isNaN(p)) return '--';
    if (Math.abs(p) >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (Math.abs(p) >= 1) return `$${p.toFixed(2)}`;
    if (Math.abs(p) >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(8)}`;
};
const fmtPct = (n, withSign = true) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    const sign = withSign && n > 0 ? '+' : '';
    return `${sign}${n.toFixed(2)}%`;
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
const timeLeft = (d) => {
    if (!d) return '--';
    const ms = new Date(d) - Date.now();
    if (ms <= 0) return 'expired';
    const h = Math.floor(ms / 3600000);
    if (h < 1) return `${Math.floor(ms / 60000)}m`;
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    const remH = h % 24;
    return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
};

// ═══════════════════════════════════════════════════════════
// LIVE STATE DERIVATION — single function powers everything
// ═══════════════════════════════════════════════════════════
const deriveSetupState = (setup, currentPrice) => {
    if (!setup || !currentPrice) return null;
    const long = setup.bias === 'long';
    const entry = setup.entry;
    const sl = setup.sl;
    const tp1 = setup.tp1;
    const tp3 = setup.tp3;
    if (!entry || !sl) return null;

    const distEntry = Math.abs(currentPrice - entry) / entry;
    const distSL = Math.abs(currentPrice - sl) / sl;

    if (long && currentPrice <= sl) return 'invalidated';
    if (!long && currentPrice >= sl) return 'invalidated';
    if (long && tp3 && currentPrice >= tp3) return 'target_hit';
    if (!long && tp3 && currentPrice <= tp3) return 'target_hit';
    if (distSL < 0.005) return 'near_sl';
    if (long && tp1 && currentPrice >= tp1 * 0.99) return 'near_tp';
    if (!long && tp1 && currentPrice <= tp1 * 1.01) return 'near_tp';
    if (distEntry < 0.01) return 'near_entry';
    if (long ? currentPrice > entry : currentPrice < entry) return 'in_profit';
    return 'drawdown';
};

const STATE_LABELS = {
    near_entry:    { label: 'Near Entry Zone',    color: '#10b981', sub: 'Within 1% of entry' },
    in_profit:     { label: 'Active — In Profit', color: '#10b981', sub: 'Moving toward target' },
    drawdown:      { label: 'Active — Drawdown',  color: '#f59e0b', sub: 'Within normal range' },
    near_sl:       { label: 'Approaching Stop',   color: '#ef4444', sub: 'Monitor closely' },
    near_tp:       { label: 'Approaching Target', color: '#10b981', sub: 'Consider taking profits' },
    invalidated:   { label: 'Setup Invalidated',  color: '#ef4444', sub: 'Stop loss hit' },
    target_hit:    { label: 'Target Reached',     color: '#10b981', sub: 'TP3 hit' }
};

const STATE_BUTTON = {
    near_entry:  { label: 'Execute Trade Setup',         primary: true,  variant: 'primary' },
    in_profit:   { label: 'Execute Trade Setup',         primary: true,  variant: 'primary' },
    drawdown:    { label: 'Execute Trade Setup',         primary: true,  variant: 'primary' },
    near_sl:     { label: 'Setup Compromised — Re-evaluate', primary: false, variant: 'warn' },
    near_tp:     { label: 'Execute Trade Setup',         primary: true,  variant: 'primary' },
    invalidated: { label: 'Setup Closed — View Result',  primary: false, variant: 'muted' },
    target_hit:  { label: 'Setup Closed — View Result',  primary: false, variant: 'muted' }
};

// ═══════════════════════════════════════════════════════════
// CONFIDENCE PILLARS — derived from indicators (no new data)
// ═══════════════════════════════════════════════════════════
function buildPillars(setup) {
    if (!setup) return [];
    const ind = setup.indicators || {};
    const long = setup.bias === 'long';
    const get = (n) => {
        const v = ind[n];
        if (!v) return null;
        return typeof v === 'object' ? v : { value: v, signal: 'NEUTRAL' };
    };
    const trend = get('Trend');
    const macd = get('MACD');
    const rsi = get('RSI');
    const vol = get('Volume');
    const boll = get('Bollinger');

    const trendOK = trend && String(trend.signal).toUpperCase() === (long ? 'BUY' : 'SELL');
    const macdOK = macd && String(macd.signal).toUpperCase() === (long ? 'BUY' : 'SELL');
    const volOK = vol && (String(vol.value || '').toLowerCase().includes('high') ||
                          String(vol.value || '').toLowerCase().includes('above'));
    const rsiVal = rsi ? parseFloat(rsi.value) || 50 : 50;
    const rsiOK = long ? (rsiVal >= 40 && rsiVal <= 70) : (rsiVal >= 30 && rsiVal <= 60);
    const bollOK = boll && String(boll.value || '').toLowerCase().match(/break|upper|lower/);

    const aligned = setup.alignedCount || 0;
    const opposed = setup.opposedCount || 0;
    const total = setup.totalIndicators || 1;
    const overallAlign = aligned / total;

    return [
        {
            name: 'Trend Alignment',
            status: trendOK ? 'pass' : 'warn',
            detail: trend ? `${trend.value || (long ? 'Bullish' : 'Bearish')}` : 'Unknown'
        },
        {
            name: 'Volume Confirmation',
            status: volOK ? 'pass' : 'warn',
            detail: vol ? `${vol.value}` : 'Average'
        },
        {
            name: 'Momentum',
            status: macdOK ? 'pass' : 'warn',
            detail: macd ? `MACD ${macd.signal}` : 'Neutral'
        },
        {
            name: 'RSI Position',
            status: rsiOK ? 'pass' : 'warn',
            detail: `${rsiVal.toFixed(0)}`
        },
        {
            name: 'Pattern Structure',
            status: bollOK ? 'pass' : 'warn',
            detail: boll ? `${boll.value}` : 'Neutral'
        },
        {
            name: 'Indicator Agreement',
            status: overallAlign >= 0.5 ? 'pass' : opposed > aligned ? 'fail' : 'warn',
            detail: `${aligned}/${total} aligned`
        }
    ];
}

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const pulseDot = keyframes`0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.15)}`;

// ═══════════════════════════════════════════════════════════
// STYLED COMPONENTS — themed throughout
// ═══════════════════════════════════════════════════════════
const Wrap = styled.div`
    margin: 1.25rem 0 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out;`}
`;

const SetupCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long'
        ? 'rgba(16,185,129,.25)'
        : p.$bias === 'short'
        ? 'rgba(239,68,68,.25)'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    border-radius: 18px;
    padding: 1.75rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: ${p => p.$bias === 'long'
            ? 'linear-gradient(90deg, transparent, #10b981, transparent)'
            : p.$bias === 'short'
            ? 'linear-gradient(90deg, transparent, #ef4444, transparent)'
            : 'linear-gradient(90deg, transparent, #64748b, transparent)'};
    }

    @media(max-width:768px){padding:1.25rem;}
`;

const HeadGrid = styled.div`
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
    @media(max-width:900px){grid-template-columns:1fr;}
`;

const HeadLeft = styled.div``;
const TopRow = styled.div`
    display: flex;
    align-items: center;
    gap: .75rem;
    margin-bottom: .5rem;
    flex-wrap: wrap;
`;
const Strength = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .35rem .7rem;
    border-radius: 7px;
    font-size: .68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .5px;
    background: ${p => p.$strong
        ? 'rgba(16,185,129,.12)'
        : p.$mod ? 'rgba(245,158,11,.12)' : 'rgba(100,116,139,.12)'};
    color: ${p => p.$strong ? '#10b981' : p.$mod ? '#f59e0b' : '#94a3b8'};
    border: 1px solid ${p => p.$strong
        ? 'rgba(16,185,129,.25)'
        : p.$mod ? 'rgba(245,158,11,.25)' : 'rgba(100,116,139,.25)'};
`;
const BiasPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    padding: .4rem .85rem;
    border-radius: 8px;
    font-size: .82rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'};
`;
const ScoreBig = styled.div`
    margin-left: auto;
    text-align: right;
`;
const ScoreNum = styled.div`
    font-size: 2.4rem;
    font-weight: 900;
    line-height: 1;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
`;
const ScoreLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .15rem;
    font-weight: 700;
`;
const ClassLine = styled.div`
    font-size: .8rem;
    color: ${p => p.theme?.text?.secondary || '#a78bfa'};
    font-weight: 700;
    margin-bottom: 1rem;
`;

const PlanGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: .55rem;
    margin-bottom: 1rem;
    @media(max-width:600px){grid-template-columns:repeat(2,1fr);}
`;
const PlanBox = styled.div`
    padding: .75rem;
    border-radius: 10px;
    background: ${p => p.$bg || 'rgba(255,255,255,.025)'};
    border: 1px solid ${p => p.$bc || 'rgba(255,255,255,.05)'};
    text-align: center;
`;
const PlanLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#475569'};
    font-weight: 700;
    margin-bottom: .3rem;
`;
const PlanValue = styled.div`
    font-size: 1.05rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;
const PlanSub = styled.div`
    font-size: .6rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .15rem;
`;

const TPLadder = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .4rem;
    margin-bottom: 1rem;
`;
const TPBox = styled.div`
    padding: .55rem;
    border-radius: 8px;
    background: rgba(16,185,129,.04);
    border: 1px solid rgba(16,185,129,.12);
    text-align: center;
`;
const TPLabel = styled.div`font-size:.55rem;color:#10b981;font-weight:700;letter-spacing:.5px;text-transform:uppercase;`;
const TPVal = styled.div`font-size:.9rem;font-weight:800;color:#10b981;margin-top:.1rem;`;
const TPPct = styled.div`font-size:.6rem;color:rgba(16,185,129,.7);margin-top:.05rem;`;

const WhyOneLine = styled.div`
    padding: .75rem 1rem;
    background: rgba(167,139,250,.05);
    border-left: 3px solid rgba(167,139,250,.4);
    border-radius: 0 8px 8px 0;
    font-size: .85rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.5;
    margin-bottom: 1rem;
`;

// ─── Live Context Strip (right column) ────────────────────
const ContextStrip = styled.div`
    display: flex;
    flex-direction: column;
    gap: .5rem;
`;
const Tile = styled.div`
    padding: .75rem .9rem;
    border-radius: 10px;
    background: ${p => (p.theme?.bg?.subtle || 'rgba(255,255,255,.025)')};
    border: 1px solid ${p => p.$accent ? p.$accent + '40' : (p.theme?.border?.subtle || 'rgba(255,255,255,.05)')};
`;
const TileLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .25rem;
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const TileValue = styled.div`
    font-size: .92rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    line-height: 1.2;
`;
const TileSub = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .15rem;
`;
const StateDot = styled.span`
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${p => p.$c};
    ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
`;

// ─── CTA Row ──────────────────────────────────────────────
const CTARow = styled.div`
    display: flex;
    gap: .75rem;
    margin-top: .5rem;
    @media(max-width:600px){flex-direction:column;}
`;
const PrimaryBtn = styled.button`
    flex: 2;
    padding: .9rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: .9rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    transition: all .2s;
    background: ${p => p.$variant === 'warn'
        ? 'transparent'
        : p.$variant === 'muted'
        ? 'transparent'
        : 'linear-gradient(135deg, #10b981, #059669)'};
    color: ${p => p.$variant === 'warn'
        ? '#f59e0b'
        : p.$variant === 'muted'
        ? '#64748b'
        : '#fff'};
    border: ${p => p.$variant === 'warn'
        ? '1px solid rgba(245,158,11,.4)'
        : p.$variant === 'muted'
        ? '1px solid rgba(100,116,139,.3)'
        : 'none'};

    &:hover {
        transform: ${p => p.$variant === 'muted' ? 'none' : 'translateY(-2px)'};
        box-shadow: ${p => p.$variant === 'primary' || !p.$variant
            ? '0 10px 28px rgba(16,185,129,.32)'
            : 'none'};
    }
`;
const SecondaryBtn = styled.button`
    flex: 1;
    padding: .9rem 1.25rem;
    border-radius: 12px;
    font-size: .85rem;
    font-weight: 700;
    cursor: pointer;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '12'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .35rem;
    transition: all .2s;
    &:hover {
        background: ${p => (p.theme?.brand?.primary || '#00adef') + '22'};
        transform: translateY(-2px);
    }
`;

// ─── Empty State ──────────────────────────────────────────
const EmptyCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 18px;
    padding: 2rem;
    text-align: center;
`;
const EmptyIcon = styled.div`
    width: 56px;
    height: 56px;
    margin: 0 auto 1rem;
    border-radius: 14px;
    background: rgba(167,139,250,.08);
    border: 1px solid rgba(167,139,250,.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a78bfa;
`;
const EmptyTitle = styled.div`
    font-size: 1.05rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: .4rem;
`;
const EmptySub = styled.div`
    font-size: .82rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    max-width: 460px;
    margin: 0 auto;
    line-height: 1.5;
`;

// ─── Reasoning Grid (Why + Confidence) ────────────────────
const ReasonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1.25rem;
    @media(max-width:900px){grid-template-columns:1fr;}
`;
const ReasonCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.25rem;
`;
const CardTitle = styled.h3`
    font-size: .82rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin: 0 0 .85rem;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const PillarRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .55rem 0;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.04)'};
    &:last-child { border-bottom: none; }
`;
const PillarLeft = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
    font-size: .78rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
`;
const PillarStatus = styled.div`
    display: flex;
    align-items: center;
    gap: .3rem;
    font-size: .72rem;
    font-weight: 700;
    color: ${p => p.$s === 'pass' ? '#10b981' : p.$s === 'warn' ? '#f59e0b' : '#ef4444'};
`;
const OverallRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: .85rem;
    margin-top: .35rem;
    border-top: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    font-size: .85rem;
    font-weight: 800;
`;

const WhyList = styled.div`display:flex;flex-direction:column;gap:.65rem;`;
const WhyItem = styled.div``;
const WhyCat = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#475569'};
    font-weight: 800;
    margin-bottom: .2rem;
`;
const WhyText = styled.div`
    font-size: .8rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.45;
`;

// ─── Risk Calculator ──────────────────────────────────────
const RiskCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.25rem;
    margin-top: 1rem;
`;
const RiskHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .85rem;
    flex-wrap: wrap;
    gap: .5rem;
`;
const RiskNote = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-style: italic;
    max-width: 420px;
`;
const RiskGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: .55rem;
    margin-top: .75rem;
    @media(max-width:700px){grid-template-columns:repeat(2,1fr);}
`;
const RiskTabs = styled.div`
    display: flex;
    gap: .35rem;
    margin-bottom: .25rem;
`;
const RiskTab = styled.button`
    padding: .35rem .75rem;
    border-radius: 7px;
    font-size: .72rem;
    font-weight: 700;
    cursor: pointer;
    background: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '20'
        : 'transparent'};
    border: 1px solid ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '60'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    color: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef')
        : (p.theme?.text?.secondary || '#94a3b8')};
    &:hover {
        color: ${p => p.theme?.brand?.primary || '#00adef'};
    }
`;

// ─── Related Opportunities ────────────────────────────────
const RelatedSection = styled.div`margin-top:1.25rem;`;
const RelatedHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .65rem;
    flex-wrap: wrap;
    gap: .4rem;
`;
const RelatedTitle = styled.h3`
    font-size: .82rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin: 0;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const RelatedSub = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const RelatedGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: .55rem;
    @media(max-width:900px){grid-template-columns:repeat(2,1fr);}
    @media(max-width:480px){grid-template-columns:1fr;}
`;
const RelatedCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: .85rem;
    cursor: pointer;
    transition: all .2s;
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
        box-shadow: 0 8px 20px ${p => (p.theme?.brand?.primary || '#00adef') + '20'};
    }
`;
const RelTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const RelSym = styled.div`
    font-size: .92rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const RelScore = styled.div`
    font-size: .9rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
`;
const RelBias = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    padding: .15rem .4rem;
    border-radius: 5px;
    font-size: .55rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
    margin-bottom: .35rem;
`;
const RelSetup = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .4px;
    color: #a78bfa;
    font-weight: 700;
    margin-bottom: .25rem;
`;
const RelWhy = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    line-height: 1.4;
    min-height: 2.6em;
`;

// ─── Track Record ─────────────────────────────────────────
const TrackStrip = styled.div`
    margin-top: 1rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg,
        rgba(16,185,129,.04),
        rgba(0,173,237,.04));
    border: 1px solid rgba(16,185,129,.15);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
`;
const TrackLeft = styled.div``;
const TrackTitle = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
`;
const TrackSub = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    margin-top: .15rem;
`;
const TrackNums = styled.div`
    display: flex;
    align-items: center;
    gap: 1.25rem;
`;
const TrackNum = styled.div`
    text-align: center;
`;
const TrackVal = styled.div`
    font-size: 1.2rem;
    font-weight: 900;
    color: ${p => p.$c || '#10b981'};
    line-height: 1;
`;
const TrackLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-top: .2rem;
    font-weight: 700;
`;

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const TradeSetupCard = ({ symbol, currentPrice, isCrypto = false, onSetupLoaded }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();

    const [setup, setSetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackRecord, setTrackRecord] = useState(null);
    const [related, setRelated] = useState([]);
    const [riskPct, setRiskPct] = useState(1);

    const fetchSetup = useCallback(async () => {
        if (!symbol) return;
        setLoading(true);
        try {
            const fetcher = (path) => api
                ? api.get(path).then(r => r.data)
                : fetch(`${API_URL}${path}`).then(r => r.json());

            const oppRes = await fetcher(`/opportunities/by-symbol/${encodeURIComponent(symbol)}`);
            const opp = oppRes?.opportunity || null;
            setSetup(opp);
            if (onSetupLoaded) {
                onSetupLoaded(opp ? {
                    entry: opp.entry,
                    sl: opp.sl,
                    tp1: opp.tp1,
                    tp2: opp.tp2,
                    tp3: opp.tp3,
                    bias: opp.bias
                } : null);
            }

            // Fetch track record for this setup type
            if (opp?.setupType) {
                const stats = await fetcher(`/opportunities/setup-stats?setupType=${opp.setupType}&days=90`)
                    .catch(() => null);
                setTrackRecord(stats?.count > 0 ? stats : null);
            } else {
                setTrackRecord(null);
            }

            // Fetch related opportunities
            const relRes = await fetcher(`/opportunities/related?symbol=${encodeURIComponent(symbol)}&limit=4`)
                .catch(() => null);
            setRelated(relRes?.opportunities || []);
        } catch (e) {
            console.error('[TradeSetupCard] Fetch failed:', e);
            setSetup(null);
        } finally {
            setLoading(false);
        }
    }, [symbol, api, onSetupLoaded]);

    useEffect(() => { fetchSetup(); }, [fetchSetup]);

    // Live state derivation
    const liveState = useMemo(
        () => deriveSetupState(setup, currentPrice),
        [setup, currentPrice]
    );

    // Confidence pillars
    const pillars = useMemo(() => buildPillars(setup), [setup]);

    // Position sizing math (uses fixed $100k account; can be wired to real account later)
    const accountBalance = 100000;
    const positionSize = useMemo(() => {
        if (!setup?.entry || !setup?.sl) return null;
        const maxLoss = accountBalance * (riskPct / 100);
        const lossPerUnit = Math.abs(setup.entry - setup.sl);
        if (lossPerUnit === 0) return null;
        const units = isCrypto
            ? +(maxLoss / lossPerUnit).toFixed(4)
            : Math.floor(maxLoss / lossPerUnit);
        const exposure = units * setup.entry;
        const targetProfit = setup.tp3 ? units * Math.abs(setup.tp3 - setup.entry) : 0;
        return { units, exposure, maxLoss, targetProfit };
    }, [setup, riskPct, isCrypto]);

    const handleExecute = () => {
        if (!setup) return;
        if (liveState === 'invalidated' || liveState === 'target_hit') {
            navigate(`/signal/${setup.id}`);
            return;
        }
        navigate('/paper-trading', {
            state: {
                signal: {
                    symbol: setup.symbol,
                    long: setup.bias === 'long',
                    crypto: isCrypto,
                    entry: setup.entry,
                    sl: setup.sl,
                    tp1: setup.tp1,
                    tp2: setup.tp2,
                    tp3: setup.tp3,
                    conf: setup.confidence,
                    rr: setup.rr,
                    riskPct,
                    units: positionSize?.units
                }
            }
        });
    };

    // ──────────────────────────────────────────────────────
    // EMPTY STATE
    // ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <Wrap>
                <EmptyCard theme={theme}>
                    <EmptyIcon theme={theme}><Brain size={26} /></EmptyIcon>
                    <EmptyTitle theme={theme}>Scanning {symbol}...</EmptyTitle>
                    <EmptySub theme={theme}>Checking for active high-confidence setups.</EmptySub>
                </EmptyCard>
            </Wrap>
        );
    }

    if (!setup) {
        return (
            <Wrap>
                <EmptyCard theme={theme}>
                    <EmptyIcon theme={theme}><Sparkles size={26} /></EmptyIcon>
                    <EmptyTitle theme={theme}>No high-confidence setup detected</EmptyTitle>
                    <EmptySub theme={theme}>
                        Conditions on {symbol} don't currently meet the Engine's threshold for an actionable trade.
                        The Engine is continuously scanning for better opportunities — check back, or browse the full
                        Opportunity Engine for active setups across the market.
                    </EmptySub>
                    <SecondaryBtn
                        theme={theme}
                        onClick={() => navigate('/opportunities')}
                        style={{ marginTop: '1.25rem', maxWidth: 260, marginLeft: 'auto', marginRight: 'auto' }}
                    >
                        <Sparkles size={14} /> Browse Opportunity Engine
                    </SecondaryBtn>
                </EmptyCard>
            </Wrap>
        );
    }

    // ──────────────────────────────────────────────────────
    // ACTIVE SETUP
    // ──────────────────────────────────────────────────────
    const long = setup.bias === 'long';
    const stateInfo = liveState ? STATE_LABELS[liveState] : null;
    const buttonInfo = liveState ? STATE_BUTTON[liveState] : { label: 'Execute Trade Setup', variant: 'primary' };

    const slPct = setup.entry && setup.sl
        ? ((setup.sl - setup.entry) / setup.entry) * 100
        : 0;
    const tp3Pct = setup.entry && setup.tp3
        ? ((setup.tp3 - setup.entry) / setup.entry) * 100
        : 0;
    const tp1Pct = setup.entry && setup.tp1
        ? ((setup.tp1 - setup.entry) / setup.entry) * 100
        : 0;
    const tp2Pct = setup.entry && setup.tp2
        ? ((setup.tp2 - setup.entry) / setup.entry) * 100
        : 0;

    const strengthLabel = setup.aiScore >= 80 ? 'STRONG' : setup.aiScore >= 65 ? 'MODERATE' : 'WEAK';

    // Why this setup — derive structured reasons
    const ind = setup.indicators || {};
    const trend = ind.Trend;
    const macd = ind.MACD;
    const vol = ind.Volume;
    const rsi = ind.RSI;
    const whyReasons = [];
    if (trend) whyReasons.push({
        cat: 'Market Structure',
        text: `${trend.value || (long ? 'Bullish' : 'Bearish')} trend confirmed${
            String(trend.signal).toUpperCase() === (long ? 'BUY' : 'SELL') ? ' on daily timeframe' : ''}`
    });
    if (macd) whyReasons.push({
        cat: 'Momentum',
        text: `MACD ${String(macd.signal).toLowerCase() === 'buy' ? 'bullish' : String(macd.signal).toLowerCase() === 'sell' ? 'bearish' : 'neutral'} crossover, momentum ${
            String(macd.signal).toUpperCase() === (long ? 'BUY' : 'SELL') ? 'accelerating' : 'mixed'}`
    });
    if (vol) whyReasons.push({
        cat: 'Volume',
        text: `${vol.value || 'Average'} volume ${String(vol.value || '').toLowerCase().includes('high') ? 'confirms directional conviction' : 'present'}`
    });
    if (rsi) {
        const r = parseFloat(rsi.value);
        whyReasons.push({
            cat: 'Pattern',
            text: `RSI at ${isNaN(r) ? '--' : r.toFixed(0)} — ${
                r < 35 ? 'oversold reversal conditions' :
                r > 65 ? 'strong momentum, watch for exhaustion' :
                'room for continuation'}`
        });
    }
    if (setup.rr) whyReasons.push({
        cat: 'Risk / Reward',
        text: `1:${setup.rr} ratio — ${setup.rr >= 3 ? 'favorable downside-to-upside skew' : setup.rr >= 2 ? 'acceptable risk profile' : 'tight risk profile'}`
    });

    return (
        <Wrap>
            {/* ═══ TRADE SETUP CARD ═══ */}
            <SetupCard theme={theme} $bias={setup.bias}>
                <HeadGrid>
                    {/* LEFT — setup details */}
                    <HeadLeft>
                        <TopRow>
                            <BiasPill $long={long}>
                                {long ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {long ? 'LONG' : 'SHORT'}
                            </BiasPill>
                            <Strength
                                $strong={strengthLabel === 'STRONG'}
                                $mod={strengthLabel === 'MODERATE'}
                            >
                                <Zap size={11} />{strengthLabel}
                            </Strength>
                            <ScoreBig>
                                <ScoreNum $v={setup.aiScore}>{setup.aiScore}</ScoreNum>
                                <ScoreLabel theme={theme}>AI Score</ScoreLabel>
                            </ScoreBig>
                        </TopRow>
                        <ClassLine theme={theme}>
                            {setup.setupLabel} · {long ? 'Bullish' : 'Bearish'} · {setup.timeframe || 7}-day {setup.timeframe === 1 ? 'scalp' : setup.timeframe <= 3 ? 'intraday' : 'swing'}
                        </ClassLine>

                        {/* Trade Plan */}
                        <PlanGrid>
                            <PlanBox theme={theme}>
                                <PlanLabel theme={theme}>Entry</PlanLabel>
                                <PlanValue theme={theme}>{fmtPrice(setup.entry)}</PlanValue>
                                <PlanSub theme={theme}>at market</PlanSub>
                            </PlanBox>
                            <PlanBox $bg="rgba(239,68,68,.04)" $bc="rgba(239,68,68,.12)" theme={theme}>
                                <PlanLabel theme={theme}>Stop Loss</PlanLabel>
                                <PlanValue $c="#ef4444">{fmtPrice(setup.sl)}</PlanValue>
                                <PlanSub theme={theme}>{fmtPct(slPct)}</PlanSub>
                            </PlanBox>
                            <PlanBox $bg="rgba(16,185,129,.04)" $bc="rgba(16,185,129,.12)" theme={theme}>
                                <PlanLabel theme={theme}>Target</PlanLabel>
                                <PlanValue $c="#10b981">{fmtPrice(setup.tp3)}</PlanValue>
                                <PlanSub theme={theme}>{fmtPct(tp3Pct)}</PlanSub>
                            </PlanBox>
                            <PlanBox theme={theme}>
                                <PlanLabel theme={theme}>R / R</PlanLabel>
                                <PlanValue $c={theme?.brand?.primary || '#00adef'}>1:{setup.rr || '--'}</PlanValue>
                                <PlanSub theme={theme}>{setup.rr >= 3 ? 'Excellent' : setup.rr >= 2 ? 'Good' : 'Tight'}</PlanSub>
                            </PlanBox>
                        </PlanGrid>

                        {/* TP Ladder */}
                        <TPLadder>
                            <TPBox><TPLabel>TP1</TPLabel><TPVal>{fmtPrice(setup.tp1)}</TPVal><TPPct>{fmtPct(tp1Pct)}</TPPct></TPBox>
                            <TPBox><TPLabel>TP2</TPLabel><TPVal>{fmtPrice(setup.tp2)}</TPVal><TPPct>{fmtPct(tp2Pct)}</TPPct></TPBox>
                            <TPBox><TPLabel>TP3</TPLabel><TPVal>{fmtPrice(setup.tp3)}</TPVal><TPPct>{fmtPct(tp3Pct)}</TPPct></TPBox>
                        </TPLadder>

                        {/* Why one-line */}
                        <WhyOneLine theme={theme}>{setup.whySurfaced}</WhyOneLine>
                    </HeadLeft>

                    {/* RIGHT — live context */}
                    <ContextStrip>
                        <Tile theme={theme}>
                            <TileLabel theme={theme}><Clock size={10} /> DETECTED</TileLabel>
                            <TileValue theme={theme}>{timeAgo(setup.createdAt)}</TileValue>
                            <TileSub theme={theme}>setup is fresh</TileSub>
                        </Tile>
                        <Tile theme={theme} $accent={stateInfo?.color}>
                            <TileLabel theme={theme}>
                                {stateInfo && <StateDot $c={stateInfo.color} />}STATE
                            </TileLabel>
                            <TileValue theme={theme} $c={stateInfo?.color}>
                                {stateInfo?.label || '--'}
                            </TileValue>
                            <TileSub theme={theme}>{stateInfo?.sub || ''}</TileSub>
                        </Tile>
                        <Tile theme={theme}>
                            <TileLabel theme={theme}><Activity size={10} /> EXPIRES</TileLabel>
                            <TileValue theme={theme}>{timeLeft(setup.expiresAt)}</TileValue>
                            <TileSub theme={theme}>auto-closes</TileSub>
                        </Tile>
                        <Tile theme={theme}>
                            <TileLabel theme={theme}><Eye size={10} /> CONFIDENCE</TileLabel>
                            <TileValue theme={theme} $c={setup.confidence >= 80 ? '#10b981' : setup.confidence >= 65 ? '#f59e0b' : '#94a3b8'}>
                                {setup.confidence}%
                            </TileValue>
                            <TileSub theme={theme}>model output</TileSub>
                        </Tile>
                    </ContextStrip>
                </HeadGrid>

                {/* CTA Row */}
                <CTARow>
                    <PrimaryBtn $variant={buttonInfo.variant} onClick={handleExecute}>
                        <Copy size={16} />
                        {buttonInfo.label}
                    </PrimaryBtn>
                    <SecondaryBtn theme={theme} onClick={() => navigate(`/signal/${setup.id}`)}>
                        <ChevronRight size={16} />
                        View Full Signal
                    </SecondaryBtn>
                </CTARow>
            </SetupCard>

            {/* ═══ REASONING (Why + Confidence) ═══ */}
            <ReasonGrid>
                <ReasonCard theme={theme}>
                    <CardTitle theme={theme}><Brain size={14} color="#a78bfa" /> Why This Setup Exists</CardTitle>
                    <WhyList>
                        {whyReasons.map((r, i) => (
                            <WhyItem key={i}>
                                <WhyCat theme={theme}>{r.cat}</WhyCat>
                                <WhyText theme={theme}>{r.text}</WhyText>
                            </WhyItem>
                        ))}
                    </WhyList>
                </ReasonCard>

                <ReasonCard theme={theme}>
                    <CardTitle theme={theme}><Shield size={14} color="#0ea5e9" /> Confidence Breakdown</CardTitle>
                    {pillars.map((p, i) => (
                        <PillarRow key={i} theme={theme}>
                            <PillarLeft theme={theme}>{p.name}</PillarLeft>
                            <PillarStatus $s={p.status}>
                                {p.status === 'pass' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                {p.detail}
                            </PillarStatus>
                        </PillarRow>
                    ))}
                    <OverallRow theme={theme}>
                        <span style={{ color: theme?.text?.secondary || '#94a3b8' }}>Overall AI Score</span>
                        <span style={{ color: setup.aiScore >= 80 ? '#10b981' : setup.aiScore >= 65 ? '#f59e0b' : '#94a3b8' }}>
                            {setup.aiScore}
                        </span>
                    </OverallRow>
                </ReasonCard>
            </ReasonGrid>

            {/* ═══ RISK CALCULATOR ═══ */}
            <RiskCard theme={theme}>
                <RiskHeader>
                    <CardTitle theme={theme} style={{ margin: 0 }}>
                        <Target size={14} color={theme?.brand?.primary || '#00adef'} /> Position Sizing
                    </CardTitle>
                    <RiskNote theme={theme}>
                        Position sizing is the difference between traders who survive and traders who don't.
                    </RiskNote>
                </RiskHeader>

                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '.7rem', color: theme?.text?.tertiary || '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                        Risk per trade
                    </div>
                    <RiskTabs>
                        {[0.5, 1, 2, 3].map(r => (
                            <RiskTab key={r} theme={theme} $active={riskPct === r} onClick={() => setRiskPct(r)}>
                                {r}%
                            </RiskTab>
                        ))}
                    </RiskTabs>
                    <div style={{ fontSize: '.75rem', color: theme?.text?.secondary || '#94a3b8' }}>
                        on a <strong style={{ color: theme?.text?.primary || '#e0e6ed' }}>${accountBalance.toLocaleString()}</strong> account
                    </div>
                </div>

                {positionSize && (
                    <RiskGrid>
                        <PlanBox theme={theme}>
                            <PlanLabel theme={theme}>Position Size</PlanLabel>
                            <PlanValue theme={theme}>
                                {isCrypto ? positionSize.units : positionSize.units.toLocaleString()}
                            </PlanValue>
                            <PlanSub theme={theme}>{isCrypto ? 'units' : 'shares'}</PlanSub>
                        </PlanBox>
                        <PlanBox theme={theme}>
                            <PlanLabel theme={theme}>Total Exposure</PlanLabel>
                            <PlanValue theme={theme}>${positionSize.exposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}</PlanValue>
                            <PlanSub theme={theme}>at entry</PlanSub>
                        </PlanBox>
                        <PlanBox $bg="rgba(239,68,68,.04)" $bc="rgba(239,68,68,.12)" theme={theme}>
                            <PlanLabel theme={theme}>Max Loss</PlanLabel>
                            <PlanValue $c="#ef4444">${positionSize.maxLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</PlanValue>
                            <PlanSub theme={theme}>if SL hit</PlanSub>
                        </PlanBox>
                        <PlanBox $bg="rgba(16,185,129,.04)" $bc="rgba(16,185,129,.12)" theme={theme}>
                            <PlanLabel theme={theme}>Target Profit</PlanLabel>
                            <PlanValue $c="#10b981">${positionSize.targetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</PlanValue>
                            <PlanSub theme={theme}>if TP3 hit</PlanSub>
                        </PlanBox>
                    </RiskGrid>
                )}
            </RiskCard>

            {/* ═══ TRACK RECORD STRIP ═══ */}
            {trackRecord && trackRecord.count > 0 && (
                <TrackStrip>
                    <TrackLeft>
                        <TrackTitle theme={theme}>Performance on {setup.setupLabel}s</TrackTitle>
                        <TrackSub theme={theme}>
                            Last {trackRecord.days} days · Every trade tracked publicly. No edits.
                        </TrackSub>
                    </TrackLeft>
                    <TrackNums>
                        <TrackNum>
                            <TrackVal $c={trackRecord.winRate >= 60 ? '#10b981' : trackRecord.winRate >= 45 ? '#f59e0b' : '#94a3b8'}>
                                {trackRecord.winRate}%
                            </TrackVal>
                            <TrackLabel theme={theme}>Win Rate</TrackLabel>
                        </TrackNum>
                        <TrackNum>
                            <TrackVal $c={trackRecord.avgReturn >= 0 ? '#10b981' : '#ef4444'}>
                                {trackRecord.avgReturn >= 0 ? '+' : ''}{trackRecord.avgReturn}%
                            </TrackVal>
                            <TrackLabel theme={theme}>Avg Return</TrackLabel>
                        </TrackNum>
                        <TrackNum>
                            <TrackVal $c={theme?.brand?.primary || '#00adef'}>
                                {trackRecord.count}
                            </TrackVal>
                            <TrackLabel theme={theme}>Trades</TrackLabel>
                        </TrackNum>
                    </TrackNums>
                </TrackStrip>
            )}

            {/* ═══ RELATED OPPORTUNITIES ═══ */}
            {related && related.length > 0 && (
                <RelatedSection>
                    <RelatedHeader>
                        <RelatedTitle theme={theme}>
                            <Sparkles size={14} color={theme?.brand?.primary || '#00adef'} />
                            Other setups the Engine is watching
                        </RelatedTitle>
                        <RelatedSub theme={theme}>Similar setups · click to explore</RelatedSub>
                    </RelatedHeader>
                    <RelatedGrid>
                        {related.map(r => (
                            <RelatedCard
                                key={r.id}
                                theme={theme}
                                onClick={() => navigate(r.isCrypto ? `/crypto/${r.symbol}` : `/stock/${r.symbol}`)}
                            >
                                <RelTop>
                                    <RelSym theme={theme}>{r.symbol}</RelSym>
                                    <RelScore $v={r.aiScore}>{r.aiScore}</RelScore>
                                </RelTop>
                                <RelBias $long={r.bias === 'long'}>
                                    {r.bias === 'long' ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                                    {r.bias === 'long' ? 'LONG' : 'SHORT'}
                                </RelBias>
                                <RelSetup>{r.setupLabel}</RelSetup>
                                <RelWhy theme={theme}>{r.whySurfaced}</RelWhy>
                            </RelatedCard>
                        ))}
                    </RelatedGrid>
                </RelatedSection>
            )}
        </Wrap>
    );
};

export default TradeSetupCard;
