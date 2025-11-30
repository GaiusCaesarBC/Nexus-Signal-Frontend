// client/src/components/LivePredictionCard.js - REAL-TIME PREDICTION TRACKING

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    TrendingUp, TrendingDown, Clock, Target, Activity,
    CheckCircle, XCircle, Award, AlertCircle, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ============ ANIMATIONS ============
const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
`;

const countdown = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
`;

// ============ STYLED COMPONENTS ============
const Card = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 2px solid ${props => {
        if (props.$expired) return 'rgba(100, 116, 139, 0.4)';
        if (props.$winning) return 'rgba(16, 185, 129, 0.4)';
        if (props.$losing) return 'rgba(239, 68, 68, 0.4)';
        return 'rgba(139, 92, 246, 0.4)';
    }};
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px ${props => {
            if (props.$winning) return 'rgba(16, 185, 129, 0.3)';
            if (props.$losing) return 'rgba(239, 68, 68, 0.3)';
            return 'rgba(139, 92, 246, 0.3)';
        }};
    }

    ${props => props.$expired && `
        opacity: 0.8;
    `}
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1.5rem;
`;

const SymbolSection = styled.div``;

const Symbol = styled.h3`
    font-size: 2rem;
    font-weight: 900;
    color: #8b5cf6;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const Direction = styled.div`
    display: inline-flex;
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

const StatusBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => {
        if (props.$status === 'correct') return 'rgba(16, 185, 129, 0.2)';
        if (props.$status === 'incorrect') return 'rgba(239, 68, 68, 0.2)';
        if (props.$status === 'expired') return 'rgba(100, 116, 139, 0.2)';
        return 'rgba(139, 92, 246, 0.2)';
    }};
    border: 1px solid ${props => {
        if (props.$status === 'correct') return 'rgba(16, 185, 129, 0.4)';
        if (props.$status === 'incorrect') return 'rgba(239, 68, 68, 0.4)';
        if (props.$status === 'expired') return 'rgba(100, 116, 139, 0.4)';
        return 'rgba(139, 92, 246, 0.4)';
    }};
    border-radius: 20px;
    color: ${props => {
        if (props.$status === 'correct') return '#10b981';
        if (props.$status === 'incorrect') return '#ef4444';
        if (props.$status === 'expired') return '#94a3b8';
        return '#a78bfa';
    }};
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    animation: ${props => props.$status === 'pending' ? pulse : 'none'} 2s ease-in-out infinite;
`;

const CountdownSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
`;

const CountdownTimer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => {
        if (props.$critical) return '#ef4444';
        if (props.$warning) return '#f59e0b';
        return '#10b981';
    }};
    animation: ${props => props.$critical ? countdown : 'none'} 1s ease-in-out infinite;
`;

const CountdownLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    text-align: right;
`;

const PricesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const PriceBox = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        border-color: rgba(139, 92, 246, 0.4);
        transform: scale(1.05);
    }
`;

const PriceLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
`;

const PriceValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$color || '#e0e6ed'};
`;

const PriceChange = styled.div`
    font-size: 0.9rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    margin-top: 0.25rem;
    font-weight: 600;
`;

const ConfidenceSection = styled.div`
    margin-bottom: 1.5rem;
`;

const ConfidenceLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const ConfidenceText = styled.div`
    color: #a78bfa;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ConfidenceValue = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: ${props => {
        if (props.$value >= 75) return '#10b981';
        if (props.$value >= 50) return '#f59e0b';
        return '#ef4444';
    }};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 16px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(139, 92, 246, 0.3);
    position: relative;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$value || 0}%;
    background: ${props => {
        if (props.$value >= 75) return 'linear-gradient(90deg, #10b981, #059669)';
        if (props.$value >= 50) return 'linear-gradient(90deg, #f59e0b, #d97706)';
        return 'linear-gradient(90deg, #ef4444, #dc2626)';
    }};
    border-radius: 8px;
    transition: all 0.5s ease;
    animation: ${glow} 2s ease-in-out infinite;
`;

const ConfidenceChange = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$up ? '#10b981' : '#ef4444'};
    margin-top: 0.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const OutcomeSection = styled.div`
    background: ${props => {
        if (props.$correct) return 'rgba(16, 185, 129, 0.1)';
        if (props.$incorrect) return 'rgba(239, 68, 68, 0.1)';
        return 'rgba(139, 92, 246, 0.1)';
    }};
    border: 2px solid ${props => {
        if (props.$correct) return 'rgba(16, 185, 129, 0.4)';
        if (props.$incorrect) return 'rgba(239, 68, 68, 0.4)';
        return 'rgba(139, 92, 246, 0.4)';
    }};
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const OutcomeTitle = styled.h4`
    color: ${props => {
        if (props.$correct) return '#10b981';
        if (props.$incorrect) return '#ef4444';
        return '#a78bfa';
    }};
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const OutcomeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
`;

const OutcomeStat = styled.div`
    text-align: center;
`;

const OutcomeStatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
`;

const OutcomeStatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$color || '#e0e6ed'};
`;

// ============ COMPONENT ============
const LivePredictionCard = ({ prediction, onUpdate }) => {
    const { api } = useAuth();
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLiveData();
        
        // Update every 30 seconds if prediction is still pending
        const interval = setInterval(() => {
            if (prediction.status === 'pending') {
                fetchLiveData();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [prediction._id]);

    const fetchLiveData = async () => {
        try {
            const response = await api.get(`/predictions/live/${prediction._id}`);
            setLiveData(response.data.prediction);
            setLoading(false);
            
            // Notify parent if status changed
            if (response.data.prediction.status !== prediction.status && onUpdate) {
                onUpdate(response.data.prediction);
            }
        } catch (error) {
            console.error('Error fetching live data:', error);
            setLoading(false);
        }
    };

    const formatTimeRemaining = (ms) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const data = liveData || prediction;
    const isExpired = data.status !== 'pending';
    const isWinning = liveData?.liveChange > 0 && prediction.direction === 'UP' || 
                     liveData?.liveChange < 0 && prediction.direction === 'DOWN';
    const isLosing = !isWinning && liveData?.liveChange !== undefined;
    
    const confidenceChange = liveData ? liveData.liveConfidence - prediction.confidence : 0;

    return (
        <Card 
            $expired={isExpired}
            $winning={!isExpired && isWinning}
            $losing={!isExpired && isLosing}
        >
            <Header>
                <SymbolSection>
                    <Symbol>
                        {data.symbol}
                        <Direction $up={data.direction === 'UP'}>
                            {data.direction === 'UP' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            {data.direction}
                        </Direction>
                    </Symbol>
                </SymbolSection>

                <CountdownSection>
                    <StatusBadge $status={data.status}>
                        {data.status === 'correct' && <CheckCircle size={16} />}
                        {data.status === 'incorrect' && <XCircle size={16} />}
                        {data.status === 'pending' && <Activity size={16} />}
                        {data.status}
                    </StatusBadge>
                    
                    {!isExpired && liveData && (
                        <>
                            <CountdownTimer
                                $critical={liveData.timeRemaining < 3600000} // < 1 hour
                                $warning={liveData.timeRemaining < 86400000} // < 1 day
                            >
                                <Clock size={20} />
                                {formatTimeRemaining(liveData.timeRemaining)}
                            </CountdownTimer>
                            <CountdownLabel>
                                {liveData.daysRemaining} {liveData.daysRemaining === 1 ? 'day' : 'days'} remaining
                            </CountdownLabel>
                        </>
                    )}
                </CountdownSection>
            </Header>

            <PricesGrid>
                <PriceBox>
                    <PriceLabel>Original Price</PriceLabel>
                    <PriceValue>${data.currentPrice.toFixed(2)}</PriceValue>
                </PriceBox>

                {liveData && !isExpired && (
                    <PriceBox>
                        <PriceLabel>Current Price</PriceLabel>
                        <PriceValue $color={isWinning ? '#10b981' : '#ef4444'}>
                            ${liveData.livePrice.toFixed(2)}
                        </PriceValue>
                        <PriceChange $positive={liveData.liveChange >= 0}>
                            {liveData.liveChange >= 0 ? '+' : ''}
                            {liveData.liveChangePercent.toFixed(2)}%
                        </PriceChange>
                    </PriceBox>
                )}

                <PriceBox>
                    <PriceLabel>Target Price</PriceLabel>
                    <PriceValue $color="#a78bfa">
                        ${data.targetPrice.toFixed(2)}
                    </PriceValue>
                    <PriceChange $positive={data.priceChangePercent >= 0}>
                        {data.priceChangePercent >= 0 ? '+' : ''}
                        {data.priceChangePercent.toFixed(2)}%
                    </PriceChange>
                </PriceBox>

                {isExpired && data.outcome && (
                    <PriceBox>
                        <PriceLabel>Final Price</PriceLabel>
                        <PriceValue $color={data.outcome.wasCorrect ? '#10b981' : '#ef4444'}>
                            ${data.outcome.actualPrice.toFixed(2)}
                        </PriceValue>
                        <PriceChange $positive={data.outcome.actualChange >= 0}>
                            {data.outcome.actualChange >= 0 ? '+' : ''}
                            {data.outcome.actualChangePercent.toFixed(2)}%
                        </PriceChange>
                    </PriceBox>
                )}
            </PricesGrid>

            <ConfidenceSection>
                <ConfidenceLabel>
                    <ConfidenceText>
                        <Zap size={20} />
                        {isExpired ? 'Final Confidence' : 'Live Confidence'}
                    </ConfidenceText>
                    <ConfidenceValue $value={liveData?.liveConfidence || data.confidence}>
                        {(liveData?.liveConfidence || data.confidence).toFixed(1)}%
                        {!isExpired && confidenceChange !== 0 && (
                            <span style={{ fontSize: '1rem', color: confidenceChange > 0 ? '#10b981' : '#ef4444' }}>
                                ({confidenceChange > 0 ? '+' : ''}{confidenceChange.toFixed(1)}%)
                            </span>
                        )}
                    </ConfidenceValue>
                </ConfidenceLabel>
                <ConfidenceBar>
                    <ConfidenceFill $value={liveData?.liveConfidence || data.confidence} />
                </ConfidenceBar>
                
                {!isExpired && confidenceChange !== 0 && (
                    <ConfidenceChange $up={confidenceChange > 0}>
                        {confidenceChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        Confidence {confidenceChange > 0 ? 'increased' : 'decreased'} by {Math.abs(confidenceChange).toFixed(1)}% since prediction
                    </ConfidenceChange>
                )}
            </ConfidenceSection>

            {isExpired && data.outcome && (
                <OutcomeSection 
                    $correct={data.outcome.wasCorrect}
                    $incorrect={!data.outcome.wasCorrect}
                >
                    <OutcomeTitle 
                        $correct={data.outcome.wasCorrect}
                        $incorrect={!data.outcome.wasCorrect}
                    >
                        {data.outcome.wasCorrect ? (
                            <>
                                <CheckCircle size={24} />
                                Prediction Correct!
                            </>
                        ) : (
                            <>
                                <AlertCircle size={24} />
                                Prediction Incorrect
                            </>
                        )}
                    </OutcomeTitle>

                    <OutcomeGrid>
                        <OutcomeStat>
                            <OutcomeStatLabel>Direction</OutcomeStatLabel>
                            <OutcomeStatValue 
                                $color={data.outcome.wasCorrect ? '#10b981' : '#ef4444'}
                            >
                                {data.outcome.wasCorrect ? '✓' : '✗'}
                            </OutcomeStatValue>
                        </OutcomeStat>

                        <OutcomeStat>
                            <OutcomeStatLabel>Accuracy Score</OutcomeStatLabel>
                            <OutcomeStatValue 
                                $color={data.outcome.accuracy >= 70 ? '#10b981' : '#f59e0b'}
                            >
                                {data.outcome.accuracy.toFixed(1)}%
                            </OutcomeStatValue>
                        </OutcomeStat>

                        <OutcomeStat>
                            <OutcomeStatLabel>Price Difference</OutcomeStatLabel>
                            <OutcomeStatValue>
                                ${Math.abs(data.outcome.actualPrice - data.targetPrice).toFixed(2)}
                            </OutcomeStatValue>
                        </OutcomeStat>

                        <OutcomeStat>
                            <OutcomeStatLabel>Checked</OutcomeStatLabel>
                            <OutcomeStatValue $color="#a78bfa">
                                {new Date(data.outcome.checkedAt).toLocaleDateString()}
                            </OutcomeStatValue>
                        </OutcomeStat>
                    </OutcomeGrid>
                </OutcomeSection>
            )}
        </Card>
    );
};

export default LivePredictionCard;