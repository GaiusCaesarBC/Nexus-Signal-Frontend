// client/src/components/PatternOverlay.js - COMPREHENSIVE PATTERN VISUALIZATION
// Full visual overlays: shapes, zones, markers, and badges

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// ============ ANIMATIONS ============

const fadeSlideIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

const pulse = keyframes`
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
`;

const drawLine = keyframes`
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
`;

const glowPulse = keyframes`
    0%, 100% {
        filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 8px currentColor);
    }
    50% {
        filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor);
    }
`;

const shimmer = keyframes`
    0% { opacity: 0.6; }
    50% { opacity: 0.9; }
    100% { opacity: 0.6; }
`;

const breathe = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

// ============ CHART MARGINS ============
const CHART_MARGINS = {
    right: 60,
    bottom: 30,
    top: 10,
    left: 5
};

// ============ STYLED COMPONENTS ============

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

const PatternGroup = styled.g`
    animation: ${fadeSlideIn} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: ${props => (props.$index || 0) * 0.1}s;
    opacity: 0;
    pointer-events: all;
    cursor: pointer;

    &:hover {
        filter: brightness(1.2);
    }
`;

// Pattern zone (shaded region with gradient support)
const PatternZone = styled.path`
    fill: ${props => props.$gradient ? `url(#${props.$gradient})` : (props.$color || 'rgba(59, 130, 246, 0.1)')};
    stroke: ${props => props.$strokeColor || 'none'};
    stroke-width: 1;
    stroke-opacity: 0.3;
    animation: ${shimmer} 4s ease-in-out infinite;
`;

// Trendlines
const TrendLine = styled.line`
    stroke: ${props => props.$color || '#3b82f6'};
    stroke-width: ${props => props.$width || 2};
    stroke-dasharray: ${props => props.$dashed ? '6,4' : 'none'};
    stroke-linecap: round;
    animation: ${glowPulse} 2s ease-in-out infinite;
`;

// Curved path for patterns like Cup & Handle, Rounding
const PatternPath = styled.path`
    fill: none;
    stroke: ${props => props.$color || '#3b82f6'};
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
    animation: ${drawLine} 1s ease-out forwards, ${glowPulse} 2s ease-in-out infinite 1s;
`;

// Horizontal support/resistance lines
const LevelLine = styled.line`
    stroke: ${props => props.$color || '#f59e0b'};
    stroke-width: 1.5;
    stroke-dasharray: 8,4;
    opacity: 0.8;
`;

// Candle marker dot with glow
const CandleMarker = styled.circle`
    fill: ${props => props.$color || '#3b82f6'};
    stroke: rgba(255, 255, 255, 0.9);
    stroke-width: 2;
    filter: drop-shadow(0 0 6px ${props => props.$color || '#3b82f6'})
            drop-shadow(0 0 12px ${props => props.$color || '#3b82f6'});
    animation: ${breathe} 2.5s ease-in-out infinite;
    transition: r 0.2s ease;

    &:hover {
        r: ${props => (props.r || 5) + 2};
    }
`;

// Small arrow marker
const ArrowMarker = styled.path`
    fill: ${props => props.$color || '#3b82f6'};
    filter: drop-shadow(0 0 3px ${props => props.$color || '#3b82f6'});
`;

// Badge container
const BadgeGroup = styled.g`
    animation: ${fadeSlideIn} 0.4s ease-out forwards;
`;

const BadgeRect = styled.rect`
    fill: ${props => props.$bg || 'rgba(15, 23, 42, 0.9)'};
    stroke: ${props => props.$color || '#3b82f6'};
    stroke-width: 1.5;
    rx: 6;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
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

const ConfidenceText = styled.text`
    fill: ${props => props.$color || '#10b981'};
    font-size: 9px;
    font-weight: 600;
    text-anchor: middle;
`;

// Tooltip with glass-morphism
const TooltipGroup = styled.g`
    pointer-events: none;
    animation: ${fadeSlideIn} 0.3s ease-out forwards;
`;

const TooltipBg = styled.rect`
    fill: rgba(15, 23, 42, 0.85);
    rx: 12;
    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6)) drop-shadow(0 4px 8px rgba(0,0,0,0.3));
`;

const TooltipGlassBorder = styled.rect`
    fill: none;
    stroke: rgba(255, 255, 255, 0.15);
    stroke-width: 1;
    rx: 12;
`;

// ============ COMPONENT ============

const PatternOverlay = ({ patterns, chartDimensions, priceScale, timeScale }) => {
    const [hoveredPattern, setHoveredPattern] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (!patterns || patterns.length === 0 || !chartDimensions || !priceScale || !timeScale) {
        return null;
    }

    // Calculate effective chart area
    const chartWidth = chartDimensions.width - CHART_MARGINS.left - CHART_MARGINS.right;
    const chartHeight = chartDimensions.height - CHART_MARGINS.top - CHART_MARGINS.bottom;

    // Coordinate conversion functions
    const priceToY = (price) => {
        if (!price || !priceScale.min || !priceScale.max) return chartHeight / 2;
        const range = priceScale.max - priceScale.min;
        if (range === 0) return chartHeight / 2;
        return chartHeight * (1 - (price - priceScale.min) / range);
    };

    const indexToX = (index) => {
        if (index === undefined || timeScale.start === undefined || timeScale.end === undefined) return chartWidth / 2;
        const range = timeScale.end - timeScale.start;
        if (range === 0) return chartWidth / 2;
        return ((index - timeScale.start) / range) * chartWidth;
    };

    // Color helpers
    const getColor = (pattern) => {
        const type = pattern.type || PATTERN_TYPES[pattern.pattern] || 'neutral';
        if (type === 'bullish') return '#10b981';
        if (type === 'bearish') return '#ef4444';
        return '#8b5cf6';
    };

    const getZoneColor = (pattern) => {
        const type = pattern.type || PATTERN_TYPES[pattern.pattern] || 'neutral';
        if (type === 'bullish') return 'rgba(16, 185, 129, 0.08)';
        if (type === 'bearish') return 'rgba(239, 68, 68, 0.08)';
        return 'rgba(139, 92, 246, 0.08)';
    };

    // Get gradient ID for pattern zone
    const getZoneGradient = (pattern) => {
        const type = pattern.type || PATTERN_TYPES[pattern.pattern] || 'neutral';
        if (type === 'bullish') return 'bullishGradient';
        if (type === 'bearish') return 'bearishGradient';
        return 'neutralGradient';
    };

    // Pattern type lookup
    const PATTERN_TYPES = {
        'HEAD_SHOULDERS': 'bearish',
        'HEAD_SHOULDERS_INVERSE': 'bullish',
        'DOUBLE_TOP': 'bearish',
        'DOUBLE_BOTTOM': 'bullish',
        'TRIPLE_TOP': 'bearish',
        'TRIPLE_BOTTOM': 'bullish',
        'ASCENDING_TRIANGLE': 'bullish',
        'DESCENDING_TRIANGLE': 'bearish',
        'SYMMETRIC_TRIANGLE': 'neutral',
        'BULL_FLAG': 'bullish',
        'BEAR_FLAG': 'bearish',
        'BULL_PENNANT': 'bullish',
        'BEAR_PENNANT': 'bearish',
        'RISING_WEDGE': 'bearish',
        'FALLING_WEDGE': 'bullish',
        'CUP_HANDLE': 'bullish',
        'ROUNDING_BOTTOM': 'bullish',
        'ROUNDING_TOP': 'bearish',
        'BROADENING_TOP': 'bearish',
        'BROADENING_BOTTOM': 'bullish',
        'DOJI': 'neutral',
        'HAMMER': 'bullish',
        'HANGING_MAN': 'bearish',
        'INVERTED_HAMMER': 'bullish',
        'SHOOTING_STAR': 'bearish',
        'BULLISH_ENGULFING': 'bullish',
        'BEARISH_ENGULFING': 'bearish',
        'MORNING_STAR': 'bullish',
        'EVENING_STAR': 'bearish',
        'THREE_WHITE_SOLDIERS': 'bullish',
        'THREE_BLACK_CROWS': 'bearish',
        'PIERCING_LINE': 'bullish',
        'DARK_CLOUD_COVER': 'bearish',
        'MARUBOZU': 'neutral',
        'UPTREND': 'bullish',
        'DOWNTREND': 'bearish',
        'SUPPORT_RESISTANCE': 'neutral'
    };

    // Short names for badges
    const getShortName = (pattern) => {
        const shortNames = {
            'HEAD_SHOULDERS': 'H&S',
            'HEAD_SHOULDERS_INVERSE': 'INV H&S',
            'DOUBLE_TOP': 'DBL TOP',
            'DOUBLE_BOTTOM': 'DBL BTM',
            'TRIPLE_TOP': 'TRIP TOP',
            'TRIPLE_BOTTOM': 'TRIP BTM',
            'ASCENDING_TRIANGLE': 'ASC TRI',
            'DESCENDING_TRIANGLE': 'DESC TRI',
            'SYMMETRIC_TRIANGLE': 'SYM TRI',
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
            'HANGING_MAN': 'HANG MAN',
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
            'MARUBOZU': 'MARU',
            'UPTREND': 'UPTREND',
            'DOWNTREND': 'DOWNTREND',
            'SUPPORT_RESISTANCE': 'S&R'
        };
        return shortNames[pattern.pattern] || pattern.pattern?.substring(0, 8) || 'PATTERN';
    };

    // ============ PATTERN SHAPE RENDERERS ============

    // Draw Head & Shoulders
    const drawHeadShoulders = (pattern) => {
        const points = pattern.points;
        if (!points?.head || !points?.leftShoulder || !points?.rightShoulder) return null;

        const color = getColor(pattern);
        const ls = { x: indexToX(points.leftShoulder.index), y: priceToY(points.leftShoulder.price) };
        const head = { x: indexToX(points.head.index), y: priceToY(points.head.price) };
        const rs = { x: indexToX(points.rightShoulder.index), y: priceToY(points.rightShoulder.price) };
        const necklineY = points.neckline ? priceToY(points.neckline) : (ls.y + rs.y) / 2;

        return (
            <g>
                {/* Zone with gradient */}
                <PatternZone
                    $gradient={getZoneGradient(pattern)}
                    $strokeColor={color}
                    d={`M ${ls.x} ${necklineY} L ${ls.x} ${ls.y} L ${head.x} ${head.y} L ${rs.x} ${rs.y} L ${rs.x} ${necklineY} Z`}
                />
                {/* Shoulder-Head-Shoulder curved line */}
                <PatternPath $color={color} d={`M ${ls.x} ${ls.y} Q ${(ls.x + head.x) / 2} ${head.y - 10} ${head.x} ${head.y} Q ${(head.x + rs.x) / 2} ${head.y - 10} ${rs.x} ${rs.y}`} />
                {/* Neckline */}
                <LevelLine x1={ls.x - 20} y1={necklineY} x2={rs.x + 20} y2={necklineY} $color="#f59e0b" />
                {/* Markers with labels */}
                <CandleMarker cx={ls.x} cy={ls.y} r="5" $color={color} />
                <CandleMarker cx={head.x} cy={head.y} r="8" $color={color} />
                <CandleMarker cx={rs.x} cy={rs.y} r="5" $color={color} />
            </g>
        );
    };

    // Draw Double Top/Bottom
    const drawDoubleTopBottom = (pattern) => {
        const points = pattern.points;
        const isTop = pattern.pattern?.includes('TOP');

        let p1, p2;
        if (points?.peak1 && points?.peak2) {
            p1 = { x: indexToX(points.peak1.index), y: priceToY(points.peak1.price) };
            p2 = { x: indexToX(points.peak2.index), y: priceToY(points.peak2.price) };
        } else if (points?.trough1 && points?.trough2) {
            p1 = { x: indexToX(points.trough1.index), y: priceToY(points.trough1.price) };
            p2 = { x: indexToX(points.trough2.index), y: priceToY(points.trough2.price) };
        } else {
            return null;
        }

        const color = getColor(pattern);
        const necklineY = points.neckline ? priceToY(points.neckline) : (isTop ? Math.max(p1.y, p2.y) + 30 : Math.min(p1.y, p2.y) - 30);

        return (
            <g>
                {/* Zone with gradient */}
                <PatternZone
                    $gradient={getZoneGradient(pattern)}
                    $strokeColor={color}
                    d={`M ${p1.x} ${necklineY} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p2.x} ${necklineY} Z`}
                />
                {/* Connection curve */}
                <PatternPath $color={color} d={`M ${p1.x} ${p1.y} Q ${(p1.x + p2.x) / 2} ${necklineY} ${p2.x} ${p2.y}`} />
                {/* Neckline */}
                <LevelLine x1={p1.x - 20} y1={necklineY} x2={p2.x + 20} y2={necklineY} $color="#f59e0b" />
                {/* Markers */}
                <CandleMarker cx={p1.x} cy={p1.y} r="7" $color={color} />
                <CandleMarker cx={p2.x} cy={p2.y} r="7" $color={color} />
            </g>
        );
    };

    // Draw Triple Top/Bottom
    const drawTriple = (pattern) => {
        const points = pattern.points;
        if (!points?.first || !points?.second || !points?.third) return null;

        const color = getColor(pattern);
        const p1 = { x: indexToX(points.first.index), y: priceToY(points.first.price) };
        const p2 = { x: indexToX(points.second.index), y: priceToY(points.second.price) };
        const p3 = { x: indexToX(points.third.index), y: priceToY(points.third.price) };
        const necklineY = points.neckline ? priceToY(points.neckline) : (p1.y + p2.y + p3.y) / 3;

        return (
            <g>
                {/* Zone with gradient */}
                <PatternZone
                    $gradient={getZoneGradient(pattern)}
                    $strokeColor={color}
                    d={`M ${p1.x} ${necklineY} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p3.x} ${necklineY} Z`}
                />
                {/* Connection curve through all three points */}
                <PatternPath $color={color} d={`M ${p1.x} ${p1.y} Q ${(p1.x + p2.x) / 2} ${(p1.y + p2.y) / 2 - 5} ${p2.x} ${p2.y} Q ${(p2.x + p3.x) / 2} ${(p2.y + p3.y) / 2 - 5} ${p3.x} ${p3.y}`} />
                {/* Markers */}
                <CandleMarker cx={p1.x} cy={p1.y} r="6" $color={color} />
                <CandleMarker cx={p2.x} cy={p2.y} r="6" $color={color} />
                <CandleMarker cx={p3.x} cy={p3.y} r="6" $color={color} />
            </g>
        );
    };

    // Draw Triangle/Wedge/Broadening
    const drawTriangleWedge = (pattern) => {
        const points = pattern.points;
        if (!points?.upperStart && !points?.upperEnd && !points?.lowerStart && !points?.lowerEnd) {
            return null;
        }

        const color = getColor(pattern);
        const upperStart = points.upperStart ? { x: indexToX(points.upperStart.index), y: priceToY(points.upperStart.price) } : null;
        const upperEnd = points.upperEnd ? { x: indexToX(points.upperEnd.index), y: priceToY(points.upperEnd.price) } : null;
        const lowerStart = points.lowerStart ? { x: indexToX(points.lowerStart.index), y: priceToY(points.lowerStart.price) } : null;
        const lowerEnd = points.lowerEnd ? { x: indexToX(points.lowerEnd.index), y: priceToY(points.lowerEnd.price) } : null;

        if (!upperStart || !upperEnd || !lowerStart || !lowerEnd) return null;

        return (
            <g>
                {/* Zone with gradient */}
                <PatternZone
                    $gradient={getZoneGradient(pattern)}
                    $strokeColor={color}
                    d={`M ${upperStart.x} ${upperStart.y} L ${upperEnd.x} ${upperEnd.y} L ${lowerEnd.x} ${lowerEnd.y} L ${lowerStart.x} ${lowerStart.y} Z`}
                />
                {/* Upper trendline */}
                <TrendLine x1={upperStart.x} y1={upperStart.y} x2={upperEnd.x} y2={upperEnd.y} $color={color} />
                {/* Lower trendline */}
                <TrendLine x1={lowerStart.x} y1={lowerStart.y} x2={lowerEnd.x} y2={lowerEnd.y} $color={color} />
                {/* Markers */}
                <CandleMarker cx={upperStart.x} cy={upperStart.y} r="5" $color={color} />
                <CandleMarker cx={upperEnd.x} cy={upperEnd.y} r="5" $color={color} />
                <CandleMarker cx={lowerStart.x} cy={lowerStart.y} r="5" $color={color} />
                <CandleMarker cx={lowerEnd.x} cy={lowerEnd.y} r="5" $color={color} />
            </g>
        );
    };

    // Draw Flag/Pennant
    const drawFlagPennant = (pattern) => {
        const points = pattern.points;
        if (!points?.poleStart && !points?.poleEnd) return null;

        const color = getColor(pattern);
        const poleStart = points.poleStart ? { x: indexToX(points.poleStart.index), y: priceToY(points.poleStart.price) } : null;
        const poleEnd = points.poleEnd ? { x: indexToX(points.poleEnd.index), y: priceToY(points.poleEnd.price) } : null;

        if (!poleStart || !poleEnd) return null;

        // For pennant, draw converging lines from poleEnd
        const flagWidth = 40;
        const flagHeight = Math.abs(poleEnd.y - poleStart.y) * 0.3;

        return (
            <g>
                {/* Pole line */}
                <TrendLine x1={poleStart.x} y1={poleStart.y} x2={poleEnd.x} y2={poleEnd.y} $color={color} $width={3} />
                {/* Flag/Pennant shape */}
                <PatternPath
                    $color={color}
                    d={`M ${poleEnd.x} ${poleEnd.y - flagHeight} L ${poleEnd.x + flagWidth} ${poleEnd.y} L ${poleEnd.x} ${poleEnd.y + flagHeight}`}
                />
                {/* Markers */}
                <CandleMarker cx={poleStart.x} cy={poleStart.y} r="5" $color={color} />
                <CandleMarker cx={poleEnd.x} cy={poleEnd.y} r="6" $color={color} />
            </g>
        );
    };

    // Draw Cup & Handle
    const drawCupHandle = (pattern) => {
        const points = pattern.points;
        if (!points?.bottom) return null;

        const color = getColor(pattern);
        const leftRim = points.leftRim ? { x: indexToX(points.leftRim.index), y: priceToY(points.leftRim.price) } : null;
        const bottom = { x: indexToX(points.bottom.index), y: priceToY(points.bottom.price) };
        const rightRim = points.rightRim ? { x: indexToX(points.rightRim.index), y: priceToY(points.rightRim.price) } : null;

        const startX = leftRim?.x || bottom.x - 50;
        const startY = leftRim?.y || bottom.y - 30;
        const endX = rightRim?.x || bottom.x + 50;
        const endY = rightRim?.y || bottom.y - 30;

        return (
            <g>
                {/* Cup curve */}
                <PatternPath
                    $color={color}
                    d={`M ${startX} ${startY} Q ${bottom.x} ${bottom.y + 20} ${endX} ${endY}`}
                />
                {/* Handle */}
                {points.handleTop && (
                    <PatternPath
                        $color={color}
                        d={`M ${endX} ${endY} Q ${endX + 20} ${endY + 15} ${endX + 30} ${endY}`}
                    />
                )}
                {/* Markers */}
                <CandleMarker cx={bottom.x} cy={bottom.y} r="6" $color={color} />
                {leftRim && <CandleMarker cx={leftRim.x} cy={leftRim.y} r="4" $color={color} />}
                {rightRim && <CandleMarker cx={rightRim.x} cy={rightRim.y} r="4" $color={color} />}
            </g>
        );
    };

    // Draw Rounding pattern
    const drawRounding = (pattern) => {
        const points = pattern.points;
        if (!points?.curvePoints || points.curvePoints.length < 3) {
            // Fallback to simple arc
            const bottom = points?.bottom || points?.top;
            if (!bottom) return null;

            const color = getColor(pattern);
            const center = { x: indexToX(bottom.index), y: priceToY(bottom.price) };

            return (
                <g>
                    <CandleMarker cx={center.x} cy={center.y} r="8" $color={color} />
                </g>
            );
        }

        const color = getColor(pattern);
        const curvePoints = points.curvePoints.map(p => ({
            x: indexToX(p.index),
            y: priceToY(p.price)
        }));

        // Create smooth curve through points
        let pathD = `M ${curvePoints[0].x} ${curvePoints[0].y}`;
        for (let i = 1; i < curvePoints.length; i++) {
            const prev = curvePoints[i - 1];
            const curr = curvePoints[i];
            const cpX = (prev.x + curr.x) / 2;
            pathD += ` Q ${cpX} ${curr.y} ${curr.x} ${curr.y}`;
        }

        return (
            <g>
                <PatternPath $color={color} d={pathD} />
                {curvePoints.map((p, i) => (
                    <CandleMarker key={i} cx={p.x} cy={p.y} r="4" $color={color} />
                ))}
            </g>
        );
    };

    // Draw Single Candlestick Pattern (Doji, Hammer, etc.)
    const drawSingleCandle = (pattern) => {
        const points = pattern.points;
        if (points?.index === undefined) return null;

        const color = getColor(pattern);
        const x = indexToX(points.index);
        const y = priceToY(points.price);
        const isBullish = PATTERN_TYPES[pattern.pattern] === 'bullish';

        return (
            <g>
                {/* Candle marker */}
                <CandleMarker cx={x} cy={y} r="8" $color={color} />
                {/* Direction arrow */}
                <ArrowMarker
                    $color={color}
                    d={isBullish
                        ? `M ${x - 6} ${y - 18} L ${x} ${y - 26} L ${x + 6} ${y - 18} Z`
                        : `M ${x - 6} ${y + 18} L ${x} ${y + 26} L ${x + 6} ${y + 18} Z`
                    }
                />
            </g>
        );
    };

    // Draw Two-Candle Pattern (Engulfing, etc.)
    const drawTwoCandle = (pattern) => {
        const points = pattern.points;
        let p1, p2;

        if (points?.engulfed && points?.engulfing) {
            p1 = { x: indexToX(points.engulfed.index), y: priceToY(points.engulfed.price) };
            p2 = { x: indexToX(points.engulfing.index), y: priceToY(points.engulfing.price) };
        } else if (points?.first && points?.second) {
            p1 = { x: indexToX(points.first.index), y: priceToY(points.first.price) };
            p2 = { x: indexToX(points.second.index), y: priceToY(points.second.price) };
        } else {
            return null;
        }

        const color = getColor(pattern);

        return (
            <g>
                {/* Connection line */}
                <TrendLine x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} $color={color} $dashed />
                {/* Markers */}
                <CandleMarker cx={p1.x} cy={p1.y} r="5" $color={color} />
                <CandleMarker cx={p2.x} cy={p2.y} r="7" $color={color} />
            </g>
        );
    };

    // Draw Three-Candle Pattern (Morning Star, etc.)
    const drawThreeCandle = (pattern) => {
        const points = pattern.points;
        if (!points?.first || !points?.third) return null;

        const color = getColor(pattern);
        const p1 = { x: indexToX(points.first.index), y: priceToY(points.first.price) };
        const p2 = points.star
            ? { x: indexToX(points.star.index), y: priceToY(points.star.price) }
            : points.second
                ? { x: indexToX(points.second.index), y: priceToY(points.second.price) }
                : { x: (p1.x + indexToX(points.third.index)) / 2, y: p1.y };
        const p3 = { x: indexToX(points.third.index), y: priceToY(points.third.price) };

        return (
            <g>
                {/* Connection lines */}
                <TrendLine x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} $color={color} $dashed />
                <TrendLine x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} $color={color} $dashed />
                {/* Markers */}
                <CandleMarker cx={p1.x} cy={p1.y} r="5" $color={color} />
                <CandleMarker cx={p2.x} cy={p2.y} r="4" $color={color} />
                <CandleMarker cx={p3.x} cy={p3.y} r="6" $color={color} />
            </g>
        );
    };

    // Draw Support/Resistance
    const drawSupportResistance = (pattern) => {
        const points = pattern.points;
        if (points?.resistance === undefined && points?.support === undefined) return null;

        const resistance = points.resistance ? priceToY(points.resistance) : null;
        const support = points.support ? priceToY(points.support) : null;

        return (
            <g>
                {resistance !== null && (
                    <LevelLine x1={0} y1={resistance} x2={chartWidth} y2={resistance} $color="#ef4444" />
                )}
                {support !== null && (
                    <LevelLine x1={0} y1={support} x2={chartWidth} y2={support} $color="#10b981" />
                )}
            </g>
        );
    };

    // ============ MAIN RENDER LOGIC ============

    const renderPatternShape = (pattern) => {
        const patternType = pattern.pattern;

        // Head & Shoulders
        if (patternType === 'HEAD_SHOULDERS' || patternType === 'HEAD_SHOULDERS_INVERSE') {
            return drawHeadShoulders(pattern);
        }

        // Double Top/Bottom
        if (patternType === 'DOUBLE_TOP' || patternType === 'DOUBLE_BOTTOM') {
            return drawDoubleTopBottom(pattern);
        }

        // Triple Top/Bottom
        if (patternType === 'TRIPLE_TOP' || patternType === 'TRIPLE_BOTTOM') {
            return drawTriple(pattern);
        }

        // Triangles, Wedges, Broadening
        if (patternType?.includes('TRIANGLE') || patternType?.includes('WEDGE') || patternType?.includes('BROADENING')) {
            return drawTriangleWedge(pattern);
        }

        // Flags and Pennants
        if (patternType?.includes('FLAG') || patternType?.includes('PENNANT')) {
            return drawFlagPennant(pattern);
        }

        // Cup & Handle
        if (patternType === 'CUP_HANDLE') {
            return drawCupHandle(pattern);
        }

        // Rounding patterns
        if (patternType?.includes('ROUNDING')) {
            return drawRounding(pattern);
        }

        // Single candle patterns
        if (['DOJI', 'HAMMER', 'HANGING_MAN', 'INVERTED_HAMMER', 'SHOOTING_STAR', 'MARUBOZU'].includes(patternType)) {
            return drawSingleCandle(pattern);
        }

        // Two-candle patterns
        if (['BULLISH_ENGULFING', 'BEARISH_ENGULFING', 'PIERCING_LINE', 'DARK_CLOUD_COVER'].includes(patternType)) {
            return drawTwoCandle(pattern);
        }

        // Three-candle patterns
        if (['MORNING_STAR', 'EVENING_STAR', 'THREE_WHITE_SOLDIERS', 'THREE_BLACK_CROWS'].includes(patternType)) {
            return drawThreeCandle(pattern);
        }

        // Support/Resistance
        if (patternType === 'SUPPORT_RESISTANCE') {
            return drawSupportResistance(pattern);
        }

        // Fallback: just show a marker at currentPrice
        if (pattern.currentPrice) {
            const y = priceToY(pattern.currentPrice);
            return <CandleMarker cx={chartWidth * 0.9} cy={y} r="6" $color={getColor(pattern)} />;
        }

        return null;
    };

    // Get badge position for pattern
    const getBadgePosition = (pattern) => {
        const points = pattern.points;

        // Try to find a good position based on pattern type
        if (points?.head) {
            return { x: indexToX(points.head.index), y: priceToY(points.head.price) - 40 };
        }
        if (points?.peak1 && points?.peak2) {
            const x = (indexToX(points.peak1.index) + indexToX(points.peak2.index)) / 2;
            const y = Math.min(priceToY(points.peak1.price), priceToY(points.peak2.price)) - 30;
            return { x, y };
        }
        if (points?.trough1 && points?.trough2) {
            const x = (indexToX(points.trough1.index) + indexToX(points.trough2.index)) / 2;
            const y = Math.max(priceToY(points.trough1.price), priceToY(points.trough2.price)) + 30;
            return { x, y };
        }
        if (points?.third) {
            return { x: indexToX(points.third.index), y: priceToY(points.third.price) - 35 };
        }
        if (points?.upperEnd && points?.lowerEnd) {
            const x = (indexToX(points.upperEnd.index) + indexToX(points.lowerEnd.index)) / 2;
            const y = (priceToY(points.upperEnd.price) + priceToY(points.lowerEnd.price)) / 2 - 30;
            return { x, y };
        }
        if (points?.poleEnd) {
            return { x: indexToX(points.poleEnd.index) + 30, y: priceToY(points.poleEnd.price) - 20 };
        }
        if (points?.bottom) {
            return { x: indexToX(points.bottom.index), y: priceToY(points.bottom.price) + 35 };
        }
        if (points?.index !== undefined) {
            const isBullish = PATTERN_TYPES[pattern.pattern] === 'bullish';
            return { x: indexToX(points.index), y: priceToY(points.price) + (isBullish ? -45 : 45) };
        }
        if (points?.engulfing) {
            return { x: indexToX(points.engulfing.index), y: priceToY(points.engulfing.price) - 35 };
        }
        if (pattern.currentPrice) {
            return { x: chartWidth * 0.85, y: priceToY(pattern.currentPrice) - 20 };
        }

        return null;
    };

    // Render badge
    const renderBadge = (pattern, index) => {
        const pos = getBadgePosition(pattern);
        if (!pos || isNaN(pos.x) || isNaN(pos.y)) return null;

        const color = getColor(pattern);
        const name = getShortName(pattern);
        const confidence = pattern.confidence?.toFixed(0) || '?';
        const badgeWidth = Math.max(55, name.length * 7 + 20);
        const badgeHeight = 28;

        // Clamp to chart bounds
        const x = Math.max(badgeWidth / 2 + 5, Math.min(chartWidth - badgeWidth / 2 - 5, pos.x));
        const y = Math.max(badgeHeight + 5, Math.min(chartHeight - badgeHeight - 5, pos.y));

        return (
            <BadgeGroup key={`badge-${index}`}>
                <BadgeRect
                    x={x - badgeWidth / 2}
                    y={y - badgeHeight / 2}
                    width={badgeWidth}
                    height={badgeHeight}
                    $color={color}
                />
                <BadgeText x={x} y={y - 3}>{name}</BadgeText>
                <ConfidenceText x={x} y={y + 9} $color={color}>{confidence}%</ConfidenceText>
            </BadgeGroup>
        );
    };

    // Render tooltip with glass-morphism
    const renderTooltip = () => {
        if (!hoveredPattern) return null;

        const color = getColor(hoveredPattern);
        const name = hoveredPattern.name || hoveredPattern.pattern?.replace(/_/g, ' ') || 'Pattern';
        const confidence = hoveredPattern.confidence?.toFixed(1) || 'N/A';
        const target = hoveredPattern.target?.toFixed(2) || 'N/A';
        const move = hoveredPattern.potentialMove || '0';
        const type = PATTERN_TYPES[hoveredPattern.pattern] || 'neutral';
        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

        const tooltipWidth = 180;
        const tooltipHeight = 110;
        const x = Math.max(5, Math.min(chartWidth - tooltipWidth - 5, tooltipPos.x - tooltipWidth / 2));
        const y = Math.max(5, tooltipPos.y);

        return (
            <TooltipGroup>
                {/* Background with glass effect */}
                <TooltipBg x={x} y={y} width={tooltipWidth} height={tooltipHeight} />
                <TooltipGlassBorder x={x} y={y} width={tooltipWidth} height={tooltipHeight} />

                {/* Header with pattern color */}
                <rect x={x} y={y} width={tooltipWidth} height={28} rx="12" fill={color} />
                <text x={x + tooltipWidth / 2} y={y + 18} fill="white" fontSize="11" fontWeight="bold" textAnchor="middle" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {name}
                </text>

                {/* Pattern type indicator */}
                <text x={x + 12} y={y + 48} fill="#64748b" fontSize="9" style={{ textTransform: 'uppercase' }}>Type:</text>
                <text x={x + tooltipWidth - 12} y={y + 48} fill={color} fontSize="10" fontWeight="600" textAnchor="end">{typeLabel}</text>

                {/* Confidence */}
                <text x={x + 12} y={y + 64} fill="#64748b" fontSize="9" style={{ textTransform: 'uppercase' }}>Confidence:</text>
                <text x={x + tooltipWidth - 12} y={y + 64} fill="white" fontSize="10" fontWeight="600" textAnchor="end">{confidence}%</text>

                {/* Target */}
                <text x={x + 12} y={y + 80} fill="#64748b" fontSize="9" style={{ textTransform: 'uppercase' }}>Target:</text>
                <text x={x + tooltipWidth - 12} y={y + 80} fill={color} fontSize="10" fontWeight="600" textAnchor="end">${target}</text>

                {/* Potential move */}
                <text x={x + 12} y={y + 96} fill="#64748b" fontSize="9" style={{ textTransform: 'uppercase' }}>Move:</text>
                <text x={x + tooltipWidth - 12} y={y + 96} fill={parseFloat(move) >= 0 ? '#10b981' : '#ef4444'} fontSize="10" fontWeight="bold" textAnchor="end">
                    {parseFloat(move) >= 0 ? '+' : ''}{move}%
                </text>
            </TooltipGroup>
        );
    };

    // Render complete pattern (shape + badge)
    const renderPattern = (pattern, index) => {
        const shape = renderPatternShape(pattern);
        const badge = renderBadge(pattern, index);

        if (!shape && !badge) return null;

        return (
            <PatternGroup
                key={`pattern-${index}`}
                $index={index}
                onMouseEnter={() => {
                    setHoveredPattern(pattern);
                    const pos = getBadgePosition(pattern);
                    if (pos) setTooltipPos({ x: pos.x, y: pos.y - 50 });
                }}
                onMouseLeave={() => setHoveredPattern(null)}
            >
                {shape}
                {badge}
            </PatternGroup>
        );
    };

    return (
        <OverlayContainer viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <defs>
                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>

                {/* Enhanced shadow filter */}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.4)"/>
                </filter>

                {/* Bullish gradient - green */}
                <linearGradient id="bullishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0.02)" />
                </linearGradient>

                {/* Bearish gradient - red */}
                <linearGradient id="bearishGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="rgba(239, 68, 68, 0.25)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0.02)" />
                </linearGradient>

                {/* Neutral gradient - purple */}
                <linearGradient id="neutralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
                    <stop offset="100%" stopColor="rgba(139, 92, 246, 0.02)" />
                </linearGradient>

                {/* Radial glow for markers */}
                <radialGradient id="markerGlow">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </radialGradient>
            </defs>
            {patterns.map((pattern, index) => renderPattern(pattern, index))}
            {renderTooltip()}
        </OverlayContainer>
    );
};

export default PatternOverlay;
