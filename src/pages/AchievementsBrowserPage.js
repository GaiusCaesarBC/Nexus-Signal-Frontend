// client/src/pages/AchievementsBrowserPage.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { 
    Award, Lock, Star, TrendingUp, CheckCircle, Trophy, 
    Filter, Search, Grid, List, ChevronDown, Target,
    Zap, Users, Calendar, Sparkles, Brain, DollarSign
} from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const shake = keyframes`
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============================================
// MAIN CONTAINER
// ============================================
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    position: relative;
    overflow: hidden;

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

// ============================================
// HEADER
// ============================================
const Header = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const TitleIcon = styled.div`
    animation: ${rotate} 3s linear infinite;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    margin: 0;
`;

const StatsRow = styled.div`
    display: flex;
    gap: 1.5rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.15) 0%, rgba(0, 173, 237, 0.05) 100%);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
        border-color: rgba(0, 173, 237, 0.5);
    }
`;

const StatIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${props => {
        if (props.$variant === 'gold') return 'linear-gradient(135deg, #f59e0b, #d97706)';
        if (props.$variant === 'blue') return 'linear-gradient(135deg, #3b82f6, #2563eb)';
        if (props.$variant === 'green') return 'linear-gradient(135deg, #10b981, #059669)';
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const StatInfo = styled.div``;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
    color: #e0e6ed;
    font-size: 1.8rem;
    font-weight: 900;
`;

// ============================================
// FILTERS & CONTROLS
// ============================================
const ControlsBar = styled.div`
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
    animation: ${fadeIn} 0.8s ease-out;
`;

const SearchBox = styled.div`
    flex: 1;
    min-width: 250px;
    position: relative;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 0.95rem;

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

const FilterGroup = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const FilterButton = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%)' : 
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 10px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
        transform: translateY(-2px);
    }
`;

const ViewToggle = styled.div`
    display: flex;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    overflow: hidden;
`;

const ViewButton = styled.button`
    padding: 0.75rem 1rem;
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.2)' : 'transparent'};
    border: none;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        color: #00adef;
    }
`;

const CategoryTabs = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 2px;
    }
`;

const CategoryTab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%)' : 
        'rgba(30, 41, 59, 0.8)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(0, 173, 237, 0.2)'};
    border-radius: 10px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
    }
`;

// ============================================
// ACHIEVEMENTS GRID
// ============================================
const AchievementsGrid = styled.div`
    display: grid;
    grid-template-columns: ${props => props.$view === 'grid' ? 
        'repeat(auto-fill, minmax(320px, 1fr))' : 
        '1fr'
    };
    gap: 1.5rem;
    animation: ${fadeIn} 1s ease-out;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const AchievementCard = styled.div`
    background: ${props => {
        if (!props.$unlocked) return 'rgba(30, 41, 59, 0.5)';
        if (props.$rarity === 'legendary') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))';
        if (props.$rarity === 'epic') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))';
        if (props.$rarity === 'rare') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))';
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))';
    }};
    border: 2px solid ${props => {
        if (!props.$unlocked) return 'rgba(100, 116, 139, 0.3)';
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.5)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.5)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.5)';
        return 'rgba(16, 185, 129, 0.5)';
    }};
    border-radius: 16px;
    padding: ${props => props.$view === 'list' ? '1.5rem' : '2rem'};
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    opacity: ${props => props.$unlocked ? 1 : 0.6};
    display: ${props => props.$view === 'list' ? 'flex' : 'block'};
    align-items: ${props => props.$view === 'list' ? 'center' : 'stretch'};
    gap: ${props => props.$view === 'list' ? '1.5rem' : '0'};

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 40px ${props => {
            if (!props.$unlocked) return 'rgba(100, 116, 139, 0.2)';
            if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.4)';
            if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.4)';
            if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.4)';
            return 'rgba(16, 185, 129, 0.4)';
        }};
      ${props => !props.$unlocked && css`
    animation: ${shake} 0.5s ease-in-out;
`}
    }

   ${props => props.$unlocked && css`
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }
`}
`;

const CardHeader = styled.div`
    display: flex;
    align-items: start;
    gap: 1rem;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
`;

const IconContainer = styled.div`
    width: ${props => props.$view === 'list' ? '70px' : '80px'};
    height: ${props => props.$view === 'list' ? '70px' : '80px'};
    border-radius: 16px;
    background: ${props => {
        if (!props.$unlocked) return 'rgba(100, 116, 139, 0.3)';
        if (props.$rarity === 'legendary') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1))';
        if (props.$rarity === 'epic') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.1))';
        if (props.$rarity === 'rare') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1))';
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    flex-shrink: 0;
    position: relative;
    box-shadow: ${props => props.$unlocked ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none'};

    ${props => props.$unlocked && css`
    animation: ${pulse} 2s ease-in-out infinite;
`}
`;

const LockedOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 16px;
    z-index: 1;
`;

const CardContent = styled.div`
    flex: 1;
    position: relative;
    z-index: 1;
`;

const CardTitle = styled.div`
    font-size: ${props => props.$view === 'list' ? '1.3rem' : '1.2rem'};
    font-weight: 900;
    color: ${props => props.$unlocked ? '#e0e6ed' : '#64748b'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const RarityBadge = styled.span`
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    background: ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.3)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.3)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.3)';
        return 'rgba(16, 185, 129, 0.3)';
    }};
    color: ${props => {
        if (props.$rarity === 'legendary') return '#f59e0b';
        if (props.$rarity === 'epic') return '#a78bfa';
        if (props.$rarity === 'rare') return '#60a5fa';
        return '#10b981';
    }};
    border: 1px solid ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.5)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.5)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.5)';
        return 'rgba(16, 185, 129, 0.5)';
    }};
`;

const CategoryBadge = styled.span`
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    background: rgba(0, 173, 237, 0.2);
    color: #00adef;
    border: 1px solid rgba(0, 173, 237, 0.3);
`;

const CardDescription = styled.div`
    font-size: 0.95rem;
    color: ${props => props.$unlocked ? '#94a3b8' : '#64748b'};
    line-height: 1.6;
    margin-bottom: 1rem;
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
`;

const PointsBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
    font-size: 0.9rem;
`;

const UnlockedDate = styled.div`
    font-size: 0.8rem;
    color: #10b981;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
`;

const RequirementText = styled.div`
    font-size: 0.85rem;
    color: #64748b;
    font-style: italic;
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
    font-size: 1.2rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.div`
    font-size: 0.95rem;
    color: #64748b;
`;

// ============================================
// COMPONENT
// ============================================
const AchievementsBrowserPage = () => {
    const { api } = useAuth();
    const { gamificationData } = useGamification();
    
    const [allAchievements, setAllAchievements] = useState([]);
    const [filteredAchievements, setFilteredAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    const categories = [
        { id: 'all', name: 'All', icon: Grid },
        { id: 'trading', name: 'Trading', icon: TrendingUp },
        { id: 'profit', name: 'Profit', icon: DollarSign },
        { id: 'portfolio', name: 'Portfolio', icon: Target },
        { id: 'predictions', name: 'Predictions', icon: Brain },
        { id: 'streaks', name: 'Streaks', icon: Zap },
        { id: 'milestones', name: 'Milestones', icon: Trophy },
        { id: 'skill', name: 'Skill', icon: Award },
        { id: 'mastery', name: 'Mastery', icon: Star },
        { id: 'special', name: 'Special', icon: Sparkles },
        { id: 'social', name: 'Social', icon: Users },
        { id: 'time_based', name: 'Time', icon: Calendar },
    ];

    useEffect(() => {
        fetchAchievements();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, rarityFilter, statusFilter, categoryFilter, allAchievements]);

    const fetchAchievements = async () => {
        try {
            const response = await api.get('/gamification/achievements');
            if (response.data.success) {
                setAllAchievements(response.data.achievements);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allAchievements];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(ach => 
                ach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ach.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Rarity filter
        if (rarityFilter !== 'all') {
            filtered = filtered.filter(ach => ach.rarity === rarityFilter);
        }

        // Status filter
        if (statusFilter === 'unlocked') {
            filtered = filtered.filter(ach => ach.unlocked);
        } else if (statusFilter === 'locked') {
            filtered = filtered.filter(ach => !ach.unlocked);
        }

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(ach => ach.category === categoryFilter);
        }

        setFilteredAchievements(filtered);
    };

    const getStats = () => {
        const unlocked = allAchievements.filter(a => a.unlocked).length;
        const total = allAchievements.length;
        const totalPoints = allAchievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);
        const possiblePoints = allAchievements.reduce((sum, a) => sum + a.points, 0);

        return { unlocked, total, totalPoints, possiblePoints };
    };

    const stats = getStats();
    const progressPercent = stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0;

    if (loading) {
        return (
            <PageContainer>
                <ContentWrapper>
                    <EmptyState>
                        <EmptyIcon>
                            <Award size={60} />
                        </EmptyIcon>
                        <EmptyText>Loading achievements...</EmptyText>
                    </EmptyState>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentWrapper>
                <Header>
                    <TitleRow>
                        <Title>
                            <TitleIcon>
                                <Trophy size={48} />
                            </TitleIcon>
                            Achievement Browser
                        </Title>
                    </TitleRow>
                    <Subtitle>Discover and track all available achievements</Subtitle>

                    <StatsRow>
                        <StatCard>
                            <StatIcon $variant="gold">
                                <Trophy size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Progress</StatLabel>
                                <StatValue>{stats.unlocked} / {stats.total}</StatValue>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $variant="blue">
                                <Target size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Completion</StatLabel>
                                <StatValue>{progressPercent.toFixed(1)}%</StatValue>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $variant="green">
                                <Star size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Points Earned</StatLabel>
                                <StatValue>{stats.totalPoints.toLocaleString()}</StatValue>
                            </StatInfo>
                        </StatCard>

                        <StatCard>
                            <StatIcon $variant="purple">
                                <Zap size={24} />
                            </StatIcon>
                            <StatInfo>
                                <StatLabel>Possible Points</StatLabel>
                                <StatValue>{stats.possiblePoints.toLocaleString()}</StatValue>
                            </StatInfo>
                        </StatCard>
                    </StatsRow>
                </Header>

                <CategoryTabs>
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        const count = allAchievements.filter(a => 
                            cat.id === 'all' || a.category === cat.id
                        ).length;
                        
                        return (
                            <CategoryTab
                                key={cat.id}
                                $active={categoryFilter === cat.id}
                                onClick={() => setCategoryFilter(cat.id)}
                            >
                                <Icon size={18} />
                                {cat.name}
                                <span style={{ 
                                    opacity: 0.6, 
                                    fontSize: '0.85em',
                                    marginLeft: '0.25rem'
                                }}>
                                    ({count})
                                </span>
                            </CategoryTab>
                        );
                    })}
                </CategoryTabs>

                <ControlsBar>
                    <SearchBox>
                        <SearchIcon size={18} />
                        <SearchInput
                            type="text"
                            placeholder="Search achievements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </SearchBox>

                    <FilterGroup>
                        <FilterButton
                            $active={statusFilter === 'all'}
                            onClick={() => setStatusFilter('all')}
                        >
                            All
                        </FilterButton>
                        <FilterButton
                            $active={statusFilter === 'unlocked'}
                            onClick={() => setStatusFilter('unlocked')}
                        >
                            <CheckCircle size={16} />
                            Unlocked
                        </FilterButton>
                        <FilterButton
                            $active={statusFilter === 'locked'}
                            onClick={() => setStatusFilter('locked')}
                        >
                            <Lock size={16} />
                            Locked
                        </FilterButton>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterButton
                            $active={rarityFilter === 'all'}
                            onClick={() => setRarityFilter('all')}
                        >
                            All Rarities
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'common'}
                            onClick={() => setRarityFilter('common')}
                        >
                            Common
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'rare'}
                            onClick={() => setRarityFilter('rare')}
                        >
                            Rare
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'epic'}
                            onClick={() => setRarityFilter('epic')}
                        >
                            Epic
                        </FilterButton>
                        <FilterButton
                            $active={rarityFilter === 'legendary'}
                            onClick={() => setRarityFilter('legendary')}
                        >
                            Legendary
                        </FilterButton>
                    </FilterGroup>

                    <ViewToggle>
                        <ViewButton
                            $active={viewMode === 'grid'}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </ViewButton>
                        <ViewButton
                            $active={viewMode === 'list'}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </ViewButton>
                    </ViewToggle>
                </ControlsBar>

                {filteredAchievements.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <Search size={60} />
                        </EmptyIcon>
                        <EmptyText>No achievements found</EmptyText>
                        <EmptySubtext>Try adjusting your filters</EmptySubtext>
                    </EmptyState>
                ) : (
                    <AchievementsGrid $view={viewMode}>
                        {filteredAchievements.map((achievement) => (
                            <AchievementCard
                                key={achievement.id}
                                $unlocked={achievement.unlocked}
                                $rarity={achievement.rarity}
                                $view={viewMode}
                            >
                                <CardHeader>
                                    <IconContainer 
                                        $unlocked={achievement.unlocked}
                                        $rarity={achievement.rarity}
                                        $view={viewMode}
                                    >
                                        {!achievement.unlocked && (
                                            <LockedOverlay>
                                                <Lock size={32} color="#64748b" />
                                            </LockedOverlay>
                                        )}
                                        {achievement.icon}
                                    </IconContainer>
                                    
                                    {viewMode === 'grid' && (
                                        <CardContent>
                                            <CardTitle $unlocked={achievement.unlocked} $view={viewMode}>
                                                {achievement.name}
                                            </CardTitle>
                                        </CardContent>
                                    )}
                                </CardHeader>

                                <CardContent>
                                    {viewMode === 'list' && (
                                        <CardTitle $unlocked={achievement.unlocked} $view={viewMode}>
                                            {achievement.name}
                                            <RarityBadge $rarity={achievement.rarity}>
                                                {achievement.rarity}
                                            </RarityBadge>
                                            <CategoryBadge>
                                                {achievement.category}
                                            </CategoryBadge>
                                        </CardTitle>
                                    )}

                                    {viewMode === 'grid' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                            <RarityBadge $rarity={achievement.rarity}>
                                                {achievement.rarity}
                                            </RarityBadge>
                                            <CategoryBadge>
                                                {achievement.category}
                                            </CategoryBadge>
                                        </div>
                                    )}

                                    <CardDescription $unlocked={achievement.unlocked}>
                                        {achievement.description}
                                    </CardDescription>

                                    <CardFooter>
                                        <PointsBadge>
                                            <Star size={14} />
                                            +{achievement.points} XP
                                        </PointsBadge>
                                        
                                        {achievement.unlocked && achievement.unlockedAt ? (
                                            <UnlockedDate>
                                                <CheckCircle size={14} />
                                                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                            </UnlockedDate>
                                        ) : (
                                            <RequirementText>
                                                <Lock size={14} />
                                                Keep grinding!
                                            </RequirementText>
                                        )}
                                    </CardFooter>
                                </CardContent>
                            </AchievementCard>
                        ))}
                    </AchievementsGrid>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default AchievementsBrowserPage;