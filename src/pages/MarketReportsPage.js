// client/src/pages/MarketReportsPage.js - AI-Generated Market Reports

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
    FileText, TrendingUp, TrendingDown, Calendar, Clock, RefreshCw,
    BarChart3, PieChart, AlertTriangle, CheckCircle, Target, Briefcase,
    ArrowUpRight, ArrowDownRight, Sparkles, Building2, ChevronRight,
    Loader, Star, Zap, Eye, Search
} from 'lucide-react';
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

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
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
    background: linear-gradient(135deg, #00adef 0%, #a855f7 50%, #00ff88 100%);
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AIBadge = styled.span`
    background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
`;

const TabContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    padding: 0.5rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 173, 237, 0.2);
    overflow-x: auto;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;
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

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const ReportCard = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #00adef, #a855f7, #00ff88);
    }
`;

const ReportHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const ReportTitle = styled.h2`
    font-size: 1.5rem;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ReportMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #64748b;
    font-size: 0.85rem;
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 8px;
    color: #00adef;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        animation: ${props => props.$loading ? spin : 'none'} 1s linear infinite;
    }
`;

const SummaryBox = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;

    h3 {
        color: #00adef;
        font-size: 1rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    p {
        color: #e0e6ed;
        line-height: 1.7;
        font-size: 0.95rem;
    }
`;

const Section = styled.div`
    margin-bottom: 1.5rem;

    h3 {
        color: #e0e6ed;
        font-size: 1.1rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
`;

const BulletList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;

    li {
        padding: 0.75rem 0;
        padding-left: 1.5rem;
        position: relative;
        color: #94a3b8;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${props => props.$variant === 'bullish' ? '#00ff88' :
                                   props.$variant === 'bearish' ? '#ff4757' : '#00adef'};
        }

        &:last-child {
            border-bottom: none;
        }
    }
`;

const OutlookBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    background: ${props =>
        props.$sentiment === 'bullish' ? 'rgba(0, 255, 136, 0.2)' :
        props.$sentiment === 'bearish' ? 'rgba(255, 71, 87, 0.2)' :
        'rgba(255, 193, 7, 0.2)'
    };
    color: ${props =>
        props.$sentiment === 'bullish' ? '#00ff88' :
        props.$sentiment === 'bearish' ? '#ff4757' :
        '#ffc107'
    };
    border: 1px solid ${props =>
        props.$sentiment === 'bullish' ? 'rgba(0, 255, 136, 0.3)' :
        props.$sentiment === 'bearish' ? 'rgba(255, 71, 87, 0.3)' :
        'rgba(255, 193, 7, 0.3)'
    };
`;

const SectorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const SectorCard = styled.button`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid ${props => props.$active ? '#00adef' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 12px;
    padding: 1.25rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.3s ease;

    &:hover {
        border-color: #00adef;
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.2);
    }

    .sector-name {
        color: #e0e6ed;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .sector-etf {
        color: #64748b;
        font-size: 0.85rem;
    }
`;

const StockSearchContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const SearchInput = styled.input`
    flex: 1;
    padding: 1rem 1rem 1rem 3rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    outline: none;

    &:focus {
        border-color: #00adef;
    }
`;

const SearchWrapper = styled.div`
    flex: 1;
    position: relative;

    svg {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
    }
`;

const SearchButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
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
        box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
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

const AIGenerating = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #a855f7;
    font-weight: 500;

    svg {
        animation: ${pulse} 1.5s ease-in-out infinite;
    }
`;

const PriceTargetGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 1rem;
`;

const PriceTargetCard = styled.div`
    background: ${props =>
        props.$type === 'bull' ? 'rgba(0, 255, 136, 0.1)' :
        props.$type === 'bear' ? 'rgba(255, 71, 87, 0.1)' :
        'rgba(255, 193, 7, 0.1)'
    };
    border: 1px solid ${props =>
        props.$type === 'bull' ? 'rgba(0, 255, 136, 0.3)' :
        props.$type === 'bear' ? 'rgba(255, 71, 87, 0.3)' :
        'rgba(255, 193, 7, 0.3)'
    };
    border-radius: 12px;
    padding: 1rem;
    text-align: center;

    .label {
        color: #64748b;
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
    }

    .price {
        font-size: 1.5rem;
        font-weight: 700;
        color: ${props =>
            props.$type === 'bull' ? '#00ff88' :
            props.$type === 'bear' ? '#ff4757' :
            '#ffc107'
        };
    }
`;

// ============ SECTORS ============
const SECTORS = [
    { id: 'technology', name: 'Technology', etf: 'XLK' },
    { id: 'healthcare', name: 'Healthcare', etf: 'XLV' },
    { id: 'financials', name: 'Financials', etf: 'XLF' },
    { id: 'energy', name: 'Energy', etf: 'XLE' },
    { id: 'consumer', name: 'Consumer', etf: 'XLY' },
    { id: 'industrials', name: 'Industrials', etf: 'XLI' },
    { id: 'utilities', name: 'Utilities', etf: 'XLU' },
    { id: 'materials', name: 'Materials', etf: 'XLB' },
    { id: 'realestate', name: 'Real Estate', etf: 'XLRE' }
];

// ============ COMPONENT ============
const MarketReportsPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('daily');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [stockSymbol, setStockSymbol] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchReport();
    }, [user, activeTab]);

    const fetchReport = async () => {
        if (activeTab === 'sector' || activeTab === 'stock') return;

        setLoading(true);
        setReport(null);
        try {
            const response = await api.get(`/market-reports/${activeTab}`);
            setReport(response.data.report);
        } catch (error) {
            console.error('Error fetching report:', error);
            showToast('Failed to fetch market report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSectorReport = async (sector) => {
        setSelectedSector(sector);
        setLoading(true);
        setReport(null);
        try {
            const response = await api.get(`/market-reports/sector/${sector}`);
            setReport(response.data.report);
        } catch (error) {
            showToast('Failed to fetch sector report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStockReport = async () => {
        if (!stockSymbol.trim()) return;

        setLoading(true);
        setReport(null);
        try {
            const response = await api.get(`/market-reports/stock/${stockSymbol.toUpperCase()}`);
            setReport(response.data.report);
        } catch (error) {
            showToast('Failed to fetch stock report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderDailyReport = () => {
        if (!report) return null;

        return (
            <ReportCard>
                <ReportHeader>
                    <ReportTitle>
                        <Calendar size={24} />
                        Daily Market Report
                    </ReportTitle>
                    <ReportMeta>
                        <span><Clock size={14} /> {new Date(report.generatedAt).toLocaleString()}</span>
                        <AIBadge><Sparkles size={12} /> AI Generated</AIBadge>
                        <RefreshButton onClick={fetchReport} disabled={loading} $loading={loading}>
                            <RefreshCw size={16} /> Refresh
                        </RefreshButton>
                    </ReportMeta>
                </ReportHeader>

                <SummaryBox>
                    <h3><FileText size={16} /> Market Summary</h3>
                    <p>{report.summary}</p>
                </SummaryBox>

                {report.themes?.length > 0 && (
                    <Section>
                        <h3><TrendingUp size={18} /> Key Themes Today</h3>
                        <BulletList>
                            {report.themes.map((theme, i) => (
                                <li key={i}>{theme}</li>
                            ))}
                        </BulletList>
                    </Section>
                )}

                {report.sectorHighlights && (
                    <Section>
                        <h3><PieChart size={18} /> Sector Highlights</h3>
                        <p style={{ color: '#94a3b8' }}>{report.sectorHighlights}</p>
                    </Section>
                )}

                {report.riskFactors?.length > 0 && (
                    <Section>
                        <h3><AlertTriangle size={18} /> Risk Factors</h3>
                        <BulletList $variant="bearish">
                            {report.riskFactors.map((risk, i) => (
                                <li key={i}>{risk}</li>
                            ))}
                        </BulletList>
                    </Section>
                )}

                {report.outlook && (
                    <Section>
                        <h3><Target size={18} /> Market Outlook</h3>
                        <OutlookBadge $sentiment={report.outlook.sentiment?.toLowerCase()}>
                            {report.outlook.sentiment?.toLowerCase() === 'bullish' ? <TrendingUp size={18} /> :
                             report.outlook.sentiment?.toLowerCase() === 'bearish' ? <TrendingDown size={18} /> :
                             <BarChart3 size={18} />}
                            {report.outlook.sentiment?.toUpperCase()}
                        </OutlookBadge>
                        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>{report.outlook.reasoning}</p>
                    </Section>
                )}
            </ReportCard>
        );
    };

    const renderWeeklyReport = () => {
        if (!report) return null;

        return (
            <ReportCard>
                <ReportHeader>
                    <ReportTitle>
                        <Calendar size={24} />
                        Weekly Market Review
                    </ReportTitle>
                    <ReportMeta>
                        <span><Clock size={14} /> Week of {report.weekStart}</span>
                        <AIBadge><Sparkles size={12} /> AI Generated</AIBadge>
                    </ReportMeta>
                </ReportHeader>

                <SummaryBox>
                    <h3><FileText size={16} /> Week in Review</h3>
                    <p>{report.weekSummary}</p>
                </SummaryBox>

                {report.majorEvents?.length > 0 && (
                    <Section>
                        <h3><Zap size={18} /> Major Events</h3>
                        <BulletList>
                            {report.majorEvents.map((event, i) => (
                                <li key={i}>{event}</li>
                            ))}
                        </BulletList>
                    </Section>
                )}

                {report.sectorRanking?.length > 0 && (
                    <Section>
                        <h3><BarChart3 size={18} /> Sector Performance</h3>
                        <BulletList>
                            {report.sectorRanking.map((sector, i) => (
                                <li key={i}>
                                    <strong>{sector.sector}</strong>: {sector.performance}
                                </li>
                            ))}
                        </BulletList>
                    </Section>
                )}

                {report.weekAheadOutlook && (
                    <Section>
                        <h3><Eye size={18} /> Week Ahead Outlook</h3>
                        <OutlookBadge $sentiment={report.weekAheadOutlook.sentiment?.toLowerCase()}>
                            {report.weekAheadOutlook.sentiment?.toUpperCase()}
                        </OutlookBadge>
                        {report.weekAheadOutlook.keyPoints?.length > 0 && (
                            <BulletList style={{ marginTop: '1rem' }}>
                                {report.weekAheadOutlook.keyPoints.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </BulletList>
                        )}
                    </Section>
                )}
            </ReportCard>
        );
    };

    const renderSectorReport = () => {
        return (
            <>
                <SectorGrid>
                    {SECTORS.map(sector => (
                        <SectorCard
                            key={sector.id}
                            $active={selectedSector === sector.id}
                            onClick={() => fetchSectorReport(sector.id)}
                        >
                            <div className="sector-name">{sector.name}</div>
                            <div className="sector-etf">ETF: {sector.etf}</div>
                        </SectorCard>
                    ))}
                </SectorGrid>

                {report && (
                    <ReportCard>
                        <ReportHeader>
                            <ReportTitle>
                                <Briefcase size={24} />
                                {report.sector} Sector Analysis
                            </ReportTitle>
                            <AIBadge><Sparkles size={12} /> AI Generated</AIBadge>
                        </ReportHeader>

                        <SummaryBox>
                            <h3><FileText size={16} /> Sector Overview</h3>
                            <p>{report.overview}</p>
                        </SummaryBox>

                        {report.keyDrivers?.length > 0 && (
                            <Section>
                                <h3><Zap size={18} /> Key Drivers</h3>
                                <BulletList>
                                    {report.keyDrivers.map((driver, i) => (
                                        <li key={i}>{driver}</li>
                                    ))}
                                </BulletList>
                            </Section>
                        )}

                        {report.topPerformers?.length > 0 && (
                            <Section>
                                <h3><TrendingUp size={18} /> Top Performers</h3>
                                <BulletList $variant="bullish">
                                    {report.topPerformers.map((stock, i) => (
                                        <li key={i}>
                                            <strong>{stock.symbol}</strong>: {stock.reason}
                                        </li>
                                    ))}
                                </BulletList>
                            </Section>
                        )}

                        {report.catalysts?.length > 0 && (
                            <Section>
                                <h3><Star size={18} /> Upcoming Catalysts</h3>
                                <BulletList>
                                    {report.catalysts.map((catalyst, i) => (
                                        <li key={i}>{catalyst}</li>
                                    ))}
                                </BulletList>
                            </Section>
                        )}

                        {report.investmentThesis && (
                            <Section>
                                <h3><Target size={18} /> Investment Thesis</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>Bullish Case</h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{report.investmentThesis.bullishCase}</p>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#ff4757', marginBottom: '0.5rem' }}>Bearish Case</h4>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{report.investmentThesis.bearishCase}</p>
                                    </div>
                                </div>
                            </Section>
                        )}
                    </ReportCard>
                )}
            </>
        );
    };

    const renderStockReport = () => {
        return (
            <>
                <StockSearchContainer>
                    <SearchWrapper>
                        <Search size={20} />
                        <SearchInput
                            type="text"
                            placeholder="Enter stock symbol (e.g., AAPL, MSFT)"
                            value={stockSymbol}
                            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && fetchStockReport()}
                        />
                    </SearchWrapper>
                    <SearchButton onClick={fetchStockReport} disabled={loading || !stockSymbol.trim()}>
                        {loading ? <Loader size={18} className="spin" /> : <Sparkles size={18} />}
                        Generate AI Analysis
                    </SearchButton>
                </StockSearchContainer>

                {report && (
                    <ReportCard>
                        <ReportHeader>
                            <ReportTitle>
                                <Building2 size={24} />
                                {report.symbol} Analysis
                            </ReportTitle>
                            <AIBadge><Sparkles size={12} /> AI Generated</AIBadge>
                        </ReportHeader>

                        <SummaryBox>
                            <h3><FileText size={16} /> Investment Summary</h3>
                            <p>{report.summary}</p>
                        </SummaryBox>

                        {report.strengths?.length > 0 && (
                            <Section>
                                <h3><CheckCircle size={18} /> Key Strengths</h3>
                                <BulletList $variant="bullish">
                                    {report.strengths.map((strength, i) => (
                                        <li key={i}>{strength}</li>
                                    ))}
                                </BulletList>
                            </Section>
                        )}

                        {report.risks?.length > 0 && (
                            <Section>
                                <h3><AlertTriangle size={18} /> Key Risks</h3>
                                <BulletList $variant="bearish">
                                    {report.risks.map((risk, i) => (
                                        <li key={i}>{risk}</li>
                                    ))}
                                </BulletList>
                            </Section>
                        )}

                        {report.valuation && (
                            <Section>
                                <h3><BarChart3 size={18} /> Valuation</h3>
                                <p style={{ color: '#94a3b8' }}>{report.valuation}</p>
                            </Section>
                        )}

                        {report.priceTargets && (
                            <Section>
                                <h3><Target size={18} /> Price Targets</h3>
                                <PriceTargetGrid>
                                    <PriceTargetCard $type="bull">
                                        <div className="label">Bull Case</div>
                                        <div className="price">${report.priceTargets.bull || 'N/A'}</div>
                                    </PriceTargetCard>
                                    <PriceTargetCard $type="base">
                                        <div className="label">Base Case</div>
                                        <div className="price">${report.priceTargets.base || 'N/A'}</div>
                                    </PriceTargetCard>
                                    <PriceTargetCard $type="bear">
                                        <div className="label">Bear Case</div>
                                        <div className="price">${report.priceTargets.bear || 'N/A'}</div>
                                    </PriceTargetCard>
                                </PriceTargetGrid>
                            </Section>
                        )}

                        {report.recommendation && (
                            <Section>
                                <h3><Star size={18} /> Recommendation</h3>
                                <OutlookBadge $sentiment={
                                    report.recommendation.rating?.toLowerCase().includes('buy') ? 'bullish' :
                                    report.recommendation.rating?.toLowerCase().includes('sell') ? 'bearish' :
                                    'neutral'
                                }>
                                    {report.recommendation.rating?.toUpperCase()}
                                </OutlookBadge>
                                <p style={{ marginTop: '1rem', color: '#94a3b8' }}>{report.recommendation.reasoning}</p>
                            </Section>
                        )}
                    </ReportCard>
                )}
            </>
        );
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <FileText size={32} />
                    AI Market Reports
                </Title>
                <Subtitle>
                    Intelligent market analysis powered by AI
                    <AIBadge><Sparkles size={12} /> Claude AI</AIBadge>
                </Subtitle>
            </Header>

            <TabContainer>
                <Tab $active={activeTab === 'daily'} onClick={() => { setActiveTab('daily'); setReport(null); }}>
                    <Calendar size={16} /> Daily Report
                </Tab>
                <Tab $active={activeTab === 'weekly'} onClick={() => { setActiveTab('weekly'); setReport(null); }}>
                    <BarChart3 size={16} /> Weekly Review
                </Tab>
                <Tab $active={activeTab === 'sector'} onClick={() => { setActiveTab('sector'); setReport(null); }}>
                    <PieChart size={16} /> Sector Analysis
                </Tab>
                <Tab $active={activeTab === 'stock'} onClick={() => { setActiveTab('stock'); setReport(null); }}>
                    <Building2 size={16} /> Stock Analysis
                </Tab>
            </TabContainer>

            <Content>
                {loading ? (
                    <LoadingContainer>
                        <Loader size={48} />
                        <AIGenerating>
                            <Sparkles size={20} />
                            AI is generating your report...
                        </AIGenerating>
                    </LoadingContainer>
                ) : (
                    <>
                        {activeTab === 'daily' && renderDailyReport()}
                        {activeTab === 'weekly' && renderWeeklyReport()}
                        {activeTab === 'sector' && renderSectorReport()}
                        {activeTab === 'stock' && renderStockReport()}
                    </>
                )}
            </Content>
        </PageContainer>
    );
};

export default MarketReportsPage;
