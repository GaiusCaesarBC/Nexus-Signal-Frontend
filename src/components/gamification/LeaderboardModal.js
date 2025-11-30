// client/src/components/gamification/LeaderboardModal.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Trophy, TrendingUp, Zap, Users, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.95)'};
    border: 2px solid rgba(139, 92, 246, 0.4);
    border-radius: 20px;
    padding: 2rem;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${slideUp} 0.4s ease-out;
    position: relative;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(139, 92, 246, 0.1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 4px;

        &:hover {
            background: rgba(139, 92, 246, 0.7);
        }
    }
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const Title = styled.h2`
    font-size: 2rem;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 900;
`;

const CloseButton = styled.button`
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #ef4444;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
        transform: scale(1.1);
    }
`;

const Tabs = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    border-bottom: 2px solid rgba(139, 92, 246, 0.2);
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
        height: 4px;
    }
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.15) 100%)' : 
        'transparent'
    };
    border: none;
    border-bottom: 3px solid ${props => props.$active ? '#8b5cf6' : 'transparent'};
    color: ${props => props.$active ? '#a78bfa' : '#94a3b8'};
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        color: #a78bfa;
        background: rgba(139, 92, 246, 0.1);
    }
`;

const LeaderboardList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const LeaderboardItem = styled.div`
    background: ${props => {
        if (props.$isCurrentUser) return 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)';
        if (props.$rank === 1) return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, rgba(148, 163, 184, 0.05) 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)';
        return 'rgba(30, 41, 59, 0.6)';
    }};
    border: 2px solid ${props => {
        if (props.$isCurrentUser) return 'rgba(139, 92, 246, 0.5)';
        if (props.$rank === 1) return 'rgba(245, 158, 11, 0.4)';
        if (props.$rank === 2) return 'rgba(148, 163, 184, 0.4)';
        if (props.$rank === 3) return 'rgba(205, 127, 50, 0.4)';
        return 'rgba(100, 116, 139, 0.3)';
    }};
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateX(5px);
        border-color: ${props => props.$isCurrentUser ? 'rgba(139, 92, 246, 0.8)' : 'rgba(100, 116, 139, 0.5)'};
    }

    ${props => props.$rank <= 3 && `
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

    ${props => props.$isCurrentUser && `
        animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const RankBadge = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #f59e0b, #d97706)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #94a3b8, #64748b)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #a0522d)';
        return 'rgba(139, 92, 246, 0.3)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 1.3rem;
    flex-shrink: 0;
    border: 2px solid ${props => {
        if (props.$rank === 1) return '#fbbf24';
        if (props.$rank === 2) return '#cbd5e1';
        if (props.$rank === 3) return '#cd7f32';
        return 'rgba(139, 92, 246, 0.5)';
    }};
    position: relative;
    z-index: 1;

    ${props => props.$rank <= 3 && `
        box-shadow: 0 4px 20px ${props.$rank === 1 ? 'rgba(245, 158, 11, 0.5)' : props.$rank === 2 ? 'rgba(148, 163, 184, 0.5)' : 'rgba(205, 127, 50, 0.5)'};
    `}
`;

const UserInfo = styled.div`
    flex: 1;
    position: relative;
    z-index: 1;
`;

const Username = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: #e0e6ed;
    margin-bottom: 0.25rem;
`;

const UserLevel = styled.div`
    font-size: 0.9rem;
    color: #94a3b8;
`;

const Stats = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    position: relative;
    z-index: 1;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: #a78bfa;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
`;

const YourRankCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 2px solid rgba(139, 92, 246, 0.5);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: center;
`;

const YourRankTitle = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const YourRankValue = styled.div`
    font-size: 3rem;
    font-weight: 900;
    color: #a78bfa;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
`;

const LeaderboardModal = ({ isOpen, onClose }) => {
    const { api } = useAuth();
    const [activeTab, setActiveTab] = useState('xp');
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchLeaderboard(activeTab);
        }
    }, [isOpen, activeTab]);

    const fetchLeaderboard = async (type) => {
        try {
            setLoading(true);
            const response = await api.get(`/gamification/leaderboard?type=${type}&limit=20`);
            
            if (response.data.success) {
                setLeaderboard(response.data.leaderboard);
                setUserRank(response.data.userRank);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'xp', label: 'Total XP', icon: TrendingUp },
        { id: 'coins', label: 'Nexus Coins', icon: Zap },
        { id: 'streak', label: 'Login Streak', icon: Trophy },
        { id: 'trades', label: 'Total Trades', icon: Users },
    ];

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>
                        <Trophy size={32} />
                        Leaderboard
                    </Title>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </Header>

                {userRank && (
                    <YourRankCard>
                        <YourRankTitle>Your Rank</YourRankTitle>
                        <YourRankValue>#{userRank}</YourRankValue>
                    </YourRankCard>
                )}

                <Tabs>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <Tab
                                key={tab.id}
                                $active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </Tab>
                        );
                    })}
                </Tabs>

                {loading ? (
                    <EmptyState>Loading...</EmptyState>
                ) : leaderboard.length === 0 ? (
                    <EmptyState>No data available yet</EmptyState>
                ) : (
                    <LeaderboardList>
                        {leaderboard.map((entry, index) => {
                            const rank = index + 1;
                            const isCurrentUser = entry.user._id === api.defaults.headers.common['user-id'];

                            let statValue;
                            switch (activeTab) {
                                case 'xp':
                                    statValue = entry.xp?.toLocaleString() || '0';
                                    break;
                                case 'coins':
                                    statValue = entry.nexusCoins?.toLocaleString() || '0';
                                    break;
                                case 'streak':
                                    statValue = `${entry.loginStreak || 0} days`;
                                    break;
                                case 'trades':
                                    statValue = entry.stats?.totalTrades?.toLocaleString() || '0';
                                    break;
                                default:
                                    statValue = '0';
                            }

                            return (
                                <LeaderboardItem
                                    key={entry._id}
                                    $rank={rank}
                                    $isCurrentUser={isCurrentUser}
                                >
                                    <RankBadge $rank={rank}>
                                        {rank <= 3 ? <Crown size={24} /> : `#${rank}`}
                                    </RankBadge>
                                    <UserInfo>
                                        <Username>
                                            {entry.user.username || 'Anonymous'}
                                            {isCurrentUser && ' (You)'}
                                        </Username>
                                        <UserLevel>
                                            Level {entry.level} • {entry.rank}
                                        </UserLevel>
                                    </UserInfo>
                                    <Stats>
                                        <StatValue>{statValue}</StatValue>
                                        <StatLabel>
                                            {activeTab === 'xp' && 'Total XP'}
                                            {activeTab === 'coins' && 'Coins'}
                                            {activeTab === 'streak' && 'Streak'}
                                            {activeTab === 'trades' && 'Trades'}
                                        </StatLabel>
                                    </Stats>
                                </LeaderboardItem>
                            );
                        })}
                    </LeaderboardList>
                )}
            </Modal>
        </Overlay>
    );
};

export default LeaderboardModal;