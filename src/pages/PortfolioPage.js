// client/src/pages/PortfolioPage.js - ULTIMATE EPIC VERSION

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3,
    Activity, Plus, Trash2, X, Brain, Target, Zap, 
    ArrowUpRight, ArrowDownRight, Eye, Flame, Star
} from 'lucide-react';
import {
    PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area
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
    text-align: center;
    position: relative;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    text-shadow: 0 0 30px rgba(0, 173, 237, 0.5);
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
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
`;

const HoldingHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1.5rem;
`;

const HoldingSymbol = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const DeleteButton = styled.button`
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

// ============ COMPONENT ============
const PortfolioPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const [portfolio, setPortfolio] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [predictions, setPredictions] = useState({});
    const [loadingPredictions, setLoadingPredictions] = useState({});
    const [formData, setFormData] = useState({
        symbol: '',
        shares: '',
        averagePrice: ''
    });

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const response = await api.get('/portfolio');
            const holdings = response.data.holdings || response.data || [];
            setPortfolio(holdings);
            calculateStats(holdings);
            
            holdings.forEach(holding => {
                fetchPrediction(holding.symbol || holding.ticker);
            });
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            toast.error('Failed to load portfolio', 'Error');
            setPortfolio([]);
        } finally {
            setLoading(false);
        }
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

    const handleAddHolding = async (e) => {
        e.preventDefault();
        
        const symbol = formData.symbol.toUpperCase().trim();
        const shares = parseFloat(formData.shares);
        const avgPrice = parseFloat(formData.averagePrice);
        
        // ✅ VALIDATION WITH TOASTS
        if (!symbol) {
            toast.warning('Please enter a stock symbol', 'Missing Symbol');
            return;
        }
        
        if (shares <= 0) {
            toast.warning('Number of shares must be greater than 0', 'Invalid Shares');
            return;
        }
        
        if (avgPrice <= 0) {
            toast.warning('Average price must be greater than 0', 'Invalid Price');
            return;
        }
        
        try {
            await api.post('/portfolio/holdings', {
                symbol,
                shares,
                averagePrice: avgPrice
            });
            
            toast.success(`${shares} shares of ${symbol} added to portfolio!`, 'Holding Added'); // ✅ SUCCESS TOAST
            setShowAddModal(false);
            setFormData({ symbol: '', shares: '', averagePrice: '' });
            fetchPortfolio();
        } catch (error) {
            console.error('Error adding holding:', error);
            
            // ✅ SPECIFIC ERROR TOASTS
            const errorMsg = error.response?.data?.error || error.response?.data?.msg || '';
            
            if (errorMsg.includes('already exists') || error.response?.status === 409) {
                toast.warning(`${symbol} is already in your portfolio`, 'Already Exists');
            } else if (errorMsg.includes('not found') || error.response?.status === 404) {
                toast.error(`Stock symbol ${symbol} not found`, 'Invalid Symbol');
            } else if (error.response?.status === 429) {
                toast.warning('Too many requests. Please wait a moment.', 'Slow Down');
            } else {
                toast.error('Failed to add holding to portfolio', 'Error');
            }
        }
    };

    const handleDeleteHolding = async (holdingId, symbol) => {
        if (!window.confirm(`Delete ${symbol} from portfolio?`)) return;

        try {
            await api.delete(`/portfolio/holdings/${holdingId}`);
            toast.success(`${symbol} removed from portfolio`, 'Holding Deleted'); // ✅ SUCCESS TOAST
            fetchPortfolio();
        } catch (error) {
            console.error('Error deleting holding:', error);
            toast.error(`Failed to remove ${symbol}`, 'Error'); // ✅ ERROR TOAST
        }
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
                    <Title>My Portfolio</Title>
                    <Subtitle>Track your investments with AI-powered insights</Subtitle>
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
                            <Form onSubmit={handleAddHolding}>
                                <FormGroup>
                                    <Label>Stock Symbol</Label>
                                    <Input
                                        type="text"
                                        placeholder="AAPL"
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                        required
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
                <Title>My Portfolio</Title>
                <Subtitle>AI-powered portfolio tracking and predictions</Subtitle>
            </Header>

            {/* STATS */}
            {stats && (
                <StatsGrid>
                    <StatCard>
                        <StatIcon>
                            <DollarSign size={24} />
                        </StatIcon>
                        <StatLabel>Total Value</StatLabel>
                        <StatValue>
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
                        <StatValue positive={stats.totalGain >= 0} negative={stats.totalGain < 0}>
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

            {/* HOLDINGS */}
            <HoldingsGrid>
                {portfolio.map((holding) => {
                    const currentPrice = holding.currentPrice || holding.current_price || holding.price || 0;
                    const avgPrice = holding.averagePrice || holding.average_price || holding.purchasePrice || currentPrice;
                    const shares = holding.shares || holding.quantity || 0;
                    const symbol = holding.symbol || holding.ticker || 'Unknown';
                    
                    const totalValue = currentPrice * shares;
                    const totalCost = avgPrice * shares;
                    const gain = totalValue - totalCost;
                    const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;

                    const prediction = predictions[symbol];
                    const loadingPred = loadingPredictions[symbol];

                    return (
                        <HoldingCard key={holding._id || symbol} positive={gain >= 0}>
                            <HoldingHeader>
                                <HoldingSymbol>
                                    {symbol}
                                    {gain >= 0 ? 
                                        <Star size={20} color="#10b981" /> : 
                                        <Flame size={20} color="#ef4444" />
                                    }
                                </HoldingSymbol>
                                <DeleteButton onClick={() => handleDeleteHolding(holding._id, symbol)}>
                                    <Trash2 size={18} />
                                </DeleteButton>
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

                            <PerformanceBar positive={gain >= 0}>
                                <PerformanceIcon positive={gain >= 0}>
                                    {gain >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </PerformanceIcon>
                                <PerformanceDetails>
                                    <PerformanceValue positive={gain >= 0}>
                                        ${Math.abs(gain).toFixed(2)}
                                    </PerformanceValue>
                                    <PerformancePercent positive={gain >= 0}>
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
                    );
                })}
            </HoldingsGrid>

            {/* CHARTS */}
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
                        <Form onSubmit={handleAddHolding}>
                            <FormGroup>
                                <Label>Stock Symbol</Label>
                                <Input
                                    type="text"
                                    placeholder="AAPL"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                    required
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
};

export default PortfolioPage;