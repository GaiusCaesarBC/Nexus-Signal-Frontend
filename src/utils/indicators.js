// client/src/utils/indicators.js - Technical Indicator Calculations

/**
 * Calculate Simple Moving Average (SMA)
 */
export const calculateSMA = (data, period) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
        result.push({
            time: data[i].time,
            value: sum / period
        });
    }
    return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 */
export const calculateEMA = (data, period) => {
    const result = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    let ema = data.slice(0, period).reduce((acc, val) => acc + val.close, 0) / period;
    result.push({ time: data[period - 1].time, value: ema });
    
    // Calculate rest
    for (let i = period; i < data.length; i++) {
        ema = (data[i].close - ema) * multiplier + ema;
        result.push({ time: data[i].time, value: ema });
    }
    
    return result;
};

/**
 * Calculate Relative Strength Index (RSI)
 */
export const calculateRSI = (data, period = 14) => {
    const result = [];
    const changes = [];
    
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i].close - data[i - 1].close);
    }
    
    for (let i = period; i <= changes.length; i++) {
        const slice = changes.slice(i - period, i);
        const gains = slice.filter(c => c > 0).reduce((acc, val) => acc + val, 0) / period;
        const losses = Math.abs(slice.filter(c => c < 0).reduce((acc, val) => acc + val, 0)) / period;
        
        const rs = gains / (losses || 1);
        const rsi = 100 - (100 / (1 + rs));
        
        result.push({
            time: data[i].time,
            value: rsi
        });
    }
    
    return result;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);
    
    const macdLine = [];
    const startIndex = slowPeriod - fastPeriod;
    
    for (let i = 0; i < slowEMA.length; i++) {
        macdLine.push({
            time: slowEMA[i].time,
            value: fastEMA[i + startIndex].value - slowEMA[i].value
        });
    }
    
    // Calculate signal line (EMA of MACD)
    const signalLine = calculateEMA(
        macdLine.map(m => ({ time: m.time, close: m.value })),
        signalPeriod
    );
    
    // Calculate histogram
    const histogram = [];
    for (let i = 0; i < signalLine.length; i++) {
        histogram.push({
            time: signalLine[i].time,
            value: macdLine[i + (macdLine.length - signalLine.length)].value - signalLine[i].value,
            color: macdLine[i + (macdLine.length - signalLine.length)].value >= signalLine[i].value ? 
                'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
        });
    }
    
    return { macdLine, signalLine, histogram };
};

/**
 * Calculate Bollinger Bands
 */
export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
    const sma = calculateSMA(data, period);
    const upper = [];
    const lower = [];
    
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = slice.reduce((acc, val) => acc + val.close, 0) / period;
        const variance = slice.reduce((acc, val) => acc + Math.pow(val.close - mean, 2), 0) / period;
        const stdDeviation = Math.sqrt(variance);
        
        upper.push({
            time: data[i].time,
            value: mean + (stdDev * stdDeviation)
        });
        
        lower.push({
            time: data[i].time,
            value: mean - (stdDev * stdDeviation)
        });
    }
    
    return { sma, upper, lower };
};

/**
 * Calculate Average True Range (ATR)
 */
export const calculateATR = (data, period = 14) => {
    const result = [];
    const tr = [];
    
    for (let i = 1; i < data.length; i++) {
        const high = data[i].high;
        const low = data[i].low;
        const prevClose = data[i - 1].close;
        
        const trueRange = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        
        tr.push({ time: data[i].time, value: trueRange });
    }
    
    // Calculate ATR as SMA of TR
    for (let i = period - 1; i < tr.length; i++) {
        const sum = tr.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.value, 0);
        result.push({
            time: tr[i].time,
            value: sum / period
        });
    }
    
    return result;
};

/**
 * Calculate Volume-Weighted Average Price (VWAP)
 */
export const calculateVWAP = (data) => {
    const result = [];
    let cumulativeTPV = 0; // Typical Price * Volume
    let cumulativeVolume = 0;

    for (let i = 0; i < data.length; i++) {
        const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
        cumulativeTPV += typicalPrice * data[i].volume;
        cumulativeVolume += data[i].volume;

        result.push({
            time: data[i].time,
            value: cumulativeTPV / cumulativeVolume
        });
    }

    return result;
};

/**
 * Calculate Stochastic Oscillator (%K and %D)
 */
export const calculateStochastic = (data, kPeriod = 14, dPeriod = 3) => {
    const kLine = [];
    const dLine = [];

    // Calculate %K
    for (let i = kPeriod - 1; i < data.length; i++) {
        const slice = data.slice(i - kPeriod + 1, i + 1);
        const highestHigh = Math.max(...slice.map(d => d.high));
        const lowestLow = Math.min(...slice.map(d => d.low));
        const currentClose = data[i].close;

        const k = ((currentClose - lowestLow) / (highestHigh - lowestLow || 1)) * 100;

        kLine.push({
            time: data[i].time,
            value: k
        });
    }

    // Calculate %D (SMA of %K)
    for (let i = dPeriod - 1; i < kLine.length; i++) {
        const sum = kLine.slice(i - dPeriod + 1, i + 1).reduce((acc, val) => acc + val.value, 0);
        dLine.push({
            time: kLine[i].time,
            value: sum / dPeriod
        });
    }

    return { kLine, dLine };
};

/**
 * Calculate Williams %R
 */
export const calculateWilliamsR = (data, period = 14) => {
    const result = [];

    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const highestHigh = Math.max(...slice.map(d => d.high));
        const lowestLow = Math.min(...slice.map(d => d.low));
        const currentClose = data[i].close;

        const wr = ((highestHigh - currentClose) / (highestHigh - lowestLow || 1)) * -100;

        result.push({
            time: data[i].time,
            value: wr
        });
    }

    return result;
};

/**
 * Calculate Commodity Channel Index (CCI)
 */
export const calculateCCI = (data, period = 20) => {
    const result = [];

    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);

        // Calculate typical prices
        const typicalPrices = slice.map(d => (d.high + d.low + d.close) / 3);
        const currentTP = typicalPrices[typicalPrices.length - 1];

        // Calculate SMA of typical prices
        const smaTP = typicalPrices.reduce((acc, val) => acc + val, 0) / period;

        // Calculate Mean Deviation
        const meanDeviation = typicalPrices.reduce((acc, val) => acc + Math.abs(val - smaTP), 0) / period;

        // Calculate CCI
        const cci = (currentTP - smaTP) / (0.015 * (meanDeviation || 1));

        result.push({
            time: data[i].time,
            value: cci
        });
    }

    return result;
};

/**
 * Calculate On-Balance Volume (OBV)
 */
export const calculateOBV = (data) => {
    const result = [];
    let obv = 0;

    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            obv = data[i].volume || 0;
        } else {
            if (data[i].close > data[i - 1].close) {
                obv += data[i].volume || 0;
            } else if (data[i].close < data[i - 1].close) {
                obv -= data[i].volume || 0;
            }
            // If close equals previous close, OBV stays the same
        }

        result.push({
            time: data[i].time,
            value: obv
        });
    }

    return result;
};

/**
 * Calculate Ichimoku Cloud
 * - Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
 * - Kijun-sen (Base Line): (26-period high + 26-period low) / 2
 * - Senkou Span A (Leading Span A): (Tenkan-sen + Kijun-sen) / 2, plotted 26 periods ahead
 * - Senkou Span B (Leading Span B): (52-period high + 52-period low) / 2, plotted 26 periods ahead
 * - Chikou Span (Lagging Span): Close plotted 26 periods behind
 */
export const calculateIchimoku = (data, tenkanPeriod = 9, kijunPeriod = 26, senkouBPeriod = 52, displacement = 26) => {
    const tenkanSen = [];
    const kijunSen = [];
    const senkouSpanA = [];
    const senkouSpanB = [];
    const chikouSpan = [];

    // Helper to get period high/low midpoint
    const getPeriodMidpoint = (startIdx, period) => {
        const slice = data.slice(Math.max(0, startIdx - period + 1), startIdx + 1);
        if (slice.length < period) return null;
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        return (high + low) / 2;
    };

    for (let i = 0; i < data.length; i++) {
        const time = data[i].time;

        // Tenkan-sen (9-period)
        if (i >= tenkanPeriod - 1) {
            const value = getPeriodMidpoint(i, tenkanPeriod);
            if (value !== null) {
                tenkanSen.push({ time, value });
            }
        }

        // Kijun-sen (26-period)
        if (i >= kijunPeriod - 1) {
            const value = getPeriodMidpoint(i, kijunPeriod);
            if (value !== null) {
                kijunSen.push({ time, value });
            }
        }

        // Chikou Span (current close, but plotted 26 periods back)
        // We store it at the current position but it represents price from 26 periods ago
        if (i >= displacement) {
            chikouSpan.push({
                time: data[i - displacement].time,
                value: data[i].close
            });
        }
    }

    // Calculate Senkou Span A and B (displaced forward by 26 periods)
    for (let i = 0; i < data.length; i++) {
        // Get displaced time (26 periods ahead)
        const futureIdx = i + displacement;
        if (futureIdx >= data.length) {
            // For future projections, estimate the time
            const lastTime = data[data.length - 1].time;
            const avgInterval = data.length > 1 ?
                (data[data.length - 1].time - data[0].time) / (data.length - 1) : 86400;
            const futureTime = lastTime + (futureIdx - data.length + 1) * avgInterval;

            // Senkou Span A
            if (i >= Math.max(tenkanPeriod, kijunPeriod) - 1) {
                const tenkan = getPeriodMidpoint(i, tenkanPeriod);
                const kijun = getPeriodMidpoint(i, kijunPeriod);
                if (tenkan !== null && kijun !== null) {
                    senkouSpanA.push({ time: futureTime, value: (tenkan + kijun) / 2 });
                }
            }

            // Senkou Span B
            if (i >= senkouBPeriod - 1) {
                const value = getPeriodMidpoint(i, senkouBPeriod);
                if (value !== null) {
                    senkouSpanB.push({ time: futureTime, value });
                }
            }
        } else {
            const futureTime = data[futureIdx].time;

            // Senkou Span A
            if (i >= Math.max(tenkanPeriod, kijunPeriod) - 1) {
                const tenkan = getPeriodMidpoint(i, tenkanPeriod);
                const kijun = getPeriodMidpoint(i, kijunPeriod);
                if (tenkan !== null && kijun !== null) {
                    senkouSpanA.push({ time: futureTime, value: (tenkan + kijun) / 2 });
                }
            }

            // Senkou Span B
            if (i >= senkouBPeriod - 1) {
                const value = getPeriodMidpoint(i, senkouBPeriod);
                if (value !== null) {
                    senkouSpanB.push({ time: futureTime, value });
                }
            }
        }
    }

    return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, chikouSpan };
};

/**
 * Calculate Parabolic SAR
 * Trailing stop-and-reverse indicator
 */
export const calculateParabolicSAR = (data, step = 0.02, maxStep = 0.2) => {
    if (data.length < 2) return [];

    const result = [];
    let af = step; // Acceleration Factor
    let ep = 0;    // Extreme Point
    let sar = 0;
    let isUptrend = true;

    // Initialize - use first 5 bars to determine initial trend
    const initBars = Math.min(5, data.length);
    let initHigh = -Infinity;
    let initLow = Infinity;
    for (let i = 0; i < initBars; i++) {
        if (data[i].high > initHigh) initHigh = data[i].high;
        if (data[i].low < initLow) initLow = data[i].low;
    }

    // Determine initial trend
    isUptrend = data[initBars - 1].close > data[0].close;

    if (isUptrend) {
        sar = initLow;
        ep = initHigh;
    } else {
        sar = initHigh;
        ep = initLow;
    }

    // First bar
    result.push({
        time: data[0].time,
        value: sar,
        color: isUptrend ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
    });

    for (let i = 1; i < data.length; i++) {
        const prevSar = sar;
        const high = data[i].high;
        const low = data[i].low;
        const prevHigh = data[i - 1].high;
        const prevLow = data[i - 1].low;

        if (isUptrend) {
            // Calculate new SAR
            sar = prevSar + af * (ep - prevSar);

            // Make sure SAR is not above prior two lows
            sar = Math.min(sar, prevLow);
            if (i > 1) sar = Math.min(sar, data[i - 2].low);

            // Check for reversal
            if (low < sar) {
                isUptrend = false;
                sar = ep;
                ep = low;
                af = step;
            } else {
                // Update EP and AF
                if (high > ep) {
                    ep = high;
                    af = Math.min(af + step, maxStep);
                }
            }
        } else {
            // Calculate new SAR
            sar = prevSar + af * (ep - prevSar);

            // Make sure SAR is not below prior two highs
            sar = Math.max(sar, prevHigh);
            if (i > 1) sar = Math.max(sar, data[i - 2].high);

            // Check for reversal
            if (high > sar) {
                isUptrend = true;
                sar = ep;
                ep = high;
                af = step;
            } else {
                // Update EP and AF
                if (low < ep) {
                    ep = low;
                    af = Math.min(af + step, maxStep);
                }
            }
        }

        result.push({
            time: data[i].time,
            value: sar,
            color: isUptrend ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        });
    }

    return result;
};

/**
 * Calculate Average Directional Index (ADX)
 * Measures trend strength (not direction)
 * Returns ADX line, +DI line, and -DI line
 */
export const calculateADX = (data, period = 14) => {
    if (data.length < period + 1) {
        return { adx: [], plusDI: [], minusDI: [] };
    }

    const trueRanges = [];
    const plusDMs = [];
    const minusDMs = [];

    // Calculate True Range, +DM, and -DM for each bar
    for (let i = 1; i < data.length; i++) {
        const high = data[i].high;
        const low = data[i].low;
        const prevHigh = data[i - 1].high;
        const prevLow = data[i - 1].low;
        const prevClose = data[i - 1].close;

        // True Range
        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        trueRanges.push(tr);

        // +DM and -DM
        const upMove = high - prevHigh;
        const downMove = prevLow - low;

        let plusDM = 0;
        let minusDM = 0;

        if (upMove > downMove && upMove > 0) {
            plusDM = upMove;
        }
        if (downMove > upMove && downMove > 0) {
            minusDM = downMove;
        }

        plusDMs.push(plusDM);
        minusDMs.push(minusDM);
    }

    // Smooth the values using Wilder's smoothing (similar to EMA but with different formula)
    const smoothedTR = [];
    const smoothedPlusDM = [];
    const smoothedMinusDM = [];

    // First smoothed values are sum of first 'period' values
    let sumTR = 0, sumPlusDM = 0, sumMinusDM = 0;
    for (let i = 0; i < period; i++) {
        sumTR += trueRanges[i];
        sumPlusDM += plusDMs[i];
        sumMinusDM += minusDMs[i];
    }
    smoothedTR.push(sumTR);
    smoothedPlusDM.push(sumPlusDM);
    smoothedMinusDM.push(sumMinusDM);

    // Subsequent values use Wilder's smoothing
    for (let i = period; i < trueRanges.length; i++) {
        const prevTR = smoothedTR[smoothedTR.length - 1];
        const prevPlusDM = smoothedPlusDM[smoothedPlusDM.length - 1];
        const prevMinusDM = smoothedMinusDM[smoothedMinusDM.length - 1];

        smoothedTR.push(prevTR - (prevTR / period) + trueRanges[i]);
        smoothedPlusDM.push(prevPlusDM - (prevPlusDM / period) + plusDMs[i]);
        smoothedMinusDM.push(prevMinusDM - (prevMinusDM / period) + minusDMs[i]);
    }

    // Calculate +DI, -DI, and DX
    const plusDI = [];
    const minusDI = [];
    const dx = [];

    for (let i = 0; i < smoothedTR.length; i++) {
        const tr = smoothedTR[i];
        const pdi = tr !== 0 ? (smoothedPlusDM[i] / tr) * 100 : 0;
        const mdi = tr !== 0 ? (smoothedMinusDM[i] / tr) * 100 : 0;

        plusDI.push(pdi);
        minusDI.push(mdi);

        const diSum = pdi + mdi;
        const dxValue = diSum !== 0 ? (Math.abs(pdi - mdi) / diSum) * 100 : 0;
        dx.push(dxValue);
    }

    // Calculate ADX as smoothed DX
    const adx = [];

    // First ADX is average of first 'period' DX values
    if (dx.length >= period) {
        let sumDX = 0;
        for (let i = 0; i < period; i++) {
            sumDX += dx[i];
        }
        adx.push(sumDX / period);

        // Subsequent ADX values use Wilder's smoothing
        for (let i = period; i < dx.length; i++) {
            const prevADX = adx[adx.length - 1];
            adx.push(((prevADX * (period - 1)) + dx[i]) / period);
        }
    }

    // Format output with timestamps
    const startIndex = period; // Data starts at index 'period' in original data
    const adxOffset = period;  // ADX has additional delay

    const result = {
        plusDI: [],
        minusDI: [],
        adx: []
    };

    for (let i = 0; i < plusDI.length; i++) {
        const dataIdx = startIndex + i;
        if (dataIdx < data.length) {
            result.plusDI.push({ time: data[dataIdx].time, value: plusDI[i] });
            result.minusDI.push({ time: data[dataIdx].time, value: minusDI[i] });
        }
    }

    for (let i = 0; i < adx.length; i++) {
        const dataIdx = startIndex + adxOffset + i;
        if (dataIdx < data.length) {
            result.adx.push({ time: data[dataIdx].time, value: adx[i] });
        }
    }

    return result;
};