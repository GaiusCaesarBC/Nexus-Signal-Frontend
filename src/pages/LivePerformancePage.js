// client/src/pages/LivePerformancePage.js — Live Performance Tracker
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, TrendingDown, Target, Shield, CheckCircle, Clock, Zap, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.nexussignal.ai/api';

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.5}`;
const glowAnim = keyframes`0%,100%{box-shadow:0 0 8px rgba(16,185,129,.1)}50%{box-shadow:0 0 20px rgba(16,185,129,.2)}`;

const Page = styled.div`min-height:100vh;padding:5.5rem 1.5rem 4rem;max-width:1200px;margin:0 auto;@media(max-width:768px){padding:5rem 1rem 3rem;}@media(max-width:480px){padding:4.5rem .75rem 2rem;}`;
const HeaderArea = styled.div`text-align:center;margin-bottom:2rem;animation:${fadeIn} .4s ease-out;`;
const Title = styled.h1`font-size:clamp(1.5rem,3vw,2.2rem);font-weight:900;color:#e2e8f0;margin:0 0 .3rem;display:flex;align-items:center;justify-content:center;gap:.5rem;`;
const Subtitle = styled.p`font-size:.9rem;color:#64748b;margin:0;`;
const LiveDot = styled.span`width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;animation:${pulse} 2s infinite;box-shadow:0 0 8px rgba(16,185,129,.5);`;
const LiveText = styled.span`font-size:.7rem;color:#10b981;font-weight:600;display:flex;align-items:center;gap:.3rem;justify-content:center;margin-top:.4rem;`;

const StatsGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;margin-bottom:1.5rem;@media(max-width:480px){grid-template-columns:repeat(2,1fr);gap:.5rem;}`;
const StatCard = styled.div`
    background:rgba(15,23,42,.6);border:1px solid ${p => p.$color ? `${p.$color}22` : 'rgba(100,116,139,.12)'};
    border-radius:12px;padding:1rem;animation:${fadeIn} .5s ease-out both;animation-delay:${p => p.$d || '0s'};
`;
const StatLabel = styled.div`font-size:.7rem;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:.04em;margin-bottom:.25rem;display:flex;align-items:center;gap:.3rem;`;
const StatValue = styled.div`font-size:1.5rem;font-weight:900;color:${p => p.$c || '#e2e8f0'};letter-spacing:-.02em;@media(max-width:480px){font-size:1.2rem;}`;
const StatSub = styled.div`font-size:.68rem;color:#475569;margin-top:.15rem;`;

const Section = styled.div`margin-bottom:1.5rem;`;
const SectionTitle = styled.h2`font-size:1rem;font-weight:700;color:#e2e8f0;margin:0 0 .75rem;display:flex;align-items:center;gap:.4rem;`;
const Card = styled.div`background:rgba(15,23,42,.6);border:1px solid rgba(100,116,139,.1);border-radius:14px;padding:1.25rem;animation:${fadeIn} .5s ease-out;`;

const TransparencyBar = styled.div`
    display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;
    padding:.75rem;margin-bottom:1.5rem;border-radius:10px;
    background:rgba(16,185,129,.04);border:1px solid rgba(16,185,129,.1);
    @media(max-width:600px){gap:.75rem;padding:.6rem .5rem;}
`;
const TrustItem = styled.span`font-size:.72rem;color:#94a3b8;display:flex;align-items:center;gap:.3rem;svg{color:#10b981;width:13px;height:13px;}`;

const TableWrap = styled.div`overflow-x:auto;`;
const Table = styled.table`width:100%;border-collapse:separate;border-spacing:0;`;
const Th = styled.th`text-align:left;padding:.6rem .75rem;font-size:.68rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid rgba(100,116,139,.1);cursor:pointer;&:hover{color:#94a3b8;}`;
const Td = styled.td`padding:.55rem .75rem;font-size:.82rem;color:#e2e8f0;border-bottom:1px solid rgba(100,116,139,.06);`;
const Tr = styled.tr`transition:background .15s;&:hover{background:rgba(100,116,139,.04);}cursor:pointer;`;
const Badge = styled.span`
    font-size:.6rem;font-weight:700;padding:2px 6px;border-radius:4px;letter-spacing:.02em;
    background:${p => p.$bg || 'rgba(100,116,139,.1)'};color:${p => p.$c || '#94a3b8'};
    border:1px solid ${p => p.$bc || 'transparent'};
`;
const DirBadge = styled(Badge)`background:${p => p.$long ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)'};color:${p => p.$long ? '#10b981' : '#ef4444'};`;
const PctText = styled.span`font-weight:700;color:${p => p.$pos ? '#10b981' : '#ef4444'};`;
const FilterRow = styled.div`display:flex;gap:.4rem;margin-bottom:.75rem;flex-wrap:wrap;`;
const FilterBtn = styled.button`
    padding:.3rem .65rem;border-radius:6px;font-size:.7rem;font-weight:600;cursor:pointer;
    border:1px solid ${p => p.$active ? 'rgba(0,173,237,.3)' : 'rgba(100,116,139,.15)'};
    background:${p => p.$active ? 'rgba(0,173,237,.1)' : 'transparent'};
    color:${p => p.$active ? '#00adef' : '#64748b'};transition:all .2s;
`;
const TwoColGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;@media(max-width:600px){grid-template-columns:1fr;}`;

const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
        <div style={{background:'#0f172a',border:'1px solid rgba(100,116,139,.2)',borderRadius:8,padding:'.5rem .75rem',fontSize:'.75rem'}}>
            <div style={{color:'#e2e8f0',fontWeight:700}}>{d.cumReturn >= 0 ? '+' : ''}{d.cumReturn}%</div>
            {d.symbol && <div style={{color:'#64748b'}}>{d.symbol} {d.result === 'win' ? 'Win' : 'Loss'} {d.pct >= 0 ? '+' : ''}{d.pct}%</div>}
        </div>
    );
};

const COLORS = ['#10b981', '#ef4444'];
const fmtPrice = (p) => !p ? '\u2014' : p >= 1 ? `$${p.toFixed(2)}` : p >= 0.01 ? `$${p.toFixed(4)}` : `$${p.toFixed(8)}`;
const timeAgo = (d) => { if (!d) return '\u2014'; const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 0) return 'just now'; if (s < 60) return 'just now'; const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`; const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`; };

const LivePerformancePage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tableFilter, setTableFilter] = useState('all');
    const [sortBy, setSortBy] = useState('time');
    const [showArchived, setShowArchived] = useState(false);
    const [visibleCount, setVisibleCount] = useState(50);

    useEffect(() => {
        fetch(`${API_URL}/predictions/performance?limit=200`)
            .then(r => r.json())
            .then(d => { if (d.success) setData(d); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Fetch archived trades when requested
    const [archivedLoading, setArchivedLoading] = useState(false);
    const loadArchived = async () => {
        setArchivedLoading(true);
        try {
            const res = await fetch(`${API_URL}/predictions/performance/archived?limit=200`);
            const archived = await res.json();
            if (archived.success) {
                setData(prev => ({
                    ...prev,
                    archivedTrades: archived.trades || [],
                    archivedStats: archived.stats || null,
                    archivedLoaded: true
                }));
            } else {
                setData(prev => ({ ...prev, archivedTrades: [], archivedLoaded: true }));
            }
        } catch (e) {
            console.error('Failed to load archived:', e);
            setData(prev => ({ ...prev, archivedTrades: [], archivedLoaded: true }));
        } finally {
            setArchivedLoading(false);
        }
    };

    if (loading) return <Page><HeaderArea><Title><Activity size={24}/> Loading...</Title></HeaderArea></Page>;
    if (!data) return <Page><HeaderArea><Title>Performance data unavailable</Title></HeaderArea></Page>;

    const { stats, rolling7d, equityCurve, trades, archivedTrades = [], archivedStats } = data;
    const pieData = [{ name: 'Wins', value: stats.wins }, { name: 'Losses', value: stats.losses }];

    let filtered = trades;
    if (tableFilter === 'open') filtered = trades.filter(t => t.status === 'pending');
    else if (tableFilter === 'closed') filtered = trades.filter(t => t.result);
    else if (tableFilter === 'wins') filtered = trades.filter(t => t.result === 'win');
    else if (tableFilter === 'losses') filtered = trades.filter(t => t.result === 'loss');

    if (sortBy === 'pct') filtered = [...filtered].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
    else if (sortBy === 'conf') filtered = [...filtered].sort((a, b) => b.confidence - a.confidence);

    return (
        <Page>
            <SEO title="Live Performance — Nexus Signal" description="Every trade tracked publicly. Wins and losses. Full transparency." />
            <HeaderArea>
                <Title><Activity size={24} color="#00adef"/> Live Performance Tracker</Title>
                <Subtitle>Every trade tracked publicly. No edits. No deletions.</Subtitle>
                <LiveText><LiveDot/> Live tracking enabled — updates every 5 minutes</LiveText>
            </HeaderArea>

            <TransparencyBar>
                <TrustItem><CheckCircle/> Every trade recorded</TrustItem>
                <TrustItem><Shield/> No edits or deletions</TrustItem>
                <TrustItem><Target/> No cherry-picking</TrustItem>
                <TrustItem><Clock/> Tracked in real time</TrustItem>
            </TransparencyBar>

            <StatsGrid>
                <StatCard $d="0s"><StatLabel><Activity size={13}/> Total Trades</StatLabel><StatValue $c="#00adef">{stats.total}</StatValue><StatSub>{stats.active} active now</StatSub></StatCard>
                <StatCard $d=".05s"><StatLabel><TrendingUp size={13}/> Win Rate</StatLabel><StatValue $c={stats.winRate >= 50 ? '#10b981' : '#f59e0b'}>{stats.winRate}%</StatValue><StatSub>{stats.wins}W / {stats.losses}L</StatSub></StatCard>
                <StatCard $d=".1s"><StatLabel><Zap size={13}/> Avg Return</StatLabel><StatValue $c={stats.avgReturn >= 0 ? '#10b981' : '#ef4444'}>{stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn}%</StatValue><StatSub>Per trade</StatSub></StatCard>
                <StatCard $d=".15s"><StatLabel><TrendingUp size={13}/> Total Return</StatLabel><StatValue $c={stats.totalReturn >= 0 ? '#10b981' : '#ef4444'}>{stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn}%</StatValue><StatSub>Cumulative</StatSub></StatCard>
                <StatCard $d=".2s"><StatLabel><Target size={13}/> Edge / Trade</StatLabel><StatValue $c={stats.edge >= 0 ? '#10b981' : '#ef4444'}>{stats.edge >= 0 ? '+' : ''}{stats.edge}%</StatValue><StatSub>Expected value</StatSub></StatCard>
            </StatsGrid>

            {rolling7d.closed > 0 && (
                <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
                    <Badge $bg="rgba(0,173,237,.08)" $c="#00adef" $bc="rgba(0,173,237,.2)">7-Day: {rolling7d.winRate}% win rate</Badge>
                    <Badge $bg="rgba(16,185,129,.08)" $c="#10b981" $bc="rgba(16,185,129,.2)">{rolling7d.wins}W / {rolling7d.losses}L last 7 days</Badge>
                </div>
            )}

            {equityCurve.length > 2 && (
                <Section>
                    <SectionTitle><TrendingUp size={16} color="#10b981"/> Equity Curve</SectionTitle>
                    <Card>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={equityCurve}>
                                <defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                                <XAxis dataKey="date" tick={false} axisLine={false}/>
                                <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`}/>
                                <Tooltip content={<ChartTooltip/>}/>
                                <Area type="monotone" dataKey="cumReturn" stroke="#10b981" strokeWidth={2} fill="url(#eqGrad)" dot={false}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Section>
            )}

            <TwoColGrid>
                <Card style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'1.5rem'}}>
                    <PieChart width={100} height={100}>
                        <Pie data={pieData} cx={50} cy={50} innerRadius={30} outerRadius={45} dataKey="value" strokeWidth={0}>
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                        </Pie>
                    </PieChart>
                    <div>
                        <div style={{fontSize:'.7rem',color:'#64748b',marginBottom:'.25rem'}}>WIN / LOSS</div>
                        <div style={{fontSize:'1.1rem',fontWeight:800}}><span style={{color:'#10b981'}}>{stats.wins}</span> / <span style={{color:'#ef4444'}}>{stats.losses}</span></div>
                    </div>
                </Card>
                <Card>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem'}}>
                        <div><div style={{fontSize:'.65rem',color:'#64748b'}}>AVG WIN</div><div style={{fontSize:'1rem',fontWeight:800,color:'#10b981'}}>+{stats.avgWin}%</div></div>
                        <div><div style={{fontSize:'.65rem',color:'#64748b'}}>AVG LOSS</div><div style={{fontSize:'1rem',fontWeight:800,color:'#ef4444'}}>{stats.avgLoss}%</div></div>
                        <div><div style={{fontSize:'.65rem',color:'#64748b'}}>R:R RATIO</div><div style={{fontSize:'1rem',fontWeight:800,color:'#00adef'}}>1:{stats.avgLoss !== 0 ? Math.abs(stats.avgWin / stats.avgLoss).toFixed(1) : '\u2014'}</div></div>
                        <div><div style={{fontSize:'.65rem',color:'#64748b'}}>EDGE</div><div style={{fontSize:'1rem',fontWeight:800,color:stats.edge >= 0 ? '#10b981' : '#ef4444'}}>+{stats.edge}%</div></div>
                    </div>
                </Card>
            </TwoColGrid>

            <Section>
                <SectionTitle><Clock size={16} color="#00adef"/> Trade History</SectionTitle>
                <FilterRow>
                    {['all','open','closed','wins','losses'].map(f => (
                        <FilterBtn key={f} $active={tableFilter === f} onClick={() => { setTableFilter(f); setShowArchived(false); }}>
                            {f === 'all' ? `All (${trades.length})` : f === 'open' ? `Open (${trades.filter(t=>t.status==='pending').length})` : f === 'closed' ? `Closed (${trades.filter(t=>t.result).length})` : f === 'wins' ? `Wins (${trades.filter(t=>t.result==='win').length})` : `Losses (${trades.filter(t=>t.result==='loss').length})`}
                        </FilterBtn>
                    ))}
                </FilterRow>
                <Card style={{padding:0,overflow:'hidden'}}>
                    <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Symbol</Th>
                                    <Th>Direction</Th>
                                    <Th>Entry</Th>
                                    <Th>Current / Exit</Th>
                                    <Th onClick={() => setSortBy('pct')}>% Change {sortBy === 'pct' && '\u2193'}</Th>
                                    <Th>Status</Th>
                                    <Th onClick={() => setSortBy('conf')}>Confidence {sortBy === 'conf' && '\u2193'}</Th>
                                    <Th onClick={() => setSortBy('time')}>Time {sortBy === 'time' && '\u2193'}</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.slice(0, visibleCount).map((t, i) => {
                                    const isLong = t.direction === 'UP';
                                    const isWin = t.result === 'win';
                                    const isLoss = t.result === 'loss';
                                    const isOpen = t.status === 'pending' || !t.result;
                                    const sym = t.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || t.symbol;

                                    // Use correct price: livePrice for open, resultPrice for closed
                                    const displayPrice = isOpen
                                        ? (t.livePrice || t.currentPrice || t.entryPrice)
                                        : (t.resultPrice || t.exitPrice || t.currentPrice || t.entryPrice);

                                    // Use backend's changePct, or calculate if missing
                                    let pctChange = t.changePct ?? (t.entryPrice > 0
                                        ? ((displayPrice - t.entryPrice) / t.entryPrice * 100)
                                        : 0);

                                    // Safety: ensure LOSS shows negative, WIN shows positive
                                    if (isLoss && pctChange > 0) pctChange = -Math.abs(pctChange);
                                    if (isWin && pctChange < 0) pctChange = Math.abs(pctChange);

                                    // Format to 2 decimals
                                    const displayPct = typeof pctChange === 'number' ? pctChange.toFixed(2) : pctChange;

                                    return (
                                        <Tr key={t._id || i} onClick={() => navigate(`/signal/${t._id}`)}>
                                            <Td style={{fontWeight:700}}>{sym} <span style={{fontSize:'.6rem',color:'#475569'}}>{t.assetType}</span></Td>
                                            <Td><DirBadge $long={isLong}>{isLong ? '\u2191 LONG' : '\u2193 SHORT'}</DirBadge></Td>
                                            <Td>{fmtPrice(t.entryPrice)}</Td>
                                            <Td>{fmtPrice(displayPrice)}</Td>
                                            <Td><PctText $pos={displayPct >= 0}>{displayPct >= 0 ? '+' : ''}{displayPct}%</PctText></Td>
                                            <Td>
                                                {isOpen ? <Badge $bg="rgba(245,158,11,.1)" $c="#f59e0b" $bc="rgba(245,158,11,.2)">OPEN</Badge>
                                                    : isWin ? <Badge $bg="rgba(16,185,129,.1)" $c="#10b981" $bc="rgba(16,185,129,.2)">{t.resultText}</Badge>
                                                    : <Badge $bg="rgba(239,68,68,.08)" $c="#ef4444" $bc="rgba(239,68,68,.15)">{t.resultText}</Badge>}
                                                {t.confidence >= 70 && <Badge $bg="rgba(139,92,246,.1)" $c="#a78bfa" $bc="rgba(139,92,246,.2)" style={{marginLeft:'.3rem'}}>High Conf</Badge>}
                                            </Td>
                                            <Td style={{color:t.confidence >= 70 ? '#10b981' : t.confidence >= 55 ? '#f59e0b' : '#64748b'}}>{t.confidence}%</Td>
                                            <Td style={{color:'#475569',fontSize:'.75rem'}}>{timeAgo(t.resultAt || t.createdAt)}</Td>
                                        </Tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </TableWrap>
                    {/* Show More Button */}
                    {filtered.length > visibleCount && (
                        <div style={{padding:'1rem',textAlign:'center',borderTop:'1px solid rgba(100,116,139,.1)'}}>
                            <FilterBtn $active onClick={() => setVisibleCount(prev => prev + 50)}>
                                Show More ({filtered.length - visibleCount} remaining)
                            </FilterBtn>
                        </div>
                    )}
                </Card>
            </Section>

            {/* Archived Section */}
            <Section>
                <SectionTitle><Filter size={16} color="#64748b"/> Archived Trades</SectionTitle>
                {!showArchived ? (
                    <Card style={{textAlign:'center',padding:'2rem'}}>
                        <p style={{color:'#64748b',fontSize:'.85rem',marginBottom:'1rem'}}>
                            View older trades that have been archived (30+ days old)
                        </p>
                        <FilterBtn $active onClick={() => { setShowArchived(true); loadArchived(); }}>
                            Load Archived Trades
                        </FilterBtn>
                    </Card>
                ) : archivedLoading ? (
                    <Card style={{textAlign:'center',padding:'2rem',color:'#64748b'}}>
                        Loading archived trades...
                    </Card>
                ) : archivedTrades.length > 0 ? (
                    <Card style={{padding:0,overflow:'hidden'}}>
                        {archivedStats && (
                            <div style={{padding:'1rem',borderBottom:'1px solid rgba(100,116,139,.1)',display:'flex',gap:'1rem',flexWrap:'wrap'}}>
                                <Badge $bg="rgba(100,116,139,.1)" $c="#94a3b8">Archived: {archivedTrades.length} trades</Badge>
                                <Badge $bg="rgba(16,185,129,.08)" $c="#10b981">{archivedStats.winRate}% win rate</Badge>
                                <Badge $bg="rgba(0,173,237,.08)" $c="#00adef">+{archivedStats.totalReturn}% total</Badge>
                            </div>
                        )}
                        <TableWrap>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>Symbol</Th>
                                        <Th>Direction</Th>
                                        <Th>Entry</Th>
                                        <Th>Exit</Th>
                                        <Th>% Change</Th>
                                        <Th>Result</Th>
                                        <Th>Date</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivedTrades.map((t, i) => {
                                        const isLong = t.direction === 'UP';
                                        const isWin = t.result === 'win';
                                        const isLoss = t.result === 'loss';
                                        const sym = t.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || t.symbol;
                                        const exitPrice = t.resultPrice || t.exitPrice || t.currentPrice || t.entryPrice;

                                        // Use backend's changePct, or calculate if missing
                                        let archPct = t.changePct ?? (t.entryPrice > 0
                                            ? ((exitPrice - t.entryPrice) / t.entryPrice * 100)
                                            : 0);

                                        // Safety: ensure LOSS shows negative, WIN shows positive
                                        if (isLoss && archPct > 0) archPct = -Math.abs(archPct);
                                        if (isWin && archPct < 0) archPct = Math.abs(archPct);

                                        const displayArchPct = typeof archPct === 'number' ? archPct.toFixed(2) : archPct;

                                        return (
                                            <Tr key={t._id || i} onClick={() => navigate(`/signal/${t._id}`)}>
                                                <Td style={{fontWeight:700}}>{sym}</Td>
                                                <Td><DirBadge $long={isLong}>{isLong ? '\u2191' : '\u2193'}</DirBadge></Td>
                                                <Td>{fmtPrice(t.entryPrice)}</Td>
                                                <Td>{fmtPrice(exitPrice)}</Td>
                                                <Td><PctText $pos={displayArchPct >= 0}>{displayArchPct >= 0 ? '+' : ''}{displayArchPct}%</PctText></Td>
                                                <Td>
                                                    {isWin ? <Badge $bg="rgba(16,185,129,.1)" $c="#10b981">{t.resultText}</Badge>
                                                        : <Badge $bg="rgba(239,68,68,.08)" $c="#ef4444">{t.resultText}</Badge>}
                                                </Td>
                                                <Td style={{color:'#475569',fontSize:'.75rem'}}>{timeAgo(t.resultAt)}</Td>
                                            </Tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </TableWrap>
                    </Card>
                ) : (
                    <Card style={{textAlign:'center',padding:'2rem',color:'#64748b',fontSize:'.85rem'}}>
                        No archived trades yet. Trades older than 30 days will appear here.
                    </Card>
                )}
            </Section>
        </Page>
    );
};

export default LivePerformancePage;
