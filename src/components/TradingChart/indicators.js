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
// ICHIMOKU CLOUD
// Returns { tenkan, kijun, spanA, spanB, chikou } as {time, value}[]
// SpanA / SpanB are projected `displacement` periods forward.
// Chikou is the close price displaced backward.
// ═══════════════════════════════════════════════════════════
export function ichimoku(candles, tenkanPeriod = 9, kijunPeriod = 26, senkouBPeriod = 52, displacement = 26) {
    if (!candles || candles.length < senkouBPeriod) {
        return { tenkan: [], kijun: [], spanA: [], spanB: [], chikou: [] };
    }

    const tenkan = [];
    const kijun = [];
    const spanA = [];
    const spanB = [];
    const chikou = [];

    // Period high/low midpoint at index i
    const midpoint = (i, period) => {
        if (i < period - 1) return null;
        let hi = -Infinity, lo = Infinity;
        for (let k = i - period + 1; k <= i; k++) {
            if (candles[k].high > hi) hi = candles[k].high;
            if (candles[k].low < lo) lo = candles[k].low;
        }
        return (hi + lo) / 2;
    };

    // Estimate the bar interval (in seconds) so we can project SpanA/B forward
    // off the right edge of available candles.
    const intervalSec = candles.length > 1
        ? Math.max(1, Math.round((candles[candles.length - 1].time - candles[0].time) / (candles.length - 1)))
        : 86400;

    for (let i = 0; i < candles.length; i++) {
        const t = candles[i].time;

        const tk = midpoint(i, tenkanPeriod);
        if (tk !== null) tenkan.push({ time: t, value: tk });

        const kj = midpoint(i, kijunPeriod);
        if (kj !== null) kijun.push({ time: t, value: kj });

        // Chikou: today's close, plotted `displacement` bars back
        if (i - displacement >= 0) {
            chikou.push({ time: candles[i - displacement].time, value: candles[i].close });
        }

        // SpanA / SpanB are computed from values at index i but plotted at i+displacement
        const futureIdx = i + displacement;
        const futureTime = futureIdx < candles.length
            ? candles[futureIdx].time
            : candles[candles.length - 1].time + (futureIdx - candles.length + 1) * intervalSec;

        if (tk !== null && kj !== null) {
            spanA.push({ time: futureTime, value: (tk + kj) / 2 });
        }
        const sb = midpoint(i, senkouBPeriod);
        if (sb !== null) {
            spanB.push({ time: futureTime, value: sb });
        }
    }

    return { tenkan, kijun, spanA, spanB, chikou };
}

// ═══════════════════════════════════════════════════════════
// STOCHASTIC OSCILLATOR
// %K = (close - lowestLow) / (highestHigh - lowestLow) * 100
// %D = SMA of %K over `smoothD` periods
// Returns { k, d } each as {time, value}[]
// ═══════════════════════════════════════════════════════════
export function stochastic(candles, kPeriod = 14, dPeriod = 3) {
    if (!candles || candles.length < kPeriod) return { k: [], d: [] };
    const k = [];
    for (let i = kPeriod - 1; i < candles.length; i++) {
        let hi = -Infinity, lo = Infinity;
        for (let j = i - kPeriod + 1; j <= i; j++) {
            if (candles[j].high > hi) hi = candles[j].high;
            if (candles[j].low < lo) lo = candles[j].low;
        }
        const range = hi - lo;
        const value = range === 0 ? 50 : ((candles[i].close - lo) / range) * 100;
        k.push({ time: candles[i].time, value });
    }
    // %D = SMA of %K
    const d = [];
    for (let i = dPeriod - 1; i < k.length; i++) {
        let sum = 0;
        for (let j = i - dPeriod + 1; j <= i; j++) sum += k[j].value;
        d.push({ time: k[i].time, value: sum / dPeriod });
    }
    return { k, d };
}

// ═══════════════════════════════════════════════════════════
// ATR — Wilder's Average True Range (volatility)
// ═══════════════════════════════════════════════════════════
export function atr(candles, period = 14) {
    if (!candles || candles.length < period + 1) return [];
    const trs = [];
    for (let i = 1; i < candles.length; i++) {
        const c = candles[i], p = candles[i - 1];
        const tr = Math.max(
            c.high - c.low,
            Math.abs(c.high - p.close),
            Math.abs(c.low - p.close)
        );
        trs.push(tr);
    }
    // Wilder smoothing: first ATR is simple avg, then ATR_n = (ATR_{n-1}*(p-1) + TR_n)/p
    const out = [];
    let prev = 0;
    for (let i = 0; i < period; i++) prev += trs[i];
    prev /= period;
    out.push({ time: candles[period].time, value: prev });
    for (let i = period; i < trs.length; i++) {
        prev = (prev * (period - 1) + trs[i]) / period;
        out.push({ time: candles[i + 1].time, value: prev });
    }
    return out;
}

// ═══════════════════════════════════════════════════════════
// PARABOLIC SAR — trailing stop-and-reverse
// Returns {time, value}[] (one dot per candle, alternates above/below)
// ═══════════════════════════════════════════════════════════
export function parabolicSAR(candles, step = 0.02, maxStep = 0.2) {
    if (!candles || candles.length < 3) return [];
    const out = [];
    let isLong = candles[1].close > candles[0].close;
    let af = step;
    let ep = isLong ? candles[1].high : candles[1].low; // extreme point
    let sar = isLong ? candles[0].low : candles[0].high;

    out.push({ time: candles[1].time, value: sar });

    for (let i = 2; i < candles.length; i++) {
        sar = sar + af * (ep - sar);

        // Clamp SAR to prior two candles' extremes
        if (isLong) {
            sar = Math.min(sar, candles[i - 1].low, candles[i - 2].low);
            if (candles[i].low < sar) {
                // Reversal
                isLong = false;
                sar = ep;
                ep = candles[i].low;
                af = step;
            } else {
                if (candles[i].high > ep) {
                    ep = candles[i].high;
                    af = Math.min(af + step, maxStep);
                }
            }
        } else {
            sar = Math.max(sar, candles[i - 1].high, candles[i - 2].high);
            if (candles[i].high > sar) {
                isLong = true;
                sar = ep;
                ep = candles[i].high;
                af = step;
            } else {
                if (candles[i].low < ep) {
                    ep = candles[i].low;
                    af = Math.min(af + step, maxStep);
                }
            }
        }
        out.push({ time: candles[i].time, value: sar });
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
