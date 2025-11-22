// src/pages/DiscoveryPage.js - User Search & Discovery (UPDATED WITH AVATARS)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Search, Users, TrendingUp, Flame, Star, Crown,
    UserPlus, UserMinus, Check, Award, Trophy,
    ArrowUpRight, ArrowDownRight, Filter, X,
    Sparkles, Target, Zap, Eye, Globe, RefreshCw
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

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    text-align: center;
    animation: ${fadeIn} 0.8s ease-out;
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
    margin-bottom: 2rem;
`;

// ============ SEARCH BAR ============
const SearchContainer = styled.div`
    max-width: 800px;
    margin: 0 auto 3rem;
    position: relative;
`;

const SearchWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 1.25rem 4rem 1.25rem 4rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 16px;
    color: #e0e6ed;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #ffd700;
        box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.2);
        background: linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    color: #ffd700;
`;

const ClearButton = styled.button`
    position: absolute;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffd700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.2);
        transform: translateY(-50%) scale(1.1);
    }
`;

// ============ FILTERS ============
const FiltersContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
`;

const FilterChip = styled.button`
    padding: 0.75rem 1.25rem;
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

// ============ SUGGESTIONS SECTION ============
const Section = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
    color: #ffd700;
    font-size: 1.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
        animation: ${props => props.$loading ? spin : 'none'} 1s linear infinite;
    }
`;

// ============ TRADER CARDS ============
const TraderGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
`;

const TraderCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    cursor: pointer;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.$index * 0.05}s;

    &:hover {
        transform: translateY(-8px);
        border-color: rgba(255, 215, 0, 0.5);
        box-shadow: 0 12px 40px rgba(255, 215, 0, 0.3);
    }
`;

const CardTop = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
`;

// ✅ UPDATED AVATAR COMPONENTS
const Avatar = styled.div`
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #ffd700, #ffed4e)'};
    border: 3px solid rgba(255, 215, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0e27;
    font-weight: 900;
    font-size: 1.8rem;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
    z-index: 1;
`;

const AvatarInitials = styled.div`
    position: relative;
    z-index: 0;
`;

const RankBadge = styled.div`
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #e5a55d)';
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))';
    }};
    border: 2px solid #0a0e27;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$rank <= 3 ? '#0a0e27' : '#ffd700'};
    font-size: 0.7rem;
    font-weight: 900;
    animation: ${pulse} 2s ease-in-out infinite;
    z-index: 10;
`;

const UserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const DisplayName = styled.h3`
    font-size: 1.3rem;
    font-weight: 700;
    color: #e0e6ed;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Username = styled.div`
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
`;

const BadgesRow = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
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
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: ${props => {
        if (props.$type === 'gold') return '#ffd700';
        if (props.$type === 'fire') return '#ef4444';
        return '#00adef';
    }};
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem 0;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const StatBox = styled.div`
    text-align: center;
`;

const StatLabel = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatValue = styled.div`
    font-size: 1.1rem;
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
    width: 100%;
    padding: 0.75rem;
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

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px ${props => props.$following ? 
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

const LoadingSpinner = styled(Search)`
    animation: ${spin} 1s linear infinite;
    color: #ffd700;
`;

// ============ COMPONENT ============
const DiscoveryPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('suggested');
    const [traders, setTraders] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [following, setFollowing] = useState(new Set());

    useEffect(() => {
        fetchSuggestedTraders();
        fetchFollowing();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter]);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timeoutId = setTimeout(() => {
                handleSearch();
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setSearchResults([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    const fetchSuggestedTraders = async () => {
        setLoading(true);
        try {
            // ✅ UPDATED: Use social/leaderboard endpoint
            const response = await api.get('/social/leaderboard?limit=20');
            setTraders(response.data || []);
        } catch (error) {
            console.error('Error fetching traders:', error);
            toast.error('Failed to load traders', 'Error');
            setTraders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery || searchQuery.length < 2) return;
        
        setSearching(true);
        try {
            // ✅ UPDATED: Use social/search endpoint
            const response = await api.get(`/social/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(response.data || []);
        } catch (error) {
            console.error('Error searching traders:', error);
            toast.error('Failed to search traders', 'Error');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const fetchFollowing = async () => {
        try {
            // ✅ UPDATED: Get current user data
            const response = await api.get('/auth/me');
            if (response.data.social?.following) {
                setFollowing(new Set(response.data.social.following.map(id => id.toString())));
            }
        } catch (error) {
            console.error('Error fetching following:', error);
        }
    };

    const handleFollow = async (e, userId) => {
        e.stopPropagation();
        
        try {
            const isFollowing = following.has(userId);
            
            // ✅ UPDATED: Use social follow endpoints
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

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    // ✅ Helper to get initials
    const getInitials = (trader) => {
        const name = trader.profile?.displayName || trader.displayName || trader.username || 'T';
        return name.charAt(0).toUpperCase();
    };

    const renderTraderCard = (trader, index) => {
        const isOwnProfile = trader._id === user?.id || trader.userId === user?.id;
        const traderId = trader._id || trader.userId;
        
        return (
            <TraderCard 
                key={traderId} 
                $index={index}
                onClick={() => handleCardClick(trader)}
            >
                <CardTop>
                    {/* ✅ UPDATED: Show real avatar or initials */}
                    <Avatar $hasImage={!!(trader.profile?.avatar || trader.avatar)}>
                        {(trader.profile?.avatar || trader.avatar) ? (
                            <AvatarImage 
                                src={trader.profile?.avatar || trader.avatar} 
                                alt={trader.profile?.displayName || trader.displayName || trader.username}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <AvatarInitials>
                                {getInitials(trader)}
                            </AvatarInitials>
                        )}
                        {(trader.stats?.rank || trader.rank) && (trader.stats?.rank || trader.rank) <= 10 && (
                            <RankBadge $rank={trader.stats?.rank || trader.rank}>
                                #{trader.stats?.rank || trader.rank}
                            </RankBadge>
                        )}
                    </Avatar>
                    
                    <UserInfo>
                        <DisplayName>
                            {trader.profile?.displayName || trader.displayName || trader.username}
                            {(trader.stats?.rank || trader.rank) === 1 && <Crown size={16} color="#ffd700" />}
                            {trader.profile?.badges?.includes('verified') && <Check size={16} color="#10b981" />}
                        </DisplayName>
                        <Username>@{trader.username}</Username>
                        <BadgesRow>
                            {trader.profile?.level && trader.profile.level >= 10 && (
                                <Badge $type="gold">
                                    <Star size={12} />
                                    Lvl {trader.profile.level}
                                </Badge>
                            )}
                            {(trader.stats?.winRate || trader.winRate || 0) >= 70 && (
                                <Badge $type="fire">
                                    <Flame size={12} />
                                    Hot Streak
                                </Badge>
                            )}
                            {(trader.social?.followersCount || trader.followersCount || 0) >= 100 && (
                                <Badge>
                                    <Users size={12} />
                                    Popular
                                </Badge>
                            )}
                        </BadgesRow>
                    </UserInfo>
                </CardTop>

                <StatsGrid>
                    <StatBox>
                        <StatLabel>Return</StatLabel>
                        <StatValue 
                            $positive={(trader.stats?.totalReturnPercent || trader.totalReturn || 0) >= 0} 
                            $negative={(trader.stats?.totalReturnPercent || trader.totalReturn || 0) < 0}
                        >
                            {(trader.stats?.totalReturnPercent || trader.totalReturn || 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {(trader.stats?.totalReturnPercent || trader.totalReturn || 0) >= 0 ? '+' : ''}
                            {(trader.stats?.totalReturnPercent || trader.totalReturn || 0).toFixed(1)}%
                        </StatValue>
                    </StatBox>
                    
                    <StatBox>
                        <StatLabel>Win Rate</StatLabel>
                        <StatValue>
                            {(trader.stats?.winRate || trader.winRate || 0).toFixed(0)}%
                        </StatValue>
                    </StatBox>
                    
                    <StatBox>
                        <StatLabel>Trades</StatLabel>
                        <StatValue>
                            {trader.stats?.totalTrades || trader.totalTrades || 0}
                        </StatValue>
                    </StatBox>
                </StatsGrid>

                <FollowButton
                    $following={following.has(traderId)}
                    onClick={(e) => handleFollow(e, traderId)}
                    disabled={isOwnProfile}
                >
                    {isOwnProfile ? (
                        <>
                            <Star size={18} />
                            Your Profile
                        </>
                    ) : following.has(traderId) ? (
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
            </TraderCard>
        );
    };

    const displayedTraders = searchQuery.length >= 2 ? searchResults : traders;

    if (loading && !searchQuery) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Loading traders...</div>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>
                    <TitleIcon>
                        <Sparkles size={56} color="#ffd700" />
                    </TitleIcon>
                    Discover Traders
                </Title>
                <Subtitle>Find and follow the best traders in the community</Subtitle>
            </Header>

            {/* Search Bar */}
            <SearchContainer>
                <SearchWrapper>
                    <SearchIcon size={24} />
                    <SearchInput
                        type="text"
                        placeholder="Search traders by name or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <ClearButton onClick={handleClearSearch}>
                            <X size={16} />
                        </ClearButton>
                    )}
                </SearchWrapper>
            </SearchContainer>

            {/* Filters */}
            {!searchQuery && (
                <FiltersContainer>
                    <FilterChip
                        $active={activeFilter === 'suggested'}
                        onClick={() => setActiveFilter('suggested')}
                    >
                        <Sparkles size={18} />
                        Suggested For You
                    </FilterChip>
                    <FilterChip
                        $active={activeFilter === 'top'}
                        onClick={() => setActiveFilter('top')}
                    >
                        <Trophy size={18} />
                        Top Performers
                    </FilterChip>
                    <FilterChip
                        $active={activeFilter === 'active'}
                        onClick={() => setActiveFilter('active')}
                    >
                        <Zap size={18} />
                        Most Active
                    </FilterChip>
                </FiltersContainer>
            )}

            {/* Results Section */}
            <Section>
                <SectionHeader>
                    <SectionTitle>
                        {searchQuery ? (
                            <>
                                <Search size={28} />
                                Search Results
                                {searching && <LoadingSpinner size={24} />}
                            </>
                        ) : (
                            <>
                                <Users size={28} />
                                {activeFilter === 'suggested' && 'Suggested Traders'}
                                {activeFilter === 'top' && 'Top Performers'}
                                {activeFilter === 'active' && 'Most Active Traders'}
                            </>
                        )}
                    </SectionTitle>
                    {!searchQuery && (
                        <RefreshButton onClick={fetchSuggestedTraders} disabled={loading} $loading={loading}>
                            <RefreshCw size={18} />
                            Refresh
                        </RefreshButton>
                    )}
                </SectionHeader>

                {displayedTraders.length > 0 ? (
                    <TraderGrid>
                        {displayedTraders.map((trader, index) => renderTraderCard(trader, index))}
                    </TraderGrid>
                ) : (
                    <EmptyState>
                        <EmptyIcon>
                            <Search size={80} color="#ffd700" />
                        </EmptyIcon>
                        <EmptyTitle>
                            {searchQuery ? 'No Traders Found' : 'No Traders Available'}
                        </EmptyTitle>
                        <EmptyText>
                            {searchQuery 
                                ? `No traders match "${searchQuery}". Try a different search.`
                                : 'Be the first to join the community!'
                            }
                        </EmptyText>
                    </EmptyState>
                )}
            </Section>
        </PageContainer>
    );
};

export default DiscoveryPage;