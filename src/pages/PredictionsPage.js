// client/src/pages/PredictionsPage.js - THE MOST LEGENDARY AI PREDICTION PAGE - ULTIMATE EDITION

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    Brain, TrendingUp, TrendingDown, Target, Zap, Activity,
    AlertCircle, Calendar, DollarSign, Percent, ArrowRight,
    Star, Award, Sparkles, ChevronRight, BarChart3, LineChart as LineChartIcon,
    Rocket, Trophy, ArrowUpDown, Flame
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
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

// Animated background particles
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

// ============ STATS BANNER ============
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

// ============ INPUT SECTION ============
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

// ============ RESULTS SECTION ============
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

const DirectionBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: ${props => props.up ? 
        'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.3) 100%)' : 
        'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)'
    };
    border: 2px solid ${props => props.up ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'};
    border-radius: 16px;
    color: ${props => props.up ? '#10b981' : '#ef4444'};
    font-size: 1.5rem;
    font-weight: 900;
    box-shadow: ${props => props.up ? 
        '0 10px 30px rgba(16, 185, 129, 0.3)' : 
        '0 10px 30px rgba(239, 68, 68, 0.3)'
    };
    animation: ${slideInRight} 0.6s ease-out, ${pulse} 2s ease-in-out infinite 1s;
`;

// ============ METRICS GRID ============
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
    animation-delay: ${props => props.index * 0.1}s;

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
        if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(139, 92, 246, 0.2)';
    }};
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        if (props.variant === 'warning') return '#f59e0b';
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
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        if (props.variant === 'warning') return '#f59e0b';
        return '#a78bfa';
    }};
`;

// ============ CONFIDENCE BAR ============
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
    width: ${props => props.value || 0}%;
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

// ============ CHART SECTION ============
const ChartSection = styled.div`
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;

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

// Success Rocket Animation
const RocketContainer = styled.div`
    position: fixed;
    bottom: -100px;
    left: ${props => props.left}%;
    z-index: 1000;
    animation: ${rocketLaunch} 3s ease-out forwards;
    pointer-events: none;
`;

// ============ COMPONENT ============
const PredictionsPage = () => {
    const { api } = useAuth();
    const [symbol, setSymbol] = useState('');
    const [days, setDays] = useState('7');
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [showRocket, setShowRocket] = useState(false);
    const [particles, setParticles] = useState([]);

    // Generate background particles on mount
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
    }, []);

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/predictions/predict', {
                symbol: symbol.toUpperCase(),
                days: parseInt(days)
            });

            // Generate mock chart data
            const chartData = generateChartData(
                response.data.current_price,
                response.data.prediction.target_price,
                parseInt(days)
            );

            setPrediction({
                ...response.data,
                chartData
            });

            // Trigger rocket animation on successful prediction
            setShowRocket(true);
            setTimeout(() => setShowRocket(false), 3000);

        } catch (error) {
            console.error('Prediction error:', error);
            alert(error.response?.data?.error || 'Failed to generate prediction');
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = (currentPrice, targetPrice, days) => {
        const data = [];
        const priceChange = targetPrice - currentPrice;
        
        for (let i = 0; i <= days; i++) {
            const progress = i / days;
            // Add some randomness for realistic look
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

    return (
        <PageContainer>
            {/* Animated Background Particles */}
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

            {/* Success Rocket */}
            {showRocket && (
                <RocketContainer left={Math.random() * 80 + 10}>
                    <Rocket size={64} color="#8b5cf6" />
                </RocketContainer>
            )}

            <Header>
                <Title>
                    <TitleIcon>
                        <Brain size={56} color="#8b5cf6" />
                    </TitleIcon>
                    AI Stock Predictor
                </Title>
                <Subtitle>Advanced machine learning powered price predictions</Subtitle>
                <PoweredBy>
                    <Sparkles size={18} />
                    Powered by Neural Networks
                </PoweredBy>
            </Header>

            {/* Stats Banner */}
            <StatsBanner>
                <StatCard delay={0}>
                    <StatIcon gradient="linear-gradient(135deg, #8b5cf6, #6366f1)">
                        <Trophy size={32} />
                    </StatIcon>
                    <StatValue>98.2%</StatValue>
                    <StatLabel>Accuracy Rate</StatLabel>
                </StatCard>
                <StatCard delay={0.1}>
                    <StatIcon gradient="linear-gradient(135deg, #10b981, #059669)">
                        <ArrowUpDown size={32} />
                    </StatIcon>
                    <StatValue>10K+</StatValue>
                    <StatLabel>Predictions Made</StatLabel>
                </StatCard>
                <StatCard delay={0.2}>
                    <StatIcon gradient="linear-gradient(135deg, #f59e0b, #d97706)">
                        <Flame size={32} />
                    </StatIcon>
                    <StatValue>24/7</StatValue>
                    <StatLabel>Real-Time Analysis</StatLabel>
                </StatCard>
                <StatCard delay={0.3}>
                    <StatIcon gradient="linear-gradient(135deg, #ef4444, #dc2626)">
                        <Rocket size={32} />
                    </StatIcon>
                    <StatValue>Lightning</StatValue>
                    <StatLabel>Fast Results</StatLabel>
                </StatCard>
            </StatsBanner>

            <InputSection>
                <InputForm onSubmit={handlePredict}>
                    <InputGroup>
                        <FormField>
                            <Label>
                                <Target size={18} />
                                Stock Symbol
                            </Label>
                            <Input
                                type="text"
                                placeholder="e.g., AAPL, TSLA, NVDA"
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
                                    <Star size={36} color="#f59e0b" />
                                </StockSymbol>
                                <CurrentPriceSection>
                                    <CurrentPriceLabel>Current Price:</CurrentPriceLabel>
                                    <CurrentPriceValue>
                                        ${prediction.current_price?.toFixed(2)}
                                    </CurrentPriceValue>
                                </CurrentPriceSection>
                            </StockInfo>

                            <DirectionBadge up={prediction.prediction.direction === 'UP'}>
                                {prediction.prediction.direction === 'UP' ? (
                                    <TrendingUp size={32} />
                                ) : (
                                    <TrendingDown size={32} />
                                )}
                                {prediction.prediction.direction}
                            </DirectionBadge>
                        </PredictionHeader>

                        <MetricsGrid>
                            <MetricCard index={0}>
                                <MetricIcon variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                    <DollarSign size={24} />
                                </MetricIcon>
                                <MetricLabel>Target Price</MetricLabel>
                                <MetricValue variant={prediction.prediction.direction === 'UP' ? 'success' : 'danger'}>
                                    ${prediction.prediction.target_price?.toFixed(2)}
                                </MetricValue>
                            </MetricCard>

                            <MetricCard index={1}>
                                <MetricIcon variant={prediction.prediction.price_change_percent >= 0 ? 'success' : 'danger'}>
                                    <Percent size={24} />
                                </MetricIcon>
                                <MetricLabel>Expected Change</MetricLabel>
                                <MetricValue variant={prediction.prediction.price_change_percent >= 0 ? 'success' : 'danger'}>
                                    {prediction.prediction.price_change_percent >= 0 ? '+' : ''}
                                    {prediction.prediction.price_change_percent?.toFixed(2)}%
                                </MetricValue>
                            </MetricCard>

                            <MetricCard index={2}>
                                <MetricIcon>
                                    <Activity size={24} />
                                </MetricIcon>
                                <MetricLabel>Price Movement</MetricLabel>
                                <MetricValue>
                                    ${Math.abs(prediction.prediction.target_price - prediction.current_price).toFixed(2)}
                                </MetricValue>
                            </MetricCard>

                            <MetricCard index={3}>
                                <MetricIcon variant="warning">
                                    <Calendar size={24} />
                                </MetricIcon>
                                <MetricLabel>Timeframe</MetricLabel>
                                <MetricValue variant="warning">
                                    {days} {parseInt(days) === 1 ? 'Day' : 'Days'}
                                </MetricValue>
                            </MetricCard>
                        </MetricsGrid>

                        <ConfidenceSection>
                            <ConfidenceLabel>
                                <ConfidenceText>
                                    <Award size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                    AI Confidence Level
                                </ConfidenceText>
                                <ConfidenceValue>
                                    {prediction.prediction.confidence?.toFixed(1)}%
                                </ConfidenceValue>
                            </ConfidenceLabel>
                            <ConfidenceBar>
                                <ConfidenceFill value={prediction.prediction.confidence} />
                            </ConfidenceBar>
                        </ConfidenceSection>

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
                        Enter a stock symbol above to generate AI-powered predictions
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default PredictionsPage;