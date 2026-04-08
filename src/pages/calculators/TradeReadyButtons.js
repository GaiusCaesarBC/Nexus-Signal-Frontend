// client/src/pages/calculators/TradeReadyButtons.js
//
// "Trade Ready" CTAs that connect calculator output back into the trading
// flow: Apply to Paper Trade, Use in Live Setup, Copy to Trade.
//
// All three deep-link into Signals/PaperTrade with the calculator inputs +
// derived position size in the URL — same convention as the auto-fill the
// other direction (Signals -> Calculators).

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ClipboardCopy, FlaskConical, Zap, ArrowRight, Check } from 'lucide-react';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.55rem;
`;

const Btn = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 700;
    background: ${(p) =>
        p.$primary
            ? t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef 0%, #06b6d4 100%)')
            : t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    color: ${(p) => (p.$primary ? '#fff' : t(p, 'text.primary', '#f8fafc'))};
    border: 1px solid ${(p) =>
        p.$primary
            ? 'transparent'
            : t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
    transition: transform 0.15s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 18px rgba(0, 173, 237, 0.25)')};
    }
    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }

    svg.arrow {
        margin-left: auto;
    }
`;

const buildQuery = (inputs, results) => {
    const out = new URLSearchParams();
    if (inputs?.entryPrice)  out.set('entry', inputs.entryPrice);
    if (inputs?.stopLoss)    out.set('stop', inputs.stopLoss);
    if (inputs?.targetPrice) out.set('target', inputs.targetPrice);
    if (inputs?.riskPercentage) out.set('risk', inputs.riskPercentage);
    if (results?.positionSize) out.set('size', results.positionSize);
    return out.toString();
};

const TradeReadyButtons = ({ inputs, results, tradable, onCopy, copied, theme }) => {
    const navigate = useNavigate();
    const qs = buildQuery(inputs, results);

    const goLive = () => navigate(`/signals${qs ? `?${qs}` : ''}`);
    const goPaper = () => navigate(`/paper-trade${qs ? `?${qs}` : ''}`);

    return (
        <Wrap>
            <Eyebrow theme={theme}><Zap size={11} /> Trade Ready</Eyebrow>
            <Row>
                <Btn theme={theme} onClick={goPaper} disabled={!tradable}>
                    <FlaskConical size={16} />
                    Apply to Paper Trade
                    <ArrowRight size={14} className="arrow" />
                </Btn>
                <Btn theme={theme} $primary onClick={goLive} disabled={!tradable}>
                    <Zap size={16} />
                    Use in Live Setup
                    <ArrowRight size={14} className="arrow" />
                </Btn>
                <Btn theme={theme} onClick={onCopy}>
                    {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
                    {copied ? 'Copied!' : 'Copy to Trade'}
                </Btn>
            </Row>
        </Wrap>
    );
};

export default TradeReadyButtons;
