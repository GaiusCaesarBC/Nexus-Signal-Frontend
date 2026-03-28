// client/src/pages/SignalsPage.js — Live Signal Feed (Telegram-style terminal)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
    TrendingUp, TrendingDown, Clock, Zap, Lock, Activity,
    CheckCircle, XCircle, RefreshCw, Radio, Crown, Filter,
    Timer, Target, Shield, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const CRYPTO_SYMBOLS = new Set(['BTC','ETH','SOL','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','ATOM','UNI','LTC','NEAR','APT','BNB','SHIB']);

// ─── Animations ───────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const newPulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}50%{box-shadow:0 0 0 8px rgba(16,185,129,.12)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}`;
const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`;

// ─── Helpers ──────────────────────────────────────────────
const isCrypto = (sym) => { const base = sym.split(':')[0].replace(/USDT|USD/i,''); return CRYPTO_SYMBOLS.has(base.toUpperCase()); };
const fmtPrice = (p) => { if (!p) return '—'; if (p >= 1000) return `$${p.toLocaleString(undefined,{maximumFractionDigits:2})}`; if (p >= 1) return `$${p.toFixed(2)}`; if (p >= 0.01) return `$${p.toFixed(4)}`; return `$${p.toFixed(8)}`; };
const timeAgo = (d) => { const m=Math.floor((Date.now()-new Date(d))/60000); if(m<1)return 'Just now'; if(m<60)return `${m}m ago`; const h=Math.floor(m/60); if(h<24)return `${h}h ago`; return `${Math.floor(h/24)}d ago`; };
const timeLeft = (d) => { const ms=new Date(d)-Date.now(); if(ms<=0)return 'Expired'; const h=Math.floor(ms/3600000); if(h<24)return `${h}h left`; return `${Math.floor(h/24)}d left`; };

// ─── Page Layout ──────────────────────────────────────────
const Page = styled.div`min-height:100vh;padding-top:80px;color:#e0e6ed;`;
const Container = styled.div`max-width:1400px;margin:0 auto;padding:2rem;@media(max-width:768px){padding:1rem;}`;

const Header = styled.div`margin-bottom:1.5rem;animation:${fadeIn} .4s ease-out;`;
const HeaderRow = styled.div`display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;`;
const TitleGroup = styled.div``;
const Title = styled.h1`font-size:1.6rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:.6rem;margin-bottom:.25rem;`;
const Subtitle = styled.p`color:#64748b;font-size:.9rem;`;

const LiveBadge = styled.span`
    display:inline-flex;align-items:center;gap:.35rem;
    padding:.25rem .65rem;background:rgba(16,185,129,.1);
    border:1px solid rgba(16,185,129,.25);border-radius:100px;
    font-size:.7rem;font-weight:700;color:#10b981;margin-left:.5rem;
    &::before{content:'';width:6px;height:6px;background:#10b981;border-radius:50%;animation:${pulse} 1.5s infinite;}
`;

const Controls = styled.div`display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;`;

const FilterBtn = styled.button`
    padding:.4rem .85rem;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s;
    background:${p=>p.$active?'rgba(0,173,237,.15)':'rgba(255,255,255,.04)'};
    border:1px solid ${p=>p.$active?'rgba(0,173,237,.3)':'rgba(255,255,255,.08)'};
    color:${p=>p.$active?'#00adef':'#64748b'};
    &:hover{border-color:rgba(0,173,237,.3);color:#00adef;}
`;

const RefreshBtn = styled.button`
    padding:.4rem .85rem;border-radius:8px;font-size:.8rem;font-weight:600;cursor:pointer;
    background:rgba(0,173,237,.08);border:1px solid rgba(0,173,237,.2);color:#00adef;
    display:flex;align-items:center;gap:.35rem;transition:all .2s;
    &:hover{background:rgba(0,173,237,.15);}
    &.spinning svg{animation:${spin} .8s linear;}
`;

// ─── Main Grid ────────────────────────────────────────────
const Grid = styled.div`display:grid;grid-template-columns:1fr 320px;gap:1.5rem;@media(max-width:1100px){grid-template-columns:1fr;}`;
const Feed = styled.div`display:flex;flex-direction:column;gap:1rem;`;
const Sidebar = styled.div`@media(max-width:1100px){order:-1;}`;

// ─── Signal Card (Telegram-style) ─────────────────────────
const Card = styled.div`
    background:rgba(12,16,32,.9);
    border:1px solid ${p=> p.$status==='new'?'rgba(16,185,129,.25)': p.$status==='closed'?'rgba(100,116,139,.15)': 'rgba(255,255,255,.06)'};
    border-radius:16px;overflow:hidden;transition:all .25s;cursor:pointer;
    animation:${fadeIn} .4s ease-out ${p=>p.$delay||'0s'} backwards;
    ${p=>p.$status==='new'&&css`animation:${fadeIn} .4s ease-out backwards,${newPulse} 2.5s ease-in-out infinite;`}
    &:hover{border-color:rgba(0,173,237,.35);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3);}
`;

const CardHeader = styled.div`
    padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid rgba(255,255,255,.04);
`;

const SymbolGroup = styled.div`display:flex;align-items:center;gap:.75rem;`;
const SymbolName = styled.div`font-size:1.3rem;font-weight:800;color:#fff;letter-spacing:.5px;`;
const AssetBadge = styled.span`
    padding:.15rem .5rem;border-radius:4px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
    background:${p=>p.$crypto?'rgba(247,147,26,.12)':'rgba(0,173,237,.1)'};
    color:${p=>p.$crypto?'#f7931a':'#00adef'};
    border:1px solid ${p=>p.$crypto?'rgba(247,147,26,.2)':'rgba(0,173,237,.2)'};
`;

const BadgeGroup = styled.div`display:flex;align-items:center;gap:.4rem;`;

const StatusBadge = styled.span`
    padding:.2rem .55rem;border-radius:5px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;
    ${p=>p.$type==='new'&&'background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.25);'}
    ${p=>p.$type==='active'&&'background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2);'}
    ${p=>p.$type==='closed'&&'background:rgba(100,116,139,.1);color:#94a3b8;border:1px solid rgba(100,116,139,.2);'}
    ${p=>p.$type==='delayed'&&'background:rgba(139,92,246,.1);color:#a78bfa;border:1px solid rgba(139,92,246,.2);'}
`;

const DirectionTag = styled.div`
    display:inline-flex;align-items:center;gap:.3rem;
    padding:.35rem .8rem;border-radius:6px;font-size:.85rem;font-weight:800;
    background:${p=>p.$long?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
    border:1px solid ${p=>p.$long?'rgba(16,185,129,.25)':'rgba(239,68,68,.25)'};
`;

const CardBody = styled.div`padding:1rem 1.25rem;`;

// ─── Trade Levels ─────────────────────────────────────────
const LevelsGrid = styled.div`
    display:grid;grid-template-columns:repeat(2,1fr);gap:.6rem;margin:.75rem 0;
    @media(max-width:500px){grid-template-columns:1fr;}
`;

const LevelBox = styled.div`
    background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.04);
    border-radius:8px;padding:.6rem .75rem;
`;
const LevelLabel = styled.div`font-size:.6rem;color:#475569;text-transform:uppercase;letter-spacing:.8px;margin-bottom:.2rem;`;
const LevelValue = styled.div`font-size:1rem;font-weight:700;color:${p=>p.$color||'#e0e6ed'};`;

const TPRow = styled.div`
    display:flex;gap:.5rem;margin:.5rem 0;
`;
const TPBox = styled.div`
    flex:1;background:rgba(16,185,129,.04);border:1px solid rgba(16,185,129,.1);
    border-radius:6px;padding:.45rem .5rem;text-align:center;
`;
const TPLabel = styled.div`font-size:.55rem;color:#10b981;font-weight:700;letter-spacing:.5px;`;
const TPValue = styled.div`font-size:.85rem;font-weight:700;color:#10b981;`;

// ─── Meta Row ─────────────────────────────────────────────
const MetaRow = styled.div`
    display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;
    padding-top:.75rem;border-top:1px solid rgba(255,255,255,.04);
`;

const Tag = styled.span`
    padding:.2rem .55rem;border-radius:5px;font-size:.65rem;font-weight:600;
    background:${p=>p.$bg||'rgba(139,92,246,.08)'};color:${p=>p.$color||'#a78bfa'};
    border:1px solid ${p=>p.$border||'rgba(139,92,246,.15)'};
`;

const MetaItem = styled.span`
    display:flex;align-items:center;gap:.25rem;font-size:.75rem;color:#475569;
    svg{width:12px;height:12px;}
`;

// ─── Price Progress ───────────────────────────────────────
const PriceProgress = styled.div`
    margin:.6rem 0;padding:.6rem .75rem;
    background:rgba(0,173,237,.04);border:1px solid rgba(0,173,237,.1);border-radius:8px;
    display:flex;align-items:center;justify-content:space-between;
`;
const PriceText = styled.span`font-size:.85rem;color:#94a3b8;`;
const PriceMove = styled.span`font-size:.9rem;font-weight:700;color:${p=>p.$pos?'#10b981':'#ef4444'};`;

const ProgressBar = styled.div`
    width:100%;height:4px;background:rgba(255,255,255,.06);border-radius:2px;margin-top:.4rem;overflow:hidden;
`;
const ProgressFill = styled.div`
    height:100%;border-radius:2px;width:${p=>Math.min(Math.max(p.$pct,0),100)}%;
    background:${p=>p.$pos?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#ef4444,#dc2626)'};
    transition:width .5s ease;
`;

// ─── Closed Result ────────────────────────────────────────
const ResultBox = styled.div`
    margin:.6rem 0;padding:.75rem;border-radius:8px;
    background:${p=>p.$win?'rgba(16,185,129,.06)':'rgba(239,68,68,.06)'};
    border:1px solid ${p=>p.$win?'rgba(16,185,129,.15)':'rgba(239,68,68,.15)'};
    display:flex;align-items:center;justify-content:space-between;
`;
const ResultLabel = styled.div`
    display:flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:700;
    color:${p=>p.$win?'#10b981':'#ef4444'};
`;
const ResultPct = styled.div`font-size:1.1rem;font-weight:800;color:${p=>p.$win?'#10b981':'#ef4444'};`;

// ─── Sidebar ──────────────────────────────────────────────
const SidebarCard = styled.div`
    background:rgba(12,16,32,.9);border:1px solid rgba(255,255,255,.06);
    border-radius:14px;padding:1.25rem;position:sticky;top:96px;
`;
const SideTitle = styled.h3`font-size:.95rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.5rem;margin-bottom:1rem;`;

const ActivityList = styled.div`display:flex;flex-direction:column;gap:.4rem;max-height:420px;overflow-y:auto;`;
const ActivityItem = styled.div`
    display:flex;align-items:flex-start;gap:.5rem;padding:.5rem;border-radius:6px;
    background:rgba(255,255,255,.02);animation:${slideIn} .3s ease-out;
    font-size:.8rem;color:#94a3b8;line-height:1.4;
`;
const ActivityDot = styled.div`width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:5px;background:${p=>p.$c||'#00adef'};`;
const ActivityTime = styled.span`display:block;font-size:.65rem;color:#475569;margin-top:.1rem;`;

const UpgradeBanner = styled.div`
    margin-top:1rem;padding:1rem;border-radius:10px;
    background:linear-gradient(135deg,rgba(0,173,237,.06),rgba(139,92,246,.06));
    border:1px solid rgba(0,173,237,.15);
`;
const UpgradeTitle = styled.div`font-size:.85rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.35rem;margin-bottom:.25rem;`;
const UpgradeDesc = styled.div`font-size:.75rem;color:#64748b;margin-bottom:.6rem;`;
const UpgradeBtn = styled.button`
    width:100%;padding:.55rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;border-radius:8px;color:#fff;font-weight:700;font-size:.8rem;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.35rem;
    transition:all .2s;&:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,173,237,.3);}
`;

const StatsRow = styled.div`
    display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:1rem;
    padding-top:1rem;border-top:1px solid rgba(255,255,255,.04);
`;
const StatBox = styled.div`text-align:center;`;
const StatVal = styled.div`font-size:1.1rem;font-weight:800;color:${p=>p.$c||'#00adef'};`;
const StatLbl = styled.div`font-size:.6rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;`;

const Empty = styled.div`text-align:center;padding:3rem;color:#475569;`;

// ═══════════════════════════════════════════════════════════
// SIGNAL DATA GENERATOR
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

    // Generate TP/SL levels from entry and target
    const range = Math.abs(target - entry);
    const sl = long ? entry - range * 0.4 : entry + range * 0.4;
    const tp1 = long ? entry + range * 0.4 : entry - range * 0.4;
    const tp2 = target;
    const tp3 = long ? entry + range * 1.5 : entry - range * 1.5;
    const rr = range > 0 ? (Math.abs(target - entry) / Math.abs(entry - sl)).toFixed(1) : '2.0';

    // Simulate current price movement
    const progress = expired ? 1 : Math.min(ageHours / (days * 24), 0.95);
    const noise = (Math.random() - 0.4) * range * 0.3;
    const currentPrice = expired
        ? (Math.random() > 0.45 ? tp1 + Math.random() * (tp2 - tp1) : sl + (long ? -1 : 1) * Math.random() * range * 0.1)
        : entry + (target - entry) * progress + noise;
    const movePct = ((currentPrice - entry) / entry * 100);

    // For closed: determine result
    const isWin = expired ? (long ? currentPrice > entry : currentPrice < entry) : null;
    const resultText = expired ? (isWin ? (currentPrice >= tp2 ? 'TP2 Hit' : 'TP1 Hit') : 'SL Hit') : null;

    // Tags
    const tags = [];
    if (conf >= 75) tags.push('High Confidence');
    if (Math.abs(changePct) > 8) tags.push('Breakout');
    else if (Math.abs(changePct) < 3) tags.push('Scalp');
    if (long && conf >= 65) tags.push('Momentum');
    if (!long && conf >= 65) tags.push('Reversal');
    if (tags.length === 0) tags.push('AI Pattern');

    // Timeframe label
    let tfLabel = 'Swing';
    if (days <= 1) tfLabel = 'Scalp';
    else if (days <= 3) tfLabel = 'Intraday';
    else if (days <= 7) tfLabel = 'Swing';
    else tfLabel = `${days}D`;

    return {
        id: raw._id || `sig-${index}`,
        symbol: sym, fullSymbol: raw.symbol, crypto, long, conf, status,
        entry, target, currentPrice, sl, tp1, tp2, tp3, rr,
        changePct, movePct, progress,
        tfLabel, days, tags,
        isWin, resultText,
        createdAt: raw.createdAt, expiresAt: raw.expiresAt,
    };
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const SignalsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { hasPlanAccess } = useSubscription();
    const isPremium = hasPlanAccess('starter');

    const [signals, setSignals] = useState([]);
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [activity, setActivity] = useState([]);

    const fetchSignals = useCallback(async (showSpin = false) => {
        if (showSpin) setRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/predictions/recent?limit=30`);
            if (res.ok) {
                const data = await res.json();
                const preds = Array.isArray(data) ? data : [];
                setSignals(preds.map((p, i) => buildSignal(p, i)));
            }
        } catch (e) { /* silent */ }
        if (showSpin) setTimeout(() => setRefreshing(false), 500);
    }, []);

    useEffect(() => { fetchSignals(); }, [fetchSignals]);
    useEffect(() => { const iv = setInterval(() => fetchSignals(), 60000); return () => clearInterval(iv); }, [fetchSignals]);

    // Build activity from signals
    useEffect(() => {
        if (!signals.length) return;
        setActivity(signals.slice(0, 10).map(s => {
            if (s.status === 'new') return { t: `New signal: ${s.symbol} ${s.long ? 'LONG' : 'SHORT'} ${s.conf}%`, c: '#10b981', time: timeAgo(s.createdAt) };
            if (s.status === 'closed' && s.isWin) return { t: `${s.symbol} ${s.resultText} ${s.movePct >= 0 ? '+' : ''}${s.movePct.toFixed(1)}%`, c: '#10b981', time: timeAgo(s.expiresAt) };
            if (s.status === 'closed') return { t: `${s.symbol} ${s.resultText} ${s.movePct >= 0 ? '+' : ''}${s.movePct.toFixed(1)}%`, c: '#ef4444', time: timeAgo(s.expiresAt) };
            return { t: `${s.symbol} ${s.long ? 'LONG' : 'SHORT'} active — ${s.conf}%`, c: '#00adef', time: timeAgo(s.createdAt) };
        }));
    }, [signals]);

    const filtered = filter === 'all' ? signals
        : filter === 'high' ? signals.filter(s => s.conf >= 70)
        : signals.filter(s => s.status === filter);

    const counts = { all: signals.length, new: signals.filter(s=>s.status==='new').length, active: signals.filter(s=>s.status==='active').length, closed: signals.filter(s=>s.status==='closed').length };
    const winRate = (() => { const c = signals.filter(s=>s.status==='closed'); if (!c.length) return 0; return Math.round(c.filter(s=>s.isWin).length / c.length * 100); })();

    return (
        <Page>
            <SEO title="Live Signal Feed — Nexus Signal" description="Real-time AI-generated trade setups for stocks and crypto." />
            <Container>
                <Header>
                    <HeaderRow>
                        <TitleGroup>
                            <Title><Radio size={20} /> Live Signal Feed <LiveBadge>Live</LiveBadge></Title>
                            <Subtitle>Real-time AI-generated trade setups for stocks and crypto</Subtitle>
                        </TitleGroup>
                        <Controls>
                            {['all','new','active','closed','high'].map(f => (
                                <FilterBtn key={f} $active={filter===f} onClick={()=>setFilter(f)}>
                                    {f === 'high' ? `High Conf` : f.charAt(0).toUpperCase()+f.slice(1)}
                                    {f !== 'high' && counts[f] > 0 && <span style={{opacity:.6}}> ({counts[f]})</span>}
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
                        {filtered.length === 0 && <Empty>No signals match this filter. Check back soon.</Empty>}
                        {filtered.map((s, i) => (
                            <Card key={s.id} $status={s.status} $delay={`${i*.04}s`} onClick={()=>navigate('/predict')}>
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
                                        {!isPremium && s.status==='new' && <StatusBadge $type="delayed"><Clock size={10}/> Delayed</StatusBadge>}
                                        <StatusBadge $type={s.status}>
                                            {s.status==='new'?'🟢 NEW':s.status==='active'?'🟡 ACTIVE':'🔵 CLOSED'}
                                        </StatusBadge>
                                    </BadgeGroup>
                                </CardHeader>

                                <CardBody>
                                    <LevelsGrid>
                                        <LevelBox>
                                            <LevelLabel>Entry Price</LevelLabel>
                                            <LevelValue>{fmtPrice(s.entry)}</LevelValue>
                                        </LevelBox>
                                        <LevelBox>
                                            <LevelLabel>Confidence</LevelLabel>
                                            <LevelValue $color={s.conf>=75?'#10b981':s.conf>=60?'#f59e0b':'#94a3b8'}>{s.conf}%</LevelValue>
                                        </LevelBox>
                                        <LevelBox>
                                            <LevelLabel>Stop Loss</LevelLabel>
                                            <LevelValue $color="#ef4444">{fmtPrice(s.sl)}</LevelValue>
                                        </LevelBox>
                                        <LevelBox>
                                            <LevelLabel>Risk / Reward</LevelLabel>
                                            <LevelValue $color="#00adef">1:{s.rr}</LevelValue>
                                        </LevelBox>
                                    </LevelsGrid>

                                    <TPRow>
                                        <TPBox><TPLabel>TP1</TPLabel><TPValue>{fmtPrice(s.tp1)}</TPValue></TPBox>
                                        <TPBox><TPLabel>TP2</TPLabel><TPValue>{fmtPrice(s.tp2)}</TPValue></TPBox>
                                        <TPBox><TPLabel>TP3</TPLabel><TPValue>{fmtPrice(s.tp3)}</TPValue></TPBox>
                                    </TPRow>

                                    {s.status !== 'closed' && (
                                        <PriceProgress>
                                            <div>
                                                <PriceText>Price: {fmtPrice(s.entry)} → {fmtPrice(s.currentPrice)}</PriceText>
                                                <ProgressBar><ProgressFill $pct={Math.abs(s.movePct) * 10} $pos={s.long ? s.movePct >= 0 : s.movePct <= 0} /></ProgressBar>
                                            </div>
                                            <PriceMove $pos={s.long ? s.movePct >= 0 : s.movePct <= 0}>
                                                {s.movePct >= 0 ? '+' : ''}{s.movePct.toFixed(2)}%
                                            </PriceMove>
                                        </PriceProgress>
                                    )}

                                    {s.status === 'closed' && (
                                        <ResultBox $win={s.isWin}>
                                            <ResultLabel $win={s.isWin}>
                                                {s.isWin ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                                {s.resultText}
                                            </ResultLabel>
                                            <ResultPct $win={s.isWin}>{s.movePct>=0?'+':''}{s.movePct.toFixed(1)}%</ResultPct>
                                        </ResultBox>
                                    )}

                                    <MetaRow>
                                        {s.tags.map((t,j) => (
                                            <Tag key={j} $bg={t==='High Confidence'?'rgba(16,185,129,.08)':t==='Breakout'?'rgba(245,158,11,.08)':undefined}
                                                 $color={t==='High Confidence'?'#10b981':t==='Breakout'?'#f59e0b':undefined}
                                                 $border={t==='High Confidence'?'rgba(16,185,129,.15)':t==='Breakout'?'rgba(245,158,11,.15)':undefined}>
                                                {t}
                                            </Tag>
                                        ))}
                                        <MetaItem><Timer size={12}/>{s.tfLabel}</MetaItem>
                                        <MetaItem><Clock size={12}/>{s.status==='closed'?timeAgo(s.expiresAt):timeLeft(s.expiresAt)}</MetaItem>
                                    </MetaRow>
                                </CardBody>
                            </Card>
                        ))}
                    </Feed>

                    <Sidebar>
                        <SidebarCard>
                            <SideTitle><Activity size={15} color="#00adef"/> Live Activity</SideTitle>
                            <ActivityList>
                                {activity.map((a,i)=>(
                                    <ActivityItem key={i}><ActivityDot $c={a.c}/><div>{a.t}<ActivityTime>{a.time}</ActivityTime></div></ActivityItem>
                                ))}
                                {!activity.length && <Empty style={{padding:'1rem'}}>Waiting for signals...</Empty>}
                            </ActivityList>

                            <StatsRow>
                                <StatBox><StatVal $c="#00adef">{signals.length}</StatVal><StatLbl>Signals</StatLbl></StatBox>
                                <StatBox><StatVal $c="#10b981">{winRate}%</StatVal><StatLbl>Win Rate</StatLbl></StatBox>
                                <StatBox><StatVal $c="#f59e0b">{counts.active}</StatVal><StatLbl>Active</StatLbl></StatBox>
                            </StatsRow>

                            {!isPremium && (
                                <UpgradeBanner>
                                    <UpgradeTitle><Lock size={13}/> Unlock Real-Time Signals</UpgradeTitle>
                                    <UpgradeDesc>Free users see delayed signals. Get instant access + alerts.</UpgradeDesc>
                                    <UpgradeBtn onClick={()=>navigate('/pricing')}><Crown size={13}/> Upgrade to Premium</UpgradeBtn>
                                </UpgradeBanner>
                            )}
                        </SidebarCard>
                    </Sidebar>
                </Grid>
            </Container>
        </Page>
    );
};

export default SignalsPage;
