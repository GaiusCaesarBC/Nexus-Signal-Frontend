// client/src/components/ChatChart.js - Inline Chart for AI Chat Messages

import React from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip
} from 'chart.js';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// ============ STYLED COMPONENTS ============

const ChartContainer = styled.div`
    background: ${({ theme }) => theme?.bg?.card || 'rgba(15, 23, 42, 0.9)'};
    border: 1px solid ${({ $isPositive, theme }) =>
        $isPositive
            ? (theme?.success || '#10b981') + '40'
            : (theme?.error || '#ef4444') + '40'
    };
    border-radius: 12px;
    padding: 1rem;
    margin: 0.75rem 0;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px ${({ $isPositive, theme }) =>
            $isPositive
                ? (theme?.success || '#10b981') + '20'
                : (theme?.error || '#ef4444') + '20'
        };
    }
`;

const ChartHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const SymbolInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SymbolBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: ${({ theme }) => theme?.brand?.primary || '#00adef'}20;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.95rem;
    color: ${({ theme }) => theme?.brand?.primary || '#00adef'};
`;

const TimeframeBadge = styled.span`
    font-size: 0.75rem;
    color: ${({ theme }) => theme?.text?.secondary || '#94a3b8'};
    background: rgba(100, 116, 139, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
`;

const PriceInfo = styled.div`
    text-align: right;
`;

const CurrentPrice = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme?.text?.primary || '#e0e6ed'};
`;

const PriceChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ $isPositive, theme }) =>
        $isPositive
            ? (theme?.success || '#10b981')
            : (theme?.error || '#ef4444')
    };
`;

const ChartWrapper = styled.div`
    height: 120px;
    width: 100%;
`;

// ============ COMPONENT ============

const ChatChart = ({ chart, theme }) => {
    if (!chart || !chart.data || chart.data.length === 0) {
        return null;
    }

    const { symbol, timeframe, data, currentPrice, priceChange, priceChangePercent, isPositive } = chart;

    // Format price based on value
    const formatPrice = (price) => {
        if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
        if (price >= 1) return `$${price.toFixed(2)}`;
        return `$${price.toFixed(4)}`;
    };

    // Format change
    const formatChange = (change, percent) => {
        const sign = change >= 0 ? '+' : '';
        return `${sign}${formatPrice(change).replace('$', '')} (${sign}${percent.toFixed(2)}%)`;
    };

    // Get timeframe label
    const getTimeframeLabel = (tf) => {
        const labels = {
            '1D': 'Daily',
            '1W': 'Weekly',
            '1M': 'Monthly',
            '1h': '1 Hour',
            '4h': '4 Hour'
        };
        return labels[tf] || tf;
    };

    // Prepare chart data
    const chartColor = isPositive
        ? (theme?.success || '#10b981')
        : (theme?.error || '#ef4444');

    const chartData = {
        labels: data.map((d, i) => i), // Simple index labels
        datasets: [
            {
                data: data.map(d => d.close),
                borderColor: chartColor,
                backgroundColor: `${chartColor}20`,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#e0e6ed',
                bodyColor: '#94a3b8',
                borderColor: chartColor,
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    title: () => symbol,
                    label: (context) => formatPrice(context.raw)
                }
            }
        },
        scales: {
            x: { display: false },
            y: { display: false }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <ChartContainer $isPositive={isPositive} theme={theme}>
            <ChartHeader>
                <SymbolInfo>
                    <SymbolBadge theme={theme}>
                        <BarChart2 size={16} />
                        {symbol}
                    </SymbolBadge>
                    <TimeframeBadge theme={theme}>
                        {getTimeframeLabel(timeframe)}
                    </TimeframeBadge>
                </SymbolInfo>
                <PriceInfo>
                    <CurrentPrice theme={theme}>
                        {formatPrice(currentPrice)}
                    </CurrentPrice>
                    <PriceChange $isPositive={isPositive} theme={theme}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatChange(priceChange, priceChangePercent)}
                    </PriceChange>
                </PriceInfo>
            </ChartHeader>
            <ChartWrapper>
                <Line data={chartData} options={chartOptions} />
            </ChartWrapper>
        </ChartContainer>
    );
};

export default ChatChart;
