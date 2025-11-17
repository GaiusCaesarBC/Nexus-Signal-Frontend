// client/src/pages/PortfolioPage.js - FIXED VERSION

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Briefcase, RefreshCcw, PlusCircle } from 'lucide-react';

// --- All your styled components (keep as-is) ---
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const PortfolioPageContainer = styled.div`
    flex-grow: 1;
    padding: 2.5rem;
    background: linear-gradient(180deg, #0d1a2f 0%, #1a273b 100%);
    color: #e0e6ed;
    font-family: 'Inter', sans-serif;
    animation: ${fadeIn} 0.8s ease-out forwards;
    min-height: calc(100vh - var(--navbar-height));
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (max-width: 768px) { padding: 1.5rem; }
`;

const PortfolioHeader = styled.h1`
    font-size: 3rem;
    color: #00adef;
    margin-bottom: 2.5rem;
    text-shadow: 0 0 15px rgba(0, 173, 237, 0.6);
    @media (max-width: 768px) {
        font-size: 2.5rem;
        margin-bottom: 2rem;
    }
`;

const SummarySection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
    margin-bottom: 3rem;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const SummaryCard = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 173, 237, 0.2);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
    }
`;

const CardTitle = styled.h4`
    font-size: 1.2rem;
    color: #94a3b8;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CardValue = styled.p`
    font-size: 2.5rem;
    font-weight: bold;
    color: #f8fafc;
    margin: 0;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
    &.positive { color: #10b981; }
    &.negative { color: #ef4444; }
`;

const HoldingsSection = styled.div`
    width: 100%;
    max-width: 1200px;
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 173, 237, 0.2);
    margin-bottom: 3rem;
    @media (max-width: 768px) { padding: 1.5rem; }
`;

const HoldingsTable = styled.table`
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 1.5rem;
    th, td {
        padding: 0.8rem 1rem;
        text-align: left;
        border-bottom: 1px solid #334155;
        white-space: nowrap;
        &:first-child { border-left: none; }
        &:last-child { border-right: none; }
    }
    th {
        color: #00adef;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding-bottom: 1rem;
        position: sticky;
        top: 0;
        background: #1e293b;
        z-index: 10;
    }
    td {
        color: #f8fafc;
        font-size: 1.1rem;
        &.positive { color: #10b981; }
        &.negative { color: #ef4444; }
    }
    tr:last-child td { border-bottom: none; }
`;

const TableWrapper = styled.div`
    max-height: 500px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #00adef #1a273b;
    &::-webkit-scrollbar { width: 8px; }
    &::-webkit-scrollbar-track {
        background: #1a273b;
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #00adef;
        border-radius: 10px;
        border: 2px solid #1a273b;
    }
`;

const Message = styled.p`
    text-align: center;
    font-size: 1.2rem;
    color: #94a3b8;
    padding: 2rem;
`;

const ErrorMessage = styled(Message)`
    color: #ef4444;
    font-weight: bold;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: #00adef;
    font-size: 1.5rem;
`;

const RotatingLoader = styled(Briefcase)`
    animation: spin 1s linear infinite;
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const RotatingRefresh = styled(RefreshCcw)`
    animation: spin 1s linear infinite;
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const AddHoldingSection = styled.div`
    width: 100%;
    max-width: 1200px;
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(0, 173, 237, 0.2);
    margin-bottom: 3rem;
    @media (max-width: 768px) { padding: 1.5rem; }
    h3 {
        color: #00adef;
        margin-bottom: 1.5rem;
        text-align: center;
        text-shadow: 0 0 8px rgba(0, 173, 237, 0.4);
    }
`;

const AddHoldingForm = styled.form`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    align-items: end;
    @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    label {
        font-size: 0.95rem;
        color: #94a3b8;
        margin-bottom: 0.5rem;
    }
    input {
        padding: 0.8rem 1rem;
        border: 1px solid #334155;
        border-radius: 8px;
        background-color: #0d1a2f;
        color: #e0e6ed;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        &:focus {
            border-color: #00adef;
            box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.3);
        }
        &::placeholder { color: #64748b; }
        &:disabled {
            background-color: #2c3e50;
            color: #94a3b8;
            cursor: not-allowed;
        }
    }
`;

const SubmitButton = styled.button`
    padding: 0.8rem 1.5rem;
    background-color: #00adef;
    color: #0d1a2f;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    &:hover:not(:disabled) {
        background-color: #008cc0;
        transform: translateY(-2px);
    }
    &:disabled {
        background-color: #64748b;
        cursor: not-allowed;
    }
`;

const FormError = styled.p`
    color: #ef4444;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 1rem;
    grid-column: 1 / -1;
`;

const formatLastUpdateTime = (timestamp) => {
    if (!timestamp) return 'Never updated';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// --- PortfolioPage Component ---
const PortfolioPage = () => {
    const { api, isAuthenticated, loading: authLoading } = useAuth();
    const [portfolio, setPortfolio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastPriceUpdateTimestamp, setLastPriceUpdateTimestamp] = useState(null);

    const [newHoldingSymbol, setNewHoldingSymbol] = useState('');
    const [newHoldingQuantity, setNewHoldingQuantity] = useState('');
    const [newHoldingPurchasePrice, setNewHoldingPurchasePrice] = useState('');
    const [addHoldingLoading, setAddHoldingLoading] = useState(false);
    const [addHoldingError, setAddHoldingError] = useState(null);

    const hasFetchedRef = useRef(false);

    // ✅ FIX: Fetch portfolio ONCE on mount
    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!isAuthenticated || !api || authLoading || hasFetchedRef.current) {
                return;
            }

            hasFetchedRef.current = true;
            setLoading(true);
            setError(null);

            try {
                console.log('Fetching portfolio...');
                const res = await api.get('/portfolio');
                console.log('Portfolio received:', res.data);
                setPortfolio(res.data);
                setLastPriceUpdateTimestamp(res.data.lastUpdatedAt || new Date().toISOString());
            } catch (err) {
                console.error('Error fetching portfolio:', err);
                setError('Failed to load portfolio data. Please try again.');
                setPortfolio(null);
                hasFetchedRef.current = false; // Allow retry
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && isAuthenticated) {
            fetchPortfolio();
        } else if (!authLoading && !isAuthenticated) {
            setError("Please log in to view your portfolio.");
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, api]);

    // Add Holding Handler
    const handleAddHoldingSubmit = async (e) => {
        e.preventDefault();
        setAddHoldingLoading(true);
        setAddHoldingError(null);

        if (!newHoldingSymbol || !newHoldingQuantity || !newHoldingPurchasePrice) {
            setAddHoldingError('All fields are required.');
            setAddHoldingLoading(false);
            return;
        }

        const quantity = parseFloat(newHoldingQuantity);
        const purchasePrice = parseFloat(newHoldingPurchasePrice);

        if (isNaN(quantity) || quantity <= 0) {
            setAddHoldingError('Quantity must be a positive number.');
            setAddHoldingLoading(false);
            return;
        }

        if (isNaN(purchasePrice) || purchasePrice <= 0) {
            setAddHoldingError('Purchase price must be a positive number.');
            setAddHoldingLoading(false);
            return;
        }

        try {
            const body = {
                symbol: newHoldingSymbol,
                quantity: quantity,
                purchasePrice: purchasePrice,
                purchaseDate: new Date().toISOString(),
            };
            const res = await api.post('/portfolio/add', body);
            setPortfolio(res.data);
            setNewHoldingSymbol('');
            setNewHoldingQuantity('');
            setNewHoldingPurchasePrice('');
            setAddHoldingError(null);
            setLastPriceUpdateTimestamp(new Date().toISOString());
        } catch (err) {
            console.error('Error adding holding:', err);
            setAddHoldingError(
                err.response?.data?.errors?.[0]?.msg || 
                err.response?.data?.msg || 
                'Failed to add holding. Please check inputs and try again.'
            );
        } finally {
            setAddHoldingLoading(false);
        }
    };

    if (loading) {
        return (
            <PortfolioPageContainer>
                <LoaderWrapper>
                    <RotatingLoader size={36} /> <Message>Loading portfolio...</Message>
                </LoaderWrapper>
            </PortfolioPageContainer>
        );
    }

    if (error) {
        return (
            <PortfolioPageContainer>
                <ErrorMessage>{error}</ErrorMessage>
            </PortfolioPageContainer>
        );
    }

    const { totalValue = 0, totalChange = 0, totalChangePercent = 0, cashBalance = 0, holdings = [] } = portfolio || {};
    const isPositiveChange = totalChange >= 0;

    return (
        <PortfolioPageContainer>
            <PortfolioHeader>My Portfolio</PortfolioHeader>

            {lastPriceUpdateTimestamp && (
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    Last updated: {formatLastUpdateTime(lastPriceUpdateTimestamp)}
                </p>
            )}

            <SummarySection>
                <SummaryCard>
                    <CardTitle><Wallet size={20} /> Cash Balance</CardTitle>
                    <CardValue>${cashBalance.toFixed(2)}</CardValue>
                </SummaryCard>
                <SummaryCard>
                    <CardTitle><DollarSign size={20} /> Total Portfolio Value</CardTitle>
                    <CardValue>${totalValue.toFixed(2)}</CardValue>
                </SummaryCard>
                <SummaryCard>
                    <CardTitle>{isPositiveChange ? <TrendingUp size={20} /> : <TrendingDown size={20} />} Daily Change</CardTitle>
                    <CardValue className={isPositiveChange ? 'positive' : 'negative'}>
                        ${totalChange.toFixed(2)} ({totalChangePercent.toFixed(2)}%)
                    </CardValue>
                </SummaryCard>
            </SummarySection>

            <AddHoldingSection>
                <h3><PlusCircle size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Add New Holding</h3>
                <AddHoldingForm onSubmit={handleAddHoldingSubmit}>
                    <FormGroup>
                        <label htmlFor="newHoldingSymbol">Symbol:</label>
                        <input
                            type="text"
                            id="newHoldingSymbol"
                            value={newHoldingSymbol}
                            onChange={(e) => setNewHoldingSymbol(e.target.value)}
                            placeholder="e.g., AAPL, BTC"
                            required
                            disabled={addHoldingLoading}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="newHoldingQuantity">Quantity:</label>
                        <input
                            type="number"
                            id="newHoldingQuantity"
                            value={newHoldingQuantity}
                            onChange={(e) => setNewHoldingQuantity(e.target.value)}
                            step="0.01"
                            min="0.01"
                            required
                            disabled={addHoldingLoading}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="newHoldingPurchasePrice">Purchase Price:</label>
                        <input
                            type="number"
                            id="newHoldingPurchasePrice"
                            value={newHoldingPurchasePrice}
                            onChange={(e) => setNewHoldingPurchasePrice(e.target.value)}
                            step="0.01"
                            min="0.01"
                            required
                            disabled={addHoldingLoading}
                        />
                    </FormGroup>
                    <SubmitButton type="submit" disabled={addHoldingLoading}>
                        {addHoldingLoading ? 'Adding...' : 'Add Holding'}
                    </SubmitButton>
                    {addHoldingError && <FormError>{addHoldingError}</FormError>}
                </AddHoldingForm>
            </AddHoldingSection>

            <HoldingsSection>
                <h3>Your Holdings</h3>
                {holdings.length > 0 ? (
                    <TableWrapper>
                        <HoldingsTable>
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Quantity</th>
                                    <th>Avg Cost</th>
                                    <th>Current Price</th>
                                    <th>Market Value</th>
                                    <th>Gain/Loss</th>
                                    <th>% Gain/Loss</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map((holding) => {
                                    const marketValue = holding.currentPrice * holding.quantity;
                                    const costBasis = holding.purchasePrice * holding.quantity;
                                    const gainLoss = marketValue - costBasis;
                                    const percentGainLoss = costBasis === 0 ? 0 : (gainLoss / costBasis) * 100;
                                    const isHoldingPositive = gainLoss >= 0;

                                    return (
                                        <tr key={holding._id || holding.symbol}>
                                            <td>{holding.symbol.toUpperCase()}</td>
                                            <td>{holding.quantity.toFixed(2)}</td>
                                            <td>${holding.purchasePrice.toFixed(2)}</td>
                                            <td>${holding.currentPrice.toFixed(2)}</td>
                                            <td>${marketValue.toFixed(2)}</td>
                                            <td className={isHoldingPositive ? 'positive' : 'negative'}>
                                                ${gainLoss.toFixed(2)}
                                            </td>
                                            <td className={isHoldingPositive ? 'positive' : 'negative'}>
                                                {percentGainLoss.toFixed(2)}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </HoldingsTable>
                    </TableWrapper>
                ) : (
                    <Message>You don't have any holdings yet. Use the form above to add your first investment!</Message>
                )}
            </HoldingsSection>
        </PortfolioPageContainer>
    );
};

export default PortfolioPage;