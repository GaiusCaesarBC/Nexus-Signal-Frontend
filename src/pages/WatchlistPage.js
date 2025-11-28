// client/src/pages/WatchlistPage.js - REVAMPED CLEAN WATCHLIST

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, Plus, Trash2, X, Eye, Star,
    Activity, BarChart3, ArrowUpRight, ArrowDownRight,
    Bell, BellOff, Download, Search, RefreshCw, Flame,
    AlertTriangle, Target, Zap, Bitcoin, Coins
} from 'lucide-react';
import {
    LineChart, Line, ResponsiveContainer, AreaChart, Area
} from 'recharts';

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
    color: #e0e6ed;
    padding: 6rem 2rem 2rem;
`;

const ContentWrapper = styled.div`
    max-width: 1600px;
    margin: 0 auto;
`;

const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1rem;
    margin-top: 0.25rem;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: ${props => props.$primary 
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'rgba(0, 173, 237, 0.1)'};
    border: 1px solid ${props => props.$primary ? 'transparent' : 'rgba(0, 173, 237, 0.3)'};
    border-radius: 10px;
    color: ${props => props.$primary ? 'white' : '#00adef'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$primary 
            ? '0 8px 24px rgba(16, 185, 129, 0.4)'
            : '0 8px 24px rgba(0, 173, 237, 0.2)'};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        ${props => props.$spinning && css`animation: ${rotate} 1s linear infinite;`}
    }
`;

// ============ STATS HERO ============
const StatsHero = styled.div`
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1.25rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
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
        background: ${props => props.$color || 'linear-gradient(90deg, #00adef, #0088cc)'};
    }
`;

const StatIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.15)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#00adef'};
    margin-bottom: 0.75rem;
`;

const StatLabel = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
    font-size: 1.75rem;
    font-weight: 800;
    color: ${props => props.$color || '#e0e6ed'};
`;

const StatSubtext = styled.div`
    font-size: 0.8rem;
    color: #64748b;
    margin-top: 0.25rem;
`;

// ============ TOOLBAR ============
const Toolbar = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
`;

const SearchWrapper = styled.div`
    flex: 1;
    min-width: 250px;
    position: relative;

    @media (max-width: 600px) {
        min-width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 0.9rem;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SearchIconStyled = styled(Search)`
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    width: 16px;
    height: 16px;
`;

const Select = styled.select`
    padding: 0.6rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #00adef;
    }

    option {
        background: #1a1f3a;
        color: #e0e6ed;
    }
`;

// ============ WATCHLIST TABLE ============
const WatchlistSection = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 20px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.3rem;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TableWrapper = styled.div`
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    text-align: left;
    padding: 1rem 0.75rem;
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);
`;

const Tr = styled.tr`
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        background: rgba(0, 173, 237, 0.05);
    }
`;

const Td = styled.td`
    padding: 1rem 0.75rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.05);
    vertical-align: middle;
`;

const SymbolCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SymbolIcon = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: ${props => props.$crypto 
        ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)'
        : 'linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.85rem;
    color: ${props => props.$crypto ? '#fbbf24' : '#00adef'};
`;

const SymbolInfo = styled.div``;

const SymbolName = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SymbolCompany = styled.div`
    font-size: 0.75rem;
    color: #64748b;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const TypeBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    background: ${props => props.$crypto 
        ? 'rgba(251, 191, 36, 0.15)' 
        : 'rgba(0, 173, 237, 0.15)'};
    color: ${props => props.$crypto ? '#fbbf24' : '#00adef'};
    border: 1px solid ${props => props.$crypto 
        ? 'rgba(251, 191, 36, 0.3)' 
        : 'rgba(0, 173, 237, 0.3)'};
`;

const PriceCell = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 1.1rem;
`;

const ChangeCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`;

const ChangeValue = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 700;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-size: 0.95rem;
`;

const ChangePercent = styled.div`
    font-size: 0.8rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

const SparklineCell = styled.div`
    width: 100px;
    height: 35px;
`;

const AlertCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AlertBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    background: ${props => props.$active 
        ? 'rgba(16, 185, 129, 0.15)' 
        : 'rgba(100, 116, 139, 0.1)'};
    border: 1px solid ${props => props.$active 
        ? 'rgba(16, 185, 129, 0.3)' 
        : 'rgba(100, 116, 139, 0.2)'};
    border-radius: 6px;
    font-size: 0.75rem;
    color: ${props => props.$active ? '#10b981' : '#64748b'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active 
            ? 'rgba(16, 185, 129, 0.25)' 
            : 'rgba(100, 116, 139, 0.2)'};
        transform: scale(1.02);
    }
`;

const ActionCell = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const SmallButton = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 173, 237, 0.1)'};
    border: 1px solid ${props => props.$danger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 173, 237, 0.3)'};
    color: ${props => props.$danger ? '#ef4444' : '#00adef'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 173, 237, 0.2)'};
        transform: scale(1.05);
    }
`;

// ============ MODAL ============
const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    padding: 2rem;
    max-width: 450px;
    width: 100%;
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
    display: block;
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const ModalSelect = styled.select`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #00adef;
    }

    option {
        background: #1a1f3a;
        color: #e0e6ed;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 0.875rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const HelpText = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-top: 0.5rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(0, 173, 237, 0.3);
`;

const EmptyTitle = styled.h2`
    color: #00adef;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    color: #94a3b8;
    margin-bottom: 2rem;
`;

// ============ LOADING ============
const SpinningIcon = styled.div`
    animation: ${rotate} 2s linear infinite;
    display: inline-flex;
`;

// ============ CRYPTO DETECTION ============
const CRYPTO_SYMBOLS = [
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC', 'LTC',
    'SHIB', 'TRX', 'AVAX', 'LINK', 'ATOM', 'UNI', 'XLM', 'ETC', 'BCH', 'ALGO',
    'VET', 'FIL', 'ICP', 'MANA', 'SAND', 'AXS', 'AAVE', 'MKR', 'COMP', 'SNX',
    'CRO', 'NEAR', 'FTM', 'HBAR', 'EGLD', 'THETA', 'XTZ', 'EOS', 'CAKE', 'RUNE',
    'ZEC', 'DASH', 'NEO', 'WAVES', 'KSM', 'ENJ', 'CHZ', 'BAT', 'ZIL', 'QTUM',
    'BTT', 'ONE', 'HOT', 'IOTA', 'XMR', 'KLAY', 'GRT', 'SUSHI', 'YFI', 'CRV',
    'BTCUSD', 'ETHUSD', 'BNBUSD', 'XRPUSD', 'SOLUSD', 'DOGEUSD', 'ADAUSD'
];

const isCrypto = (symbol) => {
    if (!symbol) return false;
    const upperSymbol = symbol.toUpperCase();
    // Check if it's in our crypto list or ends with common crypto patterns
    return CRYPTO_SYMBOLS.includes(upperSymbol) || 
           upperSymbol.endsWith('USD') && CRYPTO_SYMBOLS.includes(upperSymbol.replace('USD', '')) ||
           upperSymbol.endsWith('USDT') ||
           upperSymbol.endsWith('BTC') ||
           upperSymbol.endsWith('ETH');
};

const getCryptoName = (symbol) => {
    const names = {
        'BTC': 'Bitcoin', 'ETH': 'Ethereum', 'BNB': 'Binance Coin', 'XRP': 'Ripple',
        'ADA': 'Cardano', 'DOGE': 'Dogecoin', 'SOL': 'Solana', 'DOT': 'Polkadot',
        'MATIC': 'Polygon', 'LTC': 'Litecoin', 'SHIB': 'Shiba Inu', 'AVAX': 'Avalanche',
        'LINK': 'Chainlink', 'UNI': 'Uniswap', 'ATOM': 'Cosmos', 'XLM': 'Stellar',
        'ETC': 'Ethereum Classic', 'BCH': 'Bitcoin Cash', 'ALGO': 'Algorand',
        'VET': 'VeChain', 'FIL': 'Filecoin', 'NEAR': 'NEAR Protocol', 'FTM': 'Fantom',
        'SAND': 'The Sandbox', 'MANA': 'Decentraland', 'AXS': 'Axie Infinity',
        'AAVE': 'Aave', 'MKR': 'Maker', 'CRO': 'Cronos', 'GRT': 'The Graph'
    };
    const base = symbol?.toUpperCase().replace('USD', '').replace('USDT', '');
    return names[base] || `${base} Crypto`;
};

// Helper to format price - handles potential API issues
const formatPrice = (price, symbol) => {
    if (!price || price === 0) return '$0.00';
    
    // For display, determine decimal places based on price magnitude
    if (price >= 1000) {
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
        return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
        return `$${price.toFixed(4)}`;
    } else {
        // Very small prices (like SHIB)
        return `$${price.toFixed(8)}`;
    }
};

// ============ COMPONENT ============
const WatchlistPage = () => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    // State
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('symbol');
    const [filterBy, setFilterBy] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [formData, setFormData] = useState({ symbol: '' });
    const [alertFormData, setAlertFormData] = useState({ targetPrice: '', condition: 'above' });

    // Fetch on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchlist();
        }
    }, [isAuthenticated]);

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const response = await api.get('/watchlist');
            console.log('📊 Raw watchlist response:', response.data);
            
            const watchlistData = Array.isArray(response.data) 
                ? response.data 
                : response.data.watchlist || [];
            
            // Debug: Log each item's price data
            watchlistData.forEach(item => {
                console.log(`💰 ${item.symbol}: price=${item.currentPrice || item.price}, change=${item.changePercent}`);
            });
            
            // Generate mock chart data for each stock
            const watchlistWithCharts = watchlistData.map(stock => ({
                ...stock,
                chartData: generateSparklineData(stock.changePercent >= 0)
            }));
            
            setWatchlist(watchlistWithCharts);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            toast.error('Failed to load watchlist');
            setWatchlist([]);
        } finally {
            setLoading(false);
        }
    };

    const generateSparklineData = (positive) => {
        const baseValue = 100;
        const trend = positive ? 0.5 : -0.5;
        return Array.from({ length: 20 }, (_, i) => ({
            value: baseValue + (Math.random() - 0.5 + trend) * 10 + (i * trend)
        }));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWatchlist();
        setRefreshing(false);
        toast.success('Watchlist refreshed!');
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        try {
            await api.post('/watchlist', { symbol: formData.symbol.toUpperCase() });
            toast.success(`${formData.symbol.toUpperCase()} added!`);
            setShowAddModal(false);
            setFormData({ symbol: '' });
            fetchWatchlist();
        } catch (error) {
            const errorMsg = error.response?.data?.error || '';
            if (errorMsg.includes('already exists')) {
                toast.warning(`${formData.symbol.toUpperCase()} is already in your watchlist`);
            } else {
                toast.error('Failed to add stock');
            }
        }
    };

    const handleRemoveStock = async (symbol, e) => {
        e?.stopPropagation();
        if (!window.confirm(`Remove ${symbol} from watchlist?`)) return;

        try {
            await api.delete(`/watchlist/${symbol}`);
            toast.success(`${symbol} removed`);
            fetchWatchlist();
        } catch (error) {
            toast.error('Failed to remove stock');
        }
    };

    const handleSetAlert = (stock, e) => {
        e?.stopPropagation();
        setSelectedStock(stock);
        setAlertFormData({
            targetPrice: stock.currentPrice || stock.price || '',
            condition: 'above'
        });
        setShowAlertModal(true);
    };

    const handleSubmitAlert = (e) => {
        e.preventDefault();
        const targetPrice = parseFloat(alertFormData.targetPrice);
        
        if (targetPrice <= 0) {
            toast.warning('Target price must be greater than 0');
            return;
        }

        setWatchlist(prev => prev.map(stock => 
            stock.symbol === selectedStock.symbol 
                ? { ...stock, hasAlert: true, alertPrice: targetPrice, alertCondition: alertFormData.condition }
                : stock
        ));

        toast.success(`Alert set: ${selectedStock.symbol} ${alertFormData.condition} $${targetPrice.toFixed(2)}`);
        setShowAlertModal(false);
        setSelectedStock(null);
    };

    const handleExportCSV = () => {
        const csv = [
            ['Symbol', 'Name', 'Price', 'Change', 'Change %', 'Alert'].join(','),
            ...filteredWatchlist.map(stock => [
                stock.symbol || '',
                stock.name || '',
                stock.currentPrice || stock.price || 0,
                stock.change || 0,
                stock.changePercent || 0,
                stock.hasAlert ? `${stock.alertCondition} $${stock.alertPrice}` : 'None'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `watchlist-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Watchlist exported!');
    };

    const handleRowClick = (symbol) => {
        if (isCrypto(symbol)) {
            navigate(`/crypto/${symbol}`);
        } else {
            navigate(`/stocks/${symbol}`);
        }
    };

    // Filter and sort
    const filteredWatchlist = useMemo(() => {
        let filtered = [...watchlist];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s => 
                (s.symbol || '').toLowerCase().includes(query) ||
                (s.name || '').toLowerCase().includes(query)
            );
        }

        // Filter
        if (filterBy === 'gainers') {
            filtered = filtered.filter(s => (s.changePercent || 0) > 0);
        } else if (filterBy === 'losers') {
            filtered = filtered.filter(s => (s.changePercent || 0) < 0);
        } else if (filterBy === 'alerts') {
            filtered = filtered.filter(s => s.hasAlert);
        } else if (filterBy === 'stocks') {
            filtered = filtered.filter(s => !isCrypto(s.symbol || s.ticker));
        } else if (filterBy === 'crypto') {
            filtered = filtered.filter(s => isCrypto(s.symbol || s.ticker));
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'symbol':
                    return (a.symbol || '').localeCompare(b.symbol || '');
                case 'price':
                    return (b.currentPrice || b.price || 0) - (a.currentPrice || a.price || 0);
                case 'change':
                    return (b.changePercent || 0) - (a.changePercent || 0);
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                default:
                    return 0;
            }
        });

        return filtered;
    }, [watchlist, searchQuery, sortBy, filterBy]);

    // Stats
    const stats = useMemo(() => {
        if (!Array.isArray(watchlist) || watchlist.length === 0) {
            return { total: 0, stocks: 0, crypto: 0, gainers: 0, losers: 0, avgChange: 0, alerts: 0 };
        }
        
        const stocks = watchlist.filter(s => !isCrypto(s.symbol || s.ticker)).length;
        const crypto = watchlist.filter(s => isCrypto(s.symbol || s.ticker)).length;
        const gainers = watchlist.filter(s => (s.changePercent || 0) > 0).length;
        const losers = watchlist.filter(s => (s.changePercent || 0) < 0).length;
        const avgChange = watchlist.reduce((sum, s) => sum + (s.changePercent || 0), 0) / watchlist.length;
        const alerts = watchlist.filter(s => s.hasAlert).length;

        return { total: watchlist.length, stocks, crypto, gainers, losers, avgChange, alerts };
    }, [watchlist]);

    if (loading) {
        return (
            <PageContainer>
                <ContentWrapper>
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <SpinningIcon><Activity size={64} color="#00adef" /></SpinningIcon>
                        <h2 style={{ marginTop: '1rem', color: '#00adef' }}>Loading Watchlist...</h2>
                    </div>
                </ContentWrapper>
            </PageContainer>
        );
    }

    if (watchlist.length === 0) {
        return (
            <PageContainer>
                <ContentWrapper>
                    <Header>
                        <Title>My Watchlist</Title>
                        <Subtitle>Track stocks & crypto in real-time</Subtitle>
                    </Header>
                    <EmptyState>
                        <EmptyIcon>
                            <Eye size={48} color="#00adef" />
                        </EmptyIcon>
                        <EmptyTitle>Your Watchlist is Empty</EmptyTitle>
                        <EmptyText>Add stocks or crypto to track their performance</EmptyText>
                        <ActionButton $primary onClick={() => setShowAddModal(true)}>
                            <Plus size={20} />
                            Add Your First Stock
                        </ActionButton>
                    </EmptyState>
                </ContentWrapper>

                {showAddModal && (
                    <Modal onClick={() => setShowAddModal(false)}>
                        <ModalContent onClick={e => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle>Add to Watchlist</ModalTitle>
                                <CloseButton onClick={() => setShowAddModal(false)}>
                                    <X size={18} />
                                </CloseButton>
                            </ModalHeader>
                            <Form onSubmit={handleAddStock}>
                                <FormGroup>
                                    <Label>Symbol (Stock or Crypto)</Label>
                                    <Input
                                        type="text"
                                        placeholder="AAPL, TSLA, BTC, ETH..."
                                        value={formData.symbol}
                                        onChange={e => setFormData({ symbol: e.target.value.toUpperCase() })}
                                        required
                                        autoFocus
                                    />
                                    <HelpText>
                                        Enter any stock ticker or crypto symbol
                                    </HelpText>
                                </FormGroup>
                                <SubmitButton type="submit">Add to Watchlist</SubmitButton>
                            </Form>
                        </ModalContent>
                    </Modal>
                )}
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentWrapper>
                {/* Header */}
                <Header>
                    <HeaderTop>
                        <div>
                            <Title>My Watchlist</Title>
                            <Subtitle>{watchlist.length} assets • Stocks & Crypto</Subtitle>
                        </div>
                        <HeaderActions>
                            <ActionButton onClick={handleRefresh} disabled={refreshing} $spinning={refreshing}>
                                <RefreshCw size={18} />
                                Refresh
                            </ActionButton>
                            <ActionButton onClick={handleExportCSV}>
                                <Download size={18} />
                                Export
                            </ActionButton>
                            <ActionButton $primary onClick={() => setShowAddModal(true)}>
                                <Plus size={18} />
                                Add Stock
                            </ActionButton>
                        </HeaderActions>
                    </HeaderTop>
                </Header>

                {/* Stats */}
                <StatsHero>
                    <StatCard $delay="0s" $color="linear-gradient(90deg, #00adef, #0088cc)">
                        <StatIcon $bg="rgba(0, 173, 237, 0.15)" $color="#00adef">
                            <Eye size={20} />
                        </StatIcon>
                        <StatLabel>Total</StatLabel>
                        <StatValue>{stats.total}</StatValue>
                        <StatSubtext>watching</StatSubtext>
                    </StatCard>

                    <StatCard $delay="0.05s" $color="linear-gradient(90deg, #8b5cf6, #7c3aed)">
                        <StatIcon $bg="rgba(139, 92, 246, 0.15)" $color="#a78bfa">
                            <BarChart3 size={20} />
                        </StatIcon>
                        <StatLabel>Stocks</StatLabel>
                        <StatValue $color="#a78bfa">{stats.stocks}</StatValue>
                        <StatSubtext>equities</StatSubtext>
                    </StatCard>

                    <StatCard $delay="0.1s" $color="linear-gradient(90deg, #fbbf24, #f59e0b)">
                        <StatIcon $bg="rgba(251, 191, 36, 0.15)" $color="#fbbf24">
                            <Bitcoin size={20} />
                        </StatIcon>
                        <StatLabel>Crypto</StatLabel>
                        <StatValue $color="#fbbf24">{stats.crypto}</StatValue>
                        <StatSubtext>tokens</StatSubtext>
                    </StatCard>

                    <StatCard $delay="0.15s" $color="linear-gradient(90deg, #10b981, #059669)">
                        <StatIcon $bg="rgba(16, 185, 129, 0.15)" $color="#10b981">
                            <TrendingUp size={20} />
                        </StatIcon>
                        <StatLabel>Gainers</StatLabel>
                        <StatValue $color="#10b981">{stats.gainers}</StatValue>
                        <StatSubtext>up today</StatSubtext>
                    </StatCard>

                    <StatCard $delay="0.2s" $color="linear-gradient(90deg, #ef4444, #dc2626)">
                        <StatIcon $bg="rgba(239, 68, 68, 0.15)" $color="#ef4444">
                            <TrendingDown size={20} />
                        </StatIcon>
                        <StatLabel>Losers</StatLabel>
                        <StatValue $color="#ef4444">{stats.losers}</StatValue>
                        <StatSubtext>down today</StatSubtext>
                    </StatCard>
                </StatsHero>

                {/* Watchlist Table */}
                <WatchlistSection>
                    <SectionHeader>
                        <SectionTitle>
                            <Star size={22} />
                            Watched Stocks
                        </SectionTitle>
                    </SectionHeader>

                    <Toolbar>
                        <SearchWrapper>
                            <SearchIconStyled />
                            <SearchInput
                                type="text"
                                placeholder="Search stocks..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </SearchWrapper>

                        <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="symbol">Sort by Symbol</option>
                            <option value="name">Sort by Name</option>
                            <option value="price">Sort by Price</option>
                            <option value="change">Sort by Change</option>
                        </Select>

                        <Select value={filterBy} onChange={e => setFilterBy(e.target.value)}>
                            <option value="all">All Assets</option>
                            <option value="stocks">Stocks Only</option>
                            <option value="crypto">Crypto Only</option>
                            <option value="gainers">Gainers Only</option>
                            <option value="losers">Losers Only</option>
                            <option value="alerts">With Alerts</option>
                        </Select>
                    </Toolbar>

                    <TableWrapper>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Symbol</Th>
                                    <Th>Price</Th>
                                    <Th>Change</Th>
                                    <Th>Trend</Th>
                                    <Th>Alert</Th>
                                    <Th></Th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWatchlist.map(stock => {
                                    const symbol = stock.symbol || stock.ticker || 'Unknown';
                                    const price = stock.currentPrice || stock.price || 0;
                                    const change = stock.change || 0;
                                    const changePercent = stock.changePercent || 0;
                                    const positive = changePercent >= 0;
                                    const crypto = isCrypto(symbol);
                                    const displayName = crypto ? getCryptoName(symbol) : (stock.name || 'Company');

                                    return (
                                        <Tr key={symbol} onClick={() => handleRowClick(symbol)}>
                                            <Td>
                                                <SymbolCell>
                                                    <SymbolIcon $crypto={crypto}>
                                                        {crypto ? <Bitcoin size={18} /> : symbol.substring(0, 2)}
                                                    </SymbolIcon>
                                                    <SymbolInfo>
                                                        <SymbolName>
                                                            {symbol}
                                                            {positive ? 
                                                                <Star size={14} color="#10b981" /> : 
                                                                <Flame size={14} color="#ef4444" />
                                                            }
                                                            <TypeBadge $crypto={crypto}>
                                                                {crypto ? <Coins size={10} /> : <BarChart3 size={10} />}
                                                                {crypto ? 'Crypto' : 'Stock'}
                                                            </TypeBadge>
                                                        </SymbolName>
                                                        <SymbolCompany>{displayName}</SymbolCompany>
                                                    </SymbolInfo>
                                                </SymbolCell>
                                            </Td>
                                            <Td>
                                                <PriceCell>{formatPrice(price, symbol)}</PriceCell>
                                            </Td>
                                            <Td>
                                                <ChangeCell>
                                                    <ChangeValue $positive={positive}>
                                                        {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                        ${Math.abs(change).toFixed(2)}
                                                    </ChangeValue>
                                                    <ChangePercent $positive={positive}>
                                                        {positive ? '+' : ''}{changePercent.toFixed(2)}%
                                                    </ChangePercent>
                                                </ChangeCell>
                                            </Td>
                                            <Td>
                                                <SparklineCell>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={stock.chartData || []}>
                                                            <defs>
                                                                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor={positive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                                                                    <stop offset="100%" stopColor={positive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <Area 
                                                                type="monotone" 
                                                                dataKey="value" 
                                                                stroke={positive ? '#10b981' : '#ef4444'} 
                                                                strokeWidth={2}
                                                                fill={`url(#gradient-${symbol})`}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </SparklineCell>
                                            </Td>
                                            <Td>
                                                <AlertCell>
                                                    <AlertBadge 
                                                        $active={stock.hasAlert}
                                                        onClick={e => handleSetAlert(stock, e)}
                                                    >
                                                        {stock.hasAlert ? <Bell size={12} /> : <BellOff size={12} />}
                                                        {stock.hasAlert 
                                                            ? `${stock.alertCondition} $${stock.alertPrice?.toFixed(0)}`
                                                            : 'Set Alert'
                                                        }
                                                    </AlertBadge>
                                                </AlertCell>
                                            </Td>
                                            <Td>
                                                <ActionCell>
                                                    <SmallButton $danger onClick={e => handleRemoveStock(symbol, e)}>
                                                        <Trash2 size={14} />
                                                    </SmallButton>
                                                </ActionCell>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </TableWrapper>
                </WatchlistSection>
            </ContentWrapper>

            {/* Add Modal */}
            {showAddModal && (
                <Modal onClick={() => setShowAddModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Add to Watchlist</ModalTitle>
                            <CloseButton onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </CloseButton>
                        </ModalHeader>
                        <Form onSubmit={handleAddStock}>
                            <FormGroup>
                                <Label>Symbol (Stock or Crypto)</Label>
                                <Input
                                    type="text"
                                    placeholder="AAPL, TSLA, BTC, ETH..."
                                    value={formData.symbol}
                                    onChange={e => setFormData({ symbol: e.target.value.toUpperCase() })}
                                    required
                                    autoFocus
                                />
                                <HelpText>
                                    Enter any stock ticker (AAPL, NVDA) or crypto symbol (BTC, ETH, SOL)
                                </HelpText>
                            </FormGroup>
                            <SubmitButton type="submit">Add to Watchlist</SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}

            {/* Alert Modal */}
            {showAlertModal && selectedStock && (
                <Modal onClick={() => setShowAlertModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Set Alert for {selectedStock.symbol}</ModalTitle>
                            <CloseButton onClick={() => setShowAlertModal(false)}>
                                <X size={18} />
                            </CloseButton>
                        </ModalHeader>
                        <Form onSubmit={handleSubmitAlert}>
                            <FormGroup>
                                <Label>Alert Condition</Label>
                                <ModalSelect 
                                    value={alertFormData.condition}
                                    onChange={e => setAlertFormData({ ...alertFormData, condition: e.target.value })}
                                >
                                    <option value="above">Price goes above</option>
                                    <option value="below">Price goes below</option>
                                </ModalSelect>
                            </FormGroup>
                            <FormGroup>
                                <Label>Target Price</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="150.00"
                                    value={alertFormData.targetPrice}
                                    onChange={e => setAlertFormData({ ...alertFormData, targetPrice: e.target.value })}
                                    required
                                    autoFocus
                                />
                                <HelpText>
                                    Current price: ${(selectedStock.currentPrice || selectedStock.price || 0).toFixed(2)}
                                </HelpText>
                            </FormGroup>
                            <SubmitButton type="submit">Create Alert</SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
};

export default WatchlistPage;