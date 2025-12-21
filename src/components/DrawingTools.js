// client/src/components/DrawingTools.js - Chart Drawing Tools Overlay
import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
    TrendingUp, Minus, Type, Trash2, Move,
    Circle, Square, ChevronRight, X
} from 'lucide-react';

// ============ STYLED COMPONENTS ============

const ToolbarContainer = styled.div`
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.95)'};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px;
    backdrop-filter: blur(10px);
`;

const ToolButton = styled.button`
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$active ?
        `${props.theme.brand?.primary}33` :
        'rgba(255, 255, 255, 0.05)'};
    border: 1px solid ${props => props.$active ?
        props.theme.brand?.primary :
        'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    color: ${props => props.$active ? props.theme.brand?.primary : '#94a3b8'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary}22;
        color: ${props => props.theme.brand?.primary};
        border-color: ${props => props.theme.brand?.primary}66;
    }
`;

const Divider = styled.div`
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 4px 0;
`;

const DrawingCanvas = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: ${props => props.$isDrawing ? 'all' : 'none'};
    z-index: 50;
`;

const TrendLineElement = styled.line`
    stroke: ${props => props.$selected ? '#3b82f6' : (props.$color || '#10b981')};
    stroke-width: ${props => props.$selected ? 3 : 2};
    stroke-linecap: round;
    cursor: pointer;
    pointer-events: stroke;

    &:hover {
        stroke-width: 4;
        filter: drop-shadow(0 0 4px ${props => props.$color || '#10b981'});
    }
`;

const FibonacciContainer = styled.g`
    pointer-events: all;
`;

const FibLevel = styled.line`
    stroke: ${props => props.$color || 'rgba(156, 163, 175, 0.6)'};
    stroke-width: 1;
    stroke-dasharray: ${props => props.$dashed ? '4,4' : 'none'};
`;

const FibZone = styled.rect`
    fill: ${props => props.$color || 'rgba(59, 130, 246, 0.1)'};
    pointer-events: none;
`;

const FibLabel = styled.text`
    fill: ${props => props.$color || '#9ca3af'};
    font-size: 10px;
    font-family: monospace;
    dominant-baseline: middle;
`;

const AnnotationText = styled.text`
    fill: ${props => props.$selected ? '#3b82f6' : (props.$color || '#f59e0b')};
    font-size: ${props => props.$size || 14}px;
    cursor: pointer;
    user-select: none;

    &:hover {
        filter: drop-shadow(0 0 4px ${props => props.$color || '#f59e0b'});
    }
`;

const HandleCircle = styled.circle`
    fill: #3b82f6;
    stroke: white;
    stroke-width: 2;
    cursor: move;
    pointer-events: all;
`;

const ContextMenu = styled.div`
    position: fixed;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.98)'};
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 4px;
    z-index: 1000;
    min-width: 120px;
    backdrop-filter: blur(10px);
`;

const ContextMenuItem = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: transparent;
    border: none;
    color: ${props => props.$danger ? '#ef4444' : '#e2e8f0'};
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
`;

const TextInputOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

const TextInputCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.98)'};
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 20px;
    width: 300px;
`;

const TextInput = styled.input`
    width: 100%;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    margin-bottom: 12px;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
`;

const Button = styled.button`
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    ${props => props.$primary ? `
        background: ${props.theme.brand?.primary};
        border: none;
        color: white;
        &:hover { opacity: 0.9; }
    ` : `
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #94a3b8;
        &:hover { background: rgba(255, 255, 255, 0.1); }
    `}
`;

// Fibonacci levels
const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.618];
const FIB_COLORS = {
    0: '#ef4444',
    0.236: '#f97316',
    0.382: '#eab308',
    0.5: '#22c55e',
    0.618: '#14b8a6',
    0.786: '#3b82f6',
    1: '#8b5cf6',
    1.272: '#d946ef',
    1.618: '#f43f5e'
};

// ============ DRAWING TOOLS COMPONENT ============

const DrawingTools = ({
    chartDimensions = { width: 800, height: 500 },
    priceScale = { min: 0, max: 100 },
    timeScale = { start: 0, end: 100 },
    onDrawingsChange
}) => {
    const [activeTool, setActiveTool] = useState(null); // 'trendline', 'fibonacci', 'text', 'select'
    const [drawings, setDrawings] = useState([]);
    const [selectedDrawing, setSelectedDrawing] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [currentPoint, setCurrentPoint] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [textInput, setTextInput] = useState(null);
    const svgRef = useRef(null);

    // CHART_MARGINS to match PatternOverlay
    const CHART_MARGINS = {
        right: 60,
        bottom: 30,
        top: 10,
        left: 5
    };

    // Convert pixel coordinates to chart coordinates
    const pixelToChart = useCallback((x, y) => {
        const chartWidth = chartDimensions.width - CHART_MARGINS.left - CHART_MARGINS.right;
        const chartHeight = chartDimensions.height - CHART_MARGINS.top - CHART_MARGINS.bottom;

        const timeRange = timeScale.end - timeScale.start;
        const priceRange = priceScale.max - priceScale.min;

        const time = timeScale.start + ((x - CHART_MARGINS.left) / chartWidth) * timeRange;
        const price = priceScale.max - ((y - CHART_MARGINS.top) / chartHeight) * priceRange;

        return { time, price };
    }, [chartDimensions, priceScale, timeScale]);

    // Convert chart coordinates to pixel coordinates
    const chartToPixel = useCallback((time, price) => {
        const chartWidth = chartDimensions.width - CHART_MARGINS.left - CHART_MARGINS.right;
        const chartHeight = chartDimensions.height - CHART_MARGINS.top - CHART_MARGINS.bottom;

        const timeRange = timeScale.end - timeScale.start;
        const priceRange = priceScale.max - priceScale.min;

        const x = CHART_MARGINS.left + ((time - timeScale.start) / timeRange) * chartWidth;
        const y = CHART_MARGINS.top + ((priceScale.max - price) / priceRange) * chartHeight;

        return { x, y };
    }, [chartDimensions, priceScale, timeScale]);

    // Handle mouse down - start drawing
    const handleMouseDown = useCallback((e) => {
        if (!activeTool || activeTool === 'select') return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (activeTool === 'text') {
            setTextInput({ x, y });
            return;
        }

        const chartPoint = pixelToChart(x, y);
        setStartPoint({ x, y, ...chartPoint });
        setIsDrawing(true);
    }, [activeTool, pixelToChart]);

    // Handle mouse move - update preview
    const handleMouseMove = useCallback((e) => {
        if (!isDrawing) return;

        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const chartPoint = pixelToChart(x, y);

        setCurrentPoint({ x, y, ...chartPoint });
    }, [isDrawing, pixelToChart]);

    // Handle mouse up - finish drawing
    const handleMouseUp = useCallback(() => {
        if (!isDrawing || !startPoint || !currentPoint) {
            setIsDrawing(false);
            return;
        }

        const newDrawing = {
            id: Date.now(),
            type: activeTool,
            start: { time: startPoint.time, price: startPoint.price },
            end: { time: currentPoint.time, price: currentPoint.price },
            color: activeTool === 'trendline' ? '#10b981' : '#3b82f6',
            createdAt: new Date().toISOString()
        };

        setDrawings(prev => [...prev, newDrawing]);
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);

        if (onDrawingsChange) {
            onDrawingsChange([...drawings, newDrawing]);
        }
    }, [isDrawing, startPoint, currentPoint, activeTool, drawings, onDrawingsChange]);

    // Handle drawing click - select
    const handleDrawingClick = useCallback((e, drawing) => {
        e.stopPropagation();
        setSelectedDrawing(selectedDrawing?.id === drawing.id ? null : drawing);
    }, [selectedDrawing]);

    // Handle right-click context menu
    const handleContextMenu = useCallback((e, drawing) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            drawing
        });
        setSelectedDrawing(drawing);
    }, []);

    // Delete drawing
    const deleteDrawing = useCallback((id) => {
        setDrawings(prev => prev.filter(d => d.id !== id));
        setSelectedDrawing(null);
        setContextMenu(null);
    }, []);

    // Add text annotation
    const addTextAnnotation = useCallback((text) => {
        if (!textInput || !text.trim()) {
            setTextInput(null);
            return;
        }

        const chartPoint = pixelToChart(textInput.x, textInput.y);
        const newDrawing = {
            id: Date.now(),
            type: 'text',
            position: { time: chartPoint.time, price: chartPoint.price },
            text: text,
            color: '#f59e0b',
            fontSize: 14,
            createdAt: new Date().toISOString()
        };

        setDrawings(prev => [...prev, newDrawing]);
        setTextInput(null);

        if (onDrawingsChange) {
            onDrawingsChange([...drawings, newDrawing]);
        }
    }, [textInput, pixelToChart, drawings, onDrawingsChange]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [contextMenu]);

    // Render trendline
    const renderTrendline = (drawing, isPreview = false) => {
        const start = isPreview ? { x: startPoint.x, y: startPoint.y } : chartToPixel(drawing.start.time, drawing.start.price);
        const end = isPreview ? { x: currentPoint.x, y: currentPoint.y } : chartToPixel(drawing.end.time, drawing.end.price);

        return (
            <g key={drawing?.id || 'preview'}>
                <TrendLineElement
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    $color={drawing?.color || '#10b981'}
                    $selected={selectedDrawing?.id === drawing?.id}
                    onClick={(e) => !isPreview && handleDrawingClick(e, drawing)}
                    onContextMenu={(e) => !isPreview && handleContextMenu(e, drawing)}
                    style={{ opacity: isPreview ? 0.7 : 1 }}
                />
                {selectedDrawing?.id === drawing?.id && !isPreview && (
                    <>
                        <HandleCircle cx={start.x} cy={start.y} r={6} />
                        <HandleCircle cx={end.x} cy={end.y} r={6} />
                    </>
                )}
            </g>
        );
    };

    // Render Fibonacci retracement
    const renderFibonacci = (drawing, isPreview = false) => {
        const start = isPreview ? { x: startPoint.x, y: startPoint.y } : chartToPixel(drawing.start.time, drawing.start.price);
        const end = isPreview ? { x: currentPoint.x, y: currentPoint.y } : chartToPixel(drawing.end.time, drawing.end.price);

        const priceDiff = (drawing?.end?.price || currentPoint?.price || 0) - (drawing?.start?.price || startPoint?.price || 0);
        const basePrice = drawing?.start?.price || startPoint?.price || 0;

        const chartWidth = chartDimensions.width - CHART_MARGINS.left - CHART_MARGINS.right;
        const leftX = CHART_MARGINS.left;
        const rightX = chartDimensions.width - CHART_MARGINS.right;

        return (
            <FibonacciContainer
                key={drawing?.id || 'preview'}
                onClick={(e) => !isPreview && handleDrawingClick(e, drawing)}
                onContextMenu={(e) => !isPreview && handleContextMenu(e, drawing)}
            >
                {/* Shaded zones between levels */}
                {FIB_LEVELS.slice(0, -1).map((level, idx) => {
                    const nextLevel = FIB_LEVELS[idx + 1];
                    const levelPrice1 = basePrice + priceDiff * level;
                    const levelPrice2 = basePrice + priceDiff * nextLevel;
                    const y1 = chartToPixel(0, levelPrice1).y;
                    const y2 = chartToPixel(0, levelPrice2).y;

                    return (
                        <FibZone
                            key={`zone-${level}`}
                            x={leftX}
                            y={Math.min(y1, y2)}
                            width={rightX - leftX}
                            height={Math.abs(y2 - y1)}
                            $color={`${FIB_COLORS[level]}15`}
                            style={{ opacity: isPreview ? 0.5 : 1 }}
                        />
                    );
                })}

                {/* Fibonacci levels */}
                {FIB_LEVELS.map(level => {
                    const levelPrice = basePrice + priceDiff * level;
                    const y = chartToPixel(0, levelPrice).y;

                    return (
                        <g key={level}>
                            <FibLevel
                                x1={leftX}
                                y1={y}
                                x2={rightX}
                                y2={y}
                                $color={FIB_COLORS[level]}
                                $dashed={level > 1}
                                style={{ opacity: isPreview ? 0.7 : 1 }}
                            />
                            <FibLabel
                                x={rightX - 55}
                                y={y}
                                $color={FIB_COLORS[level]}
                            >
                                {(level * 100).toFixed(1)}% - ${levelPrice.toFixed(2)}
                            </FibLabel>
                        </g>
                    );
                })}

                {/* Start/end handles */}
                {selectedDrawing?.id === drawing?.id && !isPreview && (
                    <>
                        <HandleCircle cx={start.x} cy={start.y} r={6} />
                        <HandleCircle cx={end.x} cy={end.y} r={6} />
                    </>
                )}
            </FibonacciContainer>
        );
    };

    // Render text annotation
    const renderText = (drawing) => {
        const pos = chartToPixel(drawing.position.time, drawing.position.price);

        return (
            <AnnotationText
                key={drawing.id}
                x={pos.x}
                y={pos.y}
                $color={drawing.color}
                $size={drawing.fontSize}
                $selected={selectedDrawing?.id === drawing.id}
                onClick={(e) => handleDrawingClick(e, drawing)}
                onContextMenu={(e) => handleContextMenu(e, drawing)}
            >
                {drawing.text}
            </AnnotationText>
        );
    };

    return (
        <>
            {/* Toolbar */}
            <ToolbarContainer>
                <ToolButton
                    $active={activeTool === 'select'}
                    onClick={() => setActiveTool(activeTool === 'select' ? null : 'select')}
                    title="Select/Move"
                >
                    <Move size={18} />
                </ToolButton>

                <Divider />

                <ToolButton
                    $active={activeTool === 'trendline'}
                    onClick={() => setActiveTool(activeTool === 'trendline' ? null : 'trendline')}
                    title="Trendline"
                >
                    <TrendingUp size={18} />
                </ToolButton>

                <ToolButton
                    $active={activeTool === 'fibonacci'}
                    onClick={() => setActiveTool(activeTool === 'fibonacci' ? null : 'fibonacci')}
                    title="Fibonacci Retracement"
                >
                    <ChevronRight size={18} style={{ transform: 'rotate(-45deg)' }} />
                </ToolButton>

                <ToolButton
                    $active={activeTool === 'text'}
                    onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
                    title="Text Annotation"
                >
                    <Type size={18} />
                </ToolButton>

                <Divider />

                <ToolButton
                    onClick={() => {
                        if (selectedDrawing) {
                            deleteDrawing(selectedDrawing.id);
                        }
                    }}
                    title="Delete Selected"
                    style={{ opacity: selectedDrawing ? 1 : 0.5 }}
                >
                    <Trash2 size={18} />
                </ToolButton>
            </ToolbarContainer>

            {/* Drawing Canvas */}
            <DrawingCanvas
                ref={svgRef}
                $isDrawing={!!activeTool}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Render existing drawings */}
                {drawings.map(drawing => {
                    switch (drawing.type) {
                        case 'trendline':
                            return renderTrendline(drawing);
                        case 'fibonacci':
                            return renderFibonacci(drawing);
                        case 'text':
                            return renderText(drawing);
                        default:
                            return null;
                    }
                })}

                {/* Render preview while drawing */}
                {isDrawing && startPoint && currentPoint && (
                    activeTool === 'trendline' ?
                        renderTrendline(null, true) :
                        activeTool === 'fibonacci' ?
                            renderFibonacci(null, true) :
                            null
                )}
            </DrawingCanvas>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu style={{ left: contextMenu.x, top: contextMenu.y }}>
                    <ContextMenuItem onClick={() => deleteDrawing(contextMenu.drawing.id)} $danger>
                        <Trash2 size={14} />
                        Delete
                    </ContextMenuItem>
                </ContextMenu>
            )}

            {/* Text Input Modal */}
            {textInput && (
                <TextInputOverlay onClick={() => setTextInput(null)}>
                    <TextInputCard onClick={e => e.stopPropagation()}>
                        <h4 style={{ margin: '0 0 12px 0', color: 'white' }}>Add Annotation</h4>
                        <TextInput
                            autoFocus
                            placeholder="Enter text..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addTextAnnotation(e.target.value);
                                } else if (e.key === 'Escape') {
                                    setTextInput(null);
                                }
                            }}
                        />
                        <ButtonGroup>
                            <Button onClick={() => setTextInput(null)}>Cancel</Button>
                            <Button
                                $primary
                                onClick={(e) => {
                                    const input = e.target.parentElement.parentElement.querySelector('input');
                                    addTextAnnotation(input.value);
                                }}
                            >
                                Add
                            </Button>
                        </ButtonGroup>
                    </TextInputCard>
                </TextInputOverlay>
            )}
        </>
    );
};

export default DrawingTools;
