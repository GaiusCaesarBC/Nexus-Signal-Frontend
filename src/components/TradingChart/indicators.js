// client/src/components/TradingChart/indicators.js
// Pure-JS technical indicator math. Each function takes the raw candle
// array (or close array) and returns an array of {time, value} points
// ready for lightweight-charts to consume.
//
// All time values are in seconds (lightweight-charts UTC seconds format).

// ═══════════════════════════════════════════════════════════
// SIMPLE MOVING AVERAGE
// ═══════════════════════════════════════════════════════════
export function sma(candles, period) {
    if (!candles || candles.length < period) return [];
    const out = [];
    let sum = 0;
    for (let i = 0; i < candles.length; i++) {
        sum += candles[i].close;
        if (i >= period) sum -= candles[i - period].close;
        if (i >= period - 1) {
            out.push({ time: candles[i].time, value: sum / period });
        }
    }
    return out;
}

// ═══════════════════════════════════════════════════════════
// EXPONENTIAL MOVING AVERAGE
// ═══════════════════════════════════════════════════════════
export function ema(candles, period) {
    if (!candles || candles.length < period) return [];
    const k = 2 / (period + 1);
    const out = [];
    // Seed with SMA of first `period` candles
    let prev = 0;
    for (let i = 0; i < period; i++) prev += candles[i].close;
    prev /= period;
    out.push({ time: candles[period - 1].time, value: prev });
    for (let i = period; i < candles.length; i++) {
        prev = candles[i].close * k + prev * (1 - k);
        out.push({ time: candles[i].time, value: prev });
    }
    return out;
}

// Internal: returns ema as a flat array aligned with candles (with leading nulls)
function emaArray(closes, period) {
    if (!closes || closes.length < period) return [];
    const k = 2 / (period + 1);
    const out = new Array(closes.length).fill(null);
    let prev = 0;
    for (let i = 0; i < period; i++) prev += closes[i];
    prev /= period;
    out[period - 1] = prev;
    for (let i = period; i < closes.length; i++) {
        prev = closes[i] * k + prev * (1 - k);
        out[i] = prev;
    }
    return out;
}

// ═══════════════════════════════════════════════════════════
// BOLLINGER BANDS — SMA ± 2 stddev
// Returns { upper, middle, lower } each as {time, value}[]
// ═══════════════════════════════════════════════════════════
export function bollinger(candles, period = 20, mult = 2) {
    if (!candles || candles.length < period) return { upper: [], middle: [], lower: [] };
    const upper = [], middle = [], lower = [];
    for (let i = period - 1; i < candles.length; i++) {
        const slice = candles.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, c) => a + c.close, 0) / period;
        const variance = slice.reduce((a, c) => a + (c.close - mean) ** 2, 0) / period;
        const stdDev = Math.sqrt(variance);
        const t = candles[i].time;
        middle.push({ time: t, value: mean });
        upper.push({ time: t, value: mean + mult * stdDev });
        lower.push({ time: t, value: mean - mult * stdDev });
    }
    return { upper, middle, lower };
}

// ═══════════════════════════════════════════════════════════
// RSI — Wilder's smoothing
// Returns {time, value}[] in 0-100 range
// ═══════════════════════════════════════════════════════════
export function rsi(candles, period = 14) {
    if (!candles || candles.length <= period) return [];
    const out = [];
    let avgGain = 0, avgLoss = 0;
    // Seed with first `period` periods
    for (let i = 1; i <= period; i++) {
        const diff = candles[i].close - candles[i - 1].close;
        if (diff >= 0) avgGain += diff;
        else avgLoss -= diff;
    }
    avgGain /= period;
    avgLoss /= period;
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsiVal = 100 - 100 / (1 + rs);
    out.push({ time: candles[period].time, value: rsiVal });
    for (let i = period + 1; i < candles.length; i++) {
        const diff = candles[i].close - candles[i - 1].close;
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
        rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsiVal = 100 - 100 / (1 + rs);
        out.push({ time: candles[i].time, value: rsiVal });
    }
    return out;
}

// ═══════════════════════════════════════════════════════════
// MACD — fast EMA - slow EMA, signal = EMA of MACD line
// Returns { line, signal, histogram } each as {time, value}[]
// histogram entries also include `color` field for green/red bars
// ═══════════════════════════════════════════════════════════
export function macd(candles, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (!candles || candles.length < slowPeriod + signalPeriod) {
        return { line: [], signal: [], histogram: [] };
    }
    const closes = candles.map(c => c.close);
    const fastEma = emaArray(closes, fastPeriod);
    const slowEma = emaArray(closes, slowPeriod);

    // MACD line = fast - slow (only valid where both exist)
    const macdLine = closes.map((_, i) => {
        if (fastEma[i] === null || slowEma[i] === null) return null;
        return fastEma[i] - slowEma[i];
    });

    // Signal line = EMA of MACD (skip nulls)
    const validStart = macdLine.findIndex(v => v !== null);
    const validMacdSlice = macdLine.slice(validStart).filter(v => v !== null);
    const signalEma = emaArray(validMacdSlice, signalPeriod);

    const line = [];
    const signal = [];
    const histogram = [];

    for (let i = 0; i < candles.length; i++) {
        if (macdLine[i] === null) continue;
        const t = candles[i].time;
        line.push({ time: t, value: macdLine[i] });

        const sigIdx = i - validStart;
        if (sigIdx >= 0 && signalEma[sigIdx] !== null && signalEma[sigIdx] !== undefined) {
            signal.push({ time: t, value: signalEma[sigIdx] });
            const hist = macdLine[i] - signalEma[sigIdx];
            histogram.push({
                time: t,
                value: hist,
                color: hist >= 0 ? 'rgba(16, 185, 129, .65)' : 'rgba(239, 68, 68, .65)'
            });
        }
    }

    return { line, signal, histogram };
}

// ═══════════════════════════════════════════════════════════
// VWAP — Volume-Weighted Average Price (cumulative, intraday)
// ═══════════════════════════════════════════════════════════
export function vwap(candles) {
    if (!candles || candles.length === 0) return [];
    const out = [];
    let cumulativeTPV = 0; // typical price * volume
    let cumulativeVol = 0;
    let lastDate = null;
    for (const c of candles) {
        // Reset on day boundary so VWAP is intraday
        const dayKey = new Date(c.time * 1000).toISOString().slice(0, 10);
        if (dayKey !== lastDate) {
            cumulativeTPV = 0;
            cumulativeVol = 0;
            lastDate = dayKey;
        }
        const typical = (c.high + c.low + c.close) / 3;
        cumulativeTPV += typical * (c.volume || 0);
        cumulativeVol += (c.volume || 0);
        out.push({
            time: c.time,
            value: cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : c.close
        });
    }
    return out;
}

// ═══════════════════════════════════════════════════════════
// VOLUME — convert candles to histogram series with red/green colors
// ═══════════════════════════════════════════════════════════
export function volumeSeries(candles) {
    if (!candles) return [];
    return candles.map(c => ({
        time: c.time,
        value: c.volume || 0,
        color: c.close >= c.open
            ? 'rgba(16, 185, 129, .55)'
            : 'rgba(239, 68, 68, .55)'
    }));
}
