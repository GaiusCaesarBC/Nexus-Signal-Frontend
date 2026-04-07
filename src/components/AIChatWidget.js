// client/src/components/AIChatWidget.js
// Smart Trading Assistant — premium fintech chat widget for Nexus Signal AI.
// Routes structured queries against live platform data and falls through to
// /chat/message for free-text. Designed to drive feature discovery + action,
// not generic conversation.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Bot, X, Send, Minimize2, Maximize2, Sparkles, Brain,
    ChevronRight, ArrowUpRight, ArrowDownRight, Zap, MessageSquare,
    TrendingUp, Activity, DollarSign, Loader2
} from 'lucide-react';

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

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const pulseDot = keyframes`0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(1.15)}`;
const dotBounce = keyframes`0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 8px 30px rgba(0,173,237,.45); }
    50%      { box-shadow: 0 8px 40px rgba(167,139,250,.55); }
`;

// ═══════════════════════════════════════════════════════════
// STYLED — premium dark fintech, themed throughout
// ═══════════════════════════════════════════════════════════
const Container = styled.div`
    position: fixed;
    bottom: 1.75rem;
    left: 1.75rem;
    z-index: 999;
    @media (max-width: 600px) {
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
    }
`;

// ─── Floating bubble (closed state) ───────────────────────
const Bubble = styled.button`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'} 0%,
        ${p => p.theme?.brand?.secondary || '#a78bfa'} 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all .25s ease;
    ${css`animation: ${glowPulse} 4s ease-in-out infinite;`}
    &:hover { transform: scale(1.08); }
`;
const NotificationDot = styled.span`
    position: absolute;
    top: 4px;
    right: 4px;
    width: 12px;
    height: 12px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid ${p => p.theme?.bg?.elevated || '#0f1729'};
`;

// ─── Window (open state) ──────────────────────────────────
const Window = styled.div`
    width: 400px;
    max-width: calc(100vw - 2rem);
    height: 620px;
    max-height: calc(100vh - 4rem);
    display: flex;
    flex-direction: column;
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.97)'};
    border: 1px solid rgba(167, 139, 250, .25);
    border-radius: 18px;
    box-shadow:
        0 24px 48px rgba(0, 0, 0, .55),
        0 0 0 1px rgba(255, 255, 255, .04);
    overflow: hidden;
    backdrop-filter: blur(16px);
    ${css`animation: ${fadeIn} .25s ease-out;`}
    @media (max-width: 600px) {
        width: 100%;
        height: 78vh;
    }
`;

// ─── Header ──────────────────────────────────────────────
const Header = styled.div`
    padding: 1rem 1.15rem;
    background: linear-gradient(135deg,
        rgba(0, 173, 237, .12) 0%,
        rgba(167, 139, 250, .12) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, .06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
`;
const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: .65rem;
`;
const Avatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#a78bfa'});
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px rgba(167, 139, 250, .35);
`;
const HeaderInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: .15rem;
`;
const HeaderTitle = styled.div`
    font-size: .92rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#fff'};
    letter-spacing: .2px;
`;
const HeaderStatus = styled.div`
    display: flex;
    align-items: center;
    gap: .35rem;
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    font-weight: 600;
`;
const StatusDot = styled.span`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px rgba(16, 185, 129, .7);
    ${css`animation: ${pulseDot} 2s ease-in-out infinite;`}
`;
const HeaderActions = styled.div`
    display: flex;
    gap: .25rem;
`;
const IconBtn = styled.button`
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .06);
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s;
    &:hover {
        color: ${p => p.theme?.brand?.primary || '#00adef'};
        border-color: rgba(0, 173, 237, .35);
        background: rgba(0, 173, 237, .08);
    }
`;

// ─── Content body ─────────────────────────────────────────
const Body = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 1rem 1.15rem;
    gap: .75rem;
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, .06);
        border-radius: 3px;
    }
`;

const Tagline = styled.div`
    font-size: .78rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.5;
    font-weight: 500;
    margin-bottom: .15rem;
`;

// ─── Smart Action buttons ────────────────────────────────
const SectionLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin: .25rem 0 .15rem;
`;
const ActionGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: .4rem;
`;
const ActionBtn = styled.button`
    padding: .7rem .85rem;
    background: rgba(255, 255, 255, .025);
    border: 1px solid rgba(255, 255, 255, .06);
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    border-radius: 10px;
    font-size: .78rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: .55rem;
    transition: all .15s;
    ${css`animation: ${slideUp} .3s ease-out backwards;`}
    &:hover {
        transform: translateX(3px);
        border-color: rgba(0, 173, 237, .35);
        background: rgba(0, 173, 237, .06);
        color: ${p => p.theme?.text?.primary || '#fff'};
    }
`;
const ActionEmoji = styled.span`
    font-size: 1rem;
    flex-shrink: 0;
`;

// ─── System integration tags ──────────────────────────────
const IntegrationCard = styled.div`
    margin-top: .3rem;
    padding: .65rem .85rem;
    background: rgba(167, 139, 250, .04);
    border: 1px solid rgba(167, 139, 250, .15);
    border-radius: 10px;
`;
const IntegrationLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: #a78bfa;
    font-weight: 800;
    margin-bottom: .35rem;
    display: flex;
    align-items: center;
    gap: .3rem;
`;
const TagRow = styled.div`
    display: flex;
    gap: .3rem;
    flex-wrap: wrap;
`;
const Tag = styled.span`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .4px;
    padding: .2rem .5rem;
    background: rgba(255, 255, 255, .04);
    border: 1px solid rgba(255, 255, 255, .08);
    color: ${p => p.theme?.text?.tertiary || '#94a3b8'};
    border-radius: 5px;
    font-weight: 700;
`;

// ─── Primary CTA ─────────────────────────────────────────
const PrimaryCTA = styled.button`
    margin-top: .25rem;
    padding: .85rem 1rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'} 0%,
        ${p => p.theme?.brand?.secondary || '#a78bfa'} 100%);
    border: none;
    border-radius: 11px;
    color: #fff;
    font-size: .85rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .45rem;
    transition: all .2s;
    box-shadow: 0 6px 20px rgba(0, 173, 237, .25);
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(167, 139, 250, .45);
    }
`;

// ─── Chat thread ─────────────────────────────────────────
const Thread = styled.div`
    display: flex;
    flex-direction: column;
    gap: .55rem;
`;
const UserMsg = styled.div`
    align-self: flex-end;
    max-width: 85%;
    padding: .55rem .85rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#a78bfa'});
    color: #fff;
    border-radius: 12px 12px 4px 12px;
    font-size: .78rem;
    font-weight: 600;
    line-height: 1.45;
    ${css`animation: ${slideUp} .2s ease-out;`}
`;
const AiMsg = styled.div`
    align-self: flex-start;
    max-width: 92%;
    width: 100%;
    ${css`animation: ${slideUp} .2s ease-out;`}
`;
const AiText = styled.div`
    padding: .65rem .9rem;
    background: rgba(255, 255, 255, .03);
    border: 1px solid rgba(255, 255, 255, .06);
    border-radius: 12px 12px 12px 4px;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-size: .78rem;
    line-height: 1.55;
    white-space: pre-wrap;
`;
const Typing = styled.div`
    align-self: flex-start;
    padding: .65rem .9rem;
    background: rgba(255, 255, 255, .03);
    border: 1px solid rgba(255, 255, 255, .06);
    border-radius: 12px 12px 12px 4px;
    display: inline-flex;
    align-items: center;
    gap: .35rem;
`;
const TypingDot = styled.span`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${p => p.theme?.text?.tertiary || '#64748b'};
    ${p => css`animation: ${dotBounce} 1.4s ease-in-out ${p.$d}s infinite;`}
`;

// ─── Structured response cards ────────────────────────────
const Card = styled.div`
    padding: .85rem .95rem;
    background: rgba(12, 16, 32, .9);
    border: 1px solid ${p => p.$bias === 'long'
        ? 'rgba(16,185,129,.3)'
        : p.$bias === 'short'
        ? 'rgba(239,68,68,.3)'
        : 'rgba(167,139,250,.25)'};
    border-radius: 12px;
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
    font-size: .5rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: #a78bfa;
    font-weight: 800;
    margin-bottom: .25rem;
    display: flex;
    align-items: center;
    gap: .25rem;
`;
const CardHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: .35rem;
`;
const CardSym = styled.div`
    font-size: 1.05rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const Bias = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .15rem;
    padding: .15rem .4rem;
    border-radius: 5px;
    font-size: .55rem;
    font-weight: 800;
    background: ${p => p.$long ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
`;
const CardLine = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-bottom: .35rem;
`;
const CardScore = styled.span`
    font-size: .75rem;
    font-weight: 900;
    color: ${p => p.$v >= 80 ? '#10b981' : p.$v >= 65 ? '#f59e0b' : '#94a3b8'};
    margin: 0 .25rem;
`;
const CardWhy = styled.div`
    font-size: .7rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.45;
    margin-bottom: .55rem;
`;
const PlanRow = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: .25rem;
    margin-bottom: .55rem;
`;
const PlanBox = styled.div`
    padding: .35rem;
    background: rgba(255, 255, 255, .025);
    border-radius: 6px;
    text-align: center;
`;
const PlanLabel = styled.div`
    font-size: .45rem;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 800;
    letter-spacing: .4px;
`;
const PlanValue = styled.div`
    font-size: .68rem;
    font-weight: 800;
    color: ${p => p.$c || '#e0e6ed'};
    margin-top: .1rem;
`;
const CardCTA = styled.button`
    width: 100%;
    padding: .45rem;
    background: rgba(0, 173, 237, .12);
    border: 1px solid rgba(0, 173, 237, .3);
    color: #00adef;
    border-radius: 7px;
    font-size: .65rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .25rem;
    &:hover { background: rgba(0, 173, 237, .22); }
`;

// ─── Input ───────────────────────────────────────────────
const InputRow = styled.div`
    padding: .85rem 1.15rem 1rem;
    border-top: 1px solid rgba(255, 255, 255, .06);
    background: rgba(0, 0, 0, .25);
`;
const InputWrap = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
    background: rgba(255, 255, 255, .04);
    border: 1px solid ${p => p.$focused
        ? (p.theme?.brand?.primary || '#00adef') + '60'
        : 'rgba(255, 255, 255, .08)'};
    border-radius: 11px;
    padding: .15rem .15rem .15rem .85rem;
    transition: all .2s;
    box-shadow: ${p => p.$focused
        ? '0 0 0 3px rgba(0, 173, 237, .12)'
        : 'none'};
`;
const Input = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: ${p => p.theme?.text?.primary || '#fff'};
    font-size: .8rem;
    font-weight: 600;
    padding: .55rem 0;
    &::placeholder {
        color: ${p => p.theme?.text?.tertiary || '#64748b'};
        font-weight: 500;
    }
`;
const SendBtn = styled.button`
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#a78bfa'});
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .15s;
    flex-shrink: 0;
    &:disabled {
        opacity: .45;
        cursor: not-allowed;
    }
    &:hover:not(:disabled) {
        transform: scale(1.05);
    }
`;
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;

// ═══════════════════════════════════════════════════════════
// CONTEXT-AWARE ACTION SETS
// ═══════════════════════════════════════════════════════════
const DEFAULT_ACTIONS = [
    { emoji: '📈', label: 'Find the best trade right now', query: 'best trade' },
    { emoji: '🔥', label: 'Show high-confidence setups', query: 'strongest setup' },
    { emoji: '🧠', label: 'Analyze a stock or crypto', query: 'analyze symbol' },
    { emoji: '📊', label: 'What is the market doing?', query: 'market bias' },
    { emoji: '💰', label: 'Where is smart money moving?', query: 'smart money' }
];

const ACTIONS_BY_PATH = {
    '/signals': [
        { emoji: '🎯', label: 'Show me the strongest signal', query: 'strongest setup' },
        { emoji: '📈', label: 'Find the best trade right now', query: 'best trade' },
        { emoji: '🔥', label: 'High confidence setups only', query: 'strongest setup' },
        { emoji: '📊', label: 'What is the market doing?', query: 'market bias' },
        { emoji: '💰', label: 'Where is smart money moving?', query: 'smart money' }
    ],
    '/opportunities': [
        { emoji: '🎯', label: 'Show me the top opportunity', query: 'best trade' },
        { emoji: '⚡', label: 'What patterns are forming?', query: 'patterns forming' },
        { emoji: '📊', label: 'Market bias right now', query: 'market bias' },
        { emoji: '🧠', label: 'Analyze a specific symbol', query: 'analyze symbol' },
        { emoji: '💰', label: 'Smart money flow', query: 'smart money' }
    ],
    '/patterns': [
        { emoji: '⚡', label: 'Top pattern right now', query: 'patterns forming' },
        { emoji: '🎯', label: 'Best trade with active pattern', query: 'best trade' },
        { emoji: '📊', label: 'Market mood', query: 'market bias' },
        { emoji: '🧠', label: 'Analyze a symbol', query: 'analyze symbol' }
    ],
    '/pulse': [
        { emoji: '📊', label: 'Explain the current market mood', query: 'market bias' },
        { emoji: '🎯', label: 'Best trade for this market', query: 'best trade' },
        { emoji: '💰', label: 'Smart money flow', query: 'smart money' },
        { emoji: '⚡', label: 'Patterns forming now', query: 'patterns forming' }
    ],
    '/mood': [
        { emoji: '📊', label: 'Sentiment summary', query: 'market sentiment' },
        { emoji: '🎯', label: 'Best trade right now', query: 'best trade' },
        { emoji: '💰', label: 'Smart money agreement', query: 'smart money' }
    ],
    '/smart-money': [
        { emoji: '💰', label: 'Top smart money signal', query: 'smart money' },
        { emoji: '🎯', label: 'Aligned trade idea', query: 'best trade' },
        { emoji: '📊', label: 'Market bias', query: 'market bias' }
    ]
};

// Asset pages — context-aware to symbol
function getAssetPathActions(pathname) {
    const m = pathname.match(/^\/(stock|crypto)\/([A-Z0-9-]+)/i);
    if (!m) return null;
    const sym = m[2].toUpperCase();
    return [
        { emoji: '🧠', label: `Analyze ${sym}`, query: sym },
        { emoji: '📈', label: `Trade setup for ${sym}`, query: sym },
        { emoji: '⚡', label: 'Patterns forming', query: 'patterns forming' },
        { emoji: '📊', label: 'Overall market bias', query: 'market bias' },
        { emoji: '🎯', label: 'Best trade overall', query: 'best trade' }
    ];
}

// ═══════════════════════════════════════════════════════════
// QUERY ROUTER — same map as CoPilotPage
// ═══════════════════════════════════════════════════════════
function buildQueryRouter(api) {
    const fetcher = (path) => api
        ? api.get(path).then(r => r.data).catch(() => null)
        : fetch(`${API_URL}${path}`).then(r => r.ok ? r.json() : null).catch(() => null);

    return [
        {
            keywords: ['best trade', 'top trade', 'best opportunity', 'top opportunity'],
            handler: async () => {
                const res = await fetcher('/opportunities/featured?limit=1');
                const opp = res?.opportunities?.[0];
                if (!opp) return { type: 'AiText', text: 'No high-confidence opportunities are active right now. Check the Opportunity Engine for more setups.' };
                return { type: 'OpportunityCard', data: opp };
            }
        },
        {
            keywords: ['strongest setup', 'best setup', 'high confidence'],
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
                if (!res?.bias) return { type: 'AiText', text: "I couldn't load smart money data. Open the Smart Money page directly." };
                return { type: 'SmartMoneyCard', data: res };
            }
        },
        {
            keywords: ['market bias', 'market mood', 'bullish or bearish', 'how is the market', 'market sentiment'],
            handler: async () => {
                const res = await fetcher('/heatmap/pulse');
                if (!res?.sentiment) return { type: 'AiText', text: "I couldn't load market pulse data." };
                return { type: 'MarketBiasCard', data: res };
            }
        },
        {
            keywords: ['patterns forming', 'patterns', 'breakout', 'pattern setups'],
            handler: async () => {
                const res = await fetcher('/patterns/intelligence/featured?limit=1');
                const pat = res?.patterns?.[0];
                if (!pat) return { type: 'AiText', text: 'No high-probability patterns are confirmed right now.' };
                return { type: 'PatternCard', data: pat };
            }
        }
    ];
}

const TICKER_REGEX = /(?:^|\s)\$?([A-Z]{2,5})(?:\s|$)/;
function detectSymbol(text) {
    const match = text.match(TICKER_REGEX);
    if (!match) return null;
    const sym = match[1];
    const englishOnly = new Set(['AI', 'AND', 'THE', 'FOR', 'YES', 'NO', 'WHAT', 'WHO', 'HOW']);
    if (englishOnly.has(sym)) return null;
    return sym;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const AIChatWidget = () => {
    const { api } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [isMin, setIsMin] = useState(false);
    const [thread, setThread] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const bodyEndRef = useRef(null);

    // Hide on the dedicated /chat (Co-Pilot) page to avoid duplication
    const hiddenOnPath = location.pathname === '/chat';

    // Context-aware action set
    const actions = useMemo(() => {
        const assetActions = getAssetPathActions(location.pathname);
        if (assetActions) return assetActions;
        return ACTIONS_BY_PATH[location.pathname] || DEFAULT_ACTIONS;
    }, [location.pathname]);

    const router = useMemo(() => buildQueryRouter(api), [api]);

    const matchRouter = useCallback((text) => {
        const lower = text.toLowerCase();
        for (const route of router) {
            if (route.keywords?.some(k => lower.includes(k))) return route;
        }
        return null;
    }, [router]);

    // Auto-scroll thread on new content
    useEffect(() => {
        if (!isOpen) return;
        bodyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [thread, sending, isOpen]);

    const handleAction = useCallback((action, data) => {
        switch (action) {
            case 'view':
                if (data?.signalId || data?.id) navigate(`/signal/${data.signalId || data.id}`);
                else if (data?.symbol) navigate(data.isCrypto ? `/crypto/${data.symbol}` : `/stock/${data.symbol}`);
                break;
            case 'opportunities': navigate('/opportunities'); break;
            case 'patterns':      navigate('/patterns'); break;
            case 'pulse':         navigate('/pulse'); break;
            case 'smart-money':   navigate('/smart-money'); break;
            default: break;
        }
    }, [navigate]);

    const sendMessage = useCallback(async (text) => {
        const message = String(text || '').trim();
        if (!message || sending) return;

        setThread(t => [...t, { id: Date.now() + 'u', role: 'user', text: message }]);
        setInput('');
        setSending(true);

        try {
            // 1. Symbol detection
            const symbol = detectSymbol(message);
            if (symbol && !matchRouter(message)) {
                const fetcher = (path) => api
                    ? api.get(path).then(r => r.data).catch(() => null)
                    : fetch(`${API_URL}${path}`).then(r => r.ok ? r.json() : null).catch(() => null);
                const data = await fetcher(`/opportunities/by-symbol/${symbol}`);
                setThread(t => [...t, {
                    id: Date.now() + 'a',
                    role: 'assistant',
                    card: { type: 'SymbolAnalysisCard', data, symbol }
                }]);
                setSending(false);
                return;
            }

            // 2. Structured router
            const matched = matchRouter(message);
            if (matched) {
                const result = await matched.handler(message);
                setThread(t => [...t, {
                    id: Date.now() + 'a',
                    role: 'assistant',
                    card: result
                }]);
                setSending(false);
                return;
            }

            // 3. LLM fallback
            if (!api) {
                setThread(t => [...t, {
                    id: Date.now() + 'a',
                    role: 'assistant',
                    card: { type: 'AiText', text: 'Sign in to use the Co-Pilot. Quick actions above work without an account.' }
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
                id: Date.now() + 'a',
                role: 'assistant',
                card: { type: 'AiText', text: res.data?.response || 'No response' }
            }]);
        } catch (err) {
            setThread(t => [...t, {
                id: Date.now() + 'a',
                role: 'assistant',
                card: { type: 'AiText', text: "I'm having trouble connecting right now. Try one of the quick actions above." }
            }]);
        } finally {
            setSending(false);
            if (!isOpen) setHasUnread(true);
        }
    }, [api, sending, thread, matchRouter, isOpen]);

    if (hiddenOnPath) return null;

    if (!isOpen) {
        return (
            <Container>
                <Bubble theme={theme} onClick={() => { setIsOpen(true); setHasUnread(false); }}>
                    {hasUnread && <NotificationDot theme={theme} />}
                    <MessageSquare size={26} />
                </Bubble>
            </Container>
        );
    }

    // ─── Render structured cards ─────────────────────────
    const renderCard = (card) => {
        if (!card) return null;
        const t = card.type;
        if (t === 'OpportunityCard') {
            const d = card.data;
            const isLong = d.bias === 'long';
            return (
                <Card $bias={d.bias}>
                    <CardLabel><Sparkles size={9} /> TOP OPPORTUNITY</CardLabel>
                    <CardHead>
                        <CardSym theme={theme}>{d.symbol}</CardSym>
                        <Bias $long={isLong}>
                            {isLong ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                            {isLong ? 'LONG' : 'SHORT'}
                        </Bias>
                    </CardHead>
                    <CardLine theme={theme}>
                        {d.setupLabel || 'Active Setup'}<CardScore $v={d.aiScore}>· AI {d.aiScore}</CardScore>· {d.confidence}%
                    </CardLine>
                    <CardWhy theme={theme}>{d.whySurfaced}</CardWhy>
                    <PlanRow>
                        <PlanBox><PlanLabel>Entry</PlanLabel><PlanValue>{fmtPrice(d.entry)}</PlanValue></PlanBox>
                        <PlanBox><PlanLabel>SL</PlanLabel><PlanValue $c="#ef4444">{fmtPrice(d.sl)}</PlanValue></PlanBox>
                        <PlanBox><PlanLabel>Target</PlanLabel><PlanValue $c="#10b981">{fmtPrice(d.tp3)}</PlanValue></PlanBox>
                        <PlanBox><PlanLabel>R/R</PlanLabel><PlanValue $c="#00adef">1:{d.rr || '--'}</PlanValue></PlanBox>
                    </PlanRow>
                    <CardCTA onClick={() => handleAction('view', d)}>
                        View Trade Setup <ChevronRight size={10} />
                    </CardCTA>
                </Card>
            );
        }
        if (t === 'MarketBiasCard') {
            const s = card.data?.sentiment || {};
            return (
                <Card>
                    <CardLabel><TrendingUp size={9} /> MARKET BIAS</CardLabel>
                    <CardSym theme={theme} style={{ fontSize: '.95rem' }}>{s.label || 'Market Mood'}</CardSym>
                    <CardLine theme={theme} style={{ marginTop: '.3rem' }}>
                        Up: <strong style={{ color: '#10b981' }}>{s.breadth?.up ?? 0}</strong>
                        {' · '}Down: <strong style={{ color: '#ef4444' }}>{s.breadth?.down ?? 0}</strong>
                        {' · '}Avg: <strong style={{ color: (s.avgMove ?? 0) >= 0 ? '#10b981' : '#ef4444' }}>{(s.avgMove ?? 0) >= 0 ? '+' : ''}{(s.avgMove ?? 0).toFixed(2)}%</strong>
                    </CardLine>
                    {card.data?.insight?.text && <CardWhy theme={theme}>{card.data.insight.text}</CardWhy>}
                    <CardCTA onClick={() => handleAction('pulse')}>
                        Open Market Pulse <ChevronRight size={10} />
                    </CardCTA>
                </Card>
            );
        }
        if (t === 'SmartMoneyCard') {
            const b = card.data?.bias || {};
            return (
                <Card $bias={b.bucket?.includes('bullish') ? 'long' : b.bucket?.includes('bearish') ? 'short' : null}>
                    <CardLabel><DollarSign size={9} /> SMART MONEY</CardLabel>
                    <CardSym theme={theme} style={{ fontSize: '.95rem' }}>{b.label || 'Smart Money Flow'}</CardSym>
                    <CardLine theme={theme} style={{ marginTop: '.3rem' }}>
                        Buys: <strong style={{ color: '#10b981' }}>{b.buys ?? 0}</strong>
                        {' · '}Sells: <strong style={{ color: '#ef4444' }}>{b.sells ?? 0}</strong>
                    </CardLine>
                    {card.data?.insight?.text && <CardWhy theme={theme}>{card.data.insight.text}</CardWhy>}
                    <CardCTA onClick={() => handleAction('smart-money')}>
                        Open Smart Money <ChevronRight size={10} />
                    </CardCTA>
                </Card>
            );
        }
        if (t === 'PatternCard') {
            const d = card.data;
            const isLong = d.bias === 'long';
            return (
                <Card $bias={d.bias}>
                    <CardLabel><Brain size={9} /> PATTERN</CardLabel>
                    <CardHead>
                        <CardSym theme={theme}>{d.symbol}</CardSym>
                        <Bias $long={isLong}>{isLong ? 'LONG' : 'SHORT'}</Bias>
                    </CardHead>
                    <CardLine theme={theme}>
                        {d.patternLabel}<CardScore $v={d.patternScore}>· Score {d.patternScore}</CardScore>
                    </CardLine>
                    <CardWhy theme={theme}>{d.whyMatters}</CardWhy>
                    <CardCTA onClick={() => handleAction('view', d)}>
                        View Trade Setup <ChevronRight size={10} />
                    </CardCTA>
                </Card>
            );
        }
        if (t === 'SymbolAnalysisCard') {
            if (!card.data?.opportunity) {
                return (
                    <Card>
                        <CardLabel><Brain size={9} /> ANALYSIS</CardLabel>
                        <CardSym theme={theme}>{card.symbol}</CardSym>
                        <CardWhy theme={theme} style={{ marginTop: '.35rem' }}>
                            No active high-confidence setup detected for {card.symbol} right now. Open the asset page to run an on-demand analysis.
                        </CardWhy>
                        <CardCTA onClick={() => navigate(`/stock/${card.symbol}`)}>
                            Open Asset Page <ChevronRight size={10} />
                        </CardCTA>
                    </Card>
                );
            }
            return renderCard({ type: 'OpportunityCard', data: card.data.opportunity });
        }
        return <AiText theme={theme}>{card.text}</AiText>;
    };

    return (
        <Container>
            <Window theme={theme}>
                {/* Header */}
                <Header>
                    <HeaderLeft>
                        <Avatar theme={theme}><Bot size={20} /></Avatar>
                        <HeaderInfo>
                            <HeaderTitle theme={theme}>Your Trading Assistant</HeaderTitle>
                            <HeaderStatus theme={theme}>
                                <StatusDot /> Online
                            </HeaderStatus>
                        </HeaderInfo>
                    </HeaderLeft>
                    <HeaderActions>
                        <IconBtn theme={theme} onClick={() => setIsMin(v => !v)} title={isMin ? 'Expand' : 'Minimize'}>
                            {isMin ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                        </IconBtn>
                        <IconBtn theme={theme} onClick={() => setIsOpen(false)} title="Close">
                            <X size={14} />
                        </IconBtn>
                    </HeaderActions>
                </Header>

                {!isMin && (
                    <>
                        <Body>
                            {thread.length === 0 ? (
                                <>
                                    <Tagline theme={theme}>
                                        Get real-time insights, analyze setups, and find your next trade.
                                    </Tagline>

                                    <SectionLabel theme={theme}>Quick Actions</SectionLabel>
                                    <ActionGrid>
                                        {actions.map((a, i) => (
                                            <ActionBtn
                                                key={a.label}
                                                theme={theme}
                                                onClick={() => sendMessage(a.query)}
                                                style={{ animationDelay: `${i * 0.04}s` }}
                                            >
                                                <ActionEmoji>{a.emoji}</ActionEmoji>
                                                <span>{a.label}</span>
                                            </ActionBtn>
                                        ))}
                                    </ActionGrid>

                                    <IntegrationCard>
                                        <IntegrationLabel>
                                            <Sparkles size={9} /> Connected to your trading system
                                        </IntegrationLabel>
                                        <TagRow>
                                            <Tag theme={theme}>Signals</Tag>
                                            <Tag theme={theme}>Patterns</Tag>
                                            <Tag theme={theme}>Sentiment</Tag>
                                            <Tag theme={theme}>Smart Money</Tag>
                                            <Tag theme={theme}>Market Pulse</Tag>
                                        </TagRow>
                                    </IntegrationCard>

                                    <PrimaryCTA theme={theme} onClick={() => navigate('/signals')}>
                                        <Zap size={14} /> View Live Signals
                                    </PrimaryCTA>
                                </>
                            ) : (
                                <Thread>
                                    {thread.map(msg => (
                                        msg.role === 'user'
                                            ? <UserMsg key={msg.id} theme={theme}>{msg.text}</UserMsg>
                                            : <AiMsg key={msg.id}>{renderCard(msg.card)}</AiMsg>
                                    ))}
                                    {sending && (
                                        <Typing theme={theme}>
                                            <TypingDot theme={theme} $d={0} />
                                            <TypingDot theme={theme} $d={0.16} />
                                            <TypingDot theme={theme} $d={0.32} />
                                        </Typing>
                                    )}
                                </Thread>
                            )}
                            <div ref={bodyEndRef} />
                        </Body>

                        <InputRow>
                            <InputWrap theme={theme} $focused={focused}>
                                <Input
                                    theme={theme}
                                    placeholder="Ask about a stock, signal, or setup..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    disabled={sending}
                                />
                                <SendBtn
                                    theme={theme}
                                    onClick={() => sendMessage(input)}
                                    disabled={sending || !input.trim()}
                                >
                                    {sending ? <SpinningLoader size={13} /> : <Send size={13} />}
                                </SendBtn>
                            </InputWrap>
                        </InputRow>
                    </>
                )}
            </Window>
        </Container>
    );
};

export default AIChatWidget;
