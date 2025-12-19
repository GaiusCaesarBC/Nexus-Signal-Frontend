// client/src/pages/ComparisonPage.js - STOCKS & CRYPTO COMPARISON (REAL API DATA + THEMED)

import React, { useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import {
    TrendingUp, TrendingDown, Plus, X, ArrowUpRight, ArrowDownRight,
    DollarSign, Activity, BarChart3, Award, AlertCircle, Search,
    Target, Shield, GitCompare, Percent, Building, Bitcoin, RefreshCw,
    ExternalLink
} from 'lucide-react';
import SEO from '../components/SEO';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title as ChartJSTitle,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    ChartJSTitle, Tooltip, Legend, Filler
);

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
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding: 6rem 2rem 2rem;
`;

const ContentWrapper = styled.div`
    max-width: 1600px;
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
    flex-wrap: wrap;
    gap: 1rem;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
    font-size: 2.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
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

// ============ ASSET SELECTOR ============
const SelectorCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const SelectorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const SelectorTitle = styled.h3`
    font-size: 1rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const AssetCount = styled.span`
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    background: ${props => props.theme?.text?.tertiary || '#64748b'}33;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
`;

const SelectedAssets = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    min-height: 42px;
    align-items: center;
`;

const AssetChip = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$type === 'crypto'
        ? `${props.theme?.warning || '#f59e0b'}26`
        : `${props.theme?.brand?.primary || '#00adef'}26`};
    border: 1px solid ${props => props.$type === 'crypto' 
        ? `${props.theme?.warning || '#f59e0b'}4D` 
        : `${props.theme?.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${props => props.$type === 'crypto' 
        ? (props.theme?.warning || '#f59e0b') 
        : (props.theme?.brand?.primary || '#00adef')};
    font-weight: 700;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px ${props => props.$type === 'crypto' 
            ? `${props.theme?.warning || '#f59e0b'}40` 
            : `${props.theme?.brand?.primary || '#00adef'}40`};
    }
`;

const ChipColor = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$color};
`;

const TypeIcon = styled.div`
    display: flex;
    align-items: center;
`;

const RemoveBtn = styled.button`
    background: ${props => props.theme?.error || '#ef4444'}26;
    border: none;
    border-radius: 6px;
    padding: 0.2rem;
    color: ${props => props.theme?.error || '#ef4444'};
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.error || '#ef4444'}4D;
    }
`;

const EmptyChips = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
`;

const SearchRow = styled.div`
    display: flex;
    gap: 0.75rem;

    @media (max-width: 500px) {
        flex-direction: column;
    }
`;

const SearchInputWrapper = styled.div`
    flex: 1;
    position: relative;
`;

const SearchIconStyled = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 2.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 10px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
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

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        ${props => props.$loading && css`animation: ${rotate} 1s linear infinite;`}
    }
`;

const HelpText = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
    margin-top: 0.75rem;
`;

// ============ INSIGHTS CARDS ============
const InsightsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const InsightCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
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

const InsightHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
`;

const InsightIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$bg || `${props.theme?.brand?.primary || '#00adef'}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme?.brand?.primary || '#00adef'};
`;

const InsightLabel = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;

const InsightValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const InsightSubtext = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$color || props.theme?.text?.tertiary || '#64748b'};
`;

// ============ CHART SECTION ============
const ChartCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const ChartControls = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
`;

const MetricToggle = styled.div`
    display: flex;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 10px;
    padding: 0.25rem;
    flex-wrap: wrap;
`;

const MetricBtn = styled.button`
    padding: 0.4rem 0.75rem;
    background: ${props => props.$active 
        ? `${props.theme?.brand?.primary || '#00adef'}4D`
        : 'transparent'};
    border: none;
    border-radius: 8px;
    color: ${props => props.$active 
        ? (props.theme?.brand?.primary || '#00adef') 
        : (props.theme?.text?.tertiary || '#64748b')};
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;

    &:hover {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const SectionTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const TimeframeToggle = styled.div`
    display: flex;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 10px;
    padding: 0.25rem;
`;

const TimeframeBtn = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active 
        ? `${props.theme?.brand?.primary || '#00adef'}4D`
        : 'transparent'};
    border: none;
    border-radius: 8px;
    color: ${props => props.$active 
        ? (props.theme?.brand?.primary || '#00adef') 
        : (props.theme?.text?.tertiary || '#64748b')};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
    }
`;

const ChartWrapper = styled.div`
    height: 350px;
    position: relative;
`;

const ChartLoading = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

// ============ COMPARISON TABLE ============
const TableCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
    overflow-x: auto;
    animation: ${fadeIn} 0.6s ease-out;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
`;

const THead = styled.thead`
    border-bottom: 2px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
`;

const TH = styled.th`
    padding: 0.875rem 1rem;
    text-align: ${props => props.$align || 'left'};
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const THClickable = styled(TH)`
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    }
`;

const TBody = styled.tbody``;

const TR = styled.tr`
    border-bottom: 1px solid ${props => props.theme?.text?.tertiary || '#64748b'}26;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}0D;
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TD = styled.td`
    padding: 0.875rem 1rem;
    text-align: ${props => props.$align || 'left'};
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
`;

const MetricCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-weight: 600;
`;

const ValueCell = styled.div`
    font-weight: 600;
    color: ${props => {
        if (props.$best) return props.theme?.success || '#10b981';
        if (props.$worst) return props.theme?.error || '#ef4444';
        return props.theme?.text?.primary || '#e0e6ed';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
`;

const Badge = styled.span`
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-weight: 700;
    background: ${props => props.$type === 'best' 
        ? `${props.theme?.success || '#10b981'}33` 
        : `${props.theme?.error || '#ef4444'}33`};
    color: ${props => props.$type === 'best' 
        ? (props.theme?.success || '#10b981') 
        : (props.theme?.error || '#ef4444')};
`;

const ChangeValue = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    color: ${props => props.$positive 
        ? (props.theme?.success || '#10b981') 
        : (props.theme?.error || '#ef4444')};
    font-weight: 600;
`;

const NAValue = styled.span`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-style: italic;
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

// ============ LOADING STATE ============
const LoadingOverlay = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1rem;
`;

const SpinningIcon = styled.div`
    animation: ${rotate} 1s linear infinite;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

// ============ CRYPTO DETECTION ============
const CRYPTO_SYMBOLS = [
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC', 'LTC',
    'SHIB', 'AVAX', 'LINK', 'UNI', 'ATOM', 'XLM', 'ALGO', 'VET', 'FIL', 'NEAR',
    'APT', 'ARB', 'OP', 'SUI', 'SEI', 'TIA', 'PEPE', 'WIF', 'BONK', 'FTM',
    'AAVE', 'MKR', 'CRV', 'SNX', 'COMP', 'SUSHI', 'YFI', 'SAND', 'MANA', 'AXS',
    'TRX', 'ETC', 'BCH', 'XMR', 'ZEC', 'DASH', 'EOS', 'NEO', 'THETA', 'HBAR',
    'ICP', 'QNT', 'GRT', 'FET', 'RNDR', 'INJ', 'IMX', 'STX', 'EGLD', 'KAVA'
];

const isCrypto = (symbol) => CRYPTO_SYMBOLS.includes(symbol.toUpperCase());

// ============ COMPONENT ============
const ComparisonPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [selectedAssets, setSelectedAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [assetData, setAssetData] = useState({});
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(false);
    const [timeframe, setTimeframe] = useState('1M');
    const [chartMetric, setChartMetric] = useState('price'); // price, volume, marketCap, performance, change24h, peRatio, week52High

    // Theme colors
    const primaryColor = theme?.brand?.primary || '#00adef';
    const secondaryColor = theme?.brand?.secondary || '#0088cc';
    const accentColor = theme?.brand?.accent || '#8b5cf6';
    const successColor = theme?.success || '#10b981';
    const errorColor = theme?.error || '#ef4444';
    const warningColor = theme?.warning || '#f59e0b';
    const infoColor = theme?.info || '#3b82f6';

    // Chart colors from theme
    const CHART_COLORS = [
        primaryColor,
        successColor,
        warningColor,
        accentColor,
        errorColor
    ];

    // Navigate to asset detail page
    const handleAssetClick = (symbol, type, e) => {
        // Don't navigate if clicking remove button
        if (e?.target?.closest('button')) return;
        
        if (type === 'crypto') {
            navigate(`/crypto/${symbol.toLowerCase()}`);
        } else {
            navigate(`/stocks/${symbol.toUpperCase()}`);
        }
    };

    // Navigate to detail page from table header
    const handleHeaderClick = (symbol, type) => {
        if (type === 'crypto') {
            navigate(`/crypto/${symbol.toLowerCase()}`);
        } else {
            navigate(`/stocks/${symbol.toUpperCase()}`);
        }
    };

    // Fetch real data for a stock using /stocks/quote/:symbol
    const fetchStockData = async (symbol) => {
        try {
            const response = await api.get(`/stocks/quote/${symbol}`);
            const data = response.data;
            
            return {
                symbol: symbol.toUpperCase(),
                name: data.name || symbol,
                type: 'stock',
                price: data.price || 0,
                change: data.change || 0,
                changePercent: data.changePercent || 0,
                marketCap: data.marketCap || null,
                peRatio: data.pe || null,
                week52High: data.high52 || null,
                week52Low: data.low52 || null,
                dividend: data.dividend || null,
                dividendYield: data.dividendYield || null,
                volume: data.volume || 0,
                avgVolume: data.avgVolume || null,
                beta: data.beta || null,
                eps: data.eps || null,
                open: data.open || null,
                dayHigh: data.dayHigh || null,
                dayLow: data.dayLow || null,
                previousClose: data.previousClose || null,
                sector: data.sector || null,
                industry: data.industry || null,
                exchange: data.exchange || null
            };
        } catch (error) {
            console.error(`Error fetching stock ${symbol}:`, error);
            throw error;
        }
    };

    // Fetch real data for crypto using /crypto/quote/:symbol
    const fetchCryptoData = async (symbol) => {
        try {
            const response = await api.get(`/crypto/quote/${symbol}`);
            const data = response.data;
            
            return {
                symbol: data.symbol || symbol.toUpperCase(),
                name: data.name || symbol,
                type: 'crypto',
                price: data.price || 0,
                change: data.change24h || 0,
                changePercent: data.changePercent24h || 0,
                marketCap: data.marketCap || 0,
                volume: data.volume24h || 0,
                high24h: data.high24h || null,
                low24h: data.low24h || null,
                circulatingSupply: data.circulatingSupply || null,
                totalSupply: data.totalSupply || null,
                maxSupply: data.maxSupply || null,
                ath: data.ath || null,
                athChangePercent: data.athChangePercent || null,
                athDate: data.athDate || null,
                atl: data.atl || null,
                priceChange7d: data.priceChange7d || null,
                priceChange30d: data.priceChange30d || null,
                priceChange1y: data.priceChange1y || null,
                marketCapRank: data.marketCapRank || null,
                image: data.image || null
            };
        } catch (error) {
            console.error(`Error fetching crypto ${symbol}:`, error);
            throw error;
        }
    };

    // Fetch chart data using correct endpoints
    const fetchChartData = async (symbol, type) => {
        try {
            if (type === 'crypto') {
                // Crypto: /crypto/historical/:symbol?range=1M
                const range = timeframe; // 1W, 1M, 3M, 1Y
                const response = await api.get(`/crypto/historical/${symbol}`, {
                    params: { range }
                });
                
                const historicalData = response.data.historicalData || [];
                return historicalData.map(d => ({
                    date: d.date || d.time,
                    price: d.close || d.price
                }));
            } else {
                // Stock: /stocks/historical/:symbol?range=1M
                const response = await api.get(`/stocks/historical/${symbol}`, {
                    params: { range: timeframe }
                });
                
                const historicalData = response.data.historicalData || [];
                return historicalData.map(d => ({
                    date: d.date || d.time,
                    price: d.close || d.price
                }));
            }
        } catch (error) {
            console.error(`Error fetching chart for ${symbol}:`, error);
            return [];
        }
    };

    // Add asset
    const handleAddAsset = async () => {
        const symbol = searchQuery.toUpperCase().trim();
        
        if (!symbol) {
            toast.warning('Please enter a symbol');
            return;
        }
        
        if (selectedAssets.some(a => a.symbol === symbol)) {
            toast.warning(`${symbol} is already added`);
            return;
        }
        
        if (selectedAssets.length >= 5) {
            toast.warning('Maximum 5 assets can be compared');
            return;
        }

        setLoading(true);
        
        try {
            const type = isCrypto(symbol) ? 'crypto' : 'stock';
            const data = type === 'crypto' 
                ? await fetchCryptoData(symbol)
                : await fetchStockData(symbol);
            
            const chart = await fetchChartData(symbol, type);
            
            setSelectedAssets(prev => [...prev, { symbol, type }]);
            setAssetData(prev => ({ ...prev, [symbol]: data }));
            setChartData(prev => ({ ...prev, [symbol]: chart }));
            setSearchQuery('');
            
            toast.success(`Added ${symbol} (${type})`);
        } catch (error) {
            toast.error(`Failed to fetch data for ${symbol}`);
        } finally {
            setLoading(false);
        }
    };

    // Remove asset
    const handleRemoveAsset = (symbol, e) => {
        e.stopPropagation();
        setSelectedAssets(prev => prev.filter(a => a.symbol !== symbol));
        setAssetData(prev => {
            const newData = { ...prev };
            delete newData[symbol];
            return newData;
        });
        setChartData(prev => {
            const newData = { ...prev };
            delete newData[symbol];
            return newData;
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleAddAsset();
    };

    // Get best/worst for a metric
    const getBestWorst = (metric, lowerIsBetter = false) => {
        if (selectedAssets.length < 2) return {};
        
        const values = selectedAssets.map(({ symbol }) => ({
            symbol,
            value: assetData[symbol]?.[metric]
        })).filter(v => v.value !== null && v.value !== undefined && v.value !== 0);

        if (values.length < 2) return {};

        const sorted = [...values].sort((a, b) => b.value - a.value);
        
        if (lowerIsBetter) {
            return { best: sorted[sorted.length - 1].symbol, worst: sorted[0].symbol };
        }
        return { best: sorted[0].symbol, worst: sorted[sorted.length - 1].symbol };
    };

    // Format numbers
    const formatNumber = (num) => {
        if (num === null || num === undefined) return null;
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toLocaleString()}`;
    };

    const formatPrice = (price) => {
        if (!price) return '-';
        if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (price >= 1) return `$${price.toFixed(2)}`;
        if (price >= 0.01) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(8)}`;
    };

    // Insights
    const insights = useMemo(() => {
        if (selectedAssets.length < 2) return null;

        const performances = selectedAssets.map(({ symbol }) => ({
            symbol,
            perf: assetData[symbol]?.changePercent || 0
        }));

        const bestPerformer = performances.reduce((best, curr) => 
            curr.perf > best.perf ? curr : best
        , performances[0]);

        const highestMarketCap = selectedAssets.reduce((best, { symbol }) => {
            const cap = assetData[symbol]?.marketCap || 0;
            const bestCap = assetData[best]?.marketCap || 0;
            return cap > bestCap ? symbol : best;
        }, selectedAssets[0].symbol);

        const highestVolume = selectedAssets.reduce((best, { symbol }) => {
            const vol = assetData[symbol]?.volume || 0;
            const bestVol = assetData[best]?.volume || 0;
            return vol > bestVol ? symbol : best;
        }, selectedAssets[0].symbol);

        return { bestPerformer, highestMarketCap, highestVolume };
    }, [selectedAssets, assetData]);

    // Build chart based on selected metric
    const buildChartData = useMemo(() => {
        if (selectedAssets.length === 0) return null;

        // For time-series metrics (price, volume), use historical data
        if (chartMetric === 'price' || chartMetric === 'volume') {
            // Find the asset with chart data to get labels
            const firstWithData = selectedAssets.find(({ symbol }) => 
                chartData[symbol]?.length > 0
            );
            
            if (!firstWithData) return null;

            const labels = chartData[firstWithData.symbol].map((point, i) => {
                if (point.date) {
                    return new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                if (point[0]) {
                    return new Date(point[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return `Day ${i + 1}`;
            });

            return {
                labels,
                datasets: selectedAssets.map(({ symbol }, index) => {
                    const data = chartData[symbol] || [];
                    return {
                        label: symbol,
                        data: data.map(point => {
                            if (chartMetric === 'volume') {
                                return point.volume || 0;
                            }
                            return point.price || point.close || point[1] || point;
                        }),
                        borderColor: CHART_COLORS[index],
                        backgroundColor: `${CHART_COLORS[index]}20`,
                        borderWidth: 2.5,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    };
                })
            };
        }

        // For snapshot metrics (marketCap, change24h, peRatio, etc.), use bar-style comparison
        const metricLabels = {
            marketCap: 'Market Cap',
            performance: 'Performance %',
            change24h: '24h Change %',
            peRatio: 'P/E Ratio',
            week52High: '52 Week High'
        };

        const getMetricValue = (symbol) => {
            const data = assetData[symbol];
            if (!data) return 0;
            
            switch (chartMetric) {
                case 'marketCap':
                    return data.marketCap || 0;
                case 'performance':
                case 'change24h':
                    return data.changePercent || 0;
                case 'peRatio':
                    return data.peRatio || 0;
                case 'week52High':
                    return data.week52High || data.ath || 0;
                default:
                    return 0;
            }
        };

        return {
            labels: selectedAssets.map(({ symbol }) => symbol),
            datasets: [{
                label: metricLabels[chartMetric] || chartMetric,
                data: selectedAssets.map(({ symbol }) => getMetricValue(symbol)),
                backgroundColor: selectedAssets.map((_, index) => `${CHART_COLORS[index]}80`),
                borderColor: selectedAssets.map((_, index) => CHART_COLORS[index]),
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 60
            }]
        };
    }, [selectedAssets, chartData, assetData, chartMetric, CHART_COLORS]);

    // Determine chart type based on metric
    const isBarChart = !['price', 'volume'].includes(chartMetric);

    // Format value based on metric type
    const formatChartValue = (value) => {
        if (chartMetric === 'marketCap') {
            if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
            if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
            if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
            return `$${value.toLocaleString()}`;
        }
        if (chartMetric === 'performance' || chartMetric === 'change24h') {
            return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
        }
        if (chartMetric === 'peRatio') {
            return value.toFixed(2);
        }
        if (chartMetric === 'week52High' || chartMetric === 'price') {
            return formatPrice(value);
        }
        if (chartMetric === 'volume') {
            if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
            if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
            if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
            return value.toLocaleString();
        }
        return value;
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: !isBarChart, // Hide legend for bar charts (labels are on x-axis)
                position: 'top',
                labels: {
                    color: theme?.text?.secondary || '#94a3b8',
                    font: { size: 12, weight: '600' },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: primaryColor,
                bodyColor: theme?.text?.primary || '#e0e6ed',
                borderColor: `${primaryColor}4D`,
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        return `${context.dataset.label}: ${formatChartValue(value)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { color: `${theme?.text?.tertiary || '#64748b'}1A` },
                ticks: { 
                    color: theme?.text?.tertiary || '#64748b', 
                    font: { size: 11, weight: isBarChart ? '600' : '400' }, 
                    maxTicksLimit: isBarChart ? undefined : 10 
                }
            },
            y: {
                grid: { color: `${theme?.text?.tertiary || '#64748b'}1A` },
                ticks: { 
                    color: theme?.text?.tertiary || '#64748b', 
                    font: { size: 11 },
                    callback: (value) => formatChartValue(value)
                },
                beginAtZero: chartMetric === 'change24h' || chartMetric === 'performance' ? false : true
            }
        },
        interaction: { mode: 'index', intersect: false }
    };

    // Determine which metrics to show based on asset types
    const hasStocks = selectedAssets.some(a => a.type === 'stock');
    const hasCrypto = selectedAssets.some(a => a.type === 'crypto');

    return (
        <PageContainer theme={theme}>
            <SEO
                title="Stock & Crypto Comparison | Nexus Signal AI"
                description="Compare stocks and cryptocurrencies side-by-side. Analyze price performance, market caps, volatility, and key metrics to make informed investment decisions."
                keywords="stock comparison, crypto comparison, asset comparison, stock analysis, cryptocurrency analysis, investment comparison, market analysis"
                url="https://nexussignal.ai/compare"
            />
            <ContentWrapper>
                {/* Header */}
                <Header>
                    <HeaderTop>
                        <TitleSection>
                            <Title theme={theme}>
                                <GitCompare size={32} />
                                Asset Comparison
                            </Title>
                            <Subtitle theme={theme}>Compare stocks and cryptocurrencies side-by-side</Subtitle>
                        </TitleSection>
                    </HeaderTop>
                </Header>

                {/* Asset Selector */}
                <SelectorCard theme={theme}>
                    <SelectorHeader>
                        <SelectorTitle theme={theme}>
                            <BarChart3 size={18} color={primaryColor} />
                            Select Assets
                        </SelectorTitle>
                        <AssetCount theme={theme}>{selectedAssets.length}/5 assets</AssetCount>
                    </SelectorHeader>

                    <SelectedAssets>
                        {selectedAssets.length > 0 ? selectedAssets.map(({ symbol, type }, index) => (
                            <AssetChip 
                                key={symbol} 
                                $type={type}
                                theme={theme}
                                onClick={(e) => handleAssetClick(symbol, type, e)}
                                title={`Click to view ${symbol} details`}
                            >
                                <ChipColor $color={CHART_COLORS[index]} />
                                <TypeIcon>
                                    {type === 'crypto' 
                                        ? <Bitcoin size={14} /> 
                                        : <BarChart3 size={14} />}
                                </TypeIcon>
                                {symbol}
                                <ExternalLink size={12} style={{ opacity: 0.6 }} />
                                <RemoveBtn 
                                    theme={theme}
                                    onClick={(e) => handleRemoveAsset(symbol, e)}
                                    title="Remove from comparison"
                                >
                                    <X size={14} />
                                </RemoveBtn>
                            </AssetChip>
                        )) : (
                            <EmptyChips theme={theme}>No assets selected. Add stocks or crypto to compare.</EmptyChips>
                        )}
                    </SelectedAssets>

                    <SearchRow>
                        <SearchInputWrapper>
                            <SearchIconStyled theme={theme}>
                                <Search size={18} />
                            </SearchIconStyled>
                            <SearchInput
                                theme={theme}
                                type="text"
                                placeholder="Enter symbol (AAPL, MSFT, BTC, ETH, SOL...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                            />
                        </SearchInputWrapper>
                        <AddButton 
                            theme={theme}
                            onClick={handleAddAsset}
                            disabled={!searchQuery || selectedAssets.length >= 5 || loading}
                            $loading={loading}
                        >
                            {loading ? <RefreshCw size={18} /> : <Plus size={18} />}
                            {loading ? 'Loading...' : 'Add'}
                        </AddButton>
                    </SearchRow>

                    <HelpText theme={theme}>
                        Stocks: AAPL, MSFT, GOOGL, TSLA, NVDA • Crypto: BTC, ETH, SOL, XRP, ADA • Click chips to view details
                    </HelpText>
                </SelectorCard>

                {selectedAssets.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon theme={theme}>
                            <GitCompare size={48} color={primaryColor} />
                        </EmptyIcon>
                        <EmptyTitle theme={theme}>Start Comparing</EmptyTitle>
                        <EmptyText theme={theme}>
                            Add 2 or more stocks or cryptocurrencies to see charts, metrics, and insights
                        </EmptyText>
                    </EmptyState>
                ) : (
                    <>
                        {/* Insights */}
                        {insights && selectedAssets.length >= 2 && (
                            <InsightsGrid>
                                <InsightCard 
                                    theme={theme}
                                    $delay="0s" 
                                    $color={`linear-gradient(90deg, ${successColor}, ${successColor}cc)`}
                                >
                                    <InsightHeader>
                                        <InsightIcon 
                                            theme={theme}
                                            $bg={`${successColor}26`} 
                                            $color={successColor}
                                        >
                                            <TrendingUp size={18} />
                                        </InsightIcon>
                                        <InsightLabel theme={theme}>Best Performer</InsightLabel>
                                    </InsightHeader>
                                    <InsightValue theme={theme} $color={successColor}>
                                        {insights.bestPerformer.symbol}
                                    </InsightValue>
                                    <InsightSubtext 
                                        theme={theme}
                                        $color={insights.bestPerformer.perf >= 0 ? successColor : errorColor}
                                    >
                                        {insights.bestPerformer.perf >= 0 ? '+' : ''}
                                        {insights.bestPerformer.perf?.toFixed(2)}% (24h)
                                    </InsightSubtext>
                                </InsightCard>

                                <InsightCard 
                                    theme={theme}
                                    $delay="0.1s" 
                                    $color={`linear-gradient(90deg, ${infoColor}, ${infoColor}cc)`}
                                >
                                    <InsightHeader>
                                        <InsightIcon 
                                            theme={theme}
                                            $bg={`${infoColor}26`} 
                                            $color={infoColor}
                                        >
                                            <Building size={18} />
                                        </InsightIcon>
                                        <InsightLabel theme={theme}>Largest Market Cap</InsightLabel>
                                    </InsightHeader>
                                    <InsightValue theme={theme}>{insights.highestMarketCap}</InsightValue>
                                    <InsightSubtext theme={theme}>
                                        {formatNumber(assetData[insights.highestMarketCap]?.marketCap)}
                                    </InsightSubtext>
                                </InsightCard>

                                <InsightCard 
                                    theme={theme}
                                    $delay="0.2s" 
                                    $color={`linear-gradient(90deg, ${warningColor}, ${warningColor}cc)`}
                                >
                                    <InsightHeader>
                                        <InsightIcon 
                                            theme={theme}
                                            $bg={`${warningColor}26`} 
                                            $color={warningColor}
                                        >
                                            <Activity size={18} />
                                        </InsightIcon>
                                        <InsightLabel theme={theme}>Highest Volume</InsightLabel>
                                    </InsightHeader>
                                    <InsightValue theme={theme}>{insights.highestVolume}</InsightValue>
                                    <InsightSubtext theme={theme}>
                                        {formatNumber(assetData[insights.highestVolume]?.volume)}
                                    </InsightSubtext>
                                </InsightCard>
                            </InsightsGrid>
                        )}

                        {/* Chart */}
                        <ChartCard theme={theme}>
                            <ChartHeader>
                                <SectionTitle theme={theme}>
                                    <Activity size={20} color={primaryColor} />
                                    {chartMetric === 'price' && 'Price Performance'}
                                    {chartMetric === 'volume' && 'Volume History'}
                                    {chartMetric === 'marketCap' && 'Market Cap Comparison'}
                                    {chartMetric === 'performance' && 'Performance Comparison'}
                                    {chartMetric === 'change24h' && '24h Change Comparison'}
                                    {chartMetric === 'peRatio' && 'P/E Ratio Comparison'}
                                    {chartMetric === 'week52High' && '52 Week High Comparison'}
                                </SectionTitle>
                                <ChartControls>
                                    <MetricToggle theme={theme}>
                                        <MetricBtn 
                                            theme={theme}
                                            $active={chartMetric === 'price'}
                                            onClick={() => setChartMetric('price')}
                                            title="Price over time"
                                        >
                                            <DollarSign size={14} />
                                            Price
                                        </MetricBtn>
                                        <MetricBtn 
                                            theme={theme}
                                            $active={chartMetric === 'volume'}
                                            onClick={() => setChartMetric('volume')}
                                            title="Trading volume over time"
                                        >
                                            <BarChart3 size={14} />
                                            Volume
                                        </MetricBtn>
                                        <MetricBtn 
                                            theme={theme}
                                            $active={chartMetric === 'marketCap'}
                                            onClick={() => setChartMetric('marketCap')}
                                            title="Market cap comparison"
                                        >
                                            <Building size={14} />
                                            Mkt Cap
                                        </MetricBtn>
                                        <MetricBtn 
                                            theme={theme}
                                            $active={chartMetric === 'change24h'}
                                            onClick={() => setChartMetric('change24h')}
                                            title="24 hour price change"
                                        >
                                            <Activity size={14} />
                                            24h %
                                        </MetricBtn>
                                        <MetricBtn 
                                            theme={theme}
                                            $active={chartMetric === 'peRatio'}
                                            onClick={() => setChartMetric('peRatio')}
                                            title="P/E Ratio (stocks only)"
                                            disabled={!hasStocks}
                                        >
                                            <Target size={14} />
                                            P/E
                                        </MetricBtn>
                                        <MetricBtn 
                                            theme={theme}
                                            $active={chartMetric === 'week52High'}
                                            onClick={() => setChartMetric('week52High')}
                                            title="52 Week High / All-Time High"
                                        >
                                            <TrendingUp size={14} />
                                            52W/ATH
                                        </MetricBtn>
                                    </MetricToggle>
                                    {(chartMetric === 'price' || chartMetric === 'volume') && (
                                        <TimeframeToggle theme={theme}>
                                            {['1W', '1M', '3M', '1Y'].map(tf => (
                                                <TimeframeBtn 
                                                    key={tf} 
                                                    theme={theme}
                                                    $active={timeframe === tf}
                                                    onClick={() => setTimeframe(tf)}
                                                >
                                                    {tf}
                                                </TimeframeBtn>
                                            ))}
                                        </TimeframeToggle>
                                    )}
                                </ChartControls>
                            </ChartHeader>
                            <ChartWrapper>
                                {buildChartData ? (
                                    isBarChart ? (
                                        <Bar data={buildChartData} options={chartOptions} />
                                    ) : (
                                        <Line data={buildChartData} options={chartOptions} />
                                    )
                                ) : (
                                    <ChartLoading theme={theme}>
                                        Loading chart data...
                                    </ChartLoading>
                                )}
                            </ChartWrapper>
                        </ChartCard>

                        {/* Comparison Table */}
                        <TableCard theme={theme}>
                            <TableHeader>
                                <SectionTitle theme={theme}>
                                    <BarChart3 size={20} color={primaryColor} />
                                    Detailed Comparison
                                </SectionTitle>
                            </TableHeader>
                            <Table>
                                <THead theme={theme}>
                                    <tr>
                                        <TH theme={theme}>Metric</TH>
                                        {selectedAssets.map(({ symbol, type }, index) => (
                                            <THClickable 
                                                key={symbol} 
                                                theme={theme}
                                                $align="center"
                                                onClick={() => handleHeaderClick(symbol, type)}
                                                title={`Click to view ${symbol} details`}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                    <ChipColor $color={CHART_COLORS[index]} />
                                                    {type === 'crypto' ? <Bitcoin size={12} /> : <BarChart3 size={12} />}
                                                    {symbol}
                                                    <ExternalLink size={10} style={{ opacity: 0.5 }} />
                                                </div>
                                            </THClickable>
                                        ))}
                                    </tr>
                                </THead>
                                <TBody>
                                    {/* Price */}
                                    <TR theme={theme}>
                                        <TD theme={theme}>
                                            <MetricCell theme={theme}>
                                                <DollarSign size={16} color={primaryColor} />
                                                Price
                                            </MetricCell>
                                        </TD>
                                        {selectedAssets.map(({ symbol }) => (
                                            <TD key={symbol} theme={theme} $align="center">
                                                {formatPrice(assetData[symbol]?.price)}
                                            </TD>
                                        ))}
                                    </TR>

                                    {/* Change */}
                                    <TR theme={theme}>
                                        <TD theme={theme}>
                                            <MetricCell theme={theme}>
                                                <Activity size={16} color={primaryColor} />
                                                24h Change
                                            </MetricCell>
                                        </TD>
                                        {selectedAssets.map(({ symbol }) => {
                                            const change = assetData[symbol]?.changePercent;
                                            return (
                                                <TD key={symbol} theme={theme} $align="center">
                                                    <ChangeValue theme={theme} $positive={change > 0}>
                                                        {change > 0 
                                                            ? <ArrowUpRight size={16} /> 
                                                            : <ArrowDownRight size={16} />}
                                                        {change > 0 ? '+' : ''}{change?.toFixed(2)}%
                                                    </ChangeValue>
                                                </TD>
                                            );
                                        })}
                                    </TR>

                                    {/* Market Cap */}
                                    <TR theme={theme}>
                                        <TD theme={theme}>
                                            <MetricCell theme={theme}>
                                                <Building size={16} color={primaryColor} />
                                                Market Cap
                                            </MetricCell>
                                        </TD>
                                        {selectedAssets.map(({ symbol }) => {
                                            const bestWorst = getBestWorst('marketCap');
                                            const value = assetData[symbol]?.marketCap;
                                            return (
                                                <TD key={symbol} theme={theme} $align="center">
                                                    <ValueCell 
                                                        theme={theme}
                                                        $best={symbol === bestWorst.best} 
                                                        $worst={symbol === bestWorst.worst}
                                                    >
                                                        {formatNumber(value) || <NAValue theme={theme}>N/A</NAValue>}
                                                        {symbol === bestWorst.best && selectedAssets.length > 1 && 
                                                            <Badge theme={theme} $type="best">Best</Badge>}
                                                    </ValueCell>
                                                </TD>
                                            );
                                        })}
                                    </TR>

                                    {/* Volume */}
                                    <TR theme={theme}>
                                        <TD theme={theme}>
                                            <MetricCell theme={theme}>
                                                <BarChart3 size={16} color={primaryColor} />
                                                Volume
                                            </MetricCell>
                                        </TD>
                                        {selectedAssets.map(({ symbol }) => {
                                            const bestWorst = getBestWorst('volume');
                                            const value = assetData[symbol]?.volume;
                                            return (
                                                <TD key={symbol} theme={theme} $align="center">
                                                    <ValueCell theme={theme} $best={symbol === bestWorst.best}>
                                                        {formatNumber(value) || <NAValue theme={theme}>N/A</NAValue>}
                                                    </ValueCell>
                                                </TD>
                                            );
                                        })}
                                    </TR>

                                    {/* P/E Ratio - Stocks only */}
                                    {hasStocks && (
                                        <TR theme={theme}>
                                            <TD theme={theme}>
                                                <MetricCell theme={theme}>
                                                    <Target size={16} color={primaryColor} />
                                                    P/E Ratio
                                                </MetricCell>
                                            </TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'crypto') {
                                                    return (
                                                        <TD key={symbol} theme={theme} $align="center">
                                                            <NAValue theme={theme}>N/A</NAValue>
                                                        </TD>
                                                    );
                                                }
                                                const bestWorst = getBestWorst('peRatio', true);
                                                const value = assetData[symbol]?.peRatio;
                                                return (
                                                    <TD key={symbol} theme={theme} $align="center">
                                                        <ValueCell theme={theme} $best={symbol === bestWorst.best}>
                                                            {value?.toFixed(2) || <NAValue theme={theme}>N/A</NAValue>}
                                                            {symbol === bestWorst.best && 
                                                                <Badge theme={theme} $type="best">Best</Badge>}
                                                        </ValueCell>
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* Dividend - Stocks only */}
                                    {hasStocks && (
                                        <TR theme={theme}>
                                            <TD theme={theme}>
                                                <MetricCell theme={theme}>
                                                    <Award size={16} color={primaryColor} />
                                                    Dividend Yield
                                                </MetricCell>
                                            </TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'crypto') {
                                                    return (
                                                        <TD key={symbol} theme={theme} $align="center">
                                                            <NAValue theme={theme}>N/A</NAValue>
                                                        </TD>
                                                    );
                                                }
                                                const bestWorst = getBestWorst('dividend');
                                                const value = assetData[symbol]?.dividend;
                                                return (
                                                    <TD key={symbol} theme={theme} $align="center">
                                                        <ValueCell theme={theme} $best={symbol === bestWorst.best}>
                                                            {value ? `${value.toFixed(2)}%` : <NAValue theme={theme}>N/A</NAValue>}
                                                        </ValueCell>
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* 52 Week High - Stocks only */}
                                    {hasStocks && (
                                        <TR theme={theme}>
                                            <TD theme={theme}>
                                                <MetricCell theme={theme}>
                                                    <TrendingUp size={16} color={primaryColor} />
                                                    52W High
                                                </MetricCell>
                                            </TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'crypto') {
                                                    return (
                                                        <TD key={symbol} theme={theme} $align="center">
                                                            <NAValue theme={theme}>N/A</NAValue>
                                                        </TD>
                                                    );
                                                }
                                                const value = assetData[symbol]?.week52High;
                                                return (
                                                    <TD key={symbol} theme={theme} $align="center">
                                                        {value ? formatPrice(value) : <NAValue theme={theme}>N/A</NAValue>}
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* ATH - Crypto only */}
                                    {hasCrypto && (
                                        <TR theme={theme}>
                                            <TD theme={theme}>
                                                <MetricCell theme={theme}>
                                                    <TrendingUp size={16} color={primaryColor} />
                                                    All-Time High
                                                </MetricCell>
                                            </TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'stock') {
                                                    return (
                                                        <TD key={symbol} theme={theme} $align="center">
                                                            <NAValue theme={theme}>N/A</NAValue>
                                                        </TD>
                                                    );
                                                }
                                                const value = assetData[symbol]?.ath;
                                                return (
                                                    <TD key={symbol} theme={theme} $align="center">
                                                        {value ? formatPrice(value) : <NAValue theme={theme}>N/A</NAValue>}
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* Circulating Supply - Crypto only */}
                                    {hasCrypto && (
                                        <TR theme={theme}>
                                            <TD theme={theme}>
                                                <MetricCell theme={theme}>
                                                    <Percent size={16} color={primaryColor} />
                                                    Circulating Supply
                                                </MetricCell>
                                            </TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'stock') {
                                                    return (
                                                        <TD key={symbol} theme={theme} $align="center">
                                                            <NAValue theme={theme}>N/A</NAValue>
                                                        </TD>
                                                    );
                                                }
                                                const value = assetData[symbol]?.circulatingSupply;
                                                return (
                                                    <TD key={symbol} theme={theme} $align="center">
                                                        {value ? value.toLocaleString() : <NAValue theme={theme}>N/A</NAValue>}
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}
                                </TBody>
                            </Table>
                        </TableCard>
                    </>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default ComparisonPage;
