// client/src/pages/SentimentPage.js - THEMED SENTIMENT PAGE

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, Search, Flame, Brain,
    ThumbsUp, ThumbsDown, Minus, RefreshCw, Zap, Target,
    Activity, MessageCircle, Heart, Repeat2, BarChart3,
    ArrowUpRight, ArrowDownRight, Clock, Sparkles, Hash,
    ExternalLink
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding: 6rem 2rem 2rem;
`;

const ContentWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

// ============ HEADER ============
const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const TitleSection = styled.div``;

const Title = styled.h1`
    font-size: 2.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #8b5cf6 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
    margin-top: 0.25rem;
`;

// ============ SEARCH BAR ============
const SearchContainer = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const SearchRow = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const SearchInputWrapper = styled.div`
    flex: 1;
    position: relative;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${props => props.theme?.brand?.primary || '#00adef'}1A;
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const SearchButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: ${props => `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'} 0%, ${props.theme?.brand?.secondary || '#0088cc'} 100%)`};
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        ${props => props.$loading && css`animation: ${rotate} 1s linear infinite;`}
    }
`;

// ============ STATS BAR ============
const StatsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 1000px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 14px;
    padding: 1.25rem;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$delay || '0s'};
    animation-fill-mode: backwards;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: ${props => props.$color || props.theme?.brand?.gradient || 'linear-gradient(90deg, #00adef, #0088cc)'};
    }
`;

const StatHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const StatIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$bg || `${props.theme?.brand?.primary || '#00adef'}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme?.brand?.primary || '#00adef'};
`;

const StatLabel = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
`;

// ============ MAIN GRID ============
const MainGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;

    @media (max-width: 1000px) {
        grid-template-columns: 1fr;
    }
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

// ============ CARDS ============
const Card = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
`;

const CardTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const CardBadge = styled.span`
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    background: ${props => props.theme?.brand?.primary || '#00adef'}26;
    border-radius: 6px;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

// ============ SENTIMENT RESULT ============
const SentimentHero = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid ${props => props.theme?.text?.tertiary || '#64748b'}33;

    @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
    }
`;

const SentimentBadge = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: ${props => {
        const success = props.theme?.success || '#10b981';
        const error = props.theme?.error || '#ef4444';
        const neutral = props.theme?.text?.tertiary || '#64748b';
        if (props.$sentiment === 'bullish') return `linear-gradient(135deg, ${success}33, ${success}1A)`;
        if (props.$sentiment === 'bearish') return `linear-gradient(135deg, ${error}33, ${error}1A)`;
        return `linear-gradient(135deg, ${neutral}33, ${neutral}1A)`;
    }};
    border: 1px solid ${props => {
        const success = props.theme?.success || '#10b981';
        const error = props.theme?.error || '#ef4444';
        const neutral = props.theme?.text?.tertiary || '#64748b';
        if (props.$sentiment === 'bullish') return `${success}66`;
        if (props.$sentiment === 'bearish') return `${error}66`;
        return `${neutral}66`;
    }};
    border-radius: 12px;
    color: ${props => {
        if (props.$sentiment === 'bullish') return props.theme?.success || '#10b981';
        if (props.$sentiment === 'bearish') return props.theme?.error || '#ef4444';
        return props.theme?.text?.secondary || '#94a3b8';
    }};
    font-size: 1.25rem;
    font-weight: 800;
`;

const SentimentInfo = styled.div`
    flex: 1;
`;

const SentimentSymbol = styled.div`
    font-size: 1.75rem;
    font-weight: 900;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }
`;

const SentimentMeta = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
`;

// ============ DISTRIBUTION BAR ============
const DistributionContainer = styled.div`
    margin-bottom: 1.5rem;
`;

const DistributionLabel = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
`;

const DistributionBar = styled.div`
    width: 100%;
    height: 12px;
    background: rgba(15, 23, 42, 0.8);
    border-radius: 6px;
    overflow: hidden;
    display: flex;
`;

const BarSegment = styled.div`
    height: 100%;
    width: ${props => props.$width}%;
    background: ${props => props.$color};
    transition: width 0.5s ease;
`;

// ============ METRICS GRID ============
const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const MetricCard = styled.div`
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid ${props => props.theme?.text?.tertiary || '#64748b'}33;
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
`;

const MetricValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
`;

// ============ AI PREDICTION ============
const PredictionCard = styled(Card)`
    border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}1A 0%, rgba(30, 41, 59, 0.9) 100%);
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px ${props => props.theme?.brand?.accent || '#8b5cf6'}40;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}, ${props => props.theme?.brand?.accent || '#7c3aed'});
        border-radius: 16px 16px 0 0;
    }
`;

const PredictionClickHint = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0.8;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 1;
    }
`;

const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const PredictionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$direction === 'UP' 
        ? `${props.theme?.success || '#10b981'}33` 
        : `${props.theme?.error || '#ef4444'}33`};
    border: 1px solid ${props => props.$direction === 'UP' 
        ? (props.theme?.success || '#10b981') 
        : (props.theme?.error || '#ef4444')};
    border-radius: 8px;
    color: ${props => props.$direction === 'UP' 
        ? (props.theme?.success || '#10b981') 
        : (props.theme?.error || '#ef4444')};
    font-size: 1rem;
    font-weight: 800;
`;

const PredictionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;

    @media (max-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const PredictionStat = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    border-radius: 10px;
    padding: 1rem;
    text-align: center;
`;

const PredStatValue = styled.div`
    font-size: 1.25rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme?.brand?.accent || '#8b5cf6'};
    margin-bottom: 0.25rem;
`;

const PredStatLabel = styled.div`
    font-size: 0.7rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
`;

// ============ TWEETS LIST ============
const TweetsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 500px;
    overflow-y: auto;
    padding-right: 0.5rem;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.5);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme?.brand?.primary || '#00adef'}4D;
        border-radius: 3px;
    }
`;

const TweetCard = styled.div`
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid ${props => props.theme?.text?.tertiary || '#64748b'}33;
    border-left: 3px solid ${props => {
        if (props.$sentiment === 'bullish') return props.theme?.success || '#10b981';
        if (props.$sentiment === 'bearish') return props.theme?.error || '#ef4444';
        return props.theme?.text?.tertiary || '#64748b';
    }};
    border-radius: 10px;
    padding: 1rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        transform: translateX(4px);
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
    gap: 0.4rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-weight: 600;
    font-size: 0.9rem;
`;

const TweetSentimentTag = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.5rem;
    background: ${props => {
        if (props.$sentiment === 'bullish') return `${props.theme?.success || '#10b981'}26`;
        if (props.$sentiment === 'bearish') return `${props.theme?.error || '#ef4444'}26`;
        return `${props.theme?.text?.tertiary || '#64748b'}26`;
    }};
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    color: ${props => {
        if (props.$sentiment === 'bullish') return props.theme?.success || '#10b981';
        if (props.$sentiment === 'bearish') return props.theme?.error || '#ef4444';
        return props.theme?.text?.secondary || '#94a3b8';
    }};
`;

const TweetText = styled.p`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
`;

const TweetMeta = styled.div`
    display: flex;
    gap: 1rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
`;

// ============ TRENDING SIDEBAR ============
const TrendingList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const TrendingItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid ${props => props.theme?.text?.tertiary || '#64748b'}33;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}4D;
        transform: translateX(4px);
    }
`;

const TrendingInfo = styled.div``;

const TrendingSymbol = styled.div`
    font-size: 1rem;
    font-weight: 800;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const TrendingMentions = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

const TrendingScore = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: ${props => props.theme?.warning || '#f59e0b'};
    font-weight: 700;
    font-size: 0.9rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}33 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed ${props => props.theme?.brand?.primary || '#00adef'}4D;
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    max-width: 400px;
    margin: 0 auto;
`;

// ============ COMPONENT ============
const SentimentPage = () => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [searchSymbol, setSearchSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [sentiment, setSentiment] = useState(null);
    const [trending, setTrending] = useState([]);
    const [marketSentiment, setMarketSentiment] = useState(null);

    // Common crypto symbols for detection
    const cryptoSymbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC', 'SHIB', 'AVAX', 'LINK', 'UNI', 'ATOM', 'LTC'];

    useEffect(() => {
        if (isAuthenticated) {
            loadTrending();
            loadMarketSentiment();
        }
    }, [isAuthenticated]);

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
            toast.warning('Please enter a symbol');
            return;
        }

        setLoading(true);
        setSentiment(null);

        try {
            const response = await api.get(`/sentiment/search/${symbol.toUpperCase()}`);
            setSentiment(response.data);
            toast.success(`Loaded sentiment for ${symbol.toUpperCase()}`);
        } catch (error) {
            console.error('Sentiment error:', error);
            toast.error(error.response?.data?.error || 'Failed to load sentiment');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleTrendingClick = (symbol) => {
        setSearchSymbol(symbol);
        handleSearch(symbol);
    };

    // Navigate to stock or crypto detail page
    const handleSymbolClick = (symbol) => {
        const upperSymbol = symbol.toUpperCase();
        const isCrypto = cryptoSymbols.includes(upperSymbol) || sentiment?.type === 'crypto';
        
        if (isCrypto) {
            // Navigate to crypto page - use lowercase for CoinGecko compatibility
            navigate(`/crypto/${upperSymbol.toLowerCase()}`);
        } else {
            // Navigate to stock page - route is /stocks/:symbol
            navigate(`/stocks/${upperSymbol}`);
        }
    };

    // Navigate to AI Predict page with the symbol pre-filled
    const handlePredictionClick = (symbol) => {
        const upperSymbol = symbol.toUpperCase();
        const isCryptoSymbol = cryptoSymbols.includes(upperSymbol) || sentiment?.type === 'crypto';
        
        // Navigate to predict page with symbol as query param
        navigate(`/predict?symbol=${upperSymbol}&type=${isCryptoSymbol ? 'crypto' : 'stock'}`);
    };

    // Theme colors
    const successColor = theme?.success || '#10b981';
    const errorColor = theme?.error || '#ef4444';
    const warningColor = theme?.warning || '#f59e0b';
    const primaryColor = theme?.brand?.primary || '#00adef';
    const accentColor = theme?.brand?.accent || '#8b5cf6';

    return (
        <PageContainer theme={theme}>
            <ContentWrapper>
                {/* Header */}
                <Header>
                    <HeaderTop>
                        <TitleSection>
                            <Title theme={theme}>
                                <MessageCircle size={32} color={primaryColor} />
                                Social Sentiment
                            </Title>
                            <Subtitle theme={theme}>Real-time sentiment analysis & AI predictions</Subtitle>
                        </TitleSection>
                    </HeaderTop>
                </Header>

                {/* Search */}
                <SearchContainer theme={theme}>
                    <SearchRow>
                        <SearchInputWrapper>
                            <SearchIcon theme={theme}>
                                <Search size={20} />
                            </SearchIcon>
                            <SearchInput
                                theme={theme}
                                type="text"
                                placeholder="Enter stock or crypto symbol (AAPL, TSLA, BTC, ETH)..."
                                value={searchSymbol}
                                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                            />
                        </SearchInputWrapper>
                        <SearchButton theme={theme} onClick={() => handleSearch()} disabled={loading} $loading={loading}>
                            {loading ? <RefreshCw size={20} /> : <Sparkles size={20} />}
                            {loading ? 'Analyzing...' : 'Analyze'}
                        </SearchButton>
                    </SearchRow>
                </SearchContainer>

                {/* Market Stats */}
                {marketSentiment && (
                    <StatsBar>
                        <StatCard theme={theme} $delay="0s" $color={`linear-gradient(90deg, ${successColor}, ${successColor})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${successColor}26`} $color={successColor}>
                                    <ThumbsUp size={16} />
                                </StatIcon>
                                <StatLabel theme={theme}>Bullish</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={successColor}>{marketSentiment.bullishPercentage}%</StatValue>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.1s" $color={`linear-gradient(90deg, ${errorColor}, ${errorColor})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${errorColor}26`} $color={errorColor}>
                                    <ThumbsDown size={16} />
                                </StatIcon>
                                <StatLabel theme={theme}>Bearish</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={errorColor}>{marketSentiment.bearishPercentage}%</StatValue>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.2s" $color={`linear-gradient(90deg, ${primaryColor}, ${primaryColor})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${primaryColor}26`} $color={primaryColor}>
                                    <MessageCircle size={16} />
                                </StatIcon>
                                <StatLabel theme={theme}>Tweets</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme}>{marketSentiment.totalTweets?.toLocaleString()}</StatValue>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.3s" $color={`linear-gradient(90deg, ${warningColor}, ${warningColor})`}>
                            <StatHeader>
                                <StatIcon theme={theme} $bg={`${warningColor}26`} $color={warningColor}>
                                    <Activity size={16} />
                                </StatIcon>
                                <StatLabel theme={theme}>Market Mood</StatLabel>
                            </StatHeader>
                            <StatValue theme={theme} $color={warningColor}>{marketSentiment.overall?.toUpperCase()}</StatValue>
                        </StatCard>
                    </StatsBar>
                )}

                {/* Main Content */}
                {sentiment ? (
                    <MainGrid>
                        <MainContent>
                            {/* Sentiment Analysis */}
                            <Card theme={theme}>
                                <CardHeader>
                                    <CardTitle theme={theme}>
                                        <Brain size={20} />
                                        Sentiment Analysis
                                    </CardTitle>
                                    <CardBadge theme={theme}>{sentiment.tweets?.length || 0} tweets analyzed</CardBadge>
                                </CardHeader>

                                <SentimentHero theme={theme}>
                                    <SentimentBadge theme={theme} $sentiment={sentiment.sentiment?.overall}>
                                        {sentiment.sentiment?.overall === 'bullish' && <TrendingUp size={24} />}
                                        {sentiment.sentiment?.overall === 'bearish' && <TrendingDown size={24} />}
                                        {sentiment.sentiment?.overall === 'neutral' && <Minus size={24} />}
                                        {sentiment.sentiment?.overall?.toUpperCase()}
                                    </SentimentBadge>
                                    <SentimentInfo>
                                        <SentimentSymbol 
                                            theme={theme} 
                                            onClick={() => handleSymbolClick(sentiment.symbol)}
                                            title={`Click to view ${sentiment.symbol} details`}
                                        >
                                            ${sentiment.symbol}
                                        </SentimentSymbol>
                                        <SentimentMeta theme={theme}>Based on recent social media activity • Click symbol for details</SentimentMeta>
                                    </SentimentInfo>
                                </SentimentHero>

                                {/* Distribution */}
                                <DistributionContainer>
                                    <DistributionLabel>
                                        <span style={{ color: successColor }}>🐂 {sentiment.sentiment?.distribution?.bullish}%</span>
                                        <span style={{ color: theme?.text?.tertiary || '#64748b' }}>{sentiment.sentiment?.distribution?.neutral}%</span>
                                        <span style={{ color: errorColor }}>{sentiment.sentiment?.distribution?.bearish}% 🐻</span>
                                    </DistributionLabel>
                                    <DistributionBar>
                                        <BarSegment $width={sentiment.sentiment?.distribution?.bullish} $color={successColor} />
                                        <BarSegment $width={sentiment.sentiment?.distribution?.neutral} $color={theme?.text?.tertiary || '#64748b'} />
                                        <BarSegment $width={sentiment.sentiment?.distribution?.bearish} $color={errorColor} />
                                    </DistributionBar>
                                </DistributionContainer>

                                {/* Metrics */}
                                <MetricsGrid>
                                    <MetricCard theme={theme}>
                                        <MetricValue theme={theme} $color={successColor}>{sentiment.sentiment?.counts?.bullish || 0}</MetricValue>
                                        <MetricLabel theme={theme}>Bullish</MetricLabel>
                                    </MetricCard>
                                    <MetricCard theme={theme}>
                                        <MetricValue theme={theme} $color={theme?.text?.tertiary || '#64748b'}>{sentiment.sentiment?.counts?.neutral || 0}</MetricValue>
                                        <MetricLabel theme={theme}>Neutral</MetricLabel>
                                    </MetricCard>
                                    <MetricCard theme={theme}>
                                        <MetricValue theme={theme} $color={errorColor}>{sentiment.sentiment?.counts?.bearish || 0}</MetricValue>
                                        <MetricLabel theme={theme}>Bearish</MetricLabel>
                                    </MetricCard>
                                </MetricsGrid>
                            </Card>

                            {/* AI Prediction */}
                            {sentiment.prediction?.prediction && (
                                <PredictionCard 
                                    theme={theme}
                                    onClick={() => handlePredictionClick(sentiment.symbol)}
                                    title={`Click to make your own prediction for ${sentiment.symbol}`}
                                >
                                    <PredictionHeader>
                                        <CardTitle theme={theme} style={{ marginBottom: 0, color: accentColor }}>
                                            <Zap size={20} />
                                            AI Price Prediction
                                        </CardTitle>
                                        <PredictionBadge theme={theme} $direction={sentiment.prediction.prediction.direction}>
                                            {sentiment.prediction.prediction.direction === 'UP' 
                                                ? <ArrowUpRight size={18} /> 
                                                : <ArrowDownRight size={18} />}
                                            {sentiment.prediction.prediction.direction === 'UP' ? 'BULLISH' : 'BEARISH'}
                                        </PredictionBadge>
                                    </PredictionHeader>

                                    <PredictionGrid>
                                        <PredictionStat theme={theme}>
                                            <PredStatValue theme={theme}>${sentiment.prediction.prediction.target_price?.toFixed(2)}</PredStatValue>
                                            <PredStatLabel theme={theme}>Target Price</PredStatLabel>
                                        </PredictionStat>
                                        <PredictionStat theme={theme}>
                                            <PredStatValue theme={theme} $color={sentiment.prediction.prediction.price_change_percent > 0 ? successColor : errorColor}>
                                                {sentiment.prediction.prediction.price_change_percent > 0 ? '+' : ''}
                                                {sentiment.prediction.prediction.price_change_percent?.toFixed(2)}%
                                            </PredStatValue>
                                            <PredStatLabel theme={theme}>Expected</PredStatLabel>
                                        </PredictionStat>
                                        <PredictionStat theme={theme}>
                                            <PredStatValue theme={theme} $color={warningColor}>
                                                {sentiment.prediction.prediction.confidence?.toFixed(0)}%
                                            </PredStatValue>
                                            <PredStatLabel theme={theme}>Confidence</PredStatLabel>
                                        </PredictionStat>
                                        <PredictionStat theme={theme}>
                                            <PredStatValue theme={theme} $color={primaryColor}>
                                                {sentiment.prediction.prediction.days}d
                                            </PredStatValue>
                                            <PredStatLabel theme={theme}>Timeframe</PredStatLabel>
                                        </PredictionStat>
                                    </PredictionGrid>

                                    <PredictionClickHint theme={theme}>
                                        <Zap size={16} />
                                        Click to make your own prediction
                                        <ExternalLink size={14} />
                                    </PredictionClickHint>
                                </PredictionCard>
                            )}

                            {/* Tweets */}
                            <Card theme={theme}>
                                <CardHeader>
                                    <CardTitle theme={theme}>
                                        <Hash size={20} />
                                        Recent Tweets
                                    </CardTitle>
                                    <CardBadge theme={theme}>{sentiment.tweets?.length || 0}</CardBadge>
                                </CardHeader>

                                <TweetsList theme={theme}>
                                    {sentiment.tweets?.map((tweet, index) => (
                                        <TweetCard theme={theme} key={index} $sentiment={tweet.sentiment?.classification}>
                                            <TweetHeader>
                                                <TweetAuthor theme={theme}>
                                                    <MessageCircle size={14} />
                                                    @{tweet.author?.username}
                                                </TweetAuthor>
                                                <TweetSentimentTag theme={theme} $sentiment={tweet.sentiment?.classification}>
                                                    {tweet.sentiment?.classification === 'bullish' && <TrendingUp size={10} />}
                                                    {tweet.sentiment?.classification === 'bearish' && <TrendingDown size={10} />}
                                                    {tweet.sentiment?.classification}
                                                </TweetSentimentTag>
                                            </TweetHeader>
                                            <TweetText theme={theme}>{tweet.text}</TweetText>
                                            <TweetMeta theme={theme}>
                                                <MetaItem>
                                                    <Heart size={12} />
                                                    {tweet.likes || 0}
                                                </MetaItem>
                                                <MetaItem>
                                                    <Repeat2 size={12} />
                                                    {tweet.reshares || 0}
                                                </MetaItem>
                                            </TweetMeta>
                                        </TweetCard>
                                    ))}
                                </TweetsList>
                            </Card>
                        </MainContent>

                        {/* Sidebar */}
                        <Sidebar>
                            <Card theme={theme}>
                                <CardHeader>
                                    <CardTitle theme={theme}>
                                        <Flame size={20} />
                                        Trending
                                    </CardTitle>
                                </CardHeader>
                                <TrendingList>
                                    {trending.map((item, index) => (
                                        <TrendingItem theme={theme} key={index} onClick={() => handleTrendingClick(item.symbol)}>
                                            <TrendingInfo>
                                                <TrendingSymbol theme={theme}>${item.symbol}</TrendingSymbol>
                                                <TrendingMentions theme={theme}>{item.mentions} mentions</TrendingMentions>
                                            </TrendingInfo>
                                            <TrendingScore theme={theme}>
                                                <Flame size={14} />
                                                {Math.round(item.score)}
                                            </TrendingScore>
                                        </TrendingItem>
                                    ))}
                                </TrendingList>
                            </Card>
                        </Sidebar>
                    </MainGrid>
                ) : (
                    <MainGrid>
                        <MainContent>
                            <EmptyState theme={theme}>
                                <EmptyIcon theme={theme}>
                                    <MessageCircle size={48} color={primaryColor} />
                                </EmptyIcon>
                                <EmptyTitle theme={theme}>Search for Sentiment</EmptyTitle>
                                <EmptyText theme={theme}>
                                    Enter a stock or crypto symbol to analyze social sentiment and get AI-powered predictions
                                </EmptyText>
                            </EmptyState>
                        </MainContent>

                        <Sidebar>
                            <Card theme={theme}>
                                <CardHeader>
                                    <CardTitle theme={theme}>
                                        <Flame size={20} />
                                        Trending
                                    </CardTitle>
                                </CardHeader>
                                <TrendingList>
                                    {trending.length > 0 ? trending.map((item, index) => (
                                        <TrendingItem theme={theme} key={index} onClick={() => handleTrendingClick(item.symbol)}>
                                            <TrendingInfo>
                                                <TrendingSymbol theme={theme}>${item.symbol}</TrendingSymbol>
                                                <TrendingMentions theme={theme}>{item.mentions} mentions</TrendingMentions>
                                            </TrendingInfo>
                                            <TrendingScore theme={theme}>
                                                <Flame size={14} />
                                                {Math.round(item.score)}
                                            </TrendingScore>
                                        </TrendingItem>
                                    )) : (
                                        <div style={{ color: theme?.text?.tertiary || '#64748b', textAlign: 'center', padding: '1rem' }}>
                                            Loading trending...
                                        </div>
                                    )}
                                </TrendingList>
                            </Card>
                        </Sidebar>
                    </MainGrid>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default SentimentPage;