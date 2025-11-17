import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import RealTimeChart from './RealTimeChart';
import axios from 'axios';

const StockDataContainer = styled.div`
    background-color: #1a273b;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    padding: 1.5rem;
    margin: 2rem auto;
    max-width: 1200px;
    color: #e0e6ed;
`;

const Header = styled.h2`
    color: #00adef;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 2rem;
    text-shadow: 0 0 8px rgba(0, 173, 237, 0.4);
`;

const RangeButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const RangeButton = styled.button`
    background-color: ${({ active }) => (active ? '#00adef' : '#344a66')};
    color: white;
    border: none;
    border-radius: 5px;
    padding: 0.6rem 1.2rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease;

    &:hover {
        background-color: ${({ active }) => (active ? '#008bb3' : '#4a627a')};
        transform: translateY(-1px);
    }
    &:active {
        transform: translateY(0);
    }
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    font-size: 1.2rem;
    color: #b0c4de;
`;

const ErrorContainer = styled.div`
    background-color: #331f24;
    border: 1px solid #ef4444;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1.5rem;
    text-align: center;
    color: #ef4444;
    font-weight: bold;
`;

const StockDataDisplay = ({ symbol }) => {
    const [chartData, setChartData] = useState([]);
    const [selectedRange, setSelectedRange] = useState('1M');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchController = useRef(null);

    useEffect(() => {
        if (!symbol) {
            setError('No symbol provided.');
            return;
        }

        const fetchStockData = async () => {
            if (fetchController.current) {
                fetchController.current.abort();
            }
            fetchController.current = new AbortController();
            const { signal } = fetchController.current;

            setLoading(true);
            setError(null);
            setChartData([]);

            try {
                // Determine interval based on range
                let intervalParam = '1d'; // Default
                if (selectedRange === '1D') intervalParam = '5m';
                else if (selectedRange === '5D') intervalParam = '1h';

                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                
                const response = await axios.get(
                    `${API_URL}/api/stocks/historical/${symbol}`,
                    {
                        params: {
                            range: selectedRange,
                            interval: intervalParam,
                        },
                        signal: signal,
                    }
                );

                const fetchedData = response.data.historicalData || response.data;
                setChartData(fetchedData);
                
                if (fetchedData.length === 0) {
                    setError(`No data found for ${symbol} (${selectedRange})`);
                }
            } catch (err) {
                if (axios.isCancel(err)) {
                    console.log('Fetch aborted');
                    return;
                }
                console.error('Error fetching stock data:', err);
                
                if (err.response?.data?.msg) {
                    setError(err.response.data.msg);
                } else if (err.message) {
                    setError(`Error: ${err.message}`);
                } else {
                    setError('Failed to fetch stock data');
                }
            } finally {
                setLoading(false);
                fetchController.current = null;
            }
        };

        fetchStockData();

        return () => {
            if (fetchController.current) {
                fetchController.current.abort();
            }
        };
    }, [symbol, selectedRange]);

    return (
        <StockDataContainer>
            <Header>{symbol.toUpperCase()} Stock Chart</Header>
            <RangeButtonContainer>
                {['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'].map((range) => (
                    <RangeButton
                        key={range}
                        active={selectedRange === range}
                        onClick={() => setSelectedRange(range)}
                        disabled={loading}
                    >
                        {range}
                    </RangeButton>
                ))}
            </RangeButtonContainer>

            {loading && (
                <LoadingContainer>
                    Loading {symbol.toUpperCase()} data for {selectedRange}...
                </LoadingContainer>
            )}

            {error && !loading && <ErrorContainer>{error}</ErrorContainer>}

            {!loading && !error && chartData.length > 0 && (
                <RealTimeChart data={chartData} />
            )}

            {!loading && !error && chartData.length === 0 && (
                <LoadingContainer>
                    No chart data available for {symbol.toUpperCase()}.
                </LoadingContainer>
            )}
        </StockDataContainer>
    );
};

export default StockDataDisplay;