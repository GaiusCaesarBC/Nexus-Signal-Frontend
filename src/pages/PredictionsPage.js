// client/src/pages/PredictionsPage.js - COMPLETE WITH LIVE UPDATES + PLATFORM-WIDE STATS + SAVED TAB

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import { getAssetName } from '../utils/stockNames';
import { useAuth } from '../context/AuthContext';
import {
    Brain, TrendingUp, TrendingDown, Target, Zap, Activity,
    Calendar, DollarSign, Percent, ArrowRight,
    Star, Award, Sparkles, ChevronRight, BarChart3, LineChart as LineChartIcon,
    Rocket, Trophy, ArrowUpDown, Flame, History, Share2, Download,
    X, Eye, RefreshCw, GitCompare, BookmarkPlus, Bookmark, Twitter,
    Facebook, Linkedin, Copy, Clock, Globe, Trash2, ExternalLink
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
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

const slideInRight = keyframes`
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
`;

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const bounceIn = keyframes`
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
`;

const neonGlow = keyframes`
    0%, 100% {
        text-shadow: 
            0 0 10px rgba(139, 92, 246, 0.8),
            0 0 20px rgba(139, 92, 246, 0.6),
            0 0 30px rgba(139, 92, 246, 0.4);
    }
    50% {
        text-shadow: 
            0 0 20px rgba(139, 92, 246, 1),
            0 0 40px rgba(139, 92, 246, 0.8),
            0 0 60px rgba(139, 92, 246, 0.6);
    }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const rocketLaunch = keyframes`
    0% { transform: translateY(0) rotate(-45deg); }
    100% { transform: translateY(-1000px) translateX(1000px) rotate(-45deg); }
`;

const rocketCrash = keyframes`
    0% { transform: translateY(-1000px) rotate(135deg); }
    100% { transform: translateY(100vh) translateX(-300px) rotate(135deg); }
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

const ParticleContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background: ${props => props.color};
    border-radius: 50%;
    animation: ${particles} ${props => props.duration}s linear infinite;
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    opacity: 0.6;
    filter: blur(1px);
`;

const Header = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
    position: relative;
    z-index: 1;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #00ff88 100%);
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
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
        animation: ${shake} 0.5s ease-in-out;
    }

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    margin-bottom: 1rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #a78bfa;
    animation: ${glow} 3s ease-in-out infinite;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-3px);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%);
    }
`;

const TabsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    position: relative;
    z-index: 1;
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(139, 92, 246, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 2px;
    }
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(139, 92, 246, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#a78bfa' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%);
        border-color: rgba(139, 92, 246, 0.5);
        color: #a78bfa;
        transform: translateY(-2px);
    }
`;

const StatsBanner = styled.div`
    max-width: 1200px;
    margin: 0 auto 3rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    position: relative;
    z-index: 1;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.delay}s;
    cursor: pointer;

    &:hover {
        transform: translateY(-10px) scale(1.05);
        border-color: rgba(139, 92, 246, 0.8);
        box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
    }
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    background: ${props => props.gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: #8b5cf6;
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const InputSection = styled.div`
    max-width: 800px;
    margin: 0 auto 3rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 20px;
    padding: 2.5rem;
    animation: ${fadeIn} 0.8s ease-out;
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.2);
    position: relative;
    z-index: 1;

    &:hover {
        border-color: rgba(139, 92, 246, 0.5);
        box-shadow: 0 15px 50px rgba(139, 92, 246, 0.3);
    }
`;

const InputForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const InputGroup = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #a78bfa;
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    padding: 1rem 1.25rem;
    background: rgba(139, 92, 246, 0.05);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    text-transform: uppercase;

    &:focus {
        outline: none;
        border-color: #8b5cf6;
        background: rgba(139, 92, 246, 0.1);
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
        transform: scale(1.02);
    }

    &::placeholder {
        color: #64748b;
        text-transform: none;
    }
`;

const Select = styled.select`
    padding: 1rem 1.25rem;
    background: rgba(139, 92, 246, 0.05);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #8b5cf6;
        background: rgba(139, 92, 246, 0.1);
        box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
        transform: scale(1.02);
    }

    option {
        background: #1e293b;
        color: #e0e6ed;
    }
`;

const PredictButton = styled.button`
    flex: 1;
    padding: 1.25rem 2rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
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

    &:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 15px 40px rgba(139, 92, 246, 0.5);
    }

    &:active:not(:disabled) {
        transform: translateY(-1px) scale(0.98);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        animation: ${pulse} 1.5s ease-in-out infinite;
    }
`;

const LoadingSpinner = styled(Sparkles)`
    animation: ${spin} 1s linear infinite;
`;

const ResultsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    animation: ${bounceIn} 0.6s ease-out;
    position: relative;
    z-index: 1;
`;

const PredictionCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(139, 92, 246, 0.4);
    border-radius: 20px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }
`;

const PredictionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
    }
`;

const StockInfo = styled.div`
    animation: ${slideIn} 0.6s ease-out;
`;

const StockSymbol = styled.h2`
    font-size: 3rem;
    font-weight: 900;
    color: #8b5cf6;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: ${neonGlow} 2s ease-in-out infinite;
`;

const CompanyName = styled.div`
    color: #94a3b8;
    font-size: 1rem;
    margin-top: 0.25rem;
    font-weight: 500;
`;

const CurrentPriceSection = styled.div`
    display: flex;
    align-items: baseline;
    gap: 1rem;
`;

const CurrentPriceLabel = styled.span`
    color: #94a3b8;
    font-size: 1rem;
`;

const CurrentPriceValue = styled.span`
    color: #e0e6ed;
    font-size: 1.8rem;
    font-weight: 700;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.75rem;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1rem;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 10px;
    color: #a78bfa;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.5);
        transform: translateY(-2px);
    }
`;

const DirectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: ${props => props.$up ? 
        'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)' : 
        'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)'
    };
    border: 2px solid ${props => props.$up ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
    border-radius: 16px;
    color: ${props => props.$up ? '#10b981' : '#ef4444'};
    font-size: 1.5rem;
    font-weight: 900;
    box-shadow: ${props => props.$up ? 
        '0 10px 30px rgba(16, 185, 129, 0.3)' : 
        '0 10px 30px rgba(239, 68, 68, 0.3)'
    };
    animation: ${slideInRight} 0.6s ease-out, ${pulse} 2s ease-in-out infinite 1s;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
`;

const MetricCard = styled.div`
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$index * 0.1}s;

    &:hover {
        transform: translateY(-5px) scale(1.03);
        border-color: rgba(139, 92, 246, 0.6);
        box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    }
`;

const MetricIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => {
        if (props.$variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        if (props.$variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(139, 92, 246, 0.2)';
    }};
    color: ${props => {
        if (props.$variant === 'success') return '#10b981';
        if (props.$variant === 'danger') return '#ef4444';
        if (props.$variant === 'warning') return '#f59e0b';
        return '#a78bfa';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    transition: transform 0.3s ease;

    ${MetricCard}:hover & {
        transform: scale(1.2) rotate(360deg);
    }
`;

const MetricLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => {
        if (props.$variant === 'success') return '#10b981';
        if (props.$variant === 'danger') return '#ef4444';
        if (props.$variant === 'warning') return '#f59e0b';
        return '#a78bfa';
    }};
`;

const ConfidenceSection = styled.div`
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
`;

const ConfidenceLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const ConfidenceText = styled.span`
    color: #a78bfa;
    font-size: 1.1rem;
    font-weight: 600;
`;

const ConfidenceValue = styled.span`
    color: #10b981;
    font-size: 1.5rem;
    font-weight: 900;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 20px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(139, 92, 246, 0.3);
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$value || 0}%;
    background: linear-gradient(90deg, #10b981, #8b5cf6, #00adef);
    border-radius: 10px;
    transition: width 1.5s ease-out;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 2s linear infinite;
    }
`;

const IndicatorsSection = styled.div`
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
`;

const IndicatorsTitle = styled.h3`
    color: #a78bfa;
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const IndicatorsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
`;

const IndicatorItem = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        border-color: rgba(139, 92, 246, 0.4);
        transform: translateX(5px);
    }
`;

const IndicatorName = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const IndicatorValue = styled.span`
    color: ${props => {
        if (props.$signal === 'BUY') return '#10b981';
        if (props.$signal === 'SELL') return '#ef4444';
        return '#f59e0b';
    }};
    font-weight: 700;
    font-size: 0.95rem;
`;

const ChartSection = styled.div`
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
    margin-bottom: 2rem;

    &:hover {
        border-color: rgba(139, 92, 246, 0.6);
        box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
    }
`;

const ChartTitle = styled.h3`
    color: #a78bfa;
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
    position: relative;
    z-index: 1;
`;

const EmptyIcon = styled.div`
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed rgba(139, 92, 246, 0.4);
    animation: ${float} 3s ease-in-out infinite;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1) rotate(5deg);
        border-color: rgba(139, 92, 246, 0.8);
    }
`;

const EmptyTitle = styled.h2`
    color: #a78bfa;
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const RocketContainer = styled.div`
    position: fixed;
    ${props => props.$crash ? 'top: -100px;' : 'bottom: -100px;'}
    left: ${props => props.left}%;
    z-index: 1000;
    animation: ${props => props.$crash ? rocketCrash : rocketLaunch} 3s ease-out forwards;
    pointer-events: none;
`;

const ModalOverlay = styled.div`
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
    z-index: 2000;
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 2px solid rgba(139, 92, 246, 0.5);
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    animation: ${bounceIn} 0.5s ease-out;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const ModalTitle = styled.h3`
    color: #a78bfa;
    font-size: 1.5rem;
    font-weight: 700;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
        transform: scale(1.1);
    }
`;

const ShareOptions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const ShareOption = styled.button`
    padding: 1rem;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    color: #a78bfa;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.5);
        transform: translateY(-3px);
    }
`;

// ============ WATCHLIST STAR ============
const WatchlistStar = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50%;
    
    &:hover {
        transform: scale(1.2);
        filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.8));
    }

    &:active {
        transform: scale(0.9);
    }

    svg {
        transition: all 0.3s ease;
    }
`;

// ============ SAVED PREDICTIONS STYLED COMPONENTS ============
const SavedPredictionsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const SavedPredictionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const SavedPredictionCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(139, 92, 246, 0.6);
        box-shadow: 0 15px 40px rgba(139, 92, 246, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$up ? 
            'linear-gradient(90deg, #10b981, #059669)' : 
            'linear-gradient(90deg, #ef4444, #dc2626)'
        };
    }
`;

const SavedCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
`;

const SavedSymbol = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: #8b5cf6;
`;

const SavedDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$up ? 
        'rgba(16, 185, 129, 0.2)' : 
        'rgba(239, 68, 68, 0.2)'
    };
    border: 1px solid ${props => props.$up ? 
        'rgba(16, 185, 129, 0.4)' : 
        'rgba(239, 68, 68, 0.4)'
    };
    border-radius: 8px;
    color: ${props => props.$up ? '#10b981' : '#ef4444'};
    font-weight: 700;
    font-size: 0.9rem;
`;

const SavedCardBody = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const SavedMetric = styled.div`
    background: rgba(139, 92, 246, 0.1);
    border-radius: 8px;
    padding: 0.75rem;
`;

const SavedMetricLabel = styled.div`
    color: #94a3b8;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const SavedMetricValue = styled.div`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
`;

const SavedCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(139, 92, 246, 0.2);
`;

const SavedDate = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SavedActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const SavedActionButton = styled.button`
    padding: 0.5rem;
    background: ${props => props.$danger ? 
        'rgba(239, 68, 68, 0.1)' : 
        'rgba(139, 92, 246, 0.1)'
    };
    border: 1px solid ${props => props.$danger ? 
        'rgba(239, 68, 68, 0.3)' : 
        'rgba(139, 92, 246, 0.3)'
    };
    border-radius: 8px;
    color: ${props => props.$danger ? '#ef4444' : '#a78bfa'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? 
            'rgba(239, 68, 68, 0.2)' : 
            'rgba(139, 92, 246, 0.2)'
        };
        transform: scale(1.1);
    }
`;

const ClearAllButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #ef4444;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    margin-bottom: 2rem;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
    }
`;

// ============ COMPONENT ============
const PredictionsPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate(); 
    const [activeTab, setActiveTab] = useState('predict');
    const [symbol, setSymbol] = useState('');
    const [days, setDays] = useState('7');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [showRocket, setShowRocket] = useState(false);
    const [particles, setParticles] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [savedPredictions, setSavedPredictions] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    // ✅ PLATFORM-WIDE STATS (not per-user)
    const [platformStats, setPlatformStats] = useState({
        accuracy: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        loading: true
    });

    // ✅ Fetch platform-wide stats
    useEffect(() => {
        const fetchPlatformStats = async () => {
            try {
                const response = await api.get('/predictions/platform-stats');
                
                if (response.data.success) {
                    setPlatformStats({
                        accuracy: response.data.accuracy || 0,
                        totalPredictions: response.data.totalPredictions || 0,
                        correctPredictions: response.data.correctPredictions || 0,
                        loading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching platform stats:', error);
                setPlatformStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchPlatformStats();
        const interval = setInterval(fetchPlatformStats, 30000);
        return () => clearInterval(interval);
    }, [api]);

    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: ['#8b5cf6', '#00adef', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)]
        }));
        setParticles(newParticles);

        // Load saved predictions from localStorage
        const saved = JSON.parse(localStorage.getItem('savedPredictions') || '[]');
        setSavedPredictions(saved);

        // Fetch user's watchlist
        const fetchWatchlist = async () => {
            try {
                const response = await api.get('/watchlist');
                if (response.data && Array.isArray(response.data)) {
                    setWatchlist(response.data.map(item => 
                        typeof item === 'string' ? item : item.symbol
                    ));
                }
            } catch (error) {
                console.error('Error fetching watchlist:', error);
            }
        };
        fetchWatchlist();
    }, [api]);

    // 🚀 AGGRESSIVE POLLING with Pro APIs for live prediction data
    useEffect(() => {
        const predId = prediction?._id || prediction?.predictionId;
        if (!predId) return;

        let currentInterval = null;

        const fetchLiveData = async () => {
            try {
                console.log('🔍 Fetching live data for:', predId);
                const response = await api.get(`/predictions/live/${predId}`);
                const data = response.data.prediction;
                setLiveData(data);
                console.log('📊 Live data updated:', data);
                return data.timeRemaining;
            } catch (error) {
                console.error('Error fetching live data:', error);
                return null;
            }
        };

        fetchLiveData();

        const startPolling = () => {
            const updateInterval = async () => {
                const timeRemaining = await fetchLiveData();
                
                if (timeRemaining) {
                    const hoursRemaining = timeRemaining / (1000 * 60 * 60);
                    
                    if (currentInterval) {
                        clearInterval(currentInterval);
                    }
                    
                    if (hoursRemaining < 0.25) {
                        console.log('⚡ FINAL MINUTES MODE: 3-second updates');
                        currentInterval = setInterval(fetchLiveData, 3000);
                    } else if (hoursRemaining < 1) {
                        console.log('🏃 LAST HOUR MODE: 5-second updates');
                        currentInterval = setInterval(fetchLiveData, 5000);
                    } else if (hoursRemaining < 6) {
                        console.log('⚡ ACTIVE MODE: 10-second updates');
                        currentInterval = setInterval(fetchLiveData, 10000);
                    } else {
                        console.log('🚀 NORMAL MODE: 15-second updates');
                        currentInterval = setInterval(fetchLiveData, 15000);
                    }
                }
            };

            currentInterval = setInterval(updateInterval, 15000);
            updateInterval();
        };

        startPolling();

        return () => {
            if (currentInterval) {
                clearInterval(currentInterval);
            }
        };
    }, [prediction?._id, prediction?.predictionId, api]);

    const formatTimeRemaining = (ms) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const fetchPrediction = async (e) => {
        e.preventDefault();
        
        if (!symbol) {
            toast.warning('Please enter a stock or crypto symbol', 'Missing Symbol');
            return;
        }

        setLoading(true);
        setPrediction(null);
        setLiveData(null);
        
        try {
            const response = await api.post('/predictions/predict', {
                symbol: symbol.toUpperCase(),
                days: parseInt(days)
            });
            
            console.log('Prediction response:', response.data);

            const chartData = generateChartData(
                response.data.current_price,
                response.data.prediction.target_price,
                parseInt(days)
            );

            const predictionData = {
                ...response.data,
                chartData,
                indicators: response.data.indicators,
                timestamp: new Date().toISOString()
            };

            setPrediction(predictionData);
            toast.success(`Prediction generated for ${symbol.toUpperCase()}`, 'Success');

            const isGoingUp = response.data.prediction.direction === 'UP';
            setShowRocket(isGoingUp ? 'up' : 'down');
            setTimeout(() => setShowRocket(false), 3000);
            
        } catch (error) {
            console.error('Error fetching prediction:', error);
            toast.error(error.response?.data?.error || 'Failed to generate prediction', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = (currentPrice, targetPrice, days) => {
        const data = [];
        const priceChange = targetPrice - currentPrice;
        
        for (let i = 0; i <= days; i++) {
            const progress = i / days;
            const noise = (Math.random() - 0.5) * (currentPrice * 0.02);
            const price = currentPrice + (priceChange * progress) + noise;
            
            data.push({
                day: i === 0 ? 'Today' : `Day ${i}`,
                price: parseFloat(price.toFixed(2)),
                target: i === days ? parseFloat(targetPrice.toFixed(2)) : null
            });
        }
        
        return data;
    };

    // ⭐ WATCHLIST TOGGLE HANDLER
    const handleWatchlistToggle = async (symbolToToggle) => {
        if (!symbolToToggle) return;
        
        const symbol = symbolToToggle.toUpperCase();
        const isInWatchlist = watchlist.includes(symbol);

        try {
            if (isInWatchlist) {
                // Remove from watchlist
                await api.delete(`/watchlist/${symbol}`);
                setWatchlist(prev => prev.filter(s => s !== symbol));
                toast.success(`${symbol} removed from watchlist`, 'Removed');
            } else {
                // Add to watchlist
                await api.post('/watchlist', { symbol });
                setWatchlist(prev => [...prev, symbol]);
                toast.success(`${symbol} added to watchlist!`, 'Added to Watchlist');
            }
        } catch (error) {
            console.error('Error toggling watchlist:', error);
            toast.error(error.response?.data?.error || 'Failed to update watchlist', 'Error');
        }
    };

    const handleSavePrediction = () => {
        if (!prediction) return;

        // Check if already saved
        const alreadySaved = savedPredictions.some(p => 
            p.symbol === prediction.symbol && 
            p.prediction?.target_price === prediction.prediction?.target_price
        );

        if (alreadySaved) {
            toast.warning('This prediction is already saved!', 'Already Saved');
            return;
        }

        const saved = [...savedPredictions, {
            id: Date.now(),
            ...prediction,
            savedAt: new Date().toISOString()
        }];

        setSavedPredictions(saved);
        localStorage.setItem('savedPredictions', JSON.stringify(saved));
        toast.success('Prediction saved successfully!', 'Saved');
    };

    const handleDeleteSavedPrediction = (id) => {
        const updated = savedPredictions.filter(p => p.id !== id);
        setSavedPredictions(updated);
        localStorage.setItem('savedPredictions', JSON.stringify(updated));
        toast.success('Prediction removed', 'Deleted');
    };

    const handleClearAllSaved = () => {
        if (window.confirm('Are you sure you want to clear all saved predictions?')) {
            setSavedPredictions([]);
            localStorage.removeItem('savedPredictions');
            toast.success('All saved predictions cleared', 'Cleared');
        }
    };

    const handleViewSavedPrediction = (saved) => {
        setPrediction(saved);
        setActiveTab('predict');
        toast.info(`Viewing saved prediction for ${saved.symbol}`, 'Loaded');
    };

    const handleShare = (platform) => {
        if (!prediction) return;

        const text = `Check out this AI prediction: ${prediction.symbol} ${prediction.prediction.direction} to $${prediction.prediction.target_price.toFixed(2)} (${prediction.prediction.price_change_percent >= 0 ? '+' : ''}${prediction.prediction.price_change_percent.toFixed(2)}%)`;
        const url = window.location.href;

        let shareUrl = '';
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(`${text}\n${url}`);
                toast.success('Prediction copied to clipboard!', 'Copied');
                setShowShareModal(false);
                return;
            default:
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            setShowShareModal(false);
        }
    };

    const handleExport = () => {
        if (!prediction) return;

        const data = {
            symbol: prediction.symbol,
            currentPrice: prediction.current_price,
            targetPrice: prediction.prediction.target_price,
            direction: prediction.prediction.direction,
            change: prediction.prediction.price_change_percent,
            confidence: prediction.prediction.confidence,
            days: days,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${prediction.symbol}_prediction_${Date.now()}.json`;
        a.click();

        toast.success('Prediction exported successfully!', 'Exported');
    };

    const formatSavedDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <PageContainer>
            <ParticleContainer>
                {particles.map(particle => (
                    <Particle
                        key={particle.id}
                        size={particle.size}
                        left={particle.left}
                        duration={particle.duration}
                        delay={particle.delay}
                        color={particle.color}
                    />
                ))}
            </ParticleContainer>

            {showRocket && (
                <RocketContainer 
                    left={Math.random() * 80 + 10}
                    $crash={showRocket === 'down'}
                >
                    <Rocket 
                        size={64} 
                        color={showRocket === 'down' ? '#ef4444' : '#8b5cf6'} 
                    />
                </RocketContainer>
            )}

            <Header>
                <Title>
                    <TitleIcon>
                        <Brain size={56} color="#8b5cf6" />
                    </TitleIcon>
                    AI Stock & Crypto Predictor
                </Title>
                <Subtitle>Advanced machine learning powered price predictions</Subtitle>
                <PoweredBy>
                    <Sparkles size={18} />
                    Powered by Neural Networks
                </PoweredBy>
            </Header>

            <TabsContainer>
                <Tab 
                    $active={activeTab === 'predict'}
                    onClick={() => setActiveTab('predict')}
                >
                    <Zap size={18} />
                    Predict
                </Tab>
                <Tab 
                    $active={activeTab === 'saved'}
                    onClick={() => setActiveTab('saved')}
                >
                    <Bookmark size={18} />
                    Saved ({savedPredictions.length})
                </Tab>
            </TabsContainer>

            {/* ============ PREDICT TAB ============ */}
            {activeTab === 'predict' && (
                <>
                    {/* PLATFORM-WIDE STATS BANNER */}
                    <StatsBanner>
                        <StatCard delay={0}>
                            <StatIcon gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)">
                                <Trophy size={32} />
                            </StatIcon>
                            <StatLabel>ACCURACY RATE</StatLabel>
                            <StatValue>
                                {platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}
                            </StatValue>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                {platformStats.loading 
                                    ? 'Loading...'
                                    : `${platformStats.correctPredictions} / ${platformStats.totalPredictions} correct`
                                }
                            </div>
                        </StatCard>
                        
                        <StatCard delay={0.1}>
                            <StatIcon gradient="linear-gradient(135deg, #10b981, #059669)">
                                <TrendingUp size={32} />
                            </StatIcon>
                            <StatLabel>PREDICTIONS MADE</StatLabel>
                            <StatValue>
                                {platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}
                            </StatValue>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                Total predictions
                            </div>
                        </StatCard>
                        
                        <StatCard delay={0.2}>
                            <StatIcon gradient="linear-gradient(135deg, #f59e0b, #d97706)">
                                <Flame size={32} />
                            </StatIcon>
                            <StatValue>24/7</StatValue>
                            <StatLabel>REAL-TIME ANALYSIS</StatLabel>
                        </StatCard>
                        
                        <StatCard delay={0.3}>
                            <StatIcon gradient="linear-gradient(135deg, #ef4444, #dc2626)">
                                <Rocket size={32} />
                            </StatIcon>
                            <StatValue>Lightning</StatValue>
                            <StatLabel>FAST RESULTS</StatLabel>
                        </StatCard>
                    </StatsBanner>

                    <InputSection>
                        <InputForm onSubmit={fetchPrediction}>
                            <InputGroup>
                                <FormField>
                                    <Label>
                                        <Target size={18} />
                                        Stock Symbol
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., AAPL, TSLA, BTC, ETH"
                                        value={symbol}
                                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                        required
                                    />
                                </FormField>

                                <FormField>
                                    <Label>
                                        <Calendar size={18} />
                                        Prediction Period
                                    </Label>
                                    <Select
                                        value={days}
                                        onChange={(e) => setDays(e.target.value)}
                                    >
                                        <option value="1">1 Day</option>
                                        <option value="3">3 Days</option>
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                        <option value="30">30 Days</option>
                                    </Select>
                                </FormField>
                            </InputGroup>

                            <PredictButton type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <LoadingSpinner size={24} />
                                        Analyzing with AI...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={24} />
                                        Generate Prediction
                                        <ChevronRight size={24} />
                                    </>
                                )}
                            </PredictButton>
                        </InputForm>
                    </InputSection>

                    {prediction ? (
                        <ResultsContainer>
                            <PredictionCard>
                                <PredictionHeader>
                                    <StockInfo>
                                        <StockSymbol>
                                            {prediction.symbol}
                                            <WatchlistStar
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleWatchlistToggle(prediction.symbol);
                                                }}
                                                title={watchlist.includes(prediction.symbol?.toUpperCase()) 
                                                    ? 'Remove from Watchlist' 
                                                    : 'Add to Watchlist'
                                                }
                                            >
                                                <Star 
                                                    size={36} 
                                                    color="#f59e0b" 
                                                    fill={watchlist.includes(prediction.symbol?.toUpperCase()) ? '#f59e0b' : 'none'}
                                                />
                                            </WatchlistStar>
                                        </StockSymbol>
                                         <CompanyName>{getAssetName(prediction.symbol)}</CompanyName>
                                        <CurrentPriceSection>
                                            <CurrentPriceLabel>Current Price:</CurrentPriceLabel>
                                            <CurrentPriceValue>
                                                ${prediction.current_price?.toFixed(2)}
                                            </CurrentPriceValue>
                                        </CurrentPriceSection>
                                    </StockInfo>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <DirectionBadge $up={prediction.prediction.direction === 'UP'}>
                                            {prediction.prediction.direction === 'UP' ? (
                                                <TrendingUp size={32} />
                                            ) : (
                                                <TrendingDown size={32} />
                                            )}
                                            {prediction.prediction.direction}
                                        </DirectionBadge>

                                        <ActionButtons>
                                            <ActionButton onClick={handleSavePrediction}>
                                                {savedPredictions.some(p => p.symbol === prediction.symbol) ? (
                                                    <Bookmark size={18} fill="#a78bfa" />
                                                ) : (
                                                    <BookmarkPlus size={18} />
                                                )}
                                            </ActionButton>
                                            <ActionButton onClick={() => setShowShareModal(true)}>
                                                <Share2 size={18} />
                                            </ActionButton>
                                            <ActionButton onClick={handleExport}>
                                                <Download size={18} />
                                            </ActionButton>
                                        </ActionButtons>
                                    </div>
                                </PredictionHeader>

                                {/* COUNTDOWN TIMER */}
                                {liveData && liveData.timeRemaining > 0 && (
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        borderRadius: '16px',
                                        border: '2px solid rgba(139, 92, 246, 0.3)',
                                        marginBottom: '1.5rem',
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: '#a78bfa',
                                                fontSize: '1.1rem',
                                                fontWeight: '600'
                                            }}>
                                                <Clock size={24} />
                                                Time Remaining
                                            </div>
                                            <div style={{
                                                fontSize: '2rem',
                                                fontWeight: '900',
                                                color: liveData.timeRemaining < 3600000 ? '#ef4444' : 
                                                       liveData.timeRemaining < 86400000 ? '#f59e0b' : '#10b981'
                                            }}>
                                                {formatTimeRemaining(liveData.timeRemaining)}
                                            </div>
                                        </div>
                                        <div style={{
                                            color: '#94a3b8',
                                            fontSize: '0.95rem',
                                            textAlign: 'right'
                                        }}>
                                            ⏰ {liveData.daysRemaining} {liveData.daysRemaining === 1 ? 'day' : 'days'} remaining until prediction expires
                                        </div>
                                    </div>
                                )}

                                {/* LIVE PRICE */}
                                {liveData && liveData.livePrice && (
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'rgba(15, 23, 42, 0.6)',
                                        borderRadius: '16px',
                                        border: '2px solid rgba(139, 92, 246, 0.3)',
                                        marginBottom: '1.5rem',
                                        position: 'relative',
                                        zIndex: 1
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '600' }}>
                                                💰 Live Price
                                            </div>
                                            <div style={{
                                                fontSize: '2rem',
                                                fontWeight: '900',
                                                color: liveData.liveChange >= 0 ? '#10b981' : '#ef4444'
                                            }}>
                                                ${liveData.livePrice.toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                                Change from Start
                                            </div>
                                            <div style={{
                                                fontSize: '1.3rem',
                                                fontWeight: '700',
                                                color: liveData.liveChange >= 0 ? '#10b981' : '#ef4444'
                                            }}>
                                                {liveData.liveChange >= 0 ? '+' : ''}
                                                {liveData.liveChangePercent.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* LIVE CONFIDENCE UPDATE */}
                                {liveData && liveData.liveConfidence && (
                                    <div style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{
                                                color: '#a78bfa',
                                                fontSize: '1.2rem',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Zap size={24} />
                                                Live Confidence
                                            </div>
                                            <div style={{
                                                fontSize: '2rem',
                                                fontWeight: '900',
                                                color: liveData.liveConfidence >= 75 ? '#10b981' : 
                                                       liveData.liveConfidence >= 50 ? '#f59e0b' : '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem'
                                            }}>
                                                {liveData.liveConfidence.toFixed(1)}%
                                                {liveData.liveConfidence > prediction.prediction.confidence && (
                                                    <TrendingUp size={28} color="#10b981" />
                                                )}
                                                {liveData.liveConfidence < prediction.prediction.confidence && (
                                                    <TrendingDown size={28} color="#ef4444" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            width: '100%',
                                            height: '24px',
                                            background: 'rgba(139, 92, 246, 0.2)',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: '2px solid rgba(139, 92, 246, 0.3)'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${liveData.liveConfidence}%`,
                                                background: liveData.liveConfidence >= 75 
                                                    ? 'linear-gradient(90deg, #10b981, #059669)'
                                                    : liveData.liveConfidence >= 50
                                                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                                    : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                                borderRadius: '12px',
                                                transition: 'width 0.5s ease',
                                                boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
                                            }} />
                                        </div>
                                        
                                        {Math.abs(liveData.liveConfidence - prediction.prediction.confidence) > 0.1 && (
                                            <div style={{
                                                marginTop: '1rem',
                                                padding: '0.75rem',
                                                background: liveData.liveConfidence > prediction.prediction.confidence 
                                                    ? 'rgba(16, 185, 129, 0.1)' 
                                                    : 'rgba(239, 68, 68, 0.1)',
                                                borderRadius: '8px',
                                                border: liveData.liveConfidence > prediction.prediction.confidence
                                                    ? '1px solid rgba(16, 185, 129, 0.3)'
                                                    : '1px solid rgba(239, 68, 68, 0.3)',
                                                fontSize: '1rem',
                                                color: liveData.liveConfidence > prediction.prediction.confidence ? '#10b981' : '#ef4444',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: '600'
                                            }}>
                                                {liveData.liveConfidence > prediction.prediction.confidence ? (
                                                    <>
                                                        <TrendingUp size={20} />
                                                        🚀 Confidence INCREASED by {(liveData.liveConfidence - prediction.prediction.confidence).toFixed(1)}% since prediction!
                                                    </>
                                                ) : (
                                                    <>
                                                        <TrendingDown size={20} />
                                                        ⚠️ Confidence DECREASED by {(prediction.prediction.confidence - liveData.liveConfidence).toFixed(1)}% since prediction
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <MetricsGrid>
                                    <MetricCard $index={0}>
                                        <MetricIcon $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            <DollarSign size={24} />
                                        </MetricIcon>
                                        <MetricLabel>Target Price</MetricLabel>
                                        <MetricValue $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                            ${prediction.prediction.target_price?.toFixed(2)}
                                        </MetricValue>
                                    </MetricCard>

                                    <MetricCard $index={1}>
                                        <MetricIcon $variant={prediction.prediction.price_change_percent >= 0 ? 'success' : 'danger'}>
                                            <Percent size={24} />
                                        </MetricIcon>
                                        <MetricLabel>Expected Change</MetricLabel>
                                        <MetricValue $variant={prediction.prediction.price_change_percent >= 0 ? 'success' : 'danger'}>
                                            {prediction.prediction.price_change_percent >= 0 ? '+' : ''}
                                            {prediction.prediction.price_change_percent?.toFixed(2)}%
                                        </MetricValue>
                                    </MetricCard>

                                    <MetricCard $index={2}>
                                        <MetricIcon>
                                            <Activity size={24} />
                                        </MetricIcon>
                                        <MetricLabel>Price Movement</MetricLabel>
                                        <MetricValue>
                                            ${Math.abs(prediction.prediction.target_price - prediction.current_price).toFixed(2)}
                                        </MetricValue>
                                    </MetricCard>

                                    <MetricCard $index={3}>
                                        <MetricIcon $variant="warning">
                                            <Calendar size={24} />
                                        </MetricIcon>
                                        <MetricLabel>Timeframe</MetricLabel>
                                        <MetricValue $variant="warning">
                                            {days} {parseInt(days) === 1 ? 'Day' : 'Days'}
                                        </MetricValue>
                                    </MetricCard>
                                </MetricsGrid>

                                <ConfidenceSection>
                                    <ConfidenceLabel>
                                        <ConfidenceText>
                                            <Award size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                            Original AI Confidence
                                        </ConfidenceText>
                                        <ConfidenceValue>
                                            {prediction.prediction.confidence?.toFixed(1)}%
                                        </ConfidenceValue>
                                    </ConfidenceLabel>
                                    <ConfidenceBar>
                                        <ConfidenceFill $value={prediction.prediction.confidence} />
                                    </ConfidenceBar>
                                </ConfidenceSection>

                                {prediction.sentiment && (
                                    <IndicatorsSection style={{ marginBottom: '2rem' }}>
                                        <IndicatorsTitle>
                                            <Activity size={24} />
                                            News Sentiment Analysis
                                        </IndicatorsTitle>
                                        
                                        <div style={{
                                            background: 'rgba(15, 23, 42, 0.6)',
                                            border: `2px solid ${
                                                prediction.sentiment.label === 'POSITIVE' ? 'rgba(16, 185, 129, 0.5)' :
                                                prediction.sentiment.label === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.5)' :
                                                'rgba(245, 158, 11, 0.5)'
                                            }`,
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                    Overall Sentiment
                                                </div>
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: '900',
                                                    color: prediction.sentiment.label === 'POSITIVE' ? '#10b981' :
                                                           prediction.sentiment.label === 'NEGATIVE' ? '#ef4444' :
                                                           '#f59e0b'
                                                }}>
                                                    {prediction.sentiment.label}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                    Sentiment Score
                                                </div>
                                                <div style={{
                                                    fontSize: '1.5rem',
                                                    fontWeight: '900',
                                                    color: prediction.sentiment.score > 0 ? '#10b981' :
                                                           prediction.sentiment.score < 0 ? '#ef4444' :
                                                           '#f59e0b'
                                                }}>
                                                    {(prediction.sentiment.score * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                    Confidence
                                                </div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#a78bfa' }}>
                                                    {prediction.sentiment.confidence}%
                                                </div>
                                            </div>
                                            
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                    Analysis
                                                </div>
                                                <div style={{ color: '#e0e6ed', fontSize: '1rem' }}>
                                                    {prediction.sentiment.summary}
                                                </div>
                                            </div>
                                        </div>
                                    </IndicatorsSection>
                                )}

                                <IndicatorsSection>
                                    <IndicatorsTitle>
                                        <BarChart3 size={24} />
                                        Technical Indicators
                                    </IndicatorsTitle>
                                    <IndicatorsGrid>
                                        {Object.entries(prediction.indicators || {}).map(([name, data]) => (
                                            <IndicatorItem key={name}>
                                                <IndicatorName>{name}</IndicatorName>
                                                <IndicatorValue $signal={data.signal}>
                                                    {data.value} ({data.signal})
                                                </IndicatorValue>
                                            </IndicatorItem>
                                        ))}
                                    </IndicatorsGrid>
                                </IndicatorsSection>

                                <ChartSection>
                                    <ChartTitle>
                                        <LineChartIcon size={24} />
                                        Predicted Price Movement
                                    </ChartTitle>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <AreaChart data={prediction.chartData}>
                                            <defs>
                                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
                                            <XAxis dataKey="day" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'rgba(15, 23, 42, 0.95)',
                                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                                    borderRadius: '8px',
                                                    color: '#e0e6ed'
                                                }}
                                                formatter={(value) => ['$' + value.toFixed(2), 'Price']}
                                            />
                                            <ReferenceLine
                                                y={prediction.current_price}
                                                stroke="#00adef"
                                                strokeDasharray="5 5"
                                                label={{ value: 'Current', fill: '#00adef', position: 'right' }}
                                            />
                                            <ReferenceLine
                                                y={prediction.prediction.target_price}
                                                stroke={prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444'}
                                                strokeDasharray="5 5"
                                                label={{ value: 'Target', fill: prediction.prediction.direction === 'UP' ? '#10b981' : '#ef4444', position: 'right' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="price"
                                                stroke="#8b5cf6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorPrice)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartSection>
                            </PredictionCard>
                        </ResultsContainer>
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <Brain size={80} color="#8b5cf6" />
                            </EmptyIcon>
                            <EmptyTitle>Ready to Predict</EmptyTitle>
                            <EmptyText>
                                Enter a stock or crypto symbol above to generate AI-powered predictions
                            </EmptyText>
                        </EmptyState>
                    )}
                </>
            )}

            {/* ============ SAVED TAB ============ */}
            {activeTab === 'saved' && (
                <SavedPredictionsContainer>
                    {savedPredictions.length > 0 ? (
                        <>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '2rem'
                            }}>
                                <h2 style={{ 
                                    color: '#a78bfa', 
                                    fontSize: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Bookmark size={24} />
                                    Your Saved Predictions
                                </h2>
                                <ClearAllButton onClick={handleClearAllSaved}>
                                    <Trash2 size={18} />
                                    Clear All
                                </ClearAllButton>
                            </div>

                            <SavedPredictionsGrid>
                                {savedPredictions.map((saved) => (
                                    <SavedPredictionCard 
                                        key={saved.id}
                                        $up={saved.prediction?.direction === 'UP'}
                                    >
                                        <SavedCardHeader><div>
    <SavedSymbol>{saved.symbol}</SavedSymbol>
    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
        {getAssetName(saved.symbol)}
    </div>
</div>
                                            <SavedDirection $up={saved.prediction?.direction === 'UP'}>
                                                {saved.prediction?.direction === 'UP' ? (
                                                    <TrendingUp size={16} />
                                                ) : (
                                                    <TrendingDown size={16} />
                                                )}
                                                {saved.prediction?.direction}
                                            </SavedDirection>
                                        </SavedCardHeader>

                                        <SavedCardBody>
                                            <SavedMetric>
                                                <SavedMetricLabel>Entry Price</SavedMetricLabel>
                                                <SavedMetricValue>
                                                    ${saved.current_price?.toFixed(2)}
                                                </SavedMetricValue>
                                            </SavedMetric>
                                            <SavedMetric>
                                                <SavedMetricLabel>Target Price</SavedMetricLabel>
                                                <SavedMetricValue style={{
                                                    color: saved.prediction?.direction === 'UP' ? '#10b981' : '#ef4444'
                                                }}>
                                                    ${saved.prediction?.target_price?.toFixed(2)}
                                                </SavedMetricValue>
                                            </SavedMetric>
                                            <SavedMetric>
                                                <SavedMetricLabel>Expected Change</SavedMetricLabel>
                                                <SavedMetricValue style={{
                                                    color: saved.prediction?.price_change_percent >= 0 ? '#10b981' : '#ef4444'
                                                }}>
                                                    {saved.prediction?.price_change_percent >= 0 ? '+' : ''}
                                                    {saved.prediction?.price_change_percent?.toFixed(2)}%
                                                </SavedMetricValue>
                                            </SavedMetric>
                                            <SavedMetric>
                                                <SavedMetricLabel>Confidence</SavedMetricLabel>
                                                <SavedMetricValue style={{ color: '#a78bfa' }}>
                                                    {saved.prediction?.confidence?.toFixed(1)}%
                                                </SavedMetricValue>
                                            </SavedMetric>
                                        </SavedCardBody>

                                        <SavedCardFooter>
                                            <SavedDate>
                                                <Clock size={14} />
                                                {formatSavedDate(saved.savedAt || saved.timestamp)}
                                            </SavedDate>
                                            <SavedActions>
                                                <SavedActionButton 
                                                    onClick={() => handleViewSavedPrediction(saved)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </SavedActionButton>
                                                <SavedActionButton 
                                                    $danger
                                                    onClick={() => handleDeleteSavedPrediction(saved.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </SavedActionButton>
                                            </SavedActions>
                                        </SavedCardFooter>
                                    </SavedPredictionCard>
                                ))}
                            </SavedPredictionsGrid>
                        </>
                    ) : (
                        <EmptyState>
                            <EmptyIcon>
                                <Bookmark size={80} color="#8b5cf6" />
                            </EmptyIcon>
                            <EmptyTitle>No Saved Predictions</EmptyTitle>
                            <EmptyText>
                                Generate a prediction and click the bookmark icon to save it here
                            </EmptyText>
                            <PredictButton 
                                onClick={() => setActiveTab('predict')}
                                style={{ marginTop: '2rem', maxWidth: '300px', margin: '2rem auto 0' }}
                            >
                                <Zap size={20} />
                                Make a Prediction
                            </PredictButton>
                        </EmptyState>
                    )}
                </SavedPredictionsContainer>
            )}

            {showShareModal && (
                <ModalOverlay onClick={() => setShowShareModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Share Prediction</ModalTitle>
                            <CloseButton onClick={() => setShowShareModal(false)}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>
                        <ShareOptions>
                            <ShareOption onClick={() => handleShare('twitter')}>
                                <Twitter size={24} />
                                Twitter
                            </ShareOption>
                            <ShareOption onClick={() => handleShare('facebook')}>
                                <Facebook size={24} />
                                Facebook
                            </ShareOption>
                            <ShareOption onClick={() => handleShare('linkedin')}>
                                <Linkedin size={24} />
                                LinkedIn
                            </ShareOption>
                            <ShareOption onClick={() => handleShare('copy')}>
                                <Copy size={24} />
                                Copy Link
                            </ShareOption>
                        </ShareOptions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default PredictionsPage;