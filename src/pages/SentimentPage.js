// client/src/pages/SentimentPage.js - SOCIAL SENTIMENT + AI PREDICTIONS 🔥

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, Twitter, Search, Flame, Brain,
    ThumbsUp, ThumbsDown, Minus, RefreshCw, Zap, Target,
    Award, Activity, Clock, Users, MessageCircle, Heart,
    Repeat2, BarChart3, PieChart, ArrowUpCircle, ArrowDownCircle,
    Calendar, Percent
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 2rem;
    padding-top: 100px;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3rem;
    background: linear-gradient(135deg, #1DA1F2 0%, #00adef 50%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(29, 161, 242, 0.2);
    border: 1px solid rgba(29, 161, 242, 0.4);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #1DA1F2;
    margin-top: 1rem;
`;

// Search Section
const SearchSection = styled.div`
    max-width: 800px;
    margin: 0 auto 3rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(29, 161, 242, 0.3);
    border-radius: 20px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const SearchInputWrapper = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 1rem 1.5rem;
    background: rgba(29, 161, 242, 0.05);
    border: 2px solid rgba(29, 161, 242, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #1DA1F2;
        box-shadow: 0 0 20px rgba(29, 161, 242, 0.3);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SearchButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #1DA1F2 0%, #00adef 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(29, 161, 242, 0.5);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const LoadingSpinner = styled(RefreshCw)`
    animation: ${spin} 1s linear infinite;
`;

// Stats Banner
const StatsBanner = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(29, 161, 242, 0.15) 0%, rgba(0, 173, 237, 0.15) 100%);
    border: 2px solid rgba(29, 161, 242, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(29, 161, 242, 0.6);
        box-shadow: 0 10px 30px rgba(29, 161, 242, 0.3);
    }
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    background: ${props => props.gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 3s ease-in-out infinite;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.color || '#1DA1F2'};
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

// Content Grid
const ContentGrid = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

// Sentiment Result Card
const SentimentCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(29, 161, 242, 0.3);
    border-radius: 20px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const CardTitle = styled.h3`
    color: #1DA1F2;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SentimentBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: ${props => {
        if (props.$sentiment === 'bullish') return 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))';
        if (props.$sentiment === 'bearish') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))';
        return 'linear-gradient(135deg, rgba(100, 116, 139, 0.3), rgba(71, 85, 105, 0.3))';
    }};
    border: 2px solid ${props => {
        if (props.$sentiment === 'bullish') return 'rgba(16, 185, 129, 0.5)';
        if (props.$sentiment === 'bearish') return 'rgba(239, 68, 68, 0.5)';
        return 'rgba(100, 116, 139, 0.5)';
    }};
    border-radius: 16px;
    color: ${props => {
        if (props.$sentiment === 'bullish') return '#10b981';
        if (props.$sentiment === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
`;

// Prediction Card Styles
const PredictionCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 20px;
    padding: 2rem;
    margin-top: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;

const PredictionBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: ${props => props.$direction === 'UP' ? 
        'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))' : 
        'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))'};
    border: 2px solid ${props => props.$direction === 'UP' ? '#10b981' : '#ef4444'};
    border-radius: 12px;
    color: ${props => props.$direction === 'UP' ? '#10b981' : '#ef4444'};
    font-size: 1.3rem;
    font-weight: 900;
`;

const PredictionStats = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const PredictionStat = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
`;

const PredStatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$color || '#8b5cf6'};
    margin-bottom: 0.5rem;
`;

const PredStatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const DistributionBar = styled.div`
    width: 100%;
    height: 40px;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    margin: 1rem 0;
`;

const BarSegment = styled.div`
    height: 100%;
    width: ${props => props.$width}%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    transition: width 1s ease;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1.5rem 0;
`;

const MetricBox = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(29, 161, 242, 0.2);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
`;

const MetricValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$color || '#1DA1F2'};
    margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
`;

// Tweet List
const TweetList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 600px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(29, 161, 242, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(29, 161, 242, 0.5);
        border-radius: 4px;
    }
`;

const TweetCard = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(29, 161, 242, 0.2);
    border-left: 4px solid ${props => {
        if (props.$sentiment === 'bullish') return '#10b981';
        if (props.$sentiment === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        transform: translateX(5px);
    }
`;

const TweetHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const TweetAuthor = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #1DA1F2;
    font-weight: 600;
`;

const TweetSentiment = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    background: ${props => {
        if (props.$sentiment === 'bullish') return 'rgba(16, 185, 129, 0.2)';
        if (props.$sentiment === 'bearish') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(100, 116, 139, 0.2)';
    }};
    border-radius: 12px;
    font-size: 0.8rem;
    color: ${props => {
        if (props.$sentiment === 'bullish') return '#10b981';
        if (props.$sentiment === 'bearish') return '#ef4444';
        return '#94a3b8';
    }};
`;

const TweetText = styled.p`
    color: #e0e6ed;
    line-height: 1.6;
    margin-bottom: 0.5rem;
`;

const TweetMeta = styled.div`
    display: flex;
    gap: 1rem;
    color: #64748b;
    font-size: 0.85rem;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

// Trending Section
const TrendingList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const TrendingItem = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(29, 161, 242, 0.2);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        border-color: rgba(29, 161, 242, 0.5);
        transform: translateX(5px);
    }
`;

const TrendingSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    color: #1DA1F2;
`;

const TrendingScore = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #f59e0b;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const EmptyIcon = styled.div`
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, rgba(29, 161, 242, 0.2), rgba(29, 161, 242, 0.05));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: #1DA1F2;
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

// ============ COMPONENT ============
const SentimentPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const [searchSymbol, setSearchSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [sentiment, setSentiment] = useState(null);
    const [trending, setTrending] = useState([]);
    const [marketSentiment, setMarketSentiment] = useState(null);

    // Load trending stocks on mount
    useEffect(() => {
        loadTrending();
        loadMarketSentiment();
    }, []);

    const loadTrending = async () => {
        try {
            const response = await api.get('/sentiment/trending?limit=10');
            setTrending(response.data.trending || []);
        } catch (error) {
            console.error('Error loading trending:', error);
        }
    };

    const loadMarketSentiment = async () => {
        try {
            const response = await api.get('/sentiment/market');
            setMarketSentiment(response.data.market);
        } catch (error) {
            console.error('Error loading market sentiment:', error);
        }
    };

    const handleSearch = async (symbol = searchSymbol) => {
        if (!symbol.trim()) {
            toast.warning('Please enter a stock or crypto symbol', 'Missing Symbol');
            return;
        }

        setLoading(true);
        setSentiment(null);

        try {
            const response = await api.get(`/sentiment/search/${symbol.toUpperCase()}`);
            setSentiment(response.data);
            toast.success(`Sentiment loaded for ${symbol.toUpperCase()}`, 'Success');
        } catch (error) {
            console.error('Sentiment error:', error);
            toast.error(error.response?.data?.error || 'Failed to load sentiment', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleTrendingClick = (symbol) => {
        setSearchSymbol(symbol);
        handleSearch(symbol);
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <Twitter size={48} color="#1DA1F2" />
                    Social Sentiment
                </Title>
                <Subtitle>Real-time sentiment analysis + AI predictions for stocks & crypto</Subtitle>
                <PoweredBy>
                    <Zap size={18} />
                    Powered by StockTwits + AI
                </PoweredBy>
            </Header>

            {/* Market Overview */}
            {marketSentiment && (
                <StatsBanner>
                    <StatCard>
                        <StatIcon gradient="linear-gradient(135deg, #10b981, #059669)">
                            <ThumbsUp size={32} />
                        </StatIcon>
                        <StatValue color="#10b981">
                            {marketSentiment.bullishPercentage}%
                        </StatValue>
                        <StatLabel>Bullish Sentiment</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatIcon gradient="linear-gradient(135deg, #ef4444, #dc2626)">
                            <ThumbsDown size={32} />
                        </StatIcon>
                        <StatValue color="#ef4444">
                            {marketSentiment.bearishPercentage}%
                        </StatValue>
                        <StatLabel>Bearish Sentiment</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatIcon gradient="linear-gradient(135deg, #1DA1F2, #00adef)">
                            <MessageCircle size={32} />
                        </StatIcon>
                        <StatValue color="#1DA1F2">
                            {marketSentiment.totalTweets}
                        </StatValue>
                        <StatLabel>Total Tweets Analyzed</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatIcon gradient="linear-gradient(135deg, #f59e0b, #d97706)">
                            <Activity size={32} />
                        </StatIcon>
                        <StatValue color="#f59e0b">
                            {marketSentiment.overall.toUpperCase()}
                        </StatValue>
                        <StatLabel>Overall Market Mood</StatLabel>
                    </StatCard>
                </StatsBanner>
            )}

            {/* Search Section */}
            <SearchSection>
                <SearchInputWrapper>
                    <SearchInput
                        type="text"
                        placeholder="Enter stock symbol (AAPL, TSLA) or crypto (BTC, ETH)..."
                        value={searchSymbol}
                        onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <SearchButton onClick={() => handleSearch()} disabled={loading}>
                        {loading ? (
                            <>
                                <LoadingSpinner size={20} />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Search size={20} />
                                Search
                            </>
                        )}
                    </SearchButton>
                </SearchInputWrapper>
            </SearchSection>

            {/* Results */}
            {sentiment ? (
                <ContentGrid>
                    <div>
                        <SentimentCard>
                            <CardTitle>
                                <Brain size={24} />
                                Sentiment Analysis: ${sentiment.symbol}
                            </CardTitle>

                            <SentimentBadge $sentiment={sentiment.sentiment.overall}>
                                {sentiment.sentiment.overall === 'bullish' && <TrendingUp size={28} />}
                                {sentiment.sentiment.overall === 'bearish' && <TrendingDown size={28} />}
                                {sentiment.sentiment.overall === 'neutral' && <Minus size={28} />}
                                {sentiment.sentiment.overall.toUpperCase()}
                            </SentimentBadge>

                            <DistributionBar>
                                <BarSegment 
                                    $width={sentiment.sentiment.distribution.bullish} 
                                    $color="linear-gradient(90deg, #10b981, #059669)"
                                >
                                    {sentiment.sentiment.distribution.bullish}% 🐂
                                </BarSegment>
                                <BarSegment 
                                    $width={sentiment.sentiment.distribution.neutral} 
                                    $color="linear-gradient(90deg, #64748b, #475569)"
                                >
                                    {sentiment.sentiment.distribution.neutral}%
                                </BarSegment>
                                <BarSegment 
                                    $width={sentiment.sentiment.distribution.bearish} 
                                    $color="linear-gradient(90deg, #ef4444, #dc2626)"
                                >
                                    {sentiment.sentiment.distribution.bearish}% 🐻
                                </BarSegment>
                            </DistributionBar>

                            <MetricsGrid>
                                <MetricBox>
                                    <MetricValue $color="#10b981">
                                        {sentiment.sentiment.counts.bullish}
                                    </MetricValue>
                                    <MetricLabel>Bullish Tweets</MetricLabel>
                                </MetricBox>
                                <MetricBox>
                                    <MetricValue $color="#64748b">
                                        {sentiment.sentiment.counts.neutral}
                                    </MetricValue>
                                    <MetricLabel>Neutral Tweets</MetricLabel>
                                </MetricBox>
                                <MetricBox>
                                    <MetricValue $color="#ef4444">
                                        {sentiment.sentiment.counts.bearish}
                                    </MetricValue>
                                    <MetricLabel>Bearish Tweets</MetricLabel>
                                </MetricBox>
                            </MetricsGrid>
                        </SentimentCard>

                        {/* 🔥 AI PREDICTION CARD */}
                        {sentiment.prediction && sentiment.prediction.prediction && (
                            <PredictionCard>
                                <PredictionHeader>
                                    <CardTitle style={{ marginBottom: 0 }}>
                                        <Brain size={24} />
                                        AI Prediction: ${sentiment.symbol}
                                    </CardTitle>
                                    <PredictionBadge $direction={sentiment.prediction.prediction.direction}>
                                        {sentiment.prediction.prediction.direction === 'UP' ? (
                                            <TrendingUp size={28} />
                                        ) : (
                                            <TrendingDown size={28} />
                                        )}
                                        {sentiment.prediction.prediction.direction === 'UP' ? 'BULLISH' : 'BEARISH'}
                                    </PredictionBadge>
                                </PredictionHeader>

                                <PredictionStats>
                                    <PredictionStat>
                                        <PredStatValue $color="#8b5cf6">
                                            ${sentiment.prediction.prediction.target_price.toFixed(2)}
                                        </PredStatValue>
                                        <PredStatLabel>Target Price</PredStatLabel>
                                    </PredictionStat>

                                    <PredictionStat>
                                        <PredStatValue $color={sentiment.prediction.prediction.price_change_percent > 0 ? '#10b981' : '#ef4444'}>
                                            {sentiment.prediction.prediction.price_change_percent > 0 ? '+' : ''}
                                            {sentiment.prediction.prediction.price_change_percent.toFixed(2)}%
                                        </PredStatValue>
                                        <PredStatLabel>Expected Change</PredStatLabel>
                                    </PredictionStat>

                                    <PredictionStat>
                                        <PredStatValue $color="#f59e0b">
                                            {sentiment.prediction.prediction.confidence.toFixed(1)}%
                                        </PredStatValue>
                                        <PredStatLabel>Confidence</PredStatLabel>
                                    </PredictionStat>

                                    <PredictionStat>
                                        <PredStatValue $color="#1DA1F2">
                                            {sentiment.prediction.prediction.days} days
                                        </PredStatValue>
                                        <PredStatLabel>Timeframe</PredStatLabel>
                                    </PredictionStat>
                                </PredictionStats>
                            </PredictionCard>
                        )}

                        <SentimentCard style={{ marginTop: '2rem' }}>
                            <CardTitle>
                                <MessageCircle size={24} />
                                Recent Tweets ({sentiment.tweets.length})
                            </CardTitle>

                            <TweetList>
                                {sentiment.tweets.map((tweet, index) => (
                                    <TweetCard key={index} $sentiment={tweet.sentiment.classification}>
                                        <TweetHeader>
                                            <TweetAuthor>
                                                <Twitter size={16} />
                                                @{tweet.author.username}
                                            </TweetAuthor>
                                            <TweetSentiment $sentiment={tweet.sentiment.classification}>
                                                {tweet.sentiment.classification === 'bullish' && <TrendingUp size={14} />}
                                                {tweet.sentiment.classification === 'bearish' && <TrendingDown size={14} />}
                                                {tweet.sentiment.classification === 'neutral' && <Minus size={14} />}
                                                {tweet.sentiment.classification}
                                            </TweetSentiment>
                                        </TweetHeader>
                                        <TweetText>{tweet.text}</TweetText>
                                        <TweetMeta>
                                            <MetaItem>
                                                <Heart size={14} />
                                                {tweet.likes}
                                            </MetaItem>
                                            <MetaItem>
                                                <Repeat2 size={14} />
                                                {tweet.reshares || 0}
                                            </MetaItem>
                                        </TweetMeta>
                                    </TweetCard>
                                ))}
                            </TweetList>
                        </SentimentCard>
                    </div>

                    <div>
                        <SentimentCard>
                            <CardTitle>
                                <Flame size={24} />
                                Trending Now
                            </CardTitle>
                            <TrendingList>
                                {trending.map((item, index) => (
                                    <TrendingItem 
                                        key={index}
                                        onClick={() => handleTrendingClick(item.symbol)}
                                    >
                                        <div>
                                            <TrendingSymbol>${item.symbol}</TrendingSymbol>
                                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                {item.mentions} mentions
                                            </div>
                                        </div>
                                        <TrendingScore>
                                            <Flame size={20} />
                                            {Math.round(item.score)}
                                        </TrendingScore>
                                    </TrendingItem>
                                ))}
                            </TrendingList>
                        </SentimentCard>
                    </div>
                </ContentGrid>
            ) : (
                <EmptyState>
                    <EmptyIcon>
                        <Twitter size={80} color="#1DA1F2" />
                    </EmptyIcon>
                    <EmptyTitle>Search Stock Sentiment</EmptyTitle>
                    <EmptyText>
                        Enter a stock or crypto symbol to analyze real-time sentiment + get AI predictions
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default SentimentPage;