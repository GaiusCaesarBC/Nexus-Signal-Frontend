// client/src/pages/CoPilotPage.js
// Co-Pilot — AI trading co-pilot. Replaces the legacy ChatPage.
// Routes user input through a structured query map first, falling
// back to the existing /chat/message LLM endpoint for free-text.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Bot, Send, Sparkles, Brain, Activity, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownRight, ChevronRight, Target, Zap,
    BarChart3, RefreshCw, Loader2, BookOpen, Beaker, DollarSign,
    Eye, AlertTriangle, CheckCircle
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════
const fmtPct = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    return `${n >= 0 ? '+' : ''}${Number(n).toFixed(2)}%`;
};
const fmtMoney = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${Math.round(n)}`;
};
const fmtPrice = (p) => {
    if (p === null || p === undefined || isNaN(p)) return '--';
    if (Math.abs(p) >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (Math.abs(p) >= 1) return `$${p.toFixed(2)}`;
    if (Math.abs(p) >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(8)}`;
};
const timeAgoSec = (d) => {
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
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const pulseDot = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const dotBounce = keyframes`0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}`;

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
    max-width: 1200px;
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
const HeaderRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: .55rem;
`;
const ModeToggle = styled.div`
    display: flex;
    gap: .25rem;
    padding: .15rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 9px;
`;
const ModeBtn = styled.button`
    padding: .4rem .8rem;
    border-radius: 6px;
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
    display: inline-flex;
    align-items: center;
    gap: .3rem;
    transition: all .15s;
    &:hover { color: ${p => p.theme?.text?.primary || '#e0e6ed'}; }
`;
const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    padding: .45rem .85rem;
    border-radius: 999px;
    background: rgba(0, 173, 237, .06);
    border: 1px solid rgba(0, 173, 237, .25);
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .7rem;
    font-weight: 600;
    white-space: nowrap;
`;
const StatusDot = styled.span`
    width: 7px; height: 7px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px rgba(16,185,129,.6);
    ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
`;

// ─── Live Insights ───────────────────────────────────────
const SectionTitle = styled.h2`
    font-size: .9rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin: 0 0 .25rem;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const SectionSub = styled.div`
    font-size: .7rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-bottom: .8rem;
`;
const InsightsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .65rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
    @media(max-width:800px){grid-template-columns:1fr;}
`;
const InsightCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: .9rem 1rem;
    border-left: 3px solid ${p => p.$accent || '#a78bfa'};
    cursor: pointer;
    transition: all .2s;
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => (p.$accent || '#a78bfa') + '60'};
    }
`;
const InsightLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.$accent || '#a78bfa'};
    font-weight: 800;
    margin-bottom: .35rem;
`;
const InsightHead = styled.div`
    font-size: .95rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .2rem;
`;
const InsightDetail = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    line-height: 1.4;
    margin-bottom: .45rem;
    min-height: 1.7em;
`;
const InsightCTA = styled.button`
    background: transparent;
    border: none;
    color: ${p => (p.$accent || '#a78bfa')};
    font-size: .68rem;
    font-weight: 800;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    &:hover { text-decoration: underline; }
`;

// ─── Suggested Actions ───────────────────────────────────
const ActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .55rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards;`}
    @media(max-width:800px){grid-template-columns:repeat(2,1fr);}
    @media(max-width:500px){grid-template-columns:1fr;}
`;
const ActionBtn = styled.button`
    padding: .9rem 1rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    border-radius: 12px;
    font-size: .82rem;
    font-weight: 700;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: .55rem;
    transition: all .15s;
    &:hover {
        transform: translateY(-2px);
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
        background: ${p => (p.theme?.brand?.primary || '#00adef') + '08'};
    }
`;
const ActionEmoji = styled.span`
    font-size: 1.1rem;
    flex-shrink: 0;
`;

// ─── Chat Thread ─────────────────────────────────────────
const Thread = styled.div`
    display: flex;
    flex-direction: column;
    gap: .9rem;
    margin-bottom: 1rem;
    min-height: 120px;
`;
const UserBubble = styled.div`
    align-self: flex-end;
    max-width: 75%;
    padding: .7rem 1rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    color: #fff;
    border-radius: 14px 14px 4px 14px;
    font-size: .85rem;
    font-weight: 600;
    line-height: 1.45;
    ${css`animation: ${fadeIn} .25s ease-out;`}
`;
const AiBubble = styled.div`
    align-self: flex-start;
    max-width: 90%;
    width: 100%;
    ${css`animation: ${fadeIn} .25s ease-out;`}
`;
const AiText = styled.div`
    padding: .85rem 1.1rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px 14px 14px 4px;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-size: .85rem;
    line-height: 1.55;
    white-space: pre-wrap;
`;
const Typing = styled.div`
    align-self: flex-start;
    padding: .85rem 1.1rem;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px 14px 14px 4px;
    display: inline-flex;
    align-items: center;
    gap: .4rem;
`;
const TypingDot = styled.span`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${p => p.theme?.text?.tertiary || '#64748b'};
    ${p => css`animation: ${dotBounce} 1.4s ease-in-out ${p.$delay}s infinite;`}
`;

// Card primitives — used by every structured response type
const Card = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.$bias === 'long' ? 'rgba(16,185,129,.25)'
        : p.$bias === 'short' ? 'rgba(239,68,68,.25)'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    border-radius: 14px;
    padding: 1rem 1.15rem;
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
            : 'linear-gradient(90deg, transparent, #a78bfa, transparent)'};
    }
`;
const CardLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.$accent || '#a78bfa'};
    font-weight: 800;
    margin-bottom: .35rem;
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const CardHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: .5rem;
    margin-bottom: .35rem;
    flex-wrap: wrap;
`;
const CardSym = styled.div`
    font-size: 1.25rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const Bias = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .2rem;
    padding: .25rem .55rem;
    border-radius: 5px;
    font-size: .62rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$long ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'};
`;
const ScoreLine = styled.div`
    font-size: .7rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .55rem;
`;
const ScoreNum = styled.span`
    font-size: .82rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    margin: 0 .3rem;
`;
const Why = styled.div`
    font-size: .78rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.5;
    margin-bottom: .85rem;
`;
const PlanGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: .4rem;
    margin-bottom: .85rem;
    @media(max-width:500px){grid-template-columns:repeat(2,1fr);}
`;
const PlanBox = styled.div`
    padding: .55rem;
    border-radius: 8px;
    background: ${p => p.$bg || 'rgba(255,255,255,.025)'};
    border: 1px solid ${p => p.$bc || 'rgba(255,255,255,.05)'};
    text-align: center;
`;
const PlanLabel = styled.div`
    font-size: .5rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .15rem;
`;
const PlanValue = styled.div`
    font-size: .82rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
`;
const FollowUps = styled.div`
    display: flex;
    gap: .4rem;
    margin-top: .65rem;
    flex-wrap: wrap;
`;
const FollowBtn = styled.button`
    padding: .4rem .75rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '12'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '30'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 7px;
    font-size: .65rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .25rem;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '22'}; }
`;

// ─── Bias gauge mini ─────────────────────────────────────
const BiasGauge = styled.div`
    position: relative;
    height: 10px;
    background: linear-gradient(to right,
        rgba(239,68,68,.55) 0%,
        rgba(100,116,139,.25) 50%,
        rgba(16,185,129,.55) 100%);
    border-radius: 999px;
    margin: .55rem 0;
`;
const BiasNeedle = styled.div`
    position: absolute;
    top: -4px;
    left: ${p => (p.$pos * 100).toFixed(1)}%;
    transform: translateX(-50%);
    width: 3px;
    height: 18px;
    background: ${p => p.theme?.text?.primary || '#fff'};
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(255,255,255,.45);
`;
const BreadthRow = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: .55rem;
`;
const BreadthItem = styled.div`
    font-size: .68rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
`;
const BreadthVal = styled.strong`
    color: ${p => p.$c || (p.theme?.text?.secondary || '#c8d0da')};
    font-weight: 800;
`;

// ─── Input bar ───────────────────────────────────────────
const InputCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '30'};
    border-radius: 14px;
    padding: .85rem 1rem;
    display: flex;
    align-items: center;
    gap: .55rem;
    margin-bottom: 1rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
`;
const Input = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .88rem;
    font-weight: 600;
    outline: none;
    &::placeholder {
        color: ${p => p.theme?.text?.tertiary || '#64748b'};
        font-weight: 500;
    }
`;
const SendBtn = styled.button`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s;
    &:disabled { opacity: .55; cursor: not-allowed; }
    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    }
`;
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;

// ─── Context footer ──────────────────────────────────────
const ContextFooter = styled.div`
    margin-top: .65rem;
    padding: .65rem .85rem;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.02)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    border-radius: 10px;
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    line-height: 1.5;
`;
const ContextLabel = styled.span`
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    font-weight: 800;
`;

// ═══════════════════════════════════════════════════════════
// SUGGESTED ACTIONS — config per mode
// ═══════════════════════════════════════════════════════════
const ACTIONS_BY_MODE = {
    trading: [
        { emoji: '🎯', label: 'Show me the best trade right now', query: 'best trade' },
        { emoji: '🔥', label: "What's the strongest setup today?", query: 'strongest setup' },
        { emoji: '💰', label: 'Where is smart money moving?', query: 'smart money' },
        { emoji: '📊', label: 'Is the market bullish or bearish?', query: 'market bias' },
        { emoji: '⚡', label: 'What patterns are forming?', query: 'patterns forming' },
        { emoji: '🧠', label: 'Analyze a symbol for me', query: 'analyze symbol' }
    ],
    learning: [
        { emoji: '📚', label: 'How does RSI work?', query: 'How does RSI work?' },
        { emoji: '💡', label: "What's a breakout pattern?", query: 'What is a breakout pattern?' },
        { emoji: '🛡️', label: 'How do I manage risk?', query: 'How do I manage risk in trading?' },
        { emoji: '📈', label: 'Explain support and resistance', query: 'Explain support and resistance' },
        { emoji: '⚖️', label: "What's a good R/R ratio?", query: 'What is a good risk reward ratio?' },
        { emoji: '🔍', label: 'How do I read a chart?', query: 'How do I read a stock chart?' }
    ],
    strategy: [
        { emoji: '🧪', label: 'Backtest an MA crossover strategy', query: 'backtest ma crossover' },
        { emoji: '📊', label: 'Compare two assets', query: 'compare' },
        { emoji: '🎯', label: 'Best risk-adjusted strategy?', query: 'best risk adjusted strategy' },
        { emoji: '⚙️', label: 'How do I optimize parameters?', query: 'How do I optimize strategy parameters?' },
        { emoji: '📉', label: 'How to handle drawdowns?', query: 'How do I reduce strategy drawdowns?' },
        { emoji: '🔄', label: 'Mean reversion vs trend following?', query: 'mean reversion vs trend following' }
    ]
};

// ═══════════════════════════════════════════════════════════
// QUERY ROUTER — maps user input to platform endpoints
// Returns null if no match, falls through to LLM
// ═══════════════════════════════════════════════════════════
function buildQueryRouter(api) {
    const fetcher = (path) => api
        ? api.get(path).then(r => r.data)
        : fetch(`${API_URL}${path}`).then(r => r.json());

    return [
        {
            keywords: ['best trade', 'top trade', 'best opportunity', 'top opportunity', 'show me the best'],
            handler: async () => {
                const res = await fetcher('/opportunities/featured?limit=1');
                const opp = res?.opportunities?.[0];
                if (!opp) return { type: 'AiText', text: 'No high-confidence opportunities are active right now. Check the Opportunity Engine for more setups, or try again in a few minutes.' };
                return { type: 'OpportunityCard', data: opp };
            }
        },
        {
            keywords: ['strongest setup', 'best setup', 'top setup', 'strongest signal'],
            handler: async () => {
                const res = await fetcher('/opportunities/featured?limit=1');
                const opp = res?.opportunities?.[0];
                if (!opp) return { type: 'AiText', text: 'No strong setups are active right now.' };
                return { type: 'OpportunityCard', data: opp };
            }
        },
        {
            keywords: ['smart money', 'whale', 'insider', 'institution'],
            handler: async () => {
                const res = await fetcher('/whale/smart-money');
                if (!res?.bias) return { type: 'AiText', text: "I couldn't load smart money data right now. Try the Smart Money page directly." };
                return { type: 'SmartMoneyCard', data: res };
            }
        },
        {
            keywords: ['market bias', 'market mood', 'bullish or bearish', 'how is the market', 'market sentiment'],
            handler: async () => {
                const res = await fetcher('/heatmap/pulse');
                if (!res?.sentiment) return { type: 'AiText', text: "I couldn't load market pulse data right now." };
                return { type: 'MarketBiasCard', data: res };
            }
        },
        {
            keywords: ['patterns forming', 'patterns', 'breakout', 'pattern setups'],
            handler: async () => {
                const res = await fetcher('/patterns/intelligence/featured?limit=1');
                const pat = res?.patterns?.[0];
                if (!pat) return { type: 'AiText', text: 'No high-probability patterns are confirmed right now. Check Pattern Intelligence for forming patterns.' };
                return { type: 'PatternCard', data: pat };
            }
        },
        {
            keywords: ['compare'],
            handler: async () => ({ type: 'RedirectCard', data: { url: '/compare', label: 'Asset Showdown', sub: 'Compare 2-5 assets head-to-head and find the best trade in the group' } })
        },
        {
            keywords: ['backtest'],
            handler: async () => ({ type: 'RedirectCard', data: { url: '/backtesting', label: 'Strategy Lab', sub: 'Test, evaluate, and improve trading strategies' } })
        }
    ];
}

// Symbol detection — $TICKER or bare TICKER (3-5 caps)
const TICKER_REGEX = /(?:^|\s)\$?([A-Z]{2,5})(?:\s|$)/;
function detectSymbol(text) {
    const match = text.match(TICKER_REGEX);
    if (!match) return null;
    const sym = match[1];
    // Filter common false positives
    const stopwords = new Set(['AI', 'AND', 'THE', 'FOR', 'YES', 'NO', 'MA', 'RSI', 'MACD', 'SL', 'TP', 'BTC', 'ETH', 'NVDA', 'AAPL', 'TSLA', 'AMD']);
    // BTC, ETH, etc. are valid tickers — only filter pure English stopwords
    const englishOnly = new Set(['AI', 'AND', 'THE', 'FOR', 'YES', 'NO']);
    if (englishOnly.has(sym)) return null;
    return sym;
}

// ═══════════════════════════════════════════════════════════
// RESPONSE CARD COMPONENTS
// ═══════════════════════════════════════════════════════════
function OpportunityCardView({ data, theme, onAction }) {
    const isLong = data.bias === 'long';
    return (
        <Card theme={theme} $bias={data.bias}>
            <CardLabel $accent="#a78bfa"><Sparkles size={11} /> TOP OPPORTUNITY</CardLabel>
            <CardHead>
                <CardSym theme={theme}>{data.symbol}</CardSym>
                <Bias $long={isLong}>
                    {isLong ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {isLong ? 'LONG' : 'SHORT'}
                </Bias>
            </CardHead>
            <ScoreLine theme={theme}>
                {data.setupLabel || 'Active Setup'}
                <ScoreNum $v={data.aiScore}>· AI {data.aiScore}</ScoreNum>
                · Confidence {data.confidence}%
            </ScoreLine>
            <Why theme={theme}>{data.whySurfaced}</Why>
            <PlanGrid>
                <PlanBox theme={theme}>
                    <PlanLabel theme={theme}>Entry</PlanLabel>
                    <PlanValue theme={theme}>{fmtPrice(data.entry)}</PlanValue>
                </PlanBox>
                <PlanBox theme={theme} $bg="rgba(239,68,68,.04)" $bc="rgba(239,68,68,.12)">
                    <PlanLabel theme={theme}>Stop Loss</PlanLabel>
                    <PlanValue theme={theme} $c="#ef4444">{fmtPrice(data.sl)}</PlanValue>
                </PlanBox>
                <PlanBox theme={theme} $bg="rgba(16,185,129,.04)" $bc="rgba(16,185,129,.12)">
                    <PlanLabel theme={theme}>Target</PlanLabel>
                    <PlanValue theme={theme} $c="#10b981">{fmtPrice(data.tp3)}</PlanValue>
                </PlanBox>
                <PlanBox theme={theme}>
                    <PlanLabel theme={theme}>R / R</PlanLabel>
                    <PlanValue theme={theme} $c={theme?.brand?.primary || '#00adef'}>1:{data.rr || '--'}</PlanValue>
                </PlanBox>
            </PlanGrid>
            <FollowUps>
                <FollowBtn theme={theme} onClick={() => onAction('view', data)}>
                    View Trade Setup <ChevronRight size={11} />
                </FollowBtn>
                <FollowBtn theme={theme} onClick={() => onAction('paper', data)}>
                    Paper Trade
                </FollowBtn>
                <FollowBtn theme={theme} onClick={() => onAction('watchlist', data)}>
                    Watchlist
                </FollowBtn>
                <FollowBtn theme={theme} onClick={() => onAction('opportunities')}>
                    See More Setups
                </FollowBtn>
            </FollowUps>
        </Card>
    );
}

function MarketBiasCardView({ data, theme, onAction }) {
    const sentiment = data.sentiment || {};
    return (
        <Card theme={theme}>
            <CardLabel $accent="#0ea5e9"><BarChart3 size={11} /> MARKET BIAS</CardLabel>
            <CardHead>
                <CardSym theme={theme} style={{ fontSize: '1.05rem' }}>{sentiment.label || 'Market Mood'}</CardSym>
            </CardHead>
            <BiasGauge>
                <BiasNeedle theme={theme} $pos={sentiment.needlePosition ?? 0.5} />
            </BiasGauge>
            <BreadthRow>
                <BreadthItem theme={theme}>Up: <BreadthVal $c="#10b981">{sentiment.breadth?.up ?? 0}</BreadthVal></BreadthItem>
                <BreadthItem theme={theme}>Down: <BreadthVal $c="#ef4444">{sentiment.breadth?.down ?? 0}</BreadthVal></BreadthItem>
                <BreadthItem theme={theme}>Avg: <BreadthVal $c={(sentiment.avgMove ?? 0) >= 0 ? '#10b981' : '#ef4444'}>{fmtPct(sentiment.avgMove)}</BreadthVal></BreadthItem>
                <BreadthItem theme={theme}>Dispersion: <BreadthVal>{sentiment.dispersion || '--'}</BreadthVal></BreadthItem>
            </BreadthRow>
            {data.insight?.text && <Why theme={theme}>{data.insight.text}</Why>}
            <FollowUps>
                <FollowBtn theme={theme} onClick={() => onAction('pulse')}>
                    Open Market Pulse <ChevronRight size={11} />
                </FollowBtn>
                <FollowBtn theme={theme} onClick={() => onAction('opportunities')}>
                    Aligned Opportunities
                </FollowBtn>
            </FollowUps>
        </Card>
    );
}

function SmartMoneyCardView({ data, theme, onAction }) {
    const bias = data.bias || {};
    const topSignal = data.signals?.[0];
    return (
        <Card theme={theme} $bias={bias.bucket?.includes('bullish') ? 'long' : bias.bucket?.includes('bearish') ? 'short' : null}>
            <CardLabel $accent="#10b981"><DollarSign size={11} /> SMART MONEY</CardLabel>
            <CardHead>
                <CardSym theme={theme} style={{ fontSize: '1.05rem' }}>{bias.label || 'Smart Money Flow'}</CardSym>
            </CardHead>
            <BreadthRow>
                <BreadthItem theme={theme}>Buys: <BreadthVal $c="#10b981">{bias.buys ?? 0}</BreadthVal></BreadthItem>
                <BreadthItem theme={theme}>Sells: <BreadthVal $c="#ef4444">{bias.sells ?? 0}</BreadthVal></BreadthItem>
                <BreadthItem theme={theme}>Net Flow: <BreadthVal $c={(bias.netDollarFlow ?? 0) >= 0 ? '#10b981' : '#ef4444'}>
                    {(bias.netDollarFlow ?? 0) >= 0 ? '+' : '−'}{fmtMoney(Math.abs(bias.netDollarFlow ?? 0))}
                </BreadthVal></BreadthItem>
            </BreadthRow>
            {data.insight?.text && <Why theme={theme}>{data.insight.text}</Why>}
            {topSignal && (
                <div style={{
                    padding: '.55rem .7rem',
                    background: 'rgba(255,255,255,.025)',
                    border: '1px solid rgba(255,255,255,.06)',
                    borderRadius: 8,
                    marginBottom: '.55rem',
                    fontSize: '.72rem'
                }}>
                    <div style={{ color: theme?.text?.tertiary || '#64748b', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 800, marginBottom: 4 }}>
                        Top Signal
                    </div>
                    <div style={{ color: theme?.text?.primary || '#fff', fontWeight: 800 }}>
                        {topSignal.symbol} · {fmtMoney(topSignal.dollarAmount)} {topSignal.direction?.toUpperCase()}
                    </div>
                </div>
            )}
            <FollowUps>
                <FollowBtn theme={theme} onClick={() => onAction('smart-money')}>
                    Open Smart Money <ChevronRight size={11} />
                </FollowBtn>
            </FollowUps>
        </Card>
    );
}

function PatternCardView({ data, theme, onAction }) {
    const isLong = data.bias === 'long';
    return (
        <Card theme={theme} $bias={data.bias}>
            <CardLabel $accent="#a78bfa"><Brain size={11} /> PATTERN INTELLIGENCE</CardLabel>
            <CardHead>
                <CardSym theme={theme}>{data.symbol}</CardSym>
                <Bias $long={isLong}>
                    {isLong ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {isLong ? 'LONG' : 'SHORT'}
                </Bias>
            </CardHead>
            <ScoreLine theme={theme}>
                {data.patternLabel}
                <ScoreNum $v={data.patternScore}>· Score {data.patternScore}</ScoreNum>
                · {data.stage?.replace('_', ' ').toUpperCase()}
            </ScoreLine>
            <Why theme={theme}>{data.whyMatters}</Why>
            {data.expectedMove && (
                <PlanGrid style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <PlanBox theme={theme}>
                        <PlanLabel theme={theme}>Expected Move</PlanLabel>
                        <PlanValue theme={theme} $c={data.expectedMove.min >= 0 ? '#10b981' : '#ef4444'}>
                            {data.expectedMove.min >= 0 ? '+' : ''}{data.expectedMove.min}% to {data.expectedMove.max >= 0 ? '+' : ''}{data.expectedMove.max}%
                        </PlanValue>
                    </PlanBox>
                    <PlanBox theme={theme}>
                        <PlanLabel theme={theme}>R / R</PlanLabel>
                        <PlanValue theme={theme} $c={theme?.brand?.primary || '#00adef'}>1:{data.rr || '--'}</PlanValue>
                    </PlanBox>
                </PlanGrid>
            )}
            <FollowUps>
                <FollowBtn theme={theme} onClick={() => onAction('view', data)}>
                    View Trade Setup <ChevronRight size={11} />
                </FollowBtn>
                <FollowBtn theme={theme} onClick={() => onAction('patterns')}>
                    See All Patterns
                </FollowBtn>
            </FollowUps>
        </Card>
    );
}

function SymbolAnalysisCardView({ data, symbol, theme, onAction }) {
    if (!data || !data.opportunity) {
        return (
            <Card theme={theme}>
                <CardLabel $accent="#a78bfa"><Eye size={11} /> ANALYSIS</CardLabel>
                <CardHead>
                    <CardSym theme={theme}>{symbol}</CardSym>
                </CardHead>
                <Why theme={theme}>
                    No active high-confidence setup detected for {symbol} right now. The Engine is continuously scanning — try the asset page to run an on-demand analysis.
                </Why>
                <FollowUps>
                    <FollowBtn theme={theme} onClick={() => onAction('asset', { symbol })}>
                        Open Asset Page <ChevronRight size={11} />
                    </FollowBtn>
                </FollowUps>
            </Card>
        );
    }
    return <OpportunityCardView data={data.opportunity} theme={theme} onAction={onAction} />;
}

function RedirectCardView({ data, theme, onAction }) {
    return (
        <Card theme={theme}>
            <CardLabel $accent="#0ea5e9"><Zap size={11} /> SUGGESTED PAGE</CardLabel>
            <CardHead>
                <CardSym theme={theme} style={{ fontSize: '1.05rem' }}>{data.label}</CardSym>
            </CardHead>
            <Why theme={theme}>{data.sub}</Why>
            <FollowUps>
                <FollowBtn theme={theme} onClick={() => onAction('navigate', data)}>
                    Open {data.label} <ChevronRight size={11} />
                </FollowBtn>
            </FollowUps>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const CoPilotPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const threadEndRef = useRef(null);

    const [mode, setMode] = useState('trading');
    const [input, setInput] = useState('');
    const [thread, setThread] = useState([]);
    const [sending, setSending] = useState(false);

    // Live insights state
    const [insights, setInsights] = useState({
        opportunity: null,
        market: null,
        smartMoney: null,
        loading: true,
        refreshedAt: null
    });

    // Fetch live insights snapshot for the top section
    const fetchInsights = useCallback(async () => {
        const fetcher = (path) => api
            ? api.get(path).then(r => r.data).catch(() => null)
            : fetch(`${API_URL}${path}`).then(r => r.ok ? r.json() : null).catch(() => null);

        const [oppStatus, oppFeatured, marketPulse, smartMoney] = await Promise.all([
            fetcher('/opportunities/status'),
            fetcher('/opportunities/featured?limit=1'),
            fetcher('/heatmap/pulse'),
            fetcher('/whale/smart-money')
        ]);

        setInsights({
            opportunity: {
                count: oppStatus?.total ?? null,
                bias: oppStatus?.bias ?? null,
                topSymbol: oppFeatured?.opportunities?.[0]?.symbol ?? null,
                topScore: oppFeatured?.opportunities?.[0]?.aiScore ?? null
            },
            market: {
                label: marketPulse?.sentiment?.label ?? null,
                upPct: marketPulse?.sentiment ? Math.round((marketPulse.sentiment.breadth?.up || 0) /
                    Math.max(1, (marketPulse.sentiment.breadth?.up || 0) + (marketPulse.sentiment.breadth?.down || 0)) * 100) : null,
                insightSnippet: marketPulse?.insight?.text?.slice(0, 60)
            },
            smartMoney: {
                label: smartMoney?.bias?.label ?? null,
                netFlow: smartMoney?.bias?.netDollarFlow ?? null,
                topSymbol: smartMoney?.signals?.[0]?.symbol ?? null
            },
            loading: false,
            refreshedAt: new Date()
        });
    }, [api]);

    useEffect(() => { fetchInsights(); }, [fetchInsights]);
    useEffect(() => {
        const iv = setInterval(fetchInsights, 60000);
        return () => clearInterval(iv);
    }, [fetchInsights]);

    // Auto-scroll thread on new messages
    useEffect(() => {
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [thread, sending]);

    const router = useMemo(() => buildQueryRouter(api), [api]);

    // Match user input against the structured query router
    const matchRouter = useCallback((text) => {
        const lower = text.toLowerCase();
        for (const route of router) {
            if (route.keywords?.some(k => lower.includes(k))) return route;
        }
        return null;
    }, [router]);

    const handleAction = useCallback(async (action, data) => {
        switch (action) {
            case 'view':
                if (data?.signalId || data?.id) navigate(`/signal/${data.signalId || data.id}`);
                else if (data?.symbol) navigate(data.isCrypto ? `/crypto/${data.symbol}` : `/stock/${data.symbol}`);
                break;
            case 'paper':
                if (!data) return;
                navigate('/paper-trading', {
                    state: {
                        signal: {
                            symbol: data.symbol,
                            long: data.bias === 'long',
                            crypto: data.isCrypto,
                            entry: data.entry,
                            sl: data.sl,
                            tp1: data.tp1, tp2: data.tp2, tp3: data.tp3,
                            conf: data.confidence,
                            rr: data.rr
                        }
                    }
                });
                break;
            case 'watchlist':
                if (api && data?.symbol) {
                    api.post('/watchlist/add', { symbol: data.symbol, type: data.isCrypto ? 'crypto' : 'stock' }).catch(() => {});
                }
                break;
            case 'asset':
                if (data?.symbol) navigate(data.isCrypto ? `/crypto/${data.symbol}` : `/stock/${data.symbol}`);
                break;
            case 'opportunities': navigate('/opportunities'); break;
            case 'patterns':      navigate('/patterns'); break;
            case 'pulse':         navigate('/pulse'); break;
            case 'smart-money':   navigate('/smart-money'); break;
            case 'navigate':      if (data?.url) navigate(data.url); break;
            default: break;
        }
    }, [api, navigate]);

    const sendMessage = useCallback(async (text) => {
        const message = String(text || '').trim();
        if (!message || sending) return;

        // Add user message to thread
        setThread(t => [...t, { id: Date.now() + '-u', role: 'user', text: message }]);
        setInput('');
        setSending(true);

        try {
            // 1. Symbol detection — short-circuit to symbol analysis
            const symbol = detectSymbol(message);
            if (symbol && !matchRouter(message)) {
                const fetcher = (path) => api
                    ? api.get(path).then(r => r.data).catch(() => null)
                    : fetch(`${API_URL}${path}`).then(r => r.ok ? r.json() : null).catch(() => null);
                const data = await fetcher(`/opportunities/by-symbol/${symbol}`);
                setThread(t => [...t, {
                    id: Date.now() + '-a',
                    role: 'assistant',
                    card: { type: 'SymbolAnalysisCard', data, symbol }
                }]);
                setSending(false);
                return;
            }

            // 2. Structured router match
            const matched = matchRouter(message);
            if (matched) {
                const result = await matched.handler(message);
                setThread(t => [...t, {
                    id: Date.now() + '-a',
                    role: 'assistant',
                    card: result
                }]);
                setSending(false);
                return;
            }

            // 3. Fall through to LLM /chat/message
            if (!api) {
                setThread(t => [...t, {
                    id: Date.now() + '-a',
                    role: 'assistant',
                    card: { type: 'AiText', text: 'Sign in to use the free-text Co-Pilot. The structured queries above work without an account.' }
                }]);
                setSending(false);
                return;
            }

            const res = await api.post('/chat/message', {
                message,
                conversationHistory: thread.slice(-6).map(t => ({
                    role: t.role,
                    content: t.text || (t.card?.type === 'AiText' ? t.card.text : '[structured response]')
                }))
            });

            setThread(t => [...t, {
                id: Date.now() + '-a',
                role: 'assistant',
                card: { type: 'AiText', text: res.data?.response || 'No response' }
            }]);
        } catch (err) {
            console.error('[CoPilot] send failed:', err);
            setThread(t => [...t, {
                id: Date.now() + '-a',
                role: 'assistant',
                card: { type: 'AiText', text: "I'm having trouble connecting right now. Try one of the suggested actions above." }
            }]);
        } finally {
            setSending(false);
        }
    }, [api, sending, thread, matchRouter]);

    const handleSuggested = useCallback((query) => {
        sendMessage(query);
    }, [sendMessage]);

    const renderCard = (card) => {
        if (!card) return null;
        switch (card.type) {
            case 'OpportunityCard':
                return <OpportunityCardView data={card.data} theme={theme} onAction={handleAction} />;
            case 'MarketBiasCard':
                return <MarketBiasCardView data={card.data} theme={theme} onAction={handleAction} />;
            case 'SmartMoneyCard':
                return <SmartMoneyCardView data={card.data} theme={theme} onAction={handleAction} />;
            case 'PatternCard':
                return <PatternCardView data={card.data} theme={theme} onAction={handleAction} />;
            case 'SymbolAnalysisCard':
                return <SymbolAnalysisCardView data={card.data} symbol={card.symbol} theme={theme} onAction={handleAction} />;
            case 'RedirectCard':
                return <RedirectCardView data={card.data} theme={theme} onAction={handleAction} />;
            case 'AiText':
            default:
                return <AiText theme={theme}>{card.text}</AiText>;
        }
    };

    const actions = ACTIONS_BY_MODE[mode] || ACTIONS_BY_MODE.trading;

    return (
        <Page theme={theme}>
            <SEO
                title="Co-Pilot — Nexus Signal AI"
                description="Your AI trading co-pilot — real-time insights, trade ideas, and market intelligence powered by live platform data."
            />
            <Container>
                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Bot size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            Co-Pilot
                        </H1>
                        <Subhead theme={theme}>
                            Your AI trading co-pilot — real-time insights, trade ideas, and market intelligence powered by live platform data.
                        </Subhead>
                    </HeaderLeft>
                    <HeaderRight>
                        <ModeToggle theme={theme}>
                            <ModeBtn theme={theme} $active={mode === 'trading'} onClick={() => setMode('trading')}>
                                <Target size={11} /> Trading
                            </ModeBtn>
                            <ModeBtn theme={theme} $active={mode === 'learning'} onClick={() => setMode('learning')}>
                                <BookOpen size={11} /> Learning
                            </ModeBtn>
                            <ModeBtn theme={theme} $active={mode === 'strategy'} onClick={() => setMode('strategy')}>
                                <Beaker size={11} /> Strategy
                            </ModeBtn>
                        </ModeToggle>
                        <StatusPill theme={theme}>
                            <StatusDot />
                            Live · {insights.opportunity?.count ?? '--'} opportunities · {insights.refreshedAt ? timeAgoSec(insights.refreshedAt) : '...'}
                        </StatusPill>
                    </HeaderRight>
                </HeaderRow>

                {/* ═══ LIVE AI INSIGHTS ═══ */}
                <SectionTitle theme={theme}>
                    <Brain size={14} color="#a78bfa" />
                    🧠 Live AI Insights
                </SectionTitle>
                <SectionSub theme={theme}>
                    Real-time signals computed from the entire platform — refreshes every 60s
                </SectionSub>
                <InsightsGrid>
                    <InsightCard theme={theme} $accent="#a78bfa" onClick={() => navigate('/opportunities')}>
                        <InsightLabel $accent="#a78bfa">🎯 OPPORTUNITY</InsightLabel>
                        <InsightHead theme={theme}>
                            {insights.opportunity?.count ?? '--'} active setups
                        </InsightHead>
                        <InsightDetail theme={theme}>
                            {insights.opportunity?.bias ? `${insights.opportunity.bias} bias` : 'Loading...'}
                            {insights.opportunity?.topSymbol && ` · Top: ${insights.opportunity.topSymbol} AI ${insights.opportunity.topScore}`}
                        </InsightDetail>
                        <InsightCTA $accent="#a78bfa">Show me the best <ChevronRight size={11} /></InsightCTA>
                    </InsightCard>

                    <InsightCard theme={theme} $accent="#0ea5e9" onClick={() => navigate('/pulse')}>
                        <InsightLabel $accent="#0ea5e9">📊 MARKET</InsightLabel>
                        <InsightHead theme={theme}>
                            {insights.market?.label || 'Loading...'}
                        </InsightHead>
                        <InsightDetail theme={theme}>
                            {insights.market?.upPct !== null
                                ? `${insights.market.upPct}% of names up`
                                : 'Awaiting market pulse'}
                            {insights.market?.insightSnippet && ` · ${insights.market.insightSnippet}...`}
                        </InsightDetail>
                        <InsightCTA $accent="#0ea5e9">Drill in <ChevronRight size={11} /></InsightCTA>
                    </InsightCard>

                    <InsightCard theme={theme} $accent="#10b981" onClick={() => navigate('/smart-money')}>
                        <InsightLabel $accent="#10b981">💰 SMART MONEY</InsightLabel>
                        <InsightHead theme={theme}>
                            {insights.smartMoney?.label || 'Loading...'}
                        </InsightHead>
                        <InsightDetail theme={theme}>
                            {insights.smartMoney?.netFlow !== null
                                ? `Net ${(insights.smartMoney.netFlow ?? 0) >= 0 ? '+' : '−'}${fmtMoney(Math.abs(insights.smartMoney.netFlow ?? 0))}`
                                : 'Awaiting flow data'}
                            {insights.smartMoney?.topSymbol && ` · Top: ${insights.smartMoney.topSymbol}`}
                        </InsightDetail>
                        <InsightCTA $accent="#10b981">See moves <ChevronRight size={11} /></InsightCTA>
                    </InsightCard>
                </InsightsGrid>

                {/* ═══ SUGGESTED ACTIONS ═══ */}
                <SectionTitle theme={theme}>
                    <Zap size={14} color="#f59e0b" />
                    ⚡ What should you do?
                </SectionTitle>
                <SectionSub theme={theme}>
                    Click any question to get an instant answer powered by live data
                </SectionSub>
                <ActionsGrid>
                    {actions.map(a => (
                        <ActionBtn
                            key={a.label}
                            theme={theme}
                            onClick={() => handleSuggested(a.query)}
                            disabled={sending}
                        >
                            <ActionEmoji>{a.emoji}</ActionEmoji>
                            <span>{a.label}</span>
                        </ActionBtn>
                    ))}
                </ActionsGrid>

                {/* ═══ CHAT THREAD ═══ */}
                {(thread.length > 0 || sending) && (
                    <Thread>
                        {thread.map(msg => (
                            msg.role === 'user'
                                ? <UserBubble key={msg.id} theme={theme}>{msg.text}</UserBubble>
                                : <AiBubble key={msg.id}>{renderCard(msg.card)}</AiBubble>
                        ))}
                        {sending && (
                            <Typing theme={theme}>
                                <TypingDot theme={theme} $delay={0} />
                                <TypingDot theme={theme} $delay={0.16} />
                                <TypingDot theme={theme} $delay={0.32} />
                            </Typing>
                        )}
                        <div ref={threadEndRef} />
                    </Thread>
                )}

                {/* ═══ INPUT BAR ═══ */}
                <InputCard theme={theme}>
                    <Sparkles size={16} color={theme?.brand?.primary || '#00adef'} />
                    <Input
                        theme={theme}
                        placeholder="Ask Co-Pilot... or type $TICKER to analyze instantly"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
                        disabled={sending}
                    />
                    <SendBtn
                        theme={theme}
                        onClick={() => sendMessage(input)}
                        disabled={sending || !input.trim()}
                    >
                        {sending ? <SpinningLoader size={14} /> : <Send size={14} />}
                    </SendBtn>
                </InputCard>

                {/* ═══ CONTEXT FOOTER ═══ */}
                <ContextFooter theme={theme}>
                    <ContextLabel theme={theme}>Using:</ContextLabel> Opportunity Engine · Pattern Intelligence · Market Pulse · Sentiment Pulse · Smart Money
                    {insights.refreshedAt && <> · Updated {timeAgoSec(insights.refreshedAt)}</>}
                </ContextFooter>
            </Container>
        </Page>
    );
};

export default CoPilotPage;
