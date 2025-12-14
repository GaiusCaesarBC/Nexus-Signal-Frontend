// client/src/pages/EarningsCalendarPage.js - Earnings Calendar with AI Predictions

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
    Calendar, TrendingUp, TrendingDown, Clock, ChevronLeft, ChevronRight,
    Sun, Moon, AlertCircle, CheckCircle, XCircle, Star, Filter, Eye,
    BarChart3, DollarSign, Percent, ArrowUpRight, ArrowDownRight,
    CalendarDays, ListFilter, Loader
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

const Controls = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const DateNavigator = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const NavButton = styled.button`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid rgba(0, 173, 237, 0.3);
    background: rgba(0, 173, 237, 0.1);
    color: #00adef;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: scale(1.05);
    }
`;

const CurrentMonth = styled.div`
    font-size: 1.25rem;
    font-weight: 700;
    color: #e0e6ed;
    min-width: 180px;
    text-align: center;
`;

const FilterTabs = styled.div`
    display: flex;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    padding: 0.25rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 173, 237, 0.2);
`;

const FilterTab = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.3)' : 'transparent'};
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        color: #00adef;
    }
`;

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const MainSection = styled.div`
    animation: ${fadeIn} 0.6s ease-out;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out 0.2s both;

    @media (max-width: 1200px) {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
`;

const Card = styled.div`
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    overflow: hidden;
`;

const CardHeader = styled.div`
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const CardTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
`;

const CardBody = styled.div`
    padding: 1rem 1.25rem;
`;

// Calendar Grid
const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    background: rgba(0, 173, 237, 0.1);
    border-radius: 12px;
    overflow: hidden;
`;

const DayHeader = styled.div`
    padding: 0.75rem;
    text-align: center;
    font-weight: 700;
    font-size: 0.8rem;
    color: #00adef;
    background: rgba(30, 41, 59, 0.95);
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const DayCell = styled.div`
    min-height: 120px;
    padding: 0.5rem;
    background: ${props => props.$isToday
        ? 'rgba(0, 173, 237, 0.15)'
        : props.$isCurrentMonth
            ? 'rgba(30, 41, 59, 0.95)'
            : 'rgba(15, 23, 42, 0.95)'
    };
    border: ${props => props.$isToday ? '2px solid rgba(0, 173, 237, 0.5)' : 'none'};
    position: relative;
    cursor: ${props => props.$hasEarnings ? 'pointer' : 'default'};
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$hasEarnings ? 'rgba(0, 173, 237, 0.2)' : ''};
    }

    @media (max-width: 768px) {
        min-height: 80px;
    }
`;

const DayNumber = styled.div`
    font-size: 0.9rem;
    font-weight: ${props => props.$isToday ? '700' : '500'};
    color: ${props => props.$isToday
        ? '#00adef'
        : props.$isCurrentMonth
            ? '#e0e6ed'
            : '#64748b'
    };
    margin-bottom: 0.5rem;
`;

const EarningsDot = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
`;

const EarningPill = styled.div`
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    background: ${props => {
        if (props.$beat) return 'rgba(16, 185, 129, 0.3)';
        if (props.$miss) return 'rgba(239, 68, 68, 0.3)';
        if (props.$pending) return 'rgba(245, 158, 11, 0.3)';
        return 'rgba(0, 173, 237, 0.3)';
    }};
    color: ${props => {
        if (props.$beat) return '#10b981';
        if (props.$miss) return '#ef4444';
        if (props.$pending) return '#f59e0b';
        return '#00adef';
    }};
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
`;

const TimingIcon = styled.span`
    font-size: 0.6rem;
`;

// Stats Cards
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
`;

const StatCard = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$color || '#00adef'};
`;

const StatLabel = styled.div`
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.25rem;
`;

// Earnings List
const EarningsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
        border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.3);
        border-radius: 3px;
    }
`;

const EarningsItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        transform: translateX(5px);
    }
`;

const EarningsSymbol = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 1rem;
`;

const EarningsTime = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #94a3b8;
`;

const EarningsEstimate = styled.div`
    text-align: right;
`;

const EstimateValue = styled.div`
    font-weight: 600;
    color: #e0e6ed;
    font-size: 0.9rem;
`;

const EstimateLabel = styled.div`
    font-size: 0.7rem;
    color: #64748b;
`;

const SurpriseBadge = styled.span`
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-weight: 600;
    background: ${props => props.$positive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

// Loading & Empty States
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #00adef;
`;

const Spinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid rgba(0, 173, 237, 0.2);
    border-top-color: #00adef;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: 1rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: #94a3b8;
`;

// Modal for details
const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
    background: rgba(30, 41, 59, 0.98);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    padding: 1.25rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ModalTitle = styled.h2`
    color: #00adef;
    font-size: 1.5rem;
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        color: #00adef;
    }
`;

const ModalBody = styled.div`
    padding: 1.25rem;
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);

    &:last-child {
        border-bottom: none;
    }
`;

const DetailLabel = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const DetailValue = styled.span`
    color: #e0e6ed;
    font-weight: 600;
`;

const ViewStockButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    border: none;
    border-radius: 10px;
    color: #0f172a;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.4);
    }
`;

const EarningsCalendarPage = () => {
    const navigate = useNavigate();
    const { api } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [calendarData, setCalendarData] = useState([]);
    const [summary, setSummary] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filter, setFilter] = useState('all'); // all, today, watchlist
    const [selectedEarning, setSelectedEarning] = useState(null);
    const [watchlistEarnings, setWatchlistEarnings] = useState([]);

    // Calculate the month's date range
    const getMonthRange = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return {
            from: firstDay.toISOString().split('T')[0],
            to: lastDay.toISOString().split('T')[0]
        };
    };

    // Fetch calendar data
    const fetchCalendar = async () => {
        try {
            setLoading(true);
            const { from, to } = getMonthRange(currentDate);

            const response = await api.get(`/earnings/calendar?from=${from}&to=${to}`);

            if (response.data.success) {
                setCalendarData(response.data.calendar || []);
                setSummary(response.data.summary || {});
            }
        } catch (error) {
            console.error('Error fetching earnings calendar:', error);
            toast.error('Failed to load earnings calendar');
        } finally {
            setLoading(false);
        }
    };

    // Fetch watchlist earnings
    const fetchWatchlistEarnings = async () => {
        try {
            const response = await api.get('/earnings/watchlist');
            if (response.data.success) {
                setWatchlistEarnings(response.data.earnings || []);
            }
        } catch (error) {
            console.error('Error fetching watchlist earnings:', error);
        }
    };

    useEffect(() => {
        fetchCalendar();
        fetchWatchlistEarnings();
    }, [currentDate]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days = [];

        // Previous month days
        const prevMonth = new Date(year, month, 0);
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonth.getDate() - i),
                isCurrentMonth: false
            });
        }

        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }

        // Next month days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }

        return days;
    }, [currentDate]);

    // Get earnings for a specific date
    const getEarningsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayData = calendarData.find(d => d.date === dateStr);
        return dayData?.earnings || [];
    };

    // Today's date string
    const todayStr = new Date().toISOString().split('T')[0];

    // Get today's earnings
    const todaysEarnings = useMemo(() => {
        const today = calendarData.find(d => d.date === todayStr);
        return today?.earnings || [];
    }, [calendarData, todayStr]);

    // Get upcoming earnings (next 7 days)
    const upcomingEarnings = useMemo(() => {
        const upcoming = [];
        const today = new Date();
        for (const day of calendarData) {
            const dayDate = new Date(day.date);
            const diffDays = Math.ceil((dayDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 7) {
                upcoming.push(...day.earnings.map(e => ({ ...e, date: day.date })));
            }
        }
        return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [calendarData]);

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const getTimingIcon = (hour) => {
        switch (hour) {
            case 'bmo': return <Sun size={10} />;
            case 'amc': return <Moon size={10} />;
            default: return <Clock size={10} />;
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <Spinner />
                    <div>Loading earnings calendar...</div>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>
                    <CalendarDays size={36} />
                    Earnings Calendar
                </Title>
                <Subtitle>Track upcoming earnings reports and surprises</Subtitle>
            </Header>

            <Controls>
                <DateNavigator>
                    <NavButton onClick={() => navigateMonth(-1)}>
                        <ChevronLeft size={20} />
                    </NavButton>
                    <CurrentMonth>{formatMonthYear(currentDate)}</CurrentMonth>
                    <NavButton onClick={() => navigateMonth(1)}>
                        <ChevronRight size={20} />
                    </NavButton>
                    <NavButton onClick={() => setCurrentDate(new Date())} title="Today">
                        <Calendar size={18} />
                    </NavButton>
                </DateNavigator>

                <FilterTabs>
                    <FilterTab $active={filter === 'all'} onClick={() => setFilter('all')}>
                        <CalendarDays size={14} /> All
                    </FilterTab>
                    <FilterTab $active={filter === 'today'} onClick={() => setFilter('today')}>
                        <Clock size={14} /> Today ({todaysEarnings.length})
                    </FilterTab>
                    <FilterTab $active={filter === 'watchlist'} onClick={() => setFilter('watchlist')}>
                        <Star size={14} /> Watchlist ({watchlistEarnings.length})
                    </FilterTab>
                </FilterTabs>
            </Controls>

            <Content>
                <MainSection>
                    <Card>
                        <CalendarGrid>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <DayHeader key={day}>{day}</DayHeader>
                            ))}
                            {calendarDays.map((day, index) => {
                                const dateStr = day.date.toISOString().split('T')[0];
                                const isToday = dateStr === todayStr;
                                const earnings = getEarningsForDate(day.date);
                                const hasEarnings = earnings.length > 0;

                                return (
                                    <DayCell
                                        key={index}
                                        $isCurrentMonth={day.isCurrentMonth}
                                        $isToday={isToday}
                                        $hasEarnings={hasEarnings}
                                        onClick={() => hasEarnings && setSelectedEarning({
                                            date: dateStr,
                                            earnings
                                        })}
                                    >
                                        <DayNumber
                                            $isCurrentMonth={day.isCurrentMonth}
                                            $isToday={isToday}
                                        >
                                            {day.date.getDate()}
                                        </DayNumber>
                                        <EarningsDot>
                                            {earnings.slice(0, 4).map((e, i) => (
                                                <EarningPill
                                                    key={i}
                                                    $beat={e.epsActual > e.epsEstimate}
                                                    $miss={e.epsActual && e.epsActual < e.epsEstimate}
                                                    $pending={!e.epsActual}
                                                    title={`${e.symbol} - ${e.hourLabel}`}
                                                >
                                                    <TimingIcon>{getTimingIcon(e.hour)}</TimingIcon>
                                                    {e.symbol}
                                                </EarningPill>
                                            ))}
                                            {earnings.length > 4 && (
                                                <EarningPill>+{earnings.length - 4}</EarningPill>
                                            )}
                                        </EarningsDot>
                                    </DayCell>
                                );
                            })}
                        </CalendarGrid>
                    </Card>
                </MainSection>

                <Sidebar>
                    {/* Summary Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle><BarChart3 size={18} /> Month Summary</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <StatsGrid>
                                <StatCard>
                                    <StatValue>{summary.totalEarnings || 0}</StatValue>
                                    <StatLabel>Total Reports</StatLabel>
                                </StatCard>
                                <StatCard>
                                    <StatValue $color="#f59e0b">{summary.upcomingCount || 0}</StatValue>
                                    <StatLabel>Upcoming</StatLabel>
                                </StatCard>
                                <StatCard>
                                    <StatValue $color="#10b981">{summary.beatCount || 0}</StatValue>
                                    <StatLabel>Beat EPS</StatLabel>
                                </StatCard>
                                <StatCard>
                                    <StatValue $color="#ef4444">{summary.missCount || 0}</StatValue>
                                    <StatLabel>Missed EPS</StatLabel>
                                </StatCard>
                            </StatsGrid>
                        </CardBody>
                    </Card>

                    {/* Upcoming Earnings */}
                    <Card>
                        <CardHeader>
                            <CardTitle><Clock size={18} /> Next 7 Days</CardTitle>
                        </CardHeader>
                        <CardBody>
                            {upcomingEarnings.length > 0 ? (
                                <EarningsList>
                                    {upcomingEarnings.slice(0, 10).map((e, i) => (
                                        <EarningsItem
                                            key={i}
                                            onClick={() => navigate(`/stock/${e.symbol}`)}
                                        >
                                            <div>
                                                <EarningsSymbol>{e.symbol}</EarningsSymbol>
                                                <EarningsTime>
                                                    {getTimingIcon(e.hour)}
                                                    {e.date} • {e.hourLabel}
                                                </EarningsTime>
                                            </div>
                                            <EarningsEstimate>
                                                {e.epsEstimate ? (
                                                    <>
                                                        <EstimateValue>${e.epsEstimate?.toFixed(2)}</EstimateValue>
                                                        <EstimateLabel>EPS Est.</EstimateLabel>
                                                    </>
                                                ) : (
                                                    <EstimateLabel>No estimate</EstimateLabel>
                                                )}
                                            </EarningsEstimate>
                                        </EarningsItem>
                                    ))}
                                </EarningsList>
                            ) : (
                                <EmptyState>No upcoming earnings this week</EmptyState>
                            )}
                        </CardBody>
                    </Card>

                    {/* Watchlist Earnings */}
                    {watchlistEarnings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle><Star size={18} color="#f59e0b" /> Watchlist Earnings</CardTitle>
                            </CardHeader>
                            <CardBody>
                                <EarningsList>
                                    {watchlistEarnings.slice(0, 5).map((e, i) => (
                                        <EarningsItem
                                            key={i}
                                            onClick={() => navigate(`/stock/${e.symbol}`)}
                                        >
                                            <div>
                                                <EarningsSymbol>{e.symbol}</EarningsSymbol>
                                                <EarningsTime>
                                                    {getTimingIcon(e.hour)}
                                                    {e.date} • {e.hourLabel}
                                                </EarningsTime>
                                            </div>
                                            <EarningsEstimate>
                                                <EstimateValue>Q{e.quarter} {e.year}</EstimateValue>
                                                <EstimateLabel>Reporting</EstimateLabel>
                                            </EarningsEstimate>
                                        </EarningsItem>
                                    ))}
                                </EarningsList>
                            </CardBody>
                        </Card>
                    )}
                </Sidebar>
            </Content>

            {/* Earnings Detail Modal */}
            {selectedEarning && (
                <ModalOverlay onClick={() => setSelectedEarning(null)}>
                    <Modal onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>
                                Earnings on {new Date(selectedEarning.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </ModalTitle>
                            <CloseButton onClick={() => setSelectedEarning(null)}>×</CloseButton>
                        </ModalHeader>
                        <ModalBody>
                            <EarningsList style={{ maxHeight: '60vh' }}>
                                {selectedEarning.earnings.map((e, i) => (
                                    <EarningsItem
                                        key={i}
                                        onClick={() => {
                                            setSelectedEarning(null);
                                            navigate(`/stock/${e.symbol}`);
                                        }}
                                    >
                                        <div>
                                            <EarningsSymbol>{e.symbol}</EarningsSymbol>
                                            <EarningsTime>
                                                {getTimingIcon(e.hour)}
                                                {e.hourLabel} • Q{e.quarter} {e.year}
                                            </EarningsTime>
                                        </div>
                                        <EarningsEstimate>
                                            {e.epsActual ? (
                                                <SurpriseBadge $positive={parseFloat(e.surprise) > 0}>
                                                    {parseFloat(e.surprise) > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                    {e.surprise}%
                                                </SurpriseBadge>
                                            ) : e.epsEstimate ? (
                                                <>
                                                    <EstimateValue>${e.epsEstimate?.toFixed(2)}</EstimateValue>
                                                    <EstimateLabel>Est. EPS</EstimateLabel>
                                                </>
                                            ) : (
                                                <EstimateLabel>Pending</EstimateLabel>
                                            )}
                                        </EarningsEstimate>
                                    </EarningsItem>
                                ))}
                            </EarningsList>
                        </ModalBody>
                    </Modal>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default EarningsCalendarPage;
