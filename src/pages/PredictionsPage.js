// client/src/pages/PredictionsPage.js - WITH AI INSIGHTS

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Minus, Brain, Target, AlertCircle, Zap, Lightbulb, Shield, Clock } from 'lucide-react';

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
    max-width: 1400px;
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

const TechnicalGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
`;

const TechnicalItem = styled.div`
    text-align: center;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
`;

const TechLabel = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 0.3rem;
`;

const TechValue = styled.div`
    font-size: 1.2rem;
    font-weight: bold;
    color: #f8fafc;
`;

// ✅ NEW: AI Insights Section
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

const PredictionsPage = () => {
    const { api, isAuthenticated } = useAuth();
    const [symbol, setSymbol] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [insights, setInsights] = useState(null);
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

        try {
            // Get prediction
            const predResponse = await api.post('/predictions/predict', {
                symbol: symbol.toUpperCase(),
                days: 7
            });

            setPrediction(predResponse.data);

            // Get AI insights
            setLoadingInsights(true);
            try {
                const insightsResponse = await api.post('/predictions/analyze', {
                    symbol: symbol.toUpperCase()
                });
                setInsights(insightsResponse.data.insights);
            } catch (insErr) {
                console.error('Insights error:', insErr);
                // Don't fail the whole request if insights fail
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

    const getDirectionIcon = (direction) => {
        if (direction === 'UP') return <TrendingUp size={24} />;
        if (direction === 'DOWN') return <TrendingDown size={24} />;
        return <Minus size={24} />;
    };

    return (
        <PageContainer>
            <Header>AI Stock Predictions</Header>
            <Subtitle>Get AI-powered price predictions with confidence scores and insights</Subtitle>

            <SearchSection>
                <SearchForm onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Enter stock symbol (e.g., AAPL, TSLA, MSFT)"
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
                                <BoxValue>
                                    ${prediction.prediction?.target_price?.toFixed(2)}
                                </BoxValue>
                                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                                    {prediction.prediction?.price_change_percent > 0 ? '+' : ''}
                                    {prediction.prediction?.price_change_percent?.toFixed(2)}%
                                </div>
                            </PredictionBox>
                        </PredictionGrid>

                        {prediction.signals && prediction.signals.length > 0 && (
                            <SignalsSection>
                                <SectionTitle>
                                    <Zap size={20} />
                                    Trading Signals
                                </SectionTitle>
                                <SignalsList>
                                    {prediction.signals.map((signal, index) => (
                                        <SignalItem key={index}>{signal}</SignalItem>
                                    ))}
                                </SignalsList>
                            </SignalsSection>
                        )}

                        {prediction.technical_analysis && (
                            <SignalsSection>
                                <SectionTitle>Technical Analysis</SectionTitle>
                                <TechnicalGrid>
                                    <TechnicalItem>
                                        <TechLabel>RSI</TechLabel>
                                        <TechValue>{prediction.technical_analysis.rsi?.toFixed(1)}</TechValue>
                                    </TechnicalItem>
                                    <TechnicalItem>
                                        <TechLabel>MACD Signal</TechLabel>
                                        <TechValue>{prediction.technical_analysis.macd_signal}</TechValue>
                                    </TechnicalItem>
                                    <TechnicalItem>
                                        <TechLabel>Volatility</TechLabel>
                                        <TechValue>{prediction.technical_analysis.volatility?.toFixed(1)}%</TechValue>
                                    </TechnicalItem>
                                    <TechnicalItem>
                                        <TechLabel>Volume</TechLabel>
                                        <TechValue>{prediction.technical_analysis.volume_status}</TechValue>
                                    </TechnicalItem>
                                </TechnicalGrid>
                            </SignalsSection>
                        )}
                    </PredictionCard>

                    {/* ✅ AI INSIGHTS SECTION */}
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
                                            <InsightText>💡 {insight}</InsightText>
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
                </>
            )}
        </PageContainer>
    );
};

export default PredictionsPage;