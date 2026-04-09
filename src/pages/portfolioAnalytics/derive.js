// client/src/pages/portfolioAnalytics/derive.js
//
// Pure heuristics for the redesigned Portfolio Analytics page.
//
// SERVER-FIRST BRIDGE: every public function checks for a server-provided
// field on the analytics payload first and uses it directly when present,
// otherwise falls back to the local heuristic. The day the backend
// performance engine starts returning these fields the heuristics become
// invisible — no client changes required.
//
// Server fields the bridge looks for (all optional):
//   analytics.paperTrading.avgWin / avgLoss / rr / expectancy / profitFactor
//   analytics.performanceScore   { score, verdict, tone, summary }
//   analytics.riskProfile        { bucket, riskPerTrade, ... }
//   analytics.mistakes[]         [{ id, severity, title, detail }]
//   analytics.fixes[]            [{ title, tone }]
//   analytics.aiCoachMessage     string
//   analytics.behavioralInsights [{ tone, text }]
//   analytics.signalPerformance  { total, correct, wrong, accuracy, avgReturn, tone, label }

// ============================================================
// Numeric helpers
// ============================================================

const num = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const n = parseFloat(String(v).replace(/[,$%\s]/g, ''));
    return Number.isFinite(n) ? n : null;
};

const fmtUSD = (n) => {
    const v = num(n);
    if (v == null) return '—';
    return v.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2,
    });
};

const fmt2 = (n) => {
    const v = num(n);
    if (v == null) return '—';
    return v.toFixed(2);
};

// ─────────────────────────────────────────────────────────────────
// NEW CODE START — Server intelligence adapter
//
// The server returns an `analytics.intelligence` block with these fields:
//   { healthScore, riskLevel, diversificationScore, strengths, weaknesses,
//     recommendations, verdict }
//
// The existing client derive layer reads from different paths
// (analytics.performanceScore, analytics.mistakes, analytics.fixes,
// analytics.behavioralInsights). adaptIntelligence() takes the raw
// analytics object and returns a SHALLOW COPY with the intelligence
// block flattened into the existing paths — but only if they aren't
// already set. The original analytics object is never mutated.
//
// Backward compatible:
//   - If `analytics.intelligence` is missing → returns `analytics` unchanged
//   - If a server already-flattened field exists (e.g. `performanceScore`) →
//     it wins; the intelligence block is ignored for that field
//   - Empty arrays from intelligence don't override existing arrays
//
// Verdict mapping (server -> client tone bucket):
//   STRONG  -> { tone: 'bull', verdict: 'Strong & disciplined' }
//   BALANCED-> { tone: 'warn', verdict: 'Building edge' }
//   WEAK    -> { tone: 'bear', verdict: 'Needs work' }
// ─────────────────────────────────────────────────────────────────

const SERVER_VERDICT_MAP = {
    STRONG:   { tone: 'bull', verdict: 'Strong & disciplined' },
    BALANCED: { tone: 'warn', verdict: 'Building edge' },
    WEAK:     { tone: 'bear', verdict: 'Needs work' },
};

const SERVER_RISK_BUCKET_MAP = {
    LOW:    { key: 'low',      label: 'Low risk',      tone: 'bull' },
    MEDIUM: { key: 'moderate', label: 'Moderate risk', tone: 'warn' },
    HIGH:   { key: 'high',     label: 'High risk',     tone: 'bear' },
};

export const adaptIntelligence = (analytics) => {
    if (!analytics || typeof analytics !== 'object') return analytics;
    const intel = analytics.intelligence;
    if (!intel || typeof intel !== 'object') return analytics;

    // Shallow copy so we never mutate the caller's object
    const out = { ...analytics };

    // healthScore -> performanceScore (only if not already set)
    if (!out.performanceScore && typeof intel.healthScore === 'number') {
        const verdictKey = (intel.verdict || '').toString().toUpperCase();
        const verdictBlock = SERVER_VERDICT_MAP[verdictKey] || SERVER_VERDICT_MAP.BALANCED;
        out.performanceScore = {
            score: Math.max(0, Math.min(100, Math.round(intel.healthScore))),
            verdict: verdictBlock.verdict,
            tone: verdictBlock.tone,
            summary: '',
        };
    }

    // weaknesses -> mistakes (only if mistakes not already set)
    if (!Array.isArray(out.mistakes) && Array.isArray(intel.weaknesses) && intel.weaknesses.length > 0) {
        out.mistakes = intel.weaknesses.map((w, i) => {
            // Server emits weaknesses as plain strings; lift them into the
            // client mistake shape { id, severity, title, detail }
            if (typeof w === 'string') {
                return {
                    id: `srv-weak-${i}`,
                    severity: 'med',
                    title: w,
                    detail: '',
                };
            }
            // If server ever upgrades to objects, pass them through
            return { id: w.id || `srv-weak-${i}`, severity: w.severity || 'med', title: w.title || '', detail: w.detail || '' };
        });
        // Mark as authoritative so detectMistakes() uses the server array
        // even when it's empty (server actively says "no mistakes").
        out._mistakesAuthoritative = true;
    }

    // recommendations -> fixes (only if not already set)
    if (!Array.isArray(out.fixes) && Array.isArray(intel.recommendations) && intel.recommendations.length > 0) {
        out.fixes = intel.recommendations.map((r) =>
            typeof r === 'string' ? { title: r, tone: 'bull' } : { title: r.title || '', tone: r.tone || 'bull' }
        );
    }

    // strengths -> behavioralInsights (only if not already set)
    // Strengths are positive observations, which is exactly what
    // behavioralInsights renders.
    if (!Array.isArray(out.behavioralInsights) && Array.isArray(intel.strengths) && intel.strengths.length > 0) {
        out.behavioralInsights = intel.strengths.map((s) =>
            typeof s === 'string' ? { tone: 'bull', text: s } : { tone: s.tone || 'bull', text: s.text || '' }
        );
    }

    // riskLevel + diversificationScore -> stamp into analytics.risk
    // so the existing riskProfile() reads them via its existing paths.
    // (We only add fields, never overwrite anything that's already there.)
    if (intel.riskLevel || typeof intel.diversificationScore === 'number') {
        out.risk = { ...(out.risk || {}) };
        if (typeof intel.diversificationScore === 'number' && out.risk.diversificationScore == null) {
            out.risk.diversificationScore = intel.diversificationScore;
        }
        // Stash the server bucket on a private field so riskProfile() can
        // pick it up without changing its public signature.
        const bucketKey = (intel.riskLevel || '').toString().toUpperCase();
        if (SERVER_RISK_BUCKET_MAP[bucketKey] && !out.risk._serverBucket) {
            out.risk._serverBucket = SERVER_RISK_BUCKET_MAP[bucketKey];
        }
    }

    return out;
};
// NEW CODE END
// ─────────────────────────────────────────────────────────────────

// ============================================================
// Core derived metrics
// ============================================================

/**
 * Returns the win/loss/expectancy block. Where the server only gives us
 * `biggestWin` and `biggestLoss`, we use those as a *proxy* for avgWin
 * and avgLoss — clearly imperfect, but better than nothing. The shape
 * also exposes flags so the UI can mark "estimate" where applicable.
 */
export const performanceMetrics = (analytics) => {
    analytics = adaptIntelligence(analytics);
    const pt = analytics?.paperTrading;
    if (!pt) return null;

    const total = num(pt.totalTrades) ?? 0;
    const wins = num(pt.winningTrades) ?? 0;
    const losses = num(pt.losingTrades) ?? 0;
    const winRate = num(pt.winRate);
    const totalPL = num(pt.totalPL) ?? 0;

    // Best estimates of avg win / avg loss from what we have. If the server
    // ever returns avgWin/avgLoss explicitly, prefer those.
    const avgWin = num(pt.avgWin) ?? num(pt.biggestWin) ?? null;
    const avgLoss = num(pt.avgLoss) ?? num(pt.biggestLoss) ?? null;
    const isAvgEstimate = (pt.avgWin == null) && (pt.avgLoss == null);

    // R:R from avg win / |avg loss|
    let rr = null;
    if (avgWin != null && avgLoss != null && avgLoss !== 0) {
        rr = Math.abs(avgWin) / Math.abs(avgLoss);
    }

    // Expectancy: (win% * avgWin) - (loss% * |avgLoss|)
    let expectancy = null;
    if (winRate != null && avgWin != null && avgLoss != null) {
        const w = winRate / 100;
        const l = 1 - w;
        expectancy = (w * Math.abs(avgWin)) - (l * Math.abs(avgLoss));
    }
    // Fallback expectancy: total P/L per trade
    if (expectancy == null && total > 0 && totalPL != null) {
        expectancy = totalPL / total;
    }

    // Profit factor — sum of wins / sum of losses (rough estimate from totals)
    let profitFactor = null;
    if (total > 0 && totalPL != null && winRate != null && winRate > 0 && winRate < 100) {
        // Roughly assume avgWin and avgLoss splits scale by trade counts
        const grossWin = wins * (avgWin ?? 0);
        const grossLoss = losses * Math.abs(avgLoss ?? 0);
        if (grossLoss > 0) profitFactor = grossWin / grossLoss;
    }

    return {
        total,
        wins,
        losses,
        winRate: winRate ?? null,
        avgWin,
        avgLoss,
        isAvgEstimate,
        rr,
        expectancy,
        profitFactor,
        totalPL,
        biggestWin: num(pt.biggestWin),
        biggestLoss: num(pt.biggestLoss),
        currentStreak: num(pt.currentStreak) ?? 0,
        bestStreak: num(pt.bestStreak) ?? 0,
        portfolioValue: num(pt.portfolioValue),
    };
};

// ============================================================
// Risk profile
// ============================================================

const RISK_BUCKETS = [
    { key: 'low',      label: 'Low risk',      tone: 'bull' },
    { key: 'moderate', label: 'Moderate risk', tone: 'warn' },
    { key: 'high',     label: 'High risk',     tone: 'bear' },
];

/**
 * Combines concentration % + holdings count + asset-type diversity into a
 * risk bucket.
 */
export const riskProfile = (analytics) => {
    analytics = adaptIntelligence(analytics);
    const conc = num(analytics?.risk?.concentrationRisk) ?? 0;
    const holdings = num(analytics?.overview?.totalHoldings) ?? 0;
    const types = num(analytics?.risk?.assetTypeCount) ?? 0;
    const divScore = num(analytics?.risk?.diversificationScore) ?? 0;

    // Risk per trade (best-effort: paperTrading P/L volatility ratio)
    const pt = analytics?.paperTrading;
    let riskPerTrade = null;
    if (pt && num(pt.biggestLoss) != null && num(pt.portfolioValue)) {
        riskPerTrade = (Math.abs(num(pt.biggestLoss)) / num(pt.portfolioValue)) * 100;
    }

    // Bucket — prefer server-provided bucket if the adapter stamped one
    let bucket;
    const serverBucket = analytics?.risk?._serverBucket;
    if (serverBucket && serverBucket.key) {
        bucket = serverBucket;
    } else if (conc >= 70 || holdings <= 1)        bucket = RISK_BUCKETS[2];
    else if (conc >= 40 || holdings <= 3)          bucket = RISK_BUCKETS[1];
    else if (divScore < 40)                        bucket = RISK_BUCKETS[1];
    else                                           bucket = RISK_BUCKETS[0];

    return {
        bucket,
        concentrationPct: conc,
        holdings,
        assetTypeCount: types,
        diversificationScore: divScore,
        riskPerTrade,
    };
};

// ============================================================
// Mistakes detection
// ============================================================

export const detectMistakes = (analytics) => {
    if (!analytics) return [];
    analytics = adaptIntelligence(analytics);
    // Prefer server-provided mistakes
    if (Array.isArray(analytics.mistakes) && analytics.mistakes.length >= 0 && analytics.mistakes.length <= 50) {
        // Use server array even if empty (server actively says "no mistakes")
        if (analytics._mistakesAuthoritative || analytics.mistakes.length > 0) {
            return analytics.mistakes;
        }
    }
    const mistakes = [];

    const overview = analytics.overview || {};
    const risk = analytics.risk || {};
    const pt = analytics.paperTrading || {};
    const conc = num(risk.concentrationRisk) ?? 0;
    const holdings = num(overview.totalHoldings) ?? 0;
    const types = num(risk.assetTypeCount) ?? 0;
    const total = num(pt.totalTrades) ?? 0;
    const winRate = num(pt.winRate);
    const totalPL = num(pt.totalPL) ?? 0;
    const biggestLoss = Math.abs(num(pt.biggestLoss) ?? 0);
    const biggestWin = num(pt.biggestWin) ?? 0;

    // Concentration
    if (conc >= 70) {
        mistakes.push({
            id: 'concentration-high',
            severity: 'high',
            title: `Position concentration too high (${Math.round(conc)}%)`,
            detail: 'A single holding dominates your portfolio. One bad print can erase weeks of work.',
        });
    } else if (conc >= 50) {
        mistakes.push({
            id: 'concentration-moderate',
            severity: 'med',
            title: `Top holding is ${Math.round(conc)}% of portfolio`,
            detail: 'Concentration is elevated. Consider trimming and reallocating.',
        });
    }

    // Holdings count
    if (holdings === 1) {
        mistakes.push({
            id: 'one-holding',
            severity: 'high',
            title: 'You only have 1 holding',
            detail: 'Single-position portfolios behave like coin-flips. Diversify.',
        });
    } else if (holdings <= 3 && holdings > 0) {
        mistakes.push({
            id: 'few-holdings',
            severity: 'med',
            title: `Only ${holdings} holdings`,
            detail: 'Too few positions to dilute single-name risk meaningfully.',
        });
    }

    // Asset type diversity
    if (types <= 1 && holdings > 0) {
        mistakes.push({
            id: 'one-asset-type',
            severity: 'med',
            title: 'Exposure concentrated in one asset type',
            detail: 'Mix stocks + crypto (or bonds) to smooth correlated drawdowns.',
        });
    }

    // Trade frequency
    if (total > 0 && total < 20) {
        mistakes.push({
            id: 'low-trade-count',
            severity: 'med',
            title: `Only ${total} trades — sample size too small`,
            detail: 'Need 30+ trades before win-rate / R:R numbers carry signal.',
        });
    } else if (total === 0) {
        mistakes.push({
            id: 'no-trades',
            severity: 'high',
            title: 'No trades on record yet',
            detail: 'Start with paper trading — you cannot improve what you do not measure.',
        });
    }

    // Win rate vs profitability
    if (winRate != null && winRate < 40 && total >= 20) {
        mistakes.push({
            id: 'low-winrate',
            severity: 'high',
            title: `Low win rate (${winRate.toFixed(0)}%)`,
            detail: 'Below 40% win rate requires very strong R:R to stay profitable.',
        });
    }

    // Big losses dwarfing big wins
    if (biggestLoss > 0 && biggestWin > 0 && biggestLoss >= biggestWin * 1.5) {
        mistakes.push({
            id: 'asymmetric-losses',
            severity: 'high',
            title: 'Biggest loss is much larger than biggest win',
            detail: 'You may be holding losers too long or sizing them too aggressively.',
        });
    }

    // Net negative P/L
    if (total >= 10 && totalPL < 0) {
        mistakes.push({
            id: 'net-negative',
            severity: 'high',
            title: 'Net P/L is negative',
            detail: 'Strategy is currently bleeding — review setup quality before sizing up.',
        });
    }

    return mistakes;
};

// ============================================================
// Fixes (each maps to one or more mistakes)
// ============================================================

const FIX_MAP = {
    'concentration-high':    { title: 'Trim the top position to ≤ 25% of portfolio', tone: 'bull' },
    'concentration-moderate':{ title: 'Trim the top position to ≤ 30% and reallocate to underweights', tone: 'bull' },
    'one-holding':           { title: 'Diversify into at least 3 uncorrelated assets', tone: 'bull' },
    'few-holdings':          { title: 'Add 2-4 more positions across different sectors', tone: 'bull' },
    'one-asset-type':        { title: 'Mix asset classes — add stocks AND crypto exposure', tone: 'bull' },
    'low-trade-count':       { title: 'Increase trade count to build a statistically meaningful sample', tone: 'bull' },
    'no-trades':             { title: 'Open paper trading and run your first 10 setups', tone: 'bull' },
    'low-winrate':           { title: 'Tighten setup quality — only take A+ signals (conf ≥ 70%)', tone: 'bull' },
    'asymmetric-losses':     { title: 'Honor your stops — never let a loss exceed 1.5× your avg win', tone: 'bull' },
    'net-negative':          { title: 'Pause live sizing — paper trade until expectancy turns positive', tone: 'bull' },
};

export const buildFixes = (mistakes, analytics) => {
    analytics = adaptIntelligence(analytics);
    // Prefer server-provided fixes
    if (analytics && Array.isArray(analytics.fixes) && analytics.fixes.length > 0) {
        return analytics.fixes;
    }
    if (!Array.isArray(mistakes) || mistakes.length === 0) return [];
    return mistakes
        .map((m) => FIX_MAP[m.id])
        .filter(Boolean);
};

// ============================================================
// Verdict + score (0-100)
// ============================================================

/**
 * Builds a single trading-skill score based on:
 *   - net P/L direction (+/- 25)
 *   - win rate (+/- 20)
 *   - concentration (-15)
 *   - holdings count (+10)
 *   - trade count (+10)
 *   - signal accuracy (+10)
 * Score is intentionally rough — it is a vibe check, not a CFA report.
 */
export const performanceScore = (analytics) => {
    if (!analytics) return { score: 50, verdict: 'No data', tone: 'warn', summary: 'Add trades or holdings to get a verdict.' };
    analytics = adaptIntelligence(analytics);

    // Prefer server-provided verdict
    if (analytics.performanceScore && typeof analytics.performanceScore === 'object') {
        return {
            score: analytics.performanceScore.score ?? 50,
            verdict: analytics.performanceScore.verdict || 'Unknown',
            tone: analytics.performanceScore.tone || 'warn',
            summary: analytics.performanceScore.summary || '',
        };
    }

    let score = 50;

    const pt = analytics.paperTrading || {};
    const totalPL = num(pt.totalPL) ?? 0;
    const total = num(pt.totalTrades) ?? 0;
    const winRate = num(pt.winRate);
    const conc = num(analytics.risk?.concentrationRisk) ?? 0;
    const holdings = num(analytics.overview?.totalHoldings) ?? 0;
    const accuracy = num(analytics.predictions?.accuracy) ?? null;

    // P/L direction
    if (totalPL > 0) score += 18;
    else if (totalPL < 0) score -= 18;

    // Win rate
    if (winRate != null) {
        if (winRate >= 60) score += 15;
        else if (winRate >= 50) score += 8;
        else if (winRate >= 40) score += 0;
        else score -= 10;
    }

    // Concentration penalty
    if (conc >= 70) score -= 15;
    else if (conc >= 50) score -= 8;
    else if (conc >= 30) score -= 3;

    // Holdings boost
    if (holdings >= 8) score += 10;
    else if (holdings >= 5) score += 6;
    else if (holdings >= 3) score += 2;
    else if (holdings === 1) score -= 8;

    // Trade count: rewards sample size
    if (total >= 50) score += 10;
    else if (total >= 20) score += 5;
    else if (total === 0) score -= 5;

    // Signal accuracy bonus
    if (accuracy != null) {
        if (accuracy >= 65) score += 10;
        else if (accuracy >= 50) score += 4;
        else if (accuracy < 40)  score -= 5;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    // Verdict + summary
    let verdict, tone, summary;
    if (score >= 80) {
        verdict = 'Strong & disciplined';
        tone = 'bull';
        summary = 'Profitable, diversified, and statistically meaningful — keep doing what works.';
    } else if (score >= 65) {
        verdict = 'Profitable but inconsistent';
        tone = 'bull';
        summary = totalPL > 0
            ? 'You\'re profitable, but tighter risk control will compound the edge.'
            : 'Promising structure — shore up risk management to lock it in.';
    } else if (score >= 50) {
        verdict = 'Building edge';
        tone = 'warn';
        summary = 'You\'re trading actively but the data is too thin (or the risk too high) to call it edge.';
    } else if (score >= 35) {
        verdict = 'Needs work';
        tone = 'warn';
        summary = 'Performance + structure both have leaks — fix the basics before sizing up.';
    } else {
        verdict = 'Bleeding capital';
        tone = 'bear';
        summary = 'Strategy is losing money. Pause real sizing and rebuild from paper trades.';
    }

    return { score, verdict, tone, summary };
};

// ============================================================
// Behavioral insights
// ============================================================

export const behavioralInsights = (analytics) => {
    if (!analytics) return [];
    analytics = adaptIntelligence(analytics);
    // Prefer server-provided insights
    if (Array.isArray(analytics.behavioralInsights) && analytics.behavioralInsights.length > 0) {
        return analytics.behavioralInsights.slice(0, 4);
    }
    const out = [];
    const pt = analytics.paperTrading || {};
    const allocation = analytics.allocation || {};
    const winRate = num(pt.winRate);
    const total = num(pt.totalTrades) ?? 0;
    const totalPL = num(pt.totalPL) ?? 0;
    const bestStreak = num(pt.bestStreak) ?? 0;

    // Asset class affinity
    const stocksPct = num(allocation.stocks?.percent) ?? num(allocation.stock?.percent);
    const cryptoPct = num(allocation.crypto?.percent);
    if (stocksPct != null && cryptoPct != null) {
        if (cryptoPct > stocksPct + 15) {
            out.push({ tone: 'warn', text: 'Portfolio leans crypto-heavy — expect bigger drawdowns and bigger upside swings.' });
        } else if (stocksPct > cryptoPct + 15) {
            out.push({ tone: 'bull', text: 'Stock-heavy posture — lower volatility, slower compounding.' });
        } else if (stocksPct > 0 && cryptoPct > 0) {
            out.push({ tone: 'bull', text: 'Balanced stocks + crypto exposure — diversification is working in your favor.' });
        }
    }

    // Win rate read
    if (winRate != null && total >= 10) {
        if (winRate >= 60) {
            out.push({ tone: 'bull', text: `${winRate.toFixed(0)}% win rate — your setup quality is strong.` });
        } else if (winRate < 40) {
            out.push({ tone: 'bear', text: `${winRate.toFixed(0)}% win rate — you may be entering too early or chasing.` });
        }
    }

    // Streak
    if (bestStreak >= 5) {
        out.push({ tone: 'bull', text: `Longest winning streak: ${bestStreak} trades — you can sustain conviction when in flow.` });
    }

    // Profitability
    if (total >= 10) {
        if (totalPL > 0) {
            out.push({ tone: 'bull', text: 'Net positive over a meaningful sample — your edge is real.' });
        } else if (totalPL < 0) {
            out.push({ tone: 'bear', text: 'Net negative — your strategy is leaking money in real conditions.' });
        }
    }

    if (out.length === 0) {
        out.push({ tone: 'warn', text: 'Not enough trades yet to surface behavioral patterns. Run 20+ paper trades to unlock insights.' });
    }

    return out.slice(0, 4);
};

// ============================================================
// AI coach line (signature feature)
// ============================================================

export const aiCoachMessage = (analytics) => {
    if (!analytics) return 'Add trades or holdings to unlock your personalized coaching.';
    analytics = adaptIntelligence(analytics);
    if (typeof analytics.aiCoachMessage === 'string' && analytics.aiCoachMessage.trim()) {
        return analytics.aiCoachMessage;
    }

    const pt = analytics.paperTrading || {};
    const total = num(pt.totalTrades) ?? 0;
    const winRate = num(pt.winRate);
    const totalPL = num(pt.totalPL) ?? 0;
    const conc = num(analytics.risk?.concentrationRisk) ?? 0;
    const accuracy = num(analytics.predictions?.accuracy) ?? null;

    if (total === 0) {
        return 'Your edge is undefined until you trade. Start with 10 paper trades on A+ signals only — I\'ll surface your strengths.';
    }
    if (totalPL < 0 && winRate != null && winRate < 45) {
        return 'You\'re losing on both win-rate AND P/L. Step away from execution — focus on identifying ONE high-conviction setup type and master it.';
    }
    if (totalPL > 0 && winRate != null && winRate >= 55 && conc < 50) {
        return 'Your edge is selective entries on diversified positions. Keep sizing modest and trust the process — compounding does the work.';
    }
    if (winRate != null && winRate >= 55 && totalPL < 0) {
        return 'You\'re winning often but losing big. Tighten stops and never let a loser exceed 1× your avg win. Discipline > frequency.';
    }
    if (accuracy != null && accuracy >= 60 && totalPL < 0) {
        return 'AI signals are firing accurately but execution is leaking value. Review your entry timing and slippage on losing trades.';
    }
    if (conc >= 70) {
        return 'Your edge is buried under concentration risk. Trim the top position before doing anything else — one bad print and the whole book bleeds.';
    }
    if (winRate != null && winRate < 40) {
        return 'Win rate below 40% says your setup quality is loose. Only take signals at 70%+ confidence for the next 10 trades and re-measure.';
    }
    if (totalPL > 0) {
        return 'Edge is forming — but the sample is still thin. Stay small, stay consistent, and let the data speak before sizing up.';
    }
    return 'Mixed signals so far. Focus on one setup type, log every trade, and review after every 10. The data will tell you what works.';
};

// ============================================================
// AI signal performance (wins/losses, avg return per signal)
// ============================================================

export const signalPerformance = (analytics) => {
    analytics = adaptIntelligence(analytics);
    // Prefer server-provided signal performance block
    if (analytics?.signalPerformance && typeof analytics.signalPerformance === 'object') {
        return analytics.signalPerformance;
    }
    const pred = analytics?.predictions;
    if (!pred) return null;

    const total = num(pred.total) ?? 0;
    const correct = num(pred.correct) ?? 0;
    const accuracy = num(pred.accuracy) ?? null;
    const wrong = total - correct;

    // Best-effort avg return per signal — server may eventually return this
    const avgReturn = num(pred.avgReturn) ?? null;

    let tone = 'warn';
    let label = 'Building data';
    if (accuracy != null) {
        if (accuracy >= 65) { tone = 'bull'; label = 'Strong'; }
        else if (accuracy >= 50) { tone = 'bull'; label = 'Above coin-flip'; }
        else if (accuracy >= 40) { tone = 'warn'; label = 'Marginal'; }
        else { tone = 'bear'; label = 'Underperforming'; }
    }

    return { total, correct, wrong, accuracy, avgReturn, tone, label };
};

// ============================================================
// Public exports
// ============================================================

export { num, fmtUSD, fmt2 };
