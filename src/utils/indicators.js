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