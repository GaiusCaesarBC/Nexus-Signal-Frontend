// client/src/pages/ProfilePage.js - ENHANCED PROFILE WITH SOCIAL FEATURES
// Supports viewing own profile AND other users' profiles

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Mail, Calendar, Shield, TrendingUp, DollarSign,
    Award, Star, Zap, Settings, Edit, Camera, Crown,
    Activity, PieChart, Eye, Brain, Trophy, Flame,
    Target, ArrowUpRight, Sparkles, Clock, BarChart3,
    TrendingDown, ChevronRight, Medal, Users, Rocket,
    X, Check, ArrowUp, ChevronUp, Briefcase, Link as LinkIcon,
    Upload, Trash2, Percent, UserPlus, UserCheck, MessageCircle,
    Heart, Share2, MapPin, Globe, Twitter, Copy, ExternalLink,
    Hash, Bookmark, MoreHorizontal, ChevronDown, RefreshCw
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

const fadeInScale = keyframes`
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
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

const MaxWidthContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

// ============ PROFILE HEADER ============
const ProfileHeader = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    position: relative;
    overflow: hidden;
`;

const ProfileBanner = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: ${props => props.$src ? `url(${props.$src})` : 'linear-gradient(135deg, #00adef 0%, #0088cc 50%, #00ff88 100%)'};
    background-size: cover;
    background-position: center;
    opacity: 0.3;
`;

const ProfileContent = styled.div`
    position: relative;
    z-index: 1;
`;

const ProfileTop = styled.div`
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const AvatarSection = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const Avatar = styled.div`
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    font-weight: 900;
    color: white;
    box-shadow: 0 8px 32px rgba(0, 173, 237, 0.4);
    border: 4px solid #0a0e27;
    position: relative;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const OnlineIndicator = styled.div`
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: #10b981;
    border: 3px solid #0a0e27;
    border-radius: 50%;
`;

const EditAvatarButton = styled.button`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0, 173, 237, 0.9);
    border: 2px solid #0a0e27;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 10;

    &:hover {
        background: #00adef;
        transform: scale(1.1);
    }
`;

const RankBadge = styled.div`
    position: absolute;
    top: -5px;
    right: -5px;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #daa06d)';
        return 'linear-gradient(135deg, #00adef, #0088cc)';
    }};
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 0.9rem;
    color: ${props => props.$rank <= 3 ? '#000' : '#fff'};
    border: 2px solid #0a0e27;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10;
`;

const UserInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const UserNameRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const UserName = styled.h1`
    font-size: 2rem;
    font-weight: 900;
    color: #e0e6ed;
    margin: 0;
`;

const VerifiedBadge = styled.span`
    background: linear-gradient(135deg, #00adef, #0088cc);
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const LevelBadge = styled.span`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #a78bfa;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
`;

const Username = styled.div`
    color: #64748b;
    font-size: 1rem;
    margin-bottom: 0.5rem;
`;

const UserBio = styled.p`
    color: #94a3b8;
    font-size: 0.95rem;
    margin-bottom: 1rem;
    line-height: 1.5;
    max-width: 500px;
`;

const UserMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #64748b;
    font-size: 0.9rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;

    svg {
        width: 16px;
        height: 16px;
    }

    a {
        color: #00adef;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
`;

const SocialStats = styled.div`
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const SocialStat = styled.button`
    background: none;
    border: none;
    color: #e0e6ed;
    cursor: pointer;
    padding: 0;
    font-size: 0.95rem;
    transition: color 0.2s ease;

    &:hover {
        color: #00adef;
    }

    strong {
        font-weight: 900;
        margin-right: 0.3rem;
    }

    span {
        color: #64748b;
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        justify-content: center;
    }
`;

const PrimaryButton = styled.button`
    padding: 0.6rem 1.25rem;
    background: ${props => props.$following ? 'transparent' : 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    border: ${props => props.$following ? '2px solid #00adef' : 'none'};
    color: ${props => props.$following ? '#00adef' : 'white'};
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const SecondaryButton = styled.button`
    padding: 0.6rem 1rem;
    background: rgba(100, 116, 139, 0.1);
    border: 1px solid rgba(100, 116, 139, 0.3);
    color: #94a3b8;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(100, 116, 139, 0.2);
        color: #e0e6ed;
    }
`;

// ============ TABS ============
const TabsContainer = styled.div`
    display: flex;
    gap: 0;
    border-bottom: 1px solid rgba(100, 116, 139, 0.2);
    margin-bottom: 2rem;
    overflow-x: auto;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const Tab = styled.button`
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    color: ${props => props.$active ? '#00adef' : '#64748b'};
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    }

    &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #00adef, #00ff88);
        border-radius: 3px 3px 0 0;
        opacity: ${props => props.$active ? 1 : 0};
        transition: opacity 0.3s ease;
    }
`;

const TabBadge = styled.span`
    background: rgba(0, 173, 237, 0.2);
    color: #00adef;
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 700;
`;

// ============ CONTENT SECTIONS ============
const ContentSection = styled.div`
    animation: ${fadeInScale} 0.4s ease-out;
`;

// ============ STATS GRID ============
const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.3s ease;

    &:hover {
        border-color: rgba(0, 173, 237, 0.4);
        transform: translateY(-2px);
    }
`;

const StatIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.15)'};
    color: ${props => props.$textColor || '#00adef'};
`;

const StatLabel = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: ${props => props.$color || '#00adef'};
`;

// ============ LEVEL SECTION ============
const LevelSection = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
`;

const LevelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const LevelInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const LevelCircle = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: 900;
    color: white;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
`;

const LevelDetails = styled.div``;

const LevelTitle = styled.div`
    font-size: 1.2rem;
    font-weight: 700;
    color: #a78bfa;
`;

const LevelSubtitle = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const XPText = styled.div`
    color: #a78bfa;
    font-size: 0.9rem;
    font-weight: 600;
    text-align: right;
`;

const ProgressBarContainer = styled.div`
    width: 100%;
    height: 10px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 5px;
    overflow: hidden;
`;

const ProgressBar = styled.div`
    height: 100%;
    background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
    border-radius: 5px;
    transition: width 1s ease-out;
    width: ${props => props.$progress}%;
`;

// ============ CHARTS ============
const ChartCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// ============ POSTS SECTION ============
const PostsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const PostCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        border-color: rgba(0, 173, 237, 0.3);
    }
`;

const PostHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const PostAvatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef, #00ff88);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    font-size: 0.9rem;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const PostMeta = styled.div`
    flex: 1;
`;

const PostAuthor = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 0.9rem;
`;

const PostTime = styled.div`
    color: #64748b;
    font-size: 0.8rem;
`;

const PostContent = styled.div`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
`;

const PostStats = styled.div`
    display: flex;
    gap: 1.5rem;
    color: #64748b;
    font-size: 0.85rem;
`;

const PostStat = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;

    svg {
        width: 16px;
        height: 16px;
    }
`;

// ============ TRADES SECTION ============
const TradesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const TradeCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-left: 4px solid ${props => props.$positive ? '#10b981' : '#ef4444'};
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const TradeInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const TradeSymbol = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-weight: 900;
    color: #00adef;
    font-size: 0.95rem;
`;

const TradeDetails = styled.div``;

const TradeType = styled.div`
    font-weight: 600;
    color: #e0e6ed;
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
`;

const TradeDate = styled.div`
    color: #64748b;
    font-size: 0.8rem;
`;

const TradePnL = styled.div`
    text-align: right;
    font-weight: 900;
    font-size: 1.1rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

// ============ PREDICTIONS SECTION ============
const PredictionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const PredictionCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const PredictionInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const PredictionDirection = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$up ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
    color: ${props => props.$up ? '#10b981' : '#ef4444'};
`;

const PredictionDetails = styled.div``;

const PredictionSymbol = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 0.95rem;
`;

const PredictionMeta = styled.div`
    color: #64748b;
    font-size: 0.8rem;
`;

const PredictionStatus = styled.div`
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    background: ${props => {
        if (props.$status === 'correct') return 'rgba(16, 185, 129, 0.15)';
        if (props.$status === 'incorrect') return 'rgba(239, 68, 68, 0.15)';
        return 'rgba(245, 158, 11, 0.15)';
    }};
    color: ${props => {
        if (props.$status === 'correct') return '#10b981';
        if (props.$status === 'incorrect') return '#ef4444';
        return '#f59e0b';
    }};
`;

// ============ ACHIEVEMENTS ============
const AchievementsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
`;

const AchievementCard = styled.div`
    background: ${props => props.$unlocked ?
        'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$unlocked ? 'rgba(245, 158, 11, 0.4)' : 'rgba(100, 116, 139, 0.2)'};
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    opacity: ${props => props.$unlocked ? 1 : 0.5};
    transition: all 0.3s ease;

    ${props => props.$unlocked && css`
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
        }
    `}
`;

const AchievementIcon = styled.div`
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
`;

const AchievementName = styled.div`
    color: ${props => props.$unlocked ? '#f59e0b' : '#64748b'};
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
`;

const AchievementDesc = styled.div`
    color: #64748b;
    font-size: 0.8rem;
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: #64748b;
`;

const EmptyIcon = styled.div`
    margin-bottom: 1rem;
    opacity: 0.5;
`;

const EmptyText = styled.div`
    font-size: 1rem;
    margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.div`
    font-size: 0.9rem;
    color: #475569;
`;

// ============ MODAL ============
const Modal = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
`;

const ModalTitle = styled.h2`
    color: #e0e6ed;
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
    }
`;

const FollowList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const FollowItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(0, 173, 237, 0.05);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
    }
`;

const FollowAvatar = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef, #00ff88);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const FollowInfo = styled.div`
    flex: 1;
`;

const FollowName = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 0.95rem;
`;

const FollowUsername = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const FollowButton = styled.button`
    padding: 0.4rem 0.8rem;
    background: ${props => props.$following ? 'transparent' : 'rgba(0, 173, 237, 0.2)'};
    border: 1px solid rgba(0, 173, 237, 0.4);
    color: #00adef;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.3);
    }
`;

// ============ LOADING ============
const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 3px solid rgba(0, 173, 237, 0.2);
    border-top-color: #00adef;
    border-radius: 50%;
    animation: ${rotate} 1s linear infinite;
`;

const COLORS = ['#00adef', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ============ COMPONENT ============
const ProfilePage = () => {
    const { userId } = useParams(); // For viewing other users
    const navigate = useNavigate();
    const { user: currentUser, api, isAuthenticated } = useAuth();
    const toast = useToast();

    // State
    const [profileUser, setProfileUser] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    // Data states
    const [stats, setStats] = useState(null);
    const [posts, setPosts] = useState([]);
    const [trades, setTrades] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    // Modal states
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    // Avatar upload states
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    // Determine if viewing own profile or another user's
    useEffect(() => {
        if (userId && userId !== currentUser?._id) {
            setIsOwnProfile(false);
            fetchUserProfile(userId);
        } else {
            setIsOwnProfile(true);
            setProfileUser(currentUser);
            fetchOwnProfileData();
        }
    }, [userId, currentUser]);

    const fetchUserProfile = async (id) => {
        try {
            setLoading(true);
            const res = await api.get(`/social/user/${id}`);
            setProfileUser(res.data.user);
            setIsFollowing(res.data.isFollowing || false);
            setStats(res.data.stats);
            setPosts(res.data.posts || []);
            setTrades(res.data.trades || []);
            setPredictions(res.data.predictions || []);
            setAchievements(res.data.achievements || []);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            toast.error('User not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchOwnProfileData = async () => {
        try {
            setLoading(true);

            // Fetch portfolio data
            const portfolioRes = await api.get('/portfolio');
            const holdings = portfolioRes.data.holdings || [];

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

            // Fetch watchlist
            const watchlistRes = await api.get('/watchlist');
            const watchlist = watchlistRes.data.watchlist || [];

            // Fetch predictions
            try {
                const predictionsRes = await api.get('/predictions/user');
                setPredictions(predictionsRes.data.predictions || []);
            } catch (e) {
                console.log('No predictions found');
            }

            // Fetch user posts
            try {
                const postsRes = await api.get(`/feed/user/${currentUser._id}?limit=10`);
                setPosts(postsRes.data.posts || []);
            } catch (e) {
                console.log('No posts found');
            }

            // Fetch fresh gamification data from API
            let gamification = currentUser?.gamification || {};
            let userStats = currentUser?.stats || {};
            
            try {
                const gamificationRes = await api.get('/gamification/stats');
                if (gamificationRes.data) {
                    gamification = gamificationRes.data;
                }
            } catch (e) {
                console.log('Using cached gamification data');
            }

            // Fetch user stats
            try {
                const statsRes = await api.get('/social/me/stats');
                if (statsRes.data) {
                    userStats = statsRes.data;
                }
            } catch (e) {
                console.log('Using cached stats data');
            }

            const social = currentUser?.social || {};

            // Build achievements list
            const userAchievements = currentUser?.achievements || [];
            const allAchievements = [
                { id: 'welcome_aboard', name: 'Welcome Aboard', icon: '🎉', desc: 'Complete onboarding' },
                { id: 'first_trade', name: 'First Trade', icon: '🎯', desc: 'Made your first trade' },
                { id: 'first_prediction', name: 'Oracle', icon: '🔮', desc: 'Made your first prediction' },
                { id: 'portfolio_1k', name: 'Portfolio Pro', icon: '💼', desc: 'Portfolio worth $1,000+' },
                { id: 'portfolio_10k', name: 'Big Player', icon: '💰', desc: 'Portfolio worth $10,000+' },
                { id: 'win_streak_5', name: 'Hot Streak', icon: '🔥', desc: '5 winning predictions in a row' },
                { id: 'win_streak_10', name: 'On Fire', icon: '💎', desc: '10 winning predictions in a row' },
                { id: 'level_5', name: 'Rising Star', icon: '⭐', desc: 'Reach Level 5' },
                { id: 'level_10', name: 'Trading Legend', icon: '👑', desc: 'Reach Level 10' },
                { id: 'followers_10', name: 'Influencer', icon: '📣', desc: 'Gain 10 followers' },
            ].map(a => ({
                ...a,
                unlocked: userAchievements.some(ua => ua.achievementId === a.id)
            }));

            setAchievements(allAchievements);

            // Set stats
            setStats({
                portfolioValue: totalValue,
                holdingsCount: holdings.length,
                watchlistCount: watchlist.length,
                totalGain,
                totalGainPercent: totalCost > 0 ? (totalGain / totalCost) * 100 : 0,
                level: gamification.level || 1,
                title: gamification.title || 'Rookie Trader',
                xp: gamification.totalXpEarned || gamification.xp || 0,
                nextLevelXp: gamification.nextLevelXp || 100,
                rank: userStats.rank || currentUser?.stats?.rank || 0,
                followersCount: social.followersCount || 0,
                followingCount: social.followingCount || 0,
                predictionAccuracy: userStats.predictionAccuracy || currentUser?.stats?.predictionAccuracy || 0,
                totalPredictions: userStats.totalPredictions || currentUser?.stats?.totalPredictions || 0,
                currentStreak: userStats.currentStreak || currentUser?.stats?.currentStreak || 0
            });

            // Set followers/following
            setFollowers(social.followers || []);
            setFollowing(social.following || []);

            if (currentUser?.profile?.avatar) {
                setAvatarPreview(currentUser.profile.avatar);
            }

        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to follow users');
            return;
        }

        setFollowLoading(true);
        try {
            if (isFollowing) {
                await api.delete(`/social/follow/${profileUser._id}`);
                setIsFollowing(false);
                toast.success(`Unfollowed ${profileUser.profile?.displayName || profileUser.username}`);
            } else {
                await api.post(`/social/follow/${profileUser._id}`);
                setIsFollowing(true);
                toast.success(`Following ${profileUser.profile?.displayName || profileUser.username}`);
            }
        } catch (error) {
            console.error('Follow error:', error);
            toast.error('Failed to update follow status');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;

        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);

            await api.post('/auth/upload-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Profile picture updated!');
            setShowAvatarModal(false);
            setAvatarFile(null);
            window.location.reload();
        } catch (error) {
            toast.error('Failed to upload avatar');
        } finally {
            setAvatarUploading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const formatTimeAgo = (date) => {
        if (!date) return '';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
        return new Date(date).toLocaleDateString();
    };

    const displayUser = profileUser || currentUser;

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner />
                </LoadingContainer>
            </PageContainer>
        );
    }

    // Calculate XP progress
    const xpProgress = stats?.nextLevelXp > 0 
        ? ((stats?.xp % 1000) / (stats?.nextLevelXp || 1000)) * 100 
        : 0;

    return (
        <PageContainer>
            <MaxWidthContainer>
                {/* Profile Header */}
                <ProfileHeader>
                    <ProfileBanner $src={displayUser?.profile?.banner} />
                    <ProfileContent>
                        <ProfileTop>
                            <AvatarSection>
                                <Avatar $hasImage={!!displayUser?.profile?.avatar}>
                                    {displayUser?.profile?.avatar ? (
                                        <img src={displayUser.profile.avatar} alt="Avatar" />
                                    ) : (
                                        getInitials(displayUser?.profile?.displayName || displayUser?.name)
                                    )}
                                </Avatar>
                                {stats?.rank > 0 && stats?.rank <= 100 && (
                                    <RankBadge $rank={stats.rank}>#{stats.rank}</RankBadge>
                                )}
                                {isOwnProfile && (
                                    <EditAvatarButton onClick={() => setShowAvatarModal(true)}>
                                        <Camera size={16} />
                                    </EditAvatarButton>
                                )}
                            </AvatarSection>

                            <UserInfo>
                                <UserNameRow>
                                    <UserName>
                                        {displayUser?.profile?.displayName || displayUser?.name || 'Trader'}
                                    </UserName>
                                    {displayUser?.profile?.verified && (
                                        <VerifiedBadge><Check size={12} /> Verified</VerifiedBadge>
                                    )}
                                    <LevelBadge>Lv. {stats?.level || 1} {stats?.title}</LevelBadge>
                                </UserNameRow>

                                <Username>@{displayUser?.username}</Username>

                                {displayUser?.bio && (
                                    <UserBio>{displayUser.bio}</UserBio>
                                )}

                                <UserMeta>
                                    {displayUser?.profile?.location && (
                                        <MetaItem><MapPin /> {displayUser.profile.location}</MetaItem>
                                    )}
                                    {displayUser?.profile?.website && (
                                        <MetaItem>
                                            <Globe />
                                            <a href={displayUser.profile.website} target="_blank" rel="noopener noreferrer">
                                                {displayUser.profile.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </MetaItem>
                                    )}
                                    <MetaItem>
                                        <Calendar />
                                        Joined {new Date(displayUser?.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </MetaItem>
                                </UserMeta>

                                <SocialStats>
                                    <SocialStat onClick={() => setShowFollowersModal(true)}>
                                        <strong>{stats?.followersCount || 0}</strong>
                                        <span>Followers</span>
                                    </SocialStat>
                                    <SocialStat onClick={() => setShowFollowingModal(true)}>
                                        <strong>{stats?.followingCount || 0}</strong>
                                        <span>Following</span>
                                    </SocialStat>
                                </SocialStats>

                                <ActionButtons>
                                    {isOwnProfile ? (
                                        <>
                                            <PrimaryButton onClick={() => setShowEditModal(true)}>
                                                <Edit size={16} /> Edit Profile
                                            </PrimaryButton>
                                            <SecondaryButton onClick={() => navigate('/settings')}>
                                                <Settings size={16} /> Settings
                                            </SecondaryButton>
                                        </>
                                    ) : (
                                        <>
                                            <PrimaryButton
                                                $following={isFollowing}
                                                onClick={handleFollow}
                                                disabled={followLoading}
                                            >
                                                {isFollowing ? (
                                                    <><UserCheck size={16} /> Following</>
                                                ) : (
                                                    <><UserPlus size={16} /> Follow</>
                                                )}
                                            </PrimaryButton>
                                            <SecondaryButton>
                                                <MessageCircle size={16} /> Message
                                            </SecondaryButton>
                                        </>
                                    )}
                                    <SecondaryButton onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Profile link copied!');
                                    }}>
                                        <Share2 size={16} />
                                    </SecondaryButton>
                                </ActionButtons>
                            </UserInfo>
                        </ProfileTop>
                    </ProfileContent>
                </ProfileHeader>

                {/* Tabs */}
                <TabsContainer>
                    <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                        <BarChart3 size={18} /> Overview
                    </Tab>
                    <Tab $active={activeTab === 'posts'} onClick={() => setActiveTab('posts')}>
                        <MessageCircle size={18} /> Posts
                        {posts.length > 0 && <TabBadge>{posts.length}</TabBadge>}
                    </Tab>
                    <Tab $active={activeTab === 'trades'} onClick={() => setActiveTab('trades')}>
                        <TrendingUp size={18} /> Trades
                    </Tab>
                    <Tab $active={activeTab === 'predictions'} onClick={() => setActiveTab('predictions')}>
                        <Target size={18} /> Predictions
                        {predictions.length > 0 && <TabBadge>{predictions.length}</TabBadge>}
                    </Tab>
                    <Tab $active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')}>
                        <Trophy size={18} /> Achievements
                    </Tab>
                </TabsContainer>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <ContentSection>
                        {/* Level Progress */}
                        <LevelSection>
                            <LevelHeader>
                                <LevelInfo>
                                    <LevelCircle>{stats?.level || 1}</LevelCircle>
                                    <LevelDetails>
                                        <LevelTitle>Level {stats?.level || 1}</LevelTitle>
                                        <LevelSubtitle>{stats?.title || 'Rookie Trader'}</LevelSubtitle>
                                    </LevelDetails>
                                </LevelInfo>
                                <XPText>{stats?.xp?.toLocaleString() || 0} XP Total</XPText>
                            </LevelHeader>
                            <ProgressBarContainer>
                                <ProgressBar $progress={xpProgress} />
                            </ProgressBarContainer>
                        </LevelSection>

                        {/* Stats Grid */}
                        <StatsGrid>
                            <StatCard>
                                <StatIcon $color="rgba(0, 173, 237, 0.15)" $textColor="#00adef">
                                    <DollarSign size={20} />
                                </StatIcon>
                                <StatLabel>Portfolio Value</StatLabel>
                                <StatValue>${stats?.portfolioValue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}</StatValue>
                            </StatCard>

                            <StatCard>
                                <StatIcon
                                    $color={stats?.totalGain >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                                    $textColor={stats?.totalGain >= 0 ? '#10b981' : '#ef4444'}
                                >
                                    {stats?.totalGain >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </StatIcon>
                                <StatLabel>Total Return</StatLabel>
                                <StatValue $color={stats?.totalGain >= 0 ? '#10b981' : '#ef4444'}>
                                    {stats?.totalGainPercent >= 0 ? '+' : ''}{stats?.totalGainPercent?.toFixed(1) || 0}%
                                </StatValue>
                            </StatCard>

                            <StatCard>
                                <StatIcon $color="rgba(245, 158, 11, 0.15)" $textColor="#f59e0b">
                                    <Target size={20} />
                                </StatIcon>
                                <StatLabel>Prediction Accuracy</StatLabel>
                                <StatValue $color="#f59e0b">{stats?.predictionAccuracy?.toFixed(0) || 0}%</StatValue>
                            </StatCard>

                            <StatCard>
                                <StatIcon $color="rgba(139, 92, 246, 0.15)" $textColor="#a78bfa">
                                    <Flame size={20} />
                                </StatIcon>
                                <StatLabel>Current Streak</StatLabel>
                                <StatValue $color="#a78bfa">{stats?.currentStreak || 0}</StatValue>
                            </StatCard>

                            <StatCard>
                                <StatIcon $color="rgba(16, 185, 129, 0.15)" $textColor="#10b981">
                                    <PieChart size={20} />
                                </StatIcon>
                                <StatLabel>Holdings</StatLabel>
                                <StatValue $color="#10b981">{stats?.holdingsCount || 0}</StatValue>
                            </StatCard>

                            <StatCard>
                                <StatIcon $color="rgba(236, 72, 153, 0.15)" $textColor="#ec4899">
                                    <Eye size={20} />
                                </StatIcon>
                                <StatLabel>Watchlist</StatLabel>
                                <StatValue $color="#ec4899">{stats?.watchlistCount || 0}</StatValue>
                            </StatCard>
                        </StatsGrid>

                        {/* Recent Activity */}
                        {posts.length > 0 && (
                            <ChartCard>
                                <ChartTitle><MessageCircle size={20} /> Recent Posts</ChartTitle>
                                <PostsList>
                                    {posts.slice(0, 3).map(post => (
                                        <PostCard key={post._id} onClick={() => navigate(`/post/${post._id}`)}>
                                            <PostContent>
                                                {typeof post.content === 'string' 
                                                    ? post.content.substring(0, 150) 
                                                    : (post.content?.text?.substring(0, 150) || '')}
                                                {((typeof post.content === 'string' ? post.content : post.content?.text) || '').length > 150 && '...'}
                                            </PostContent>
                                            <PostStats>
                                                <PostStat><Heart size={14} /> {post.likesCount || 0}</PostStat>
                                                <PostStat><MessageCircle size={14} /> {post.commentsCount || 0}</PostStat>
                                                <PostStat><Clock size={14} /> {formatTimeAgo(post.createdAt)}</PostStat>
                                            </PostStats>
                                        </PostCard>
                                    ))}
                                </PostsList>
                            </ChartCard>
                        )}
                    </ContentSection>
                )}

                {activeTab === 'posts' && (
                    <ContentSection>
                        {posts.length > 0 ? (
                            <PostsList>
                                {posts.map(post => (
                                    <PostCard key={post._id} onClick={() => navigate(`/post/${post._id}`)}>
                                        <PostHeader>
                                            <PostAvatar>
                                                {displayUser?.profile?.avatar ? (
                                                    <img src={displayUser.profile.avatar} alt="" />
                                                ) : (
                                                    getInitials(displayUser?.profile?.displayName || displayUser?.name)
                                                )}
                                            </PostAvatar>
                                            <PostMeta>
                                                <PostAuthor>{displayUser?.profile?.displayName || displayUser?.username}</PostAuthor>
                                                <PostTime>{formatTimeAgo(post.createdAt)}</PostTime>
                                            </PostMeta>
                                        </PostHeader>
                                        <PostContent>
                                            {typeof post.content === 'string' ? post.content : (post.content?.text || '')}
                                        </PostContent>
                                        <PostStats>
                                            <PostStat><Heart size={14} /> {post.likesCount || 0}</PostStat>
                                            <PostStat><MessageCircle size={14} /> {post.commentsCount || 0}</PostStat>
                                            <PostStat><Share2 size={14} /> {post.sharesCount || 0}</PostStat>
                                        </PostStats>
                                    </PostCard>
                                ))}
                            </PostsList>
                        ) : (
                            <EmptyState>
                                <EmptyIcon><MessageCircle size={48} /></EmptyIcon>
                                <EmptyText>No posts yet</EmptyText>
                                <EmptySubtext>
                                    {isOwnProfile ? 'Share your first trading insight!' : 'This user hasn\'t posted yet.'}
                                </EmptySubtext>
                            </EmptyState>
                        )}
                    </ContentSection>
                )}

                {activeTab === 'trades' && (
                    <ContentSection>
                        {stats?.holdingsCount > 0 ? (
                            <TradesList>
                                {trades.length > 0 ? trades.map((trade, index) => (
                                    <TradeCard key={index} $positive={trade.pnl >= 0}>
                                        <TradeInfo>
                                            <TradeSymbol>{trade.symbol}</TradeSymbol>
                                            <TradeDetails>
                                                <TradeType>{trade.type} • {trade.shares} shares</TradeType>
                                                <TradeDate>{formatTimeAgo(trade.date)}</TradeDate>
                                            </TradeDetails>
                                        </TradeInfo>
                                        <TradePnL $positive={trade.pnl >= 0}>
                                            {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercent?.toFixed(2)}%
                                        </TradePnL>
                                    </TradeCard>
                                )) : (
                                    <EmptyState>
                                        <EmptyText>Trade history coming soon</EmptyText>
                                    </EmptyState>
                                )}
                            </TradesList>
                        ) : (
                            <EmptyState>
                                <EmptyIcon><TrendingUp size={48} /></EmptyIcon>
                                <EmptyText>No trades yet</EmptyText>
                                <EmptySubtext>
                                    {isOwnProfile ? 'Start paper trading to build your history!' : 'This user hasn\'t made any trades yet.'}
                                </EmptySubtext>
                            </EmptyState>
                        )}
                    </ContentSection>
                )}

                {activeTab === 'predictions' && (
                    <ContentSection>
                        {predictions.length > 0 ? (
                            <PredictionsList>
                                {predictions.map(pred => (
                                    <PredictionCard key={pred._id}>
                                        <PredictionInfo>
                                            <PredictionDirection $up={pred.direction === 'UP'}>
                                                {pred.direction === 'UP' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </PredictionDirection>
                                            <PredictionDetails>
                                                <PredictionSymbol>${pred.symbol}</PredictionSymbol>
                                                <PredictionMeta>
                                                    {pred.direction} • {formatTimeAgo(pred.createdAt)}
                                                </PredictionMeta>
                                            </PredictionDetails>
                                        </PredictionInfo>
                                        <PredictionStatus $status={pred.status === 'expired' ? (pred.wasCorrect ? 'correct' : 'incorrect') : 'pending'}>
                                            {pred.status === 'expired' ? (pred.wasCorrect ? '✓ Correct' : '✗ Incorrect') : '⏳ Pending'}
                                        </PredictionStatus>
                                    </PredictionCard>
                                ))}
                            </PredictionsList>
                        ) : (
                            <EmptyState>
                                <EmptyIcon><Target size={48} /></EmptyIcon>
                                <EmptyText>No predictions yet</EmptyText>
                                <EmptySubtext>
                                    {isOwnProfile ? 'Make your first market prediction!' : 'This user hasn\'t made any predictions yet.'}
                                </EmptySubtext>
                            </EmptyState>
                        )}
                    </ContentSection>
                )}

                {activeTab === 'achievements' && (
                    <ContentSection>
                        <AchievementsGrid>
                            {achievements.map(achievement => (
                                <AchievementCard key={achievement.id} $unlocked={achievement.unlocked}>
                                    <AchievementIcon>{achievement.icon}</AchievementIcon>
                                    <AchievementName $unlocked={achievement.unlocked}>{achievement.name}</AchievementName>
                                    <AchievementDesc>{achievement.desc}</AchievementDesc>
                                </AchievementCard>
                            ))}
                        </AchievementsGrid>
                    </ContentSection>
                )}
            </MaxWidthContainer>

            {/* Followers Modal */}
            {showFollowersModal && (
                <Modal onClick={() => setShowFollowersModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowFollowersModal(false)}>
                            <X size={18} />
                        </CloseButton>
                        <ModalTitle>Followers ({stats?.followersCount || 0})</ModalTitle>
                        <FollowList>
                            {followers.length > 0 ? followers.map(follower => (
                                <FollowItem key={follower._id} onClick={() => {
                                    setShowFollowersModal(false);
                                    navigate(`/profile/${follower._id}`);
                                }}>
                                    <FollowAvatar>
                                        {follower.profile?.avatar ? (
                                            <img src={follower.profile.avatar} alt="" />
                                        ) : (
                                            getInitials(follower.profile?.displayName || follower.username)
                                        )}
                                    </FollowAvatar>
                                    <FollowInfo>
                                        <FollowName>{follower.profile?.displayName || follower.username}</FollowName>
                                        <FollowUsername>@{follower.username}</FollowUsername>
                                    </FollowInfo>
                                </FollowItem>
                            )) : (
                                <EmptyState>
                                    <EmptyText>No followers yet</EmptyText>
                                </EmptyState>
                            )}
                        </FollowList>
                    </ModalContent>
                </Modal>
            )}

            {/* Following Modal */}
            {showFollowingModal && (
                <Modal onClick={() => setShowFollowingModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowFollowingModal(false)}>
                            <X size={18} />
                        </CloseButton>
                        <ModalTitle>Following ({stats?.followingCount || 0})</ModalTitle>
                        <FollowList>
                            {following.length > 0 ? following.map(user => (
                                <FollowItem key={user._id} onClick={() => {
                                    setShowFollowingModal(false);
                                    navigate(`/profile/${user._id}`);
                                }}>
                                    <FollowAvatar>
                                        {user.profile?.avatar ? (
                                            <img src={user.profile.avatar} alt="" />
                                        ) : (
                                            getInitials(user.profile?.displayName || user.username)
                                        )}
                                    </FollowAvatar>
                                    <FollowInfo>
                                        <FollowName>{user.profile?.displayName || user.username}</FollowName>
                                        <FollowUsername>@{user.username}</FollowUsername>
                                    </FollowInfo>
                                </FollowItem>
                            )) : (
                                <EmptyState>
                                    <EmptyText>Not following anyone yet</EmptyText>
                                </EmptyState>
                            )}
                        </FollowList>
                    </ModalContent>
                </Modal>
            )}

            {/* Avatar Upload Modal */}
            {showAvatarModal && (
                <Modal onClick={() => setShowAvatarModal(false)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <CloseButton onClick={() => setShowAvatarModal(false)}>
                            <X size={18} />
                        </CloseButton>
                        <ModalTitle>Update Profile Picture</ModalTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <Avatar $hasImage={!!avatarPreview} style={{ width: 150, height: 150 }}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" />
                                ) : (
                                    getInitials(displayUser?.profile?.displayName || displayUser?.name)
                                )}
                            </Avatar>

                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <SecondaryButton as="label" htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                                    <Upload size={16} /> {avatarFile ? 'Choose Different' : 'Choose Photo'}
                                </SecondaryButton>

                                {avatarFile && (
                                    <PrimaryButton onClick={handleAvatarUpload} disabled={avatarUploading}>
                                        <Check size={16} /> {avatarUploading ? 'Uploading...' : 'Save'}
                                    </PrimaryButton>
                                )}
                            </div>

                            <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                                Max file size: 5MB • JPG, PNG, GIF, WebP
                            </div>
                        </div>
                    </ModalContent>
                </Modal>
            )}
        </PageContainer>
    );
};

export default ProfilePage;