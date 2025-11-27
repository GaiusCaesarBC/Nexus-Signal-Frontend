// client/src/pages/PublicProfilePage.js - PUBLIC TRADER PROFILE PAGE (MINIMAL ENHANCEMENTS)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Trophy, Award, Target, TrendingUp, TrendingDown,
    Calendar, DollarSign, Percent, BarChart3, Users, Eye,
    UserPlus, UserMinus, Settings, Share2, Flag, Check,
    Star, Flame, Crown, Zap, Activity, ArrowUpRight,
    ArrowDownRight, Lock, Globe, MessageSquare, AlertCircle,
    Briefcase, Clock, Medal, ChevronLeft, RefreshCw
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

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
    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

const TopBar = styled.div`
    max-width: 1400px;
    margin: 0 auto 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
`;

const BackButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateX(-5px);
    }
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: none;
    border-radius: 8px;
    color: #0a0e27;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
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

const ProfileHeader = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    padding: 3rem;
    position: relative;
    overflow: hidden;
    animation: ${fadeIn} 0.8s ease-out;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #ffd700, #ffed4e, #ffd700);
        background-size: 200% 100%;
        animation: ${shimmer} 3s linear infinite;
    }
`;

const HeaderTop = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const UserInfoSection = styled.div`
    display: flex;
    gap: 2rem;
    align-items: start;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const AvatarLarge = styled.div`
    width: 120px;
    height: 120px;
    border-radius: 20px;
    background: ${props => props.$src ? 
        `url(${props.$src}) center/cover` : 
        'linear-gradient(135deg, #ffd700, #ffed4e)'
    };
    border: 4px solid rgba(255, 215, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.$src ? '0' : '3rem'};
    font-weight: 900;
    color: #0a0e27;
    box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
    position: relative;

    ${props => props.$rank <= 3 && css`
        animation: ${glow} 3s ease-in-out infinite;
    `}
`;

const RankBadge = styled.div`
    position: absolute;
    top: -10px;
    right: -10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #e5a55d)';
        return 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))';
    }};
    border: 3px solid #0a0e27;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$rank <= 3 ? '#0a0e27' : '#ffd700'};
    font-size: 0.9rem;
    font-weight: 900;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const UserDetails = styled.div`
    flex: 1;
`;

const DisplayName = styled.h1`
    font-size: 2.5rem;
    font-weight: 900;
    color: #ffd700;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (max-width: 768px) {
        font-size: 2rem;
        justify-content: center;
    }
`;

const UserBio = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    max-width: 600px;
`;

const UserMeta = styled.div`
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    color: #64748b;
    font-size: 0.95rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => {
        if (props.$primary) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
        if (props.$danger) return 'rgba(239, 68, 68, 0.1)';
        return 'rgba(255, 215, 0, 0.1)';
    }};
    border: 1px solid ${props => {
        if (props.$primary) return 'transparent';
        if (props.$danger) return 'rgba(239, 68, 68, 0.3)';
        return 'rgba(255, 215, 0, 0.3)';
    }};
    border-radius: 12px;
    color: ${props => {
        if (props.$primary) return '#0a0e27';
        if (props.$danger) return '#ef4444';
        return '#ffd700';
    }};
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => {
            if (props.$primary) return 'rgba(255, 215, 0, 0.4)';
            if (props.$danger) return 'rgba(239, 68, 68, 0.3)';
            return 'rgba(255, 215, 0, 0.3)';
        }};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const StatBox = styled.div`
    text-align: center;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.1);
        transform: translateY(-3px);
    }
`;

const StatLabel = styled.div`
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => {
        if (props.$positive) return '#10b981';
        if (props.$negative) return '#ef4444';
        return '#ffd700';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

// ============ TABS ============
const TabsContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    display: flex;
    gap: 1rem;
    border-bottom: 2px solid rgba(255, 215, 0, 0.2);
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 215, 0, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 215, 0, 0.5);
        border-radius: 2px;
    }
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)' :
        'transparent'
    };
    border: none;
    border-bottom: 3px solid ${props => props.$active ? '#ffd700' : 'transparent'};
    color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        color: #ffd700;
    }
`;

// ============ CONTENT SECTIONS ============
const ContentContainer = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const SectionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const Card = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    transition: all 0.3s ease;

    &:hover {
        border-color: rgba(255, 215, 0, 0.4);
        transform: translateY(-5px);
    }
`;

const CardTitle = styled.h3`
    color: #ffd700;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AchievementGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
`;

const Achievement = styled.div`
    text-align: center;
    padding: 1rem;
    background: ${props => props.$earned ? 
        'rgba(255, 215, 0, 0.15)' :
        'rgba(100, 116, 139, 0.1)'
    };
    border: 1px solid ${props => props.$earned ? 
        'rgba(255, 215, 0, 0.3)' :
        'rgba(100, 116, 139, 0.2)'
    };
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: ${props => props.$earned ? 1 : 0.4};

    &:hover {
        transform: translateY(-3px);
        border-color: rgba(255, 215, 0, 0.5);
    }
`;

const AchievementIcon = styled.div`
    font-size: 2rem;
    margin-bottom: 0.5rem;
`;

const AchievementName = styled.div`
    color: #e0e6ed;
    font-size: 0.85rem;
    font-weight: 600;
`;

const ActivityFeed = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ActivityItem = styled.div`
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.1);
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.1);
        transform: translateX(5px);
    }
`;

const ActivityIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => {
        if (props.$type === 'trade') return 'rgba(0, 173, 237, 0.2)';
        if (props.$type === 'achievement') return 'rgba(255, 215, 0, 0.2)';
        return 'rgba(16, 185, 129, 0.2)';
    }};
    color: ${props => {
        if (props.$type === 'trade') return '#00adef';
        if (props.$type === 'achievement') return '#ffd700';
        return '#10b981';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const ActivityContent = styled.div`
    flex: 1;
`;

const ActivityText = styled.div`
    color: #e0e6ed;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: #64748b;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffd700;
`;

const EmptyText = styled.div`
    color: #94a3b8;
    font-size: 1rem;
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

const PrivateMessage = styled.div`
    max-width: 600px;
    margin: 4rem auto;
    text-align: center;
    padding: 3rem;
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 16px;
    animation: ${fadeIn} 0.6s ease-out;
`;

const PrivateIcon = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
`;

const PrivateTitle = styled.h2`
    color: #ef4444;
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const PrivateText = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
`;

// ============ COMPONENT ============
const PublicProfilePage = () => {
    const { username } = useParams();
    const { api, user: currentUser } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // Keep original fetch logic exactly as it was
    const fetchProfile = useCallback(async (isRefresh = false) => {
        if (!isRefresh) {
            setLoading(true);
        }
        try {
            const response = await api.get(`/social/profile/username/${username}`);
            setProfile(response.data);
            
            // Check if following
            if (currentUser && response.data.social?.followers) {
                const isCurrentlyFollowing = response.data.social.followers.some(
                    follower => follower._id === currentUser.id || follower === currentUser.id
                );
                setIsFollowing(isCurrentlyFollowing);
            }
            
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 403) {
                setProfile({ private: true });
            } else if (error.response?.status === 404) {
                setProfile(null);
            } else {
                if (!isRefresh) {
                    toast.error('Failed to load profile', 'Error');
                }
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, username, currentUser, toast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Manual refresh handler
    const handleRefresh = () => {
        setRefreshing(true);
        fetchProfile(true);
    };

    // Optimistic follow/unfollow
    const handleFollow = async () => {
        if (!profile?.userId && !profile?._id) return;
        
        const profileId = profile.userId || profile._id;
        const wasFollowing = isFollowing;
        
        // Optimistic update
        setIsFollowing(!wasFollowing);
        setProfile(prev => ({
            ...prev,
            social: {
                ...prev.social,
                followersCount: Math.max(0, (prev.social?.followersCount || 0) + (wasFollowing ? -1 : 1))
            }
        }));
        
        setFollowLoading(true);
        try {
            if (wasFollowing) {
                await api.post(`/social/unfollow/${profileId}`);
                toast.success('Unfollowed user', 'Success');
            } else {
                await api.post(`/social/follow/${profileId}`);
                toast.success('Following user!', 'Success');
            }
        } catch (error) {
            // Revert on error
            setIsFollowing(wasFollowing);
            setProfile(prev => ({
                ...prev,
                social: {
                    ...prev.social,
                    followersCount: Math.max(0, (prev.social?.followersCount || 0) + (wasFollowing ? 1 : -1))
                }
            }));
            console.error('Error following/unfollowing:', error);
            toast.error(error.response?.data?.error || 'Failed to follow user', 'Error');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Profile link copied to clipboard!', 'Copied');
    };

    const handleReport = () => {
        toast.info('Report feature coming soon', 'Coming Soon');
    };

    const mockAchievements = [
        { id: 1, name: 'First Trade', icon: '🎯', earned: true },
        { id: 2, name: '10 Wins', icon: '🏆', earned: true },
        { id: 3, name: 'Hot Streak', icon: '🔥', earned: true },
        { id: 4, name: '100% Profit', icon: '💎', earned: true },
        { id: 5, name: 'Speed Trader', icon: '⚡', earned: false },
        { id: 6, name: 'Millionaire', icon: '💰', earned: false },
        { id: 7, name: 'Long Term', icon: '📈', earned: false },
        { id: 8, name: 'Risk Taker', icon: '🎲', earned: false },
    ];

    const mockActivity = [
        { id: 1, type: 'trade', text: 'Bought 50 shares of AAPL', time: '2 hours ago', icon: TrendingUp },
        { id: 2, type: 'achievement', text: 'Earned "Hot Streak" badge', time: '5 hours ago', icon: Award },
        { id: 3, type: 'trade', text: 'Sold 100 shares of TSLA for +15% profit', time: '1 day ago', icon: DollarSign },
        { id: 4, type: 'follow', text: 'Started following 3 new traders', time: '2 days ago', icon: Users },
    ];

    const performanceData = [
        { month: 'Jan', profit: 5 },
        { month: 'Feb', profit: 12 },
        { month: 'Mar', profit: -3 },
        { month: 'Apr', profit: 18 },
        { month: 'May', profit: 25 },
        { month: 'Jun', profit: 15 },
    ];

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Loading profile...</div>
                </LoadingContainer>
            </PageContainer>
        );
    }

    if (profile?.private) {
        return (
            <PageContainer>
                <TopBar>
                    <BackButton onClick={() => navigate('/leaderboard')}>
                        <ChevronLeft size={20} />
                        Back to Leaderboard
                    </BackButton>
                </TopBar>
                <PrivateMessage>
                    <PrivateIcon>
                        <Lock size={40} />
                    </PrivateIcon>
                    <PrivateTitle>Profile is Private</PrivateTitle>
                    <PrivateText>
                        This trader's profile is private or does not exist.
                    </PrivateText>
                </PrivateMessage>
            </PageContainer>
        );
    }

    if (!profile) {
        return (
            <PageContainer>
                <TopBar>
                    <BackButton onClick={() => navigate('/leaderboard')}>
                        <ChevronLeft size={20} />
                        Back to Leaderboard
                    </BackButton>
                </TopBar>
                <EmptyState>
                    <Trophy size={64} color="#ffd700" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>Profile Not Found</h2>
                    <p>This trader's profile could not be loaded.</p>
                </EmptyState>
            </PageContainer>
        );
    }

    const isOwnProfile = (profile.userId || profile._id) === currentUser?.id;

    return (
        <PageContainer>
            <TopBar>
                <BackButton onClick={() => navigate('/leaderboard')}>
                    <ChevronLeft size={20} />
                    Back to Leaderboard
                </BackButton>
                <RefreshButton 
                    onClick={handleRefresh} 
                    disabled={refreshing}
                    $loading={refreshing}
                >
                    <RefreshCw size={16} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </RefreshButton>
            </TopBar>

            <ProfileHeader>
                <HeaderTop>
                    <UserInfoSection>
                        <AvatarLarge $src={profile.profile?.avatar} $rank={profile.stats?.rank}>
                            {!profile.profile?.avatar && (profile.profile?.displayName?.charAt(0) || profile.username?.charAt(0) || 'T')}
                            {profile.stats?.rank && (
                                <RankBadge $rank={profile.stats.rank}>
                                    #{profile.stats.rank}
                                </RankBadge>
                            )}
                        </AvatarLarge>

                        <UserDetails>
                            <DisplayName>
                                {profile.profile?.displayName || profile.username || 'Anonymous Trader'}
                                {profile.stats?.rank === 1 && <Crown size={32} color="#ffd700" />}
                                {profile.profile?.badges?.includes('verified') && <Check size={24} color="#10b981" />}
                            </DisplayName>
                            <UserBio>
                                {profile.profile?.bio || 'This trader prefers to remain mysterious...'}
                            </UserBio>
                            <UserMeta>
                                <MetaItem>
                                    <Calendar size={16} />
                                    Joined {new Date(profile.date || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </MetaItem>
                                <MetaItem>
                                    <Users size={16} />
                                    {profile.social?.followersCount || 0} Followers
                                </MetaItem>
                                <MetaItem>
                                    <Eye size={16} />
                                    {profile.social?.followingCount || 0} Following
                                </MetaItem>
                            </UserMeta>
                        </UserDetails>
                    </UserInfoSection>

                    <ActionButtons>
                        {isOwnProfile ? (
                            <>
                                <ActionButton $primary onClick={() => navigate('/settings')}>
                                    <Settings size={18} />
                                    Edit Profile
                                </ActionButton>
                                <ActionButton onClick={handleShare}>
                                    <Share2 size={18} />
                                    Share
                                </ActionButton>
                            </>
                        ) : (
                            <>
                                <ActionButton 
                                    $primary={!isFollowing}
                                    $danger={isFollowing}
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus size={18} />
                                            {followLoading ? 'Loading...' : 'Unfollow'}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            {followLoading ? 'Loading...' : 'Follow'}
                                        </>
                                    )}
                                </ActionButton>
                                <ActionButton onClick={() => toast.info('Messaging coming soon!', 'Coming Soon')}>
                                    <MessageSquare size={18} />
                                    Message
                                </ActionButton>
                                <ActionButton onClick={handleShare}>
                                    <Share2 size={18} />
                                    Share
                                </ActionButton>
                                <ActionButton onClick={handleReport}>
                                    <Flag size={18} />
                                    Report
                                </ActionButton>
                            </>
                        )}
                    </ActionButtons>
                </HeaderTop>

                <StatsGrid>
                    <StatBox>
                        <StatLabel>Total Return</StatLabel>
                        <StatValue $positive={(profile.stats?.totalReturnPercent || 0) >= 0} $negative={(profile.stats?.totalReturnPercent || 0) < 0}>
                            {(profile.stats?.totalReturnPercent || 0) >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                            {(profile.stats?.totalReturnPercent || 0) >= 0 ? '+' : ''}
                            {(profile.stats?.totalReturnPercent || 0).toFixed(2)}%
                        </StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Win Rate</StatLabel>
                        <StatValue>
                            {(profile.stats?.winRate || 0).toFixed(1)}%
                        </StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Total Trades</StatLabel>
                        <StatValue>
                            {profile.stats?.totalTrades || 0}
                        </StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Best Trade</StatLabel>
                        <StatValue $positive>
                            <ArrowUpRight size={20} />
                            +{(profile.stats?.bestTrade || 0).toFixed(2)}%
                        </StatValue>
                    </StatBox>
                    <StatBox>
                        <StatLabel>Current Streak</StatLabel>
                        <StatValue>
                            <Flame size={20} />
                            {profile.stats?.currentStreak || 0}
                        </StatValue>
                    </StatBox>
                </StatsGrid>
            </ProfileHeader>

            <TabsContainer>
                <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                    <BarChart3 size={18} />
                    Overview
                </Tab>
                <Tab $active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')}>
                    <Award size={18} />
                    Achievements
                </Tab>
                <Tab $active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
                    <Activity size={18} />
                    Activity
                </Tab>
                {profile.profile?.showPortfolio && (
                    <Tab $active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')}>
                        <Target size={18} />
                        Portfolio
                    </Tab>
                )}
            </TabsContainer>

            <ContentContainer>
                {activeTab === 'overview' && (
                    <SectionGrid>
                        <Card>
                            <CardTitle>
                                <TrendingUp size={24} />
                                Performance Chart
                            </CardTitle>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ffd700" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#ffd700" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 215, 0, 0.2)" />
                                    <XAxis dataKey="month" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid rgba(255, 215, 0, 0.5)',
                                            borderRadius: '8px',
                                            color: '#e0e6ed'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="profit"
                                        stroke="#ffd700"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorProfit)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>

                        <Card>
                            <CardTitle>
                                <Award size={24} />
                                Recent Achievements
                            </CardTitle>
                            <AchievementGrid>
                                {mockAchievements.slice(0, 6).map(achievement => (
                                    <Achievement key={achievement.id} $earned={achievement.earned}>
                                        <AchievementIcon>{achievement.icon}</AchievementIcon>
                                        <AchievementName>{achievement.name}</AchievementName>
                                    </Achievement>
                                ))}
                            </AchievementGrid>
                        </Card>
                    </SectionGrid>
                )}

                {activeTab === 'achievements' && (
                    <Card>
                        <CardTitle>
                            <Trophy size={24} />
                            All Achievements ({mockAchievements.filter(a => a.earned).length}/{mockAchievements.length})
                        </CardTitle>
                        <AchievementGrid>
                            {mockAchievements.map(achievement => (
                                <Achievement key={achievement.id} $earned={achievement.earned}>
                                    <AchievementIcon>{achievement.icon}</AchievementIcon>
                                    <AchievementName>{achievement.name}</AchievementName>
                                </Achievement>
                            ))}
                        </AchievementGrid>
                    </Card>
                )}

                {activeTab === 'activity' && (
                    <Card>
                        <CardTitle>
                            <Activity size={24} />
                            Recent Activity
                        </CardTitle>
                        <ActivityFeed>
                            {mockActivity.map(activity => {
                                const Icon = activity.icon;
                                return (
                                    <ActivityItem key={activity.id}>
                                        <ActivityIcon $type={activity.type}>
                                            <Icon size={20} />
                                        </ActivityIcon>
                                        <ActivityContent>
                                            <ActivityText>{activity.text}</ActivityText>
                                            <ActivityTime>{activity.time}</ActivityTime>
                                        </ActivityContent>
                                    </ActivityItem>
                                );
                            })}
                        </ActivityFeed>
                    </Card>
                )}

                {activeTab === 'portfolio' && (
                    <Card>
                        <CardTitle>
                            <Lock size={24} />
                            Portfolio
                        </CardTitle>
                        {profile.profile?.showPortfolio ? (
                            <EmptyState>
                                <EmptyIcon>
                                    <Briefcase size={40} />
                                </EmptyIcon>
                                <EmptyText>Portfolio sharing coming soon!</EmptyText>
                            </EmptyState>
                        ) : (
                            <EmptyState>
                                <EmptyIcon>
                                    <Lock size={40} />
                                </EmptyIcon>
                                <EmptyText>This trader's portfolio is private</EmptyText>
                            </EmptyState>
                        )}
                    </Card>
                )}
            </ContentContainer>
        </PageContainer>
    );
};

export default PublicProfilePage;