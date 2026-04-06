// client/src/pages/SignalsPage.js — Decision Engine (Redesigned)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, Clock, Zap, Lock, Activity,
    CheckCircle, XCircle, RefreshCw, Radio, Crown, Copy,
    Timer, Target, Shield, ArrowUpRight, ArrowDownRight, DollarSign,
    AlertTriangle, Eye, ChevronRight, BarChart2, Award
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const CRYPTO_SET = new Set(['BTC','ETH','SOL','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','ATOM','UNI','LTC','NEAR','APT','BNB','SHIB']);

// ─── Animations ───────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`;
const featuredGlow = keyframes`0%,100%{box-shadow:0 0 20px rgba(16,185,129,.08),0 0 50px rgba(16,185,129,.03)}50%{box-shadow:0 0 35px rgba(16,185,129,.18),0 0 70px rgba(16,185,129,.06)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}`;
const countUp = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;
const nearTargetGlow = keyframes`0%,100%{box-shadow:0 0 8px rgba(16,185,129,.1)}50%{box-shadow:0 0 24px rgba(16,185,129,.25)}`;
const nearSlGlow = keyframes`0%,100%{box-shadow:0 0 8px rgba(239,68,68,.1)}50%{box-shadow:0 0 24px rgba(239,68,68,.25)}`;

// ─── Helpers ──────────────────────────────────────────────
const isCrypto = (sym) => { const base = sym?.split(':')[0]?.replace(/USDT|USD/i,'') || ''; return CRYPTO_SET.has(base.toUpperCase()); };
const fmtPrice = (p) => { if (!p) return '--'; if (p >= 1000) return `$${p.toLocaleString(undefined,{maximumFractionDigits:2})}`; if (p >= 1) return `$${p.toFixed(2)}`; if (p >= 0.01) return `$${p.toFixed(4)}`; return `$${p.toFixed(8)}`; };

const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 0) return 'just now';
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
    if (h < 1) return `${Math.floor(ms/60000)}m left`;
    if (h < 24) return `${h}h left`;
    return `${Math.floor(h / 24)}d left`;
};

// Progress between SL and TP3
const progressPct = (s) => {
    const slDist = Math.abs(s.entry - s.sl);
    const tpDist = Math.abs(s.target - s.entry);
    const totalRange = slDist + tpDist;
    if (totalRange === 0) return 50;
    return Math.max(0, Math.min(100, s.long
        ? ((s.currentPrice - s.sl) / totalRange) * 100
        : ((s.sl - s.currentPrice) / totalRange) * 100
    ));
};

// ═══════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════

const Page = styled.div`min-height:100vh;padding-top:80px;color:#e0e6ed;`;
const Container = styled.div`max-width:1400px;margin:0 auto;padding:2rem;@media(max-width:768px){padding:1rem;}`;

// ─── Action Header ───────────────────────────────────────
const ActionHeader = styled.div`
    display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;
    margin-bottom:1.5rem;animation:${fadeIn} .4s ease-out;
`;
const HeaderLeft = styled.div``;
const HeaderTitle = styled.h1`
    font-size:1.5rem;font-weight:800;color:#fff;margin:0 0 .2rem;
    display:flex;align-items:center;gap:.5rem;
`;
const HeaderSub = styled.p`font-size:.82rem;color:#64748b;margin:0;`;
const HeaderRight = styled.div`display:flex;align-items:center;gap:.75rem;`;
const LiveDot = styled.div`
    display:flex;align-items:center;gap:.4rem;padding:.35rem .75rem;
    background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15);
    border-radius:100px;font-size:.72rem;font-weight:600;color:#10b981;
    &::before{content:'';width:7px;height:7px;background:#10b981;border-radius:50%;animation:${pulse} 1.5s infinite;}
`;
const RefreshBtn = styled.button`
    padding:.4rem .75rem;border-radius:8px;font-size:.75rem;font-weight:600;cursor:pointer;
    background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:#94a3b8;
    display:flex;align-items:center;gap:.3rem;transition:all .2s;
    &:hover{background:rgba(0,173,237,.08);border-color:rgba(0,173,237,.2);color:#00adef;}
    &.spinning svg{animation:${spin} .8s linear;}
`;

// ─── Trust Bar ───────────────────────────────────────────
const TrustBar = styled.div`
    display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;
    padding:.7rem 1rem;margin-bottom:1.5rem;
    background:rgba(12,16,32,.8);border:1px solid rgba(255,255,255,.06);border-radius:12px;
    animation:${fadeIn} .4s ease-out .1s backwards;
`;
const TrustStat = styled.div`
    display:flex;align-items:center;gap:.3rem;font-size:.78rem;color:#94a3b8;
    animation:${countUp} .5s ease-out both;animation-delay:${p => p.$delay || '0s'};
`;
const TrustVal = styled.span`font-weight:800;color:${p => p.$c || '#e2e8f0'};font-size:.85rem;`;
const TrustDivider = styled.span`color:rgba(100,116,139,.25);font-size:.6rem;`;
const TrustEdge = styled.span`
    display:inline-flex;align-items:center;gap:.25rem;
    padding:.25rem .6rem;border-radius:6px;font-size:.78rem;font-weight:800;
    background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(16,185,129,.05));
    border:1px solid rgba(16,185,129,.25);color:#10b981;
`;
const TrustCopy = styled.span`
    margin-left:auto;font-size:.68rem;color:#475569;font-style:italic;
    @media(max-width:900px){display:none;}
`;

// ─── Controls ────────────────────────────────────────────
const ControlsRow = styled.div`
    display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;
    margin-bottom:1.25rem;animation:${fadeIn} .4s ease-out .15s backwards;
`;
const AssetTabs = styled.div`
    display:flex;gap:0;border-radius:10px;overflow:hidden;
    border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);
`;
const AssetTab = styled.button`
    padding:.45rem 1rem;font-size:.78rem;font-weight:700;cursor:pointer;
    border:none;transition:all .2s;
    background:${p=>p.$active?'rgba(0,173,237,.15)':'transparent'};
    color:${p=>p.$active?'#00adef':'#64748b'};
    border-right:1px solid rgba(255,255,255,.06);
    &:last-child{border-right:none;}
    &:hover{color:#00adef;background:rgba(0,173,237,.06);}
    ${p=>p.$active&&p.$variant==='crypto'&&`background:rgba(247,147,26,.12);color:#f7931a;&:hover{background:rgba(247,147,26,.18);color:#f7931a;}`}
`;
const FilterGroup = styled.div`display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;`;
const FilterBtn = styled.button`
    padding:.35rem .7rem;border-radius:7px;font-size:.72rem;font-weight:600;cursor:pointer;
    transition:all .2s;
    background:${p=>p.$active?'rgba(0,173,237,.12)':'rgba(255,255,255,.02)'};
    border:1px solid ${p=>p.$active?'rgba(0,173,237,.3)':'rgba(255,255,255,.05)'};
    color:${p=>p.$active?'#00adef':'#64748b'};
    &:hover{border-color:rgba(0,173,237,.25);color:#00adef;}
`;

// ─── Main Grid ───────────────────────────────────────────
const Grid = styled.div`display:grid;grid-template-columns:1fr 320px;gap:1.5rem;@media(max-width:1100px){grid-template-columns:1fr;}`;
const MainCol = styled.div`display:flex;flex-direction:column;gap:1.25rem;`;
const SideCol = styled.div`@media(max-width:1100px){order:-1;}`;

// ─── Featured Signal ─────────────────────────────────────
const FeaturedSection = styled.div`
    margin-bottom:.5rem;
    animation:${fadeIn} .5s ease-out .2s backwards;
`;
const FeaturedLabel = styled.div`
    display:flex;align-items:center;gap:.4rem;
    font-size:.82rem;font-weight:800;color:#f59e0b;margin-bottom:.6rem;
    letter-spacing:.02em;
`;
const FeaturedCard = styled.div`
    background:linear-gradient(145deg,rgba(16,185,129,.04) 0%,rgba(12,16,32,.95) 40%,rgba(16,185,129,.02) 100%);
    border:1.5px solid rgba(16,185,129,.25);border-radius:16px;
    overflow:hidden;cursor:pointer;transition:all .3s;
    animation:${featuredGlow} 4s ease-in-out infinite;
    &:hover{border-color:rgba(16,185,129,.45);transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.4);}
`;
const FeaturedInner = styled.div`padding:1.5rem;@media(max-width:600px){padding:1rem;}`;
const FeaturedTop = styled.div`display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;`;
const FeaturedLeft = styled.div`flex:1;min-width:200px;`;
const FeaturedSymbol = styled.div`font-size:1.8rem;font-weight:900;color:#fff;letter-spacing:.5px;line-height:1;margin-bottom:.4rem;`;
const FeaturedDir = styled.div`
    display:inline-flex;align-items:center;gap:.35rem;
    padding:.4rem 1rem;border-radius:8px;font-size:.9rem;font-weight:800;
    background:${p=>p.$long?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
    border:1px solid ${p=>p.$long?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'};
`;
const FeaturedRight = styled.div`text-align:right;`;
const FeaturedConfidence = styled.div`
    font-size:2.2rem;font-weight:900;color:#10b981;line-height:1;
    text-shadow:0 0 30px rgba(16,185,129,.3);
`;
const FeaturedConfLabel = styled.div`font-size:.65rem;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-top:.15rem;`;
const FeaturedMeta = styled.div`
    display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;font-size:.72rem;color:#475569;margin-top:.5rem;
`;
const FeaturedMetaItem = styled.span`display:flex;align-items:center;gap:.2rem;`;

const FeaturedLevels = styled.div`
    display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin:1rem 0;
    @media(max-width:600px){grid-template-columns:repeat(2,1fr);}
`;
const FLevel = styled.div`
    padding:.6rem .7rem;border-radius:10px;
    background:${p=>p.$bg||'rgba(255,255,255,.02)'};
    border:1px solid ${p=>p.$bc||'rgba(255,255,255,.05)'};
`;
const FLevelLabel = styled.div`font-size:.55rem;color:#475569;text-transform:uppercase;letter-spacing:.7px;margin-bottom:.2rem;`;
const FLevelValue = styled.div`font-size:1rem;font-weight:800;color:${p=>p.$c||'#e0e6ed'};`;

const FeaturedTPs = styled.div`display:flex;gap:.4rem;margin:.75rem 0;`;
const FTP = styled.div`
    flex:1;text-align:center;padding:.5rem;border-radius:8px;
    background:rgba(16,185,129,.03);border:1px solid rgba(16,185,129,.1);
`;
const FTPLabel = styled.div`font-size:.5rem;color:#10b981;font-weight:700;letter-spacing:.5px;`;
const FTPValue = styled.div`font-size:.88rem;font-weight:700;color:#10b981;`;

const AIReasoning = styled.div`
    padding:.75rem 1rem;margin:.75rem 0;border-radius:10px;
    background:rgba(0,173,237,.04);border:1px solid rgba(0,173,237,.12);
    display:flex;align-items:flex-start;gap:.5rem;
`;
const AIReasonIcon = styled.div`
    width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;
    background:rgba(0,173,237,.1);color:#00adef;flex-shrink:0;margin-top:.1rem;
`;
const AIReasonText = styled.div`font-size:.82rem;color:#c8d0da;line-height:1.5;`;

const FeaturedProgress = styled.div`margin:.75rem 0;`;
const ProgressTrack = styled.div`
    width:100%;height:8px;background:rgba(255,255,255,.04);border-radius:4px;
    overflow:visible;position:relative;
`;
const ProgressFill = styled.div`
    height:100%;border-radius:4px;transition:width .6s ease;
    width:${p=>Math.min(Math.max(p.$pct,2),98)}%;
    background:${p=>p.$pos?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#ef4444,#dc2626)'};
    position:relative;
`;
const ProgressDot = styled.div`
    position:absolute;right:-5px;top:-4px;width:16px;height:16px;
    border-radius:50%;background:${p=>p.$pos?'#10b981':'#ef4444'};
    border:3px solid rgba(12,16,32,.95);box-shadow:0 0 8px ${p=>p.$pos?'rgba(16,185,129,.5)':'rgba(239,68,68,.5)'};
`;
const ProgressLabels = styled.div`display:flex;justify-content:space-between;margin-top:.4rem;font-size:.62rem;color:#475569;`;
const ProgressPnl = styled.div`
    margin-top:.5rem;font-size:.82rem;font-weight:700;
    color:${p=>p.$pos?'#10b981':'#ef4444'};
`;

const FeaturedActions = styled.div`
    display:flex;gap:.6rem;margin-top:1rem;
    @media(max-width:500px){flex-direction:column;}
`;
const PrimaryBtn = styled.button`
    flex:1;padding:.7rem 1.2rem;border:none;border-radius:10px;font-size:.88rem;font-weight:700;
    background:linear-gradient(135deg,#10b981,#059669);color:#fff;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:.4rem;
    transition:all .25s;
    &:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(16,185,129,.3);}
`;
const SecondaryBtn = styled.button`
    flex:1;padding:.7rem 1.2rem;border-radius:10px;font-size:.88rem;font-weight:700;
    background:rgba(0,173,237,.06);border:1px solid rgba(0,173,237,.2);color:#00adef;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:.4rem;
    transition:all .25s;
    &:hover{background:rgba(0,173,237,.12);transform:translateY(-2px);}
`;

// ─── Trust Strip ─────────────────────────────────────────
const TrustStrip = styled.div`
    text-align:center;padding:.6rem;margin:.5rem 0 1rem;
    font-size:.72rem;color:#475569;font-weight:500;letter-spacing:.02em;
    border-top:1px solid rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.03);
`;

// ─── Signal Group ────────────────────────────────────────
const GroupSection = styled.div`margin-bottom:.5rem;`;
const GroupHeader = styled.div`
    display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem;
    padding-bottom:.4rem;border-bottom:1px solid rgba(255,255,255,.04);
`;
const GroupTitle = styled.h3`
    font-size:.88rem;font-weight:700;color:#e0e6ed;margin:0;
    display:flex;align-items:center;gap:.35rem;
`;
const GroupCount = styled.span`
    font-size:.65rem;font-weight:600;padding:.15rem .45rem;border-radius:4px;
    background:rgba(255,255,255,.04);color:#64748b;
`;

// ─── Signal Card ─────────────────────────────────────────
const Card = styled.div`
    background:rgba(12,16,32,.92);
    border:1px solid ${p=>
        p.$prox==='near-target'?'rgba(16,185,129,.3)':
        p.$prox==='near-sl'?'rgba(239,68,68,.25)':
        p.$result==='win'?'rgba(16,185,129,.15)':
        p.$result==='loss'?'rgba(239,68,68,.12)':
        'rgba(255,255,255,.06)'};
    border-radius:14px;overflow:hidden;transition:all .25s;cursor:pointer;
    animation:${fadeIn} .35s ease-out ${p=>p.$delay||'0s'} backwards;
    ${p=>p.$prox==='near-target'&&css`animation:${fadeIn} .35s ease-out backwards,${nearTargetGlow} 2.5s ease-in-out infinite;`}
    ${p=>p.$prox==='near-sl'&&css`animation:${fadeIn} .35s ease-out backwards,${nearSlGlow} 2.5s ease-in-out infinite;`}
    &:hover{border-color:rgba(0,173,237,.35);transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.3);}
`;
const CardInner = styled.div`padding:1rem 1.15rem;`;

const CardTop = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:.7rem;`;
const CardSymbolGroup = styled.div`display:flex;align-items:center;gap:.5rem;`;
const CardSymbol = styled.span`font-size:1.15rem;font-weight:800;color:#fff;`;
const CardAsset = styled.span`
    padding:.12rem .4rem;border-radius:4px;font-size:.55rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
    background:${p=>p.$crypto?'rgba(247,147,26,.08)':'rgba(0,173,237,.06)'};
    color:${p=>p.$crypto?'#f7931a':'#00adef'};
`;
const CardDir = styled.span`
    display:inline-flex;align-items:center;gap:.2rem;
    padding:.25rem .6rem;border-radius:6px;font-size:.75rem;font-weight:800;
    background:${p=>p.$long?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
`;
const CardRightGroup = styled.div`display:flex;align-items:center;gap:.4rem;`;
const CardConfidence = styled.div`
    font-size:.82rem;font-weight:800;
    color:${p=>p.$val>=75?'#10b981':p.$val>=60?'#f59e0b':'#94a3b8'};
`;
const CardStatus = styled.span`
    padding:.18rem .45rem;border-radius:5px;font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.3px;
    ${p=>p.$type==='active'&&'background:rgba(0,173,237,.08);color:#0ea5e9;border:1px solid rgba(0,173,237,.15);'}
    ${p=>p.$type==='win'&&'background:rgba(16,185,129,.1);color:#10b981;border:1px solid rgba(16,185,129,.2);'}
    ${p=>p.$type==='loss'&&'background:rgba(239,68,68,.08);color:#ef4444;border:1px solid rgba(239,68,68,.15);'}
    ${p=>p.$type==='expiring'&&'background:rgba(245,158,11,.08);color:#f59e0b;border:1px solid rgba(245,158,11,.15);'}
`;
const TradeId = styled.span`font-size:.6rem;color:#334155;font-weight:500;`;

const CardLevels = styled.div`
    display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;margin:.5rem 0;
    @media(max-width:500px){grid-template-columns:repeat(2,1fr);}
`;
const CLevel = styled.div`
    padding:.4rem .5rem;border-radius:7px;
    background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.03);
`;
const CLevelLabel = styled.div`font-size:.5rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;`;
const CLevelValue = styled.div`font-size:.82rem;font-weight:700;color:${p=>p.$c||'#c8d0da'};`;

const CardTPRow = styled.div`display:flex;gap:.35rem;margin:.4rem 0;`;
const CardTP = styled.div`
    flex:1;text-align:center;padding:.3rem .4rem;border-radius:5px;
    background:rgba(16,185,129,.02);border:1px solid rgba(16,185,129,.06);
`;
const CardTPLabel = styled.div`font-size:.45rem;color:#10b981;font-weight:700;letter-spacing:.4px;`;
const CardTPValue = styled.div`font-size:.72rem;font-weight:700;color:#10b981;`;

// Card progress bar (SL → Price → TP)
const CardProgress = styled.div`margin:.6rem 0;`;
const CardProgressTrack = styled.div`width:100%;height:5px;background:rgba(255,255,255,.04);border-radius:3px;position:relative;overflow:visible;`;
const CardProgressFill = styled.div`
    height:100%;border-radius:3px;transition:width .6s ease;
    width:${p=>Math.min(Math.max(p.$pct,2),98)}%;
    background:${p=>p.$pos?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#ef4444,#dc2626)'};
    position:relative;
`;
const CardProgressDot = styled.div`
    position:absolute;right:-3px;top:-3px;width:11px;height:11px;
    border-radius:50%;background:${p=>p.$pos?'#10b981':'#ef4444'};
    border:2px solid rgba(12,16,32,.9);box-shadow:0 0 6px ${p=>p.$pos?'rgba(16,185,129,.4)':'rgba(239,68,68,.4)'};
`;
const CardProgressLabels = styled.div`display:flex;justify-content:space-between;margin-top:.25rem;font-size:.55rem;color:#475569;`;

const CardPnl = styled.div`
    display:flex;align-items:center;justify-content:space-between;
    padding:.5rem .65rem;margin:.5rem 0;border-radius:8px;
    background:${p=>p.$pos?'rgba(16,185,129,.04)':'rgba(239,68,68,.04)'};
    border:1px solid ${p=>p.$pos?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};
`;
const CardPnlLabel = styled.span`font-size:.7rem;color:#64748b;`;
const CardPnlValue = styled.span`font-size:.95rem;font-weight:800;color:${p=>p.$pos?'#10b981':'#ef4444'};`;
const CardLivePrice = styled.span`font-size:.78rem;font-weight:700;color:${p=>p.$pos?'#10b981':'#ef4444'};`;

const CardResult = styled.div`
    display:flex;align-items:center;justify-content:space-between;
    padding:.6rem .75rem;border-radius:8px;
    background:${p=>p.$win?'rgba(16,185,129,.05)':'rgba(239,68,68,.05)'};
    border:1px solid ${p=>p.$win?'rgba(16,185,129,.15)':'rgba(239,68,68,.15)'};
`;
const CardResultLabel = styled.div`display:flex;align-items:center;gap:.35rem;font-size:.82rem;font-weight:700;color:${p=>p.$win?'#10b981':'#ef4444'};`;
const CardResultPct = styled.div`font-size:1.05rem;font-weight:900;color:${p=>p.$win?'#10b981':'#ef4444'};`;

const CardBottom = styled.div`
    display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.4rem;
    margin-top:.5rem;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.03);
`;
const CardMeta = styled.div`display:flex;align-items:center;gap:.6rem;font-size:.65rem;color:#475569;`;
const CardMetaItem = styled.span`display:flex;align-items:center;gap:.2rem;`;
const CardActions = styled.div`display:flex;gap:.35rem;`;
const CardBtn = styled.button`
    padding:.3rem .6rem;border-radius:6px;font-size:.68rem;font-weight:700;
    cursor:pointer;display:flex;align-items:center;gap:.25rem;transition:all .2s;
    background:${p=>p.$primary?'rgba(16,185,129,.08)':'rgba(0,173,237,.06)'};
    border:1px solid ${p=>p.$primary?'rgba(16,185,129,.2)':'rgba(0,173,237,.15)'};
    color:${p=>p.$primary?'#10b981':'#00adef'};
    &:hover{transform:translateY(-1px);background:${p=>p.$primary?'rgba(16,185,129,.15)':'rgba(0,173,237,.12)'};}
`;
const RiskBadge = styled.span`
    padding:.12rem .35rem;border-radius:3px;font-size:.52rem;font-weight:700;text-transform:uppercase;letter-spacing:.3px;
    background:${p=>p.$r==='Low'?'rgba(16,185,129,.06)':p.$r==='Medium'?'rgba(245,158,11,.06)':'rgba(239,68,68,.06)'};
    color:${p=>p.$r==='Low'?'#10b981':p.$r==='Medium'?'#f59e0b':'#ef4444'};
    border:1px solid ${p=>p.$r==='Low'?'rgba(16,185,129,.12)':p.$r==='Medium'?'rgba(245,158,11,.12)':'rgba(239,68,68,.12)'};
`;

// ─── Sidebar ─────────────────────────────────────────────
const SidebarCard = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(255,255,255,.06);
    border-radius:14px;padding:1.15rem;position:sticky;top:96px;
`;
const SideTitle = styled.h3`font-size:.88rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.4rem;margin:0 0 .15rem;`;
const SideSub = styled.p`font-size:.65rem;color:#475569;margin:0 0 .75rem;`;
const OutcomeList = styled.div`display:flex;flex-direction:column;gap:.3rem;max-height:420px;overflow-y:auto;`;
const OutcomeItem = styled.div`
    display:flex;align-items:center;gap:.5rem;padding:.5rem .55rem;border-radius:7px;
    background:rgba(255,255,255,.02);animation:${slideIn} .3s ease-out;
    cursor:pointer;transition:all .15s;
    border-left:3px solid ${p=>p.$c||'#00adef'};
    &:hover{background:rgba(255,255,255,.04);transform:translateX(2px);}
`;
const OutcomeIcon = styled.span`font-size:.82rem;flex-shrink:0;`;
const OutcomeText = styled.div`flex:1;min-width:0;`;
const OutcomeMain = styled.div`font-size:.75rem;color:#c8d0da;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
const OutcomeTime = styled.div`font-size:.58rem;color:#475569;margin-top:.1rem;`;

const SideStats = styled.div`
    display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;
    margin-top:.75rem;padding-top:.75rem;border-top:1px solid rgba(255,255,255,.04);
`;
const SideStat = styled.div`text-align:center;`;
const SideStatVal = styled.div`font-size:1.1rem;font-weight:800;color:${p=>p.$c||'#00adef'};`;
const SideStatLabel = styled.div`font-size:.52rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-top:.1rem;`;

const UpgradeBanner = styled.div`
    margin-top:.75rem;padding:.85rem;border-radius:10px;
    background:linear-gradient(135deg,rgba(0,173,237,.05),rgba(139,92,246,.05));
    border:1px solid rgba(0,173,237,.12);
`;
const UpgradeTitle = styled.div`font-size:.82rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.3rem;margin-bottom:.2rem;`;
const UpgradeDesc = styled.div`font-size:.68rem;color:#64748b;margin-bottom:.5rem;`;
const UpgradeBtn = styled.button`
    width:100%;padding:.5rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;border-radius:8px;color:#fff;font-weight:700;font-size:.78rem;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.3rem;
    transition:all .2s;&:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,173,237,.3);}
`;

// ─── Copy Modal ──────────────────────────────────────────
const ModalOverlay = styled.div`
    position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);
    z-index:1000;display:flex;align-items:center;justify-content:center;
    animation:${fadeIn} .15s ease-out;
`;
const ModalCard = styled.div`
    background:#0f1729;border:1px solid rgba(100,116,139,.2);border-radius:16px;
    padding:1.5rem;width:90%;max-width:380px;position:relative;
`;
const ModalTitle = styled.h3`font-size:1.05rem;font-weight:800;color:#e2e8f0;margin:0 0 .25rem;`;
const ModalSub = styled.p`font-size:.78rem;color:#64748b;margin:0 0 1rem;`;
const ModalClose = styled.button`
    position:absolute;top:1rem;right:1rem;background:none;border:none;color:#64748b;cursor:pointer;
    &:hover{color:#e2e8f0;}
`;
const ModalOption = styled.button`
    width:100%;display:flex;align-items:center;gap:.75rem;
    padding:.85rem 1rem;border-radius:10px;border:1px solid ${p => p.$disabled ? 'rgba(100,116,139,.1)' : 'rgba(16,185,129,.2)'};
    background:${p => p.$disabled ? 'rgba(100,116,139,.04)' : 'rgba(16,185,129,.06)'};
    color:${p => p.$disabled ? '#475569' : '#e2e8f0'};
    cursor:${p => p.$disabled ? 'not-allowed' : 'pointer'};
    opacity:${p => p.$disabled ? '.5' : '1'};
    transition:all .2s;margin-bottom:.5rem;text-align:left;
    ${p => !p.$disabled && '&:hover{border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.1);transform:translateY(-1px);}'}
`;
const ModalOptIcon = styled.div`
    width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;
    background:${p => p.$disabled ? 'rgba(100,116,139,.08)' : 'rgba(16,185,129,.1)'};
    color:${p => p.$disabled ? '#475569' : '#10b981'};flex-shrink:0;
`;
const ModalOptText = styled.div`flex:1;`;
const ModalOptTitle = styled.div`font-size:.85rem;font-weight:700;`;
const ModalOptDesc = styled.div`font-size:.68rem;color:#64748b;margin-top:.1rem;`;
const ComingSoonBadge = styled.span`
    font-size:.55rem;font-weight:700;color:#f59e0b;background:rgba(245,158,11,.1);
    border:1px solid rgba(245,158,11,.2);padding:1px 6px;border-radius:4px;
`;

// Intelligence tags
const IntelRow = styled.div`display:flex;align-items:center;gap:.3rem;flex-wrap:wrap;margin:.4rem 0;`;
const IntelTag = styled.span`
    padding:.12rem .4rem;border-radius:4px;font-size:.55rem;font-weight:700;letter-spacing:.3px;
    background:${p => p.$bg || 'rgba(100,116,139,.08)'};
    color:${p => p.$c || '#94a3b8'};
    border:1px solid ${p => p.$bc || 'rgba(100,116,139,.12)'};
`;
const SentimentTag = styled(IntelTag)`
    background:${p => p.$sentiment === 'Bullish' ? 'rgba(16,185,129,.08)' : p.$sentiment === 'Bearish' ? 'rgba(239,68,68,.08)' : 'rgba(245,158,11,.08)'};
    color:${p => p.$sentiment === 'Bullish' ? '#10b981' : p.$sentiment === 'Bearish' ? '#ef4444' : '#f59e0b'};
    border-color:${p => p.$sentiment === 'Bullish' ? 'rgba(16,185,129,.2)' : p.$sentiment === 'Bearish' ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.2)'};
`;
const ConvictionTag = styled(IntelTag)`
    background:${p => p.$level === 'strong' ? 'rgba(16,185,129,.08)' : p.$level === 'moderate' ? 'rgba(245,158,11,.08)' : 'rgba(100,116,139,.06)'};
    color:${p => p.$level === 'strong' ? '#10b981' : p.$level === 'moderate' ? '#f59e0b' : '#64748b'};
    border-color:${p => p.$level === 'strong' ? 'rgba(16,185,129,.2)' : p.$level === 'moderate' ? 'rgba(245,158,11,.2)' : 'rgba(100,116,139,.12)'};
`;
const AIReasonLine = styled.div`font-size:.7rem;color:#94a3b8;font-style:italic;margin:.3rem 0;line-height:1.4;`;

const Empty = styled.div`text-align:center;padding:2.5rem;color:#475569;font-size:.85rem;`;
const ArchiveHeader = styled.div`display:flex;align-items:center;gap:.5rem;padding:.6rem .85rem;margin-bottom:.5rem;background:rgba(100,116,139,.06);border:1px solid rgba(100,116,139,.1);border-radius:8px;color:#94a3b8;font-size:.8rem;font-weight:500;`;
const DateSep = styled.div`display:flex;align-items:center;gap:.5rem;padding:.4rem 0;color:#475569;font-size:.72rem;font-weight:600;text-transform:uppercase;&::after{content:'';flex:1;height:1px;background:rgba(100,116,139,.15);}`;

// ═══════════════════════════════════════════════════════════
// BUILD SIGNAL
// ═══════════════════════════════════════════════════════════
function buildSignal(raw, index, totalCount) {
    const now = new Date();
    const created = new Date(raw.createdAt);
    const expires = new Date(raw.expiresAt);
    const ageHours = (now - created) / 3600000;
    const expired = now > expires;
    const days = Math.max(1, Math.round((expires - created) / 86400000));

    const sym = raw.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || raw.symbol;
    const crypto = raw.assetType === 'crypto' || raw.assetType === 'dex' || isCrypto(raw.symbol);
    const long = raw.direction === 'UP';
    const conf = Math.round(raw.confidence || 50);

    // Use LOCKED values from backend
    const entry = raw.entryPrice || raw.entry || raw.livePrice || raw.currentPrice || raw.targetPrice;
    const sl = raw.stopLoss || raw.sl || (long ? entry * 0.95 : entry * 1.05);
    const tp1 = raw.takeProfit1 || raw.tp1 || (long ? entry * 1.03 : entry * 0.97);
    const tp2 = raw.takeProfit2 || raw.tp2 || (long ? entry * 1.08 : entry * 0.92);
    const tp3 = raw.takeProfit3 || raw.tp3 || (long ? entry * 1.12 : entry * 0.88);
    const target = tp3;

    const rr = Math.abs(entry - sl) > 0 ? (Math.abs(target - entry) / Math.abs(entry - sl)).toFixed(1) : '2.0';

    const currentPrice = raw.result
        ? (raw.resultPrice || raw.livePrice || raw.currentPrice || entry)
        : (raw.livePrice || raw.currentPrice || raw.lastPrice || entry);
    const rawMovePct = raw.result
        ? ((currentPrice - entry) / entry * 100)
        : (raw.liveChangePercent ?? ((currentPrice - entry) / entry * 100));
    const movePct = long ? rawMovePct : -rawMovePct;

    const isWin = raw.result ? raw.result === 'win' : (expired ? (long ? currentPrice > entry : currentPrice < entry) : null);
    const resultText = raw.resultText || (expired ? (isWin ? 'Target Hit' : 'SL Hit') : null);

    // Status
    let status = 'active';
    if (expired || raw.result) status = 'closed';

    // Risk level
    const slPct = Math.abs((sl - entry) / entry * 100);
    const riskLevel = slPct > 5 ? 'High' : slPct > 2.5 ? 'Medium' : 'Low';

    // Priority score
    const rrNum = parseFloat(rr) || 2;
    const confWeight = (conf / 100) * 4;
    const rrWeight = Math.min(rrNum / 3, 1) * 2.5;
    const momentumWeight = conf >= 70 ? 2 : 1;
    const freshWeight = ageHours < 6 ? 1.5 : 0.75;
    const tradeScore = Math.min(10, Math.max(1, confWeight + rrWeight + momentumWeight + freshWeight)).toFixed(1);

    // Trade number (reverse from total for display)
    const tradeNum = totalCount - index;

    // ─── Derive intelligence from indicators ───
    const indicators = raw.indicators || {};
    const analysis = raw.analysis || {};
    const indEntries = Object.entries(indicators);

    // Count indicator alignment
    let buyCount = 0, sellCount = 0, neutralCount = 0;
    indEntries.forEach(([, data]) => {
        const sig = String(data?.signal || '').toUpperCase();
        if (sig === 'BUY') buyCount++;
        else if (sig === 'SELL') sellCount++;
        else neutralCount++;
    });
    const total = indEntries.length || 1;
    const alignedCount = long ? buyCount : sellCount;
    const alignmentRatio = alignedCount / total;

    // Conviction tier (derived from actual indicators, not raw confidence)
    const conviction = alignmentRatio >= 0.6 && conf >= 70 ? 'strong'
        : alignmentRatio >= 0.4 || conf >= 60 ? 'moderate'
        : alignmentRatio > 0 ? 'low' : 'none';

    // Sentiment from analysis or indicators
    const volIndicator = indicators['Volume'] || indicators['volume'];
    const trendIndicator = indicators['Trend'] || indicators['trend'];
    const rsiIndicator = indicators['RSI'] || indicators['rsi'];
    const volatility = analysis?.volatility || 'moderate';

    // Sentiment tag
    let sentimentTag = 'Mixed';
    if (buyCount > sellCount + neutralCount) sentimentTag = 'Bullish';
    else if (sellCount > buyCount + neutralCount) sentimentTag = 'Bearish';
    else if (neutralCount >= total * 0.7) sentimentTag = 'Neutral';

    // Market regime
    let regime = 'Mixed';
    if (volatility === 'high' || (rsiIndicator?.value > 70 || rsiIndicator?.value < 30)) regime = 'Volatile';
    else if (trendIndicator?.signal === 'BUY' || trendIndicator?.signal === 'SELL') regime = 'Trending';
    else if (volatility === 'low') regime = 'Range-Bound';

    // Supporting factors (compact chips)
    const factors = [];
    if (trendIndicator?.signal === (long ? 'BUY' : 'SELL')) factors.push('Trend Aligned');
    if (volIndicator?.value === 'High' || volIndicator?.signal === 'BUY') factors.push('Volume Confirm');
    if (rsiIndicator?.value < 35 && long) factors.push('Oversold Bounce');
    if (rsiIndicator?.value > 65 && !long) factors.push('Overbought Rejection');
    if (alignmentRatio >= 0.6) factors.push('Multi-Indicator');
    if (conf >= 75) factors.push('High Conviction');
    if (factors.length === 0) factors.push('AI Pattern');

    // AI reason (richer than before)
    const dirWord = long ? 'Bullish' : 'Bearish';
    const reasoning = analysis.message || (
        conviction === 'strong'
            ? `${dirWord} continuation with ${sentimentTag.toLowerCase()} sentiment and ${factors[0]?.toLowerCase() || 'multiple indicators aligned'}.`
            : conviction === 'moderate'
            ? `${dirWord} setup with ${sentimentTag.toLowerCase()} conditions. ${regime} market regime.`
            : `${dirWord} lean detected — mixed signals, ${sentimentTag.toLowerCase()} sentiment.`
    );

    // Proximity
    const prox = status === 'closed' ? null : (() => {
        const abs = Math.abs(movePct);
        const totalRange = Math.abs((target - entry) / entry * 100);
        const favourable = movePct >= 0;
        if (favourable && abs >= totalRange * 0.85) return 'near-target';
        if (!favourable && abs >= totalRange * 0.65) return 'near-sl';
        return null;
    })();

    // Expiry urgency
    const msLeft = expires - now;
    const urgency = msLeft <= 0 ? 'expired' : msLeft < 3600000 ? 'urgent' : msLeft < 86400000 ? 'soon' : 'normal';

    return {
        id: raw._id || `sig-${index}`,
        symbol: sym, fullSymbol: raw.symbol, crypto, long, conf, status,
        entry, target, currentPrice, sl, tp1, tp2, tp3, rr, riskLevel,
        movePct, tradeScore, tradeNum, reasoning, prox, urgency,
        isWin, resultText, days,
        conviction, sentimentTag, regime, factors,
        createdAt: raw.createdAt, expiresAt: raw.expiresAt, resultAt: raw.resultAt,
    };
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const SignalsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, api } = useAuth();
    const toast = useToast();
    const { hasPlanAccess } = useSubscription();
    const isPremium = hasPlanAccess('starter');

    const assetTab = location.pathname.endsWith('/stocks') ? 'stocks'
        : location.pathname.endsWith('/crypto') ? 'crypto' : 'all';

    const [signals, setSignals] = useState([]);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [secSinceUpdate, setSecSinceUpdate] = useState(0);
    const [globalStats, setGlobalStats] = useState(null);
    const [copyModal, setCopyModal] = useState(null);

    const fetchSignals = useCallback(async (showSpin = false) => {
        if (showSpin) setRefreshing(true);
        try {
            let preds = [];
            if (api) {
                try {
                    const res = await api.get('/predictions/recent?limit=200&includeLivePrices=true');
                    preds = Array.isArray(res.data) ? res.data : [];
                } catch (e) { /* fall through */ }
            }
            if (!preds.length) {
                const res = await fetch(`${API_URL}/predictions/recent?limit=200`);
                if (res.ok) {
                    const data = await res.json();
                    preds = Array.isArray(data) ? data : [];
                }
            }
            if (preds.length) {
                setSignals(preds.map((p, i) => buildSignal(p, i, preds.length)));
                setLastUpdated(Date.now());
            }
        } catch (e) { /* silent */ }
        if (showSpin) setTimeout(() => setRefreshing(false), 500);
    }, [api]);

    useEffect(() => { fetchSignals(); }, [fetchSignals]);
    useEffect(() => { const iv = setInterval(() => fetchSignals(), 30000); return () => clearInterval(iv); }, [fetchSignals]);
    useEffect(() => {
        const iv = setInterval(() => {
            if (lastUpdated) setSecSinceUpdate(Math.floor((Date.now() - lastUpdated) / 1000));
        }, 1000);
        return () => clearInterval(iv);
    }, [lastUpdated]);

    // Fetch global stats + performance data
    const [perfStats, setPerfStats] = useState(null);
    useEffect(() => {
        fetch(`${API_URL}/predictions/stats`).then(r => r.json()).then(d => { if (d.success) setGlobalStats(d); }).catch(() => {});
        fetch(`${API_URL}/predictions/performance?limit=1`).then(r => r.json()).then(d => { if (d.success) setPerfStats(d.stats); }).catch(() => {});
    }, [lastUpdated]);

    // Quality gate: 55%+ or closed
    const qualified = signals.filter(s => s.conf >= 55 || s.status === 'closed');

    // Asset filter
    const assetFiltered = assetTab === 'stocks' ? qualified.filter(s => !s.crypto)
        : assetTab === 'crypto' ? qualified.filter(s => s.crypto)
        : qualified;

    // Sort by score
    const sorted = [...assetFiltered].sort((a, b) => {
        if (a.status !== 'closed' && b.status !== 'closed') return parseFloat(b.tradeScore) - parseFloat(a.tradeScore);
        if (a.status === 'closed' && b.status !== 'closed') return 1;
        return parseFloat(b.tradeScore) - parseFloat(a.tradeScore);
    });

    // Group signals
    const active = sorted.filter(s => s.status !== 'closed');
    const highConf = active.filter(s => s.conf >= 80);
    const regularActive = active.filter(s => s.conf < 80);
    const closed = sorted.filter(s => s.status === 'closed');
    const DAY_MS = 24 * 60 * 60 * 1000;
    const recentClosed = closed.filter(s => (Date.now() - new Date(s.resultAt || s.createdAt).getTime()) < DAY_MS);
    const archivedClosed = closed.filter(s => (Date.now() - new Date(s.resultAt || s.createdAt).getTime()) >= DAY_MS);

    // Featured signal: highest scored active with 65%+ conf
    const featured = active.find(s => s.conf >= 65) || active[0] || null;
    const feedSignals = active.filter(s => s.id !== featured?.id);

    // Filter logic
    const getFiltered = () => {
        switch(filter) {
            case 'high': return feedSignals.filter(s => s.conf >= 80);
            case 'active': return feedSignals;
            case 'closed': return recentClosed;
            case 'archive': return archivedClosed;
            default: return [...feedSignals, ...recentClosed];
        }
    };
    const filtered = getFiltered();

    // Stats — single source of truth from /performance endpoint, fallback to /stats
    const winRate = perfStats?.winRate ?? globalStats?.winRate ?? null;
    const totalTracked = perfStats?.total ?? globalStats?.total ?? signals.length;
    const totalWins = perfStats?.wins ?? globalStats?.wins ?? 0;
    const totalLosses = perfStats?.losses ?? globalStats?.losses ?? 0;
    const avgReturn = perfStats?.avgReturn ?? 0;
    const edge = perfStats?.edge ?? 0;

    const counts = {
        all: feedSignals.length + recentClosed.length,
        active: feedSignals.length,
        high: feedSignals.filter(s => s.conf >= 80).length,
        closed: recentClosed.length,
        archive: archivedClosed.length,
    };

    // Activity feed for sidebar
    const outcomes = [...qualified].sort((a, b) => {
        const aResult = a.status === 'closed' && a.resultText;
        const bResult = b.status === 'closed' && b.resultText;
        if (aResult && !bResult) return -1;
        if (!aResult && bResult) return 1;
        if (aResult && bResult) return new Date(b.resultAt || b.createdAt) - new Date(a.resultAt || a.createdAt);
        return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 15).map(s => {
        const pct = `${s.movePct >= 0 ? '+' : ''}${s.movePct.toFixed(1)}%`;
        const dir = s.long ? 'LONG' : 'SHORT';
        const base = { id: s.id, time: timeAgo(s.resultAt || s.createdAt) };
        if (s.status === 'closed' && s.isWin) return { ...base, icon: '🎯', text: `${s.symbol} ${s.resultText} ${pct}`, color: '#10b981' };
        if (s.status === 'closed') return { ...base, icon: '❌', text: `${s.symbol} ${s.resultText} ${pct}`, color: '#ef4444' };
        if (s.prox === 'near-target') return { ...base, icon: '🎯', text: `${s.symbol} approaching target`, color: '#10b981' };
        if (s.prox === 'near-sl') return { ...base, icon: '⚠️', text: `${s.symbol} near stop loss`, color: '#f59e0b' };
        return { ...base, icon: '📊', text: `${s.symbol} ${dir} ${s.conf}%`, color: '#0ea5e9' };
    });

    // Copy trade
    const executeCopyToPaper = () => {
        if (!copyModal) return;
        navigate('/paper-trading', {
            state: {
                signal: {
                    symbol: copyModal.symbol, long: copyModal.long, crypto: copyModal.crypto,
                    entry: copyModal.entry, sl: copyModal.sl, tp1: copyModal.tp1,
                    tp2: copyModal.tp2, tp3: copyModal.tp3, conf: copyModal.conf, rr: copyModal.rr
                }
            }
        });
        setCopyModal(null);
    };

    // Archive grouping by date
    const archiveByDate = {};
    archivedClosed.forEach(s => {
        const key = new Date(s.resultAt || s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (!archiveByDate[key]) archiveByDate[key] = [];
        archiveByDate[key].push(s);
    });

    return (
        <Page>
            <SEO title={`${assetTab==='stocks'?'Stock':assetTab==='crypto'?'Crypto':'Live'} AI Signals — Nexus Signal`} description="Real-time AI-generated trade setups. Every trade tracked. No cherry-picking." />
            <Container>

                {/* ═══ SECTION 1: ACTION HEADER ═══ */}
                <ActionHeader>
                    <HeaderLeft>
                        <HeaderTitle>
                            <Radio size={18} /> Live AI Signals
                        </HeaderTitle>
                        <HeaderSub>Real-time trade setups with full transparency. Every outcome tracked.</HeaderSub>
                    </HeaderLeft>
                    <HeaderRight>
                        <LiveDot>
                            Live {lastUpdated && `· ${secSinceUpdate}s ago`}
                        </LiveDot>
                        <RefreshBtn className={refreshing ? 'spinning' : ''} onClick={() => fetchSignals(true)}>
                            <RefreshCw size={13} /> Refresh
                        </RefreshBtn>
                    </HeaderRight>
                </ActionHeader>

                {/* ═══ SECTION 2: TRUST BAR ═══ */}
                <TrustBar>
                    <TrustStat $delay="0s">
                        <TrustVal $c={winRate >= 50 ? '#10b981' : '#f59e0b'}>{winRate !== null ? `${winRate}%` : '--'}</TrustVal> Win Rate
                    </TrustStat>
                    <TrustDivider>|</TrustDivider>
                    <TrustStat $delay=".05s">
                        Avg Return <TrustVal $c={avgReturn >= 0 ? '#10b981' : '#ef4444'}>{avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%</TrustVal>
                    </TrustStat>
                    <TrustDivider>|</TrustDivider>
                    <TrustStat $delay=".1s">
                        <TrustVal $c="#00adef">{totalTracked}</TrustVal> Trades Tracked
                    </TrustStat>
                    <TrustDivider>|</TrustDivider>
                    <TrustStat $delay=".15s">
                        <TrustVal $c="#10b981">{totalWins}</TrustVal>W <TrustVal $c="#64748b">{totalLosses}</TrustVal>L
                    </TrustStat>
                    {edge !== 0 && <>
                        <TrustDivider>|</TrustDivider>
                        <TrustEdge>
                            <Zap size={12} /> Edge: {edge >= 0 ? '+' : ''}{edge.toFixed(1)}% per trade
                        </TrustEdge>
                    </>}
                    <TrustCopy>Every trade tracked automatically — including losses</TrustCopy>
                </TrustBar>

                {/* ═══ SECTION 3: CONTROLS ═══ */}
                <ControlsRow>
                    <AssetTabs>
                        <AssetTab $active={assetTab==='all'} onClick={() => navigate('/signals')}>All</AssetTab>
                        <AssetTab $active={assetTab==='stocks'} $variant="stocks" onClick={() => navigate('/signals/stocks')}>
                            <TrendingUp size={12} style={{marginRight:3,verticalAlign:'middle'}}/> Stocks
                        </AssetTab>
                        <AssetTab $active={assetTab==='crypto'} $variant="crypto" onClick={() => navigate('/signals/crypto')}>
                            <Zap size={12} style={{marginRight:3,verticalAlign:'middle'}}/> Crypto
                        </AssetTab>
                    </AssetTabs>
                    <FilterGroup>
                        {[
                            { key: 'all', label: 'All Signals' },
                            { key: 'high', label: 'High Confidence' },
                            { key: 'active', label: 'Active' },
                            { key: 'closed', label: 'Recently Closed' },
                            { key: 'archive', label: 'Archive' },
                        ].map(f => (
                            <FilterBtn key={f.key} $active={filter===f.key} onClick={() => setFilter(f.key)}>
                                {f.label}{counts[f.key] > 0 && <span style={{opacity:.5,marginLeft:3}}>({counts[f.key]})</span>}
                            </FilterBtn>
                        ))}
                    </FilterGroup>
                </ControlsRow>

                <Grid>
                    <MainCol>
                        {/* ═══ SECTION 4: FEATURED SIGNAL ═══ */}
                        {featured && filter !== 'closed' && filter !== 'archive' && (
                            <FeaturedSection>
                                <FeaturedLabel>
                                    <Award size={16} /> Best Setup Right Now
                                </FeaturedLabel>
                                <FeaturedCard onClick={() => navigate(`/signal/${featured.id}`)}>
                                    <FeaturedInner>
                                        <FeaturedTop>
                                            <FeaturedLeft>
                                                <FeaturedSymbol>{featured.symbol}</FeaturedSymbol>
                                                <FeaturedDir $long={featured.long}>
                                                    {featured.long ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                                                    {featured.long ? 'LONG' : 'SHORT'}
                                                </FeaturedDir>
                                                <FeaturedMeta>
                                                    <FeaturedMetaItem>
                                                        <RiskBadge $r={featured.riskLevel}>{featured.riskLevel} Risk</RiskBadge>
                                                    </FeaturedMetaItem>
                                                    <FeaturedMetaItem>R:R 1:{featured.rr}</FeaturedMetaItem>
                                                    <FeaturedMetaItem>{featured.crypto ? 'Crypto' : 'Stock'}</FeaturedMetaItem>
                                                    <FeaturedMetaItem><Clock size={11}/> Opened {timeAgo(featured.createdAt)}</FeaturedMetaItem>
                                                    <FeaturedMetaItem>Trade #{featured.tradeNum}</FeaturedMetaItem>
                                                    <CardStatus $type="active">ACTIVE</CardStatus>
                                                </FeaturedMeta>
                                            </FeaturedLeft>
                                            <FeaturedRight>
                                                <FeaturedConfidence>{featured.conf}%</FeaturedConfidence>
                                                <FeaturedConfLabel>AI Confidence</FeaturedConfLabel>
                                            </FeaturedRight>
                                        </FeaturedTop>

                                        <FeaturedLevels>
                                            <FLevel>
                                                <FLevelLabel>Entry Price</FLevelLabel>
                                                <FLevelValue>{fmtPrice(featured.entry)}</FLevelValue>
                                            </FLevel>
                                            <FLevel $bg="rgba(239,68,68,.03)" $bc="rgba(239,68,68,.1)">
                                                <FLevelLabel>Stop Loss</FLevelLabel>
                                                <FLevelValue $c="#ef4444">{fmtPrice(featured.sl)}</FLevelValue>
                                            </FLevel>
                                            <FLevel $bg="rgba(16,185,129,.03)" $bc="rgba(16,185,129,.1)">
                                                <FLevelLabel>Target (TP3)</FLevelLabel>
                                                <FLevelValue $c="#10b981">{fmtPrice(featured.target)}</FLevelValue>
                                            </FLevel>
                                            <FLevel>
                                                <FLevelLabel>Timeframe</FLevelLabel>
                                                <FLevelValue>{featured.days}D Swing</FLevelValue>
                                            </FLevel>
                                        </FeaturedLevels>

                                        <FeaturedTPs>
                                            <FTP><FTPLabel>TP1 (3%)</FTPLabel><FTPValue>{fmtPrice(featured.tp1)}</FTPValue></FTP>
                                            <FTP><FTPLabel>TP2 (8%)</FTPLabel><FTPValue>{fmtPrice(featured.tp2)}</FTPValue></FTP>
                                            <FTP><FTPLabel>TP3 (12%)</FTPLabel><FTPValue>{fmtPrice(featured.tp3)}</FTPValue></FTP>
                                        </FeaturedTPs>

                                        {/* Intelligence tags */}
                                        <IntelRow style={{marginBottom:'.5rem'}}>
                                            <ConvictionTag $level={featured.conviction}>
                                                {featured.conviction === 'strong' ? 'Strong Setup' : featured.conviction === 'moderate' ? 'Moderate Setup' : 'Low Conviction'}
                                            </ConvictionTag>
                                            <SentimentTag $sentiment={featured.sentimentTag}>{featured.sentimentTag}</SentimentTag>
                                            <IntelTag $bg="rgba(139,92,246,.08)" $c="#a78bfa" $bc="rgba(139,92,246,.15)">{featured.regime}</IntelTag>
                                            {featured.factors.slice(0, 3).map((f, j) => (
                                                <IntelTag key={j}>{f}</IntelTag>
                                            ))}
                                        </IntelRow>

                                        {/* AI Reasoning */}
                                        <AIReasoning>
                                            <AIReasonIcon><BarChart2 size={14}/></AIReasonIcon>
                                            <AIReasonText>{featured.reasoning}</AIReasonText>
                                        </AIReasoning>

                                        {/* Progress bar */}
                                        {featured.currentPrice && featured.currentPrice !== featured.entry && (
                                            <FeaturedProgress>
                                                <ProgressTrack>
                                                    <ProgressFill $pct={progressPct(featured)} $pos={featured.movePct >= 0}>
                                                        <ProgressDot $pos={featured.movePct >= 0}/>
                                                    </ProgressFill>
                                                </ProgressTrack>
                                                <ProgressLabels>
                                                    <span>SL {fmtPrice(featured.sl)}</span>
                                                    <span>Entry {fmtPrice(featured.entry)}</span>
                                                    <span>TP3 {fmtPrice(featured.target)}</span>
                                                </ProgressLabels>
                                                <ProgressPnl $pos={featured.movePct >= 0}>
                                                    Live: {fmtPrice(featured.currentPrice)} ({featured.movePct >= 0 ? '+' : ''}{featured.movePct.toFixed(2)}%)
                                                </ProgressPnl>
                                            </FeaturedProgress>
                                        )}

                                        {/* CTAs */}
                                        <FeaturedActions>
                                            <PrimaryBtn onClick={(e) => { e.stopPropagation(); setCopyModal(featured); }}>
                                                <Copy size={15}/> Trade This Setup
                                            </PrimaryBtn>
                                            <SecondaryBtn onClick={(e) => { e.stopPropagation(); navigate(`/signal/${featured.id}`); }}>
                                                <Eye size={15}/> View Full Analysis
                                            </SecondaryBtn>
                                        </FeaturedActions>
                                    </FeaturedInner>
                                </FeaturedCard>
                            </FeaturedSection>
                        )}

                        {/* ═══ TRUST STRIP ═══ */}
                        {filter !== 'archive' && (
                            <TrustStrip>
                                Every signal is tracked. Every result is visible. Nothing is edited.
                            </TrustStrip>
                        )}

                        {/* ═══ SECTION 5: SIGNAL GROUPS ═══ */}

                        {/* High Confidence Group */}
                        {filter !== 'closed' && filter !== 'archive' && highConf.filter(s => s.id !== featured?.id).length > 0 && (
                            <GroupSection>
                                <GroupHeader>
                                    <GroupTitle><Zap size={14} color="#f59e0b"/> High Confidence Setups</GroupTitle>
                                    <GroupCount>{highConf.filter(s => s.id !== featured?.id).length}</GroupCount>
                                </GroupHeader>
                                {highConf.filter(s => s.id !== featured?.id).map((s, i) => (
                                    <SignalCard key={s.id} s={s} i={i} navigate={navigate} setCopyModal={setCopyModal} isPremium={isPremium} />
                                ))}
                            </GroupSection>
                        )}

                        {/* Active / Recently Closed / All / Archive */}
                        {filter === 'archive' ? (
                            <>
                                <ArchiveHeader>
                                    <Clock size={14}/> Signal Archive — {archivedClosed.length} closed signals
                                </ArchiveHeader>
                                {Object.entries(archiveByDate).map(([date, sigs]) => (
                                    <React.Fragment key={date}>
                                        <DateSep>{date}</DateSep>
                                        {sigs.map((s, i) => (
                                            <SignalCard key={s.id} s={s} i={i} navigate={navigate} setCopyModal={setCopyModal} isPremium={isPremium} />
                                        ))}
                                    </React.Fragment>
                                ))}
                                {archivedClosed.length === 0 && <Empty>No archived signals yet.</Empty>}
                            </>
                        ) : (
                            <GroupSection>
                                {filter === 'all' && filtered.length > 0 && (
                                    <GroupHeader>
                                        <GroupTitle>
                                            <Activity size={14} color="#0ea5e9"/>
                                            {regularActive.filter(s => s.id !== featured?.id).length > 0 ? 'Active Signals' : 'Recently Closed'}
                                        </GroupTitle>
                                        <GroupCount>{filtered.filter(s => filter !== 'high' || s.conf < 80).length}</GroupCount>
                                    </GroupHeader>
                                )}
                                {filtered.filter(s => {
                                    // In "all" view, skip high conf ones already shown above
                                    if (filter === 'all' && s.conf >= 80 && s.status !== 'closed' && s.id !== featured?.id) return false;
                                    return true;
                                }).map((s, i) => (
                                    <SignalCard key={s.id} s={s} i={i} navigate={navigate} setCopyModal={setCopyModal} isPremium={isPremium} />
                                ))}
                                {filtered.length === 0 && <Empty>No signals match this filter. Check back soon.</Empty>}
                            </GroupSection>
                        )}

                        {/* Recently Closed (in "all" view only, shown below active) */}
                        {filter === 'all' && recentClosed.length > 0 && regularActive.filter(s => s.id !== featured?.id).length > 0 && (
                            <GroupSection>
                                <GroupHeader>
                                    <GroupTitle><CheckCircle size={14} color="#64748b"/> Recently Closed</GroupTitle>
                                    <GroupCount>{recentClosed.length}</GroupCount>
                                </GroupHeader>
                                {recentClosed.map((s, i) => (
                                    <SignalCard key={s.id} s={s} i={i} navigate={navigate} setCopyModal={setCopyModal} isPremium={isPremium} />
                                ))}
                            </GroupSection>
                        )}
                    </MainCol>

                    {/* ═══ SECTION 6: SIDEBAR — LIVE TRADE OUTCOMES ═══ */}
                    <SideCol>
                        <SidebarCard>
                            <SideTitle><Activity size={14} color="#00adef"/> Live Trade Outcomes</SideTitle>
                            <SideSub>Wins and losses — fully transparent</SideSub>
                            <OutcomeList>
                                {outcomes.map((o, i) => (
                                    <OutcomeItem key={i} $c={o.color} onClick={() => o.id && navigate(`/signal/${o.id}`)}>
                                        <OutcomeIcon>{o.icon}</OutcomeIcon>
                                        <OutcomeText>
                                            <OutcomeMain>{o.text}</OutcomeMain>
                                            <OutcomeTime>{o.time}</OutcomeTime>
                                        </OutcomeText>
                                    </OutcomeItem>
                                ))}
                                {!outcomes.length && <Empty style={{padding:'1rem'}}>Waiting for trade outcomes...</Empty>}
                            </OutcomeList>

                            <SideStats>
                                <SideStat><SideStatVal $c="#00adef">{totalTracked}</SideStatVal><SideStatLabel>Tracked</SideStatLabel></SideStat>
                                <SideStat><SideStatVal $c="#10b981">{winRate !== null ? `${winRate}%` : '--'}</SideStatVal><SideStatLabel>Win Rate</SideStatLabel></SideStat>
                                <SideStat><SideStatVal $c="#f59e0b">{active.length}</SideStatVal><SideStatLabel>Active</SideStatLabel></SideStat>
                            </SideStats>

                            {!isPremium && (
                                <UpgradeBanner>
                                    <UpgradeTitle><Lock size={13}/> Unlock Real-Time Signals</UpgradeTitle>
                                    <UpgradeDesc>Free users see delayed signals. Get instant access + alerts.</UpgradeDesc>
                                    <UpgradeBtn onClick={() => navigate('/pricing')}><Crown size={13}/> Upgrade to Premium</UpgradeBtn>
                                </UpgradeBanner>
                            )}
                        </SidebarCard>
                    </SideCol>
                </Grid>
            </Container>

            {/* Copy Setup Modal */}
            {copyModal && (
                <ModalOverlay onClick={() => setCopyModal(null)}>
                    <ModalCard onClick={e => e.stopPropagation()}>
                        <ModalClose onClick={() => setCopyModal(null)}><XCircle size={18}/></ModalClose>
                        <ModalTitle>Trade This Setup</ModalTitle>
                        <ModalSub>{copyModal.symbol} {copyModal.long ? 'LONG' : 'SHORT'} — {copyModal.conf}% confidence</ModalSub>

                        <ModalOption onClick={executeCopyToPaper}>
                            <ModalOptIcon><Activity size={18}/></ModalOptIcon>
                            <ModalOptText>
                                <ModalOptTitle>Paper Trade</ModalOptTitle>
                                <ModalOptDesc>Execute with virtual $100K — no risk</ModalOptDesc>
                            </ModalOptText>
                            <ArrowUpRight size={16} color="#10b981"/>
                        </ModalOption>

                        <ModalOption $disabled>
                            <ModalOptIcon $disabled><DollarSign size={18}/></ModalOptIcon>
                            <ModalOptText>
                                <ModalOptTitle>Real Portfolio</ModalOptTitle>
                                <ModalOptDesc>Execute with connected brokerage</ModalOptDesc>
                            </ModalOptText>
                            <ComingSoonBadge>COMING SOON</ComingSoonBadge>
                        </ModalOption>
                    </ModalCard>
                </ModalOverlay>
            )}
        </Page>
    );
};

// ═══════════════════════════════════════════════════════════
// SIGNAL CARD COMPONENT (reusable)
// ═══════════════════════════════════════════════════════════
const SignalCard = ({ s, i, navigate, setCopyModal, isPremium }) => {
    const posMove = s.movePct >= 0;
    const pctProgress = progressPct(s);

    return (
        <Card
            $prox={s.prox}
            $result={s.isWin === true ? 'win' : s.isWin === false ? 'loss' : null}
            $delay={`${i * .03}s`}
            onClick={() => navigate(`/signal/${s.id}`)}
            style={{marginBottom:'.6rem'}}
        >
            <CardInner>
                {/* Top row: Symbol + Direction | Confidence + Status */}
                <CardTop>
                    <CardSymbolGroup>
                        <CardSymbol>{s.symbol}</CardSymbol>
                        <CardAsset $crypto={s.crypto}>{s.crypto ? 'Crypto' : 'Stock'}</CardAsset>
                        <CardDir $long={s.long}>
                            {s.long ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                            {s.long ? 'LONG' : 'SHORT'}
                        </CardDir>
                        <RiskBadge $r={s.riskLevel}>{s.riskLevel}</RiskBadge>
                    </CardSymbolGroup>
                    <CardRightGroup>
                        <CardConfidence $val={s.conf}>{s.conf}%</CardConfidence>
                        {s.status === 'closed' ? (
                            <CardStatus $type={s.isWin ? 'win' : 'loss'}>
                                {s.isWin ? 'WIN' : 'LOSS'}
                            </CardStatus>
                        ) : s.urgency === 'urgent' || s.urgency === 'soon' ? (
                            <CardStatus $type="expiring">EXPIRING</CardStatus>
                        ) : (
                            <CardStatus $type="active">ACTIVE</CardStatus>
                        )}
                        <TradeId>#{s.tradeNum}</TradeId>
                    </CardRightGroup>
                </CardTop>

                {/* Intelligence tags */}
                {s.status !== 'closed' && (
                    <>
                        <IntelRow>
                            <ConvictionTag $level={s.conviction}>
                                {s.conviction === 'strong' ? 'Strong Setup' : s.conviction === 'moderate' ? 'Moderate Setup' : s.conviction === 'low' ? 'Low Conviction' : 'No Edge'}
                            </ConvictionTag>
                            <SentimentTag $sentiment={s.sentimentTag}>{s.sentimentTag}</SentimentTag>
                            <IntelTag $bg="rgba(139,92,246,.08)" $c="#a78bfa" $bc="rgba(139,92,246,.15)">{s.regime}</IntelTag>
                            {s.factors.slice(0, 2).map((f, j) => (
                                <IntelTag key={j}>{f}</IntelTag>
                            ))}
                        </IntelRow>
                        <AIReasonLine>{s.reasoning}</AIReasonLine>
                    </>
                )}

                {/* Levels grid */}
                <CardLevels>
                    <CLevel>
                        <CLevelLabel>Entry</CLevelLabel>
                        <CLevelValue>{fmtPrice(s.entry)}</CLevelValue>
                    </CLevel>
                    <CLevel>
                        <CLevelLabel>Stop Loss</CLevelLabel>
                        <CLevelValue $c="#ef4444">{fmtPrice(s.sl)}</CLevelValue>
                    </CLevel>
                    <CLevel>
                        <CLevelLabel>R:R</CLevelLabel>
                        <CLevelValue $c="#00adef">1:{s.rr}</CLevelValue>
                    </CLevel>
                    <CLevel>
                        <CLevelLabel>Target</CLevelLabel>
                        <CLevelValue $c="#10b981">{fmtPrice(s.target)}</CLevelValue>
                    </CLevel>
                </CardLevels>

                {/* TP Row */}
                <CardTPRow>
                    <CardTP><CardTPLabel>TP1</CardTPLabel><CardTPValue>{fmtPrice(s.tp1)}</CardTPValue></CardTP>
                    <CardTP><CardTPLabel>TP2</CardTPLabel><CardTPValue>{fmtPrice(s.tp2)}</CardTPValue></CardTP>
                    <CardTP><CardTPLabel>TP3</CardTPLabel><CardTPValue>{fmtPrice(s.tp3)}</CardTPValue></CardTP>
                </CardTPRow>

                {/* Active: Progress bar + PnL */}
                {s.status !== 'closed' && s.currentPrice && s.currentPrice !== s.entry && (
                    <>
                        <CardProgress>
                            <CardProgressTrack>
                                <CardProgressFill $pct={pctProgress} $pos={posMove}>
                                    <CardProgressDot $pos={posMove}/>
                                </CardProgressFill>
                            </CardProgressTrack>
                            <CardProgressLabels>
                                <span>SL</span>
                                <span>Entry</span>
                                <span>TP3</span>
                            </CardProgressLabels>
                        </CardProgress>
                        <CardPnl $pos={posMove}>
                            <CardPnlLabel>If followed:</CardPnlLabel>
                            <CardLivePrice $pos={posMove}>{fmtPrice(s.currentPrice)}</CardLivePrice>
                            <CardPnlValue $pos={posMove}>{s.movePct >= 0 ? '+' : ''}{s.movePct.toFixed(2)}%</CardPnlValue>
                        </CardPnl>
                    </>
                )}

                {/* Closed: Result box */}
                {s.status === 'closed' && (
                    <CardResult $win={s.isWin}>
                        <CardResultLabel $win={s.isWin}>
                            {s.isWin ? <CheckCircle size={15}/> : <XCircle size={15}/>}
                            {s.resultText}
                        </CardResultLabel>
                        <CardResultPct $win={s.isWin}>
                            {s.movePct >= 0 ? '+' : ''}{s.movePct.toFixed(1)}%
                        </CardResultPct>
                    </CardResult>
                )}

                {/* Bottom: Time info + Actions */}
                <CardBottom>
                    <CardMeta>
                        <CardMetaItem><Clock size={10}/> {timeAgo(s.createdAt)}</CardMetaItem>
                        {s.status !== 'closed' && <CardMetaItem><Timer size={10}/> {timeLeft(s.expiresAt)}</CardMetaItem>}
                    </CardMeta>
                    {s.status !== 'closed' && (
                        <CardActions>
                            <CardBtn $primary onClick={(e) => { e.stopPropagation(); setCopyModal(s); }}>
                                <Copy size={11}/> Trade
                            </CardBtn>
                            <CardBtn onClick={(e) => { e.stopPropagation(); navigate(`/signal/${s.id}`); }}>
                                <ChevronRight size={11}/> Details
                            </CardBtn>
                        </CardActions>
                    )}
                </CardBottom>
            </CardInner>
        </Card>
    );
};

export default SignalsPage;
