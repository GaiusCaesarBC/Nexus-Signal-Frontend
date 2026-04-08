// client/src/pages/smartAlerts/derive.js
//
// Pure heuristics for the redesigned Smart Alerts page.
//
// TODO(server): push proximity + Near Trigger flag + AI suggestions
// directly from the alert engine. Until then, we derive everything
// client-side from the existing /alerts payload.

// ============================================================
// Numeric helpers
// ============================================================

const num = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const n = parseFloat(String(v).replace(/[,$%\s]/g, ''));
    return Number.isFinite(n) ? n : null;
};

const fmtUSD = (v) => {
    const n = num(v);
    if (n == null) return '—';
    if (Math.abs(n) >= 1) {
        return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
    }
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 6 });
};

// ============================================================
// Alert metadata helpers
// ============================================================

/**
 * Returns the alert "category" — price | technical | pattern | other.
 * Used for icons + filter buckets.
 */
export const alertCategory = (alert) => {
    const t = alert?.type || '';
    if (t === 'price_above' || t === 'price_below' || t === 'percent_change') return 'price';
    if (t.startsWith('rsi') || t.startsWith('macd') || t.startsWith('bb') ||
        t.startsWith('sma') || t.startsWith('ema') || t.includes('support') || t.includes('resistance')) return 'technical';
    if (t.startsWith('pattern') || t.includes('breakout') || t.includes('wedge') ||
        t.includes('triangle') || t.includes('head_shoulders') || t.includes('double')) return 'pattern';
    return 'other';
};

/**
 * Short readable label for an alert type.
 */
export const alertLabel = (alert) => {
    const t = alert?.type || '';
    const labels = {
        price_above:      'Above',
        price_below:      'Below',
        percent_change:   '% Change',
        prediction_expiry:'Signal Expiry',
        rsi_overbought:   'RSI Overbought',
        rsi_oversold:     'RSI Oversold',
        macd_cross:       'MACD Cross',
    };
    return labels[t] || (t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
};

/**
 * One-line condition string ("Above $185", "RSI > 70", "+5% in 24h").
 */
export const conditionString = (alert) => {
    if (!alert) return '';
    const t = alert.type;
    if (t === 'price_above')   return `Above ${fmtUSD(alert.targetPrice)}`;
    if (t === 'price_below')   return `Below ${fmtUSD(alert.targetPrice)}`;
    if (t === 'percent_change')return `${alert.percentChange}% in ${alert.timeframe || '24h'}`;
    if (t === 'rsi_overbought')return `RSI > ${alert.rsiThreshold ?? 70}`;
    if (t === 'rsi_oversold')  return `RSI < ${alert.rsiThreshold ?? 30}`;
    if (alert.supportLevel)    return `Support @ ${fmtUSD(alert.supportLevel)}`;
    if (alert.resistanceLevel) return `Resistance @ ${fmtUSD(alert.resistanceLevel)}`;
    if (alert.patternType)     return `${alert.patternType.replace(/_/g, ' ')} pattern`;
    return alert.type || 'Alert';
};

// ============================================================
// Proximity to trigger
// ============================================================

/**
 * Returns:
 *   {
 *     pct:       distance % to target (signed; negative = past trigger)
 *     near:      true if within 3% AND moving toward
 *     direction: 'toward' | 'away' | 'flat'
 *   }
 *
 * Only meaningful for price-type alerts that have a `currentPrice`.
 */
export const proximityOf = (alert) => {
    if (!alert) return null;
    const cur = num(alert.currentPrice ?? alert.livePrice);
    if (cur == null) return null;

    const t = alert.type;
    const target = num(alert.targetPrice);

    if ((t === 'price_above' || t === 'price_below') && target != null && target > 0) {
        const pct = ((target - cur) / target) * 100;
        const distance = Math.abs(pct);
        // For "above" we move toward target as price rises (cur grows). Toward = pct shrinks.
        // For "below" we move toward as price falls.
        let direction = 'flat';
        if (alert._lastCurrentPrice != null) {
            const delta = cur - num(alert._lastCurrentPrice);
            if (Math.abs(delta) > 0.0001) {
                if (t === 'price_above') direction = delta > 0 ? 'toward' : 'away';
                else                     direction = delta < 0 ? 'toward' : 'away';
            }
        }
        return {
            pct: parseFloat(distance.toFixed(2)),
            near: distance <= 3 && direction !== 'away',
            direction,
        };
    }

    return null;
};

// ============================================================
// Status v2 — adds 'near_trigger' between active and triggered
// ============================================================

export const statusV2 = (alert) => {
    if (!alert) return 'unknown';
    if (alert.status === 'triggered') return 'triggered';
    if (alert.status === 'expired')   return 'expired';
    if (alert.status === 'paused')    return 'paused';
    const prox = proximityOf(alert);
    if (prox?.near) return 'near_trigger';
    return 'active';
};

// ============================================================
// Enrich alert list — add proximity + statusV2 + label
// ============================================================

export const enrichAlerts = (alerts) => {
    if (!Array.isArray(alerts)) return [];
    return alerts.map((a) => ({
        ...a,
        _category: alertCategory(a),
        _label: alertLabel(a),
        _condition: conditionString(a),
        _proximity: proximityOf(a),
        _statusV2: statusV2(a),
    }));
};

// ============================================================
// Derived stats: Triggered Today / This Week
// ============================================================

const startOfDay = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const startOfWeek = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d.getTime();
};

export const derivedStats = (alerts, baseStats) => {
    const list = Array.isArray(alerts) ? alerts : [];
    const dayStart = startOfDay();
    const weekStart = startOfWeek();

    const triggeredToday = list.filter((a) => {
        const ts = a.triggeredAt ? new Date(a.triggeredAt).getTime() : 0;
        return ts >= dayStart;
    }).length;

    const triggeredWeek = list.filter((a) => {
        const ts = a.triggeredAt ? new Date(a.triggeredAt).getTime() : 0;
        return ts >= weekStart;
    }).length;

    const nearTrigger = list.filter((a) => a._statusV2 === 'near_trigger').length;

    return {
        ...(baseStats || {}),
        triggeredToday,
        triggeredWeek,
        nearTrigger,
    };
};

// ============================================================
// Detect alert state transitions (active -> triggered)
// ============================================================
//
// Caller passes the previous list and the current list. Returns alerts
// that just transitioned to 'triggered' so we can fire toasts.

export const detectNewlyTriggered = (prevList, nextList) => {
    if (!Array.isArray(prevList) || !Array.isArray(nextList)) return [];
    const prevMap = new Map(prevList.map((a) => [a._id, a]));
    return nextList.filter((a) => {
        const prev = prevMap.get(a._id);
        return a.status === 'triggered' && prev && prev.status !== 'triggered';
    });
};

// ============================================================
// Recent activity feed
// ============================================================

/**
 * Builds a chronological list of "Recent Alert Activity" events:
 *   - alert created
 *   - alert triggered
 *   - alert expired
 * Sorted newest first.
 */
export const buildActivityFeed = (alerts, limit = 10) => {
    if (!Array.isArray(alerts)) return [];
    const events = [];

    for (const a of alerts) {
        const sym = a.symbol || 'Portfolio';
        if (a.triggeredAt) {
            events.push({
                id: `trig-${a._id}`,
                kind: 'triggered',
                symbol: sym,
                label: `${sym} alert triggered — ${conditionString(a)}`,
                ts: new Date(a.triggeredAt).getTime(),
            });
        }
        if (a.status === 'expired') {
            const ts = a.expiredAt
                ? new Date(a.expiredAt).getTime()
                : (a.expiresAt ? new Date(a.expiresAt).getTime() : 0);
            if (ts > 0) {
                events.push({
                    id: `exp-${a._id}`,
                    kind: 'expired',
                    symbol: sym,
                    label: `${sym} alert expired`,
                    ts,
                });
            }
        }
        if (a.createdAt) {
            events.push({
                id: `crt-${a._id}`,
                kind: 'created',
                symbol: sym,
                label: `${sym} alert created — ${conditionString(a)}`,
                ts: new Date(a.createdAt).getTime(),
            });
        }
    }

    return events
        .filter((e) => e.ts > 0)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
};

// ============================================================
// Suggested alerts (AI)
// ============================================================

/**
 * Best-effort heuristic suggestions. Avoids fabricating prices: only
 * suggests alerts for symbols the user is *already* tracking (alerts +
 * watchlist if available) where there isn't already an alert.
 *
 * Caller can pass a watchlist of { symbol, currentPrice, changePercent }
 * to power the suggestions.
 */
export const buildSuggestions = (watchlist, alerts, limit = 4) => {
    if (!Array.isArray(watchlist)) return [];
    const existingSymbols = new Set(
        (alerts || [])
            .filter((a) => a.status === 'active' || a.status === 'paused')
            .map((a) => (a.symbol || '').toUpperCase())
    );

    const suggestions = [];

    for (const w of watchlist) {
        const sym = (w.symbol || w.ticker || '').toUpperCase();
        if (!sym || existingSymbols.has(sym)) continue;

        const cur = num(w.currentPrice ?? w.price);
        const chg = num(w.changePercent);
        if (cur == null) continue;

        // Round to a "nice" level near current price for breakout/support
        const niceLevel = (price, side) => {
            if (price == null) return null;
            // pick the next round 1 / 5 / 10 / 50 / 100 above or below
            const magnitude = Math.pow(10, Math.floor(Math.log10(price)));
            const step = magnitude >= 100 ? magnitude / 2 : magnitude;
            return side === 'above'
                ? Math.ceil(price / step) * step
                : Math.floor(price / step) * step;
        };

        // High momentum → suggest breakout alert
        if (chg != null && chg >= 2) {
            const target = niceLevel(cur * 1.025, 'above');
            if (target != null && target > cur) {
                suggestions.push({
                    id: `sug-breakout-${sym}`,
                    symbol: sym,
                    kind: 'breakout',
                    title: `${sym} approaching breakout level`,
                    rationale: `Up ${chg.toFixed(1)}% — set an alert at ${fmtUSD(target)} to catch the breakout`,
                    prefill: { type: 'price_above', symbol: sym, targetPrice: target },
                });
                continue;
            }
        }

        // Heavy down → suggest downside alert
        if (chg != null && chg <= -2) {
            const target = niceLevel(cur * 0.975, 'below');
            if (target != null && target < cur) {
                suggestions.push({
                    id: `sug-support-${sym}`,
                    symbol: sym,
                    kind: 'support',
                    title: `${sym} nearing support`,
                    rationale: `Down ${Math.abs(chg).toFixed(1)}% — set a downside alert at ${fmtUSD(target)}`,
                    prefill: { type: 'price_below', symbol: sym, targetPrice: target },
                });
                continue;
            }
        }

        // High volatility hint
        if (chg != null && Math.abs(chg) >= 4) {
            suggestions.push({
                id: `sug-vol-${sym}`,
                symbol: sym,
                kind: 'volatility',
                title: `${sym} high volatility`,
                rationale: `${chg > 0 ? '+' : ''}${chg.toFixed(1)}% today — consider monitoring with a % change alert`,
                prefill: { type: 'percent_change', symbol: sym, percentChange: 3, timeframe: '24h' },
            });
        }
    }

    return suggestions.slice(0, limit);
};

// ============================================================
// Public exports
// ============================================================

export { num, fmtUSD };
