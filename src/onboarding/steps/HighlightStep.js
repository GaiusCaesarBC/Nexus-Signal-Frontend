// client/src/onboarding/steps/HighlightStep.js
//
// Step 2: a single non-blocking floating tooltip on the /signals page
// that explains what AI signals are. Click "Got it" to advance to Step 3.
//
// Renders ONLY when the user is on /signals (or sub-routes). If the user
// navigates away, this component unmounts and the controller can re-show
// the IntentStep prompt to redirect them back. To avoid that loop, the
// controller mounts this only after Step 1 has completed AND the
// pathname matches.

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Sparkles, ArrowRight, X, Zap } from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import { t, slideUp } from '../styles';

const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-3px); }
`;

const Wrap = styled.div`
    position: fixed;
    top: 96px;
    left: 50%;
    transform: translateX(-50%);
    width: min(440px, calc(100% - 2rem));
    z-index: 9997;
    animation: ${slideUp} 0.45s ease-out;

    @media (max-width: 640px) {
        top: 80px;
    }
`;

const Card = styled.div`
    position: relative;
    border-radius: 16px;
    padding: 1.1rem 1.25rem 1.05rem 1.25rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(168, 85, 247, 0.16) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(0, 173, 237, 0.14) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.97)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.45)')};
    box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.55),
        0 0 36px rgba(0, 173, 237, 0.20);

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        background: linear-gradient(90deg, #a855f7, #00adef, #10b981);
    }
`;

const Top = styled.div`
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    margin-bottom: 0.45rem;

    svg {
        animation: ${float} 2.4s ease-in-out infinite;
    }
`;

const Body = styled.div`
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.45;
    margin-bottom: 0.85rem;

    strong {
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
        font-weight: 800;
    }
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const HelperText = styled.span`
    font-size: 0.72rem;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-weight: 600;
`;

const NextBtn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.95rem;
    border-radius: 10px;
    cursor: pointer;
    background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef 0%, #06b6d4 100%)')};
    color: #fff;
    border: none;
    font-size: 0.82rem;
    font-weight: 800;
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 18px rgba(0, 173, 237, 0.35)')};
    }
`;

const DismissBtn = styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
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

const HighlightStep = () => {
    const { advanceToActionStep, skipOnboarding } = useOnboarding();

    return (
        <Wrap>
            <Card>
                <DismissBtn onClick={skipOnboarding} title="Skip">
                    <X size={13} />
                </DismissBtn>

                <Top>
                    <Sparkles size={12} /> Step 2 of 3
                </Top>

                <Body>
                    These are <strong>live AI-generated trade setups</strong> updated in real time —
                    the highest-confidence ones are at the top. Pick one to follow next.
                </Body>

                <Row>
                    <HelperText>Take a quick look around</HelperText>
                    <NextBtn onClick={advanceToActionStep}>
                        <Zap size={13} /> Got it <ArrowRight size={13} />
                    </NextBtn>
                </Row>
            </Card>
        </Wrap>
    );
};

export default HighlightStep;
