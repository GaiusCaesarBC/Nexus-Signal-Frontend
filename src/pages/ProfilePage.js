// client/src/pages/ProfilePage.js - THE MOST LEGENDARY PROFILE PAGE EVER

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Mail, Calendar, Shield, TrendingUp, DollarSign,
    Award, Star, Zap, Settings, Edit, Camera, Crown,
    Activity, PieChart, Eye, Brain, Trophy, Flame,
    Target, ArrowUpRight, Sparkles
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
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.6); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 6rem 2rem 2rem;
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
    font-size: 3rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

// ============ PROFILE HEADER ============
const ProfileHeader = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    padding: 2.5rem;
    animation: ${fadeIn} 0.6s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #00adef, #00ff88);
    }
`;

const ProfileTop = styled.div`
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

const AvatarSection = styled.div`
    position: relative;
`;

const Avatar = styled.div`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    font-weight: 900;
    color: white;
    box-shadow: 0 10px 40px rgba(0, 173, 237, 0.5);
    animation: ${glow} 3s ease-in-out infinite;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }
`;

const EditAvatarButton = styled.button`
    position: absolute;
    bottom: 5px;
    right: 5px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 173, 237, 0.9);
    border: 2px solid white;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
        background: #00adef;
        transform: scale(1.1);
    }
`;

const BadgeContainer = styled.div`
    position: absolute;
    top: -10px;
    right: -10px;
    animation: ${float} 3s ease-in-out infinite;
`;

const Badge = styled.div`
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.5);
    animation: ${rotate} 20s linear infinite;
`;

const UserInfo = styled.div`
    flex: 1;
`;

const UserName = styled.h2`
    font-size: 2.5rem;
    color: #00adef;
    margin-bottom: 0.5rem;
    font-weight: 900;
`;

const UserEmail = styled.div`
    color: #94a3b8;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const MemberSince = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.15);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.9rem;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.4);
    }
`;

// ============ STATS GRID ============
const StatsGrid = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
    animation-delay: ${props => props.delay}s;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.3);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${props => {
            if (props.variant === 'success') return 'linear-gradient(90deg, #10b981, #059669)';
            if (props.variant === 'danger') return 'linear-gradient(90deg, #ef4444, #dc2626)';
            if (props.variant === 'warning') return 'linear-gradient(90deg, #f59e0b, #d97706)';
            return 'linear-gradient(90deg, #00adef, #0088cc)';
        }};
    }
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    background: ${props => {
        if (props.variant === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.2)';
        if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        if (props.variant === 'warning') return '#f59e0b';
        return '#00adef';
    }};
    animation: ${pulse} 2s ease-in-out infinite;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2.5rem;
    font-weight: 900;
    color: ${props => {
        if (props.variant === 'success') return '#10b981';
        if (props.variant === 'danger') return '#ef4444';
        if (props.variant === 'warning') return '#f59e0b';
        return '#00adef';
    }};
`;

// ============ ACHIEVEMENTS ============
const AchievementsSection = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const SectionTitle = styled.h2`
    font-size: 1.8rem;
    color: #00adef;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const AchievementsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
`;

const AchievementBadge = styled.div`
    background: ${props => props.unlocked ? 
        'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)' : 
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.unlocked ? 'rgba(245, 158, 11, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    opacity: ${props => props.unlocked ? 1 : 0.5};

    &:hover {
        transform: ${props => props.unlocked ? 'translateY(-5px) scale(1.05)' : 'none'};
        box-shadow: ${props => props.unlocked ? '0 10px 30px rgba(245, 158, 11, 0.4)' : 'none'};
    }
`;

const AchievementIcon = styled.div`
    font-size: 3rem;
    margin-bottom: 0.5rem;
    animation: ${props => props.unlocked ? pulse : 'none'} 2s ease-in-out infinite;
`;

const AchievementName = styled.div`
    color: ${props => props.unlocked ? '#f59e0b' : '#64748b'};
    font-weight: 700;
    margin-bottom: 0.25rem;
`;

const AchievementDesc = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
`;

// ============ ACTIVITY FEED ============
const ActivityFeed = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 1s ease-out;
`;

const ActivityItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.1);
    border-radius: 12px;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    animation: ${slideIn} 0.5s ease-out;
    animation-delay: ${props => props.index * 0.1}s;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const ActivityIconWrapper = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => {
        if (props.type === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.type === 'warning') return 'rgba(245, 158, 11, 0.2)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    color: ${props => {
        if (props.type === 'success') return '#10b981';
        if (props.type === 'warning') return '#f59e0b';
        return '#00adef';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ActivityContent = styled.div`
    flex: 1;
`;

const ActivityText = styled.div`
    color: #e0e6ed;
    margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
`;

const LoadingSpinner = styled(Sparkles)`
    animation: ${rotate} 1s linear infinite;
    color: #00adef;
`;

// ============ COMPONENT ============
const ProfilePage = () => {
    const { user, api } = useAuth();
    const toast = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            
            // Fetch portfolio stats
            const portfolioRes = await api.get('/portfolio');
            const holdings = portfolioRes.data.holdings || [];
            
            // Calculate stats
            const totalValue = holdings.reduce((sum, h) => {
                const price = h.currentPrice || h.current_price || h.price || 0;
                const shares = h.shares || h.quantity || 0;
                return sum + (price * shares);
            }, 0);

            // Fetch watchlist
            const watchlistRes = await api.get('/watchlist');
            const watchlist = watchlistRes.data.watchlist || [];

            setStats({
                portfolioValue: totalValue,
                holdingsCount: holdings.length,
                watchlistCount: watchlist.length,
                predictionsCount: 47, // Mock for now
                accuracyRate: 92.5, // Mock for now
                totalGain: totalValue * 0.15 // Mock 15% gain
            });

        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast.error('Failed to load profile data', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const getUserInitials = () => {
        if (!user?.name) return user?.email?.[0]?.toUpperCase() || 'U';
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getMemberSince = () => {
        if (!user?.date) return 'Recently';
        const date = new Date(user.date);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const achievements = [
        { id: 1, name: 'First Trade', icon: '🎯', desc: 'Made your first trade', unlocked: true },
        { id: 2, name: 'Portfolio Pro', icon: '💼', desc: 'Portfolio worth $10,000+', unlocked: stats?.portfolioValue > 10000 },
        { id: 3, name: 'Watchlist Master', icon: '👁️', desc: 'Track 10+ stocks', unlocked: stats?.watchlistCount >= 10 },
        { id: 4, name: 'AI Expert', icon: '🤖', desc: 'Made 50+ predictions', unlocked: stats?.predictionsCount >= 50 },
        { id: 5, name: 'Diamond Hands', icon: '💎', desc: 'Held position for 30 days', unlocked: false },
        { id: 6, name: 'Profit Maker', icon: '💰', desc: 'Earned $1,000+ profit', unlocked: stats?.totalGain > 1000 },
    ];

    const recentActivity = [
        { type: 'success', icon: TrendingUp, text: 'Added AAPL to portfolio', time: '2 hours ago' },
        { type: 'default', icon: Eye, text: 'Added TSLA to watchlist', time: '5 hours ago' },
        { type: 'success', icon: Brain, text: 'Generated AI prediction for NVDA', time: '1 day ago' },
        { type: 'warning', icon: Target, text: 'Portfolio milestone: $50k', time: '2 days ago' },
    ];

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>My Profile</Title>
                <Subtitle>Your trading journey at a glance</Subtitle>
            </Header>

            {/* PROFILE HEADER */}
            <ProfileHeader>
                <ProfileTop>
                    <AvatarSection>
                        <Avatar>
                            {getUserInitials()}
                        </Avatar>
                        <BadgeContainer>
                            <Badge>
                                <Crown size={24} color="white" />
                            </Badge>
                        </BadgeContainer>
                        <EditAvatarButton onClick={() => toast.info('Avatar upload coming soon!', 'Coming Soon')}>
                            <Camera size={20} />
                        </EditAvatarButton>
                    </AvatarSection>

                    <UserInfo>
                        <UserName>{user?.name || 'Trader'}</UserName>
                        <UserEmail>
                            <Mail size={18} />
                            {user?.email}
                        </UserEmail>
                        <MemberSince>
                            <Calendar size={16} />
                            Member since {getMemberSince()}
                        </MemberSince>
                        <ActionButtons>
                            <ActionButton onClick={() => window.location.href = '/settings'}>
                                <Settings size={18} />
                                Edit Profile
                            </ActionButton>
                            <ActionButton onClick={() => toast.info('Share profile coming soon!', 'Coming Soon')}>
                                <Sparkles size={18} />
                                Share Profile
                            </ActionButton>
                        </ActionButtons>
                    </UserInfo>
                </ProfileTop>
            </ProfileHeader>

            {/* STATS GRID */}
            <StatsGrid>
                <StatCard delay={0}>
                    <StatIcon>
                        <DollarSign size={24} />
                    </StatIcon>
                    <StatLabel>Portfolio Value</StatLabel>
                    <StatValue>
                        ${stats?.portfolioValue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                    </StatValue>
                </StatCard>

                <StatCard delay={0.1} variant="success">
                    <StatIcon variant="success">
                        <TrendingUp size={24} />
                    </StatIcon>
                    <StatLabel>Total Gain</StatLabel>
                    <StatValue variant="success">
                        +${stats?.totalGain?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                    </StatValue>
                </StatCard>

                <StatCard delay={0.2}>
                    <StatIcon>
                        <PieChart size={24} />
                    </StatIcon>
                    <StatLabel>Holdings</StatLabel>
                    <StatValue>{stats?.holdingsCount || 0}</StatValue>
                </StatCard>

                <StatCard delay={0.3}>
                    <StatIcon>
                        <Eye size={24} />
                    </StatIcon>
                    <StatLabel>Watchlist</StatLabel>
                    <StatValue>{stats?.watchlistCount || 0}</StatValue>
                </StatCard>

                <StatCard delay={0.4} variant="warning">
                    <StatIcon variant="warning">
                        <Brain size={24} />
                    </StatIcon>
                    <StatLabel>AI Predictions</StatLabel>
                    <StatValue variant="warning">{stats?.predictionsCount || 0}</StatValue>
                </StatCard>

                <StatCard delay={0.5} variant="success">
                    <StatIcon variant="success">
                        <Target size={24} />
                    </StatIcon>
                    <StatLabel>Accuracy Rate</StatLabel>
                    <StatValue variant="success">{stats?.accuracyRate?.toFixed(1) || '0'}%</StatValue>
                </StatCard>
            </StatsGrid>

            {/* ACHIEVEMENTS */}
            <AchievementsSection>
                <SectionTitle>
                    <Trophy size={28} />
                    Achievements
                </SectionTitle>
                <AchievementsGrid>
                    {achievements.map(achievement => (
                        <AchievementBadge 
                            key={achievement.id} 
                            unlocked={achievement.unlocked}
                            onClick={() => achievement.unlocked && toast.success(`Achievement unlocked: ${achievement.name}!`, 'Congrats! 🎉')}
                        >
                            <AchievementIcon unlocked={achievement.unlocked}>
                                {achievement.icon}
                            </AchievementIcon>
                            <AchievementName unlocked={achievement.unlocked}>
                                {achievement.name}
                            </AchievementName>
                            <AchievementDesc>{achievement.desc}</AchievementDesc>
                        </AchievementBadge>
                    ))}
                </AchievementsGrid>
            </AchievementsSection>

            {/* RECENT ACTIVITY */}
            <ActivityFeed>
                <SectionTitle>
                    <Activity size={28} />
                    Recent Activity
                </SectionTitle>
                {recentActivity.map((activity, index) => (
                    <ActivityItem key={index} index={index}>
                        <ActivityIconWrapper type={activity.type}>
                            <activity.icon size={20} />
                        </ActivityIconWrapper>
                        <ActivityContent>
                            <ActivityText>{activity.text}</ActivityText>
                            <ActivityTime>{activity.time}</ActivityTime>
                        </ActivityContent>
                    </ActivityItem>
                ))}
            </ActivityFeed>
        </PageContainer>
    );
};

export default ProfilePage;