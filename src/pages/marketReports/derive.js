// client/src/pages/marketReports/derive.js
//
// Client-side heuristics for the redesigned AI Market Reports (Daily) page.
//
// SERVER-FIRST BRIDGE: every public function checks for a server-provided
// field on the report payload and uses it directly when present, otherwise
// falls back to the local heuristic. The day the AI prompt starts returning
// `report.tradeBias`, `report.confidence`, etc. these heuristics become
// invisible — no client changes required.
//
// Server fields the bridge looks for (all optional):
//   report.tradeBias            'LONG' | 'SHORT' | 'MIXED'
//   report.confidence           0-100
//   report.timeHorizon          'Intraday' | 'Swing' | 'Multi-day'
//   report.strategy             string
//   report.actionableInsights[] string[]
//   report.tradeSetups[]        [{ trigger, action, tag }]
//   report.snapshot             { bias, breadth, vol, sentiment }
//   report.aiInsight            string

// ---------- small text utilities ----------

const lc = (s) => (s || '').toString().toLowerCase();
const wordCount = (s) => lc(s).split(/\s+/).filter(Boolean).length;

const matchAny = (text, words) => {
    const t = lc(text);
    return words.some((w) => t.includes(w));
};

// ─────────────────────────────────────────────────────────────────
// NEW CODE START — Server adapters (vocabulary normalization)
//
// The server emits standard finance vocabulary (BULLISH/BEARISH/NEUTRAL,
// SHORT/MEDIUM/LONG, tradeSetups: { asset, direction, reasoning }) but the
// existing client UI was built around different labels. These small pure
// helpers translate server values into the client shape so downstream
// components don't have to change. All return null/undefined when given
// nothing useful — callers fall back to the heuristic.
// ─────────────────────────────────────────────────────────────────

const normalizeBias = (raw) => {
    if (typeof raw !== 'string') return null;
    const v = raw.trim().toUpperCase();
    if (v === 'BULLISH') return 'LONG';
    if (v === 'BEARISH') return 'SHORT';
    if (v === 'NEUTRAL') return 'MIXED';
    // Pass through values that already match the client vocabulary
    if (v === 'LONG' || v === 'SHORT' || v === 'MIXED') return v;
    return null;
};

const normalizeTimeframe = (raw) => {
    if (typeof raw !== 'string') return null;
    const v = raw.trim().toUpperCase();
    if (v === 'SHORT') return 'Intraday';
    if (v === 'MEDIUM') return 'Swing';
    if (v === 'LONG') return 'Multi-day';
    // Pass through values already in client vocabulary
    if (raw === 'Intraday' || raw === 'Swing' || raw === 'Multi-day') return raw;
    return null;
};

const adaptTradeSetups = (rawSetups) => {
    if (!Array.isArray(rawSetups) || rawSetups.length === 0) return null;
    return rawSetups
        .map((s) => {
            if (!s || typeof s !== 'object') return null;
            // Server shape: { asset, direction, reasoning }
            // Client shape: { trigger, action, tag }
            const asset = s.asset || s.ticker || s.trigger;
            const direction = s.direction || s.action;
            const reasoning = s.reasoning || s.action || s.tag || '';
            if (!asset && !s.trigger) return null;
            return {
                trigger: asset || s.trigger,
                action: reasoning || direction || '',
                tag: direction
                    ? String(direction).toUpperCase() === 'LONG' ? 'Long'
                    : String(direction).toUpperCase() === 'SHORT' ? 'Short'
                    : (s.tag || 'Bias')
                    : (s.tag || 'Bias'),
            };
        })
        .filter(Boolean)
        .slice(0, 4);
};
// NEW CODE END
// ─────────────────────────────────────────────────────────────────

const BULL_WORDS = ['rally', 'rallies', 'strength', 'breakout', 'bullish', 'upside', 'momentum', 'risk-on', 'risk on', 'inflows', 'all-time high', 'ath', 'gains', 'leading', 'outperform', 'expansion', 'soft landing'];
const BEAR_WORDS = ['selloff', 'sell-off', 'weakness', 'breakdown', 'bearish', 'downside', 'risk-off', 'risk off', 'outflows', 'recession', 'fear', 'losses', 'lagging', 'underperform', 'contraction', 'hawkish'];
const VOL_WORDS = ['volatile', 'volatility', 'whipsaw', 'choppy', 'erratic', 'vix', 'uncertainty', 'spike'];
const RISK_WORDS = ['geopolitic', 'war', 'tariff', 'sanction', 'inflation', 'cpi', 'fed', 'fomc', 'jobs', 'nfp', 'earnings'];

// ---------- bias ----------

/**
 * Returns 'LONG' | 'SHORT' | 'MIXED' from the report outlook + supporting text.
 */
export const deriveTradeBias = (report) => {
    if (!report) return 'MIXED';
    // Prefer server-provided bias (normalized through the adapter)
    const adapted = normalizeBias(report.tradeBias);
    if (adapted) return adapted;
    const sentiment = lc(report.outlook?.sentiment);
    if (sentiment === 'bullish') return 'LONG';
    if (sentiment === 'bearish') return 'SHORT';

    // fall back to keyword scoring on summary + themes
    const corpus = [report.summary, ...(report.themes || [])].join(' ');
    const bullHits = BULL_WORDS.filter((w) => lc(corpus).includes(w)).length;
    const bearHits = BEAR_WORDS.filter((w) => lc(corpus).includes(w)).length;
    if (bullHits > bearHits + 1) return 'LONG';
    if (bearHits > bullHits + 1) return 'SHORT';
    return 'MIXED';
};

// ---------- confidence (0-100) ----------

/**
 * Heuristic confidence: stronger when sentiment is decisive AND themes
 * agree AND there are few high-severity risk factors.
 */
export const deriveConfidence = (report) => {
    if (!report) return 50;
    // Prefer server-provided confidence
    if (typeof report.confidence === 'number' && Number.isFinite(report.confidence)) {
        return Math.max(0, Math.min(100, Math.round(report.confidence)));
    }
    const bias = deriveTradeBias(report);
    let score = bias === 'MIXED' ? 55 : 70;

    const corpus = [report.summary, ...(report.themes || [])].join(' ');
    const bullHits = BULL_WORDS.filter((w) => lc(corpus).includes(w)).length;
    const bearHits = BEAR_WORDS.filter((w) => lc(corpus).includes(w)).length;
    const agreement = bias === 'LONG' ? bullHits - bearHits
                    : bias === 'SHORT' ? bearHits - bullHits
                    : 0;
    score += Math.min(15, Math.max(-10, agreement * 3));

    // Risk drag — each risk factor pulls confidence down a touch
    const riskDrag = Math.min(15, (report.riskFactors?.length || 0) * 3);
    score -= riskDrag;

    // Volatility drag
    if (matchAny(corpus, VOL_WORDS)) score -= 5;

    return Math.max(40, Math.min(92, Math.round(score)));
};

// ---------- time horizon ----------

/**
 * Returns 'Intraday' | 'Swing' | 'Multi-day'.
 * Daily reports tilt swing by default; volatility shortens the horizon.
 */
export const deriveTimeHorizon = (report) => {
    // Prefer server-provided horizon (normalized through the adapter)
    const adapted = normalizeTimeframe(report?.timeHorizon);
    if (adapted) return adapted;
    const corpus = [report?.summary, ...(report?.themes || [])].join(' ');
    if (matchAny(corpus, ['intraday', 'scalp', 'fade', 'opening drive'])) return 'Intraday';
    if (matchAny(corpus, VOL_WORDS)) return 'Intraday';
    if (matchAny(corpus, ['multi-day', 'multi day', 'this week', 'next week', 'trend'])) return 'Multi-day';
    return 'Swing';
};

// ---------- strategy ----------

/**
 * One-word strategy label appropriate to bias + tone.
 */
export const deriveStrategy = (report) => {
    if (typeof report?.strategy === 'string' && report.strategy.trim()) return report.strategy;
    const bias = deriveTradeBias(report);
    const corpus = [report?.summary, ...(report?.themes || [])].join(' ');

    if (matchAny(corpus, ['breakout', 'all-time high', 'ath', 'new high'])) return 'Breakouts';
    if (matchAny(corpus, ['pullback', 'retest', 'support'])) return 'Pullbacks';
    if (matchAny(corpus, ['range', 'consolidat', 'sideways'])) return 'Mean reversion';
    if (matchAny(corpus, VOL_WORDS)) return 'Tighter stops, smaller size';
    if (bias === 'LONG') return 'Continuation longs';
    if (bias === 'SHORT') return 'Failed-rally shorts';
    return 'Selective, both directions';
};

// ---------- actionable insights (2-4 bullets) ----------

/**
 * Punchy "what should I do" lines, derived from themes + sectors + risks.
 * Always returns 2-4 items.
 */
export const deriveActionableInsights = (report) => {
    if (!report) return [];
    // Prefer server-provided insights
    if (Array.isArray(report.actionableInsights) && report.actionableInsights.length > 0) {
        return report.actionableInsights.slice(0, 4);
    }
    const out = [];
    const bias = deriveTradeBias(report);
    const corpus = [report.summary, report.sectorHighlights, ...(report.themes || [])].join(' ');
    const t = lc(corpus);

    // Sector-led actions
    if (t.includes('tech') || t.includes('semiconductor') || t.includes('ai')) {
        out.push(bias === 'SHORT'
            ? 'Tech under pressure — fade rips in mega-cap names'
            : 'Tech leadership intact — focus on continuation setups');
    }
    if (t.includes('financial') || t.includes('bank')) {
        out.push('Watch financials for confirmation of risk appetite');
    }
    if (t.includes('energy') || t.includes('oil') || t.includes('crude')) {
        out.push('Energy in motion — look for momentum plays in XLE / oil majors');
    }
    if (t.includes('small cap') || t.includes('russell') || t.includes('iwm')) {
        out.push('Small caps active — momentum trades on Russell leaders');
    }

    // Bias-led action
    if (bias === 'LONG' && out.length < 2) {
        out.push('Lean long — buy strength, avoid chasing extended names');
    } else if (bias === 'SHORT' && out.length < 2) {
        out.push('Lean short — sell weakness on failed bounces');
    } else if (bias === 'MIXED' && out.length < 2) {
        out.push('Stay nimble — trade both sides, avoid heavy directional bets');
    }

    // Risk-led action
    if ((report.riskFactors?.length || 0) >= 2) {
        out.push('Elevated risk — reduce size and tighten stops');
    } else if (matchAny(corpus, VOL_WORDS)) {
        out.push('Volatility elevated — use wider stops, smaller size');
    }

    return out.slice(0, 4);
};

// ---------- trade setups ("How to Trade This") ----------

/**
 * Concrete "if X then Y" trade ideas tied to report content.
 */
export const deriveTradeSetups = (report) => {
    if (!report) return [];
    // Prefer server-provided setups (adapted from { asset, direction, reasoning })
    const adapted = adaptTradeSetups(report.tradeSetups);
    if (adapted && adapted.length > 0) return adapted;
    const setups = [];
    const bias = deriveTradeBias(report);
    const corpus = [report.summary, report.sectorHighlights, ...(report.themes || [])].join(' ');
    const t = lc(corpus);

    if (t.includes('tech')) {
        setups.push({
            trigger: 'Tech leading',
            action: bias === 'SHORT' ? 'fade rips in QQQ / mega-caps on volume' : 'look for continuation breakouts in QQQ leaders',
            tag: 'Sector',
        });
    }
    if (t.includes('small cap') || t.includes('russell')) {
        setups.push({
            trigger: 'Small caps strong',
            action: 'momentum longs on IWM breakouts, watch RVOL',
            tag: 'Momentum',
        });
    }
    if (t.includes('energy') || t.includes('oil')) {
        setups.push({
            trigger: 'Energy active',
            action: 'XLE pullback longs, oil majors on volume',
            tag: 'Sector',
        });
    }
    if ((report.riskFactors?.length || 0) >= 2 || matchAny(corpus, RISK_WORDS)) {
        setups.push({
            trigger: 'Macro / event risk elevated',
            action: 'reduce size, tighter stops, avoid overnight holds',
            tag: 'Risk',
        });
    }
    if (matchAny(corpus, VOL_WORDS)) {
        setups.push({
            trigger: 'Volatility expanded',
            action: 'mean-reversion intraday, fade extreme moves',
            tag: 'Volatility',
        });
    }

    if (setups.length === 0) {
        setups.push({
            trigger: bias === 'LONG' ? 'Bullish bias' : bias === 'SHORT' ? 'Bearish bias' : 'Mixed tape',
            action: bias === 'LONG' ? 'breakouts and pullback longs in leaders'
                  : bias === 'SHORT' ? 'failed-rally shorts in lagging names'
                  : 'small size, both directions, exit fast',
            tag: 'Bias',
        });
    }

    return setups.slice(0, 4);
};

// ---------- snapshot bar ----------

/**
 * Compact market snapshot for the top bar.
 *  - bias:     'Bullish' | 'Neutral' | 'Bearish'
 *  - breadth:  0-100  (% bullish-leaning signal in the corpus)
 *  - vol:      'Low' | 'Normal' | 'Elevated' | 'High'
 *  - sentiment:'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' | 'Extreme Fear'
 */
export const deriveSnapshot = (report) => {
    // Prefer server-provided snapshot (e.g. from /market-pulse)
    if (report?.snapshot && typeof report.snapshot === 'object') {
        const s = report.snapshot;
        return {
            bias: s.bias || 'Neutral',
            breadth: typeof s.breadth === 'number' ? s.breadth : 50,
            vol: s.vol || 'Normal',
            sentiment: s.sentiment || 'Neutral',
        };
    }
    const bias = deriveTradeBias(report);
    const corpus = [report?.summary, report?.sectorHighlights, ...(report?.themes || [])].join(' ');

    const bullHits = BULL_WORDS.filter((w) => lc(corpus).includes(w)).length;
    const bearHits = BEAR_WORDS.filter((w) => lc(corpus).includes(w)).length;
    const total = Math.max(1, bullHits + bearHits);
    const breadth = Math.round((bullHits / total) * 100);

    const volHits = VOL_WORDS.filter((w) => lc(corpus).includes(w)).length;
    const riskCount = report?.riskFactors?.length || 0;
    const volScore = volHits * 2 + riskCount;
    const vol = volScore >= 5 ? 'High'
              : volScore >= 3 ? 'Elevated'
              : volScore >= 1 ? 'Normal'
              : 'Low';

    let sentiment;
    if (bias === 'LONG' && breadth >= 75) sentiment = 'Extreme Greed';
    else if (bias === 'LONG') sentiment = 'Greed';
    else if (bias === 'SHORT' && breadth <= 25) sentiment = 'Extreme Fear';
    else if (bias === 'SHORT') sentiment = 'Fear';
    else sentiment = 'Neutral';

    return {
        bias: bias === 'LONG' ? 'Bullish' : bias === 'SHORT' ? 'Bearish' : 'Neutral',
        breadth,
        vol,
        sentiment,
    };
};

// ---------- risk severity ----------

/**
 * Heuristic severity for a single risk-factor string. 'high' | 'med' | 'low'.
 */
export const riskSeverity = (text) => {
    const t = lc(text);
    if (matchAny(t, ['war', 'crash', 'contagion', 'default', 'systemic', 'shutdown', 'collapse'])) return 'high';
    if (matchAny(t, ['fed', 'fomc', 'cpi', 'inflation', 'recession', 'tariff', 'sanction', 'earnings', 'jobs'])) return 'med';
    return 'low';
};

// ---------- sector parsing ----------

/**
 * Crude parser to turn the freeform `sectorHighlights` paragraph into 4-8 cards.
 * Splits on sentences / known sector names.
 */
const SECTOR_TOKENS = [
    { key: 'Technology', match: ['tech', 'semis', 'semiconductor', 'software', 'xlk'] },
    { key: 'Financials', match: ['financ', 'bank', 'xlf'] },
    { key: 'Energy', match: ['energy', 'oil', 'crude', 'xle'] },
    { key: 'Healthcare', match: ['health', 'pharma', 'biotech', 'xlv'] },
    { key: 'Consumer', match: ['consumer', 'retail', 'xly', 'xlp'] },
    { key: 'Industrials', match: ['industrial', 'xli'] },
    { key: 'Utilities', match: ['utilit', 'xlu'] },
    { key: 'Materials', match: ['material', 'xlb'] },
    { key: 'Real Estate', match: ['real estate', 'reit', 'xlre'] },
];

export const parseSectorHighlights = (sectorHighlights) => {
    if (!sectorHighlights) return [];
    const text = sectorHighlights.toString();
    const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
    const cards = [];

    for (const token of SECTOR_TOKENS) {
        const sentence = sentences.find((s) => matchAny(s, token.match));
        if (!sentence) continue;
        const tone = matchAny(sentence, BULL_WORDS) ? 'bullish'
                   : matchAny(sentence, BEAR_WORDS) ? 'bearish'
                   : 'neutral';
        cards.push({ name: token.key, tone, note: sentence });
    }

    // Fallback: if we matched nothing, return one neutral card with the raw text
    if (cards.length === 0 && text.length > 0) {
        cards.push({ name: 'Sector Recap', tone: 'neutral', note: text });
    }

    return cards;
};

// ---------- summary trimming ----------

/**
 * Trim the summary paragraph to ~40-60% of its length while keeping whole
 * sentences. Caller can render the full text behind a "show more" if needed.
 */
export const trimSummary = (summary, targetWords = 45) => {
    if (!summary) return '';
    if (wordCount(summary) <= targetWords) return summary;
    const sentences = summary.split(/(?<=[.!?])\s+/);
    const out = [];
    let count = 0;
    for (const s of sentences) {
        out.push(s);
        count += wordCount(s);
        if (count >= targetWords) break;
    }
    return out.join(' ');
};

// ---------- signal alignment ----------

/**
 * Filters/sorts a list of normalized signals to those that align with the
 * report bias. Returns top N by confidence.
 */
export const alignSignalsToReport = (signals, report, limit = 5) => {
    if (!Array.isArray(signals) || signals.length === 0) return [];
    const bias = deriveTradeBias(report);
    let pool = signals;
    if (bias === 'LONG') pool = signals.filter((s) => s.direction === 'LONG');
    else if (bias === 'SHORT') pool = signals.filter((s) => s.direction === 'SHORT');
    // MIXED uses everything

    // Quality gate: 60%+ confidence
    pool = pool.filter((s) => (s.confidence ?? 0) >= 60);

    // If filtering wiped us out, fall back to top-confidence signals overall
    if (pool.length === 0) pool = signals.filter((s) => (s.confidence ?? 0) >= 60);

    return [...pool]
        .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
        .slice(0, limit);
};
