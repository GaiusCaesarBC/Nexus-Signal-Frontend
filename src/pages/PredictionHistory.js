// client/src/pages/PredictionHistory.js - TRACK ALL YOUR PREDICTIONS

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LivePredictionCard from '../components/LivePredictionCard';
import {
    History, TrendingUp, CheckCircle, XCircle, Activity,
    Award, BarChart3, RefreshCw, Filter
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

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
`;

const Header = styled.div`
    max-width: 1200px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #00adef 50%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    margin-bottom: 2rem;
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(139, 92, 246, 0.6);
        box-shadow: 0 15px 40px rgba(139, 92, 246, 0.3);
    }
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 1rem;
    background: ${props => props.$gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.$color || '#8b5cf6'};
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const Controls = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const FilterButtons = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const FilterButton = styled.button`
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

    &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%);
        border-color: rgba(139, 92, 246, 0.5);
        color: #a78bfa;
        transform: translateY(-2px);
    }
`;

const RefreshButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;

        svg {
            animation: ${spin} 1s linear infinite;
        }
    }
`;

const Content = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const PredictionsGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
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

// ============ COMPONENT ============
const PredictionHistory = () => {
    const { api } = useAuth();
    const toast = useToast();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, correct, incorrect
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchPredictions();
        fetchStats();
    }, [filter]);

    const fetchPredictions = async () => {
        try {
            setLoading(true);
            const statusParam = filter !== 'all' ? `?status=${filter}` : '';
            const response = await api.get(`/predictions/history${statusParam}`);
            setPredictions(response.data.predictions || []);
        } catch (error) {
            console.error('Error fetching predictions:', error);
            toast.error('Failed to load predictions', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/predictions/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        
        try {
            // Check all expired predictions
            await api.post('/predictions/check-outcomes');
            toast.success('Predictions updated!', 'Success');
            
            // Refresh lists
            await fetchPredictions();
            await fetchStats();
        } catch (error) {
            console.error('Error refreshing:', error);
            toast.error('Failed to refresh predictions', 'Error');
        } finally {
            setRefreshing(false);
        }
    };

    const handlePredictionUpdate = (updatedPrediction) => {
        setPredictions(prev => prev.map(p => 
            p._id === updatedPrediction._id ? updatedPrediction : p
        ));
        fetchStats(); // Update stats when prediction changes
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <History size={48} />
                    Prediction History
                </Title>
                <Subtitle>Track your AI predictions and see how accurate they were</Subtitle>

                {stats && (
                    <StatsRow>
                        <StatCard>
                            <StatIcon $gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)">
                                <BarChart3 size={32} color="white" />
                            </StatIcon>
                            <StatValue $color="#8b5cf6">
                                {stats.totalPredictions || 0}
                            </StatValue>
                            <StatLabel>Total Predictions</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon $gradient="linear-gradient(135deg, #10b981, #059669)">
                                <CheckCircle size={32} color="white" />
                            </StatIcon>
                            <StatValue $color="#10b981">
                                {stats.correctPredictions || 0}
                            </StatValue>
                            <StatLabel>Correct</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon $gradient="linear-gradient(135deg, #ef4444, #dc2626)">
                                <XCircle size={32} color="white" />
                            </StatIcon>
                            <StatValue $color="#ef4444">
                                {(stats.totalPredictions || 0) - (stats.correctPredictions || 0)}
                            </StatValue>
                            <StatLabel>Incorrect</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatIcon $gradient="linear-gradient(135deg, #f59e0b, #d97706)">
                                <Award size={32} color="white" />
                            </StatIcon>
                            <StatValue $color="#f59e0b">
                                {stats.accuracy?.toFixed(1) || 0}%
                            </StatValue>
                            <StatLabel>Accuracy Rate</StatLabel>
                        </StatCard>
                    </StatsRow>
                )}
            </Header>

            <Content>
                <Controls>
                    <FilterButtons>
                        <FilterButton 
                            $active={filter === 'all'}
                            onClick={() => setFilter('all')}
                        >
                            <Filter size={18} />
                            All
                        </FilterButton>
                        <FilterButton 
                            $active={filter === 'pending'}
                            onClick={() => setFilter('pending')}
                        >
                            <Activity size={18} />
                            Active
                        </FilterButton>
                        <FilterButton 
                            $active={filter === 'correct'}
                            onClick={() => setFilter('correct')}
                        >
                            <CheckCircle size={18} />
                            Correct
                        </FilterButton>
                        <FilterButton 
                            $active={filter === 'incorrect'}
                            onClick={() => setFilter('incorrect')}
                        >
                            <XCircle size={18} />
                            Incorrect
                        </FilterButton>
                    </FilterButtons>

                    <RefreshButton 
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} />
                        {refreshing ? 'Checking...' : 'Check Outcomes'}
                    </RefreshButton>
                </Controls>

                {loading ? (
                    <EmptyState>
                        <EmptyIcon>
                            <RefreshCw size={60} color="#8b5cf6" />
                        </EmptyIcon>
                        <EmptyTitle>Loading predictions...</EmptyTitle>
                    </EmptyState>
                ) : predictions.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <History size={60} color="#8b5cf6" />
                        </EmptyIcon>
                        <EmptyTitle>No predictions found</EmptyTitle>
                        <EmptyText>
                            {filter === 'all' 
                                ? 'Make your first prediction to see it here!'
                                : `No ${filter} predictions yet`
                            }
                        </EmptyText>
                    </EmptyState>
                ) : (
                    <PredictionsGrid>
                        {predictions.map(prediction => (
                            <LivePredictionCard 
                                key={prediction._id}
                                prediction={prediction}
                                onUpdate={handlePredictionUpdate}
                            />
                        ))}
                    </PredictionsGrid>
                )}
            </Content>
        </PageContainer>
    );
};

export default PredictionHistory;