// src/components/RecentTransactions.js - Real-time transactions display

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Activity, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCryptoPrice, formatStockPrice } from '../utils/priceFormatter';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const Container = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary}33;
    border-radius: 16px;
    padding: 1.25rem;
    margin-top: 1rem;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const Title = styled.h3`
    font-size: 1rem;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;

    svg {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const RefreshButton = styled.button`
    background: ${props => props.theme.brand?.primary}1a;
    border: 1px solid ${props => props.theme.brand?.primary}33;
    border-radius: 8px;
    padding: 0.5rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;

    &:hover:not(:disabled) {
        background: ${props => props.theme.brand?.primary}33;
        color: ${props => props.theme.brand?.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        ${props => props.$loading && `animation: spin 1s linear infinite;`}
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const TransactionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme.brand?.primary}66;
        border-radius: 3px;
    }
`;

const TransactionRow = styled.div`
    display: grid;
    grid-template-columns: 60px 1fr 1fr 80px;
    align-items: center;
    padding: 0.6rem 0.75rem;
    background: ${props => props.$side === 'BUY'
        ? `${props.theme.success || '#10b981'}0d`
        : `${props.theme.error || '#ef4444'}0d`};
    border: 1px solid ${props => props.$side === 'BUY'
        ? `${props.theme.success || '#10b981'}20`
        : `${props.theme.error || '#ef4444'}20`};
    border-radius: 8px;
    animation: ${fadeIn} 0.3s ease-out;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$side === 'BUY'
            ? `${props.theme.success || '#10b981'}1a`
            : `${props.theme.error || '#ef4444'}1a`};
        transform: translateX(2px);
    }

    @media (max-width: 600px) {
        grid-template-columns: 50px 1fr 1fr;
        font-size: 0.8rem;
    }
`;

const SideBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 700;
    background: ${props => props.$side === 'BUY'
        ? `${props.theme.success || '#10b981'}33`
        : `${props.theme.error || '#ef4444'}33`};
    color: ${props => props.$side === 'BUY'
        ? props.theme.success || '#10b981'
        : props.theme.error || '#ef4444'};

    svg {
        width: 12px;
        height: 12px;
    }
`;

const PriceInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`;

const Price = styled.span`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-family: 'SF Mono', 'Fira Code', monospace;
`;

const Amount = styled.span`
    font-size: 0.7rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const TimeInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.1rem;

    @media (max-width: 600px) {
        display: none;
    }
`;

const Time = styled.span`
    font-size: 0.7rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const Source = styled.span`
    font-size: 0.6rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'}80;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const TxLink = styled.a`
    color: ${props => props.theme.brand?.primary || '#00adef'};
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.65rem;

    &:hover {
        text-decoration: underline;
    }

    svg {
        width: 10px;
        height: 10px;
    }
`;

const LoadingState = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    animation: ${pulse} 1.5s infinite;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    text-align: center;

    svg {
        margin-bottom: 0.5rem;
        opacity: 0.5;
    }
`;

const LiveIndicator = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.65rem;
    color: ${props => props.theme.success || '#10b981'};
    padding: 0.2rem 0.5rem;
    background: ${props => props.theme.success || '#10b981'}1a;
    border-radius: 10px;

    &::before {
        content: '';
        width: 6px;
        height: 6px;
        background: ${props => props.theme.success || '#10b981'};
        border-radius: 50%;
        animation: ${pulse} 2s infinite;
    }
`;

const RecentTransactions = ({ symbol, isCrypto = false }) => {
    const { api } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = (now - date) / 1000; // seconds

        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const formatPrice = (price) => {
        if (isCrypto) {
            return formatCryptoPrice(price);
        }
        return formatStockPrice(price);
    };

    const formatAmount = (amount) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(2)}K`;
        return `$${amount.toFixed(2)}`;
    };

    const getExplorerUrl = (txHash, network) => {
        if (!txHash) return null;

        const explorers = {
            'eth': `https://etherscan.io/tx/${txHash}`,
            'bsc': `https://bscscan.com/tx/${txHash}`,
            'polygon_pos': `https://polygonscan.com/tx/${txHash}`,
            'arbitrum': `https://arbiscan.io/tx/${txHash}`,
            'base': `https://basescan.org/tx/${txHash}`,
            'optimism': `https://optimistic.etherscan.io/tx/${txHash}`,
            'avalanche': `https://snowtrace.io/tx/${txHash}`,
            'solana': `https://solscan.io/tx/${txHash}`
        };

        return explorers[network] || null;
    };

    const [marketClosed, setMarketClosed] = useState(false);
    const [currentSymbol, setCurrentSymbol] = useState(null);

    const fetchTransactions = useCallback(async (symbolToFetch) => {
        const targetSymbol = symbolToFetch || symbol;
        if (!targetSymbol) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/transactions/${encodeURIComponent(targetSymbol)}`);

            if (response.data.success) {
                setTransactions(response.data.trades || []);
                setMarketClosed(response.data.marketClosed || false);
                setLastUpdated(new Date());
            } else {
                setError(response.data.error || 'Failed to fetch transactions');
            }
        } catch (err) {
            console.error('[Transactions] Error:', err);
            setError(err.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    }, [api, symbol]);

    // Immediately fetch when symbol changes
    useEffect(() => {
        if (symbol && symbol !== currentSymbol) {
            // Clear old data immediately when symbol changes
            setTransactions([]);
            setError(null);
            setCurrentSymbol(symbol);

            // Fetch new data immediately
            fetchTransactions(symbol);
        }
    }, [symbol, currentSymbol, fetchTransactions]);

    // Auto-refresh interval (separate from symbol change)
    useEffect(() => {
        if (!symbol) return;

        // Auto-refresh every 30 seconds for crypto, 60 seconds for stocks
        const interval = setInterval(() => fetchTransactions(), isCrypto ? 30000 : 60000);
        return () => clearInterval(interval);
    }, [symbol, isCrypto, fetchTransactions]);

    if (loading && transactions.length === 0) {
        return (
            <Container>
                <Header>
                    <Title><Activity size={18} /> Recent Transactions</Title>
                </Header>
                <LoadingState>
                    <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: '0.5rem' }}>Loading trades...</span>
                </LoadingState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>
                    <Activity size={18} />
                    Recent Transactions
                    {transactions.length > 0 && <LiveIndicator>LIVE</LiveIndicator>}
                </Title>
                <RefreshButton onClick={fetchTransactions} disabled={loading} $loading={loading}>
                    <RefreshCw size={14} />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </RefreshButton>
            </Header>

            {error ? (
                <EmptyState>
                    <Activity size={32} />
                    <p>Unable to load transactions</p>
                    <small>{error}</small>
                </EmptyState>
            ) : transactions.length === 0 ? (
                <EmptyState>
                    <Activity size={32} />
                    {marketClosed && !isCrypto ? (
                        <>
                            <p>Market Closed</p>
                            <small>Stock market hours: 9:30 AM - 4:00 PM ET</small>
                        </>
                    ) : (
                        <>
                            <p>No recent transactions</p>
                            <small>Trades will appear here when available</small>
                        </>
                    )}
                </EmptyState>
            ) : (
                <TransactionsList>
                    {transactions.slice(0, 25).map((tx, index) => (
                        <TransactionRow key={tx.id || index} $side={tx.side}>
                            <SideBadge $side={tx.side}>
                                {tx.side === 'BUY' ? <ArrowUpRight /> : <ArrowDownRight />}
                                {tx.side}
                            </SideBadge>

                            <PriceInfo>
                                <Price>{formatPrice(tx.price)}</Price>
                                <Amount>
                                    {tx.shares ? `${tx.shares} shares` :
                                     tx.tokenAmount ? `${tx.tokenAmount.toFixed(4)} tokens` :
                                     formatAmount(tx.amount)}
                                </Amount>
                            </PriceInfo>

                            <PriceInfo>
                                <Price>{formatAmount(tx.amount)}</Price>
                                {tx.txHash && tx.network ? (
                                    <TxLink
                                        href={getExplorerUrl(tx.txHash, tx.network)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {tx.txHash.slice(0, 8)}... <ExternalLink />
                                    </TxLink>
                                ) : tx.maker ? (
                                    <Amount>{tx.maker}</Amount>
                                ) : null}
                            </PriceInfo>

                            <TimeInfo>
                                <Time>{formatTime(tx.timestamp)}</Time>
                                <Source>
                                    {tx.network || tx.exchange || 'DEX'}
                                </Source>
                            </TimeInfo>
                        </TransactionRow>
                    ))}
                </TransactionsList>
            )}
        </Container>
    );
};

export default RecentTransactions;
