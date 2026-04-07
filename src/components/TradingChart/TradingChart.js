// client/src/components/TradingChart/TradingChart.js
// Pro-level trading chart for Nexus Signal AI. Built on
// lightweight-charts (TradingView) with candlesticks, volume,
// 8 indicators, 7 timeframes, AI overlay (entry/SL/TP1/2/3),
// crosshair tooltip, and theme integration.
//
// Drop-in replacement for the existing AreaChart on asset pages.
// Pass `signal` to render the AI overlay levels.

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { createChart } from 'lightweight-charts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Loader2, RefreshCw } from 'lucide-react';
import {
    sma, ema, bollinger, rsi, macd, vwap, ichimoku,
    stochastic, atr, parabolicSAR, volumeSeries
} from './indicators';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const TIMEFRAMES = [
    { id: '1m',  label: '1m'  },
    { id: '5m',  label: '5m'  },
    { id: '15m', label: '15m' },
    { id: '1h',  label: '1h'  },
    { id: '4h',  label: '4h'  },
    { id: '1D',  label: '1D'  },
    { id: '1W',  label: '1W'  }
];

const INDICATORS = [
    { id: 'sma20',     label: 'SMA 20',  group: 'overlay', color: '#0ea5e9' },
    { id: 'sma50',     label: 'SMA 50',  group: 'overlay', color: '#a78bfa' },
    { id: 'sma200',    label: 'SMA 200', group: 'overlay', color: '#f59e0b' },
    { id: 'ema12',     label: 'EMA 12',  group: 'overlay', color: '#22d3ee' },
    { id: 'ema26',     label: 'EMA 26',  group: 'overlay', color: '#fb7185' },
    { id: 'bollinger', label: 'Bollinger', group: 'overlay', color: '#94a3b8' },
    { id: 'vwap',      label: 'VWAP',    group: 'overlay', color: '#fde047' },
    { id: 'ichimoku',  label: 'Ichimoku', group: 'overlay', color: '#10b981' },
    { id: 'psar',      label: 'P-SAR',   group: 'overlay', color: '#fb923c' },
    { id: 'atr',       label: 'ATR (14)', group: 'overlay', color: '#facc15' },
    { id: 'rsi',       label: 'RSI (14)', group: 'pane',   color: '#a78bfa' },
    { id: 'stoch',     label: 'Stoch',   group: 'pane',    color: '#f472b6' },
    { id: 'macd',      label: 'MACD',    group: 'pane',    color: '#0ea5e9' }
];

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

// ═══════════════════════════════════════════════════════════
// STYLED
// ═══════════════════════════════════════════════════════════
const Wrap = styled.div`
    background: ${p => p.theme?.bg?.elevated || 'rgba(12,16,32,.92)'};
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    border-radius: 14px;
    overflow: hidden;
    ${css`animation: ${fadeIn} .3s ease-out;`}
`;
const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .75rem 1rem;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.06)'};
    flex-wrap: wrap;
    gap: .55rem;
`;
const TitleBlock = styled.div`
    display: flex;
    align-items: baseline;
    gap: .55rem;
    flex-wrap: wrap;
`;
const Sym = styled.div`
    font-size: 1rem;
    font-weight: 900;
    color: ${p => p.theme?.text?.primary || '#fff'};
`;
const SymSub = styled.div`
    font-size: .65rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
`;
const TimeRow = styled.div`
    display: flex;
    gap: .25rem;
    padding: .15rem;
    background: ${p => p.theme?.bg?.subtle || 'rgba(255,255,255,.03)'};
    border-radius: 7px;
`;
const TimeBtn = styled.button`
    padding: .35rem .65rem;
    background: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef') + '20'
        : 'transparent'};
    border: none;
    border-radius: 5px;
    color: ${p => p.$active
        ? (p.theme?.brand?.primary || '#00adef')
        : (p.theme?.text?.tertiary || '#64748b')};
    font-size: .65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .4px;
    cursor: pointer;
    &:hover { color: ${p => p.theme?.text?.primary || '#fff'}; }
`;
const RefreshBtn = styled.button`
    width: 30px;
    height: 30px;
    border-radius: 7px;
    background: rgba(255,255,255,.04);
    border: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.08)'};
    color: ${p => p.theme?.text?.secondary || '#94a3b8'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover { color: ${p => p.theme?.brand?.primary || '#00adef'}; }
`;

// Indicator chip row
const IndRow = styled.div`
    display: flex;
    gap: .35rem;
    padding: .55rem 1rem;
    flex-wrap: wrap;
    border-bottom: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.05)'};
    background: rgba(255,255,255,.015);
`;
const IndChip = styled.button`
    display: inline-flex;
    align-items: center;
    gap: .3rem;
    padding: .3rem .65rem;
    background: ${p => p.$active
        ? (p.$color || '#00adef') + '18'
        : 'rgba(255,255,255,.025)'};
    border: 1px solid ${p => p.$active
        ? (p.$color || '#00adef') + '60'
        : (p.theme?.border?.subtle || 'rgba(255,255,255,.06)')};
    color: ${p => p.$active
        ? (p.$color || '#00adef')
        : (p.theme?.text?.tertiary || '#94a3b8')};
    border-radius: 6px;
    font-size: .62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .3px;
    cursor: pointer;
    transition: all .15s;
    &:hover { color: ${p => p.theme?.text?.primary || '#fff'}; }
`;
const ChipDot = styled.span`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${p => p.$c || '#00adef'};
`;

// Chart container — lightweight-charts mounts here
const ChartHost = styled.div`
    position: relative;
    width: 100%;
    height: ${p => p.$h || 480}px;
    background: ${p => p.theme?.bg?.subtle || '#0a0e1e'};
`;
const RsiHost = styled.div`
    width: 100%;
    height: 100px;
    background: ${p => p.theme?.bg?.subtle || '#0a0e1e'};
    border-top: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.06)'};
`;
const MacdHost = styled.div`
    width: 100%;
    height: 110px;
    background: ${p => p.theme?.bg?.subtle || '#0a0e1e'};
    border-top: 1px solid ${p => p.theme?.border?.subtle || 'rgba(255,255,255,.06)'};
`;
const PaneLabel = styled.div`
    position: absolute;
    top: .35rem;
    left: .55rem;
    font-size: .55rem;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-weight: 800;
    pointer-events: none;
    z-index: 2;
`;
const PaneWrap = styled.div`position:relative;`;

// Loading overlay
const LoadingOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .55rem;
    color: ${p => p.theme?.text?.tertiary || '#64748b'};
    font-size: .82rem;
    background: ${p => p.theme?.bg?.subtle || '#0a0e1e'};
    z-index: 5;
`;
const SpinningLoader = styled(Loader2)`
    ${css`animation: ${spin} 1s linear infinite;`}
`;
const ErrorMsg = styled.div`
    color: #ef4444;
    text-align: center;
    padding: 1rem;
`;

// Live price tag overlay (top right)
const PriceTag = styled.div`
    position: absolute;
    top: .55rem;
    right: .85rem;
    padding: .35rem .65rem;
    background: rgba(12, 16, 32, .85);
    border: 1px solid ${p => p.$pos
        ? 'rgba(16,185,129,.35)'
        : 'rgba(239,68,68,.35)'};
    border-radius: 7px;
    font-size: .78rem;
    font-weight: 900;
    color: ${p => p.$pos ? '#10b981' : '#ef4444'};
    z-index: 3;
    backdrop-filter: blur(6px);
`;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
// Normalize a raw candle row to lightweight-charts format
function normalizeCandle(c) {
    if (!c) return null;
    let time = c.time ?? c.date;
    if (typeof time === 'string') {
        time = Math.floor(new Date(time).getTime() / 1000);
    } else if (typeof time === 'number') {
        // If milliseconds (>1e12), convert to seconds
        if (time > 1e12) time = Math.floor(time / 1000);
    } else {
        return null;
    }
    if (
        typeof c.open !== 'number' || typeof c.high !== 'number' ||
        typeof c.low !== 'number' || typeof c.close !== 'number'
    ) return null;
    return {
        time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume || 0
    };
}

// Lightweight-charts requires: strictly ascending time, no duplicates
function dedupeAndSort(candles) {
    const seen = new Map();
    candles.forEach(c => { if (c) seen.set(c.time, c); });
    return Array.from(seen.values()).sort((a, b) => a.time - b.time);
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const TradingChart = ({
    symbol,
    isCrypto = false,
    defaultTimeframe = '1D',
    signal = null,
    height = 480
}) => {
    const { api } = useAuth();
    const { theme } = useTheme();

    const chartHostRef = useRef(null);
    const rsiHostRef = useRef(null);
    const macdHostRef = useRef(null);

    const chartRef = useRef(null);
    const candleSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const indicatorSeriesRef = useRef({}); // id -> series instance(s)
    const priceLinesRef = useRef([]); // signal overlay lines
    const rsiChartRef = useRef(null);
    const rsiSeriesRef = useRef(null);
    const macdChartRef = useRef(null);
    const macdSeriesRef = useRef({});
    const stochHostRef = useRef(null);
    const stochChartRef = useRef(null);
    const stochSeriesRef = useRef({});
    const lastFitTfRef = useRef(null); // last timeframe we called fitContent for
    const [atrValue, setAtrValue] = useState(null);

    const [timeframe, setTimeframe] = useState(defaultTimeframe);
    const [activeIndicators, setActiveIndicators] = useState(new Set(['sma20', 'sma50']));
    const [candles, setCandles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // ───── Fetch candles ─────
    const fetchCandles = useCallback(async (showSpinner = true) => {
        if (!symbol) return;
        if (showSpinner) setLoading(true);
        else setRefreshing(true);
        setError(null);

        try {
            const sym = String(symbol).toUpperCase();
            const path = `/chart/${encodeURIComponent(sym)}/${encodeURIComponent(timeframe)}?_t=${Date.now()}`;
            const res = api
                ? await api.get(path)
                : await (await fetch(`${API_URL}${path}`)).json().then(d => ({ data: d }));

            const raw = res?.data?.data || res?.data || [];
            if (!Array.isArray(raw) || raw.length === 0) {
                setCandles([]);
                setError('No chart data available for this symbol or timeframe.');
                return;
            }
            const cleaned = dedupeAndSort(raw.map(normalizeCandle).filter(Boolean));
            if (cleaned.length === 0) {
                setError('No valid candle data returned.');
                setCandles([]);
                return;
            }
            setCandles(cleaned);
        } catch (e) {
            console.error('[TradingChart] fetch failed:', e);
            setError('Failed to load chart data');
            setCandles([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, symbol, timeframe]);

    useEffect(() => { fetchCandles(true); }, [fetchCandles]);

    // Auto-refresh for live timeframes
    useEffect(() => {
        const isIntraday = ['1m', '5m', '15m', '1h', '4h'].includes(timeframe);
        if (!isIntraday) return undefined;
        const iv = setInterval(() => fetchCandles(false), 30000);
        return () => clearInterval(iv);
    }, [timeframe, fetchCandles]);

    // ───── Init main chart on mount ─────
    useEffect(() => {
        if (!chartHostRef.current) return undefined;

        const chart = createChart(chartHostRef.current, {
            width: chartHostRef.current.clientWidth,
            height: height,
            layout: {
                background: { color: 'transparent' },
                textColor: '#94a3b8',
                fontSize: 11,
                fontFamily: 'system-ui, sans-serif'
            },
            grid: {
                vertLines: { color: 'rgba(255,255,255,.04)' },
                horzLines: { color: 'rgba(255,255,255,.04)' }
            },
            rightPriceScale: {
                borderColor: 'rgba(255,255,255,.06)',
                scaleMargins: { top: 0.05, bottom: 0.25 }
            },
            timeScale: {
                borderColor: 'rgba(255,255,255,.06)',
                timeVisible: true,
                secondsVisible: false
            },
            crosshair: {
                mode: 0, // normal crosshair
                vertLine: { color: 'rgba(167,139,250,.35)', width: 1, style: 2, labelBackgroundColor: '#a78bfa' },
                horzLine: { color: 'rgba(167,139,250,.35)', width: 1, style: 2, labelBackgroundColor: '#a78bfa' }
            },
            handleScroll: true,
            handleScale: true
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#10b981',
            downColor: '#ef4444',
            borderUpColor: '#10b981',
            borderDownColor: '#ef4444',
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444'
        });

        // Volume — separate price scale on the bottom
        const volSeries = chart.addHistogramSeries({
            color: 'rgba(100,116,139,.5)',
            priceFormat: { type: 'volume' },
            priceScaleId: 'vol'
        });
        chart.priceScale('vol').applyOptions({
            scaleMargins: { top: 0.78, bottom: 0 }
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;
        volumeSeriesRef.current = volSeries;

        // Resize observer
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                chart.applyOptions({ width: Math.floor(width), height: height });
            }
        });
        ro.observe(chartHostRef.current);

        return () => {
            ro.disconnect();
            try { chart.remove(); } catch {}
            chartRef.current = null;
            candleSeriesRef.current = null;
            volumeSeriesRef.current = null;
            indicatorSeriesRef.current = {};
            priceLinesRef.current = [];
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height]);

    // ───── Init RSI sub-chart on mount ─────
    useEffect(() => {
        if (!rsiHostRef.current) return undefined;
        const chart = createChart(rsiHostRef.current, {
            // Host is display:none until user enables RSI, so clientWidth may be 0 — fall back.
            width: rsiHostRef.current.clientWidth || 600,
            height: 100,
            layout: { background: { color: 'transparent' }, textColor: '#94a3b8', fontSize: 10 },
            grid: { vertLines: { color: 'rgba(255,255,255,.04)' }, horzLines: { color: 'rgba(255,255,255,.04)' } },
            rightPriceScale: { borderColor: 'rgba(255,255,255,.06)' },
            timeScale: { visible: false, borderColor: 'rgba(255,255,255,.06)' },
            crosshair: {
                vertLine: { color: 'rgba(167,139,250,.35)', width: 1, style: 2 },
                horzLine: { color: 'rgba(167,139,250,.35)', width: 1, style: 2 }
            }
        });
        const series = chart.addLineSeries({ color: '#a78bfa', lineWidth: 2 });
        // Overbought/oversold reference lines
        series.createPriceLine({ price: 70, color: 'rgba(239,68,68,.45)', lineWidth: 1, lineStyle: 2, axisLabelVisible: false });
        series.createPriceLine({ price: 30, color: 'rgba(16,185,129,.45)', lineWidth: 1, lineStyle: 2, axisLabelVisible: false });
        rsiChartRef.current = chart;
        rsiSeriesRef.current = series;

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                chart.applyOptions({ width: Math.floor(entry.contentRect.width) });
            }
        });
        ro.observe(rsiHostRef.current);

        return () => {
            ro.disconnect();
            try { chart.remove(); } catch {}
            rsiChartRef.current = null;
            rsiSeriesRef.current = null;
        };
    }, []);

    // ───── Init MACD sub-chart on mount ─────
    useEffect(() => {
        if (!macdHostRef.current) return undefined;
        const chart = createChart(macdHostRef.current, {
            // Host is display:none until user enables MACD, so clientWidth may be 0 — fall back.
            width: macdHostRef.current.clientWidth || 600,
            height: 110,
            layout: { background: { color: 'transparent' }, textColor: '#94a3b8', fontSize: 10 },
            grid: { vertLines: { color: 'rgba(255,255,255,.04)' }, horzLines: { color: 'rgba(255,255,255,.04)' } },
            rightPriceScale: { borderColor: 'rgba(255,255,255,.06)' },
            timeScale: { visible: false, borderColor: 'rgba(255,255,255,.06)' },
            crosshair: {
                vertLine: { color: 'rgba(167,139,250,.35)', width: 1, style: 2 },
                horzLine: { color: 'rgba(167,139,250,.35)', width: 1, style: 2 }
            }
        });
        const histSeries = chart.addHistogramSeries({ priceFormat: { type: 'price', precision: 4, minMove: 0.0001 } });
        const lineSeries = chart.addLineSeries({ color: '#0ea5e9', lineWidth: 2 });
        const signalSeries = chart.addLineSeries({ color: '#fb7185', lineWidth: 2 });
        macdChartRef.current = chart;
        macdSeriesRef.current = { hist: histSeries, line: lineSeries, signal: signalSeries };

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                chart.applyOptions({ width: Math.floor(entry.contentRect.width) });
            }
        });
        ro.observe(macdHostRef.current);

        return () => {
            ro.disconnect();
            try { chart.remove(); } catch {}
            macdChartRef.current = null;
            macdSeriesRef.current = {};
        };
    }, []);

    // ───── Sync candle data ─────
    useEffect(() => {
        if (!candleSeriesRef.current || candles.length === 0) return;
        try {
            candleSeriesRef.current.setData(candles);
            volumeSeriesRef.current?.setData(volumeSeries(candles));
            // Only fit content when timeframe changes (or first load) — never on auto-refresh,
            // otherwise the user's pan/zoom gets destroyed every 30s.
            if (lastFitTfRef.current !== timeframe) {
                chartRef.current?.timeScale().fitContent();
                lastFitTfRef.current = timeframe;
            }
        } catch (e) {
            console.error('[TradingChart] setData failed:', e);
        }
    }, [candles, timeframe]);

    // ───── Sync indicator overlays ─────
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart || candles.length === 0) return;

        // Helper to remove a series cleanly
        const remove = (id) => {
            const existing = indicatorSeriesRef.current[id];
            if (!existing) return;
            try {
                if (Array.isArray(existing)) {
                    existing.forEach(s => chart.removeSeries(s));
                } else {
                    chart.removeSeries(existing);
                }
            } catch {}
            delete indicatorSeriesRef.current[id];
        };

        // Remove all old overlay indicators (we re-add active ones)
        ['sma20', 'sma50', 'sma200', 'ema12', 'ema26', 'bollinger', 'vwap', 'ichimoku', 'psar'].forEach(remove);

        // Add active overlay indicators
        if (activeIndicators.has('sma20')) {
            const s = chart.addLineSeries({ color: '#0ea5e9', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
            s.setData(sma(candles, 20));
            indicatorSeriesRef.current.sma20 = s;
        }
        if (activeIndicators.has('sma50')) {
            const s = chart.addLineSeries({ color: '#a78bfa', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
            s.setData(sma(candles, 50));
            indicatorSeriesRef.current.sma50 = s;
        }
        if (activeIndicators.has('sma200')) {
            const s = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
            s.setData(sma(candles, 200));
            indicatorSeriesRef.current.sma200 = s;
        }
        if (activeIndicators.has('ema12')) {
            const s = chart.addLineSeries({ color: '#22d3ee', lineWidth: 1.5, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
            s.setData(ema(candles, 12));
            indicatorSeriesRef.current.ema12 = s;
        }
        if (activeIndicators.has('ema26')) {
            const s = chart.addLineSeries({ color: '#fb7185', lineWidth: 1.5, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
            s.setData(ema(candles, 26));
            indicatorSeriesRef.current.ema26 = s;
        }
        if (activeIndicators.has('bollinger')) {
            const bb = bollinger(candles, 20, 2);
            const upper = chart.addLineSeries({ color: 'rgba(148,163,184,.7)', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
            const middle = chart.addLineSeries({ color: 'rgba(148,163,184,.5)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
            const lower = chart.addLineSeries({ color: 'rgba(148,163,184,.7)', lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
            upper.setData(bb.upper);
            middle.setData(bb.middle);
            lower.setData(bb.lower);
            indicatorSeriesRef.current.bollinger = [upper, middle, lower];
        }
        if (activeIndicators.has('vwap')) {
            const s = chart.addLineSeries({ color: '#fde047', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
            s.setData(vwap(candles));
            indicatorSeriesRef.current.vwap = s;
        }
        if (activeIndicators.has('psar')) {
            // Render Parabolic SAR as a thin line series with no connection — actually
            // lightweight-charts doesn't have a native scatter, so we use a line series
            // with `lineVisible: false` and large point markers via a histogram-style trick.
            // Simplest portable approach: a line series with very thin lines so it visually
            // reads as dot trail across the price action.
            const psarData = parabolicSAR(candles);
            const s = chart.addLineSeries({
                color: '#fb923c',
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false,
                pointMarkersVisible: true,
                pointMarkersRadius: 2,
                lineStyle: 0
            });
            s.setData(psarData);
            indicatorSeriesRef.current.psar = s;
        }
        if (activeIndicators.has('ichimoku')) {
            const ich = ichimoku(candles);
            // Tenkan (conversion) — fast amber
            const tenkan = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
            tenkan.setData(ich.tenkan);
            // Kijun (base) — slow sky-blue
            const kijun = chart.addLineSeries({ color: '#0ea5e9', lineWidth: 1.5, priceLineVisible: false, lastValueVisible: false });
            kijun.setData(ich.kijun);
            // Span A & B — semi-transparent thicker lines that visually approximate the cloud
            const spanA = chart.addLineSeries({ color: 'rgba(16,185,129,.55)', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
            spanA.setData(ich.spanA);
            const spanB = chart.addLineSeries({ color: 'rgba(239,68,68,.55)', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
            spanB.setData(ich.spanB);
            // Chikou (lagging) — dashed violet
            const chikou = chart.addLineSeries({ color: '#a78bfa', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
            chikou.setData(ich.chikou);
            indicatorSeriesRef.current.ichimoku = [tenkan, kijun, spanA, spanB, chikou];
        }
    }, [activeIndicators, candles]);

    // ───── Sync RSI sub-chart ─────
    useEffect(() => {
        if (!rsiSeriesRef.current || candles.length === 0) return;
        if (activeIndicators.has('rsi')) {
            try { rsiSeriesRef.current.setData(rsi(candles, 14)); } catch {}
        } else {
            try { rsiSeriesRef.current.setData([]); } catch {}
        }
    }, [activeIndicators, candles]);

    // ───── Init Stochastic sub-chart on mount ─────
    useEffect(() => {
        if (!stochHostRef.current) return undefined;
        const chart = createChart(stochHostRef.current, {
            width: stochHostRef.current.clientWidth || 600,
            height: 100,
            layout: { background: { color: 'transparent' }, textColor: '#94a3b8', fontSize: 10 },
            grid: { vertLines: { color: 'rgba(255,255,255,.04)' }, horzLines: { color: 'rgba(255,255,255,.04)' } },
            rightPriceScale: { borderColor: 'rgba(255,255,255,.06)' },
            timeScale: { visible: false, borderColor: 'rgba(255,255,255,.06)' },
            crosshair: {
                vertLine: { color: 'rgba(244,114,182,.35)', width: 1, style: 2 },
                horzLine: { color: 'rgba(244,114,182,.35)', width: 1, style: 2 }
            }
        });
        const kSer = chart.addLineSeries({ color: '#f472b6', lineWidth: 2 });
        const dSer = chart.addLineSeries({ color: '#0ea5e9', lineWidth: 1.5 });
        kSer.createPriceLine({ price: 80, color: 'rgba(239,68,68,.45)', lineWidth: 1, lineStyle: 2, axisLabelVisible: false });
        kSer.createPriceLine({ price: 20, color: 'rgba(16,185,129,.45)', lineWidth: 1, lineStyle: 2, axisLabelVisible: false });
        stochChartRef.current = chart;
        stochSeriesRef.current = { k: kSer, d: dSer };
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                chart.applyOptions({ width: Math.floor(entry.contentRect.width) });
            }
        });
        ro.observe(stochHostRef.current);
        return () => {
            ro.disconnect();
            try { chart.remove(); } catch {}
            stochChartRef.current = null;
            stochSeriesRef.current = {};
        };
    }, []);

    // ───── Sync Stochastic sub-chart ─────
    useEffect(() => {
        const series = stochSeriesRef.current;
        if (!series.k || candles.length === 0) return;
        if (activeIndicators.has('stoch')) {
            try {
                const st = stochastic(candles);
                series.k.setData(st.k);
                series.d.setData(st.d);
            } catch {}
        } else {
            try { series.k.setData([]); series.d.setData([]); } catch {}
        }
    }, [activeIndicators, candles]);

    // ───── Compute ATR badge value ─────
    useEffect(() => {
        if (!activeIndicators.has('atr') || candles.length < 16) {
            setAtrValue(null);
            return;
        }
        try {
            const a = atr(candles, 14);
            const last = a[a.length - 1];
            setAtrValue(last ? last.value : null);
        } catch {
            setAtrValue(null);
        }
    }, [activeIndicators, candles]);

    // ───── Sync MACD sub-chart ─────
    useEffect(() => {
        const series = macdSeriesRef.current;
        if (!series.line || candles.length === 0) return;
        if (activeIndicators.has('macd')) {
            try {
                const m = macd(candles);
                series.line.setData(m.line);
                series.signal.setData(m.signal);
                series.hist.setData(m.histogram);
            } catch {}
        } else {
            try {
                series.line.setData([]);
                series.signal.setData([]);
                series.hist.setData([]);
            } catch {}
        }
    }, [activeIndicators, candles]);

    // ───── Sync AI overlay (signal levels) ─────
    useEffect(() => {
        const candleSeries = candleSeriesRef.current;
        if (!candleSeries) return;

        // Remove existing lines
        priceLinesRef.current.forEach(line => {
            try { candleSeries.removePriceLine(line); } catch {}
        });
        priceLinesRef.current = [];

        if (!signal) return;

        const lines = [];
        if (typeof signal.entry === 'number' && signal.entry > 0) {
            lines.push(candleSeries.createPriceLine({
                price: signal.entry,
                color: '#ffffff',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'ENTRY'
            }));
        }
        if (typeof signal.sl === 'number' && signal.sl > 0) {
            lines.push(candleSeries.createPriceLine({
                price: signal.sl,
                color: '#ef4444',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'SL'
            }));
        }
        if (typeof signal.tp1 === 'number' && signal.tp1 > 0) {
            lines.push(candleSeries.createPriceLine({
                price: signal.tp1,
                color: 'rgba(16,185,129,.7)',
                lineWidth: 1,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'TP1'
            }));
        }
        if (typeof signal.tp2 === 'number' && signal.tp2 > 0) {
            lines.push(candleSeries.createPriceLine({
                price: signal.tp2,
                color: 'rgba(16,185,129,.85)',
                lineWidth: 1,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'TP2'
            }));
        }
        if (typeof signal.tp3 === 'number' && signal.tp3 > 0) {
            lines.push(candleSeries.createPriceLine({
                price: signal.tp3,
                color: '#10b981',
                lineWidth: 2,
                lineStyle: 2,
                axisLabelVisible: true,
                title: 'TP3'
            }));
        }
        priceLinesRef.current = lines;
    }, [signal, candles]);

    const toggleIndicator = (id) => {
        setActiveIndicators(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Derived: latest candle for the price tag
    const latest = candles[candles.length - 1] || null;
    const prev = candles[candles.length - 2] || null;
    const change = latest && prev ? ((latest.close - prev.close) / prev.close) * 100 : null;

    const showRsiPane = activeIndicators.has('rsi');
    const showMacdPane = activeIndicators.has('macd');
    const showStochPane = activeIndicators.has('stoch');

    // When a sub-pane becomes visible after being hidden via display:none, the chart
    // instance still thinks its width is 0. Force a resize to the host's actual width.
    useEffect(() => {
        if (showRsiPane && rsiChartRef.current && rsiHostRef.current) {
            const w = rsiHostRef.current.clientWidth;
            if (w > 0) rsiChartRef.current.applyOptions({ width: Math.floor(w) });
        }
    }, [showRsiPane]);
    useEffect(() => {
        if (showMacdPane && macdChartRef.current && macdHostRef.current) {
            const w = macdHostRef.current.clientWidth;
            if (w > 0) macdChartRef.current.applyOptions({ width: Math.floor(w) });
        }
    }, [showMacdPane]);
    useEffect(() => {
        if (showStochPane && stochChartRef.current && stochHostRef.current) {
            const w = stochHostRef.current.clientWidth;
            if (w > 0) stochChartRef.current.applyOptions({ width: Math.floor(w) });
        }
    }, [showStochPane]);

    return (
        <Wrap theme={theme}>
            {/* Toolbar */}
            <Toolbar theme={theme}>
                <TitleBlock>
                    <Sym theme={theme}>{String(symbol || '').toUpperCase()}</Sym>
                    <SymSub theme={theme}>· {timeframe} · {isCrypto ? 'Crypto' : 'Stock'}</SymSub>
                </TitleBlock>
                <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <TimeRow theme={theme}>
                        {TIMEFRAMES.map(tf => (
                            <TimeBtn
                                key={tf.id}
                                theme={theme}
                                $active={timeframe === tf.id}
                                onClick={() => setTimeframe(tf.id)}
                            >
                                {tf.label}
                            </TimeBtn>
                        ))}
                    </TimeRow>
                    <RefreshBtn theme={theme} onClick={() => fetchCandles(false)} title="Refresh">
                        {refreshing
                            ? <SpinningLoader size={13} />
                            : <RefreshCw size={13} />}
                    </RefreshBtn>
                </div>
            </Toolbar>

            {/* Indicator chip row */}
            <IndRow theme={theme}>
                {INDICATORS.map(ind => (
                    <IndChip
                        key={ind.id}
                        theme={theme}
                        $active={activeIndicators.has(ind.id)}
                        $color={ind.color}
                        onClick={() => toggleIndicator(ind.id)}
                    >
                        <ChipDot $c={ind.color} />
                        {ind.label}
                    </IndChip>
                ))}
            </IndRow>

            {/* Main chart */}
            <PaneWrap>
                <ChartHost theme={theme} ref={chartHostRef} $h={height}>
                    {(loading || error) && (
                        <LoadingOverlay theme={theme}>
                            {loading && !error && <SpinningLoader size={22} />}
                            {loading && !error && <div>Loading {symbol} {timeframe}...</div>}
                            {error && <ErrorMsg>{error}</ErrorMsg>}
                        </LoadingOverlay>
                    )}
                    {latest && change !== null && !loading && !error && (
                        <PriceTag $pos={change >= 0}>
                            ${latest.close.toLocaleString(undefined, { maximumFractionDigits: latest.close >= 1 ? 2 : 6 })}
                            {' '}
                            ({change >= 0 ? '+' : ''}{change.toFixed(2)}%)
                        </PriceTag>
                    )}
                    {atrValue !== null && !loading && !error && (
                        <div style={{
                            position: 'absolute',
                            top: '.55rem',
                            left: '.85rem',
                            padding: '.3rem .55rem',
                            background: 'rgba(12,16,32,.85)',
                            border: '1px solid rgba(250,204,21,.4)',
                            borderRadius: 6,
                            fontSize: '.65rem',
                            fontWeight: 800,
                            color: '#facc15',
                            zIndex: 3,
                            backdropFilter: 'blur(6px)',
                            letterSpacing: '.4px'
                        }}>
                            ATR 14: {atrValue.toLocaleString(undefined, { maximumFractionDigits: atrValue >= 1 ? 2 : 6 })}
                        </div>
                    )}
                </ChartHost>
            </PaneWrap>

            {/* RSI sub-pane — always mounted so the chart instance has a stable host;
                hidden via display:none when inactive */}
            <PaneWrap style={{ display: showRsiPane ? 'block' : 'none' }}>
                <RsiHost theme={theme} ref={rsiHostRef} />
                <PaneLabel theme={theme}>RSI 14</PaneLabel>
            </PaneWrap>

            {/* Stochastic sub-pane */}
            <PaneWrap style={{ display: showStochPane ? 'block' : 'none' }}>
                <RsiHost theme={theme} ref={stochHostRef} />
                <PaneLabel theme={theme}>STOCH 14/3</PaneLabel>
            </PaneWrap>

            {/* MACD sub-pane — same pattern as RSI */}
            <PaneWrap style={{ display: showMacdPane ? 'block' : 'none' }}>
                <MacdHost theme={theme} ref={macdHostRef} />
                <PaneLabel theme={theme}>MACD 12/26/9</PaneLabel>
            </PaneWrap>
        </Wrap>
    );
};

export default TradingChart;
