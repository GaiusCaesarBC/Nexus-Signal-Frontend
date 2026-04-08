// client/src/pages/smartAlerts/index.js
//
// Barrel export for the redesigned Smart Alerts page sub-components.

export { default as AlertCardV2 } from './AlertCardV2';
export { default as SuggestedAlerts } from './SuggestedAlerts';
export { default as RichEmptyState } from './RichEmptyState';
export { default as ActivityFeed } from './ActivityFeed';
export { default as NotificationBell } from './NotificationBell';
export { default as RealtimePulse } from './RealtimePulse';

export {
    enrichAlerts,
    derivedStats,
    detectNewlyTriggered,
    buildSuggestions,
    buildActivityFeed,
    proximityOf,
    statusV2,
} from './derive';
