// client/src/pages/AlertsPage.js - Alert Management Page

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    Bell, Plus, Trash2, Edit, TrendingUp, TrendingDown, 
    Clock, DollarSign, Percent, CheckCircle, XCircle, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Animations
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 6rem 2rem 2rem;
`;

const Header = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }
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
    color: ${props => props.color || '#00adef'};
`;

const Toolbar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const FilterButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const FilterButton = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.2) 100%)' : 
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
    }
`;

const CreateButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    }
`;

const AlertsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const AlertCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid ${props => {
        if (props.$status === 'triggered') return 'rgba(16, 185, 129, 0.5)';
        if (props.$status === 'expired') return 'rgba(239, 68, 68, 0.5)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }
`;

const AlertHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
`;

const AlertType = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #00adef;
    font-weight: 700;
    font-size: 1.1rem;
`;

const AlertActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const IconButton = styled.button`
    background: ${props => props.$danger ? 
        'rgba(239, 68, 68, 0.1)' : 
        'rgba(0, 173, 237, 0.1)'
    };
    border: 1px solid ${props => props.$danger ? 
        'rgba(239, 68, 68, 0.3)' : 
        'rgba(0, 173, 237, 0.3)'
    };
    color: ${props => props.$danger ? '#ef4444' : '#00adef'};
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
        background: ${props => props.$danger ? 
            'rgba(239, 68, 68, 0.2)' : 
            'rgba(0, 173, 237, 0.2)'
        };
    }
`;

const AlertSymbol = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: #e0e6ed;
    margin-bottom: 0.5rem;
`;

const AlertCondition = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const ConditionLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const ConditionValue = styled.div`
    color: #e0e6ed;
    font-size: 1.3rem;
    font-weight: 700;
`;

const AlertStatus = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => {
        if (props.$status === 'active') return 'rgba(16, 185, 129, 0.2)';
        if (props.$status === 'triggered') return 'rgba(245, 158, 11, 0.2)';
        if (props.$status === 'expired') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(100, 116, 139, 0.2)';
    }};
    border: 1px solid ${props => {
        if (props.$status === 'active') return 'rgba(16, 185, 129, 0.4)';
        if (props.$status === 'triggered') return 'rgba(245, 158, 11, 0.4)';
        if (props.$status === 'expired') return 'rgba(239, 68, 68, 0.4)';
        return 'rgba(100, 116, 139, 0.4)';
    }};
    border-radius: 8px;
    color: ${props => {
        if (props.$status === 'active') return '#10b981';
        if (props.$status === 'triggered') return '#f59e0b';
        if (props.$status === 'expired') return '#ef4444';
        return '#64748b';
    }};
    font-size: 0.85rem;
    font-weight: 600;
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

// Modal Components
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
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    animation: ${slideIn} 0.3s ease-out;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalTitle = styled.h2`
    color: #00adef;
    margin-bottom: 2rem;
    font-size: 1.8rem;
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

const Select = styled.select`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    option {
        background: #1a1f3a;
        color: #e0e6ed;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
`;

const SubmitButton = styled.button`
    flex: 1;
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

const CancelButton = styled.button`
    flex: 1;
    padding: 0.75rem 1.5rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: translateY(-2px);
    }
`;

const AlertsPage = () => {
    const { api } = useAuth();
    const toast = useToast();
    
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ active: 0, triggered: 0, expired: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        type: 'price_above',
        symbol: '',
        assetType: 'stock',
        targetPrice: '',
        percentChange: '',
        timeframe: '24h'
    });

    useEffect(() => {
        fetchAlerts();
        fetchStats();
    }, [filter]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? '' : filter;
            const response = await api.get(`/alerts?status=${status}`);
            setAlerts(response.data.alerts || []);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            toast.error('Failed to load alerts');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/alerts/stats');
            setStats(response.data.stats || { active: 0, triggered: 0, expired: 0, total: 0 });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const createAlert = async (e) => {
        e.preventDefault();
        
        try {
            await api.post('/alerts', formData);
            toast.success('Alert created successfully!');
            setShowCreateModal(false);
            setFormData({
                type: 'price_above',
                symbol: '',
                assetType: 'stock',
                targetPrice: '',
                percentChange: '',
                timeframe: '24h'
            });
            fetchAlerts();
            fetchStats();
        } catch (error) {
            console.error('Error creating alert:', error);
            toast.error(error.response?.data?.error || 'Failed to create alert');
        }
    };

    const deleteAlert = async (alertId) => {
        if (!window.confirm('Are you sure you want to delete this alert?')) {
            return;
        }

        try {
            await api.delete(`/alerts/${alertId}`);
            toast.success('Alert deleted');
            fetchAlerts();
            fetchStats();
        } catch (error) {
            console.error('Error deleting alert:', error);
            toast.error('Failed to delete alert');
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'price_above':
                return <TrendingUp size={24} />;
            case 'price_below':
                return <TrendingDown size={24} />;
            case 'percent_change':
                return <Percent size={24} />;
            case 'prediction_expiry':
                return <Clock size={24} />;
            default:
                return <Bell size={24} />;
        }
    };

    const getAlertTitle = (alert) => {
        switch (alert.type) {
            case 'price_above':
                return `Price Above Alert`;
            case 'price_below':
                return `Price Below Alert`;
            case 'percent_change':
                return `${alert.percentChange}% Change Alert`;
            case 'prediction_expiry':
                return `Prediction Expiry`;
            default:
                return 'Alert';
        }
    };

    return (
        <PageContainer>
            <Header>
                <Title>Price Alerts</Title>
                <Subtitle>Manage your notification alerts</Subtitle>
            </Header>

            <StatsGrid>
                <StatCard>
                    <StatLabel>Active Alerts</StatLabel>
                    <StatValue color="#10b981">{stats.active}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Triggered</StatLabel>
                    <StatValue color="#f59e0b">{stats.triggered}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Expired</StatLabel>
                    <StatValue color="#ef4444">{stats.expired}</StatValue>
                </StatCard>
                <StatCard>
                    <StatLabel>Total Alerts</StatLabel>
                    <StatValue color="#00adef">{stats.total}</StatValue>
                </StatCard>
            </StatsGrid>

            <Toolbar>
                <FilterButtons>
                    <FilterButton 
                        $active={filter === 'all'}
                        onClick={() => setFilter('all')}
                    >
                        All Alerts
                    </FilterButton>
                    <FilterButton 
                        $active={filter === 'active'}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </FilterButton>
                    <FilterButton 
                        $active={filter === 'triggered'}
                        onClick={() => setFilter('triggered')}
                    >
                        Triggered
                    </FilterButton>
                    <FilterButton 
                        $active={filter === 'expired'}
                        onClick={() => setFilter('expired')}
                    >
                        Expired
                    </FilterButton>
                </FilterButtons>

                <CreateButton onClick={() => setShowCreateModal(true)}>
                    <Plus size={20} />
                    Create Alert
                </CreateButton>
            </Toolbar>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#00adef' }}>
                    Loading alerts...
                </div>
            ) : alerts.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>
                        <Bell size={64} color="#00adef" />
                    </EmptyIcon>
                    <h2 style={{ color: '#00adef', marginBottom: '0.5rem' }}>No alerts yet</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                        Create your first alert to get notified about price changes
                    </p>
                    <CreateButton onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} />
                        Create Your First Alert
                    </CreateButton>
                </EmptyState>
            ) : (
                <AlertsGrid>
                    {alerts.map(alert => (
                        <AlertCard key={alert._id} $status={alert.status}>
                            <AlertHeader>
                                <AlertType>
                                    {getAlertIcon(alert.type)}
                                    {getAlertTitle(alert)}
                                </AlertType>
                                <AlertActions>
                                    <IconButton 
                                        $danger 
                                        onClick={() => deleteAlert(alert._id)}
                                    >
                                        <Trash2 size={18} />
                                    </IconButton>
                                </AlertActions>
                            </AlertHeader>

                            <AlertSymbol>
                                {alert.symbol || 'Portfolio'}
                            </AlertSymbol>

                            <AlertCondition>
                                <ConditionLabel>Target</ConditionLabel>
                                <ConditionValue>
                                    {alert.type === 'percent_change' 
                                        ? `${alert.percentChange}% in ${alert.timeframe}`
                                        : `$${alert.targetPrice?.toLocaleString()}`
                                    }
                                </ConditionValue>
                            </AlertCondition>

                            <AlertStatus $status={alert.status}>
                                {alert.status === 'active' && <CheckCircle size={16} />}
                                {alert.status === 'triggered' && <Bell size={16} />}
                                {alert.status === 'expired' && <XCircle size={16} />}
                                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                            </AlertStatus>
                        </AlertCard>
                    ))}
                </AlertsGrid>
            )}

            {showCreateModal && (
                <Modal onClick={() => setShowCreateModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>Create New Alert</ModalTitle>
                        <Form onSubmit={createAlert}>
                            <FormGroup>
                                <Label>Alert Type</Label>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value="price_above">Price Above</option>
                                    <option value="price_below">Price Below</option>
                                    <option value="percent_change">Percentage Change</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Asset Type</Label>
                                <Select
                                    value={formData.assetType}
                                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                                    required
                                >
                                    <option value="stock">Stock</option>
                                    <option value="crypto">Crypto</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Symbol</Label>
                                <Input
                                    type="text"
                                    placeholder="BTC, ETH, AAPL, etc."
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                                    required
                                />
                            </FormGroup>

                            {formData.type !== 'percent_change' && (
                                <FormGroup>
                                    <Label>Target Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="100000"
                                        value={formData.targetPrice}
                                        onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                            )}

                            {formData.type === 'percent_change' && (
                                <>
                                    <FormGroup>
                                        <Label>Percentage Change</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="10"
                                            value={formData.percentChange}
                                            onChange={(e) => setFormData({ ...formData, percentChange: e.target.value })}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>Timeframe</Label>
                                        <Select
                                            value={formData.timeframe}
                                            onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                                        >
                                            <option value="1h">1 Hour</option>
                                            <option value="24h">24 Hours</option>
                                            <option value="7d">7 Days</option>
                                            <option value="30d">30 Days</option>
                                        </Select>
                                    </FormGroup>
                                </>
                            )}

                            <ButtonGroup>
                                <SubmitButton type="submit">Create Alert</SubmitButton>
                                <CancelButton type="button" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </CancelButton>
                            </ButtonGroup>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
};

export default AlertsPage;