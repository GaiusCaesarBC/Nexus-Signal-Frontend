// client/src/pages/PortfolioPage.js - COMPLETE with Add/Edit/Delete

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Plus, Trash2, Edit2, Brain, Target, Zap, AlertCircle, X } from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const PageContainer = styled.div`
    padding: 3rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
    color: #e0e6ed;
    background: linear-gradient(145deg, #0d1a2f 0%, #1a273b 100%);
    min-height: calc(100vh - var(--navbar-height));
    animation: ${fadeIn} 0.8s ease-out;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;

const Title = styled.h1`
    font-size: 3rem;
    color: #00adef;
    text-shadow: 0 0 15px rgba(0, 173, 237, 0.6);
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 1rem;
`;

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    background: ${props => props.variant === 'primary' 
        ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'
        : props.variant === 'danger'
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'rgba(255, 255, 255, 0.1)'};
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const SummaryCards = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
`;

const CardLabel = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
`;

const CardValue = styled.div`
    font-size: 2rem;
    font-weight: bold;
    color: ${props => {
        if (props.positive) return '#10b981';
        if (props.negative) return '#ef4444';
        return '#f8fafc';
    }};
`;

const HoldingsSection = styled.div`
    margin-top: 2rem;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const HoldingCard = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
    animation: ${fadeIn} 0.5s ease-out;
`;

const HoldingHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
`;

const SymbolInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const Symbol = styled.h3`
    font-size: 1.5rem;
    color: #f8fafc;
    margin: 0;
`;

const PriceInfo = styled.div`
    text-align: right;
`;

const CurrentPrice = styled.div`
    font-size: 1.2rem;
    font-weight: bold;
    color: #00adef;
`;

const PriceChange = styled.div`
    font-size: 0.9rem;
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
`;

const HoldingGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
`;

const InfoBox = styled.div`
    background: rgba(0, 0, 0, 0.2);
    padding: 0.75rem;
    border-radius: 8px;
`;

const InfoLabel = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 0.3rem;
`;

const InfoValue = styled.div`
    font-size: 1.1rem;
    font-weight: bold;
    color: #f8fafc;
`;

const PredictionSection = styled.div`
    background: rgba(139, 92, 246, 0.1);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
    border: 1px solid rgba(139, 92, 246, 0.3);
`;

const PredictionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: #a78bfa;
    font-weight: 600;
`;

const PredictionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
`;

const PredictionItem = styled.div`
    text-align: center;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
`;

const PredLabel = styled.div`
    font-size: 0.75rem;
    color: #94a3b8;
    margin-bottom: 0.25rem;
`;

const PredValue = styled.div`
    font-size: 0.95rem;
    font-weight: bold;
    color: ${props => {
        if (props.direction === 'UP') return '#10b981';
        if (props.direction === 'DOWN') return '#ef4444';
        return '#f8fafc';
    }};
`;

const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
`;

const IconButton = styled.button`
    padding: 0.5rem;
    border-radius: 6px;
    border: none;
    background: ${props => props.danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${props => props.danger ? '#ef4444' : 'white'};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: ${props => props.danger ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 173, 237, 0.3)'};
        transform: scale(1.05);
    }
`;

// Modal Styles
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        color: #f8fafc;
        transform: scale(1.1);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 173, 237, 0.3);
    background: rgba(0, 0, 0, 0.2);
    color: #f8fafc;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }
`;

const FormActions = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`;

const LoadingMessage = styled.div`
    text-align: center;
    padding: 3rem;
    color: #00adef;
    font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin: 2rem 0;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: #94a3b8;
`;

const PortfolioPage = () => {
    const { api } = useAuth();
    const [holdings, setHoldings] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [error, setError] = useState(null);
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedHolding, setSelectedHolding] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        symbol: '',
        quantity: '',
        purchasePrice: ''
    });

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const response = await api.get('/portfolio');
            
            let holdingsData = [];
            if (Array.isArray(response.data)) {
                holdingsData = response.data;
            } else if (response.data.holdings && Array.isArray(response.data.holdings)) {
                holdingsData = response.data.holdings;
            } else if (response.data.portfolio && Array.isArray(response.data.portfolio)) {
                holdingsData = response.data.portfolio;
            }
            
            setHoldings(holdingsData);
            
            if (holdingsData.length > 0) {
                fetchPredictions(holdingsData);
            }
        } catch (err) {
            console.error('Portfolio fetch error:', err);
            setError('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    };

    const fetchPredictions = async (holdingsData) => {
        try {
            setLoadingPredictions(true);
            const symbols = holdingsData.map(h => h.symbol);
            
            const response = await api.post('/predictions/batch', {
                symbols,
                days: 7
            });
            
            const predMap = {};
            response.data.predictions.forEach(pred => {
                predMap[pred.symbol] = pred;
            });
            
            setPredictions(predMap);
        } catch (err) {
            console.error('Predictions fetch error:', err);
        } finally {
            setLoadingPredictions(false);
        }
    };

    const handleAddHolding = async (e) => {
        e.preventDefault();
        try {
            await api.post('/portfolio', {
                symbol: formData.symbol.toUpperCase(),
                quantity: parseFloat(formData.quantity),
                purchasePrice: parseFloat(formData.purchasePrice)
            });
            
            setShowAddModal(false);
            setFormData({ symbol: '', quantity: '', purchasePrice: '' });
            fetchPortfolio();
        } catch (err) {
            console.error('Add holding error:', err);
            alert('Failed to add holding');
        }
    };

    const handleEditHolding = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/portfolio/${selectedHolding._id}`, {
                quantity: parseFloat(formData.quantity),
                purchasePrice: parseFloat(formData.purchasePrice)
            });
            
            setShowEditModal(false);
            setSelectedHolding(null);
            setFormData({ symbol: '', quantity: '', purchasePrice: '' });
            fetchPortfolio();
        } catch (err) {
            console.error('Edit holding error:', err);
            alert('Failed to update holding');
        }
    };

    const handleDeleteHolding = async () => {
        try {
            await api.delete(`/portfolio/${selectedHolding._id}`);
            
            setShowDeleteModal(false);
            setSelectedHolding(null);
            fetchPortfolio();
        } catch (err) {
            console.error('Delete holding error:', err);
            alert('Failed to delete holding');
        }
    };

    const openEditModal = (holding) => {
        setSelectedHolding(holding);
        setFormData({
            symbol: holding.symbol,
            quantity: holding.quantity.toString(),
            purchasePrice: holding.purchasePrice.toString()
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (holding) => {
        setSelectedHolding(holding);
        setShowDeleteModal(true);
    };

    const calculateTotals = () => {
        if (!Array.isArray(holdings) || holdings.length === 0) {
            return { totalValue: 0, totalCost: 0, totalGain: 0, totalGainPercent: 0 };
        }
        
        const totalValue = holdings.reduce((sum, h) => 
            sum + (h.currentPrice * h.quantity), 0
        );
        const totalCost = holdings.reduce((sum, h) => 
            sum + (h.purchasePrice * h.quantity), 0
        );
        const totalGain = totalValue - totalCost;
        const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
        
        return { totalValue, totalCost, totalGain, totalGainPercent };
    };

    const getPredictionForSymbol = (symbol) => {
        return predictions[symbol];
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingMessage>Loading portfolio...</LoadingMessage>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <ErrorMessage>
                    <AlertCircle size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    {error}
                </ErrorMessage>
            </PageContainer>
        );
    }

    const { totalValue, totalCost, totalGain, totalGainPercent } = calculateTotals();

    return (
        <PageContainer>
            <Header>
                <Title>My Portfolio</Title>
                <HeaderActions>
                    <Button variant="primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={20} />
                        Add Holding
                    </Button>
                    <Button onClick={() => fetchPredictions(holdings)}>
                        <Brain size={20} />
                        Refresh Predictions
                    </Button>
                </HeaderActions>
            </Header>

            <SummaryCards>
                <SummaryCard>
                    <CardLabel>Total Value</CardLabel>
                    <CardValue>${totalValue.toFixed(2)}</CardValue>
                </SummaryCard>
                
                <SummaryCard>
                    <CardLabel>Total Cost</CardLabel>
                    <CardValue>${totalCost.toFixed(2)}</CardValue>
                </SummaryCard>
                
                <SummaryCard>
                    <CardLabel>Total Gain/Loss</CardLabel>
                    <CardValue positive={totalGain >= 0} negative={totalGain < 0}>
                        {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
                    </CardValue>
                    <PriceChange positive={totalGainPercent >= 0}>
                        {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                    </PriceChange>
                </SummaryCard>
                
                <SummaryCard>
                    <CardLabel>Holdings</CardLabel>
                    <CardValue>{holdings.length}</CardValue>
                </SummaryCard>
            </SummaryCards>

            <HoldingsSection>
                <SectionHeader>
                    <SectionTitle>
                        <Zap size={24} />
                        Holdings with AI Predictions
                    </SectionTitle>
                    {loadingPredictions && (
                        <span style={{ color: '#a78bfa', fontSize: '0.9rem' }}>
                            Loading predictions...
                        </span>
                    )}
                </SectionHeader>

                {holdings.length === 0 ? (
                    <EmptyState>
                        <h3>No holdings yet</h3>
                        <p>Click "Add Holding" to get started</p>
                        <Button variant="primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '1rem' }}>
                            <Plus size={20} />
                            Add Your First Holding
                        </Button>
                    </EmptyState>
                ) : (
                    holdings.map(holding => {
                        const gain = (holding.currentPrice - holding.purchasePrice) * holding.quantity;
                        const gainPercent = ((holding.currentPrice - holding.purchasePrice) / holding.purchasePrice) * 100;
                        const prediction = getPredictionForSymbol(holding.symbol);

                        return (
                            <HoldingCard key={holding._id}>
                                <HoldingHeader>
                                    <SymbolInfo>
                                        <Symbol>{holding.symbol}</Symbol>
                                    </SymbolInfo>
                                    <PriceInfo>
                                        <CurrentPrice>${holding.currentPrice.toFixed(2)}</CurrentPrice>
                                        <PriceChange positive={gainPercent >= 0}>
                                            {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                                        </PriceChange>
                                    </PriceInfo>
                                </HoldingHeader>

                                <HoldingGrid>
                                    <InfoBox>
                                        <InfoLabel>Quantity</InfoLabel>
                                        <InfoValue>{holding.quantity}</InfoValue>
                                    </InfoBox>
                                    
                                    <InfoBox>
                                        <InfoLabel>Purchase Price</InfoLabel>
                                        <InfoValue>${holding.purchasePrice.toFixed(2)}</InfoValue>
                                    </InfoBox>
                                    
                                    <InfoBox>
                                        <InfoLabel>Total Value</InfoLabel>
                                        <InfoValue>${(holding.currentPrice * holding.quantity).toFixed(2)}</InfoValue>
                                    </InfoBox>
                                    
                                    <InfoBox>
                                        <InfoLabel>Gain/Loss</InfoLabel>
                                        <InfoValue style={{ color: gain >= 0 ? '#10b981' : '#ef4444' }}>
                                            {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                                        </InfoValue>
                                    </InfoBox>
                                </HoldingGrid>

                                {prediction && prediction.prediction && (
                                    <PredictionSection>
                                        <PredictionHeader>
                                            <Brain size={16} />
                                            7-Day AI Prediction
                                        </PredictionHeader>
                                        <PredictionGrid>
                                            <PredictionItem>
                                                <PredLabel>Direction</PredLabel>
                                                <PredValue direction={prediction.prediction.direction}>
                                                    {prediction.prediction.direction === 'UP' && <TrendingUp size={16} style={{ verticalAlign: 'middle' }} />}
                                                    {prediction.prediction.direction === 'DOWN' && <TrendingDown size={16} style={{ verticalAlign: 'middle' }} />}
                                                    {' '}{prediction.prediction.direction}
                                                </PredValue>
                                            </PredictionItem>
                                            
                                            <PredictionItem>
                                                <PredLabel>Confidence</PredLabel>
                                                <PredValue>{prediction.prediction.confidence.toFixed(1)}%</PredValue>
                                            </PredictionItem>
                                            
                                            <PredictionItem>
                                                <PredLabel>Target Price</PredLabel>
                                                <PredValue>${prediction.prediction.target_price.toFixed(2)}</PredValue>
                                            </PredictionItem>
                                            
                                            <PredictionItem>
                                                <PredLabel>Expected Change</PredLabel>
                                                <PredValue direction={prediction.prediction.price_change_percent >= 0 ? 'UP' : 'DOWN'}>
                                                    {prediction.prediction.price_change_percent >= 0 ? '+' : ''}
                                                    {prediction.prediction.price_change_percent.toFixed(2)}%
                                                </PredValue>
                                            </PredictionItem>
                                        </PredictionGrid>
                                    </PredictionSection>
                                )}

                                <Actions>
                                    <IconButton onClick={() => openEditModal(holding)} title="Edit holding">
                                        <Edit2 size={16} />
                                    </IconButton>
                                    <IconButton danger onClick={() => openDeleteModal(holding)} title="Remove holding">
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Actions>
                            </HoldingCard>
                        );
                    })
                )}
            </HoldingsSection>

            {/* Add Modal */}
            {showAddModal && (
                <ModalOverlay onClick={() => setShowAddModal(false)}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Add New Holding</ModalTitle>
                            <CloseButton onClick={() => setShowAddModal(false)}>
                                <X size={24} />
                            </CloseButton>
                        </ModalHeader>
                        <Form onSubmit={handleAddHolding}>
                            <FormGroup>
                                <Label>Symbol</Label>
                                <Input
                                    type="text"
                                    placeholder="AAPL, BTC, etc."
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="10"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Purchase Price</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="150.00"
                                    value={formData.purchasePrice}
                                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormActions>
                                <Button type="submit" variant="primary">
                                    <Plus size={20} />
                                    Add Holding
                                </Button>
                                <Button type="button" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                            </FormActions>
                        </Form>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedHolding && (
                <ModalOverlay onClick={() => setShowEditModal(false)}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Edit {selectedHolding.symbol}</ModalTitle>
                            <CloseButton onClick={() => setShowEditModal(false)}>
                                <X size={24} />
                            </CloseButton>
                        </ModalHeader>
                        <Form onSubmit={handleEditHolding}>
                            <FormGroup>
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Purchase Price</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    value={formData.purchasePrice}
                                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                    required
                                />
                            </FormGroup>
                            <FormActions>
                                <Button type="submit" variant="primary">
                                    <Edit2 size={20} />
                                    Update Holding
                                </Button>
                                <Button type="button" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </Button>
                            </FormActions>
                        </Form>
                    </Modal>
                </ModalOverlay>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedHolding && (
                <ModalOverlay onClick={() => setShowDeleteModal(false)}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Delete Holding</ModalTitle>
                            <CloseButton onClick={() => setShowDeleteModal(false)}>
                                <X size={24} />
                            </CloseButton>
                        </ModalHeader>
                        <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
                            Are you sure you want to delete <strong style={{ color: '#f8fafc' }}>{selectedHolding.symbol}</strong>?
                            This action cannot be undone.
                        </p>
                        <FormActions>
                            <Button variant="danger" onClick={handleDeleteHolding}>
                                <Trash2 size={20} />
                                Delete
                            </Button>
                            <Button onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                        </FormActions>
                    </Modal>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default PortfolioPage;