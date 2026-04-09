// client/src/onboarding/index.js
//
// Barrel for the lightweight onboarding overlay system.
//
// Two things to mount in App:
//   1. <OnboardingProvider> — wrap the app once, near the auth provider
//   2. <OnboardingController /> — render once near the other global overlays
//
// Anywhere downstream can call `useOnboarding()` to access state +
// actions. The hook returns a no-op shim when called outside the
// provider, so calls are always safe.

export { OnboardingProvider, useOnboarding } from './OnboardingProvider';
export { default as OnboardingController } from './OnboardingController';

// Individual pieces — exported for tests / direct mounting if ever needed
export { default as IntentStep } from './steps/IntentStep';
export { default as HighlightStep } from './steps/HighlightStep';
export { default as ActionStep } from './steps/ActionStep';
export { default as GuidanceTooltips } from './GuidanceTooltips';
export { default as ReengagementBanner } from './ReengagementBanner';
