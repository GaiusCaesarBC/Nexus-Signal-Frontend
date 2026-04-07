// client/src/pages/StrategyLabPage.js
// Strategy Lab — strategy intelligence + optimization system.
// Replaces the legacy BacktestingPage. All scoring, interpretation, and
// improvement suggestions are computed client-side from the existing
// backtest API response.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Area, ComposedChart, Legend, ReferenceLine
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
    Beaker, Brain, ChevronDown, ChevronRight, ChevronUp, Loader2,
    Shield, Sparkles, Target, TrendingDown, TrendingUp, Zap, Activity,
    Trophy, AlertTriangle, CheckCircle, Save, Copy, Bell, BarChart3
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
    return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};
const fmtNum = (n, d = 2) => {
    if (n === null || n === undefined || isNaN(n)) return '--';
    return Number(n).toFixed(d);
};

// ═══════════════════════════════════════════════════════════
// STRATEGIES — mirrors backend STRATEGY_MAP
// ═══════════════════════════════════════════════════════════
const STRATEGIES = [
    {
        id: 'ma-crossover',
        name: 'Moving Average Crossover',
        description: 'Buy when fast MA crosses above slow MA',
        parameters: [
            { key: 'fastPeriod', label: 'Fast MA', default: 10, min: 5, max: 50 },
            { key: 'slowPeriod', label: 'Slow MA', default: 30, min: 10, max: 200 }
        ]
    },
    {
        id: 'rsi-reversal',
        name: 'RSI Reversal',
        description: 'Buy oversold, sell overbought',
        parameters: [
            { key: 'period', label: 'RSI Period', default: 14, min: 5, max: 30 },
            { key: 'oversold', label: 'Oversold', default: 30, min: 10, max: 40 },
            { key: 'overbought', label: 'Overbought', default: 70, min: 60, max: 90 }
        ]
    },
    {
        id: 'macd-crossover',
        name: 'MACD Crossover',
        description: 'Buy on MACD bullish crossover',
        parameters: []
    },
    {
        id: 'bollinger-bands',
        name: 'Bollinger Bands',
        description: 'Mean reversion at band extremes',
        parameters: [
            { key: 'period', label: 'Period', default: 20, min: 10, max: 50 },
            { key: 'stdDevs', label: 'Std Devs', default: 2, min: 1, max: 3 }
        ]
    },
    {
        id: 'breakout',
        name: 'Breakout Strategy',
        description: 'Buy when price breaks lookback high',
        parameters: [
            { key: 'lookbackPeriod', label: 'Lookback', default: 20, min: 10, max: 50 }
        ]
    },
    {
        id: 'mean-reversion',
        name: 'Mean Reversion',
        description: 'Trade pullbacks to the mean',
        parameters: [
            { key: 'period', label: 'MA Period', default: 20, min: 10, max: 50 },
            { key: 'stdDevs', label: 'Threshold', default: 2, min: 1, max: 3 }
        ]
    }
];

// ═══════════════════════════════════════════════════════════
// SCORING + INTERPRETATION (CLIENT-SIDE)
// ═══════════════════════════════════════════════════════════

function computeBuyHoldReturn(equityCurve, initialCapital) {
    if (!equityCurve || equityCurve.length < 2) return 0;
    const last = equityCurve[equityCurve.length - 1];
    const benchmark = last.benchmark || initialCapital;
    return ((benchmark - initialCapital) / initialCapital) * 100;
}

function gradeStrategy(metrics, equityCurve, initialCapital = 10000) {
    if (!metrics) return null;

    const totalReturn = metrics.totalReturnPercent || 0;
    const sharpe = metrics.sharpeRatio || 0;
    const maxDD = Math.abs(metrics.maxDrawdownPercent || 0);
    const winRate = metrics.winRate || 0;
    const profitFactor = metrics.profitFactor || 0;
    const totalTrades = metrics.totalTrades || 0;

    const buyHoldReturn = computeBuyHoldReturn(equityCurve, initialCapital);
    const vsBuyHold = totalReturn - buyHoldReturn;

    let score = 50;

    // Returns vs buy & hold (max ±25)
    score += Math.max(-25, Math.min(25, vsBuyHold * 1.5));

    // Sharpe (max +20)
    if (sharpe >= 2) score += 20;
    else if (sharpe >= 1) score += 15;
    else if (sharpe >= 0.5) score += 8;
    else if (sharpe < 0) score -= 15;

    // Drawdown penalty
    if (maxDD > 30) score -= 25;
    else if (maxDD > 20) score -= 15;
    else if (maxDD > 10) score -= 5;

    // Profit factor (max +15)
    if (profitFactor >= 2) score += 15;
    else if (profitFactor >= 1.5) score += 10;
    else if (profitFactor >= 1.2) score += 5;
    else if (profitFactor < 1) score -= 15;

    // Win rate bonus
    if (winRate >= 60) score += 5;

    // Sample size penalty
    if (totalTrades < 10) score -= 15;
    else if (totalTrades < 20) score -= 5;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let grade, label, color;
    if (score >= 85) { grade = 'A'; label = 'Elite Strategy'; color = '#10b981'; }
    else if (score >= 70) { grade = 'B+'; label = 'Strong Strategy'; color = '#10b981'; }
    else if (score >= 55) { grade = 'B'; label = 'Solid Strategy'; color = '#0ea5e9'; }
    else if (score >= 40) { grade = 'C'; label = 'Moderate Strategy'; color = '#f59e0b'; }
    else if (score >= 25) { grade = 'D'; label = 'Weak Strategy'; color = '#ef4444'; }
    else { grade = 'F'; label = 'Avoid'; color = '#ef4444'; }

    // Risk level
    let risk;
    if (maxDD < 10 && sharpe >= 1) risk = { label: 'Low', color: '#10b981' };
    else if (maxDD < 20) risk = { label: 'Medium', color: '#f59e0b' };
    else risk = { label: 'High', color: '#ef4444' };

    return { score, grade, label, color, vsBuyHold, buyHoldReturn, risk };
}

function interpretMetric(key, value, ctx) {
    const v = Number(value);
    switch (key) {
        case 'totalReturnPercent': {
            const diff = (ctx?.vsBuyHold ?? 0);
            if (diff >= 5) return { tone: 'pass', text: `Beats buy & hold by ${fmtPct(diff)}` };
            if (diff > -5) return { tone: 'mid', text: 'Roughly matches buy & hold' };
            return { tone: 'warn', text: `Underperforms buy & hold by ${fmtPct(Math.abs(diff))}` };
        }
        case 'sharpeRatio': {
            if (v >= 2) return { tone: 'pass', text: 'Excellent risk-adjusted return' };
            if (v >= 1) return { tone: 'pass', text: 'Solid risk-adjusted return' };
            if (v >= 0.5) return { tone: 'mid', text: 'Modest risk-adjusted return' };
            return { tone: 'warn', text: 'Poor risk-adjusted return' };
        }
        case 'maxDrawdownPercent': {
            const m = Math.abs(v);
            if (m < 10) return { tone: 'pass', text: 'Tight risk control' };
            if (m < 20) return { tone: 'mid', text: 'Moderate downside risk' };
            if (m < 30) return { tone: 'warn', text: 'Significant drawdown risk' };
            return { tone: 'warn', text: 'High drawdown — risky in downturns' };
        }
        case 'winRate': {
            if (v >= 60) return { tone: 'pass', text: 'High win rate — clear edge' };
            if (v >= 55) return { tone: 'pass', text: 'Above coin flip — meaningful edge' };
            if (v >= 45) return { tone: 'mid', text: 'Coin flip — depends on R/R' };
            return { tone: 'warn', text: 'Sub-coin-flip — needs strong R/R' };
        }
        case 'profitFactor': {
            if (v >= 2) return { tone: 'pass', text: 'Strong — $2+ per $1 risked' };
            if (v >= 1.5) return { tone: 'pass', text: 'Healthy edge' };
            if (v >= 1.2) return { tone: 'mid', text: 'Modest edge' };
            return { tone: 'warn', text: 'Marginal — barely profitable' };
        }
        case 'totalTrades': {
            if (v >= 50) return { tone: 'pass', text: 'Statistically meaningful' };
            if (v >= 20) return { tone: 'mid', text: 'Sample size could be larger' };
            return { tone: 'warn', text: 'Too few trades — results unreliable' };
        }
        default:
            return { tone: 'mid', text: '' };
    }
}

function buildStrengthsWeaknesses(metrics, equityCurve, initialCapital) {
    const strengths = [];
    const weaknesses = [];
    if (!metrics) return { strengths, weaknesses };

    const grade = gradeStrategy(metrics, equityCurve, initialCapital);
    const checks = [
        ['totalReturnPercent', metrics.totalReturnPercent, grade],
        ['sharpeRatio', metrics.sharpeRatio],
        ['maxDrawdownPercent', metrics.maxDrawdownPercent],
        ['winRate', metrics.winRate],
        ['profitFactor', metrics.profitFactor],
        ['totalTrades', metrics.totalTrades]
    ];

    const labelMap = {
        totalReturnPercent: 'Returns vs benchmark',
        sharpeRatio: 'Risk-adjusted return',
        maxDrawdownPercent: 'Drawdown control',
        winRate: 'Win rate',
        profitFactor: 'Profit factor',
        totalTrades: 'Sample size'
    };

    checks.forEach(([key, val, ctx]) => {
        const interp = interpretMetric(key, val, ctx);
        const item = `${labelMap[key]}: ${interp.text}`;
        if (interp.tone === 'pass') strengths.push(item);
        else if (interp.tone === 'warn') weaknesses.push(item);
    });

    // Derived insights
    const avgWin = Math.abs(metrics.averageWin || 0);
    const avgLoss = Math.abs(metrics.averageLoss || 0);
    if (avgWin > 0 && avgLoss > 0) {
        if (avgWin >= avgLoss * 1.3) {
            strengths.push(`Avg win (${fmtPct(avgWin)}) larger than avg loss (${fmtPct(avgLoss)}) — favorable R/R`);
        } else if (avgLoss > avgWin * 1.3) {
            weaknesses.push(`Avg loss (${fmtPct(avgLoss)}) larger than avg win (${fmtPct(avgWin)}) — relies on high win rate`);
        }
    }

    return { strengths, weaknesses };
}

function buildSuggestions(metrics, equityCurve, params, strategyId, initialCapital) {
    if (!metrics) return [];
    const suggestions = [];

    const maxDD = Math.abs(metrics.maxDrawdownPercent || 0);
    const sharpe = metrics.sharpeRatio || 0;
    const winRate = metrics.winRate || 0;
    const totalTrades = metrics.totalTrades || 0;
    const profitFactor = metrics.profitFactor || 0;
    const avgWin = Math.abs(metrics.averageWin || 0);
    const avgLoss = Math.abs(metrics.averageLoss || 0);
    const buyHold = computeBuyHoldReturn(equityCurve, initialCapital);
    const vsBuyHold = (metrics.totalReturnPercent || 0) - buyHold;

    if (maxDD > 15) {
        suggestions.push({
            id: 'add-stop-loss',
            icon: Shield,
            title: 'Add a Stop Loss',
            body: `Max drawdown is ${maxDD.toFixed(1)}%. A 7% stop loss could meaningfully reduce downside.`,
            action: null
        });
    }

    if (winRate >= 60 && avgWin < avgLoss) {
        suggestions.push({
            id: 'add-take-profit',
            icon: Target,
            title: 'Add a Take-Profit',
            body: `You're winning ${winRate.toFixed(0)}% of trades but the average win (${fmtPct(avgWin)}) is smaller than the average loss (${fmtPct(avgLoss)}). Locking in profits earlier could fix the R/R.`,
            action: null
        });
    }

    if (totalTrades < 30) {
        suggestions.push({
            id: 'longer-period',
            icon: Activity,
            title: 'Run on a Longer Period',
            body: `Only ${totalTrades} trades — sample size too small to trust. Try a 2Y or 5Y window for more meaningful results.`,
            action: null
        });
    }

    if (strategyId === 'ma-crossover' && params.slowPeriod && params.slowPeriod < 100) {
        suggestions.push({
            id: 'slower-ma',
            icon: BarChart3,
            title: 'Try a Slower Slow MA',
            body: `Slow MA = ${params.slowPeriod}. Bumping to 100 typically reduces noise and improves Sharpe in trending markets.`,
            action: { params: { ...params, slowPeriod: 100 } }
        });
    }

    if (sharpe < 1 && vsBuyHold > 0) {
        suggestions.push({
            id: 'add-trend-filter',
            icon: TrendingUp,
            title: 'Add a Trend Filter',
            body: 'Strategy is profitable but choppy. Filtering trades to only fire when the broader trend agrees should smooth equity curve.',
            action: null
        });
    }

    if (vsBuyHold < -3) {
        suggestions.push({
            id: 'rethink',
            icon: AlertTriangle,
            title: 'Strategy Underperforms Buy & Hold',
            body: `The strategy is ${fmtPct(Math.abs(vsBuyHold))} worse than just holding the asset. The fundamental edge is questionable — try a different setup type.`,
            action: null
        });
    }

    if (profitFactor < 1.2 && profitFactor > 0) {
        suggestions.push({
            id: 'pf-low',
            icon: Zap,
            title: 'Profit Factor is Marginal',
            body: `Profit factor of ${profitFactor.toFixed(2)} means barely earning more than losing. Consider tightening entry criteria to skip lower-quality setups.`,
            action: null
        });
    }

    return suggestions.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulseAnim = keyframes`0%,100%{opacity:1}50%{opacity:.55}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

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
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    @media(max-width:768px){padding:1rem;}
`;

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
const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: .55rem;
    padding: .55rem .9rem;
    border-radius: 999px;
    background: rgba(167, 139, 250, .06);
    border: 1px solid rgba(167, 139, 250, .25);
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .75rem;
    font-weight: 600;
    white-space: nowrap;
`;
const StatusDot = styled.span`
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px rgba(16,185,129,.6);
    ${css`animation: ${pulseAnim} 2s ease-in-out infinite;`}
`;

// ─── Config Panel ─────────────────────────────────────────
const ConfigCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1.25rem;
    ${css`animation: ${fadeIn} .4s ease-out .05s backwards;`}
`;
const ConfigLabel = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .65rem;
`;
const ConfigRow = styled.div`
    display: flex;
    gap: .6rem;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: .85rem;
`;
const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: .25rem;
    flex: 1;
    min-width: 130px;
`;
const FieldLabel = styled.label`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const Input = styled.input`
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.03)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    border-radius: 7px;
    padding: .5rem .75rem;
    font-size: .8rem;
    font-weight: 600;
    outline: none;
    &:focus { border-color: ${p => p.theme?.brand?.primary || '#00adef'}; }
`;

const StratPills = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: .35rem;
    margin-bottom: .85rem;
`;
const StratPill = styled.button`
    padding: .45rem .8rem;
    background: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '20'
        : (p.theme?.bg?.subtle || 'rgba(255,255,255,.03)')};
    border: 1px solid ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '60'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.08)')};
    color: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef')
        : (p.theme?.text?.secondary || '#94a3b8')};
    border-radius: 8px;
    font-size: .72rem;
    font-weight: 800;
    cursor: pointer;
    transition: all .15s;
    &:hover {
        color: ${p => p.theme?.text?.primary || '#e0e6ed'};
        border-color: ${p => (p.theme?.brand?.primary || '#00adef') + '60'};
    }
`;

const ParamRow = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: .85rem;
`;
const ParamGroup = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 160px;
`;
const ParamHead = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: .25rem;
`;
const ParamLabel = styled.label`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
`;
const ParamValue = styled.span`
    font-size: .75rem;
    font-weight: 800;
    color: ${p => p.theme?.brand?.primary || '#00adef'};
`;
const Slider = styled.input.attrs({ type: 'range' })`
    width: 100%;
    accent-color: ${p => p.theme?.brand?.primary || '#00adef'};
`;

const RunBtn = styled.button`
    padding: .65rem 1.4rem;
    background: linear-gradient(135deg,
        ${p => p.theme?.brand?.primary || '#00adef'},
        ${p => p.theme?.brand?.secondary || '#0090d0'});
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: .85rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    transition: all .2s;
    &:disabled { opacity: .55; cursor: not-allowed; }
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 24px ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    }
`;
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;

// ─── Verdict Banner ──────────────────────────────────────
const VerdictCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => (p.$color || '#94a3b8') + '30'};
    border-radius: 16px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.25rem;
    position: relative;
    overflow: hidden;
    ${css`animation: ${fadeIn} .4s ease-out .1s backwards;`}
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, ${p => p.$color || '#94a3b8'}, transparent);
    }
`;
const VerdictHead = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
`;
const GradeBlock = styled.div`
    flex-shrink: 0;
    width: 130px;
    padding: 1rem;
    background: ${p => (p.$color || '#94a3b8') + '12'};
    border: 1px solid ${p => (p.$color || '#94a3b8') + '30'};
    border-radius: 14px;
    text-align: center;
`;
const Grade = styled.div`
    font-size: 3rem;
    font-weight: 900;
    color: ${p => p.$c || '#94a3b8'};
    line-height: 1;
`;
const GradeDivider = styled.div`
    height: 1px;
    background: ${p => (p.$c || '#94a3b8') + '30'};
    margin: .55rem 0;
`;
const GradeScore = styled.div`
    font-size: 1.4rem;
    font-weight: 900;
    color: ${p => p.$c || '#94a3b8'};
`;
const GradeScoreSub = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    margin-top: .15rem;
`;
const VerdictText = styled.div`flex:1;min-width:240px;`;
const VerdictLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .35rem;
`;
const VerdictBig = styled.div`
    font-size: 1.85rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#fff')};
    margin-bottom: .55rem;
`;
const VerdictBullets = styled.div`
    display: flex;
    flex-direction: column;
    gap: .25rem;
`;
const VerdictBullet = styled.div`
    font-size: .82rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const VerdictCTAs = styled.div`
    display: flex;
    gap: .55rem;
    margin-top: 1rem;
    flex-wrap: wrap;
`;
const PrimaryCTA = styled.button`
    padding: .65rem 1.25rem;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: .8rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    transition: all .2s;
    &:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(16,185,129,.32); }
`;
const SecondaryCTA = styled.button`
    padding: .65rem 1.25rem;
    background: ${p => (p.theme?.brand?.primary || '#00adef') + '12'};
    border: 1px solid ${p => (p.theme?.brand?.primary || '#00adef') + '40'};
    color: ${p => p.theme?.brand?.primary || '#00adef'};
    border-radius: 10px;
    font-size: .8rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    &:hover { background: ${p => (p.theme?.brand?.primary || '#00adef') + '20'}; }
`;

// ─── Metrics Grid ─────────────────────────────────────────
const SectionTitle = styled.h2`
    font-size: .95rem;
    font-weight: 800;
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    margin: 0 0 .3rem;
    display: flex;
    align-items: center;
    gap: .4rem;
`;
const SectionSub = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    margin-bottom: .85rem;
`;
const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: .65rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .15s backwards;`}
`;
const MetricCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: 1rem 1.1rem;
`;
const MetricLabel = styled.div`
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .4rem;
`;
const MetricValue = styled.div`
    font-size: 1.45rem;
    font-weight: 900;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    line-height: 1;
    margin-bottom: .55rem;
`;
const MetricInterp = styled.div`
    font-size: .68rem;
    color: ${p => p.$tone === 'pass' ? '#10b981'
        : p.$tone === 'warn' ? '#ef4444'
        : (p.theme?.text?.tertiary || '#94a3b8')};
    line-height: 1.4;
    display: flex;
    align-items: flex-start;
    gap: .3rem;
`;

// ─── Equity Curve ─────────────────────────────────────────
const ChartCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .2s backwards;`}
`;
const ChartHeight = styled.div`
    width: 100%;
    height: 320px;
    margin-top: .5rem;
`;

// ─── Strengths / Weaknesses ──────────────────────────────
const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .85rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .25s backwards;`}
    @media(max-width:800px){grid-template-columns:1fr;}
`;
const SwCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    border-left: 3px solid ${p => p.$variant === 'strength' ? '#10b981' : '#f59e0b'};
`;
const SwHeader = styled.div`
    display: flex;
    align-items: center;
    gap: .4rem;
    font-size: .75rem;
    font-weight: 800;
    color: ${p => p.$variant === 'strength' ? '#10b981' : '#f59e0b'};
    margin-bottom: .65rem;
    text-transform: uppercase;
    letter-spacing: .5px;
`;
const SwList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: .4rem;
`;
const SwItem = styled.li`
    font-size: .78rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    line-height: 1.4;
    padding-left: 1rem;
    position: relative;
    &::before {
        content: '${p => p.$variant === 'strength' ? '✓' : '⚠'}';
        position: absolute;
        left: 0;
        color: ${p => p.$variant === 'strength' ? '#10b981' : '#f59e0b'};
        font-weight: 800;
    }
`;

// ─── Suggestions ─────────────────────────────────────────
const SuggGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: .75rem;
    margin-bottom: 1.5rem;
    ${css`animation: ${fadeIn} .4s ease-out .3s backwards;`}
`;
const SuggCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 12px;
    padding: 1rem 1.1rem;
    border-left: 3px solid #f59e0b;
    transition: all .2s;
    &:hover {
        transform: translateY(-2px);
        border-color: rgba(245,158,11,.4);
    }
`;
const SuggIconWrap = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 9px;
    background: rgba(245, 158, 11, .12);
    border: 1px solid rgba(245, 158, 11, .25);
    color: #f59e0b;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: .55rem;
`;
const SuggTitle = styled.div`
    font-size: .85rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
    margin-bottom: .35rem;
`;
const SuggBody = styled.div`
    font-size: .72rem;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    line-height: 1.45;
    margin-bottom: .65rem;
`;
const ApplyBtn = styled.button`
    padding: .4rem .8rem;
    background: rgba(245, 158, 11, .12);
    border: 1px solid rgba(245, 158, 11, .35);
    color: #f59e0b;
    border-radius: 7px;
    font-size: .68rem;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: .25rem;
    &:hover { background: rgba(245, 158, 11, .22); }
`;

// ─── Trade Drilldown ─────────────────────────────────────
const DrillCard = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 1.5rem;
`;
const DrillToggle = styled.button`
    width: 100%;
    padding: .85rem 1.15rem;
    background: transparent;
    border: none;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    color: ${p => p.theme?.text?.primary || '#e0e6ed'};
    font-size: .82rem;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:hover { background: rgba(255,255,255,.02); }
`;
const DrillBody = styled.div`
    padding: 1.1rem 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    @media(max-width:700px){grid-template-columns:1fr;}
`;
const DrillBlock = styled.div``;
const DrillTitle = styled.div`
    font-size: .58rem;
    text-transform: uppercase;
    letter-spacing: .6px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    margin-bottom: .55rem;
`;
const WinLossBar = styled.div`
    display: flex;
    flex-direction: column;
    gap: .55rem;
`;
const Bar = styled.div`
    display: flex;
    align-items: center;
    gap: .55rem;
`;
const BarLabel = styled.span`
    font-size: .68rem;
    font-weight: 700;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    width: 70px;
`;
const BarFill = styled.div`
    flex: 1;
    height: 18px;
    background: rgba(255,255,255,.04);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
`;
const BarInner = styled.div`
    height: 100%;
    width: ${p => p.$w}%;
    background: ${p => p.$c};
    border-radius: 4px;
`;
const BarValue = styled.span`
    font-size: .75rem;
    font-weight: 800;
    color: ${p => p.$c || (p.theme?.text?.primary || '#e0e6ed')};
    width: 70px;
    text-align: right;
`;

// ─── Bridge ──────────────────────────────────────────────
const Bridge = styled.div`
    margin-top: 1rem;
    padding: 1.25rem 1.5rem;
    background: linear-gradient(135deg,
        rgba(0, 173, 237, .08),
        rgba(167, 139, 250, .08));
    border: 1px solid rgba(0, 173, 237, .2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
`;
const BridgeText = styled.div`
    font-size: .85rem;
    color: ${p => p.theme?.text?.secondary || '#c8d0da'};
    font-weight: 600;
`;
const BridgeBtns = styled.div`
    display: flex;
    gap: .55rem;
    flex-wrap: wrap;
`;

const Empty = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px dashed ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.1)'};
    border-radius: 14px;
    padding: 3rem 1.5rem;
    text-align: center;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .85rem;
    margin-bottom: 1.5rem;
`;
const LoadingWrap = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.6)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    padding: 3rem;
    text-align: center;
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    font-size: .85rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .55rem;
`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const StrategyLabPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { api } = useAuth();
    const toast = useToast();

    const [config, setConfig] = useState({
        symbol: 'AAPL',
        strategy: 'ma-crossover',
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        initialCapital: 10000,
        parameters: { fastPeriod: 10, slowPeriod: 30 }
    });
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [drillOpen, setDrillOpen] = useState(false);

    const selectedStrategy = STRATEGIES.find(s => s.id === config.strategy);

    // Reset parameters when strategy changes
    useEffect(() => {
        if (!selectedStrategy) return;
        const defaults = {};
        selectedStrategy.parameters.forEach(p => { defaults[p.key] = p.default; });
        setConfig(prev => ({ ...prev, parameters: defaults }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.strategy]);

    const runBacktest = async (overrideConfig) => {
        const cfg = overrideConfig || config;
        if (!cfg.symbol || !cfg.strategy) {
            toast?.error?.('Pick a symbol and strategy first');
            return;
        }
        setRunning(true);
        try {
            const fetcher = (path, body) => api
                ? api.post(path, body).then(r => r.data)
                : fetch(`${API_URL}${path}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }).then(r => r.json());

            const res = await fetcher('/backtest', {
                symbol: cfg.symbol.toUpperCase(),
                strategy: cfg.strategy,
                startDate: cfg.startDate,
                endDate: cfg.endDate,
                initialCapital: parseInt(cfg.initialCapital, 10),
                parameters: cfg.parameters
            });

            if (!res?.success || !res.backtest?._id) {
                toast?.error?.(res?.error || 'Backtest failed');
                return;
            }

            // Pull full result
            const full = api
                ? (await api.get(`/backtest/${res.backtest._id}`)).data
                : await (await fetch(`${API_URL}/backtest/${res.backtest._id}`)).json();

            setResult(full);
            toast?.success?.('Backtest complete');
        } catch (err) {
            console.error('[StrategyLab] backtest failed:', err);
            toast?.error?.(err?.response?.data?.error || 'Backtest failed');
        } finally {
            setRunning(false);
        }
    };

    const updateParam = (key, value) => {
        setConfig(prev => ({
            ...prev,
            parameters: { ...prev.parameters, [key]: parseInt(value, 10) || 0 }
        }));
    };

    const applySuggestion = (sugg) => {
        if (!sugg.action?.params) return;
        const next = { ...config, parameters: sugg.action.params };
        setConfig(next);
        runBacktest(next);
    };

    // ───── Computed ─────
    const metrics = result?.results || result?.backtest?.results || null;
    const equityCurve = result?.equityCurve || result?.backtest?.equityCurve || [];
    const trades = result?.trades || result?.backtest?.trades || [];

    const grade = useMemo(
        () => gradeStrategy(metrics, equityCurve, config.initialCapital),
        [metrics, equityCurve, config.initialCapital]
    );
    const { strengths, weaknesses } = useMemo(
        () => buildStrengthsWeaknesses(metrics, equityCurve, config.initialCapital),
        [metrics, equityCurve, config.initialCapital]
    );
    const suggestions = useMemo(
        () => buildSuggestions(metrics, equityCurve, config.parameters, config.strategy, config.initialCapital),
        [metrics, equityCurve, config.parameters, config.strategy, config.initialCapital]
    );

    // Trade quality stats
    const tradeStats = useMemo(() => {
        if (!metrics) return null;
        const sellTrades = trades.filter(t => t.type === 'sell');
        const wins = sellTrades.filter(t => t.profitPercent > 0);
        const losses = sellTrades.filter(t => t.profitPercent <= 0);

        let longestWinStreak = 0, longestLossStreak = 0, curStreak = 0, curWin = null;
        sellTrades.forEach(t => {
            const isWin = t.profitPercent > 0;
            if (curWin === null || curWin === isWin) {
                curStreak++;
            } else {
                curStreak = 1;
            }
            curWin = isWin;
            if (isWin) longestWinStreak = Math.max(longestWinStreak, curStreak);
            else longestLossStreak = Math.max(longestLossStreak, curStreak);
        });

        return {
            avgWin: Math.abs(metrics.averageWin || 0),
            avgLoss: Math.abs(metrics.averageLoss || 0),
            largestWin: metrics.largestWin || 0,
            largestLoss: metrics.largestLoss || 0,
            wins: wins.length,
            losses: losses.length,
            longestWinStreak,
            longestLossStreak
        };
    }, [metrics, trades]);

    return (
        <Page theme={theme}>
            <SEO
                title="Strategy Lab — Nexus Signal AI"
                description="Test, evaluate, and improve trading strategies — the Lab tells you if it's worth trading and how to make it better."
            />
            <Container>
                {/* ═══ HEADER ═══ */}
                <HeaderRow>
                    <HeaderLeft>
                        <H1 theme={theme}>
                            <Beaker size={28} color={theme?.brand?.primary || '#a78bfa'} />
                            Strategy Lab
                        </H1>
                        <Subhead theme={theme}>
                            Test, evaluate, and improve trading strategies — the Lab tells you if it's worth trading and how to make it better.
                        </Subhead>
                    </HeaderLeft>
                    {result && metrics && (
                        <StatusPill theme={theme}>
                            <StatusDot />
                            {metrics.totalTrades} trades simulated
                        </StatusPill>
                    )}
                </HeaderRow>

                {/* ═══ CONFIG PANEL ═══ */}
                <ConfigCard theme={theme}>
                    <ConfigLabel theme={theme}>Configure Strategy</ConfigLabel>

                    <StratPills>
                        {STRATEGIES.map(s => (
                            <StratPill
                                key={s.id}
                                theme={theme}
                                $active={config.strategy === s.id}
                                onClick={() => setConfig(prev => ({ ...prev, strategy: s.id }))}
                            >
                                {s.name}
                            </StratPill>
                        ))}
                    </StratPills>

                    <ConfigRow>
                        <FieldGroup>
                            <FieldLabel theme={theme}>Symbol</FieldLabel>
                            <Input
                                theme={theme}
                                value={config.symbol}
                                onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                placeholder="AAPL"
                            />
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel theme={theme}>Start Date</FieldLabel>
                            <Input
                                theme={theme}
                                type="date"
                                value={config.startDate}
                                onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel theme={theme}>End Date</FieldLabel>
                            <Input
                                theme={theme}
                                type="date"
                                value={config.endDate}
                                onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </FieldGroup>
                        <FieldGroup>
                            <FieldLabel theme={theme}>Initial Capital</FieldLabel>
                            <Input
                                theme={theme}
                                type="number"
                                value={config.initialCapital}
                                onChange={(e) => setConfig(prev => ({ ...prev, initialCapital: e.target.value }))}
                            />
                        </FieldGroup>
                    </ConfigRow>

                    {selectedStrategy && selectedStrategy.parameters.length > 0 && (
                        <ParamRow>
                            {selectedStrategy.parameters.map(p => {
                                const val = config.parameters[p.key] ?? p.default;
                                return (
                                    <ParamGroup key={p.key}>
                                        <ParamHead>
                                            <ParamLabel theme={theme}>{p.label}</ParamLabel>
                                            <ParamValue theme={theme}>{val}</ParamValue>
                                        </ParamHead>
                                        <Slider
                                            theme={theme}
                                            min={p.min}
                                            max={p.max}
                                            value={val}
                                            onChange={(e) => updateParam(p.key, e.target.value)}
                                        />
                                    </ParamGroup>
                                );
                            })}
                        </ParamRow>
                    )}

                    <RunBtn theme={theme} onClick={() => runBacktest()} disabled={running}>
                        {running ? <SpinningLoader size={14} /> : <Beaker size={14} />}
                        {running ? 'Running...' : 'Run Backtest'}
                    </RunBtn>
                </ConfigCard>

                {/* ═══ EMPTY / LOADING ═══ */}
                {running && !result && (
                    <LoadingWrap theme={theme}>
                        <SpinningLoader size={16} />
                        Simulating strategy on historical data...
                    </LoadingWrap>
                )}
                {!running && !result && (
                    <Empty theme={theme}>
                        <strong style={{ color: theme?.text?.primary || '#e0e6ed', fontSize: '.95rem' }}>
                            Configure a strategy and click Run to start testing
                        </strong><br />
                        The Lab will grade the result, identify strengths and weaknesses, and suggest improvements.
                    </Empty>
                )}

                {/* ═══ VERDICT ═══ */}
                {metrics && grade && (
                    <VerdictCard theme={theme} $color={grade.color}>
                        <VerdictHead>
                            <GradeBlock $color={grade.color}>
                                <Grade $c={grade.color}>{grade.grade}</Grade>
                                <GradeDivider $c={grade.color} />
                                <GradeScore $c={grade.color}>{grade.score}</GradeScore>
                                <GradeScoreSub theme={theme}>/ 100</GradeScoreSub>
                            </GradeBlock>
                            <VerdictText>
                                <VerdictLabel theme={theme}>🧠 Strategy Verdict</VerdictLabel>
                                <VerdictBig $c={grade.color}>{grade.label}</VerdictBig>
                                <VerdictBullets>
                                    <VerdictBullet theme={theme}>
                                        {grade.vsBuyHold >= 0
                                            ? <CheckCircle size={13} color="#10b981" />
                                            : <AlertTriangle size={13} color="#f59e0b" />}
                                        {grade.vsBuyHold >= 0
                                            ? `Beats buy & hold by ${fmtPct(grade.vsBuyHold)}`
                                            : `Underperforms buy & hold by ${fmtPct(Math.abs(grade.vsBuyHold))}`}
                                    </VerdictBullet>
                                    <VerdictBullet theme={theme}>
                                        {(metrics.sharpeRatio || 0) >= 1
                                            ? <CheckCircle size={13} color="#10b981" />
                                            : <AlertTriangle size={13} color="#f59e0b" />}
                                        Sharpe {fmtNum(metrics.sharpeRatio)} — {(metrics.sharpeRatio || 0) >= 1 ? 'solid risk-adjusted return' : 'choppy returns'}
                                    </VerdictBullet>
                                    <VerdictBullet theme={theme}>
                                        <Shield size={13} color={grade.risk.color} />
                                        Risk Level: <strong style={{ color: grade.risk.color }}>{grade.risk.label}</strong> (max DD {fmtPct(metrics.maxDrawdownPercent)})
                                    </VerdictBullet>
                                </VerdictBullets>
                                <VerdictCTAs>
                                    <PrimaryCTA onClick={() => navigate('/paper-trading', {
                                        state: {
                                            signal: {
                                                symbol: config.symbol.toUpperCase(),
                                                long: true,
                                                crypto: false
                                            }
                                        }
                                    })}>
                                        <Copy size={14} /> Paper Trade Strategy
                                    </PrimaryCTA>
                                    <SecondaryCTA theme={theme} onClick={() => navigate('/alerts')}>
                                        <Bell size={14} /> Get Alerts
                                    </SecondaryCTA>
                                </VerdictCTAs>
                            </VerdictText>
                        </VerdictHead>
                    </VerdictCard>
                )}

                {/* ═══ METRICS GRID ═══ */}
                {metrics && (
                    <>
                        <SectionTitle theme={theme}>
                            <BarChart3 size={15} color={theme?.brand?.primary || '#00adef'} />
                            Key Metrics
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Each metric interpreted in plain language — not just raw numbers
                        </SectionSub>
                        <MetricsGrid>
                            {[
                                { key: 'totalReturnPercent', label: 'Total Return', val: metrics.totalReturnPercent, fmt: fmtPct, ctx: grade },
                                { key: 'sharpeRatio', label: 'Sharpe Ratio', val: metrics.sharpeRatio, fmt: (v) => fmtNum(v) },
                                { key: 'maxDrawdownPercent', label: 'Max Drawdown', val: metrics.maxDrawdownPercent, fmt: (v) => fmtPct(-Math.abs(v)) },
                                { key: 'winRate', label: 'Win Rate', val: metrics.winRate, fmt: (v) => `${v?.toFixed(0)}%` },
                                { key: 'profitFactor', label: 'Profit Factor', val: metrics.profitFactor, fmt: (v) => fmtNum(v) },
                                { key: 'totalTrades', label: '# Trades', val: metrics.totalTrades, fmt: (v) => v }
                            ].map(m => {
                                const interp = interpretMetric(m.key, m.val, m.ctx);
                                const color = interp.tone === 'pass' ? '#10b981'
                                    : interp.tone === 'warn' ? '#ef4444'
                                    : (theme?.text?.primary || '#e0e6ed');
                                return (
                                    <MetricCard key={m.key} theme={theme}>
                                        <MetricLabel theme={theme}>{m.label}</MetricLabel>
                                        <MetricValue theme={theme} $c={color}>{m.fmt(m.val)}</MetricValue>
                                        <MetricInterp theme={theme} $tone={interp.tone}>
                                            {interp.tone === 'pass' && <CheckCircle size={11} />}
                                            {interp.tone === 'warn' && <AlertTriangle size={11} />}
                                            {interp.tone === 'mid' && <span>—</span>}
                                            <span>{interp.text}</span>
                                        </MetricInterp>
                                    </MetricCard>
                                );
                            })}
                        </MetricsGrid>
                    </>
                )}

                {/* ═══ EQUITY CURVE ═══ */}
                {equityCurve.length > 0 && (
                    <ChartCard theme={theme}>
                        <SectionTitle theme={theme}>
                            <Activity size={15} color={theme?.brand?.primary || '#00adef'} />
                            Equity Curve vs Buy &amp; Hold
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Strategy performance compared honestly against just holding the asset
                        </SectionSub>
                        <ChartHeight>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={equityCurve}>
                                    <defs>
                                        <linearGradient id="strategyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#00adef" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#00adef" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#475569"
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                                        width={70}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#0f1729',
                                            border: '1px solid rgba(255,255,255,.12)',
                                            borderRadius: '8px',
                                            fontSize: '.78rem'
                                        }}
                                        formatter={(v) => fmtMoney(v)}
                                        labelFormatter={(d) => new Date(d).toLocaleDateString()}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '.72rem' }} iconType="circle" />
                                    <ReferenceLine y={config.initialCapital} stroke="rgba(255,255,255,.15)" strokeDasharray="2 2" />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        name="Strategy"
                                        stroke="#00adef"
                                        strokeWidth={2}
                                        fill="url(#strategyGrad)"
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="benchmark"
                                        name="Buy & Hold"
                                        stroke="#a78bfa"
                                        strokeWidth={1.5}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartHeight>
                    </ChartCard>
                )}

                {/* ═══ STRENGTHS / WEAKNESSES ═══ */}
                {(strengths.length > 0 || weaknesses.length > 0) && (
                    <TwoCol>
                        <SwCard theme={theme} $variant="strength">
                            <SwHeader $variant="strength">
                                <CheckCircle size={14} /> Strengths
                            </SwHeader>
                            {strengths.length === 0 ? (
                                <SwItem theme={theme} $variant="strength" style={{ paddingLeft: 0, '&::before': {} }}>
                                    No standout strengths in this run.
                                </SwItem>
                            ) : (
                                <SwList>
                                    {strengths.map((s, i) => (
                                        <SwItem key={i} theme={theme} $variant="strength">{s}</SwItem>
                                    ))}
                                </SwList>
                            )}
                        </SwCard>
                        <SwCard theme={theme} $variant="weakness">
                            <SwHeader $variant="weakness">
                                <AlertTriangle size={14} /> Weaknesses
                            </SwHeader>
                            {weaknesses.length === 0 ? (
                                <SwItem theme={theme} $variant="weakness" style={{ paddingLeft: 0 }}>
                                    No major weaknesses detected.
                                </SwItem>
                            ) : (
                                <SwList>
                                    {weaknesses.map((w, i) => (
                                        <SwItem key={i} theme={theme} $variant="weakness">{w}</SwItem>
                                    ))}
                                </SwList>
                            )}
                        </SwCard>
                    </TwoCol>
                )}

                {/* ═══ IMPROVEMENT SUGGESTIONS ═══ */}
                {suggestions.length > 0 && (
                    <>
                        <SectionTitle theme={theme}>
                            <Zap size={16} color="#f59e0b" />
                            ⚡ How to Improve
                        </SectionTitle>
                        <SectionSub theme={theme}>
                            Specific tweaks the Lab thinks will improve this strategy
                        </SectionSub>
                        <SuggGrid>
                            {suggestions.map(s => {
                                const Icon = s.icon;
                                return (
                                    <SuggCard key={s.id} theme={theme}>
                                        <SuggIconWrap><Icon size={16} /></SuggIconWrap>
                                        <SuggTitle theme={theme}>{s.title}</SuggTitle>
                                        <SuggBody theme={theme}>{s.body}</SuggBody>
                                        {s.action ? (
                                            <ApplyBtn onClick={() => applySuggestion(s)}>
                                                Apply &amp; Re-run <ChevronRight size={11} />
                                            </ApplyBtn>
                                        ) : (
                                            <ApplyBtn style={{ opacity: .55, cursor: 'default' }}>
                                                Manual tweak
                                            </ApplyBtn>
                                        )}
                                    </SuggCard>
                                );
                            })}
                        </SuggGrid>
                    </>
                )}

                {/* ═══ TRADE QUALITY DRILLDOWN ═══ */}
                {tradeStats && (
                    <DrillCard theme={theme}>
                        <DrillToggle theme={theme} onClick={() => setDrillOpen(v => !v)}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                <BarChart3 size={14} /> Trade Quality Drilldown
                            </span>
                            {drillOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </DrillToggle>
                        {drillOpen && (
                            <DrillBody>
                                <DrillBlock>
                                    <DrillTitle theme={theme}>Avg Win vs Avg Loss</DrillTitle>
                                    <WinLossBar>
                                        <Bar>
                                            <BarLabel theme={theme}>Avg Win</BarLabel>
                                            <BarFill>
                                                <BarInner $w={Math.min(100, (tradeStats.avgWin / Math.max(tradeStats.avgWin, tradeStats.avgLoss, 1)) * 100)} $c="#10b981" />
                                            </BarFill>
                                            <BarValue $c="#10b981">+{tradeStats.avgWin.toFixed(2)}%</BarValue>
                                        </Bar>
                                        <Bar>
                                            <BarLabel theme={theme}>Avg Loss</BarLabel>
                                            <BarFill>
                                                <BarInner $w={Math.min(100, (tradeStats.avgLoss / Math.max(tradeStats.avgWin, tradeStats.avgLoss, 1)) * 100)} $c="#ef4444" />
                                            </BarFill>
                                            <BarValue $c="#ef4444">−{tradeStats.avgLoss.toFixed(2)}%</BarValue>
                                        </Bar>
                                    </WinLossBar>
                                </DrillBlock>
                                <DrillBlock>
                                    <DrillTitle theme={theme}>Win / Loss Distribution</DrillTitle>
                                    <WinLossBar>
                                        <Bar>
                                            <BarLabel theme={theme}>Wins</BarLabel>
                                            <BarFill>
                                                <BarInner $w={(tradeStats.wins / Math.max(1, tradeStats.wins + tradeStats.losses)) * 100} $c="#10b981" />
                                            </BarFill>
                                            <BarValue $c="#10b981">{tradeStats.wins}</BarValue>
                                        </Bar>
                                        <Bar>
                                            <BarLabel theme={theme}>Losses</BarLabel>
                                            <BarFill>
                                                <BarInner $w={(tradeStats.losses / Math.max(1, tradeStats.wins + tradeStats.losses)) * 100} $c="#ef4444" />
                                            </BarFill>
                                            <BarValue $c="#ef4444">{tradeStats.losses}</BarValue>
                                        </Bar>
                                    </WinLossBar>
                                    <div style={{ marginTop: '.85rem', fontSize: '.7rem', color: theme?.text?.tertiary || '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
                                        <span>Largest win: <strong style={{ color: '#10b981' }}>+{tradeStats.largestWin.toFixed(2)}%</strong></span>
                                        <span>Largest loss: <strong style={{ color: '#ef4444' }}>{tradeStats.largestLoss.toFixed(2)}%</strong></span>
                                    </div>
                                    <div style={{ marginTop: '.4rem', fontSize: '.7rem', color: theme?.text?.tertiary || '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
                                        <span>Longest win streak: <strong>{tradeStats.longestWinStreak}</strong></span>
                                        <span>Longest loss streak: <strong>{tradeStats.longestLossStreak}</strong></span>
                                    </div>
                                </DrillBlock>
                            </DrillBody>
                        )}
                    </DrillCard>
                )}

                {/* ═══ BRIDGE ═══ */}
                {result && (
                    <Bridge>
                        <BridgeText theme={theme}>
                            Ready to use this strategy?
                        </BridgeText>
                        <BridgeBtns>
                            <PrimaryCTA onClick={() => navigate('/paper-trading', {
                                state: {
                                    signal: {
                                        symbol: config.symbol.toUpperCase(),
                                        long: true,
                                        crypto: false
                                    }
                                }
                            })}>
                                <Copy size={14} /> Paper Trade
                            </PrimaryCTA>
                            <SecondaryCTA theme={theme} onClick={() => navigate('/alerts')}>
                                <Bell size={14} /> Set Alerts
                            </SecondaryCTA>
                            <SecondaryCTA theme={theme} onClick={() => navigate('/opportunities')}>
                                <Sparkles size={14} /> See Live Opportunities
                            </SecondaryCTA>
                        </BridgeBtns>
                    </Bridge>
                )}
            </Container>
        </Page>
    );
};

export default StrategyLabPage;
