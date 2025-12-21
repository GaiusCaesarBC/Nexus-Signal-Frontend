// client/src/components/PatternOverlay.js - ENHANCED VISUAL PATTERN OVERLAYS
// Draws patterns on chart with animations, glow effects, and interactive tooltips

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// ============ ANIMATIONS ============

const fadeSlideIn = keyframes`
    0% {
        opacity: 0;
        transform: translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
`;

const pulseGlow = keyframes`
    0%, 100% {
        filter: drop-shadow(0 0 3px currentColor);
    }
    50% {
        filter: drop-shadow(0 0 8px currentColor);
    }
`;

const drawLine = keyframes`
    0% {
        stroke-dashoffset: 1000;
    }
    100% {
        stroke-dashoffset: 0;
    }
`;

// ============ STYLED COMPONENTS ============

const OverlayContainer = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    overflow: visible;
`;

const AnimatedGroup = styled.g`
    animation: ${fadeSlideIn} 0.5s ease-out forwards;
    animation-delay: ${props => props.$delay || '0s'};
    opacity: 0;

    ${props => props.$confirmed && css`
        animation: ${fadeSlideIn} 0.5s ease-out forwards, ${pulseGlow} 2s ease-in-out infinite;
        animation-delay: ${props.$delay || '0s'}, 0.5s;
    `}
`;

const PatternLine = styled.line`
    stroke: ${props => props.$color || '#00adef'};
    stroke-width: ${props => props.$strokeWidth || 2};
    stroke-dasharray: ${props => props.$dashed ? '5,5' : 'none'};
    opacity: 0.85;
    filter: ${props => props.$glow ? `drop-shadow(0 0 4px ${props.$color})` : 'none'};
`;

const AnimatedLine = styled(PatternLine)`
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: ${drawLine} 1s ease-out forwards;
    animation-delay: ${props => props.$delay || '0s'};
`;

const PatternPath = styled.path`
    stroke: ${props => props.$color || '#00adef'};
    stroke-width: ${props => props.$strokeWidth || 2};
    fill: ${props => props.$fill || 'none'};
    opacity: 0.85;
    filter: ${props => props.$glow ? `drop-shadow(0 0 4px ${props.$color})` : 'none'};
`;

const PatternCircle = styled.circle`
    fill: ${props => props.$color || '#00adef'};
    opacity: 0.7;
    filter: drop-shadow(0 0 3px ${props => props.$color || '#00adef'});
    transition: all 0.2s ease;

    &:hover {
        opacity: 1;
        r: ${props => (parseInt(props.r) || 5) + 2};
    }
`;

const PatternLabel = styled.text`
    fill: ${props => props.$color || '#00adef'};
    font-size: 11px;
    font-weight: 600;
    text-anchor: middle;
    pointer-events: all;
    cursor: pointer;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8));
    transition: all 0.2s ease;

    &:hover {
        font-size: 13px;
        filter: drop-shadow(0 0 6px ${props => props.$color || '#00adef'});
    }
`;

const PatternZone = styled.rect`
    fill: ${props => props.$fill || 'rgba(0, 173, 237, 0.1)'};
    stroke: ${props => props.$strokeColor || '#00adef'};
    stroke-width: 1;
    stroke-dasharray: 3,3;
    opacity: 0.4;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 0.6;
    }
`;

const GradientZone = styled.polygon`
    fill: url(#${props => props.$gradientId});
    opacity: 0.3;
    stroke: ${props => props.$strokeColor || 'transparent'};
    stroke-width: 1;
`;

// Tooltip styled components
const TooltipContainer = styled.foreignObject`
    pointer-events: none;
    overflow: visible;
`;

const TooltipBox = styled.div`
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.$borderColor || 'rgba(255,255,255,0.1)'};
    border-radius: 8px;
    padding: 10px 14px;
    min-width: 160px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
`;

const TooltipTitle = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.$color || '#fff'};
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    margin-top: 4px;

    span:last-child {
        font-weight: 500;
        color: ${props => props.$valueColor || '#fff'};
    }
`;

const TypeBadge = styled.span`
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${props => props.$bg || 'rgba(255,255,255,0.1)'};
    color: ${props => props.$color || '#fff'};
    text-transform: uppercase;
`;

// Candlestick marker
const CandlestickMarker = styled.rect`
    fill: ${props => props.$color || '#00adef'};
    opacity: 0.4;
    stroke: ${props => props.$color || '#00adef'};
    stroke-width: 2;
    rx: 2;
`;

/**
 * Enhanced PatternOverlay Component
 * Draws detected patterns with animations and interactive elements
 */
const PatternOverlay = ({ patterns, chartDimensions, priceScale, timeScale, onPatternClick }) => {
    const [hoveredPattern, setHoveredPattern] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (!patterns || patterns.length === 0 || !chartDimensions) {
        return null;
    }

    const { width, height } = chartDimensions;

    // Convert price to Y coordinate
    const priceToY = (price) => {
        if (!priceScale || !price) return 0;
        const { min, max } = priceScale;
        return height - ((price - min) / (max - min)) * height;
    };

    // Convert index to X coordinate
    const indexToX = (index) => {
        if (!timeScale) return 0;
        const { start, end } = timeScale;
        return ((index - start) / (end - start)) * width;
    };

    // Get color based on pattern type
    const getColor = (pattern) => {
        if (pattern.type === 'bullish') return '#10b981';
        if (pattern.type === 'bearish') return '#ef4444';
        return '#8b5cf6'; // neutral
    };

    // Handle pattern hover
    const handlePatternHover = (pattern, event, x, y) => {
        setHoveredPattern(pattern);
        setTooltipPos({ x: x || event?.clientX || 0, y: y || event?.clientY || 0 });
    };

    // ============ PATTERN DRAWING FUNCTIONS ============

    const drawHeadShoulders = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);

        if (!points?.leftShoulder || !points?.head || !points?.rightShoulder) return null;

        const ls = { x: indexToX(points.leftShoulder.index), y: priceToY(points.leftShoulder.price) };
        const h = { x: indexToX(points.head.index), y: priceToY(points.head.price) };
        const rs = { x: indexToX(points.rightShoulder.index), y: priceToY(points.rightShoulder.price) };
        const necklineY = priceToY(points.neckline);

        return (
            <AnimatedGroup key={`hs-${index}`} $delay={`${index * 0.1}s`} $confirmed={pattern.status === 'confirmed'}>
                <defs>
                    <linearGradient id={`hs-grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Pattern fill zone */}
                <GradientZone
                    points={`${ls.x},${necklineY} ${ls.x},${ls.y} ${h.x},${h.y} ${rs.x},${rs.y} ${rs.x},${necklineY}`}
                    $gradientId={`hs-grad-${index}`}
                />

                {/* Peaks */}
                <PatternCircle cx={ls.x} cy={ls.y} r="5" $color={color} />
                <PatternCircle cx={h.x} cy={h.y} r="7" $color={color} />
                <PatternCircle cx={rs.x} cy={rs.y} r="5" $color={color} />

                {/* Lines */}
                <AnimatedLine x1={ls.x} y1={ls.y} x2={h.x} y2={h.y} $color={color} $glow $delay="0.2s" />
                <AnimatedLine x1={h.x} y1={h.y} x2={rs.x} y2={rs.y} $color={color} $glow $delay="0.4s" />

                {/* Neckline */}
                <PatternLine x1={ls.x} y1={necklineY} x2={rs.x} y2={necklineY} $color={color} $dashed />

                {/* Label */}
                <PatternLabel
                    x={(ls.x + rs.x) / 2}
                    y={h.y - 25}
                    $color={color}
                    onMouseEnter={(e) => handlePatternHover(pattern, e, (ls.x + rs.x) / 2, h.y - 60)}
                    onMouseLeave={() => setHoveredPattern(null)}
                    onClick={() => onPatternClick?.(pattern)}
                >
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawDoubleTopBottom = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);

        if (!points?.first || !points?.second) return null;

        const p1 = { x: indexToX(points.first.index), y: priceToY(points.first.price) };
        const p2 = { x: indexToX(points.second.index), y: priceToY(points.second.price) };
        const necklineY = priceToY(points.neckline);

        return (
            <AnimatedGroup key={`dt-${index}`} $delay={`${index * 0.1}s`} $confirmed={pattern.status === 'confirmed'}>
                <defs>
                    <linearGradient id={`dt-grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* Fill zone */}
                <GradientZone
                    points={`${p1.x},${necklineY} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p2.x},${necklineY}`}
                    $gradientId={`dt-grad-${index}`}
                />

                {/* Peaks/troughs */}
                <PatternCircle cx={p1.x} cy={p1.y} r="6" $color={color} />
                <PatternCircle cx={p2.x} cy={p2.y} r="6" $color={color} />

                {/* Connection line */}
                <AnimatedLine x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} $color={color} $dashed $glow />

                {/* Neckline */}
                <PatternLine x1={p1.x} y1={necklineY} x2={p2.x} y2={necklineY} $color={color} />

                <PatternLabel
                    x={(p1.x + p2.x) / 2}
                    y={Math.min(p1.y, p2.y) - 20}
                    $color={color}
                    onMouseEnter={(e) => handlePatternHover(pattern, e)}
                    onMouseLeave={() => setHoveredPattern(null)}
                >
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawTripleBottom = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);

        if (!points?.first || !points?.second || !points?.third) return null;

        const p1 = { x: indexToX(points.first.index), y: priceToY(points.first.price) };
        const p2 = { x: indexToX(points.second.index), y: priceToY(points.second.price) };
        const p3 = { x: indexToX(points.third.index), y: priceToY(points.third.price) };
        const necklineY = priceToY(points.neckline);

        return (
            <AnimatedGroup key={`tb-${index}`} $delay={`${index * 0.1}s`} $confirmed={pattern.status === 'confirmed'}>
                <defs>
                    <linearGradient id={`tb-grad-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                <GradientZone
                    points={`${p1.x},${necklineY} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p3.x},${necklineY}`}
                    $gradientId={`tb-grad-${index}`}
                />

                <PatternCircle cx={p1.x} cy={p1.y} r="6" $color={color} />
                <PatternCircle cx={p2.x} cy={p2.y} r="6" $color={color} />
                <PatternCircle cx={p3.x} cy={p3.y} r="6" $color={color} />

                <AnimatedLine x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} $color={color} $dashed $delay="0.2s" />
                <AnimatedLine x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} $color={color} $dashed $delay="0.4s" />

                <PatternLine x1={p1.x} y1={necklineY} x2={p3.x} y2={necklineY} $color={color} />

                <PatternLabel x={(p1.x + p3.x) / 2} y={Math.max(p1.y, p2.y, p3.y) + 25} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawTriangle = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);
        const isAscending = pattern.pattern === 'ASCENDING_TRIANGLE';

        if (isAscending && !points?.resistance) return null;
        if (!isAscending && !points?.support) return null;

        const apexX = points?.apex?.index ? indexToX(points.apex.index) : width * 0.8;
        const startX = Math.max(0, apexX - 200);

        if (isAscending) {
            const resistanceY = priceToY(points.resistance);
            const supportStartY = priceToY(points.supportStart);
            const supportEndY = priceToY(points.supportEnd);

            return (
                <AnimatedGroup key={`tri-${index}`} $delay={`${index * 0.1}s`}>
                    <defs>
                        <linearGradient id={`tri-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    <GradientZone
                        points={`${startX},${resistanceY} ${apexX},${resistanceY} ${apexX},${supportEndY} ${startX},${supportStartY}`}
                        $gradientId={`tri-grad-${index}`}
                    />

                    <AnimatedLine x1={startX} y1={resistanceY} x2={apexX} y2={resistanceY} $color={color} $glow />
                    <AnimatedLine x1={startX} y1={supportStartY} x2={apexX} y2={supportEndY} $color={color} $glow $delay="0.2s" />

                    <PatternCircle cx={apexX} cy={(resistanceY + supportEndY) / 2} r="4" $color={color} />

                    <PatternLabel x={(startX + apexX) / 2} y={resistanceY - 15} $color={color}>
                        {pattern.name}
                    </PatternLabel>
                </AnimatedGroup>
            );
        } else {
            const supportY = priceToY(points.support);
            const resistanceStartY = priceToY(points.resistanceStart);
            const resistanceEndY = priceToY(points.resistanceEnd);

            return (
                <AnimatedGroup key={`tri-${index}`} $delay={`${index * 0.1}s`}>
                    <defs>
                        <linearGradient id={`tri-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    <GradientZone
                        points={`${startX},${supportY} ${apexX},${supportY} ${apexX},${resistanceEndY} ${startX},${resistanceStartY}`}
                        $gradientId={`tri-grad-${index}`}
                    />

                    <AnimatedLine x1={startX} y1={supportY} x2={apexX} y2={supportY} $color={color} $glow />
                    <AnimatedLine x1={startX} y1={resistanceStartY} x2={apexX} y2={resistanceEndY} $color={color} $glow $delay="0.2s" />

                    <PatternLabel x={(startX + apexX) / 2} y={resistanceStartY - 15} $color={color}>
                        {pattern.name}
                    </PatternLabel>
                </AnimatedGroup>
            );
        }
    };

    const drawFlag = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);

        if (!points?.poleStart || !points?.poleEnd) return null;

        const poleStartX = indexToX(points.poleStart.index);
        const poleStartY = priceToY(points.poleStart.price);
        const poleEndX = indexToX(points.poleEnd.index);
        const poleEndY = priceToY(points.poleEnd.price);
        const flagHighY = priceToY(points.flagHigh);
        const flagLowY = priceToY(points.flagLow);
        const flagEndX = poleEndX + 80;

        return (
            <AnimatedGroup key={`flag-${index}`} $delay={`${index * 0.1}s`}>
                {/* Pole with glow */}
                <AnimatedLine
                    x1={poleStartX} y1={poleStartY}
                    x2={poleEndX} y2={poleEndY}
                    $color={color} $strokeWidth={3} $glow
                />
                <PatternCircle cx={poleStartX} cy={poleStartY} r="5" $color={color} />
                <PatternCircle cx={poleEndX} cy={poleEndY} r="5" $color={color} />

                {/* Flag zone */}
                <PatternZone
                    x={poleEndX} y={flagHighY}
                    width={flagEndX - poleEndX}
                    height={flagLowY - flagHighY}
                    $fill={`${color}20`}
                    $strokeColor={color}
                />

                <PatternLabel x={(poleEndX + flagEndX) / 2} y={flagHighY - 12} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawPennant = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);

        if (!points?.poleStart || !points?.poleEnd) return null;

        const poleStartX = indexToX(points.poleStart.index);
        const poleStartY = priceToY(points.poleStart.price);
        const poleEndX = indexToX(points.poleEnd.index);
        const poleEndY = priceToY(points.poleEnd.price);
        const pennantHighY = priceToY(points.pennantHigh);
        const pennantLowY = priceToY(points.pennantLow);
        const apexX = points?.apex?.index ? indexToX(points.apex.index) : poleEndX + 100;
        const apexY = (pennantHighY + pennantLowY) / 2;

        return (
            <AnimatedGroup key={`pennant-${index}`} $delay={`${index * 0.1}s`}>
                <defs>
                    <linearGradient id={`pennant-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Pole */}
                <AnimatedLine
                    x1={poleStartX} y1={poleStartY}
                    x2={poleEndX} y2={poleEndY}
                    $color={color} $strokeWidth={3} $glow
                />

                {/* Pennant triangle */}
                <GradientZone
                    points={`${poleEndX},${pennantHighY} ${apexX},${apexY} ${poleEndX},${pennantLowY}`}
                    $gradientId={`pennant-grad-${index}`}
                    $strokeColor={color}
                />

                <AnimatedLine x1={poleEndX} y1={pennantHighY} x2={apexX} y2={apexY} $color={color} $delay="0.3s" />
                <AnimatedLine x1={poleEndX} y1={pennantLowY} x2={apexX} y2={apexY} $color={color} $delay="0.4s" />

                <PatternLabel x={(poleEndX + apexX) / 2} y={pennantHighY - 12} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawWedge = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);

        if (!points?.upperStart || !points?.upperEnd || !points?.lowerStart || !points?.lowerEnd) return null;

        const us = { x: indexToX(points.upperStart.index), y: priceToY(points.upperStart.price) };
        const ue = { x: indexToX(points.upperEnd.index), y: priceToY(points.upperEnd.price) };
        const ls = { x: indexToX(points.lowerStart.index), y: priceToY(points.lowerStart.price) };
        const le = { x: indexToX(points.lowerEnd.index), y: priceToY(points.lowerEnd.price) };

        return (
            <AnimatedGroup key={`wedge-${index}`} $delay={`${index * 0.1}s`}>
                <defs>
                    <linearGradient id={`wedge-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                <GradientZone
                    points={`${us.x},${us.y} ${ue.x},${ue.y} ${le.x},${le.y} ${ls.x},${ls.y}`}
                    $gradientId={`wedge-grad-${index}`}
                />

                <AnimatedLine x1={us.x} y1={us.y} x2={ue.x} y2={ue.y} $color={color} $glow />
                <AnimatedLine x1={ls.x} y1={ls.y} x2={le.x} y2={le.y} $color={color} $glow $delay="0.2s" />

                <PatternCircle cx={us.x} cy={us.y} r="4" $color={color} />
                <PatternCircle cx={ue.x} cy={ue.y} r="4" $color={color} />
                <PatternCircle cx={ls.x} cy={ls.y} r="4" $color={color} />
                <PatternCircle cx={le.x} cy={le.y} r="4" $color={color} />

                <PatternLabel x={(us.x + ue.x) / 2} y={Math.min(us.y, ue.y) - 15} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawCupHandle = (pattern, index) => {
        const { points } = pattern;
        const color = '#10b981';

        if (!points?.leftRim || !points?.bottom || !points?.rightRim) return null;

        const lr = { x: indexToX(points.leftRim.index), y: priceToY(points.leftRim.price) };
        const b = { x: indexToX(points.bottom.index), y: priceToY(points.bottom.price) };
        const rr = { x: indexToX(points.rightRim.index), y: priceToY(points.rightRim.price) };
        const handleLowY = priceToY(points.handleLow);
        const handleEndX = rr.x + 60;

        // Bezier curve for smooth cup shape
        const cupPath = `M ${lr.x} ${lr.y} Q ${(lr.x + b.x) / 2} ${b.y + 20}, ${b.x} ${b.y} Q ${(b.x + rr.x) / 2} ${b.y + 20}, ${rr.x} ${rr.y}`;

        return (
            <AnimatedGroup key={`cup-${index}`} $delay={`${index * 0.1}s`} $confirmed={pattern.status === 'confirmed'}>
                <defs>
                    <linearGradient id={`cup-grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.02" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.25" />
                    </linearGradient>
                </defs>

                {/* Cup curve with bezier */}
                <PatternPath d={cupPath} $color={color} $strokeWidth={2} $glow />

                {/* Rim points */}
                <PatternCircle cx={lr.x} cy={lr.y} r="5" $color={color} />
                <PatternCircle cx={b.x} cy={b.y} r="7" $color={color} />
                <PatternCircle cx={rr.x} cy={rr.y} r="5" $color={color} />

                {/* Handle zone */}
                <PatternZone
                    x={rr.x} y={rr.y}
                    width={handleEndX - rr.x}
                    height={handleLowY - rr.y}
                    $fill={`${color}15`}
                    $strokeColor={color}
                />

                <PatternLabel x={(lr.x + handleEndX) / 2} y={lr.y - 20} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawRoundingPattern = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);
        const isBottom = pattern.pattern === 'ROUNDING_BOTTOM';

        if (!points?.curvePoints || points.curvePoints.length < 3) return null;

        const cp = points.curvePoints.map(p => ({
            x: indexToX(p.index),
            y: priceToY(p.price)
        }));

        // Create smooth curve through points
        const curvePath = isBottom
            ? `M ${cp[0].x} ${cp[0].y} Q ${cp[1].x} ${cp[1].y + 30}, ${cp[2].x} ${cp[2].y}`
            : `M ${cp[0].x} ${cp[0].y} Q ${cp[1].x} ${cp[1].y - 30}, ${cp[2].x} ${cp[2].y}`;

        return (
            <AnimatedGroup key={`round-${index}`} $delay={`${index * 0.1}s`}>
                <PatternPath d={curvePath} $color={color} $strokeWidth={2} $glow />

                {cp.map((p, i) => (
                    <PatternCircle key={i} cx={p.x} cy={p.y} r={i === 1 ? 6 : 4} $color={color} />
                ))}

                <PatternLabel
                    x={cp[1].x}
                    y={isBottom ? cp[1].y + 30 : cp[1].y - 25}
                    $color={color}
                >
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawBroadeningPattern = (pattern, index) => {
        const { points } = pattern;
        const color = getColor(pattern);

        if (!points?.upperStart || !points?.upperEnd || !points?.lowerStart || !points?.lowerEnd) return null;

        const us = { x: indexToX(points.upperStart.index), y: priceToY(points.upperStart.price) };
        const ue = { x: indexToX(points.upperEnd.index), y: priceToY(points.upperEnd.price) };
        const ls = { x: indexToX(points.lowerStart.index), y: priceToY(points.lowerStart.price) };
        const le = { x: indexToX(points.lowerEnd.index), y: priceToY(points.lowerEnd.price) };

        return (
            <AnimatedGroup key={`broad-${index}`} $delay={`${index * 0.1}s`}>
                <defs>
                    <linearGradient id={`broad-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.05" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                    </linearGradient>
                </defs>

                <GradientZone
                    points={`${us.x},${us.y} ${ue.x},${ue.y} ${le.x},${le.y} ${ls.x},${ls.y}`}
                    $gradientId={`broad-grad-${index}`}
                />

                <AnimatedLine x1={us.x} y1={us.y} x2={ue.x} y2={ue.y} $color={color} $glow />
                <AnimatedLine x1={ls.x} y1={ls.y} x2={le.x} y2={le.y} $color={color} $glow $delay="0.2s" />

                <PatternLabel x={(us.x + ue.x) / 2} y={Math.min(us.y, ue.y) - 15} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    const drawCandlestickPattern = (pattern, index) => {
        const color = getColor(pattern);
        const candleIndex = pattern.points?.index;

        if (candleIndex === undefined) return null;

        const x = indexToX(candleIndex);
        const y = priceToY(pattern.points.price);

        return (
            <AnimatedGroup key={`candle-${index}`} $delay={`${index * 0.05}s`}>
                {/* Highlight marker */}
                <CandlestickMarker
                    x={x - 15} y={y - 25}
                    width={30} height={50}
                    $color={color}
                />

                {/* Small icon */}
                <PatternCircle cx={x} cy={y - 35} r="8" $color={color} />

                <PatternLabel x={x} y={y - 55} $color={color} style={{ fontSize: '10px' }}>
                    {pattern.name?.split(' ')[0] || pattern.pattern}
                </PatternLabel>
            </AnimatedGroup>
        );
    };

    // Render tooltip
    const renderTooltip = () => {
        if (!hoveredPattern) return null;

        const color = getColor(hoveredPattern);
        const typeColors = {
            bullish: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
            bearish: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' },
            neutral: { bg: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }
        };
        const typeStyle = typeColors[hoveredPattern.type] || typeColors.neutral;

        return (
            <TooltipContainer x={tooltipPos.x - 80} y={tooltipPos.y - 120} width="180" height="100">
                <TooltipBox $borderColor={color}>
                    <TooltipTitle $color={color}>
                        {hoveredPattern.name}
                        <TypeBadge $bg={typeStyle.bg} $color={typeStyle.color}>
                            {hoveredPattern.type}
                        </TypeBadge>
                    </TooltipTitle>
                    <TooltipRow>
                        <span>Confidence</span>
                        <span>{hoveredPattern.confidence?.toFixed(0) || 'N/A'}%</span>
                    </TooltipRow>
                    <TooltipRow $valueColor={color}>
                        <span>Target</span>
                        <span>${hoveredPattern.target?.toFixed(2) || 'N/A'}</span>
                    </TooltipRow>
                    <TooltipRow $valueColor={hoveredPattern.potentialMove > 0 ? '#10b981' : '#ef4444'}>
                        <span>Potential</span>
                        <span>{hoveredPattern.potentialMove > 0 ? '+' : ''}{hoveredPattern.potentialMove}%</span>
                    </TooltipRow>
                </TooltipBox>
            </TooltipContainer>
        );
    };

    // Main render
    return (
        <OverlayContainer>
            {patterns.map((pattern, index) => {
                switch (pattern.pattern) {
                    case 'HEAD_SHOULDERS':
                    case 'HEAD_SHOULDERS_INVERSE':
                        return drawHeadShoulders(pattern, index);

                    case 'DOUBLE_TOP':
                    case 'DOUBLE_BOTTOM':
                        return drawDoubleTopBottom(pattern, index);

                    case 'TRIPLE_TOP':
                    case 'TRIPLE_BOTTOM':
                        return drawTripleBottom(pattern, index);

                    case 'ASCENDING_TRIANGLE':
                    case 'DESCENDING_TRIANGLE':
                        return drawTriangle(pattern, index);

                    case 'BULL_FLAG':
                    case 'BEAR_FLAG':
                        return drawFlag(pattern, index);

                    case 'BULL_PENNANT':
                    case 'BEAR_PENNANT':
                        return drawPennant(pattern, index);

                    case 'RISING_WEDGE':
                    case 'FALLING_WEDGE':
                        return drawWedge(pattern, index);

                    case 'CUP_HANDLE':
                        return drawCupHandle(pattern, index);

                    case 'ROUNDING_BOTTOM':
                    case 'ROUNDING_TOP':
                        return drawRoundingPattern(pattern, index);

                    case 'BROADENING_TOP':
                    case 'BROADENING_BOTTOM':
                        return drawBroadeningPattern(pattern, index);

                    // Candlestick patterns
                    case 'DOJI':
                    case 'HAMMER':
                    case 'HANGING_MAN':
                    case 'INVERTED_HAMMER':
                    case 'SHOOTING_STAR':
                    case 'BULLISH_ENGULFING':
                    case 'BEARISH_ENGULFING':
                    case 'MORNING_STAR':
                    case 'EVENING_STAR':
                    case 'THREE_WHITE_SOLDIERS':
                    case 'THREE_BLACK_CROWS':
                    case 'PIERCING_LINE':
                    case 'DARK_CLOUD_COVER':
                    case 'MARUBOZU':
                        return drawCandlestickPattern(pattern, index);

                    default:
                        return null;
                }
            })}
            {renderTooltip()}
        </OverlayContainer>
    );
};

export default PatternOverlay;
