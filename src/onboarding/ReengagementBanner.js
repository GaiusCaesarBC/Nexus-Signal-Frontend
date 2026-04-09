// client/src/onboarding/ReengagementBanner.js
//
// One-shot banner that appears AFTER the user takes their first action.
// Sets the expectation that we'll notify them when things move — which
// builds the return-trip habit. Shown once, dismissed forever via
// markReengagementShown().

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Bell, X } from 'lucide-react';
import { useOnboarding } from './OnboardingProvider';
import { t, slideUp } from './styles';

const Wrap = styled.div`
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: min(440px, calc(100% - 2rem));
    z-index: 9991;
    animation: ${slideUp} 0.45s ease-out;
`;

const Card = styled.div`
    position: relative;
    padding: 0.95rem 1.15rem 0.95rem 1.05rem;
    border-radius: 14px;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(16, 185, 129, 0.16) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.97)')};
    border: 1px solid rgba(16, 185, 129, 0.45);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    gap: 0.85rem;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
        background: linear-gradient(90deg, #10b981, #00adef);
    }
`;

const IconBox = styled.div`
    flex: 0 0 auto;
    width: 38px;
    height: 38px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.08));
    border: 1px solid rgba(16, 185, 129, 0.45);
    color: ${(p) => t(p, 'success', '#10b981')};
`;

const Body = styled.div`
    flex: 1;
    min-width: 0;

    .title {
        font-size: 0.88rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        line-height: 1.2;
    }
    .sub {
        margin-top: 0.18rem;
        font-size: 0.76rem;
        font-weight: 600;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
`;

const Dismiss = styled.button`
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid transparent;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    cursor: pointer;

    &:hover {
        background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
`;

const ReengagementBanner = () => {
    const {
        isActivated, reengagementShown, markReengagementShown,
    } = useOnboarding();

    // Auto-dismiss after 12 seconds so it doesn't linger forever
    useEffect(() => {
        if (!isActivated || reengagementShown) return;
        const timer = setTimeout(() => markReengagementShown(), 12000);
        return () => clearTimeout(timer);
    }, [isActivated, reengagementShown, markReengagementShown]);

    if (!isActivated || reengagementShown) return null;

    return (
        <Wrap>
            <Card>
                <IconBox><Bell size={18} /></IconBox>
                <Body>
                    <div className="title">We'll notify you when this trade moves</div>
                    <div className="sub">Push alerts are on by default — check Settings to tune them.</div>
                </Body>
                <Dismiss onClick={markReengagementShown} title="Dismiss"><X size={14} /></Dismiss>
            </Card>
        </Wrap>
    );
};

export default ReengagementBanner;
