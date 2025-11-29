// client/src/pages/ScreenerPage.js - THEMED STOCK & CRYPTO SCREENER WITH CLICKABLE ROWS

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
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

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
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
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
        flex-direction: column;
    }
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.success || '#00ff88'}33 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}66;
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
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
        `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'}4D 0%, ${props.theme?.brand?.primary || '#00adef'}26 100%)` :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$active ? `${props.theme?.brand?.primary || '#00adef'}80` : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? (props.theme?.brand?.primary || '#00adef') : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}4D 0%, ${props => props.theme?.brand?.primary || '#00adef'}26 100%);
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }
`;

// ============ FILTERS SECTION ============
const FiltersContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    position: relative;
    overflow: hidden;
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
    color: ${props => props.theme?.brand?.primary || '#00adef'};
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
        `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'} 0%, ${props.theme?.brand?.secondary || '#0088cc'} 100%)` :
        `${props.theme?.brand?.primary || '#00adef'}1A`
    };
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}4D;
    border-radius: 10px;
    color: ${props => props.$primary ? 'white' : (props.theme?.brand?.primary || '#00adef')};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.$primary ? 
            `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'} 0%, ${props.theme?.brand?.secondary || '#0088cc'} 100%)` :
            `${props.theme?.brand?.primary || '#00adef'}33`
        };
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => props.theme?.brand?.primary || '#00adef'}4D;
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
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SearchInput = styled.input`
    padding: 0.875rem 1rem;
    background: ${props => props.theme?.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${props => props.theme?.brand?.primary || '#00adef'}33;
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const Select = styled.select`
    padding: 0.875rem 1rem;
    background: ${props => props.theme?.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
    }

    option {
        background: ${props => props.theme?.bg?.card || '#1a1f3a'};
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
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
    background: ${props => props.theme?.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const RangeSeparator = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-weight: 600;
`;

// ============ QUICK FILTERS ============
const QuickFilters = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid ${props => props.theme?.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
`;

const QuickFilterChip = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        `${props.theme?.brand?.primary || '#00adef'}33` :
        `${props.theme?.brand?.primary || '#00adef'}0D`
    };
    border: 1px solid ${props => props.$active ? 
        `${props.theme?.brand?.primary || '#00adef'}80` :
        `${props.theme?.brand?.primary || '#00adef'}33`
    };
    border-radius: 20px;
    color: ${props => props.$active ? (props.theme?.brand?.primary || '#00adef') : (props.theme?.text?.secondary || '#94a3b8')};
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}33;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
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
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;

    span {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
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
        `${props.theme?.brand?.primary || '#00adef'}33` :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 
        `${props.theme?.brand?.primary || '#00adef'}80` :
        'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 10px;
    color: ${props => props.$active ? (props.theme?.brand?.primary || '#00adef') : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}33;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }
`;

// ============ RESULTS TABLE ============
const ResultsTable = styled.div`
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
    animation: ${fadeIn} 0.6s ease-out;
`;

const TableHeader = styled.div`
    display: grid;
    grid-template-columns: 50px 120px 1fr 120px 120px 120px 120px 100px;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    border-bottom: 1px solid ${props => props.theme?.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    font-weight: 700;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
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
        color: ${props => props.theme?.success || '#00ff88'};
    }
`;

const TableBody = styled.div`
    max-height: 600px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${props => props.theme?.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme?.brand?.primary || '#00adef'}80;
        border-radius: 4px;

        &:hover {
            background: ${props => props.theme?.brand?.primary || '#00adef'}B3;
        }
    }
`;

const TableRow = styled.div`
    display: grid;
    grid-template-columns: 50px 120px 1fr 120px 120px 120px 120px 100px;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid ${props => props.theme?.border?.tertiary || 'rgba(100, 116, 139, 0.1)'};
    transition: all 0.2s ease;
    cursor: pointer;
    animation: ${fadeIn} 0.4s ease-out;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}0D;
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
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
`;

const WatchlistButton = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$active ? 
        `${props.theme?.warning || '#f59e0b'}33` :
        `${props.theme?.brand?.primary || '#00adef'}1A`
    };
    border: 1px solid ${props => props.$active ? 
        `${props.theme?.warning || '#f59e0b'}4D` :
        `${props.theme?.brand?.primary || '#00adef'}4D`
    };
    color: ${props => props.$active ? (props.theme?.warning || '#f59e0b') : (props.theme?.brand?.primary || '#00adef')};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active ? 
            `${props.theme?.warning || '#f59e0b'}4D` :
            `${props.theme?.brand?.primary || '#00adef'}33`
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
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    transition: all 0.2s ease;

    &:hover {
        color: ${props => props.theme?.success || '#00ff88'};
    }
`;

const Name = styled.span`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

const PriceCell = styled.div`
    font-weight: 700;
    font-size: 1.05rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const ChangeCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: ${props => props.$positive ? 
        `${props.theme?.success || '#10b981'}33` :
        `${props.theme?.error || '#ef4444'}33`
    };
    border-radius: 8px;
    color: ${props => props.$positive ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    font-weight: 700;
    width: fit-content;
`;

const VolumeCell = styled.div`
    font-size: 0.9rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const BadgeCell = styled.div`
    padding: 0.4rem 0.75rem;
    background: ${props => {
        if (props.$type === 'hot') return `${props.theme?.error || '#ef4444'}33`;
        if (props.$type === 'trending') return `${props.theme?.warning || '#f59e0b'}33`;
        return `${props.theme?.brand?.primary || '#00adef'}33`;
    }};
    border: 1px solid ${props => {
        if (props.$type === 'hot') return `${props.theme?.error || '#ef4444'}4D`;
        if (props.$type === 'trending') return `${props.theme?.warning || '#f59e0b'}4D`;
        return `${props.theme?.brand?.primary || '#00adef'}4D`;
    }};
    border-radius: 12px;
    color: ${props => {
        if (props.$type === 'hot') return props.theme?.error || '#ef4444';
        if (props.$type === 'trending') return props.theme?.warning || '#f59e0b';
        return props.theme?.brand?.primary || '#00adef';
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
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.brand?.primary || '#00adef'}0D 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${props => props.theme?.brand?.primary || '#00adef'}66;
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
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
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const LoadingText = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
`;

// ============ COMPONENT ============
const ScreenerPage = () => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();
    const navigate = useNavigate();
    
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
        if (isAuthenticated) {
            fetchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, isAuthenticated]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const endpoint = mode === 'stocks' ? '/screener/stocks' : '/screener/crypto';
            
            // Build query params from filters
            const params = new URLSearchParams();
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);
            if (minVolume) params.append('minVolume', minVolume);
            if (minMarketCap) params.append('minMarketCap', minMarketCap);
            if (maxMarketCap) params.append('maxMarketCap', maxMarketCap);
            if (changeFilter && changeFilter !== 'all') {
                params.append('changeFilter', changeFilter);
            }
            if (sortBy) params.append('sortBy', sortBy);

            const response = await api.get(`${endpoint}?${params.toString()}`);
            console.log('Screener response:', response.data);
            
            setResults(response.data || []);
            toast.success(`Found ${response.data?.length || 0} results`, 'Screener Updated');
        } catch (error) {
            console.error('Error fetching screener data:', error);
            toast.error('Failed to load screener data', 'Error');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num || num === undefined) return '$0';
        if (num >= 1000000000000) return `$${(num / 1000000000000).toFixed(2)}T`;
        if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
        return `$${num.toFixed(2)}`;
    };

    const formatVolume = (vol) => {
        if (!vol || vol === undefined) return '0';
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

    const handleToggleWatchlist = (symbol, e) => {
        e.stopPropagation(); // Prevent row click navigation
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

    // Navigate to stock or crypto detail page
    const handleRowClick = (item) => {
        if (mode === 'crypto') {
            // Navigate to crypto page - use id for CoinGecko coins, fallback to lowercase symbol
            navigate(`/crypto/${item.id || item.symbol.toLowerCase()}`);
        } else {
            // Navigate to stock page with the symbol (uppercase) - route is /stocks/:symbol
            navigate(`/stocks/${item.symbol.toUpperCase()}`);
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
                aVal = aVal?.toLowerCase() || '';
                bVal = bVal?.toLowerCase() || '';
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
        if (filteredResults.length === 0) return;
        
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
        <PageContainer theme={theme}>
            <Header>
                <Title theme={theme}>
                    <TitleIcon>
                        <Filter size={56} color={theme?.brand?.primary || '#00adef'} />
                    </TitleIcon>
                    Market Screener
                </Title>
                <Subtitle theme={theme}>Discover the best stocks and cryptocurrencies in real-time</Subtitle>
                <PoweredBy theme={theme}>
                    <Zap size={18} />
                    Real-Time Market Data
                </PoweredBy>
            </Header>

            {/* Mode Toggle */}
            <ModeToggle>
                <ModeButton 
                    theme={theme}
                    $active={mode === 'stocks'}
                    onClick={() => setMode('stocks')}
                >
                    <BarChart3 size={24} />
                    Stocks
                </ModeButton>
                <ModeButton 
                    theme={theme}
                    $active={mode === 'crypto'}
                    onClick={() => setMode('crypto')}
                >
                    <Bitcoin size={24} />
                    Crypto
                </ModeButton>
            </ModeToggle>

            {/* Filters */}
            <FiltersContainer theme={theme}>
                <FiltersHeader>
                    <FiltersTitle theme={theme}>
                        <Filter size={24} />
                        Filters
                    </FiltersTitle>
                    <FilterActions>
                        <ActionButton theme={theme} onClick={handleReset}>
                            <RefreshCw size={18} />
                            Reset
                        </ActionButton>
                        <ActionButton theme={theme} $primary onClick={fetchResults} disabled={loading}>
                            {loading ? (
                                <>
                                    <LoadingSpinner theme={theme} size={18} />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    Scan
                                </>
                            )}
                        </ActionButton>
                        <ActionButton theme={theme} onClick={handleExport} disabled={filteredResults.length === 0}>
                            <Download size={18} />
                            Export
                        </ActionButton>
                    </FilterActions>
                </FiltersHeader>

                <FiltersGrid>
                    <FilterGroup>
                        <FilterLabel theme={theme}>
                            <Search size={16} />
                            Search {mode === 'stocks' ? 'Stock' : 'Crypto'}
                        </FilterLabel>
                        <SearchInput
                            theme={theme}
                            type="text"
                            placeholder="Symbol or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </FilterGroup>

                    {mode === 'stocks' && (
                        <FilterGroup>
                            <FilterLabel theme={theme}>
                                <Target size={16} />
                                Sector
                            </FilterLabel>
                            <Select theme={theme} value={sector} onChange={(e) => setSector(e.target.value)}>
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
                        <FilterLabel theme={theme}>
                            <DollarSign size={16} />
                            Price Range
                        </FilterLabel>
                        <RangeContainer>
                            <RangeInput
                                theme={theme}
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <RangeSeparator theme={theme}>—</RangeSeparator>
                            <RangeInput
                                theme={theme}
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </RangeContainer>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel theme={theme}>
                            <Volume2 size={16} />
                            Min Volume (M)
                        </FilterLabel>
                        <RangeInput
                            theme={theme}
                            type="number"
                            placeholder="e.g., 10"
                            value={minVolume}
                            onChange={(e) => setMinVolume(e.target.value)}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel theme={theme}>
                            <BarChart3 size={16} />
                            Market Cap (B)
                        </FilterLabel>
                        <RangeContainer>
                            <RangeInput
                                theme={theme}
                                type="number"
                                placeholder="Min"
                                value={minMarketCap}
                                onChange={(e) => setMinMarketCap(e.target.value)}
                            />
                            <RangeSeparator theme={theme}>—</RangeSeparator>
                            <RangeInput
                                theme={theme}
                                type="number"
                                placeholder="Max"
                                value={maxMarketCap}
                                onChange={(e) => setMaxMarketCap(e.target.value)}
                            />
                        </RangeContainer>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel theme={theme}>
                            <Percent size={16} />
                            Change
                        </FilterLabel>
                        <Select theme={theme} value={changeFilter} onChange={(e) => setChangeFilter(e.target.value)}>
                            <option value="all">All</option>
                            <option value="gainers">Gainers Only</option>
                            <option value="losers">Losers Only</option>
                        </Select>
                    </FilterGroup>
                </FiltersGrid>

                <QuickFilters theme={theme}>
                    <QuickFilterChip 
                        theme={theme}
                        $active={activeQuickFilters.includes('hot')}
                        onClick={() => handleQuickFilter('hot')}
                    >
                        <Flame size={16} />
                        Hot {mode === 'stocks' ? 'Stocks' : 'Coins'}
                    </QuickFilterChip>
                    <QuickFilterChip 
                        theme={theme}
                        $active={activeQuickFilters.includes('trending')}
                        onClick={() => handleQuickFilter('trending')}
                    >
                        <TrendingUp size={16} />
                        Trending
                    </QuickFilterChip>
                    <QuickFilterChip 
                        theme={theme}
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
                    <LoadingSpinner theme={theme} size={64} />
                    <LoadingText theme={theme}>Scanning {mode === 'stocks' ? 'stocks' : 'cryptocurrencies'}...</LoadingText>
                </LoadingContainer>
            ) : filteredResults.length > 0 ? (
                <ResultsContainer>
                    <ResultsHeader>
                        <ResultsInfo theme={theme}>
                            Showing <span>{filteredResults.length}</span> results
                        </ResultsInfo>
                        <SortButtons>
                            <SortButton 
                                theme={theme}
                                $active={sortBy === 'symbol'}
                                onClick={() => handleSort('symbol')}
                            >
                                Symbol
                                {sortBy === 'symbol' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                theme={theme}
                                $active={sortBy === 'price'}
                                onClick={() => handleSort('price')}
                            >
                                Price
                                {sortBy === 'price' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                theme={theme}
                                $active={sortBy === 'changePercent'}
                                onClick={() => handleSort('changePercent')}
                            >
                                Change
                                {sortBy === 'changePercent' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                theme={theme}
                                $active={sortBy === 'volume'}
                                onClick={() => handleSort('volume')}
                            >
                                Volume
                                {sortBy === 'volume' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                            <SortButton 
                                theme={theme}
                                $active={sortBy === 'marketCap'}
                                onClick={() => handleSort('marketCap')}
                            >
                                Market Cap
                                {sortBy === 'marketCap' && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                            </SortButton>
                        </SortButtons>
                    </ResultsHeader>

                    <ResultsTable theme={theme}>
                        <TableHeader theme={theme}>
                            <TableHeaderCell theme={theme}>
                                <Star size={16} />
                            </TableHeaderCell>
                            <TableHeaderCell theme={theme} onClick={() => handleSort('symbol')}>
                                Symbol
                                {sortBy === 'symbol' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell theme={theme}>Name</TableHeaderCell>
                            <TableHeaderCell theme={theme} onClick={() => handleSort('price')}>
                                Price
                                {sortBy === 'price' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell theme={theme} onClick={() => handleSort('changePercent')}>
                                24h Change
                                {sortBy === 'changePercent' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell theme={theme} onClick={() => handleSort('volume')}>
                                Volume
                                {sortBy === 'volume' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell theme={theme} onClick={() => handleSort('marketCap')}>
                                Market Cap
                                {sortBy === 'marketCap' && (sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
                            </TableHeaderCell>
                            <TableHeaderCell theme={theme}>Status</TableHeaderCell>
                        </TableHeader>

                        <TableBody theme={theme}>
                            {filteredResults.map((item, index) => (
                                <TableRow 
                                    theme={theme} 
                                    key={item.symbol || item.id || index}
                                    onClick={() => handleRowClick(item)}
                                    title={`Click to view ${item.symbol} details`}
                                >
                                    <TableCell theme={theme}>
                                        <WatchlistButton
                                            theme={theme}
                                            $active={watchlist.includes(item.symbol)}
                                            onClick={(e) => handleToggleWatchlist(item.symbol, e)}
                                        >
                                            {watchlist.includes(item.symbol) ? (
                                                <Star size={16} fill={theme?.warning || '#f59e0b'} />
                                            ) : (
                                                <Star size={16} />
                                            )}
                                        </WatchlistButton>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <SymbolCell>
                                            <Symbol theme={theme}>{item.symbol}</Symbol>
                                        </SymbolCell>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <Name theme={theme}>{item.name}</Name>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <PriceCell theme={theme}>${(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: item.price < 1 ? 6 : 2 })}</PriceCell>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <ChangeCell theme={theme} $positive={(item.changePercent || 0) > 0}>
                                            {(item.changePercent || 0) > 0 ? (
                                                <TrendingUp size={16} />
                                            ) : (
                                                <TrendingDown size={16} />
                                            )}
                                            {(item.changePercent || 0) >= 0 ? '+' : ''}{(item.changePercent || 0).toFixed(2)}%
                                        </ChangeCell>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <VolumeCell theme={theme}>{formatVolume(item.volume || 0)}</VolumeCell>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <VolumeCell theme={theme}>{formatNumber(item.marketCap || 0)}</VolumeCell>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        {item.badge && (
                                            <BadgeCell theme={theme} $type={item.badge}>
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
                <EmptyState theme={theme}>
                    <EmptyIcon theme={theme}>
                        <Search size={80} color={theme?.brand?.primary || '#00adef'} />
                    </EmptyIcon>
                    <EmptyTitle theme={theme}>No Results Found</EmptyTitle>
                    <EmptyText theme={theme}>
                        Try adjusting your filters or search criteria
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default ScreenerPage;