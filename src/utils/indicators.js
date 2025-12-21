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