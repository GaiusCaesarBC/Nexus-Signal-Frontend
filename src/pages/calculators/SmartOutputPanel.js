// client/src/pages/calculators/SmartOutputPanel.js
//
// Wraps the existing renderResults() output with the new "smart" chrome:
//   - Strategy insight badge (top)
//   - Risk bar (for position-size)
//   - The existing results grid (passed in as `children`)
//   - Plain-English "What this means" block
//   - Trade Ready buttons (for trade calculators)
//
// This component is calculator-aware: it shows the right pieces for the
// active calculator and hides the trade-flow chrome for growth tools
// (compound, retirement, etc.).

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import RiskBar from './RiskBar';
import WhatThisMeans from './WhatThisMeans';
import StrategyInsight from './StrategyInsight';
import TradeReadyButtons from './TradeReadyButtons';
import { interpretFor, strategyInsight } from './derive';

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
`;

// Calculators that should show trade-flow chrome (RiskBar + TradeReady)
const TRADE_CALCS = new Set(['position-size', 'risk-reward']);

const buildCopyText = (calculatorId, inputs, results) => {
    if (!results) return '';
    if (calculatorId === 'position-size') {
        return [
            'Position Size Calculation',
            `  Account: ${inputs?.accountSize ?? '—'}`,
            `  Risk %:  ${inputs?.riskPercentage ?? '—'}`,
            `  Entry:   ${inputs?.entryPrice ?? '—'}`,
            `  Stop:    ${inputs?.stopLoss ?? '—'}`,
            `  Size:    ${results.positionSize ?? '—'} shares`,
            `  Value:   $${results.positionValue ?? '—'}`,
            `  Risk $:  $${results.riskAmount ?? '—'}`,
        ].join('\n');
    }
    if (calculatorId === 'risk-reward') {
        return [
            'Risk/Reward Analysis',
            `  Entry:    ${inputs?.entryPrice ?? '—'}`,
            `  Stop:     ${inputs?.stopLoss ?? '—'}`,
            `  Target:   ${inputs?.targetPrice ?? '—'}`,
            `  Ratio:    1:${results.ratio ?? '—'}`,
            `  Risk $:   $${results.riskAmount ?? '—'}`,
            `  Reward $: $${results.rewardAmount ?? '—'}`,
        ].join('\n');
    }
    return `${calculatorId}: ${JSON.stringify(results, null, 2)}`;
};

const SmartOutputPanel = ({ calculatorId, inputs, results, theme, children }) => {
    const [copied, setCopied] = useState(false);

    const interp = interpretFor(calculatorId, inputs, results);
    const insight = strategyInsight(calculatorId, inputs, results);
    const showTradeChrome = TRADE_CALCS.has(calculatorId);

    const handleCopy = useCallback(async () => {
        const text = buildCopyText(calculatorId, inputs, results);
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // ignore — clipboard not available
        }
    }, [calculatorId, inputs, results]);

    return (
        <Wrap>
            {insight && <StrategyInsight insight={insight} theme={theme} />}

            {showTradeChrome && calculatorId === 'position-size' && interp?.risk && (
                <RiskBar riskLevel={interp.risk} theme={theme} />
            )}

            {/* Existing results grid passed in from CalculatorsPage.renderResults */}
            {children}

            {interp && <WhatThisMeans interpretation={interp} theme={theme} />}

            {showTradeChrome && (
                <TradeReadyButtons
                    inputs={inputs}
                    results={results}
                    tradable={interp?.tradable}
                    onCopy={handleCopy}
                    copied={copied}
                    theme={theme}
                />
            )}
        </Wrap>
    );
};

export default SmartOutputPanel;
