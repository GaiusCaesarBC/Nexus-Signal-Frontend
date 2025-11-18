// client/src/pages/NewsPage.js - THE MOST LEGENDARY NEWS FEED WITH AI SENTIMENT ANALYSIS

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Newspaper, TrendingUp, TrendingDown, Minus, Search, Filter,
    Calendar, Clock, ExternalLink, Bookmark, BookmarkPlus, Share2,
    ThumbsUp, ThumbsDown, MessageSquare, Eye, Sparkles, Zap,
    AlertCircle, Target, BarChart3, Globe, Twitter, Linkedin,
    Copy, X, ChevronDown, ChevronUp, RefreshCw, Flame, Award,
    Brain, Activity, DollarSign, Star
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const neonGlow = keyframes`
    0%, 100% {
        text-shadow: 
            0 0 10px rgba(0, 173, 237, 0.8),
            0 0 20px rgba(0, 173, 237, 0.6);
    }
    50% {
        text-shadow: 
            0 0 20px rgba(0, 173, 237, 1),
            0 0 40px rgba(0, 173, 237, 0.8);
    }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    animation: ${neonGlow} 2s ease-in-out infinite;

    @media (max-width: 768px) {
        font-size: 2.5rem;
        flex-direction: column;
    }
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 255, 136, 0.2) 100%);
    border: 1px solid rgba(0, 173, 237, 0.4);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #00adef;
    animation: ${glow} 3s ease-in-out infinite;
`;

// ============ FILTERS & SEARCH ============
const ControlsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchBar = styled.div`
    flex: 1;
    position: relative;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
`;

const FilterButtons = styled.div`
    display: flex;
    gap: 0.75rem;

    @media (max-width: 768px) {
        width: 100%;
        overflow-x: auto;
    }
`;

const FilterButton = styled.button`
    padding: 1rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
        transform: translateY(-2px);
    }
`;

const RefreshButton = styled.button`
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
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
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    ${props => props.$loading && css`
        animation: ${pulse} 1.5s ease-in-out infinite;
    `}
`;

const SpinningIcon = styled(RefreshCw)`
    ${props => props.$spinning && css`
        animation: ${spin} 1s linear infinite;
    `}
`;

// ============ TABS ============
const TabsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    border-bottom: 2px solid rgba(0, 173, 237, 0.2);
    overflow-x: auto;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 2px;
    }
`;

const Tab = styled.button`
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid ${props => props.$active ? '#00adef' : 'transparent'};
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        color: #00adef;
    }
`;

// ============ NEWS GRID ============
const NewsGrid = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const NewsCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    cursor: pointer;
    position: relative;

    &:hover {
        transform: translateY(-8px);
        border-color: rgba(0, 173, 237, 0.6);
        box-shadow: 0 20px 60px rgba(0, 173, 237, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: ${props => {
            if (props.$sentiment === 'bullish') return 'linear-gradient(90deg, #10b981, #059669)';
            if (props.$sentiment === 'bearish') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            return 'linear-gradient(90deg, #f59e0b, #d97706)';
        }};
    }
`;

const NewsImage = styled.div`
    width: 100%;
    height: 200px;
    background: ${props => props.$src ? 
        `url(${props.$src}) center/cover` : 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.8) 100%);
    }
`;

const NewsImagePlaceholder = styled.div`
    color: #64748b;
    z-index: 1;
`;

const SentimentBadge = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background: ${props => {
        if (props.$sentiment === 'bullish') return 'rgba(16, 185, 129, 0.9)';
        if (props.$sentiment === 'bearish') return 'rgba(239, 68, 68, 0.9)';
        return 'rgba(245, 158, 11, 0.9)';
    }};
    backdrop-filter: blur(10px);
    border-radius: 20px;
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const TrendingBadge = styled.div`
    position: absolute;
    top: 1rem;
    left: 1rem;
    padding: 0.5rem 0.75rem;
    background: rgba(245, 158, 11, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 2;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const NewsContent = styled.div`
    padding: 1.5rem;
`;

const NewsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
    gap: 1rem;
`;

const NewsSource = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 600;
`;

const SourceIcon = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef, #00ff88);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 900;
    color: white;
`;

const NewsActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$active ? 
        'rgba(245, 158, 11, 0.2)' :
        'rgba(0, 173, 237, 0.1)'
    };
    border: 1px solid ${props => props.$active ? 
        'rgba(245, 158, 11, 0.3)' :
        'rgba(0, 173, 237, 0.3)'
    };
    color: ${props => props.$active ? '#f59e0b' : '#00adef'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active ? 
            'rgba(245, 158, 11, 0.3)' :
            'rgba(0, 173, 237, 0.2)'
        };
        transform: scale(1.1);
    }
`;

const NewsTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 700;
    color: #e0e6ed;
    margin-bottom: 0.75rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const NewsDescription = styled.p`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const NewsMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 173, 237, 0.2);
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.85rem;
`;

const RelatedTickers = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const TickerTag = styled.span`
    padding: 0.25rem 0.75rem;
    background: rgba(0, 173, 237, 0.2);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #00adef;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.3);
        transform: translateY(-2px);
    }
`;

const AISummaryButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 10px;
    color: #a78bfa;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    margin-top: 1rem;

    &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%);
        border-color: rgba(139, 92, 246, 0.5);
        transform: translateY(-2px);
    }
`;

// ============ MODAL ============
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 2rem;
    animation: ${fadeIn} 0.3s ease-out;
    overflow-y: auto;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 2px solid rgba(0, 173, 237, 0.5);
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${fadeIn} 0.5s ease-out;
    position: relative;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 4px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
        transform: scale(1.1);
    }
`;

const ModalTitle = styled.h2`
    color: #00adef;
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    padding-right: 3rem;
    line-height: 1.3;
`;

const ModalMeta = styled.div`
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
`;

const ModalMetaItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const ModalMetaLabel = styled.span`
    color: #64748b;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ModalMetaValue = styled.span`
    color: #e0e6ed;
    font-weight: 600;
`;

const AISummarySection = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
`;

const AISummaryTitle = styled.h3`
    color: #a78bfa;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AISummaryText = styled.p`
    color: #e0e6ed;
    line-height: 1.8;
    font-size: 1rem;
`;

const ModalBody = styled.div`
    color: #94a3b8;
    font-size: 1.05rem;
    line-height: 1.8;
    margin-bottom: 2rem;

    p {
        margin-bottom: 1rem;
    }
`;

const ModalActions = styled.div`
    display: flex;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 173, 237, 0.2);
`;

const ModalButton = styled.button`
    flex: 1;
    padding: 1rem;
    background: ${props => props.$primary ? 
        'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' :
        'rgba(0, 173, 237, 0.1)'
    };
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: ${props => props.$primary ? 'white' : '#00adef'};
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
    }
`;

// ============ EMPTY & LOADING STATES ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed rgba(0, 173, 237, 0.4);
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: #00adef;
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
`;

const LoadingSpinner = styled(Sparkles)`
    animation: ${spin} 1s linear infinite;
    color: #00adef;
`;

const LoadingText = styled.div`
    color: #94a3b8;
    font-size: 1.1rem;
`;

// ============ COMPONENT ============
const NewsPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // all, stocks, crypto, trending
    const [sentimentFilter, setSentimentFilter] = useState('all'); // all, bullish, bearish, neutral
    const [savedArticles, setSavedArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Load saved articles from localStorage
        const saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
        setSavedArticles(saved);
        
        // Fetch initial articles
        fetchNews();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [articles, searchTerm, activeTab, sentimentFilter]);

    const fetchNews = async () => {
        setLoading(true);
        
        try {
            // Mock data for now - replace with real API
            const mockArticles = generateMockArticles();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setArticles(mockArticles);
            toast.success(`Loaded ${mockArticles.length} latest articles`, 'News Updated');
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Failed to load news feed', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const generateMockArticles = () => {
        const articles = [
            {
                id: 1,
                title: "Tesla Stock Surges 15% After Record Q4 Deliveries Beat Expectations",
                description: "Electric vehicle maker Tesla reported record deliveries for Q4, beating analyst expectations and sending shares soaring in after-hours trading.",
                content: "Tesla Inc. announced today that it delivered over 484,000 vehicles in Q4 2024, significantly exceeding Wall Street's expectations of 450,000 units. The strong performance was driven by increased production at the company's factories in Shanghai and Berlin, as well as robust demand for the Model Y and Model 3 vehicles. CEO Elon Musk stated that the company is on track to achieve its ambitious production goals for 2025.",
                source: "MarketWatch",
                sentiment: "bullish",
                confidence: 92,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                category: "stocks",
                tickers: ["TSLA"],
                image: null,
                trending: true,
                url: "#"
            },
            {
                id: 2,
                title: "Bitcoin Breaks $45,000 as Institutional Investment Continues to Surge",
                description: "Bitcoin reaches new 2024 high amid growing institutional adoption and positive regulatory developments.",
                content: "Bitcoin surged past $45,000 today, marking its highest level since early 2023. The rally was fueled by continued institutional buying, with several major asset managers announcing expanded cryptocurrency offerings. BlackRock's spot Bitcoin ETF saw record inflows of $500 million in a single day. Market analysts suggest this could be the beginning of a broader rally in the crypto sector.",
                source: "CoinDesk",
                sentiment: "bullish",
                confidence: 88,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                category: "crypto",
                tickers: ["BTC", "ETH"],
                image: null,
                trending: true,
                url: "#"
            },
            {
                id: 3,
                title: "Fed Signals Potential Rate Cuts in 2025, Markets Rally on Dovish Tone",
                description: "Federal Reserve Chair Jerome Powell hints at possible interest rate reductions if inflation continues to moderate.",
                content: "In testimony before Congress today, Federal Reserve Chair Jerome Powell indicated that the central bank may consider cutting interest rates in 2025 if inflation continues its downward trajectory. The comments sparked a broad rally across equity markets, with the S&P 500 gaining 2.3%. Technology stocks led the advance, with investors anticipating improved conditions for growth-oriented companies.",
                source: "Bloomberg",
                sentiment: "bullish",
                confidence: 85,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                category: "stocks",
                tickers: ["SPY", "QQQ"],
                image: null,
                trending: false,
                url: "#"
            },
            {
                id: 4,
                title: "Ethereum Network Upgrade Delayed, Price Drops 5% on Development Concerns",
                description: "Developers announce postponement of major Ethereum upgrade, citing need for additional testing and security audits.",
                content: "The Ethereum Foundation announced today that the highly anticipated 'Dencun' upgrade will be delayed by approximately 6 weeks to allow for comprehensive security audits. The delay comes after developers identified potential vulnerabilities during final testing phases. ETH price dropped 5% on the news, though analysts remain optimistic about the long-term benefits of the upgrade once implemented.",
                source: "CryptoSlate",
                sentiment: "bearish",
                confidence: 78,
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                category: "crypto",
                tickers: ["ETH"],
                image: null,
                trending: false,
                url: "#"
            },
            {
                id: 5,
                title: "NVIDIA Announces Next-Gen AI Chips, Stock Hits All-Time High",
                description: "Chip giant unveils revolutionary AI processors that could reshape the artificial intelligence landscape.",
                content: "NVIDIA Corporation today unveiled its next-generation AI processors, the B200 series, promising 30x better performance than current models. CEO Jensen Huang demonstrated the chips' capabilities in large language model training, showing dramatic improvements in both speed and energy efficiency. The announcement sent NVDA shares to a new all-time high, with analysts raising price targets across the board.",
                source: "TechCrunch",
                sentiment: "bullish",
                confidence: 95,
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                category: "stocks",
                tickers: ["NVDA", "AMD"],
                image: null,
                trending: true,
                url: "#"
            },
            {
                id: 6,
                title: "SEC Launches Investigation into Major Crypto Exchange Over Trading Practices",
                description: "Regulatory scrutiny intensifies as securities regulator probes potential market manipulation.",
                content: "The Securities and Exchange Commission has opened a formal investigation into Binance, one of the world's largest cryptocurrency exchanges, according to sources familiar with the matter. The probe focuses on potential market manipulation and undisclosed conflicts of interest. Binance stated it is cooperating fully with regulators. The news sent ripples through the crypto market, with Bitcoin briefly dipping below $43,000.",
                source: "Reuters",
                sentiment: "bearish",
                confidence: 82,
                timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
                category: "crypto",
                tickers: ["BTC", "BNB"],
                image: null,
                trending: false,
                url: "#"
            },
            {
                id: 7,
                title: "Apple Reports Mixed Earnings, iPhone Sales Disappoint but Services Revenue Shines",
                description: "Tech giant beats on earnings but misses on revenue as iPhone sales slow in key markets.",
                content: "Apple Inc. reported quarterly earnings that beat analyst expectations on the bottom line but fell short on revenue. iPhone sales declined 3% year-over-year, particularly weak in China. However, the Services division posted record revenue of $23.1 billion, growing 16% annually. CEO Tim Cook emphasized the company's focus on expanding its services ecosystem and upcoming AI features.",
                source: "CNBC",
                sentiment: "neutral",
                confidence: 75,
                timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
                category: "stocks",
                tickers: ["AAPL"],
                image: null,
                trending: false,
                url: "#"
            },
            {
                id: 8,
                title: "Solana DeFi Ecosystem Sees Explosive Growth, TVL Surpasses $5 Billion",
                description: "Decentralized finance on Solana reaches new milestone as developers flock to the high-speed blockchain.",
                content: "Total Value Locked (TVL) in Solana's DeFi ecosystem has surpassed $5 billion for the first time, driven by strong growth in decentralized exchanges and lending protocols. The surge comes as developers continue to build on Solana's high-speed, low-cost infrastructure. SOL price rallied 12% following the announcement, with analysts predicting further gains as adoption accelerates.",
                source: "DeFi Pulse",
                sentiment: "bullish",
                confidence: 87,
                timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
                category: "crypto",
                tickers: ["SOL"],
                image: null,
                trending: true,
                url: "#"
            },
            {
                id: 9,
                title: "Amazon Announces Massive $50B Investment in AI Infrastructure",
                description: "E-commerce giant commits to building next-generation data centers to power AI services.",
                content: "Amazon Web Services announced a $50 billion investment plan to expand its AI infrastructure over the next three years. The investment will focus on building state-of-the-art data centers equipped with the latest AI accelerators. AWS CEO Adam Selipsky stated that demand for AI computing capacity has exceeded all expectations, and the company is positioning itself to be the leading provider of AI infrastructure globally.",
                source: "The Wall Street Journal",
                sentiment: "bullish",
                confidence: 90,
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                category: "stocks",
                tickers: ["AMZN", "MSFT", "GOOGL"],
                image: null,
                trending: false,
                url: "#"
            },
            {
                id: 10,
                title: "Bank Stocks Tumble on Concerns About Commercial Real Estate Exposure",
                description: "Regional banks face pressure as commercial real estate market shows signs of stress.",
                content: "Shares of regional banks fell sharply today after a major commercial real estate firm defaulted on $2 billion in loans. Investors are concerned about banks' exposure to the struggling office real estate sector, which has been hit hard by the shift to remote work. The KBW Bank Index dropped 4.5%, with several regional banks down more than 8%. Analysts warn that more pain could be ahead for the sector.",
                source: "Financial Times",
                sentiment: "bearish",
                confidence: 86,
                timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
                category: "stocks",
                tickers: ["JPM", "BAC", "WFC"],
                image: null,
                trending: false,
                url: "#"
            }
        ];
        
        return articles;
    };

    const applyFilters = () => {
        let filtered = [...articles];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.tickers.some(ticker => ticker.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Category filter
        if (activeTab !== 'all') {
            if (activeTab === 'trending') {
                filtered = filtered.filter(article => article.trending);
            } else {
                filtered = filtered.filter(article => article.category === activeTab);
            }
        }

        // Sentiment filter
        if (sentimentFilter !== 'all') {
            filtered = filtered.filter(article => article.sentiment === sentimentFilter);
        }

        setFilteredArticles(filtered);
    };

    const handleToggleSave = (articleId) => {
        let updated;
        if (savedArticles.includes(articleId)) {
            updated = savedArticles.filter(id => id !== articleId);
            toast.info('Article removed from saved', 'Removed');
        } else {
            updated = [...savedArticles, articleId];
            toast.success('Article saved for later', 'Saved');
        }
        setSavedArticles(updated);
        localStorage.setItem('savedArticles', JSON.stringify(updated));
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
        setShowModal(true);
    };

    const handleShare = (platform) => {
        if (!selectedArticle) return;

        const text = selectedArticle.title;
        const url = window.location.href;

        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(`${text}\n${url}`);
                toast.success('Link copied to clipboard!', 'Copied');
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours === 1) return '1 hour ago';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 day ago';
        return `${diffInDays} days ago`;
    };

    const getSentimentIcon = (sentiment) => {
        if (sentiment === 'bullish') return <TrendingUp size={16} />;
        if (sentiment === 'bearish') return <TrendingDown size={16} />;
        return <Minus size={16} />;
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <TitleIcon>
                        <Newspaper size={56} color="#00adef" />
                    </TitleIcon>
                    Market News
                </Title>
                <Subtitle>AI-powered sentiment analysis on the latest market news</Subtitle>
                <PoweredBy>
                    <Brain size={18} />
                    AI Sentiment Analysis
                </PoweredBy>
            </Header>

            {/* Controls */}
            <ControlsContainer>
                <SearchBar>
                    <SearchIcon size={20} />
                    <SearchInput
                        type="text"
                        placeholder="Search news or ticker symbols..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBar>

                <FilterButtons>
                    <FilterButton
                        $active={sentimentFilter === 'all'}
                        onClick={() => setSentimentFilter('all')}
                    >
                        All
                    </FilterButton>
                    <FilterButton
                        $active={sentimentFilter === 'bullish'}
                        onClick={() => setSentimentFilter('bullish')}
                    >
                        <TrendingUp size={18} />
                        Bullish
                    </FilterButton>
                    <FilterButton
                        $active={sentimentFilter === 'bearish'}
                        onClick={() => setSentimentFilter('bearish')}
                    >
                        <TrendingDown size={18} />
                        Bearish
                    </FilterButton>
                    <FilterButton
                        $active={sentimentFilter === 'neutral'}
                        onClick={() => setSentimentFilter('neutral')}
                    >
                        <Minus size={18} />
                        Neutral
                    </FilterButton>
                </FilterButtons>

                <RefreshButton 
                    onClick={fetchNews} 
                    disabled={loading}
                    $loading={loading}
                >
                    <SpinningIcon size={20} $spinning={loading} />
                    {loading ? 'Loading...' : 'Refresh'}
                </RefreshButton>
            </ControlsContainer>

            {/* Tabs */}
            <TabsContainer>
                <Tab 
                    $active={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                >
                    <Globe size={18} />
                    All News
                </Tab>
                <Tab 
                    $active={activeTab === 'stocks'}
                    onClick={() => setActiveTab('stocks')}
                >
                    <BarChart3 size={18} />
                    Stocks
                </Tab>
                <Tab 
                    $active={activeTab === 'crypto'}
                    onClick={() => setActiveTab('crypto')}
                >
                    <Activity size={18} />
                    Crypto
                </Tab>
                <Tab 
                    $active={activeTab === 'trending'}
                    onClick={() => setActiveTab('trending')}
                >
                    <Flame size={18} />
                    Trending
                </Tab>
            </TabsContainer>

            {/* News Grid */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <LoadingText>Analyzing latest market news with AI...</LoadingText>
                </LoadingContainer>
            ) : filteredArticles.length > 0 ? (
                <NewsGrid>
                    {filteredArticles.map((article) => (
                        <NewsCard
                            key={article.id}
                            $sentiment={article.sentiment}
                            onClick={() => handleArticleClick(article)}
                        >
                            <NewsImage $src={article.image}>
                                {!article.image && (
                                    <NewsImagePlaceholder>
                                        <Newspaper size={64} />
                                    </NewsImagePlaceholder>
                                )}
                                {article.trending && (
                                    <TrendingBadge>
                                        <Flame size={16} />
                                        Trending
                                    </TrendingBadge>
                                )}
                                <SentimentBadge $sentiment={article.sentiment}>
                                    {getSentimentIcon(article.sentiment)}
                                    {article.sentiment}
                                </SentimentBadge>
                            </NewsImage>

                            <NewsContent>
                                <NewsHeader>
                                    <NewsSource>
                                        <SourceIcon>
                                            {article.source.charAt(0)}
                                        </SourceIcon>
                                        {article.source}
                                    </NewsSource>
                                    <NewsActions>
                                        <ActionButton
                                            $active={savedArticles.includes(article.id)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleSave(article.id);
                                            }}
                                        >
                                            {savedArticles.includes(article.id) ? (
                                                <Bookmark size={16} fill="#f59e0b" />
                                            ) : (
                                                <BookmarkPlus size={16} />
                                            )}
                                        </ActionButton>
                                    </NewsActions>
                                </NewsHeader>

                                <NewsTitle>{article.title}</NewsTitle>
                                <NewsDescription>{article.description}</NewsDescription>

                                <RelatedTickers>
                                    {article.tickers.map((ticker) => (
                                        <TickerTag key={ticker}>{ticker}</TickerTag>
                                    ))}
                                </RelatedTickers>

                                <NewsMeta>
                                    <MetaItem>
                                        <Clock size={14} />
                                        {formatTimeAgo(article.timestamp)}
                                    </MetaItem>
                                    <MetaItem>
                                        <Target size={14} />
                                        {article.confidence}% confidence
                                    </MetaItem>
                                </NewsMeta>

                                <AISummaryButton onClick={(e) => e.stopPropagation()}>
                                    <Sparkles size={18} />
                                    Get AI Summary
                                </AISummaryButton>
                            </NewsContent>
                        </NewsCard>
                    ))}
                </NewsGrid>
            ) : (
                <EmptyState>
                    <EmptyIcon>
                        <Search size={80} color="#00adef" />
                    </EmptyIcon>
                    <EmptyTitle>No Articles Found</EmptyTitle>
                    <EmptyText>
                        Try adjusting your filters or search criteria
                    </EmptyText>
                </EmptyState>
            )}

            {/* Article Modal */}
            {showModal && selectedArticle && (
                <ModalOverlay onClick={() => setShowModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowModal(false)}>
                            <X size={20} />
                        </CloseButton>

                        <ModalTitle>{selectedArticle.title}</ModalTitle>

                        <ModalMeta>
                            <ModalMetaItem>
                                <ModalMetaLabel>Source</ModalMetaLabel>
                                <ModalMetaValue>{selectedArticle.source}</ModalMetaValue>
                            </ModalMetaItem>
                            <ModalMetaItem>
                                <ModalMetaLabel>Published</ModalMetaLabel>
                                <ModalMetaValue>{formatTimeAgo(selectedArticle.timestamp)}</ModalMetaValue>
                            </ModalMetaItem>
                            <ModalMetaItem>
                                <ModalMetaLabel>Sentiment</ModalMetaLabel>
                                <ModalMetaValue style={{ 
                                    color: selectedArticle.sentiment === 'bullish' ? '#10b981' : 
                                           selectedArticle.sentiment === 'bearish' ? '#ef4444' : '#f59e0b'
                                }}>
                                    {selectedArticle.sentiment.toUpperCase()}
                                </ModalMetaValue>
                            </ModalMetaItem>
                            <ModalMetaItem>
                                <ModalMetaLabel>Confidence</ModalMetaLabel>
                                <ModalMetaValue>{selectedArticle.confidence}%</ModalMetaValue>
                            </ModalMetaItem>
                        </ModalMeta>

                        <AISummarySection>
                            <AISummaryTitle>
                                <Brain size={24} />
                                AI Analysis
                            </AISummaryTitle>
                            <AISummaryText>
                                This article shows {selectedArticle.sentiment} sentiment with {selectedArticle.confidence}% confidence. 
                                The AI detected strong indicators related to {selectedArticle.tickers.join(', ')} performance. 
                                Key themes include market momentum, institutional activity, and fundamental developments that could 
                                impact stock prices in the {selectedArticle.sentiment === 'bullish' ? 'positive' : 
                                selectedArticle.sentiment === 'bearish' ? 'negative' : 'neutral'} direction.
                            </AISummaryText>
                        </AISummarySection>

                        <ModalBody>
                            <p>{selectedArticle.content}</p>
                        </ModalBody>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <ModalMetaLabel>Related Tickers:</ModalMetaLabel>
                            <RelatedTickers style={{ marginTop: '0.75rem' }}>
                                {selectedArticle.tickers.map((ticker) => (
                                    <TickerTag key={ticker}>{ticker}</TickerTag>
                                ))}
                            </RelatedTickers>
                        </div>

                        <ModalActions>
                            <ModalButton onClick={() => handleShare('twitter')}>
                                <Twitter size={18} />
                                Share on Twitter
                            </ModalButton>
                            <ModalButton onClick={() => handleShare('linkedin')}>
                                <Linkedin size={18} />
                                Share on LinkedIn
                            </ModalButton>
                            <ModalButton onClick={() => handleShare('copy')}>
                                <Copy size={18} />
                                Copy Link
                            </ModalButton>
                            <ModalButton 
                                $primary
                                onClick={() => window.open(selectedArticle.url, '_blank')}
                            >
                                <ExternalLink size={18} />
                                Read Full Article
                            </ModalButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default NewsPage;