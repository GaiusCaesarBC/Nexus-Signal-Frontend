// client/src/pages/portfolioAnalytics/index.js
//
// Barrel export for the redesigned Portfolio Analytics page sub-components.

export { default as PerformanceVerdict } from './PerformanceVerdict';
export { default as PerformanceBreakdown } from './PerformanceBreakdown';
export { default as MistakesAndFixes } from './MistakesAndFixes';
export { default as RiskAnalysisV2 } from './RiskAnalysisV2';
export { default as SignalPerformance } from './SignalPerformance';
export { default as BehavioralInsights } from './BehavioralInsights';
export { default as AICoach } from './AICoach';

export {
    performanceScore,
    performanceMetrics,
    detectMistakes,
    buildFixes,
    riskProfile,
    signalPerformance,
    behavioralInsights,
    aiCoachMessage,
} from './derive';
