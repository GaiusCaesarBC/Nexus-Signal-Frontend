// client/src/components/PatternDetector.js - PATTERN VISUALIZATION COMPONENT

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, Target, AlertCircle, Info, 
    Zap, CheckCircle, XCircle, Eye, Brain, Star, Award,
    ChevronDown, ChevronUp, RefreshCw,DollarSign
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
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
const Container = styled.div`
    width: 100%;
    animation: ${fadeIn} 0.6s ease-out;
`;

const ScanButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 2px solid rgba(139, 92, 246, 0.5);
    border-radius: 12px;
    color: #a78bfa;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    margin-bottom: 1.5rem;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.3) 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const LoadingSpinner = styled.div`
    animation: ${spin} 1s linear infinite;
`;

const PatternsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
`;

const PatternCard = styled.div`
    background: linear-gradient(135deg, 
        ${props => props.$type === 'bullish' ? 
            'rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%' :
            'rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%'
        }
    );
    border: 2px solid ${props => props.$type === 'bullish' ? 
        'rgba(16, 185, 129, 0.4)' : 
        'rgba(239, 68, 68, 0.4)'
    };
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px ${props => props.$type === 'bullish' ? 
            'rgba(16, 185, 129, 0.3)' : 
            'rgba(239, 68, 68, 0.3)'
        };
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: ${props => props.$type === 'bullish' ? 
            'linear-gradient(90deg, #10b981, #059669)' :
            'linear-gradient(90deg, #ef4444, #dc2626)'
        };
    }

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, 
            ${props => props.$type === 'bullish' ? 
                'rgba(16, 185, 129, 0.1)' :
                'rgba(239, 68, 68, 0.1)'
            } 50%, transparent 70%
        );
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }
`;

const PatternHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const PatternName = styled.h3`
    color: ${props => props.$type === 'bullish' ? '#10b981' : '#ef4444'};
    font-size: 1.3rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const PatternType = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatusBadge = styled.div`
    padding: 0.4rem 0.75rem;
    background: ${props => props.$confirmed ? 
        'rgba(16, 185, 129, 0.2)' :
        'rgba(245, 158, 11, 0.2)'
    };
    border: 1px solid ${props => props.$confirmed ?
        'rgba(16, 185, 129, 0.4)' :
        'rgba(245, 158, 11, 0.4)'
    };
    border-radius: 20px;
    color: ${props => props.$confirmed ? '#10b981' : '#f59e0b'};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const ConfidenceSection = styled.div`
    margin: 1rem 0;
    position: relative;
    z-index: 1;
`;

const ConfidenceLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const ConfidenceText = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
`;

const ConfidenceValue = styled.span`
    color: ${props => {
        if (props.$value >= 80) return '#10b981';
        if (props.$value >= 60) return '#f59e0b';
        return '#ef4444';
    }};
    font-size: 1.1rem;
    font-weight: 900;
`;

const ConfidenceBar = styled.div`
    width: 100%;
    height: 10px;
    background: rgba(100, 116, 139, 0.2);
    border-radius: 5px;
    overflow: hidden;
    position: relative;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$value}%;
    background: ${props => {
        if (props.$value >= 80) return 'linear-gradient(90deg, #10b981, #059669)';
        if (props.$value >= 60) return 'linear-gradient(90deg, #f59e0b, #d97706)';
        return 'linear-gradient(90deg, #ef4444, #dc2626)';
    }};
    border-radius: 5px;
    transition: width 1s ease-out;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: ${shimmer} 2s linear infinite;
    }
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 1rem 0;
    position: relative;
    z-index: 1;
`;

const MetricBox = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 10px;
    padding: 1rem;
`;

const MetricLabel = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const MetricValue = styled.div`
    color: ${props => props.$color || '#e0e6ed'};
    font-size: 1.2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const DetailsSection = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 173, 237, 0.2);
    position: relative;
    z-index: 1;
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    color: #94a3b8;
    font-size: 0.9rem;

    span:last-child {
        color: #e0e6ed;
        font-weight: 600;
    }
`;

const ExpandButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    transition: all 0.2s ease;
    position: relative;
    z-index: 1;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: #64748b;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const EmptyText = styled.div`
    font-size: 1.1rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
`;

const EmptyHint = styled.div`
    font-size: 0.9rem;
    color: #64748b;
`;

const InfoBox = styled.div`
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: start;
    gap: 1rem;
`;

const InfoIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #3b82f6;
`;

const InfoContent = styled.div`
    flex: 1;
`;

const InfoTitle = styled.div`
    color: #3b82f6;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.5rem;
`;

const InfoText = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    line-height: 1.5;
`;

const RiskRewardBox = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    position: relative;
    z-index: 1;
`;

const RiskRewardItem = styled.div`
    text-align: center;
`;

const RiskRewardLabel = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
`;

const RiskRewardValue = styled.div`
    color: ${props => props.$type === 'risk' ? '#ef4444' : '#10b981'};
    font-size: 1.5rem;
    font-weight: 900;
`;

const RatioLabel = styled.div`
    text-align: center;
    margin-top: 0.5rem;
    color: #94a3b8;
    font-size: 0.85rem;
`;

// ============ MAIN COMPONENT ============
const PatternDetector = ({ symbol, chartData }) => {
    const { api } = useAuth();
    const toast = useToast();

    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedPattern, setExpandedPattern] = useState(null);

    const detectPatterns = async () => {
        if (!symbol) {
            toast.warning('No symbol selected', 'Select Symbol');
            return;
        }

        setLoading(true);
        setPatterns([]);

        try {
            const response = await api.get(`/patterns/${symbol}`);

            if (response.data.success && response.data.patterns) {
                setPatterns(response.data.patterns);
                
                if (response.data.patterns.length > 0) {
                    toast.success(
                        `Found ${response.data.patterns.length} pattern${response.data.patterns.length > 1 ? 's' : ''}!`,
                        'Patterns Detected'
                    );
                } else {
                    toast.info('No patterns detected', 'All Clear');
                }
            }

        } catch (error) {
            console.error('Pattern detection error:', error);
            toast.error('Failed to detect patterns', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${parseFloat(value).toFixed(2)}%`;
    };

    const getRiskRewardRatio = (pattern) => {
        const risk = parseFloat(pattern.risk);
        const reward = parseFloat(pattern.reward);
        if (risk === 0) return 'N/A';
        return (reward / risk).toFixed(2);
    };

    return (
        <Container>
            <InfoBox>
                <InfoIcon>
                    <Brain size={24} />
                </InfoIcon>
                <InfoContent>
                    <InfoTitle>🤖 AI Pattern Recognition</InfoTitle>
                    <InfoText>
                        Automatically detect 12 major chart patterns including Head & Shoulders, 
                        Double Tops/Bottoms, Triangles, Flags, and more. Get confidence scores, 
                        price targets, and risk/reward ratios.
                    </InfoText>
                </InfoContent>
            </InfoBox>

            <ScanButton onClick={detectPatterns} disabled={loading || !symbol}>
                {loading ? (
                    <>
                        <LoadingSpinner><RefreshCw size={20} /></LoadingSpinner>
                        Scanning for Patterns...
                    </>
                ) : (
                    <>
                        <Zap size={20} />
                        Scan {symbol || 'Chart'} for Patterns
                    </>
                )}
            </ScanButton>

            {patterns.length > 0 ? (
                <PatternsGrid>
                    {patterns.map((pattern, index) => (
                        <PatternCard 
                            key={index} 
                            $type={pattern.type}
                            onClick={() => setExpandedPattern(expandedPattern === index ? null : index)}
                        >
                            <PatternHeader>
                                <div>
                                    <PatternName $type={pattern.type}>
                                        {pattern.type === 'bullish' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                        {pattern.name}
                                    </PatternName>
                                    <PatternType>{pattern.type} pattern</PatternType>
                                </div>
                                <StatusBadge $confirmed={pattern.status === 'confirmed'}>
                                    {pattern.status === 'confirmed' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    {pattern.status}
                                </StatusBadge>
                            </PatternHeader>

                            <ConfidenceSection>
                                <ConfidenceLabel>
                                    <ConfidenceText>AI Confidence</ConfidenceText>
                                    <ConfidenceValue $value={pattern.confidence}>
                                        {pattern.confidence.toFixed(0)}%
                                    </ConfidenceValue>
                                </ConfidenceLabel>
                                <ConfidenceBar>
                                    <ConfidenceFill $value={pattern.confidence} />
                                </ConfidenceBar>
                            </ConfidenceSection>

                            <MetricsGrid>
                                <MetricBox>
                                    <MetricLabel>Current Price</MetricLabel>
                                    <MetricValue>
                                        <DollarSign size={18} />
                                        {formatCurrency(pattern.currentPrice)}
                                    </MetricValue>
                                </MetricBox>

                                <MetricBox>
                                    <MetricLabel>Price Target</MetricLabel>
                                    <MetricValue $color={pattern.type === 'bullish' ? '#10b981' : '#ef4444'}>
                                        <Target size={18} />
                                        {formatCurrency(pattern.target)}
                                    </MetricValue>
                                </MetricBox>

                                <MetricBox>
                                    <MetricLabel>Potential Move</MetricLabel>
                                    <MetricValue $color={parseFloat(pattern.potentialMove) >= 0 ? '#10b981' : '#ef4444'}>
                                        {parseFloat(pattern.potentialMove) >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                        {formatPercent(pattern.potentialMove)}
                                    </MetricValue>
                                </MetricBox>

                                <MetricBox>
                                    <MetricLabel>Reliability</MetricLabel>
                                    <MetricValue $color="#a78bfa">
                                        <Star size={18} />
                                        {(pattern.reliability * 100).toFixed(0)}%
                                    </MetricValue>
                                </MetricBox>
                            </MetricsGrid>

                            <RiskRewardBox>
                                <RiskRewardItem>
                                    <RiskRewardLabel>Risk</RiskRewardLabel>
                                    <RiskRewardValue $type="risk">
                                        {pattern.risk}%
                                    </RiskRewardValue>
                                </RiskRewardItem>
                                <RiskRewardItem>
                                    <RiskRewardLabel>Reward</RiskRewardLabel>
                                    <RiskRewardValue $type="reward">
                                        {pattern.reward}%
                                    </RiskRewardValue>
                                </RiskRewardItem>
                                <RatioLabel style={{ gridColumn: '1 / -1' }}>
                                    R:R Ratio: <strong>{getRiskRewardRatio(pattern)}:1</strong>
                                </RatioLabel>
                            </RiskRewardBox>

                            {expandedPattern === index && (
                                <DetailsSection>
                                    <DetailRow>
                                        <span>📖 Description:</span>
                                        <span>{pattern.description}</span>
                                    </DetailRow>
                                    <DetailRow>
                                        <span>⏱️ Avg Duration:</span>
                                        <span>{pattern.avgDuration}</span>
                                    </DetailRow>
                                    <DetailRow>
                                        <span>🎯 Target Calc:</span>
                                        <span>{pattern.targetCalculation}</span>
                                    </DetailRow>
                                    <DetailRow>
                                        <span>🕐 Detected At:</span>
                                        <span>{new Date(pattern.detectedAt).toLocaleString()}</span>
                                    </DetailRow>
                                </DetailsSection>
                            )}

                            <ExpandButton onClick={(e) => {
                                e.stopPropagation();
                                setExpandedPattern(expandedPattern === index ? null : index);
                            }}>
                                <Info size={16} />
                                {expandedPattern === index ? 'Hide Details' : 'View Details'}
                                {expandedPattern === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </ExpandButton>
                        </PatternCard>
                    ))}
                </PatternsGrid>
            ) : !loading && (
                <EmptyState>
                    <EmptyIcon>
                        <Eye size={40} color="#8b5cf6" />
                    </EmptyIcon>
                    <EmptyText>No patterns detected yet</EmptyText>
                    <EmptyHint>Click "Scan for Patterns" to analyze the chart</EmptyHint>
                </EmptyState>
            )}
        </Container>
    );
};

export default PatternDetector;