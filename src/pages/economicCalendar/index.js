// client/src/pages/economicCalendar/index.js
//
// Barrel export for the redesigned Economic Calendar page sub-components.

export { default as TodaysMarketMovers } from './TodaysMarketMovers';
export { default as MarketImpactBar } from './MarketImpactBar';
export { default as AIMacroInsight } from './AIMacroInsight';
export { default as TradeSetupsFromEvents } from './TradeSetupsFromEvents';
export { default as UpcomingHighImpact } from './UpcomingHighImpact';
export { default as EnhancedEventItem } from './EnhancedEventItem';

export {
    importanceScore,
    expectedBias,
    isTradable,
    assetRelevance,
    COUNTRY_META,
} from './derive';
