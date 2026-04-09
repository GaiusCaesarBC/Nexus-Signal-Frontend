// client/src/onboarding/steps/IntentStep.js
//
// Step 1: ask the user what they want to trade + their risk preference.
// Single-screen modal — picks a value, hits Continue, advances to Step 2.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Bitcoin, Layers, Shield, Activity, Zap, ArrowRight,
} from 'lucide-react';
import { useOnboarding } from '../OnboardingProvider';
import {
    Backdrop, Modal, Eyebrow, Title, Subtitle, StepIndicator, Pip,
    PrimaryButton, SkipLink, OptionGrid, OptionCard, SectionLabel,
} from '../styles';

const IntentStep = () => {
    const navigate = useNavigate();
    const { setIntent, skipOnboarding } = useOnboarding();

    const [intent, setIntentLocal] = useState(null);
    const [risk, setRisk] = useState('balanced'); // balanced default

    const canContinue = !!intent;

    const handleContinue = () => {
        if (!canContinue) return;
        setIntent(intent, risk);
        // Navigate to /signals so Step 2's highlight overlay can appear
        navigate('/signals');
    };

    return (
        <Backdrop>
            <Modal>
                <StepIndicator>
                    <Pip $active />
                    <Pip />
                    <Pip />
                </StepIndicator>

                <Eyebrow><Zap size={11} /> Quick setup · 30 seconds</Eyebrow>
                <Title>What do you want to trade?</Title>
                <Subtitle>
                    We'll tune your experience around what you're actually here for.
                </Subtitle>

                <OptionGrid $cols={3}>
                    <OptionCard $active={intent === 'stocks'} onClick={() => setIntentLocal('stocks')}>
                        <span className="top"><BarChart3 size={16} /> Stocks</span>
                        <span className="sub">Equities & ETFs</span>
                    </OptionCard>
                    <OptionCard $active={intent === 'crypto'} onClick={() => setIntentLocal('crypto')}>
                        <span className="top"><Bitcoin size={16} /> Crypto</span>
                        <span className="sub">BTC, ETH, alts</span>
                    </OptionCard>
                    <OptionCard $active={intent === 'both'} onClick={() => setIntentLocal('both')}>
                        <span className="top"><Layers size={16} /> Both</span>
                        <span className="sub">Mix it up</span>
                    </OptionCard>
                </OptionGrid>

                <SectionLabel>Risk preference</SectionLabel>
                <OptionGrid $cols={3}>
                    <OptionCard $active={risk === 'conservative'} onClick={() => setRisk('conservative')}>
                        <span className="top"><Shield size={14} /> Conservative</span>
                        <span className="sub">Lower risk</span>
                    </OptionCard>
                    <OptionCard $active={risk === 'balanced'} onClick={() => setRisk('balanced')}>
                        <span className="top"><Activity size={14} /> Balanced</span>
                        <span className="sub">Standard</span>
                    </OptionCard>
                    <OptionCard $active={risk === 'aggressive'} onClick={() => setRisk('aggressive')}>
                        <span className="top"><Zap size={14} /> Aggressive</span>
                        <span className="sub">Higher edge</span>
                    </OptionCard>
                </OptionGrid>

                <PrimaryButton disabled={!canContinue} onClick={handleContinue}>
                    Continue <ArrowRight size={16} />
                </PrimaryButton>

                <SkipLink onClick={skipOnboarding}>Skip for now</SkipLink>
            </Modal>
        </Backdrop>
    );
};

export default IntentStep;
