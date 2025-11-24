// client/src/components/gamification/NavbarGamification.js - FIXED NaN ISSUES
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGamification } from '../../context/GamificationContext';
import { Star, Zap, TrendingUp, Trophy, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const slideDown = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;

    @media (max-width: 968px) {
        display: none;
    }
`;

const StatBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: ${props => props.$variant === 'coins' 
        ? 'rgba(245, 158, 11, 0.15)' 
        : 'rgba(139, 92, 246, 0.15)'
    };
    border: 1px solid ${props => props.$variant === 'coins' 
        ? 'rgba(245, 158, 11, 0.3)' 
        : 'rgba(139, 92, 246, 0.3)'
    };
    border-radius: 20px;
    color: ${props => props.$variant === 'coins' ? '#f59e0b' : '#a78bfa'};
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        background: ${props => props.$variant === 'coins' 
            ? 'rgba(245, 158, 11, 0.25)' 
            : 'rgba(139, 92, 246, 0.25)'
        };
        border-color: ${props => props.$variant === 'coins' 
            ? 'rgba(245, 158, 11, 0.5)' 
            : 'rgba(139, 92, 246, 0.5)'
        };
        transform: translateY(-2px);
    }
`;

const LevelBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 20px;
    color: #a78bfa;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%);
        border-color: rgba(139, 92, 246, 0.6);
        transform: translateY(-2px);
    }
`;

const LevelIcon = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 0.7rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const XPBarContainer = styled.div`
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }
`;

const XPBarWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 20px;
    min-width: 150px;

    &:hover {
        background: rgba(16, 185, 129, 0.25);
        border-color: rgba(16, 185, 129, 0.5);
    }
`;

const XPInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
`;

const XPLabel = styled.div`
    color: #94a3b8;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const XPBar = styled.div`
    width: 100%;
    height: 4px;
    background: rgba(16, 185, 129, 0.2);
    border-radius: 2px;
    overflow: hidden;
`;

const XPFill = styled.div`
    height: 100%;
    width: ${props => Math.min(Math.max(props.$progress || 0, 0), 100)}%;
    background: linear-gradient(90deg, #10b981, #00adef);
    border-radius: 2px;
    transition: width 0.3s ease;
`;

const XPValue = styled.div`
    color: #10b981;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
`;

const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(139, 92, 246, 0.4);
    border-radius: 16px;
    padding: 1rem;
    min-width: 280px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: ${slideDown} 0.3s ease-out;
    z-index: 10000;
`;

const DropdownHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
`;

const DropdownTitle = styled.div`
    color: #a78bfa;
    font-weight: 700;
    font-size: 0.9rem;
`;

const RankText = styled.div`
    color: #94a3b8;
    font-size: 0.8rem;
`;

const DropdownStats = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
`;

const DropdownStat = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatValue = styled.div`
    color: ${props => props.$color || '#e0e6ed'};
    font-weight: 700;
    font-size: 0.9rem;
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
`;

const ProgressFill = styled.div`
    height: 100%;
    width: ${props => Math.min(Math.max(props.$progress || 0, 0), 100)}%;
    background: linear-gradient(90deg, #8b5cf6, #00adef);
    border-radius: 4px;
    transition: width 0.5s ease;
`;

const DropdownActions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(139, 92, 246, 0.2);
`;

const ActionButton = styled.button`
    flex: 1;
    padding: 0.5rem 0.75rem;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 8px;
    color: #a78bfa;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: rgba(139, 92, 246, 0.3);
        border-color: rgba(139, 92, 246, 0.6);
        transform: translateY(-2px);
    }
`;

const NavbarGamification = () => {
    const { gamificationData, loading } = useGamification();
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    if (loading || !gamificationData) {
        return null;
    }

    // ✅ FIXED: Add fallback values for ALL fields to prevent NaN
    const {
        level = 1,
        rank = 'Beginner',
        xp = 0,
        nexusCoins = 0,
        loginStreak = 0,
        progressPercent = 0,
        xpInCurrentLevel = 0,
        xpForNextLevel = 100
    } = gamificationData || {};

    // ✅ FIXED: Safe calculation with fallbacks
    const safeLevel = level || 1;
    const safeXpForNextLevel = xpForNextLevel || 100;
    const safeXpInCurrentLevel = xpInCurrentLevel || 0;
    
    // Calculate XP needed for display
    const xpNeeded = Math.max(safeXpForNextLevel - Math.pow(Math.max(safeLevel - 1, 0), 2) * 100, 100);
    
    // Ensure progress percent is valid (0-100)
    const safeProgress = Math.min(Math.max(progressPercent || 0, 0), 100);

    return (
        <Container>
            {/* Level Badge */}
            <LevelBadge onClick={() => navigate('/achievements')}>
                <LevelIcon>{safeLevel}</LevelIcon>
                <span>Level {safeLevel}</span>
            </LevelBadge>

            {/* XP Progress */}
            <XPBarContainer onClick={() => setShowDropdown(!showDropdown)}>
                <XPBarWrapper>
                    <XPInfo>
                        <XPLabel>XP Progress</XPLabel>
                        <XPBar>
                            <XPFill $progress={safeProgress} />
                        </XPBar>
                    </XPInfo>
                    {/* ✅ FIXED: Show clean numbers, no NaN */}
                    <XPValue>{Math.floor(safeXpInCurrentLevel)}/{xpNeeded}</XPValue>
                </XPBarWrapper>

                {showDropdown && (
                    <Dropdown onClick={(e) => e.stopPropagation()}>
                        <DropdownHeader>
                            <div>
                                <DropdownTitle>Level {safeLevel}</DropdownTitle>
                                <RankText>{rank || 'Beginner'}</RankText>
                            </div>
                            <Star size={24} color="#f59e0b" />
                        </DropdownHeader>

                        <DropdownStats>
                            <DropdownStat>
                                <StatLabel>
                                    <TrendingUp size={16} />
                                    Total XP
                                </StatLabel>
                                <StatValue $color="#a78bfa">
                                    {(xp || 0).toLocaleString()}
                                </StatValue>
                            </DropdownStat>

                            <DropdownStat>
                                <StatLabel>
                                    <Zap size={16} />
                                    Nexus Coins
                                </StatLabel>
                                <StatValue $color="#f59e0b">
                                    {(nexusCoins || 0).toLocaleString()}
                                </StatValue>
                            </DropdownStat>

                            <DropdownStat>
                                <StatLabel>
                                    🔥 Login Streak
                                </StatLabel>
                                <StatValue $color="#10b981">
                                    {loginStreak || 0} days
                                </StatValue>
                            </DropdownStat>
                        </DropdownStats>

                        <div>
                            <StatLabel style={{ marginBottom: '0.5rem' }}>
                                Progress to Level {safeLevel + 1}
                            </StatLabel>
                            <ProgressBar>
                                <ProgressFill $progress={safeProgress} />
                            </ProgressBar>
                        </div>

                        <DropdownActions>
                            <ActionButton onClick={() => {
                                navigate('/achievements');
                                setShowDropdown(false);
                            }}>
                                <Trophy size={16} />
                                Achievements
                            </ActionButton>
                            <ActionButton onClick={() => {
                                navigate('/leaderboard');
                                setShowDropdown(false);
                            }}>
                                <Trophy size={16} />
                                Leaderboard
                            </ActionButton>
                        </DropdownActions>
                    </Dropdown>
                )}
            </XPBarContainer>

            {/* Coins Badge */}
            <StatBadge $variant="coins" onClick={() => navigate('/vault')}>
                <Zap size={16} />
                {(nexusCoins || 0).toLocaleString()}
            </StatBadge>
        </Container>
    );
};

export default NavbarGamification;