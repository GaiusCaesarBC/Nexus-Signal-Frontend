// client/src/pages/CompanyFinancialsPage.js - Company Financials (Income Statement, Balance Sheet, Cash Flow)

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
    Search, TrendingUp, TrendingDown, DollarSign, Building2,
    FileText, PieChart, ArrowRightLeft, Loader, RefreshCw,
    ChevronRight, Calendar, BarChart3, Wallet, CreditCard,
    ArrowUpRight, ArrowDownRight, Info, ExternalLink
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';
import api from '../api/axios';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: transparent;
    color: #e0e6ed;
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 1.75rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1rem;
`;

const SearchContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchInputWrapper = styled.div`
    flex: 1;
    position: relative;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
        border-color: #00adef;
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
`;

const SearchButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const CompanyHeader = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
`;

const CompanyInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const CompanyLogo = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
`;

const CompanyDetails = styled.div`
    h2 {
        font-size: 1.5rem;
        color: #e0e6ed;
        margin-bottom: 0.25rem;
    }

    p {
        color: #64748b;
        font-size: 0.9rem;
    }
`;

const KeyMetrics = styled.div`
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
`;

const MetricItem = styled.div`
    text-align: right;

    .label {
        color: #64748b;
        font-size: 0.8rem;
        margin-bottom: 0.25rem;
    }

    .value {
        font-size: 1.25rem;
        font-weight: 700;
        color: ${props => props.$positive ? '#00ff88' : props.$negative ? '#ff4757' : '#e0e6ed'};
    }
`;

const TabContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    padding: 0.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    overflow-x: auto;
    border: 1px solid rgba(0, 173, 237, 0.2);
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    background: ${props => props.$active ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'transparent'};
    color: ${props => props.$active ? 'white' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.$active ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'rgba(0, 173, 237, 0.2)'};
        color: ${props => props.$active ? 'white' : '#00adef'};
    }
`;

const ViewToggle = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
`;

const ToggleButton = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 173, 237, 0.3);
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.3)' : 'rgba(30, 41, 59, 0.8)'};
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #00adef;
    }
`;

const TableContainer = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    overflow: hidden;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const TableHeader = styled.th`
    padding: 1rem;
    text-align: ${props => props.$align || 'left'};
    background: rgba(0, 173, 237, 0.1);
    color: #00adef;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
    white-space: nowrap;
`;

const TableRow = styled.tr`
    &:hover {
        background: rgba(0, 173, 237, 0.05);
    }

    &:not(:last-child) td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
`;

const TableCell = styled.td`
    padding: 0.875rem 1rem;
    color: ${props => props.$highlight ? '#00adef' : props.$positive ? '#00ff88' : props.$negative ? '#ff4757' : '#e0e6ed'};
    font-weight: ${props => props.$bold ? '600' : '400'};
    text-align: ${props => props.$align || 'left'};
    background: ${props => props.$header ? 'rgba(0, 173, 237, 0.05)' : 'transparent'};
    font-size: 0.9rem;
`;

const ChartContainer = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
    font-size: 1.1rem;
    color: #e0e6ed;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #94a3b8;

    svg {
        animation: ${spin} 1s linear infinite;
        margin-bottom: 1rem;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: #64748b;

    svg {
        width: 64px;
        height: 64px;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    h3 {
        color: #e0e6ed;
        margin-bottom: 0.5rem;
    }
`;

const OverviewGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1.25rem;

    .label {
        color: #64748b;
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #e0e6ed;
    }

    .change {
        font-size: 0.85rem;
        color: ${props => props.$positive ? '#00ff88' : props.$negative ? '#ff4757' : '#94a3b8'};
        margin-top: 0.25rem;
    }
`;

// ============ HELPER FUNCTIONS ============
const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(decimals) + 'T';
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
    return num.toFixed(decimals);
};

const formatCurrency = (num) => {
    if (num === null || num === undefined) return '-';
    return '$' + formatNumber(num);
};

const formatPercent = (num) => {
    if (num === null || num === undefined) return '-';
    return parseFloat(num).toFixed(2) + '%';
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

// ============ COMPONENT ============
const CompanyFinancialsPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [symbol, setSymbol] = useState(searchParams.get('symbol') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('symbol') || '');
    const [activeTab, setActiveTab] = useState('overview');
    const [viewType, setViewType] = useState('annual'); // annual or quarterly
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        overview: null,
        income: null,
        balance: null,
        cashflow: null
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const urlSymbol = searchParams.get('symbol');
        if (urlSymbol) {
            setSymbol(urlSymbol.toUpperCase());
            setSearchInput(urlSymbol.toUpperCase());
            fetchFinancials(urlSymbol.toUpperCase());
        }
    }, [user, searchParams]);

    const fetchFinancials = async (sym) => {
        if (!sym) return;

        setLoading(true);
        try {
            const [overviewRes, incomeRes, balanceRes, cashflowRes] = await Promise.all([
                api.get(`/api/financials/overview/${sym}`),
                api.get(`/api/financials/income/${sym}`),
                api.get(`/api/financials/balance/${sym}`),
                api.get(`/api/financials/cashflow/${sym}`)
            ]);

            setData({
                overview: overviewRes.data,
                income: incomeRes.data,
                balance: balanceRes.data,
                cashflow: cashflowRes.data
            });
        } catch (error) {
            console.error('Error fetching financials:', error);
            showToast(error.response?.data?.message || 'Failed to fetch financial data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        const upperSymbol = searchInput.trim().toUpperCase();
        setSymbol(upperSymbol);
        setSearchParams({ symbol: upperSymbol });
        fetchFinancials(upperSymbol);
    };

    const getReports = (type) => {
        const dataSource = type === 'income' ? data.income :
            type === 'balance' ? data.balance :
            type === 'cashflow' ? data.cashflow : null;

        if (!dataSource) return [];
        return viewType === 'annual' ? dataSource.annualReports : dataSource.quarterlyReports;
    };

    const renderOverview = () => {
        const overview = data.overview;
        if (!overview) return null;

        return (
            <>
                <OverviewGrid>
                    <OverviewCard>
                        <div className="label"><DollarSign size={14} /> Market Cap</div>
                        <div className="value">{formatCurrency(overview.marketCap)}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><BarChart3 size={14} /> Revenue (TTM)</div>
                        <div className="value">{formatCurrency(overview.revenue)}</div>
                        <div className="change">{overview.revenueGrowth > 0 ? '+' : ''}{formatPercent(overview.revenueGrowth * 100)} YoY</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><TrendingUp size={14} /> Net Income</div>
                        <div className="value">{formatCurrency(overview.netIncome)}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><PieChart size={14} /> EPS</div>
                        <div className="value">${overview.eps?.toFixed(2) || '-'}</div>
                        <div className="change">{overview.epsGrowth > 0 ? '+' : ''}{formatPercent(overview.epsGrowth * 100)} YoY</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><BarChart3 size={14} /> P/E Ratio</div>
                        <div className="value">{overview.peRatio?.toFixed(2) || '-'}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><BarChart3 size={14} /> PEG Ratio</div>
                        <div className="value">{overview.pegRatio?.toFixed(2) || '-'}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><Wallet size={14} /> EBITDA</div>
                        <div className="value">{formatCurrency(overview.ebitda)}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><TrendingUp size={14} /> Profit Margin</div>
                        <div className="value">{formatPercent(overview.profitMargin * 100)}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><ArrowRightLeft size={14} /> ROE</div>
                        <div className="value">{formatPercent(overview.returnOnEquity * 100)}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><ArrowRightLeft size={14} /> ROA</div>
                        <div className="value">{formatPercent(overview.returnOnAssets * 100)}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><DollarSign size={14} /> Dividend Yield</div>
                        <div className="value">{formatPercent(overview.dividendYield * 100)}</div>
                    </OverviewCard>
                    <OverviewCard>
                        <div className="label"><BarChart3 size={14} /> Book Value</div>
                        <div className="value">${overview.bookValue?.toFixed(2) || '-'}</div>
                    </OverviewCard>
                </OverviewGrid>

                {data.income && (
                    <ChartContainer>
                        <ChartTitle><BarChart3 size={18} /> Revenue & Net Income Trend</ChartTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={[...getReports('income')].reverse()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="fiscalDateEnding"
                                    tickFormatter={formatDate}
                                    stroke="#64748b"
                                />
                                <YAxis
                                    tickFormatter={(v) => formatCurrency(v)}
                                    stroke="#64748b"
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={formatDate}
                                    contentStyle={{
                                        background: 'rgba(30, 41, 59, 0.95)',
                                        border: '1px solid rgba(0, 173, 237, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="totalRevenue" name="Revenue" fill="#00adef" />
                                <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#00ff88" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}
            </>
        );
    };

    const renderIncomeStatement = () => {
        const reports = getReports('income');
        if (!reports.length) return <EmptyState><FileText /><h3>No Data</h3><p>Income statement data not available</p></EmptyState>;

        const rows = [
            { key: 'totalRevenue', label: 'Total Revenue', bold: true },
            { key: 'costOfRevenue', label: 'Cost of Revenue' },
            { key: 'grossProfit', label: 'Gross Profit', bold: true, highlight: true },
            { key: 'grossMargin', label: 'Gross Margin %', isPercent: true },
            { divider: true },
            { key: 'researchAndDevelopment', label: 'R&D Expenses' },
            { key: 'sellingGeneralAdministrative', label: 'SG&A Expenses' },
            { key: 'operatingExpenses', label: 'Total Operating Expenses' },
            { key: 'operatingIncome', label: 'Operating Income', bold: true, highlight: true },
            { key: 'operatingMargin', label: 'Operating Margin %', isPercent: true },
            { divider: true },
            { key: 'interestExpense', label: 'Interest Expense' },
            { key: 'incomeBeforeTax', label: 'Income Before Tax' },
            { key: 'incomeTaxExpense', label: 'Income Tax Expense' },
            { key: 'netIncome', label: 'Net Income', bold: true, highlight: true },
            { key: 'netMargin', label: 'Net Margin %', isPercent: true },
            { divider: true },
            { key: 'ebitda', label: 'EBITDA', bold: true },
            { key: 'eps', label: 'EPS' }
        ];

        return (
            <>
                <ChartContainer>
                    <ChartTitle><BarChart3 size={18} /> Profitability Margins</ChartTitle>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={[...reports].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="fiscalDateEnding" tickFormatter={formatDate} stroke="#64748b" />
                            <YAxis tickFormatter={(v) => v + '%'} stroke="#64748b" />
                            <Tooltip
                                formatter={(value) => value + '%'}
                                labelFormatter={formatDate}
                                contentStyle={{
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    border: '1px solid rgba(0, 173, 237, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="grossMargin" name="Gross Margin" stroke="#00ff88" strokeWidth={2} />
                            <Line type="monotone" dataKey="operatingMargin" name="Operating Margin" stroke="#00adef" strokeWidth={2} />
                            <Line type="monotone" dataKey="netMargin" name="Net Margin" stroke="#ffc107" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>Item</TableHeader>
                                {reports.map((report, i) => (
                                    <TableHeader key={i} $align="right">{formatDate(report.fiscalDateEnding)}</TableHeader>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => {
                                if (row.divider) {
                                    return <TableRow key={i}><TableCell colSpan={reports.length + 1} style={{ padding: '0.5rem' }}></TableCell></TableRow>;
                                }
                                return (
                                    <TableRow key={row.key}>
                                        <TableCell $header $bold={row.bold}>{row.label}</TableCell>
                                        {reports.map((report, j) => (
                                            <TableCell
                                                key={j}
                                                $align="right"
                                                $bold={row.bold}
                                                $highlight={row.highlight}
                                                $positive={report[row.key] > 0 && row.highlight}
                                                $negative={report[row.key] < 0}
                                            >
                                                {row.isPercent ? formatPercent(report[row.key]) : formatCurrency(report[row.key])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </tbody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    const renderBalanceSheet = () => {
        const reports = getReports('balance');
        if (!reports.length) return <EmptyState><FileText /><h3>No Data</h3><p>Balance sheet data not available</p></EmptyState>;

        const rows = [
            { section: 'Assets' },
            { key: 'cashAndEquivalents', label: 'Cash & Equivalents' },
            { key: 'shortTermInvestments', label: 'Short Term Investments' },
            { key: 'currentNetReceivables', label: 'Receivables' },
            { key: 'inventory', label: 'Inventory' },
            { key: 'totalCurrentAssets', label: 'Total Current Assets', bold: true },
            { key: 'propertyPlantEquipment', label: 'Property, Plant & Equipment' },
            { key: 'goodwill', label: 'Goodwill' },
            { key: 'intangibleAssets', label: 'Intangible Assets' },
            { key: 'totalNonCurrentAssets', label: 'Total Non-Current Assets', bold: true },
            { key: 'totalAssets', label: 'Total Assets', bold: true, highlight: true },
            { divider: true },
            { section: 'Liabilities' },
            { key: 'accountsPayable', label: 'Accounts Payable' },
            { key: 'shortTermDebt', label: 'Short Term Debt' },
            { key: 'totalCurrentLiabilities', label: 'Total Current Liabilities', bold: true },
            { key: 'longTermDebt', label: 'Long Term Debt' },
            { key: 'totalNonCurrentLiabilities', label: 'Total Non-Current Liabilities', bold: true },
            { key: 'totalLiabilities', label: 'Total Liabilities', bold: true, highlight: true },
            { divider: true },
            { section: 'Equity' },
            { key: 'commonStock', label: 'Common Stock' },
            { key: 'retainedEarnings', label: 'Retained Earnings' },
            { key: 'totalShareholderEquity', label: 'Total Equity', bold: true, highlight: true },
            { divider: true },
            { section: 'Ratios' },
            { key: 'currentRatio', label: 'Current Ratio', isRatio: true },
            { key: 'debtToEquity', label: 'Debt to Equity', isRatio: true }
        ];

        return (
            <>
                <ChartContainer>
                    <ChartTitle><PieChart size={18} /> Assets vs Liabilities</ChartTitle>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[...reports].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="fiscalDateEnding" tickFormatter={formatDate} stroke="#64748b" />
                            <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="#64748b" />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={formatDate}
                                contentStyle={{
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    border: '1px solid rgba(0, 173, 237, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="totalAssets" name="Total Assets" fill="#00adef" />
                            <Bar dataKey="totalLiabilities" name="Total Liabilities" fill="#ff4757" />
                            <Bar dataKey="totalShareholderEquity" name="Equity" fill="#00ff88" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>Item</TableHeader>
                                {reports.map((report, i) => (
                                    <TableHeader key={i} $align="right">{formatDate(report.fiscalDateEnding)}</TableHeader>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => {
                                if (row.divider) {
                                    return <TableRow key={i}><TableCell colSpan={reports.length + 1} style={{ padding: '0.5rem' }}></TableCell></TableRow>;
                                }
                                if (row.section) {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell colSpan={reports.length + 1} $bold style={{ background: 'rgba(0, 173, 237, 0.1)', color: '#00adef' }}>
                                                {row.section}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                                return (
                                    <TableRow key={row.key}>
                                        <TableCell $header $bold={row.bold}>{row.label}</TableCell>
                                        {reports.map((report, j) => (
                                            <TableCell
                                                key={j}
                                                $align="right"
                                                $bold={row.bold}
                                                $highlight={row.highlight}
                                            >
                                                {row.isRatio ? (report[row.key] || '-') : formatCurrency(report[row.key])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </tbody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    const renderCashFlow = () => {
        const reports = getReports('cashflow');
        if (!reports.length) return <EmptyState><FileText /><h3>No Data</h3><p>Cash flow data not available</p></EmptyState>;

        const rows = [
            { section: 'Operating Activities' },
            { key: 'netIncome', label: 'Net Income' },
            { key: 'depreciation', label: 'Depreciation & Amortization' },
            { key: 'changeInReceivables', label: 'Change in Receivables' },
            { key: 'changeInInventory', label: 'Change in Inventory' },
            { key: 'operatingCashflow', label: 'Operating Cash Flow', bold: true, highlight: true },
            { divider: true },
            { section: 'Investing Activities' },
            { key: 'capitalExpenditures', label: 'Capital Expenditures' },
            { key: 'acquisitions', label: 'Acquisitions' },
            { key: 'purchaseOfInvestments', label: 'Purchase of Investments' },
            { key: 'saleOfInvestments', label: 'Sale of Investments' },
            { key: 'investingCashflow', label: 'Investing Cash Flow', bold: true, highlight: true },
            { divider: true },
            { section: 'Financing Activities' },
            { key: 'dividendsPaid', label: 'Dividends Paid' },
            { key: 'shareRepurchases', label: 'Share Repurchases' },
            { key: 'debtRepayment', label: 'Debt Repayment' },
            { key: 'financingCashflow', label: 'Financing Cash Flow', bold: true, highlight: true },
            { divider: true },
            { key: 'netChangeInCash', label: 'Net Change in Cash', bold: true },
            { key: 'freeCashFlow', label: 'Free Cash Flow', bold: true, highlight: true }
        ];

        return (
            <>
                <ChartContainer>
                    <ChartTitle><ArrowRightLeft size={18} /> Cash Flow Breakdown</ChartTitle>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={[...reports].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="fiscalDateEnding" tickFormatter={formatDate} stroke="#64748b" />
                            <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="#64748b" />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={formatDate}
                                contentStyle={{
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    border: '1px solid rgba(0, 173, 237, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="operatingCashflow" name="Operating" fill="#00ff88" />
                            <Bar dataKey="investingCashflow" name="Investing" fill="#ff4757" />
                            <Bar dataKey="financingCashflow" name="Financing" fill="#00adef" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer>
                    <ChartTitle><TrendingUp size={18} /> Free Cash Flow Trend</ChartTitle>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={[...reports].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="fiscalDateEnding" tickFormatter={formatDate} stroke="#64748b" />
                            <YAxis tickFormatter={(v) => formatCurrency(v)} stroke="#64748b" />
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={formatDate}
                                contentStyle={{
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    border: '1px solid rgba(0, 173, 237, 0.3)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar
                                dataKey="freeCashFlow"
                                name="Free Cash Flow"
                                fill={(d) => d.freeCashFlow >= 0 ? '#00ff88' : '#ff4757'}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <TableContainer>
                    <Table>
                        <thead>
                            <tr>
                                <TableHeader>Item</TableHeader>
                                {reports.map((report, i) => (
                                    <TableHeader key={i} $align="right">{formatDate(report.fiscalDateEnding)}</TableHeader>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => {
                                if (row.divider) {
                                    return <TableRow key={i}><TableCell colSpan={reports.length + 1} style={{ padding: '0.5rem' }}></TableCell></TableRow>;
                                }
                                if (row.section) {
                                    return (
                                        <TableRow key={i}>
                                            <TableCell colSpan={reports.length + 1} $bold style={{ background: 'rgba(0, 173, 237, 0.1)', color: '#00adef' }}>
                                                {row.section}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                                return (
                                    <TableRow key={row.key}>
                                        <TableCell $header $bold={row.bold}>{row.label}</TableCell>
                                        {reports.map((report, j) => (
                                            <TableCell
                                                key={j}
                                                $align="right"
                                                $bold={row.bold}
                                                $highlight={row.highlight}
                                                $positive={report[row.key] > 0 && row.highlight}
                                                $negative={report[row.key] < 0}
                                            >
                                                {formatCurrency(report[row.key])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })}
                        </tbody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <Building2 size={32} />
                    Company Financials
                </Title>
                <Subtitle>Income Statements, Balance Sheets, Cash Flow Analysis</Subtitle>
            </Header>

            <SearchContainer>
                <SearchInputWrapper>
                    <SearchIcon><Search size={20} /></SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    />
                </SearchInputWrapper>
                <SearchButton onClick={handleSearch} disabled={loading}>
                    {loading ? <Loader size={18} className="spin" /> : <Search size={18} />}
                    Analyze
                </SearchButton>
            </SearchContainer>

            <Content>
                {loading ? (
                    <LoadingContainer>
                        <Loader size={48} />
                        <p>Loading financial data...</p>
                    </LoadingContainer>
                ) : !symbol ? (
                    <EmptyState>
                        <Building2 />
                        <h3>Search for a Company</h3>
                        <p>Enter a stock symbol to view detailed financial statements</p>
                    </EmptyState>
                ) : data.overview ? (
                    <>
                        <CompanyHeader>
                            <CompanyInfo>
                                <CompanyLogo>{symbol.slice(0, 2)}</CompanyLogo>
                                <CompanyDetails>
                                    <h2>{data.overview.name || symbol}</h2>
                                    <p>{data.overview.sector} | {data.overview.industry}</p>
                                </CompanyDetails>
                            </CompanyInfo>
                            <KeyMetrics>
                                <MetricItem>
                                    <div className="label">Market Cap</div>
                                    <div className="value">{formatCurrency(data.overview.marketCap)}</div>
                                </MetricItem>
                                <MetricItem>
                                    <div className="label">P/E Ratio</div>
                                    <div className="value">{data.overview.peRatio?.toFixed(2) || '-'}</div>
                                </MetricItem>
                                <MetricItem $positive={data.overview.profitMargin > 0}>
                                    <div className="label">Profit Margin</div>
                                    <div className="value">{formatPercent(data.overview.profitMargin * 100)}</div>
                                </MetricItem>
                            </KeyMetrics>
                        </CompanyHeader>

                        <TabContainer>
                            <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                                <PieChart size={16} /> Overview
                            </Tab>
                            <Tab $active={activeTab === 'income'} onClick={() => setActiveTab('income')}>
                                <FileText size={16} /> Income Statement
                            </Tab>
                            <Tab $active={activeTab === 'balance'} onClick={() => setActiveTab('balance')}>
                                <Wallet size={16} /> Balance Sheet
                            </Tab>
                            <Tab $active={activeTab === 'cashflow'} onClick={() => setActiveTab('cashflow')}>
                                <ArrowRightLeft size={16} /> Cash Flow
                            </Tab>
                        </TabContainer>

                        {activeTab !== 'overview' && (
                            <ViewToggle>
                                <ToggleButton $active={viewType === 'annual'} onClick={() => setViewType('annual')}>
                                    Annual
                                </ToggleButton>
                                <ToggleButton $active={viewType === 'quarterly'} onClick={() => setViewType('quarterly')}>
                                    Quarterly
                                </ToggleButton>
                            </ViewToggle>
                        )}

                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'income' && renderIncomeStatement()}
                        {activeTab === 'balance' && renderBalanceSheet()}
                        {activeTab === 'cashflow' && renderCashFlow()}
                    </>
                ) : (
                    <EmptyState>
                        <Building2 />
                        <h3>No Data Found</h3>
                        <p>Unable to find financial data for {symbol}</p>
                    </EmptyState>
                )}
            </Content>
        </PageContainer>
    );
};

export default CompanyFinancialsPage;
