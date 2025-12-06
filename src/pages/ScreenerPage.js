// client/src/pages/ScreenerPage.js - THEMED STOCK & CRYPTO SCREENER WITH CLICKABLE ROWS

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';
import {
    Search, Filter, TrendingUp, TrendingDown, DollarSign, BarChart3,
    ArrowUpDown, Star, Eye, Plus, Check, X, Settings, Download,
    RefreshCw, Zap, Target, Percent, Activity, Volume2, Calendar,
    Sparkles, SortAsc, SortDesc, ChevronDown, ChevronUp,
    Flame, Award, Shield, Rocket, Globe, Database, AlertCircle,
    BookmarkPlus, Bookmark, Bitcoin, Coins, TrendingUpIcon
} from 'lucide-react';

// Smart price formatter based on mode
const formatPrice = (price, mode) => {
    if (!price || isNaN(price)) return '$0.00';
    
    if (mode === 'crypto') {
        return formatCryptoPrice(price);
    }
    return formatStockPrice(price);
};

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
    ${css`animation: ${fadeIn} 0.8s ease-out;`}
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
    ${css`animation: ${float} 3s ease-in-out infinite;`}
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

const SourceBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    background: ${props => {
        if (props.$source === 'dexscreener') return '#f0b90b33';
        return props.theme?.brand?.primary + '33' || '#00adef33';
    }};
    color: ${props => {
        if (props.$source === 'dexscreener') return '#f0b90b';
        return props.theme?.brand?.primary || '#00adef';
    }};
    border: 1px solid ${props => {
        if (props.$source === 'dexscreener') return '#f0b90b66';
        return props.theme?.brand?.primary + '66' || '#00adef66';
    }};
`;

const ChainBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    font-size: 0.6rem;
    font-weight: 700;
    background: #f0b90b22;
    color: #f0b90b;
    margin-left: 0.25rem;
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

// ============ CONTROLS ============
const ControlsBar = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem 2rem;
    ${css`animation: ${fadeIn} 0.6s ease-out;`}

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;

const ResultsInfo = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    span {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        font-weight: 700;
        font-size: 1.2rem;
    }
`;

const ControlButtons = styled.div`
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

    &:hover:not(:disabled) {
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

    svg {
        ${props => props.$loading && css`animation: ${spin} 1s linear infinite;`}
    }
`;

// ============ RESULTS TABLE ============
const ResultsContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto;
`;

const ResultsTable = styled.div`
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
    ${css`animation: ${fadeIn} 0.6s ease-out;`}
`;

const TableHeader = styled.div`
    display: grid;
    grid-template-columns: 50px 50px 120px 1fr 140px 140px 140px 140px;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    border-bottom: 1px solid ${props => props.theme?.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    font-weight: 700;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 0.9rem;

    @media (max-width: 1400px) {
        grid-template-columns: 50px 50px 100px 1fr 120px 120px 120px;
        
        & > div:nth-child(8) {
            display: none;
        }
    }

    @media (max-width: 1024px) {
        grid-template-columns: 50px 80px 1fr 100px 100px;
        
        & > div:nth-child(2),
        & > div:nth-child(6),
        & > div:nth-child(7) {
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
    max-height: 70vh;
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
    grid-template-columns: 50px 50px 120px 1fr 140px 140px 140px 140px;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid ${props => props.theme?.border?.tertiary || 'rgba(100, 116, 139, 0.1)'};
    transition: all 0.2s ease;
    cursor: pointer;
    ${css`animation: ${fadeIn} 0.4s ease-out;`}

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}0D;
        transform: translateX(5px);
    }

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 1400px) {
        grid-template-columns: 50px 50px 100px 1fr 120px 120px 120px;
        
        & > div:nth-child(8) {
            display: none;
        }
    }

    @media (max-width: 1024px) {
        grid-template-columns: 50px 80px 1fr 100px 100px;
        
        & > div:nth-child(2),
        & > div:nth-child(6),
        & > div:nth-child(7) {
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

const RankCell = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: ${props => {
        if (props.$rank <= 3) return props.theme?.warning || '#f59e0b';
        if (props.$rank <= 10) return props.theme?.success || '#10b981';
        return props.theme?.text?.secondary || '#94a3b8';
    }};
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
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

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    ${css`animation: ${fadeIn} 0.5s ease-out;`}
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
    ${css`animation: ${float} 3s ease-in-out infinite;`}
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
    ${css`animation: ${spin} 1s linear infinite;`}
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
    const [viewType, setViewType] = useState('gainers'); // 'gainers' or 'losers'
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    // Sorting
    const [sortBy, setSortBy] = useState('changePercent');
    const [sortOrder, setSortOrder] = useState('desc');

    // Load watchlist from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('watchlist');
        if (saved) {
            try {
                setWatchlist(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading watchlist:', e);
            }
        }
    }, []);

    // Fetch results on mount and mode/viewType change
    useEffect(() => {
        if (isAuthenticated) {
            fetchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, viewType, isAuthenticated]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const endpoint = mode === 'stocks' ? '/screener/stocks' : '/screener/crypto';

            // Build params based on viewType (gainers or losers)
            const params = new URLSearchParams({
                limit: '50',
                sortBy: 'changePercent',
                order: viewType === 'gainers' ? 'desc' : 'asc',
                changeFilter: viewType // 'gainers' or 'losers'
            });

            const response = await api.get(`${endpoint}?${params.toString()}`);
            console.log('Screener response:', response.data);

            const data = response.data || [];
            setResults(data);

            const label = viewType === 'gainers' ? 'top gainers' : 'biggest losers';
            toast.success(`Found ${data.length} ${label}`, 'Screener Updated');
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

    // Navigate to stock or crypto detail page
    const handleRowClick = (item) => {
        if (mode === 'crypto') {
            // Navigate to crypto page - use id for CoinGecko coins, fallback to lowercase symbol
            navigate(`/crypto/${item.id || item.symbol.toLowerCase()}`);
        } else {
            // Navigate to stock page with the symbol (uppercase)
            navigate(`/stocks/${item.symbol.toUpperCase()}`);
        }
    };

    const applySorting = () => {
        let sorted = [...results];
        
        sorted.sort((a, b) => {
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

        return sorted;
    };

    const sortedResults = applySorting();

    const handleExport = () => {
        if (sortedResults.length === 0) return;
        
        const data = sortedResults.map(item => ({
            Rank: sortedResults.indexOf(item) + 1,
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
        a.download = `${viewType}_${mode}_${Date.now()}.csv`;
        a.click();

        toast.success('Results exported successfully', 'Exported');
    };

    return (
        <PageContainer theme={theme}>
            <Header>
                <Title theme={theme}>
                    <TitleIcon>
                        {viewType === 'gainers' ? (
                            <TrendingUp size={56} color={theme?.success || '#10b981'} />
                        ) : (
                            <TrendingDown size={56} color={theme?.error || '#ef4444'} />
                        )}
                    </TitleIcon>
                    {viewType === 'gainers' ? 'Top Gainers' : 'Biggest Losers'}
                </Title>
                <Subtitle theme={theme}>
                    {viewType === 'gainers'
                        ? 'Track the best performing stocks and cryptocurrencies in real-time'
                        : 'Track the biggest drops in stocks and cryptocurrencies'}
                </Subtitle>
                <PoweredBy theme={theme}>
                    <Zap size={18} />
                    {mode === 'crypto' ? 'DexScreener + CoinGecko • BSC & Global Crypto' : 'Live Market Data'}
                </PoweredBy>
            </Header>

            {/* Mode Toggle - Stocks vs Crypto */}
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

            {/* View Type Toggle - Gainers vs Losers */}
            <ModeToggle style={{ marginTop: '-1rem' }}>
                <ModeButton
                    theme={theme}
                    $active={viewType === 'gainers'}
                    onClick={() => setViewType('gainers')}
                    style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                    <TrendingUp size={20} />
                    Gainers
                </ModeButton>
                <ModeButton
                    theme={theme}
                    $active={viewType === 'losers'}
                    onClick={() => setViewType('losers')}
                    style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                    <TrendingDown size={20} />
                    Losers
                </ModeButton>
            </ModeToggle>

            {/* Controls */}
            <ControlsBar theme={theme}>
                <ResultsInfo theme={theme}>
                    {viewType === 'gainers' ? (
                        <Flame size={24} color={theme?.success || '#10b981'} />
                    ) : (
                        <TrendingDown size={24} color={theme?.error || '#ef4444'} />
                    )}
                    Showing <span>{sortedResults.length}</span> {viewType === 'gainers' ? 'top gainers' : 'biggest losers'}
                </ResultsInfo>
                <ControlButtons>
                    <ActionButton theme={theme} onClick={fetchResults} disabled={loading} $loading={loading}>
                        <RefreshCw size={18} />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </ActionButton>
                    <ActionButton theme={theme} onClick={handleExport} disabled={sortedResults.length === 0}>
                        <Download size={18} />
                        Export CSV
                    </ActionButton>
                </ControlButtons>
            </ControlsBar>

            {/* Results */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner theme={theme} size={64} />
                    <LoadingText theme={theme}>
                        Loading {viewType === 'gainers' ? 'top' : 'biggest'} {mode === 'stocks' ? 'stock' : 'crypto'} {viewType === 'gainers' ? 'gainers' : 'losers'}...
                    </LoadingText>
                </LoadingContainer>
            ) : sortedResults.length > 0 ? (
                <ResultsContainer>
                    <ResultsTable theme={theme}>
                        <TableHeader theme={theme}>
                            <TableHeaderCell theme={theme}>
                                Rank
                            </TableHeaderCell>
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
                        </TableHeader>

                        <TableBody theme={theme}>
                            {sortedResults.map((item, index) => (
                                <TableRow 
                                    theme={theme} 
                                    key={item.symbol || item.id || index}
                                    onClick={() => handleRowClick(item)}
                                    title={`Click to view ${item.symbol} details`}
                                >
                                    <TableCell theme={theme}>
                                        <RankCell theme={theme} $rank={index + 1}>
                                            #{index + 1}
                                        </RankCell>
                                    </TableCell>
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
                                            <Symbol theme={theme}>
                                                {item.symbol}
                                                {item.source === 'dexscreener' && (
                                                    <ChainBadge>BSC</ChainBadge>
                                                )}
                                            </Symbol>
                                        </SymbolCell>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <Name theme={theme}>
                                            {item.name}
                                            {mode === 'crypto' && item.source && (
                                                <SourceBadge theme={theme} $source={item.source}>
                                                    {item.source === 'dexscreener' ? '📊 DEX' : '🦎 CG'}
                                                </SourceBadge>
                                            )}
                                        </Name>
                                    </TableCell>
                                    <TableCell theme={theme}>
                                        <PriceCell theme={theme}>{formatPrice(item.price || 0, mode)}</PriceCell>
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
                    <EmptyTitle theme={theme}>No Data Available</EmptyTitle>
                    <EmptyText theme={theme}>
                        Click refresh to load the top gainers
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default ScreenerPage;