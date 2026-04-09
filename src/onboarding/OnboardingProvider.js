// client/src/onboarding/OnboardingProvider.js
//
// Lightweight onboarding state + activation tracking. Persists to
// localStorage so a returning user is never re-onboarded. Provides a
// `useOnboarding()` hook with a graceful no-op fallback when called
// outside the provider — so anywhere in the app can call
// `recordActivation('followedSignal')` without risk of crashing.
//
// This is the lightweight overlay that runs on first login regardless
// of route — there is no separate onboarding page anymore.

import React, {
    createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';

// Versioned storage key — bump if the schema ever needs migration.
const STORAGE_KEY = 'nexus-onboarding-lite-v1';

// Step states:
//   0 = idle / not in flow
//   1 = intent (Step 1: what do you want to trade)
//   2 = highlight (Step 2: tooltip on /signals)
//   3 = action (Step 3: pick a first move)
const DEFAULT_STATE = {
    onboardingCompleted: false,
    onboardingSkipped: false,
    onboardingStep: 0,
    intent: null,                 // 'stocks' | 'crypto' | 'both'
    riskPreference: null,         // 'conservative' | 'balanced' | 'aggressive'
    activation: {
        followedSignal: false,
        startedPaperTrade: false,
        setAlert: false,
    },
    guidanceSeen: {
        signals: false,
        alerts: false,
        portfolio: false,
    },
    reengagementShown: false,
    startedAt: null,
};

const loadState = () => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_STATE;
        const parsed = JSON.parse(raw);
        // Defensive merge — if the schema ever evolves, missing fields
        // pick up their defaults instead of going undefined.
        return {
            ...DEFAULT_STATE,
            ...parsed,
            activation: { ...DEFAULT_STATE.activation, ...(parsed.activation || {}) },
            guidanceSeen: { ...DEFAULT_STATE.guidanceSeen, ...(parsed.guidanceSeen || {}) },
        };
    } catch {
        return DEFAULT_STATE;
    }
};

const saveState = (state) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore quota / private-mode errors
    }
};

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
    const [state, setState] = useState(loadState);

    // Persist on every change
    useEffect(() => {
        saveState(state);
    }, [state]);

    // ─── Actions ────────────────────────────────────────────────

    const start = useCallback(() => {
        setState((s) => ({
            ...s,
            onboardingStep: 1,
            onboardingSkipped: false,
            startedAt: Date.now(),
        }));
    }, []);

    const setIntent = useCallback((intent, riskPreference) => {
        setState((s) => ({
            ...s,
            intent: intent || s.intent,
            riskPreference: riskPreference || s.riskPreference,
            onboardingStep: 2,
        }));
    }, []);

    const advanceToActionStep = useCallback(() => {
        setState((s) => (s.onboardingStep === 2 ? { ...s, onboardingStep: 3 } : s));
    }, []);

    const recordActivation = useCallback((kind) => {
        if (!['followedSignal', 'startedPaperTrade', 'setAlert'].includes(kind)) return;
        setState((s) => ({
            ...s,
            activation: { ...s.activation, [kind]: true },
        }));
    }, []);

    const completeOnboarding = useCallback(() => {
        setState((s) => ({
            ...s,
            onboardingCompleted: true,
            onboardingStep: 0,
        }));
    }, []);

    const skipOnboarding = useCallback(() => {
        setState((s) => ({
            ...s,
            onboardingSkipped: true,
            onboardingStep: 0,
        }));
    }, []);

    const dismissGuidance = useCallback((page) => {
        if (!page) return;
        setState((s) => ({
            ...s,
            guidanceSeen: { ...s.guidanceSeen, [page]: true },
        }));
    }, []);

    const markReengagementShown = useCallback(() => {
        setState((s) => ({ ...s, reengagementShown: true }));
    }, []);

    const resetOnboarding = useCallback(() => {
        setState(DEFAULT_STATE);
    }, []);

    // ─── Computed ───────────────────────────────────────────────

    const value = useMemo(() => {
        const isActivated =
            state.activation.followedSignal ||
            state.activation.startedPaperTrade ||
            state.activation.setAlert;

        const needsOnboarding =
            !state.onboardingCompleted && !state.onboardingSkipped;

        const inFlow = state.onboardingStep > 0;

        return {
            ...state,
            isActivated,
            needsOnboarding,
            inFlow,
            start,
            setIntent,
            advanceToActionStep,
            recordActivation,
            completeOnboarding,
            skipOnboarding,
            dismissGuidance,
            markReengagementShown,
            resetOnboarding,
        };
    }, [
        state, start, setIntent, advanceToActionStep, recordActivation,
        completeOnboarding, skipOnboarding, dismissGuidance,
        markReengagementShown, resetOnboarding,
    ]);

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};

// ─── Hook with no-op fallback ────────────────────────────────────
//
// Returning a no-op shim when called outside the provider means any
// existing page can sprinkle in `useOnboarding().recordActivation(...)`
// calls safely — even if the provider isn't mounted (e.g. tests, login
// page, public routes). Nothing crashes, the call just does nothing.

const NO_OP_VALUE = {
    ...DEFAULT_STATE,
    isActivated: false,
    needsOnboarding: false,
    inFlow: false,
    start: () => {},
    setIntent: () => {},
    advanceToActionStep: () => {},
    recordActivation: () => {},
    completeOnboarding: () => {},
    skipOnboarding: () => {},
    dismissGuidance: () => {},
    markReengagementShown: () => {},
    resetOnboarding: () => {},
};

export const useOnboarding = () => {
    const ctx = useContext(OnboardingContext);
    return ctx || NO_OP_VALUE;
};
