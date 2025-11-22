// client/src/pages/LeaderboardPage.js - EPIC LEADERBOARD & SOCIAL (UPDATED WITH AVATARS)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Trophy, Medal, Award, Crown, TrendingUp, TrendingDown,
    User, Users, Eye, Target, BarChart3, Flame, Star,
    ChevronUp, ChevronDown, Search, Filter, Share2,
    UserPlus, UserMinus, Check, X, Globe, Lock,
    Zap, Activity, DollarSign, Percent, ArrowUpRight,
    ArrowDownRight, ExternalLink, RefreshCw, Settings
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { 
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
    }
    50% { 
        filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.6));
    }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const confetti = keyframes`
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    animation: ${glow} 2s ease-in-out infinite;
    border: none;
    outline: none;
    box-shadow: none;
    padding: 0;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const StatsBar = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
`;

const StatBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
    border: 1px solid rgba(255, 215, 0, 0.4);
    border-radius: 20px;
    color: #ffd700;
    font-weight: 600;
`;

// ============ TABS ============
const TabsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(255, 215, 0, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%);
        border-color: rgba(255, 215, 0, 0.5);
        color: #ffd700;
        transform: translateY(-2px);
    }
`;

// ============ CONTROLS ============
const ControlsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
`;

const SearchBar = styled.div`
    flex: 1;
    min-width: 300px;
    position: relative;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
        box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
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
    color: #ffd700;
`;

const FilterButton = styled.button`
    padding: 0.75rem 1.25rem;
    background: ${props => props.$active ? 
        'rgba(255, 215, 0, 0.2)' :
        'rgba(255, 215, 0, 0.05)'
    };
    border: 1px solid ${props => props.$active ? 
        'rgba(255, 215, 0, 0.5)' :
        'rgba(255, 215, 0, 0.3)'
    };
    border-radius: 12px;
    color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.2);
        border-color: rgba(255, 215, 0, 0.5);
        color: #ffd700;
    }
`;

const RefreshButton = styled.button`
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: none;
    border-radius: 12px;
    color: #0a0e27;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(255, 215, 0, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

   svg {
    ${props => props.$loading && css`
        animation: ${spin} 1s linear infinite;
    `}
}
`;

// ============ LEADERBOARD ============
const LeaderboardContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const LeaderboardList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const LeaderCard = styled.div`
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.05) 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, rgba(205, 127, 50, 0.2) 0%, rgba(205, 127, 50, 0.05) 100%)';
        return 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)';
    }};
    backdrop-filter: blur(10px);
    border: 2px solid ${props => {
        if (props.$rank === 1) return 'rgba(255, 215, 0, 0.5)';
        if (props.$rank === 2) return 'rgba(192, 192, 192, 0.5)';
        if (props.$rank === 3) return 'rgba(205, 127, 50, 0.5)';
        return 'rgba(255, 215, 0, 0.2)';
    }};
    border-radius: 16px;
    padding: 1.5rem;
    display: grid;
    grid-template-columns: 80px 60px 1fr 150px 150px 150px 120px;
    gap: 1.5rem;
    align-items: center;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$index * 0.05}s;
    cursor: pointer;

    &:hover {
        transform: translateX(10px);
        border-color: rgba(255, 215, 0, 0.8);
        box-shadow: 0 10px 40px ${props => {
            if (props.$rank === 1) return 'rgba(255, 215, 0, 0.4)';
            if (props.$rank === 2) return 'rgba(192, 192, 192, 0.4)';
            if (props.$rank === 3) return 'rgba(205, 127, 50, 0.4)';
            return 'rgba(255, 215, 0, 0.2)';
        }};
    }

    ${props => props.$rank <= 3 && css`
    animation: ${glow} 3s ease-in-out infinite;
`}

    @media (max-width: 1200px) {
        grid-template-columns: 60px 50px 1fr 120px 100px;
        gap: 1rem;
        
        & > div:nth-child(5),
        & > div:nth-child(6) {
            display: none;
        }
    }

    @media (max-width: 768px) {
        grid-template-columns: 50px 1fr 80px;
        
        & > div:nth-child(3),
        & > div:nth-child(5),
        & > div:nth-child(6),
        & > div:nth-child(7) {
            display: none;
        }
    }
`;

const RankBadge = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #e5a55d)';
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$rank <= 3 ? '#0a0e27' : '#ffd700'};
    border: 3px solid ${props => {
        if (props.$rank === 1) return '#ffd700';
        if (props.$rank === 2) return '#c0c0c0';
        if (props.$rank === 3) return '#cd7f32';
        return 'rgba(255, 215, 0, 0.3)';
    }};
    position: relative;

   ${props => props.$rank === 1 && css`
    animation: ${pulse} 2s ease-in-out infinite;
`}
`;

const RankIcon = styled.div`
    position: absolute;
    top: -5px;
    right: -5px;
`;

// ✅ UPDATED Avatar Component
const Avatar = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #ffd700, #ffed4e)'};
    border: 2px solid rgba(255, 215, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0e27;
    font-weight: 900;
    font-size: 1.2rem;
    position: relative;
    overflow: hidden;
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
`;

const AvatarInitials = styled.div`
    position: relative;
    z-index: 0;
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const DisplayName = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const UserStats = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #94a3b8;
    font-size: 0.9rem;
`;

const Badge = styled.span`
    padding: 0.25rem 0.5rem;
    background: ${props => {
        if (props.$type === 'gold') return 'rgba(255, 215, 0, 0.2)';
        if (props.$type === 'fire') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    border: 1px solid ${props => {
        if (props.$type === 'gold') return 'rgba(255, 215, 0, 0.5)';
        if (props.$type === 'fire') return 'rgba(239, 68, 68, 0.5)';
        return 'rgba(0, 173, 237, 0.5)';
    }};
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
`;

const StatColumn = styled.div`
    text-align: center;
`;

const StatLabel = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => {
        if (props.$positive) return '#10b981';
        if (props.$negative) return '#ef4444';
        return '#ffd700';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
`;

const FollowButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$following ? 
        'rgba(239, 68, 68, 0.1)' :
        'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
    };
    border: 1px solid ${props => props.$following ? 
        'rgba(239, 68, 68, 0.3)' :
        'transparent'
    };
    border-radius: 10px;
    color: ${props => props.$following ? '#ef4444' : '#0a0e27'};
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => props.$following ? 
            'rgba(239, 68, 68, 0.3)' :
            'rgba(255, 215, 0, 0.4)'
        };
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed rgba(255, 215, 0, 0.4);
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
    color: #ffd700;
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
`;

const LoadingSpinner = styled(Trophy)`
    animation: ${spin} 1s linear infinite;
    color: #ffd700;
`;

const LoadingText = styled.div`
    color: #94a3b8;
    font-size: 1.1rem;
`;

// ============ COMPONENT ============
const LeaderboardPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('all'); // all, following, myRank
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('totalReturnPercent'); // Sort field
    const [following, setFollowing] = useState(new Set());

    useEffect(() => {
        fetchLeaderboard();
        fetchFollowing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/social/leaderboard?sortBy=${sortBy}&limit=100`);
            console.log('Leaderboard:', response.data);
            
            const mappedData = (response.data || []).map((trader, index) => ({
                rank: index + 1,
                userId: trader.userId || trader._id,
                displayName: trader.displayName || trader.profile?.displayName || trader.username,
                username: trader.username,
                avatar: trader.avatar || trader.profile?.avatar,
                badges: trader.badges || trader.profile?.badges || [],
                totalReturn: trader.totalReturn || trader.stats?.totalReturnPercent || 0,
                winRate: trader.winRate || trader.stats?.winRate || 0,
                totalTrades: trader.totalTrades || trader.stats?.totalTrades || 0,
                followersCount: trader.social?.followersCount || 0,
            }));
            
            setLeaderboard(mappedData);
            if (mappedData.length > 0) {
                toast.success(`Loaded ${mappedData.length} traders`, 'Leaderboard Updated');
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            toast.error('Failed to load leaderboard', 'Error');
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowing = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.social?.following) {
                setFollowing(new Set(response.data.social.following.map(id => id.toString())));
            }
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchLeaderboard();
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleFollow = async (userId) => {
        try {
            const isFollowing = following.has(userId);
            
            if (isFollowing) {
                await api.post(`/social/unfollow/${userId}`);
                const newFollowing = new Set(following);
                newFollowing.delete(userId);
                setFollowing(newFollowing);
                toast.success('Unfollowed user', 'Success');
            } else {
                await api.post(`/social/follow/${userId}`);
                const newFollowing = new Set(following);
                newFollowing.add(userId);
                setFollowing(newFollowing);
                toast.success('Following user!', 'Success');
            }
        } catch (error) {
            console.error('Error following/unfollowing:', error);
            toast.error(error.response?.data?.msg || 'Failed to follow user', 'Error');
        }
    };

    const handleCardClick = (trader) => {
        navigate(`/trader/${trader.username}`);
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={24} color="#ffd700" />;
        if (rank === 2) return <Medal size={24} color="#c0c0c0" />;
        if (rank === 3) return <Award size={24} color="#cd7f32" />;
        return null;
    };

    // ✅ Helper to get initials
    const getInitials = (trader) => {
        const name = trader.displayName || trader.username || 'T';
        return name.charAt(0).toUpperCase();
    };

    const filteredLeaderboard = leaderboard.filter(trader => {
        if (searchQuery) {
            return trader.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   trader.username.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (activeTab === 'following') {
            return following.has(trader.userId);
        }
        if (activeTab === 'myRank') {
            return trader.userId === user?.id;
        }
        return true;
    });

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <LoadingText>Loading leaderboard...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>
                    <TitleIcon>
                        <Trophy size={56} color="#ffd700" />
                    </TitleIcon>
                    Global Leaderboard
                </Title>
                <Subtitle>Compete with the best traders worldwide</Subtitle>
                <StatsBar>
                    <StatBadge>
                        <Users size={18} />
                        {leaderboard.length.toLocaleString()} Active Traders
                    </StatBadge>
                    <StatBadge>
                        <Flame size={18} />
                        Live Rankings
                    </StatBadge>
                    <StatBadge>
                        <Zap size={18} />
                        Updated Real-Time
                    </StatBadge>
                </StatsBar>
            </Header>

            {/* Tabs */}
            <TabsContainer>
                <Tab 
                    $active={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                >
                    <Globe size={18} />
                    All Traders
                </Tab>
                <Tab 
                    $active={activeTab === 'following'}
                    onClick={() => setActiveTab('following')}
                >
                    <Users size={18} />
                    Following ({following.size})
                </Tab>
                <Tab 
                    $active={activeTab === 'myRank'}
                    onClick={() => setActiveTab('myRank')}
                >
                    <Target size={18} />
                    My Rank
                </Tab>
            </TabsContainer>

            {/* Controls */}
            <ControlsContainer>
                <SearchBar>
                    <SearchIcon size={20} />
                    <SearchInput
                        type="text"
                        placeholder="Search traders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchBar>

                <FilterButton
                    $active={sortBy === 'totalReturnPercent'}
                    onClick={() => setSortBy('totalReturnPercent')}
                >
                    Total Return %
                </FilterButton>
                <FilterButton
                    $active={sortBy === 'winRate'}
                    onClick={() => setSortBy('winRate')}
                >
                    Win Rate
                </FilterButton>
                <FilterButton
                    $active={sortBy === 'totalTrades'}
                    onClick={() => setSortBy('totalTrades')}
                >
                    Total Trades
                </FilterButton>

                <RefreshButton onClick={handleRefresh} disabled={refreshing} $loading={refreshing}>
                    <RefreshCw size={18} />
                    Refresh
                </RefreshButton>
            </ControlsContainer>

            {/* Leaderboard */}
            {filteredLeaderboard.length > 0 ? (
                <LeaderboardContainer>
                    <LeaderboardList>
                        {filteredLeaderboard.map((trader, index) => (
                            <LeaderCard 
                                key={trader.userId}
                                $rank={trader.rank}
                                $index={index}
                                onClick={() => handleCardClick(trader)}
                            >
                                <RankBadge $rank={trader.rank}>
                                    #{trader.rank}
                                    {trader.rank <= 3 && (
                                        <RankIcon>
                                            {getRankIcon(trader.rank)}
                                        </RankIcon>
                                    )}
                                </RankBadge>

                                {/* ✅ UPDATED Avatar Display */}
                                <Avatar $hasImage={!!trader.avatar}>
                                    {trader.avatar ? (
                                        <AvatarImage 
                                            src={trader.avatar} 
                                            alt={trader.displayName}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    ) : (
                                        <AvatarInitials>{getInitials(trader)}</AvatarInitials>
                                    )}
                                </Avatar>

                                <UserInfo>
                                    <DisplayName>
                                        {trader.displayName}
                                        {trader.rank === 1 && <Crown size={18} color="#ffd700" />}
                                        {trader.badges?.includes('verified') && <Check size={18} color="#10b981" />}
                                    </DisplayName>
                                    <UserStats>
                                        <span>{trader.totalTrades} trades</span>
                                        <span>•</span>
                                        <span>{trader.winRate?.toFixed(1)}% win rate</span>
                                    </UserStats>
                                </UserInfo>

                                <StatColumn>
                                    <StatLabel>Total Return</StatLabel>
                                    <StatValue $positive={trader.totalReturn >= 0} $negative={trader.totalReturn < 0}>
                                        {trader.totalReturn >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {trader.totalReturn >= 0 ? '+' : ''}
                                        {trader.totalReturn?.toFixed(2)}%
                                    </StatValue>
                                </StatColumn>

                                <StatColumn>
                                    <StatLabel>Win Rate</StatLabel>
                                    <StatValue>
                                        {trader.winRate?.toFixed(1)}%
                                    </StatValue>
                                </StatColumn>

                                <StatColumn>
                                    <StatLabel>Trades</StatLabel>
                                    <StatValue>
                                        {trader.totalTrades}
                                    </StatValue>
                                </StatColumn>

                                <FollowButton
                                    $following={following.has(trader.userId)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFollow(trader.userId);
                                    }}
                                    disabled={trader.userId === user?.id}
                                >
                                    {trader.userId === user?.id ? (
                                        <>
                                            <Star size={18} />
                                            You
                                        </>
                                    ) : following.has(trader.userId) ? (
                                        <>
                                            <UserMinus size={18} />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Follow
                                        </>
                                    )}
                                </FollowButton>
                            </LeaderCard>
                        ))}
                    </LeaderboardList>
                </LeaderboardContainer>
            ) : (
                <EmptyState>
                    <EmptyIcon>
                        <Trophy size={80} color="#ffd700" />
                    </EmptyIcon>
                    <EmptyTitle>No Traders Found</EmptyTitle>
                    <EmptyText>
                        {searchQuery ? 
                            'Try adjusting your search' :
                            activeTab === 'following' ?
                            'You are not following anyone yet' :
                            'Be the first to join the leaderboard!'
                        }
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default LeaderboardPage;