// client/src/components/AdvancedChart.js - Professional Trading Charts - THEMED VERSION

import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import styled from 'styled-components';
import {
    TrendingUp, Activity, BarChart3, Maximize2,
    Download, Eye, EyeOff
} from 'lucide-react';
import {
    calculateSMA,
    calculateEMA,
    calculateBollingerBands
} from '../utils/indicators';
import { useTheme } from '../context/ThemeContext';

// ============ STYLED COMPONENTS ============

const ChartContainer = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => props.theme.brand?.primary}33;
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
`;

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const ChartTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const Symbol = styled.h2`
    font-size: 2rem;
    font-weight: 900;
    background: ${props => props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary} 0%, ${props.theme.brand?.accent || props.theme.brand?.secondary} 50%, ${props.theme.brand?.primary} 100%)`};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
`;

const Price = styled.div`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.$positive ? props.theme.success : props.theme.error};
`;

const PriceChange = styled.div`
    font-size: 1rem;
    color: ${props => props.$positive ? props.theme.success : props.theme.error};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const ChartControls = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        overflow-x: auto;
    }
`;

const ControlGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

const TimeframeButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme.brand?.primary}4D 0%, ${props.theme.brand?.primary}33 100%)` : 
        `${props.theme.brand?.primary}0d`
    };
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.primary}80` : `${props.theme.brand?.primary}33`};
    border-radius: 8px;
    color: ${props => props.$active ? props.theme.brand?.primary : props.theme.text?.secondary};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.primary}33 0%, ${props => props.theme.brand?.primary}1a 100%);
        border-color: ${props => props.theme.brand?.primary}80;
        color: ${props => props.theme.brand?.primary};
    }
`;

const ChartTypeButton = styled.button`
    padding: 0.5rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme.brand?.primary}4D 0%, ${props.theme.brand?.primary}33 100%)` : 
        `${props.theme.brand?.primary}0d`
    };
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.primary}80` : `${props.theme.brand?.primary}33`};
    border-radius: 8px;
    color: ${props => props.$active ? props.theme.brand?.primary : props.theme.text?.secondary};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.primary}33 0%, ${props => props.theme.brand?.primary}1a 100%);
        border-color: ${props => props.theme.brand?.primary}80;
        color: ${props => props.theme.brand?.primary};
    }
`;

const IndicatorButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme.brand?.accent || props.theme.brand?.secondary}4D 0%, ${props.theme.brand?.accent || props.theme.brand?.secondary}33 100%)` : 
        `${props.theme.brand?.accent || props.theme.brand?.secondary}0d`
    };
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.accent || props.theme.brand?.secondary}80` : `${props.theme.brand?.accent || props.theme.brand?.secondary}33`};
    border-radius: 8px;
    color: ${props => props.$active ? (props.theme.brand?.accent || props.theme.brand?.secondary) : props.theme.text?.secondary};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme.brand?.accent || props.theme.brand?.secondary}33 0%, ${props => props.theme.brand?.accent || props.theme.brand?.secondary}1a 100%);
        border-color: ${props => props.theme.brand?.accent || props.theme.brand?.secondary}80;
        color: ${props => props.theme.brand?.accent || props.theme.brand?.secondary};
    }
`;

const ActionButton = styled.button`
    padding: 0.5rem;
    background: ${props => props.theme.brand?.primary}0d;
    border: 1px solid ${props => props.theme.brand?.primary}33;
    border-radius: 8px;
    color: ${props => props.theme.text?.secondary};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${props => props.theme.brand?.primary}26;
        border-color: ${props => props.theme.brand?.primary}80;
        color: ${props => props.theme.brand?.primary};
        transform: translateY(-2px);
    }
`;

const ChartWrapper = styled.div`
    width: 100%;
    height: ${props => props.$height || '500px'};
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(10, 14, 39, 0.5);
`;

// ============ COMPONENT ============
const AdvancedChart = ({
    symbol = 'AAPL',
    data = [],
    height = '500px',
    timeframe: externalTimeframe = '1D',
    onTimeframeChange,
    onChartTypeChange
}) => {
    const { theme } = useTheme();
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const candlestickSeriesRef = useRef(null);
    const volumeSeriesRef = useRef(null);
    const indicatorSeriesRef = useRef({});
    
    const [timeframe, setTimeframe] = useState('1D');
    const [chartType, setChartType] = useState('candlestick');
    const [activeIndicators, setActiveIndicators] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(null);

    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'];
    
    const indicators = [
        { id: 'sma20', label: 'SMA 20', color: theme.brand?.primary || '#00adef' },
        { id: 'sma50', label: 'SMA 50', color: theme.success || '#10b981' },
        { id: 'ema12', label: 'EMA 12', color: theme.warning || '#f59e0b' },
        { id: 'ema26', label: 'EMA 26', color: '#ec4899' },
        { id: 'bb', label: 'Bollinger Bands', color: theme.brand?.accent || '#8b5cf6' },
    ];

    // Get theme color for chart elements
    const primaryColor = theme.brand?.primary || '#00adef';
    const primaryColorRgb = primaryColor.replace('#', '');

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: parseInt(height),
            layout: {
                background: { color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: `${primaryColor}1a` },
                horzLines: { color: `${primaryColor}1a` },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: `${primaryColor}80`,
                    labelBackgroundColor: primaryColor,
                },
                horzLine: {
                    color: `${primaryColor}80`,
                    labelBackgroundColor: primaryColor,
                },
            },
            timeScale: {
                borderColor: `${primaryColor}33`,
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: `${primaryColor}33`,
            },
        });

        chartRef.current = chart;

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: theme.success || '#10b981',
            downColor: theme.error || '#ef4444',
            borderUpColor: theme.success || '#10b981',
            borderDownColor: theme.error || '#ef4444',
            wickUpColor: theme.success || '#10b981',
            wickDownColor: theme.error || '#ef4444',
        });

        candlestickSeriesRef.current = candlestickSeries;

        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        volumeSeriesRef.current = volumeSeries;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [height, theme]);

    // Update chart data
    useEffect(() => {
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current || data.length === 0) return;

        try {
            candlestickSeriesRef.current.setData(data);

            const volumeData = data.map(d => ({
                time: d.time,
                value: d.volume || 0,
                color: d.close >= d.open ? `${theme.success || '#10b981'}80` : `${theme.error || '#ef4444'}80`
            }));
            volumeSeriesRef.current.setData(volumeData);

            if (data.length > 0) {
                const latest = data[data.length - 1];
                setCurrentPrice(latest.close);
                
                if (data.length > 1) {
                    const previous = data[data.length - 2];
                    const change = latest.close - previous.close;
                    const changePercent = (change / previous.close) * 100;
                    setPriceChange({ amount: change, percent: changePercent });
                }
            }

            chartRef.current?.timeScale().fitContent();
        } catch (error) {
            console.error('Error updating chart data:', error);
        }
    }, [data, theme]);

    // Update indicators
    useEffect(() => {
        if (!chartRef.current || data.length === 0) return;

        // ✅ SAFELY REMOVE OLD INDICATORS
        Object.entries(indicatorSeriesRef.current).forEach(([key, series]) => {
            try {
                if (chartRef.current) {
                    // Handle Bollinger Bands (which is an object with upper, middle, lower)
                    if (key === 'bb' && series && typeof series === 'object' && series.upper) {
                        if (series.upper) chartRef.current.removeSeries(series.upper);
                        if (series.middle) chartRef.current.removeSeries(series.middle);
                        if (series.lower) chartRef.current.removeSeries(series.lower);
                    } 
                    // Handle regular indicators (which are single series)
                    else if (series && typeof series.setData === 'function') {
                        chartRef.current.removeSeries(series);
                    }
                }
            } catch (error) {
                console.log(`Could not remove indicator ${key}:`, error.message);
            }
        });
        
        // Clear the ref
        indicatorSeriesRef.current = {};

        // ✅ ADD ACTIVE INDICATORS
        activeIndicators.forEach(indicatorId => {
            try {
                if (indicatorId === 'sma20') {
                    const smaData = calculateSMA(data, 20);
                    const series = chartRef.current.addLineSeries({
                        color: theme.brand?.primary || '#00adef',
                        lineWidth: 2,
                        title: 'SMA 20',
                    });
                    series.setData(smaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'sma50') {
                    const smaData = calculateSMA(data, 50);
                    const series = chartRef.current.addLineSeries({
                        color: theme.success || '#10b981',
                        lineWidth: 2,
                        title: 'SMA 50',
                    });
                    series.setData(smaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'ema12') {
                    const emaData = calculateEMA(data, 12);
                    const series = chartRef.current.addLineSeries({
                        color: theme.warning || '#f59e0b',
                        lineWidth: 2,
                        title: 'EMA 12',
                    });
                    series.setData(emaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'ema26') {
                    const emaData = calculateEMA(data, 26);
                    const series = chartRef.current.addLineSeries({
                        color: '#ec4899',
                        lineWidth: 2,
                        title: 'EMA 26',
                    });
                    series.setData(emaData);
                    indicatorSeriesRef.current[indicatorId] = series;
                }
                
                if (indicatorId === 'bb') {
                    const bbData = calculateBollingerBands(data, 20, 2);
                    const bbColor = theme.brand?.accent || '#8b5cf6';
                    
                    const upperSeries = chartRef.current.addLineSeries({
                        color: bbColor,
                        lineWidth: 1,
                        title: 'BB Upper',
                        lineStyle: 2,
                    });
                    upperSeries.setData(bbData.upper);
                    
                    const middleSeries = chartRef.current.addLineSeries({
                        color: bbColor,
                        lineWidth: 1,
                        title: 'BB Middle',
                    });
                    middleSeries.setData(bbData.sma);
                    
                    const lowerSeries = chartRef.current.addLineSeries({
                        color: bbColor,
                        lineWidth: 1,
                        title: 'BB Lower',
                        lineStyle: 2,
                    });
                    lowerSeries.setData(bbData.lower);
                    
                    // ✅ Store as object so we can remove all three later
                    indicatorSeriesRef.current[indicatorId] = { 
                        upper: upperSeries, 
                        middle: middleSeries, 
                        lower: lowerSeries 
                    };
                }
                
            } catch (error) {
                console.error(`Error adding indicator ${indicatorId}:`, error);
            }
        });
    }, [activeIndicators, data, theme]);

    // Sync internal timeframe with external prop
    useEffect(() => {
        setTimeframe(externalTimeframe);
    }, [externalTimeframe]);

    const handleTimeframeChange = (tf) => {
        setTimeframe(tf);
        if (onTimeframeChange) {
            onTimeframeChange(tf);
        }
    };

    const handleChartTypeChange = (type) => {
        setChartType(type);
        if (onChartTypeChange) {
            onChartTypeChange(type);
        }
    };

    const toggleIndicator = (indicatorId) => {
        setActiveIndicators(prev => {
            if (prev.includes(indicatorId)) {
                return prev.filter(id => id !== indicatorId);
            } else {
                return [...prev, indicatorId];
            }
        });
    };

    const handleFullscreen = () => {
        if (chartContainerRef.current?.parentElement) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                chartContainerRef.current.parentElement.requestFullscreen();
            }
        }
    };

    return (
        <ChartContainer>
            <ChartHeader>
                <ChartTitle>
                    <div>
                        <Symbol>{symbol}</Symbol>
                        {currentPrice && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                <Price $positive={priceChange?.amount >= 0}>
                                    ${currentPrice.toFixed(2)}
                                </Price>
                                {priceChange && (
                                    <PriceChange $positive={priceChange.amount >= 0}>
                                        {priceChange.amount >= 0 ? <TrendingUp size={16} /> : <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />}
                                        {priceChange.amount >= 0 ? '+' : ''}{priceChange.amount.toFixed(2)} ({priceChange.percent >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%)
                                    </PriceChange>
                                )}
                            </div>
                        )}
                    </div>
                </ChartTitle>

                <ChartControls>
                    <ControlGroup>
                        {timeframes.map(tf => (
                            <TimeframeButton
                                key={tf}
                                $active={timeframe === tf}
                                onClick={() => handleTimeframeChange(tf)}
                            >
                                {tf}
                            </TimeframeButton>
                        ))}
                    </ControlGroup>

                    <ControlGroup>
                        <ChartTypeButton
                            $active={chartType === 'candlestick'}
                            onClick={() => handleChartTypeChange('candlestick')}
                            title="Candlestick"
                        >
                            <BarChart3 size={18} />
                        </ChartTypeButton>
                        <ChartTypeButton
                            $active={chartType === 'line'}
                            onClick={() => handleChartTypeChange('line')}
                            title="Line"
                        >
                            <TrendingUp size={18} />
                        </ChartTypeButton>
                        <ChartTypeButton
                            $active={chartType === 'area'}
                            onClick={() => handleChartTypeChange('area')}
                            title="Area"
                        >
                            <Activity size={18} />
                        </ChartTypeButton>
                    </ControlGroup>

                    <ControlGroup>
                        <ActionButton onClick={handleFullscreen} title="Fullscreen">
                            <Maximize2 size={18} />
                        </ActionButton>
                        <ActionButton title="Export">
                            <Download size={18} />
                        </ActionButton>
                    </ControlGroup>
                </ChartControls>
            </ChartHeader>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {indicators.map(indicator => (
                    <IndicatorButton
                        key={indicator.id}
                        $active={activeIndicators.includes(indicator.id)}
                        onClick={() => toggleIndicator(indicator.id)}
                    >
                        {activeIndicators.includes(indicator.id) ? <Eye size={14} /> : <EyeOff size={14} />}
                        {indicator.label}
                    </IndicatorButton>
                ))}
            </div>

            <ChartWrapper $height={height}>
                <div ref={chartContainerRef} />
            </ChartWrapper>
        </ChartContainer>
    );
};

export default AdvancedChart;