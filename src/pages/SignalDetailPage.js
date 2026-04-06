// client/src/pages/SignalDetailPage.js — Trade Decision Page (Redesigned)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import {
    ArrowUpRight, ArrowDownRight, Clock, Target, Shield,
    CheckCircle, XCircle, ArrowLeft, Timer, Zap, Lock, Crown,
    BarChart3, Activity, Brain, AlertTriangle, Copy, Eye,
    TrendingUp, TrendingDown, DollarSign, ChevronRight, Users
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const CRYPTO_SYMBOLS = new Set(['BTC','ETH','SOL','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','ATOM','UNI','LTC','NEAR','APT','BNB','SHIB']);

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const glowPulse = keyframes`0%,100%{box-shadow:0 0 20px rgba(16,185,129,.05)}50%{box-shadow:0 0 40px rgba(16,185,129,.12)}`;

const isCrypto = (sym) => { const base = sym?.split(':')[0]?.replace(/USDT|USD/i,'') || ''; return CRYPTO_SYMBOLS.has(base.toUpperCase()); };
const fmtPrice = (p) => { if (!p && p !== 0) return '--'; if (Math.abs(p) >= 1000) return `$${p.toLocaleString(undefined,{maximumFractionDigits:2})}`; if (Math.abs(p) >= 1) return `$${p.toFixed(2)}`; if (Math.abs(p) >= 0.01) return `$${p.toFixed(4)}`; return `$${p.toFixed(8)}`; };
const timeAgo = (d) => { if (!d) return '--'; const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; };
const timeLeft = (d) => { if (!d) return '--'; const ms = new Date(d) - Date.now(); if (ms <= 0) return 'Expired'; const h = Math.floor(ms / 3600000); if (h < 1) return `${Math.floor(ms/60000)}m left`; if (h < 24) return `${h}h left`; return `${Math.floor(h / 24)}d left`; };

// ═══════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════

const Page = styled.div`min-height:100vh;padding-top:80px;color:#e0e6ed;`;
const Container = styled.div`max-width:860px;margin:0 auto;padding:2rem;@media(max-width:768px){padding:1rem;}`;

const BackBtn = styled.button`
    display:inline-flex;align-items:center;gap:.35rem;padding:.4rem .85rem;
    background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
    border-radius:8px;color:#64748b;font-size:.8rem;font-weight:600;
    cursor:pointer;transition:all .2s;margin-bottom:1.25rem;
    &:hover{color:#e0e6ed;border-color:rgba(255,255,255,.15);}
`;

// ─── Section 1: Trade Decision Header ────────────────────
const DecisionHeader = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(255,255,255,.08);
    border-radius:16px;padding:1.75rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out;
`;
const HeaderTop = styled.div`display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;`;
const HeaderLeft = styled.div`flex:1;min-width:200px;`;
const SymbolRow = styled.div`display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;`;
const Symbol = styled.h1`font-size:2rem;font-weight:900;color:#fff;margin:0;cursor:pointer;&:hover{color:#00adef;}`;
const DirBadge = styled.div`
    display:inline-flex;align-items:center;gap:.3rem;
    padding:.4rem 1rem;border-radius:8px;font-size:.95rem;font-weight:800;
    background:${p=>p.$long?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
    border:1px solid ${p=>p.$long?'rgba(16,185,129,.25)':'rgba(239,68,68,.25)'};
`;
const SetupLabel = styled.div`
    font-size:.92rem;font-weight:700;color:#c8d0da;margin-bottom:.6rem;
`;
const AISummary = styled.div`
    font-size:.88rem;color:#94a3b8;line-height:1.6;max-width:540px;
`;
const HeaderRight = styled.div`text-align:right;`;
const ConfBig = styled.div`
    font-size:2.4rem;font-weight:900;line-height:1;
    color:${p=>p.$val>=75?'#10b981':p.$val>=60?'#f59e0b':'#94a3b8'};
    text-shadow:0 0 30px ${p=>p.$val>=75?'rgba(16,185,129,.25)':'rgba(245,158,11,.15)'};
`;
const ConfLabel = styled.div`font-size:.65rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-top:.15rem;`;
const MetaRow = styled.div`
    display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-top:.85rem;
    padding-top:.75rem;border-top:1px solid rgba(255,255,255,.04);
    font-size:.78rem;color:#475569;
`;
const MetaItem = styled.span`display:flex;align-items:center;gap:.25rem;`;
const StatusTag = styled.span`
    padding:.2rem .55rem;border-radius:5px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.3px;
    ${p=>p.$s==='active'&&'background:rgba(0,173,237,.08);color:#0ea5e9;border:1px solid rgba(0,173,237,.15);'}
    ${p=>p.$s==='new'&&'background:rgba(16,185,129,.1);color:#10b981;border:1px solid rgba(16,185,129,.2);'}
    ${p=>p.$s==='closed'&&'background:rgba(100,116,139,.08);color:#94a3b8;border:1px solid rgba(100,116,139,.15);'}
`;

// ─── Section 2: Quick Trade Overview ─────────────────────
const OverviewCard = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(255,255,255,.08);
    border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out .1s backwards;
`;
const OverviewTitle = styled.h2`font-size:.88rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.4rem;margin:0 0 1rem;`;
const OverviewGrid = styled.div`
    display:grid;grid-template-columns:repeat(5,1fr);gap:.6rem;
    @media(max-width:700px){grid-template-columns:repeat(3,1fr);}
    @media(max-width:450px){grid-template-columns:repeat(2,1fr);}
`;
const OvBox = styled.div`
    padding:.7rem;border-radius:10px;text-align:center;
    background:${p=>p.$bg||'rgba(255,255,255,.02)'};
    border:1px solid ${p=>p.$bc||'rgba(255,255,255,.04)'};
`;
const OvLabel = styled.div`font-size:.55rem;color:#475569;text-transform:uppercase;letter-spacing:.6px;margin-bottom:.25rem;`;
const OvValue = styled.div`font-size:1.15rem;font-weight:800;color:${p=>p.$c||'#e0e6ed'};`;

const TPRow = styled.div`
    display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:.75rem;
`;
const TPBox = styled.div`
    text-align:center;padding:.6rem;border-radius:8px;
    background:rgba(16,185,129,.03);border:1px solid rgba(16,185,129,.08);
`;
const TPLabel = styled.div`font-size:.52rem;color:#10b981;font-weight:700;letter-spacing:.4px;`;
const TPValue = styled.div`font-size:.95rem;font-weight:800;color:#10b981;`;

// ─── CTA Section ─────────────────────────────────────────
const CTARow = styled.div`
    display:flex;gap:.6rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out .15s backwards;
    @media(max-width:500px){flex-direction:column;}
`;
const PrimaryBtn = styled.button`
    flex:1;padding:.8rem 1.5rem;border:none;border-radius:12px;font-size:.92rem;font-weight:700;
    background:linear-gradient(135deg,#10b981,#059669);color:#fff;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:.45rem;
    transition:all .25s;
    &:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(16,185,129,.3);}
`;
const SecondaryBtn = styled.button`
    flex:1;padding:.8rem 1.5rem;border-radius:12px;font-size:.92rem;font-weight:700;
    background:rgba(0,173,237,.06);border:1px solid rgba(0,173,237,.2);color:#00adef;cursor:pointer;
    display:flex;align-items:center;justify-content:center;gap:.45rem;
    transition:all .25s;
    &:hover{background:rgba(0,173,237,.12);transform:translateY(-2px);}
`;

// ─── Section 3: Visual Trade Map ─────────────────────────
const TradeMap = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(255,255,255,.08);
    border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out .2s backwards;
`;
const TradeMapTitle = styled.h2`font-size:.88rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.4rem;margin:0 0 1rem;`;
const MapContainer = styled.div`position:relative;padding:2.5rem 0 1.5rem;`;
const MapTrack = styled.div`
    width:100%;height:8px;background:rgba(255,255,255,.04);border-radius:4px;
    position:relative;overflow:visible;
`;
const MapSegmentLoss = styled.div`
    position:absolute;left:0;height:100%;border-radius:4px 0 0 4px;
    width:${p=>p.$w}%;background:linear-gradient(90deg,rgba(239,68,68,.3),rgba(239,68,68,.1));
`;
const MapSegmentWin = styled.div`
    position:absolute;right:0;height:100%;border-radius:0 4px 4px 0;
    width:${p=>p.$w}%;background:linear-gradient(90deg,rgba(16,185,129,.1),rgba(16,185,129,.3));
`;
const MapMarker = styled.div`
    position:absolute;top:-24px;transform:translateX(-50%);
    display:flex;flex-direction:column;align-items:center;
    font-size:.6rem;font-weight:700;color:${p=>p.$c||'#475569'};
    letter-spacing:.3px;white-space:nowrap;
    &::after{
        content:'';display:block;width:2px;height:${p=>p.$h||'14px'};
        background:${p=>p.$c||'rgba(255,255,255,.1)'};margin-top:2px;border-radius:1px;
    }
`;
const MapPrice = styled.div`
    position:absolute;bottom:-22px;transform:translateX(-50%);
    font-size:.68rem;font-weight:600;color:${p=>p.$c||'#64748b'};white-space:nowrap;
`;
const MapLiveDot = styled.div`
    position:absolute;top:-6px;transform:translateX(-50%);
    width:20px;height:20px;border-radius:50%;
    background:${p=>p.$pos?'#10b981':'#ef4444'};
    border:3px solid rgba(12,16,32,.95);
    box-shadow:0 0 12px ${p=>p.$pos?'rgba(16,185,129,.5)':'rgba(239,68,68,.5)'};
    z-index:2;
`;
const MapLiveLabel = styled.div`
    position:absolute;top:-32px;transform:translateX(-50%);
    font-size:.62rem;font-weight:800;padding:.15rem .4rem;border-radius:4px;
    background:${p=>p.$pos?'rgba(16,185,129,.15)':'rgba(239,68,68,.15)'};
    color:${p=>p.$pos?'#10b981':'#ef4444'};
    white-space:nowrap;z-index:3;
`;
const MapRRLabel = styled.div`
    text-align:center;margin-top:1.5rem;font-size:.75rem;color:#64748b;
`;
const MapRRValue = styled.span`font-weight:800;color:#00adef;`;

// ─── Section 4: Live Trade Status ────────────────────────
const LiveStatus = styled.div`
    background:${p=>p.$pos?'rgba(16,185,129,.04)':'rgba(239,68,68,.04)'};
    border:1px solid ${p=>p.$pos?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};
    border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out .25s backwards;
    ${p=>p.$glow&&`animation:${fadeIn} .4s ease-out .25s backwards;`}
`;
const LiveTitle = styled.h2`font-size:.88rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.4rem;margin:0 0 1rem;`;
const LiveGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;@media(max-width:600px){grid-template-columns:repeat(2,1fr);}`;
const LiveBox = styled.div`text-align:center;padding:.6rem;`;
const LiveLabel = styled.div`font-size:.55rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.2rem;`;
const LiveValue = styled.div`font-size:1.15rem;font-weight:800;color:${p=>p.$c||'#e0e6ed'};`;
const LiveCopy = styled.div`
    margin-top:.75rem;padding:.6rem .85rem;border-radius:8px;
    background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);
    font-size:.82rem;color:#94a3b8;line-height:1.5;
`;

// ─── Result Card (closed) ────────────────────────────────
const ResultCard = styled.div`
    background:${p=>p.$win?'rgba(16,185,129,.06)':'rgba(239,68,68,.06)'};
    border:1.5px solid ${p=>p.$win?'rgba(16,185,129,.2)':'rgba(239,68,68,.2)'};
    border-radius:16px;padding:2rem;text-align:center;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out .2s backwards;
`;
const ResultIcon = styled.div`font-size:2.8rem;margin-bottom:.5rem;`;
const ResultTitle = styled.div`font-size:1.3rem;font-weight:800;color:${p=>p.$win?'#10b981':'#ef4444'};`;
const ResultPct = styled.div`
    font-size:2.5rem;font-weight:900;margin:.4rem 0;
    color:${p=>p.$win?'#10b981':'#ef4444'};
    text-shadow:0 0 30px ${p=>p.$win?'rgba(16,185,129,.3)':'rgba(239,68,68,.2)'};
`;
const ResultSub = styled.div`font-size:.85rem;color:#64748b;`;

// ─── Card (generic section) ──────────────────────────────
const Card = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(255,255,255,.08);
    border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out ${p=>p.$d||'0s'} backwards;
`;
const CardTitle = styled.h2`font-size:.88rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.4rem;margin:0 0 1rem;`;

// ─── Why This Trade Works ────────────────────────────────
const ReasonGrid = styled.div`display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;@media(max-width:500px){grid-template-columns:1fr;}`;
const ReasonBox = styled.div`
    padding:.85rem;border-radius:10px;
    background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);
`;
const ReasonLabel = styled.div`font-size:.6rem;color:#475569;text-transform:uppercase;letter-spacing:.6px;font-weight:700;margin-bottom:.3rem;`;
const ReasonText = styled.div`font-size:.85rem;color:#c8d0da;line-height:1.5;`;

// ─── Invalidation & Risks ────────────────────────────────
const RiskItem = styled.div`
    display:flex;align-items:flex-start;gap:.5rem;padding:.6rem .75rem;
    border-radius:8px;background:rgba(245,158,11,.02);
    border-left:3px solid rgba(245,158,11,.3);
    margin-bottom:.4rem;
`;
const RiskIcon = styled.div`color:#f59e0b;flex-shrink:0;margin-top:.1rem;`;
const RiskText = styled.div`font-size:.82rem;color:#94a3b8;line-height:1.5;`;

// ─── Technical Analysis ──────────────────────────────────
const IndGrid = styled.div`display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem;@media(max-width:500px){grid-template-columns:1fr;}`;
const IndBox = styled.div`
    display:flex;align-items:center;justify-content:space-between;
    background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);
    border-radius:8px;padding:.6rem .8rem;
`;
const IndName = styled.span`font-size:.82rem;color:#94a3b8;`;
const IndVal = styled.span`font-size:.82rem;color:#e0e6ed;font-weight:600;`;
const IndSignal = styled.span`
    padding:.15rem .4rem;border-radius:4px;font-size:.65rem;font-weight:700;
    background:${p=>p.$s==='BUY'?'rgba(16,185,129,.1)':p.$s==='SELL'?'rgba(239,68,68,.1)':'rgba(245,158,11,.1)'};
    color:${p=>p.$s==='BUY'?'#10b981':p.$s==='SELL'?'#ef4444':'#f59e0b'};
`;

// ─── Social Proof ────────────────────────────────────────
const ProofStrip = styled.div`
    display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;
    padding:.65rem;margin-bottom:1.25rem;
    font-size:.75rem;color:#475569;
    border-top:1px solid rgba(255,255,255,.03);
    border-bottom:1px solid rgba(255,255,255,.03);
    animation:${fadeIn} .4s ease-out .35s backwards;
`;
const ProofItem = styled.span`display:flex;align-items:center;gap:.3rem;`;
const ProofVal = styled.span`font-weight:700;color:#94a3b8;`;

// ─── Trust Line ──────────────────────────────────────────
const TrustLine = styled.div`
    text-align:center;padding:.6rem;margin-bottom:1rem;
    font-size:.72rem;color:#475569;font-weight:500;letter-spacing:.02em;
`;

// ─── Upgrade ─────────────────────────────────────────────
const UpgradeCard = styled.div`
    background:linear-gradient(135deg,rgba(0,173,237,.05),rgba(139,92,246,.05));
    border:1px solid rgba(0,173,237,.12);border-radius:14px;padding:1.25rem;
    text-align:center;margin-bottom:1.25rem;
`;
const UpgradeBtn = styled.button`
    padding:.65rem 1.8rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;border-radius:10px;color:#fff;font-weight:700;font-size:.9rem;
    cursor:pointer;display:inline-flex;align-items:center;gap:.35rem;
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
    padding:.85rem 1rem;border-radius:10px;
    border:1px solid ${p=>p.$disabled?'rgba(100,116,139,.1)':'rgba(16,185,129,.2)'};
    background:${p=>p.$disabled?'rgba(100,116,139,.04)':'rgba(16,185,129,.06)'};
    color:${p=>p.$disabled?'#475569':'#e2e8f0'};
    cursor:${p=>p.$disabled?'not-allowed':'pointer'};
    opacity:${p=>p.$disabled?'.5':'1'};
    transition:all .2s;margin-bottom:.5rem;text-align:left;
    ${p=>!p.$disabled&&'&:hover{border-color:rgba(16,185,129,.4);background:rgba(16,185,129,.1);transform:translateY(-1px);}'}
`;
const ModalOptIcon = styled.div`
    width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;
    background:${p=>p.$disabled?'rgba(100,116,139,.08)':'rgba(16,185,129,.1)'};
    color:${p=>p.$disabled?'#475569':'#10b981'};flex-shrink:0;
`;
const ModalOptTitle = styled.div`font-size:.85rem;font-weight:700;`;
const ModalOptDesc = styled.div`font-size:.68rem;color:#64748b;margin-top:.1rem;`;
const ComingSoonBadge = styled.span`
    font-size:.55rem;font-weight:700;color:#f59e0b;background:rgba(245,158,11,.1);
    border:1px solid rgba(245,158,11,.2);padding:1px 6px;border-radius:4px;
`;

// Intelligence & Sentiment
const IntelSection = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(139,92,246,.12);
    border-radius:16px;padding:1.25rem;margin-bottom:1.25rem;
`;
const IntelTitle = styled.h2`font-size:.88rem;font-weight:700;color:#a78bfa;display:flex;align-items:center;gap:.4rem;margin:0 0 .75rem;`;
const IntelGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;@media(max-width:600px){grid-template-columns:repeat(2,1fr);}`;
const IntelCell = styled.div`padding:.6rem;border-radius:8px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04);text-align:center;`;
const IntelLabel = styled.div`font-size:.55rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.2rem;`;
const IntelValue = styled.div`font-size:.95rem;font-weight:700;color:${p => p.$c || '#e0e6ed'};`;
const IntelSub = styled.div`font-size:.58rem;color:#475569;margin-top:.1rem;`;
const IntelTag = styled.span`
    display:inline-flex;align-items:center;gap:.2rem;
    padding:.15rem .45rem;border-radius:4px;font-size:.6rem;font-weight:700;
    background:${p => p.$bg || 'rgba(100,116,139,.08)'};
    color:${p => p.$c || '#94a3b8'};
`;
const FactorChips = styled.div`display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.5rem;`;
const FactorChip = styled.span`
    padding:.15rem .45rem;border-radius:4px;font-size:.6rem;font-weight:600;
    background:rgba(0,173,237,.06);color:#0ea5e9;border:1px solid rgba(0,173,237,.12);
`;
const QualityRow = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;@media(max-width:500px){grid-template-columns:repeat(2,1fr);}`;
const QualityCell = styled.div`text-align:center;`;
const QualityLabel = styled.div`font-size:.55rem;color:#475569;text-transform:uppercase;letter-spacing:.3px;margin-bottom:.3rem;`;
const QualityBar = styled.div`width:100%;height:4px;background:rgba(255,255,255,.04);border-radius:2px;overflow:hidden;`;
const QualityFill = styled.div`height:100%;width:${p => p.$w || 0}%;border-radius:2px;background:${p => p.$w >= 70 ? '#10b981' : p.$w >= 45 ? '#f59e0b' : '#64748b'};`;
const QualityValue = styled.div`font-size:.7rem;font-weight:700;color:${p => p.$w >= 70 ? '#10b981' : p.$w >= 45 ? '#f59e0b' : '#64748b'};margin-top:.15rem;`;

const Loading = styled.div`text-align:center;padding:4rem;color:#475569;font-size:1rem;`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const SignalDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const { hasPlanAccess } = useSubscription();
    const isPremium = hasPlanAccess('starter');

    const [signal, setSignal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalStats, setGlobalStats] = useState(null);
    const [copyModal, setCopyModal] = useState(false);

    // Fetch global stats for social proof
    useEffect(() => {
        fetch(`${API_URL}/predictions/stats`).then(r => r.json()).then(d => { if (d.success) setGlobalStats(d); }).catch(() => {});
    }, []);

    const fetchSignal = useCallback(async () => {
        setLoading(true);

        if (api) {
            try {
                const res = await api.get(`/predictions/live/${id}`);
                const pred = res.data?.prediction || res.data;
                if (pred && pred.symbol) {
                    setSignal(buildDetail(pred));
                    setLoading(false);
                    return;
                }
            } catch (e) { /* try fallback */ }
        }

        // Fallback: fetch from recent
        const tryRecent = async (fetcher) => {
            try {
                const data = typeof fetcher === 'function' ? await fetcher() : null;
                const list = Array.isArray(data) ? data : [];
                const found = list.find(p => p._id === id);
                if (found) { setSignal(buildDetail(found)); setLoading(false); return true; }
            } catch (e) { /* silent */ }
            return false;
        };

        if (api) {
            const ok = await tryRecent(async () => (await api.get('/predictions/recent?limit=200')).data);
            if (ok) return;
        }

        await tryRecent(async () => {
            const res = await fetch(`${API_URL}/predictions/recent?limit=200`);
            return res.ok ? res.json() : [];
        });

        setLoading(false);
    }, [id, api]);

    useEffect(() => { fetchSignal(); }, [fetchSignal]);
    // Refresh price every 30s
    useEffect(() => { const iv = setInterval(() => fetchSignal(), 30000); return () => clearInterval(iv); }, [fetchSignal]);

    const buildDetail = (raw) => {
        const now = new Date();
        const created = new Date(raw.createdAt);
        const expires = new Date(raw.expiresAt);
        const ageHours = (now - created) / 3600000;
        const expired = now > expires;
        const days = Math.max(1, Math.round((expires - created) / 86400000));

        let status = 'active';
        if (ageHours < 12) status = 'new';
        if (expired || raw.result || raw.status === 'correct' || raw.status === 'incorrect') status = 'closed';

        const sym = raw.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || raw.symbol;
        const crypto = raw.assetType === 'crypto' || raw.assetType === 'dex' || isCrypto(raw.symbol);
        const long = raw.direction === 'UP';
        const conf = Math.min(95, Math.round(raw.confidence || raw.liveConfidence || 50)); // Cap at 95% for credibility
        const entry = raw.entryPrice || raw.entry || raw.livePrice || raw.currentPrice || raw.targetPrice;

        const sl = raw.stopLoss || raw.sl || (long ? entry * 0.95 : entry * 1.05);
        const tp1 = raw.takeProfit1 || raw.tp1 || (long ? entry * 1.03 : entry * 0.97);
        const tp2 = raw.takeProfit2 || raw.tp2 || (long ? entry * 1.08 : entry * 0.92);
        const tp3 = raw.takeProfit3 || raw.tp3 || (long ? entry * 1.12 : entry * 0.88);
        const target = tp3;

        const rr = Math.abs(entry - sl) > 0 ? (Math.abs(target - entry) / Math.abs(entry - sl)).toFixed(1) : '2.0';
        const currentPrice = raw.result
            ? (raw.resultPrice || raw.livePrice || raw.outcome?.actualPrice || entry)
            : (raw.livePrice || raw.currentPrice || raw.lastPrice || entry);
        const rawMovePct = raw.result
            ? ((currentPrice - entry) / entry * 100)
            : (raw.liveChangePercent ?? ((currentPrice - entry) / entry * 100));
        const movePct = long ? rawMovePct : -rawMovePct;

        const isWin = raw.result ? raw.result === 'win' : (status === 'closed' ? (raw.outcome?.wasCorrect ?? (long ? currentPrice > entry : currentPrice < entry)) : null);
        const resultText = raw.resultText || (status === 'closed' ? (isWin ? 'Target Hit' : 'SL Hit') : null);

        // Risk level
        const slPct = Math.abs((sl - entry) / entry * 100);
        const riskLevel = slPct > 5 ? 'HIGH' : slPct > 2.5 ? 'MED' : 'LOW';

        // Confidence label (never say "100%")
        const confLabel = conf >= 80 ? 'High Confidence' : conf >= 65 ? 'Moderate Confidence' : 'Low Confidence';

        // Setup type
        const setupType = long
            ? (conf >= 75 ? 'Bullish Continuation' : 'Bullish Setup')
            : (conf >= 75 ? 'Bearish Continuation' : 'Bearish Setup');

        // AI Summary (from analysis.message or generated)
        const analysis = raw.analysis || {};
        const aiSummary = analysis.message || (long
            ? `${conf >= 75 ? 'Strong bullish' : 'Bullish'} momentum detected with ${riskLevel.toLowerCase()} risk profile. ${conf >= 70 ? 'Multiple indicators align for an upside move' : 'Price action suggests potential upside'} with a ${rr}:1 reward-to-risk ratio.`
            : `${conf >= 75 ? 'Strong bearish' : 'Bearish'} pressure forming with ${riskLevel.toLowerCase()} risk profile. ${conf >= 70 ? 'Technical indicators confirm downside bias' : 'Price structure suggests potential downside'} targeting ${fmtPrice(target)}.`
        );

        // Indicators
        const indicators = raw.indicators || raw.formattedIndicators || {};
        const indArray = Object.entries(indicators).map(([name, data]) => ({
            name,
            value: typeof data === 'object' ? data.value : data,
            signal: typeof data === 'object' ? data.signal : 'NEUTRAL'
        }));

        // Structured "Why This Trade Works" reasons
        const whyReasons = [];
        const rsi = indArray.find(i => i.name === 'RSI');
        const macd = indArray.find(i => i.name === 'MACD');
        const trend = indArray.find(i => i.name === 'Trend');
        const vol = indArray.find(i => i.name === 'Volume');
        const boll = indArray.find(i => i.name === 'Bollinger');

        // Market Structure
        if (trend) {
            whyReasons.push({
                category: 'Market Structure',
                text: long
                    ? `${trend.value || 'Bullish'} trend confirmed — higher lows forming on key timeframes`
                    : `${trend.value || 'Bearish'} trend confirmed — lower highs forming with weakening structure`
            });
        } else {
            whyReasons.push({
                category: 'Market Structure',
                text: long ? 'Price holding above key support levels' : 'Price rejecting from resistance zone'
            });
        }

        // Momentum
        if (macd) {
            whyReasons.push({
                category: 'Momentum',
                text: macd.signal === 'BUY'
                    ? `MACD bullish crossover (${typeof macd.value === 'number' ? macd.value.toFixed(2) : macd.value}) — momentum accelerating`
                    : macd.signal === 'SELL'
                    ? `MACD bearish crossover (${typeof macd.value === 'number' ? macd.value.toFixed(2) : macd.value}) — selling pressure increasing`
                    : `MACD at ${typeof macd.value === 'number' ? macd.value.toFixed(2) : macd.value} — momentum building`
            });
        }

        // Volume
        if (vol) {
            whyReasons.push({
                category: 'Volume',
                text: vol.value === 'High'
                    ? 'High volume confirms directional conviction'
                    : vol.value === 'Above Average'
                    ? 'Above-average volume supporting the move'
                    : 'Volume at average levels — watching for confirmation'
            });
        }

        // Pattern / RSI
        if (rsi) {
            const rsiVal = typeof rsi.value === 'number' ? rsi.value : parseFloat(rsi.value);
            whyReasons.push({
                category: 'Technical Pattern',
                text: rsiVal < 35
                    ? `RSI oversold at ${rsiVal.toFixed(0)} — reversal conditions present`
                    : rsiVal > 65
                    ? `RSI elevated at ${rsiVal.toFixed(0)} — strong momentum but watch for exhaustion`
                    : `RSI at ${rsiVal.toFixed(0)} — room for ${long ? 'upside continuation' : 'further downside'}`
            });
        }

        // Risk/Reward
        if (parseFloat(rr) >= 2) {
            whyReasons.push({
                category: 'Risk/Reward',
                text: `Favorable 1:${rr} risk-to-reward ratio — potential gain significantly outweighs risk`
            });
        }

        // Invalidation & Risks
        const risks = [];
        risks.push({
            text: `If price breaks ${long ? 'below' : 'above'} ${fmtPrice(sl)}, this setup is invalidated. Exit immediately.`,
            severity: 'high'
        });
        if (boll) {
            risks.push({
                text: long
                    ? `Watch for rejection near ${fmtPrice(tp1)} — Bollinger band resistance may cause a pullback`
                    : `Watch for bounce near ${fmtPrice(tp1)} — Bollinger band support may trigger buying`,
                severity: 'medium'
            });
        }
        risks.push({
            text: 'Low volume during the move would weaken this signal. Confirmation volume is important.',
            severity: 'medium'
        });
        if (days <= 3) {
            risks.push({ text: 'Short timeframe trade — requires quick execution and active monitoring.', severity: 'medium' });
        }
        risks.push({
            text: `Broader market reversal or unexpected news could invalidate technical analysis.`,
            severity: 'low'
        });

        // Distances for live status
        const distToTP = Math.abs((target - currentPrice) / currentPrice * 100);
        const distToSL = Math.abs((currentPrice - sl) / currentPrice * 100);

        // Timeframe label
        let tfLabel = 'Swing';
        if (days <= 1) tfLabel = 'Scalp';
        else if (days <= 3) tfLabel = 'Intraday';
        else if (days <= 7) tfLabel = 'Swing';
        else tfLabel = `${days}D`;

        // ─── Derive intelligence from indicators ───
        let buyCount = 0, sellCount = 0, neutralCount = 0;
        indArray.forEach(ind => {
            const sig = String(ind.signal || '').toUpperCase();
            if (sig === 'BUY') buyCount++;
            else if (sig === 'SELL') sellCount++;
            else neutralCount++;
        });
        const indTotal = indArray.length || 1;
        const alignedCount = long ? buyCount : sellCount;
        const alignmentRatio = alignedCount / indTotal;

        // Conviction
        const conviction = alignmentRatio >= 0.6 && conf >= 70 ? 'strong'
            : alignmentRatio >= 0.4 || conf >= 60 ? 'moderate'
            : alignmentRatio > 0 ? 'low' : 'none';

        // Sentiment
        let sentimentTag = 'Mixed';
        if (buyCount > sellCount + neutralCount) sentimentTag = 'Bullish';
        else if (sellCount > buyCount + neutralCount) sentimentTag = 'Bearish';
        else if (neutralCount >= indTotal * 0.7) sentimentTag = 'Neutral';

        // Market regime
        const volatilityLevel = analysis?.volatility || 'moderate';
        const rsiVal = rsi ? (typeof rsi.value === 'number' ? rsi.value : parseFloat(rsi.value) || 50) : 50;
        let regime = 'Mixed Conditions';
        if (volatilityLevel === 'high' || rsiVal > 70 || rsiVal < 30) regime = 'High Volatility';
        else if (trend?.signal === 'BUY' || trend?.signal === 'SELL') regime = 'Trending';
        else if (volatilityLevel === 'low') regime = 'Range-Bound';

        // Supporting factors
        const factors = [];
        if (trend?.signal === (long ? 'BUY' : 'SELL')) factors.push('Trend Aligned');
        if (vol?.value === 'High' || vol?.signal === 'BUY') factors.push('Volume Confirmation');
        if (rsiVal < 35 && long) factors.push('Oversold Bounce');
        if (rsiVal > 65 && !long) factors.push('Overbought Rejection');
        if (alignmentRatio >= 0.6) factors.push('Multi-Indicator Alignment');
        if (conf >= 75) factors.push('High AI Conviction');
        if (parseFloat(rr) >= 2.5) factors.push('Strong R:R Ratio');
        if (factors.length === 0) factors.push('AI Pattern Detection');

        // Signal quality breakdown (4 dimensions)
        const qualityBreakdown = {
            conviction: conviction === 'strong' ? 90 : conviction === 'moderate' ? 60 : 35,
            sentimentAlign: sentimentTag === (long ? 'Bullish' : 'Bearish') ? 85 : sentimentTag === 'Mixed' ? 50 : 25,
            technicalAlign: Math.round(alignmentRatio * 100),
            regimeFit: regime === 'Trending' ? 80 : regime === 'High Volatility' ? 55 : regime === 'Range-Bound' ? 40 : 50,
        };

        return {
            id: raw._id, symbol: sym, fullSymbol: raw.symbol, crypto, long, conf, status,
            entry, target, currentPrice, sl, tp1, tp2, tp3, rr, riskLevel,
            movePct, isWin, resultText, tfLabel, days, confLabel, setupType, aiSummary,
            indArray, analysis, whyReasons, risks, distToTP, distToSL,
            conviction, sentimentTag, regime, factors, qualityBreakdown,
            buyCount, sellCount, neutralCount,
            createdAt: raw.createdAt, expiresAt: raw.expiresAt,
            viewCount: raw.viewCount || 0,
        };
    };

    if (loading) return <Page><Container><Loading>Loading signal...</Loading></Container></Page>;
    if (!signal) return (
        <Page><Container>
            <BackBtn onClick={() => navigate('/signals')}><ArrowLeft size={14}/> Back to Signals</BackBtn>
            <Loading><AlertTriangle size={24} style={{marginBottom:8}}/><br/>Signal not found</Loading>
        </Container></Page>
    );

    const s = signal;
    const posMove = s.movePct >= 0;
    const isActive = s.status !== 'closed';

    // Trade map positioning (SL=0%, Entry=middle, TP3=100%)
    const slDist = Math.abs(s.entry - s.sl);
    const tpDist = Math.abs(s.target - s.entry);
    const totalRange = slDist + tpDist;
    const entryPct = totalRange > 0 ? (slDist / totalRange) * 100 : 33;
    const tp1Pct = totalRange > 0 ? ((slDist + Math.abs(s.tp1 - s.entry)) / totalRange) * 100 : 50;
    const tp2Pct = totalRange > 0 ? ((slDist + Math.abs(s.tp2 - s.entry)) / totalRange) * 100 : 75;
    const livePct = totalRange > 0 ? Math.max(2, Math.min(98, s.long
        ? ((s.currentPrice - s.sl) / totalRange) * 100
        : ((s.sl - s.currentPrice) / totalRange) * 100
    )) : 50;

    const executeCopyToPaper = () => {
        navigate('/paper-trading', {
            state: {
                signal: {
                    symbol: s.symbol, long: s.long, crypto: s.crypto,
                    entry: s.entry, sl: s.sl, tp1: s.tp1, tp2: s.tp2, tp3: s.tp3,
                    conf: s.conf, rr: s.rr
                }
            }
        });
        setCopyModal(false);
    };

    return (
        <Page>
            <SEO title={`${s.symbol} ${s.long?'LONG':'SHORT'} Signal — Nexus Signal`} description={`AI trading signal for ${s.symbol}: ${s.long?'LONG':'SHORT'} with ${s.conf}% confidence. Full analysis and trade levels.`} />
            <Container>
                <BackBtn onClick={() => navigate('/signals')}><ArrowLeft size={14}/> Back to Signals</BackBtn>

                {/* ═══ SECTION 1: TRADE DECISION HEADER ═══ */}
                <DecisionHeader>
                    <HeaderTop>
                        <HeaderLeft>
                            <SymbolRow>
                                <Symbol onClick={() => navigate(s.crypto ? `/crypto/${s.symbol}` : `/stock/${s.symbol}`)} title={`View ${s.symbol} details`}>
                                    {s.symbol}
                                </Symbol>
                                <DirBadge $long={s.long}>
                                    {s.long ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                                    {s.long ? 'LONG' : 'SHORT'}
                                </DirBadge>
                            </SymbolRow>
                            <SetupLabel>{s.confLabel} Setup — {s.setupType}</SetupLabel>
                            <AISummary>{s.aiSummary}</AISummary>
                        </HeaderLeft>
                        <HeaderRight>
                            <ConfBig $val={s.conf}>{s.conf}%</ConfBig>
                            <ConfLabel>AI Confidence</ConfLabel>
                        </HeaderRight>
                    </HeaderTop>
                    <MetaRow>
                        <MetaItem><Shield size={13}/> Trade #{s.id?.slice(-4).toUpperCase() || '0000'}</MetaItem>
                        <MetaItem><Clock size={13}/> Opened {timeAgo(s.createdAt)}</MetaItem>
                        <MetaItem><Timer size={13}/> {s.tfLabel} ({s.days}d)</MetaItem>
                        <StatusTag $s={s.status}>{s.status === 'new' ? 'NEW' : s.status === 'active' ? 'ACTIVE' : 'CLOSED'}</StatusTag>
                        {isActive && <MetaItem><Timer size={13}/> {timeLeft(s.expiresAt)}</MetaItem>}
                    </MetaRow>
                </DecisionHeader>

                {/* ═══ SECTION 2: QUICK TRADE OVERVIEW ═══ */}
                <OverviewCard>
                    <OverviewTitle><Target size={15} color="#00adef"/> Trade Overview</OverviewTitle>
                    <OverviewGrid>
                        <OvBox>
                            <OvLabel>Entry Price</OvLabel>
                            <OvValue>{fmtPrice(s.entry)}</OvValue>
                        </OvBox>
                        <OvBox $bg="rgba(239,68,68,.03)" $bc="rgba(239,68,68,.08)">
                            <OvLabel>Stop Loss</OvLabel>
                            <OvValue $c="#ef4444">{fmtPrice(s.sl)}</OvValue>
                        </OvBox>
                        <OvBox $bg="rgba(16,185,129,.03)" $bc="rgba(16,185,129,.08)">
                            <OvLabel>Target (TP3)</OvLabel>
                            <OvValue $c="#10b981">{fmtPrice(s.target)}</OvValue>
                        </OvBox>
                        <OvBox>
                            <OvLabel>Risk / Reward</OvLabel>
                            <OvValue $c="#00adef">1:{s.rr}</OvValue>
                        </OvBox>
                        <OvBox>
                            <OvLabel>Confidence</OvLabel>
                            <OvValue $c={s.conf >= 75 ? '#10b981' : s.conf >= 60 ? '#f59e0b' : '#94a3b8'}>{s.conf}%</OvValue>
                        </OvBox>
                    </OverviewGrid>
                    <TPRow>
                        <TPBox><TPLabel>TP1 (3%)</TPLabel><TPValue>{fmtPrice(s.tp1)}</TPValue></TPBox>
                        <TPBox><TPLabel>TP2 (8%)</TPLabel><TPValue>{fmtPrice(s.tp2)}</TPValue></TPBox>
                        <TPBox><TPLabel>TP3 (12%)</TPLabel><TPValue>{fmtPrice(s.tp3)}</TPValue></TPBox>
                    </TPRow>
                </OverviewCard>

                {/* ═══ CTA BUTTONS (TOP) ═══ */}
                {isActive && (
                    <CTARow>
                        <PrimaryBtn onClick={() => setCopyModal(true)}>
                            <Copy size={16}/> Take This Trade
                        </PrimaryBtn>
                        <SecondaryBtn onClick={() => navigate('/paper-trading', { state: { signal: { symbol: s.symbol, long: s.long, crypto: s.crypto, entry: s.entry, sl: s.sl, tp1: s.tp1, tp2: s.tp2, tp3: s.tp3, conf: s.conf, rr: s.rr } } })}>
                            <Activity size={16}/> Paper Trade First
                        </SecondaryBtn>
                    </CTARow>
                )}

                {!isPremium && (
                    <UpgradeCard>
                        <Lock size={18} color="#64748b" style={{marginBottom:6}}/>
                        <div style={{fontSize:'.95rem',fontWeight:700,color:'#e0e6ed',marginBottom:4}}>Real-Time Signal Access</div>
                        <div style={{fontSize:'.8rem',color:'#64748b',marginBottom:10}}>Free users see delayed data. Unlock instant signals + alerts.</div>
                        <UpgradeBtn onClick={() => navigate('/pricing')}><Crown size={14}/> Upgrade to Premium</UpgradeBtn>
                    </UpgradeCard>
                )}

                {/* ═══ SECTION 3: VISUAL TRADE MAP ═══ */}
                <TradeMap>
                    <TradeMapTitle><BarChart3 size={15} color="#00adef"/> Trade Map</TradeMapTitle>
                    <MapContainer>
                        <MapTrack>
                            <MapSegmentLoss $w={entryPct} />
                            <MapSegmentWin $w={100 - entryPct} />

                            {/* SL Marker */}
                            <MapMarker style={{left:'0%'}} $c="#ef4444">SL</MapMarker>
                            <MapPrice style={{left:'0%'}} $c="#ef4444">{fmtPrice(s.sl)}</MapPrice>

                            {/* Entry Marker */}
                            <MapMarker style={{left:`${entryPct}%`}} $c="#94a3b8" $h="18px">ENTRY</MapMarker>
                            <MapPrice style={{left:`${entryPct}%`}} $c="#94a3b8">{fmtPrice(s.entry)}</MapPrice>

                            {/* TP1 */}
                            <MapMarker style={{left:`${tp1Pct}%`}} $c="rgba(16,185,129,.5)">TP1</MapMarker>

                            {/* TP2 */}
                            <MapMarker style={{left:`${tp2Pct}%`}} $c="rgba(16,185,129,.7)">TP2</MapMarker>

                            {/* TP3 / Target */}
                            <MapMarker style={{left:'100%'}} $c="#10b981">TP3</MapMarker>
                            <MapPrice style={{left:'100%'}} $c="#10b981">{fmtPrice(s.target)}</MapPrice>

                            {/* Live price dot (only for active) */}
                            {isActive && s.currentPrice !== s.entry && (
                                <>
                                    <MapLiveLabel style={{left:`${livePct}%`}} $pos={posMove}>
                                        {fmtPrice(s.currentPrice)}
                                    </MapLiveLabel>
                                    <MapLiveDot style={{left:`${livePct}%`}} $pos={posMove} />
                                </>
                            )}
                        </MapTrack>
                    </MapContainer>
                    <MapRRLabel>
                        Risk: {fmtPrice(Math.abs(s.entry - s.sl))} | Reward: {fmtPrice(Math.abs(s.target - s.entry))} | Ratio: <MapRRValue>1:{s.rr}</MapRRValue>
                    </MapRRLabel>
                </TradeMap>

                {/* ═══ SECTION 4: LIVE TRADE STATUS / RESULT ═══ */}
                {isActive && s.currentPrice && s.currentPrice !== s.entry ? (
                    <LiveStatus $pos={posMove}>
                        <LiveTitle>
                            <Activity size={15} color={posMove ? '#10b981' : '#ef4444'} /> Live Trade Status
                        </LiveTitle>
                        <LiveGrid>
                            <LiveBox>
                                <LiveLabel>Current Price</LiveLabel>
                                <LiveValue $c={posMove ? '#10b981' : '#ef4444'}>{fmtPrice(s.currentPrice)}</LiveValue>
                            </LiveBox>
                            <LiveBox>
                                <LiveLabel>Move from Entry</LiveLabel>
                                <LiveValue $c={posMove ? '#10b981' : '#ef4444'}>
                                    {s.movePct >= 0 ? '+' : ''}{s.movePct.toFixed(2)}%
                                </LiveValue>
                            </LiveBox>
                            <LiveBox>
                                <LiveLabel>Distance to TP3</LiveLabel>
                                <LiveValue $c="#10b981">{s.distToTP.toFixed(1)}%</LiveValue>
                            </LiveBox>
                            <LiveBox>
                                <LiveLabel>Distance to SL</LiveLabel>
                                <LiveValue $c="#ef4444">{s.distToSL.toFixed(1)}%</LiveValue>
                            </LiveBox>
                        </LiveGrid>
                        <LiveCopy>
                            {posMove
                                ? `Trade is currently ${s.movePct >= 0 ? '+' : ''}${s.movePct.toFixed(2)}% from entry — moving ${s.long ? 'toward target' : 'in the right direction'}. ${s.distToTP < 3 ? 'Approaching target zone.' : ''}`
                                : `Trade is currently ${s.movePct.toFixed(2)}% against entry — ${s.distToSL < 2 ? 'nearing stop loss. Monitor closely.' : 'within normal range. Setup remains valid.'}`
                            }
                        </LiveCopy>
                    </LiveStatus>
                ) : s.status === 'closed' ? (
                    <ResultCard $win={s.isWin}>
                        <ResultIcon>{s.isWin ? '✅' : '❌'}</ResultIcon>
                        <ResultTitle $win={s.isWin}>{s.resultText}</ResultTitle>
                        <ResultPct $win={s.isWin}>{s.movePct >= 0 ? '+' : ''}{s.movePct.toFixed(2)}%</ResultPct>
                        <ResultSub>Entry {fmtPrice(s.entry)} → Result {fmtPrice(s.currentPrice)}</ResultSub>
                    </ResultCard>
                ) : null}

                {/* ═══ SECTION 5: WHY THIS TRADE WORKS ═══ */}
                {s.whyReasons.length > 0 && (
                    <Card $d=".3s">
                        <CardTitle><Brain size={15} color="#a78bfa"/> Why This Trade Works</CardTitle>
                        <ReasonGrid>
                            {s.whyReasons.map((r, i) => (
                                <ReasonBox key={i}>
                                    <ReasonLabel>{r.category}</ReasonLabel>
                                    <ReasonText>{r.text}</ReasonText>
                                </ReasonBox>
                            ))}
                        </ReasonGrid>
                    </Card>
                )}

                {/* ═══ SENTIMENT & MARKET CONTEXT ═══ */}
                <IntelSection>
                    <IntelTitle><Eye size={15}/> Signal Intelligence</IntelTitle>
                    <IntelGrid>
                        <IntelCell>
                            <IntelLabel>Conviction</IntelLabel>
                            <IntelValue $c={s.conviction === 'strong' ? '#10b981' : s.conviction === 'moderate' ? '#f59e0b' : '#64748b'}>
                                {s.conviction === 'strong' ? 'Strong' : s.conviction === 'moderate' ? 'Moderate' : s.conviction === 'low' ? 'Low' : 'None'}
                            </IntelValue>
                            <IntelSub>{s.buyCount}B / {s.sellCount}S / {s.neutralCount}N</IntelSub>
                        </IntelCell>
                        <IntelCell>
                            <IntelLabel>Sentiment</IntelLabel>
                            <IntelValue $c={s.sentimentTag === 'Bullish' ? '#10b981' : s.sentimentTag === 'Bearish' ? '#ef4444' : '#f59e0b'}>
                                {s.sentimentTag}
                            </IntelValue>
                            <IntelSub>{s.sentimentTag === (s.long ? 'Bullish' : 'Bearish') ? 'Aligned' : 'Mixed'}</IntelSub>
                        </IntelCell>
                        <IntelCell>
                            <IntelLabel>Market Regime</IntelLabel>
                            <IntelValue $c="#a78bfa">{s.regime}</IntelValue>
                            <IntelSub>{s.regime === 'Trending' ? 'Favorable' : s.regime === 'High Volatility' ? 'Caution' : 'Neutral'}</IntelSub>
                        </IntelCell>
                        <IntelCell>
                            <IntelLabel>Alignment</IntelLabel>
                            <IntelValue $c={s.qualityBreakdown.technicalAlign >= 60 ? '#10b981' : '#f59e0b'}>
                                {s.qualityBreakdown.technicalAlign}%
                            </IntelValue>
                            <IntelSub>Indicator agreement</IntelSub>
                        </IntelCell>
                    </IntelGrid>

                    {/* Supporting factors */}
                    <FactorChips>
                        {s.factors.map((f, i) => <FactorChip key={i}>{f}</FactorChip>)}
                    </FactorChips>
                </IntelSection>

                {/* ═══ SIGNAL QUALITY BREAKDOWN ═══ */}
                <Card $d=".32s">
                    <CardTitle><Target size={15} color="#00adef"/> Signal Quality</CardTitle>
                    <QualityRow>
                        <QualityCell>
                            <QualityLabel>Conviction</QualityLabel>
                            <QualityBar><QualityFill $w={s.qualityBreakdown.conviction}/></QualityBar>
                            <QualityValue $w={s.qualityBreakdown.conviction}>{s.qualityBreakdown.conviction}%</QualityValue>
                        </QualityCell>
                        <QualityCell>
                            <QualityLabel>Sentiment Fit</QualityLabel>
                            <QualityBar><QualityFill $w={s.qualityBreakdown.sentimentAlign}/></QualityBar>
                            <QualityValue $w={s.qualityBreakdown.sentimentAlign}>{s.qualityBreakdown.sentimentAlign}%</QualityValue>
                        </QualityCell>
                        <QualityCell>
                            <QualityLabel>Technical</QualityLabel>
                            <QualityBar><QualityFill $w={s.qualityBreakdown.technicalAlign}/></QualityBar>
                            <QualityValue $w={s.qualityBreakdown.technicalAlign}>{s.qualityBreakdown.technicalAlign}%</QualityValue>
                        </QualityCell>
                        <QualityCell>
                            <QualityLabel>Regime Fit</QualityLabel>
                            <QualityBar><QualityFill $w={s.qualityBreakdown.regimeFit}/></QualityBar>
                            <QualityValue $w={s.qualityBreakdown.regimeFit}>{s.qualityBreakdown.regimeFit}%</QualityValue>
                        </QualityCell>
                    </QualityRow>
                </Card>

                {/* ═══ SECTION 6: INVALIDATION & RISKS ═══ */}
                <Card $d=".35s">
                    <CardTitle><AlertTriangle size={15} color="#f59e0b"/> Invalidation & Risks</CardTitle>
                    {s.risks.map((r, i) => (
                        <RiskItem key={i}>
                            <RiskIcon>
                                {r.severity === 'high' ? <XCircle size={14}/> : <AlertTriangle size={14}/>}
                            </RiskIcon>
                            <RiskText>{r.text}</RiskText>
                        </RiskItem>
                    ))}
                </Card>

                {/* ═══ SECTION 7: TECHNICAL ANALYSIS ═══ */}
                {s.indArray.length > 0 && (
                    <Card $d=".4s">
                        <CardTitle><BarChart3 size={15} color="#8b5cf6"/> Technical Indicators</CardTitle>
                        <IndGrid>
                            {s.indArray.slice(0, 6).map((ind, i) => (
                                <IndBox key={i}>
                                    <IndName>{ind.name}</IndName>
                                    <div style={{display:'flex',alignItems:'center',gap:'.35rem'}}>
                                        <IndVal>
                                            {typeof ind.value === 'number' ? ind.value.toFixed(1) : ind.value || '--'}
                                        </IndVal>
                                        <IndSignal $s={ind.signal}>{ind.signal}</IndSignal>
                                    </div>
                                </IndBox>
                            ))}
                        </IndGrid>
                    </Card>
                )}

                {/* ═══ SECTION 8: CTA (BOTTOM) ═══ */}
                {isActive && (
                    <CTARow>
                        <PrimaryBtn onClick={() => setCopyModal(true)}>
                            <Copy size={16}/> Take This Trade
                        </PrimaryBtn>
                        <SecondaryBtn onClick={() => navigate('/paper-trading', { state: { signal: { symbol: s.symbol, long: s.long, crypto: s.crypto, entry: s.entry, sl: s.sl, tp1: s.tp1, tp2: s.tp2, tp3: s.tp3, conf: s.conf, rr: s.rr } } })}>
                            <Activity size={16}/> Paper Trade First
                        </SecondaryBtn>
                    </CTARow>
                )}

                {/* ═══ SECTION 9: SOCIAL PROOF ═══ */}
                <ProofStrip>
                    {s.viewCount > 0 && (
                        <ProofItem><Eye size={13}/> <ProofVal>{s.viewCount}</ProofVal> users viewed this trade</ProofItem>
                    )}
                    {globalStats && (
                        <>
                            <ProofItem><Target size={13}/> Based on <ProofVal>{globalStats.total}</ProofVal> tracked trades</ProofItem>
                            {globalStats.winRate && (
                                <ProofItem><TrendingUp size={13}/> Platform win rate: <ProofVal>{globalStats.winRate}%</ProofVal></ProofItem>
                            )}
                        </>
                    )}
                </ProofStrip>

                {/* ═══ SECTION 10: TRUST REINFORCEMENT ═══ */}
                <TrustLine>
                    Every trade is tracked publicly — win or lose. No edits. No cherry-picking.
                </TrustLine>
            </Container>

            {/* ═══ COPY MODAL ═══ */}
            {copyModal && (
                <ModalOverlay onClick={() => setCopyModal(false)}>
                    <ModalCard onClick={e => e.stopPropagation()}>
                        <ModalClose onClick={() => setCopyModal(false)}><XCircle size={18}/></ModalClose>
                        <ModalTitle>Take This Trade</ModalTitle>
                        <ModalSub>{s.symbol} {s.long ? 'LONG' : 'SHORT'} — {s.conf}% confidence</ModalSub>

                        <ModalOption onClick={executeCopyToPaper}>
                            <ModalOptIcon><Activity size={18}/></ModalOptIcon>
                            <div style={{flex:1}}>
                                <ModalOptTitle>Paper Trade</ModalOptTitle>
                                <ModalOptDesc>Execute with virtual $100K — no risk</ModalOptDesc>
                            </div>
                            <ArrowUpRight size={16} color="#10b981"/>
                        </ModalOption>

                        <ModalOption $disabled>
                            <ModalOptIcon $disabled><DollarSign size={18}/></ModalOptIcon>
                            <div style={{flex:1}}>
                                <ModalOptTitle>Real Portfolio</ModalOptTitle>
                                <ModalOptDesc>Execute with connected brokerage</ModalOptDesc>
                            </div>
                            <ComingSoonBadge>COMING SOON</ComingSoonBadge>
                        </ModalOption>
                    </ModalCard>
                </ModalOverlay>
            )}
        </Page>
    );
};

export default SignalDetailPage;
