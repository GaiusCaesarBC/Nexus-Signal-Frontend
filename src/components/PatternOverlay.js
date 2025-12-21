// client/src/components/PatternOverlay.js - CLEAN PATTERN OVERLAY
// Minimal, elegant pattern markers without cluttering the chart

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// ============ ANIMATIONS ============

const fadeIn = keyframes`
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.1); opacity: 1; }
`;

const glow = keyframes`
    0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
    50% { filter: drop-shadow(0 0 10px currentColor); }
`;

// ============ STYLED COMPONENTS ============

// Chart margins (TradingView lightweight-charts defaults)
const CHART_MARGINS = {
    right: 60,   // Price scale width
    bottom: 30,  // Time scale height
    top: 10,
    left: 5
};

const OverlayContainer = styled.svg`
    position: absolute;
    top: ${CHART_MARGINS.top}px;
    left: ${CHART_MARGINS.left}px;
    width: calc(100% - ${CHART_MARGINS.left + CHART_MARGINS.right}px);
    height: calc(100% - ${CHART_MARGINS.top + CHART_MARGINS.bottom}px);
    pointer-events: none;
    z-index: 10;
    overflow: visible;
`;

const PatternBadge = styled.g`
    animation: ${fadeIn} 0.4s ease-out forwards;
    cursor: pointer;
    pointer-events: all;

    &:hover {
        transform: scale(1.05);
    }
`;

const BadgeRect = styled.rect`
    fill: ${props => props.$bg || 'rgba(0, 173, 237, 0.9)'};
    rx: 6;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
`;

const BadgeText = styled.text`
    fill: white;
    font-size: 10px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: middle;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DirectionArrow = styled.path`
    fill: white;
    opacity: 0.9;
`;

const MarkerDot = styled.circle`
    fill: ${props => props.$color || '#00adef'};
    stroke: white;
    stroke-width: 2;
    animation: ${pulse} 2s ease-in-out infinite;
    filter: drop-shadow(0 0 6px ${props => props.$color || '#00adef'});
`;

const ConfidenceRing = styled.circle`
    fill: none;
    stroke: ${props => props.$color || '#00adef'};
    stroke-width: 3;
    opacity: 0.6;
    animation: ${glow} 2s ease-in-out infinite;
`;

const TooltipGroup = styled.g`
    pointer-events: none;
`;

const TooltipBg = styled.rect`
    fill: rgba(15, 23, 42, 0.95);
    rx: 8;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
`;

const TooltipText = styled.text`
    fill: #e2e8f0;
    font-size: 11px;
`;

// ============ COMPONENT ============

const PatternOverlay = ({ patterns, chartDimensions, priceScale, timeScale }) => {
    const [hoveredPattern, setHoveredPattern] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (!patterns || patterns.length === 0 || !chartDimensions || !priceScale || !timeScale) {
        return null;
    }

    // Calculate effective chart area (excluding price scale and time scale)
    const chartWidth = chartDimensions.width - CHART_MARGINS.left - CHART_MARGINS.right;
    const chartHeight = chartDimensions.height - CHART_MARGINS.top - CHART_MARGINS.bottom;

    // Convert price to Y coordinate within the chart area
    const priceToY = (price) => {
        if (!price || !priceScale.min || !priceScale.max) return chartHeight / 2;
        const range = priceScale.max - priceScale.min;
        if (range === 0) return chartHeight / 2;
        // Map price to Y: high prices at top (low Y), low prices at bottom (high Y)
        const normalized = (price - priceScale.min) / range;
        return chartHeight * (1 - normalized);
    };

    // Convert data index to X coordinate within the chart area
    const indexToX = (index) => {
        if (index === undefined || timeScale.start === undefined || timeScale.end === undefined) return chartWidth / 2;
        const range = timeScale.end - timeScale.start;
        if (range === 0) return chartWidth / 2;
        // Map index to X position across the chart width
        const normalized = (index - timeScale.start) / range;
        return normalized * chartWidth;
    };

    // Get color based on pattern type
    const getColor = (pattern) => {
        const patternType = pattern.type || 'neutral';
        if (patternType === 'bullish') return '#10b981';
        if (patternType === 'bearish') return '#ef4444';
        return '#8b5cf6';
    };

    // Get pattern display name (shortened)
    const getShortName = (pattern) => {
        const name = pattern.name || pattern.pattern || '';
        const shortNames = {
            'HEAD_SHOULDERS': 'H&S',
            'HEAD_SHOULDERS_INVERSE': 'INV H&S',
            'DOUBLE_TOP': 'DBL TOP',
            'DOUBLE_BOTTOM': 'DBL BTM',
            'TRIPLE_TOP': 'TRIP TOP',
            'TRIPLE_BOTTOM': 'TRIP BTM',
            'ASCENDING_TRIANGLE': 'ASC TRI',
            'DESCENDING_TRIANGLE': 'DESC TRI',
            'BULL_FLAG': 'BULL FLAG',
            'BEAR_FLAG': 'BEAR FLAG',
            'BULL_PENNANT': 'PENNANT',
            'BEAR_PENNANT': 'PENNANT',
            'RISING_WEDGE': 'WEDGE',
            'FALLING_WEDGE': 'WEDGE',
            'CUP_HANDLE': 'CUP',
            'ROUNDING_BOTTOM': 'ROUND',
            'ROUNDING_TOP': 'ROUND',
            'BROADENING_TOP': 'BROAD',
            'BROADENING_BOTTOM': 'BROAD',
            'DOJI': 'DOJI',
            'HAMMER': 'HAMMER',
            'HANGING_MAN': 'HANG',
            'INVERTED_HAMMER': 'INV HAM',
            'SHOOTING_STAR': 'STAR',
            'BULLISH_ENGULFING': 'ENGULF',
            'BEARISH_ENGULFING': 'ENGULF',
            'MORNING_STAR': 'M.STAR',
            'EVENING_STAR': 'E.STAR',
            'THREE_WHITE_SOLDIERS': '3 SOLD',
            'THREE_BLACK_CROWS': '3 CROW',
            'PIERCING_LINE': 'PIERCE',
            'DARK_CLOUD_COVER': 'CLOUD',
            'MARUBOZU': 'MARU'
        };
        return shortNames[pattern.pattern] || name.substring(0, 8).toUpperCase();
    };

    // Get pattern position for badge placement
    const getPatternPosition = (pattern) => {
        const points = pattern.points;
        if (!points) return null;

        // Single point patterns (candlestick)
        if (points.index !== undefined && points.price !== undefined) {
            return { x: indexToX(points.index), y: priceToY(points.price) };
        }

        // Two-candle patterns
        if (points.engulfing) {
            return { x: indexToX(points.engulfing.index), y: priceToY(points.engulfing.price) };
        }
        if (points.second && points.first) {
            return { x: indexToX(points.second.index), y: priceToY(points.second.price) };
        }

        // Three-candle patterns
        if (points.third) {
            return { x: indexToX(points.third.index), y: priceToY(points.third.price) };
        }

        // Head and shoulders
        if (points.head) {
            return { x: indexToX(points.head.index), y: priceToY(points.head.price) };
        }

        // Double/Triple patterns
        if (points.peak1 && points.peak2) {
            const avgX = (indexToX(points.peak1.index) + indexToX(points.peak2.index)) / 2;
            const avgY = (priceToY(points.peak1.price) + priceToY(points.peak2.price)) / 2;
            return { x: avgX, y: avgY };
        }
        if (points.trough1 && points.trough2) {
            const avgX = (indexToX(points.trough1.index) + indexToX(points.trough2.index)) / 2;
            const avgY = (priceToY(points.trough1.price) + priceToY(points.trough2.price)) / 2;
            return { x: avgX, y: avgY };
        }

        // Wedge/Triangle/Flag/Pennant
        if (points.apex) {
            return { x: indexToX(points.apex.index), y: chartHeight / 2 };
        }
        if (points.upperEnd && points.lowerEnd) {
            const x = (indexToX(points.upperEnd.index) + indexToX(points.lowerEnd.index)) / 2;
            const y = (priceToY(points.upperEnd.price) + priceToY(points.lowerEnd.price)) / 2;
            return { x, y };
        }

        // Cup and Handle
        if (points.bottom) {
            return { x: indexToX(points.bottom.index), y: priceToY(points.bottom.price) };
        }

        // Rounding
        if (points.curvePoints && points.curvePoints.length > 0) {
            const mid = points.curvePoints[Math.floor(points.curvePoints.length / 2)];
            if (mid) return { x: indexToX(mid.index), y: priceToY(mid.price) };
        }

        return null;
    };

    // Render single pattern badge
    const renderPatternBadge = (pattern, index) => {
        const pos = getPatternPosition(pattern);
        if (!pos || isNaN(pos.x) || isNaN(pos.y)) return null;

        const color = getColor(pattern);
        const shortName = getShortName(pattern);
        const isBullish = pattern.type === 'bullish';
        const isBearish = pattern.type === 'bearish';
        const confidence = pattern.confidence?.toFixed(0) || '?';

        // Badge dimensions
        const badgeWidth = Math.max(50, shortName.length * 7 + 20);
        const badgeHeight = 24;

        // Position badge above or below based on pattern type
        const yOffset = isBullish ? 35 : -45;
        const badgeY = pos.y + yOffset;

        // Keep badge within bounds
        const clampedX = Math.max(badgeWidth / 2 + 5, Math.min(chartWidth - badgeWidth / 2 - 5, pos.x));
        const clampedY = Math.max(badgeHeight + 5, Math.min(chartHeight - badgeHeight - 5, badgeY));

        return (
            <PatternBadge
                key={`pattern-${index}`}
                onMouseEnter={(e) => {
                    setHoveredPattern(pattern);
                    setTooltipPos({ x: clampedX, y: clampedY - 60 });
                }}
                onMouseLeave={() => setHoveredPattern(null)}
            >
                {/* Marker dot at pattern location */}
                <ConfidenceRing cx={pos.x} cy={pos.y} r="12" $color={color} />
                <MarkerDot cx={pos.x} cy={pos.y} r="6" $color={color} />

                {/* Badge with pattern name */}
                <BadgeRect
                    x={clampedX - badgeWidth / 2}
                    y={clampedY - badgeHeight / 2}
                    width={badgeWidth}
                    height={badgeHeight}
                    $bg={color}
                />

                {/* Direction arrow */}
                {isBullish && (
                    <DirectionArrow
                        d={`M ${clampedX - badgeWidth/2 + 8} ${clampedY + 3}
                            L ${clampedX - badgeWidth/2 + 12} ${clampedY - 4}
                            L ${clampedX - badgeWidth/2 + 16} ${clampedY + 3} Z`}
                    />
                )}
                {isBearish && (
                    <DirectionArrow
                        d={`M ${clampedX - badgeWidth/2 + 8} ${clampedY - 3}
                            L ${clampedX - badgeWidth/2 + 12} ${clampedY + 4}
                            L ${clampedX - badgeWidth/2 + 16} ${clampedY - 3} Z`}
                    />
                )}

                {/* Pattern name */}
                <BadgeText x={clampedX + 5} y={clampedY}>
                    {shortName}
                </BadgeText>

                {/* Confidence percentage - small badge */}
                <rect
                    x={clampedX + badgeWidth/2 - 22}
                    y={clampedY - 8}
                    width="18"
                    height="16"
                    rx="8"
                    fill="rgba(255,255,255,0.2)"
                />
                <text
                    x={clampedX + badgeWidth/2 - 13}
                    y={clampedY + 1}
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    {confidence}
                </text>
            </PatternBadge>
        );
    };

    // Render tooltip
    const renderTooltip = () => {
        if (!hoveredPattern) return null;

        const color = getColor(hoveredPattern);
        const name = hoveredPattern.name || hoveredPattern.pattern?.replace(/_/g, ' ') || 'Pattern';
        const confidence = hoveredPattern.confidence?.toFixed(1) || 'N/A';
        const target = hoveredPattern.target?.toFixed(2) || 'N/A';
        const move = hoveredPattern.potentialMove || '0';
        const status = hoveredPattern.status || 'detected';

        const tooltipWidth = 160;
        const tooltipHeight = 90;
        const x = Math.max(5, Math.min(chartWidth - tooltipWidth - 5, tooltipPos.x - tooltipWidth / 2));
        const y = Math.max(5, tooltipPos.y);

        return (
            <TooltipGroup>
                <TooltipBg x={x} y={y} width={tooltipWidth} height={tooltipHeight} />

                {/* Header with pattern name */}
                <rect x={x} y={y} width={tooltipWidth} height={22} rx="8" fill={color} />
                <text x={x + tooltipWidth/2} y={y + 15} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {name}
                </text>

                {/* Stats */}
                <TooltipText x={x + 10} y={y + 40}>
                    <tspan fontWeight="bold" fill="#94a3b8">Confidence:</tspan>
                    <tspan x={x + 100} fill="#fff">{confidence}%</tspan>
                </TooltipText>
                <TooltipText x={x + 10} y={y + 56}>
                    <tspan fontWeight="bold" fill="#94a3b8">Target:</tspan>
                    <tspan x={x + 100} fill={color}>${target}</tspan>
                </TooltipText>
                <TooltipText x={x + 10} y={y + 72}>
                    <tspan fontWeight="bold" fill="#94a3b8">Move:</tspan>
                    <tspan x={x + 100} fill={parseFloat(move) >= 0 ? '#10b981' : '#ef4444'}>
                        {parseFloat(move) >= 0 ? '+' : ''}{move}%
                    </tspan>
                </TooltipText>

                {/* Status indicator */}
                <circle cx={x + tooltipWidth - 15} y={y + 11} r="4" fill={status === 'confirmed' ? '#10b981' : '#f59e0b'} />
            </TooltipGroup>
        );
    };

    return (
        <OverlayContainer viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            {patterns.map((pattern, index) => renderPatternBadge(pattern, index))}
            {renderTooltip()}
        </OverlayContainer>
    );
};

export default PatternOverlay;
