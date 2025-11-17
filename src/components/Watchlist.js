// client/src/components/Watchlist.js - FIXED

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { X, Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const WatchlistContainer = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
    color: #e0e6ed;
    animation: ${fadeIn} 0.5s ease-out forwards;
    display: flex;
    flex-direction: column;
`;

const WatchlistHeader = styled.h3`
    font-size: 1.8rem;
    color: #00adef;
    margin-bottom: 1.2rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.3);
    text-align: center;
`;

const WatchlistList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 600px;
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

const WatchlistItem = styled.li`
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: rgba(0, 173, 237, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(0, 173, 237, 0.1);
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const SymbolInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
`;

const SymbolName = styled.span`
    font-weight: bold;
    color: #f8fafc;
    font-size: 1.2rem;
`;

const PriceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
`;

const Price = styled.span`
    color: #94a3b8;
    font-weight: 500;
`;

const PriceChange = styled.span`
    display: flex;
    align-items: center;
    gap: 0.2rem;
    color: ${props => props.positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
`;

const RemoveButton = styled.button`
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ff6b6b;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
        transform: scale(1.05);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Message = styled.p`
    text-align: center;
    font-size: 1.1rem;
    color: #b0c4de;
    padding: 2rem;
`;

const ErrorMessage = styled(Message)`
    color: #ff6b6b;
    font-weight: bold;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    color: #00adef;
    gap: 0.5rem;
`;

const RotatingLoader = styled(Loader2)`
    animation: spin 1s linear infinite;
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

const RefreshButton = styled.button`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    color: #00adef;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(0, 173, 237, 0.2);
        border-color: rgba(0, 173, 237, 0.5);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Watchlist = () => {
    const { api, isAuthenticated, loading: authLoading } = useAuth();
    const [watchlist, setWatchlist] = useState([]);
    const [watchlistLoading, setWatchlistLoading] = useState(true);
    const [watchlistError, setWatchlistError] = useState(null);
    const [pricesLoading, setPricesLoading] = useState(false);
    const hasFetchedRef = useRef(false);

    // Fetch watchlist symbols
    const fetchWatchlist = async () => {
        if (!isAuthenticated || !api || authLoading || hasFetchedRef.current) {
            return;
        }

        hasFetchedRef.current = true;
        setWatchlistLoading(true);
        setWatchlistError(null);

        try {
            const res = await api.get('/watchlist');
            console.log('Watchlist data:', res.data);
            
            // Backend returns array of symbols (strings)
            if (Array.isArray(res.data)) {
                // Convert strings to objects with symbol and price info
                const watchlistItems = res.data.map(symbol => ({
                    symbol: symbol,
                    price: null,
                    change: null,
                    changePercent: null
                }));
                setWatchlist(watchlistItems);
                
                // Fetch prices after getting symbols
                if (watchlistItems.length > 0) {
                    fetchPrices(watchlistItems.map(item => item.symbol));
                }
            } else {
                setWatchlist([]);
            }
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            setWatchlistError('Failed to load watchlist. Please try again.');
            setWatchlist([]);
            hasFetchedRef.current = false;
        } finally {
            setWatchlistLoading(false);
        }
    };

    // Fetch current prices for all symbols
    const fetchPrices = async (symbols) => {
        if (!symbols || symbols.length === 0) return;

        setPricesLoading(true);
        try {
            const symbolsString = symbols.join(',');
            const res = await api.get(`/market-data/quotes?symbols=${symbolsString}`);
            const { prices } = res.data;

            // Update watchlist with prices
            setWatchlist(prevWatchlist =>
                prevWatchlist.map(item => ({
                    ...item,
                    price: prices[item.symbol.toUpperCase()] || null
                }))
            );
        } catch (error) {
            console.error('Error fetching prices:', error);
        } finally {
            setPricesLoading(false);
        }
    };

    // Remove from watchlist
    const removeFromWatchlist = async (symbol) => {
        if (!isAuthenticated || !api) {
            console.error('Not authenticated');
            return;
        }

        try {
            await api.delete(`/watchlist/remove/${symbol}`);
            setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
            console.log(`${symbol} removed from watchlist`);
        } catch (error) {
            console.error('Error removing from watchlist:', error);
            setWatchlistError('Failed to remove item. Please try again.');
        }
    };

    // Initial fetch
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchWatchlist();
        } else if (!authLoading && !isAuthenticated) {
            setWatchlistError('Please log in to view your watchlist.');
            setWatchlistLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    // Manual refresh
    const handleRefresh = () => {
        if (watchlist.length > 0) {
            fetchPrices(watchlist.map(item => item.symbol));
        }
    };

    if (watchlistLoading) {
        return (
            <WatchlistContainer>
                <WatchlistHeader>My Watchlist</WatchlistHeader>
                <LoaderWrapper>
                    <RotatingLoader size={24} />
                    <span>Loading watchlist...</span>
                </LoaderWrapper>
            </WatchlistContainer>
        );
    }

    if (watchlistError) {
        return (
            <WatchlistContainer>
                <WatchlistHeader>My Watchlist</WatchlistHeader>
                <ErrorMessage>{watchlistError}</ErrorMessage>
            </WatchlistContainer>
        );
    }

    return (
        <WatchlistContainer>
            <WatchlistHeader>My Watchlist</WatchlistHeader>

            {watchlist.length > 0 && (
                <RefreshButton onClick={handleRefresh} disabled={pricesLoading}>
                    {pricesLoading ? <RotatingLoader size={16} /> : '🔄'}
                    {pricesLoading ? 'Updating...' : 'Refresh Prices'}
                </RefreshButton>
            )}

            {watchlist.length === 0 ? (
                <Message>Your watchlist is empty. Add some stocks or crypto!</Message>
            ) : (
                <WatchlistList>
                    {watchlist.map((item, index) => (
                        <WatchlistItem key={`${item.symbol}-${index}`}>
                            <SymbolInfo>
                                <SymbolName>{item.symbol.toUpperCase()}</SymbolName>
                                <PriceInfo>
                                    {item.price !== null ? (
                                        <>
                                            <Price>${item.price.toFixed(2)}</Price>
                                            {item.change !== null && (
                                                <PriceChange positive={item.change >= 0}>
                                                    {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    {item.changePercent ? `${item.changePercent.toFixed(2)}%` : '—'}
                                                </PriceChange>
                                            )}
                                        </>
                                    ) : (
                                        <Price>Loading price...</Price>
                                    )}
                                </PriceInfo>
                            </SymbolInfo>
                            <RemoveButton onClick={() => removeFromWatchlist(item.symbol)} disabled={!isAuthenticated}>
                                <X size={16} /> Remove
                            </RemoveButton>
                        </WatchlistItem>
                    ))}
                </WatchlistList>
            )}
        </WatchlistContainer>
    );
};

export default Watchlist;