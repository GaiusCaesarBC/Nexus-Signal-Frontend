// client/src/pages/StockComparisonPage.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
    TrendingUp, TrendingDown, Plus, X, ArrowUpRight, ArrowDownRight,
    DollarSign, Activity, BarChart3, Award, AlertCircle, CheckCircle,
    Search, Zap, Target, Shield
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 300px;
        background: radial-gradient(circle at 50% 0%, rgba(0, 173, 237, 0.15) 0%, transparent 70%);
        pointer-events: none;
    }
`;

const ContentWrapper = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const Header = styled.div`
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const PageTitle = styled.h1`
    font-size: 3rem;
    background: linear-gradient(135deg, #00adef 0%, #0086c3 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.5rem 0;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
    margin: 0;
`;

// ============================================
// STOCK SELECTOR
// ============================================
const StockSelector = styled.div`
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const SelectedStocks = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
`;

const StockChip = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2), rgba(0, 173, 237, 0.1));
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #00adef;
    font-weight: 700;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0, 173, 237, 0.3);
    }
`;

const RemoveButton = styled.button`
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.25rem;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
        transform: scale(1.1);
    }
`;

const SearchContainer = styled.div`
    position: relative;
    display: flex;
    gap: 1rem;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 0.875rem 1rem 0.875rem 3rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
`;

const AddButton = styled.button`
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #00adef, #0086c3);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// ============================================
// COMPARISON TABLE
// ============================================
const ComparisonTable = styled.div`
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    animation: ${fadeIn} 1s ease-out;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
`;

const TableHeader = styled.thead`
    border-bottom: 2px solid rgba(0, 173, 237, 0.3);
`;

const TableHeaderCell = styled.th`
    padding: 1rem;
    text-align: ${props => props.$align || 'left'};
    color: #00adef;
    font-weight: 700;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
    border-bottom: 1px solid rgba(100, 116, 139, 0.2);
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.05);
    }
`;

const TableCell = styled.td`
    padding: 1rem;
    text-align: ${props => props.$align || 'left'};
    color: ${props => {
        if (props.$highlight === 'best') return '#10b981';
        if (props.$highlight === 'worst') return '#ef4444';
        return '#e0e6ed';
    }};
    font-weight: ${props => props.$highlight ? '700' : '500'};
    font-size: 1rem;
    position: relative;

    ${props => props.$highlight && css`
        &::after {
            content: '${props.$highlight === 'best' ? '✅' : '⚠️'}';
            margin-left: 0.5rem;
        }
    `}
`;

const MetricLabel = styled.div`
    color: #94a3b8;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ChangeValue = styled.span`
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

// ============================================
// CHART SECTION
// ============================================
const ChartSection = styled.div`
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 1.2s ease-out;
`;

const ChartHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const ChartTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TimeframeButtons = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const TimeframeButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3), rgba(0, 173, 237, 0.15))' : 
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 8px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2), rgba(0, 173, 237, 0.1));
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
    }
`;

const ChartWrapper = styled.div`
    height: 400px;
    position: relative;
`;

// ============================================
// INSIGHTS SECTION
// ============================================
const InsightsSection = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 1.4s ease-out;
`;

const InsightCard = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.15), rgba(0, 173, 237, 0.05));
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }
`;

const InsightIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const InsightTitle = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const InsightValue = styled.div`
    font-size: 1.5rem;
    color: #e0e6ed;
    font-weight: 900;
    margin-bottom: 0.25rem;
`;

const InsightSubtext = styled.div`
    font-size: 0.85rem;
    color: #64748b;
`;

// ============================================
// EMPTY STATE
// ============================================
const EmptyState = styled.div`
    text-align: center;
    padding: 5rem 2rem;
    color: #64748b;
    animation: ${fadeIn} 0.6s ease-out;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: rgba(0, 173, 237, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00adef;
`;

const EmptyText = styled.div`
    font-size: 1.5rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    font-weight: 700;
`;

const EmptySubtext = styled.div`
    font-size: 1rem;
    color: #64748b;
`;

// ============================================
// MAIN COMPONENT
// ============================================
const StockComparisonPage = () => {
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [stockData, setStockData] = useState({});
    const [loading, setLoading] = useState(false);
    const [timeframe, setTimeframe] = useState('1M');

    // Mock function - replace with your actual API call
    const fetchStockData = async (symbol) => {
        try {
            setLoading(true);
            // Replace with your actual API endpoint
            const response = await fetch(`https://api.example.com/stock/${symbol}`);
            const data = await response.json();
            
            setStockData(prev => ({
                ...prev,
                [symbol]: data
            }));
        } catch (error) {
            console.error('Error fetching stock data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock data generator (replace with real data)
    const generateMockData = (symbol) => {
        const basePrice = Math.random() * 500 + 50;
        return {
            symbol,
            name: `${symbol} Inc.`,
            price: basePrice,
            change: (Math.random() - 0.5) * 10,
            changePercent: (Math.random() - 0.5) * 5,
            marketCap: (Math.random() * 1000 + 100) * 1e9,
            peRatio: Math.random() * 40 + 10,
            week52High: basePrice * 1.2,
            week52Low: basePrice * 0.8,
            dividend: Math.random() * 3,
            volume: Math.floor(Math.random() * 100) * 1e6,
            beta: Math.random() * 1.5 + 0.5,
            eps: basePrice / (Math.random() * 40 + 10),
            revenue: (Math.random() * 100 + 10) * 1e9,
            profitMargin: Math.random() * 30 + 5,
            debtToEquity: Math.random() * 2,
            historicalData: Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
                price: basePrice * (1 + (Math.random() - 0.5) * 0.3)
            }))
        };
    };

    const handleAddStock = () => {
        const symbol = searchQuery.toUpperCase().trim();
        if (symbol && !selectedStocks.includes(symbol) && selectedStocks.length < 5) {
            setSelectedStocks([...selectedStocks, symbol]);
            setStockData(prev => ({
                ...prev,
                [symbol]: generateMockData(symbol)
            }));
            setSearchQuery('');
        }
    };

    const handleRemoveStock = (symbol) => {
        setSelectedStocks(selectedStocks.filter(s => s !== symbol));
        const newData = { ...stockData };
        delete newData[symbol];
        setStockData(newData);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddStock();
        }
    };

    // Get best/worst values for highlighting
    const getBestWorst = (metric) => {
        if (selectedStocks.length < 2) return {};
        
        const values = selectedStocks.map(symbol => ({
            symbol,
            value: stockData[symbol]?.[metric] || 0
        }));

        const sorted = [...values].sort((a, b) => b.value - a.value);
        
        // For some metrics, lower is better
        const lowerIsBetter = ['peRatio', 'debtToEquity', 'beta'];
        
        if (lowerIsBetter.includes(metric)) {
            return {
                best: sorted[sorted.length - 1].symbol,
                worst: sorted[0].symbol
            };
        }
        
        return {
            best: sorted[0].symbol,
            worst: sorted[sorted.length - 1].symbol
        };
    };

    // Format large numbers
    const formatNumber = (num, decimals = 2) => {
        if (num >= 1e12) return `$${(num / 1e12).toFixed(decimals)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
        return `$${num.toFixed(decimals)}`;
    };

    // Get chart data
    const getChartData = () => {
        if (selectedStocks.length === 0) return null;

        const colors = ['#00adef', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

        return {
            labels: stockData[selectedStocks[0]]?.historicalData.map(d => 
                d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            ) || [],
            datasets: selectedStocks.map((symbol, index) => ({
                label: symbol,
                data: stockData[symbol]?.historicalData.map(d => d.price) || [],
                borderColor: colors[index],
                backgroundColor: `${colors[index]}33`,
                borderWidth: 3,
                tension: 0.4,
                fill: false,
                pointRadius: 0,
                pointHoverRadius: 6
            }))
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    padding: 15
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#00adef',
                bodyColor: '#e0e6ed',
                borderColor: 'rgba(0, 173, 237, 0.5)',
                borderWidth: 1,
                padding: 12,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(100, 116, 139, 0.1)'
                },
                ticks: {
                    color: '#64748b'
                }
            },
            y: {
                grid: {
                    color: 'rgba(100, 116, 139, 0.1)'
                },
                ticks: {
                    color: '#64748b',
                    callback: (value) => `$${value.toFixed(2)}`
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        }
    };

    // Get insights
    const getInsights = () => {
        if (selectedStocks.length === 0) return null;

        const performances = selectedStocks.map(symbol => {
            const data = stockData[symbol];
            if (!data) return { symbol, perf: 0 };
            const firstPrice = data.historicalData[0].price;
            const lastPrice = data.historicalData[data.historicalData.length - 1].price;
            return {
                symbol,
                perf: ((lastPrice - firstPrice) / firstPrice) * 100
            };
        });

        const bestPerformer = performances.reduce((best, curr) => 
            curr.perf > best.perf ? curr : best
        );

        const bestValue = Object.keys(getBestWorst('peRatio')).length > 0 
            ? getBestWorst('peRatio').best 
            : selectedStocks[0];

        const highestDividend = selectedStocks.reduce((best, symbol) => {
            const div = stockData[symbol]?.dividend || 0;
            const bestDiv = stockData[best]?.dividend || 0;
            return div > bestDiv ? symbol : best;
        }, selectedStocks[0]);

        return {
            bestPerformer,
            bestValue,
            highestDividend
        };
    };

    const insights = getInsights();

    return (
        <PageContainer>
            <ContentWrapper>
               <Header>
    <PageTitle>
        <BarChart3 size={40} />
        Stock Comparison
    </PageTitle>
    <Subtitle>Compare multiple stocks side-by-side to make informed investment decisions</Subtitle>
</Header> 

                <StockSelector>
                    <SelectedStocks>
                        {selectedStocks.map(symbol => (
                            <StockChip key={symbol}>
                                {symbol}
                                <RemoveButton onClick={() => handleRemoveStock(symbol)}>
                                    <X size={16} />
                                </RemoveButton>
                            </StockChip>
                        ))}
                        {selectedStocks.length === 0 && (
                            <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
                                No stocks selected. Add stocks to compare.
                            </div>
                        )}
                    </SelectedStocks>

                    <SearchContainer>
                        <SearchIcon size={18} />
                        <SearchInput
                            type="text"
                            placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <AddButton 
                            onClick={handleAddStock}
                            disabled={!searchQuery || selectedStocks.length >= 5}
                        >
                            <Plus size={18} />
                            Add Stock
                        </AddButton>
                    </SearchContainer>
                    
                    {selectedStocks.length >= 5 && (
                        <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Maximum 5 stocks can be compared at once
                        </div>
                    )}
                </StockSelector>

                {selectedStocks.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <BarChart3 size={60} />
                        </EmptyIcon>
                        <EmptyText>Start Comparing Stocks</EmptyText>
                        <EmptySubtext>
                            Add 2 or more stocks above to see detailed comparisons, charts, and insights
                        </EmptySubtext>
                    </EmptyState>
                ) : (
                    <>
                        {/* Insights */}
                        {insights && selectedStocks.length >= 2 && (
                            <InsightsSection>
                                <InsightCard>
                                    <InsightIcon $color="rgba(16, 185, 129, 0.2)">
                                        <TrendingUp size={24} color="#10b981" />
                                    </InsightIcon>
                                    <InsightTitle>Best Performer (30D)</InsightTitle>
                                    <InsightValue>{insights.bestPerformer.symbol}</InsightValue>
                                    <InsightSubtext>
                                        {insights.bestPerformer.perf > 0 ? '+' : ''}
                                        {insights.bestPerformer.perf.toFixed(2)}% return
                                    </InsightSubtext>
                                </InsightCard>

                                <InsightCard>
                                    <InsightIcon $color="rgba(59, 130, 246, 0.2)">
                                        <DollarSign size={24} color="#3b82f6" />
                                    </InsightIcon>
                                    <InsightTitle>Best Value</InsightTitle>
                                    <InsightValue>{insights.bestValue}</InsightValue>
                                    <InsightSubtext>
                                        Lowest P/E ratio
                                    </InsightSubtext>
                                </InsightCard>

                                <InsightCard>
                                    <InsightIcon $color="rgba(245, 158, 11, 0.2)">
                                        <Award size={24} color="#f59e0b" />
                                    </InsightIcon>
                                    <InsightTitle>Highest Dividend</InsightTitle>
                                    <InsightValue>{insights.highestDividend}</InsightValue>
                                    <InsightSubtext>
                                        {stockData[insights.highestDividend]?.dividend.toFixed(2)}% yield
                                    </InsightSubtext>
                                </InsightCard>
                            </InsightsSection>
                        )}

                        {/* Performance Chart */}
                        <ChartSection>
                            <ChartHeader>
                                <ChartTitle>
                                    <Activity size={24} />
                                    Performance Comparison
                                </ChartTitle>
                                <TimeframeButtons>
                                    {['1W', '1M', '3M', '1Y', 'ALL'].map(tf => (
                                        <TimeframeButton
                                            key={tf}
                                            $active={timeframe === tf}
                                            onClick={() => setTimeframe(tf)}
                                        >
                                            {tf}
                                        </TimeframeButton>
                                    ))}
                                </TimeframeButtons>
                            </ChartHeader>
                            <ChartWrapper>
                                {getChartData() && (
                                    <Line data={getChartData()} options={chartOptions} />
                                )}
                            </ChartWrapper>
                        </ChartSection>

                        {/* Comparison Table */}
                        <ComparisonTable>
                            <Table>
                                <TableHeader>
                                    <tr>
                                        <TableHeaderCell>Metric</TableHeaderCell>
                                        {selectedStocks.map(symbol => (
                                            <TableHeaderCell key={symbol} $align="center">
                                                {symbol}
                                            </TableHeaderCell>
                                        ))}
                                    </tr>
                                </TableHeader>
                                <TableBody>
                                    {/* Price */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <DollarSign size={16} />
                                                Current Price
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => (
                                            <TableCell key={symbol} $align="center">
                                                ${stockData[symbol]?.price.toFixed(2)}
                                            </TableCell>
                                        ))}
                                    </TableRow>

                                    {/* Change */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <Activity size={16} />
                                                Change (%)
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => {
                                            const change = stockData[symbol]?.changePercent;
                                            return (
                                                <TableCell key={symbol} $align="center">
                                                    <ChangeValue $positive={change > 0}>
                                                        {change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                        {change > 0 ? '+' : ''}{change?.toFixed(2)}%
                                                    </ChangeValue>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>

                                    {/* Market Cap */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <BarChart3 size={16} />
                                                Market Cap
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => {
                                            const bestWorst = getBestWorst('marketCap');
                                            return (
                                                <TableCell 
                                                    key={symbol} 
                                                    $align="center"
                                                    $highlight={
                                                        symbol === bestWorst.best ? 'best' : 
                                                        symbol === bestWorst.worst ? 'worst' : null
                                                    }
                                                >
                                                    {formatNumber(stockData[symbol]?.marketCap)}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>

                                    {/* P/E Ratio */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <Target size={16} />
                                                P/E Ratio
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => {
                                            const bestWorst = getBestWorst('peRatio');
                                            return (
                                                <TableCell 
                                                    key={symbol} 
                                                    $align="center"
                                                    $highlight={
                                                        symbol === bestWorst.best ? 'best' : 
                                                        symbol === bestWorst.worst ? 'worst' : null
                                                    }
                                                >
                                                    {stockData[symbol]?.peRatio.toFixed(2)}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>

                                    {/* 52-Week High */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>52-Week High</MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => (
                                            <TableCell key={symbol} $align="center">
                                                ${stockData[symbol]?.week52High.toFixed(2)}
                                            </TableCell>
                                        ))}
                                    </TableRow>

                                    {/* 52-Week Low */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>52-Week Low</MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => (
                                            <TableCell key={symbol} $align="center">
                                                ${stockData[symbol]?.week52Low.toFixed(2)}
                                            </TableCell>
                                        ))}
                                    </TableRow>

                                    {/* Dividend */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <Award size={16} />
                                                Dividend Yield
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => {
                                            const bestWorst = getBestWorst('dividend');
                                            return (
                                                <TableCell 
                                                    key={symbol} 
                                                    $align="center"
                                                    $highlight={
                                                        symbol === bestWorst.best ? 'best' : 
                                                        symbol === bestWorst.worst ? 'worst' : null
                                                    }
                                                >
                                                    {stockData[symbol]?.dividend.toFixed(2)}%
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>

                                    {/* Volume */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>Volume</MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => (
                                            <TableCell key={symbol} $align="center">
                                                {(stockData[symbol]?.volume / 1e6).toFixed(2)}M
                                            </TableCell>
                                        ))}
                                    </TableRow>

                                    {/* Beta */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <Shield size={16} />
                                                Beta (Risk)
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => {
                                            const bestWorst = getBestWorst('beta');
                                            return (
                                                <TableCell 
                                                    key={symbol} 
                                                    $align="center"
                                                    $highlight={
                                                        symbol === bestWorst.best ? 'best' : 
                                                        symbol === bestWorst.worst ? 'worst' : null
                                                    }
                                                >
                                                    {stockData[symbol]?.beta.toFixed(2)}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>

                                    {/* Profit Margin */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <TrendingUp size={16} />
                                                Profit Margin
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => {
                                            const bestWorst = getBestWorst('profitMargin');
                                            return (
                                                <TableCell 
                                                    key={symbol} 
                                                    $align="center"
                                                    $highlight={
                                                        symbol === bestWorst.best ? 'best' : 
                                                        symbol === bestWorst.worst ? 'worst' : null
                                                    }
                                                >
                                                    {stockData[symbol]?.profitMargin.toFixed(2)}%
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>

                                    {/* Debt to Equity */}
                                    <TableRow>
                                        <TableCell>
                                            <MetricLabel>
                                                <AlertCircle size={16} />
                                                Debt/Equity
                                            </MetricLabel>
                                        </TableCell>
                                        {selectedStocks.map(symbol => {
                                            const bestWorst = getBestWorst('debtToEquity');
                                            return (
                                                <TableCell 
                                                    key={symbol} 
                                                    $align="center"
                                                    $highlight={
                                                        symbol === bestWorst.best ? 'best' : 
                                                        symbol === bestWorst.worst ? 'worst' : null
                                                    }
                                                >
                                                    {stockData[symbol]?.debtToEquity.toFixed(2)}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </ComparisonTable>
                    </>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default StockComparisonPage;