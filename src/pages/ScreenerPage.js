// client/src/pages/ScreenerPage.js - THE MOST LEGENDARY STOCK & CRYPTO SCREENER EVER

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Search, Filter, TrendingUp, TrendingDown, DollarSign, BarChart3,
    ArrowUpDown, Star, Eye, Plus, Check, X, Settings, Download,
    RefreshCw, Zap, Target, Percent, Activity, Volume2, Calendar,
    Sparkles, SortAsc, SortDesc, ChevronDown, ChevronUp,
    Flame, Award, Shield, Rocket, Globe, Database, AlertCircle,
    BookmarkPlus, Bookmark, Bitcoin, Coins, TrendingUpIcon
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
    max-width: 1800px;
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

// ============ MODE TOGGLE ============
const ModeToggle = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
`;

const ModeButton = styled.button`
    padding: 1rem 2rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
    }
`;

// ============ FILTERS SECTION ============
const FiltersContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #00adef, #00ff88);
    }
`;

const FiltersHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        align-items: start;
    }
`;

const FiltersTitle = styled.h2`
    color: #00adef;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const FilterActions = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$primary ? 
        'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' :
        'rgba(0, 173, 237, 0.1)'
    };
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: ${props => props.$primary ? 'white' : '#00adef'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.$primary ? 
            'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' :
            'rgba(0, 173, 237, 0.2)'
        };
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 173, 237, 0.3);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const FiltersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const FilterLabel = styled.label`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SearchInput = styled.input`
    padding: 0.875rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const Select = styled.select`
    padding: 0.875rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    option {
        background: #1a1f3a;
        color: #e0e6ed;
    }
`;

const RangeContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`;

const RangeInput = styled.input`
    flex: 1;
    padding: 0.875rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const RangeSeparator = styled.span`
    color: #94a3b8;
    font-weight: 600;
`;

// ============ QUICK FILTERS ============
const QuickFilters = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 173, 237, 0.2);
`;

const QuickFilterChip = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        'rgba(0, 173, 237, 0.2)' :
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 
        'rgba(0, 173, 237, 0.5)' :
        'rgba(0, 173, 237, 0.2)'
    };
    border-radius: 20px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
        transform: translateY(-2px);
    }
`;

// ============ RESULTS SECTION ============
const ResultsContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto;
`;

const ResultsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        align-items: start;
    }
`;

const ResultsInfo = styled.div`
    color: #94a3b8;
    font-size: 1rem;

    span {
        color: #00adef;
        font-weight: 700;
        font-size: 1.2rem;
    }
`;

const SortButtons = styled.div`
    display: flex;
    gap: 0.75rem;

    @media (max-width: 768px) {
        width: 100%;
        overflow-x: auto;
    }
`;

const SortButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        'rgba(0, 173, 237, 0.2)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 
        'rgba(0, 173, 237, 0.5)' :
        'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 10px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
    }
`;

// ============ RESULTS TABLE ============
const ResultsTable = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    overflow: hidden;
    animation: ${fadeIn} 0.6s ease-out;
`;

const TableHeader = styled.div`
    display: grid;
    grid-template-columns: 50px 120px 1fr 120px 120px 120px 120px 100px;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: rgba(0, 173, 237, 0.1);
    border-bottom: 1px solid rgba(0, 173, 237, 0.3);
    font-weight: 700;
    color: #00adef;
    font-size: 0.9rem;

    @media (max-width: 1200px) {
        grid-template-columns: 50px 100px 1fr 100px 100px 100px;
        
        & > div:nth-child(7),
        & > div:nth-child(8) {
            display: none;
        }
    }

    @media (max-width: 768px) {
        grid-template-columns: 50px 80px 1fr 80px 80px;
        
        & > div:nth-child(6) {
            display: none;
        }
    }
`;

const TableHeaderCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;

    &:hover {
        color: #00ff88;
    }
`;

const TableBody = styled.div`
    max-height: 600px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 4px;

        &:hover {
            background: rgba(0, 173, 237, 0.7);
        }
    }
`;

const TableRow = styled.div`
    display: grid;
    grid-template-columns: 50px 120px 1fr 120px 120px 120px 120px 100px;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);
    transition: all 0.2s ease;
    cursor: pointer;
    animation: ${fadeIn} 0.4s ease-out;

    &:hover {
        background: rgba(0, 173, 237, 0.05);
        transform: translateX(5px);
    }

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 1200px) {
        grid-template-columns: 50px 100px 1fr 100px 100px 100px;
        
        & > div:nth-child(7),
        & > div:nth-child(8) {
            display: none;
        }
    }

    @media (max-width: 768px) {
        grid-template-columns: 50px 80px 1fr 80px 80px;
        
        & > div:nth-child(6) {
            display: none;
        }
    }
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    color: #e0e6ed;
    font-size: 0.95rem;
`;

const WatchlistButton = styled.button`
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

const SymbolCell = styled.div`
    display: flex;
    flex-direction: column;
`;

const Symbol = styled.span`
    font-weight: 900;
    font-size: 1.1rem;
    color: #00adef;
`;

const Name = styled.span`
    font-size: 0.85rem;
    color: #64748b;
`;

const PriceCell = styled.div`
    font-weight: 700;
    font-size: 1.05rem;
`;

const ChangeCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: ${props => props.$positive ? 
        'rgba(16, 185, 129, 0.2)' :
        'rgba(239, 68, 68, 0.2)'
    };
    border-radius: 8px;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 700;
    width: fit-content;
`;

const VolumeCell = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
`;

const BadgeCell = styled.div`
    padding: 0.4rem 0.75rem;
    background: ${props => {
        if (props.$type === 'hot') return 'rgba(239, 68, 68, 0.2)';
        if (props.$type === 'trending') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    border: 1px solid ${props => {
        if (props.$type === 'hot') return 'rgba(239, 68, 68, 0.3)';
        if (props.$type === 'trending') return 'rgba(245, 158, 11, 0.3)';
        return 'rgba(0, 173, 237, 0.3)';
    }};
    border-radius: 12px;
    color: ${props => {
        if (props.$type === 'hot') return '#ef4444';
        if (props.$type === 'trending') return '#f59e0b';
        return '#00adef';
    }};
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

// ============ EMPTY STATE ============
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

// ============ LOADING STATE ============
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
const ScreenerPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const [mode, setMode] = useState('stocks'); // 'stocks' or 'crypto'
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [sector, setSector] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minVolume, setMinVolume] = useState('');
    const [minMarketCap, setMinMarketCap] = useState('');
    const [maxMarketCap, setMaxMarketCap] = useState('');
    const [changeFilter, setChangeFilter] = useState('all'); // 'all', 'gainers', 'losers'
    
    // Sorting
    const [sortBy, setSortBy] = useState('marketCap');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Quick filters
    const [activeQuickFilters, setActiveQuickFilters] = useState([]);

    useEffect(() => {
        // Load watchlist from localStorage
        const saved = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setWatchlist(saved);
        
        // Fetch initial results
        fetchResults();
    }, [mode]);

    const fetchResults = async () => {
        setLoading(true);
        
        try {
            // Mock data for now - replace with real API calls
            const mockData = mode === 'stocks' ? generateMockStocks() : generateMockCrypto();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setResults(mockData);
            toast.success(`Loaded ${mockData.length} ${mode === 'stocks' ? 'stocks' : 'cryptocurrencies'}`, 'Screener Updated');
        } catch (error) {
            console.error('Error fetching results:', error);
            toast.error('Failed to load screener data', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const generateMockStocks = () => {
        const stocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 182.50, change: 2.35, changePercent: 1.30, volume: 52000000, marketCap: 2850000000000, sector: 'Technology', badge: 'hot' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 5.20, changePercent: 1.39, volume: 28000000, marketCap: 2810000000000, sector: 'Technology', badge: 'trending' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.25, change: -1.50, changePercent: -1.07, volume: 31000000, marketCap: 1750000000000, sector: 'Technology', badge: null },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.80, change: 3.75, changePercent: 2.64, volume: 45000000, marketCap: 1510000000000, sector: 'Consumer', badge: 'hot' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 12.30, changePercent: 5.21, volume: 125000000, marketCap: 785000000000, sector: 'Automotive', badge: 'hot' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 482.75, change: 8.90, changePercent: 1.88, volume: 48000000, marketCap: 1190000000000, sector: 'Technology', badge: 'trending' },
            { symbol: 'META', name: 'Meta Platforms', price: 338.15, change: -2.40, changePercent: -0.71, volume: 22000000, marketCap: 855000000000, sector: 'Technology', badge: null },
            { symbol: 'JPM', name: 'JPMorgan Chase', price: 158.90, change: 1.25, changePercent: 0.79, volume: 12000000, marketCap: 458000000000, sector: 'Finance', badge: null },
            { symbol: 'V', name: 'Visa Inc.', price: 252.30, change: 3.10, changePercent: 1.24, volume: 8000000, marketCap: 512000000000, sector: 'Finance', badge: 'trending' },
            { symbol: 'WMT', name: 'Walmart Inc.', price: 165.75, change: 0.85, changePercent: 0.52, volume: 9000000, marketCap: 440000000000, sector: 'Retail', badge: null },
        ];
        return stocks;
    };

    const generateMockCrypto = () => {
        const crypto = [
            { symbol: 'BTC', name: 'Bitcoin', price: 42580.50, change: 1250.30, changePercent: 3.03, volume: 28500000000, marketCap: 832000000000, sector: 'Crypto', badge: 'hot' },
            { symbol: 'ETH', name: 'Ethereum', price: 2245.75, change: 82.15, changePercent: 3.80, volume: 15200000000, marketCap: 270000000000, sector: 'Crypto', badge: 'hot' },
            { symbol: 'BNB', name: 'Binance Coin', price: 312.40, change: -5.80, changePercent: -1.82, volume: 1200000000, marketCap: 48000000000, sector: 'Crypto', badge: null },
            { symbol: 'SOL', name: 'Solana', price: 98.65, change: 12.45, changePercent: 14.45, volume: 2400000000, marketCap: 42000000000, sector: 'Crypto', badge: 'hot' },
            { symbol: 'XRP', name: 'Ripple', price: 0.62, change: 0.05, changePercent: 8.77, volume: 1800000000, marketCap: 33000000000, sector: 'Crypto', badge: 'trending' },
            { symbol: 'ADA', name: 'Cardano', price: 0.48, change: 0.03, changePercent: 6.67, volume: 850000000, marketCap: 17000000000, sector: 'Crypto', badge: 'trending' },
            { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change: -0.002, changePercent: -2.30, volume: 620000000, marketCap: 12000000000, sector: 'Crypto', badge: null },
            { symbol: 'AVAX', name: 'Avalanche', price: 36.80, change: 2.15, changePercent: 6.20, volume: 480000000, marketCap: 13500000000, sector: 'Crypto', badge: 'hot' },
            { symbol: 'MATIC', name: 'Polygon', price: 0.82, change: 0.06, changePercent: 7.89, volume: 390000000, marketCap: 7600000000, sector: 'Crypto', badge: 'trending' },
            { symbol: 'DOT', name: 'Polkadot', price: 6.45, change: -0.18, changePercent: -2.72, volume: 280000000, marketCap: 8200000000, sector: 'Crypto', badge: null },
        ];
        return crypto;
    };

    const formatNumber = (num) => {
        if (num >= 1000000000000) return `$${(num / 1000000000000).toFixed(2)}T`;
        if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const formatVolume = (vol) => {
        if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(2)}B`;
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
        if (vol >= 1000) return `${(vol / 1000).toFixed(2)}K`;
        return vol.toLocaleString();
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleToggleWatchlist = (symbol) => {
        let updated;
        if (watchlist.includes(symbol)) {
            updated = watchlist.filter(s => s !== symbol);
            toast.info(`${symbol} removed from watchlist`, 'Removed');
        } else {
            updated = [...watchlist, symbol];
            toast.success(`${symbol} added to watchlist`, 'Added');
        }
        setWatchlist(updated);
        localStorage.setItem('watchlist', JSON.stringify(updated));
    };

    const handleQuickFilter = (filterType) => {
        if (activeQuickFilters.includes(filterType)) {
            setActiveQuickFilters(activeQuickFilters.filter(f => f !== filterType));
        } else {
            setActiveQuickFilters([...activeQuickFilters, filterType]);
        }
    };

    const applyFilters = () => {
        let filtered = [...results];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sector filter
        if (sector !== 'all') {
            filtered = filtered.filter(item => item.sector === sector);
        }

        // Price range
        if (minPrice) {
            filtered = filtered.filter(item => item.price >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filtered = filtered.filter(item => item.price <= parseFloat(maxPrice));
        }

        // Volume filter
        if (minVolume) {
            filtered = filtered.filter(item => item.volume >= parseFloat(minVolume) * 1000000);
        }

        // Market cap filter
        if (minMarketCap) {
            filtered = filtered.filter(item => item.marketCap >= parseFloat(minMarketCap) * 1000000000);
        }
        if (maxMarketCap) {
            filtered = filtered.filter(item => item.marketCap <= parseFloat(maxMarketCap) * 1000000000);
        }

        // Change filter
        if (changeFilter === 'gainers') {
            filtered = filtered.filter(item => item.changePercent > 0);
        } else if (changeFilter === 'losers') {
            filtered = filtered.filter(item => item.changePercent < 0);
        }

        // Quick filters
        if (activeQuickFilters.includes('hot')) {
            filtered = filtered.filter(item => item.badge === 'hot');
        }
        if (activeQuickFilters.includes('trending')) {
            filtered = filtered.filter(item => item.badge === 'trending');
        }
        if (activeQuickFilters.includes('highVolume')) {
            filtered = filtered.filter(item => item.volume > 10000000);
        }

        // Sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'symbol' || sortBy === 'name') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtered;
    };

    const filteredResults = applyFilters();

    const handleReset = () => {
        setSearchTerm('');
        setSector('all');
        setMinPrice('');
        setMaxPrice('');
        setMinVolume('');
        setMinMarketCap('');
        setMaxMarketCap('');
        setChangeFilter('all');
        setActiveQuickFilters([]);
        toast.info('Filters reset', 'Reset');
    };

    const handleExport = () => {
        const data = filteredResults.map(item => ({
            Symbol: item.symbol,
            Name: item.name,
            Price: item.price,
            Change: item.changePercent,
            Volume: item.volume,
            MarketCap: item.marketCap
        }));

        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screener_${mode}_${Date.now()}.csv`;
        a.click();

        toast.success('Results exported successfully', 'Exported');
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <TitleIcon>
                        <Filter size={56} color="#00adef" />
                    </TitleIcon>
                    Market Screener
                </Title>
                <Subtitle>Discover the best stocks and cryptocurrencies in real-time</Subtitle>
                <PoweredBy>
                    <Zap size={18} />
                    Real-Time Market Data
                </PoweredBy>
            </Header>

            {/* Mode Toggle */}
            <ModeToggle>
                <ModeButton 
                    $active={mode === 'stocks'}
                    onClick={() => setMode('stocks')}
                >
                    <BarChart3 size={24} />
                    Stocks
                </ModeButton>
                <ModeButton 
                    $active={mode === 'crypto'}
                    onClick={() => setMode('crypto')}
                >
                    <Bitcoin size={24} />
                    Crypto
                </ModeButton>
            </ModeToggle>

            {/* Filters */}
            <FiltersContainer>
                <FiltersHeader>
                    <FiltersTitle>
                        <Filter size={24} />
                        Filters
                    </FiltersTitle>
                    <FilterActions>
                        <ActionButton onClick={handleReset}>
                            <RefreshCw size={18} />
                            Reset
                        </ActionButton>
                        <ActionButton $primary onClick={fetchResults} disabled={loading}>
                            {loading ? (
                                <>
                                    <LoadingSpinner size={18} />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    Scan
                                </>
                            )}
                        </ActionButton>
                        <ActionButton onClick={handleExport} disabled={filteredResults.length === 0}>
                            <Download size={18} />
                            Export
                        </ActionButton>
                    </FilterActions>
                </FiltersHeader>

                <FiltersGrid>
                    <FilterGroup>
                        <FilterLabel>
                            <Search size={16} />
                            Search {mode === 'stocks' ? 'Stock' : 'Crypto'}
                        </FilterLabel>
                        <SearchInput
                            type="text"
                            placeholder="Symbol or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </FilterGroup>

                    {mode === 'stocks' && (
                        <FilterGroup>
                            <FilterLabel>
                                <Target size={16} />
                                Sector
                            </FilterLabel>
                            <Select value={sector} onChange={(e) => setSector(e.target.value)}>
                                <option value="all">All Sectors</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Consumer">Consumer</option>
                                <option value="Energy">Energy</option>
                                <option value="Automotive">Automotive</option>
                                <option value="Retail">Retail</option>
                            </Select>
                        </FilterGroup>
                    )}

                    <FilterGroup>
                        <FilterLabel>
                            <DollarSign size={16} />
                            Price Range
                        </FilterLabel>
                        <RangeContainer>
                            <RangeInput
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <RangeSeparator>—</RangeSeparator>
                            <RangeInput
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </RangeContainer>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>
                            <Volume2 size={16} />
                            Min Volume (M)
                        </FilterLabel>
                        <RangeInput
                            type="number"
                            placeholder="e.g., 10"
                            value={minVolume}
                            onChange={(e) => setMinVolume(e.target.value)}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>
                            <BarChart3 size={16} />
                            Market Cap (B)
                        </FilterLabel>
                        <RangeContainer>
                            <RangeInput
                                type="number"
                                placeholder="Min"
                                value={minMarketCap}
                                onChange={(e) => setMinMarketCap(e.target.value)}
                            />
                            <RangeSeparator>—</RangeSeparator>
                            <RangeInput
                                type="number"
                                placeholder="Max"
                                value={maxMarketCap}
                                onChange={(e) => setMaxMarketCap(e.target.value)}
                            />
                        </RangeContainer>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>
                            <Percent size={16} />
                            Change
                        </FilterLabel>
                        <Select value={changeFilter} onChange={(e) => setChangeFilter(e.target.value)}>
                            <option value="all">All</option>
                            <option value="gainers">Gainers Only</option>
                            <option value="losers">Losers Only</option>
                        </Select>
                    </FilterGroup>
                </FiltersGrid>

                <QuickFilters>
                    <QuickFilterChip 
                        $active={activeQuickFilters.includes('hot')}
                        onClick={() => handleQuickFilter('hot')}
                    >
                        <Flame size={16} />
                        Hot {mode === 'stocks' ? 'Stocks' : 'Coins'}
                    </QuickFilterChip>
                    <QuickFilterChip 
                        $active={activeQuickFilters.includes('trending')}
                        onClick={() => handleQuickFilter('trending')}
                    >
                        <TrendingUp size={16} />
                        Trending
                    </QuickFilterChip>
                    <QuickFilterChip 
                        $active={activeQuickFilters.includes('highVolume')}
                        onClick={() => handleQuickFilter('highVolume')}
                    >
                        <Activity size={16} />
                        High Volume
                    </QuickFilterChip>
                </QuickFilters>
            </FiltersContainer>

            {/* Results */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <LoadingText>Scanning {mode === 'stocks' ? 'stocks' : 'cryptocurrencies'}...</LoadingText>
                </LoadingContainer>
            ) : filteredResults.length > 0 ? (
                <ResultsContainer>
                    <ResultsHeader>
                        <ResultsInfo>
                            Showing <span>{filteredResults.length}</span> results
                        </ResultsInfo>
                        <SortButtons>
                            <SortButton 
                                $active={sortBy === 'symbol'}
                                onClick={() => handleSort('symbol')}
                            >
                                Symbol
                                {sortBy === 'symbol' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                $active={sortBy === 'price'}
                                onClick={() => handleSort('price')}
                            >
                                Price
                                {sortBy === 'price' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                $active={sortBy === 'changePercent'}
                                onClick={() => handleSort('changePercent')}
                            >
                                Change
                                {sortBy === 'changePercent' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                $active={sortBy === 'volume'}
                                onClick={() => handleSort('volume')}
                            >
                                Volume
                                {sortBy === 'volume' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                $active={sortBy === 'marketCap'}
                                onClick={() => handleSort('marketCap')}
                            >
                                Market Cap
                                {sortBy === 'marketCap' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                        </SortButtons>
                    </ResultsHeader>

                    <ResultsTable>
                        <TableHeader>
                            <TableHeaderCell>
                                <Star size={16} />
                            </TableHeaderCell>
                            <TableHeaderCell onClick={() => handleSort('symbol')}>
                                Symbol
                                {sortBy === 'symbol' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell onClick={() => handleSort('price')}>
                                Price
                                {sortBy === 'price' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell onClick={() => handleSort('changePercent')}>
                                24h Change
                                {sortBy === 'changePercent' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell onClick={() => handleSort('volume')}>
                                Volume
                                {sortBy === 'volume' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell onClick={() => handleSort('marketCap')}>
                                Market Cap
                                {sortBy === 'marketCap' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                        </TableHeader>

                        <TableBody>
                            {filteredResults.map((item, index) => (
                                <TableRow key={item.symbol}>
                                    <TableCell>
                                        <WatchlistButton
                                            $active={watchlist.includes(item.symbol)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleWatchlist(item.symbol);
                                            }}
                                        >
                                            {watchlist.includes(item.symbol) ? (
                                                <Star size={16} fill="#f59e0b" />
                                            ) : (
                                                <Star size={16} />
                                            )}
                                        </WatchlistButton>
                                    </TableCell>
                                    <TableCell>
                                        <SymbolCell>
                                            <Symbol>{item.symbol}</Symbol>
                                        </SymbolCell>
                                    </TableCell>
                                    <TableCell>
                                        <Name>{item.name}</Name>
                                    </TableCell>
                                    <TableCell>
                                        <PriceCell>${item.price.toLocaleString()}</PriceCell>
                                    </TableCell>
                                    <TableCell>
                                        <ChangeCell $positive={item.changePercent > 0}>
                                            {item.changePercent > 0 ? (
                                                <TrendingUp size={16} />
                                            ) : (
                                                <TrendingDown size={16} />
                                            )}
                                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                        </ChangeCell>
                                    </TableCell>
                                    <TableCell>
                                        <VolumeCell>{formatVolume(item.volume)}</VolumeCell>
                                    </TableCell>
                                    <TableCell>
                                        <VolumeCell>{formatNumber(item.marketCap)}</VolumeCell>
                                    </TableCell>
                                    <TableCell>
                                        {item.badge && (
                                            <BadgeCell $type={item.badge}>
                                                {item.badge === 'hot' && <Flame size={14} />}
                                                {item.badge === 'trending' && <Rocket size={14} />}
                                                {item.badge.toUpperCase()}
                                            </BadgeCell>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </ResultsTable>
                </ResultsContainer>
            ) : (
                <EmptyState>
                    <EmptyIcon>
                        <Search size={80} color="#00adef" />
                    </EmptyIcon>
                    <EmptyTitle>No Results Found</EmptyTitle>
                    <EmptyText>
                        Try adjusting your filters or search criteria
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default ScreenerPage;