// src/hooks/useLivePrice.js - Real-time price streaming via SSE
// All prices stream through backend (Alpaca for stocks, Binance for crypto)

import { useState, useEffect, useRef, useCallback } from 'react';

// Get API base URL from environment or default
const getApiBaseUrl = () => {
    // Remove /api suffix if present since SSE endpoint includes it
    const baseUrl = process.env.REACT_APP_API_URL ||
                    process.env.REACT_APP_API_BASE_URL ||
                    'https://api.nexussignal.ai/api';
    return baseUrl.replace(/\/api$/, '');
};

// Known crypto symbols (expanded list - without -USD suffix)
const KNOWN_CRYPTOS = [
    'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'DOGE', 'SHIB', 'XRP',
    'BNB', 'LINK', 'UNI', 'AAVE', 'LTC', 'ATOM', 'NEAR', 'APT', 'ARB', 'OP',
    'PEPE', 'FLOKI', 'BONK', 'WIF', 'RENDER', 'FET', 'INJ', 'SUI', 'SEI', 'TIA',
    'ALGO', 'VET', 'FIL', 'THETA', 'EOS', 'XLM', 'TRX', 'XMR', 'HBAR', 'ICP',
    'BITCOIN', 'ETHEREUM', 'SOLANA', 'CARDANO', 'POLKADOT', 'POLYGON', 'DOGECOIN'
];

const isCryptoSymbol = (symbol) => {
    if (!symbol) return false;
    const upper = symbol.toUpperCase();
    // Check for -USD, -USDT, /USD suffixes or known cryptos
    if (upper.includes('-USD') || upper.includes('USDT') || upper.includes('/USD')) return true;
    // Check if base symbol is a known crypto
    const base = upper.replace(/-USD.*$/, '').replace(/USDT$/, '').replace(/\/USD.*$/, '');
    return KNOWN_CRYPTOS.includes(base);
};

// Normalize symbol for SSE endpoint
const normalizeSymbol = (symbol) => {
    if (!symbol) return '';
    const upper = symbol.toUpperCase();
    // Remove suffixes to get base symbol
    return upper
        .replace(/-USD.*$/, '')
        .replace(/\/USD.*$/, '')
        .replace(/USDT$/, '');
};

export const useLivePrice = (symbol, onPriceUpdate) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastPrice, setLastPrice] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const connectionRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const isCrypto = isCryptoSymbol(symbol);

    // Connect to SSE endpoint (works for both stocks and crypto)
    const connect = useCallback(() => {
        if (!symbol) return;

        const apiBase = getApiBaseUrl();
        const normalizedSymbol = normalizeSymbol(symbol);
        const sseUrl = `${apiBase}/api/live-price/${normalizedSymbol}`;

        console.log(`[LivePrice] Connecting to SSE for ${symbol} (${normalizedSymbol})...`);

        try {
            const eventSource = new EventSource(sseUrl);
            connectionRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle connection message - this confirms SSE is working
                    if (data.type === 'connected') {
                        console.log(`[LivePrice] ✅ SSE connected for ${data.symbol}`);
                        setIsConnected(true);
                        reconnectAttempts.current = 0;
                        return;
                    }

                    // Handle price updates
                    if (data.price) {
                        console.log(`[LivePrice] 💰 Price update: ${data.symbol} = $${data.price}`);
                        setIsConnected(true);
                        setLastPrice(data.price);
                        setLastUpdate(new Date(data.timestamp));
                        reconnectAttempts.current = 0;

                        if (onPriceUpdate) {
                            onPriceUpdate({
                                symbol: data.symbol,
                                price: data.price,
                                timestamp: data.timestamp,
                                assetType: data.assetType
                            });
                        }
                    }
                } catch (err) {
                    console.error('[LivePrice] SSE parse error:', err);
                }
            };

            eventSource.onerror = (error) => {
                // Get more details about the error
                const readyState = eventSource.readyState;
                const stateNames = ['CONNECTING', 'OPEN', 'CLOSED'];
                console.warn(`[LivePrice] SSE error - readyState: ${stateNames[readyState] || readyState}`);

                // Only treat as error if we were connected
                if (readyState === EventSource.CLOSED) {
                    console.log('[LivePrice] SSE connection closed');
                }

                setIsConnected(false);
                eventSource.close();

                // Exponential backoff for reconnection
                reconnectAttempts.current++;
                const delay = Math.min(3000 * Math.pow(2, reconnectAttempts.current - 1), 30000);

                if (reconnectAttempts.current <= 5) {
                    console.log(`[LivePrice] Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts.current})...`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (symbol) {
                            connect();
                        }
                    }, delay);
                } else {
                    console.log('[LivePrice] Max reconnection attempts reached');
                }
            };

        } catch (error) {
            console.error('[LivePrice] SSE connection error:', error);
        }
    }, [symbol, onPriceUpdate]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        setIsConnected(false);
        reconnectAttempts.current = 0;
    }, []);

    useEffect(() => {
        if (!symbol) return;

        // Disconnect previous connection
        disconnect();

        // Connect via SSE (for both stocks and crypto)
        connect();

        return () => {
            disconnect();
        };
    }, [symbol, connect, disconnect]);

    return {
        isConnected,
        lastPrice,
        lastUpdate,
        isCrypto,
        disconnect
    };
};

// Hook for updating chart candles in real-time
export const useLiveChart = (symbol, chartData, setChartData) => {
    const handlePriceUpdate = useCallback((priceData) => {
        if (!chartData || chartData.length === 0) return;

        setChartData(prevData => {
            if (!prevData || prevData.length === 0) return prevData;

            const newData = [...prevData];
            const lastCandle = newData[newData.length - 1];

            if (!lastCandle) return prevData;

            // Update the last candle with new price
            const updatedCandle = {
                ...lastCandle,
                close: priceData.price,
                high: Math.max(lastCandle.high, priceData.price),
                low: Math.min(lastCandle.low, priceData.price)
            };

            newData[newData.length - 1] = updatedCandle;
            return newData;
        });
    }, [chartData, setChartData]);

    const { isConnected, lastPrice, lastUpdate, isCrypto } = useLivePrice(
        symbol,
        handlePriceUpdate
    );

    return {
        isConnected,
        lastPrice,
        lastUpdate,
        isCrypto,
        isLive: isConnected
    };
};

export default useLivePrice;
