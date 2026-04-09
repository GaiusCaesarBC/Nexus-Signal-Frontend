// client/src/onboarding/GuidanceTooltips.js
//
// Post-onboarding contextual hints. Renders a small floating tooltip
// (one per page) the FIRST time the user visits Signals / Alerts /
// Portfolio after completing onboarding. Each tooltip dismisses on
// click and is marked seen forever via the OnboardingProvider so it
// never reappears.
//
// Routing-aware via useLocation. Renders nothing on routes we don't
// have a hint for. Designed to be mounted ONCE at app root — handles
// its own routing logic so callers don't have to.

import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Sparkles, Bell, BarChart3, X } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { t, slideUp } from './styles';

const Wrap = styled.div`
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: min(320px, calc(100% - 2rem));
    z-index: 9990;
    animation: ${slideUp} 0.4s ease-out;

    @media (max-width: 640px) {
        bottom: 16px;
        right: 16px;
    }
`;

const Card = styled.div`
    position: relative;
    padding: 0.95rem 1.05rem 0.95rem 1.05rem;
    border-radius: 14px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.97)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
        background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(90deg, #00adef, #06b6d4)')};
    }
`;

const Top = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    margin-bottom: 0.4rem;
`;

const Body = styled.div`
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.45;
`;

const DismissBtn = styled.button`
    position: absolute;
    top: 6px;
    right: 6px;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: 7px;
    background: transparent;
    border: 1px solid transparent;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    cursor: pointer;

    &:hover {
        background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
`;

// ─── Per-page hint config ──────────────────────────────────────
//
// Each entry maps a route prefix to a hint. The first entry whose
// `match` function returns true wins. To add a new hint, just append
// to this list — no other code needs to change.

const HINTS = [
    {
        key: 'signals',
        match: (path) => path === '/signals' || path.startsWith('/signals/'),
        Icon: Sparkles,
        title: 'AI Signals',
        body: "These are live AI trade setups — sorted by confidence. Tap any card for the full plan.",
    },
    {
        key: 'alerts',
        match: (path) => path === '/alerts' || path.startsWith('/alerts/'),
        Icon: Bell,
        title: 'Alerts',
        body: "Set alerts so you don't miss moves — works for price levels, breakouts, and signal triggers.",
    },
    {
        key: 'portfolio',
        match: (path) => path === '/portfolio' || path.startsWith('/portfolio/') || path.startsWith('/portfolio-analytics'),
        Icon: BarChart3,
        title: 'Portfolio',
        body: "Track your performance here. Open positions update live; closed trades feed your stats.",
    },
];

const GuidanceTooltips = () => {
    const location = useLocation();
    const {
        onboardingCompleted, inFlow, guidanceSeen, dismissGuidance,
    } = useOnboarding();

    // Don't show guidance until onboarding is done
    if (!onboardingCompleted) return null;

    // Don't show during an active onboarding flow (defensive — shouldn't
    // happen but keeps things clean)
    if (inFlow) return null;

    // Find a matching hint for the current route
    const hint = HINTS.find((h) => h.match(location.pathname || ''));
    if (!hint) return null;

    // Already seen this one
    if (guidanceSeen[hint.key]) return null;

    const Icon = hint.Icon;

    return (
        <Wrap>
            <Card>
                <DismissBtn onClick={() => dismissGuidance(hint.key)} title="Dismiss">
                    <X size={13} />
                </DismissBtn>
                <Top><Icon size={11} /> {hint.title}</Top>
                <Body>{hint.body}</Body>
            </Card>
        </Wrap>
    );
};

export default GuidanceTooltips;
