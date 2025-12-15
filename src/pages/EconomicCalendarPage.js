// client/src/pages/EconomicCalendarPage.js - Economic Calendar

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import {
    Calendar, Clock, AlertTriangle, TrendingUp, TrendingDown,
    ChevronLeft, ChevronRight, Filter, RefreshCw, Loader,
    Globe, DollarSign, Building2, Users, ShoppingCart, Factory,
    Home, BarChart3, Zap, Bell, Info, Circle
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
    50% { opacity: 0.6; }
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
    background: linear-gradient(135deg, #00adef 0%, #ffc107 50%, #00ff88 100%);
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

const UpcomingSection = styled.div`
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(0, 173, 237, 0.1) 100%);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;
`;

const UpcomingHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    h2 {
        color: #ffc107;
        font-size: 1.2rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

const UpcomingEvents = styled.div`
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
        height: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 193, 7, 0.5);
        border-radius: 3px;
    }
`;

const UpcomingCard = styled.div`
    min-width: 200px;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(255, 193, 7, 0.2);
    border-radius: 12px;
    padding: 1rem;
    flex-shrink: 0;

    .event-name {
        font-weight: 600;
        color: #e0e6ed;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }

    .event-date {
        color: #ffc107;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .event-time {
        color: #94a3b8;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

const ControlsRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
    animation: ${fadeIn} 0.5s ease-out 0.2s both;
`;

const ViewToggle = styled.div`
    display: flex;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.8);
    padding: 0.5rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 173, 237, 0.2);
`;

const ToggleButton = styled.button`
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
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.$active ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'rgba(0, 173, 237, 0.2)'};
        color: ${props => props.$active ? 'white' : '#00adef'};
    }
`;

const Filters = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const FilterSelect = styled.select`
    padding: 0.75rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 8px;
    color: #e0e6ed;
    font-size: 0.9rem;
    cursor: pointer;
    outline: none;

    &:focus {
        border-color: #00adef;
    }

    option {
        background: #1e293b;
    }
`;

const RefreshButton = styled.button`
    padding: 0.75rem 1rem;
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

    svg {
        animation: ${props => props.$loading ? spin : 'none'} 1s linear infinite;
    }
`;

const WeekNavigation = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    button {
        padding: 0.5rem;
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(0, 173, 237, 0.3);
        border-radius: 8px;
        color: #00adef;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.2s ease;

        &:hover {
            background: rgba(0, 173, 237, 0.2);
        }
    }

    span {
        color: #e0e6ed;
        font-weight: 600;
    }
`;

const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    animation: ${fadeIn} 0.5s ease-out 0.3s both;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const DayCard = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid ${props => props.$isToday ? '#00adef' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 12px;
    min-height: 200px;
    overflow: hidden;

    ${props => props.$isToday && `
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.3);
    `}
`;

const DayHeader = styled.div`
    background: ${props => props.$isToday ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'rgba(0, 173, 237, 0.1)'};
    padding: 0.75rem;
    text-align: center;

    .day-name {
        font-size: 0.75rem;
        color: ${props => props.$isToday ? 'rgba(255, 255, 255, 0.8)' : '#64748b'};
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .day-date {
        font-size: 1.25rem;
        font-weight: 700;
        color: ${props => props.$isToday ? 'white' : '#e0e6ed'};
    }
`;

const DayEvents = styled.div`
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 300px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.3);
        border-radius: 2px;
    }
`;

const EventItem = styled.div`
    background: ${props =>
        props.$impact === 'high' ? 'rgba(255, 71, 87, 0.15)' :
        props.$impact === 'medium' ? 'rgba(255, 193, 7, 0.15)' :
        'rgba(100, 116, 139, 0.15)'
    };
    border-left: 3px solid ${props =>
        props.$impact === 'high' ? '#ff4757' :
        props.$impact === 'medium' ? '#ffc107' :
        '#64748b'
    };
    border-radius: 0 8px 8px 0;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateX(2px);
        background: ${props =>
            props.$impact === 'high' ? 'rgba(255, 71, 87, 0.25)' :
            props.$impact === 'medium' ? 'rgba(255, 193, 7, 0.25)' :
            'rgba(100, 116, 139, 0.25)'
        };
    }

    .event-time {
        font-size: 0.7rem;
        color: #64748b;
        margin-bottom: 0.25rem;
    }

    .event-name {
        font-size: 0.8rem;
        font-weight: 600;
        color: #e0e6ed;
        line-height: 1.3;
    }

    .event-country {
        font-size: 0.7rem;
        color: #94a3b8;
        margin-top: 0.25rem;
    }
`;

const ListView = styled.div`
    animation: ${fadeIn} 0.5s ease-out 0.3s both;
`;

const ListSection = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;
`;

const ListSectionHeader = styled.div`
    background: rgba(0, 173, 237, 0.1);
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);

    .date {
        font-weight: 700;
        color: #e0e6ed;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .count {
        background: rgba(0, 173, 237, 0.2);
        color: #00adef;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
    }
`;

const ListItem = styled.div`
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    align-items: center;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: rgba(0, 173, 237, 0.05);
    }

    .time {
        color: #64748b;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .details {
        .name {
            font-weight: 600;
            color: #e0e6ed;
            margin-bottom: 0.25rem;
        }

        .meta {
            display: flex;
            gap: 1rem;
            font-size: 0.8rem;
            color: #94a3b8;
        }
    }
`;

const ImpactBadge = styled.span`
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    background: ${props =>
        props.$impact === 'high' ? 'rgba(255, 71, 87, 0.2)' :
        props.$impact === 'medium' ? 'rgba(255, 193, 7, 0.2)' :
        'rgba(100, 116, 139, 0.2)'
    };
    color: ${props =>
        props.$impact === 'high' ? '#ff4757' :
        props.$impact === 'medium' ? '#ffc107' :
        '#94a3b8'
    };
`;

const CategoryIcon = ({ category }) => {
    const icons = {
        central_bank: Building2,
        inflation: TrendingUp,
        employment: Users,
        gdp: BarChart3,
        consumer: ShoppingCart,
        manufacturing: Factory,
        housing: Home,
        trade: Globe,
        services: Zap
    };
    const Icon = icons[category] || DollarSign;
    return <Icon size={14} />;
};

const NoEvents = styled.div`
    text-align: center;
    padding: 2rem;
    color: #64748b;
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

const Legend = styled.div`
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    animation: ${fadeIn} 0.5s ease-out 0.25s both;
`;

const LegendItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #94a3b8;

    .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${props => props.$color};
    }
`;

// ============ COMPONENT ============
const EconomicCalendarPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [view, setView] = useState('week');
    const [loading, setLoading] = useState(true);
    const [weekData, setWeekData] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
    const [impactFilter, setImpactFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, currentWeekOffset]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Calculate date range for the week
            const today = new Date();
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + (currentWeekOffset * 7));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const [weekRes, upcomingRes] = await Promise.all([
                api.get('/economic-calendar/events', {
                    params: {
                        startDate: startOfWeek.toISOString().split('T')[0],
                        endDate: endOfWeek.toISOString().split('T')[0]
                    }
                }),
                api.get('/economic-calendar/upcoming')
            ]);

            // Group events by day
            const eventsByDay = {};
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                eventsByDay[dayNames[i]] = {
                    date: dateStr,
                    dayName: dayNames[i],
                    events: (weekRes.data?.events || []).filter(e => e.date === dateStr)
                };
            }

            setWeekData({
                weekOf: startOfWeek.toISOString().split('T')[0],
                eventsByDay
            });

            setUpcomingEvents(upcomingRes.data?.events || []);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            showToast('Failed to fetch economic calendar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatWeekRange = () => {
        if (!weekData?.eventsByDay) return '';
        const days = Object.values(weekData.eventsByDay);
        const start = new Date(days[0]?.date);
        const end = new Date(days[6]?.date);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const isToday = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        return dateStr === today;
    };

    const filterEvents = (events) => {
        return events.filter(e => {
            if (impactFilter !== 'all' && e.impact !== impactFilter) return false;
            if (countryFilter !== 'all' && e.country !== countryFilter) return false;
            return true;
        });
    };

    const renderWeekView = () => {
        if (!weekData?.eventsByDay) return null;

        return (
            <CalendarGrid>
                {Object.entries(weekData.eventsByDay).map(([dayName, dayData]) => {
                    const filteredEvents = filterEvents(dayData.events || []);
                    const today = isToday(dayData.date);

                    return (
                        <DayCard key={dayName} $isToday={today}>
                            <DayHeader $isToday={today}>
                                <div className="day-name">{dayName.slice(0, 3)}</div>
                                <div className="day-date">{new Date(dayData.date).getDate()}</div>
                            </DayHeader>
                            <DayEvents>
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((event, i) => (
                                        <EventItem key={i} $impact={event.impact}>
                                            {event.time && <div className="event-time">{event.time}</div>}
                                            <div className="event-name">{event.name}</div>
                                            <div className="event-country">{event.country}</div>
                                        </EventItem>
                                    ))
                                ) : (
                                    <NoEvents>No events</NoEvents>
                                )}
                            </DayEvents>
                        </DayCard>
                    );
                })}
            </CalendarGrid>
        );
    };

    const renderListView = () => {
        if (!weekData?.eventsByDay) return null;

        return (
            <ListView>
                {Object.entries(weekData.eventsByDay).map(([dayName, dayData]) => {
                    const filteredEvents = filterEvents(dayData.events || []);
                    if (filteredEvents.length === 0) return null;

                    return (
                        <ListSection key={dayName}>
                            <ListSectionHeader>
                                <span className="date">
                                    <Calendar size={18} />
                                    {dayName}, {formatDate(dayData.date)}
                                    {isToday(dayData.date) && <ImpactBadge $impact="high">TODAY</ImpactBadge>}
                                </span>
                                <span className="count">{filteredEvents.length} events</span>
                            </ListSectionHeader>
                            {filteredEvents.map((event, i) => (
                                <ListItem key={i}>
                                    <div className="time">{event.time || 'TBD'}</div>
                                    <div className="details">
                                        <div className="name">
                                            <CategoryIcon category={event.category} /> {event.name}
                                        </div>
                                        <div className="meta">
                                            <span>{event.country}</span>
                                            <span>{event.category?.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    <ImpactBadge $impact={event.impact}>{event.impact}</ImpactBadge>
                                </ListItem>
                            ))}
                        </ListSection>
                    );
                })}
            </ListView>
        );
    };

    return (
        <PageContainer>
            <Header>
                <Title>
                    <Calendar size={32} />
                    Economic Calendar
                </Title>
                <Subtitle>Track market-moving economic events and central bank decisions</Subtitle>
            </Header>

            <Content>
                {/* Upcoming High-Impact Events */}
                {upcomingEvents.length > 0 && (
                    <UpcomingSection>
                        <UpcomingHeader>
                            <h2><Bell size={20} /> Upcoming High-Impact Events</h2>
                        </UpcomingHeader>
                        <UpcomingEvents>
                            {upcomingEvents.slice(0, 5).map((event, i) => (
                                <UpcomingCard key={i}>
                                    <div className="event-name">{event.name}</div>
                                    <div className="event-date">
                                        <Calendar size={14} />
                                        {formatDate(event.date)}
                                    </div>
                                    {event.time && (
                                        <div className="event-time">
                                            <Clock size={14} />
                                            {event.time} ET
                                        </div>
                                    )}
                                </UpcomingCard>
                            ))}
                        </UpcomingEvents>
                    </UpcomingSection>
                )}

                {/* Legend */}
                <Legend>
                    <LegendItem $color="#ff4757">
                        <div className="dot" />
                        High Impact
                    </LegendItem>
                    <LegendItem $color="#ffc107">
                        <div className="dot" />
                        Medium Impact
                    </LegendItem>
                    <LegendItem $color="#64748b">
                        <div className="dot" />
                        Low Impact
                    </LegendItem>
                </Legend>

                {/* Controls */}
                <ControlsRow>
                    <ViewToggle>
                        <ToggleButton $active={view === 'week'} onClick={() => setView('week')}>
                            <Calendar size={16} /> Week
                        </ToggleButton>
                        <ToggleButton $active={view === 'list'} onClick={() => setView('list')}>
                            <BarChart3 size={16} /> List
                        </ToggleButton>
                    </ViewToggle>

                    <WeekNavigation>
                        <button onClick={() => setCurrentWeekOffset(prev => prev - 1)}>
                            <ChevronLeft size={20} />
                        </button>
                        <span>{formatWeekRange()}</span>
                        <button onClick={() => setCurrentWeekOffset(prev => prev + 1)}>
                            <ChevronRight size={20} />
                        </button>
                        {currentWeekOffset !== 0 && (
                            <button onClick={() => setCurrentWeekOffset(0)} style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}>
                                Today
                            </button>
                        )}
                    </WeekNavigation>

                    <Filters>
                        <FilterSelect value={impactFilter} onChange={(e) => setImpactFilter(e.target.value)}>
                            <option value="all">All Impact</option>
                            <option value="high">High Only</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </FilterSelect>
                        <FilterSelect value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                            <option value="all">All Countries</option>
                            <option value="US">United States</option>
                            <option value="EU">Europe</option>
                            <option value="UK">United Kingdom</option>
                            <option value="JP">Japan</option>
                        </FilterSelect>
                        <RefreshButton onClick={fetchData} $loading={loading}>
                            <RefreshCw size={16} />
                        </RefreshButton>
                    </Filters>
                </ControlsRow>

                {/* Main Content */}
                {loading ? (
                    <LoadingContainer>
                        <Loader size={48} />
                        <p>Loading economic calendar...</p>
                    </LoadingContainer>
                ) : (
                    <>
                        {view === 'week' && renderWeekView()}
                        {view === 'list' && renderListView()}
                    </>
                )}
            </Content>
        </PageContainer>
    );
};

export default EconomicCalendarPage;
