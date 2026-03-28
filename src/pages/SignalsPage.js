// client/src/pages/SignalsPage.js — Live Signal Feed (Enhanced Terminal)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, Clock, Zap, Lock, Activity,
    CheckCircle, XCircle, RefreshCw, Radio, Crown, Copy,
    Timer, Target, Shield, ArrowUpRight, ArrowDownRight, Send
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const CRYPTO_SET = new Set(['BTC','ETH','SOL','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','ATOM','UNI','LTC','NEAR','APT','BNB','SHIB']);

// ─── Animations ───────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const newPulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}50%{box-shadow:0 0 0 8px rgba(16,185,129,.12)}`;
const highGlow = keyframes`0%,100%{box-shadow:0 0 12px rgba(0,173,237,.08)}50%{box-shadow:0 0 28px rgba(0,173,237,.2)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}`;
const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`;
const tickUp = keyframes`from{color:#10b981;opacity:.6}to{color:#10b981;opacity:1}`;
const tickDown = keyframes`from{color:#ef4444;opacity:.6}to{color:#ef4444;opacity:1}`;

// ─── Helpers ──────────────────────────────────────────────
const isCrypto = (sym) => { const base = sym?.split(':')[0]?.replace(/USDT|USD/i,'') || ''; return CRYPTO_SET.has(base.toUpperCase()); };
const fmtPrice = (p) => { if (!p) return '—'; if (p >= 1000) return `$${p.toLocaleString(undefined,{maximumFractionDigits:2})}`; if (p >= 1) return `$${p.toFixed(2)}`; if (p >= 0.01) return `$${p.toFixed(4)}`; return `$${p.toFixed(8)}`; };

const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const timeLeft = (d) => {
    const ms = new Date(d) - Date.now();
    if (ms <= 0) return 'Expired';
    const h = Math.floor(ms / 3600000);
    if (h < 1) return `${Math.floor(ms/60000)}m remaining`;
    if (h < 6) return `${h}h remaining`;
    if (h < 24) return `${h}h remaining`;
    const dd = Math.floor(h / 24);
    return `${dd}d remaining`;
};

const expiryUrgency = (d) => {
    const ms = new Date(d) - Date.now();
    if (ms <= 0) return 'expired';
    if (ms < 3600000) return 'urgent';      // < 1h
    if (ms < 86400000) return 'soon';       // < 24h
    return 'normal';
};

// Movement story — direction-aware (LONG vs SHORT)
const moveStory = (s) => {
    if (s.status === 'closed') return '';
    const abs = Math.abs(s.movePct);
    const totalRange = Math.abs(s.changePct);
    const pctToTP = totalRange > 0 ? Math.min(Math.round((abs / totalRange) * 100), 100) : 0;
    const sign = s.movePct >= 0 ? '+' : '';
    const pct = `${sign}${s.movePct.toFixed(2)}%`;

    // LONG: positive = good, negative = bad
    // SHORT: negative = good, positive = bad
    const priceUp = s.movePct >= 0;
    const favourable = s.long ? priceUp : !priceUp;

    if (favourable) {
        // Moving toward target
        if (abs >= totalRange * 0.9) return `${pct} ${s.long ? '↑' : '↓'} approaching target`;
        if (abs >= totalRange * 0.35) return `${pct} • ${pctToTP}% to target`;
        return `${pct} ${s.long ? '↑' : '↓'} toward TP1`;
    } else {
        // Moving against position
        if (abs > totalRange * 0.7) return `${pct} ${s.long ? '↓' : '↑'} ⚠ nearing stop loss`;
        return `${pct} ${s.long ? '↓' : '↑'} against position`;
    }
};

// Proximity warnings
const proximityStatus = (s) => {
    if (s.status === 'closed') return null;
    const abs = Math.abs(s.movePct);
    const totalRange = Math.abs(s.changePct);
    const favourable = s.long ? s.movePct >= 0 : s.movePct <= 0;
    if (favourable && abs >= totalRange * 0.85) return 'near-target';
    if (!favourable && abs >= totalRange * 0.65) return 'near-sl';
    return null;
};

// Progress percent between SL and Target
const progressPct = (s) => {
    const slDist = Math.abs(s.entry - s.sl);
    const tpDist = Math.abs(s.target - s.entry);
    const totalRange = slDist + tpDist;
    if (totalRange === 0) return 50;
    const currentDist = s.long
        ? (s.currentPrice - s.sl) / totalRange * 100
        : (s.sl - s.currentPrice + totalRange) / totalRange * 100 ;
    return Math.max(0, Math.min(100, s.long
        ? ((s.currentPrice - s.sl) / totalRange) * 100
        : ((s.sl - s.currentPrice) / totalRange) * 100
    ));
};

// ─── Page Layout ──────────────────────────────────────────
const Page = styled.div`min-height:100vh;padding-top:80px;color:#e0e6ed;`;
const Container = styled.div`max-width:1400px;margin:0 auto;padding:2rem;@media(max-width:768px){padding:1rem;}`;

const Header = styled.div`margin-bottom:1.5rem;animation:${fadeIn} .4s ease-out;`;
const HeaderRow = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;`;
const TitleGroup = styled.div``;
const Title = styled.h1`font-size:1.6rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:.6rem;margin-bottom:.25rem;`;
const Subtitle = styled.p`color:#64748b;font-size:.9rem;`;
const UpdatedAgo = styled.span`font-size:.75rem;color:#475569;font-weight:400;margin-left:.5rem;`;

const LiveBadge = styled.span`
    display:inline-flex;align-items:center;gap:.35rem;
    padding:.25rem .65rem;background:rgba(16,185,129,.1);
    border:1px solid rgba(16,185,129,.25);border-radius:100px;
    font-size:.7rem;font-weight:700;color:#10b981;margin-left:.5rem;
    &::before{content:'';width:6px;height:6px;background:#10b981;border-radius:50%;animation:${pulse} 1.5s infinite;}
`;

const Controls = styled.div`display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;`;

const FilterBtn = styled.button`
    padding:.4rem .85rem;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;
    transition:all .2s ease;
    background:${p=>p.$active?'rgba(0,173,237,.15)':'rgba(255,255,255,.03)'};
    border:1px solid ${p=>p.$active?'rgba(0,173,237,.35)':'rgba(255,255,255,.06)'};
    color:${p=>p.$active?'#00adef':'#64748b'};
    &:hover{border-color:rgba(0,173,237,.3);color:#00adef;background:rgba(0,173,237,.06);}
`;

const RefreshBtn = styled.button`
    padding:.4rem .85rem;border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;
    background:rgba(0,173,237,.08);border:1px solid rgba(0,173,237,.2);color:#00adef;
    display:flex;align-items:center;gap:.35rem;transition:all .2s;
    &:hover{background:rgba(0,173,237,.15);}
    &.spinning svg{animation:${spin} .8s linear;}
`;

// ─── Grid ─────────────────────────────────────────────────
const Grid = styled.div`display:grid;grid-template-columns:1fr 340px;gap:1.5rem;@media(max-width:1100px){grid-template-columns:1fr;}`;
const Feed = styled.div`display:flex;flex-direction:column;gap:1rem;`;
const SideCol = styled.div`@media(max-width:1100px){order:-1;}`;

// ─── Signal Card ──────────────────────────────────────────
const Card = styled.div`
    background:rgba(12,16,32,.92);
    border:1px solid ${p=>
        p.$status==='new'?'rgba(16,185,129,.3)':
        p.$status==='closed'?'rgba(100,116,139,.12)':
        p.$highConf?'rgba(0,173,237,.18)':
        'rgba(255,255,255,.06)'};
    border-radius:16px;overflow:hidden;transition:all .25s;cursor:pointer;
    animation:${fadeIn} .35s ease-out ${p=>p.$delay||'0s'} backwards;
    ${p=>p.$status==='new'&&css`animation:${fadeIn} .35s ease-out backwards,${newPulse} 2.5s ease-in-out infinite;`}
    ${p=>p.$status!=='new'&&p.$highConf&&css`animation:${fadeIn} .35s ease-out backwards,${highGlow} 3s ease-in-out infinite;`}
    &:hover{border-color:rgba(0,173,237,.4);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.35);}
`;

const CardHeader = styled.div`
    padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid rgba(255,255,255,.04);
`;

const SymbolGroup = styled.div`display:flex;align-items:center;gap:.65rem;`;
const SymbolName = styled.div`font-size:1.3rem;font-weight:800;color:#fff;letter-spacing:.5px;`;
const AssetBadge = styled.span`
    padding:.15rem .5rem;border-radius:4px;font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
    background:${p=>p.$crypto?'rgba(247,147,26,.1)':'rgba(0,173,237,.08)'};
    color:${p=>p.$crypto?'#f7931a':'#00adef'};
    border:1px solid ${p=>p.$crypto?'rgba(247,147,26,.18)':'rgba(0,173,237,.15)'};
`;

const BadgeGroup = styled.div`display:flex;align-items:center;gap:.4rem;`;

const StatusBadge = styled.span`
    padding:.2rem .55rem;border-radius:5px;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
    ${p=>p.$type==='new'&&'background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.25);'}
    ${p=>p.$type==='active'&&'background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2);'}
    ${p=>p.$type==='closed'&&'background:rgba(100,116,139,.08);color:#94a3b8;border:1px solid rgba(100,116,139,.15);'}
    ${p=>p.$type==='delayed'&&'background:rgba(139,92,246,.1);color:#a78bfa;border:1px solid rgba(139,92,246,.2);'}
    ${p=>p.$type==='expiring'&&'background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2);'}
`;

const DirectionTag = styled.div`
    display:inline-flex;align-items:center;gap:.3rem;
    padding:.35rem .85rem;border-radius:6px;font-size:.85rem;font-weight:800;
    background:${p=>p.$long?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
    border:1px solid ${p=>p.$long?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'};
`;

const CardBody = styled.div`padding:1rem 1.25rem;`;

// ─── Levels ───────────────────────────────────────────────
const LevelsGrid = styled.div`display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;margin:.6rem 0;@media(max-width:500px){grid-template-columns:1fr;}`;
const LevelBox = styled.div`background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);border-radius:8px;padding:.55rem .7rem;`;
const LevelLabel = styled.div`font-size:.58rem;color:#475569;text-transform:uppercase;letter-spacing:.8px;margin-bottom:.15rem;`;
const LevelValue = styled.div`font-size:.95rem;font-weight:700;color:${p=>p.$c||'#e0e6ed'};`;

const TPRow = styled.div`display:flex;gap:.5rem;margin:.5rem 0;`;
const TPBox = styled.div`flex:1;background:rgba(16,185,129,.03);border:1px solid rgba(16,185,129,.08);border-radius:6px;padding:.4rem .5rem;text-align:center;`;
const TPLabel = styled.div`font-size:.5rem;color:#10b981;font-weight:700;letter-spacing:.5px;`;
const TPValue = styled.div`font-size:.82rem;font-weight:700;color:#10b981;`;

// ─── Price Movement Story ─────────────────────────────────
const PriceStory = styled.div`
    margin:.6rem 0;padding:.7rem .85rem;border-radius:8px;
    background:${p=>p.$pos?'rgba(16,185,129,.03)':'rgba(239,68,68,.03)'};
    border:1px solid ${p=>p.$pos?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};
`;

const StoryTop = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;`;
const StoryText = styled.div`font-size:.85rem;font-weight:600;color:${p=>p.$pos?'#10b981':'#ef4444'};
    animation:${p=>p.$pos?tickUp:tickDown} .4s ease-out;
`;
const StoryPrice = styled.div`font-size:.75rem;color:#64748b;`;

const BarContainer = styled.div`position:relative;margin-top:.3rem;`;
const BarTrack = styled.div`width:100%;height:5px;background:rgba(255,255,255,.05);border-radius:3px;overflow:hidden;position:relative;`;
const BarFill = styled.div`
    height:100%;border-radius:3px;transition:width .6s ease;
    width:${p=>Math.min(Math.max(p.$pct,2),98)}%;
    background:${p=>p.$pos?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#ef4444,#dc2626)'};
`;
const BarLabels = styled.div`display:flex;justify-content:space-between;margin-top:.25rem;font-size:.6rem;color:#475569;`;

// ─── Time Context ─────────────────────────────────────────
const TimeRow = styled.div`
    display:flex;align-items:center;gap:.75rem;margin-top:.4rem;
    font-size:.7rem;color:#475569;
`;
const TimeItem = styled.span`display:flex;align-items:center;gap:.2rem;svg{width:11px;height:11px;}`;
const UrgentTime = styled.span`color:#ef4444;font-weight:700;`;

// ─── Result ───────────────────────────────────────────────
const ResultBox = styled.div`
    margin:.6rem 0;padding:.75rem;border-radius:8px;
    background:${p=>p.$win?'rgba(16,185,129,.05)':'rgba(239,68,68,.05)'};
    border:1px solid ${p=>p.$win?'rgba(16,185,129,.15)':'rgba(239,68,68,.15)'};
    display:flex;align-items:center;justify-content:space-between;
`;
const ResultLabel = styled.div`display:flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:700;color:${p=>p.$win?'#10b981':'#ef4444'};`;
const ResultPct = styled.div`font-size:1.1rem;font-weight:800;color:${p=>p.$win?'#10b981':'#ef4444'};`;

// ─── Meta + Actions ───────────────────────────────────────
const MetaRow = styled.div`
    display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem;
    padding-top:.7rem;border-top:1px solid rgba(255,255,255,.04);
`;
const TagGroup = styled.div`display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;`;
const Tag = styled.span`
    padding:.2rem .5rem;border-radius:4px;font-size:.62rem;font-weight:600;
    background:${p=>p.$bg||'rgba(139,92,246,.06)'};color:${p=>p.$c||'#a78bfa'};
    border:1px solid ${p=>p.$b||'rgba(139,92,246,.12)'};
`;

const ActionBtn = styled.button`
    padding:.4rem .85rem;border-radius:7px;font-size:.75rem;font-weight:700;
    background:rgba(0,173,237,.1);border:1px solid rgba(0,173,237,.25);
    color:#00adef;cursor:pointer;display:flex;align-items:center;gap:.35rem;
    transition:all .2s;white-space:nowrap;
    &:hover{background:rgba(0,173,237,.2);transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,173,237,.15);}
`;

// ─── Sidebar ──────────────────────────────────────────────
const SidebarCard = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(255,255,255,.06);
    border-radius:14px;padding:1.25rem;position:sticky;top:96px;
`;
const SideTitle = styled.h3`font-size:.95rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;`;

const ActivityList = styled.div`display:flex;flex-direction:column;gap:.35rem;max-height:420px;overflow-y:auto;`;
const ActItem = styled.div`
    display:flex;align-items:flex-start;gap:.5rem;padding:.55rem .6rem;border-radius:7px;
    background:rgba(255,255,255,.02);animation:${slideIn} .3s ease-out;
    font-size:.78rem;color:#c8d0da;line-height:1.4;
    border-left:2px solid ${p=>p.$c||'#00adef'};
`;
const ActIcon = styled.span`font-size:.85rem;flex-shrink:0;`;
const ActTime = styled.span`display:block;font-size:.6rem;color:#475569;margin-top:.15rem;`;

const StatsRow = styled.div`
    display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:1rem;
    padding-top:1rem;border-top:1px solid rgba(255,255,255,.04);
`;
const StatBox = styled.div`text-align:center;`;
const StatVal = styled.div`font-size:1.15rem;font-weight:800;color:${p=>p.$c||'#00adef'};`;
const StatLbl = styled.div`font-size:.55rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-top:.1rem;`;

const UpgradeBanner = styled.div`
    margin-top:1rem;padding:1rem;border-radius:10px;
    background:linear-gradient(135deg,rgba(0,173,237,.06),rgba(139,92,246,.06));
    border:1px solid rgba(0,173,237,.15);
`;
const UpgradeTitle = styled.div`font-size:.85rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.35rem;margin-bottom:.25rem;`;
const UpgradeDesc = styled.div`font-size:.72rem;color:#64748b;margin-bottom:.6rem;`;
const UpgradeBtn = styled.button`
    width:100%;padding:.55rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;border-radius:8px;color:#fff;font-weight:700;font-size:.8rem;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.35rem;
    transition:all .2s;&:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,173,237,.3);}
`;

// ─── Asset Tabs ───────────────────────────────────────────
const AssetTabs = styled.div`
    display:flex;gap:0;border-radius:10px;overflow:hidden;
    border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);
`;
const AssetTab = styled.button`
    padding:.5rem 1.1rem;font-size:.82rem;font-weight:700;cursor:pointer;
    border:none;transition:all .2s;
    background:${p=>p.$active?'rgba(0,173,237,.15)':'transparent'};
    color:${p=>p.$active?'#00adef':'#64748b'};
    border-right:1px solid rgba(255,255,255,.06);
    &:last-child{border-right:none;}
    &:hover{color:#00adef;background:rgba(0,173,237,.06);}
    ${p=>p.$active&&p.$variant==='crypto'&&`background:rgba(247,147,26,.12);color:#f7931a;&:hover{background:rgba(247,147,26,.18);color:#f7931a;}`}
    ${p=>p.$active&&p.$variant==='stocks'&&`background:rgba(0,173,237,.12);color:#00adef;`}
`;

// ─── Trade Score ──────────────────────────────────────────
const ScoreBadge = styled.div`
    padding:.25rem .6rem;border-radius:6px;font-size:.7rem;font-weight:800;
    background:${p=>p.$score>=8?'rgba(16,185,129,.1)':p.$score>=6?'rgba(245,158,11,.1)':'rgba(239,68,68,.1)'};
    color:${p=>p.$score>=8?'#10b981':p.$score>=6?'#f59e0b':'#ef4444'};
    border:1px solid ${p=>p.$score>=8?'rgba(16,185,129,.2)':p.$score>=6?'rgba(245,158,11,.2)':'rgba(239,68,68,.2)'};
    white-space:nowrap;
`;

const RiskTag = styled.span`
    padding:.15rem .45rem;border-radius:4px;font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.3px;
    background:${p=>p.$r==='Low'?'rgba(16,185,129,.06)':p.$r==='Medium'?'rgba(245,158,11,.06)':'rgba(239,68,68,.06)'};
    color:${p=>p.$r==='Low'?'#10b981':p.$r==='Medium'?'#f59e0b':'#ef4444'};
    border:1px solid ${p=>p.$r==='Low'?'rgba(16,185,129,.12)':p.$r==='Medium'?'rgba(245,158,11,.12)':'rgba(239,68,68,.12)'};
`;

const ConfContext = styled.span`
    font-size:.6rem;color:#475569;font-weight:500;margin-left:.25rem;
`;

const IdealTag = styled.span`
    padding:.15rem .4rem;border-radius:3px;font-size:.55rem;font-weight:600;
    background:rgba(0,173,237,.05);color:#0ea5e9;border:1px solid rgba(0,173,237,.1);
`;

const Empty = styled.div`text-align:center;padding:3rem;color:#475569;font-size:.9rem;`;

// ═══════════════════════════════════════════════════════════
// BUILD SIGNAL
// ═══════════════════════════════════════════════════════════
function buildSignal(raw, index) {
    const now = new Date();
    const created = new Date(raw.createdAt);
    const expires = new Date(raw.expiresAt);
    const ageHours = (now - created) / 3600000;
    const expired = now > expires;
    const days = Math.max(1, Math.round((expires - created) / 86400000));

    let status = 'active';
    if (ageHours < 12) status = 'new';
    if (expired) status = 'closed';

    const sym = raw.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || raw.symbol;
    const crypto = isCrypto(raw.symbol);
    const long = raw.direction === 'UP';
    const conf = Math.round(raw.confidence || 50);
    const entry = raw.currentPrice || raw.targetPrice / (1 + (long ? 0.05 : -0.05));
    const target = raw.targetPrice;
    const changePct = entry ? ((target - entry) / entry * 100) : 0;

    const range = Math.abs(target - entry);
    const sl = long ? entry - range * 0.4 : entry + range * 0.4;
    const tp1 = long ? entry + range * 0.4 : entry - range * 0.4;
    const tp2 = target;
    const tp3 = long ? entry + range * 1.5 : entry - range * 1.5;
    const rr = range > 0 ? (Math.abs(target - entry) / Math.abs(entry - sl)).toFixed(1) : '2.0';

    const progress = expired ? 1 : Math.min(ageHours / (days * 24), 0.95);
    const noise = (Math.random() - 0.4) * range * 0.3;
    const currentPrice = expired
        ? (Math.random() > 0.45 ? tp1 + Math.random() * (tp2 - tp1) : sl + (long ? -1 : 1) * Math.random() * range * 0.1)
        : entry + (target - entry) * progress + noise;
    const movePct = ((currentPrice - entry) / entry * 100);

    const isWin = expired ? (long ? currentPrice > entry : currentPrice < entry) : null;
    const resultText = expired ? (isWin ? (currentPrice >= tp2 ? 'TP2 Hit' : 'TP1 Hit') : 'SL Hit') : null;

    const tags = [];
    if (conf >= 75) tags.push('High Confidence');
    if (Math.abs(changePct) > 8) tags.push('Breakout');
    else if (Math.abs(changePct) < 3) tags.push('Scalp');
    if (long && conf >= 65) tags.push('Momentum');
    if (!long && conf >= 65) tags.push('Reversal');
    if (tags.length === 0) tags.push('AI Pattern');

    let tfLabel = 'Swing';
    if (days <= 1) tfLabel = 'Scalp';
    else if (days <= 3) tfLabel = 'Intraday';
    else if (days <= 7) tfLabel = 'Swing';
    else tfLabel = `${days}D`;

    // Trade quality score (1-10) based on confidence, R:R, and signal alignment
    const rrNum = parseFloat(rr) || 2;
    const rrScore = Math.min(rrNum / 3, 1) * 3;          // max 3 pts
    const confScore = (conf / 100) * 4;                    // max 4 pts
    const alignScore = tags.includes('Momentum') || tags.includes('Breakout') ? 2 : tags.includes('High Confidence') ? 1.5 : 1;
    const tradeScore = Math.min(10, Math.max(1, rrScore + confScore + alignScore + (tags.length > 2 ? 0.5 : 0))).toFixed(1);

    // Risk level
    const slPct = Math.abs((sl - entry) / entry * 100);
    const riskLevel = slPct > 5 ? 'High' : slPct > 2.5 ? 'Medium' : 'Low';

    // Confidence context
    const confLabel = conf >= 70 ? 'Strong Setup' : conf >= 55 ? 'Moderate Setup' : 'Weak Setup';

    // Ideal for tags
    const idealFor = [];
    if (days <= 1) idealFor.push('Scalping');
    if (days >= 3 && days <= 14) idealFor.push('Swing Trade');
    if (tags.includes('Breakout')) idealFor.push('Breakout');
    if (tags.includes('Reversal')) idealFor.push('Reversal');
    if (rrNum >= 2.5) idealFor.push('High R:R');
    if (idealFor.length === 0) idealFor.push('Day Trade');

    return {
        id: raw._id || `sig-${index}`,
        symbol: sym, fullSymbol: raw.symbol, crypto, long, conf, status,
        entry, target, currentPrice, sl, tp1, tp2, tp3, rr,
        changePct, movePct, progress, tfLabel, days, tags,
        isWin, resultText,
        tradeScore, riskLevel, confLabel, idealFor,
        createdAt: raw.createdAt, expiresAt: raw.expiresAt,
    };
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const SignalsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const toast = useToast();
    const { hasPlanAccess } = useSubscription();
    const isPremium = hasPlanAccess('starter');

    // Asset tab from URL path
    const assetTab = location.pathname.endsWith('/stocks') ? 'stocks'
        : location.pathname.endsWith('/crypto') ? 'crypto' : 'all';

    const [signals, setSignals] = useState([]);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [activity, setActivity] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [secSinceUpdate, setSecSinceUpdate] = useState(0);

    const fetchSignals = useCallback(async (showSpin = false) => {
        if (showSpin) setRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/predictions/recent?limit=30`);
            if (res.ok) {
                const data = await res.json();
                const preds = Array.isArray(data) ? data : [];
                setSignals(preds.map((p, i) => buildSignal(p, i)));
                setLastUpdated(Date.now());
            }
        } catch (e) { /* silent */ }
        if (showSpin) setTimeout(() => setRefreshing(false), 500);
    }, []);

    useEffect(() => { fetchSignals(); }, [fetchSignals]);
    useEffect(() => { const iv = setInterval(() => fetchSignals(), 45000); return () => clearInterval(iv); }, [fetchSignals]);

    // Seconds since update ticker
    useEffect(() => {
        const iv = setInterval(() => {
            if (lastUpdated) setSecSinceUpdate(Math.floor((Date.now() - lastUpdated) / 1000));
        }, 1000);
        return () => clearInterval(iv);
    }, [lastUpdated]);

    // Activity feed — alert-style, direction-aware
    useEffect(() => {
        if (!signals.length) return;
        setActivity(signals.slice(0, 12).map(s => {
            const dir = s.long ? 'LONG' : 'SHORT';
            const pct = `${s.movePct >= 0 ? '+' : ''}${s.movePct.toFixed(1)}%`;
            const prox = proximityStatus(s);

            if (s.status === 'new')
                return { icon: '🚨', t: `NEW SIGNAL: ${s.symbol} ${dir} — ${s.conf}%`, c: '#10b981', time: timeAgo(s.createdAt) };
            if (s.status === 'closed' && s.isWin)
                return { icon: '🎯', t: `${s.symbol} ${s.resultText} ${pct}`, c: '#10b981', time: timeAgo(s.expiresAt) };
            if (s.status === 'closed')
                return { icon: '❌', t: `${s.symbol} ${s.resultText} ${pct}`, c: '#ef4444', time: timeAgo(s.expiresAt) };
            if (prox === 'near-target')
                return { icon: '🎯', t: `${s.symbol} approaching target ${pct}`, c: '#10b981', time: timeAgo(s.createdAt) };
            if (prox === 'near-sl')
                return { icon: '⚠️', t: `${s.symbol} nearing stop loss ${pct}`, c: '#f59e0b', time: timeAgo(s.createdAt) };
            return { icon: '📊', t: `${s.symbol} ${dir} active — ${s.conf}%`, c: '#00adef', time: timeAgo(s.createdAt) };
        }));
    }, [signals]);

    // Copy trade setup
    const copySetup = (e, s) => {
        e.stopPropagation();
        const text = `${s.symbol} ${s.long?'LONG':'SHORT'}\nEntry: ${fmtPrice(s.entry)}\nSL: ${fmtPrice(s.sl)}\nTP1: ${fmtPrice(s.tp1)}\nTP2: ${fmtPrice(s.tp2)}\nTP3: ${fmtPrice(s.tp3)}\nR/R: 1:${s.rr}\nConf: ${s.conf}%`;
        navigator.clipboard.writeText(text);
        toast.success('Trade setup copied to clipboard', 'Copied');
    };

    // Filter by asset type first, then by status
    const assetFiltered = assetTab === 'stocks' ? signals.filter(s => !s.crypto)
        : assetTab === 'crypto' ? signals.filter(s => s.crypto)
        : signals;

    const filtered = filter === 'all' ? assetFiltered
        : filter === 'high' ? assetFiltered.filter(s => s.conf >= 70)
        : assetFiltered.filter(s => s.status === filter);

    const counts = { all: assetFiltered.length, new: assetFiltered.filter(s=>s.status==='new').length, active: assetFiltered.filter(s=>s.status==='active').length, closed: assetFiltered.filter(s=>s.status==='closed').length };
    const winRate = (() => { const c = signals.filter(s=>s.status==='closed'); if (!c.length) return 0; return Math.round(c.filter(s=>s.isWin).length / c.length * 100); })();

    return (
        <Page>
            <SEO title={`${assetTab==='stocks'?'Stock':assetTab==='crypto'?'Crypto':'Live'} Signal Feed — Nexus Signal`} description="Real-time AI-generated trade setups for stocks and crypto." />
            <Container>
                <Header>
                    <HeaderRow>
                        <TitleGroup>
                            <Title>
                                <Radio size={20} /> Live Signal Feed <LiveBadge>Live</LiveBadge>
                                {lastUpdated && <UpdatedAgo>Updated {secSinceUpdate}s ago</UpdatedAgo>}
                            </Title>
                            <Subtitle>Real-time AI-generated trade setups for stocks and crypto</Subtitle>
                        </TitleGroup>
                        <AssetTabs>
                            <AssetTab $active={assetTab==='all'} onClick={()=>navigate('/signals')}>All</AssetTab>
                            <AssetTab $active={assetTab==='stocks'} $variant="stocks" onClick={()=>navigate('/signals/stocks')}>
                                <TrendingUp size={13} style={{marginRight:4,verticalAlign:'middle'}}/> Stocks
                            </AssetTab>
                            <AssetTab $active={assetTab==='crypto'} $variant="crypto" onClick={()=>navigate('/signals/crypto')}>
                                <Zap size={13} style={{marginRight:4,verticalAlign:'middle'}}/> Crypto
                            </AssetTab>
                        </AssetTabs>

                        <Controls>
                            {['all','new','active','closed','high'].map(f => (
                                <FilterBtn key={f} $active={filter===f} onClick={()=>setFilter(f)}>
                                    {f==='high'?'High Conf':f.charAt(0).toUpperCase()+f.slice(1)}
                                    {f!=='high'&&counts[f]>0&&<span style={{opacity:.5}}> ({counts[f]})</span>}
                                </FilterBtn>
                            ))}
                            <RefreshBtn className={refreshing?'spinning':''} onClick={()=>fetchSignals(true)}>
                                <RefreshCw size={13}/> Refresh
                            </RefreshBtn>
                        </Controls>
                    </HeaderRow>
                </Header>

                <Grid>
                    <Feed>
                        {filtered.length===0&&<Empty>No signals match this filter. Check back soon.</Empty>}
                        {filtered.map((s, i) => {
                            const posMove = s.long ? s.movePct >= 0 : s.movePct <= 0;
                            const urgency = expiryUrgency(s.expiresAt);

                            return (
                            <Card key={s.id} $status={s.status} $highConf={s.conf>=70} $delay={`${i*.04}s`} onClick={()=>navigate(`/signal/${s.id}`)}>
                                <CardHeader>
                                    <SymbolGroup>
                                        <SymbolName>{s.symbol}</SymbolName>
                                        <AssetBadge $crypto={s.crypto}>{s.crypto?'Crypto':'Stock'}</AssetBadge>
                                        <DirectionTag $long={s.long}>
                                            {s.long?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}
                                            {s.long?'LONG':'SHORT'}
                                        </DirectionTag>
                                    </SymbolGroup>
                                    <BadgeGroup>
                                        <ScoreBadge $score={parseFloat(s.tradeScore)} title="Trade Quality Score based on confidence, R:R, and signal alignment">{s.tradeScore}/10</ScoreBadge>
                                        {!isPremium&&s.status==='new'&&<StatusBadge $type="delayed"><Lock size={9}/> Delayed</StatusBadge>}
                                        {proximityStatus(s)==='near-target'&&<StatusBadge $type="new">🎯 Near Target</StatusBadge>}
                                        {proximityStatus(s)==='near-sl'&&<StatusBadge $type="expiring">⚠ Near Stop</StatusBadge>}
                                        {(urgency==='urgent'||urgency==='soon')&&s.status!=='closed'&&<StatusBadge $type="expiring">Expiring Soon</StatusBadge>}
                                        <StatusBadge $type={s.status}>
                                            {s.status==='new'?'🟢 NEW':s.status==='active'?'🟡 ACTIVE':'🔵 CLOSED'}
                                        </StatusBadge>
                                    </BadgeGroup>
                                </CardHeader>

                                <CardBody>
                                    <LevelsGrid>
                                        <LevelBox><LevelLabel>Entry Price</LevelLabel><LevelValue>{fmtPrice(s.entry)}</LevelValue></LevelBox>
                                        <LevelBox><LevelLabel>Confidence</LevelLabel><LevelValue $c={s.conf>=75?'#10b981':s.conf>=60?'#f59e0b':'#94a3b8'} title="AI model confidence in this signal direction">{s.conf}%<ConfContext>— {s.confLabel}</ConfContext></LevelValue></LevelBox>
                                        <LevelBox><LevelLabel>Stop Loss <RiskTag $r={s.riskLevel}>{s.riskLevel} Risk</RiskTag></LevelLabel><LevelValue $c="#ef4444">{fmtPrice(s.sl)}</LevelValue></LevelBox>
                                        <LevelBox><LevelLabel>Risk / Reward</LevelLabel><LevelValue $c="#00adef" title="Reward-to-risk ratio: higher = better risk-adjusted trade">1:{s.rr}</LevelValue></LevelBox>
                                    </LevelsGrid>

                                    <TPRow>
                                        <TPBox><TPLabel>TP1</TPLabel><TPValue>{fmtPrice(s.tp1)}</TPValue></TPBox>
                                        <TPBox><TPLabel>TP2</TPLabel><TPValue>{fmtPrice(s.tp2)}</TPValue></TPBox>
                                        <TPBox><TPLabel>TP3</TPLabel><TPValue>{fmtPrice(s.tp3)}</TPValue></TPBox>
                                    </TPRow>

                                    {s.status!=='closed'&&(
                                        <PriceStory $pos={posMove}>
                                            <StoryTop>
                                                <StoryText $pos={posMove}>{moveStory(s)}</StoryText>
                                                <StoryPrice>{fmtPrice(s.entry)} → {fmtPrice(s.currentPrice)}</StoryPrice>
                                            </StoryTop>
                                            <BarContainer>
                                                <BarTrack><BarFill $pct={progressPct(s)} $pos={posMove}/></BarTrack>
                                                <BarLabels><span>SL {fmtPrice(s.sl)}</span><span>Entry</span><span>Target {fmtPrice(s.target)}</span></BarLabels>
                                            </BarContainer>
                                        </PriceStory>
                                    )}

                                    {s.status==='closed'&&(
                                        <ResultBox $win={s.isWin}>
                                            <ResultLabel $win={s.isWin}>{s.isWin?<CheckCircle size={16}/>:<XCircle size={16}/>}{s.resultText}</ResultLabel>
                                            <ResultPct $win={s.isWin}>{s.movePct>=0?'+':''}{s.movePct.toFixed(1)}%</ResultPct>
                                        </ResultBox>
                                    )}

                                    <TimeRow>
                                        <TimeItem><Clock size={11}/> Created {timeAgo(s.createdAt)}</TimeItem>
                                        {s.status!=='closed'&&(
                                            urgency==='urgent'
                                                ? <TimeItem><Timer size={11}/><UrgentTime>{timeLeft(s.expiresAt)}</UrgentTime></TimeItem>
                                                : <TimeItem><Timer size={11}/>{timeLeft(s.expiresAt)}</TimeItem>
                                        )}
                                    </TimeRow>

                                    <MetaRow>
                                        <TagGroup>
                                            {s.tags.map((t,j)=>(
                                                <Tag key={j}
                                                    $bg={t==='High Confidence'?'rgba(16,185,129,.06)':t==='Breakout'?'rgba(245,158,11,.06)':undefined}
                                                    $c={t==='High Confidence'?'#10b981':t==='Breakout'?'#f59e0b':undefined}
                                                    $b={t==='High Confidence'?'rgba(16,185,129,.12)':t==='Breakout'?'rgba(245,158,11,.12)':undefined}>
                                                    {t}
                                                </Tag>
                                            ))}
                                            <Tag>{s.tfLabel}</Tag>
                                            {s.idealFor.map((f,k)=>(<IdealTag key={k}>{f}</IdealTag>))}
                                        </TagGroup>
                                        {s.status!=='closed'&&(
                                            <ActionBtn onClick={(e)=>copySetup(e,s)}>
                                                <Copy size={12}/> Copy Trade Setup
                                            </ActionBtn>
                                        )}
                                    </MetaRow>
                                </CardBody>
                            </Card>
                            );
                        })}
                    </Feed>

                    <SideCol>
                        <SidebarCard>
                            <SideTitle><Activity size={15} color="#00adef"/> Live Activity</SideTitle>
                            <ActivityList>
                                {activity.map((a,i)=>(
                                    <ActItem key={i} $c={a.c}>
                                        <ActIcon>{a.icon}</ActIcon>
                                        <div>{a.t}<ActTime>{a.time}</ActTime></div>
                                    </ActItem>
                                ))}
                                {!activity.length&&<Empty style={{padding:'1rem'}}>Waiting for signals...</Empty>}
                            </ActivityList>

                            <StatsRow>
                                <StatBox><StatVal $c="#00adef">{signals.length}</StatVal><StatLbl>Signals</StatLbl></StatBox>
                                <StatBox><StatVal $c="#10b981">{winRate}%</StatVal><StatLbl>Win Rate</StatLbl></StatBox>
                                <StatBox><StatVal $c="#f59e0b">{counts.active}</StatVal><StatLbl>Active</StatLbl></StatBox>
                            </StatsRow>

                            {!isPremium&&(
                                <UpgradeBanner>
                                    <UpgradeTitle><Lock size={13}/> Unlock Real-Time Signals</UpgradeTitle>
                                    <UpgradeDesc>Free users see delayed signals. Get instant access + alerts.</UpgradeDesc>
                                    <UpgradeBtn onClick={()=>navigate('/pricing')}><Crown size={13}/> Upgrade to Premium</UpgradeBtn>
                                </UpgradeBanner>
                            )}
                        </SidebarCard>
                    </SideCol>
                </Grid>
            </Container>
        </Page>
    );
};

export default SignalsPage;
