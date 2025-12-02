// client/src/pages/PredictionHistoryPage.js - View past predictions and accuracy

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import styled, { keyframes } from 'styled-components';
import { getAssetName } from '../utils/stockNames';
import {
    Brain, TrendingUp, TrendingDown, Target, Clock,
    CheckCircle, XCircle, AlertCircle, ArrowLeft,
    Calendar, DollarSign, Percent, Award, BarChart3,
    Filter, RefreshCw, ChevronDown, Trophy, Flame,
    Eye, Trash2, Search, SlidersHorizontal
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
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

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding: 80px 2rem 2rem;
    position: relative;
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
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
`;

// ============ STATS CARDS ============
const StatsGrid = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${props => props.$color || props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: ${props => props.$color || props.theme?.brand?.accent || '#8b5cf6'}99;
        box-shadow: 0 10px 40px ${props => props.$color || props.theme?.brand?.accent || '#8b5cf6'}33;
    }
`;

const StatIcon = styled.div`
    width: 50px;
    height: 50px;
    margin: 0 auto 1rem;
    background: ${props => props.$color || props.theme?.brand?.accent || '#8b5cf6'}33;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme?.brand?.accent || '#8b5cf6'};
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
    margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
`;

// ============ FILTERS ============
const FiltersContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    animation: ${fadeIn} 0.7s ease-out;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const FilterLabel = styled.span`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
`;

const FilterSelect = styled.select`
    padding: 0.5rem 1rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 8px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    }

    option {
        background: #1e293b;
    }
`;

const SearchInput = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 8px;
    flex: 1;
    max-width: 300px;

    input {
        background: transparent;
        border: none;
        color: ${props => props.theme?.text?.primary || '#e0e6ed'};
        font-size: 0.9rem;
        width: 100%;

        &:focus {
            outline: none;
        }

        &::placeholder {
            color: ${props => props.theme?.text?.tertiary || '#64748b'};
        }
    }

    svg {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border: 1px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 8px;
    color: ${props => props.theme?.brand?.accent || '#a78bfa'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        animation: ${props => props.$loading ? spin : 'none'} 1s linear infinite;
    }
`;

// ============ PREDICTIONS LIST ============
const PredictionsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const PredictionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const PredictionCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${props => {
        if (props.$status === 'correct') return `${props.theme?.success || '#10b981'}66`;
        if (props.$status === 'incorrect') return `${props.theme?.error || '#ef4444'}66`;
        return `${props.theme?.brand?.accent || '#8b5cf6'}4D`;
    }};
    border-radius: 16px;
    padding: 1.5rem;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 1.5rem;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: ${props => {
            if (props.$status === 'correct') return props.theme?.success || '#10b981';
            if (props.$status === 'incorrect') return props.theme?.error || '#ef4444';
            return props.theme?.warning || '#f59e0b';
        }};
    }

    &:hover {
        transform: translateX(5px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
`;

const SymbolSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const SymbolName = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CompanyName = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
`;

const PredictionDetails = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const DetailLabel = styled.span`
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
    color: ${props => props.$color || props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const OutcomeSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 120px;
`;

const OutcomeBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.9rem;
    background: ${props => {
        if (props.$status === 'correct') return `${props.theme?.success || '#10b981'}33`;
        if (props.$status === 'incorrect') return `${props.theme?.error || '#ef4444'}33`;
        return `${props.theme?.warning || '#f59e0b'}33`;
    }};
    color: ${props => {
        if (props.$status === 'correct') return props.theme?.success || '#10b981';
        if (props.$status === 'incorrect') return props.theme?.error || '#ef4444';
        return props.theme?.warning || '#f59e0b';
    }};
    border: 1px solid ${props => {
        if (props.$status === 'correct') return `${props.theme?.success || '#10b981'}66`;
        if (props.$status === 'incorrect') return `${props.theme?.error || '#ef4444'}66`;
        return `${props.theme?.warning || '#f59e0b'}66`;
    }};
`;

const AccuracyScore = styled.div`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

const DateSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-end;
    min-width: 100px;

    @media (max-width: 900px) {
        align-items: flex-start;
    }
`;

const DateText = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 1.5rem;
    background: ${props => props.theme?.brand?.accent || '#8b5cf6'}1A;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
`;

const EmptyTitle = styled.h3`
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1rem;
    margin-bottom: 1.5rem;
`;

const CreatePredictionButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'};
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.theme?.brand?.accent || '#8b5cf6'}66;
    }
`;

// ============ LOADING ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    gap: 1rem;
`;

const LoadingSpinner = styled.div`
    width: 50px;
    height: 50px;
    border: 4px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}33;
    border-top-color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

// ============ COMPONENT ============
const PredictionHistoryPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [predictions, setPredictions] = useState([]);
    const [stats, setStats] = useState({
        totalPredictions: 0,
        correctPredictions: 0,
        accuracy: 0,
        pendingPredictions: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');

    const successColor = theme?.success || '#10b981';
    const errorColor = theme?.error || '#ef4444';
    const warningColor = theme?.warning || '#f59e0b';
    const accentColor = theme?.brand?.accent || '#8b5cf6';

    // Fetch predictions and stats
    const fetchData = async (showRefreshToast = false) => {
        try {
            if (showRefreshToast) setRefreshing(true);
            
            const [historyRes, statsRes] = await Promise.all([
                api.get('/predictions/history?limit=100'),
                api.get('/predictions/stats')
            ]);

            setPredictions(historyRes.data.predictions || historyRes.data || []);
            
            if (statsRes.data) {
                setStats({
                    totalPredictions: statsRes.data.totalPredictions || 0,
                    correctPredictions: statsRes.data.correctPredictions || 0,
                    accuracy: statsRes.data.accuracy || 0,
                    pendingPredictions: statsRes.data.pendingPredictions || 0
                });
            }

            if (showRefreshToast) {
                toast.success('Data refreshed!', 'Updated');
            }
        } catch (error) {
            console.error('Error fetching prediction history:', error);
            toast.error('Failed to load prediction history', 'Error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Check expired predictions
    const handleCheckExpired = async () => {
        try {
            setRefreshing(true);
            await api.post('/predictions/check-outcomes');
            await fetchData(true);
        } catch (error) {
            console.error('Error checking expired:', error);
            toast.error('Failed to check predictions', 'Error');
            setRefreshing(false);
        }
    };

    // Filter and sort predictions
    const filteredPredictions = predictions
        .filter(pred => {
            if (filter === 'all') return true;
            if (filter === 'pending') return pred.status === 'pending';
            if (filter === 'correct') return pred.status === 'correct';
            if (filter === 'incorrect') return pred.status === 'incorrect';
            return true;
        })
        .filter(pred => {
            if (!searchTerm) return true;
            return pred.symbol?.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'confidence') return (b.confidence || 0) - (a.confidence || 0);
            if (sortBy === 'symbol') return (a.symbol || '').localeCompare(b.symbol || '');
            return 0;
        });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get outcome icon
    const getOutcomeIcon = (status) => {
        if (status === 'correct') return <CheckCircle size={18} />;
        if (status === 'incorrect') return <XCircle size={18} />;
        return <Clock size={18} />;
    };

    // Get outcome text
    const getOutcomeText = (status) => {
        if (status === 'correct') return 'Correct';
        if (status === 'incorrect') return 'Incorrect';
        return 'Pending';
    };

    if (loading) {
        return (
            <PageContainer theme={theme}>
                <LoadingContainer>
                    <LoadingSpinner theme={theme} />
                    <LoadingText theme={theme}>Loading prediction history...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer theme={theme}>
            <Header>
                <BackButton theme={theme} onClick={() => navigate('/predict')}>
                    <ArrowLeft size={18} />
                    Back to Predictions
                </BackButton>
                <Title theme={theme}>
                    <Clock size={36} />
                    Prediction History
                </Title>
                <Subtitle theme={theme}>
                    Track your past predictions and see how accurate you've been
                </Subtitle>
            </Header>

            {/* Stats Cards */}
            <StatsGrid>
                <StatCard theme={theme} $color={accentColor}>
                    <StatIcon theme={theme} $color={accentColor}>
                        <BarChart3 size={24} />
                    </StatIcon>
                    <StatValue $color={accentColor}>{stats.totalPredictions}</StatValue>
                    <StatLabel theme={theme}>Total Predictions</StatLabel>
                </StatCard>
                <StatCard theme={theme} $color={successColor}>
                    <StatIcon theme={theme} $color={successColor}>
                        <CheckCircle size={24} />
                    </StatIcon>
                    <StatValue $color={successColor}>{stats.correctPredictions}</StatValue>
                    <StatLabel theme={theme}>Correct</StatLabel>
                </StatCard>
                <StatCard theme={theme} $color={errorColor}>
                    <StatIcon theme={theme} $color={errorColor}>
                        <XCircle size={24} />
                    </StatIcon>
                    <StatValue $color={errorColor}>
                        {stats.totalPredictions - stats.correctPredictions - (stats.pendingPredictions || 0)}
                    </StatValue>
                    <StatLabel theme={theme}>Incorrect</StatLabel>
                </StatCard>
                <StatCard theme={theme} $color={stats.accuracy >= 50 ? successColor : errorColor}>
                    <StatIcon theme={theme} $color={stats.accuracy >= 50 ? successColor : errorColor}>
                        <Trophy size={24} />
                    </StatIcon>
                    <StatValue $color={stats.accuracy >= 50 ? successColor : errorColor}>
                        {stats.accuracy.toFixed(1)}%
                    </StatValue>
                    <StatLabel theme={theme}>Accuracy Rate</StatLabel>
                </StatCard>
            </StatsGrid>

            {/* Filters */}
            <FiltersContainer>
                <FilterGroup>
                    <FilterLabel theme={theme}>Status:</FilterLabel>
                    <FilterSelect 
                        theme={theme} 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="correct">Correct</option>
                        <option value="incorrect">Incorrect</option>
                    </FilterSelect>
                </FilterGroup>

                <FilterGroup>
                    <FilterLabel theme={theme}>Sort:</FilterLabel>
                    <FilterSelect 
                        theme={theme} 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="confidence">Highest Confidence</option>
                        <option value="symbol">Symbol A-Z</option>
                    </FilterSelect>
                </FilterGroup>

                <SearchInput theme={theme}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by symbol..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchInput>

                <RefreshButton 
                    theme={theme} 
                    onClick={handleCheckExpired}
                    disabled={refreshing}
                    $loading={refreshing}
                >
                    <RefreshCw size={18} />
                    {refreshing ? 'Checking...' : 'Check Expired'}
                </RefreshButton>

                <RefreshButton 
                    theme={theme} 
                    onClick={async () => {
                        try {
                            setRefreshing(true);
                            const response = await api.post('/predictions/cleanup');
                            toast.success(`Cleanup complete! Deleted ${response.data.staleDeleted} stale predictions`, 'Cleanup');
                            await fetchData(false);
                        } catch (error) {
                            console.error('Cleanup error:', error);
                            toast.error('Cleanup failed', 'Error');
                        } finally {
                            setRefreshing(false);
                        }
                    }}
                    disabled={refreshing}
                    style={{ marginLeft: '0.5rem' }}
                >
                    <Trash2 size={18} />
                    Cleanup Stale
                </RefreshButton>
            </FiltersContainer>

            {/* Predictions List */}
            <PredictionsContainer>
                {filteredPredictions.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon theme={theme}>
                            <Brain size={48} color={accentColor} />
                        </EmptyIcon>
                        <EmptyTitle theme={theme}>
                            {predictions.length === 0 ? 'No Predictions Yet' : 'No Matching Predictions'}
                        </EmptyTitle>
                        <EmptyText theme={theme}>
                            {predictions.length === 0 
                                ? 'Start making predictions to build your track record!'
                                : 'Try adjusting your filters or search term'
                            }
                        </EmptyText>
                        {predictions.length === 0 && (
                            <CreatePredictionButton 
                                theme={theme}
                                onClick={() => navigate('/predict')}
                            >
                                <Brain size={20} />
                                Make Your First Prediction
                            </CreatePredictionButton>
                        )}
                    </EmptyState>
                ) : (
                    <PredictionsList>
                        {filteredPredictions.map((prediction) => (
                            <PredictionCard 
                                key={prediction._id} 
                                theme={theme}
                                $status={prediction.status}
                            >
                                <SymbolSection>
                                    <SymbolName theme={theme}>
                                        {prediction.direction === 'UP' ? (
                                            <TrendingUp size={24} color={successColor} />
                                        ) : (
                                            <TrendingDown size={24} color={errorColor} />
                                        )}
                                        {prediction.symbol}
                                    </SymbolName>
                                    <CompanyName theme={theme}>
                                        {getAssetName(prediction.symbol)}
                                    </CompanyName>
                                </SymbolSection>

                                <PredictionDetails>
                                    <DetailItem>
                                        <DetailLabel theme={theme}>Entry Price</DetailLabel>
                                        <DetailValue theme={theme}>
                                            <DollarSign size={14} />
                                            {prediction.currentPrice?.toFixed(2)}
                                        </DetailValue>
                                    </DetailItem>
                                    <DetailItem>
                                        <DetailLabel theme={theme}>Target</DetailLabel>
                                        <DetailValue theme={theme}>
                                            <Target size={14} />
                                            ${prediction.targetPrice?.toFixed(2)}
                                        </DetailValue>
                                    </DetailItem>
                                    <DetailItem>
                                        <DetailLabel theme={theme}>Change</DetailLabel>
                                        <DetailValue 
                                            theme={theme}
                                            $color={prediction.direction === 'UP' ? successColor : errorColor}
                                        >
                                            {prediction.direction === 'UP' ? '+' : ''}
                                            {prediction.priceChangePercent?.toFixed(2)}%
                                        </DetailValue>
                                    </DetailItem>
                                    <DetailItem>
                                        <DetailLabel theme={theme}>Confidence</DetailLabel>
                                        <DetailValue theme={theme}>
                                            <Award size={14} />
                                            {prediction.confidence?.toFixed(0)}%
                                        </DetailValue>
                                    </DetailItem>
                                    {prediction.outcome?.actualPrice && (
                                        <DetailItem>
                                            <DetailLabel theme={theme}>Actual Price</DetailLabel>
                                            <DetailValue 
                                                theme={theme}
                                                $color={prediction.status === 'correct' ? successColor : errorColor}
                                            >
                                                ${prediction.outcome.actualPrice.toFixed(2)}
                                            </DetailValue>
                                        </DetailItem>
                                    )}
                                </PredictionDetails>

                                <OutcomeSection>
                                    <OutcomeBadge theme={theme} $status={prediction.status}>
                                        {getOutcomeIcon(prediction.status)}
                                        {getOutcomeText(prediction.status)}
                                    </OutcomeBadge>
                                    {prediction.outcome?.accuracy !== undefined && (
                                        <AccuracyScore theme={theme}>
                                            {prediction.outcome.accuracy.toFixed(1)}% accurate
                                        </AccuracyScore>
                                    )}
                                </OutcomeSection>

                                <DateSection>
                                    <DateText theme={theme}>
                                        <Calendar size={14} />
                                        {formatDate(prediction.createdAt)}
                                    </DateText>
                                    {prediction.status === 'pending' && (
                                        <DateText theme={theme}>
                                            <Clock size={14} />
                                            Expires: {formatDate(prediction.expiresAt)}
                                        </DateText>
                                    )}
                                </DateSection>
                            </PredictionCard>
                        ))}
                    </PredictionsList>
                )}
            </PredictionsContainer>
        </PageContainer>
    );
};

export default PredictionHistoryPage;