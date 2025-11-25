// client/src/pages/SocialFeed.js - LEGENDARY SOCIAL FEED 🚀
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MessageCircle, Heart, TrendingUp, TrendingDown, Users, Plus, Filter, 
    Sparkles, Flame, Zap, Rocket, Send, Image, BarChart2, Share2, 
    Bookmark, BookmarkCheck, MoreHorizontal, Trash2, Flag, Copy, 
    ExternalLink, Eye, Star, Award, Target, DollarSign, Clock,
    ThumbsUp, Smile, Crown, Diamond, Gem, CircleDollarSign,
    Hash, AtSign, Search, RefreshCw, Bell, BellRing, X, Check,
    ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX,
    Calendar, MapPin, Link2, AlertCircle, CheckCircle, Info,
    ArrowUp, ArrowDown, Repeat2, MessageSquare, UserPlus, UserCheck,
    TrendingUp as BullIcon, Activity, PieChart, Briefcase, Trophy
} from 'lucide-react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
`;

const heartBeat = keyframes`
    0% { transform: scale(1); }
    14% { transform: scale(1.3); }
    28% { transform: scale(1); }
    42% { transform: scale(1.3); }
    70% { transform: scale(1); }
`;

const confetti = keyframes`
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
`;

const ripple = keyframes`
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
`;

const typing = keyframes`
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
`;

const newPostSlide = keyframes`
    from { 
        opacity: 0; 
        transform: translateY(-50px) scale(0.95);
        max-height: 0;
    }
    to { 
        opacity: 1; 
        transform: translateY(0) scale(1);
        max-height: 1000px;
    }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 100px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    position: relative;
    overflow-x: hidden;
`;

const BackgroundOrbs = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: ${float} ${props => props.$duration || '20s'} ease-in-out infinite;
    
    &:nth-child(1) {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
        top: 10%;
        left: -100px;
    }
    
    &:nth-child(2) {
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
        top: 50%;
        right: -50px;
        animation-delay: -5s;
    }
    
    &:nth-child(3) {
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

const MainContent = styled.div`
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    gap: 2rem;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 2rem 2rem;
    position: relative;
    z-index: 1;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr 320px;
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

// ============ LEFT SIDEBAR ============
const LeftSidebar = styled.aside`
    position: sticky;
    top: 100px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: ${slideInLeft} 0.5s ease-out;

    @media (max-width: 1200px) {
        display: none;
    }
`;

const SidebarCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.2);
    border-radius: 20px;
    padding: 1.5rem;
    transition: all 0.3s ease;

    &:hover {
        border-color: rgba(255, 215, 0, 0.4);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
`;

const SidebarTitle = styled.h3`
    color: #ffd700;
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const QuickAction = styled.button`
    width: 100%;
    padding: 0.875rem 1rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(255, 215, 0, 0.4)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
    margin-bottom: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
        border-color: rgba(255, 215, 0, 0.4);
        color: #ffd700;
        transform: translateX(5px);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const TrendingTag = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;

    &:hover {
        background: rgba(255, 215, 0, 0.1);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const TagName = styled.span`
    color: #00adef;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TagCount = styled.span`
    color: #64748b;
    font-size: 0.85rem;
`;

// ============ CENTER FEED ============
const FeedContainer = styled.main`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-width: 0;
`;

const FeedHeader = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
`;

const FeedTitle = styled.h1`
    font-size: 2rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    animation: ${shimmer} 3s linear infinite;

    @media (max-width: 600px) {
        font-size: 1.5rem;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const RefreshButton = styled.button`
    width: 44px;
    height: 44px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    color: #ffd700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.2);
        transform: rotate(180deg);
    }

    svg {
        transition: transform 0.5s ease;
    }

    &.spinning svg {
        animation: ${spin} 1s linear infinite;
    }
`;

const NewPostsAlert = styled.button`
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: none;
    border-radius: 25px;
    color: #0a0e27;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: ${bounce} 2s ease-in-out infinite;
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.4);

    &:hover {
        transform: scale(1.05);
    }
`;

const FilterTabs = styled.div`
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const FilterTab = styled.button`
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

    &:hover {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%);
        border-color: rgba(255, 215, 0, 0.5);
        color: #ffd700;
        transform: translateY(-2px);
    }
`;

// ============ CREATE POST BOX ============
const CreatePostBox = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.2);
    border-radius: 20px;
    padding: 1.5rem;
    animation: ${fadeIn} 0.5s ease-out 0.1s both;
`;

const CreatePostHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
    width: ${props => props.$size || '48px'};
    height: ${props => props.$size || '48px'};
    border-radius: 50%;
    background: ${props => props.$src ? 
        `url(${props.$src}) center/cover` : 
        'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #0a0e27;
    font-size: ${props => props.$fontSize || '1.2rem'};
    flex-shrink: 0;
    border: 2px solid rgba(255, 215, 0, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: scale(1.05);
        border-color: rgba(255, 215, 0, 0.6);
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const OnlineIndicator = styled.div`
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
    border: 2px solid #1e293b;
`;

const PostInput = styled.div`
    flex: 1;
    padding: 1rem 1.25rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 25px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        border-color: rgba(255, 215, 0, 0.4);
        color: #e0e6ed;
    }
`;

const PostTypeButtons = styled.div`
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(100, 116, 139, 0.2);
    flex-wrap: wrap;
`;

const PostTypeButton = styled.button`
    flex: 1;
    min-width: 100px;
    padding: 0.75rem 1rem;
    background: transparent;
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
    color: ${props => props.$color || '#94a3b8'};
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => props.$hoverBg || 'rgba(255, 215, 0, 0.1)'};
        border-color: ${props => props.$color || 'rgba(255, 215, 0, 0.4)'};
        transform: translateY(-2px);
    }

    @media (max-width: 600px) {
        min-width: 80px;
        font-size: 0.8rem;
        padding: 0.6rem 0.75rem;
    }
`;

// ============ POST CARD ============
const PostCard = styled.article`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid ${props => props.$highlighted ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 215, 0, 0.15)'};
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: ${props => props.$isNew ? newPostSlide : fadeIn} 0.5s ease-out;

    &:hover {
        border-color: rgba(255, 215, 0, 0.3);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
    }

    ${props => props.$isPinned && css`
        border-color: rgba(255, 215, 0, 0.5);
        background: linear-gradient(135deg, rgba(40, 51, 69, 0.95) 0%, rgba(25, 33, 52, 0.95) 100%);
    `}
`;

const PostHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.25rem 1.25rem 0;
`;

const PostAuthor = styled.div`
    display: flex;
    align-items: center;
    gap: 0.875rem;
`;

const AuthorInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const AuthorName = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    color: #f8fafc;
    cursor: pointer;

    &:hover {
        color: #ffd700;
    }
`;

const VerifiedBadge = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    color: #0a0e27;
`;

const LevelBadge = styled.span`
    padding: 0.15rem 0.5rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #a78bfa;
`;

const AuthorMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.85rem;
`;

const Username = styled.span`
    cursor: pointer;
    
    &:hover {
        color: #00adef;
        text-decoration: underline;
    }
`;

const PostTime = styled.span`
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const PostMenu = styled.div`
    position: relative;
`;

const MenuButton = styled.button`
    width: 36px;
    height: 36px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.1);
        color: #ffd700;
    }
`;

const MenuDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    background: rgba(30, 41, 59, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 12px;
    min-width: 180px;
    overflow: hidden;
    z-index: 100;
    animation: ${fadeInScale} 0.2s ease-out;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const MenuItem = styled.button`
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: ${props => props.$danger ? '#ef4444' : '#f8fafc'};
    font-size: 0.9rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)'};
        color: ${props => props.$danger ? '#ef4444' : '#ffd700'};
    }
`;

const PostContent = styled.div`
    padding: 1rem 1.25rem;
`;

const PostText = styled.p`
    color: #e0e6ed;
    font-size: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;

    a {
        color: #00adef;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

const Hashtag = styled.span`
    color: #00adef;
    cursor: pointer;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const Mention = styled.span`
    color: #ffd700;
    cursor: pointer;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

const TickerMention = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.5rem;
    background: ${props => props.$direction === 'up' ? 
        'rgba(16, 185, 129, 0.2)' : 
        props.$direction === 'down' ? 
        'rgba(239, 68, 68, 0.2)' : 
        'rgba(0, 173, 239, 0.2)'
    };
    border: 1px solid ${props => props.$direction === 'up' ? 
        'rgba(16, 185, 129, 0.4)' : 
        props.$direction === 'down' ? 
        'rgba(239, 68, 68, 0.4)' : 
        'rgba(0, 173, 239, 0.4)'
    };
    border-radius: 6px;
    color: ${props => props.$direction === 'up' ? 
        '#10b981' : 
        props.$direction === 'down' ? 
        '#ef4444' : 
        '#00adef'
    };
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }
`;

// ============ TRADE POST ATTACHMENT ============
const TradeAttachment = styled.div`
    margin: 1rem 0;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%);
    border: 1px solid ${props => props.$profitable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
    border-radius: 16px;
    padding: 1.25rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => props.$profitable ? '#10b981' : '#ef4444'};
    }
`;

const TradeHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const TradeSymbol = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const SymbolIcon = styled.div`
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: #ffd700;
    font-size: 1rem;
`;

const SymbolInfo = styled.div``;

const SymbolName = styled.div`
    font-weight: 700;
    color: #f8fafc;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TradeDirection = styled.span`
    padding: 0.2rem 0.5rem;
    background: ${props => props.$type === 'LONG' ? 
        'rgba(16, 185, 129, 0.2)' : 
        'rgba(239, 68, 68, 0.2)'
    };
    border: 1px solid ${props => props.$type === 'LONG' ? 
        'rgba(16, 185, 129, 0.4)' : 
        'rgba(239, 68, 68, 0.4)'
    };
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: ${props => props.$type === 'LONG' ? '#10b981' : '#ef4444'};
`;

const SymbolCompany = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const TradePnL = styled.div`
    text-align: right;
`;

const PnLValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const PnLPercent = styled.div`
    font-size: 0.9rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    opacity: 0.8;
`;

const TradeDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;

    @media (max-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const TradeDetail = styled.div`
    text-align: center;
    padding: 0.75rem;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 10px;
`;

const DetailLabel = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
    color: #f8fafc;
    font-weight: 700;
`;

const CopyTradeButton = styled.button`
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 10px;
    color: #10b981;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(16, 185, 129, 0.3);
        transform: translateY(-2px);
    }
`;

// ============ PREDICTION POST ============
const PredictionAttachment = styled.div`
    margin: 1rem 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 1.25rem;
`;

const PredictionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const PredictionSymbol = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const PredictionDirection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$direction === 'UP' ? 
        'rgba(16, 185, 129, 0.2)' : 
        'rgba(239, 68, 68, 0.2)'
    };
    border: 1px solid ${props => props.$direction === 'UP' ? 
        'rgba(16, 185, 129, 0.4)' : 
        'rgba(239, 68, 68, 0.4)'
    };
    border-radius: 10px;
    color: ${props => props.$direction === 'UP' ? '#10b981' : '#ef4444'};
    font-weight: 700;
`;

const PredictionConfidence = styled.div`
    margin-top: 1rem;
`;

const ConfidenceBar = styled.div`
    height: 8px;
    background: rgba(15, 23, 42, 0.6);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 0.5rem;
`;

const ConfidenceFill = styled.div`
    height: 100%;
    width: ${props => props.$value}%;
    background: linear-gradient(90deg, #a78bfa, #8b5cf6);
    border-radius: 4px;
    transition: width 1s ease;
`;

const ConfidenceLabel = styled.div`
    display: flex;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 0.85rem;
`;

// ============ POLL POST ============
const PollContainer = styled.div`
    margin: 1rem 0;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 1.25rem;
`;

const PollQuestion = styled.div`
    color: #f8fafc;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 1rem;
`;

const PollOption = styled.button`
    width: 100%;
    padding: 1rem;
    background: ${props => props.$selected ? 
        'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$selected ? 
        'rgba(255, 215, 0, 0.5)' : 
        'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 12px;
    color: ${props => props.$selected ? '#ffd700' : '#e0e6ed'};
    text-align: left;
    cursor: ${props => props.$voted ? 'default' : 'pointer'};
    margin-bottom: 0.75rem;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
        ${props => !props.$voted && css`
            border-color: rgba(255, 215, 0, 0.5);
            background: rgba(255, 215, 0, 0.1);
        `}
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const PollProgressBar = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$percent}%;
    background: rgba(255, 215, 0, 0.15);
    transition: width 1s ease;
`;

const PollOptionContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 1;
`;

const PollOptionText = styled.span`
    font-weight: 600;
`;

const PollOptionPercent = styled.span`
    color: #ffd700;
    font-weight: 700;
`;

const PollStats = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    color: #64748b;
    font-size: 0.85rem;
`;

// ============ IMAGE ATTACHMENT ============
const ImageGrid = styled.div`
    display: grid;
    grid-template-columns: ${props => {
        if (props.$count === 1) return '1fr';
        if (props.$count === 2) return '1fr 1fr';
        if (props.$count === 3) return '2fr 1fr';
        return '1fr 1fr';
    }};
    gap: 4px;
    margin: 1rem 0;
    border-radius: 16px;
    overflow: hidden;
    max-height: 400px;
`;

const PostImage = styled.img`
    width: 100%;
    height: ${props => props.$single ? '400px' : '200px'};
    object-fit: cover;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }
`;

// ============ POST STATS ============
const PostStats = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid rgba(100, 116, 139, 0.2);
    color: #64748b;
    font-size: 0.85rem;
`;

const StatsLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const ReactionsList = styled.div`
    display: flex;
    align-items: center;
`;

const ReactionBubble = styled.div`
    width: 22px;
    height: 22px;
    background: ${props => props.$color || 'rgba(255, 215, 0, 0.2)'};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    margin-left: -6px;
    border: 2px solid #1e293b;
    cursor: pointer;

    &:first-child {
        margin-left: 0;
    }
`;

const ReactionCount = styled.span`
    margin-left: 0.5rem;
    cursor: pointer;

    &:hover {
        color: #ffd700;
        text-decoration: underline;
    }
`;

const StatsRight = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatItem = styled.span`
    cursor: pointer;

    &:hover {
        color: #ffd700;
        text-decoration: underline;
    }
`;

// ============ POST ACTIONS ============
const PostActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0.5rem 1rem;
    border-top: 1px solid rgba(100, 116, 139, 0.2);
`;

const ActionButton = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: ${props => props.$active ? props.$activeColor || '#ffd700' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 10px;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        background: ${props => props.$hoverBg || 'rgba(255, 215, 0, 0.1)'};
        color: ${props => props.$hoverColor || '#ffd700'};
    }

    svg {
        transition: all 0.2s ease;
    }

    &:hover svg {
        transform: scale(1.1);
    }

    ${props => props.$active && css`
        svg {
            animation: ${heartBeat} 0.5s ease;
        }
    `}

    @media (max-width: 480px) {
        padding: 0.6rem 0.5rem;
        font-size: 0.85rem;
    }
`;

// ============ REACTIONS PICKER ============
const ReactionsPopup = styled.div`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(30, 41, 59, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 30px;
    padding: 0.5rem;
    display: flex;
    gap: 0.25rem;
    animation: ${fadeInScale} 0.2s ease-out;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 10;
`;

const ReactionButton = styled.button`
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.5rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: rgba(255, 215, 0, 0.2);
        transform: scale(1.3) translateY(-5px);
    }
`;

// ============ COMMENTS SECTION ============
const CommentsSection = styled.div`
    border-top: 1px solid rgba(100, 116, 139, 0.2);
    padding: 1rem 1.25rem;
    background: rgba(15, 23, 42, 0.3);
`;

const CommentsList = styled.div`
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 1rem;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(255, 215, 0, 0.05);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(255, 215, 0, 0.3);
        border-radius: 2px;
    }
`;

const Comment = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;

    &:last-child {
        margin-bottom: 0;
    }
`;

const CommentContent = styled.div`
    flex: 1;
`;

const CommentBubble = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border-radius: 16px;
    padding: 0.75rem 1rem;
`;

const CommentAuthor = styled.span`
    font-weight: 700;
    color: #f8fafc;
    margin-right: 0.5rem;
    cursor: pointer;

    &:hover {
        color: #ffd700;
    }
`;

const CommentText = styled.span`
    color: #e0e6ed;
`;

const CommentMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.25rem;
    padding-left: 0.5rem;
    color: #64748b;
    font-size: 0.8rem;
`;

const CommentAction = styled.button`
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        color: #ffd700;
    }
`;

const CommentInput = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: center;
`;

const CommentTextarea = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 25px;
    color: #e0e6ed;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
        border-color: rgba(255, 215, 0, 0.5);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const SendButton = styled.button`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: none;
    border-radius: 50%;
    color: #0a0e27;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.1);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// ============ RIGHT SIDEBAR ============
const RightSidebar = styled.aside`
    position: sticky;
    top: 100px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: ${slideInRight} 0.5s ease-out;

    @media (max-width: 900px) {
        display: none;
    }
`;

const TopTraderCard = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;

    &:hover {
        background: rgba(255, 215, 0, 0.1);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const TraderRank = styled.div`
    width: 28px;
    height: 28px;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #daa06d)';
        return 'rgba(100, 116, 139, 0.3)';
    }};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 0.8rem;
    color: ${props => props.$rank <= 3 ? '#0a0e27' : '#94a3b8'};
`;

const TraderInfo = styled.div`
    flex: 1;
`;

const TraderName = styled.div`
    font-weight: 700;
    color: #f8fafc;
    font-size: 0.9rem;
`;

const TraderStat = styled.div`
    color: #10b981;
    font-size: 0.8rem;
    font-weight: 600;
`;

const FollowBadge = styled.button`
    padding: 0.4rem 0.75rem;
    background: ${props => props.$following ? 
        'rgba(255, 215, 0, 0.2)' : 
        'linear-gradient(135deg, #ffd700, #ffed4e)'
    };
    border: ${props => props.$following ? '1px solid rgba(255, 215, 0, 0.4)' : 'none'};
    border-radius: 8px;
    color: ${props => props.$following ? '#ffd700' : '#0a0e27'};
    font-weight: 700;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.05);
    }
`;

const SuggestedUser = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.05);
    }

    &:last-child {
        margin-bottom: 0;
    }
`;

const SuggestedInfo = styled.div`
    flex: 1;
`;

const SuggestedName = styled.div`
    font-weight: 700;
    color: #f8fafc;
    font-size: 0.9rem;
`;

const SuggestedMutual = styled.div`
    color: #64748b;
    font-size: 0.75rem;
`;

// ============ LOADING & EMPTY STATES ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
`;

const LoadingSpinner = styled.div`
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 215, 0, 0.2);
    border-top-color: #ffd700;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
    margin-top: 1rem;
    color: #94a3b8;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed rgba(255, 215, 0, 0.4);
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h3`
    color: #ffd700;
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
`;

const EmptyText = styled.p`
    color: #94a3b8;
    margin-bottom: 1.5rem;
`;

const EmptyButton = styled.button`
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: none;
    border-radius: 12px;
    color: #0a0e27;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);
    }
`;

const EndMessage = styled.div`
    text-align: center;
    padding: 2rem;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

// ============ CREATE POST MODAL ============
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 24px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${fadeInScale} 0.3s ease-out;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
`;

const ModalTitle = styled.h2`
    color: #ffd700;
    font-size: 1.25rem;
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 50%;
    color: #ef4444;
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

const ModalBody = styled.div`
    padding: 1.5rem;
`;

const PostTypeSelector = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
`;

const PostTypeChip = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(255, 215, 0, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 20px;
    color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        border-color: rgba(255, 215, 0, 0.5);
        color: #ffd700;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    min-height: 150px;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 16px;
    color: #e0e6ed;
    font-size: 1rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    font-family: inherit;
    transition: all 0.3s ease;

    &:focus {
        border-color: rgba(255, 215, 0, 0.5);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const CharCount = styled.div`
    text-align: right;
    color: ${props => props.$over ? '#ef4444' : '#64748b'};
    font-size: 0.85rem;
    margin-top: 0.5rem;
`;

const AttachmentPreview = styled.div`
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 12px;
`;

const AttachmentHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const AttachmentTitle = styled.div`
    color: #f8fafc;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RemoveAttachment = styled.button`
    background: transparent;
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 0.25rem;

    &:hover {
        opacity: 0.8;
    }
`;

const TradeForm = styled.div`
    display: grid;
    gap: 1rem;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div``;

const FormLabel = styled.label`
    display: block;
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
        border-color: rgba(255, 215, 0, 0.5);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const FormSelect = styled.select`
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 0.95rem;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        border-color: rgba(255, 215, 0, 0.5);
    }

    option {
        background: #1e293b;
    }
`;

const PollForm = styled.div``;

const PollOptionInput = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
`;

const OptionInput = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.3s ease;

    &:focus {
        border-color: rgba(255, 215, 0, 0.5);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const RemoveOptionButton = styled.button`
    width: 40px;
    height: 40px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #ef4444;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
    }
`;

const AddOptionButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: 1px dashed rgba(255, 215, 0, 0.4);
    border-radius: 10px;
    color: #ffd700;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.1);
    }
`;

const ModalFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const FooterActions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const FooterButton = styled.button`
    width: 40px;
    height: 40px;
    background: transparent;
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 10px;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        border-color: rgba(255, 215, 0, 0.4);
        color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
    }
`;

const PostButton = styled.button`
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border: none;
    border-radius: 12px;
    color: #0a0e27;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// ============ REACTIONS DATA ============
const REACTIONS = [
    { emoji: '🚀', name: 'rocket', color: 'rgba(139, 92, 246, 0.3)' },
    { emoji: '🔥', name: 'fire', color: 'rgba(239, 68, 68, 0.3)' },
    { emoji: '💎', name: 'diamond', color: 'rgba(0, 173, 239, 0.3)' },
    { emoji: '🐂', name: 'bull', color: 'rgba(16, 185, 129, 0.3)' },
    { emoji: '🐻', name: 'bear', color: 'rgba(239, 68, 68, 0.3)' },
    { emoji: '💰', name: 'money', color: 'rgba(255, 215, 0, 0.3)' },
];

// ============ MAIN COMPONENT ============
const SocialFeed = () => {
    const { api, isAuthenticated, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    
    // State
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostsCount, setNewPostsCount] = useState(0);
    const [expandedComments, setExpandedComments] = useState({});
    const [activeReactionPicker, setActiveReactionPicker] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    
    // Create post state
    const [postType, setPostType] = useState('text');
    const [postText, setPostText] = useState('');
    const [tradeData, setTradeData] = useState({
        symbol: '',
        direction: 'LONG',
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        pnl: ''
    });
    const [pollData, setPollData] = useState({
        question: '',
        options: ['', '']
    });
    const [commentInputs, setCommentInputs] = useState({});
    
    // Refs
    const observerTarget = useRef(null);
    const feedRef = useRef(null);

    const [trendingTags, setTrendingTags] = useState([]);
const [topTraders, setTopTraders] = useState([]);
const [suggestedUsers, setSuggestedUsers] = useState([]);

    // Fetch feed
    const fetchFeed = useCallback(async (filterType = filter, pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            
            let endpoint = '/feed';
            if (filterType === 'trending' || filterType === 'all') {
                endpoint = '/feed/discover';
            }

            const response = await api.get(`${endpoint}?limit=20&skip=${(pageNum - 1) * 20}`);
            const newPosts = response.data.posts || [];

            if (append) {
                setPosts(prev => [...prev, ...newPosts]);
            } else {
                setPosts(newPosts);
            }

            setHasMore(newPosts.length === 20);
        } catch (error) {
            console.error('Error fetching feed:', error);
            if (!append) setPosts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, filter]);

    // Initial load
    useEffect(() => {
        if (isAuthenticated) {
            fetchFeed(filter, 1, false);
        }
    }, [filter, isAuthenticated, fetchFeed]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1);
                    fetchFeed(filter, page + 1, true);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, page, filter, fetchFeed]);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setNewPostsCount(0);
        fetchFeed(filter, 1, false);
    };


// Fetch sidebar data
useEffect(() => {
    const fetchSidebarData = async () => {
        try {
            // Trending hashtags
            const tagsRes = await api.get('/feed/trending/hashtags?limit=5');
            if (tagsRes.data.hashtags) {
                setTrendingTags(tagsRes.data.hashtags.map(h => ({
                    tag: h.tag,
                    count: h.count > 1000 ? `${(h.count / 1000).toFixed(1)}K` : h.count
                })));
            }

            // Top traders from leaderboard
            const tradersRes = await api.get('/social/leaderboard?sortBy=totalReturnPercent&limit=3');
            if (tradersRes.data) {
                setTopTraders(tradersRes.data.slice(0, 3).map(t => ({
                    id: t.userId,
                    name: t.displayName,
                    avatar: t.avatar,
                    return: `+${t.totalReturn?.toFixed(0) || 0}%`,
                    followers: t.followersCount || 0
                })));
            }

            // Suggested users (people you don't follow)
            const suggestedRes = await api.get('/social/suggested?limit=3');
            if (suggestedRes.data) {
                setSuggestedUsers(suggestedRes.data);
            }
        } catch (error) {
            console.error('Error fetching sidebar data:', error);
        }
    };

    if (isAuthenticated) {
        fetchSidebarData();
    }
}, [api, isAuthenticated]);


    // Handle reaction
    const handleReaction = async (postId, reactionType) => {
        try {
            const response = await api.post(`/feed/${postId}/react`, { type: reactionType });
            
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        reactions: response.data.reactions,
                        userReaction: response.data.userReaction
                    };
                }
                return post;
            }));

            setActiveReactionPicker(null);
        } catch (error) {
            console.error('Error reacting:', error);
            // Fallback to like
            handleLike(postId);
        }
    };

    // Handle like (fallback)
    const handleLike = async (postId) => {
        try {
            const post = posts.find(p => p._id === postId);
            const isLiked = post?.likes?.includes(user?._id);

            if (isLiked) {
                await api.delete(`/feed/${postId}/like`);
            } else {
                await api.post(`/feed/${postId}/like`);
            }

            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const newLikes = isLiked 
                        ? p.likes.filter(id => id !== user._id)
                        : [...(p.likes || []), user._id];
                    return {
                        ...p,
                        likes: newLikes,
                        likesCount: newLikes.length
                    };
                }
                return p;
            }));
        } catch (error) {
            console.error('Error liking:', error);
        }
    };

    // Handle comment
    const handleComment = async (postId) => {
        const text = commentInputs[postId];
        if (!text?.trim()) return;

        try {
            const response = await api.post(`/feed/${postId}/comment`, { text });

            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        comments: [...(post.comments || []), response.data.comment],
                        commentsCount: (post.commentsCount || 0) + 1
                    };
                }
                return post;
            }));

            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            toast.success('Comment posted!');
        } catch (error) {
            console.error('Error commenting:', error);
            toast.error('Failed to post comment');
        }
    };

    // Handle share
    const handleShare = async (postId) => {
        try {
            await api.post(`/feed/${postId}/share`);
            
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        sharesCount: (post.sharesCount || 0) + 1
                    };
                }
                return post;
            }));

            toast.success('Post shared to your profile!');
        } catch (error) {
            // Fallback: copy link
            navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
            toast.success('Link copied to clipboard!');
        }
    };

    // Handle bookmark
    const handleBookmark = async (postId) => {
        try {
            const post = posts.find(p => p._id === postId);
            const isBookmarked = post?.bookmarkedBy?.includes(user?._id);

            if (isBookmarked) {
                await api.delete(`/feed/${postId}/bookmark`);
            } else {
                await api.post(`/feed/${postId}/bookmark`);
            }

            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const newBookmarks = isBookmarked
                        ? (p.bookmarkedBy || []).filter(id => id !== user._id)
                        : [...(p.bookmarkedBy || []), user._id];
                    return {
                        ...p,
                        bookmarkedBy: newBookmarks
                    };
                }
                return p;
            }));

            toast.success(isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks!');
        } catch (error) {
            console.error('Error bookmarking:', error);
        }
    };

    // Handle delete post
    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;

        try {
            await api.delete(`/feed/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success('Post deleted');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete post');
        }
    };

    // Create post
    const handleCreatePost = async () => {
        if (!postText.trim() && postType === 'text') {
            toast.error('Please write something!');
            return;
        }

        try {
            const payload = {
                content: postText,
                type: postType
            };

            if (postType === 'trade') {
                payload.trade = tradeData;
            } else if (postType === 'poll') {
                payload.poll = pollData;
            }

            const response = await api.post('/feed', payload);

            setPosts([response.data.post, ...posts]);
            setShowCreateModal(false);
            setPostText('');
            setPostType('text');
            setTradeData({ symbol: '', direction: 'LONG', entryPrice: '', exitPrice: '', quantity: '', pnl: '' });
            setPollData({ question: '', options: ['', ''] });
            
            toast.success('Post created! 🚀');
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
        }
    };

    // Handle poll vote
    const handlePollVote = async (postId, optionIndex) => {
        try {
            const response = await api.post(`/feed/${postId}/vote`, { optionIndex });
            
            setPosts(posts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        poll: response.data.poll,
                        userVote: optionIndex
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    // Toggle comments
    const toggleComments = (postId) => {
        setExpandedComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // Render post content with mentions and hashtags
    const renderPostContent = (content) => {
        if (!content) return null;

        const parts = content.split(/(\$[A-Z]+|\#\w+|\@\w+)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('$')) {
                return (
                    <TickerMention 
                        key={index} 
                        onClick={() => navigate(`/stock/${part.slice(1)}`)}
                    >
                        {part}
                    </TickerMention>
                );
            }
            if (part.startsWith('#')) {
                return (
                    <Hashtag 
                        key={index}
                        onClick={() => setFilter('trending')}
                    >
                        {part}
                    </Hashtag>
                );
            }
            if (part.startsWith('@')) {
                return (
                    <Mention 
                        key={index}
                        onClick={() => navigate(`/profile/${part.slice(1)}`)}
                    >
                        {part}
                    </Mention>
                );
            }
            return part;
        });
    };

    // Format time ago
    const formatTimeAgo = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffInMinutes = Math.floor((now - postDate) / 60000);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
        if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
        return postDate.toLocaleDateString();
    };

    // Get user initials
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <MainContent>
                {/* LEFT SIDEBAR */}
                <LeftSidebar>
                    {/* Quick Actions */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Zap size={20} />
                            Quick Actions
                        </SidebarTitle>
                        <QuickAction $active={filter === 'all'} onClick={() => setFilter('all')}>
                            <Sparkles size={18} />
                            Discover
                        </QuickAction>
                        <QuickAction $active={filter === 'following'} onClick={() => setFilter('following')}>
                            <Users size={18} />
                            Following
                        </QuickAction>
                        <QuickAction $active={filter === 'trending'} onClick={() => setFilter('trending')}>
                            <Flame size={18} />
                            Trending
                        </QuickAction>
                        <QuickAction onClick={() => navigate('/leaderboard')}>
                            <Trophy size={18} />
                            Leaderboard
                        </QuickAction>
                    </SidebarCard>

                    {/* Trending Tags */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Hash size={20} />
                            Trending
                        </SidebarTitle>
                        {trendingTags.map((item, index) => (
                            <TrendingTag key={index}>
                                <TagName>
                                    <TrendingUp size={14} />
                                    {item.tag}
                                </TagName>
                                <TagCount>{item.count} posts</TagCount>
                            </TrendingTag>
                        ))}
                    </SidebarCard>
                </LeftSidebar>

                {/* CENTER FEED */}
                <FeedContainer ref={feedRef}>
                    {/* Header */}
                    <FeedHeader>
                        <HeaderTop>
                            <FeedTitle>
                                <Sparkles size={28} />
                                Social Feed
                            </FeedTitle>
                            <HeaderActions>
                                {newPostsCount > 0 && (
                                    <NewPostsAlert onClick={handleRefresh}>
                                        <ArrowUp size={16} />
                                        {newPostsCount} new posts
                                    </NewPostsAlert>
                                )}
                                <RefreshButton 
                                    onClick={handleRefresh}
                                    className={refreshing ? 'spinning' : ''}
                                >
                                    <RefreshCw size={20} />
                                </RefreshButton>
                            </HeaderActions>
                        </HeaderTop>
                        <FilterTabs>
                            <FilterTab $active={filter === 'all'} onClick={() => setFilter('all')}>
                                <Sparkles size={16} />
                                Discover
                            </FilterTab>
                            <FilterTab $active={filter === 'following'} onClick={() => setFilter('following')}>
                                <Users size={16} />
                                Following
                            </FilterTab>
                            <FilterTab $active={filter === 'trending'} onClick={() => setFilter('trending')}>
                                <Flame size={16} />
                                Trending
                            </FilterTab>
                        </FilterTabs>
                    </FeedHeader>

                    {/* Create Post Box */}
                    <CreatePostBox>
                        <CreatePostHeader>
                            <UserAvatar $size="48px" $fontSize="1.1rem">
                                {user?.profile?.avatar ? (
                                    <img src={user.profile.avatar} alt={user.name} />
                                ) : (
                                    getInitials(user?.name)
                                )}
                            </UserAvatar>
                            <PostInput onClick={() => setShowCreateModal(true)}>
                                What's on your mind, {user?.name?.split(' ')[0]}?
                            </PostInput>
                        </CreatePostHeader>
                        <PostTypeButtons>
                            <PostTypeButton 
                                $color="#10b981" 
                                $hoverBg="rgba(16, 185, 129, 0.1)"
                                onClick={() => { setPostType('trade'); setShowCreateModal(true); }}
                            >
                                <TrendingUp size={18} />
                                Trade
                            </PostTypeButton>
                            <PostTypeButton 
                                $color="#a78bfa" 
                                $hoverBg="rgba(139, 92, 246, 0.1)"
                                onClick={() => { setPostType('prediction'); setShowCreateModal(true); }}
                            >
                                <Target size={18} />
                                Prediction
                            </PostTypeButton>
                            <PostTypeButton 
                                $color="#00adef" 
                                $hoverBg="rgba(0, 173, 239, 0.1)"
                                onClick={() => { setPostType('poll'); setShowCreateModal(true); }}
                            >
                                <BarChart2 size={18} />
                                Poll
                            </PostTypeButton>
                            <PostTypeButton 
                                $color="#f59e0b" 
                                $hoverBg="rgba(245, 158, 11, 0.1)"
                                onClick={() => { setPostType('image'); setShowCreateModal(true); }}
                            >
                                <Image size={18} />
                                Media
                            </PostTypeButton>
                        </PostTypeButtons>
                    </CreatePostBox>

                    {/* Posts */}
                    {loading && posts.length === 0 ? (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText>Loading your feed...</LoadingText>
                        </LoadingContainer>
                    ) : posts.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon>
                                <MessageCircle size={60} color="#ffd700" />
                            </EmptyIcon>
                            <EmptyTitle>
                                {filter === 'following' ? 'No posts from people you follow' : 'No posts yet'}
                            </EmptyTitle>
                            <EmptyText>
                                {filter === 'following' 
                                    ? 'Follow some traders to see their posts!'
                                    : 'Be the first to share something!'}
                            </EmptyText>
                            <EmptyButton onClick={() => setShowCreateModal(true)}>
                                <Plus size={20} />
                                Create Post
                            </EmptyButton>
                        </EmptyState>
                    ) : (
                        posts.map(post => (
                            <PostCard key={post._id} $isPinned={post.isPinned}>
                                {/* Post Header */}
                                <PostHeader>
                                    <PostAuthor>
                                        <UserAvatar 
                                            $size="44px" 
                                            $fontSize="1rem"
                                            onClick={() => navigate(`/profile/${post.author?.username}`)}
                                        >
                                            {post.author?.avatar ? (
                                                <img src={post.author.avatar} alt={post.author?.displayName} />
                                            ) : (
                                                getInitials(post.author?.displayName)
                                            )}
                                        </UserAvatar>
                                        <AuthorInfo>
                                            <AuthorName onClick={() => navigate(`/profile/${post.author?.username}`)}>
                                                {post.author?.displayName || 'Anonymous'}
                                                {post.author?.verified && (
                                                    <VerifiedBadge>
                                                        <Check size={12} />
                                                    </VerifiedBadge>
                                                )}
                                                {post.author?.level && (
                                                    <LevelBadge>Lv {post.author.level}</LevelBadge>
                                                )}
                                            </AuthorName>
                                            <AuthorMeta>
                                                <Username onClick={() => navigate(`/profile/${post.author?.username}`)}>
                                                    @{post.author?.username}
                                                </Username>
                                                <span>•</span>
                                                <PostTime>
                                                    <Clock size={12} />
                                                    {formatTimeAgo(post.createdAt)}
                                                </PostTime>
                                            </AuthorMeta>
                                        </AuthorInfo>
                                    </PostAuthor>
                                    
                                    <PostMenu>
                                        <MenuButton onClick={() => setActiveMenu(activeMenu === post._id ? null : post._id)}>
                                            <MoreHorizontal size={20} />
                                        </MenuButton>
                                        {activeMenu === post._id && (
                                            <MenuDropdown>
                                                <MenuItem onClick={() => handleBookmark(post._id)}>
                                                    {post.bookmarkedBy?.includes(user?._id) ? (
                                                        <><BookmarkCheck size={16} /> Saved</>
                                                    ) : (
                                                        <><Bookmark size={16} /> Save Post</>
                                                    )}
                                                </MenuItem>
                                                <MenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`)}>
                                                    <Link2 size={16} /> Copy Link
                                                </MenuItem>
                                                {post.author?._id === user?._id && (
                                                    <MenuItem $danger onClick={() => handleDeletePost(post._id)}>
                                                        <Trash2 size={16} /> Delete
                                                    </MenuItem>
                                                )}
                                                {post.author?._id !== user?._id && (
                                                    <MenuItem>
                                                        <Flag size={16} /> Report
                                                    </MenuItem>
                                                )}
                                            </MenuDropdown>
                                        )}
                                    </PostMenu>
                                </PostHeader>

                                {/* Post Content */}
                                <PostContent>
                                    <PostText>{renderPostContent(post.content)}</PostText>

                                    {/* Trade Attachment */}
                                    {post.type === 'trade' && post.trade && (
                                        <TradeAttachment $profitable={parseFloat(post.trade.pnl) >= 0}>
                                            <TradeHeader>
                                                <TradeSymbol>
                                                    <SymbolIcon>{post.trade.symbol?.slice(0, 2)}</SymbolIcon>
                                                    <SymbolInfo>
                                                        <SymbolName>
                                                            ${post.trade.symbol}
                                                            <TradeDirection $type={post.trade.direction}>
                                                                {post.trade.direction}
                                                            </TradeDirection>
                                                        </SymbolName>
                                                        <SymbolCompany>Paper Trade</SymbolCompany>
                                                    </SymbolInfo>
                                                </TradeSymbol>
                                                <TradePnL>
                                                    <PnLValue $positive={parseFloat(post.trade.pnl) >= 0}>
                                                        {parseFloat(post.trade.pnl) >= 0 ? '+' : ''}
                                                        ${Math.abs(parseFloat(post.trade.pnl)).toFixed(2)}
                                                    </PnLValue>
                                                    <PnLPercent $positive={parseFloat(post.trade.pnlPercent) >= 0}>
                                                        {parseFloat(post.trade.pnlPercent) >= 0 ? '+' : ''}
                                                        {post.trade.pnlPercent}%
                                                    </PnLPercent>
                                                </TradePnL>
                                            </TradeHeader>
                                            <TradeDetails>
                                                <TradeDetail>
                                                    <DetailLabel>Entry</DetailLabel>
                                                    <DetailValue>${post.trade.entryPrice}</DetailValue>
                                                </TradeDetail>
                                                <TradeDetail>
                                                    <DetailLabel>Exit</DetailLabel>
                                                    <DetailValue>${post.trade.exitPrice}</DetailValue>
                                                </TradeDetail>
                                                <TradeDetail>
                                                    <DetailLabel>Shares</DetailLabel>
                                                    <DetailValue>{post.trade.quantity}</DetailValue>
                                                </TradeDetail>
                                                <TradeDetail>
                                                    <DetailLabel>Duration</DetailLabel>
                                                    <DetailValue>{post.trade.duration || 'N/A'}</DetailValue>
                                                </TradeDetail>
                                            </TradeDetails>
                                            <CopyTradeButton>
                                                <Copy size={16} />
                                                Copy Trade Setup
                                            </CopyTradeButton>
                                        </TradeAttachment>
                                    )}

                                    {/* Poll Attachment */}
                                    {post.type === 'poll' && post.poll && (
                                        <PollContainer>
                                            <PollQuestion>{post.poll.question}</PollQuestion>
                                            {post.poll.options.map((option, index) => {
                                                const totalVotes = post.poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
                                                const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                                                const hasVoted = post.userVote !== undefined;
                                                
                                                return (
                                                    <PollOption 
                                                        key={index}
                                                        $selected={post.userVote === index}
                                                        $voted={hasVoted}
                                                        onClick={() => !hasVoted && handlePollVote(post._id, index)}
                                                    >
                                                        {hasVoted && <PollProgressBar $percent={percent} />}
                                                        <PollOptionContent>
                                                            <PollOptionText>{option.text}</PollOptionText>
                                                            {hasVoted && <PollOptionPercent>{percent}%</PollOptionPercent>}
                                                        </PollOptionContent>
                                                    </PollOption>
                                                );
                                            })}
                                            <PollStats>
                                                <span>{post.poll.totalVotes || 0} votes</span>
                                                <span>•</span>
                                                <span>{post.poll.endsIn || '24h left'}</span>
                                            </PollStats>
                                        </PollContainer>
                                    )}

                                    {/* Images */}
                                    {post.images?.length > 0 && (
                                        <ImageGrid $count={post.images.length}>
                                            {post.images.map((img, index) => (
                                                <PostImage 
                                                    key={index} 
                                                    src={img} 
                                                    alt=""
                                                    $single={post.images.length === 1}
                                                />
                                            ))}
                                        </ImageGrid>
                                    )}
                                </PostContent>

                                {/* Post Stats */}
                                <PostStats>
                                    <StatsLeft>
                                        <ReactionsList>
                                            {REACTIONS.slice(0, 3).map((reaction, index) => (
                                                <ReactionBubble key={index} $color={reaction.color}>
                                                    {reaction.emoji}
                                                </ReactionBubble>
                                            ))}
                                        </ReactionsList>
                                        <ReactionCount>
                                            {post.likesCount || post.likes?.length || 0} reactions
                                        </ReactionCount>
                                    </StatsLeft>
                                    <StatsRight>
                                        <StatItem onClick={() => toggleComments(post._id)}>
                                            {post.commentsCount || 0} comments
                                        </StatItem>
                                        <StatItem>
                                            {post.sharesCount || 0} shares
                                        </StatItem>
                                    </StatsRight>
                                </PostStats>

                                {/* Post Actions */}
                                <PostActions>
                                    <ActionButton 
                                        $active={post.likes?.includes(user?._id)}
                                        $activeColor="#ef4444"
                                        $hoverBg="rgba(239, 68, 68, 0.1)"
                                        $hoverColor="#ef4444"
                                        onMouseEnter={() => setActiveReactionPicker(post._id)}
                                        onMouseLeave={() => setTimeout(() => setActiveReactionPicker(null), 500)}
                                        onClick={() => handleLike(post._id)}
                                    >
                                        <Heart size={20} fill={post.likes?.includes(user?._id) ? '#ef4444' : 'none'} />
                                        Like
                                        
                                        {activeReactionPicker === post._id && (
                                            <ReactionsPopup 
                                                onMouseEnter={() => setActiveReactionPicker(post._id)}
                                                onMouseLeave={() => setActiveReactionPicker(null)}
                                            >
                                                {REACTIONS.map((reaction, index) => (
                                                    <ReactionButton 
                                                        key={index}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReaction(post._id, reaction.name);
                                                        }}
                                                    >
                                                        {reaction.emoji}
                                                    </ReactionButton>
                                                ))}
                                            </ReactionsPopup>
                                        )}
                                    </ActionButton>
                                    
                                    <ActionButton onClick={() => toggleComments(post._id)}>
                                        <MessageCircle size={20} />
                                        Comment
                                    </ActionButton>
                                    
                                    <ActionButton onClick={() => handleShare(post._id)}>
                                        <Share2 size={20} />
                                        Share
                                    </ActionButton>
                                    
                                    <ActionButton 
                                        $active={post.bookmarkedBy?.includes(user?._id)}
                                        $activeColor="#ffd700"
                                        onClick={() => handleBookmark(post._id)}
                                    >
                                        {post.bookmarkedBy?.includes(user?._id) ? (
                                            <BookmarkCheck size={20} />
                                        ) : (
                                            <Bookmark size={20} />
                                        )}
                                        Save
                                    </ActionButton>
                                </PostActions>

                                {/* Comments Section */}
                                {expandedComments[post._id] && (
                                    <CommentsSection>
                                        {post.comments?.length > 0 && (
                                            <CommentsList>
                                                {post.comments.slice(-5).map((comment, index) => (
                                                    <Comment key={index}>
                                                        <UserAvatar $size="32px" $fontSize="0.8rem">
                                                            {getInitials(comment.author?.displayName)}
                                                        </UserAvatar>
                                                        <CommentContent>
                                                            <CommentBubble>
                                                                <CommentAuthor>
                                                                    {comment.author?.displayName}
                                                                </CommentAuthor>
                                                                <CommentText>{comment.text}</CommentText>
                                                            </CommentBubble>
                                                            <CommentMeta>
                                                                <span>{formatTimeAgo(comment.createdAt)}</span>
                                                                <CommentAction>Like</CommentAction>
                                                                <CommentAction>Reply</CommentAction>
                                                            </CommentMeta>
                                                        </CommentContent>
                                                    </Comment>
                                                ))}
                                            </CommentsList>
                                        )}
                                        <CommentInput>
                                            <UserAvatar $size="36px" $fontSize="0.9rem">
                                                {getInitials(user?.name)}
                                            </UserAvatar>
                                            <CommentTextarea
                                                placeholder="Write a comment..."
                                                value={commentInputs[post._id] || ''}
                                                onChange={(e) => setCommentInputs(prev => ({ 
                                                    ...prev, 
                                                    [post._id]: e.target.value 
                                                }))}
                                                onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                                            />
                                            <SendButton 
                                                onClick={() => handleComment(post._id)}
                                                disabled={!commentInputs[post._id]?.trim()}
                                            >
                                                <Send size={18} />
                                            </SendButton>
                                        </CommentInput>
                                    </CommentsSection>
                                )}
                            </PostCard>
                        ))
                    )}

                    {/* Infinite Scroll Target */}
                    <div ref={observerTarget} style={{ height: '20px' }} />

                    {/* Loading More */}
                    {loading && posts.length > 0 && (
                        <LoadingContainer>
                            <LoadingSpinner />
                        </LoadingContainer>
                    )}

                    {/* End of Feed */}
                    {!hasMore && posts.length > 0 && (
                        <EndMessage>
                            <Sparkles size={20} color="#ffd700" />
                            You've reached the end! 🎉
                        </EndMessage>
                    )}
                </FeedContainer>

                {/* RIGHT SIDEBAR */}
                <RightSidebar>
                    {/* Top Traders */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Trophy size={20} />
                            Top Traders
                        </SidebarTitle>
                        {topTraders.map((trader, index) => (
                            <TopTraderCard key={trader.id}>
                                <TraderRank $rank={index + 1}>{index + 1}</TraderRank>
                                <UserAvatar $size="36px" $fontSize="0.9rem">
                                    {getInitials(trader.name)}
                                </UserAvatar>
                                <TraderInfo>
                                    <TraderName>{trader.name}</TraderName>
                                    <TraderStat>{trader.return} this month</TraderStat>
                                </TraderInfo>
                                <FollowBadge>Follow</FollowBadge>
                            </TopTraderCard>
                        ))}
                    </SidebarCard>

                    {/* Suggested Users */}
                    <SidebarCard>
                        <SidebarTitle>
                            <UserPlus size={20} />
                            Who to Follow
                        </SidebarTitle>
                        {suggestedUsers.map(suggestedUser => (
                            <SuggestedUser key={suggestedUser.id}>
                                <UserAvatar $size="40px" $fontSize="1rem">
                                    {getInitials(suggestedUser.name)}
                                </UserAvatar>
                                <SuggestedInfo>
                                    <SuggestedName>{suggestedUser.name}</SuggestedName>
                                    <SuggestedMutual>{suggestedUser.mutuals} mutual followers</SuggestedMutual>
                                </SuggestedInfo>
                                <FollowBadge>Follow</FollowBadge>
                            </SuggestedUser>
                        ))}
                    </SidebarCard>

                    {/* Live Activity */}
                    <SidebarCard>
                        <SidebarTitle>
                            <Activity size={20} />
                            Live Activity
                        </SidebarTitle>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                            <Zap size={32} color="#ffd700" style={{ marginBottom: '0.5rem' }} />
                            <div>Real-time trading activity coming soon!</div>
                        </div>
                    </SidebarCard>
                </RightSidebar>
            </MainContent>

            {/* CREATE POST MODAL */}
            {showCreateModal && (
                <ModalOverlay onClick={() => setShowCreateModal(false)}>
                    <Modal onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Create Post</ModalTitle>
                            <CloseButton onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>

                        <ModalBody>
                            {/* Post Type Selector */}
                            <PostTypeSelector>
                                <PostTypeChip 
                                    $active={postType === 'text'} 
                                    onClick={() => setPostType('text')}
                                >
                                    <MessageSquare size={16} />
                                    Text
                                </PostTypeChip>
                                <PostTypeChip 
                                    $active={postType === 'trade'} 
                                    onClick={() => setPostType('trade')}
                                >
                                    <TrendingUp size={16} />
                                    Trade
                                </PostTypeChip>
                                <PostTypeChip 
                                    $active={postType === 'poll'} 
                                    onClick={() => setPostType('poll')}
                                >
                                    <BarChart2 size={16} />
                                    Poll
                                </PostTypeChip>
                                <PostTypeChip 
                                    $active={postType === 'image'} 
                                    onClick={() => setPostType('image')}
                                >
                                    <Image size={16} />
                                    Media
                                </PostTypeChip>
                            </PostTypeSelector>

                            {/* Post Text */}
                            <TextArea
                                placeholder={
                                    postType === 'trade' ? "Share your trade story..." :
                                    postType === 'poll' ? "Ask a question..." :
                                    "What's happening in the markets?"
                                }
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                maxLength={1000}
                            />
                            <CharCount $over={postText.length > 1000}>
                                {postText.length}/1000
                            </CharCount>

                            {/* Trade Form */}
                            {postType === 'trade' && (
                                <AttachmentPreview>
                                    <AttachmentHeader>
                                        <AttachmentTitle>
                                            <TrendingUp size={18} color="#10b981" />
                                            Trade Details
                                        </AttachmentTitle>
                                        <RemoveAttachment onClick={() => setPostType('text')}>
                                            <X size={18} />
                                        </RemoveAttachment>
                                    </AttachmentHeader>
                                    <TradeForm>
                                        <FormRow>
                                            <FormGroup>
                                                <FormLabel>Symbol</FormLabel>
                                                <FormInput
                                                    placeholder="e.g. AAPL"
                                                    value={tradeData.symbol}
                                                    onChange={(e) => setTradeData({...tradeData, symbol: e.target.value.toUpperCase()})}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Direction</FormLabel>
                                                <FormSelect
                                                    value={tradeData.direction}
                                                    onChange={(e) => setTradeData({...tradeData, direction: e.target.value})}
                                                >
                                                    <option value="LONG">Long (Buy)</option>
                                                    <option value="SHORT">Short (Sell)</option>
                                                </FormSelect>
                                            </FormGroup>
                                        </FormRow>
                                        <FormRow>
                                            <FormGroup>
                                                <FormLabel>Entry Price</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={tradeData.entryPrice}
                                                    onChange={(e) => setTradeData({...tradeData, entryPrice: e.target.value})}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Exit Price</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={tradeData.exitPrice}
                                                    onChange={(e) => setTradeData({...tradeData, exitPrice: e.target.value})}
                                                />
                                            </FormGroup>
                                        </FormRow>
                                        <FormRow>
                                            <FormGroup>
                                                <FormLabel>Quantity</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0"
                                                    value={tradeData.quantity}
                                                    onChange={(e) => setTradeData({...tradeData, quantity: e.target.value})}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>P&L ($)</FormLabel>
                                                <FormInput
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={tradeData.pnl}
                                                    onChange={(e) => setTradeData({...tradeData, pnl: e.target.value})}
                                                />
                                            </FormGroup>
                                        </FormRow>
                                    </TradeForm>
                                </AttachmentPreview>
                            )}

                            {/* Poll Form */}
                            {postType === 'poll' && (
                                <AttachmentPreview>
                                    <AttachmentHeader>
                                        <AttachmentTitle>
                                            <BarChart2 size={18} color="#00adef" />
                                            Poll Options
                                        </AttachmentTitle>
                                        <RemoveAttachment onClick={() => setPostType('text')}>
                                            <X size={18} />
                                        </RemoveAttachment>
                                    </AttachmentHeader>
                                    <PollForm>
                                        {pollData.options.map((option, index) => (
                                            <PollOptionInput key={index}>
                                                <OptionInput
                                                    placeholder={`Option ${index + 1}`}
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...pollData.options];
                                                        newOptions[index] = e.target.value;
                                                        setPollData({...pollData, options: newOptions});
                                                    }}
                                                />
                                                {pollData.options.length > 2 && (
                                                    <RemoveOptionButton onClick={() => {
                                                        const newOptions = pollData.options.filter((_, i) => i !== index);
                                                        setPollData({...pollData, options: newOptions});
                                                    }}>
                                                        <X size={18} />
                                                    </RemoveOptionButton>
                                                )}
                                            </PollOptionInput>
                                        ))}
                                        {pollData.options.length < 4 && (
                                            <AddOptionButton onClick={() => {
                                                setPollData({...pollData, options: [...pollData.options, '']});
                                            }}>
                                                <Plus size={18} />
                                                Add Option
                                            </AddOptionButton>
                                        )}
                                    </PollForm>
                                </AttachmentPreview>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <FooterActions>
                                <FooterButton>
                                    <Image size={20} />
                                </FooterButton>
                                <FooterButton>
                                    <Smile size={20} />
                                </FooterButton>
                                <FooterButton>
                                    <Hash size={20} />
                                </FooterButton>
                                <FooterButton>
                                    <AtSign size={20} />
                                </FooterButton>
                            </FooterActions>
                            <PostButton 
                                onClick={handleCreatePost}
                                disabled={!postText.trim() && postType === 'text'}
                            >
                                <Send size={18} />
                                Post
                            </PostButton>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default SocialFeed;