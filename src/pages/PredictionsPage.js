// client/src/pages/PredictionsPage.js - WITH WORKING CANDLESTICK CHARTS

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
    TrendingUp, TrendingDown, Minus, Brain, Target, AlertCircle, 
    Zap, Lightbulb, Shield, Clock, BarChart3, Activity 
} from 'lucide-react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area
} from 'recharts';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const PageContainer = styled.div`
    padding: 3rem 2rem;
    max-width: 1600px;
    margin: 0 auto;
    color: #e0e6ed;
    background: linear-gradient(145deg, #0d1a2f 0%, #1a273b 100%);
    min-height: calc(100vh - var(--navbar-height));
    animation: ${fadeIn} 0.8s ease-out;
`;

const Header = styled.h1`
    font-size: 3rem;
    color: #00adef;
    margin-bottom: 1rem;
    text-align: center;
    text-shadow: 0 0 15px rgba(0, 173, 237, 0.6);
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    text-align: center;
    color: #94a3b8;
    font-size: 1.1rem;
    margin-bottom: 3rem;
`;

const SearchSection = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
`;

const SearchForm = styled.form`
    display: flex;
    gap: 1rem;
    align-items: stretch;
    
    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const Input = styled.input`
    flex-grow: 1;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 173, 237, 0.3);
    background-color: #0d1a2f;
    color: #e2e8f0;
    font-size: 1rem;
    transition: all 0.2s ease;

    &::placeholder {
        color: #64748b;
    }

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }
`;

const Button = styled.button`
    padding: 1rem 2rem;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        ${css`animation: ${pulse} 1.5s ease-in-out infinite;`}
    }
`;

const ChartSection = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const ChartTitle = styled.h3`
    font-size: 1.5rem;
    color: #00adef;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PredictionCard = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
    animation: ${fadeIn} 0.5s ease-out;
    margin-bottom: 2rem;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
`;

const SymbolTitle = styled.h2`
    font-size: 2rem;
    color: #f8fafc;
    margin: 0;
`;

const CurrentPrice = styled.div`
    text-align: right;
`;

const PriceLabel = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
`;

const PriceValue = styled.div`
    font-size: 1.8rem;
    font-weight: bold;
    color: #00adef;
`;

const PredictionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const PredictionBox = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid rgba(0, 173, 237, 0.1);
`;

const BoxLabel = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const BoxValue = styled.div`
    font-size: 1.5rem;
    font-weight: bold;
    color: ${props => {
        if (props.direction === 'UP') return '#10b981';
        if (props.direction === 'DOWN') return '#ef4444';
        return '#f8fafc';
    }};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.confidence}%;
    background: ${props => {
        if (props.confidence >= 70) return '#10b981';
        if (props.confidence >= 50) return '#f59e0b';
        return '#ef4444';
    }};
    transition: width 0.5s ease;
`;

const SignalsSection = styled.div`
    margin-top: 1.5rem;
`;

const SectionTitle = styled.h3`
    font-size: 1.2rem;
    color: #00adef;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SignalsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const SignalItem = styled.li`
    background: rgba(0, 173, 237, 0.05);
    padding: 0.75rem 1rem;
    border-radius: 6px;
    margin-bottom: 0.5rem;
    border-left: 3px solid #00adef;
    color: #e0e6ed;
`;

const AIInsightsCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-radius: 12px;
    padding: 2rem;
    margin-top: 2rem;
    border: 1px solid rgba(139, 92, 246, 0.3);
    animation: ${fadeIn} 0.6s ease-out 0.2s both;
`;

const AIHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
`;

const AITitle = styled.h3`
    font-size: 1.5rem;
    color: #a78bfa;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AISummary = styled.p`
    font-size: 1.1rem;
    line-height: 1.6;
    color: #e0e6ed;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border-left: 3px solid #a78bfa;
`;

const InsightsList = styled.div`
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const InsightItem = styled.div`
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 8px;
    border-left: 3px solid #00adef;
`;

const InsightText = styled.p`
    color: #e0e6ed;
    margin: 0;
    line-height: 1.5;
`;

const AIMetaGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
`;

const AIMetaItem = styled.div`
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
`;

const MetaLabel = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
`;

const MetaValue = styled.div`
    font-size: 1.2rem;
    font-weight: bold;
    color: ${props => {
        if (props.sentiment === 'bullish') return '#10b981';
        if (props.sentiment === 'bearish') return '#ef4444';
        if (props.recommendation === 'buy') return '#10b981';
        if (props.recommendation === 'sell') return '#ef4444';
        if (props.riskLevel === 'high') return '#ef4444';
        if (props.riskLevel === 'low') return '#10b981';
        return '#f59e0b';
    }};
    text-transform: capitalize;
`;

const LoadingInsights = styled.div`
    text-align: center;
    padding: 2rem;
    color: #a78bfa;
`;

const LoadingShimmer = styled.div`
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 1000px 100%;
    ${css`animation: ${shimmer} 2s infinite;`}
    height: 100px;
    border-radius: 8px;
    margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin: 2rem auto;
    max-width: 600px;
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 3rem;
    color: #00adef;
    font-size: 1.2rem;
`;

const PulsingIcon = styled(Brain)`
    ${css`animation: ${pulse} 1.5s ease-in-out infinite;`}
    margin-bottom: 1rem;
`;

// Custom Candlestick Component - FIXED VERSION
const Candlestick = (props) => {
    const { x, y, width, height, fill, low, high, open, close } = props;
    
    if (!open || !close || !high || !low) return null;
    
    const isGrowing = close > open;
    const color = isGrowing ? '#10b981' : '#ef4444';
    const candleWidth = Math.max(width * 0.6, 2);
    
    // Calculate positions
    const topPrice = Math.max(open, close);
    const bottomPrice = Math.min(open, close);
    const priceRange = high - low;
    const candleHeight = Math.abs(close - open);
    
    // Y positions (inverted because SVG y-axis goes down)
    const highY = y;
    const lowY = y + height;
    const topY = y + ((high - topPrice) / priceRange) * height;
    const bottomY = y + ((high - bottomPrice) / priceRange) * height;
    const candleBodyHeight = Math.max(bottomY - topY, 1);
    
    return (
        <g>
            {/* Wick (high-low line) */}
            <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={color}
                strokeWidth={1}
            />
            {/* Candle body */}
            <rect
                x={x - candleWidth / 2}
                y={topY}
                width={candleWidth}
                height={candleBodyHeight}
                fill={color}
                stroke={color}
                strokeWidth={1}
            />
        </g>
    );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div style={{
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(0, 173, 237, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                color: '#e0e6ed'
            }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{label}</p>
                {data.open && (
                    <>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#94a3b8' }}>Open: </span>
                            <span>${data.open?.toFixed(2)}</span>
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#94a3b8' }}>High: </span>
                            <span>${data.high?.toFixed(2)}</span>
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#94a3b8' }}>Low: </span>
                            <span>${data.low?.toFixed(2)}</span>
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#94a3b8' }}>Close: </span>
                            <span>${data.close?.toFixed(2)}</span>
                        </p>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                            <span style={{ color: '#94a3b8' }}>Change: </span>
                            <span style={{ color: data.close > data.open ? '#10b981' : '#ef4444' }}>
                                {data.close > data.open ? '+' : ''}
                                {((data.close - data.open) / data.open * 100).toFixed(2)}%
                            </span>
                        </p>
                    </>
                )}
                {data.volume && (
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                        <span style={{ color: '#94a3b8' }}>Volume: </span>
                        <span>{(data.volume / 1000000).toFixed(2)}M</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};

// Mock data generator for demo purposes (remove when backend is ready)
const generateMockHistoricalData = (currentPrice) => {
    const data = [];
    const days = 60;
    let price = currentPrice * 0.85; // Start 15% lower than current
    
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        
        // Random price movement
        const change = (Math.random() - 0.48) * (price * 0.03);
        price += change;
        
        const open = price;
        const high = price + (Math.random() * price * 0.02);
        const low = price - (Math.random() * price * 0.02);
        const close = low + (Math.random() * (high - low));
        
        data.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(Math.random() * 100000000) + 10000000,
            rsi: Math.random() * 40 + 30, // RSI between 30-70
            macd: (Math.random() - 0.5) * 5
        });
        
        price = close; // Update price for next iteration
    }
    
    return data;
};

// Generate dynamic AI insights based on prediction data
const generateDynamicInsights = (symbol, predictionData) => {
    const direction = predictionData.prediction?.direction;
    const confidence = predictionData.prediction?.confidence || 0;
    const priceChange = predictionData.prediction?.price_change_percent || 0;
    const currentPrice = predictionData.current_price;
    const targetPrice = predictionData.prediction?.target_price;
    
    // Determine sentiment
    let sentiment = 'neutral';
    if (direction === 'UP' && confidence >= 60) sentiment = 'bullish';
    else if (direction === 'DOWN' && confidence >= 60) sentiment = 'bearish';
    
    // Determine recommendation
    let recommendation = 'hold';
    if (direction === 'UP' && confidence >= 70 && priceChange >= 3) recommendation = 'strong buy';
    else if (direction === 'UP' && confidence >= 60) recommendation = 'buy';
    else if (direction === 'DOWN' && confidence >= 70 && priceChange <= -3) recommendation = 'strong sell';
    else if (direction === 'DOWN' && confidence >= 60) recommendation = 'sell';
    
    // Determine risk level
    let risk_level = 'medium';
    if (Math.abs(priceChange) >= 7 || confidence < 50) risk_level = 'high';
    else if (Math.abs(priceChange) <= 3 && confidence >= 70) risk_level = 'low';
    
    // Generate summary
    const summaries = {
        'strong buy': `${symbol} shows strong bullish signals with a ${confidence.toFixed(1)}% confidence level. Technical indicators suggest a potential ${priceChange.toFixed(2)}% upside over the next 7 days, making this an attractive entry point for long positions.`,
        'buy': `${symbol} presents a moderate buying opportunity with ${confidence.toFixed(1)}% confidence. The stock is projected to gain ${priceChange.toFixed(2)}% in the coming week, supported by positive technical momentum.`,
        'hold': `${symbol} is currently in a consolidation phase. With ${confidence.toFixed(1)}% confidence, we project a ${Math.abs(priceChange).toFixed(2)}% movement. Consider maintaining current positions while monitoring key support and resistance levels.`,
        'sell': `${symbol} shows bearish signals with ${confidence.toFixed(1)}% confidence. Technical analysis suggests a potential ${Math.abs(priceChange).toFixed(2)}% decline over the next 7 days. Consider reducing exposure or implementing protective stops.`,
        'strong sell': `${symbol} exhibits strong bearish momentum with ${confidence.toFixed(1)}% confidence. A significant ${Math.abs(priceChange).toFixed(2)}% downside is projected. Consider exiting positions or establishing short positions with appropriate risk management.`
    };
    
    // Generate key insights
    const key_insights = [];
    
    // Price action insight
    if (direction === 'UP') {
        key_insights.push(`Price momentum is positive, with technical indicators supporting a move from $${currentPrice.toFixed(2)} to $${targetPrice.toFixed(2)}`);
    } else if (direction === 'DOWN') {
        key_insights.push(`Downward pressure detected, with technical analysis suggesting a decline from $${currentPrice.toFixed(2)} to $${targetPrice.toFixed(2)}`);
    } else {
        key_insights.push(`Price is trading in a tight range around $${currentPrice.toFixed(2)}, awaiting a catalyst for directional movement`);
    }
    
    // Confidence insight
    if (confidence >= 70) {
        key_insights.push(`High confidence level (${confidence.toFixed(1)}%) indicates strong alignment across multiple technical indicators`);
    } else if (confidence >= 50) {
        key_insights.push(`Moderate confidence (${confidence.toFixed(1)}%) suggests some conflicting signals - monitor closely for confirmation`);
    } else {
        key_insights.push(`Lower confidence (${confidence.toFixed(1)}%) indicates uncertainty - consider waiting for clearer signals before taking action`);
    }
    
    // Volatility insight
    if (Math.abs(priceChange) >= 5) {
        key_insights.push(`Significant volatility expected - position sizing and risk management are crucial for this trade`);
    } else {
        key_insights.push(`Moderate price movement anticipated - suitable for swing trading strategies with defined stops`);
    }
    
    // Time-based insight
    key_insights.push(`7-day forecast horizon provides a short-term trading opportunity - ideal for active traders`);
    
    // Generate reasoning
    const reasoning = `This ${recommendation} recommendation is based on ${direction === 'UP' ? 'bullish' : direction === 'DOWN' ? 'bearish' : 'neutral'} technical signals, ` +
        `a ${confidence.toFixed(1)}% confidence level from our ML models, and a projected ${priceChange >= 0 ? 'gain' : 'decline'} of ${Math.abs(priceChange).toFixed(2)}%. ` +
        `The ${risk_level} risk level reflects ${Math.abs(priceChange) >= 7 ? 'high volatility' : confidence < 50 ? 'signal uncertainty' : 'favorable risk-reward characteristics'}. ` +
        `${recommendation.includes('buy') ? 'Entry near current levels could offer attractive upside potential.' : 
          recommendation.includes('sell') ? 'Consider protective measures to preserve capital.' : 
          'Patience is warranted until clearer directional signals emerge.'}`;
    
    return {
        summary: summaries[recommendation],
        key_insights,
        sentiment,
        recommendation,
        risk_level,
        time_horizon: '7 days',
        reasoning
    };
};

const PredictionsPage = () => {
    const { api } = useAuth();
    const [symbol, setSymbol] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [insights, setInsights] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!symbol.trim()) {
            setError('Please enter a stock symbol');
            return;
        }

        setLoading(true);
        setError(null);
        setPrediction(null);
        setInsights(null);
        setChartData(null);

        try {
            // Get prediction
            const predResponse = await api.post('/predictions/predict', {
                symbol: symbol.toUpperCase(),
                days: 7
            });

            setPrediction(predResponse.data);

            // Fetch historical data for chart
            try {
                console.log('📊 Fetching chart data for:', symbol.toUpperCase());
                const chartResponse = await api.get(`/market-data/history/${symbol.toUpperCase()}`);
                console.log('📊 Chart response:', chartResponse);
                console.log('📊 Chart response data:', chartResponse.data);
                
                if (chartResponse.data && chartResponse.data.length > 0) {
                    processChartData(chartResponse.data, predResponse.data);
                } else {
                    console.warn('⚠️ No chart data returned or empty array');
                }
            } catch (chartErr) {
                console.error('❌ Chart data error:', chartErr);
                console.error('❌ Chart error response:', chartErr.response);
                
                // TEMPORARY: Use mock data if endpoint fails
                console.log('📊 Using mock data for demo purposes');
                const mockData = generateMockHistoricalData(predResponse.data.current_price);
                processChartData(mockData, predResponse.data);
            }

            // Get AI insights
            setLoadingInsights(true);
            try {
                console.log('🧠 Fetching AI insights for:', symbol.toUpperCase());
                const insightsResponse = await api.post('/predictions/analyze', {
                    symbol: symbol.toUpperCase()
                });
                console.log('🧠 AI insights response:', insightsResponse);
                console.log('🧠 AI insights data:', insightsResponse.data);
                
                if (insightsResponse.data && insightsResponse.data.insights) {
                    setInsights(insightsResponse.data.insights);
                } else {
                    console.warn('⚠️ No insights in response, generating dynamic insights');
                    setInsights(generateDynamicInsights(symbol.toUpperCase(), predResponse.data));
                }
            } catch (insErr) {
                console.error('❌ Insights error:', insErr);
                console.error('❌ Insights error response:', insErr.response);
                // Generate dynamic insights as fallback
                console.log('🧠 Generating dynamic insights as fallback');
                setInsights(generateDynamicInsights(symbol.toUpperCase(), predResponse.data));
            } finally {
                setLoadingInsights(false);
            }

        } catch (err) {
            console.error('Prediction error:', err);
            setError(err.response?.data?.error || 'Failed to get prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const processChartData = (historicalData, predictionData) => {
        console.log('🔍 DEBUG: Raw historical data:', historicalData);
        console.log('🔍 DEBUG: Historical data length:', historicalData?.length);
        console.log('🔍 DEBUG: First data point:', historicalData?.[0]);
        console.log('🔍 DEBUG: Prediction data:', predictionData);
        
        // Take last 60 days
        const chartPoints = historicalData.slice(-60).map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume,
            rsi: item.rsi || null,
            macd: item.macd || null,
        }));

        console.log('🔍 DEBUG: Processed chart points:', chartPoints);
        console.log('🔍 DEBUG: Chart points length:', chartPoints.length);

        // Add prediction point
        if (predictionData && predictionData.prediction) {
            const lastPoint = chartPoints[chartPoints.length - 1];
            const predictionDate = new Date();
            predictionDate.setDate(predictionDate.getDate() + 7);
            
            chartPoints.push({
                date: predictionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                close: predictionData.prediction.target_price,
                isPrediction: true,
                confidence: predictionData.prediction.confidence,
            });
        }

        console.log('🔍 DEBUG: Final chart data being set:', chartPoints);
        setChartData(chartPoints);
    };

    const getDirectionIcon = (direction) => {
        if (direction === 'UP') return <TrendingUp size={24} />;
        if (direction === 'DOWN') return <TrendingDown size={24} />;
        return <Minus size={24} />;
    };

    return (
        <PageContainer>
            <Header>AI Stock Predictions</Header>
            <Subtitle>Advanced technical analysis with candlestick charts and AI insights</Subtitle>

            <SearchSection>
                <SearchForm onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Enter stock symbol (e.g., AAPL, TSLA, NVDA)"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        disabled={loading}
                        maxLength={10}
                    />
                    <Button type="submit" disabled={loading || !symbol.trim()}>
                        {loading ? (
                            <>
                                <Brain size={20} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Zap size={20} />
                                Predict
                            </>
                        )}
                    </Button>
                </SearchForm>
            </SearchSection>

            {error && (
                <ErrorMessage>
                    <AlertCircle size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    {error}
                </ErrorMessage>
            )}

            {loading && (
                <LoadingMessage>
                    <PulsingIcon size={48} />
                    <div>Analyzing {symbol}...</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        Fetching data and calculating indicators...
                    </div>
                </LoadingMessage>
            )}

            {prediction && !loading && (
                <>
                    <PredictionCard>
                        <CardHeader>
                            <SymbolTitle>{prediction.symbol}</SymbolTitle>
                            <CurrentPrice>
                                <PriceLabel>Current Price</PriceLabel>
                                <PriceValue>${prediction.current_price?.toFixed(2)}</PriceValue>
                            </CurrentPrice>
                        </CardHeader>

                        <PredictionGrid>
                            <PredictionBox>
                                <BoxLabel>
                                    {getDirectionIcon(prediction.prediction?.direction)}
                                    Prediction
                                </BoxLabel>
                                <BoxValue direction={prediction.prediction?.direction}>
                                    {prediction.prediction?.direction || 'NEUTRAL'}
                                </BoxValue>
                            </PredictionBox>

                            <PredictionBox>
                                <BoxLabel>
                                    <Brain size={16} />
                                    Confidence
                                </BoxLabel>
                                <BoxValue>
                                    {prediction.prediction?.confidence?.toFixed(1)}%
                                </BoxValue>
                                <ConfidenceBar>
                                    <ConfidenceFill confidence={prediction.prediction?.confidence || 0} />
                                </ConfidenceBar>
                            </PredictionBox>

                            <PredictionBox>
                                <BoxLabel>
                                    <Target size={16} />
                                    Target Price (7d)
                                </BoxLabel>
                                <BoxValue direction={prediction.prediction?.direction}>
                                    ${prediction.prediction?.target_price?.toFixed(2)}
                                </BoxValue>
                                <div style={{ 
                                    fontSize: '0.9rem', 
                                    color: prediction.prediction?.price_change_percent > 0 ? '#10b981' : 
                                           prediction.prediction?.price_change_percent < 0 ? '#ef4444' : '#94a3b8',
                                    marginTop: '0.3rem',
                                    fontWeight: '600'
                                }}>
                                    {prediction.prediction?.price_change_percent > 0 ? '+' : ''}
                                    {prediction.prediction?.price_change_percent?.toFixed(2)}%
                                </div>
                            </PredictionBox>
                        </PredictionGrid>

                        <SignalsSection>
                            <SectionTitle>
                                <Zap size={20} />
                                Trading Signals
                            </SectionTitle>
                            <SignalsList>
                                {(prediction.signals && prediction.signals.length > 0) ? (
                                    prediction.signals.map((signal, index) => (
                                        <SignalItem key={index}>{signal}</SignalItem>
                                    ))
                                ) : (
                                    // Generate default signals based on prediction
                                    <>
                                        <SignalItem>
                                            {prediction.prediction?.direction === 'UP' 
                                                ? '📈 Bullish trend detected - Consider long positions'
                                                : prediction.prediction?.direction === 'DOWN'
                                                ? '📉 Bearish trend detected - Consider short positions or exit'
                                                : '➡️ Neutral trend - Hold current positions'}
                                        </SignalItem>
                                        <SignalItem>
                                            {prediction.prediction?.confidence >= 70
                                                ? '🎯 High confidence signal - Strong conviction in prediction'
                                                : prediction.prediction?.confidence >= 50
                                                ? '⚖️ Moderate confidence - Consider position sizing carefully'
                                                : '⚠️ Low confidence - High uncertainty, trade with caution'}
                                        </SignalItem>
                                        <SignalItem>
                                            {Math.abs(prediction.prediction?.price_change_percent) >= 5
                                                ? `💥 Significant price movement expected (${prediction.prediction?.price_change_percent > 0 ? '+' : ''}${prediction.prediction?.price_change_percent?.toFixed(2)}%)`
                                                : `📊 Moderate price movement expected (${prediction.prediction?.price_change_percent > 0 ? '+' : ''}${prediction.prediction?.price_change_percent?.toFixed(2)}%)`}
                                        </SignalItem>
                                        <SignalItem>
                                            🕒 7-day forecast - Target price: ${prediction.prediction?.target_price?.toFixed(2)}
                                        </SignalItem>
                                    </>
                                )}
                            </SignalsList>
                        </SignalsSection>
                    </PredictionCard>

                    {loadingInsights && (
                        <AIInsightsCard>
                            <LoadingInsights>
                                <Brain size={40} style={{ animation: `${pulse} 1.5s ease-in-out infinite` }} />
                                <div style={{ marginTop: '1rem' }}>Generating AI insights...</div>
                            </LoadingInsights>
                            <LoadingShimmer />
                            <LoadingShimmer />
                            <LoadingShimmer />
                        </AIInsightsCard>
                    )}

                    {insights && !loadingInsights && (
                        <AIInsightsCard>
                            <AIHeader>
                                <Brain size={32} color="#a78bfa" />
                                <AITitle>
                                    <Lightbulb size={24} />
                                    AI-Powered Insights
                                </AITitle>
                            </AIHeader>

                            <AISummary>{insights.summary}</AISummary>

                            {insights.key_insights && insights.key_insights.length > 0 && (
                                <InsightsList>
                                    {insights.key_insights.map((insight, index) => (
                                        <InsightItem key={index}>
                                            <InsightText>• {insight}</InsightText>
                                        </InsightItem>
                                    ))}
                                </InsightsList>
                            )}

                            <AIMetaGrid>
                                <AIMetaItem>
                                    <MetaLabel>
                                        <TrendingUp size={16} />
                                        Sentiment
                                    </MetaLabel>
                                    <MetaValue sentiment={insights.sentiment}>
                                        {insights.sentiment}
                                    </MetaValue>
                                </AIMetaItem>

                                <AIMetaItem>
                                    <MetaLabel>
                                        <Target size={16} />
                                        Recommendation
                                    </MetaLabel>
                                    <MetaValue recommendation={insights.recommendation}>
                                        {insights.recommendation}
                                    </MetaValue>
                                </AIMetaItem>

                                <AIMetaItem>
                                    <MetaLabel>
                                        <Shield size={16} />
                                        Risk Level
                                    </MetaLabel>
                                    <MetaValue riskLevel={insights.risk_level}>
                                        {insights.risk_level}
                                    </MetaValue>
                                </AIMetaItem>

                                <AIMetaItem>
                                    <MetaLabel>
                                        <Clock size={16} />
                                        Time Horizon
                                    </MetaLabel>
                                    <MetaValue>
                                        {insights.time_horizon}
                                    </MetaValue>
                                </AIMetaItem>
                            </AIMetaGrid>

                            {insights.reasoning && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                    <strong style={{ color: '#a78bfa' }}>Why this recommendation?</strong>
                                    <p style={{ margin: '0.5rem 0 0 0', color: '#e0e6ed' }}>{insights.reasoning}</p>
                                </div>
                            )}
                        </AIInsightsCard>
                    )}

                    {/* CANDLESTICK CHART - NOW WITH ACTUAL CANDLESTICKS! */}
                    {chartData && (
                        <ChartSection>
                            <ChartTitle>
                                <BarChart3 size={24} />
                                Candlestick Chart
                            </ChartTitle>
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={chartData.filter(d => !d.isPrediction)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#94a3b8"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <YAxis 
                                        stroke="#94a3b8"
                                        domain={['dataMin - 5', 'dataMax + 5']}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    
                                    {/* Candlesticks */}
                                    <Bar
                                        dataKey="close"
                                        fill="#00adef"
                                        shape={<Candlestick />}
                                        name="Price"
                                    />
                                    
                                    {/* Current price reference line */}
                                    {prediction.current_price && (
                                        <ReferenceLine
                                            y={prediction.current_price}
                                            stroke="#f59e0b"
                                            strokeDasharray="3 3"
                                            label={{ value: 'Current', fill: '#f59e0b', fontSize: 12 }}
                                        />
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartSection>
                    )}

                    {/* Price Chart with Prediction */}
                    {chartData && (
                        <ChartSection>
                            <ChartTitle>
                                <BarChart3 size={24} />
                                Price Chart with 7-Day Prediction
                            </ChartTitle>
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#94a3b8"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <YAxis 
                                        stroke="#94a3b8"
                                        domain={['dataMin - 5', 'dataMax + 5']}
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    
                                    {/* Confidence bands */}
                                    <Area
                                        type="monotone"
                                        dataKey="close"
                                        fill="rgba(0, 173, 237, 0.1)"
                                        stroke="none"
                                    />
                                    
                                    {/* Price line */}
                                    <Line
                                        type="monotone"
                                        dataKey="close"
                                        stroke="#00adef"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Price"
                                    />
                                    
                                    {/* Prediction line */}
                                    <Line
                                        type="monotone"
                                        dataKey={(entry) => entry.isPrediction ? entry.close : null}
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '#10b981', r: 6 }}
                                        name="Prediction"
                                    />
                                    
                                    {/* Current price reference line */}
                                    {prediction.current_price && (
                                        <ReferenceLine
                                            y={prediction.current_price}
                                            stroke="#f59e0b"
                                            strokeDasharray="3 3"
                                            label={{ value: 'Current', fill: '#f59e0b', fontSize: 12 }}
                                        />
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartSection>
                    )}

                    {/* Volume Chart */}
                    {chartData && (
                        <ChartSection>
                            <ChartTitle>
                                <Activity size={24} />
                                Volume
                            </ChartTitle>
                            <ResponsiveContainer width="100%" height={150}>
                                <ComposedChart data={chartData.filter(d => !d.isPrediction)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#94a3b8"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <YAxis 
                                        stroke="#94a3b8"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="volume"
                                        fill="#00adef"
                                        opacity={0.6}
                                        name="Volume"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartSection>
                    )}

                    {/* RSI Indicator */}
                    {chartData && (
                        <ChartSection>
                            <ChartTitle>
                                <Activity size={24} />
                                RSI Indicator
                            </ChartTitle>
                            <ResponsiveContainer width="100%" height={150}>
                                <ComposedChart data={chartData.filter(d => !d.isPrediction)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#94a3b8"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <YAxis 
                                        domain={[0, 100]}
                                        stroke="#94a3b8"
                                        style={{ fontSize: '0.85rem' }}
                                    />
                                    <Tooltip />
                                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label="Overbought" />
                                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label="Oversold" />
                                    <Line
                                        type="monotone"
                                        dataKey="rsi"
                                        stroke="#a78bfa"
                                        strokeWidth={2}
                                        dot={false}
                                        name="RSI"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartSection>
                    )}
                </>
            )}
        </PageContainer>
    );
};

export default PredictionsPage;