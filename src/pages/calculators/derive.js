// client/src/pages/calculators/derive.js
//
// Pure heuristics for the redesigned Calculators page.
//
// All interpretation, risk assessment, plain-English explanation, and
// strategy insight is derived client-side from the calculator inputs and
// results — keeping calculators framework-free.
//
// TODO: integrate with active signal context for auto-fill (entry, stop,
//       suggested risk %).

// ============================================================
// Numeric helpers
// ============================================================

const num = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const cleaned = String(v).replace(/[,$%\s]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

const fmtUSD = (n) => {
    const v = num(n);
    if (v == null) return '—';
    return v.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: v >= 1000 ? 0 : 2,
    });
};

const fmtNum = (n, max = 2) => {
    const v = num(n);
    if (v == null) return '—';
    return v.toLocaleString('en-US', { maximumFractionDigits: max });
};

// ============================================================
// Risk level (account-risk %)
// ============================================================
//
// Standard trader buckets:
//   < 0.75% → Safe (conservative)
//   0.75% – 1.5% → Standard (within best-practice)
//   1.5% – 3% → Aggressive (active trader)
//   > 3% → Overexposed (warning)

export const riskLevelFromPct = (pct) => {
    const p = num(pct);
    if (p == null) return { key: 'unknown', label: 'Unknown', tone: 'warn', position: 50 };
    if (p < 0.75)  return { key: 'safe',         label: 'Safe',         tone: 'bull', position: Math.max(8, p / 0.75 * 22) };
    if (p < 1.5)   return { key: 'standard',     label: 'Standard',     tone: 'bull', position: 22 + ((p - 0.75) / 0.75) * 22 };
    if (p < 3)     return { key: 'aggressive',   label: 'Aggressive',   tone: 'warn', position: 44 + ((p - 1.5) / 1.5) * 28 };
    return { key: 'overexposed', label: 'Overexposed', tone: 'bear', position: Math.min(96, 72 + ((p - 3) / 3) * 24) };
};

// ============================================================
// R:R quality
// ============================================================

export const rrQuality = (ratio) => {
    const r = num(ratio);
    if (r == null) return { key: 'unknown', label: 'Unknown', tone: 'warn' };
    if (r >= 3)    return { key: 'high',     label: 'High-quality trade', tone: 'bull' };
    if (r >= 2)    return { key: 'good',     label: 'Good setup',         tone: 'bull' };
    if (r >= 1.5)  return { key: 'okay',     label: 'Marginal — be selective', tone: 'warn' };
    return { key: 'avoid', label: 'Low R:R — avoid', tone: 'bear' };
};

// ============================================================
// Position size interpretation
// ============================================================

export const interpretPositionSize = (inputs, results) => {
    if (!results) return null;

    const accountSize = num(inputs?.accountSize);
    const positionSize = num(results.positionSize);
    const positionValue = num(results.positionValue);
    const riskAmount = num(results.riskAmount);
    const pct = num(results.percentOfAccount);
    const entry = num(inputs?.entryPrice);
    const stop = num(inputs?.stopLoss);

    const risk = riskLevelFromPct(pct);

    // Plain-English explanation
    const sentences = [];
    if (positionSize != null && entry != null) {
        sentences.push(
            `You can ${stop != null && entry > stop ? 'buy' : 'enter'} ${fmtNum(positionSize, 0)} shares at ${fmtUSD(entry)}.`
        );
    }
    if (riskAmount != null) {
        sentences.push(`If stopped out, you lose ${fmtUSD(riskAmount)}.`);
    }
    if (pct != null && accountSize != null) {
        sentences.push(`That's ${pct}% of your ${fmtUSD(accountSize)} account.`);
    }
    if (positionValue != null && accountSize != null) {
        const exposure = (positionValue / accountSize) * 100;
        if (exposure > 100) {
            sentences.push(
                `Total exposure is ${exposure.toFixed(0)}% of account — leverage required.`
            );
        }
    }

    // Verdict line tied to risk bucket
    let verdict;
    if (risk.key === 'safe') {
        verdict = 'Conservative sizing — well within safe range.';
    } else if (risk.key === 'standard') {
        verdict = 'Standard 1R sizing — best-practice for most setups.';
    } else if (risk.key === 'aggressive') {
        verdict = 'Aggressive sizing — only use on high-conviction setups.';
    } else if (risk.key === 'overexposed') {
        verdict = 'Risk is too high — consider reducing position size.';
    } else {
        verdict = 'Add account size + stop to assess risk level.';
    }

    return {
        risk,
        sentences,
        verdict,
        tradable: pct != null && pct <= 3,
    };
};

// ============================================================
// Risk/Reward interpretation
// ============================================================

export const interpretRiskReward = (inputs, results) => {
    if (!results) return null;

    const ratio = num(results.ratio);
    const riskAmount = num(results.riskAmount ?? results.potentialLoss);
    const rewardAmount = num(results.rewardAmount ?? results.potentialProfit);

    const quality = rrQuality(ratio);

    const sentences = [];
    if (ratio != null) {
        sentences.push(`Each $1 risked targets $${ratio.toFixed(2)} of upside.`);
    }
    if (riskAmount != null && rewardAmount != null) {
        sentences.push(
            `Max loss ${fmtUSD(riskAmount)}, target gain ${fmtUSD(rewardAmount)}.`
        );
    }
    if (ratio != null) {
        const winRateNeeded = (1 / (1 + ratio)) * 100;
        sentences.push(
            `Breakeven win-rate: ${winRateNeeded.toFixed(0)}%.`
        );
    }

    let verdict;
    if (quality.key === 'high') verdict = 'Strong asymmetry — exactly the kind of trade you want to size up on.';
    else if (quality.key === 'good') verdict = 'Solid R:R — green-light if entry + thesis hold.';
    else if (quality.key === 'okay') verdict = 'R:R is borderline — only take if conviction is high.';
    else if (quality.key === 'avoid') verdict = 'R:R below 1.5 — pass unless win-rate is exceptional.';
    else verdict = 'Add entry, stop, and target to assess R:R.';

    return {
        ratio,
        quality,
        sentences,
        verdict,
        tradable: ratio != null && ratio >= 1.5,
    };
};

// ============================================================
// Generic interpretation for the other calculators
// ============================================================

export const interpretCompound = (inputs, results) => {
    if (!results) return null;
    const future = num(results.futureValue);
    const contributions = num(results.totalContributions);
    const interest = num(results.totalInterest);
    const years = num(inputs?.years);

    const sentences = [];
    if (future != null && contributions != null) {
        sentences.push(`Your contributions of ${fmtUSD(contributions)} grow to ${fmtUSD(future)}.`);
    }
    if (interest != null && contributions != null && contributions > 0) {
        const multiple = (interest / contributions).toFixed(1);
        sentences.push(`Compounding adds ${fmtUSD(interest)} (${multiple}x your contributions).`);
    }
    if (years != null) {
        sentences.push(`Over ${years} years — patience is the strategy.`);
    }

    return {
        sentences,
        verdict: future && contributions && (future / contributions >= 2)
            ? 'Compounding is doing the heavy lifting — stay consistent.'
            : 'Increase contributions or extend time horizon for stronger compounding.',
        tone: 'bull',
    };
};

export const interpretDCA = (inputs, results) => {
    if (!results) return null;
    return {
        sentences: [
            `Dollar-cost averaging smooths entry over ${inputs?.duration || '—'} days.`,
            'Reduces timing risk by spreading purchases across price levels.',
        ],
        verdict: 'Best for long-term positions where you want exposure without timing the bottom.',
        tone: 'bull',
    };
};

export const interpretRetirement = (inputs, results) => {
    if (!results) return null;
    const projected = num(results.projectedSavings ?? results.futureValue);
    return {
        sentences: [
            projected != null
                ? `Projected nest egg: ${fmtUSD(projected)}.`
                : 'Projection ready — see breakdown below.',
            'Adjust contribution + return rate to test scenarios.',
        ],
        verdict: 'Compounding + consistent contributions are the only inputs you control — both matter.',
        tone: 'bull',
    };
};

export const interpretOptions = (inputs, results) => {
    if (!results) return null;
    return {
        sentences: [
            'Options multiply both upside and downside — size for max-loss tolerance.',
            'Time decay accelerates as expiration approaches.',
        ],
        verdict: 'Treat the premium as your max loss and never bet more than you can lose.',
        tone: 'warn',
    };
};

export const interpretStaking = (inputs, results) => {
    if (!results) return null;
    return {
        sentences: [
            'Staking compounds rewards — yield depends on lock-up + protocol risk.',
            'Token price volatility can dwarf yield — factor in downside.',
        ],
        verdict: 'Yield is real but token price risk is real too — size accordingly.',
        tone: 'warn',
    };
};

// ============================================================
// Dispatcher: pick the right interpreter for the calculator
// ============================================================

export const interpretFor = (calculatorId, inputs, results) => {
    switch (calculatorId) {
        case 'position-size':     return interpretPositionSize(inputs, results);
        case 'risk-reward':       return interpretRiskReward(inputs, results);
        case 'compound-interest': return interpretCompound(inputs, results);
        case 'dca':               return interpretDCA(inputs, results);
        case 'retirement':        return interpretRetirement(inputs, results);
        case 'options':           return interpretOptions(inputs, results);
        case 'staking':           return interpretStaking(inputs, results);
        default:                  return null;
    }
};

// ============================================================
// Strategy insight (one-line quality verdict)
// ============================================================

export const strategyInsight = (calculatorId, inputs, results) => {
    if (!results) return null;
    const interp = interpretFor(calculatorId, inputs, results);
    if (!interp) return null;

    if (calculatorId === 'position-size') {
        if (interp.risk?.key === 'overexposed') return { tone: 'bear', label: 'Overexposed — reduce size' };
        if (interp.risk?.key === 'aggressive')  return { tone: 'warn', label: 'Aggressive — only on high conviction' };
        if (interp.risk?.key === 'standard')    return { tone: 'bull', label: 'Standard sizing — green light' };
        if (interp.risk?.key === 'safe')        return { tone: 'bull', label: 'Conservative — well within range' };
        return { tone: 'warn', label: 'Add inputs to assess' };
    }

    if (calculatorId === 'risk-reward') {
        return { tone: interp.quality.tone, label: interp.quality.label };
    }

    return { tone: interp.tone || 'bull', label: 'Calculation complete' };
};

// ============================================================
// Risk presets — for the Quick Presets section
// ============================================================

export const RISK_PRESETS = [
    { id: 'conservative', label: 'Conservative', value: '0.5', sub: '0.5% risk', tone: 'bull' },
    { id: 'standard',     label: 'Standard',     value: '1',   sub: '1.0% risk', tone: 'bull' },
    { id: 'aggressive',   label: 'Aggressive',   value: '2',   sub: '2.0% risk', tone: 'warn' },
];

// ============================================================
// Calculator descriptions ("what this is used for")
// ============================================================

export const CALC_DESCRIPTIONS = {
    'position-size': {
        purpose: 'Risk control',
        blurb: 'Tells you exactly how many shares to buy so a stop-out only costs your chosen account risk.',
    },
    'risk-reward': {
        purpose: 'Trade quality',
        blurb: 'Measures how much upside you get per dollar of risk. R:R ≥ 2 is the standard threshold.',
    },
    'compound-interest': {
        purpose: 'Growth planning',
        blurb: 'Projects how much your investment becomes when interest compounds over time.',
    },
    'retirement': {
        purpose: 'Long-term plan',
        blurb: 'Models your retirement nest egg from current savings + contributions + return assumptions.',
    },
    'options': {
        purpose: 'Derivatives sizing',
        blurb: 'Estimates max profit, max loss, and breakeven for an options trade.',
    },
    'staking': {
        purpose: 'Yield estimation',
        blurb: 'Calculates expected staking rewards from APY + duration + compounding.',
    },
    'dca': {
        purpose: 'Long-term strategy',
        blurb: 'Spreads purchases across time to smooth entry and reduce timing risk.',
    },
};

// ============================================================
// Auto-fill from URL params (signal handoff)
// ============================================================

/**
 * Reads ?entry=&stop=&risk=&account= from window.location and returns a
 * partial position-size payload. Used to auto-fill when the user clicks
 * "Calculate Position Size" from a Signals page.
 */
export const autoFillFromURL = () => {
    if (typeof window === 'undefined') return null;
    const sp = new URLSearchParams(window.location.search);
    const out = {};
    if (sp.get('entry'))   out.entryPrice = sp.get('entry');
    if (sp.get('stop'))    out.stopLoss = sp.get('stop');
    if (sp.get('risk'))    out.riskPercentage = sp.get('risk');
    if (sp.get('account')) out.accountSize = sp.get('account');
    if (sp.get('target'))  out.targetPrice = sp.get('target');
    return Object.keys(out).length > 0 ? out : null;
};

// Expose helpers
export { num, fmtUSD, fmtNum };
