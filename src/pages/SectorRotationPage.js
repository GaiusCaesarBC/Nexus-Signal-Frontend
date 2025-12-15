// client/src/pages/SectorRotationPage.js - Sector Rotation & Money Flow Analysis

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
    RefreshCw, TrendingUp, TrendingDown, ArrowRightLeft, PieChart,
    BarChart3, Activity, Zap, Target, Clock, ChevronRight, Eye,
    ArrowUpRight, ArrowDownRight, Loader, Info, Circle
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Treemap, Cell, PieChart as RechartsPie,
    Pie, ComposedChart, Area
} from 'recharts';
import api from '../services/api';

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
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
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
    background: linear-gradient(135deg, #00adef 0%, #00ff88 50%, #ffc107 100%);
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

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: ${props => props.$cols || '1fr 1fr'};
    gap: 1.5rem;
    margin-bottom: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out ${props => props.$delay || '0s'} both;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
    font-size: 1.1rem;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
    font-size: 0.85rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
    }

    svg {
        animation: ${props => props.$loading ? spin : 'none'} 1s linear infinite;
    }
`;

const SectorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
`;

const SectorTile = styled.div`
    background: ${props => props.$color ? `${props.$color}15` : 'rgba(0, 173, 237, 0.1)'};
    border: 1px solid ${props => props.$color ? `${props.$color}40` : 'rgba(0, 173, 237, 0.3)'};
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px ${props => props.$color ? `${props.$color}30` : 'rgba(0, 173, 237, 0.2)'};
    }

    .name {
        color: #e0e6ed;
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
    }

    .symbol {
        color: #64748b;
        font-size: 0.75rem;
        margin-bottom: 0.5rem;
    }

    .performance {
        font-size: 1.1rem;
        font-weight: 700;
        color: ${props => props.$positive ? '#00ff88' : '#ff4757'};
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
`;

const PhaseIndicator = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 255, 136, 0.2) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;

    .phase {
        font-size: 1.5rem;
        font-weight: 900;
        color: #00adef;
        margin-bottom: 0.5rem;
    }

    .description {
        color: #94a3b8;
        font-size: 0.9rem;
    }
`;

const FlowContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: center;
`;

const FlowColumn = styled.div`
    h3 {
        color: ${props => props.$type === 'inflow' ? '#00ff88' : '#ff4757'};
        font-size: 0.9rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

const FlowItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: ${props => props.$type === 'inflow' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 71, 87, 0.1)'};
    border-radius: 8px;
    margin-bottom: 0.5rem;

    .sector {
        color: #e0e6ed;
        font-weight: 500;
    }

    .score {
        color: ${props => props.$type === 'inflow' ? '#00ff88' : '#ff4757'};
        font-weight: 700;
    }
`;

const FlowArrow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #64748b;

    svg {
        animation: ${pulse} 2s ease-in-out infinite;
    }
`;

const BreadthBar = styled.div`
    display: flex;
    height: 24px;
    border-radius: 12px;
    overflow: hidden;
    margin: 1rem 0;

    .positive {
        background: linear-gradient(90deg, #00ff88, #00cc6a);
        transition: width 0.5s ease;
    }

    .negative {
        background: linear-gradient(90deg, #ff4757, #cc3344);
        transition: width 0.5s ease;
    }
`;

const BreadthLabels = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #94a3b8;

    span {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

const SentimentBadge = styled.span`
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.8rem;
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
`;

const HeatmapContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.5rem;
`;

const HeatmapTile = styled.div`
    aspect-ratio: 1.5;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    background: ${props => {
        const value = props.$value || 0;
        if (value > 3) return 'linear-gradient(135deg, #00ff88, #00cc6a)';
        if (value > 1) return 'linear-gradient(135deg, #00cc6a80, #00ff8850)';
        if (value > 0) return 'linear-gradient(135deg, #00ff8840, #00cc6a20)';
        if (value > -1) return 'linear-gradient(135deg, #ff475730, #cc334420)';
        if (value > -3) return 'linear-gradient(135deg, #ff475760, #cc334450)';
        return 'linear-gradient(135deg, #ff4757, #cc3344)';
    }};
    color: white;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);

    &:hover {
        transform: scale(1.05);
        z-index: 1;
    }

    .symbol {
        font-size: 0.9rem;
    }

    .value {
        font-size: 1.1rem;
    }
`;

const InterpretationBox = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-top: 1rem;

    p {
        color: #e0e6ed;
        font-size: 0.9rem;
        line-height: 1.6;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;

        svg {
            flex-shrink: 0;
            margin-top: 2px;
        }
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

const TabContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const Tab = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 1px solid ${props => props.$active ? '#00adef' : 'rgba(0, 173, 237, 0.3)'};
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.2)' : 'transparent'};
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: #00adef;
    }
`;

// ============ COMPONENT ============
const SectorRotationPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [flowData, setFlowData] = useState(null);
    const [heatmapTimeframe, setHeatmapTimeframe] = useState('week');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, flowRes] = await Promise.all([
                api.get('/api/sector-rotation/overview'),
                api.get('/api/sector-rotation/flow')
            ]);

            setData(overviewRes.data);
            setFlowData(flowRes.data);
        } catch (error) {
            console.error('Error fetching sector data:', error);
            showToast('Failed to fetch sector rotation data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getPerformanceForTimeframe = (sector) => {
        if (heatmapTimeframe === 'day') return sector.performance.day;
        if (heatmapTimeframe === 'month') return sector.performance.month;
        return sector.performance.week;
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <Loader size={48} />
                    <p>Loading sector rotation data...</p>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>
                    <ArrowRightLeft size={32} />
                    Sector Rotation
                </Title>
                <Subtitle>Track money flow between market sectors</Subtitle>
            </Header>

            <Content>
                {/* Market Phase & Breadth */}
                <Grid $cols="2fr 1fr">
                    <Card $delay="0.1s">
                        <CardHeader>
                            <CardTitle><Activity size={20} /> Market Breadth</CardTitle>
                            <RefreshButton onClick={fetchData} $loading={loading}>
                                <RefreshCw size={16} /> Refresh
                            </RefreshButton>
                        </CardHeader>

                        <BreadthLabels>
                            <span>
                                <Circle size={12} fill="#00ff88" stroke="none" />
                                {data?.marketBreadth?.positiveWeek || 0} Sectors Up
                            </span>
                            <SentimentBadge $sentiment={data?.marketBreadth?.sentiment}>
                                {data?.marketBreadth?.sentiment?.toUpperCase()}
                            </SentimentBadge>
                            <span>
                                <Circle size={12} fill="#ff4757" stroke="none" />
                                {data?.marketBreadth?.negativeWeek || 0} Sectors Down
                            </span>
                        </BreadthLabels>

                        <BreadthBar>
                            <div
                                className="positive"
                                style={{ width: `${(data?.marketBreadth?.positiveWeek / 11) * 100}%` }}
                            />
                            <div
                                className="negative"
                                style={{ width: `${(data?.marketBreadth?.negativeWeek / 11) * 100}%` }}
                            />
                        </BreadthBar>

                        {/* Rankings Chart */}
                        {data?.sectors && (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                    data={[...data.sectors].sort((a, b) => b.performance.week - a.performance.week)}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={(v) => v.toFixed(1) + '%'}
                                        stroke="#64748b"
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={120}
                                        stroke="#64748b"
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        formatter={(v) => v.toFixed(2) + '%'}
                                        contentStyle={{
                                            background: 'rgba(30, 41, 59, 0.95)',
                                            border: '1px solid rgba(0, 173, 237, 0.3)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="performance.week"
                                        name="Weekly Return"
                                    >
                                        {data.sectors.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={entry.performance.week >= 0 ? '#00ff88' : '#ff4757'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    <Card $delay="0.2s">
                        <CardHeader>
                            <CardTitle><Target size={20} /> Market Cycle</CardTitle>
                        </CardHeader>

                        <PhaseIndicator>
                            <div className="phase">{data?.rotationPhase?.phase}</div>
                            <div className="description">{data?.rotationPhase?.description}</div>
                        </PhaseIndicator>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                                SPY Benchmark
                            </h4>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Day</div>
                                    <div style={{
                                        color: data?.benchmark?.performance?.day >= 0 ? '#00ff88' : '#ff4757',
                                        fontWeight: 700
                                    }}>
                                        {data?.benchmark?.performance?.day >= 0 ? '+' : ''}
                                        {data?.benchmark?.performance?.day?.toFixed(2)}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Week</div>
                                    <div style={{
                                        color: data?.benchmark?.performance?.week >= 0 ? '#00ff88' : '#ff4757',
                                        fontWeight: 700
                                    }}>
                                        {data?.benchmark?.performance?.week >= 0 ? '+' : ''}
                                        {data?.benchmark?.performance?.week?.toFixed(2)}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Month</div>
                                    <div style={{
                                        color: data?.benchmark?.performance?.month >= 0 ? '#00ff88' : '#ff4757',
                                        fontWeight: 700
                                    }}>
                                        {data?.benchmark?.performance?.month >= 0 ? '+' : ''}
                                        {data?.benchmark?.performance?.month?.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Grid>

                {/* Heatmap */}
                <Card $delay="0.3s">
                    <CardHeader>
                        <CardTitle><BarChart3 size={20} /> Sector Heatmap</CardTitle>
                        <TabContainer>
                            <Tab $active={heatmapTimeframe === 'day'} onClick={() => setHeatmapTimeframe('day')}>
                                Day
                            </Tab>
                            <Tab $active={heatmapTimeframe === 'week'} onClick={() => setHeatmapTimeframe('week')}>
                                Week
                            </Tab>
                            <Tab $active={heatmapTimeframe === 'month'} onClick={() => setHeatmapTimeframe('month')}>
                                Month
                            </Tab>
                        </TabContainer>
                    </CardHeader>

                    <HeatmapContainer>
                        {data?.sectors?.sort((a, b) =>
                            getPerformanceForTimeframe(b) - getPerformanceForTimeframe(a)
                        ).map((sector) => {
                            const value = getPerformanceForTimeframe(sector);
                            return (
                                <HeatmapTile key={sector.id} $value={value}>
                                    <div className="symbol">{sector.symbol}</div>
                                    <div className="value">
                                        {value >= 0 ? '+' : ''}{value?.toFixed(1)}%
                                    </div>
                                </HeatmapTile>
                            );
                        })}
                    </HeatmapContainer>
                </Card>

                {/* Money Flow */}
                <Card $delay="0.4s">
                    <CardHeader>
                        <CardTitle><Zap size={20} /> Money Flow Analysis</CardTitle>
                    </CardHeader>

                    <FlowContainer>
                        <FlowColumn $type="inflow">
                            <h3><TrendingUp size={16} /> Inflows</h3>
                            {flowData?.flow?.inflows?.map((item, i) => (
                                <FlowItem key={i} $type="inflow">
                                    <span className="sector">{item.sector}</span>
                                    <span className="score">+{item.score?.toFixed(1)}</span>
                                </FlowItem>
                            ))}
                        </FlowColumn>

                        <FlowArrow>
                            <ArrowRightLeft size={32} />
                            <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                {flowData?.flow?.summary?.netDirection}
                            </div>
                        </FlowArrow>

                        <FlowColumn $type="outflow">
                            <h3><TrendingDown size={16} /> Outflows</h3>
                            {flowData?.flow?.outflows?.map((item, i) => (
                                <FlowItem key={i} $type="outflow">
                                    <span className="sector">{item.sector}</span>
                                    <span className="score">-{item.score?.toFixed(1)}</span>
                                </FlowItem>
                            ))}
                        </FlowColumn>
                    </FlowContainer>

                    {flowData?.interpretation && (
                        <InterpretationBox>
                            <p>
                                <Info size={18} color="#00adef" />
                                {flowData.interpretation}
                            </p>
                        </InterpretationBox>
                    )}
                </Card>

                {/* All Sectors Grid */}
                <Card $delay="0.5s">
                    <CardHeader>
                        <CardTitle><PieChart size={20} /> All Sectors</CardTitle>
                    </CardHeader>

                    <SectorGrid>
                        {data?.sectors?.map((sector) => (
                            <SectorTile
                                key={sector.id}
                                $color={sector.color}
                                $positive={sector.performance.week >= 0}
                            >
                                <div className="name">{sector.name}</div>
                                <div className="symbol">{sector.symbol}</div>
                                <div className="performance">
                                    {sector.performance.week >= 0 ? (
                                        <ArrowUpRight size={16} />
                                    ) : (
                                        <ArrowDownRight size={16} />
                                    )}
                                    {sector.performance.week >= 0 ? '+' : ''}
                                    {sector.performance.week?.toFixed(2)}%
                                </div>
                            </SectorTile>
                        ))}
                    </SectorGrid>
                </Card>

                {/* Relative Strength */}
                <Card $delay="0.6s">
                    <CardHeader>
                        <CardTitle><Eye size={20} /> Relative Strength vs SPY</CardTitle>
                    </CardHeader>

                    {data?.sectors && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[...data.sectors].sort((a, b) =>
                                    b.relativeStrength?.week - a.relativeStrength?.week
                                )}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="symbol"
                                    stroke="#64748b"
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    tickFormatter={(v) => v.toFixed(1) + '%'}
                                    stroke="#64748b"
                                />
                                <Tooltip
                                    formatter={(v) => v?.toFixed(2) + '% vs SPY'}
                                    contentStyle={{
                                        background: 'rgba(30, 41, 59, 0.95)',
                                        border: '1px solid rgba(0, 173, 237, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar
                                    dataKey="relativeStrength.week"
                                    name="Relative Strength"
                                >
                                    {data.sectors.map((entry, index) => (
                                        <Cell
                                            key={index}
                                            fill={entry.relativeStrength?.week >= 0 ? '#00adef' : '#ff4757'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </Content>
        </PageContainer>
    );
};

export default SectorRotationPage;
