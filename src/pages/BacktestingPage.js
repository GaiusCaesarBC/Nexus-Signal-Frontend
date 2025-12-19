// client/src/pages/BacktestingPage.js - Strategy Backtesting Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import api from '../api/axios';
import {
    ArrowLeft, Play, TrendingUp, TrendingDown, Target,
    Calendar, DollarSign, Percent, BarChart3, Activity,
    Clock, CheckCircle, XCircle, Trash2, Eye, RefreshCw,
    ChevronDown, Zap, Award, AlertTriangle, LineChart,
    Settings, History
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 80px 2rem 2rem;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 8px;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
        transform: translateX(-5px);
    }
`;

const Title = styled.h1`
    font-size: 2.5rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
    font-size: 1.1rem;
`;

const MainContent = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 2rem;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: ${props => props.theme?.card?.background || 'rgba(30, 32, 40, 0.8)'};
    border: 1px solid ${props => props.theme?.card?.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(10px);
`;

const CardTitle = styled.h3`
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};

    svg {
        color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    }
`;

const FormGroup = styled.div`
    margin-bottom: 1.25rem;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
`;

const Input = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
        box-shadow: 0 0 0 3px ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    }

    option {
        background: #1e2028;
        color: #e0e6ed;
    }
`;

const DateInputRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
`;

const RunButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #00adef 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
    margin-top: 1.5rem;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    svg.spinning {
        animation: ${spin} 1s linear infinite;
    }
`;

const ResultsCard = styled(Card)`
    min-height: 400px;
`;

const TabsContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
`;

const Tab = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${props => props.$active ? 'rgba(139, 92, 246, 0.2)' : 'transparent'};
    border: none;
    border-radius: 8px;
    color: ${props => props.$active ? '#a78bfa' : props.theme?.text?.secondary || '#a0a8b3'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(139, 92, 246, 0.15);
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const MetricCard = styled.div`
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 10px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.05);

    .label {
        font-size: 0.85rem;
        color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
        margin-bottom: 0.25rem;
    }

    .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: ${props => props.$positive ? '#00ff88' : props.$negative ? '#ff4757' : props.theme?.text?.primary || '#e0e6ed'};
    }
`;

const TradesTable = styled.div`
    overflow-x: auto;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    th {
        color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
    }

    td {
        font-size: 0.9rem;
    }

    .buy {
        color: #00ff88;
    }

    .sell {
        color: #ff4757;
    }

    .profit-positive {
        color: #00ff88;
    }

    .profit-negative {
        color: #ff4757;
    }
`;

const HistoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const HistoryItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(139, 92, 246, 0.1);
        border-color: rgba(139, 92, 246, 0.3);
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .symbol {
        font-weight: 600;
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    }

    .strategy {
        font-size: 0.85rem;
        color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
    }

    .return {
        font-weight: 700;
        font-size: 1.1rem;
        color: ${props => props.$positive ? '#00ff88' : '#ff4757'};
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }
`;

const IconButton = styled.button`
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? 'rgba(255, 71, 87, 0.2)' : 'rgba(139, 92, 246, 0.2)'};
        color: ${props => props.$danger ? '#ff4757' : '#a78bfa'};
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: ${props => props.theme?.text?.secondary || '#a0a8b3'};

    svg {
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    p {
        margin-bottom: 0.5rem;
    }
`;

const EliteBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    border-radius: 20px;
    color: #1e2028;
    font-weight: 600;
    font-size: 0.9rem;
    margin-left: 1rem;
`;

const EquityCurve = styled.div`
    height: 200px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    margin-bottom: 1.5rem;

    .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.85rem;
        color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
    }

    .chart {
        flex: 1;
        display: flex;
        align-items: flex-end;
        gap: 2px;
    }

    .bar {
        flex: 1;
        background: linear-gradient(to top, #8b5cf6, #00adef);
        border-radius: 2px 2px 0 0;
        transition: all 0.3s ease;

        &:hover {
            opacity: 0.8;
        }
    }
`;

const LoadingOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    border-radius: 16px;
    z-index: 10;

    svg {
        animation: ${spin} 1s linear infinite;
        color: #8b5cf6;
    }

    p {
        color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
    }
`;

const ParametersSection = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ParameterRow = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;

    label {
        flex: 1;
        font-size: 0.9rem;
        color: ${props => props.theme?.text?.secondary || '#a0a8b3'};
    }

    input {
        width: 80px;
        padding: 0.5rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
        text-align: center;
    }
`;

// ============ STRATEGIES DATA ============
const STRATEGIES = [
    {
        id: 'ma-crossover',
        name: 'Moving Average Crossover',
        description: 'Buy when fast MA crosses above slow MA, sell when it crosses below',
        parameters: [
            { key: 'fastPeriod', label: 'Fast Period', default: 10, min: 5, max: 50 },
            { key: 'slowPeriod', label: 'Slow Period', default: 30, min: 10, max: 200 }
        ]
    },
    {
        id: 'rsi-reversal',
        name: 'RSI Reversal',
        description: 'Buy when RSI is oversold, sell when overbought',
        parameters: [
            { key: 'period', label: 'RSI Period', default: 14, min: 5, max: 30 },
            { key: 'oversold', label: 'Oversold Level', default: 30, min: 10, max: 40 },
            { key: 'overbought', label: 'Overbought Level', default: 70, min: 60, max: 90 }
        ]
    },
    {
        id: 'macd-crossover',
        name: 'MACD Crossover',
        description: 'Buy on bullish MACD crossover, sell on bearish',
        parameters: []
    },
    {
        id: 'bollinger-bands',
        name: 'Bollinger Bands',
        description: 'Buy when price is below lower band, sell above upper band',
        parameters: [
            { key: 'period', label: 'Period', default: 20, min: 10, max: 50 },
            { key: 'stdDevs', label: 'Std Devs', default: 2, min: 1, max: 3 }
        ]
    },
    {
        id: 'breakout',
        name: 'Breakout Strategy',
        description: 'Buy on breakout above resistance, sell below support',
        parameters: [
            { key: 'lookbackPeriod', label: 'Lookback', default: 20, min: 10, max: 50 }
        ]
    },
    {
        id: 'mean-reversion',
        name: 'Mean Reversion',
        description: 'Buy when price is far below moving average, sell when above',
        parameters: [
            { key: 'period', label: 'MA Period', default: 20, min: 10, max: 50 },
            { key: 'stdDevs', label: 'Threshold', default: 2, min: 1, max: 3 }
        ]
    }
];

function BacktestingPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('results');
    const [loading, setLoading] = useState(false);
    const [backtests, setBacktests] = useState([]);
    const [currentResult, setCurrentResult] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        symbol: 'AAPL',
        strategy: 'ma-crossover',
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        initialCapital: 10000,
        parameters: {}
    });

    // Get selected strategy info
    const selectedStrategy = STRATEGIES.find(s => s.id === formData.strategy);

    // Initialize parameters when strategy changes
    useEffect(() => {
        if (selectedStrategy) {
            const defaultParams = {};
            selectedStrategy.parameters.forEach(p => {
                defaultParams[p.key] = p.default;
            });
            setFormData(prev => ({ ...prev, parameters: defaultParams }));
        }
    }, [formData.strategy]);

    // Fetch backtests history
    useEffect(() => {
        fetchBacktests();
    }, []);

    const fetchBacktests = async () => {
        try {
            const response = await api.get('/backtests');
            setBacktests(response.data || []);
        } catch (error) {
            console.error('Error fetching backtests:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleParameterChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            parameters: { ...prev.parameters, [key]: parseInt(value) || 0 }
        }));
    };

    const runBacktest = async () => {
        if (!formData.symbol || !formData.strategy) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/backtest', {
                symbol: formData.symbol.toUpperCase(),
                strategy: formData.strategy,
                startDate: formData.startDate,
                endDate: formData.endDate,
                initialCapital: parseInt(formData.initialCapital),
                parameters: formData.parameters
            });

            if (response.data.success) {
                toast.success('Backtest completed!');
                // Fetch full results
                const fullResult = await api.get(`/backtest/${response.data.backtest._id}`);
                setCurrentResult(fullResult.data);
                setActiveTab('results');
                fetchBacktests();
            }
        } catch (error) {
            console.error('Backtest error:', error);
            toast.error(error.response?.data?.error || 'Backtest failed');
        } finally {
            setLoading(false);
        }
    };

    const viewBacktest = async (id) => {
        try {
            const response = await api.get(`/backtest/${id}`);
            setCurrentResult(response.data);
            setActiveTab('results');
        } catch (error) {
            toast.error('Failed to load backtest');
        }
    };

    const deleteBacktest = async (id) => {
        try {
            await api.delete(`/backtest/${id}`);
            toast.success('Backtest deleted');
            fetchBacktests();
            if (currentResult?._id === id) {
                setCurrentResult(null);
            }
        } catch (error) {
            toast.error('Failed to delete backtest');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Check if user has Elite subscription (use 'status' not 'plan')
    const hasElite = user?.subscription?.status === 'elite';

    if (!hasElite) {
        return (
            <PageContainer theme={theme}>
                <Header>
                    <BackButton onClick={() => navigate('/dashboard')} theme={theme}>
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </BackButton>
                    <Title>Strategy Backtesting</Title>
                </Header>
                <Card theme={theme} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <Award size={64} style={{ color: '#ffd700', marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>Elite Feature</h2>
                    <p style={{ color: theme?.text?.secondary, marginBottom: '1.5rem' }}>
                        Strategy backtesting is available exclusively for Elite subscribers.
                        Test your trading strategies on historical data before risking real capital.
                    </p>
                    <RunButton onClick={() => navigate('/pricing')}>
                        Upgrade to Elite
                    </RunButton>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer theme={theme}>
            <Header>
                <BackButton onClick={() => navigate('/dashboard')} theme={theme}>
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </BackButton>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Title>Strategy Backtesting</Title>
                    <EliteBadge>
                        <Award size={16} />
                        Elite Feature
                    </EliteBadge>
                </div>
                <Subtitle>Test trading strategies on historical data</Subtitle>
            </Header>

            <MainContent>
                {/* Configuration Panel */}
                <Card theme={theme}>
                    <CardTitle theme={theme}>
                        <Settings size={20} />
                        Configure Backtest
                    </CardTitle>

                    <FormGroup>
                        <Label theme={theme}>Symbol</Label>
                        <Input
                            type="text"
                            name="symbol"
                            value={formData.symbol}
                            onChange={handleInputChange}
                            placeholder="e.g., AAPL, MSFT, BTC"
                            theme={theme}
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label theme={theme}>Strategy</Label>
                        <Select
                            name="strategy"
                            value={formData.strategy}
                            onChange={handleInputChange}
                            theme={theme}
                        >
                            {STRATEGIES.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </Select>
                        {selectedStrategy && (
                            <p style={{ fontSize: '0.85rem', color: theme?.text?.secondary, marginTop: '0.5rem' }}>
                                {selectedStrategy.description}
                            </p>
                        )}
                    </FormGroup>

                    <FormGroup>
                        <Label theme={theme}>Date Range</Label>
                        <DateInputRow>
                            <Input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                theme={theme}
                            />
                            <Input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                theme={theme}
                            />
                        </DateInputRow>
                    </FormGroup>

                    <FormGroup>
                        <Label theme={theme}>Initial Capital ($)</Label>
                        <Input
                            type="number"
                            name="initialCapital"
                            value={formData.initialCapital}
                            onChange={handleInputChange}
                            min="1000"
                            step="1000"
                            theme={theme}
                        />
                    </FormGroup>

                    {selectedStrategy?.parameters.length > 0 && (
                        <ParametersSection>
                            <Label theme={theme} style={{ marginBottom: '1rem' }}>Strategy Parameters</Label>
                            {selectedStrategy.parameters.map(param => (
                                <ParameterRow key={param.key} theme={theme}>
                                    <label>{param.label}</label>
                                    <input
                                        type="number"
                                        value={formData.parameters[param.key] || param.default}
                                        onChange={(e) => handleParameterChange(param.key, e.target.value)}
                                        min={param.min}
                                        max={param.max}
                                    />
                                </ParameterRow>
                            ))}
                        </ParametersSection>
                    )}

                    <RunButton onClick={runBacktest} disabled={loading}>
                        {loading ? (
                            <>
                                <RefreshCw size={20} className="spinning" />
                                Running Backtest...
                            </>
                        ) : (
                            <>
                                <Play size={20} />
                                Run Backtest
                            </>
                        )}
                    </RunButton>
                </Card>

                {/* Results Panel */}
                <ResultsCard theme={theme} style={{ position: 'relative' }}>
                    <TabsContainer>
                        <Tab
                            $active={activeTab === 'results'}
                            onClick={() => setActiveTab('results')}
                            theme={theme}
                        >
                            <BarChart3 size={18} />
                            Results
                        </Tab>
                        <Tab
                            $active={activeTab === 'trades'}
                            onClick={() => setActiveTab('trades')}
                            theme={theme}
                        >
                            <Activity size={18} />
                            Trades
                        </Tab>
                        <Tab
                            $active={activeTab === 'history'}
                            onClick={() => setActiveTab('history')}
                            theme={theme}
                        >
                            <History size={18} />
                            History ({backtests.length})
                        </Tab>
                    </TabsContainer>

                    {activeTab === 'results' && currentResult && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ marginBottom: '0.25rem' }}>
                                    {currentResult.symbol} - {currentResult.strategy}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: theme?.text?.secondary }}>
                                    {formatDate(currentResult.startDate)} to {formatDate(currentResult.endDate)}
                                </p>
                            </div>

                            <MetricsGrid>
                                <MetricCard theme={theme} $positive={currentResult.results?.totalReturnPercent > 0} $negative={currentResult.results?.totalReturnPercent < 0}>
                                    <div className="label">Total Return</div>
                                    <div className="value">
                                        {currentResult.results?.totalReturnPercent > 0 ? '+' : ''}
                                        {currentResult.results?.totalReturnPercent?.toFixed(2)}%
                                    </div>
                                </MetricCard>
                                <MetricCard theme={theme}>
                                    <div className="label">Final Value</div>
                                    <div className="value">${currentResult.results?.finalValue?.toLocaleString()}</div>
                                </MetricCard>
                                <MetricCard theme={theme} $positive={currentResult.results?.sharpeRatio > 1}>
                                    <div className="label">Sharpe Ratio</div>
                                    <div className="value">{currentResult.results?.sharpeRatio?.toFixed(2)}</div>
                                </MetricCard>
                                <MetricCard theme={theme} $negative>
                                    <div className="label">Max Drawdown</div>
                                    <div className="value">-{currentResult.results?.maxDrawdownPercent?.toFixed(2)}%</div>
                                </MetricCard>
                                <MetricCard theme={theme} $positive={currentResult.results?.winRate > 50}>
                                    <div className="label">Win Rate</div>
                                    <div className="value">{currentResult.results?.winRate?.toFixed(1)}%</div>
                                </MetricCard>
                                <MetricCard theme={theme}>
                                    <div className="label">Total Trades</div>
                                    <div className="value">{currentResult.results?.totalTrades}</div>
                                </MetricCard>
                                <MetricCard theme={theme} $positive={currentResult.results?.profitFactor > 1}>
                                    <div className="label">Profit Factor</div>
                                    <div className="value">{currentResult.results?.profitFactor?.toFixed(2)}</div>
                                </MetricCard>
                                <MetricCard theme={theme}>
                                    <div className="label">Volatility</div>
                                    <div className="value">{currentResult.results?.volatility?.toFixed(1)}%</div>
                                </MetricCard>
                            </MetricsGrid>

                            {/* Simple Equity Curve */}
                            {currentResult.equityCurve && currentResult.equityCurve.length > 0 && (
                                <EquityCurve theme={theme}>
                                    <div className="header">
                                        <span>Equity Curve</span>
                                        <span>${currentResult.results?.finalValue?.toLocaleString()}</span>
                                    </div>
                                    <div className="chart">
                                        {currentResult.equityCurve
                                            .filter((_, i) => i % Math.ceil(currentResult.equityCurve.length / 50) === 0)
                                            .map((point, i, arr) => {
                                                const min = Math.min(...arr.map(p => p.value));
                                                const max = Math.max(...arr.map(p => p.value));
                                                const height = max === min ? 50 : ((point.value - min) / (max - min)) * 100;
                                                return (
                                                    <div
                                                        key={i}
                                                        className="bar"
                                                        style={{ height: `${Math.max(5, height)}%` }}
                                                        title={`$${point.value?.toFixed(0)}`}
                                                    />
                                                );
                                            })}
                                    </div>
                                </EquityCurve>
                            )}
                        </>
                    )}

                    {activeTab === 'trades' && currentResult?.trades && (
                        <TradesTable>
                            <Table theme={theme}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Price</th>
                                        <th>Shares</th>
                                        <th>Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentResult.trades.slice(0, 50).map((trade, i) => (
                                        <tr key={i}>
                                            <td>{formatDate(trade.date)}</td>
                                            <td className={trade.type}>{trade.type.toUpperCase()}</td>
                                            <td>${trade.price?.toFixed(2)}</td>
                                            <td>{trade.shares}</td>
                                            <td className={trade.profit > 0 ? 'profit-positive' : trade.profit < 0 ? 'profit-negative' : ''}>
                                                {trade.type === 'sell' ? (
                                                    <>
                                                        {trade.profit > 0 ? '+' : ''}${trade.profit?.toFixed(2)}
                                                        <span style={{ fontSize: '0.8rem', marginLeft: '0.25rem' }}>
                                                            ({trade.profitPercent > 0 ? '+' : ''}{trade.profitPercent?.toFixed(1)}%)
                                                        </span>
                                                    </>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {currentResult.trades.length > 50 && (
                                <p style={{ textAlign: 'center', padding: '1rem', color: theme?.text?.secondary }}>
                                    Showing 50 of {currentResult.trades.length} trades
                                </p>
                            )}
                        </TradesTable>
                    )}

                    {activeTab === 'history' && (
                        <HistoryList>
                            {backtests.length === 0 ? (
                                <EmptyState theme={theme}>
                                    <LineChart size={48} />
                                    <p>No backtests yet</p>
                                    <p style={{ fontSize: '0.85rem' }}>Run your first backtest to see results here</p>
                                </EmptyState>
                            ) : (
                                backtests.map(bt => (
                                    <HistoryItem
                                        key={bt._id}
                                        theme={theme}
                                        $positive={bt.totalReturn > 0}
                                        onClick={() => viewBacktest(bt._id)}
                                    >
                                        <div className="info">
                                            <span className="symbol">{bt.symbol}</span>
                                            <span className="strategy">{bt.strategy}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span className="return">
                                                {bt.totalReturn > 0 ? '+' : ''}{bt.totalReturn?.toFixed(2)}%
                                            </span>
                                            <div className="actions" onClick={e => e.stopPropagation()}>
                                                <IconButton onClick={() => viewBacktest(bt._id)} theme={theme}>
                                                    <Eye size={16} />
                                                </IconButton>
                                                <IconButton $danger onClick={() => deleteBacktest(bt._id)} theme={theme}>
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </div>
                                        </div>
                                    </HistoryItem>
                                ))
                            )}
                        </HistoryList>
                    )}

                    {activeTab === 'results' && !currentResult && (
                        <EmptyState theme={theme}>
                            <BarChart3 size={48} />
                            <p>No results to display</p>
                            <p style={{ fontSize: '0.85rem' }}>Configure and run a backtest to see performance metrics</p>
                        </EmptyState>
                    )}

                    {activeTab === 'trades' && !currentResult?.trades && (
                        <EmptyState theme={theme}>
                            <Activity size={48} />
                            <p>No trades to display</p>
                            <p style={{ fontSize: '0.85rem' }}>Run a backtest to see trade history</p>
                        </EmptyState>
                    )}
                </ResultsCard>
            </MainContent>
        </PageContainer>
    );
}

export default BacktestingPage;
