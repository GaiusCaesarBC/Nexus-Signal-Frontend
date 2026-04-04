// client/src/pages/AccuracyDashboardPage.js — Proof Engine

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import {
    TrendingUp, TrendingDown, Target, Clock,
    CheckCircle, XCircle, ArrowLeft, Zap,
    BarChart3, Activity, Eye, Shield, Lock, Brain
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from '../components/UpgradePrompt';

// ─── Animations ──────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`;

// ─── Styled Components ──────────────────────────────────
const Page = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 3rem;
    color: #e0e6ed;
`;

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const BackButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: all 0.2s;
    &:hover {
        background: rgba(0,173,237,.08);
        border-color: rgba(0,173,237,.2);
        color: #00adef;
    }
`;

// ─── Trust Header ────────────────────────────────────────
const TrustHeader = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.4s ease-out;
`;

const PageTitle = styled.h1`
    font-size: 1.6rem;
    font-weight: 800;
    color: #fff;
    margin: 0 0 0.35rem;
`;

const PageSubtitle = styled.p`
    font-size: 0.85rem;
    color: #64748b;
    margin: 0 0 1rem;
    max-width: 600px;
    line-height: 1.5;
`;

const TrustStrip = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 0.6rem 1rem;
    background: rgba(12,16,32,.8);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    font-size: 0.75rem;
    color: #94a3b8;
`;

const TrustStripItem = styled.span`
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const TrustStripVal = styled.span`
    font-weight: 800;
    color: #e2e8f0;
`;

const TrustDivider = styled.span`
    color: rgba(100,116,139,.25);
    font-size: 0.6rem;
`;

// ─── Card base ───────────────────────────────────────────
const Card = styled.div`
    background: rgba(12,16,32,.92);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 14px;
    padding: 1.25rem;
    animation: ${fadeIn} 0.5s ease-out backwards;
    animation-delay: ${p => p.$delay || '0s'};
`;

const SectionTitle = styled.h2`
    font-size: 1rem;
    font-weight: 700;
    color: #e0e6ed;
    margin: 0 0 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const SectionSub = styled.p`
    font-size: 0.75rem;
    color: #475569;
    margin: 0 0 1rem;
`;

// ─── Metric Cards ────────────────────────────────────────
const MetricsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 0.5rem;
    animation: ${fadeIn} 0.4s ease-out 0.1s backwards;
    @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const MetricCard = styled.div`
    background: rgba(12,16,32,.92);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 12px;
    padding: 1rem 1.1rem;
    transition: border-color 0.2s;
    &:hover { border-color: rgba(255,255,255,.12); }
`;

const MetricLabel = styled.div`
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.4rem;
`;

const MetricValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${p => p.$color || '#e0e6ed'};
    line-height: 1.1;
`;

const MetricSub = styled.div`
    font-size: 0.7rem;
    color: #475569;
    margin-top: 0.2rem;
`;

const MetricExplainer = styled.p`
    font-size: 0.72rem;
    color: #475569;
    margin: 0.5rem 0 2rem;
    font-style: italic;
    animation: ${fadeIn} 0.4s ease-out 0.15s backwards;
`;

// ─── Equity Curve ────────────────────────────────────────
const ChartWrap = styled.div`
    height: 300px;
    margin-top: 0.5rem;
`;

// ─── Filter Chips ────────────────────────────────────────
const FilterRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    animation: ${fadeIn} 0.4s ease-out 0.25s backwards;
`;

const FilterChip = styled.button`
    padding: 0.3rem 0.7rem;
    border-radius: 7px;
    font-size: 0.72rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: ${p => p.$active ? 'rgba(0,173,237,.12)' : 'rgba(255,255,255,.02)'};
    border: 1px solid ${p => p.$active ? 'rgba(0,173,237,.3)' : 'rgba(255,255,255,.06)'};
    color: ${p => p.$active ? '#00adef' : '#64748b'};
    &:hover { border-color: rgba(0,173,237,.25); color: #00adef; }
`;

// ─── Recent Outcomes ─────────────────────────────────────
const OutcomesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const OutcomeCard = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1rem;
    background: rgba(255,255,255,.02);
    border: 1px solid ${p =>
        p.$result === 'correct' ? 'rgba(16,185,129,.25)' :
        p.$result === 'incorrect' ? 'rgba(239,68,68,.25)' :
        'rgba(255,255,255,.06)'
    };
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
        background: rgba(255,255,255,.04);
        transform: translateX(3px);
    }
`;

const OutcomeIcon = styled.div`
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${p =>
        p.$result === 'correct' ? 'rgba(16,185,129,.12)' :
        p.$result === 'incorrect' ? 'rgba(239,68,68,.12)' :
        'rgba(245,158,11,.12)'
    };
    color: ${p =>
        p.$result === 'correct' ? '#10b981' :
        p.$result === 'incorrect' ? '#ef4444' :
        '#f59e0b'
    };
`;

const OutcomeInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const OutcomeSymbol = styled.div`
    font-size: 0.85rem;
    font-weight: 700;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const DirBadge = styled.span`
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    background: ${p => p.$long ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    text-transform: uppercase;
`;

const ResultBadge = styled.span`
    font-size: 0.65rem;
    font-weight: 800;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    background: ${p => p.$win ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)'};
    color: ${p => p.$win ? '#10b981' : '#ef4444'};
    border: 1px solid ${p => p.$win ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'};
`;

const OutcomeDetail = styled.div`
    font-size: 0.72rem;
    color: #475569;
    margin-top: 0.15rem;
`;

const OutcomeRight = styled.div`
    text-align: right;
    flex-shrink: 0;
`;

const OutcomePercent = styled.div`
    font-size: 0.9rem;
    font-weight: 800;
    color: ${p => p.$positive ? '#10b981' : '#ef4444'};
`;

const OutcomeDate = styled.div`
    font-size: 0.65rem;
    color: #475569;
    margin-top: 0.1rem;
`;

// ─── Win/Loss Breakdown ──────────────────────────────────
const BreakdownGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
`;

const BreakdownCell = styled.div`
    background: rgba(255,255,255,.02);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    padding: 0.8rem;
    text-align: center;
`;

const BreakdownLabel = styled.div`
    font-size: 0.68rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 0.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
`;

const BreakdownValue = styled.div`
    font-size: 1.25rem;
    font-weight: 800;
    color: ${p => p.$color || '#e0e6ed'};
`;

const BreakdownSub = styled.div`
    font-size: 0.65rem;
    color: #475569;
    margin-top: 0.15rem;
`;

// ─── Expectancy Module ───────────────────────────────────
const ExpectancyCard = styled(Card)`
    text-align: center;
    padding: 2rem 1.5rem;
`;

const ExpectancyValue = styled.div`
    font-size: 2.2rem;
    font-weight: 900;
    color: ${p => p.$positive ? '#10b981' : '#ef4444'};
    line-height: 1;
    margin: 0.5rem 0;
`;

const ExpectancyExplain = styled.p`
    font-size: 0.78rem;
    color: #64748b;
    max-width: 500px;
    margin: 0.5rem auto 0;
    line-height: 1.5;
`;

// ─── Transparency Proof ──────────────────────────────────
const ProofGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
`;

const ProofItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
    background: rgba(255,255,255,.02);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
    text-align: center;
`;

const ProofIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,173,237,.08);
    color: #00adef;
`;

const ProofText = styled.div`
    font-size: 0.72rem;
    color: #94a3b8;
    line-height: 1.4;
`;

// ─── Best/Worst Symbols ──────────────────────────────────
const SymbolColumns = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const SymbolList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const SymbolRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0.75rem;
    background: rgba(255,255,255,.02);
    border: 1px solid rgba(255,255,255,.04);
    border-radius: 8px;
    &:hover { background: rgba(255,255,255,.04); }
`;

const SymbolName = styled.span`
    font-size: 0.82rem;
    font-weight: 700;
    color: #e0e6ed;
`;

const SymbolAcc = styled.span`
    font-size: 0.82rem;
    font-weight: 700;
    color: ${p => p.$v >= 60 ? '#10b981' : p.$v >= 40 ? '#f59e0b' : '#ef4444'};
`;

const SymbolCount = styled.span`
    font-size: 0.68rem;
    color: #475569;
    margin-left: 0.4rem;
`;

// ─── Trust Footer ────────────────────────────────────────
const TrustFooter = styled.div`
    text-align: center;
    padding: 2rem 1rem;
    font-size: 0.75rem;
    color: #475569;
    font-style: italic;
    animation: ${fadeIn} 0.4s ease-out;
`;

// ─── Loading / Empty ─────────────────────────────────────
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #00adef;
`;

const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0,173,237,.2);
    border-top-color: #00adef;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 1rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1.25rem;
    background: rgba(0,173,237,.08);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00adef;
`;

// ─── Spacing helper ──────────────────────────────────────
const Section = styled.div`
    margin-bottom: 1.5rem;
`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const AccuracyDashboardPage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { theme } = useTheme();
    const { api: authApi } = useAuth();
    const { canUseFeature } = useSubscription();
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(!canUseFeature('hasAccuracyAnalytics'));

    const [data, setData] = useState(null);
    const [perfData, setPerfData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    const apiInstance = authApi || api;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [dashRes, perfRes] = await Promise.allSettled([
                apiInstance.get('/predictions/accuracy-dashboard'),
                apiInstance.get('/predictions/performance')
            ]);

            if (dashRes.status === 'fulfilled') {
                setData(dashRes.value.data);
            } else {
                console.error('Error fetching dashboard:', dashRes.reason);
                toast.error('Failed to load accuracy data');
            }

            if (perfRes.status === 'fulfilled') {
                setPerfData(perfRes.value.data);
            } else {
                console.warn('Performance data unavailable:', perfRes.reason);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            toast.error('Failed to load accuracy data');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatPercent = (value) => {
        if (value === undefined || value === null) return '0.00%';
        return `${value >= 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
    };

    const formatDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        const now = new Date();
        const diffH = Math.floor((now - dt) / 3600000);
        if (diffH < 1) return `${Math.floor((now - dt) / 60000)}m ago`;
        if (diffH < 24) return `${diffH}h ago`;
        if (diffH < 48) return 'Yesterday';
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // ── Derived calculations ──
    const computedStats = useMemo(() => {
        if (!data && !perfData) return null;
        const overview = data?.overview || {};
        const ps = perfData?.stats || {};

        const totalPredictions = overview.totalPredictions || ps.total || 0;
        const winRate = overview.accuracy || ps.winRate || 0;
        const avgReturn = ps.avgReturn ?? null;
        const edge = ps.edge ?? null;
        const avgWin = ps.avgWin ?? null;
        const avgLoss = ps.avgLoss ?? null;

        // Calculate avgReturn from recentPredictions if not available
        let calcAvgReturn = avgReturn;
        if (calcAvgReturn === null && data?.recentPredictions?.length) {
            const resolved = data.recentPredictions.filter(p => p.outcome?.actualChangePercent !== undefined);
            if (resolved.length > 0) {
                const sum = resolved.reduce((acc, p) => {
                    const dir = p.direction === 'UP' ? 1 : -1;
                    return acc + (p.outcome.actualChangePercent * dir);
                }, 0);
                calcAvgReturn = sum / resolved.length;
            }
        }

        // Calculate edge if not available
        let calcEdge = edge;
        if (calcEdge === null && avgWin !== null && avgLoss !== null && winRate > 0) {
            const wr = winRate / 100;
            calcEdge = (wr * avgWin) + ((1 - wr) * avgLoss);
        } else if (calcEdge === null && data?.recentPredictions?.length) {
            const resolved = data.recentPredictions.filter(p => p.outcome?.actualChangePercent !== undefined);
            const wins = resolved.filter(p => p.outcome?.wasCorrect);
            const losses = resolved.filter(p => !p.outcome?.wasCorrect);
            if (wins.length > 0 && losses.length > 0) {
                const aw = wins.reduce((a, p) => a + Math.abs(p.outcome.actualChangePercent), 0) / wins.length;
                const al = losses.reduce((a, p) => a + Math.abs(p.outcome.actualChangePercent), 0) / losses.length;
                const wr = wins.length / resolved.length;
                calcEdge = (wr * aw) - ((1 - wr) * al);
            }
        }

        // Calculate avgWin / avgLoss from recentPredictions if needed
        let calcAvgWin = avgWin;
        let calcAvgLoss = avgLoss;
        if ((calcAvgWin === null || calcAvgLoss === null) && data?.recentPredictions?.length) {
            const resolved = data.recentPredictions.filter(p => p.outcome?.actualChangePercent !== undefined);
            const wins = resolved.filter(p => p.outcome?.wasCorrect);
            const losses = resolved.filter(p => !p.outcome?.wasCorrect);
            if (wins.length > 0) {
                calcAvgWin = wins.reduce((a, p) => a + Math.abs(p.outcome.actualChangePercent), 0) / wins.length;
            }
            if (losses.length > 0) {
                calcAvgLoss = losses.reduce((a, p) => a + Math.abs(p.outcome.actualChangePercent), 0) / losses.length;
            }
        }

        const winLossRatio = (calcAvgWin && calcAvgLoss && calcAvgLoss !== 0)
            ? (calcAvgWin / Math.abs(calcAvgLoss))
            : null;

        return {
            totalPredictions,
            winRate,
            avgReturn: calcAvgReturn,
            edge: calcEdge,
            avgWin: calcAvgWin,
            avgLoss: calcAvgLoss,
            winLossRatio,
        };
    }, [data, perfData]);

    // ── Filtered predictions ──
    const filteredPredictions = useMemo(() => {
        const preds = data?.recentPredictions || [];
        if (activeFilter === 'all') return preds;

        const now = Date.now();
        switch (activeFilter) {
            case 'stocks':
                return preds.filter(p => p.assetType === 'stock');
            case 'crypto':
                return preds.filter(p => p.assetType === 'crypto' || p.assetType === 'dex');
            case 'bullish':
                return preds.filter(p => p.direction === 'UP');
            case 'bearish':
                return preds.filter(p => p.direction === 'DOWN');
            case '7d':
                return preds.filter(p => (now - new Date(p.createdAt).getTime()) <= 7 * 86400000);
            case '30d':
                return preds.filter(p => (now - new Date(p.createdAt).getTime()) <= 30 * 86400000);
            default:
                return preds;
        }
    }, [data, activeFilter]);

    // ── Equity curve chart data ──
    const equityChartData = useMemo(() => {
        if (perfData?.equityCurve?.length) {
            return perfData.equityCurve.map(p => ({
                date: p.date,
                cumReturn: Number(p.cumReturn) || 0,
            }));
        }
        // Fall back to weeklyTrend as accuracy-over-time
        if (data?.weeklyTrend?.length) {
            return data.weeklyTrend.map(w => ({
                date: w.week || w.startDate,
                cumReturn: Math.round(w.accuracy),
            }));
        }
        return [];
    }, [perfData, data]);

    const hasEquityCurve = perfData?.equityCurve?.length > 0;
    const chartLabel = hasEquityCurve ? 'Cumulative Return (%)' : 'Accuracy (%)';

    // ═══════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════

    if (loading) {
        return (
            <Page>
                <Container>
                    <LoadingContainer>
                        <Spinner />
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Loading proof data...</div>
                    </LoadingContainer>
                </Container>
            </Page>
        );
    }

    if (!data || data.overview?.totalPredictions === 0) {
        return (
            <Page>
                <Container>
                    <BackButton onClick={() => navigate('/predict')}>
                        <ArrowLeft size={14} /> Back to Predictions
                    </BackButton>
                    <EmptyState>
                        <EmptyIcon><Brain size={36} /></EmptyIcon>
                        <h2 style={{ color: '#e0e6ed', fontSize: '1.15rem', marginBottom: '0.4rem' }}>No Prediction Data Yet</h2>
                        <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                            Make some predictions and wait for them to resolve to see tracked results.
                        </p>
                        <BackButton onClick={() => navigate('/predict')} style={{ display: 'inline-flex' }}>
                            <Brain size={14} /> Make a Prediction
                        </BackButton>
                    </EmptyState>
                </Container>
            </Page>
        );
    }

    const { overview, byDirection, weeklyTrend, bestSymbols, worstSymbols, recentPredictions } = data;
    const stats = computedStats || {};

    return (
        <>
        <Page>
            <Container>
                <BackButton onClick={() => navigate('/predict')}>
                    <ArrowLeft size={14} /> Back to Predictions
                </BackButton>

                {/* ─── Section 1: Trust Header ─── */}
                <TrustHeader>
                    <PageTitle>Every Prediction. Tracked. Verified.</PageTitle>
                    <PageSubtitle>
                        All forecasts are recorded publicly — wins and losses. No edits. No deletions. Full transparency.
                    </PageSubtitle>
                    <TrustStrip>
                        <TrustStripItem>
                            <TrustStripVal>{stats.totalPredictions}</TrustStripVal> predictions tracked
                        </TrustStripItem>
                        <TrustDivider>|</TrustDivider>
                        <TrustStripItem>100% public history</TrustStripItem>
                        <TrustDivider>|</TrustDivider>
                        <TrustStripItem>0 deleted</TrustStripItem>
                        <TrustDivider>|</TrustDivider>
                        <TrustStripItem>Updated in real time</TrustStripItem>
                    </TrustStrip>
                </TrustHeader>

                {/* ─── Section 2: Core Performance Metrics ─── */}
                <Section>
                    <MetricsRow>
                        <MetricCard>
                            <MetricLabel>Total Predictions</MetricLabel>
                            <MetricValue>{stats.totalPredictions}</MetricValue>
                            <MetricSub>All time tracked</MetricSub>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>Win Rate</MetricLabel>
                            <MetricValue $color={stats.winRate >= 55 ? '#10b981' : stats.winRate >= 45 ? '#f59e0b' : '#ef4444'}>
                                {Math.round(stats.winRate)}%
                            </MetricValue>
                            <MetricSub>{overview.correctPredictions || 0}W / {overview.incorrectPredictions || 0}L</MetricSub>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>Avg Return / Prediction</MetricLabel>
                            <MetricValue $color={stats.avgReturn > 0 ? '#10b981' : stats.avgReturn < 0 ? '#ef4444' : '#e0e6ed'}>
                                {stats.avgReturn !== null ? formatPercent(stats.avgReturn) : '--'}
                            </MetricValue>
                            <MetricSub>Per closed prediction</MetricSub>
                        </MetricCard>
                        <MetricCard>
                            <MetricLabel>Edge (Expectancy)</MetricLabel>
                            <MetricValue $color={stats.edge > 0 ? '#10b981' : stats.edge < 0 ? '#ef4444' : '#e0e6ed'}>
                                {stats.edge !== null ? formatPercent(stats.edge) : '--'}
                            </MetricValue>
                            <MetricSub>Expected value per trade</MetricSub>
                        </MetricCard>
                    </MetricsRow>
                    <MetricExplainer>
                        Profitability comes from positive expectancy — not just win rate.
                    </MetricExplainer>
                </Section>

                {/* ─── Section 3: Equity Curve ─── */}
                <Section>
                    <Card $delay="0.15s">
                        <SectionTitle><Activity size={16} /> Cumulative Performance</SectionTitle>
                        <SectionSub>
                            {hasEquityCurve
                                ? 'Performance over all tracked predictions'
                                : 'Accuracy trend over time (weekly)'}
                        </SectionSub>
                        {equityChartData.length > 0 ? (
                            <ChartWrap>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={equityChartData}>
                                        <defs>
                                            <linearGradient id="eqGreen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.15)" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#475569"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#475569"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={v => `${v}%`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(12,16,32,.95)',
                                                border: '1px solid rgba(255,255,255,.1)',
                                                borderRadius: '8px',
                                                color: '#e0e6ed',
                                                fontSize: '0.78rem',
                                            }}
                                            formatter={(value) => [`${Number(value).toFixed(2)}%`, chartLabel]}
                                            labelStyle={{ color: '#94a3b8' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="cumReturn"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fill="url(#eqGreen)"
                                            dot={false}
                                            activeDot={{ r: 4, fill: '#10b981', stroke: '#0c1020', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartWrap>
                        ) : (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
                                Not enough data to display the equity curve yet.
                            </div>
                        )}
                    </Card>
                </Section>

                {/* ─── Section 8: Filter Chips (placed before outcomes for UX) ─── */}
                <FilterRow>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'stocks', label: 'Stocks' },
                        { key: 'crypto', label: 'Crypto' },
                        { key: 'bullish', label: 'Bullish' },
                        { key: 'bearish', label: 'Bearish' },
                        { key: '7d', label: 'Last 7 Days' },
                        { key: '30d', label: 'Last 30 Days' },
                    ].map(f => (
                        <FilterChip
                            key={f.key}
                            $active={activeFilter === f.key}
                            onClick={() => setActiveFilter(f.key)}
                        >
                            {f.label}
                        </FilterChip>
                    ))}
                </FilterRow>

                {/* ─── Section 4: Recent Outcomes ─── */}
                <Section>
                    <Card $delay="0.2s">
                        <SectionTitle><Clock size={16} /> Recent Outcomes</SectionTitle>
                        <SectionSub>
                            {filteredPredictions.length} prediction{filteredPredictions.length !== 1 ? 's' : ''} shown
                            {activeFilter !== 'all' ? ` (filtered)` : ''}
                        </SectionSub>
                        <OutcomesList>
                            {filteredPredictions.length > 0 ? (
                                filteredPredictions.slice(0, 15).map(p => {
                                    const isWin = p.outcome?.wasCorrect || p.status === 'correct';
                                    const isLoss = p.status === 'incorrect';
                                    const isPending = p.status === 'pending' || p.status === 'active';
                                    const resultStatus = isWin ? 'correct' : isLoss ? 'incorrect' : 'pending';
                                    const changePct = p.outcome?.actualChangePercent;
                                    const dirMultiplier = p.direction === 'UP' ? 1 : -1;
                                    const effectiveChange = changePct !== undefined ? changePct * dirMultiplier : null;

                                    return (
                                        <OutcomeCard
                                            key={p._id}
                                            $result={resultStatus}
                                            onClick={() => navigate(`/predict/${p._id}`)}
                                        >
                                            <OutcomeIcon $result={resultStatus}>
                                                {isWin && <CheckCircle size={16} />}
                                                {isLoss && <XCircle size={16} />}
                                                {isPending && <Clock size={16} />}
                                            </OutcomeIcon>
                                            <OutcomeInfo>
                                                <OutcomeSymbol>
                                                    {p.symbol}
                                                    <DirBadge $long={p.direction === 'UP'}>
                                                        {p.direction === 'UP' ? 'LONG' : 'SHORT'}
                                                    </DirBadge>
                                                    {!isPending && (
                                                        <ResultBadge $win={isWin}>
                                                            {isWin ? 'WIN' : 'LOSS'}
                                                        </ResultBadge>
                                                    )}
                                                    {isPending && (
                                                        <ResultBadge $win={false} style={{ background: 'rgba(245,158,11,.12)', color: '#f59e0b', borderColor: 'rgba(245,158,11,.3)' }}>
                                                            PENDING
                                                        </ResultBadge>
                                                    )}
                                                </OutcomeSymbol>
                                                <OutcomeDetail>
                                                    {formatPrice(p.currentPrice)} → {p.outcome?.actualPrice ? formatPrice(p.outcome.actualPrice) : formatPrice(p.targetPrice)}
                                                </OutcomeDetail>
                                            </OutcomeInfo>
                                            <OutcomeRight>
                                                {changePct !== undefined ? (
                                                    <OutcomePercent $positive={effectiveChange >= 0}>
                                                        {formatPercent(effectiveChange)}
                                                    </OutcomePercent>
                                                ) : (
                                                    <OutcomePercent $positive style={{ color: '#f59e0b' }}>--</OutcomePercent>
                                                )}
                                                <OutcomeDate>{formatDate(p.createdAt)}</OutcomeDate>
                                            </OutcomeRight>
                                        </OutcomeCard>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.82rem' }}>
                                    No predictions match this filter.
                                </div>
                            )}
                        </OutcomesList>
                    </Card>
                </Section>

                {/* ─── Section 5: Win/Loss Breakdown ─── */}
                <Section>
                    <Card $delay="0.25s">
                        <SectionTitle><BarChart3 size={16} /> Outcome Distribution</SectionTitle>
                        <SectionSub>Win and loss characteristics</SectionSub>
                        <BreakdownGrid>
                            <BreakdownCell>
                                <BreakdownLabel><TrendingUp size={12} /> Avg Win</BreakdownLabel>
                                <BreakdownValue $color="#10b981">
                                    {stats.avgWin !== null && stats.avgWin !== undefined
                                        ? `+${Number(stats.avgWin).toFixed(2)}%`
                                        : '--'}
                                </BreakdownValue>
                                <BreakdownSub>Mean winning move</BreakdownSub>
                            </BreakdownCell>
                            <BreakdownCell>
                                <BreakdownLabel><TrendingDown size={12} /> Avg Loss</BreakdownLabel>
                                <BreakdownValue $color="#ef4444">
                                    {stats.avgLoss !== null && stats.avgLoss !== undefined
                                        ? `-${Math.abs(Number(stats.avgLoss)).toFixed(2)}%`
                                        : '--'}
                                </BreakdownValue>
                                <BreakdownSub>Mean losing move</BreakdownSub>
                            </BreakdownCell>
                            <BreakdownCell>
                                <BreakdownLabel><Target size={12} /> Win/Loss Ratio</BreakdownLabel>
                                <BreakdownValue $color="#00adef">
                                    {stats.winLossRatio !== null
                                        ? `${stats.winLossRatio.toFixed(2)}x`
                                        : '--'}
                                </BreakdownValue>
                                <BreakdownSub>Avg win / avg loss</BreakdownSub>
                            </BreakdownCell>
                            <BreakdownCell>
                                <BreakdownLabel>By Direction</BreakdownLabel>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
                                            {Math.round(byDirection?.UP?.accuracy || 0)}%
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: '#475569' }}>
                                            Bullish ({byDirection?.UP?.correct || 0}/{byDirection?.UP?.total || 0})
                                        </div>
                                    </div>
                                    <div style={{ width: '1px', background: 'rgba(255,255,255,.08)' }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ef4444' }}>
                                            {Math.round(byDirection?.DOWN?.accuracy || 0)}%
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: '#475569' }}>
                                            Bearish ({byDirection?.DOWN?.correct || 0}/{byDirection?.DOWN?.total || 0})
                                        </div>
                                    </div>
                                </div>
                            </BreakdownCell>
                        </BreakdownGrid>
                    </Card>
                </Section>

                {/* ─── Section 6: Expectancy Module ─── */}
                <Section>
                    <ExpectancyCard $delay="0.3s">
                        <SectionTitle style={{ justifyContent: 'center' }}>
                            <Zap size={16} /> Edge Per Prediction
                        </SectionTitle>
                        <ExpectancyValue $positive={stats.edge > 0}>
                            {stats.edge !== null
                                ? `${stats.edge >= 0 ? '+' : ''}${Number(stats.edge).toFixed(2)}% expected return per prediction`
                                : '-- calculating --'}
                        </ExpectancyValue>
                        <ExpectancyExplain>
                            This system is profitable over time due to positive expectancy, not just win rate.
                            Each prediction has a measured expected value.
                        </ExpectancyExplain>
                    </ExpectancyCard>
                </Section>

                {/* ─── Section 7: Transparency Proof Block ─── */}
                <Section>
                    <Card $delay="0.35s">
                        <SectionTitle style={{ marginBottom: '1rem' }}>
                            <Shield size={16} /> Transparency Guarantee
                        </SectionTitle>
                        <ProofGrid>
                            <ProofItem>
                                <ProofIcon><CheckCircle size={18} /></ProofIcon>
                                <ProofText>Every prediction is logged at creation</ProofText>
                            </ProofItem>
                            <ProofItem>
                                <ProofIcon><Shield size={18} /></ProofIcon>
                                <ProofText>No edits allowed after posting</ProofText>
                            </ProofItem>
                            <ProofItem>
                                <ProofIcon><Eye size={18} /></ProofIcon>
                                <ProofText>Losses are displayed publicly</ProofText>
                            </ProofItem>
                            <ProofItem>
                                <ProofIcon><Lock size={18} /></ProofIcon>
                                <ProofText>Historical records are permanent</ProofText>
                            </ProofItem>
                        </ProofGrid>
                    </Card>
                </Section>

                {/* ─── Section 9: Best/Worst Symbols ─── */}
                <Section>
                    <Card $delay="0.4s">
                        <SymbolColumns>
                            <div>
                                <SectionTitle style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>
                                    <TrendingUp size={14} color="#10b981" /> Best Performing
                                </SectionTitle>
                                {bestSymbols && bestSymbols.length > 0 ? (
                                    <SymbolList>
                                        {bestSymbols.slice(0, 5).map(s => (
                                            <SymbolRow key={s.symbol}>
                                                <SymbolName>{s.symbol}</SymbolName>
                                                <div>
                                                    <SymbolAcc $v={s.accuracy}>{Math.round(s.accuracy)}%</SymbolAcc>
                                                    <SymbolCount>{s.correct}/{s.total}</SymbolCount>
                                                </div>
                                            </SymbolRow>
                                        ))}
                                    </SymbolList>
                                ) : (
                                    <div style={{ color: '#475569', fontSize: '0.78rem', padding: '1rem', textAlign: 'center' }}>
                                        Need more data
                                    </div>
                                )}
                            </div>
                            <div>
                                <SectionTitle style={{ fontSize: '0.9rem', marginBottom: '0.6rem' }}>
                                    <TrendingDown size={14} color="#ef4444" /> Worst Performing
                                </SectionTitle>
                                {worstSymbols && worstSymbols.length > 0 ? (
                                    <SymbolList>
                                        {worstSymbols.slice(0, 5).map(s => (
                                            <SymbolRow key={s.symbol}>
                                                <SymbolName>{s.symbol}</SymbolName>
                                                <div>
                                                    <SymbolAcc $v={s.accuracy}>{Math.round(s.accuracy)}%</SymbolAcc>
                                                    <SymbolCount>{s.correct}/{s.total}</SymbolCount>
                                                </div>
                                            </SymbolRow>
                                        ))}
                                    </SymbolList>
                                ) : (
                                    <div style={{ color: '#475569', fontSize: '0.78rem', padding: '1rem', textAlign: 'center' }}>
                                        Need more data
                                    </div>
                                )}
                            </div>
                        </SymbolColumns>
                    </Card>
                </Section>

                {/* ─── Trust Footer ─── */}
                <TrustFooter>
                    Every prediction is tracked publicly — win or lose. No edits. No cherry-picking.
                </TrustFooter>
            </Container>
        </Page>

        <UpgradePrompt
            isOpen={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(false)}
            feature="hasAccuracyAnalytics"
            requiredPlan="premium"
        />
        </>
    );
};

export default AccuracyDashboardPage;
