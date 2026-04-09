// client/src/onboarding/OnboardingController.js
//
// Top-level orchestrator. Mounted ONCE at the App root and decides which
// onboarding piece (if any) to render right now based on auth state,
// the current route, and the persisted onboarding state.
//
// Decision tree:
//   - User is not logged in              → render nothing
//   - User is on a public/auth route     → render nothing
//   - User has completed or skipped      → only render guidance + reengagement
//   - Otherwise → start the flow if not started, then render the step
//
// This component is intentionally side-effect-only at top level — it
// renders the modal/overlay step components conditionally so unmounting
// is clean and the user's place in the app is preserved.

import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from './OnboardingProvider';
import IntentStep from './steps/IntentStep';
import HighlightStep from './steps/HighlightStep';
import ActionStep from './steps/ActionStep';
import GuidanceTooltips from './GuidanceTooltips';
import ReengagementBanner from './ReengagementBanner';

// Routes where we never want to interrupt the user with onboarding —
// public marketing pages and auth flows.
const PUBLIC_ROUTE_PREFIXES = [
    '/',                    // landing (exact-matched below)
    '/login',
    '/register',
    '/pricing',
    '/about',
    '/terms',
    '/privacy',
    '/disclaimer',
    '/cookie-policy',
    '/whitepaper',
    '/oauth-callback',
];

const isPublicRoute = (pathname) => {
    if (pathname === '/') return true;
    return PUBLIC_ROUTE_PREFIXES.some((p) => p !== '/' && (pathname === p || pathname.startsWith(p + '/')));
};

const isSignalsRoute = (pathname) =>
    pathname === '/signals' || pathname.startsWith('/signals/');

const OnboardingController = () => {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    const {
        needsOnboarding, onboardingStep, inFlow,
        onboardingCompleted, start,
    } = useOnboarding();

    // Authoritative "logged in" check — accept either the boolean flag
    // or the presence of a user object so we work across either auth
    // context shape.
    const loggedIn = !!user || !!isAuthenticated;

    // Auto-start the flow on the first protected page-view after login
    // for users who haven't gone through it yet.
    useEffect(() => {
        if (!loggedIn) return;
        if (!needsOnboarding) return;
        if (isPublicRoute(location.pathname)) return;
        if (onboardingStep > 0) return; // already in flow
        start();
        // We only depend on loggedIn + pathname so the effect doesn't
        // re-run on every state tick. start() is stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn, location.pathname]);

    // ─── Renderable pieces ─────────────────────────────────────

    // Public/auth pages: render nothing at all (no banners, no tooltips)
    if (isPublicRoute(location.pathname)) return null;

    // Not logged in: render nothing
    if (!loggedIn) return null;

    // User has finished or skipped onboarding — only show ambient bits
    if (!needsOnboarding) {
        return (
            <>
                <GuidanceTooltips />
                <ReengagementBanner />
            </>
        );
    }

    // Active flow — pick the step to render
    if (onboardingStep === 1) {
        return <IntentStep />;
    }

    if (onboardingStep === 2) {
        // Step 2 only makes sense on the /signals page. If the user
        // wandered off, render nothing — Step 1 already navigated them
        // to /signals so this is a defensive case.
        if (isSignalsRoute(location.pathname)) return <HighlightStep />;
        return null;
    }

    if (onboardingStep === 3) {
        return <ActionStep />;
    }

    // Defensive: in flow but at an unknown step
    return null;
};

export default OnboardingController;
