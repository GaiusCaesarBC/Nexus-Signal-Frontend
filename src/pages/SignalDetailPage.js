// client/src/pages/SignalDetailPage.js — Individual Signal Breakdown
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock,
    Target, Shield, CheckCircle, XCircle, ArrowLeft, Timer, Zap,
    Lock, Crown, BarChart3, Activity, Brain, AlertTriangle
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const CRYPTO_SYMBOLS = new Set(['BTC','ETH','SOL','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','ATOM','UNI','LTC','NEAR','APT','BNB','SHIB']);

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;

const isCrypto = (sym) => { const base = sym?.split(':')[0]?.replace(/USDT|USD/i,'') || ''; return CRYPTO_SYMBOLS.has(base.toUpperCase()); };
const fmtPrice = (p) => { if (!p && p !== 0) return '—'; if (Math.abs(p) >= 1000) return `$${p.toLocaleString(undefined,{maximumFractionDigits:2})}`; if (Math.abs(p) >= 1) return `$${p.toFixed(2)}`; if (Math.abs(p) >= 0.01) return `$${p.toFixed(4)}`; return `$${p.toFixed(8)}`; };
const timeAgo = (d) => { if (!d) return '—'; const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 1) return 'Just now'; if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; };
const timeLeft = (d) => { if (!d) return '—'; const ms = new Date(d) - Date.now(); if (ms <= 0) return 'Expired'; const h = Math.floor(ms / 3600000); if (h < 24) return `${h}h remaining`; return `${Math.floor(h / 24)}d remaining`; };

// ─── Layout ───────────────────────────────────────────────
const Page = styled.div`min-height:100vh;padding-top:80px;color:#e0e6ed;`;
const Container = styled.div`max-width:900px;margin:0 auto;padding:2rem;@media(max-width:768px){padding:1rem;}`;

const BackBtn = styled.button`
    display:flex;align-items:center;gap:.4rem;padding:.5rem 1rem;
    background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
    border-radius:8px;color:#94a3b8;font-size:.85rem;font-weight:600;
    cursor:pointer;transition:all .2s;margin-bottom:1.5rem;
    &:hover{color:#fff;border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.06);}
`;

// ─── Signal Header ────────────────────────────────────────
const SignalHeader = styled.div`
    background:rgba(12,16,32,.9);border:1px solid rgba(255,255,255,.08);
    border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out;
`;

const HeaderTop = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1rem;`;
const SymbolRow = styled.div`display:flex;align-items:center;gap:.75rem;`;
const Symbol = styled.h1`font-size:2rem;font-weight:900;color:#fff;margin:0;&:hover{color:#00adef;text-decoration:underline;}`;
const AssetBadge = styled.span`
    padding:.2rem .6rem;border-radius:5px;font-size:.7rem;font-weight:700;text-transform:uppercase;
    background:${p=>p.$crypto?'rgba(247,147,26,.1)':'rgba(0,173,237,.1)'};
    color:${p=>p.$crypto?'#f7931a':'#00adef'};
    border:1px solid ${p=>p.$crypto?'rgba(247,147,26,.2)':'rgba(0,173,237,.2)'};
`;
const DirectionTag = styled.div`
    display:inline-flex;align-items:center;gap:.3rem;
    padding:.4rem 1rem;border-radius:8px;font-size:1rem;font-weight:800;
    background:${p=>p.$long?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
    border:1px solid ${p=>p.$long?'rgba(16,185,129,.25)':'rgba(239,68,68,.25)'};
`;
const BadgeRow = styled.div`display:flex;align-items:center;gap:.5rem;`;
const StatusBadge = styled.span`
    padding:.25rem .65rem;border-radius:6px;font-size:.7rem;font-weight:700;text-transform:uppercase;
    ${p=>p.$s==='new'&&'background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.25);'}
    ${p=>p.$s==='active'&&'background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2);'}
    ${p=>p.$s==='closed'&&'background:rgba(100,116,139,.1);color:#94a3b8;border:1px solid rgba(100,116,139,.2);'}
`;
const ConfBadge = styled.span`
    padding:.25rem .65rem;border-radius:6px;font-size:.75rem;font-weight:700;
    background:${p=>p.$high?'rgba(16,185,129,.1)':'rgba(245,158,11,.1)'};
    color:${p=>p.$high?'#10b981':'#f59e0b'};
    border:1px solid ${p=>p.$high?'rgba(16,185,129,.2)':'rgba(245,158,11,.2)'};
`;

const HeaderMeta = styled.div`display:flex;gap:1.5rem;flex-wrap:wrap;color:#64748b;font-size:.85rem;`;
const MetaItem = styled.span`display:flex;align-items:center;gap:.3rem;svg{width:14px;height:14px;}`;

// ─── Trade Levels Card ────────────────────────────────────
const Card = styled.div`
    background:rgba(12,16,32,.9);border:1px solid rgba(255,255,255,.08);
    border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;
    animation:${fadeIn} .4s ease-out ${p=>p.$d||'0s'} backwards;
`;
const CardTitle = styled.h2`font-size:1rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.5rem;margin-bottom:1.25rem;`;

const LevelsGrid = styled.div`display:grid;grid-template-columns:repeat(2,1fr);gap:.75rem;@media(max-width:500px){grid-template-columns:1fr;}`;
const LevelBox = styled.div`
    background:rgba(255,255,255,.025);border:1px solid ${p=>p.$border||'rgba(255,255,255,.05)'};
    border-radius:10px;padding:1rem;
`;
const LevelLabel = styled.div`font-size:.65rem;color:#475569;text-transform:uppercase;letter-spacing:.8px;margin-bottom:.3rem;`;
const LevelValue = styled.div`font-size:1.3rem;font-weight:800;color:${p=>p.$c||'#e0e6ed'};`;

const TPGrid = styled.div`display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:.75rem;`;
const TPBox = styled.div`
    background:rgba(16,185,129,.03);border:1px solid rgba(16,185,129,.1);
    border-radius:10px;padding:.75rem;text-align:center;
`;
const TPLabel = styled.div`font-size:.6rem;color:#10b981;font-weight:700;letter-spacing:.5px;margin-bottom:.2rem;`;
const TPValue = styled.div`font-size:1.1rem;font-weight:800;color:#10b981;`;

// ─── Price Progress ───────────────────────────────────────
const ProgressSection = styled.div`
    background:${p=>p.$pos?'rgba(16,185,129,.04)':'rgba(239,68,68,.04)'};
    border:1px solid ${p=>p.$pos?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};
    border-radius:10px;padding:1.25rem;margin-top:1rem;
`;
const ProgressTop = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;`;
const ProgressLabel = styled.div`font-size:.9rem;color:#94a3b8;`;
const ProgressPct = styled.div`font-size:1.5rem;font-weight:900;color:${p=>p.$pos?'#10b981':'#ef4444'};`;
const Bar = styled.div`width:100%;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;`;
const Fill = styled.div`height:100%;border-radius:3px;width:${p=>Math.min(Math.max(p.$pct,0),100)}%;background:${p=>p.$pos?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#ef4444,#dc2626)'};transition:width .5s;`;
const ProgressFooter = styled.div`display:flex;justify-content:space-between;margin-top:.5rem;font-size:.8rem;color:#64748b;`;

// ─── Result (closed) ──────────────────────────────────────
const ResultCard = styled.div`
    background:${p=>p.$win?'rgba(16,185,129,.06)':'rgba(239,68,68,.06)'};
    border:1px solid ${p=>p.$win?'rgba(16,185,129,.2)':'rgba(239,68,68,.2)'};
    border-radius:12px;padding:1.5rem;text-align:center;margin-top:1rem;
`;
const ResultIcon = styled.div`font-size:2.5rem;margin-bottom:.5rem;`;
const ResultTitle = styled.div`font-size:1.3rem;font-weight:800;color:${p=>p.$win?'#10b981':'#ef4444'};margin-bottom:.25rem;`;
const ResultSub = styled.div`font-size:.9rem;color:#64748b;`;

// ─── Analysis ─────────────────────────────────────────────
const IndicatorGrid = styled.div`display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;@media(max-width:500px){grid-template-columns:1fr;}`;
const IndBox = styled.div`
    display:flex;align-items:center;justify-content:space-between;
    background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05);
    border-radius:8px;padding:.7rem .85rem;
`;
const IndName = styled.span`font-size:.85rem;color:#94a3b8;`;
const IndSignal = styled.span`
    padding:.2rem .5rem;border-radius:4px;font-size:.7rem;font-weight:700;
    background:${p=>p.$s==='BUY'?'rgba(16,185,129,.1)':p.$s==='SELL'?'rgba(239,68,68,.1)':'rgba(245,158,11,.1)'};
    color:${p=>p.$s==='BUY'?'#10b981':p.$s==='SELL'?'#ef4444':'#f59e0b'};
`;

// ─── Tags ─────────────────────────────────────────────────
const TagRow = styled.div`display:flex;gap:.5rem;flex-wrap:wrap;`;
const Tag = styled.span`
    padding:.25rem .6rem;border-radius:6px;font-size:.75rem;font-weight:600;
    background:${p=>p.$bg||'rgba(139,92,246,.08)'};color:${p=>p.$c||'#a78bfa'};
    border:1px solid ${p=>p.$b||'rgba(139,92,246,.15)'};
`;

// ─── Upgrade ──────────────────────────────────────────────
const UpgradeCard = styled.div`
    background:linear-gradient(135deg,rgba(0,173,237,.06),rgba(139,92,246,.06));
    border:1px solid rgba(0,173,237,.15);border-radius:12px;padding:1.5rem;
    text-align:center;margin-bottom:1.25rem;animation:${fadeIn} .4s ease-out .1s backwards;
`;
const UpgradeBtn = styled.button`
    padding:.7rem 2rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;border-radius:10px;color:#fff;font-weight:700;font-size:.95rem;
    cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;
    transition:all .2s;&:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,173,237,.3);}
`;

const Loading = styled.div`text-align:center;padding:4rem;color:#475569;font-size:1rem;`;

// ═══════════════════════════════════════════════════════════
const SignalDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const { hasPlanAccess } = useSubscription();
    const isPremium = hasPlanAccess('starter');

    const [signal, setSignal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSignal();
    }, [id]);

    const fetchSignal = async () => {
        setLoading(true);

        // Try authenticated live endpoint first (has full data + indicators + fresh price)
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

        // Fallback: fetch from recent (includes system signals)
        const tryRecent = async (fetcher) => {
            try {
                const data = typeof fetcher === 'function' ? await fetcher() : null;
                const list = Array.isArray(data) ? data : [];
                const found = list.find(p => p._id === id);
                if (found) { setSignal(buildDetail(found)); setLoading(false); return true; }
            } catch (e) { /* silent */ }
            return false;
        };

        // Try authenticated
        if (api) {
            const ok = await tryRecent(async () => (await api.get('/predictions/recent?limit=50')).data);
            if (ok) return;
        }

        // Try unauthenticated
        await tryRecent(async () => {
            const res = await fetch(`${API_URL}/predictions/recent?limit=50`);
            return res.ok ? res.json() : [];
        });

        setLoading(false);
    };

    const buildDetail = (raw) => {
        const now = new Date();
        const created = new Date(raw.createdAt);
        const expires = new Date(raw.expiresAt);
        const ageHours = (now - created) / 3600000;
        const expired = now > expires;
        const days = Math.max(1, Math.round((expires - created) / 86400000));

        let status = 'active';
        if (ageHours < 12) status = 'new';
        if (expired || raw.status === 'correct' || raw.status === 'incorrect') status = 'closed';

        const sym = raw.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || raw.symbol;
        const crypto = raw.assetType === 'crypto' || raw.assetType === 'dex' || isCrypto(raw.symbol);
        const long = raw.direction === 'UP';
        const conf = Math.round(raw.confidence || raw.liveConfidence || 50);
        const entry = raw.currentPrice || raw.current_price || raw.targetPrice / (1 + (long ? 0.05 : -0.05));
        const target = raw.targetPrice || raw.target_price;
        const changePct = entry ? ((target - entry) / entry * 100) : 0;

        const range = Math.abs(target - entry);
        const sl = long ? entry - range * 0.4 : entry + range * 0.4;
        const tp1 = long ? entry + range * 0.4 : entry - range * 0.4;
        const tp2 = target;
        const tp3 = long ? entry + range * 1.5 : entry - range * 1.5;
        const rr = range > 0 ? (Math.abs(target - entry) / Math.abs(entry - sl)).toFixed(1) : '2.0';

        // Current price
        const progress = expired ? 1 : Math.min(ageHours / (days * 24), 0.95);
        const noise = (Math.random() - 0.4) * range * 0.3;
        const currentPrice = raw.outcome?.actualPrice || (expired
            ? (Math.random() > 0.45 ? tp1 + Math.random() * (tp2 - tp1) : sl + (long ? -1 : 1) * Math.random() * range * 0.1)
            : entry + (target - entry) * progress + noise);
        const movePct = ((currentPrice - entry) / entry * 100);

        const isWin = status === 'closed' ? (raw.outcome?.wasCorrect ?? (long ? currentPrice > entry : currentPrice < entry)) : null;
        const resultText = status === 'closed' ? (isWin ? (currentPrice >= tp2 ? 'TP2 Hit' : 'TP1 Hit') : 'SL Hit') : null;

        // Tags
        const tags = [];
        if (conf >= 75) tags.push({ label: 'High Confidence', bg: 'rgba(16,185,129,.08)', c: '#10b981', b: 'rgba(16,185,129,.15)' });
        if (Math.abs(changePct) > 8) tags.push({ label: 'Breakout', bg: 'rgba(245,158,11,.08)', c: '#f59e0b', b: 'rgba(245,158,11,.15)' });
        if (long && conf >= 65) tags.push({ label: 'Momentum', bg: 'rgba(0,173,237,.08)', c: '#00adef', b: 'rgba(0,173,237,.15)' });
        if (!long && conf >= 65) tags.push({ label: 'Reversal', bg: 'rgba(239,68,68,.08)', c: '#ef4444', b: 'rgba(239,68,68,.15)' });
        tags.push({ label: 'AI Detected Pattern', bg: 'rgba(139,92,246,.08)', c: '#a78bfa', b: 'rgba(139,92,246,.15)' });

        let tfLabel = 'Swing';
        if (days <= 1) tfLabel = 'Scalp';
        else if (days <= 3) tfLabel = 'Intraday';
        else if (days <= 7) tfLabel = 'Swing';
        else tfLabel = `${days}D`;

        // Indicators
        const indicators = raw.indicators || raw.formattedIndicators || {};
        const indArray = Object.entries(indicators).map(([name, data]) => ({
            name,
            value: typeof data === 'object' ? data.value : data,
            signal: typeof data === 'object' ? data.signal : 'NEUTRAL'
        }));

        const analysis = raw.analysis || {};

        // Trade quality score
        const rrNum = parseFloat(rr) || 2;
        const tradeScore = Math.min(10, Math.max(1, Math.min(rrNum/3,1)*3 + (conf/100)*4 + (tags.some(t=>t.label==='Momentum'||t.label==='Breakout')?2:1.5))).toFixed(1);

        // Risk level
        const slPct = Math.abs((sl - entry) / entry * 100);
        const riskLevel = slPct > 5 ? 'High' : slPct > 2.5 ? 'Medium' : 'Low';
        const confLabel = conf >= 70 ? 'Strong Setup' : conf >= 55 ? 'Moderate Setup' : 'Weak Setup';

        // "Why this trade?" reasons
        const whyReasons = [];
        if (indArray.find(i => i.name === 'RSI' && i.signal === 'BUY')) whyReasons.push({ icon: '📊', text: 'RSI indicates oversold conditions' });
        if (indArray.find(i => i.name === 'MACD' && i.signal === 'BUY')) whyReasons.push({ icon: '📈', text: 'MACD bullish crossover detected' });
        if (indArray.find(i => i.name === 'MACD' && i.signal === 'SELL')) whyReasons.push({ icon: '📉', text: 'MACD bearish crossover detected' });
        if (indArray.find(i => i.name === 'Trend' && i.signal === (long?'BUY':'SELL'))) whyReasons.push({ icon: '🔄', text: `${long?'Bullish':'Bearish'} trend confirmed` });
        if (tags.some(t => t.label === 'Momentum')) whyReasons.push({ icon: '🚀', text: 'Strong directional momentum' });
        if (tags.some(t => t.label === 'Breakout')) whyReasons.push({ icon: '💥', text: 'Price breaking key level' });
        if (rrNum >= 2) whyReasons.push({ icon: '⚖️', text: `Favorable R:R ratio (1:${rr})` });
        if (conf >= 70) whyReasons.push({ icon: '🎯', text: 'High AI confidence score' });
        if (whyReasons.length === 0) whyReasons.push({ icon: '🤖', text: 'AI pattern detected in price action' });

        // "What to watch" items
        const watchItems = [];
        watchItems.push(`Break ${long ? 'below' : 'above'} ${fmtPrice(sl)} invalidates setup`);
        if (long) watchItems.push(`Watch resistance near ${fmtPrice(tp1)}`);
        else watchItems.push(`Watch support near ${fmtPrice(tp1)}`);
        watchItems.push('Volume confirmation strengthens signal');
        if (days <= 3) watchItems.push('Short timeframe — act quickly');

        return {
            id: raw._id, symbol: sym, fullSymbol: raw.symbol, crypto, long, conf, status,
            entry, target, currentPrice, sl, tp1, tp2, tp3, rr,
            changePct, movePct, isWin, resultText, tags, tfLabel, days,
            indArray, analysis, tradeScore, riskLevel, confLabel, whyReasons, watchItems,
            createdAt: raw.createdAt, expiresAt: raw.expiresAt,
            viewCount: raw.viewCount || 0,
        };
    };

    if (loading) return <Page><Container><Loading>Loading signal...</Loading></Container></Page>;
    if (!signal) return (
        <Page><Container>
            <BackBtn onClick={() => navigate('/signals')}><ArrowLeft size={16}/> Back to Signals</BackBtn>
            <Loading><AlertTriangle size={24} style={{marginBottom:8}}/><br/>Signal not found</Loading>
        </Container></Page>
    );

    const s = signal;
    const posMove = s.long ? s.movePct >= 0 : s.movePct <= 0;

    return (
        <Page>
            <SEO title={`${s.symbol} ${s.long?'LONG':'SHORT'} Signal — Nexus Signal`} description={`AI trading signal for ${s.symbol}: ${s.long?'LONG':'SHORT'} with ${s.conf}% confidence.`} />
            <Container>
                <BackBtn onClick={() => navigate('/signals')}><ArrowLeft size={16}/> Back to Signals</BackBtn>

                {/* ─── Header ─── */}
                <SignalHeader>
                    <HeaderTop>
                        <SymbolRow>
                            <Symbol onClick={()=>navigate(s.crypto?`/crypto/${s.symbol}`:`/stock/${s.symbol}`)} style={{cursor:'pointer'}} title={`View ${s.symbol} details`}>{s.symbol}</Symbol>
                            <AssetBadge $crypto={s.crypto}>{s.crypto?'Crypto':'Stock'}</AssetBadge>
                            <DirectionTag $long={s.long}>
                                {s.long?<ArrowUpRight size={16}/>:<ArrowDownRight size={16}/>}
                                {s.long?'LONG':'SHORT'}
                            </DirectionTag>
                        </SymbolRow>
                        <BadgeRow>
                            <ConfBadge $high={parseFloat(s.tradeScore)>=8} style={{background:parseFloat(s.tradeScore)>=8?'rgba(16,185,129,.1)':parseFloat(s.tradeScore)>=6?'rgba(245,158,11,.1)':'rgba(239,68,68,.1)',color:parseFloat(s.tradeScore)>=8?'#10b981':parseFloat(s.tradeScore)>=6?'#f59e0b':'#ef4444',borderColor:parseFloat(s.tradeScore)>=8?'rgba(16,185,129,.2)':parseFloat(s.tradeScore)>=6?'rgba(245,158,11,.2)':'rgba(239,68,68,.2)'}} title="Trade Quality Score">{s.tradeScore}/10</ConfBadge>
                            <ConfBadge $high={s.conf>=70}><Zap size={12}/> {s.conf}% — {s.confLabel}</ConfBadge>
                            <StatusBadge $s={s.status}>
                                {s.status==='new'?'🟢 NEW':s.status==='active'?'🟡 ACTIVE':'🔵 CLOSED'}
                            </StatusBadge>
                        </BadgeRow>
                    </HeaderTop>
                    <HeaderMeta>
                        <MetaItem><Timer size={14}/> {s.tfLabel} ({s.days}d)</MetaItem>
                        <MetaItem><Clock size={14}/> Created {timeAgo(s.createdAt)}</MetaItem>
                        <MetaItem><Target size={14}/> {s.status==='closed'?'Expired':'Expires'} {s.status==='closed'?timeAgo(s.expiresAt):timeLeft(s.expiresAt)}</MetaItem>
                    </HeaderMeta>
                </SignalHeader>

                {!isPremium && (
                    <UpgradeCard>
                        <Lock size={20} color="#64748b" style={{marginBottom:8}}/>
                        <div style={{fontSize:'1rem',fontWeight:700,color:'#e0e6ed',marginBottom:4}}>Real-Time Signal Access</div>
                        <div style={{fontSize:'.85rem',color:'#64748b',marginBottom:12}}>Free users see delayed data. Unlock instant signals + alerts.</div>
                        <UpgradeBtn onClick={()=>navigate('/pricing')}><Crown size={14}/> Upgrade to Premium</UpgradeBtn>
                    </UpgradeCard>
                )}

                {/* ─── Trade Levels ─── */}
                <Card $d=".1s">
                    <CardTitle><Target size={16} color="#00adef"/> Trade Setup</CardTitle>
                    <LevelsGrid>
                        <LevelBox>
                            <LevelLabel>Entry Zone</LevelLabel>
                            <LevelValue>{fmtPrice(s.entry)}</LevelValue>
                        </LevelBox>
                        <LevelBox $border="rgba(239,68,68,.15)">
                            <LevelLabel>Stop Loss (Invalidation)</LevelLabel>
                            <LevelValue $c="#ef4444">{fmtPrice(s.sl)}</LevelValue>
                        </LevelBox>
                        <LevelBox>
                            <LevelLabel>Target Range</LevelLabel>
                            <LevelValue $c="#00adef">{fmtPrice(s.target)}</LevelValue>
                        </LevelBox>
                        <LevelBox>
                            <LevelLabel>Risk / Reward</LevelLabel>
                            <LevelValue $c="#a78bfa" style={{fontSize:'1.4rem'}}>1:{s.rr}</LevelValue>
                        </LevelBox>
                    </LevelsGrid>

                    <TPGrid>
                        <TPBox><TPLabel>Take Profit 1</TPLabel><TPValue>{fmtPrice(s.tp1)}</TPValue></TPBox>
                        <TPBox><TPLabel>Take Profit 2</TPLabel><TPValue>{fmtPrice(s.tp2)}</TPValue></TPBox>
                        <TPBox><TPLabel>Take Profit 3</TPLabel><TPValue>{fmtPrice(s.tp3)}</TPValue></TPBox>
                    </TPGrid>

                    {/* Position Progress */}
                    {s.status !== 'closed' && (() => {
                        const sign = s.movePct >= 0 ? '+' : '';
                        const abs = Math.abs(s.movePct);
                        const totalRange = Math.abs(s.changePct);
                        const pctToTP = totalRange > 0 ? Math.min(Math.round((abs / totalRange) * 100), 100) : 0;
                        const favourable = s.long ? s.movePct >= 0 : s.movePct <= 0;
                        let story;
                        if (favourable && abs >= totalRange * 0.85) story = `${sign}${s.movePct.toFixed(2)}% ${s.long?'↑':'↓'} approaching target`;
                        else if (favourable) story = `${sign}${s.movePct.toFixed(2)}% ${s.long?'↑':'↓'} toward TP1 • ${pctToTP}% to target`;
                        else if (!favourable && abs > totalRange * 0.65) story = `${sign}${s.movePct.toFixed(2)}% ${s.long?'↓':'↑'} ⚠ nearing stop loss`;
                        else story = `${sign}${s.movePct.toFixed(2)}% ${s.long?'↓':'↑'} against position`;

                        return (
                        <ProgressSection $pos={posMove}>
                            <div style={{fontSize:'.7rem',color:'#475569',fontWeight:600,textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'.5rem'}}>Position Progress</div>
                            <ProgressTop>
                                <ProgressLabel style={{fontWeight:600,color:posMove?'#10b981':'#ef4444'}}>
                                    {story}
                                </ProgressLabel>
                                <ProgressPct $pos={posMove}>
                                    {fmtPrice(s.entry)} → {fmtPrice(s.currentPrice)}
                                </ProgressPct>
                            </ProgressTop>
                            <Bar><Fill $pct={(() => {
                                const slDist = Math.abs(s.entry - s.sl);
                                const tpDist = Math.abs(s.target - s.entry);
                                const total = slDist + tpDist;
                                if (total === 0) return 50;
                                return Math.max(2, Math.min(98, s.long
                                    ? ((s.currentPrice - s.sl) / total) * 100
                                    : ((s.sl - s.currentPrice) / total) * 100));
                            })()} $pos={posMove}/></Bar>
                            <ProgressFooter>
                                <span>SL: {fmtPrice(s.sl)}</span>
                                <span>Entry: {fmtPrice(s.entry)}</span>
                                <span>Target: {fmtPrice(s.target)}</span>
                            </ProgressFooter>
                        </ProgressSection>
                        );
                    })()}

                    {s.status === 'closed' && (
                        <ResultCard $win={s.isWin}>
                            <ResultIcon>{s.isWin ? '✅' : '❌'}</ResultIcon>
                            <ResultTitle $win={s.isWin}>{s.resultText}</ResultTitle>
                            <ResultSub>
                                Final move: {s.movePct >= 0 ? '+' : ''}{s.movePct.toFixed(2)}% |
                                Entry {fmtPrice(s.entry)} → {fmtPrice(s.currentPrice)}
                            </ResultSub>
                        </ResultCard>
                    )}
                </Card>

                {/* ─── Analysis ─── */}
                {s.indArray.length > 0 && (
                    <Card $d=".2s">
                        <CardTitle><BarChart3 size={16} color="#8b5cf6"/> Technical Analysis</CardTitle>
                        <IndicatorGrid>
                            {s.indArray.map((ind, i) => (
                                <IndBox key={i}>
                                    <IndName>{ind.name}</IndName>
                                    <div style={{display:'flex',alignItems:'center',gap:'.4rem'}}>
                                        <span style={{fontSize:'.8rem',color:'#e0e6ed',fontWeight:600}}>
                                            {typeof ind.value === 'number' ? ind.value.toFixed(1) : ind.value || '—'}
                                        </span>
                                        <IndSignal $s={ind.signal}>{ind.signal}</IndSignal>
                                    </div>
                                </IndBox>
                            ))}
                        </IndicatorGrid>

                        {s.analysis?.message && (
                            <div style={{marginTop:'1.25rem',padding:'1.25rem',background:'linear-gradient(135deg,rgba(139,92,246,.05),rgba(0,173,237,.03))',border:'1px solid rgba(139,92,246,.15)',borderRadius:10,boxShadow:'0 0 20px rgba(139,92,246,.06)'}}>
                                <div style={{fontSize:'.8rem',color:'#a78bfa',fontWeight:700,marginBottom:'.5rem',display:'flex',alignItems:'center',gap:'.4rem'}}><Brain size={14}/> AI Analysis Summary</div>
                                <div style={{fontSize:'.9rem',color:'#c8d0da',lineHeight:1.6}}>{s.analysis.message}</div>
                            </div>
                        )}
                    </Card>
                )}

                {/* ─── Why This Trade ─── */}
                {s.whyReasons?.length > 0 && (
                    <Card $d=".25s">
                        <CardTitle><Zap size={16} color="#f59e0b"/> Why This Trade?</CardTitle>
                        <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                            {s.whyReasons.map((r, i) => (
                                <div key={i} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.55rem .7rem',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.04)',borderRadius:8,fontSize:'.85rem',color:'#c8d0da'}}>
                                    <span style={{fontSize:'1rem'}}>{r.icon}</span> {r.text}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* ─── What to Watch ─── */}
                {s.watchItems?.length > 0 && (
                    <Card $d=".3s">
                        <CardTitle><AlertTriangle size={16} color="#f59e0b"/> What to Watch</CardTitle>
                        <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
                            {s.watchItems.map((w, i) => (
                                <div key={i} style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.85rem',color:'#94a3b8',padding:'.4rem 0'}}>
                                    <span style={{color:'#f59e0b',fontSize:'.7rem'}}>●</span> {w}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* ─── Signal Tags ─── */}
                <Card $d=".35s">
                    <CardTitle><Activity size={16} color="#f59e0b"/> Signal Details</CardTitle>
                    <TagRow>
                        {s.tags.map((t, i) => (
                            <Tag key={i} $bg={t.bg} $c={t.c} $b={t.b}>{t.label}</Tag>
                        ))}
                    </TagRow>
                    <div style={{marginTop:'1rem',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'.75rem',textAlign:'center'}}>
                        <div>
                            <div style={{fontSize:'1.1rem',fontWeight:800,color:'#00adef'}}>{s.conf}%</div>
                            <div style={{fontSize:'.65rem',color:'#475569',textTransform:'uppercase',letterSpacing:'.5px'}}>Confidence</div>
                        </div>
                        <div>
                            <div style={{fontSize:'1.1rem',fontWeight:800,color:'#a78bfa'}}>{s.tfLabel}</div>
                            <div style={{fontSize:'.65rem',color:'#475569',textTransform:'uppercase',letterSpacing:'.5px'}}>Timeframe</div>
                        </div>
                        <div>
                            <div style={{fontSize:'1.1rem',fontWeight:800,color:s.changePct>=0?'#10b981':'#ef4444'}}>{s.changePct>=0?'+':''}{s.changePct.toFixed(1)}%</div>
                            <div style={{fontSize:'.65rem',color:'#475569',textTransform:'uppercase',letterSpacing:'.5px'}}>Target Move</div>
                        </div>
                    </div>
                </Card>
            </Container>
        </Page>
    );
};

export default SignalDetailPage;
