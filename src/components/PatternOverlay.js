// client/src/components/PatternOverlay.js - VISUAL PATTERN OVERLAYS ON CHART
// This draws the patterns directly on your chart with SVG overlays

import React from 'react';
import styled from 'styled-components';

const OverlayContainer = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
`;

const PatternLine = styled.line`
    stroke: ${props => props.$color || '#00adef'};
    stroke-width: 2;
    stroke-dasharray: ${props => props.$dashed ? '5,5' : 'none'};
    opacity: 0.8;
`;

const PatternCircle = styled.circle`
    fill: ${props => props.$color || '#00adef'};
    opacity: 0.6;
`;

const PatternLabel = styled.text`
    fill: ${props => props.$color || '#00adef'};
    font-size: 12px;
    font-weight: bold;
    text-anchor: middle;
    pointer-events: all;
    cursor: pointer;
`;

const PatternZone = styled.rect`
    fill: ${props => props.$color || 'rgba(0, 173, 237, 0.1)'};
    stroke: ${props => props.$strokeColor || '#00adef'};
    stroke-width: 1;
    stroke-dasharray: 3,3;
    opacity: 0.3;
`;

/**
 * PatternOverlay Component
 * Draws detected patterns visually on the chart
 */
const PatternOverlay = ({ patterns, chartDimensions, priceScale, timeScale }) => {
    if (!patterns || patterns.length === 0 || !chartDimensions) {
        return null;
    }

    // Convert price to Y coordinate
    const priceToY = (price) => {
        const { height } = chartDimensions;
        const { min, max } = priceScale;
        return height - ((price - min) / (max - min)) * height;
    };

    // Convert index to X coordinate
    const indexToX = (index) => {
        const { width } = chartDimensions;
        const { start, end } = timeScale;
        return ((index - start) / (end - start)) * width;
    };

    /**
     * Draw Head and Shoulders pattern
     */
    const drawHeadShoulders = (pattern, index) => {
        const { points } = pattern;
        const color = pattern.type === 'bullish' ? '#10b981' : '#ef4444';
        
        if (!points.leftShoulder || !points.head || !points.rightShoulder) return null;

        const ls = { x: indexToX(points.leftShoulder.index), y: priceToY(points.leftShoulder.price) };
        const h = { x: indexToX(points.head.index), y: priceToY(points.head.price) };
        const rs = { x: indexToX(points.rightShoulder.index), y: priceToY(points.rightShoulder.price) };
        const necklineY = priceToY(points.neckline);

        return (
            <g key={`hs-${index}`}>
                {/* Draw peaks */}
                <PatternCircle cx={ls.x} cy={ls.y} r="5" $color={color} />
                <PatternCircle cx={h.x} cy={h.y} r="6" $color={color} />
                <PatternCircle cx={rs.x} cy={rs.y} r="5" $color={color} />
                
                {/* Connect peaks */}
                <PatternLine x1={ls.x} y1={ls.y} x2={h.x} y2={h.y} $color={color} />
                <PatternLine x1={h.x} y1={h.y} x2={rs.x} y2={rs.y} $color={color} />
                
                {/* Neckline */}
                <PatternLine 
                    x1={ls.x} 
                    y1={necklineY} 
                    x2={rs.x} 
                    y2={necklineY} 
                    $color={color} 
                    $dashed 
                />
                
                {/* Label */}
                <PatternLabel x={(ls.x + rs.x) / 2} y={h.y - 20} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </g>
        );
    };

    /**
     * Draw Double Top/Bottom pattern
     */
    const drawDoubleTopBottom = (pattern, index) => {
        const { points } = pattern;
        const color = pattern.type === 'bullish' ? '#10b981' : '#ef4444';
        
        if (!points.first || !points.second) return null;

        const p1 = { x: indexToX(points.first.index), y: priceToY(points.first.price) };
        const p2 = { x: indexToX(points.second.index), y: priceToY(points.second.price) };
        const necklineY = priceToY(points.neckline);

        return (
            <g key={`dt-${index}`}>
                {/* Draw peaks/troughs */}
                <PatternCircle cx={p1.x} cy={p1.y} r="6" $color={color} />
                <PatternCircle cx={p2.x} cy={p2.y} r="6" $color={color} />
                
                {/* Connect them */}
                <PatternLine x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} $color={color} $dashed />
                
                {/* Neckline */}
                <PatternLine 
                    x1={p1.x} 
                    y1={necklineY} 
                    x2={p2.x} 
                    y2={necklineY} 
                    $color={color} 
                />
                
                {/* Label */}
                <PatternLabel x={(p1.x + p2.x) / 2} y={p1.y - 20} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </g>
        );
    };

    /**
     * Draw Triangle pattern (Ascending/Descending)
     */
    const drawTriangle = (pattern, index) => {
        const { points } = pattern;
        const color = pattern.type === 'bullish' ? '#10b981' : '#ef4444';
        
        if (pattern.pattern === 'ASCENDING_TRIANGLE') {
            // Flat resistance line at top
            const resistanceY = priceToY(points.resistance);
            const supportStartY = priceToY(points.supportStart);
            const supportEndY = priceToY(points.supportEnd);
            const apexX = indexToX(points.apex.index);
            const startX = apexX - 200; // Approximate start

            return (
                <g key={`tri-${index}`}>
                    {/* Resistance line (flat) */}
                    <PatternLine 
                        x1={startX} 
                        y1={resistanceY} 
                        x2={apexX} 
                        y2={resistanceY} 
                        $color={color} 
                    />
                    
                    {/* Support line (rising) */}
                    <PatternLine 
                        x1={startX} 
                        y1={supportStartY} 
                        x2={apexX} 
                        y2={supportEndY} 
                        $color={color} 
                    />
                    
                    {/* Highlight triangle zone */}
                    <PatternZone
                        x={startX}
                        y={resistanceY}
                        width={apexX - startX}
                        height={supportStartY - resistanceY}
                        $color={`${color}20`}
                        $strokeColor={color}
                    />
                    
                    {/* Label */}
                    <PatternLabel x={(startX + apexX) / 2} y={resistanceY - 10} $color={color}>
                        {pattern.name}
                    </PatternLabel>
                </g>
            );
        } else {
            // Descending triangle: declining resistance, flat support
            const supportY = priceToY(points.support);
            const resistanceStartY = priceToY(points.resistanceStart);
            const resistanceEndY = priceToY(points.resistanceEnd);
            const apexX = indexToX(points.apex.index);
            const startX = apexX - 200;

            return (
                <g key={`tri-${index}`}>
                    {/* Support line (flat) */}
                    <PatternLine 
                        x1={startX} 
                        y1={supportY} 
                        x2={apexX} 
                        y2={supportY} 
                        $color={color} 
                    />
                    
                    {/* Resistance line (declining) */}
                    <PatternLine 
                        x1={startX} 
                        y1={resistanceStartY} 
                        x2={apexX} 
                        y2={resistanceEndY} 
                        $color={color} 
                    />
                    
                    {/* Highlight triangle zone */}
                    <PatternZone
                        x={startX}
                        y={resistanceStartY}
                        width={apexX - startX}
                        height={supportY - resistanceStartY}
                        $color={`${color}20`}
                        $strokeColor={color}
                    />
                    
                    {/* Label */}
                    <PatternLabel x={(startX + apexX) / 2} y={resistanceStartY - 10} $color={color}>
                        {pattern.name}
                    </PatternLabel>
                </g>
            );
        }
    };

    /**
     * Draw Flag pattern (Bull/Bear Flag)
     */
    const drawFlag = (pattern, index) => {
        const { points } = pattern;
        const color = pattern.type === 'bullish' ? '#10b981' : '#ef4444';
        
        if (!points.poleStart || !points.poleEnd) return null;

        const poleStartX = indexToX(points.poleStart.index);
        const poleStartY = priceToY(points.poleStart.price);
        const poleEndX = indexToX(points.poleEnd.index);
        const poleEndY = priceToY(points.poleEnd.price);
        
        const flagHighY = priceToY(points.flagHigh);
        const flagLowY = priceToY(points.flagLow);
        const flagEndX = poleEndX + 100; // Approximate flag length

        return (
            <g key={`flag-${index}`}>
                {/* Pole (sharp move) */}
                <PatternLine 
                    x1={poleStartX} 
                    y1={poleStartY} 
                    x2={poleEndX} 
                    y2={poleEndY} 
                    $color={color} 
                />
                <PatternCircle cx={poleStartX} cy={poleStartY} r="4" $color={color} />
                <PatternCircle cx={poleEndX} cy={poleEndY} r="4" $color={color} />
                
                {/* Flag (consolidation zone) */}
                <PatternZone
                    x={poleEndX}
                    y={flagHighY}
                    width={flagEndX - poleEndX}
                    height={flagLowY - flagHighY}
                    $color={`${color}20`}
                    $strokeColor={color}
                />
                
                {/* Label */}
                <PatternLabel x={(poleEndX + flagEndX) / 2} y={flagHighY - 10} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </g>
        );
    };

    /**
     * Draw Cup and Handle pattern
     */
    const drawCupHandle = (pattern, index) => {
        const { points } = pattern;
        const color = '#10b981'; // Always bullish
        
        if (!points.leftRim || !points.bottom || !points.rightRim) return null;

        const lr = { x: indexToX(points.leftRim.index), y: priceToY(points.leftRim.price) };
        const b = { x: indexToX(points.bottom.index), y: priceToY(points.bottom.price) };
        const rr = { x: indexToX(points.rightRim.index), y: priceToY(points.rightRim.price) };
        const handleLowY = priceToY(points.handleLow);
        const handleEndX = rr.x + 50; // Approximate handle

        return (
            <g key={`cup-${index}`}>
                {/* Cup rim points */}
                <PatternCircle cx={lr.x} cy={lr.y} r="5" $color={color} />
                <PatternCircle cx={b.x} cy={b.y} r="6" $color={color} />
                <PatternCircle cx={rr.x} cy={rr.y} r="5" $color={color} />
                
                {/* Cup curve (approximation with lines) */}
                <PatternLine x1={lr.x} y1={lr.y} x2={b.x} y2={b.y} $color={color} />
                <PatternLine x1={b.x} y1={b.y} x2={rr.x} y2={rr.y} $color={color} />
                
                {/* Handle zone */}
                <PatternZone
                    x={rr.x}
                    y={rr.y}
                    width={handleEndX - rr.x}
                    height={handleLowY - rr.y}
                    $color={`${color}20`}
                    $strokeColor={color}
                />
                
                {/* Label */}
                <PatternLabel x={(lr.x + handleEndX) / 2} y={b.y - 20} $color={color}>
                    {pattern.name}
                </PatternLabel>
            </g>
        );
    };

    /**
     * Main render - draw all patterns
     */
    return (
        <OverlayContainer>
            {patterns.map((pattern, index) => {
                switch (pattern.pattern) {
                    case 'HEAD_SHOULDERS':
                    case 'HEAD_SHOULDERS_INVERSE':
                        return drawHeadShoulders(pattern, index);
                    
                    case 'DOUBLE_TOP':
                    case 'DOUBLE_BOTTOM':
                    case 'TRIPLE_TOP':
                        return drawDoubleTopBottom(pattern, index);
                    
                    case 'ASCENDING_TRIANGLE':
                    case 'DESCENDING_TRIANGLE':
                        return drawTriangle(pattern, index);
                    
                    case 'BULL_FLAG':
                    case 'BEAR_FLAG':
                        return drawFlag(pattern, index);
                    
                    case 'CUP_HANDLE':
                        return drawCupHandle(pattern, index);
                    
                    default:
                        return null;
                }
            })}
        </OverlayContainer>
    );
};

export default PatternOverlay;

