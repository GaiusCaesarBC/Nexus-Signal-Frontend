// client/src/pages/CalculatorsPage.js - THE MOST LEGENDARY CALCULATORS PAGE EVER

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Calculator, DollarSign, TrendingUp, PieChart, Target, Zap,
    Percent, Clock, Award, Sparkles, Activity, ArrowRight,
    Check, AlertCircle, Info, TrendingDown, Coins, Calendar,
    BarChart3, Flame, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.5); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: ${props => props.theme?.colors?.bg?.primary || '#0a0e27'};
    color: ${props => props.theme?.colors?.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;

    @media (max-width: 768px) {
        padding-left: 1rem;
        padding-right: 1rem;
    }
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
    ${props => css`animation: ${particles} ${props.duration}s linear infinite;`}
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    bottom: 0;
    opacity: 0.4;
    filter: blur(1px);
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    max-width: 1600px;
    margin: 0 auto;
`;

const Header = styled.div`
    margin-bottom: 3rem;
    ${css`animation: ${fadeIn} 0.8s ease-out;`}
    text-align: center;
`;

const Title = styled.h1`
    font-size: 4rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 1rem;
    font-weight: 900;
    filter: drop-shadow(0 0 20px rgba(0, 173, 237, 0.3));
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
        flex-direction: column;
        gap: 0.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: 1rem;
        flex-direction: column;
    }
`;

const SelectorContainer = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 3rem;
    ${css`animation: ${fadeIn} 0.8s ease-out 0.2s backwards;`}

    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const SelectorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }
`;

const SelectorButton = styled.button`
    padding: 1.5rem 1rem;
    background: ${props => props.$active 
        ? 'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.1) 100%)'
        : 'rgba(0, 173, 237, 0.05)'
    };
    border: 2px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 16px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 3s linear infinite;`}
        opacity: ${props => props.$active ? 1 : 0};
    }

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
        color: #00adef;
    }

    ${props => props.$active && css`
        box-shadow: 0 0 30px rgba(0, 173, 237, 0.4);
        ${css`animation: ${glow} 2s ease-in-out infinite;`}
    `}

    @media (max-width: 768px) {
        padding: 1rem 0.5rem;
        font-size: 0.8rem;
    }
`;

const SelectorIcon = styled.div`
    font-size: 2rem;
    ${props => props.$active && css`animation: ${float} 3s ease-in-out infinite;`}
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const SelectorLabel = styled.div`
    font-size: 0.9rem;
    position: relative;
    z-index: 1;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 0.75rem;
    }
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    ${css`animation: ${fadeIn} 0.8s ease-out 0.4s backwards;`}

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const Panel = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 20px;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    min-height: 600px;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.03) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 4s linear infinite;`}
    }

    @media (max-width: 768px) {
        padding: 1.5rem;
        min-height: auto;
    }
`;

const PanelHeader = styled.div`
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
`;

const PanelTitle = styled.h2`
    font-size: 2rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const PanelSubtitle = styled.p`
    color: #94a3b8;
    font-size: 1rem;

    @media (max-width: 768px) {
        font-size: 0.9rem;
    }
`;

const InputForm = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
`;

const InputGroup = styled.div`
    ${props => css`
        animation: ${slideInRight} 0.4s ease-out;
        animation-delay: ${props.delay}s;
        animation-fill-mode: backwards;
    `}
`;

const InputLabel = styled.label`
    display: block;
    color: #00adef;
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 1rem 1.25rem;
    background: rgba(0, 173, 237, 0.05);
    border: 2px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: rgba(0, 173, 237, 0.6);
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: rgba(148, 163, 184, 0.5);
    }

    @media (max-width: 768px) {
        padding: 0.875rem 1rem;
        font-size: 1rem;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 1rem 1.25rem;
    background: rgba(0, 173, 237, 0.05);
    border: 2px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: rgba(0, 173, 237, 0.6);
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.2);
    }

    option {
        background: #1e293b;
        color: #e0e6ed;
    }

    @media (max-width: 768px) {
        padding: 0.875rem 1rem;
        font-size: 1rem;
    }
`;

const CalculateButton = styled.button`
    width: 100%;
    padding: 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    border: none;
    border-radius: 16px;
    color: white;
    font-size: 1.2rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
    margin-top: 1rem;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 3s linear infinite;`}
    }

    &:hover:not(:disabled) {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 173, 237, 0.5);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        ${css`animation: ${pulse} 1.5s ease-in-out infinite;`}
    }

    @media (max-width: 768px) {
        padding: 1.25rem;
        font-size: 1.1rem;
    }
`;

const ResultsPanel = styled(Panel)`
    ${props => !props.$hasResults && css`
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
        border-color: rgba(139, 92, 246, 0.3);
    `}
`;

const EmptyState = styled.div`
    text-align: center;
    color: #94a3b8;
    position: relative;
    z-index: 1;
`;

const EmptyStateIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: rgba(139, 92, 246, 0.1);
    border: 2px solid rgba(139, 92, 246, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a78bfa;
    ${css`animation: ${float} 3s ease-in-out infinite;`}
`;

const EmptyStateText = styled.p`
    font-size: 1.2rem;
    color: #a78bfa;
    margin-bottom: 0.5rem;
    font-weight: 600;
`;

const EmptyStateSubtext = styled.p`
    font-size: 1rem;
    color: #64748b;
`;

const ResultsContent = styled.div`
    position: relative;
    z-index: 1;
`;

const ResultsHeader = styled.div`
    margin-bottom: 2rem;
`;

const ResultsTitle = styled.h3`
    font-size: 1.8rem;
    color: #00adef;
    margin-bottom: 0.5rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: 1.4rem;
    }
`;

const ResultsSubtitle = styled.p`
    color: #94a3b8;
`;

const ResultsGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const ResultCard = styled.div`
    background: ${props => {
        if (props.$highlight) return 'linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%)';
        if (props.$success) return 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)';
        if (props.$danger) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)';
        if (props.$warning) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)';
        return 'rgba(0, 173, 237, 0.05)';
    }};
    border: 2px solid ${props => {
        if (props.$highlight) return 'rgba(0, 173, 237, 0.4)';
        if (props.$success) return 'rgba(16, 185, 129, 0.4)';
        if (props.$danger) return 'rgba(239, 68, 68, 0.4)';
        if (props.$warning) return 'rgba(245, 158, 11, 0.4)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    border-radius: 16px;
    padding: 1.5rem;
    ${props => css`
        animation: ${slideInRight} 0.4s ease-out;
        animation-delay: ${props.delay}s;
        animation-fill-mode: backwards;
    `}
    transition: all 0.3s ease;

    &:hover {
        transform: translateX(10px);
        box-shadow: 0 10px 30px ${props => {
            if (props.$highlight) return 'rgba(0, 173, 237, 0.3)';
            if (props.$success) return 'rgba(16, 185, 129, 0.3)';
            if (props.$danger) return 'rgba(239, 68, 68, 0.3)';
            if (props.$warning) return 'rgba(245, 158, 11, 0.3)';
            return 'rgba(0, 173, 237, 0.2)';
        }};
    }

    ${props => props.$highlight && css`
        box-shadow: 0 0 30px rgba(0, 173, 237, 0.3);
    `}

    @media (max-width: 768px) {
        padding: 1.25rem;
    }
`;

const ResultLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ResultValue = styled.div`
    font-size: ${props => props.$large ? '2.5rem' : '1.8rem'};
    font-weight: 900;
    color: ${props => {
        if (props.$success) return '#10b981';
        if (props.$danger) return '#ef4444';
        if (props.$warning) return '#f59e0b';
        return '#00adef';
    }};
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        font-size: ${props => props.$large ? '2rem' : '1.5rem'};
    }
`;

const Badge = styled.span`
    background: ${props => {
        if (props.$success) return 'rgba(16, 185, 129, 0.2)';
        if (props.$danger) return 'rgba(239, 68, 68, 0.2)';
        if (props.$warning) return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.$success) return '#10b981';
        if (props.$danger) return '#ef4444';
        if (props.$warning) return '#f59e0b';
        return '#00adef';
    }};
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;
    overflow-x: auto;
    display: block;

    @media (max-width: 768px) {
        font-size: 0.9rem;
    }
`;

const TableHeader = styled.th`
    text-align: left;
    padding: 1rem;
    color: #00adef;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 1px;
    border-bottom: 2px solid rgba(0, 173, 237, 0.3);

    @media (max-width: 768px) {
        padding: 0.75rem 0.5rem;
        font-size: 0.75rem;
    }
`;

const TableRow = styled.tr`
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.05);
    }
`;

const TableCell = styled.td`
    padding: 1rem;
    color: #e0e6ed;
    font-weight: 600;

    @media (max-width: 768px) {
        padding: 0.75rem 0.5rem;
    }
`;

const LoadingSpinner = styled.div`
    ${css`animation: ${rotate} 2s linear infinite;`}
`;

// ============ COMPONENT ============
const CalculatorsPage = () => {
    const { theme } = useTheme();
    const { api } = useAuth();
    const toast = useToast();
    const [activeCalculator, setActiveCalculator] = useState('position-size');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [particles, setParticlesState] = useState([]);

    // State for all calculators
    const [positionSizeData, setPositionSizeData] = useState({
        accountSize: '',
        riskPercentage: '1',
        entryPrice: '',
        stopLoss: ''
    });

    const [riskRewardData, setRiskRewardData] = useState({
        entryPrice: '',
        stopLoss: '',
        targetPrice: '',
        positionSize: ''
    });

    const [compoundData, setCompoundData] = useState({
        principal: '',
        monthlyContribution: '',
        annualRate: '7',
        years: '10',
        compoundFrequency: '12'
    });

    const [retirementData, setRetirementData] = useState({
        currentAge: '',
        retirementAge: '65',
        currentSavings: '',
        monthlyContribution: '',
        expectedReturn: '7',
        inflationRate: '3',
        desiredMonthlyIncome: ''
    });

    const [optionsData, setOptionsData] = useState({
        optionType: 'call',
        strikePrice: '',
        premium: '',
        contracts: '1',
        stockPrice: ''
    });

    const [stakingData, setStakingData] = useState({
        stakingAmount: '',
        apy: '',
        stakingPeriodDays: '365',
        compoundFrequency: 'daily',
        tokenPrice: ''
    });

    const [dcaData, setDcaData] = useState({
        investmentAmount: '',
        frequency: 'weekly',
        duration: '365'
    });

    // Generate particles on mount
    useEffect(() => {
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: ['#00adef', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)]
        }));
        setParticlesState(newParticles);
    }, []);

    const calculators = [
        { id: 'position-size', label: 'Position Size', icon: Target, description: 'Calculate optimal position size' },
        { id: 'risk-reward', label: 'Risk/Reward', icon: TrendingUp, description: 'Analyze risk vs reward ratio' },
        { id: 'compound-interest', label: 'Compound Interest', icon: BarChart3, description: 'Project investment growth' },
        { id: 'retirement', label: 'Retirement', icon: PieChart, description: 'Plan your retirement' },
        { id: 'options', label: 'Options', icon: Zap, description: 'Calculate options profit/loss' },
        { id: 'staking', label: 'Staking', icon: Coins, description: 'Estimate staking rewards' },
        { id: 'dca', label: 'DCA', icon: Calendar, description: 'Dollar cost averaging' },
    ];

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const handleCalculate = async () => {
        setLoading(true);
        setResults(null);

        try {
            let endpoint = '';
            let data = {};

            switch (activeCalculator) {
                case 'position-size':
                    endpoint = '/api/calculators/position-size';
                    data = positionSizeData;
                    break;
                case 'risk-reward':
                    endpoint = '/api/calculators/risk-reward';
                    data = riskRewardData;
                    break;
                case 'compound-interest':
                    endpoint = '/api/calculators/compound-interest';
                    data = compoundData;
                    break;
                case 'retirement':
                    endpoint = '/api/calculators/retirement';
                    data = retirementData;
                    break;
                case 'options':
                    endpoint = '/api/calculators/options-profit';
                    data = optionsData;
                    break;
                case 'staking':
                    endpoint = '/api/calculators/staking-rewards';
                    data = stakingData;
                    break;
                case 'dca':
                    endpoint = '/api/calculators/dca';
                    data = dcaData;
                    break;
                default:
                    break;
            }

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                setResults(result.data);
                toast.success('Calculation Complete', 'Results ready!');
            } else {
                toast.error('Calculation failed', result.error || 'Please check your inputs');
            }
        } catch (error) {
            console.error('Calculation error:', error);
            toast.error('Error', 'Failed to calculate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculatorChange = (calculatorId) => {
        setActiveCalculator(calculatorId);
        setResults(null);
    };

    const renderInputs = () => {
        switch (activeCalculator) {
            case 'position-size':
                return (
                    <InputForm>
                        <InputGroup delay={0}>
                            <InputLabel><DollarSign size={18} /> Account Size ($)</InputLabel>
                            <Input
                                type="number"
                                value={positionSizeData.accountSize}
                                onChange={(e) => setPositionSizeData({...positionSizeData, accountSize: e.target.value})}
                                placeholder="10000"
                            />
                        </InputGroup>
                        <InputGroup delay={0.1}>
                            <InputLabel><Percent size={18} /> Risk Percentage (%)</InputLabel>
                            <Input
                                type="number"
                                step="0.1"
                                value={positionSizeData.riskPercentage}
                                onChange={(e) => setPositionSizeData({...positionSizeData, riskPercentage: e.target.value})}
                                placeholder="1"
                            />
                        </InputGroup>
                        <InputGroup delay={0.2}>
                            <InputLabel><TrendingUp size={18} /> Entry Price ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={positionSizeData.entryPrice}
                                onChange={(e) => setPositionSizeData({...positionSizeData, entryPrice: e.target.value})}
                                placeholder="150.00"
                            />
                        </InputGroup>
                        <InputGroup delay={0.3}>
                            <InputLabel><TrendingDown size={18} /> Stop Loss ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={positionSizeData.stopLoss}
                                onChange={(e) => setPositionSizeData({...positionSizeData, stopLoss: e.target.value})}
                                placeholder="145.00"
                            />
                        </InputGroup>
                    </InputForm>
                );

            case 'risk-reward':
                return (
                    <InputForm>
                        <InputGroup delay={0}>
                            <InputLabel><TrendingUp size={18} /> Entry Price ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={riskRewardData.entryPrice}
                                onChange={(e) => setRiskRewardData({...riskRewardData, entryPrice: e.target.value})}
                                placeholder="100.00"
                            />
                        </InputGroup>
                        <InputGroup delay={0.1}>
                            <InputLabel><TrendingDown size={18} /> Stop Loss ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={riskRewardData.stopLoss}
                                onChange={(e) => setRiskRewardData({...riskRewardData, stopLoss: e.target.value})}
                                placeholder="95.00"
                            />
                        </InputGroup>
                        <InputGroup delay={0.2}>
                            <InputLabel><Target size={18} /> Target Price ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={riskRewardData.targetPrice}
                                onChange={(e) => setRiskRewardData({...riskRewardData, targetPrice: e.target.value})}
                                placeholder="115.00"
                            />
                        </InputGroup>
                        <InputGroup delay={0.3}>
                            <InputLabel><Info size={18} /> Position Size (Optional)</InputLabel>
                            <Input
                                type="number"
                                value={riskRewardData.positionSize}
                                onChange={(e) => setRiskRewardData({...riskRewardData, positionSize: e.target.value})}
                                placeholder="100"
                            />
                        </InputGroup>
                    </InputForm>
                );

            case 'compound-interest':
                return (
                    <InputForm>
                        <InputGroup delay={0}>
                            <InputLabel><DollarSign size={18} /> Initial Investment ($)</InputLabel>
                            <Input
                                type="number"
                                value={compoundData.principal}
                                onChange={(e) => setCompoundData({...compoundData, principal: e.target.value})}
                                placeholder="10000"
                            />
                        </InputGroup>
                        <InputGroup delay={0.1}>
                            <InputLabel><Calendar size={18} /> Monthly Contribution ($)</InputLabel>
                            <Input
                                type="number"
                                value={compoundData.monthlyContribution}
                                onChange={(e) => setCompoundData({...compoundData, monthlyContribution: e.target.value})}
                                placeholder="500"
                            />
                        </InputGroup>
                        <InputGroup delay={0.2}>
                            <InputLabel><Percent size={18} /> Annual Interest Rate (%)</InputLabel>
                            <Input
                                type="number"
                                step="0.1"
                                value={compoundData.annualRate}
                                onChange={(e) => setCompoundData({...compoundData, annualRate: e.target.value})}
                                placeholder="7"
                            />
                        </InputGroup>
                        <InputGroup delay={0.3}>
                            <InputLabel><Clock size={18} /> Time Period (Years)</InputLabel>
                            <Input
                                type="number"
                                value={compoundData.years}
                                onChange={(e) => setCompoundData({...compoundData, years: e.target.value})}
                                placeholder="10"
                            />
                        </InputGroup>
                    </InputForm>
                );

            case 'retirement':
                return (
                    <InputForm>
                        <InputGroup delay={0}>
                            <InputLabel><Info size={18} /> Current Age</InputLabel>
                            <Input
                                type="number"
                                value={retirementData.currentAge}
                                onChange={(e) => setRetirementData({...retirementData, currentAge: e.target.value})}
                                placeholder="30"
                            />
                        </InputGroup>
                        <InputGroup delay={0.1}>
                            <InputLabel><Info size={18} /> Retirement Age</InputLabel>
                            <Input
                                type="number"
                                value={retirementData.retirementAge}
                                onChange={(e) => setRetirementData({...retirementData, retirementAge: e.target.value})}
                                placeholder="65"
                            />
                        </InputGroup>
                        <InputGroup delay={0.2}>
                            <InputLabel><DollarSign size={18} /> Current Savings ($)</InputLabel>
                            <Input
                                type="number"
                                value={retirementData.currentSavings}
                                onChange={(e) => setRetirementData({...retirementData, currentSavings: e.target.value})}
                                placeholder="50000"
                            />
                        </InputGroup>
                        <InputGroup delay={0.3}>
                            <InputLabel><Calendar size={18} /> Monthly Contribution ($)</InputLabel>
                            <Input
                                type="number"
                                value={retirementData.monthlyContribution}
                                onChange={(e) => setRetirementData({...retirementData, monthlyContribution: e.target.value})}
                                placeholder="500"
                            />
                        </InputGroup>
                        <InputGroup delay={0.4}>
                            <InputLabel><Percent size={18} /> Expected Return (%)</InputLabel>
                            <Input
                                type="number"
                                step="0.1"
                                value={retirementData.expectedReturn}
                                onChange={(e) => setRetirementData({...retirementData, expectedReturn: e.target.value})}
                                placeholder="7"
                            />
                        </InputGroup>
                        <InputGroup delay={0.5}>
                            <InputLabel><DollarSign size={18} /> Desired Monthly Income ($)</InputLabel>
                            <Input
                                type="number"
                                value={retirementData.desiredMonthlyIncome}
                                onChange={(e) => setRetirementData({...retirementData, desiredMonthlyIncome: e.target.value})}
                                placeholder="5000"
                            />
                        </InputGroup>
                    </InputForm>
                );

            case 'options':
                return (
                    <InputForm>
                        <InputGroup delay={0}>
                            <InputLabel><Zap size={18} /> Option Type</InputLabel>
                            <Select
                                value={optionsData.optionType}
                                onChange={(e) => setOptionsData({...optionsData, optionType: e.target.value})}
                            >
                                <option value="call">Call</option>
                                <option value="put">Put</option>
                            </Select>
                        </InputGroup>
                        <InputGroup delay={0.1}>
                            <InputLabel><Target size={18} /> Strike Price ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={optionsData.strikePrice}
                                onChange={(e) => setOptionsData({...optionsData, strikePrice: e.target.value})}
                                placeholder="100.00"
                            />
                        </InputGroup>
                        <InputGroup delay={0.2}>
                            <InputLabel><DollarSign size={18} /> Premium ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={optionsData.premium}
                                onChange={(e) => setOptionsData({...optionsData, premium: e.target.value})}
                                placeholder="2.50"
                            />
                        </InputGroup>
                        <InputGroup delay={0.3}>
                            <InputLabel><Info size={18} /> Number of Contracts</InputLabel>
                            <Input
                                type="number"
                                value={optionsData.contracts}
                                onChange={(e) => setOptionsData({...optionsData, contracts: e.target.value})}
                                placeholder="1"
                            />
                        </InputGroup>
                        <InputGroup delay={0.4}>
                            <InputLabel><TrendingUp size={18} /> Current Stock Price ($)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={optionsData.stockPrice}
                                onChange={(e) => setOptionsData({...optionsData, stockPrice: e.target.value})}
                                placeholder="105.00"
                            />
                        </InputGroup>
                    </InputForm>
                );

            case 'staking':
                return (
                    <InputForm>
                        <InputGroup delay={0}>
                            <InputLabel><Coins size={18} /> Staking Amount (Tokens)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={stakingData.stakingAmount}
                                onChange={(e) => setStakingData({...stakingData, stakingAmount: e.target.value})}
                                placeholder="1000"
                            />
                        </InputGroup>
                        <InputGroup delay={0.1}>
                            <InputLabel><Percent size={18} /> APY (%)</InputLabel>
                            <Input
                                type="number"
                                step="0.1"
                                value={stakingData.apy}
                                onChange={(e) => setStakingData({...stakingData, apy: e.target.value})}
                                placeholder="8.5"
                            />
                        </InputGroup>
                        <InputGroup delay={0.2}>
                            <InputLabel><Clock size={18} /> Staking Period (Days)</InputLabel>
                            <Input
                                type="number"
                                value={stakingData.stakingPeriodDays}
                                onChange={(e) => setStakingData({...stakingData, stakingPeriodDays: e.target.value})}
                                placeholder="365"
                            />
                        </InputGroup>
                        <InputGroup delay={0.3}>
                            <InputLabel><Info size={18} /> Compound Frequency</InputLabel>
                            <Select
                                value={stakingData.compoundFrequency}
                                onChange={(e) => setStakingData({...stakingData, compoundFrequency: e.target.value})}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </Select>
                        </InputGroup>
                        <InputGroup delay={0.4}>
                            <InputLabel><DollarSign size={18} /> Token Price (Optional, $)</InputLabel>
                            <Input
                                type="number"
                                step="0.01"
                                value={stakingData.tokenPrice}
                                onChange={(e) => setStakingData({...stakingData, tokenPrice: e.target.value})}
                                placeholder="2.50"
                            />
                        </InputGroup>
                    </InputForm>
                );

            case 'dca':
                return (
                    <InputForm>
                        <InputGroup delay={0}>
                            <InputLabel><DollarSign size={18} /> Investment Amount ($)</InputLabel>
                            <Input
                                type="number"
                                value={dcaData.investmentAmount}
                                onChange={(e) => setDcaData({...dcaData, investmentAmount: e.target.value})}
                                placeholder="100"
                            />
                        </InputGroup>
                        <InputGroup delay={0.1}>
                            <InputLabel><Calendar size={18} /> Frequency</InputLabel>
                            <Select
                                value={dcaData.frequency}
                                onChange={(e) => setDcaData({...dcaData, frequency: e.target.value})}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </Select>
                        </InputGroup>
                        <InputGroup delay={0.2}>
                            <InputLabel><Clock size={18} /> Duration (Days)</InputLabel>
                            <Input
                                type="number"
                                value={dcaData.duration}
                                onChange={(e) => setDcaData({...dcaData, duration: e.target.value})}
                                placeholder="365"
                            />
                        </InputGroup>
                    </InputForm>
                );

            default:
                return null;
        }
    };

    const renderResults = () => {
        if (!results) return null;

        switch (activeCalculator) {
            case 'position-size':
                return (
                    <ResultsContent>
                        <ResultsHeader>
                            <ResultsTitle>
                                <Check size={24} />
                                Position Calculated
                            </ResultsTitle>
                            <ResultsSubtitle>Your optimal position size</ResultsSubtitle>
                        </ResultsHeader>
                        <ResultsGrid>
                            <ResultCard $highlight delay={0}>
                                <ResultLabel><Target size={16} /> Position Size</ResultLabel>
                                <ResultValue $large>{results.positionSize} shares</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.1}>
                                <ResultLabel><DollarSign size={16} /> Position Value</ResultLabel>
                                <ResultValue>${results.positionValue}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.2}>
                                <ResultLabel><AlertCircle size={16} /> Risk Amount</ResultLabel>
                                <ResultValue $warning>${results.riskAmount}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.3}>
                                <ResultLabel><Percent size={16} /> % of Account</ResultLabel>
                                <ResultValue>{results.percentOfAccount}%</ResultValue>
                            </ResultCard>
                        </ResultsGrid>
                    </ResultsContent>
                );

            case 'risk-reward':
                const ratioColor = results.ratio >= 2 ? '$success' : '$warning';
                return (
                    <ResultsContent>
                        <ResultsHeader>
                            <ResultsTitle>
                                <Check size={24} />
                                Risk/Reward Analysis
                            </ResultsTitle>
                            <ResultsSubtitle>Trade assessment</ResultsSubtitle>
                        </ResultsHeader>
                        <ResultsGrid>
                            <ResultCard $highlight delay={0}>
                                <ResultLabel><BarChart3 size={16} /> Risk/Reward Ratio</ResultLabel>
                                <ResultValue $large {...{[ratioColor]: true}}>
                                    1:{results.ratio}
                                </ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.1}>
                                <ResultLabel><Star size={16} /> Assessment</ResultLabel>
                                <Badge {...{[ratioColor]: true}}>{results.assessment}</Badge>
                            </ResultCard>
                            <ResultCard delay={0.2}>
                                <ResultLabel><TrendingDown size={16} /> Risk Amount</ResultLabel>
                                <ResultValue $danger>${results.riskAmount}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.3}>
                                <ResultLabel><TrendingUp size={16} /> Reward Amount</ResultLabel>
                                <ResultValue $success>${results.rewardAmount}</ResultValue>
                            </ResultCard>
                            {results.potentialLoss && (
                                <>
                                    <ResultCard $danger delay={0.4}>
                                        <ResultLabel><TrendingDown size={16} /> Potential Loss</ResultLabel>
                                        <ResultValue $danger>${results.potentialLoss}</ResultValue>
                                    </ResultCard>
                                    <ResultCard $success delay={0.5}>
                                        <ResultLabel><TrendingUp size={16} /> Potential Profit</ResultLabel>
                                        <ResultValue $success>${results.potentialProfit}</ResultValue>
                                    </ResultCard>
                                </>
                            )}
                        </ResultsGrid>
                    </ResultsContent>
                );

            case 'compound-interest':
                return (
                    <ResultsContent>
                        <ResultsHeader>
                            <ResultsTitle>
                                <Check size={24} />
                                Growth Projection
                            </ResultsTitle>
                            <ResultsSubtitle>Your investment over time</ResultsSubtitle>
                        </ResultsHeader>
                        <ResultsGrid>
                            <ResultCard $highlight delay={0}>
                                <ResultLabel><Sparkles size={16} /> Future Value</ResultLabel>
                                <ResultValue $large>${results.futureValue}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.1}>
                                <ResultLabel><DollarSign size={16} /> Total Contributions</ResultLabel>
                                <ResultValue>${results.totalContributions}</ResultValue>
                            </ResultCard>
                            <ResultCard $success delay={0.2}>
                                <ResultLabel><TrendingUp size={16} /> Total Interest Earned</ResultLabel>
                                <ResultValue $success>${results.totalInterest}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.3}>
                                <ResultLabel><Percent size={16} /> Effective Rate</ResultLabel>
                                <ResultValue>{results.effectiveRate}%</ResultValue>
                            </ResultCard>
                        </ResultsGrid>
                        
                        {results.yearlyBreakdown && results.yearlyBreakdown.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ color: '#00adef', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart3 size={20} />
                                    Year by Year Breakdown
                                </h4>
                                <Table>
                                    <thead>
                                        <tr>
                                            <TableHeader>Year</TableHeader>
                                            <TableHeader>Value</TableHeader>
                                            <TableHeader>Contributed</TableHeader>
                                            <TableHeader>Interest</TableHeader>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.yearlyBreakdown.map((year) => (
                                            <TableRow key={year.year}>
                                                <TableCell>{year.year}</TableCell>
                                                <TableCell>${year.value}</TableCell>
                                                <TableCell>${year.totalContributions}</TableCell>
                                                <TableCell style={{ color: '#10b981' }}>${year.interest}</TableCell>
                                            </TableRow>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </ResultsContent>
                );

            case 'retirement':
                return (
                    <ResultsContent>
                        <ResultsHeader>
                            <ResultsTitle>
                                <Check size={24} />
                                Retirement Plan
                            </ResultsTitle>
                            <ResultsSubtitle>Your financial future</ResultsSubtitle>
                        </ResultsHeader>
                        <ResultsGrid>
                            <ResultCard $highlight delay={0}>
                                <ResultLabel><Sparkles size={16} /> Projected Value at Retirement</ResultLabel>
                                <ResultValue $large>${results.projectedValue}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.1}>
                                <ResultLabel><Clock size={16} /> Years to Retirement</ResultLabel>
                                <ResultValue>{results.yearsToRetirement} years</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.2}>
                                <ResultLabel><DollarSign size={16} /> Total Contributions</ResultLabel>
                                <ResultValue>${results.totalContributions}</ResultValue>
                            </ResultCard>
                            <ResultCard $success delay={0.3}>
                                <ResultLabel><TrendingUp size={16} /> Total Growth</ResultLabel>
                                <ResultValue $success>${results.totalGrowth}</ResultValue>
                            </ResultCard>
                            {results.monthlyIncomeAtRetirement > 0 && (
                                <>
                                    <ResultCard delay={0.4}>
                                        <ResultLabel><Calendar size={16} /> Monthly Income at Retirement</ResultLabel>
                                        <ResultValue>${results.monthlyIncomeAtRetirement}</ResultValue>
                                    </ResultCard>
                                    <ResultCard delay={0.5}>
                                        <ResultLabel><Target size={16} /> Required Savings</ResultLabel>
                                        <ResultValue>${results.requiredSavings}</ResultValue>
                                    </ResultCard>
                                    {results.shortfall > 0 && (
                                        <ResultCard $warning delay={0.6}>
                                            <ResultLabel><AlertCircle size={16} /> Shortfall</ResultLabel>
                                            <ResultValue $warning>${results.shortfall}</ResultValue>
                                        </ResultCard>
                                    )}
                                    <ResultCard {...(results.onTrack ? {$success: true} : {$warning: true})} delay={0.7}>
                                        <ResultLabel><Info size={16} /> Status</ResultLabel>
                                        <Badge {...(results.onTrack ? {$success: true} : {$warning: true})}>
                                            {results.onTrack ? <Check size={16} /> : <AlertCircle size={16} />}
                                            {results.onTrack ? 'On Track' : 'Behind Target'}
                                        </Badge>
                                    </ResultCard>
                                </>
                            )}
                        </ResultsGrid>
                    </ResultsContent>
                );

            case 'options':
                const isProfitable = parseFloat(results.profitLoss) > 0;
                return (
                    <ResultsContent>
                        <ResultsHeader>
                            <ResultsTitle>
                                <Check size={24} />
                                Options Analysis
                            </ResultsTitle>
                            <ResultsSubtitle>Profit/Loss calculation</ResultsSubtitle>
                        </ResultsHeader>
                        <ResultsGrid>
                            <ResultCard $highlight {...(isProfitable ? {$success: true} : {$danger: true})} delay={0}>
                                <ResultLabel><Zap size={16} /> Profit/Loss</ResultLabel>
                                <ResultValue $large {...(isProfitable ? {$success: true} : {$danger: true})}>
                                    ${results.profitLoss}
                                </ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.1}>
                                <ResultLabel><Info size={16} /> Status</ResultLabel>
                                <Badge {...(isProfitable ? {$success: true} : {$danger: true})}>
                                    {results.status}
                                </Badge>
                            </ResultCard>
                            <ResultCard delay={0.2}>
                                <ResultLabel><DollarSign size={16} /> Total Premium Paid</ResultLabel>
                                <ResultValue>${results.totalPremiumPaid}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.3}>
                                <ResultLabel><Target size={16} /> Break Even Price</ResultLabel>
                                <ResultValue>${results.breakEvenPrice}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.4}>
                                <ResultLabel><Percent size={16} /> Return on Investment</ResultLabel>
                                <ResultValue {...(isProfitable ? {$success: true} : {$danger: true})}>
                                    {results.returnOnInvestment}%
                                </ResultValue>
                            </ResultCard>
                        </ResultsGrid>
                    </ResultsContent>
                );

            case 'staking':
                return (
                    <ResultsContent>
                        <ResultsHeader>
                            <ResultsTitle>
                                <Check size={24} />
                                Staking Rewards
                            </ResultsTitle>
                            <ResultsSubtitle>Your earnings breakdown</ResultsSubtitle>
                        </ResultsHeader>
                        <ResultsGrid>
                            <ResultCard delay={0}>
                                <ResultLabel><Coins size={16} /> Initial Amount</ResultLabel>
                                <ResultValue>{results.initialAmount} tokens</ResultValue>
                            </ResultCard>
                            <ResultCard $highlight delay={0.1}>
                                <ResultLabel><Sparkles size={16} /> Final Amount</ResultLabel>
                                <ResultValue $large>{results.finalAmount} tokens</ResultValue>
                            </ResultCard>
                            <ResultCard $success delay={0.2}>
                                <ResultLabel><TrendingUp size={16} /> Total Rewards</ResultLabel>
                                <ResultValue $success>{results.totalRewards} tokens</ResultValue>
                            </ResultCard>
                            {results.usdValue && (
                                <>
                                    <ResultCard delay={0.3}>
                                        <ResultLabel><DollarSign size={16} /> Initial Value (USD)</ResultLabel>
                                        <ResultValue>${results.usdValue.initialValue}</ResultValue>
                                    </ResultCard>
                                    <ResultCard delay={0.4}>
                                        <ResultLabel><DollarSign size={16} /> Final Value (USD)</ResultLabel>
                                        <ResultValue>${results.usdValue.finalValue}</ResultValue>
                                    </ResultCard>
                                    <ResultCard $success delay={0.5}>
                                        <ResultLabel><Sparkles size={16} /> Rewards Value (USD)</ResultLabel>
                                        <ResultValue $success>${results.usdValue.rewardsValue}</ResultValue>
                                    </ResultCard>
                                </>
                            )}
                        </ResultsGrid>
                    </ResultsContent>
                );

            case 'dca':
                const hasProfit = results.profitLoss && parseFloat(results.profitLoss) >= 0;
                return (
                    <ResultsContent>
                        <ResultsHeader>
                            <ResultsTitle>
                                <Check size={24} />
                                DCA Results
                            </ResultsTitle>
                            <ResultsSubtitle>Dollar cost averaging analysis</ResultsSubtitle>
                        </ResultsHeader>
                        <ResultsGrid>
                            <ResultCard delay={0}>
                                <ResultLabel><DollarSign size={16} /> Total Invested</ResultLabel>
                                <ResultValue>${results.totalInvested}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.1}>
                                <ResultLabel><Calendar size={16} /> Number of Investments</ResultLabel>
                                <ResultValue>{results.numberOfInvestments}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.2}>
                                <ResultLabel><DollarSign size={16} /> Amount Per Investment</ResultLabel>
                                <ResultValue>${results.amountPerInvestment}</ResultValue>
                            </ResultCard>
                            <ResultCard delay={0.3}>
                                <ResultLabel><Clock size={16} /> Frequency</ResultLabel>
                                <Badge>{results.frequency}</Badge>
                            </ResultCard>
                            {results.currentValue && (
                                <>
                                    <ResultCard $highlight delay={0.4}>
                                        <ResultLabel><Sparkles size={16} /> Current Value</ResultLabel>
                                        <ResultValue $large>${results.currentValue}</ResultValue>
                                    </ResultCard>
                                    <ResultCard delay={0.5}>
                                        <ResultLabel><BarChart3 size={16} /> Average Cost</ResultLabel>
                                        <ResultValue>${results.averageCost}</ResultValue>
                                    </ResultCard>
                                    <ResultCard {...(hasProfit ? {$success: true} : {$danger: true})} delay={0.6}>
                                        <ResultLabel><TrendingUp size={16} /> Profit/Loss</ResultLabel>
                                        <ResultValue {...(hasProfit ? {$success: true} : {$danger: true})}>
                                            ${results.profitLoss} ({results.roi}%)
                                        </ResultValue>
                                    </ResultCard>
                                </>
                            )}
                        </ResultsGrid>
                    </ResultsContent>
                );

            default:
                return null;
        }
    };

    const activeCalc = calculators.find(c => c.id === activeCalculator);

    return (
        <PageContainer theme={theme}>
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

            <ContentWrapper>
                {/* HEADER */}
                <Header>
                    <Title>
                        <Calculator size={64} />
                        Investment Calculators
                    </Title>
                    <Subtitle>
                        <Sparkles size={20} />
                        Professional tools for smart trading decisions
                    </Subtitle>
                </Header>

                {/* CALCULATOR SELECTOR */}
                <SelectorContainer>
                    <SelectorGrid>
                        {calculators.map((calc) => {
                            const Icon = calc.icon;
                            return (
                                <SelectorButton
                                    key={calc.id}
                                    $active={activeCalculator === calc.id}
                                    onClick={() => handleCalculatorChange(calc.id)}
                                >
                                    <SelectorIcon $active={activeCalculator === calc.id}>
                                        <Icon size={32} />
                                    </SelectorIcon>
                                    <SelectorLabel>{calc.label}</SelectorLabel>
                                </SelectorButton>
                            );
                        })}
                    </SelectorGrid>
                </SelectorContainer>

                {/* MAIN CONTENT */}
                <ContentGrid>
                    {/* INPUT PANEL */}
                    <Panel>
                        <PanelHeader>
                            <PanelTitle>
                                {activeCalc && <activeCalc.icon size={32} />}
                                {activeCalc?.label} Calculator
                            </PanelTitle>
                            <PanelSubtitle>{activeCalc?.description}</PanelSubtitle>
                        </PanelHeader>
                        
                        {renderInputs()}
                        
                        <CalculateButton onClick={handleCalculate} disabled={loading}>
                            {loading ? (
                                <>
                                    <LoadingSpinner>
                                        <Activity size={24} />
                                    </LoadingSpinner>
                                    Calculating...
                                </>
                            ) : (
                                <>
                                    <Zap size={24} />
                                    Calculate
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </CalculateButton>
                    </Panel>

                    {/* RESULTS PANEL */}
                    <ResultsPanel $hasResults={!!results}>
                        {results ? (
                            renderResults()
                        ) : (
                            <EmptyState>
                                <EmptyStateIcon>
                                    <Calculator size={64} />
                                </EmptyStateIcon>
                                <EmptyStateText>Results will appear here</EmptyStateText>
                                <EmptyStateSubtext>Fill in the form and hit calculate</EmptyStateSubtext>
                            </EmptyState>
                        )}
                    </ResultsPanel>
                </ContentGrid>
            </ContentWrapper>
        </PageContainer>
    );
};

export default CalculatorsPage;