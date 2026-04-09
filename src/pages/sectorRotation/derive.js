// client/src/pages/sectorRotation/derive.js
//
// Pure heuristics for the redesigned Sector Rotation page.
//
// SERVER-FIRST BRIDGE: every public function checks for a server-provided
// field on the sector / analytics payload first and uses it directly when
// present, otherwise falls back to the local heuristic. The day the ML
// service starts returning these fields the heuristics become invisible.
//
// Server fields the bridge looks for (all optional):
//   sector.score                0-100
//   sector.momentum             { dir, delta }
//   sector.label                string
//   sector.tone                 'bull'|'warn'|'bear'
//   analytics.bias              'RISK-ON'|'RISK-OFF'|'NEUTRAL'
//   analytics.tradeIdeas        [{ id, direction, ticker, name, reason, confidence, kind }]
//   analytics.rotationInsight   string
//   analytics.aiInsight         string
//   analytics.cycleImplications { phase, favor[], avoid[], action }

// ---------- normalization ----------

const num = (v, fallback = 0) => (typeof v === 'number' && !Number.isNaN(v) ? v : fallback);
const pct = (s, k) => num(s?.performance?.[k]);
const rs = (s, k = 'week') => num(s?.relativeStrength?.[k]);

// Defensive coerce of incoming sectors array
export const normalizeSectors = (raw) => {
    if (!Array.isArray(raw)) return [];
    return raw.map((s) => ({
        id: s.id || s.symbol,
        name: s.name || s.symbol,
        symbol: s.symbol,
        color: s.color,
        day: pct(s, 'day'),
        week: pct(s, 'week'),
        month: pct(s, 'month'),
        rsWeek: rs(s, 'week'),
        // for sparkline (best-effort: use whatever the server gives us)
        history: Array.isArray(s.history) ? s.history
                : Array.isArray(s.weekly) ? s.weekly
                : null,
        raw: s,
    }));
};

// ---------- strength score (0-100) ----------
//
// Blend of week return + relative strength vs SPY + month return.
// Mapped to 0-100 by linear bucketing on a [-6%, +6%] domain.

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const toScore = (val, lo = -6, hi = 6) => {
    const x = clamp01((val - lo) / (hi - lo));
    return Math.round(x * 100);
};

export const strengthScore = (sector) => {
    if (!sector) return 50;
    // Prefer server-provided score
    if (typeof sector.score === 'number' && Number.isFinite(sector.score)) {
        return Math.max(0, Math.min(100, Math.round(sector.score)));
    }
    // weights: week 50%, RS 30%, month 20%
    const wk = toScore(sector.week);
    const rsScore = toScore(sector.rsWeek, -4, 4); // RS bucket is tighter
    const mo = toScore(sector.month, -10, 10);
    return Math.round(wk * 0.5 + rsScore * 0.3 + mo * 0.2);
};

// ---------- momentum (acceleration) ----------
//
// Compares short window (day) to longer window (week) to infer whether the
// sector is accelerating or losing steam.

export const momentumOf = (sector) => {
    if (!sector) return { dir: 'flat', delta: 0 };
    // Prefer server-provided momentum
    if (sector.momentum && typeof sector.momentum === 'object') {
        return {
            dir: sector.momentum.dir || 'flat',
            delta: typeof sector.momentum.delta === 'number' ? sector.momentum.delta : 0,
        };
    }
    // Day return annualized vs weekly average daily — if day > weekly avg
    // daily, we say accelerating.
    const dayRate = sector.day;
    const weeklyDailyAvg = sector.week / 5;
    const delta = dayRate - weeklyDailyAvg;

    if (Math.abs(delta) < 0.15) return { dir: 'flat', delta };
    return { dir: delta > 0 ? 'up' : 'down', delta };
};

// ---------- label ----------
//
// Short label appropriate to the sector's posture.

export const labelOf = (sector) => {
    if (typeof sector?.label === 'string' && sector.label.trim()) return sector.label;
    const score = strengthScore(sector);
    const mom = momentumOf(sector);

    if (score >= 78 && mom.dir === 'up') return 'Breakout';
    if (score >= 65 && mom.dir === 'up') return 'Building Momentum';
    if (score >= 65) return 'Strong Inflow';
    if (score >= 50 && mom.dir === 'up') return 'Rotation In';
    if (score >= 50) return 'Holding';
    if (score >= 35) return 'Rotation Out';
    if (score >= 25) return 'Capital Exiting';
    return 'Weakness';
};

// Tone: 'bull' | 'warn' | 'bear'
export const toneOf = (sector) => {
    if (sector?.tone === 'bull' || sector?.tone === 'warn' || sector?.tone === 'bear') return sector.tone;
    const score = strengthScore(sector);
    if (score >= 65) return 'bull';
    if (score >= 40) return 'warn';
    return 'bear';
};

// ---------- ranked sectors ----------

export const rankSectors = (sectors) => {
    const enriched = sectors.map((s) => {
        const score = strengthScore(s);
        const mom = momentumOf(s);
        return {
            ...s,
            score,
            momentum: mom,
            label: labelOf(s),
            tone: toneOf(s),
        };
    });
    return enriched.sort((a, b) => b.score - a.score);
};

// ---------- where money is moving ----------
//
// Returns top inflows / outflows + risk-on/off bias.

export const whereMoneyMoving = (sectors) => {
    const ranked = rankSectors(sectors);
    const top3 = ranked.slice(0, 3);
    const bottom2 = ranked.slice(-2).reverse();

    // Risk-on if growthy / cyclical sectors lead and defensives lag
    const GROWTH = ['XLK', 'XLY', 'XLC', 'XLI', 'XLF']; // tech, discretionary, comms, industrials, financials
    const DEFENSE = ['XLU', 'XLP', 'XLV', 'XLRE'];      // utilities, staples, health, real estate

    const growthAvg = avgScore(ranked.filter((s) => GROWTH.includes(s.symbol)));
    const defAvg = avgScore(ranked.filter((s) => DEFENSE.includes(s.symbol)));

    let bias = 'NEUTRAL';
    if (growthAvg - defAvg >= 8) bias = 'RISK-ON';
    else if (defAvg - growthAvg >= 8) bias = 'RISK-OFF';

    return { topInflows: top3, topOutflows: bottom2, bias, growthAvg, defAvg, ranked };
};

const avgScore = (arr) => {
    if (!arr || arr.length === 0) return 50;
    return Math.round(arr.reduce((sum, s) => sum + (s.score ?? strengthScore(s)), 0) / arr.length);
};

// ---------- breadth narrative ----------

export const breadthNarrative = (breadth, sectors) => {
    const total = sectors.length || 11;
    const up = num(breadth?.positiveWeek);
    const pctUp = Math.round((up / total) * 100);

    // Trend: improving if more than half are advancing AND average week return is positive
    const avgWeek = sectors.reduce((sum, s) => sum + s.week, 0) / Math.max(1, sectors.length);
    const trend = pctUp >= 60 && avgWeek > 0 ? 'Improving'
                : pctUp <= 40 && avgWeek < 0 ? 'Weakening'
                : 'Mixed';

    // Confidence: how lopsided is the split?
    const lopsided = Math.abs(pctUp - 50);
    const confidence = lopsided >= 30 ? 'High' : lopsided >= 15 ? 'Medium' : 'Low';

    let narrative;
    if (pctUp >= 70) narrative = `${pctUp}% of sectors trending up — broad market strength expanding`;
    else if (pctUp >= 55) narrative = `${pctUp}% of sectors advancing — selective strength`;
    else if (pctUp <= 30) narrative = `Only ${pctUp}% of sectors trending up — broad weakness`;
    else if (pctUp <= 45) narrative = `${pctUp}% of sectors advancing — defensive posture`;
    else narrative = `${pctUp}% of sectors advancing — mixed tape, no clear leadership`;

    return { pctUp, trend, confidence, narrative };
};

// ---------- market cycle implications ----------

const CYCLE_PLAYBOOK = {
    'early cycle': {
        favor: ['Technology', 'Industrials', 'Financials', 'Discretionary'],
        avoid: ['Utilities', 'Staples'],
        action: 'Lean into cyclicals — early-cycle leadership rewards risk-on positioning.',
    },
    'mid cycle': {
        favor: ['Technology', 'Communication Services', 'Industrials'],
        avoid: ['Utilities', 'Staples'],
        action: 'Stay with leaders. Mid-cycle favors growth + momentum.',
    },
    'late cycle': {
        favor: ['Energy', 'Materials', 'Healthcare'],
        avoid: ['Discretionary', 'Technology'],
        action: 'Rotate toward inflation hedges + defensives. Trim extended growth.',
    },
    'recession': {
        favor: ['Utilities', 'Staples', 'Healthcare'],
        avoid: ['Discretionary', 'Industrials', 'Financials'],
        action: 'Defense first. Reduce risk, stay in low-beta names.',
    },
    'recovery': {
        favor: ['Financials', 'Industrials', 'Discretionary'],
        avoid: ['Utilities', 'Staples'],
        action: 'Risk-on rotation. Buy cyclical leaders pulling out of the trough.',
    },
};

export const cycleImplications = (rotationPhase) => {
    // Prefer server-provided implications
    if (rotationPhase?.implications && typeof rotationPhase.implications === 'object') {
        const i = rotationPhase.implications;
        return {
            phase: rotationPhase.phase,
            favor: Array.isArray(i.favor) ? i.favor : [],
            avoid: Array.isArray(i.avoid) ? i.avoid : [],
            action: i.action || rotationPhase.description || '',
        };
    }
    const phaseRaw = (rotationPhase?.phase || '').toString().toLowerCase().trim();
    const key = Object.keys(CYCLE_PLAYBOOK).find((k) => phaseRaw.includes(k))
              || (phaseRaw.includes('early') ? 'early cycle'
                : phaseRaw.includes('mid') ? 'mid cycle'
                : phaseRaw.includes('late') ? 'late cycle'
                : phaseRaw.includes('recession') ? 'recession'
                : phaseRaw.includes('recovery') ? 'recovery'
                : null);

    if (!key) {
        return {
            phase: rotationPhase?.phase || 'Unknown',
            favor: [],
            avoid: [],
            action: rotationPhase?.description || 'No clear cycle posture.',
        };
    }

    return {
        phase: rotationPhase.phase,
        ...CYCLE_PLAYBOOK[key],
    };
};

// ---------- trade ideas from the rotation ----------
//
// Translates the ranked sectors into LONG / SHORT trade suggestions.
// Each idea has direction, ticker, reason, confidence%.

const SECTOR_LEADER_HINTS = {
    XLK: ['NVDA', 'MSFT'],
    XLF: ['JPM', 'BAC'],
    XLE: ['XOM', 'CVX'],
    XLV: ['LLY', 'UNH'],
    XLY: ['AMZN', 'TSLA'],
    XLI: ['CAT', 'GE'],
    XLP: ['PG', 'KO'],
    XLU: ['NEE', 'DUK'],
    XLRE: ['PLD', 'AMT'],
    XLB: ['LIN', 'SHW'],
    XLC: ['META', 'GOOGL'],
};

export const tradeIdeas = (sectors, analytics) => {
    // Prefer server-provided trade ideas
    if (analytics?.tradeIdeas && Array.isArray(analytics.tradeIdeas) && analytics.tradeIdeas.length > 0) {
        return analytics.tradeIdeas.slice(0, 8);
    }
    const ranked = rankSectors(sectors);
    const top = ranked.slice(0, 3);
    const bottom = ranked.slice(-2).reverse();
    const ideas = [];

    for (const s of top) {
        ideas.push({
            id: `long-${s.symbol}`,
            direction: 'LONG',
            ticker: s.symbol,
            name: `${s.name} ETF`,
            reason: `${s.label.toLowerCase()} — strength score ${s.score}/100`,
            confidence: Math.min(95, 50 + Math.round(s.score * 0.45)),
            kind: 'etf',
        });
        const leaders = SECTOR_LEADER_HINTS[s.symbol];
        if (leaders) {
            ideas.push({
                id: `long-leaders-${s.symbol}`,
                direction: 'LONG',
                ticker: leaders.join(', '),
                name: `${s.name} leaders`,
                reason: `Buy strength in ${s.name.toLowerCase()} leaders`,
                confidence: Math.min(90, 48 + Math.round(s.score * 0.4)),
                kind: 'stock',
            });
        }
    }

    for (const s of bottom) {
        ideas.push({
            id: `short-${s.symbol}`,
            direction: 'SHORT',
            ticker: s.symbol,
            name: `${s.name} ETF`,
            reason: `${s.label.toLowerCase()} — strength score ${s.score}/100`,
            confidence: Math.min(90, 50 + Math.round((100 - s.score) * 0.4)),
            kind: 'etf',
        });
    }

    return ideas;
};

// ---------- rotation insight ----------
//
// One-line plain-English explanation of what's happening across sectors.

export const rotationInsight = (sectors, flowData) => {
    // Prefer server-provided insight
    if (typeof flowData?.rotationInsight === 'string' && flowData.rotationInsight.trim()) {
        return flowData.rotationInsight;
    }
    if (typeof flowData?.interpretation === 'string' && flowData.interpretation.trim()) {
        return flowData.interpretation;
    }
    const ranked = rankSectors(sectors);
    if (ranked.length === 0) return '';

    const top = ranked[0];
    const bottom = ranked[ranked.length - 1];
    const { bias } = whereMoneyMoving(sectors);

    const inDir = bias === 'RISK-ON' ? 'into growth sectors'
                : bias === 'RISK-OFF' ? 'into defensive sectors'
                : 'across sectors with no clear leader';

    return `Capital rotating out of ${bottom.name} into ${top.name} — ${inDir}. ${
        bias === 'RISK-ON' ? 'Risk appetite increasing.'
      : bias === 'RISK-OFF' ? 'Risk appetite declining.'
      : 'Tape is mixed — be selective.'
    }`;
};

// ---------- AI insight panel (punchy, action-focused) ----------

export const aiInsight = (sectors, rotationPhase, analytics) => {
    // Prefer server-provided insight
    if (typeof analytics?.aiInsight === 'string' && analytics.aiInsight.trim()) {
        return analytics.aiInsight;
    }
    if (typeof rotationPhase?.aiInsight === 'string' && rotationPhase.aiInsight.trim()) {
        return rotationPhase.aiInsight;
    }
    const ranked = rankSectors(sectors);
    if (ranked.length === 0) return 'Awaiting sector data.';

    const top = ranked[0];
    const bottom = ranked[ranked.length - 1];
    const { bias } = whereMoneyMoving(sectors);
    const cycle = cycleImplications(rotationPhase);

    const lead = bias === 'RISK-ON' ? 'Rotation favors growth.'
               : bias === 'RISK-OFF' ? 'Defensive rotation underway.'
               : 'Mixed rotation — no clear edge.';
    const mid = `Momentum strongest in ${top.name}, weakest in ${bottom.name}.`;
    const tail = bias === 'RISK-ON' ? 'Stay risk-on, avoid lagging defensives.'
               : bias === 'RISK-OFF' ? 'Reduce risk, lean into low-beta names.'
               : `Trade leaders only. ${cycle.action}`;

    return `${lead} ${mid} ${tail}`;
};
