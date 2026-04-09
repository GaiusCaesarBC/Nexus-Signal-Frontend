// client/src/pages/economicCalendar/derive.js
//
// Pure heuristics for the redesigned Economic Calendar page.
//
// SERVER-FIRST BRIDGE: every public function checks for a server-provided
// field on the event payload first and uses it directly when present,
// otherwise falls back to the local heuristic. The day the ML service
// starts attaching these fields the heuristics become invisible.
//
// Server fields the bridge looks for (all optional):
//   event.importanceScore   0-100
//   event.expectedBias      'bullish'|'bearish'|'neutral'
//   event.whyItMatters      string (one sentence)
//   event.howToTradeIt      string (one sentence)
//   event.tradeSetups       [{ asset, direction, trigger, confidence }]
//   event.assetRelevance    string[] (e.g. ['stocks','forex'])
//   event.tradable          boolean
//   payload.aiMacroInsight  string (top-level for the page)
//   payload.marketImpactSummary  { high, med, risk, vol, summary, count }

// ============================================================
// Constants
// ============================================================

// Country -> flag emoji + asset class affinity
export const COUNTRY_META = {
    US: { flag: '🇺🇸', name: 'United States', assetClasses: ['stocks', 'forex', 'crypto'] },
    EU: { flag: '🇪🇺', name: 'Eurozone',     assetClasses: ['forex', 'stocks'] },
    UK: { flag: '🇬🇧', name: 'United Kingdom', assetClasses: ['forex', 'stocks'] },
    JP: { flag: '🇯🇵', name: 'Japan',        assetClasses: ['forex', 'stocks'] },
    CN: { flag: '🇨🇳', name: 'China',        assetClasses: ['stocks', 'crypto'] },
    CA: { flag: '🇨🇦', name: 'Canada',       assetClasses: ['forex'] },
    AU: { flag: '🇦🇺', name: 'Australia',    assetClasses: ['forex'] },
    DE: { flag: '🇩🇪', name: 'Germany',      assetClasses: ['stocks', 'forex'] },
};

// Event-name -> category buckets we recognize for tighter heuristics.
const EVENT_PATTERNS = {
    cpi:          /\bCPI|consumer price|inflation\b/i,
    ppi:          /\bPPI|producer price\b/i,
    pce:          /\bPCE|personal consumption\b/i,
    fomc:         /\bFOMC|fed funds|interest rate decision|rate decision\b/i,
    fed_speech:   /\bfed (speech|chair|chairman)|powell|fed minutes\b/i,
    nfp:          /\bnonfarm payroll|NFP|employment situation\b/i,
    jobless:      /\bjobless claims|initial claims|continuing claims\b/i,
    unemployment: /\bunemployment rate\b/i,
    gdp:          /\bGDP|gross domestic\b/i,
    retail:       /\bretail sales\b/i,
    pmi:          /\bPMI|purchasing manager|ISM\b/i,
    housing:      /\bhousing|building permits|home sales|new home\b/i,
    consumer_sent: /\bconsumer sentiment|confidence\b/i,
    earnings:     /\bearnings report\b/i,
};

const matchKey = (eventName) => {
    for (const [key, re] of Object.entries(EVENT_PATTERNS)) {
        if (re.test(eventName || '')) return key;
    }
    return null;
};

// ============================================================
// Importance score (0-100)
// ============================================================

const IMPACT_BASE = { high: 70, medium: 45, low: 20 };

const KEY_BOOST = {
    fomc:       30,
    cpi:        25,
    nfp:        25,
    pce:        18,
    ppi:        12,
    fed_speech: 12,
    gdp:        15,
    jobless:    8,
    retail:     8,
    pmi:        6,
    housing:    4,
};

export const importanceScore = (event) => {
    if (!event) return 0;
    // ─────────────────────────────────────────────────────────────────
    // NEW CODE START — Server importance scale adapter
    //
    // Server emits importanceScore on a 1-10 scale; client UI consumes
    // 0-100. We auto-detect the scale: anything <= 10 is treated as the
    // server's 1-10 scale and multiplied by 10. Values > 10 are assumed
    // to already be on the client 0-100 scale and pass through (defensive
    // — keeps the heuristic fallback path working unchanged).
    //
    // Per spec: missing → default to 50 (handled below by the heuristic
    // fallback, which always returns a non-zero value when given a real
    // event).
    // ─────────────────────────────────────────────────────────────────
    if (typeof event.importanceScore === 'number' && Number.isFinite(event.importanceScore)) {
        const raw = event.importanceScore;
        const scaled = raw > 0 && raw <= 10 ? raw * 10 : raw;
        return Math.max(0, Math.min(100, Math.round(scaled)));
    }
    // NEW CODE END
    // ─────────────────────────────────────────────────────────────────
    const base = IMPACT_BASE[event.impact] ?? 25;
    const key = matchKey(event.name);
    const boost = key ? (KEY_BOOST[key] || 0) : 0;
    // US gets a small bonus for global market relevance
    const usBonus = event.country === 'US' ? 5 : 0;
    return Math.min(100, base + boost + usBonus);
};

// ============================================================
// Directional sentiment from forecast vs previous
// ============================================================

const num = (v) => {
    if (typeof v === 'number') return v;
    if (typeof v !== 'string') return null;
    // strip %, K, M, $, commas
    const cleaned = v.replace(/[,%$]/g, '').trim();
    const match = cleaned.match(/-?\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
};

// Some events are "lower is better" — invert sentiment.
const LOWER_IS_BETTER = ['jobless', 'unemployment', 'cpi', 'ppi', 'pce'];

/**
 * Returns 'bullish' | 'bearish' | 'neutral' based on forecast vs previous.
 * Heuristic: forecast > previous on a "growth" event = bullish; forecast >
 * previous on a "lower-is-better" event (CPI, jobless) = bearish.
 */
export const expectedBias = (event) => {
    if (!event) return 'neutral';
    if (event.expectedBias === 'bullish' || event.expectedBias === 'bearish' || event.expectedBias === 'neutral') {
        return event.expectedBias;
    }
    const f = num(event.forecast);
    const p = num(event.previous);
    if (f == null || p == null || f === p) return 'neutral';

    const key = matchKey(event.name);
    const lowerIsBetter = key && LOWER_IS_BETTER.includes(key);

    const forecastHigher = f > p;
    if (lowerIsBetter) return forecastHigher ? 'bearish' : 'bullish';
    return forecastHigher ? 'bullish' : 'bearish';
};

// ============================================================
// "Why it matters" (1 sentence)
// ============================================================

export const whyItMatters = (event) => {
    if (typeof event?.whyItMatters === 'string' && event.whyItMatters.trim()) return event.whyItMatters;
    const key = matchKey(event?.name);
    switch (key) {
        case 'cpi':
            return 'Drives Fed rate-path expectations and risk appetite across all assets.';
        case 'ppi':
            return 'Leading indicator for CPI and corporate margin pressure.';
        case 'pce':
            return "The Fed's preferred inflation gauge — moves rate expectations directly.";
        case 'fomc':
            return 'Direct rate decision — single biggest equity + USD catalyst this cycle.';
        case 'fed_speech':
            return 'Fed messaging shifts can re-price the entire rate curve in minutes.';
        case 'nfp':
            return 'Defines the labor backdrop and the path of Fed policy.';
        case 'jobless':
            return 'High-frequency labor signal — early read on employment trends.';
        case 'unemployment':
            return 'Headline labor health — drives risk-on / risk-off rotations.';
        case 'gdp':
            return 'Growth scorecard — sets the cyclical backdrop for equities.';
        case 'retail':
            return 'Consumer health — drives discretionary + earnings expectations.';
        case 'pmi':
            return 'Activity proxy — leading indicator for the cyclical sectors.';
        case 'housing':
            return 'Rate-sensitive demand signal — moves homebuilders + financials.';
        case 'consumer_sent':
            return 'Forward-looking sentiment read on the consumer.';
        default:
            return event?.impact === 'high'
                ? 'High-impact macro release — expect intraday volatility around the print.'
                : 'Macro datapoint — minor expected market reaction.';
    }
};

// ============================================================
// "How to trade it" (1 actionable sentence)
// ============================================================

export const howToTradeIt = (event) => {
    if (typeof event?.howToTradeIt === 'string' && event.howToTradeIt.trim()) return event.howToTradeIt;
    const key = matchKey(event?.name);
    const bias = expectedBias(event);
    const biasTag = bias === 'bullish' ? 'long bias'
                  : bias === 'bearish' ? 'short bias'
                  : 'two-sided';

    switch (key) {
        case 'cpi':
        case 'pce':
        case 'ppi':
            return bias === 'bullish'
                ? 'Cooler print → bullish continuation in QQQ / SPY; faster print → fade rallies in tech.'
                : bias === 'bearish'
                ? 'Hotter print → short tech, long USD; cooler surprise → squeeze higher in growth.'
                : 'Wait for the print — trade the reaction, not the prediction.';
        case 'fomc':
            return 'Avoid overnight risk pre-decision. Trade the volatility expansion after the dot plot.';
        case 'fed_speech':
            return 'Watch USD + 2Y yield reaction — fade extreme moves in either direction.';
        case 'nfp':
            return 'Strong print → long financials/cyclicals; weak print → long bonds + gold.';
        case 'jobless':
            return bias === 'bullish'
                ? 'Below-consensus claims → bullish continuation in SPY/QQQ.'
                : 'Above-consensus claims → defensive rotation, watch staples + utilities.';
        case 'gdp':
            return 'Beat → cyclical leadership; miss → flight to mega-cap quality.';
        case 'retail':
            return 'Beat → long XLY (discretionary); miss → long XLP (staples).';
        case 'pmi':
            return 'Above 50 → cyclical longs (XLI); below 50 → defensive tilt.';
        case 'housing':
            return 'Beat → homebuilders (XHB) + financials; miss → REITs + utilities.';
        default:
            return `Likely ${biasTag} trade — size small until the reaction is clear.`;
    }
};

// ============================================================
// Trade setups from a single event (for the "Trade Setups" section)
// ============================================================

const TRADE_TEMPLATES = {
    cpi: [
        { asset: 'QQQ', direction: 'LONG',  trigger: 'CPI prints below expectations',  baseConf: 70 },
        { asset: 'SPY', direction: 'SHORT', trigger: 'CPI prints above expectations', baseConf: 65 },
        { asset: 'GLD', direction: 'LONG',  trigger: 'CPI surprises hot',              baseConf: 55 },
    ],
    pce: [
        { asset: 'QQQ', direction: 'LONG',  trigger: 'PCE in line or below', baseConf: 65 },
        { asset: 'TLT', direction: 'LONG',  trigger: 'PCE prints cooler',     baseConf: 60 },
    ],
    ppi: [
        { asset: 'XLK', direction: 'LONG',  trigger: 'PPI prints below expectations', baseConf: 60 },
    ],
    fomc: [
        { asset: 'SPY', direction: 'LONG',  trigger: 'Dovish surprise / rate cut',   baseConf: 75 },
        { asset: 'SPY', direction: 'SHORT', trigger: 'Hawkish hold / rate hike',     baseConf: 70 },
        { asset: 'GLD', direction: 'LONG',  trigger: 'Dovish surprise',              baseConf: 60 },
    ],
    fed_speech: [
        { asset: 'DXY', direction: 'LONG',  trigger: 'Hawkish tone',  baseConf: 55 },
        { asset: 'DXY', direction: 'SHORT', trigger: 'Dovish tone',   baseConf: 55 },
    ],
    nfp: [
        { asset: 'XLF', direction: 'LONG',  trigger: 'Strong jobs print', baseConf: 65 },
        { asset: 'TLT', direction: 'LONG',  trigger: 'Weak jobs print',   baseConf: 60 },
    ],
    jobless: [
        { asset: 'SPY', direction: 'LONG',  trigger: 'Claims below consensus', baseConf: 55 },
        { asset: 'XLP', direction: 'LONG',  trigger: 'Claims spike higher',     baseConf: 50 },
    ],
    gdp: [
        { asset: 'XLI', direction: 'LONG',  trigger: 'GDP beats',  baseConf: 60 },
        { asset: 'XLP', direction: 'LONG',  trigger: 'GDP misses', baseConf: 55 },
    ],
    retail: [
        { asset: 'XLY', direction: 'LONG',  trigger: 'Retail sales beat', baseConf: 55 },
        { asset: 'XLP', direction: 'LONG',  trigger: 'Retail sales miss', baseConf: 50 },
    ],
    pmi: [
        { asset: 'XLI', direction: 'LONG',  trigger: 'PMI > 50 + accelerating', baseConf: 55 },
    ],
    housing: [
        { asset: 'XHB', direction: 'LONG',  trigger: 'Housing data beats', baseConf: 55 },
    ],
};

export const tradeSetupsFor = (event) => {
    if (Array.isArray(event?.tradeSetups) && event.tradeSetups.length > 0) {
        return event.tradeSetups.map((s, i) => ({
            id: s.id || `${event.name}-srv-${i}`,
            eventName: event.name,
            asset: s.asset,
            direction: s.direction,
            trigger: s.trigger,
            confidence: s.confidence,
        }));
    }
    const key = matchKey(event?.name);
    if (!key || !TRADE_TEMPLATES[key]) return [];
    const score = importanceScore(event);
    // Scale confidence by importance — high-impact events make their setups
    // more credible.
    const scale = Math.max(0.6, Math.min(1.1, score / 80));
    return TRADE_TEMPLATES[key].map((t, i) => ({
        id: `${key}-${event.name}-${i}`,
        eventName: event.name,
        asset: t.asset,
        direction: t.direction,
        trigger: t.trigger,
        confidence: Math.min(95, Math.round(t.baseConf * scale)),
    }));
};

// ============================================================
// Today's filters
// ============================================================

const isoDay = (d) => {
    if (typeof d === 'string') return d.slice(0, 10);
    return new Date(d).toISOString().slice(0, 10);
};

export const todayISO = () => isoDay(new Date());

export const isTodayEvent = (event) => isoDay(event?.date) === todayISO();

export const eventsForToday = (events) =>
    (events || []).filter(isTodayEvent);

// ============================================================
// Top market movers (today, ranked)
// ============================================================

export const todaysMarketMovers = (events, limit = 5) => {
    const today = eventsForToday(events);
    return [...today]
        .map((e) => ({ ...e, _score: importanceScore(e) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, limit);
};

// ============================================================
// Market impact summary (for the top bar)
// ============================================================

export const marketImpactSummary = (events, payload) => {
    // Prefer server-provided summary
    if (payload?.marketImpactSummary && typeof payload.marketImpactSummary === 'object') {
        return payload.marketImpactSummary;
    }
    const today = eventsForToday(events);
    const high = today.filter((e) => e.impact === 'high').length;
    const med = today.filter((e) => e.impact === 'medium').length;
    const totalScore = today.reduce((s, e) => s + importanceScore(e), 0);

    let risk = 'LOW';
    if (high >= 2 || totalScore >= 200) risk = 'HIGH';
    else if (high >= 1 || totalScore >= 110) risk = 'ELEVATED';

    let vol = 'Low';
    if (risk === 'HIGH') vol = 'High volatility expected';
    else if (risk === 'ELEVATED') vol = 'Elevated volatility likely';
    else if (today.length > 0) vol = 'Quiet tape — minor moves';
    else vol = 'No scheduled releases — calm tape';

    let summary;
    if (high === 0 && med === 0) summary = 'No high-impact releases — light macro day.';
    else if (high === 1) summary = '1 high-impact event today — expect a sharp reaction window.';
    else if (high >= 2) summary = `${high} high-impact events today — expect elevated volatility.`;
    else summary = `${med} medium-impact event${med > 1 ? 's' : ''} today — expect modest moves.`;

    return { high, med, risk, vol, summary, count: today.length };
};

// ============================================================
// AI macro insight (punchy, action-focused)
// ============================================================

export const aiMacroInsight = (events, payload) => {
    // Prefer server-provided insight
    if (typeof payload?.aiMacroInsight === 'string' && payload.aiMacroInsight.trim()) {
        return payload.aiMacroInsight;
    }
    const today = eventsForToday(events);
    if (today.length === 0) {
        return 'No major macro releases today — focus on flow + earnings, avoid overtrading.';
    }
    const movers = todaysMarketMovers(events, 3);
    const top = movers[0];
    const key = matchKey(top.name);

    const lead =
        key === 'cpi' || key === 'pce' || key === 'ppi'
            ? 'Markets sensitive to inflation data.'
      : key === 'fomc'
            ? 'All eyes on the Fed.'
      : key === 'nfp' || key === 'jobless' || key === 'unemployment'
            ? 'Markets sensitive to labor data.'
      : key === 'gdp'
            ? 'Growth print in focus.'
      : key === 'retail'
            ? 'Consumer health under the lens.'
      : 'Macro releases will set tone.';

    const bias = expectedBias(top);
    const tail = bias === 'bullish'
        ? 'Cooler / weaker prints could fuel a continuation move higher.'
      : bias === 'bearish'
        ? 'Hotter / stronger prints risk a sharp pullback.'
        : 'Two-sided risk — wait for the print, then trade the reaction.';

    return `${lead} ${tail}`;
};

// ============================================================
// Upcoming high-impact events (next 24-72h)
// ============================================================

export const upcomingHighImpact = (events, hoursAhead = 72) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return (events || [])
        .filter((e) => {
            if (e.impact !== 'high') return false;
            const d = new Date(e.date);
            // Only future events (today or later)
            return d >= new Date(now.toDateString()) && d <= cutoff;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// ============================================================
// Asset relevance — for the "tradable / asset filter"
// ============================================================

const ASSET_AFFINITY_BY_KEY = {
    cpi:        ['stocks', 'forex', 'crypto'],
    pce:        ['stocks', 'forex'],
    ppi:        ['stocks'],
    fomc:       ['stocks', 'forex', 'crypto'],
    fed_speech: ['forex', 'stocks'],
    nfp:        ['stocks', 'forex'],
    jobless:    ['stocks'],
    unemployment: ['stocks', 'forex'],
    gdp:        ['stocks', 'forex'],
    retail:     ['stocks'],
    pmi:        ['stocks', 'forex'],
    housing:    ['stocks'],
};

export const assetRelevance = (event) => {
    if (Array.isArray(event?.assetRelevance) && event.assetRelevance.length > 0) {
        return event.assetRelevance;
    }
    const key = matchKey(event?.name);
    if (key && ASSET_AFFINITY_BY_KEY[key]) return ASSET_AFFINITY_BY_KEY[key];
    return COUNTRY_META[event?.country]?.assetClasses || ['stocks'];
};

export const isTradable = (event) => {
    if (typeof event?.tradable === 'boolean') return event.tradable;
    // "Tradable" = high or medium impact AND we have a known event template.
    return event && event.impact !== 'low' && matchKey(event.name) != null;
};

// ============================================================
// Misc
// ============================================================

export { matchKey };
