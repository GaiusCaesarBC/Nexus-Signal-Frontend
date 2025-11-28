// client/src/pages/ComparisonPage.js - STOCKS & CRYPTO COMPARISON (REAL API DATA)

import React, { useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
    TrendingUp, TrendingDown, Plus, X, ArrowUpRight, ArrowDownRight,
    DollarSign, Activity, BarChart3, Award, AlertCircle, Search,
    Target, Shield, GitCompare, Percent, Building, Bitcoin, RefreshCw
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title as ChartJSTitle,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
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
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
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
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
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
    color: #94a3b8;
    font-size: 1rem;
    margin-top: 0.25rem;
`;

// ============ ASSET SELECTOR ============
const SelectorCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
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
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const AssetCount = styled.span`
    font-size: 0.8rem;
    color: #64748b;
    background: rgba(100, 116, 139, 0.2);
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
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))'
        : 'linear-gradient(135deg, rgba(0, 173, 237, 0.15), rgba(0, 173, 237, 0.08))'};
    border: 1px solid ${props => props.$type === 'crypto' 
        ? 'rgba(245, 158, 11, 0.3)' 
        : 'rgba(0, 173, 237, 0.3)'};
    border-radius: 10px;
    color: ${props => props.$type === 'crypto' ? '#f59e0b' : '#00adef'};
    font-weight: 700;
    font-size: 0.95rem;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
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
    background: rgba(239, 68, 68, 0.15);
    border: none;
    border-radius: 6px;
    padding: 0.2rem;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
    }
`;

const EmptyChips = styled.div`
    color: #64748b;
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
    color: #64748b;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 2.75rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 0.95rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.1);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
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
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.3);
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
    color: #64748b;
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
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
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
        background: ${props => props.$color || 'linear-gradient(90deg, #00adef, #0088cc)'};
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
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.15)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#00adef'};
`;

const InsightLabel = styled.div`
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
`;

const InsightValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const InsightSubtext = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$color || '#64748b'};
`;

// ============ CHART SECTION ============
const ChartCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
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

const SectionTitle = styled.h3`
    font-size: 1.1rem;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
`;

const TimeframeToggle = styled.div`
    display: flex;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 10px;
    padding: 0.25rem;
`;

const TimeframeBtn = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active 
        ? 'linear-gradient(135deg, rgba(0, 173, 237, 0.3), rgba(0, 173, 237, 0.15))'
        : 'transparent'};
    border: none;
    border-radius: 8px;
    color: ${props => props.$active ? '#00adef' : '#64748b'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: #00adef;
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
    color: #64748b;
`;

// ============ COMPARISON TABLE ============
const TableCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
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
    border-bottom: 2px solid rgba(0, 173, 237, 0.2);
`;

const TH = styled.th`
    padding: 0.875rem 1rem;
    text-align: ${props => props.$align || 'left'};
    color: #94a3b8;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TBody = styled.tbody``;

const TR = styled.tr`
    border-bottom: 1px solid rgba(100, 116, 139, 0.15);
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.03);
    }

    &:last-child {
        border-bottom: none;
    }
`;

const TD = styled.td`
    padding: 0.875rem 1rem;
    text-align: ${props => props.$align || 'left'};
    color: #e0e6ed;
    font-size: 0.95rem;
`;

const MetricCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
    font-weight: 600;
`;

const ValueCell = styled.div`
    font-weight: 600;
    color: ${props => {
        if (props.$best) return '#10b981';
        if (props.$worst) return '#ef4444';
        return '#e0e6ed';
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
    background: ${props => props.$type === 'best' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    color: ${props => props.$type === 'best' ? '#10b981' : '#ef4444'};
`;

const ChangeValue = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
`;

const NAValue = styled.span`
    color: #64748b;
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
    color: #00adef;
`;

// ============ CHART COLORS ============
const CHART_COLORS = ['#00adef', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

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

    const [selectedAssets, setSelectedAssets] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [assetData, setAssetData] = useState({});
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(false);
    const [timeframe, setTimeframe] = useState('1M');

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
    const handleRemoveAsset = (symbol) => {
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

    // Build chart
    const buildChartData = useMemo(() => {
        if (selectedAssets.length === 0) return null;

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
                    data: data.map(point => point.price || point.close || point[1] || point),
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
    }, [selectedAssets, chartData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#94a3b8',
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
                titleColor: '#00adef',
                bodyColor: '#e0e6ed',
                borderColor: 'rgba(0, 173, 237, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${formatPrice(context.raw)}`
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(100, 116, 139, 0.1)' },
                ticks: { color: '#64748b', font: { size: 11 }, maxTicksLimit: 10 }
            },
            y: {
                grid: { color: 'rgba(100, 116, 139, 0.1)' },
                ticks: { 
                    color: '#64748b', 
                    font: { size: 11 },
                    callback: (value) => formatPrice(value)
                }
            }
        },
        interaction: { mode: 'index', intersect: false }
    };

    // Determine which metrics to show based on asset types
    const hasStocks = selectedAssets.some(a => a.type === 'stock');
    const hasCrypto = selectedAssets.some(a => a.type === 'crypto');

    return (
        <PageContainer>
            <ContentWrapper>
                {/* Header */}
                <Header>
                    <HeaderTop>
                        <TitleSection>
                            <Title>
                                <GitCompare size={32} />
                                Asset Comparison
                            </Title>
                            <Subtitle>Compare stocks and cryptocurrencies side-by-side</Subtitle>
                        </TitleSection>
                    </HeaderTop>
                </Header>

                {/* Asset Selector */}
                <SelectorCard>
                    <SelectorHeader>
                        <SelectorTitle>
                            <BarChart3 size={18} />
                            Select Assets
                        </SelectorTitle>
                        <AssetCount>{selectedAssets.length}/5 assets</AssetCount>
                    </SelectorHeader>

                    <SelectedAssets>
                        {selectedAssets.length > 0 ? selectedAssets.map(({ symbol, type }, index) => (
                            <AssetChip key={symbol} $type={type}>
                                <ChipColor $color={CHART_COLORS[index]} />
                                <TypeIcon>
                                    {type === 'crypto' ? <Bitcoin size={14} /> : <BarChart3 size={14} />}
                                </TypeIcon>
                                {symbol}
                                <RemoveBtn onClick={() => handleRemoveAsset(symbol)}>
                                    <X size={14} />
                                </RemoveBtn>
                            </AssetChip>
                        )) : (
                            <EmptyChips>No assets selected. Add stocks or crypto to compare.</EmptyChips>
                        )}
                    </SelectedAssets>

                    <SearchRow>
                        <SearchInputWrapper>
                            <SearchIconStyled>
                                <Search size={18} />
                            </SearchIconStyled>
                            <SearchInput
                                type="text"
                                placeholder="Enter symbol (AAPL, MSFT, BTC, ETH, SOL...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                            />
                        </SearchInputWrapper>
                        <AddButton 
                            onClick={handleAddAsset}
                            disabled={!searchQuery || selectedAssets.length >= 5 || loading}
                            $loading={loading}
                        >
                            {loading ? <RefreshCw size={18} /> : <Plus size={18} />}
                            {loading ? 'Loading...' : 'Add'}
                        </AddButton>
                    </SearchRow>

                    <HelpText>
                        Stocks: AAPL, MSFT, GOOGL, TSLA, NVDA • Crypto: BTC, ETH, SOL, XRP, ADA
                    </HelpText>
                </SelectorCard>

                {selectedAssets.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <GitCompare size={48} color="#00adef" />
                        </EmptyIcon>
                        <EmptyTitle>Start Comparing</EmptyTitle>
                        <EmptyText>
                            Add 2 or more stocks or cryptocurrencies to see charts, metrics, and insights
                        </EmptyText>
                    </EmptyState>
                ) : (
                    <>
                        {/* Insights */}
                        {insights && selectedAssets.length >= 2 && (
                            <InsightsGrid>
                                <InsightCard $delay="0s" $color="linear-gradient(90deg, #10b981, #059669)">
                                    <InsightHeader>
                                        <InsightIcon $bg="rgba(16, 185, 129, 0.15)" $color="#10b981">
                                            <TrendingUp size={18} />
                                        </InsightIcon>
                                        <InsightLabel>Best Performer</InsightLabel>
                                    </InsightHeader>
                                    <InsightValue $color="#10b981">{insights.bestPerformer.symbol}</InsightValue>
                                    <InsightSubtext $color={insights.bestPerformer.perf >= 0 ? '#10b981' : '#ef4444'}>
                                        {insights.bestPerformer.perf >= 0 ? '+' : ''}
                                        {insights.bestPerformer.perf?.toFixed(2)}% (24h)
                                    </InsightSubtext>
                                </InsightCard>

                                <InsightCard $delay="0.1s" $color="linear-gradient(90deg, #3b82f6, #2563eb)">
                                    <InsightHeader>
                                        <InsightIcon $bg="rgba(59, 130, 246, 0.15)" $color="#3b82f6">
                                            <Building size={18} />
                                        </InsightIcon>
                                        <InsightLabel>Largest Market Cap</InsightLabel>
                                    </InsightHeader>
                                    <InsightValue>{insights.highestMarketCap}</InsightValue>
                                    <InsightSubtext>
                                        {formatNumber(assetData[insights.highestMarketCap]?.marketCap)}
                                    </InsightSubtext>
                                </InsightCard>

                                <InsightCard $delay="0.2s" $color="linear-gradient(90deg, #f59e0b, #d97706)">
                                    <InsightHeader>
                                        <InsightIcon $bg="rgba(245, 158, 11, 0.15)" $color="#f59e0b">
                                            <Activity size={18} />
                                        </InsightIcon>
                                        <InsightLabel>Highest Volume</InsightLabel>
                                    </InsightHeader>
                                    <InsightValue>{insights.highestVolume}</InsightValue>
                                    <InsightSubtext>
                                        {formatNumber(assetData[insights.highestVolume]?.volume)}
                                    </InsightSubtext>
                                </InsightCard>
                            </InsightsGrid>
                        )}

                        {/* Chart */}
                        <ChartCard>
                            <ChartHeader>
                                <SectionTitle>
                                    <Activity size={20} />
                                    Price Performance
                                </SectionTitle>
                                <TimeframeToggle>
                                    {['1W', '1M', '3M', '1Y'].map(tf => (
                                        <TimeframeBtn 
                                            key={tf} 
                                            $active={timeframe === tf}
                                            onClick={() => setTimeframe(tf)}
                                        >
                                            {tf}
                                        </TimeframeBtn>
                                    ))}
                                </TimeframeToggle>
                            </ChartHeader>
                            <ChartWrapper>
                                {buildChartData ? (
                                    <Line data={buildChartData} options={chartOptions} />
                                ) : (
                                    <ChartLoading>
                                        Loading chart data...
                                    </ChartLoading>
                                )}
                            </ChartWrapper>
                        </ChartCard>

                        {/* Comparison Table */}
                        <TableCard>
                            <TableHeader>
                                <SectionTitle>
                                    <BarChart3 size={20} />
                                    Detailed Comparison
                                </SectionTitle>
                            </TableHeader>
                            <Table>
                                <THead>
                                    <tr>
                                        <TH>Metric</TH>
                                        {selectedAssets.map(({ symbol, type }, index) => (
                                            <TH key={symbol} $align="center">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                    <ChipColor $color={CHART_COLORS[index]} />
                                                    {type === 'crypto' ? <Bitcoin size={12} /> : <BarChart3 size={12} />}
                                                    {symbol}
                                                </div>
                                            </TH>
                                        ))}
                                    </tr>
                                </THead>
                                <TBody>
                                    {/* Price */}
                                    <TR>
                                        <TD><MetricCell><DollarSign size={16} />Price</MetricCell></TD>
                                        {selectedAssets.map(({ symbol }) => (
                                            <TD key={symbol} $align="center">
                                                {formatPrice(assetData[symbol]?.price)}
                                            </TD>
                                        ))}
                                    </TR>

                                    {/* Change */}
                                    <TR>
                                        <TD><MetricCell><Activity size={16} />24h Change</MetricCell></TD>
                                        {selectedAssets.map(({ symbol }) => {
                                            const change = assetData[symbol]?.changePercent;
                                            return (
                                                <TD key={symbol} $align="center">
                                                    <ChangeValue $positive={change > 0}>
                                                        {change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                        {change > 0 ? '+' : ''}{change?.toFixed(2)}%
                                                    </ChangeValue>
                                                </TD>
                                            );
                                        })}
                                    </TR>

                                    {/* Market Cap */}
                                    <TR>
                                        <TD><MetricCell><Building size={16} />Market Cap</MetricCell></TD>
                                        {selectedAssets.map(({ symbol }) => {
                                            const bestWorst = getBestWorst('marketCap');
                                            const value = assetData[symbol]?.marketCap;
                                            return (
                                                <TD key={symbol} $align="center">
                                                    <ValueCell $best={symbol === bestWorst.best} $worst={symbol === bestWorst.worst}>
                                                        {formatNumber(value) || <NAValue>N/A</NAValue>}
                                                        {symbol === bestWorst.best && selectedAssets.length > 1 && <Badge $type="best">Best</Badge>}
                                                    </ValueCell>
                                                </TD>
                                            );
                                        })}
                                    </TR>

                                    {/* Volume */}
                                    <TR>
                                        <TD><MetricCell><BarChart3 size={16} />Volume</MetricCell></TD>
                                        {selectedAssets.map(({ symbol }) => {
                                            const bestWorst = getBestWorst('volume');
                                            const value = assetData[symbol]?.volume;
                                            return (
                                                <TD key={symbol} $align="center">
                                                    <ValueCell $best={symbol === bestWorst.best}>
                                                        {formatNumber(value) || <NAValue>N/A</NAValue>}
                                                    </ValueCell>
                                                </TD>
                                            );
                                        })}
                                    </TR>

                                    {/* P/E Ratio - Stocks only */}
                                    {hasStocks && (
                                        <TR>
                                            <TD><MetricCell><Target size={16} />P/E Ratio</MetricCell></TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'crypto') {
                                                    return <TD key={symbol} $align="center"><NAValue>N/A</NAValue></TD>;
                                                }
                                                const bestWorst = getBestWorst('peRatio', true);
                                                const value = assetData[symbol]?.peRatio;
                                                return (
                                                    <TD key={symbol} $align="center">
                                                        <ValueCell $best={symbol === bestWorst.best}>
                                                            {value?.toFixed(2) || <NAValue>N/A</NAValue>}
                                                            {symbol === bestWorst.best && <Badge $type="best">Best</Badge>}
                                                        </ValueCell>
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* Dividend - Stocks only */}
                                    {hasStocks && (
                                        <TR>
                                            <TD><MetricCell><Award size={16} />Dividend Yield</MetricCell></TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'crypto') {
                                                    return <TD key={symbol} $align="center"><NAValue>N/A</NAValue></TD>;
                                                }
                                                const bestWorst = getBestWorst('dividend');
                                                const value = assetData[symbol]?.dividend;
                                                return (
                                                    <TD key={symbol} $align="center">
                                                        <ValueCell $best={symbol === bestWorst.best}>
                                                            {value ? `${value.toFixed(2)}%` : <NAValue>N/A</NAValue>}
                                                        </ValueCell>
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* 52 Week High - Stocks only */}
                                    {hasStocks && (
                                        <TR>
                                            <TD><MetricCell><TrendingUp size={16} />52W High</MetricCell></TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'crypto') {
                                                    return <TD key={symbol} $align="center"><NAValue>N/A</NAValue></TD>;
                                                }
                                                const value = assetData[symbol]?.week52High;
                                                return (
                                                    <TD key={symbol} $align="center">
                                                        {value ? formatPrice(value) : <NAValue>N/A</NAValue>}
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* ATH - Crypto only */}
                                    {hasCrypto && (
                                        <TR>
                                            <TD><MetricCell><TrendingUp size={16} />All-Time High</MetricCell></TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'stock') {
                                                    return <TD key={symbol} $align="center"><NAValue>N/A</NAValue></TD>;
                                                }
                                                const value = assetData[symbol]?.ath;
                                                return (
                                                    <TD key={symbol} $align="center">
                                                        {value ? formatPrice(value) : <NAValue>N/A</NAValue>}
                                                    </TD>
                                                );
                                            })}
                                        </TR>
                                    )}

                                    {/* Circulating Supply - Crypto only */}
                                    {hasCrypto && (
                                        <TR>
                                            <TD><MetricCell><Percent size={16} />Circulating Supply</MetricCell></TD>
                                            {selectedAssets.map(({ symbol, type }) => {
                                                if (type === 'stock') {
                                                    return <TD key={symbol} $align="center"><NAValue>N/A</NAValue></TD>;
                                                }
                                                const value = assetData[symbol]?.circulatingSupply;
                                                return (
                                                    <TD key={symbol} $align="center">
                                                        {value ? value.toLocaleString() : <NAValue>N/A</NAValue>}
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