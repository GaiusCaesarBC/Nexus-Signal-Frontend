// client/src/pages/PortfolioPage.js - COMPLETE WITH AUTO-REFRESH, HISTORY, AI INSIGHTS

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
    Activity, Plus, Trash2, X, Brain, Target, Zap, 
    ArrowUpRight, ArrowDownRight, Eye, Flame, Star,
    GripVertical, CheckSquare, Square, Download, RefreshCw,
    Search, Filter, SortAsc, Edit, Copy, Trash
} from 'lucide-react';
import {
    PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart, Line
} from 'recharts';

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
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.6); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const flash = keyframes`
    0% { background-color: transparent; }
    50% { background-color: rgba(16, 185, 129, 0.3); }
    100% { background-color: transparent; }
`;

const flashRed = keyframes`
    0% { background-color: transparent; }
    50% { background-color: rgba(239, 68, 68, 0.3); }
    100% { background-color: transparent; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 6rem 2rem 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    text-shadow: 0 0 30px rgba(0, 173, 237, 0.5);

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const HeaderRight = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;
        flex-wrap: wrap;
    }
`;

// ============ TOOLBAR ============
const Toolbar = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    align-items: center;
`;

const SearchBar = styled.div`
    flex: 1;
    min-width: 300px;
    position: relative;

    @media (max-width: 768px) {
        min-width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
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

const SearchIcon = styled(Search)`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #00adef;
`;

const ToolbarButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%)' :
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    ${props => props.$danger && `
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #ef4444;

        &:hover {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.5);
        }
    `}
`;

const Select = styled.select`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-weight: 600;
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

// ============ BATCH ACTIONS BAR ============
const BatchActionsBar = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    animation: ${slideIn} 0.3s ease-out;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;

const BatchInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #a78bfa;
    font-weight: 600;
`;

const BatchActions = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        animation: ${props => props.$refreshing ? css`${rotate} 1s linear infinite` : 'none'};
    }
`;

const AddButton = styled.button`
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
    transition: all 0.3s ease;
    z-index: 100;
    animation: ${float} 3s ease-in-out infinite;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 12px 48px rgba(16, 185, 129, 0.6);
    }

    @media (max-width: 768px) {
        bottom: 1rem;
        right: 1rem;
    }
`;

// ============ HISTORY PANEL ============
const HistoryPanel = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const HistoryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const PeriodSelector = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const PeriodButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.2) 100%)' : 
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 8px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
    }
`;

// ============ AI INSIGHTS PANEL ============
const InsightsPanel = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const InsightsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const InsightsTitle = styled.h2`
    font-size: 1.8rem;
    color: #a78bfa;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const InsightsBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => {
        if (props.$type === 'good') return 'rgba(16, 185, 129, 0.2)';
        if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.2)';
        if (props.$type === 'danger') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(139, 92, 246, 0.2)';
    }};
    border: 1px solid ${props => {
        if (props.$type === 'good') return 'rgba(16, 185, 129, 0.4)';
        if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.4)';
        if (props.$type === 'danger') return 'rgba(239, 68, 68, 0.4)';
        return 'rgba(139, 92, 246, 0.4)';
    }};
    border-radius: 12px;
    color: ${props => {
        if (props.$type === 'good') return '#10b981';
        if (props.$type === 'warning') return '#f59e0b';
        if (props.$type === 'danger') return '#ef4444';
        return '#a78bfa';
    }};
    font-size: 0.9rem;
    font-weight: 700;
`;

// ============ STATS GRID ============
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.6s ease-out;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${props => {
            if (props.variant === 'success') return 'linear-gradient(90deg, #10b981, #059669)';
            if (props.variant === 'danger') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            return 'linear-gradient(90deg, #00adef, #0088cc)';
        }};
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    background: ${props => {
        if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        return '#00adef';
    }};
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${props => {
        if (props.positive) return '#10b981';
        if (props.negative) return '#ef4444';
        return '#00adef';
    }};
    margin-bottom: 0.5rem;
    
    ${props => props.$flashing && props.positive && css`
        animation: ${flash} 0.5s ease-out;
    `}
    
    ${props => props.$flashing && props.negative && css`
        animation: ${flashRed} 0.5s ease-out;
    `}
`;

const StatSubtext = styled.div`
    font-size: 0.9rem;
    color: ${props => props.positive ? '#10b981' : props.negative ? '#ef4444' : '#94a3b8'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============ HOLDINGS GRID ============
const HoldingsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const HoldingCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.5s ease-out;
    transition: all 0.3s ease;
    user-select: none;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${props => props.positive ? 
            'linear-gradient(90deg, #10b981, #059669)' : 
            'linear-gradient(90deg, #ef4444, #dc2626)'
        };
    }

    ${props => props.$isDragging && `
        opacity: 0.5;
        transform: rotate(5deg);
    `}

    ${props => props.$selected && `
        border-color: rgba(139, 92, 246, 0.5);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    `}
`;

const DragHandle = styled.div`
    position: absolute;
    left: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    cursor: grab;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
        color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    &:active {
        cursor: grabbing;
    }
`;

const HoldingHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1.5rem;
    padding-left: 2rem;
`;

const HoldingSymbolSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SelectCheckbox = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 2px solid ${props => props.$checked ? '#8b5cf6' : 'rgba(0, 173, 237, 0.3)'};
    background: ${props => props.$checked ? '#8b5cf6' : 'transparent'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #8b5cf6;
        transform: scale(1.1);
    }
`;

const HoldingSymbol = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const IconButton = styled.button`
    background: ${props => props.variant === 'danger' ? 
        'rgba(239, 68, 68, 0.1)' : 
        'rgba(0, 173, 237, 0.1)'
    };
    border: 1px solid ${props => props.variant === 'danger' ? 
        'rgba(239, 68, 68, 0.3)' : 
        'rgba(0, 173, 237, 0.3)'
    };
    color: ${props => props.variant === 'danger' ? '#ef4444' : '#00adef'};
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.variant === 'danger' ? 
            'rgba(239, 68, 68, 0.2)' : 
            'rgba(0, 173, 237, 0.2)'
        };
        transform: scale(1.1);
    }
`;

const HoldingStats = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const StatItem = styled.div``;

const StatItemLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const StatItemValue = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 1.1rem;
`;

const PerformanceBar = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: ${props => props.positive ? 
        'rgba(16, 185, 129, 0.1)' : 
        'rgba(239, 68, 68, 0.1)'
    };
    border: 1px solid ${props => props.positive ? 
        'rgba(16, 185, 129, 0.3)' : 
        'rgba(239, 68, 68, 0.3)'
    };
    border-radius: 12px;
    margin-bottom: 1rem;
`;

const PerformanceIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.positive ? 
        'rgba(16, 185, 129, 0.2)' : 
        'rgba(239, 68, 68, 0.2)'
    };
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const PerformanceDetails = styled.div`
    flex: 1;
`;

const PerformanceValue = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const PerformancePercent = styled.div`
    font-size: 0.9rem;
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

// ============ AI PREDICTION BADGE ============
const PredictionBadge = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 12px;
    padding: 1rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }
`;

const PredictionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
`;

const PredictionText = styled.div`
    font-size: 0.9rem;
    color: #a78bfa;
    position: relative;
    z-index: 1;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 6px;
    background: rgba(0, 173, 237, 0.2);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 0.5rem;
    position: relative;
    z-index: 1;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.value || 0}%;
    background: linear-gradient(90deg, #10b981, #00adef);
    border-radius: 3px;
    transition: width 1s ease-out;
`;

// ============ CHARTS SECTION ============
const ChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ChartPanel = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const ChartTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============ COMPARISON MODE ============
const ComparisonPanel = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${slideIn} 0.3s ease-out;
`;

const ComparisonTitle = styled.h3`
    color: #a78bfa;
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ComparisonGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
`;

const ComparisonCard = styled.div`
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
`;

const ComparisonSymbol = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: #a78bfa;
    margin-bottom: 0.5rem;
`;

const ComparisonStat = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const ComparisonValue = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.positive ? '#10b981' : props.negative ? '#ef4444' : '#e0e6ed'};
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
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    position: relative;
    animation: ${slideIn} 0.3s ease-out;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalTitle = styled.h2`
    color: #00adef;
    margin-bottom: 2rem;
    font-size: 1.8rem;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: scale(1.1);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
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

const SubmitButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(0, 173, 237, 0.3);
`;

const COLORS = ['#00adef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PortfolioPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    
    // Portfolio data
    const [portfolio, setPortfolio] = useState([]);
    const [holdings, setHoldings] = useState([]);
    const [filteredPortfolio, setFilteredPortfolio] = useState([]);
    const [stats, setStats] = useState(null);
    const [totalValue, setTotalValue] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [totalGainLoss, setTotalGainLoss] = useState(0);
    const [totalGainLossPercent, setTotalGainLossPercent] = useState(0);
    
    // UI state
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedHolding, setSelectedHolding] = useState(null);
    const [selectedHoldings, setSelectedHoldings] = useState(new Set());
    const [showComparison, setShowComparison] = useState(false);
    
    // NEW: Auto-refresh, history, insights
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [priceChanges, setPriceChanges] = useState({});
    const [portfolioHistory, setPortfolioHistory] = useState([]);
    const [historyPeriod, setHistoryPeriod] = useState(7);
    const [aiInsights, setAiInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    
    // Predictions
    const [predictions, setPredictions] = useState({});
    const [loadingPredictions, setLoadingPredictions] = useState({});
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('symbol');
    const [filterBy, setFilterBy] = useState('all');
    
    // Form data
    const [formData, setFormData] = useState({
        symbol: '',
        shares: '',
        averagePrice: ''
    });
    
    const [newHolding, setNewHolding] = useState({
        symbol: '',
        type: 'stock',
        shares: '',
        avgPrice: '',
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchPortfolio();
    }, []);

    useEffect(() => {
        filterAndSortPortfolio();
    }, [portfolio, searchQuery, sortBy, filterBy]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh || portfolio.length === 0) return;
        
        const interval = setInterval(() => {
            console.log('[Auto-Refresh] Refreshing portfolio data...');
            handleAutoRefresh();
        }, 30000); // 30 seconds
        
        return () => clearInterval(interval);
    }, [autoRefresh, portfolio.length]);

    // History fetching effect
    useEffect(() => {
        if (portfolio.length > 0) {
            fetchPortfolioHistory(historyPeriod);
        }
    }, [historyPeriod, portfolio.length]);

    // AI Insights effect
    useEffect(() => {
        if (portfolio.length > 0 && stats) {
            fetchAIInsights();
        }
    }, [portfolio.length]);

    const fetchPortfolio = async () => {
    try {
        setLoading(true);
        const response = await api.get('/portfolio');
        
        console.log('📊 Portfolio API Response:', response.data);
        
        // ✅ FIX: Data is nested under 'portfolio'
        const portfolioData = response.data.portfolio || response.data;
        const holdingsData = portfolioData.holdings || [];
        
        console.log('📊 Holdings:', holdingsData);
        
        // ✅ SET BOTH STATES!
        setHoldings(holdingsData);
        setPortfolio(holdingsData);  // ← ADD THIS LINE!
        
        // ✅ Also set the other stats
        setTotalValue(portfolioData.totalValue || 0);
        setTotalCost(portfolioData.totalInvested || 0);
        setTotalGainLoss(portfolioData.totalChange || 0);
        setTotalGainLossPercent(portfolioData.totalChangePercent || 0);
        
        // Calculate stats
        if (holdingsData.length > 0) {
            calculateStats(holdingsData);
        }
        
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        toast.error('Failed to load portfolio');
    } finally {
        setLoading(false);
    }
};
    const handleAutoRefresh = async () => {
        try {
            const response = await api.get('/portfolio');
            
            if (response.data.holdings && response.data.holdings.length > 0) {
                // Track price changes for flash animation
                const changes = {};
                response.data.holdings.forEach(newHolding => {
                    const oldHolding = portfolio.find(h => h.symbol === newHolding.symbol);
                    if (oldHolding) {
                        const oldPrice = oldHolding.currentPrice || 0;
                        const newPrice = newHolding.currentPrice || 0;
                        if (oldPrice !== newPrice) {
                            changes[newHolding.symbol] = {
                                increased: newPrice > oldPrice,
                                amount: newPrice - oldPrice
                            };
                        }
                    }
                });
                
                setPriceChanges(changes);
                setPortfolio(response.data.holdings);
                setHoldings(response.data.holdings);
                setTotalValue(response.data.totalValue || 0);
                setTotalCost(response.data.totalCost || 0);
                setTotalGainLoss(response.data.totalGainLoss || 0);
                setTotalGainLossPercent(response.data.totalGainLossPercent || 0);
                
                calculateStats(response.data.holdings);
                
                // Save snapshot for history
                await api.post('/portfolio/snapshot', {
                    totalValue: response.data.totalValue || 0,
                    totalGainLoss: response.data.totalGainLoss || 0,
                    totalGainLossPercent: response.data.totalGainLossPercent || 0
                });
                
                // Clear flash after animation
                setTimeout(() => setPriceChanges({}), 500);
            }
        } catch (error) {
            console.error('Auto-refresh error:', error);
        }
    };

    const fetchPortfolioHistory = async (days = 7) => {
        try {
            const response = await api.get(`/portfolio/history/${days}`);
            setPortfolioHistory(response.data.history || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const fetchAIInsights = async () => {
        if (portfolio.length === 0) return;
        
        setLoadingInsights(true);
        try {
            const response = await api.post('/portfolio/insights', {
                holdings: portfolio,
                totalValue: stats?.totalValue || 0,
                totalGainLoss: stats?.totalGain || 0,
                totalGainLossPercent: stats?.totalGainPercent || 0
            });
            
            setAiInsights(response.data);
            
            if (response.data.available) {
                toast.success('AI insights generated!', 'Analysis Complete');
            }
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            toast.error('Failed to generate insights', 'Error');
        } finally {
            setLoadingInsights(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchPortfolio();
        setTimeout(() => setRefreshing(false), 500);
        toast.success('Portfolio refreshed!', 'Updated');
    };

    const fetchPrediction = async (symbol) => {
        if (!symbol) return;
        
        setLoadingPredictions(prev => ({ ...prev, [symbol]: true }));
        try {
            const response = await api.post('/predictions/predict', {
                symbol: symbol.toUpperCase(),
                days: 7
            });
            setPredictions(prev => ({ ...prev, [symbol]: response.data }));
        } catch (error) {
            console.error(`Error fetching prediction for ${symbol}:`, error);
        } finally {
            setLoadingPredictions(prev => ({ ...prev, [symbol]: false }));
        }
    };

    const filterAndSortPortfolio = () => {
        let filtered = [...portfolio];

        if (searchQuery) {
            filtered = filtered.filter(holding => {
                const symbol = (holding.symbol || '').toLowerCase();
                const query = searchQuery.toLowerCase();
                return symbol.includes(query);
            });
        }

        if (filterBy === 'gainers') {
            filtered = filtered.filter(h => {
                const currentPrice = h.currentPrice || h.current_price || h.price || 0;
                const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || currentPrice;
                return currentPrice > avgPrice;
            });
        } else if (filterBy === 'losers') {
            filtered = filtered.filter(h => {
                const currentPrice = h.currentPrice || h.current_price || h.price || 0;
                const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || currentPrice;
                return currentPrice < avgPrice;
            });
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'symbol':
                    return (a.symbol || '').localeCompare(b.symbol || '');
                case 'value':
                    const aValue = (a.currentPrice || 0) * (a.shares || 0);
                    const bValue = (b.currentPrice || 0) * (b.shares || 0);
                    return bValue - aValue;
                case 'gain':
                    const aGain = ((a.currentPrice || 0) - (a.averagePrice || 0)) * (a.shares || 0);
                    const bGain = ((b.currentPrice || 0) - (b.averagePrice || 0)) * (b.shares || 0);
                    return bGain - aGain;
                default:
                    return 0;
            }
        });

        setFilteredPortfolio(filtered);
    };

    const calculateStats = (holdings) => {
        if (!holdings || holdings.length === 0) {
            setStats(null);
            return;
        }

        const totalValue = holdings.reduce((sum, h) => {
            const price = h.currentPrice || h.current_price || h.price || 0;
            const shares = h.shares || h.quantity || 0;
            return sum + (price * shares);
        }, 0);

        const totalCost = holdings.reduce((sum, h) => {
            const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || h.price || 0;
            const shares = h.shares || h.quantity || 0;
            return sum + (avgPrice * shares);
        }, 0);

        const totalGain = totalValue - totalCost;
        const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

        setStats({
            totalValue,
            totalCost,
            totalGain,
            totalGainPercent,
            holdingsCount: holdings.length
        });
    };

    const addHolding = async (e) => {
        e.preventDefault();
        
        if (!formData.symbol || !formData.shares || !formData.averagePrice) {
            toast.warning('Please fill in all fields', 'Missing Information');
            return;
        }

        try {
            await api.post('/portfolio/holdings', {
                symbol: formData.symbol.toUpperCase(),
                shares: parseFloat(formData.shares),
                averagePrice: parseFloat(formData.averagePrice),
                purchaseDate: new Date().toISOString().split('T')[0]
            });

            toast.success(`${formData.symbol.toUpperCase()} added to portfolio`, 'Success');
            setShowAddModal(false);
            setFormData({ symbol: '', shares: '', averagePrice: '' });
            
            await fetchPortfolio();
        } catch (error) {
            console.error('Error adding holding:', error);
            toast.error(error.response?.data?.error || 'Failed to add holding', 'Error');
        }
    };

    const handleEditHolding = (holding) => {
        setSelectedHolding(holding);
        setFormData({
            symbol: holding.symbol || '',
            shares: holding.shares || '',
            averagePrice: holding.averagePrice || holding.average_price || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateHolding = async (e) => {
        e.preventDefault();
        
        const shares = parseFloat(formData.shares);
        const avgPrice = parseFloat(formData.averagePrice);
        
        if (shares <= 0 || avgPrice <= 0) {
            toast.warning('Invalid values', 'Error');
            return;
        }

        try {
            await api.put(`/portfolio/holdings/${selectedHolding._id}`, {
                shares,
                averagePrice: avgPrice
            });
            
            toast.success(`${selectedHolding.symbol} updated!`, 'Holding Updated');
            setShowEditModal(false);
            setSelectedHolding(null);
            fetchPortfolio();
        } catch (error) {
            console.error('Error updating holding:', error);
            toast.error('Failed to update holding', 'Error');
        }
    };

    const deleteHolding = async (holdingId) => {
        if (!window.confirm('Are you sure you want to remove this holding?')) {
            return;
        }

        try {
            await api.delete(`/portfolio/holdings/${holdingId}`);
            toast.success('Holding removed from portfolio', 'Deleted');
            fetchPortfolio();
        } catch (error) {
            console.error('Error deleting holding:', error);
            toast.error('Failed to delete holding', 'Error');
        }
    };

    const toggleSelectHolding = (symbol) => {
        setSelectedHoldings(prev => {
            const newSet = new Set(prev);
            if (newSet.has(symbol)) {
                newSet.delete(symbol);
            } else {
                newSet.add(symbol);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedHoldings.size === filteredPortfolio.length) {
            setSelectedHoldings(new Set());
        } else {
            setSelectedHoldings(new Set(filteredPortfolio.map(h => h.symbol || h.ticker)));
        }
    };

    const handleBatchDelete = async () => {
        if (selectedHoldings.size === 0) return;
        
        if (!window.confirm(`Delete ${selectedHoldings.size} holdings from portfolio?`)) return;

        try {
            const holdingsToDelete = portfolio.filter(h => selectedHoldings.has(h.symbol || h.ticker));
            
            await Promise.all(
                holdingsToDelete.map(h => api.delete(`/portfolio/holdings/${h._id}`))
            );
            
            toast.success(`${selectedHoldings.size} holdings removed`, 'Batch Delete Complete');
            setSelectedHoldings(new Set());
            fetchPortfolio();
        } catch (error) {
            console.error('Error batch deleting:', error);
            toast.error('Failed to delete some holdings', 'Error');
        }
    };

    const handleExportCSV = () => {
        const csv = [
            ['Symbol', 'Shares', 'Avg Price', 'Current Price', 'Total Value', 'Gain/Loss', 'Gain %'].join(','),
            ...filteredPortfolio.map(h => {
                const currentPrice = h.currentPrice || h.current_price || h.price || 0;
                const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || currentPrice;
                const shares = h.shares || h.quantity || 0;
                const totalValue = currentPrice * shares;
                const totalCost = avgPrice * shares;
                const gain = totalValue - totalCost;
                const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
                
                return [
                    h.symbol || '',
                    shares,
                    avgPrice.toFixed(2),
                    currentPrice.toFixed(2),
                    totalValue.toFixed(2),
                    gain.toFixed(2),
                    gainPercent.toFixed(2)
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        toast.success('Portfolio exported!', 'CSV Downloaded');
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(filteredPortfolio);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFilteredPortfolio(items);
        setPortfolio(items);
        
        toast.success('Order saved!', 'Reordered');
    };

    const toggleComparison = () => {
        if (selectedHoldings.size < 2) {
            toast.warning('Select at least 2 holdings to compare', 'Need More Holdings');
            return;
        }
        setShowComparison(!showComparison);
    };

    const getComparisonData = () => {
        return portfolio
            .filter(h => selectedHoldings.has(h.symbol || h.ticker))
            .map(h => {
                const currentPrice = h.currentPrice || h.current_price || h.price || 0;
                const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || currentPrice;
                const shares = h.shares || h.quantity || 0;
                const totalValue = currentPrice * shares;
                const totalCost = avgPrice * shares;
                const gain = totalValue - totalCost;
                const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;

                return {
                    symbol: h.symbol || h.ticker || 'Unknown',
                    totalValue,
                    gain,
                    gainPercent,
                    shares
                };
            });
    };

    const getPieData = () => {
        return portfolio.map(h => {
            const price = h.currentPrice || h.current_price || h.price || 0;
            const shares = h.shares || h.quantity || 0;
            return {
                name: h.symbol || h.ticker || 'Unknown',
                value: price * shares
            };
        }).filter(d => d.value > 0);
    };

    const getPerformanceData = () => {
        return portfolio
            .map(h => {
                const currentPrice = h.currentPrice || h.current_price || h.price || 0;
                const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || currentPrice;
                const gain = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
                
                return {
                    symbol: h.symbol || h.ticker || 'Unknown',
                    gain: gain
                };
            })
            .sort((a, b) => b.gain - a.gain);
    };

    if (loading) {
        return (
            <PageContainer>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <Activity size={64} color="#00adef" />
                    <h2 style={{ marginTop: '1rem', color: '#00adef' }}>Loading Portfolio...</h2>
                </div>
            </PageContainer>
        );
    }

    if (!portfolio || portfolio.length === 0) {
        return (
            <PageContainer>
                <Header>
                    <HeaderTop>
                        <HeaderLeft>
                            <Title>My Portfolio</Title>
                            <Subtitle>Track your investments with AI-powered insights</Subtitle>
                        </HeaderLeft>
                    </HeaderTop>
                </Header>
                <EmptyState>
                    <EmptyIcon>
                        <PieChart size={64} color="#00adef" />
                    </EmptyIcon>
                    <h2 style={{ color: '#00adef', marginBottom: '0.5rem' }}>Your portfolio is empty</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Add your first holding to start tracking</p>
                </EmptyState>
                <AddButton onClick={() => setShowAddModal(true)}>
                    <Plus size={28} />
                </AddButton>

                {showAddModal && (
                    <Modal onClick={() => setShowAddModal(false)}>
                        <ModalContent onClick={(e) => e.stopPropagation()}>
                            <CloseButton onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </CloseButton>
                            <ModalTitle>Add New Holding</ModalTitle>
                            <Form onSubmit={addHolding}>
                                <FormGroup>
                                    <Label>Stock Symbol</Label>
                                    <Input
                                        type="text"
                                        placeholder="AAPL"
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                        required
                                        autoFocus
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Number of Shares</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="10"
                                        value={formData.shares}
                                        onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Average Purchase Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="150.00"
                                        value={formData.averagePrice}
                                        onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                                <SubmitButton type="submit">Add Holding</SubmitButton>
                            </Form>
                        </ModalContent>
                    </Modal>
                )}
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <HeaderTop>
                    <HeaderLeft>
                        <Title>My Portfolio</Title>
                        <Subtitle>
                            AI-powered tracking • {filteredPortfolio.length} of {portfolio.length} holdings
                            {autoRefresh && ' • Auto-refresh ON'}
                        </Subtitle>
                    </HeaderLeft>
                    <HeaderRight>
                        <RefreshButton onClick={handleRefresh} disabled={refreshing} $refreshing={refreshing}>
                            <RefreshCw size={18} />
                            Refresh
                        </RefreshButton>
                        <ToolbarButton onClick={handleExportCSV}>
                            <Download size={18} />
                            Export CSV
                        </ToolbarButton>
                    </HeaderRight>
                </HeaderTop>

                <Toolbar>
                    <SearchBar>
                        <SearchIcon size={20} />
                        <SearchInput
                            type="text"
                            placeholder="Search holdings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchBar>

                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="symbol">Sort by Symbol</option>
                        <option value="value">Sort by Value</option>
                        <option value="gain">Sort by Gain</option>
                    </Select>

                    <Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                        <option value="all">All Holdings</option>
                        <option value="gainers">Gainers Only</option>
                        <option value="losers">Losers Only</option>
                    </Select>

                    <ToolbarButton onClick={handleSelectAll}>
                        {selectedHoldings.size === filteredPortfolio.length ? <CheckSquare size={18} /> : <Square size={18} />}
                        Select All
                    </ToolbarButton>

                    {selectedHoldings.size >= 2 && (
                        <ToolbarButton $active={showComparison} onClick={toggleComparison}>
                            <BarChart3 size={18} />
                            Compare ({selectedHoldings.size})
                        </ToolbarButton>
                    )}
                </Toolbar>
            </Header>

            {selectedHoldings.size > 0 && (
                <BatchActionsBar>
                    <BatchInfo>
                        <CheckSquare size={20} />
                        {selectedHoldings.size} selected
                    </BatchInfo>
                    <BatchActions>
                        <ToolbarButton $danger onClick={handleBatchDelete}>
                            <Trash size={18} />
                            Delete Selected
                        </ToolbarButton>
                        <ToolbarButton onClick={() => setSelectedHoldings(new Set())}>
                            <X size={18} />
                            Clear Selection
                        </ToolbarButton>
                    </BatchActions>
                </BatchActionsBar>
            )}

            {showComparison && selectedHoldings.size >= 2 && (
                <ComparisonPanel>
                    <ComparisonTitle>
                        <BarChart3 size={24} />
                        Comparing {selectedHoldings.size} Holdings
                    </ComparisonTitle>
                    <ComparisonGrid>
                        {getComparisonData().map(data => (
                            <ComparisonCard key={data.symbol}>
                                <ComparisonSymbol>{data.symbol}</ComparisonSymbol>
                                <ComparisonStat>Total Value</ComparisonStat>
                                <ComparisonValue>${data.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</ComparisonValue>
                                <ComparisonStat style={{ marginTop: '1rem' }}>Gain/Loss</ComparisonStat>
                                <ComparisonValue positive={data.gain >= 0} negative={data.gain < 0}>
                                    {data.gain >= 0 ? '+' : ''}${Math.abs(data.gain).toFixed(2)}
                                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                        ({data.gain >= 0 ? '+' : ''}{data.gainPercent.toFixed(2)}%)
                                    </div>
                                </ComparisonValue>
                                <ComparisonStat style={{ marginTop: '1rem' }}>Shares</ComparisonStat>
                                <ComparisonValue>{data.shares}</ComparisonValue>
                            </ComparisonCard>
                        ))}
                    </ComparisonGrid>
                </ComparisonPanel>
            )}

            {/* PERFORMANCE HISTORY CHART */}
            {portfolioHistory.length > 0 && (
                <HistoryPanel>
                    <HistoryHeader>
                        <ChartTitle>
                            <Activity size={24} />
                            Portfolio Performance
                        </ChartTitle>
                        <PeriodSelector>
                            <PeriodButton 
                                $active={historyPeriod === 7}
                                onClick={() => setHistoryPeriod(7)}
                            >
                                7D
                            </PeriodButton>
                            <PeriodButton 
                                $active={historyPeriod === 30}
                                onClick={() => setHistoryPeriod(30)}
                            >
                                30D
                            </PeriodButton>
                            <PeriodButton 
                                $active={historyPeriod === 90}
                                onClick={() => setHistoryPeriod(90)}
                            >
                                90D
                            </PeriodButton>
                        </PeriodSelector>
                    </HistoryHeader>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={portfolioHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#94a3b8"
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis 
                                stroke="#94a3b8"
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Value']}
                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                contentStyle={{ 
                                    background: '#1e293b', 
                                    border: '1px solid rgba(0, 173, 237, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="totalValue" 
                                stroke="#00adef" 
                                strokeWidth={3}
                                dot={{ fill: '#00adef', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </HistoryPanel>
            )}

            {/* AI INSIGHTS PANEL - UNAVAILABLE STATE */}
            {aiInsights && !aiInsights.available && (
                <InsightsPanel>
                    <InsightsHeader>
                        <InsightsTitle>
                            <Brain size={32} />
                            AI Portfolio Analysis
                        </InsightsTitle>
                        <InsightsBadge $type="warning">
                            <Zap size={16} />
                            Unavailable
                        </InsightsBadge>
                    </InsightsHeader>

                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1.5rem',
                            background: 'rgba(245, 158, 11, 0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Brain size={40} color="#f59e0b" />
                        </div>
                        
                        <h3 style={{ 
                            color: '#f59e0b', 
                            fontSize: '1.5rem', 
                            marginBottom: '1rem' 
                        }}>
                            AI Insights Temporarily Unavailable
                        </h3>
                        
                        <p style={{ 
                            color: '#e0e6ed', 
                            fontSize: '1.1rem', 
                            lineHeight: '1.8',
                            marginBottom: '1.5rem' 
                        }}>
                            {aiInsights.message || 'OpenAI API quota has been exceeded'}
                        </p>
                        
                        {aiInsights.reason === 'quota_exceeded' && (
                            <div style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginTop: '1.5rem',
                                textAlign: 'left'
                            }}>
                                <h4 style={{ color: '#a78bfa', marginBottom: '1rem' }}>
                                    💡 To Enable AI Insights:
                                </h4>
                                <ul style={{ 
                                    color: '#94a3b8', 
                                    lineHeight: '2',
                                    paddingLeft: '1.5rem'
                                }}>
                                    <li>Visit <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" style={{ color: '#00adef' }}>platform.openai.com</a></li>
                                    <li>Add credits to your OpenAI account</li>
                                    <li>Refresh this page to enable AI analysis</li>
                                </ul>
                            </div>
                        )}
                        
                        <ToolbarButton 
                            onClick={fetchAIInsights} 
                            disabled={loadingInsights}
                            style={{ marginTop: '1.5rem' }}
                        >
                            {loadingInsights ? (
                                <>
                                    <RefreshCw size={18} />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    Check Again
                                </>
                            )}
                        </ToolbarButton>
                    </div>
                </InsightsPanel>
            )}

            {stats && (
                <StatsGrid>
                    <StatCard>
                        <StatIcon>
                            <DollarSign size={24} />
                        </StatIcon>
                        <StatLabel>Total Value</StatLabel>
                        <StatValue $flashing={Object.keys(priceChanges).length > 0}>
                            ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </StatValue>
                        <StatSubtext>
                            <Eye size={16} />
                            {stats.holdingsCount} Holdings
                        </StatSubtext>
                    </StatCard>

                    <StatCard variant={stats.totalGain >= 0 ? 'success' : 'danger'}>
                        <StatIcon variant={stats.totalGain >= 0 ? 'success' : 'danger'}>
                            {stats.totalGain >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                        </StatIcon>
                        <StatLabel>Total Gain/Loss</StatLabel>
                        <StatValue 
                            positive={stats.totalGain >= 0} 
                            negative={stats.totalGain < 0}
                            $flashing={Object.values(priceChanges).some(c => c.increased === (stats.totalGain >= 0))}
                        >
                            ${Math.abs(stats.totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </StatValue>
                        <StatSubtext positive={stats.totalGainPercent >= 0} negative={stats.totalGainPercent < 0}>
                            {stats.totalGainPercent >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {stats.totalGainPercent >= 0 ? '+' : ''}{stats.totalGainPercent.toFixed(2)}%
                        </StatSubtext>
                    </StatCard>

                    <StatCard>
                        <StatIcon>
                            <Target size={24} />
                        </StatIcon>
                        <StatLabel>Cost Basis</StatLabel>
                        <StatValue>
                            ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </StatValue>
                        <StatSubtext>
                            <Activity size={16} />
                            Initial Investment
                        </StatSubtext>
                    </StatCard>
                </StatsGrid>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="portfolio">
                    {(provided) => (
                        <HoldingsGrid {...provided.droppableProps} ref={provided.innerRef}>
                            {filteredPortfolio.map((holding, index) => {
                                const currentPrice = holding.currentPrice || holding.current_price || holding.price || 0;
                                const avgPrice = holding.averagePrice || holding.average_price || holding.purchasePrice || currentPrice;
                                const shares = holding.shares || holding.quantity || 0;
                                const symbol = holding.symbol || holding.ticker || 'Unknown';
                                
                                const totalValue = currentPrice * shares;
                                const totalCost = avgPrice * shares;
                                const gain = totalValue - totalCost;
                                const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
                                const positive = gain >= 0;
                                const isSelected = selectedHoldings.has(symbol);

                                const prediction = predictions[symbol];
                                const loadingPred = loadingPredictions[symbol];

                                return (
                                    <Draggable key={holding._id || symbol} draggableId={holding._id || symbol} index={index}>
                                        {(provided, snapshot) => (
                                            <HoldingCard
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                positive={positive}
                                                $isDragging={snapshot.isDragging}
                                                $selected={isSelected}
                                            >
                                                <DragHandle {...provided.dragHandleProps}>
                                                    <GripVertical size={20} />
                                                </DragHandle>

                                                <HoldingHeader>
                                                    <HoldingSymbolSection>
                                                        <SelectCheckbox
                                                            $checked={isSelected}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSelectHolding(symbol);
                                                            }}
                                                        >
                                                            {isSelected && <CheckSquare size={16} color="white" />}
                                                        </SelectCheckbox>
                                                        <HoldingSymbol>
                                                            {symbol}
                                                            {positive ? 
                                                                <Star size={20} color="#10b981" /> : 
                                                                <Flame size={20} color="#ef4444" />
                                                            }
                                                        </HoldingSymbol>
                                                    </HoldingSymbolSection>
                                                    <ActionButtons>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditHolding(holding);
                                                            }}
                                                        >
                                                            <Edit size={18} />
                                                        </IconButton>
                                                        <IconButton 
                                                            variant="danger"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteHolding(holding._id);
                                                            }}
                                                        >
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    </ActionButtons>
                                                </HoldingHeader>

                                                <HoldingStats>
                                                    <StatItem>
                                                        <StatItemLabel>Shares</StatItemLabel>
                                                        <StatItemValue>{shares}</StatItemValue>
                                                    </StatItem>
                                                    <StatItem>
                                                        <StatItemLabel>Avg Price</StatItemLabel>
                                                        <StatItemValue>${avgPrice.toFixed(2)}</StatItemValue>
                                                    </StatItem>
                                                    <StatItem>
                                                        <StatItemLabel>Current Price</StatItemLabel>
                                                        <StatItemValue>${currentPrice.toFixed(2)}</StatItemValue>
                                                    </StatItem>
                                                    <StatItem>
                                                        <StatItemLabel>Total Value</StatItemLabel>
                                                        <StatItemValue>${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</StatItemValue>
                                                    </StatItem>
                                                </HoldingStats>

                                                <PerformanceBar positive={positive}>
                                                    <PerformanceIcon positive={positive}>
                                                        {positive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    </PerformanceIcon>
                                                    <PerformanceDetails>
                                                        <PerformanceValue positive={positive}>
                                                            ${Math.abs(gain).toFixed(2)}
                                                        </PerformanceValue>
                                                        <PerformancePercent positive={positive}>
                                                            {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                                                        </PerformancePercent>
                                                    </PerformanceDetails>
                                                </PerformanceBar>

                                                <PredictionBadge>
                                                    <PredictionHeader>
                                                        <Brain size={18} color="#a78bfa" />
                                                        <strong style={{ color: '#a78bfa' }}>AI Forecast (7d)</strong>
                                                    </PredictionHeader>
                                                    <PredictionText>
                                                        {loadingPred ? (
                                                            'Analyzing...'
                                                        ) : prediction ? (
                                                            <>
                                                                <strong>${prediction.prediction?.target_price?.toFixed(2)}</strong> • {prediction.prediction?.direction} • {prediction.prediction?.confidence?.toFixed(0)}% confidence
                                                            </>
                                                        ) : (
                                                            'No prediction available'
                                                        )}
                                                    </PredictionText>
                                                    {prediction && (
                                                        <ConfidenceBar>
                                                            <ConfidenceFill value={prediction.prediction?.confidence || 0} />
                                                        </ConfidenceBar>
                                                    )}
                                                </PredictionBadge>
                                            </HoldingCard>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </HoldingsGrid>
                    )}
                </Droppable>
            </DragDropContext>

            <ChartsGrid>
                <ChartPanel>
                    <ChartTitle>
                        <PieChart size={24} />
                        Asset Allocation
                    </ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                            <Pie
                                data={getPieData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name} (${((entry.value / stats.totalValue) * 100).toFixed(1)}%)`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {getPieData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value) => `$${value.toLocaleString()}`}
                                contentStyle={{ 
                                    background: '#1e293b', 
                                    border: '1px solid rgba(0, 173, 237, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                        </RechartsPie>
                    </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel>
                    <ChartTitle>
                        <BarChart3 size={24} />
                        Performance by Stock
                    </ChartTitle>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getPerformanceData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                            <XAxis dataKey="symbol" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                formatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
                                contentStyle={{ 
                                    background: '#1e293b', 
                                    border: '1px solid rgba(0, 173, 237, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="gain" fill="#00adef">
                                {getPerformanceData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.gain >= 0 ? '#10b981' : '#ef4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartPanel>
            </ChartsGrid>

            <AddButton onClick={() => setShowAddModal(true)}>
                <Plus size={28} />
            </AddButton>

            {showAddModal && (
                <Modal onClick={() => setShowAddModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowAddModal(false)}>
                            <X size={20} />
                        </CloseButton>
                        <ModalTitle>Add New Holding</ModalTitle>
                        <Form onSubmit={addHolding}>
                            <FormGroup>
                                <Label>Stock Symbol</Label>
                                <Input
                                    type="text"
                                    placeholder="AAPL"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                    required
                                    autoFocus
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Number of Shares</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="10"
                                    value={formData.shares}
                                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Average Purchase Price</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="150.00"
                                    value={formData.averagePrice}
                                    onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <SubmitButton type="submit">Add Holding</SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}

            {showEditModal && selectedHolding && (
                <Modal onClick={() => setShowEditModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowEditModal(false)}>
                            <X size={20} />
                        </CloseButton>
                        <ModalTitle>Edit {selectedHolding.symbol}</ModalTitle>
                        <Form onSubmit={handleUpdateHolding}>
                            <FormGroup>
                                <Label>Number of Shares</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="10"
                                    value={formData.shares}
                                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Average Purchase Price</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="150.00"
                                    value={formData.averagePrice}
                                    onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <SubmitButton type="submit">Update Holding</SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
};

export default PortfolioPage;