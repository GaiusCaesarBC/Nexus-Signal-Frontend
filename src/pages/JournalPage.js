// client/src/pages/JournalPage.js - THEMED TRADING JOURNAL

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import {
    BookOpen, Plus, Edit2, Trash2, Search, Filter, Calendar,
    TrendingUp, TrendingDown, DollarSign, Percent, Target, Clock,
    CheckCircle, XCircle, AlertCircle, BarChart3, PieChart, Eye,
    Download, Share2, Copy, X, ChevronLeft, ChevronRight, Heart,
    Frown, Meh, Smile, Zap, Award, Activity, Save, ArrowUpDown,
    SortAsc, SortDesc, Star, Sparkles, Brain, MessageSquare
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    Area, AreaChart
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

const bounceIn = keyframes`
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 100px;
    background: transparent;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
    z-index: 1;
`;

const BackgroundOrbs = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: ${float} ${props => props.$duration || '20s'} ease-in-out infinite;
    
    &:nth-child(1) {
        width: 400px;
        height: 400px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.primary || '#00adef'}66 0%, transparent 70%)`};
        top: 10%;
        left: -100px;
    }
    
    &:nth-child(2) {
        width: 300px;
        height: 300px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.accent || '#8b5cf6'}66 0%, transparent 70%)`};
        top: 50%;
        right: -50px;
        animation-delay: -5s;
    }
    
    &:nth-child(3) {
        width: 350px;
        height: 350px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.success || '#10b981'}4D 0%, transparent 70%)`};
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

const Header = styled.div`
    max-width: 1600px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
    position: relative;
    z-index: 1;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
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
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}33 0%, ${theme.success || '#00ff88'}33 100%)`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}66`};
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    animation: ${glow} 3s ease-in-out infinite;
`;

// ============ TABS ============
const TabsContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    border-bottom: 2px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    overflow-x: auto;
    position: relative;
    z-index: 1;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        border-radius: 2px;
    }
`;

const Tab = styled.button`
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : 'transparent'};
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : theme.text?.secondary || '#94a3b8'};
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

// ============ CONTROLS ============
const ControlsContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    position: relative;
    z-index: 1;
`;

const SearchBar = styled.div`
    flex: 1;
    max-width: 400px;
    position: relative;

    @media (max-width: 768px) {
        max-width: 100%;
    }
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.brand?.primary || '#00adef'};
        box-shadow: ${({ theme }) => `0 0 0 3px ${theme.brand?.primary || '#00adef'}33`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    pointer-events: none;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const PrimaryButton = styled.button`
    padding: 1rem 1.5rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${({ theme }) => `0 10px 30px ${theme.brand?.primary || '#00adef'}66`};
    }
`;

const SecondaryButton = styled(PrimaryButton)`
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};

    &::before {
        display: none;
    }

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    }
`;

// ============ STATS SECTION ============
const StatsContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    position: relative;
    z-index: 1;
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 1.5rem;
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
        background: ${({ $type, theme }) => {
            if ($type === 'success') return `linear-gradient(90deg, ${theme.success || '#10b981'}, ${theme.success || '#059669'})`;
            if ($type === 'danger') return `linear-gradient(90deg, ${theme.error || '#ef4444'}, ${theme.error || '#dc2626'})`;
            if ($type === 'warning') return `linear-gradient(90deg, ${theme.warning || '#f59e0b'}, ${theme.warning || '#d97706'})`;
            return `linear-gradient(90deg, ${theme.brand?.primary || '#00adef'}, ${theme.brand?.accent || '#0088cc'})`;
        }};
    }

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${({ theme }) => `0 10px 30px ${theme.brand?.primary || '#00adef'}4D`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    background: ${({ $type, theme }) => {
        if ($type === 'success') return `${theme.success || '#10b981'}33`;
        if ($type === 'danger') return `${theme.error || '#ef4444'}33`;
        if ($type === 'warning') return `${theme.warning || '#f59e0b'}33`;
        return `${theme.brand?.primary || '#00adef'}33`;
    }};
    color: ${({ $type, theme }) => {
        if ($type === 'success') return theme.success || '#10b981';
        if ($type === 'danger') return theme.error || '#ef4444';
        if ($type === 'warning') return theme.warning || '#f59e0b';
        return theme.brand?.primary || '#00adef';
    }};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatLabel = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${({ $type, theme }) => {
        if ($type === 'success') return theme.success || '#10b981';
        if ($type === 'danger') return theme.error || '#ef4444';
        if ($type === 'warning') return theme.warning || '#f59e0b';
        return theme.brand?.primary || '#00adef';
    }};
`;

// ============ TRADES LIST ============
const TradesContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const TradesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const TradeCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        background: ${({ $profit, theme }) => $profit >= 0 ? theme.success || '#10b981' : theme.error || '#ef4444'};
    }

    &:hover {
        transform: translateX(10px);
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        box-shadow: ${({ theme }) => `0 10px 30px ${theme.brand?.primary || '#00adef'}4D`};
    }
`;

const TradeHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const TradeInfo = styled.div`
    flex: 1;
`;

const TradeSymbol = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const TradeType = styled.span`
    padding: 0.25rem 0.75rem;
    background: ${({ $type, theme }) => $type === 'long' ? 
        `${theme.success || '#10b981'}33` : 
        `${theme.error || '#ef4444'}33`
    };
    border: 1px solid ${({ $type, theme }) => $type === 'long' ? 
        `${theme.success || '#10b981'}4D` : 
        `${theme.error || '#ef4444'}4D`
    };
    border-radius: 12px;
    color: ${({ $type, theme }) => $type === 'long' ? theme.success || '#10b981' : theme.error || '#ef4444'};
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
`;

const TradeDate = styled.div`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TradeActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
        transform: scale(1.1);
    }
`;

const TradeMetrics = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const MetricLabel = styled.span`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.85rem;
`;

const MetricValue = styled.span`
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-weight: 700;
    font-size: 1rem;
`;

const ProfitLoss = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: ${({ $profit, theme }) => $profit >= 0 ? 
        `${theme.success || '#10b981'}33` : 
        `${theme.error || '#ef4444'}33`
    };
    border: 1px solid ${({ $profit, theme }) => $profit >= 0 ? 
        `${theme.success || '#10b981'}4D` : 
        `${theme.error || '#ef4444'}4D`
    };
    border-radius: 12px;
    color: ${({ $profit, theme }) => $profit >= 0 ? theme.success || '#10b981' : theme.error || '#ef4444'};
    font-weight: 900;
    font-size: 1.2rem;
`;

const TradeNotes = styled.div`
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const NotesLabel = styled.div`
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const NotesText = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    line-height: 1.6;
    margin: 0;
`;

const EmotionIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    border-radius: 12px;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    font-weight: 600;
`;

// ============ MODAL ============
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 2rem;
    animation: ${fadeIn} 0.3s ease-out;
    overflow-y: auto;
`;

const ModalContent = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'};
    border: 2px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${bounceIn} 0.5s ease-out;
    position: relative;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        border-radius: 4px;
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ theme }) => `${theme.error || '#ef4444'}33`};
    border: 1px solid ${({ theme }) => `${theme.error || '#ef4444'}4D`};
    color: ${({ theme }) => theme.error || '#ef4444'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.error || '#ef4444'}4D`};
        transform: scale(1.1);
    }
`;

const ModalTitle = styled.h2`
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 2rem;
    padding-right: 3rem;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    padding: 0.875rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.brand?.primary || '#00adef'};
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const Select = styled.select`
    padding: 0.875rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.brand?.primary || '#00adef'};
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    }

    option {
        background: ${({ theme }) => theme.bg?.page || '#1a1f3a'};
        color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    }
`;

const TextArea = styled.textarea`
    padding: 0.875rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    resize: vertical;
    min-height: 120px;
    font-family: inherit;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.brand?.primary || '#00adef'};
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    }

    &::placeholder {
        color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    }
`;

const EmotionSelector = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const EmotionButton = styled.button`
    flex: 1;
    min-width: 100px;
    padding: 1rem;
    background: ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#00adef'}4D` : 
        `${theme.brand?.primary || '#00adef'}1A`
    };
    border: 1px solid ${({ $active, theme }) => $active ? 
        `${theme.brand?.primary || '#00adef'}80` : 
        `${theme.brand?.primary || '#00adef'}4D`
    };
    border-radius: 12px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : theme.text?.secondary || '#94a3b8'};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

const ModalActions = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

// ============ ANALYTICS SECTION ============
const AnalyticsContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    position: relative;
    z-index: 1;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const ChartCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const ChartTitle = styled.h3`
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}33 0%, ${theme.brand?.primary || '#00adef'}0D 100%)`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${({ theme }) => `${theme.brand?.primary || '#00adef'}66`};
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 2rem;
`;

// ============ COMPONENT ============
const JournalPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const theme = useStyledTheme();
    const { profileThemeId } = useThemeContext();
    
    const [activeTab, setActiveTab] = useState('trades');
    const [showModal, setShowModal] = useState(false);
    const [editingTrade, setEditingTrade] = useState(null);
    const [trades, setTrades] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalTrades: 0,
        winRate: 0,
        totalProfit: 0,
        avgProfit: 0,
        bestTrade: null,
        worstTrade: null
    });

    // Form state
    const [formData, setFormData] = useState({
        symbol: '',
        type: 'long',
        entry: '',
        exit: '',
        shares: '',
        date: new Date().toISOString().split('T')[0],
        strategy: '',
        emotion: 'confident',
        notes: ''
    });

    useEffect(() => {
        const savedTrades = JSON.parse(localStorage.getItem('trades') || '[]');
        setTrades(savedTrades);
        calculateStats(savedTrades);
    }, []);

    const calculateStats = (tradesData) => {
        if (tradesData.length === 0) {
            setStats({
                totalTrades: 0,
                winRate: 0,
                totalProfit: 0,
                avgProfit: 0,
                bestTrade: null,
                worstTrade: null
            });
            return;
        }

        const totalTrades = tradesData.length;
        const winningTrades = tradesData.filter(t => t.profit >= 0).length;
        const winRate = ((winningTrades / totalTrades) * 100).toFixed(1);
        const totalProfit = tradesData.reduce((sum, t) => sum + t.profit, 0);
        const avgProfit = (totalProfit / totalTrades).toFixed(2);
        const bestTrade = tradesData.reduce((max, t) => t.profit > max.profit ? t : max, tradesData[0]);
        const worstTrade = tradesData.reduce((min, t) => t.profit < min.profit ? t : min, tradesData[0]);

        setStats({
            totalTrades,
            winRate,
            totalProfit: totalProfit.toFixed(2),
            avgProfit,
            bestTrade,
            worstTrade
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const entry = parseFloat(formData.entry);
        const exit = parseFloat(formData.exit);
        const shares = parseFloat(formData.shares);

        if (!formData.symbol || !entry || !exit || !shares) {
            toast.warning('Please fill in all required fields', 'Missing Information');
            return;
        }

        const profit = formData.type === 'long' 
            ? (exit - entry) * shares 
            : (entry - exit) * shares;

        const profitPercent = formData.type === 'long'
            ? ((exit - entry) / entry) * 100
            : ((entry - exit) / entry) * 100;

        const newTrade = {
            id: editingTrade ? editingTrade.id : Date.now(),
            ...formData,
            entry: parseFloat(formData.entry),
            exit: parseFloat(formData.exit),
            shares: parseFloat(formData.shares),
            profit: parseFloat(profit.toFixed(2)),
            profitPercent: parseFloat(profitPercent.toFixed(2)),
            timestamp: editingTrade ? editingTrade.timestamp : new Date().toISOString()
        };

        let updatedTrades;
        if (editingTrade) {
            updatedTrades = trades.map(t => t.id === editingTrade.id ? newTrade : t);
            toast.success('Trade updated successfully', 'Updated');
        } else {
            updatedTrades = [newTrade, ...trades];
            toast.success('Trade logged successfully', 'Added');
        }

        setTrades(updatedTrades);
        localStorage.setItem('trades', JSON.stringify(updatedTrades));
        calculateStats(updatedTrades);
        
        setShowModal(false);
        setEditingTrade(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            symbol: '',
            type: 'long',
            entry: '',
            exit: '',
            shares: '',
            date: new Date().toISOString().split('T')[0],
            strategy: '',
            emotion: 'confident',
            notes: ''
        });
    };

    const handleEdit = (trade) => {
        setEditingTrade(trade);
        setFormData({
            symbol: trade.symbol,
            type: trade.type,
            entry: trade.entry.toString(),
            exit: trade.exit.toString(),
            shares: trade.shares.toString(),
            date: trade.date,
            strategy: trade.strategy,
            emotion: trade.emotion,
            notes: trade.notes
        });
        setShowModal(true);
    };

    const handleDelete = (tradeId) => {
        const updatedTrades = trades.filter(t => t.id !== tradeId);
        setTrades(updatedTrades);
        localStorage.setItem('trades', JSON.stringify(updatedTrades));
        calculateStats(updatedTrades);
        toast.success('Trade deleted', 'Deleted');
    };

    const filteredTrades = trades.filter(trade =>
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.strategy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getEmotionIcon = (emotion) => {
        switch (emotion) {
            case 'confident': return <Smile size={20} />;
            case 'nervous': return <Frown size={20} />;
            case 'neutral': return <Meh size={20} />;
            case 'excited': return <Zap size={20} />;
            default: return <Meh size={20} />;
        }
    };

    // Generate chart data
    const profitChartData = trades
        .slice(0, 10)
        .reverse()
        .map((trade, index) => ({
            name: trade.symbol,
            profit: trade.profit,
            index: index + 1
        }));

    const winLossData = [
        { name: 'Wins', value: trades.filter(t => t.profit >= 0).length, color: theme?.success || '#10b981' },
        { name: 'Losses', value: trades.filter(t => t.profit < 0).length, color: theme?.error || '#ef4444' }
    ];

    const emotionData = [
        { name: 'Confident', value: trades.filter(t => t.emotion === 'confident').length },
        { name: 'Nervous', value: trades.filter(t => t.emotion === 'nervous').length },
        { name: 'Neutral', value: trades.filter(t => t.emotion === 'neutral').length },
        { name: 'Excited', value: trades.filter(t => t.emotion === 'excited').length }
    ];

    // Theme-aware chart colors
    const chartPrimaryColor = theme?.brand?.primary || '#00adef';
    const chartAccentColor = theme?.brand?.accent || '#8b5cf6';
    const chartBgColor = theme?.bg?.card || 'rgba(15, 23, 42, 0.95)';
    const chartTextColor = theme?.text?.secondary || '#94a3b8';

    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <Header>
                <Title>
                    <TitleIcon>
                        <BookOpen size={56} color={theme?.brand?.primary || '#00adef'} />
                    </TitleIcon>
                    Trading Journal
                </Title>
                <Subtitle>Track, analyze, and improve your trading performance</Subtitle>
                <PoweredBy>
                    <Brain size={18} />
                    Performance Analytics
                </PoweredBy>
            </Header>

            {/* Tabs */}
            <TabsContainer>
                <Tab 
                    $active={activeTab === 'trades'}
                    onClick={() => setActiveTab('trades')}
                >
                    <BookOpen size={18} />
                    Trades
                </Tab>
                <Tab 
                    $active={activeTab === 'analytics'}
                    onClick={() => setActiveTab('analytics')}
                >
                    <BarChart3 size={18} />
                    Analytics
                </Tab>
            </TabsContainer>

            {/* Controls */}
            <ControlsContainer>
                <SearchBar>
                    <SearchIcon size={20} />
                    <SearchInput
                        type="text"
                        placeholder="Search trades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchBar>

                <ButtonGroup>
                    <SecondaryButton onClick={() => {
                        const csv = generateCSV(trades);
                        downloadCSV(csv, 'trading-journal.csv');
                        toast.success('Journal exported successfully', 'Exported');
                    }}>
                        <Download size={18} />
                        Export
                    </SecondaryButton>
                    <PrimaryButton onClick={() => {
                        setEditingTrade(null);
                        resetForm();
                        setShowModal(true);
                    }}>
                        <Plus size={18} />
                        New Trade
                    </PrimaryButton>
                </ButtonGroup>
            </ControlsContainer>

            {/* Stats */}
            {trades.length > 0 && (
                <StatsContainer>
                    <StatCard>
                        <StatIcon>
                            <Activity size={24} />
                        </StatIcon>
                        <StatLabel>Total Trades</StatLabel>
                        <StatValue>{stats.totalTrades}</StatValue>
                    </StatCard>

                    <StatCard $type="success">
                        <StatIcon $type="success">
                            <Award size={24} />
                        </StatIcon>
                        <StatLabel>Win Rate</StatLabel>
                        <StatValue $type="success">{stats.winRate}%</StatValue>
                    </StatCard>

                    <StatCard $type={stats.totalProfit >= 0 ? 'success' : 'danger'}>
                        <StatIcon $type={stats.totalProfit >= 0 ? 'success' : 'danger'}>
                            <DollarSign size={24} />
                        </StatIcon>
                        <StatLabel>Total P/L</StatLabel>
                        <StatValue $type={stats.totalProfit >= 0 ? 'success' : 'danger'}>
                            ${stats.totalProfit}
                        </StatValue>
                    </StatCard>

                    <StatCard $type={stats.avgProfit >= 0 ? 'success' : 'danger'}>
                        <StatIcon $type={stats.avgProfit >= 0 ? 'success' : 'danger'}>
                            <Target size={24} />
                        </StatIcon>
                        <StatLabel>Avg P/L</StatLabel>
                        <StatValue $type={stats.avgProfit >= 0 ? 'success' : 'danger'}>
                            ${stats.avgProfit}
                        </StatValue>
                    </StatCard>
                </StatsContainer>
            )}

            {/* Content */}
            {activeTab === 'trades' && (
                <TradesContainer>
                    {filteredTrades.length > 0 ? (
                        <TradesList>
                            {filteredTrades.map((trade) => (
                                <TradeCard key={trade.id} $profit={trade.profit}>
                                    <TradeHeader>
                                        <TradeInfo>
                                            <TradeSymbol>
                                                {trade.symbol}
                                                <TradeType $type={trade.type}>
                                                    {trade.type === 'long' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                    {trade.type}
                                                </TradeType>
                                            </TradeSymbol>
                                            <TradeDate>
                                                <Calendar size={16} />
                                                {new Date(trade.date).toLocaleDateString()}
                                            </TradeDate>
                                        </TradeInfo>
                                        <TradeActions>
                                            <ActionButton onClick={() => handleEdit(trade)}>
                                                <Edit2 size={18} />
                                            </ActionButton>
                                            <ActionButton onClick={() => handleDelete(trade.id)}>
                                                <Trash2 size={18} />
                                            </ActionButton>
                                        </TradeActions>
                                    </TradeHeader>

                                    <TradeMetrics>
                                        <MetricItem>
                                            <MetricLabel>Entry</MetricLabel>
                                            <MetricValue>${trade.entry.toFixed(2)}</MetricValue>
                                        </MetricItem>
                                        <MetricItem>
                                            <MetricLabel>Exit</MetricLabel>
                                            <MetricValue>${trade.exit.toFixed(2)}</MetricValue>
                                        </MetricItem>
                                        <MetricItem>
                                            <MetricLabel>Shares</MetricLabel>
                                            <MetricValue>{trade.shares}</MetricValue>
                                        </MetricItem>
                                        <MetricItem>
                                            <MetricLabel>Strategy</MetricLabel>
                                            <MetricValue>{trade.strategy || 'N/A'}</MetricValue>
                                        </MetricItem>
                                    </TradeMetrics>

                                    <ProfitLoss $profit={trade.profit}>
                                        {trade.profit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                        ${Math.abs(trade.profit).toFixed(2)} ({trade.profitPercent >= 0 ? '+' : ''}{trade.profitPercent.toFixed(2)}%)
                                    </ProfitLoss>

                                    {trade.notes && (
                                        <TradeNotes>
                                            <NotesLabel>
                                                <MessageSquare size={16} />
                                                Notes
                                            </NotesLabel>
                                            <NotesText>{trade.notes}</NotesText>
                                        </TradeNotes>
                                    )}

                                    <EmotionIndicator>
                                        {getEmotionIcon(trade.emotion)}
                                        Emotion: {trade.emotion}
                                    </EmotionIndicator>
                                </TradeCard>
                            ))}
                        </TradesList>
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <BookOpen size={80} color={theme?.brand?.primary || '#00adef'} />
                            </EmptyIcon>
                            <EmptyTitle>No Trades Yet</EmptyTitle>
                            <EmptyText>
                                Start logging your trades to track your performance
                            </EmptyText>
                            <PrimaryButton onClick={() => setShowModal(true)}>
                                <Plus size={18} />
                                Log Your First Trade
                            </PrimaryButton>
                        </EmptyState>
                    )}
                </TradesContainer>
            )}

            {activeTab === 'analytics' && (
                <AnalyticsContainer>
                    {trades.length > 0 ? (
                        <>
                            <ChartCard>
                                <ChartTitle>
                                    <BarChart3 size={24} />
                                    Recent Trade Performance
                                </ChartTitle>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={profitChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${chartPrimaryColor}33`} />
                                        <XAxis dataKey="name" stroke={chartTextColor} />
                                        <YAxis stroke={chartTextColor} />
                                        <Tooltip
                                            contentStyle={{
                                                background: chartBgColor,
                                                border: `1px solid ${chartPrimaryColor}80`,
                                                borderRadius: '8px',
                                                color: theme?.text?.primary || '#e0e6ed'
                                            }}
                                            formatter={(value) => ['$' + value.toFixed(2), 'Profit/Loss']}
                                        />
                                        <Bar dataKey="profit" fill={chartPrimaryColor} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard>
                                <ChartTitle>
                                    <PieChart size={24} />
                                    Win/Loss Distribution
                                </ChartTitle>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPie>
                                        <Pie
                                            data={winLossData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {winLossData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: chartBgColor,
                                                border: `1px solid ${chartPrimaryColor}80`,
                                                borderRadius: '8px',
                                                color: theme?.text?.primary || '#e0e6ed'
                                            }}
                                        />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard>
                                <ChartTitle>
                                    <Activity size={24} />
                                    Emotional State Analysis
                                </ChartTitle>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={emotionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${chartPrimaryColor}33`} />
                                        <XAxis dataKey="name" stroke={chartTextColor} />
                                        <YAxis stroke={chartTextColor} />
                                        <Tooltip
                                            contentStyle={{
                                                background: chartBgColor,
                                                border: `1px solid ${chartPrimaryColor}80`,
                                                borderRadius: '8px',
                                                color: theme?.text?.primary || '#e0e6ed'
                                            }}
                                        />
                                        <Bar dataKey="value" fill={chartAccentColor} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard>
                                <ChartTitle>
                                    <TrendingUp size={24} />
                                    Cumulative P/L
                                </ChartTitle>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={trades.slice(0, 20).reverse().map((trade, index) => ({
                                        name: `Trade ${index + 1}`,
                                        cumulative: trades.slice(0, index + 1).reduce((sum, t) => sum + t.profit, 0)
                                    }))}>
                                        <defs>
                                            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartPrimaryColor} stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor={chartPrimaryColor} stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={`${chartPrimaryColor}33`} />
                                        <XAxis dataKey="name" stroke={chartTextColor} />
                                        <YAxis stroke={chartTextColor} />
                                        <Tooltip
                                            contentStyle={{
                                                background: chartBgColor,
                                                border: `1px solid ${chartPrimaryColor}80`,
                                                borderRadius: '8px',
                                                color: theme?.text?.primary || '#e0e6ed'
                                            }}
                                            formatter={(value) => ['$' + value.toFixed(2), 'Cumulative P/L']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="cumulative"
                                            stroke={chartPrimaryColor}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorCumulative)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </>
                    ) : (
                        <EmptyState style={{ gridColumn: '1 / -1' }}>
                            <EmptyIcon>
                                <BarChart3 size={80} color={theme?.brand?.primary || '#00adef'} />
                            </EmptyIcon>
                            <EmptyTitle>No Analytics Yet</EmptyTitle>
                            <EmptyText>
                                Log some trades to see your performance analytics
                            </EmptyText>
                        </EmptyState>
                    )}
                </AnalyticsContainer>
            )}

            {/* Modal */}
            {showModal && (
                <ModalOverlay onClick={() => setShowModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowModal(false)}>
                            <X size={20} />
                        </CloseButton>

                        <ModalTitle>{editingTrade ? 'Edit Trade' : 'Log New Trade'}</ModalTitle>

                        <form onSubmit={handleSubmit}>
                            <FormGrid>
                                <FormField>
                                    <Label>
                                        <Target size={16} />
                                        Symbol *
                                    </Label>
                                    <Input
                                        type="text"
                                        name="symbol"
                                        placeholder="e.g., AAPL"
                                        value={formData.symbol}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </FormField>

                                <FormField>
                                    <Label>
                                        <ArrowUpDown size={16} />
                                        Type *
                                    </Label>
                                    <Select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="long">Long</option>
                                        <option value="short">Short</option>
                                    </Select>
                                </FormField>

                                <FormField>
                                    <Label>
                                        <DollarSign size={16} />
                                        Entry Price *
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        name="entry"
                                        placeholder="0.00"
                                        value={formData.entry}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </FormField>

                                <FormField>
                                    <Label>
                                        <DollarSign size={16} />
                                        Exit Price *
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        name="exit"
                                        placeholder="0.00"
                                        value={formData.exit}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </FormField>

                                <FormField>
                                    <Label>
                                        <Activity size={16} />
                                        Shares *
                                    </Label>
                                    <Input
                                        type="number"
                                        name="shares"
                                        placeholder="100"
                                        value={formData.shares}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </FormField>

                                <FormField>
                                    <Label>
                                        <Calendar size={16} />
                                        Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </FormField>
                            </FormGrid>

                            <FormField style={{ marginBottom: '1.5rem' }}>
                                <Label>
                                    <Target size={16} />
                                    Strategy
                                </Label>
                                <Input
                                    type="text"
                                    name="strategy"
                                    placeholder="e.g., Breakout, Swing Trade, Day Trade"
                                    value={formData.strategy}
                                    onChange={handleInputChange}
                                />
                            </FormField>

                            <FormField style={{ marginBottom: '1.5rem' }}>
                                <Label>
                                    <Heart size={16} />
                                    Emotional State
                                </Label>
                                <EmotionSelector>
                                    <EmotionButton
                                        type="button"
                                        $active={formData.emotion === 'confident'}
                                        onClick={() => setFormData(prev => ({ ...prev, emotion: 'confident' }))}
                                    >
                                        <Smile size={24} />
                                        Confident
                                    </EmotionButton>
                                    <EmotionButton
                                        type="button"
                                        $active={formData.emotion === 'nervous'}
                                        onClick={() => setFormData(prev => ({ ...prev, emotion: 'nervous' }))}
                                    >
                                        <Frown size={24} />
                                        Nervous
                                    </EmotionButton>
                                    <EmotionButton
                                        type="button"
                                        $active={formData.emotion === 'neutral'}
                                        onClick={() => setFormData(prev => ({ ...prev, emotion: 'neutral' }))}
                                    >
                                        <Meh size={24} />
                                        Neutral
                                    </EmotionButton>
                                    <EmotionButton
                                        type="button"
                                        $active={formData.emotion === 'excited'}
                                        onClick={() => setFormData(prev => ({ ...prev, emotion: 'excited' }))}
                                    >
                                        <Zap size={24} />
                                        Excited
                                    </EmotionButton>
                                </EmotionSelector>
                            </FormField>

                            <FormField style={{ marginBottom: '1.5rem' }}>
                                <Label>
                                    <MessageSquare size={16} />
                                    Notes
                                </Label>
                                <TextArea
                                    name="notes"
                                    placeholder="What was your reasoning? What did you learn?"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                />
                            </FormField>

                            <ModalActions>
                                <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton type="submit">
                                    <Save size={18} />
                                    {editingTrade ? 'Update Trade' : 'Save Trade'}
                                </PrimaryButton>
                            </ModalActions>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

// Helper functions
const generateCSV = (trades) => {
    const headers = ['Date', 'Symbol', 'Type', 'Entry', 'Exit', 'Shares', 'Profit', 'Profit %', 'Strategy', 'Emotion', 'Notes'];
    const rows = trades.map(trade => [
        trade.date,
        trade.symbol,
        trade.type,
        trade.entry,
        trade.exit,
        trade.shares,
        trade.profit,
        trade.profitPercent,
        trade.strategy,
        trade.emotion,
        trade.notes
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
};

export default JournalPage;