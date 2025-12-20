// src/hooks/useLivePrice.js - Real-time price streaming
// Binance WebSocket for crypto (free, direct), SSE for stocks (via backend/Alpaca)

import { useState, useEffect, useRef, useCallback } from 'react';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

// Get API base URL from environment or default
const getApiBaseUrl = () => {
    // Remove /api suffix if present since SSE endpoint includes it
    const baseUrl = process.env.REACT_APP_API_URL ||
                    process.env.REACT_APP_API_BASE_URL ||
                    'https://api.nexussignal.ai/api';
    return baseUrl.replace(/\/api$/, '');
};

// Known crypto symbols (without -USD suffix)
const KNOWN_CRYPTOS = [
    'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX', 'DOGE', 'SHIB', 'XRP',
    'BNB', 'LINK', 'UNI', 'AAVE', 'LTC', 'ATOM', 'NEAR', 'APT', 'ARB', 'OP',
    'PEPE', 'FLOKI', 'BONK', 'WIF', 'RENDER', 'FET', 'INJ', 'SUI', 'SEI', 'TIA'
];

const isCryptoSymbol = (symbol) => {
    if (!symbol) return false;
    const upper = symbol.toUpperCase();
    // Check for -USD, -USDT suffixes or known cryptos
    if (upper.includes('-USD') || upper.includes('USDT')) return true;
    // Check if base symbol is a known crypto
    const base = upper.replace(/-USD.*$/, '').replace(/USDT$/, '');
    return KNOWN_CRYPTOS.includes(base);
};

const getBinanceSymbol = (symbol) => {
    // Convert BTC-USD or BTC to btcusdt format for Binance
    const upper = symbol.toUpperCase();
    const base = upper.replace(/-USD.*$/, '').replace(/USDT$/, '');
    return `${base.toLowerCase()}usdt`;
};

export const useLivePrice = (symbol, onPriceUpdate) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastPrice, setLastPrice] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const connectionRef = useRef(null); // WebSocket or EventSource
    const reconnectTimeoutRef = useRef(null);
    const isCrypto = isCryptoSymbol(symbol);

    // Connect to Binance WebSocket for crypto
    const connectCrypto = useCallback(() => {
        if (!symbol) return;

        const binanceSymbol = getBinanceSymbol(symbol);
        const wsUrl = `${BINANCE_WS_URL}/${binanceSymbol}@trade`;

        console.log(`[LivePrice] Connecting to Binance for ${symbol} (${binanceSymbol})...`);

        try {
            const ws = new WebSocket(wsUrl);
            connectionRef.current = ws;

            ws.onopen = () => {
                console.log(`[LivePrice] Connected to Binance for ${symbol}`);
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.e === 'trade') {
                        const price = parseFloat(data.p);
                        const timestamp = data.T;

                        setLastPrice(price);
                        setLastUpdate(new Date(timestamp));

                        if (onPriceUpdate) {
                            onPriceUpdate({
                                symbol,
                                price,
                                timestamp,
                                volume: parseFloat(data.q)
                            });
                        }
                    }
                } catch (err) {
                    console.error('[LivePrice] Parse error:', err);
                }
            };

            ws.onclose = () => {
                console.log(`[LivePrice] Disconnected from Binance for ${symbol}`);
                setIsConnected(false);

                // Reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (symbol && isCrypto) {
                        connectCrypto();
                    }
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error('[LivePrice] Binance WebSocket error:', error);
                setIsConnected(false);
            };

        } catch (error) {
            console.error('[LivePrice] Binance connection error:', error);
        }
    }, [symbol, isCrypto, onPriceUpdate]);

    // Connect to SSE endpoint for stocks
    const connectStock = useCallback(() => {
        if (!symbol) return;

        const apiBase = getApiBaseUrl();
        const sseUrl = `${apiBase}/api/live-price/${symbol.toUpperCase()}`;

        console.log(`[LivePrice] Connecting to SSE for ${symbol}...`);

        try {
            const eventSource = new EventSource(sseUrl);
            connectionRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle connection message - this confirms SSE is working
                    if (data.type === 'connected') {
                        console.log(`[LivePrice] SSE connected for ${data.symbol}`);
                        setIsConnected(true);
                        return;
                    }

                    // Handle price updates
                    if (data.price) {
                        setIsConnected(true); // Ensure connected state
                        setLastPrice(data.price);
                        setLastUpdate(new Date(data.timestamp));

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
                console.error('[LivePrice] SSE error:', error);
                setIsConnected(false);
                eventSource.close();

                // Reconnect after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (symbol && !isCrypto) {
                        connectStock();
                    }
                }, 5000);
            };

        } catch (error) {
            console.error('[LivePrice] SSE connection error:', error);
        }
    }, [symbol, isCrypto, onPriceUpdate]);

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
    }, []);

    useEffect(() => {
        if (!symbol) return;

        // Disconnect previous connection
        disconnect();

        // Connect based on asset type
        if (isCrypto) {
            connectCrypto();
        } else {
            connectStock();
        }

        return () => {
            disconnect();
        };
    }, [symbol, isCrypto, connectCrypto, connectStock, disconnect]);

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
