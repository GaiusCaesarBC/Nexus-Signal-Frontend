// src/components/BrokerageConnect.js - Brokerage Connection Component
import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { usePlaidLink } from 'react-plaid-link';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Building2,
    Key,
    Link2,
    Unlink,
    RefreshCw,
    Check,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    TrendingUp,
    DollarSign,
    Wallet,
    X
} from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin: 0 0 0.5rem 0;
`;

const ConnectionCard = styled.div`
    background: ${props => props.$active
        ? `linear-gradient(135deg, ${props.theme.success || '#10b981'}1A 0%, ${props.theme.success || '#10b981'}0D 100%)`
        : props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${props => props.$active
        ? `${props.theme.success || '#10b981'}4D`
        : props.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    padding: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const ConnectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
`;

const ConnectionInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const BrokerLogo = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: ${props => props.$color || props.theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1rem;
`;

const BrokerDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const BrokerName = styled.span`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const BrokerStatus = styled.span`
    font-size: 0.8rem;
    color: ${props => props.$status === 'active'
        ? props.theme.success || '#10b981'
        : props.$status === 'error'
        ? props.theme.error || '#ef4444'
        : props.theme.text?.tertiary || '#64748b'};
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    background: ${props => props.$status === 'active'
        ? `${props.theme.success || '#10b981'}33`
        : props.$status === 'error'
        ? `${props.theme.error || '#ef4444'}33`
        : `${props.theme.text?.tertiary || '#64748b'}33`};
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.$status === 'active'
        ? props.theme.success || '#10b981'
        : props.$status === 'error'
        ? props.theme.error || '#ef4444'
        : props.theme.text?.tertiary || '#64748b'};
`;

const ConnectionBody = styled.div`
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid ${props => props.theme.border || 'rgba(255, 255, 255, 0.1)'};
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: ${props => {
        if (props.$variant === 'success') return props.theme.success || '#10b981';
        if (props.$variant === 'danger') return `${props.theme.error || '#ef4444'}1A`;
        if (props.$variant === 'secondary') return props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)';
        return props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`;
    }};
    border: 1px solid ${props => {
        if (props.$variant === 'danger') return `${props.theme.error || '#ef4444'}4D`;
        if (props.$variant === 'secondary') return props.theme.border || 'rgba(255, 255, 255, 0.1)';
        return 'transparent';
    }};
    border-radius: 8px;
    color: ${props => {
        if (props.$variant === 'success') return 'white';
        if (props.$variant === 'danger') return props.theme.error || '#ef4444';
        if (props.$variant === 'secondary') return props.theme.text?.secondary || '#94a3b8';
        return 'white';
    }};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 100px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${props => props.theme.brand?.primary || '#00adef'}33;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        ${props => props.$loading && css`animation: ${spin} 1s linear infinite;`}
    }
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const InputLabel = styled.label`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const Input = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    padding-right: ${props => props.$hasIcon ? '2.5rem' : '1rem'};
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${props => props.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
    font-family: monospace;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
    }

    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const InputIcon = styled.button`
    position: absolute;
    right: 0.75rem;
    background: none;
    border: none;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: ${props => props.theme.text?.primary || '#e0e6ed'};
    }
`;

const HoldingsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
`;

const HoldingItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border-radius: 8px;
`;

const HoldingInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const HoldingSymbol = styled.span`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const HoldingQuantity = styled.span`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const HoldingValue = styled.span`
    font-weight: 600;
    color: ${props => props.theme.success || '#10b981'};
`;

const TotalValue = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: ${props => props.theme.brand?.primary || '#00adef'}1A;
    border-radius: 8px;
    margin-top: 0.5rem;
`;

const TotalLabel = styled.span`
    font-weight: 600;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const TotalAmount = styled.span`
    font-weight: 700;
    font-size: 1.1rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: ${props => props.theme.error || '#ef4444'}1A;
    border: 1px solid ${props => props.theme.error || '#ef4444'}4D;
    border-radius: 8px;
    color: ${props => props.theme.error || '#ef4444'};
    font-size: 0.85rem;
`;

const InfoText = styled.p`
    font-size: 0.85rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    margin: 0.5rem 0 0 0;
    line-height: 1.5;
`;

const BrokerGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
`;

const BrokerOption = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: ${props => props.$selected
        ? `${props.theme.brand?.primary || '#00adef'}1A`
        : props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${props => props.$selected
        ? props.theme.brand?.primary || '#00adef'
        : props.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
        transform: translateY(-2px);
    }
`;

const BrokerOptionName = styled.span`
    font-weight: 600;
    font-size: 0.85rem;
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: ${props => props.theme.bg?.secondary || '#1a1f2e'};
    border: 1px solid ${props => props.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    cursor: pointer;
    padding: 0.25rem;

    &:hover {
        color: ${props => props.theme.text?.primary || '#e0e6ed'};
    }
`;

// Broker configurations
const BROKERS = {
    kraken: {
        name: 'Kraken',
        color: '#5741d9',
        type: 'api',
        description: 'Connect using your Kraken API key and secret'
    },
    robinhood: {
        name: 'Robinhood',
        color: '#00c805',
        type: 'plaid',
        description: 'Connect securely via Plaid'
    },
    webull: {
        name: 'Webull',
        color: '#f45126',
        type: 'plaid',
        description: 'Connect securely via Plaid'
    },
    schwab: {
        name: 'Schwab',
        color: '#00a0df',
        type: 'plaid',
        description: 'Connect securely via Plaid'
    }
};

const BrokerageConnect = () => {
    const { user } = useAuth();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedConnection, setExpandedConnection] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState(null);

    // Kraken form state
    const [krakenApiKey, setKrakenApiKey] = useState('');
    const [krakenApiSecret, setKrakenApiSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [syncing, setSyncing] = useState({});
    const [error, setError] = useState(null);

    // Plaid Link state
    const [plaidToken, setPlaidToken] = useState(null);

    // Fetch connections
    const fetchConnections = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/brokerage/connections');
            if (response.data.success) {
                setConnections(response.data.connections);
            }
        } catch (err) {
            console.error('Error fetching connections:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchConnections();
        }
    }, [user, fetchConnections]);

    // Create Plaid link token
    const createPlaidToken = async () => {
        try {
            const response = await api.post('/brokerage/plaid/link-token');
            if (response.data.success) {
                setPlaidToken(response.data.linkToken);
            }
        } catch (err) {
            console.error('Error creating Plaid token:', err);
            setError('Failed to initialize Plaid. Please try again.');
        }
    };

    // Plaid Link config
    const { open: openPlaid, ready: plaidReady } = usePlaidLink({
        token: plaidToken,
        onSuccess: async (publicToken, metadata) => {
            try {
                setConnecting(true);
                const response = await api.post('/brokerage/plaid/exchange', {
                    publicToken,
                    institutionId: metadata.institution?.institution_id,
                    institutionName: metadata.institution?.name
                });

                if (response.data.success) {
                    await fetchConnections();
                    setShowAddModal(false);
                    setSelectedBroker(null);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to connect brokerage');
            } finally {
                setConnecting(false);
            }
        },
        onExit: () => {
            setPlaidToken(null);
        }
    });

    // Connect Kraken
    const connectKraken = async () => {
        if (!krakenApiKey || !krakenApiSecret) {
            setError('API key and secret are required');
            return;
        }

        try {
            setConnecting(true);
            setError(null);

            const response = await api.post('/brokerage/kraken/connect', {
                apiKey: krakenApiKey,
                apiSecret: krakenApiSecret,
                name: 'Kraken'
            });

            if (response.data.success) {
                await fetchConnections();
                setShowAddModal(false);
                setSelectedBroker(null);
                setKrakenApiKey('');
                setKrakenApiSecret('');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to connect Kraken');
        } finally {
            setConnecting(false);
        }
    };

    // Sync connection
    const syncConnection = async (connection) => {
        try {
            setSyncing(prev => ({ ...prev, [connection.id]: true }));

            const endpoint = connection.type === 'kraken'
                ? `/brokerage/kraken/sync/${connection.id}`
                : `/brokerage/plaid/sync/${connection.id}`;

            await api.get(endpoint);
            await fetchConnections();
        } catch (err) {
            console.error('Error syncing:', err);
        } finally {
            setSyncing(prev => ({ ...prev, [connection.id]: false }));
        }
    };

    // Disconnect
    const disconnectBrokerage = async (connectionId) => {
        if (!window.confirm('Are you sure you want to disconnect this brokerage?')) {
            return;
        }

        try {
            await api.delete(`/brokerage/disconnect/${connectionId}`);
            await fetchConnections();
        } catch (err) {
            console.error('Error disconnecting:', err);
        }
    };

    // Handle broker selection
    const handleBrokerSelect = async (broker) => {
        setSelectedBroker(broker);
        setError(null);

        if (BROKERS[broker].type === 'plaid') {
            await createPlaidToken();
        }
    };

    // Open Plaid when ready
    useEffect(() => {
        if (plaidToken && plaidReady && selectedBroker && BROKERS[selectedBroker]?.type === 'plaid') {
            openPlaid();
        }
    }, [plaidToken, plaidReady, selectedBroker, openPlaid]);

    if (!user) {
        return (
            <Container>
                <InfoText>Log in to connect your brokerages</InfoText>
            </Container>
        );
    }

    return (
        <Container>
            <SectionTitle>
                <Building2 size={20} />
                Brokerage Connections
            </SectionTitle>

            {/* Connected Brokerages */}
            {connections.map(conn => (
                <ConnectionCard key={conn.id} $active={conn.status === 'active'}>
                    <ConnectionHeader onClick={() => setExpandedConnection(
                        expandedConnection === conn.id ? null : conn.id
                    )}>
                        <ConnectionInfo>
                            <BrokerLogo $color={BROKERS[conn.type]?.color}>
                                {conn.name?.charAt(0) || 'B'}
                            </BrokerLogo>
                            <BrokerDetails>
                                <BrokerName>{conn.name}</BrokerName>
                                <BrokerStatus $status={conn.status}>
                                    {conn.status === 'active' && `$${conn.cachedPortfolio?.totalValue?.toLocaleString() || '0'}`}
                                    {conn.status === 'error' && 'Connection Error'}
                                    {conn.status === 'pending' && 'Pending...'}
                                </BrokerStatus>
                            </BrokerDetails>
                        </ConnectionInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StatusBadge $status={conn.status}>
                                {conn.status === 'active' && <><Check size={12} /> Connected</>}
                                {conn.status === 'error' && <><AlertCircle size={12} /> Error</>}
                                {conn.status === 'pending' && 'Pending'}
                            </StatusBadge>
                            {expandedConnection === conn.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                    </ConnectionHeader>

                    {expandedConnection === conn.id && (
                        <ConnectionBody>
                            {conn.lastError && (
                                <ErrorMessage>
                                    <AlertCircle size={16} />
                                    {conn.lastError}
                                </ErrorMessage>
                            )}

                            {conn.cachedPortfolio?.holdings?.length > 0 && (
                                <>
                                    <HoldingsList>
                                        {conn.cachedPortfolio.holdings.slice(0, 5).map((holding, idx) => (
                                            <HoldingItem key={idx}>
                                                <HoldingInfo>
                                                    <HoldingSymbol>{holding.symbol}</HoldingSymbol>
                                                    <HoldingQuantity>
                                                        {holding.quantity?.toFixed(4)} @ ${holding.price?.toFixed(2)}
                                                    </HoldingQuantity>
                                                </HoldingInfo>
                                                <HoldingValue>
                                                    ${holding.value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </HoldingValue>
                                            </HoldingItem>
                                        ))}
                                    </HoldingsList>
                                    <TotalValue>
                                        <TotalLabel>Total Value</TotalLabel>
                                        <TotalAmount>
                                            ${conn.cachedPortfolio.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TotalAmount>
                                    </TotalValue>
                                </>
                            )}

                            <ButtonRow>
                                <ActionButton
                                    onClick={() => syncConnection(conn)}
                                    disabled={syncing[conn.id]}
                                    $loading={syncing[conn.id]}
                                >
                                    <RefreshCw size={16} />
                                    {syncing[conn.id] ? 'Syncing...' : 'Sync'}
                                </ActionButton>
                                <ActionButton
                                    $variant="danger"
                                    onClick={() => disconnectBrokerage(conn.id)}
                                >
                                    <Unlink size={16} />
                                    Disconnect
                                </ActionButton>
                            </ButtonRow>

                            {conn.lastSync && (
                                <InfoText>
                                    Last synced: {new Date(conn.lastSync).toLocaleString()}
                                </InfoText>
                            )}
                        </ConnectionBody>
                    )}
                </ConnectionCard>
            ))}

            {/* Add Brokerage Button */}
            <ActionButton onClick={() => setShowAddModal(true)}>
                <Link2 size={16} />
                Connect Brokerage
            </ActionButton>

            {/* Add Brokerage Modal */}
            {showAddModal && (
                <Modal onClick={() => setShowAddModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>
                                {selectedBroker ? `Connect ${BROKERS[selectedBroker].name}` : 'Connect a Brokerage'}
                            </ModalTitle>
                            <CloseButton onClick={() => {
                                setShowAddModal(false);
                                setSelectedBroker(null);
                                setError(null);
                            }}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>

                        {error && (
                            <ErrorMessage style={{ marginBottom: '1rem' }}>
                                <AlertCircle size={16} />
                                {error}
                            </ErrorMessage>
                        )}

                        {!selectedBroker ? (
                            <>
                                <InfoText style={{ margin: '0 0 1rem 0' }}>
                                    Select a brokerage to connect your investment accounts
                                </InfoText>
                                <BrokerGrid>
                                    {Object.entries(BROKERS).map(([key, broker]) => (
                                        <BrokerOption
                                            key={key}
                                            onClick={() => handleBrokerSelect(key)}
                                        >
                                            <BrokerLogo $color={broker.color} style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                                                {broker.name.charAt(0)}
                                            </BrokerLogo>
                                            <BrokerOptionName>{broker.name}</BrokerOptionName>
                                        </BrokerOption>
                                    ))}
                                </BrokerGrid>
                            </>
                        ) : selectedBroker === 'kraken' ? (
                            <>
                                <InfoText style={{ margin: '0 0 1rem 0' }}>
                                    Enter your Kraken API credentials. Create API keys at{' '}
                                    <a href="https://www.kraken.com/u/security/api" target="_blank" rel="noopener noreferrer" style={{ color: '#00adef' }}>
                                        kraken.com/u/security/api
                                    </a>
                                </InfoText>

                                <InputGroup>
                                    <InputLabel>API Key</InputLabel>
                                    <Input
                                        type="text"
                                        placeholder="Your Kraken API key"
                                        value={krakenApiKey}
                                        onChange={e => setKrakenApiKey(e.target.value)}
                                    />
                                </InputGroup>

                                <InputGroup>
                                    <InputLabel>API Secret</InputLabel>
                                    <InputWrapper>
                                        <Input
                                            type={showSecret ? 'text' : 'password'}
                                            placeholder="Your Kraken API secret"
                                            value={krakenApiSecret}
                                            onChange={e => setKrakenApiSecret(e.target.value)}
                                            $hasIcon
                                        />
                                        <InputIcon onClick={() => setShowSecret(!showSecret)}>
                                            {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </InputIcon>
                                    </InputWrapper>
                                </InputGroup>

                                <ButtonRow>
                                    <ActionButton
                                        $variant="secondary"
                                        onClick={() => setSelectedBroker(null)}
                                    >
                                        Back
                                    </ActionButton>
                                    <ActionButton
                                        $variant="success"
                                        onClick={connectKraken}
                                        disabled={connecting || !krakenApiKey || !krakenApiSecret}
                                        $loading={connecting}
                                    >
                                        {connecting ? (
                                            <><RefreshCw size={16} /> Connecting...</>
                                        ) : (
                                            <><Link2 size={16} /> Connect</>
                                        )}
                                    </ActionButton>
                                </ButtonRow>
                            </>
                        ) : (
                            <>
                                <InfoText style={{ margin: '0 0 1rem 0' }}>
                                    {BROKERS[selectedBroker].description}.
                                    Plaid is a secure service used by thousands of financial apps.
                                </InfoText>

                                <ButtonRow>
                                    <ActionButton
                                        $variant="secondary"
                                        onClick={() => {
                                            setSelectedBroker(null);
                                            setPlaidToken(null);
                                        }}
                                    >
                                        Back
                                    </ActionButton>
                                    <ActionButton
                                        $variant="success"
                                        onClick={openPlaid}
                                        disabled={!plaidReady || connecting}
                                        $loading={connecting || !plaidReady}
                                    >
                                        {!plaidReady ? (
                                            <><RefreshCw size={16} /> Loading...</>
                                        ) : (
                                            <><Link2 size={16} /> Open {BROKERS[selectedBroker].name}</>
                                        )}
                                    </ActionButton>
                                </ButtonRow>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            )}

            {loading && connections.length === 0 && (
                <InfoText>Loading connections...</InfoText>
            )}

            {!loading && connections.length === 0 && (
                <InfoText>
                    Connect your brokerage accounts to track all your investments in one place.
                    Supports Kraken, Robinhood, Webull, and Charles Schwab.
                </InfoText>
            )}
        </Container>
    );
};

export default BrokerageConnect;
