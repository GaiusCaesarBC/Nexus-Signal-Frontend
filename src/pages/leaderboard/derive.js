// client/src/pages/leaderboard/derive.js
//
// Pure heuristics for the redesigned Leaderboard page.
//
// SERVER-FIRST BRIDGE: every public function checks for a server-provided
// field on the trader payload first and uses it directly when present,
// otherwise falls back to the local heuristic. The day the social engine
// starts attaching these fields the heuristics become invisible.
//
// Server fields the bridge looks for (all optional):
//   trader.rankDelta       number (positive = climbed, negative = dropped)
//   trader.dynamicBadges   [{ id, label, emoji, tone }]
//   payload.activityFeed   [{ id, kind, text, ts, tone }]

// ============================================================
// Numeric helpers
// ============================================================

const num = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const n = parseFloat(String(v).replace(/[,$%\s]/g, ''));
    return Number.isFinite(n) ? n : null;
};

// ============================================================
// Badges
// ============================================================
//
// Returns up to 3 dynamic badges per trader. Each:
//   { id, label, emoji, tone }
// where tone ∈ 'bull' | 'warn' | 'bear' | 'gold'

export const dynamicBadges = (trader, allTraders) => {
    if (!trader) return [];
    // Prefer server-provided badges
    if (Array.isArray(trader.dynamicBadges) && trader.dynamicBadges.length > 0) {
        return trader.dynamicBadges.slice(0, 3);
    }
    const badges = [];

    const winRate = num(trader.winRate) ?? 0;
    const streak = num(trader.currentStreak) ?? 0;
    const totalReturn = num(trader.totalReturn) ?? 0;
    const totalTrades = num(trader.totalTrades) ?? 0;
    const rank = num(trader.rank) ?? 999;

    // Top performer (top 3 globally)
    if (rank <= 3) {
        badges.push({ id: 'top', label: 'Top Performer', emoji: '🏆', tone: 'gold' });
    }

    // Hot streak (3+ consecutive wins)
    if (streak >= 3) {
        badges.push({ id: 'streak', label: `Hot Streak ${streak}`, emoji: '🔥', tone: 'warn' });
    }

    // High accuracy (>65% win rate, must have a meaningful sample)
    if (winRate >= 65 && totalTrades >= 10) {
        badges.push({ id: 'accuracy', label: 'High Accuracy', emoji: '🧠', tone: 'bull' });
    }

    // Falling — recent rank delta says they dropped + total return is negative
    if (trader._rankDelta != null && trader._rankDelta < -2 && totalReturn < 0) {
        badges.push({ id: 'falling', label: 'Falling', emoji: '⚠️', tone: 'bear' });
    }

    return badges.slice(0, 3);
};

// ============================================================
// Rank delta tracking (active across polls)
// ============================================================
//
// Caller maintains a Map<userId, lastRank> outside the function. We compute
// `delta = lastRank - currentRank` (positive = climbed).

export const computeRankDelta = (trader, prevRanksMap) => {
    if (!trader) return 0;
    // Prefer server-provided delta
    if (typeof trader.rankDelta === 'number' && Number.isFinite(trader.rankDelta)) {
        return trader.rankDelta;
    }
    if (!prevRanksMap) return 0;
    const prev = prevRanksMap.get(trader.userId);
    if (prev == null) return 0;
    return prev - trader.rank;
};

// ============================================================
// Enriched leaderboard (badges + rank delta + activity hint)
// ============================================================

export const enrichLeaderboard = (traders, prevRanksMap) => {
    if (!Array.isArray(traders)) return [];
    return traders.map((t) => {
        const rankDelta = computeRankDelta(t, prevRanksMap);
        const enriched = { ...t, _rankDelta: rankDelta };
        enriched._badges = dynamicBadges(enriched, traders);
        return enriched;
    });
};

// ============================================================
// Build "Your Rank" derived metrics
// ============================================================

export const yourRankMetrics = (you, leaderboard) => {
    if (!you) return null;
    const total = leaderboard?.length || 0;

    // Distance to top 10 (or top 3 if already inside top 10)
    const targetRank = you.rank > 10 ? 10 : (you.rank > 3 ? 3 : 1);
    const positionsToTarget = Math.max(0, you.rank - targetRank);

    // Progress as a percentage of distance left (capped at 99%)
    let progressPct = 0;
    if (you.rank <= targetRank) progressPct = 100;
    else if (total > 0) {
        progressPct = Math.max(0, Math.min(99, ((total - you.rank) / total) * 100));
    }

    // Percentile (top X%)
    const percentile = total > 0 ? Math.max(0.1, (you.rank / total) * 100) : null;

    return {
        rank: you.rank,
        rankDelta: you._rankDelta || 0,
        targetRank,
        positionsToTarget,
        progressPct,
        percentile,
        winRate: num(you.winRate) ?? 0,
        totalReturn: num(you.totalReturn) ?? 0,
        level: num(you.level) ?? 1,
        xp: num(you.xp) ?? 0,
        totalTrades: num(you.totalTrades) ?? 0,
        currentStreak: num(you.currentStreak) ?? 0,
    };
};

// ============================================================
// Season countdown (weekly reset, ends Sunday 23:59:59 UTC)
// ============================================================

export const getSeasonCountdown = () => {
    const now = new Date();
    const day = now.getUTCDay();           // 0 = Sun
    const daysUntilSunday = (7 - day) % 7; // 0 if today is Sunday
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() + (daysUntilSunday === 0 && now.getUTCHours() >= 23 ? 7 : daysUntilSunday));
    end.setUTCHours(23, 59, 59, 999);

    const ms = Math.max(0, end.getTime() - now.getTime());
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return {
        ms,
        days,
        hours,
        minutes,
        seconds,
        endsAt: end.toISOString(),
        label: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    };
};

// ============================================================
// Live activity feed events
// ============================================================
//
// Builds events from rank deltas, streaks, and high returns. Sorted newest
// first. The caller can re-run this on every poll for a constantly-updating
// feed.

export const buildActivityFeed = (enriched, you, limit = 10, serverFeed = null) => {
    // Prefer server-provided feed
    if (Array.isArray(serverFeed) && serverFeed.length > 0) {
        return serverFeed.slice(0, limit);
    }
    if (!Array.isArray(enriched)) return [];
    const events = [];
    const now = Date.now();

    for (const t of enriched) {
        const name = t.displayName || t.username || 'Trader';
        const isYou = you && (t.userId === you.userId);

        // Rank gains
        if (t._rankDelta && t._rankDelta >= 2) {
            events.push({
                id: `rank-${t.userId}-${t._rankDelta}`,
                kind: 'rank-up',
                text: `${isYou ? 'You' : name} gained +${t._rankDelta} ranks`,
                ts: now,
                tone: 'bull',
            });
        } else if (t._rankDelta && t._rankDelta <= -2) {
            events.push({
                id: `rank-down-${t.userId}-${t._rankDelta}`,
                kind: 'rank-down',
                text: `${isYou ? 'You' : name} dropped ${Math.abs(t._rankDelta)} ranks`,
                ts: now,
                tone: 'bear',
            });
        }

        // Big return alerts
        const ret = num(t.totalReturn) ?? 0;
        if (t.rank <= 10 && ret >= 8) {
            events.push({
                id: `ret-${t.userId}-${Math.round(ret)}`,
                kind: 'big-return',
                text: `${isYou ? 'You' : name} hit +${ret.toFixed(1)}% return`,
                ts: now - 1,
                tone: 'bull',
            });
        }

        // Hot streaks
        const streak = num(t.currentStreak) ?? 0;
        if (streak >= 5) {
            events.push({
                id: `streak-${t.userId}-${streak}`,
                kind: 'streak',
                text: `${isYou ? 'You' : name} on a ${streak}-win streak`,
                ts: now - 2,
                tone: 'warn',
            });
        }
    }

    return events
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
};

// ============================================================
// Public exports
// ============================================================

export { num };
