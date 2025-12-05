// src/components/WalletAnalytics.js - Wallet Analytics Dashboard
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../context/WalletContext';
import {
    Activity, TrendingUp, TrendingDown, DollarSign,
    ArrowUpRight, ArrowDownRight, ExternalLink, Fuel,
    Clock, Coins, PieChart as PieChartIcon, BarChart3,
    RefreshCw, ChevronRight, Copy, Check
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: ${fadeIn} 0.4s ease-out;
`;

const SectionTitle = styled.h3`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    margin: 0 0 1rem 0;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
`;

const StatCard = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 12px;
    padding: 1.25rem;
    animation: ${fadeIn} 0.4s ease-out;
    animation-delay: ${props => props.$delay || '0s'};
`;

const StatLabel = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 800;
    color: ${props => props.$color || props.theme.text?.primary || '#e0e6ed'};
`;

const StatChange = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
`;

const TokensSection = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
`;

const TokensList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
    overflow-y: auto;
`;

const TokenRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: ${props => props.theme.bg?.tertiary || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}1A;
        transform: translateX(4px);
    }
`;

const TokenInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const TokenIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${props => props.theme.brand?.primary || '#00adef'}33 0%, ${props => props.theme.brand?.accent || '#8b5cf6'}33 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const TokenDetails = styled.div``;

const TokenSymbol = styled.div`
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const TokenBalance = styled.div`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const TokenValue = styled.div`
    text-align: right;
`;

const TokenPrice = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const TokenChange = styled.div`
    font-size: 0.8rem;
    color: ${props => props.$positive ? props.theme.success || '#10b981' : props.theme.error || '#ef4444'};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;
`;

const ChartSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ChartCard = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
`;

const ChartTitle = styled.h4`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    margin: 0 0 1rem 0;
`;

const TransactionsSection = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}33;
    border-radius: 16px;
    padding: 1.5rem;
`;

const TransactionRow = styled.a`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: ${props => props.theme.bg?.tertiary || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 10px;
    margin-bottom: 0.5rem;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}1A;
    }
`;

const TxInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const TxIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.$type === 'receive'
        ? `${props.theme.success || '#10b981'}33`
        : `${props.theme.error || '#ef4444'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$type === 'receive'
        ? props.theme.success || '#10b981'
        : props.theme.error || '#ef4444'};
`;

const TxDetails = styled.div``;

const TxType = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
`;

const TxTime = styled.div`
    font-size: 0.75rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const TxAmount = styled.div`
    text-align: right;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TxValue = styled.div`
    font-weight: 600;
    color: ${props => props.$type === 'receive'
        ? props.theme.success || '#10b981'
        : props.theme.error || '#ef4444'};
`;

const ExternalLinkIcon = styled(ExternalLink)`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const LoadingSpinner = styled(RefreshCw)`
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const WalletAnalytics = () => {
    const { api } = useAuth();
    const { theme } = useTheme();
    const { linkedWallet } = useWallet();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const CHART_COLORS = [
        theme.brand?.primary || '#00adef',
        theme.success || '#10b981',
        theme.warning || '#f59e0b',
        theme.error || '#ef4444',
        theme.brand?.accent || '#8b5cf6',
        '#ec4899',
        '#06b6d4',
        '#84cc16'
    ];

    useEffect(() => {
        if (linkedWallet) {
            fetchAnalytics();
        } else {
            setLoading(false);
        }
    }, [linkedWallet]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/wallet/analytics');
            if (response.data.success) {
                setAnalytics(response.data.analytics);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load wallet analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(2)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(2)}K`;
        }
        return `$${value.toFixed(2)}`;
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(2)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(2)}K`;
        } else if (num < 0.0001 && num > 0) {
            return num.toExponential(2);
        }
        return num.toFixed(4);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <LoadingState theme={theme}>
                <LoadingSpinner size={32} />
                Loading wallet analytics...
            </LoadingState>
        );
    }

    if (!linkedWallet) {
        return (
            <EmptyState theme={theme}>
                Connect and link your wallet to view analytics
            </EmptyState>
        );
    }

    if (error || !analytics) {
        return (
            <EmptyState theme={theme}>
                {error || 'No analytics data available'}
            </EmptyState>
        );
    }

    return (
        <Container>
            {/* Overview Stats */}
            <StatsGrid>
                <StatCard theme={theme} $delay="0s">
                    <StatLabel theme={theme}>
                        <DollarSign size={14} />
                        Total Value
                    </StatLabel>
                    <StatValue theme={theme} $color={theme.brand?.primary}>
                        {formatCurrency(analytics.overview.totalValue)}
                    </StatValue>
                </StatCard>

                <StatCard theme={theme} $delay="0.05s">
                    <StatLabel theme={theme}>
                        <Coins size={14} />
                        {analytics.overview.nativeSymbol} Balance
                    </StatLabel>
                    <StatValue theme={theme}>
                        {formatNumber(analytics.overview.nativeBalance)}
                    </StatValue>
                    <StatChange theme={theme} $positive={true}>
                        ≈ {formatCurrency(analytics.overview.nativeValue)}
                    </StatChange>
                </StatCard>

                <StatCard theme={theme} $delay="0.1s">
                    <StatLabel theme={theme}>
                        <Activity size={14} />
                        Transactions
                    </StatLabel>
                    <StatValue theme={theme}>
                        {analytics.overview.totalTransactions}
                    </StatValue>
                    <StatChange theme={theme} $positive={analytics.activity.incoming > analytics.activity.outgoing}>
                        {analytics.activity.incoming} in / {analytics.activity.outgoing} out
                    </StatChange>
                </StatCard>

                <StatCard theme={theme} $delay="0.15s">
                    <StatLabel theme={theme}>
                        <Fuel size={14} />
                        Gas Spent
                    </StatLabel>
                    <StatValue theme={theme}>
                        {analytics.gasSpent.total.toFixed(4)} {analytics.overview.nativeSymbol}
                    </StatValue>
                    <StatChange theme={theme} $positive={false}>
                        ≈ {formatCurrency(analytics.gasSpent.usd)}
                    </StatChange>
                </StatCard>
            </StatsGrid>

            {/* Charts */}
            {analytics.distribution && analytics.distribution.length > 0 && (
                <ChartSection>
                    <ChartCard theme={theme}>
                        <ChartTitle theme={theme}>
                            <PieChartIcon size={18} />
                            Token Distribution
                        </ChartTitle>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={analytics.distribution}
                                    dataKey="value"
                                    nameKey="symbol"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={50}
                                >
                                    {analytics.distribution.map((entry, index) => (
                                        <Cell key={entry.symbol} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        background: theme.bg?.card || 'rgba(30, 41, 59, 0.95)',
                                        border: `1px solid ${theme.brand?.primary || '#00adef'}4D`,
                                        borderRadius: '8px',
                                        color: theme.text?.primary || '#e0e6ed'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                            {analytics.distribution.slice(0, 5).map((token, idx) => (
                                <div key={token.symbol} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[idx] }} />
                                    <span style={{ color: theme.text?.secondary }}>{token.symbol}</span>
                                    <span style={{ color: theme.text?.tertiary }}>({token.percentage.toFixed(1)}%)</span>
                                </div>
                            ))}
                        </div>
                    </ChartCard>

                    <ChartCard theme={theme}>
                        <ChartTitle theme={theme}>
                            <BarChart3 size={18} />
                            Top Holdings
                        </ChartTitle>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={analytics.tokensList.slice(0, 5)} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="symbol" width={60} tick={{ fill: theme.text?.secondary, fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        background: theme.bg?.card || 'rgba(30, 41, 59, 0.95)',
                                        border: `1px solid ${theme.brand?.primary || '#00adef'}4D`,
                                        borderRadius: '8px',
                                        color: theme.text?.primary || '#e0e6ed'
                                    }}
                                />
                                <Bar dataKey="value" fill={theme.brand?.primary || '#00adef'} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </ChartSection>
            )}

            {/* Token Holdings */}
            {analytics.tokensList && analytics.tokensList.length > 0 && (
                <TokensSection theme={theme}>
                    <SectionTitle theme={theme}>
                        <Coins size={20} />
                        Token Holdings ({analytics.tokensList.length})
                    </SectionTitle>
                    <TokensList>
                        {analytics.tokensList.map((token, idx) => (
                            <TokenRow key={token.symbol} theme={theme}>
                                <TokenInfo>
                                    <TokenIcon theme={theme}>
                                        {token.symbol.substring(0, 2)}
                                    </TokenIcon>
                                    <TokenDetails>
                                        <TokenSymbol theme={theme}>{token.symbol}</TokenSymbol>
                                        <TokenBalance theme={theme}>
                                            {formatNumber(token.netPosition)} tokens
                                        </TokenBalance>
                                    </TokenDetails>
                                </TokenInfo>
                                <TokenValue>
                                    <TokenPrice theme={theme}>
                                        {formatCurrency(token.value)}
                                    </TokenPrice>
                                    {token.currentPrice > 0 && (
                                        <TokenChange theme={theme} $positive={token.change24h >= 0}>
                                            {token.change24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {Math.abs(token.change24h).toFixed(2)}%
                                        </TokenChange>
                                    )}
                                </TokenValue>
                            </TokenRow>
                        ))}
                    </TokensList>
                </TokensSection>
            )}

            {/* Recent Transactions */}
            {analytics.recentTransactions && analytics.recentTransactions.length > 0 && (
                <TransactionsSection theme={theme}>
                    <SectionTitle theme={theme}>
                        <Clock size={20} />
                        Recent Transactions
                    </SectionTitle>
                    {analytics.recentTransactions.slice(0, 10).map((tx, idx) => (
                        <TransactionRow
                            key={tx.hash}
                            theme={theme}
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <TxInfo>
                                <TxIcon theme={theme} $type={tx.type}>
                                    {tx.type === 'receive' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                </TxIcon>
                                <TxDetails>
                                    <TxType theme={theme}>
                                        {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.symbol}
                                    </TxType>
                                    <TxTime theme={theme}>
                                        {formatTime(tx.timestamp)}
                                    </TxTime>
                                </TxDetails>
                            </TxInfo>
                            <TxAmount>
                                <TxValue theme={theme} $type={tx.type}>
                                    {tx.type === 'receive' ? '+' : '-'}{formatNumber(tx.amount)}
                                </TxValue>
                                <ExternalLinkIcon size={14} />
                            </TxAmount>
                        </TransactionRow>
                    ))}
                </TransactionsSection>
            )}
        </Container>
    );
};

export default WalletAnalytics;
