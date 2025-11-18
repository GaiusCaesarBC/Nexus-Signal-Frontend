// client/src/pages/HeatmapPage.js - THE MOST LEGENDARY MARKET HEATMAP EVER

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, BarChart3, Flame, Zap, RefreshCw,
    Eye, Star, Target, Activity, DollarSign, Percent, ArrowUpDown,
    Filter, ChevronDown, ChevronUp, Maximize2, Minimize2, Grid3x3,
    List, MapPin, Globe, Bitcoin, Sparkles, AlertCircle, Info
} from 'lucide-react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
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

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
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

// ============ CONTROLS ============
const ControlsContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const ControlGroup = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const ModeButton = styled.button`
    padding: 1rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 700;
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

const ViewToggle = styled.div`
    display: flex;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    overflow: hidden;
`;

const ViewButton = styled.button`
    padding: 0.75rem 1rem;
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.3)' : 'transparent'};
    border: none;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        color: #00adef;
    }
`;

// ============ STATS BANNER ============
const StatsBanner = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
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
        background: ${props => {
            if (props.$type === 'positive') return 'linear-gradient(90deg, #10b981, #059669)';
            if (props.$type === 'negative') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            return 'linear-gradient(90deg, #00adef, #0088cc)';
        }};
    }

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
        border-color: rgba(0, 173, 237, 0.5);
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    background: ${props => {
        if (props.$type === 'positive') return 'rgba(16, 185, 129, 0.2)';
        if (props.$type === 'negative') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.$type === 'positive') return '#10b981';
        if (props.$type === 'negative') return '#ef4444';
        return '#00adef';
    }};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatLabel = styled.div`
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => {
        if (props.$type === 'positive') return '#10b981';
        if (props.$type === 'negative') return '#ef4444';
        return '#00adef';
    }};
`;

// ============ HEATMAP CONTAINER ============
const HeatmapContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
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
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
        pointer-events: none;
    }
`;

const HeatmapHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
        align-items: start;
    }
`;

const HeatmapTitle = styled.h2`
    color: #00adef;
    font-size: 1.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const Legend = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #94a3b8;
`;

const LegendColor = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: ${props => props.$color};
    border: 1px solid rgba(255, 255, 255, 0.2);
`;

// ============ GRID VIEW ============
const GridView = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    position: relative;
    z-index: 1;
`;

const GridCell = styled.div`
    background: ${props => {
        const change = props.$change;
        if (change > 5) return 'linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.4))';
        if (change > 2) return 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))';
        if (change > 0) return 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))';
        if (change > -2) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))';
        if (change > -5) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))';
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.4))';
    }};
    border: 1px solid ${props => props.$change > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 100%;
        background: ${props => props.$change > 0 ? '#10b981' : '#ef4444'};
    }

    &:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 15px 40px ${props => props.$change > 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'};
        border-color: ${props => props.$change > 0 ? '#10b981' : '#ef4444'};
    }
`;

const CellSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    color: #e0e6ed;
    margin-bottom: 0.5rem;
`;

const CellName = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const CellChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

const CellPrice = styled.div`
    font-size: 0.9rem;
    color: #64748b;
    margin-top: 0.5rem;
`;

// ============ TREEMAP VIEW ============
const TreemapView = styled.div`
    width: 100%;
    height: 700px;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        height: 500px;
    }
`;

const CustomTreemapContent = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0.75rem;
    background: ${props => {
        const change = props.$change;
        if (change > 5) return 'rgba(16, 185, 129, 0.9)';
        if (change > 2) return 'rgba(16, 185, 129, 0.7)';
        if (change > 0) return 'rgba(16, 185, 129, 0.5)';
        if (change > -2) return 'rgba(239, 68, 68, 0.5)';
        if (change > -5) return 'rgba(239, 68, 68, 0.7)';
        return 'rgba(239, 68, 68, 0.9)';
    }};
    border: 2px solid ${props => props.$change > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'};
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;

    &:hover {
        transform: scale(1.02);
        border-width: 3px;
        border-color: ${props => props.$change > 0 ? '#10b981' : '#ef4444'};
        box-shadow: 0 10px 30px ${props => props.$change > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
    }
`;

const TreemapSymbol = styled.div`
    font-size: ${props => Math.max(props.$size / 15, 0.8)}rem;
    font-weight: 900;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    margin-bottom: 0.25rem;
`;

const TreemapChange = styled.div`
    font-size: ${props => Math.max(props.$size / 20, 0.7)}rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

// ============ LOADING & EMPTY STATES ============
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

// ============ COMPONENT ============
const HeatmapPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('stocks'); // 'stocks' or 'crypto'
    const [view, setView] = useState('treemap'); // 'treemap' or 'grid'
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({
        gainers: 0,
        losers: 0,
        avgChange: 0,
        topGainer: null,
        topLoser: null
    });

    useEffect(() => {
        fetchMarketData();
    }, [mode]);

    const fetchMarketData = async () => {
        setLoading(true);
        
        try {
            // Mock data for now - replace with real API
            const mockData = mode === 'stocks' ? generateMockStocks() : generateMockCrypto();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setData(mockData);
            calculateStats(mockData);
            toast.success(`Loaded ${mockData.length} ${mode === 'stocks' ? 'stocks' : 'cryptocurrencies'}`, 'Market Updated');
        } catch (error) {
            console.error('Error fetching market data:', error);
            toast.error('Failed to load market data', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const generateMockStocks = () => {
        const stocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 182.50, change: 2.35, sector: 'Technology', size: 2850 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90, change: 5.20, sector: 'Technology', size: 2810 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.25, change: -1.50, sector: 'Technology', size: 1750 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.80, change: 3.75, sector: 'Consumer', size: 1510 },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 12.30, sector: 'Automotive', size: 785 },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 482.75, change: 8.90, sector: 'Technology', size: 1190 },
            { symbol: 'META', name: 'Meta Platforms', price: 338.15, change: -2.40, sector: 'Technology', size: 855 },
            { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 358.90, change: 0.85, sector: 'Finance', size: 785 },
            { symbol: 'JPM', name: 'JPMorgan Chase', price: 158.90, change: 1.25, sector: 'Finance', size: 458 },
            { symbol: 'V', name: 'Visa Inc.', price: 252.30, change: 3.10, sector: 'Finance', size: 512 },
            { symbol: 'WMT', name: 'Walmart Inc.', price: 165.75, change: 0.85, sector: 'Retail', size: 440 },
            { symbol: 'JNJ', name: 'Johnson & Johnson', price: 158.40, change: -0.60, sector: 'Healthcare', size: 385 },
            { symbol: 'PG', name: 'Procter & Gamble', price: 152.30, change: 0.45, sector: 'Consumer', size: 362 },
            { symbol: 'XOM', name: 'Exxon Mobil', price: 102.85, change: -3.20, sector: 'Energy', size: 425 },
            { symbol: 'UNH', name: 'UnitedHealth', price: 528.75, change: 2.15, sector: 'Healthcare', size: 495 },
            { symbol: 'MA', name: 'Mastercard', price: 418.60, change: 4.30, sector: 'Finance', size: 395 },
            { symbol: 'HD', name: 'Home Depot', price: 345.20, change: 1.80, sector: 'Retail', size: 355 },
            { symbol: 'CVX', name: 'Chevron Corp.', price: 152.40, change: -2.85, sector: 'Energy', size: 285 },
            { symbol: 'PFE', name: 'Pfizer Inc.', price: 28.90, change: -1.20, sector: 'Healthcare', size: 165 },
            { symbol: 'KO', name: 'Coca-Cola', price: 58.75, change: 0.65, sector: 'Consumer', size: 255 },
            { symbol: 'PEP', name: 'PepsiCo', price: 172.30, change: 1.10, sector: 'Consumer', size: 238 },
            { symbol: 'COST', name: 'Costco', price: 685.40, change: 3.50, sector: 'Retail', size: 304 },
            { symbol: 'ABBV', name: 'AbbVie Inc.', price: 168.90, change: -0.85, sector: 'Healthcare', size: 298 },
            { symbol: 'TMO', name: 'Thermo Fisher', price: 548.20, change: 2.75, sector: 'Healthcare', size: 215 },
            { symbol: 'MRK', name: 'Merck & Co.', price: 128.50, change: 1.45, sector: 'Healthcare', size: 325 },
            { symbol: 'AVGO', name: 'Broadcom Inc.', price: 895.30, change: 7.20, sector: 'Technology', size: 365 },
            { symbol: 'ORCL', name: 'Oracle Corp.', price: 118.75, change: 2.60, sector: 'Technology', size: 325 },
            { symbol: 'CSCO', name: 'Cisco Systems', price: 52.40, change: 0.90, sector: 'Technology', size: 215 },
            { symbol: 'ACN', name: 'Accenture', price: 352.80, change: 1.85, sector: 'Technology', size: 225 },
            { symbol: 'ADBE', name: 'Adobe Inc.', price: 495.60, change: -1.75, sector: 'Technology', size: 228 },
            { symbol: 'NKE', name: 'Nike Inc.', price: 108.90, change: -0.95, sector: 'Consumer', size: 168 },
            { symbol: 'DIS', name: 'Walt Disney', price: 98.45, change: 2.30, sector: 'Entertainment', size: 180 },
            { symbol: 'NFLX', name: 'Netflix Inc.', price: 458.70, change: 6.80, sector: 'Entertainment', size: 198 },
            { symbol: 'INTC', name: 'Intel Corp.', price: 48.25, change: -2.15, sector: 'Technology', size: 198 },
            { symbol: 'AMD', name: 'AMD Inc.', price: 135.80, change: 5.40, sector: 'Technology', size: 220 },
        ];
        
        return stocks;
    };

    const generateMockCrypto = () => {
        const crypto = [
            { symbol: 'BTC', name: 'Bitcoin', price: 42580.50, change: 3.03, sector: 'Crypto', size: 832 },
            { symbol: 'ETH', name: 'Ethereum', price: 2245.75, change: 3.80, sector: 'Crypto', size: 270 },
            { symbol: 'BNB', name: 'Binance Coin', price: 312.40, change: -1.82, sector: 'Crypto', size: 48 },
            { symbol: 'SOL', name: 'Solana', price: 98.65, change: 14.45, sector: 'Crypto', size: 42 },
            { symbol: 'XRP', name: 'Ripple', price: 0.62, change: 8.77, sector: 'Crypto', size: 33 },
            { symbol: 'ADA', name: 'Cardano', price: 0.48, change: 6.67, sector: 'Crypto', size: 17 },
            { symbol: 'DOGE', name: 'Dogecoin', price: 0.085, change: -2.30, sector: 'Crypto', size: 12 },
            { symbol: 'AVAX', name: 'Avalanche', price: 36.80, change: 6.20, sector: 'Crypto', size: 13.5 },
            { symbol: 'MATIC', name: 'Polygon', price: 0.82, change: 7.89, sector: 'Crypto', size: 7.6 },
            { symbol: 'DOT', name: 'Polkadot', price: 6.45, change: -2.72, sector: 'Crypto', size: 8.2 },
            { symbol: 'LINK', name: 'Chainlink', price: 14.85, change: 4.55, sector: 'Crypto', size: 8.3 },
            { symbol: 'UNI', name: 'Uniswap', price: 6.25, change: 9.20, sector: 'Crypto', size: 4.7 },
            { symbol: 'ATOM', name: 'Cosmos', price: 9.85, change: 5.30, sector: 'Crypto', size: 3.8 },
            { symbol: 'LTC', name: 'Litecoin', price: 72.40, change: 2.15, sector: 'Crypto', size: 5.4 },
            { symbol: 'BCH', name: 'Bitcoin Cash', price: 245.30, change: -1.85, sector: 'Crypto', size: 4.8 },
            { symbol: 'NEAR', name: 'NEAR Protocol', price: 3.45, change: 11.80, sector: 'Crypto', size: 3.2 },
            { symbol: 'ALGO', name: 'Algorand', price: 0.18, change: 8.50, sector: 'Crypto', size: 1.3 },
            { symbol: 'FIL', name: 'Filecoin', price: 5.25, change: 3.90, sector: 'Crypto', size: 2.6 },
            { symbol: 'APT', name: 'Aptos', price: 8.90, change: 12.40, sector: 'Crypto', size: 2.1 },
            { symbol: 'ARB', name: 'Arbitrum', price: 1.15, change: 6.75, sector: 'Crypto', size: 1.8 },
        ];
        
        return crypto;
    };

    const calculateStats = (marketData) => {
        const gainers = marketData.filter(item => item.change > 0).length;
        const losers = marketData.filter(item => item.change < 0).length;
        const avgChange = marketData.reduce((sum, item) => sum + item.change, 0) / marketData.length;
        
        const topGainer = marketData.reduce((max, item) => item.change > max.change ? item : max, marketData[0]);
        const topLoser = marketData.reduce((min, item) => item.change < min.change ? item : min, marketData[0]);
        
        setStats({
            gainers,
            losers,
            avgChange: avgChange.toFixed(2),
            topGainer,
            topLoser
        });
    };

    const CustomTreemapContent = (props) => {
    const { x, y, width, height, name } = props;
    
    // Find the data item that matches this cell
    const dataItem = data.find(item => item.symbol === name || item.name === name);
    
    if (!dataItem || width < 50 || height < 30) return null;
    
    const change = dataItem.change || 0;
    const symbol = dataItem.symbol || name;
    
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: change > 5 ? 'rgba(16, 185, 129, 0.9)' :
                          change > 2 ? 'rgba(16, 185, 129, 0.7)' :
                          change > 0 ? 'rgba(16, 185, 129, 0.5)' :
                          change > -2 ? 'rgba(239, 68, 68, 0.5)' :
                          change > -5 ? 'rgba(239, 68, 68, 0.7)' :
                          'rgba(239, 68, 68, 0.9)',
                    stroke: change > 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                    strokeWidth: 2,
                    cursor: 'pointer'
                }}
            />
            <text
                x={x + width / 2}
                y={y + height / 2 - 10}
                textAnchor="middle"
                fill="white"
                fontSize={Math.max(width / 8, 12)}
                fontWeight="900"
                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
            >
                {symbol}
            </text>
            <text
                x={x + width / 2}
                y={y + height / 2 + 10}
                textAnchor="middle"
                fill="white"
                fontSize={Math.max(width / 12, 10)}
                fontWeight="700"
                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
            >
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </text>
        </g>
    );
};

    return (
        <PageContainer>
            <Header>
                <Title>
                    <TitleIcon>
                        <MapPin size={56} color="#00adef" />
                    </TitleIcon>
                    Market Heatmap
                </Title>
                <Subtitle>Visual representation of market performance in real-time</Subtitle>
                <PoweredBy>
                    <Activity size={18} />
                    Live Market Data
                </PoweredBy>
            </Header>

            {/* Controls */}
            <ControlsContainer>
                <ControlGroup>
                    <ModeButton 
                        $active={mode === 'stocks'}
                        onClick={() => setMode('stocks')}
                    >
                        <BarChart3 size={20} />
                        Stocks
                    </ModeButton>
                    <ModeButton 
                        $active={mode === 'crypto'}
                        onClick={() => setMode('crypto')}
                    >
                        <Bitcoin size={20} />
                        Crypto
                    </ModeButton>
                </ControlGroup>

                <ControlGroup>
                    <ViewToggle>
                        <ViewButton 
                            $active={view === 'treemap'}
                            onClick={() => setView('treemap')}
                        >
                            <Grid3x3 size={18} />
                            Treemap
                        </ViewButton>
                        <ViewButton 
                            $active={view === 'grid'}
                            onClick={() => setView('grid')}
                        >
                            <List size={18} />
                            Grid
                        </ViewButton>
                    </ViewToggle>

                    <RefreshButton 
                        onClick={fetchMarketData} 
                        disabled={loading}
                        $loading={loading}
                    >
                        <SpinningIcon size={20} $spinning={loading} />
                        {loading ? 'Updating...' : 'Refresh'}
                    </RefreshButton>
                </ControlGroup>
            </ControlsContainer>

            {/* Stats Banner */}
            {!loading && data.length > 0 && (
                <StatsBanner>
                    <StatCard $type="positive">
                        <StatIcon $type="positive">
                            <TrendingUp size={24} />
                        </StatIcon>
                        <StatLabel>Gainers</StatLabel>
                        <StatValue $type="positive">{stats.gainers}</StatValue>
                    </StatCard>

                    <StatCard $type="negative">
                        <StatIcon $type="negative">
                            <TrendingDown size={24} />
                        </StatIcon>
                        <StatLabel>Losers</StatLabel>
                        <StatValue $type="negative">{stats.losers}</StatValue>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <Activity size={24} />
                        </StatIcon>
                        <StatLabel>Avg Change</StatLabel>
                        <StatValue style={{ color: stats.avgChange >= 0 ? '#10b981' : '#ef4444' }}>
                            {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange}%
                        </StatValue>
                    </StatCard>

                    <StatCard $type="positive">
                        <StatIcon $type="positive">
                            <Flame size={24} />
                        </StatIcon>
                        <StatLabel>Top Gainer</StatLabel>
                        <StatValue $type="positive">
                            {stats.topGainer?.symbol}
                        </StatValue>
                        <div style={{ fontSize: '0.9rem', color: '#10b981', marginTop: '0.25rem' }}>
                            +{stats.topGainer?.change.toFixed(2)}%
                        </div>
                    </StatCard>

                    <StatCard $type="negative">
                        <StatIcon $type="negative">
                            <AlertCircle size={24} />
                        </StatIcon>
                        <StatLabel>Top Loser</StatLabel>
                        <StatValue $type="negative">
                            {stats.topLoser?.symbol}
                        </StatValue>
                        <div style={{ fontSize: '0.9rem', color: '#ef4444', marginTop: '0.25rem' }}>
                            {stats.topLoser?.change.toFixed(2)}%
                        </div>
                    </StatCard>
                </StatsBanner>
            )}

            {/* Heatmap */}
            <HeatmapContainer>
                <HeatmapHeader>
                    <HeatmapTitle>
                        <MapPin size={28} />
                        {view === 'treemap' ? 'Treemap View' : 'Grid View'}
                    </HeatmapTitle>
                    <Legend>
                        <LegendItem>
                            <LegendColor $color="rgba(16, 185, 129, 0.9)" />
                            Strong Gain
                        </LegendItem>
                        <LegendItem>
                            <LegendColor $color="rgba(16, 185, 129, 0.5)" />
                            Moderate Gain
                        </LegendItem>
                        <LegendItem>
                            <LegendColor $color="rgba(239, 68, 68, 0.5)" />
                            Moderate Loss
                        </LegendItem>
                        <LegendItem>
                            <LegendColor $color="rgba(239, 68, 68, 0.9)" />
                            Strong Loss
                        </LegendItem>
                    </Legend>
                </HeatmapHeader>

                {loading ? (
                    <LoadingContainer>
                        <LoadingSpinner size={64} />
                        <LoadingText>Loading market heatmap...</LoadingText>
                    </LoadingContainer>
                ) : data.length > 0 ? (
                    view === 'treemap' ? (
                        <TreemapView>
                            <ResponsiveContainer width="100%" height="100%">
                                <Treemap
                                    data={data}
                                    dataKey="size"
                                    aspectRatio={16 / 9}
                                    stroke="rgba(255, 255, 255, 0.1)"
                                    fill="#8884d8"
                                    content={<CustomTreemapContent />}
                                >
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(0, 173, 237, 0.5)',
                                            borderRadius: '8px',
                                            color: '#e0e6ed',
                                            padding: '12px'
                                        }}
                                        formatter={(value, name, props) => {
                                            if (name === 'size') {
                                                return [`Market Cap: $${value}B`, ''];
                                            }
                                            return [value, name];
                                        }}
                                        labelFormatter={(label) => {
                                            const item = data.find(d => d.symbol === label);
                                            if (item) {
                                                return (
                                                    <div>
                                                        <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>
                                                            {item.symbol} - {item.name}
                                                        </div>
                                                        <div style={{ color: item.change >= 0 ? '#10b981' : '#ef4444', fontSize: '1rem', fontWeight: 700 }}>
                                                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                                        </div>
                                                        <div style={{ marginTop: '4px', color: '#94a3b8' }}>
                                                            Price: ${item.price.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return label;
                                        }}
                                    />
                                </Treemap>
                            </ResponsiveContainer>
                        </TreemapView>
                    ) : (
                        <GridView>
                            {data.map((item) => (
                                <GridCell key={item.symbol} $change={item.change}>
                                    <CellSymbol>{item.symbol}</CellSymbol>
                                    <CellName>{item.name}</CellName>
                                    <CellChange $positive={item.change >= 0}>
                                        {item.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                                    </CellChange>
                                    <CellPrice>${item.price.toLocaleString()}</CellPrice>
                                </GridCell>
                            ))}
                        </GridView>
                    )
                ) : (
                    <EmptyState>
                        <EmptyIcon>
                            <MapPin size={80} color="#00adef" />
                        </EmptyIcon>
                        <EmptyTitle>No Data Available</EmptyTitle>
                        <EmptyText>
                            Unable to load market data. Please try again.
                        </EmptyText>
                    </EmptyState>
                )}
            </HeatmapContainer>
        </PageContainer>
    );
};

export default HeatmapPage;