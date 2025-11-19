// client/src/pages/ProfilePage.js - THE MOST LEGENDARY PROFILE PAGE EVER - ULTIMATE EDITION

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Mail, Calendar, Shield, TrendingUp, DollarSign,
    Award, Star, Zap, Settings, Edit, Camera, Crown,
    Activity, PieChart, Eye, Brain, Trophy, Flame,
    Target, ArrowUpRight, Sparkles, Clock, BarChart3,
    TrendingDown, ChevronRight, Medal, Users, Rocket,
    X, Check, ArrowUp, ChevronUp, Briefcase, Link as LinkIcon
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart as RechartsPie, Pie, Cell
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

const slideInRight = keyframes`
    from { transform: translateX(100%); opacity: 0; }
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

const progressFill = keyframes`
    from { width: 0%; }
    to { width: var(--progress-width); }
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

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
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
    align-items: start;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
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
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        justify-content: center;
        font-size: 2rem;
    }
`;

const EditButton = styled.button`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    color: #00adef;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: scale(1.1);
    }
`;

const UserBio = styled.p`
    color: #94a3b8;
    font-size: 1rem;
    margin-bottom: 1rem;
    font-style: italic;
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

const UserMetaRow = styled.div`
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        justify-content: center;
        flex-wrap: wrap;
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
        flex-wrap: wrap;
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

// ============ LEVEL SYSTEM ============
const LevelSection = styled.div`
    margin-top: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
`;

const LevelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;

const LevelInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const LevelBadge = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
`;

const LevelDetails = styled.div``;

const LevelTitle = styled.div`
    font-size: 1.3rem;
    font-weight: 700;
    color: #a78bfa;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const LevelName = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const XPText = styled.div`
    color: #a78bfa;
    font-size: 0.9rem;
    font-weight: 600;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    height: 12px;
    background: rgba(0, 173, 237, 0.2);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
`;

const ProgressBar = styled.div`
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
    border-radius: 6px;
    transition: width 1s ease-out;
    width: ${props => props.progress}%;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 2s linear infinite;
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
    animation-fill-mode: backwards;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;

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

// ============ TWO COLUMN LAYOUT ============
const TwoColumnGrid = styled.div`
    max-width: 1400px;
    margin: 0 auto 3rem;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

// ============ CHARTS & GRAPHS ============
const ChartSection = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
    margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.8rem;
    color: #00adef;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============ TIMELINE ============
const TimelineContainer = styled.div`
    position: relative;
    padding-left: 2rem;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(180deg, #00adef, #8b5cf6);
    }
`;

const TimelineItem = styled.div`
    position: relative;
    padding-bottom: 2rem;
    animation: ${slideIn} 0.5s ease-out;
    animation-delay: ${props => props.index * 0.1}s;
    animation-fill-mode: backwards;

    &::before {
        content: '';
        position: absolute;
        left: -2.5rem;
        top: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${props => {
            if (props.type === 'success') return '#10b981';
            if (props.type === 'danger') return '#ef4444';
            if (props.type === 'warning') return '#f59e0b';
            return '#00adef';
        }};
        box-shadow: 0 0 0 4px rgba(0, 173, 237, 0.2);
    }
`;

const TimelineDate = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TimelineContent = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const TimelineTitle = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    margin-bottom: 0.25rem;
`;

const TimelineDesc = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const TimelineValue = styled.div`
    color: ${props => props.positive ? '#10b981' : props.negative ? '#ef4444' : '#00adef'};
    font-weight: 700;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============ QUICK STATS DASHBOARD ============
const QuickStatsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const QuickStatCard = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: scale(1.02);
    }
`;

const QuickStatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
`;

const QuickStatValue = styled.div`
    color: #00adef;
    font-size: 1.3rem;
    font-weight: 900;
`;

// ============ LEADERBOARD ============
const LeaderboardSection = styled.div``;

const LeaderboardCard = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const LeaderboardRank = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => {
        if (props.rank === 1) return 'linear-gradient(135deg, #f59e0b, #d97706)';
        if (props.rank === 2) return 'linear-gradient(135deg, #94a3b8, #64748b)';
        if (props.rank === 3) return 'linear-gradient(135deg, #cd7f32, #8b4513)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: white;
    font-size: 1.1rem;
`;

const LeaderboardInfo = styled.div`
    flex: 1;
    margin-left: 1rem;
`;

const LeaderboardName = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    margin-bottom: 0.25rem;
`;

const LeaderboardScore = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const LeaderboardBadge = styled.div`
    padding: 0.25rem 0.75rem;
    background: ${props => props.isYou ? 'rgba(0, 173, 237, 0.2)' : 'rgba(100, 116, 139, 0.2)'};
    border: 1px solid ${props => props.isYou ? 'rgba(0, 173, 237, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.isYou ? '#00adef' : '#94a3b8'};
    font-size: 0.85rem;
    font-weight: 600;
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

// ============ EDIT MODAL ============
const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.3s ease-out;
    padding: 1rem;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    position: relative;
    animation: ${slideIn} 0.3s ease-out;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalTitle = styled.h2`
    color: #00adef;
    margin-bottom: 2rem;
    font-size: 1.8rem;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: scale(1.1);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const TextArea = styled.textarea`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const Select = styled.select`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    option {
        background: #1a1f3a;
        color: #e0e6ed;
    }
`;

const SubmitButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
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

const COLORS = ['#00adef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ============ COMPONENT ============
const ProfilePage = () => {
    const { user, api } = useAuth();
    const toast = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        bio: '',
        riskTolerance: 'moderate',
        favoriteSector: 'technology',
        tradingExperience: 'intermediate'
    });

    useEffect(() => {
        fetchProfileData();
    }, []);

    useEffect(() => {
        if (user) {
            setEditFormData({
                name: user.name || '',
                bio: user.bio || '',
                riskTolerance: user.riskTolerance || 'moderate',
                favoriteSector: user.favoriteSector || 'technology',
                tradingExperience: user.tradingExperience || 'intermediate'
            });
        }
    }, [user]);

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

            const totalCost = holdings.reduce((sum, h) => {
                const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || h.price || 0;
                const shares = h.shares || h.quantity || 0;
                return sum + (avgPrice * shares);
            }, 0);

            const totalGain = totalValue - totalCost;

            // Find best and worst performers
            const performers = holdings.map(h => {
                const currentPrice = h.currentPrice || h.current_price || h.price || 0;
                const avgPrice = h.averagePrice || h.average_price || h.purchasePrice || currentPrice;
                const gainPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
                return {
                    symbol: h.symbol || h.ticker,
                    gainPercent
                };
            });

            const bestPerformer = performers.sort((a, b) => b.gainPercent - a.gainPercent)[0];
            const worstPerformer = performers.sort((a, b) => a.gainPercent - b.gainPercent)[0];

            // Fetch watchlist
            const watchlistRes = await api.get('/watchlist');
            const watchlist = watchlistRes.data.watchlist || [];

            // Generate mock data for charts
            const portfolioHistory = Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: totalValue * (0.85 + Math.random() * 0.3)
            }));

            const sectorAllocation = [
                { name: 'Technology', value: totalValue * 0.4 },
                { name: 'Finance', value: totalValue * 0.25 },
                { name: 'Healthcare', value: totalValue * 0.2 },
                { name: 'Energy', value: totalValue * 0.1 },
                { name: 'Other', value: totalValue * 0.05 },
            ];

            setStats({
                portfolioValue: totalValue,
                holdingsCount: holdings.length,
                watchlistCount: watchlist.length,
                predictionsCount: 47,
                accuracyRate: 92.5,
                totalGain: totalGain,
                bestPerformer: bestPerformer?.symbol || 'N/A',
                bestPerformerGain: bestPerformer?.gainPercent || 0,
                worstPerformer: worstPerformer?.symbol || 'N/A',
                worstPerformerGain: worstPerformer?.gainPercent || 0,
                portfolioHistory,
                sectorAllocation,
                level: Math.floor(totalValue / 10000) + 1,
                xp: (totalValue % 10000),
                xpToNext: 10000,
                rankPosition: 42, // Mock
                totalUsers: 1337 // Mock
            });

        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast.error('Failed to load profile data', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = (e) => {
        e.preventDefault();
        // In a real app, you'd send this to the backend
        toast.success('Profile updated successfully!', 'Saved');
        setShowEditModal(false);
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

    const getLevelName = (level) => {
        if (level >= 10) return 'Trading Legend';
        if (level >= 7) return 'Master Trader';
        if (level >= 5) return 'Expert Trader';
        if (level >= 3) return 'Intermediate Trader';
        return 'Novice Trader';
    };

    const achievements = [
        { id: 1, name: 'First Trade', icon: '🎯', desc: 'Made your first trade', unlocked: true },
        { id: 2, name: 'Portfolio Pro', icon: '💼', desc: 'Portfolio worth $10,000+', unlocked: stats?.portfolioValue > 10000 },
        { id: 3, name: 'Watchlist Master', icon: '👁️', desc: 'Track 10+ stocks', unlocked: stats?.watchlistCount >= 10 },
        { id: 4, name: 'AI Expert', icon: '🤖', desc: 'Made 50+ predictions', unlocked: stats?.predictionsCount >= 50 },
        { id: 5, name: 'Diamond Hands', icon: '💎', desc: 'Held position for 30 days', unlocked: false },
        { id: 6, name: 'Profit Maker', icon: '💰', desc: 'Earned $1,000+ profit', unlocked: stats?.totalGain > 1000 },
        { id: 7, name: 'Diversifier', icon: '📊', desc: 'Own 5+ different stocks', unlocked: stats?.holdingsCount >= 5 },
        { id: 8, name: 'Early Bird', icon: '🌅', desc: 'Trade before 10 AM', unlocked: true },
    ];

    const timeline = [
        { 
            date: 'Today', 
            title: 'Added AAPL to portfolio', 
            desc: 'Purchased 10 shares',
            value: '+$1,750',
            type: 'success',
            positive: true
        },
        { 
            date: 'Yesterday', 
            title: 'Portfolio milestone reached', 
            desc: 'Reached $50,000 portfolio value',
            value: '$50,000',
            type: 'warning'
        },
        { 
            date: '2 days ago', 
            title: 'AI prediction correct', 
            desc: 'NVDA prediction hit target price',
            value: '+15.2%',
            type: 'success',
            positive: true
        },
        { 
            date: '5 days ago', 
            title: 'Sold TSLA position', 
            desc: 'Closed position with profit',
            value: '+$890',
            type: 'success',
            positive: true
        },
        { 
            date: '1 week ago', 
            title: 'Leveled up!', 
            desc: 'Reached Level 5 - Expert Trader',
            type: 'warning'
        },
    ];

    const leaderboard = [
        { rank: 1, name: 'TraderPro2024', score: '156,890 XP', isYou: false },
        { rank: 2, name: 'StockMaster', score: '142,330 XP', isYou: false },
        { rank: 3, name: 'BullRunner', score: '138,920 XP', isYou: false },
        { rank: 42, name: user?.name || 'You', score: `${stats?.xp?.toLocaleString() || 0} XP`, isYou: true },
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

    const xpProgress = stats ? (stats.xp / stats.xpToNext) * 100 : 0;

    return (
        <PageContainer>
            <Header>
                <Title>My Profile</Title>
                <Subtitle>Your legendary trading journey</Subtitle>
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
                        <UserName>
                            {user?.name || 'Trader'}
                            <EditButton onClick={() => setShowEditModal(true)}>
                                <Edit size={18} />
                            </EditButton>
                        </UserName>
                        {user?.bio && <UserBio>"{user.bio}"</UserBio>}
                        <UserEmail>
                            <Mail size={18} />
                            {user?.email}
                        </UserEmail>
                        <UserMetaRow>
                            <MemberSince>
                                <Calendar size={16} />
                                Member since {getMemberSince()}
                            </MemberSince>
                            <MemberSince>
                                <Briefcase size={16} />
                                {user?.tradingExperience || 'Intermediate'} Trader
                            </MemberSince>
                        </UserMetaRow>
                        <ActionButtons>
                            <ActionButton onClick={() => window.location.href = '/settings'}>
                                <Settings size={18} />
                                Settings
                            </ActionButton>
                            <ActionButton onClick={() => toast.info('Share profile coming soon!', 'Coming Soon')}>
                                <Sparkles size={18} />
                                Share Profile
                            </ActionButton>
                        </ActionButtons>
                    </UserInfo>
                </ProfileTop>

                {/* LEVEL SYSTEM */}
                <LevelSection>
                    <LevelHeader>
                        <LevelInfo>
                            <LevelBadge>{stats?.level || 1}</LevelBadge>
                            <LevelDetails>
                                <LevelTitle>
                                    Level {stats?.level || 1}
                                    <Rocket size={20} />
                                </LevelTitle>
                                <LevelName>{getLevelName(stats?.level || 1)}</LevelName>
                            </LevelDetails>
                        </LevelInfo>
                        <XPText>
                            {stats?.xp?.toLocaleString() || 0} / {stats?.xpToNext?.toLocaleString() || 0} XP
                        </XPText>
                    </LevelHeader>
                    <ProgressBarContainer>
                        <ProgressBar progress={xpProgress} />
                    </ProgressBarContainer>
                </LevelSection>
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

            {/* TWO COLUMN LAYOUT */}
            <TwoColumnGrid>
                {/* LEFT COLUMN - CHARTS & TIMELINE */}
                <div>
                    {/* PORTFOLIO HISTORY CHART */}
                    <ChartSection>
                        <SectionTitle>
                            <BarChart3 size={28} />
                            Portfolio Performance (30 Days)
                        </SectionTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={stats?.portfolioHistory || []}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00adef" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#00adef" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis dataKey="date" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: '#1e293b', 
                                        border: '1px solid rgba(0, 173, 237, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#00adef" 
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartSection>

                    {/* SECTOR ALLOCATION */}
                    <ChartSection>
                        <SectionTitle>
                            <PieChart size={28} />
                            Sector Allocation
                        </SectionTitle>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie
                                    data={stats?.sectorAllocation || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name} ${((entry.value / stats?.portfolioValue) * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(stats?.sectorAllocation || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                    contentStyle={{ 
                                        background: '#1e293b', 
                                        border: '1px solid rgba(0, 173, 237, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </ChartSection>

                    {/* TRADING TIMELINE */}
                    <ChartSection>
                        <SectionTitle>
                            <Clock size={28} />
                            Trading Timeline
                        </SectionTitle>
                        <TimelineContainer>
                            {timeline.map((item, index) => (
                                <TimelineItem key={index} type={item.type} index={index}>
                                    <TimelineDate>
                                        <Calendar size={14} />
                                        {item.date}
                                    </TimelineDate>
                                    <TimelineContent>
                                        <TimelineTitle>{item.title}</TimelineTitle>
                                        <TimelineDesc>{item.desc}</TimelineDesc>
                                        {item.value && (
                                            <TimelineValue positive={item.positive} negative={item.negative}>
                                                {item.positive && <ArrowUp size={16} />}
                                                {item.negative && <TrendingDown size={16} />}
                                                {item.value}
                                            </TimelineValue>
                                        )}
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </TimelineContainer>
                    </ChartSection>
                </div>

                {/* RIGHT COLUMN - QUICK STATS & LEADERBOARD */}
                <div>
                    {/* QUICK STATS DASHBOARD */}
                    <ChartSection>
                        <SectionTitle>
                            <Zap size={28} />
                            Quick Stats
                        </SectionTitle>
                        <QuickStatsGrid>
                            <QuickStatCard>
                                <QuickStatLabel>Best Performer</QuickStatLabel>
                                <QuickStatValue>{stats?.bestPerformer || 'N/A'}</QuickStatValue>
                                <TimelineValue positive style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    <ArrowUp size={14} />
                                    +{stats?.bestPerformerGain?.toFixed(2) || 0}%
                                </TimelineValue>
                            </QuickStatCard>

                            <QuickStatCard>
                                <QuickStatLabel>Worst Performer</QuickStatLabel>
                                <QuickStatValue>{stats?.worstPerformer || 'N/A'}</QuickStatValue>
                                <TimelineValue negative style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    <TrendingDown size={14} />
                                    {stats?.worstPerformerGain?.toFixed(2) || 0}%
                                </TimelineValue>
                            </QuickStatCard>

                            <QuickStatCard>
                                <QuickStatLabel>Favorite Time</QuickStatLabel>
                                <QuickStatValue>9:30 AM</QuickStatValue>
                            </QuickStatCard>

                            <QuickStatCard>
                                <QuickStatLabel>Win Rate</QuickStatLabel>
                                <QuickStatValue>78%</QuickStatValue>
                            </QuickStatCard>
                        </QuickStatsGrid>
                    </ChartSection>

                    {/* LEADERBOARD */}
                    <ChartSection>
                        <SectionTitle>
                            <Users size={28} />
                            Leaderboard
                        </SectionTitle>
                        <LeaderboardSection>
                            {leaderboard.map((entry, index) => (
                                <LeaderboardCard key={index}>
                                    <LeaderboardRank rank={entry.rank}>
                                        {entry.rank <= 3 ? <Medal size={20} /> : entry.rank}
                                    </LeaderboardRank>
                                    <LeaderboardInfo>
                                        <LeaderboardName>{entry.name}</LeaderboardName>
                                        <LeaderboardScore>{entry.score}</LeaderboardScore>
                                    </LeaderboardInfo>
                                    {entry.isYou && <LeaderboardBadge isYou>YOU</LeaderboardBadge>}
                                </LeaderboardCard>
                            ))}
                        </LeaderboardSection>
                        <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>
                            Ranked #{stats?.rankPosition || 0} of {stats?.totalUsers?.toLocaleString() || 0} traders
                        </div>
                    </ChartSection>
                </div>
            </TwoColumnGrid>

            {/* ACHIEVEMENTS */}
            <AchievementsSection>
                <SectionTitle>
                    <Trophy size={28} />
                    Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
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

            {/* EDIT PROFILE MODAL */}
            {showEditModal && (
                <Modal onClick={() => setShowEditModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowEditModal(false)}>
                            <X size={20} />
                        </CloseButton>
                        <ModalTitle>Edit Profile</ModalTitle>
                        <Form onSubmit={handleEditProfile}>
                            <FormGroup>
                                <Label>Name</Label>
                                <Input
                                    type="text"
                                    placeholder="Your name"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    autoFocus
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Bio</Label>
                                <TextArea
                                    placeholder="Tell us about yourself..."
                                    value={editFormData.bio}
                                    onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Risk Tolerance</Label>
                                <Select
                                    value={editFormData.riskTolerance}
                                    onChange={(e) => setEditFormData({ ...editFormData, riskTolerance: e.target.value })}
                                >
                                    <option value="conservative">Conservative</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="aggressive">Aggressive</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Favorite Sector</Label>
                                <Select
                                    value={editFormData.favoriteSector}
                                    onChange={(e) => setEditFormData({ ...editFormData, favoriteSector: e.target.value })}
                                >
                                    <option value="technology">Technology</option>
                                    <option value="finance">Finance</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="energy">Energy</option>
                                    <option value="consumer">Consumer Goods</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Trading Experience</Label>
                                <Select
                                    value={editFormData.tradingExperience}
                                    onChange={(e) => setEditFormData({ ...editFormData, tradingExperience: e.target.value })}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </Select>
                            </FormGroup>

                            <SubmitButton type="submit">
                                <Check size={18} />
                                Save Changes
                            </SubmitButton>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
};

export default ProfilePage;