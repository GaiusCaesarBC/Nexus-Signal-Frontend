// client/src/components/leaderboard/LeaderboardRow.js
// Leaderboard row with vault integration (borders, badges)
// Use this to replace your existing leaderboard rows

import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Trophy, Medal } from 'lucide-react';
import AvatarWithBorder from '../vault/AvatarWithBorder';
import BadgeDisplay from '../vault/BadgeDisplay';
import api from '../../api/axios';

// ============ ANIMATIONS ============
const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulseGold = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
    50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.5); }
`;

// ============ STYLED COMPONENTS ============
const RowContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem 1.25rem;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, rgba(192, 192, 192, 0.12) 0%, rgba(192, 192, 192, 0.04) 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, rgba(205, 127, 50, 0.12) 0%, rgba(205, 127, 50, 0.04) 100%)';
        if (props.$isCurrentUser) return 'rgba(0, 173, 239, 0.08)';
        return 'rgba(30, 41, 59, 0.4)';
    }};
    border: 1px solid ${props => {
        if (props.$rank === 1) return 'rgba(255, 215, 0, 0.4)';
        if (props.$rank === 2) return 'rgba(192, 192, 192, 0.3)';
        if (props.$rank === 3) return 'rgba(205, 127, 50, 0.3)';
        if (props.$isCurrentUser) return 'rgba(0, 173, 239, 0.4)';
        return 'rgba(100, 116, 139, 0.2)';
    }};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    gap: 1rem;
    
    ${props => props.$rank === 1 && css`
        animation: ${pulseGold} 3s ease-in-out infinite;
    `}
    
    &:hover {
        transform: translateY(-2px);
        background: ${props => {
            if (props.$rank === 1) return 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)';
            if (props.$rank === 2) return 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.08) 100%)';
            if (props.$rank === 3) return 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.08) 100%)';
            return 'rgba(30, 41, 59, 0.6)';
        }};
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
`;

const RankSection = styled.div`
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const RankNumber = styled.span`
    font-size: ${props => props.$isTop3 ? '1.5rem' : '1.1rem'};
    font-weight: 800;
    color: ${props => {
        if (props.$rank === 1) return '#ffd700';
        if (props.$rank === 2) return '#c0c0c0';
        if (props.$rank === 3) return '#cd7f32';
        return '#94a3b8';
    }};
`;

const TrophyIcon = styled.div`
    font-size: 1.75rem;
    
    ${props => props.$rank === 1 && css`
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
    `}
`;

const UserSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const UserName = styled.span`
    font-weight: 700;
    color: #f8fafc;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    ${props => props.$rank === 1 && css`
        background: linear-gradient(135deg, #ffd700 0%, #ffec8b 50%, #ffd700 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: ${shimmer} 3s linear infinite;
    `}
`;

const LevelTag = styled.span`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #a78bfa;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    white-space: nowrap;
`;

const Username = styled.span`
    color: #64748b;
    font-size: 0.8rem;
`;

const BadgesRow = styled.div`
    display: flex;
    align-items: center;
    margin-top: 0.25rem;
    
    @media (max-width: 640px) {
        display: none;
    }
`;

const StatsSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    flex-shrink: 0;
`;

const MainStat = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${props => props.$positive ? '#10b981' : props.$negative ? '#ef4444' : '#f8fafc'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const SubStat = styled.div`
    font-size: 0.75rem;
    color: #64748b;
`;

const ChangeIndicator = styled.span`
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

// ============ COMPONENT ============
const LeaderboardRow = ({
    user,
    rank,
    stat,
    statLabel,
    subStat,
    change,
    isCurrentUser = false,
    onClick
}) => {
    const navigate = useNavigate();
    const [vaultData, setVaultData] = useState(null);
    const [vaultLoading, setVaultLoading] = useState(true);
    
    // Extract user info
    const userId = user?._id || user?.id;
    const userName = user?.name || user?.displayName || 'Anonymous';
    const userUsername = user?.username;
    const userAvatar = user?.profile?.avatar || user?.avatar;
    const userLevel = user?.gamification?.level || user?.level || 1;
    
    // Fetch vault data for this user
    useEffect(() => {
        const fetchVault = async () => {
            if (!userId) {
                setVaultLoading(false);
                return;
            }
            
            try {
                const response = await api.get(`/vault/user/${userId}`);
                if (response.data.success) {
                    setVaultData({
                        equippedBorder: response.data.equipped.border?.id || 'border-bronze',
                        equippedBadges: response.data.equipped.badges?.map(b => b.id) || [],
                        level: response.data.level || userLevel
                    });
                }
            } catch (err) {
                // Silently fail - will use defaults
            } finally {
                setVaultLoading(false);
            }
        };
        
        fetchVault();
    }, [userId, userLevel]);
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (userId) {
            navigate(`/profile/${userId}`);
        }
    };
    
    const equippedBorder = vaultData?.equippedBorder || 'border-bronze';
    const equippedBadges = vaultData?.equippedBadges || [];
    const level = vaultData?.level || userLevel;
    const isTop3 = rank <= 3;
    
    // Rank display
    const renderRank = () => {
        if (rank === 1) return <TrophyIcon $rank={1}>🥇</TrophyIcon>;
        if (rank === 2) return <TrophyIcon $rank={2}>🥈</TrophyIcon>;
        if (rank === 3) return <TrophyIcon $rank={3}>🥉</TrophyIcon>;
        return <RankNumber $rank={rank}>#{rank}</RankNumber>;
    };
    
    // Format stat value
    const formatStat = (value) => {
        if (typeof value === 'number') {
            if (Math.abs(value) >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`;
            }
            if (Math.abs(value) >= 1000) {
                return `$${(value / 1000).toFixed(1)}K`;
            }
            if (value % 1 !== 0) {
                return value.toFixed(2);
            }
            return value.toLocaleString();
        }
        return value;
    };
    
    const isPositive = typeof stat === 'number' && stat > 0;
    const isNegative = typeof stat === 'number' && stat < 0;
    
    return (
        <RowContainer 
            $rank={rank} 
            $isCurrentUser={isCurrentUser}
            onClick={handleClick}
        >
            <RankSection>
                {renderRank()}
            </RankSection>
            
            <UserSection>
                <AvatarWithBorder
                    src={userAvatar}
                    name={userName}
                    username={userUsername}
                    size={isTop3 ? 54 : 46}
                    borderId={vaultLoading ? 'border-bronze' : equippedBorder}
                />
                
                <UserInfo>
                    <TopRow>
                        <UserName $rank={rank}>{userName}</UserName>
                        <LevelTag>Lv.{level}</LevelTag>
                    </TopRow>
                    
                    {userUsername && <Username>@{userUsername}</Username>}
                    
                    {equippedBadges.length > 0 && (
                        <BadgesRow>
                            <BadgeDisplay
                                badges={equippedBadges}
                                maxDisplay={3}
                                size={20}
                                showTooltip={true}
                            />
                        </BadgesRow>
                    )}
                </UserInfo>
            </UserSection>
            
            <StatsSection>
                <MainStat $positive={isPositive} $negative={isNegative}>
                    {formatStat(stat)}
                    {change !== undefined && (
                        <ChangeIndicator $positive={change >= 0}>
                            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </ChangeIndicator>
                    )}
                </MainStat>
                {subStat && <SubStat>{subStat}</SubStat>}
                {statLabel && <SubStat>{statLabel}</SubStat>}
            </StatsSection>
        </RowContainer>
    );
};

export default LeaderboardRow;

// ============ USAGE EXAMPLE ============
/*
In your LeaderboardPage.js:

import LeaderboardRow from '../components/leaderboard/LeaderboardRow';

// In your render:
{leaderboardData.map((entry, index) => (
    <LeaderboardRow
        key={entry.user._id}
        user={entry.user}
        rank={index + 1}
        stat={entry.portfolioValue}
        statLabel="Portfolio"
        subStat={`${entry.profitPercent.toFixed(2)}% profit`}
        isCurrentUser={entry.user._id === currentUserId}
    />
))}
*/