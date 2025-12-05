// client/src/pages/PortfolioPage.js - WITH WALLET CONNECTION INTEGRATION

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import WalletConnectButton from '../components/WalletConnectButton';
import WalletAnalytics from '../components/WalletAnalytics';
import BrokerageConnect from '../components/BrokerageConnect';
import {
    TrendingUp, TrendingDown, PieChart, BarChart3,
    Activity, Brain, Target, Zap,
    ArrowUpRight, ArrowDownRight, Eye, Flame, Star,
    Download, RefreshCw, Search, AlertTriangle,
    CheckCircle, Shield, Lightbulb,
    Wallet, Link2, Building2
} from 'lucide-react';
import {
    PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const SpinningIcon = styled.div`
    animation: ${rotate} 2s linear infinite;
    display: inline-flex;
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: transparent;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
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
    background: ${props => props.theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
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
        ? `linear-gradient(135deg, ${props.theme.success || '#10b981'} 0%, ${props.theme.success || '#059669'} 100%)`
        : `${props.theme.brand?.primary || '#00adef'}15`};
    border: 1px solid ${props => props.$primary ? 'transparent' : `${props.theme.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${props => props.$primary ? 'white' : props.theme.brand?.primary || '#00adef'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$primary 
            ? `0 8px 24px ${props.theme.success || '#10b981'}66`
            : `0 8px 24px ${props.theme.brand?.primary || '#00adef'}33`};
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
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const MainStatCard = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}26 0%, ${props => props.theme.success || '#10b981'}26 100%);
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
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
        right: 0;
        height: 3px;
        background: ${props => props.theme.brand?.gradient || `linear-gradient(90deg, ${props.theme.brand?.primary || '#00adef'}, ${props.theme.success || '#10b981'})`};
    }
`;

const MainStatLabel = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
`;

const MainStatValue = styled.div`
    font-size: 3rem;
    font-weight: 900;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 0.5rem;

    @media (max-width: 768px) {
        font-size: 2.25rem;
    }
`;

const MainStatChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$delay || '0s'};
    animation-fill-mode: backwards;
`;

const StatIcon = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${props => props.$bg || `${props.theme.brand?.primary || '#00adef'}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme.brand?.primary || '#00adef'};
    margin-bottom: 1rem;
`;

const StatLabel = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
    font-size: 1.75rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme.text?.primary || '#e0e6ed'};
`;

// ============ AI ANALYSIS SECTION ============
const AISection = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.accent || '#8b5cf6'}1A 0%, ${props => props.theme.info || '#3b82f6'}1A 100%);
    border: 2px solid ${props => props.theme.brand?.accent || '#8b5cf6'}4D;
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    position: relative;
    overflow: hidden;
`;

const AISectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const AITitle = styled.h2`
    font-size: 1.5rem;
    color: ${props => props.theme.brand?.accent || '#a78bfa'};
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 800;
`;

const AIBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: ${props => props.theme.success || '#10b981'}33;
    border: 1px solid ${props => props.theme.success || '#10b981'}66;
    border-radius: 20px;
    color: ${props => props.theme.success || '#10b981'};
    font-size: 0.8rem;
    font-weight: 700;
`;

const AIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
`;

const InsightCard = styled.div`
    background: ${props => props.theme.brand?.accent || '#8b5cf6'}14;
    border: 1px solid ${props => props.theme.brand?.accent || '#8b5cf6'}33;
    border-radius: 14px;
    padding: 1.25rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.accent || '#8b5cf6'}1F;
        border-color: ${props => props.theme.brand?.accent || '#8b5cf6'}66;
        transform: translateY(-2px);
    }
`;

const InsightHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const InsightIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$bg || `${props.theme.brand?.accent || '#8b5cf6'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme.brand?.accent || '#a78bfa'};
`;

const InsightTitle = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 0.95rem;
`;

const InsightValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme.brand?.accent || '#a78bfa'};
    margin-bottom: 0.25rem;
`;

const InsightDescription = styled.div`
    font-size: 0.85rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    line-height: 1.5;
`;

const RecommendationsList = styled.div`
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${props => props.theme.brand?.accent || '#8b5cf6'}33;
`;

const RecommendationsTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme.brand?.accent || '#a78bfa'};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RecommendationItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: ${props => props.theme.brand?.accent || '#8b5cf6'}0D;
    border-radius: 10px;
    margin-bottom: 0.5rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const RecIcon = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => {
        if (props.$type === 'success') return `${props.theme.success || '#10b981'}33`;
        if (props.$type === 'warning') return `${props.theme.warning || '#fbbf24'}33`;
        if (props.$type === 'danger') return `${props.theme.error || '#ef4444'}33`;
        return `${props.theme.brand?.accent || '#8b5cf6'}33`;
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => {
        if (props.$type === 'success') return props.theme.success || '#10b981';
        if (props.$type === 'warning') return props.theme.warning || '#fbbf24';
        if (props.$type === 'danger') return props.theme.error || '#ef4444';
        return props.theme.brand?.accent || '#a78bfa';
    }};
    flex-shrink: 0;
    margin-top: 0.1rem;
`;

const RecText = styled.div`
    font-size: 0.9rem;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    line-height: 1.5;
`;

// ============ MAIN CONTENT GRID ============
const MainGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

// ============ HOLDINGS TABLE ============
const HoldingsSection = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 20px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const HoldingsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const HoldingsTitle = styled.h2`
    font-size: 1.3rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SearchWrapper = styled.div`
    position: relative;
    width: 250px;

    @media (max-width: 600px) {
        width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.6rem 1rem 0.6rem 2.5rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => props.theme.brand?.primary || '#00adef'}1A;
    }

    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const SearchIconStyled = styled(Search)`
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    width: 16px;
    height: 16px;
`;

const HoldingsTable = styled.div`
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    text-align: left;
    padding: 1rem 0.75rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid ${props => props.theme.brand?.primary || '#00adef'}1A;
`;

const Tr = styled.tr`
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    }
`;

const Td = styled.td`
    padding: 1rem 0.75rem;
    border-bottom: 1px solid ${props => props.theme.brand?.primary || '#00adef'}0D;
    vertical-align: middle;
`;

const SymbolCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SymbolIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}33 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}33 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const SymbolInfo = styled.div``;

const SymbolName = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
`;

const SymbolType = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const PriceCell = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ChangeCell = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 700;
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
`;

const ValueCell = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ActionCell = styled.div`
    display: flex;
    gap: 0.5rem;
`;

// ============ SIDEBAR CHARTS ============
const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const ChartCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const ChartTitle = styled.h3`
    font-size: 1.1rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}33 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}33 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed ${props => props.theme.brand?.primary || '#00adef'}4D;
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme.brand?.primary || '#00adef'};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    margin-bottom: 2rem;
`;

// ============ WALLET CONNECTION SECTION ============
const WalletSection = styled.div`
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}1A 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}1A 100%);
    border: 2px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const WalletSectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const WalletTitle = styled.h2`
    font-size: 1.3rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    margin: 0;
`;

const WalletInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: ${props => props.$linked
        ? `${props.theme.success || '#10b981'}33`
        : `${props.theme.warning || '#fbbf24'}33`};
    border: 1px solid ${props => props.$linked
        ? `${props.theme.success || '#10b981'}66`
        : `${props.theme.warning || '#fbbf24'}66`};
    border-radius: 20px;
    color: ${props => props.$linked
        ? props.theme.success || '#10b981'
        : props.theme.warning || '#fbbf24'};
    font-size: 0.8rem;
    font-weight: 700;
`;

// ============ TABS ============
const TabsContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    background: ${props => props.theme.bg?.tertiary || 'rgba(15, 23, 42, 0.5)'};
    padding: 0.5rem;
    border-radius: 12px;
    width: fit-content;
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active
        ? props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`
        : 'transparent'};
    border: none;
    border-radius: 8px;
    color: ${props => props.$active ? 'white' : props.theme.text?.secondary || '#94a3b8'};
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${props => props.$active
            ? props.theme.brand?.gradient
            : `${props.theme.brand?.primary || '#00adef'}1A`};
        color: ${props => props.$active ? 'white' : props.theme.text?.primary};
    }
`;

// ============ LOCAL AI ANALYSIS FUNCTIONS ============
const analyzePortfolio = (holdings, stats) => {
    if (!holdings || holdings.length === 0) {
        return null;
    }

    const analysis = {
        diversificationScore: 0,
        riskLevel: 'Moderate',
        sectorConcentration: 0,
        topPerformer: null,
        worstPerformer: null,
        recommendations: [],
        insights: []
    };

    // Calculate diversification score (based on number of holdings and allocation spread)
    const holdingCount = holdings.length;
    let diversificationBase = Math.min(holdingCount * 10, 50); // Up to 50 points for count

    // Calculate allocation spread
    const totalValue = stats?.totalValue || holdings.reduce((sum, h) => {
        const price = h.currentPrice || h.price || 0;
        const shares = h.shares || 0;
        return sum + (price * shares);
    }, 0);

    const allocations = holdings.map(h => {
        const price = h.currentPrice || h.price || 0;
        const shares = h.shares || 0;
        return (price * shares) / totalValue * 100;
    });

    // Check for over-concentration (any single holding > 30%)
    const maxAllocation = Math.max(...allocations);
    if (maxAllocation > 50) {
        analysis.sectorConcentration = maxAllocation;
        diversificationBase -= 20;
        analysis.recommendations.push({
            type: 'warning',
            text: `High concentration risk: One position is ${maxAllocation.toFixed(0)}% of your portfolio. Consider rebalancing.`
        });
    } else if (maxAllocation > 30) {
        analysis.sectorConcentration = maxAllocation;
        diversificationBase -= 10;
        analysis.recommendations.push({
            type: 'warning',
            text: `Moderate concentration: Your largest position is ${maxAllocation.toFixed(0)}% of portfolio.`
        });
    } else {
        diversificationBase += 20;
        analysis.recommendations.push({
            type: 'success',
            text: 'Good diversification! No single position dominates your portfolio.'
        });
    }

    // Allocation evenness bonus
    const avgAllocation = 100 / holdingCount;
    const allocationVariance = allocations.reduce((sum, a) => sum + Math.pow(a - avgAllocation, 2), 0) / holdingCount;
    if (allocationVariance < 100) {
        diversificationBase += 15;
    }

    analysis.diversificationScore = Math.min(Math.max(diversificationBase, 0), 100);

    // Determine risk level
    if (analysis.diversificationScore >= 70) {
        analysis.riskLevel = 'Low';
    } else if (analysis.diversificationScore >= 40) {
        analysis.riskLevel = 'Moderate';
    } else {
        analysis.riskLevel = 'High';
    }

    // Find top and worst performers
    const performanceData = holdings.map(h => {
        const currentPrice = h.currentPrice || h.price || 0;
        const avgPrice = h.averagePrice || h.purchasePrice || currentPrice;
        const gainPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
        return { symbol: h.symbol, gainPercent };
    }).sort((a, b) => b.gainPercent - a.gainPercent);

    if (performanceData.length > 0) {
        analysis.topPerformer = performanceData[0];
        analysis.worstPerformer = performanceData[performanceData.length - 1];
    }

    // Generate insights
    if (holdingCount < 5) {
        analysis.recommendations.push({
            type: 'info',
            text: `Consider adding more positions. You have ${holdingCount} holding${holdingCount > 1 ? 's' : ''} - aim for 8-15 for better diversification.`
        });
    }

    if (analysis.topPerformer && analysis.topPerformer.gainPercent > 50) {
        analysis.recommendations.push({
            type: 'success',
            text: `${analysis.topPerformer.symbol} is up ${analysis.topPerformer.gainPercent.toFixed(1)}%! Consider taking some profits.`
        });
    }

    if (analysis.worstPerformer && analysis.worstPerformer.gainPercent < -20) {
        analysis.recommendations.push({
            type: 'danger',
            text: `${analysis.worstPerformer.symbol} is down ${Math.abs(analysis.worstPerformer.gainPercent).toFixed(1)}%. Review your thesis or consider cutting losses.`
        });
    }

    // Add general tips if we have few recommendations
    if (analysis.recommendations.length < 3) {
        analysis.recommendations.push({
            type: 'info',
            text: 'Set price alerts for your holdings to stay informed of significant moves.'
        });
    }

    return analysis;
};

// ============ COMPONENT ============
const PortfolioPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();
    const { linkedWallet } = useWallet();

    // State
    const [holdings, setHoldings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' or 'analytics'

    // Dynamic colors from theme
    const COLORS = [
        theme.brand?.primary || '#00adef',
        theme.success || '#10b981',
        theme.warning || '#f59e0b',
        theme.error || '#ef4444',
        theme.brand?.accent || '#8b5cf6',
        theme.info || '#ec4899',
        theme.brand?.secondary || '#06b6d4',
        '#84cc16'
    ];

    // Fetch portfolio on mount
    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const response = await api.get('/portfolio');
            
            console.log('📊 Full API Response:', response.data);
            
            const portfolioData = response.data.portfolio || response.data;
            const holdingsData = portfolioData.holdings || [];
            
            console.log('📊 Holdings Data:', holdingsData);
            
            // If API already calculated totals, use them
            const apiTotalValue = portfolioData.totalValue || portfolioData.total_value || 0;
            const apiTotalCost = portfolioData.totalInvested || portfolioData.totalCost || portfolioData.total_cost || 0;
            const apiTotalGain = portfolioData.totalChange || portfolioData.totalGain || portfolioData.total_gain || 0;
            const apiTotalGainPercent = portfolioData.totalChangePercent || portfolioData.totalGainPercent || portfolioData.total_gain_percent || 0;
            
            console.log('📊 API Totals:', { apiTotalValue, apiTotalCost, apiTotalGain, apiTotalGainPercent });
            
            setHoldings(holdingsData);
            
            // Calculate stats - try API values first, then calculate from holdings
            if (holdingsData.length > 0) {
                let totalValue = apiTotalValue;
                let totalCost = apiTotalCost;
                
                // If API didn't provide totals, calculate from holdings
                if (totalValue === 0) {
                    totalValue = holdingsData.reduce((sum, h) => {
                        // Try multiple field names for current price
                        const price = h.currentPrice || h.current_price || h.price || h.marketPrice || h.market_price || 0;
                        const shares = h.shares || h.quantity || h.amount || 0;
                        const holdingValue = h.value || h.totalValue || h.total_value || h.marketValue || (price * shares);
                        console.log(`📈 ${h.symbol}: price=${price}, shares=${shares}, value=${holdingValue}`);
                        return sum + holdingValue;
                    }, 0);
                }
                
                if (totalCost === 0) {
                    totalCost = holdingsData.reduce((sum, h) => {
                        const avgPrice = h.averagePrice || h.average_price || h.avgPrice || h.purchasePrice || h.purchase_price || h.costBasis || h.cost_basis || 0;
                        const shares = h.shares || h.quantity || h.amount || 0;
                        const holdingCost = h.cost || h.totalCost || h.total_cost || (avgPrice * shares);
                        return sum + holdingCost;
                    }, 0);
                }

                const totalGain = apiTotalGain || (totalValue - totalCost);
                const totalGainPercent = apiTotalGainPercent || (totalCost > 0 ? (totalGain / totalCost) * 100 : 0);

                console.log('📊 Calculated Stats:', { totalValue, totalCost, totalGain, totalGainPercent });

                setStats({
                    totalValue,
                    totalCost,
                    totalGain,
                    totalGainPercent,
                    holdingsCount: holdingsData.length
                });
            } else {
                setStats(null);
            }
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            toast.error('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPortfolio();
        setRefreshing(false);
        toast.success('Portfolio refreshed!');
    };

    const handleExportCSV = () => {
        const csv = [
            ['Symbol', 'Shares', 'Avg Price', 'Current Price', 'Value', 'Gain/Loss', 'Gain %'].join(','),
            ...holdings.map(h => {
                const currentPrice = h.currentPrice || h.price || 0;
                const avgPrice = h.averagePrice || h.purchasePrice || currentPrice;
                const shares = h.shares || 0;
                const value = currentPrice * shares;
                const gain = value - (avgPrice * shares);
                const gainPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
                
                return [h.symbol, shares, avgPrice.toFixed(2), currentPrice.toFixed(2), value.toFixed(2), gain.toFixed(2), gainPercent.toFixed(2)].join(',');
            })
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Portfolio exported!');
    };

    // Filter holdings
    const filteredHoldings = useMemo(() => {
        if (!searchQuery) return holdings;
        return holdings.filter(h => 
            h.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [holdings, searchQuery]);

    // AI Analysis
    const aiAnalysis = useMemo(() => analyzePortfolio(holdings, stats), [holdings, stats]);

    // Pie chart data
    const pieData = useMemo(() => {
        return holdings.map(h => ({
            name: h.symbol,
            value: (h.currentPrice || h.price || 0) * (h.shares || 0)
        })).filter(d => d.value > 0);
    }, [holdings]);

    // Performance chart data
    const performanceData = useMemo(() => {
        return holdings.map(h => {
            const currentPrice = h.currentPrice || h.price || 0;
            const avgPrice = h.averagePrice || h.purchasePrice || currentPrice;
            const gain = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
            return { symbol: h.symbol, gain };
        }).sort((a, b) => b.gain - a.gain);
    }, [holdings]);

    if (loading) {
        return (
            <PageContainer theme={theme}>
                <ContentWrapper>
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <SpinningIcon><Activity size={64} color={theme.brand?.primary || '#00adef'} /></SpinningIcon>
                        <h2 style={{ marginTop: '1rem', color: theme.brand?.primary || '#00adef' }}>Loading Portfolio...</h2>
                    </div>
                </ContentWrapper>
            </PageContainer>
        );
    }

    if (holdings.length === 0) {
        return (
            <PageContainer theme={theme}>
                <ContentWrapper>
                    <Header>
                        <Title theme={theme}>My Portfolio</Title>
                        <Subtitle theme={theme}>Track your investments with AI-powered insights</Subtitle>
                    </Header>

                    {/* Wallet Connection Section - Always show */}
                    <WalletSection theme={theme}>
                        <WalletSectionHeader>
                            <WalletTitle theme={theme}>
                                <Wallet size={22} />
                                Connect Your Wallet
                            </WalletTitle>
                            <WalletInfo theme={theme} $linked={!!linkedWallet}>
                                {linkedWallet ? (
                                    <>
                                        <Link2 size={14} />
                                        Wallet Linked
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={14} />
                                        No Wallet Linked
                                    </>
                                )}
                            </WalletInfo>
                        </WalletSectionHeader>
                        <WalletConnectButton showInfo={true} />
                    </WalletSection>

                    <EmptyState>
                        <EmptyIcon theme={theme}>
                            <Wallet size={48} color={theme.brand?.primary || '#00adef'} />
                        </EmptyIcon>
                        <EmptyTitle theme={theme}>
                            {linkedWallet ? 'Ready to Sync' : 'Connect Your Wallet'}
                        </EmptyTitle>
                        <EmptyText theme={theme}>
                            {linkedWallet
                                ? 'Click the Sync button above to import your on-chain holdings'
                                : 'Connect and link your wallet above to automatically track your crypto holdings'}
                        </EmptyText>
                    </EmptyState>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer theme={theme}>
            <ContentWrapper>
                {/* Wallet Connection Section */}
                <WalletSection theme={theme}>
                    <WalletSectionHeader>
                        <WalletTitle theme={theme}>
                            <Wallet size={22} />
                            Wallet Connection
                        </WalletTitle>
                        <WalletInfo theme={theme} $linked={!!linkedWallet}>
                            {linkedWallet ? (
                                <>
                                    <Link2 size={14} />
                                    Wallet Linked
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={14} />
                                    No Wallet Linked
                                </>
                            )}
                        </WalletInfo>
                    </WalletSectionHeader>
                    <WalletConnectButton showInfo={true} />
                </WalletSection>

                {/* Header */}
                <Header>
                    <HeaderTop>
                        <div>
                            <Title theme={theme}>My Portfolio</Title>
                            <Subtitle theme={theme}>{holdings.length} holdings • AI-powered insights</Subtitle>
                        </div>
                        <HeaderActions>
                            <ActionButton theme={theme} onClick={handleRefresh} disabled={refreshing} $spinning={refreshing}>
                                <RefreshCw size={18} />
                                Refresh
                            </ActionButton>
                            <ActionButton theme={theme} onClick={handleExportCSV}>
                                <Download size={18} />
                                Export
                            </ActionButton>
                        </HeaderActions>
                    </HeaderTop>
                </Header>

                {/* Tabs */}
                <TabsContainer theme={theme}>
                    <Tab
                        theme={theme}
                        $active={activeTab === 'holdings'}
                        onClick={() => setActiveTab('holdings')}
                    >
                        <Wallet size={16} />
                        Holdings
                    </Tab>
                    {linkedWallet && (
                        <Tab
                            theme={theme}
                            $active={activeTab === 'analytics'}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <Activity size={16} />
                            Analytics
                        </Tab>
                    )}
                    <Tab
                        theme={theme}
                        $active={activeTab === 'brokerages'}
                        onClick={() => setActiveTab('brokerages')}
                    >
                        <Building2 size={16} />
                        Brokerages
                    </Tab>
                </TabsContainer>

                {/* Analytics Tab */}
                {activeTab === 'analytics' && linkedWallet && (
                    <WalletAnalytics />
                )}

                {/* Brokerages Tab */}
                {activeTab === 'brokerages' && (
                    <BrokerageConnect />
                )}

                {/* Holdings Tab - Stats Hero */}
                {activeTab === 'holdings' && (
                    <>
                {/* Stats Hero */}
                {stats && (
                    <StatsHero>
                        <MainStatCard theme={theme}>
                            <MainStatLabel theme={theme}>Total Portfolio Value</MainStatLabel>
                            <MainStatValue theme={theme}>
                                ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </MainStatValue>
                            <MainStatChange theme={theme} $positive={stats.totalGain >= 0}>
                                {stats.totalGain >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                {stats.totalGain >= 0 ? '+' : ''}${Math.abs(stats.totalGain).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                ({stats.totalGain >= 0 ? '+' : ''}{stats.totalGainPercent.toFixed(2)}%)
                            </MainStatChange>
                        </MainStatCard>

                        <StatCard theme={theme} $delay="0.1s">
                            <StatIcon theme={theme} $bg={`${theme.success || '#10b981'}26`} $color={theme.success || '#10b981'}>
                                <TrendingUp size={22} />
                            </StatIcon>
                            <StatLabel theme={theme}>Total Gain/Loss</StatLabel>
                            <StatValue theme={theme} $color={stats.totalGain >= 0 ? theme.success || '#10b981' : theme.error || '#ef4444'}>
                                {stats.totalGain >= 0 ? '+' : ''}{stats.totalGainPercent.toFixed(2)}%
                            </StatValue>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.2s">
                            <StatIcon theme={theme} $bg={`${theme.brand?.accent || '#8b5cf6'}26`} $color={theme.brand?.accent || '#a78bfa'}>
                                <Target size={22} />
                            </StatIcon>
                            <StatLabel theme={theme}>Cost Basis</StatLabel>
                            <StatValue theme={theme}>
                                ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </StatValue>
                        </StatCard>

                        <StatCard theme={theme} $delay="0.3s">
                            <StatIcon theme={theme} $bg={`${theme.warning || '#fbbf24'}26`} $color={theme.warning || '#fbbf24'}>
                                <BarChart3 size={22} />
                            </StatIcon>
                            <StatLabel theme={theme}>Holdings</StatLabel>
                            <StatValue theme={theme}>{stats.holdingsCount}</StatValue>
                        </StatCard>
                    </StatsHero>
                )}

                {/* AI Analysis Section */}
                {aiAnalysis && (
                    <AISection theme={theme}>
                        <AISectionHeader>
                            <AITitle theme={theme}>
                                <Brain size={28} />
                                AI Portfolio Analysis
                            </AITitle>
                            <AIBadge theme={theme}>
                                <Zap size={14} />
                                Powered by Nexus AI
                            </AIBadge>
                        </AISectionHeader>

                        <AIGrid>
                            <InsightCard theme={theme}>
                                <InsightHeader>
                                    <InsightIcon theme={theme} $bg={`${theme.success || '#10b981'}33`} $color={theme.success || '#10b981'}>
                                        <Shield size={18} />
                                    </InsightIcon>
                                    <InsightTitle theme={theme}>Diversification Score</InsightTitle>
                                </InsightHeader>
                                <InsightValue theme={theme} $color={
                                    aiAnalysis.diversificationScore >= 70 ? theme.success || '#10b981' :
                                    aiAnalysis.diversificationScore >= 40 ? theme.warning || '#fbbf24' : theme.error || '#ef4444'
                                }>
                                    {aiAnalysis.diversificationScore}/100
                                </InsightValue>
                                <InsightDescription theme={theme}>
                                    {aiAnalysis.diversificationScore >= 70 ? 'Well diversified portfolio' :
                                     aiAnalysis.diversificationScore >= 40 ? 'Moderate diversification' :
                                     'Consider adding more positions'}
                                </InsightDescription>
                            </InsightCard>

                            <InsightCard theme={theme}>
                                <InsightHeader>
                                    <InsightIcon theme={theme} $bg={
                                        aiAnalysis.riskLevel === 'Low' ? `${theme.success || '#10b981'}33` :
                                        aiAnalysis.riskLevel === 'Moderate' ? `${theme.warning || '#fbbf24'}33` :
                                        `${theme.error || '#ef4444'}33`
                                    } $color={
                                        aiAnalysis.riskLevel === 'Low' ? theme.success || '#10b981' :
                                        aiAnalysis.riskLevel === 'Moderate' ? theme.warning || '#fbbf24' : theme.error || '#ef4444'
                                    }>
                                        <AlertTriangle size={18} />
                                    </InsightIcon>
                                    <InsightTitle theme={theme}>Risk Level</InsightTitle>
                                </InsightHeader>
                                <InsightValue theme={theme} $color={
                                    aiAnalysis.riskLevel === 'Low' ? theme.success || '#10b981' :
                                    aiAnalysis.riskLevel === 'Moderate' ? theme.warning || '#fbbf24' : theme.error || '#ef4444'
                                }>
                                    {aiAnalysis.riskLevel}
                                </InsightValue>
                                <InsightDescription theme={theme}>
                                    Based on concentration and diversification
                                </InsightDescription>
                            </InsightCard>

                            {aiAnalysis.topPerformer && (
                                <InsightCard theme={theme}>
                                    <InsightHeader>
                                        <InsightIcon theme={theme} $bg={`${theme.success || '#10b981'}33`} $color={theme.success || '#10b981'}>
                                            <Star size={18} />
                                        </InsightIcon>
                                        <InsightTitle theme={theme}>Top Performer</InsightTitle>
                                    </InsightHeader>
                                    <InsightValue theme={theme} $color={theme.success || '#10b981'}>
                                        {aiAnalysis.topPerformer.symbol}
                                    </InsightValue>
                                    <InsightDescription theme={theme}>
                                        Up {aiAnalysis.topPerformer.gainPercent.toFixed(1)}% from cost basis
                                    </InsightDescription>
                                </InsightCard>
                            )}

                            {aiAnalysis.worstPerformer && (
                                <InsightCard theme={theme}>
                                    <InsightHeader>
                                        <InsightIcon theme={theme} $bg={`${theme.error || '#ef4444'}33`} $color={theme.error || '#ef4444'}>
                                            <Flame size={18} />
                                        </InsightIcon>
                                        <InsightTitle theme={theme}>Needs Attention</InsightTitle>
                                    </InsightHeader>
                                    <InsightValue theme={theme} $color={theme.error || '#ef4444'}>
                                        {aiAnalysis.worstPerformer.symbol}
                                    </InsightValue>
                                    <InsightDescription theme={theme}>
                                        {aiAnalysis.worstPerformer.gainPercent >= 0 ? 'Up' : 'Down'} {Math.abs(aiAnalysis.worstPerformer.gainPercent).toFixed(1)}% from cost basis
                                    </InsightDescription>
                                </InsightCard>
                            )}
                        </AIGrid>

                        {aiAnalysis.recommendations.length > 0 && (
                            <RecommendationsList theme={theme}>
                                <RecommendationsTitle theme={theme}>
                                    <Lightbulb size={20} />
                                    AI Recommendations
                                </RecommendationsTitle>
                                {aiAnalysis.recommendations.map((rec, i) => (
                                    <RecommendationItem theme={theme} key={i}>
                                        <RecIcon theme={theme} $type={rec.type}>
                                            {rec.type === 'success' && <CheckCircle size={14} />}
                                            {rec.type === 'warning' && <AlertTriangle size={14} />}
                                            {rec.type === 'danger' && <TrendingDown size={14} />}
                                            {rec.type === 'info' && <Lightbulb size={14} />}
                                        </RecIcon>
                                        <RecText theme={theme}>{rec.text}</RecText>
                                    </RecommendationItem>
                                ))}
                            </RecommendationsList>
                        )}
                    </AISection>
                )}

                {/* Main Content */}
                <MainGrid>
                    {/* Holdings Table */}
                    <HoldingsSection theme={theme}>
                        <HoldingsHeader>
                            <HoldingsTitle theme={theme}>
                                <Eye size={22} />
                                Your Holdings
                            </HoldingsTitle>
                            <SearchWrapper>
                                <SearchIconStyled theme={theme} />
                                <SearchInput
                                    theme={theme}
                                    type="text"
                                    placeholder="Search holdings..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </SearchWrapper>
                        </HoldingsHeader>

                        <HoldingsTable>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th theme={theme}>Symbol</Th>
                                        <Th theme={theme}>Shares</Th>
                                        <Th theme={theme}>Avg Price</Th>
                                        <Th theme={theme}>Current</Th>
                                        <Th theme={theme}>Value</Th>
                                        <Th theme={theme}>Gain/Loss</Th>
                                        <Th theme={theme}></Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHoldings.map(holding => {
                                        // Debug: log the holding object to see all fields
                                        console.log('🔍 Holding object:', holding.symbol, holding);
                                        
                                        const currentPrice = holding.currentPrice || holding.current_price || holding.price || holding.marketPrice || 0;
                                        const avgPrice = holding.averagePrice || holding.average_price || holding.avgPrice || holding.purchasePrice || holding.purchase_price || holding.costBasis || currentPrice;
                                        const shares = holding.shares || holding.quantity || holding.amount || holding.units || holding.qty || 0;
                                        const value = holding.value || holding.totalValue || holding.marketValue || (currentPrice * shares);
                                        const gain = value - (avgPrice * shares);
                                        const gainPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
                                        const positive = gain >= 0;

                                        return (
                                            <Tr theme={theme} key={holding._id || holding.symbol}>
                                                <Td theme={theme}>
                                                    <SymbolCell>
                                                        <SymbolIcon theme={theme}>{holding.symbol?.substring(0, 2)}</SymbolIcon>
                                                        <SymbolInfo>
                                                            <SymbolName theme={theme}>{holding.symbol}</SymbolName>
                                                            <SymbolType theme={theme}>Stock</SymbolType>
                                                        </SymbolInfo>
                                                    </SymbolCell>
                                                </Td>
                                                <Td theme={theme}>
                                                    <PriceCell theme={theme}>{shares}</PriceCell>
                                                </Td>
                                                <Td theme={theme}>
                                                    <PriceCell theme={theme}>${avgPrice.toFixed(2)}</PriceCell>
                                                </Td>
                                                <Td theme={theme}>
                                                    <PriceCell theme={theme}>${currentPrice.toFixed(2)}</PriceCell>
                                                </Td>
                                                <Td theme={theme}>
                                                    <ValueCell theme={theme}>${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</ValueCell>
                                                </Td>
                                                <Td theme={theme}>
                                                    <ChangeCell theme={theme} $positive={positive}>
                                                        {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                        {positive ? '+' : ''}{gainPercent.toFixed(2)}%
                                                    </ChangeCell>
                                                </Td>
                                                <Td theme={theme}>
                                                    <ActionCell>
                                                        <span style={{ color: theme.success || '#10b981', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Link2 size={12} />
                                                            Wallet
                                                        </span>
                                                    </ActionCell>
                                                </Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </HoldingsTable>
                    </HoldingsSection>

                    {/* Sidebar Charts */}
                    <Sidebar>
                        <ChartCard theme={theme}>
                            <ChartTitle theme={theme}>
                                <PieChart size={20} />
                                Allocation
                            </ChartTitle>
                            <ResponsiveContainer width="100%" height={220}>
                                <RechartsPie>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: `1px solid ${theme.brand?.primary || '#00adef'}4D`,
                                            borderRadius: '8px'
                                        }}
                                    />
                                </RechartsPie>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                                {pieData.slice(0, 6).map((entry, index) => (
                                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                                        <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[index % COLORS.length] }} />
                                        <span style={{ color: theme.text?.secondary || '#94a3b8' }}>{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>

                        <ChartCard theme={theme}>
                            <ChartTitle theme={theme}>
                                <BarChart3 size={20} />
                                Performance
                            </ChartTitle>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={performanceData.slice(0, 6)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke={`${theme.text?.secondary || '#94a3b8'}1A`} />
                                    <XAxis type="number" stroke={theme.text?.tertiary || '#64748b'} tickFormatter={v => `${v}%`} />
                                    <YAxis type="category" dataKey="symbol" stroke={theme.text?.tertiary || '#64748b'} width={50} />
                                    <Tooltip
                                        formatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
                                        contentStyle={{
                                            background: '#1e293b',
                                            border: `1px solid ${theme.brand?.primary || '#00adef'}4D`,
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="gain" radius={[0, 4, 4, 0]}>
                                        {performanceData.slice(0, 6).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.gain >= 0 ? theme.success || '#10b981' : theme.error || '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </Sidebar>
                </MainGrid>
                    </>
                )}
            </ContentWrapper>

        </PageContainer>
    );
};

export default PortfolioPage;
