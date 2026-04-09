// client/src/onboarding/steps/ActionStep.js
//
// Step 3: force a first action. Three big-button options that each
// (a) record activation, (b) navigate to the right page, and
// (c) complete onboarding. The user has to pick one — there's no
// "continue without picking" — but skip is still available as a small
// link for users who genuinely want out.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
    Zap, Bell, FlaskConical, ArrowRight, Sparkles,
} from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import {
    Backdrop, Modal, Eyebrow, Title, Subtitle, StepIndicator, Pip,
    SkipLink, t, fadeIn,
} from '../styles';

const ActionGrid = styled.div`
    display: grid;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const ActionCard = styled.button`
    text-align: left;
    cursor: pointer;
    padding: 1.05rem 1.15rem;
    border-radius: 14px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.32)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    display: grid;
    grid-template-columns: 42px 1fr auto;
    align-items: center;
    gap: 0.85rem;
    transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.18s ease;
    animation: ${fadeIn} 0.4s ease-out both;

    &:hover {
        transform: translateY(-2px);
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 22px rgba(0, 173, 237, 0.35)')};
    }

    .icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.20), rgba(0, 173, 237, 0.06));
        border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.40)')};
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
    .title {
        font-size: 0.95rem;
        font-weight: 800;
        line-height: 1.2;
    }
    .sub {
        display: block;
        margin-top: 0.18rem;
        font-size: 0.76rem;
        font-weight: 600;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
    .arrow {
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
`;

const ActionStep = () => {
    const navigate = useNavigate();
    const {
        recordActivation, completeOnboarding, skipOnboarding,
    } = useOnboarding();

    const choose = (kind, route) => {
        recordActivation(kind);
        completeOnboarding();
        navigate(route);
    };

    return (
        <Backdrop>
            <Modal>
                <StepIndicator>
                    <Pip $active />
                    <Pip $active />
                    <Pip $active />
                </StepIndicator>

                <Eyebrow><Sparkles size={11} /> Step 3 of 3 · Final move</Eyebrow>
                <Title>Take your first step</Title>
                <Subtitle>
                    Pick one and we'll take you straight there. You can always do the others later.
                </Subtitle>

                <ActionGrid>
                    <ActionCard onClick={() => choose('followedSignal', '/signals')}>
                        <div className="icon"><Zap size={18} /></div>
                        <div>
                            <div className="title">Follow a trade</div>
                            <span className="sub">Pick a live AI signal and tag along</span>
                        </div>
                        <ArrowRight size={16} className="arrow" />
                    </ActionCard>

                    <ActionCard onClick={() => choose('startedPaperTrade', '/paper-trading')}>
                        <div className="icon"><FlaskConical size={18} /></div>
                        <div>
                            <div className="title">Start paper trading</div>
                            <span className="sub">Test the strategy with $100k of fake capital</span>
                        </div>
                        <ArrowRight size={16} className="arrow" />
                    </ActionCard>

                    <ActionCard onClick={() => choose('setAlert', '/alerts')}>
                        <div className="icon"><Bell size={18} /></div>
                        <div>
                            <div className="title">Set an alert</div>
                            <span className="sub">Get notified when a setup forms</span>
                        </div>
                        <ArrowRight size={16} className="arrow" />
                    </ActionCard>
                </ActionGrid>

                <SkipLink onClick={skipOnboarding}>I'll explore on my own</SkipLink>
            </Modal>
        </Backdrop>
    );
};

export default ActionStep;
