// client/src/pages/calculators/index.js
//
// Barrel export for the redesigned Investment Calculators page
// sub-components.

export { default as RiskBar } from './RiskBar';
export { default as WhatThisMeans } from './WhatThisMeans';
export { default as StrategyInsight } from './StrategyInsight';
export { default as TradeReadyButtons } from './TradeReadyButtons';
export { default as RiskPresets } from './RiskPresets';
export { default as CalculatorIntro } from './CalculatorIntro';
export { default as EmptyStatePanel } from './EmptyStatePanel';
export { default as SmartOutputPanel } from './SmartOutputPanel';

export {
    interpretFor,
    strategyInsight,
    riskLevelFromPct,
    rrQuality,
    autoFillFromURL,
    RISK_PRESETS,
    CALC_DESCRIPTIONS,
} from './derive';
