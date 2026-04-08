// client/src/pages/watchlist/derive.js
//
// Pure heuristics for the redesigned Watchlist page.
//
// TODO(server): integrate watchlist with signal engine — push momentum,
// volatility, and AI insight directly from the ML pipeline.
// Until then, we derive priority, action labels, momentum, volatility,
// and per-asset insight client-side from:
//   - the watchlist payload (price + change + changePercent)
//   - the live /predictions/recent feed (same source as SignalsPage)

// ============================================================
// Numeric helpers
// ============================================================

const num = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const n = parseFloat(String(v).replace(/[,$%\s]/g, ''));
    return Number.isFinite(n) ? n : null;
};

const abs = (v) => Math.abs(num(v) ?? 0);

// ============================================================
// Signal map normalization
// ============================================================

/**
 * Build a Map<symbol, signal> from the raw /predictions/recent payload.
 * Each value is a flat shape:
 *   { direction: 'LONG'|'SHORT', confidence, entry, stop, target }
 */
export const buildSignalMap = (rawPredictions) => {
    const map = new Map();
    if (!Array.isArray(rawPredictions)) return map;

    for (const p of rawPredictions) {
        const sym = (p.symbol || '').split(':')[0]?.replace(/USDT|USD$/i, '');
        if (!sym) continue;
        // Always keep the most-confident signal per symbol
        const direction = p.direction === 'UP' ? 'LONG' : 'SHORT';
        const confidence = Math.round(p.confidence ?? 0);
        const existing = map.get(sym);
        if (existing && existing.confidence >= confidence) continue;
        map.set(sym, {
            direction,
            confidence,
            entry: num(p.entryPrice ?? p.entry ?? p.livePrice),
            stop: num(p.stopLoss ?? p.sl),
            target: num(p.takeProfit3 ?? p.tp3 ?? p.takeProfit2 ?? p.tp2 ?? p.takeProfit1 ?? p.tp1),
        });
    }
    return map;
};

// ============================================================
// Momentum (↑ / → / ↓)
// ============================================================

/**
 * Returns 'up' | 'down' | 'flat' from changePercent + a touch of intraday
 * vs daily comparison if available.
 */
export const momentumOf = (item) => {
    const cp = num(item?.changePercent);
    if (cp == null) return 'flat';
    if (cp >= 1.5) return 'up';
    if (cp <= -1.5) return 'down';
    return 'flat';
};

// ============================================================
// Volatility (Low / Normal / High)
// ============================================================

/**
 * Single-day volatility heuristic from |% change|. Crypto gets a wider
 * tolerance since 5% moves are routine.
 */
export const volatilityOf = (item, isCryptoFn) => {
    const pct = abs(item?.changePercent);
    const crypto = typeof isCryptoFn === 'function' ? isCryptoFn(item?.symbol || item?.ticker) : false;

    const lo = crypto ? 2 : 1;
    const hi = crypto ? 6 : 3;
    if (pct >= hi) return 'High';
    if (pct >= lo) return 'Normal';
    return 'Low';
};

// ============================================================
// Action label (Trade / Watch / Ignore)
// ============================================================

/**
 * "Should I act?" — combines signal presence + confidence + movement.
 * Returns one of:
 *   { label: 'Trade',  tone: 'bull' }   // active signal + |%| > 1.5
 *   { label: 'Watch',  tone: 'warn' }   // active signal OR strong move
 *   { label: 'Ignore', tone: 'mute' }   // nothing meaningful happening
 */
export const actionLabel = (item, signal) => {
    const moved = abs(item?.changePercent) >= 1.5;
    const strongMove = abs(item?.changePercent) >= 3;
    const hasGoodSignal = signal && signal.confidence >= 65;
    const hasOkSignal = signal && signal.confidence >= 50;

    if (hasGoodSignal && moved) return { label: 'Trade', tone: 'bull' };
    if (hasGoodSignal)            return { label: 'Trade', tone: 'bull' };
    if (strongMove || hasOkSignal) return { label: 'Watch', tone: 'warn' };
    if (moved)                     return { label: 'Watch', tone: 'warn' };
    return { label: 'Ignore', tone: 'mute' };
};

// ============================================================
// AI insight (1-line, per asset)
// ============================================================

export const assetInsight = (item, signal, isCryptoFn) => {
    const sym = item?.symbol || item?.ticker || '';
    const cp = num(item?.changePercent);
    const vol = volatilityOf(item, isCryptoFn);
    const mom = momentumOf(item);

    if (signal && signal.confidence >= 65) {
        const dir = signal.direction === 'LONG' ? 'long' : 'short';
        return `${sym} active ${dir} signal — ${signal.confidence}% confidence, setup ready`;
    }
    if (signal && signal.confidence >= 50) {
        const dir = signal.direction === 'LONG' ? 'long' : 'short';
        return `${sym} forming ${dir} setup — ${signal.confidence}% confidence, early`;
    }
    if (mom === 'up' && vol === 'High') {
        return `${sym} surging — high volatility breakout in progress`;
    }
    if (mom === 'up') {
        return `${sym} gaining momentum — breakout forming`;
    }
    if (mom === 'down' && vol === 'High') {
        return `${sym} selling off — sharp downside, watch for reversal`;
    }
    if (mom === 'down') {
        return `${sym} under pressure — watch support`;
    }
    if (vol === 'Low') {
        return `${sym} holding steady — low volatility, no strong setup yet`;
    }
    if (cp != null && cp > 0) {
        return `${sym} drifting higher — modest gains, no signal`;
    }
    if (cp != null && cp < 0) {
        return `${sym} drifting lower — minor pullback, no signal`;
    }
    return `${sym} quiet — no actionable setup`;
};

// ============================================================
// Priority score (0-100) — for the "Most Actionable" hero
// ============================================================

/**
 * Blends % move + signal confidence + volatility into a single score.
 * Higher = more actionable right now.
 */
export const priorityScore = (item, signal, isCryptoFn) => {
    let score = 0;
    score += Math.min(40, abs(item?.changePercent) * 6); // % move (capped)
    if (signal) {
        score += signal.confidence * 0.5; // up to +50 for a 100% conf signal
    }
    const vol = volatilityOf(item, isCryptoFn);
    if (vol === 'High')   score += 15;
    if (vol === 'Normal') score += 5;
    return Math.min(100, Math.round(score));
};

// ============================================================
// Enrich watchlist + rank
// ============================================================

export const enrichWatchlist = (watchlist, signalMap, isCryptoFn) => {
    if (!Array.isArray(watchlist)) return [];
    return watchlist.map((item) => {
        const sym = item.symbol || item.ticker || '';
        const signal = signalMap?.get(sym) || null;
        return {
            ...item,
            _signal: signal,
            _momentum: momentumOf(item),
            _volatility: volatilityOf(item, isCryptoFn),
            _action: actionLabel(item, signal),
            _insight: assetInsight(item, signal, isCryptoFn),
            _priority: priorityScore(item, signal, isCryptoFn),
        };
    });
};

export const mostActionable = (enriched, limit = 3) => {
    if (!Array.isArray(enriched)) return [];
    return [...enriched]
        .sort((a, b) => (b._priority ?? 0) - (a._priority ?? 0))
        .filter((s) => (s._priority ?? 0) > 20)
        .slice(0, limit);
};

// ============================================================
// Stats (improved cards)
// ============================================================

export const enhancedStats = (enriched, isCryptoFn) => {
    if (!Array.isArray(enriched) || enriched.length === 0) {
        return {
            total: 0, stocks: 0, crypto: 0, gainers: 0, losers: 0,
            activeSignals: 0, movers: 0, highVol: 0,
        };
    }
    return {
        total:        enriched.length,
        stocks:       enriched.filter((s) => !isCryptoFn(s.symbol || s.ticker)).length,
        crypto:       enriched.filter((s) =>  isCryptoFn(s.symbol || s.ticker)).length,
        gainers:      enriched.filter((s) => (num(s.changePercent) ?? 0) > 0).length,
        losers:       enriched.filter((s) => (num(s.changePercent) ?? 0) < 0).length,
        activeSignals: enriched.filter((s) => s._signal && s._signal.confidence >= 60).length,
        movers:       enriched.filter((s) => abs(s.changePercent) >= 2).length,
        highVol:      enriched.filter((s) => s._volatility === 'High').length,
    };
};

// ============================================================
// Sort + filter (server-side parity with the existing toolbar)
// ============================================================

export const SORT_OPTIONS = [
    { id: 'symbol',     label: 'Symbol' },
    { id: 'price',      label: 'Price' },
    { id: 'change',     label: 'Change' },
    { id: 'movement',   label: 'Movement (|%|)' },
    { id: 'signal',     label: 'Signal Strength' },
    { id: 'volatility', label: 'Volatility' },
    { id: 'priority',   label: 'Priority Score' },
];

export const FILTER_OPTIONS = [
    { id: 'all',         label: 'All Assets' },
    { id: 'signals',     label: 'Active Signals' },
    { id: 'movers',      label: 'High Movers (≥2%)' },
    { id: 'highvol',     label: 'High Volatility' },
    { id: 'stocks',      label: 'Stocks Only' },
    { id: 'crypto',      label: 'Crypto Only' },
    { id: 'gainers',     label: 'Gainers Only' },
    { id: 'losers',      label: 'Losers Only' },
    { id: 'alerts',      label: 'With Alerts' },
];

const VOL_RANK = { Low: 0, Normal: 1, High: 2 };

export const sortEnriched = (enriched, sortBy) => {
    const arr = [...enriched];
    arr.sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return (num(b.currentPrice ?? b.price) ?? 0) - (num(a.currentPrice ?? a.price) ?? 0);
            case 'change':
                return (num(b.changePercent) ?? 0) - (num(a.changePercent) ?? 0);
            case 'movement':
                return abs(b.changePercent) - abs(a.changePercent);
            case 'signal':
                return (b._signal?.confidence ?? 0) - (a._signal?.confidence ?? 0);
            case 'volatility':
                return (VOL_RANK[b._volatility] ?? 0) - (VOL_RANK[a._volatility] ?? 0);
            case 'priority':
                return (b._priority ?? 0) - (a._priority ?? 0);
            case 'symbol':
            default:
                return (a.symbol || a.ticker || '').localeCompare(b.symbol || b.ticker || '');
        }
    });
    return arr;
};

export const filterEnriched = (enriched, filterBy, isCryptoFn) => {
    switch (filterBy) {
        case 'signals': return enriched.filter((s) => s._signal && s._signal.confidence >= 60);
        case 'movers':  return enriched.filter((s) => abs(s.changePercent) >= 2);
        case 'highvol': return enriched.filter((s) => s._volatility === 'High');
        case 'stocks':  return enriched.filter((s) => !isCryptoFn(s.symbol || s.ticker));
        case 'crypto':  return enriched.filter((s) =>  isCryptoFn(s.symbol || s.ticker));
        case 'gainers': return enriched.filter((s) => (num(s.changePercent) ?? 0) > 0);
        case 'losers':  return enriched.filter((s) => (num(s.changePercent) ?? 0) < 0);
        case 'alerts':  return enriched.filter((s) => s.hasAlert);
        case 'all':
        default:        return enriched;
    }
};

// ============================================================
// Suggested assets for the empty state
// ============================================================

export const SUGGESTED_ASSETS = {
    popular: [
        { symbol: 'AAPL', name: 'Apple', kind: 'stock' },
        { symbol: 'NVDA', name: 'NVIDIA', kind: 'stock' },
        { symbol: 'TSLA', name: 'Tesla', kind: 'stock' },
        { symbol: 'MSFT', name: 'Microsoft', kind: 'stock' },
        { symbol: 'BTC',  name: 'Bitcoin', kind: 'crypto' },
        { symbol: 'ETH',  name: 'Ethereum', kind: 'crypto' },
    ],
    trending: [
        { symbol: 'NVDA', name: 'NVIDIA', kind: 'stock' },
        { symbol: 'PLTR', name: 'Palantir', kind: 'stock' },
        { symbol: 'SOL',  name: 'Solana', kind: 'crypto' },
        { symbol: 'COIN', name: 'Coinbase', kind: 'stock' },
    ],
    techGrowth: [
        { symbol: 'NVDA', name: 'NVIDIA', kind: 'stock' },
        { symbol: 'MSFT', name: 'Microsoft', kind: 'stock' },
        { symbol: 'GOOGL', name: 'Alphabet', kind: 'stock' },
        { symbol: 'META', name: 'Meta', kind: 'stock' },
        { symbol: 'AMZN', name: 'Amazon', kind: 'stock' },
    ],
};

export { num, abs };
