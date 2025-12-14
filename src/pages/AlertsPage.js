// client/src/pages/AlertsPage.js - Alert Management Page with Search

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    Bell, Plus, Trash2, Edit, TrendingUp, TrendingDown,
    Clock, DollarSign, Percent, CheckCircle, XCircle, X,
    Search, Loader, Bitcoin, BarChart2, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

// Animations
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    background: transparent;
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
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
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
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
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
    background: ${({ theme }) => theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.95)'};
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 550px;
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
    position: relative;
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

const SearchInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const SearchInput = styled(Input)`
    padding-left: 2.5rem;
    padding-right: ${props => props.$hasValue ? '2.5rem' : '1rem'};
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 0.75rem;
    color: #64748b;
    display: flex;
    align-items: center;
`;

const ClearButton = styled.button`
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;

    &:hover {
        color: #ef4444;
    }
`;

const SearchDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    margin-top: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const SearchResultItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    cursor: pointer;
    border-bottom: 1px solid rgba(100, 116, 139, 0.2);
    transition: all 0.2s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: rgba(0, 173, 237, 0.1);
    }
`;

const ResultIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$type === 'crypto' ?
        'linear-gradient(135deg, #f7931a 0%, #ffb84d 100%)' :
        'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
`;

const ResultInfo = styled.div`
    flex: 1;
`;

const ResultSymbol = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 1rem;
`;

const ResultName = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const ResultPrice = styled.div`
    text-align: right;
`;

const ResultPriceValue = styled.div`
    color: #e0e6ed;
    font-weight: 600;
`;

const ResultChain = styled.div`
    color: #00adef;
    font-size: 0.75rem;
    background: rgba(0, 173, 237, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    margin-top: 0.25rem;
    display: inline-block;
`;

const SearchLoading = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    color: #64748b;
`;

const Spinner = styled(Loader)`
    animation: ${spin} 1s linear infinite;
`;

const NoResults = styled.div`
    padding: 2rem;
    text-align: center;
    color: #64748b;
`;

const SelectedAsset = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    margin-top: 0.5rem;
`;

const SelectedAssetInfo = styled.div`
    flex: 1;
`;

const SelectedAssetSymbol = styled.div`
    color: #00adef;
    font-weight: 700;
    font-size: 1.1rem;
`;

const SelectedAssetName = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
`;

const SelectedAssetPrice = styled.div`
    color: #10b981;
    font-weight: 600;
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

const HelpText = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-top: 0.25rem;
`;

const AlertsPage = () => {
    const { api: authApi } = useAuth();
    const toast = useToast();
    const searchTimeoutRef = useRef(null);
    const searchInputRef = useRef(null);

    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState({ active: 0, triggered: 0, expired: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const [formData, setFormData] = useState({
        type: 'price_above',
        symbol: '',
        assetType: 'stock',
        targetPrice: '',
        percentChange: '',
        timeframe: '24h',
        network: '',
        contractAddress: ''
    });

    // Use the appropriate API instance
    const apiInstance = authApi || api;

    useEffect(() => {
        fetchAlerts();
        fetchStats();
    }, [filter]);

    // Debounced search
    const performSearch = useCallback(async (query) => {
        if (!query || query.length < 1) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }

        setSearchLoading(true);
        setShowSearchDropdown(true);

        try {
            const response = await apiInstance.get(`/search?q=${encodeURIComponent(query)}`);
            const { stocks = [], crypto = [] } = response.data;

            // Combine and format results
            const combined = [
                ...stocks.map(s => ({ ...s, type: 'stock' })),
                ...crypto.map(c => ({ ...c, type: 'crypto' }))
            ];

            setSearchResults(combined.slice(0, 15));
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, [apiInstance]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce search
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    const handleSelectAsset = (asset) => {
        setSelectedAsset(asset);
        setSearchQuery(asset.symbol);
        setShowSearchDropdown(false);

        // Update form data
        setFormData(prev => ({
            ...prev,
            symbol: asset.symbol,
            assetType: asset.type,
            network: asset.network || '',
            contractAddress: asset.tokenAddress || ''
        }));
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSelectedAsset(null);
        setSearchResults([]);
        setShowSearchDropdown(false);
        setFormData(prev => ({
            ...prev,
            symbol: '',
            network: '',
            contractAddress: ''
        }));
        searchInputRef.current?.focus();
    };

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const status = filter === 'all' ? '' : filter;
            const response = await apiInstance.get(`/alerts?status=${status}`);
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
            const response = await apiInstance.get('/alerts/stats');
            setStats(response.data.stats || { active: 0, triggered: 0, expired: 0, total: 0 });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const createAlert = async (e) => {
        e.preventDefault();

        if (!formData.symbol) {
            toast.error('Please select an asset');
            return;
        }

        try {
            const alertPayload = {
                type: formData.type,
                symbol: formData.symbol,
                assetType: formData.assetType,
                targetPrice: formData.type !== 'percent_change' ? parseFloat(formData.targetPrice) : undefined,
                percentChange: formData.type === 'percent_change' ? parseFloat(formData.percentChange) : undefined,
                timeframe: formData.timeframe
            };

            await apiInstance.post('/alerts', alertPayload);
            toast.success('Alert created successfully!');
            closeModal();
            fetchAlerts();
            fetchStats();
        } catch (error) {
            console.error('Error creating alert:', error);
            toast.error(error.response?.data?.error || 'Failed to create alert');
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setSearchQuery('');
        setSelectedAsset(null);
        setSearchResults([]);
        setShowSearchDropdown(false);
        setFormData({
            type: 'price_above',
            symbol: '',
            assetType: 'stock',
            targetPrice: '',
            percentChange: '',
            timeframe: '24h',
            network: '',
            contractAddress: ''
        });
    };

    const deleteAlert = async (alertId) => {
        if (!window.confirm('Are you sure you want to delete this alert?')) {
            return;
        }

        try {
            await apiInstance.delete(`/alerts/${alertId}`);
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

    const formatPrice = (price) => {
        if (!price) return 'N/A';
        if (price < 0.01) return `$${price.toFixed(8)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <PageContainer>
            <Header>
                <Title>Price Alerts</Title>
                <Subtitle>Get notified when prices hit your targets</Subtitle>
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
                    <Spinner size={32} />
                    <p style={{ marginTop: '1rem' }}>Loading alerts...</p>
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
                                        : formatPrice(alert.targetPrice)
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
                <Modal onClick={closeModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>Create New Alert</ModalTitle>
                        <Form onSubmit={createAlert}>
                            <FormGroup>
                                <Label>Search Asset</Label>
                                <SearchInputWrapper>
                                    <SearchIcon>
                                        {searchLoading ? <Spinner size={18} /> : <Search size={18} />}
                                    </SearchIcon>
                                    <SearchInput
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search stocks, crypto, or paste contract address..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                                        $hasValue={searchQuery.length > 0}
                                    />
                                    {searchQuery && (
                                        <ClearButton type="button" onClick={clearSearch}>
                                            <X size={18} />
                                        </ClearButton>
                                    )}
                                </SearchInputWrapper>
                                <HelpText>
                                    Search by symbol (AAPL, BTC) or paste a contract address (0x...)
                                </HelpText>

                                {showSearchDropdown && (
                                    <SearchDropdown>
                                        {searchLoading ? (
                                            <SearchLoading>
                                                <Spinner size={20} />
                                                Searching...
                                            </SearchLoading>
                                        ) : searchResults.length === 0 ? (
                                            <NoResults>
                                                {searchQuery.length > 0 ? 'No results found' : 'Start typing to search'}
                                            </NoResults>
                                        ) : (
                                            searchResults.map((result, index) => (
                                                <SearchResultItem
                                                    key={`${result.symbol}-${result.network || index}`}
                                                    onClick={() => handleSelectAsset(result)}
                                                >
                                                    <ResultIcon $type={result.type}>
                                                        {result.type === 'crypto' ? <Bitcoin size={20} /> : <BarChart2 size={20} />}
                                                    </ResultIcon>
                                                    <ResultInfo>
                                                        <ResultSymbol>{result.symbol}</ResultSymbol>
                                                        <ResultName>{result.name}</ResultName>
                                                        {result.network && (
                                                            <ResultChain>
                                                                <Globe size={10} style={{ marginRight: '4px' }} />
                                                                {result.chain || result.network.toUpperCase()}
                                                            </ResultChain>
                                                        )}
                                                    </ResultInfo>
                                                    <ResultPrice>
                                                        <ResultPriceValue>
                                                            {formatPrice(result.price)}
                                                        </ResultPriceValue>
                                                    </ResultPrice>
                                                </SearchResultItem>
                                            ))
                                        )}
                                    </SearchDropdown>
                                )}
                            </FormGroup>

                            {selectedAsset && (
                                <SelectedAsset>
                                    <ResultIcon $type={selectedAsset.type}>
                                        {selectedAsset.type === 'crypto' ? <Bitcoin size={20} /> : <BarChart2 size={20} />}
                                    </ResultIcon>
                                    <SelectedAssetInfo>
                                        <SelectedAssetSymbol>{selectedAsset.symbol}</SelectedAssetSymbol>
                                        <SelectedAssetName>
                                            {selectedAsset.name}
                                            {selectedAsset.network && ` (${selectedAsset.chain || selectedAsset.network.toUpperCase()})`}
                                        </SelectedAssetName>
                                    </SelectedAssetInfo>
                                    <SelectedAssetPrice>
                                        {formatPrice(selectedAsset.price)}
                                    </SelectedAssetPrice>
                                </SelectedAsset>
                            )}

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

                            {formData.type !== 'percent_change' && (
                                <FormGroup>
                                    <Label>Target Price</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder={selectedAsset?.price ? `Current: ${formatPrice(selectedAsset.price)}` : "Enter target price"}
                                        value={formData.targetPrice}
                                        onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                                        required
                                    />
                                    {selectedAsset?.price && formData.targetPrice && (
                                        <HelpText>
                                            {formData.type === 'price_above' ? 'Alert when price rises to' : 'Alert when price drops to'} {formatPrice(parseFloat(formData.targetPrice))}
                                            {' '}({((parseFloat(formData.targetPrice) - selectedAsset.price) / selectedAsset.price * 100).toFixed(2)}% from current)
                                        </HelpText>
                                    )}
                                </FormGroup>
                            )}

                            {formData.type === 'percent_change' && (
                                <>
                                    <FormGroup>
                                        <Label>Percentage Change</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="e.g., 10 for 10%"
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
                                <SubmitButton type="submit" disabled={!selectedAsset}>
                                    Create Alert
                                </SubmitButton>
                                <CancelButton type="button" onClick={closeModal}>
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
