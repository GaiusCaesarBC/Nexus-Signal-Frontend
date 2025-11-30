// client/src/pages/PredictionsPage.js - THEMED VERSION WITH ALL EFFECTS PRESERVED

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import styled, { keyframes } from 'styled-components';
import { getAssetName } from '../utils/stockNames';
import { useAuth } from '../context/AuthContext';
import {
    Brain, TrendingUp, TrendingDown, Target, Zap, Activity,
    Calendar, DollarSign, Percent, ArrowRight,
    Star, Award, Sparkles, ChevronRight, BarChart3,
    Rocket, Trophy, ArrowUpDown, Flame, History, Share2, Download,
    X, Eye, RefreshCw, GitCompare, BookmarkPlus, Bookmark, Twitter,
    Facebook, Linkedin, Copy, Clock, Globe, Trash2, ExternalLink
} from 'lucide-react';
import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Cell,
    Rectangle
} from 'recharts';

// ============ ANIMATIONS (PRESERVED) ============
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
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
    z-index: 1;
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
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-shadow: 0 0 30px ${props => props.theme?.brand?.accent || '#8b5cf6'}60;
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
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}33 0%, ${props => props.theme?.info || '#3b82f6'}33 100%);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    box-shadow: 0 0 20px ${props => props.theme?.brand?.accent || '#8b5cf6'}40;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-3px);
        background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}66 0%, ${props => props.theme?.info || '#3b82f6'}66 100%);
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
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
        border-radius: 2px;
    }
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        `linear-gradient(135deg, ${props.theme?.brand?.accent || '#8b5cf6'}4D 0%, ${props.theme?.brand?.accent || '#8b5cf6'}26 100%)` :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? `${props.theme?.brand?.accent || '#8b5cf6'}80` : `${props.theme?.text?.tertiary || '#64748b'}4D`};
    border-radius: 12px;
    color: ${props => props.$active ? (props.theme?.brand?.accent || '#a78bfa') : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}4D 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}26 100%);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
        color: ${props => props.theme?.brand?.accent || '#a78bfa'};
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
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}26 0%, ${props => props.theme?.info || '#3b82f6'}26 100%);
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.delay}s;
    cursor: pointer;

    &:hover {
        transform: translateY(-10px) scale(1.05);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}CC;
        box-shadow: 0 20px 60px ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
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
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const InputSection = styled.div`
    max-width: 800px;
    margin: 0 auto 3rem;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 20px;
    padding: 2.5rem;
    animation: ${fadeIn} 0.8s ease-out;
    box-shadow: 0 10px 40px ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    position: relative;
    z-index: 1;

    &:hover {
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
        box-shadow: 0 15px 50px ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
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
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    padding: 1rem 1.25rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}0D;
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    text-transform: uppercase;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
        box-shadow: 0 0 0 4px ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
        transform: scale(1.02);
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
        text-transform: none;
    }
`;

const Select = styled.select`
    padding: 1rem 1.25rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}0D;
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 12px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
        box-shadow: 0 0 0 4px ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
        transform: scale(1.02);
    }

    option {
        background: #1e293b;
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    }
`;

const PredictButton = styled.button`
    flex: 1;
    padding: 1.25rem 2rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'};
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
        box-shadow: 0 15px 40px ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
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
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}26 0%, ${props => props.theme?.info || '#3b82f6'}26 100%);
    backdrop-filter: blur(10px);
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    border-radius: 20px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, ${props => props.theme?.brand?.accent || '#8b5cf6'}1A 50%, transparent 70%);
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
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-shadow: 0 0 30px ${props => props.theme?.brand?.accent || '#8b5cf6'}60;
`;

const CompanyName = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
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
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
`;

const CurrentPriceValue = styled.span`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
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
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 10px;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
        transform: translateY(-2px);
    }
`;

const DirectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: ${props => props.$up ? 
        `linear-gradient(135deg, ${props.theme?.success || '#10b981'}4D 0%, ${props.theme?.success || '#059669'}4D 100%)` : 
        `linear-gradient(135deg, ${props.theme?.error || '#ef4444'}4D 0%, ${props.theme?.error || '#dc2626'}4D 100%)`
    };
    border: 2px solid ${props => props.$up ? `${props.theme?.success || '#10b981'}80` : `${props.theme?.error || '#ef4444'}80`};
    border-radius: 16px;
    color: ${props => props.$up ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
    font-size: 1.5rem;
    font-weight: 900;
    box-shadow: ${props => props.$up ? 
        `0 10px 30px ${props.theme?.success || '#10b981'}4D` : 
        `0 10px 30px ${props.theme?.error || '#ef4444'}4D`
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
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$index * 0.1}s;

    &:hover {
        transform: translateY(-5px) scale(1.03);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}99;
        box-shadow: 0 10px 30px ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    }
`;

const MetricIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => {
        if (props.$variant === 'success') return `${props.theme?.success || '#10b981'}33`;
        if (props.$variant === 'danger') return `${props.theme?.error || '#ef4444'}33`;
        if (props.$variant === 'warning') return `${props.theme?.warning || '#f59e0b'}33`;
        return `${props.theme?.brand?.accent || '#8b5cf6'}33`;
    }};
    color: ${props => {
        if (props.$variant === 'success') return props.theme?.success || '#10b981';
        if (props.$variant === 'danger') return props.theme?.error || '#ef4444';
        if (props.$variant === 'warning') return props.theme?.warning || '#f59e0b';
        return props.theme?.brand?.accent || '#a78bfa';
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
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => {
        if (props.$variant === 'success') return props.theme?.success || '#10b981';
        if (props.$variant === 'danger') return props.theme?.error || '#ef4444';
        if (props.$variant === 'warning') return props.theme?.warning || '#f59e0b';
        return props.theme?.brand?.accent || '#a78bfa';
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
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 1.1rem;
    font-weight: 600;
`;

const ConfidenceValue = styled.span`
    color: ${props => props.theme?.success || '#10b981'};
    font-size: 1.5rem;
    font-weight: 900;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 20px;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$value || 0}%;
    background: linear-gradient(90deg, ${props => props.theme?.success || '#10b981'}, ${props => props.theme?.brand?.accent || '#8b5cf6'}, ${props => props.theme?.brand?.primary || '#00adef'});
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
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
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
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
        transform: translateX(5px);
    }
`;

const IndicatorName = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
`;

const IndicatorValue = styled.span`
    color: ${props => {
        if (props.$signal === 'BUY') return props.theme?.success || '#10b981';
        if (props.$signal === 'SELL') return props.theme?.error || '#ef4444';
        return props.theme?.warning || '#f59e0b';
    }};
    font-weight: 700;
    font-size: 0.95rem;
`;

const ChartSection = styled.div`
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
    margin-bottom: 2rem;

    &:hover {
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}99;
        box-shadow: 0 20px 60px ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    }
`;

const ChartTitle = styled.h3`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
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
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}33 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}0D 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    animation: ${float} 3s ease-in-out infinite;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1) rotate(5deg);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}CC;
    }
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
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
    background: ${({ theme }) => theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.95)'};
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
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
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-size: 1.5rem;
    font-weight: 700;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${props => props.theme?.error || '#ef4444'}33;
    border: 1px solid ${props => props.theme?.error || '#ef4444'}4D;
    color: ${props => props.theme?.error || '#ef4444'};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.error || '#ef4444'}4D;
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
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 12px;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}80;
        transform: translateY(-3px);
    }
`;

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
        filter: drop-shadow(0 0 10px ${props => props.theme?.warning || '#f59e0b'}CC);
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
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'}99;
        box-shadow: 0 15px 40px ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$up ? 
            `linear-gradient(90deg, ${props.theme?.success || '#10b981'}, ${props.theme?.success || '#059669'})` : 
            `linear-gradient(90deg, ${props.theme?.error || '#ef4444'}, ${props.theme?.error || '#dc2626'})`
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
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
`;

const SavedDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$up ? 
        `${props.theme?.success || '#10b981'}33` : 
        `${props.theme?.error || '#ef4444'}33`
    };
    border: 1px solid ${props => props.$up ? 
        `${props.theme?.success || '#10b981'}66` : 
        `${props.theme?.error || '#ef4444'}66`
    };
    border-radius: 8px;
    color: ${props => props.$up ? (props.theme?.success || '#10b981') : (props.theme?.error || '#ef4444')};
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
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border-radius: 8px;
    padding: 0.75rem;
`;

const SavedMetricLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const SavedMetricValue = styled.div`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 700;
`;

const SavedCardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
`;

const SavedDate = styled.div`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
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
        `${props.theme?.error || '#ef4444'}1A` : 
        `${props.theme?.brand?.accent || '#8b5cf6'}1A`
    };
    border: 1px solid ${props => props.$danger ? 
        `${props.theme?.error || '#ef4444'}4D` : 
        `${props.theme?.brand?.accent || '#8b5cf6'}4D`
    };
    border-radius: 8px;
    color: ${props => props.$danger ? (props.theme?.error || '#ef4444') : (props.theme?.brand?.accent || '#a78bfa')};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? 
            `${props.theme?.error || '#ef4444'}33` : 
            `${props.theme?.brand?.accent || '#8b5cf6'}33`
        };
        transform: scale(1.1);
    }
`;

const ClearAllButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.theme?.error || '#ef4444'}1A;
    border: 1px solid ${props => props.theme?.error || '#ef4444'}4D;
    border-radius: 10px;
    color: ${props => props.theme?.error || '#ef4444'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    margin-bottom: 2rem;

    &:hover {
        background: ${props => props.theme?.error || '#ef4444'}33;
        border-color: ${props => props.theme?.error || '#ef4444'}80;
    }
`;

// ============ COMPONENT ============
const PredictionsPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { theme } = useTheme();
    
    const [activeTab, setActiveTab] = useState('predict');
    const [symbol, setSymbol] = useState('');
    const [days, setDays] = useState('7');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [showRocket, setShowRocket] = useState(false);
    const [particlesData, setParticlesData] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [savedPredictions, setSavedPredictions] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    // Theme colors
    const accentColor = theme?.brand?.accent || '#8b5cf6';
    const primaryColor = theme?.brand?.primary || '#00adef';
    const successColor = theme?.success || '#10b981';
    const errorColor = theme?.error || '#ef4444';
    const warningColor = theme?.warning || '#f59e0b';

    const [platformStats, setPlatformStats] = useState({
        accuracy: 0,
        totalPredictions: 0,
        correctPredictions: 0,
        loading: true
    });

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
            color: [accentColor, primaryColor, successColor, warningColor][Math.floor(Math.random() * 4)]
        }));
        setParticlesData(newParticles);

        const saved = JSON.parse(localStorage.getItem('savedPredictions') || '[]');
        setSavedPredictions(saved);

        const fetchWatchlist = async () => {
            try {
                const response = await api.get('/watchlist');
                if (response.data && Array.isArray(response.data)) {
                    setWatchlist(response.data.map(item => typeof item === 'string' ? item : item.symbol));
                }
            } catch (error) {
                console.error('Error fetching watchlist:', error);
            }
        };
        fetchWatchlist();
    }, [api, accentColor, primaryColor, successColor, warningColor]);

    useEffect(() => {
        const predId = prediction?._id || prediction?.predictionId;
        if (!predId) return;

        let currentInterval = null;

        const fetchLiveData = async () => {
            try {
                const response = await api.get(`/predictions/live/${predId}`);
                setLiveData(response.data.prediction);
                return response.data.prediction.timeRemaining;
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
                    if (currentInterval) clearInterval(currentInterval);
                    if (hoursRemaining < 0.25) currentInterval = setInterval(fetchLiveData, 3000);
                    else if (hoursRemaining < 1) currentInterval = setInterval(fetchLiveData, 5000);
                    else if (hoursRemaining < 6) currentInterval = setInterval(fetchLiveData, 10000);
                    else currentInterval = setInterval(fetchLiveData, 15000);
                }
            };
            currentInterval = setInterval(updateInterval, 15000);
            updateInterval();
        };

        startPolling();
        return () => { if (currentInterval) clearInterval(currentInterval); };
    }, [prediction?._id, prediction?.predictionId, api]);

    const formatTimeRemaining = (ms) => {
        const d = Math.floor(ms / (1000 * 60 * 60 * 24));
        const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (d > 0) return `${d}d ${h}h`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const fetchPrediction = async (e) => {
        e.preventDefault();
        if (!symbol) { toast.warning('Please enter a symbol', 'Missing Symbol'); return; }

        setLoading(true);
        setPrediction(null);
        setLiveData(null);
        
        try {
            const response = await api.post('/predictions/predict', { symbol: symbol.toUpperCase(), days: parseInt(days) });
            const chartData = generateChartData(response.data.current_price, response.data.prediction.target_price, parseInt(days));
            setPrediction({ ...response.data, chartData, timestamp: new Date().toISOString() });
            toast.success(`Prediction generated for ${symbol.toUpperCase()}`, 'Success');

            const isGoingUp = response.data.prediction.direction === 'UP';
            setShowRocket(isGoingUp ? 'up' : 'down');
            setTimeout(() => setShowRocket(false), 3000);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to generate prediction', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = (currentPrice, targetPrice, days) => {
        const data = [];
        const priceChange = targetPrice - currentPrice;
        const volatility = currentPrice * 0.025; // 2.5% daily volatility
        
        let prevClose = currentPrice;
        
        for (let i = 0; i <= days; i++) {
            const progress = i / days;
            const trendPrice = currentPrice + (priceChange * progress);
            
            // Generate realistic OHLC data
            const randomFactor = (Math.random() - 0.5) * 2;
            const open = i === 0 ? currentPrice : prevClose;
            const close = trendPrice + (randomFactor * volatility * 0.5);
            const high = Math.max(open, close) + (Math.random() * volatility * 0.8);
            const low = Math.min(open, close) - (Math.random() * volatility * 0.8);
            
            prevClose = close;
            
            data.push({
                day: i === 0 ? 'Today' : `Day ${i}`,
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                // For candlestick rendering
                openClose: [parseFloat(open.toFixed(2)), parseFloat(close.toFixed(2))],
                highLow: [parseFloat(low.toFixed(2)), parseFloat(high.toFixed(2))],
                isUp: close >= open
            });
        }
        return data;
    };

    const handleWatchlistToggle = async (sym) => {
        if (!sym) return;
        const s = sym.toUpperCase();
        try {
            if (watchlist.includes(s)) {
                await api.delete(`/watchlist/${s}`);
                setWatchlist(prev => prev.filter(x => x !== s));
                toast.success(`${s} removed from watchlist`, 'Removed');
            } else {
                await api.post('/watchlist', { symbol: s });
                setWatchlist(prev => [...prev, s]);
                toast.success(`${s} added to watchlist!`, 'Added');
            }
        } catch (error) {
            toast.error('Failed to update watchlist', 'Error');
        }
    };

    const handleSavePrediction = () => {
        if (!prediction) return;
        if (savedPredictions.some(p => p.symbol === prediction.symbol && p.prediction?.target_price === prediction.prediction?.target_price)) {
            toast.warning('Already saved!', 'Already Saved');
            return;
        }
        const saved = [...savedPredictions, { id: Date.now(), ...prediction, savedAt: new Date().toISOString() }];
        setSavedPredictions(saved);
        localStorage.setItem('savedPredictions', JSON.stringify(saved));
        toast.success('Prediction saved!', 'Saved');
    };

    const handleDeleteSavedPrediction = (id) => {
        const updated = savedPredictions.filter(p => p.id !== id);
        setSavedPredictions(updated);
        localStorage.setItem('savedPredictions', JSON.stringify(updated));
        toast.success('Prediction removed', 'Deleted');
    };

    const handleClearAllSaved = () => {
        if (window.confirm('Clear all saved predictions?')) {
            setSavedPredictions([]);
            localStorage.removeItem('savedPredictions');
            toast.success('All cleared', 'Cleared');
        }
    };

    const handleViewSavedPrediction = (saved) => {
        setPrediction(saved);
        setActiveTab('predict');
    };

    const handleShare = (platform) => {
        if (!prediction) return;
        const text = `AI prediction: ${prediction.symbol} ${prediction.prediction.direction} to $${prediction.prediction.target_price.toFixed(2)}`;
        const url = window.location.href;
        let shareUrl = '';
        if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        else if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        else if (platform === 'copy') { navigator.clipboard.writeText(`${text}\n${url}`); toast.success('Copied!', 'Copied'); setShowShareModal(false); return; }
        if (shareUrl) { window.open(shareUrl, '_blank'); setShowShareModal(false); }
    };

    const handleExport = () => {
        if (!prediction) return;
        const blob = new Blob([JSON.stringify({ symbol: prediction.symbol, currentPrice: prediction.current_price, targetPrice: prediction.prediction.target_price, direction: prediction.prediction.direction, change: prediction.prediction.price_change_percent, confidence: prediction.prediction.confidence, days, timestamp: new Date().toISOString() }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${prediction.symbol}_prediction.json`; a.click();
        toast.success('Exported!', 'Exported');
    };

    const formatSavedDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <PageContainer theme={theme}>
            <ParticleContainer>
                {particlesData.map(p => <Particle key={p.id} size={p.size} left={p.left} duration={p.duration} delay={p.delay} color={p.color} />)}
            </ParticleContainer>

            {showRocket && (
                <RocketContainer left={Math.random() * 80 + 10} $crash={showRocket === 'down'}>
                    <Rocket size={64} color={showRocket === 'down' ? errorColor : accentColor} />
                </RocketContainer>
            )}

            <Header>
                <Title theme={theme}>
                    <TitleIcon><Brain size={56} color={accentColor} /></TitleIcon>
                    AI Stock & Crypto Predictor
                </Title>
                <Subtitle theme={theme}>Advanced machine learning powered price predictions</Subtitle>
                <PoweredBy theme={theme}><Sparkles size={18} />Powered by Neural Networks</PoweredBy>
            </Header>

            <TabsContainer theme={theme}>
                <Tab theme={theme} $active={activeTab === 'predict'} onClick={() => setActiveTab('predict')}><Zap size={18} />Predict</Tab>
                <Tab theme={theme} $active={activeTab === 'saved'} onClick={() => setActiveTab('saved')}><Bookmark size={18} />Saved ({savedPredictions.length})</Tab>
            </TabsContainer>

            {activeTab === 'predict' && (
                <>
                    <StatsBanner>
                        <StatCard theme={theme} delay={0}>
                            <StatIcon gradient={`linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`}><Trophy size={32} color="white" /></StatIcon>
                            <StatLabel theme={theme}>ACCURACY RATE</StatLabel>
                            <StatValue theme={theme}>{platformStats.loading ? '...' : `${platformStats.accuracy.toFixed(1)}%`}</StatValue>
                        </StatCard>
                        <StatCard theme={theme} delay={0.1}>
                            <StatIcon gradient={`linear-gradient(135deg, ${successColor}, ${successColor}cc)`}><TrendingUp size={32} color="white" /></StatIcon>
                            <StatLabel theme={theme}>PREDICTIONS MADE</StatLabel>
                            <StatValue theme={theme}>{platformStats.loading ? '...' : platformStats.totalPredictions.toLocaleString()}</StatValue>
                        </StatCard>
                        <StatCard theme={theme} delay={0.2}>
                            <StatIcon gradient={`linear-gradient(135deg, ${warningColor}, ${warningColor}cc)`}><Flame size={32} color="white" /></StatIcon>
                            <StatValue theme={theme}>24/7</StatValue>
                            <StatLabel theme={theme}>REAL-TIME ANALYSIS</StatLabel>
                        </StatCard>
                        <StatCard theme={theme} delay={0.3}>
                            <StatIcon gradient={`linear-gradient(135deg, ${errorColor}, ${errorColor}cc)`}><Rocket size={32} color="white" /></StatIcon>
                            <StatValue theme={theme}>Lightning</StatValue>
                            <StatLabel theme={theme}>FAST RESULTS</StatLabel>
                        </StatCard>
                    </StatsBanner>

                    <InputSection theme={theme}>
                        <InputForm onSubmit={fetchPrediction}>
                            <InputGroup>
                                <FormField>
                                    <Label theme={theme}><Target size={18} />Stock Symbol</Label>
                                    <Input theme={theme} placeholder="e.g., AAPL, TSLA, BTC" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
                                </FormField>
                                <FormField>
                                    <Label theme={theme}><Calendar size={18} />Prediction Period</Label>
                                    <Select theme={theme} value={days} onChange={(e) => setDays(e.target.value)}>
                                        <option value="1">1 Day</option>
                                        <option value="3">3 Days</option>
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                        <option value="30">30 Days</option>
                                    </Select>
                                </FormField>
                            </InputGroup>
                            <PredictButton theme={theme} type="submit" disabled={loading}>
                                {loading ? <><LoadingSpinner size={24} />Analyzing...</> : <><Zap size={24} />Generate Prediction<ChevronRight size={24} /></>}
                            </PredictButton>
                        </InputForm>
                    </InputSection>

                    {prediction ? (
                        <ResultsContainer>
                            <PredictionCard theme={theme}>
                                <PredictionHeader>
                                    <StockInfo>
                                        <StockSymbol theme={theme}>
                                            {prediction.symbol}
                                            <WatchlistStar theme={theme} onClick={() => handleWatchlistToggle(prediction.symbol)}>
                                                <Star size={36} color={warningColor} fill={watchlist.includes(prediction.symbol?.toUpperCase()) ? warningColor : 'none'} />
                                            </WatchlistStar>
                                        </StockSymbol>
                                        <CompanyName theme={theme}>{getAssetName(prediction.symbol)}</CompanyName>
                                        <CurrentPriceSection>
                                            <CurrentPriceLabel theme={theme}>Current:</CurrentPriceLabel>
                                            <CurrentPriceValue theme={theme}>${prediction.current_price?.toFixed(2)}</CurrentPriceValue>
                                        </CurrentPriceSection>
                                    </StockInfo>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <DirectionBadge theme={theme} $up={prediction.prediction.direction === 'UP'}>
                                            {prediction.prediction.direction === 'UP' ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                                            {prediction.prediction.direction}
                                        </DirectionBadge>
                                        <ActionButtons>
                                            <ActionButton theme={theme} onClick={handleSavePrediction}><BookmarkPlus size={18} /></ActionButton>
                                            <ActionButton theme={theme} onClick={() => setShowShareModal(true)}><Share2 size={18} /></ActionButton>
                                            <ActionButton theme={theme} onClick={handleExport}><Download size={18} /></ActionButton>
                                        </ActionButtons>
                                    </div>
                                </PredictionHeader>

                                {liveData && liveData.timeRemaining > 0 && (
                                    <div style={{ padding: '1.5rem', background: `${accentColor}1A`, borderRadius: '16px', border: `2px solid ${accentColor}4D`, marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ color: accentColor, fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={24} />Time Remaining</div>
                                            <div style={{ fontSize: '2rem', fontWeight: '900', color: liveData.timeRemaining < 3600000 ? errorColor : liveData.timeRemaining < 86400000 ? warningColor : successColor }}>{formatTimeRemaining(liveData.timeRemaining)}</div>
                                        </div>
                                    </div>
                                )}

                                {liveData && liveData.livePrice && (
                                    <div style={{ padding: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', border: `2px solid ${accentColor}4D`, marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ color: theme?.text?.secondary || '#94a3b8' }}>💰 Live Price</div>
                                            <div style={{ fontSize: '2rem', fontWeight: '900', color: liveData.liveChange >= 0 ? successColor : errorColor }}>${liveData.livePrice.toFixed(2)}</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ color: theme?.text?.secondary || '#94a3b8' }}>Change from Start</div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: liveData.liveChange >= 0 ? successColor : errorColor }}>{liveData.liveChange >= 0 ? '+' : ''}{liveData.liveChangePercent.toFixed(2)}%</div>
                                        </div>
                                    </div>
                                )}

                                <MetricsGrid>
                                    <MetricCard theme={theme} $index={0}>
                                        <MetricIcon theme={theme} $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}><DollarSign size={24} /></MetricIcon>
                                        <MetricLabel theme={theme}>Target Price</MetricLabel>
                                        <MetricValue theme={theme} $variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>${prediction.prediction.target_price?.toFixed(2)}</MetricValue>
                                    </MetricCard>
                                    <MetricCard theme={theme} $index={1}>
                                        <MetricIcon theme={theme} $variant={prediction.prediction.price_change_percent >= 0 ? 'success' : 'danger'}><Percent size={24} /></MetricIcon>
                                        <MetricLabel theme={theme}>Expected Change</MetricLabel>
                                        <MetricValue theme={theme} $variant={prediction.prediction.price_change_percent >= 0 ? 'success' : 'danger'}>{prediction.prediction.price_change_percent >= 0 ? '+' : ''}{prediction.prediction.price_change_percent?.toFixed(2)}%</MetricValue>
                                    </MetricCard>
                                    <MetricCard theme={theme} $index={2}>
                                        <MetricIcon theme={theme}><Activity size={24} /></MetricIcon>
                                        <MetricLabel theme={theme}>Price Movement</MetricLabel>
                                        <MetricValue theme={theme}>${Math.abs(prediction.prediction.target_price - prediction.current_price).toFixed(2)}</MetricValue>
                                    </MetricCard>
                                    <MetricCard theme={theme} $index={3}>
                                        <MetricIcon theme={theme} $variant="warning"><Calendar size={24} /></MetricIcon>
                                        <MetricLabel theme={theme}>Timeframe</MetricLabel>
                                        <MetricValue theme={theme} $variant="warning">{days} {parseInt(days) === 1 ? 'Day' : 'Days'}</MetricValue>
                                    </MetricCard>
                                </MetricsGrid>

                                <ConfidenceSection>
                                    <ConfidenceLabel>
                                        <ConfidenceText theme={theme}><Award size={20} style={{ marginRight: '0.5rem' }} />AI Confidence</ConfidenceText>
                                        <ConfidenceValue theme={theme}>{prediction.prediction.confidence?.toFixed(1)}%</ConfidenceValue>
                                    </ConfidenceLabel>
                                    <ConfidenceBar theme={theme}><ConfidenceFill theme={theme} $value={prediction.prediction.confidence} /></ConfidenceBar>
                                </ConfidenceSection>

                                {prediction.indicators && (
                                    <IndicatorsSection>
                                        <IndicatorsTitle theme={theme}><BarChart3 size={24} />Technical Indicators</IndicatorsTitle>
                                        <IndicatorsGrid>
                                            {Object.entries(prediction.indicators).map(([name, data]) => (
                                                <IndicatorItem theme={theme} key={name}>
                                                    <IndicatorName theme={theme}>{name}</IndicatorName>
                                                    <IndicatorValue theme={theme} $signal={data.signal}>{data.value} ({data.signal})</IndicatorValue>
                                                </IndicatorItem>
                                            ))}
                                        </IndicatorsGrid>
                                    </IndicatorsSection>
                                )}

                                <ChartSection theme={theme}>
                                    <ChartTitle theme={theme}><BarChart3 size={24} />Predicted Price Movement</ChartTitle>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ComposedChart data={prediction.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={`${accentColor}33`} />
                                            <XAxis dataKey="day" stroke={theme?.text?.secondary || '#94a3b8'} tick={{ fill: theme?.text?.secondary || '#94a3b8' }} />
                                            <YAxis 
                                                stroke={theme?.text?.secondary || '#94a3b8'} 
                                                tick={{ fill: theme?.text?.secondary || '#94a3b8' }}
                                                domain={['dataMin - 5', 'dataMax + 5']}
                                                tickFormatter={(value) => `$${value.toFixed(0)}`}
                                            />
                                            <Tooltip 
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div style={{
                                                                background: 'rgba(15, 23, 42, 0.95)',
                                                                border: `1px solid ${accentColor}80`,
                                                                borderRadius: '12px',
                                                                padding: '1rem',
                                                                boxShadow: `0 4px 20px ${accentColor}40`
                                                            }}>
                                                                <div style={{ color: accentColor, fontWeight: '700', marginBottom: '0.5rem', fontSize: '1rem' }}>{label}</div>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                                    <span style={{ color: theme?.text?.secondary || '#94a3b8' }}>Open:</span>
                                                                    <span style={{ color: theme?.text?.primary || '#e0e6ed', fontWeight: '600' }}>${data.open?.toFixed(2)}</span>
                                                                    <span style={{ color: theme?.text?.secondary || '#94a3b8' }}>High:</span>
                                                                    <span style={{ color: successColor, fontWeight: '600' }}>${data.high?.toFixed(2)}</span>
                                                                    <span style={{ color: theme?.text?.secondary || '#94a3b8' }}>Low:</span>
                                                                    <span style={{ color: errorColor, fontWeight: '600' }}>${data.low?.toFixed(2)}</span>
                                                                    <span style={{ color: theme?.text?.secondary || '#94a3b8' }}>Close:</span>
                                                                    <span style={{ color: data.isUp ? successColor : errorColor, fontWeight: '600' }}>${data.close?.toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <ReferenceLine y={prediction.current_price} stroke={primaryColor} strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Entry', fill: primaryColor, fontSize: 12 }} />
                                            <ReferenceLine y={prediction.prediction.target_price} stroke={prediction.prediction.direction === 'UP' ? successColor : errorColor} strokeDasharray="5 5" strokeWidth={2} label={{ value: 'Target', fill: prediction.prediction.direction === 'UP' ? successColor : errorColor, fontSize: 12 }} />
                                            
                                            {/* Wick (High-Low line) */}
                                            <Bar dataKey="highLow" barSize={2} shape={(props) => {
                                                const { x, y, width, height, payload } = props;
                                                const wickColor = payload.isUp ? successColor : errorColor;
                                                return (
                                                    <Rectangle
                                                        x={x + width / 2 - 1}
                                                        y={y}
                                                        width={2}
                                                        height={height}
                                                        fill={wickColor}
                                                    />
                                                );
                                            }} />
                                            
                                            {/* Candle Body (Open-Close) */}
                                            <Bar dataKey="openClose" barSize={20} shape={(props) => {
                                                const { x, y, width, height, payload } = props;
                                                const bodyColor = payload.isUp ? successColor : errorColor;
                                                const glowColor = payload.isUp ? `${successColor}40` : `${errorColor}40`;
                                                return (
                                                    <g>
                                                        {/* Glow effect */}
                                                        <Rectangle
                                                            x={x - 2}
                                                            y={y - 2}
                                                            width={width + 4}
                                                            height={Math.abs(height) + 4}
                                                            fill={glowColor}
                                                            rx={4}
                                                            ry={4}
                                                        />
                                                        {/* Main body */}
                                                        <Rectangle
                                                            x={x}
                                                            y={y}
                                                            width={width}
                                                            height={Math.abs(height) || 3}
                                                            fill={bodyColor}
                                                            rx={3}
                                                            ry={3}
                                                            style={{ filter: `drop-shadow(0 0 8px ${bodyColor})` }}
                                                        />
                                                    </g>
                                                );
                                            }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '20px', height: '20px', background: successColor, borderRadius: '4px' }} />
                                            <span style={{ color: theme?.text?.secondary || '#94a3b8', fontSize: '0.9rem' }}>Bullish (Close {'>'} Open)</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '20px', height: '20px', background: errorColor, borderRadius: '4px' }} />
                                            <span style={{ color: theme?.text?.secondary || '#94a3b8', fontSize: '0.9rem' }}>Bearish (Close {'<'} Open)</span>
                                        </div>
                                    </div>
                                </ChartSection>
                            </PredictionCard>
                        </ResultsContainer>
                    ) : (
                        <EmptyState>
                            <EmptyIcon theme={theme}><Brain size={80} color={accentColor} /></EmptyIcon>
                            <EmptyTitle theme={theme}>Ready to Predict</EmptyTitle>
                            <EmptyText theme={theme}>Enter a stock or crypto symbol to generate AI-powered predictions</EmptyText>
                        </EmptyState>
                    )}
                </>
            )}

            {activeTab === 'saved' && (
                <SavedPredictionsContainer>
                    {savedPredictions.length > 0 ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ color: accentColor, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bookmark size={24} />Your Saved Predictions</h2>
                                <ClearAllButton theme={theme} onClick={handleClearAllSaved}><Trash2 size={18} />Clear All</ClearAllButton>
                            </div>
                            <SavedPredictionsGrid>
                                {savedPredictions.map((saved) => (
                                    <SavedPredictionCard theme={theme} key={saved.id} $up={saved.prediction?.direction === 'UP'}>
                                        <SavedCardHeader>
                                            <div>
                                                <SavedSymbol theme={theme}>{saved.symbol}</SavedSymbol>
                                                <div style={{ color: theme?.text?.secondary || '#94a3b8', fontSize: '0.85rem' }}>{getAssetName(saved.symbol)}</div>
                                            </div>
                                            <SavedDirection theme={theme} $up={saved.prediction?.direction === 'UP'}>
                                                {saved.prediction?.direction === 'UP' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                {saved.prediction?.direction}
                                            </SavedDirection>
                                        </SavedCardHeader>
                                        <SavedCardBody>
                                            <SavedMetric theme={theme}><SavedMetricLabel theme={theme}>Entry</SavedMetricLabel><SavedMetricValue theme={theme}>${saved.current_price?.toFixed(2)}</SavedMetricValue></SavedMetric>
                                            <SavedMetric theme={theme}><SavedMetricLabel theme={theme}>Target</SavedMetricLabel><SavedMetricValue theme={theme} style={{ color: saved.prediction?.direction === 'UP' ? successColor : errorColor }}>${saved.prediction?.target_price?.toFixed(2)}</SavedMetricValue></SavedMetric>
                                            <SavedMetric theme={theme}><SavedMetricLabel theme={theme}>Change</SavedMetricLabel><SavedMetricValue theme={theme} style={{ color: saved.prediction?.price_change_percent >= 0 ? successColor : errorColor }}>{saved.prediction?.price_change_percent >= 0 ? '+' : ''}{saved.prediction?.price_change_percent?.toFixed(2)}%</SavedMetricValue></SavedMetric>
                                            <SavedMetric theme={theme}><SavedMetricLabel theme={theme}>Confidence</SavedMetricLabel><SavedMetricValue theme={theme} style={{ color: accentColor }}>{saved.prediction?.confidence?.toFixed(1)}%</SavedMetricValue></SavedMetric>
                                        </SavedCardBody>
                                        <SavedCardFooter theme={theme}>
                                            <SavedDate theme={theme}><Clock size={14} />{formatSavedDate(saved.savedAt || saved.timestamp)}</SavedDate>
                                            <SavedActions>
                                                <SavedActionButton theme={theme} onClick={() => handleViewSavedPrediction(saved)}><Eye size={16} /></SavedActionButton>
                                                <SavedActionButton theme={theme} $danger onClick={() => handleDeleteSavedPrediction(saved.id)}><Trash2 size={16} /></SavedActionButton>
                                            </SavedActions>
                                        </SavedCardFooter>
                                    </SavedPredictionCard>
                                ))}
                            </SavedPredictionsGrid>
                        </>
                    ) : (
                        <EmptyState>
                            <EmptyIcon theme={theme}><Bookmark size={80} color={accentColor} /></EmptyIcon>
                            <EmptyTitle theme={theme}>No Saved Predictions</EmptyTitle>
                            <EmptyText theme={theme}>Generate a prediction and bookmark it to save</EmptyText>
                            <PredictButton theme={theme} onClick={() => setActiveTab('predict')} style={{ marginTop: '2rem', maxWidth: '300px', margin: '2rem auto 0' }}><Zap size={20} />Make a Prediction</PredictButton>
                        </EmptyState>
                    )}
                </SavedPredictionsContainer>
            )}

            {showShareModal && (
                <ModalOverlay onClick={() => setShowShareModal(false)}>
                    <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle theme={theme}>Share Prediction</ModalTitle>
                            <CloseButton theme={theme} onClick={() => setShowShareModal(false)}><X size={20} /></CloseButton>
                        </ModalHeader>
                        <ShareOptions>
                            <ShareOption theme={theme} onClick={() => handleShare('twitter')}><Twitter size={24} />Twitter</ShareOption>
                            <ShareOption theme={theme} onClick={() => handleShare('facebook')}><Facebook size={24} />Facebook</ShareOption>
                            <ShareOption theme={theme} onClick={() => handleShare('linkedin')}><Linkedin size={24} />LinkedIn</ShareOption>
                            <ShareOption theme={theme} onClick={() => handleShare('copy')}><Copy size={24} />Copy Link</ShareOption>
                        </ShareOptions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default PredictionsPage;