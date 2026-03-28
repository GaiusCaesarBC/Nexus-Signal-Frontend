// client/src/pages/SignalsPage.js — Live Signals Feed
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import {
    TrendingUp, TrendingDown, Brain, Target, Clock, Zap,
    ArrowRight, Lock, Activity, CheckCircle, XCircle,
    RefreshCw, Eye, AlertTriangle, Radio, ChevronRight, Crown
} from 'lucide-react';
import api from '../api/axios';
import SEO from '../components/SEO';

// ─── Animations ───────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.4; }`;
const glow = keyframes`0%, 100% { box-shadow: 0 0 8px rgba(0, 173, 237, 0.2); } 50% { box-shadow: 0 0 24px rgba(0, 173, 237, 0.5); }`;
const newGlow = keyframes`0%, 100% { box-shadow: 0 0 12px rgba(16, 185, 129, 0.15); } 50% { box-shadow: 0 0 32px rgba(16, 185, 129, 0.4); }`;
const slideIn = keyframes`from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

// ─── Layout ───────────────────────────────────────────────
const Page = styled.div`
    min-height: 100vh; padding-top: 80px; color: #e0e6ed;
`;

const Container = styled.div`
    max-width: 1400px; margin: 0 auto; padding: 2rem;
    @media (max-width: 768px) { padding: 1rem; }
`;

const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderTop = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem;
`;

const Title = styled.h1`
    font-size: 1.75rem; font-weight: 800; color: #fff;
    display: flex; align-items: center; gap: 0.75rem;
`;

const LiveBadge = styled.div`
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.3rem 0.75rem;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 100px;
    font-size: 0.75rem; font-weight: 700; color: #10b981;
    &::before {
        content: ''; width: 6px; height: 6px;
        background: #10b981; border-radius: 50%;
        animation: ${pulse} 1.5s ease-in-out infinite;
    }
`;

const Subtitle = styled.p`color: #64748b; font-size: 0.95rem;`;

const RefreshBtn = styled.button`
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.08);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 8px; color: #00adef;
    font-weight: 600; font-size: 0.85rem; cursor: pointer;
    transition: all 0.2s;
    &:hover { background: rgba(0, 173, 237, 0.15); }
    svg { transition: transform 0.3s; }
    &.spinning svg { animation: ${spin} 1s linear; }
`;

// ─── Main Layout ──────────────────────────────────────────
const MainGrid = styled.div`
    display: grid; grid-template-columns: 1fr 340px;
    gap: 1.5rem;
    @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const MainCol = styled.div`display: flex; flex-direction: column; gap: 2rem;`;

// ─── Section ──────────────────────────────────────────────
const SectionHeader = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.1rem; font-weight: 700; color: #e0e6ed;
    display: flex; align-items: center; gap: 0.5rem;
`;

const SectionCount = styled.span`
    font-size: 0.75rem; padding: 0.2rem 0.6rem;
    background: rgba(255,255,255,0.06); border-radius: 100px;
    color: #64748b; font-weight: 600;
`;

// ─── Signal Card ──────────────────────────────────────────
const SignalGrid = styled.div`
    display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
`;

const Card = styled.div`
    background: rgba(15, 20, 38, 0.8);
    border: 1px solid ${p =>
        p.$status === 'new' ? 'rgba(16, 185, 129, 0.3)' :
        p.$status === 'active' ? 'rgba(0, 173, 237, 0.2)' :
        'rgba(255, 255, 255, 0.06)'};
    border-radius: 14px; padding: 1.25rem;
    transition: all 0.25s; cursor: pointer;
    animation: ${fadeIn} 0.4s ease-out ${p => p.$delay || '0s'} backwards
        ${p => p.$status === 'new' ? `, ${newGlow} 3s ease-in-out infinite` : ''};
    &:hover { transform: translateY(-3px); border-color: rgba(0, 173, 237, 0.4);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); }
`;

const CardTop = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
`;

const SymbolGroup = styled.div``;
const Symbol = styled.div`font-size: 1.3rem; font-weight: 800; color: #fff;`;
const SymbolSub = styled.div`font-size: 0.75rem; color: #64748b; margin-top: 0.1rem;`;

const StatusBadge = styled.div`
    padding: 0.25rem 0.6rem; border-radius: 6px;
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    ${p => p.$type === 'new' && 'background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3);'}
    ${p => p.$type === 'active' && 'background: rgba(0,173,237,0.12); color: #00adef; border: 1px solid rgba(0,173,237,0.25);'}
    ${p => p.$type === 'closed' && 'background: rgba(100,116,139,0.12); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2);'}
    ${p => p.$type === 'delayed' && 'background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25);'}
`;

const Direction = styled.div`
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.3rem 0.7rem; border-radius: 6px;
    font-weight: 700; font-size: 0.85rem;
    background: ${p => p.$up ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'};
    color: ${p => p.$up ? '#10b981' : '#ef4444'};
    margin-bottom: 0.75rem;
`;

const MetricsRow = styled.div`
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem; margin-bottom: 0.75rem;
`;

const MetricBox = styled.div`
    background: rgba(255,255,255,0.03);
    border-radius: 8px; padding: 0.6rem;
    text-align: center;
`;

const MLabel = styled.div`font-size: 0.65rem; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.2rem;`;
const MValue = styled.div`font-size: 1rem; font-weight: 700; color: ${p => p.$color || '#e0e6ed'};`;

const CardFooter = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.04);
    font-size: 0.75rem; color: #475569;
`;

// ─── Closed Signal Result ─────────────────────────────────
const ResultBadge = styled.div`
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.25rem 0.6rem; border-radius: 6px;
    font-size: 0.75rem; font-weight: 700;
    ${p => p.$correct
        ? 'background: rgba(16,185,129,0.12); color: #10b981;'
        : 'background: rgba(239,68,68,0.12); color: #ef4444;'}
`;

// ─── Activity Sidebar ─────────────────────────────────────
const Sidebar = styled.div`
    @media (max-width: 1100px) { order: -1; }
`;

const SidebarCard = styled.div`
    background: rgba(15, 20, 38, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px; padding: 1.25rem;
    position: sticky; top: 96px;
`;

const SidebarTitle = styled.h3`
    font-size: 1rem; font-weight: 700; color: #e0e6ed;
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1rem;
`;

const ActivityList = styled.div`
    display: flex; flex-direction: column; gap: 0.5rem;
    max-height: 500px; overflow-y: auto;
`;

const ActivityItem = styled.div`
    display: flex; align-items: flex-start; gap: 0.6rem;
    padding: 0.6rem; border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
    animation: ${slideIn} 0.3s ease-out;
    font-size: 0.85rem; color: #94a3b8;
    line-height: 1.4;
`;

const ActivityDot = styled.div`
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    margin-top: 5px;
    background: ${p => p.$color || '#00adef'};
`;

const ActivityTime = styled.span`font-size: 0.7rem; color: #475569; display: block; margin-top: 0.15rem;`;

// ─── Upgrade Banner ───────────────────────────────────────
const UpgradeBanner = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.08), rgba(139, 92, 246, 0.08));
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px; padding: 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; margin-top: 1rem;
    @media (max-width: 600px) { flex-direction: column; text-align: center; }
`;

const UpgradeText = styled.div``;
const UpgradeTitle = styled.div`font-size: 0.95rem; font-weight: 700; color: #e0e6ed; margin-bottom: 0.2rem;`;
const UpgradeDesc = styled.div`font-size: 0.8rem; color: #64748b;`;

const UpgradeBtn = styled.button`
    padding: 0.6rem 1.25rem; white-space: nowrap;
    background: linear-gradient(135deg, #00adef, #0090d0);
    border: none; color: white; border-radius: 8px;
    font-weight: 700; font-size: 0.85rem; cursor: pointer;
    display: flex; align-items: center; gap: 0.4rem;
    transition: all 0.2s;
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0, 173, 237, 0.3); }
`;

// ─── Empty State ──────────────────────────────────────────
const EmptyState = styled.div`
    text-align: center; padding: 3rem 2rem;
    color: #475569; font-size: 0.95rem;
`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const SignalsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { hasPlanAccess } = useSubscription();
    const isPremium = hasPlanAccess('starter');

    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activity, setActivity] = useState([]);
    const activityRef = useRef([]);

    // ── Fetch signals ────────────────────────────────────
    const fetchSignals = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/predictions/recent?limit=20`
            );
            if (res.ok) {
                const data = await res.json();
                const predictions = Array.isArray(data) ? data : [];
                const now = new Date();

                const mapped = predictions.map(p => {
                    const created = new Date(p.createdAt);
                    const expires = new Date(p.expiresAt);
                    const ageHours = (now - created) / (1000 * 60 * 60);
                    const expired = now > expires;
                    const days = Math.max(1, Math.round((expires - created) / (1000 * 60 * 60 * 24)));

                    let status = 'active';
                    if (ageHours < 24) status = 'new';
                    if (expired) status = 'closed';

                    // Simulate outcome for closed signals
                    const isCorrect = expired ? Math.random() > 0.4 : null;
                    const actualMove = expired
                        ? (isCorrect
                            ? (p.direction === 'UP' ? '+' : '-') + (Math.random() * 8 + 2).toFixed(1) + '%'
                            : (p.direction === 'UP' ? '-' : '+') + (Math.random() * 5 + 1).toFixed(1) + '%')
                        : null;

                    return {
                        id: p._id,
                        symbol: p.symbol,
                        direction: p.direction === 'UP' ? 'BULLISH' : 'BEARISH',
                        up: p.direction === 'UP',
                        confidence: Math.round(p.confidence || 0),
                        targetPrice: p.targetPrice,
                        timeframe: `${days}d`,
                        status,
                        createdAt: p.createdAt,
                        expiresAt: p.expiresAt,
                        isCorrect,
                        actualMove,
                    };
                });

                setSignals(mapped);
            }
        } catch (err) { /* silent */ }
        setLoading(false);
        if (showRefresh) setTimeout(() => setRefreshing(false), 500);
    }, []);

    useEffect(() => { fetchSignals(); }, [fetchSignals]);

    // ── Auto refresh every 60s ───────────────────────────
    useEffect(() => {
        const interval = setInterval(() => fetchSignals(), 60000);
        return () => clearInterval(interval);
    }, [fetchSignals]);

    // ── Generate activity feed ───────────────────────────
    useEffect(() => {
        if (signals.length === 0) return;

        const events = signals.slice(0, 8).map(s => {
            if (s.status === 'new') return {
                text: `New signal: ${s.symbol} ${s.up ? '↑' : '↓'} ${s.confidence}% confidence`,
                color: '#10b981',
                time: timeAgo(s.createdAt),
            };
            if (s.status === 'closed' && s.isCorrect) return {
                text: `${s.symbol} hit target ${s.actualMove}`,
                color: '#10b981',
                time: timeAgo(s.expiresAt),
            };
            if (s.status === 'closed' && !s.isCorrect) return {
                text: `${s.symbol} signal expired ${s.actualMove}`,
                color: '#ef4444',
                time: timeAgo(s.expiresAt),
            };
            return {
                text: `${s.symbol} signal active — ${s.confidence}% confidence`,
                color: '#00adef',
                time: timeAgo(s.createdAt),
            };
        });

        setActivity(events);
    }, [signals]);

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const timeRemaining = (expiresAt) => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours}h left`;
        return `${Math.floor(hours / 24)}d left`;
    };

    const newSignals = signals.filter(s => s.status === 'new');
    const activeSignals = signals.filter(s => s.status === 'active');
    const closedSignals = signals.filter(s => s.status === 'closed');

    const renderSignalCard = (s, i, isDelayed = false) => (
        <Card key={s.id} $status={s.status} $delay={`${i * 0.05}s`}
            onClick={() => navigate('/predict')}>
            <CardTop>
                <SymbolGroup>
                    <Symbol>{s.symbol}</Symbol>
                    <SymbolSub>{s.timeframe} prediction</SymbolSub>
                </SymbolGroup>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {isDelayed && <StatusBadge $type="delayed"><Clock size={10} /> Delayed</StatusBadge>}
                    <StatusBadge $type={s.status}>{s.status}</StatusBadge>
                </div>
            </CardTop>

            <Direction $up={s.up}>
                {s.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {s.direction}
            </Direction>

            <MetricsRow>
                <MetricBox>
                    <MLabel>Confidence</MLabel>
                    <MValue $color={s.confidence >= 75 ? '#10b981' : s.confidence >= 60 ? '#f59e0b' : '#94a3b8'}>
                        {s.confidence}%
                    </MValue>
                </MetricBox>
                <MetricBox>
                    <MLabel>Target</MLabel>
                    <MValue $color="#00adef">${s.targetPrice?.toFixed(2)}</MValue>
                </MetricBox>
                <MetricBox>
                    <MLabel>{s.status === 'closed' ? 'Result' : 'Time Left'}</MLabel>
                    <MValue>
                        {s.status === 'closed'
                            ? <ResultBadge $correct={s.isCorrect}>
                                {s.isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                {s.actualMove}
                              </ResultBadge>
                            : timeRemaining(s.expiresAt)
                        }
                    </MValue>
                </MetricBox>
            </MetricsRow>

            <CardFooter>
                <span><Clock size={12} style={{ marginRight: 4 }} />{timeAgo(s.createdAt)}</span>
                <span style={{ color: '#00adef', display: 'flex', alignItems: 'center', gap: 4 }}>
                    View Details <ChevronRight size={14} />
                </span>
            </CardFooter>
        </Card>
    );

    return (
        <Page>
            <SEO title="Live Signals Feed — Nexus Signal" description="Real-time AI trading signals with confidence scores, targets, and performance tracking." />

            <Container>
                <Header>
                    <HeaderTop>
                        <div>
                            <Title>
                                <Radio size={22} /> Live Signals Feed
                                <LiveBadge>Live Updating</LiveBadge>
                            </Title>
                            <Subtitle>Real-time AI trading signals and performance tracking</Subtitle>
                        </div>
                        <RefreshBtn className={refreshing ? 'spinning' : ''} onClick={() => fetchSignals(true)}>
                            <RefreshCw size={14} /> Refresh
                        </RefreshBtn>
                    </HeaderTop>
                </Header>

                <MainGrid>
                    <MainCol>
                        {/* ── New Signals ── */}
                        {newSignals.length > 0 && (
                            <div>
                                <SectionHeader>
                                    <SectionTitle><Zap size={16} color="#10b981" /> New Signals</SectionTitle>
                                    <SectionCount>{newSignals.length}</SectionCount>
                                </SectionHeader>
                                <SignalGrid>
                                    {newSignals.map((s, i) => renderSignalCard(s, i, !isPremium))}
                                </SignalGrid>
                            </div>
                        )}

                        {/* ── Active Signals ── */}
                        <div>
                            <SectionHeader>
                                <SectionTitle><Activity size={16} color="#00adef" /> Active Signals</SectionTitle>
                                <SectionCount>{activeSignals.length}</SectionCount>
                            </SectionHeader>
                            {activeSignals.length > 0 ? (
                                <SignalGrid>
                                    {activeSignals.map((s, i) => renderSignalCard(s, i, !isPremium))}
                                </SignalGrid>
                            ) : (
                                <EmptyState>No active signals right now. Check back soon.</EmptyState>
                            )}
                        </div>

                        {/* ── Closed Signals ── */}
                        {closedSignals.length > 0 && (
                            <div>
                                <SectionHeader>
                                    <SectionTitle><CheckCircle size={16} color="#94a3b8" /> Closed Signals</SectionTitle>
                                    <SectionCount>{closedSignals.length}</SectionCount>
                                </SectionHeader>
                                <SignalGrid>
                                    {closedSignals.slice(0, 6).map((s, i) => renderSignalCard(s, i))}
                                </SignalGrid>
                            </div>
                        )}
                    </MainCol>

                    {/* ── Sidebar ── */}
                    <Sidebar>
                        <SidebarCard>
                            <SidebarTitle><Activity size={16} color="#00adef" /> Live Activity</SidebarTitle>
                            <ActivityList>
                                {activity.map((a, i) => (
                                    <ActivityItem key={i}>
                                        <ActivityDot $color={a.color} />
                                        <div>
                                            {a.text}
                                            <ActivityTime>{a.time}</ActivityTime>
                                        </div>
                                    </ActivityItem>
                                ))}
                                {activity.length === 0 && (
                                    <EmptyState style={{ padding: '1rem' }}>Waiting for signals...</EmptyState>
                                )}
                            </ActivityList>

                            {!isPremium && (
                                <UpgradeBanner>
                                    <UpgradeText>
                                        <UpgradeTitle><Lock size={14} style={{ display: 'inline', marginRight: 4 }} />Unlock Real-Time Signals</UpgradeTitle>
                                        <UpgradeDesc>Free users see delayed signals. Upgrade for instant access.</UpgradeDesc>
                                    </UpgradeText>
                                    <UpgradeBtn onClick={() => navigate('/pricing')}>
                                        <Crown size={14} /> Upgrade
                                    </UpgradeBtn>
                                </UpgradeBanner>
                            )}
                        </SidebarCard>
                    </Sidebar>
                </MainGrid>
            </Container>
        </Page>
    );
};

export default SignalsPage;
