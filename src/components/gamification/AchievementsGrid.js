// client/src/components/gamification/AchievementsGrid.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Award, Lock, Star, TrendingUp, CheckCircle, Trophy } from 'lucide-react'; // ✅ ADDED Trophy

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
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

const Container = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const Title = styled.h2`
    font-size: 1.8rem;
    color: #00adef;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ProgressStats = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ProgressBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 20px;
    color: #a78bfa;
    font-weight: 700;
`;

const FilterTabs = styled.div`
    display: flex;
    gap: 0.75rem;
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

const FilterTab = styled.button`
    padding: 0.6rem 1.2rem;
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
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
    }
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;

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
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    opacity: ${props => props.$unlocked ? 1 : 0.6};

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 40px ${props => {
            if (!props.$unlocked) return 'rgba(100, 116, 139, 0.2)';
            if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.4)';
            if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.4)';
            if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.4)';
            return 'rgba(16, 185, 129, 0.4)';
        }};
        ${props => !props.$unlocked && `
            animation: ${shake} 0.5s ease-in-out;
        `}
    }

    ${props => props.$unlocked && `
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
`;

const IconContainer = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
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
    font-size: 2rem;
    flex-shrink: 0;
    position: relative;

    ${props => props.$unlocked && `
        animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const CardInfo = styled.div`
    flex: 1;
`;

const CardTitle = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.$unlocked ? '#e0e6ed' : '#64748b'};
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RarityBadge = styled.span`
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
`;

const CardDescription = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$unlocked ? '#94a3b8' : '#64748b'};
    line-height: 1.5;
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    position: relative;
    z-index: 1;
`;

const PointsBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
    font-size: 0.85rem;
`;

const UnlockedDate = styled.div`
    font-size: 0.75rem;
    color: #10b981;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const LockedOverlay = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    opacity: 0.6;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: #94a3b8;
    grid-column: 1 / -1;
`;

const AchievementsGrid = () => {
    const { api } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const response = await api.get('/gamification/achievements');
            if (response.data.success) {
                setAchievements(response.data.achievements);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAchievements = achievements.filter(achievement => {
        if (filter === 'all') return true;
        if (filter === 'unlocked') return achievement.unlocked;
        if (filter === 'locked') return !achievement.unlocked;
        return achievement.rarity === filter;
    });

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return (
        <Container>
            <Header>
                <Title>
                    <Award size={28} />
                    Achievements
                </Title>
                <ProgressStats>
                    <ProgressBadge>
                        <Trophy size={18} />
                        {unlockedCount} / {totalCount} Unlocked
                    </ProgressBadge>
                    <ProgressBadge>
                        <TrendingUp size={18} />
                        {progressPercent.toFixed(0)}%
                    </ProgressBadge>
                </ProgressStats>
            </Header>

            <FilterTabs>
                <FilterTab $active={filter === 'all'} onClick={() => setFilter('all')}>
                    All
                </FilterTab>
                <FilterTab $active={filter === 'unlocked'} onClick={() => setFilter('unlocked')}>
                    Unlocked
                </FilterTab>
                <FilterTab $active={filter === 'locked'} onClick={() => setFilter('locked')}>
                    Locked
                </FilterTab>
                <FilterTab $active={filter === 'common'} onClick={() => setFilter('common')}>
                    Common
                </FilterTab>
                <FilterTab $active={filter === 'rare'} onClick={() => setFilter('rare')}>
                    Rare
                </FilterTab>
                <FilterTab $active={filter === 'epic'} onClick={() => setFilter('epic')}>
                    Epic
                </FilterTab>
                <FilterTab $active={filter === 'legendary'} onClick={() => setFilter('legendary')}>
                    Legendary
                </FilterTab>
            </FilterTabs>

            {loading ? (
                <EmptyState>Loading achievements...</EmptyState>
            ) : filteredAchievements.length === 0 ? (
                <EmptyState>No achievements found for this filter</EmptyState>
            ) : (
                <Grid>
                    {filteredAchievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            $unlocked={achievement.unlocked}
                            $rarity={achievement.rarity}
                        >
                            {!achievement.unlocked && (
                                <LockedOverlay>
                                    <Lock size={48} color="#64748b" />
                                </LockedOverlay>
                            )}

                            <CardHeader>
                                <IconContainer 
                                    $unlocked={achievement.unlocked}
                                    $rarity={achievement.rarity}
                                >
                                    {achievement.unlocked ? achievement.icon : '🔒'}
                                </IconContainer>
                                <CardInfo>
                                    <CardTitle $unlocked={achievement.unlocked}>
                                        {achievement.name}
                                        <RarityBadge $rarity={achievement.rarity}>
                                            {achievement.rarity}
                                        </RarityBadge>
                                    </CardTitle>
                                    <CardDescription $unlocked={achievement.unlocked}>
                                        {achievement.description}
                                    </CardDescription>
                                </CardInfo>
                            </CardHeader>

                            <CardFooter>
                                <PointsBadge>
                                    <Star size={14} />
                                    +{achievement.points} XP
                                </PointsBadge>
                                {achievement.unlocked && achievement.unlockedAt && (
                                    <UnlockedDate>
                                        <CheckCircle size={14} />
                                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </UnlockedDate>
                                )}
                            </CardFooter>
                        </AchievementCard>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default AchievementsGrid;