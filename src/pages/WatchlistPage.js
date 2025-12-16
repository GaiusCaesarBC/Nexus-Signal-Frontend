// client/src/pages/WatchlistPage.js - THEMED CLEAN WATCHLIST

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';
import {
    TrendingUp, TrendingDown, Plus, Trash2, X, Eye, Star,
    Activity, BarChart3, ArrowUpRight, ArrowDownRight,
    Bell, BellOff, Download, Search, RefreshCw, Flame,
    AlertTriangle, Target, Zap, Bitcoin, Coins,
    TrendingUp as RSIIcon, GitBranch, Maximize2, Minimize2
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
    ${css`animation: ${fadeIn} 0.6s ease-out;`}
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
        : `${props.theme.brand?.primary || '#00adef'}1A`};
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
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.25rem;
    ${css`animation: ${fadeIn} 0.6s ease-out;`}
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
        background: ${props => props.$color || `linear-gradient(90deg, ${props.theme.brand?.primary || '#00adef'}, ${props.theme.brand?.secondary || '#0088cc'})`};
    }
`;

const StatIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$bg || `${props.theme.brand?.primary || '#00adef'}26`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme.brand?.primary || '#00adef'};
    margin-bottom: 0.75rem;
`;

const StatLabel = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
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

const StatSubtext = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
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

const Select = styled.select`
    padding: 0.6rem 1rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
    }

    option {
        background: #1a1f3a;
        color: ${props => props.theme.text?.primary || '#e0e6ed'};
    }
`;

// ============ WATCHLIST TABLE ============
const WatchlistSection = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 20px;
    padding: 1.5rem;
    ${css`animation: ${fadeIn} 0.6s ease-out;`}
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.3rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TableWrapper = styled.div`
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    /* Mobile: switch to card layout */
    @media (max-width: 768px) {
        overflow-x: visible;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    /* Mobile: switch to block layout */
    @media (max-width: 768px) {
        display: block;

        thead {
            display: none;
        }

        tbody {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
    }
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
    cursor: pointer;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    }

    /* Mobile: card layout */
    @media (max-width: 768px) {
        display: flex;
        flex-wrap: wrap;
        padding: 1rem;
        background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.8)'};
        border-radius: 12px;
        border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}1A;
        gap: 0.75rem;
        align-items: center;

        &:active {
            transform: scale(0.99);
        }
    }
`;

const Td = styled.td`
    padding: 1rem 0.75rem;
    border-bottom: 1px solid ${props => props.theme.brand?.primary || '#00adef'}0D;
    vertical-align: middle;

    /* Mobile: flex layout */
    @media (max-width: 768px) {
        padding: 0;
        border: none;

        /* Symbol cell takes full width on mobile */
        &:first-child {
            width: 100%;
            margin-bottom: 0.5rem;
        }

        /* Price and change cells */
        &:nth-child(2),
        &:nth-child(3) {
            flex: 1;
        }

        /* Actions cell */
        &:last-child {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            margin-top: 0.5rem;
            padding-top: 0.75rem;
            border-top: 1px solid ${props => props.theme.brand?.primary || '#00adef'}1A;
        }
    }
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
        ? `linear-gradient(135deg, ${props.theme.warning || '#fbbf24'}33 0%, ${props.theme.warning || '#f59e0b'}33 100%)`
        : `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}33 0%, ${props.theme.brand?.accent || '#8b5cf6'}33 100%)`};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.85rem;
    color: ${props => props.$crypto ? props.theme.warning || '#fbbf24' : props.theme.brand?.primary || '#00adef'};
`;

const SymbolInfo = styled.div``;

const SymbolName = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SymbolCompany = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
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
        ? `${props.theme.warning || '#fbbf24'}26` 
        : `${props.theme.brand?.primary || '#00adef'}26`};
    color: ${props => props.$crypto ? props.theme.warning || '#fbbf24' : props.theme.brand?.primary || '#00adef'};
    border: 1px solid ${props => props.$crypto 
        ? `${props.theme.warning || '#fbbf24'}4D` 
        : `${props.theme.brand?.primary || '#00adef'}4D`};
`;

const PriceCell = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
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
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
    font-size: 0.95rem;
`;

const ChangePercent = styled.div`
    font-size: 0.8rem;
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
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
        ? `${props.theme.success || '#10b981'}26` 
        : `${props.theme.text?.tertiary || '#64748b'}1A`};
    border: 1px solid ${props => props.$active 
        ? `${props.theme.success || '#10b981'}4D` 
        : `${props.theme.text?.tertiary || '#64748b'}33`};
    border-radius: 6px;
    font-size: 0.75rem;
    color: ${props => props.$active ? props.theme.success || '#10b981' : props.theme.text?.tertiary || '#64748b'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$active 
            ? `${props.theme.success || '#10b981'}40` 
            : `${props.theme.text?.tertiary || '#64748b'}33`};
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
    background: ${props => props.$danger ? `${props.theme.error || '#ef4444'}1A` : `${props.theme.brand?.primary || '#00adef'}1A`};
    border: 1px solid ${props => props.$danger ? `${props.theme.error || '#ef4444'}4D` : `${props.theme.brand?.primary || '#00adef'}4D`};
    color: ${props => props.$danger ? props.theme.error || '#ef4444' : props.theme.brand?.primary || '#00adef'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? `${props.theme.error || '#ef4444'}33` : `${props.theme.brand?.primary || '#00adef'}33`};
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
    ${css`animation: ${fadeIn} 0.2s ease-out;`}
`;

const ModalContent = styled.div`
    background: ${({ theme }) => theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.95)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
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
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.theme.error || '#ef4444'}1A;
    border: 1px solid ${props => props.theme.error || '#ef4444'}4D;
    color: ${props => props.theme.error || '#ef4444'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.error || '#ef4444'}33;
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
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => props.theme.brand?.primary || '#00adef'}1A;
    }

    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const ModalSelect = styled.select`
    width: 100%;
    padding: 0.75rem 1rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}0D;
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}4D;
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
    }

    option {
        background: #1a1f3a;
        color: ${props => props.theme.text?.primary || '#e0e6ed'};
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 0.875rem;
    background: ${props => props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`};
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px ${props => props.theme.brand?.primary || '#00adef'}66;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const HelpText = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
    margin-top: 0.5rem;
`;

// ============ TABS ============
const ModalTabs = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    padding: 0.375rem;
    border-radius: 12px;
`;

const Tab = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${props => props.$active
        ? props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`
        : 'transparent'};
    border: none;
    border-radius: 8px;
    color: ${props => props.$active ? 'white' : props.theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
        background: ${props => props.$active
            ? props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`
            : `${props.theme.brand?.primary || '#00adef'}1A`};
    }
`;

const TechnicalTypeCard = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: ${props => props.$selected
        ? `${props.theme.brand?.primary || '#00adef'}26`
        : `${props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'}`};
    border: 2px solid ${props => props.$selected
        ? props.theme.brand?.primary || '#00adef'
        : 'transparent'};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1A`};
        border-color: ${props => `${props.theme.brand?.primary || '#00adef'}80`};
    }
`;

const TechnicalTypeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
`;

const TechnicalTypeName = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TechnicalTypeDesc = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
`;

const AlertBadgeCount = styled.span`
    background: ${props => props.theme.success || '#10b981'};
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.4rem;
    border-radius: 10px;
    margin-left: 0.25rem;
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
    background: ${props => `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}33 0%, ${props.theme.brand?.accent || '#8b5cf6'}33 100%)`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: ${props => `2px dashed ${props.theme.brand?.primary || '#00adef'}4D`};
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

// ============ LOADING ============
const SpinningIcon = styled.div`
    ${css`animation: ${rotate} 2s linear infinite;`}
    display: inline-flex;
`;

// ============ CRYPTO DETECTION & FORMATTING ============
const CRYPTO_SYMBOLS = [
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'SOL', 'DOT', 'MATIC', 'LTC',
    'SHIB', 'TRX', 'AVAX', 'LINK', 'ATOM', 'UNI', 'XLM', 'ETC', 'BCH', 'ALGO',
    'VET', 'FIL', 'ICP', 'MANA', 'SAND', 'AXS', 'AAVE', 'MKR', 'COMP', 'SNX',
    'CRO', 'NEAR', 'FTM', 'HBAR', 'EGLD', 'THETA', 'XTZ', 'EOS', 'CAKE', 'RUNE',
    'ZEC', 'DASH', 'NEO', 'WAVES', 'KSM', 'ENJ', 'CHZ', 'BAT', 'ZIL', 'QTUM',
    'BTT', 'ONE', 'HOT', 'IOTA', 'XMR', 'KLAY', 'GRT', 'SUSHI', 'YFI', 'CRV',
    'PEPE', 'FLOKI', 'BONK', 'WIF', 'BRETT'
];

const isCrypto = (symbol) => {
    if (!symbol) return false;
    const upperSymbol = symbol.toUpperCase();
    
    // Check known crypto symbols
    if (CRYPTO_SYMBOLS.includes(upperSymbol)) return true;
    
    // Check for crypto patterns
    if (upperSymbol.endsWith('-USD') || upperSymbol.endsWith('-USDT') || 
        upperSymbol.endsWith('-BUSD') || upperSymbol.endsWith('-EUR') || 
        upperSymbol.endsWith('-GBP')) return true;
    
    // Remove suffixes and check base symbol
    const baseSymbol = upperSymbol.replace(/-USD|-USDT|-BUSD|-EUR|-GBP/g, '');
    return CRYPTO_SYMBOLS.includes(baseSymbol);
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
        'AAVE': 'Aave', 'MKR': 'Maker', 'CRO': 'Cronos', 'GRT': 'The Graph',
        'PEPE': 'Pepe', 'FLOKI': 'Floki Inu', 'BONK': 'Bonk'
    };
    const base = symbol?.toUpperCase().replace(/-USD|-USDT|-BUSD|-EUR|-GBP/g, '');
    return names[base] || `${base} Crypto`;
};

// Smart price formatter - detects crypto vs stock and routes to appropriate formatter
const formatPrice = (price, symbol) => {
    if (!price || price === 0) return '$0.00';
    
    // Detect if this is a crypto or stock
    const crypto = isCrypto(symbol);
    
    // Route to the appropriate formatter
    if (crypto) {
        return formatCryptoPrice(price);
    } else {
        return formatStockPrice(price);
    }
};

// ============ COMPONENT ============
const WatchlistPage = () => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();
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

    // Technical alerts state
    const [alertTab, setAlertTab] = useState('price'); // 'price' or 'technical'
    const [technicalAlertType, setTechnicalAlertType] = useState('');
    const [technicalParams, setTechnicalParams] = useState({
        rsiThreshold: 30,
        supportLevel: '',
        resistanceLevel: '',
        tolerance: 2
    });
    const [userAlerts, setUserAlerts] = useState([]); // Alerts from backend
    const [creatingAlert, setCreatingAlert] = useState(false);

    // Technical alert types config
    const technicalAlertTypes = [
        { value: 'rsi_oversold', label: 'RSI Oversold', description: 'RSI drops below threshold', icon: '📉', params: ['rsiThreshold'] },
        { value: 'rsi_overbought', label: 'RSI Overbought', description: 'RSI rises above threshold', icon: '📈', params: ['rsiThreshold'] },
        { value: 'macd_bullish_crossover', label: 'MACD Bullish', description: 'MACD crosses above signal', icon: '✨', params: [] },
        { value: 'macd_bearish_crossover', label: 'MACD Bearish', description: 'MACD crosses below signal', icon: '⚠️', params: [] },
        { value: 'bollinger_upper_breakout', label: 'Bollinger Upper', description: 'Price breaks upper band', icon: '🔺', params: [] },
        { value: 'bollinger_lower_breakout', label: 'Bollinger Lower', description: 'Price breaks lower band', icon: '🔻', params: [] },
        { value: 'support_test', label: 'Support Test', description: 'Price approaches support', icon: '🛡️', params: ['supportLevel', 'tolerance'] },
        { value: 'resistance_test', label: 'Resistance Test', description: 'Price approaches resistance', icon: '🎯', params: ['resistanceLevel', 'tolerance'] }
    ];

    // Fetch on mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchWatchlist();
            fetchUserAlerts();
        }
    }, [isAuthenticated]);

    // Fetch user's alerts from backend
    const fetchUserAlerts = async () => {
        try {
            const response = await api.get('/alerts/active');
            if (response.data?.alerts) {
                setUserAlerts(response.data.alerts);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const fetchWatchlist = async () => {
        setLoading(true);
        try {
            const response = await api.get('/watchlist');
            console.log('📊 Raw watchlist response:', response.data);
            
            const watchlistData = Array.isArray(response.data) 
                ? response.data 
                : response.data.watchlist || [];
            
            watchlistData.forEach(item => {
                console.log(`💰 ${item.symbol}: price=${item.currentPrice || item.price}, change=${item.changePercent}`);
            });
            
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
        setAlertTab('price'); // Reset to price tab
        setAlertFormData({
            targetPrice: stock.currentPrice || stock.price || '',
            condition: 'above'
        });
        setTechnicalAlertType('');
        setTechnicalParams({
            rsiThreshold: 30,
            supportLevel: stock.currentPrice || stock.price || '',
            resistanceLevel: stock.currentPrice || stock.price || '',
            tolerance: 2
        });
        setShowAlertModal(true);
    };

    const handleSubmitAlert = async (e) => {
        e.preventDefault();
        setCreatingAlert(true);

        try {
            const symbol = selectedStock.symbol;
            const assetType = isCrypto(symbol) ? 'crypto' : 'stock';

            if (alertTab === 'price') {
                // Price alert
                const targetPrice = parseFloat(alertFormData.targetPrice);

                if (targetPrice <= 0) {
                    toast.warning('Target price must be greater than 0');
                    setCreatingAlert(false);
                    return;
                }

                const alertType = alertFormData.condition === 'above' ? 'price_above' : 'price_below';

                await api.post('/alerts', {
                    type: alertType,
                    symbol: symbol.toUpperCase(),
                    assetType,
                    targetPrice,
                    notifyVia: { inApp: true, telegram: true }
                });

                toast.success(`Price alert set: ${symbol} ${alertFormData.condition} $${targetPrice.toFixed(2)}`);

            } else {
                // Technical alert
                if (!technicalAlertType) {
                    toast.warning('Please select an alert type');
                    setCreatingAlert(false);
                    return;
                }

                // Validate required params for support/resistance
                if (technicalAlertType === 'support_test' && !technicalParams.supportLevel) {
                    toast.warning('Please enter a support level');
                    setCreatingAlert(false);
                    return;
                }
                if (technicalAlertType === 'resistance_test' && !technicalParams.resistanceLevel) {
                    toast.warning('Please enter a resistance level');
                    setCreatingAlert(false);
                    return;
                }

                await api.post('/alerts', {
                    type: technicalAlertType,
                    symbol: symbol.toUpperCase(),
                    assetType,
                    technicalParams: {
                        rsiThreshold: technicalAlertType.includes('rsi') ? parseInt(technicalParams.rsiThreshold) : undefined,
                        supportLevel: technicalAlertType === 'support_test' ? parseFloat(technicalParams.supportLevel) : undefined,
                        resistanceLevel: technicalAlertType === 'resistance_test' ? parseFloat(technicalParams.resistanceLevel) : undefined,
                        tolerance: parseInt(technicalParams.tolerance) || 2
                    },
                    notifyVia: { inApp: true, telegram: true }
                });

                const alertLabel = technicalAlertTypes.find(t => t.value === technicalAlertType)?.label || technicalAlertType;
                toast.success(`Technical alert set: ${symbol} - ${alertLabel}`);
            }

            // Refresh alerts and close modal
            await fetchUserAlerts();
            setShowAlertModal(false);
            setSelectedStock(null);

        } catch (error) {
            console.error('Error creating alert:', error);
            toast.error(error.response?.data?.error || 'Failed to create alert');
        } finally {
            setCreatingAlert(false);
        }
    };

    // Get count of active alerts for a symbol
    const getAlertCountForSymbol = (symbol) => {
        return userAlerts.filter(a => a.symbol === symbol.toUpperCase()).length;
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

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s => 
                (s.symbol || '').toLowerCase().includes(query) ||
                (s.name || '').toLowerCase().includes(query)
            );
        }

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
            <PageContainer theme={theme}>
                <ContentWrapper>
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <SpinningIcon><Activity size={64} color={theme.brand?.primary || '#00adef'} /></SpinningIcon>
                        <h2 style={{ marginTop: '1rem', color: theme.brand?.primary || '#00adef' }}>Loading Watchlist...</h2>
                    </div>
                </ContentWrapper>
            </PageContainer>
        );
    }

    if (watchlist.length === 0) {
        return (
            <PageContainer theme={theme}>
                <ContentWrapper>
                    <Header>
                        <Title theme={theme}>My Watchlist</Title>
                        <Subtitle theme={theme}>Track stocks & crypto in real-time</Subtitle>
                    </Header>
                    <EmptyState>
                        <EmptyIcon theme={theme}>
                            <Eye size={48} color={theme.brand?.primary || '#00adef'} />
                        </EmptyIcon>
                        <EmptyTitle theme={theme}>Your Watchlist is Empty</EmptyTitle>
                        <EmptyText theme={theme}>Add stocks or crypto to track their performance</EmptyText>
                        <ActionButton theme={theme} $primary onClick={() => setShowAddModal(true)}>
                            <Plus size={20} />
                            Add Your First Stock
                        </ActionButton>
                    </EmptyState>
                </ContentWrapper>

                {showAddModal && (
                    <Modal onClick={() => setShowAddModal(false)}>
                        <ModalContent theme={theme} onClick={e => e.stopPropagation()}>
                            <ModalHeader>
                                <ModalTitle theme={theme}>Add to Watchlist</ModalTitle>
                                <CloseButton theme={theme} onClick={() => setShowAddModal(false)}>
                                    <X size={18} />
                                </CloseButton>
                            </ModalHeader>
                            <Form onSubmit={handleAddStock}>
                                <FormGroup>
                                    <Label theme={theme}>Symbol (Stock or Crypto)</Label>
                                    <Input
                                        theme={theme}
                                        type="text"
                                        placeholder="AAPL, TSLA, BTC, ETH..."
                                        value={formData.symbol}
                                        onChange={e => setFormData({ symbol: e.target.value.toUpperCase() })}
                                        required
                                        autoFocus
                                    />
                                    <HelpText theme={theme}>
                                        Enter any stock ticker or crypto symbol
                                    </HelpText>
                                </FormGroup>
                                <SubmitButton theme={theme} type="submit">Add to Watchlist</SubmitButton>
                            </Form>
                        </ModalContent>
                    </Modal>
                )}
            </PageContainer>
        );
    }

    return (
        <PageContainer theme={theme}>
            <ContentWrapper>
                {/* Header */}
                <Header>
                    <HeaderTop>
                        <div>
                            <Title theme={theme}>My Watchlist</Title>
                            <Subtitle theme={theme}>{watchlist.length} assets • Stocks & Crypto</Subtitle>
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
                            <ActionButton theme={theme} $primary onClick={() => setShowAddModal(true)}>
                                <Plus size={18} />
                                Add Stock
                            </ActionButton>
                        </HeaderActions>
                    </HeaderTop>
                </Header>

                {/* Stats */}
                <StatsHero>
                    <StatCard theme={theme} $delay="0s" $color={`linear-gradient(90deg, ${theme.brand?.primary || '#00adef'}, ${theme.brand?.secondary || '#0088cc'})`}>
                        <StatIcon theme={theme} $bg={`${theme.brand?.primary || '#00adef'}26`} $color={theme.brand?.primary || '#00adef'}>
                            <Eye size={20} />
                        </StatIcon>
                        <StatLabel theme={theme}>Total</StatLabel>
                        <StatValue theme={theme}>{stats.total}</StatValue>
                        <StatSubtext theme={theme}>watching</StatSubtext>
                    </StatCard>

                    <StatCard theme={theme} $delay="0.05s" $color={`linear-gradient(90deg, ${theme.brand?.accent || '#8b5cf6'}, ${theme.brand?.accent || '#7c3aed'})`}>
                        <StatIcon theme={theme} $bg={`${theme.brand?.accent || '#8b5cf6'}26`} $color={theme.brand?.accent || '#a78bfa'}>
                            <BarChart3 size={20} />
                        </StatIcon>
                        <StatLabel theme={theme}>Stocks</StatLabel>
                        <StatValue theme={theme} $color={theme.brand?.accent || '#a78bfa'}>{stats.stocks}</StatValue>
                        <StatSubtext theme={theme}>equities</StatSubtext>
                    </StatCard>

                    <StatCard theme={theme} $delay="0.1s" $color={`linear-gradient(90deg, ${theme.warning || '#fbbf24'}, ${theme.warning || '#f59e0b'})`}>
                        <StatIcon theme={theme} $bg={`${theme.warning || '#fbbf24'}26`} $color={theme.warning || '#fbbf24'}>
                            <Bitcoin size={20} />
                        </StatIcon>
                        <StatLabel theme={theme}>Crypto</StatLabel>
                        <StatValue theme={theme} $color={theme.warning || '#fbbf24'}>{stats.crypto}</StatValue>
                        <StatSubtext theme={theme}>tokens</StatSubtext>
                    </StatCard>

                    <StatCard theme={theme} $delay="0.15s" $color={`linear-gradient(90deg, ${theme.success || '#10b981'}, ${theme.success || '#059669'})`}>
                        <StatIcon theme={theme} $bg={`${theme.success || '#10b981'}26`} $color={theme.success || '#10b981'}>
                            <TrendingUp size={20} />
                        </StatIcon>
                        <StatLabel theme={theme}>Gainers</StatLabel>
                        <StatValue theme={theme} $color={theme.success || '#10b981'}>{stats.gainers}</StatValue>
                        <StatSubtext theme={theme}>up today</StatSubtext>
                    </StatCard>

                    <StatCard theme={theme} $delay="0.2s" $color={`linear-gradient(90deg, ${theme.error || '#ef4444'}, ${theme.error || '#dc2626'})`}>
                        <StatIcon theme={theme} $bg={`${theme.error || '#ef4444'}26`} $color={theme.error || '#ef4444'}>
                            <TrendingDown size={20} />
                        </StatIcon>
                        <StatLabel theme={theme}>Losers</StatLabel>
                        <StatValue theme={theme} $color={theme.error || '#ef4444'}>{stats.losers}</StatValue>
                        <StatSubtext theme={theme}>down today</StatSubtext>
                    </StatCard>
                </StatsHero>

                {/* Watchlist Table */}
                <WatchlistSection theme={theme}>
                    <SectionHeader>
                        <SectionTitle theme={theme}>
                            <Star size={22} />
                            Watched Stocks
                        </SectionTitle>
                    </SectionHeader>

                    <Toolbar>
                        <SearchWrapper>
                            <SearchIconStyled theme={theme} />
                            <SearchInput
                                theme={theme}
                                type="text"
                                placeholder="Search stocks..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </SearchWrapper>

                        <Select theme={theme} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="symbol">Sort by Symbol</option>
                            <option value="name">Sort by Name</option>
                            <option value="price">Sort by Price</option>
                            <option value="change">Sort by Change</option>
                        </Select>

                        <Select theme={theme} value={filterBy} onChange={e => setFilterBy(e.target.value)}>
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
                                    <Th theme={theme}>Symbol</Th>
                                    <Th theme={theme}>Price</Th>
                                    <Th theme={theme}>Change</Th>
                                    <Th theme={theme}>Trend</Th>
                                    <Th theme={theme}>Alert</Th>
                                    <Th theme={theme}></Th>
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
                                        <Tr theme={theme} key={symbol} onClick={() => handleRowClick(symbol)}>
                                            <Td theme={theme}>
                                                <SymbolCell>
                                                    <SymbolIcon theme={theme} $crypto={crypto}>
                                                        {crypto ? <Bitcoin size={18} /> : symbol.substring(0, 2)}
                                                    </SymbolIcon>
                                                    <SymbolInfo>
                                                        <SymbolName theme={theme}>
                                                            {symbol}
                                                            {positive ? 
                                                                <Star size={14} color={theme.success || '#10b981'} /> : 
                                                                <Flame size={14} color={theme.error || '#ef4444'} />
                                                            }
                                                            <TypeBadge theme={theme} $crypto={crypto}>
                                                                {crypto ? <Coins size={10} /> : <BarChart3 size={10} />}
                                                                {crypto ? 'Crypto' : 'Stock'}
                                                            </TypeBadge>
                                                        </SymbolName>
                                                        <SymbolCompany theme={theme}>{displayName}</SymbolCompany>
                                                    </SymbolInfo>
                                                </SymbolCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <PriceCell theme={theme}>{formatPrice(price, symbol)}</PriceCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <ChangeCell>
                                                    <ChangeValue theme={theme} $positive={positive}>
                                                        {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                        ${Math.abs(change).toFixed(2)}
                                                    </ChangeValue>
                                                    <ChangePercent theme={theme} $positive={positive}>
                                                        {positive ? '+' : ''}{changePercent.toFixed(2)}%
                                                    </ChangePercent>
                                                </ChangeCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <SparklineCell>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={stock.chartData || []}>
                                                            <defs>
                                                                <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor={positive ? theme.success || '#10b981' : theme.error || '#ef4444'} stopOpacity={0.3} />
                                                                    <stop offset="100%" stopColor={positive ? theme.success || '#10b981' : theme.error || '#ef4444'} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <Area 
                                                                type="monotone" 
                                                                dataKey="value" 
                                                                stroke={positive ? theme.success || '#10b981' : theme.error || '#ef4444'} 
                                                                strokeWidth={2}
                                                                fill={`url(#gradient-${symbol})`}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </SparklineCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <AlertCell>
                                                    {(() => {
                                                        const alertCount = getAlertCountForSymbol(symbol);
                                                        return (
                                                            <AlertBadge
                                                                theme={theme}
                                                                $active={alertCount > 0}
                                                                onClick={e => handleSetAlert(stock, e)}
                                                            >
                                                                {alertCount > 0 ? <Bell size={12} /> : <BellOff size={12} />}
                                                                {alertCount > 0
                                                                    ? <>Alerts <AlertBadgeCount theme={theme}>{alertCount}</AlertBadgeCount></>
                                                                    : 'Set Alert'
                                                                }
                                                            </AlertBadge>
                                                        );
                                                    })()}
                                                </AlertCell>
                                            </Td>
                                            <Td theme={theme}>
                                                <ActionCell>
                                                    <SmallButton theme={theme} $danger onClick={e => handleRemoveStock(symbol, e)}>
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
                    <ModalContent theme={theme} onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle theme={theme}>Add to Watchlist</ModalTitle>
                            <CloseButton theme={theme} onClick={() => setShowAddModal(false)}>
                                <X size={18} />
                            </CloseButton>
                        </ModalHeader>
                        <Form onSubmit={handleAddStock}>
                            <FormGroup>
                                <Label theme={theme}>Symbol (Stock or Crypto)</Label>
                                <Input
                                    theme={theme}
                                    type="text"
                                    placeholder="AAPL, TSLA, BTC, ETH..."
                                    value={formData.symbol}
                                    onChange={e => setFormData({ symbol: e.target.value.toUpperCase() })}
                                    required
                                    autoFocus
                                />
                                <HelpText theme={theme}>
                                    Enter any stock ticker (AAPL, NVDA) or crypto symbol (BTC, ETH, SOL)
                                </HelpText>
                            </FormGroup>
                            <SubmitButton theme={theme} type="submit">Add to Watchlist</SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}

            {/* Alert Modal */}
            {showAlertModal && selectedStock && (
                <Modal onClick={() => setShowAlertModal(false)}>
                    <ModalContent theme={theme} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <ModalHeader>
                            <ModalTitle theme={theme}>Set Alert for {selectedStock.symbol}</ModalTitle>
                            <CloseButton theme={theme} onClick={() => setShowAlertModal(false)}>
                                <X size={18} />
                            </CloseButton>
                        </ModalHeader>

                        {/* Tabs */}
                        <ModalTabs theme={theme}>
                            <Tab
                                theme={theme}
                                $active={alertTab === 'price'}
                                onClick={() => setAlertTab('price')}
                            >
                                <Target size={16} />
                                Price Alert
                            </Tab>
                            <Tab
                                theme={theme}
                                $active={alertTab === 'technical'}
                                onClick={() => setAlertTab('technical')}
                            >
                                <Activity size={16} />
                                Technical Alert
                            </Tab>
                        </ModalTabs>

                        <Form onSubmit={handleSubmitAlert}>
                            {/* Price Alert Tab */}
                            {alertTab === 'price' && (
                                <>
                                    <FormGroup>
                                        <Label theme={theme}>Alert Condition</Label>
                                        <ModalSelect
                                            theme={theme}
                                            value={alertFormData.condition}
                                            onChange={e => setAlertFormData({ ...alertFormData, condition: e.target.value })}
                                        >
                                            <option value="above">Price goes above</option>
                                            <option value="below">Price goes below</option>
                                        </ModalSelect>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label theme={theme}>Target Price</Label>
                                        <Input
                                            theme={theme}
                                            type="number"
                                            step="0.01"
                                            placeholder="150.00"
                                            value={alertFormData.targetPrice}
                                            onChange={e => setAlertFormData({ ...alertFormData, targetPrice: e.target.value })}
                                            required
                                        />
                                        <HelpText theme={theme}>
                                            Current price: {formatPrice(selectedStock.currentPrice || selectedStock.price || 0, selectedStock.symbol)}
                                        </HelpText>
                                    </FormGroup>
                                </>
                            )}

                            {/* Technical Alert Tab */}
                            {alertTab === 'technical' && (
                                <>
                                    <FormGroup>
                                        <Label theme={theme}>Select Alert Type</Label>
                                        <TechnicalTypeGrid>
                                            {technicalAlertTypes.map(type => (
                                                <TechnicalTypeCard
                                                    key={type.value}
                                                    theme={theme}
                                                    $selected={technicalAlertType === type.value}
                                                    onClick={() => {
                                                        setTechnicalAlertType(type.value);
                                                        // Set default RSI threshold based on type
                                                        if (type.value === 'rsi_oversold') {
                                                            setTechnicalParams(p => ({ ...p, rsiThreshold: 30 }));
                                                        } else if (type.value === 'rsi_overbought') {
                                                            setTechnicalParams(p => ({ ...p, rsiThreshold: 70 }));
                                                        }
                                                    }}
                                                >
                                                    <TechnicalTypeName theme={theme}>
                                                        <span>{type.icon}</span>
                                                        {type.label}
                                                    </TechnicalTypeName>
                                                    <TechnicalTypeDesc theme={theme}>{type.description}</TechnicalTypeDesc>
                                                </TechnicalTypeCard>
                                            ))}
                                        </TechnicalTypeGrid>
                                    </FormGroup>

                                    {/* RSI Parameters */}
                                    {(technicalAlertType === 'rsi_oversold' || technicalAlertType === 'rsi_overbought') && (
                                        <FormGroup>
                                            <Label theme={theme}>RSI Threshold</Label>
                                            <Input
                                                theme={theme}
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={technicalParams.rsiThreshold}
                                                onChange={e => setTechnicalParams({ ...technicalParams, rsiThreshold: e.target.value })}
                                            />
                                            <HelpText theme={theme}>
                                                {technicalAlertType === 'rsi_oversold'
                                                    ? 'Alert when RSI drops below this value (default: 30)'
                                                    : 'Alert when RSI rises above this value (default: 70)'}
                                            </HelpText>
                                        </FormGroup>
                                    )}

                                    {/* Support Level Parameters */}
                                    {technicalAlertType === 'support_test' && (
                                        <>
                                            <FormGroup>
                                                <Label theme={theme}>Support Level ($)</Label>
                                                <Input
                                                    theme={theme}
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter support price"
                                                    value={technicalParams.supportLevel}
                                                    onChange={e => setTechnicalParams({ ...technicalParams, supportLevel: e.target.value })}
                                                    required
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label theme={theme}>Tolerance (%)</Label>
                                                <Input
                                                    theme={theme}
                                                    type="number"
                                                    min="0.5"
                                                    max="10"
                                                    step="0.5"
                                                    value={technicalParams.tolerance}
                                                    onChange={e => setTechnicalParams({ ...technicalParams, tolerance: e.target.value })}
                                                />
                                                <HelpText theme={theme}>
                                                    Alert triggers within this % of the support level
                                                </HelpText>
                                            </FormGroup>
                                        </>
                                    )}

                                    {/* Resistance Level Parameters */}
                                    {technicalAlertType === 'resistance_test' && (
                                        <>
                                            <FormGroup>
                                                <Label theme={theme}>Resistance Level ($)</Label>
                                                <Input
                                                    theme={theme}
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Enter resistance price"
                                                    value={technicalParams.resistanceLevel}
                                                    onChange={e => setTechnicalParams({ ...technicalParams, resistanceLevel: e.target.value })}
                                                    required
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label theme={theme}>Tolerance (%)</Label>
                                                <Input
                                                    theme={theme}
                                                    type="number"
                                                    min="0.5"
                                                    max="10"
                                                    step="0.5"
                                                    value={technicalParams.tolerance}
                                                    onChange={e => setTechnicalParams({ ...technicalParams, tolerance: e.target.value })}
                                                />
                                                <HelpText theme={theme}>
                                                    Alert triggers within this % of the resistance level
                                                </HelpText>
                                            </FormGroup>
                                        </>
                                    )}

                                    {/* Info for MACD/Bollinger */}
                                    {(technicalAlertType.includes('macd') || technicalAlertType.includes('bollinger')) && (
                                        <HelpText theme={theme} style={{ marginBottom: '1rem' }}>
                                            This alert will trigger automatically when the indicator condition is met. No additional parameters needed.
                                        </HelpText>
                                    )}
                                </>
                            )}

                            <SubmitButton theme={theme} type="submit" disabled={creatingAlert || (alertTab === 'technical' && !technicalAlertType)}>
                                {creatingAlert ? 'Creating...' : 'Create Alert'}
                            </SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
};

export default WatchlistPage;